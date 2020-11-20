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
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qxapp.ui.toolbar.Label": {},
      "qx.ui.toolbar.Button": {},
      "qxapp.file.FilesTree": {},
      "qxapp.store.Data": {},
      "qxapp.utils.Utils": {},
      "qxapp.component.message.FlashMessenger": {}
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
   * A HBox containing a text field, download button and delete button.
   *
   *   It is used together with a virtual tree of files where the selection is displayed
   * in the text field and the download and delete are related to that selection.
   * Download and deleted methods are also provided.
   * If a file is deleted it fires "fileDeleted" data event
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let hBox = new qxapp.file.FileLabelWithActions();
   *   this.getRoot().add(hBox);
   * </pre>
   */
  qx.Class.define("qxapp.file.FileLabelWithActions", {
    extend: qx.ui.core.Widget,
    construct: function construct() {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this, new qx.ui.layout.HBox(5));
      var fileLabelWithActionsLayout = new qx.ui.layout.HBox(5);

      this._setLayout(fileLabelWithActionsLayout);

      var downloadBtn = this._createChildControlImpl("downloadBtn");

      downloadBtn.addListener("execute", function (e) {
        _this.__retrieveURLAndDownload();
      }, this);

      var deleteBtn = this._createChildControlImpl("deleteBtn");

      deleteBtn.addListener("execute", function (e) {
        _this.__deleteFile();
      }, this);
      this.__selectedLabel = this._createChildControlImpl("selectedLabel");
    },
    events: {
      "fileDeleted": "qx.event.type.Data"
    },
    members: {
      __selectedLabel: null,
      _createChildControlImpl: function _createChildControlImpl(id) {
        var control;

        switch (id) {
          case "selectedLabel":
            control = new qxapp.ui.toolbar.Label();

            this._add(control);

            break;

          case "downloadBtn":
            control = new qx.ui.toolbar.Button(this.tr("Download"), "@FontAwesome5Solid/cloud-download-alt/16");

            this._add(control);

            break;

          case "deleteBtn":
            control = new qx.ui.toolbar.Button(this.tr("Delete"), "@FontAwesome5Solid/trash-alt/16");

            this._add(control);

            break;
        }

        return control || qxapp.file.FileLabelWithActions.prototype._createChildControlImpl.base.call(this, id);
      },
      itemSelected: function itemSelected(selectedItem, isFile) {
        if (isFile) {
          this.__selection = selectedItem;

          this.__selectedLabel.setValue(selectedItem.getFileId());
        } else {
          this.__selection = null;

          this.__selectedLabel.setValue("");
        }
      },
      __getItemSelected: function __getItemSelected() {
        var selectedItem = this.__selection;

        if (selectedItem && qxapp.file.FilesTree.isFile(selectedItem)) {
          return selectedItem;
        }

        return null;
      },
      // Request to the server an download
      __retrieveURLAndDownload: function __retrieveURLAndDownload() {
        var selection = this.__getItemSelected();

        if (selection) {
          var fileId = selection.getFileId();
          var fileName = fileId.split("/");
          fileName = fileName[fileName.length - 1];
          var dataStore = qxapp.store.Data.getInstance();
          dataStore.addListenerOnce("presignedLink", function (e) {
            var presignedLinkData = e.getData();
            console.log(presignedLinkData.presignedLink);

            if (presignedLinkData.presignedLink) {
              var link = presignedLinkData.presignedLink.link;
              var fileNameFromLink = qxapp.utils.Utils.fileNameFromPresignedLink(link);
              fileName = fileNameFromLink ? fileNameFromLink : fileName;
              qxapp.utils.Utils.downloadLink(link, fileName);
            }
          }, this);
          var download = true;
          var locationId = selection.getLocation();
          dataStore.getPresignedLink(download, locationId, fileId);
        }
      },
      __deleteFile: function __deleteFile() {
        var _this2 = this;

        var selection = this.__getItemSelected();

        if (selection) {
          console.log("Delete ", selection);
          var fileId = selection.getFileId();
          var locationId = selection.getLocation();

          if (locationId !== 0 && locationId !== "0") {
            qxapp.component.message.FlashMessenger.getInstance().logAs(this.tr("Only files in simcore.s3 can be deleted"));
            return false;
          }

          var dataStore = qxapp.store.Data.getInstance();
          dataStore.addListenerOnce("deleteFile", function (e) {
            if (e) {
              _this2.fireDataEvent("fileDeleted", e.getData());
            }
          }, this);
          return dataStore.deleteFile(locationId, fileId);
        }

        return false;
      }
    }
  });
  qxapp.file.FileLabelWithActions.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=FileLabelWithActions.js.map?dt=1568886163945