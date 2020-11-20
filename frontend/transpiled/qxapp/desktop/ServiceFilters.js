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
      "qxapp.component.filter.TextFilter": {
        "construct": true
      },
      "qxapp.utils.Utils": {
        "construct": true
      },
      "qxapp.component.filter.TagsFilter": {
        "construct": true
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
   * Widget that contains the service filters.
   */
  qx.Class.define("qxapp.desktop.ServiceFilters", {
    extend: qx.ui.core.Widget,
    construct: function construct(groupId) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.HBox());

      var textFilter = this.__textFilter = new qxapp.component.filter.TextFilter("text", groupId);
      qxapp.utils.Utils.setIdToWidget(textFilter, "serviceFiltersTextFld");
      var tagsFilter = this.__tagsFilter = new qxapp.component.filter.TagsFilter("tags", groupId);

      this._add(textFilter);

      this._add(tagsFilter);
    },
    members: {
      __textFilter: null,
      __tagsFilter: null,

      /**
       * Resets the text and active tags.
       */
      reset: function reset() {
        this.__textFilter.reset();

        this.__tagsFilter.reset();
      },
      getTextFilter: function getTextFilter() {
        return this.__textFilter;
      },
      getTagsFilter: function getTagsFilter() {
        return this.__tagsFilter;
      }
    }
  });
  qxapp.desktop.ServiceFilters.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ServiceFilters.js.map?dt=1568886162870