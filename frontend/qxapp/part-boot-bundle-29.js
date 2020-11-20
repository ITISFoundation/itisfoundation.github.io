(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.VBox": {
        "require": true
      },
      "qx.lang.Array": {}
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
   * Layouter used by the qooxdoo menu's to render their buttons
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.Layout", {
    extend: qx.ui.layout.VBox,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Spacing between each cell on the menu buttons */
      columnSpacing: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /**
       * Whether a column and which column should automatically span
       * when the following cell is empty. Spanning may be disabled
       * through setting this property to <code>null</code>.
       */
      spanColumn: {
        check: "Integer",
        init: 1,
        nullable: true,
        apply: "_applyLayoutChange"
      },

      /** Default icon column width if no icons are rendered */
      iconColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyLayoutChange"
      },

      /** Default arrow column width if no sub menus are rendered */
      arrowColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyLayoutChange"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __columnSizes: null,

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var child, sizes, spacing;
        var spanColumn = this.getSpanColumn();
        var columnSizes = this.__columnSizes = [0, 0, 0, 0];
        var columnSpacing = this.getColumnSpacing();
        var spanColumnWidth = 0;
        var maxInset = 0; // Compute column sizes and insets

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child.isAnonymous()) {
            continue;
          }

          sizes = child.getChildrenSizes();

          for (var column = 0; column < sizes.length; column++) {
            if (spanColumn != null && column == spanColumn && sizes[spanColumn + 1] == 0) {
              spanColumnWidth = Math.max(spanColumnWidth, sizes[column]);
            } else {
              columnSizes[column] = Math.max(columnSizes[column], sizes[column]);
            }
          }

          var insets = children[i].getInsets();
          maxInset = Math.max(maxInset, insets.left + insets.right);
        } // Fix label column width is cases where the maximum button with no shortcut
        // is larger than the maximum button with a shortcut


        if (spanColumn != null && columnSizes[spanColumn] + columnSpacing + columnSizes[spanColumn + 1] < spanColumnWidth) {
          columnSizes[spanColumn] = spanColumnWidth - columnSizes[spanColumn + 1] - columnSpacing;
        } // When merging the cells for label and shortcut
        // ignore the spacing between them


        if (spanColumnWidth == 0) {
          spacing = columnSpacing * 2;
        } else {
          spacing = columnSpacing * 3;
        } // Fix zero size icon column


        if (columnSizes[0] == 0) {
          columnSizes[0] = this.getIconColumnWidth();
        } // Fix zero size arrow column


        if (columnSizes[3] == 0) {
          columnSizes[3] = this.getArrowColumnWidth();
        }

        var height = qx.ui.menu.Layout.prototype._computeSizeHint.base.call(this).height; // Build hint


        return {
          minHeight: height,
          height: height,
          width: qx.lang.Array.sum(columnSizes) + maxInset + spacing
        };
      },

      /*
      ---------------------------------------------------------------------------
        CUSTOM ADDONS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the column sizes detected during the pre-layout phase
       *
       * @return {Array} List of all column widths
       */
      getColumnSizes: function getColumnSizes() {
        return this.__columnSizes || null;
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__columnSizes = null;
    }
  });
  qx.ui.menu.Layout.$$dbClassInfo = $$dbClassInfo;
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
   * This widget draws a separator line between two instances of
   * {@link qx.ui.menu.AbstractButton} and is inserted into the
   * {@link qx.ui.menu.Menu}.
   *
   * For convenience reasons there is also
   * a method {@link qx.ui.menu.Menu#addSeparator} to append instances
   * of this class to the menu.
   */
  qx.Class.define("qx.ui.menu.Separator", {
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
        init: "menu-separator"
      },
      // overridden
      anonymous: {
        refine: true,
        init: true
      }
    }
  });
  qx.ui.menu.Separator.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.event.Registration": {
        "construct": true
      },
      "qx.bom.client.Event": {
        "construct": true
      },
      "qx.bom.Element": {
        "construct": true
      },
      "qx.event.Timer": {
        "construct": true
      },
      "qx.ui.menu.Menu": {},
      "qx.ui.menu.AbstractButton": {},
      "qx.lang.Array": {},
      "qx.ui.core.Widget": {},
      "qx.ui.menubar.Button": {},
      "qx.ui.menu.Button": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "event.touch": {
          "construct": true,
          "className": "qx.bom.client.Event"
        }
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
   * This singleton manages visible menu instances and supports some
   * core features to schedule menu open/close with timeout support.
   *
   * It also manages the whole keyboard support for the currently
   * registered widgets.
   *
   * The zIndex order is also managed by this class.
   */
  qx.Class.define("qx.ui.menu.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create data structure

      this.__objects = [];
      var el = document.body;
      var Registration = qx.event.Registration; // React on pointer/mouse events, but on native, to support inline applications

      Registration.addListener(window.document.documentElement, "pointerdown", this._onPointerDown, this, true);
      Registration.addListener(el, "roll", this._onRoll, this, true); // React on keypress events

      Registration.addListener(el, "keydown", this._onKeyUpDown, this, true);
      Registration.addListener(el, "keyup", this._onKeyUpDown, this, true);
      Registration.addListener(el, "keypress", this._onKeyPress, this, true); // only use the blur event to hide windows on non touch devices [BUG #4033]
      // When the menu is located on top of an iFrame, the select will fail

      if (!qx.core.Environment.get("event.touch")) {
        // Hide all when the window is blurred
        qx.bom.Element.addListener(window, "blur", this.hideAll, this);
      } // Create open timer


      this.__openTimer = new qx.event.Timer();

      this.__openTimer.addListener("interval", this._onOpenInterval, this); // Create close timer


      this.__closeTimer = new qx.event.Timer();

      this.__closeTimer.addListener("interval", this._onCloseInterval, this);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __scheduleOpen: null,
      __scheduleClose: null,
      __openTimer: null,
      __closeTimer: null,
      __objects: null,

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Query engine for menu children.
       *
       * @param menu {qx.ui.menu.Menu} Any menu instance
       * @param start {Integer} Child index to start with
       * @param iter {Integer} Iteration count, normally <code>+1</code> or <code>-1</code>
       * @param loop {Boolean?false} Whether to wrap when reaching the begin/end of the list
       * @return {qx.ui.menu.Button} Any menu button or <code>null</code>
       */
      _getChild: function _getChild(menu, start, iter, loop) {
        var children = menu.getChildren();
        var length = children.length;
        var child;

        for (var i = start; i < length && i >= 0; i += iter) {
          child = children[i];

          if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
            return child;
          }
        }

        if (loop) {
          i = i == length ? 0 : length - 1;

          for (; i != start; i += iter) {
            child = children[i];

            if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
              return child;
            }
          }
        }

        return null;
      },

      /**
       * Whether the given widget is inside any Menu instance.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Boolean} <code>true</code> when the widget is part of any menu
       */
      _isInMenu: function _isInMenu(widget) {
        while (widget) {
          if (widget instanceof qx.ui.menu.Menu) {
            return true;
          }

          widget = widget.getLayoutParent();
        }

        return false;
      },

      /**
       * Whether the given widget is one of the menu openers.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Boolean} <code>true</code> if the widget is a menu opener
       */
      _isMenuOpener: function _isMenuOpener(widget) {
        var menus = this.__objects;

        for (var i = 0; i < menus.length; i++) {
          if (menus[i].getOpener() === widget) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns an instance of a menu button if the given widget is a child
       *
       * @param widget {qx.ui.core.Widget} any widget
       * @return {qx.ui.menu.Button} Any menu button instance or <code>null</code>
       */
      _getMenuButton: function _getMenuButton(widget) {
        while (widget) {
          if (widget instanceof qx.ui.menu.AbstractButton) {
            return widget;
          }

          widget = widget.getLayoutParent();
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Adds a menu to the list of visible menus.
       *
       * @param obj {qx.ui.menu.Menu} Any menu instance.
       */
      add: function add(obj) {
        {
          if (!(obj instanceof qx.ui.menu.Menu)) {
            throw new Error("Object is no menu: " + obj);
          }
        }
        var reg = this.__objects;
        reg.push(obj);
        obj.setZIndex(1e6 + reg.length);
      },

      /**
       * Remove a menu from the list of visible menus.
       *
       * @param obj {qx.ui.menu.Menu} Any menu instance.
       */
      remove: function remove(obj) {
        {
          if (!(obj instanceof qx.ui.menu.Menu)) {
            throw new Error("Object is no menu: " + obj);
          }
        }
        var reg = this.__objects;

        if (reg) {
          qx.lang.Array.remove(reg, obj);
        }
      },

      /**
       * Hides all currently opened menus.
       */
      hideAll: function hideAll() {
        var reg = this.__objects;

        if (reg) {
          for (var i = reg.length - 1; i >= 0; i--) {
            reg[i].exclude();
          }
        }
      },

      /**
       * Returns the menu which was opened at last (which
       * is the active one this way)
       *
       * @return {qx.ui.menu.Menu} The current active menu or <code>null</code>
       */
      getActiveMenu: function getActiveMenu() {
        var reg = this.__objects;
        return reg.length > 0 ? reg[reg.length - 1] : null;
      },

      /*
      ---------------------------------------------------------------------------
        SCHEDULED OPEN/CLOSE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Schedules the given menu to be opened after the
       * {@link qx.ui.menu.Menu#openInterval} configured by the
       * menu instance itself.
       *
       * @param menu {qx.ui.menu.Menu} The menu to schedule for open
       */
      scheduleOpen: function scheduleOpen(menu) {
        // Cancel close of given menu first
        this.cancelClose(menu); // When the menu is already visible

        if (menu.isVisible()) {
          // Cancel all other open requests
          if (this.__scheduleOpen) {
            this.cancelOpen(this.__scheduleOpen);
          }
        } // When the menu is not visible and not scheduled already
        // then schedule it for opening
        else if (this.__scheduleOpen != menu) {
            // menu.debug("Schedule open");
            this.__scheduleOpen = menu;

            this.__openTimer.restartWith(menu.getOpenInterval());
          }
      },

      /**
       * Schedules the given menu to be closed after the
       * {@link qx.ui.menu.Menu#closeInterval} configured by the
       * menu instance itself.
       *
       * @param menu {qx.ui.menu.Menu} The menu to schedule for close
       */
      scheduleClose: function scheduleClose(menu) {
        // Cancel open of the menu first
        this.cancelOpen(menu); // When the menu is already invisible

        if (!menu.isVisible()) {
          // Cancel all other close requests
          if (this.__scheduleClose) {
            this.cancelClose(this.__scheduleClose);
          }
        } // When the menu is visible and not scheduled already
        // then schedule it for closing
        else if (this.__scheduleClose != menu) {
            // menu.debug("Schedule close");
            this.__scheduleClose = menu;

            this.__closeTimer.restartWith(menu.getCloseInterval());
          }
      },

      /**
       * When the given menu is scheduled for open this pending
       * request is canceled.
       *
       * @param menu {qx.ui.menu.Menu} The menu to cancel for open
       */
      cancelOpen: function cancelOpen(menu) {
        if (this.__scheduleOpen == menu) {
          // menu.debug("Cancel open");
          this.__openTimer.stop();

          this.__scheduleOpen = null;
        }
      },

      /**
       * When the given menu is scheduled for close this pending
       * request is canceled.
       *
       * @param menu {qx.ui.menu.Menu} The menu to cancel for close
       */
      cancelClose: function cancelClose(menu) {
        if (this.__scheduleClose == menu) {
          // menu.debug("Cancel close");
          this.__closeTimer.stop();

          this.__scheduleClose = null;
        }
      },

      /*
      ---------------------------------------------------------------------------
        TIMER EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for a pending open request. Configured to the interval
       * of the current menu to open.
       *
       * @param e {qx.event.type.Event} Interval event
       */
      _onOpenInterval: function _onOpenInterval(e) {
        // Stop timer
        this.__openTimer.stop(); // Open menu and reset flag


        this.__scheduleOpen.open();

        this.__scheduleOpen = null;
      },

      /**
       * Event listener for a pending close request. Configured to the interval
       * of the current menu to close.
       *
       * @param e {qx.event.type.Event} Interval event
       */
      _onCloseInterval: function _onCloseInterval(e) {
        // Stop timer, reset scheduling flag
        this.__closeTimer.stop(); // Close menu and reset flag


        this.__scheduleClose.exclude();

        this.__scheduleClose = null;
      },

      /*
      ---------------------------------------------------------------------------
        CONTEXTMENU EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Internal function registers a handler to stop next
       * <code>contextmenu</code> event.
       * This function will be called by {@link qx.ui.menu.Button#_onTap}, if
       * right click was pressed.
       *
       * @internal
       */
      preventContextMenuOnce: function preventContextMenuOnce() {
        qx.event.Registration.addListener(document.body, "contextmenu", this.__onPreventContextMenu, this, true);
      },

      /**
       * Internal event handler to stop <code>contextmenu</code> event bubbling,
       * if target is inside the opened menu.
       *
       * @param e {qx.event.type.Mouse} contextmenu event
       *
       * @internal
       */
      __onPreventContextMenu: function __onPreventContextMenu(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true);

        if (this._isInMenu(target)) {
          e.stopPropagation();
          e.preventDefault();
        } // stop only once


        qx.event.Registration.removeListener(document.body, "contextmenu", this.__onPreventContextMenu, this, true);
      },

      /*
      ---------------------------------------------------------------------------
        POINTER EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for pointerdown events
       *
       * @param e {qx.event.type.Pointer} pointerdown event
       */
      _onPointerDown: function _onPointerDown(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true); // If the target is 'null' the tap appears on a DOM element witch is not
        // a widget. This happens normally with an inline application, when the user
        // taps not in the inline application. In this case all all currently
        // open menus should be closed.

        if (target == null) {
          this.hideAll();
          return;
        } // If the target is the one which has opened the current menu
        // we ignore the pointerdown to let the button process the event
        // further with toggling or ignoring the tap.


        if (target.getMenu && target.getMenu() && target.getMenu().isVisible()) {
          return;
        } // All taps not inside a menu will hide all currently open menus


        if (this.__objects.length > 0 && !this._isInMenu(target)) {
          this.hideAll();
        }
      },

      /*
      ---------------------------------------------------------------------------
        KEY EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} Map of all keys working on an active menu selection
       * @lint ignoreReferenceField(__selectionKeys)
       */
      __selectionKeys: {
        "Enter": 1,
        "Space": 1
      },

      /**
       * @type {Map} Map of all keys working without a selection
       * @lint ignoreReferenceField(__navigationKeys)
       */
      __navigationKeys: {
        "Escape": 1,
        "Up": 1,
        "Down": 1,
        "Left": 1,
        "Right": 1
      },

      /**
       * Event handler for all keyup/keydown events. Stops all events
       * when any menu is opened.
       *
       * @param e {qx.event.type.KeySequence} Keyboard event
       */
      _onKeyUpDown: function _onKeyUpDown(e) {
        var menu = this.getActiveMenu();

        if (!menu) {
          return;
        } // Stop for all supported key combos


        var iden = e.getKeyIdentifier();

        if (this.__navigationKeys[iden] || this.__selectionKeys[iden] && menu.getSelectedButton()) {
          e.stopPropagation();
        }
      },

      /**
       * Event handler for all keypress events. Delegates the event to the more
       * specific methods defined in this class.
       *
       * Currently processes the keys: <code>Up</code>, <code>Down</code>,
       * <code>Left</code>, <code>Right</code> and <code>Enter</code>.
       *
       * @param e {qx.event.type.KeySequence} Keyboard event
       */
      _onKeyPress: function _onKeyPress(e) {
        var menu = this.getActiveMenu();

        if (!menu) {
          return;
        }

        var iden = e.getKeyIdentifier();
        var navigation = this.__navigationKeys[iden];
        var selection = this.__selectionKeys[iden];

        if (navigation) {
          switch (iden) {
            case "Up":
              this._onKeyPressUp(menu);

              break;

            case "Down":
              this._onKeyPressDown(menu);

              break;

            case "Left":
              this._onKeyPressLeft(menu);

              break;

            case "Right":
              this._onKeyPressRight(menu);

              break;

            case "Escape":
              this.hideAll();
              break;
          }

          e.stopPropagation();
          e.preventDefault();
        } else if (selection) {
          // Do not process these events when no item is hovered
          var button = menu.getSelectedButton();

          if (button) {
            switch (iden) {
              case "Enter":
                this._onKeyPressEnter(menu, button, e);

                break;

              case "Space":
                this._onKeyPressSpace(menu, button, e);

                break;
            }

            e.stopPropagation();
            e.preventDefault();
          }
        }
      },

      /**
       * Event handler for <code>Up</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressUp: function _onKeyPressUp(menu) {
        // Query for previous child
        var selectedButton = menu.getSelectedButton();
        var children = menu.getChildren();
        var start = selectedButton ? menu.indexOf(selectedButton) - 1 : children.length - 1;

        var nextItem = this._getChild(menu, start, -1, true); // Reconfigure property


        if (nextItem) {
          menu.setSelectedButton(nextItem);
        } else {
          menu.resetSelectedButton();
        }
      },

      /**
       * Event handler for <code>Down</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressDown: function _onKeyPressDown(menu) {
        // Query for next child
        var selectedButton = menu.getSelectedButton();
        var start = selectedButton ? menu.indexOf(selectedButton) + 1 : 0;

        var nextItem = this._getChild(menu, start, 1, true); // Reconfigure property


        if (nextItem) {
          menu.setSelectedButton(nextItem);
        } else {
          menu.resetSelectedButton();
        }
      },

      /**
       * Event handler for <code>Left</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressLeft: function _onKeyPressLeft(menu) {
        var menuOpener = menu.getOpener();

        if (!menuOpener) {
          return;
        } // Back to the "parent" menu


        if (menuOpener instanceof qx.ui.menu.AbstractButton) {
          var parentMenu = menuOpener.getLayoutParent();
          parentMenu.resetOpenedButton();
          parentMenu.setSelectedButton(menuOpener);
        } // Goto the previous toolbar button
        else if (menuOpener instanceof qx.ui.menubar.Button) {
            var buttons = menuOpener.getMenuBar().getMenuButtons();
            var index = buttons.indexOf(menuOpener); // This should not happen, definitely!

            if (index === -1) {
              return;
            } // Get previous button, fallback to end if first arrived


            var prevButton = null;
            var length = buttons.length;

            for (var i = 1; i <= length; i++) {
              var button = buttons[(index - i + length) % length];

              if (button.isEnabled() && button.isVisible()) {
                prevButton = button;
                break;
              }
            }

            if (prevButton && prevButton != menuOpener) {
              prevButton.open(true);
            }
          }
      },

      /**
       * Event handler for <code>Right</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressRight: function _onKeyPressRight(menu) {
        var selectedButton = menu.getSelectedButton(); // Open sub-menu of hovered item and select first child

        if (selectedButton) {
          var subMenu = selectedButton.getMenu();

          if (subMenu) {
            // Open previously hovered item
            menu.setOpenedButton(selectedButton); // Hover first item in new submenu

            var first = this._getChild(subMenu, 0, 1);

            if (first) {
              subMenu.setSelectedButton(first);
            }

            return;
          }
        } // No hover and no open item
        // When first button has a menu, open it, otherwise only hover it
        else if (!menu.getOpenedButton()) {
            var first = this._getChild(menu, 0, 1);

            if (first) {
              menu.setSelectedButton(first);

              if (first.getMenu()) {
                menu.setOpenedButton(first);
              }

              return;
            }
          } // Jump to the next toolbar button


        var menuOpener = menu.getOpener(); // Look up opener hierarchy for menu button

        if (menuOpener instanceof qx.ui.menu.Button && selectedButton) {
          // From one inner selected button try to find the top level
          // menu button which has opened the whole menu chain.
          while (menuOpener) {
            menuOpener = menuOpener.getLayoutParent();

            if (menuOpener instanceof qx.ui.menu.Menu) {
              menuOpener = menuOpener.getOpener();

              if (menuOpener instanceof qx.ui.menubar.Button) {
                break;
              }
            } else {
              break;
            }
          }

          if (!menuOpener) {
            return;
          }
        } // Ask the toolbar for the next menu button


        if (menuOpener instanceof qx.ui.menubar.Button) {
          var buttons = menuOpener.getMenuBar().getMenuButtons();
          var index = buttons.indexOf(menuOpener); // This should not happen, definitely!

          if (index === -1) {
            return;
          } // Get next button, fallback to first if end arrived


          var nextButton = null;
          var length = buttons.length;

          for (var i = 1; i <= length; i++) {
            var button = buttons[(index + i) % length];

            if (button.isEnabled() && button.isVisible()) {
              nextButton = button;
              break;
            }
          }

          if (nextButton && nextButton != menuOpener) {
            nextButton.open(true);
          }
        }
      },

      /**
       * Event handler for <code>Enter</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       * @param button {qx.ui.menu.AbstractButton} The selected button
       * @param e {qx.event.type.KeySequence} The keypress event
       */
      _onKeyPressEnter: function _onKeyPressEnter(menu, button, e) {
        // Route keypress event to the selected button
        if (button.hasListener("keypress")) {
          // Clone and reconfigure event
          var clone = e.clone();
          clone.setBubbles(false);
          clone.setTarget(button); // Finally dispatch the clone

          button.dispatchEvent(clone);
        } // Hide all open menus


        this.hideAll();
      },

      /**
       * Event handler for <code>Space</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       * @param button {qx.ui.menu.AbstractButton} The selected button
       * @param e {qx.event.type.KeySequence} The keypress event
       */
      _onKeyPressSpace: function _onKeyPressSpace(menu, button, e) {
        // Route keypress event to the selected button
        if (button.hasListener("keypress")) {
          // Clone and reconfigure event
          var clone = e.clone();
          clone.setBubbles(false);
          clone.setTarget(button); // Finally dispatch the clone

          button.dispatchEvent(clone);
        }
      },

      /**
       * Event handler for roll which hides all windows on scroll.
       *
       * @param e {qx.event.type.Roll} The roll event.
       */
      _onRoll: function _onRoll(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true);

        if (this.__objects.length > 0 && !this._isInMenu(target) && !this._isMenuOpener(target) && !e.getMomentum()) {
          this.hideAll();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      var Registration = qx.event.Registration;
      var el = document.body; // React on pointerdown events

      Registration.removeListener(window.document.documentElement, "pointerdown", this._onPointerDown, this, true); // React on keypress events

      Registration.removeListener(el, "keydown", this._onKeyUpDown, this, true);
      Registration.removeListener(el, "keyup", this._onKeyUpDown, this, true);
      Registration.removeListener(el, "keypress", this._onKeyPress, this, true);

      this._disposeObjects("__openTimer", "__closeTimer");

      this._disposeArray("__objects");
    }
  });
  qx.ui.menu.Manager.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.SlideBar": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.HoverButton": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The MenuSlideBar is used to scroll menus if they don't fit on the screen.
   *
   * @childControl button-forward {qx.ui.form.HoverButton} scrolls forward of hovered
   * @childControl button-backward {qx.ui.form.HoverButton} scrolls backward if hovered
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.MenuSlideBar", {
    extend: qx.ui.container.SlideBar,
    construct: function construct() {
      qx.ui.container.SlideBar.constructor.call(this, "vertical");
    },
    properties: {
      appearance: {
        refine: true,
        init: "menu-slidebar"
      }
    },
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "button-forward":
            control = new qx.ui.form.HoverButton();
            control.addListener("execute", this._onExecuteForward, this);

            this._addAt(control, 2);

            break;

          case "button-backward":
            control = new qx.ui.form.HoverButton();
            control.addListener("execute", this._onExecuteBackward, this);

            this._addAt(control, 0);

            break;
        }

        return control || qx.ui.menu.MenuSlideBar.prototype._createChildControlImpl.base.call(this, id);
      }
    }
  });
  qx.ui.menu.MenuSlideBar.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.IWindowManager": {}
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
   * All parent widgets of windows must implement this interface.
   */
  qx.Interface.define("qx.ui.window.IDesktop", {
    members: {
      /**
       * Sets the desktop's window manager
       *
       * @param manager {qx.ui.window.IWindowManager} The window manager
       */
      setWindowManager: function setWindowManager(manager) {
        this.assertInterface(manager, qx.ui.window.IWindowManager);
      },

      /**
       * Get a list of all windows added to the desktop (including hidden windows)
       *
       * @return {qx.ui.window.Window[]} Array of managed windows
       */
      getWindows: function getWindows() {},

      /**
       * Whether the configured layout supports a maximized window
       * e.g. is a Canvas.
       *
       * @return {Boolean} Whether the layout supports maximized windows
       */
      supportsMaximize: function supportsMaximize() {},

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this.assertInteger(zIndex);
      },

      /**
       * Remove the blocker.
       */
      unblock: function unblock() {},

      /**
       * Whether the widget is currently blocked
       *
       * @return {Boolean} whether the widget is blocked.
       */
      isBlocked: function isBlocked() {}
    }
  });
  qx.ui.window.IDesktop.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-29.js.map
