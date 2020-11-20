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
  qx.Class.define("qxapp.io.rest.Resource", {
    extend: qx.io.rest.Resource,
    statics: {
      AUTHENTICATION: null,
      setAutheticationHeader: function setAutheticationHeader(usernameOrToken) {
        var password = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        qxapp.io.rest.Resource.AUTHENTICATION = new qx.io.request.authentication.Basic(usernameOrToken, password);
      }
    },
    construct: function construct(description) {
      qx.io.rest.Resource.constructor.call(this, description);
      this.configureRequest(function (request, action, params, data) {
        var headers = [{
          key: "Accept",
          value: "application/json"
        }];

        if (this.AUTHENTICATION !== undefined && this.AUTHENTICATION !== null) {
          headers.concat(this.AUTHENTICATION.getAuthHeaders());
        }

        headers.forEach(function (item, index, array) {
          request.setRequestHeader(item.key, item.value);
        });
        request.setRequestHeader("Content-Type", "application/json");
      });
    }
  });
  qxapp.io.rest.Resource.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Resource.js.map?dt=1568886164213