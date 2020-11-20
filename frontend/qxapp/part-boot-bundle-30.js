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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Can be included for implementing {@link qx.ui.form.IModel}. It only contains
   * a nullable property named 'model' with a 'changeModel' event.
   */
  qx.Mixin.define("qx.ui.form.MModelProperty", {
    properties: {
      /**
       * Model property for storing additional information for the including
       * object. It can act as value property on form items for example.
       *
       * Be careful using that property as this is used for the
       * {@link qx.ui.form.MModelSelection} it has some restrictions:
       *
       * * Don't use equal models in one widget using the
       *     {@link qx.ui.form.MModelSelection}.
       *
       * * Avoid setting only some model properties if the widgets are added to
       *     a {@link qx.ui.form.MModelSelection} widget.
       *
       * Both restrictions result of the fact, that the set models are deputies
       * for their widget.
       */
      model: {
        nullable: true,
        event: "changeModel",
        apply: "_applyModel",
        dereference: true
      }
    },
    members: {
      // apply method
      _applyModel: function _applyModel(value, old) {// Empty implementation
      }
    }
  });
  qx.ui.form.MModelProperty.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.RadioGroup": {}
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
   * Each object, which should be managed by a {@link RadioGroup} have to
   * implement this interface.
   */
  qx.Interface.define("qx.ui.form.IRadioItem", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the item was checked or unchecked */
      "changeValue": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set whether the item is checked
       *
       * @param value {Boolean} whether the item should be checked
       */
      setValue: function setValue(value) {},

      /**
       * Get whether the item is checked
       *
       * @return {Boolean} whether the item it checked
       */
      getValue: function getValue() {},

      /**
       * Set the radiogroup, which manages this item
       *
       * @param value {qx.ui.form.RadioGroup} The radiogroup, which should
       *     manage the item.
       */
      setGroup: function setGroup(value) {
        this.assertInstance(value, qx.ui.form.RadioGroup);
      },

      /**
       * Get the radiogroup, which manages this item
       *
       * @return {qx.ui.form.RadioGroup} The radiogroup, which manages the item.
       */
      getGroup: function getGroup() {}
    }
  });
  qx.ui.form.IRadioItem.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.IField": {
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
   * Form interface for all form widgets which have boolean as their primary
   * data type like a checkbox.
   */
  qx.Interface.define("qx.ui.form.IBooleanForm", {
    extend: qx.ui.form.IField,

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the value was modified */
      "changeValue": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        VALUE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the element's value.
       *
       * @param value {Boolean|null} The new value of the element.
       */
      setValue: function setValue(value) {
        return arguments.length == 1;
      },

      /**
       * Resets the element's value to its initial value.
       */
      resetValue: function resetValue() {},

      /**
       * The element's user set value.
       *
       * @return {Boolean|null} The value.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.IBooleanForm.$$dbClassInfo = $$dbClassInfo;
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Each object which wants to store data representative for the real item
   * should implement this interface.
   */
  qx.Interface.define("qx.ui.form.IModel", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the model data changes */
      "changeModel": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set the representative data for the item.
       *
       * @param value {var} The data.
       */
      setModel: function setModel(value) {},

      /**
       * Returns the representative data for the item
       *
       * @return {var} The data.
       */
      getModel: function getModel() {},

      /**
       * Sets the representative data to null.
       */
      resetModel: function resetModel() {}
    }
  });
  qx.ui.form.IModel.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Button": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.form.MModelProperty": {
        "require": true
      },
      "qx.ui.form.IRadioItem": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.IBooleanForm": {
        "require": true
      },
      "qx.ui.form.IModel": {
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
   * Radio buttons can be used in radio groups to allow to the user to select
   * exactly one item from a list. Radio groups are established by adding
   * radio buttons to a radio manager {@link qx.ui.form.RadioGroup}.
   *
   * Example:
   * <pre class="javascript">
   *   var container = new qx.ui.container.Composite(new qx.ui.layout.VBox);
   *
   *   var female = new qx.ui.form.RadioButton("female");
   *   var male = new qx.ui.form.RadioButton("male");
   *
   *   var mgr = new qx.ui.form.RadioGroup();
   *   mgr.add(female, male);
   *
   *   container.add(male);
   *   container.add(female);
   * </pre>
   */
  qx.Class.define("qx.ui.form.RadioButton", {
    extend: qx.ui.form.Button,
    include: [qx.ui.form.MForm, qx.ui.form.MModelProperty],
    implement: [qx.ui.form.IRadioItem, qx.ui.form.IForm, qx.ui.form.IBooleanForm, qx.ui.form.IModel],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String?null} An optional label for the radio button.
     */
    construct: function construct(label) {
      {
        this.assertArgumentsCount(arguments, 0, 1);
      }
      qx.ui.form.Button.constructor.call(this, label); // Add listeners

      this.addListener("execute", this._onExecute);
      this.addListener("keypress", this._onKeyPress);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
      group: {
        check: "qx.ui.form.RadioGroup",
        nullable: true,
        apply: "_applyGroup"
      },

      /** The value of the widget. True, if the widget is checked. */
      value: {
        check: "Boolean",
        nullable: true,
        event: "changeValue",
        apply: "_applyValue",
        init: false
      },
      // overridden
      appearance: {
        refine: true,
        init: "radiobutton"
      },
      // overridden
      allowGrowX: {
        refine: true,
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        checked: true,
        focused: true,
        invalid: true,
        hovered: true
      },
      // overridden (from MExecutable to keep the icon out of the binding)

      /**
       * @lint ignoreReferenceField(_bindableProperties)
       */
      _bindableProperties: ["enabled", "label", "toolTipText", "value", "menu"],

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyValue: function _applyValue(value, old) {
        value ? this.addState("checked") : this.removeState("checked");
      },

      /** The assigned {@link qx.ui.form.RadioGroup} which handles the switching between registered buttons */
      _applyGroup: function _applyGroup(value, old) {
        if (old) {
          old.remove(this);
        }

        if (value) {
          value.add(this);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT-HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for the "execute" event.
       *
       * Sets the property "checked" to true.
       *
       * @param e {qx.event.type.Event} execute event
       */
      _onExecute: function _onExecute(e) {
        var grp = this.getGroup();

        if (grp && grp.getAllowEmptySelection()) {
          this.toggleValue();
        } else {
          this.setValue(true);
        }
      },

      /**
       * Event listener for the "keyPress" event.
       *
       * Selects the previous RadioButton when pressing "Left" or "Up" and
       * Selects the next RadioButton when pressing "Right" and "Down"
       *
       * @param e {qx.event.type.KeySequence} KeyPress event
       */
      _onKeyPress: function _onKeyPress(e) {
        var grp = this.getGroup();

        if (!grp) {
          return;
        }

        switch (e.getKeyIdentifier()) {
          case "Left":
          case "Up":
            grp.selectPrevious();
            break;

          case "Right":
          case "Down":
            grp.selectNext();
            break;
        }
      }
    }
  });
  qx.ui.form.RadioButton.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.RadioButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.IRadioItem": {
        "require": true
      },
      "qx.ui.layout.Grid": {
        "construct": true
      },
      "qx.ui.basic.Label": {},
      "qx.ui.basic.Image": {},
      "qx.ui.form.Button": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A TabButton is the tapable part sitting on the {@link qx.ui.tabview.Page}.
   * By tapping on the TabButton the user can set a Page active.
   *
   * @childControl label {qx.ui.basic.Label} label of the tab button
   * @childControl icon {qx.ui.basic.Image} icon of the tab button
   * @childControl close-button {qx.ui.form.Button} close button of the tab button
   */
  qx.Class.define("qx.ui.tabview.TabButton", {
    extend: qx.ui.form.RadioButton,
    implement: qx.ui.form.IRadioItem,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.form.RadioButton.constructor.call(this);
      var layout = new qx.ui.layout.Grid(2, 0);
      layout.setRowAlign(0, "left", "middle");
      layout.setColumnAlign(0, "right", "middle");

      this._getLayout().dispose();

      this._setLayout(layout);

      this.initShowCloseButton();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired by {@link qx.ui.tabview.Page} if the close button is tapped.
       *
       * Event data: The tab button.
       */
      "close": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Indicates if the close button of a TabButton should be shown. */
      showCloseButton: {
        check: "Boolean",
        init: false,
        apply: "_applyShowCloseButton"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        checked: true
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      _applyIconPosition: function _applyIconPosition(value, old) {
        var children = {
          icon: this.getChildControl("icon"),
          label: this.getChildControl("label"),
          closeButton: this.getShowCloseButton() ? this.getChildControl("close-button") : null
        }; // Remove all children before adding them again

        for (var child in children) {
          if (children[child]) {
            this._remove(children[child]);
          }
        }

        switch (value) {
          case "top":
            this._add(children.label, {
              row: 3,
              column: 2
            });

            this._add(children.icon, {
              row: 1,
              column: 2
            });

            if (children.closeButton) {
              this._add(children.closeButton, {
                row: 0,
                column: 4
              });
            }

            break;

          case "bottom":
            this._add(children.label, {
              row: 1,
              column: 2
            });

            this._add(children.icon, {
              row: 3,
              column: 2
            });

            if (children.closeButton) {
              this._add(children.closeButton, {
                row: 0,
                column: 4
              });
            }

            break;

          case "left":
            this._add(children.label, {
              row: 0,
              column: 2
            });

            this._add(children.icon, {
              row: 0,
              column: 0
            });

            if (children.closeButton) {
              this._add(children.closeButton, {
                row: 0,
                column: 4
              });
            }

            break;

          case "right":
            this._add(children.label, {
              row: 0,
              column: 0
            });

            this._add(children.icon, {
              row: 0,
              column: 2
            });

            if (children.closeButton) {
              this._add(children.closeButton, {
                row: 0,
                column: 4
              });
            }

            break;
        }
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "label":
            var control = new qx.ui.basic.Label(this.getLabel());
            control.setAnonymous(true);

            this._add(control, {
              row: 0,
              column: 2
            });

            this._getLayout().setColumnFlex(2, 1);

            break;

          case "icon":
            control = new qx.ui.basic.Image(this.getIcon());
            control.setAnonymous(true);

            this._add(control, {
              row: 0,
              column: 0
            });

            break;

          case "close-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.setKeepActive(true);
            control.addListener("tap", this._onCloseButtonTap, this);

            this._add(control, {
              row: 0,
              column: 4
            });

            if (!this.getShowCloseButton()) {
              control.exclude();
            }

            break;
        }

        return control || qx.ui.tabview.TabButton.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Fires a "close" event when the close button is tapped.
       */
      _onCloseButtonTap: function _onCloseButtonTap() {
        this.fireDataEvent("close", this);
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyShowCloseButton: function _applyShowCloseButton(value, old) {
        if (value) {
          this._showChildControl("close-button");
        } else {
          this._excludeChildControl("close-button");
        }
      },
      // property apply
      _applyCenter: function _applyCenter(value) {
        var layout = this._getLayout();

        if (value) {
          layout.setColumnAlign(2, "center", "middle");
        } else {
          layout.setColumnAlign(2, "left", "middle");
        }
      }
    }
  });
  qx.ui.tabview.TabButton.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Button": {
        "construct": true,
        "require": true
      },
      "qx.event.AcceleratingTimer": {
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
       * Andreas Ecker (ecker)
       * Martin Wittemann (martinwittemann)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The RepeatButton is a special button, which fires repeatedly {@link #execute}
   * events, while a button is pressed on the button. The initial delay
   * and the interval time can be set using the properties {@link #firstInterval}
   * and {@link #interval}. The {@link #execute} events will be fired in a shorter
   * amount of time if a button is hold, until the min {@link #minTimer}
   * is reached. The {@link #timerDecrease} property sets the amount of milliseconds
   * which will decreased after every firing.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.RepeatButton("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button is executed");
   *   }, this);
   *
   *   this.getRoot.add(button);
   * </pre>
   *
   * This example creates a button with the label "Hello World" and attaches an
   * event listener to the {@link #execute} event.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/repeatbutton.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.RepeatButton", {
    extend: qx.ui.form.Button,

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     */
    construct: function construct(label, icon) {
      qx.ui.form.Button.constructor.call(this, label, icon); // create the timer and add the listener

      this.__timer = new qx.event.AcceleratingTimer();

      this.__timer.addListener("interval", this._onInterval, this);
    },
    events: {
      /**
       * This event gets dispatched with every interval. The timer gets executed
       * as long as the user holds down a button.
       */
      "execute": "qx.event.type.Event",

      /**
       * This event gets dispatched when the button is pressed.
       */
      "press": "qx.event.type.Event",

      /**
       * This event gets dispatched when the button is released.
       */
      "release": "qx.event.type.Event"
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
      minTimer: {
        check: "Integer",
        init: 20
      },

      /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
      timerDecrease: {
        check: "Integer",
        init: 2
      }
    },
    members: {
      __executed: null,
      __timer: null,

      /**
       * Calling this function is like a tap from the user on the
       * button with all consequences.
       * <span style='color: red'>Be sure to call the {@link #release} function.</span>
       *
       */
      press: function press() {
        // only if the button is enabled
        if (this.isEnabled()) {
          // if the state pressed must be applied (first call)
          if (!this.hasState("pressed")) {
            // start the timer
            this.__startInternalTimer();
          } // set the states


          this.removeState("abandoned");
          this.addState("pressed");
        }
      },

      /**
       * Calling this function is like a release from the user on the
       * button with all consequences.
       * Usually the {@link #release} function will be called before the call of
       * this function.
       *
       * @param fireExecuteEvent {Boolean?true} flag which signals, if an event should be fired
       */
      release: function release(fireExecuteEvent) {
        // only if the button is enabled
        if (!this.isEnabled()) {
          return;
        } // only if the button is pressed


        if (this.hasState("pressed")) {
          // if the button has not been executed
          if (!this.__executed) {
            this.execute();
          }
        } // remove button states


        this.removeState("pressed");
        this.removeState("abandoned"); // stop the repeat timer and therefore the execution

        this.__stopInternalTimer();
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyEnabled: function _applyEnabled(value, old) {
        qx.ui.form.RepeatButton.prototype._applyEnabled.base.call(this, value, old);

        if (!value) {
          if (this.isCapturing()) {
            // also release capture because out event is missing on iOS
            this.releaseCapture();
          } // remove button states


          this.removeState("pressed");
          this.removeState("abandoned"); // stop the repeat timer and therefore the execution

          this.__stopInternalTimer();
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
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

          this.__timer.start();
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

          this.__timer.stop();
        }
      },

      /**
       * Callback method for the "pointerdown" method.
       *
       * Sets the interval of the timer (value of firstInterval property) and
       * starts the timer. Additionally removes the state "abandoned" and adds the
       * state "pressed".
       *
       * @param e {qx.event.type.Pointer} pointerdown event
       */
      _onPointerDown: function _onPointerDown(e) {
        if (!e.isLeftPressed()) {
          return;
        } // Activate capturing if the button get a pointerout while
        // the button is pressed.


        this.capture();

        this.__startInternalTimer();

        e.stopPropagation();
      },

      /**
       * Callback method for the "pointerup" event.
       *
       * Handles the case that the user is releasing a button
       * before the timer interval method got executed. This way the
       * "execute" method get executed at least one time.
       *
       * @param e {qx.event.type.Pointer} pointerup event
       */
      _onPointerUp: function _onPointerUp(e) {
        this.releaseCapture();

        if (!this.hasState("abandoned")) {
          this.addState("hovered");

          if (this.hasState("pressed") && !this.__executed) {
            this.execute();
          }
        }

        this.__stopInternalTimer();

        e.stopPropagation();
      },
      // Nothing to do, 'execute' is already fired by _onPointerUp.
      _onTap: function _onTap(e) {},

      /**
       * Listener method for "keyup" event.
       *
       * Removes "abandoned" and "pressed" state (if "pressed" state is set)
       * for the keys "Enter" or "Space" and stops the internal timer
       * (same like pointer up).
       *
       * @param e {Event} Key event
       */
      _onKeyUp: function _onKeyUp(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            if (this.hasState("pressed")) {
              if (!this.__executed) {
                this.execute();
              }

              this.removeState("pressed");
              this.removeState("abandoned");
              e.stopPropagation();

              this.__stopInternalTimer();
            }

        }
      },

      /**
       * Listener method for "keydown" event.
       *
       * Removes "abandoned" and adds "pressed" state
       * for the keys "Enter" or "Space". It also starts
       * the internal timer (same like pointerdown).
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

            this.__startInternalTimer();

        }
      },

      /**
       * Callback for the interval event.
       *
       * Stops the timer and starts it with a new interval
       * (value of the "interval" property - value of the "timerDecrease" property).
       * Dispatches the "execute" event.
       *
       * @param e {qx.event.type.Event} interval event
       */
      _onInterval: function _onInterval(e) {
        this.__executed = true;
        this.fireEvent("execute");
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL TIMER
      ---------------------------------------------------------------------------
      */

      /**
       * Starts the internal timer which causes firing of execution
       * events in an interval. It also presses the button.
       *
       */
      __startInternalTimer: function __startInternalTimer() {
        this.fireEvent("press");
        this.__executed = false;

        this.__timer.set({
          interval: this.getInterval(),
          firstInterval: this.getFirstInterval(),
          minimum: this.getMinTimer(),
          decrease: this.getTimerDecrease()
        }).start();

        this.removeState("abandoned");
        this.addState("pressed");
      },

      /**
       * Stops the internal timer and releases the button.
       *
       */
      __stopInternalTimer: function __stopInternalTimer() {
        this.fireEvent("release");

        this.__timer.stop();

        this.removeState("abandoned");
        this.removeState("pressed");
      }
    },

    /*
      *****************************************************************************
         DESTRUCTOR
      *****************************************************************************
      */
    destruct: function destruct() {
      this._disposeObjects("__timer");
    }
  });
  qx.ui.form.RepeatButton.$$dbClassInfo = $$dbClassInfo;
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

//# sourceMappingURL=part-boot-bundle-30.js.map
