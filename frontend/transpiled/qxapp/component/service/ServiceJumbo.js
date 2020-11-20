(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.ui.form.Jumbo": {
        "construct": true,
        "require": true
      },
      "qxapp.component.filter.MFilterable": {
        "require": true
      },
      "qxapp.component.filter.IFilterable": {
        "require": true
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
       * Ignacio Pascual (ignapas)
  
  ************************************************************************ */

  /**
   * Big button representing a service. It shows it name, description and contact information. It also adds
   * filtering capabilities.
   */
  qx.Class.define("qxapp.component.service.ServiceJumbo", {
    extend: qxapp.ui.form.Jumbo,
    include: qxapp.component.filter.MFilterable,
    implement: qxapp.component.filter.IFilterable,

    /**
     * Constructor
     */
    construct: function construct(serviceModel, icon) {
      qxapp.ui.form.Jumbo.constructor.call(this, serviceModel.getName(), serviceModel.getDescription(), icon, serviceModel.getContact());

      if (serviceModel != null) {
        // eslint-disable-line no-eq-null
        this.setServiceModel(serviceModel);
      }
    },
    properties: {
      serviceModel: {}
    },
    members: {
      _filter: function _filter() {
        this.exclude();
      },
      _unfilter: function _unfilter() {
        this.show();
      },
      _shouldApplyFilter: function _shouldApplyFilter(data) {
        if (data.text) {
          var label = this.getServiceModel().getName().trim().toLowerCase();

          if (label.indexOf(data.text) === -1) {
            return true;
          }
        }

        if (data.tags && data.tags.length) {
          var category = this.getServiceModel().getCategory() || "";
          var type = this.getServiceModel().getType() || "";

          if (!data.tags.includes(category.trim().toLowerCase()) && !data.tags.includes(type.trim().toLowerCase())) {
            return true;
          }
        }

        return false;
      },
      _shouldReactToFilter: function _shouldReactToFilter(data) {
        if (data.text && data.text.length > 1) {
          return true;
        }

        if (data.tags && data.tags.length) {
          return true;
        }

        return false;
      }
    }
  });
  qxapp.component.service.ServiceJumbo.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ServiceJumbo.js.map?dt=1568886160807