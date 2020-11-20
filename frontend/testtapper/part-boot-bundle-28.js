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
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.INumberForm": {
        "require": true
      },
      "qx.ui.form.IRange": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.theme.manager.Decoration": {},
      "qx.bom.element.Location": {},
      "qx.event.Timer": {},
      "qx.bom.AnimationFrame": {},
      "qx.event.type.Data": {}
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
   * The Slider widget provides a vertical or horizontal slider.
   *
   * The Slider is the classic widget for controlling a bounded value.
   * It lets the user move a slider handle along a horizontal or vertical
   * groove and translates the handle's position into an integer value
   * within the defined range.
   *
   * The Slider has very few of its own functions.
   * The most useful functions are slideTo() to set the slider directly to some
   * value; setSingleStep(), setPageStep() to set the steps; and setMinimum()
   * and setMaximum() to define the range of the slider.
   *
   * A slider accepts focus on Tab and provides both a mouse wheel and
   * a keyboard interface. The keyboard interface is the following:
   *
   * * Left/Right move a horizontal slider by one single step.
   * * Up/Down move a vertical slider by one single step.
   * * PageUp moves up one page.
   * * PageDown moves down one page.
   * * Home moves to the start (minimum).
   * * End moves to the end (maximum).
   *
   * Here are the main properties of the class:
   *
   * # <code>value</code>: The bounded integer that {@link qx.ui.form.INumberForm}
   * maintains.
   * # <code>minimum</code>: The lowest possible value.
   * # <code>maximum</code>: The highest possible value.
   * # <code>singleStep</code>: The smaller of two natural steps that an abstract
   * sliders provides and typically corresponds to the user pressing an arrow key.
   * # <code>pageStep</code>: The larger of two natural steps that an abstract
   * slider provides and typically corresponds to the user pressing PageUp or
   * PageDown.
   *
   * @childControl knob {qx.ui.core.Widget} knob to set the value of the slider
   */
  qx.Class.define("qx.ui.form.Slider", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.IForm, qx.ui.form.INumberForm, qx.ui.form.IRange],
    include: [qx.ui.form.MForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param orientation {String?"horizontal"} Configure the
     * {@link #orientation} property
     */
    construct: function construct(orientation) {
      qx.ui.core.Widget.constructor.call(this); // Force canvas layout

      this._setLayout(new qx.ui.layout.Canvas()); // Add listeners


      this.addListener("keypress", this._onKeyPress);
      this.addListener("roll", this._onRoll);
      this.addListener("pointerdown", this._onPointerDown);
      this.addListener("pointerup", this._onPointerUp);
      this.addListener("losecapture", this._onPointerUp);
      this.addListener("resize", this._onUpdate); // Stop events

      this.addListener("contextmenu", this._onStopEvent);
      this.addListener("tap", this._onStopEvent);
      this.addListener("dbltap", this._onStopEvent); // Initialize orientation

      if (orientation != null) {
        this.setOrientation(orientation);
      } else {
        this.initOrientation();
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Change event for the value.
       */
      changeValue: 'qx.event.type.Data',

      /** Fired as soon as the slide animation ended. */
      slideAnimationEnd: 'qx.event.type.Event'
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
        init: "slider"
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /** Whether the slider is horizontal or vertical. */
      orientation: {
        check: ["horizontal", "vertical"],
        init: "horizontal",
        apply: "_applyOrientation"
      },

      /**
       * The current slider value.
       *
       * Strictly validates according to {@link #minimum} and {@link #maximum}.
       * Do not apply any value correction to the incoming value. If you depend
       * on this, please use {@link #slideTo} instead.
       */
      value: {
        check: "typeof value==='number'&&value>=this.getMinimum()&&value<=this.getMaximum()",
        init: 0,
        apply: "_applyValue",
        nullable: true
      },

      /**
       * The minimum slider value (may be negative). This value must be smaller
       * than {@link #maximum}.
       */
      minimum: {
        check: "Integer",
        init: 0,
        apply: "_applyMinimum",
        event: "changeMinimum"
      },

      /**
       * The maximum slider value (may be negative). This value must be larger
       * than {@link #minimum}.
       */
      maximum: {
        check: "Integer",
        init: 100,
        apply: "_applyMaximum",
        event: "changeMaximum"
      },

      /**
       * The amount to increment on each event. Typically corresponds
       * to the user pressing an arrow key.
       */
      singleStep: {
        check: "Integer",
        init: 1
      },

      /**
       * The amount to increment on each event. Typically corresponds
       * to the user pressing <code>PageUp</code> or <code>PageDown</code>.
       */
      pageStep: {
        check: "Integer",
        init: 10
      },

      /**
       * Factor to apply to the width/height of the knob in relation
       * to the dimension of the underlying area.
       */
      knobFactor: {
        check: "Number",
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
      __sliderLocation: null,
      __knobLocation: null,
      __knobSize: null,
      __dragMode: null,
      __dragOffset: null,
      __trackingMode: null,
      __trackingDirection: null,
      __trackingEnd: null,
      __timer: null,
      // event delay stuff during drag
      __dragTimer: null,
      __lastValueEvent: null,
      __dragValue: null,
      __scrollAnimationframe: null,
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        invalid: true
      },
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        qx.ui.form.Slider.prototype.renderLayout.base.call(this, left, top, width, height); // make sure the layout engine does not override the knob position

        this._updateKnobPosition();
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "knob":
            control = new qx.ui.core.Widget();
            control.addListener("resize", this._onUpdate, this);
            control.addListener("pointerover", this._onPointerOver);
            control.addListener("pointerout", this._onPointerOut);

            this._add(control);

            break;
        }

        return control || qx.ui.form.Slider.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for pointerover events at the knob child control.
       *
       * Adds the 'hovered' state
       *
       * @param e {qx.event.type.Pointer} Incoming pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        this.addState("hovered");
      },

      /**
       * Event handler for pointerout events at the knob child control.
       *
       * Removes the 'hovered' state
       *
       * @param e {qx.event.type.Pointer} Incoming pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        this.removeState("hovered");
      },

      /**
       * Listener of roll event
       *
       * @param e {qx.event.type.Roll} Incoming event object
       */
      _onRoll: function _onRoll(e) {
        // only wheel
        if (e.getPointerType() != "wheel") {
          return;
        }

        var axis = this.getOrientation() === "horizontal" ? "x" : "y";
        var delta = e.getDelta()[axis];
        var direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;
        this.slideBy(direction * this.getSingleStep());
        e.stop();
      },

      /**
       * Event handler for keypress events.
       *
       * Adds support for arrow keys, page up, page down, home and end keys.
       *
       * @param e {qx.event.type.KeySequence} Incoming keypress event
       */
      _onKeyPress: function _onKeyPress(e) {
        var isHorizontal = this.getOrientation() === "horizontal";
        var backward = isHorizontal ? "Left" : "Up";
        var forward = isHorizontal ? "Right" : "Down";

        switch (e.getKeyIdentifier()) {
          case forward:
            this.slideForward();
            break;

          case backward:
            this.slideBack();
            break;

          case "PageDown":
            this.slidePageForward(100);
            break;

          case "PageUp":
            this.slidePageBack(100);
            break;

          case "Home":
            this.slideToBegin(200);
            break;

          case "End":
            this.slideToEnd(200);
            break;

          default:
            return;
        } // Stop processed events


        e.stop();
      },

      /**
       * Listener of pointerdown event. Initializes drag or tracking mode.
       *
       * @param e {qx.event.type.Pointer} Incoming event object
       */
      _onPointerDown: function _onPointerDown(e) {
        // this can happen if the user releases the button while dragging outside
        // of the browser viewport
        if (this.__dragMode) {
          return;
        }

        var isHorizontal = this.__isHorizontal;
        var knob = this.getChildControl("knob");
        var locationProperty = isHorizontal ? "left" : "top";
        var cursorLocation = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
        var decorator = this.getDecorator();
        decorator = qx.theme.manager.Decoration.getInstance().resolve(decorator);

        if (isHorizontal) {
          var decoratorPadding = decorator ? decorator.getInsets().left : 0;
          var padding = (this.getPaddingLeft() || 0) + decoratorPadding;
        } else {
          var decoratorPadding = decorator ? decorator.getInsets().top : 0;
          var padding = (this.getPaddingTop() || 0) + decoratorPadding;
        }

        var sliderLocation = this.__sliderLocation = qx.bom.element.Location.get(this.getContentElement().getDomElement())[locationProperty];
        sliderLocation += padding;
        var knobLocation = this.__knobLocation = qx.bom.element.Location.get(knob.getContentElement().getDomElement())[locationProperty];

        if (e.getTarget() === knob) {
          // Switch into drag mode
          this.__dragMode = true;

          if (!this.__dragTimer) {
            // create a timer to fire delayed dragging events if dragging stops.
            this.__dragTimer = new qx.event.Timer(100);

            this.__dragTimer.addListener("interval", this._fireValue, this);
          }

          this.__dragTimer.start(); // Compute dragOffset (includes both: inner position of the widget and
          // cursor position on knob)


          this.__dragOffset = cursorLocation + sliderLocation - knobLocation; // add state

          knob.addState("pressed");
        } else {
          // Switch into tracking mode
          this.__trackingMode = true; // Detect tracking direction

          this.__trackingDirection = cursorLocation <= knobLocation ? -1 : 1; // Compute end value

          this.__computeTrackingEnd(e); // Directly call interval method once


          this._onInterval(); // Initialize timer (when needed)


          if (!this.__timer) {
            this.__timer = new qx.event.Timer(100);

            this.__timer.addListener("interval", this._onInterval, this);
          } // Start timer


          this.__timer.start();
        } // Register move listener


        this.addListener("pointermove", this._onPointerMove); // Activate capturing

        this.capture(); // Stop event

        e.stopPropagation();
      },

      /**
       * Listener of pointerup event. Used for cleanup of previously
       * initialized modes.
       *
       * @param e {qx.event.type.Pointer} Incoming event object
       */
      _onPointerUp: function _onPointerUp(e) {
        if (this.__dragMode) {
          // Release capture mode
          this.releaseCapture(); // Cleanup status flags

          delete this.__dragMode; // as we come out of drag mode, make
          // sure content gets synced

          this.__dragTimer.stop();

          this._fireValue();

          delete this.__dragOffset; // remove state

          this.getChildControl("knob").removeState("pressed"); // it's necessary to check whether the cursor is over the knob widget to be able to
          // to decide whether to remove the 'hovered' state.

          if (e.getType() === "pointerup") {
            var deltaSlider;
            var deltaPosition;
            var positionSlider;

            if (this.__isHorizontal) {
              deltaSlider = e.getDocumentLeft() - (this._valueToPosition(this.getValue()) + this.__sliderLocation);
              positionSlider = qx.bom.element.Location.get(this.getContentElement().getDomElement())["top"];
              deltaPosition = e.getDocumentTop() - (positionSlider + this.getChildControl("knob").getBounds().top);
            } else {
              deltaSlider = e.getDocumentTop() - (this._valueToPosition(this.getValue()) + this.__sliderLocation);
              positionSlider = qx.bom.element.Location.get(this.getContentElement().getDomElement())["left"];
              deltaPosition = e.getDocumentLeft() - (positionSlider + this.getChildControl("knob").getBounds().left);
            }

            if (deltaPosition < 0 || deltaPosition > this.__knobSize || deltaSlider < 0 || deltaSlider > this.__knobSize) {
              this.getChildControl("knob").removeState("hovered");
            }
          }
        } else if (this.__trackingMode) {
          // Stop timer interval
          this.__timer.stop(); // Release capture mode


          this.releaseCapture(); // Cleanup status flags

          delete this.__trackingMode;
          delete this.__trackingDirection;
          delete this.__trackingEnd;
        } // Remove move listener again


        this.removeListener("pointermove", this._onPointerMove); // Stop event

        if (e.getType() === "pointerup") {
          e.stopPropagation();
        }
      },

      /**
       * Listener of pointermove event for the knob. Only used in drag mode.
       *
       * @param e {qx.event.type.Pointer} Incoming event object
       */
      _onPointerMove: function _onPointerMove(e) {
        if (this.__dragMode) {
          var dragStop = this.__isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
          var position = dragStop - this.__dragOffset;
          this.slideTo(this._positionToValue(position));
        } else if (this.__trackingMode) {
          // Update tracking end on pointermove
          this.__computeTrackingEnd(e);
        } // Stop event


        e.stopPropagation();
      },

      /**
       * Listener of interval event by the internal timer. Only used
       * in tracking sequences.
       *
       * @param e {qx.event.type.Event} Incoming event object
       */
      _onInterval: function _onInterval(e) {
        // Compute new value
        var value = this.getValue() + this.__trackingDirection * this.getPageStep(); // Limit value

        if (value < this.getMinimum()) {
          value = this.getMinimum();
        } else if (value > this.getMaximum()) {
          value = this.getMaximum();
        } // Stop at tracking position (where the pointer is pressed down)


        var slideBack = this.__trackingDirection == -1;

        if (slideBack && value <= this.__trackingEnd || !slideBack && value >= this.__trackingEnd) {
          value = this.__trackingEnd;
        } // Finally slide to the desired position


        this.slideTo(value);
      },

      /**
       * Listener of resize event for both the slider itself and the knob.
       *
       * @param e {qx.event.type.Data} Incoming event object
       */
      _onUpdate: function _onUpdate(e) {
        // Update sliding space
        var availSize = this.getInnerSize();
        var knobSize = this.getChildControl("knob").getBounds();
        var sizeProperty = this.__isHorizontal ? "width" : "height"; // Sync knob size

        this._updateKnobSize(); // Store knob size


        this.__slidingSpace = availSize[sizeProperty] - knobSize[sizeProperty];
        this.__knobSize = knobSize[sizeProperty]; // Update knob position (sliding space must be updated first)

        this._updateKnobPosition();
      },

      /*
      ---------------------------------------------------------------------------
        UTILS
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} Whether the slider is laid out horizontally */
      __isHorizontal: false,

      /**
       * @type {Integer} Available space for knob to slide on, computed on resize of
       * the widget
       */
      __slidingSpace: 0,

      /**
       * Computes the value where the tracking should end depending on
       * the current pointer position.
       *
       * @param e {qx.event.type.Pointer} Incoming pointer event
       */
      __computeTrackingEnd: function __computeTrackingEnd(e) {
        var isHorizontal = this.__isHorizontal;
        var cursorLocation = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
        var sliderLocation = this.__sliderLocation;
        var knobLocation = this.__knobLocation;
        var knobSize = this.__knobSize; // Compute relative position

        var position = cursorLocation - sliderLocation;

        if (cursorLocation >= knobLocation) {
          position -= knobSize;
        } // Compute stop value


        var value = this._positionToValue(position);

        var min = this.getMinimum();
        var max = this.getMaximum();

        if (value < min) {
          value = min;
        } else if (value > max) {
          value = max;
        } else {
          var old = this.getValue();
          var step = this.getPageStep();
          var method = this.__trackingDirection < 0 ? "floor" : "ceil"; // Fix to page step

          value = old + Math[method]((value - old) / step) * step;
        } // Store value when undefined, otherwise only when it follows the
        // current direction e.g. goes up or down


        if (this.__trackingEnd == null || this.__trackingDirection == -1 && value <= this.__trackingEnd || this.__trackingDirection == 1 && value >= this.__trackingEnd) {
          this.__trackingEnd = value;
        }
      },

      /**
       * Converts the given position to a value.
       *
       * Does not respect single or page step.
       *
       * @param position {Integer} Position to use
       * @return {Integer} Resulting value (rounded)
       */
      _positionToValue: function _positionToValue(position) {
        // Reading available space
        var avail = this.__slidingSpace; // Protect undefined value (before initial resize) and division by zero

        if (avail == null || avail == 0) {
          return 0;
        } // Compute and limit percent


        var percent = position / avail;

        if (percent < 0) {
          percent = 0;
        } else if (percent > 1) {
          percent = 1;
        } // Compute range


        var range = this.getMaximum() - this.getMinimum(); // Compute value

        return this.getMinimum() + Math.round(range * percent);
      },

      /**
       * Converts the given value to a position to place
       * the knob to.
       *
       * @param value {Integer} Value to use
       * @return {Integer} Computed position (rounded)
       */
      _valueToPosition: function _valueToPosition(value) {
        // Reading available space
        var avail = this.__slidingSpace;

        if (avail == null) {
          return 0;
        } // Computing range


        var range = this.getMaximum() - this.getMinimum(); // Protect division by zero

        if (range == 0) {
          return 0;
        } // Translating value to distance from minimum


        var value = value - this.getMinimum(); // Compute and limit percent

        var percent = value / range;

        if (percent < 0) {
          percent = 0;
        } else if (percent > 1) {
          percent = 1;
        } // Compute position from available space and percent


        return Math.round(avail * percent);
      },

      /**
       * Updates the knob position following the currently configured
       * value. Useful on reflows where the dimensions of the slider
       * itself have been modified.
       *
       */
      _updateKnobPosition: function _updateKnobPosition() {
        this._setKnobPosition(this._valueToPosition(this.getValue()));
      },

      /**
       * Moves the knob to the given position.
       *
       * @param position {Integer} Any valid position (needs to be
       *   greater or equal than zero)
       */
      _setKnobPosition: function _setKnobPosition(position) {
        // Use the DOM Element to prevent unnecessary layout recalculations
        var knob = this.getChildControl("knob");
        var dec = this.getDecorator();
        dec = qx.theme.manager.Decoration.getInstance().resolve(dec);
        var content = knob.getContentElement();

        if (this.__isHorizontal) {
          if (dec && dec.getPadding()) {
            position += dec.getPadding().left;
          }

          position += this.getPaddingLeft() || 0;
          content.setStyle("left", position + "px", true);
        } else {
          if (dec && dec.getPadding()) {
            position += dec.getPadding().top;
          }

          position += this.getPaddingTop() || 0;
          content.setStyle("top", position + "px", true);
        }
      },

      /**
       * Reconfigures the size of the knob depending on
       * the optionally defined {@link #knobFactor}.
       *
       */
      _updateKnobSize: function _updateKnobSize() {
        // Compute knob size
        var knobFactor = this.getKnobFactor();

        if (knobFactor == null) {
          return;
        } // Ignore when not rendered yet


        var avail = this.getInnerSize();

        if (avail == null) {
          return;
        } // Read size property


        if (this.__isHorizontal) {
          this.getChildControl("knob").setWidth(Math.round(knobFactor * avail.width));
        } else {
          this.getChildControl("knob").setHeight(Math.round(knobFactor * avail.height));
        }
      },

      /*
      ---------------------------------------------------------------------------
        SLIDE METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Slides backward to the minimum value
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slideToBegin: function slideToBegin(duration) {
        this.slideTo(this.getMinimum(), duration);
      },

      /**
       * Slides forward to the maximum value
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slideToEnd: function slideToEnd(duration) {
        this.slideTo(this.getMaximum(), duration);
      },

      /**
       * Slides forward (right or bottom depending on orientation)
       *
       */
      slideForward: function slideForward() {
        this.slideBy(this.getSingleStep());
      },

      /**
       * Slides backward (to left or top depending on orientation)
       *
       */
      slideBack: function slideBack() {
        this.slideBy(-this.getSingleStep());
      },

      /**
       * Slides a page forward (to right or bottom depending on orientation)
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slidePageForward: function slidePageForward(duration) {
        this.slideBy(this.getPageStep(), duration);
      },

      /**
       * Slides a page backward (to left or top depending on orientation)
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slidePageBack: function slidePageBack(duration) {
        this.slideBy(-this.getPageStep(), duration);
      },

      /**
       * Slides by the given offset.
       *
       * This method works with the value, not with the coordinate.
       *
       * @param offset {Integer} Offset to scroll by
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slideBy: function slideBy(offset, duration) {
        this.slideTo(this.getValue() + offset, duration);
      },

      /**
       * Slides to the given value
       *
       * This method works with the value, not with the coordinate.
       *
       * @param value {Integer} Scroll to a value between the defined
       *   minimum and maximum.
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slideTo: function slideTo(value, duration) {
        this.stopSlideAnimation();

        if (duration) {
          this.__animateTo(value, duration);
        } else {
          this.updatePosition(value);
        }
      },

      /**
       * Updates the position property considering the minimum and maximum values.
       * @param value {Number} The new position.
       */
      updatePosition: function updatePosition(value) {
        this.setValue(this.__normalizeValue(value));
      },

      /**
       * In case a slide animation is currently running, it will be stopped.
       * If not, the method does nothing.
       */
      stopSlideAnimation: function stopSlideAnimation() {
        if (this.__scrollAnimationframe) {
          this.__scrollAnimationframe.cancelSequence();

          this.__scrollAnimationframe = null;
        }
      },

      /**
       * Internal helper to normalize the given value concerning the minimum
       * and maximum value.
       * @param value {Number} The value to normalize.
       * @return {Number} The normalized value.
       */
      __normalizeValue: function __normalizeValue(value) {
        // Bring into allowed range or fix to single step grid
        if (value < this.getMinimum()) {
          value = this.getMinimum();
        } else if (value > this.getMaximum()) {
          value = this.getMaximum();
        } else {
          value = this.getMinimum() + Math.round((value - this.getMinimum()) / this.getSingleStep()) * this.getSingleStep();
        }

        return value;
      },

      /**
       * Animation helper which takes care of the animated slide.
       * @param to {Number} The target value.
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      __animateTo: function __animateTo(to, duration) {
        to = this.__normalizeValue(to);
        var from = this.getValue();
        this.__scrollAnimationframe = new qx.bom.AnimationFrame();

        this.__scrollAnimationframe.on("frame", function (timePassed) {
          this.setValue(parseInt(timePassed / duration * (to - from) + from));
        }, this);

        this.__scrollAnimationframe.on("end", function () {
          this.setValue(to);
          this.__scrollAnimationframe = null;
          this.fireEvent("slideAnimationEnd");
        }, this);

        this.__scrollAnimationframe.startSequence(duration);
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        var knob = this.getChildControl("knob"); // Update private flag for faster access

        this.__isHorizontal = value === "horizontal"; // Toggle states and knob layout

        if (this.__isHorizontal) {
          this.removeState("vertical");
          knob.removeState("vertical");
          this.addState("horizontal");
          knob.addState("horizontal");
          knob.setLayoutProperties({
            top: 0,
            right: null,
            bottom: 0
          });
        } else {
          this.removeState("horizontal");
          knob.removeState("horizontal");
          this.addState("vertical");
          knob.addState("vertical");
          knob.setLayoutProperties({
            right: 0,
            bottom: null,
            left: 0
          });
        } // Sync knob position


        this._updateKnobPosition();
      },
      // property apply
      _applyKnobFactor: function _applyKnobFactor(value, old) {
        if (value != null) {
          this._updateKnobSize();
        } else {
          if (this.__isHorizontal) {
            this.getChildControl("knob").resetWidth();
          } else {
            this.getChildControl("knob").resetHeight();
          }
        }
      },
      // property apply
      _applyValue: function _applyValue(value, old) {
        if (value != null) {
          this._updateKnobPosition();

          if (this.__dragMode) {
            this.__dragValue = [value, old];
          } else {
            this.fireEvent("changeValue", qx.event.type.Data, [value, old]);
          }
        } else {
          this.resetValue();
        }
      },

      /**
       * Helper for applyValue which fires the changeValue event.
       */
      _fireValue: function _fireValue() {
        if (!this.__dragValue) {
          return;
        }

        var tmp = this.__dragValue;
        this.__dragValue = null;
        this.fireEvent("changeValue", qx.event.type.Data, tmp);
      },
      // property apply
      _applyMinimum: function _applyMinimum(value, old) {
        if (this.getValue() < value) {
          this.setValue(value);
        }

        this._updateKnobPosition();
      },
      // property apply
      _applyMaximum: function _applyMaximum(value, old) {
        if (this.getValue() > value) {
          this.setValue(value);
        }

        this._updateKnobPosition();
      }
    }
  });
  qx.ui.form.Slider.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Slider": {
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
   * Minimal modified version of the {@link qx.ui.form.Slider} to be
   * used by {@link qx.ui.core.scroll.ScrollBar}.
   *
   * @internal
   */
  qx.Class.define("qx.ui.core.scroll.ScrollSlider", {
    extend: qx.ui.form.Slider,
    // overridden
    construct: function construct(orientation) {
      qx.ui.form.Slider.constructor.call(this, orientation); // Remove roll/keypress events

      this.removeListener("keypress", this._onKeyPress);
      this.removeListener("roll", this._onRoll);
    },
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "knob":
            control = qx.ui.core.scroll.ScrollSlider.prototype._createChildControlImpl.base.call(this, id);
            control.addListener("dblclick", function (e) {
              e.stopPropagation();
            });
        }

        return control || qx.ui.core.scroll.ScrollSlider.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden
      getSizeHint: function getSizeHint(compute) {
        // get the original size hint
        var hint = qx.ui.core.scroll.ScrollSlider.prototype.getSizeHint.base.call(this); // set the width or height to 0 depending on the orientation.
        // this is necessary to prevent the ScrollSlider to change the size
        // hint of its parent, which can cause errors on outer flex layouts
        // [BUG #3279]

        if (this.getOrientation() === "horizontal") {
          hint.width = 0;
        } else {
          hint.height = 0;
        }

        return hint;
      }
    }
  });
  qx.ui.core.scroll.ScrollSlider.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.layer.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MChildrenHandling": {
        "require": true
      },
      "qx.ui.virtual.core.IWidgetCellProvider": {
        "construct": true
      },
      "qx.ui.core.Spacer": {},
      "qx.ui.core.FocusHandler": {},
      "qx.ui.core.Widget": {}
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
   * The WidgetCell layer renders each cell with a qooxdoo widget. The concrete
   * widget instance for each cell is provided by a cell provider.
   */
  qx.Class.define("qx.ui.virtual.layer.WidgetCell", {
    extend: qx.ui.virtual.layer.Abstract,
    include: [qx.ui.core.MChildrenHandling],

    /**
     * @param widgetCellProvider {qx.ui.virtual.core.IWidgetCellProvider} This
     *    class manages the life cycle of the cell widgets.
     */
    construct: function construct(widgetCellProvider) {
      qx.ui.virtual.layer.Abstract.constructor.call(this);
      this.setZIndex(12);
      {
        this.assertInterface(widgetCellProvider, qx.ui.virtual.core.IWidgetCellProvider);
      }
      this._cellProvider = widgetCellProvider;
      this.__spacerPool = [];
    },

    /*
     *****************************************************************************
        PROPERTIES
     *****************************************************************************
     */
    properties: {
      // overridden
      anonymous: {
        refine: true,
        init: false
      }
    },
    events: {
      /**
       * Is fired when the {@link #_fullUpdate} or the
       * {@link #_updateLayerWindow} is finished.
       */
      updated: "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __spacerPool: null,

      /**
      * Returns the widget used to render the given cell. May return null if the
      * cell isn’t rendered currently rendered.
      *
      * @param row {Integer} The cell's row index
      * @param column {Integer} The cell's column index
      * @return {qx.ui.core.LayoutItem|null} the widget used to render the given
      *    cell or <code>null</code>
      */
      getRenderedCellWidget: function getRenderedCellWidget(row, column) {
        if (this._getChildren().length === 0) {
          return null;
        }

        var columnCount = this.getColumnSizes().length;
        var rowCount = this.getRowSizes().length;
        var firstRow = this.getFirstRow();
        var firstColumn = this.getFirstColumn();

        if (row < firstRow || row >= firstRow + rowCount || column < firstColumn || column >= firstColumn + columnCount) {
          return null;
        }

        var childIndex = column - firstColumn + (row - firstRow) * columnCount;

        var widget = this._getChildren()[childIndex];

        if (!widget || widget.getUserData("cell.empty")) {
          return null;
        } else {
          return widget;
        }
      },

      /**
       * Get the spacer widget, for empty cells
       *
       * @return {qx.ui.core.Spacer} The spacer widget.
       */
      _getSpacer: function _getSpacer() {
        var spacer = this.__spacerPool.pop();

        if (!spacer) {
          spacer = new qx.ui.core.Spacer();
          spacer.setUserData("cell.empty", 1);
        }

        return spacer;
      },

      /**
       * Activates one of the still not empty items.
       * @param elementToPool {qx.ui.core.Widget} The widget which gets pooled.
       */
      _activateNotEmptyChild: function _activateNotEmptyChild(elementToPool) {
        // get the current active element
        var active = qx.ui.core.FocusHandler.getInstance().getActiveWidget(); // if the element to pool is active or one of its children

        if (active == elementToPool || qx.ui.core.Widget.contains(elementToPool, active)) {
          // search for a new child to activate
          var children = this._getChildren();

          for (var i = children.length - 1; i >= 0; i--) {
            if (!children[i].getUserData("cell.empty")) {
              children[i].activate();
              break;
            }
          }

          ;
        }
      },
      // overridden
      _fullUpdate: function _fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        var cellProvider = this._cellProvider;

        var children = this._getChildren().concat();

        for (var i = 0; i < children.length; i++) {
          var child = children[i];

          if (child.getUserData("cell.empty")) {
            this.__spacerPool.push(child);
          } else {
            this._activateNotEmptyChild(child);

            cellProvider.poolCellWidget(child);
          }
        }

        var top = 0;
        var left = 0;
        var visibleItems = [];

        for (var y = 0; y < rowSizes.length; y++) {
          for (var x = 0; x < columnSizes.length; x++) {
            var row = firstRow + y;
            var column = firstColumn + x;

            var item = cellProvider.getCellWidget(row, column) || this._getSpacer();

            visibleItems.push(item);
            item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
            item.setUserData("cell.row", row);
            item.setUserData("cell.column", column);

            this._add(item);

            left += columnSizes[x];
          }

          top += rowSizes[y];
          left = 0;
        }

        children.forEach(function (child) {
          if (visibleItems.indexOf(child) === -1) {
            this._remove(child);
          }
        }.bind(this));
        this.fireEvent("updated");
      },
      _updateLayerWindow: function _updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        // compute overlap of old and new window
        //
        //      +---+
        //      |  ##--+
        //      |  ##  |
        //      +--##  |
        //         +---+
        //
        {
          this.assertPositiveInteger(firstRow);
          this.assertPositiveInteger(firstColumn);
          this.assertArray(rowSizes);
          this.assertArray(columnSizes);
        }
        var lastRow = firstRow + rowSizes.length - 1;
        var lastColumn = firstColumn + columnSizes.length - 1;
        var overlap = {
          firstRow: Math.max(firstRow, this.getFirstRow()),
          lastRow: Math.min(lastRow, this._lastRow),
          firstColumn: Math.max(firstColumn, this.getFirstColumn()),
          lastColumn: Math.min(lastColumn, this._lastColumn)
        };
        this._lastColumn = lastColumn;
        this._lastRow = lastRow;

        if (overlap.firstRow > overlap.lastRow || overlap.firstColumn > overlap.lastColumn) {
          return this._fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
        } // collect the widgets to move


        var children = this._getChildren();

        var lineLength = this.getColumnSizes().length;
        var widgetsToMove = [];
        var widgetsToMoveIndexes = {};

        for (var row = firstRow; row <= lastRow; row++) {
          widgetsToMove[row] = [];

          for (var column = firstColumn; column <= lastColumn; column++) {
            if (row >= overlap.firstRow && row <= overlap.lastRow && column >= overlap.firstColumn && column <= overlap.lastColumn) {
              var x = column - this.getFirstColumn();
              var y = row - this.getFirstRow();
              var index = y * lineLength + x;
              widgetsToMove[row][column] = children[index];
              widgetsToMoveIndexes[index] = true;
            }
          }
        }

        var cellProvider = this._cellProvider; // pool widgets

        var children = this._getChildren().concat();

        for (var i = 0; i < children.length; i++) {
          if (!widgetsToMoveIndexes[i]) {
            var child = children[i];

            if (child.getUserData("cell.empty")) {
              this.__spacerPool.push(child);
            } else {
              this._activateNotEmptyChild(child);

              cellProvider.poolCellWidget(child);
            }
          }
        }

        var top = 0;
        var left = 0;
        var visibleItems = [];

        for (var y = 0; y < rowSizes.length; y++) {
          for (var x = 0; x < columnSizes.length; x++) {
            var row = firstRow + y;
            var column = firstColumn + x;

            var item = widgetsToMove[row][column] || cellProvider.getCellWidget(row, column) || this._getSpacer();

            visibleItems.push(item);
            item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
            item.setUserData("cell.row", row);
            item.setUserData("cell.column", column);

            this._add(item);

            left += columnSizes[x];
          }

          top += rowSizes[y];
          left = 0;
        }

        children.forEach(function (child) {
          if (visibleItems.indexOf(child) === -1) {
            this._remove(child);
          }
        }.bind(this));
        this.fireEvent("updated");
      }
    },
    destruct: function destruct() {
      var children = this._getChildren();

      for (var i = 0; i < children.length; i++) {
        children[i].dispose();
      }

      this._cellProvider = this.__spacerPool = null;
    }
  });
  qx.ui.virtual.layer.WidgetCell.$$dbClassInfo = $$dbClassInfo;
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A widget cell renderer manages a pool of widgets to render cells in a
   * {@link qx.ui.virtual.layer.WidgetCell} layer.
   */
  qx.Interface.define("qx.ui.virtual.cell.IWidgetCell", {
    members: {
      /**
       * Get a widget instance to render the cell
       *
       * @param data {var} Data needed for the cell to render.
       * @param states {Map} The states set on the cell (e.g. <i>selected</i>,
       * <i>focused</i>, <i>editable</i>).
       *
       * @return {qx.ui.core.LayoutItem} The cell widget
       */
      getCellWidget: function getCellWidget(data, states) {},

      /**
       * Release the given widget instance.
       *
       * Either pool or dispose the widget.
       *
       * @param widget {qx.ui.core.LayoutItem} The cell widget to pool
       */
      pool: function pool(widget) {},

      /**
       * Update the states of the given widget.
       *
       * @param widget {qx.ui.core.LayoutItem} The cell widget to update
       * @param states {Map} The cell widget's states
       */
      updateStates: function updateStates(widget, states) {},

      /**
       * Update the data the cell widget should display
       *
       * @param widget {qx.ui.core.LayoutItem} The cell widget to update
       * @param data {var} The data to display
       */
      updateData: function updateData(widget, data) {}
    }
  });
  qx.ui.virtual.cell.IWidgetCell.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.virtual.cell.IWidgetCell": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /**
   * Abstract base class for widget based cell renderer.
   */
  qx.Class.define("qx.ui.virtual.cell.AbstractWidget", {
    extend: qx.core.Object,
    implement: [qx.ui.virtual.cell.IWidgetCell],
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__pool = [];
    },
    events: {
      /** Fired when a new <code>LayoutItem</code> is created. */
      "created": "qx.event.type.Data"
    },
    members: {
      __pool: null,

      /**
       * Creates the widget instance.
       *
       * @abstract
       * @return {qx.ui.core.LayoutItem} The widget used to render a cell
       */
      _createWidget: function _createWidget() {
        throw new Error("abstract method call");
      },
      // interface implementation
      updateData: function updateData(widget, data) {
        throw new Error("abstract method call");
      },
      // interface implementation
      updateStates: function updateStates(widget, states) {
        var oldStates = widget.getUserData("cell.states"); // remove old states

        if (oldStates) {
          var newStates = states || {};

          for (var state in oldStates) {
            if (!newStates[state]) {
              widget.removeState(state);
            }
          }
        } else {
          oldStates = {};
        } // apply new states


        if (states) {
          for (var state in states) {
            if (!oldStates.state) {
              widget.addState(state);
            }
          }
        }

        widget.setUserData("cell.states", states);
      },
      // interface implementation
      getCellWidget: function getCellWidget(data, states) {
        var widget = this.__getWidgetFromPool();

        this.updateStates(widget, states);
        this.updateData(widget, data);
        return widget;
      },
      // interface implementation
      pool: function pool(widget) {
        this.__pool.push(widget);
      },

      /**
       * Cleanup all <code>LayoutItem</code> and destroy them.
       */
      _cleanupPool: function _cleanupPool() {
        var widget = this.__pool.pop();

        while (widget) {
          widget.destroy();
          widget = this.__pool.pop();
        }
      },

      /**
       * Returns a <code>LayoutItem</code> from the pool, when the pool is empty
       * a new <code>LayoutItem</code> is created.
       *
       * @return {qx.ui.core.LayoutItem} The cell widget
       */
      __getWidgetFromPool: function __getWidgetFromPool() {
        var widget = this.__pool.shift();

        if (widget == null) {
          widget = this._createWidget();
          this.fireDataEvent("created", widget);
        }

        return widget;
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this._cleanupPool();

      this.__pool = null;
    }
  });
  qx.ui.virtual.cell.AbstractWidget.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.cell.AbstractWidget": {
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.util.PropertyUtil": {}
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
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * Cell renderer can be used for Widget rendering. The Widget creation can be configured with the
   * {@link #delegate} property:
   *
   * <pre class="javascript">
   * widgetCell.setDelegate(
   * {
   *   createWidget : function() {
   *     return new qx.ui.form.ListItem();
   *   }
   * });
   * </pre>
   *
   * When the {@link #delegate} property is not used {@link qx.ui.core.Widget} instances are created as
   * fallback.
   *
   * The {@link #updateData} method can be used to update any Widget property. Just use a <code>Map</code>
   * with property name as key:
   *
   * <pre class="javascript">
   * // widget is a qx.ui.form.ListItem instance
   * widgetCell.updateData(widget,
   * {
   *   label: "my label value",
   *   icon: "qx/icon/22/emotes/face-angel.png"
   * });
   * </pre>
   */
  qx.Class.define("qx.ui.virtual.cell.WidgetCell", {
    extend: qx.ui.virtual.cell.AbstractWidget,
    properties: {
      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.virtual.cell.IWidgetCellDelegate} interface.
       */
      delegate: {
        apply: "_applyDelegate",
        init: null,
        nullable: true
      }
    },
    members: {
      // apply method
      _applyDelegate: function _applyDelegate(value, old) {
        this._cleanupPool();
      },
      // overridden
      _createWidget: function _createWidget() {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.createWidget != null) {
          return delegate.createWidget();
        } else {
          return new qx.ui.core.Widget();
        }
      },
      // overridden
      updateData: function updateData(widget, data) {
        for (var key in data) {
          if (qx.Class.hasProperty(widget.constructor, key)) {
            qx.util.PropertyUtil.setUserValue(widget, key, data[key]);
          } else {
            throw new Error("Can't update data! The key '" + key + "' is not a Property!");
          }
        }
      }
    }
  });
  qx.ui.virtual.cell.WidgetCell.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Registration": {},
      "qx.event.util.Keyboard": {},
      "qx.lang.String": {},
      "qx.locale.Key": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Shortcuts can be used to globally define keyboard shortcuts.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.bom.Shortcut", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance of Command
     *
     * @param shortcut {String} shortcuts can be composed of optional modifier
     *    keys Control, Alt, Shift, Meta and a non modifier key.
     *    If no non modifier key is specified, the second parameter is evaluated.
     *    The key must be separated by a <code>+</code> or <code>-</code> character.
     *    Examples: Alt+F1, Control+C, Control+Alt+Delete
     */
    construct: function construct(shortcut) {
      qx.core.Object.constructor.call(this);
      this.__modifier = {};
      this.__key = null;

      if (shortcut != null) {
        this.setShortcut(shortcut);
      }

      this.initEnabled();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the command is executed. Sets the "data" property of the event to
       * the object that issued the command.
       */
      "execute": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** whether the command should be respected/enabled */
      enabled: {
        init: true,
        check: "Boolean",
        event: "changeEnabled",
        apply: "_applyEnabled"
      },

      /** The command shortcut */
      shortcut: {
        check: "String",
        apply: "_applyShortcut",
        nullable: true
      },

      /**
       * Whether the execute event should be fired repeatedly if the user keep
       * the keys pressed.
       */
      autoRepeat: {
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
      __modifier: "",
      __key: "",

      /*
      ---------------------------------------------------------------------------
        USER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Fire the "execute" event on this shortcut.
       *
       * @param target {Object} Object which issued the execute event
       */
      execute: function execute(target) {
        this.fireDataEvent("execute", target);
      },

      /**
       * Key down event handler.
       *
       * @param event {qx.event.type.KeySequence} The key event object
       */
      __onKeyDown: function __onKeyDown(event) {
        if (this.getEnabled() && this.__matchesKeyEvent(event)) {
          if (!this.isAutoRepeat()) {
            this.execute(event.getTarget());
          }

          event.stop();
        }
      },

      /**
       * Key press event handler.
       *
       * @param event {qx.event.type.KeySequence} The key event object
       */
      __onKeyPress: function __onKeyPress(event) {
        if (this.getEnabled() && this.__matchesKeyEvent(event)) {
          if (this.isAutoRepeat()) {
            this.execute(event.getTarget());
          }

          event.stop();
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyEnabled: function _applyEnabled(value, old) {
        if (value) {
          qx.event.Registration.addListener(document.documentElement, "keydown", this.__onKeyDown, this);
          qx.event.Registration.addListener(document.documentElement, "keypress", this.__onKeyPress, this);
        } else {
          qx.event.Registration.removeListener(document.documentElement, "keydown", this.__onKeyDown, this);
          qx.event.Registration.removeListener(document.documentElement, "keypress", this.__onKeyPress, this);
        }
      },
      // property apply
      _applyShortcut: function _applyShortcut(value, old) {
        if (value) {
          // do not allow whitespaces within shortcuts
          if (value.search(/[\s]+/) != -1) {
            var msg = "Whitespaces are not allowed within shortcuts";
            this.error(msg);
            throw new Error(msg);
          }

          this.__modifier = {
            "Control": false,
            "Shift": false,
            "Meta": false,
            "Alt": false
          };
          this.__key = null; // To support shortcuts with "+" and "-" as keys it is necessary
          // to split the given value in a different way to determine the
          // several keyIdentifiers

          var index;
          var a = [];

          while (value.length > 0 && index != -1) {
            // search for delimiters "+" and "-"
            index = value.search(/[-+]+/); // add identifiers - take value if no separator was found or
            // only one char is left (second part of shortcut)

            a.push(value.length == 1 || index == -1 ? value : value.substring(0, index)); // extract the already detected identifier

            value = value.substring(index + 1);
          }

          var al = a.length;

          for (var i = 0; i < al; i++) {
            var identifier = this.__normalizeKeyIdentifier(a[i]);

            switch (identifier) {
              case "Control":
              case "Shift":
              case "Meta":
              case "Alt":
                this.__modifier[identifier] = true;
                break;

              case "Unidentified":
                var msg = "Not a valid key name for a shortcut: " + a[i];
                this.error(msg);
                throw msg;

              default:
                if (this.__key) {
                  var msg = "You can only specify one non modifier key!";
                  this.error(msg);
                  throw msg;
                }

                this.__key = identifier;
            }
          }
        }

        return true;
      },

      /*
      --------------------------------------------------------------------------
        INTERNAL MATCHING LOGIC
      ---------------------------------------------------------------------------
      */

      /**
       * Checks whether the given key event matches the shortcut's shortcut
       *
       * @param e {qx.event.type.KeySequence} the key event object
       * @return {Boolean} whether the shortcuts shortcut matches the key event
       */
      __matchesKeyEvent: function __matchesKeyEvent(e) {
        var key = this.__key;

        if (!key) {
          // no shortcut defined.
          return false;
        } // for check special keys
        // and check if a shortcut is a single char and special keys are pressed


        if (!this.__modifier.Shift && e.isShiftPressed() || this.__modifier.Shift && !e.isShiftPressed() || !this.__modifier.Control && e.isCtrlPressed() || this.__modifier.Control && !e.isCtrlPressed() || !this.__modifier.Meta && e.isMetaPressed() || this.__modifier.Meta && !e.isMetaPressed() || !this.__modifier.Alt && e.isAltPressed() || this.__modifier.Alt && !e.isAltPressed()) {
          return false;
        }

        if (key == e.getKeyIdentifier()) {
          return true;
        }

        return false;
      },

      /*
      ---------------------------------------------------------------------------
        COMPATIBILITY TO COMMAND
      ---------------------------------------------------------------------------
      */

      /**
       * @lint ignoreReferenceField(__oldKeyNameToKeyIdentifierMap)
       */
      __oldKeyNameToKeyIdentifierMap: {
        // all other keys are converted by converting the first letter to uppercase
        esc: "Escape",
        ctrl: "Control",
        print: "PrintScreen",
        del: "Delete",
        pageup: "PageUp",
        pagedown: "PageDown",
        numlock: "NumLock",
        numpad_0: "0",
        numpad_1: "1",
        numpad_2: "2",
        numpad_3: "3",
        numpad_4: "4",
        numpad_5: "5",
        numpad_6: "6",
        numpad_7: "7",
        numpad_8: "8",
        numpad_9: "9",
        numpad_divide: "/",
        numpad_multiply: "*",
        numpad_minus: "-",
        numpad_plus: "+"
      },

      /**
       * Checks and normalizes the key identifier.
       *
       * @param keyName {String} name of the key.
       * @return {String} normalized keyIdentifier or "Unidentified" if a conversion was not possible
       */
      __normalizeKeyIdentifier: function __normalizeKeyIdentifier(keyName) {
        var kbUtil = qx.event.util.Keyboard;
        var keyIdentifier = "Unidentified";

        if (kbUtil.isValidKeyIdentifier(keyName)) {
          return keyName;
        }

        if (keyName.length == 1 && keyName >= "a" && keyName <= "z") {
          return keyName.toUpperCase();
        }

        keyName = keyName.toLowerCase();
        var keyIdentifier = this.__oldKeyNameToKeyIdentifierMap[keyName] || qx.lang.String.firstUp(keyName);

        if (kbUtil.isValidKeyIdentifier(keyIdentifier)) {
          return keyIdentifier;
        } else {
          return "Unidentified";
        }
      },

      /*
      ---------------------------------------------------------------------------
        STRING CONVERSION
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the shortcut as string using the currently selected locale.
       *
       * @return {String} shortcut
       */
      toString: function toString() {
        var key = this.__key;
        var str = [];

        for (var modifier in this.__modifier) {
          // this.__modifier holds a map with shortcut combination keys
          // like "Control", "Alt", "Meta" and "Shift" as keys with
          // Boolean values
          if (this.__modifier[modifier]) {
            str.push(qx.locale.Key.getKeyName("short", modifier));
          }
        }

        if (key) {
          str.push(qx.locale.Key.getKeyName("short", key));
        }

        return str.join("+");
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // this will remove the event listener
      this.setEnabled(false);
      this.__modifier = this.__key = null;
    }
  });
  qx.bom.Shortcut.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Assert": {},
      "qx.lang.Object": {},
      "qx.dom.Element": {},
      "qx.lang.Type": {},
      "qx.bom.client.Engine": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine",
          "load": true
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * jQuery
       http://jquery.com
       Version 1.3.1
  
       Copyright:
         2009 John Resig
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
  ************************************************************************ */

  /**
   * Cross browser abstractions to work with input elements.
   */
  qx.Bootstrap.define("qx.bom.Input", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} Internal data structures with all supported input types */
      __types: {
        text: 1,
        textarea: 1,
        select: 1,
        checkbox: 1,
        radio: 1,
        password: 1,
        hidden: 1,
        submit: 1,
        image: 1,
        file: 1,
        search: 1,
        reset: 1,
        button: 1
      },

      /**
       * Creates an DOM input/textarea/select element.
       *
       * Attributes may be given directly with this call. This is critical
       * for some attributes e.g. name, type, ... in many clients.
       *
       * Note: <code>select</code> and <code>textarea</code> elements are created
       * using the identically named <code>type</code>.
       *
       * @param type {String} Any valid type for HTML, <code>select</code>
       *   and <code>textarea</code>
       * @param attributes {Map} Map of attributes to apply
       * @param win {Window} Window to create the element for
       * @return {Element} The created input node
       */
      create: function create(type, attributes, win) {
        {
          qx.core.Assert.assertKeyInMap(type, this.__types, "Unsupported input type.");
        } // Work on a copy to not modify given attributes map

        var attributes = attributes ? qx.lang.Object.clone(attributes) : {};
        var tag;

        if (type === "textarea" || type === "select") {
          tag = type;
        } else {
          tag = "input";
          attributes.type = type;
        }

        return qx.dom.Element.create(tag, attributes, win);
      },

      /**
       * Applies the given value to the element.
       *
       * Normally the value is given as a string/number value and applied
       * to the field content (textfield, textarea) or used to
       * detect whether the field is checked (checkbox, radiobutton).
       *
       * Supports array values for selectboxes (multiple-selection)
       * and checkboxes or radiobuttons (for convenience).
       *
       * Please note: To modify the value attribute of a checkbox or
       * radiobutton use {@link qx.bom.element.Attribute#set} instead.
       *
       * @param element {Element} element to update
       * @param value {String|Number|Array} the value to apply
       */
      setValue: function setValue(element, value) {
        var tag = element.nodeName.toLowerCase();
        var type = element.type;
        var Type = qx.lang.Type;

        if (typeof value === "number") {
          value += "";
        }

        if (type === "checkbox" || type === "radio") {
          if (Type.isArray(value)) {
            element.checked = value.includes(element.value);
          } else {
            element.checked = element.value == value;
          }
        } else if (tag === "select") {
          var isArray = Type.isArray(value);
          var options = element.options;
          var subel, subval;

          for (var i = 0, l = options.length; i < l; i++) {
            subel = options[i];
            subval = subel.getAttribute("value");

            if (subval == null) {
              subval = subel.text;
            }

            subel.selected = isArray ? value.includes(subval) : value == subval;
          }

          if (isArray && value.length == 0) {
            element.selectedIndex = -1;
          }
        } else if ((type === "text" || type === "textarea") && qx.core.Environment.get("engine.name") == "mshtml") {
          // These flags are required to detect self-made property-change
          // events during value modification. They are used by the Input
          // event handler to filter events.
          element.$$inValueSet = true;
          element.value = value;
          element.$$inValueSet = null;
        } else {
          element.value = value;
        }
      },

      /**
       * Returns the currently configured value.
       *
       * Works with simple input fields as well as with
       * select boxes or option elements.
       *
       * Returns an array in cases of multi-selection in
       * select boxes but in all other cases a string.
       *
       * @param element {Element} DOM element to query
       * @return {String|Array} The value of the given element
       */
      getValue: function getValue(element) {
        var tag = element.nodeName.toLowerCase();

        if (tag === "option") {
          return (element.attributes.value || {}).specified ? element.value : element.text;
        }

        if (tag === "select") {
          var index = element.selectedIndex; // Nothing was selected

          if (index < 0) {
            return null;
          }

          var values = [];
          var options = element.options;
          var one = element.type == "select-one";
          var clazz = qx.bom.Input;
          var value; // Loop through all the selected options

          for (var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++) {
            var option = options[i];

            if (option.selected) {
              // Get the specific value for the option
              value = clazz.getValue(option); // We don't need an array for one selects

              if (one) {
                return value;
              } // Multi-Selects return an array


              values.push(value);
            }
          }

          return values;
        } else {
          return (element.value || "").replace(/\r/g, "");
        }
      },

      /**
       * Sets the text wrap behaviour of a text area element.
       * This property uses the attribute "wrap" respectively
       * the style property "whiteSpace"
       *
       * @signature function(element, wrap)
       * @param element {Element} DOM element to modify
       * @param wrap {Boolean} Whether to turn text wrap on or off.
       */
      setWrap: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element, wrap) {
          var wrapValue = wrap ? "soft" : "off"; // Explicitly set overflow-y CSS property to auto when wrapped,
          // allowing the vertical scroll-bar to appear if necessary

          var styleValue = wrap ? "auto" : "";
          element.wrap = wrapValue;
          element.style.overflowY = styleValue;
        },
        "gecko": function gecko(element, wrap) {
          var wrapValue = wrap ? "soft" : "off";
          var styleValue = wrap ? "" : "auto";
          element.setAttribute("wrap", wrapValue);
          element.style.overflow = styleValue;
        },
        "webkit": function webkit(element, wrap) {
          var wrapValue = wrap ? "soft" : "off";
          var styleValue = wrap ? "" : "auto";
          element.setAttribute("wrap", wrapValue);
          element.style.overflow = styleValue;
        },
        "default": function _default(element, wrap) {
          element.style.whiteSpace = wrap ? "normal" : "nowrap";
        }
      })
    }
  });
  qx.bom.Input.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Timer": {
        "construct": true
      }
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
   * Timer, which accelerates after each interval. The initial delay and the
   * interval time can be set using the properties {@link #firstInterval}
   * and {@link #interval}. The {@link #interval} events will be fired with
   * decreasing interval times while the timer is running, until the {@link #minimum}
   * is reached. The {@link #decrease} property sets the amount of milliseconds
   * which will decreased after every firing.
   *
   * This class is e.g. used in the {@link qx.ui.form.RepeatButton} and
   * {@link qx.ui.form.HoverButton} widgets.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.AcceleratingTimer", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__timer = new qx.event.Timer(this.getInterval());

      this.__timer.addListener("interval", this._onInterval, this);
    },
    events: {
      /** This event if fired each time the interval time has elapsed */
      "interval": "qx.event.type.Event"
    },
    properties: {
      /**
       * Interval used after the first run of the timer. Usually a smaller value
       * than the "firstInterval" property value to get a faster reaction.
       */
      interval: {
        check: "Integer",
        init: 100
      },

      /**
       * Interval used for the first run of the timer. Usually a greater value
       * than the "interval" property value to a little delayed reaction at the first
       * time.
       */
      firstInterval: {
        check: "Integer",
        init: 500
      },

      /** This configures the minimum value for the timer interval. */
      minimum: {
        check: "Integer",
        init: 20
      },

      /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
      decrease: {
        check: "Integer",
        init: 2
      }
    },
    members: {
      __timer: null,
      __currentInterval: null,

      /**
       * Reset and start the timer.
       */
      start: function start() {
        this.__timer.setInterval(this.getFirstInterval());

        this.__timer.start();
      },

      /**
       * Stop the timer
       */
      stop: function stop() {
        this.__timer.stop();

        this.__currentInterval = null;
      },

      /**
       * Interval event handler
       */
      _onInterval: function _onInterval() {
        this.__timer.stop();

        if (this.__currentInterval == null) {
          this.__currentInterval = this.getInterval();
        }

        this.__currentInterval = Math.max(this.getMinimum(), this.__currentInterval - this.getDecrease());

        this.__timer.setInterval(this.__currentInterval);

        this.__timer.start();

        this.fireEvent("interval");
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__timer");
    }
  });
  qx.event.AcceleratingTimer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
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
   * Generic escaping and unescaping of DOM strings.
   *
   * {@link qx.bom.String} for (un)escaping of HTML strings.
   * {@link qx.xml.String} for (un)escaping of XML strings.
   */
  qx.Bootstrap.define("qx.util.StringEscape", {
    statics: {
      /**
       * generic escaping method
       *
       * @param str {String} string to escape
       * @param charCodeToEntities {Map} entity to charcode map
       * @return {String} escaped string
       */
      escape: function escape(str, charCodeToEntities) {
        var entity,
            result = "";

        for (var i = 0, l = str.length; i < l; i++) {
          var chr = str.charAt(i);
          var code = chr.charCodeAt(0);

          if (charCodeToEntities[code]) {
            entity = "&" + charCodeToEntities[code] + ";";
          } else {
            if (code > 0x7F) {
              entity = "&#" + code + ";";
            } else {
              entity = chr;
            }
          }

          result += entity;
        }

        return result;
      },

      /**
       * generic unescaping method
       *
       * @param str {String} string to unescape
       * @param entitiesToCharCode {Map} charcode to entity map
       * @return {String} unescaped string
       */
      unescape: function unescape(str, entitiesToCharCode) {
        return str.replace(/&[#\w]+;/gi, function (entity) {
          var chr = entity;
          var entity = entity.substring(1, entity.length - 1);
          var code = entitiesToCharCode[entity];

          if (code) {
            chr = String.fromCharCode(code);
          } else {
            if (entity.charAt(0) == '#') {
              if (entity.charAt(1).toUpperCase() == 'X') {
                code = entity.substring(2); // match hex number

                if (code.match(/^[0-9A-Fa-f]+$/gi)) {
                  chr = String.fromCharCode(parseInt(code, 16));
                }
              } else {
                code = entity.substring(1); // match integer

                if (code.match(/^\d+$/gi)) {
                  chr = String.fromCharCode(parseInt(code, 10));
                }
              }
            }
          }

          return chr;
        });
      }
    }
  });
  qx.util.StringEscape.$$dbClassInfo = $$dbClassInfo;
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Defines the callback for the single selection manager.
   *
   * @internal
   */
  qx.Interface.define("qx.ui.core.ISingleSelectionProvider", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns the elements which are part of the selection.
       *
       * @return {qx.ui.core.Widget[]} The widgets for the selection.
       */
      getItems: function getItems() {},

      /**
       * Returns whether the given item is selectable.
       *
       * @param item {qx.ui.core.Widget} The item to be checked
       * @return {Boolean} Whether the given item is selectable
       */
      isItemSelectable: function isItemSelectable(item) {}
    }
  });
  qx.ui.core.ISingleSelectionProvider.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.locale.Manager": {
        "defer": "runtime"
      }
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Static class, which contains functionality to localize the names of keyboard keys.
   */
  qx.Class.define("qx.locale.Key", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Return localized name of a key identifier
       * {@link qx.event.type.KeySequence}
       *
       * @param size {String} format of the key identifier.
       *       Possible values: "short", "full"
       * @param keyIdentifier {String} key identifier to translate {@link qx.event.type.KeySequence}
       * @param locale {String} optional locale to be used
       * @return {String} localized key name
       */
      getKeyName: function getKeyName(size, keyIdentifier, locale) {
        {
          qx.core.Assert.assertInArray(size, ["short", "full"]);
        }
        var key = "key_" + size + "_" + keyIdentifier; // Control is always named control on a mac and not Strg in German e.g.

        if (qx.core.Environment.get("os.name") == "osx" && keyIdentifier == "Control") {
          key += "_Mac";
        }

        var localizedKey = qx.locale.Manager.getInstance().translate(key, [], locale);

        if (localizedKey == key) {
          return qx.locale.Key._keyNames[key] || keyIdentifier;
        } else {
          return localizedKey;
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      var keyNames = {};
      var Manager = qx.locale.Manager; // TRANSLATION: short representation of key names

      keyNames[Manager.marktr("key_short_Backspace")] = "Backspace";
      keyNames[Manager.marktr("key_short_Tab")] = "Tab";
      keyNames[Manager.marktr("key_short_Space")] = "Space";
      keyNames[Manager.marktr("key_short_Enter")] = "Enter";
      keyNames[Manager.marktr("key_short_Shift")] = "Shift";
      keyNames[Manager.marktr("key_short_Control")] = "Ctrl";
      keyNames[Manager.marktr("key_short_Control_Mac")] = "Ctrl";
      keyNames[Manager.marktr("key_short_Alt")] = "Alt";
      keyNames[Manager.marktr("key_short_CapsLock")] = "Caps";
      keyNames[Manager.marktr("key_short_Meta")] = "Meta";
      keyNames[Manager.marktr("key_short_Escape")] = "Esc";
      keyNames[Manager.marktr("key_short_Left")] = "Left";
      keyNames[Manager.marktr("key_short_Up")] = "Up";
      keyNames[Manager.marktr("key_short_Right")] = "Right";
      keyNames[Manager.marktr("key_short_Down")] = "Down";
      keyNames[Manager.marktr("key_short_PageUp")] = "PgUp";
      keyNames[Manager.marktr("key_short_PageDown")] = "PgDn";
      keyNames[Manager.marktr("key_short_End")] = "End";
      keyNames[Manager.marktr("key_short_Home")] = "Home";
      keyNames[Manager.marktr("key_short_Insert")] = "Ins";
      keyNames[Manager.marktr("key_short_Delete")] = "Del";
      keyNames[Manager.marktr("key_short_NumLock")] = "Num";
      keyNames[Manager.marktr("key_short_PrintScreen")] = "Print";
      keyNames[Manager.marktr("key_short_Scroll")] = "Scroll";
      keyNames[Manager.marktr("key_short_Pause")] = "Pause";
      keyNames[Manager.marktr("key_short_Win")] = "Win";
      keyNames[Manager.marktr("key_short_Apps")] = "Apps"; // TRANSLATION: full/long representation of key names

      keyNames[Manager.marktr("key_full_Backspace")] = "Backspace";
      keyNames[Manager.marktr("key_full_Tab")] = "Tabulator";
      keyNames[Manager.marktr("key_full_Space")] = "Space";
      keyNames[Manager.marktr("key_full_Enter")] = "Enter";
      keyNames[Manager.marktr("key_full_Shift")] = "Shift";
      keyNames[Manager.marktr("key_full_Control")] = "Control";
      keyNames[Manager.marktr("key_full_Control_Mac")] = "Control";
      keyNames[Manager.marktr("key_full_Alt")] = "Alt";
      keyNames[Manager.marktr("key_full_CapsLock")] = "CapsLock";
      keyNames[Manager.marktr("key_full_Meta")] = "Meta";
      keyNames[Manager.marktr("key_full_Escape")] = "Escape";
      keyNames[Manager.marktr("key_full_Left")] = "Left";
      keyNames[Manager.marktr("key_full_Up")] = "Up";
      keyNames[Manager.marktr("key_full_Right")] = "Right";
      keyNames[Manager.marktr("key_full_Down")] = "Down";
      keyNames[Manager.marktr("key_full_PageUp")] = "PageUp";
      keyNames[Manager.marktr("key_full_PageDown")] = "PageDown";
      keyNames[Manager.marktr("key_full_End")] = "End";
      keyNames[Manager.marktr("key_full_Home")] = "Home";
      keyNames[Manager.marktr("key_full_Insert")] = "Insert";
      keyNames[Manager.marktr("key_full_Delete")] = "Delete";
      keyNames[Manager.marktr("key_full_NumLock")] = "NumLock";
      keyNames[Manager.marktr("key_full_PrintScreen")] = "PrintScreen";
      keyNames[Manager.marktr("key_full_Scroll")] = "Scroll";
      keyNames[Manager.marktr("key_full_Pause")] = "Pause";
      keyNames[Manager.marktr("key_full_Win")] = "Win";
      keyNames[Manager.marktr("key_full_Apps")] = "Apps"; // Save

      statics._keyNames = keyNames;
    }
  });
  qx.locale.Key.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-28.js.map
