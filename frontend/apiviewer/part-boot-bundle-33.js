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
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.form.List": {},
      "qx.ui.popup.Popup": {},
      "qx.ui.layout.VBox": {},
      "qx.bom.String": {}
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
       * Martin Wittemann (martinwittemann)
       * Sebastian Werner (wpbasti)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * Basic class for a selectbox like lists. Basically supports a popup
   * with a list and the whole children management.
   *
   * @childControl list {qx.ui.form.List} list component of the selectbox
   * @childControl popup {qx.ui.popup.Popup} popup which shows the list
   *
   */
  qx.Class.define("qx.ui.form.AbstractSelectBox", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.form.MForm],
    implement: [qx.ui.form.IForm],
    type: "abstract",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // set the layout

      var layout = new qx.ui.layout.HBox();

      this._setLayout(layout);

      layout.setAlignY("middle"); // Register listeners

      this.addListener("keypress", this._onKeyPress);
      this.addListener("blur", this._onBlur, this); // register the resize listener

      this.addListener("resize", this._onResize, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      focusable: {
        refine: true,
        init: true
      },
      // overridden
      width: {
        refine: true,
        init: 120
      },

      /**
       * The maximum height of the list popup. Setting this value to
       * <code>null</code> will set cause the list to be auto-sized.
       */
      maxListHeight: {
        check: "Number",
        apply: "_applyMaxListHeight",
        nullable: true,
        init: 200
      },

      /**
       * Formatter which format the value from the selected <code>ListItem</code>.
       * Uses the default formatter {@link #_defaultFormat}.
       */
      format: {
        check: "Function",
        init: function init(item) {
          return this._defaultFormat(item);
        },
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "list":
            control = new qx.ui.form.List().set({
              focusable: false,
              keepFocus: true,
              height: null,
              width: null,
              maxHeight: this.getMaxListHeight(),
              selectionMode: "one",
              quickSelection: true
            });
            control.addListener("changeSelection", this._onListChangeSelection, this);
            control.addListener("pointerdown", this._onListPointerDown, this);
            control.getChildControl("pane").addListener("tap", this.close, this);
            break;

          case "popup":
            control = new qx.ui.popup.Popup(new qx.ui.layout.VBox());
            control.setAutoHide(false);
            control.setKeepActive(true);
            control.add(this.getChildControl("list"));
            control.addListener("changeVisibility", this._onPopupChangeVisibility, this);
            break;
        }

        return control || qx.ui.form.AbstractSelectBox.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyMaxListHeight: function _applyMaxListHeight(value, old) {
        this.getChildControl("list").setMaxHeight(value);
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the list widget.
       * @return {qx.ui.form.List} the list
       */
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("list");
      },

      /*
      ---------------------------------------------------------------------------
        LIST STUFF
      ---------------------------------------------------------------------------
      */

      /**
       * Shows the list popup.
       */
      open: function open() {
        var popup = this.getChildControl("popup");
        popup.placeToWidget(this, true);
        popup.show();
      },

      /**
       * Hides the list popup.
       */
      close: function close() {
        this.getChildControl("popup").hide();
      },

      /**
       * Toggles the popup's visibility.
       */
      toggle: function toggle() {
        var isListOpen = this.getChildControl("popup").isVisible();

        if (isListOpen) {
          this.close();
        } else {
          this.open();
        }
      },

      /*
      ---------------------------------------------------------------------------
        FORMAT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Return the formatted label text from the <code>ListItem</code>.
       * The formatter removes all HTML tags and converts all HTML entities
       * to string characters when the rich property is <code>true</code>.
       *
       * @param item {qx.ui.form.ListItem} The list item to format.
       * @return {String} The formatted text.
       */
      _defaultFormat: function _defaultFormat(item) {
        var valueLabel = item ? item.getLabel() : "";
        var rich = item ? item.getRich() : false;

        if (rich) {
          valueLabel = valueLabel.replace(/<[^>]+?>/g, "");
          valueLabel = qx.bom.String.unescape(valueLabel);
        }

        return valueLabel;
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the blur event of the current widget.
       *
       * @param e {qx.event.type.Focus} The blur event.
       */
      _onBlur: function _onBlur(e) {
        this.close();
      },

      /**
       * Reacts on special keys and forwards other key events to the list widget.
       *
       * @param e {qx.event.type.KeySequence} Keypress event
       */
      _onKeyPress: function _onKeyPress(e) {
        // get the key identifier
        var identifier = e.getKeyIdentifier();
        var listPopup = this.getChildControl("popup"); // disabled pageUp and pageDown keys

        if (listPopup.isHidden() && (identifier == "PageDown" || identifier == "PageUp")) {
          e.stopPropagation();
        } // hide the list always on escape
        else if (!listPopup.isHidden() && identifier == "Escape") {
            this.close();
            e.stop();
          } // forward the rest of the events to the list
          else {
              this.getChildControl("list").handleKeyPress(e);
            }
      },

      /**
       * Updates list minimum size.
       *
       * @param e {qx.event.type.Data} Data event
       */
      _onResize: function _onResize(e) {
        this.getChildControl("popup").setMinWidth(e.getData().width);
      },

      /**
       * Syncs the own property from the list change
       *
       * @param e {qx.event.type.Data} Data Event
       */
      _onListChangeSelection: function _onListChangeSelection(e) {
        throw new Error("Abstract method: _onListChangeSelection()");
      },

      /**
       * Redirects pointerdown event from the list to this widget.
       *
       * @param e {qx.event.type.Pointer} Pointer Event
       */
      _onListPointerDown: function _onListPointerDown(e) {
        throw new Error("Abstract method: _onListPointerDown()");
      },

      /**
       * Redirects changeVisibility event from the list to this widget.
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onPopupChangeVisibility: function _onPopupChangeVisibility(e) {
        e.getData() == "visible" ? this.addState("popupOpen") : this.removeState("popupOpen");
      }
    }
  });
  qx.ui.form.AbstractSelectBox.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.AbstractSelectBox": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.ISingleSelection": {
        "require": true
      },
      "qx.ui.form.IModelSelection": {
        "require": true
      },
      "qx.ui.form.IField": {
        "require": true
      },
      "qx.ui.core.MSingleSelectionHandling": {
        "require": true
      },
      "qx.ui.form.MModelSelection": {
        "require": true
      },
      "qx.ui.core.Spacer": {},
      "qx.ui.basic.Atom": {},
      "qx.ui.basic.Image": {},
      "qx.bom.Viewport": {}
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
       * Martin Wittemann (martinwittemann)
       * Sebastian Werner (wpbasti)
       * Jonathan Weiß (jonathan_rass)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * A form widget which allows a single selection. Looks somewhat like
   * a normal button, but opens a list of items to select when tapping on it.
   *
   * Keep in mind that the SelectBox widget has always a selected item (due to the
   * single selection mode). Right after adding the first item a <code>changeSelection</code>
   * event is fired.
   *
   * <pre class='javascript'>
   * var selectBox = new qx.ui.form.SelectBox();
   *
   * selectBox.addListener("changeSelection", function(e) {
   *   // ...
   * });
   *
   * // now the 'changeSelection' event is fired
   * selectBox.add(new qx.ui.form.ListItem("Item 1"));
   * </pre>
   *
   * @childControl spacer {qx.ui.core.Spacer} flexible spacer widget
   * @childControl atom {qx.ui.basic.Atom} shows the text and icon of the content
   * @childControl arrow {qx.ui.basic.Image} shows the arrow to open the popup
   */
  qx.Class.define("qx.ui.form.SelectBox", {
    extend: qx.ui.form.AbstractSelectBox,
    implement: [qx.ui.core.ISingleSelection, qx.ui.form.IModelSelection, qx.ui.form.IField],
    include: [qx.ui.core.MSingleSelectionHandling, qx.ui.form.MModelSelection],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.form.AbstractSelectBox.constructor.call(this);

      this._createChildControl("atom");

      this._createChildControl("spacer");

      this._createChildControl("arrow"); // Register listener


      this.addListener("pointerover", this._onPointerOver, this);
      this.addListener("pointerout", this._onPointerOut, this);
      this.addListener("tap", this._onTap, this);
      this.addListener("keyinput", this._onKeyInput, this);
      this.addListener("changeSelection", this.__onChangeSelection, this);
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
        init: "selectbox"
      },
      rich: {
        init: false,
        check: "Boolean",
        apply: "_applyRich"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.form.ListItem} instance */
      __preSelectedItem: null,

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      _applyRich: function _applyRich(value, oldValue) {
        this.getChildControl("atom").setRich(value);
      },
      // overridden
      _defaultFormat: function _defaultFormat(item) {
        if (item) {
          if (typeof item.isRich == "function" && item.isRich()) {
            this.setRich(true);
          }

          return item.getLabel();
        }

        return null;
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "spacer":
            control = new qx.ui.core.Spacer();

            this._add(control, {
              flex: 1
            });

            break;

          case "atom":
            control = new qx.ui.basic.Atom(" ");
            control.setCenter(false);
            control.setAnonymous(true);

            this._add(control, {
              flex: 1
            });

            break;

          case "arrow":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._add(control);

            break;
        }

        return control || qx.ui.form.SelectBox.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS FOR SELECTION API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the list items for the selection.
       *
       * @return {qx.ui.form.ListItem[]} List items to select.
       */
      _getItems: function _getItems() {
        return this.getChildrenContainer().getChildren();
      },

      /**
       * Returns if the selection could be empty or not.
       *
       * @return {Boolean} <code>true</code> If selection could be empty,
       *    <code>false</code> otherwise.
       */
      _isAllowEmptySelection: function _isAllowEmptySelection() {
        return this.getChildrenContainer().getSelectionMode() !== "one";
      },

      /**
       * Event handler for <code>changeSelection</code>.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      __onChangeSelection: function __onChangeSelection(e) {
        var listItem = e.getData()[0];
        var list = this.getChildControl("list");

        if (list.getSelection()[0] != listItem) {
          if (listItem) {
            list.setSelection([listItem]);
          } else {
            list.resetSelection();
          }
        }

        this.__updateIcon();

        this.__updateLabel();
      },

      /**
       * Sets the icon inside the list to match the selected ListItem.
       */
      __updateIcon: function __updateIcon() {
        var listItem = this.getChildControl("list").getSelection()[0];
        var atom = this.getChildControl("atom");
        var icon = listItem ? listItem.getIcon() : "";
        icon == null ? atom.resetIcon() : atom.setIcon(icon);
      },

      /**
       * Sets the label inside the list to match the selected ListItem.
       */
      __updateLabel: function __updateLabel() {
        var listItem = this.getChildControl("list").getSelection()[0];
        var atom = this.getChildControl("atom");
        var label = listItem ? listItem.getLabel() : "";
        var format = this.getFormat();

        if (format != null && listItem) {
          label = format.call(this, listItem);
        } // check for translation


        if (label && label.translate) {
          label = label.translate();
        }

        label == null ? atom.resetLabel() : atom.setLabel(label);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener method for "pointerover" event
       * <ul>
       * <li>Adds state "hovered"</li>
       * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
          this.addState("pressed");
        }

        this.addState("hovered");
      },

      /**
       * Listener method for "pointerout" event
       * <ul>
       * <li>Removes "hovered" state</li>
       * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        this.removeState("hovered");

        if (this.hasState("pressed")) {
          this.removeState("pressed");
          this.addState("abandoned");
        }
      },

      /**
       * Toggles the popup's visibility.
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onTap: function _onTap(e) {
        this.toggle();
      },
      // overridden
      _onKeyPress: function _onKeyPress(e) {
        var iden = e.getKeyIdentifier();

        if (iden == "Enter" || iden == "Space") {
          // Apply pre-selected item (translate quick selection to real selection)
          if (this.__preSelectedItem) {
            this.setSelection([this.__preSelectedItem]);
            this.__preSelectedItem = null;
          }

          this.toggle();
        } else {
          qx.ui.form.SelectBox.prototype._onKeyPress.base.call(this, e);
        }
      },

      /**
       * Forwards key event to list widget.
       *
       * @param e {qx.event.type.KeyInput} Key event
       */
      _onKeyInput: function _onKeyInput(e) {
        // clone the event and re-calibrate the event
        var clone = e.clone();
        clone.setTarget(this._list);
        clone.setBubbles(false); // forward it to the list

        this.getChildControl("list").dispatchEvent(clone);
      },
      // overridden
      _onListPointerDown: function _onListPointerDown(e) {
        // Apply pre-selected item (translate quick selection to real selection)
        if (this.__preSelectedItem) {
          this.setSelection([this.__preSelectedItem]);
          this.__preSelectedItem = null;
        }
      },
      // overridden
      _onListChangeSelection: function _onListChangeSelection(e) {
        var current = e.getData();
        var old = e.getOldData(); // Remove old listeners for icon and label changes.

        if (old && old.length > 0) {
          old[0].removeListener("changeIcon", this.__updateIcon, this);
          old[0].removeListener("changeLabel", this.__updateLabel, this);
        }

        if (current.length > 0) {
          // Ignore quick context (e.g. pointerover)
          // and configure the new value when closing the popup afterwards
          var popup = this.getChildControl("popup");
          var list = this.getChildControl("list");
          var context = list.getSelectionContext();

          if (popup.isVisible() && (context == "quick" || context == "key")) {
            this.__preSelectedItem = current[0];
          } else {
            this.setSelection([current[0]]);
            this.__preSelectedItem = null;
          } // Add listeners for icon and label changes


          current[0].addListener("changeIcon", this.__updateIcon, this);
          current[0].addListener("changeLabel", this.__updateLabel, this);
        } else {
          this.resetSelection();
        }
      },
      // overridden
      _onPopupChangeVisibility: function _onPopupChangeVisibility(e) {
        qx.ui.form.SelectBox.prototype._onPopupChangeVisibility.base.call(this, e); // Synchronize the current selection to the list selection
        // when the popup is closed. The list selection may be invalid
        // because of the quick selection handling which is not
        // directly applied to the selectbox


        var popup = this.getChildControl("popup");

        if (!popup.isVisible()) {
          var list = this.getChildControl("list"); // check if the list has any children before selecting

          if (list.hasChildren()) {
            list.setSelection(this.getSelection());
          }
        } else {
          // ensure that the list is never bigger that the max list height and
          // the available space in the viewport
          var distance = popup.getLayoutLocation(this);
          var viewPortHeight = qx.bom.Viewport.getHeight(); // distance to the bottom and top borders of the viewport

          var toTop = distance.top;
          var toBottom = viewPortHeight - distance.bottom;
          var availableHeigth = toTop > toBottom ? toTop : toBottom;
          var maxListHeight = this.getMaxListHeight();
          var list = this.getChildControl("list");

          if (maxListHeight == null || maxListHeight > availableHeigth) {
            list.setMaxHeight(availableHeigth);
          } else if (maxListHeight < availableHeigth) {
            list.setMaxHeight(maxListHeight);
          }
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__preSelectedItem = null;
    }
  });
  qx.ui.form.SelectBox.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Atom": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.IModel": {
        "require": true
      },
      "qx.ui.form.MModelProperty": {
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
  
  ************************************************************************ */

  /**
   * A item for a list. Could be added to all List like widgets but also
   * to the {@link qx.ui.form.SelectBox} and {@link qx.ui.form.ComboBox}.
   */
  qx.Class.define("qx.ui.form.ListItem", {
    extend: qx.ui.basic.Atom,
    implement: [qx.ui.form.IModel],
    include: [qx.ui.form.MModelProperty],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     * @param model {String?null} The items value
     */
    construct: function construct(label, icon, model) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);

      if (model != null) {
        this.setModel(model);
      }

      this.addListener("pointerover", this._onPointerOver, this);
      this.addListener("pointerout", this._onPointerOut, this);
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** (Fired by {@link qx.ui.form.List}) */
      "action": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "listitem"
      }
    },
    members: {
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
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
      }
    },
    destruct: function destruct() {
      this.removeListener("pointerover", this._onPointerOver, this);
      this.removeListener("pointerout", this._onPointerOut, this);
    }
  });
  qx.ui.form.ListItem.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-33.js.map
