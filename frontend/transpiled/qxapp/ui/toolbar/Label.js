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
   * SelectBox with its padding and margins adapted to be show inside a qx.ui.toolbar.ToolBar.
   */
  qx.Class.define("qxapp.ui.toolbar.Label", {
    extend: qx.ui.basic.Label,
    construct: function construct(value) {
      qx.ui.basic.Label.constructor.call(this, value);
    },
    properties: {
      appearance: {
        refine: true,
        init: "toolbar-label"
      }
    },
    members: {
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qxapp.ui.toolbar.Label.prototype._applyVisibility.base.call(this, value, old); // trigger a appearance recalculation of the parent


        var parent = this.getLayoutParent();

        if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
          qx.ui.core.queue.Appearance.add(parent);
        }
      }
    }
  });
  qxapp.ui.toolbar.Label.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Label.js.map?dt=1568886164749