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
      "qx.event.Timer": {},
      "qx.bom.element.Dimension": {},
      "qx.lang.Object": {},
      "qx.bom.element.Style": {}
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
   * Checks whether a given font is available on the document and fires events
   * accordingly.
   * 
   * This class does not need to be disposed, unless you want to abort the validation
   * early
   */
  qx.Class.define("qx.bom.webfonts.Validator", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param fontFamily {String} The name of the font to be verified
     * @param comparisonString {String?} String to be used to detect whether a font was loaded or not
     * whether the font has loaded properly
     */
    construct: function construct(fontFamily, comparisonString) {
      qx.core.Object.constructor.call(this);

      if (comparisonString) {
        this.setComparisonString(comparisonString);
      }

      if (fontFamily) {
        this.setFontFamily(fontFamily);
        this.__requestedHelpers = this._getRequestedHelpers();
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Sets of serif and sans-serif fonts to be used for size comparisons.
       * At least one of these fonts should be present on any system.
       */
      COMPARISON_FONTS: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        serif: ["Times New Roman", "Georgia", "serif"]
      },

      /**
       * Map of common CSS attributes to be used for all  size comparison elements
       */
      HELPER_CSS: {
        position: "absolute",
        margin: "0",
        padding: "0",
        top: "-1000px",
        left: "-1000px",
        fontSize: "350px",
        width: "auto",
        height: "auto",
        lineHeight: "normal",
        fontVariant: "normal",
        visibility: "hidden"
      },

      /**
       * The string to be used in the size comparison elements. This is the default string
       * which is used for the {@link #COMPARISON_FONTS} and the font to be validated. It
       * can be overridden for the font to be validated using the {@link #comparisonString}
       * property.
       */
      COMPARISON_STRING: "WEei",
      __defaultSizes: null,
      __defaultHelpers: null,

      /**
       * Removes the two common helper elements used for all size comparisons from
       * the DOM
       */
      removeDefaultHelperElements: function removeDefaultHelperElements() {
        var defaultHelpers = qx.bom.webfonts.Validator.__defaultHelpers;

        if (defaultHelpers) {
          for (var prop in defaultHelpers) {
            document.body.removeChild(defaultHelpers[prop]);
          }
        }

        delete qx.bom.webfonts.Validator.__defaultHelpers;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The font-family this validator should check
       */
      fontFamily: {
        nullable: true,
        init: null,
        apply: "_applyFontFamily"
      },

      /**
       * Comparison string used to check whether the font has loaded or not.
       */
      comparisonString: {
        nullable: true,
        init: null
      },

      /**
       * Time in milliseconds from the beginning of the check until it is assumed
       * that a font is not available
       */
      timeout: {
        check: "Integer",
        init: 5000
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the status of a web font has been determined. The event data
       * is a map with the keys "family" (the font-family name) and "valid"
       * (Boolean).
       */
      "changeStatus": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __requestedHelpers: null,
      __checkTimer: null,
      __checkStarted: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Validates the font
       */
      validate: function validate() {
        this.__checkStarted = new Date().getTime();

        if (this.__checkTimer) {
          this.__checkTimer.restart();
        } else {
          this.__checkTimer = new qx.event.Timer(100);

          this.__checkTimer.addListener("interval", this.__onTimerInterval, this); // Give the browser a chance to render the new elements


          qx.event.Timer.once(function () {
            this.__checkTimer.start();
          }, this, 0);
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROTECTED API
      ---------------------------------------------------------------------------
      */

      /**
       * Removes the helper elements from the DOM
       */
      _reset: function _reset() {
        if (this.__requestedHelpers) {
          for (var prop in this.__requestedHelpers) {
            var elem = this.__requestedHelpers[prop];
            document.body.removeChild(elem);
          }

          this.__requestedHelpers = null;
        }
      },

      /**
       * Checks if the font is available by comparing the widths of the elements
       * using the generic fonts to the widths of the elements using the font to
       * be validated
       *
       * @return {Boolean} Whether or not the font caused the elements to differ
       * in size
       */
      _isFontValid: function _isFontValid() {
        if (!qx.bom.webfonts.Validator.__defaultSizes) {
          this.__init();
        }

        if (!this.__requestedHelpers) {
          this.__requestedHelpers = this._getRequestedHelpers();
        } // force rerendering for chrome


        this.__requestedHelpers.sans.style.visibility = "visible";
        this.__requestedHelpers.sans.style.visibility = "hidden";
        this.__requestedHelpers.serif.style.visibility = "visible";
        this.__requestedHelpers.serif.style.visibility = "hidden";
        var requestedSans = qx.bom.element.Dimension.getWidth(this.__requestedHelpers.sans);
        var requestedSerif = qx.bom.element.Dimension.getWidth(this.__requestedHelpers.serif);
        var cls = qx.bom.webfonts.Validator;

        if (requestedSans !== cls.__defaultSizes.sans || requestedSerif !== cls.__defaultSizes.serif) {
          return true;
        }

        return false;
      },

      /**
       * Creates the two helper elements styled with the font to be checked
       *
       * @return {Map} A map with the keys <pre>sans</pre> and <pre>serif</pre>
       * and the created span elements as values
       */
      _getRequestedHelpers: function _getRequestedHelpers() {
        var fontsSans = [this.getFontFamily()].concat(qx.bom.webfonts.Validator.COMPARISON_FONTS.sans);
        var fontsSerif = [this.getFontFamily()].concat(qx.bom.webfonts.Validator.COMPARISON_FONTS.serif);
        return {
          sans: this._getHelperElement(fontsSans, this.getComparisonString()),
          serif: this._getHelperElement(fontsSerif, this.getComparisonString())
        };
      },

      /**
       * Creates a span element with the comparison text (either {@link #COMPARISON_STRING} or
       * {@link #comparisonString}) and styled with the default CSS ({@link #HELPER_CSS}) plus
       * the given font-family value and appends it to the DOM
       *
       * @param fontFamily {String} font-family string
       * @param comparisonString {String?} String to be used to detect whether a font was loaded or not
       * @return {Element} the created DOM element
       */
      _getHelperElement: function _getHelperElement(fontFamily, comparisonString) {
        var styleMap = qx.lang.Object.clone(qx.bom.webfonts.Validator.HELPER_CSS);

        if (fontFamily) {
          if (styleMap.fontFamily) {
            styleMap.fontFamily += "," + fontFamily.join(",");
          } else {
            styleMap.fontFamily = fontFamily.join(",");
          }
        }

        var elem = document.createElement("span");
        elem.innerHTML = comparisonString || qx.bom.webfonts.Validator.COMPARISON_STRING;
        qx.bom.element.Style.setStyles(elem, styleMap);
        document.body.appendChild(elem);
        return elem;
      },
      // property apply
      _applyFontFamily: function _applyFontFamily(value, old) {
        if (value !== old) {
          this._reset();
        }
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE API
      ---------------------------------------------------------------------------
      */

      /**
       * Creates the default helper elements and gets their widths
       */
      __init: function __init() {
        var cls = qx.bom.webfonts.Validator;

        if (!cls.__defaultHelpers) {
          cls.__defaultHelpers = {
            sans: this._getHelperElement(cls.COMPARISON_FONTS.sans),
            serif: this._getHelperElement(cls.COMPARISON_FONTS.serif)
          };
        }

        cls.__defaultSizes = {
          sans: qx.bom.element.Dimension.getWidth(cls.__defaultHelpers.sans),
          serif: qx.bom.element.Dimension.getWidth(cls.__defaultHelpers.serif)
        };
      },

      /**
       * Triggers helper element size comparison and fires a ({@link #changeStatus})
       * event with the result.
       */
      __onTimerInterval: function __onTimerInterval() {
        if (this._isFontValid()) {
          this.__checkTimer.stop();

          this._reset();

          this.fireDataEvent("changeStatus", {
            family: this.getFontFamily(),
            valid: true
          });
        } else {
          var now = new Date().getTime();

          if (now - this.__checkStarted >= this.getTimeout()) {
            this.__checkTimer.stop();

            this._reset();

            this.fireDataEvent("changeStatus", {
              family: this.getFontFamily(),
              valid: false
            });
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
      this._reset();

      this.__checkTimer.stop();

      this.__checkTimer.removeListener("interval", this.__onTimerInterval, this);

      this._disposeObjects("__checkTimer");
    }
  });
  qx.bom.webfonts.Validator.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.core.ObjectRegistry": {
        "construct": true
      },
      "qx.lang.Type": {},
      "qx.util.Request": {},
      "qx.bom.request.Xhr": {},
      "qx.util.Uri": {},
      "qx.lang.Function": {},
      "qx.util.ResponseParser": {},
      "qx.lang.Json": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.debug.io": {}
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
   * This class is internal because it's tailored to {@link qx.io.rest.Resource}
   * which needs more functionality than {@link qx.bom.request.Xhr} provides.
   * The usage of {@link qx.io.request.Xhr} isn't possible either due to it's qx.Class nature.
   *
   * For alternatives to this class have a look at:
   *
   * * "qx.bom.request.Xhr" (low level, cross-browser XHR abstraction compatible with spec)
   * * "qx.io.request.Xhr" (high level XHR abstraction)
   *
   * A wrapper of {@link qx.bom.request.Xhr} which offers:
   *
   * * set/get HTTP method, URL, request data and headers
   * * retrieve the parsed response as object (content-type recognition)
   * * more fine-grained events such as success, fail, ...
   * * supports hash code for request identification
   *
   * It does *not* comply the interface defined by {@link qx.bom.request.IRequest}.
   *
   * <div class="desktop">
   * Example:
   *
   * <pre class="javascript">
   *  var req = new qx.bom.request.SimpleXhr("/some/path/file.json");
   *  req.setRequestData({"a":"b"});
   *  req.once("success", function successHandler() {
   *    var response = req.getResponse();
   *  }, this);
   *  req.once("fail", function successHandler() {
   *    var response = req.getResponse();
   *  }, this);
   *  req.send();
   * </pre>
   * </div>
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.request.SimpleXhr", {
    extend: qx.event.Emitter,
    implement: [qx.core.IDisposable],

    /**
     * @param url {String?} The URL of the resource to request.
     * @param method {String?"GET"} The HTTP method.
     */
    construct: function construct(url, method) {
      if (url !== undefined) {
        this.setUrl(url);
      }

      this.useCaching(true);
      this.setMethod(method !== undefined ? method : "GET");
      this._transport = this._registerTransportListener(this._createTransport());
      qx.core.ObjectRegistry.register(this);
      this.__requestHeaders = {};
      this.__parser = this._createResponseParser();
    },
    members: {
      /*
      ---------------------------------------------------------------------------
        PUBLIC
      ---------------------------------------------------------------------------
      */

      /**
       * Sets a request header.
       *
       * @param key {String} Key of the header.
       * @param value {String} Value of the header.
       * @return {qx.bom.request.SimpleXhr} Self for chaining.
       */
      setRequestHeader: function setRequestHeader(key, value) {
        this.__requestHeaders[key] = value;
        return this;
      },

      /**
       * Gets a request header.
       *
       * @param key {String} Key of the header.
       * @return {String} The value of the header.
       */
      getRequestHeader: function getRequestHeader(key) {
        return this.__requestHeaders[key];
      },

      /**
       * Returns a single response header
       *
       * @param header {String} Name of the header to get.
       * @return {String} Response header
       */
      getResponseHeader: function getResponseHeader(header) {
        return this._transport.getResponseHeader(header);
      },

      /**
       * Returns all response headers
       * @return {String} String of response headers
       */
      getAllResponseHeaders: function getAllResponseHeaders() {
        return this._transport.getAllResponseHeaders();
      },

      /**
       * Sets the URL.
       *
       * @param url {String} URL to be requested.
       * @return {qx.bom.request.SimpleXhr} Self for chaining.
       */
      setUrl: function setUrl(url) {
        if (qx.lang.Type.isString(url)) {
          this.__url = url;
        }

        return this;
      },

      /**
       * Gets the URL.
       *
       * @return {String} URL to be requested.
       */
      getUrl: function getUrl() {
        return this.__url;
      },

      /**
       * Sets the HTTP-Method.
       *
       * @param method {String} The method.
       * @return {qx.bom.request.SimpleXhr} Self for chaining.
       */
      setMethod: function setMethod(method) {
        if (qx.util.Request.isMethod(method)) {
          this.__method = method;
        }

        return this;
      },

      /**
       * Gets the HTTP-Method.
       *
       * @return {String} The method.
       */
      getMethod: function getMethod() {
        return this.__method;
      },

      /**
       * Sets the request data to be send as part of the request.
       *
       * The request data is transparently included as URL query parameters or embedded in the
       * request body as form data.
       *
       * @param data {String|Object} The request data.
       * @return {qx.bom.request.SimpleXhr} Self for chaining.
       */
      setRequestData: function setRequestData(data) {
        if (qx.lang.Type.isString(data) || qx.lang.Type.isObject(data) || ["ArrayBuffer", "Blob", "FormData"].indexOf(qx.lang.Type.getClass(data)) !== -1) {
          this.__requestData = data;
        }

        return this;
      },

      /**
       * Gets the request data.
       *
       * @return {String} The request data.
       */
      getRequestData: function getRequestData() {
        return this.__requestData;
      },

      /**
       * Gets parsed response.
       *
       * If problems occurred an empty string ("") is more likely to be returned (instead of null).
       *
       * @return {String|null} The parsed response of the request.
       */
      getResponse: function getResponse() {
        if (this.__response !== null) {
          return this.__response;
        } else {
          return this._transport.responseXML !== null ? this._transport.responseXML : this._transport.responseText;
        }

        return null;
      },

      /**
       * Gets low-level transport.
       *
       * Note: To be used with caution!
       *
       * This method can be used to query the transport directly,
       * but should be used with caution. Especially, it
       * is not advisable to call any destructive methods
       * such as <code>open</code> or <code>send</code>.
       *
       * @return {Object} An instance of a class found in
       *  <code>qx.bom.request.*</code>
       */
      // This method mainly exists so that some methods found in the
      // low-level transport can be deliberately omitted here,
      // but still be accessed should it be absolutely necessary.
      //
      // Valid use cases include to query the transport’s responseXML
      // property if performance is critical and any extra parsing
      // should be avoided at all costs.
      //
      getTransport: function getTransport() {
        return this._transport;
      },

      /**
       * Sets (i.e. override) the parser for the response parsing.
       *
       * @see qx.util.ResponseParser#setParser
       *
       * @param parser {String|Function}
       * @return {Function} The parser function
       */
      setParser: function setParser(parser) {
        return this.__parser.setParser(parser);
      },

      /**
       * Sets the timout limit in milliseconds.
       *
       * @param millis {Number} limit in milliseconds.
       * @return {qx.bom.request.SimpleXhr} Self for chaining.
       */
      setTimeout: function setTimeout(millis) {
        if (qx.lang.Type.isNumber(millis)) {
          this.__timeout = millis;
        }

        return this;
      },

      /**
       * The current timeout in milliseconds.
       *
       * @return {Number} The current timeout in milliseconds.
       */
      getTimeout: function getTimeout() {
        return this.__timeout;
      },

      /**
       * Whether to allow request to be answered from cache.
       *
       * Allowed values:
       *
       * * <code>true</code>: Allow caching (Default)
       * * <code>false</code>: Prohibit caching. Appends 'nocache' parameter to URL.
       *
       * Consider setting a Cache-Control header instead. A request’s Cache-Control
       * header may contain a number of directives controlling the behavior of
       * any caches in between client and origin server and allows therefore a more
       * fine grained control over caching. If such a header is provided, the setting
       * of setCache() will be ignored.
       *
       * * <code>"no-cache"</code>: Force caches to submit request in order to
       * validate the freshness of the representation. Note that the requested
       * resource may still be served from cache if the representation is
       * considered fresh. Use this directive to ensure freshness but save
       * bandwidth when possible.
       * * <code>"no-store"</code>: Do not keep a copy of the representation under
       * any conditions.
       *
       * See <a href="http://www.mnot.net/cache_docs/#CACHE-CONTROL">
       * Caching tutorial</a> for an excellent introduction to Caching in general.
       * Refer to the corresponding section in the
       * <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9">
       * HTTP 1.1 specification</a> for more details and advanced directives.
       *
       * It is recommended to choose an appropriate Cache-Control directive rather
       * than prohibit caching using the nocache parameter.
       *
       * @param value {Boolean}
       * @return {qx.bom.request.SimpleXhr} Self for chaining.
       */
      useCaching: function useCaching(value) {
        if (qx.lang.Type.isBoolean(value)) {
          this.__cache = value;
        }

        return this;
      },

      /**
       * Whether requests are cached.
       *
       * @return {Boolean} Whether requests are cached.
       */
      isCaching: function isCaching() {
        return this.__cache;
      },

      /**
       * Whether request completed (is done).
        * @return {Boolean} Whether request is completed.
       */
      isDone: function isDone() {
        return this._transport.readyState === qx.bom.request.Xhr.DONE;
      },

      /**
       * Returns unique hash code of object.
       *
       * @return {Integer} unique hash code of the object
       */
      toHashCode: function toHashCode() {
        return this.$$hash;
      },

      /**
       * Returns true if the object is disposed.
       *
       * @return {Boolean} Whether the object has been disposed
       */
      isDisposed: function isDisposed() {
        return !!this.__disposed;
      },

      /**
       * Sends request.
       *
       * Relies on set before:
       * * a HTTP method
       * * an URL
       * * optional request headers
       * * optional request data
       */
      send: function send() {
        var curTimeout = this.getTimeout(),
            hasRequestData = this.getRequestData() !== null,
            hasCacheControlHeader = this.__requestHeaders.hasOwnProperty("Cache-Control"),
            isBodyForMethodAllowed = qx.util.Request.methodAllowsRequestBody(this.getMethod()),
            curContentType = this.getRequestHeader("Content-Type"),
            serializedData = this._serializeData(this.getRequestData(), curContentType); // add GET params if needed


        if (this.getMethod() === "GET" && hasRequestData) {
          this.setUrl(qx.util.Uri.appendParamsToUrl(this.getUrl(), serializedData));
        } // cache prevention


        if (this.isCaching() === false && !hasCacheControlHeader) {
          // Make sure URL cannot be served from cache and new request is made
          this.setUrl(qx.util.Uri.appendParamsToUrl(this.getUrl(), {
            nocache: new Date().valueOf()
          }));
        } // set timeout


        if (curTimeout) {
          this._transport.timeout = curTimeout;
        } // initialize request


        this._transport.open(this.getMethod(), this.getUrl(), true); // set all previously stored headers on initialized request


        for (var key in this.__requestHeaders) {
          this._transport.setRequestHeader(key, this.__requestHeaders[key]);
        } // send


        if (!isBodyForMethodAllowed) {
          // GET & HEAD
          this._transport.send();
        } else {
          // POST & PUT ...
          if (typeof curContentType === "undefined" && ["ArrayBuffer", "Blob", "FormData"].indexOf(qx.Bootstrap.getClass(serializedData)) === -1) {
            // by default, set content-type urlencoded for requests with body
            this._transport.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          }

          this._transport.send(serializedData);
        }
      },

      /**
       * Aborts request.
       *
       * Cancels any network activity.
       * @return {qx.bom.request.SimpleXhr} Self for chaining.
       */
      abort: function abort() {
        this._transport.abort();

        return this;
      },

      /**
       * Disposes object and wrapped transport.
       * @return {Boolean} <code>true</code> if the object was successfully disposed
       */
      dispose: function dispose() {
        if (this._transport.dispose()) {
          this.__parser = null;
          this.__disposed = true;
          return true;
        }

        return false;
      },

      /*
      ---------------------------------------------------------------------------
        PROTECTED
      ---------------------------------------------------------------------------
      */

      /**
       * Holds transport.
       */
      _transport: null,

      /**
       * Creates XHR transport.
       *
       * May be overridden to change type of resource.
       * @return {qx.bom.request.IRequest} Transport.
       */
      _createTransport: function _createTransport() {
        return new qx.bom.request.Xhr();
      },

      /**
       * Registers common listeners on given transport.
       *
       * @param transport {qx.bom.request.IRequest} Transport.
       * @return {qx.bom.request.IRequest} Transport.
       */
      _registerTransportListener: function _registerTransportListener(transport) {
        transport.onreadystatechange = qx.lang.Function.bind(this._onReadyStateChange, this);
        transport.onloadend = qx.lang.Function.bind(this._onLoadEnd, this);
        transport.ontimeout = qx.lang.Function.bind(this._onTimeout, this);
        transport.onerror = qx.lang.Function.bind(this._onError, this);
        transport.onabort = qx.lang.Function.bind(this._onAbort, this);
        transport.onprogress = qx.lang.Function.bind(this._onProgress, this);
        return transport;
      },

      /**
       * Creates response parser.
       *
       * @return {qx.util.ResponseParser} parser.
       */
      _createResponseParser: function _createResponseParser() {
        return new qx.util.ResponseParser();
      },

      /**
       * Sets the response.
       *
       * @param response {String} The parsed response of the request.
       */
      _setResponse: function _setResponse(response) {
        this.__response = response;
      },

      /**
       * Serializes data.
       *
       * @param data {String|Map} Data to serialize.
       * @param contentType {String?} Content-Type which influences the serialization.
       * @return {String|null} Serialized data.
       */
      _serializeData: function _serializeData(data, contentType) {
        var isPost = this.getMethod() === "POST",
            isJson = /application\/.*\+?json/.test(contentType);

        if (!data) {
          return null;
        }

        if (qx.lang.Type.isString(data)) {
          return data;
        }

        if (isJson && (qx.lang.Type.isObject(data) || qx.lang.Type.isArray(data))) {
          return qx.lang.Json.stringify(data);
        }

        if (qx.lang.Type.isObject(data)) {
          return qx.util.Uri.toParameter(data, isPost);
        }

        if (["ArrayBuffer", "Blob", "FormData"].indexOf(qx.Bootstrap.getClass(data)) !== -1) {
          return data;
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE
      ---------------------------------------------------------------------------
      */

      /**
       * {Array} Request headers.
       */
      __requestHeaders: null,

      /**
       * {Object} Request data (i.e. body).
       */
      __requestData: null,

      /**
       * {String} HTTP method to use for request.
       */
      __method: "",

      /**
       * {String} Requested URL.
       */
      __url: "",

      /**
       * {Object} Response data.
       */
      __response: null,

      /**
       * {Function} Parser.
       */
      __parser: null,

      /**
       * {Boolean} Whether caching will be enabled.
       */
      __cache: null,

      /**
       * {Number} The current timeout in milliseconds.
       */
      __timeout: null,

      /**
       * {Boolean} Whether object has been disposed.
       */
      __disposed: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Adds an event listener for the given event name which is executed only once.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function to execute when the event is fired
       * @param ctx {var?} The context of the listener.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      addListenerOnce: function addListenerOnce(name, listener, ctx) {
        this.once(name, listener, ctx);
        return this;
      },

      /**
       * Adds an event listener for the given event name.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function to execute when the event is fired
       * @param ctx {var?} The context of the listener.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      addListener: function addListener(name, listener, ctx) {
        this._transport._emitter.on(name, listener, ctx);

        return this;
      },

      /**
       * Handles "readyStateChange" event.
       */
      _onReadyStateChange: function _onReadyStateChange() {
        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug("Fire readyState: " + this._transport.readyState);
        }

        if (this.isDone()) {
          this.__onReadyStateDone();
        }
      },

      /**
       * Called internally when readyState is DONE.
       */
      __onReadyStateDone: function __onReadyStateDone() {
        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug("Request completed with HTTP status: " + this._transport.status);
        }

        var response = this._transport.responseText;

        var contentType = this._transport.getResponseHeader("Content-Type"); // Successful HTTP status


        if (qx.util.Request.isSuccessful(this._transport.status)) {
          // Parse response
          if (qx.core.Environment.get("qx.debug.io")) {
            qx.Bootstrap.debug("Response is of type: '" + contentType + "'");
          }

          this._setResponse(this.__parser.parse(response, contentType));

          this.emit("success"); // Erroneous HTTP status
        } else {
          try {
            this._setResponse(this.__parser.parse(response, contentType));
          } catch (e) {} // ignore if it does not work
          // A remote error failure


          if (this._transport.status !== 0) {
            this.emit("fail");
          }
        }
      },

      /**
       * Handles "loadEnd" event.
       */
      _onLoadEnd: function _onLoadEnd() {
        this.emit("loadEnd");
      },

      /**
       * Handles "abort" event.
       */
      _onAbort: function _onAbort() {
        this.emit("abort");
      },

      /**
       * Handles "timeout" event.
       */
      _onTimeout: function _onTimeout() {
        this.emit("timeout"); // A network error failure

        this.emit("fail");
      },

      /**
       * Handles "error" event.
       */
      _onError: function _onError() {
        this.emit("error"); // A network error failure

        this.emit("fail");
      },

      /**
       * Handles "error" event.
       */
      _onProgress: function _onProgress() {
        this.emit("progress");
      }
    }
  });
  qx.bom.request.SimpleXhr.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {},
      "qx.lang.Object": {},
      "qx.dom.Element": {},
      "qx.lang.Type": {},
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * jQuery
       http://jquery.com
       Version 1.3.1
  
       Copyright:
         2009 John Resig
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
  ************************************************************************ */

  /**
   * Cross browser abstractions to work with input elements.
   */
  qx.Bootstrap.define("qx.bom.Input", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} Internal data structures with all supported input types */
      __types: {
        text: 1,
        textarea: 1,
        select: 1,
        checkbox: 1,
        radio: 1,
        password: 1,
        hidden: 1,
        submit: 1,
        image: 1,
        file: 1,
        search: 1,
        reset: 1,
        button: 1
      },

      /**
       * Creates an DOM input/textarea/select element.
       *
       * Attributes may be given directly with this call. This is critical
       * for some attributes e.g. name, type, ... in many clients.
       *
       * Note: <code>select</code> and <code>textarea</code> elements are created
       * using the identically named <code>type</code>.
       *
       * @param type {String} Any valid type for HTML, <code>select</code>
       *   and <code>textarea</code>
       * @param attributes {Map} Map of attributes to apply
       * @param win {Window} Window to create the element for
       * @return {Element} The created input node
       */
      create: function create(type, attributes, win) {
        {
          qx.core.Assert.assertKeyInMap(type, this.__types, "Unsupported input type.");
        } // Work on a copy to not modify given attributes map

        var attributes = attributes ? qx.lang.Object.clone(attributes) : {};
        var tag;

        if (type === "textarea" || type === "select") {
          tag = type;
        } else {
          tag = "input";
          attributes.type = type;
        }

        return qx.dom.Element.create(tag, attributes, win);
      },

      /**
       * Applies the given value to the element.
       *
       * Normally the value is given as a string/number value and applied
       * to the field content (textfield, textarea) or used to
       * detect whether the field is checked (checkbox, radiobutton).
       *
       * Supports array values for selectboxes (multiple-selection)
       * and checkboxes or radiobuttons (for convenience).
       *
       * Please note: To modify the value attribute of a checkbox or
       * radiobutton use {@link qx.bom.element.Attribute#set} instead.
       *
       * @param element {Element} element to update
       * @param value {String|Number|Array} the value to apply
       */
      setValue: function setValue(element, value) {
        var tag = element.nodeName.toLowerCase();
        var type = element.type;
        var Type = qx.lang.Type;

        if (typeof value === "number") {
          value += "";
        }

        if (type === "checkbox" || type === "radio") {
          if (Type.isArray(value)) {
            element.checked = value.includes(element.value);
          } else {
            element.checked = element.value == value;
          }
        } else if (tag === "select") {
          var isArray = Type.isArray(value);
          var options = element.options;
          var subel, subval;

          for (var i = 0, l = options.length; i < l; i++) {
            subel = options[i];
            subval = subel.getAttribute("value");

            if (subval == null) {
              subval = subel.text;
            }

            subel.selected = isArray ? value.includes(subval) : value == subval;
          }

          if (isArray && value.length == 0) {
            element.selectedIndex = -1;
          }
        } else if ((type === "text" || type === "textarea") && qx.core.Environment.get("engine.name") == "mshtml") {
          // These flags are required to detect self-made property-change
          // events during value modification. They are used by the Input
          // event handler to filter events.
          element.$$inValueSet = true;
          element.value = value;
          element.$$inValueSet = null;
        } else {
          element.value = value;
        }
      },

      /**
       * Returns the currently configured value.
       *
       * Works with simple input fields as well as with
       * select boxes or option elements.
       *
       * Returns an array in cases of multi-selection in
       * select boxes but in all other cases a string.
       *
       * @param element {Element} DOM element to query
       * @return {String|Array} The value of the given element
       */
      getValue: function getValue(element) {
        var tag = element.nodeName.toLowerCase();

        if (tag === "option") {
          return (element.attributes.value || {}).specified ? element.value : element.text;
        }

        if (tag === "select") {
          var index = element.selectedIndex; // Nothing was selected

          if (index < 0) {
            return null;
          }

          var values = [];
          var options = element.options;
          var one = element.type == "select-one";
          var clazz = qx.bom.Input;
          var value; // Loop through all the selected options

          for (var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++) {
            var option = options[i];

            if (option.selected) {
              // Get the specific value for the option
              value = clazz.getValue(option); // We don't need an array for one selects

              if (one) {
                return value;
              } // Multi-Selects return an array


              values.push(value);
            }
          }

          return values;
        } else {
          return (element.value || "").replace(/\r/g, "");
        }
      },

      /**
       * Sets the text wrap behaviour of a text area element.
       * This property uses the attribute "wrap" respectively
       * the style property "whiteSpace"
       *
       * @signature function(element, wrap)
       * @param element {Element} DOM element to modify
       * @param wrap {Boolean} Whether to turn text wrap on or off.
       */
      setWrap: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element, wrap) {
          var wrapValue = wrap ? "soft" : "off"; // Explicitly set overflow-y CSS property to auto when wrapped,
          // allowing the vertical scroll-bar to appear if necessary

          var styleValue = wrap ? "auto" : "";
          element.wrap = wrapValue;
          element.style.overflowY = styleValue;
        },
        "gecko": function gecko(element, wrap) {
          var wrapValue = wrap ? "soft" : "off";
          var styleValue = wrap ? "" : "auto";
          element.setAttribute("wrap", wrapValue);
          element.style.overflow = styleValue;
        },
        "webkit": function webkit(element, wrap) {
          var wrapValue = wrap ? "soft" : "off";
          var styleValue = wrap ? "" : "auto";
          element.setAttribute("wrap", wrapValue);
          element.style.overflow = styleValue;
        },
        "default": function _default(element, wrap) {
          element.style.whiteSpace = wrap ? "normal" : "nowrap";
        }
      })
    }
  });
  qx.bom.Input.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.MenuButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.toolbar.ToolBar": {},
      "qx.ui.menu.Manager": {}
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
   * A menubar button
   */
  qx.Class.define("qx.ui.menubar.Button", {
    extend: qx.ui.form.MenuButton,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct(label, icon, menu) {
      qx.ui.form.MenuButton.constructor.call(this, label, icon, menu);
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
        init: "menubar-button"
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

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Inspects the parent chain to find the MenuBar
       *
       * @return {qx.ui.menubar.MenuBar} MenuBar instance or <code>null</code>.
       */
      getMenuBar: function getMenuBar() {
        var parent = this;

        while (parent) {
          /* this method is also used by toolbar.MenuButton, so we need to check
             for a ToolBar instance. */
          if (parent instanceof qx.ui.toolbar.ToolBar) {
            return parent;
          }

          parent = parent.getLayoutParent();
        }

        return null;
      },
      // overridden
      open: function open(selectFirst) {
        qx.ui.menubar.Button.prototype.open.base.call(this, selectFirst);
        var menubar = this.getMenuBar();

        if (menubar) {
          menubar._setAllowMenuOpenHover(true);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener for visibility property changes of the attached menu
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onMenuChange: function _onMenuChange(e) {
        var menu = this.getMenu();
        var menubar = this.getMenuBar();

        if (menu.isVisible()) {
          this.addState("pressed"); // Sync with open menu property

          if (menubar) {
            menubar.setOpenMenu(menu);
          }
        } else {
          this.removeState("pressed"); // Sync with open menu property

          if (menubar && menubar.getOpenMenu() == menu) {
            menubar.resetOpenMenu();

            menubar._setAllowMenuOpenHover(false);
          }
        }
      },
      // overridden
      _onPointerUp: function _onPointerUp(e) {
        qx.ui.menubar.Button.prototype._onPointerUp.base.call(this, e); // Set state 'pressed' to visualize that the menu is open.


        var menu = this.getMenu();

        if (menu && menu.isVisible() && !this.hasState("pressed")) {
          this.addState("pressed");
        }
      },

      /**
       * Event listener for pointerover event
       *
       * @param e {qx.event.type.Pointer} pointerover event object
       */
      _onPointerOver: function _onPointerOver(e) {
        // Add hovered state
        this.addState("hovered"); // Open submenu

        if (this.getMenu() && e.getPointerType() == "mouse") {
          var menubar = this.getMenuBar();

          if (menubar && menubar._isAllowMenuOpenHover()) {
            // Hide all open menus
            qx.ui.menu.Manager.getInstance().hideAll(); // Set it again, because hideAll remove it.

            menubar._setAllowMenuOpenHover(true); // Then show the attached menu


            if (this.isEnabled()) {
              this.open();
            }
          }
        }
      }
    }
  });
  qx.ui.menubar.Button.$$dbClassInfo = $$dbClassInfo;
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
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The HoverButton is an {@link qx.ui.basic.Atom}, which fires repeatedly
   * execute events while the pointer is over the widget.
   *
   * The rate at which the execute event is fired accelerates is the pointer keeps
   * inside of the widget. The initial delay and the interval time can be set using
   * the properties {@link #firstInterval} and {@link #interval}. The
   * {@link #execute} events will be fired in a shorter amount of time if the pointer
   * remains over the widget, until the min {@link #minTimer} is reached.
   * The {@link #timerDecrease} property sets the amount of milliseconds which will
   * decreased after every firing.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.HoverButton("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button is hovered");
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
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/hoverbutton.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.HoverButton", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     */
    construct: function construct(label, icon) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);
      this.addListener("pointerover", this._onPointerOver, this);
      this.addListener("pointerout", this._onPointerOut, this);
      this.__timer = new qx.event.AcceleratingTimer();

      this.__timer.addListener("interval", this._onInterval, this);
    },
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "hover-button"
      },

      /**
       * Interval used after the first run of the timer. Usually a smaller value
       * than the "firstInterval" property value to get a faster reaction.
       */
      interval: {
        check: "Integer",
        init: 80
      },

      /**
       * Interval used for the first run of the timer. Usually a greater value
       * than the "interval" property value to a little delayed reaction at the first
       * time.
       */
      firstInterval: {
        check: "Integer",
        init: 200
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
      __timer: null,

      /**
       * Start timer on pointer over
       *
       * @param e {qx.event.type.Pointer} The pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        this.__timer.set({
          interval: this.getInterval(),
          firstInterval: this.getFirstInterval(),
          minimum: this.getMinTimer(),
          decrease: this.getTimerDecrease()
        }).start();

        this.addState("hovered");
      },

      /**
       * Stop timer on pointer out
       *
       * @param e {qx.event.type.Pointer} The pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        this.__timer.stop();

        this.removeState("hovered");

        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }
      },

      /**
       * Fire execute event on timer interval event
       */
      _onInterval: function _onInterval() {
        if (this.isEnabled()) {
          this.execute();
        } else {
          this.__timer.stop();
        }
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__timer");
    }
  });
  qx.ui.form.HoverButton.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MRemoteLayoutHandling": {
        "require": true
      },
      "qx.ui.core.MContentPadding": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.basic.Atom": {}
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
   * Group boxes are used to group a set of form elements.
   *
   * @childControl frame {qx.ui.container.Composite} frame for the content widgets
   * @childControl legend {qx.ui.basic.Atom} legend to show at top of the groupbox
   */
  qx.Class.define("qx.ui.groupbox.GroupBox", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MRemoteLayoutHandling, qx.ui.core.MContentPadding, qx.ui.form.MForm],
    implement: [qx.ui.form.IForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param legend {String?""} The group boxes legend
     * @param icon {String?""} The icon of the legend
     */
    construct: function construct(legend, icon) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Canvas()); // Sub widgets


      this._createChildControl("frame");

      this._createChildControl("legend"); // Processing parameters


      if (legend != null) {
        this.setLegend(legend);
      }

      if (icon != null) {
        this.setIcon(icon);
      }
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
        init: "groupbox"
      },

      /**
       * Label of the legend sub widget. Set if the given string is
       * valid. Otherwise the legend sub widget is not being displayed.
       */
      legend: {
        check: "String",
        apply: "_applyLegend",
        event: "changeLegend",
        nullable: true
      },

      /**
       * Property for setting the position of the legend.
       */
      legendPosition: {
        check: ["top", "middle"],
        init: "middle",
        apply: "_applyLegendPosition",
        themeable: true
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
        invalid: true
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "frame":
            control = new qx.ui.container.Composite();

            this._add(control, {
              left: 0,
              top: 6,
              right: 0,
              bottom: 0
            });

            break;

          case "legend":
            control = new qx.ui.basic.Atom();
            control.addListener("resize", this._repositionFrame, this);

            this._add(control, {
              left: 0,
              right: 0
            });

            break;
        }

        return control || qx.ui.groupbox.GroupBox.prototype._createChildControlImpl.base.call(this, id);
      },

      /**
       * Returns the element, to which the content padding should be applied.
       *
       * @return {qx.ui.core.Widget} The content padding target.
       */
      _getContentPaddingTarget: function _getContentPaddingTarget() {
        return this.getChildControl("frame");
      },

      /*
      ---------------------------------------------------------------------------
        LEGEND HANDLING
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyLegend: function _applyLegend(value, old) {
        var control = this.getChildControl("legend");

        if (value !== null) {
          control.setLabel(value);
          control.show();
        } else {
          control.exclude();
        }
      },

      /**
       * Apply method for applying the legend position. It calls the
       * {@link #_repositionFrame} method.
       */
      _applyLegendPosition: function _applyLegendPosition(e) {
        if (this.getChildControl("legend").getBounds()) {
          this._repositionFrame();
        }
      },

      /**
       * Repositions the frame of the group box dependent on the
       * {@link #legendPosition} property.
       */
      _repositionFrame: function _repositionFrame() {
        var legend = this.getChildControl("legend");
        var frame = this.getChildControl("frame"); // get the current height of the legend

        var height = legend.getBounds().height; // check for the property legend position

        if (this.getLegendPosition() == "middle") {
          frame.setLayoutProperties({
            "top": Math.round(height / 2)
          });
        } else if (this.getLegendPosition() == "top") {
          frame.setLayoutProperties({
            "top": height
          });
        }
      },

      /*
      ---------------------------------------------------------------------------
        GETTER FOR SUB WIDGETS
      ---------------------------------------------------------------------------
      */

      /**
       * The children container needed by the {@link qx.ui.core.MRemoteChildrenHandling}
       * mixin
       *
       * @return {qx.ui.container.Composite} pane sub widget
       */
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("frame");
      },

      /*
      ---------------------------------------------------------------------------
        SETTER/GETTER
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the icon of the legend sub widget.
       *
       * @param icon {String} source of the new icon of the legend sub widget
       */
      setIcon: function setIcon(icon) {
        this.getChildControl("legend").setIcon(icon);
      },

      /**
       * Accessor method for the icon of the legend sub widget
       *
       * @return {String} source of the new icon of the legend sub widget
       */
      getIcon: function getIcon() {
        return this.getChildControl("legend").getIcon();
      }
    }
  });
  qx.ui.groupbox.GroupBox.$$dbClassInfo = $$dbClassInfo;
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This interface defines the necessary features a form renderer should have.
   * Keep in mind that all renderes has to be widgets.
   */
  qx.Interface.define("qx.ui.form.renderer.IFormRenderer", {
    members: {
      /**
       * Add a group of form items with the corresponding names. The names should
       * be displayed as hint for the user what to do with the form item.
       * The title is optional and can be used as grouping for the given form
       * items.
       *
       * @param items {qx.ui.core.Widget[]} An array of form items to render.
       * @param names {String[]} An array of names for the form items.
       * @param title {String?} A title of the group you are adding.
       * @param itemsOptions {Array?null} The added additional data.
       * @param headerOptions {Map?null} The options map as defined by the form
       *   for the current group header.
       */
      addItems: function addItems(items, names, title, itemsOptions, headerOptions) {},

      /**
       * Adds a button the form renderer.
       *
       * @param button {qx.ui.form.Button} A button which should be added to
       *   the form.
       * @param options {Map?null} The added additional data.
       */
      addButton: function addButton(button, options) {}
    }
  });
  qx.ui.form.renderer.IFormRenderer.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.renderer.IFormRenderer": {
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
   * Abstract renderer for {@link qx.ui.form.Form}. This abstract renderer should
   * be the superclass of all form renderer. It takes the form, which is
   * supplied as constructor parameter and configures itself. So if you need to
   * set some additional information on your renderer before adding the widgets,
   * be sure to do that before calling this.base(arguments, form).
   */
  qx.Class.define("qx.ui.form.renderer.AbstractRenderer", {
    type: "abstract",
    extend: qx.ui.core.Widget,
    implement: qx.ui.form.renderer.IFormRenderer,

    /**
     * @param form {qx.ui.form.Form} The form to render.
     */
    construct: function construct(form) {
      qx.ui.core.Widget.constructor.call(this);
      this._labels = []; // translation support

      {
        qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
        this._names = [];
      }
      this._form = form;

      this._render();

      form.addListener("change", this._onFormChange, this);
    },
    properties: {
      /**
       * A string that is appended to the label if it is not empty.
       * Defaults to " :"
       */
      labelSuffix: {
        check: "String",
        init: " :",
        event: "changeLabelSuffix",
        nullable: true
      },

      /**
       * A string that is appended to the label and the label suffix if the corresponding
       * form field is mandatory. Defaults to space plus a red asterisk.
       */
      requiredSuffix: {
        check: "String",
        init: " <span style='color:red'>*</span> ",
        event: "changeRequiredSuffix",
        nullable: false
      }
    },
    members: {
      _names: null,
      _form: null,
      _labels: null,

      /**
       * Renders the form: adds the items and buttons.
       */
      _render: function _render() {
        // add the groups
        var groups = this._form.getGroups();

        for (var i = 0; i < groups.length; i++) {
          var group = groups[i];
          this.addItems(group.items, group.labels, group.title, group.options, group.headerOptions);
        } // add the buttons


        var buttons = this._form.getButtons();

        var buttonOptions = this._form.getButtonOptions();

        for (var i = 0; i < buttons.length; i++) {
          this.addButton(buttons[i], buttonOptions[i]);
        }
      },

      /**
       * Handler responsible for updating the rendered widget as soon as the
       * form changes.
       */
      _onFormChange: function _onFormChange() {
        this._removeAll(); // remove all created labels


        for (var i = 0; i < this._labels.length; i++) {
          this._labels[i].dispose();
        }

        this._labels = [];

        this._render();
      },

      /**
       * Helper to bind the item's visibility to the label's visibility.
       * @param item {qx.ui.core.Widget} The form element.
       * @param label {qx.ui.basic.Label} The label for the form element.
       */
      _connectVisibility: function _connectVisibility(item, label) {
        // map the items visibility to the label
        item.bind("visibility", label, "visibility");
      },

      /**
       * Locale change event handler
       *
       * @signature function(e)
       * @param e {Event} the change event
       */
      _onChangeLocale: function _onChangeLocale(e) {
        for (var i = 0; i < this._names.length; i++) {
          var entry = this._names[i];

          if (entry.name && entry.name.translate) {
            entry.name = entry.name.translate();
          }

          var newText = this._createLabelText(entry.name, entry.item);

          entry.label.setValue(newText);
        }
      },

      /**
       * Creates the label text for the given form item.
       *
       * @param name {String} The content of the label without the
       *   trailing * and :
       * @param item {qx.ui.form.IForm} The item, which has the required state.
       * @return {String} The text for the given item.
       */
      _createLabelText: function _createLabelText(name, item) {
        var requiredSuffix = "";

        if (item.getRequired()) {
          requiredSuffix = this.getRequiredSuffix();
        } // Create the label. Append a suffix only if there's text to display.


        var labelSuffix = name.length > 0 || item.getRequired() ? this.getLabelSuffix() : "";
        return name + requiredSuffix + labelSuffix;
      },
      // interface implementation
      addItems: function addItems(items, names, title) {
        throw new Error("Abstract method call");
      },
      // interface implementation
      addButton: function addButton(button) {
        throw new Error("Abstract method call");
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      }
      this._names = null;

      this._form.removeListener("change", this._onFormChange, this);

      this._form = null;
    }
  });
  qx.ui.form.renderer.AbstractRenderer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.renderer.AbstractRenderer": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Grid": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.basic.Label": {}
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
   * Single column renderer for {@link qx.ui.form.Form}.
   */
  qx.Class.define("qx.ui.form.renderer.Single", {
    extend: qx.ui.form.renderer.AbstractRenderer,
    construct: function construct(form) {
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(6);
      layout.setColumnFlex(1, 1);
      layout.setColumnAlign(0, "right", "top");

      this._setLayout(layout);

      qx.ui.form.renderer.AbstractRenderer.constructor.call(this, form);
    },
    members: {
      _row: 0,
      _buttonRow: null,
      // overridden
      _onFormChange: function _onFormChange() {
        if (this._buttonRow) {
          this._buttonRow.destroy();

          this._buttonRow = null;
        }

        this._row = 0;

        qx.ui.form.renderer.Single.prototype._onFormChange.base.call(this);
      },

      /**
       * Add a group of form items with the corresponding names. The names are
       * displayed as label.
       * The title is optional and is used as grouping for the given form
       * items.
       *
       * @param items {qx.ui.core.Widget[]} An array of form items to render.
       * @param names {String[]} An array of names for the form items.
       * @param title {String?} A title of the group you are adding.
       */
      addItems: function addItems(items, names, title) {
        // add the header
        if (title != null) {
          this._add(this._createHeader(title), {
            row: this._row,
            column: 0,
            colSpan: 2
          });

          this._row++;
        } // add the items


        for (var i = 0; i < items.length; i++) {
          var label = this._createLabel(names[i], items[i]);

          this._add(label, {
            row: this._row,
            column: 0
          });

          var item = items[i];
          label.setBuddy(item);

          this._add(item, {
            row: this._row,
            column: 1
          });

          this._row++;

          this._connectVisibility(item, label); // store the names for translation


          {
            this._names.push({
              name: names[i],
              label: label,
              item: items[i]
            });
          }
        }
      },

      /**
       * Adds a button the form renderer. All buttons will be added in a
       * single row at the bottom of the form.
       *
       * @param button {qx.ui.form.Button} The button to add.
       */
      addButton: function addButton(button) {
        if (this._buttonRow == null) {
          // create button row
          this._buttonRow = new qx.ui.container.Composite();

          this._buttonRow.setMarginTop(5);

          var hbox = new qx.ui.layout.HBox();
          hbox.setAlignX("right");
          hbox.setSpacing(5);

          this._buttonRow.setLayout(hbox); // add the button row


          this._add(this._buttonRow, {
            row: this._row,
            column: 0,
            colSpan: 2
          }); // increase the row


          this._row++;
        } // add the button


        this._buttonRow.add(button);
      },

      /**
       * Returns the set layout for configuration.
       *
       * @return {qx.ui.layout.Grid} The grid layout of the widget.
       */
      getLayout: function getLayout() {
        return this._getLayout();
      },

      /**
       * Creates a label for the given form item.
       *
       * @param name {String} The content of the label without the
       *   trailing * and :
       * @param item {qx.ui.core.Widget} The item, which has the required state.
       * @return {qx.ui.basic.Label} The label for the given item.
       */
      _createLabel: function _createLabel(name, item) {
        var label = new qx.ui.basic.Label(this._createLabelText(name, item)); // store labels for disposal

        this._labels.push(label);

        label.setRich(true);
        label.setAppearance("form-renderer-label");
        return label;
      },

      /**
       * Creates a header label for the form groups.
       *
       * @param title {String} Creates a header label.
       * @return {qx.ui.basic.Label} The header for the form groups.
       */
      _createHeader: function _createHeader(title) {
        var header = new qx.ui.basic.Label(title); // store labels for disposal

        this._labels.push(header);

        header.setFont("bold");

        if (this._row != 0) {
          header.setMarginTop(10);
        }

        header.setAlignX("left");
        return header;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // first, remove all buttons from the button row because they
      // should not be disposed
      if (this._buttonRow) {
        this._buttonRow.removeAll();

        this._disposeObjects("_buttonRow");
      }
    }
  });
  qx.ui.form.renderer.Single.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Timer": {
        "construct": true
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
  
  ************************************************************************ */

  /**
   * Timer, which accelerates after each interval. The initial delay and the
   * interval time can be set using the properties {@link #firstInterval}
   * and {@link #interval}. The {@link #interval} events will be fired with
   * decreasing interval times while the timer is running, until the {@link #minimum}
   * is reached. The {@link #decrease} property sets the amount of milliseconds
   * which will decreased after every firing.
   *
   * This class is e.g. used in the {@link qx.ui.form.RepeatButton} and
   * {@link qx.ui.form.HoverButton} widgets.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.AcceleratingTimer", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__timer = new qx.event.Timer(this.getInterval());

      this.__timer.addListener("interval", this._onInterval, this);
    },
    events: {
      /** This event if fired each time the interval time has elapsed */
      "interval": "qx.event.type.Event"
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
      minimum: {
        check: "Integer",
        init: 20
      },

      /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
      decrease: {
        check: "Integer",
        init: 2
      }
    },
    members: {
      __timer: null,
      __currentInterval: null,

      /**
       * Reset and start the timer.
       */
      start: function start() {
        this.__timer.setInterval(this.getFirstInterval());

        this.__timer.start();
      },

      /**
       * Stop the timer
       */
      stop: function stop() {
        this.__timer.stop();

        this.__currentInterval = null;
      },

      /**
       * Interval event handler
       */
      _onInterval: function _onInterval() {
        this.__timer.stop();

        if (this.__currentInterval == null) {
          this.__currentInterval = this.getInterval();
        }

        this.__currentInterval = Math.max(this.getMinimum(), this.__currentInterval - this.getDecrease());

        this.__timer.setInterval(this.__currentInterval);

        this.__timer.start();

        this.fireEvent("interval");
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__timer");
    }
  });
  qx.event.AcceleratingTimer.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.INumberForm": {
        "require": true
      },
      "qx.ui.form.IRange": {
        "require": true
      },
      "qx.ui.form.MForm": {
        "require": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.theme.manager.Decoration": {},
      "qx.bom.element.Location": {},
      "qx.event.Timer": {},
      "qx.bom.AnimationFrame": {},
      "qx.event.type.Data": {}
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
   * The Slider widget provides a vertical or horizontal slider.
   *
   * The Slider is the classic widget for controlling a bounded value.
   * It lets the user move a slider handle along a horizontal or vertical
   * groove and translates the handle's position into an integer value
   * within the defined range.
   *
   * The Slider has very few of its own functions.
   * The most useful functions are slideTo() to set the slider directly to some
   * value; setSingleStep(), setPageStep() to set the steps; and setMinimum()
   * and setMaximum() to define the range of the slider.
   *
   * A slider accepts focus on Tab and provides both a mouse wheel and
   * a keyboard interface. The keyboard interface is the following:
   *
   * * Left/Right move a horizontal slider by one single step.
   * * Up/Down move a vertical slider by one single step.
   * * PageUp moves up one page.
   * * PageDown moves down one page.
   * * Home moves to the start (minimum).
   * * End moves to the end (maximum).
   *
   * Here are the main properties of the class:
   *
   * # <code>value</code>: The bounded integer that {@link qx.ui.form.INumberForm}
   * maintains.
   * # <code>minimum</code>: The lowest possible value.
   * # <code>maximum</code>: The highest possible value.
   * # <code>singleStep</code>: The smaller of two natural steps that an abstract
   * sliders provides and typically corresponds to the user pressing an arrow key.
   * # <code>pageStep</code>: The larger of two natural steps that an abstract
   * slider provides and typically corresponds to the user pressing PageUp or
   * PageDown.
   *
   * @childControl knob {qx.ui.core.Widget} knob to set the value of the slider
   */
  qx.Class.define("qx.ui.form.Slider", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.IForm, qx.ui.form.INumberForm, qx.ui.form.IRange],
    include: [qx.ui.form.MForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param orientation {String?"horizontal"} Configure the
     * {@link #orientation} property
     */
    construct: function construct(orientation) {
      qx.ui.core.Widget.constructor.call(this); // Force canvas layout

      this._setLayout(new qx.ui.layout.Canvas()); // Add listeners


      this.addListener("keypress", this._onKeyPress);
      this.addListener("roll", this._onRoll);
      this.addListener("pointerdown", this._onPointerDown);
      this.addListener("pointerup", this._onPointerUp);
      this.addListener("losecapture", this._onPointerUp);
      this.addListener("resize", this._onUpdate); // Stop events

      this.addListener("contextmenu", this._onStopEvent);
      this.addListener("tap", this._onStopEvent);
      this.addListener("dbltap", this._onStopEvent); // Initialize orientation

      if (orientation != null) {
        this.setOrientation(orientation);
      } else {
        this.initOrientation();
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Change event for the value.
       */
      changeValue: 'qx.event.type.Data',

      /** Fired as soon as the slide animation ended. */
      slideAnimationEnd: 'qx.event.type.Event'
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
        init: "slider"
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /** Whether the slider is horizontal or vertical. */
      orientation: {
        check: ["horizontal", "vertical"],
        init: "horizontal",
        apply: "_applyOrientation"
      },

      /**
       * The current slider value.
       *
       * Strictly validates according to {@link #minimum} and {@link #maximum}.
       * Do not apply any value correction to the incoming value. If you depend
       * on this, please use {@link #slideTo} instead.
       */
      value: {
        check: "typeof value==='number'&&value>=this.getMinimum()&&value<=this.getMaximum()",
        init: 0,
        apply: "_applyValue",
        nullable: true
      },

      /**
       * The minimum slider value (may be negative). This value must be smaller
       * than {@link #maximum}.
       */
      minimum: {
        check: "Integer",
        init: 0,
        apply: "_applyMinimum",
        event: "changeMinimum"
      },

      /**
       * The maximum slider value (may be negative). This value must be larger
       * than {@link #minimum}.
       */
      maximum: {
        check: "Integer",
        init: 100,
        apply: "_applyMaximum",
        event: "changeMaximum"
      },

      /**
       * The amount to increment on each event. Typically corresponds
       * to the user pressing an arrow key.
       */
      singleStep: {
        check: "Integer",
        init: 1
      },

      /**
       * The amount to increment on each event. Typically corresponds
       * to the user pressing <code>PageUp</code> or <code>PageDown</code>.
       */
      pageStep: {
        check: "Integer",
        init: 10
      },

      /**
       * Factor to apply to the width/height of the knob in relation
       * to the dimension of the underlying area.
       */
      knobFactor: {
        check: "Number",
        apply: "_applyKnobFactor",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __sliderLocation: null,
      __knobLocation: null,
      __knobSize: null,
      __dragMode: null,
      __dragOffset: null,
      __trackingMode: null,
      __trackingDirection: null,
      __trackingEnd: null,
      __timer: null,
      // event delay stuff during drag
      __dragTimer: null,
      __lastValueEvent: null,
      __dragValue: null,
      __scrollAnimationframe: null,
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        invalid: true
      },
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        qx.ui.form.Slider.prototype.renderLayout.base.call(this, left, top, width, height); // make sure the layout engine does not override the knob position

        this._updateKnobPosition();
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "knob":
            control = new qx.ui.core.Widget();
            control.addListener("resize", this._onUpdate, this);
            control.addListener("pointerover", this._onPointerOver);
            control.addListener("pointerout", this._onPointerOut);

            this._add(control);

            break;
        }

        return control || qx.ui.form.Slider.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for pointerover events at the knob child control.
       *
       * Adds the 'hovered' state
       *
       * @param e {qx.event.type.Pointer} Incoming pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        this.addState("hovered");
      },

      /**
       * Event handler for pointerout events at the knob child control.
       *
       * Removes the 'hovered' state
       *
       * @param e {qx.event.type.Pointer} Incoming pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        this.removeState("hovered");
      },

      /**
       * Listener of roll event
       *
       * @param e {qx.event.type.Roll} Incoming event object
       */
      _onRoll: function _onRoll(e) {
        // only wheel
        if (e.getPointerType() != "wheel") {
          return;
        }

        var axis = this.getOrientation() === "horizontal" ? "x" : "y";
        var delta = e.getDelta()[axis];
        var direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;
        this.slideBy(direction * this.getSingleStep());
        e.stop();
      },

      /**
       * Event handler for keypress events.
       *
       * Adds support for arrow keys, page up, page down, home and end keys.
       *
       * @param e {qx.event.type.KeySequence} Incoming keypress event
       */
      _onKeyPress: function _onKeyPress(e) {
        var isHorizontal = this.getOrientation() === "horizontal";
        var backward = isHorizontal ? "Left" : "Up";
        var forward = isHorizontal ? "Right" : "Down";

        switch (e.getKeyIdentifier()) {
          case forward:
            this.slideForward();
            break;

          case backward:
            this.slideBack();
            break;

          case "PageDown":
            this.slidePageForward(100);
            break;

          case "PageUp":
            this.slidePageBack(100);
            break;

          case "Home":
            this.slideToBegin(200);
            break;

          case "End":
            this.slideToEnd(200);
            break;

          default:
            return;
        } // Stop processed events


        e.stop();
      },

      /**
       * Listener of pointerdown event. Initializes drag or tracking mode.
       *
       * @param e {qx.event.type.Pointer} Incoming event object
       */
      _onPointerDown: function _onPointerDown(e) {
        // this can happen if the user releases the button while dragging outside
        // of the browser viewport
        if (this.__dragMode) {
          return;
        }

        var isHorizontal = this.__isHorizontal;
        var knob = this.getChildControl("knob");
        var locationProperty = isHorizontal ? "left" : "top";
        var cursorLocation = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
        var decorator = this.getDecorator();
        decorator = qx.theme.manager.Decoration.getInstance().resolve(decorator);

        if (isHorizontal) {
          var decoratorPadding = decorator ? decorator.getInsets().left : 0;
          var padding = (this.getPaddingLeft() || 0) + decoratorPadding;
        } else {
          var decoratorPadding = decorator ? decorator.getInsets().top : 0;
          var padding = (this.getPaddingTop() || 0) + decoratorPadding;
        }

        var sliderLocation = this.__sliderLocation = qx.bom.element.Location.get(this.getContentElement().getDomElement())[locationProperty];
        sliderLocation += padding;
        var knobLocation = this.__knobLocation = qx.bom.element.Location.get(knob.getContentElement().getDomElement())[locationProperty];

        if (e.getTarget() === knob) {
          // Switch into drag mode
          this.__dragMode = true;

          if (!this.__dragTimer) {
            // create a timer to fire delayed dragging events if dragging stops.
            this.__dragTimer = new qx.event.Timer(100);

            this.__dragTimer.addListener("interval", this._fireValue, this);
          }

          this.__dragTimer.start(); // Compute dragOffset (includes both: inner position of the widget and
          // cursor position on knob)


          this.__dragOffset = cursorLocation + sliderLocation - knobLocation; // add state

          knob.addState("pressed");
        } else {
          // Switch into tracking mode
          this.__trackingMode = true; // Detect tracking direction

          this.__trackingDirection = cursorLocation <= knobLocation ? -1 : 1; // Compute end value

          this.__computeTrackingEnd(e); // Directly call interval method once


          this._onInterval(); // Initialize timer (when needed)


          if (!this.__timer) {
            this.__timer = new qx.event.Timer(100);

            this.__timer.addListener("interval", this._onInterval, this);
          } // Start timer


          this.__timer.start();
        } // Register move listener


        this.addListener("pointermove", this._onPointerMove); // Activate capturing

        this.capture(); // Stop event

        e.stopPropagation();
      },

      /**
       * Listener of pointerup event. Used for cleanup of previously
       * initialized modes.
       *
       * @param e {qx.event.type.Pointer} Incoming event object
       */
      _onPointerUp: function _onPointerUp(e) {
        if (this.__dragMode) {
          // Release capture mode
          this.releaseCapture(); // Cleanup status flags

          delete this.__dragMode; // as we come out of drag mode, make
          // sure content gets synced

          this.__dragTimer.stop();

          this._fireValue();

          delete this.__dragOffset; // remove state

          this.getChildControl("knob").removeState("pressed"); // it's necessary to check whether the cursor is over the knob widget to be able to
          // to decide whether to remove the 'hovered' state.

          if (e.getType() === "pointerup") {
            var deltaSlider;
            var deltaPosition;
            var positionSlider;

            if (this.__isHorizontal) {
              deltaSlider = e.getDocumentLeft() - (this._valueToPosition(this.getValue()) + this.__sliderLocation);
              positionSlider = qx.bom.element.Location.get(this.getContentElement().getDomElement())["top"];
              deltaPosition = e.getDocumentTop() - (positionSlider + this.getChildControl("knob").getBounds().top);
            } else {
              deltaSlider = e.getDocumentTop() - (this._valueToPosition(this.getValue()) + this.__sliderLocation);
              positionSlider = qx.bom.element.Location.get(this.getContentElement().getDomElement())["left"];
              deltaPosition = e.getDocumentLeft() - (positionSlider + this.getChildControl("knob").getBounds().left);
            }

            if (deltaPosition < 0 || deltaPosition > this.__knobSize || deltaSlider < 0 || deltaSlider > this.__knobSize) {
              this.getChildControl("knob").removeState("hovered");
            }
          }
        } else if (this.__trackingMode) {
          // Stop timer interval
          this.__timer.stop(); // Release capture mode


          this.releaseCapture(); // Cleanup status flags

          delete this.__trackingMode;
          delete this.__trackingDirection;
          delete this.__trackingEnd;
        } // Remove move listener again


        this.removeListener("pointermove", this._onPointerMove); // Stop event

        if (e.getType() === "pointerup") {
          e.stopPropagation();
        }
      },

      /**
       * Listener of pointermove event for the knob. Only used in drag mode.
       *
       * @param e {qx.event.type.Pointer} Incoming event object
       */
      _onPointerMove: function _onPointerMove(e) {
        if (this.__dragMode) {
          var dragStop = this.__isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
          var position = dragStop - this.__dragOffset;
          this.slideTo(this._positionToValue(position));
        } else if (this.__trackingMode) {
          // Update tracking end on pointermove
          this.__computeTrackingEnd(e);
        } // Stop event


        e.stopPropagation();
      },

      /**
       * Listener of interval event by the internal timer. Only used
       * in tracking sequences.
       *
       * @param e {qx.event.type.Event} Incoming event object
       */
      _onInterval: function _onInterval(e) {
        // Compute new value
        var value = this.getValue() + this.__trackingDirection * this.getPageStep(); // Limit value

        if (value < this.getMinimum()) {
          value = this.getMinimum();
        } else if (value > this.getMaximum()) {
          value = this.getMaximum();
        } // Stop at tracking position (where the pointer is pressed down)


        var slideBack = this.__trackingDirection == -1;

        if (slideBack && value <= this.__trackingEnd || !slideBack && value >= this.__trackingEnd) {
          value = this.__trackingEnd;
        } // Finally slide to the desired position


        this.slideTo(value);
      },

      /**
       * Listener of resize event for both the slider itself and the knob.
       *
       * @param e {qx.event.type.Data} Incoming event object
       */
      _onUpdate: function _onUpdate(e) {
        // Update sliding space
        var availSize = this.getInnerSize();
        var knobSize = this.getChildControl("knob").getBounds();
        var sizeProperty = this.__isHorizontal ? "width" : "height"; // Sync knob size

        this._updateKnobSize(); // Store knob size


        this.__slidingSpace = availSize[sizeProperty] - knobSize[sizeProperty];
        this.__knobSize = knobSize[sizeProperty]; // Update knob position (sliding space must be updated first)

        this._updateKnobPosition();
      },

      /*
      ---------------------------------------------------------------------------
        UTILS
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} Whether the slider is laid out horizontally */
      __isHorizontal: false,

      /**
       * @type {Integer} Available space for knob to slide on, computed on resize of
       * the widget
       */
      __slidingSpace: 0,

      /**
       * Computes the value where the tracking should end depending on
       * the current pointer position.
       *
       * @param e {qx.event.type.Pointer} Incoming pointer event
       */
      __computeTrackingEnd: function __computeTrackingEnd(e) {
        var isHorizontal = this.__isHorizontal;
        var cursorLocation = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
        var sliderLocation = this.__sliderLocation;
        var knobLocation = this.__knobLocation;
        var knobSize = this.__knobSize; // Compute relative position

        var position = cursorLocation - sliderLocation;

        if (cursorLocation >= knobLocation) {
          position -= knobSize;
        } // Compute stop value


        var value = this._positionToValue(position);

        var min = this.getMinimum();
        var max = this.getMaximum();

        if (value < min) {
          value = min;
        } else if (value > max) {
          value = max;
        } else {
          var old = this.getValue();
          var step = this.getPageStep();
          var method = this.__trackingDirection < 0 ? "floor" : "ceil"; // Fix to page step

          value = old + Math[method]((value - old) / step) * step;
        } // Store value when undefined, otherwise only when it follows the
        // current direction e.g. goes up or down


        if (this.__trackingEnd == null || this.__trackingDirection == -1 && value <= this.__trackingEnd || this.__trackingDirection == 1 && value >= this.__trackingEnd) {
          this.__trackingEnd = value;
        }
      },

      /**
       * Converts the given position to a value.
       *
       * Does not respect single or page step.
       *
       * @param position {Integer} Position to use
       * @return {Integer} Resulting value (rounded)
       */
      _positionToValue: function _positionToValue(position) {
        // Reading available space
        var avail = this.__slidingSpace; // Protect undefined value (before initial resize) and division by zero

        if (avail == null || avail == 0) {
          return 0;
        } // Compute and limit percent


        var percent = position / avail;

        if (percent < 0) {
          percent = 0;
        } else if (percent > 1) {
          percent = 1;
        } // Compute range


        var range = this.getMaximum() - this.getMinimum(); // Compute value

        return this.getMinimum() + Math.round(range * percent);
      },

      /**
       * Converts the given value to a position to place
       * the knob to.
       *
       * @param value {Integer} Value to use
       * @return {Integer} Computed position (rounded)
       */
      _valueToPosition: function _valueToPosition(value) {
        // Reading available space
        var avail = this.__slidingSpace;

        if (avail == null) {
          return 0;
        } // Computing range


        var range = this.getMaximum() - this.getMinimum(); // Protect division by zero

        if (range == 0) {
          return 0;
        } // Translating value to distance from minimum


        var value = value - this.getMinimum(); // Compute and limit percent

        var percent = value / range;

        if (percent < 0) {
          percent = 0;
        } else if (percent > 1) {
          percent = 1;
        } // Compute position from available space and percent


        return Math.round(avail * percent);
      },

      /**
       * Updates the knob position following the currently configured
       * value. Useful on reflows where the dimensions of the slider
       * itself have been modified.
       *
       */
      _updateKnobPosition: function _updateKnobPosition() {
        this._setKnobPosition(this._valueToPosition(this.getValue()));
      },

      /**
       * Moves the knob to the given position.
       *
       * @param position {Integer} Any valid position (needs to be
       *   greater or equal than zero)
       */
      _setKnobPosition: function _setKnobPosition(position) {
        // Use the DOM Element to prevent unnecessary layout recalculations
        var knob = this.getChildControl("knob");
        var dec = this.getDecorator();
        dec = qx.theme.manager.Decoration.getInstance().resolve(dec);
        var content = knob.getContentElement();

        if (this.__isHorizontal) {
          if (dec && dec.getPadding()) {
            position += dec.getPadding().left;
          }

          position += this.getPaddingLeft() || 0;
          content.setStyle("left", position + "px", true);
        } else {
          if (dec && dec.getPadding()) {
            position += dec.getPadding().top;
          }

          position += this.getPaddingTop() || 0;
          content.setStyle("top", position + "px", true);
        }
      },

      /**
       * Reconfigures the size of the knob depending on
       * the optionally defined {@link #knobFactor}.
       *
       */
      _updateKnobSize: function _updateKnobSize() {
        // Compute knob size
        var knobFactor = this.getKnobFactor();

        if (knobFactor == null) {
          return;
        } // Ignore when not rendered yet


        var avail = this.getInnerSize();

        if (avail == null) {
          return;
        } // Read size property


        if (this.__isHorizontal) {
          this.getChildControl("knob").setWidth(Math.round(knobFactor * avail.width));
        } else {
          this.getChildControl("knob").setHeight(Math.round(knobFactor * avail.height));
        }
      },

      /*
      ---------------------------------------------------------------------------
        SLIDE METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Slides backward to the minimum value
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slideToBegin: function slideToBegin(duration) {
        this.slideTo(this.getMinimum(), duration);
      },

      /**
       * Slides forward to the maximum value
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slideToEnd: function slideToEnd(duration) {
        this.slideTo(this.getMaximum(), duration);
      },

      /**
       * Slides forward (right or bottom depending on orientation)
       *
       */
      slideForward: function slideForward() {
        this.slideBy(this.getSingleStep());
      },

      /**
       * Slides backward (to left or top depending on orientation)
       *
       */
      slideBack: function slideBack() {
        this.slideBy(-this.getSingleStep());
      },

      /**
       * Slides a page forward (to right or bottom depending on orientation)
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slidePageForward: function slidePageForward(duration) {
        this.slideBy(this.getPageStep(), duration);
      },

      /**
       * Slides a page backward (to left or top depending on orientation)
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slidePageBack: function slidePageBack(duration) {
        this.slideBy(-this.getPageStep(), duration);
      },

      /**
       * Slides by the given offset.
       *
       * This method works with the value, not with the coordinate.
       *
       * @param offset {Integer} Offset to scroll by
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slideBy: function slideBy(offset, duration) {
        this.slideTo(this.getValue() + offset, duration);
      },

      /**
       * Slides to the given value
       *
       * This method works with the value, not with the coordinate.
       *
       * @param value {Integer} Scroll to a value between the defined
       *   minimum and maximum.
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      slideTo: function slideTo(value, duration) {
        this.stopSlideAnimation();

        if (duration) {
          this.__animateTo(value, duration);
        } else {
          this.updatePosition(value);
        }
      },

      /**
       * Updates the position property considering the minimum and maximum values.
       * @param value {Number} The new position.
       */
      updatePosition: function updatePosition(value) {
        this.setValue(this.__normalizeValue(value));
      },

      /**
       * In case a slide animation is currently running, it will be stopped.
       * If not, the method does nothing.
       */
      stopSlideAnimation: function stopSlideAnimation() {
        if (this.__scrollAnimationframe) {
          this.__scrollAnimationframe.cancelSequence();

          this.__scrollAnimationframe = null;
        }
      },

      /**
       * Internal helper to normalize the given value concerning the minimum
       * and maximum value.
       * @param value {Number} The value to normalize.
       * @return {Number} The normalized value.
       */
      __normalizeValue: function __normalizeValue(value) {
        // Bring into allowed range or fix to single step grid
        if (value < this.getMinimum()) {
          value = this.getMinimum();
        } else if (value > this.getMaximum()) {
          value = this.getMaximum();
        } else {
          value = this.getMinimum() + Math.round((value - this.getMinimum()) / this.getSingleStep()) * this.getSingleStep();
        }

        return value;
      },

      /**
       * Animation helper which takes care of the animated slide.
       * @param to {Number} The target value.
       * @param duration {Number} The time in milliseconds the slide to should take.
       */
      __animateTo: function __animateTo(to, duration) {
        to = this.__normalizeValue(to);
        var from = this.getValue();
        this.__scrollAnimationframe = new qx.bom.AnimationFrame();

        this.__scrollAnimationframe.on("frame", function (timePassed) {
          this.setValue(parseInt(timePassed / duration * (to - from) + from));
        }, this);

        this.__scrollAnimationframe.on("end", function () {
          this.setValue(to);
          this.__scrollAnimationframe = null;
          this.fireEvent("slideAnimationEnd");
        }, this);

        this.__scrollAnimationframe.startSequence(duration);
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        var knob = this.getChildControl("knob"); // Update private flag for faster access

        this.__isHorizontal = value === "horizontal"; // Toggle states and knob layout

        if (this.__isHorizontal) {
          this.removeState("vertical");
          knob.removeState("vertical");
          this.addState("horizontal");
          knob.addState("horizontal");
          knob.setLayoutProperties({
            top: 0,
            right: null,
            bottom: 0
          });
        } else {
          this.removeState("horizontal");
          knob.removeState("horizontal");
          this.addState("vertical");
          knob.addState("vertical");
          knob.setLayoutProperties({
            right: 0,
            bottom: null,
            left: 0
          });
        } // Sync knob position


        this._updateKnobPosition();
      },
      // property apply
      _applyKnobFactor: function _applyKnobFactor(value, old) {
        if (value != null) {
          this._updateKnobSize();
        } else {
          if (this.__isHorizontal) {
            this.getChildControl("knob").resetWidth();
          } else {
            this.getChildControl("knob").resetHeight();
          }
        }
      },
      // property apply
      _applyValue: function _applyValue(value, old) {
        if (value != null) {
          this._updateKnobPosition();

          if (this.__dragMode) {
            this.__dragValue = [value, old];
          } else {
            this.fireEvent("changeValue", qx.event.type.Data, [value, old]);
          }
        } else {
          this.resetValue();
        }
      },

      /**
       * Helper for applyValue which fires the changeValue event.
       */
      _fireValue: function _fireValue() {
        if (!this.__dragValue) {
          return;
        }

        var tmp = this.__dragValue;
        this.__dragValue = null;
        this.fireEvent("changeValue", qx.event.type.Data, tmp);
      },
      // property apply
      _applyMinimum: function _applyMinimum(value, old) {
        if (this.getValue() < value) {
          this.setValue(value);
        }

        this._updateKnobPosition();
      },
      // property apply
      _applyMaximum: function _applyMaximum(value, old) {
        if (this.getValue() > value) {
          this.setValue(value);
        }

        this._updateKnobPosition();
      }
    }
  });
  qx.ui.form.Slider.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Slider": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Minimal modified version of the {@link qx.ui.form.Slider} to be
   * used by {@link qx.ui.core.scroll.ScrollBar}.
   *
   * @internal
   */
  qx.Class.define("qx.ui.core.scroll.ScrollSlider", {
    extend: qx.ui.form.Slider,
    // overridden
    construct: function construct(orientation) {
      qx.ui.form.Slider.constructor.call(this, orientation); // Remove roll/keypress events

      this.removeListener("keypress", this._onKeyPress);
      this.removeListener("roll", this._onRoll);
    },
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "knob":
            control = qx.ui.core.scroll.ScrollSlider.prototype._createChildControlImpl.base.call(this, id);
            control.addListener("dblclick", function (e) {
              e.stopPropagation();
            });
        }

        return control || qx.ui.core.scroll.ScrollSlider.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden
      getSizeHint: function getSizeHint(compute) {
        // get the original size hint
        var hint = qx.ui.core.scroll.ScrollSlider.prototype.getSizeHint.base.call(this); // set the width or height to 0 depending on the orientation.
        // this is necessary to prevent the ScrollSlider to change the size
        // hint of its parent, which can cause errors on outer flex layouts
        // [BUG #3279]

        if (this.getOrientation() === "horizontal") {
          hint.width = 0;
        } else {
          hint.height = 0;
        }

        return hint;
      }
    }
  });
  qx.ui.core.scroll.ScrollSlider.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-39.js.map
