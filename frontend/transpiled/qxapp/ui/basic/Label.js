(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Label": {
        "construct": true,
        "require": true
      },
      "qx.bom.Font": {},
      "qxapp.theme.Font": {}
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
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * Label with qxapp.theme.Font.fonts font set
   */
  qx.Class.define("qxapp.ui.basic.Label", {
    extend: qx.ui.basic.Label,

    /**
     * @param size {Number} Size of the Label
     * @param bold {Boolean} True if bold
     */
    construct: function construct(size, bold) {
      qx.ui.basic.Label.constructor.call(this);
      this.set({
        font: qxapp.ui.basic.Label.getFont(size, bold)
      });
    },
    statics: {
      getFont: function getFont() {
        var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 14;
        var bold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (bold) {
          return qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["title-" + size]);
        }

        return qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["text-" + size]);
      }
    }
  });
  qxapp.ui.basic.Label.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Label.js.map?dt=1568886164630