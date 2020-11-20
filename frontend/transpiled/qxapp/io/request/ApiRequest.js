(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.io.request.Xhr": {
        "construct": true,
        "require": true
      },
      "qxapp.io.rest.AbstractResource": {
        "construct": true
      }
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
   * HTTP requests to simcore's rest API
   */
  qx.Class.define("qxapp.io.request.ApiRequest", {
    extend: qx.io.request.Xhr,
    construct: function construct(url, method) {
      var baseURL = qxapp.io.rest.AbstractResource.API;
      qx.io.request.Xhr.constructor.call(this, baseURL + url, method);
      this.set({
        accept: "application/json"
      });
      this.setRequestHeader("Content-Type", "application/json");
    }
  });
  qxapp.io.request.ApiRequest.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ApiRequest.js.map?dt=1568886164179