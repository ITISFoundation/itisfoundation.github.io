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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Defines the methods needed by every marshaler which should work with the
   * qooxdoo data stores.
   */
  qx.Interface.define("qx.data.marshal.IMarshaler", {
    members: {
      /**
       * Creates for the given data the needed classes. The classes contain for
       * every key in the data a property. The classname is always the prefix
       * <code>qx.data.model</code>. Two objects containing the same keys will not
       * create two different classes.
       *
       * @param data {Object} The object for which classes should be created.
       * @param includeBubbleEvents {Boolean} Whether the model should support
       *   the bubbling of change events or not.
       */
      toClass: function toClass(data, includeBubbleEvents) {},

      /**
       * Creates for the given data the needed models. Be sure to have the classes
       * created with {@link #toClass} before calling this method.
       *
       * @param data {Object} The object for which models should be created.
       *
       * @return {qx.core.Object} The created model object.
       */
      toModel: function toModel(data) {}
    }
  });
  qx.data.marshal.IMarshaler.$$dbClassInfo = $$dbClassInfo;
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
      "qx.data.marshal.IMarshaler": {
        "require": true
      },
      "qx.lang.Type": {},
      "qx.Bootstrap": {},
      "qx.lang.String": {},
      "qx.data.marshal.MEventBubbling": {},
      "qx.data.Array": {}
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
   * This class is responsible for converting json data to class instances
   * including the creation of the classes.
   * To retrieve the native data of created models use the methods
   *   described in {@link qx.util.Serializer}.
   */
  qx.Class.define("qx.data.marshal.Json", {
    extend: qx.core.Object,
    implement: [qx.data.marshal.IMarshaler],

    /**
     * @param delegate {Object} An object containing one of the methods described
     *   in {@link qx.data.marshal.IMarshalerDelegate}.
     */
    construct: function construct(delegate) {
      qx.core.Object.constructor.call(this);
      this.__delegate = delegate;
    },
    statics: {
      $$instance: null,

      /**
       * Creates a qooxdoo object based on the given json data. This function
       * is just a static wrapper. If you want to configure the creation
       * process of the class, use {@link qx.data.marshal.Json} directly.
       *
       * @param data {Object} The object for which classes should be created.
       * @param includeBubbleEvents {Boolean} Whether the model should support
       *   the bubbling of change events or not.
       *
       * @return {qx.core.Object} An instance of the corresponding class.
       */
      createModel: function createModel(data, includeBubbleEvents) {
        // singleton for the json marshaler
        if (this.$$instance === null) {
          this.$$instance = new qx.data.marshal.Json();
        } // be sure to create the classes first


        this.$$instance.toClass(data, includeBubbleEvents); // return the model

        return this.$$instance.toModel(data);
      },

      /**
       * Legacy json hash method used as default in Qooxdoo < v6.0.
       * You can go back to the old behaviour like this:
       * 
       * <code>
       *  var marshaller = new qx.data.marshal.Json({
       *   getJsonHash: qx.data.marshal.Json.legacyJsonHash
       *  });
       * </code>
       */
      legacyJsonHash: function legacyJsonHash(data, includeBubbleEvents) {
        return Object.keys(data).sort().join('"') + (includeBubbleEvents === true ? "♥" : "");
      }
    },
    members: {
      __delegate: null,

      /**
       * Converts a given object into a hash which will be used to identify the
       * classes under the namespace <code>qx.data.model</code>.
       *
       * @param data {Object} The JavaScript object from which the hash is
       *   required.
       * @param includeBubbleEvents {Boolean?false} Whether the model should
       *   support the bubbling of change events or not.
       * @return {String} The hash representation of the given JavaScript object.
       */
      __jsonToHash: function __jsonToHash(data, includeBubbleEvents) {
        if (this.__delegate && this.__delegate.getJsonHash) {
          return this.__delegate.getJsonHash(data, includeBubbleEvents);
        }

        return Object.keys(data).sort().join('|') + (includeBubbleEvents === true ? "♥" : "");
      },

      /**
       * Get the "most enhanced" hash for a given object.  That is the hash for
       * the class that is most feature rich in respect of the bubble event
       * feature. If there are two equal classes available (defined), one with
       * and one without the bubble event feature, this method will return the
       * hash of the class that includes the bubble event.
       *
       * @param data {Object} The JavaScript object from which the hash is
       *   required.
       * @param includeBubbleEvents {Boolean} Whether the preferred model should
       *   support the bubbling of change events or not.
       *   If <code>null</code>, an automatic selection will take place which
       *   selects the "best" model currently available.
       * @return {String} The hash representation of the given JavaScript object.
       */
      __jsonToBestHash: function __jsonToBestHash(data, includeBubbleEvents) {
        // forced mode?
        //
        if (includeBubbleEvents === true) {
          return this.__jsonToHash(data, true);
        }

        if (includeBubbleEvents === false) {
          return this.__jsonToHash(data, false);
        } // automatic mode!
        //


        var hash = this.__jsonToHash(data); // without bubble event feature


        var bubbleClassHash = hash + "♥"; // with bubble event feature

        var bubbleClassName = "qx.data.model." + bubbleClassHash; // In case there's a class with bubbling, we *always* prefer that one!

        return qx.Class.isDefined(bubbleClassName) ? bubbleClassHash : hash;
      },

      /**
       * Creates for the given data the needed classes. The classes contain for
       * every key in the data a property. The classname is always the prefix
       * <code>qx.data.model</code> and the hash of the data created by
       * {@link #__jsonToHash}. Two objects containing the same keys will not
       * create two different classes. The class creation process also supports
       * the functions provided by its delegate.
       *
       * Important, please keep in mind that only valid JavaScript identifiers
       * can be used as keys in the data map. For convenience '-' in keys will
       * be removed (a-b will be ab in the end).
       *
       * @see qx.data.store.IStoreDelegate
       *
       * @param data {Object} The object for which classes should be created.
       * @param includeBubbleEvents {Boolean} Whether the model should support
       *   the bubbling of change events or not.
       */
      toClass: function toClass(data, includeBubbleEvents) {
        this.__toClass(data, includeBubbleEvents, null, 0);
      },

      /**
       * Implementation of {@link #toClass} used for recursion.
       *
       * @param data {Object} The object for which classes should be created.
       * @param includeBubbleEvents {Boolean} Whether the model should support
       *   the bubbling of change events or not.
       * @param parentProperty {String|null} The name of the property the
       *   data will be stored in.
       * @param depth {Number} The depth of the data relative to the data's root.
       */
      __toClass: function __toClass(data, includeBubbleEvents, parentProperty, depth) {
        // break on all primitive json types and qooxdoo objects
        if (!qx.lang.Type.isObject(data) || !!data.$$isString // check for localized strings
        || data instanceof qx.core.Object) {
          // check for arrays
          if (data instanceof Array || qx.Bootstrap.getClass(data) == "Array") {
            for (var i = 0; i < data.length; i++) {
              this.__toClass(data[i], includeBubbleEvents, parentProperty + "[" + i + "]", depth + 1);
            }
          } // ignore arrays and primitive types


          return;
        }

        var hash = this.__jsonToHash(data, includeBubbleEvents); // ignore rules


        if (this.__ignore(hash, parentProperty, depth)) {
          return;
        } // check for the possible child classes


        for (var key in data) {
          this.__toClass(data[key], includeBubbleEvents, key, depth + 1);
        } // class already exists


        if (qx.Class.isDefined("qx.data.model." + hash)) {
          return;
        } // class is defined by the delegate


        if (this.__delegate && this.__delegate.getModelClass && this.__delegate.getModelClass(hash, data, parentProperty, depth) != null) {
          return;
        } // create the properties map


        var properties = {}; // include the disposeItem for the dispose process.

        var members = {
          __disposeItem: this.__disposeItem
        };

        for (var key in data) {
          // apply the property names mapping
          if (this.__delegate && this.__delegate.getPropertyMapping) {
            key = this.__delegate.getPropertyMapping(key, hash);
          } // strip the unwanted characters


          key = key.replace(/-|\.|\s+/g, ""); // check for valid JavaScript identifier (leading numbers are ok)

          {
            this.assertTrue(/^[$0-9A-Za-z_]*$/.test(key), "The key '" + key + "' is not a valid JavaScript identifier.");
          }
          properties[key] = {};
          properties[key].nullable = true;
          properties[key].event = "change" + qx.lang.String.firstUp(key); // bubble events

          if (includeBubbleEvents) {
            properties[key].apply = "_applyEventPropagation";
          } // validation rules


          if (this.__delegate && this.__delegate.getValidationRule) {
            var rule = this.__delegate.getValidationRule(hash, key);

            if (rule) {
              properties[key].validate = "_validate" + key;
              members["_validate" + key] = rule;
            }
          }
        } // try to get the superclass, qx.core.Object as default


        if (this.__delegate && this.__delegate.getModelSuperClass) {
          var superClass = this.__delegate.getModelSuperClass(hash, parentProperty, depth) || qx.core.Object;
        } else {
          var superClass = qx.core.Object;
        } // try to get the mixins


        var mixins = [];

        if (this.__delegate && this.__delegate.getModelMixins) {
          var delegateMixins = this.__delegate.getModelMixins(hash, parentProperty, depth); // check if its an array


          if (!qx.lang.Type.isArray(delegateMixins)) {
            if (delegateMixins != null) {
              mixins = [delegateMixins];
            }
          } else {
            mixins = delegateMixins;
          }
        } // include the mixin for the event bubbling


        if (includeBubbleEvents) {
          mixins.push(qx.data.marshal.MEventBubbling);
        } // create the map for the class


        var newClass = {
          extend: superClass,
          include: mixins,
          properties: properties,
          members: members
        };
        qx.Class.define("qx.data.model." + hash, newClass);
      },

      /**
       * Helper for disposing items of the created class.
       *
       * @param item {var} The item to dispose.
       */
      __disposeItem: function __disposeItem(item) {
        if (!(item instanceof qx.core.Object)) {
          // ignore all non objects
          return;
        } // ignore already disposed items (could happen during shutdown)


        if (item.isDisposed()) {
          return;
        }

        item.dispose();
      },

      /**
       * Creates an instance for the given data hash.
       *
       * @param hash {String} The hash of the data for which an instance should
       *   be created.
       * @param parentProperty {String|null} The name of the property the data
       *   will be stored in.
       * @param depth {Number} The depth of the object relative to the data root.
       * @param data {Map} The data for which an instance should be created.
       * @return {qx.core.Object} An instance of the corresponding class.
       */
      __createInstance: function __createInstance(hash, data, parentProperty, depth) {
        var delegateClass; // get the class from the delegate

        if (this.__delegate && this.__delegate.getModelClass) {
          delegateClass = this.__delegate.getModelClass(hash, data, parentProperty, depth);
        }

        if (delegateClass != null) {
          return new delegateClass();
        } else {
          var className = "qx.data.model." + hash;
          var clazz = qx.Class.getByName(className);

          if (!clazz) {
            // Extra check for possible bubble-event feature inconsistency
            var noBubbleClassName = className.replace("♥", "");

            if (qx.Class.getByName(noBubbleClassName)) {
              throw new Error("Class '" + noBubbleClassName + "' found, " + "but it does not support changeBubble event.");
            }

            throw new Error("Class '" + className + "' could not be found.");
          }

          return new clazz();
        }
      },

      /**
       * Helper to decide if the delegate decides to ignore a data set.
       * @param hash {String} The property names.
       * @param parentProperty {String|null} The name of the property the data
       *   will be stored in.
       * @param depth {Number} The depth of the object relative to the data root.
       * @return {Boolean} <code>true</code> if the set should be ignored
       */
      __ignore: function __ignore(hash, parentProperty, depth) {
        var del = this.__delegate;
        return del && del.ignore && del.ignore(hash, parentProperty, depth);
      },

      /**
       * Creates for the given data the needed models. Be sure to have the classes
       * created with {@link #toClass} before calling this method. The creation
       * of the class itself is delegated to the {@link #__createInstance} method,
       * which could use the {@link qx.data.store.IStoreDelegate} methods, if
       * given.
       *
       * @param data {Object} The object for which models should be created.
       * @param includeBubbleEvents {Boolean?null} Whether the model should
       *   support the bubbling of change events or not.
       *   If omitted or <code>null</code>, an automatic selection will take place
       *   which selects the "best" model currently available.
       * @return {qx.core.Object} The created model object.
       */
      toModel: function toModel(data, includeBubbleEvents) {
        return this.__toModel(data, includeBubbleEvents, null, 0);
      },

      /**
       * Implementation of {@link #toModel} used for recursion.
       *
       * @param data {Object} The object for which models should be created.
       * @param includeBubbleEvents {Boolean|null} Whether the model should
       *   support the bubbling of change events or not.
       *   If <code>null</code>, an automatic selection will take place which
       *   selects the "best" model currently available.
       * @param parentProperty {String|null} The name of the property the
       *   data will be stored in.
       * @param depth {Number} The depth of the data relative to the data's root.
       * @return {qx.core.Object} The created model object.
       */
      __toModel: function __toModel(data, includeBubbleEvents, parentProperty, depth) {
        var isObject = qx.lang.Type.isObject(data);
        var isArray = data instanceof Array || qx.Bootstrap.getClass(data) == "Array";

        if (!isObject && !isArray || !!data.$$isString // check for localized strings
        || data instanceof qx.core.Object) {
          return data; // ignore rules
        } else if (this.__ignore(this.__jsonToBestHash(data, includeBubbleEvents), parentProperty, depth)) {
          return data;
        } else if (isArray) {
          var arrayClass = qx.data.Array;

          if (this.__delegate && this.__delegate.getArrayClass) {
            var customArrayClass = this.__delegate.getArrayClass(parentProperty, depth);

            arrayClass = customArrayClass || arrayClass;
          }

          var array = new arrayClass(); // set the auto dispose for the array

          array.setAutoDisposeItems(true);

          for (var i = 0; i < data.length; i++) {
            array.push(this.__toModel(data[i], includeBubbleEvents, parentProperty + "[" + i + "]", depth + 1));
          }

          return array;
        } else if (isObject) {
          // create an instance for the object
          var hash = this.__jsonToBestHash(data, includeBubbleEvents);

          var model = this.__createInstance(hash, data, parentProperty, depth); // go threw all element in the data


          for (var key in data) {
            // apply the property names mapping
            var propertyName = key;

            if (this.__delegate && this.__delegate.getPropertyMapping) {
              propertyName = this.__delegate.getPropertyMapping(key, hash);
            }

            var propertyNameReplaced = propertyName.replace(/-|\.|\s+/g, ""); // warn if there has been a replacement

            propertyName = propertyNameReplaced; // only set the properties if they are available [BUG #5909]

            var setterName = "set" + qx.lang.String.firstUp(propertyName);

            if (model[setterName]) {
              model[setterName](this.__toModel(data[key], includeBubbleEvents, key, depth + 1));
            }
          }

          return model;
        }

        throw new Error("Unsupported type!");
      }
    }
  });
  qx.data.marshal.Json.$$dbClassInfo = $$dbClassInfo;
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

//# sourceMappingURL=part-boot-bundle-35.js.map
