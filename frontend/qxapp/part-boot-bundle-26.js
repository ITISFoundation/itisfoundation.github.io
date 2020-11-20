(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "usage": "dynamic",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.scroll.ScrollBar": {}
    },
    "environment": {
      "provided": ["qx.nativeScrollBars"],
      "required": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */
  qx.core.Environment.add("qx.nativeScrollBars", false);
  /**
   * Include this widget if you want to create scrollbars depending on the global
   * "qx.nativeScrollBars" setting.
   */

  qx.Mixin.define("qx.ui.core.scroll.MScrollBarFactory", {
    members: {
      /**
       * Creates a new scrollbar. This can either be a styled qooxdoo scrollbar
       * or a native browser scrollbar.
       *
       * @param orientation {String?"horizontal"} The initial scroll bar orientation
       * @return {qx.ui.core.scroll.IScrollBar} The scrollbar instance
       */
      _createScrollBar: function _createScrollBar(orientation) {
        {
          return new qx.ui.core.scroll.ScrollBar(orientation);
        }
      }
    }
  });
  qx.ui.core.scroll.MScrollBarFactory.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
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
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mixin holding the handler for roll event. Please
   * keep in mind that the including widget has to have the scroll bars
   * implemented as child controls named <code>scrollbar-x</code> and
   * <code>scrollbar-y</code> to get the handler working. Also, you have to
   * attach the listener yourself.
   */
  qx.Mixin.define("qx.ui.core.scroll.MRoll", {
    members: {
      _cancelRoll: null,

      /**
       * Responsible for adding the event listener needed for scroll handling.
       */
      _addRollHandling: function _addRollHandling() {
        this.addListener("roll", this._onRoll, this);
        this.addListener("pointerdown", this._onPointerDownForRoll, this);
      },

      /**
       * Responsible for removing the event listener needed for scroll handling.
       */
      _removeRollHandling: function _removeRollHandling() {
        this.removeListener("roll", this._onRoll, this);
        this.removeListener("pointerdown", this._onPointerDownForRoll, this);
      },

      /**
       * Handler for the pointerdown event which simply stops the momentum scrolling.
       *
       * @param e {qx.event.type.Pointer} pointerdown event
       */
      _onPointerDownForRoll: function _onPointerDownForRoll(e) {
        this._cancelRoll = e.getPointerId();
      },

      /**
       * Roll event handler
       *
       * @param e {qx.event.type.Roll} Roll event
       */
      _onRoll: function _onRoll(e) {
        // only wheel and touch
        if (e.getPointerType() == "mouse") {
          return;
        }

        if (this._cancelRoll && e.getMomentum()) {
          e.stopMomentum();
          this._cancelRoll = null;
          return;
        }

        this._cancelRoll = null;

        var showX = this._isChildControlVisible("scrollbar-x");

        var showY = this._isChildControlVisible("scrollbar-y");

        var scrollbarY = showY ? this.getChildControl("scrollbar-y", true) : null;
        var scrollbarX = showX ? this.getChildControl("scrollbar-x", true) : null;
        var deltaY = e.getDelta().y;
        var deltaX = e.getDelta().x;
        var endY = !showY;
        var endX = !showX; // y case

        if (scrollbarY) {
          if (deltaY !== 0) {
            scrollbarY.scrollBy(parseInt(deltaY, 10));
          }

          var position = scrollbarY.getPosition();
          var max = scrollbarY.getMaximum(); // pass the event to the parent if the scrollbar is at an edge

          if (deltaY < 0 && position <= 0 || deltaY > 0 && position >= max) {
            endY = true;
          }
        } // x case


        if (scrollbarX) {
          if (deltaX !== 0) {
            scrollbarX.scrollBy(parseInt(deltaX, 10));
          }

          var position = scrollbarX.getPosition();
          var max = scrollbarX.getMaximum(); // pass the event to the parent if the scrollbar is at an edge

          if (deltaX < 0 && position <= 0 || deltaX > 0 && position >= max) {
            endX = true;
          }
        }

        if (endX && endY) {
          e.stopMomentum();
        } // pass the event to the parent if both scrollbars are at the end


        if (!endY && deltaX === 0 || !endX && deltaY === 0 || (!endX || !endY) && deltaX !== 0 && deltaY !== 0) {
          // Stop bubbling and native event only if a scrollbar is visible
          e.stop();
        }
      }
    }
  });
  qx.ui.core.scroll.MRoll.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.DragDropScrolling": {
        "construct": true
      },
      "qx.Class": {},
      "qx.ui.core.scroll.MScrollBarFactory": {},
      "qx.ui.core.Widget": {},
      "qx.event.Timer": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2013 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Richard Sternagel (rsternagel)
  
  ************************************************************************ */

  /**
   * Provides scrolling ability during drag session to the widget.
   */
  qx.Mixin.define("qx.ui.core.MDragDropScrolling", {
    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      var widget = this;

      if (this instanceof qx.ui.core.DragDropScrolling) {
        widget = this._getWidget();
      }

      widget.addListener("drag", this.__onDrag, this);
      widget.addListener("dragend", this.__onDragend, this);
      this.__xDirs = ["left", "right"];
      this.__yDirs = ["top", "bottom"];
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The threshold for the x-axis (in pixel) to activate scrolling at the edges. */
      dragScrollThresholdX: {
        check: "Integer",
        init: 30
      },

      /** The threshold for the y-axis (in pixel) to activate scrolling at the edges. */
      dragScrollThresholdY: {
        check: "Integer",
        init: 30
      },

      /** The factor for slowing down the scrolling. */
      dragScrollSlowDownFactor: {
        check: "Float",
        init: 0.1
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __dragScrollTimer: null,
      __xDirs: null,
      __yDirs: null,

      /**
       * Finds the first scrollable parent (in the parent chain).
       *
       * @param widget {qx.ui.core.LayoutItem} The widget to start from.
       * @return {qx.ui.core.Widget} A scrollable widget.
       */
      _findScrollableParent: function _findScrollableParent(widget) {
        var cur = widget;

        if (cur === null) {
          return null;
        }

        while (cur.getLayoutParent()) {
          cur = cur.getLayoutParent();

          if (this._isScrollable(cur)) {
            return cur;
          }
        }

        return null;
      },

      /**
       * Whether the widget is scrollable.
       *
       * @param widget {qx.ui.core.Widget} The widget to check.
       * @return {Boolean} Whether the widget is scrollable.
       */
      _isScrollable: function _isScrollable(widget) {
        return qx.Class.hasMixin(widget.constructor, qx.ui.core.scroll.MScrollBarFactory);
      },

      /**
       * Gets the bounds of the given scrollable.
       *
       * @param scrollable {qx.ui.core.Widget} Scrollable which has scrollbar child controls.
       * @return {Map} A map with all four bounds (e.g. {"left":0, "top":20, "right":0, "bottom":80}).
       */
      _getBounds: function _getBounds(scrollable) {
        var bounds = scrollable.getContentLocation(); // the scrollable may dictate a nested widget for more precise bounds

        if (scrollable.getScrollAreaContainer) {
          bounds = scrollable.getScrollAreaContainer().getContentLocation();
        }

        return bounds;
      },

      /**
       * Gets the edge type or null if the pointer isn't within one of the thresholds.
       *
       * @param diff {Map} Difference map with all for edgeTypes.
       * @param thresholdX {Number} x-axis threshold.
       * @param thresholdY {Number} y-axis threshold.
       * @return {String} One of the four edgeTypes ('left', 'right', 'top', 'bottom').
       */
      _getEdgeType: function _getEdgeType(diff, thresholdX, thresholdY) {
        if (diff.left * -1 <= thresholdX && diff.left < 0) {
          return "left";
        } else if (diff.top * -1 <= thresholdY && diff.top < 0) {
          return "top";
        } else if (diff.right <= thresholdX && diff.right > 0) {
          return "right";
        } else if (diff.bottom <= thresholdY && diff.bottom > 0) {
          return "bottom";
        } else {
          return null;
        }
      },

      /**
       * Gets the axis ('x' or 'y') by the edge type.
       *
       * @param edgeType {String} One of the four edgeTypes ('left', 'right', 'top', 'bottom').
       * @throws {Error} If edgeType is not one of the distinct four ones.
       * @return {String} Returns 'y' or 'x'.
       */
      _getAxis: function _getAxis(edgeType) {
        if (this.__xDirs.indexOf(edgeType) !== -1) {
          return "x";
        } else if (this.__yDirs.indexOf(edgeType) !== -1) {
          return "y";
        } else {
          throw new Error("Invalid edge type given (" + edgeType + "). Must be: 'left', 'right', 'top' or 'bottom'");
        }
      },

      /**
       * Gets the threshold amount by edge type.
       *
       * @param edgeType {String} One of the four edgeTypes ('left', 'right', 'top', 'bottom').
       * @return {Number} The threshold of the x or y axis.
       */
      _getThresholdByEdgeType: function _getThresholdByEdgeType(edgeType) {
        if (this.__xDirs.indexOf(edgeType) !== -1) {
          return this.getDragScrollThresholdX();
        } else if (this.__yDirs.indexOf(edgeType) !== -1) {
          return this.getDragScrollThresholdY();
        }
      },

      /**
       * Whether the scrollbar is visible.
       *
       * @param scrollable {qx.ui.core.Widget} Scrollable which has scrollbar child controls.
       * @param axis {String} Can be 'y' or 'x'.
       * @return {Boolean} Whether the scrollbar is visible.
       */
      _isScrollbarVisible: function _isScrollbarVisible(scrollable, axis) {
        if (scrollable && scrollable._isChildControlVisible) {
          return scrollable._isChildControlVisible("scrollbar-" + axis);
        } else {
          return false;
        }
      },

      /**
       * Whether the scrollbar is exceeding it's maximum position.
       *
       * @param scrollbar {qx.ui.core.scroll.IScrollBar} Scrollbar to check.
       * @param axis {String} Can be 'y' or 'x'.
       * @param amount {Number} Amount to scroll which may be negative.
       * @return {Boolean} Whether the amount will exceed the scrollbar max position.
       */
      _isScrollbarExceedingMaxPos: function _isScrollbarExceedingMaxPos(scrollbar, axis, amount) {
        var newPos = 0;

        if (!scrollbar) {
          return true;
        }

        newPos = scrollbar.getPosition() + amount;
        return newPos > scrollbar.getMaximum() || newPos < 0;
      },

      /**
       * Calculates the threshold exceedance (which may be negative).
       *
       * @param diff {Number} Difference value of one edgeType.
       * @param threshold {Number} x-axis or y-axis threshold.
       * @return {Number} Threshold exceedance amount (positive or negative).
       */
      _calculateThresholdExceedance: function _calculateThresholdExceedance(diff, threshold) {
        var amount = threshold - Math.abs(diff);
        return diff < 0 ? amount * -1 : amount;
      },

      /**
       * Calculates the scroll amount (which may be negative).
       * The amount is influenced by the scrollbar size (bigger = faster)
       * the exceedanceAmount (bigger = faster) and the slowDownFactor.
       *
       * @param scrollbarSize {Number} Size of the scrollbar.
       * @param exceedanceAmount {Number} Threshold exceedance amount (positive or negative).
       * @return {Number} Scroll amount (positive or negative).
       */
      _calculateScrollAmount: function _calculateScrollAmount(scrollbarSize, exceedanceAmount) {
        return Math.floor(scrollbarSize / 100 * exceedanceAmount * this.getDragScrollSlowDownFactor());
      },

      /**
       * Scrolls the given scrollable on the given axis for the given amount.
       *
       * @param scrollable {qx.ui.core.Widget} Scrollable which has scrollbar child controls.
       * @param axis {String} Can be 'y' or 'x'.
       * @param exceedanceAmount {Number} Threshold exceedance amount (positive or negative).
       */
      _scrollBy: function _scrollBy(scrollable, axis, exceedanceAmount) {
        var scrollbar = scrollable.getChildControl("scrollbar-" + axis, true);

        if (!scrollbar) {
          return;
        }

        var bounds = scrollbar.getBounds(),
            scrollbarSize = axis === "x" ? bounds.width : bounds.height,
            amount = this._calculateScrollAmount(scrollbarSize, exceedanceAmount);

        if (this._isScrollbarExceedingMaxPos(scrollbar, axis, amount)) {
          this.__dragScrollTimer.stop();
        }

        scrollbar.scrollBy(amount);
      },

      /*
      ---------------------------------------------------------------------------
      EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the drag event.
       *
       * @param e {qx.event.type.Drag} The drag event instance.
       */
      __onDrag: function __onDrag(e) {
        if (this.__dragScrollTimer) {
          // stop last scroll action
          this.__dragScrollTimer.stop();
        }

        var target;

        if (e.getOriginalTarget() instanceof qx.ui.core.Widget) {
          target = e.getOriginalTarget();
        } else {
          target = qx.ui.core.Widget.getWidgetByElement(e.getOriginalTarget());
        }

        if (!target) {
          return;
        }

        var scrollable;

        if (this._isScrollable(target)) {
          scrollable = target;
        } else {
          scrollable = this._findScrollableParent(target);
        }

        while (scrollable) {
          var bounds = this._getBounds(scrollable),
              xPos = e.getDocumentLeft(),
              yPos = e.getDocumentTop(),
              diff = {
            "left": bounds.left - xPos,
            "right": bounds.right - xPos,
            "top": bounds.top - yPos,
            "bottom": bounds.bottom - yPos
          },
              edgeType = null,
              axis = "",
              exceedanceAmount = 0;

          edgeType = this._getEdgeType(diff, this.getDragScrollThresholdX(), this.getDragScrollThresholdY());

          if (!edgeType) {
            scrollable = this._findScrollableParent(scrollable);
            continue;
          }

          axis = this._getAxis(edgeType);

          if (this._isScrollbarVisible(scrollable, axis)) {
            exceedanceAmount = this._calculateThresholdExceedance(diff[edgeType], this._getThresholdByEdgeType(edgeType));

            if (this.__dragScrollTimer) {
              this.__dragScrollTimer.dispose();
            }

            this.__dragScrollTimer = new qx.event.Timer(50);

            this.__dragScrollTimer.addListener("interval", function (scrollable, axis, amount) {
              this._scrollBy(scrollable, axis, amount);
            }.bind(this, scrollable, axis, exceedanceAmount));

            this.__dragScrollTimer.start();

            e.stopPropagation();
            return;
          } else {
            scrollable = this._findScrollableParent(scrollable);
          }
        }
      },

      /**
       * Event handler for the dragend event.
       *
       * @param e {qx.event.type.Drag} The drag event instance.
       */
      __onDragend: function __onDragend(e) {
        if (this.__dragScrollTimer) {
          this.__dragScrollTimer.stop();
        }
      }
    },
    destruct: function destruct() {
      if (this.__dragScrollTimer) {
        this.__dragScrollTimer.dispose();
      }
    }
  });
  qx.ui.core.MDragDropScrolling.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MDragDropScrolling": {
        "require": true
      },
      "qx.core.Init": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * Provides scrolling ability during drag session to the widget.
   */
  qx.Class.define("qx.ui.core.DragDropScrolling", {
    extend: qx.core.Object,
    include: [qx.ui.core.MDragDropScrolling],
    construct: function construct(widget) {
      qx.core.Object.constructor.call(this);
      this._widget = widget;
    },
    members: {
      _widget: null,

      /**
       * Returns the root widget whose children will have scroll on drag session
       * behavior. Widget was set on constructor or will be application root by
       * default.
       *
       * @return {qx.ui.core.Widget} The root widget whose children will have
       * scroll on drag session
       */
      _getWidget: function _getWidget() {
        return this._widget || qx.core.Init.getApplication().getRoot();
      }
    }
  });
  qx.ui.core.DragDropScrolling.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.scroll.MScrollBarFactory": {
        "require": true
      },
      "qx.ui.core.scroll.MRoll": {
        "require": true
      },
      "qx.ui.core.MDragDropScrolling": {
        "require": true
      },
      "qx.bom.client.Scroll": {
        "construct": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.layout.Grid": {
        "construct": true
      },
      "qx.ui.core.scroll.ScrollPane": {},
      "qx.ui.core.queue.Manager": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.scrollBarOverlayed": {
          "construct": true,
          "className": "qx.bom.client.Scroll"
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The ScrollArea provides a container widget with on demand scroll bars
   * if the content size exceeds the size of the container.
   *
   * @childControl pane {qx.ui.core.scroll.ScrollPane} pane which holds the content to scroll
   * @childControl scrollbar-x {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar} horizontal scrollbar
   * @childControl scrollbar-y {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar} vertical scrollbar
   * @childControl corner {qx.ui.core.Widget} corner where no scrollbar is shown
   */
  qx.Class.define("qx.ui.core.scroll.AbstractScrollArea", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.scroll.MScrollBarFactory, qx.ui.core.scroll.MRoll, qx.ui.core.MDragDropScrolling],
    type: "abstract",

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * The default width which is used for the width of the scroll bar if
       * overlaid.
       */
      DEFAULT_SCROLLBAR_WIDTH: 14
    },

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);

      if (qx.core.Environment.get("os.scrollBarOverlayed")) {
        // use a plain canvas to overlay the scroll bars
        this._setLayout(new qx.ui.layout.Canvas());
      } else {
        // Create 'fixed' grid layout
        var grid = new qx.ui.layout.Grid();
        grid.setColumnFlex(0, 1);
        grid.setRowFlex(0, 1);

        this._setLayout(grid);
      } // since the scroll container disregards the min size of the scrollbars
      // we have to set the min size of the scroll area to ensure that the
      // scrollbars always have an usable size.


      var size = qx.ui.core.scroll.AbstractScrollArea.DEFAULT_SCROLLBAR_WIDTH * 2 + 14;
      this.set({
        minHeight: size,
        minWidth: size
      }); // Roll listener for scrolling

      this._addRollHandling();
    },
    events: {
      /** Fired as soon as the scroll animation in X direction ends. */
      scrollAnimationXEnd: 'qx.event.type.Event',

      /** Fired as soon as the scroll animation in Y direction ends. */
      scrollAnimationYEnd: 'qx.event.type.Event'
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
        init: "scrollarea"
      },

      /**
       * The policy, when the horizontal scrollbar should be shown.
       * <ul>
       *   <li><b>auto</b>: Show scrollbar on demand</li>
       *   <li><b>on</b>: Always show the scrollbar</li>
       *   <li><b>off</b>: Never show the scrollbar</li>
       * </ul>
       */
      scrollbarX: {
        check: ["auto", "on", "off"],
        init: "auto",
        themeable: true,
        apply: "_computeScrollbars"
      },

      /**
       * The policy, when the horizontal scrollbar should be shown.
       * <ul>
       *   <li><b>auto</b>: Show scrollbar on demand</li>
       *   <li><b>on</b>: Always show the scrollbar</li>
       *   <li><b>off</b>: Never show the scrollbar</li>
       * </ul>
       */
      scrollbarY: {
        check: ["auto", "on", "off"],
        init: "auto",
        themeable: true,
        apply: "_computeScrollbars"
      },

      /**
       * Group property, to set the overflow of both scroll bars.
       */
      scrollbar: {
        group: ["scrollbarX", "scrollbarY"]
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
        CHILD CONTROL SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "pane":
            control = new qx.ui.core.scroll.ScrollPane();
            control.addListener("update", this._computeScrollbars, this);
            control.addListener("scrollX", this._onScrollPaneX, this);
            control.addListener("scrollY", this._onScrollPaneY, this);

            if (qx.core.Environment.get("os.scrollBarOverlayed")) {
              this._add(control, {
                edge: 0
              });
            } else {
              this._add(control, {
                row: 0,
                column: 0
              });
            }

            break;

          case "scrollbar-x":
            control = this._createScrollBar("horizontal");
            control.setMinWidth(0);
            control.exclude();
            control.addListener("scroll", this._onScrollBarX, this);
            control.addListener("changeVisibility", this._onChangeScrollbarXVisibility, this);
            control.addListener("scrollAnimationEnd", this._onScrollAnimationEnd.bind(this, "X"));

            if (qx.core.Environment.get("os.scrollBarOverlayed")) {
              control.setMinHeight(qx.ui.core.scroll.AbstractScrollArea.DEFAULT_SCROLLBAR_WIDTH);

              this._add(control, {
                bottom: 0,
                right: 0,
                left: 0
              });
            } else {
              this._add(control, {
                row: 1,
                column: 0
              });
            }

            break;

          case "scrollbar-y":
            control = this._createScrollBar("vertical");
            control.setMinHeight(0);
            control.exclude();
            control.addListener("scroll", this._onScrollBarY, this);
            control.addListener("changeVisibility", this._onChangeScrollbarYVisibility, this);
            control.addListener("scrollAnimationEnd", this._onScrollAnimationEnd.bind(this, "Y"));

            if (qx.core.Environment.get("os.scrollBarOverlayed")) {
              control.setMinWidth(qx.ui.core.scroll.AbstractScrollArea.DEFAULT_SCROLLBAR_WIDTH);

              this._add(control, {
                right: 0,
                bottom: 0,
                top: 0
              });
            } else {
              this._add(control, {
                row: 0,
                column: 1
              });
            }

            break;

          case "corner":
            control = new qx.ui.core.Widget();
            control.setWidth(0);
            control.setHeight(0);
            control.exclude();

            if (!qx.core.Environment.get("os.scrollBarOverlayed")) {
              // only add for non overlayed scroll bars
              this._add(control, {
                row: 1,
                column: 1
              });
            }

            break;
        }

        return control || qx.ui.core.scroll.AbstractScrollArea.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        PANE SIZE
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the dimensions of the pane.
       *
       * @return {Map|null} The pane dimension in pixel. Contains
       *    the keys <code>width</code> and <code>height</code>.
       */
      getPaneSize: function getPaneSize() {
        return this.getChildControl("pane").getInnerSize();
      },

      /*
      ---------------------------------------------------------------------------
        ITEM LOCATION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the top offset of the given item in relation to the
       * inner height of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Top offset
       */
      getItemTop: function getItemTop(item) {
        return this.getChildControl("pane").getItemTop(item);
      },

      /**
       * Returns the top offset of the end of the given item in relation to the
       * inner height of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Top offset
       */
      getItemBottom: function getItemBottom(item) {
        return this.getChildControl("pane").getItemBottom(item);
      },

      /**
       * Returns the left offset of the given item in relation to the
       * inner width of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Top offset
       */
      getItemLeft: function getItemLeft(item) {
        return this.getChildControl("pane").getItemLeft(item);
      },

      /**
       * Returns the left offset of the end of the given item in relation to the
       * inner width of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Right offset
       */
      getItemRight: function getItemRight(item) {
        return this.getChildControl("pane").getItemRight(item);
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls the element's content to the given left coordinate
       *
       * @param value {Integer} The vertical position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollToX: function scrollToX(value, duration) {
        // First flush queue before scroll
        qx.ui.core.queue.Manager.flush();
        this.getChildControl("scrollbar-x").scrollTo(value, duration);
      },

      /**
       * Scrolls the element's content by the given left offset
       *
       * @param value {Integer} The vertical position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollByX: function scrollByX(value, duration) {
        // First flush queue before scroll
        qx.ui.core.queue.Manager.flush();
        this.getChildControl("scrollbar-x").scrollBy(value, duration);
      },

      /**
       * Returns the scroll left position of the content
       *
       * @return {Integer} Horizontal scroll position
       */
      getScrollX: function getScrollX() {
        var scrollbar = this.getChildControl("scrollbar-x", true);
        return scrollbar ? scrollbar.getPosition() : 0;
      },

      /**
       * Scrolls the element's content to the given top coordinate
       *
       * @param value {Integer} The horizontal position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollToY: function scrollToY(value, duration) {
        // First flush queue before scroll
        qx.ui.core.queue.Manager.flush();
        this.getChildControl("scrollbar-y").scrollTo(value, duration);
      },

      /**
       * Scrolls the element's content by the given top offset
       *
       * @param value {Integer} The horizontal position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollByY: function scrollByY(value, duration) {
        // First flush queue before scroll
        qx.ui.core.queue.Manager.flush();
        this.getChildControl("scrollbar-y").scrollBy(value, duration);
      },

      /**
       * Returns the scroll top position of the content
       *
       * @return {Integer} Vertical scroll position
       */
      getScrollY: function getScrollY() {
        var scrollbar = this.getChildControl("scrollbar-y", true);
        return scrollbar ? scrollbar.getPosition() : 0;
      },

      /**
       * In case a scroll animation is currently running in X direction,
       * it will be stopped. If not, the method does nothing.
       */
      stopScrollAnimationX: function stopScrollAnimationX() {
        var scrollbar = this.getChildControl("scrollbar-x", true);

        if (scrollbar) {
          scrollbar.stopScrollAnimation();
        }
      },

      /**
       * In case a scroll animation is currently running in X direction,
       * it will be stopped. If not, the method does nothing.
       */
      stopScrollAnimationY: function stopScrollAnimationY() {
        var scrollbar = this.getChildControl("scrollbar-y", true);

        if (scrollbar) {
          scrollbar.stopScrollAnimation();
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the scroll animation end event for both scroll bars.
       *
       * @param direction {String} Either "X" or "Y".
       */
      _onScrollAnimationEnd: function _onScrollAnimationEnd(direction) {
        this.fireEvent("scrollAnimation" + direction + "End");
      },

      /**
       * Event handler for the scroll event of the horizontal scrollbar
       *
       * @param e {qx.event.type.Data} The scroll event object
       */
      _onScrollBarX: function _onScrollBarX(e) {
        this.getChildControl("pane").scrollToX(e.getData());
      },

      /**
       * Event handler for the scroll event of the vertical scrollbar
       *
       * @param e {qx.event.type.Data} The scroll event object
       */
      _onScrollBarY: function _onScrollBarY(e) {
        this.getChildControl("pane").scrollToY(e.getData());
      },

      /**
       * Event handler for the horizontal scroll event of the pane
       *
       * @param e {qx.event.type.Data} The scroll event object
       */
      _onScrollPaneX: function _onScrollPaneX(e) {
        var scrollbar = this.getChildControl("scrollbar-x");

        if (scrollbar) {
          scrollbar.updatePosition(e.getData());
        }
      },

      /**
       * Event handler for the vertical scroll event of the pane
       *
       * @param e {qx.event.type.Data} The scroll event object
       */
      _onScrollPaneY: function _onScrollPaneY(e) {
        var scrollbar = this.getChildControl("scrollbar-y");

        if (scrollbar) {
          scrollbar.updatePosition(e.getData());
        }
      },

      /**
       * Event handler for visibility changes of horizontal scrollbar.
       *
       * @param e {qx.event.type.Event} Property change event
       */
      _onChangeScrollbarXVisibility: function _onChangeScrollbarXVisibility(e) {
        var showX = this._isChildControlVisible("scrollbar-x");

        var showY = this._isChildControlVisible("scrollbar-y");

        if (!showX) {
          this.scrollToX(0);
        }

        showX && showY ? this._showChildControl("corner") : this._excludeChildControl("corner");
      },

      /**
       * Event handler for visibility changes of horizontal scrollbar.
       *
       * @param e {qx.event.type.Event} Property change event
       */
      _onChangeScrollbarYVisibility: function _onChangeScrollbarYVisibility(e) {
        var showX = this._isChildControlVisible("scrollbar-x");

        var showY = this._isChildControlVisible("scrollbar-y");

        if (!showY) {
          this.scrollToY(0);
        }

        showX && showY ? this._showChildControl("corner") : this._excludeChildControl("corner");
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the visibility state for scrollbars.
       *
       */
      _computeScrollbars: function _computeScrollbars() {
        var pane = this.getChildControl("pane");
        var content = pane.getChildren()[0];

        if (!content) {
          this._excludeChildControl("scrollbar-x");

          this._excludeChildControl("scrollbar-y");

          return;
        }

        var innerSize = this.getInnerSize();
        var paneSize = pane.getInnerSize();
        var scrollSize = pane.getScrollSize(); // if the widget has not yet been rendered, return and try again in the
        // resize event

        if (!paneSize || !scrollSize) {
          return;
        }

        var scrollbarX = this.getScrollbarX();
        var scrollbarY = this.getScrollbarY();

        if (scrollbarX === "auto" && scrollbarY === "auto") {
          // Check if the container is big enough to show
          // the full content.
          var showX = scrollSize.width > innerSize.width;
          var showY = scrollSize.height > innerSize.height; // Dependency check
          // We need a special intelligence here when only one
          // of the autosized axis requires a scrollbar
          // This scrollbar may then influence the need
          // for the other one as well.

          if ((showX || showY) && !(showX && showY)) {
            if (showX) {
              showY = scrollSize.height > paneSize.height;
            } else if (showY) {
              showX = scrollSize.width > paneSize.width;
            }
          }
        } else {
          var showX = scrollbarX === "on";
          var showY = scrollbarY === "on"; // Check auto values afterwards with already
          // corrected client dimensions

          if (scrollSize.width > (showX ? paneSize.width : innerSize.width) && scrollbarX === "auto") {
            showX = true;
          }

          if (scrollSize.height > (showX ? paneSize.height : innerSize.height) && scrollbarY === "auto") {
            showY = true;
          }
        } // Update scrollbars


        if (showX) {
          var barX = this.getChildControl("scrollbar-x");
          barX.show();
          barX.setMaximum(Math.max(0, scrollSize.width - paneSize.width));
          barX.setKnobFactor(scrollSize.width === 0 ? 0 : paneSize.width / scrollSize.width);
        } else {
          this._excludeChildControl("scrollbar-x");
        }

        if (showY) {
          var barY = this.getChildControl("scrollbar-y");
          barY.show();
          barY.setMaximum(Math.max(0, scrollSize.height - paneSize.height));
          barY.setKnobFactor(scrollSize.height === 0 ? 0 : paneSize.height / scrollSize.height);
        } else {
          this._excludeChildControl("scrollbar-y");
        }
      }
    }
  });
  qx.ui.core.scroll.AbstractScrollArea.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Scroll": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.bom.client.Browser": {},
      "qx.bom.client.Event": {}
    },
    "environment": {
      "provided": ["os.scrollBarOverlayed", "qx.mobile.nativescroll"],
      "required": {
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "browser.version": {
          "className": "qx.bom.client.Browser"
        },
        "browser.name": {
          "className": "qx.bom.client.Browser"
        },
        "os.version": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "event.mspointer": {
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class is responsible for checking the scrolling behavior of the client.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Scroll", {
    statics: {
      /**
       * Check if the scrollbars should be positioned on top of the content. This
       * is true of OSX Lion when the scrollbars disappear automatically.
       *
       * @internal
       *
       * @return {Boolean} <code>true</code> if the scrollbars should be
       *   positioned on top of the content.
       */
      scrollBarOverlayed: function scrollBarOverlayed() {
        var scrollBarWidth = qx.bom.element.Scroll.getScrollbarWidth();
        var osx = qx.bom.client.OperatingSystem.getName() === "osx";
        var nativeScrollBars = false;
        return scrollBarWidth === 0 && osx && nativeScrollBars;
      },

      /**
       * Checks if native scroll can be used for the current mobile device.
       *
       * @internal
       *
       * @return {Boolean} <code>true</code> if the current device is capable to
       * use native scroll.
       */
      getNativeScroll: function getNativeScroll() {
        // iOS 8+
        if (qx.core.Environment.get("os.name") == "ios" && parseInt(qx.core.Environment.get("browser.version"), 10) > 7) {
          return true;
        } // Firefox


        if (qx.core.Environment.get("browser.name") == "firefox") {
          return true;
        } // Android 4.4+


        if (qx.core.Environment.get("os.name") == "android") {
          var osVersion = qx.core.Environment.get("os.version");
          var splitVersion = osVersion.split(".");

          if (splitVersion[0] > 4 || splitVersion.length > 1 && splitVersion[0] > 3 && splitVersion[1] > 3) {
            return true;
          }
        } // IE 10+


        if (qx.core.Environment.get("event.mspointer")) {
          return true;
        }

        return false;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("os.scrollBarOverlayed", statics.scrollBarOverlayed);
      qx.core.Environment.add("qx.mobile.nativescroll", statics.getNativeScroll);
    }
  });
  qx.bom.client.Scroll.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.scroll.AbstractScrollArea": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MContentPadding": {
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
   * Container, which allows vertical and horizontal scrolling if the contents is
   * larger than the container.
   *
   * Note that this class can only have one child widget. This container has a
   * fixed layout, which cannot be changed.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create scroll container
   *   var scroll = new qx.ui.container.Scroll().set({
   *     width: 300,
   *     height: 200
   *   });
   *
   *   // add a widget which is larger than the container
   *   scroll.add(new qx.ui.core.Widget().set({
   *     width: 600,
   *     minWidth: 600,
   *     height: 400,
   *     minHeight: 400
   *   }));
   *
   *   this.getRoot().add(scroll);
   * </pre>
   *
   * This example creates a scroll container and adds a widget, which is larger
   * than the container. This will cause the container to display vertical
   * and horizontal toolbars.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/scroll.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.Scroll", {
    extend: qx.ui.core.scroll.AbstractScrollArea,
    include: [qx.ui.core.MContentPadding],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param content {qx.ui.core.LayoutItem?null} The content widget of the scroll
     *    container.
     */
    construct: function construct(content) {
      qx.ui.core.scroll.AbstractScrollArea.constructor.call(this);

      if (content) {
        this.add(content);
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Sets the content of the scroll container. Scroll containers
       * may only have one child, so it always replaces the current
       * child with the given one.
       *
       * @param widget {qx.ui.core.Widget} Widget to insert
       */
      add: function add(widget) {
        this.getChildControl("pane").add(widget);
      },

      /**
       * Returns the content of the scroll area.
       *
       * @param widget {qx.ui.core.Widget} Widget to remove
       */
      remove: function remove(widget) {
        this.getChildControl("pane").remove(widget);
      },

      /**
       * Returns the content of the scroll container.
       *
       * Scroll containers may only have one child. This
       * method returns an array containing the child or an empty array.
       *
       * @return {Object[]} The child array
       */
      getChildren: function getChildren() {
        return this.getChildControl("pane").getChildren();
      },

      /**
       * Returns the element, to which the content padding should be applied.
       *
       * @return {qx.ui.core.Widget} The content padding target.
       */
      _getContentPaddingTarget: function _getContentPaddingTarget() {
        return this.getChildControl("pane");
      }
    }
  });
  qx.ui.container.Scroll.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-26.js.map
