(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Image": {
        "construct": true,
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
   * Small and simple icon button to trigger different actions on tap.
   */
  qx.Class.define("qxapp.component.form.IconButton", {
    extend: qx.ui.basic.Image,

    /**
     * Constructor for IconButton. It takes the icon id that will be converted into a button and a callback function
     * that will be executed whenever the button is clicked.
     *
     * @param {String} icon Clickable icon to display.
     * @param {function} cb Callback function to be executed on tap.
     * @param {object} context Execution context (this) of the callback function.
     */
    construct: function construct(icon, cb, context) {
      qx.ui.basic.Image.constructor.call(this, icon);

      if (cb) {
        this.addListener("tap", cb, context);
      }

      this.setCursor("pointer");
    }
  });
  qxapp.component.form.IconButton.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=IconButton.js.map?dt=1568886160268