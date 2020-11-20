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
      "qx.ui.tree.VirtualTree": {
        "construct": true
      },
      "qxapp.component.widget.InputsMapperTreeItem": {
        "construct": true
      },
      "qxapp.dev.fake.mat2ent.Data": {
        "construct": true
      },
      "qx.data.marshal.Json": {
        "construct": true
      },
      "qxapp.store.Store": {
        "construct": true
      },
      "qxapp.component.form.Auto": {
        "construct": true
      },
      "qxapp.component.form.renderer.PropForm": {
        "construct": true
      },
      "qxapp.component.widget.TreeItemRenamer": {
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

  /* eslint no-underscore-dangle: ["error", { "allowAfterThis": true, "allow": ["__willBeBranch", "__willBeLeaf", "__tree"] }] */

  /**
   *   This widget contains a VirtualTree populated with InputsMapperTreeItems. It represents a mapping
   * of different inputs that can be either branches or leaves. Also implements a Drag&Drop mechanism.
   *
   *   When dropping an entry into the tree, this class asks the backend for further information for the given id,
   * if any, it renders it as a PropForm.
   *
   *   If the second argument in the constructor contains a defualt value entry, a by default entry will be added
   * to the VirtualTree.
   *
   * mapper: {
   *   displayOrder: 1,
   *   label: "Material Settings",
   *   description: "Maps Model entities into Materials",
   *   type: "mapper",
   *   maps: {
   *     branch: "simcore/services/demodec/dynamic/itis/s4l/MaterialDB",
   *     leaf: "simcore/services/dynamic/modeler/webserver"
   *   },
   *   defaultValue: [{
   *    "Air-UUID": [
   *       "Background"
   *      ]
   *   }]
   * }
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let inputsMapper = new qxapp.component.widget.InputsMapper(node, inputs["mapper"]);
   *   this.getRoot().add(inputsMapper);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.InputsMapper", {
    extend: qx.ui.core.Widget,

    /**
      * @param node {qxapp.data.model.Node} Node owning the widget
      * @param mapper {Object} mapper object provided by service's metadata
    */
    construct: function construct(node, mapper) {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);
      var widgetLayout = new qx.ui.layout.VBox(5);

      this._setLayout(widgetLayout);

      this.setNode(node);
      this.setMapper(mapper);
      var tree = this.__tree = new qx.ui.tree.VirtualTree(null, "label", "children").set({
        openMode: "none"
      });

      this._add(tree, {
        flex: 1
      });

      tree.getSelection().addListener("change", this.__onTreeSelectionChanged, this);
      var that = this;
      tree.setDelegate({
        createItem: function createItem() {
          return new qxapp.component.widget.InputsMapperTreeItem();
        },
        bindItem: function bindItem(c, item, id) {
          c.bindDefaultProperties(item, id);
          c.bindProperty("isDir", "isDir", null, item, id);
          c.bindProperty("isRoot", "isRoot", null, item, id);
        },
        configureItem: function configureItem(item) {
          item.set({
            droppable: true
          });
          item.addListener("dragover", function (e) {
            item.set({
              droppable: item.getIsDir()
            });
            var compatible = false;

            if (e.supportsType("osparc-mapping")) {
              var from = e.getRelatedTarget();
              var to = e.getCurrentTarget();
              var fromKey = from.getNodeKey();

              if (to.getIsRoot()) {
                // HACK
                if (from.getLabel() === "20181113_Yoon-sun_V4_preview") {
                  compatible = true;
                } else {
                  // root
                  compatible = from.getIsDir() && that.__willBeBranch(fromKey);
                }
              } else if (from.getModel().getChildren && from.getModel().getChildren().length > 0) {
                // non root
                compatible = true;
              } else {
                compatible = to.getIsDir() && !from.getIsDir() && that.__willBeLeaf(fromKey);
              }
            }

            if (!compatible) {
              e.preventDefault();
            }
          });
          item.addListener("drop", function (e) {
            if (e.supportsType("osparc-mapping")) {
              var from = e.getRelatedTarget();
              var fromNodeKey = from.getNodeKey();
              var fromPortKey = from.getPortKey();
              var to = e.getCurrentTarget();

              if (from.getLabel() === "20181113_Yoon-sun_V4_preview") {
                // HACK
                var mat2ent = qxapp.dev.fake.mat2ent.Data.mat2ent(from.getLabel());

                for (var i = 0; i < mat2ent.length; i++) {
                  to.getModel().getChildren().push(mat2ent[i]);
                }
              } else if (from.getModel().getChildren && from.getModel().getChildren().length > 0) {
                // allow folder drag&drop
                var children = from.getModel().getChildren();

                for (var _i = 0; _i < children.length; _i++) {
                  var child = children.toArray()[_i];

                  if (!child.getChildren) {
                    var _data = {
                      key: child.getKey(),
                      label: child.getLabel(),
                      nodeKey: from.getNodeKey(),
                      portKey: from.getPortKey(),
                      isDir: false
                    };

                    _this.__createItemAndPush(_data, to, fromNodeKey, fromPortKey);
                  }
                }
              } else {
                var _data2 = {
                  key: from.getModel(),
                  label: from.getLabel(),
                  nodeKey: from.getNodeKey(),
                  portKey: from.getPortKey(),
                  isDir: from.getIsDir()
                };

                _this.__createItemAndPush(_data2, to, fromNodeKey, fromPortKey);
              }

              to.setOpen(true);
              tree.focus();
            }
          });
        }
      });
      var data = {
        label: node.getLabel(),
        isRoot: true,
        children: []
      };

      if (mapper.defaultValue) {
        var defValues = mapper["defaultValue"];

        for (var i = 0; i < defValues.length; i++) {
          var defValue = defValues[i];

          for (var defValueId in defValue) {
            var newBranch = {
              key: defValueId,
              label: defValueId.replace("-UUID", ""),
              nodeKey: node.getKey(),
              portKey: "myPort",
              isDir: true,
              children: []
            };
            var newItemBranch = qx.data.marshal.Json.createModel(newBranch, true);
            var itemProps = qxapp.store.Store.getInstance().getItem(null, Object.keys(node.getInputsDefault())[0], defValueId);

            if (itemProps) {
              var form = new qxapp.component.form.Auto(itemProps, this.getNode());
              var propsWidget = new qxapp.component.form.renderer.PropForm(form);
              newItemBranch["propsWidget"] = propsWidget;
            }

            data.children.push(newItemBranch);
            var values = defValue[defValueId];

            for (var j = 0; j < values.length; j++) {
              var newLeaf = {
                key: values[j],
                label: values[j],
                nodeKey: node.getKey(),
                portKey: "myPort",
                isDir: true
              };
              var newItemLeaf = qx.data.marshal.Json.createModel(newLeaf, true);
              newItemBranch.getChildren().push(newItemLeaf);
            }
          }
        }
      }

      var model = qx.data.marshal.Json.createModel(data, true);
      tree.setModel(model);
      this.addListener("keypress", function (keyEvent) {
        var treeSelection = this.__tree.getSelection();

        if (treeSelection.length < 1) {
          return;
        }

        var selectedItem = treeSelection.toArray()[0];

        if (selectedItem.getIsRoot && selectedItem.getIsRoot()) {
          return;
        }

        switch (keyEvent.getKeyIdentifier()) {
          case "F2":
            {
              var treeItemRenamer = new qxapp.component.widget.TreeItemRenamer(selectedItem);
              treeItemRenamer.addListener("labelChanged", function (e) {
                var newLabel = e.getData()["newLabel"];
                selectedItem.setLabel(newLabel);
              }, this);
              treeItemRenamer.center();
              treeItemRenamer.open();
              break;
            }

          case "Delete":
            {
              var branches = this.__tree.getModel().getChildren(); // branch


              var removed = branches.remove(selectedItem);

              if (!removed) {
                // leaf
                var br = branches.toArray();

                for (var _i2 = 0; _i2 < br.length; _i2++) {
                  var branch = br[_i2];
                  removed = branch.getChildren().remove(selectedItem);

                  if (removed) {
                    break;
                  }
                }
              }

              break;
            }
        }
      }, this);
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node",
        nullable: false
      },
      mapper: {
        nullable: false
      }
    },
    members: {
      __tree: null,
      __createItemAndPush: function __createItemAndPush(data, to, fromNodeKey, fromPortKey) {
        var willBeBranch = this.__willBeBranch(fromNodeKey);

        if (willBeBranch) {
          data["children"] = [];
        }

        var newItem = qx.data.marshal.Json.createModel(data, true);
        to.getModel().getChildren().push(newItem);

        if (willBeBranch) {
          // Hmmmm not sure about the double getKey :(
          var itemProps = qxapp.store.Store.getInstance().getItem(null, fromPortKey, newItem.getKey().getKey());

          if (itemProps) {
            var form = new qxapp.component.form.Auto(itemProps, this.getNode());
            var propsWidget = new qxapp.component.form.renderer.PropForm(form);
            newItem["propsWidget"] = propsWidget;
          }
        }
      },
      __willBeBranch: function __willBeBranch(candidate) {
        var isBranch = false;
        var maps = this.getMapper().maps;

        if (maps.branch) {
          if (maps["branch"] === candidate) {
            isBranch = true;
          }
        }

        var isDefault = candidate === this.getNode().getKey();
        return isDefault || isBranch;
      },
      __willBeLeaf: function __willBeLeaf(candidate) {
        var isLeave = false;
        var maps = this.getMapper().maps;

        if (maps.leaf) {
          if (maps["leaf"] === candidate) {
            isLeave = true;
          }
        }

        return isLeave;
      },
      __onTreeSelectionChanged: function __onTreeSelectionChanged() {
        // remove all but the tree
        while (this._getChildren().length > 1) {
          this._removeAt(1);
        }

        var selectedItems = this.__tree.getSelection();

        if (selectedItems.length < 1) {
          return;
        }

        var selectedItem = selectedItems.toArray()[0];

        if (selectedItem.propsWidget) {
          this._add(selectedItem["propsWidget"]);
        }
      }
    }
  });
  qxapp.component.widget.InputsMapper.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=InputsMapper.js.map?dt=1568886160985