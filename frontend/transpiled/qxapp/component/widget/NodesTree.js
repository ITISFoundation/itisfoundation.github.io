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
      "qx.ui.toolbar.ToolBar": {},
      "qx.ui.toolbar.Button": {},
      "qx.ui.command.Command": {},
      "qxapp.utils.Utils": {},
      "qx.ui.tree.VirtualTree": {},
      "qx.data.marshal.Json": {},
      "qxapp.component.widget.NodeTreeItem": {},
      "qxapp.component.widget.TreeItemRenamer": {},
      "qx.data.Array": {}
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
   * Widget that shows workbench hierarchy in tree view.
   *
   * It contains:
   * - Toolbar for adding, removing or renaming nodes
   * - VirtualTree populated with NodeTreeItems
   *
   *   Helps the user navigating through nodes and gives a hierarchical view of containers. Also allows
   * some operations.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let nodesTree = new qxapp.component.widget.NodesTree(study.getName(), study.getWorkbench());
   *   this.getRoot().add(nodesTree);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.NodesTree", {
    extend: qx.ui.core.Widget,

    /**
      * @param studyName {String} Study Name for displaying as root of the tree
      * @param workbench {qxapp.data.model.Workbench} Workbench owning the widget
    */
    construct: function construct(studyName, workbench) {
      qx.ui.core.Widget.constructor.call(this);
      this.set({
        studyName: studyName,
        workbench: workbench
      });

      this._setLayout(new qx.ui.layout.VBox());

      this.__toolBar = this._createChildControlImpl("toolbar");
      this.__tree = this._createChildControlImpl("tree");
      this.populateTree();

      this.__attachEventHandlers();
    },
    events: {
      "nodeDoubleClicked": "qx.event.type.Data",
      "addNode": "qx.event.type.Event",
      "removeNode": "qx.event.type.Data",
      "changeSelectedNode": "qx.event.type.Data"
    },
    properties: {
      workbench: {
        check: "qxapp.data.model.Workbench",
        nullable: false
      },
      studyName: {
        check: "String"
      }
    },
    members: {
      __toolBar: null,
      __tree: null,
      _createChildControlImpl: function _createChildControlImpl(id) {
        var control;

        switch (id) {
          case "toolbar":
            control = this.__buildToolbar();

            this._add(control);

            break;

          case "tree":
            control = this.__buildTree();

            this._add(control, {
              flex: 1
            });

            break;
        }

        return control || qxapp.component.widget.NodesTree.prototype._createChildControlImpl.base.call(this, id);
      },
      __buildToolbar: function __buildToolbar() {
        var _this = this;

        var iconSize = 14;
        var toolbar = this.__toolBar = new qx.ui.toolbar.ToolBar();
        var newButton = new qx.ui.toolbar.Button("New", "@FontAwesome5Solid/plus/" + iconSize, new qx.ui.command.Command("Ctrl+N"));
        newButton.addListener("execute", function (e) {
          _this.__addNode();
        }, this);
        qxapp.utils.Utils.setIdToWidget(newButton, "newServiceBtn");
        toolbar.add(newButton);
        var deleteButton = new qx.ui.toolbar.Button("Delete", "@FontAwesome5Solid/trash/" + iconSize);
        deleteButton.addListener("execute", function (e) {
          _this.__deleteNode();
        }, this);
        qxapp.utils.Utils.setIdToWidget(deleteButton, "deleteServiceBtn");
        toolbar.add(deleteButton);
        var renameButton = new qx.ui.toolbar.Button("Rename", "@FontAwesome5Solid/i-cursor/" + iconSize);
        renameButton.addListener("execute", function (e) {
          _this.__openItemRenamer();
        }, this);
        qxapp.utils.Utils.setIdToWidget(renameButton, "renameServiceBtn");
        toolbar.add(renameButton);
        return toolbar;
      },
      __getOneSelectedRow: function __getOneSelectedRow() {
        var selection = this.__tree.getSelection();

        if (selection && selection.toArray().length > 0) {
          return selection.toArray()[0];
        }

        return null;
      },
      __buildTree: function __buildTree() {
        var _this2 = this;

        var tree = new qx.ui.tree.VirtualTree(null, "label", "children").set({
          decorator: "service-tree",
          openMode: "none",
          contentPadding: 0,
          padding: 0
        });
        tree.addListener("dbltap", function (e) {
          var currentSelection = _this2.__getOneSelectedRow();

          if (currentSelection) {
            _this2.fireDataEvent("nodeDoubleClicked", currentSelection.getNodeId());
          }
        }, this);
        tree.addListener("tap", function (e) {
          var currentSelection = _this2.__getOneSelectedRow();

          if (currentSelection) {
            _this2.fireDataEvent("changeSelectedNode", currentSelection.getNodeId());
          }
        }, this);
        return tree;
      },
      populateTree: function populateTree() {
        var topLevelNodes = this.getWorkbench().getNodes();
        var data = {
          label: this.getStudyName(),
          children: this.__convertModel(topLevelNodes),
          nodeId: "root",
          isContainer: true
        };
        var newModel = qx.data.marshal.Json.createModel(data, true);

        var oldModel = this.__tree.getModel();

        if (JSON.stringify(newModel) !== JSON.stringify(oldModel)) {
          this.__tree.setModel(newModel);

          this.__tree.setDelegate({
            createItem: function createItem() {
              return new qxapp.component.widget.NodeTreeItem();
            },
            bindItem: function bindItem(c, item, id) {
              c.bindDefaultProperties(item, id);
              c.bindProperty("label", "label", null, item, id);
              c.bindProperty("nodeId", "nodeId", null, item, id);
            }
          });
        }
      },
      __convertModel: function __convertModel(nodes) {
        var children = [];

        for (var nodeId in nodes) {
          var node = nodes[nodeId];
          var nodeInTree = {
            label: "",
            nodeId: node.getNodeId()
          };
          nodeInTree.label = node.getLabel();
          nodeInTree.isContainer = node.isContainer();

          if (node.isContainer()) {
            nodeInTree.children = this.__convertModel(node.getInnerNodes());
          }

          children.push(nodeInTree);
        }

        return children;
      },
      __getNodeInTree: function __getNodeInTree(model, nodeId) {
        if (model.getNodeId() === nodeId) {
          return model;
        } else if (model.getIsContainer() && model.getChildren() !== null) {
          var node = null;
          var children = model.getChildren().toArray();

          for (var i = 0; node === null && i < children.length; i++) {
            node = this.__getNodeInTree(children[i], nodeId);
          }

          return node;
        }

        return null;
      },
      __getSelection: function __getSelection() {
        var treeSelection = this.__tree.getSelection();

        if (treeSelection.length < 1) {
          return null;
        }

        var selectedItem = treeSelection.toArray()[0];
        var selectedNodeId = selectedItem.getNodeId();

        if (selectedNodeId === "root") {
          return null;
        }

        return selectedItem;
      },
      __addNode: function __addNode() {
        this.fireEvent("addNode");
      },
      __deleteNode: function __deleteNode() {
        var selectedItem = this.__getSelection();

        if (selectedItem === null) {
          return;
        }

        this.fireDataEvent("removeNode", selectedItem.getNodeId());
      },
      __openItemRenamer: function __openItemRenamer() {
        var _this3 = this;

        var selectedItem = this.__getSelection();

        if (selectedItem === null) {
          return;
        }

        var treeItemRenamer = new qxapp.component.widget.TreeItemRenamer(selectedItem);
        treeItemRenamer.addListener("labelChanged", function (e) {
          var data = e.getData();
          var newLabel = data.newLabel;
          var nodeId = selectedItem.getNodeId();

          var node = _this3.getWorkbench().getNode(nodeId);

          if (node) {
            node.renameNode(newLabel);
          }
        }, this);
        var bounds = this.getLayoutParent().getContentLocation();
        treeItemRenamer.moveTo(bounds.left + 100, bounds.top + 150);
        treeItemRenamer.open();
      },
      nodeSelected: function nodeSelected(nodeId) {
        var openNodeAndParents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var dataModel = this.__tree.getModel();

        var nodeInTree = this.__getNodeInTree(dataModel, nodeId);

        if (nodeInTree) {
          if (openNodeAndParents) {
            this.__tree.openNodeAndParents(nodeInTree);
          }

          this.__tree.setSelection(new qx.data.Array([nodeInTree]));
        }
      },
      __attachEventHandlers: function __attachEventHandlers() {
        this.addListener("keypress", function (keyEvent) {
          if (keyEvent.getKeyIdentifier() === "Delete") {
            this.__deleteNode();
          }
        }, this);
        this.addListener("keypress", function (keyEvent) {
          if (keyEvent.getKeyIdentifier() === "F2") {
            this.__openItemRenamer();
          }
        }, this);
      }
    }
  });
  qxapp.component.widget.NodesTree.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodesTree.js.map?dt=1568886161394