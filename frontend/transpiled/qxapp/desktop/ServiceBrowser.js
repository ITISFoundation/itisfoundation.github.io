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
      "qxapp.utils.Utils": {
        "construct": true
      },
      "qx.event.Timer": {
        "construct": true
      },
      "qxapp.store.Store": {},
      "qxapp.desktop.ServiceFilters": {},
      "qx.ui.form.List": {},
      "qxapp.utils.Services": {},
      "qx.data.Array": {},
      "qx.data.marshal.Json": {},
      "qx.data.controller.List": {},
      "qxapp.desktop.ServiceBrowserListItem": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.VBox": {},
      "qx.ui.basic.Label": {},
      "qx.bom.Font": {},
      "qxapp.theme.Font": {},
      "qx.ui.basic.Atom": {},
      "qx.ui.form.SelectBox": {},
      "qx.ui.container.Scroll": {},
      "qxapp.component.filter.UIFilterController": {},
      "qx.ui.form.ListItem": {},
      "qxapp.component.metadata.ServiceInfo": {},
      "qx.io.request.Xhr": {},
      "qxapp.wrapper.Ajv": {}
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
   * Widget that shows all the information available regarding services.
   *
   * It has three main focuses:
   * - Services list (ServiceBrowserListItem) on the left side with some filter
   *   - Filter as you type
   *   - Filter by service type
   *   - Filter by service type
   * - List of versions of the selected service
   * - Description of the selected service using JsonTreeWidget
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let servicesView = this.__serviceBrowser = new qxapp.desktop.ServiceBrowser();
   *   this.getRoot().add(servicesView);
   * </pre>
   */
  qx.Class.define("qxapp.desktop.ServiceBrowser", {
    extend: qx.ui.core.Widget,
    construct: function construct() {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.HBox(10));

      var iframe = qxapp.utils.Utils.createLoadingIFrame(this.tr("Services"));

      this._add(iframe, {
        flex: 1
      });

      var interval = 1000;
      var userTimer = new qx.event.Timer(interval);
      userTimer.addListener("interval", function () {
        if (_this.__servicesReady) {
          userTimer.stop();

          _this._removeAll();

          iframe.dispose();

          _this.__createServicesLayout();

          _this.__attachEventHandlers();
        }
      }, this);
      userTimer.start();

      this.__initResources();
    },
    members: {
      __servicesReady: null,
      __serviceFilters: null,
      __allServices: null,
      __servicesList: null,
      __versionsList: null,
      __searchTextfield: null,

      /**
       * Function that resets the selected item by reseting the filters and the service selection
       */
      resetSelection: function resetSelection() {
        if (this.__serviceFilters) {
          this.__serviceFilters.reset();
        }

        if (this.__servicesList) {
          this.__servicesList.setSelection([]);
        }
      },
      __initResources: function __initResources() {
        this.__getServicesPreload();
      },
      __getServicesPreload: function __getServicesPreload() {
        var _this2 = this;

        var store = qxapp.store.Store.getInstance();
        store.addListener("servicesRegistered", function (e) {
          // Do not validate if are not taking actions
          // this.__nodeCheck(e.getData());
          _this2.__servicesReady = e.getData();
        }, this);
        store.getServices(true);
      },
      __createServicesLayout: function __createServicesLayout() {
        var servicesList = this.__createServicesListLayout();

        this._add(servicesList);

        var serviceDescription = this.__createServiceDescriptionLayout();

        this._add(serviceDescription, {
          flex: 1
        });
      },
      __createServicesListLayout: function __createServicesListLayout() {
        var _this3 = this;

        var servicesLayout = this.__createVBoxWLabel(this.tr("Services"));

        var serviceFilters = this.__serviceFilters = new qxapp.desktop.ServiceFilters("serviceBrowser");
        servicesLayout.add(serviceFilters);
        var servicesList = this.__servicesList = new qx.ui.form.List().set({
          orientation: "vertical",
          minWidth: 400,
          appearance: "pb-list"
        });
        servicesList.addListener("changeSelection", function (e) {
          if (e.getData() && e.getData().length > 0) {
            var selectedKey = e.getData()[0].getModel();

            _this3.__serviceSelected(selectedKey);
          }
        }, this);
        var store = qxapp.store.Store.getInstance();
        var latestServices = [];
        var services = this.__allServices = store.getServices();

        for (var serviceKey in services) {
          latestServices.push(qxapp.utils.Services.getLatest(services, serviceKey));
        }

        var latestServicesModel = new qx.data.Array(latestServices.map(function (s) {
          return qx.data.marshal.Json.createModel(s);
        }));
        var servCtrl = new qx.data.controller.List(latestServicesModel, servicesList, "name");
        servCtrl.setDelegate({
          createItem: function createItem() {
            var item = new qxapp.desktop.ServiceBrowserListItem();
            item.subscribeToFilterGroup("serviceBrowser");
            item.addListener("tap", function (e) {
              servicesList.setSelection([item]);
            });
            return item;
          },
          bindItem: function bindItem(ctrl, item, id) {
            ctrl.bindProperty("key", "model", null, item, id);
            ctrl.bindProperty("key", "key", null, item, id);
            ctrl.bindProperty("name", "title", null, item, id);
            ctrl.bindProperty("description", "description", null, item, id);
            ctrl.bindProperty("type", "type", null, item, id);
            ctrl.bindProperty("category", "category", null, item, id);
            ctrl.bindProperty("contact", "contact", null, item, id);
          }
        });
        servicesLayout.add(servicesList, {
          flex: 1
        }); // Workaround to the list.changeSelection

        servCtrl.addListener("changeValue", function (e) {
          if (e.getData() && e.getData().length > 0) {
            var selectedService = e.getData().toArray()[0];

            _this3.__serviceSelected(selectedService);
          } else {
            _this3.__serviceSelected(null);
          }
        }, this);
        return servicesLayout;
      },
      __createServiceDescriptionLayout: function __createServiceDescriptionLayout() {
        var _this4 = this;

        var descriptionView = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)).set({
          marginTop: 20
        });
        var titleContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
        var label = new qx.ui.basic.Label(this.tr("Description")).set({
          font: qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["nav-bar-label"]),
          minWidth: 150
        });
        titleContainer.add(label);
        titleContainer.add(new qx.ui.basic.Atom(this.tr("Version")));
        var versions = this.__versionsList = new qx.ui.form.SelectBox();
        qxapp.utils.Utils.setIdToWidget(versions, "serviceBrowserVersionsDrpDwn");
        titleContainer.add(versions);
        versions.addListener("changeSelection", function (e) {
          if (e.getData() && e.getData().length) {
            _this4.__versionSelected(e.getData()[0].getLabel());
          }
        }, this);
        descriptionView.add(titleContainer);
        var descriptionContainer = this.__serviceDescription = new qx.ui.container.Scroll();
        descriptionView.add(descriptionContainer, {
          flex: 1
        });
        return descriptionView;
      },
      __createVBoxWLabel: function __createVBoxWLabel(text) {
        var vBoxLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)).set({
          marginTop: 20
        });
        var label = new qx.ui.basic.Label(text).set({
          font: qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["nav-bar-label"]),
          minWidth: 150
        });
        vBoxLayout.add(label);
        return vBoxLayout;
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this5 = this;

        var textfield = this.__serviceFilters.getTextFilter().getChildControl("textfield", true);

        textfield.addListener("appear", function () {
          qxapp.component.filter.UIFilterController.getInstance().resetGroup("serviceCatalog");
          textfield.focus();
        }, this);
        textfield.addListener("keypress", function (e) {
          if (e.getKeyIdentifier() === "Enter") {
            var selectables = _this5.__servicesList.getSelectables();

            if (selectables) {
              _this5.__servicesList.setSelection([selectables[0]]);
            }
          }
        }, this);
      },
      __serviceSelected: function __serviceSelected(serviceKey) {
        if (this.__versionsList) {
          var versionsList = this.__versionsList;
          versionsList.removeAll();

          if (serviceKey in this.__allServices) {
            var versions = qxapp.utils.Services.getVersions(this.__allServices, serviceKey);

            if (versions) {
              var lastItem = null;
              versions.forEach(function (version) {
                lastItem = new qx.ui.form.ListItem(version);
                versionsList.add(lastItem);
              });

              if (lastItem) {
                versionsList.setSelection([lastItem]);

                this.__versionSelected(lastItem.getLabel());
              }
            }
          } else {
            this.__updateServiceDescription(null);
          }
        }
      },
      __versionSelected: function __versionSelected(versionKey) {
        var serviceSelection = this.__servicesList.getSelection();

        if (serviceSelection.length > 0) {
          var serviceKey = serviceSelection[0].getModel();
          var selectedService = qxapp.utils.Services.getFromObject(this.__allServices, serviceKey, versionKey);

          this.__updateServiceDescription(selectedService);
        }
      },
      __updateServiceDescription: function __updateServiceDescription(selectedService) {
        var serviceDescription = this.__serviceDescription;

        if (serviceDescription) {
          if (selectedService) {
            var serviceInfo = new qxapp.component.metadata.ServiceInfo(selectedService);
            serviceDescription.add(serviceInfo);
          } else {
            serviceDescription.add(null);
          }
        }
      },
      __nodeCheck: function __nodeCheck(services) {
        /** a little ajv test */
        var nodeCheck = new qx.io.request.Xhr("/resource/qxapp/node-meta-v0.0.1.json");
        nodeCheck.addListener("success", function (e) {
          var data = e.getTarget().getResponse();

          try {
            var ajv = new qxapp.wrapper.Ajv(data);

            for (var srvId in services) {
              var service = services[srvId];
              var check = ajv.validate(service);
              console.log("services validation result " + service.key + ":", check);
            }
          } catch (err) {
            console.error(err);
          }
        }, this);
        nodeCheck.send();
      }
    }
  });
  qxapp.desktop.ServiceBrowser.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ServiceBrowser.js.map?dt=1568886162833