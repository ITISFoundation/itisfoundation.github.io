(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.Window": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qxapp.utils.Utils": {
        "construct": true
      },
      "qx.ui.tabview.TabView": {
        "construct": true
      },
      "qxapp.desktop.preferences.pages.ProfilePage": {
        "construct": true
      },
      "qxapp.desktop.preferences.pages.SecurityPage": {
        "construct": true
      },
      "qxapp.desktop.preferences.pages.ExperimentalPage": {
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

  /** Application's preferences
   *
   *  - multi-page modal window
   *
  */
  qx.Class.define("qxapp.desktop.preferences.Preferences", {
    extend: qx.ui.window.Window,
    construct: function construct() {
      qx.ui.window.Window.constructor.call(this, this.tr("Preferences"));
      this.set({
        layout: new qx.ui.layout.VBox(10),
        modal: true,
        width: 500,
        height: 600,
        showClose: true,
        showMaximize: false,
        showMinimize: false,
        resizable: false
      });
      var closeBtn = this.getChildControl("close-button");
      qxapp.utils.Utils.setIdToWidget(closeBtn, "preferencesWindowCloseBtn");
      var tabView = new qx.ui.tabview.TabView().set({
        barPosition: "left"
      });
      var profPage = new qxapp.desktop.preferences.pages.ProfilePage();
      var profBtn = profPage.getChildControl("button");
      qxapp.utils.Utils.setIdToWidget(profBtn, "preferencesProfileTabBtn");
      tabView.add(profPage);
      var secPage = new qxapp.desktop.preferences.pages.SecurityPage();
      var secBtn = secPage.getChildControl("button");
      qxapp.utils.Utils.setIdToWidget(secBtn, "preferencesSecurityTabBtn");
      tabView.add(secPage);
      var expPage = new qxapp.desktop.preferences.pages.ExperimentalPage();
      var expBtn = expPage.getChildControl("button");
      qxapp.utils.Utils.setIdToWidget(expBtn, "preferencesExperimentalTabBtn");
      tabView.add(expPage);
      this.add(tabView, {
        flex: 1
      });
    }
  });
  qxapp.desktop.preferences.Preferences.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Preferences.js.map?dt=1568886163318