(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
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
   * A widget used for decoration proposes to structure a toolbar. Each
   * Separator renders a line between the buttons around.
   */
  qx.Class.define("qx.ui.toolbar.Separator", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "toolbar-separator"
      },
      // overridden
      anonymous: {
        refine: true,
        init: true
      },
      // overridden
      width: {
        refine: true,
        init: 0
      },
      // overridden
      height: {
        refine: true,
        init: 0
      }
    }
  });
  qx.ui.toolbar.Separator.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MPlacement": {
        "require": true
      },
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.menu.Layout": {
        "construct": true
      },
      "qx.ui.core.Blocker": {
        "construct": true
      },
      "qx.ui.menu.Separator": {},
      "qx.ui.menu.Manager": {},
      "qx.ui.menu.AbstractButton": {},
      "qx.ui.menu.MenuSlideBar": {},
      "qx.ui.layout.Grow": {},
      "qx.lang.Array": {},
      "qx.ui.core.queue.Widget": {},
      "qx.core.ObjectRegistry": {}
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
   * The menu is a popup like control which supports buttons. It comes
   * with full keyboard navigation and an improved timeout based pointer
   * control behavior.
   *
   * This class is the container for all derived instances of
   * {@link qx.ui.menu.AbstractButton}.
   *
   * @childControl slidebar {qx.ui.menu.MenuSlideBar} shows a slidebar to easily navigate inside the menu (if too little space is left)
   */
  qx.Class.define("qx.ui.menu.Menu", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MPlacement, qx.ui.core.MRemoteChildrenHandling],
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Use hard coded layout

      this._setLayout(new qx.ui.menu.Layout()); // Automatically add to application's root


      var root = this.getApplicationRoot();
      root.add(this); // Register pointer listeners

      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut); // add resize listener

      this.addListener("resize", this._onResize, this);
      root.addListener("resize", this._onResize, this);
      this._blocker = new qx.ui.core.Blocker(root); // Initialize properties

      this.initVisibility();
      this.initKeepFocus();
      this.initKeepActive();
    },
    properties: {
      /*
      ---------------------------------------------------------------------------
        WIDGET PROPERTIES
      ---------------------------------------------------------------------------
      */
      // overridden
      appearance: {
        refine: true,
        init: "menu"
      },
      // overridden
      allowGrowX: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowY: {
        refine: true,
        init: false
      },
      // overridden
      visibility: {
        refine: true,
        init: "excluded"
      },
      // overridden
      keepFocus: {
        refine: true,
        init: true
      },
      // overridden
      keepActive: {
        refine: true,
        init: true
      },

      /*
      ---------------------------------------------------------------------------
        STYLE OPTIONS
      ---------------------------------------------------------------------------
      */

      /** The spacing between each cell of the menu buttons */
      spacingX: {
        check: "Integer",
        apply: "_applySpacingX",
        init: 0,
        themeable: true
      },

      /** The spacing between each menu button */
      spacingY: {
        check: "Integer",
        apply: "_applySpacingY",
        init: 0,
        themeable: true
      },

      /**
      * Default icon column width if no icons are rendered.
      * This property is ignored as soon as an icon is present.
      */
      iconColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyIconColumnWidth"
      },

      /** Default arrow column width if no sub menus are rendered */
      arrowColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyArrowColumnWidth"
      },

      /**
       * Color of the blocker
       */
      blockerColor: {
        check: "Color",
        init: null,
        nullable: true,
        apply: "_applyBlockerColor",
        themeable: true
      },

      /**
       * Opacity of the blocker
       */
      blockerOpacity: {
        check: "Number",
        init: 1,
        apply: "_applyBlockerOpacity",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        FUNCTIONALITY PROPERTIES
      ---------------------------------------------------------------------------
      */

      /** The currently selected button */
      selectedButton: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applySelectedButton"
      },

      /** The currently opened button (sub menu is visible) */
      openedButton: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applyOpenedButton"
      },

      /** Widget that opened the menu */
      opener: {
        check: "qx.ui.core.Widget",
        nullable: true
      },

      /*
      ---------------------------------------------------------------------------
        BEHAVIOR PROPERTIES
      ---------------------------------------------------------------------------
      */

      /** Interval in ms after which sub menus should be opened */
      openInterval: {
        check: "Integer",
        themeable: true,
        init: 250,
        apply: "_applyOpenInterval"
      },

      /** Interval in ms after which sub menus should be closed  */
      closeInterval: {
        check: "Integer",
        themeable: true,
        init: 250,
        apply: "_applyCloseInterval"
      },

      /** Blocks the background if value is <code>true<code> */
      blockBackground: {
        check: "Boolean",
        themeable: true,
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __scheduledOpen: null,
      __onAfterSlideBarAdd: null,

      /** @type {qx.ui.core.Blocker} blocker for background blocking */
      _blocker: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Opens the menu and configures the opener
       */
      open: function open() {
        if (this.getOpener() != null) {
          var isPlaced = this.placeToWidget(this.getOpener(), true);

          if (isPlaced) {
            this.__updateSlideBar();

            this.show();
            this._placementTarget = this.getOpener();
          } else {
            this.warn("Could not open menu instance because 'opener' widget is not visible");
          }
        } else {
          this.warn("The menu instance needs a configured 'opener' widget!");
        }
      },

      /**
       * Opens the menu at the pointer position
       *
       * @param e {qx.event.type.Pointer} Pointer event to align to
       */
      openAtPointer: function openAtPointer(e) {
        this.placeToPointer(e);

        this.__updateSlideBar();

        this.show();
        this._placementTarget = {
          left: e.getDocumentLeft(),
          top: e.getDocumentTop()
        };
      },

      /**
       * Opens the menu in relation to the given point
       *
       * @param point {Map} Coordinate of any point with the keys <code>left</code>
       *   and <code>top</code>.
       */
      openAtPoint: function openAtPoint(point) {
        this.placeToPoint(point);

        this.__updateSlideBar();

        this.show();
        this._placementTarget = point;
      },

      /**
       * Convenience method to add a separator to the menu
       */
      addSeparator: function addSeparator() {
        this.add(new qx.ui.menu.Separator());
      },

      /**
       * Returns the column sizes detected during the pre-layout phase
       *
       * @return {Array} List of all column widths
       */
      getColumnSizes: function getColumnSizes() {
        return this._getMenuLayout().getColumnSizes();
      },

      /**
       * Return all selectable menu items.
       *
       * @return {qx.ui.core.Widget[]} selectable widgets
       */
      getSelectables: function getSelectables() {
        var result = [];
        var children = this.getChildren();

        for (var i = 0; i < children.length; i++) {
          if (children[i].isEnabled()) {
            result.push(children[i]);
          }
        }

        return result;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIconColumnWidth: function _applyIconColumnWidth(value, old) {
        this._getMenuLayout().setIconColumnWidth(value);
      },
      // property apply
      _applyArrowColumnWidth: function _applyArrowColumnWidth(value, old) {
        this._getMenuLayout().setArrowColumnWidth(value);
      },
      // property apply
      _applySpacingX: function _applySpacingX(value, old) {
        this._getMenuLayout().setColumnSpacing(value);
      },
      // property apply
      _applySpacingY: function _applySpacingY(value, old) {
        this._getMenuLayout().setSpacing(value);
      },
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.menu.Menu.prototype._applyVisibility.base.call(this, value, old);

        var mgr = qx.ui.menu.Manager.getInstance();

        if (value === "visible") {
          // Register to manager (zIndex handling etc.)
          mgr.add(this); // Mark opened in parent menu

          var parentMenu = this.getParentMenu();

          if (parentMenu) {
            parentMenu.setOpenedButton(this.getOpener());
          }
        } else if (old === "visible") {
          // Deregister from manager (zIndex handling etc.)
          mgr.remove(this); // Unmark opened in parent menu

          var parentMenu = this.getParentMenu();

          if (parentMenu && parentMenu.getOpenedButton() == this.getOpener()) {
            parentMenu.resetOpenedButton();
          } // Clear properties


          this.resetOpenedButton();
          this.resetSelectedButton();
        }

        this.__updateBlockerVisibility();
      },

      /**
       * Updates the blocker's visibility
       */
      __updateBlockerVisibility: function __updateBlockerVisibility() {
        if (this.isVisible()) {
          if (this.getBlockBackground()) {
            var zIndex = this.getZIndex();

            this._blocker.blockContent(zIndex - 1);
          }
        } else {
          if (this._blocker.isBlocked()) {
            this._blocker.unblock();
          }
        }
      },

      /**
       * Get the parent menu. Returns <code>null</code> if the menu doesn't have a
       * parent menu.
       *
       * @return {qx.ui.core.Widget|null} The parent menu.
       */
      getParentMenu: function getParentMenu() {
        var widget = this.getOpener();

        if (!widget || !(widget instanceof qx.ui.menu.AbstractButton)) {
          return null;
        }

        if (widget && widget.getContextMenu() === this) {
          return null;
        }

        while (widget && !(widget instanceof qx.ui.menu.Menu)) {
          widget = widget.getLayoutParent();
        }

        return widget;
      },
      // property apply
      _applySelectedButton: function _applySelectedButton(value, old) {
        if (old) {
          old.removeState("selected");
        }

        if (value) {
          value.addState("selected");
        }
      },
      // property apply
      _applyOpenedButton: function _applyOpenedButton(value, old) {
        if (old && old.getMenu()) {
          old.getMenu().exclude();
        }

        if (value) {
          value.getMenu().open();
        }
      },
      // property apply
      _applyBlockerColor: function _applyBlockerColor(value, old) {
        this._blocker.setColor(value);
      },
      // property apply
      _applyBlockerOpacity: function _applyBlockerOpacity(value, old) {
        this._blocker.setOpacity(value);
      },

      /*
      ---------------------------------------------------------------------------
      SCROLLING SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("slidebar", true) || this;
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "slidebar":
            var control = new qx.ui.menu.MenuSlideBar();

            var layout = this._getLayout();

            this._setLayout(new qx.ui.layout.Grow());

            var slidebarLayout = control.getLayout();
            control.setLayout(layout);
            slidebarLayout.dispose();
            var children = qx.lang.Array.clone(this.getChildren());

            for (var i = 0; i < children.length; i++) {
              control.add(children[i]);
            }

            this.removeListener("resize", this._onResize, this);
            control.getChildrenContainer().addListener("resize", this._onResize, this);

            this._add(control);

            break;
        }

        return control || qx.ui.menu.Menu.prototype._createChildControlImpl.base.call(this, id);
      },

      /**
       * Get the menu layout manager
       *
       * @return {qx.ui.layout.Abstract} The menu layout manager
       */
      _getMenuLayout: function _getMenuLayout() {
        if (this.hasChildControl("slidebar")) {
          return this.getChildControl("slidebar").getChildrenContainer().getLayout();
        } else {
          return this._getLayout();
        }
      },

      /**
       * Get the menu bounds
       *
       * @return {Map} The menu bounds
       */
      _getMenuBounds: function _getMenuBounds() {
        if (this.hasChildControl("slidebar")) {
          return this.getChildControl("slidebar").getChildrenContainer().getBounds();
        } else {
          return this.getBounds();
        }
      },

      /**
       * Computes the size of the menu. This method is used by the
       * {@link qx.ui.core.MPlacement} mixin.
       * @return {Map} The menu bounds
       */
      _computePlacementSize: function _computePlacementSize() {
        return this._getMenuBounds();
      },

      /**
       * Updates the visibility of the slidebar based on the menu's current size
       * and position.
       */
      __updateSlideBar: function __updateSlideBar() {
        var menuBounds = this._getMenuBounds();

        if (!menuBounds) {
          this.addListenerOnce("resize", this.__updateSlideBar, this);
          return;
        }

        var rootHeight = this.getLayoutParent().getBounds().height;
        var top = this.getLayoutProperties().top;
        var left = this.getLayoutProperties().left; // Adding the slidebar must be deferred because this call can happen
        // during the layout flush, which make it impossible to move existing
        // layout to the slidebar

        if (top < 0) {
          this._assertSlideBar(function () {
            this.setHeight(menuBounds.height + top);
            this.moveTo(left, 0);
          });
        } else if (top + menuBounds.height > rootHeight) {
          this._assertSlideBar(function () {
            this.setHeight(rootHeight - top);
          });
        } else {
          this.setHeight(null);
        }
      },

      /**
       * Schedules the addition of the slidebar and calls the given callback
       * after the slidebar has been added.
       *
       * @param callback {Function} the callback to call
       * @return {var|undefined} The return value of the callback if the slidebar
       * already exists, or <code>undefined</code> if it doesn't
       */
      _assertSlideBar: function _assertSlideBar(callback) {
        if (this.hasChildControl("slidebar")) {
          return callback.call(this);
        }

        this.__onAfterSlideBarAdd = callback;
        qx.ui.core.queue.Widget.add(this);
      },
      // overridden
      syncWidget: function syncWidget(jobs) {
        this.getChildControl("slidebar");

        if (this.__onAfterSlideBarAdd) {
          this.__onAfterSlideBarAdd.call(this);

          delete this.__onAfterSlideBarAdd;
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Update position if the menu or the root is resized
       */
      _onResize: function _onResize() {
        if (this.isVisible()) {
          var target = this._placementTarget;

          if (!target) {
            return;
          } else if (target instanceof qx.ui.core.Widget) {
            this.placeToWidget(target, true);
          } else if (target.top !== undefined) {
            this.placeToPoint(target);
          } else {
            throw new Error("Unknown target: " + target);
          }

          this.__updateSlideBar();
        }
      },

      /**
       * Event listener for pointerover event.
       *
       * @param e {qx.event.type.Pointer} pointerover event
       */
      _onPointerOver: function _onPointerOver(e) {
        // Cache manager
        var mgr = qx.ui.menu.Manager.getInstance(); // Be sure this menu is kept

        mgr.cancelClose(this); // Change selection

        var target = e.getTarget();

        if (target.isEnabled() && target instanceof qx.ui.menu.AbstractButton) {
          // Select button directly
          this.setSelectedButton(target);
          var subMenu = target.getMenu && target.getMenu();

          if (subMenu) {
            subMenu.setOpener(target); // Finally schedule for opening

            mgr.scheduleOpen(subMenu); // Remember scheduled menu for opening

            this.__scheduledOpen = subMenu;
          } else {
            var opened = this.getOpenedButton();

            if (opened) {
              mgr.scheduleClose(opened.getMenu());
            }

            if (this.__scheduledOpen) {
              mgr.cancelOpen(this.__scheduledOpen);
              this.__scheduledOpen = null;
            }
          }
        } else if (!this.getOpenedButton()) {
          // When no button is opened reset the selection
          // Otherwise keep it
          this.resetSelectedButton();
        }
      },

      /**
       * Event listener for pointerout event.
       *
       * @param e {qx.event.type.Pointer} pointerout event
       */
      _onPointerOut: function _onPointerOut(e) {
        // Cache manager
        var mgr = qx.ui.menu.Manager.getInstance(); // Detect whether the related target is out of the menu

        if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget())) {
          // Update selected property
          // Force it to the open sub menu in cases where that is opened
          // Otherwise reset it. Menus which are left by the cursor should
          // not show any selection.
          var opened = this.getOpenedButton();
          opened ? this.setSelectedButton(opened) : this.resetSelectedButton(); // Cancel a pending close request for the currently
          // opened sub menu

          if (opened) {
            mgr.cancelClose(opened.getMenu());
          } // When leaving this menu to the outside, stop
          // all pending requests to open any other sub menu


          if (this.__scheduledOpen) {
            mgr.cancelOpen(this.__scheduledOpen);
          }
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (!qx.core.ObjectRegistry.inShutDown) {
        qx.ui.menu.Manager.getInstance().remove(this);
      }

      this.getApplicationRoot().removeListener("resize", this._onResize, this);
      this._placementTarget = null;

      this._disposeObjects("_blocker");
    }
  });
  qx.ui.menu.Menu.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MExecutable": {
        "require": true
      },
      "qx.ui.form.IExecutable": {
        "require": true
      },
      "qx.ui.menu.ButtonLayout": {
        "construct": true
      },
      "qx.ui.basic.Image": {},
      "qx.ui.basic.Label": {},
      "qx.ui.menu.Manager": {},
      "qx.locale.Manager": {},
      "qx.core.ObjectRegistry": {}
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
   * The abstract menu button class is used for all type of menu content
   * for example normal buttons, checkboxes or radiobuttons.
   *
   * @childControl icon {qx.ui.basic.Image} icon of the button
   * @childControl label {qx.ui.basic.Label} label of the button
   * @childControl shortcut {qx.ui.basic.Label} shows if specified the shortcut
   * @childControl arrow {qx.ui.basic.Image} shows the arrow to show an additional widget (e.g. popup or submenu)
   */
  qx.Class.define("qx.ui.menu.AbstractButton", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],
    type: "abstract",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Use hard coded layout

      this._setLayout(new qx.ui.menu.ButtonLayout()); // Add listeners


      this.addListener("tap", this._onTap);
      this.addListener("keypress", this._onKeyPress); // Add command listener

      this.addListener("changeCommand", this._onChangeCommand, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      blockToolTip: {
        refine: true,
        init: true
      },

      /** The label text of the button */
      label: {
        check: "String",
        apply: "_applyLabel",
        nullable: true,
        event: "changeLabel"
      },

      /** Whether a sub menu should be shown and which one */
      menu: {
        check: "qx.ui.menu.Menu",
        apply: "_applyMenu",
        nullable: true,
        dereference: true,
        event: "changeMenu"
      },

      /** The icon to use */
      icon: {
        check: "String",
        apply: "_applyIcon",
        themeable: true,
        nullable: true,
        event: "changeIcon"
      },

      /** Indicates whether the label for the command (shortcut) should be visible or not. */
      showCommandLabel: {
        check: "Boolean",
        apply: "_applyShowCommandLabel",
        themeable: true,
        init: true,
        event: "changeShowCommandLabel"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "icon":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._add(control, {
              column: 0
            });

            break;

          case "label":
            control = new qx.ui.basic.Label();
            control.setAnonymous(true);

            this._add(control, {
              column: 1
            });

            break;

          case "shortcut":
            control = new qx.ui.basic.Label();
            control.setAnonymous(true);

            if (!this.getShowCommandLabel()) {
              control.exclude();
            }

            this._add(control, {
              column: 2
            });

            break;

          case "arrow":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._add(control, {
              column: 3
            });

            break;
        }

        return control || qx.ui.menu.AbstractButton.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        selected: 1
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the dimensions of all children
       *
       * @return {Array} Preferred width of each child
       */
      getChildrenSizes: function getChildrenSizes() {
        var iconWidth = 0,
            labelWidth = 0,
            shortcutWidth = 0,
            arrowWidth = 0;

        if (this._isChildControlVisible("icon")) {
          var icon = this.getChildControl("icon");
          iconWidth = icon.getMarginLeft() + icon.getSizeHint().width + icon.getMarginRight();
        }

        if (this._isChildControlVisible("label")) {
          var label = this.getChildControl("label");
          labelWidth = label.getMarginLeft() + label.getSizeHint().width + label.getMarginRight();
        }

        if (this._isChildControlVisible("shortcut")) {
          var shortcut = this.getChildControl("shortcut");
          shortcutWidth = shortcut.getMarginLeft() + shortcut.getSizeHint().width + shortcut.getMarginRight();
        }

        if (this._isChildControlVisible("arrow")) {
          var arrow = this.getChildControl("arrow");
          arrowWidth = arrow.getMarginLeft() + arrow.getSizeHint().width + arrow.getMarginRight();
        }

        return [iconWidth, labelWidth, shortcutWidth, arrowWidth];
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for tap
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onTap: function _onTap(e) {
        if (e.isLeftPressed()) {
          this.execute();
          qx.ui.menu.Manager.getInstance().hideAll();
        } // right click
        else {
            // only prevent contextmenu event if button has no further context menu.
            if (!this.getContextMenu()) {
              qx.ui.menu.Manager.getInstance().preventContextMenuOnce();
            }
          }
      },

      /**
       * Event listener for keypress event
       *
       * @param e {qx.event.type.KeySequence} keypress event
       */
      _onKeyPress: function _onKeyPress(e) {
        this.execute();
      },

      /**
       * Event listener for command changes. Updates the text of the shortcut.
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onChangeCommand: function _onChangeCommand(e) {
        var command = e.getData(); // do nothing if no command is set

        if (command == null) {
          return;
        }

        {
          var oldCommand = e.getOldData();

          if (!oldCommand) {
            qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
          }

          if (!command) {
            qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
          }
        }
        var cmdString = command != null ? command.toString() : "";
        this.getChildControl("shortcut").setValue(cmdString);
      },

      /**
       * Update command string on locale changes
       */
      _onChangeLocale: function _onChangeLocale(e) {
        var command = this.getCommand();

        if (command != null) {
          this.getChildControl("shortcut").setValue(command.toString());
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        if (value) {
          this._showChildControl("icon").setSource(value);
        } else {
          this._excludeChildControl("icon");
        }
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        if (value) {
          this._showChildControl("label").setValue(value);
        } else {
          this._excludeChildControl("label");
        }
      },
      // property apply
      _applyMenu: function _applyMenu(value, old) {
        if (old) {
          old.resetOpener();
          old.removeState("submenu");
        }

        if (value) {
          this._showChildControl("arrow");

          value.setOpener(this);
          value.addState("submenu");
        } else {
          this._excludeChildControl("arrow");
        }
      },
      // property apply
      _applyShowCommandLabel: function _applyShowCommandLabel(value, old) {
        if (value) {
          this._showChildControl("shortcut");
        } else {
          this._excludeChildControl("shortcut");
        }
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      this.removeListener("changeCommand", this._onChangeCommand, this);

      if (this.getMenu()) {
        if (!qx.core.ObjectRegistry.inShutDown) {
          this.getMenu().destroy();
        }
      }

      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      }
    }
  });
  qx.ui.menu.AbstractButton.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.Abstract": {
        "require": true
      },
      "qx.lang.Array": {},
      "qx.ui.layout.Util": {},
      "qx.ui.menu.Menu": {}
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
   * Layout used for the menu buttons which may contain four elements. A icon,
   * a label, a shortcut text and an arrow (for a sub menu)
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.ButtonLayout", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        this.assert(name == "column", "The property '" + name + "' is not supported by the MenuButton layout!");
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child;
        var column;
        var columnChildren = [];

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          column = child.getLayoutProperties().column;
          columnChildren[column] = child;
        }

        var menu = this.__getMenu(children[0]);

        var columns = menu.getColumnSizes();
        var spacing = menu.getSpacingX(); // stretch label column

        var neededWidth = qx.lang.Array.sum(columns) + spacing * (columns.length - 1);

        if (neededWidth < availWidth) {
          columns[1] += availWidth - neededWidth;
        }

        var left = padding.left,
            top = padding.top;
        var Util = qx.ui.layout.Util;

        for (var i = 0, l = columns.length; i < l; i++) {
          child = columnChildren[i];

          if (child) {
            var hint = child.getSizeHint();
            var childTop = top + Util.computeVerticalAlignOffset(child.getAlignY() || "middle", hint.height, availHeight, 0, 0);
            var offsetLeft = Util.computeHorizontalAlignOffset(child.getAlignX() || "left", hint.width, columns[i], child.getMarginLeft(), child.getMarginRight());
            child.renderLayout(left + offsetLeft, childTop, hint.width, hint.height);
          }

          if (columns[i] > 0) {
            left += columns[i] + spacing;
          }
        }
      },

      /**
       * Get the widget's menu
       *
       * @param widget {qx.ui.core.Widget} the widget to get the menu for
       * @return {qx.ui.menu.Menu} the menu
       */
      __getMenu: function __getMenu(widget) {
        while (!(widget instanceof qx.ui.menu.Menu)) {
          widget = widget.getLayoutParent();
        }

        return widget;
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var neededHeight = 0;
        var neededWidth = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var hint = children[i].getSizeHint();
          neededWidth += hint.width;
          neededHeight = Math.max(neededHeight, hint.height);
        }

        return {
          width: neededWidth,
          height: neededHeight
        };
      }
    }
  });
  qx.ui.menu.ButtonLayout.$$dbClassInfo = $$dbClassInfo;
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
   * The real menu button class which supports a command and an icon. All
   * other features are inherited from the {@link qx.ui.menu.AbstractButton}
   * class.
   */
  qx.Class.define("qx.ui.menu.Button", {
    extend: qx.ui.menu.AbstractButton,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Initial label
     * @param icon {String} Initial icon
     * @param command {qx.ui.command.Command} Initial command (shortcut)
     * @param menu {qx.ui.menu.Menu} Initial sub menu
     */
    construct: function construct(label, icon, command, menu) {
      qx.ui.menu.AbstractButton.constructor.call(this); // Initialize with incoming arguments

      if (label != null) {
        this.setLabel(label);
      }

      if (icon != null) {
        this.setIcon(icon);
      }

      if (command != null) {
        this.setCommand(command);
      }

      if (menu != null) {
        this.setMenu(menu);
      }
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
        init: "menu-button"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */
      // overridden
      _onTap: function _onTap(e) {
        if (e.isLeftPressed() && this.getMenu()) {
          this.execute(); // don't close menus if the button is a sub menu button

          this.getMenu().open();
          return;
        }

        qx.ui.menu.Button.prototype._onTap.base.call(this, e);
      }
    }
  });
  qx.ui.menu.Button.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-20.js.map
