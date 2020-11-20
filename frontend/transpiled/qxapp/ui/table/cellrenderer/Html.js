(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.cellrenderer.Html": {
        "construct": true,
        "require": true
      }
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
   * Html cell renderer that does not override the cell styles.
   */
  qx.Class.define("qxapp.ui.table.cellrenderer.Html", {
    extend: qx.ui.table.cellrenderer.Html,
    construct: function construct() {
      qx.ui.table.cellrenderer.Html.constructor.call(this);
    },
    members: {
      // Override
      _getCellStyle: function _getCellStyle(cellInfo) {
        var baseStyle = qxapp.ui.table.cellrenderer.Html.prototype._getCellStyle.base.call(this, cellInfo) || "";
        var cellStyle = cellInfo.style || "";
        return baseStyle + cellStyle;
      }
    }
  });
  qxapp.ui.table.cellrenderer.Html.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Html.js.map?dt=1568886164741