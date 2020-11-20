(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.tabview.Page": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.basic.Label": {
        "construct": true
      },
      "qx.bom.Font": {
        "construct": true
      },
      "qxapp.theme.Font": {
        "construct": true
      },
      "qx.ui.core.Spacer": {
        "construct": true
      },
      "qx.ui.groupbox.GroupBox": {},
      "qxapp.ui.basic.Label": {}
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
  qx.Class.define("qxapp.desktop.preferences.pages.BasePage", {
    extend: qx.ui.tabview.Page,
    construct: function construct(title) {
      var iconSrc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      qx.ui.tabview.Page.constructor.call(this, null, iconSrc);
      this.setLayout(new qx.ui.layout.VBox(10).set({
        spacing: 10,
        alignX: "center"
      })); // Page title

      this.add(new qx.ui.basic.Label(title + " Settings").set({
        font: qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["title-16"])
      })); // spacer

      this.add(new qx.ui.core.Spacer(null, 10)); // TODO add decorator?
    },
    members: {
      /** Common layout of secion's box
       *
       * @param {page section's name} sectionName
       */
      _createSectionBox: function _createSectionBox(sectionName) {
        var box = new qx.ui.groupbox.GroupBox(sectionName);
        box.setLayout(new qx.ui.layout.VBox(10));
        return box;
      },

      /** Common layout for and font for tooltip label
       *
       */
      _createHelpLabel: function _createHelpLabel() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var label = new qxapp.ui.basic.Label(12).set({
          value: message,
          rich: true
        });
        return label;
      }
    }
  });
  qxapp.desktop.preferences.pages.BasePage.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=BasePage.js.map?dt=1568886163393