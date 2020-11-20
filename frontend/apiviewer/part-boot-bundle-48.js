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
      "qx.ui.core.ISingleSelection": {},
      "qx.data.marshal.Json": {},
      "qx.data.SingleValueBinding": {},
      "qx.data.controller.Object": {},
      "qx.ui.form.IModelSelection": {}
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
   * <h2>Form Controller</h2>
   *
   * *General idea*
   *
   * The form controller is responsible for connecting a form with a model. If no
   * model is given, a model can be created. This created model will fit exactly
   * to the given form and can be used for serialization. All the connections
   * between the form items and the model are handled by an internal
   * {@link qx.data.controller.Object}.
   *
   * *Features*
   *
   * * Connect a form to a model (bidirectional)
   * * Create a model for a given form
   *
   * *Usage*
   *
   * The controller only works if both a controller and a model are set.
   * Creating a model will automatically set the created model.
   *
   * *Cross reference*
   *
   * * If you want to bind single values, use {@link qx.data.controller.Object}
   * * If you want to bind a list like widget, use {@link qx.data.controller.List}
   * * If you want to bind a tree widget, use {@link qx.data.controller.Tree}
   */
  qx.Class.define("qx.data.controller.Form", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /**
     * @param model {qx.core.Object | null} The model to bind the target to. The
     *   given object will be set as {@link #model} property.
     * @param target {qx.ui.form.Form | null} The form which contains the form
     *   items. The given form will be set as {@link #target} property.
     * @param selfUpdate {Boolean?false} If set to true, you need to call the
     *   {@link #updateModel} method to get the data in the form to the model.
     *   Otherwise, the data will be synced automatically on every change of
     *   the form.
     */
    construct: function construct(model, target, selfUpdate) {
      qx.core.Object.constructor.call(this);
      this._selfUpdate = !!selfUpdate;
      this.__bindingOptions = {};

      if (model != null) {
        this.setModel(model);
      }

      if (target != null) {
        this.setTarget(target);
      }
    },
    properties: {
      /** Data object containing the data which should be shown in the target. */
      model: {
        check: "qx.core.Object",
        apply: "_applyModel",
        event: "changeModel",
        nullable: true,
        dereference: true
      },

      /** The target widget which should show the data. */
      target: {
        check: "qx.ui.form.Form",
        apply: "_applyTarget",
        event: "changeTarget",
        nullable: true,
        init: null,
        dereference: true
      }
    },
    members: {
      __objectController: null,
      __bindingOptions: null,

      /**
       * The form controller uses for setting up the bindings the fundamental
       * binding layer, the {@link qx.data.SingleValueBinding}. To achieve a
       * binding in both directions, two bindings are needed. With this method,
       * you have the opportunity to set the options used for the bindings.
       *
       * @param name {String} The name of the form item for which the options
       *   should be used.
       * @param model2target {Map} Options map used for the binding from model
       *   to target. The possible options can be found in the
       *   {@link qx.data.SingleValueBinding} class.
       * @param target2model {Map} Options map used for the binding from target
       *   to model. The possible options can be found in the
       *   {@link qx.data.SingleValueBinding} class.
       */
      addBindingOptions: function addBindingOptions(name, model2target, target2model) {
        this.__bindingOptions[name] = [model2target, target2model]; // return if not both, model and target are given

        if (this.getModel() == null || this.getTarget() == null) {
          return;
        } // renew the affected binding


        var item = this.getTarget().getItems()[name];
        var targetProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value"; // remove the binding

        this.__objectController.removeTarget(item, targetProperty, name); // set up the new binding with the options


        this.__objectController.addTarget(item, targetProperty, name, !this._selfUpdate, model2target, target2model);
      },

      /**
       * Creates and sets a model using the {@link qx.data.marshal.Json} object.
       * Remember that this method can only work if the form is set. The created
       * model will fit exactly that form. Changing the form or adding an item to
       * the form will need a new model creation.
       *
       * @param includeBubbleEvents {Boolean} Whether the model should support
       *   the bubbling of change events or not.
       * @return {qx.core.Object} The created model.
       */
      createModel: function createModel(includeBubbleEvents) {
        var target = this.getTarget(); // throw an error if no target is set

        if (target == null) {
          throw new Error("No target is set.");
        }

        var items = target.getItems();
        var data = {};

        for (var name in items) {
          var names = name.split(".");
          var currentData = data;

          for (var i = 0; i < names.length; i++) {
            // if its the last item
            if (i + 1 == names.length) {
              // check if the target is a selection
              var clazz = items[name].constructor;
              var itemValue = null;

              if (qx.Class.hasInterface(clazz, qx.ui.core.ISingleSelection)) {
                // use the first element of the selection because passed to the
                // marshaler (and its single selection anyway) [BUG #3541]
                itemValue = items[name].getModelSelection().getItem(0) || null;
              } else {
                itemValue = items[name].getValue();
              } // call the converter if available [BUG #4382]


              if (this.__bindingOptions[name] && this.__bindingOptions[name][1]) {
                itemValue = this.__bindingOptions[name][1].converter(itemValue);
              }

              currentData[names[i]] = itemValue;
            } else {
              // if its not the last element, check if the object exists
              if (!currentData[names[i]]) {
                currentData[names[i]] = {};
              }

              currentData = currentData[names[i]];
            }
          }
        }

        var model = qx.data.marshal.Json.createModel(data, includeBubbleEvents);
        this.setModel(model);
        return model;
      },

      /**
       * Responsible for syncing the data from entered in the form to the model.
       * Please keep in mind that this method only works if you create the form
       * with <code>selfUpdate</code> set to true. Otherwise, this method will
       * do nothing because updates will be synced automatically on every
       * change.
       */
      updateModel: function updateModel() {
        // only do stuff if self update is enabled and a model or target is set
        if (!this._selfUpdate || !this.getModel() || !this.getTarget()) {
          return;
        }

        var items = this.getTarget().getItems();

        for (var name in items) {
          var item = items[name];
          var sourceProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";
          var options = this.__bindingOptions[name];
          options = options && this.__bindingOptions[name][1];
          qx.data.SingleValueBinding.updateTarget(item, sourceProperty, this.getModel(), name, options);
        }
      },
      // apply method
      _applyTarget: function _applyTarget(value, old) {
        // if an old target is given, remove the binding
        if (old != null) {
          this.__tearDownBinding(old);
        } // do nothing if no target is set


        if (this.getModel() == null) {
          return;
        } // target and model are available


        if (value != null) {
          this.__setUpBinding();
        }
      },
      // apply method
      _applyModel: function _applyModel(value, old) {
        // set the model to null to reset all items before removing them
        if (this.__objectController != null && value == null) {
          this.__objectController.setModel(null);
        } // first, get rid off all bindings (avoids wrong data population)


        if (this.__objectController != null && this.getTarget() != null) {
          var items = this.getTarget().getItems();

          for (var name in items) {
            var item = items[name];
            var targetProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";

            this.__objectController.removeTarget(item, targetProperty, name);
          }
        } // set the model of the object controller if available


        if (this.__objectController != null) {
          this.__objectController.setModel(value);
        } // do nothing is no target is set


        if (this.getTarget() == null) {
          return;
        } else {
          // if form was validated with errors and model changes
          // the errors should be cleared see #8977
          this.getTarget().getValidationManager().reset();
        } // model and target are available


        if (value != null) {
          this.__setUpBinding();
        }
      },

      /**
       * Internal helper for setting up the bindings using
       * {@link qx.data.controller.Object#addTarget}. All bindings are set
       * up bidirectional.
       */
      __setUpBinding: function __setUpBinding() {
        // create the object controller
        if (this.__objectController == null) {
          this.__objectController = new qx.data.controller.Object(this.getModel());
        } // get the form items


        var items = this.getTarget().getItems(); // connect all items

        for (var name in items) {
          var item = items[name];
          var targetProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";
          var options = this.__bindingOptions[name]; // try to bind all given items in the form

          try {
            if (options == null) {
              this.__objectController.addTarget(item, targetProperty, name, !this._selfUpdate);
            } else {
              this.__objectController.addTarget(item, targetProperty, name, !this._selfUpdate, options[0], options[1]);
            } // ignore not working items

          } catch (ex) {
            {
              this.warn("Could not bind property " + name + " of " + this.getModel() + ":\n" + ex.stack);
            }
          }
        } // make sure the initial values of the model are taken for resetting [BUG #5874]


        this.getTarget().redefineResetter();
      },

      /**
       * Internal helper for removing all set up bindings using
       * {@link qx.data.controller.Object#removeTarget}.
       *
       * @param oldTarget {qx.ui.form.Form} The form which has been removed.
       */
      __tearDownBinding: function __tearDownBinding(oldTarget) {
        // do nothing if the object controller has not been created
        if (this.__objectController == null) {
          return;
        } // get the items


        var items = oldTarget.getItems(); // disconnect all items

        for (var name in items) {
          var item = items[name];
          var targetProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";

          this.__objectController.removeTarget(item, targetProperty, name);
        }
      },

      /**
       * Returns whether the given item implements
       * {@link qx.ui.core.ISingleSelection} and
       * {@link qx.ui.form.IModelSelection}.
       *
       * @param item {qx.ui.form.IForm} The form item to check.
       *
       * @return {Boolean} true, if given item fits.
       */
      __isModelSelectable: function __isModelSelectable(item) {
        return qx.Class.hasInterface(item.constructor, qx.ui.core.ISingleSelection) && qx.Class.hasInterface(item.constructor, qx.ui.form.IModelSelection);
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      // dispose the object controller because the bindings need to be removed
      if (this.__objectController) {
        this.__objectController.dispose();
      }
    }
  });
  qx.data.controller.Form.$$dbClassInfo = $$dbClassInfo;
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
   * Form interface for all form widgets which have date as their primary
   * data type like datechooser's.
   */
  qx.Interface.define("qx.ui.form.IDateForm", {
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
       * @param value {Date|null} The new value of the element.
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
       * @return {Date|null} The value.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.IDateForm.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.IDateForm": {
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.event.type.Focus": {
        "construct": true
      },
      "qx.locale.Date": {},
      "qx.util.format.DateFormat": {},
      "qx.locale.Manager": {},
      "qx.ui.form.TextField": {},
      "qx.ui.form.Button": {},
      "qx.ui.control.DateChooser": {},
      "qx.ui.popup.Popup": {},
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * A *date field* is like a combo box with the date as popup. As button to
   * open the calendar a calendar icon is shown at the right to the textfield.
   *
   * To be conform with all form widgets, the {@link qx.ui.form.IForm} interface
   * is implemented.
   *
   * The following example creates a date field and sets the current
   * date as selected.
   *
   * <pre class='javascript'>
   * var dateField = new qx.ui.form.DateField();
   * this.getRoot().add(dateField, {top: 20, left: 20});
   * dateField.setValue(new Date());
   * </pre>
   *
   * @childControl list {qx.ui.control.DateChooser} date chooser component
   * @childControl popup {qx.ui.popup.Popup} popup which shows the list control
   * @childControl textfield {qx.ui.form.TextField} text field for manual date entry
   * @childControl button {qx.ui.form.Button} button that opens the list control
   */
  qx.Class.define("qx.ui.form.DateField", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.form.MForm],
    implement: [qx.ui.form.IForm, qx.ui.form.IDateForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // set the layout

      var layout = new qx.ui.layout.HBox();

      this._setLayout(layout);

      layout.setAlignY("middle"); // text field

      var textField = this._createChildControl("textfield");

      this._createChildControl("button"); // register listeners


      this.addListener("tap", this._onTap, this);
      this.addListener("blur", this._onBlur, this); // forward the focusin and focusout events to the textfield. The textfield
      // is not focusable so the events need to be forwarded manually.

      this.addListener("focusin", function (e) {
        textField.fireNonBubblingEvent("focusin", qx.event.type.Focus);
      }, this);
      this.addListener("focusout", function (e) {
        textField.fireNonBubblingEvent("focusout", qx.event.type.Focus);
      }, this); // initializes the DateField with the default format

      this._setDefaultDateFormat(); // adds a locale change listener


      this._addLocaleChangeListener();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Whenever the value is changed this event is fired
       *
       *  Event data: The new text value of the field.
       */
      "changeValue": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The formatter, which converts the selected date to a string. **/
      dateFormat: {
        check: "qx.util.format.DateFormat",
        apply: "_applyDateFormat"
      },

      /**
       * String value which will be shown as a hint if the field is all of:
       * unset, unfocused and enabled. Set to null to not show a placeholder
       * text.
       */
      placeholder: {
        check: "String",
        nullable: true,
        apply: "_applyPlaceholder"
      },
      // overridden
      appearance: {
        refine: true,
        init: "datefield"
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },
      // overridden
      width: {
        refine: true,
        init: 120
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    statics: {
      __dateFormat: null,
      __formatter: null,

      /**
       * Get the shared default date formatter
       *
       * @return {qx.util.format.DateFormat} The shared date formatter
       */
      getDefaultDateFormatter: function getDefaultDateFormatter() {
        var format = qx.locale.Date.getDateFormat("medium").toString();

        if (format == this.__dateFormat) {
          return this.__formatter;
        }

        if (this.__formatter) {
          this.__formatter.dispose();
        }

        this.__formatter = new qx.util.format.DateFormat(format, qx.locale.Manager.getInstance().getLocale());
        this.__dateFormat = format;
        return this.__formatter;
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __localeListenerId: null,

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        invalid: true
      },

      /*
      ---------------------------------------------------------------------------
        PROTECTED METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the default date format which is returned by
       * {@link #getDefaultDateFormatter}. You can override this method to
       * define your own default format.
       */
      _setDefaultDateFormat: function _setDefaultDateFormat() {
        this.setDateFormat(qx.ui.form.DateField.getDefaultDateFormatter());
      },

      /**
       * Checks for "qx.dynlocale" and adds a listener to the locale changes.
       * On every change, {@link #_setDefaultDateFormat} is called to reinitialize
       * the format. You can easily override that method to prevent that behavior.
       */
      _addLocaleChangeListener: function _addLocaleChangeListener() {
        // listen for locale changes
        {
          this.__localeListenerId = qx.locale.Manager.getInstance().addListener("changeLocale", function () {
            this._setDefaultDateFormat();
          }, this);
        }
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC METHODS
      ---------------------------------------------------------------------------
      */

      /**
      * This method sets the date, which will be formatted according to
      * #dateFormat to the date field. It will also select the date in the
      * calendar popup.
      *
      * @param value {Date} The date to set.
       */
      setValue: function setValue(value) {
        // set the date to the textfield
        var textField = this.getChildControl("textfield");
        textField.setValue(this.getDateFormat().format(value)); // set the date in the datechooser

        var dateChooser = this.getChildControl("list");
        dateChooser.setValue(value);
      },

      /**
       * Returns the current set date, parsed from the input-field
       * corresponding to the {@link #dateFormat}.
       * If the given text could not be parsed, <code>null</code> will be returned.
       *
       * @return {Date} The currently set date.
       */
      getValue: function getValue() {
        // get the value of the textfield
        var textfieldValue = this.getChildControl("textfield").getValue(); // return the parsed date

        try {
          if (textfieldValue == null || textfieldValue.length == 0) {
            return null;
          }

          return this.getDateFormat().parse(textfieldValue);
        } catch (ex) {
          return null;
        }
      },

      /**
       * Resets the DateField. The textfield will be empty and the datechooser
       * will also have no selection.
       */
      resetValue: function resetValue() {
        // set the date to the textfield
        var textField = this.getChildControl("textfield");
        textField.setValue(""); // set the date in the datechooser

        var dateChooser = this.getChildControl("list");
        dateChooser.setValue(null);
      },

      /*
      ---------------------------------------------------------------------------
        LIST STUFF
      ---------------------------------------------------------------------------
      */

      /**
       * Shows the date chooser popup.
       */
      open: function open() {
        var popup = this.getChildControl("popup");
        popup.placeToWidget(this, true);
        popup.show();
      },

      /**
       * Hides the date chooser popup.
       */
      close: function close() {
        this.getChildControl("popup").hide();
      },

      /**
       * Toggles the date chooser popup visibility.
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
        PROPERTY APPLY METHODS
      ---------------------------------------------------------------------------
      */
      // property apply routine
      _applyDateFormat: function _applyDateFormat(value, old) {
        // if old is undefined or null do nothing
        if (!old) {
          return;
        } // get the date with the old date format


        try {
          var textfield = this.getChildControl("textfield");
          var dateStr = textfield.getValue();

          if (dateStr != null) {
            var currentDate = old.parse(dateStr);
            textfield.setValue(value.format(currentDate));
          }
        } catch (ex) {// do nothing if the former date could not be parsed
        }
      },
      // property apply routine
      _applyPlaceholder: function _applyPlaceholder(value, old) {
        this.getChildControl("textfield").setPlaceholder(value);
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "textfield":
            control = new qx.ui.form.TextField();
            control.setFocusable(false);
            control.addState("inner");
            control.addListener("changeValue", this._onTextFieldChangeValue, this);
            control.addListener("blur", this.close, this);

            this._add(control, {
              flex: 1
            });

            break;

          case "button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.setKeepActive(true);
            control.addState("inner");
            control.addListener("execute", this.toggle, this);

            this._add(control);

            break;

          case "list":
            control = new qx.ui.control.DateChooser();
            control.setFocusable(false);
            control.setKeepFocus(true);
            control.addListener("execute", this._onChangeDate, this);
            break;

          case "popup":
            control = new qx.ui.popup.Popup(new qx.ui.layout.VBox());
            control.setAutoHide(false);
            control.add(this.getChildControl("list"));
            control.addListener("pointerup", this._onChangeDate, this);
            control.addListener("changeVisibility", this._onPopupChangeVisibility, this);
            break;
        }

        return control || qx.ui.form.DateField.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler method which handles the tap on the calender popup.
       *
       * @param e {qx.event.type.Pointer} The pointer event.
       */
      _onChangeDate: function _onChangeDate(e) {
        var textField = this.getChildControl("textfield");
        var selectedDate = this.getChildControl("list").getValue();
        textField.setValue(this.getDateFormat().format(selectedDate));
        this.close();
      },

      /**
       * Toggles the popup's visibility.
       *
       * @param e {qx.event.type.Pointer} Pointer tap event
       */
      _onTap: function _onTap(e) {
        this.close();
      },

      /**
       * Handler for the blur event of the current widget.
       *
       * @param e {qx.event.type.Focus} The blur event.
       */
      _onBlur: function _onBlur(e) {
        this.close();
      },

      /**
       * Handler method which handles the key press. It forwards all key event
       * to the opened date chooser except the escape key event. Escape closes
       * the popup.
       * If the list is cloned, all key events will not be processed further.
       *
       * @param e {qx.event.type.KeySequence} Keypress event
       */
      _onKeyPress: function _onKeyPress(e) {
        // get the key identifier
        var iden = e.getKeyIdentifier();

        if (iden == "Down" && e.isAltPressed()) {
          this.toggle();
          e.stopPropagation();
          return;
        } // if the popup is closed, ignore all


        var popup = this.getChildControl("popup");

        if (popup.getVisibility() == "hidden") {
          return;
        } // hide the list always on escape


        if (iden == "Escape") {
          this.close();
          e.stopPropagation();
          return;
        } // Stop navigation keys when popup is open


        if (iden === "Left" || iden === "Right" || iden === "Down" || iden === "Up") {
          e.preventDefault();
        } // forward the rest of the events to the date chooser


        this.getChildControl("list").handleKeyPress(e);
      },

      /**
       * Redirects changeVisibility event from the list to this widget.
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onPopupChangeVisibility: function _onPopupChangeVisibility(e) {
        e.getData() == "visible" ? this.addState("popupOpen") : this.removeState("popupOpen"); // Synchronize the chooser with the current value on every
        // opening of the popup. This is needed when the value has been
        // modified and not saved yet (e.g. no blur)

        var popup = this.getChildControl("popup");

        if (popup.isVisible()) {
          var chooser = this.getChildControl("list");
          var date = this.getValue();
          chooser.setValue(date);
        }
      },

      /**
       * Reacts on value changes of the text field and syncs the
       * value to the combobox.
       *
       * @param e {qx.event.type.Data} Change event
       */
      _onTextFieldChangeValue: function _onTextFieldChangeValue(e) {
        // Apply to popup
        var date = this.getValue();

        if (date != null) {
          var list = this.getChildControl("list");
          list.setValue(date);
        } // Fire event


        this.fireDataEvent("changeValue", this.getValue());
      },

      /**
       * Checks if the textfield of the DateField is empty.
       *
       * @return {Boolean} True, if the textfield of the DateField is empty.
       */
      isEmpty: function isEmpty() {
        var value = this.getChildControl("textfield").getValue();
        return value == null || value == "";
      },
      // overridden
      focus: function focus() {
        qx.ui.form.DateField.prototype.focus.base.call(this);
        this.getChildControl("textfield").getFocusElement().focus();
      }
    },
    destruct: function destruct() {
      // listen for locale changes
      {
        if (this.__localeListenerId) {
          qx.locale.Manager.getInstance().removeListenerById(this.__localeListenerId);
        }
      }
    }
  });
  qx.ui.form.DateField.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.INumberForm": {
        "require": true
      },
      "qx.ui.form.IRange": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.core.MContentPadding": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.layout.Grid": {
        "construct": true
      },
      "qx.locale.Manager": {
        "construct": true
      },
      "qx.event.type.Focus": {
        "construct": true
      },
      "qx.ui.form.TextField": {},
      "qx.ui.form.RepeatButton": {},
      "qx.locale.Number": {},
      "qx.lang.String": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A *spinner* is a control that allows you to adjust a numerical value,
   * typically within an allowed range. An obvious example would be to specify the
   * month of a year as a number in the range 1 - 12.
   *
   * To do so, a spinner encompasses a field to display the current value (a
   * textfield) and controls such as up and down buttons to change that value. The
   * current value can also be changed by editing the display field directly, or
   * using mouse wheel and cursor keys.
   *
   * An optional {@link #numberFormat} property allows you to control the format of
   * how a value can be entered and will be displayed.
   *
   * A brief, but non-trivial example:
   *
   * <pre class='javascript'>
   * var s = new qx.ui.form.Spinner();
   * s.set({
   *   maximum: 3000,
   *   minimum: -3000
   * });
   * var nf = new qx.util.format.NumberFormat();
   * nf.setMaximumFractionDigits(2);
   * s.setNumberFormat(nf);
   * </pre>
   *
   * A spinner instance without any further properties specified in the
   * constructor or a subsequent *set* command will appear with default
   * values and behaviour.
   *
   * @childControl textfield {qx.ui.form.TextField} holds the current value of the spinner
   * @childControl upbutton {qx.ui.form.Button} button to increase the value
   * @childControl downbutton {qx.ui.form.Button} button to decrease the value
   *
   */
  qx.Class.define("qx.ui.form.Spinner", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.INumberForm, qx.ui.form.IRange, qx.ui.form.IForm],
    include: [qx.ui.core.MContentPadding, qx.ui.form.MForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param min {Number} Minimum value
     * @param value {Number} Current value
     * @param max {Number} Maximum value
     */
    construct: function construct(min, value, max) {
      qx.ui.core.Widget.constructor.call(this); // MAIN LAYOUT

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(0, 1);
      layout.setRowFlex(0, 1);
      layout.setRowFlex(1, 1);

      this._setLayout(layout); // EVENTS


      this.addListener("keydown", this._onKeyDown, this);
      this.addListener("keyup", this._onKeyUp, this);
      this.addListener("roll", this._onRoll, this);
      {
        qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
      } // CREATE CONTROLS

      var textField = this._createChildControl("textfield");

      this._createChildControl("upbutton");

      this._createChildControl("downbutton"); // INITIALIZATION


      if (min != null) {
        this.setMinimum(min);
      }

      if (max != null) {
        this.setMaximum(max);
      }

      if (value !== undefined) {
        this.setValue(value);
      } else {
        this.initValue();
      } // forward the focusin and focusout events to the textfield. The textfield
      // is not focusable so the events need to be forwarded manually.


      this.addListener("focusin", function (e) {
        textField.fireNonBubblingEvent("focusin", qx.event.type.Focus);
      }, this);
      this.addListener("focusout", function (e) {
        textField.fireNonBubblingEvent("focusout", qx.event.type.Focus);
      }, this);
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
        init: "spinner"
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /** The amount to increment on each event (keypress or pointerdown) */
      singleStep: {
        check: "Number",
        init: 1
      },

      /** The amount to increment on each pageup/pagedown keypress */
      pageStep: {
        check: "Number",
        init: 10
      },

      /** minimal value of the Range object */
      minimum: {
        check: "Number",
        apply: "_applyMinimum",
        init: 0,
        event: "changeMinimum"
      },

      /** The value of the spinner. */
      value: {
        check: "this._checkValue(value)",
        nullable: true,
        apply: "_applyValue",
        init: 0,
        event: "changeValue"
      },

      /** maximal value of the Range object */
      maximum: {
        check: "Number",
        apply: "_applyMaximum",
        init: 100,
        event: "changeMaximum"
      },

      /** whether the value should wrap around */
      wrap: {
        check: "Boolean",
        init: false,
        apply: "_applyWrap"
      },

      /** Controls whether the textfield of the spinner is editable or not */
      editable: {
        check: "Boolean",
        init: true,
        apply: "_applyEditable"
      },

      /** Controls the display of the number in the textfield */
      numberFormat: {
        check: "qx.util.format.NumberFormat",
        apply: "_applyNumberFormat",
        nullable: true
      },
      // overridden
      allowShrinkY: {
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
      /** Saved last value in case invalid text is entered */
      __lastValidValue: null,

      /** Whether the page-up button has been pressed */
      __pageUpMode: false,

      /** Whether the page-down button has been pressed */
      __pageDownMode: false,

      /*
      ---------------------------------------------------------------------------
        WIDGET INTERNALS
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "textfield":
            control = new qx.ui.form.TextField();
            control.setFilter(this._getFilterRegExp());
            control.addState("inner");
            control.setWidth(40);
            control.setFocusable(false);
            control.addListener("changeValue", this._onTextChange, this);

            this._add(control, {
              column: 0,
              row: 0,
              rowSpan: 2
            });

            break;

          case "upbutton":
            control = new qx.ui.form.RepeatButton();
            control.addState("inner");
            control.setFocusable(false);
            control.addListener("execute", this._countUp, this);

            this._add(control, {
              column: 1,
              row: 0
            });

            break;

          case "downbutton":
            control = new qx.ui.form.RepeatButton();
            control.addState("inner");
            control.setFocusable(false);
            control.addListener("execute", this._countDown, this);

            this._add(control, {
              column: 1,
              row: 1
            });

            break;
        }

        return control || qx.ui.form.Spinner.prototype._createChildControlImpl.base.call(this, id);
      },

      /**
       * Returns the regular expression used as the text field's filter
       *
       * @return {RegExp} The filter RegExp.
       */
      _getFilterRegExp: function _getFilterRegExp() {
        var decimalSeparator, groupSeparator, locale;

        if (this.getNumberFormat() !== null) {
          locale = this.getNumberFormat().getLocale();
        } else {
          locale = qx.locale.Manager.getInstance().getLocale();
        }

        decimalSeparator = qx.locale.Number.getDecimalSeparator(locale);
        groupSeparator = qx.locale.Number.getGroupSeparator(locale);
        var prefix = "";
        var postfix = "";

        if (this.getNumberFormat() !== null) {
          prefix = this.getNumberFormat().getPrefix() || "";
          postfix = this.getNumberFormat().getPostfix() || "";
        }

        var filterRegExp = new RegExp("[0-9" + qx.lang.String.escapeRegexpChars(decimalSeparator) + qx.lang.String.escapeRegexpChars(groupSeparator) + qx.lang.String.escapeRegexpChars(prefix) + qx.lang.String.escapeRegexpChars(postfix) + "\-]");
        return filterRegExp;
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        invalid: true
      },
      // overridden
      tabFocus: function tabFocus() {
        var field = this.getChildControl("textfield");
        field.getFocusElement().focus();
        field.selectAllText();
      },

      /*
      ---------------------------------------------------------------------------
        APPLY METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Apply routine for the minimum property.
       *
       * It sets the value of the spinner to the maximum of the current spinner
       * value and the given min property value.
       *
       * @param value {Number} The new value of the min property
       * @param old {Number} The old value of the min property
       */
      _applyMinimum: function _applyMinimum(value, old) {
        if (this.getMaximum() < value) {
          this.setMaximum(value);
        }

        if (this.getValue() < value) {
          this.setValue(value);
        } else {
          this._updateButtons();
        }
      },

      /**
       * Apply routine for the maximum property.
       *
       * It sets the value of the spinner to the minimum of the current spinner
       * value and the given max property value.
       *
       * @param value {Number} The new value of the max property
       * @param old {Number} The old value of the max property
       */
      _applyMaximum: function _applyMaximum(value, old) {
        if (this.getMinimum() > value) {
          this.setMinimum(value);
        }

        if (this.getValue() > value) {
          this.setValue(value);
        } else {
          this._updateButtons();
        }
      },
      // overridden
      _applyEnabled: function _applyEnabled(value, old) {
        qx.ui.form.Spinner.prototype._applyEnabled.base.call(this, value, old);

        this._updateButtons();
      },

      /**
       * Check whether the value being applied is allowed.
       *
       * If you override this to change the allowed type, you will also
       * want to override {@link #_applyValue}, {@link #_applyMinimum},
       * {@link #_applyMaximum}, {@link #_countUp}, {@link #_countDown}, and
       * {@link #_onTextChange} methods as those cater specifically to numeric
       * values.
       *
       * @param value {var}
       *   The value being set
       * @return {Boolean}
       *   <i>true</i> if the value is allowed;
       *   <i>false> otherwise.
       */
      _checkValue: function _checkValue(value) {
        return typeof value === "number" && value >= this.getMinimum() && value <= this.getMaximum();
      },

      /**
       * Apply routine for the value property.
       *
       * It disables / enables the buttons and handles the wrap around.
       *
       * @param value {Number} The new value of the spinner
       * @param old {Number} The former value of the spinner
       */
      _applyValue: function _applyValue(value, old) {
        var textField = this.getChildControl("textfield");

        this._updateButtons(); // save the last valid value of the spinner


        this.__lastValidValue = value; // write the value of the spinner to the textfield

        if (value !== null) {
          if (this.getNumberFormat()) {
            textField.setValue(this.getNumberFormat().format(value));
          } else {
            textField.setValue(value + "");
          }
        } else {
          textField.setValue("");
        }
      },

      /**
       * Apply routine for the editable property.<br/>
       * It sets the textfield of the spinner to not read only.
       *
       * @param value {Boolean} The new value of the editable property
       * @param old {Boolean} The former value of the editable property
       */
      _applyEditable: function _applyEditable(value, old) {
        var textField = this.getChildControl("textfield");

        if (textField) {
          textField.setReadOnly(!value);
        }
      },

      /**
       * Apply routine for the wrap property.<br/>
       * Enables all buttons if the wrapping is enabled.
       *
       * @param value {Boolean} The new value of the wrap property
       * @param old {Boolean} The former value of the wrap property
       */
      _applyWrap: function _applyWrap(value, old) {
        this._updateButtons();
      },

      /**
       * Apply routine for the numberFormat property.<br/>
       * When setting a number format, the display of the
       * value in the text-field will be changed immediately.
       *
       * @param value {Boolean} The new value of the numberFormat property
       * @param old {Boolean} The former value of the numberFormat property
       */
      _applyNumberFormat: function _applyNumberFormat(value, old) {
        var textField = this.getChildControl("textfield");
        textField.setFilter(this._getFilterRegExp());

        if (old) {
          old.removeListener("changeNumberFormat", this._onChangeNumberFormat, this);
        }

        var numberFormat = this.getNumberFormat();

        if (numberFormat !== null) {
          numberFormat.addListener("changeNumberFormat", this._onChangeNumberFormat, this);
        }

        this._applyValue(this.__lastValidValue, undefined);
      },

      /**
       * Returns the element, to which the content padding should be applied.
       *
       * @return {qx.ui.core.Widget} The content padding target.
       */
      _getContentPaddingTarget: function _getContentPaddingTarget() {
        return this.getChildControl("textfield");
      },

      /**
       * Checks the min and max values, disables / enables the
       * buttons and handles the wrap around.
       */
      _updateButtons: function _updateButtons() {
        var upButton = this.getChildControl("upbutton");
        var downButton = this.getChildControl("downbutton");
        var value = this.getValue();

        if (!this.getEnabled()) {
          // If Spinner is disabled -> disable buttons
          upButton.setEnabled(false);
          downButton.setEnabled(false);
        } else {
          if (this.getWrap()) {
            // If wraped -> always enable buttons
            upButton.setEnabled(true);
            downButton.setEnabled(true);
          } else {
            // check max value
            if (value !== null && value < this.getMaximum()) {
              upButton.setEnabled(true);
            } else {
              upButton.setEnabled(false);
            } // check min value


            if (value !== null && value > this.getMinimum()) {
              downButton.setEnabled(true);
            } else {
              downButton.setEnabled(false);
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        KEY EVENT-HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Callback for "keyDown" event.<br/>
       * Controls the interval mode ("single" or "page")
       * and the interval increase by detecting "Up"/"Down"
       * and "PageUp"/"PageDown" keys.<br/>
       * The corresponding button will be pressed.
       *
       * @param e {qx.event.type.KeySequence} keyDown event
       */
      _onKeyDown: function _onKeyDown(e) {
        switch (e.getKeyIdentifier()) {
          case "PageUp":
            // mark that the spinner is in page mode and process further
            this.__pageUpMode = true;

          case "Up":
            this.getChildControl("upbutton").press();
            break;

          case "PageDown":
            // mark that the spinner is in page mode and process further
            this.__pageDownMode = true;

          case "Down":
            this.getChildControl("downbutton").press();
            break;

          default:
            // Do not stop unused events
            return;
        }

        e.stopPropagation();
        e.preventDefault();
      },

      /**
       * Callback for "keyUp" event.<br/>
       * Detecting "Up"/"Down" and "PageUp"/"PageDown" keys.<br/>
       * Releases the button and disabled the page mode, if necessary.
       *
       * @param e {qx.event.type.KeySequence} keyUp event
       */
      _onKeyUp: function _onKeyUp(e) {
        switch (e.getKeyIdentifier()) {
          case "PageUp":
            this.getChildControl("upbutton").release();
            this.__pageUpMode = false;
            break;

          case "Up":
            this.getChildControl("upbutton").release();
            break;

          case "PageDown":
            this.getChildControl("downbutton").release();
            this.__pageDownMode = false;
            break;

          case "Down":
            this.getChildControl("downbutton").release();
            break;
        }
      },

      /*
      ---------------------------------------------------------------------------
        OTHER EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Callback method for the "roll" event.<br/>
       * Increments or decrements the value of the spinner.
       *
       * @param e {qx.event.type.Roll} roll event
       */
      _onRoll: function _onRoll(e) {
        // only wheel
        if (e.getPointerType() != "wheel") {
          return;
        }

        var delta = e.getDelta().y;

        if (delta < 0) {
          this._countUp();
        } else if (delta > 0) {
          this._countDown();
        }

        e.stop();
      },

      /**
       * Callback method for the "change" event of the textfield.
       *
       * @param e {qx.event.type.Event} text change event or blur event
       */
      _onTextChange: function _onTextChange(e) {
        var textField = this.getChildControl("textfield");
        var value; // if a number format is set

        if (this.getNumberFormat()) {
          // try to parse the current number using the number format
          try {
            value = this.getNumberFormat().parse(textField.getValue());
          } catch (ex) {// otherwise, process further
          }
        }

        if (value === undefined) {
          // try to parse the number as a float
          value = parseFloat(textField.getValue());
        } // if the result is a number


        if (!isNaN(value)) {
          // Fix value if invalid
          if (value > this.getMaximum()) {
            value = this.getMaximum();
          } else if (value < this.getMinimum()) {
            value = this.getMinimum();
          } // If value is the same than before, call directly _applyValue()


          if (value === this.__lastValidValue) {
            this._applyValue(this.__lastValidValue);
          } else {
            this.setValue(value);
          }
        } else {
          // otherwise, reset the last valid value
          this._applyValue(this.__lastValidValue, undefined);
        }
      },

      /**
       * Callback method for the locale Manager's "changeLocale" event.
       *
       * @param ev {qx.event.type.Event} locale change event
       */
      _onChangeLocale: function _onChangeLocale(ev) {
        if (this.getNumberFormat() !== null) {
          this.setNumberFormat(this.getNumberFormat());
          var textfield = this.getChildControl("textfield");
          textfield.setFilter(this._getFilterRegExp());
          textfield.setValue(this.getNumberFormat().format(this.getValue()));
        }
      },

      /**
       * Callback method for the number format's "changeNumberFormat" event.
       *
       * @param ev {qx.event.type.Event} number format change event
       */
      _onChangeNumberFormat: function _onChangeNumberFormat(ev) {
        var textfield = this.getChildControl("textfield");
        textfield.setFilter(this._getFilterRegExp());
        textfield.setValue(this.getNumberFormat().format(this.getValue()));
      },

      /*
      ---------------------------------------------------------------------------
        INTERVAL HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Checks if the spinner is in page mode and counts either the single
       * or page Step up.
       *
       */
      _countUp: function _countUp() {
        if (this.__pageUpMode) {
          var newValue = this.getValue() + this.getPageStep();
        } else {
          var newValue = this.getValue() + this.getSingleStep();
        } // handle the case where wrapping is enabled


        if (this.getWrap()) {
          if (newValue > this.getMaximum()) {
            var diff = this.getMaximum() - newValue;
            newValue = this.getMinimum() - diff - 1;
          }
        }

        this.gotoValue(newValue);
      },

      /**
       * Checks if the spinner is in page mode and counts either the single
       * or page Step down.
       *
       */
      _countDown: function _countDown() {
        if (this.__pageDownMode) {
          var newValue = this.getValue() - this.getPageStep();
        } else {
          var newValue = this.getValue() - this.getSingleStep();
        } // handle the case where wrapping is enabled


        if (this.getWrap()) {
          if (newValue < this.getMinimum()) {
            var diff = this.getMinimum() + newValue;
            newValue = this.getMaximum() + diff + 1;
          }
        }

        this.gotoValue(newValue);
      },

      /**
       * Normalizes the incoming value to be in the valid range and
       * applies it to the {@link #value} afterwards.
       *
       * @param value {Number} Any number
       * @return {Number} The normalized number
       */
      gotoValue: function gotoValue(value) {
        return this.setValue(Math.min(this.getMaximum(), Math.max(this.getMinimum(), value)));
      },
      // overridden
      focus: function focus() {
        qx.ui.form.Spinner.prototype.focus.base.call(this);
        this.getChildControl("textfield").getFocusElement().focus();
      }
    },
    destruct: function destruct() {
      var nf = this.getNumberFormat();

      if (nf) {
        nf.removeListener("changeNumberFormat", this._onChangeNumberFormat, this);
      }

      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      }
    }
  });
  qx.ui.form.Spinner.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.ToggleButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.form.MModelProperty": {
        "require": true
      },
      "qx.ui.form.IForm": {
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
       * Fabian Jakobs (fjakobs)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * A check box widget with an optional label.
   */
  qx.Class.define("qx.ui.form.CheckBox", {
    extend: qx.ui.form.ToggleButton,
    include: [qx.ui.form.MForm, qx.ui.form.MModelProperty],
    implement: [qx.ui.form.IForm, qx.ui.form.IModel],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String?null} An optional label for the check box.
     */
    construct: function construct(label) {
      {
        this.assertArgumentsCount(arguments, 0, 1);
      }
      qx.ui.form.ToggleButton.constructor.call(this, label); // Initialize the checkbox to a valid value (the default is null which
      // is invalid)

      this.setValue(false);
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
        init: "checkbox"
      },
      // overridden
      allowGrowX: {
        refine: true,
        init: false
      }
    },
    members: {
      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        invalid: true,
        focused: true,
        undetermined: true,
        checked: true,
        hovered: true
      },

      /**
       * overridden (from MExecutable to keep the icon out of the binding)
       * @lint ignoreReferenceField(_bindableProperties)
       */
      _bindableProperties: ["enabled", "label", "toolTipText", "value", "menu"]
    }
  });
  qx.ui.form.CheckBox.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.IStringForm": {
        "require": true
      },
      "qx.event.type.Focus": {
        "construct": true
      },
      "qx.ui.form.TextField": {},
      "qx.ui.form.Button": {}
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
   * Basically a text fields which allows a selection from a list of
   * preconfigured options. Allows custom user input. Public API is value
   * oriented.
   *
   * To work with selections without custom input the ideal candidates are
   * the {@link SelectBox} or the {@link RadioGroup}.
   *
   * @childControl textfield {qx.ui.form.TextField} textfield component of the combobox
   * @childControl button {qx.ui.form.Button} button to open the list popup
   * @childControl list {qx.ui.form.List} list inside the popup
   */
  qx.Class.define("qx.ui.form.ComboBox", {
    extend: qx.ui.form.AbstractSelectBox,
    implement: [qx.ui.form.IStringForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.form.AbstractSelectBox.constructor.call(this);

      var textField = this._createChildControl("textfield");

      this._createChildControl("button");

      this.addListener("tap", this._onTap); // forward the focusin and focusout events to the textfield. The textfield
      // is not focusable so the events need to be forwarded manually.

      this.addListener("focusin", function (e) {
        textField.fireNonBubblingEvent("focusin", qx.event.type.Focus);
      }, this);
      this.addListener("focusout", function (e) {
        textField.fireNonBubblingEvent("focusout", qx.event.type.Focus);
      }, this);
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
        init: "combobox"
      },

      /**
       * String value which will be shown as a hint if the field is all of:
       * unset, unfocused and enabled. Set to null to not show a placeholder
       * text.
       */
      placeholder: {
        check: "String",
        nullable: true,
        apply: "_applyPlaceholder"
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Whenever the value is changed this event is fired
       *
       *  Event data: The new text value of the field.
       */
      "changeValue": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __preSelectedItem: null,
      __onInputId: null,
      // property apply
      _applyPlaceholder: function _applyPlaceholder(value, old) {
        this.getChildControl("textfield").setPlaceholder(value);
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "textfield":
            control = new qx.ui.form.TextField();
            control.setFocusable(false);
            control.addState("inner");
            control.addListener("changeValue", this._onTextFieldChangeValue, this);
            control.addListener("blur", this.close, this);

            this._add(control, {
              flex: 1
            });

            break;

          case "button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.setKeepActive(true);
            control.addState("inner");
            control.addListener("execute", this.toggle, this);

            this._add(control);

            break;

          case "list":
            // Get the list from the AbstractSelectBox
            control = qx.ui.form.ComboBox.prototype._createChildControlImpl.base.call(this, id); // Change selection mode

            control.setSelectionMode("single");
            break;
        }

        return control || qx.ui.form.ComboBox.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        invalid: true
      },
      // overridden
      tabFocus: function tabFocus() {
        var field = this.getChildControl("textfield");
        field.getFocusElement().focus();
        field.selectAllText();
      },
      // overridden
      focus: function focus() {
        qx.ui.form.ComboBox.prototype.focus.base.call(this);
        this.getChildControl("textfield").getFocusElement().focus();
      },
      // interface implementation
      setValue: function setValue(value) {
        var textfield = this.getChildControl("textfield");

        if (textfield.getValue() == value) {
          return;
        } // Apply to text field


        textfield.setValue(value);
      },
      // interface implementation
      getValue: function getValue() {
        return this.getChildControl("textfield").getValue();
      },
      // interface implementation
      resetValue: function resetValue() {
        this.getChildControl("textfield").setValue(null);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */
      // overridden
      _onKeyPress: function _onKeyPress(e) {
        var popup = this.getChildControl("popup");
        var iden = e.getKeyIdentifier();

        if (iden == "Down" && e.isAltPressed()) {
          this.getChildControl("button").addState("selected");
          this.toggle();
          e.stopPropagation();
        } else if (iden == "Enter") {
          if (popup.isVisible()) {
            this._setPreselectedItem();

            this.resetAllTextSelection();
            this.close();
            e.stop();
          }
        } else if (popup.isVisible()) {
          qx.ui.form.ComboBox.prototype._onKeyPress.base.call(this, e);
        }
      },

      /**
       * Toggles the popup's visibility.
       *
       * @param e {qx.event.type.Pointer} Pointer tap event
       */
      _onTap: function _onTap(e) {
        this.close();
      },
      // overridden
      _onListPointerDown: function _onListPointerDown(e) {
        this._setPreselectedItem();
      },

      /**
       * Apply pre-selected item
       */
      _setPreselectedItem: function _setPreselectedItem() {
        if (this.__preSelectedItem) {
          var label = this.__preSelectedItem.getLabel();

          if (this.getFormat() != null) {
            label = this.getFormat().call(this, this.__preSelectedItem);
          } // check for translation


          if (label && label.translate) {
            label = label.translate();
          }

          this.setValue(label);
          this.__preSelectedItem = null;
        }
      },
      // overridden
      _onListChangeSelection: function _onListChangeSelection(e) {
        var current = e.getData();

        if (current.length > 0) {
          // Ignore quick context (e.g. pointerover)
          // and configure the new value when closing the popup afterwards
          var list = this.getChildControl("list");
          var ctx = list.getSelectionContext();

          if (ctx == "quick" || ctx == "key") {
            this.__preSelectedItem = current[0];
          } else {
            var label = current[0].getLabel();

            if (this.getFormat() != null) {
              label = this.getFormat().call(this, current[0]);
            } // check for translation


            if (label && label.translate) {
              label = label.translate();
            }

            this.setValue(label);
            this.__preSelectedItem = null;
          }
        }
      },
      // overridden
      _onPopupChangeVisibility: function _onPopupChangeVisibility(e) {
        qx.ui.form.ComboBox.prototype._onPopupChangeVisibility.base.call(this, e); // Synchronize the list with the current value on every
        // opening of the popup. This is useful because through
        // the quick selection mode, the list may keep an invalid
        // selection on close or the user may enter text while
        // the combobox is closed and reopen it afterwards.


        var popup = this.getChildControl("popup");

        if (popup.isVisible()) {
          var list = this.getChildControl("list");
          var value = this.getValue();
          var item = null;

          if (value) {
            item = list.findItem(value);
          }

          if (item) {
            list.setSelection([item]);
          } else {
            list.resetSelection();
          }
        } else {
          // When closing the popup text should selected and field should
          // have the focus. Identical to when reaching the field using the TAB key.
          //
          // Only focus if popup was visible before. Fixes [BUG #4453].
          if (e.getOldData() == "visible") {
            this.tabFocus();
          }
        } // In all cases: Remove focused state from button


        this.getChildControl("button").removeState("selected");
      },

      /**
       * Reacts on value changes of the text field and syncs the
       * value to the combobox.
       *
       * @param e {qx.event.type.Data} Change event
       */
      _onTextFieldChangeValue: function _onTextFieldChangeValue(e) {
        var value = e.getData();
        var list = this.getChildControl("list");

        if (value != null) {
          // Select item when possible
          var item = list.findItem(value, false);

          if (item) {
            list.setSelection([item]);
          } else {
            list.resetSelection();
          }
        } else {
          list.resetSelection();
        } // Fire event


        this.fireDataEvent("changeValue", value, e.getOldData());
      },

      /*
      ---------------------------------------------------------------------------
        TEXTFIELD SELECTION API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the current selection.
       * This method only works if the widget is already created and
       * added to the document.
       *
       * @return {String|null}
       */
      getTextSelection: function getTextSelection() {
        return this.getChildControl("textfield").getTextSelection();
      },

      /**
       * Returns the current selection length.
       * This method only works if the widget is already created and
       * added to the document.
       *
       * @return {Integer|null}
       */
      getTextSelectionLength: function getTextSelectionLength() {
        return this.getChildControl("textfield").getTextSelectionLength();
      },

      /**
       * Set the selection to the given start and end (zero-based).
       * If no end value is given the selection will extend to the
       * end of the textfield's content.
       * This method only works if the widget is already created and
       * added to the document.
       *
       * @param start {Integer} start of the selection (zero-based)
       * @param end {Integer} end of the selection
       */
      setTextSelection: function setTextSelection(start, end) {
        this.getChildControl("textfield").setTextSelection(start, end);
      },

      /**
       * Clears the current selection.
       * This method only works if the widget is already created and
       * added to the document.
       *
       */
      clearTextSelection: function clearTextSelection() {
        this.getChildControl("textfield").clearTextSelection();
      },

      /**
       * Selects the whole content
       *
       */
      selectAllText: function selectAllText() {
        this.getChildControl("textfield").selectAllText();
      },

      /**
       * Clear any text selection, then select all text
       *
       */
      resetAllTextSelection: function resetAllTextSelection() {
        this.clearTextSelection();
        this.selectAllText();
      }
    }
  });
  qx.ui.form.ComboBox.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-48.js.map
