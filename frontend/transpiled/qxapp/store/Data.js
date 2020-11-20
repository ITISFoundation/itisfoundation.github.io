(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qxapp.io.request.ApiRequest": {},
      "qxapp.data.Permissions": {},
      "qxapp.component.message.FlashMessenger": {}
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
   * Singleton class that is used as entrypoint to the webserver.
   *
   * All data transfer communication goes through the qxapp.store.Store.
   *
   * *Example*
   *
   * Here is a little example of how to use the class.
   *
   * <pre class='javascript'>
   *    const filesStore = qxapp.store.Data.getInstance();
   *    filesStore.addListenerOnce("nodeFiles", e => {
   *      const files = e.getData();
   *      const newChildren = qxapp.data.Converters.fromDSMToVirtualTreeModel(files);
   *      this.__filesToRoot(newChildren);
   *    }, this);
   *    filesStore.getNodeFiles(nodeId);
   * </pre>
   */
  qx.Class.define("qxapp.store.Data", {
    extend: qx.core.Object,
    type: "singleton",
    construct: function construct() {
      this.resetCache();
    },
    events: {
      "myLocations": "qx.event.type.Data",
      "myDatasets": "qx.event.type.Data",
      "myDocuments": "qx.event.type.Data",
      "nodeFiles": "qx.event.type.Data",
      "fileCopied": "qx.event.type.Data",
      "deleteFile": "qx.event.type.Data"
    },
    members: {
      __locationsCached: null,
      __datasetsByLocationCached: null,
      __filesByLocationAndDatasetCached: null,
      resetCache: function resetCache() {
        this.__locationsCached = [];
        this.__datasetsByLocationCached = {};
        this.__filesByLocationAndDatasetCached = {};
      },
      getLocationsCached: function getLocationsCached() {
        var cache = this.__locationsCached;

        if (cache.length) {
          return cache;
        }

        return null;
      },
      getLocations: function getLocations() {
        var _this = this;

        // Get available storage locations
        var cachedData = this.getLocationsCached();

        if (cachedData) {
          this.fireDataEvent("myLocations", cachedData);
          return;
        }

        var reqLoc = new qxapp.io.request.ApiRequest("/storage/locations", "GET");
        reqLoc.addListener("success", function (eLoc) {
          var locations = eLoc.getTarget().getResponse().data; // Add it to cache

          _this.__locationsCached = locations;

          _this.fireDataEvent("myLocations", locations);
        }, this);
        reqLoc.addListener("fail", function (e) {
          var _e$getTarget$getRespo = e.getTarget().getResponse(),
              error = _e$getTarget$getRespo.error;

          _this.fireDataEvent("myLocations", []);

          console.error("Failed getting Storage Locations", error);
        });
        reqLoc.send();
      },
      getDatasetsByLocationCached: function getDatasetsByLocationCached(locationId) {
        var cache = this.__datasetsByLocationCached;

        if (locationId in cache && cache[locationId].length) {
          var data = {
            location: locationId,
            datasets: cache[locationId]
          };
          return data;
        }

        return null;
      },
      getDatasetsByLocation: function getDatasetsByLocation(locationId) {
        var _this2 = this;

        // Get list of datasets
        if (locationId === 1 && !qxapp.data.Permissions.getInstance().canDo("storage.datcore.read")) {
          return;
        }

        var cachedData = this.getDatasetsByLocationCached(locationId);

        if (cachedData) {
          this.fireDataEvent("myDatasets", cachedData);
          return;
        }

        var endPoint = "/storage/locations/" + locationId + "/datasets";
        var reqDatasets = new qxapp.io.request.ApiRequest(endPoint, "GET");
        reqDatasets.addListener("success", function (eFiles) {
          var datasets = eFiles.getTarget().getResponse().data;
          var data = {
            location: locationId,
            datasets: []
          };

          if (datasets && datasets.length > 0) {
            data.datasets = datasets;
          } // Add it to cache


          _this2.__datasetsByLocationCached[locationId] = data.datasets;

          _this2.fireDataEvent("myDatasets", data);
        }, this);
        reqDatasets.addListener("fail", function (e) {
          var _e$getTarget$getRespo2 = e.getTarget().getResponse(),
              error = _e$getTarget$getRespo2.error;

          var data = {
            location: locationId,
            datasets: []
          };

          _this2.fireDataEvent("myDatasets", data);

          console.error("Failed getting Datasets list", error);
        });
        reqDatasets.send();
      },
      getFilesByLocationAndDatasetCached: function getFilesByLocationAndDatasetCached(locationId, datasetId) {
        var cache = this.__filesByLocationAndDatasetCached;

        if (locationId in cache && datasetId in cache[locationId] && cache[locationId][datasetId].length) {
          var data = {
            location: locationId,
            dataset: datasetId,
            files: cache[locationId][datasetId]
          };
          return data;
        }

        return null;
      },
      getFilesByLocationAndDataset: function getFilesByLocationAndDataset(locationId, datasetId) {
        var _this3 = this;

        // Get list of file meta data
        if (locationId === 1 && !qxapp.data.Permissions.getInstance().canDo("storage.datcore.read")) {
          return;
        }

        var cachedData = this.getFilesByLocationAndDatasetCached(locationId, datasetId);

        if (cachedData) {
          this.fireDataEvent("myDocuments", cachedData);
          return;
        }

        var endPoint = "/storage/locations/" + locationId + "/datasets/" + datasetId + "/metadata";
        var reqFiles = new qxapp.io.request.ApiRequest(endPoint, "GET");
        reqFiles.addListener("success", function (eFiles) {
          var files = eFiles.getTarget().getResponse().data;
          var data = {
            location: locationId,
            dataset: datasetId,
            files: files && files.length > 0 ? files : []
          }; // Add it to cache

          if (!(locationId in _this3.__filesByLocationAndDatasetCached)) {
            _this3.__filesByLocationAndDatasetCached[locationId] = {};
          }

          _this3.__filesByLocationAndDatasetCached[locationId][datasetId] = data.files;

          _this3.fireDataEvent("myDocuments", data);
        }, this);
        reqFiles.addListener("fail", function (e) {
          var _e$getTarget$getRespo3 = e.getTarget().getResponse(),
              error = _e$getTarget$getRespo3.error;

          var data = {
            location: locationId,
            dataset: datasetId,
            files: []
          };

          _this3.fireDataEvent("myDocuments", data);

          console.error("Failed getting Files list", error);
        });
        reqFiles.send();
      },
      getNodeFiles: function getNodeFiles(nodeId) {
        var _this4 = this;

        var filter = "?uuid_filter=" + encodeURIComponent(nodeId);
        var endPoint = "/storage/locations/0/files/metadata";
        endPoint += filter;
        var reqFiles = new qxapp.io.request.ApiRequest(endPoint, "GET");
        reqFiles.addListener("success", function (eFiles) {
          var files = eFiles.getTarget().getResponse().data;
          console.log("Node Files", files);

          if (files && files.length > 0) {
            _this4.fireDataEvent("nodeFiles", files);
          }

          _this4.fireDataEvent("nodeFiles", []);
        }, this);
        reqFiles.addListener("fail", function (e) {
          var _e$getTarget$getRespo4 = e.getTarget().getResponse(),
              error = _e$getTarget$getRespo4.error;

          _this4.fireDataEvent("nodeFiles", []);

          console.error("Failed getting Node Files list", error);
        });
        reqFiles.send();
      },
      getPresignedLink: function getPresignedLink() {
        var _this5 = this;

        var download = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var locationId = arguments.length > 1 ? arguments[1] : undefined;
        var fileUuid = arguments.length > 2 ? arguments[2] : undefined;

        if (download && !qxapp.data.Permissions.getInstance().canDo("study.node.data.pull", true)) {
          return;
        }

        if (!download && !qxapp.data.Permissions.getInstance().canDo("study.node.data.push", true)) {
          return;
        } // GET: Returns download link for requested file
        // POST: Returns upload link or performs copy operation to datcore


        var res = encodeURIComponent(fileUuid);
        var endPoint = "/storage/locations/" + locationId + "/files/" + res; // const endPoint = "/storage/locations/" + locationId + "/files/" + fileUuid;

        var method = download ? "GET" : "PUT";
        var req = new qxapp.io.request.ApiRequest(endPoint, method);
        req.addListener("success", function (e) {
          var _e$getTarget$getRespo5 = e.getTarget().getResponse(),
              data = _e$getTarget$getRespo5.data;

          var presignedLinkData = {
            presignedLink: data,
            locationId: locationId,
            fileUuid: fileUuid
          };
          console.log("presignedLink", presignedLinkData);

          _this5.fireDataEvent("presignedLink", presignedLinkData);
        }, this);
        req.addListener("fail", function (e) {
          var _e$getTarget$getRespo6 = e.getTarget().getResponse(),
              error = _e$getTarget$getRespo6.error;

          console.error("Failed getting Presigned Link", error);
        });
        req.send();
      },
      copyFile: function copyFile(fromLoc, fileUuid, toLoc, pathId) {
        var _this6 = this;

        if (!qxapp.data.Permissions.getInstance().canDo("study.node.data.push", true)) {
          return false;
        } // "/v0/locations/1/files/{}?user_id={}&extra_location={}&extra_source={}".format(quote(datcore_uuid, safe=''),


        var fileName = fileUuid.split("/");
        fileName = fileName[fileName.length - 1];
        var endPoint = "/storage/locations/" + toLoc + "/files/";
        var parameters = encodeURIComponent(pathId + "/" + fileName);
        parameters += "?extra_location=";
        parameters += fromLoc;
        parameters += "&extra_source=";
        parameters += encodeURIComponent(fileUuid);
        endPoint += parameters;
        var req = new qxapp.io.request.ApiRequest(endPoint, "PUT");
        req.addListener("success", function (e) {
          var data = {
            data: e.getTarget().getResponse(),
            locationId: toLoc,
            fileUuid: pathId + "/" + fileName
          };

          _this6.fireDataEvent("fileCopied", data);
        }, this);
        req.addListener("fail", function (e) {
          var _e$getTarget$getRespo7 = e.getTarget().getResponse(),
              error = _e$getTarget$getRespo7.error;

          console.error(error);
          console.error("Failed copying file", fileUuid, "to", pathId);
          qxapp.component.message.FlashMessenger.getInstance().logAs(_this6.tr("Failed copying file"), "ERROR");

          _this6.fireDataEvent("fileCopied", null);
        });
        req.send();
        return true;
      },
      deleteFile: function deleteFile(locationId, fileUuid) {
        var _this7 = this;

        if (!qxapp.data.Permissions.getInstance().canDo("study.node.data.delete", true)) {
          return false;
        } // Deletes File


        var parameters = encodeURIComponent(fileUuid);
        var endPoint = "/storage/locations/" + locationId + "/files/" + parameters;
        var req = new qxapp.io.request.ApiRequest(endPoint, "DELETE");
        req.addListener("success", function (e) {
          var data = {
            data: e.getTarget().getResponse(),
            locationId: locationId,
            fileUuid: fileUuid
          };

          _this7.fireDataEvent("deleteFile", data);
        }, this);
        req.addListener("fail", function (e) {
          var _e$getTarget$getRespo8 = e.getTarget().getResponse(),
              error = _e$getTarget$getRespo8.error;

          console.error("Failed deleting file", error);
          qxapp.component.message.FlashMessenger.getInstance().logAs(_this7.tr("Failed deleting file"), "ERROR");

          _this7.fireDataEvent("deleteFile", null);
        });
        req.send();
        return true;
      }
    }
  });
  qxapp.store.Data.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Data.js.map?dt=1568886164347