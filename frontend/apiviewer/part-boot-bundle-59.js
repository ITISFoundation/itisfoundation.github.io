(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.ToggleButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.toolbar.PartContainer": {},
      "qx.ui.core.queue.Appearance": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * A button which is toggle-able for toolbars.
   */
  qx.Class.define("qx.ui.toolbar.CheckBox", {
    extend: qx.ui.form.ToggleButton,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct(label, icon) {
      qx.ui.form.ToggleButton.constructor.call(this, label, icon); // Toolbar buttons should not support the keyboard events

      this.removeListener("keydown", this._onKeyDown);
      this.removeListener("keyup", this._onKeyUp);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "toolbar-button"
      },
      show: {
        refine: true,
        init: "inherit"
      },
      focusable: {
        refine: true,
        init: false
      }
    },
    members: {
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.toolbar.CheckBox.prototype._applyVisibility.base.call(this, value, old); // trigger a appearance recalculation of the parent


        var parent = this.getLayoutParent();

        if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
          qx.ui.core.queue.Appearance.add(parent);
        }
      }
    }
  });
  qx.ui.toolbar.CheckBox.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.toolbar.CheckBox": {
        "require": true
      },
      "qx.ui.form.MModelProperty": {
        "require": true
      },
      "qx.ui.form.IModel": {
        "require": true
      },
      "qx.ui.form.IRadioItem": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Radio buttons are used to manage a single selection. Radio buttons only
   * make sense used in a group of two or more of them. They are managed (connected)
   * to a {@link qx.ui.form.RadioGroup} to handle the selection.
   */
  qx.Class.define("qx.ui.toolbar.RadioButton", {
    extend: qx.ui.toolbar.CheckBox,
    include: [qx.ui.form.MModelProperty],
    implement: [qx.ui.form.IModel, qx.ui.form.IRadioItem],

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyValue: function _applyValue(value, old) {
        qx.ui.toolbar.RadioButton.prototype._applyValue.base.call(this, value, old);

        if (value) {
          var grp = this.getGroup();

          if (grp) {
            grp.setSelection([this]);
          }
        }
      },
      // overridden
      _onExecute: function _onExecute(e) {
        var grp = this.getGroup();

        if (grp && grp.getAllowEmptySelection()) {
          this.toggleValue();
        } else {
          this.setValue(true);
        }
      }
    }
  });
  qx.ui.toolbar.RadioButton.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.menu.AbstractButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.MModelProperty": {
        "require": true
      },
      "qx.ui.form.IRadioItem": {
        "require": true
      },
      "qx.ui.form.IBooleanForm": {
        "require": true
      },
      "qx.ui.form.IModel": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Renders a special radio button inside a menu. The button behaves like
   * a normal {@link qx.ui.form.RadioButton} and shows a radio icon when
   * checked; normally shows no icon when not checked (depends on the theme).
   */
  qx.Class.define("qx.ui.menu.RadioButton", {
    extend: qx.ui.menu.AbstractButton,
    include: [qx.ui.form.MModelProperty],
    implement: [qx.ui.form.IRadioItem, qx.ui.form.IBooleanForm, qx.ui.form.IModel],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Initial label
     * @param menu {qx.ui.menu.Menu} Initial sub menu
     */
    construct: function construct(label, menu) {
      qx.ui.menu.AbstractButton.constructor.call(this); // Initialize with incoming arguments

      if (label != null) {
        this.setLabel(label);
      }

      if (menu != null) {
        this.setMenu(menu);
      }

      this.addListener("execute", this._onExecute, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "menu-radiobutton"
      },

      /** The value of the widget. True, if the widget is checked. */
      value: {
        check: "Boolean",
        nullable: true,
        event: "changeValue",
        apply: "_applyValue",
        init: false
      },

      /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
      group: {
        check: "qx.ui.form.RadioGroup",
        nullable: true,
        apply: "_applyGroup"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden (from MExecutable to keep the icon out of the binding)

      /**
       * @lint ignoreReferenceField(_bindableProperties)
       */
      _bindableProperties: ["enabled", "label", "toolTipText", "value", "menu"],
      // property apply
      _applyValue: function _applyValue(value, old) {
        value ? this.addState("checked") : this.removeState("checked");
      },
      // property apply
      _applyGroup: function _applyGroup(value, old) {
        if (old) {
          old.remove(this);
        }

        if (value) {
          value.add(this);
        }
      },

      /**
       * Handler for the execute event.
       *
       * @param e {qx.event.type.Event} The execute event.
       */
      _onExecute: function _onExecute(e) {
        var grp = this.getGroup();

        if (grp && grp.getAllowEmptySelection()) {
          this.toggleValue();
        } else {
          this.setValue(true);
        }
      }
    }
  });
  qx.ui.menu.RadioButton.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-59.js.map
