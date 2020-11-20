(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.PropertyUtil": {},
      "qx.lang.String": {},
      "qx.lang.Type": {},
      "qx.core.Object": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ***********************************************************************
  
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
   * This is an util class responsible for serializing qooxdoo objects.
   *
   * @ignore(qx.data, qx.data.IListData)
   * @ignore(qx.locale, qx.locale.LocalizedString)
   */
  qx.Class.define("qx.util.Serializer", {
    statics: {
      /**
       * Serializes the properties of the given qooxdoo object. To get the
       * serialization working, every property needs to have a string
       * representation because the value of the property will be concatenated to the
       * serialized string.
       *
       * @param object {qx.core.Object} Any qooxdoo object
       * @param qxSerializer {Function?} Function used for serializing qooxdoo
       *   objects stored in the properties of the object. Check for the type of
       *   classes <ou want to serialize and return the serialized value. In all
       *   other cases, just return nothing.
       * @param dateFormat {qx.util.format.DateFormat?} If a date formater is given,
       *   the format method of this given formater is used to convert date
       *   objects into strings.
       * @return {String} The serialized object.
       */
      toUriParameter: function toUriParameter(object, qxSerializer, dateFormat) {
        var result = "";
        var properties = qx.util.PropertyUtil.getAllProperties(object.constructor);

        for (var name in properties) {
          // ignore property groups
          if (properties[name].group != undefined) {
            continue;
          }

          var value = object["get" + qx.lang.String.firstUp(name)](); // handle arrays

          if (qx.lang.Type.isArray(value)) {
            var isdataArray = qx.data && qx.data.IListData && qx.Class.hasInterface(value && value.constructor, qx.data.IListData);

            for (var i = 0; i < value.length; i++) {
              var valueAtI = isdataArray ? value.getItem(i) : value[i];
              result += this.__toUriParameter(name, valueAtI, qxSerializer);
            }
          } else if (qx.lang.Type.isDate(value) && dateFormat != null) {
            result += this.__toUriParameter(name, dateFormat.format(value), qxSerializer);
          } else {
            result += this.__toUriParameter(name, value, qxSerializer);
          }
        }

        return result.substring(0, result.length - 1);
      },

      /**
       * Helper method for {@link #toUriParameter}. Check for qooxdoo objects
       * and returns the serialized name value pair for the given parameter.
       *
       * @param name {String} The name of the value
       * @param value {var} The value itself
       * @param qxSerializer {Function?} The serializer for qooxdoo objects.
       * @return {String} The serialized name value pair.
       */
      __toUriParameter: function __toUriParameter(name, value, qxSerializer) {
        if (value && value.$$type == "Class") {
          value = value.classname;
        }

        if (value && (value.$$type == "Interface" || value.$$type == "Mixin")) {
          value = value.name;
        }

        if (value instanceof qx.core.Object && qxSerializer != null) {
          var encValue = encodeURIComponent(qxSerializer(value));

          if (encValue === undefined) {
            var encValue = encodeURIComponent(value);
          }
        } else {
          var encValue = encodeURIComponent(value);
        }

        return encodeURIComponent(name) + "=" + encValue + "&";
      },

      /**
       * Serializes the properties of the given qooxdoo object into a native
       * object.
       *
       * @param object {qx.core.Object}
       *   Any qooxdoo object
       *
       * @param qxSerializer {Function?}
       *   Function used for serializing qooxdoo objects stored in the properties
       *   of the object. Check for the type of classes you want to serialize
       *   and return the serialized value. In all other cases, just return
       *   nothing.
       * @param dateFormat {qx.util.format.DateFormat?} If a date formater is given,
       *   the format method of this given formater is used to convert date
       *   objects into strings.
       * @return {null|Array|String|Object}
       *   The serialized object. Depending on the input qooxdoo object, the returning
       *   type will vary.
       */
      toNativeObject: function toNativeObject(object, qxSerializer, dateFormat) {
        var result; // null or undefined

        if (object == null) {
          return null;
        } // data array


        if (qx.data && qx.data.IListData && qx.Class.hasInterface(object.constructor, qx.data.IListData)) {
          result = [];

          for (var i = 0; i < object.getLength(); i++) {
            result.push(qx.util.Serializer.toNativeObject(object.getItem(i), qxSerializer, dateFormat));
          }

          return result;
        } // other arrays


        if (qx.lang.Type.isArray(object)) {
          result = [];

          for (var i = 0; i < object.length; i++) {
            result.push(qx.util.Serializer.toNativeObject(object[i], qxSerializer, dateFormat));
          }

          return result;
        } // return names for qooxdoo classes


        if (object.$$type == "Class") {
          return object.classname;
        } // return names for qooxdoo interfaces and mixins


        if (object.$$type == "Interface" || object.$$type == "Mixin") {
          return object.name;
        } // qooxdoo object


        if (object instanceof qx.core.Object) {
          if (qxSerializer != null) {
            var returnValue = qxSerializer(object); // if we have something returned, return that

            if (returnValue != undefined) {
              return returnValue;
            } // continue otherwise

          }

          result = {};
          var properties = qx.util.PropertyUtil.getAllProperties(object.constructor);

          for (var name in properties) {
            // ignore property groups
            if (properties[name].group != undefined) {
              continue;
            }

            var value = object["get" + qx.lang.String.firstUp(name)]();
            result[name] = qx.util.Serializer.toNativeObject(value, qxSerializer, dateFormat);
          }

          return result;
        } // date objects with date format


        if (qx.lang.Type.isDate(object) && dateFormat != null) {
          return dateFormat.format(object);
        } // localized strings


        if (qx.locale && qx.locale.LocalizedString && object instanceof qx.locale.LocalizedString) {
          return object.toString();
        } // JavaScript objects


        if (qx.lang.Type.isObject(object)) {
          result = {};

          for (var key in object) {
            result[key] = qx.util.Serializer.toNativeObject(object[key], qxSerializer, dateFormat);
          }

          return result;
        } // all other stuff, including String, Date, RegExp


        return object;
      },

      /**
       * Serializes the properties of the given qooxdoo object into a json object.
       *
       * @param object {qx.core.Object} Any qooxdoo object
       * @param qxSerializer {Function?} Function used for serializing qooxdoo
       *   objects stored in the properties of the object. Check for the type of
       *   classes <ou want to serialize and return the serialized value. In all
       *   other cases, just return nothing.
       * @param dateFormat {qx.util.format.DateFormat?} If a date formater is given,
       *   the format method of this given formater is used to convert date
       *   objects into strings.
       * @return {String} The serialized object.
       */
      toJson: function toJson(object, qxSerializer, dateFormat) {
        var result = ""; // null or undefined

        if (object == null) {
          return "null";
        } // data array


        if (qx.data && qx.data.IListData && qx.Class.hasInterface(object.constructor, qx.data.IListData)) {
          result += "[";

          for (var i = 0; i < object.getLength(); i++) {
            result += qx.util.Serializer.toJson(object.getItem(i), qxSerializer, dateFormat) + ",";
          }

          if (result != "[") {
            result = result.substring(0, result.length - 1);
          }

          return result + "]";
        } // other arrays


        if (qx.lang.Type.isArray(object)) {
          result += "[";

          for (var i = 0; i < object.length; i++) {
            result += qx.util.Serializer.toJson(object[i], qxSerializer, dateFormat) + ",";
          }

          if (result != "[") {
            result = result.substring(0, result.length - 1);
          }

          return result + "]";
        } // return names for qooxdoo classes


        if (object.$$type == "Class") {
          return '"' + object.classname + '"';
        } // return names for qooxdoo interfaces and mixins


        if (object.$$type == "Interface" || object.$$type == "Mixin") {
          return '"' + object.name + '"';
        } // qooxdoo object


        if (object instanceof qx.core.Object) {
          if (qxSerializer != null) {
            var returnValue = qxSerializer(object); // if we have something returned, return that

            if (returnValue != undefined) {
              return '"' + returnValue + '"';
            } // continue otherwise

          }

          result += "{";
          var properties = qx.util.PropertyUtil.getAllProperties(object.constructor);

          for (var name in properties) {
            // ignore property groups
            if (properties[name].group != undefined) {
              continue;
            }

            var value = object["get" + qx.lang.String.firstUp(name)]();
            result += '"' + name + '":' + qx.util.Serializer.toJson(value, qxSerializer, dateFormat) + ",";
          }

          if (result != "{") {
            result = result.substring(0, result.length - 1);
          }

          return result + "}";
        } // localized strings


        if (qx.locale && qx.locale.LocalizedString && object instanceof qx.locale.LocalizedString) {
          object = object.toString(); // no return here because we want to have the string checks as well!
        } // date objects with formater


        if (qx.lang.Type.isDate(object) && dateFormat != null) {
          return '"' + dateFormat.format(object) + '"';
        } // javascript objects


        if (qx.lang.Type.isObject(object)) {
          result += "{";

          for (var key in object) {
            result += '"' + key + '":' + qx.util.Serializer.toJson(object[key], qxSerializer, dateFormat) + ",";
          }

          if (result != "{") {
            result = result.substring(0, result.length - 1);
          }

          return result + "}";
        } // strings


        if (qx.lang.Type.isString(object)) {
          // escape
          object = object.replace(/([\\])/g, '\\\\');
          object = object.replace(/(["])/g, '\\"');
          object = object.replace(/([\r])/g, '\\r');
          object = object.replace(/([\f])/g, '\\f');
          object = object.replace(/([\n])/g, '\\n');
          object = object.replace(/([\t])/g, '\\t');
          object = object.replace(/([\b])/g, '\\b');
          return '"' + object + '"';
        } // Date and RegExp


        if (qx.lang.Type.isDate(object) || qx.lang.Type.isRegExp(object)) {
          return '"' + object + '"';
        } // all other stuff


        return object + "";
      }
    }
  });
  qx.util.Serializer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {},
      "qx.util.PropertyUtil": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This mixin is included by all widgets, which support an 'execute' like
   * buttons or menu entries.
   */
  qx.Mixin.define("qx.ui.core.MExecutable", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired if the {@link #execute} method is invoked.*/
      "execute": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * A command called if the {@link #execute} method is called, e.g. on a
       * button tap.
       */
      command: {
        check: "qx.ui.command.Command",
        apply: "_applyCommand",
        event: "changeCommand",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __executableBindingIds: null,
      __semaphore: false,
      __executeListenerId: null,

      /**
       * @type {Map} Set of properties, which will by synced from the command to the
       *    including widget
       *
       * @lint ignoreReferenceField(_bindableProperties)
       */
      _bindableProperties: ["label", "icon", "toolTipText", "value", "menu"],

      /**
       * Initiate the execute action.
       */
      execute: function execute() {
        var cmd = this.getCommand();

        if (cmd) {
          if (this.__semaphore) {
            this.__semaphore = false;
          } else {
            this.__semaphore = true;
            cmd.execute(this);
          }
        }

        this.fireEvent("execute");
      },

      /**
       * Handler for the execute event of the command.
       *
       * @param e {qx.event.type.Event} The execute event of the command.
       */
      __onCommandExecute: function __onCommandExecute(e) {
        if (this.isEnabled()) {
          if (this.__semaphore) {
            this.__semaphore = false;
            return;
          }

          if (this.isEnabled()) {
            this.__semaphore = true;
            this.execute();
          }
        }
      },
      // property apply
      _applyCommand: function _applyCommand(value, old) {
        // execute forwarding
        if (old != null) {
          old.removeListenerById(this.__executeListenerId);
        }

        if (value != null) {
          this.__executeListenerId = value.addListener("execute", this.__onCommandExecute, this);
        } // binding stuff


        var ids = this.__executableBindingIds;

        if (ids == null) {
          this.__executableBindingIds = ids = {};
        }

        var selfPropertyValue;

        for (var i = 0; i < this._bindableProperties.length; i++) {
          var property = this._bindableProperties[i]; // remove the old binding

          if (old != null && !old.isDisposed() && ids[property] != null) {
            old.removeBinding(ids[property]);
            ids[property] = null;
          } // add the new binding


          if (value != null && qx.Class.hasProperty(this.constructor, property)) {
            // handle the init value (don't sync the initial null)
            var cmdPropertyValue = value.get(property);

            if (cmdPropertyValue == null) {
              selfPropertyValue = this.get(property); // check also for themed values [BUG #5906]

              if (selfPropertyValue == null) {
                // update the appearance to make sure every themed property is up to date
                this.$$resyncNeeded = true;
                this.syncAppearance();
                selfPropertyValue = qx.util.PropertyUtil.getThemeValue(this, property);
              }
            } else {
              // Reset the self property value [BUG #4534]
              selfPropertyValue = null;
            } // set up the binding


            ids[property] = value.bind(property, this, property); // reapply the former value

            if (selfPropertyValue) {
              this.set(property, selfPropertyValue);
            }
          }
        }
      }
    },
    destruct: function destruct() {
      this._applyCommand(null, this.getCommand());

      this.__executableBindingIds = null;
    }
  });
  qx.ui.core.MExecutable.$$dbClassInfo = $$dbClassInfo;
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
   * Form interface for all form widgets which are executable in some way. This
   * could be a button for example.
   */
  qx.Interface.define("qx.ui.form.IExecutable", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the widget is executed. Sets the "data" property of the
       * event to the object that issued the command.
       */
      "execute": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        COMMAND PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Set the command of this executable.
       *
       * @param command {qx.ui.command.Command} The command.
       */
      setCommand: function setCommand(command) {
        return arguments.length == 1;
      },

      /**
       * Return the current set command of this executable.
       *
       * @return {qx.ui.command.Command} The current set command.
       */
      getCommand: function getCommand() {},

      /**
       * Fire the "execute" event on the command.
       */
      execute: function execute() {}
    }
  });
  qx.ui.form.IExecutable.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.IExecutable": {
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
   * A Button widget which supports various states and allows it to be used
   * via the mouse, touch, pen and the keyboard.
   *
   * If the user presses the button by clicking on it, or the <code>Enter</code> or
   * <code>Space</code> keys, the button fires an {@link qx.ui.core.MExecutable#execute} event.
   *
   * If the {@link qx.ui.core.MExecutable#command} property is set, the
   * command is executed as well.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.Button("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button was clicked");
   *   }, this);
   *
   *   this.getRoot().add(button);
   * </pre>
   *
   * This example creates a button with the label "Hello World" and attaches an
   * event listener to the {@link #execute} event.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/button.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.Button", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} label of the atom
     * @param icon {String?null} Icon URL of the atom
     * @param command {qx.ui.command.Command?null} Command instance to connect with
     */
    construct: function construct(label, icon, command) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);

      if (command != null) {
        this.setCommand(command);
      } // Add listeners


      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut);
      this.addListener("pointerdown", this._onPointerDown);
      this.addListener("pointerup", this._onPointerUp);
      this.addListener("tap", this._onTap);
      this.addListener("keydown", this._onKeyDown);
      this.addListener("keyup", this._onKeyUp); // Stop events

      this.addListener("dblclick", function (e) {
        e.stopPropagation();
      });
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
        hovered: true,
        pressed: true,
        disabled: true
      },

      /*
      ---------------------------------------------------------------------------
        USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Manually press the button
       */
      press: function press() {
        if (this.hasState("abandoned")) {
          return;
        }

        this.addState("pressed");
      },

      /**
       * Manually release the button
       */
      release: function release() {
        if (this.hasState("pressed")) {
          this.removeState("pressed");
        }
      },

      /**
       * Completely reset the button (remove all states)
       */
      reset: function reset() {
        this.removeState("pressed");
        this.removeState("abandoned");
        this.removeState("hovered");
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
       * @param e {qx.event.type.Pointer} Mouse event
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
       * @param e {qx.event.type.Pointer} Mouse event
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
       * Listener method for "pointerdown" event
       * <ul>
       * <li>Removes "abandoned" state</li>
       * <li>Adds "pressed" state</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerDown: function _onPointerDown(e) {
        if (!e.isLeftPressed()) {
          return;
        }

        e.stopPropagation(); // Activate capturing if the button get a pointerout while
        // the button is pressed.

        this.capture();
        this.removeState("abandoned");
        this.addState("pressed");
      },

      /**
       * Listener method for "pointerup" event
       * <ul>
       * <li>Removes "pressed" state (if set)</li>
       * <li>Removes "abandoned" state (if set)</li>
       * <li>Adds "hovered" state (if "abandoned" state is not set)</li>
       *</ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerUp: function _onPointerUp(e) {
        this.releaseCapture(); // We must remove the states before executing the command
        // because in cases were the window lost the focus while
        // executing we get the capture phase back (mouseout).

        var hasPressed = this.hasState("pressed");
        var hasAbandoned = this.hasState("abandoned");

        if (hasPressed) {
          this.removeState("pressed");
        }

        if (hasAbandoned) {
          this.removeState("abandoned");
        }

        e.stopPropagation();
      },

      /**
       * Listener method for "tap" event which stops the propagation.
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onTap: function _onTap(e) {
        // "execute" is fired here so that the button can be dragged
        // without executing it (e.g. in a TabBar with overflow)
        this.execute();
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
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyUp: function _onKeyUp(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            if (this.hasState("pressed")) {
              this.removeState("abandoned");
              this.removeState("pressed");
              this.execute();
              e.stopPropagation();
            }

        }
      }
    }
  });
  qx.ui.form.Button.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.toolbar.PartContainer": {},
      "qx.ui.core.queue.Appearance": {}
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
   * The normal toolbar button. Like a normal {@link qx.ui.form.Button}
   * but with a style matching the toolbar and without keyboard support.
   */
  qx.Class.define("qx.ui.toolbar.Button", {
    extend: qx.ui.form.Button,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct(label, icon, command) {
      qx.ui.form.Button.constructor.call(this, label, icon, command); // Toolbar buttons should not support the keyboard events

      this.removeListener("keydown", this._onKeyDown);
      this.removeListener("keyup", this._onKeyUp);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "toolbar-button"
      },
      show: {
        refine: true,
        init: "inherit"
      },
      focusable: {
        refine: true,
        init: false
      }
    },
    members: {
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.toolbar.Button.prototype._applyVisibility.base.call(this, value, old); // trigger a appearance recalculation of the parent


        var parent = this.getLayoutParent();

        if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
          qx.ui.core.queue.Appearance.add(parent);
        }
      }
    }
  });
  qx.ui.toolbar.Button.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-13.js.map
