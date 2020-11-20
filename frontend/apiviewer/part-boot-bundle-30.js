(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.LineSizeIterator": {},
      "qx.ui.layout.Util": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
     http://qooxdoo.org
  
     Copyright:
       2008 Dihedrals.com, http://www.dihedrals.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Chris Banford (zermattchris)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A basic layout, which supports positioning of child widgets in a 'flowing'
   * manner, starting at the container's top/left position, placing children left to right
   * (like a HBox) until the there's no remaining room for the next child. When
   * out of room on the current line of elements, a new line is started, cleared
   * below the tallest child of the preceding line -- a bit like using 'float'
   * in CSS, except that a new line wraps all the way back to the left.
   *
   * *Features*
   *
   * <ul>
   * <li> Reversing children order </li>
   * <li> Manual line breaks </li>
   * <li> Horizontal alignment of lines </li>
   * <li> Vertical alignment of individual widgets within a line </li>
   * <li> Margins with horizontal margin collapsing </li>
   * <li> Horizontal and vertical spacing </li>
   * <li> Height for width calculations </li>
   * <li> Auto-sizing </li>
   * </ul>
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>lineBreak</strong> <em>(Boolean)</em>: If set to <code>true</code>
   *   a forced line break will happen after this child widget.
   * </li>
   * <li><strong>stretch</strong> <em>(Boolean)</em>: If set to <code>true</code>
   *   the widget will be stretched to the remaining line width. This requires
   *   lineBreak to be true.
   * </li>
  
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the Flow layout.
   *
   * <pre class="javascript">
   *  var flowlayout = new qx.ui.layout.Flow();
   *
   *  flowlayout.setAlignX( "center" );  // Align children to the X axis of the container (left|center|right)
   *
   *  var container = new qx.ui.container.Composite(flowlayout);
   *  this.getRoot().add(container, {edge: 0});
   *
   *  var button1 = new qx.ui.form.Button("1. First Button", "flowlayout/test.png");
   *  container.add(button1);
   *
   *  var button2 = new qx.ui.form.Button("2. Second longer Button...", "flowlayout/test.png");
   *  // Have this child create a break in the current Line (next child will always start a new Line)
   *  container.add(button2, {lineBreak: true});
   *
   *  var button3 = new qx.ui.form.Button("3rd really, really, really long Button", "flowlayout/test.png");
   *  button3.setHeight(100);  // tall button
   *  container.add(button3);
   *
   *  var button4 = new qx.ui.form.Button("Number 4", "flowlayout/test.png");
   *  button4.setAlignY("bottom");
   *  container.add(button4);
   *
   *  var button5 = new qx.ui.form.Button("20px Margins around the great big 5th button!");
   *  button5.setHeight(100);  // tall button
   *  button5.setMargin(20);
   *  container.add(button5, {lineBreak: true});    // Line break after this button.
   *
   *  var button6 = new qx.ui.form.Button("Number 6", "flowlayout/test.png");
   *  button6.setAlignY("middle");  // Align this child to the vertical center of this line.
   *  container.add(button6);
   *
   *  var button7 = new qx.ui.form.Button("7th a wide, short button", "flowlayout/test.png");
   *  button7.setMaxHeight(20);  // short button
   *  container.add(button7);
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/flow.html'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Flow", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param spacingX {Integer?0} The spacing between child widgets {@link #spacingX}.
     * @param spacingY {Integer?0} The spacing between the lines {@link #spacingY}.
     * @param alignX {String?"left"} Horizontal alignment of the whole children
     *     block {@link #alignX}.
     */
    construct: function construct(spacingX, spacingY, alignX) {
      qx.ui.layout.Abstract.constructor.call(this);

      if (spacingX) {
        this.setSpacingX(spacingX);
      }

      if (spacingY) {
        this.setSpacingY(spacingY);
      }

      if (alignX) {
        this.setAlignX(alignX);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Horizontal alignment of the whole children block. The horizontal
       * alignment of the child is completely ignored in HBoxes (
       * {@link qx.ui.core.LayoutItem#alignX}).
       */
      alignX: {
        check: ["left", "center", "right"],
        init: "left",
        apply: "_applyLayoutChange"
      },

      /**
       * Vertical alignment of each child. Can be overridden through
       * {@link qx.ui.core.LayoutItem#alignY}.
       */
      alignY: {
        check: ["top", "middle", "bottom"],
        init: "top",
        apply: "_applyLayoutChange"
      },

      /** Horizontal spacing between two children */
      spacingX: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /**
       * The vertical spacing between the lines.
       */
      spacingY: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /** Whether the actual children list should be laid out in reversed order. */
      reversed: {
        check: "Boolean",
        init: false,
        apply: "_applyLayoutChange"
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
        var validProperties = ["lineBreak", "stretch"];
        this.assertInArray(name, validProperties, "The property '" + name + "' is not supported by the flow layout!");
      },
      // overridden
      connectToWidget: function connectToWidget(widget) {
        qx.ui.layout.Flow.prototype.connectToWidget.base.call(this, widget); // Necessary to be able to calculate the lines for the flow layout.
        // Otherwise the layout calculates the needed width and height by using
        // only one line of items which is leading to the wrong height. This
        // wrong height does e.g. suppress scrolling since the scroll pane does
        // not know about the correct needed height.

        if (widget) {
          widget.setAllowShrinkY(false);
        }
      },

      /**
       * The FlowLayout tries to add as many Children as possible to the current 'Line'
       * and when it sees that the next Child won't fit, it starts on a new Line, continuing
       * until all the Children have been added.
       * To enable alignX "left", "center", "right" renderLayout has to calculate the positions
       * of all a Line's children before it draws them.
       *
       * @param availWidth {Integer} Final width available for the content (in pixel)
       * @param availHeight {Integer} Final height available for the content (in pixel)
       * @param padding {Map} Map containing the padding values. Keys:
       * <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>
       */
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        if (this.getReversed()) {
          children = children.concat().reverse();
        }

        var lineCalculator = new qx.ui.layout.LineSizeIterator(children, this.getSpacingX());
        var lineTop = padding.top;

        while (lineCalculator.hasMoreLines()) {
          var line = lineCalculator.computeNextLine(availWidth);

          this.__renderLine(line, lineTop, availWidth, padding);

          lineTop += line.height + this.getSpacingY();
        }
      },

      /**
       * Render a line in the flow layout
       *
       * @param line {Map} A line configuration as returned by
       *    {@link LineSizeIterator#computeNextLine}.
       * @param lineTop {Integer} The line's top position
       * @param availWidth {Integer} The available line width
       * @param padding {Map} Map containing the padding values. Keys:
       * <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>
       */
      __renderLine: function __renderLine(line, lineTop, availWidth, padding) {
        var util = qx.ui.layout.Util;
        var left = padding.left;

        if (this.getAlignX() != "left") {
          left = padding.left + availWidth - line.width;

          if (this.getAlignX() == "center") {
            left = padding.left + Math.round((availWidth - line.width) / 2);
          }
        }

        for (var i = 0; i < line.children.length; i++) {
          var child = line.children[i];
          var size = child.getSizeHint();
          var marginTop = child.getMarginTop();
          var marginBottom = child.getMarginBottom();
          var top = util.computeVerticalAlignOffset(child.getAlignY() || this.getAlignY(), marginTop + size.height + marginBottom, line.height, marginTop, marginBottom);
          var layoutProps = child.getLayoutProperties();

          if (layoutProps.stretch && layoutProps.stretch) {
            size.width += availWidth - line.width;
          }

          child.renderLayout(left + line.gapsBefore[i], lineTop + top, size.width, size.height);
          left += line.gapsBefore[i] + size.width;
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        return this.__computeSize(Infinity);
      },
      // overridden
      hasHeightForWidth: function hasHeightForWidth() {
        return true;
      },
      // overridden
      getHeightForWidth: function getHeightForWidth(width) {
        return this.__computeSize(width).height;
      },

      /**
       * Returns the list of children fitting in the last row of the given width.
       * @param width {Number} The width to use for the calculation.
       * @return {Array} List of children in the first row.
       */
      getLastLineChildren: function getLastLineChildren(width) {
        var lineCalculator = new qx.ui.layout.LineSizeIterator(this._getLayoutChildren(), this.getSpacingX());
        var lineData = [];

        while (lineCalculator.hasMoreLines()) {
          lineData = lineCalculator.computeNextLine(width).children;
        }

        return lineData;
      },

      /**
       * Compute the preferred size optionally constrained by the available width
       *
       * @param availWidth {Integer} The available width
       * @return {Map} Map containing the preferred height and width of the layout
       */
      __computeSize: function __computeSize(availWidth) {
        var lineCalculator = new qx.ui.layout.LineSizeIterator(this._getLayoutChildren(), this.getSpacingX());
        var height = 0;
        var width = 0;
        var lineCount = 0;

        while (lineCalculator.hasMoreLines()) {
          var line = lineCalculator.computeNextLine(availWidth);
          lineCount += 1;
          width = Math.max(width, line.width);
          height += line.height;
        }

        return {
          width: width,
          height: height + this.getSpacingY() * (lineCount - 1)
        };
      }
    }
  });
  qx.ui.layout.Flow.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MExecutable": {
        "require": true
      },
      "qx.ui.form.IBooleanForm": {
        "require": true
      },
      "qx.ui.form.IExecutable": {
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * A toggle Button widget
   *
   * If the user presses the button by tapping on it pressing the enter or
   * space key, the button toggles between the pressed an not pressed states.
   */
  qx.Class.define("qx.ui.form.ToggleButton", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IBooleanForm, qx.ui.form.IExecutable, qx.ui.form.IRadioItem],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Creates a ToggleButton.
     *
     * @param label {String} The text on the button.
     * @param icon {String} An URI to the icon of the button.
     */
    construct: function construct(label, icon) {
      qx.ui.basic.Atom.constructor.call(this, label, icon); // register pointer events

      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut);
      this.addListener("pointerdown", this._onPointerDown);
      this.addListener("pointerup", this._onPointerUp); // register keyboard events

      this.addListener("keydown", this._onKeyDown);
      this.addListener("keyup", this._onKeyUp); // register execute event

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
        init: "button"
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /** The value of the widget. True, if the widget is checked. */
      value: {
        check: "Boolean",
        nullable: true,
        event: "changeValue",
        apply: "_applyValue",
        init: false
      },

      /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons. */
      group: {
        check: "qx.ui.form.RadioGroup",
        nullable: true,
        apply: "_applyGroup"
      },

      /**
      * Whether the button has a third state. Use this for tri-state checkboxes.
      *
      * When enabled, the value null of the property value stands for "undetermined",
      * while true is mapped to "enabled" and false to "disabled" as usual. Note
      * that the value property is set to false initially.
      *
      */
      triState: {
        check: "Boolean",
        apply: "_applyTriState",
        nullable: true,
        init: null
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** The assigned {@link qx.ui.form.RadioGroup} which handles the switching between registered buttons */
      _applyGroup: function _applyGroup(value, old) {
        if (old) {
          old.remove(this);
        }

        if (value) {
          value.add(this);
        }
      },

      /**
       * Changes the state of the button dependent on the checked value.
       *
       * @param value {Boolean} Current value
       * @param old {Boolean} Previous value
       */
      _applyValue: function _applyValue(value, old) {
        value ? this.addState("checked") : this.removeState("checked");

        if (this.isTriState()) {
          if (value === null) {
            this.addState("undetermined");
          } else if (old === null) {
            this.removeState("undetermined");
          }
        }
      },

      /**
      * Apply value property when triState property is modified.
      *
      * @param value {Boolean} Current value
      * @param old {Boolean} Previous value
      */
      _applyTriState: function _applyTriState(value, old) {
        this._applyValue(this.getValue());
      },

      /**
       * Handler for the execute event.
       *
       * @param e {qx.event.type.Event} The execute event.
       */
      _onExecute: function _onExecute(e) {
        this.toggleValue();
      },

      /**
       * Listener method for "pointerover" event.
       * <ul>
       * <li>Adds state "hovered"</li>
       * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (e.getTarget() !== this) {
          return;
        }

        this.addState("hovered");

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
          this.addState("pressed");
        }
      },

      /**
       * Listener method for "pointerout" event.
       * <ul>
       * <li>Removes "hovered" state</li>
       * <li>Adds "abandoned" state (if "pressed" state is set)</li>
       * <li>Removes "pressed" state (if "pressed" state is set and button is not checked)
       * </ul>
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        if (e.getTarget() !== this) {
          return;
        }

        this.removeState("hovered");

        if (this.hasState("pressed")) {
          if (!this.getValue()) {
            this.removeState("pressed");
          }

          this.addState("abandoned");
        }
      },

      /**
       * Listener method for "pointerdown" event.
       * <ul>
       * <li>Activates capturing</li>
       * <li>Removes "abandoned" state</li>
       * <li>Adds "pressed" state</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onPointerDown: function _onPointerDown(e) {
        if (!e.isLeftPressed()) {
          return;
        } // Activate capturing if the button get a pointerout while
        // the button is pressed.


        this.capture();
        this.removeState("abandoned");
        this.addState("pressed");
        e.stopPropagation();
      },

      /**
       * Listener method for "pointerup" event.
       * <ul>
       * <li>Releases capturing</li>
       * <li>Removes "pressed" state (if not "abandoned" state is set and "pressed" state is set)</li>
       * <li>Removes "abandoned" state (if set)</li>
       * <li>Toggles {@link #value} (if state "abandoned" is not set and state "pressed" is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onPointerUp: function _onPointerUp(e) {
        this.releaseCapture();

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
        } else if (this.hasState("pressed")) {
          this.execute();
        }

        this.removeState("pressed");
        e.stopPropagation();
      },

      /**
       * Listener method for "keydown" event.<br/>
       * Removes "abandoned" and adds "pressed" state
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyDown: function _onKeyDown(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            this.removeState("abandoned");
            this.addState("pressed");
            e.stopPropagation();
        }
      },

      /**
       * Listener method for "keyup" event.<br/>
       * Removes "abandoned" and "pressed" state (if "pressed" state is set)
       * for the keys "Enter" or "Space". It also toggles the {@link #value} property.
       *
       * @param e {Event} Key event
       */
      _onKeyUp: function _onKeyUp(e) {
        if (!this.hasState("pressed")) {
          return;
        }

        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            this.removeState("abandoned");
            this.execute();
            this.removeState("pressed");
            e.stopPropagation();
        }
      }
    }
  });
  qx.ui.form.ToggleButton.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-30.js.map
