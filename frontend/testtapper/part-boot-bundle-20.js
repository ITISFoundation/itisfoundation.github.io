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
      "qx.locale.Manager": {
        "construct": true
      },
      "qx.lang.Type": {},
      "qx.lang.Object": {},
      "qx.core.ValidationError": {},
      "qx.type.BaseError": {},
      "qx.ui.form.validation.AsyncValidator": {},
      "qx.ui.form.IForm": {},
      "qx.ui.core.ISingleSelection": {},
      "qx.data.controller.ISelection": {}
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
   * This validation manager is responsible for validation of forms.
   *
   * @ignore(qx.ui.tooltip)
   * @ignore(qx.ui.tooltip.Manager.*)
   */
  qx.Class.define("qx.ui.form.validation.Manager", {
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this); // storage for all form items

      this.__formItems = []; // storage for all results of async validation calls

      this.__asyncResults = {}; // set the default required field message

      this.setRequiredFieldMessage(qx.locale.Manager.tr("This field is required"));
    },
    events: {
      /**
       * Change event for the valid state.
       */
      "changeValid": "qx.event.type.Data",

      /**
       * Signals that the validation is done. This is not needed on synchronous
       * validation (validation is done right after the call) but very important
       * in the case an asynchronous validator will be used.
       */
      "complete": "qx.event.type.Event"
    },
    properties: {
      /**
       * The validator of the form itself. You can set a function (for
       * synchronous validation) or a {@link qx.ui.form.validation.AsyncValidator}.
       * In both cases, the function can have all added form items as first
       * argument and the manager as a second argument. The manager should be used
       * to set the {@link #invalidMessage}.
       *
       * Keep in mind that the validator is optional if you don't need the
       * validation in the context of the whole form.
       * @type {Function | AsyncValidator}
       */
      validator: {
        check: "value instanceof Function || qx.Class.isSubClassOf(value.constructor, qx.ui.form.validation.AsyncValidator)",
        init: null,
        nullable: true
      },

      /**
       * The invalid message should store the message why the form validation
       * failed. It will be added to the array returned by
       * {@link #getInvalidMessages}.
       */
      invalidMessage: {
        check: "String",
        init: ""
      },

      /**
       * This message will be shown if a required field is empty and no individual
       * {@link qx.ui.form.MForm#requiredInvalidMessage} is given.
       */
      requiredFieldMessage: {
        check: "String",
        init: ""
      },

      /**
       * The context for the form validation.
       */
      context: {
        nullable: true
      }
    },
    members: {
      __formItems: null,
      __valid: null,
      __asyncResults: null,
      __syncValid: null,

      /**
       * Add a form item to the validation manager.
       *
       * The form item has to implement at least two interfaces:
       * <ol>
       *   <li>The {@link qx.ui.form.IForm} Interface</li>
       *   <li>One of the following interfaces:
       *     <ul>
       *       <li>{@link qx.ui.form.IBooleanForm}</li>
       *       <li>{@link qx.ui.form.IColorForm}</li>
       *       <li>{@link qx.ui.form.IDateForm}</li>
       *       <li>{@link qx.ui.form.INumberForm}</li>
       *       <li>{@link qx.ui.form.IStringForm}</li>
       *     </ul>
       *   </li>
       * </ol>
       * The validator can be a synchronous or asynchronous validator. In
       * both cases the validator can either returns a boolean or fire an
       * {@link qx.core.ValidationError}. For synchronous validation, a plain
       * JavaScript function should be used. For all asynchronous validations,
       * a {@link qx.ui.form.validation.AsyncValidator} is needed to wrap the
       * plain function.
       *
       * @param formItem {qx.ui.core.Widget} The form item to add.
       * @param validator {Function | qx.ui.form.validation.AsyncValidator}
       *   The validator.
       * @param context {var?null} The context of the validator.
       */
      add: function add(formItem, validator, context) {
        // check for the form API
        if (!this.__supportsInvalid(formItem)) {
          throw new Error("Added widget not supported.");
        } // check for the data type


        if (this.__supportsSingleSelection(formItem) && !formItem.getValue) {
          // check for a validator
          if (validator != null) {
            throw new Error("Widgets supporting selection can only be validated in the form validator");
          }
        }

        var dataEntry = {
          item: formItem,
          validator: validator,
          valid: null,
          context: context
        };

        this.__formItems.push(dataEntry);
      },

      /**
       * Remove a form item from the validation manager.
       *
       * @param formItem {qx.ui.core.Widget} The form item to remove.
       * @return {qx.ui.core.Widget?null} The removed form item or
       *  <code>null</code> if the item could not be found.
       */
      remove: function remove(formItem) {
        var items = this.__formItems;

        for (var i = 0, len = items.length; i < len; i++) {
          if (formItem === items[i].item) {
            items.splice(i, 1);
            return formItem;
          }
        }

        return null;
      },

      /**
       * Returns registered form items from the validation manager.
       *
       * @return {Array} The form items which will be validated.
       */
      getItems: function getItems() {
        var items = [];

        for (var i = 0; i < this.__formItems.length; i++) {
          items.push(this.__formItems[i].item);
        }

        ;
        return items;
      },

      /**
       * Invokes the validation. If only synchronous validators are set, the
       * result of the whole validation is available at the end of the method
       * and can be returned. If an asynchronous validator is set, the result
       * is still unknown at the end of this method so nothing will be returned.
       * In both cases, a {@link #complete} event will be fired if the validation
       * has ended. The result of the validation can then be accessed with the
       * {@link #getValid} method.
       *
       * @return {Boolean|undefined} The validation result, if available.
       */
      validate: function validate() {
        var valid = true;
        this.__syncValid = true; // collaboration of all synchronous validations

        var items = []; // check all validators for the added form items

        for (var i = 0; i < this.__formItems.length; i++) {
          var formItem = this.__formItems[i].item;
          var validator = this.__formItems[i].validator; // store the items in case of form validation

          items.push(formItem); // ignore all form items without a validator

          if (validator == null) {
            // check for the required property
            var validatorResult = this._validateRequired(formItem);

            valid = valid && validatorResult;
            this.__syncValid = validatorResult && this.__syncValid;
            continue;
          }

          var validatorResult = this._validateItem(this.__formItems[i], formItem.getValue()); // keep that order to ensure that null is returned on async cases


          valid = validatorResult && valid;

          if (validatorResult != null) {
            this.__syncValid = validatorResult && this.__syncValid;
          }
        } // check the form validator (be sure to invoke it even if the form
        // items are already false, so keep the order!)


        var formValid = this.__validateForm(items);

        if (qx.lang.Type.isBoolean(formValid)) {
          this.__syncValid = formValid && this.__syncValid;
        }

        valid = formValid && valid;

        this._setValid(valid);

        if (qx.lang.Object.isEmpty(this.__asyncResults)) {
          this.fireEvent("complete");
        }

        return valid;
      },

      /**
       * Checks if the form item is required. If so, the value is checked
       * and the result will be returned. If the form item is not required, true
       * will be returned.
       *
       * @param formItem {qx.ui.core.Widget} The form item to check.
       * @return {var} Validation result
       */
      _validateRequired: function _validateRequired(formItem) {
        if (formItem.getRequired()) {
          var validatorResult; // if its a widget supporting the selection

          if (this.__supportsSingleSelection(formItem)) {
            validatorResult = !!formItem.getSelection()[0];
          } else if (this.__supportsDataBindingSelection(formItem)) {
            validatorResult = formItem.getSelection().getLength() > 0;
          } else {
            var value = formItem.getValue();
            validatorResult = !!value || value === 0;
          }

          formItem.setValid(validatorResult);
          var individualMessage = formItem.getRequiredInvalidMessage();
          var message = individualMessage ? individualMessage : this.getRequiredFieldMessage();
          formItem.setInvalidMessage(message);
          return validatorResult;
        }

        return true;
      },

      /**
       * Validates a form item. This method handles the differences of
       * synchronous and asynchronous validation and returns the result of the
       * validation if possible (synchronous cases). If the validation is
       * asynchronous, null will be returned.
       *
       * @param dataEntry {Object} The map stored in {@link #add}
       * @param value {var} The currently set value
       * @return {Boolean|null} Validation result or <code>null</code> for async
       * validation
       */
      _validateItem: function _validateItem(dataEntry, value) {
        var formItem = dataEntry.item;
        var context = dataEntry.context;
        var validator = dataEntry.validator; // check for asynchronous validation

        if (this.__isAsyncValidator(validator)) {
          // used to check if all async validations are done
          this.__asyncResults[formItem.toHashCode()] = null;
          validator.validate(formItem, formItem.getValue(), this, context);
          return null;
        }

        var validatorResult = null;

        try {
          var validatorResult = validator.call(context || this, value, formItem);

          if (validatorResult === undefined) {
            validatorResult = true;
          }
        } catch (e) {
          if (e instanceof qx.core.ValidationError) {
            validatorResult = false;

            if (e.message && e.message != qx.type.BaseError.DEFAULTMESSAGE) {
              var invalidMessage = e.message;
            } else {
              var invalidMessage = e.getComment();
            }

            formItem.setInvalidMessage(invalidMessage);
          } else {
            throw e;
          }
        }

        formItem.setValid(validatorResult);
        dataEntry.valid = validatorResult;
        return validatorResult;
      },

      /**
       * Validates the form. It checks for asynchronous validation and handles
       * the differences to synchronous validation. If no form validator is given,
       * true will be returned. If a synchronous validator is given, the
       * validation result will be returned. In asynchronous cases, null will be
       * returned cause the result is not available.
       *
       * @param items {qx.ui.core.Widget[]} An array of all form items.
       * @return {Boolean|null} description
       */
      __validateForm: function __validateForm(items) {
        var formValidator = this.getValidator();
        var context = this.getContext() || this;

        if (formValidator == null) {
          return true;
        } // reset the invalidMessage


        this.setInvalidMessage("");

        if (this.__isAsyncValidator(formValidator)) {
          this.__asyncResults[this.toHashCode()] = null;
          formValidator.validateForm(items, this, context);
          return null;
        }

        try {
          var formValid = formValidator.call(context, items, this);

          if (formValid === undefined) {
            formValid = true;
          }
        } catch (e) {
          if (e instanceof qx.core.ValidationError) {
            formValid = false;

            if (e.message && e.message != qx.type.BaseError.DEFAULTMESSAGE) {
              var invalidMessage = e.message;
            } else {
              var invalidMessage = e.getComment();
            }

            this.setInvalidMessage(invalidMessage);
          } else {
            throw e;
          }
        }

        return formValid;
      },

      /**
       * Helper function which checks, if the given validator is synchronous
       * or asynchronous.
       *
       * @param validator {Function|qx.ui.form.validation.AsyncValidator}
       *   The validator to check.
       * @return {Boolean} True, if the given validator is asynchronous.
       */
      __isAsyncValidator: function __isAsyncValidator(validator) {
        var async = false;

        if (!qx.lang.Type.isFunction(validator)) {
          async = qx.Class.isSubClassOf(validator.constructor, qx.ui.form.validation.AsyncValidator);
        }

        return async;
      },

      /**
       * Returns true, if the given item implements the {@link qx.ui.form.IForm}
       * interface.
       *
       * @param formItem {qx.core.Object} The item to check.
       * @return {Boolean} true, if the given item implements the
       *   necessary interface.
       */
      __supportsInvalid: function __supportsInvalid(formItem) {
        var clazz = formItem.constructor;
        return qx.Class.hasInterface(clazz, qx.ui.form.IForm);
      },

      /**
       * Returns true, if the given item implements the
       * {@link qx.ui.core.ISingleSelection} interface.
       *
       * @param formItem {qx.core.Object} The item to check.
       * @return {Boolean} true, if the given item implements the
       *   necessary interface.
       */
      __supportsSingleSelection: function __supportsSingleSelection(formItem) {
        var clazz = formItem.constructor;
        return qx.Class.hasInterface(clazz, qx.ui.core.ISingleSelection);
      },

      /**
       * Returns true, if the given item implements the
       * {@link qx.data.controller.ISelection} interface.
       *
       * @param formItem {qx.core.Object} The item to check.
       * @return {Boolean} true, if the given item implements the
       *   necessary interface.
       */
      __supportsDataBindingSelection: function __supportsDataBindingSelection(formItem) {
        var clazz = formItem.constructor;
        return qx.Class.hasInterface(clazz, qx.data.controller.ISelection);
      },

      /**
       * Sets the valid state of the manager. It generates the event if
       * necessary and stores the new value.
       *
       * @param value {Boolean|null} The new valid state of the manager.
       */
      _setValid: function _setValid(value) {
        this._showToolTip(value);

        var oldValue = this.__valid;
        this.__valid = value; // check for the change event

        if (oldValue != value) {
          this.fireDataEvent("changeValid", value, oldValue);
        }
      },

      /**
       * Responsible for showing a tooltip in case the validation is done for
       * widgets based on qx.ui.core.Widget.
       * @param valid {Boolean} <code>false</code>, if the tooltip should be shown
       */
      _showToolTip: function _showToolTip(valid) {
        // ignore if we don't have a tooltip manager e.g. mobile apps
        if (!qx.ui.tooltip || !qx.ui.tooltip.Manager) {
          return;
        }

        var tooltip = qx.ui.tooltip.Manager.getInstance().getSharedErrorTooltip();

        if (!valid) {
          var firstInvalid;

          for (var i = 0; i < this.__formItems.length; i++) {
            var item = this.__formItems[i].item;

            if (!item.isValid()) {
              firstInvalid = item; // only for desktop widgets

              if (!item.getContentLocation) {
                return;
              } // only consider items on the screen


              if (item.isSeeable() === false) {
                continue;
              }

              tooltip.setLabel(item.getInvalidMessage());

              if (tooltip.getPlaceMethod() == "mouse") {
                var location = item.getContentLocation();
                var top = location.top - tooltip.getOffsetTop();
                tooltip.placeToPoint({
                  left: location.right,
                  top: top
                });
              } else {
                tooltip.placeToWidget(item);
              }

              tooltip.show();
              return;
            }
          }
        } else {
          tooltip.exclude();
        }
      },

      /**
       * Returns the valid state of the manager.
       *
       * @return {Boolean|null} The valid state of the manager.
       */
      getValid: function getValid() {
        return this.__valid;
      },

      /**
       * Returns the valid state of the manager.
       *
       * @return {Boolean|null} The valid state of the manager.
       */
      isValid: function isValid() {
        return this.getValid();
      },

      /**
       * Returns an array of all invalid messages of the invalid form items and
       * the form manager itself.
       *
       * @return {String[]} All invalid messages.
       */
      getInvalidMessages: function getInvalidMessages() {
        var messages = []; // combine the messages of all form items

        for (var i = 0; i < this.__formItems.length; i++) {
          var formItem = this.__formItems[i].item;

          if (!formItem.getValid()) {
            messages.push(formItem.getInvalidMessage());
          }
        } // add the forms fail message


        if (this.getInvalidMessage() != "") {
          messages.push(this.getInvalidMessage());
        }

        return messages;
      },

      /**
       * Selects invalid form items
       *
       * @return {Array} invalid form items
       */
      getInvalidFormItems: function getInvalidFormItems() {
        var res = [];

        for (var i = 0; i < this.__formItems.length; i++) {
          var formItem = this.__formItems[i].item;

          if (!formItem.getValid()) {
            res.push(formItem);
          }
        }

        return res;
      },

      /**
       * Resets the validator.
       */
      reset: function reset() {
        // reset all form items
        for (var i = 0; i < this.__formItems.length; i++) {
          var dataEntry = this.__formItems[i]; // set the field to valid

          dataEntry.item.setValid(true);
        } // set the manager to its initial valid value


        this.__valid = null;

        this._showToolTip(true);
      },

      /**
       * Internal helper method to set the given item to valid for asynchronous
       * validation calls. This indirection is used to determinate if the
       * validation process is completed or if other asynchronous validators
       * are still validating. {@link #__checkValidationComplete} checks if the
       * validation is complete and will be called at the end of this method.
       *
       * @param formItem {qx.ui.core.Widget} The form item to set the valid state.
       * @param valid {Boolean} The valid state for the form item.
       *
       * @internal
       */
      setItemValid: function setItemValid(formItem, valid) {
        // store the result
        this.__asyncResults[formItem.toHashCode()] = valid;
        formItem.setValid(valid);

        this.__checkValidationComplete();
      },

      /**
       * Internal helper method to set the form manager to valid for asynchronous
       * validation calls. This indirection is used to determinate if the
       * validation process is completed or if other asynchronous validators
       * are still validating. {@link #__checkValidationComplete} checks if the
       * validation is complete and will be called at the end of this method.
       *
       * @param valid {Boolean} The valid state for the form manager.
       *
       * @internal
       */
      setFormValid: function setFormValid(valid) {
        this.__asyncResults[this.toHashCode()] = valid;

        this.__checkValidationComplete();
      },

      /**
       * Checks if all asynchronous validators have validated so the result
       * is final and the {@link #complete} event can be fired. If that's not
       * the case, nothing will happen in the method.
       */
      __checkValidationComplete: function __checkValidationComplete() {
        var valid = this.__syncValid; // check if all async validators are done

        for (var hash in this.__asyncResults) {
          var currentResult = this.__asyncResults[hash];
          valid = currentResult && valid; // the validation is not done so just do nothing

          if (currentResult == null) {
            return;
          }
        } // set the actual valid state of the manager


        this._setValid(valid); // reset the results


        this.__asyncResults = {}; // fire the complete event (no entry in the results with null)

        this.fireEvent("complete");
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._showToolTip(true);

      this.__formItems = null;
    }
  });
  qx.ui.form.validation.Manager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.IField": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
       2017 Martijn Evers, The Netherlands
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
       * Martijn Evers (mever)
  
  ************************************************************************ */

  /**
   * The resetter is responsible for managing a set of fields and resetting these
   * fields on a {@link #reset} call. It can handle all form field implementing IField.
   */
  qx.Class.define("qx.ui.form.Resetter", {
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__items = [];
    },
    members: {
      __items: null,

      /**
       * Adding a field to the resetter will get its current value and store
       * it for resetting.
       *
       * @param field {qx.ui.form.IField} The field which should be added.
       * @throws {TypeError} When given argument is not a field.
       */
      add: function add(field) {
        this.__typeCheck(field);

        this.__items.push({
          item: field,
          init: field.getValue()
        });
      },

      /**
       * Removes a field from the resetter.
       *
       * @param field {qx.ui.form.IField} The field which should be removed.
       * @throws {TypeError} When given argument is not a field.
       * @return {Boolean} <code>true</code>, if the field has been removed.
       */
      remove: function remove(field) {
        this.__typeCheck(field);

        for (var i = 0; i < this.__items.length; i++) {
          var storedItem = this.__items[i];

          if (storedItem.item === field) {
            this.__items.splice(i, 1);

            return true;
          }
        }

        return false;
      },

      /**
       * Resets all added fields to their initial value. The initial value
       * is the value in the widget during the {@link #add}.
       *
       * @return {null|Error} Returns an error when some fields could not be reset.
       */
      reset: function reset() {
        var dataEntry,
            e,
            errors = [];

        for (var i = 0; i < this.__items.length; i++) {
          dataEntry = this.__items[i];
          e = dataEntry.item.setValue(dataEntry.init);

          if (e && e instanceof Error) {
            errors.push(e);
          }
        }

        if (errors.length) {
          return new Error(errors.join(', '));
        } else {
          return null;
        }
      },

      /**
       * Resets a single given field. The field has to be added to the resetter
       * instance before. Otherwise, an error is thrown.
       *
       * @param field {qx.ui.form.IField} The field, which should be reset.
       * @throws {TypeError} When given argument is not a field.
       * @return {null|Error} Returns an error when the field value could not be set.
       */
      resetItem: function resetItem(field) {
        this.__typeCheck(field);

        for (var i = 0; i < this.__items.length; i++) {
          var dataEntry = this.__items[i];

          if (dataEntry.item === field) {
            return field.setValue(dataEntry.init);
          }
        }

        throw new Error("The given field has not been added.");
      },

      /**
       * Takes the current values of all added fields and uses these values as
       * init values for resetting.
       */
      redefine: function redefine() {
        // go threw all added items
        for (var i = 0; i < this.__items.length; i++) {
          var item = this.__items[i].item; // set the new init value for the item

          this.__items[i].init = item.getValue();
        }
      },

      /**
       * Takes the current value of the given field and stores this value as init
       * value for resetting.
       *
       * @param field {qx.ui.form.IField} The field to redefine.
       * @throws {TypeError} When given argument is not a field.
       */
      redefineItem: function redefineItem(field) {
        this.__typeCheck(field); // get the data entry


        var dataEntry;

        for (var i = 0; i < this.__items.length; i++) {
          if (this.__items[i].item === field) {
            dataEntry = this.__items[i];
            dataEntry.init = dataEntry.item.getValue();
            return;
          }
        }

        throw new Error("The given field has not been added.");
      },

      /**
       * Assert when given argument is not a field.
       *
       * @param field {qx.ui.form.IField|var} Any argument that should be a field.
       * @throws {TypeError} When given argument is not a field.
       * @private
       */
      __typeCheck: function __typeCheck(field) {
        if (!qx.Class.hasInterface(field.constructor, qx.ui.form.IField)) {
          throw new TypeError("Field " + field + " not supported for resetting.");
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // holding references to widgets --> must set to null
      this.__items = null;
    }
  });
  qx.ui.form.Resetter.$$dbClassInfo = $$dbClassInfo;
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
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
  
  ************************************************************************ */

  /**
   * Superclass for formatters and parsers.
   */
  qx.Interface.define("qx.util.format.IFormat", {
    members: {
      /**
       * Formats an object.
       *
       * @abstract
       * @param obj {var} The object to format.
       * @return {String} the formatted object.
       * @throws {Error} the abstract function warning.
       */
      format: function format(obj) {},

      /**
       * Parses an object.
       *
       * @abstract
       * @param str {String} the string to parse.
       * @return {var} the parsed object.
       * @throws {Error} the abstract function warning.
       */
      parse: function parse(str) {}
    }
  });
  qx.util.format.IFormat.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.format.IFormat": {
        "require": true
      },
      "qx.locale.Date": {
        "construct": true
      },
      "qx.locale.Manager": {},
      "qx.log.Logger": {},
      "qx.lang.String": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A formatter and parser for dates, see
   * http://www.unicode.org/reports/tr35/#Date_Format_Patterns
   *
   * Here is a quick overview of the format pattern keys:
   * <table>
   * <tr><th>Key &nbsp;<th>Description
   * <tr><td><code> G </code><td> era, e.g. "AD"
   * <tr><td><code> y </code><td> year
   * <tr><td><code> Y </code><td> week year
   * <tr><td><code> u </code><td> extended year [Not supported yet]
   * <tr><td><code> Q </code><td> quarter
   * <tr><td><code> q </code><td> stand-alone quarter
   * <tr><td><code> M </code><td> month
   * <tr><td><code> L </code><td> stand-alone month
   * <tr><td><code> I </code><td> chinese leap month [Not supported yet]
   * <tr><td><code> w </code><td> week of year
   * <tr><td><code> W </code><td> week of month
   * <tr><td><code> d </code><td> day of month
   * <tr><td><code> D </code><td> day of year
   * <tr><td><code> F </code><td> day of week in month [Not supported yet]
   * <tr><td><code> g </code><td> modified Julian day [Not supported yet]
   * <tr><td><code> E </code><td> day of week
   * <tr><td><code> e </code><td> local day of week
   * <tr><td><code> c </code><td> stand-alone local day of week
   * <tr><td><code> a </code><td> period of day (am or pm)
   * <tr><td><code> h </code><td> 12-hour hour
   * <tr><td><code> H </code><td> 24-hour hour
   * <tr><td><code> K </code><td> hour [0-11]
   * <tr><td><code> k </code><td> hour [1-24]
   * <tr><td><code> j </code><td> special symbol [Not supported yet]
   * <tr><td><code> m </code><td> minute
   * <tr><td><code> s </code><td> second
   * <tr><td><code> S </code><td> fractional second
   * <tr><td><code> A </code><td> millisecond in day [Not supported yet]
   * <tr><td><code> z </code><td> time zone, specific non-location format
   * <tr><td><code> Z </code><td> time zone, rfc822/gmt format
   * <tr><td><code> v </code><td> time zone, generic non-location format [Not supported yet]
   * <tr><td><code> V </code><td> time zone, like z except metazone abbreviations [Not supported yet]
   * </table>
   *
   * (This list is preliminary, not all format keys might be implemented). Most
   * keys support repetitions that influence the meaning of the format. Parts of the
   * format string that should not be interpreted as format keys have to be
   * single-quoted.
   *
   * The same format patterns will be used for both parsing and output formatting.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.util.format.DateFormat", {
    extend: qx.core.Object,
    implement: [qx.util.format.IFormat],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param format {String|null} The format to use. If null, the locale's default
     * format is used.
     * @param locale {String?} optional locale to be used. In case this is not present, the {@link #locale} property of DateFormat
     * will be following the {@link qx.locale.Manager#locale} property of qx.locale.Manager
     */
    construct: function construct(format, locale) {
      qx.core.Object.constructor.call(this);
      this.__initialLocale = this.__locale = locale;

      if (format != null) {
        this.__format = format.toString();

        if (this.__format in qx.util.format.DateFormat.ISO_MASKS) {
          if (this.__format === 'isoUtcDateTime') {
            this.__UTC = true;
          }

          this.__format = qx.util.format.DateFormat.ISO_MASKS[this.__format];
        }
      } else {
        this.__format = qx.locale.Date.getDateFormat("long", this.getLocale()) + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss", this.getLocale());
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Convenience factory that returns a <code>DateFomat</code> instance that
       * uses a short date-only format. Beware that the overall layout of the
       * date/time format string is that of the locale in effect when the factory
       * function is called.
       *
       * Implemented as a quasi-singleton, so beware of side effects.
       *
       * @return {DateFormat} a DateFormat instance.
       */
      getDateInstance: function getDateInstance() {
        var DateFormat = qx.util.format.DateFormat;
        var format = qx.locale.Date.getDateFormat("short") + ""; // Memoizing the instance, so caller doesn't have to dispose it.

        if (DateFormat._dateInstance == null || DateFormat._dateInstance.__format != format) {
          DateFormat._dateInstance = new DateFormat(format);
        }

        return DateFormat._dateInstance;
      },

      /**
       * Convenience factory that returns a <code>DateFomat</code> instance that
       * uses a long date/time format. Beware that the overall layout of the
       * date/time format string is that of the locale in effect when the factory
       * function is called.
       *
       * Implemented as a quasi-singleton, so beware of side effects.
       *
       * @return {DateFormat} a DateFormat instance.
       */
      getDateTimeInstance: function getDateTimeInstance() {
        var DateFormat = qx.util.format.DateFormat;
        var format = qx.locale.Date.getDateFormat("long") + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss"); // Memoizing the instance, so caller doesn't have to dispose it.

        if (DateFormat._dateTimeInstance == null || DateFormat._dateTimeInstance.__format != format) {
          DateFormat._dateTimeInstance = new DateFormat(format);
        }

        return DateFormat._dateTimeInstance;
      },

      /**
       * @type {Integer} The threshold until when a year should be assumed to belong to the
       *   21st century (e.g. 12 -> 2012). Years over this threshold but below 100 will be
       *   assumed to belong to the 20th century (e.g. 88 -> 1988). Years over 100 will be
       *   used unchanged (e.g. 1792 -> 1792).
       */
      ASSUME_YEAR_2000_THRESHOLD: 30,

      /** @type {Map} Special masks of patterns that are used frequently*/
      ISO_MASKS: {
        isoDate: "yyyy-MM-dd",
        isoTime: "HH:mm:ss",
        isoDateTime: "yyyy-MM-dd'T'HH:mm:ss",
        isoUtcDateTime: "yyyy-MM-dd'T'HH:mm:ss'Z'"
      },

      /** @type {String} The am marker. */
      AM_MARKER: "am",

      /** @type {String} The pm marker. */
      PM_MARKER: "pm"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __locale: null,
      __initialLocale: null,
      __format: null,
      __parseFeed: null,
      __parseRules: null,
      __formatTree: null,
      __UTC: null,

      /**
       * Fills a number with leading zeros ("25" -> "0025").
       *
       * @param number {Integer} the number to fill.
       * @param minSize {Integer} the minimum size the returned string should have.
       * @return {String} the filled number as string.
       */
      __fillNumber: function __fillNumber(number, minSize) {
        var str = "" + (number < 0 ? -1 * number : number);

        while (str.length < minSize) {
          str = "0" + str;
        }

        return number < 0 ? "-" + str : str;
      },

      /**
       * Returns the day in year of a date.
       *
       * @param date {Date} the date.
       * @return {Integer} the day in year.
       */
      __getDayInYear: function __getDayInYear(date) {
        var helpDate = new Date(date.getTime());
        var day = helpDate.getDate();

        while (helpDate.getMonth() != 0) {
          // Set the date to the last day of the previous month
          helpDate.setDate(-1);
          day += helpDate.getDate() + 1;
        }

        return day;
      },

      /**
       * Returns the thursday in the same week as the date.
       *
       * @param date {Date} the date to get the thursday of.
       * @return {Date} the thursday in the same week as the date.
       */
      __thursdayOfSameWeek: function __thursdayOfSameWeek(date) {
        return new Date(date.getTime() + (3 - (date.getDay() + 6) % 7) * 86400000);
      },

      /**
       * Returns the week in year of a date.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week in year.
       */
      __getWeekInYear: function __getWeekInYear(date) {
        // The following algorithm comes from http://www.salesianer.de/util/kalwoch.html
        // Get the thursday of the week the date belongs to
        var thursdayDate = this.__thursdayOfSameWeek(date); // Get the year the thursday (and therefore the week) belongs to


        var weekYear = thursdayDate.getFullYear(); // Get the thursday of the week january 4th belongs to
        // (which defines week 1 of a year)

        var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(weekYear, 0, 4)); // Calculate the calendar week


        return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
      },

      /**
       * Returns the week in month of a date.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week in month.
       */
      __getWeekInMonth: function __getWeekInMonth(date) {
        var thursdayDate = this.__thursdayOfSameWeek(date);

        var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(date.getFullYear(), date.getMonth(), 4));

        return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
      },

      /**
       * Returns the week year of a date. (that is the year of the week where this date happens to be)
       * For a week in the middle of the summer, the year is easily obtained, but for a week
       * when New Year's Eve takes place, the year of that week is ambiguous.
       * The thursday day of that week is used to determine the year.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week year.
       */
      __getWeekYear: function __getWeekYear(date) {
        var thursdayDate = this.__thursdayOfSameWeek(date);

        return thursdayDate.getFullYear();
      },

      /**
       * Returns true if the year is a leap one.
       *
       * @param year {Integer} the year to check.
       * @return {Boolean} true if it is a leap year.
       */
      __isLeapYear: function __isLeapYear(year) {
        var februaryDate = new Date(year, 2, 1);
        februaryDate.setDate(-1);
        return februaryDate.getDate() + 1 === 29;
      },

      /**
       * Returns a json object with month and day as keys.
       *
       * @param dayOfYear {Integer} the day of year.
       * @param year {Integer} the year to check.
       * @return {Object} a json object {month: M, day: D}.
       */
      __getMonthAndDayFromDayOfYear: function __getMonthAndDayFromDayOfYear(dayOfYear, year) {
        var month = 0;
        var day = 0; // if we don't know the year, we take a non-leap year'

        if (!year) {
          year = 1971;
        }

        var dayCounter = 0;

        for (var i = 1; i <= 12; i++) {
          var tempDate = new Date(year, i, 1);
          tempDate.setDate(-1);
          var days = tempDate.getDate() + 1;
          dayCounter += days;

          if (dayCounter < dayOfYear) {
            month++;
            day += days;
          } else {
            day = dayOfYear - (dayCounter - days);
            break;
          }
        }

        return {
          month: month,
          day: day
        };
      },

      /**
       * Returns the year of a date when we know the week year
       *
       * @param weekYear {Integer} the week year.
       * @param month {Integer} the month
       * @param dayOfMonth {Integer} the day in month
       * @return {Integer} the year.
       */
      __getYearFromWeekYearAndMonth: function __getYearFromWeekYearAndMonth(weekYear, month, dayOfMonth) {
        var year;

        switch (month) {
          case 11:
            year = weekYear - 1;

            if (weekYear != this.__getWeekYear(new Date(year, month, dayOfMonth))) {
              year = weekYear;
            }

            break;

          case 0:
            year = weekYear + 1;

            if (weekYear != this.__getWeekYear(new Date(year, month, dayOfMonth))) {
              year = weekYear;
            }

            break;

          default:
            year = weekYear;
        }

        return year;
      },

      /**
       * Sets the new value for locale property
       * @param value {String} The new value.
       *
       */
      setLocale: function setLocale(value) {
        if (value !== null && typeof value != "string") {
          throw new Error("Cannot set locale to " + value + " - please provide a string");
        }

        this.__locale = value === null ? this.__initialLocale : value;
      },

      /**
       * Resets the Locale
       */
      resetLocale: function resetLocale() {
        this.setLocale(null);
      },

      /**
       * Returns the locale
       */
      getLocale: function getLocale() {
        var locale = this.__locale;

        if (locale === undefined) {
          locale = qx.locale.Manager.getInstance().getLocale();
        }

        return locale;
      },

      /**
       * Formats a date.
       *
       * @param date {Date} The date to format.
       * @return {String} the formatted date.
       */
      format: function format(date) {
        // check for null dates
        if (date == null) {
          return null;
        }

        if (isNaN(date.getTime())) {
          {
            qx.log.Logger.error("Provided date is invalid");
          }
          return null;
        }

        if (this.__UTC) {
          date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        }

        var locale = this.getLocale();
        var fullYear = date.getFullYear();
        var month = date.getMonth();
        var dayOfMonth = date.getDate();
        var dayOfWeek = date.getDay();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var ms = date.getMilliseconds();
        var timezoneOffset = date.getTimezoneOffset();
        var timezoneSign = timezoneOffset > 0 ? 1 : -1;
        var timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
        var timezoneMinutes = Math.abs(timezoneOffset) % 60; // Create the output

        this.__initFormatTree();

        var output = "";

        for (var i = 0; i < this.__formatTree.length; i++) {
          var currAtom = this.__formatTree[i];

          if (currAtom.type == "literal") {
            output += currAtom.text;
          } else {
            // This is a wildcard
            var wildcardChar = currAtom.character;
            var wildcardSize = currAtom.size; // Get its replacement

            var replacement = "?";

            switch (wildcardChar) {
              case 'y':
                // Year
                if (wildcardSize == 2) {
                  replacement = this.__fillNumber(fullYear % 100, 2);
                } else {
                  var year = Math.abs(fullYear);
                  replacement = year + "";

                  if (wildcardSize > replacement.length) {
                    for (var j = replacement.length; j < wildcardSize; j++) {
                      replacement = "0" + replacement;
                    }
                  }

                  if (fullYear < 0) {
                    replacement = "-" + replacement;
                  }
                }

                break;

              case 'Y':
                // Year
                replacement = this.__getWeekYear(date) + "";
                var year = replacement.replace('-', '');

                if (wildcardSize > replacement.length) {
                  for (var j = year.length; j < wildcardSize; j++) {
                    year = "0" + year;
                  }
                }

                replacement = replacement.indexOf("-") != -1 ? "-" + year : year;
                break;

              case 'G':
                // Era - there is no CLDR data for ERA yet
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = fullYear > 0 ? 'AD' : 'BC';
                } else if (wildcardSize == 4) {
                  replacement = fullYear > 0 ? 'Anno Domini' : 'Before Christ';
                } else if (wildcardSize == 5) {
                  replacement = fullYear > 0 ? 'A' : 'B';
                }

                break;

              case 'Q':
                // quarter
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber(parseInt(month / 4) + 1, wildcardSize);
                }

                if (wildcardSize == 3) {
                  replacement = 'Q' + (parseInt(month / 4) + 1);
                }

                break;

              case 'q':
                // quarter stand alone
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber(parseInt(month / 4) + 1, wildcardSize);
                }

                if (wildcardSize == 3) {
                  replacement = 'Q' + (parseInt(month / 4) + 1);
                }

                break;

              case 'D':
                // Day in year (e.g. 189)
                replacement = this.__fillNumber(this.__getDayInYear(date), wildcardSize);
                break;

              case 'd':
                // Day in month
                replacement = this.__fillNumber(dayOfMonth, wildcardSize);
                break;

              case 'w':
                // Week in year (e.g. 27)
                replacement = this.__fillNumber(this.__getWeekInYear(date), wildcardSize);
                break;

              case 'W':
                // Week in year (e.g. 27)
                replacement = this.__getWeekInMonth(date);
                break;

              case 'E':
                // Day in week
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
                }

                break;

              case 'e':
                // Day in week
                var startOfWeek = qx.locale.Date.getWeekStart(locale); // the index is 1 based

                var localeDayOfWeek = 1 + (dayOfWeek - startOfWeek >= 0 ? dayOfWeek - startOfWeek : 7 + (dayOfWeek - startOfWeek));

                if (wildcardSize >= 1 && wildcardSize <= 2) {
                  replacement = this.__fillNumber(localeDayOfWeek, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
                }

                break;

              case 'c':
                // Stand-alone local day in week
                var startOfWeek = qx.locale.Date.getWeekStart(locale); // the index is 1 based

                var localeDayOfWeek = 1 + (dayOfWeek - startOfWeek >= 0 ? dayOfWeek - startOfWeek : 7 + (dayOfWeek - startOfWeek));

                if (wildcardSize == 1) {
                  replacement = '' + localeDayOfWeek;
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "stand-alone", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "stand-alone", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "stand-alone", true);
                }

                break;

              case 'M':
                // Month
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber(month + 1, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getMonthName("wide", month, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getMonthName("narrow", month, locale, "format", true);
                }

                break;

              case 'L':
                // Stand-alone month
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber(month + 1, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "stand-alone", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getMonthName("wide", month, locale, "stand-alone", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getMonthName("narrow", month, locale, "stand-alone", true);
                }

                break;

              case 'a':
                // am/pm marker
                // NOTE: 0:00 is am, 12:00 is pm
                replacement = hours < 12 ? qx.locale.Date.getAmMarker(locale) : qx.locale.Date.getPmMarker(locale);
                break;

              case 'H':
                // Hour in day (0-23)
                replacement = this.__fillNumber(hours, wildcardSize);
                break;

              case 'k':
                // Hour in day (1-24)
                replacement = this.__fillNumber(hours == 0 ? 24 : hours, wildcardSize);
                break;

              case 'K':
                // Hour in am/pm (0-11)
                replacement = this.__fillNumber(hours % 12, wildcardSize);
                break;

              case 'h':
                // Hour in am/pm (1-12)
                replacement = this.__fillNumber(hours % 12 == 0 ? 12 : hours % 12, wildcardSize);
                break;

              case 'm':
                // Minute in hour
                replacement = this.__fillNumber(minutes, wildcardSize);
                break;

              case 's':
                // Second in minute
                replacement = this.__fillNumber(seconds, wildcardSize);
                break;

              case 'S':
                // Fractional second
                replacement = this.__fillNumber(ms, 3);

                if (wildcardSize < replacement.length) {
                  replacement = replacement.substr(0, wildcardSize);
                } else {
                  while (wildcardSize > replacement.length) {
                    // if needed, fill the remaining wildcard length with trailing zeros
                    replacement += "0";
                  }
                }

                break;

              case 'z':
                // Time zone
                if (wildcardSize >= 1 && wildcardSize <= 4) {
                  replacement = "GMT" + (timezoneSign > 0 ? "-" : "+") + this.__fillNumber(Math.abs(timezoneHours), 2) + ":" + this.__fillNumber(timezoneMinutes, 2);
                }

                break;

              case 'Z':
                // RFC 822 time zone
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = (timezoneSign > 0 ? "-" : "+") + this.__fillNumber(Math.abs(timezoneHours), 2) + this.__fillNumber(timezoneMinutes, 2);
                } else {
                  replacement = "GMT" + (timezoneSign > 0 ? "-" : "+") + this.__fillNumber(Math.abs(timezoneHours), 2) + ":" + this.__fillNumber(timezoneMinutes, 2);
                }

                break;
            }

            output += replacement;
          }
        }

        return output;
      },

      /**
       * Parses a date.
       *
       * @param dateStr {String} the date to parse.
       * @return {Date} the parsed date.
       * @throws {Error} If the format is not well formed or if the date string does not
       *       match to the format.
       */
      parse: function parse(dateStr) {
        this.__initParseFeed(); // Apply the regex


        var hit = this.__parseFeed.regex.exec(dateStr);

        if (hit == null) {
          throw new Error("Date string '" + dateStr + "' does not match the date format: " + this.__format);
        } // Apply the rules


        var dateValues = {
          era: 1,
          year: 1970,
          quarter: 1,
          month: 0,
          day: 1,
          dayOfYear: 1,
          hour: 0,
          ispm: false,
          weekDay: 4,
          weekYear: 1970,
          weekOfMonth: 1,
          weekOfYear: 1,
          min: 0,
          sec: 0,
          ms: 0
        };
        var currGroup = 1;
        var applyWeekYearAfterRule = false;
        var applyDayOfYearAfterRule = false;

        for (var i = 0; i < this.__parseFeed.usedRules.length; i++) {
          var rule = this.__parseFeed.usedRules[i];
          var value = hit[currGroup];

          if (rule.field != null) {
            dateValues[rule.field] = parseInt(value, 10);
          } else {
            rule.manipulator(dateValues, value, rule.pattern);
          }

          if (rule.pattern == "Y+") {
            var yearRuleApplied = false;

            for (var k = 0; k < this.__parseFeed.usedRules.length; k++) {
              if (this.__parseFeed.usedRules[k].pattern == 'y+') {
                yearRuleApplied = true;
                break;
              }
            }

            if (!yearRuleApplied) {
              applyWeekYearAfterRule = true;
            }
          }

          if (rule.pattern.indexOf("D") != -1) {
            var dayRuleApplied = false;

            for (var k = 0; k < this.__parseFeed.usedRules.length; k++) {
              if (this.__parseFeed.usedRules[k].pattern.indexOf("d") != -1) {
                dayRuleApplied = true;
                break;
              }
            }

            if (!dayRuleApplied) {
              applyDayOfYearAfterRule = true;
            }
          }

          currGroup += rule.groups == null ? 1 : rule.groups;
        }

        if (applyWeekYearAfterRule) {
          dateValues.year = this.__getYearFromWeekYearAndMonth(dateValues.weekYear, dateValues.month, dateValues.day);
        }

        if (applyDayOfYearAfterRule) {
          var dayAndMonth = this.__getMonthAndDayFromDayOfYear(dateValues.dayOfYear, dateValues.year);

          dateValues.month = dayAndMonth.month;
          dateValues.day = dayAndMonth.day;
        }

        if (dateValues.era < 0 && dateValues.year * dateValues.era < 0) {
          dateValues.year = dateValues.year * dateValues.era;
        }

        var date = new Date(dateValues.year, dateValues.month, dateValues.day, dateValues.ispm ? dateValues.hour + 12 : dateValues.hour, dateValues.min, dateValues.sec, dateValues.ms);

        if (this.__UTC) {
          date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        }

        if (dateValues.month != date.getMonth() || dateValues.year != date.getFullYear()) {
          throw new Error("Error parsing date '" + dateStr + "': the value for day or month is too large");
        }

        return date;
      },

      /**
       * Helper method for {@link #format()} and {@link #parse()}.
       * Parses the date format.
       *
       */
      __initFormatTree: function __initFormatTree() {
        if (this.__formatTree != null) {
          return;
        }

        this.__formatTree = [];
        var currWildcardChar;
        var currWildcardSize = 0;
        var currLiteral = "";
        var format = this.__format;
        var state = "default";
        var i = 0;

        while (i < format.length) {
          var currChar = format.charAt(i);

          switch (state) {
            case "quoted_literal":
              // We are now inside a quoted literal
              // Check whether the current character is an escaped "'" character
              if (currChar == "'") {
                if (i + 1 >= format.length) {
                  // this is the last character
                  i++;
                  break;
                }

                var lookAhead = format.charAt(i + 1);

                if (lookAhead == "'") {
                  currLiteral += currChar;
                  i++;
                } else {
                  // quoted literal ends
                  i++;
                  state = "unkown";
                }
              } else {
                currLiteral += currChar;
                i++;
              }

              break;

            case "wildcard":
              // Check whether the currChar belongs to that wildcard
              if (currChar == currWildcardChar) {
                // It does -> Raise the size
                currWildcardSize++;
                i++;
              } else {
                // It does not -> The current wildcard is done
                this.__formatTree.push({
                  type: "wildcard",
                  character: currWildcardChar,
                  size: currWildcardSize
                });

                currWildcardChar = null;
                currWildcardSize = 0;
                state = "default";
              }

              break;

            default:
              // We are not (any more) in a wildcard or quoted literal -> Check what's starting here
              if (currChar >= 'a' && currChar <= 'z' || currChar >= 'A' && currChar <= 'Z') {
                // This is a letter -> All letters are wildcards
                // Start a new wildcard
                currWildcardChar = currChar;
                state = "wildcard";
              } else if (currChar == "'") {
                if (i + 1 >= format.length) {
                  // this is the last character
                  currLiteral += currChar;
                  i++;
                  break;
                }

                var lookAhead = format.charAt(i + 1);

                if (lookAhead == "'") {
                  currLiteral += currChar;
                  i++;
                }

                i++;
                state = "quoted_literal";
              } else {
                state = "default";
              }

              if (state != "default") {
                // Add the literal
                if (currLiteral.length > 0) {
                  this.__formatTree.push({
                    type: "literal",
                    text: currLiteral
                  });

                  currLiteral = "";
                }
              } else {
                // This is an unquoted literal -> Add it to the current literal
                currLiteral += currChar;
                i++;
              }

              break;
          }
        } // Add the last wildcard or literal


        if (currWildcardChar != null) {
          this.__formatTree.push({
            type: "wildcard",
            character: currWildcardChar,
            size: currWildcardSize
          });
        } else if (currLiteral.length > 0) {
          this.__formatTree.push({
            type: "literal",
            text: currLiteral
          });
        }
      },

      /**
       * Initializes the parse feed.
       *
       * The parse contains everything needed for parsing: The regular expression
       * (in compiled and uncompiled form) and the used rules.
       *
       * @throws {Error} If the date format is malformed.
       */
      __initParseFeed: function __initParseFeed() {
        if (this.__parseFeed != null) {
          // We already have the parse feed
          return;
        }

        var format = this.__format; // Initialize the rules

        this.__initParseRules();

        this.__initFormatTree(); // Get the used rules and construct the regex pattern


        var usedRules = [];
        var pattern = "^";

        for (var atomIdx = 0; atomIdx < this.__formatTree.length; atomIdx++) {
          var currAtom = this.__formatTree[atomIdx];

          if (currAtom.type == "literal") {
            pattern += qx.lang.String.escapeRegexpChars(currAtom.text);
          } else {
            // This is a wildcard
            var wildcardChar = currAtom.character;
            var wildcardSize = currAtom.size; // Get the rule for this wildcard

            var wildcardRule;

            for (var ruleIdx = 0; ruleIdx < this.__parseRules.length; ruleIdx++) {
              var rule = this.__parseRules[ruleIdx];

              if (this.__isRuleForWildcard(rule, wildcardChar, wildcardSize)) {
                // We found the right rule for the wildcard
                wildcardRule = rule;
                break;
              }
            } // Check the rule


            if (wildcardRule == null) {
              // We have no rule for that wildcard -> Malformed date format
              var wildcardStr = "";

              for (var i = 0; i < wildcardSize; i++) {
                wildcardStr += wildcardChar;
              }

              throw new Error("Malformed date format: " + format + ". Wildcard " + wildcardStr + " is not supported");
            } else {
              // Add the rule to the pattern
              usedRules.push(wildcardRule);
              pattern += wildcardRule.regex;
            }
          }
        }

        pattern += "$"; // Create the regex

        var regex;

        try {
          regex = new RegExp(pattern);
        } catch (exc) {
          throw new Error("Malformed date format: " + format);
        } // Create the this.__parseFeed


        this.__parseFeed = {
          regex: regex,
          "usedRules": usedRules,
          pattern: pattern
        };
      },

      /**
       * Checks whether the rule matches the wildcard or not.
       * @param rule {Object} the rule we try to match with the wildcard
       * @param wildcardChar {String} the character in the wildcard
       * @param wildcardSize {Integer} the number of  wildcardChar characters in the wildcard
       * @return {Boolean} if the rule matches or not
       */
      __isRuleForWildcard: function __isRuleForWildcard(rule, wildcardChar, wildcardSize) {
        if (wildcardChar === 'y' && rule.pattern === 'y+') {
          rule.regex = rule.regexFunc(wildcardSize);
          return true;
        } else if (wildcardChar === 'Y' && rule.pattern === 'Y+') {
          rule.regex = rule.regexFunc(wildcardSize);
          return true;
        } else {
          return wildcardChar == rule.pattern.charAt(0) && wildcardSize == rule.pattern.length;
        }
      },

      /**
       * Initializes the static parse rules.
       *
       */
      __initParseRules: function __initParseRules() {
        var DateFormat = qx.util.format.DateFormat;
        var LString = qx.lang.String;

        if (this.__parseRules != null) {
          // The parse rules are already initialized
          return;
        }

        var rules = this.__parseRules = [];
        var amMarker = qx.locale.Date.getAmMarker(this.getLocale()).toString() || DateFormat.AM_MARKER;
        var pmMarker = qx.locale.Date.getPmMarker(this.getLocale()).toString() || DateFormat.PM_MARKER;
        var locale = this.getLocale();

        var yearManipulator = function yearManipulator(dateValues, value) {
          value = parseInt(value, 10);

          if (value >= 0) {
            if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
              value += 2000;
            } else if (value < 100) {
              value += 1900;
            }
          }

          dateValues.year = value;
        };

        var weekYearManipulator = function weekYearManipulator(dateValues, value) {
          value = parseInt(value, 10);

          if (value >= 0) {
            if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
              value += 2000;
            } else if (value < 100) {
              value += 1900;
            }
          }

          dateValues.weekYear = value;
        };

        var monthManipulator = function monthManipulator(dateValues, value) {
          dateValues.month = parseInt(value, 10) - 1;
        };

        var localWeekDayManipulator = function localWeekDayManipulator(dateValues, value) {
          var startOfWeek = qx.locale.Date.getWeekStart(locale);
          var dayOfWeek = parseInt(value, 10) - 1 + startOfWeek <= 6 ? parseInt(value, 10) - 1 + startOfWeek : parseInt(value, 10) - 1 + startOfWeek - 7;
          dateValues.weekDay = dayOfWeek;
        };

        var ampmManipulator = function ampmManipulator(dateValues, value) {
          var pmMarker = qx.locale.Date.getPmMarker(locale).toString() || DateFormat.PM_MARKER;
          dateValues.ispm = value == pmMarker;
        };

        var noZeroHourManipulator = function noZeroHourManipulator(dateValues, value) {
          dateValues.hour = parseInt(value, 10) % 24;
        };

        var noZeroAmPmHourManipulator = function noZeroAmPmHourManipulator(dateValues, value) {
          dateValues.hour = parseInt(value, 10) % 12;
        };

        var ignoreManipulator = function ignoreManipulator(dateValues, value) {
          return;
        };

        var narrowEraNames = ['A', 'B'];

        var narrowEraNameManipulator = function narrowEraNameManipulator(dateValues, value) {
          dateValues.era = value == 'A' ? 1 : -1;
        };

        var abbrevEraNames = ['AD', 'BC'];

        var abbrevEraNameManipulator = function abbrevEraNameManipulator(dateValues, value) {
          dateValues.era = value == 'AD' ? 1 : -1;
        };

        var fullEraNames = ['Anno Domini', 'Before Christ'];

        var fullEraNameManipulator = function fullEraNameManipulator(dateValues, value) {
          dateValues.era = value == 'Anno Domini' ? 1 : -1;
        };

        var abbrevQuarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

        var abbrevQuarterManipulator = function abbrevQuarterManipulator(dateValues, value) {
          dateValues.quarter = abbrevQuarterNames.indexOf(value);
        };

        var fullQuarterNames = ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'];

        var fullQuarterManipulator = function fullQuarterManipulator(dateValues, value) {
          dateValues.quarter = fullQuarterNames.indexOf(value);
        };

        var cache = {};

        var dateNamesManipulator = function dateNamesManipulator(pattern) {
          var monthPatternLetters = ['L', 'M'];
          var dayPatternLetters = ['c', 'e', 'E'];
          var firstLetterInPattern = pattern.charAt(0);
          var isMonth = monthPatternLetters.indexOf(firstLetterInPattern) >= 0;

          var getContext = function getContext() {
            var letters = isMonth ? monthPatternLetters : dayPatternLetters;
            var context = firstLetterInPattern === letters[0] ? "stand-alone" : "format";
            var patternLength = pattern.length;
            var lengthName = 'abbreviated';

            switch (patternLength) {
              case 4:
                lengthName = 'wide';
                break;

              case 5:
                lengthName = 'narrow';
                break;

              default:
                lengthName = 'abbreviated';
            }

            return [context, lengthName];
          };

          if (!cache[pattern]) {
            cache[pattern] = {};
            var context = getContext();
            var func = isMonth ? qx.locale.Date.getMonthNames : qx.locale.Date.getDayNames;
            var names = func.call(qx.locale.Date, context[1], locale, context[0], true);

            for (var i = 0, l = names.length; i < l; i++) {
              names[i] = LString.escapeRegexpChars(names[i].toString());
            }

            cache[pattern].data = names;

            cache[pattern].func = function (dateValues, value) {
              value = LString.escapeRegexpChars(value);
              dateValues[isMonth ? 'month' : 'weekDay'] = names.indexOf(value);
            };
          }

          return cache[pattern];
        }; // Unsupported: F (Day of week in month)


        rules.push({
          pattern: "y+",
          regexFunc: function regexFunc(yNumber) {
            var regex = "(-*";

            for (var i = 0; i < yNumber; i++) {
              regex += "\\d";

              if (i === yNumber - 1 && i !== 1) {
                regex += "+?";
              }
            }

            regex += ")";
            return regex;
          },
          manipulator: yearManipulator
        });
        rules.push({
          pattern: "Y+",
          regexFunc: function regexFunc(yNumber) {
            var regex = "(-*";

            for (var i = 0; i < yNumber; i++) {
              regex += "\\d";

              if (i === yNumber - 1) {
                regex += "+?";
              }
            }

            regex += ")";
            return regex;
          },
          manipulator: weekYearManipulator
        });
        rules.push({
          pattern: "G",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GG",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GGG",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GGGG",
          regex: "(" + fullEraNames.join("|") + ")",
          manipulator: fullEraNameManipulator
        });
        rules.push({
          pattern: "GGGGG",
          regex: "(" + narrowEraNames.join("|") + ")",
          manipulator: narrowEraNameManipulator
        });
        rules.push({
          pattern: "Q",
          regex: "(\\d\\d*?)",
          field: "quarter"
        });
        rules.push({
          pattern: "QQ",
          regex: "(\\d\\d?)",
          field: "quarter"
        });
        rules.push({
          pattern: "QQQ",
          regex: "(" + abbrevQuarterNames.join("|") + ")",
          manipulator: abbrevQuarterManipulator
        });
        rules.push({
          pattern: "QQQQ",
          regex: "(" + fullQuarterNames.join("|") + ")",
          manipulator: fullQuarterManipulator
        });
        rules.push({
          pattern: "q",
          regex: "(\\d\\d*?)",
          field: "quarter"
        });
        rules.push({
          pattern: "qq",
          regex: "(\\d\\d?)",
          field: "quarter"
        });
        rules.push({
          pattern: "qqq",
          regex: "(" + abbrevQuarterNames.join("|") + ")",
          manipulator: abbrevQuarterManipulator
        });
        rules.push({
          pattern: "qqqq",
          regex: "(" + fullQuarterNames.join("|") + ")",
          manipulator: fullQuarterManipulator
        });
        rules.push({
          pattern: "M",
          regex: "(\\d\\d*?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "MM",
          regex: "(\\d\\d?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "MMM",
          regex: "(" + dateNamesManipulator("MMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMM").func
        });
        rules.push({
          pattern: "MMMM",
          regex: "(" + dateNamesManipulator("MMMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMMM").func
        });
        rules.push({
          pattern: "MMMMM",
          regex: "(" + dateNamesManipulator("MMMMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMMMM").func
        });
        rules.push({
          pattern: "L",
          regex: "(\\d\\d*?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "LL",
          regex: "(\\d\\d?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "LLL",
          regex: "(" + dateNamesManipulator("LLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLL").func
        });
        rules.push({
          pattern: "LLLL",
          regex: "(" + dateNamesManipulator("LLLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLLL").func
        });
        rules.push({
          pattern: "LLLLL",
          regex: "(" + dateNamesManipulator("LLLLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLLLL").func
        });
        rules.push({
          pattern: "dd",
          regex: "(\\d\\d?)",
          field: "day"
        });
        rules.push({
          pattern: "d",
          regex: "(\\d\\d*?)",
          field: "day"
        });
        rules.push({
          pattern: "D",
          regex: "(\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "DD",
          regex: "(\\d\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "DDD",
          regex: "(\\d\\d\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "E",
          regex: "(" + dateNamesManipulator("E").data.join("|") + ")",
          manipulator: dateNamesManipulator("E").func
        });
        rules.push({
          pattern: "EE",
          regex: "(" + dateNamesManipulator("EE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EE").func
        });
        rules.push({
          pattern: "EEE",
          regex: "(" + dateNamesManipulator("EEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEE").func
        });
        rules.push({
          pattern: "EEEE",
          regex: "(" + dateNamesManipulator("EEEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEEE").func
        });
        rules.push({
          pattern: "EEEEE",
          regex: "(" + dateNamesManipulator("EEEEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEEEE").func
        });
        rules.push({
          pattern: "e",
          regex: "(\\d?)",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "ee",
          regex: "(\\d\\d?)",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "eee",
          regex: "(" + dateNamesManipulator("eee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eee").func
        });
        rules.push({
          pattern: "eeee",
          regex: "(" + dateNamesManipulator("eeee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eeee").func
        });
        rules.push({
          pattern: "eeeee",
          regex: "(" + dateNamesManipulator("eeeee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eeeee").func
        });
        rules.push({
          pattern: "c",
          regex: "\\d?",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "ccc",
          regex: "(" + dateNamesManipulator("ccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("ccc").func
        });
        rules.push({
          pattern: "cccc",
          regex: "(" + dateNamesManipulator("cccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("cccc").func
        });
        rules.push({
          pattern: "ccccc",
          regex: "(" + dateNamesManipulator("ccccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("ccccc").func
        });
        rules.push({
          pattern: "a",
          regex: "(" + amMarker + "|" + pmMarker + ")",
          manipulator: ampmManipulator
        });
        rules.push({
          pattern: "W",
          regex: "(\\d?)",
          field: "weekOfMonth"
        });
        rules.push({
          pattern: "w",
          regex: "(\\d\\d?)",
          field: "weekOfYear"
        });
        rules.push({
          pattern: "ww",
          regex: "(\\d\\d)",
          field: "weekOfYear"
        });
        rules.push({
          pattern: "HH",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "H",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "kk",
          regex: "(\\d\\d?)",
          manipulator: noZeroHourManipulator
        });
        rules.push({
          pattern: "k",
          regex: "(\\d\\d?)",
          manipulator: noZeroHourManipulator
        });
        rules.push({
          pattern: "KK",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "K",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "hh",
          regex: "(\\d\\d?)",
          manipulator: noZeroAmPmHourManipulator
        });
        rules.push({
          pattern: "h",
          regex: "(\\d\\d?)",
          manipulator: noZeroAmPmHourManipulator
        });
        rules.push({
          pattern: "mm",
          regex: "(\\d\\d?)",
          field: "min"
        });
        rules.push({
          pattern: "m",
          regex: "(\\d\\d?)",
          field: "min"
        });
        rules.push({
          pattern: "ss",
          regex: "(\\d\\d?)",
          field: "sec"
        });
        rules.push({
          pattern: "s",
          regex: "(\\d\\d?)",
          field: "sec"
        });
        rules.push({
          pattern: "SSS",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "SS",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "S",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "Z",
          regex: "([\\+\\-]\\d\\d\\d\\d)",
          manipulator: ignoreManipulator
        });
        rules.push({
          pattern: "z",
          regex: "(GMT[\\+\\-]\\d\\d:\\d\\d)",
          manipulator: ignoreManipulator
        });
      }
    }
  });
  qx.util.format.DateFormat.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "construct": true
      },
      "qx.data.Array": {
        "construct": true
      },
      "qx.ui.core.IMultiSelection": {},
      "qx.ui.core.ISingleSelection": {}
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
   * Mixin for the selection in the data binding controller.
   * It contains an selection property which can be manipulated.
   * Remember to call the method {@link #_addChangeTargetListener} on every
   * change of the target.
   * It is also important that the elements stored in the target e.g. ListItems
   * do have the corresponding model stored as user data under the "model" key.
   */
  qx.Mixin.define("qx.data.controller.MSelection", {
    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      // check for a target property
      if (!qx.Class.hasProperty(this.constructor, "target")) {
        throw new Error("Target property is needed.");
      } // create a default selection array


      if (this.getSelection() == null) {
        this.__ownSelection = new qx.data.Array();
        this.setSelection(this.__ownSelection);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Data array containing the selected model objects. This property can be
       * manipulated directly which means that a push to the selection will also
       * select the corresponding element in the target.
       */
      selection: {
        check: "qx.data.Array",
        event: "changeSelection",
        apply: "_applySelection",
        init: null
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

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // private members //
      // set the semaphore-like variable for the selection change
      _modifingSelection: 0,
      __selectionListenerId: null,
      __selectionArrayListenerId: null,
      __ownSelection: null,

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

      /*
      ---------------------------------------------------------------------------
         APPLY METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Apply-method for setting a new selection array. Only the change listener
       * will be removed from the old array and added to the new.
       *
       * @param value {qx.data.Array} The new data array for the selection.
       * @param old {qx.data.Array|null} The old data array for the selection.
       */
      _applySelection: function _applySelection(value, old) {
        // remove the old listener if necessary
        if (this.__selectionArrayListenerId != undefined && old != undefined) {
          old.removeListenerById(this.__selectionArrayListenerId);
          this.__selectionArrayListenerId = null;
        } // add a new change listener to the changeArray


        if (value) {
          this.__selectionArrayListenerId = value.addListener("change", this.__changeSelectionArray, this);
        } // apply the new selection


        this._updateSelection();
      },

      /*
      ---------------------------------------------------------------------------
         EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the change of the data array holding the selection.
       * If a change is in the selection array, the selection update will be
       * invoked.
       */
      __changeSelectionArray: function __changeSelectionArray() {
        this._updateSelection();
      },

      /**
       * Event handler for a change in the target selection.
       * If the selection in the target has changed, the selected model objects
       * will be found and added to the selection array.
       */
      _changeTargetSelection: function _changeTargetSelection() {
        // dont do anything without a target
        if (this.getTarget() == null) {
          return;
        } // if a selection API is supported


        if (!this.__targetSupportsMultiSelection() && !this.__targetSupportsSingleSelection()) {
          return;
        } // if __changeSelectionArray is currently working, do nothing


        if (this._inSelectionModification()) {
          return;
        } // get both selections


        var targetSelection = this.getTarget().getSelection();
        var selection = this.getSelection();

        if (selection == null) {
          selection = new qx.data.Array();
          this.__ownSelection = selection;
          this.setSelection(selection);
        } // go through the target selection


        var spliceArgs = [0, selection.getLength()];

        for (var i = 0; i < targetSelection.length; i++) {
          var model = targetSelection[i].getModel();

          if (model !== null) {
            spliceArgs.push(model);
          }
        } // use splice to ensure a correct change event [BUG #4728]


        selection.splice.apply(selection, spliceArgs).dispose(); // fire the change event manually

        this.fireDataEvent("changeSelection", this.getSelection());
      },

      /*
      ---------------------------------------------------------------------------
         SELECTION
      ---------------------------------------------------------------------------
      */

      /**
       * Helper method which should be called by the classes including this
       * Mixin when the target changes.
       *
       * @param value {qx.ui.core.Widget|null} The new target.
       * @param old {qx.ui.core.Widget|null} The old target.
       */
      _addChangeTargetListener: function _addChangeTargetListener(value, old) {
        // remove the old selection listener
        if (this.__selectionListenerId != undefined && old != undefined) {
          old.removeListenerById(this.__selectionListenerId);
        }

        if (value != null) {
          // if a selection API is supported
          if (this.__targetSupportsMultiSelection() || this.__targetSupportsSingleSelection()) {
            // add a new selection listener
            this.__selectionListenerId = value.addListener("changeSelection", this._changeTargetSelection, this);
          }
        }
      },

      /**
       * Method for updating the selection. It checks for the case of single or
       * multi selection and after that checks if the selection in the selection
       * array is the same as in the target widget.
       */
      _updateSelection: function _updateSelection() {
        // do not update if no target is given
        if (!this.getTarget() || !this.getSelection()) {
          return;
        } // mark the change process in a flag


        this._startSelectionModification(); // if its a multi selection target


        if (this.__targetSupportsMultiSelection()) {
          var targetSelection = []; // go through the selection array

          for (var i = 0; i < this.getSelection().length; i++) {
            // store each item
            var model = this.getSelection().getItem(i);

            var selectable = this.__getSelectableForModel(model);

            if (selectable != null) {
              targetSelection.push(selectable);
            }
          }

          this.getTarget().setSelection(targetSelection); // get the selection of the target

          targetSelection = this.getTarget().getSelection(); // get all items selected in the list

          var targetSelectionItems = [];

          for (var i = 0; i < targetSelection.length; i++) {
            targetSelectionItems[i] = targetSelection[i].getModel();
          } // go through the controller selection


          for (var i = this.getSelection().length - 1; i >= 0; i--) {
            // if the item in the controller selection is not selected in the list
            if (!targetSelectionItems.includes(this.getSelection().getItem(i))) {
              // remove the current element and get rid of the return array
              this.getSelection().splice(i, 1).dispose();
            }
          } // if its a single selection target

        } else if (this.__targetSupportsSingleSelection()) {
          // get the model which should be selected
          var item = this.getSelection().getItem(this.getSelection().length - 1);

          if (item !== undefined) {
            // select the last selected item (old selection will be removed anyway)
            this.__selectItem(item); // remove the other items from the selection data array and get
            // rid of the return array


            this.getSelection().splice(0, this.getSelection().getLength() - 1).dispose();
          } else {
            // if there is no item to select (e.g. new model set [BUG #4125]),
            // reset the selection
            this.getTarget().resetSelection();
          }
        } // reset the changing flag


        this._endSelectionModification();

        this.fireDataEvent("changeValue", this.getSelection());
      },

      /**
       * Helper-method returning true, if the target supports multi selection.
       * @return {Boolean} true, if the target supports multi selection.
       */
      __targetSupportsMultiSelection: function __targetSupportsMultiSelection() {
        var targetClass = this.getTarget().constructor;
        return qx.Class.implementsInterface(targetClass, qx.ui.core.IMultiSelection);
      },

      /**
       * Helper-method returning true, if the target supports single selection.
       * @return {Boolean} true, if the target supports single selection.
       */
      __targetSupportsSingleSelection: function __targetSupportsSingleSelection() {
        var targetClass = this.getTarget().constructor;
        return qx.Class.implementsInterface(targetClass, qx.ui.core.ISingleSelection);
      },

      /**
       * Internal helper for selecting an item in the target. The item to select
       * is defined by a given model item.
       *
       * @param item {qx.core.Object} A model element.
       */
      __selectItem: function __selectItem(item) {
        var selectable = this.__getSelectableForModel(item); // if no selectable could be found, just return


        if (selectable == null) {
          return;
        } // if the target is multi selection able


        if (this.__targetSupportsMultiSelection()) {
          // select the item in the target
          this.getTarget().addToSelection(selectable); // if the target is single selection able
        } else if (this.__targetSupportsSingleSelection()) {
          this.getTarget().setSelection([selectable]);
        }
      },

      /**
       * Returns the list item storing the given model in its model property.
       *
       * @param model {var} The representing model of a selectable.
       * @return {Object|null} List item or <code>null</code> if none was found
       */
      __getSelectableForModel: function __getSelectableForModel(model) {
        // get all list items
        var children = this.getTarget().getSelectables(true); // go through all children and search for the child to select

        for (var i = 0; i < children.length; i++) {
          if (children[i].getModel() == model) {
            return children[i];
          }
        } // if no selectable was found


        return null;
      },

      /**
       * Helper-Method signaling that currently the selection of the target is
       * in change. That will block the change of the internal selection.
       * {@link #_endSelectionModification}
       */
      _startSelectionModification: function _startSelectionModification() {
        this._modifingSelection++;
      },

      /**
       * Helper-Method signaling that the internal changing of the targets
       * selection is over.
       * {@link #_startSelectionModification}
       */
      _endSelectionModification: function _endSelectionModification() {
        this._modifingSelection > 0 ? this._modifingSelection-- : null;
      },

      /**
       * Helper-Method for checking the state of the selection modification.
       * {@link #_startSelectionModification}
       * {@link #_endSelectionModification}
       * @return {Boolean} <code>true</code> if selection modification is active
       */
      _inSelectionModification: function _inSelectionModification() {
        return this._modifingSelection > 0;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__ownSelection) {
        this.__ownSelection.dispose();
      }
    }
  });
  qx.data.controller.MSelection.$$dbClassInfo = $$dbClassInfo;
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
      "qx.data.controller.MSelection": {
        "require": true
      },
      "qx.data.controller.ISelection": {
        "require": true
      },
      "qx.ui.core.queue.Widget": {},
      "qx.ui.form.ListItem": {},
      "qx.data.Array": {},
      "qx.lang.Object": {},
      "qx.lang.Function": {}
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
   * <h2>List Controller</h2>
   *
   * *General idea*
   * The list controller is responsible for synchronizing every list like widget
   * with a data array. It does not matter if the array contains atomic values
   * like strings of complete objects where one property holds the value for
   * the label and another property holds the icon url. You can even use converters
   * that make the label show a text corresponding to the icon, by binding both
   * label and icon to the same model property and converting one of them.
   *
   * *Features*
   *
   * * Synchronize the model and the target
   * * Label and icon are bindable
   * * Takes care of the selection
   * * Passes on the options used by {@link qx.data.SingleValueBinding#bind}
   *
   * *Usage*
   *
   * As model, only {@link qx.data.Array}s do work. The currently supported
   * targets are
   *
   * * {@link qx.ui.form.SelectBox}
   * * {@link qx.ui.form.List}
   * * {@link qx.ui.form.ComboBox}
   *
   * All the properties like model, target or any property path is bindable.
   * Especially the model is nice to bind to another selection for example.
   * The controller itself can only work if it has a model and a target set. The
   * rest of the properties may be empty.
   *
   * *Cross reference*
   *
   * * If you want to bind single values, use {@link qx.data.controller.Object}
   * * If you want to bind a tree widget, use {@link qx.data.controller.Tree}
   * * If you want to bind a form widget, use {@link qx.data.controller.Form}
   */
  qx.Class.define("qx.data.controller.List", {
    extend: qx.core.Object,
    include: qx.data.controller.MSelection,
    implement: qx.data.controller.ISelection,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param model {qx.data.Array?null} The array containing the data.
     *
     * @param target {qx.ui.core.Widget?null} The widget which should show the
     *   ListItems.
     *
     * @param labelPath {String?null} If the model contains objects, the labelPath
     *   is the path reference to the property in these objects which should be
     *   shown as label.
     */
    construct: function construct(model, target, labelPath) {
      qx.core.Object.constructor.call(this); // lookup table for filtering and sorting

      this.__lookupTable = []; // register for bound target properties and onUpdate methods
      // from the binding options

      this.__boundProperties = [];
      this.__boundPropertiesReverse = [];
      this.__onUpdate = {};

      if (labelPath != null) {
        this.setLabelPath(labelPath);
      }

      if (model != null) {
        this.setModel(model);
      }

      if (target != null) {
        this.setTarget(target);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Data array containing the data which should be shown in the list. */
      model: {
        check: "qx.data.IListData",
        apply: "_applyModel",
        event: "changeModel",
        nullable: true,
        dereference: true
      },

      /** The target widget which should show the data. */
      target: {
        apply: "_applyTarget",
        event: "changeTarget",
        nullable: true,
        init: null,
        dereference: true
      },

      /**
       * The path to the property which holds the information that should be
       * shown as a label. This is only needed if objects are stored in the model.
       */
      labelPath: {
        check: "String",
        apply: "_applyLabelPath",
        nullable: true
      },

      /**
       * The path to the property which holds the information that should be
       * shown as an icon. This is only needed if objects are stored in the model
       * and if the icon should be shown.
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
       * Delegation object, which can have one or more functions defined by the
       * {@link IControllerDelegate} interface.
       */
      delegate: {
        apply: "_applyDelegate",
        event: "changeDelegate",
        init: null,
        nullable: true
      },

      /**
       * Whether a special "null" value is included in the list
       */
      allowNull: {
        apply: "_applyAllowNull",
        event: "changeAllowNull",
        init: false,
        nullable: false,
        check: "Boolean"
      },

      /**
       * Title for the special null value entry
       */
      nullValueTitle: {
        apply: "_applyNullValueTitle",
        event: "changeNullValueTitle",
        init: null,
        nullable: true,
        check: "String"
      },

      /**
       * Icon for the special null value entry
       */
      nullValueIcon: {
        apply: "_applyNullValueIcon",
        event: "changeNullValueIcon",
        init: null,
        nullable: true,
        check: "String"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // private members
      __changeModelListenerId: null,
      __lookupTable: null,
      __onUpdate: null,
      __boundProperties: null,
      __boundPropertiesReverse: null,
      __syncTargetSelection: null,
      __syncModelSelection: null,

      /*
      ---------------------------------------------------------------------------
         PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Updates the filter and the target. This could be used if the filter
       * uses an additional parameter which changes the filter result.
       */
      update: function update() {
        this.__changeModelLength();

        this.__renewBindings();

        this._updateSelection();
      },

      /*
      ---------------------------------------------------------------------------
         APPLY METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * If a new delegate is set, it applies the stored configuration for the
       * list items to the already created list items once.
       *
       * @param value {qx.core.Object|null} The new delegate.
       * @param old {qx.core.Object|null} The old delegate.
       */
      _applyDelegate: function _applyDelegate(value, old) {
        this._setConfigureItem(value, old);

        this._setFilter(value, old);

        this._setCreateItem(value, old);

        this._setBindItem(value, old);
      },

      /**
       * Apply-method which will be called if the icon options has been changed.
       * It invokes a renewing of all set bindings.
       *
       * @param value {Map|null} The new icon options.
       * @param old {Map|null} The old icon options.
       */
      _applyIconOptions: function _applyIconOptions(value, old) {
        this.__renewBindings();
      },

      /**
       * Apply-method which will be called if the label options has been changed.
       * It invokes a renewing of all set bindings.
       *
       * @param value {Map|null} The new label options.
       * @param old {Map|null} The old label options.
       */
      _applyLabelOptions: function _applyLabelOptions(value, old) {
        this.__renewBindings();
      },

      /**
       * Apply-method which will be called if the icon path has been changed.
       * It invokes a renewing of all set bindings.
       *
       * @param value {String|null} The new icon path.
       * @param old {String|null} The old icon path.
       */
      _applyIconPath: function _applyIconPath(value, old) {
        this.__renewBindings();
      },

      /**
       * Apply-method which will be called if the label path has been changed.
       * It invokes a renewing of all set bindings.
       *
       * @param value {String|null} The new label path.
       * @param old {String|null} The old label path.
       */
      _applyLabelPath: function _applyLabelPath(value, old) {
        this.__renewBindings();
      },

      /**
       * Apply method for the `allowNull` property 
       */
      _applyAllowNull: function _applyAllowNull(value, oldValue) {
        this.__refreshModel();
      },

      /**
       * Apply method for the `allowNull` property 
       */
      _applyNullValueTitle: function _applyNullValueTitle(value, oldValue) {
        this.__refreshModel();
      },

      /**
       * Apply method for the `allowNull` property 
       */
      _applyNullValueIcon: function _applyNullValueIcon(value, oldValue) {
        this.__refreshModel();
      },

      /**
       * Refreshes the model, uses when the model and target are not changing but the appearance
       * and bindings may need to be updated
       */
      __refreshModel: function __refreshModel() {
        if (this.getModel() && this.getTarget()) {
          this.update();
        }
      },

      /**
       * Apply-method which will be called if the model has been changed. It
       * removes all the listeners from the old model and adds the needed
       * listeners to the new model. It also invokes the initial filling of the
       * target widgets if there is a target set.
       *
       * @param value {qx.data.Array|null} The new model array.
       * @param old {qx.data.Array|null} The old model array.
       */
      _applyModel: function _applyModel(value, old) {
        // remove the old listener
        if (old != undefined) {
          if (this.__changeModelListenerId != undefined) {
            old.removeListenerById(this.__changeModelListenerId);
          }
        } // erase the selection if there is something selected


        if (this.getSelection() != undefined && this.getSelection().length > 0) {
          this.getSelection().splice(0, this.getSelection().length).dispose();
        } // if a model is set


        if (value != null) {
          // add a new listener
          this.__changeModelListenerId = value.addListener("change", this.__changeModel, this); // renew the index lookup table

          this.__buildUpLookupTable(); // check for the new length


          this.__changeModelLength(); // as we only change the labels of the items, the selection change event
          // may be missing so we invoke it here


          if (old == null) {
            this._changeTargetSelection();
          } else {
            // update the selection asynchronously
            this.__syncTargetSelection = true;
            qx.ui.core.queue.Widget.add(this);
          }
        } else {
          var target = this.getTarget(); // if the model is set to null, we should remove all items in the target

          if (target != null) {
            // we need to remove the bindings too so use the controller method
            // for removing items
            var length = target.getChildren().length;

            for (var i = 0; i < length; i++) {
              this.__removeItem();
            }

            ;
          }
        }
      },

      /**
       * Apply-method which will be called if the target has been changed.
       * When the target changes, every binding needs to be reset and the old
       * target needs to be cleaned up. If there is a model, the target will be
       * filled with the data of the model.
       *
       * @param value {qx.ui.core.Widget|null} The new target.
       * @param old {qx.ui.core.Widget|null} The old target.
       */
      _applyTarget: function _applyTarget(value, old) {
        // add a listener for the target change
        this._addChangeTargetListener(value, old); // if there was an old target


        if (old != undefined) {
          // remove all element of the old target
          var removed = old.removeAll();

          for (var i = 0; i < removed.length; i++) {
            removed[i].destroy();
          } // remove all bindings


          this.removeAllBindings();
        }

        if (value != null) {
          if (this.getModel() != null) {
            // add a binding for all elements in the model
            for (var i = 0; i < this.__lookupTable.length; i++) {
              this.__addItem(this.__lookup(i));
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
         EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the change event of the model. If the model changes,
       * Only the selection needs to be changed. The change of the data will
       * be done by the binding.
       */
      __inChangeModel: false,

      /**
       * Event handler for the changeModel of the model. Updates the controller.
       */
      __changeModel: function __changeModel() {
        if (this.__inChangeModel) {
          return;
        }

        this.__inChangeModel = true; // need an asynchronous selection update because the bindings have to be
        // executed to update the selection probably (using the widget queue)
        // this.__syncTargetSelection = true;

        this.__syncModelSelection = true;
        qx.ui.core.queue.Widget.add(this); // update on filtered lists... (bindings need to be renewed)

        this.update();
        this.__inChangeModel = false;
      },

      /**
       * Internal method used to sync the selection. The controller uses the
       * widget queue to schedule the selection update. An asynchronous handling of
       * the selection is needed because the bindings (event listeners for the
       * binding) need to be executed before the selection is updated.
       * @internal
       */
      syncWidget: function syncWidget() {
        if (this.__syncTargetSelection) {
          this._changeTargetSelection();
        }

        if (this.__syncModelSelection) {
          this._updateSelection();
        }

        this.__syncModelSelection = this.__syncTargetSelection = null;
      },

      /**
       * Event handler for the changeLength of the model. If the length changes
       * of the model, either ListItems need to be removed or added to the target.
       */
      __changeModelLength: function __changeModelLength() {
        // only do something if there is a target
        if (this.getTarget() == null) {
          return;
        } // build up the look up table


        this.__buildUpLookupTable(); // get the length


        var newLength = this.__lookupTable.length;
        var currentLength = this.getTarget().getChildren().length; // if there are more item

        if (newLength > currentLength) {
          // add the new elements
          for (var j = currentLength; j < newLength; j++) {
            this.__addItem(this.__lookup(j));
          } // if there are less elements

        } else if (newLength < currentLength) {
          // remove the unnecessary items
          for (var j = currentLength; j > newLength; j--) {
            this.__removeItem();
          }
        } // build up the look up table


        this.__buildUpLookupTable(); // sync the target selection in case someone deleted a item in
        // selection mode "one" [BUG #4839]


        this.__syncTargetSelection = true;
        qx.ui.core.queue.Widget.add(this);
      },

      /**
       * Helper method which removes and adds the change listener of the
       * controller to the model. This is sometimes necessary to ensure that the
       * listener of the controller is executed as the last listener of the chain.
       */
      __moveChangeListenerAtTheEnd: function __moveChangeListenerAtTheEnd() {
        var model = this.getModel(); // it can be that the bindings has been reset without the model so
        // maybe there is no model in some scenarios

        if (model != null) {
          model.removeListenerById(this.__changeModelListenerId);
          this.__changeModelListenerId = model.addListener("change", this.__changeModel, this);
        }
      },

      /*
      ---------------------------------------------------------------------------
         ITEM HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Creates a ListItem and delegates the configure method if a delegate is
       * set and the needed function (configureItem) is available.
       *
       * @return {qx.ui.form.ListItem} The created and configured ListItem.
       */
      _createItem: function _createItem() {
        var delegate = this.getDelegate(); // check if a delegate and a create method is set

        if (delegate != null && delegate.createItem != null) {
          var item = delegate.createItem();
        } else {
          var item = new qx.ui.form.ListItem();
        } // if there is a configure method, invoke it


        if (delegate != null && delegate.configureItem != null) {
          delegate.configureItem(item);
        }

        return item;
      },

      /**
       * Internal helper to add ListItems to the target including the creation
       * of the binding.
       *
       * @param index {Number} The index of the item to add.
       */
      __addItem: function __addItem(index) {
        // create a new ListItem
        var listItem = this._createItem(); // set up the binding


        this._bindListItem(listItem, index); // add the ListItem to the target


        this.getTarget().add(listItem);
      },

      /**
       * Internal helper to remove ListItems from the target. Also the binding
       * will be removed properly.
       */
      __removeItem: function __removeItem() {
        this._startSelectionModification();

        var children = this.getTarget().getChildren(); // get the last binding id

        var index = children.length - 1; // get the item

        var oldItem = children[index];

        this._removeBindingsFrom(oldItem); // remove the item


        this.getTarget().removeAt(index);
        oldItem.destroy();

        this._endSelectionModification();
      },

      /**
       * Returns all models currently visible by the list. This method is only
       * useful if you use the filter via the {@link #delegate}.
       *
       * @return {qx.data.Array} A new data array container all the models
       *   which representation items are currently visible.
       */
      getVisibleModels: function getVisibleModels() {
        var visibleModels = [];
        var target = this.getTarget();

        if (target != null) {
          var items = target.getChildren();

          for (var i = 0; i < items.length; i++) {
            visibleModels.push(items[i].getModel());
          }

          ;
        }

        return new qx.data.Array(visibleModels);
      },

      /*
      ---------------------------------------------------------------------------
         BINDING STUFF
      ---------------------------------------------------------------------------
      */

      /**
       * Sets up the binding for the given ListItem and index.
       *
       * @param item {qx.ui.form.ListItem} The internally created and used
       *   ListItem.
       * @param index {Number} The index of the ListItem.
       */
      _bindListItem: function _bindListItem(item, index) {
        // -1 is the special, "null" value item.  Nothing to bind, just fix the display and model
        if (index < 0) {
          item.setLabel(this.getNullValueTitle() || "");
          item.setIcon(this.getNullValueIcon());
          item.setModel(null);
          return;
        }

        var delegate = this.getDelegate(); // if a delegate for creating the binding is given, use it

        if (delegate != null && delegate.bindItem != null) {
          delegate.bindItem(this, item, index); // otherwise, try to bind the listItem by default
        } else {
          this.bindDefaultProperties(item, index);
        }
      },

      /**
       * Helper-Method for binding the default properties (label, icon and model)
       * from the model to the target widget.
       *
       * This method should only be called in the
       * {@link qx.data.controller.IControllerDelegate#bindItem} function
       * implemented by the {@link #delegate} property.
       *
       * @param item {qx.ui.form.ListItem} The internally created and used
       *   ListItem.
       * @param index {Number} The index of the ListItem.
       */
      bindDefaultProperties: function bindDefaultProperties(item, index) {
        // model
        this.bindProperty("", "model", null, item, index); // label

        this.bindProperty(this.getLabelPath(), "label", this.getLabelOptions(), item, index); // if the iconPath is set

        if (this.getIconPath() != null) {
          this.bindProperty(this.getIconPath(), "icon", this.getIconOptions(), item, index);
        }
      },

      /**
       * Helper-Method for binding a given property from the model to the target
       * widget.
       * This method should only be called in the
       * {@link qx.data.controller.IControllerDelegate#bindItem} function
       * implemented by the {@link #delegate} property.
       *
       * @param sourcePath {String | null} The path to the property in the model.
       *   If you use an empty string, the whole model item will be bound.
       * @param targetProperty {String} The name of the property in the target
       *   widget.
       * @param options {Map | null} The options used by
       *   {@link qx.data.SingleValueBinding#bind} to use for the binding.
       * @param targetWidget {qx.ui.core.Widget} The target widget.
       * @param index {Number} The index of the current binding.
       */
      bindProperty: function bindProperty(sourcePath, targetProperty, options, targetWidget, index) {
        // create the options for the binding containing the old options
        // including the old onUpdate function
        if (options != null) {
          var options = qx.lang.Object.clone(options);
          this.__onUpdate[targetProperty] = options.onUpdate;
          delete options.onUpdate;
        } else {
          options = {};
          this.__onUpdate[targetProperty] = null;
        }

        options.onUpdate = qx.lang.Function.bind(this._onBindingSet, this, index);
        options.ignoreConverter = "model"; // build up the path for the binding

        var bindPath = "model[" + index + "]";

        if (sourcePath != null && sourcePath != "") {
          bindPath += "." + sourcePath;
        } // create the binding


        var id = this.bind(bindPath, targetWidget, targetProperty, options);
        targetWidget.setUserData(targetProperty + "BindingId", id); // save the bound property

        if (!this.__boundProperties.includes(targetProperty)) {
          this.__boundProperties.push(targetProperty);
        }
      },

      /**
       * Helper-Method for binding a given property from the target widget to
       * the model.
       * This method should only be called in the
       * {@link qx.data.controller.IControllerDelegate#bindItem} function
       * implemented by the {@link #delegate} property.
       *
       * @param targetPath {String | null} The path to the property in the model.
       * @param sourcePath {String} The name of the property in the target.
       * @param options {Map | null} The options to use by
       *   {@link qx.data.SingleValueBinding#bind} for the binding.
       * @param sourceWidget {qx.ui.core.Widget} The source widget.
       * @param index {Number} The index of the current binding.
       */
      bindPropertyReverse: function bindPropertyReverse(targetPath, sourcePath, options, sourceWidget, index) {
        // build up the path for the binding
        var targetBindPath = "model[" + index + "]";

        if (targetPath != null && targetPath != "") {
          targetBindPath += "." + targetPath;
        } // create the binding


        var id = sourceWidget.bind(sourcePath, this, targetBindPath, options);
        sourceWidget.setUserData(targetPath + "ReverseBindingId", id); // save the bound property

        if (!this.__boundPropertiesReverse.includes(targetPath)) {
          this.__boundPropertiesReverse.push(targetPath);
        }
      },

      /**
       * Method which will be called on the invoke of every binding. It takes
       * care of the selection on the change of the binding.
       *
       * @param index {Number} The index of the current binding.
       * @param sourceObject {qx.core.Object} The source object of the binding.
       * @param targetObject {qx.core.Object} The target object of the binding.
       */
      _onBindingSet: function _onBindingSet(index, sourceObject, targetObject) {
        // ignore the binding set if the model is already set to null
        if (this.getModel() == null || this._inSelectionModification()) {
          return;
        } // go through all bound target properties


        for (var i = 0; i < this.__boundProperties.length; i++) {
          // if there is an onUpdate for one of it, invoke it
          if (this.__onUpdate[this.__boundProperties[i]] != null) {
            this.__onUpdate[this.__boundProperties[i]]();
          }
        }
      },

      /**
       * Internal helper method to remove the binding of the given item.
       *
       * @param item {Number} The item of which the binding which should
       *   be removed.
       */
      _removeBindingsFrom: function _removeBindingsFrom(item) {
        // go through all bound target properties
        for (var i = 0; i < this.__boundProperties.length; i++) {
          // get the binding id and remove it, if possible
          var id = item.getUserData(this.__boundProperties[i] + "BindingId");

          if (id != null) {
            this.removeBinding(id);
            item.setUserData(this.__boundProperties[i] + "BindingId", null);
          }
        } // go through all reverse bound properties


        for (var i = 0; i < this.__boundPropertiesReverse.length; i++) {
          // get the binding id and remove it, if possible
          var id = item.getUserData(this.__boundPropertiesReverse[i] + "ReverseBindingId");

          if (id != null) {
            item.removeBinding(id);
            item.getUserData(this.__boundPropertiesReverse[i] + "ReverseBindingId", null);
          }
        }

        ;
      },

      /**
       * Internal helper method to renew all set bindings.
       */
      __renewBindings: function __renewBindings() {
        // ignore, if no target is set (startup)
        if (this.getTarget() == null || this.getModel() == null) {
          return;
        } // get all children of the target


        var items = this.getTarget().getChildren(); // go through all items

        for (var i = 0; i < items.length; i++) {
          this._removeBindingsFrom(items[i]); // add the new binding


          this._bindListItem(items[i], this.__lookup(i));
        } // move the controllers change handler for the model to the end of the
        // listeners queue


        this.__moveChangeListenerAtTheEnd();
      },

      /*
      ---------------------------------------------------------------------------
         DELEGATE HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Helper method for applying the delegate It checks if a configureItem
       * is set end invokes the initial process to apply the given function.
       *
       * @param value {Object} The new delegate.
       * @param old {Object} The old delegate.
       */
      _setConfigureItem: function _setConfigureItem(value, old) {
        if (value != null && value.configureItem != null && this.getTarget() != null) {
          var children = this.getTarget().getChildren();

          for (var i = 0; i < children.length; i++) {
            value.configureItem(children[i]);
          }
        }
      },

      /**
       * Helper method for applying the delegate It checks if a bindItem
       * is set end invokes the initial process to apply the given function.
       *
       * @param value {Object} The new delegate.
       * @param old {Object} The old delegate.
       */
      _setBindItem: function _setBindItem(value, old) {
        // if a new bindItem function is set
        if (value != null && value.bindItem != null) {
          // do nothing if the bindItem function did not change
          if (old != null && old.bindItem != null && value.bindItem == old.bindItem) {
            return;
          }

          this.__renewBindings();
        }
      },

      /**
       * Helper method for applying the delegate It checks if a createItem
       * is set end invokes the initial process to apply the given function.
       *
       * @param value {Object} The new delegate.
       * @param old {Object} The old delegate.
       */
      _setCreateItem: function _setCreateItem(value, old) {
        if (this.getTarget() == null || this.getModel() == null || value == null || value.createItem == null) {
          return;
        }

        this._startSelectionModification(); // remove all bindings


        var children = this.getTarget().getChildren();

        for (var i = 0, l = children.length; i < l; i++) {
          this._removeBindingsFrom(children[i]);
        } // remove all elements of the target


        var removed = this.getTarget().removeAll();

        for (var i = 0; i < removed.length; i++) {
          removed[i].destroy();
        } // update


        this.update();

        this._endSelectionModification();

        this._updateSelection();
      },

      /**
       * Apply-Method for setting the filter. It removes all bindings,
       * check if the length has changed and adds or removes the items in the
       * target. After that, the bindings will be set up again and the selection
       * will be updated.
       *
       * @param value {Function|null} The new filter function.
       * @param old {Function|null} The old filter function.
       */
      _setFilter: function _setFilter(value, old) {
        // update the filter if it has been removed
        if ((value == null || value.filter == null) && old != null && old.filter != null) {
          this.__removeFilter();
        } // check if it is necessary to do anything


        if (this.getTarget() == null || this.getModel() == null || value == null || value.filter == null) {
          return;
        } // if yes, continue


        this._startSelectionModification(); // remove all bindings


        var children = this.getTarget().getChildren();

        for (var i = 0, l = children.length; i < l; i++) {
          this._removeBindingsFrom(children[i]);
        } // store the old lookup table


        var oldTable = this.__lookupTable; // generate a new lookup table

        this.__buildUpLookupTable(); // if there are lesser items


        if (oldTable.length > this.__lookupTable.length) {
          // remove the unnecessary items
          for (var j = oldTable.length; j > this.__lookupTable.length; j--) {
            this.getTarget().removeAt(j - 1).destroy();
          } // if there are more items

        } else if (oldTable.length < this.__lookupTable.length) {
          // add the new elements
          for (var j = oldTable.length; j < this.__lookupTable.length; j++) {
            var tempItem = this._createItem();

            this.getTarget().add(tempItem);
          }
        } // bind every list item again


        var listItems = this.getTarget().getChildren();

        for (var i = 0; i < listItems.length; i++) {
          this._bindListItem(listItems[i], this.__lookup(i));
        } // move the controllers change handler for the model to the end of the
        // listeners queue


        this.__moveChangeListenerAtTheEnd();

        this._endSelectionModification();

        this._updateSelection();
      },

      /**
       * This helper is responsible for removing the filter and setting the
       * controller to a valid state without a filtering.
       */
      __removeFilter: function __removeFilter() {
        // renew the index lookup table
        this.__buildUpLookupTable(); // check for the new length


        this.__changeModelLength(); // renew the bindings


        this.__renewBindings(); // need an asynchronous selection update because the bindings have to be
        // executed to update the selection probably (using the widget queue)


        this.__syncModelSelection = true;
        qx.ui.core.queue.Widget.add(this);
      },

      /*
      ---------------------------------------------------------------------------
         LOOKUP STUFF
      ---------------------------------------------------------------------------
      */

      /**
       * Helper-Method which builds up the index lookup for the filter feature.
       * If no filter is set, the lookup table will be a 1:1 mapping.
       */
      __buildUpLookupTable: function __buildUpLookupTable() {
        var model = this.getModel();

        if (model == null) {
          return;
        }

        var delegate = this.getDelegate();

        if (delegate != null) {
          var filter = delegate.filter;
        }

        this.__lookupTable = []; // -1 is a special lookup value, to represent the "null" option 

        if (this.isAllowNull()) {
          this.__lookupTable.push(-1);
        }

        for (var i = 0; i < model.getLength(); i++) {
          if (filter == null || filter(model.getItem(i))) {
            this.__lookupTable.push(i);
          }
        }
      },

      /**
       * Function for accessing the lookup table.
       *
       * @param index {Integer} The index of the lookup table.
       * @return {Number} Item index from lookup table
       */
      __lookup: function __lookup(index) {
        return this.__lookupTable[index];
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__lookupTable = this.__onUpdate = this.__boundProperties = null;
      this.__boundPropertiesReverse = null; // remove yourself from the widget queue

      qx.ui.core.queue.Widget.remove(this);
    }
  });
  qx.data.controller.List.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.locale.Manager": {
        "construct": true
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
   * Mixin handling the valid and required properties for the form widgets.
   */
  qx.Mixin.define("qx.ui.form.MForm", {
    construct: function construct() {
      {
        qx.locale.Manager.getInstance().addListener("changeLocale", this.__onChangeLocale, this);
      }
    },
    properties: {
      /**
       * Flag signaling if a widget is valid. If a widget is invalid, an invalid
       * state will be set.
       */
      valid: {
        check: "Boolean",
        init: true,
        apply: "_applyValid",
        event: "changeValid"
      },

      /**
       * Flag signaling if a widget is required.
       */
      required: {
        check: "Boolean",
        init: false,
        event: "changeRequired"
      },

      /**
       * Message which is shown in an invalid tooltip.
       */
      invalidMessage: {
        check: "String",
        init: "",
        event: "changeInvalidMessage"
      },

      /**
       * Message which is shown in an invalid tooltip if the {@link #required} is
       * set to true.
       */
      requiredInvalidMessage: {
        check: "String",
        nullable: true,
        event: "changeInvalidMessage"
      }
    },
    members: {
      // apply method
      _applyValid: function _applyValid(value, old) {
        value ? this.removeState("invalid") : this.addState("invalid");
      },

      /**
       * Locale change event handler
       *
       * @signature function(e)
       * @param e {Event} the change event
       */
      __onChangeLocale: function __onChangeLocale(e) {
        // invalid message
        var invalidMessage = this.getInvalidMessage();

        if (invalidMessage && invalidMessage.translate) {
          this.setInvalidMessage(invalidMessage.translate());
        } // required invalid message


        var requiredInvalidMessage = this.getRequiredInvalidMessage();

        if (requiredInvalidMessage && requiredInvalidMessage.translate) {
          this.setRequiredInvalidMessage(requiredInvalidMessage.translate());
        }
      }
    },
    destruct: function destruct() {
      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this.__onChangeLocale, this);
      }
    }
  });
  qx.ui.form.MForm.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.IStringForm": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.theme.manager.Color": {},
      "qx.ui.style.Stylesheet": {
        "defer": "runtime"
      },
      "qx.bom.client.Css": {
        "construct": true
      },
      "qx.locale.Manager": {
        "construct": true,
        "defer": "runtime"
      },
      "qx.html.Input": {},
      "qx.util.ResourceManager": {},
      "qx.theme.manager.Font": {},
      "qx.bom.webfonts.WebFont": {},
      "qx.bom.Font": {},
      "qx.html.Element": {},
      "qx.bom.Label": {},
      "qx.ui.core.queue.Layout": {},
      "qx.event.type.Data": {},
      "qx.lang.Type": {},
      "qx.html.Label": {},
      "qx.bom.Stylesheet": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.name": {
          "className": "qx.bom.client.Browser"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "css.placeholder": {
          "construct": true,
          "className": "qx.bom.client.Css"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "browser.version": {
          "className": "qx.bom.client.Browser"
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
   * This is a basic form field with common functionality for
   * {@link TextArea} and {@link TextField}.
   *
   * On every keystroke the value is synchronized with the
   * value of the textfield. Value changes can be monitored by listening to the
   * {@link #input} or {@link #changeValue} events, respectively.
   */
  qx.Class.define("qx.ui.form.AbstractField", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.IStringForm, qx.ui.form.IForm],
    include: [qx.ui.form.MForm],
    type: "abstract",
    statics: {
      /** Stylesheet needed to style the native placeholder element. */
      __stylesheet: null,

      /**
       * Adds the CSS rules needed to style the native placeholder element.
       */
      __addPlaceholderRules: function __addPlaceholderRules() {
        var engine = qx.core.Environment.get("engine.name");
        var browser = qx.core.Environment.get("browser.name");
        var colorManager = qx.theme.manager.Color.getInstance();
        var color = colorManager.resolve("text-placeholder");
        var selector;

        if (engine == "gecko") {
          // see https://developer.mozilla.org/de/docs/CSS/:-moz-placeholder for details
          if (parseFloat(qx.core.Environment.get("engine.version")) >= 19) {
            selector = "input::-moz-placeholder, textarea::-moz-placeholder";
          } else {
            selector = "input:-moz-placeholder, textarea:-moz-placeholder";
          }

          qx.ui.style.Stylesheet.getInstance().addRule(selector, "color: " + color + " !important");
        } else if (engine == "webkit" && browser != "edge") {
          selector = "input.qx-placeholder-color::-webkit-input-placeholder, textarea.qx-placeholder-color::-webkit-input-placeholder";
          qx.ui.style.Stylesheet.getInstance().addRule(selector, "color: " + color);
        } else if (engine == "mshtml" || browser == "edge") {
          var separator = browser == "edge" ? "::" : ":";
          selector = ["input.qx-placeholder-color", "-ms-input-placeholder, textarea.qx-placeholder-color", "-ms-input-placeholder"].join(separator);
          qx.ui.style.Stylesheet.getInstance().addRule(selector, "color: " + color + " !important");
        }
      }
    },

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param value {String} initial text value of the input field ({@link #setValue}).
     */
    construct: function construct(value) {
      qx.ui.core.Widget.constructor.call(this); // shortcut for placeholder feature detection

      this.__useQxPlaceholder = !qx.core.Environment.get("css.placeholder");

      if (value != null) {
        this.setValue(value);
      }

      this.getContentElement().addListener("change", this._onChangeContent, this); // use qooxdoo placeholder if no native placeholder is supported

      if (this.__useQxPlaceholder) {
        // assign the placeholder text after the appearance has been applied
        this.addListener("syncAppearance", this._syncPlaceholder, this);
      } else {
        // add rules for native placeholder color
        qx.ui.form.AbstractField.__addPlaceholderRules(); // add a class to the input to restrict the placeholder color


        this.getContentElement().addClass("qx-placeholder-color");
      } // translation support


      {
        qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * The event is fired on every keystroke modifying the value of the field.
       *
       * The method {@link qx.event.type.Data#getData} returns the
       * current value of the text field.
       */
      "input": "qx.event.type.Data",

      /**
       * The event is fired each time the text field looses focus and the
       * text field values has changed.
       *
       * If you change {@link #liveUpdate} to true, the changeValue event will
       * be fired after every keystroke and not only after every focus loss. In
       * that mode, the changeValue event is equal to the {@link #input} event.
       *
       * The method {@link qx.event.type.Data#getData} returns the
       * current text value of the field.
       */
      "changeValue": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Alignment of the text
       */
      textAlign: {
        check: ["left", "center", "right"],
        nullable: true,
        themeable: true,
        apply: "_applyTextAlign"
      },

      /** Whether the field is read only */
      readOnly: {
        check: "Boolean",
        apply: "_applyReadOnly",
        event: "changeReadOnly",
        init: false
      },
      // overridden
      selectable: {
        refine: true,
        init: true
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /** Maximal number of characters that can be entered in the TextArea. */
      maxLength: {
        apply: "_applyMaxLength",
        check: "PositiveInteger",
        init: Infinity
      },

      /**
       * Whether the {@link #changeValue} event should be fired on every key
       * input. If set to true, the changeValue event is equal to the
       * {@link #input} event.
       */
      liveUpdate: {
        check: "Boolean",
        init: false
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

      /**
       * RegExp responsible for filtering the value of the textfield. the RegExp
       * gives the range of valid values.
       * Note: The regexp specified is applied to each character in turn, 
       * NOT to the entire string. So only regular expressions matching a 
       * single character make sense in the context.
       * The following example only allows digits in the textfield.
       * <pre class='javascript'>field.setFilter(/[0-9]/);</pre>
       */
      filter: {
        check: "RegExp",
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
      __nullValue: true,
      _placeholder: null,
      __oldValue: null,
      __oldInputValue: null,
      __useQxPlaceholder: true,
      __font: null,
      __webfontListenerId: null,

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      getFocusElement: function getFocusElement() {
        var el = this.getContentElement();

        if (el) {
          return el;
        }
      },

      /**
       * Creates the input element. Derived classes may override this
       * method, to create different input elements.
       *
       * @return {qx.html.Input} a new input element.
       */
      _createInputElement: function _createInputElement() {
        return new qx.html.Input("text");
      },
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        var updateInsets = this._updateInsets;
        var changes = qx.ui.form.AbstractField.prototype.renderLayout.base.call(this, left, top, width, height); // Directly return if superclass has detected that no
        // changes needs to be applied

        if (!changes) {
          return;
        }

        var inner = changes.size || updateInsets;
        var pixel = "px";

        if (inner || changes.local || changes.margin) {
          var innerWidth = width;
          var innerHeight = height;
        }

        var input = this.getContentElement(); // we don't need to update positions on native placeholders

        if (updateInsets && this.__useQxPlaceholder) {
          if (this.__useQxPlaceholder) {
            var insets = this.getInsets();

            this._getPlaceholderElement().setStyles({
              paddingTop: insets.top + pixel,
              paddingRight: insets.right + pixel,
              paddingBottom: insets.bottom + pixel,
              paddingLeft: insets.left + pixel
            });
          }
        }

        if (inner || changes.margin) {
          // we don't need to update dimensions on native placeholders
          if (this.__useQxPlaceholder) {
            var insets = this.getInsets();

            this._getPlaceholderElement().setStyles({
              "width": innerWidth - insets.left - insets.right + pixel,
              "height": innerHeight - insets.top - insets.bottom + pixel
            });
          }

          input.setStyles({
            "width": innerWidth + pixel,
            "height": innerHeight + pixel
          });

          this._renderContentElement(innerHeight, input);
        }

        if (changes.position) {
          if (this.__useQxPlaceholder) {
            this._getPlaceholderElement().setStyles({
              "left": left + pixel,
              "top": top + pixel
            });
          }
        }
      },

      /**
       * Hook into {@link qx.ui.form.AbstractField#renderLayout} method.
       * Called after the contentElement has a width and an innerWidth.
       *
       * Note: This was introduced to fix BUG#1585
       *
       * @param innerHeight {Integer} The inner height of the element.
       * @param element {Element} The element.
       */
      _renderContentElement: function _renderContentElement(innerHeight, element) {//use it in child classes
      },
      // overridden
      _createContentElement: function _createContentElement() {
        // create and add the input element
        var el = this._createInputElement(); // initialize the html input


        el.setSelectable(this.getSelectable());
        el.setEnabled(this.getEnabled()); // Add listener for input event

        el.addListener("input", this._onHtmlInput, this); // Disable HTML5 spell checking

        el.setAttribute("spellcheck", "false");
        el.addClass("qx-abstract-field"); // IE8 in standard mode needs some extra love here to receive events.

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") == 8) {
          el.setStyles({
            backgroundImage: "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")"
          });
        }

        return el;
      },
      // overridden
      _applyEnabled: function _applyEnabled(value, old) {
        qx.ui.form.AbstractField.prototype._applyEnabled.base.call(this, value, old);

        this.getContentElement().setEnabled(value);

        if (this.__useQxPlaceholder) {
          if (value) {
            this._showPlaceholder();
          } else {
            this._removePlaceholder();
          }
        } else {
          var input = this.getContentElement(); // remove the placeholder on disabled input elements

          input.setAttribute("placeholder", value ? this.getPlaceholder() : "");
        }
      },
      // default text sizes

      /**
       * @lint ignoreReferenceField(__textSize)
       */
      __textSize: {
        width: 16,
        height: 16
      },
      // overridden
      _getContentHint: function _getContentHint() {
        return {
          width: this.__textSize.width * 10,
          height: this.__textSize.height || 16
        };
      },
      // overridden
      _applyFont: function _applyFont(value, old) {
        if (old && this.__font && this.__webfontListenerId) {
          this.__font.removeListenerById(this.__webfontListenerId);

          this.__webfontListenerId = null;
        } // Apply


        var styles;

        if (value) {
          this.__font = qx.theme.manager.Font.getInstance().resolve(value);

          if (this.__font instanceof qx.bom.webfonts.WebFont) {
            this.__webfontListenerId = this.__font.addListener("changeStatus", this._onWebFontStatusChange, this);
          }

          styles = this.__font.getStyles();
        } else {
          styles = qx.bom.Font.getDefaultStyles();
        } // check if text color already set - if so this local value has higher priority


        if (this.getTextColor() != null) {
          delete styles["color"];
        } // apply the font to the content element
        // IE 8 - 10 (but not 11 Preview) will ignore the lineHeight value
        // unless it's applied directly.


        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 11) {
          qx.html.Element.flush();
          this.getContentElement().setStyles(styles, true);
        } else {
          this.getContentElement().setStyles(styles);
        } // the font will adjust automatically on native placeholders


        if (this.__useQxPlaceholder) {
          // don't apply the color to the placeholder
          delete styles["color"]; // apply the font to the placeholder

          this._getPlaceholderElement().setStyles(styles);
        } // Compute text size


        if (value) {
          this.__textSize = qx.bom.Label.getTextSize("A", styles);
        } else {
          delete this.__textSize;
        } // Update layout


        qx.ui.core.queue.Layout.add(this);
      },
      // overridden
      _applyTextColor: function _applyTextColor(value, old) {
        if (value) {
          this.getContentElement().setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
        } else {
          this.getContentElement().removeStyle("color");
        }
      },
      // property apply
      _applyMaxLength: function _applyMaxLength(value, old) {
        if (value) {
          this.getContentElement().setAttribute("maxLength", value);
        } else {
          this.getContentElement().removeAttribute("maxLength");
        }
      },
      // overridden
      tabFocus: function tabFocus() {
        qx.ui.form.AbstractField.prototype.tabFocus.base.call(this);
        this.selectAllText();
      },

      /**
       * Returns the text size.
       * @return {Map} The text size.
       */
      _getTextSize: function _getTextSize() {
        return this.__textSize;
      },

      /*
      ---------------------------------------------------------------------------
        EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for native input events. Redirects the event
       * to the widget. Also checks for the filter and max length.
       *
       * @param e {qx.event.type.Data} Input event
       */
      _onHtmlInput: function _onHtmlInput(e) {
        var value = e.getData();
        var fireEvents = true;
        this.__nullValue = false; // value unchanged; Firefox fires "input" when pressing ESC [BUG #5309]

        if (this.__oldInputValue && this.__oldInputValue === value) {
          fireEvents = false;
        } // check for the filter


        if (this.getFilter() != null) {
          var filteredValue = this._validateInput(value);

          if (filteredValue != value) {
            fireEvents = this.__oldInputValue !== filteredValue;
            value = filteredValue;
            this.getContentElement().setValue(value);
          }
        } // fire the events, if necessary


        if (fireEvents) {
          // store the old input value
          this.fireDataEvent("input", value, this.__oldInputValue);
          this.__oldInputValue = value; // check for the live change event

          if (this.getLiveUpdate()) {
            this.__fireChangeValueEvent(value);
          }
        }
      },

      /**
       * Triggers text size recalculation after a web font was loaded
       *
       * @param ev {qx.event.type.Data} "changeStatus" event
       */
      _onWebFontStatusChange: function _onWebFontStatusChange(ev) {
        if (ev.getData().valid === true) {
          var styles = this.__font.getStyles();

          this.__textSize = qx.bom.Label.getTextSize("A", styles);
          qx.ui.core.queue.Layout.add(this);
        }
      },

      /**
       * Handles the firing of the changeValue event including the local cache
       * for sending the old value in the event.
       *
       * @param value {String} The new value.
       */
      __fireChangeValueEvent: function __fireChangeValueEvent(value) {
        var old = this.__oldValue;
        this.__oldValue = value;

        if (old != value) {
          this.fireNonBubblingEvent("changeValue", qx.event.type.Data, [value, old]);
        }
      },

      /*
      ---------------------------------------------------------------------------
        TEXTFIELD VALUE API
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the value of the textfield to the given value.
       *
       * @param value {String} The new value
       */
      setValue: function setValue(value) {
        if (this.isDisposed()) {
          return null;
        } // handle null values


        if (value === null) {
          // just do nothing if null is already set
          if (this.__nullValue) {
            return value;
          }

          value = "";
          this.__nullValue = true;
        } else {
          this.__nullValue = false; // native placeholders will be removed by the browser

          if (this.__useQxPlaceholder) {
            this._removePlaceholder();
          }
        }

        if (qx.lang.Type.isString(value)) {
          var elem = this.getContentElement();

          if (elem.getValue() != value) {
            var oldValue = elem.getValue();
            elem.setValue(value);
            var data = this.__nullValue ? null : value;
            this.__oldValue = oldValue;

            this.__fireChangeValueEvent(data); // reset the input value on setValue calls [BUG #6892]


            this.__oldInputValue = this.__oldValue;
          } // native placeholders will be shown by the browser


          if (this.__useQxPlaceholder) {
            this._showPlaceholder();
          }

          return value;
        }

        throw new Error("Invalid value type: " + value);
      },

      /**
       * Returns the current value of the textfield.
       *
       * @return {String|null} The current value
       */
      getValue: function getValue() {
        return this.isDisposed() || this.__nullValue ? null : this.getContentElement().getValue();
      },

      /**
       * Resets the value to the default
       */
      resetValue: function resetValue() {
        this.setValue(null);
      },

      /**
       * Event listener for change event of content element
       *
       * @param e {qx.event.type.Data} Incoming change event
       */
      _onChangeContent: function _onChangeContent(e) {
        this.__nullValue = e.getData() === null;

        this.__fireChangeValueEvent(e.getData());
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
        return this.getContentElement().getTextSelection();
      },

      /**
       * Returns the current selection length.
       * This method only works if the widget is already created and
       * added to the document.
       *
       * @return {Integer|null}
       */
      getTextSelectionLength: function getTextSelectionLength() {
        return this.getContentElement().getTextSelectionLength();
      },

      /**
       * Returns the start of the text selection
       *
       * @return {Integer|null} Start of selection or null if not available
       */
      getTextSelectionStart: function getTextSelectionStart() {
        return this.getContentElement().getTextSelectionStart();
      },

      /**
       * Returns the end of the text selection
       *
       * @return {Integer|null} End of selection or null if not available
       */
      getTextSelectionEnd: function getTextSelectionEnd() {
        return this.getContentElement().getTextSelectionEnd();
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
        this.getContentElement().setTextSelection(start, end);
      },

      /**
       * Clears the current selection.
       * This method only works if the widget is already created and
       * added to the document.
       *
       */
      clearTextSelection: function clearTextSelection() {
        this.getContentElement().clearTextSelection();
      },

      /**
       * Selects the whole content
       *
       */
      selectAllText: function selectAllText() {
        this.setTextSelection(0);
      },

      /*
      ---------------------------------------------------------------------------
        PLACEHOLDER HELPERS
      ---------------------------------------------------------------------------
      */
      // overridden
      setLayoutParent: function setLayoutParent(parent) {
        qx.ui.form.AbstractField.prototype.setLayoutParent.base.call(this, parent);

        if (this.__useQxPlaceholder) {
          if (parent) {
            this.getLayoutParent().getContentElement().add(this._getPlaceholderElement());
          } else {
            var placeholder = this._getPlaceholderElement();

            placeholder.getParent().remove(placeholder);
          }
        }
      },

      /**
       * Helper to show the placeholder text in the field. It checks for all
       * states and possible conditions and shows the placeholder only if allowed.
       */
      _showPlaceholder: function _showPlaceholder() {
        var fieldValue = this.getValue() || "";
        var placeholder = this.getPlaceholder();

        if (placeholder != null && fieldValue == "" && !this.hasState("focused") && !this.hasState("disabled")) {
          if (this.hasState("showingPlaceholder")) {
            this._syncPlaceholder();
          } else {
            // the placeholder will be set as soon as the appearance is applied
            this.addState("showingPlaceholder");
          }
        }
      },

      /**
       * Remove the fake placeholder
       */
      _onPointerDownPlaceholder: function _onPointerDownPlaceholder() {
        window.setTimeout(function () {
          this.focus();
        }.bind(this), 0);
      },

      /**
       * Helper to remove the placeholder. Deletes the placeholder text from the
       * field and removes the state.
       */
      _removePlaceholder: function _removePlaceholder() {
        if (this.hasState("showingPlaceholder")) {
          if (this.__useQxPlaceholder) {
            this._getPlaceholderElement().setStyle("visibility", "hidden");
          }

          this.removeState("showingPlaceholder");
        }
      },

      /**
       * Updates the placeholder text with the DOM
       */
      _syncPlaceholder: function _syncPlaceholder() {
        if (this.hasState("showingPlaceholder") && this.__useQxPlaceholder) {
          this._getPlaceholderElement().setStyle("visibility", "visible");
        }
      },

      /**
       * Returns the placeholder label and creates it if necessary.
       */
      _getPlaceholderElement: function _getPlaceholderElement() {
        if (this._placeholder == null) {
          // create the placeholder
          this._placeholder = new qx.html.Label();
          var colorManager = qx.theme.manager.Color.getInstance();

          this._placeholder.setStyles({
            "zIndex": 11,
            "position": "absolute",
            "color": colorManager.resolve("text-placeholder"),
            "whiteSpace": "normal",
            // enable wrap by default
            "cursor": "text",
            "visibility": "hidden"
          });

          this._placeholder.addListener("pointerdown", this._onPointerDownPlaceholder, this);
        }

        return this._placeholder;
      },

      /**
       * Locale change event handler
       *
       * @signature function(e)
       * @param e {Event} the change event
       */
      _onChangeLocale: function _onChangeLocale(e) {
        var content = this.getPlaceholder();

        if (content && content.translate) {
          this.setPlaceholder(content.translate());
        }
      },
      // overridden
      _onChangeTheme: function _onChangeTheme() {
        qx.ui.form.AbstractField.prototype._onChangeTheme.base.call(this);

        if (this._placeholder) {
          // delete the placeholder element because it uses a theme dependent color
          this._placeholder.dispose();

          this._placeholder = null;
        }

        if (!this.__useQxPlaceholder && qx.ui.form.AbstractField.__stylesheet) {
          qx.bom.Stylesheet.removeSheet(qx.ui.form.AbstractField.__stylesheet);
          qx.ui.form.AbstractField.__stylesheet = null;

          qx.ui.form.AbstractField.__addPlaceholderRules();
        }
      },

      /**
       * Validates the the input value.
       * 
       * @param value {Object} The value to check
       * @returns The checked value
       */
      _validateInput: function _validateInput(value) {
        var filteredValue = value;
        var filter = this.getFilter(); // If no filter is set return just the value

        if (filter !== null) {
          filteredValue = "";
          var index = value.search(filter);
          var processedValue = value;

          while (index >= 0 && processedValue.length > 0) {
            filteredValue = filteredValue + processedValue.charAt(index);
            processedValue = processedValue.substring(index + 1, processedValue.length);
            index = processedValue.search(filter);
          }
        }

        return filteredValue;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyPlaceholder: function _applyPlaceholder(value, old) {
        if (this.__useQxPlaceholder) {
          this._getPlaceholderElement().setValue(value);

          if (value != null) {
            this.addListener("focusin", this._removePlaceholder, this);
            this.addListener("focusout", this._showPlaceholder, this);

            this._showPlaceholder();
          } else {
            this.removeListener("focusin", this._removePlaceholder, this);
            this.removeListener("focusout", this._showPlaceholder, this);

            this._removePlaceholder();
          }
        } else {
          // only apply if the widget is enabled
          if (this.getEnabled()) {
            this.getContentElement().setAttribute("placeholder", value);

            if (qx.core.Environment.get("browser.name") === "firefox" && parseFloat(qx.core.Environment.get("browser.version")) < 36 && this.getContentElement().getNodeName() === "textarea" && !this.getContentElement().getDomElement()) {
              /* qx Bug #8870: Firefox 35 will not display a text area's
                 placeholder text if the attribute is set before the
                 element is added to the DOM. This is fixed in FF 36. */
              this.addListenerOnce("appear", function () {
                this.getContentElement().getDomElement().removeAttribute("placeholder");
                this.getContentElement().getDomElement().setAttribute("placeholder", value);
              }, this);
            }
          }
        }
      },
      // property apply
      _applyTextAlign: function _applyTextAlign(value, old) {
        this.getContentElement().setStyle("textAlign", value);
      },
      // property apply
      _applyReadOnly: function _applyReadOnly(value, old) {
        var element = this.getContentElement();
        element.setAttribute("readOnly", value);

        if (value) {
          this.addState("readonly");
          this.setFocusable(false);
        } else {
          this.removeState("readonly");
          this.setFocusable(true);
        }
      }
    },
    defer: function defer(statics) {
      var css = "border: none;padding: 0;margin: 0;display : block;background : transparent;outline: none;appearance: none;position: absolute;autoComplete: off;resize: none;border-radius: 0;";
      qx.ui.style.Stylesheet.getInstance().addRule(".qx-abstract-field", css);
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this._placeholder) {
        this._placeholder.removeListener("pointerdown", this._onPointerDownPlaceholder, this);

        var parent = this._placeholder.getParent();

        if (parent) {
          parent.remove(this._placeholder);
        }

        this._placeholder.dispose();
      }

      this._placeholder = this.__font = null;
      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      }

      if (this.__font && this.__webfontListenerId) {
        this.__font.removeListenerById(this.__webfontListenerId);
      }

      this.getContentElement().removeListener("input", this._onHtmlInput, this);
    }
  });
  qx.ui.form.AbstractField.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.AbstractField": {
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.bom.client.Device": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "device.type": {
          "className": "qx.bom.client.Device"
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
       * Adrian Olaru (adrianolaru)
  
  ************************************************************************ */

  /**
   * The TextField is a single-line text input field.
   */
  qx.Class.define("qx.ui.form.TextField", {
    extend: qx.ui.form.AbstractField,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "textfield"
      },
      // overridden
      allowGrowY: {
        refine: true,
        init: false
      },
      // overridden
      allowShrinkY: {
        refine: true,
        init: false
      }
    },
    members: {
      // overridden
      _renderContentElement: function _renderContentElement(innerHeight, element) {
        if (qx.core.Environment.get("engine.name") == "mshtml" && (parseInt(qx.core.Environment.get("engine.version"), 10) < 9 || qx.core.Environment.get("browser.documentmode") < 9)) {
          element.setStyles({
            "line-height": innerHeight + 'px'
          });
        }
      },
      // overridden
      _createContentElement: function _createContentElement() {
        var el = qx.ui.form.TextField.prototype._createContentElement.base.call(this);

        var deviceType = qx.core.Environment.get("device.type");

        if (deviceType == "tablet" || deviceType == "mobile") {
          el.addListener("keypress", this._onKeyPress, this);
        }

        return el;
      },

      /**
      * Close the virtual keyboard if the Enter key is pressed.
      * @param evt {qx.event.type.KeySequence} the keypress event.
      */
      _onKeyPress: function _onKeyPress(evt) {
        // On return
        if (evt.getKeyIdentifier() == "Enter") {
          if (this.isFocusable()) {
            this.blur();
          } else {
            // When the text field is not focusable, blur() will raise an exception on
            // touch devices and the virtual keyboard is not closed. To work around this
            // issue, we're enabling the focus just for the blur() call.
            this.setFocusable(true);
            this.blur();
            this.setFocusable(false);
          }
        }
      }
    },
    destruct: function destruct() {
      this.getContentElement().removeListener("keypress", this._onKeyPress, this);
    }
  });
  qx.ui.form.TextField.$$dbClassInfo = $$dbClassInfo;
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
   * Form interface for all form widgets which use a numeric value as their
   * primary data type like a spinner.
   */
  qx.Interface.define("qx.ui.form.INumberForm", {
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
       * @param value {Number|null} The new value of the element.
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
       * @return {Number|null} The value.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.INumberForm.$$dbClassInfo = $$dbClassInfo;
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
   * Form interface for all widgets which deal with ranges. The spinner is a good
   * example for a range using widget.
   */
  qx.Interface.define("qx.ui.form.IRange", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        MINIMUM PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Set the minimum value of the range.
       *
       * @param min {Number} The minimum.
       */
      setMinimum: function setMinimum(min) {
        return arguments.length == 1;
      },

      /**
       * Return the current set minimum of the range.
       *
       * @return {Number} The current set minimum.
       */
      getMinimum: function getMinimum() {},

      /*
      ---------------------------------------------------------------------------
        MAXIMUM PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Set the maximum value of the range.
       *
       * @param max {Number} The maximum.
       */
      setMaximum: function setMaximum(max) {
        return arguments.length == 1;
      },

      /**
       * Return the current set maximum of the range.
       *
       * @return {Number} The current set maximum.
       */
      getMaximum: function getMaximum() {},

      /*
      ---------------------------------------------------------------------------
        SINGLESTEP PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the value for single steps in the range.
       *
       * @param step {Number} The value of the step.
       */
      setSingleStep: function setSingleStep(step) {
        return arguments.length == 1;
      },

      /**
       * Returns the value which will be stepped in a single step in the range.
       *
       * @return {Number} The current value for single steps.
       */
      getSingleStep: function getSingleStep() {},

      /*
      ---------------------------------------------------------------------------
        PAGESTEP PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the value for page steps in the range.
       *
       * @param step {Number} The value of the step.
       */
      setPageStep: function setPageStep(step) {
        return arguments.length == 1;
      },

      /**
       * Returns the value which will be stepped in a page step in the range.
       *
       * @return {Number} The current value for page steps.
       */
      getPageStep: function getPageStep() {}
    }
  });
  qx.ui.form.IRange.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.TextField": {
        "require": true
      },
      "qx.html.Input": {}
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
   * A password input field, which hides the entered text.
   */
  qx.Class.define("qx.ui.form.PasswordField", {
    extend: qx.ui.form.TextField,
    members: {
      // overridden
      _createInputElement: function _createInputElement() {
        return new qx.html.Input("password");
      }
    }
  });
  qx.ui.form.PasswordField.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.AbstractField": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.queue.Layout": {},
      "qx.ui.core.queue.Manager": {},
      "qx.html.Element": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.bom.Element": {},
      "qx.html.Input": {},
      "qx.bom.element.Dimension": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
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
       * Jonathan Weiß (jonathan_rass)
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * The TextField is a multi-line text input field.
   */
  qx.Class.define("qx.ui.form.TextArea", {
    extend: qx.ui.form.AbstractField,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param value {String?""} The text area's initial value
     */
    construct: function construct(value) {
      qx.ui.form.AbstractField.constructor.call(this, value);
      this.initWrap();
      this.addListener("roll", this._onRoll, this);
      this.addListener("resize", this._onResize, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Controls whether text wrap is activated or not. */
      wrap: {
        check: "Boolean",
        init: true,
        apply: "_applyWrap"
      },
      // overridden
      appearance: {
        refine: true,
        init: "textarea"
      },

      /** Factor for scrolling the <code>TextArea</code> with the mouse wheel. */
      singleStep: {
        check: "Integer",
        init: 20
      },

      /** Minimal line height. On default this is set to four lines. */
      minimalLineHeight: {
        check: "Integer",
        apply: "_applyMinimalLineHeight",
        init: 4
      },

      /**
      * Whether the <code>TextArea</code> should automatically adjust to
      * the height of the content.
      *
      * To set the initial height, modify {@link #minHeight}. If you wish
      * to set a minHeight below four lines of text, also set
      * {@link #minimalLineHeight}. In order to limit growing to a certain
      * height, set {@link #maxHeight} respectively. Please note that
      * autoSize is ignored when the {@link #height} property is in use.
      */
      autoSize: {
        check: "Boolean",
        apply: "_applyAutoSize",
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __areaClone: null,
      __areaHeight: null,
      __originalAreaHeight: null,
      // overridden
      setValue: function setValue(value) {
        value = qx.ui.form.TextArea.prototype.setValue.base.call(this, value);

        this.__autoSize();

        return value;
      },

      /**
       * Handles the roll for scrolling the <code>TextArea</code>.
       *
       * @param e {qx.event.type.Roll} roll event.
       */
      _onRoll: function _onRoll(e) {
        // only wheel
        if (e.getPointerType() != "wheel") {
          return;
        }

        var contentElement = this.getContentElement();
        var scrollY = contentElement.getScrollY();
        contentElement.scrollToY(scrollY + e.getDelta().y / 30 * this.getSingleStep());
        var newScrollY = contentElement.getScrollY();

        if (newScrollY != scrollY) {
          e.stop();
        }
      },

      /**
       * When the element resizes we throw away the clone and trigger autosize again, otherwise the clone would have
       * another width and the autosize calculation would be faulty.
       * 
       * @param e {qx.event.type.Data} resize event.
       */
      _onResize: function _onResize(e) {
        if (this.__areaClone) {
          this.__areaClone.dispose();

          this.__areaClone = null;

          this.__autoSize();
        }
      },

      /*
      ---------------------------------------------------------------------------
        AUTO SIZE
      ---------------------------------------------------------------------------
      */

      /**
      * Adjust height of <code>TextArea</code> so that content fits without scroll bar.
      *
      */
      __autoSize: function __autoSize() {
        if (this.isAutoSize()) {
          var clone = this.__getAreaClone();

          if (clone && this.getBounds()) {
            // Remember original area height
            this.__originalAreaHeight = this.__originalAreaHeight || this._getAreaHeight();

            var scrolledHeight = this._getScrolledAreaHeight(); // Show scroll-bar when above maxHeight, if defined


            if (this.getMaxHeight()) {
              var insets = this.getInsets();
              var innerMaxHeight = -insets.top + this.getMaxHeight() - insets.bottom;

              if (scrolledHeight > innerMaxHeight) {
                this.getContentElement().setStyle("overflowY", "auto");
              } else {
                this.getContentElement().setStyle("overflowY", "hidden");
              }
            } // Never shrink below original area height


            var desiredHeight = Math.max(scrolledHeight, this.__originalAreaHeight); // Set new height

            this._setAreaHeight(desiredHeight); // On init, the clone is not yet present. Try again on appear.

          } else {
            this.getContentElement().addListenerOnce("appear", function () {
              this.__autoSize();
            }, this);
          }
        }
      },

      /**
      * Get actual height of <code>TextArea</code>
      *
      * @return {Integer} Height of <code>TextArea</code>
      */
      _getAreaHeight: function _getAreaHeight() {
        return this.getInnerSize().height;
      },

      /**
      * Set actual height of <code>TextArea</code>
      *
      * @param height {Integer} Desired height of <code>TextArea</code>
      */
      _setAreaHeight: function _setAreaHeight(height) {
        if (this._getAreaHeight() !== height) {
          this.__areaHeight = height;
          qx.ui.core.queue.Layout.add(this); // Apply height directly. This works-around a visual glitch in WebKit
          // browsers where a line-break causes the text to be moved upwards
          // for one line. Since this change appears instantly whereas the queue
          // is computed later, a flicker is visible.

          qx.ui.core.queue.Manager.flush();

          this.__forceRewrap();
        }
      },

      /**
      * Get scrolled area height. Equals the total height of the <code>TextArea</code>,
      * as if no scroll-bar was visible.
      *
      * @return {Integer} Height of scrolled area
      */
      _getScrolledAreaHeight: function _getScrolledAreaHeight() {
        var clone = this.__getAreaClone();

        var cloneDom = clone.getDomElement();

        if (cloneDom) {
          // Clone created but not yet in DOM. Try again.
          if (!cloneDom.parentNode) {
            qx.html.Element.flush();
            return this._getScrolledAreaHeight();
          } // In WebKit and IE8, "wrap" must have been "soft" on DOM level before setting
          // "off" can disable wrapping. To fix, make sure wrap is toggled.
          // Otherwise, the height of an auto-size text area with wrapping
          // disabled initially is incorrectly computed as if wrapping was enabled.


          if (qx.core.Environment.get("engine.name") === "webkit" || qx.core.Environment.get("engine.name") == "mshtml") {
            clone.setWrap(!this.getWrap(), true);
          }

          clone.setWrap(this.getWrap(), true); // Webkit needs overflow "hidden" in order to correctly compute height

          if (qx.core.Environment.get("engine.name") === "webkit" || qx.core.Environment.get("engine.name") == "mshtml") {
            cloneDom.style.overflow = "hidden";
          } // IE >= 8 needs overflow "visible" in order to correctly compute height


          if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") >= 8) {
            cloneDom.style.overflow = "visible";
            cloneDom.style.overflowX = "hidden";
          } // Update value


          clone.setValue(this.getValue() || ""); // Force IE > 8 to update size measurements

          if (qx.core.Environment.get("engine.name") == "mshtml") {
            cloneDom.style.height = "auto";
            qx.html.Element.flush();
            cloneDom.style.height = "0";
          } // Recompute


          this.__scrollCloneToBottom(clone);

          if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") == 8) {
            // Flush required for scrollTop to return correct value
            // when initial value should be taken into consideration
            if (!cloneDom.scrollTop) {
              qx.html.Element.flush();
            }
          }

          return cloneDom.scrollTop;
        }
      },

      /**
      * Returns the area clone.
      *
      * @return {Element|null} DOM Element or <code>null</code> if there is no
      * original element
      */
      __getAreaClone: function __getAreaClone() {
        this.__areaClone = this.__areaClone || this.__createAreaClone();
        return this.__areaClone;
      },

      /**
      * Creates and prepares the area clone.
      *
      * @return {Element} Element
      */
      __createAreaClone: function __createAreaClone() {
        var orig, clone, cloneDom, cloneHtml;
        orig = this.getContentElement(); // An existing DOM element is required

        if (!orig.getDomElement()) {
          return null;
        } // Create DOM clone


        cloneDom = qx.bom.Element.clone(orig.getDomElement()); // Convert to qx.html Element

        cloneHtml = new qx.html.Input("textarea");
        cloneHtml.useElement(cloneDom);
        clone = cloneHtml; // Push out of view
        // Zero height (i.e. scrolled area equals height)

        clone.setStyles({
          position: "absolute",
          top: 0,
          left: "-9999px",
          height: 0,
          overflow: "hidden"
        }, true); // Fix attributes

        clone.removeAttribute('id');
        clone.removeAttribute('name');
        clone.setAttribute("tabIndex", "-1"); // Copy value

        clone.setValue(orig.getValue() || ""); // Attach to DOM

        clone.insertBefore(orig); // Make sure scrollTop is actual height

        this.__scrollCloneToBottom(clone);

        return clone;
      },

      /**
      * Scroll <code>TextArea</code> to bottom. That way, scrollTop reflects the height
      * of the <code>TextArea</code>.
      *
      * @param clone {Element} The <code>TextArea</code> to scroll
      */
      __scrollCloneToBottom: function __scrollCloneToBottom(clone) {
        clone = clone.getDomElement();

        if (clone) {
          clone.scrollTop = 10000;
        }
      },

      /*
      ---------------------------------------------------------------------------
        FIELD API
      ---------------------------------------------------------------------------
      */
      // overridden
      _createInputElement: function _createInputElement() {
        return new qx.html.Input("textarea", {
          overflowX: "auto",
          overflowY: "auto"
        });
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyWrap: function _applyWrap(value, old) {
        this.getContentElement().setWrap(value);

        if (this._placeholder) {
          var whiteSpace = value ? "normal" : "nowrap";

          this._placeholder.setStyle("whiteSpace", whiteSpace);
        }

        this.__autoSize();
      },
      // property apply
      _applyMinimalLineHeight: function _applyMinimalLineHeight() {
        qx.ui.core.queue.Layout.add(this);
      },
      // property apply
      _applyAutoSize: function _applyAutoSize(value, old) {
        {
          this.__warnAutoSizeAndHeight();
        }

        if (value) {
          this.__autoSize();

          this.addListener("input", this.__autoSize, this); // This is done asynchronously on purpose. The style given would
          // otherwise be overridden by the DOM changes queued in the
          // property apply for wrap. See [BUG #4493] for more details.

          if (!this.getBounds()) {
            this.addListenerOnce("appear", function () {
              this.getContentElement().setStyle("overflowY", "hidden");
            });
          } else {
            this.getContentElement().setStyle("overflowY", "hidden");
          }
        } else {
          this.removeListener("input", this.__autoSize);
          this.getContentElement().setStyle("overflowY", "auto");
        }
      },
      // property apply
      _applyDimension: function _applyDimension(value) {
        qx.ui.form.TextArea.prototype._applyDimension.base.call(this);

        {
          this.__warnAutoSizeAndHeight();
        }

        if (value === this.getMaxHeight()) {
          this.__autoSize();
        }
      },

      /**
       * Force rewrapping of text.
       *
       * The distribution of characters depends on the space available.
       * Unfortunately, browsers do not reliably (or not at all) rewrap text when
       * the size of the text area changes.
       *
       * This method is called on change of the area's size.
       */
      __forceRewrap: function __forceRewrap() {
        var content = this.getContentElement();
        var element = content.getDomElement(); // Temporarily increase width

        var width = content.getStyle("width");
        content.setStyle("width", parseInt(width, 10) + 1000 + "px", true); // Force browser to render

        if (element) {
          qx.bom.element.Dimension.getWidth(element);
        } // Restore width


        content.setStyle("width", width, true);
      },

      /**
       * Warn when both autoSize and height property are set.
       *
       */
      __warnAutoSizeAndHeight: function __warnAutoSizeAndHeight() {
        if (this.isAutoSize() && this.getHeight()) {
          this.warn("autoSize is ignored when the height property is set. If you want to set an initial height, use the minHeight property instead.");
        }
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT
      ---------------------------------------------------------------------------
      */
      // overridden
      _getContentHint: function _getContentHint() {
        var hint = qx.ui.form.TextArea.prototype._getContentHint.base.call(this); // lines of text


        hint.height = hint.height * this.getMinimalLineHeight(); // 20 character wide

        hint.width = this._getTextSize().width * 20;

        if (this.isAutoSize()) {
          hint.height = this.__areaHeight || hint.height;
        }

        return hint;
      }
    },
    destruct: function destruct() {
      this.setAutoSize(false);

      if (this.__areaClone) {
        this.__areaClone.dispose();
      }
    }
  });
  qx.ui.form.TextArea.$$dbClassInfo = $$dbClassInfo;
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Each object, which should support single selection have to
   * implement this interface.
   */
  qx.Interface.define("qx.ui.core.ISingleSelection", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the selection was modified */
      "changeSelection": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {qx.ui.core.Widget[]} List of items.
       */
      getSelection: function getSelection() {
        return true;
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if the item is not a child element.
       */
      setSelection: function setSelection(items) {
        return arguments.length == 1;
      },

      /**
       * Clears the whole selection at once.
       */
      resetSelection: function resetSelection() {
        return true;
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if the item is not a child element.
       */
      isSelected: function isSelected(item) {
        return arguments.length == 1;
      },

      /**
       * Whether the selection is empty.
       *
       * @return {Boolean} Whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return true;
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return arguments.length == 1;
      }
    }
  });
  qx.ui.core.ISingleSelection.$$dbClassInfo = $$dbClassInfo;
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
   * This interface should be used in all objects managing a set of items
   * implementing {@link qx.ui.form.IModel}.
   */
  qx.Interface.define("qx.ui.form.IModelSelection", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Tries to set the selection using the given array containing the
       * representative models for the selectables.
       *
       * @param value {Array} An array of models.
       */
      setModelSelection: function setModelSelection(value) {},

      /**
       * Returns an array of the selected models.
       *
       * @return {Array} An array containing the models of the currently selected
       *   items.
       */
      getModelSelection: function getModelSelection() {}
    }
  });
  qx.ui.form.IModelSelection.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.ui.core.SingleSelectionManager": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This mixin links all methods to manage the single selection.
   *
   * The class which includes the mixin has to implements two methods:
   *
   * <ul>
   * <li><code>_getItems</code>, this method has to return a <code>Array</code>
   *    of <code>qx.ui.core.Widget</code> that should be managed from the manager.
   * </li>
   * <li><code>_isAllowEmptySelection</code>, this method has to return a
   *    <code>Boolean</code> value for allowing empty selection or not.
   * </li>
   * </ul>
   */
  qx.Mixin.define("qx.ui.core.MSingleSelectionHandling", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the value was modified */
      "changeValue": "qx.event.type.Data",

      /** Fires after the selection was modified */
      "changeSelection": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.SingleSelectionManager} the single selection manager */
      __manager: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * setValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @param item {null|qx.ui.core.Widget} Item to set as selected value.
       * @returns {null|TypeError} The status of this operation.
       */
      setValue: function setValue(item) {
        if (null === item) {
          this.resetSelection();
          return null;
        }

        if (item instanceof qx.ui.core.Widget) {
          this.__getManager().setSelected(item);

          return null;
        } else {
          return new TypeError("Given argument is not null or a {qx.ui.core.Widget}.");
        }
      },

      /**
       * getValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @returns {null|qx.ui.core.Widget} The currently selected widget or null if there is none.
       */
      getValue: function getValue() {
        return this.__getManager().getSelected() || null;
      },

      /**
       * resetValue implements part of the {@link qx.ui.form.IField} interface.
       */
      resetValue: function resetValue() {
        this.__getManager().resetSelected();
      },

      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {qx.ui.core.Widget[]} List of items.
       */
      getSelection: function getSelection() {
        var selected = this.__getManager().getSelected();

        if (selected) {
          return [selected];
        } else {
          return [];
        }
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if one of the items is not a child element and if
       *    items contains more than one elements.
       */
      setSelection: function setSelection(items) {
        switch (items.length) {
          case 0:
            this.resetSelection();
            break;

          case 1:
            this.__getManager().setSelected(items[0]);

            break;

          default:
            throw new Error("Could only select one item, but the selection array contains " + items.length + " items!");
        }
      },

      /**
       * Clears the whole selection at once.
       */
      resetSelection: function resetSelection() {
        this.__getManager().resetSelected();
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item.
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if one of the items is not a child element.
       */
      isSelected: function isSelected(item) {
        return this.__getManager().isSelected(item);
      },

      /**
       * Whether the selection is empty.
       *
       * @return {Boolean} Whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__getManager().isSelectionEmpty();
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return this.__getManager().getSelectables(all);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>changeSelected</code> event on single
       * selection manager.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      _onChangeSelected: function _onChangeSelected(e) {
        var newValue = e.getData();
        var oldValue = e.getOldData();
        this.fireDataEvent("changeValue", newValue, oldValue);
        newValue == null ? newValue = [] : newValue = [newValue];
        oldValue == null ? oldValue = [] : oldValue = [oldValue];
        this.fireDataEvent("changeSelection", newValue, oldValue);
      },

      /**
       * Return the selection manager if it is already exists, otherwise creates
       * the manager.
       *
       * @return {qx.ui.core.SingleSelectionManager} Single selection manager.
       */
      __getManager: function __getManager() {
        if (this.__manager == null) {
          var that = this;
          this.__manager = new qx.ui.core.SingleSelectionManager({
            getItems: function getItems() {
              return that._getItems();
            },
            isItemSelectable: function isItemSelectable(item) {
              if (that._isItemSelectable) {
                return that._isItemSelectable(item);
              } else {
                return item.isVisible();
              }
            }
          });

          this.__manager.addListener("changeSelected", this._onChangeSelected, this);
        }

        this.__manager.setAllowEmptySelection(this._isAllowEmptySelection());

        return this.__manager;
      }
    },

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__manager");
    }
  });
  qx.ui.core.MSingleSelectionHandling.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.Array": {}
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
   * This mixin offers the selection of the model properties.
   * It can only be included if the object including it implements the
   * {@link qx.ui.core.ISingleSelection} interface and the selectables implement
   * the {@link qx.ui.form.IModel} interface.
   */
  qx.Mixin.define("qx.ui.form.MModelSelection", {
    construct: function construct() {
      // create the selection array
      this.__modelSelection = new qx.data.Array(); // listen to the changes

      this.__modelSelection.addListener("change", this.__onModelSelectionArrayChange, this);

      this.addListener("changeSelection", this.__onModelSelectionChange, this);
    },
    events: {
      /**
       * Pseudo event. It will never be fired because the array itself can not
       * be changed. But the event description is needed for the data binding.
       */
      changeModelSelection: "qx.event.type.Data"
    },
    members: {
      __modelSelection: null,
      __inSelectionChange: false,

      /**
       * Handler for the selection change of the including class e.g. SelectBox,
       * List, ...
       * It sets the new modelSelection via {@link #setModelSelection}.
       */
      __onModelSelectionChange: function __onModelSelectionChange() {
        if (this.__inSelectionChange) {
          return;
        }

        var data = this.getSelection(); // create the array with the modes inside

        var modelSelection = [];

        for (var i = 0; i < data.length; i++) {
          var item = data[i]; // fallback if getModel is not implemented

          var model = item.getModel ? item.getModel() : null;

          if (model !== null) {
            modelSelection.push(model);
          }
        }

        try {
          this.setModelSelection(modelSelection);
        } catch (e) {
          throw new Error("Could not set the model selection. Maybe your models are not unique? " + e);
        }
      },

      /**
       * Listener for the change of the internal model selection data array.
       */
      __onModelSelectionArrayChange: function __onModelSelectionArrayChange() {
        this.__inSelectionChange = true;
        var selectables = this.getSelectables(true);
        var itemSelection = [];

        var modelSelection = this.__modelSelection.toArray();

        for (var i = 0; i < modelSelection.length; i++) {
          var model = modelSelection[i];

          for (var j = 0; j < selectables.length; j++) {
            var selectable = selectables[j]; // fallback if getModel is not implemented

            var selectableModel = selectable.getModel ? selectable.getModel() : null;

            if (model === selectableModel) {
              itemSelection.push(selectable);
              break;
            }
          }
        }

        this.setSelection(itemSelection);
        this.__inSelectionChange = false; // check if the setting has worked

        var currentSelection = this.getSelection();

        if (!qx.lang.Array.equals(currentSelection, itemSelection)) {
          // if not, set the actual selection
          this.__onModelSelectionChange();
        }
      },

      /**
       * Returns always an array of the models of the selected items. If no
       * item is selected or no model is given, the array will be empty.
       *
       * *CAREFUL!* The model selection can only work if every item item in the
       * selection providing widget has a model property!
       *
       * @return {qx.data.Array} An array of the models of the selected items.
       */
      getModelSelection: function getModelSelection() {
        return this.__modelSelection;
      },

      /**
       * Takes the given models in the array and searches for the corresponding
       * selectables. If an selectable does have that model attached, it will be
       * selected.
       *
       * *Attention:* This method can have a time complexity of O(n^2)!
       *
       * *CAREFUL!* The model selection can only work if every item item in the
       * selection providing widget has a model property!
       *
       * @param modelSelection {Array} An array of models, which should be
       *   selected.
       */
      setModelSelection: function setModelSelection(modelSelection) {
        // check for null values
        if (!modelSelection) {
          this.__modelSelection.removeAll();

          return;
        }

        {
          this.assertArray(modelSelection, "Please use an array as parameter.");
        } // add the first two parameter

        modelSelection.unshift(this.__modelSelection.getLength()); // remove index

        modelSelection.unshift(0); // start index

        var returnArray = this.__modelSelection.splice.apply(this.__modelSelection, modelSelection);

        returnArray.dispose();
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__modelSelection");
    }
  });
  qx.ui.form.MModelSelection.$$dbClassInfo = $$dbClassInfo;
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

//# sourceMappingURL=part-boot-bundle-20.js.map
