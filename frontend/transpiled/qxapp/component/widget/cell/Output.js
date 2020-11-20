(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);
  qx.Class.define("qxapp.component.widget.cell.Output", {
    extend: qx.ui.core.Widget,
    construct: function construct(cellData) {
      qx.ui.core.Widget.constructor.call(this);
      this.setHandler(cellData);
    },
    properties: {
      handler: {
        check: "qxapp.component.widget.cell.Handler",
        nullable: false
      }
    },
    members: {
      getTitle: function getTitle() {
        return this.getHandler().getTitle();
      },
      getOutput: function getOutput() {
        return this.getHandler().getOutput();
      }
    }
  });
  qxapp.component.widget.cell.Output.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Output.js.map?dt=1568886161512