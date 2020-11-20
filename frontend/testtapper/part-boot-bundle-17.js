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
      "qx.ui.layout.Abstract": {
        "require": true
      },
      "qx.ui.layout.Util": {},
      "qx.lang.Type": {}
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
   * The Canvas is an extended Basic layout.
   *
   * It is possible to position a widget relative to the right or bottom edge of
   * the available space. It further supports stretching between left and right
   * or top and bottom e.g. <code>left=20</code> and <code>right=20</code> would
   * keep a margin of 20 pixels to both edges. The Canvas layout has support for
   * percent dimensions and locations.
   *
   * *Features*
   *
   * * Pixel dimensions and locations
   * * Percent dimensions and locations
   * * Stretching between left+right and top+bottom
   * * Minimum and maximum dimensions
   * * Children are automatically shrunk to their minimum dimensions if not enough space is available
   * * Auto sizing (ignoring percent values)
   * * Margins (also negative ones)
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>left</strong> <em>(Integer|String)</em>: The left coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>top</strong> <em>(Integer|String)</em>: The top coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>right</strong> <em>(Integer|String)</em>: The right coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>bottom</strong> <em>(Integer|String)</em>: The bottom coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>edge</strong> <em>(Integer|String)</em>: The coordinate in pixels or as a percent string to be used for all four edges.
   * <li><strong>width</strong> <em>(String)</em>: A percent width e.g. <code>40%</code>.</li>
   * <li><strong>height</strong> <em>(String)</em>: A percent height e.g. <code>60%</code>.</li>
   * </ul>
   *
   * *Notes*
   *
   * <ul>
   * <li>Stretching (<code>left</code>-><code>right</code> or <code>top</code>-><code>bottom</code>)
   *   has a higher priority than the preferred dimensions</li>
   * <li>Stretching has a lower priority than the min/max dimensions.</li>
   * <li>Percent values have no influence on the size hint of the layout.</li>
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the canvas layout.
   *
   * <pre class="javascript">
   * var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
   *
   * // simple positioning
   * container.add(new qx.ui.core.Widget(), {top: 10, left: 10});
   *
   * // stretch vertically with 10 pixel distance to the parent's top
   * // and bottom border
   * container.add(new qx.ui.core.Widget(), {top: 10, left: 10, bottom: 10});
   *
   * // percent positioning and size
   * container.add(new qx.ui.core.Widget(), {left: "50%", top: "50%", width: "25%", height: "40%"});
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/canvas.html'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Canvas", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * If desktop mode is active, the children's minimum sizes are ignored
       * by the layout calculation. This is necessary to prevent the desktop
       * from growing if e.g. a window is moved beyond the edge of the desktop
       */
      desktop: {
        check: "Boolean",
        init: false
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
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        var layoutProperties = {
          top: 1,
          left: 1,
          bottom: 1,
          right: 1,
          width: 1,
          height: 1,
          edge: 1
        };
        this.assert(layoutProperties[name] == 1, "The property '" + name + "' is not supported by the Canvas layout!");

        if (name == "width" || name == "height") {
          this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
        } else {
          if (typeof value === "number") {
            this.assertInteger(value);
          } else if (qx.lang.Type.isString(value)) {
            this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
          } else {
            this.fail("Bad format of layout property '" + name + "': " + value + ". The value must be either an integer or an percent string.");
          }
        }
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child, size, props;
        var left, top, right, bottom, width, height;
        var marginTop, marginRight, marginBottom, marginLeft;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          props = child.getLayoutProperties(); // Cache margins

          marginTop = child.getMarginTop();
          marginRight = child.getMarginRight();
          marginBottom = child.getMarginBottom();
          marginLeft = child.getMarginLeft(); // **************************************
          //   Processing location
          // **************************************

          left = props.left != null ? props.left : props.edge;

          if (qx.lang.Type.isString(left)) {
            left = Math.round(parseFloat(left) * availWidth / 100);
          }

          right = props.right != null ? props.right : props.edge;

          if (qx.lang.Type.isString(right)) {
            right = Math.round(parseFloat(right) * availWidth / 100);
          }

          top = props.top != null ? props.top : props.edge;

          if (qx.lang.Type.isString(top)) {
            top = Math.round(parseFloat(top) * availHeight / 100);
          }

          bottom = props.bottom != null ? props.bottom : props.edge;

          if (qx.lang.Type.isString(bottom)) {
            bottom = Math.round(parseFloat(bottom) * availHeight / 100);
          } // **************************************
          //   Processing dimension
          // **************************************
          // Stretching has higher priority than dimension data


          if (left != null && right != null) {
            width = availWidth - left - right - marginLeft - marginRight; // Limit computed value

            if (width < size.minWidth) {
              width = size.minWidth;
            } else if (width > size.maxWidth) {
              width = size.maxWidth;
            } // Add margin


            left += marginLeft;
          } else {
            // Layout data has higher priority than data from size hint
            width = props.width;

            if (width == null) {
              width = size.width;
            } else {
              width = Math.round(parseFloat(width) * availWidth / 100); // Limit computed value

              if (width < size.minWidth) {
                width = size.minWidth;
              } else if (width > size.maxWidth) {
                width = size.maxWidth;
              }
            }

            if (right != null) {
              left = availWidth - width - right - marginRight - marginLeft;
            } else if (left == null) {
              left = marginLeft;
            } else {
              left += marginLeft;
            }
          } // Stretching has higher priority than dimension data


          if (top != null && bottom != null) {
            height = availHeight - top - bottom - marginTop - marginBottom; // Limit computed value

            if (height < size.minHeight) {
              height = size.minHeight;
            } else if (height > size.maxHeight) {
              height = size.maxHeight;
            } // Add margin


            top += marginTop;
          } else {
            // Layout data has higher priority than data from size hint
            height = props.height;

            if (height == null) {
              height = size.height;
            } else {
              height = Math.round(parseFloat(height) * availHeight / 100); // Limit computed value

              if (height < size.minHeight) {
                height = size.minHeight;
              } else if (height > size.maxHeight) {
                height = size.maxHeight;
              }
            }

            if (bottom != null) {
              top = availHeight - height - bottom - marginBottom - marginTop;
            } else if (top == null) {
              top = marginTop;
            } else {
              top += marginTop;
            }
          }

          left += padding.left;
          top += padding.top; // Apply layout

          child.renderLayout(left, top, width, height);
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var neededWidth = 0,
            neededMinWidth = 0;
        var neededHeight = 0,
            neededMinHeight = 0;
        var width, minWidth;
        var height, minHeight;

        var children = this._getLayoutChildren();

        var child, props, hint;
        var desktop = this.isDesktop();
        var left, top, right, bottom;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          props = child.getLayoutProperties();
          hint = child.getSizeHint(); // Cache margins

          var marginX = child.getMarginLeft() + child.getMarginRight();
          var marginY = child.getMarginTop() + child.getMarginBottom(); // Compute width

          width = hint.width + marginX;
          minWidth = hint.minWidth + marginX;
          left = props.left != null ? props.left : props.edge;

          if (left && typeof left === "number") {
            width += left;
            minWidth += left;
          }

          right = props.right != null ? props.right : props.edge;

          if (right && typeof right === "number") {
            width += right;
            minWidth += right;
          }

          neededWidth = Math.max(neededWidth, width);
          neededMinWidth = desktop ? 0 : Math.max(neededMinWidth, minWidth); // Compute height

          height = hint.height + marginY;
          minHeight = hint.minHeight + marginY;
          top = props.top != null ? props.top : props.edge;

          if (top && typeof top === "number") {
            height += top;
            minHeight += top;
          }

          bottom = props.bottom != null ? props.bottom : props.edge;

          if (bottom && typeof bottom === "number") {
            height += bottom;
            minHeight += bottom;
          }

          neededHeight = Math.max(neededHeight, height);
          neededMinHeight = desktop ? 0 : Math.max(neededMinHeight, minHeight);
        }

        return {
          width: neededWidth,
          minWidth: neededMinWidth,
          height: neededHeight,
          minHeight: neededMinHeight
        };
      }
    }
  });
  qx.ui.layout.Canvas.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.scroll.AbstractScrollArea": {
        "construct": true,
        "require": true
      },
      "qx.ui.virtual.core.Pane": {
        "construct": true
      },
      "qx.bom.client.Scroll": {
        "construct": true
      }
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * The Scroller wraps a {@link Pane} and provides scroll bars to interactively
   * scroll the pane's content.
   *
   * @childControl pane {qx.ui.virtual.core.Pane} Virtual pane.
   */
  qx.Class.define("qx.ui.virtual.core.Scroller", {
    extend: qx.ui.core.scroll.AbstractScrollArea,

    /**
     * @param rowCount {Integer?0} The number of rows of the virtual grid.
     * @param columnCount {Integer?0} The number of columns of the virtual grid.
     * @param cellHeight {Integer?10} The default cell height.
     * @param cellWidth {Integer?10} The default cell width.
     */
    construct: function construct(rowCount, columnCount, cellHeight, cellWidth) {
      qx.ui.core.scroll.AbstractScrollArea.constructor.call(this);
      this.__pane = new qx.ui.virtual.core.Pane(rowCount, columnCount, cellHeight, cellWidth);

      this.__pane.addListener("update", this._computeScrollbars, this);

      this.__pane.addListener("scrollX", this._onScrollPaneX, this);

      this.__pane.addListener("scrollY", this._onScrollPaneY, this);

      if (qx.core.Environment.get("os.scrollBarOverlayed")) {
        this._add(this.__pane, {
          edge: 0
        });
      } else {
        this._add(this.__pane, {
          row: 0,
          column: 0
        });
      }
    },
    members: {
      /** @type {qx.ui.virtual.core.Pane} Virtual pane. */
      __pane: null,

      /*
      ---------------------------------------------------------------------------
        ACCESSOR METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Get the scroller's virtual pane.
       *
       * @return {qx.ui.virtual.core.Pane} The scroller's pane.
       */
      getPane: function getPane() {
        return this.__pane;
      },

      /*
      ---------------------------------------------------------------------------
        CHILD CONTROL SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        if (id === "pane") {
          return this.__pane;
        } else {
          return qx.ui.virtual.core.Scroller.prototype._createChildControlImpl.base.call(this, id);
        }
      },

      /*
      ---------------------------------------------------------------------------
        ITEM LOCATION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * NOT IMPLEMENTED
       *
       * @param item {qx.ui.core.Widget} Item to query.
       * @return {Integer} Top offset.
       * @abstract
       */
      getItemTop: function getItemTop(item) {
        throw new Error("The method 'getItemTop' is not implemented!");
      },

      /**
       * NOT IMPLEMENTED
       *
       * @param item {qx.ui.core.Widget} Item to query.
       * @return {Integer} Top offset.
       * @abstract
       */
      getItemBottom: function getItemBottom(item) {
        throw new Error("The method 'getItemBottom' is not implemented!");
      },

      /**
       * NOT IMPLEMENTED
       *
       * @param item {qx.ui.core.Widget} Item to query.
       * @return {Integer} Top offset.
       * @abstract
       */
      getItemLeft: function getItemLeft(item) {
        throw new Error("The method 'getItemLeft' is not implemented!");
      },

      /**
       * NOT IMPLEMENTED
       *
       * @param item {qx.ui.core.Widget} Item to query.
       * @return {Integer} Right offset.
       * @abstract
       */
      getItemRight: function getItemRight(item) {
        throw new Error("The method 'getItemRight' is not implemented!");
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */
      // overridden
      _onScrollBarX: function _onScrollBarX(e) {
        this.__pane.setScrollX(e.getData());
      },
      // overridden
      _onScrollBarY: function _onScrollBarY(e) {
        this.__pane.setScrollY(e.getData());
      }
    },
    destruct: function destruct() {
      this.__pane.dispose();

      this.__pane = null;
    }
  });
  qx.ui.virtual.core.Scroller.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Interface describes the methods which the {@link qx.ui.tree.provider.WidgetProvider}
   * uses for communication.
   */
  qx.Interface.define("qx.ui.tree.core.IVirtualTree", {
    members: {
      /**
       * Return whether top level items should have an open/close button. The top
       * level item item is normally the root item, but when the root is hidden,
       * the root children are the top level items.
       *
       * @return {Boolean} Returns <code>true</code> when top level items should
       *   show open/close buttons, <code>false</code> otherwise.
       */
      isShowTopLevelOpenCloseIcons: function isShowTopLevelOpenCloseIcons() {},

      /**
       * Returns the internal data structure. The Array index is the row and the
       * value is the model item.
       *
       * @internal
       * @return {qx.data.Array} The internal data structure.
       */
      getLookupTable: function getLookupTable() {},

      /**
       * Returns if the passed item is a note or a leaf.
       *
       * @internal
       * @param item {qx.core.Object} Item to check.
       * @return {Boolean} <code>True</code> when item is a node,
       *   </code>false</code> when item is a leaf.
       */
      isNode: function isNode(item) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInterface(item, qx.core.Object);
      },

      /**
       * Return whether the node is opened or closed.
       *
       * @param node {qx.core.Object} Node to check.
       * @return {Boolean} Returns <code>true</code> when the node is opened,
       *   <code>false</code> otherwise.
       */
      isNodeOpen: function isNodeOpen(node) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInterface(node, qx.core.Object);
      },

      /**
       * Returns the row's nesting level.
       *
       * @param row {Integer} The row to get the nesting level.
       * @return {Integer} The row's nesting level or <code>null</code>.
       */
      getLevel: function getLevel(row) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInteger(row);
      },

      /**
       * Return whether the node has visible children or not.
       *
       * @internal
       * @param node {qx.core.Object} Node to check.
       * @return {Boolean} <code>True</code> when the node has visible children,
       *   <code>false</code> otherwise.
       */
      hasChildren: function hasChildren(node) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInterface(node, qx.core.Object);
      },

      /**
       * Opens the passed node.
       *
       * @param node {qx.core.Object} Node to open.
       */
      openNode: function openNode(node) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInterface(node, qx.core.Object);
      },

      /**
       * Opens the passed node without scrolling selected item into view.
       *
       * @param node {qx.core.Object} Node to open.
       */
      openNodeWithoutScrolling: function openNodeWithoutScrolling(node) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInterface(node, qx.core.Object);
      },

      /**
       * Closes the passed node.
       *
       * @param node {qx.core.Object} Node to close.
       */
      closeNode: function closeNode(node) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInterface(node, qx.core.Object);
      },

      /**
       * Closes the passed node without scrolling selected item into view.
       *
       * @param node {qx.core.Object} Node to close.
       */
      closeNodeWithoutScrolling: function closeNodeWithoutScrolling(node) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInterface(node, qx.core.Object);
      },

      /**
       * Returns the current selection.
       *
       * @return {qx.data.Array} The current selected elements.
       */
      getSelection: function getSelection() {}
    }
  });
  qx.ui.tree.core.IVirtualTree.$$dbClassInfo = $$dbClassInfo;
})();

//
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
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Interface for data binding classes offering a selection.
   */
  qx.Interface.define("qx.data.controller.ISelection", {
    members: {
      /**
       * Setter for the selection.
       * @param value {qx.data.IListData} The data of the selection.
       */
      setSelection: function setSelection(value) {},

      /**
       * Getter for the selection list.
       * @return {qx.data.IListData} The current selection.
       */
      getSelection: function getSelection() {},

      /**
       * Resets the selection to its default value.
       */
      resetSelection: function resetSelection() {}
    }
  });
  qx.data.controller.ISelection.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.data.Array": {
        "construct": true
      },
      "qx.ui.virtual.selection.Row": {},
      "qx.lang.Type": {},
      "qx.lang.Array": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Implements the different selection modes single, multi, additive and one
   * selection with there drag and quick selection.
   *
   * Example how to use selection:
   * <pre class="javascript">
   * var rawData = [];
   * for (var i = 0; i < 2500; i++) {
   *  rawData[i] = "Item No " + i;
   * }
   *
   * var model = qx.data.marshal.Json.createModel(rawData);
   * var list = new qx.ui.list.List(model);
   *
   * // Pre-Select "Item No 20"
   * list.getSelection().push(model.getItem(20));
   *
   * // log change selection
   * list.getSelection().addListener("change", function(e) {
   *   this.debug("Selection: " + list.getSelection().getItem(0));
   * }, this);
   * </pre>
   *
   * @internal
   */
  qx.Mixin.define("qx.ui.virtual.selection.MModel", {
    construct: function construct() {
      this._initSelectionManager();

      this.__defaultSelection = new qx.data.Array();
      this.initSelection(this.__defaultSelection);
    },
    properties: {
      /** Current selected items */
      selection: {
        check: "qx.data.Array",
        event: "changeSelection",
        apply: "_applySelection",
        nullable: false,
        deferredInit: true
      },

      /**
       * The selection mode to use.
       *
       * For further details please have a look at:
       * {@link qx.ui.core.selection.Abstract#mode}
       */
      selectionMode: {
        check: ["single", "multi", "additive", "one"],
        init: "single",
        apply: "_applySelectionMode"
      },

      /**
       * Enable drag selection (multi selection of items through
       * dragging the pointer in pressed states).
       *
       * Only possible for the selection modes <code>multi</code> and <code>additive</code>
       */
      dragSelection: {
        check: "Boolean",
        init: false,
        apply: "_applyDragSelection"
      },

      /**
       * Enable quick selection mode, where no tap is needed to change the selection.
       *
       * Only possible for the modes <code>single</code> and <code>one</code>.
       */
      quickSelection: {
        check: "Boolean",
        init: false,
        apply: "_applyQuickSelection"
      }
    },
    events: {
      /**
       * This event is fired as soon as the content of the selection property changes, but
       * this is not equal to the change of the selection of the widget. If the selection
       * of the widget changes, the content of the array stored in the selection property
       * changes. This means you have to listen to the change event of the selection array
       * to get an event as soon as the user changes the selected item.
       * <pre class="javascript">obj.getSelection().addListener("change", listener, this);</pre>
       */
      "changeSelection": "qx.event.type.Data",

      /** Fires after the value was modified */
      "changeValue": "qx.event.type.Data"
    },
    members: {
      /** @type {qx.ui.virtual.selection.Row} selection manager */
      _manager: null,

      /** @type {Boolean} flag to ignore the selection change from {@link #selection} */
      __ignoreChangeSelection: false,

      /** @type {Boolean} flag to ignore the selection change from <code>_manager</code> */
      __ignoreManagerChangeSelection: false,
      __defaultSelection: null,

      /**
       * setValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @param selection {qx.data.IListData|null} List data to select as value.
       * @return {null} The status of this operation.
       */
      setValue: function setValue(selection) {
        if (null === selection) {
          this.resetSelection();
        } else {
          this.setSelection(selection);
        }

        return null;
      },

      /**
       * getValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @return {qx.data.IListData} The current selection.
       */
      getValue: function getValue() {
        return this.getSelection();
      },

      /**
       * resetValue implements part of the {@link qx.ui.form.IField} interface.
       */
      resetValue: function resetValue() {
        this.resetSelection();
      },

      /**
       * Initialize the selection manager with his delegate.
       */
      _initSelectionManager: function _initSelectionManager() {
        var self = this;
        var selectionDelegate = {
          isItemSelectable: function isItemSelectable(row) {
            return self._provider.isSelectable(row);
          },
          styleSelectable: function styleSelectable(row, type, wasAdded) {
            if (type != "selected") {
              return;
            }

            if (wasAdded) {
              self._provider.styleSelectabled(row);
            } else {
              self._provider.styleUnselectabled(row);
            }
          }
        };
        this._manager = new qx.ui.virtual.selection.Row(this.getPane(), selectionDelegate);

        this._manager.attachPointerEvents(this.getPane());

        this._manager.attachKeyEvents(this);

        this._manager.addListener("changeSelection", this._onManagerChangeSelection, this);
      },

      /**
       * Determines, if automatically scrolling of selected item is active.
       * Set <code>false</code> to suspend auto scrolling.
       *
       * @param value {Boolean} Set <code>false</code> to suspend auto scrolling.
       */
      setAutoScrollIntoView: function setAutoScrollIntoView(value) {
        this._manager._autoScrollIntoView = value;
      },

      /**
       * Returns true, if automatically scrolling of selected item is active.
       *
       * @return {Boolean} Returns <code>false</code> if auto scrolling is suspended.
       */
      getAutoScrollIntoView: function getAutoScrollIntoView() {
        return this._manager._autoScrollIntoView;
      },

      /**
       * Method to update the selection, this method can be used when the model has
       * changes.
       */
      _updateSelection: function _updateSelection() {
        if (this._manager == null) {
          return;
        }

        this._onChangeSelection();
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // apply method
      _applySelection: function _applySelection(value, old) {
        value.addListener("change", this._onChangeSelection, this);

        if (old != null) {
          old.removeListener("change", this._onChangeSelection, this);
        }

        this._onChangeSelection();
      },
      // apply method
      _applySelectionMode: function _applySelectionMode(value, old) {
        this._manager.setMode(value);
      },
      // apply method
      _applyDragSelection: function _applyDragSelection(value, old) {
        this._manager.setDrag(value);
      },
      // apply method
      _applyQuickSelection: function _applyQuickSelection(value, old) {
        this._manager.setQuick(value);
      },

      /*
      ---------------------------------------------------------------------------
        SELECTION HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the internal selection change {@link #selection}.
       *
       * @param e {qx.event.type.Data} the change event.
       */
      _onChangeSelection: function _onChangeSelection(e) {
        if (this.__ignoreManagerChangeSelection == true) {
          return;
        }

        this.__ignoreChangeSelection = true;
        var selection = this.getSelection();
        var newSelection = [];

        for (var i = 0; i < selection.getLength(); i++) {
          var item = selection.getItem(i);

          var selectables = this._getSelectables();

          var index = -1;

          if (selectables != null) {
            index = selectables.indexOf(item);
          }

          var row = this._reverseLookup(index);

          if (row >= 0) {
            newSelection.push(row);
          }
        }

        if (this._beforeApplySelection != null && qx.lang.Type.isFunction(this._beforeApplySelection)) {
          this._beforeApplySelection(newSelection);
        }

        try {
          if (!qx.lang.Array.equals(newSelection, this._manager.getSelection())) {
            this._manager.replaceSelection(newSelection);
          }
        } catch (ex) {
          this._manager.selectItem(newSelection[newSelection.length - 1]);
        }

        this.__synchronizeSelection();

        if (this._afterApplySelection != null && qx.lang.Type.isFunction(this._afterApplySelection)) {
          this._afterApplySelection();
        }

        this.__ignoreChangeSelection = false;
      },

      /**
       * Event handler for the selection change from the <code>_manager</code>.
       *
       * @param e {qx.event.type.Data} the change event.
       */
      _onManagerChangeSelection: function _onManagerChangeSelection(e) {
        if (this.__ignoreChangeSelection == true) {
          return;
        }

        this.__ignoreManagerChangeSelection = true;

        this.__synchronizeSelection();

        this.__ignoreManagerChangeSelection = false;
        this.fireDataEvent("changeValue", e.getData(), e.getOldData());
      },

      /**
       * Synchronized the selection form the manager with the local one.
       */
      __synchronizeSelection: function __synchronizeSelection() {
        if (this.__isSelectionEquals()) {
          return;
        }

        var managerSelection = this._manager.getSelection();

        var newSelection = [];

        for (var i = 0; i < managerSelection.length; i++) {
          var item = this._getDataFromRow(managerSelection[i]);

          if (item != null) {
            newSelection.push(item);
          }
        }

        this.__replaceSelection(newSelection);
      },

      /**
       * Replace the current selection with the passed selection Array.
       *
       * @param newSelection {qx.data.Array} The new selection.
       */
      __replaceSelection: function __replaceSelection(newSelection) {
        var selection = this.getSelection();

        if (newSelection.length > 0) {
          var args = [0, selection.getLength()];
          args = args.concat(newSelection); // dispose data array returned by splice to avoid memory leak

          var temp = selection.splice.apply(selection, args);
          temp.dispose();
        } else {
          selection.removeAll();
        }
      },

      /**
       * Checks whether the local and the manager selection are equal.
       *
       * @return {Boolean} <code>true</code> if the selections are equal,
       *   <code>false</code> otherwise.
       */
      __isSelectionEquals: function __isSelectionEquals() {
        var selection = this.getSelection();

        var managerSelection = this._manager.getSelection();

        if (selection.getLength() !== managerSelection.length) {
          return false;
        }

        for (var i = 0; i < selection.getLength(); i++) {
          var item = selection.getItem(i);

          var selectables = this._getSelectables();

          var index = -1;

          if (selectables != null) {
            index = selectables.indexOf(item);
          }

          var row = this._reverseLookup(index);

          if (row !== managerSelection[i]) {
            return false;
          }

          ;
        }

        return true;
      },

      /**
       * Helper Method to select default item.
       */
      _applyDefaultSelection: function _applyDefaultSelection() {
        if (this._manager != null) {
          this._manager._applyDefaultSelection();
        }
      }
    },
    destruct: function destruct() {
      this._manager.dispose();

      this._manager = null;

      if (this.__defaultSelection) {
        this.__defaultSelection.dispose();
      }
    }
  });
  qx.ui.virtual.selection.MModel.$$dbClassInfo = $$dbClassInfo;
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin defines the <code>contentPadding</code> property, which is used
   * by widgets like the window or group box, which must have a property, which
   * defines the padding of an inner pane.
   *
   * The including class must implement the method
   * <code>_getContentPaddingTarget</code>, which must return the widget on which
   * the padding should be applied.
   */
  qx.Mixin.define("qx.ui.core.MContentPadding", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Top padding of the content pane */
      contentPaddingTop: {
        check: "Integer",
        init: 0,
        apply: "_applyContentPadding",
        themeable: true
      },

      /** Right padding of the content pane */
      contentPaddingRight: {
        check: "Integer",
        init: 0,
        apply: "_applyContentPadding",
        themeable: true
      },

      /** Bottom padding of the content pane */
      contentPaddingBottom: {
        check: "Integer",
        init: 0,
        apply: "_applyContentPadding",
        themeable: true
      },

      /** Left padding of the content pane */
      contentPaddingLeft: {
        check: "Integer",
        init: 0,
        apply: "_applyContentPadding",
        themeable: true
      },

      /**
       * The 'contentPadding' property is a shorthand property for setting 'contentPaddingTop',
       * 'contentPaddingRight', 'contentPaddingBottom' and 'contentPaddingLeft'
       * at the same time.
       *
       * If four values are specified they apply to top, right, bottom and left respectively.
       * If there is only one value, it applies to all sides, if there are two or three,
       * the missing values are taken from the opposite side.
       */
      contentPadding: {
        group: ["contentPaddingTop", "contentPaddingRight", "contentPaddingBottom", "contentPaddingLeft"],
        mode: "shorthand",
        themeable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * @type {Map} Maps property names of content padding to the setter of the padding
       *
       * @lint ignoreReferenceField(__contentPaddingSetter)
       */
      __contentPaddingSetter: {
        contentPaddingTop: "setPaddingTop",
        contentPaddingRight: "setPaddingRight",
        contentPaddingBottom: "setPaddingBottom",
        contentPaddingLeft: "setPaddingLeft"
      },

      /**
       * @type {Map} Maps property names of content padding to the themed setter of the padding
       *
       * @lint ignoreReferenceField(__contentPaddingThemedSetter)
       */
      __contentPaddingThemedSetter: {
        contentPaddingTop: "setThemedPaddingTop",
        contentPaddingRight: "setThemedPaddingRight",
        contentPaddingBottom: "setThemedPaddingBottom",
        contentPaddingLeft: "setThemedPaddingLeft"
      },

      /**
       * @type {Map} Maps property names of content padding to the resetter of the padding
       *
       * @lint ignoreReferenceField(__contentPaddingResetter)
       */
      __contentPaddingResetter: {
        contentPaddingTop: "resetPaddingTop",
        contentPaddingRight: "resetPaddingRight",
        contentPaddingBottom: "resetPaddingBottom",
        contentPaddingLeft: "resetPaddingLeft"
      },
      // property apply
      _applyContentPadding: function _applyContentPadding(value, old, name, variant) {
        var target = this._getContentPaddingTarget();

        if (value == null) {
          var resetter = this.__contentPaddingResetter[name];
          target[resetter]();
        } else {
          // forward the themed sates if case the apply was invoked by a theme
          if (variant == "setThemed" || variant == "resetThemed") {
            var setter = this.__contentPaddingThemedSetter[name];
            target[setter](value);
          } else {
            var setter = this.__contentPaddingSetter[name];
            target[setter](value);
          }
        }
      }
    }
  });
  qx.ui.core.MContentPadding.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.virtual.core.Axis": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.virtual.core.ILayer": {},
      "qx.event.Timer": {},
      "qx.ui.virtual.core.CellEvent": {},
      "qx.lang.Array": {},
      "qx.ui.core.queue.Widget": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * The Pane provides a window of a larger virtual grid.
   *
   * The actual rendering is performed by one or several layers ({@link ILayer}.
   * The pane computes, which cells of the virtual area is visible and instructs
   * the layers to render these cells.
   */
  qx.Class.define("qx.ui.virtual.core.Pane", {
    extend: qx.ui.core.Widget,

    /**
     * @param rowCount {Integer?0} The number of rows of the virtual grid.
     * @param columnCount {Integer?0} The number of columns of the virtual grid.
     * @param cellHeight {Integer?10} The default cell height.
     * @param cellWidth {Integer?10} The default cell width.
     */
    construct: function construct(rowCount, columnCount, cellHeight, cellWidth) {
      qx.ui.core.Widget.constructor.call(this);
      this.__rowConfig = new qx.ui.virtual.core.Axis(cellHeight, rowCount);
      this.__columnConfig = new qx.ui.virtual.core.Axis(cellWidth, columnCount);
      this.__scrollTop = 0;
      this.__scrollLeft = 0;
      this.__paneHeight = 0;
      this.__paneWidth = 0;
      this.__layerWindow = {};
      this.__jobs = {}; // create layer container. The container does not have a layout manager
      // layers are positioned using "setUserBounds"

      this.__layerContainer = new qx.ui.container.Composite();

      this.__layerContainer.setUserBounds(0, 0, 0, 0);

      this._add(this.__layerContainer);

      this.__layers = [];

      this.__rowConfig.addListener("change", this.fullUpdate, this);

      this.__columnConfig.addListener("change", this.fullUpdate, this);

      this.addListener("resize", this._onResize, this);
      this.addListenerOnce("appear", this._onAppear, this);
      this.addListener("pointerdown", this._onPointerDown, this);
      this.addListener("tap", this._onTap, this);
      this.addListener("dbltap", this._onDbltap, this);
      this.addListener("contextmenu", this._onContextmenu, this);
    },
    events: {
      /** Fired if a cell is tapped. */
      cellTap: "qx.ui.virtual.core.CellEvent",

      /** Fired if a cell is right-clicked. */
      cellContextmenu: "qx.ui.virtual.core.CellEvent",

      /** Fired if a cell is double-tapped. */
      cellDbltap: "qx.ui.virtual.core.CellEvent",

      /** Fired on resize of either the container or the (virtual) content. */
      update: "qx.event.type.Event",

      /** Fired if the pane is scrolled horizontally. */
      scrollX: "qx.event.type.Data",

      /** Fired if the pane is scrolled vertically. */
      scrollY: "qx.event.type.Data"
    },
    properties: {
      // overridden
      width: {
        refine: true,
        init: 400
      },
      // overridden
      height: {
        refine: true,
        init: 300
      }
    },
    members: {
      __rowConfig: null,
      __columnConfig: null,
      __scrollTop: null,
      __scrollLeft: null,
      __paneHeight: null,
      __paneWidth: null,
      __layerWindow: null,
      __jobs: null,
      __layerContainer: null,
      __layers: null,
      __dontFireUpdate: null,
      __columnSizes: null,
      __rowSizes: null,
      __pointerDownCoords: null,

      /*
      ---------------------------------------------------------------------------
        ACCESSOR METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Get the axis object, which defines the row numbers and the row sizes.
       *
       * @return {qx.ui.virtual.core.Axis} The row configuration.
       */
      getRowConfig: function getRowConfig() {
        return this.__rowConfig;
      },

      /**
       * Get the axis object, which defines the column numbers and the column sizes.
       *
       * @return {qx.ui.virtual.core.Axis} The column configuration.
       */
      getColumnConfig: function getColumnConfig() {
        return this.__columnConfig;
      },

      /*
      ---------------------------------------------------------------------------
        LAYER MANAGEMENT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns an array containing the layer container.
       *
       * @return {Object[]} The layer container array.
       */
      getChildren: function getChildren() {
        return [this.__layerContainer];
      },

      /**
       * Add a layer to the layer container.
       *
       * @param layer {qx.ui.virtual.core.ILayer} The layer to add.
       */
      addLayer: function addLayer(layer) {
        {
          this.assertInterface(layer, qx.ui.virtual.core.ILayer);
        }

        this.__layers.push(layer);

        layer.setUserBounds(0, 0, 0, 0);

        this.__layerContainer.add(layer);
      },

      /**
       * Get a list of all layers.
       *
       * @return {qx.ui.virtual.core.ILayer[]} List of the pane's layers.
       */
      getLayers: function getLayers() {
        return this.__layers;
      },

      /**
       * Get a list of all visible layers.
       *
       * @return {qx.ui.virtual.core.ILayer[]} List of the pane's visible layers.
       */
      getVisibleLayers: function getVisibleLayers() {
        var layers = [];

        for (var i = 0; i < this.__layers.length; i++) {
          var layer = this.__layers[i];

          if (layer.isVisible()) {
            layers.push(layer);
          }
        }

        return layers;
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * The maximum horizontal scroll position.
       *
       * @return {Integer} Maximum horizontal scroll position.
       */
      getScrollMaxX: function getScrollMaxX() {
        var paneSize = this.getInnerSize();

        if (paneSize) {
          return Math.max(0, this.__columnConfig.getTotalSize() - paneSize.width);
        }

        return 0;
      },

      /**
       * The maximum vertical scroll position.
       *
       * @return {Integer} Maximum vertical scroll position.
       */
      getScrollMaxY: function getScrollMaxY() {
        var paneSize = this.getInnerSize();

        if (paneSize) {
          return Math.max(0, this.__rowConfig.getTotalSize() - paneSize.height);
        }

        return 0;
      },

      /**
       * Scrolls the content to the given left coordinate.
       *
       * @param value {Integer} The vertical position to scroll to.
       */
      setScrollY: function setScrollY(value) {
        var max = this.getScrollMaxY();

        if (value < 0) {
          value = 0;
        } else if (value > max) {
          value = max;
        }

        if (this.__scrollTop !== value) {
          var old = this.__scrollTop;
          this.__scrollTop = value;

          this._deferredUpdateScrollPosition();

          this.fireDataEvent("scrollY", value, old);
        }
      },

      /**
       * Returns the vertical scroll offset.
       *
       * @return {Integer} The vertical scroll offset.
       */
      getScrollY: function getScrollY() {
        return this.__scrollTop;
      },

      /**
       * Scrolls the content to the given top coordinate.
       *
       * @param value {Integer} The horizontal position to scroll to.
       */
      setScrollX: function setScrollX(value) {
        var max = this.getScrollMaxX();

        if (value < 0) {
          value = 0;
        } else if (value > max) {
          value = max;
        }

        if (value !== this.__scrollLeft) {
          var old = this.__scrollLeft;
          this.__scrollLeft = value;

          this._deferredUpdateScrollPosition();

          this.fireDataEvent("scrollX", value, old);
        }
      },

      /**
       * Returns the horizontal scroll offset.
       *
       * @return {Integer} The horizontal scroll offset.
       */
      getScrollX: function getScrollX() {
        return this.__scrollLeft;
      },

      /**
       * The (virtual) size of the content.
       *
       * @return {Map} Size of the content (keys: <code>width</code> and
       *     <code>height</code>).
       */
      getScrollSize: function getScrollSize() {
        return {
          width: this.__columnConfig.getTotalSize(),
          height: this.__rowConfig.getTotalSize()
        };
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL INTO VIEW SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls a row into the visible area of the pane.
       *
       * @param row {Integer} The row's index.
       */
      scrollRowIntoView: function scrollRowIntoView(row) {
        var bounds = this.getBounds();

        if (!bounds) {
          this.addListenerOnce("appear", function () {
            // It's important that the registered events are first dispatched.
            qx.event.Timer.once(function () {
              this.scrollRowIntoView(row);
            }, this, 0);
          }, this);
          return;
        }

        var itemTop = this.__rowConfig.getItemPosition(row);

        var itemBottom = itemTop + this.__rowConfig.getItemSize(row);

        var scrollTop = this.getScrollY();

        if (itemTop < scrollTop) {
          this.setScrollY(itemTop);
        } else if (itemBottom > scrollTop + bounds.height) {
          this.setScrollY(itemBottom - bounds.height);
        }
      },

      /**
       * Scrolls a column into the visible area of the pane.
       *
       * @param column {Integer} The column's index.
       */
      scrollColumnIntoView: function scrollColumnIntoView(column) {
        var bounds = this.getBounds();

        if (!bounds) {
          this.addListenerOnce("appear", function () {
            // It's important that the registered events are first dispatched.
            qx.event.Timer.once(function () {
              this.scrollColumnIntoView(column);
            }, this, 0);
          }, this);
          return;
        }

        var itemLeft = this.__columnConfig.getItemPosition(column);

        var itemRight = itemLeft + this.__columnConfig.getItemSize(column);

        var scrollLeft = this.getScrollX();

        if (itemLeft < scrollLeft) {
          this.setScrollX(itemLeft);
        } else if (itemRight > scrollLeft + bounds.width) {
          this.setScrollX(itemRight - bounds.width);
        }
      },

      /**
       * Scrolls a grid cell into the visible area of the pane.
       *
       * @param row {Integer} The cell's row index.
       * @param column {Integer} The cell's column index.
       */
      scrollCellIntoView: function scrollCellIntoView(column, row) {
        var bounds = this.getBounds();

        if (!bounds) {
          this.addListenerOnce("appear", function () {
            // It's important that the registered events are first dispatched.
            qx.event.Timer.once(function () {
              this.scrollCellIntoView(column, row);
            }, this, 0);
          }, this);
          return;
        }

        this.scrollColumnIntoView(column);
        this.scrollRowIntoView(row);
      },

      /*
      ---------------------------------------------------------------------------
        CELL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Get the grid cell at the given absolute document coordinates. This method
       * can be used to convert the pointer position returned by
       * {@link qx.event.type.Pointer#getDocumentLeft} and
       * {@link qx.event.type.Pointer#getDocumentLeft} into cell coordinates.
       *
       * @param documentX {Integer} The x coordinate relative to the viewport
       *    origin.
       * @param documentY {Integer} The y coordinate relative to the viewport
       *    origin.
       * @return {Map|null} A map containing the <code>row</code> and <code>column</code>
       *    of the found cell. If the coordinate is outside of the pane's bounds
       *    or there is no cell at the coordinate <code>null</code> is returned.
       */
      getCellAtPosition: function getCellAtPosition(documentX, documentY) {
        var rowData, columnData;
        var paneLocation = this.getContentLocation();

        if (!paneLocation || documentY < paneLocation.top || documentY >= paneLocation.bottom || documentX < paneLocation.left || documentX >= paneLocation.right) {
          return null;
        }

        rowData = this.__rowConfig.getItemAtPosition(this.getScrollY() + documentY - paneLocation.top);
        columnData = this.__columnConfig.getItemAtPosition(this.getScrollX() + documentX - paneLocation.left);

        if (!rowData || !columnData) {
          return null;
        }

        return {
          row: rowData.index,
          column: columnData.index
        };
      },

      /*
      ---------------------------------------------------------------------------
        PREFETCH SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Increase the layers width beyond the needed width to improve
       * horizontal scrolling. The layers are only resized if invisible parts
       * left/right of the pane window are smaller than minLeft/minRight.
       *
       * @param minLeft {Integer} Only prefetch if the invisible part left of the
       *    pane window if smaller than this (pixel) value.
       * @param maxLeft {Integer} The amount of pixel the layers should reach
       *    left of the pane window.
       * @param minRight {Integer} Only prefetch if the invisible part right of the
       *    pane window if smaller than this (pixel) value.
       * @param maxRight {Integer} The amount of pixel the layers should reach
       *    right of the pane window.
       */
      prefetchX: function prefetchX(minLeft, maxLeft, minRight, maxRight) {
        var layers = this.getVisibleLayers();

        if (layers.length == 0) {
          return;
        }

        var bounds = this.getBounds();

        if (!bounds) {
          return;
        }

        var paneRight = this.__scrollLeft + bounds.width;
        var rightAvailable = this.__paneWidth - paneRight;

        if (this.__scrollLeft - this.__layerWindow.left < Math.min(this.__scrollLeft, minLeft) || this.__layerWindow.right - paneRight < Math.min(rightAvailable, minRight)) {
          var left = Math.min(this.__scrollLeft, maxLeft);
          var right = Math.min(rightAvailable, maxRight);

          this._setLayerWindow(layers, this.__scrollLeft - left, this.__scrollTop, bounds.width + left + right, bounds.height, false);
        }
      },

      /**
       * Increase the layers height beyond the needed height to improve
       * vertical scrolling. The layers are only resized if invisible parts
       * above/below the pane window are smaller than minAbove/minBelow.
       *
       * @param minAbove {Integer} Only prefetch if the invisible part above the
       *    pane window if smaller than this (pixel) value.
       * @param maxAbove {Integer} The amount of pixel the layers should reach
       *    above the pane window.
       * @param minBelow {Integer} Only prefetch if the invisible part below the
       *    pane window if smaller than this (pixel) value.
       * @param maxBelow {Integer} The amount of pixel the layers should reach
       *    below the pane window.
       */
      prefetchY: function prefetchY(minAbove, maxAbove, minBelow, maxBelow) {
        var layers = this.getVisibleLayers();

        if (layers.length == 0) {
          return;
        }

        var bounds = this.getBounds();

        if (!bounds) {
          return;
        }

        var paneBottom = this.__scrollTop + bounds.height;
        var belowAvailable = this.__paneHeight - paneBottom;

        if (this.__scrollTop - this.__layerWindow.top < Math.min(this.__scrollTop, minAbove) || this.__layerWindow.bottom - paneBottom < Math.min(belowAvailable, minBelow)) {
          var above = Math.min(this.__scrollTop, maxAbove);
          var below = Math.min(belowAvailable, maxBelow);

          this._setLayerWindow(layers, this.__scrollLeft, this.__scrollTop - above, bounds.width, bounds.height + above + below, false);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * Resize event handler.
       *
       * Updates the visible window.
       */
      _onResize: function _onResize() {
        if (this.getContentElement().getDomElement()) {
          this.__dontFireUpdate = true;

          this._updateScrollPosition();

          this.__dontFireUpdate = null;
          this.fireEvent("update");
        }
      },

      /**
       * Resize event handler. Do a full update on first appear.
       */
      _onAppear: function _onAppear() {
        this.fullUpdate();
      },

      /**
       * Event listener for pointer down. Remembers cell position to prevent pointer event when cell position change.
       *
       * @param e {qx.event.type.Pointer} The incoming pointer event.
       */
      _onPointerDown: function _onPointerDown(e) {
        this.__pointerDownCoords = this.getCellAtPosition(e.getDocumentLeft(), e.getDocumentTop());
      },

      /**
       * Event listener for pointer taps. Fires an cellTap event.
       *
       * @param e {qx.event.type.Pointer} The incoming pointer event.
       */
      _onTap: function _onTap(e) {
        this.__handlePointerCellEvent(e, "cellTap");
      },

      /**
       * Event listener for context menu taps. Fires an cellContextmenu event.
       *
       * @param e {qx.event.type.Pointer} The incoming pointer event.
       */
      _onContextmenu: function _onContextmenu(e) {
        this.__handlePointerCellEvent(e, "cellContextmenu");
      },

      /**
       * Event listener for double taps. Fires an cellDbltap event.
       *
       * @param e {qx.event.type.Pointer} The incoming pointer event.
       */
      _onDbltap: function _onDbltap(e) {
        this.__handlePointerCellEvent(e, "cellDbltap");
      },

      /**
       * Fixed scrollbar position whenever it is out of range
       * it can happen when removing an item from the list reducing
       * the max value for scrollY #8976
       */
      _checkScrollBounds: function _checkScrollBounds() {
        var maxx = this.getScrollMaxX();
        var maxy = this.getScrollMaxY();

        if (this.__scrollLeft < 0) {
          this.__scrollLeft = 0;
        } else if (this.__scrollLeft > maxx) {
          this.__scrollLeft = maxx;
        }

        if (this.__scrollTop < 0) {
          this.__scrollTop = 0;
        } else if (this.__scrollTop > maxy) {
          this.__scrollTop = maxy;
        }
      },

      /**
       * Converts a pointer event into a cell event and fires the cell event if the
       * pointer is over a cell.
       *
       * @param e {qx.event.type.Pointer} The pointer event.
       * @param cellEventType {String} The name of the cell event to fire.
       */
      __handlePointerCellEvent: function __handlePointerCellEvent(e, cellEventType) {
        var coords = this.getCellAtPosition(e.getDocumentLeft(), e.getDocumentTop());

        if (!coords) {
          return;
        }

        var pointerDownCoords = this.__pointerDownCoords;

        if (pointerDownCoords == null || pointerDownCoords.row !== coords.row || pointerDownCoords.column !== coords.column) {
          return;
        }

        this.fireNonBubblingEvent(cellEventType, qx.ui.virtual.core.CellEvent, [this, e, coords.row, coords.column]);
      },

      /*
      ---------------------------------------------------------------------------
        PANE UPDATE
      ---------------------------------------------------------------------------
      */
      // overridden
      syncWidget: function syncWidget(jobs) {
        if (this.__jobs._fullUpdate) {
          this._checkScrollBounds();

          this._fullUpdate();
        } else if (this.__jobs._updateScrollPosition) {
          this._checkScrollBounds();

          this._updateScrollPosition();
        }

        this.__jobs = {};
      },

      /**
       * Sets the size of the layers to contain the cells at the pixel position
       * "left/right" up to "left+minHeight/right+minHeight". The offset of the
       * layer container is adjusted to respect the pane's scroll top and scroll
       * left values.
       *
       * @param layers {qx.ui.virtual.core.ILayer[]} List of layers to update.
       * @param left {Integer} Maximum left pixel coordinate of the layers.
       * @param top {Integer} Maximum top pixel coordinate of the layers.
       * @param minWidth {Integer} The minimum end coordinate of the layers will
       *    be larger than <code>left+minWidth</code>.
       * @param minHeight {Integer} The minimum end coordinate of the layers will
       *    be larger than <code>top+minHeight</code>.
       * @param doFullUpdate {Boolean?false} Whether a full update on the layer
       *    should be performed of if only the layer window should be updated.
       */
      _setLayerWindow: function _setLayerWindow(layers, left, top, minWidth, minHeight, doFullUpdate) {
        var rowCellData = this.__rowConfig.getItemAtPosition(top);

        if (rowCellData) {
          var firstRow = rowCellData.index;

          var rowSizes = this.__rowConfig.getItemSizes(firstRow, minHeight + rowCellData.offset);

          var layerHeight = qx.lang.Array.sum(rowSizes);
          var layerTop = top - rowCellData.offset;
          var layerBottom = top - rowCellData.offset + layerHeight;
        } else {
          var firstRow = 0;
          var rowSizes = [];
          var layerHeight = 0;
          var layerTop = 0;
          var layerBottom = 0;
        }

        var columnCellData = this.__columnConfig.getItemAtPosition(left);

        if (columnCellData) {
          var firstColumn = columnCellData.index;

          var columnSizes = this.__columnConfig.getItemSizes(firstColumn, minWidth + columnCellData.offset);

          var layerWidth = qx.lang.Array.sum(columnSizes);
          var layerLeft = left - columnCellData.offset;
          var layerRight = left - columnCellData.offset + layerWidth;
        } else {
          var firstColumn = 0;
          var columnSizes = [];
          var layerWidth = 0;
          var layerLeft = 0;
          var layerRight = 0;
        }

        this.__layerWindow = {
          top: layerTop,
          bottom: layerBottom,
          left: layerLeft,
          right: layerRight
        };

        this.__layerContainer.setUserBounds((this.getPaddingLeft() || 0) + (this.__layerWindow.left - this.__scrollLeft), (this.getPaddingTop() || 0) + (this.__layerWindow.top - this.__scrollTop), layerWidth, layerHeight);

        this.__columnSizes = columnSizes;
        this.__rowSizes = rowSizes;

        for (var i = 0; i < this.__layers.length; i++) {
          var layer = this.__layers[i];
          layer.setUserBounds(0, 0, layerWidth, layerHeight);

          if (doFullUpdate) {
            layer.fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
          } else {
            layer.updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes);
          }
        }
      },

      /**
       * Check whether the pane was resized and fire an {@link #update} event if
       * it was.
       */
      __checkPaneResize: function __checkPaneResize() {
        if (this.__dontFireUpdate) {
          return;
        }

        var scrollSize = this.getScrollSize();

        if (this.__paneHeight !== scrollSize.height || this.__paneWidth !== scrollSize.width) {
          this.__paneHeight = scrollSize.height;
          this.__paneWidth = scrollSize.width;
          this.fireEvent("update");
        }
      },

      /**
       * Schedule a full update on all visible layers.
       */
      fullUpdate: function fullUpdate() {
        this.__jobs._fullUpdate = 1;
        qx.ui.core.queue.Widget.add(this);
      },

      /**
       * Whether a full update is scheduled.
       *
       * @return {Boolean} Whether a full update is scheduled.
       */
      isUpdatePending: function isUpdatePending() {
        return !!this.__jobs._fullUpdate;
      },

      /**
       * Perform a full update on all visible layers. All cached data will be
       * discarded.
       */
      _fullUpdate: function _fullUpdate() {
        var layers = this.getVisibleLayers();

        if (layers.length == 0) {
          this.__checkPaneResize();

          return;
        }

        var bounds = this.getBounds();

        if (!bounds) {
          return; // the pane has not yet been rendered -> wait for the appear event
        }

        this._setLayerWindow(layers, this.__scrollLeft, this.__scrollTop, bounds.width, bounds.height, true);

        this.__checkPaneResize();
      },

      /**
       * Schedule an update the visible window of the grid according to the top
       * and left scroll positions.
       */
      _deferredUpdateScrollPosition: function _deferredUpdateScrollPosition() {
        this.__jobs._updateScrollPosition = 1;
        qx.ui.core.queue.Widget.add(this);
      },

      /**
       * Update the visible window of the grid according to the top and left scroll
       * positions.
       */
      _updateScrollPosition: function _updateScrollPosition() {
        var layers = this.getVisibleLayers();

        if (layers.length == 0) {
          this.__checkPaneResize();

          return;
        }

        var bounds = this.getBounds();

        if (!bounds) {
          return; // the pane has not yet been rendered -> wait for the appear event
        } // the visible window of the virtual coordinate space


        var paneWindow = {
          top: this.__scrollTop,
          bottom: this.__scrollTop + bounds.height,
          left: this.__scrollLeft,
          right: this.__scrollLeft + bounds.width
        };

        if (this.__layerWindow.top <= paneWindow.top && this.__layerWindow.bottom >= paneWindow.bottom && this.__layerWindow.left <= paneWindow.left && this.__layerWindow.right >= paneWindow.right) {
          // only update layer container offset
          this.__layerContainer.setUserBounds((this.getPaddingLeft() || 0) + (this.__layerWindow.left - paneWindow.left), (this.getPaddingTop() || 0) + (this.__layerWindow.top - paneWindow.top), this.__layerWindow.right - this.__layerWindow.left, this.__layerWindow.bottom - this.__layerWindow.top);
        } else {
          this._setLayerWindow(layers, this.__scrollLeft, this.__scrollTop, bounds.width, bounds.height, false);
        }

        this.__checkPaneResize();
      }
    },
    destruct: function destruct() {
      this._disposeArray("__layers");

      this._disposeObjects("__rowConfig", "__columnConfig", "__layerContainer");

      this.__layerWindow = this.__jobs = this.__columnSizes = this.__rowSizes = null;
    }
  });
  qx.ui.virtual.core.Pane.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.core.Scroller": {
        "construct": true,
        "require": true
      },
      "qx.ui.tree.core.IVirtualTree": {
        "require": true
      },
      "qx.data.controller.ISelection": {
        "require": true
      },
      "qx.ui.virtual.selection.MModel": {
        "require": true
      },
      "qx.ui.core.MContentPadding": {
        "require": true
      },
      "qx.lang.Array": {},
      "qx.ui.tree.core.OpenCloseController": {},
      "qx.data.Array": {},
      "qx.ui.tree.provider.WidgetProvider": {},
      "qx.ui.tree.core.Util": {},
      "qx.data.marshal.MEventBubbling": {},
      "qx.data.SingleValueBinding": {},
      "qx.util.DeferredCall": {},
      "qx.ui.core.queue.Widget": {},
      "qx.util.Delegate": {},
      "qx.core.ObjectRegistry": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /*
   * Virtual tree implementation.
   *
   * The virtual tree can be used to render node and leafs. Nodes and leafs are
   * both items for a tree. The difference between a node and a leaf is that a
   * node has child items, but a leaf not.
   *
   * With the {@link qx.ui.tree.core.IVirtualTreeDelegate} interface it is possible
   * to configure the tree's behavior (item renderer configuration, etc.).
   *
   * Here's an example of how to use the widget, including using a model
   * property to open/close branches. See the two timers at the end. The first
   * one opens all branches after two seconds; the second cleans up the tree
   * after five seconds.
   *
   * <pre class="javascript">
   *   var nodes = 
   *   [
   *     {
   *       name : "Root",
   *       open : false,
   *       children :
   *       [
   *         {
   *           name : "Branch 1",
   *           open : false,
   *           children :
   *           [
   *             {
   *               name : "Leaf 1.1"
   *             },
   *             {
   *               name : "Leaf 1.2"
   *             },
   *             {
   *               name : "Branch 1.3",
   *               open : false,
   *               children :
   *               [
   *                 {
   *                   name : "Branch 1.3.1",
   *                   open : false,
   *                   children :
   *                   [
   *                     {
   *                       name : "Leaf 1.3.1.1"
   *                     }
   *                   ]
   *                 }
   *               ]
   *             }
   *           ]
   *         }
   *       ]
   *     }
   *   ];
   *
   *   // convert the raw nodes to qooxdoo objects
   *   nodes = qx.data.marshal.Json.createModel(nodes, true);
   *
   *   // create the tree and synchronize the model property 'open'
   *   // to nodes being open
   *   var tree =
   *     new qx.ui.tree.VirtualTree(
   *       nodes.getItem(0), "name", "children", "open").set({
   *         width : 200,
   *         height : 400
   *       });
   *
   *   //log selection changes
   *   tree.getSelection().addListener("change", function(e) {
   *     this.debug("Selection: " + tree.getSelection().getItem(0).getName());
   *   }, this);
   *
   *   tree.set(
   *     {
   *       width : 200,
   *       height : 400,
   *       showTopLevelOpenCloseIcons : true
   *     });
   *
   *   var doc = this.getRoot();
   *   doc.add(tree,
   *   {
   *     left : 100,
   *     top  : 50
   *   });
   *
   *   // After two seconds, open up all branches by setting their open
   *   // property to true.
   *   qx.event.Timer.once(
   *     function()
   *     {
   *       ;(function allOpen(root)
   *         {
   *           if (root.setOpen)     root.setOpen(true);
   *           if (root.getChildren) root.getChildren().forEach(allOpen);
   *         })(nodes.getItem(0));
   *     },
   *     this,
   *     2000);
   *
   *   // After five seconds, remove and dispose the tree.
   *   qx.event.Timer.once(
   *     function()
   *     {
   *       doc.remove(tree);
   *       tree.dispose();
   *       console.warn("All cleaned up.");
   *     },
   *     this,
   *     5000);
   * </pre>
   */
  qx.Class.define("qx.ui.tree.VirtualTree", {
    extend: qx.ui.virtual.core.Scroller,
    implement: [qx.ui.tree.core.IVirtualTree, qx.data.controller.ISelection],
    include: [qx.ui.virtual.selection.MModel, qx.ui.core.MContentPadding],

    /**
     * @param rootModel {qx.core.Object?null} The model structure representing
     *   the root of the tree, for more details have a look at the 'model'
     *   property.
     * @param labelPath {String?null} The name of the label property, for more
     *   details have a look at the 'labelPath' property.
     * @param childProperty {String?null} The name of the child property, for
     *   more details have a look at the 'childProperty' property.
     * @param openProperty {String|null} the name of the model property which
     *   represents the open state of a branch. If this value is provided, so, 
     *   too, must be rootModel.
     */
    construct: function construct(rootModel, labelPath, childProperty, openProperty) {
      qx.ui.virtual.core.Scroller.constructor.call(this, 0, 1, 20, 100);

      this._init();

      if (labelPath != null) {
        this.setLabelPath(labelPath);
      }

      if (childProperty != null) {
        this.setChildProperty(childProperty);
      }

      if (rootModel != null) {
        this.initModel(rootModel);
      }

      this.initItemHeight();
      this.initOpenMode();
      this.addListener("keypress", this._onKeyPress, this); // If an open property and root model are provided, start up the open-close controller.

      if (openProperty && rootModel) {
        this.openViaModelChanges(openProperty);
      }
    },
    events: {
      /**
       * Fired when a node is opened.
       */
      open: "qx.event.type.Data",

      /**
       * Fired when a node is closed.
       */
      close: "qx.event.type.Data"
    },
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "virtual-tree"
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },
      // overridden
      width: {
        refine: true,
        init: 100
      },
      // overridden
      height: {
        refine: true,
        init: 200
      },

      /** Default item height. */
      itemHeight: {
        check: "Integer",
        init: 25,
        apply: "_applyRowHeight",
        themeable: true
      },

      /**
      * Control whether tap or double tap should open or close the tapped
      * item.
      */
      openMode: {
        check: ["tap", "dbltap", "none"],
        init: "dbltap",
        apply: "_applyOpenMode",
        event: "changeOpenMode",
        themeable: true
      },

      /**
       * Hides *only* the root node, not the node's children when the property is
       * set to <code>true</code>.
       */
      hideRoot: {
        check: "Boolean",
        init: false,
        apply: "_applyHideRoot"
      },

      /**
       * Whether top level items should have an open/close button. The top level
       * item item is normally the root item, but when the root is hidden, the
       * root children are the top level items.
       */
      showTopLevelOpenCloseIcons: {
        check: "Boolean",
        init: false,
        apply: "_applyShowTopLevelOpenCloseIcons"
      },

      /**
       * Configures the tree to show also the leafs. When the property is set to
       * <code>false</code> *only* the nodes are shown.
       */
      showLeafs: {
        check: "Boolean",
        init: true,
        apply: "_applyShowLeafs"
      },

      /**
       * The name of the property, where the children are stored in the model.
       * Instead of the {@link #labelPath} must the child property a direct
       * property form the model instance.
       */
      childProperty: {
        check: "String",
        apply: "_applyChildProperty",
        nullable: true
      },

      /**
       * The name of the property, where the value for the tree folders label
       * is stored in the model classes.
       */
      labelPath: {
        check: "String",
        apply: "_applyLabelPath",
        nullable: true
      },

      /**
       * The path to the property which holds the information that should be
       * shown as an icon.
       */
      iconPath: {
        check: "String",
        apply: "_applyIconPath",
        nullable: true
      },

      /**
       * A map containing the options for the label binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      labelOptions: {
        apply: "_applyLabelOptions",
        nullable: true
      },

      /**
       * A map containing the options for the icon binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      iconOptions: {
        apply: "_applyIconOptions",
        nullable: true
      },

      /**
       * The model containing the data (nodes and/or leafs) which should be shown
       * in the tree.
       */
      model: {
        check: "qx.core.Object",
        apply: "_applyModel",
        event: "changeModel",
        nullable: true,
        deferredInit: true
      },

      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.tree.core.IVirtualTreeDelegate} interface.
       */
      delegate: {
        event: "changeDelegate",
        apply: "_applyDelegate",
        init: null,
        nullable: true
      }
    },
    members: {
      /** @type {qx.ui.tree.provider.WidgetProvider} Provider for widget rendering. */
      _provider: null,

      /** @type {qx.ui.virtual.layer.Abstract} Layer which contains the items. */
      _layer: null,

      /**
       * @type {qx.data.Array} The internal lookup table data structure to get the model item
       * from a row.
       */
      __lookupTable: null,

      /** @type {Array} HashMap which contains all open nodes. */
      __openNodes: null,

      /**
       * @type {Array} The internal data structure to get the nesting level from a
       * row.
       */
      __nestingLevel: null,

      /**
       * @type {qx.util.DeferredCall} Adds this instance to the widget queue on a
       * deferred call.
       */
      __deferredCall: null,

      /** @type {Integer} Holds the max item width from a rendered widget. */
      _itemWidth: 0,

      /** @type {Array} internal parent chain form the last selected node */
      __parentChain: null,

      /** 
       * @type {String|null} the name of the model property which represents the
       *   open state of a branch.
       */
      __openProperty: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */
      // overridden
      syncWidget: function syncWidget(jobs) {
        var firstRow = this._layer.getFirstRow();

        var rowSize = this._layer.getRowSizes().length;

        for (var row = firstRow; row < firstRow + rowSize; row++) {
          var widget = this._layer.getRenderedCellWidget(row, 0);

          if (widget != null) {
            this._itemWidth = Math.max(this._itemWidth, widget.getSizeHint().width);
          }
        }

        var paneWidth = this.getPane().getInnerSize().width;
        this.getPane().getColumnConfig().setItemSize(0, Math.max(this._itemWidth, paneWidth));
      },
      // Interface implementation
      openNode: function openNode(node) {
        this.__openNode(node);

        this.buildLookupTable();
      },
      // Interface implementation
      openNodeWithoutScrolling: function openNodeWithoutScrolling(node) {
        var autoscroll = this.getAutoScrollIntoView(); // suspend automatically scrolling selection into view

        this.setAutoScrollIntoView(false);
        this.openNode(node); // re set to original value

        this.setAutoScrollIntoView(autoscroll);
      },

      /**
       * Trigger a rebuild from the internal data structure.
       */
      refresh: function refresh() {
        this.buildLookupTable();
      },

      /**
       * Opens the passed node and all his parents. *Note!* The algorithm
       * implements a depth-first search with a complexity: <code>O(n)</code> and
       * <code>n</code> are all model items.
       *
       * @param node {qx.core.Object} Node to open.
       */
      openNodeAndParents: function openNodeAndParents(node) {
        this.__openNodeAndAllParents(this.getModel(), node);

        this.buildLookupTable();
      },
      // Interface implementation
      closeNode: function closeNode(node) {
        if (this.__openNodes.includes(node)) {
          qx.lang.Array.remove(this.__openNodes, node);
          this.fireDataEvent("close", node);
          this.buildLookupTable();
        }
      },
      // Interface implementation
      closeNodeWithoutScrolling: function closeNodeWithoutScrolling(node) {
        var autoscroll = this.getAutoScrollIntoView(); // suspend automatically scrolling selection into view

        this.setAutoScrollIntoView(false);
        this.closeNode(node); // re set to original value

        this.setAutoScrollIntoView(autoscroll);
      },
      // Interface implementation
      isNodeOpen: function isNodeOpen(node) {
        return this.__openNodes.includes(node);
      },

      /**
       * Open and close branches via changes to a property in the model.
       * 
       * @param openProperty {String|null} 
       *   The name of the open property, which determines the open state of a
       *   branch in the tree. If null, turn off opening and closing branches
       *   via changes to the model.
       */
      openViaModelChanges: function openViaModelChanges(openProperty) {
        // Save the open property
        this.__openProperty = openProperty; // if no name is provided, just remove any prior open-close controller

        if (!openProperty) {
          if (this._openCloseController) {
            this._openCloseController.dispose();

            this._openCloseController = null;
          }

          return;
        } // we have a property name, so create controller


        this._openCloseController = new qx.ui.tree.core.OpenCloseController(this, this.getModel(), openProperty);
      },

      /**
       * Getter for the open property
       */
      getOpenProperty: function getOpenProperty() {
        return this.__openProperty;
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL API
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the virtual tree.
       */
      _init: function _init() {
        this.__lookupTable = new qx.data.Array();
        this.__openNodes = [];
        this.__nestingLevel = [];

        this._initLayer();
      },

      /**
       * Initializes the virtual tree layer.
       */
      _initLayer: function _initLayer() {
        this._provider = new qx.ui.tree.provider.WidgetProvider(this);
        this._layer = this._provider.createLayer();

        this._layer.addListener("updated", this._onUpdated, this);

        this.getPane().addLayer(this._layer);
        this.getPane().addListenerOnce("resize", function (e) {
          // apply width to pane on first rendering pass
          // to avoid visible flickering
          this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
        }, this);
      },
      // Interface implementation
      getLookupTable: function getLookupTable() {
        return this.__lookupTable;
      },
      // Interface implementation
      isShowTopLevelOpenCloseIcons: function isShowTopLevelOpenCloseIcons() {
        return true;
      },

      /**
       * Performs a lookup from model index to row.
       *
       * @param index {Number} The index to look at.
       * @return {Number} The row or <code>-1</code>
       *  if the index is not a model index.
       */
      _reverseLookup: function _reverseLookup(index) {
        return index;
      },

      /**
       * Returns the model data for the given row.
       *
       * @param row {Integer} row to get data for.
       * @return {var|null} the row's model data.
       */
      _getDataFromRow: function _getDataFromRow(row) {
        return this.__lookupTable.getItem(row);
      },

      /**
       * Returns the selectable model items.
       *
       * @return {qx.data.Array} The selectable items.
       */
      _getSelectables: function _getSelectables() {
        return this.__lookupTable;
      },

      /**
       * Returns all open nodes.
       *
       * @internal
       * @return {Array} All open nodes.
       */
      getOpenNodes: function getOpenNodes() {
        return this.__openNodes;
      },
      // Interface implementation
      isNode: function isNode(item) {
        return qx.ui.tree.core.Util.isNode(item, this.getChildProperty());
      },
      // Interface implementation
      getLevel: function getLevel(row) {
        return this.__nestingLevel[row];
      },
      // Interface implementation
      hasChildren: function hasChildren(node) {
        return qx.ui.tree.core.Util.hasChildren(node, this.getChildProperty(), !this.isShowLeafs());
      },

      /**
       * Returns the element, to which the content padding should be applied.
       *
       * @return {qx.ui.core.Widget} The content padding target.
       */
      _getContentPaddingTarget: function _getContentPaddingTarget() {
        return this.getPane();
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY METHODS
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyRowHeight: function _applyRowHeight(value, old) {
        this.getPane().getRowConfig().setDefaultItemSize(value);
      },
      // property apply
      _applyOpenMode: function _applyOpenMode(value, old) {
        var pane = this.getPane(); //"tap", "dbltap", "none"

        if (value === "dbltap") {
          pane.addListener("cellDbltap", this._onOpen, this);
        } else if (value === "tap") {
          pane.addListener("cellTap", this._onOpen, this);
        }

        if (old === "dbltap") {
          pane.removeListener("cellDbltap", this._onOpen, this);
        } else if (old === "tap") {
          pane.removeListener("cellTap", this._onOpen, this);
        }
      },
      // property apply
      _applyHideRoot: function _applyHideRoot(value, old) {
        this.buildLookupTable();
      },
      // property apply
      _applyShowTopLevelOpenCloseIcons: function _applyShowTopLevelOpenCloseIcons(value, old) {
        // force rebuild of the lookup table
        // fixes https://github.com/qooxdoo/qooxdoo/issues/9128
        this.getLookupTable().removeAll();
        this.buildLookupTable();
      },
      // property apply
      _applyShowLeafs: function _applyShowLeafs(value, old) {
        // force rebuild of the lookup table
        // fixes https://github.com/qooxdoo/qooxdoo/issues/9128
        this.getLookupTable().removeAll();
        this.buildLookupTable();
      },
      // property apply
      _applyChildProperty: function _applyChildProperty(value, old) {
        this._provider.setChildProperty(value);
      },
      // property apply
      _applyLabelPath: function _applyLabelPath(value, old) {
        this._provider.setLabelPath(value);
      },
      // property apply
      _applyIconPath: function _applyIconPath(value, old) {
        this._provider.setIconPath(value);
      },
      // property apply
      _applyLabelOptions: function _applyLabelOptions(value, old) {
        this._provider.setLabelOptions(value);
      },
      // property apply
      _applyIconOptions: function _applyIconOptions(value, old) {
        this._provider.setIconOptions(value);
      },
      // property apply
      _applyModel: function _applyModel(value, old) {
        this.__openNodes = [];

        if (value != null) {
          {
            if (!qx.Class.hasMixin(value.constructor, qx.data.marshal.MEventBubbling)) {
              this.warn("The model item doesn't support the Mixin 'qx.data.marshal.MEventBubbling'. Therefore the tree can not update the view automatically on model changes.");
            }
          }
          value.addListener("changeBubble", this._onChangeBubble, this);

          this.__openNode(value);
        } // If the model changes, an existing OpenCloseController is no longer
        // valid, so dispose it. The user should call openViaModelChanges again.


        if (this._openCloseController) {
          this._openCloseController.dispose();

          this._openCloseController = null;
        }

        if (old != null) {
          old.removeListener("changeBubble", this._onChangeBubble, this);
        }

        this.__applyModelChanges();
      },
      // property apply
      _applyDelegate: function _applyDelegate(value, old) {
        this._provider.setDelegate(value);

        this.buildLookupTable();
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the changeBubble event. The handler rebuild the lookup
       * table when the child structure changed.
       *
       * @param event {qx.event.type.Data} The data event.
       */
      _onChangeBubble: function _onChangeBubble(event) {
        var data = event.getData();
        var propertyName = data.name;
        var index = propertyName.lastIndexOf(".");

        if (index != -1) {
          propertyName = propertyName.substr(index + 1, propertyName.length);
        } // only continue when the effected property is the child property


        if (propertyName.startsWith(this.getChildProperty())) {
          var item = data.item;

          if (qx.Class.isSubClassOf(item.constructor, qx.data.Array)) {
            if (index === -1) {
              item = this.getModel();
            } else {
              var propertyChain = data.name.substr(0, index);
              item = qx.data.SingleValueBinding.resolvePropertyChain(this.getModel(), propertyChain);
            }
          }

          if (this.__lookupTable.indexOf(item) != -1) {
            this.__applyModelChanges();
          }
        }
      },

      /**
       * Event handler for the update event.
       *
       * @param event {qx.event.type.Event} The event.
       */
      _onUpdated: function _onUpdated(event) {
        if (this.__deferredCall == null) {
          this.__deferredCall = new qx.util.DeferredCall(function () {
            qx.ui.core.queue.Widget.add(this);
          }, this);
        }

        this.__deferredCall.schedule();
      },

      /**
       * Event handler to open/close tapped nodes.
       *
       * @param event {qx.ui.virtual.core.CellEvent} The cell tap event.
       */
      _onOpen: function _onOpen(event) {
        var row = event.getRow();

        var item = this.__lookupTable.getItem(row);

        if (this.isNode(item)) {
          if (this.isNodeOpen(item)) {
            this.closeNode(item);
          } else {
            this.openNode(item);
          }
        }
      },

      /**
       * Event handler for key press events. Open and close the current selected
       * item on key left and right press. Jump to parent on key left if already
       * closed.
       *
       * @param e {qx.event.type.KeySequence} key event.
       */
      _onKeyPress: function _onKeyPress(e) {
        var selection = this.getSelection();

        if (selection.getLength() > 0) {
          var item = selection.getItem(0);
          var isNode = this.isNode(item);

          switch (e.getKeyIdentifier()) {
            case "Left":
              if (isNode && this.isNodeOpen(item)) {
                this.closeNode(item);
              } else {
                var parent = this.getParent(item);

                if (parent != null) {
                  selection.splice(0, 1, parent);
                }
              }

              break;

            case "Right":
              if (isNode && !this.isNodeOpen(item)) {
                this.openNode(item);
              } else {
                if (isNode) {
                  var children = item.get(this.getChildProperty());

                  if (children != null && children.getLength() > 0) {
                    selection.splice(0, 1, children.getItem(0));
                  }
                }
              }

              break;

            case "Enter":
            case "Space":
              if (!isNode) {
                return;
              }

              if (this.isNodeOpen(item)) {
                this.closeNode(item);
              } else {
                this.openNode(item);
              }

              break;
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        SELECTION HOOK METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Hook method which is called from the {@link qx.ui.virtual.selection.MModel}.
       * The hook method sets the first visible parent not as new selection when
       * the current selection is empty and the selection mode is one selection.
       *
       * @param newSelection {Array} The newSelection which will be set to the selection manager.
       */
      _beforeApplySelection: function _beforeApplySelection(newSelection) {
        if (newSelection.length === 0 && this.getSelectionMode() === "one") {
          var visibleParent = this.__getVisibleParent();

          var row = this.getLookupTable().indexOf(visibleParent);

          if (row >= 0) {
            newSelection.push(row);
          }
        }
      },

      /**
       * Hook method which is called from the {@link qx.ui.virtual.selection.MModel}.
       * The hook method builds the parent chain form the current selected item.
       */
      _afterApplySelection: function _afterApplySelection() {
        var selection = this.getSelection();

        if (selection.getLength() > 0 && this.getSelectionMode() === "one") {
          this.__buildParentChain(selection.getItem(0));
        } else {
          this.__parentChain = [];
        }
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Helper method to apply model changes. Normally build the lookup table and
       * apply the default selection.
       */
      __applyModelChanges: function __applyModelChanges() {
        this.buildLookupTable();

        this._applyDefaultSelection();
      },

      /**
       * Helper method to build the internal data structure.
       *
       * @internal
       */
      buildLookupTable: function buildLookupTable() {
        if (this.getModel() != null && (this.getChildProperty() == null || this.getLabelPath() == null)) {
          throw new Error("Could not build tree, because 'childProperty' and/or 'labelPath' is 'null'!");
        }

        this._itemWidth = 0;
        var lookupTable = [];
        this.__nestingLevel = [];
        var nestedLevel = -1;
        var root = this.getModel();

        if (root != null) {
          if (!this.isHideRoot()) {
            nestedLevel++;
            lookupTable.push(root);

            this.__nestingLevel.push(nestedLevel);
          }

          if (this.isNodeOpen(root)) {
            var visibleChildren = this.__getVisibleChildrenFrom(root, nestedLevel);

            lookupTable = lookupTable.concat(visibleChildren);
          }
        }

        if (!qx.lang.Array.equals(this.__lookupTable.toArray(), lookupTable)) {
          this._provider.removeBindings();

          this.__lookupTable.removeAll();

          this.__lookupTable.append(lookupTable);

          this.__updateRowCount();

          this._updateSelection();
        }
      },

      /**
       * Helper method to get all visible children form the passed parent node.
       * The algorithm implements a depth-first search with a complexity:
       * <code>O(n)</code> and <code>n</code> are all visible items.
       *
       * @param node {qx.core.Object} The start node to start search.
       * @param nestedLevel {Integer} The nested level from the start node.
       * @return {Array} All visible children form the parent.
       */
      __getVisibleChildrenFrom: function __getVisibleChildrenFrom(node, nestedLevel) {
        var visible = [];
        nestedLevel++;

        if (!this.isNode(node)) {
          return visible;
        }

        var children = node.get(this.getChildProperty());

        if (children == null) {
          return visible;
        } // clone children to keep original model unmodified


        children = children.copy();
        var delegate = this.getDelegate();
        var filter = qx.util.Delegate.getMethod(delegate, "filter");
        var sorter = qx.util.Delegate.getMethod(delegate, "sorter");

        if (sorter != null) {
          children.sort(sorter);
        }

        for (var i = 0; i < children.getLength(); i++) {
          var child = children.getItem(i);

          if (filter && !filter(child)) {
            continue;
          }

          if (this.isNode(child)) {
            this.__nestingLevel.push(nestedLevel);

            visible.push(child);

            if (this.isNodeOpen(child)) {
              var visibleChildren = this.__getVisibleChildrenFrom(child, nestedLevel);

              visible = visible.concat(visibleChildren);
            }
          } else {
            if (this.isShowLeafs()) {
              this.__nestingLevel.push(nestedLevel);

              visible.push(child);
            }
          }
        } // dispose children clone


        children.dispose();
        return visible;
      },

      /**
       * Helper method to set the node to the open nodes data structure when it
       * is not included.
       *
       * @param node {qx.core.Object} Node to set to open nodes.
       */
      __openNode: function __openNode(node) {
        if (!this.__openNodes.includes(node)) {
          this.__openNodes.push(node);

          this.fireDataEvent("open", node);
        }
      },

      /**
       * Helper method to set the target node and all his parents to the open
       * nodes data structure. The algorithm implements a depth-first search with
       * a complexity: <code>O(n)</code> and <code>n</code> are all model items.
       *
       * @param startNode {qx.core.Object} Start (root) node to search.
       * @param targetNode {qx.core.Object} Target node to open (and his parents).
       * @return {Boolean} <code>True</code> when the targetNode and his
       *  parents could opened, <code>false</code> otherwise.
       */
      __openNodeAndAllParents: function __openNodeAndAllParents(startNode, targetNode) {
        if (startNode === targetNode) {
          this.__openNode(targetNode);

          return true;
        }

        if (!this.isNode(startNode)) {
          return false;
        }

        var children = startNode.get(this.getChildProperty());

        if (children == null) {
          return false;
        }

        for (var i = 0; i < children.getLength(); i++) {
          var child = children.getItem(i);

          var result = this.__openNodeAndAllParents(child, targetNode);

          if (result === true) {
            this.__openNode(child);

            return true;
          }
        }

        return false;
      },

      /**
       * Helper method to update the row count.
       */
      __updateRowCount: function __updateRowCount() {
        this.getPane().getRowConfig().setItemCount(this.__lookupTable.getLength());
        this.getPane().fullUpdate();
      },

      /**
       * Helper method to get the parent node. Node! This only works with leaf and
       * nodes which are in the internal lookup table.
       *
       * @param item {qx.core.Object} Node or leaf to get parent.
       * @return {qx.core.Object|null} The parent note or <code>null</code> when
       *   no parent found.
       *
       * @internal
       */
      getParent: function getParent(item) {
        var index = this.__lookupTable.indexOf(item);

        if (index < 0) {
          return null;
        }

        var level = this.__nestingLevel[index];

        while (index > 0) {
          index--;
          var levelBefore = this.__nestingLevel[index];

          if (levelBefore < level) {
            return this.__lookupTable.getItem(index);
          }
        }

        return null;
      },

      /**
       * Builds the parent chain form the passed item.
       *
       * @param item {var} Item to build parent chain.
       */
      __buildParentChain: function __buildParentChain(item) {
        this.__parentChain = [];
        var parent = this.getParent(item);

        while (parent != null) {
          this.__parentChain.unshift(parent);

          parent = this.getParent(parent);
        }
      },

      /**
       * Return the first visible parent node from the last selected node.
       *
       * @return {var} The first visible node.
       */
      __getVisibleParent: function __getVisibleParent() {
        if (this.__parentChain == null) {
          return this.getModel();
        }

        var lookupTable = this.getLookupTable();

        var parent = this.__parentChain.pop();

        while (parent != null) {
          if (lookupTable.contains(parent)) {
            return parent;
          }

          parent = this.__parentChain.pop();
        }

        return this.getModel();
      }
    },
    destruct: function destruct() {
      if (this._openCloseController) {
        this._openCloseController.dispose();
      }

      var pane = this.getPane();

      if (pane != null) {
        if (pane.hasListener("cellDbltap")) {
          pane.removeListener("cellDbltap", this._onOpen, this);
        }

        if (pane.hasListener("cellTap")) {
          pane.removeListener("cellTap", this._onOpen, this);
        }
      }

      if (!qx.core.ObjectRegistry.inShutDown && this.__deferredCall != null) {
        this.__deferredCall.cancel();

        this.__deferredCall.dispose();
      }

      var model = this.getModel();

      if (model != null) {
        model.removeListener("changeBubble", this._onChangeBubble, this);
      }

      this._layer.removeListener("updated", this._onUpdated, this);

      this._layer.destroy();

      this._provider.dispose();

      this.__lookupTable.dispose();

      this._layer = this._provider = this.__lookupTable = this.__openNodes = this.__deferredCall = null;
    }
  });
  qx.ui.tree.VirtualTree.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-17.js.map
