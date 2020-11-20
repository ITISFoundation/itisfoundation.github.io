(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Image": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MExecutable": {
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
   * The small folder open/close button
   */
  qx.Class.define("qx.ui.tree.core.FolderOpenButton", {
    extend: qx.ui.basic.Image,
    include: qx.ui.core.MExecutable,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.basic.Image.constructor.call(this);
      this.initOpen();
      this.addListener("tap", this._onTap);
      this.addListener("pointerdown", this._stopPropagation, this);
      this.addListener("pointerup", this._stopPropagation, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Whether the button state is "open"
       */
      open: {
        check: "Boolean",
        init: false,
        event: "changeOpen",
        apply: "_applyOpen"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // property apply
      _applyOpen: function _applyOpen(value, old) {
        value ? this.addState("opened") : this.removeState("opened");
        this.execute();
      },

      /**
       * Stop tap event propagation
       *
       * @param e {qx.event.type.Event} The event object
       */
      _stopPropagation: function _stopPropagation(e) {
        e.stopPropagation();
      },

      /**
       * Pointer tap event listener
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onTap: function _onTap(e) {
        this.toggleOpen();
        e.stopPropagation();
      }
    }
  });
  qx.ui.tree.core.FolderOpenButton.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.LayoutItem": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.queue.Dispose": {}
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
   * A Spacer is a "virtual" widget, which can be placed into any layout and takes
   * the space a normal widget of the same size would take.
   *
   * Spacers are invisible and very light weight because they don't require any
   * DOM modifications.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
   *   container.add(new qx.ui.core.Widget());
   *   container.add(new qx.ui.core.Spacer(50));
   *   container.add(new qx.ui.core.Widget());
   * </pre>
   *
   * This example places two widgets and a spacer into a container with a
   * horizontal box layout. In this scenario the spacer creates an empty area of
   * 50 pixel width between the two widgets.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/spacer.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.core.Spacer", {
    extend: qx.ui.core.LayoutItem,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param width {Integer?null} the initial width
     * @param height {Integer?null} the initial height
     */
    construct: function construct(width, height) {
      qx.ui.core.LayoutItem.constructor.call(this); // Initialize dimensions

      this.setWidth(width != null ? width : 0);
      this.setHeight(height != null ? height : 0);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Helper method called from the visibility queue to detect outstanding changes
       * to the appearance.
       *
       * @internal
       */
      checkAppearanceNeeds: function checkAppearanceNeeds() {// placeholder to improve compatibility with Widget.
      },

      /**
       * Recursively adds all children to the given queue
       *
       * @param queue {Map} The queue to add widgets to
       */
      addChildrenToQueue: function addChildrenToQueue(queue) {// placeholder to improve compatibility with Widget.
      },

      /**
       * Removes this widget from its parent and dispose it.
       *
       * Please note that the widget is not disposed synchronously. The
       * real dispose happens after the next queue flush.
       *
       */
      destroy: function destroy() {
        if (this.$$disposed) {
          return;
        }

        var parent = this.$$parent;

        if (parent) {
          parent._remove(this);
        }

        qx.ui.core.queue.Dispose.add(this);
      }
    }
  });
  qx.ui.core.Spacer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.IWindowManager": {}
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
   * All parent widgets of windows must implement this interface.
   */
  qx.Interface.define("qx.ui.window.IDesktop", {
    members: {
      /**
       * Sets the desktop's window manager
       *
       * @param manager {qx.ui.window.IWindowManager} The window manager
       */
      setWindowManager: function setWindowManager(manager) {
        this.assertInterface(manager, qx.ui.window.IWindowManager);
      },

      /**
       * Get a list of all windows added to the desktop (including hidden windows)
       *
       * @return {qx.ui.window.Window[]} Array of managed windows
       */
      getWindows: function getWindows() {},

      /**
       * Whether the configured layout supports a maximized window
       * e.g. is a Canvas.
       *
       * @return {Boolean} Whether the layout supports maximized windows
       */
      supportsMaximize: function supportsMaximize() {},

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this.assertInteger(zIndex);
      },

      /**
       * Remove the blocker.
       */
      unblock: function unblock() {},

      /**
       * Whether the widget is currently blocked
       *
       * @return {Boolean} whether the widget is blocked.
       */
      isBlocked: function isBlocked() {}
    }
  });
  qx.ui.window.IDesktop.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.Shortcut": {
        "construct": true
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
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * Commands can be used to globally define keyboard shortcuts. They could
   * also be used to assign an execution of a command sequence to multiple
   * widgets. It is possible to use the same Command in a MenuButton and
   * ToolBarButton for example.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.ui.command.Command", {
    extend: qx.core.Object,

    /**
     * @param shortcut {String} Shortcuts can be composed of optional modifier
     *    keys Control, Alt, Shift, Meta and a non modifier key.
     *    If no non modifier key is specified, the second parameter is evaluated.
     *    The key must be separated by a <code>+</code> or <code>-</code> character.
     *    Examples: Alt+F1, Control+C, Control+Alt+Delete
     */
    construct: function construct(shortcut) {
      qx.core.Object.constructor.call(this);
      this._shortcut = new qx.bom.Shortcut(shortcut);

      this._shortcut.addListener("execute", this.execute, this);

      if (shortcut !== undefined) {
        this.setShortcut(shortcut);
      }
    },
    events: {
      /**
       * Fired when the command is executed. Sets the "data" property of the
       * event to the object that issued the command.
       */
      "execute": "qx.event.type.Data"
    },
    properties: {
      /** Whether the command should be activated. If 'false' execute event
       * wouldn't fire. This property will be used by command groups when
       * activating/deactivating all commands of the group.*/
      active: {
        init: true,
        check: "Boolean",
        event: "changeActive",
        apply: "_applyActive"
      },

      /** Whether the command should be respected/enabled. If 'false' execute event
       * wouldn't fire. If value of property {@link qx.ui.command.Command#active}
       * is 'false', enabled value can be set but has no effect until
       * {@link qx.ui.command.Command#active} will be set to 'true'.*/
      enabled: {
        init: true,
        check: "Boolean",
        event: "changeEnabled",
        apply: "_applyEnabled"
      },

      /** The command shortcut as a string */
      shortcut: {
        check: "String",
        apply: "_applyShortcut",
        nullable: true
      },

      /** The label, which will be set in all connected widgets (if available) */
      label: {
        check: "String",
        nullable: true,
        event: "changeLabel"
      },

      /** The icon, which will be set in all connected widgets (if available) */
      icon: {
        check: "String",
        nullable: true,
        event: "changeIcon"
      },

      /**
       * The tooltip text, which will be set in all connected
       * widgets (if available)
       */
      toolTipText: {
        check: "String",
        nullable: true,
        event: "changeToolTipText"
      },

      /** The value of the connected widgets */
      value: {
        nullable: true,
        event: "changeValue"
      },

      /** The menu, which will be set in all connected widgets (if available) */
      menu: {
        check: "qx.ui.menu.Menu",
        nullable: true,
        event: "changeMenu"
      }
    },
    members: {
      _shortcut: null,
      // property apply
      _applyActive: function _applyActive(value) {
        if (value === false) {
          this._shortcut.setEnabled(false);
        } else {
          // synchronize value with current "enabled" value of this command
          this._shortcut.setEnabled(this.getEnabled());
        }
      },
      // property apply
      _applyEnabled: function _applyEnabled(value) {
        if (this.getActive()) {
          this._shortcut.setEnabled(value);
        }
      },
      // property apply
      _applyShortcut: function _applyShortcut(value) {
        this._shortcut.setShortcut(value);
      },

      /**
       * Fire the "execute" event on this command. If property
       * <code>active</code> and <code>enabled</code> set to
       * <code>true</code>.
       * @param target {Object?} Object which issued the execute event
       */
      execute: function execute(target) {
        if (this.getActive() && this.getEnabled()) {
          this.fireDataEvent("execute", target);
        }
      },

      /**
       * Returns the used shortcut as string using the currently selected locale.
       *
       * @return {String} shortcut
       */
      toString: function toString() {
        if (this._shortcut) {
          return this._shortcut.toString();
        }

        return qx.ui.command.Command.prototype.toString.base.call(this);
      }
    },
    destruct: function destruct() {
      this._shortcut.removeListener("execute", this.execute, this);

      this._disposeObjects("_shortcut");
    }
  });
  qx.ui.command.Command.$$dbClassInfo = $$dbClassInfo;
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class is responsible for validation in all asynchronous cases and
   * should always be used with {@link qx.ui.form.validation.Manager}.
   *
   *
   * It acts like a wrapper for asynchronous validation functions. These
   * validation function must be set in the constructor. The form manager will
   * invoke the validation and the validator function will be called with two
   * arguments:
   * <ul>
   *  <li>asyncValidator: A reference to the corresponding validator.</li>
   *  <li>value: The value of the assigned input field.</li>
   * </ul>
   * These two parameters are needed to set the validation status of the current
   * validator. {@link #setValid} is responsible for doing that.
   *
   *
   * *Warning:* Instances of this class can only be used with one input
   * field at a time. Multi usage is not supported!
   *
   * *Warning:* Calling {@link #setValid} synchronously does not work. If you
   * have an synchronous validator, please check
   * {@link qx.ui.form.validation.Manager#add}. If you have both cases, you have
   * to wrap the synchronous call in a timeout to make it asynchronous.
   */
  qx.Class.define("qx.ui.form.validation.AsyncValidator", {
    extend: qx.core.Object,

    /**
     * @param validator {Function} The validator function, which has to be
     *   asynchronous.
     */
    construct: function construct(validator) {
      qx.core.Object.constructor.call(this); // save the validator function

      this.__validatorFunction = validator;
    },
    members: {
      __validatorFunction: null,
      __item: null,
      __manager: null,
      __usedForForm: null,

      /**
       * The validate function should only be called by
       * {@link qx.ui.form.validation.Manager}.
       *
       * It stores the given information and calls the validation function set in
       * the constructor. The method is used for form fields only. Validating a
       * form itself will be invokes with {@link #validateForm}.
       *
       * @param item {qx.ui.core.Widget} The form item which should be validated.
       * @param value {var} The value of the form item.
       * @param manager {qx.ui.form.validation.Manager} A reference to the form
       *   manager.
       * @param context {var?null} The context of the validator.
       *
       * @internal
       */
      validate: function validate(item, value, manager, context) {
        // mark as item validator
        this.__usedForForm = false; // store the item and the manager

        this.__item = item;
        this.__manager = manager; // invoke the user set validator function

        this.__validatorFunction.call(context || this, this, value);
      },

      /**
       * The validateForm function should only be called by
       * {@link qx.ui.form.validation.Manager}.
       *
       * It stores the given information and calls the validation function set in
       * the constructor. The method is used for forms only. Validating a
       * form item will be invokes with {@link #validate}.
       *
       * @param items {qx.ui.core.Widget[]} All form items of the form manager.
       * @param manager {qx.ui.form.validation.Manager} A reference to the form
       *   manager.
       * @param context {var?null} The context of the validator.
       *
       * @internal
       */
      validateForm: function validateForm(items, manager, context) {
        this.__usedForForm = true;
        this.__manager = manager;

        this.__validatorFunction.call(context, items, this);
      },

      /**
       * This method should be called within the asynchronous callback to tell the
       * validator the result of the validation.
       *
       * @param valid {Boolean} The boolean state of the validation.
       * @param message {String?} The invalidMessage of the validation.
       */
      setValid: function setValid(valid, message) {
        // valid processing
        if (this.__usedForForm) {
          // message processing
          if (message !== undefined) {
            this.__manager.setInvalidMessage(message);
          }

          this.__manager.setFormValid(valid);
        } else {
          // message processing
          if (message !== undefined) {
            this.__item.setInvalidMessage(message);
          }

          this.__manager.setItemValid(this.__item, valid);
        }
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__manager = this.__item = null;
    }
  });
  qx.ui.form.validation.AsyncValidator.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.ObjectRegistry": {},
      "qx.lang.String": {}
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
   * <h2>Object Controller</h2>
   *
   * *General idea*
   *
   * The idea of the object controller is to make the binding of one model object
   * containing one or more properties as easy as possible. Therefore the
   * controller can take a model as property. Every property in that model can be
   * bound to one or more target properties. The binding will be for
   * atomic types only like Numbers, Strings, ...
   *
   * *Features*
   *
   * * Manages the bindings between the model properties and the different targets
   * * No need for the user to take care of the binding ids
   * * Can create an bidirectional binding (read- / write-binding)
   * * Handles the change of the model which means adding the old targets
   *
   * *Usage*
   *
   * The controller only can work if a model is set. If the model property is
   * null, the controller is not working. But it can be null on any time.
   *
   * *Cross reference*
   *
   * * If you want to bind a list like widget, use {@link qx.data.controller.List}
   * * If you want to bind a tree widget, use {@link qx.data.controller.Tree}
   * * If you want to bind a form widget, use {@link qx.data.controller.Form}
   */
  qx.Class.define("qx.data.controller.Object", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param model {qx.core.Object?null} The model for the model property.
     */
    construct: function construct(model) {
      qx.core.Object.constructor.call(this); // create a map for all created binding ids

      this.__bindings = {}; // create an array to store all current targets

      this.__targets = [];

      if (model != null) {
        this.setModel(model);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The model object which does have the properties for the binding. */
      model: {
        check: "qx.core.Object",
        event: "changeModel",
        apply: "_applyModel",
        nullable: true,
        dereference: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // private members
      __targets: null,
      __bindings: null,

      /**
       * Apply-method which will be called if a new model has been set.
       * All bindings will be moved to the new model.
       *
       * @param value {qx.core.Object|null} The new model.
       * @param old {qx.core.Object|null} The old model.
       */
      _applyModel: function _applyModel(value, old) {
        // for every target
        for (var i = 0; i < this.__targets.length; i++) {
          // get the properties
          var targetObject = this.__targets[i][0];
          var targetProperty = this.__targets[i][1];
          var sourceProperty = this.__targets[i][2];
          var bidirectional = this.__targets[i][3];
          var options = this.__targets[i][4];
          var reverseOptions = this.__targets[i][5]; // remove it from the old if possible

          if (old != undefined && !old.isDisposed()) {
            this.__removeTargetFrom(targetObject, targetProperty, sourceProperty, old);
          } // add it to the new if available


          if (value != undefined) {
            this.__addTarget(targetObject, targetProperty, sourceProperty, bidirectional, options, reverseOptions);
          } else {
            // in shutdown situations, it may be that something is already
            // disposed [BUG #4343]
            if (targetObject.isDisposed() || qx.core.ObjectRegistry.inShutDown) {
              continue;
            } // if the model is null, reset the current target


            if (targetProperty.indexOf("[") == -1) {
              targetObject["reset" + qx.lang.String.firstUp(targetProperty)]();
            } else {
              var open = targetProperty.indexOf("[");
              var index = parseInt(targetProperty.substring(open + 1, targetProperty.length - 1), 10);
              targetProperty = targetProperty.substring(0, open);
              var targetArray = targetObject["get" + qx.lang.String.firstUp(targetProperty)]();

              if (index == "last") {
                index = targetArray.length;
              }

              if (targetArray) {
                targetArray.setItem(index, null);
              }
            }
          }
        }
      },

      /**
       * Adds a new target to the controller. After adding the target, the given
       * property of the model will be bound to the targets property.
       *
       * @param targetObject {qx.core.Object} The object on which the property
       *   should be bound.
       *
       * @param targetProperty {String} The property to which the binding should
       *   go.
       *
       * @param sourceProperty {String} The name of the property in the model.
       *
       * @param bidirectional {Boolean?false} Signals if the binding should also work
       *   in the reverse direction, from the target to source.
       *
       * @param options {Map?null} The options Map used by the binding from source
       *   to target. The possible options can be found in the
       *   {@link qx.data.SingleValueBinding} class.
       *
       * @param reverseOptions {Map?null} The options used by the binding in the
       *   reverse direction. The possible options can be found in the
       *   {@link qx.data.SingleValueBinding} class.
       */
      addTarget: function addTarget(targetObject, targetProperty, sourceProperty, bidirectional, options, reverseOptions) {
        // store the added target
        this.__targets.push([targetObject, targetProperty, sourceProperty, bidirectional, options, reverseOptions]); // delegate the adding


        this.__addTarget(targetObject, targetProperty, sourceProperty, bidirectional, options, reverseOptions);
      },

      /**
      * Does the work for {@link #addTarget} but without saving the target
      * to the internal target registry.
      *
      * @param targetObject {qx.core.Object} The object on which the property
      *   should be bound.
      *
      * @param targetProperty {String} The property to which the binding should
      *   go.
      *
      * @param sourceProperty {String} The name of the property in the model.
      *
      * @param bidirectional {Boolean?false} Signals if the binding should also work
      *   in the reverse direction, from the target to source.
      *
      * @param options {Map?null} The options Map used by the binding from source
      *   to target. The possible options can be found in the
      *   {@link qx.data.SingleValueBinding} class.
      *
      * @param reverseOptions {Map?null} The options used by the binding in the
      *   reverse direction. The possible options can be found in the
      *   {@link qx.data.SingleValueBinding} class.
      */
      __addTarget: function __addTarget(targetObject, targetProperty, sourceProperty, bidirectional, options, reverseOptions) {
        // do nothing if no model is set
        if (this.getModel() == null) {
          return;
        } // create the binding


        var id = this.getModel().bind(sourceProperty, targetObject, targetProperty, options); // create the reverse binding if necessary

        var idReverse = null;

        if (bidirectional) {
          idReverse = targetObject.bind(targetProperty, this.getModel(), sourceProperty, reverseOptions);
        } // save the binding


        var targetHash = targetObject.toHashCode();

        if (this.__bindings[targetHash] == undefined) {
          this.__bindings[targetHash] = [];
        }

        this.__bindings[targetHash].push([id, idReverse, targetProperty, sourceProperty, options, reverseOptions]);
      },

      /**
       * Removes the target identified by the three properties.
       *
       * @param targetObject {qx.core.Object} The target object on which the
       *   binding exist.
       *
       * @param targetProperty {String} The targets property name used by the
       *   adding of the target.
       *
       * @param sourceProperty {String} The name of the property of the model.
       */
      removeTarget: function removeTarget(targetObject, targetProperty, sourceProperty) {
        this.__removeTargetFrom(targetObject, targetProperty, sourceProperty, this.getModel()); // delete the target in the targets reference


        for (var i = 0; i < this.__targets.length; i++) {
          if (this.__targets[i][0] == targetObject && this.__targets[i][1] == targetProperty && this.__targets[i][2] == sourceProperty) {
            this.__targets.splice(i, 1);
          }
        }
      },

      /**
       * Does the work for {@link #removeTarget} but without removing the target
       * from the internal registry.
       *
       * @param targetObject {qx.core.Object} The target object on which the
       *   binding exist.
       *
       * @param targetProperty {String} The targets property name used by the
       *   adding of the target.
       *
       * @param sourceProperty {String} The name of the property of the model.
       *
       * @param sourceObject {String} The source object from which the binding
       *   comes.
       */
      __removeTargetFrom: function __removeTargetFrom(targetObject, targetProperty, sourceProperty, sourceObject) {
        // check for not fitting targetObjects
        if (!(targetObject instanceof qx.core.Object)) {
          // just do nothing
          return;
        }

        var currentListing = this.__bindings[targetObject.toHashCode()]; // if no binding is stored


        if (currentListing == undefined || currentListing.length == 0) {
          return;
        } // go threw all listings for the object


        for (var i = 0; i < currentListing.length; i++) {
          // if it is the listing
          if (currentListing[i][2] == targetProperty && currentListing[i][3] == sourceProperty) {
            // remove the binding
            var id = currentListing[i][0];
            sourceObject.removeBinding(id); // check for the reverse binding

            if (currentListing[i][1] != null) {
              targetObject.removeBinding(currentListing[i][1]);
            } // delete the entry and return


            currentListing.splice(i, 1);
            return;
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
      // set the model to null to get the bindings removed
      if (this.getModel() != null && !this.getModel().isDisposed()) {
        this.setModel(null);
      }
    }
  });
  qx.data.controller.Object.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.locale.Manager": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Assert": {}
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
   * Static class that provides localized date information (like names of week
   * days, AM/PM markers, start of week, etc.).
   *
   * @cldr()
   */
  qx.Class.define("qx.locale.Date", {
    statics: {
      /**
       * Reference to the locale manager.
       *
       * @internal
       */
      __mgr: qx.locale.Manager.getInstance(),

      /**
       * Get AM marker for time definitions
       *
       * @param locale {String} optional locale to be used
       * @return {String} translated AM marker.
       */
      getAmMarker: function getAmMarker(locale) {
        return this.__mgr.localize("cldr_am", [], locale);
      },

      /**
       * Get PM marker for time definitions
       *
       * @param locale {String} optional locale to be used
       * @return {String} translated PM marker.
       */
      getPmMarker: function getPmMarker(locale) {
        return this.__mgr.localize("cldr_pm", [], locale);
      },

      /**
       * Return localized names of day names
       *
       * @param length {String} format of the day names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the day
       * @return {String[]} array of localized day names starting with sunday.
       */
      getDayNames: function getDayNames(length, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        var names = [];

        for (var i = 0; i < days.length; i++) {
          var key = "cldr_day_" + context + "_" + length + "_" + days[i];
          names.push(withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale));
        }

        return names;
      },

      /**
       * Return localized name of a week day name
       *
       * @param length {String} format of the day name.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param day {Integer} day number. 0=sunday, 1=monday, ...
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the day
       * @return {String} localized day name
       */
      getDayName: function getDayName(length, day, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInteger(day);
          qx.core.Assert.assertInRange(day, 0, 6);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        var key = "cldr_day_" + context + "_" + length + "_" + days[day];
        return withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale);
      },

      /**
       * Return localized names of month names
       *
       * @param length {String} format of the month names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the month
       * @return {String[]} array of localized month names starting with january.
       */
      getMonthNames: function getMonthNames(length, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var names = [];

        for (var i = 0; i < 12; i++) {
          var key = "cldr_month_" + context + "_" + length + "_" + (i + 1);
          names.push(withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale));
        }

        return names;
      },

      /**
       * Return localized name of a month
       *
       * @param length {String} format of the month names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param month {Integer} index of the month. 0=january, 1=february, ...
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the month
       * @return {String} localized month name
       */
      getMonthName: function getMonthName(length, month, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var key = "cldr_month_" + context + "_" + length + "_" + (month + 1);
        return withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale);
      },

      /**
       * Return localized date format string to be used with {@link qx.util.format.DateFormat}.
       *
       * @param size {String} format of the date format.
       *      Possible values: "short", "medium", "long", "full"
       * @param locale {String?} optional locale to be used
       * @return {String} localized date format string
       */
      getDateFormat: function getDateFormat(size, locale) {
        {
          qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
        }
        var key = "cldr_date_format_" + size;
        return this.__mgr.localize(key, [], locale);
      },

      /**
       * Try to localize a date/time format string. For format string possibilities see
       * <a href="http://cldr.unicode.org/translation/date-time">Date/Time Symbol reference</a>
       * at CLDR - Unicode Common Locale Data Repository.
       *
       * If no localization is available take the fallback format string.
       *
       * @param canonical {String} format string containing only field information, and in a canonical order.
       *       Examples are "yyyyMMMM" for year + full month, or "MMMd" for abbreviated month + day.
       * @param fallback {String} fallback format string if no localized version is found
       * @param locale {String} optional locale to be used
       * @return {String} best matching format string
       */
      getDateTimeFormat: function getDateTimeFormat(canonical, fallback, locale) {
        var key = "cldr_date_time_format_" + canonical;

        var localizedFormat = this.__mgr.localize(key, [], locale);

        if (localizedFormat == key) {
          localizedFormat = fallback;
        }

        return localizedFormat;
      },

      /**
       * Return localized time format string to be used with {@link qx.util.format.DateFormat}.
       *
       * @param size {String} format of the time pattern.
       *      Possible values: "short", "medium", "long", "full"
       * @param locale {String} optional locale to be used
       * @return {String} localized time format string
       */
      getTimeFormat: function getTimeFormat(size, locale) {
        {
          qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
        }
        var key = "cldr_time_format_" + size;

        var localizedFormat = this.__mgr.localize(key, [], locale);

        if (localizedFormat != key) {
          return localizedFormat;
        }

        switch (size) {
          case "short":
          case "medium":
            return qx.locale.Date.getDateTimeFormat("HHmm", "HH:mm");

          case "long":
            return qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss");

          case "full":
            return qx.locale.Date.getDateTimeFormat("HHmmsszz", "HH:mm:ss zz");

          default:
            throw new Error("This case should never happen.");
        }
      },

      /**
       * Return the day the week starts with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the first day of the week. 0=sunday, 1=monday, ...
       */
      getWeekStart: function getWeekStart(locale) {
        var weekStart = {
          // default is monday
          "MV": 5,
          // friday
          "AE": 6,
          // saturday
          "AF": 6,
          "BH": 6,
          "DJ": 6,
          "DZ": 6,
          "EG": 6,
          "ER": 6,
          "ET": 6,
          "IQ": 6,
          "IR": 6,
          "JO": 6,
          "KE": 6,
          "KW": 6,
          "LB": 6,
          "LY": 6,
          "MA": 6,
          "OM": 6,
          "QA": 6,
          "SA": 6,
          "SD": 6,
          "SO": 6,
          "TN": 6,
          "YE": 6,
          "AS": 0,
          // sunday
          "AU": 0,
          "AZ": 0,
          "BW": 0,
          "CA": 0,
          "CN": 0,
          "FO": 0,
          "GE": 0,
          "GL": 0,
          "GU": 0,
          "HK": 0,
          "IE": 0,
          "IL": 0,
          "IS": 0,
          "JM": 0,
          "JP": 0,
          "KG": 0,
          "KR": 0,
          "LA": 0,
          "MH": 0,
          "MN": 0,
          "MO": 0,
          "MP": 0,
          "MT": 0,
          "NZ": 0,
          "PH": 0,
          "PK": 0,
          "SG": 0,
          "TH": 0,
          "TT": 0,
          "TW": 0,
          "UM": 0,
          "US": 0,
          "UZ": 0,
          "VI": 0,
          "ZA": 0,
          "ZW": 0,
          "MW": 0,
          "NG": 0,
          "TJ": 0
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is monday


        return weekStart[territory] != null ? weekStart[territory] : 1;
      },

      /**
       * Return the day the weekend starts with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the first day of the weekend. 0=sunday, 1=monday, ...
       */
      getWeekendStart: function getWeekendStart(locale) {
        var weekendStart = {
          // default is saturday
          "EG": 5,
          // friday
          "IL": 5,
          "SY": 5,
          "IN": 0,
          // sunday
          "AE": 4,
          // thursday
          "BH": 4,
          "DZ": 4,
          "IQ": 4,
          "JO": 4,
          "KW": 4,
          "LB": 4,
          "LY": 4,
          "MA": 4,
          "OM": 4,
          "QA": 4,
          "SA": 4,
          "SD": 4,
          "TN": 4,
          "YE": 4
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is saturday


        return weekendStart[territory] != null ? weekendStart[territory] : 6;
      },

      /**
       * Return the day the weekend ends with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the last day of the weekend. 0=sunday, 1=monday, ...
       */
      getWeekendEnd: function getWeekendEnd(locale) {
        var weekendEnd = {
          // default is sunday
          "AE": 5,
          // friday
          "BH": 5,
          "DZ": 5,
          "IQ": 5,
          "JO": 5,
          "KW": 5,
          "LB": 5,
          "LY": 5,
          "MA": 5,
          "OM": 5,
          "QA": 5,
          "SA": 5,
          "SD": 5,
          "TN": 5,
          "YE": 5,
          "AF": 5,
          "IR": 5,
          "EG": 6,
          // saturday
          "IL": 6,
          "SY": 6
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is sunday


        return weekendEnd[territory] != null ? weekendEnd[territory] : 0;
      },

      /**
       * Returns whether a certain day of week belongs to the week end.
       *
       * @param day {Integer} index of the day. 0=sunday, 1=monday, ...
       * @param locale {String} optional locale to be used
       * @return {Boolean} whether the given day is a weekend day
       */
      isWeekend: function isWeekend(day, locale) {
        var weekendStart = qx.locale.Date.getWeekendStart(locale);
        var weekendEnd = qx.locale.Date.getWeekendEnd(locale);

        if (weekendEnd > weekendStart) {
          return day >= weekendStart && day <= weekendEnd;
        } else {
          return day >= weekendStart || day <= weekendEnd;
        }
      },

      /**
       * Extract the territory part from a locale
       *
       * @param locale {String} the locale
       * @return {String} territory
       */
      _getTerritory: function _getTerritory(locale) {
        if (locale) {
          var territory = locale.split("_")[1] || locale;
        } else {
          territory = this.__mgr.getTerritory() || this.__mgr.getLanguage();
        }

        return territory.toUpperCase();
      },

      /**
       * Provide localization (CLDR) data with fallback between "format" and "stand-alone" contexts.
       * It is used in {@link #getDayName} and {@link #getMonthName} methods.
       *
       * @param context {String} intended context.
       *       Possible values: "format", "stand-alone".
       * @param fallbackContext {String} the context used in case no localization is found for the key.
       * @param key {String} message id (may contain format strings)
       * @param locale {String} the locale
       * @return {String} localized name for the key
       *
       */
      __localizeWithFallback: function __localizeWithFallback(context, fallbackContext, key, locale) {
        var localizedString = this.__mgr.localize(key, [], locale);

        if (localizedString == key) {
          var newKey = key.replace('_' + context + '_', '_' + fallbackContext + '_');
          return this.__mgr.localize(newKey, [], locale);
        } else {
          return localizedString;
        }
      }
    }
  });
  qx.locale.Date.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.ISingleSelection": {
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
   * Each object, which should support multiselection selection have to
   * implement this interface.
   */
  qx.Interface.define("qx.ui.core.IMultiSelection", {
    extend: qx.ui.core.ISingleSelection,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Selects all items of the managed object.
       */
      selectAll: function selectAll() {
        return true;
      },

      /**
       * Adds the given item to the existing selection.
       *
       * @param item {qx.ui.core.Widget} Any valid item
       * @throws {Error} if the item is not a child element.
       */
      addToSelection: function addToSelection(item) {
        return arguments.length == 1;
      },

      /**
       * Removes the given item from the selection.
       *
       * Use {@link qx.ui.core.ISingleSelection#resetSelection} when you
       * want to clear the whole selection at once.
       *
       * @param item {qx.ui.core.Widget} Any valid item
       * @throws {Error} if the item is not a child element.
       */
      removeFromSelection: function removeFromSelection(item) {
        return arguments.length == 1;
      }
    }
  });
  qx.ui.core.IMultiSelection.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MExecutable": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.form.IExecutable": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.IDateForm": {
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.locale.Date": {
        "construct": true
      },
      "qx.locale.Manager": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.tooltip.ToolTip": {},
      "qx.ui.toolbar.Button": {},
      "qx.ui.basic.Label": {},
      "qx.ui.layout.Grid": {},
      "qx.util.format.DateFormat": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * A *date chooser* is a small calendar including a navigation bar to switch the shown
   * month. It includes a column for the calendar week and shows one month. Selecting
   * a date is as easy as tapping on it.
   *
   * To be conform with all form widgets, the {@link qx.ui.form.IForm} interface
   * is implemented.
   *
   * The following example creates and adds a date chooser to the root element.
   * A listener alerts the user if a new date is selected.
   *
   * <pre class='javascript'>
   * var chooser = new qx.ui.control.DateChooser();
   * this.getRoot().add(chooser, { left : 20, top: 20});
   *
   * chooser.addListener("changeValue", function(e) {
   *   alert(e.getData());
   * });
   * </pre>
   *
   * Additionally to a selection event an execute event is available which is
   * fired by doubletap or tapping the space / enter key. With this event you
   * can for example save the selection and close the date chooser.
   *
   * @childControl navigation-bar {qx.ui.container.Composite} container for the navigation bar controls
   * @childControl last-year-button-tooltip {qx.ui.tooltip.ToolTip} tooltip for the last year button
   * @childControl last-year-button {qx.ui.form.Button} button to jump to the last year
   * @childControl last-month-button-tooltip {qx.ui.tooltip.ToolTip} tooltip for the last month button
   * @childControl last-month-button {qx.ui.form.Button} button to jump to the last month
   * @childControl next-month-button-tooltip {qx.ui.tooltip.ToolTip} tooltip for the next month button
   * @childControl next-month-button {qx.ui.form.Button} button to jump to the next month
   * @childControl next-year-button-tooltip {qx.ui.tooltip.ToolTip} tooltip for the next year button
   * @childControl next-year-button {qx.ui.form.Button} button to jump to the next year
   * @childControl month-year-label {qx.ui.basic.Label} shows the current month and year
   * @childControl week {qx.ui.basic.Label} week label (used multiple times)
   * @childControl weekday {qx.ui.basic.Label} weekday label (used multiple times)
   * @childControl day {qx.ui.basic.Label} day label (used multiple times)
   * @childControl date-pane {qx.ui.container.Composite} the pane used to position the week, weekday and day labels
   *
   */
  qx.Class.define("qx.ui.control.DateChooser", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MExecutable, qx.ui.form.MForm],
    implement: [qx.ui.form.IExecutable, qx.ui.form.IForm, qx.ui.form.IDateForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param date {Date ? null} The initial date to show. If <code>null</code>
     * the current day (today) is shown.
     */
    construct: function construct(date) {
      qx.ui.core.Widget.constructor.call(this); // set the layout

      var layout = new qx.ui.layout.VBox();

      this._setLayout(layout); // create the child controls


      this._createChildControl("navigation-bar");

      this._createChildControl("date-pane"); // Support for key events


      this.addListener("keypress", this._onKeyPress); // initialize format - moved from statics{} to constructor due to [BUG #7149]

      var DateChooser = qx.ui.control.DateChooser;

      if (!DateChooser.MONTH_YEAR_FORMAT) {
        DateChooser.MONTH_YEAR_FORMAT = qx.locale.Date.getDateTimeFormat("yyyyMMMM", "MMMM yyyy");
      } // Show the right date


      var shownDate = date != null ? date : new Date();
      this.showMonth(shownDate.getMonth(), shownDate.getFullYear()); // listen for locale changes

      {
        qx.locale.Manager.getInstance().addListener("changeLocale", this._updateDatePane, this);
      } // register pointer up and down handler

      this.addListener("pointerdown", this._onPointerUpDown, this);
      this.addListener("pointerup", this._onPointerUpDown, this);
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * @type {string} The format for the date year label at the top center.
       */
      MONTH_YEAR_FORMAT: null,

      /**
       * @type {string} The format for the weekday labels (the headers of the date table).
       */
      WEEKDAY_FORMAT: "EE",

      /**
       * @type {string} The format for the week numbers (the labels of the left column).
       */
      WEEK_FORMAT: "ww"
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
        init: "datechooser"
      },
      // overridden
      width: {
        refine: true,
        init: 200
      },
      // overridden
      height: {
        refine: true,
        init: 150
      },

      /** The currently shown month. 0 = january, 1 = february, and so on. */
      shownMonth: {
        check: "Integer",
        init: null,
        nullable: true,
        event: "changeShownMonth"
      },

      /** The currently shown year. */
      shownYear: {
        check: "Integer",
        init: null,
        nullable: true,
        event: "changeShownYear"
      },

      /** The date value of the widget. */
      value: {
        check: "Date",
        init: null,
        nullable: true,
        event: "changeValue",
        apply: "_applyValue"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __weekdayLabelArr: null,
      __dayLabelArr: null,
      __weekLabelArr: null,
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        invalid: true
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET INTERNALS
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          // NAVIGATION BAR STUFF
          case "navigation-bar":
            control = new qx.ui.container.Composite(new qx.ui.layout.HBox()); // Add the navigation bar elements

            control.add(this.getChildControl("last-year-button"));
            control.add(this.getChildControl("last-month-button"));
            control.add(this.getChildControl("month-year-label"), {
              flex: 1
            });
            control.add(this.getChildControl("next-month-button"));
            control.add(this.getChildControl("next-year-button"));

            this._add(control);

            break;

          case "last-year-button-tooltip":
            control = new qx.ui.tooltip.ToolTip(this.tr("Last year"));
            break;

          case "last-year-button":
            control = new qx.ui.toolbar.Button();
            control.addState("lastYear");
            control.setFocusable(false);
            control.setToolTip(this.getChildControl("last-year-button-tooltip"));
            control.addListener("tap", this._onNavButtonTap, this);
            break;

          case "last-month-button-tooltip":
            control = new qx.ui.tooltip.ToolTip(this.tr("Last month"));
            break;

          case "last-month-button":
            control = new qx.ui.toolbar.Button();
            control.addState("lastMonth");
            control.setFocusable(false);
            control.setToolTip(this.getChildControl("last-month-button-tooltip"));
            control.addListener("tap", this._onNavButtonTap, this);
            break;

          case "next-month-button-tooltip":
            control = new qx.ui.tooltip.ToolTip(this.tr("Next month"));
            break;

          case "next-month-button":
            control = new qx.ui.toolbar.Button();
            control.addState("nextMonth");
            control.setFocusable(false);
            control.setToolTip(this.getChildControl("next-month-button-tooltip"));
            control.addListener("tap", this._onNavButtonTap, this);
            break;

          case "next-year-button-tooltip":
            control = new qx.ui.tooltip.ToolTip(this.tr("Next year"));
            break;

          case "next-year-button":
            control = new qx.ui.toolbar.Button();
            control.addState("nextYear");
            control.setFocusable(false);
            control.setToolTip(this.getChildControl("next-year-button-tooltip"));
            control.addListener("tap", this._onNavButtonTap, this);
            break;

          case "month-year-label":
            control = new qx.ui.basic.Label();
            control.setAllowGrowX(true);
            control.setAnonymous(true);
            break;

          case "week":
            control = new qx.ui.basic.Label();
            control.setAllowGrowX(true);
            control.setAllowGrowY(true);
            control.setSelectable(false);
            control.setAnonymous(true);
            control.setCursor("default");
            break;

          case "weekday":
            control = new qx.ui.basic.Label();
            control.setAllowGrowX(true);
            control.setAllowGrowY(true);
            control.setSelectable(false);
            control.setAnonymous(true);
            control.setCursor("default");
            break;

          case "day":
            control = new qx.ui.basic.Label();
            control.setAllowGrowX(true);
            control.setAllowGrowY(true);
            control.setCursor("default");
            control.addListener("pointerdown", this._onDayTap, this);
            control.addListener("dbltap", this._onDayDblTap, this);
            break;

          case "date-pane":
            var controlLayout = new qx.ui.layout.Grid();
            control = new qx.ui.container.Composite(controlLayout);

            for (var i = 0; i < 8; i++) {
              controlLayout.setColumnFlex(i, 1);
            }

            for (var i = 0; i < 7; i++) {
              controlLayout.setRowFlex(i, 1);
            } // Create the weekdays
            // Add an empty label as spacer for the week numbers


            var label = this.getChildControl("week#0");
            label.addState("header");
            control.add(label, {
              column: 0,
              row: 0
            });
            this.__weekdayLabelArr = [];

            for (var i = 0; i < 7; i++) {
              label = this.getChildControl("weekday#" + i);
              control.add(label, {
                column: i + 1,
                row: 0
              });

              this.__weekdayLabelArr.push(label);
            } // Add the days


            this.__dayLabelArr = [];
            this.__weekLabelArr = [];

            for (var y = 0; y < 6; y++) {
              // Add the week label
              var label = this.getChildControl("week#" + (y + 1));
              control.add(label, {
                column: 0,
                row: y + 1
              });

              this.__weekLabelArr.push(label); // Add the day labels


              for (var x = 0; x < 7; x++) {
                var label = this.getChildControl("day#" + (y * 7 + x));
                control.add(label, {
                  column: x + 1,
                  row: y + 1
                });

                this.__dayLabelArr.push(label);
              }
            }

            this._add(control);

            break;
        }

        return control || qx.ui.control.DateChooser.prototype._createChildControlImpl.base.call(this, id);
      },
      // apply methods
      _applyValue: function _applyValue(value, old) {
        if (value != null && (this.getShownMonth() != value.getMonth() || this.getShownYear() != value.getFullYear())) {
          // The new date is in another month -> Show that month
          this.showMonth(value.getMonth(), value.getFullYear());
        } else {
          // The new date is in the current month -> Just change the states
          var newDay = value == null ? -1 : value.getDate();

          for (var i = 0; i < 42; i++) {
            var dayLabel = this.__dayLabelArr[i];

            if (dayLabel.hasState("otherMonth")) {
              if (dayLabel.hasState("selected")) {
                dayLabel.removeState("selected");
              }
            } else {
              var day = parseInt(dayLabel.getValue(), 10);

              if (day == newDay) {
                dayLabel.addState("selected");
              } else if (dayLabel.hasState("selected")) {
                dayLabel.removeState("selected");
              }
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
       * Handler which stops the propagation of the tap event if
       * the navigation bar or calendar headers will be tapped.
       *
       * @param e {qx.event.type.Pointer} The pointer up / down event
       */
      _onPointerUpDown: function _onPointerUpDown(e) {
        var target = e.getTarget();

        if (target == this.getChildControl("navigation-bar") || target == this.getChildControl("date-pane")) {
          e.stopPropagation();
          return;
        }
      },

      /**
       * Event handler. Called when a navigation button has been tapped.
       *
       * @param evt {qx.event.type.Data} The data event.
       */
      _onNavButtonTap: function _onNavButtonTap(evt) {
        var year = this.getShownYear();
        var month = this.getShownMonth();

        switch (evt.getCurrentTarget()) {
          case this.getChildControl("last-year-button"):
            year--;
            break;

          case this.getChildControl("last-month-button"):
            month--;

            if (month < 0) {
              month = 11;
              year--;
            }

            break;

          case this.getChildControl("next-month-button"):
            month++;

            if (month >= 12) {
              month = 0;
              year++;
            }

            break;

          case this.getChildControl("next-year-button"):
            year++;
            break;
        }

        this.showMonth(month, year);
      },

      /**
       * Event handler. Called when a day has been tapped.
       *
       * @param evt {qx.event.type.Data} The event.
       */
      _onDayTap: function _onDayTap(evt) {
        var time = evt.getCurrentTarget().dateTime;
        this.setValue(new Date(time));
      },

      /**
       * Event handler. Called when a day has been double-tapped.
       */
      _onDayDblTap: function _onDayDblTap() {
        this.execute();
      },

      /**
       * Event handler. Called when a key was pressed.
       *
       * @param evt {qx.event.type.Data} The event.
       */
      _onKeyPress: function _onKeyPress(evt) {
        var dayIncrement = null;
        var monthIncrement = null;
        var yearIncrement = null;

        if (evt.getModifiers() == 0) {
          switch (evt.getKeyIdentifier()) {
            case "Left":
              dayIncrement = -1;
              break;

            case "Right":
              dayIncrement = 1;
              break;

            case "Up":
              dayIncrement = -7;
              break;

            case "Down":
              dayIncrement = 7;
              break;

            case "PageUp":
              monthIncrement = -1;
              break;

            case "PageDown":
              monthIncrement = 1;
              break;

            case "Escape":
              if (this.getValue() != null) {
                this.setValue(null);
                return;
              }

              break;

            case "Enter":
            case "Space":
              if (this.getValue() != null) {
                this.execute();
              }

              return;
          }
        } else if (evt.isShiftPressed()) {
          switch (evt.getKeyIdentifier()) {
            case "PageUp":
              yearIncrement = -1;
              break;

            case "PageDown":
              yearIncrement = 1;
              break;
          }
        }

        if (dayIncrement != null || monthIncrement != null || yearIncrement != null) {
          var date = this.getValue();

          if (date != null) {
            date = new Date(date.getTime());
          }

          if (date == null) {
            date = new Date();
          } else {
            if (dayIncrement != null) {
              date.setDate(date.getDate() + dayIncrement);
            }

            if (monthIncrement != null) {
              date.setMonth(date.getMonth() + monthIncrement);
            }

            if (yearIncrement != null) {
              date.setFullYear(date.getFullYear() + yearIncrement);
            }
          }

          this.setValue(date);
        }
      },

      /**
       * Shows a certain month.
       *
       * @param month {Integer ? null} the month to show (0 = january). If not set
       *      the month will remain the same.
       * @param year {Integer ? null} the year to show. If not set the year will
       *      remain the same.
       */
      showMonth: function showMonth(month, year) {
        if (month != null && month != this.getShownMonth() || year != null && year != this.getShownYear()) {
          if (month != null) {
            this.setShownMonth(month);
          }

          if (year != null) {
            this.setShownYear(year);
          }

          this._updateDatePane();
        }
      },

      /**
       * Event handler. Used to handle the key events.
       *
       * @param e {qx.event.type.Data} The event.
       */
      handleKeyPress: function handleKeyPress(e) {
        this._onKeyPress(e);
      },

      /**
       * Updates the date pane.
       */
      _updateDatePane: function _updateDatePane() {
        var DateChooser = qx.ui.control.DateChooser;
        var today = new Date();
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth();
        var todayDayOfMonth = today.getDate();
        var selDate = this.getValue();
        var selYear = selDate == null ? -1 : selDate.getFullYear();
        var selMonth = selDate == null ? -1 : selDate.getMonth();
        var selDayOfMonth = selDate == null ? -1 : selDate.getDate();
        var shownMonth = this.getShownMonth();
        var shownYear = this.getShownYear();
        var startOfWeek = qx.locale.Date.getWeekStart(); // Create a help date that points to the first of the current month

        var helpDate = new Date(this.getShownYear(), this.getShownMonth(), 1);
        var monthYearFormat = new qx.util.format.DateFormat(DateChooser.MONTH_YEAR_FORMAT);
        this.getChildControl("month-year-label").setValue(monthYearFormat.format(helpDate)); // Show the day names

        var firstDayOfWeek = helpDate.getDay();
        var firstSundayInMonth = 1 + (7 - firstDayOfWeek) % 7;
        var weekDayFormat = new qx.util.format.DateFormat(DateChooser.WEEKDAY_FORMAT);

        for (var i = 0; i < 7; i++) {
          var day = (i + startOfWeek) % 7;
          var dayLabel = this.__weekdayLabelArr[i];
          helpDate.setDate(firstSundayInMonth + day);
          dayLabel.setValue(weekDayFormat.format(helpDate));

          if (qx.locale.Date.isWeekend(day)) {
            dayLabel.addState("weekend");
          } else {
            dayLabel.removeState("weekend");
          }
        } // Show the days


        helpDate = new Date(shownYear, shownMonth, 1, 12, 0, 0);
        var nrDaysOfLastMonth = (7 + firstDayOfWeek - startOfWeek) % 7;
        helpDate.setDate(helpDate.getDate() - nrDaysOfLastMonth);
        var weekFormat = new qx.util.format.DateFormat(DateChooser.WEEK_FORMAT);

        for (var week = 0; week < 6; week++) {
          this.__weekLabelArr[week].setValue(weekFormat.format(helpDate));

          for (var i = 0; i < 7; i++) {
            var dayLabel = this.__dayLabelArr[week * 7 + i];
            var year = helpDate.getFullYear();
            var month = helpDate.getMonth();
            var dayOfMonth = helpDate.getDate();
            var isSelectedDate = selYear == year && selMonth == month && selDayOfMonth == dayOfMonth;

            if (isSelectedDate) {
              dayLabel.addState("selected");
            } else {
              dayLabel.removeState("selected");
            }

            if (month != shownMonth) {
              dayLabel.addState("otherMonth");
            } else {
              dayLabel.removeState("otherMonth");
            }

            var isToday = year == todayYear && month == todayMonth && dayOfMonth == todayDayOfMonth;

            if (isToday) {
              dayLabel.addState("today");
            } else {
              dayLabel.removeState("today");
            }

            dayLabel.setValue("" + dayOfMonth);
            dayLabel.dateTime = helpDate.getTime(); // Go to the next day

            helpDate.setDate(helpDate.getDate() + 1);
          }
        }

        monthYearFormat.dispose();
        weekDayFormat.dispose();
        weekFormat.dispose();
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._updateDatePane, this);
      }
      this.__weekdayLabelArr = this.__dayLabelArr = this.__weekLabelArr = null;
    }
  });
  qx.ui.control.DateChooser.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.html.Element": {
        "construct": true,
        "require": true
      },
      "qx.bom.Input": {},
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A Input wrap any valid HTML input element and make it accessible
   * through the normalized qooxdoo element interface.
   */
  qx.Class.define("qx.html.Input", {
    extend: qx.html.Element,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param type {String} The type of the input field. Valid values are
     *   <code>text</code>, <code>textarea</code>, <code>select</code>,
     *   <code>checkbox</code>, <code>radio</code>, <code>password</code>,
     *   <code>hidden</code>, <code>submit</code>, <code>image</code>,
     *   <code>file</code>, <code>search</code>, <code>reset</code>,
     *   <code>select</code> and <code>textarea</code>.
     * @param styles {Map?null} optional map of CSS styles, where the key is the name
     *    of the style and the value is the value to use.
     * @param attributes {Map?null} optional map of element attributes, where the
     *    key is the name of the attribute and the value is the value to use.
     */
    construct: function construct(type, styles, attributes) {
      // Update node name correctly
      if (type === "select" || type === "textarea") {
        var nodeName = type;
      } else {
        nodeName = "input";
      }

      qx.html.Element.constructor.call(this, nodeName, styles, attributes);
      this.__type = type;
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __type: null,
      // used for webkit only
      __selectable: null,
      __enabled: null,

      /*
      ---------------------------------------------------------------------------
        ELEMENT API
      ---------------------------------------------------------------------------
      */
      //overridden
      _createDomElement: function _createDomElement() {
        return qx.bom.Input.create(this.__type);
      },
      // overridden
      _applyProperty: function _applyProperty(name, value) {
        qx.html.Input.prototype._applyProperty.base.call(this, name, value);

        var element = this.getDomElement();

        if (name === "value") {
          qx.bom.Input.setValue(element, value);
        } else if (name === "wrap") {
          qx.bom.Input.setWrap(element, value); // qx.bom.Input#setWrap has the side-effect that the CSS property
          // overflow is set via DOM methods, causing queue and DOM to get
          // out of sync. Mirror all overflow properties to handle the case
          // when group and x/y property differ.

          this.setStyle("overflow", element.style.overflow, true);
          this.setStyle("overflowX", element.style.overflowX, true);
          this.setStyle("overflowY", element.style.overflowY, true);
        }
      },

      /**
       * Set the input element enabled / disabled.
       * Webkit needs a special treatment because the set color of the input
       * field changes automatically. Therefore, we use
       * <code>-webkit-user-modify: read-only</code> and
       * <code>-webkit-user-select: none</code>
       * for disabling the fields in webkit. All other browsers use the disabled
       * attribute.
       *
       * @param value {Boolean} true, if the input element should be enabled.
       */
      setEnabled: function setEnabled(value) {
        this.__enabled = value;
        this.setAttribute("disabled", value === false);

        if (qx.core.Environment.get("engine.name") == "webkit") {
          if (!value) {
            this.setStyles({
              "userModify": "read-only",
              "userSelect": "none"
            });
          } else {
            this.setStyles({
              "userModify": null,
              "userSelect": this.__selectable ? null : "none"
            });
          }
        }
      },

      /**
       * Set whether the element is selectable. It uses the qooxdoo attribute
       * qxSelectable with the values 'on' or 'off'.
       * In webkit, a special css property will be used and checks for the
       * enabled state.
       *
       * @param value {Boolean} True, if the element should be selectable.
       */
      setSelectable: qx.core.Environment.select("engine.name", {
        "webkit": function webkit(value) {
          this.__selectable = value; // Only apply the value when it is enabled

          qx.html.Input.prototype.setSelectable.base.call(this, this.__enabled && value);
        },
        "default": function _default(value) {
          qx.html.Input.prototype.setSelectable.base.call(this, value);
        }
      }),

      /*
      ---------------------------------------------------------------------------
        INPUT API
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the value of the input element.
       *
       * @param value {var} the new value
       * @return {qx.html.Input} This instance for for chaining support.
       */
      setValue: function setValue(value) {
        var element = this.getDomElement();

        if (element) {
          // Do not overwrite when already correct (on input events)
          // This is needed to keep caret position while typing.
          if (element.value != value) {
            qx.bom.Input.setValue(element, value);
          }
        } else {
          this._setProperty("value", value);
        }

        return this;
      },

      /**
       * Get the current value.
       *
       * @return {String} The element's current value.
       */
      getValue: function getValue() {
        var element = this.getDomElement();

        if (element) {
          return qx.bom.Input.getValue(element);
        }

        return this._getProperty("value") || "";
      },

      /**
       * Sets the text wrap behavior of a text area element.
       *
       * This property uses the style property "wrap" (IE) respectively "whiteSpace"
       *
       * @param wrap {Boolean} Whether to turn text wrap on or off.
       * @param direct {Boolean?false} Whether the execution should be made
       *  directly when possible
       * @return {qx.html.Input} This instance for for chaining support.
       */
      setWrap: function setWrap(wrap, direct) {
        if (this.__type === "textarea") {
          this._setProperty("wrap", wrap, direct);
        } else {
          throw new Error("Text wrapping is only support by textareas!");
        }

        return this;
      },

      /**
       * Gets the text wrap behavior of a text area element.
       *
       * This property uses the style property "wrap" (IE) respectively "whiteSpace"
       *
       * @return {Boolean} Whether wrapping is enabled or disabled.
       */
      getWrap: function getWrap() {
        if (this.__type === "textarea") {
          return this._getProperty("wrap");
        } else {
          throw new Error("Text wrapping is only support by textareas!");
        }
      }
    }
  });
  qx.html.Input.$$dbClassInfo = $$dbClassInfo;
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
      "qx.locale.Manager": {}
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
   * Provides information about locale-dependent number formatting (like the decimal
   * separator).
   *
   * @cldr()
   */
  qx.Class.define("qx.locale.Number", {
    statics: {
      /**
       * Get decimal separator for number formatting
       *
       * @param locale {String} optional locale to be used
       * @return {String} decimal separator.
       */
      getDecimalSeparator: function getDecimalSeparator(locale) {
        return qx.locale.Manager.getInstance().localize("cldr_number_decimal_separator", [], locale);
      },

      /**
       * Get thousand grouping separator for number formatting
       *
       * @param locale {String} optional locale to be used
       * @return {String} group separator.
       */
      getGroupSeparator: function getGroupSeparator(locale) {
        return qx.locale.Manager.getInstance().localize("cldr_number_group_separator", [], locale);
      },

      /**
       * Get percent format string
       *
       * @param locale {String} optional locale to be used
       * @return {String} percent format string.
       */
      getPercentFormat: function getPercentFormat(locale) {
        return qx.locale.Manager.getInstance().localize("cldr_number_percent_format", [], locale);
      }
    }
  });
  qx.locale.Number.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.ISingleSelection": {
        "require": true
      },
      "qx.ui.form.IField": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.IModelSelection": {
        "require": true
      },
      "qx.ui.core.MSingleSelectionHandling": {
        "require": true
      },
      "qx.ui.form.MModelSelection": {
        "require": true
      },
      "qx.lang.String": {},
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The radio group handles a collection of items from which only one item
   * can be selected. Selection another item will deselect the previously selected
   * item.
   *
   * This class is e.g. used to create radio groups or {@link qx.ui.form.RadioButton}
   * or {@link qx.ui.toolbar.RadioButton} instances.
   *
   * We also offer a widget for the same purpose which uses this class. So if
   * you like to act with a widget instead of a pure logic coupling of the
   * widgets, take a look at the {@link qx.ui.form.RadioButtonGroup} widget.
   */
  qx.Class.define("qx.ui.form.RadioGroup", {
    extend: qx.core.Object,
    implement: [qx.ui.core.ISingleSelection, qx.ui.form.IField, qx.ui.form.IForm, qx.ui.form.IModelSelection],
    include: [qx.ui.core.MSingleSelectionHandling, qx.ui.form.MModelSelection],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param varargs {qx.core.Object} A variable number of items, which are
     *     initially added to the radio group, the first item will be selected.
     */
    construct: function construct(varargs) {
      qx.core.Object.constructor.call(this); // create item array

      this.__items = []; // add listener before call add!!!

      this.addListener("changeSelection", this.__onChangeSelection, this);

      if (varargs != null) {
        this.add.apply(this, arguments);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The property name in each of the added widgets that is grouped
       */
      groupedProperty: {
        check: "String",
        apply: "_applyGroupedProperty",
        event: "changeGroupedProperty",
        init: "value"
      },

      /**
       * The property name in each of the added widgets that is informed of the
       * RadioGroup object it is a member of
       */
      groupProperty: {
        check: "String",
        event: "changeGroupProperty",
        init: "group"
      },

      /**
       * Whether the radio group is enabled
       */
      enabled: {
        check: "Boolean",
        apply: "_applyEnabled",
        event: "changeEnabled",
        init: true
      },

      /**
       * Whether the selection should wrap around. This means that the successor of
       * the last item is the first item.
       */
      wrap: {
        check: "Boolean",
        init: true
      },

      /**
       * If is set to <code>true</code> the selection could be empty,
       * otherwise is always one <code>RadioButton</code> selected.
       */
      allowEmptySelection: {
        check: "Boolean",
        init: false,
        apply: "_applyAllowEmptySelection"
      },

      /**
       * Flag signaling if the group at all is valid. All children will have the
       * same state.
       */
      valid: {
        check: "Boolean",
        init: true,
        apply: "_applyValid",
        event: "changeValid"
      },

      /**
       * Flag signaling if the group is required.
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
        event: "changeInvalidMessage",
        apply: "_applyInvalidMessage"
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

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.form.IRadioItem[]} The items of the radio group */
      __items: null,

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Get all managed items
       *
       * @return {qx.ui.form.IRadioItem[]} All managed items.
       */
      getItems: function getItems() {
        return this.__items;
      },

      /*
      ---------------------------------------------------------------------------
        REGISTRY
      ---------------------------------------------------------------------------
      */

      /**
       * Add the passed items to the radio group.
       *
       * @param varargs {qx.ui.form.IRadioItem} A variable number of items to add.
       */
      add: function add(varargs) {
        var items = this.__items;
        var item;
        var groupedProperty = this.getGroupedProperty();
        var groupedPropertyUp = qx.lang.String.firstUp(groupedProperty);

        for (var i = 0, l = arguments.length; i < l; i++) {
          item = arguments[i];

          if (items.includes(item)) {
            continue;
          } // Register listeners


          item.addListener("change" + groupedPropertyUp, this._onItemChangeChecked, this); // Push RadioButton to array

          items.push(item); // Inform radio button about new group

          item.set(this.getGroupProperty(), this); // Need to update internal value?

          if (item.get(groupedProperty)) {
            this.setSelection([item]);
          }
        } // Select first item when only one is registered


        if (!this.isAllowEmptySelection() && items.length > 0 && !this.getSelection()[0]) {
          this.setSelection([items[0]]);
        }
      },

      /**
       * Remove an item from the radio group.
       *
       * @param item {qx.ui.form.IRadioItem} The item to remove.
       */
      remove: function remove(item) {
        var items = this.__items;
        var groupedProperty = this.getGroupedProperty();
        var groupedPropertyUp = qx.lang.String.firstUp(groupedProperty);

        if (items.includes(item)) {
          // Remove RadioButton from array
          qx.lang.Array.remove(items, item); // Inform radio button about new group

          if (item.get(this.getGroupProperty()) === this) {
            item.reset(this.getGroupProperty());
          } // Deregister listeners


          item.removeListener("change" + groupedPropertyUp, this._onItemChangeChecked, this); // if the radio was checked, set internal selection to null

          if (item.get(groupedProperty)) {
            this.resetSelection();
          }
        }
      },

      /**
       * Returns an array containing the group's items.
       *
       * @return {qx.ui.form.IRadioItem[]} The item array
       */
      getChildren: function getChildren() {
        return this.__items;
      },

      /*
      ---------------------------------------------------------------------------
        LISTENER FOR ITEM CHANGES
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>changeValue</code> event of every managed item.
       *
       * @param e {qx.event.type.Data} Data event
       */
      _onItemChangeChecked: function _onItemChangeChecked(e) {
        var item = e.getTarget();
        var groupedProperty = this.getGroupedProperty();

        if (item.get(groupedProperty)) {
          this.setSelection([item]);
        } else if (this.getSelection()[0] == item) {
          this.resetSelection();
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyGroupedProperty: function _applyGroupedProperty(value, old) {
        var item;
        var oldFirstUp = qx.lang.String.firstUp(old);
        var newFirstUp = qx.lang.String.firstUp(value);

        for (var i = 0; i < this.__items.length; i++) {
          item = this.__items[i]; // remove the listener for the old change event

          item.removeListener("change" + oldFirstUp, this._onItemChangeChecked, this); // add the listener for the new change event

          item.removeListener("change" + newFirstUp, this._onItemChangeChecked, this);
        }
      },
      // property apply
      _applyInvalidMessage: function _applyInvalidMessage(value, old) {
        for (var i = 0; i < this.__items.length; i++) {
          this.__items[i].setInvalidMessage(value);
        }
      },
      // property apply
      _applyValid: function _applyValid(value, old) {
        for (var i = 0; i < this.__items.length; i++) {
          this.__items[i].setValid(value);
        }
      },
      // property apply
      _applyEnabled: function _applyEnabled(value, old) {
        var items = this.__items;

        if (value == null) {
          for (var i = 0, l = items.length; i < l; i++) {
            items[i].resetEnabled();
          }
        } else {
          for (var i = 0, l = items.length; i < l; i++) {
            items[i].setEnabled(value);
          }
        }
      },
      // property apply
      _applyAllowEmptySelection: function _applyAllowEmptySelection(value, old) {
        if (!value && this.isSelectionEmpty()) {
          this.resetSelection();
        }
      },

      /*
      ---------------------------------------------------------------------------
        SELECTION
      ---------------------------------------------------------------------------
      */

      /**
       * Select the item following the given item.
       */
      selectNext: function selectNext() {
        var item = this.getSelection()[0];
        var items = this.__items;
        var index = items.indexOf(item);

        if (index == -1) {
          return;
        }

        var i = 0;
        var length = items.length; // Find next enabled item

        if (this.getWrap()) {
          index = (index + 1) % length;
        } else {
          index = Math.min(index + 1, length - 1);
        }

        while (i < length && !items[index].getEnabled()) {
          index = (index + 1) % length;
          i++;
        }

        this.setSelection([items[index]]);
      },

      /**
       * Select the item previous the given item.
       */
      selectPrevious: function selectPrevious() {
        var item = this.getSelection()[0];
        var items = this.__items;
        var index = items.indexOf(item);

        if (index == -1) {
          return;
        }

        var i = 0;
        var length = items.length; // Find previous enabled item

        if (this.getWrap()) {
          index = (index - 1 + length) % length;
        } else {
          index = Math.max(index - 1, 0);
        }

        while (i < length && !items[index].getEnabled()) {
          index = (index - 1 + length) % length;
          i++;
        }

        this.setSelection([items[index]]);
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS FOR SELECTION API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the items for the selection.
       *
       * @return {qx.ui.form.IRadioItem[]} Items to select.
       */
      _getItems: function _getItems() {
        return this.getItems();
      },

      /**
       * Returns if the selection could be empty or not.
       *
       * @return {Boolean} <code>true</code> If selection could be empty,
       *    <code>false</code> otherwise.
       */
      _isAllowEmptySelection: function _isAllowEmptySelection() {
        return this.isAllowEmptySelection();
      },

      /**
       * Returns whether the item is selectable. In opposite to the default
       * implementation (which checks for visible items) every radio button
       * which is part of the group is selected even if it is currently not visible.
       *
       * @param item {qx.ui.form.IRadioItem} The item to check if its selectable.
       * @return {Boolean} <code>true</code> if the item is part of the radio group
       *    <code>false</code> otherwise.
       */
      _isItemSelectable: function _isItemSelectable(item) {
        return this.__items.indexOf(item) != -1;
      },

      /**
       * Event handler for <code>changeSelection</code>.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      __onChangeSelection: function __onChangeSelection(e) {
        var value = e.getData()[0];
        var old = e.getOldData()[0];
        var groupedProperty = this.getGroupedProperty();

        if (old) {
          old.set(groupedProperty, false);
        }

        if (value) {
          value.set(groupedProperty, true);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeArray("__items");
    }
  });
  qx.ui.form.RadioGroup.$$dbClassInfo = $$dbClassInfo;
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
       * Sebastian Werner (wpbasti)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This mixin links all methods to manage the multi selection from the
   * internal selection manager to the widget.
   */
  qx.Mixin.define("qx.ui.core.MMultiSelectionHandling", {
    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      // Create selection manager
      var clazz = this.SELECTION_MANAGER;
      var manager = this.__manager = new clazz(this); // Add widget event listeners

      this.addListener("pointerdown", manager.handlePointerDown, manager);
      this.addListener("tap", manager.handleTap, manager);
      this.addListener("pointerover", manager.handlePointerOver, manager);
      this.addListener("pointermove", manager.handlePointerMove, manager);
      this.addListener("losecapture", manager.handleLoseCapture, manager);
      this.addListener("keypress", manager.handleKeyPress, manager);
      this.addListener("addItem", manager.handleAddItem, manager);
      this.addListener("removeItem", manager.handleRemoveItem, manager); // Add manager listeners

      manager.addListener("changeSelection", this._onSelectionChange, this);
    },

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
       PROPERTIES
    *****************************************************************************
    */
    properties: {
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

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.selection.Abstract} The selection manager */
      __manager: null,

      /** @type {Boolean} used to control recursion in onSelectionChange */
      __inOnSelectionChange: false,

      /*
      ---------------------------------------------------------------------------
        USER API
      ---------------------------------------------------------------------------
      */

      /**
       * setValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @param items {null|qx.ui.core.Widget[]} Items to select.
       * @returns {null|TypeError} The status of this operation.
       */
      setValue: function setValue(items) {
        if (null === items) {
          this.__manager.clearSelection();

          return null;
        }

        {
          for (var i = 0, l = items.length; i < l; i++) {
            if (!(items[i] instanceof qx.ui.core.Widget)) {
              return new TypeError("Some items in provided argument are not widgets");
            }
          }
        }

        try {
          this.setSelection(items);
          return null;
        } catch (e) {
          return e;
        }
      },

      /**
       * getValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @returns {qx.ui.core.Widget[]} The selected widgets or null if there are none.
       */
      getValue: function getValue() {
        return this.__manager.getSelection();
      },

      /**
       * resetValue implements part of the {@link qx.ui.form.IField} interface.
       */
      resetValue: function resetValue() {
        this.__manager.clearSelection();
      },

      /**
       * Selects all items of the managed object.
       */
      selectAll: function selectAll() {
        this.__manager.selectAll();
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item.
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if the item is not a child element.
       */
      isSelected: function isSelected(item) {
        if (!qx.ui.core.Widget.contains(this, item)) {
          throw new Error("Could not test if " + item + " is selected, because it is not a child element!");
        }

        return this.__manager.isItemSelected(item);
      },

      /**
       * Adds the given item to the existing selection.
       *
       * Use {@link #setSelection} instead if you want to replace
       * the current selection.
       *
       * @param item {qx.ui.core.Widget} Any valid item.
       * @throws {Error} if the item is not a child element.
       */
      addToSelection: function addToSelection(item) {
        if (!qx.ui.core.Widget.contains(this, item)) {
          throw new Error("Could not add + " + item + " to selection, because it is not a child element!");
        }

        this.__manager.addItem(item);
      },

      /**
       * Removes the given item from the selection.
       *
       * Use {@link #resetSelection} when you want to clear
       * the whole selection at once.
       *
       * @param item {qx.ui.core.Widget} Any valid item
       * @throws {Error} if the item is not a child element.
       */
      removeFromSelection: function removeFromSelection(item) {
        if (!qx.ui.core.Widget.contains(this, item)) {
          throw new Error("Could not remove " + item + " from selection, because it is not a child element!");
        }

        this.__manager.removeItem(item);
      },

      /**
       * Selects an item range between two given items.
       *
       * @param begin {qx.ui.core.Widget} Item to start with
       * @param end {qx.ui.core.Widget} Item to end at
       */
      selectRange: function selectRange(begin, end) {
        this.__manager.selectItemRange(begin, end);
      },

      /**
       * Clears the whole selection at once. Also
       * resets the lead and anchor items and their
       * styles.
       */
      resetSelection: function resetSelection() {
        this.__manager.clearSelection();
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if one of the items is not a child element and if
       *    the mode is set to <code>single</code> or <code>one</code> and
       *    the items contains more than one item.
       */
      setSelection: function setSelection(items) {
        // Block recursion so that when selection changes modelSelection, the modelSelection
        //  cannot change selection again; this is important because modelSelection does not
        //  necessarily match selection, for example when the item's model properties are
        //  null.
        if (this.__inOnSelectionChange) {
          return;
        }

        for (var i = 0; i < items.length; i++) {
          if (!qx.ui.core.Widget.contains(this, items[i])) {
            throw new Error("Could not select " + items[i] + ", because it is not a child element!");
          }
        }

        if (items.length === 0) {
          this.resetSelection();
        } else {
          var currentSelection = this.getSelection();

          if (!qx.lang.Array.equals(currentSelection, items)) {
            this.__manager.replaceSelection(items);
          }
        }
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
        return this.__manager.getSelection();
      },

      /**
       * Returns an array of currently selected items sorted
       * by their index in the container.
       *
       * @return {qx.ui.core.Widget[]} Sorted list of items
       */
      getSortedSelection: function getSortedSelection() {
        return this.__manager.getSortedSelection();
      },

      /**
       * Whether the selection is empty
       *
       * @return {Boolean} Whether the selection is empty
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__manager.isSelectionEmpty();
      },

      /**
       * Returns the last selection context.
       *
       * @return {String | null} One of <code>tap</code>, <code>quick</code>,
       *    <code>drag</code> or <code>key</code> or <code>null</code>.
       */
      getSelectionContext: function getSelectionContext() {
        return this.__manager.getSelectionContext();
      },

      /**
       * Returns the internal selection manager. Use this with
       * caution!
       *
       * @return {qx.ui.core.selection.Abstract} The selection manager
       */
      _getManager: function _getManager() {
        return this.__manager;
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return this.__manager.getSelectables(all);
      },

      /**
       * Invert the selection. Select the non selected and deselect the selected.
       */
      invertSelection: function invertSelection() {
        this.__manager.invertSelection();
      },

      /**
       * Returns the current lead item. Generally the item which was last modified
       * by the user (tapped on etc.)
       *
       * @return {qx.ui.core.Widget} The lead item or <code>null</code>
       */
      _getLeadItem: function _getLeadItem() {
        var mode = this.__manager.getMode();

        if (mode === "single" || mode === "one") {
          return this.__manager.getSelectedItem();
        } else {
          return this.__manager.getLeadItem();
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applySelectionMode: function _applySelectionMode(value, old) {
        this.__manager.setMode(value);
      },
      // property apply
      _applyDragSelection: function _applyDragSelection(value, old) {
        this.__manager.setDrag(value);
      },
      // property apply
      _applyQuickSelection: function _applyQuickSelection(value, old) {
        this.__manager.setQuick(value);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>changeSelection</code> event on selection manager.
       *
       * @param e {qx.event.type.Data} Data event
       */
      _onSelectionChange: function _onSelectionChange(e) {
        if (this.__inOnSelectionChange) {
          return;
        }

        this.__inOnSelectionChange = true;

        try {
          this.fireDataEvent("changeSelection", e.getData(), e.getOldData());
          this.fireDataEvent("changeValue", e.getData(), e.getOldData());
        } finally {
          this.__inOnSelectionChange = false;
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__manager");
    }
  });
  qx.ui.core.MMultiSelectionHandling.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Location": {}
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
   * A selection manager, which handles the selection in widgets.
   */
  qx.Class.define("qx.ui.core.selection.Widget", {
    extend: qx.ui.core.selection.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param widget {qx.ui.core.Widget} The widget to connect to
     */
    construct: function construct(widget) {
      qx.ui.core.selection.Abstract.constructor.call(this);
      this.__widget = widget;
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __widget: null,

      /*
      ---------------------------------------------------------------------------
        BASIC SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _isSelectable: function _isSelectable(item) {
        return this._isItemSelectable(item) && item.getLayoutParent() === this.__widget;
      },
      // overridden
      _selectableToHashCode: function _selectableToHashCode(item) {
        return item.$$hash;
      },
      // overridden
      _styleSelectable: function _styleSelectable(item, type, enabled) {
        enabled ? item.addState(type) : item.removeState(type);
      },
      // overridden
      _capture: function _capture() {
        this.__widget.capture();
      },
      // overridden
      _releaseCapture: function _releaseCapture() {
        this.__widget.releaseCapture();
      },

      /**
       * Helper to return the selectability of the item concerning the
       * user interaction.
       *
       * @param item {qx.ui.core.Widget} The item to check.
       * @return {Boolean} true, if the item is selectable.
       */
      _isItemSelectable: function _isItemSelectable(item) {
        if (this._userInteraction) {
          return item.isVisible() && item.isEnabled();
        } else {
          return item.isVisible();
        }
      },

      /**
       * Returns the connected widget.
       * @return {qx.ui.core.Widget} The widget
       */
      _getWidget: function _getWidget() {
        return this.__widget;
      },

      /*
      ---------------------------------------------------------------------------
        DIMENSION AND LOCATION
      ---------------------------------------------------------------------------
      */
      // overridden
      _getLocation: function _getLocation() {
        var elem = this.__widget.getContentElement().getDomElement();

        return elem ? qx.bom.element.Location.get(elem) : null;
      },
      // overridden
      _getDimension: function _getDimension() {
        return this.__widget.getInnerSize();
      },
      // overridden
      _getSelectableLocationX: function _getSelectableLocationX(item) {
        var computed = item.getBounds();

        if (computed) {
          return {
            left: computed.left,
            right: computed.left + computed.width
          };
        }
      },
      // overridden
      _getSelectableLocationY: function _getSelectableLocationY(item) {
        var computed = item.getBounds();

        if (computed) {
          return {
            top: computed.top,
            bottom: computed.top + computed.height
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _getScroll: function _getScroll() {
        return {
          left: 0,
          top: 0
        };
      },
      // overridden
      _scrollBy: function _scrollBy(xoff, yoff) {// empty implementation
      },
      // overridden
      _scrollItemIntoView: function _scrollItemIntoView(item) {
        this.__widget.scrollChildIntoView(item);
      },

      /*
      ---------------------------------------------------------------------------
        QUERY SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      getSelectables: function getSelectables(all) {
        // if only the user selectables should be returned
        var oldUserInteraction = false;

        if (!all) {
          oldUserInteraction = this._userInteraction;
          this._userInteraction = true;
        }

        var children = this.__widget.getChildren();

        var result = [];
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (this._isItemSelectable(child)) {
            result.push(child);
          }
        } // reset to the former user interaction state


        this._userInteraction = oldUserInteraction;
        return result;
      },
      // overridden
      _getSelectableRange: function _getSelectableRange(item1, item2) {
        // Fast path for identical items
        if (item1 === item2) {
          return [item1];
        } // Iterate over children and collect all items
        // between the given two (including them)


        var children = this.__widget.getChildren();

        var result = [];
        var active = false;
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child === item1 || child === item2) {
            if (active) {
              result.push(child);
              break;
            } else {
              active = true;
            }
          }

          if (active && this._isItemSelectable(child)) {
            result.push(child);
          }
        }

        return result;
      },
      // overridden
      _getFirstSelectable: function _getFirstSelectable() {
        var children = this.__widget.getChildren();

        for (var i = 0, l = children.length; i < l; i++) {
          if (this._isItemSelectable(children[i])) {
            return children[i];
          }
        }

        return null;
      },
      // overridden
      _getLastSelectable: function _getLastSelectable() {
        var children = this.__widget.getChildren();

        for (var i = children.length - 1; i > 0; i--) {
          if (this._isItemSelectable(children[i])) {
            return children[i];
          }
        }

        return null;
      },
      // overridden
      _getRelatedSelectable: function _getRelatedSelectable(item, relation) {
        var vertical = this.__widget.getOrientation() === "vertical";

        var children = this.__widget.getChildren();

        var index = children.indexOf(item);
        var sibling;

        if (vertical && relation === "above" || !vertical && relation === "left") {
          for (var i = index - 1; i >= 0; i--) {
            sibling = children[i];

            if (this._isItemSelectable(sibling)) {
              return sibling;
            }
          }
        } else if (vertical && relation === "under" || !vertical && relation === "right") {
          for (var i = index + 1; i < children.length; i++) {
            sibling = children[i];

            if (this._isItemSelectable(sibling)) {
              return sibling;
            }
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
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__widget = null;
    }
  });
  qx.ui.core.selection.Widget.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.selection.Widget": {
        "require": true
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
   * A selection manager, which handles the selection in widgets extending
   * {@link qx.ui.core.scroll.AbstractScrollArea}.
   */
  qx.Class.define("qx.ui.core.selection.ScrollArea", {
    extend: qx.ui.core.selection.Widget,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        BASIC SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _isSelectable: function _isSelectable(item) {
        return this._isItemSelectable(item) && item.getLayoutParent() === this._getWidget().getChildrenContainer();
      },

      /*
      ---------------------------------------------------------------------------
        DIMENSION AND LOCATION
      ---------------------------------------------------------------------------
      */
      // overridden
      _getDimension: function _getDimension() {
        return this._getWidget().getPaneSize();
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _getScroll: function _getScroll() {
        var widget = this._getWidget();

        return {
          left: widget.getScrollX(),
          top: widget.getScrollY()
        };
      },
      // overridden
      _scrollBy: function _scrollBy(xoff, yoff) {
        var widget = this._getWidget();

        widget.scrollByX(xoff);
        widget.scrollByY(yoff);
      },

      /*
      ---------------------------------------------------------------------------
        QUERY SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _getPage: function _getPage(lead, up) {
        var selectables = this.getSelectables();
        var length = selectables.length;
        var start = selectables.indexOf(lead); // Given lead is not a selectable?!?

        if (start === -1) {
          throw new Error("Invalid lead item: " + lead);
        }

        var widget = this._getWidget();

        var scrollTop = widget.getScrollY();
        var innerHeight = widget.getInnerSize().height;
        var top, bottom, found;

        if (up) {
          var min = scrollTop;
          var i = start; // Loop required to scroll pages up dynamically

          while (1) {
            // Iterate through all selectables from start
            for (; i >= 0; i--) {
              top = widget.getItemTop(selectables[i]); // This item is out of the visible block

              if (top < min) {
                // Use previous one
                found = i + 1;
                break;
              }
            } // Nothing found. Return first item.


            if (found == null) {
              var first = this._getFirstSelectable();

              return first == lead ? null : first;
            } // Found item, but is identical to start or even before start item
            // Update min position and try on previous page


            if (found >= start) {
              // Reduce min by the distance of the lead item to the visible
              // bottom edge. This is needed instead of a simple subtraction
              // of the inner height to keep the last lead visible on page key
              // presses. This is the behavior of native toolkits as well.
              min -= innerHeight + scrollTop - widget.getItemBottom(lead);
              found = null;
              continue;
            } // Return selectable


            return selectables[found];
          }
        } else {
          var max = innerHeight + scrollTop;
          var i = start; // Loop required to scroll pages down dynamically

          while (1) {
            // Iterate through all selectables from start
            for (; i < length; i++) {
              bottom = widget.getItemBottom(selectables[i]); // This item is out of the visible block

              if (bottom > max) {
                // Use previous one
                found = i - 1;
                break;
              }
            } // Nothing found. Return last item.


            if (found == null) {
              var last = this._getLastSelectable();

              return last == lead ? null : last;
            } // Found item, but is identical to start or even before start item
            // Update max position and try on next page


            if (found <= start) {
              // Extend max by the distance of the lead item to the visible
              // top edge. This is needed instead of a simple addition
              // of the inner height to keep the last lead visible on page key
              // presses. This is the behavior of native toolkits as well.
              max += widget.getItemTop(lead) - scrollTop;
              found = null;
              continue;
            } // Return selectable


            return selectables[found];
          }
        }
      }
    }
  });
  qx.ui.core.selection.ScrollArea.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.IMultiSelection": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.IField": {
        "require": true
      },
      "qx.ui.form.IModelSelection": {
        "require": true
      },
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.core.MMultiSelectionHandling": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.form.MModelSelection": {
        "require": true
      },
      "qx.ui.core.selection.ScrollArea": {
        "require": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.layout.VBox": {},
      "qx.bom.element.Attribute": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * A list of items. Displays an automatically scrolling list for all
   * added {@link qx.ui.form.ListItem} instances. Supports various
   * selection options: single, multi, ...
   */
  qx.Class.define("qx.ui.form.List", {
    extend: qx.ui.core.scroll.AbstractScrollArea,
    implement: [qx.ui.core.IMultiSelection, qx.ui.form.IForm, qx.ui.form.IField, qx.ui.form.IModelSelection],
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MMultiSelectionHandling, qx.ui.form.MForm, qx.ui.form.MModelSelection],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param horizontal {Boolean?false} Whether the list should be horizontal.
     */
    construct: function construct(horizontal) {
      qx.ui.core.scroll.AbstractScrollArea.constructor.call(this); // Create content

      this.__content = this._createListItemContainer(); // Used to fire item add/remove events

      this.__content.addListener("addChildWidget", this._onAddChild, this);

      this.__content.addListener("removeChildWidget", this._onRemoveChild, this); // Add to scrollpane


      this.getChildControl("pane").add(this.__content); // Apply orientation

      if (horizontal) {
        this.setOrientation("horizontal");
      } else {
        this.initOrientation();
      } // Add keypress listener


      this.addListener("keypress", this._onKeyPress);
      this.addListener("keyinput", this._onKeyInput); // initialize the search string

      this.__pressedString = "";
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * This event is fired after a list item was added to the list. The
       * {@link qx.event.type.Data#getData} method of the event returns the
       * added item.
       */
      addItem: "qx.event.type.Data",

      /**
       * This event is fired after a list item has been removed from the list.
       * The {@link qx.event.type.Data#getData} method of the event returns the
       * removed item.
       */
      removeItem: "qx.event.type.Data"
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
        init: "list"
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

      /**
       * Whether the list should be rendered horizontal or vertical.
       */
      orientation: {
        check: ["horizontal", "vertical"],
        init: "vertical",
        apply: "_applyOrientation"
      },

      /** Spacing between the items */
      spacing: {
        check: "Integer",
        init: 0,
        apply: "_applySpacing",
        themeable: true
      },

      /** Controls whether the inline-find feature is activated or not */
      enableInlineFind: {
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
      __pressedString: null,
      __lastKeyPress: null,

      /** @type {qx.ui.core.Widget} The children container */
      __content: null,

      /** @type {Class} Pointer to the selection manager to use */
      SELECTION_MANAGER: qx.ui.core.selection.ScrollArea,

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      getChildrenContainer: function getChildrenContainer() {
        return this.__content;
      },

      /**
       * Handle child widget adds on the content pane
       *
       * @param e {qx.event.type.Data} the event instance
       */
      _onAddChild: function _onAddChild(e) {
        this.fireDataEvent("addItem", e.getData());
      },

      /**
       * Handle child widget removes on the content pane
       *
       * @param e {qx.event.type.Data} the event instance
       */
      _onRemoveChild: function _onRemoveChild(e) {
        this.fireDataEvent("removeItem", e.getData());
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Used to route external <code>keypress</code> events to the list
       * handling (in fact the manager of the list)
       *
       * @param e {qx.event.type.KeySequence} KeyPress event
       */
      handleKeyPress: function handleKeyPress(e) {
        if (!this._onKeyPress(e)) {
          this._getManager().handleKeyPress(e);
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROTECTED API
      ---------------------------------------------------------------------------
      */

      /**
       * This container holds the list item widgets.
       *
       * @return {qx.ui.container.Composite} Container for the list item widgets
       */
      _createListItemContainer: function _createListItemContainer() {
        return new qx.ui.container.Composite();
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        var content = this.__content; // save old layout for disposal

        var oldLayout = content.getLayout(); // Create new layout

        var horizontal = value === "horizontal";
        var layout = horizontal ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox(); // Configure content

        content.setLayout(layout);
        content.setAllowGrowX(!horizontal);
        content.setAllowGrowY(horizontal); // Configure spacing

        this._applySpacing(this.getSpacing()); // dispose old layout


        if (oldLayout) {
          oldLayout.dispose();
        }
      },
      // property apply
      _applySpacing: function _applySpacing(value, old) {
        this.__content.getLayout().setSpacing(value);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>keypress</code> events.
       *
       * @param e {qx.event.type.KeySequence} KeyPress event
       * @return {Boolean} Whether the event was processed
       */
      _onKeyPress: function _onKeyPress(e) {
        // Execute action on press <ENTER>
        if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed()) {
          var items = this.getSelection();

          for (var i = 0; i < items.length; i++) {
            items[i].fireEvent("action");
          }

          return true;
        }

        return false;
      },

      /*
      ---------------------------------------------------------------------------
        FIND SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Handles the inline find - if enabled
       *
       * @param e {qx.event.type.KeyInput} key input event
       */
      _onKeyInput: function _onKeyInput(e) {
        // do nothing if the find is disabled
        if (!this.getEnableInlineFind()) {
          return;
        } // Only useful in single or one selection mode


        var mode = this.getSelectionMode();

        if (!(mode === "single" || mode === "one")) {
          return;
        } // Reset string after a second of non pressed key


        if (new Date().valueOf() - this.__lastKeyPress > 1000) {
          this.__pressedString = "";
        } // Combine keys the user pressed to a string


        this.__pressedString += e.getChar(); // Find matching item

        var matchedItem = this.findItemByLabelFuzzy(this.__pressedString); // if an item was found, select it

        if (matchedItem) {
          this.setSelection([matchedItem]);
        } // Store timestamp


        this.__lastKeyPress = new Date().valueOf();
      },

      /**
       * Takes the given string and tries to find a ListItem
       * which starts with this string. The search is not case sensitive and the
       * first found ListItem will be returned. If there could not be found any
       * qualifying list item, null will be returned.
       *
       * @param search {String} The text with which the label of the ListItem should start with
       * @return {qx.ui.form.ListItem} The found ListItem or null
       */
      findItemByLabelFuzzy: function findItemByLabelFuzzy(search) {
        // lower case search text
        search = search.toLowerCase(); // get all items of the list

        var items = this.getChildren(); // go threw all items

        for (var i = 0, l = items.length; i < l; i++) {
          // get the label of the current item
          var currentLabel = items[i].getLabel(); // if the label fits with the search text (ignore case, begins with)

          if (currentLabel && currentLabel.toLowerCase().indexOf(search) == 0) {
            // just return the first found element
            return items[i];
          }
        } // if no element was found, return null


        return null;
      },

      /**
       * Find an item by its {@link qx.ui.basic.Atom#getLabel}.
       *
       * @param search {String} A label or any item
       * @param ignoreCase {Boolean?true} description
       * @return {qx.ui.form.ListItem} The found ListItem or null
       */
      findItem: function findItem(search, ignoreCase) {
        // lowercase search
        if (ignoreCase !== false) {
          search = search.toLowerCase();
        }

        ; // get all items of the list

        var items = this.getChildren();
        var item; // go through all items

        for (var i = 0, l = items.length; i < l; i++) {
          item = items[i]; // get the content of the label; text content when rich

          var label;

          if (item.isRich()) {
            var control = item.getChildControl("label", true);

            if (control) {
              var labelNode = control.getContentElement().getDomElement();

              if (labelNode) {
                label = qx.bom.element.Attribute.get(labelNode, "text");
              }
            }
          } else {
            label = item.getLabel();
          }

          if (label != null) {
            if (label.translate) {
              label = label.translate();
            }

            if (ignoreCase !== false) {
              label = label.toLowerCase();
            }

            if (label.toString() == search.toString()) {
              return item;
            }
          }
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
      this._disposeObjects("__content");
    }
  });
  qx.ui.form.List.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.StringEscape": {},
      "qx.lang.Object": {
        "defer": "runtime"
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
   * A Collection of utility functions to escape and unescape strings.
   */
  qx.Bootstrap.define("qx.bom.String", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Mapping of HTML entity names to the corresponding char code */
      TO_CHARCODE: {
        "quot": 34,
        // " - double-quote
        "amp": 38,
        // &
        "lt": 60,
        // <
        "gt": 62,
        // >
        // http://www.w3.org/TR/REC-html40/sgml/entities.html
        // ISO 8859-1 characters
        "nbsp": 160,
        // no-break space
        "iexcl": 161,
        // inverted exclamation mark
        "cent": 162,
        // cent sign
        "pound": 163,
        // pound sterling sign
        "curren": 164,
        // general currency sign
        "yen": 165,
        // yen sign
        "brvbar": 166,
        // broken (vertical) bar
        "sect": 167,
        // section sign
        "uml": 168,
        // umlaut (dieresis)
        "copy": 169,
        // copyright sign
        "ordf": 170,
        // ordinal indicator, feminine
        "laquo": 171,
        // angle quotation mark, left
        "not": 172,
        // not sign
        "shy": 173,
        // soft hyphen
        "reg": 174,
        // registered sign
        "macr": 175,
        // macron
        "deg": 176,
        // degree sign
        "plusmn": 177,
        // plus-or-minus sign
        "sup2": 178,
        // superscript two
        "sup3": 179,
        // superscript three
        "acute": 180,
        // acute accent
        "micro": 181,
        // micro sign
        "para": 182,
        // pilcrow (paragraph sign)
        "middot": 183,
        // middle dot
        "cedil": 184,
        // cedilla
        "sup1": 185,
        // superscript one
        "ordm": 186,
        // ordinal indicator, masculine
        "raquo": 187,
        // angle quotation mark, right
        "frac14": 188,
        // fraction one-quarter
        "frac12": 189,
        // fraction one-half
        "frac34": 190,
        // fraction three-quarters
        "iquest": 191,
        // inverted question mark
        "Agrave": 192,
        // capital A, grave accent
        "Aacute": 193,
        // capital A, acute accent
        "Acirc": 194,
        // capital A, circumflex accent
        "Atilde": 195,
        // capital A, tilde
        "Auml": 196,
        // capital A, dieresis or umlaut mark
        "Aring": 197,
        // capital A, ring
        "AElig": 198,
        // capital AE diphthong (ligature)
        "Ccedil": 199,
        // capital C, cedilla
        "Egrave": 200,
        // capital E, grave accent
        "Eacute": 201,
        // capital E, acute accent
        "Ecirc": 202,
        // capital E, circumflex accent
        "Euml": 203,
        // capital E, dieresis or umlaut mark
        "Igrave": 204,
        // capital I, grave accent
        "Iacute": 205,
        // capital I, acute accent
        "Icirc": 206,
        // capital I, circumflex accent
        "Iuml": 207,
        // capital I, dieresis or umlaut mark
        "ETH": 208,
        // capital Eth, Icelandic
        "Ntilde": 209,
        // capital N, tilde
        "Ograve": 210,
        // capital O, grave accent
        "Oacute": 211,
        // capital O, acute accent
        "Ocirc": 212,
        // capital O, circumflex accent
        "Otilde": 213,
        // capital O, tilde
        "Ouml": 214,
        // capital O, dieresis or umlaut mark
        "times": 215,
        // multiply sign
        "Oslash": 216,
        // capital O, slash
        "Ugrave": 217,
        // capital U, grave accent
        "Uacute": 218,
        // capital U, acute accent
        "Ucirc": 219,
        // capital U, circumflex accent
        "Uuml": 220,
        // capital U, dieresis or umlaut mark
        "Yacute": 221,
        // capital Y, acute accent
        "THORN": 222,
        // capital THORN, Icelandic
        "szlig": 223,
        // small sharp s, German (sz ligature)
        "agrave": 224,
        // small a, grave accent
        "aacute": 225,
        // small a, acute accent
        "acirc": 226,
        // small a, circumflex accent
        "atilde": 227,
        // small a, tilde
        "auml": 228,
        // small a, dieresis or umlaut mark
        "aring": 229,
        // small a, ring
        "aelig": 230,
        // small ae diphthong (ligature)
        "ccedil": 231,
        // small c, cedilla
        "egrave": 232,
        // small e, grave accent
        "eacute": 233,
        // small e, acute accent
        "ecirc": 234,
        // small e, circumflex accent
        "euml": 235,
        // small e, dieresis or umlaut mark
        "igrave": 236,
        // small i, grave accent
        "iacute": 237,
        // small i, acute accent
        "icirc": 238,
        // small i, circumflex accent
        "iuml": 239,
        // small i, dieresis or umlaut mark
        "eth": 240,
        // small eth, Icelandic
        "ntilde": 241,
        // small n, tilde
        "ograve": 242,
        // small o, grave accent
        "oacute": 243,
        // small o, acute accent
        "ocirc": 244,
        // small o, circumflex accent
        "otilde": 245,
        // small o, tilde
        "ouml": 246,
        // small o, dieresis or umlaut mark
        "divide": 247,
        // divide sign
        "oslash": 248,
        // small o, slash
        "ugrave": 249,
        // small u, grave accent
        "uacute": 250,
        // small u, acute accent
        "ucirc": 251,
        // small u, circumflex accent
        "uuml": 252,
        // small u, dieresis or umlaut mark
        "yacute": 253,
        // small y, acute accent
        "thorn": 254,
        // small thorn, Icelandic
        "yuml": 255,
        // small y, dieresis or umlaut mark
        // Latin Extended-B
        "fnof": 402,
        // latin small f with hook = function= florin, U+0192 ISOtech
        // Greek
        "Alpha": 913,
        // greek capital letter alpha, U+0391
        "Beta": 914,
        // greek capital letter beta, U+0392
        "Gamma": 915,
        // greek capital letter gamma,U+0393 ISOgrk3
        "Delta": 916,
        // greek capital letter delta,U+0394 ISOgrk3
        "Epsilon": 917,
        // greek capital letter epsilon, U+0395
        "Zeta": 918,
        // greek capital letter zeta, U+0396
        "Eta": 919,
        // greek capital letter eta, U+0397
        "Theta": 920,
        // greek capital letter theta,U+0398 ISOgrk3
        "Iota": 921,
        // greek capital letter iota, U+0399
        "Kappa": 922,
        // greek capital letter kappa, U+039A
        "Lambda": 923,
        // greek capital letter lambda,U+039B ISOgrk3
        "Mu": 924,
        // greek capital letter mu, U+039C
        "Nu": 925,
        // greek capital letter nu, U+039D
        "Xi": 926,
        // greek capital letter xi, U+039E ISOgrk3
        "Omicron": 927,
        // greek capital letter omicron, U+039F
        "Pi": 928,
        // greek capital letter pi, U+03A0 ISOgrk3
        "Rho": 929,
        // greek capital letter rho, U+03A1
        // there is no Sigmaf, and no U+03A2 character either
        "Sigma": 931,
        // greek capital letter sigma,U+03A3 ISOgrk3
        "Tau": 932,
        // greek capital letter tau, U+03A4
        "Upsilon": 933,
        // greek capital letter upsilon,U+03A5 ISOgrk3
        "Phi": 934,
        // greek capital letter phi,U+03A6 ISOgrk3
        "Chi": 935,
        // greek capital letter chi, U+03A7
        "Psi": 936,
        // greek capital letter psi,U+03A8 ISOgrk3
        "Omega": 937,
        // greek capital letter omega,U+03A9 ISOgrk3
        "alpha": 945,
        // greek small letter alpha,U+03B1 ISOgrk3
        "beta": 946,
        // greek small letter beta, U+03B2 ISOgrk3
        "gamma": 947,
        // greek small letter gamma,U+03B3 ISOgrk3
        "delta": 948,
        // greek small letter delta,U+03B4 ISOgrk3
        "epsilon": 949,
        // greek small letter epsilon,U+03B5 ISOgrk3
        "zeta": 950,
        // greek small letter zeta, U+03B6 ISOgrk3
        "eta": 951,
        // greek small letter eta, U+03B7 ISOgrk3
        "theta": 952,
        // greek small letter theta,U+03B8 ISOgrk3
        "iota": 953,
        // greek small letter iota, U+03B9 ISOgrk3
        "kappa": 954,
        // greek small letter kappa,U+03BA ISOgrk3
        "lambda": 955,
        // greek small letter lambda,U+03BB ISOgrk3
        "mu": 956,
        // greek small letter mu, U+03BC ISOgrk3
        "nu": 957,
        // greek small letter nu, U+03BD ISOgrk3
        "xi": 958,
        // greek small letter xi, U+03BE ISOgrk3
        "omicron": 959,
        // greek small letter omicron, U+03BF NEW
        "pi": 960,
        // greek small letter pi, U+03C0 ISOgrk3
        "rho": 961,
        // greek small letter rho, U+03C1 ISOgrk3
        "sigmaf": 962,
        // greek small letter final sigma,U+03C2 ISOgrk3
        "sigma": 963,
        // greek small letter sigma,U+03C3 ISOgrk3
        "tau": 964,
        // greek small letter tau, U+03C4 ISOgrk3
        "upsilon": 965,
        // greek small letter upsilon,U+03C5 ISOgrk3
        "phi": 966,
        // greek small letter phi, U+03C6 ISOgrk3
        "chi": 967,
        // greek small letter chi, U+03C7 ISOgrk3
        "psi": 968,
        // greek small letter psi, U+03C8 ISOgrk3
        "omega": 969,
        // greek small letter omega,U+03C9 ISOgrk3
        "thetasym": 977,
        // greek small letter theta symbol,U+03D1 NEW
        "upsih": 978,
        // greek upsilon with hook symbol,U+03D2 NEW
        "piv": 982,
        // greek pi symbol, U+03D6 ISOgrk3
        // General Punctuation
        "bull": 8226,
        // bullet = black small circle,U+2022 ISOpub
        // bullet is NOT the same as bullet operator, U+2219
        "hellip": 8230,
        // horizontal ellipsis = three dot leader,U+2026 ISOpub
        "prime": 8242,
        // prime = minutes = feet, U+2032 ISOtech
        "Prime": 8243,
        // double prime = seconds = inches,U+2033 ISOtech
        "oline": 8254,
        // overline = spacing overscore,U+203E NEW
        "frasl": 8260,
        // fraction slash, U+2044 NEW
        // Letterlike Symbols
        "weierp": 8472,
        // script capital P = power set= Weierstrass p, U+2118 ISOamso
        "image": 8465,
        // blackletter capital I = imaginary part,U+2111 ISOamso
        "real": 8476,
        // blackletter capital R = real part symbol,U+211C ISOamso
        "trade": 8482,
        // trade mark sign, U+2122 ISOnum
        "alefsym": 8501,
        // alef symbol = first transfinite cardinal,U+2135 NEW
        // alef symbol is NOT the same as hebrew letter alef,U+05D0 although the same glyph could be used to depict both characters
        // Arrows
        "larr": 8592,
        // leftwards arrow, U+2190 ISOnum
        "uarr": 8593,
        // upwards arrow, U+2191 ISOnum-->
        "rarr": 8594,
        // rightwards arrow, U+2192 ISOnum
        "darr": 8595,
        // downwards arrow, U+2193 ISOnum
        "harr": 8596,
        // left right arrow, U+2194 ISOamsa
        "crarr": 8629,
        // downwards arrow with corner leftwards= carriage return, U+21B5 NEW
        "lArr": 8656,
        // leftwards double arrow, U+21D0 ISOtech
        // ISO 10646 does not say that lArr is the same as the 'is implied by' arrow but also does not have any other character for that function. So ? lArr can be used for 'is implied by' as ISOtech suggests
        "uArr": 8657,
        // upwards double arrow, U+21D1 ISOamsa
        "rArr": 8658,
        // rightwards double arrow,U+21D2 ISOtech
        // ISO 10646 does not say this is the 'implies' character but does not have another character with this function so ?rArr can be used for 'implies' as ISOtech suggests
        "dArr": 8659,
        // downwards double arrow, U+21D3 ISOamsa
        "hArr": 8660,
        // left right double arrow,U+21D4 ISOamsa
        // Mathematical Operators
        "forall": 8704,
        // for all, U+2200 ISOtech
        "part": 8706,
        // partial differential, U+2202 ISOtech
        "exist": 8707,
        // there exists, U+2203 ISOtech
        "empty": 8709,
        // empty set = null set = diameter,U+2205 ISOamso
        "nabla": 8711,
        // nabla = backward difference,U+2207 ISOtech
        "isin": 8712,
        // element of, U+2208 ISOtech
        "notin": 8713,
        // not an element of, U+2209 ISOtech
        "ni": 8715,
        // contains as member, U+220B ISOtech
        // should there be a more memorable name than 'ni'?
        "prod": 8719,
        // n-ary product = product sign,U+220F ISOamsb
        // prod is NOT the same character as U+03A0 'greek capital letter pi' though the same glyph might be used for both
        "sum": 8721,
        // n-ary summation, U+2211 ISOamsb
        // sum is NOT the same character as U+03A3 'greek capital letter sigma' though the same glyph might be used for both
        "minus": 8722,
        // minus sign, U+2212 ISOtech
        "lowast": 8727,
        // asterisk operator, U+2217 ISOtech
        "radic": 8730,
        // square root = radical sign,U+221A ISOtech
        "prop": 8733,
        // proportional to, U+221D ISOtech
        "infin": 8734,
        // infinity, U+221E ISOtech
        "ang": 8736,
        // angle, U+2220 ISOamso
        "and": 8743,
        // logical and = wedge, U+2227 ISOtech
        "or": 8744,
        // logical or = vee, U+2228 ISOtech
        "cap": 8745,
        // intersection = cap, U+2229 ISOtech
        "cup": 8746,
        // union = cup, U+222A ISOtech
        "int": 8747,
        // integral, U+222B ISOtech
        "there4": 8756,
        // therefore, U+2234 ISOtech
        "sim": 8764,
        // tilde operator = varies with = similar to,U+223C ISOtech
        // tilde operator is NOT the same character as the tilde, U+007E,although the same glyph might be used to represent both
        "cong": 8773,
        // approximately equal to, U+2245 ISOtech
        "asymp": 8776,
        // almost equal to = asymptotic to,U+2248 ISOamsr
        "ne": 8800,
        // not equal to, U+2260 ISOtech
        "equiv": 8801,
        // identical to, U+2261 ISOtech
        "le": 8804,
        // less-than or equal to, U+2264 ISOtech
        "ge": 8805,
        // greater-than or equal to,U+2265 ISOtech
        "sub": 8834,
        // subset of, U+2282 ISOtech
        "sup": 8835,
        // superset of, U+2283 ISOtech
        // note that nsup, 'not a superset of, U+2283' is not covered by the Symbol font encoding and is not included. Should it be, for symmetry?It is in ISOamsn  --> <!ENTITY nsub": 8836,  //not a subset of, U+2284 ISOamsn
        "sube": 8838,
        // subset of or equal to, U+2286 ISOtech
        "supe": 8839,
        // superset of or equal to,U+2287 ISOtech
        "oplus": 8853,
        // circled plus = direct sum,U+2295 ISOamsb
        "otimes": 8855,
        // circled times = vector product,U+2297 ISOamsb
        "perp": 8869,
        // up tack = orthogonal to = perpendicular,U+22A5 ISOtech
        "sdot": 8901,
        // dot operator, U+22C5 ISOamsb
        // dot operator is NOT the same character as U+00B7 middle dot
        // Miscellaneous Technical
        "lceil": 8968,
        // left ceiling = apl upstile,U+2308 ISOamsc
        "rceil": 8969,
        // right ceiling, U+2309 ISOamsc
        "lfloor": 8970,
        // left floor = apl downstile,U+230A ISOamsc
        "rfloor": 8971,
        // right floor, U+230B ISOamsc
        "lang": 9001,
        // left-pointing angle bracket = bra,U+2329 ISOtech
        // lang is NOT the same character as U+003C 'less than' or U+2039 'single left-pointing angle quotation mark'
        "rang": 9002,
        // right-pointing angle bracket = ket,U+232A ISOtech
        // rang is NOT the same character as U+003E 'greater than' or U+203A 'single right-pointing angle quotation mark'
        // Geometric Shapes
        "loz": 9674,
        // lozenge, U+25CA ISOpub
        // Miscellaneous Symbols
        "spades": 9824,
        // black spade suit, U+2660 ISOpub
        // black here seems to mean filled as opposed to hollow
        "clubs": 9827,
        // black club suit = shamrock,U+2663 ISOpub
        "hearts": 9829,
        // black heart suit = valentine,U+2665 ISOpub
        "diams": 9830,
        // black diamond suit, U+2666 ISOpub
        // Latin Extended-A
        "OElig": 338,
        //  -- latin capital ligature OE,U+0152 ISOlat2
        "oelig": 339,
        //  -- latin small ligature oe, U+0153 ISOlat2
        // ligature is a misnomer, this is a separate character in some languages
        "Scaron": 352,
        //  -- latin capital letter S with caron,U+0160 ISOlat2
        "scaron": 353,
        //  -- latin small letter s with caron,U+0161 ISOlat2
        "Yuml": 376,
        //  -- latin capital letter Y with diaeresis,U+0178 ISOlat2
        // Spacing Modifier Letters
        "circ": 710,
        //  -- modifier letter circumflex accent,U+02C6 ISOpub
        "tilde": 732,
        // small tilde, U+02DC ISOdia
        // General Punctuation
        "ensp": 8194,
        // en space, U+2002 ISOpub
        "emsp": 8195,
        // em space, U+2003 ISOpub
        "thinsp": 8201,
        // thin space, U+2009 ISOpub
        "zwnj": 8204,
        // zero width non-joiner,U+200C NEW RFC 2070
        "zwj": 8205,
        // zero width joiner, U+200D NEW RFC 2070
        "lrm": 8206,
        // left-to-right mark, U+200E NEW RFC 2070
        "rlm": 8207,
        // right-to-left mark, U+200F NEW RFC 2070
        "ndash": 8211,
        // en dash, U+2013 ISOpub
        "mdash": 8212,
        // em dash, U+2014 ISOpub
        "lsquo": 8216,
        // left single quotation mark,U+2018 ISOnum
        "rsquo": 8217,
        // right single quotation mark,U+2019 ISOnum
        "sbquo": 8218,
        // single low-9 quotation mark, U+201A NEW
        "ldquo": 8220,
        // left double quotation mark,U+201C ISOnum
        "rdquo": 8221,
        // right double quotation mark,U+201D ISOnum
        "bdquo": 8222,
        // double low-9 quotation mark, U+201E NEW
        "dagger": 8224,
        // dagger, U+2020 ISOpub
        "Dagger": 8225,
        // double dagger, U+2021 ISOpub
        "permil": 8240,
        // per mille sign, U+2030 ISOtech
        "lsaquo": 8249,
        // single left-pointing angle quotation mark,U+2039 ISO proposed
        // lsaquo is proposed but not yet ISO standardized
        "rsaquo": 8250,
        // single right-pointing angle quotation mark,U+203A ISO proposed
        // rsaquo is proposed but not yet ISO standardized
        "euro": 8364 //  -- euro sign, U+20AC NEW

      },

      /**
       * Escapes the characters in a <code>String</code> using HTML entities.
       *
       * For example: <tt>"bread" & "butter"</tt> => <tt>&amp;quot;bread&amp;quot; &amp;amp; &amp;quot;butter&amp;quot;</tt>.
       * Supports all known HTML 4.0 entities, including funky accents.
       *
       * * <a href="http://www.w3.org/TR/REC-html32#latin1">HTML 3.2 Character Entities for ISO Latin-1</a>
       * * <a href="http://www.w3.org/TR/REC-html40/sgml/entities.html">HTML 4.0 Character entity references</a>
       * * <a href="http://www.w3.org/TR/html401/charset.html#h-5.3">HTML 4.01 Character References</a>
       * * <a href="http://www.w3.org/TR/html401/charset.html#code-position">HTML 4.01 Code positions</a>
       *
       * @param str {String} the String to escape
       * @return {String} a new escaped String
       * @see #unescape
       */
      escape: function escape(str) {
        return qx.util.StringEscape.escape(str, qx.bom.String.FROM_CHARCODE);
      },

      /**
       * Unescapes a string containing entity escapes to a string
       * containing the actual Unicode characters corresponding to the
       * escapes. Supports HTML 4.0 entities.
       *
       * For example, the string "&amp;lt;Fran&amp;ccedil;ais&amp;gt;"
       * will become "&lt;Fran&ccedil;ais&gt;"
       *
       * If an entity is unrecognized, it is left alone, and inserted
       * verbatim into the result string. e.g. "&amp;gt;&amp;zzzz;x" will
       * become "&gt;&amp;zzzz;x".
       *
       * @param str {String} the String to unescape, may be null
       * @return {var} a new unescaped String
       * @see #escape
       */
      unescape: function unescape(str) {
        return qx.util.StringEscape.unescape(str, qx.bom.String.TO_CHARCODE);
      },

      /**
       * Converts a plain text string into HTML.
       * This is similar to {@link #escape} but converts new lines to
       * <tt>&lt:br&gt:</tt> and preserves whitespaces.
       *
       * @param str {String} the String to convert
       * @return {String} a new converted String
       * @see #escape
       */
      fromText: function fromText(str) {
        return qx.bom.String.escape(str).replace(/(  |\n)/g, function (chr) {
          var map = {
            "  ": " &nbsp;",
            "\n": "<br>"
          };
          return map[chr] || chr;
        });
      },

      /**
       * Converts HTML to plain text.
       *
       * * Strips all HTML tags
       * * converts <tt>&lt:br&gt:</tt> to new line
       * * unescapes HTML entities
       *
       * @param str {String} HTML string to converts
       * @return {String} plain text representation of the HTML string
       */
      toText: function toText(str) {
        return qx.bom.String.unescape(str.replace(/\s+|<([^>])+>/gi, function (chr) //return qx.bom.String.unescape(str.replace(/<\/?[^>]+(>|$)/gi, function(chr)
        {
          if (chr.indexOf("<br") === 0) {
            return "\n";
          } else if (chr.length > 0 && chr.replace(/^\s*/, "").replace(/\s*$/, "") == "") {
            return " ";
          } else {
            return "";
          }
        }));
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      /** Mapping of char codes to HTML entity names */
      statics.FROM_CHARCODE = qx.lang.Object.invert(statics.TO_CHARCODE);
    }
  });
  qx.bom.String.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {
        "construct": true
      },
      "qx.ui.core.ISingleSelectionProvider": {
        "construct": true
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Responsible for the single selection management.
   *
   * The class manage a list of {@link qx.ui.core.Widget} which are returned from
   * {@link qx.ui.core.ISingleSelectionProvider#getItems}.
   *
   * @internal
   */
  qx.Class.define("qx.ui.core.SingleSelectionManager", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Construct the single selection manager.
     *
     * @param selectionProvider {qx.ui.core.ISingleSelectionProvider} The provider
     * for selection.
     */
    construct: function construct(selectionProvider) {
      qx.core.Object.constructor.call(this);
      {
        qx.core.Assert.assertInterface(selectionProvider, qx.ui.core.ISingleSelectionProvider, "Invalid selectionProvider!");
      }
      this.__selectionProvider = selectionProvider;
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the selection was modified */
      "changeSelected": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * If the value is <code>true</code> the manager allows an empty selection,
       * otherwise the first selectable element returned from the
       * <code>qx.ui.core.ISingleSelectionProvider</code> will be selected.
       */
      allowEmptySelection: {
        check: "Boolean",
        init: true,
        apply: "__applyAllowEmptySelection"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.Widget} The selected widget. */
      __selected: null,

      /** @type {qx.ui.core.ISingleSelectionProvider} The provider for selection management */
      __selectionProvider: null,

      /*
      ---------------------------------------------------------------------------
         PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the current selected element.
       *
       * @return {qx.ui.core.Widget | null} The current selected widget or
       *    <code>null</code> if the selection is empty.
       */
      getSelected: function getSelected() {
        return this.__selected;
      },

      /**
       * Selects the passed element.
       *
       * @param item {qx.ui.core.Widget} Element to select.
       * @throws {Error} if the element is not a child element.
       */
      setSelected: function setSelected(item) {
        if (!this.__isChildElement(item)) {
          throw new Error("Could not select " + item + ", because it is not a child element!");
        }

        this.__setSelected(item);
      },

      /**
       * Reset the current selection. If {@link #allowEmptySelection} is set to
       * <code>true</code> the first element will be selected.
       */
      resetSelected: function resetSelected() {
        this.__setSelected(null);
      },

      /**
       * Return <code>true</code> if the passed element is selected.
       *
       * @param item {qx.ui.core.Widget} Element to check if selected.
       * @return {Boolean} <code>true</code> if passed element is selected,
       *    <code>false</code> otherwise.
       * @throws {Error} if the element is not a child element.
       */
      isSelected: function isSelected(item) {
        if (!this.__isChildElement(item)) {
          throw new Error("Could not check if " + item + " is selected," + " because it is not a child element!");
        }

        return this.__selected === item;
      },

      /**
       * Returns <code>true</code> if selection is empty.
       *
       * @return {Boolean} <code>true</code> if selection is empty,
       *    <code>false</code> otherwise.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__selected == null;
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        var items = this.__selectionProvider.getItems();

        var result = [];

        for (var i = 0; i < items.length; i++) {
          if (this.__selectionProvider.isItemSelectable(items[i])) {
            result.push(items[i]);
          }
        } // in case of an user selectable list, remove the enabled items


        if (!all) {
          for (var i = result.length - 1; i >= 0; i--) {
            if (!result[i].getEnabled()) {
              result.splice(i, 1);
            }
          }

          ;
        }

        return result;
      },

      /*
      ---------------------------------------------------------------------------
         APPLY METHODS
      ---------------------------------------------------------------------------
      */
      // apply method
      __applyAllowEmptySelection: function __applyAllowEmptySelection(value, old) {
        if (!value) {
          this.__setSelected(this.__selected);
        }
      },

      /*
      ---------------------------------------------------------------------------
         HELPERS
      ---------------------------------------------------------------------------
      */

      /**
       * Set selected element.
       *
       * If passes value is <code>null</code>, the selection will be reseted.
       *
       * @param item {qx.ui.core.Widget | null} element to select, or
       *    <code>null</code> to reset selection.
       */
      __setSelected: function __setSelected(item) {
        var oldSelected = this.__selected;
        var newSelected = item;

        if (newSelected != null && oldSelected === newSelected) {
          return;
        }

        if (!this.isAllowEmptySelection() && newSelected == null) {
          var firstElement = this.getSelectables(true)[0];

          if (firstElement) {
            newSelected = firstElement;
          }
        }

        this.__selected = newSelected;
        this.fireDataEvent("changeSelected", newSelected, oldSelected);
      },

      /**
       * Checks if passed element is a child element.
       *
       * @param item {qx.ui.core.Widget} Element to check if child element.
       * @return {Boolean} <code>true</code> if element is child element,
       *    <code>false</code> otherwise.
       */
      __isChildElement: function __isChildElement(item) {
        var items = this.__selectionProvider.getItems();

        for (var i = 0; i < items.length; i++) {
          if (items[i] === item) {
            return true;
          }
        }

        return false;
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      if (this.__selectionProvider.toHashCode) {
        this._disposeObjects("__selectionProvider");
      } else {
        this.__selectionProvider = null;
      }

      this._disposeObjects("__selected");
    }
  });
  qx.ui.core.SingleSelectionManager.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-26.js.map
