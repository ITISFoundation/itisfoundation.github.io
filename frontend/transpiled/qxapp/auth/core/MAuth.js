(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.ui.form.LinkButton": {}
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
   * Helpers to build Auth Pages (temporary)
  */
  qx.Mixin.define("qxapp.auth.core.MAuth", {
    members: {
      /**
       * Create link button
       * TODO: create its own widget under qxapp.core.ui.LinkButton (extend Button with different apperance)
       */
      createLinkButton: function createLinkButton(txt, cbk, ctx) {
        var _this = this;

        var atm = new qxapp.ui.form.LinkButton(txt).set({
          appearance: "link-button"
        });
        atm.addListener("execute", function () {
          return cbk.call(_this);
        }, ctx);
        return atm;
      }
    }
  });
  qxapp.auth.core.MAuth.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=MAuth.js.map?dt=1568886159650