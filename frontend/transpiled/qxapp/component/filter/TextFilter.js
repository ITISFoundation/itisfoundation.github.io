(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.component.filter.UIFilter": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.form.TextField": {},
      "qxapp.component.form.IconButton": {}
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
   * TextField to make a simple text filter.
   */
  qx.Class.define("qxapp.component.filter.TextFilter", {
    extend: qxapp.component.filter.UIFilter,

    /**
     * Constructor for the TextFilter takes UIFilters mandatory params plus an optional translation id for its label.
     *
     * @extends qxapp.component.filter.UIFilter
     */
    construct: function construct(filterId, groupId) {
      qxapp.component.filter.UIFilter.constructor.call(this, filterId, groupId);

      this._setLayout(new qx.ui.layout.Canvas());

      this.set({
        allowStretchX: false,
        allowStretchY: false
      });
      this.__textField = this.getChildControl("textfield");
      this.getChildControl("clearbutton");

      this.__attachEventHandlers();
    },
    properties: {
      appearance: {
        refine: true,
        init: "textfilter"
      }
    },
    members: {
      __textField: null,

      /**
       * Function that resets the field and dispatches the update.
       */
      reset: function reset() {
        this.__textField.resetValue();

        this.__textField.fireDataEvent("input", "");
      },
      _createChildControlImpl: function _createChildControlImpl(id) {
        var _this = this;

        var control;

        switch (id) {
          case "textfield":
            control = new qx.ui.form.TextField().set({
              paddingRight: 15,
              placeholder: this.tr("Filter")
            });

            this._add(control);

            break;

          case "clearbutton":
            control = new qxapp.component.form.IconButton("@MaterialIcons/close/12", function () {
              _this.reset();

              _this.__textField.focus();
            });

            this._add(control, {
              right: 0,
              bottom: 6
            });

            break;
        }

        return control || qxapp.component.filter.TextFilter.prototype._createChildControlImpl.base.call(this, id);
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this2 = this;

        this.__textField.addListener("input", function (evt) {
          _this2._filterChange(evt.getData().trim().toLowerCase());
        });
      }
    }
  });
  qxapp.component.filter.TextFilter.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=TextFilter.js.map?dt=1568886159964