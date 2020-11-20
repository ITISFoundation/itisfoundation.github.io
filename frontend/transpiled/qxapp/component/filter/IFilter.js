(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
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

  /**
   * Defines the methods all UIFilter elements should implement.
   */
  qx.Interface.define("qxapp.component.filter.IFilter", {
    members: {
      /**
       * Function in charge of resetting the filter.
       */
      reset: function reset() {
        this.assertArgumentsCount(arguments, 0, 0);
      }
    }
  });
  qxapp.component.filter.IFilter.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=IFilter.js.map?dt=1568886159877