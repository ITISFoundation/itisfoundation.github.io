(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Emitter": {
        "construct": true
      },
      "qx.util.Uri": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {}
    },
    "environment": {
      "provided": ["qx.debug.io"],
      "required": {}
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
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * Script loader with interface similar to
   * <a href="http://www.w3.org/TR/XMLHttpRequest/">XmlHttpRequest</a>.
   *
   * The script loader can be used to load scripts from arbitrary sources.
   * <span class="desktop">
   * For JSONP requests, consider the {@link qx.bom.request.Jsonp} transport
   * that derives from the script loader.
   * </span>
   *
   * <div class="desktop">
   * Example:
   *
   * <pre class="javascript">
   *  var req = new qx.bom.request.Script();
   *  req.onload = function() {
   *    // Script is loaded and parsed and
   *    // globals set are available
   *  }
   *
   *  req.open("GET", url);
   *  req.send();
   * </pre>
   * </div>
   *
   * @ignore(qx.core, qx.core.Environment.*)
   * @require(qx.bom.request.Script#_success)
   * @require(qx.bom.request.Script#abort)
   * @require(qx.bom.request.Script#dispose)
   * @require(qx.bom.request.Script#isDisposed)
   * @require(qx.bom.request.Script#getAllResponseHeaders)
   * @require(qx.bom.request.Script#getResponseHeader)
   * @require(qx.bom.request.Script#setDetermineSuccess)
   * @require(qx.bom.request.Script#setRequestHeader)
   *
   * @group (IO)
   */
  qx.Bootstrap.define("qx.bom.request.Script", {
    implement: [qx.core.IDisposable],
    construct: function construct() {
      this.__initXhrProperties();

      this.__onNativeLoadBound = qx.Bootstrap.bind(this._onNativeLoad, this);
      this.__onNativeErrorBound = qx.Bootstrap.bind(this._onNativeError, this);
      this.__onTimeoutBound = qx.Bootstrap.bind(this._onTimeout, this);
      this.__headElement = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
      this._emitter = new qx.event.Emitter(); // BUGFIX: Browsers not supporting error handler
      // Set default timeout to capture network errors
      //
      // Note: The script is parsed and executed, before a "load" is fired.

      this.timeout = this.__supportsErrorHandler() ? 0 : 15000;
    },
    events: {
      /** Fired at ready state changes. */
      "readystatechange": "qx.bom.request.Script",

      /** Fired on error. */
      "error": "qx.bom.request.Script",

      /** Fired at loadend. */
      "loadend": "qx.bom.request.Script",

      /** Fired on timeouts. */
      "timeout": "qx.bom.request.Script",

      /** Fired when the request is aborted. */
      "abort": "qx.bom.request.Script",

      /** Fired on successful retrieval. */
      "load": "qx.bom.request.Script"
    },
    members: {
      /**
       * @type {Number} Ready state.
       *
       * States can be:
       * UNSENT:           0,
       * OPENED:           1,
       * LOADING:          2,
       * LOADING:          3,
       * DONE:             4
       *
       * Contrary to {@link qx.bom.request.Xhr#readyState}, the script transport
       * does not receive response headers. For compatibility, another LOADING
       * state is implemented that replaces the HEADERS_RECEIVED state.
       */
      readyState: null,

      /**
       * @type {Number} The status code.
       *
       * Note: The script transport cannot determine the HTTP status code.
       */
      status: null,

      /**
       * @type {String} The status text.
       *
       * The script transport does not receive response headers. For compatibility,
       * the statusText property is set to the status casted to string.
       */
      statusText: null,

      /**
       * @type {Number} Timeout limit in milliseconds.
       *
       * 0 (default) means no timeout.
       */
      timeout: null,

      /**
       * @type {Function} Function that is executed once the script was loaded.
       */
      __determineSuccess: null,

      /**
       * Add an event listener for the given event name.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function to execute when the event is fired
       * @param ctx {var?} The context of the listener.
       * @return {qx.bom.request.Script} Self for chaining.
       */
      on: function on(name, listener, ctx) {
        this._emitter.on(name, listener, ctx);

        return this;
      },

      /**
       * Initializes (prepares) request.
       *
       * @param method {String}
       *   The HTTP method to use.
       *   This parameter exists for compatibility reasons. The script transport
       *   does not support methods other than GET.
       * @param url {String}
       *   The URL to which to send the request.
       */
      open: function open(method, url) {
        if (this.__disposed) {
          return;
        } // Reset XHR properties that may have been set by previous request


        this.__initXhrProperties();

        this.__abort = null;
        this.__url = url;

        if (this.__environmentGet("qx.debug.io")) {
          qx.Bootstrap.debug(qx.bom.request.Script, "Open native request with url: " + url);
        }

        this._readyStateChange(1);
      },

      /**
       * Appends a query parameter to URL.
       *
       * This method exists for compatibility reasons. The script transport
       * does not support request headers. However, many services parse query
       * parameters like request headers.
       *
       * Note: The request must be initialized before using this method.
       *
       * @param key {String}
       *  The name of the header whose value is to be set.
       * @param value {String}
       *  The value to set as the body of the header.
       * @return {qx.bom.request.Script} Self for chaining.
       */
      setRequestHeader: function setRequestHeader(key, value) {
        if (this.__disposed) {
          return null;
        }

        var param = {};

        if (this.readyState !== 1) {
          throw new Error("Invalid state");
        }

        param[key] = value;
        this.__url = qx.util.Uri.appendParamsToUrl(this.__url, param);
        return this;
      },

      /**
       * Sends request.
       * @return {qx.bom.request.Script} Self for chaining.
       */
      send: function send() {
        if (this.__disposed) {
          return null;
        }

        var script = this.__createScriptElement(),
            head = this.__headElement,
            that = this;

        if (this.timeout > 0) {
          this.__timeoutId = window.setTimeout(this.__onTimeoutBound, this.timeout);
        }

        if (this.__environmentGet("qx.debug.io")) {
          qx.Bootstrap.debug(qx.bom.request.Script, "Send native request");
        } // Attach script to DOM


        head.insertBefore(script, head.firstChild); // The resource is loaded once the script is in DOM.
        // Assume HEADERS_RECEIVED and LOADING and dispatch async.

        window.setTimeout(function () {
          that._readyStateChange(2);

          that._readyStateChange(3);
        });
        return this;
      },

      /**
       * Aborts request.
       * @return {qx.bom.request.Script} Self for chaining.
       */
      abort: function abort() {
        if (this.__disposed) {
          return null;
        }

        this.__abort = true;

        this.__disposeScriptElement();

        this._emit("abort");

        return this;
      },

      /**
       * Helper to emit events and call the callback methods.
       * @param event {String} The name of the event.
       */
      _emit: function _emit(event) {
        this["on" + event]();

        this._emitter.emit(event, this);
      },

      /**
       * Event handler for an event that fires at every state change.
       *
       * Replace with custom method to get informed about the communication progress.
       */
      onreadystatechange: function onreadystatechange() {},

      /**
       * Event handler for XHR event "load" that is fired on successful retrieval.
       *
       * Note: This handler is called even when an invalid script is returned.
       *
       * Warning: Internet Explorer < 9 receives a false "load" for invalid URLs.
       * This "load" is fired about 2 seconds after sending the request. To
       * distinguish from a real "load", consider defining a custom check
       * function using {@link #setDetermineSuccess} and query the status
       * property. However, the script loaded needs to have a known impact on
       * the global namespace. If this does not work for you, you may be able
       * to set a timeout lower than 2 seconds, depending on script size,
       * complexity and execution time.
       *
       * Replace with custom method to listen to the "load" event.
       */
      onload: function onload() {},

      /**
       * Event handler for XHR event "loadend" that is fired on retrieval.
       *
       * Note: This handler is called even when a network error (or similar)
       * occurred.
       *
       * Replace with custom method to listen to the "loadend" event.
       */
      onloadend: function onloadend() {},

      /**
       * Event handler for XHR event "error" that is fired on a network error.
       *
       * Note: Some browsers do not support the "error" event.
       *
       * Replace with custom method to listen to the "error" event.
       */
      onerror: function onerror() {},

      /**
      * Event handler for XHR event "abort" that is fired when request
      * is aborted.
      *
      * Replace with custom method to listen to the "abort" event.
      */
      onabort: function onabort() {},

      /**
      * Event handler for XHR event "timeout" that is fired when timeout
      * interval has passed.
      *
      * Replace with custom method to listen to the "timeout" event.
      */
      ontimeout: function ontimeout() {},

      /**
       * Get a single response header from response.
       *
       * Note: This method exists for compatibility reasons. The script
       * transport does not receive response headers.
       *
       * @param key {String}
       *  Key of the header to get the value from.
       * @return {String|null} Warning message or <code>null</code> if the request
       * is disposed
       */
      getResponseHeader: function getResponseHeader(key) {
        if (this.__disposed) {
          return null;
        }

        if (this.__environmentGet("qx.debug")) {
          qx.Bootstrap.debug("Response header cannot be determined for requests made with script transport.");
        }

        return "unknown";
      },

      /**
       * Get all response headers from response.
       *
       * Note: This method exists for compatibility reasons. The script
       * transport does not receive response headers.
       * @return {String|null} Warning message or <code>null</code> if the request
       * is disposed
       */
      getAllResponseHeaders: function getAllResponseHeaders() {
        if (this.__disposed) {
          return null;
        }

        if (this.__environmentGet("qx.debug")) {
          qx.Bootstrap.debug("Response headers cannot be determined forrequests made with script transport.");
        }

        return "Unknown response headers";
      },

      /**
       * Determine if loaded script has expected impact on global namespace.
       *
       * The function is called once the script was loaded and must return a
       * boolean indicating if the response is to be considered successful.
       *
       * @param check {Function} Function executed once the script was loaded.
       *
       */
      setDetermineSuccess: function setDetermineSuccess(check) {
        this.__determineSuccess = check;
      },

      /**
       * Dispose object.
       */
      dispose: function dispose() {
        var script = this.__scriptElement;

        if (!this.__disposed) {
          // Prevent memory leaks
          if (script) {
            script.onload = script.onreadystatechange = null;

            this.__disposeScriptElement();
          }

          if (this.__timeoutId) {
            window.clearTimeout(this.__timeoutId);
          }

          this.__disposed = true;
        }
      },

      /**
       * Check if the request has already beed disposed.
       * @return {Boolean} <code>true</code>, if the request has been disposed.
       */
      isDisposed: function isDisposed() {
        return !!this.__disposed;
      },

      /*
      ---------------------------------------------------------------------------
        PROTECTED
      ---------------------------------------------------------------------------
      */

      /**
       * Get URL of request.
       *
       * @return {String} URL of request.
       */
      _getUrl: function _getUrl() {
        return this.__url;
      },

      /**
       * Get script element used for request.
       *
       * @return {Element} Script element.
       */
      _getScriptElement: function _getScriptElement() {
        return this.__scriptElement;
      },

      /**
       * Handle timeout.
       */
      _onTimeout: function _onTimeout() {
        this.__failure();

        if (!this.__supportsErrorHandler()) {
          this._emit("error");
        }

        this._emit("timeout");

        if (!this.__supportsErrorHandler()) {
          this._emit("loadend");
        }
      },

      /**
       * Handle native load.
       */
      _onNativeLoad: function _onNativeLoad() {
        var script = this.__scriptElement,
            determineSuccess = this.__determineSuccess,
            that = this; // Aborted request must not fire load

        if (this.__abort) {
          return;
        } // BUGFIX: IE < 9
        // When handling "readystatechange" event, skip if readyState
        // does not signal loaded script


        if (this.__environmentGet("engine.name") === "mshtml" && this.__environmentGet("browser.documentmode") < 9) {
          if (!/loaded|complete/.test(script.readyState)) {
            return;
          } else {
            if (this.__environmentGet("qx.debug.io")) {
              qx.Bootstrap.debug(qx.bom.request.Script, "Received native readyState: loaded");
            }
          }
        }

        if (this.__environmentGet("qx.debug.io")) {
          qx.Bootstrap.debug(qx.bom.request.Script, "Received native load");
        } // Determine status by calling user-provided check function


        if (determineSuccess) {
          // Status set before has higher precedence
          if (!this.status) {
            this.status = determineSuccess() ? 200 : 500;
          }
        }

        if (this.status === 500) {
          if (this.__environmentGet("qx.debug.io")) {
            qx.Bootstrap.debug(qx.bom.request.Script, "Detected error");
          }
        }

        if (this.__timeoutId) {
          window.clearTimeout(this.__timeoutId);
        }

        window.setTimeout(function () {
          that._success();

          that._readyStateChange(4);

          that._emit("load");

          that._emit("loadend");
        });
      },

      /**
       * Handle native error.
       */
      _onNativeError: function _onNativeError() {
        this.__failure();

        this._emit("error");

        this._emit("loadend");
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Element} Script element
       */
      __scriptElement: null,

      /**
       * @type {Element} Head element
       */
      __headElement: null,

      /**
       * @type {String} URL
       */
      __url: "",

      /**
       * @type {Function} Bound _onNativeLoad handler.
       */
      __onNativeLoadBound: null,

      /**
       * @type {Function} Bound _onNativeError handler.
       */
      __onNativeErrorBound: null,

      /**
       * @type {Function} Bound _onTimeout handler.
       */
      __onTimeoutBound: null,

      /**
       * @type {Number} Timeout timer iD.
       */
      __timeoutId: null,

      /**
       * @type {Boolean} Whether request was aborted.
       */
      __abort: null,

      /**
       * @type {Boolean} Whether request was disposed.
       */
      __disposed: null,

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Initialize properties.
       */
      __initXhrProperties: function __initXhrProperties() {
        this.readyState = 0;
        this.status = 0;
        this.statusText = "";
      },

      /**
       * Change readyState.
       *
       * @param readyState {Number} The desired readyState
       */
      _readyStateChange: function _readyStateChange(readyState) {
        this.readyState = readyState;

        this._emit("readystatechange");
      },

      /**
       * Handle success.
       */
      _success: function _success() {
        this.__disposeScriptElement();

        this.readyState = 4; // By default, load is considered successful

        if (!this.status) {
          this.status = 200;
        }

        this.statusText = "" + this.status;
      },

      /**
       * Handle failure.
       */
      __failure: function __failure() {
        this.__disposeScriptElement();

        this.readyState = 4;
        this.status = 0;
        this.statusText = null;
      },

      /**
       * Looks up whether browser supports error handler.
       *
       * @return {Boolean} Whether browser supports error handler.
       */
      __supportsErrorHandler: function __supportsErrorHandler() {
        var isLegacyIe = this.__environmentGet("engine.name") === "mshtml" && this.__environmentGet("browser.documentmode") < 9;
        var isOpera = this.__environmentGet("engine.name") === "opera";
        return !(isLegacyIe || isOpera);
      },

      /**
       * Create and configure script element.
       *
       * @return {Element} Configured script element.
       */
      __createScriptElement: function __createScriptElement() {
        var script = this.__scriptElement = document.createElement("script");
        script.src = this.__url;
        script.onerror = this.__onNativeErrorBound;
        script.onload = this.__onNativeLoadBound; // BUGFIX: IE < 9
        // Legacy IEs do not fire the "load" event for script elements.
        // Instead, they support the "readystatechange" event

        if (this.__environmentGet("engine.name") === "mshtml" && this.__environmentGet("browser.documentmode") < 9) {
          script.onreadystatechange = this.__onNativeLoadBound;
        }

        return script;
      },

      /**
       * Remove script element from DOM.
       */
      __disposeScriptElement: function __disposeScriptElement() {
        var script = this.__scriptElement;

        if (script && script.parentNode) {
          this.__headElement.removeChild(script);
        }
      },

      /**
       * Proxy Environment.get to guard against env not being present yet.
       *
       * @param key {String} Environment key.
       * @return {var} Value of the queried environment key
       * @lint environmentNonLiteralKey(key)
       */
      __environmentGet: function __environmentGet(key) {
        if (qx && qx.core && qx.core.Environment) {
          return qx.core.Environment.get(key);
        } else {
          if (key === "engine.name") {
            return qx.bom.client.Engine.getName();
          }

          if (key === "browser.documentmode") {
            return qx.bom.client.Browser.getDocumentMode();
          }

          if (key == "qx.debug.io") {
            return false;
          }

          throw new Error("Unknown environment key at this phase");
        }
      }
    },
    defer: function defer() {
      if (qx && qx.core && qx.core.Environment) {
        qx.core.Environment.add("qx.debug.io", false);
      }
    }
  });
  qx.bom.request.Script.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.util.ResourceManager": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.event.Timer": {},
      "qx.lang.Array": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.bom.Stylesheet": {},
      "qx.bom.webfonts.Validator": {}
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
        "browser.name": {
          "className": "qx.bom.client.Browser"
        },
        "browser.version": {
          "className": "qx.bom.client.Browser"
        },
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "os.version": {
          "className": "qx.bom.client.OperatingSystem"
        }
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
  
  ************************************************************************ */

  /**
   * Manages font-face definitions, making sure that each rule is only applied
   * once. It supports adding fonts of the same family but with different style
   * and weight. For instance, the following declaration uses 4 different source
   * files and combine them in a single font family.
   *
   * <pre class='javascript'>
   *   sources: [
   *     {
   *       family: "Sansation",
   *       source: [
   *         "fonts/Sansation-Regular.ttf"
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontWeight: "bold",
   *       source: [
   *         "fonts/Sansation-Bold.ttf",
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontStyle: "italic",
   *       source: [
   *         "fonts/Sansation-Italic.ttf",
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontWeight: "bold",
   *       fontStyle: "italic",
   *       source: [
   *         "fonts/Sansation-BoldItalic.ttf",
   *       ]
   *     }
   *   ]
   * </pre>
   * 
   * This class does not need to be disposed, except when you want to abort the loading
   * and validation process.
   */
  qx.Class.define("qx.bom.webfonts.Manager", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__createdStyles = [];
      this.__validators = {};
      this.__queue = [];
      this.__preferredFormats = this.getPreferredFormats();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * List of known font definition formats (i.e. file extensions). Used to
       * identify the type of each font file configured for a web font.
       */
      FONT_FORMATS: ["eot", "woff", "ttf", "svg"],

      /**
       * Timeout (in ms) to wait before deciding that a web font was not loaded.
       */
      VALIDATION_TIMEOUT: 5000
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __createdStyles: null,
      __styleSheet: null,
      __validators: null,
      __preferredFormats: null,
      __queue: null,
      __queueInterval: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Adds the necessary font-face rule for a web font to the document. Also
       * creates a web font Validator ({@link qx.bom.webfonts.Validator}) that
       * checks if the webFont was applied correctly.
       *
       * @param familyName {String} Name of the web font
       * @param sourcesList {Object} List of source URLs along with their style
       * (e.g. fontStyle: "italic") and weight (e.g. fontWeight: "bold").
       * For maximum compatibility, this should include EOT, WOFF and TTF versions
       * of the font.
       * @param callback {Function?} Optional event listener callback that will be
       * executed once the validator has determined whether the webFont was
       * applied correctly.
       * See {@link qx.bom.webfonts.Validator#changeStatus}
       * @param context {Object?} Optional context for the callback function
       */
      require: function require(familyName, sourcesList, callback, context) {
        var sourceUrls = sourcesList.source;
        var comparisonString = sourcesList.comparisonString;
        var version = sourcesList.version;
        var fontWeight = sourcesList.fontWeight;
        var fontStyle = sourcesList.fontStyle;
        var sources = [];

        for (var i = 0, l = sourceUrls.length; i < l; i++) {
          var split = sourceUrls[i].split("#");
          var src = qx.util.ResourceManager.getInstance().toUri(split[0]);

          if (split.length > 1) {
            src = src + "#" + split[1];
          }

          sources.push(src);
        } // old IEs need a break in between adding @font-face rules


        if (qx.core.Environment.get("engine.name") == "mshtml" && (parseInt(qx.core.Environment.get("engine.version")) < 9 || qx.core.Environment.get("browser.documentmode") < 9)) {
          if (!this.__queueInterval) {
            this.__queueInterval = new qx.event.Timer(100);

            this.__queueInterval.addListener("interval", this.__flushQueue, this);
          }

          if (!this.__queueInterval.isEnabled()) {
            this.__queueInterval.start();
          }

          this.__queue.push([familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context]);
        } else {
          this.__require(familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context);
        }
      },

      /**
       * Removes a font's font-face definition from the style sheet. This means
       * the font will no longer be available and any elements using it will
       * fall back to the their regular font-families.
       *
       * @param familyName {String} font-family name
       * @param fontWeight {String} the font-weight.
       * @param fontStyle {String} the font-style.
       */
      remove: function remove(familyName, fontWeight, fontStyle) {
        var fontLookupKey = this.__createFontLookupKey(familyName, fontWeight, fontStyle);

        var index = null;

        for (var i = 0, l = this.__createdStyles.length; i < l; i++) {
          if (this.__createdStyles[i] == fontLookupKey) {
            index = i;

            this.__removeRule(familyName, fontWeight, fontStyle);

            break;
          }
        }

        if (index !== null) {
          qx.lang.Array.removeAt(this.__createdStyles, index);
        }

        if (familyName in this.__validators) {
          this.__validators[familyName].dispose();

          delete this.__validators[familyName];
        }
      },

      /**
       * Returns the preferred font format(s) for the currently used browser. Some
       * browsers support multiple formats, e.g. WOFF and TTF or WOFF and EOT. In
       * those cases, WOFF is considered the preferred format.
       *
       * @return {String[]} List of supported font formats ordered by preference
       * or empty Array if none could be determined
       */
      getPreferredFormats: function getPreferredFormats() {
        var preferredFormats = [];
        var browser = qx.core.Environment.get("browser.name");
        var browserVersion = qx.core.Environment.get("browser.version");
        var os = qx.core.Environment.get("os.name");
        var osVersion = qx.core.Environment.get("os.version");

        if (browser == "ie" && qx.core.Environment.get("browser.documentmode") >= 9 || browser == "firefox" && browserVersion >= 3.6 || browser == "chrome" && browserVersion >= 6) {
          preferredFormats.push("woff");
        }

        if (browser == "opera" && browserVersion >= 10 || browser == "safari" && browserVersion >= 3.1 || browser == "firefox" && browserVersion >= 3.5 || browser == "chrome" && browserVersion >= 4 || browser == "mobile safari" && os == "ios" && osVersion >= 4.2) {
          preferredFormats.push("ttf");
        }

        if (browser == "ie" && browserVersion >= 4) {
          preferredFormats.push("eot");
        }

        if (browser == "mobileSafari" && os == "ios" && osVersion >= 4.1) {
          preferredFormats.push("svg");
        }

        return preferredFormats;
      },

      /**
       * Removes the styleSheet element used for all web font definitions from the
       * document. This means all web fonts declared by the manager will no longer
       * be available and elements using them will fall back to their regular
       * font-families
       */
      removeStyleSheet: function removeStyleSheet() {
        this.__createdStyles = [];

        if (this.__styleSheet) {
          qx.bom.Stylesheet.removeSheet(this.__styleSheet);
        }

        this.__styleSheet = null;
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE API
      ---------------------------------------------------------------------------
      */

      /**
       * Creates a lookup key to index the created fonts.
       * @param familyName {String} font-family name
       * @param fontWeight {String} the font-weight.
       * @param fontStyle {String} the font-style.
       * @return {string} the font lookup key
       */
      __createFontLookupKey: function __createFontLookupKey(familyName, fontWeight, fontStyle) {
        var lookupKey = familyName + "_" + (fontWeight ? fontWeight : "normal") + "_" + (fontStyle ? fontStyle : "normal");
        return lookupKey;
      },

      /**
       * Does the actual work of adding stylesheet rules and triggering font
       * validation
       *
       * @param familyName {String} Name of the web font
       * @param sources {String[]} List of source URLs. For maximum compatibility,
       * this should include EOT, WOFF and TTF versions of the font.
       * @param fontWeight {String} the web font should be registered using a
       * fontWeight font weight.
       * @param fontStyle {String} the web font should be registered using an
       * fontStyle font style.
       * @param comparisonString {String} String to check whether the font has loaded or not
       * @param version {String?} Optional version that is appended to the font URL to be able to override caching
       * @param callback {Function?} Optional event listener callback that will be
       * executed once the validator has determined whether the webFont was
       * applied correctly.
       * @param context {Object?} Optional context for the callback function
       */
      __require: function __require(familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context) {
        var fontLookupKey = this.__createFontLookupKey(familyName, fontWeight, fontStyle);

        if (!this.__createdStyles.includes(fontLookupKey)) {
          var sourcesMap = this.__getSourcesMap(sources);

          var rule = this.__getRule(familyName, fontWeight, fontStyle, sourcesMap, version);

          if (!rule) {
            throw new Error("Couldn't create @font-face rule for WebFont " + familyName + "!");
          }

          if (!this.__styleSheet) {
            this.__styleSheet = qx.bom.Stylesheet.createElement();
          }

          try {
            this.__addRule(rule);
          } catch (ex) {
            {
              this.warn("Error while adding @font-face rule:", ex.message);
              return;
            }
          }

          this.__createdStyles.push(fontLookupKey);
        }

        if (!this.__validators[familyName]) {
          this.__validators[familyName] = new qx.bom.webfonts.Validator(familyName, comparisonString);

          this.__validators[familyName].setTimeout(qx.bom.webfonts.Manager.VALIDATION_TIMEOUT);

          this.__validators[familyName].addListenerOnce("changeStatus", this.__onFontChangeStatus, this);
        }

        if (callback) {
          var cbContext = context || window;

          this.__validators[familyName].addListenerOnce("changeStatus", callback, cbContext);
        }

        this.__validators[familyName].validate();
      },

      /**
       * Processes the next item in the queue
       */
      __flushQueue: function __flushQueue() {
        if (this.__queue.length == 0) {
          this.__queueInterval.stop();

          return;
        }

        var next = this.__queue.shift();

        this.__require.apply(this, next);
      },

      /**
       * Removes the font-face declaration if a font could not be validated
       *
       * @param ev {qx.event.type.Data} qx.bom.webfonts.Validator#changeStatus
       */
      __onFontChangeStatus: function __onFontChangeStatus(ev) {
        var result = ev.getData();

        if (result.valid === false) {
          qx.event.Timer.once(function () {
            this.remove(result.family);
          }, this, 250);
        }
      },

      /**
       * Uses a naive regExp match to determine the format of each defined source
       * file for a webFont. Returns a map with the format names as keys and the
       * corresponding source URLs as values.
       *
       * @param sources {String[]} Array of source URLs
       * @return {Map} Map of formats and URLs
       */
      __getSourcesMap: function __getSourcesMap(sources) {
        var formats = qx.bom.webfonts.Manager.FONT_FORMATS;
        var sourcesMap = {};

        for (var i = 0, l = sources.length; i < l; i++) {
          var type = null;

          for (var x = 0; x < formats.length; x++) {
            var reg = new RegExp("\.(" + formats[x] + ")");
            var match = reg.exec(sources[i]);

            if (match) {
              type = match[1];
            }
          }

          if (type) {
            sourcesMap[type] = sources[i];
          }
        }

        return sourcesMap;
      },

      /**
       * Assembles the body of a font-face rule for a single webFont.
       *
       * @param familyName {String} Font-family name
       * @param fontWeight {String} the web font should be registered using a
       * fontWeight font weight.
       * @param fontStyle {String} the web font should be registered using an
       * fontStyle font style.
       * @param sourcesMap {Map} Map of font formats and sources
       * @param version {String?} Optional version to be appended to the URL
       * @return {String} The computed CSS rule
       */
      __getRule: function __getRule(familyName, fontWeight, fontStyle, sourcesMap, version) {
        var rules = [];
        var formatList = this.__preferredFormats.length > 0 ? this.__preferredFormats : qx.bom.webfonts.Manager.FONT_FORMATS;

        for (var i = 0, l = formatList.length; i < l; i++) {
          var format = formatList[i];

          if (sourcesMap[format]) {
            rules.push(this.__getSourceForFormat(format, sourcesMap[format], version));
          }
        }

        var rule = "src: " + rules.join(",\n") + ";";
        rule = "font-family: " + familyName + ";\n" + rule;
        rule = rule + "\nfont-style: " + (fontStyle ? fontStyle : "normal") + ";";
        rule = rule + "\nfont-weight: " + (fontWeight ? fontWeight : "normal") + ";";
        return rule;
      },

      /**
       * Returns the full src value for a given font URL depending on the type
        * @param format {String} The font format, one of eot, woff, ttf, svg
       * @param url {String} The font file's URL
       * @param version {String?} Optional version to be appended to the URL
       * @return {String} The src directive
       */
      __getSourceForFormat: function __getSourceForFormat(format, url, version) {
        if (version) {
          url += "?" + version;
        }

        switch (format) {
          case "eot":
            return "url('" + url + "');" + "src: url('" + url + "?#iefix') format('embedded-opentype')";

          case "woff":
            return "url('" + url + "') format('woff')";

          case "ttf":
            return "url('" + url + "') format('truetype')";

          case "svg":
            return "url('" + url + "') format('svg')";

          default:
            return null;
        }
      },

      /**
       * Adds a font-face rule to the document
       *
       * @param rule {String} The body of the CSS rule
       */
      __addRule: function __addRule(rule) {
        var completeRule = "@font-face {" + rule + "}\n";

        if (qx.core.Environment.get("browser.name") == "ie" && qx.core.Environment.get("browser.documentmode") < 9) {
          var cssText = this.__fixCssText(this.__styleSheet.cssText);

          cssText += completeRule;
          this.__styleSheet.cssText = cssText;
        } else {
          this.__styleSheet.insertRule(completeRule, this.__styleSheet.cssRules.length);
        }
      },

      /**
       * Removes the font-face declaration for the given font-family from the
       * stylesheet
       *
       * @param familyName {String} The font-family name
       * @param fontWeight {String} fontWeight font-weight.
       * @param fontStyle {String} fontStyle font-style.
       */
      __removeRule: function __removeRule(familyName, fontWeight, fontStyle) {
        // In IE and edge even if the rule was added with font-style first
        // and font-weight second, it is not guaranteed that the attributes
        // remain in that order. Therefore we check for both version,
        // style first, weight second and weight first, style second.
        // Without this fix the rule isn't found and removed reliable. 
        var regtext = "@font-face.*?" + familyName + "(.*font-style: *" + (fontStyle ? fontStyle : "normal") + ".*font-weight: *" + (fontWeight ? fontWeight : "normal") + ")|" + "(.*font-weight: *" + (fontWeight ? fontWeight : "normal") + ".*font-style: *" + (fontStyle ? fontStyle : "normal") + ")";
        var reg = new RegExp(regtext, "m");

        for (var i = 0, l = document.styleSheets.length; i < l; i++) {
          var sheet = document.styleSheets[i];

          if (sheet.cssText) {
            var cssText = sheet.cssText.replace(/\n/g, "").replace(/\r/g, "");
            cssText = this.__fixCssText(cssText);

            if (reg.exec(cssText)) {
              cssText = cssText.replace(reg, "");
            }

            sheet.cssText = cssText;
          } else if (sheet.cssRules) {
            for (var j = 0, m = sheet.cssRules.length; j < m; j++) {
              var cssText = sheet.cssRules[j].cssText.replace(/\n/g, "").replace(/\r/g, "");

              if (reg.exec(cssText)) {
                this.__styleSheet.deleteRule(j);

                return;
              }
            }
          }
        }
      },

      /**
       * IE 6 and 7 omit the trailing quote after the format name when
       * querying cssText. This needs to be fixed before cssText is replaced
       * or all rules will be invalid and no web fonts will work any more.
       *
       * @param cssText {String} CSS text
       * @return {String} Fixed CSS text
       */
      __fixCssText: function __fixCssText(cssText) {
        return cssText.replace("'eot)", "'eot')").replace("('embedded-opentype)", "('embedded-opentype')");
      }
    },

    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__queueInterval) {
        this.__queueInterval.stop();

        this.__queueInterval.dispose();
      }

      delete this.__createdStyles;
      this.removeStyleSheet();

      for (var prop in this.__validators) {
        this.__validators[prop].dispose();
      }

      qx.bom.webfonts.Validator.removeDefaultHelperElements();
    }
  });
  qx.bom.webfonts.Manager.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
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
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Abstract class to compute the position of an object on one axis.
   */
  qx.Bootstrap.define("qx.util.placement.AbstractAxis", {
    extend: Object,
    statics: {
      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       * @abstract
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        throw new Error("abstract method call!");
      },

      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: function _moveToEdgeAndAlign(size, target, offsets, position) {
        switch (position) {
          case "edge-start":
            return target.start - offsets.end - size;

          case "edge-end":
            return target.end + offsets.start;

          case "align-start":
            return target.start + offsets.start;

          case "align-center":
            return target.start + parseInt((target.end - target.start - size) / 2, 10) + offsets.start;

          case "align-end":
            return target.end - offsets.end - size;
        }
      },

      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: function _isInRange(start, size, areaSize) {
        return start >= 0 && start + size <= areaSize;
      }
    }
  });
  qx.util.placement.AbstractAxis.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object directly at the specified position. It is not moved if
   * parts of the object are outside of the axis' range.
   */
  qx.Bootstrap.define("qx.util.placement.DirectAxis", {
    statics: {
      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        return this._moveToEdgeAndAlign(size, target, offsets, position);
      }
    }
  });
  qx.util.placement.DirectAxis.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object to the target. If parts of the object are outside of the
   * range this class places the object at the best "edge", "alignment"
   * combination so that the overlap between object and range is maximized.
   */
  qx.Bootstrap.define("qx.util.placement.KeepAlignAxis", {
    statics: {
      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: qx.util.placement.AbstractAxis._isInRange,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        var start = this._moveToEdgeAndAlign(size, target, offsets, position);

        var range1End, range2Start;

        if (this._isInRange(start, size, areaSize)) {
          return start;
        }

        if (position == "edge-start" || position == "edge-end") {
          range1End = target.start - offsets.end;
          range2Start = target.end + offsets.start;
        } else {
          range1End = target.end - offsets.end;
          range2Start = target.start + offsets.start;
        }

        if (range1End > areaSize - range2Start) {
          start = Math.max(0, range1End - size);
        } else {
          start = range2Start;
        }

        return start;
      }
    }
  });
  qx.util.placement.KeepAlignAxis.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object according to the target. If parts of the object are outside
   * of the axis' range the object's start is adjusted so that the overlap between
   * the object and the axis is maximized.
   */
  qx.Bootstrap.define("qx.util.placement.BestFitAxis", {
    statics: {
      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: qx.util.placement.AbstractAxis._isInRange,

      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        var start = this._moveToEdgeAndAlign(size, target, offsets, position);

        if (this._isInRange(start, size, areaSize)) {
          return start;
        }

        if (start < 0) {
          start = Math.min(0, areaSize - size);
        }

        if (start + size > areaSize) {
          start = Math.max(0, areaSize - size);
        }

        return start;
      }
    }
  });
  qx.util.placement.BestFitAxis.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.Emitter": {
        "require": true
      },
      "qx.bom.client.CssAnimation": {
        "construct": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation": {
          "construct": true,
          "className": "qx.bom.client.CssAnimation"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * This is a simple handle, which will be returned when an animation is
   * started using the {@link qx.bom.element.Animation#animate} method. It
   * basically controls the animation.
   *
   * @ignore(qx.bom.element.AnimationJs)
   */
  qx.Bootstrap.define("qx.bom.element.AnimationHandle", {
    extend: qx.event.Emitter,
    construct: function construct() {
      var css = qx.core.Environment.get("css.animation");
      this.__playState = css && css["play-state"];
      this.__playing = true;
      this.addListenerOnce("end", this.__setEnded, this);
    },
    events: {
      /** Fired when the animation started via {@link qx.bom.element.Animation}. */
      "start": "Element",

      /**
       * Fired when the animation started via {@link qx.bom.element.Animation} has
       * ended.
       */
      "end": "Element",

      /** Fired on every iteration of the animation. */
      "iteration": "Element"
    },
    members: {
      __playState: null,
      __playing: false,
      __ended: false,

      /**
       * Accessor of the playing state.
       * @return {Boolean} <code>true</code>, if the animations is playing.
       */
      isPlaying: function isPlaying() {
        return this.__playing;
      },

      /**
       * Accessor of the ended state.
       * @return {Boolean} <code>true</code>, if the animations has ended.
       */
      isEnded: function isEnded() {
        return this.__ended;
      },

      /**
       * Accessor of the paused state.
       * @return {Boolean} <code>true</code>, if the animations is paused.
       */
      isPaused: function isPaused() {
        return this.el.style[this.__playState] == "paused";
      },

      /**
       * Pauses the animation, if running. If not running, it will be ignored.
       */
      pause: function pause() {
        if (this.el) {
          this.el.style[this.__playState] = "paused";
          this.el.$$animation.__playing = false; // in case the animation is based on JS

          if (this.animationId && qx.bom.element.AnimationJs) {
            qx.bom.element.AnimationJs.pause(this);
          }
        }
      },

      /**
       * Resumes an animation. This does not start the animation once it has ended.
       * In this case you need to start a new Animation.
       */
      play: function play() {
        if (this.el) {
          this.el.style[this.__playState] = "running";
          this.el.$$animation.__playing = true; // in case the animation is based on JS

          if (this.i != undefined && qx.bom.element.AnimationJs) {
            qx.bom.element.AnimationJs.play(this);
          }
        }
      },

      /**
       * Stops the animation if running.
       */
      stop: function stop() {
        if (this.el && qx.core.Environment.get("css.animation") && !this.jsAnimation) {
          this.el.style[this.__playState] = "";
          this.el.style[qx.core.Environment.get("css.animation").name] = "";
          this.el.$$animation.__playing = false;
          this.el.$$animation.__ended = true;
        } // in case the animation is based on JS
        else if (this.jsAnimation) {
            this.stopped = true;
            qx.bom.element.AnimationJs.stop(this);
          }
      },

      /**
       * Set the animation state to ended
       */
      __setEnded: function __setEnded() {
        this.__playing = false;
        this.__ended = true;
      }
    }
  });
  qx.bom.element.AnimationHandle.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Style": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["css.transform", "css.transform.3d"],
      "required": {}
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
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Responsible for checking all relevant CSS transform properties.
   *
   * Specs:
   * http://www.w3.org/TR/css3-2d-transforms/
   * http://www.w3.org/TR/css3-3d-transforms/
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.CssTransform", {
    statics: {
      /**
       * Main check method which returns an object if CSS animations are
       * supported. This object contains all necessary keys to work with CSS
       * animations.
       * <ul>
       *  <li><code>name</code> The name of the css transform style</li>
       *  <li><code>style</code> The name of the css transform-style style</li>
       *  <li><code>origin</code> The name of the transform-origin style</li>
       *  <li><code>3d</code> Whether 3d transforms are supported</li>
       *  <li><code>perspective</code> The name of the perspective style</li>
       *  <li><code>perspective-origin</code> The name of the perspective-origin style</li>
       *  <li><code>backface-visibility</code> The name of the backface-visibility style</li>
       * </ul>
       *
       * @internal
       * @return {Object|null} The described object or null, if animations are
       *   not supported.
       */
      getSupport: function getSupport() {
        var name = qx.bom.client.CssTransform.getName();

        if (name != null) {
          return {
            "name": name,
            "style": qx.bom.client.CssTransform.getStyle(),
            "origin": qx.bom.client.CssTransform.getOrigin(),
            "3d": qx.bom.client.CssTransform.get3D(),
            "perspective": qx.bom.client.CssTransform.getPerspective(),
            "perspective-origin": qx.bom.client.CssTransform.getPerspectiveOrigin(),
            "backface-visibility": qx.bom.client.CssTransform.getBackFaceVisibility()
          };
        }

        return null;
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getStyle: function getStyle() {
        return qx.bom.Style.getPropertyName("transformStyle");
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getPerspective: function getPerspective() {
        return qx.bom.Style.getPropertyName("perspective");
      },

      /**
       * Checks for the style name used to set the perspective origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getPerspectiveOrigin: function getPerspectiveOrigin() {
        return qx.bom.Style.getPropertyName("perspectiveOrigin");
      },

      /**
       * Checks for the style name used to set the backface visibility.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getBackFaceVisibility: function getBackFaceVisibility() {
        return qx.bom.Style.getPropertyName("backfaceVisibility");
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getOrigin: function getOrigin() {
        return qx.bom.Style.getPropertyName("transformOrigin");
      },

      /**
       * Checks for the style name used for transforms.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getName: function getName() {
        return qx.bom.Style.getPropertyName("transform");
      },

      /**
       * Checks if 3D transforms are supported.
       * @internal
       * @return {Boolean} <code>true</code>, if 3D transformations are supported
       */
      get3D: function get3D() {
        return qx.bom.client.CssTransform.getPerspective() != null;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("css.transform", statics.getSupport);
      qx.core.Environment.add("css.transform.3d", statics.get3D);
    }
  });
  qx.bom.client.CssTransform.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.CssTransform": {
        "require": true
      },
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.transform": {
          "load": true,
          "className": "qx.bom.client.CssTransform"
        },
        "css.transform.3d": {
          "className": "qx.bom.client.CssTransform"
        }
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
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * This class is responsible for applying CSS3 transforms to plain DOM elements.
   * The implementation is mostly a cross browser wrapper for applying the
   * transforms.
   * The API is keep to the spec as close as possible.
   *
   * http://www.w3.org/TR/css3-3d-transforms/
   */
  qx.Bootstrap.define("qx.bom.element.Transform", {
    statics: {
      /** Internal storage of the CSS names */
      __cssKeys: qx.core.Environment.get("css.transform"),

      /**
       * Method to apply multiple transforms at once to the given element. It
       * takes a map containing the transforms you want to apply plus the values
       * e.g.<code>{scale: 2, rotate: "5deg"}</code>.
       * The values can be either singular, which means a single value will
       * be added to the CSS. If you give an array, the values will be split up
       * and each array entry will be used for the X, Y or Z dimension in that
       * order e.g. <code>{scale: [2, 0.5]}</code> will result in a element
       * double the size in X direction and half the size in Y direction.
       * The values can be either singular, which means a single value will
       * be added to the CSS. If you give an array, the values will be join to
       * a string.
       * 3d suffixed properties will be taken for translate and scale if they are
       * available and an array with three values is given.
       * Make sure your browser supports all transformations you apply.
       *
       * @param el {Element} The element to apply the transformation.
       * @param transforms {Map} The map containing the transforms and value.
       */
      transform: function transform(el, transforms) {
        var transformCss = this.getTransformValue(transforms);

        if (this.__cssKeys != null) {
          var style = this.__cssKeys["name"];
          el.style[style] = transformCss;
        }
      },

      /**
       * Translates the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to translate e.g. <code>"10px"</code>.
       */
      translate: function translate(el, value) {
        this.transform(el, {
          translate: value
        });
      },

      /**
       * Scales the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {Number|Array} The value to scale.
       */
      scale: function scale(el, value) {
        this.transform(el, {
          scale: value
        });
      },

      /**
       * Rotates the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to rotate e.g. <code>"90deg"</code>.
       */
      rotate: function rotate(el, value) {
        this.transform(el, {
          rotate: value
        });
      },

      /**
       * Skews the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to skew e.g. <code>"90deg"</code>.
       */
      skew: function skew(el, value) {
        this.transform(el, {
          skew: value
        });
      },

      /**
       * Converts the given map to a string which could be added to a css
       * stylesheet.
       * @param transforms {Map} The transforms map. For a detailed description,
       * take a look at the {@link #transform} method.
       * @return {String} The CSS value.
       */
      getCss: function getCss(transforms) {
        var transformCss = this.getTransformValue(transforms);

        if (this.__cssKeys != null) {
          var style = this.__cssKeys["name"];
          return qx.bom.Style.getCssName(style) + ":" + transformCss + ";";
        }

        return "";
      },

      /**
       * Sets the transform-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} CSS position values like <code>50% 50%</code> or
       *   <code>left top</code>.
       */
      setOrigin: function setOrigin(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["origin"]] = value;
        }
      },

      /**
       * Returns the transform-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>50% 50%</code>
       */
      getOrigin: function getOrigin(el) {
        if (this.__cssKeys != null) {
          return el.style[this.__cssKeys["origin"]];
        }

        return "";
      },

      /**
       * Sets the transform-style property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} Either <code>flat</code> or <code>preserve-3d</code>.
       */
      setStyle: function setStyle(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["style"]] = value;
        }
      },

      /**
       * Returns the transform-style property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, either <code>flat</code> or
       *   <code>preserve-3d</code>.
       */
      getStyle: function getStyle(el) {
        if (this.__cssKeys != null) {
          return el.style[this.__cssKeys["style"]];
        }

        return "";
      },

      /**
       * Sets the perspective property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
       * @param el {Element} The dom element to set the property.
       * @param value {Number} The perspective layer. Numbers between 100
       *   and 5000 give the best results.
       */
      setPerspective: function setPerspective(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["perspective"]] = value + "px";
        }
      },

      /**
       * Returns the perspective property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>500</code>
       */
      getPerspective: function getPerspective(el) {
        if (this.__cssKeys != null) {
          return el.style[this.__cssKeys["perspective"]];
        }

        return "";
      },

      /**
       * Sets the perspective-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} CSS position values like <code>50% 50%</code> or
       *   <code>left top</code>.
       */
      setPerspectiveOrigin: function setPerspectiveOrigin(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["perspective-origin"]] = value;
        }
      },

      /**
       * Returns the perspective-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>50% 50%</code>
       */
      getPerspectiveOrigin: function getPerspectiveOrigin(el) {
        if (this.__cssKeys != null) {
          var value = el.style[this.__cssKeys["perspective-origin"]];

          if (value != "") {
            return value;
          } else {
            var valueX = el.style[this.__cssKeys["perspective-origin"] + "X"];
            var valueY = el.style[this.__cssKeys["perspective-origin"] + "Y"];

            if (valueX != "") {
              return valueX + " " + valueY;
            }
          }
        }

        return "";
      },

      /**
       * Sets the backface-visibility property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
       * @param el {Element} The dom element to set the property.
       * @param value {Boolean} <code>true</code> if the backface should be visible.
       */
      setBackfaceVisibility: function setBackfaceVisibility(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["backface-visibility"]] = value ? "visible" : "hidden";
        }
      },

      /**
       * Returns the backface-visibility property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
       * @param el {Element} The dom element to read the property.
       * @return {Boolean} <code>true</code>, if the backface is visible.
       */
      getBackfaceVisibility: function getBackfaceVisibility(el) {
        if (this.__cssKeys != null) {
          return el.style[this.__cssKeys["backface-visibility"]] == "visible";
        }

        return true;
      },

      /**
       * Converts the given transforms map to a valid CSS string.
       *
       * @param transforms {Map} A map containing the transforms.
       * @return {String} The CSS transforms.
       */
      getTransformValue: function getTransformValue(transforms) {
        var value = "";
        var properties3d = ["translate", "scale"];

        for (var property in transforms) {
          var params = transforms[property]; // if an array is given

          if (qx.Bootstrap.isArray(params)) {
            // use 3d properties for translate and scale if all 3 parameter are given
            if (params.length === 3 && properties3d.indexOf(property) > -1 && qx.core.Environment.get("css.transform.3d")) {
              value += this._compute3dProperty(property, params);
            } // use axis related properties
            else {
                value += this._computeAxisProperties(property, params);
              } // case for single values given

          } else {
            // single value case
            value += property + "(" + params + ") ";
          }
        }

        return value.trim();
      },

      /**
       * Helper function to create 3d property.
       *
       * @param property {String} Property of transform, e.g. translate
       * @param params {Array} Array with three values, each one stands for an axis.
       *
       * @return {String} Computed property and its value
       */
      _compute3dProperty: function _compute3dProperty(property, params) {
        var cssValue = "";
        property += "3d";

        for (var i = 0; i < params.length; i++) {
          if (params[i] == null) {
            params[i] = 0;
          }
        }

        cssValue += property + "(" + params.join(", ") + ") ";
        return cssValue;
      },

      /**
       * Helper function to create axis related properties.
       *
       * @param property {String} Property of transform, e.g. rotate
       * @param params {Array} Array with values, each one stands for an axis.
       *
       * @return {String} Computed property and its value
       */
      _computeAxisProperties: function _computeAxisProperties(property, params) {
        var value = "";
        var dimensions = ["X", "Y", "Z"];

        for (var i = 0; i < params.length; i++) {
          if (params[i] == null || i == 2 && !qx.core.Environment.get("css.transform.3d")) {
            continue;
          }

          value += property + dimensions[i] + "(";
          value += params[i];
          value += ") ";
        }

        return value;
      }
    }
  });
  qx.bom.element.Transform.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.xml.Document": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["xml.implementation", "xml.domparser", "xml.selectsinglenode", "xml.selectnodes", "xml.getelementsbytagnamens", "xml.domproperties", "xml.attributens", "xml.createelementns", "xml.createnode", "xml.getqualifieditem"],
      "required": {}
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
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * Internal class which contains the checks used by {@link qx.core.Environment}.
   * All checks in here are marked as internal which means you should never use
   * them directly.
   *
   * This class should contain all XML-related checks
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Xml", {
    statics: {
      /**
       * Checks if XML is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if XML is supported
       */
      getImplementation: function getImplementation() {
        return document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("XML", "1.0");
      },

      /**
       * Checks if an XML DOMParser is available
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOMParser is supported
       */
      getDomParser: function getDomParser() {
        return typeof window.DOMParser !== "undefined";
      },

      /**
       * Checks if the proprietary selectSingleNode method is available on XML DOM
       * nodes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if selectSingleNode is available
       */
      getSelectSingleNode: function getSelectSingleNode() {
        return typeof qx.xml.Document.create().selectSingleNode !== "undefined";
      },

      /**
       * Checks if the proprietary selectNodes method is available on XML DOM
       * nodes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if selectSingleNode is available
       */
      getSelectNodes: function getSelectNodes() {
        return typeof qx.xml.Document.create().selectNodes !== "undefined";
      },

      /**
       * Checks availability of the getElementsByTagNameNS XML DOM method.
       *
       * @internal
       * @return {Boolean} <code>true</code> if getElementsByTagNameNS is available
       */
      getElementsByTagNameNS: function getElementsByTagNameNS() {
        return typeof qx.xml.Document.create().getElementsByTagNameNS !== "undefined";
      },

      /**
       * Checks if MSXML-style DOM Level 2 properties are supported.
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getDomProperties: function getDomProperties() {
        var doc = qx.xml.Document.create();
        return "getProperty" in doc && typeof doc.getProperty("SelectionLanguage") === "string";
      },

      /**
       * Checks if the getAttributeNS and setAttributeNS methods are supported on
       * XML DOM elements
       *
       * @internal
       * @return {Boolean} <code>true</code> if get/setAttributeNS is supported
       */
      getAttributeNS: function getAttributeNS() {
        var docElem = qx.xml.Document.fromString("<a></a>").documentElement;
        return typeof docElem.getAttributeNS === "function" && typeof docElem.setAttributeNS === "function";
      },

      /**
       * Checks if the createElementNS method is supported on XML DOM documents
       *
       * @internal
       * @return {Boolean} <code>true</code> if createElementNS is supported
       */
      getCreateElementNS: function getCreateElementNS() {
        return typeof qx.xml.Document.create().createElementNS === "function";
      },

      /**
       * Checks if the proprietary createNode method is supported on XML DOM
       * documents
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getCreateNode: function getCreateNode() {
        return typeof qx.xml.Document.create().createNode !== "undefined";
      },

      /**
       * Checks if the proprietary getQualifiedItem method is supported for XML
       * element attributes
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getQualifiedItem: function getQualifiedItem() {
        var docElem = qx.xml.Document.fromString("<a></a>").documentElement;
        return typeof docElem.attributes.getQualifiedItem !== "undefined";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("xml.implementation", statics.getImplementation);
      qx.core.Environment.add("xml.domparser", statics.getDomParser);
      qx.core.Environment.add("xml.selectsinglenode", statics.getSelectSingleNode);
      qx.core.Environment.add("xml.selectnodes", statics.getSelectNodes);
      qx.core.Environment.add("xml.getelementsbytagnamens", statics.getElementsByTagNameNS);
      qx.core.Environment.add("xml.domproperties", statics.getDomProperties);
      qx.core.Environment.add("xml.attributens", statics.getAttributeNS);
      qx.core.Environment.add("xml.createelementns", statics.getCreateElementNS);
      qx.core.Environment.add("xml.createnode", statics.getCreateNode);
      qx.core.Environment.add("xml.getqualifieditem", statics.getQualifiedItem);
    }
  });
  qx.bom.client.Xml.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.Abstract": {
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
   * A basic layout, which supports positioning of child widgets by absolute
   * left/top coordinates. This layout is very simple but should also
   * perform best.
   *
   * *Features*
   *
   * * Basic positioning using <code>left</code> and <code>top</code> properties
   * * Respects minimum and maximum dimensions without shrinking/growing
   * * Margins for top and left side (including negative ones)
   * * Respects right and bottom margins in the size hint
   * * Auto-sizing
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>left</strong> <em>(Integer)</em>: The left coordinate in pixel</li>
   * <li><strong>top</strong> <em>(Integer)</em>: The top coordinate in pixel</li>
   * </ul>
   *
   * *Details*
   *
   * The default location of any widget is zero for both
   * <code>left</code> and <code>top</code>.
   *
   * *Example*
   *
   * Here is a little example of how to use the basic layout.
   *
   * <pre class="javascript">
   * var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
   *
   * // simple positioning
   * container.add(new qx.ui.core.Widget(), {left: 10, top: 10});
   * container.add(new qx.ui.core.Widget(), {left: 100, top: 50});
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/basic.html'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Basic", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        this.assert(name == "left" || name == "top", "The property '" + name + "' is not supported by the Basic layout!");
        this.assertInteger(value);
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child, size, props, left, top; // Render children

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          props = child.getLayoutProperties();
          left = padding.left + (props.left || 0) + child.getMarginLeft();
          top = padding.top + (props.top || 0) + child.getMarginTop();
          child.renderLayout(left, top, size.width, size.height);
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var child, size, props;
        var neededWidth = 0,
            neededHeight = 0;
        var localWidth, localHeight; // Iterate over children

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          props = child.getLayoutProperties();
          localWidth = size.width + (props.left || 0) + child.getMarginLeft() + child.getMarginRight();
          localHeight = size.height + (props.top || 0) + child.getMarginTop() + child.getMarginBottom();

          if (localWidth > neededWidth) {
            neededWidth = localWidth;
          }

          if (localHeight > neededHeight) {
            neededHeight = localHeight;
          }
        } // Return hint


        return {
          width: neededWidth,
          height: neededHeight
        };
      }
    }
  });
  qx.ui.layout.Basic.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.ResourceManager": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * The background class contains methods to compute and set the background image
   * of a DOM element.
   *
   * It fixes a background position issue in Firefox 2.
   */
  qx.Class.define("qx.bom.element.Background", {
    statics: {
      /** @type {Array} Internal helper to improve compile performance */
      __tmpl: ["background-image:url(", null, ");", "background-position:", null, ";", "background-repeat:", null, ";"],

      /** @type {Map} Empty styles when no image is given */
      __emptyStyles: {
        backgroundImage: null,
        backgroundPosition: null,
        backgroundRepeat: null
      },

      /**
       * Computes the background position CSS value
       *
       * @param left {Integer|String} either an integer pixel value or a CSS
       *    string value
       * @param top {Integer|String} either an integer pixel value or a CSS
       *    string value
       * @return {String} The background position CSS value
       */
      __computePosition: function __computePosition(left, top) {
        // Correcting buggy Firefox background-position implementation
        // Have problems with identical values
        var engine = qx.core.Environment.get("engine.name");
        var version = qx.core.Environment.get("engine.version");

        if (engine == "gecko" && version < 1.9 && left == top && typeof left == "number") {
          top += 0.01;
        }

        if (left) {
          var leftCss = typeof left == "number" ? left + "px" : left;
        } else {
          leftCss = "0";
        }

        if (top) {
          var topCss = typeof top == "number" ? top + "px" : top;
        } else {
          topCss = "0";
        }

        return leftCss + " " + topCss;
      },

      /**
       * Compiles the background into a CSS compatible string.
       *
       * @param source {String?null} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer|String?null} The horizontal offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "center", "left" and "right"
       * @param top {Integer|String?null} The vertical offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "top", "bottom" and "center"
       * @return {String} CSS string
       */
      compile: function compile(source, repeat, left, top) {
        var position = this.__computePosition(left, top);

        var backgroundImageUrl = qx.util.ResourceManager.getInstance().toUri(source); // Updating template

        var tmpl = this.__tmpl;
        tmpl[1] = "'" + backgroundImageUrl + "'"; // Put in quotes so spaces work

        tmpl[4] = position;
        tmpl[7] = repeat;
        return tmpl.join("");
      },

      /**
       * Get standard css background styles
       *
       * @param source {String} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer|String?null} The horizontal offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "center", "left" and "right"
       * @param top {Integer|String?null} The vertical offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "top", "bottom" and "center"
       * @return {Map} A map of CSS styles
       */
      getStyles: function getStyles(source, repeat, left, top) {
        if (!source) {
          return this.__emptyStyles;
        }

        var position = this.__computePosition(left, top);

        var backgroundImageUrl = qx.util.ResourceManager.getInstance().toUri(source);
        var backgroundImageCssString = "url('" + backgroundImageUrl + "')"; // Put in quotes so spaces work

        var map = {
          backgroundPosition: position,
          backgroundImage: backgroundImageCssString
        };

        if (repeat != null) {
          map.backgroundRepeat = repeat;
        }

        return map;
      },

      /**
       * Set the background on the given DOM element
       *
       * @param element {Element} The element to modify
       * @param source {String?null} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer?null} The horizontal offset of the image inside of
       *     the image element.
       * @param top {Integer?null} The vertical offset of the image inside of
       *     the image element.
       */
      set: function set(element, source, repeat, left, top) {
        var styles = this.getStyles(source, repeat, left, top);

        for (var prop in styles) {
          element.style[prop] = styles[prop];
        }
      }
    }
  });
  qx.bom.element.Background.$$dbClassInfo = $$dbClassInfo;
})();

//
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.Emitter": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.core.Assert": {
        "construct": true
      },
      "qx.bom.request.Xhr": {},
      "qx.bom.request.SimpleXhr": {},
      "qx.lang.Type": {},
      "qx.lang.Function": {},
      "qx.util.Request": {},
      "qx.lang.Json": {},
      "qx.lang.Object": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.debug.dispose.level": {}
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2013 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Richard Sternagel (rsternagel)
  
  ************************************************************************ */

  /**
   * Client-side wrapper of a REST resource.
   *
   * Each instance represents a resource in terms of REST. A number of actions
   * (usually HTTP methods) unique to the resource can be defined and invoked.
   * A resource with its actions is configured declaratively by passing a resource
   * description to the constructor, or programmatically using {@link #map}.
   *
   * Each action is associated to a route. A route is a combination of method,
   * URL pattern and optional parameter constraints.
   *
   * An action is invoked by calling a method with the same name. When a URL
   * pattern of a route contains positional parameters, those parameters must be
   * passed when invoking the associated action. Also, constraints defined in the
   * route must be satisfied.
   *
   * When an action is invoked, a request is configured according to the associated
   * route, is passed the URL parameters, request body data, and finally send.
   * What kind of request is send can be configured by overwriting {@link #_getRequest}.
   *
   * No constraints on the action's name or the scope of the URLs are imposed. However,
   * if you want to follow RESTful design patterns it is recommended to name actions
   * the same as the HTTP action.
   *
   * Strictly speaking, the <code>photos</code> instance represents two distinct resources
   * and could therefore just as well mapped to two distinct resources (for instance,
   * named photos and photosTagged). What style to choose depends on the kind of data
   * returned. For instance, it seems sensible to stick with one resource if the filter
   * only limits the result set (i.e. the individual results have the same properties).
   *
   * In order to respond to successful (or erroneous) invocations of actions,
   * either listen to the generic "success" or "error" event and get the action
   * from the event data, or listen to action specific events defined at runtime.
   * Action specific events follow the pattern "&lt;action&gt;Success" and
   * "&lt;action&gt;Error", e.g. "indexSuccess".
   *
   * @group (IO)
   * @ignore(qx.core.Object.*)
   */
  qx.Bootstrap.define("qx.bom.rest.Resource", {
    extend: qx.event.Emitter,
    implement: [qx.core.IDisposable],

    /**
     * @param description {Map?} Each key of the map is interpreted as
     *  <code>action</code> name. The value associated to the key must be a map
     *  with the properties <code>method</code> and <code>url</code>.
     *  <code>check</code> is optional. Also see {@link #map}.
     *
     * @see qx.bom.rest
     * @see qx.io.rest
     */
    construct: function construct(description) {
      this.__requests = {};
      this.__routes = {};
      this.__pollTimers = {};
      this.__longPollHandlers = {};

      try {
        if (typeof description !== "undefined") {
          {
            qx.core.Assert.assertMap(description);
          }

          this.__mapFromDescription(description);
        }
      } catch (e) {
        this.dispose();
        throw e;
      }
    },
    events: {
      /**
       * Fired when any request was successful.
       *
       * The action the successful request is associated to, as well as the
       * request itself, can be retrieved from the event’s properties.
       * Additionally, an action specific event is fired that follows the pattern
       * "<action>Success", e.g. "indexSuccess".
       */
      "success": "qx.bom.rest.Resource",

      /**
       * Fired when request associated to action given in prefix was successful.
       *
       * For example, "indexSuccess" is fired when <code>index()</code> was
       * successful.
       */
      "actionSuccess": "qx.bom.rest.Resource",

      /**
       * Fired when any request fails.
       *
       * The action the failed request is associated to, as well as the
       * request itself, can be retrieved from the event’s properties.
       * Additionally, an action specific event is fired that follows the pattern
       * "<action>Error", e.g. "indexError".
       */
      "error": "qx.bom.rest.Resource",

      /**
       * Fired when any request associated to action given in prefix fails.
       *
       * For example, "indexError" is fired when <code>index()</code> failed.
       */
      "actionError": "qx.bom.rest.Resource",

      /**
       * Fired when a request is sent to the given endpoint.
       */
      "sent": "qx.bom.rest.Resource",

      /**
       * Fired when any request associated to action is sent to the given endpoint.
       *
       * For example, "indexSent" is fired when <code>index()</code> was
       * called.
       */
      "actionSent": "qx.bom.rest.Resource",

      /**
       * Fired when a request is started to the given endpoint. This moment is right after the request
       * was opened and send.
       */
      "started": "qx.bom.rest.Resource",

      /**
       * Fired when any request associated to action is started to the given endpoint. This moment is
       * right after the request was opened and send.
       *
       * For example, "indexStarted" is fired when <code>index()</code> was called.
       */
      "actionStarted": "qx.bom.rest.Resource"
    },
    statics: {
      /**
       * Number of milliseconds below a long-poll request is considered immediate and
       * subject to throttling checks.
       */
      POLL_THROTTLE_LIMIT: 100,

      /**
       * Number of immediate long-poll responses accepted before throttling takes place.
       */
      POLL_THROTTLE_COUNT: 30,

      /**
       * A symbol used in checks to declare required parameter.
       */
      REQUIRED: true,

      /**
       * Get placeholders from URL.
       *
       * @param url {String} The URL to parse for placeholders.
       * @return {Array} Array of placeholders without the placeholder prefix.
       */
      placeholdersFromUrl: function placeholdersFromUrl(url) {
        var placeholderRe = /\{(\w+)(=\w+)?\}/g,
            match,
            placeholders = []; // With g flag set, searching begins at the regex object's
        // lastIndex, which is zero initially and increments with each match.

        while (match = placeholderRe.exec(url)) {
          placeholders.push(match[1]);
        }

        return placeholders;
      }
    },
    members: {
      __requests: null,
      __routes: null,
      __baseUrl: null,
      __pollTimers: null,
      __longPollHandlers: null,
      __configureRequestCallback: null,

      /**
       * @type {Map} Request callbacks for 'onsuccess', 'onfail' and 'onloadend' - see {@link #setRequestHandler}.
       */
      __requestHandler: null,

      /**
       * @type {Function} Function which returns instances from {@link qx.io.request.AbstractRequest}.
       */
      __begetRequest: null,
      //
      // Request
      //

      /**
       * Set a request factory function to switch the request implementation.
       * The created requests have to implement {@link qx.io.request.AbstractRequest}.
       *
       * @param fn {Function} Function which returns request instances.
       *
       * @internal
       */
      setRequestFactory: function setRequestFactory(fn) {
        this.__begetRequest = fn;
      },

      /**
       * Sets request callbacks for 'onsuccess', 'onfail' and 'onloadend'.
       *
       * @param handler {Map} Map defining callbacks and their context.
       *
       * @internal
       */
      setRequestHandler: function setRequestHandler(handler) {
        this.__requestHandler = handler;
      },

      /**
       * Provides the request callbacks for 'onsuccess', 'onfail' and 'onloadend'.
       *
       * @return {Map} Map defining callbacks and their context.
       */
      _getRequestHandler: function _getRequestHandler() {
        return this.__requestHandler === null ? {
          onsuccess: {
            callback: function callback(req, action) {
              return function () {
                var response = {
                  "id": parseInt(req.toHashCode(), 10),
                  "response": req.getResponse(),
                  "request": req,
                  "action": action
                };
                this.emit(action + "Success", response);
                this.emit("success", response);
              };
            },
            context: this
          },
          onfail: {
            callback: function callback(req, action) {
              return function () {
                var response = {
                  "id": parseInt(req.toHashCode(), 10),
                  "response": req.getResponse(),
                  "request": req,
                  "action": action
                };
                this.emit(action + "Error", response);
                this.emit("error", response);
              };
            },
            context: this
          },
          onloadend: {
            callback: function callback(req, action) {
              return function () {
                // [#8315] // dispose asynchronous to work with Sinon.js
                window.setTimeout(function () {
                  req.dispose();
                }, 0);
              };
            },
            context: this
          },
          onreadystatechange: {
            callback: function callback(req, action) {
              return function () {
                if (req.getTransport().readyState === qx.bom.request.Xhr.HEADERS_RECEIVED) {
                  var response = {
                    "id": parseInt(req.toHashCode(), 10),
                    "request": req,
                    "action": action
                  };
                  this.emit(action + "Sent", response);
                  this.emit("sent", response);
                }

                if (req.getTransport().readyState === qx.bom.request.Xhr.OPENED) {
                  var payload = {
                    "id": parseInt(req.toHashCode(), 10),
                    "request": req,
                    "action": action
                  };
                  this.emit(action + "Started", payload);
                  this.emit("started", payload);
                }
              };
            },
            context: this
          },
          onprogress: {
            callback: function callback(req, action) {
              return function () {
                var payload = {
                  "id": parseInt(req.toHashCode(), 10),
                  "request": req,
                  "action": action,
                  "progress": {
                    "lengthComputable": req.getTransport().progress.lengthComputable,
                    "loaded": req.getTransport().progress.loaded,
                    "total": req.getTransport().progress.total
                  }
                };
                this.emit(action + "Progress", payload);
                this.emit("progress", payload);
              };
            },
            context: this
          }
        } : this.__requestHandler;
      },

      /**
       * Retrieve the currently stored request objects for an action.
       *
       * @param action {String} The action (e.g. "get", "post" ...).
       * @return {Array|null} Request objects.
       *
       * @internal
       */
      getRequestsByAction: function getRequestsByAction(action) {
        var hasRequests = this.__requests !== null && action in this.__requests;
        return hasRequests ? this.__requests[action] : null;
      },

      /**
       * Configure request.
       *
       * @param callback {Function} Function called before request is send.
       *   Receives request, action, params and data.
       */
      configureRequest: function configureRequest(callback) {
        this.__configureRequestCallback = callback;
      },

      /**
       * Get request.
       *
       * May be overridden to change type of request.
       * @return {qx.bom.request.SimpleXhr|qx.io.request.AbstractRequest} Request object
       */
      _getRequest: function _getRequest() {
        return this.__begetRequest === null ? new qx.bom.request.SimpleXhr() : this.__begetRequest();
      },

      /**
       * Create request.
       *
       * @param action {String} The action the created request is associated to.
       * @return {qx.bom.request.SimpleXhr|qx.io.request.AbstractRequest} Request object
       */
      __createRequest: function __createRequest(action) {
        var req = this._getRequest();

        if (!qx.lang.Type.isArray(this.__requests[action])) {
          this.__requests[action] = [];
        }

        qx.core.ObjectRegistry.register(req);

        this.__requests[action].push(req);

        return req;
      },
      //
      // Routes and actions
      //

      /**
       * Map action to combination of method and URL pattern.
       *
       * @param action {String} Action to associate to request.
       * @param method {String} Method to configure request with.
       * @param url {String} URL to configure request with. May contain positional
       *   parameters (<code>{param}</code>) that are replaced by values given when the action
       *   is invoked. Parameters are optional, unless a check is defined. A default
       *   value can be provided (<code>{param=default}</code>).
       * @param check {Map?} Map defining parameter constraints, where the key is
       *   the URL parameter and the value a regular expression (to match string) or
       *   <code>qx.bom.rest.Resource.REQUIRED</code> (to verify existence).
       */
      map: function map(action, method, url, check) {
        this.__routes[action] = [method, url, check]; // Track requests

        this.__requests[action] = []; // Undefine generic getter when action is named "get"

        if (action == "get") {
          this[action] = undefined;
        } // Do not overwrite existing "non-action" methods unless the method is
        // null (i.e. because it exists as a stub for documentation)


        if (typeof this[action] !== "undefined" && this[action] !== null && this[action].action !== true) {
          throw new Error("Method with name of action (" + action + ") already exists");
        }

        this.__declareEvent(action + "Success");

        this.__declareEvent(action + "Error");

        this[action] = qx.lang.Function.bind(function () {
          Array.prototype.unshift.call(arguments, action);
          return this.invoke.apply(this, arguments);
        }, this); // Method is safe to overwrite

        this[action].action = true;
      },

      /**
       * Invoke action with parameters.
       *
       * Internally called by actions dynamically created.
       *
       * May be overridden to customize action and parameter handling.
       *
       * @lint ignoreUnused(successHandler, failHandler, loadEndHandler)
       *
       * @param action {String} Action to invoke.
       * @param params {Map} Map of parameters inserted into URL when a matching
       *  positional parameter is found.
       * @param data {Map|String} Data to be send as part of the request.
       *  See {@link qx.bom.request.SimpleXhr#getRequestData}.
       *  See {@link qx.io.request.AbstractRequest#requestData}.
       * @return {Number} Id of the action's invocation.
       */
      invoke: function invoke(action, params, data) {
        var req = this.__createRequest(action),
            params = params == null ? {} : params,
            config = this._getRequestConfig(action, params); // Cache parameters


        this.__routes[action].params = params; // Check parameters

        this.__checkParameters(params, config.check); // Configure request


        this.__configureRequest(req, config, data); // Run configuration callback, passing in pre-configured request


        if (this.__configureRequestCallback) {
          this.__configureRequestCallback.call(this, req, action, params, data);
        } // Configure JSON request (content type may have been set in configuration callback)


        this.__configureJsonRequest(req, config, data);

        var reqHandler = this._getRequestHandler(); // Handle successful request


        req.addListenerOnce("success", reqHandler.onsuccess.callback(req, action), reqHandler.onsuccess.context); // Handle erroneous request

        req.addListenerOnce("fail", reqHandler.onfail.callback(req, action), reqHandler.onfail.context); // Handle loadend (Note that loadEnd is fired after "success")

        req.addListenerOnce("loadEnd", reqHandler.onloadend.callback(req, action), reqHandler.onloadend.context);

        if (reqHandler.hasOwnProperty("onreadystatechange")) {
          req.addListener("readystatechange", reqHandler.onreadystatechange.callback(req, action), reqHandler.onreadystatechange.context);
        } // Handle progress (which is fired multiple times)


        if (reqHandler.hasOwnProperty("onprogress")) {
          req.addListener("progress", reqHandler.onprogress.callback(req, action), reqHandler.onprogress.context);
        }

        req.send();
        return parseInt(req.toHashCode(), 10);
      },

      /**
       * Set base URL.
       *
       * The base URL is prepended to the URLs given in the description.
       * Changes affect all future invocations.
       *
       * @param baseUrl {String} Base URL.
       */
      setBaseUrl: function setBaseUrl(baseUrl) {
        this.__baseUrl = baseUrl;
      },

      /**
       * Check parameters.
       *
       * @param params {Map} Parameters.
       * @param check {Map} Checks.
       */
      __checkParameters: function __checkParameters(params, check) {
        if (typeof check !== "undefined") {
          {
            qx.core.Assert.assertObject(check, "Check must be object with params as keys");
          }
          Object.keys(check).forEach(function (param) {
            // Warn about invalid check
            {
              if (check[param] !== true) {
                {
                  qx.core.Assert.assertRegExp(check[param]);
                }
              }
            } // Missing parameter

            if (check[param] === qx.bom.rest.Resource.REQUIRED && typeof params[param] === "undefined") {
              throw new Error("Missing parameter '" + param + "'");
            } // Ignore invalid checks


            if (!(check[param] && typeof check[param].test == "function")) {
              return;
            } // Invalid parameter


            if (!check[param].test(params[param])) {
              throw new Error("Parameter '" + param + "' is invalid");
            }
          });
        }
      },

      /**
       * Configure request.
       *
       * @param req {qx.bom.request.SimpleXhr|qx.io.request.AbstractRequest} Request.
       * @param config {Map} Configuration.
       * @param data {Map} Data.
       */
      __configureRequest: function __configureRequest(req, config, data) {
        req.setUrl(config.url);

        if (!req.setMethod && config.method !== "GET") {
          throw new Error("Request (" + req.classname + ") doesn't support other HTTP methods than 'GET'");
        }

        if (req.setMethod) {
          req.setMethod(config.method);
        }

        if (data) {
          req.setRequestData(data);
        }
      },

      /**
       * Serialize data to JSON when content type indicates.
       *
       * @param req {qx.bom.request.SimpleXhr|qx.io.request.AbstractRequest} Request.
       * @param config {Map} Configuration.
       * @param data {Map} Data.
       */
      __configureJsonRequest: function __configureJsonRequest(req, config, data) {
        if (data) {
          var contentType = req.getRequestHeader("Content-Type");

          if (req.getMethod && qx.util.Request.methodAllowsRequestBody(req.getMethod())) {
            if (/application\/.*\+?json/.test(contentType)) {
              data = qx.lang.Json.stringify(data);
              req.setRequestData(data);
            }
          }
        }
      },

      /**
       * Abort action.
       *
       * @param varargs {String|Number} Action of which all invocations to abort
       *  (when string), or a single invocation of an action to abort (when number)
       */
      abort: function abort(varargs) {
        if (qx.lang.Type.isNumber(varargs)) {
          var id = varargs;
          var post = qx.core.ObjectRegistry.getPostId();
          var req = qx.core.ObjectRegistry.fromHashCode(id + post);

          if (req) {
            req.abort();
          }
        } else {
          var action = varargs;
          var reqs = this.__requests[action];

          if (this.__requests[action]) {
            reqs.forEach(function (req) {
              req.abort();
            });
          }
        }
      },

      /**
       * Resend request associated to action.
       *
       * Replays parameters given when action was invoked originally.
       *
       * @param action {String} Action to refresh.
       */
      refresh: function refresh(action) {
        this.invoke(action, this.__routes[action].params);
      },

      /**
       * Periodically invoke action.
       *
       * Replays parameters given when action was invoked originally. When the
       * action was not yet invoked and requires parameters, parameters must be
       * given.
       *
       * Please note that IE tends to cache overly aggressive. One work-around is
       * to disable caching on the client side by configuring the request with
       * <code>setCache(false)</code>. If you control the server, a better
       * work-around is to include appropriate headers to explicitly control
       * caching. This way you still avoid requests that can be correctly answered
       * from cache (e.g. when nothing has changed since the last poll). Please
       * refer to <a href="http://www.mnot.net/javascript/xmlhttprequest/cache.html">
       * XMLHttpRequest Caching Test</a> for available options.
       *
       * @lint ignoreUnused(intervalListener)
       *
       * @param action {String} Action to poll.
       * @param interval {Number} Interval in ms.
       * @param params {Map?} Map of parameters. See {@link #invoke}.
       * @param immediately {Boolean?false} <code>true</code>, if the poll should
       *   invoke a call immediately.
       */
      poll: function poll(action, interval, params, immediately) {
        // Dispose timer previously created for action
        if (this.__pollTimers[action]) {
          this.stopPollByAction(action);
        } // Fallback to previous params


        if (typeof params == "undefined") {
          params = this.__routes[action].params;
        } // Invoke immediately


        if (immediately) {
          this.invoke(action, params);
        }

        var intervalListener = function (scope) {
          return function () {
            var req = scope.__requests[action][0];

            if (!immediately && !req) {
              scope.invoke(action, params);
              return;
            }

            if (req.isDone() || req.isDisposed()) {
              scope.refresh(action);
            }
          };
        }(this);

        this._startPoll(action, intervalListener, interval);
      },

      /**
       * Start a poll process.
       *
       * @param action {String} Action to poll.
       * @param listener {Function} The function to repeatedly execute at the given interval.
       * @param interval {Number} Interval in ms.
       */
      _startPoll: function _startPoll(action, listener, interval) {
        this.__pollTimers[action] = {
          "id": window.setInterval(listener, interval),
          "interval": interval,
          "listener": listener
        };
      },

      /**
       * Stops a poll process by the associated action.
       *
       * @param action {String} Action to poll.
       */
      stopPollByAction: function stopPollByAction(action) {
        if (action in this.__pollTimers) {
          var intervalId = this.__pollTimers[action].id;
          window.clearInterval(intervalId);
        }
      },

      /**
       * Restarts a poll process by the associated action.
       *
       * @param action {String} Action to poll.
       */
      restartPollByAction: function restartPollByAction(action) {
        if (action in this.__pollTimers) {
          var timer = this.__pollTimers[action];
          this.stopPollByAction(action);

          this._startPoll(action, timer.listener, timer.interval);
        }
      },

      /**
       * Long-poll action.
       *
       * Use Ajax long-polling to continuously fetch a resource as soon as the
       * server signals new data. The server determines when new data is available,
       * while the client keeps open a request. Requires configuration on the
       * server side. Basically, the server must not close a connection until
       * new data is available. For a high level introduction to long-polling,
       * refer to <a href="http://en.wikipedia.org/wiki/Comet_(programming)#Ajax_with_long_polling">
       * Ajax with long polling</a>.
       *
       * Uses {@link #refresh} internally. Make sure you understand the
       * implications of IE's tendency to cache overly aggressive.
       *
       * Note no interval is given on the client side.
       *
       * @lint ignoreUnused(longPollHandler)
       *
       * @param action {String} Action to poll.
       * @return {String} Id of handler responsible for long-polling. To stop
       *  polling, remove handler using {@link qx.core.Object#removeListenerById}.
       */
      longPoll: function longPoll(action) {
        var res = this,
            lastResponse,
            // Keep track of last response
        immediateResponseCount = 0; // Count immediate responses
        // Throttle to prevent high load on server and client

        function throttle() {
          var isImmediateResponse = lastResponse && new Date() - lastResponse < res._getThrottleLimit();

          if (isImmediateResponse) {
            immediateResponseCount += 1;

            if (immediateResponseCount > res._getThrottleCount()) {
              {
                qx.Bootstrap.debug("Received successful response more than " + res._getThrottleCount() + " times subsequently, each within " + res._getThrottleLimit() + " ms. Throttling.");
              }
              return true;
            }
          } // Reset counter on delayed response


          if (!isImmediateResponse) {
            immediateResponseCount = 0;
          }

          return false;
        }

        var handlerId = this.__longPollHandlers[action] = this.addListener(action + "Success", function longPollHandler() {
          if (res.isDisposed()) {
            return;
          }

          if (!throttle()) {
            lastResponse = new Date();
            res.refresh(action);
          }
        });
        this.invoke(action);
        return handlerId;
      },

      /**
       * Get request configuration for action and parameters.
       *
       * This is were placeholders are replaced with parameters.
       *
       * @param action {String} Action associated to request.
       * @param params {Map} Parameters to embed in request.
       * @return {Map} Map of configuration settings. Has the properties
       *   <code>method</code>, <code>url</code> and <code>check</code>.
       */
      _getRequestConfig: function _getRequestConfig(action, params) {
        var route = this.__routes[action]; // Not modify original params

        var params = qx.lang.Object.clone(params);

        if (!qx.lang.Type.isArray(route)) {
          throw new Error("No route for action " + action);
        }

        var method = route[0],
            url = this.__baseUrl !== null ? this.__baseUrl + route[1] : route[1],
            check = route[2],
            placeholders = qx.bom.rest.Resource.placeholdersFromUrl(url);
        params = params || {};
        placeholders.forEach(function (placeholder) {
          // Placeholder part of template and default value
          var re = new RegExp("{" + placeholder + "=?(\\w+)?}"),
              defaultValue = url.match(re)[1]; // Fill in default or empty string when missing

          if (typeof params[placeholder] === "undefined") {
            if (defaultValue) {
              params[placeholder] = defaultValue;
            } else {
              params[placeholder] = "";
            }
          }

          url = url.replace(re, params[placeholder]);
        });
        return {
          method: method,
          url: url,
          check: check
        };
      },

      /**
       * Override to adjust the throttle limit.
       * @return {Integer} Throttle limit in milliseconds
       */
      _getThrottleLimit: function _getThrottleLimit() {
        return qx.bom.rest.Resource.POLL_THROTTLE_LIMIT;
      },

      /**
       * Override to adjust the throttle count.
       * @return {Integer} Throttle count
       */
      _getThrottleCount: function _getThrottleCount() {
        return qx.bom.rest.Resource.POLL_THROTTLE_COUNT;
      },

      /**
       * Map actions from description.
       *
       * Allows to decoratively define routes.
       *
       * @param description {Map} Map that defines the routes.
       */
      __mapFromDescription: function __mapFromDescription(description) {
        Object.keys(description).forEach(function (action) {
          var route = description[action],
              method = route.method,
              url = route.url,
              check = route.check;
          {
            qx.core.Assert.assertString(method, "Method must be string for route '" + action + "'");
            qx.core.Assert.assertString(url, "URL must be string for route '" + action + "'");
          }
          this.map(action, method, url, check);
        }, this);
      },

      /**
       * Declare event at runtime.
       *
       * @param type {String} Type of event.
       */
      __declareEvent: function __declareEvent(type) {
        if (!this.constructor.$$events) {
          this.constructor.$$events = {};
        }

        if (!this.constructor.$$events[type]) {
          this.constructor.$$events[type] = "qx.bom.rest.Resource";
        }
      },

      /*
      ---------------------------------------------------------------------------
        DISPOSER
      ---------------------------------------------------------------------------
      */

      /**
       * Returns true if the object is disposed.
       *
       * @return {Boolean} Whether the object has been disposed
       */
      isDisposed: function isDisposed() {
        return this.$$disposed || false;
      },

      /**
       * Dispose this object
       *
       */
      dispose: function dispose() {
        // Check first
        if (this.$$disposed) {
          return;
        } // Mark as disposed (directly, not at end, to omit recursions)


        this.$$disposed = true; // Debug output

        {
          if (qx.core.Environment.get("qx.debug.dispose.level") > 2) {
            qx.Bootstrap.debug(this, "Disposing " + this.classname + "[" + this.toHashCode() + "]");
          }
        }
        this.destruct(); // Additional checks

        {
          if (qx.core.Environment.get("qx.debug.dispose.level") > 0) {
            var key, value;

            for (key in this) {
              value = this[key]; // Check for Objects but respect values attached to the prototype itself

              if (value !== null && _typeof(value) === "object" && !qx.Bootstrap.isString(value)) {
                // Check prototype value
                // undefined is the best, but null may be used as a placeholder for
                // private variables (hint: checks in qx.Class.define). We accept both.
                if (this.constructor.prototype[key] != null) {
                  continue;
                }

                var ff2 = navigator.userAgent.indexOf("rv:1.8.1") != -1;
                var ie6 = navigator.userAgent.indexOf("MSIE 6.0") != -1; // keep the old behavior for IE6 and FF2

                if (ff2 || ie6) {
                  if (qx.core.Object && value instanceof qx.core.Object || qx.core.Environment.get("qx.debug.dispose.level") > 1) {
                    qx.Bootstrap.warn(this, "Missing destruct definition for '" + key + "' in " + this.classname + "[" + this.toHashCode() + "]: " + value);
                    delete this[key];
                  }
                } else {
                  if (qx.core.Environment.get("qx.debug.dispose.level") > 1) {
                    qx.Bootstrap.warn(this, "Missing destruct definition for '" + key + "' in " + this.classname + "[" + this.toHashCode() + "]: " + value);
                    delete this[key];
                  }
                }
              }
            }
          }
        }
      },

      /**
       * Destructs the Resource.
       *
       * All created requests, routes and pollTimers will be disposed.
       */
      destruct: function destruct() {
        var action;

        for (action in this.__requests) {
          if (this.__requests[action]) {
            this.__requests[action].forEach(function (req) {
              req.dispose();
            });
          }
        }

        if (this.__pollTimers) {
          for (action in this.__pollTimers) {
            this.stopPollByAction(action);
          }
        }

        if (this.__longPollHandlers) {
          for (action in this.__longPollHandlers) {
            var id = this.__longPollHandlers[action];
            this.removeListenerById(id);
          }
        }

        this.__requests = this.__routes = this.__pollTimers = null;
      }
    }
  });
  qx.bom.rest.Resource.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Data": {
        "require": true
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
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * Rest event object.
   */
  qx.Class.define("qx.event.type.Rest", {
    extend: qx.event.type.Data,
    properties: {
      /**
       * The request of the event.
       */
      request: {
        check: "qx.io.request.AbstractRequest"
      },

      /**
       * The action that invoked the request.
       */
      action: {
        check: "String"
      },

      /**
       * The phase of the request.
       */
      phase: {
        check: "String"
      },

      /**
       * The id of the request.
       */
      id: {
        check: "Number"
      }
    },
    members: {
      /**
       * Initializes an event object.
       *
       * @param data {var} Then event's new data
       * @param old {var?null} The event's old data
       * @param cancelable {Boolean?false} Whether or not an event can have its default
       *  action prevented. The default action can either be the browser's
       *  default action of a native event (e.g. open the context menu on a
       *  right click) or the default action of a qooxdoo class (e.g. close
       *  the window widget). The default action can be prevented by calling
       *  {@link qx.event.type.Event#preventDefault}
       * @param request {qx.io.request.AbstractRequest} The associated request.
       * @param action {String} The associated action.
       * @param phase {String} The associated phase.
       * @return {qx.event.type.Data} The initialized instance.
       */
      init: function init(data, old, cancelable, request, action, phase) {
        qx.event.type.Rest.prototype.init.base.call(this, data, old, cancelable);
        this.setRequest(request);
        this.setAction(action);
        this.setPhase(phase);
        this.setId(parseInt(request.toHashCode(), 10));
        return this;
      },

      /**
       * Get a copy of this object
       *
       * @param embryo {qx.event.type.Data?null} Optional event class, which will
       *  be configured using the data of this event instance. The event must be
       *  an instance of this event class. If the data is <code>null</code>,
       *  a new pooled instance is created.
       * @return {qx.event.type.Data} A copy of this object.
       */
      clone: function clone(embryo) {
        var clone = qx.event.type.Rest.prototype.clone.base.call(this, embryo);
        clone.setAction(this.getAction());
        clone.setPhase(this.getPhase());
        clone.setRequest(this.getRequest());
        return clone;
      }
    }
  });
  qx.event.type.Rest.$$dbClassInfo = $$dbClassInfo;
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
      "qx.io.request.authentication.IAuthentication": {
        "require": true
      },
      "qx.util.Base64": {
        "construct": true
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
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * Basic authentication.
   */
  qx.Class.define("qx.io.request.authentication.Basic", {
    extend: qx.core.Object,
    implement: qx.io.request.authentication.IAuthentication,

    /**
     * @param username {var} The username to use.
     * @param password {var} The password to use.
     */
    construct: function construct(username, password) {
      this.__credentials = qx.util.Base64.encode(username + ':' + password);
    },
    members: {
      __credentials: null,

      /**
       * Headers to include for basic authentication.
       * @return {Map} Map containing the authentication credentials
       */
      getAuthHeaders: function getAuthHeaders() {
        return [{
          key: "Authorization",
          value: "Basic " + this.__credentials
        }];
      }
    }
  });
  qx.io.request.authentication.Basic.$$dbClassInfo = $$dbClassInfo;
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
  
  ************************************************************************ */

  /**
   * Defines the callback for the single selection manager.
   *
   * @internal
   */
  qx.Interface.define("qx.ui.core.ISingleSelectionProvider", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns the elements which are part of the selection.
       *
       * @return {qx.ui.core.Widget[]} The widgets for the selection.
       */
      getItems: function getItems() {},

      /**
       * Returns whether the given item is selectable.
       *
       * @param item {qx.ui.core.Widget} The item to be checked
       * @return {Boolean} Whether the given item is selectable
       */
      isItemSelectable: function isItemSelectable(item) {}
    }
  });
  qx.ui.core.ISingleSelectionProvider.$$dbClassInfo = $$dbClassInfo;
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

//# sourceMappingURL=part-boot-bundle-27.js.map
