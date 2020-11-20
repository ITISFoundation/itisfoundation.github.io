(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.utils.Utils": {}
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
   *   Collection of methods for dealing with services data type convertions, extract
   * specific information.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let latestSrv = qxapp.utils.Services.getLatest(services, serviceKey);
   * </pre>
   */
  qx.Class.define("qxapp.utils.Services", {
    type: "static",
    statics: {
      getTypes: function getTypes() {
        return ["computational", "dynamic"];
      },
      getCategories: function getCategories() {
        return ["data", "modeling", "simulator", "solver", "postpro", "notebook"];
      },
      convertArrayToObject: function convertArrayToObject(servicesArray) {
        var services = {};

        for (var i = 0; i < servicesArray.length; i++) {
          var service = servicesArray[i];

          if (!Object.prototype.hasOwnProperty.call(services, service.key)) {
            services[service.key] = {};
          }

          if (!Object.prototype.hasOwnProperty.call(services[service.key], service.version)) {
            services[service.key][service.version] = {};
          }

          services[service.key][service.version] = service;
        }

        return services;
      },
      convertObjectToArray: function convertObjectToArray(servicesObject) {
        var services = [];

        for (var serviceKey in servicesObject) {
          var serviceVersions = servicesObject[serviceKey];

          for (var serviceVersion in serviceVersions) {
            services.push(serviceVersions[serviceVersion]);
          }
        }

        return services;
      },
      getFromObject: function getFromObject(services, key, version) {
        if (key in services) {
          var serviceVersions = services[key];

          if (version in serviceVersions) {
            return serviceVersions[version];
          }
        }

        return null;
      },
      getFromArray: function getFromArray(services, key, version) {
        for (var i = 0; i < services.length; i++) {
          if (services[i].key === key && services[i].version === version) {
            return services[i];
          }
        }

        return null;
      },
      getVersions: function getVersions(services, key) {
        var versions = [];

        if (key in services) {
          var serviceVersions = services[key];
          versions = versions.concat(Object.keys(serviceVersions));
          versions.sort(qxapp.utils.Utils.compareVersionNumbers);
        }

        return versions;
      },
      getLatest: function getLatest(services, key) {
        if (key in services) {
          var versions = qxapp.utils.Services.getVersions(services, key);
          return services[key][versions[versions.length - 1]];
        }

        return null;
      },
      isServiceInList: function isServiceInList(listOfServices, serveiceKey) {
        for (var i = 0; i < listOfServices.length; i++) {
          if (listOfServices[i].key === serveiceKey) {
            return true;
          }
        }

        return false;
      },
      filterOutUnavailableGroups: function filterOutUnavailableGroups(listOfServices) {
        var filteredServices = [];

        for (var i = 0; i < listOfServices.length; i++) {
          var service = listOfServices[i];

          if ("innerNodes" in service) {
            var allIn = true;
            var innerServices = service["innerNodes"];

            for (var innerService in innerServices) {
              allIn &= qxapp.utils.Services.isServiceInList(listOfServices, innerServices[innerService].key);
            }

            if (allIn) {
              filteredServices.push(service);
            }
          } else {
            filteredServices.push(service);
          }
        }

        return filteredServices;
      }
    }
  });
  qxapp.utils.Services.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Services.js.map?dt=1568886164887