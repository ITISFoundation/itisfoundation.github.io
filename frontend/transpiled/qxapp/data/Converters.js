(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.utils.UuidToName": {}
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
   *   Collection of static methods for converting data coming from the webserver into suitable
   * data for the frontend.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let dataStore = qxapp.store.Data.getInstance();
   *   dataStore.addListenerOnce("nodeFiles", e => {
   *     const files = e.getData();
   *     const newChildren = qxapp.data.Converters.fromDSMToVirtualTreeModel(files);
   *     this.__addTreeData(newChildren);
   *   }, this);
   *   dataStore.getNodeFiles(nodeId);
   * </pre>
   */
  qx.Class.define("qxapp.data.Converters", {
    type: "static",
    statics: {
      __mergeFileTreeChildren: function __mergeFileTreeChildren(one, two) {
        var newDir = true;

        for (var i = 0; i < one.length; i++) {
          if (one[i].path === two.path) {
            newDir = false;

            if ("children" in two) {
              this.__mergeFileTreeChildren(one[i].children, two.children[0]);
            }
          }
        }

        if (one.length === 0 || "fileId" in two || newDir) {
          one.push(two);
        }
      },
      fromDSMToVirtualTreeModel: function fromDSMToVirtualTreeModel(files) {
        var uuidToName = qxapp.utils.UuidToName.getInstance();
        var children = [];

        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var fileInTree = this.createDirEntry(file["location"], file["location_id"], "");

          if (file["location_id"] === 0 || file["location_id"] === "0") {
            // simcore files
            var splitted = file["file_uuid"].split("/");

            if (splitted.length === 3) {
              var prjId = splitted[0];
              var nodeId = splitted[1];
              var fileId = splitted[2];
              var prjLabel = file["project_name"] === "" ? uuidToName.convertToName(prjId) : file["project_name"];
              var nodeLabel = file["node_name"] === "" ? uuidToName.convertToName(nodeId) : file["node_name"];
              var fileName = file["file_name"] === "" ? fileId : file["file_name"]; // node file

              fileInTree.children.push(this.createDirEntry(prjLabel, file["location_id"], prjId, [this.createDirEntry(nodeLabel, file["location_id"], prjId + "/" + nodeId, [this.createFileEntry(fileName, file["location_id"], file["file_id"], file["last_modified"], file["file_size"])])]));

              this.__mergeFileTreeChildren(children, fileInTree);
            }
          } else if (file["location_id"] === 1 || file["location_id"] === "1") {
            // datcore files
            var parent = fileInTree;

            var _splitted = file["file_uuid"].split("/");

            for (var j = 0; j < _splitted.length - 1; j++) {
              var newItem = this.createDirEntry(_splitted[j], file["location_id"], parent.path === "" ? _splitted[j] : parent.path + "/" + _splitted[j]);
              parent.children.push(newItem);
              parent = newItem;
            }

            var fileInfo = this.createFileEntry(_splitted[_splitted.length - 1], file["location_id"], file["file_id"], file["last_modified"], file["file_size"]);
            parent.children.push(fileInfo);

            this.__mergeFileTreeChildren(children, fileInTree);
          }
        }

        return children;
      },
      createDirEntry: function createDirEntry(label, location, path) {
        var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

        if (label === null || label === undefined || label === "") {
          label = "Unknown label";
        }

        return {
          label: label,
          location: location,
          path: path,
          children: children
        };
      },
      createFileEntry: function createFileEntry(label, location, fileId, lastModified, size) {
        if (label === undefined) {
          label = "Unknown label";
        }

        if (location === undefined) {
          location = "Unknown location";
        }

        if (fileId === undefined) {
          fileId = "Unknown fileId";
        }

        if (lastModified === undefined) {
          lastModified = (Math.floor(Math.random() * 1000000) + 1).toString();
        }

        if (size === undefined) {
          size = 0;
        }

        return {
          label: label,
          location: location,
          fileId: fileId,
          lastModified: lastModified,
          size: size
        };
      },
      __mergeAPITreeChildren: function __mergeAPITreeChildren(one, two) {
        var newDir = true;

        for (var i = 0; i < one.length; i++) {
          if (one[i].key === two.key) {
            newDir = false;

            if ("children" in two) {
              this.__mergeAPITreeChildren(one[i].children, two.children[0]);
            }
          }
        } // if (one.length === 0 || "fileId" in two || newDir) {


        if (one.length === 0 || newDir) {
          one.push(two);
        }
      },
      fromAPITreeToVirtualTreeModel: function fromAPITreeToVirtualTreeModel(treeItems, showLeavesAsDirs, portKey) {
        var children = [];

        for (var i = 0; i < treeItems.length; i++) {
          var treeItem = treeItems[i];
          var splitted = treeItem.label.split("/");
          var newItem = {
            label: splitted[0],
            open: false,
            portKey: portKey
          };

          if (splitted.length === 1) {
            // leaf already
            newItem.key = treeItem.key;

            if (showLeavesAsDirs) {
              newItem.children = [];
            }
          } else {
            // branch
            newItem.key = splitted[0];
            newItem.children = [];
            var parent = newItem;

            for (var j = 1; j < splitted.length - 1; j++) {
              var branch = {
                label: splitted[j],
                key: parent.key + "/" + splitted[j],
                open: false,
                children: []
              };
              parent.children.push(branch);
              parent = branch;
            }

            var leaf = {
              label: splitted[splitted.length - 1],
              open: false,
              key: parent.key + "/" + splitted[splitted.length - 1]
            };

            if (showLeavesAsDirs) {
              leaf.children = [];
            }

            parent.children.push(leaf);
          }

          this.__mergeAPITreeChildren(children, newItem);
        }

        return children;
      },
      fromAPIListToVirtualListModel: function fromAPIListToVirtualListModel(listItems) {
        var list = [];

        for (var i = 0; i < listItems.length; i++) {
          var listItem = listItems[i];
          var item = {
            key: listItem["key"],
            label: listItem["label"]
          };

          if (listItem.thumbnail) {
            item["thumbnail"] = listItem["thumbnail"];
          }

          list.push(item);
        }

        return list;
      },
      fromTypeToIcon: function fromTypeToIcon(type) {
        // Introduce further mappings here
        switch (type) {
          case "integer":
            return "@MaterialIcons/arrow_right_alt/15";

          case "string":
            return "@MaterialIcons/format_quote/15";
        }

        if (type.indexOf("data:") === 0) {
          return "@MaterialIcons/insert_drive_file/15";
        }

        return "@MaterialIcons/arrow_right_alt/15";
      }
    }
  });
  qxapp.data.Converters.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Converters.js.map?dt=1568886162153