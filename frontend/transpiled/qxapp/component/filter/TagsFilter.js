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
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.toolbar.MenuButton": {
        "construct": true
      },
      "qx.ui.menu.Button": {},
      "qx.ui.menu.Menu": {},
      "qxapp.utils.Services": {},
      "qxapp.utils.Utils": {},
      "qx.ui.toolbar.Button": {}
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
   * Dropdown menu for tag filtering
   */
  qx.Class.define("qxapp.component.filter.TagsFilter", {
    extend: qxapp.component.filter.UIFilter,

    /**
     * Constructor for TagsFilter creates a workbench TagsFilter.
     *
     * @extends qxapp.component.filter.UIFilter
     */
    construct: function construct(filterId, groupId) {
      qxapp.component.filter.UIFilter.constructor.call(this, filterId, groupId);

      this._setLayout(new qx.ui.layout.HBox());

      this.__dropDown = new qx.ui.toolbar.MenuButton(this.tr("Tags"));

      this.__dropDown.setMenu(this.__buildMenu());

      this._add(this.__dropDown);
    },
    members: {
      __dropDown: null,
      __activeTags: null,
      __tagButtons: null,

      /**
       * Implementing IFilter: Function in charge of resetting the filter.
       */
      reset: function reset() {
        // Remove ticks from menu
        var menuButtons = this.__dropDown.getMenu().getChildren().filter(function (child) {
          return child instanceof qx.ui.menu.Button;
        });

        menuButtons.forEach(function (button) {
          return button.resetIcon();
        }); // Remove active tags

        if (this.__activeTags && this.__activeTags.length) {
          this.__activeTags.length = 0;
        } // Remove tag buttons


        for (var tagName in this.__tagButtons) {
          this._remove(this.__tagButtons[tagName]);

          delete this.__tagButtons[tagName];
        } // Dispatch


        this._filterChange(this.__activeTags);
      },
      __buildMenu: function __buildMenu() {
        var _this = this;

        var menu = new qx.ui.menu.Menu();
        qxapp.utils.Services.getTypes().forEach(function (serviceType) {
          var button = new qx.ui.menu.Button(qxapp.utils.Utils.capitalize(serviceType));
          button.addListener("execute", function (e) {
            return _this.__addTag(serviceType, e.getTarget());
          });
          menu.add(button);
        });
        menu.addSeparator();
        qxapp.utils.Services.getCategories().forEach(function (serviceCategory) {
          var button = new qx.ui.menu.Button(qxapp.utils.Utils.capitalize(serviceCategory));
          button.addListener("execute", function (e) {
            return _this.__addTag(serviceCategory, e.getTarget());
          });
          menu.add(button);
        });
        return menu;
      },
      __addTag: function __addTag(tagName, menuButton) {
        var _this2 = this;

        // Check if added
        this.__activeTags = this.__activeTags || [];

        if (this.__activeTags.includes(tagName)) {
          this.__removeTag(tagName, menuButton);
        } else {
          // Add tick
          menuButton.setIcon("@FontAwesome5Solid/check/12"); // Add tag

          var tagButton = new qx.ui.toolbar.Button(qxapp.utils.Utils.capitalize(tagName), "@MaterialIcons/close/12");

          this._add(tagButton);

          tagButton.addListener("execute", function () {
            return _this2.__removeTag(tagName, menuButton);
          }); // Update state

          this.__activeTags.push(tagName);

          this.__tagButtons = this.__tagButtons || {};
          this.__tagButtons[tagName] = tagButton;
        } // Dispatch


        this._filterChange(this.__activeTags);
      },
      __removeTag: function __removeTag(tagName, menuButton) {
        // Remove tick
        menuButton.resetIcon(); // Update state

        this.__activeTags.splice(this.__activeTags.indexOf(tagName), 1);

        this._remove(this.__tagButtons[tagName]);

        delete this.__tagButtons[tagName]; // Dispatch

        this._filterChange(this.__activeTags);
      }
    }
  });
  qxapp.component.filter.TagsFilter.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=TagsFilter.js.map?dt=1568886159948