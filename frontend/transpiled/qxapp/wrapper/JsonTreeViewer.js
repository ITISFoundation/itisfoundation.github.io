(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.util.ResourceManager": {},
      "qx.module.Css": {},
      "qx.util.DynamicScriptLoader": {}
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

  /* global jsonTree */

  /**
   * @asset(jsontreeviewer/jsonTree.*)
   * @asset(jsontreeviewer/icons.svg)
   * @ignore(jsonTree)
   */

  /**
   * A qooxdoo wrapper for
   * <a href='https://github.com/summerstyle/jsonTreeViewer' target='_blank'>JsonTreeViewer</a>
   */
  qx.Class.define("qxapp.wrapper.JsonTreeViewer", {
    extend: qx.core.Object,
    type: "singleton",
    statics: {
      NAME: "jsonTreeViewer",
      VERSION: "0.6.0",
      URL: "https://github.com/summerstyle/jsonTreeViewer"
    },
    construct: function construct() {
      qx.core.Object.constructor.call(this);
    },
    properties: {
      libReady: {
        nullable: false,
        init: false,
        check: "Boolean"
      }
    },
    members: {
      init: function init() {
        var _this = this;

        // initialize the script loading
        var jsonTreeViewerPath = "jsontreeviewer/jsonTree.js";
        var jsonTreeViewerCss = "jsontreeviewer/jsonTree.css";
        var jsonTreeViewerCssUri = qx.util.ResourceManager.getInstance().toUri(jsonTreeViewerCss);
        qx.module.Css.includeStylesheet(jsonTreeViewerCssUri);
        var dynLoader = new qx.util.DynamicScriptLoader([jsonTreeViewerPath]);
        dynLoader.addListenerOnce("ready", function (e) {
          console.log(jsonTreeViewerPath + " loaded");

          _this.setLibReady(true);
        }, this);
        dynLoader.addListener("failed", function (e) {
          var data = e.getData();
          console.error("failed to load " + data.script);
        }, this);
        dynLoader.start();
      },
      print: function print(data, wrapper) {
        jsonTree.create(data, wrapper); // tree.expand();
      }
    }
  });
  qxapp.wrapper.JsonTreeViewer.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=JsonTreeViewer.js.map?dt=1568886166805