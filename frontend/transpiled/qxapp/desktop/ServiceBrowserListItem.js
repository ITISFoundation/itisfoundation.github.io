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
      "qx.ui.form.IModel": {
        "require": true
      },
      "qxapp.component.filter.IFilterable": {
        "require": true
      },
      "qx.ui.form.MModelProperty": {
        "require": true
      },
      "qxapp.component.filter.MFilterable": {
        "require": true
      },
      "qx.ui.layout.Grid": {
        "construct": true
      },
      "qxapp.ui.basic.Label": {},
      "qx.ui.basic.Label": {},
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

  /* eslint "qx-rules/no-refs-in-members": "warn" */

  /**
   * Widget used mainly by ServiceBrowser for displaying service related information
   *
   *   It consists of a key as title, and name and contact as caption
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   tree.setDelegate({
   *     createItem: () => new qxapp.desktop.ServiceBrowserListItem(),
   *     bindItem: (c, item, id) => {
   *       c.bindProperty("key", "model", null, item, id);
   *       c.bindProperty("name", "title", null, item, id);
   *       c.bindProperty("description", "description", null, item, id);
   *       c.bindProperty("type", "type", null, item, id);
   *       c.bindProperty("category", "category", null, item, id);
   *       c.bindProperty("contact", "contact", null, item, id);
   *     }
   *   });
   * </pre>
   */
  qx.Class.define("qxapp.desktop.ServiceBrowserListItem", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.IModel, qxapp.component.filter.IFilterable],
    include: [qx.ui.form.MModelProperty, qxapp.component.filter.MFilterable],
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);
      var layout = new qx.ui.layout.Grid(0, 5);
      layout.setColumnFlex(0, 1);

      this._setLayout(layout);

      this.setPadding(5);
      this.addListener("pointerover", this._onPointerOver, this);
      this.addListener("pointerout", this._onPointerOut, this);
    },
    events: {
      /** (Fired by {@link qx.ui.form.List}) */
      "action": "qx.event.type.Event"
    },
    properties: {
      appearance: {
        refine: true,
        init: "selectable"
      },
      key: {
        check: "String",
        apply: "_applyKey"
      },
      title: {
        check: "String",
        apply: "_applyTitle",
        nullable: true
      },
      description: {
        check: "String",
        apply: "_applyDescription",
        nullable: true
      },
      type: {
        check: "String",
        nullable: true
      },
      contact: {
        check: "String",
        apply: "_applyContact",
        nullable: true
      },
      category: {
        check: "String",
        nullable: true
      }
    },
    members: {
      // eslint-disable-line qx-rules/no-refs-in-members
      // overridden
      _forwardStates: {
        focused: true,
        hovered: true,
        selected: true,
        dragover: true
      },

      /**
       * Event handler for the pointer over event.
       */
      _onPointerOver: function _onPointerOver() {
        this.addState("hovered");
      },

      /**
       * Event handler for the pointer out event.
       */
      _onPointerOut: function _onPointerOut() {
        this.removeState("hovered");
      },
      _createChildControlImpl: function _createChildControlImpl(id) {
        var control;

        switch (id) {
          case "title":
            control = new qxapp.ui.basic.Label(14, true);

            this._add(control, {
              row: 0,
              column: 0
            });

            break;

          case "description":
            control = new qx.ui.basic.Label();

            this._add(control, {
              row: 1,
              column: 0
            });

            break;

          case "contact":
            control = new qx.ui.basic.Label().set({
              font: "text-12"
            });

            this._add(control, {
              row: 1,
              column: 1
            });

            break;
        }

        return control || qxapp.desktop.ServiceBrowserListItem.prototype._createChildControlImpl.base.call(this, id);
      },
      _applyKey: function _applyKey(value, old) {
        var parts = value.split("/");
        var id = parts.pop();
        qxapp.utils.Utils.setIdToWidget(this, "serviceBrowserListItem_" + id);
      },
      _applyTitle: function _applyTitle(value) {
        var label = this.getChildControl("title");
        label.setValue(value);
      },
      _applyDescription: function _applyDescription(value) {
        var label = this.getChildControl("description");
        label.setValue(value);
      },
      _applyContact: function _applyContact(value) {
        var label = this.getChildControl("contact");
        label.setValue(value);
      },

      /**
       * Event handler for filtering events.
       */
      _filter: function _filter() {
        this.exclude();
      },
      _unfilter: function _unfilter() {
        this.show();
      },
      _shouldApplyFilter: function _shouldApplyFilter(data) {
        if (data.text) {
          var label = this.getTitle().trim().toLowerCase();

          if (label.indexOf(data.text) === -1) {
            return true;
          }
        }

        if (data.tags && data.tags.length) {
          var category = this.getCategory() || "";
          var type = this.getType() || "";

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
  qxapp.desktop.ServiceBrowserListItem.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ServiceBrowserListItem.js.map?dt=1568886162855