(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qxapp.utils.Utils": {},
      "qx.event.message.Bus": {}
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
   * GUI filter controller. Stores the state of all grouped filters and dispatches it when they trigger a change.
   */
  qx.Class.define("qxapp.component.filter.UIFilterController", {
    extend: qx.core.Object,
    type: "singleton",
    construct: function construct() {
      qx.core.Object.constructor.call(this);
    },
    statics: {
      registerFilter: function registerFilter(filterId) {
        this.getInstance().registerFilter(filterId);
      },
      registerContainer: function registerContainer(containerId, container) {
        this.getInstance().registerFilterContainer(containerId, container);
      },
      resetGroup: function resetGroup(groupId) {
        this.getInstance().resetFilterGroup(groupId);
      },
      setContainerVisibility: function setContainerVisibility(containerId, visibility) {
        this.getInstance().setFilterContainerVisibility(containerId, visibility);
      }
    },
    members: {
      __state: null,
      __filters: null,
      __filterContainers: null,

      /**
       * Function called by the base filter class to register a filter when after creating it.
       *
       * @param {qxapp.component.filter.UIFilter} filter The filter to be registered.
       */
      registerFilter: function registerFilter(filter) {
        var filterId = filter.getFilterId();
        var groupId = filter.getGroupId(); // Store filter reference for managing

        this.__filters = this.__filters || {};
        this.__filters[groupId] = this.__filters[groupId] || {};
        this.__filters[groupId][filterId] = filter;
      },

      /**
       * Function that registers a filter container for changing its visibility when required.
       *
       * @param {string} containerId Given id for the container.
       * @param {qx.ui.core.Widget} container Container widget for the filters.
       */
      registerContainer: function registerContainer(containerId, container) {
        this.__filterContainers = this.__filterContainers || {};
        this.__filterContainers[containerId] = container;
      },

      /**
       * Function that calls the reset functions for all filters in a group.
       *
       * @param {string} groupId Id of the filter group to be reset.
       */
      resetGroup: function resetGroup(groupId) {
        if (this.__filters[groupId]) {
          for (var filterId in this.__filters[groupId]) {
            this.__filters[groupId][filterId].reset();
          }
        }
      },

      /**
       * Function to set the visibility of a previously registered filter container.
       *
       * @param {string} containerId Id of the container to change the visiblity.
       * @param {string} visibility New visibility setting for the container.
       */
      setContainerVisibility: function setContainerVisibility(containerId, visibility) {
        if (this.__filterContainers[containerId]) {
          this.__filterContainers[containerId].setVisibility(visibility);
        }
      },
      __getInputMessageName: function __getInputMessageName(filterId, groupId) {
        var suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "filter";
        return qxapp.utils.Utils.capitalize(filterId, groupId, suffix);
      },
      __getOutputMessageName: function __getOutputMessageName(groupId) {
        var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "filter";
        return qxapp.utils.Utils.capitalize(groupId, suffix);
      },

      /**
       * Function called when a filter state changes and it wants to publish those changes to trigger the filtering.
       *
       * @param {Object} filterData Mandatory data coming from the filter.
       * @param {String} filterData.groupId Group id of the filter that changed.
       * @param {String} filterData.filterId Filter id of the filter that changed.
       * @param {Object} filterData.data Data contained by the filter.
       */
      publish: function publish(filterData) {
        // Update state
        var groupId = filterData.groupId,
            filterId = filterData.filterId,
            data = filterData.data;
        this.__state = this.__state || {};
        this.__state[groupId] = this.__state[groupId] || {};
        this.__state[groupId][filterId] = data; // Dispatch relevant message

        qx.event.message.Bus.getInstance().dispatchByName(this.__getOutputMessageName(groupId), this.__state[groupId]);
      }
    }
  });
  qxapp.component.filter.UIFilterController.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=UIFilterController.js.map?dt=1568886160015