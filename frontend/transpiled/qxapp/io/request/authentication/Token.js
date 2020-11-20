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
      "qx.io.request.authentication.IAuthentication": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qxapp - the simcore frontend
  
     https://osparc.io
  
     Copyright:
       2019 IT'IS Foundation, https://itis.swiss
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Ignacio Pascual (ignapas)
  
  ************************************************************************ */
  qx.Class.define("qxapp.io.request.authentication.Token", {
    extend: qx.core.Object,
    implement: qx.io.request.authentication.IAuthentication,
    construct: function construct(token) {
      this.__token = token;
    },
    members: {
      __token: null,
      getAuthHeaders: function getAuthHeaders() {
        return [{
          key: "Authorization",
          value: "Bearer " + this.__token
        }];
      }
    }
  });
  qxapp.io.request.authentication.Token.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Token.js.map?dt=1568886164189