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
   * @asset(jsondiffpatch/jsondiffpatch.*js)
   * @ignore(jsondiffpatch)
   */

  /* global jsondiffpatch */

  /**
   * A qooxdoo wrapper for
   * <a href='https://github.com/benjamine/jsondiffpatch' target='_blank'>JsonDiffPatch</a>
   */
  qx.Class.define("qxapp.wrapper.JsonDiffPatch", {
    extend: qx.core.Object,
    type: "singleton",
    statics: {
      NAME: "jsondiffpatch",
      VERSION: "0.3.11",
      URL: "https://github.com/benjamine/jsondiffpatch"
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
        var jsondiffpatchPath = "jsondiffpatch/jsondiffpatch.min.js";
        var dynLoader = new qx.util.DynamicScriptLoader([jsondiffpatchPath]);
        dynLoader.addListenerOnce("ready", function (e) {
          console.log(jsondiffpatchPath + " loaded");
          _this.__diffPatcher = jsondiffpatch.create();

          _this.setLibReady(true);
        }, this);
        dynLoader.addListener("failed", function (e) {
          var data = e.getData();
          console.error("failed to load " + data.script);
        }, this);
        dynLoader.start();
      },
      diff: function diff(obj1, obj2) {
        // https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
        var delta = this.__diffPatcher.diff(obj1, obj2);

        return delta;
      },
      patch: function patch(obj, delta) {
        this.__diffPatcher.patch(obj, delta);

        return obj;
      },
      // deep clone
      clone: function clone(obj) {
        return this.__diffPatcher.clone(obj);
      }
    }
  });
  qxapp.wrapper.JsonDiffPatch.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=JsonDiffPatch.js.map?dt=1568886166794