(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.Composite": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.ToggleButton": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /*
   * oSPARC - The SIMCORE frontend - https://osparc.io
   * Copyright: 2019 IT'IS Foundation - https://itis.swiss
   * License: MIT - https://opensource.org/licenses/MIT
   * Authors: Ignacio Pascual (ignapas)
   */

  /**
   * Container for StudyBrowserListItems or any other ToggleButtons, with some convenient methods.
   */
  qx.Class.define("qxapp.component.form.ToggleButtonContainer", {
    extend: qx.ui.container.Composite,
    construct: function construct(layout) {
      qx.ui.container.Composite.constructor.call(this, layout);
    },
    events: {
      changeSelection: "qx.event.type.Data"
    },
    members: {
      // overriden
      add: function add(child, options) {
        var _this = this;

        if (child instanceof qx.ui.form.ToggleButton) {
          qxapp.component.form.ToggleButtonContainer.prototype.add.base.call(this, child, options);
          child.addListener("changeValue", function (e) {
            _this.fireDataEvent("changeSelection", _this.getSelection());
          }, this);
        } else {
          console.error("ToggleButtonContainer only allows ToggleButton as its children.");
        }
      },

      /**
       * Resets the selection so no toggle button is checked.
       */
      resetSelection: function resetSelection() {
        this.getChildren().map(function (button) {
          return button.setValue(false);
        });
      },

      /**
       * Returns an array that contains all buttons that are checked.
       */
      getSelection: function getSelection() {
        return this.getChildren().filter(function (button) {
          return button.getValue();
        });
      },

      /**
       * Sets the given button's value to true (checks it) and unchecks all other buttons. If the given button is not present,
       * every button in the container will get a false value (unchecked).
       * @param {qx.ui.form.ToggleButton} child Button that will be checked
       */
      selectOne: function selectOne(child) {
        this.getChildren().map(function (button) {
          return button.setValue(button === child);
        });
      }
    }
  });
  qxapp.component.form.ToggleButtonContainer.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ToggleButtonContainer.js.map?dt=1568886160301