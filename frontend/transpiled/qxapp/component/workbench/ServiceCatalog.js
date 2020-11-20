(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.Window": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.toolbar.ToolBar": {},
      "qx.ui.toolbar.Part": {},
      "qxapp.desktop.ServiceFilters": {},
      "qx.ui.form.CheckBox": {},
      "qxapp.data.Permissions": {},
      "qx.ui.toolbar.Button": {},
      "qxapp.component.service.ServiceList": {},
      "qx.ui.container.Scroll": {},
      "qx.ui.basic.Atom": {},
      "qxapp.ui.toolbar.SelectBox": {},
      "qxapp.store.Store": {},
      "qxapp.utils.Services": {},
      "qx.data.marshal.Json": {},
      "qx.data.Array": {},
      "qx.ui.form.ListItem": {},
      "qxapp.component.metadata.ServiceInfoWindow": {},
      "qxapp.component.filter.UIFilterController": {}
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
   *   Window that shows a list of filter as you type services. For the selected service, below the list
   * a dropdown menu is populated with al the available versions of the selection (by default latest
   * is selected).
   *
   *   When the user really selects the service an "addService" data event is fired.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let srvCat = new qxapp.component.workbench.ServiceCatalog();
   *   srvCat.center();
   *   srvCat.open();
   * </pre>
   */
  qx.Class.define("qxapp.component.workbench.ServiceCatalog", {
    extend: qx.ui.window.Window,
    construct: function construct() {
      qx.ui.window.Window.constructor.call(this);
      this.set({
        showMinimize: false,
        minWidth: 400,
        minHeight: 400,
        modal: true,
        caption: this.tr("Service catalog"),
        appearance: "service-window",
        contentPadding: 0
      });
      var catalogLayout = new qx.ui.layout.VBox();
      this.setLayout(catalogLayout);

      var filterLayout = this.__createFilterLayout();

      this.add(filterLayout);

      var list = this.__createListLayout();

      this.add(list, {
        flex: 1
      });

      var btnLayout = this.__createButtonsLayout();

      this.add(btnLayout);

      this.__createEvents();

      this.__populateList();

      this.__attachEventHandlers();
    },
    events: {
      "addService": "qx.event.type.Data"
    },
    statics: {
      LATEST: "latest"
    },
    members: {
      __allServicesList: null,
      __allServicesObj: null,
      __textfield: null,
      __showAll: null,
      __contextNodeId: null,
      __contextPort: null,
      __versionsBox: null,
      __infoBtn: null,
      __serviceBrowser: null,
      __addBtn: null,
      __createFilterLayout: function __createFilterLayout() {
        var _this = this;

        var toolbar = new qx.ui.toolbar.ToolBar();
        var filterPart = new qx.ui.toolbar.Part().set({
          spacing: 10
        });
        var filters = new qxapp.desktop.ServiceFilters("serviceCatalog");
        this.__textfield = filters.getTextFilter().getChildControl("textfield", true);
        filterPart.add(filters);
        var showAllCheckbox = this.__showAll = new qx.ui.form.CheckBox(this.tr("Show all"));
        showAllCheckbox.set({
          value: false,
          // FIXME: Backend should do the filtering
          visibility: qxapp.data.Permissions.getInstance().canDo("test") ? "visible" : "excluded"
        });
        showAllCheckbox.addListener("changeValue", function (e) {
          _this.__updateList();
        }, this);
        filterPart.add(showAllCheckbox);
        toolbar.add(filterPart);
        toolbar.addSpacer();
        var controlsPart = new qx.ui.toolbar.Part(); // buttons for reloading services (is this necessary?)

        var reloadBtn = new qx.ui.toolbar.Button(this.tr("Reload"), "@FontAwesome5Solid/sync-alt/16");
        reloadBtn.addListener("execute", function () {
          return _this.__populateList(true);
        }, this);
        controlsPart.add(reloadBtn);
        toolbar.add(controlsPart);
        return toolbar;
      },
      __createListLayout: function __createListLayout() {
        var _this2 = this;

        // Services list
        this.__allServicesList = [];
        this.__allServicesObj = {};
        var services = this.__serviceBrowser = new qxapp.component.service.ServiceList("serviceCatalog").set({
          width: 568
        });
        var scrolledServices = new qx.ui.container.Scroll().set({
          height: 260
        });
        scrolledServices.add(services);

        this.__serviceBrowser.addListener("changeValue", function (e) {
          if (e.getData() && e.getData().getServiceModel()) {
            var selectedService = e.getData().getServiceModel();

            _this2.__changedSelection(selectedService.getKey());
          } else {
            _this2.__changedSelection(null);
          }
        }, this);

        return scrolledServices;
      },
      __createButtonsLayout: function __createButtonsLayout() {
        var _this3 = this;

        var toolbar = new qx.ui.toolbar.ToolBar();
        var infoPart = new qx.ui.toolbar.Part();
        var versionLabel = new qx.ui.basic.Atom(this.tr("Version"));
        infoPart.add(versionLabel);
        var selectBox = this.__versionsBox = new qxapp.ui.toolbar.SelectBox().set({
          enabled: false
        });
        infoPart.add(selectBox);
        var infoBtn = this.__infoBtn = new qx.ui.toolbar.Button(null, "@FontAwesome5Solid/info-circle/16").set({
          enabled: false
        });
        infoBtn.addListener("execute", function () {
          this.__showServiceInfo();
        }, this);
        infoPart.add(infoBtn);
        toolbar.add(infoPart);
        toolbar.addSpacer();
        var buttonsPart = new qx.ui.toolbar.Part();
        var addBtn = this.__addBtn = new qx.ui.toolbar.Button("Add").set({
          enabled: false
        });
        addBtn.addListener("execute", function () {
          return _this3.__onAddService();
        }, this);
        addBtn.setAllowGrowX(false);
        buttonsPart.add(addBtn);
        var cancelBtn = new qx.ui.toolbar.Button("Cancel");
        cancelBtn.addListener("execute", this.__onCancel, this);
        cancelBtn.setAllowGrowX(false);
        buttonsPart.add(cancelBtn);
        toolbar.add(buttonsPart);
        return toolbar;
      },
      __createEvents: function __createEvents() {
        var _this4 = this;

        this.__serviceBrowser.addListener("serviceadd", function (e) {
          _this4.__onAddService(e.getData());
        }, this);
      },
      setContext: function setContext(nodeId, port) {
        this.__contextNodeId = nodeId;
        this.__contextPort = port;

        this.__updateList();
      },
      __populateList: function __populateList() {
        var _this5 = this;

        var reload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this.__allServicesList = [];
        var store = qxapp.store.Store.getInstance();
        var services = store.getServices(reload);

        if (services === null) {
          store.addListener("servicesRegistered", function (e) {
            var data = e.getData();

            _this5.__addNewData(data["services"]);
          }, this);
        } else {
          this.__addNewData(services);
        }
      },
      __addNewData: function __addNewData(newData) {
        this.__allServicesList = qxapp.utils.Services.convertObjectToArray(newData);

        this.__updateList(this.__allServicesList);
      },
      __updateList: function __updateList() {
        var filteredServices = [];

        for (var i = 0; i < this.__allServicesList.length; i++) {
          var service = this.__allServicesList[i];

          if (this.__showAll.getValue() || !service.key.includes("demodec")) {
            filteredServices.push(service);
          }
        }

        var groupedServices = this.__allServicesObj = qxapp.utils.Services.convertArrayToObject(filteredServices);
        var groupedServicesList = [];

        for (var serviceKey in groupedServices) {
          var _service = qxapp.utils.Services.getLatest(groupedServices, serviceKey);

          var _newModel = qx.data.marshal.Json.createModel(_service);

          groupedServicesList.push(_newModel);
        }

        var newModel = new qx.data.Array(groupedServicesList);

        this.__serviceBrowser.setModel(newModel);
      },
      __changedSelection: function __changedSelection(serviceKey) {
        if (this.__versionsBox) {
          var selectBox = this.__versionsBox;
          selectBox.removeAll();

          if (serviceKey in this.__allServicesObj) {
            var versions = qxapp.utils.Services.getVersions(this.__allServicesObj, serviceKey);
            var latest = new qx.ui.form.ListItem(qxapp.component.workbench.ServiceCatalog.LATEST);
            selectBox.add(latest);

            for (var i = versions.length; i--;) {
              selectBox.add(new qx.ui.form.ListItem(versions[i]));
            }

            selectBox.setSelection([latest]);
          }
        }

        if (this.__addBtn) {
          this.__addBtn.setEnabled(serviceKey !== null);
        }

        if (this.__infoBtn) {
          this.__infoBtn.setEnabled(serviceKey !== null);
        }

        if (this.__versionsBox) {
          this.__versionsBox.setEnabled(serviceKey !== null);
        }
      },
      __onAddService: function __onAddService(model) {
        if (model == null && this.__serviceBrowser.isSelectionEmpty()) {
          // eslint-disable-line no-eq-null
          return;
        }

        var service = model || this.__getSelectedService();

        if (service) {
          var serviceModel = qx.data.marshal.Json.createModel(service);
          var eData = {
            service: serviceModel,
            contextNodeId: this.__contextNodeId,
            contextPort: this.__contextPort
          };
          this.fireDataEvent("addService", eData);
        }

        this.close();
      },
      __getSelectedService: function __getSelectedService() {
        var selected = this.__serviceBrowser.getSelected();

        var serviceKey = selected.getKey();

        var serviceVersion = this.__versionsBox.getSelection()[0].getLabel().toString();

        if (serviceVersion == qxapp.component.workbench.ServiceCatalog.LATEST.toString()) {
          serviceVersion = this.__versionsBox.getChildrenContainer().getSelectables()[1].getLabel();
        }

        return qxapp.utils.Services.getFromArray(this.__allServicesList, serviceKey, serviceVersion);
      },
      __showServiceInfo: function __showServiceInfo() {
        var win = new qxapp.component.metadata.ServiceInfoWindow(this.__getSelectedService());
        win.center();
        win.open();
      },
      __onCancel: function __onCancel() {
        this.close();
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this6 = this;

        this.addListener("appear", function () {
          qxapp.component.filter.UIFilterController.getInstance().resetGroup("serviceCatalog");

          _this6.__textfield.focus();
        }, this);

        this.__textfield.addListener("keypress", function (e) {
          if (e.getKeyIdentifier() === "Enter") {
            _this6.__serviceBrowser.selectFirstVisible();

            var selected = _this6.__serviceBrowser.getSelected();

            if (selected !== null) {
              _this6.__onAddService(selected);
            }
          }
        }, this);
      }
    }
  });
  qxapp.component.workbench.ServiceCatalog.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ServiceCatalog.js.map?dt=1568886161875