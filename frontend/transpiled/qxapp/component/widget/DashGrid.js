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
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.container.Stack": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.core.Spacer": {
        "construct": true
      },
      "qx.ui.form.Button": {
        "construct": true
      },
      "qxapp.wrapper.Gridster": {
        "construct": true
      },
      "qxapp.component.widget.cell.Handler": {},
      "qxapp.component.widget.cell.Editor": {},
      "qxapp.component.widget.cell.Output": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);
  qx.Class.define("qxapp.component.widget.DashGrid", {
    extend: qx.ui.core.Widget,
    construct: function construct(containerNode) {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Canvas());

      this.setContainerNode(containerNode);
      this.__cellEditors = {};
      this.__outputs = {};
      var stack = this.__stack = new qx.ui.container.Stack();
      var gridView = this.__gridView = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      stack.add(gridView);
      var controls = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      controls.add(new qx.ui.core.Spacer(), {
        flex: 1
      });
      var addBtn = new qx.ui.form.Button(this.tr("Add plot")).set({
        height: 25,
        width: 300
      });
      addBtn.addListener("execute", function (e) {
        _this.addClonedNode();
      }, this);
      controls.add(addBtn);
      controls.add(new qx.ui.core.Spacer(), {
        flex: 1
      });
      gridView.add(controls);
      var dashboradLayout = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      var gridster = this.__gridterWr = new qxapp.wrapper.Gridster();
      gridster.addListener("gridsterLibReady", function (e) {
        var ready = e.getData();

        if (ready) {
          var values = Object.values(containerNode.getInnerNodes());

          for (var _i = 0, _values = values; _i < _values.length; _i++) {
            var value = _values[_i];

            _this.addNode(value);
          }
        }
      }, this);
      gridster.addListener("widgetSelected", function (e) {
        var uuid = e.getData();

        if (Object.prototype.hasOwnProperty.call(_this.__cellEditors, uuid)) {
          var cellEditor = _this.__cellEditors[uuid];

          _this.__stack.add(cellEditor);

          _this.__stack.setSelection([cellEditor]);
        }
      }, this);
      dashboradLayout.add(gridster, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      });
      gridView.add(dashboradLayout, {
        flex: 1
      });

      this._add(stack, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      });
    },
    events: {
      "widgetSelected": "qx.event.type.Data"
    },
    properties: {
      containerNode: {
        check: "qxapp.data.model.Node",
        nullable: true
      }
    },
    members: {
      __stack: null,
      __gridView: null,
      __cellEditors: null,
      __gridterWr: null,
      addNode: function addNode(node) {
        var parentNode = this.getContainerNode();

        if (parentNode) {
          var workbench = parentNode.getWorkbench();
          workbench.addNode(node, parentNode);
          var success = this.addWidget(node);

          if (!success) {
            workbench.removeNode(node.getNodeId());
          }
        }
      },
      addClonedNode: function addClonedNode() {
        var parentNode = this.getContainerNode();

        if (parentNode) {
          var workbench = parentNode.getWorkbench();
          var innerNodes = Object.values(parentNode.getInnerNodes());

          if (innerNodes.length > 0) {
            var node = workbench.cloneNode(innerNodes[0]);
            var success = this.addWidget(node);

            if (!success) {
              workbench.removeNode(node.getNodeId());
            }
          }
        }
      },
      addWidget: function addWidget(node) {
        var _this2 = this;

        var cellHandler = new qxapp.component.widget.cell.Handler(node);
        var cellEditor = new qxapp.component.widget.cell.Editor(cellHandler);
        cellEditor.addListener("backToGrid", function () {
          cellHandler.retrieveOutput();

          _this2.__stack.setSelection([_this2.__gridView]);
        }, this);
        this.__cellEditors[cellHandler.getUuid()] = cellEditor;
        var cellOutput = new qxapp.component.widget.cell.Output(cellHandler);

        var htmlElement = this.__gridterWr.addWidget(cellOutput);

        if (htmlElement) {
          // this.__outputs[cellHandler.getUuid()] = htmlElement;
          node.addListener("changeLabel", function (e) {
            _this2.__gridterWr.rebuildWidget(cellOutput, htmlElement);
          }, this);
          cellHandler.addListener("outputUpdated", function () {
            _this2.__gridterWr.rebuildWidget(cellOutput, htmlElement);

            var parentNode = _this2.getContainerNode();

            var plot = htmlElement.getElementsByTagName("svg")[0];

            if (parentNode && plot) {
              plot.style.WebkitTouchCallout = "none";
              plot.style.WebkitUserSelect = "none";
              plot.style.userSelect = "none";
            }
          }, this);
          cellHandler.retrieveOutput();
          return true;
        }

        return false;
      }
    }
  });
  qxapp.component.widget.DashGrid.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=DashGrid.js.map?dt=1568886160892