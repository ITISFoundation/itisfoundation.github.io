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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * All widget used as scrollbars must implement this interface.
   */
  qx.Interface.define("qx.ui.core.scroll.IScrollBar", {
    events: {
      /** Fired if the user scroll */
      "scroll": "qx.event.type.Data",

      /** Fired as soon as the scroll animation ended. */
      "scrollAnimationEnd": 'qx.event.type.Event'
    },
    properties: {
      /**
       * The scroll bar orientation
       */
      orientation: {},

      /**
       * The maximum value (difference between available size and
       * content size).
       */
      maximum: {},

      /**
       * Position of the scrollbar (which means the scroll left/top of the
       * attached area's pane)
       *
       * Strictly validates according to {@link #maximum}.
       * Does not apply any correction to the incoming value. If you depend
       * on this, please use {@link #scrollTo} instead.
       */
      position: {},

      /**
       * Factor to apply to the width/height of the knob in relation
       * to the dimension of the underlying area.
       */
      knobFactor: {}
    },
    members: {
      /**
       * Scrolls to the given position.
       *
       * This method automatically corrects the given position to respect
       * the {@link #maximum}.
       *
       * @param position {Integer} Scroll to this position. Must be greater zero.
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      scrollTo: function scrollTo(position, duration) {
        this.assertNumber(position);
      },

      /**
       * Scrolls by the given offset.
       *
       * This method automatically corrects the given position to respect
       * the {@link #maximum}.
       *
       * @param offset {Integer} Scroll by this offset
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      scrollBy: function scrollBy(offset, duration) {
        this.assertNumber(offset);
      },

      /**
       * Scrolls by the given number of steps.
       *
       * This method automatically corrects the given position to respect
       * the {@link #maximum}.
       *
       * @param steps {Integer} Number of steps
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      scrollBySteps: function scrollBySteps(steps, duration) {
        this.assertNumber(steps);
      }
    }
  });
  qx.ui.core.scroll.IScrollBar.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.scroll.IScrollBar": {
        "require": true
      },
      "qx.ui.core.scroll.ScrollSlider": {},
      "qx.ui.form.RepeatButton": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.layout.VBox": {}
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
   * The scroll bar widget, is a special slider, which is used in qooxdoo instead
   * of the native browser scroll bars.
   *
   * Scroll bars are used by the {@link qx.ui.container.Scroll} container. Usually
   * a scroll bar is not used directly.
   *
   * @childControl slider {qx.ui.core.scroll.ScrollSlider} scroll slider component
   * @childControl button-begin {qx.ui.form.RepeatButton} button to scroll to top
   * @childControl button-end {qx.ui.form.RepeatButton} button to scroll to bottom
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var scrollBar = new qx.ui.core.scroll.ScrollBar("horizontal");
   *   scrollBar.set({
   *     maximum: 500
   *   })
   *   this.getRoot().add(scrollBar);
   * </pre>
   *
   * This example creates a horizontal scroll bar with a maximum value of 500.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/scrollbar.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.core.scroll.ScrollBar", {
    extend: qx.ui.core.Widget,
    implement: qx.ui.core.scroll.IScrollBar,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param orientation {String?"horizontal"} The initial scroll bar orientation
     */
    construct: function construct(orientation) {
      qx.ui.core.Widget.constructor.call(this); // Create child controls

      this._createChildControl("button-begin");

      this._createChildControl("slider").addListener("resize", this._onResizeSlider, this);

      this._createChildControl("button-end"); // Configure orientation


      if (orientation != null) {
        this.setOrientation(orientation);
      } else {
        this.initOrientation();
      } // prevent drag & drop on scrolling


      this.addListener("track", function (e) {
        e.stopPropagation();
      }, this);
    },
    events: {
      /** Change event for the value. */
      "scrollAnimationEnd": "qx.event.type.Event"
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
        init: "scrollbar"
      },

      /**
       * The scroll bar orientation
       */
      orientation: {
        check: ["horizontal", "vertical"],
        init: "horizontal",
        apply: "_applyOrientation"
      },

      /**
       * The maximum value (difference between available size and
       * content size).
       */
      maximum: {
        check: "PositiveInteger",
        apply: "_applyMaximum",
        init: 100
      },

      /**
       * Position of the scrollbar (which means the scroll left/top of the
       * attached area's pane)
       *
       * Strictly validates according to {@link #maximum}.
       * Does not apply any correction to the incoming value. If you depend
       * on this, please use {@link #scrollTo} instead.
       */
      position: {
        check: "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getMaximum()",
        init: 0,
        apply: "_applyPosition",
        event: "scroll"
      },

      /**
       * Step size for each tap on the up/down or left/right buttons.
       */
      singleStep: {
        check: "Integer",
        init: 20
      },

      /**
       * The amount to increment on each event. Typically corresponds
       * to the user pressing <code>PageUp</code> or <code>PageDown</code>.
       */
      pageStep: {
        check: "Integer",
        init: 10,
        apply: "_applyPageStep"
      },

      /**
       * Factor to apply to the width/height of the knob in relation
       * to the dimension of the underlying area.
       */
      knobFactor: {
        check: "PositiveNumber",
        apply: "_applyKnobFactor",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __offset: 2,
      __originalMinSize: 0,
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var hint = qx.ui.core.scroll.ScrollBar.prototype._computeSizeHint.base.call(this);

        if (this.getOrientation() === "horizontal") {
          this.__originalMinSize = hint.minWidth;
          hint.minWidth = 0;
        } else {
          this.__originalMinSize = hint.minHeight;
          hint.minHeight = 0;
        }

        return hint;
      },
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        var changes = qx.ui.core.scroll.ScrollBar.prototype.renderLayout.base.call(this, left, top, width, height);
        var horizontal = this.getOrientation() === "horizontal";

        if (this.__originalMinSize >= (horizontal ? width : height)) {
          this.getChildControl("button-begin").setVisibility("hidden");
          this.getChildControl("button-end").setVisibility("hidden");
        } else {
          this.getChildControl("button-begin").setVisibility("visible");
          this.getChildControl("button-end").setVisibility("visible");
        }

        return changes;
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "slider":
            control = new qx.ui.core.scroll.ScrollSlider();
            control.setPageStep(100);
            control.setFocusable(false);
            control.addListener("changeValue", this._onChangeSliderValue, this);
            control.addListener("slideAnimationEnd", this._onSlideAnimationEnd, this);

            this._add(control, {
              flex: 1
            });

            break;

          case "button-begin":
            // Top/Left Button
            control = new qx.ui.form.RepeatButton();
            control.setFocusable(false);
            control.addListener("execute", this._onExecuteBegin, this);

            this._add(control);

            break;

          case "button-end":
            // Bottom/Right Button
            control = new qx.ui.form.RepeatButton();
            control.setFocusable(false);
            control.addListener("execute", this._onExecuteEnd, this);

            this._add(control);

            break;
        }

        return control || qx.ui.core.scroll.ScrollBar.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyMaximum: function _applyMaximum(value) {
        this.getChildControl("slider").setMaximum(value);
      },
      // property apply
      _applyPosition: function _applyPosition(value) {
        this.getChildControl("slider").setValue(value);
      },
      // property apply
      _applyKnobFactor: function _applyKnobFactor(value) {
        this.getChildControl("slider").setKnobFactor(value);
      },
      // property apply
      _applyPageStep: function _applyPageStep(value) {
        this.getChildControl("slider").setPageStep(value);
      },
      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        // Dispose old layout
        var oldLayout = this._getLayout();

        if (oldLayout) {
          oldLayout.dispose();
        } // Reconfigure


        if (value === "horizontal") {
          this._setLayout(new qx.ui.layout.HBox());

          this.setAllowStretchX(true);
          this.setAllowStretchY(false);
          this.replaceState("vertical", "horizontal");
          this.getChildControl("button-begin").replaceState("up", "left");
          this.getChildControl("button-end").replaceState("down", "right");
        } else {
          this._setLayout(new qx.ui.layout.VBox());

          this.setAllowStretchX(false);
          this.setAllowStretchY(true);
          this.replaceState("horizontal", "vertical");
          this.getChildControl("button-begin").replaceState("left", "up");
          this.getChildControl("button-end").replaceState("right", "down");
        } // Sync slider orientation


        this.getChildControl("slider").setOrientation(value);
      },

      /*
      ---------------------------------------------------------------------------
        METHOD REDIRECTION TO SLIDER
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls to the given position.
       *
       * This method automatically corrects the given position to respect
       * the {@link #maximum}.
       *
       * @param position {Integer} Scroll to this position. Must be greater zero.
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      scrollTo: function scrollTo(position, duration) {
        this.getChildControl("slider").slideTo(position, duration);
      },

      /**
       * Scrolls by the given offset.
       *
       * This method automatically corrects the given position to respect
       * the {@link #maximum}.
       *
       * @param offset {Integer} Scroll by this offset
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      scrollBy: function scrollBy(offset, duration) {
        this.getChildControl("slider").slideBy(offset, duration);
      },

      /**
       * Scrolls by the given number of steps.
       *
       * This method automatically corrects the given position to respect
       * the {@link #maximum}.
       *
       * @param steps {Integer} Number of steps
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      scrollBySteps: function scrollBySteps(steps, duration) {
        var size = this.getSingleStep();
        this.getChildControl("slider").slideBy(steps * size, duration);
      },

      /**
       * Updates the position property considering the minimum and maximum values.
       * @param position {Number} The new position.
       */
      updatePosition: function updatePosition(position) {
        this.getChildControl("slider").updatePosition(position);
      },

      /**
       * If a scroll animation is running, it will be stopped.
       */
      stopScrollAnimation: function stopScrollAnimation() {
        this.getChildControl("slider").stopSlideAnimation();
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * Executed when the up/left button is executed (pressed)
       *
       * @param e {qx.event.type.Event} Execute event of the button
       */
      _onExecuteBegin: function _onExecuteBegin(e) {
        this.scrollBy(-this.getSingleStep(), 50);
      },

      /**
       * Executed when the down/right button is executed (pressed)
       *
       * @param e {qx.event.type.Event} Execute event of the button
       */
      _onExecuteEnd: function _onExecuteEnd(e) {
        this.scrollBy(this.getSingleStep(), 50);
      },

      /**
       * Change listener for slider animation end.
       */
      _onSlideAnimationEnd: function _onSlideAnimationEnd() {
        this.fireEvent("scrollAnimationEnd");
      },

      /**
       * Change listener for slider value changes.
       *
       * @param e {qx.event.type.Data} The change event object
       */
      _onChangeSliderValue: function _onChangeSliderValue(e) {
        this.setPosition(e.getData());
      },

      /**
       * Hide the knob of the slider if the slidebar is too small or show it
       * otherwise.
       *
       * @param e {qx.event.type.Data} event object
       */
      _onResizeSlider: function _onResizeSlider(e) {
        var knob = this.getChildControl("slider").getChildControl("knob");
        var knobHint = knob.getSizeHint();
        var hideKnob = false;
        var sliderSize = this.getChildControl("slider").getInnerSize();

        if (this.getOrientation() == "vertical") {
          if (sliderSize.height < knobHint.minHeight + this.__offset) {
            hideKnob = true;
          }
        } else {
          if (sliderSize.width < knobHint.minWidth + this.__offset) {
            hideKnob = true;
          }
        }

        if (hideKnob) {
          knob.exclude();
        } else {
          knob.show();
        }
      }
    }
  });
  qx.ui.core.scroll.ScrollBar.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.Grow": {
        "construct": true
      },
      "qx.bom.AnimationFrame": {}
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
   * This class represents a scroll able pane. This means that this widget
   * may contain content which is bigger than the available (inner)
   * dimensions of this widget. The widget also offer methods to control
   * the scrolling position. It can only have exactly one child.
   */
  qx.Class.define("qx.ui.core.scroll.ScrollPane", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);
      this.set({
        minWidth: 0,
        minHeight: 0
      }); // Automatically configure a "fixed" grow layout.

      this._setLayout(new qx.ui.layout.Grow()); // Add resize listener to "translate" event


      this.addListener("resize", this._onUpdate);
      var contentEl = this.getContentElement(); // Synchronizes the DOM scroll position with the properties

      contentEl.addListener("scroll", this._onScroll, this); // Fixed some browser quirks e.g. correcting scroll position
      // to the previous value on re-display of a pane

      contentEl.addListener("appear", this._onAppear, this);
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired on resize of both the container or the content. */
      update: "qx.event.type.Event",

      /** Fired on scroll animation end invoked by 'scroll*' methods. */
      scrollAnimationEnd: "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The horizontal scroll position */
      scrollX: {
        check: "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getScrollMaxX()",
        apply: "_applyScrollX",
        transform: "_transformScrollX",
        event: "scrollX",
        init: 0
      },

      /** The vertical scroll position */
      scrollY: {
        check: "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getScrollMaxY()",
        apply: "_applyScrollY",
        transform: "_transformScrollY",
        event: "scrollY",
        init: 0
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __frame: null,

      /*
      ---------------------------------------------------------------------------
        CONTENT MANAGEMENT
      ---------------------------------------------------------------------------
      */

      /**
       * Configures the content of the scroll pane. Replaces any existing child
       * with the newly given one.
       *
       * @param widget {qx.ui.core.Widget?null} The content widget of the pane
       */
      add: function add(widget) {
        var old = this._getChildren()[0];

        if (old) {
          this._remove(old);

          old.removeListener("resize", this._onUpdate, this);
        }

        if (widget) {
          this._add(widget);

          widget.addListener("resize", this._onUpdate, this);
        }
      },

      /**
       * Removes the given widget from the content. The pane is empty
       * afterwards as only one child is supported by the pane.
       *
       * @param widget {qx.ui.core.Widget?null} The content widget of the pane
       */
      remove: function remove(widget) {
        if (widget) {
          this._remove(widget);

          widget.removeListener("resize", this._onUpdate, this);
        }
      },

      /**
       * Returns an array containing the current content.
       *
       * @return {Object[]} The content array
       */
      getChildren: function getChildren() {
        return this._getChildren();
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for resize event of content and container
       *
       * @param e {Event} Resize event object
       */
      _onUpdate: function _onUpdate(e) {
        this.fireEvent("update");
      },

      /**
       * Event listener for scroll event of content
       *
       * @param e {qx.event.type.Event} Scroll event object
       */
      _onScroll: function _onScroll(e) {
        var contentEl = this.getContentElement();
        this.setScrollX(contentEl.getScrollX());
        this.setScrollY(contentEl.getScrollY());
      },

      /**
       * Event listener for appear event of content
       *
       * @param e {qx.event.type.Event} Appear event object
       */
      _onAppear: function _onAppear(e) {
        var contentEl = this.getContentElement();
        var internalX = this.getScrollX();
        var domX = contentEl.getScrollX();

        if (internalX != domX) {
          contentEl.scrollToX(internalX);
        }

        var internalY = this.getScrollY();
        var domY = contentEl.getScrollY();

        if (internalY != domY) {
          contentEl.scrollToY(internalY);
        }
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
        var top = 0;

        do {
          top += item.getBounds().top;
          item = item.getLayoutParent();
        } while (item && item !== this);

        return top;
      },

      /**
       * Returns the top offset of the end of the given item in relation to the
       * inner height of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Top offset
       */
      getItemBottom: function getItemBottom(item) {
        return this.getItemTop(item) + item.getBounds().height;
      },

      /**
       * Returns the left offset of the given item in relation to the
       * inner width of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Top offset
       */
      getItemLeft: function getItemLeft(item) {
        var left = 0;
        var parent;

        do {
          left += item.getBounds().left;
          parent = item.getLayoutParent();

          if (parent) {
            left += parent.getInsets().left;
          }

          item = parent;
        } while (item && item !== this);

        return left;
      },

      /**
       * Returns the left offset of the end of the given item in relation to the
       * inner width of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Right offset
       */
      getItemRight: function getItemRight(item) {
        return this.getItemLeft(item) + item.getBounds().width;
      },

      /*
      ---------------------------------------------------------------------------
        DIMENSIONS
      ---------------------------------------------------------------------------
      */

      /**
       * The size (identical with the preferred size) of the content.
       *
       * @return {Map} Size of the content (keys: <code>width</code> and <code>height</code>)
       */
      getScrollSize: function getScrollSize() {
        return this.getChildren()[0].getBounds();
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
        var scrollSize = this.getScrollSize();

        if (paneSize && scrollSize) {
          return Math.max(0, scrollSize.width - paneSize.width);
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
        var scrollSize = this.getScrollSize();

        if (paneSize && scrollSize) {
          return Math.max(0, scrollSize.height - paneSize.height);
        }

        return 0;
      },

      /**
       * Scrolls the element's content to the given left coordinate
       *
       * @param value {Integer} The vertical position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollToX: function scrollToX(value, duration) {
        var max = this.getScrollMaxX();

        if (value < 0) {
          value = 0;
        } else if (value > max) {
          value = max;
        }

        this.stopScrollAnimation();

        if (duration) {
          var from = this.getScrollX();
          this.__frame = new qx.bom.AnimationFrame();

          this.__frame.on("end", function () {
            this.setScrollX(value);
            this.__frame = null;
            this.fireEvent("scrollAnimationEnd");
          }, this);

          this.__frame.on("frame", function (timePassed) {
            var newX = parseInt(timePassed / duration * (value - from) + from);
            this.setScrollX(newX);
          }, this);

          this.__frame.startSequence(duration);
        } else {
          this.setScrollX(value);
        }
      },

      /**
       * Scrolls the element's content to the given top coordinate
       *
       * @param value {Integer} The horizontal position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollToY: function scrollToY(value, duration) {
        var max = this.getScrollMaxY();

        if (value < 0) {
          value = 0;
        } else if (value > max) {
          value = max;
        }

        this.stopScrollAnimation();

        if (duration) {
          var from = this.getScrollY();
          this.__frame = new qx.bom.AnimationFrame();

          this.__frame.on("end", function () {
            this.setScrollY(value);
            this.__frame = null;
            this.fireEvent("scrollAnimationEnd");
          }, this);

          this.__frame.on("frame", function (timePassed) {
            var newY = parseInt(timePassed / duration * (value - from) + from);
            this.setScrollY(newY);
          }, this);

          this.__frame.startSequence(duration);
        } else {
          this.setScrollY(value);
        }
      },

      /**
       * Scrolls the element's content horizontally by the given amount.
       *
       * @param x {Integer?0} Amount to scroll
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollByX: function scrollByX(x, duration) {
        this.scrollToX(this.getScrollX() + x, duration);
      },

      /**
       * Scrolls the element's content vertically by the given amount.
       *
       * @param y {Integer?0} Amount to scroll
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollByY: function scrollByY(y, duration) {
        this.scrollToY(this.getScrollY() + y, duration);
      },

      /**
       * If an scroll animation is running, it will be stopped with that method.
       */
      stopScrollAnimation: function stopScrollAnimation() {
        if (this.__frame) {
          this.__frame.cancelSequence();

          this.__frame = null;
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyScrollX: function _applyScrollX(value) {
        this.getContentElement().scrollToX(value);
      },

      /**
       * Transform property
       *
       * @param value {Number} Value to transform
       * @return {Number} Rounded value
       */
      _transformScrollX: function _transformScrollX(value) {
        return Math.round(value);
      },
      // property apply
      _applyScrollY: function _applyScrollY(value) {
        this.getContentElement().scrollToY(value);
      },

      /**
       * Transform property
       *
       * @param value {Number} Value to transform
       * @return {Number} Rounded value
       */
      _transformScrollY: function _transformScrollY(value) {
        return Math.round(value);
      }
    }
  });
  qx.ui.core.scroll.ScrollPane.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
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
      "qx.lang.Object": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.event.Timer": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Generic selection manager to bring rich desktop like selection behavior
   * to widgets and low-level interactive controls.
   *
   * The selection handling supports both Shift and Ctrl/Meta modifies like
   * known from native applications.
   */
  qx.Class.define("qx.ui.core.selection.Abstract", {
    type: "abstract",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // {Map} Internal selection storage

      this.__selection = {};
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the selection was modified. Contains the selection under the data property. */
      "changeSelection": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Selects the selection mode to use.
       *
       * * single: One or no element is selected
       * * multi: Multi items could be selected. Also allows empty selections.
       * * additive: Easy Web-2.0 selection mode. Allows multiple selections without modifier keys.
       * * one: If possible always exactly one item is selected
       */
      mode: {
        check: ["single", "multi", "additive", "one"],
        init: "single",
        apply: "_applyMode"
      },

      /**
       * Enable drag selection (multi selection of items through
       * dragging the pointer in pressed states).
       *
       * Only possible for the modes <code>multi</code> and <code>additive</code>
       */
      drag: {
        check: "Boolean",
        init: false
      },

      /**
       * Enable quick selection mode, where no tap is needed to change the selection.
       *
       * Only possible for the modes <code>single</code> and <code>one</code>.
       */
      quick: {
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
      __scrollStepX: 0,
      __scrollStepY: 0,
      __scrollTimer: null,
      __frameScroll: null,
      __lastRelX: null,
      __lastRelY: null,
      __frameLocation: null,
      __dragStartX: null,
      __dragStartY: null,
      __inCapture: null,
      __pointerX: null,
      __pointerY: null,
      __moveDirectionX: null,
      __moveDirectionY: null,
      __selectionModified: null,
      __selectionContext: null,
      __leadItem: null,
      __selection: null,
      __anchorItem: null,
      __pointerDownOnSelected: null,
      // A flag that signals an user interaction, which means the selection change
      // was triggered by pointer or keyboard [BUG #3344]
      _userInteraction: false,
      __oldScrollTop: null,

      /*
      ---------------------------------------------------------------------------
        USER APIS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the selection context. One of <code>tap</code>,
       * <code>quick</code>, <code>drag</code> or <code>key</code> or
       * <code>null</code>.
       *
       * @return {String} One of <code>tap</code>, <code>quick</code>,
       *    <code>drag</code> or <code>key</code> or <code>null</code>
       */
      getSelectionContext: function getSelectionContext() {
        return this.__selectionContext;
      },

      /**
       * Selects all items of the managed object.
       *
       */
      selectAll: function selectAll() {
        var mode = this.getMode();

        if (mode == "single" || mode == "one") {
          throw new Error("Can not select all items in selection mode: " + mode);
        }

        this._selectAllItems();

        this._fireChange();
      },

      /**
       * Selects the given item. Replaces current selection
       * completely with the new item.
       *
       * Use {@link #addItem} instead if you want to add new
       * items to an existing selection.
       *
       * @param item {Object} Any valid item
       */
      selectItem: function selectItem(item) {
        this._setSelectedItem(item);

        var mode = this.getMode();

        if (mode !== "single" && mode !== "one") {
          this._setLeadItem(item);

          this._setAnchorItem(item);
        }

        this._scrollItemIntoView(item);

        this._fireChange();
      },

      /**
       * Adds the given item to the existing selection.
       *
       * Use {@link #selectItem} instead if you want to replace
       * the current selection.
       *
       * @param item {Object} Any valid item
       */
      addItem: function addItem(item) {
        var mode = this.getMode();

        if (mode === "single" || mode === "one") {
          this._setSelectedItem(item);
        } else {
          if (this._getAnchorItem() == null) {
            this._setAnchorItem(item);
          }

          this._setLeadItem(item);

          this._addToSelection(item);
        }

        this._scrollItemIntoView(item);

        this._fireChange();
      },

      /**
       * Removes the given item from the selection.
       *
       * Use {@link #clearSelection} when you want to clear
       * the whole selection at once.
       *
       * @param item {Object} Any valid item
       */
      removeItem: function removeItem(item) {
        this._removeFromSelection(item);

        if (this.getMode() === "one" && this.isSelectionEmpty()) {
          var selected = this._applyDefaultSelection(); // Do not fire any event in this case.


          if (selected == item) {
            return;
          }
        }

        if (this.getLeadItem() == item) {
          this._setLeadItem(null);
        }

        if (this._getAnchorItem() == item) {
          this._setAnchorItem(null);
        }

        this._fireChange();
      },

      /**
       * Selects an item range between two given items.
       *
       * @param begin {Object} Item to start with
       * @param end {Object} Item to end at
       */
      selectItemRange: function selectItemRange(begin, end) {
        var mode = this.getMode();

        if (mode == "single" || mode == "one") {
          throw new Error("Can not select multiple items in selection mode: " + mode);
        }

        this._selectItemRange(begin, end);

        this._setAnchorItem(begin);

        this._setLeadItem(end);

        this._scrollItemIntoView(end);

        this._fireChange();
      },

      /**
       * Clears the whole selection at once. Also
       * resets the lead and anchor items and their
       * styles.
       *
       */
      clearSelection: function clearSelection() {
        if (this.getMode() == "one") {
          var selected = this._applyDefaultSelection(true);

          if (selected != null) {
            return;
          }
        }

        this._clearSelection();

        this._setLeadItem(null);

        this._setAnchorItem(null);

        this._fireChange();
      },

      /**
       * Replaces current selection with given array of items.
       *
       * Please note that in single selection scenarios it is more
       * efficient to directly use {@link #selectItem}.
       *
       * @param items {Array} Items to select
       */
      replaceSelection: function replaceSelection(items) {
        var mode = this.getMode();

        if (mode == "one" || mode === "single") {
          if (items.length > 1) {
            throw new Error("Could not select more than one items in mode: " + mode + "!");
          }

          if (items.length == 1) {
            this.selectItem(items[0]);
          } else {
            this.clearSelection();
          }

          return;
        } else {
          this._replaceMultiSelection(items);
        }
      },

      /**
       * Get the selected item. This method does only work in <code>single</code>
       * selection mode.
       *
       * @return {Object} The selected item.
       */
      getSelectedItem: function getSelectedItem() {
        var mode = this.getMode();

        if (mode === "single" || mode === "one") {
          var result = this._getSelectedItem();

          return result != undefined ? result : null;
        }

        throw new Error("The method getSelectedItem() is only supported in 'single' and 'one' selection mode!");
      },

      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {Object[]} List of items.
       */
      getSelection: function getSelection() {
        return Object.values(this.__selection);
      },

      /**
       * Returns the selection sorted by the index in the
       * container of the selection (the assigned widget)
       *
       * @return {Object[]} Sorted list of items
       */
      getSortedSelection: function getSortedSelection() {
        var children = this.getSelectables();
        var sel = Object.values(this.__selection);
        sel.sort(function (a, b) {
          return children.indexOf(a) - children.indexOf(b);
        });
        return sel;
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {var} Any valid selectable item
       * @return {Boolean} Whether the item is selected
       */
      isItemSelected: function isItemSelected(item) {
        var hash = this._selectableToHashCode(item);

        return this.__selection[hash] !== undefined;
      },

      /**
       * Whether the selection is empty
       *
       * @return {Boolean} Whether the selection is empty
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return qx.lang.Object.isEmpty(this.__selection);
      },

      /**
       * Invert the selection. Select the non selected and deselect the selected.
       */
      invertSelection: function invertSelection() {
        var mode = this.getMode();

        if (mode === "single" || mode === "one") {
          throw new Error("The method invertSelection() is only supported in 'multi' and 'additive' selection mode!");
        }

        var selectables = this.getSelectables();

        for (var i = 0; i < selectables.length; i++) {
          this._toggleInSelection(selectables[i]);
        }

        this._fireChange();
      },

      /*
      ---------------------------------------------------------------------------
        LEAD/ANCHOR SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the lead item. Generally the item which was last modified
       * by the user (tapped on etc.)
       *
       * @param value {Object} Any valid item or <code>null</code>
       */
      _setLeadItem: function _setLeadItem(value) {
        var old = this.__leadItem;

        if (old !== null) {
          this._styleSelectable(old, "lead", false);
        }

        if (value !== null) {
          this._styleSelectable(value, "lead", true);
        }

        this.__leadItem = value;
      },

      /**
       * Returns the current lead item. Generally the item which was last modified
       * by the user (tapped on etc.)
       *
       * @return {Object} The lead item or <code>null</code>
       */
      getLeadItem: function getLeadItem() {
        return this.__leadItem;
      },

      /**
       * Sets the anchor item. This is the item which is the starting
       * point for all range selections. Normally this is the item which was
       * tapped on the last time without any modifier keys pressed.
       *
       * @param value {Object} Any valid item or <code>null</code>
       */
      _setAnchorItem: function _setAnchorItem(value) {
        var old = this.__anchorItem;

        if (old != null) {
          this._styleSelectable(old, "anchor", false);
        }

        if (value != null) {
          this._styleSelectable(value, "anchor", true);
        }

        this.__anchorItem = value;
      },

      /**
       * Returns the current anchor item. This is the item which is the starting
       * point for all range selections. Normally this is the item which was
       * tapped on the last time without any modifier keys pressed.
       *
       * @return {Object} The anchor item or <code>null</code>
       */
      _getAnchorItem: function _getAnchorItem() {
        return this.__anchorItem !== null ? this.__anchorItem : null;
      },

      /*
      ---------------------------------------------------------------------------
        BASIC SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Whether the given item is selectable.
       *
       * @param item {var} Any item
       * @return {Boolean} <code>true</code> when the item is selectable
       */
      _isSelectable: function _isSelectable(item) {
        throw new Error("Abstract method call: _isSelectable()");
      },

      /**
       * Finds the selectable instance from a pointer event
       *
       * @param event {qx.event.type.Pointer} The pointer event
       * @return {Object|null} The resulting selectable
       */
      _getSelectableFromPointerEvent: function _getSelectableFromPointerEvent(event) {
        var target = event.getTarget(); // check for target (may be null when leaving the viewport) [BUG #4378]

        if (target && this._isSelectable(target)) {
          return target;
        }

        return null;
      },

      /**
       * Returns an unique hashcode for the given item.
       *
       * @param item {var} Any item
       * @return {String} A valid hashcode
       */
      _selectableToHashCode: function _selectableToHashCode(item) {
        throw new Error("Abstract method call: _selectableToHashCode()");
      },

      /**
       * Updates the style (appearance) of the given item.
       *
       * @param item {var} Item to modify
       * @param type {String} Any of <code>selected</code>, <code>anchor</code> or <code>lead</code>
       * @param enabled {Boolean} Whether the given style should be added or removed.
       */
      _styleSelectable: function _styleSelectable(item, type, enabled) {
        throw new Error("Abstract method call: _styleSelectable()");
      },

      /**
       * Enables capturing of the container.
       *
       */
      _capture: function _capture() {
        throw new Error("Abstract method call: _capture()");
      },

      /**
       * Releases capturing of the container
       *
       */
      _releaseCapture: function _releaseCapture() {
        throw new Error("Abstract method call: _releaseCapture()");
      },

      /*
      ---------------------------------------------------------------------------
        DIMENSION AND LOCATION
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the location of the container
       *
       * @return {Map} Map with the keys <code>top</code>, <code>right</code>,
       *    <code>bottom</code> and <code>left</code>.
       */
      _getLocation: function _getLocation() {
        throw new Error("Abstract method call: _getLocation()");
      },

      /**
       * Returns the dimension of the container (available scrolling space).
       *
       * @return {Map} Map with the keys <code>width</code> and <code>height</code>.
       */
      _getDimension: function _getDimension() {
        throw new Error("Abstract method call: _getDimension()");
      },

      /**
       * Returns the relative (to the container) horizontal location of the given item.
       *
       * @param item {var} Any item
       * @return {Map} A map with the keys <code>left</code> and <code>right</code>.
       */
      _getSelectableLocationX: function _getSelectableLocationX(item) {
        throw new Error("Abstract method call: _getSelectableLocationX()");
      },

      /**
       * Returns the relative (to the container) horizontal location of the given item.
       *
       * @param item {var} Any item
       * @return {Map} A map with the keys <code>top</code> and <code>bottom</code>.
       */
      _getSelectableLocationY: function _getSelectableLocationY(item) {
        throw new Error("Abstract method call: _getSelectableLocationY()");
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the scroll position of the container.
       *
       * @return {Map} Map with the keys <code>left</code> and <code>top</code>.
       */
      _getScroll: function _getScroll() {
        throw new Error("Abstract method call: _getScroll()");
      },

      /**
       * Scrolls by the given offset
       *
       * @param xoff {Integer} Horizontal offset to scroll by
       * @param yoff {Integer} Vertical offset to scroll by
       */
      _scrollBy: function _scrollBy(xoff, yoff) {
        throw new Error("Abstract method call: _scrollBy()");
      },

      /**
       * Scrolls the given item into the view (make it visible)
       *
       * @param item {var} Any item
       */
      _scrollItemIntoView: function _scrollItemIntoView(item) {
        throw new Error("Abstract method call: _scrollItemIntoView()");
      },

      /*
      ---------------------------------------------------------------------------
        QUERY SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns all selectable items of the container.
       *
       * @param all {Boolean} true for all selectables, false for the
        *   selectables the user can interactively select
       * @return {Array} A list of items
       */
      getSelectables: function getSelectables(all) {
        throw new Error("Abstract method call: getSelectables()");
      },

      /**
       * Returns all selectable items between the two given items.
       *
       * The items could be given in any order.
       *
       * @param item1 {var} First item
       * @param item2 {var} Second item
       * @return {Array} List of items
       */
      _getSelectableRange: function _getSelectableRange(item1, item2) {
        throw new Error("Abstract method call: _getSelectableRange()");
      },

      /**
       * Returns the first selectable item.
       *
       * @return {var} The first selectable item
       */
      _getFirstSelectable: function _getFirstSelectable() {
        throw new Error("Abstract method call: _getFirstSelectable()");
      },

      /**
       * Returns the last selectable item.
       *
       * @return {var} The last selectable item
       */
      _getLastSelectable: function _getLastSelectable() {
        throw new Error("Abstract method call: _getLastSelectable()");
      },

      /**
       * Returns a selectable item which is related to the given
       * <code>item</code> through the value of <code>relation</code>.
       *
       * @param item {var} Any item
       * @param relation {String} A valid relation: <code>above</code>,
       *    <code>right</code>, <code>under</code> or <code>left</code>
       * @return {var} The related item
       */
      _getRelatedSelectable: function _getRelatedSelectable(item, relation) {
        throw new Error("Abstract method call: _getRelatedSelectable()");
      },

      /**
       * Returns the item which should be selected on pageUp/pageDown.
       *
       * May also scroll to the needed position.
       *
       * @param lead {var} The current lead item
       * @param up {Boolean?false} Which page key was pressed:
       *   <code>up</code> or <code>down</code>.
       */
      _getPage: function _getPage(lead, up) {
        throw new Error("Abstract method call: _getPage()");
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyMode: function _applyMode(value, old) {
        this._setLeadItem(null);

        this._setAnchorItem(null);

        this._clearSelection(); // Mode "one" requires one selected item


        if (value === "one") {
          this._applyDefaultSelection(true);
        }

        this._fireChange();
      },

      /*
      ---------------------------------------------------------------------------
        POINTER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * This method should be connected to the <code>pointerover</code> event
       * of the managed object.
       *
       * @param event {qx.event.type.Pointer} A valid pointer event
       */
      handlePointerOver: function handlePointerOver(event) {
        // All browsers (except Opera) fire a native "mouseover" event when a scroll appears
        // by keyboard interaction. We have to ignore the event to avoid a selection for
        // "pointerover" (quick selection). For more details see [BUG #4225]
        if (this.__oldScrollTop != null && this.__oldScrollTop != this._getScroll().top) {
          this.__oldScrollTop = null;
          return;
        } // quick select should only work on mouse events


        if (event.getPointerType() != "mouse") {
          return;
        } // this is a method invoked by an user interaction, so be careful to
        // set / clear the mark this._userInteraction [BUG #3344]


        this._userInteraction = true;

        if (!this.getQuick()) {
          this._userInteraction = false;
          return;
        }

        var mode = this.getMode();

        if (mode !== "one" && mode !== "single") {
          this._userInteraction = false;
          return;
        }

        var item = this._getSelectableFromPointerEvent(event);

        if (item === null) {
          this._userInteraction = false;
          return;
        }

        this._setSelectedItem(item); // Be sure that item is in view
        // This does not feel good when pointerover is used
        // this._scrollItemIntoView(item);
        // Fire change event as needed


        this._fireChange("quick");

        this._userInteraction = false;
      },

      /**
       * This method should be connected to the <code>pointerdown</code> event
       * of the managed object.
       *
       * @param event {qx.event.type.Pointer} A valid pointer event
       */
      handlePointerDown: function handlePointerDown(event) {
        // this is a method invoked by an user interaction, so be careful to
        // set / clear the mark this._userInteraction [BUG #3344]
        this._userInteraction = true;

        var item = this._getSelectableFromPointerEvent(event);

        if (item === null) {
          this._userInteraction = false;
          return;
        } // Read in keyboard modifiers


        var isCtrlPressed = event.isCtrlPressed() || qx.core.Environment.get("os.name") == "osx" && event.isMetaPressed();
        var isShiftPressed = event.isShiftPressed(); // tapping on selected items deselect on pointerup, not on pointerdown

        if (this.isItemSelected(item) && !isShiftPressed && !isCtrlPressed && !this.getDrag()) {
          this.__pointerDownOnSelected = item;
          this._userInteraction = false;
          return;
        } else {
          this.__pointerDownOnSelected = null;
        } // Be sure that item is in view


        this._scrollItemIntoView(item); // Drag selection


        var mode = this.getMode();

        if (this.getDrag() && mode !== "single" && mode !== "one" && !isShiftPressed && !isCtrlPressed && event.getPointerType() == "mouse") {
          this._setAnchorItem(item);

          this._setLeadItem(item); // Cache location/scroll data


          this.__frameLocation = this._getLocation();
          this.__frameScroll = this._getScroll(); // Store position at start

          this.__dragStartX = event.getDocumentLeft() + this.__frameScroll.left;
          this.__dragStartY = event.getDocumentTop() + this.__frameScroll.top; // Switch to capture mode

          this.__inCapture = true;

          this._capture();
        } // Fire change event as needed


        this._fireChange("tap");

        this._userInteraction = false;
      },

      /**
       * This method should be connected to the <code>tap</code> event
       * of the managed object.
       *
       * @param event {qx.event.type.Tap} A valid pointer event
       */
      handleTap: function handleTap(event) {
        // this is a method invoked by an user interaction, so be careful to
        // set / clear the mark this._userInteraction [BUG #3344]
        this._userInteraction = true; // Read in keyboard modifiers

        var isCtrlPressed = event.isCtrlPressed() || qx.core.Environment.get("os.name") == "osx" && event.isMetaPressed();
        var isShiftPressed = event.isShiftPressed();

        if (!isCtrlPressed && !isShiftPressed && this.__pointerDownOnSelected != null) {
          this._userInteraction = false;

          var item = this._getSelectableFromPointerEvent(event);

          if (item === null || !this.isItemSelected(item)) {
            return;
          }
        }

        var item = this._getSelectableFromPointerEvent(event);

        if (item === null) {
          this._userInteraction = false;
          return;
        } // Action depends on selected mode


        switch (this.getMode()) {
          case "single":
          case "one":
            this._setSelectedItem(item);

            break;

          case "additive":
            this._setLeadItem(item);

            this._setAnchorItem(item);

            this._toggleInSelection(item);

            break;

          case "multi":
            // Update lead item
            this._setLeadItem(item); // Create/Update range selection


            if (isShiftPressed) {
              var anchor = this._getAnchorItem();

              if (anchor === null) {
                anchor = this._getFirstSelectable();

                this._setAnchorItem(anchor);
              }

              this._selectItemRange(anchor, item, isCtrlPressed);
            } // Toggle in selection
            else if (isCtrlPressed) {
                this._setAnchorItem(item);

                this._toggleInSelection(item);
              } // Replace current selection
              else {
                  this._setAnchorItem(item);

                  this._setSelectedItem(item);
                }

            break;
        } // Cleanup operation


        this._cleanup();
      },

      /**
       * This method should be connected to the <code>losecapture</code> event
       * of the managed object.
       *
       * @param event {qx.event.type.Pointer} A valid pointer event
       */
      handleLoseCapture: function handleLoseCapture(event) {
        this._cleanup();
      },

      /**
       * This method should be connected to the <code>pointermove</code> event
       * of the managed object.
       *
       * @param event {qx.event.type.Pointer} A valid pointer event
       */
      handlePointerMove: function handlePointerMove(event) {
        // Only relevant when capturing is enabled
        if (!this.__inCapture) {
          return;
        } // Update pointer position cache


        this.__pointerX = event.getDocumentLeft();
        this.__pointerY = event.getDocumentTop(); // this is a method invoked by an user interaction, so be careful to
        // set / clear the mark this._userInteraction [BUG #3344]

        this._userInteraction = true; // Detect move directions

        var dragX = this.__pointerX + this.__frameScroll.left;

        if (dragX > this.__dragStartX) {
          this.__moveDirectionX = 1;
        } else if (dragX < this.__dragStartX) {
          this.__moveDirectionX = -1;
        } else {
          this.__moveDirectionX = 0;
        }

        var dragY = this.__pointerY + this.__frameScroll.top;

        if (dragY > this.__dragStartY) {
          this.__moveDirectionY = 1;
        } else if (dragY < this.__dragStartY) {
          this.__moveDirectionY = -1;
        } else {
          this.__moveDirectionY = 0;
        } // Update scroll steps


        var location = this.__frameLocation;

        if (this.__pointerX < location.left) {
          this.__scrollStepX = this.__pointerX - location.left;
        } else if (this.__pointerX > location.right) {
          this.__scrollStepX = this.__pointerX - location.right;
        } else {
          this.__scrollStepX = 0;
        }

        if (this.__pointerY < location.top) {
          this.__scrollStepY = this.__pointerY - location.top;
        } else if (this.__pointerY > location.bottom) {
          this.__scrollStepY = this.__pointerY - location.bottom;
        } else {
          this.__scrollStepY = 0;
        } // Dynamically create required timer instance


        if (!this.__scrollTimer) {
          this.__scrollTimer = new qx.event.Timer(100);

          this.__scrollTimer.addListener("interval", this._onInterval, this);
        } // Start interval


        this.__scrollTimer.start(); // Auto select based on new cursor position


        this._autoSelect();

        event.stopPropagation();
        this._userInteraction = false;
      },

      /**
       * This method should be connected to the <code>addItem</code> event
       * of the managed object.
       *
       * @param e {qx.event.type.Data} The event object
       */
      handleAddItem: function handleAddItem(e) {
        var item = e.getData();

        if (this.getMode() === "one" && this.isSelectionEmpty()) {
          this.addItem(item);
        }
      },

      /**
       * This method should be connected to the <code>removeItem</code> event
       * of the managed object.
       *
       * @param e {qx.event.type.Data} The event object
       */
      handleRemoveItem: function handleRemoveItem(e) {
        this.removeItem(e.getData());
      },

      /*
      ---------------------------------------------------------------------------
        POINTER SUPPORT INTERNALS
      ---------------------------------------------------------------------------
      */

      /**
       * Stops all timers, release capture etc. to cleanup drag selection
       */
      _cleanup: function _cleanup() {
        if (!this.getDrag() && this.__inCapture) {
          return;
        } // Fire change event if needed


        if (this.__selectionModified) {
          this._fireChange("tap");
        } // Remove flags


        delete this.__inCapture;
        delete this.__lastRelX;
        delete this.__lastRelY; // Stop capturing

        this._releaseCapture(); // Stop timer


        if (this.__scrollTimer) {
          this.__scrollTimer.stop();
        }
      },

      /**
       * Event listener for timer used by drag selection
       *
       * @param e {qx.event.type.Event} Timer event
       */
      _onInterval: function _onInterval(e) {
        // Scroll by defined block size
        this._scrollBy(this.__scrollStepX, this.__scrollStepY); // Update scroll cache


        this.__frameScroll = this._getScroll(); // Auto select based on new scroll position and cursor

        this._autoSelect();
      },

      /**
       * Automatically selects items based on the pointer movement during a drag selection
       */
      _autoSelect: function _autoSelect() {
        var inner = this._getDimension(); // Get current relative Y position and compare it with previous one


        var relX = Math.max(0, Math.min(this.__pointerX - this.__frameLocation.left, inner.width)) + this.__frameScroll.left;

        var relY = Math.max(0, Math.min(this.__pointerY - this.__frameLocation.top, inner.height)) + this.__frameScroll.top; // Compare old and new relative coordinates (for performance reasons)


        if (this.__lastRelX === relX && this.__lastRelY === relY) {
          return;
        }

        this.__lastRelX = relX;
        this.__lastRelY = relY; // Cache anchor

        var anchor = this._getAnchorItem();

        var lead = anchor; // Process X-coordinate

        var moveX = this.__moveDirectionX;
        var nextX, locationX;

        while (moveX !== 0) {
          // Find next item to process depending on current scroll direction
          nextX = moveX > 0 ? this._getRelatedSelectable(lead, "right") : this._getRelatedSelectable(lead, "left"); // May be null (e.g. first/last item)

          if (nextX !== null) {
            locationX = this._getSelectableLocationX(nextX); // Continue when the item is in the visible area

            if (moveX > 0 && locationX.left <= relX || moveX < 0 && locationX.right >= relX) {
              lead = nextX;
              continue;
            }
          } // Otherwise break


          break;
        } // Process Y-coordinate


        var moveY = this.__moveDirectionY;
        var nextY, locationY;

        while (moveY !== 0) {
          // Find next item to process depending on current scroll direction
          nextY = moveY > 0 ? this._getRelatedSelectable(lead, "under") : this._getRelatedSelectable(lead, "above"); // May be null (e.g. first/last item)

          if (nextY !== null) {
            locationY = this._getSelectableLocationY(nextY); // Continue when the item is in the visible area

            if (moveY > 0 && locationY.top <= relY || moveY < 0 && locationY.bottom >= relY) {
              lead = nextY;
              continue;
            }
          } // Otherwise break


          break;
        } // Differenciate between the two supported modes


        var mode = this.getMode();

        if (mode === "multi") {
          // Replace current selection with new range
          this._selectItemRange(anchor, lead);
        } else if (mode === "additive") {
          // Behavior depends on the fact whether the
          // anchor item is selected or not
          if (this.isItemSelected(anchor)) {
            this._selectItemRange(anchor, lead, true);
          } else {
            this._deselectItemRange(anchor, lead);
          } // Improve performance. This mode does not rely
          // on full ranges as it always extend the old
          // selection/deselection.


          this._setAnchorItem(lead);
        } // Fire change event as needed


        this._fireChange("drag");
      },

      /*
      ---------------------------------------------------------------------------
        KEYBOARD SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} All supported navigation keys
       *
       * @lint ignoreReferenceField(__navigationKeys)
       */
      __navigationKeys: {
        Home: 1,
        Down: 1,
        Right: 1,
        PageDown: 1,
        End: 1,
        Up: 1,
        Left: 1,
        PageUp: 1
      },

      /**
       * This method should be connected to the <code>keypress</code> event
       * of the managed object.
       *
       * @param event {qx.event.type.KeySequence} A valid key sequence event
       */
      handleKeyPress: function handleKeyPress(event) {
        // this is a method invoked by an user interaction, so be careful to
        // set / clear the mark this._userInteraction [BUG #3344]
        this._userInteraction = true;
        var current, next;
        var key = event.getKeyIdentifier();
        var mode = this.getMode(); // Support both control keys on Mac

        var isCtrlPressed = event.isCtrlPressed() || qx.core.Environment.get("os.name") == "osx" && event.isMetaPressed();
        var isShiftPressed = event.isShiftPressed();
        var consumed = false;

        if (key === "A" && isCtrlPressed) {
          if (mode !== "single" && mode !== "one") {
            this._selectAllItems();

            consumed = true;
          }
        } else if (key === "Escape") {
          if (mode !== "single" && mode !== "one") {
            this._clearSelection();

            consumed = true;
          }
        } else if (key === "Space") {
          var lead = this.getLeadItem();

          if (lead != null && !isShiftPressed) {
            if (isCtrlPressed || mode === "additive") {
              this._toggleInSelection(lead);
            } else {
              this._setSelectedItem(lead);
            }

            consumed = true;
          }
        } else if (this.__navigationKeys[key]) {
          consumed = true;

          if (mode === "single" || mode == "one") {
            current = this._getSelectedItem();
          } else {
            current = this.getLeadItem();
          }

          if (current !== null) {
            switch (key) {
              case "Home":
                next = this._getFirstSelectable();
                break;

              case "End":
                next = this._getLastSelectable();
                break;

              case "Up":
                next = this._getRelatedSelectable(current, "above");
                break;

              case "Down":
                next = this._getRelatedSelectable(current, "under");
                break;

              case "Left":
                next = this._getRelatedSelectable(current, "left");
                break;

              case "Right":
                next = this._getRelatedSelectable(current, "right");
                break;

              case "PageUp":
                next = this._getPage(current, true);
                break;

              case "PageDown":
                next = this._getPage(current, false);
                break;
            }
          } else {
            switch (key) {
              case "Home":
              case "Down":
              case "Right":
              case "PageDown":
                next = this._getFirstSelectable();
                break;

              case "End":
              case "Up":
              case "Left":
              case "PageUp":
                next = this._getLastSelectable();
                break;
            }
          } // Process result


          if (next !== null) {
            switch (mode) {
              case "single":
              case "one":
                this._setSelectedItem(next);

                break;

              case "additive":
                this._setLeadItem(next);

                break;

              case "multi":
                if (isShiftPressed) {
                  var anchor = this._getAnchorItem();

                  if (anchor === null) {
                    this._setAnchorItem(anchor = this._getFirstSelectable());
                  }

                  this._setLeadItem(next);

                  this._selectItemRange(anchor, next, isCtrlPressed);
                } else {
                  this._setAnchorItem(next);

                  this._setLeadItem(next);

                  if (!isCtrlPressed) {
                    this._setSelectedItem(next);
                  }
                }

                break;
            }

            this.__oldScrollTop = this._getScroll().top;

            this._scrollItemIntoView(next);
          }
        }

        if (consumed) {
          // Stop processed events
          event.stop(); // Fire change event as needed

          this._fireChange("key");
        }

        this._userInteraction = false;
      },

      /*
      ---------------------------------------------------------------------------
        SUPPORT FOR ITEM RANGES
      ---------------------------------------------------------------------------
      */

      /**
       * Adds all items to the selection
       */
      _selectAllItems: function _selectAllItems() {
        var range = this.getSelectables();

        for (var i = 0, l = range.length; i < l; i++) {
          this._addToSelection(range[i]);
        }
      },

      /**
       * Clears current selection
       */
      _clearSelection: function _clearSelection() {
        var selection = this.__selection;

        for (var hash in selection) {
          this._removeFromSelection(selection[hash]);
        }

        this.__selection = {};
      },

      /**
       * Select a range from <code>item1</code> to <code>item2</code>.
       *
       * @param item1 {Object} Start with this item
       * @param item2 {Object} End with this item
       * @param extend {Boolean?false} Whether the current
       *    selection should be replaced or extended.
       */
      _selectItemRange: function _selectItemRange(item1, item2, extend) {
        var range = this._getSelectableRange(item1, item2); // Remove items which are not in the detected range


        if (!extend) {
          var selected = this.__selection;

          var mapped = this.__rangeToMap(range);

          for (var hash in selected) {
            if (!mapped[hash]) {
              this._removeFromSelection(selected[hash]);
            }
          }
        } // Add new items to the selection


        for (var i = 0, l = range.length; i < l; i++) {
          this._addToSelection(range[i]);
        }
      },

      /**
       * Deselect all items between <code>item1</code> and <code>item2</code>.
       *
       * @param item1 {Object} Start with this item
       * @param item2 {Object} End with this item
       */
      _deselectItemRange: function _deselectItemRange(item1, item2) {
        var range = this._getSelectableRange(item1, item2);

        for (var i = 0, l = range.length; i < l; i++) {
          this._removeFromSelection(range[i]);
        }
      },

      /**
       * Internal method to convert a range to a map of hash
       * codes for faster lookup during selection compare routines.
       *
       * @param range {Array} List of selectable items
       */
      __rangeToMap: function __rangeToMap(range) {
        var mapped = {};
        var item;

        for (var i = 0, l = range.length; i < l; i++) {
          item = range[i];
          mapped[this._selectableToHashCode(item)] = item;
        }

        return mapped;
      },

      /*
      ---------------------------------------------------------------------------
        SINGLE ITEM QUERY AND MODIFICATION
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the first selected item. Only makes sense
       * when using manager in single selection mode.
       *
       * @return {var} The selected item (or <code>null</code>)
       */
      _getSelectedItem: function _getSelectedItem() {
        for (var hash in this.__selection) {
          return this.__selection[hash];
        }

        return null;
      },

      /**
       * Replace current selection with given item.
       *
       * @param item {var} Any valid selectable item
       */
      _setSelectedItem: function _setSelectedItem(item) {
        if (this._isSelectable(item)) {
          // If already selected try to find out if this is the only item
          var current = this.__selection;

          var hash = this._selectableToHashCode(item);

          if (!current[hash] || current.length >= 2) {
            this._clearSelection();

            this._addToSelection(item);
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        MODIFY ITEM SELECTION
      ---------------------------------------------------------------------------
      */

      /**
       * Adds an item to the current selection.
       *
       * @param item {Object} Any item
       */
      _addToSelection: function _addToSelection(item) {
        var hash = this._selectableToHashCode(item);

        if (this.__selection[hash] == null && this._isSelectable(item)) {
          this.__selection[hash] = item;

          this._styleSelectable(item, "selected", true);

          this.__selectionModified = true;
        }
      },

      /**
       * Toggles the item e.g. remove it when already selected
       * or select it when currently not.
       *
       * @param item {Object} Any item
       */
      _toggleInSelection: function _toggleInSelection(item) {
        var hash = this._selectableToHashCode(item);

        if (this.__selection[hash] == null) {
          this.__selection[hash] = item;

          this._styleSelectable(item, "selected", true);
        } else {
          delete this.__selection[hash];

          this._styleSelectable(item, "selected", false);
        }

        this.__selectionModified = true;
      },

      /**
       * Removes the given item from the current selection.
       *
       * @param item {Object} Any item
       */
      _removeFromSelection: function _removeFromSelection(item) {
        var hash = this._selectableToHashCode(item);

        if (this.__selection[hash] != null) {
          delete this.__selection[hash];

          this._styleSelectable(item, "selected", false);

          this.__selectionModified = true;
        }
      },

      /**
       * Replaces current selection with items from given array.
       *
       * @param items {Array} List of items to select
       */
      _replaceMultiSelection: function _replaceMultiSelection(items) {
        if (items.length === 0) {
          this.clearSelection();
          return;
        }

        var modified = false; // Build map from hash codes and filter non-selectables

        var selectable, hash;
        var incoming = {};

        for (var i = 0, l = items.length; i < l; i++) {
          selectable = items[i];

          if (this._isSelectable(selectable)) {
            hash = this._selectableToHashCode(selectable);
            incoming[hash] = selectable;
          }
        } // Remember last


        var first = items[0];
        var last = selectable; // Clear old entries from map

        var current = this.__selection;

        for (var hash in current) {
          if (incoming[hash]) {
            // Reduce map to make next loop faster
            delete incoming[hash];
          } else {
            // update internal map
            selectable = current[hash];
            delete current[hash]; // apply styling

            this._styleSelectable(selectable, "selected", false); // remember that the selection has been modified


            modified = true;
          }
        } // Add remaining selectables to selection


        for (var hash in incoming) {
          // update internal map
          selectable = current[hash] = incoming[hash]; // apply styling

          this._styleSelectable(selectable, "selected", true); // remember that the selection has been modified


          modified = true;
        } // Do not do anything if selection is equal to previous one


        if (!modified) {
          return false;
        } // Scroll last incoming item into view


        this._scrollItemIntoView(last); // Reset anchor and lead item


        this._setLeadItem(first);

        this._setAnchorItem(first); // Finally fire change event


        this.__selectionModified = true;

        this._fireChange();
      },

      /**
       * Fires the selection change event if the selection has
       * been modified.
       *
       * @param context {String} One of <code>tap</code>, <code>quick</code>,
       *    <code>drag</code> or <code>key</code> or <code>null</code>
       */
      _fireChange: function _fireChange(context) {
        if (this.__selectionModified) {
          // Store context
          this.__selectionContext = context || null; // Fire data event which contains the current selection

          this.fireDataEvent("changeSelection", this.getSelection());
          delete this.__selectionModified;
        }
      },

      /**
       * Applies the default selection. The default item is the first item.
       *
       * @param force {Boolean} Whether the default selection should be forced.
       *
       * @return {var} The selected item.
       */
      _applyDefaultSelection: function _applyDefaultSelection(force) {
        if (force === true || this.getMode() === "one" && this.isSelectionEmpty()) {
          var first = this._getFirstSelectable();

          if (first != null) {
            this.selectItem(first);
          }

          return first;
        }

        return null;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__scrollTimer");

      this.__selection = this.__pointerDownOnSelected = this.__anchorItem = null;
      this.__leadItem = null;
    }
  });
  qx.ui.core.selection.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.selection.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.ui.virtual.core.Pane": {
        "construct": true
      },
      "qx.bom.element.Location": {}
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
   * Abstract base class for selection manager, which manage selectable items
   * rendered in a virtual {@link qx.ui.virtual.core.Pane}.
   */
  qx.Class.define("qx.ui.virtual.selection.Abstract", {
    extend: qx.ui.core.selection.Abstract,

    /*
     *****************************************************************************
        CONSTRUCTOR
     *****************************************************************************
     */

    /**
     * @param pane {qx.ui.virtual.core.Pane} The virtual pane on which the
     *    selectable item are rendered
     * @param selectionDelegate {qx.ui.virtual.selection.ISelectionDelegate?null} An optional delegate,
     *    which can be used to customize the behavior of the selection manager
     *    without sub classing it.
     */
    construct: function construct(pane, selectionDelegate) {
      qx.ui.core.selection.Abstract.constructor.call(this);
      {
        this.assertInstance(pane, qx.ui.virtual.core.Pane);
      }
      this._pane = pane;
      this._delegate = selectionDelegate || {};
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // Determines if automatically scrolling of selected item into view is active.
      _autoScrollIntoView: true,

      /*
      ---------------------------------------------------------------------------
        DELEGATE METHODS
      ---------------------------------------------------------------------------
      */
      // overridden
      _isSelectable: function _isSelectable(item) {
        return this._delegate.isItemSelectable ? this._delegate.isItemSelectable(item) : true;
      },
      // overridden
      _styleSelectable: function _styleSelectable(item, type, enabled) {
        if (this._delegate.styleSelectable) {
          this._delegate.styleSelectable(item, type, enabled);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Attach pointer events to the managed pane.
       */
      attachPointerEvents: function attachPointerEvents() {
        var paneElement = this._pane.getContentElement();

        paneElement.addListener("pointerdown", this.handlePointerDown, this);
        paneElement.addListener("tap", this.handleTap, this);
        paneElement.addListener("pointerover", this.handlePointerOver, this);
        paneElement.addListener("pointermove", this.handlePointerMove, this);
        paneElement.addListener("losecapture", this.handleLoseCapture, this);
      },

      /**
       * Detach pointer events from the managed pane.
       */
      detatchPointerEvents: function detatchPointerEvents() {
        var paneElement = this._pane.getContentElement();

        paneElement.removeListener("pointerdown", this.handlePointerDown, this);
        paneElement.removeListener("tap", this.handleTap, this);
        paneElement.removeListener("pointerover", this.handlePointerOver, this);
        paneElement.removeListener("pointermove", this.handlePointerMove, this);
        paneElement.removeListener("losecapture", this.handleLoseCapture, this);
      },

      /**
       * Attach key events to manipulate the selection using the keyboard. The
       * event target doesn't need to be the pane itself. It can be an widget,
       * which received key events. Usually the key event target is the
       * {@link qx.ui.virtual.core.Scroller}.
       *
       * @param target {qx.core.Object} the key event target.
       *
       */
      attachKeyEvents: function attachKeyEvents(target) {
        target.addListener("keypress", this.handleKeyPress, this);
      },

      /**
       * Detach key events.
       *
       * @param target {qx.core.Object} the key event target.
       */
      detachKeyEvents: function detachKeyEvents(target) {
        target.removeListener("keypress", this.handleKeyPress, this);
      },

      /**
       * Attach list events. The selection mode <code>one</code> need to know,
       * when selectable items are added or removed. If this mode is used the
       * <code>list</code> parameter must fire <code>addItem</code> and
       * <code>removeItem</code> events.
       *
       * @param list {qx.core.Object} the event target for <code>addItem</code> and
       *    <code>removeItem</code> events
       */
      attachListEvents: function attachListEvents(list) {
        list.addListener("addItem", this.handleAddItem, this);
        list.addListener("removeItem", this.handleRemoveItem, this);
      },

      /**
       * Detach list events.
       *
       * @param list {qx.core.Object} the event target for <code>addItem</code> and
       *    <code>removeItem</code> events
       */
      detachListEvents: function detachListEvents(list) {
        list.removeListener("addItem", this.handleAddItem, this);
        list.removeListener("removeItem", this.handleRemoveItem, this);
      },

      /*
      ---------------------------------------------------------------------------
        IMPLEMENT ABSTRACT METHODS
      ---------------------------------------------------------------------------
      */
      // overridden
      _capture: function _capture() {
        this._pane.capture();
      },
      // overridden
      _releaseCapture: function _releaseCapture() {
        this._pane.releaseCapture();
      },
      // overridden
      _getScroll: function _getScroll() {
        return {
          left: this._pane.getScrollX(),
          top: this._pane.getScrollY()
        };
      },
      // overridden
      _scrollBy: function _scrollBy(xoff, yoff) {
        this._pane.setScrollX(this._pane.getScrollX() + xoff);

        this._pane.setScrollY(this._pane.getScrollY() + yoff);
      },
      // overridden
      _getLocation: function _getLocation() {
        var elem = this._pane.getContentElement().getDomElement();

        return elem ? qx.bom.element.Location.get(elem) : null;
      },
      // overridden
      _getDimension: function _getDimension() {
        return this._pane.getInnerSize();
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this._pane = this._delegate = null;
    }
  });
  qx.ui.virtual.selection.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.selection.Abstract": {
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
       * Fabian Jakobs (fjakobs)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * Row selection manager
   */
  qx.Class.define("qx.ui.virtual.selection.Row", {
    extend: qx.ui.virtual.selection.Abstract,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns the number of all items in the pane. This number may contain
       * unselectable items as well.
       *
       * @return {Integer} number of items
       */
      _getItemCount: function _getItemCount() {
        return this._pane.getRowConfig().getItemCount();
      },

      /*
      ---------------------------------------------------------------------------
        IMPLEMENT ABSTRACT METHODS
      ---------------------------------------------------------------------------
      */
      // overridden
      _getSelectableFromPointerEvent: function _getSelectableFromPointerEvent(event) {
        var cell = this._pane.getCellAtPosition(event.getDocumentLeft(), event.getDocumentTop());

        if (!cell) {
          return null;
        }

        return this._isSelectable(cell.row) ? cell.row : null;
      },
      // overridden
      getSelectables: function getSelectables(all) {
        var selectables = [];

        for (var i = 0, l = this._getItemCount(); i < l; i++) {
          if (this._isSelectable(i)) {
            selectables.push(i);
          }
        }

        return selectables;
      },
      // overridden
      _getSelectableRange: function _getSelectableRange(item1, item2) {
        var selectables = [];
        var min = Math.min(item1, item2);
        var max = Math.max(item1, item2);

        for (var i = min; i <= max; i++) {
          if (this._isSelectable(i)) {
            selectables.push(i);
          }
        }

        return selectables;
      },
      // overridden
      _getFirstSelectable: function _getFirstSelectable() {
        var count = this._getItemCount();

        for (var i = 0; i < count; i++) {
          if (this._isSelectable(i)) {
            return i;
          }
        }

        return null;
      },
      // overridden
      _getLastSelectable: function _getLastSelectable() {
        var count = this._getItemCount();

        for (var i = count - 1; i >= 0; i--) {
          if (this._isSelectable(i)) {
            return i;
          }
        }

        return null;
      },
      // overridden
      _getRelatedSelectable: function _getRelatedSelectable(item, relation) {
        if (relation == "above") {
          var startIndex = item - 1;
          var endIndex = 0;
          var increment = -1;
        } else if (relation == "under") {
          var startIndex = item + 1;
          var endIndex = this._getItemCount() - 1;
          var increment = 1;
        } else {
          return null;
        }

        for (var i = startIndex; i !== endIndex + increment; i += increment) {
          if (this._isSelectable(i)) {
            return i;
          }
        }

        return null;
      },
      // overridden
      _getPage: function _getPage(lead, up) {
        if (up) {
          return this._getFirstSelectable();
        } else {
          return this._getLastSelectable();
        }
      },
      // overridden
      _selectableToHashCode: function _selectableToHashCode(item) {
        return item;
      },
      // overridden
      _scrollItemIntoView: function _scrollItemIntoView(item) {
        if (this._autoScrollIntoView) {
          this._pane.scrollRowIntoView(item);
        }
      },
      // overridden
      _getSelectableLocationX: function _getSelectableLocationX(item) {
        return {
          left: 0,
          right: this._pane.getColumnConfig().getTotalSize() - 1
        };
      },
      // overridden
      _getSelectableLocationY: function _getSelectableLocationY(item) {
        var rowConfig = this._pane.getRowConfig();

        var itemTop = rowConfig.getItemPosition(item);
        var itemBottom = itemTop + rowConfig.getItemSize(item) - 1;
        return {
          top: itemTop,
          bottom: itemBottom
        };
      }
    }
  });
  qx.ui.virtual.selection.Row.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "construct": true,
        "require": true
      },
      "qx.core.Object": {
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
       2017 Cajus Pollmeier
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Cajus Pollmeier
       * Derrell Lipman
  
  ************************************************************************ */

  /**
   * Because of the virtual nature of the VirtualTree, and the fact that
   * rendering occurs asynchronously, it is not a simple matter to bind a
   * property in the model that will open or close branches in the
   * tree. Instead, this controller listens to both the model and the tree, and
   * synchronizes the openness of branches in the tree.
   * 
   * To use this controller, simply instantiate it with the requisite
   * constructor arguments.
   */
  qx.Class.define("qx.ui.tree.core.OpenCloseController", {
    extend: qx.core.Object,

    /**
     * @param tree {qx.ui.tree.VirtualTree}
     *   The tree whose branch open or closed state is to be synchronized to a
     *   model property.
     * 
     * @param rootModel {qx.data.Array}
     *   The tree root model wherein a property is to be synchronized to the
     *   tree branches' open or closed states
     */
    construct: function construct(tree, rootModel) {
      var openProperty = tree.getOpenProperty();
      qx.core.Object.constructor.call(this); // Save the tree and initialize storage of listener IDs

      this._tree = tree;
      this._lids = []; // Sync tree nodes

      var sync = function (node) {
        if (qx.Class.hasProperty(node.constructor, "children")) {
          node.getChildren().forEach(sync);
        }

        if (qx.Class.hasProperty(node.constructor, openProperty)) {
          if (node.get(openProperty)) {
            tree.openNode(node);
          } else {
            tree.closeNode(node);
          }
        }
      }.bind(this);

      sync(rootModel); // Wire change listeners

      var lid = tree.addListener("open", this._onOpen, this);

      this._lids.push([tree, lid]);

      lid = tree.addListener("close", this._onClose, this);

      this._lids.push([tree, lid]);

      lid = rootModel.addListener("changeBubble", this._onChangeBubble, this);

      this._lids.push([rootModel, lid]);
    },
    members: {
      /** The tree which is synced to the model */
      _tree: null,

      /** Listener IDs that we manage */
      _lids: null,
      // event listener for "open" on the tree
      _onOpen: function _onOpen(ev) {
        ev.getData().set(this._tree.getOpenProperty(), true);
      },
      // event listener for "close" on the tree
      _onClose: function _onClose(ev) {
        ev.getData().set(this._tree.getOpenProperty(), false);
      },
      // event listener for model changes
      _onChangeBubble: function _onChangeBubble(ev) {
        var index;
        var item;
        var isOpen;
        var bubble = ev.getData(); // Extract the index of the current item

        index = bubble.name.replace(/.*\[([0-9]+)\]$/, "$1"); // Retrieve that indexed array item if it's an array; otherwise the item itself

        item = bubble.item.getItem ? bubble.item.getItem(index) : bubble.item; // If this item isn't being deleted and has an open property...

        if (item && qx.Class.hasProperty(item.constructor, this._tree.getOpenProperty())) {
          // ... then find out if this branch is open
          isOpen = item.get(this._tree.getOpenProperty()); // Open or close the tree branch as necessary

          if (isOpen && !this._tree.isNodeOpen(item)) {
            this._tree.openNode(item);
          } else if (!isOpen && this._tree.isNodeOpen(item)) {
            this._tree.closeNode(item);
          }
        } // Rebuild the internal lookup table


        this._tree.refresh();
      }
    },
    destruct: function destruct() {
      this._tree = null;

      this._lids.forEach(function (data) {
        data[0].removeListenerById(data[1]);
      });
    }
  });
  qx.ui.tree.core.OpenCloseController.$$dbClassInfo = $$dbClassInfo;
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * A widget cell provider provides the {@link qx.ui.virtual.layer.WidgetCell}
   * with configured widgets to render the cells and pools/releases unused
   * cell widgets.
   */
  qx.Interface.define("qx.ui.virtual.core.IWidgetCellProvider", {
    members: {
      /**
       * This method returns the configured cell for the given cell. The return
       * value may be <code>null</code> to indicate that the cell should be empty.
       *
       * @param row {Integer} The cell's row index.
       * @param column {Integer} The cell's column index.
       * @return {qx.ui.core.LayoutItem} The configured widget for the given cell.
       */
      getCellWidget: function getCellWidget(row, column) {},

      /**
       * Release the given cell widget. Either pool or destroy the widget.
       *
       * @param widget {qx.ui.core.LayoutItem} The cell widget to pool.
       */
      poolCellWidget: function poolCellWidget(widget) {}
    }
  });
  qx.ui.virtual.core.IWidgetCellProvider.$$dbClassInfo = $$dbClassInfo;
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
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This interface needs to implemented from all {@link qx.ui.tree.VirtualTree}
   * providers.
   *
   * @internal
   */
  qx.Interface.define("qx.ui.tree.provider.IVirtualTreeProvider", {
    members: {
      /**
       * Creates a layer for node and leaf rendering.
       *
       * @return {qx.ui.virtual.layer.Abstract} new layer.
       */
      createLayer: function createLayer() {},

      /**
       * Creates a renderer for rendering.
       *
       * @return {var} new node renderer.
       */
      createRenderer: function createRenderer() {},

      /**
       * Sets the name of the property, where the children are stored in the model.
       *
       * @param value {String} The child property name.
       */
      setChildProperty: function setChildProperty(value) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertString(value);
      },

      /**
       * Sets the name of the property, where the value for the tree folders label
       * is stored in the model classes.
       *
       * @param value {String} The label path.
       */
      setLabelPath: function setLabelPath(value) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertString(value);
      },

      /**
       * Styles a selected item.
       *
       * @param row {Integer} row to style.
       */
      styleSelectabled: function styleSelectabled(row) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInteger(row);
      },

      /**
       * Styles a not selected item.
       *
       * @param row {Integer} row to style.
       */
      styleUnselectabled: function styleUnselectabled(row) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInteger(row);
      },

      /**
       * Returns if the passed row can be selected or not.
       *
       * @param row {Integer} row to select.
       * @return {Boolean} <code>true</code> when the row can be selected,
       *    <code>false</code> otherwise.
       */
      isSelectable: function isSelectable(row) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInteger(row);
      }
    }
  });
  qx.ui.tree.provider.IVirtualTreeProvider.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.data.SingleValueBinding": {},
      "qx.util.OOUtil": {},
      "qx.util.Delegate": {},
      "qx.lang.Array": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The mixin controls the binding between model and item.
   *
   * @internal
   */
  qx.Mixin.define("qx.ui.tree.core.MWidgetController", {
    construct: function construct() {
      this.__boundItems = [];
    },
    properties: {
      /**
       * The name of the property, where the value for the tree node/leaf label
       * is stored in the model classes.
       */
      labelPath: {
        check: "String",
        nullable: true
      },

      /**
       * The path to the property which holds the information that should be
       * shown as an icon.
       */
      iconPath: {
        check: "String",
        nullable: true
      },

      /**
       * A map containing the options for the label binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      labelOptions: {
        nullable: true
      },

      /**
       * A map containing the options for the icon binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      iconOptions: {
        nullable: true
      },

      /**
       * The name of the property, where the children are stored in the model.
       * Instead of the {@link #labelPath} must the child property a direct
       * property form the model instance.
       */
      childProperty: {
        check: "String",
        nullable: true
      },

      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.tree.core.IVirtualTreeDelegate} interface.
       */
      delegate: {
        event: "changeDelegate",
        init: null,
        nullable: true
      }
    },
    members: {
      /** @type {Array} which contains the bounded items */
      __boundItems: null,

      /**
       * Helper-Method for binding the default properties from the model to the
       * target widget. The used default properties  depends on the passed item.
       *
       * This method should only be called in the {@link IVirtualTreeDelegate#bindItem}
       * function implemented by the {@link #delegate} property.
       *
       * @param item {qx.ui.core.Widget} The internally created and used node or
       *   leaf.
       * @param index {Integer} The index of the item (node or leaf).
       */
      bindDefaultProperties: function bindDefaultProperties(item, index) {
        // bind model first
        this.bindProperty("", "model", null, item, index);
        this.bindProperty(this.getLabelPath(), "label", this.getLabelOptions(), item, index);

        var bindPath = this.__getBindPath(index);

        var bindTarget = this._tree.getLookupTable();

        bindTarget = qx.data.SingleValueBinding.resolvePropertyChain(bindTarget, bindPath);

        if (qx.util.OOUtil.hasProperty(bindTarget.constructor, this.getChildProperty())) {
          this.bindProperty(this.getChildProperty() + ".length", "appearance", {
            converter: function converter() {
              return "virtual-tree-folder";
            }
          }, item, index);
        } else {
          item.setAppearance("virtual-tree-file");
        }

        if (this.getIconPath() != null) {
          this.bindProperty(this.getIconPath(), "icon", this.getIconOptions(), item, index);
        }
      },

      /**
       * Helper-Method for binding a given property from the model to the target
       * widget.
       *
       * This method should only be called in the {@link IVirtualTreeDelegate#bindItem}
       * function implemented by the {@link #delegate} property.
       *
       * @param sourcePath {String | null} The path to the property in the model.
       *   If you use an empty string, the whole model item will be bound.
       * @param targetProperty {String} The name of the property in the target widget.
       * @param options {Map | null} The options to use for the binding.
       * @param targetWidget {qx.ui.core.Widget} The target widget.
       * @param index {Integer} The index of the current binding.
       */
      bindProperty: function bindProperty(sourcePath, targetProperty, options, targetWidget, index) {
        var bindPath = this.__getBindPath(index, sourcePath);

        var bindTarget = this._tree.getLookupTable();

        var id = bindTarget.bind(bindPath, targetWidget, targetProperty, options);

        this.__addBinding(targetWidget, id);
      },

      /**
       * Helper-Method for binding a given property from the target widget to
       * the model.
       * This method should only be called in the
       * {@link qx.ui.tree.core.IVirtualTreeDelegate#bindItem} function implemented by the
       * {@link #delegate} property.
       *
       * @param targetPath {String | null} The path to the property in the model.
       * @param sourceProperty {String} The name of the property in the target.
       * @param options {Map | null} The options to use for the binding.
       * @param sourceWidget {qx.ui.core.Widget} The source widget.
       * @param index {Integer} The index of the current binding.
       */
      bindPropertyReverse: function bindPropertyReverse(targetPath, sourceProperty, options, sourceWidget, index) {
        var bindPath = this.__getBindPath(index, targetPath);

        var bindTarget = this._tree.getLookupTable();

        var id = sourceWidget.bind(sourceProperty, bindTarget, bindPath, options);

        this.__addBinding(sourceWidget, id);
      },

      /**
       * Remove all bindings from all bounded items.
       */
      removeBindings: function removeBindings() {
        while (this.__boundItems.length > 0) {
          var item = this.__boundItems.pop();

          this._removeBindingsFrom(item);
        }
      },

      /**
       * Sets up the binding for the given item and index.
       *
       * @param item {qx.ui.core.Widget} The internally created and used item.
       * @param index {Integer} The index of the item.
       */
      _bindItem: function _bindItem(item, index) {
        var bindItem = qx.util.Delegate.getMethod(this.getDelegate(), "bindItem");

        if (bindItem != null) {
          bindItem(this, item, index);
        } else {
          this.bindDefaultProperties(item, index);
        }
      },

      /**
       * Removes the binding of the given item.
       *
       * @param item {qx.ui.core.Widget} The item which the binding should be
       *   removed.
       */
      _removeBindingsFrom: function _removeBindingsFrom(item) {
        var bindings = this.__getBindings(item);

        while (bindings.length > 0) {
          var id = bindings.pop();

          try {
            this._tree.getLookupTable().removeBinding(id);
          } catch (e) {
            item.removeBinding(id);
          }
        }

        if (this.__boundItems.includes(item)) {
          qx.lang.Array.remove(this.__boundItems, item);
        }
      },

      /**
       * Helper method to create the path for binding.
       *
       * @param index {Integer} The index of the item.
       * @param path {String|null} The path to the property.
       * @return {String} The binding path
       */
      __getBindPath: function __getBindPath(index, path) {
        var bindPath = "[" + index + "]";

        if (path != null && path != "") {
          bindPath += "." + path;
        }

        return bindPath;
      },

      /**
       * Helper method to save the binding for the widget.
       *
       * @param widget {qx.ui.core.Widget} widget to save binding.
       * @param id {var} the id from the binding.
       */
      __addBinding: function __addBinding(widget, id) {
        var bindings = this.__getBindings(widget);

        if (!bindings.includes(id)) {
          bindings.push(id);
        }

        if (!this.__boundItems.includes(widget)) {
          this.__boundItems.push(widget);
        }
      },

      /**
       * Helper method which returns all bound id from the widget.
       *
       * @param widget {qx.ui.core.Widget} widget to get all binding.
       * @return {Array} all bound id's.
       */
      __getBindings: function __getBindings(widget) {
        var bindings = widget.getUserData("BindingIds");

        if (bindings == null) {
          bindings = [];
          widget.setUserData("BindingIds", bindings);
        }

        return bindings;
      }
    },
    destruct: function destruct() {
      this.__boundItems = null;
    }
  });
  qx.ui.tree.core.MWidgetController.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.virtual.core.IWidgetCellProvider": {
        "require": true
      },
      "qx.ui.tree.provider.IVirtualTreeProvider": {
        "require": true
      },
      "qx.ui.tree.core.MWidgetController": {
        "require": true
      },
      "qx.ui.core.queue.Widget": {},
      "qx.ui.virtual.layer.WidgetCell": {},
      "qx.util.Delegate": {},
      "qx.ui.tree.VirtualTreeItem": {},
      "qx.ui.virtual.cell.WidgetCell": {}
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

  /**
   * The provider implements the {@link qx.ui.virtual.core.IWidgetCellProvider}
   * API, which can be used as delegate for the widget cell rendering and it
   * provides a API to bind the model with the rendered item.
   *
   * @internal
   */
  qx.Class.define("qx.ui.tree.provider.WidgetProvider", {
    extend: qx.core.Object,
    implement: [qx.ui.virtual.core.IWidgetCellProvider, qx.ui.tree.provider.IVirtualTreeProvider],
    include: [qx.ui.tree.core.MWidgetController],

    /**
     * @param tree {qx.ui.tree.VirtualTree} tree to provide.
     */
    construct: function construct(tree) {
      qx.core.Object.constructor.call(this);
      this._tree = tree;
      this.addListener("changeDelegate", this._onChangeDelegate, this);

      this._onChangeDelegate();
    },
    members: {
      /** @type {qx.ui.tree.VirtualTree} tree to provide. */
      _tree: null,

      /** @type {qx.ui.virtual.cell.WidgetCell} the used item renderer. */
      _renderer: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */
      // interface implementation
      getCellWidget: function getCellWidget(row, column) {
        var item = this._tree.getLookupTable().getItem(row);

        var hasChildren = false;

        if (this._tree.isNode(item)) {
          hasChildren = this._tree.hasChildren(item);
        }

        var widget = this._renderer.getCellWidget();

        widget.setOpen(hasChildren && this._tree.isNodeOpen(item));
        widget.addListener("changeOpen", this.__onOpenChanged, this);
        widget.setUserData("cell.childProperty", this.getChildProperty());
        widget.setUserData("cell.showLeafs", this._tree.isShowLeafs());

        if (this._tree.getSelection().contains(item)) {
          this._styleSelectabled(widget);
        } else {
          this._styleUnselectabled(widget);
        }

        var level = this._tree.getLevel(row);

        if (!this._tree.isShowTopLevelOpenCloseIcons()) {
          level -= 1;
        }

        widget.setUserData("cell.level", level);

        if (!this._tree.isShowTopLevelOpenCloseIcons() && level == -1) {
          widget.setOpenSymbolMode("never");
        } else {
          widget.setOpenSymbolMode("auto");
        }

        if (this._tree.getOpenProperty()) {
          widget.setModel(item);
        }

        this._bindItem(widget, row);

        qx.ui.core.queue.Widget.add(widget);
        return widget;
      },
      // interface implementation
      poolCellWidget: function poolCellWidget(widget) {
        widget.removeListener("changeOpen", this.__onOpenChanged, this);

        this._removeBindingsFrom(widget);

        this._renderer.pool(widget);

        this._onPool(widget);
      },
      // Interface implementation
      createLayer: function createLayer() {
        return new qx.ui.virtual.layer.WidgetCell(this);
      },
      // Interface implementation
      createRenderer: function createRenderer() {
        var createItem = qx.util.Delegate.getMethod(this.getDelegate(), "createItem");

        if (createItem == null) {
          createItem = function createItem() {
            return new qx.ui.tree.VirtualTreeItem();
          };
        }

        var renderer = new qx.ui.virtual.cell.WidgetCell();
        renderer.setDelegate({
          createWidget: createItem
        });
        return renderer;
      },
      // interface implementation
      styleSelectabled: function styleSelectabled(row) {
        var widget = this._tree._layer.getRenderedCellWidget(row, 0);

        this._styleSelectabled(widget);
      },
      // interface implementation
      styleUnselectabled: function styleUnselectabled(row) {
        var widget = this._tree._layer.getRenderedCellWidget(row, 0);

        this._styleUnselectabled(widget);
      },
      // interface implementation
      isSelectable: function isSelectable(row) {
        var widget = this._tree._layer.getRenderedCellWidget(row, 0);

        if (widget != null) {
          return widget.isEnabled();
        } else {
          return true;
        }
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL API
      ---------------------------------------------------------------------------
      */

      /**
       * Styles a selected item.
       *
       * @param widget {qx.ui.core.Widget} widget to style.
       */
      _styleSelectabled: function _styleSelectabled(widget) {
        if (widget == null) {
          return;
        }

        this._renderer.updateStates(widget, {
          selected: 1
        });
      },

      /**
       * Styles a not selected item.
       *
       * @param widget {qx.ui.core.Widget} widget to style.
       */
      _styleUnselectabled: function _styleUnselectabled(widget) {
        if (widget == null) {
          return;
        }

        this._renderer.updateStates(widget, {});
      },

      /**
       * Calls the delegate <code>onPool</code> method when it is used in the
       * {@link #delegate} property.
       *
       * @param item {qx.ui.core.Widget} Item to modify.
       */
      _onPool: function _onPool(item) {
        var onPool = qx.util.Delegate.getMethod(this.getDelegate(), "onPool");

        if (onPool != null) {
          onPool(item);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the created item's.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onItemCreated: function _onItemCreated(event) {
        var configureItem = qx.util.Delegate.getMethod(this.getDelegate(), "configureItem");

        if (configureItem != null) {
          var leaf = event.getData();
          configureItem(leaf);
        }
      },

      /**
       * Event handler for the change delegate event.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onChangeDelegate: function _onChangeDelegate(event) {
        if (this._renderer != null) {
          this._renderer.dispose();

          this.removeBindings();
        }

        this._renderer = this.createRenderer();

        this._renderer.addListener("created", this._onItemCreated, this);
      },

      /**
       * Handler when a node changes opened or closed state.
       *
       * @param event {qx.event.type.Data} The data event.
       */
      __onOpenChanged: function __onOpenChanged(event) {
        var widget = event.getTarget();
        var row = widget.getUserData("cell.row");

        var item = this._tree.getLookupTable().getItem(row);

        if (event.getData()) {
          this._tree.openNodeWithoutScrolling(item);
        } else {
          this._tree.closeNodeWithoutScrolling(item);
        }
      }
    },
    destruct: function destruct() {
      this.removeBindings();

      this._renderer.dispose();

      this._tree = this._renderer = null;
    }
  });
  qx.ui.tree.provider.WidgetProvider.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
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
       2013 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This utility class implements some methods for the <code>VirtualTree</code>.
   */
  qx.Class.define("qx.ui.tree.core.Util", {
    statics: {
      /**
       * Returns if the passed item is a node or a leaf.
       *
       * @param node {qx.core.Object} Node to check.
       * @param childProperty {String} The property name to find the children.
       * @return {Boolean} <code>True</code> when the passed item is a node,
       *   </code>false</code> when it is a leaf.
       */
      isNode: function isNode(node, childProperty) {
        if (node == null || childProperty == null) {
          return false;
        }

        return qx.Class.hasProperty(node.constructor, childProperty);
      },

      /**
       * Returns whether the node has visible children or not.
       *
       * @param node {qx.core.Object} Node to check.
       * @param childProperty {String} The property name to find the children.
       * @param ignoreLeafs {Boolean?} Indicates whether leafs are ignored. This means when it is set to
       *    <code>true</code> a node which contains only leafs has no children. The default value is <code>false</code>.
       * @return {Boolean} <code>True</code> when the node has visible children,
       *   <code>false</code> otherwise.
       */
      hasChildren: function hasChildren(node, childProperty, ignoreLeafs) {
        if (node == null || childProperty == null || !this.isNode(node, childProperty)) {
          return false;
        }

        var children = node.get(childProperty);

        if (children == null) {
          return false;
        }

        if (!ignoreLeafs) {
          return children.length > 0;
        } else {
          for (var i = 0; i < children.getLength(); i++) {
            var child = children.getItem(i);

            if (this.isNode(child, childProperty)) {
              return true;
            }
          }
        }

        return false;
      }
    }
  });
  qx.ui.tree.core.Util.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Function": {},
      "qx.lang.Type": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Methods to work with the delegate pattern.
   */
  qx.Class.define("qx.util.Delegate", {
    statics: {
      /**
       * Returns the delegate method given my its name.
       *
       * @param delegate {Object} The delegate object to check the method.
       * @param specificMethod {String} The name of the delegate method.
       * @return {Function|null} The requested method or null, if no method is set.
       */
      getMethod: function getMethod(delegate, specificMethod) {
        if (qx.util.Delegate.containsMethod(delegate, specificMethod)) {
          return qx.lang.Function.bind(delegate[specificMethod], delegate);
        }

        return null;
      },

      /**
       * Checks, if the given delegate is valid or if a specific method is given.
       *
       * @param delegate {Object} The delegate object.
       * @param specificMethod {String} The name of the method to search for.
       * @return {Boolean} True, if everything was ok.
       */
      containsMethod: function containsMethod(delegate, specificMethod) {
        var Type = qx.lang.Type;

        if (Type.isObject(delegate)) {
          return Type.isFunction(delegate[specificMethod]);
        }

        return false;
      }
    }
  });
  qx.util.Delegate.$$dbClassInfo = $$dbClassInfo;
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
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * The axis maps virtual screen coordinates to item indexes. By default all
   * items have the same size but it is also possible to give specific items
   * a different size.
   */
  qx.Class.define("qx.ui.virtual.core.Axis", {
    extend: qx.core.Object,

    /**
     * @param defaultItemSize {Integer} The default size of the items.
     * @param itemCount {Integer} The number of item on the axis.
     */
    construct: function construct(defaultItemSize, itemCount) {
      qx.core.Object.constructor.call(this);
      this.itemCount = itemCount;
      this.defaultItemSize = defaultItemSize; // sparse array

      this.customSizes = {};
    },
    events: {
      /** Every change to the axis configuration triggers this event. */
      "change": "qx.event.type.Event"
    },
    members: {
      __ranges: null,

      /**
       * Get the default size of the items.
       *
       * @return {Integer} The default item size.
       */
      getDefaultItemSize: function getDefaultItemSize() {
        return this.defaultItemSize;
      },

      /**
       * Set the default size the items.
       *
       * @param defaultItemSize {Integer} The default size of the items.
       */
      setDefaultItemSize: function setDefaultItemSize(defaultItemSize) {
        if (this.defaultItemSize !== defaultItemSize) {
          this.defaultItemSize = defaultItemSize;
          this.__ranges = null;
          this.fireNonBubblingEvent("change");
        }
      },

      /**
       * Get the number of items in the axis.
       *
       * @return {Integer} The number of items.
       */
      getItemCount: function getItemCount() {
        return this.itemCount;
      },

      /**
       * Set the number of items in the axis.
       *
       * @param itemCount {Integer} The new item count.
       */
      setItemCount: function setItemCount(itemCount) {
        if (this.itemCount !== itemCount) {
          this.itemCount = itemCount;
          this.__ranges = null;
          this.fireNonBubblingEvent("change");
        }
      },

      /**
       * Sets the size of a specific item. This allow item, which have a size
       * different from the default size.
       *
       * @param index {Integer} Index of the item to change.
       * @param size {Integer} New size of the item.
       */
      setItemSize: function setItemSize(index, size) {
        {
          this.assertArgumentsCount(arguments, 2, 2);
          this.assert(size >= 0 || size === null, "'size' must be 'null' or an integer larger than 0.");
        }

        if (this.customSizes[index] == size) {
          return;
        }

        if (size === null) {
          delete this.customSizes[index];
        } else {
          this.customSizes[index] = size;
        }

        this.__ranges = null;
        this.fireNonBubblingEvent("change");
      },

      /**
       * Get the size of the item at the given index.
       *
       * @param index {Integer} Index of the item to get the size for.
       * @return {Integer} Size of the item.
       */
      getItemSize: function getItemSize(index) {
        // custom size of 0 is not allowed
        return this.customSizes[index] || this.defaultItemSize;
      },

      /**
       * Reset all custom sizes set with {@link #setItemSize}.
       */
      resetItemSizes: function resetItemSizes() {
        this.customSizes = {};
        this.__ranges = null;
        this.fireNonBubblingEvent("change");
      },

      /**
       * Split the position range into disjunct intervals. Each interval starts
       * with a custom sized cell. Each position is contained in exactly one range.
       * The ranges are sorted according to their start position.
       *
       * Complexity: O(n log n) (n = number of custom sized cells)
       *
       * @return {Map[]} The sorted list of ranges.
       */
      __getRanges: function __getRanges() {
        if (this.__ranges) {
          return this.__ranges;
        }

        var defaultSize = this.defaultItemSize;
        var itemCount = this.itemCount;
        var indexes = [];

        for (var key in this.customSizes) {
          var index = parseInt(key, 10);

          if (index < itemCount) {
            indexes.push(index);
          }
        }

        if (indexes.length == 0) {
          var ranges = [{
            startIndex: 0,
            endIndex: itemCount - 1,
            firstItemSize: defaultSize,
            rangeStart: 0,
            rangeEnd: itemCount * defaultSize - 1
          }];
          this.__ranges = ranges;
          return ranges;
        }

        indexes.sort(function (a, b) {
          return a > b ? 1 : -1;
        });
        var ranges = [];
        var correctionSum = 0;

        for (var i = 0; i < indexes.length; i++) {
          var index = indexes[i];

          if (index >= itemCount) {
            break;
          }

          var cellSize = this.customSizes[index];
          var rangeStart = index * defaultSize + correctionSum;
          correctionSum += cellSize - defaultSize;
          ranges[i] = {
            startIndex: index,
            firstItemSize: cellSize,
            rangeStart: rangeStart
          };

          if (i > 0) {
            ranges[i - 1].rangeEnd = rangeStart - 1;
            ranges[i - 1].endIndex = index - 1;
          }
        } // fix first range


        if (ranges[0].rangeStart > 0) {
          ranges.unshift({
            startIndex: 0,
            endIndex: ranges[0].startIndex - 1,
            firstItemSize: defaultSize,
            rangeStart: 0,
            rangeEnd: ranges[0].rangeStart - 1
          });
        } // fix last range


        var lastRange = ranges[ranges.length - 1];
        var remainingItemsSize = (itemCount - lastRange.startIndex - 1) * defaultSize;
        lastRange.rangeEnd = lastRange.rangeStart + lastRange.firstItemSize + remainingItemsSize - 1;
        lastRange.endIndex = itemCount - 1;
        this.__ranges = ranges;
        return ranges;
      },

      /**
       * Returns the range, which contains the position
       *
       * Complexity: O(log n) (n = number of custom sized cells)
       *
       * @param position {Integer} The position.
       * @return {Map} The range, which contains the given position.
       */
      __findRangeByPosition: function __findRangeByPosition(position) {
        var ranges = this.__ranges || this.__getRanges();

        var start = 0;
        var end = ranges.length - 1; // binary search in the sorted ranges list

        while (true) {
          var pivot = start + (end - start >> 1);
          var range = ranges[pivot];

          if (range.rangeEnd < position) {
            start = pivot + 1;
          } else if (range.rangeStart > position) {
            end = pivot - 1;
          } else {
            return range;
          }
        }
      },

      /**
       * Get the item and the offset into the item at the given position.
       *
       * @param position {Integer|null} The position to get the item for.
       * @return {Map} A map with the keys <code>index</code> and
       *    <code>offset</code>. The index is the index of the item containing the
       *    position and offsets specifies offset into this item. If the position
       *    is outside of the range, <code>null</code> is returned.
       */
      getItemAtPosition: function getItemAtPosition(position) {
        if (position < 0 || position >= this.getTotalSize()) {
          return null;
        }

        var range = this.__findRangeByPosition(position);

        var startPos = range.rangeStart;
        var index = range.startIndex;
        var firstItemSize = range.firstItemSize;

        if (startPos + firstItemSize > position) {
          return {
            index: index,
            offset: position - startPos
          };
        } else {
          var defaultSize = this.defaultItemSize;
          return {
            index: index + 1 + Math.floor((position - startPos - firstItemSize) / defaultSize),
            offset: (position - startPos - firstItemSize) % defaultSize
          };
        }
      },

      /**
       * Returns the range, which contains the position.
       *
       * Complexity: O(log n) (n = number of custom sized cells)
       *
       * @param index {Integer} The index of the item to get the range for.
       * @return {Map} The range for the index.
       */
      __findRangeByIndex: function __findRangeByIndex(index) {
        var ranges = this.__ranges || this.__getRanges();

        var start = 0;
        var end = ranges.length - 1; // binary search in the sorted ranges list

        while (true) {
          var pivot = start + (end - start >> 1);
          var range = ranges[pivot];

          if (range.endIndex < index) {
            start = pivot + 1;
          } else if (range.startIndex > index) {
            end = pivot - 1;
          } else {
            return range;
          }
        }
      },

      /**
       * Get the start position of the item with the given index.
       *
       * @param index {Integer} The item's index.
       * @return {Integer|null} The start position of the item. If the index is outside
       *    of the axis range <code>null</code> is returned.
       */
      getItemPosition: function getItemPosition(index) {
        if (index < 0 || index >= this.itemCount) {
          return null;
        }

        var range = this.__findRangeByIndex(index);

        if (range.startIndex == index) {
          return range.rangeStart;
        } else {
          return range.rangeStart + range.firstItemSize + (index - range.startIndex - 1) * this.defaultItemSize;
        }
      },

      /**
       * Returns the sum of all cell sizes.
       *
       * @return {Integer} The sum of all item sizes.
       */
      getTotalSize: function getTotalSize() {
        var ranges = this.__ranges || this.__getRanges();

        return ranges[ranges.length - 1].rangeEnd + 1;
      },

      /**
       * Get an array of item sizes starting with the item at "startIndex". The
       * sum of all sizes in the returned array is at least "minSizeSum".
       *
       * @param startIndex {Integer} The index of the first item.
       * @param minSizeSum {Integer} The minimum sum of the item sizes.
       * @return {Integer[]} List of item sizes starting with the size of the item
       *    at index <code>startIndex</code>. The sum of the item sizes is at least
       *    <code>minSizeSum</code>.
       */
      getItemSizes: function getItemSizes(startIndex, minSizeSum) {
        var customSizes = this.customSizes;
        var defaultSize = this.defaultItemSize;
        var sum = 0;
        var sizes = [];
        var i = 0;

        while (sum < minSizeSum) {
          var itemSize = customSizes[startIndex] != null ? customSizes[startIndex] : defaultSize;
          startIndex++;
          sum += itemSize;
          sizes[i++] = itemSize;

          if (startIndex >= this.itemCount) {
            break;
          }
        }

        return sizes;
      }
    },
    destruct: function destruct() {
      this.customSizes = this.__ranges = null;
    }
  });
  qx.ui.virtual.core.Axis.$$dbClassInfo = $$dbClassInfo;
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * A layer is responsible to render one aspect of a virtual pane. The pane tells
   * each layer to render/update a specific window of the virtual grid.
   */
  qx.Interface.define("qx.ui.virtual.core.ILayer", {
    members: {
      /**
       * Do a complete update of the layer. All cached data should be discarded.
       * This method is called e.g. after changes to the grid geometry
       * (row/column sizes, row/column count, ...).
       *
       * Note: This method can only be called after the widgets initial appear
       * event has been fired because it may work with the widget's DOM elements.
       *
       * @param firstRow {Integer} Index of the first row to display.
       * @param firstColumn {Integer} Index of the first column to display.
       * @param rowSizes {Integer[]} Array of heights for each row to display.
       * @param columnSizes {Integer[]} Array of widths for each column to display.
       */
      fullUpdate: function fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        this.assertArgumentsCount(arguments, 6, 6);
        this.assertPositiveInteger(firstRow);
        this.assertPositiveInteger(firstColumn);
        this.assertArray(rowSizes);
        this.assertArray(columnSizes);
      },

      /**
       * Update the layer to display a different window of the virtual grid.
       * This method is called if the pane is scrolled, resized or cells
       * are prefetched. The implementation can assume that no other grid
       * data has been changed since the last "fullUpdate" of "updateLayerWindow"
       * call.
       *
       * Note: This method can only be called after the widgets initial appear
       * event has been fired because it may work with the widget's DOM elements.
       *
       * @param firstRow {Integer} Index of the first row to display.
       * @param firstColumn {Integer} Index of the first column to display.
       * @param rowSizes {Integer[]} Array of heights for each row to display.
       * @param columnSizes {Integer[]} Array of widths for each column to display.
       */
      updateLayerWindow: function updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        this.assertArgumentsCount(arguments, 6, 6);
        this.assertPositiveInteger(firstRow);
        this.assertPositiveInteger(firstColumn);
        this.assertArray(rowSizes);
        this.assertArray(columnSizes);
      },

      /**
       * Update the layer to reflect changes in the data the layer displays.
       */
      updateLayerData: function updateLayerData() {}
    }
  });
  qx.ui.virtual.core.ILayer.$$dbClassInfo = $$dbClassInfo;
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * David Perez Carmona (david-perez)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * A cell event instance contains all data for pointer events related to cells in
   * a pane.
   **/
  qx.Class.define("qx.ui.virtual.core.CellEvent", {
    extend: qx.event.type.Pointer,
    properties: {
      /** The table row of the event target. */
      row: {
        check: "Integer",
        nullable: true
      },

      /** The table column of the event target. */
      column: {
        check: "Integer",
        nullable: true
      }
    },
    members: {
      /**
       * Initialize the event.
       *
       * @param scroller {qx.ui.table.pane.Scroller} The tables pane scroller.
       * @param me {qx.event.type.Pointer} The original pointer event.
       * @param row {Integer?null} The cell's row index.
       * @param column {Integer?null} The cell's column index.
       */
      init: function init(scroller, me, row, column) {
        me.clone(this);
        this.setBubbles(false);
        this.setRow(row);
        this.setColumn(column);
      }
    }
  });
  qx.ui.virtual.core.CellEvent.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-25.js.map
