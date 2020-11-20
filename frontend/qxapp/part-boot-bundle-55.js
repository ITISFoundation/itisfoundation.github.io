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
      "qx.ui.form.IBooleanForm": {
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Renders a special checkbox button inside a menu. The button behaves like
   * a normal {@link qx.ui.form.CheckBox} and shows a check icon when
   * checked; normally shows no icon when not checked (depends on the theme).
   */
  qx.Class.define("qx.ui.menu.CheckBox", {
    extend: qx.ui.menu.AbstractButton,
    implement: [qx.ui.form.IBooleanForm],

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
        // try to translate every time you create a checkbox [BUG #2699]
        if (label.translate) {
          this.setLabel(label.translate());
        } else {
          this.setLabel(label);
        }
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
        init: "menu-checkbox"
      },

      /** Whether the button is checked */
      value: {
        check: "Boolean",
        init: false,
        apply: "_applyValue",
        event: "changeValue",
        nullable: true
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

      /**
       * Handler for the execute event.
       *
       * @param e {qx.event.type.Event} The execute event.
       */
      _onExecute: function _onExecute(e) {
        this.toggleValue();
      }
    }
  });
  qx.ui.menu.CheckBox.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.menu.CheckBox": {
        "construct": true,
        "require": true
      },
      "qx.ui.table.IColumnMenuItem": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 Derrell Lipman
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Derrell Lipman (derrell)
  
  ************************************************************************ */

  /**
   * A menu item.
   */
  qx.Class.define("qx.ui.table.columnmenu.MenuItem", {
    extend: qx.ui.menu.CheckBox,
    implement: qx.ui.table.IColumnMenuItem,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance of an item for insertion into the table column
     * visibility menu.
     *
     * @param text {String}
     *   Text for the menu item, most typically the name of the column in the
     *   table.
     */
    construct: function construct(text) {
      qx.ui.menu.CheckBox.constructor.call(this, text); // Two way binding this.columnVisible <--> this.value

      this.bind("value", this, "columnVisible");
      this.bind("columnVisible", this, "value");
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      columnVisible: {
        check: "Boolean",
        init: true,
        event: "changeColumnVisible"
      }
    }
  });
  qx.ui.table.columnmenu.MenuItem.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.ui.layout.Grow": {
        "construct": true
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Clipping area for the table header and table pane.
   */
  qx.Class.define("qx.ui.table.pane.Clipper", {
    extend: qx.ui.container.Composite,
    construct: function construct() {
      qx.ui.container.Composite.constructor.call(this, new qx.ui.layout.Grow());
      this.setMinWidth(0);
    },
    members: {
      /**
       * Scrolls the element's content to the given left coordinate
       *
       * @param value {Integer} The vertical position to scroll to.
       */
      scrollToX: function scrollToX(value) {
        this.getContentElement().scrollToX(value, false);
      },

      /**
       * Scrolls the element's content to the given top coordinate
       *
       * @param value {Integer} The horizontal position to scroll to.
       */
      scrollToY: function scrollToY(value) {
        this.getContentElement().scrollToY(value, true);
      }
    }
  });
  qx.ui.table.pane.Clipper.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
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
       * David Perez Carmona (david-perez)
  
  ************************************************************************ */

  /**
   * A cell event instance contains all data for pointer events related to cells in
   * a table.
   **/
  qx.Class.define("qx.ui.table.pane.CellEvent", {
    extend: qx.event.type.Pointer,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The table row of the event target */
      row: {
        check: "Integer",
        nullable: true
      },

      /** The table column of the event target */
      column: {
        check: "Integer",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
       *****************************************************************************
          CONSTRUCTOR
       *****************************************************************************
       */

      /**
       * Initialize the event
       *
       * @param scroller {qx.ui.table.pane.Scroller} The tables pane scroller
       * @param me {qx.event.type.Pointer} The original pointer event
       * @param row {Integer?null} The cell's row index
       * @param column {Integer?null} The cell's column index
       */
      init: function init(scroller, me, row, column) {
        me.clone(this);
        this.setBubbles(false);

        if (row != null) {
          this.setRow(row);
        } else {
          this.setRow(scroller._getRowForPagePos(this.getDocumentLeft(), this.getDocumentTop()));
        }

        if (column != null) {
          this.setColumn(column);
        } else {
          this.setColumn(scroller._getColumnForPageX(this.getDocumentLeft()));
        }
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.ui.table.pane.CellEvent.prototype.clone.base.call(this, embryo);
        clone.set({
          row: this.getRow(),
          column: this.getColumn()
        });
        return clone;
      }
    }
  });
  qx.ui.table.pane.CellEvent.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-55.js.map
