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
      "qx.event.message.Message": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007 Christian Boulanger
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Boulanger
  
  ************************************************************************ */

  /**
   * A simple message bus singleton.
   * The message bus registers subscriptions and notifies subscribers when
   * a matching message is dispatched
   */
  qx.Class.define("qx.event.message.Bus", {
    type: "singleton",
    extend: qx.core.Object,
    statics: {
      /**
       * gets the hash map of message subscriptions
       *
       * @return {Map} with registered subscriptions. The key is the
       *    <code>message</code> and the value is a map with <code>{subscriber: {Function},
       *    context: {Object|null}}</code>.
       */
      getSubscriptions: function getSubscriptions() {
        return this.getInstance().getSubscriptions();
      },

      /**
       * subscribes to a message
       *
       * @param message {String} name of message, can be truncated by *
       * @param subscriber {Function} subscribing callback function
       * @param context {Object} The execution context of the callback (i.e. "this")
       * @return {Boolean} Success
       */
      subscribe: function subscribe(message, subscriber, context) {
        return this.getInstance().subscribe(message, subscriber, context);
      },

      /**
       * checks if subscription is already present
       * if you supply the callback function, match only the exact message monitor
       * otherwise match all monitors that have the given message
       *
       * @param message {String} Name of message, can be truncated by *
       * @param subscriber {Function} Callback Function
       * @param context {Object} execution context
       * @return {Boolean} Whether monitor is present or not
       */
      checkSubscription: function checkSubscription(message, subscriber, context) {
        return this.getInstance().checkSubscription(message, subscriber, context);
      },

      /**
       * unsubscribe a listening method
       * if you supply the callback function and execution context,
       * remove only this exact subscription
       * otherwise remove all subscriptions
       *
       * @param message {String} Name of message, can be truncated by *
       * @param subscriber {Function} Callback Function
       * @param context {Object} execution context
       * @return {Boolean} Whether monitor was removed or not
       */
      unsubscribe: function unsubscribe(message, subscriber, context) {
        return this.getInstance().unsubscribe(message, subscriber, context);
      },

      /**
       * dispatch message and call subscribed functions
       *
       * @param msg {qx.event.message.Message} message which is being dispatched
       * @return {Boolean} <code>true</code> if the message was dispatched,
       *    <code>false</code> otherwise.
       */
      dispatch: function dispatch(msg) {
        return this.getInstance().dispatch.apply(this.getInstance(), arguments);
      },

      /**
       * Dispatches a new message by supplying the name of the
       * message and its data.
       *
       * @param name {String} name of the message
       * @param data {var} Any type of data to attach
       *
       * @return {Boolean} <code>true</code> if the message was dispatched,
       *    <code>false</code> otherwise.
       */
      dispatchByName: function dispatchByName(name, data) {
        return this.getInstance().dispatchByName.apply(this.getInstance(), arguments);
      }
    },

    /**
     * constructor
     */
    construct: function construct() {
      /*
       * message subscriptions database
       */
      this.__subscriptions = {};
    },
    members: {
      __subscriptions: null,

      /**
       * gets the hash map of message subscriptions
       *
       * @return {Map} with registered subscriptions. The key is the
       *    <code>message</code> and the value is a map with <code>{subscriber: {Function},
       *    context: {Object|null}}</code>.
       */
      getSubscriptions: function getSubscriptions() {
        return this.__subscriptions;
      },

      /**
       * subscribes to a message
       *
       * @param message {String} name of message, can be truncated by *
       * @param subscriber {Function} subscribing callback function
       * @param context {Object} The execution context of the callback (i.e. "this")
       * @return {Boolean} Success
       */
      subscribe: function subscribe(message, subscriber, context) {
        if (!message || typeof subscriber != "function") {
          this.error("Invalid parameters! " + [message, subscriber, context]);
          return false;
        }

        var sub = this.getSubscriptions();

        if (this.checkSubscription(message)) {
          if (this.checkSubscription(message, subscriber, context)) {
            this.warn("Object method already subscribed to " + message);
            return false;
          } // add a subscription


          sub[message].push({
            subscriber: subscriber,
            context: context || null
          });
          return true;
        } else {
          // create a subscription
          sub[message] = [{
            subscriber: subscriber,
            context: context || null
          }];
          return true;
        }
      },

      /**
       * checks if subscription is already present
       * if you supply the callback function, match only the exact message monitor
       * otherwise match all monitors that have the given message
       *
       * @param message {String} Name of message, can be truncated by *
       * @param subscriber {Function} Callback Function
       * @param context {Object} execution context
       * @return {Boolean} Whether monitor is present or not
       */
      checkSubscription: function checkSubscription(message, subscriber, context) {
        var sub = this.getSubscriptions();

        if (!sub[message] || sub[message].length === 0) {
          return false;
        }

        if (subscriber) {
          for (var i = 0; i < sub[message].length; i++) {
            if (sub[message][i].subscriber === subscriber && sub[message][i].context === (context || null)) {
              return true;
            }
          }

          return false;
        }

        return true;
      },

      /**
       * unsubscribe a listening method
       * if you supply the callback function and execution context,
       * remove only this exact subscription
       * otherwise remove all subscriptions
       *
       * @param message {String} Name of message, can be truncated by *
       * @param subscriber {Function} Callback Function
       * @param context {Object} execution context
       * @return {Boolean} Whether monitor was removed or not
       */
      unsubscribe: function unsubscribe(message, subscriber, context) {
        var sub = this.getSubscriptions();
        var subscrList = sub[message];

        if (subscrList) {
          if (!subscriber) {
            sub[message] = null;
            delete sub[message];
            return true;
          } else {
            if (!context) {
              context = null;
            }

            var i = subscrList.length;
            var subscription;

            do {
              subscription = subscrList[--i];

              if (subscription.subscriber === subscriber && subscription.context === context) {
                subscrList.splice(i, 1);

                if (subscrList.length === 0) {
                  sub[message] = null;
                  delete sub[message];
                }

                return true;
              }
            } while (i);
          }
        }

        return false;
      },

      /**
       * dispatch message and call subscribed functions
       *
       * @param msg {qx.event.message.Message} message which is being dispatched
       * @return {Boolean} <code>true</code> if the message was dispatched,
       *    <code>false</code> otherwise.
       */
      dispatch: function dispatch(msg) {
        var sub = this.getSubscriptions();
        var msgName = msg.getName();
        var dispatched = false;

        for (var key in sub) {
          var pos = key.indexOf("*");

          if (pos > -1) {
            // use of wildcard
            if (pos === 0 || key.substr(0, pos) === msgName.substr(0, pos)) {
              this.__callSubscribers(sub[key], msg);

              dispatched = true;
            }
          } else {
            // exact match
            if (key === msgName) {
              this.__callSubscribers(sub[msgName], msg);

              dispatched = true;
            }
          }
        }

        return dispatched;
      },

      /**
       * Dispatches a new message by supplying the name of the
       * message and its data.
       *
       * @param name {String} name of the message
       * @param data {var} Any type of data to attach
       *
       * @return {Boolean} <code>true</code> if the message was dispatched,
       *    <code>false</code> otherwise.
       */
      dispatchByName: function dispatchByName(name, data) {
        var message = new qx.event.message.Message(name, data); // Dispatch the message

        var ret = this.dispatch(message); // We instantiated this message, so it's our responsibility to dispose it.

        message.dispose();
        message = null; // Let 'em know whether this message was dispatched to any subscribers.

        return ret;
      },

      /**
       * Call subscribers with passed message.
       *
       * Each currently-subscribed subscriber function will be called in
       * turn. Any requests to unsubscribe a subscriber from the list, while
       * processing the currently-subscribed subscriber functions, will take
       * effect after all currently-subscribed subscriber functions have been
       * processed.
       *
       * @param subscribers {Array} subscribers to call
       * @param msg {qx.event.message.Message} message for subscribers
       */
      __callSubscribers: function __callSubscribers(subscribers, msg) {
        // (Shallow) clone the subscribers array in case one of them alters the
        // list, e.g., by unsubscribing
        subscribers = subscribers.slice();

        for (var i = 0; i < subscribers.length; i++) {
          var subscriber = subscribers[i].subscriber;
          var context = subscribers[i].context; // call message monitor subscriber

          if (context && context.isDisposed) {
            if (context.isDisposed()) {
              subscribers.splice(i, 1);
              i--;
            } else {
              subscriber.call(context, msg);
            }
          } else {
            subscriber.call(context, msg);
          }
        }
      }
    }
  });
  qx.event.message.Bus.$$dbClassInfo = $$dbClassInfo;
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

//# sourceMappingURL=part-boot-bundle-37.js.map
