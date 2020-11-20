(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.io.rest.Resource": {
        "construct": true,
        "require": true
      },
      "qx.io.request.authentication.Basic": {}
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

  /**
   * Base class for RESTful resources
   */
  qx.Class.define("qxapp.io.rest.AbstractResource", {
    extend: qx.io.rest.Resource,
    type: "abstract",
    statics: {
      API: "/v0",
      AUTHENTICATION: null,
      setAutheticationHeader: function setAutheticationHeader(usernameOrToken) {
        var password = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        qxapp.io.rest.AbstractResource.AUTHENTICATION = new qx.io.request.authentication.Basic(usernameOrToken, password);
      }
    },
    construct: function construct(description) {
      qx.io.rest.Resource.constructor.call(this, description);
      this.configureRequest(function (request, action, params, data) {
        var headers = [{
          key: "Accept",
          value: "application/json"
        }];
        var auth = qxapp.io.rest.AbstractResource.AUTHENTICATION;

        if (auth === null) {
          console.debug("Authentication missing");
        } else {
          headers.concat(auth.getAuthHeaders());
        }

        headers.forEach(function (item, index, array) {
          request.setRequestHeader(item.key, item.value);
        });
      });
    },
    members: {
      /**
       * Default implementation
       * Can be overriden in subclass to change prefix
       */
      formatUrl: function formatUrl(tail) {
        return qxapp.io.rest.AbstractResource.API + tail;
      }
    }
  });
  qxapp.io.rest.AbstractResource.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=AbstractResource.js.map?dt=1568886164204