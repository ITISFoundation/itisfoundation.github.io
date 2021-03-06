(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.tree.VirtualTreeItem": {
        "require": true
      },
      "qx.ui.core.Spacer": {},
      "qxapp.data.Permissions": {},
      "qx.ui.basic.Label": {}
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
       * Tobias Oetiker (oetiker)
  
  ************************************************************************ */

  /**
   * VirtualTreeItem used mainly by NodesTree
   *
   *   It consists of an entry icon, label and Node id
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   tree.setDelegate({
   *     createItem: () => new qxapp.component.widget.NodeTreeItem(),
   *     bindItem: (c, item, id) => {
   *       c.bindDefaultProperties(item, id);
   *       c.bindProperty("label", "label", null, item, id);
   *       c.bindProperty("nodeId", "nodeId", null, item, id);
   *     }
   *   });
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.NodeTreeItem", {
    extend: qx.ui.tree.VirtualTreeItem,
    properties: {
      nodeId: {
        check: "String",
        event: "changeNodeId",
        nullable: true
      }
    },
    members: {
      _addWidgets: function _addWidgets() {
        // Here's our indentation and tree-lines
        this.addSpacer();
        this.addOpenButton(); // The standard tree icon follows

        this.addIcon(); // The label

        this.addLabel(); // All else should be right justified

        this.addWidget(new qx.ui.core.Spacer(), {
          flex: 1
        });

        if (qxapp.data.Permissions.getInstance().canDo("study.nodestree.uuid.read")) {
          // Add a NodeId
          var nodeIdWidget = new qx.ui.basic.Label();
          this.bind("nodeId", nodeIdWidget, "value");
          nodeIdWidget.setMaxWidth(250);
          this.addWidget(nodeIdWidget);
        }
      }
    }
  });
  qxapp.component.widget.NodeTreeItem.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeTreeItem.js.map?dt=1568886161190