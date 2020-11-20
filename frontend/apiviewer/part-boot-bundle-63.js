(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.History": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Type": {},
      "qx.bom.Iframe": {},
      "qx.util.ResourceManager": {},
      "qx.event.Timer": {},
      "qx.event.Idle": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * History manager implementation for IE greater 7. IE reloads iframe
   * content on history actions even just hash value changed. This
   * implementation forwards history states (hashes) to a helper iframe.
   *
   * This class must be disposed of after use
   *
   * @internal
   */
  qx.Class.define("qx.bom.HashHistory", {
    extend: qx.bom.History,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.bom.History.constructor.call(this);
      this._baseUrl = null;

      this.__initIframe();
    },
    members: {
      __checkOnHashChange: null,
      __iframe: null,
      __iframeReady: false,
      //overridden
      addToHistory: function addToHistory(state, newTitle) {
        if (!qx.lang.Type.isString(state)) {
          state = state + "";
        }

        if (qx.lang.Type.isString(newTitle)) {
          this.setTitle(newTitle);
          this._titles[state] = newTitle;
        }

        if (this.getState() !== state) {
          this._writeState(state);
        }
      },

      /**
       * Initializes the iframe
       *
       */
      __initIframe: function __initIframe() {
        this.__iframe = this.__createIframe();
        document.body.appendChild(this.__iframe);

        this.__waitForIFrame(function () {
          this._baseUrl = this.__iframe.contentWindow.document.location.href;

          this.__attachListeners();
        }, this);
      },

      /**
       * IMPORTANT NOTE FOR IE:
       * Setting the source before adding the iframe to the document.
       * Otherwise IE will bring up a "Unsecure items ..." warning in SSL mode
       *
       * @return {Element}
       */
      __createIframe: function __createIframe() {
        var iframe = qx.bom.Iframe.create({
          src: qx.util.ResourceManager.getInstance().toUri("qx/static/blank.html") + "#"
        });
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";
        return iframe;
      },

      /**
       * Waits for the IFrame being loaded. Once the IFrame is loaded
       * the callback is called with the provided context.
       *
       * @param callback {Function} This function will be called once the iframe is loaded
       * @param context {Object?window} The context for the callback.
       * @param retry {Integer} number of tries to initialize the iframe
       */
      __waitForIFrame: function __waitForIFrame(callback, context, retry) {
        if (typeof retry === "undefined") {
          retry = 0;
        }

        if (!this.__iframe.contentWindow || !this.__iframe.contentWindow.document) {
          if (retry > 20) {
            throw new Error("can't initialize iframe");
          }

          qx.event.Timer.once(function () {
            this.__waitForIFrame(callback, context, ++retry);
          }, this, 10);
          return;
        }

        this.__iframeReady = true;
        callback.call(context || window);
      },

      /**
       * Attach hash change listeners
       */
      __attachListeners: function __attachListeners() {
        qx.event.Idle.getInstance().addListener("interval", this.__onHashChange, this);
      },

      /**
       * Remove hash change listeners
       */
      __detatchListeners: function __detatchListeners() {
        qx.event.Idle.getInstance().removeListener("interval", this.__onHashChange, this);
      },

      /**
       * hash change event handler
       */
      __onHashChange: function __onHashChange() {
        var currentState = this._readState();

        if (qx.lang.Type.isString(currentState) && currentState != this.getState()) {
          this._onHistoryLoad(currentState);
        }
      },

      /**
       * Browser dependent function to read the current state of the history
       *
       * @return {String} current state of the browser history
       */
      _readState: function _readState() {
        var hash = !this._getHash() ? "" : this._getHash().substr(1);
        return this._decode(hash);
      },

      /**
       * Returns the fragment identifier of the top window URL. For gecko browsers we
       * have to use a regular expression to avoid encoding problems.
       *
       * @return {String|null} the fragment identifier or <code>null</code> if the
       * iframe isn't ready yet
       */
      _getHash: function _getHash() {
        if (!this.__iframeReady) {
          return null;
        }

        return this.__iframe.contentWindow.document.location.hash;
      },

      /**
       * Save a state into the browser history.
       *
       * @param state {String} state to save
       */
      _writeState: function _writeState(state) {
        this._setHash(this._encode(state));
      },

      /**
       * Sets the fragment identifier of the window URL
       *
       * @param value {String} the fragment identifier
       */
      _setHash: function _setHash(value) {
        if (!this.__iframe || !this._baseUrl) {
          return;
        }

        var hash = !this.__iframe.contentWindow.document.location.hash ? "" : this.__iframe.contentWindow.document.location.hash.substr(1);

        if (value != hash) {
          this.__iframe.contentWindow.document.location.hash = value;
        }
      }
    },
    destruct: function destruct() {
      this.__detatchListeners();

      this.__iframe = null;
    }
  });
  qx.bom.HashHistory.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.History": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Type": {},
      "qx.event.Timer": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.event.Idle": {},
      "qx.bom.Iframe": {},
      "qx.util.ResourceManager": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
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
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * Implements an iFrame based history manager for IE 6/7/8.
   *
   * Creates a hidden iFrame and uses document.write to store entries in the
   * history browser's stack.
   *
   * This class must be disposed of after use
   *
   * @internal
   */
  qx.Class.define("qx.bom.IframeHistory", {
    extend: qx.bom.History,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.bom.History.constructor.call(this);

      this.__initTimer();
    },
    members: {
      __iframe: null,
      __iframeReady: false,
      __writeStateTimner: null,
      __dontApplyState: null,
      __locationState: null,
      // overridden
      _setInitialState: function _setInitialState() {
        qx.bom.IframeHistory.prototype._setInitialState.base.call(this);

        this.__locationState = this._getHash();
      },
      //overridden
      _setHash: function _setHash(value) {
        qx.bom.IframeHistory.prototype._setHash.base.call(this, value);

        this.__locationState = this._encode(value);
      },
      //overridden
      addToHistory: function addToHistory(state, newTitle) {
        if (!qx.lang.Type.isString(state)) {
          state = state + "";
        }

        if (qx.lang.Type.isString(newTitle)) {
          this.setTitle(newTitle);
          this._titles[state] = newTitle;
        }

        if (this.getState() !== state) {
          this.setState(state);
        }

        this.fireDataEvent("request", state);
      },
      //overridden
      _onHistoryLoad: function _onHistoryLoad(state) {
        this._setState(state);

        this.fireDataEvent("request", state);

        if (this._titles[state] != null) {
          this.setTitle(this._titles[state]);
        }
      },

      /**
       * Helper function to set state property. This will only be called
       * by _onHistoryLoad. It determines, that no apply of state will be called.
       * @param state {String} State loaded from history
       */
      _setState: function _setState(state) {
        this.__dontApplyState = true;
        this.setState(state);
        this.__dontApplyState = false;
      },
      //overridden
      _applyState: function _applyState(value, old) {
        if (this.__dontApplyState) {
          return;
        }

        this._writeState(value);
      },

      /**
       * Get state from the iframe
       *
       * @return {String} current state of the browser history
       */
      _readState: function _readState() {
        if (!this.__iframeReady) {
          return this._decode(this._getHash());
        }

        var doc = this.__iframe.contentWindow.document;
        var elem = doc.getElementById("state");
        return elem ? this._decode(elem.innerText) : "";
      },

      /**
       * Store state to the iframe
       *
       * @param state {String} state to save
       */
      _writeState: function _writeState(state) {
        if (!this.__iframeReady) {
          this.__clearWriteSateTimer();

          this.__writeStateTimner = qx.event.Timer.once(function () {
            this._writeState(state);
          }, this, 50);
          return;
        }

        this.__clearWriteSateTimer();

        var state = this._encode(state); // IE8 is sometimes recognizing a hash change as history entry. Cause of sporadic surface of this behavior, we have to prevent setting hash.


        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.version") != 8) {
          this._setHash(state);
        }

        var doc = this.__iframe.contentWindow.document;
        doc.open();
        doc.write('<html><body><div id="state">' + state + '</div></body></html>');
        doc.close();
      },

      /**
       * Helper function to clear the write state timer.
       */
      __clearWriteSateTimer: function __clearWriteSateTimer() {
        if (this.__writeStateTimner) {
          this.__writeStateTimner.stop();

          this.__writeStateTimner.dispose();
        }
      },

      /**
       * Initialize the polling timer
       */
      __initTimer: function __initTimer() {
        this.__initIframe(function () {
          qx.event.Idle.getInstance().addListener("interval", this.__onHashChange, this);
        });
      },

      /**
       * Hash change listener.
       *
       * @param e {qx.event.type.Event} event instance
       */
      __onHashChange: function __onHashChange(e) {
        // the location only changes if the user manually changes the fragment
        // identifier.
        var currentState = null;

        var locationState = this._getHash();

        if (!this.__isCurrentLocationState(locationState)) {
          currentState = this.__storeLocationState(locationState);
        } else {
          currentState = this._readState();
        }

        if (qx.lang.Type.isString(currentState) && currentState != this.getState()) {
          this._onHistoryLoad(currentState);
        }
      },

      /**
       * Stores the given location state.
       *
       * @param locationState {String} location state
       * @return {String}
       */
      __storeLocationState: function __storeLocationState(locationState) {
        locationState = this._decode(locationState);

        this._writeState(locationState);

        return locationState;
      },

      /**
       * Checks whether the given location state is the current one.
       *
       * @param locationState {String} location state to check
       * @return {Boolean}
       */
      __isCurrentLocationState: function __isCurrentLocationState(locationState) {
        return qx.lang.Type.isString(locationState) && locationState == this.__locationState;
      },

      /**
       * Initializes the iframe
       *
       * @param handler {Function?null} if given this callback is executed after iframe is ready to use
       */
      __initIframe: function __initIframe(handler) {
        this.__iframe = this.__createIframe();
        document.body.appendChild(this.__iframe);

        this.__waitForIFrame(function () {
          this._writeState(this.getState());

          if (handler) {
            handler.call(this);
          }
        }, this);
      },

      /**
       * IMPORTANT NOTE FOR IE:
       * Setting the source before adding the iframe to the document.
       * Otherwise IE will bring up a "Unsecure items ..." warning in SSL mode
       *
       * @return {qx.bom.Iframe}
       */
      __createIframe: function __createIframe() {
        var iframe = qx.bom.Iframe.create({
          src: qx.util.ResourceManager.getInstance().toUri("qx/static/blank.html")
        });
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";
        return iframe;
      },

      /**
       * Waits for the IFrame being loaded. Once the IFrame is loaded
       * the callback is called with the provided context.
       *
       * @param callback {Function} This function will be called once the iframe is loaded
       * @param context {Object?window} The context for the callback.
       * @param retry {Integer} number of tries to initialize the iframe
       */
      __waitForIFrame: function __waitForIFrame(callback, context, retry) {
        if (typeof retry === "undefined") {
          retry = 0;
        }

        if (!this.__iframe.contentWindow || !this.__iframe.contentWindow.document) {
          if (retry > 20) {
            throw new Error("can't initialize iframe");
          }

          qx.event.Timer.once(function () {
            this.__waitForIFrame(callback, context, ++retry);
          }, this, 10);
          return;
        }

        this.__iframeReady = true;
        callback.call(context || window);
      }
    },
    destruct: function destruct() {
      this.__iframe = null;

      if (this.__writeStateTimner) {
        this.__writeStateTimner.dispose();

        this.__writeStateTimner = null;
      }

      qx.event.Idle.getInstance().removeListener("interval", this.__onHashChange, this);
    }
  });
  qx.bom.IframeHistory.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.History": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Function": {},
      "qx.event.GlobalError": {},
      "qx.bom.Event": {},
      "qx.event.Idle": {},
      "qx.lang.Type": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.event.Timer": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
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
  
  ************************************************************************ */

  /**
   * Default history manager implementation. Either polls for URL fragment
   * identifier (hash) changes or uses the native "hashchange" event.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @internal
   */
  qx.Class.define("qx.bom.NativeHistory", {
    extend: qx.bom.History,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.bom.History.constructor.call(this);

      this.__attachListeners();
    },
    members: {
      __checkOnHashChange: null,

      /**
       * Attach hash change listeners
       */
      __attachListeners: function __attachListeners() {
        if (qx.bom.History.SUPPORTS_HASH_CHANGE_EVENT) {
          var boundFunc = qx.lang.Function.bind(this.__onHashChange, this);
          this.__checkOnHashChange = qx.event.GlobalError.observeMethod(boundFunc);
          qx.bom.Event.addNativeListener(window, "hashchange", this.__checkOnHashChange);
        } else {
          qx.event.Idle.getInstance().addListener("interval", this.__onHashChange, this);
        }
      },

      /**
       * Remove hash change listeners
       */
      __detatchListeners: function __detatchListeners() {
        if (qx.bom.History.SUPPORTS_HASH_CHANGE_EVENT) {
          qx.bom.Event.removeNativeListener(window, "hashchange", this.__checkOnHashChange);
        } else {
          qx.event.Idle.getInstance().removeListener("interval", this.__onHashChange, this);
        }
      },

      /**
       * hash change event handler
       */
      __onHashChange: function __onHashChange() {
        var currentState = this._readState();

        if (qx.lang.Type.isString(currentState) && currentState != this.getState()) {
          this._onHistoryLoad(currentState);
        }
      },

      /**
       * Browser dependent function to read the current state of the history
       *
       * @return {String} current state of the browser history
       */
      _readState: function _readState() {
        return this._decode(this._getHash());
      },

      /**
       * Save a state into the browser history.
       *
       * @param state {String} state to save
       */
      _writeState: qx.core.Environment.select("engine.name", {
        "opera": function opera(state) {
          qx.event.Timer.once(function () {
            this._setHash(this._encode(state));
          }, this, 0);
        },
        "default": function _default(state) {
          this._setHash(this._encode(state));
        }
      })
    },
    destruct: function destruct() {
      this.__detatchListeners();
    }
  });
  qx.bom.NativeHistory.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-63.js.map
