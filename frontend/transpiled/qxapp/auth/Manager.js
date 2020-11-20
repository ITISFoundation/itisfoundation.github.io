(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qxapp.auth.Data": {},
      "qxapp.io.request.authentication.Token": {},
      "qxapp.io.request.ApiRequest": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qxapp - the simcore frontend
  
     https://osparc.io
  
     Copyright:
       2018 IT'IS Foundation, https://itis.swiss
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Pedro Crespo (pcrespov)
  
  ************************************************************************ */

  /** Authentication Manager
   *
   *  - Entrypoint to perform authentication requests with backend
   *  - Keeps state of current application
   *  - Keeps authentication header for future requests to the backend
  */
  qx.Class.define("qxapp.auth.Manager", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      "logout": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      isLoggedIn: function isLoggedIn() {
        // TODO: how to store this localy?? See http://www.qooxdoo.org/devel/pages/data_binding/stores.html#offline-store
        // TODO: check if expired??
        // TODO: request server if token is still valid (e.g. expired, etc)
        var auth = qxapp.auth.Data.getInstance().getAuth();
        return auth !== null && auth instanceof qxapp.io.request.authentication.Token;
      },

      /**
       * Function that checks if there is a token and validates it aginst the server. It executes a callback depending on the result.
       *
       * @param {Function} successCb Callback function to be called if the token validation succeeds.
       * @param {Function} errorCb Callback function to be called if the token validation fails or some other error occurs.
       * @param {Object} ctx Context that will be used inside the callback functions (this).
       */
      validateToken: function validateToken(successCb, errorCb, ctx) {
        var _this = this;

        if (qxapp.auth.Data.getInstance().isLogout()) {
          errorCb.call(ctx);
        } else {
          var request = new qxapp.io.request.ApiRequest("/me", "GET");
          request.addListener("success", function (e) {
            if (e.getTarget().getResponse().error) {
              errorCb.call(ctx);
            } else {
              _this.__loginUser(e.getTarget().getResponse().data.login);

              successCb.call(ctx, e.getTarget().getResponse().data);
            }
          });
          request.addListener("statusError", function (e) {
            errorCb.call(ctx);
          });
          request.send();
        }
      },
      login: function login(email, password, successCbk, failCbk, context) {
        var _this2 = this;

        // TODO: consider qx.promise instead of having two callbacks an d a context might be nicer to work with
        var request = new qxapp.io.request.ApiRequest("/auth/login", "POST");
        request.set({
          requestData: {
            email: email,
            password: password
          }
        });
        request.addListener("success", function (e) {
          var _e$getTarget$getRespo = e.getTarget().getResponse(),
              data = _e$getTarget$getRespo.data; // TODO: validate data against specs???
          // TODO: activate tokens!?


          _this2.__loginUser(email);

          successCbk.call(context, data);
        }, this);

        this.__bindDefaultFailCallback(request, failCbk, context);

        request.send();
      },
      logout: function logout() {
        var request = new qxapp.io.request.ApiRequest("/auth/logout", "GET");
        request.send();

        this.__logoutUser();

        this.fireEvent("logout");
      },
      register: function register(userData, successCbk, failCbk, context) {
        console.debug("Registering user ..."); // api/specs/webserver/v0/openapi-auth.yaml

        var request = new qxapp.io.request.ApiRequest("/auth/register", "POST");
        request.set({
          requestData: userData
        });

        this.__bindDefaultSuccessCallback(request, successCbk, context);

        this.__bindDefaultFailCallback(request, failCbk, context);

        request.send();
      },
      resetPasswordRequest: function resetPasswordRequest(email, successCbk, failCbk, context) {
        console.debug("Requesting reset password ..."); // api/specs/webserver/v0/openapi-auth.yaml

        var request = new qxapp.io.request.ApiRequest("/auth/reset-password", "POST");
        request.set({
          requestData: {
            "email": email
          }
        });

        this.__bindDefaultSuccessCallback(request, successCbk, context);

        this.__bindDefaultFailCallback(request, failCbk, context);

        request.send();
      },
      resetPassword: function resetPassword(newPassword, confirmation, code, successCbk, failCbk, context) {
        console.debug("Reseting password ..."); // api/specs/webserver/v0/openapi-auth.yaml

        var request = new qxapp.io.request.ApiRequest("/auth/reset-password/" + encodeURIComponent(code), "POST");
        request.setRequestData({
          password: newPassword,
          confirm: confirmation
        });

        this.__bindDefaultSuccessCallback(request, successCbk, context);

        this.__bindDefaultFailCallback(request, failCbk, context);

        request.send();
      },
      evalPasswordStrength: function evalPasswordStrength(password, callback) {
        var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var request = new qxapp.io.request.ApiRequest("/auth/check-password/" + encodeURIComponent(password), "GET");
        request.addListener("success", function (evt) {
          var payload = evt.getTarget().getResponse();
          callback.call(context, payload.strength, payload.rating, payload.improvements);
        }, this);
        request.send();
      },
      __loginUser: function __loginUser(email) {
        qxapp.auth.Data.getInstance().setEmail(email);
        qxapp.auth.Data.getInstance().setToken(email);
      },
      __logoutUser: function __logoutUser() {
        qxapp.auth.Data.getInstance().resetEmail();
        qxapp.auth.Data.getInstance().resetToken();
      },
      __bindDefaultSuccessCallback: function __bindDefaultSuccessCallback(request, successCbk, context) {
        request.addListener("success", function (e) {
          var _e$getTarget$getRespo2 = e.getTarget().getResponse(),
              data = _e$getTarget$getRespo2.data; // TODO: validate data against specs???
          // FIXME: Data is an object


          successCbk.call(context, data);
        }, this);
      },
      __bindDefaultFailCallback: function __bindDefaultFailCallback(request, failCbk, context) {
        request.addListener("fail", function (e) {
          var _e$getTarget$getRespo3 = e.getTarget().getResponse(),
              error = _e$getTarget$getRespo3.error;

          var msg = "";

          if (error) {
            for (var i = 0; i < error.errors.length; i++) {
              msg = msg + error.errors[i].message + " ";
            }
          } // FIXME: Data is an object


          failCbk.call(context, msg);
        }, this);
      }
    }
  });
  qxapp.auth.Manager.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Manager.js.map?dt=1568886159613