(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.tree.VirtualTree": {
        "construct": true,
        "require": true
      },
      "qxapp.component.widget.inputs.NodeOutputTreeItem": {
        "construct": true
      },
      "qx.event.message.Bus": {},
      "qxapp.store.Store": {},
      "qxapp.data.Converters": {},
      "qx.data.marshal.Json": {}
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
   *   Widget used for displaying an output port data of an input node. It contains a VirtualTree
   * populated with NodeOutputTreeItems. It implements Drag mechanism.
   *
   * It is meant to fit "node-output-tree-api" input/output port type
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let nodeOutputTree = new qxapp.component.widget.inputs.NodeOutputTree(node, port, portKey);
   *   widget = nodeOutputTree.getOutputWidget();
   *   this.getRoot().add(widget);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.inputs.NodeOutputTree", {
    extend: qx.ui.tree.VirtualTree,

    /**
      * @param node {qxapp.data.model.Node} Node owning the widget
      * @param port {Object} Port owning the widget
      * @param portKey {String} Port Key
    */
    construct: function construct(node, ports) {
      var model = this.__generateModel(node, ports);

      qx.ui.tree.VirtualTree.constructor.call(this, model, "label", "children", "open");
      this.set({
        node: node,
        ports: ports,
        decorator: "service-tree",
        hideRoot: true,
        contentPadding: 0,
        padding: 0,
        minHeight: 0
      });
      var self = this;
      this.setDelegate({
        createItem: function createItem() {
          return new qxapp.component.widget.inputs.NodeOutputTreeItem();
        },
        bindItem: function bindItem(c, item, id) {
          c.bindDefaultProperties(item, id);
          c.bindProperty("value", "value", null, item, id);
          c.bindProperty("nodeKey", "nodeKey", null, item, id);
          c.bindProperty("portKey", "portKey", null, item, id);
          c.bindProperty("isDir", "isDir", null, item, id);
          c.bindProperty("icon", "icon", null, item, id);
          c.bindProperty("open", "open", null, item, id);
        },
        configureItem: function configureItem(item) {
          item.setDraggable(true);

          self.__attachEventHandlers(item); // eslint-disable-line no-underscore-dangle

        }
      });
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node",
        nullable: false
      },
      ports: {
        nullable: false
      }
    },
    members: {
      __attachEventHandlers: function __attachEventHandlers(item) {
        var _this = this;

        item.addListener("dragstart", function (e) {
          // Register supported actions
          e.addAction("copy"); // Register supported types

          e.addType("osparc-port-link");
          e.addType("osparc-mapping");
          item.nodeId = _this.getNode().getNodeId();
          item.portId = item.getPortKey();
          item.setNodeKey(_this.getNode().getKey());
        }, this);

        var msgCb = function msgCb(decoratorName) {
          return function (msg) {
            _this.getSelection().remove(item.getModel());

            var compareFn = msg.getData();

            if (item.getPortKey() && decoratorName && compareFn(_this.getNode().getNodeId(), item.getPortKey())) {
              item.setDecorator(decoratorName);
            } else {
              item.resetDecorator();
            }
          };
        };

        item.addListener("appear", function () {
          qx.event.message.Bus.getInstance().subscribe("inputFocus", msgCb("outputPortHighlighted"), _this);
          qx.event.message.Bus.getInstance().subscribe("inputFocusout", msgCb(), _this);
        });
        item.addListener("disappear", function () {
          qx.event.message.Bus.getInstance().unsubscribe("inputFocus", msgCb("outputPortHighlighted"), _this);
          qx.event.message.Bus.getInstance().unsubscribe("inputFocusout", msgCb(), _this);
        });
      },
      __generateModel: function __generateModel(node, ports) {
        var data = {
          label: "root",
          open: true,
          children: []
        };

        for (var portKey in ports) {
          var portData = {
            label: ports[portKey].label,
            portKey: portKey,
            nodeKey: node.getKey(),
            isDir: !(portKey.includes("modeler") || portKey.includes("sensorSettingAPI") || portKey.includes("neuronsSetting")),
            open: false
          };

          if (ports[portKey].type === "node-output-tree-api-v0.0.1") {
            var itemList = qxapp.store.Store.getInstance().getItemList(node.getKey(), portKey);
            var showLeavesAsDirs = !(portKey.includes("modeler") || portKey.includes("sensorSettingAPI") || portKey.includes("neuronsSetting"));
            var children = qxapp.data.Converters.fromAPITreeToVirtualTreeModel(itemList, showLeavesAsDirs, portKey);
            portData.children = children;
            portData.open = true;
          } else {
            portData.icon = qxapp.data.Converters.fromTypeToIcon(ports[portKey].type);
            portData.value = ports[portKey].value == null ? this.tr("no value") : ports[portKey].value; // eslint-disable-line no-eq-null
          }

          data.children.push(portData);
        }

        return qx.data.marshal.Json.createModel(data, true);
      },
      getOutputWidget: function getOutputWidget() {
        return this;
      }
    }
  });
  qxapp.component.widget.inputs.NodeOutputTree.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeOutputTree.js.map?dt=1568886161605