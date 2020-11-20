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
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.form.Button": {},
      "qx.ui.core.Spacer": {},
      "qx.ui.basic.Label": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);
  qx.Class.define("qxapp.component.widget.cell.Editor", {
    extend: qx.ui.core.Widget,
    construct: function construct(cellData) {
      qx.ui.core.Widget.constructor.call(this);
      this.setHandler(cellData);

      this._setLayout(new qx.ui.layout.VBox(10));

      var controls = this._createChildControlImpl("controls");

      this._add(controls);

      this._add(cellData.getNode().getIFrame(), {
        flex: 1
      });
    },
    properties: {
      handler: {
        check: "qxapp.component.widget.cell.Handler",
        nullable: false
      }
    },
    events: {
      "backToGrid": "qx.event.type.Event"
    },
    members: {
      _createChildControlImpl: function _createChildControlImpl(id) {
        var _this = this;

        var control;

        switch (id) {
          case "controls":
            {
              control = new qx.ui.container.Composite(new qx.ui.layout.HBox());
              var back = new qx.ui.form.Button(this.tr("Back to grid"));
              back.addListener("execute", function (e) {
                _this.fireEvent("backToGrid");
              }, this);
              control.add(back);
              control.add(new qx.ui.core.Spacer(100, null));
              var titleField = new qx.ui.basic.Label().set({
                alignY: "middle",
                minWidth: 200
              });
              this.getHandler().getNode().bind("label", titleField, "value");
              control.add(titleField);
              break;
            }
        }

        return control || qxapp.component.widget.cell.Editor.prototype._createChildControlImpl.base.call(this, id);
      }
    }
  });
  qxapp.component.widget.cell.Editor.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Editor.js.map?dt=1568886161488