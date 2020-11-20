(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "osparc.vcsOriginUrl": {},
        "osparc.vcsRef": {},
        "osparc.vcsRefClient": {},
        "osparc.vcsStatusClient": {},
        "qx.libraryInfoMap": {}
      }
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
  qx.Class.define("qxapp.utils.LibVersions", {
    type: "static",
    statics: {
      __getRemoteUrl: function __getRemoteUrl() {
        var remoteUrl = qx.core.Environment.get("osparc.vcsOriginUrl");

        if (remoteUrl) {
          remoteUrl = remoteUrl.replace("git@github.com:", "https://github.com/");
          remoteUrl = remoteUrl.replace(".git", "");
        } else {
          remoteUrl = "https://github.com/ITISFoundation/osparc-simcore";
        }

        return remoteUrl;
      },
      getPlatformVersion: function getPlatformVersion() {
        var name = "osparc-simcore";
        var commitId = qx.core.Environment.get("osparc.vcsRef");

        var remoteUrl = qxapp.utils.LibVersions.__getRemoteUrl(); // eslint-disable-line no-underscore-dangle


        var url = remoteUrl;

        if (commitId) {
          url = remoteUrl + "/tree/" + String(commitId) + "/";
        }

        return {
          name: name,
          version: commitId,
          url: url
        };
      },
      getUIVersion: function getUIVersion() {
        var name = "osparc-simcore UI";
        var commitId = qx.core.Environment.get("osparc.vcsRefClient");

        var remoteUrl = qxapp.utils.LibVersions.__getRemoteUrl(); // eslint-disable-line no-underscore-dangle


        var url = remoteUrl;

        if (commitId) {
          url = remoteUrl + "/tree/" + String(commitId) + "/services/web/client/";
        }

        var status = qx.core.Environment.get("osparc.vcsStatusClient");

        if (status) {
          name = name + " [" + status + "]";
        }

        return {
          name: name,
          version: commitId,
          url: url
        };
      },
      getQxCompiler: function getQxCompiler() {
        return {
          name: "qooxdoo-compiler",
          version: "1.0.0-beta.20190807-0955",
          url: "https://github.com/qooxdoo/qooxdoo-compiler"
        };
      },
      getQxLibraryInfoMap: function getQxLibraryInfoMap() {
        var libs = [];
        var libInfo = qx.core.Environment.get("qx.libraryInfoMap");

        if (libInfo) {
          for (var key in libInfo) {
            var lib = libInfo[key];
            libs.push({
              name: lib.name,
              version: lib.version,
              url: lib.homepage
            });
          }
        }

        return libs;
      },
      get3rdPartyLibs: function get3rdPartyLibs() {
        var libs = [];
        Object.keys(qxapp.wrapper).forEach(function (className) {
          var wrapper = qxapp.wrapper[className];
          libs.push({
            name: wrapper.NAME,
            version: wrapper.VERSION,
            url: wrapper.URL
          });
        });
        return libs;
      },
      getEnvLibs: function getEnvLibs() {
        var _this = this;

        var libs = [];
        [qxapp.utils.LibVersions.getPlatformVersion, qxapp.utils.LibVersions.getUIVersion, qxapp.utils.LibVersions.getQxCompiler, qxapp.utils.LibVersions.getQxLibraryInfoMap, qxapp.utils.LibVersions.get3rdPartyLibs].forEach(function (lib) {
          libs = libs.concat(lib.call(_this));
        }, this);
        return libs;
      }
    }
  });
  qxapp.utils.LibVersions.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=LibVersions.js.map?dt=1568886164869