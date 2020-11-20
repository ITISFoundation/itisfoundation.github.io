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
      "qx.util.DynamicScriptLoader": {}
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
  
  ************************************************************************ */

  /**
   * @asset(DOMPurify/purify.min.js)
   */

  /* global DOMPurify */

  /**
   * A qooxdoo wrapper for
   * <a href='https://github.com/benjamine/jsondiffpatch' target='_blank'>JsonDiffPatch</a>
   */
  qx.Class.define("qxapp.wrapper.DOMPurify", {
    extend: qx.core.Object,
    type: "singleton",
    statics: {
      NAME: "DOMPurify",
      VERSION: "2.0.0",
      URL: "https://github.com/cure53/DOMPurify"
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
      __diffPatcher: null,
      init: function init() {
        var _this = this;

        // initialize the script loading
        var purifyPath = "DOMPurify/purify.min.js";
        var dynLoader = new qx.util.DynamicScriptLoader([purifyPath]);
        dynLoader.addListenerOnce("ready", function (e) {
          console.log(purifyPath + " loaded");

          _this.setLibReady(true);
        }, this);
        dynLoader.addListener("failed", function (e) {
          var data = e.getData();
          console.error("failed to load " + data.script);
        }, this);
        dynLoader.start();
      },
      sanitize: function sanitize(html) {
        return DOMPurify.sanitize(html);
      }
    }
  });
  qxapp.wrapper.DOMPurify.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=DOMPurify.js.map?dt=1568886166749