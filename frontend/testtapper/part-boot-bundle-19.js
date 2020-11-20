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
   * This mixin redirects all children handling methods to a child widget of the
   * including class. This is e.g. used in {@link qx.ui.window.Window} to add
   * child widgets directly to the window pane.
   *
   * The including class must implement the method <code>getChildrenContainer</code>,
   * which has to return the widget, to which the child widgets should be added.
   */
  qx.Mixin.define("qx.ui.core.MRemoteChildrenHandling", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Forward the call with the given function name to the children container
       *
       * @param functionName {String} name of the method to forward
       * @param a1 {var?} first argument of the method to call
       * @param a2 {var?} second argument of the method to call
       * @param a3 {var?} third argument of the method to call
       * @return {var} The return value of the forward method
       */
      __forward: function __forward(functionName, a1, a2, a3) {
        var container = this.getChildrenContainer();

        if (container === this) {
          functionName = "_" + functionName;
        }

        return container[functionName](a1, a2, a3);
      },

      /**
       * Returns the children list
       *
       * @return {qx.ui.core.LayoutItem[]} The children array (Arrays are
       *   reference types, please do not modify them in-place)
       */
      getChildren: function getChildren() {
        return this.__forward("getChildren");
      },

      /**
       * Whether the widget contains children.
       *
       * @return {Boolean} Returns <code>true</code> when the widget has children.
       */
      hasChildren: function hasChildren() {
        return this.__forward("hasChildren");
      },

      /**
       * Adds a new child widget.
       *
       * The supported keys of the layout options map depend on the layout manager
       * used to position the widget. The options are documented in the class
       * documentation of each layout manager {@link qx.ui.layout}.
       *
       * @param child {qx.ui.core.LayoutItem} the item to add.
       * @param options {Map?null} Optional layout data for item.
       * @return {qx.ui.core.Widget} This object (for chaining support)
       */
      add: function add(child, options) {
        return this.__forward("add", child, options);
      },

      /**
       * Remove the given child item.
       *
       * @param child {qx.ui.core.LayoutItem} the item to remove
       * @return {qx.ui.core.Widget} This object (for chaining support)
       */
      remove: function remove(child) {
        return this.__forward("remove", child);
      },

      /**
       * Remove all children.
       * @return {Array} An array containing the removed children.
       */
      removeAll: function removeAll() {
        return this.__forward("removeAll");
      },

      /**
       * Returns the index position of the given item if it is
       * a child item. Otherwise it returns <code>-1</code>.
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} the item to query for
       * @return {Integer} The index position or <code>-1</code> when
       *   the given item is no child of this layout.
       */
      indexOf: function indexOf(child) {
        return this.__forward("indexOf", child);
      },

      /**
       * Add a child at the specified index
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} item to add
       * @param index {Integer} Index, at which the item will be inserted
       * @param options {Map?null} Optional layout data for item.
       */
      addAt: function addAt(child, index, options) {
        this.__forward("addAt", child, index, options);
      },

      /**
       * Add an item before another already inserted item
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} item to add
       * @param before {qx.ui.core.LayoutItem} item before the new item will be inserted.
       * @param options {Map?null} Optional layout data for item.
       */
      addBefore: function addBefore(child, before, options) {
        this.__forward("addBefore", child, before, options);
      },

      /**
       * Add an item after another already inserted item
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} item to add
       * @param after {qx.ui.core.LayoutItem} item, after which the new item will be inserted
       * @param options {Map?null} Optional layout data for item.
       */
      addAfter: function addAfter(child, after, options) {
        this.__forward("addAfter", child, after, options);
      },

      /**
       * Remove the item at the specified index.
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param index {Integer} Index of the item to remove.
       * @return {qx.ui.core.LayoutItem} The removed item
       */
      removeAt: function removeAt(index) {
        return this.__forward("removeAt", index);
      }
    }
  });
  qx.ui.core.MRemoteChildrenHandling.$$dbClassInfo = $$dbClassInfo;
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
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin redirects the layout manager to a child widget of the
   * including class. This is e.g. used in {@link qx.ui.window.Window} to configure
   * the layout manager of the window pane instead of the window directly.
   *
   * The including class must implement the method <code>getChildrenContainer</code>,
   * which has to return the widget, to which the layout should be set.
   */
  qx.Mixin.define("qx.ui.core.MRemoteLayoutHandling", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set a layout manager for the widget. A a layout manager can only be connected
       * with one widget. Reset the connection with a previous widget first, if you
       * like to use it in another widget instead.
       *
       * @param layout {qx.ui.layout.Abstract} The new layout or
       *     <code>null</code> to reset the layout.
       */
      setLayout: function setLayout(layout) {
        this.getChildrenContainer().setLayout(layout);
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      getLayout: function getLayout() {
        return this.getChildrenContainer().getLayout();
      }
    }
  });
  qx.ui.core.MRemoteLayoutHandling.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.Registration": {
        "construct": true
      },
      "qx.event.handler.DragDrop": {
        "construct": true
      },
      "qx.ui.core.Widget": {},
      "qx.core.Init": {},
      "qx.lang.Object": {},
      "qx.core.ObjectRegistry": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007 David Pérez Carmona
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * David Perez Carmona (david-perez)
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Provides resizing behavior to any widget.
   */
  qx.Mixin.define("qx.ui.core.MResizable", {
    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      // Register listeners to the content
      var content = this.getContentElement();
      content.addListener("pointerdown", this.__onResizePointerDown, this, true);
      content.addListener("pointerup", this.__onResizePointerUp, this);
      content.addListener("pointermove", this.__onResizePointerMove, this);
      content.addListener("pointerout", this.__onResizePointerOut, this);
      content.addListener("losecapture", this.__onResizeLoseCapture, this); // Get a reference of the drag and drop handler

      var domElement = content.getDomElement();

      if (domElement == null) {
        domElement = window;
      }

      this.__dragDropHandler = qx.event.Registration.getManager(domElement).getHandler(qx.event.handler.DragDrop);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Whether the top edge is resizable */
      resizableTop: {
        check: "Boolean",
        init: true
      },

      /** Whether the right edge is resizable */
      resizableRight: {
        check: "Boolean",
        init: true
      },

      /** Whether the bottom edge is resizable */
      resizableBottom: {
        check: "Boolean",
        init: true
      },

      /** Whether the left edge is resizable */
      resizableLeft: {
        check: "Boolean",
        init: true
      },

      /**
       * Property group to configure the resize behaviour for all edges at once
       */
      resizable: {
        group: ["resizableTop", "resizableRight", "resizableBottom", "resizableLeft"],
        mode: "shorthand"
      },

      /** The tolerance to activate resizing */
      resizeSensitivity: {
        check: "Integer",
        init: 5
      },

      /** Whether a frame replacement should be used during the resize sequence */
      useResizeFrame: {
        check: "Boolean",
        init: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __dragDropHandler: null,
      __resizeFrame: null,
      __resizeActive: null,
      __resizeLeft: null,
      __resizeTop: null,
      __resizeStart: null,
      __resizeRange: null,
      RESIZE_TOP: 1,
      RESIZE_BOTTOM: 2,
      RESIZE_LEFT: 4,
      RESIZE_RIGHT: 8,

      /*
      ---------------------------------------------------------------------------
        CORE FEATURES
      ---------------------------------------------------------------------------
      */

      /**
       * Get the widget, which draws the resize/move frame. The resize frame is
       * shared by all widgets and is added to the root widget.
       *
       * @return {qx.ui.core.Widget} The resize frame
       */
      _getResizeFrame: function _getResizeFrame() {
        var frame = this.__resizeFrame;

        if (!frame) {
          frame = this.__resizeFrame = new qx.ui.core.Widget();
          frame.setAppearance("resize-frame");
          frame.exclude();
          qx.core.Init.getApplication().getRoot().add(frame);
        }

        return frame;
      },

      /**
       * Creates, shows and syncs the frame with the widget.
       */
      __showResizeFrame: function __showResizeFrame() {
        var location = this.getContentLocation();

        var frame = this._getResizeFrame();

        frame.setUserBounds(location.left, location.top, location.right - location.left, location.bottom - location.top);
        frame.show();
        frame.setZIndex(this.getZIndex() + 1);
      },

      /*
      ---------------------------------------------------------------------------
        RESIZE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the new boundaries at each interval
       * of the resize sequence.
       *
       * @param e {qx.event.type.Pointer} Last pointer event
       * @return {Map} A map with the computed boundaries
       */
      __computeResizeResult: function __computeResizeResult(e) {
        // Detect mode
        var resizeActive = this.__resizeActive; // Read size hint

        var hint = this.getSizeHint();
        var range = this.__resizeRange; // Read original values

        var start = this.__resizeStart;
        var width = start.width;
        var height = start.height;
        var left = start.left;
        var top = start.top;
        var diff;

        if (resizeActive & this.RESIZE_TOP || resizeActive & this.RESIZE_BOTTOM) {
          diff = Math.max(range.top, Math.min(range.bottom, e.getDocumentTop())) - this.__resizeTop;

          if (resizeActive & this.RESIZE_TOP) {
            height -= diff;
          } else {
            height += diff;
          }

          if (height < hint.minHeight) {
            height = hint.minHeight;
          } else if (height > hint.maxHeight) {
            height = hint.maxHeight;
          }

          if (resizeActive & this.RESIZE_TOP) {
            top += start.height - height;
          }
        }

        if (resizeActive & this.RESIZE_LEFT || resizeActive & this.RESIZE_RIGHT) {
          diff = Math.max(range.left, Math.min(range.right, e.getDocumentLeft())) - this.__resizeLeft;

          if (resizeActive & this.RESIZE_LEFT) {
            width -= diff;
          } else {
            width += diff;
          }

          if (width < hint.minWidth) {
            width = hint.minWidth;
          } else if (width > hint.maxWidth) {
            width = hint.maxWidth;
          }

          if (resizeActive & this.RESIZE_LEFT) {
            left += start.width - width;
          }
        }

        return {
          // left and top of the visible widget
          viewportLeft: left,
          viewportTop: top,
          parentLeft: start.bounds.left + left - start.left,
          parentTop: start.bounds.top + top - start.top,
          // dimensions of the visible widget
          width: width,
          height: height
        };
      },

      /**
       * @type {Map} Maps internal states to cursor symbols to use
       *
       * @lint ignoreReferenceField(__resizeCursors)
       */
      __resizeCursors: {
        1: "n-resize",
        2: "s-resize",
        4: "w-resize",
        8: "e-resize",
        5: "nw-resize",
        6: "sw-resize",
        9: "ne-resize",
        10: "se-resize"
      },

      /**
       * Updates the internally stored resize mode
       *
       * @param e {qx.event.type.Pointer} Last pointer event
       */
      __computeResizeMode: function __computeResizeMode(e) {
        var location = this.getContentLocation();
        var pointerTolerance = this.getResizeSensitivity();
        var pointerLeft = e.getDocumentLeft();
        var pointerTop = e.getDocumentTop();

        var resizeActive = this.__computeResizeActive(location, pointerLeft, pointerTop, pointerTolerance); // check again in case we have a corner [BUG #1200]


        if (resizeActive > 0) {
          // this is really a | (or)!
          resizeActive = resizeActive | this.__computeResizeActive(location, pointerLeft, pointerTop, pointerTolerance * 2);
        }

        this.__resizeActive = resizeActive;
      },

      /**
       * Internal helper for computing the proper resize action based on the
       * given parameters.
       *
       * @param location {Map} The current location of the widget.
       * @param pointerLeft {Integer} The left position of the pointer.
       * @param pointerTop {Integer} The top position of the pointer.
       * @param pointerTolerance {Integer} The desired distance to the edge.
       * @return {Integer} The resize active number.
       */
      __computeResizeActive: function __computeResizeActive(location, pointerLeft, pointerTop, pointerTolerance) {
        var resizeActive = 0; // TOP

        if (this.getResizableTop() && Math.abs(location.top - pointerTop) < pointerTolerance && pointerLeft > location.left - pointerTolerance && pointerLeft < location.right + pointerTolerance) {
          resizeActive += this.RESIZE_TOP; // BOTTOM
        } else if (this.getResizableBottom() && Math.abs(location.bottom - pointerTop) < pointerTolerance && pointerLeft > location.left - pointerTolerance && pointerLeft < location.right + pointerTolerance) {
          resizeActive += this.RESIZE_BOTTOM;
        } // LEFT


        if (this.getResizableLeft() && Math.abs(location.left - pointerLeft) < pointerTolerance && pointerTop > location.top - pointerTolerance && pointerTop < location.bottom + pointerTolerance) {
          resizeActive += this.RESIZE_LEFT; // RIGHT
        } else if (this.getResizableRight() && Math.abs(location.right - pointerLeft) < pointerTolerance && pointerTop > location.top - pointerTolerance && pointerTop < location.bottom + pointerTolerance) {
          resizeActive += this.RESIZE_RIGHT;
        }

        return resizeActive;
      },

      /*
      ---------------------------------------------------------------------------
        RESIZE EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the pointer down event
       *
       * @param e {qx.event.type.Pointer} The pointer event instance
       */
      __onResizePointerDown: function __onResizePointerDown(e) {
        // Check for active resize
        if (!this.__resizeActive || !this.getEnabled() || e.getPointerType() == "touch") {
          return;
        } // Add resize state


        this.addState("resize"); // Store pointer coordinates

        this.__resizeLeft = e.getDocumentLeft();
        this.__resizeTop = e.getDocumentTop(); // Cache bounds

        var location = this.getContentLocation();
        var bounds = this.getBounds();
        this.__resizeStart = {
          top: location.top,
          left: location.left,
          width: location.right - location.left,
          height: location.bottom - location.top,
          bounds: qx.lang.Object.clone(bounds)
        }; // Compute range

        var parent = this.getLayoutParent();
        var parentLocation = parent.getContentLocation();
        var parentBounds = parent.getBounds();
        this.__resizeRange = {
          left: parentLocation.left,
          top: parentLocation.top,
          right: parentLocation.left + parentBounds.width,
          bottom: parentLocation.top + parentBounds.height
        }; // Show frame if configured this way

        if (this.getUseResizeFrame()) {
          this.__showResizeFrame();
        } // Enable capturing


        this.capture(); // Stop event

        e.stop();
      },

      /**
       * Event handler for the pointer up event
       *
       * @param e {qx.event.type.Pointer} The pointer event instance
       */
      __onResizePointerUp: function __onResizePointerUp(e) {
        // Check for active resize
        if (!this.hasState("resize") || !this.getEnabled() || e.getPointerType() == "touch") {
          return;
        } // Hide frame afterwards


        if (this.getUseResizeFrame()) {
          this._getResizeFrame().exclude();
        } // Compute bounds


        var bounds = this.__computeResizeResult(e); // Sync with widget


        this.setWidth(bounds.width);
        this.setHeight(bounds.height); // Update coordinate in canvas

        if (this.getResizableLeft() || this.getResizableTop()) {
          this.setLayoutProperties({
            left: bounds.parentLeft,
            top: bounds.parentTop
          });
        } // Clear mode


        this.__resizeActive = 0; // Remove resize state

        this.removeState("resize"); // Reset cursor

        this.resetCursor();
        this.getApplicationRoot().resetGlobalCursor(); // Disable capturing

        this.releaseCapture();
        e.stopPropagation();
      },

      /**
       * Event listener for <code>losecapture</code> event.
       *
       * @param e {qx.event.type.Event} Lose capture event
       */
      __onResizeLoseCapture: function __onResizeLoseCapture(e) {
        // Check for active resize
        if (!this.__resizeActive) {
          return;
        } // Reset cursor


        this.resetCursor();
        this.getApplicationRoot().resetGlobalCursor(); // Remove drag state

        this.removeState("move"); // Hide frame afterwards

        if (this.getUseResizeFrame()) {
          this._getResizeFrame().exclude();
        }
      },

      /**
       * Event handler for the pointer move event
       *
       * @param e {qx.event.type.Pointer} The pointer event instance
       */
      __onResizePointerMove: function __onResizePointerMove(e) {
        if (!this.getEnabled() || e.getPointerType() == "touch") {
          return;
        }

        if (this.hasState("resize")) {
          var bounds = this.__computeResizeResult(e); // Update widget


          if (this.getUseResizeFrame()) {
            // Sync new bounds to frame
            var frame = this._getResizeFrame();

            frame.setUserBounds(bounds.viewportLeft, bounds.viewportTop, bounds.width, bounds.height);
          } else {
            // Update size
            this.setWidth(bounds.width);
            this.setHeight(bounds.height); // Update coordinate in canvas

            if (this.getResizableLeft() || this.getResizableTop()) {
              this.setLayoutProperties({
                left: bounds.parentLeft,
                top: bounds.parentTop
              });
            }
          } // Full stop for event


          e.stopPropagation();
        } else if (!this.hasState("maximized") && !this.__dragDropHandler.isSessionActive()) {
          this.__computeResizeMode(e);

          var resizeActive = this.__resizeActive;
          var root = this.getApplicationRoot();

          if (resizeActive) {
            var cursor = this.__resizeCursors[resizeActive];
            this.setCursor(cursor);
            root.setGlobalCursor(cursor);
          } else if (this.getCursor()) {
            this.resetCursor();
            root.resetGlobalCursor();
          }
        }
      },

      /**
       * Event handler for the pointer out event
       *
       * @param e {qx.event.type.Pointer} The pointer event instance
       */
      __onResizePointerOut: function __onResizePointerOut(e) {
        if (e.getPointerType() == "touch") {
          return;
        } // When the pointer left the window and resizing is not yet
        // active we must be sure to (especially) reset the global
        // cursor.


        if (this.getCursor() && !this.hasState("resize")) {
          this.resetCursor();
          this.getApplicationRoot().resetGlobalCursor();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.getCursor()) {
        this.getApplicationRoot().resetGlobalCursor();
      }

      if (this.__resizeFrame != null && !qx.core.ObjectRegistry.inShutDown) {
        this.__resizeFrame.destroy();

        this.__resizeFrame = null;
      }

      this.__dragDropHandler = null;
    }
  });
  qx.ui.core.MResizable.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Init": {},
      "qx.Class": {},
      "qx.ui.window.IDesktop": {}
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
   * Provides move behavior to any widget.
   *
   * The widget using the mixin must register a widget as move handle so that
   * the pointer events needed for moving it are attached to this widget).
   * <pre class='javascript'>this._activateMoveHandle(widget);</pre>
   */
  qx.Mixin.define("qx.ui.core.MMovable", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Whether the widget is movable */
      movable: {
        check: "Boolean",
        init: true
      },

      /** Whether to use a frame instead of the original widget during move sequences */
      useMoveFrame: {
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
      __moveHandle: null,
      __moveFrame: null,
      __dragRange: null,
      __dragLeft: null,
      __dragTop: null,
      __parentLeft: null,
      __parentTop: null,
      __blockerAdded: false,
      __oldBlockerColor: null,
      __oldBlockerOpacity: 0,

      /*
      ---------------------------------------------------------------------------
        CORE FEATURES
      ---------------------------------------------------------------------------
      */

      /**
       * Configures the given widget as a move handle
       *
       * @param widget {qx.ui.core.Widget} Widget to activate as move handle
       */
      _activateMoveHandle: function _activateMoveHandle(widget) {
        if (this.__moveHandle) {
          throw new Error("The move handle could not be redefined!");
        }

        this.__moveHandle = widget;
        widget.addListener("pointerdown", this._onMovePointerDown, this);
        widget.addListener("pointerup", this._onMovePointerUp, this);
        widget.addListener("pointermove", this._onMovePointerMove, this);
        widget.addListener("losecapture", this.__onMoveLoseCapture, this);
      },

      /**
       * Get the widget, which draws the resize/move frame.
       *
       * @return {qx.ui.core.Widget} The resize frame
       */
      __getMoveFrame: function __getMoveFrame() {
        var frame = this.__moveFrame;

        if (!frame) {
          frame = this.__moveFrame = new qx.ui.core.Widget();
          frame.setAppearance("move-frame");
          frame.exclude();
          qx.core.Init.getApplication().getRoot().add(frame);
        }

        return frame;
      },

      /**
       * Creates, shows and syncs the frame with the widget.
       */
      __showMoveFrame: function __showMoveFrame() {
        var location = this.getContentLocation();
        var bounds = this.getBounds();

        var frame = this.__getMoveFrame();

        frame.setUserBounds(location.left, location.top, bounds.width, bounds.height);
        frame.show();
        frame.setZIndex(this.getZIndex() + 1);
      },

      /*
      ---------------------------------------------------------------------------
        MOVE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the new drag coordinates
       *
       * @param e {qx.event.type.Pointer} Pointer event
       * @return {Map} A map with the computed drag coordinates
       */
      __computeMoveCoordinates: function __computeMoveCoordinates(e) {
        var range = this.__dragRange;
        var pointerLeft = Math.max(range.left, Math.min(range.right, e.getDocumentLeft()));
        var pointerTop = Math.max(range.top, Math.min(range.bottom, e.getDocumentTop()));
        var viewportLeft = this.__dragLeft + pointerLeft;
        var viewportTop = this.__dragTop + pointerTop;
        return {
          viewportLeft: parseInt(viewportLeft, 10),
          viewportTop: parseInt(viewportTop, 10),
          parentLeft: parseInt(viewportLeft - this.__parentLeft, 10),
          parentTop: parseInt(viewportTop - this.__parentTop, 10)
        };
      },

      /*
      ---------------------------------------------------------------------------
        MOVE EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Roll handler which prevents the scrolling via tap & move on parent widgets
       * during the move of the widget.
       * @param e {qx.event.type.Roll} The roll event
       */
      _onMoveRoll: function _onMoveRoll(e) {
        e.stop();
      },

      /**
       * Enables the capturing of the caption bar and prepares the drag session and the
       * appearance (translucent, frame or opaque) for the moving of the window.
       *
       * @param e {qx.event.type.Pointer} pointer down event
       */
      _onMovePointerDown: function _onMovePointerDown(e) {
        if (!this.getMovable() || this.hasState("maximized")) {
          return;
        }

        this.addListener("roll", this._onMoveRoll, this); // Compute drag range

        var parent = this.getLayoutParent();
        var parentLocation = parent.getContentLocation();
        var parentBounds = parent.getBounds(); // Added a blocker, this solves the issue described in [BUG #1462]

        if (qx.Class.implementsInterface(parent, qx.ui.window.IDesktop)) {
          if (!parent.isBlocked()) {
            this.__oldBlockerColor = parent.getBlockerColor();
            this.__oldBlockerOpacity = parent.getBlockerOpacity();
            parent.setBlockerColor(null);
            parent.setBlockerOpacity(1);
            parent.blockContent(this.getZIndex() - 1);
            this.__blockerAdded = true;
          }
        }

        this.__dragRange = {
          left: parentLocation.left,
          top: parentLocation.top,
          right: parentLocation.left + parentBounds.width,
          bottom: parentLocation.top + parentBounds.height
        }; // Compute drag positions

        var widgetLocation = this.getContentLocation();
        this.__parentLeft = parentLocation.left;
        this.__parentTop = parentLocation.top;
        this.__dragLeft = widgetLocation.left - e.getDocumentLeft();
        this.__dragTop = widgetLocation.top - e.getDocumentTop(); // Add state

        this.addState("move"); // Enable capturing

        this.__moveHandle.capture(); // Enable drag frame


        if (this.getUseMoveFrame()) {
          this.__showMoveFrame();
        } // Stop event


        e.stop();
      },

      /**
       * Does the moving of the window by rendering the position
       * of the window (or frame) at runtime using direct dom methods.
       *
       * @param e {qx.event.type.Pointer} pointer move event
       */
      _onMovePointerMove: function _onMovePointerMove(e) {
        // Only react when dragging is active
        if (!this.hasState("move")) {
          return;
        } // Apply new coordinates using DOM


        var coords = this.__computeMoveCoordinates(e);

        if (this.getUseMoveFrame()) {
          this.__getMoveFrame().setDomPosition(coords.viewportLeft, coords.viewportTop);
        } else {
          var insets = this.getLayoutParent().getInsets();
          this.setDomPosition(coords.parentLeft - (insets.left || 0), coords.parentTop - (insets.top || 0));
        }

        e.stopPropagation();
      },

      /**
       * Disables the capturing of the caption bar and moves the window
       * to the last position of the drag session. Also restores the appearance
       * of the window.
       *
       * @param e {qx.event.type.Pointer} pointer up event
       */
      _onMovePointerUp: function _onMovePointerUp(e) {
        if (this.hasListener("roll")) {
          this.removeListener("roll", this._onMoveRoll, this);
        } // Only react when dragging is active


        if (!this.hasState("move")) {
          return;
        } // Remove drag state


        this.removeState("move"); // Removed blocker, this solves the issue described in [BUG #1462]

        var parent = this.getLayoutParent();

        if (qx.Class.implementsInterface(parent, qx.ui.window.IDesktop)) {
          if (this.__blockerAdded) {
            parent.unblock();
            parent.setBlockerColor(this.__oldBlockerColor);
            parent.setBlockerOpacity(this.__oldBlockerOpacity);
            this.__oldBlockerColor = null;
            this.__oldBlockerOpacity = 0;
            this.__blockerAdded = false;
          }
        } // Disable capturing


        this.__moveHandle.releaseCapture(); // Apply them to the layout


        var coords = this.__computeMoveCoordinates(e);

        var insets = this.getLayoutParent().getInsets();
        this.setLayoutProperties({
          left: coords.parentLeft - (insets.left || 0),
          top: coords.parentTop - (insets.top || 0)
        }); // Hide frame afterwards

        if (this.getUseMoveFrame()) {
          this.__getMoveFrame().exclude();
        }

        e.stopPropagation();
      },

      /**
       * Event listener for <code>losecapture</code> event.
       *
       * @param e {qx.event.type.Event} Lose capture event
       */
      __onMoveLoseCapture: function __onMoveLoseCapture(e) {
        // Check for active move
        if (!this.hasState("move")) {
          return;
        } // Remove drag state


        this.removeState("move"); // Hide frame afterwards

        if (this.getUseMoveFrame()) {
          this.__getMoveFrame().exclude();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__moveFrame", "__moveHandle");

      this.__dragRange = null;
    }
  });
  qx.ui.core.MMovable.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.IDesktop": {},
      "qx.ui.window.Window": {}
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
   * Required interface for all window manager.
   *
   * Window manager handle the z-order and modality blocking of windows managed
   * by the connected desktop {@link qx.ui.window.IDesktop}.
   */
  qx.Interface.define("qx.ui.window.IWindowManager", {
    members: {
      /**
       * Connect the window manager to the window desktop
       *
       * @param desktop {qx.ui.window.IDesktop|null} The connected desktop or null
       */
      setDesktop: function setDesktop(desktop) {
        if (desktop !== null) {
          this.assertInterface(desktop, qx.ui.window.IDesktop);
        }
      },

      /**
       * Inform the window manager about a new active window
       *
       * @param active {qx.ui.window.Window} new active window
       * @param oldActive {qx.ui.window.Window} old active window
       */
      changeActiveWindow: function changeActiveWindow(active, oldActive) {},

      /**
       * Update the window order and modality blocker
       */
      updateStack: function updateStack() {},

      /**
       * Ask the manager to bring a window to the front.
       *
       * @param win {qx.ui.window.Window} window to bring to front
       */
      bringToFront: function bringToFront(win) {
        this.assertInstance(win, qx.ui.window.Window);
      },

      /**
       * Ask the manager to send a window to the back.
       *
       * @param win {qx.ui.window.Window} window to sent to back
       */
      sendToBack: function sendToBack(win) {
        this.assertInstance(win, qx.ui.window.Window);
      }
    }
  });
  qx.ui.window.IWindowManager.$$dbClassInfo = $$dbClassInfo;
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
        "require": true
      },
      "qx.ui.window.IWindowManager": {
        "require": true
      },
      "qx.ui.core.queue.Widget": {},
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The default window manager implementation
   */
  qx.Class.define("qx.ui.window.Manager", {
    extend: qx.core.Object,
    implement: qx.ui.window.IWindowManager,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __desktop: null,
      // interface implementation
      setDesktop: function setDesktop(desktop) {
        this.__desktop = desktop;

        if (desktop) {
          this.updateStack();
        } else {
          // the window manager should be removed
          // from the widget queue if the desktop
          // was set to null
          qx.ui.core.queue.Widget.remove(this);
        }
      },

      /**
       * Returns the connected desktop
       *
       * @return {qx.ui.window.IDesktop} The desktop
       */
      getDesktop: function getDesktop() {
        return this.__desktop;
      },
      // interface implementation
      changeActiveWindow: function changeActiveWindow(active, oldActive) {
        if (active) {
          this.bringToFront(active);
          active.setActive(true);
        }

        if (oldActive) {
          oldActive.resetActive();
        }
      },

      /** @type {Integer} Minimum zIndex to start with for windows */
      _minZIndex: 1e5,
      // interface implementation
      updateStack: function updateStack() {
        // we use the widget queue to do the sorting one before the queues are
        // flushed. The queue will call "syncWidget"
        qx.ui.core.queue.Widget.add(this);
      },

      /**
       * This method is called during the flush of the
       * {@link qx.ui.core.queue.Widget widget queue}.
       */
      syncWidget: function syncWidget() {
        this.__desktop.forceUnblock();

        var windows = this.__desktop.getWindows(); // z-index for all three window kinds


        var zIndex = this._minZIndex;
        var zIndexOnTop = zIndex + windows.length * 2;
        var zIndexModal = zIndex + windows.length * 4; // marker if there is an active window

        var active = null;

        for (var i = 0, l = windows.length; i < l; i++) {
          var win = windows[i]; // ignore invisible windows

          if (!win.isVisible()) {
            continue;
          } // take the first window as active window


          active = active || win; // We use only every second z index to easily insert a blocker between
          // two windows
          // Modal Windows stays on top of AlwaysOnTop Windows, which stays on
          // top of Normal Windows.

          if (win.isModal()) {
            win.setZIndex(zIndexModal);

            this.__desktop.blockContent(zIndexModal - 1);

            zIndexModal += 2; //just activate it if it's modal

            active = win;
          } else if (win.isAlwaysOnTop()) {
            win.setZIndex(zIndexOnTop);
            zIndexOnTop += 2;
          } else {
            win.setZIndex(zIndex);
            zIndex += 2;
          } // store the active window


          if (!active.isModal() && win.isActive() || win.getZIndex() > active.getZIndex()) {
            active = win;
          }
        } //set active window or null otherwise


        this.__desktop.setActiveWindow(active);
      },
      // interface implementation
      bringToFront: function bringToFront(win) {
        var windows = this.__desktop.getWindows();

        var removed = qx.lang.Array.remove(windows, win);

        if (removed) {
          windows.push(win);
          this.updateStack();
        }
      },
      // interface implementation
      sendToBack: function sendToBack(win) {
        var windows = this.__desktop.getWindows();

        var removed = qx.lang.Array.remove(windows, win);

        if (removed) {
          windows.unshift(win);
          this.updateStack();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__desktop");
    }
  });
  qx.ui.window.Manager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.core.MRemoteLayoutHandling": {
        "require": true
      },
      "qx.ui.core.MResizable": {
        "require": true
      },
      "qx.ui.core.MMovable": {
        "require": true
      },
      "qx.ui.core.MContentPadding": {
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.core.Init": {
        "construct": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.ui.window.Manager": {
        "require": true
      },
      "qx.ui.window.IDesktop": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.basic.Label": {},
      "qx.ui.layout.Grid": {},
      "qx.ui.basic.Image": {},
      "qx.ui.form.Button": {},
      "qx.event.type.Event": {},
      "qx.bom.client.Engine": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * A window widget
   *
   * More information can be found in the package description {@link qx.ui.window}.
   *
   * @childControl statusbar {qx.ui.container.Composite} statusbar container which shows the statusbar text
   * @childControl statusbar-text {qx.ui.basic.Label} text of the statusbar
   * @childControl pane {qx.ui.container.Composite} window pane which holds the content
   * @childControl captionbar {qx.ui.container.Composite} Container for all widgets inside the captionbar
   * @childControl icon {qx.ui.basic.Image} icon at the left of the captionbar
   * @childControl title {qx.ui.basic.Label} caption of the window
   * @childControl minimize-button {qx.ui.form.Button} button to minimize the window
   * @childControl restore-button {qx.ui.form.Button} button to restore the window
   * @childControl maximize-button {qx.ui.form.Button} button to maximize the window
   * @childControl close-button {qx.ui.form.Button} button to close the window
   */
  qx.Class.define("qx.ui.window.Window", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MRemoteLayoutHandling, qx.ui.core.MResizable, qx.ui.core.MMovable, qx.ui.core.MContentPadding],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param caption {String?} The caption text
     * @param icon {String?} The URL of the caption bar icon
     */
    construct: function construct(caption, icon) {
      qx.ui.core.Widget.constructor.call(this); // configure internal layout

      this._setLayout(new qx.ui.layout.VBox()); // force creation of captionbar


      this._createChildControl("captionbar");

      this._createChildControl("pane"); // apply constructor parameters


      if (icon != null) {
        this.setIcon(icon);
      }

      if (caption != null) {
        this.setCaption(caption);
      } // Update captionbar


      this._updateCaptionBar(); // Activation listener


      this.addListener("pointerdown", this._onWindowPointerDown, this, true); // Focusout listener

      this.addListener("focusout", this._onWindowFocusOut, this); // Automatically add to application root.

      qx.core.Init.getApplication().getRoot().add(this); // Initialize visibility

      this.initVisibility(); // Register as root for the focus handler

      qx.ui.core.FocusHandler.getInstance().addRoot(this); // Change the resize frames appearance

      this._getResizeFrame().setAppearance("window-resize-frame");
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Class} The default window manager class. */
      DEFAULT_MANAGER_CLASS: qx.ui.window.Manager
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired before the window is closed.
       *
       * The close action can be prevented by calling
       * {@link qx.event.type.Event#preventDefault} on the event object
       */
      "beforeClose": "qx.event.type.Event",

      /** Fired if the window is closed */
      "close": "qx.event.type.Event",

      /**
       * Fired before the window is minimize.
       *
       * The minimize action can be prevented by calling
       * {@link qx.event.type.Event#preventDefault} on the event object
       */
      "beforeMinimize": "qx.event.type.Event",

      /** Fired if the window is minimized */
      "minimize": "qx.event.type.Event",

      /**
       * Fired before the window is maximize.
       *
       * The maximize action can be prevented by calling
       * {@link qx.event.type.Event#preventDefault} on the event object
       */
      "beforeMaximize": "qx.event.type.Event",

      /** Fired if the window is maximized */
      "maximize": "qx.event.type.Event",

      /**
       * Fired before the window is restored from a minimized or maximized state.
       *
       * The restored action can be prevented by calling
       * {@link qx.event.type.Event#preventDefault} on the event object
       */
      "beforeRestore": "qx.event.type.Event",

      /** Fired if the window is restored from a minimized or maximized state */
      "restore": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        INTERNAL OPTIONS
      ---------------------------------------------------------------------------
      */
      // overridden
      appearance: {
        refine: true,
        init: "window"
      },
      // overridden
      visibility: {
        refine: true,
        init: "excluded"
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /**
       * If the window is active, only one window in a single qx.ui.window.Manager could
       *  have set this to true at the same time.
       */
      active: {
        check: "Boolean",
        init: false,
        apply: "_applyActive",
        event: "changeActive"
      },

      /*
      ---------------------------------------------------------------------------
        BASIC OPTIONS
      ---------------------------------------------------------------------------
      */

      /** Should the window be always on top */
      alwaysOnTop: {
        check: "Boolean",
        init: false,
        event: "changeAlwaysOnTop"
      },

      /** Should the window be modal (this disables minimize and maximize buttons) */
      modal: {
        check: "Boolean",
        init: false,
        event: "changeModal",
        apply: "_applyModal"
      },

      /** The text of the caption */
      caption: {
        apply: "_applyCaptionBarChange",
        event: "changeCaption",
        nullable: true
      },

      /** The icon of the caption */
      icon: {
        check: "String",
        nullable: true,
        apply: "_applyCaptionBarChange",
        event: "changeIcon",
        themeable: true
      },

      /** The text of the statusbar */
      status: {
        check: "String",
        nullable: true,
        apply: "_applyStatus",
        event: "changeStatus"
      },

      /*
      ---------------------------------------------------------------------------
        HIDE CAPTIONBAR FEATURES
      ---------------------------------------------------------------------------
      */

      /** Should the close button be shown */
      showClose: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange",
        themeable: true
      },

      /** Should the maximize button be shown */
      showMaximize: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange",
        themeable: true
      },

      /** Should the minimize button be shown */
      showMinimize: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        DISABLE CAPTIONBAR FEATURES
      ---------------------------------------------------------------------------
      */

      /** Should the user have the ability to close the window */
      allowClose: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange"
      },

      /** Should the user have the ability to maximize the window */
      allowMaximize: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange"
      },

      /** Should the user have the ability to minimize the window */
      allowMinimize: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange"
      },

      /*
      ---------------------------------------------------------------------------
        STATUSBAR CONFIG
      ---------------------------------------------------------------------------
      */

      /** Should the statusbar be shown */
      showStatusbar: {
        check: "Boolean",
        init: false,
        apply: "_applyShowStatusbar"
      },

      /*
      ---------------------------------------------------------------------------
        WHEN TO AUTOMATICALY CENTER
      ---------------------------------------------------------------------------
      */

      /** Whether this window should be automatically centered when it appears */
      centerOnAppear: {
        init: false,
        check: "Boolean",
        apply: "_applyCenterOnAppear"
      },

      /** 
       * Whether this window should be automatically centered when its container
       * is resized.
       */
      centerOnContainerResize: {
        init: false,
        check: "Boolean",
        apply: "_applyCenterOnContainerResize"
      },

      /*
      ---------------------------------------------------------------------------
        CLOSE BEHAVIOR
      ---------------------------------------------------------------------------
      */

      /** 
       * Should the window be automatically destroyed when it is closed.
       *
       * When false, closing the window behaves like hiding the window.
       * 
       * When true, the window is removed from its container (the root), all
       * listeners are removed, the window's widgets are removed, and the window
       * is destroyed.
       *
       * NOTE: If any widgets that were added to this window require special
       * clean-up, you should listen on the 'close' event and remove and clean
       * up those widgets there.
       */
      autoDestroy: {
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
      /** @type {Integer} Original top value before maximation had occurred */
      __restoredTop: null,

      /** @type {Integer} Original left value before maximation had occurred */
      __restoredLeft: null,

      /** @type {Integer} Listener ID for centering on appear */
      __centeringAppearId: null,

      /** @type {Integer} Listener ID for centering on resize */
      __centeringResizeId: null,

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */

      /**
       * The children container needed by the {@link qx.ui.core.MRemoteChildrenHandling}
       * mixin
       *
       * @return {qx.ui.container.Composite} pane sub widget
       */
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("pane");
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        active: true,
        maximized: true,
        showStatusbar: true,
        modal: true
      },
      // overridden
      setLayoutParent: function setLayoutParent(parent) {
        var oldParent;
        {
          parent && this.assertInterface(parent, qx.ui.window.IDesktop, "Windows can only be added to widgets, which implement the interface qx.ui.window.IDesktop. All root widgets implement this interface.");
        } // Before changing the parent, if there's a prior one, remove our resize
        // listener

        oldParent = this.getLayoutParent();

        if (oldParent && this.__centeringResizeId) {
          oldParent.removeListenerById(this.__centeringResizeId);
          this.__centeringResizeId = null;
        } // Call the superclass


        qx.ui.window.Window.prototype.setLayoutParent.base.call(this, parent); // Re-add a listener for resize, if required

        if (parent && this.getCenterOnContainerResize()) {
          this.__centeringResizeId = parent.addListener("resize", this.center, this);
        }
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "statusbar":
            control = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            this._add(control);

            control.add(this.getChildControl("statusbar-text"));
            break;

          case "statusbar-text":
            control = new qx.ui.basic.Label();
            control.setValue(this.getStatus());
            break;

          case "pane":
            control = new qx.ui.container.Composite();

            this._add(control, {
              flex: 1
            });

            break;

          case "captionbar":
            // captionbar
            var layout = new qx.ui.layout.Grid();
            layout.setRowFlex(0, 1);
            layout.setColumnFlex(1, 1);
            control = new qx.ui.container.Composite(layout);

            this._add(control); // captionbar events


            control.addListener("dbltap", this._onCaptionPointerDblTap, this); // register as move handle

            this._activateMoveHandle(control);

            break;

          case "icon":
            control = new qx.ui.basic.Image(this.getIcon());
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 0
            });
            break;

          case "title":
            control = new qx.ui.basic.Label(this.getCaption());
            control.setWidth(0);
            control.setAllowGrowX(true);
            var captionBar = this.getChildControl("captionbar");
            captionBar.add(control, {
              row: 0,
              column: 1
            });
            break;

          case "minimize-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onMinimizeButtonTap, this);
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 2
            });
            break;

          case "restore-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onRestoreButtonTap, this);
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 3
            });
            break;

          case "maximize-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onMaximizeButtonTap, this);
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 4
            });
            break;

          case "close-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onCloseButtonTap, this);
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 6
            });
            break;
        }

        return control || qx.ui.window.Window.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        CAPTIONBAR INTERNALS
      ---------------------------------------------------------------------------
      */

      /**
       * Updates the status and the visibility of each element of the captionbar.
       */
      _updateCaptionBar: function _updateCaptionBar() {
        var btn;
        var icon = this.getIcon();

        if (icon) {
          this.getChildControl("icon").setSource(icon);

          this._showChildControl("icon");
        } else {
          this._excludeChildControl("icon");
        }

        var caption = this.getCaption();

        if (caption) {
          this.getChildControl("title").setValue(caption);

          this._showChildControl("title");
        } else {
          this._excludeChildControl("title");
        }

        if (this.getShowMinimize()) {
          this._showChildControl("minimize-button");

          btn = this.getChildControl("minimize-button");
          this.getAllowMinimize() ? btn.resetEnabled() : btn.setEnabled(false);
        } else {
          this._excludeChildControl("minimize-button");
        }

        if (this.getShowMaximize()) {
          if (this.isMaximized()) {
            this._showChildControl("restore-button");

            this._excludeChildControl("maximize-button");
          } else {
            this._showChildControl("maximize-button");

            this._excludeChildControl("restore-button");
          }

          btn = this.getChildControl("maximize-button");
          this.getAllowMaximize() ? btn.resetEnabled() : btn.setEnabled(false);
        } else {
          this._excludeChildControl("maximize-button");

          this._excludeChildControl("restore-button");
        }

        if (this.getShowClose()) {
          this._showChildControl("close-button");

          btn = this.getChildControl("close-button");
          this.getAllowClose() ? btn.resetEnabled() : btn.setEnabled(false);
        } else {
          this._excludeChildControl("close-button");
        }
      },

      /*
      ---------------------------------------------------------------------------
        USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Close the current window instance.
       *
       * Simply calls the {@link qx.ui.core.Widget#hide} method if the
       * {@link qx.ui.win.Window#autoDestroy} property is false; otherwise 
       * removes and destroys the window.
       */
      close: function close() {
        if (!this.getAutoDestroy() && !this.isVisible()) {
          return;
        }

        if (this.fireNonBubblingEvent("beforeClose", qx.event.type.Event, [false, true])) {
          this.hide();
          this.fireEvent("close");
        } // If automatically destroying the window upon close was requested, do
        // so now. (Note that we explicitly re-obtain the autoDestroy property
        // value, allowing the user's close handler to enable/disable it before
        // here.)


        if (this.getAutoDestroy()) {
          this.dispose();
        }
      },

      /**
       * Open the window.
       */
      open: function open() {
        this.show();
        this.setActive(true);
        this.focus();
      },

      /**
       * Centers the window to the parent.
       *
       * This call works with the size of the parent widget and the size of
       * the window as calculated in the last layout flush. It is best to call
       * this method just after rendering the window in the "resize" event:
       * <pre class='javascript'>
       *   win.addListenerOnce("resize", this.center, this);
       * </pre>
       */
      center: function center() {
        var parent = this.getLayoutParent();

        if (parent) {
          var bounds = parent.getBounds();

          if (bounds) {
            var hint = this.getSizeHint();
            var left = Math.round((bounds.width - hint.width) / 2);
            var top = Math.round((bounds.height - hint.height) / 2);

            if (top < 0) {
              top = 0;
            }

            this.moveTo(left, top);
            return;
          }
        }

        {
          this.warn("Centering depends on parent bounds!");
        }
      },

      /**
       * Maximize the window.
       */
      maximize: function maximize() {
        // If the window is already maximized -> return
        if (this.isMaximized()) {
          return;
        } // First check if the parent uses a canvas layout
        // Otherwise maximize() is not possible


        var parent = this.getLayoutParent();

        if (parent != null && parent.supportsMaximize()) {
          if (this.fireNonBubblingEvent("beforeMaximize", qx.event.type.Event, [false, true])) {
            if (!this.isVisible()) {
              this.open();
            } // store current dimension and location


            var props = this.getLayoutProperties();
            this.__restoredLeft = props.left === undefined ? 0 : props.left;
            this.__restoredTop = props.top === undefined ? 0 : props.top; // Update layout properties

            this.setLayoutProperties({
              left: null,
              top: null,
              edge: 0
            }); // Add state

            this.addState("maximized"); // Update captionbar

            this._updateCaptionBar(); // Fire user event


            this.fireEvent("maximize");
          }
        }
      },

      /**
       * Minimized the window.
       */
      minimize: function minimize() {
        if (!this.isVisible()) {
          return;
        }

        if (this.fireNonBubblingEvent("beforeMinimize", qx.event.type.Event, [false, true])) {
          // store current dimension and location
          var props = this.getLayoutProperties();
          this.__restoredLeft = props.left === undefined ? 0 : props.left;
          this.__restoredTop = props.top === undefined ? 0 : props.top;
          this.removeState("maximized");
          this.hide();
          this.fireEvent("minimize");
        }
      },

      /**
       * Restore the window to <code>"normal"</code>, if it is
       * <code>"maximized"</code> or <code>"minimized"</code>.
       */
      restore: function restore() {
        if (this.getMode() === "normal") {
          return;
        }

        if (this.fireNonBubblingEvent("beforeRestore", qx.event.type.Event, [false, true])) {
          if (!this.isVisible()) {
            this.open();
          } // Restore old properties


          var left = this.__restoredLeft;
          var top = this.__restoredTop;
          this.setLayoutProperties({
            edge: null,
            left: left,
            top: top
          }); // Remove maximized state

          this.removeState("maximized"); // Update captionbar

          this._updateCaptionBar(); // Fire user event


          this.fireEvent("restore");
        }
      },

      /**
       * Set the window's position relative to its parent
       *
       * @param left {Integer} The left position
       * @param top {Integer} The top position
       */
      moveTo: function moveTo(left, top) {
        if (this.isMaximized()) {
          return;
        }

        this.setLayoutProperties({
          left: left,
          top: top
        });
      },

      /**
       * Return <code>true</code> if the window is in maximized state,
       * but note that the window in maximized state could also be invisible, this
       * is equivalent to minimized. So use the {@link qx.ui.window.Window#getMode}
       * to get the window mode.
       *
       * @return {Boolean} <code>true</code> if the window is maximized,
       *   <code>false</code> otherwise.
       */
      isMaximized: function isMaximized() {
        return this.hasState("maximized");
      },

      /**
       * Return the window mode as <code>String</code>:
       * <code>"maximized"</code>, <code>"normal"</code> or <code>"minimized"</code>.
       *
       * @return {String} The window mode as <code>String</code> value.
       */
      getMode: function getMode() {
        if (!this.isVisible()) {
          return "minimized";
        } else {
          if (this.isMaximized()) {
            return "maximized";
          } else {
            return "normal";
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyActive: function _applyActive(value, old) {
        if (old) {
          this.removeState("active");
        } else {
          this.addState("active");
        }
      },
      // property apply
      _applyModal: function _applyModal(value, old) {
        if (old) {
          this.removeState("modal");
        } else {
          this.addState("modal");
        }
      },

      /**
       * Returns the element, to which the content padding should be applied.
       *
       * @return {qx.ui.core.Widget} The content padding target.
       */
      _getContentPaddingTarget: function _getContentPaddingTarget() {
        return this.getChildControl("pane");
      },
      // property apply
      _applyShowStatusbar: function _applyShowStatusbar(value, old) {
        // store the state if the status bar is shown
        var resizeFrame = this._getResizeFrame();

        if (value) {
          this.addState("showStatusbar");
          resizeFrame.addState("showStatusbar");
        } else {
          this.removeState("showStatusbar");
          resizeFrame.removeState("showStatusbar");
        }

        if (value) {
          this._showChildControl("statusbar");
        } else {
          this._excludeChildControl("statusbar");
        }
      },
      // property apply
      _applyCaptionBarChange: function _applyCaptionBarChange(value, old) {
        this._updateCaptionBar();
      },
      // property apply
      _applyStatus: function _applyStatus(value, old) {
        var label = this.getChildControl("statusbar-text", true);

        if (label) {
          label.setValue(value);
        }
      },
      // overridden
      _applyFocusable: function _applyFocusable(value, old) {
        // Workaround for bug #7581: Don't set the tabIndex
        // to prevent native scrolling on focus in IE
        if (qx.core.Environment.get("engine.name") !== "mshtml") {
          qx.ui.window.Window.prototype._applyFocusable.base.call(this, value, old);
        }
      },
      _applyCenterOnAppear: function _applyCenterOnAppear(value, old) {
        // Remove prior listener for centering on appear
        if (this.__centeringAppearId !== null) {
          this.removeListenerById(this.__centeringAppearId);
          this.__centeringAppearId = null;
        } // If we are to center on appear, arrange to do so


        if (value) {
          this.__centeringAppearId = this.addListener("appear", this.center, this);
        }
      },
      _applyCenterOnContainerResize: function _applyCenterOnContainerResize(value, old) {
        var parent = this.getLayoutParent(); // Remove prior listener for centering on resize

        if (this.__centeringResizeId !== null) {
          parent.removeListenerById(this.__centeringResizeId);
          this.__centeringResizeId = null;
        } // If we are to center on resize, arrange to do so


        if (value) {
          if (parent) {
            this.__centeringResizeId = parent.addListener("resize", this.center, this);
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        BASIC EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Stops every event
       *
       * @param e {qx.event.type.Event} any event
       */
      _onWindowEventStop: function _onWindowEventStop(e) {
        e.stopPropagation();
      },

      /**
       * Focuses the window instance.
       *
       * @param e {qx.event.type.Pointer} pointer down event
       */
      _onWindowPointerDown: function _onWindowPointerDown(e) {
        this.setActive(true);
      },

      /**
       * Listens to the "focusout" event to deactivate the window (if the
       * currently focused widget is not a child of the window)
       *
       * @param e {qx.event.type.Focus} focus event
       */
      _onWindowFocusOut: function _onWindowFocusOut(e) {
        // only needed for non-modal windows
        if (this.getModal()) {
          return;
        } // get the current focused widget and check if it is a child


        var current = e.getRelatedTarget();

        if (current != null && !qx.ui.core.Widget.contains(this, current)) {
          this.setActive(false);
        }
      },

      /**
       * Maximizes the window or restores it if it is already
       * maximized.
       *
       * @param e {qx.event.type.Pointer} double tap event
       */
      _onCaptionPointerDblTap: function _onCaptionPointerDblTap(e) {
        if (this.getAllowMaximize()) {
          this.isMaximized() ? this.restore() : this.maximize();
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENTS FOR CAPTIONBAR BUTTONS
      ---------------------------------------------------------------------------
      */

      /**
       * Minimizes the window, removes all states from the minimize button and
       * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
       *
       * @param e {qx.event.type.Pointer} pointer tap event
       */
      _onMinimizeButtonTap: function _onMinimizeButtonTap(e) {
        this.minimize();
        this.getChildControl("minimize-button").reset();
      },

      /**
       * Restores the window, removes all states from the restore button and
       * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
       *
       * @param e {qx.event.type.Pointer} pointer pointer event
       */
      _onRestoreButtonTap: function _onRestoreButtonTap(e) {
        this.restore();
        this.getChildControl("restore-button").reset();
      },

      /**
       * Maximizes the window, removes all states from the maximize button and
       * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
       *
       * @param e {qx.event.type.Pointer} pointer pointer event
       */
      _onMaximizeButtonTap: function _onMaximizeButtonTap(e) {
        this.maximize();
        this.getChildControl("maximize-button").reset();
      },

      /**
       * Closes the window, removes all states from the close button and
       * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
       *
       * @param e {qx.event.type.Pointer} pointer pointer event
       */
      _onCloseButtonTap: function _onCloseButtonTap(e) {
        this.close();
        this.getChildControl("close-button").reset();
      }
    },
    destruct: function destruct() {
      var id;
      var parent; // Remove ourselves from the focus handler

      qx.ui.core.FocusHandler.getInstance().removeRoot(this); // If we haven't been removed from our parent, clean it up too.

      parent = this.getLayoutParent();

      if (parent) {
        // Remove the listener for resize, if there is one
        id = this.__centeringResizeId;
        id && parent.removeListenerById(id); // Remove ourself from our parent

        parent.remove(this);
      }
    }
  });
  qx.ui.window.Window.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-19.js.map
