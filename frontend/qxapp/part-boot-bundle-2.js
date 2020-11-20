(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.client.Engine": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.lang.Function": {},
      "qx.bom.client.Browser": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "qx.globalErrorHandling": {
          "className": "qx.event.GlobalError"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This handler provides events for qooxdoo application startup/shutdown logic.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.bom.client.Engine)
   */
  qx.Class.define("qx.event.handler.Application", {
    extend: qx.core.Object,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this._window = manager.getWindow();
      this.__domReady = false;
      this.__loaded = false;
      this.__isReady = false;
      this.__isUnloaded = false; // Initialize observers

      this._initObserver(); // Store instance (only supported for main app window, this
      // is the reason why this is OK here)


      qx.event.handler.Application.$$instance = this;
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        ready: 1,
        shutdown: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_WINDOW,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /**
       * Sends the currently running application the ready signal. Used
       * exclusively by package loader system.
       *
       * @internal
       */
      onScriptLoaded: function onScriptLoaded() {
        var inst = qx.event.handler.Application.$$instance;

        if (inst) {
          inst.__fireReady();
        }
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
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },
      __isReady: null,
      __domReady: null,
      __loaded: null,
      __isUnloaded: null,

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Fires a global ready event.
       *
       */
      __fireReady: function __fireReady() {
        // Wrapper qxloader needed to be compatible with old generator
        if (!this.__isReady && this.__domReady && qx.$$loader.scriptLoaded) {
          // If qooxdoo is loaded within a frame in IE, the document is ready before
          // the "ready" listener can be added. To avoid any startup issue check
          // for the availability of the "ready" listener before firing the event.
          // So at last the native "load" will trigger the "ready" event.
          if (qx.core.Environment.get("engine.name") == "mshtml") {
            if (qx.event.Registration.hasListener(this._window, "ready")) {
              this.__isReady = true; // Fire user event

              qx.event.Registration.fireEvent(this._window, "ready");
            }
          } else {
            this.__isReady = true; // Fire user event

            qx.event.Registration.fireEvent(this._window, "ready");
          }
        }
      },

      /**
       * Whether the application is ready.
       *
       * @return {Boolean} ready status
       */
      isApplicationReady: function isApplicationReady() {
        return this.__isReady;
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT/STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native application event listeners.
       *
       */
      _initObserver: function _initObserver() {
        // in Firefox the loader script sets the ready state
        if (qx.$$domReady || document.readyState == "complete" || document.readyState == "ready") {
          this.__domReady = true;

          this.__fireReady();
        } else {
          this._onNativeLoadWrapped = qx.lang.Function.bind(this._onNativeLoad, this);

          if (qx.core.Environment.get("engine.name") == "gecko" || qx.core.Environment.get("engine.name") == "opera" || qx.core.Environment.get("engine.name") == "webkit" || qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") > 8) {
            // Using native method supported by Mozilla, Webkit, Opera and IE >= 9
            qx.bom.Event.addNativeListener(this._window, "DOMContentLoaded", this._onNativeLoadWrapped);
          } else {
            var self = this; // Continually check to see if the document is ready

            var timer = function timer() {
              try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");

                if (document.body) {
                  self._onNativeLoadWrapped();
                }
              } catch (error) {
                window.setTimeout(timer, 100);
              }
            };

            timer();
          } // Additional load listener as fallback


          qx.bom.Event.addNativeListener(this._window, "load", this._onNativeLoadWrapped);
        }

        this._onNativeUnloadWrapped = qx.lang.Function.bind(this._onNativeUnload, this);
        qx.bom.Event.addNativeListener(this._window, "unload", this._onNativeUnloadWrapped);
      },

      /**
       * Disconnect the native application event listeners.
       *
       */
      _stopObserver: function _stopObserver() {
        if (this._onNativeLoadWrapped) {
          qx.bom.Event.removeNativeListener(this._window, "load", this._onNativeLoadWrapped);
        }

        qx.bom.Event.removeNativeListener(this._window, "unload", this._onNativeUnloadWrapped);
        this._onNativeLoadWrapped = null;
        this._onNativeUnloadWrapped = null;
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * When qx.globalErrorHandling is enabled the callback will observed
       */
      _onNativeLoad: function _onNativeLoad() {
        var callback = qx.core.Environment.select("qx.globalErrorHandling", {
          "true": qx.event.GlobalError.observeMethod(this.__onNativeLoadHandler),
          "false": this.__onNativeLoadHandler
        });
        callback.apply(this, arguments);
      },

      /**
       * Event listener for native load event
       */
      __onNativeLoadHandler: function __onNativeLoadHandler() {
        this.__domReady = true;

        this.__fireReady();
      },

      /**
       * When qx.globalErrorHandling is enabled the callback will observed
       */
      _onNativeUnload: function _onNativeUnload() {
        var callback = qx.core.Environment.select("qx.globalErrorHandling", {
          "true": qx.event.GlobalError.observeMethod(this.__onNativeUnloadHandler),
          "false": this.__onNativeUnloadHandler
        });
        callback.apply(this, arguments);
      },

      /**
       * Event listener for native unload event
       */
      __onNativeUnloadHandler: function __onNativeUnloadHandler() {
        if (!this.__isUnloaded) {
          this.__isUnloaded = true;

          try {
            // Fire user event
            qx.event.Registration.fireEvent(this._window, "shutdown");
          } catch (e) {
            // IE doesn't execute the "finally" block if no "catch" block is present
            throw e;
          }
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopObserver();

      this._window = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
    }
  });
  qx.event.handler.Application.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Event": {
        "require": true
      },
      "qx.bom.Event": {}
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
   * Common base class for all native events (DOM events, IO events, ...).
   */
  qx.Class.define("qx.event.type.Native", {
    extend: qx.event.type.Event,
    members: {
      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param nativeEvent {Event} The DOM event to use
       * @param target {Object?} The event target
       * @param relatedTarget {Object?null} The related event target
       * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
       *     If the event is bubbling, the bubbling can be stopped using
       *     {@link qx.event.type.Event#stopPropagation}
       * @param cancelable {Boolean?false} Whether or not an event can have its default
       *     action prevented. The default action can either be the browser's
       *     default action of a native event (e.g. open the context menu on a
       *     right click) or the default action of a qooxdoo class (e.g. close
       *     the window widget). The default action can be prevented by calling
       *     {@link #preventDefault}
       * @return {qx.event.type.Event} The initialized event instance
       */
      init: function init(nativeEvent, target, relatedTarget, canBubble, cancelable) {
        qx.event.type.Native.prototype.init.base.call(this, canBubble, cancelable);
        this._target = target || qx.bom.Event.getTarget(nativeEvent);
        this._relatedTarget = relatedTarget || qx.bom.Event.getRelatedTarget(nativeEvent);

        if (nativeEvent.timeStamp) {
          this._timeStamp = nativeEvent.timeStamp;
        }

        this._native = nativeEvent;
        this._returnValue = null;
        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.Native.prototype.clone.base.call(this, embryo);
        var nativeClone = {};
        clone._native = this._cloneNativeEvent(this._native, nativeClone);
        clone._returnValue = this._returnValue;
        return clone;
      },

      /**
       * Clone the native browser event
       *
       * @param nativeEvent {Event} The native browser event
       * @param clone {Object} The initialized clone.
       * @return {Object} The cloned event
       */
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        clone.preventDefault = function () {};

        return clone;
      },

      /**
       * Prevent browser default behavior, e.g. opening the context menu, ...
       */
      preventDefault: function preventDefault() {
        qx.event.type.Native.prototype.preventDefault.base.call(this);
        qx.bom.Event.preventDefault(this._native);
      },

      /**
       * Get the native browser event object of this event.
       *
       * @return {Event} The native browser event
       */
      getNativeEvent: function getNativeEvent() {
        return this._native;
      },

      /**
       * Sets the event's return value. If the return value is set in a
       * beforeunload event, the user will be asked by the browser, whether
       * he really wants to leave the page. The return string will be displayed in
       * the message box.
       *
       * @param returnValue {String?null} Return value
       */
      setReturnValue: function setReturnValue(returnValue) {
        this._returnValue = returnValue;
      },

      /**
       * Retrieves the event's return value.
       *
       * @return {String?null} The return value
       */
      getReturnValue: function getReturnValue() {
        return this._returnValue;
      }
    }
  });
  qx.event.type.Native.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.type.Native": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.Pool": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.globalErrorHandling": {
          "className": "qx.event.GlobalError"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This handler provides event for the window object.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.type.Native)
   * @require(qx.event.Pool)
   */
  qx.Class.define("qx.event.handler.Window", {
    extend: qx.core.Object,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this._manager = manager;
      this._window = manager.getWindow(); // Initialize observers

      this._initWindowObserver();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        error: 1,
        load: 1,
        beforeunload: 1,
        unload: 1,
        resize: 1,
        scroll: 1,
        beforeshutdown: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_WINDOW,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT/STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native window event listeners.
       *
       */
      _initWindowObserver: function _initWindowObserver() {
        this._onNativeWrapper = qx.lang.Function.listener(this._onNative, this);
        var types = qx.event.handler.Window.SUPPORTED_TYPES;

        for (var key in types) {
          qx.bom.Event.addNativeListener(this._window, key, this._onNativeWrapper);
        }
      },

      /**
       * Disconnect the native window event listeners.
       *
       */
      _stopWindowObserver: function _stopWindowObserver() {
        var types = qx.event.handler.Window.SUPPORTED_TYPES;

        for (var key in types) {
          qx.bom.Event.removeNativeListener(this._window, key, this._onNativeWrapper);
        }
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * When qx.globalErrorHandling is enabled the callback will observed
       */
      _onNative: function _onNative() {
        var callback = qx.core.Environment.select("qx.globalErrorHandling", {
          "true": qx.event.GlobalError.observeMethod(this.__onNativeHandler),
          "false": this.__onNativeHandler
        });
        callback.apply(this, arguments);
      },

      /**
       * Native listener for all supported events.
       *
       * @param e {Event} Native event
       * @return {String|undefined}
       */
      __onNativeHandler: function __onNativeHandler(e) {
        if (this.isDisposed()) {
          return;
        }

        var win = this._window;
        var doc;

        try {
          doc = win.document;
        } catch (ex) {
          // IE7 sometimes dispatches "unload" events on protected windows
          // Ignore these events
          return;
        }

        var html = doc.documentElement; // At least Safari 3.1 and Opera 9.2.x have a bubbling scroll event
        // which needs to be ignored here.
        //
        // In recent WebKit nightlies scroll events do no longer bubble
        //
        // Internet Explorer does not have a target in resize events.

        var target = qx.bom.Event.getTarget(e);

        if (target == null || target === win || target === doc || target === html) {
          var event = qx.event.Registration.createEvent(e.type, qx.event.type.Native, [e, win]);
          qx.event.Registration.dispatchEvent(win, event);
          var result = event.getReturnValue();

          if (result != null) {
            e.returnValue = result;
            return result;
          }
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopWindowObserver();

      this._manager = this._window = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
    }
  });
  qx.event.handler.Window.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {},
      "qx.log.Logger": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.Bootstrap": {}
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
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "qx.application": {}
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Daniel Wagner (d_wagner)
       * John Spackman
  
  ************************************************************************ */

  /**
   * This is the base class for non-browser qooxdoo applications.
   */
  qx.Class.define("qx.core.BaseInit", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      __application: null,

      /**
       * Returns the instantiated qooxdoo application.
       *
       * @return {qx.core.Object} The application instance.
       */
      getApplication: function getApplication() {
        return this.__application || null;
      },

      /**
       * Runs when the application is loaded. Automatically creates an instance
       * of the class defined by the setting <code>qx.application</code>.
       *
       */
      ready: function ready() {
        if (this.__application) {
          return;
        }

        if (qx.core.Environment.get("engine.name") == "") {
          qx.log.Logger.warn("Could not detect engine!");
        }

        if (qx.core.Environment.get("engine.version") == "") {
          qx.log.Logger.warn("Could not detect the version of the engine!");
        }

        if (qx.core.Environment.get("os.name") == "") {
          qx.log.Logger.warn("Could not detect operating system!");
        }

        qx.log.Logger.debug(this, "Load runtime: " + (new Date() - qx.Bootstrap.LOADSTART) + "ms");
        var app = qx.core.Environment.get("qx.application");
        var clazz = qx.Class.getByName(app);

        if (clazz) {
          this.__application = new clazz();
          var start = new Date();

          this.__application.main();

          qx.log.Logger.debug(this, "Main runtime: " + (new Date() - start) + "ms");
          var start = new Date();

          this.__application.finalize();

          qx.log.Logger.debug(this, "Finalize runtime: " + (new Date() - start) + "ms");
        } else {
          qx.log.Logger.warn("Missing application class: " + app);
        }
      },

      /**
       * Runs before the document is unloaded. Calls the application's close
       * method to check if the unload process should be stopped.
       *
       * @param e {qx.event.type.Native} Incoming beforeunload event.
       */
      __close: function __close(e) {
        var app = this.__application;

        if (app) {
          app.close();
        }
      },

      /**
       * Runs when the document is unloaded. Automatically terminates a previously
       * created application instance.
       *
       */
      __shutdown: function __shutdown() {
        var app = this.__application;

        if (app) {
          app.terminate();
        }
      }
    }
  });
  qx.core.BaseInit.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Application": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Window": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.dispatch.Direct": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.BaseInit": {
        "require": true
      },
      "qx.event.Registration": {
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
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This is the base class for all qooxdoo applications.
   *
   * @require(qx.event.handler.Application)
   * @require(qx.event.handler.Window)
   * @require(qx.event.dispatch.Direct)
   */
  qx.Class.define("qx.core.Init", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the instantiated qooxdoo application.
       *
       * @return {qx.core.Object} The application instance.
       */
      getApplication: qx.core.BaseInit.getApplication,

      /**
       * Runs when the application is loaded. Automatically creates an instance
       * of the class defined by the setting <code>qx.application</code>.
       *
       */
      ready: qx.core.BaseInit.ready,

      /**
       * Runs before the document is unloaded. Calls the application's close
       * method to check if the unload process should be stopped.
       *
       * @param e {qx.event.type.Native} Incoming beforeunload event.
       */
      __close: function __close(e) {
        var app = this.getApplication();

        if (app) {
          e.setReturnValue(app.close());
        }
      },

      /**
       * Runs when the document is unloaded. Automatically terminates a previously
       * created application instance.
       *
       */
      __shutdown: function __shutdown() {
        var app = this.getApplication();

        if (app) {
          app.terminate();
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addListener(window, "ready", statics.ready, statics);
      qx.event.Registration.addListener(window, "shutdown", statics.__shutdown, statics);
      qx.event.Registration.addListener(window, "beforeunload", statics.__close, statics);
    }
  });
  qx.core.Init.$$dbClassInfo = $$dbClassInfo;
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
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This interface defines what an application class has to implement.
   */
  qx.Interface.define("qx.application.IApplication", {
    members: {
      /**
       * Called when the application relevant classes are loaded and ready.
       *
       */
      main: function main() {},

      /**
       * Called when the application's main method was executed to handle
       * "final" tasks like rendering or retrieving data.
       *
       */
      finalize: function finalize() {},

      /**
       * Called in the document.beforeunload event of the browser. If the method
       * returns a string value, the user will be asked by the browser, whether
       * he really wants to leave the page. The return string will be displayed in
       * the message box.
       *
       * @return {String?null} message text on unloading the page
       */
      close: function close() {},

      /**
       * This method contains the last code which is run inside the page and may contain cleanup code.
       *
       */
      terminate: function terminate() {}
    }
  });
  qx.application.IApplication.$$dbClassInfo = $$dbClassInfo;
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
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin contains the methods needed to use the translation features
   * of qooxdoo.
   *
   * @ignore(qx.locale.Manager)
   */
  qx.Mixin.define("qx.locale.MTranslation", {
    members: {
      /**
       * Translate a message
       * Mark the message for translation.
       *
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object?} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       */
      tr: function tr(messageId, varargs) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.tr.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      },

      /**
       * Translate a plural message
       * Mark the messages for translation.
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} if greater than 1 the plural form otherwise the singular form is returned.
       * @param varargs {Object?} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       */
      trn: function trn(singularMessageId, pluralMessageId, count, varargs) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.trn.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      },

      /**
       * Translate a message with translation hint
       * Mark the messages for translation.
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object?} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       */
      trc: function trc(hint, messageId, varargs) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.trc.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      },

      /**
       * Translate a plural message with translation hint
       * Mark the messages for translation.
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} if greater than 1 the plural form otherwise the singular form is returned.
       * @param varargs {Object?} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       */
      trnc: function trnc(hint, singularMessageId, pluralMessageId, count, varargs) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.trnc.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      },

      /**
       * Mark the message for translation but return the original message.
       *
       * @param messageId {String} the message ID
       * @return {String} messageId
       */
      marktr: function marktr(messageId) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.marktr.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      }
    }
  });
  qx.locale.MTranslation.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Init": {
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.application.IApplication": {
        "require": true
      },
      "qx.locale.MTranslation": {
        "require": true
      },
      "qx.theme.manager.Meta": {},
      "qx.ui.tooltip.Manager": {},
      "qx.ui.style.Stylesheet": {},
      "qx.ui.core.queue.Manager": {}
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
  
  ************************************************************************ */

  /**
   * Abstract base class for GUI applications using qooxdoo widgets.
   *
   * @require(qx.core.Init)
   */
  qx.Class.define("qx.application.AbstractGui", {
    type: "abstract",
    extend: qx.core.Object,
    implement: [qx.application.IApplication],
    include: qx.locale.MTranslation,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.Widget} The root widget */
      __root: null,

      /**
       * Create the root widget. This method is abstract and must be overridden
       * by sub classes.
       *
       * @return {qx.ui.core.Widget} The root widget. This widget must be configured
       *     with a {@link qx.ui.layout.Basic} or {@link qx.ui.layout.Canvas} layout.
       */
      _createRootWidget: function _createRootWidget() {
        throw new Error("Abstract method call");
      },

      /**
       * Returns the application's root widget. The root widgets can act as container
       * for popups. It is configured with a {@link qx.ui.layout.Basic} (if the
       * application is an inline application) layout or a {@link qx.ui.layout.Canvas}
       * (if the application is a standalone application) layout .
       *
       * The root has the same add method as the configured layout
       * ({@link qx.ui.layout.Basic} or {@link qx.ui.layout.Canvas}).
       *
       * @return {qx.ui.core.Widget} The application's root widget.
       */
      getRoot: function getRoot() {
        return this.__root;
      },
      // interface method
      main: function main() {
        // Initialize themes
        qx.theme.manager.Meta.getInstance().initialize(); // Initialize tooltip manager

        qx.ui.tooltip.Manager.getInstance();
        var rule = ["-webkit-touch-callout: none;", "-ms-touch-select: none;", "-webkit-tap-highlight-color: rgba(0,0,0,0);", "-webkit-tap-highlight-color: transparent;"].join("");
        qx.ui.style.Stylesheet.getInstance().addRule("*", rule);
        this.__root = this._createRootWidget(); // make sure we start with a good scroll position

        window.scrollTo(0, 0);
      },
      // interface method
      finalize: function finalize() {
        this.render();
      },

      /**
       * Updates the GUI rendering
       *
       */
      render: function render() {
        qx.ui.core.queue.Manager.flush();
      },
      // interface method
      close: function close(val) {// empty
      },
      // interface method
      terminate: function terminate() {// empty
      }
    }
  });
  qx.application.AbstractGui.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Init": {
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.application.AbstractGui": {
        "require": true
      },
      "qx.ui.root.Application": {}
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
  
  ************************************************************************ */

  /**
   * For a GUI application that looks & feels like native desktop application
   * (often called "RIA" - Rich Internet Application).
   *
   * Such a stand-alone application typically creates and updates all content
   * dynamically. Often it is called a "single-page application", since the
   * document itself is never reloaded or changed. Communication with the server
   * is done with AJAX.
   *
   * @require(qx.core.Init)
   */
  qx.Class.define("qx.application.Standalone", {
    extend: qx.application.AbstractGui,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _createRootWidget: function _createRootWidget() {
        return new qx.ui.root.Application(document);
      }
    }
  });
  qx.application.Standalone.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-2.js.map
