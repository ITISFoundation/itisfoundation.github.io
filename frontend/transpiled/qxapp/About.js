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
      "qxapp.utils.LibVersions": {},
      "qx.ui.core.Spacer": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qxapp.ui.basic.LinkLabel": {},
      "qx.ui.basic.Label": {},
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
       * Odei Maiz (odeimaiz)
       * Pedro Crespo (pcrespov)
  
  ************************************************************************ */
  qx.Class.define("qxapp.About", {
    extend: qx.ui.window.Window,
    type: "singleton",
    construct: function construct() {
      qx.ui.window.Window.constructor.call(this, this.tr("About"));
      this.set({
        layout: new qx.ui.layout.VBox(),
        contentPadding: 20,
        showMaximize: false,
        showMinimize: false,
        resizable: false,
        centerOnAppear: true
      });
      var closeBtn = this.getChildControl("close-button");
      qxapp.utils.Utils.setIdToWidget(closeBtn, "aboutWindowCloseBtn");

      this.__populateEntries();
    },
    members: {
      __populateEntries: function __populateEntries() {
        var platformVersion = qxapp.utils.LibVersions.getPlatformVersion();

        this.__createEntries([platformVersion]);

        var uiVersion = qxapp.utils.LibVersions.getUIVersion();

        this.__createEntries([uiVersion]);

        this.add(new qx.ui.core.Spacer(null, 10));
        var qxCompiler = qxapp.utils.LibVersions.getQxCompiler();

        this.__createEntries([qxCompiler]);

        var libsInfo = qxapp.utils.LibVersions.getQxLibraryInfoMap();

        this.__createEntries(libsInfo);

        this.add(new qx.ui.core.Spacer(null, 10));
        var libs = qxapp.utils.LibVersions.get3rdPartyLibs();

        this.__createEntries(libs);
      },
      __createEntries: function __createEntries(libs) {
        for (var i = 0; i < libs.length; i++) {
          var lib = libs[i];
          this.add(this.__createEntry(lib.name, lib.version, lib.url));
        }
      },
      __createEntry: function __createEntry() {
        var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "unknown-library";
        var vers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "unknown-version";
        var url = arguments.length > 2 ? arguments[2] : undefined;
        var entryLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(10)).set({
          marginBottom: 4
        });
        var entryLabel = null;

        if (url) {
          entryLabel = new qxapp.ui.basic.LinkLabel(item, url);
        } else {
          entryLabel = new qx.ui.basic.Label(item);
        }

        entryLayout.set({
          font: qxapp.ui.basic.Label.getFont(14, true)
        });
        entryLayout.add(entryLabel);
        var entryVersion = new qxapp.ui.basic.Label(14).set({
          value: vers
        });
        entryLayout.add(entryVersion);
        return entryLayout;
      }
    }
  });
  qxapp.About.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=About.js.map?dt=1568886159470