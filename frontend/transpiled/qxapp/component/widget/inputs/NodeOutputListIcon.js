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
      "qx.ui.list.List": {
        "construct": true
      },
      "qxapp.component.widget.inputs.NodeOutputListIconItem": {
        "construct": true
      },
      "qxapp.store.Store": {
        "construct": true
      },
      "qxapp.data.Converters": {
        "construct": true
      },
      "qx.data.marshal.Json": {
        "construct": true
      }
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
   *   Widget used for displaying an output port data of an input node. It contains a List populated
   * with NodeOutputListIconItems. It implements Drag mechanism.
   *
   * It is meant to fit "node-output-list-api" input/output port type
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let nodeOutputListIcon = new qxapp.component.widget.inputs.NodeOutputListIcon(node, port, portKey);
   *   widget = nodeOutputListIcon.getOutputWidget();
   *   this.getRoot().add(widget);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.inputs.NodeOutputListIcon", {
    extend: qx.ui.core.Widget,

    /**
      * @param node {qxapp.data.model.Node} Node owning the widget
      * @param port {Object} Port owning the widget
      * @param portKey {String} Port Key
    */
    construct: function construct(node, port, portKey) {
      qx.ui.core.Widget.constructor.call(this);
      this.setNode(node);
      var list = this.__list = new qx.ui.list.List().set({
        labelPath: "label",
        iconPath: "icon",
        decorator: "service-tree"
      });
      var that = this;
      list.setDelegate({
        createItem: function createItem() {
          return new qxapp.component.widget.inputs.NodeOutputListIconItem();
        },
        bindItem: function bindItem(c, item, id) {
          c.bindDefaultProperties(item, id);
          c.bindProperty("key", "model", null, item, id);
          c.bindProperty("thumbnail", "icon", null, item, id);
          c.bindProperty("label", "label", null, item, id);
        },
        configureItem: function configureItem(item) {
          var icon = item.getChildControl("icon");
          icon.set({
            scale: true,
            width: 246,
            height: 144
          });

          that.__createDragMechanism(item); // eslint-disable-line no-underscore-dangle

        }
      });
      var itemList = qxapp.store.Store.getInstance().getItemList(node.getKey(), portKey);
      var listModel = qxapp.data.Converters.fromAPIListToVirtualListModel(itemList);
      var model = qx.data.marshal.Json.createModel(listModel, true);
      list.setModel(model);
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node",
        nullable: false
      }
    },
    members: {
      __list: null,
      __createDragMechanism: function __createDragMechanism(item) {
        var _this = this;

        item.setDraggable(true);
        item.addListener("dragstart", function (e) {
          // Register supported actions
          e.addAction("copy"); // HACK

          if (_this.getNode().getKey() === "simcore/services/demodec/dynamic/itis/s4l/neuroman") {
            // Register supported types
            e.addType("osparc-port-link");
            item.nodeId = _this.getNode().getNodeId();
            item.portId = item.getLabel();
          } else {
            // Register supported types
            e.addType("osparc-mapping");
          }
        }, this);
      },
      getOutputWidget: function getOutputWidget() {
        return this.__list;
      }
    }
  });
  qxapp.component.widget.inputs.NodeOutputListIcon.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeOutputListIcon.js.map?dt=1568886161553