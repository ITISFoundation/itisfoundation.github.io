(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Each object, which should support single selection have to
   * implement this interface.
   */
  qx.Interface.define("qx.ui.core.ISingleSelection", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the selection was modified */
      "changeSelection": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {qx.ui.core.Widget[]} List of items.
       */
      getSelection: function getSelection() {
        return true;
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if the item is not a child element.
       */
      setSelection: function setSelection(items) {
        return arguments.length == 1;
      },

      /**
       * Clears the whole selection at once.
       */
      resetSelection: function resetSelection() {
        return true;
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if the item is not a child element.
       */
      isSelected: function isSelected(item) {
        return arguments.length == 1;
      },

      /**
       * Whether the selection is empty.
       *
       * @return {Boolean} Whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return true;
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return arguments.length == 1;
      }
    }
  });
  qx.ui.core.ISingleSelection.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.ui.core.SingleSelectionManager": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This mixin links all methods to manage the single selection.
   *
   * The class which includes the mixin has to implements two methods:
   *
   * <ul>
   * <li><code>_getItems</code>, this method has to return a <code>Array</code>
   *    of <code>qx.ui.core.Widget</code> that should be managed from the manager.
   * </li>
   * <li><code>_isAllowEmptySelection</code>, this method has to return a
   *    <code>Boolean</code> value for allowing empty selection or not.
   * </li>
   * </ul>
   */
  qx.Mixin.define("qx.ui.core.MSingleSelectionHandling", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the value was modified */
      "changeValue": "qx.event.type.Data",

      /** Fires after the selection was modified */
      "changeSelection": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.SingleSelectionManager} the single selection manager */
      __manager: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * setValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @param item {null|qx.ui.core.Widget} Item to set as selected value.
       * @returns {null|TypeError} The status of this operation.
       */
      setValue: function setValue(item) {
        if (null === item) {
          this.resetSelection();
          return null;
        }

        if (item instanceof qx.ui.core.Widget) {
          this.__getManager().setSelected(item);

          return null;
        } else {
          return new TypeError("Given argument is not null or a {qx.ui.core.Widget}.");
        }
      },

      /**
       * getValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @returns {null|qx.ui.core.Widget} The currently selected widget or null if there is none.
       */
      getValue: function getValue() {
        return this.__getManager().getSelected() || null;
      },

      /**
       * resetValue implements part of the {@link qx.ui.form.IField} interface.
       */
      resetValue: function resetValue() {
        this.__getManager().resetSelected();
      },

      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {qx.ui.core.Widget[]} List of items.
       */
      getSelection: function getSelection() {
        var selected = this.__getManager().getSelected();

        if (selected) {
          return [selected];
        } else {
          return [];
        }
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if one of the items is not a child element and if
       *    items contains more than one elements.
       */
      setSelection: function setSelection(items) {
        switch (items.length) {
          case 0:
            this.resetSelection();
            break;

          case 1:
            this.__getManager().setSelected(items[0]);

            break;

          default:
            throw new Error("Could only select one item, but the selection array contains " + items.length + " items!");
        }
      },

      /**
       * Clears the whole selection at once.
       */
      resetSelection: function resetSelection() {
        this.__getManager().resetSelected();
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item.
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if one of the items is not a child element.
       */
      isSelected: function isSelected(item) {
        return this.__getManager().isSelected(item);
      },

      /**
       * Whether the selection is empty.
       *
       * @return {Boolean} Whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__getManager().isSelectionEmpty();
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return this.__getManager().getSelectables(all);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>changeSelected</code> event on single
       * selection manager.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      _onChangeSelected: function _onChangeSelected(e) {
        var newValue = e.getData();
        var oldValue = e.getOldData();
        this.fireDataEvent("changeValue", newValue, oldValue);
        newValue == null ? newValue = [] : newValue = [newValue];
        oldValue == null ? oldValue = [] : oldValue = [oldValue];
        this.fireDataEvent("changeSelection", newValue, oldValue);
      },

      /**
       * Return the selection manager if it is already exists, otherwise creates
       * the manager.
       *
       * @return {qx.ui.core.SingleSelectionManager} Single selection manager.
       */
      __getManager: function __getManager() {
        if (this.__manager == null) {
          var that = this;
          this.__manager = new qx.ui.core.SingleSelectionManager({
            getItems: function getItems() {
              return that._getItems();
            },
            isItemSelectable: function isItemSelectable(item) {
              if (that._isItemSelectable) {
                return that._isItemSelectable(item);
              } else {
                return item.isVisible();
              }
            }
          });

          this.__manager.addListener("changeSelected", this._onChangeSelected, this);
        }

        this.__manager.setAllowEmptySelection(this._isAllowEmptySelection());

        return this.__manager;
      }
    },

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__manager");
    }
  });
  qx.ui.core.MSingleSelectionHandling.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.ui.form.IField": {
        "require": true
      },
      "qx.ui.core.ISingleSelection": {
        "require": true
      },
      "qx.ui.core.MSingleSelectionHandling": {
        "require": true
      },
      "qx.ui.core.MChildrenHandling": {
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
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
       * Adrian Olaru (adrianolaru)
  
  ************************************************************************ */

  /**
   * The stack container puts its child widgets on top of each other and only the
   * topmost widget is visible.
   *
   * This is used e.g. in the tab view widget. Which widget is visible can be
   * controlled by using the {@link #getSelection} method.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create stack container
   *   var stack = new qx.ui.container.Stack();
   *
   *   // add some children
   *   stack.add(new qx.ui.core.Widget().set({
   *    backgroundColor: "red"
   *   }));
   *   stack.add(new qx.ui.core.Widget().set({
   *    backgroundColor: "green"
   *   }));
   *   stack.add(new qx.ui.core.Widget().set({
   *    backgroundColor: "blue"
   *   }));
   *
   *   // select green widget
   *   stack.setSelection([stack.getChildren()[1]]);
   *
   *   this.getRoot().add(stack);
   * </pre>
   *
   * This example creates an stack with three children. Only the selected "green"
   * widget is visible.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/stack.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.Stack", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.IField, qx.ui.core.ISingleSelection],
    include: [qx.ui.core.MSingleSelectionHandling, qx.ui.core.MChildrenHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Grow());

      this.addListener("changeSelection", this.__onChangeSelection, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Whether the size of the widget depends on the selected child. When
       * disabled (default) the size is configured to the largest child.
       */
      dynamic: {
        check: "Boolean",
        init: false,
        apply: "_applyDynamic"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // property apply
      _applyDynamic: function _applyDynamic(value) {
        var children = this._getChildren();

        var selected = this.getSelection()[0];
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child != selected) {
            if (value) {
              children[i].exclude();
            } else {
              children[i].hide();
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS FOR SELECTION API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the widget for the selection.
       * @return {qx.ui.core.Widget[]} Widgets to select.
       */
      _getItems: function _getItems() {
        return this.getChildren();
      },

      /**
       * Returns if the selection could be empty or not.
       *
       * @return {Boolean} <code>true</code> If selection could be empty,
       *    <code>false</code> otherwise.
       */
      _isAllowEmptySelection: function _isAllowEmptySelection() {
        return true;
      },

      /**
       * Returns whether the given item is selectable.
       *
       * @param item {qx.ui.core.Widget} The item to be checked
       * @return {Boolean} Whether the given item is selectable
       */
      _isItemSelectable: function _isItemSelectable(item) {
        return true;
      },

      /**
       * Event handler for <code>changeSelection</code>.
       *
       * Shows the new selected widget and hide the old one.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      __onChangeSelection: function __onChangeSelection(e) {
        var old = e.getOldData()[0];
        var value = e.getData()[0];

        if (old) {
          if (this.isDynamic()) {
            old.exclude();
          } else {
            old.hide();
          }
        }

        if (value) {
          value.show();
        }
      },
      //overridden
      _afterAddChild: function _afterAddChild(child) {
        var selected = this.getSelection()[0];

        if (!selected) {
          this.setSelection([child]);
        } else if (selected !== child) {
          if (this.isDynamic()) {
            child.exclude();
          } else {
            child.hide();
          }
        }
      },
      //overridden
      _afterRemoveChild: function _afterRemoveChild(child) {
        if (this.getSelection()[0] === child) {
          var first = this._getChildren()[0];

          if (first) {
            this.setSelection([first]);
          } else {
            this.resetSelection();
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Go to the previous child in the children list.
       */
      previous: function previous() {
        var selected = this.getSelection()[0];
        var go = this._indexOf(selected) - 1;

        var children = this._getChildren();

        if (go < 0) {
          go = children.length - 1;
        }

        var prev = children[go];
        this.setSelection([prev]);
      },

      /**
       * Go to the next child in the children list.
       */
      next: function next() {
        var selected = this.getSelection()[0];
        var go = this._indexOf(selected) + 1;

        var children = this._getChildren();

        var next = children[go] || children[0];
        this.setSelection([next]);
      }
    }
  });
  qx.ui.container.Stack.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-13.js.map
