(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.indicator.ProgressBar": {
        "construct": true,
        "require": true
      },
      "qx.ui.toolbar.PartContainer": {},
      "qx.ui.core.queue.Appearance": {}
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
   * ProgressBar with its padding and margins adapted to be show inside a qx.ui.toolbar.ToolBar.
   */
  qx.Class.define("qxapp.ui.toolbar.ProgressBar", {
    extend: qx.ui.indicator.ProgressBar,
    construct: function construct() {
      qx.ui.indicator.ProgressBar.constructor.call(this);
    },
    properties: {
      appearance: {
        refine: true,
        init: "toolbar-progressbar"
      }
    },
    members: {
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qxapp.ui.toolbar.ProgressBar.prototype._applyVisibility.base.call(this, value, old); // trigger a appearance recalculation of the parent


        var parent = this.getLayoutParent();

        if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
          qx.ui.core.queue.Appearance.add(parent);
        }
      }
    }
  });
  qxapp.ui.toolbar.ProgressBar.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ProgressBar.js.map?dt=1568886164756