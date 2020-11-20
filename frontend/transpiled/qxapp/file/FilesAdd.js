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
      "qx.html.Input": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.toolbar.Button": {},
      "qxapp.store.Data": {},
      "qxapp.utils.Utils": {},
      "qx.ui.basic.Atom": {},
      "qxapp.ui.toolbar.ProgressBar": {}
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

  /* global XMLHttpRequest */

  /**
   * Widget that provides a way to upload files to S3
   *
   *   It consists of a VBox containing a button that pops up a dialogue for selecting multiple files and
   * progerss bars for showing the uploading status.
   *
   *   When selecting the file to be uploaded this widget will ask for a presigned link where the file can be put
   * and start the file transimision via XMLHttpRequest. If the uplaod is successful, "fileAdded" data event will
   * be fired.
   *
   *   This class also accepts a Node and StudyID that are used for putting the file in the correct folder strucutre.
   * If are not provided, random uuids will be used.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let filesAdd = new qxapp.file.FilesAdd(this.tr("Add file(s)"));
   *   this.getRoot().add(filesAdd);
   * </pre>
   */
  qx.Class.define("qxapp.file.FilesAdd", {
    extend: qx.ui.core.Widget,

    /**
      * @param label {String} Text to be displayed in the button
    */
    construct: function construct() {
      var _this = this;

      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.tr("Add file(s)");
      qx.ui.core.Widget.constructor.call(this);
      var filesAddLayout = new qx.ui.layout.HBox(10);

      this._setLayout(filesAddLayout); // Create a button


      var input = new qx.html.Input("file", {
        display: "none"
      }, {
        multiple: true
      });
      this.getContentElement().add(input);

      var btn = this._createChildControlImpl("addButton").set({
        label: label
      }); // Add an event listener


      btn.addListener("execute", function (e) {
        input.getDomElement().click();
      });
      input.addListener("change", function (e) {
        var files = input.getDomElement().files;

        for (var i = 0; i < files.length; i++) {
          _this.__retrieveURLAndUpload(files[i]);
        }
      }, this);
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node",
        nullable: true
      },
      studyId: {
        check: "String",
        init: "",
        nullable: true
      }
    },
    events: {
      "fileAdded": "qx.event.type.Data"
    },
    members: {
      _createChildControlImpl: function _createChildControlImpl(id) {
        var control;

        switch (id) {
          case "progressBox":
            control = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            this._addAt(control, 0);

            break;

          case "addButton":
            control = new qx.ui.toolbar.Button();

            this._add(control);

            break;
        }

        return control || qxapp.file.FilesAdd.prototype._createChildControlImpl.base.call(this, id);
      },
      // Request to the server an upload URL.
      __retrieveURLAndUpload: function __retrieveURLAndUpload(file) {
        var _this2 = this;

        var dataStore = qxapp.store.Data.getInstance();
        dataStore.addListenerOnce("presignedLink", function (e) {
          var presignedLinkData = e.getData();
          file["location"] = presignedLinkData.locationId;
          file["path"] = presignedLinkData.fileUuid;

          if (presignedLinkData.presignedLink) {
            _this2.__uploadFile(file, presignedLinkData.presignedLink.link);
          }
        }, this);
        var download = false;
        var locationId = 0;
        var studyId = this.getStudyId() || qxapp.utils.Utils.uuidv4();
        var nodeId = this.getNode() ? this.getNode().getNodeId() : qxapp.utils.Utils.uuidv4();
        var fileId = file.name;
        var fileUuid = studyId + "/" + nodeId + "/" + fileId;
        dataStore.getPresignedLink(download, locationId, fileUuid);
      },
      // Use XMLHttpRequest to upload the file to S3.
      __uploadFile: function __uploadFile(file, url) {
        var _this3 = this;

        var hBox = this._createChildControlImpl("progressBox");

        var label = new qx.ui.basic.Atom(file.name);
        var progressBar = new qxapp.ui.toolbar.ProgressBar();
        hBox.add(label);
        hBox.add(progressBar); // From https://github.com/minio/cookbook/blob/master/docs/presigned-put-upload-via-browser.md

        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (e) {
          if (e.lengthComputable) {
            var percentComplete = e.loaded / e.total * 100;
            progressBar.setValue(percentComplete);
          } else {
            console.log("Unable to compute progress information since the total size is unknown");
          }
        }, false);

        xhr.onload = function () {
          if (xhr.status == 200) {
            console.log("Uploaded", file.name);
            hBox.destroy();

            _this3.fireDataEvent("fileAdded", file);
          } else {
            console.log(xhr.response);
          }
        };

        xhr.open("PUT", url, true);
        xhr.send(file);
      }
    }
  });
  qxapp.file.FilesAdd.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=FilesAdd.js.map?dt=1568886164036