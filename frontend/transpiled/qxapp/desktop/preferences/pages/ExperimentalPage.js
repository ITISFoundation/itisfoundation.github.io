(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.desktop.preferences.pages.BasePage": {
        "construct": true,
        "require": true
      },
      "qxapp.ui.form.LinkButton": {},
      "qx.ui.form.SelectBox": {},
      "qx.theme.manager.Meta": {},
      "qx.Theme": {},
      "qx.ui.form.ListItem": {}
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
   * Experimental Misc in preferences dialog
   *
   *
   */
  qx.Class.define("qxapp.desktop.preferences.pages.ExperimentalPage", {
    extend: qxapp.desktop.preferences.pages.BasePage,
    construct: function construct() {
      var iconSrc = "@FontAwesome5Solid/flask/24";
      var title = this.tr("Experimental");
      qxapp.desktop.preferences.pages.BasePage.constructor.call(this, title, iconSrc);
      this.add(this.__createThemesSelector());
    },
    members: {
      __createThemesSelector: function __createThemesSelector() {
        // layout
        var box = this._createSectionBox("UI Theme");

        var label = this._createHelpLabel(this.tr("This is a list of experimental themes for the UI. By default the \
         osparc-theme is selected"));

        box.add(label);
        var linkBtn = new qxapp.ui.form.LinkButton(this.tr("To qx-osparc-theme"), "https://github.com/ITISFoundation/qx-osparc-theme");
        box.add(linkBtn);
        var select = new qx.ui.form.SelectBox("Theme");
        box.add(select); // fill w/ themes

        var themeMgr = qx.theme.manager.Meta.getInstance();
        var currentTheme = themeMgr.getTheme();
        var themes = qx.Theme.getAll();

        for (var key in themes) {
          var theme = themes[key];

          if (theme.type === "meta") {
            var item = new qx.ui.form.ListItem(theme.name);
            item.setUserData("theme", theme.name);
            select.add(item);

            if (theme.name == currentTheme.name) {
              select.setSelection([item]);
            }
          }
        }

        select.addListener("changeSelection", function (evt) {
          var selected = evt.getData()[0].getUserData("theme");
          var theme = qx.Theme.getByName(selected);

          if (theme) {
            themeMgr.setTheme(theme);
          }
        });
        return box;
      }
    }
  });
  qxapp.desktop.preferences.pages.ExperimentalPage.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ExperimentalPage.js.map?dt=1568886163408