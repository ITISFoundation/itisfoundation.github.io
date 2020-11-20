(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.auth.core.BaseAuthPage": {
        "require": true
      },
      "qxapp.auth.core.MAuth": {
        "require": true
      },
      "qx.ui.form.Form": {},
      "qx.ui.basic.Atom": {},
      "qx.ui.form.TextField": {},
      "qxapp.utils.Utils": {},
      "qx.util.Validate": {},
      "qx.ui.form.PasswordField": {},
      "qx.ui.form.Button": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.event.Timer": {},
      "qxapp.io.rest.ResourceFactory": {},
      "qxapp.component.message.FlashMessenger": {},
      "qxapp.auth.Manager": {}
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

  /** Login page
   *
   * - Form with fields necessary to login
   * - Form data validation
   * - Adds links to register and reset pages. Transitions are fired as events.
   * - To execute login, it delegates on the auth.manager
   * - Minimal layout and apperance is delegated to the selected theme
   */
  qx.Class.define("qxapp.auth.ui.LoginView", {
    extend: qxapp.auth.core.BaseAuthPage,
    include: [qxapp.auth.core.MAuth],

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      "toRegister": "qx.event.type.Event",
      "toReset": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overrides base
      __form: null,
      _buildPage: function _buildPage() {
        var _this = this;

        this.__form = new qx.ui.form.Form();
        var atm = new qx.ui.basic.Atom().set({
          icon: "qxapp/osparc-white.svg",
          iconPosition: "top"
        });
        atm.getChildControl("icon").set({
          width: 250,
          height: 150,
          scale: true
        });
        this.add(atm);
        var email = new qx.ui.form.TextField().set({
          placeholder: this.tr("Your email address"),
          required: true
        });
        this.add(email);
        email.getContentElement().setAttribute("autocomplete", "username");
        qxapp.utils.Utils.setIdToWidget(email, "loginUserEmailFld");

        this.__form.add(email, "", qx.util.Validate.email(), "email", null);

        this.addListener("appear", function () {
          email.focus();
          email.activate();
        });
        var pass = new qx.ui.form.PasswordField().set({
          placeholder: this.tr("Your password"),
          required: true
        });
        pass.getContentElement().setAttribute("autocomplete", "current-password");
        qxapp.utils.Utils.setIdToWidget(pass, "loginPasswordFld");
        this.add(pass);

        this.__form.add(pass, "", null, "password", null);

        var loginBtn = new qx.ui.form.Button(this.tr("Log In"));
        loginBtn.addListener("execute", function () {
          return _this.__login();
        }, this); // Listen to "Enter" key

        this.addListener("keypress", function (keyEvent) {
          if (keyEvent.getKeyIdentifier() === "Enter") {
            _this.__login();
          }
        }, this);
        qxapp.utils.Utils.setIdToWidget(loginBtn, "loginSubmitBtn");
        this.add(loginBtn); //  create account | forgot password? links

        var grp = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
        var registerBtn = this.createLinkButton(this.tr("Create Account"), function () {
          var interval = 1000;
          var configTimer = new qx.event.Timer(interval);
          var resource = qxapp.io.rest.ResourceFactory.getInstance();
          var registerWithInvitation = resource.registerWithInvitation();
          configTimer.addListener("interval", function () {
            registerWithInvitation = resource.registerWithInvitation();

            if (registerWithInvitation !== null) {
              configTimer.stop();

              if (registerWithInvitation) {
                var text = _this.tr("Registration is currently only available with an invitation.");

                text += "<br>";
                text += _this.tr("Please contact info@itis.swiss");
                qxapp.component.message.FlashMessenger.getInstance().logAs(text, "INFO");
              } else {
                _this.fireEvent("toRegister");
              }
            }
          }, _this);
          configTimer.start();
        }, this);
        qxapp.utils.Utils.setIdToWidget(registerBtn, "loginCreateAccountBtn");
        var forgotBtn = this.createLinkButton(this.tr("Forgot Password?"), function () {
          _this.fireEvent("toReset");
        }, this);
        qxapp.utils.Utils.setIdToWidget(forgotBtn, "loginForgotPasswordBtn");
        [registerBtn, forgotBtn].forEach(function (btn) {
          grp.add(btn.set({
            center: true,
            allowGrowX: true
          }), {
            width: "50%"
          });
        });
        this.add(grp); // TODO: add here loging with NIH and openID
        // this.add(this.__buildExternals());
      },
      __buildExternals: function __buildExternals() {
        var _this2 = this;

        var grp = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        [this.tr("Login with NIH"), this.tr("Login with OpenID")].forEach(function (txt) {
          var btn = _this2.createLinkButton(txt, function () {
            // TODO add here callback
            console.error("Login with external services are still not implemented");
          }, _this2);

          grp.add(btn.set({
            center: true
          }), {
            flex: 1
          });
        });
        return grp;
      },
      __login: function __login() {
        if (!this.__form.validate()) {
          return;
        }

        var email = this.__form.getItems().email;

        var pass = this.__form.getItems().password;

        var manager = qxapp.auth.Manager.getInstance();

        var successFun = function successFun(log) {
          this.fireDataEvent("done", log.message); // we don't need the form any more, so remove it and mock-navigate-away
          // and thus tell the password manager to save the content

          this._formElement.dispose();

          window.history.replaceState(null, window.document.title, window.location.pathname);
        };

        var failFun = function failFun(msg) {
          // TODO: can get field info from response here
          msg = String(msg) || this.tr("Introduced an invalid email or password");
          [email, pass].forEach(function (item) {
            item.set({
              invalidMessage: msg,
              valid: false
            });
          });
          qxapp.component.message.FlashMessenger.getInstance().logAs(msg, "ERROR");
        };

        manager.login(email.getValue(), pass.getValue(), successFun, failFun, this);
      },
      resetValues: function resetValues() {
        var fieldItems = this.__form.getItems();

        for (var key in fieldItems) {
          fieldItems[key].resetValue();
        }
      }
    }
  });
  qxapp.auth.ui.LoginView.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=LoginView.js.map?dt=1568886159742