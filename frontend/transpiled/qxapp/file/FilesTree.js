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
      "qx.lang.String": {},
      "qxapp.file.FileTreeItem": {},
      "qxapp.store.Data": {},
      "qxapp.data.Converters": {},
      "qx.data.marshal.Json": {},
      "qx.data.Array": {}
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
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * VirtualTree that is able to build its content.
   *
   *   Elements in the tree also accept Drag and/or Drop mechanisms which are implemented here.
   * "osparc-filePath" type is used for the Drag&Drop.
   *
   *   If a file is dropped into a folder, this class will start the copying proccess fireing
   * "fileCopied" event if successful
   *
   * Also provides two static methods for checking whether en entry in the tree is File/Directory
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let filesTree = new qxapp.file.FilesTree();
   *   this.getRoot().add(filesTree);
   * </pre>
   */
  qx.Class.define("qxapp.file.FilesTree", {
    extend: qx.ui.tree.VirtualTree,
    construct: function construct() {
      qx.ui.tree.VirtualTree.constructor.call(this, null, "label", "children");
      this.set({
        openMode: "none",
        decorator: "no-border"
      });
      this.resetChecks();
      this.addListener("tap", this.__selectionChanged, this); // Listen to "Enter" key

      this.addListener("keypress", function (keyEvent) {
        if (keyEvent.getKeyIdentifier() === "Enter") {
          this.__itemSelected();
        }
      }, this);
    },
    properties: {
      dragMechnism: {
        check: "Boolean",
        init: false
      },
      dropMechnism: {
        check: "Boolean",
        init: false
      }
    },
    events: {
      "selectionChanged": "qx.event.type.Event",
      "itemSelected": "qx.event.type.Event",
      "fileCopied": "qx.event.type.Data",
      "filesAddedToTree": "qx.event.type.Event"
    },
    statics: {
      isDir: function isDir(item) {
        var isDir = false;

        if (item["get" + qx.lang.String.firstUp("path")]) {
          if (item.getPath() !== null) {
            isDir = true;
          }
        }

        return isDir;
      },
      isFile: function isFile(item) {
        var isFile = false;

        if (item["set" + qx.lang.String.firstUp("fileId")]) {
          isFile = true;
        }

        return isFile;
      },
      addLoadingChild: function addLoadingChild(parent) {
        var loadingModel = new qxapp.file.FileTreeItem().set({
          label: "Loading...",
          location: null,
          path: null,
          icon: "@FontAwesome5Solid/circle-notch/12"
        });
        parent.getChildren().append(loadingModel);
      },
      removeLoadingChild: function removeLoadingChild(parent) {
        for (var i = parent.getChildren().length - 1; i >= 0; i--) {
          if (parent.getChildren().toArray()[i].getLabel() === "Loading...") {
            parent.getChildren().toArray().splice(i, 1);
          }
        }
      }
    },
    members: {
      __locations: null,
      __datasets: null,
      resetChecks: function resetChecks() {
        this.__locations = new Set();
        this.__datasets = new Set();
      },
      resetCache: function resetCache() {
        this.resetChecks();
        var filesStore = qxapp.store.Data.getInstance();
        filesStore.resetCache();
      },
      populateTree: function populateTree() {
        var _this = this;

        var nodeId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var locationId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        if (nodeId) {
          this.__populateNodeFiles(nodeId);
        } else if (locationId) {
          this.__populateMyLocation(locationId);
        } else {
          this.__populateMyData();
        }

        this.getDelegate().configureItem = function (item) {
          item.addListener("dbltap", function (e) {
            _this.__itemSelected();
          }, _this);

          _this.__addDragAndDropMechanisms(item);
        };
      },
      __populateNodeFiles: function __populateNodeFiles(nodeId) {
        var _this2 = this;

        var treeName = "Node files";

        this.__resetTree(treeName);

        var rootModel = this.getModel();
        qxapp.file.FilesTree.addLoadingChild(rootModel);
        var filesStore = qxapp.store.Data.getInstance();
        filesStore.addListenerOnce("nodeFiles", function (e) {
          var files = e.getData();
          var newChildren = qxapp.data.Converters.fromDSMToVirtualTreeModel(files);

          _this2.__filesToRoot(newChildren);
        }, this);
        filesStore.getNodeFiles(nodeId);
      },
      __populateMyData: function __populateMyData() {
        var _this3 = this;

        this.resetChecks();
        var treeName = "My Data";

        this.__resetTree(treeName);

        var rootModel = this.getModel();
        rootModel.getChildren().removeAll();
        qxapp.file.FilesTree.addLoadingChild(rootModel);
        var filesStore = qxapp.store.Data.getInstance();
        filesStore.addListenerOnce("myLocations", function (e) {
          var locations = e.getData();

          if (_this3.__locations.size === 0) {
            _this3.resetChecks();

            _this3.__locationsToRoot(locations);

            for (var i = 0; i < locations.length; i++) {
              var locationId = locations[i]["id"];

              _this3.__populateMyLocation(locationId);
            }
          }
        }, this);
        filesStore.getLocations();
      },
      __populateMyLocation: function __populateMyLocation() {
        var _this4 = this;

        var locationId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (locationId !== null) {
          var locationModel = this.__getLocationModel(locationId);

          if (locationModel) {
            locationModel.getChildren().removeAll();
            qxapp.file.FilesTree.addLoadingChild(locationModel);
          }
        }

        var filesStore = qxapp.store.Data.getInstance();
        filesStore.addListener("myDatasets", function (ev) {
          var _ev$getData = ev.getData(),
              location = _ev$getData.location,
              datasets = _ev$getData.datasets;

          if (location === locationId && !_this4.__locations.has(locationId)) {
            _this4.__datasetsToLocation(location, datasets);
          }
        }, this);
        filesStore.getDatasetsByLocation(locationId);
      },
      __resetTree: function __resetTree(treeName) {
        var _this5 = this;

        // FIXME: It is not reseting the model
        this.resetModel();
        var rootData = {
          label: treeName,
          location: null,
          path: null,
          children: []
        };
        var root = qx.data.marshal.Json.createModel(rootData, true);
        this.setModel(root);
        this.setDelegate({
          createItem: function createItem() {
            var fileTreeItem = new qxapp.file.FileTreeItem();
            fileTreeItem.addListener("requestFiles", function (e) {
              var _e$getData = e.getData(),
                  locationId = _e$getData.locationId,
                  datasetId = _e$getData.datasetId;

              if (_this5.__datasets.has(datasetId)) {
                return;
              }

              var filesStore = qxapp.store.Data.getInstance();
              filesStore.addListener("myDocuments", function (ev) {
                var _ev$getData2 = ev.getData(),
                    location = _ev$getData2.location,
                    dataset = _ev$getData2.dataset,
                    files = _ev$getData2.files;

                _this5.__filesToDataset(location, dataset, files);
              }, _this5);
              filesStore.getFilesByLocationAndDataset(locationId, datasetId);
            }, _this5);
            return fileTreeItem;
          },
          bindItem: function bindItem(c, item, id) {
            c.bindDefaultProperties(item, id);
            c.bindProperty("fileId", "fileId", null, item, id);
            c.bindProperty("location", "location", null, item, id);
            c.bindProperty("isDataset", "isDataset", null, item, id);
            c.bindProperty("loaded", "loaded", null, item, id);
            c.bindProperty("path", "path", null, item, id);
            c.bindProperty("lastModified", "lastModified", null, item, id);
            c.bindProperty("size", "size", null, item, id);
            c.bindProperty("icon", "icon", null, item, id);
          }
        });
      },
      __getLocationModel: function __getLocationModel(locationId) {
        var rootModel = this.getModel();
        var locationModels = rootModel.getChildren();

        for (var i = 0; i < locationModels.length; i++) {
          var locationModel = locationModels.toArray()[i];

          if (locationModel.getLocation() === locationId || String(locationModel.getLocation()) === locationId) {
            return locationModel;
          }
        }

        return null;
      },
      __getDatasetModel: function __getDatasetModel(locationId, datasetId) {
        var locationModel = this.__getLocationModel(locationId);

        var datasetModels = locationModel.getChildren();

        for (var i = 0; i < datasetModels.length; i++) {
          var datasetModel = datasetModels.toArray()[i];

          if (datasetModel.getPath() === datasetId || String(datasetModel.getPath()) === datasetId) {
            return datasetModel;
          }
        }

        return null;
      },
      __locationsToRoot: function __locationsToRoot(locations) {
        var rootModel = this.getModel();
        rootModel.getChildren().removeAll();

        for (var i = 0; i < locations.length; i++) {
          var location = locations[i];
          var locationData = qxapp.data.Converters.createDirEntry(location.name, location.id, "");
          var locationModel = qx.data.marshal.Json.createModel(locationData, true);
          rootModel.getChildren().append(locationModel);
        }
      },
      __datasetsToLocation: function __datasetsToLocation(locationId, datasets) {
        var filesStore = qxapp.store.Data.getInstance();

        var locationModel = this.__getLocationModel(locationId);

        if (!locationModel) {
          return;
        }

        this.__locations.add(locationId);

        locationModel.getChildren().removeAll();

        for (var i = 0; i < datasets.length; i++) {
          var dataset = datasets[i];
          var datasetData = qxapp.data.Converters.createDirEntry(dataset.display_name, locationId, dataset.dataset_id);
          datasetData.isDataset = true;
          datasetData.loaded = false;
          var datasetModel = qx.data.marshal.Json.createModel(datasetData, true);
          qxapp.file.FilesTree.addLoadingChild(datasetModel);
          locationModel.getChildren().append(datasetModel); // add cached files

          var datasetId = dataset.dataset_id;
          var cachedData = filesStore.getFilesByLocationAndDatasetCached(locationId, datasetId);

          if (cachedData) {
            this.__filesToDataset(cachedData.location, cachedData.dataset, cachedData.files);
          }
        }
      },
      __filesToDataset: function __filesToDataset(locationId, datasetId, files) {
        if (this.__datasets.has(datasetId)) {
          return;
        }

        var datasetModel = this.__getDatasetModel(locationId, datasetId);

        if (datasetModel) {
          datasetModel.getChildren().removeAll();

          if (files.length > 0) {
            var locationData = qxapp.data.Converters.fromDSMToVirtualTreeModel(files);
            var datasetData = locationData[0].children;

            for (var i = 0; i < datasetData[0].children.length; i++) {
              var filesModel = qx.data.marshal.Json.createModel(datasetData[0].children[i], true);
              datasetModel.getChildren().append(filesModel);
            }
          }

          this.__datasets.add(datasetId);

          this.fireEvent("filesAddedToTree");
        }
      },
      __filesToRoot: function __filesToRoot(data) {
        var currentModel = this.getModel();
        qxapp.file.FilesTree.removeLoadingChild(currentModel);
        var newModelToAdd = qx.data.marshal.Json.createModel(data, true);
        currentModel.getChildren().append(newModelToAdd);
        this.setModel(currentModel);
        this.fireEvent("filesAddedToTree");
      },
      __fileToTree: function __fileToTree(data) {
        if ("location" in data) {
          var locationModel = this.__getLocationModel(data["location"]);

          if (locationModel && "children" in data && data["children"].length > 0) {
            this.__addRecursively(locationModel.getChildren(), data["children"][0]);
          }
        }
      },
      __addRecursively: function __addRecursively(one, two) {
        var newDir = true;
        var oneArray = one.toArray();

        for (var i = 0; i < oneArray.length; i++) {
          if ("getPath" in oneArray[i] && oneArray[i].getPath() === two.path) {
            newDir = false;

            if ("children" in two) {
              this.__addRecursively(oneArray[i].getChildren(), two.children[0]);
            }
          }
        }

        if (oneArray.length === 0 || "fileId" in two || newDir) {
          one.append(qx.data.marshal.Json.createModel(two, true));
        }
      },
      getSelectedFile: function getSelectedFile() {
        var selectedItem = this.__getSelectedItem();

        if (selectedItem) {
          var isFile = qxapp.file.FilesTree.isFile(selectedItem);
          var data = {
            selectedItem: selectedItem,
            isFile: isFile
          };
          return data;
        }

        return null;
      },
      addFileEntry: function addFileEntry(fileMetadata) {
        console.log("file copied", fileMetadata);
      },
      __getLeafList: function __getLeafList(item, leaves) {
        if (item.getChildren == null) {
          // eslint-disable-line no-eq-null
          leaves.push(item);
        } else {
          for (var i = 0; i < item.getChildren().length; i++) {
            this.__getLeafList(item.getChildren().toArray()[i], leaves);
          }
        }
      },
      __findUuidInLeaves: function __findUuidInLeaves(uuid) {
        var parent = this.getModel();
        var list = [];

        this.__getLeafList(parent, list);

        for (var j = 0; j < list.length; j++) {
          if (uuid === list[j].getFileId()) {
            return list[j];
          }
        }

        return null;
      },
      setSelectedFile: function setSelectedFile(fileId) {
        var item = this.__findUuidInLeaves(fileId);

        if (item) {
          this.openNodeAndParents(item);
          var selected = new qx.data.Array([item]);
          this.setSelection(selected);
        }
      },
      __getSelectedItem: function __getSelectedItem() {
        var selection = this.getSelection().toArray();

        if (selection.length > 0) {
          return selection[0];
        }

        return null;
      },
      __selectionChanged: function __selectionChanged() {
        var selectedItem = this.__getSelectedItem();

        if (selectedItem) {
          this.fireEvent("selectionChanged");
        }
      },
      __itemSelected: function __itemSelected() {
        var selectedItem = this.__getSelectedItem();

        if (selectedItem) {
          this.fireEvent("itemSelected");
        }
      },
      __addDragAndDropMechanisms: function __addDragAndDropMechanisms(item) {
        if (this.getDragMechnism()) {
          this.__createDragMechanism(item);
        }

        if (this.getDropMechnism()) {
          this.__createDropMechanism(item);
        }
      },
      __createDragMechanism: function __createDragMechanism(treeItem) {
        treeItem.setDraggable(true);
        treeItem.addListener("dragstart", function (e) {
          if (qxapp.file.FilesTree.isFile(e.getOriginalTarget())) {
            // Register supported actions
            e.addAction("copy"); // Register supported types

            e.addType("osparc-filePath");
          } else {
            e.preventDefault();
          }
        }, this);
      },
      __createDropMechanism: function __createDropMechanism(treeItem) {
        var _this6 = this;

        treeItem.setDroppable(true);
        treeItem.addListener("dragover", function (e) {
          var compatible = false;

          if (qxapp.file.FilesTree.isDir(e.getOriginalTarget())) {
            if (e.supportsType("osparc-filePath")) {
              compatible = true;
            }
          }

          if (!compatible) {
            e.preventDefault();
          }
        }, this);
        treeItem.addListener("drop", function (e) {
          if (e.supportsType("osparc-filePath")) {
            var from = e.getRelatedTarget();
            var to = e.getCurrentTarget();
            var dataStore = qxapp.store.Data.getInstance();
            console.log("Copy", from.getFileId(), "to", to.getPath());
            var requestSent = dataStore.copyFile(from.getLocation(), from.getFileId(), to.getLocation(), to.getPath());

            if (requestSent) {
              dataStore.addListenerOnce("fileCopied", function (ev) {
                if (ev) {
                  _this6.fireDataEvent("fileCopied", ev.getData());
                }
              }, _this6);
            }
          }
        }, this);
      }
    }
  });
  qxapp.file.FilesTree.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=FilesTree.js.map?dt=1568886164149