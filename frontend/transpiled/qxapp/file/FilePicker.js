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
      "qx.ui.toolbar.ToolBar": {
        "construct": true
      },
      "qx.ui.toolbar.Part": {
        "construct": true
      },
      "qx.ui.form.Button": {},
      "qxapp.file.FilesTree": {},
      "qxapp.file.FilesAdd": {},
      "qx.ui.toolbar.Button": {}
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
   * Built-in service used for selecting a single file from storage and make it available in the workflow
   *
   *   It consists of a VBox containing a FilesTree, Add button and Select button:
   * - FilesTree will be populated with data provided by storage service (simcore.S3 and datcore)
   * - Add button will open a dialogue where the selected file will be upload to S3
   * - Select button puts the file in the output of the FilePicker node so that connected nodes can access it.
   * When the selection is made "finished" event will be fired
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let filePicker = new qxapp.file.FilePicker(node, studyId);
   *   this.getRoot().add(filePicker);
   * </pre>
   */
  qx.Class.define("qxapp.file.FilePicker", {
    extend: qx.ui.core.Widget,

    /**
      * @param node {qxapp.data.model.Node} Node owning the widget
      * @param studyId {String} StudyId of the study that node belongs to
    */
    construct: function construct(node, studyId) {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);
      this.set({
        node: node,
        studyId: studyId
      });
      var filePickerLayout = new qx.ui.layout.VBox();

      this._setLayout(filePickerLayout);

      var reloadButton = this._createChildControlImpl("reloadButton");

      reloadButton.addListener("execute", function () {
        this.__filesTree.resetCache();

        this.__initResources();
      }, this);

      var filesTree = this.__filesTree = this._createChildControlImpl("filesTree");

      filesTree.addListener("selectionChanged", this.__selectionChanged, this);
      filesTree.addListener("itemSelected", this.__itemSelected, this);
      filesTree.addListener("filesAddedToTree", this.__filesAdded, this);
      var toolbar = new qx.ui.toolbar.ToolBar();
      var mainButtons = this.__mainButtons = new qx.ui.toolbar.Part();
      toolbar.addSpacer();
      toolbar.add(mainButtons);

      this._add(toolbar);

      var addBtn = this._createChildControlImpl("addButton");

      addBtn.addListener("fileAdded", function (e) {
        var fileMetadata = e.getData();

        if ("location" in fileMetadata && "path" in fileMetadata) {
          _this.__setOutputFile(fileMetadata["location"], fileMetadata["path"], fileMetadata["name"]);
        }

        _this.__initResources(fileMetadata["location"]);
      }, this);

      var selectBtn = this.__selectBtn = this._createChildControlImpl("selectButton");

      selectBtn.setEnabled(false);
      selectBtn.addListener("execute", function () {
        this.__itemSelected();
      }, this);

      this.__initResources();
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node"
      },
      studyId: {
        check: "String",
        init: ""
      }
    },
    events: {
      "finished": "qx.event.type.Event"
    },
    members: {
      __filesTree: null,
      __selectBtn: null,
      __mainButtons: null,
      _createChildControlImpl: function _createChildControlImpl(id) {
        var control;

        switch (id) {
          case "reloadButton":
            control = new qx.ui.form.Button().set({
              label: this.tr("Reload"),
              icon: "@FontAwesome5Solid/sync-alt/16",
              allowGrowX: false
            });

            this._add(control);

            break;

          case "filesTree":
            control = new qxapp.file.FilesTree();

            this._add(control, {
              flex: 1
            });

            break;

          case "addButton":
            control = new qxapp.file.FilesAdd().set({
              node: this.getNode(),
              studyId: this.getStudyId()
            });

            this.__mainButtons.add(control);

            break;

          case "selectButton":
            control = new qx.ui.toolbar.Button(this.tr("Select"));

            this.__mainButtons.add(control);

            break;
        }

        return control || qxapp.file.FilePicker.prototype._createChildControlImpl.base.call(this, id);
      },
      __initResources: function __initResources() {
        var locationId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.__filesTree.populateTree(null, locationId);
      },
      __selectionChanged: function __selectionChanged() {
        var data = this.__filesTree.getSelectedFile();

        this.__selectBtn.setEnabled(data ? data["isFile"] : false);
      },
      __itemSelected: function __itemSelected() {
        var data = this.__filesTree.getSelectedFile();

        if (data && data["isFile"]) {
          var selectedItem = data["selectedItem"];

          this.__setOutputFile(selectedItem.getLocation(), selectedItem.getFileId(), selectedItem.getLabel());

          this.getNode().setProgress(100);
          this.getNode().repopulateOutputPortData();
          this.fireEvent("finished");
        }
      },
      __getOutputFile: function __getOutputFile() {
        var outputs = this.getNode().getOutputs();
        return outputs["outFile"];
      },
      __setOutputFile: function __setOutputFile(store, path, label) {
        if (store && path) {
          var outputs = this.__getOutputFile();

          outputs["value"] = {
            store: store,
            path: path,
            label: label
          };
        }
      },
      __filesAdded: function __filesAdded() {
        this.__checkSelectedFileIsListed();
      },
      __checkSelectedFileIsListed: function __checkSelectedFileIsListed() {
        var outFile = this.__getOutputFile();

        if (outFile && "value" in outFile && "path" in outFile.value) {
          this.__filesTree.setSelectedFile(outFile.value.path);

          this.__filesTree.fireEvent("selectionChanged");
        }
      }
    }
  });
  qxapp.file.FilePicker.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=FilePicker.js.map?dt=1568886163981