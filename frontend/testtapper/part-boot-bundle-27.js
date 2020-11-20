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
       2007 Christian Boulanger
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Boulanger
  
  ************************************************************************ */

  /**
   * A message to be dispatched on the message bus.
   */
  qx.Class.define("qx.event.message.Message", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param name {String} The name of the message
     * @param data {var} Any type of data to attach
     */
    construct: function construct(name, data) {
      qx.core.Object.constructor.call(this);

      if (name != null) {
        this.setName(name);
      }

      if (data != null) {
        this.setData(data);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Event name of the message. Based on this name the message is dispatched
       * to the event listeners.
       */
      name: {
        check: "String"
      },

      /**
       * Any data the sender wants to pass with the event.
       */
      data: {
        init: null,
        nullable: true
      },

      /**
       * A reference to the sending object.
       */
      sender: {
        check: "Object",
        nullable: true
      }
    },
    destruct: function destruct() {
      this.setData(null);
      this.setSender(null);
    }
  });
  qx.event.message.Message.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.virtual.core.ILayer": {
        "require": true
      },
      "qx.ui.core.queue.Widget": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * Abstract base class for layers of a virtual pane.
   *
   * This class queues calls to {@link #fullUpdate}, {@link #updateLayerWindow}
   * and {@link #updateLayerData} and only performs the absolute necessary
   * actions. Concrete implementation of this class must at least implement
   * the {@link #_fullUpdate} method. Additionally the two methods
   * {@link #_updateLayerWindow} and {@link #_updateLayerData} may be implemented
   * to increase the performance.
   */
  qx.Class.define("qx.ui.virtual.layer.Abstract", {
    extend: qx.ui.core.Widget,
    type: "abstract",
    implement: [qx.ui.virtual.core.ILayer],

    /*
     *****************************************************************************
        CONSTRUCTOR
     *****************************************************************************
     */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);
      this.__jobs = {};
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      anonymous: {
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
      __jobs: null,
      __arguments: null,
      __firstRow: null,
      __firstColumn: null,
      __rowSizes: null,
      __columnSizes: null,

      /**
       * Get the first rendered row
       *
       * @return {Integer} The first rendered row
       */
      getFirstRow: function getFirstRow() {
        return this.__firstRow;
      },

      /**
       * Get the first rendered column
       *
       * @return {Integer} The first rendered column
       */
      getFirstColumn: function getFirstColumn() {
        return this.__firstColumn;
      },

      /**
       * Get the sizes of the rendered rows
       *
       * @return {Integer[]} List of row heights
       */
      getRowSizes: function getRowSizes() {
        return this.__rowSizes || [];
      },

      /**
       * Get the sizes of the rendered column
       *
       * @return {Integer[]} List of column widths
       */
      getColumnSizes: function getColumnSizes() {
        return this.__columnSizes || [];
      },
      // overridden
      syncWidget: function syncWidget(jobs) {
        // return if the layer is not yet rendered
        // it will rendered in the appear event
        if (!this.getContentElement().getDomElement()) {
          return;
        }

        if (this.__jobs.fullUpdate || this.__jobs.updateLayerWindow && this.__jobs.updateLayerData) {
          this._fullUpdate.apply(this, this.__arguments);
        } else if (this.__jobs.updateLayerWindow) {
          this._updateLayerWindow.apply(this, this.__arguments);
        } else if (this.__jobs.updateLayerData && this.__rowSizes) {
          this._updateLayerData();
        }

        if (this.__jobs.fullUpdate || this.__jobs.updateLayerWindow) {
          var args = this.__arguments;
          this.__firstRow = args[0];
          this.__firstColumn = args[1];
          this.__rowSizes = args[2];
          this.__columnSizes = args[3];
        }

        this.__jobs = {};
      },

      /**
       * Update the layer to reflect changes in the data the layer displays.
       *
       * Note: It is guaranteed that this method is only called after the layer
       * has been rendered.
       */
      _updateLayerData: function _updateLayerData() {
        this._fullUpdate(this.__firstRow, this.__firstColumn, this.__rowSizes, this.__columnSizes);
      },

      /**
       * Do a complete update of the layer. All cached data should be discarded.
       * This method is called e.g. after changes to the grid geometry
       * (row/column sizes, row/column count, ...).
       *
       * Note: It is guaranteed that this method is only called after the layer
       * has been rendered.
       *
       * @param firstRow {Integer} Index of the first row to display
       * @param firstColumn {Integer} Index of the first column to display
       * @param rowSizes {Integer[]} Array of heights for each row to display
       * @param columnSizes {Integer[]} Array of widths for each column to display
       */
      _fullUpdate: function _fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        throw new Error("Abstract method '_fullUpdate' called!");
      },

      /**
       * Update the layer to display a different window of the virtual grid.
       * This method is called if the pane is scrolled, resized or cells
       * are prefetched. The implementation can assume that no other grid
       * data has been changed since the last "fullUpdate" of "updateLayerWindow"
       * call.
       *
       * Note: It is guaranteed that this method is only called after the layer
       * has been rendered.
       *
       * @param firstRow {Integer} Index of the first row to display
       * @param firstColumn {Integer} Index of the first column to display
       * @param rowSizes {Integer[]} Array of heights for each row to display
       * @param columnSizes {Integer[]} Array of widths for each column to display
       */
      _updateLayerWindow: function _updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        this._fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
      },
      // interface implementation
      updateLayerData: function updateLayerData() {
        this.__jobs.updateLayerData = true;
        qx.ui.core.queue.Widget.add(this);
      },
      // interface implementation
      fullUpdate: function fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        this.__arguments = arguments;
        this.__jobs.fullUpdate = true;
        qx.ui.core.queue.Widget.add(this);
      },
      // interface implementation
      updateLayerWindow: function updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        this.__arguments = arguments;
        this.__jobs.updateLayerWindow = true;
        qx.ui.core.queue.Widget.add(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__jobs = this.__arguments = this.__rowSizes = this.__columnSizes = null;
    }
  });
  qx.ui.virtual.layer.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.layer.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.theme.manager.Color": {},
      "qx.theme.manager.Decoration": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * Abstract base class for the {@link Row} and {@link Column} layers.
   */
  qx.Class.define("qx.ui.virtual.layer.AbstractBackground", {
    extend: qx.ui.virtual.layer.Abstract,

    /*
     *****************************************************************************
        CONSTRUCTOR
     *****************************************************************************
     */

    /**
     * @param colorEven {Color?null} color for even indexes
     * @param colorOdd {Color?null} color for odd indexes
     */
    construct: function construct(colorEven, colorOdd) {
      qx.ui.virtual.layer.Abstract.constructor.call(this);

      if (colorEven) {
        this.setColorEven(colorEven);
      }

      if (colorOdd) {
        this.setColorOdd(colorOdd);
      }

      this.__customColors = {};
      this.__decorators = {};
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** color for event indexes */
      colorEven: {
        nullable: true,
        check: "Color",
        apply: "_applyColorEven",
        themeable: true
      },

      /** color for odd indexes */
      colorOdd: {
        nullable: true,
        check: "Color",
        apply: "_applyColorOdd",
        themeable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __colorEven: null,
      __colorOdd: null,
      __customColors: null,
      __decorators: null,

      /*
      ---------------------------------------------------------------------------
        COLOR HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the color for the given index
       *
       * @param index {Integer} Index to set the color for
       * @param color {Color|null} the color to set. A value of <code>null</code>
       *    will reset the color.
       */
      setColor: function setColor(index, color) {
        if (color) {
          this.__customColors[index] = qx.theme.manager.Color.getInstance().resolve(color);
        } else {
          delete this.__customColors[index];
        }
      },

      /**
       * Clear all colors set using {@link #setColor}.
       */
      clearCustomColors: function clearCustomColors() {
        this.__customColors = {};
        this.updateLayerData();
      },

      /**
       * Get the color at the given index
       *
       * @param index {Integer} The index to get the color for.
       * @return {Color} The color at the given index
       */
      getColor: function getColor(index) {
        var customColor = this.__customColors[index];

        if (customColor) {
          return customColor;
        } else {
          return index % 2 == 0 ? this.__colorEven : this.__colorOdd;
        }
      },
      // property apply
      _applyColorEven: function _applyColorEven(value, old) {
        if (value) {
          this.__colorEven = qx.theme.manager.Color.getInstance().resolve(value);
        } else {
          this.__colorEven = null;
        }

        this.updateLayerData();
      },
      // property apply
      _applyColorOdd: function _applyColorOdd(value, old) {
        if (value) {
          this.__colorOdd = qx.theme.manager.Color.getInstance().resolve(value);
        } else {
          this.__colorOdd = null;
        }

        this.updateLayerData();
      },

      /**
       * Sets the decorator for the given index
       *
       * @param index {Integer} Index to set the color for
       * @param decorator {qx.ui.decoration.IDecorator|null} the decorator to set. A value of
       *    <code>null</code> will reset the decorator.
       */
      setBackground: function setBackground(index, decorator) {
        if (decorator) {
          this.__decorators[index] = qx.theme.manager.Decoration.getInstance().resolve(decorator);
        } else {
          delete this.__decorators[index];
        }

        this.updateLayerData();
      },

      /**
       * Get the decorator at the given index
       *
       * @param index {Integer} The index to get the decorator for.
       * @return {qx.ui.decoration.IDecorator} The decorator at the given index
       */
      getBackground: function getBackground(index) {
        return this.__decorators[index];
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__customColors = this.__decorators = null;
    }
  });
  qx.ui.virtual.layer.AbstractBackground.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.layer.AbstractBackground": {
        "require": true
      },
      "qx.lang.Array": {},
      "qx.bom.element.Style": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * The Row layer renders row background colors.
   */
  qx.Class.define("qx.ui.virtual.layer.Row", {
    extend: qx.ui.virtual.layer.AbstractBackground,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "row-layer"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _fullUpdate: function _fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        var html = [];
        var width = qx.lang.Array.sum(columnSizes);
        var top = 0;
        var row = firstRow;
        var childIndex = 0;

        for (var y = 0; y < rowSizes.length; y++) {
          var color = this.getColor(row);
          var backgroundColor = color ? "background-color:" + color + ";" : "";
          var decorator = this.getBackground(row);
          var styles = decorator ? qx.bom.element.Style.compile(decorator.getStyles()) : "";
          html.push("<div style='", "position: absolute;", "left: 0;", "top:", top, "px;", "height:", rowSizes[y], "px;", "width:", width, "px;", backgroundColor, styles, "'>", "</div>");
          childIndex++;
          top += rowSizes[y];
          row += 1;
        }

        var el = this.getContentElement().getDomElement(); // hide element before changing the child nodes to avoid
        // premature reflow calculations

        el.style.display = "none";
        el.innerHTML = html.join("");
        el.style.display = "block";
        this._width = width;
      },
      // overridden
      _updateLayerWindow: function _updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        if (firstRow !== this.getFirstRow() || rowSizes.length !== this.getRowSizes().length || this._width < qx.lang.Array.sum(columnSizes)) {
          this._fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
        }
      },
      // overridden
      setColor: function setColor(index, color) {
        qx.ui.virtual.layer.Row.prototype.setColor.base.call(this, index, color);

        if (this.__isRowRendered(index)) {
          this.updateLayerData();
        }
      },
      // overridden
      setBackground: function setBackground(index, decorator) {
        qx.ui.virtual.layer.Row.prototype.setBackground.base.call(this, index, decorator);

        if (this.__isRowRendered(index)) {
          this.updateLayerData();
        }
      },

      /**
       * Whether the row with the given index is currently rendered (i.e. in the
       * layer's view port).
       *
       * @param index {Integer} The row's index
       * @return {Boolean} Whether the row is rendered
       */
      __isRowRendered: function __isRowRendered(index) {
        var firstRow = this.getFirstRow();
        var lastRow = firstRow + this.getRowSizes().length - 1;
        return index >= firstRow && index <= lastRow;
      }
    }
  });
  qx.ui.virtual.layer.Row.$$dbClassInfo = $$dbClassInfo;
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This interface needs to implemented from all {@link qx.ui.list.List} providers.
   *
   * @internal
   */
  qx.Interface.define("qx.ui.list.provider.IListProvider", {
    members: {
      /**
       * Creates a layer for item and group rendering.
       *
       * @return {qx.ui.virtual.layer.Abstract} new layer.
       */
      createLayer: function createLayer() {},

      /**
       * Creates a renderer for item rendering.
       *
       * @return {var} new item renderer.
       */
      createItemRenderer: function createItemRenderer() {},

      /**
       * Creates a renderer for group rendering.
       *
       * @return {var} new group renderer.
       */
      createGroupRenderer: function createGroupRenderer() {},

      /**
       * Styles a selected item.
       *
       * @param row {Integer} row to style.
       */
      styleSelectabled: function styleSelectabled(row) {},

      /**
       * Styles a not selected item.
       *
       * @param row {Integer} row to style.
       */
      styleUnselectabled: function styleUnselectabled(row) {},

      /**
       * Returns if the passed row can be selected or not.
       *
       * @param row {Integer} row to select.
       * @return {Boolean} <code>true</code> when the row can be selected,
       *    <code>false</code> otherwise.
       */
      isSelectable: function isSelectable(row) {},

      /**
       * The path to the property which holds the information that should be
       * shown as a label. This is only needed if objects are stored in the model.
       *
       * @param path {String} path to the property.
       */
      setLabelPath: function setLabelPath(path) {},

      /**
       * The path to the property which holds the information that should be
       * shown as an icon. This is only needed if objects are stored in the model
       * and if the icon should be shown.
       *
       * @param path {String} path to the property.
       */
      setIconPath: function setIconPath(path) {},

      /**
       * A map containing the options for the label binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       *
       * @param options {Map} options for the label binding.
       */
      setLabelOptions: function setLabelOptions(options) {},

      /**
       * A map containing the options for the icon binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       *
       * @param options {Map} options for the icon binding.
       */
      setIconOptions: function setIconOptions(options) {},

      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.list.core.IListDelegate} interface.
       *
       * @param delegate {Object} delegation object.
       */
      setDelegate: function setDelegate(delegate) {},

      /**
       * Remove all bindings from all bounded items.
       */
      removeBindings: function removeBindings() {}
    }
  });
  qx.ui.list.provider.IListProvider.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The mixin controls the binding between model and item.
   *
   * @internal
   */
  qx.Mixin.define("qx.ui.list.core.MWidgetController", {
    construct: function construct() {
      this.__boundItems = [];
    },
    properties: {
      /**
       * The path to the property which holds the information that should be
       * shown as a label. This is only needed if objects are stored in the model.
       */
      labelPath: {
        check: "String",
        nullable: true
      },

      /**
       * The path to the property which holds the information that should be
       * shown as an icon. This is only needed if objects are stored in the model
       * and if the icon should be shown.
       */
      iconPath: {
        check: "String",
        nullable: true
      },

      /**
       * The path to the property which holds the information that should be
       * displayed as a group label. This is only needed if objects are stored in the
       * model.
       */
      groupLabelPath: {
        check: "String",
        nullable: true
      },

      /**
       * A map containing the options for the label binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      labelOptions: {
        nullable: true
      },

      /**
       * A map containing the options for the icon binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      iconOptions: {
        nullable: true
      },

      /**
       * A map containing the options for the group label binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      groupLabelOptions: {
        nullable: true
      },

      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.list.core.IListDelegate} interface.
       */
      delegate: {
        event: "changeDelegate",
        init: null,
        nullable: true
      }
    },
    members: {
      /** @type {Array} which contains the bounded items */
      __boundItems: null,

      /**
       * Helper-Method for binding the default properties from
       * the model to the target widget. The used default properties
       * depends on the passed item. When the passed item is
       * a list item the "label" and "icon" property is used.
       * When the passed item is a group item the "value" property is
       * used.
       *
       * This method should only be called in the
       * {@link IListDelegate#bindItem} function
       * implemented by the {@link #delegate} property.
       *
       * @param item {qx.ui.core.Widget} The internally created and used
       *   list or group item.
       * @param index {Integer} The index of the item.
       */
      bindDefaultProperties: function bindDefaultProperties(item, index) {
        if (item.getUserData("cell.type") != "group") {
          // bind model first
          this.bindProperty("", "model", null, item, index);
          this.bindProperty(this.getLabelPath(), "label", this.getLabelOptions(), item, index);

          if (this.getIconPath() != null) {
            this.bindProperty(this.getIconPath(), "icon", this.getIconOptions(), item, index);
          }
        } else {
          this.bindProperty(this.getGroupLabelPath(), "value", this.getGroupLabelOptions(), item, index);
        }
      },

      /**
       * Helper-Method for binding a given property from the model to the target
       * widget.
       * This method should only be called in the
       * {@link IListDelegate#bindItem} function implemented by the
       * {@link #delegate} property.
       *
       * @param sourcePath {String | null} The path to the property in the model.
       *   If you use an empty string, the whole model item will be bound.
       * @param targetProperty {String} The name of the property in the target widget.
       * @param options {Map | null} The options to use for the binding.
       * @param targetWidget {qx.ui.core.Widget} The target widget.
       * @param index {Integer} The index of the current binding.
       */
      bindProperty: function bindProperty(sourcePath, targetProperty, options, targetWidget, index) {
        var type = targetWidget.getUserData("cell.type");

        var bindPath = this.__getBindPath(index, sourcePath, type);

        if (options) {
          options.ignoreConverter = "model";
        }

        var id = this._list.bind(bindPath, targetWidget, targetProperty, options);

        this.__addBinding(targetWidget, id);
      },

      /**
       * Helper-Method for binding a given property from the target widget to
       * the model.
       * This method should only be called in the
       * {@link IListDelegate#bindItem} function implemented by the
       * {@link #delegate} property.
       *
       * @param targetPath {String | null} The path to the property in the model.
       * @param sourceProperty {String} The name of the property in the target.
       * @param options {Map | null} The options to use for the binding.
       * @param sourceWidget {qx.ui.core.Widget} The source widget.
       * @param index {Integer} The index of the current binding.
       */
      bindPropertyReverse: function bindPropertyReverse(targetPath, sourceProperty, options, sourceWidget, index) {
        var type = sourceWidget.getUserData("cell.type");

        var bindPath = this.__getBindPath(index, targetPath, type);

        var id = sourceWidget.bind(sourceProperty, this._list, bindPath, options);

        this.__addBinding(sourceWidget, id);
      },

      /**
       * Remove all bindings from all bounded items.
       */
      removeBindings: function removeBindings() {
        while (this.__boundItems.length > 0) {
          var item = this.__boundItems.pop();

          this._removeBindingsFrom(item);
        }
      },

      /**
       * Configure the passed item if a delegate is set and the needed
       * function {@link IListDelegate#configureItem} is available.
       *
       * @param item {qx.ui.core.Widget} item to configure.
       */
      _configureItem: function _configureItem(item) {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.configureItem != null) {
          delegate.configureItem(item);
        }
      },

      /**
       * Configure the passed item if a delegate is set and the needed
       * function {@link IListDelegate#configureGroupItem} is available.
       *
       * @param item {qx.ui.core.Widget} item to configure.
       */
      _configureGroupItem: function _configureGroupItem(item) {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.configureGroupItem != null) {
          delegate.configureGroupItem(item);
        }
      },

      /**
       * Sets up the binding for the given item and index.
       *
       * @param item {qx.ui.core.Widget} The internally created and used item.
       * @param index {Integer} The index of the item.
       */
      _bindItem: function _bindItem(item, index) {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.bindItem != null) {
          delegate.bindItem(this, item, index);
        } else {
          this.bindDefaultProperties(item, index);
        }
      },

      /**
       * Sets up the binding for the given group item and index.
       *
       * @param item {qx.ui.core.Widget} The internally created and used item.
       * @param index {Integer} The index of the item.
       */
      _bindGroupItem: function _bindGroupItem(item, index) {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.bindGroupItem != null) {
          delegate.bindGroupItem(this, item, index);
        } else {
          this.bindDefaultProperties(item, index);
        }
      },

      /**
       * Removes the binding of the given item.
       *
       * @param item {qx.ui.core.Widget} The item which the binding should
       *   be removed.
       */
      _removeBindingsFrom: function _removeBindingsFrom(item) {
        var bindings = this.__getBindings(item);

        while (bindings.length > 0) {
          var id = bindings.pop();

          try {
            this._list.removeBinding(id);
          } catch (e) {
            item.removeBinding(id);
          }
        }

        if (this.__boundItems.includes(item)) {
          qx.lang.Array.remove(this.__boundItems, item);
        }
      },

      /**
       * Helper method to create the path for binding.
       *
       * @param index {Integer} The index of the item.
       * @param path {String|null} The path to the property.
       * @param type {String} The type <code>["item", "group"]</code>.
       * @return {String} The binding path
       */
      __getBindPath: function __getBindPath(index, path, type) {
        var bindPath = "model[" + index + "]";

        if (type == "group") {
          bindPath = "groups[" + index + "]";
        }

        if (path != null && path != "") {
          bindPath += "." + path;
        }

        return bindPath;
      },

      /**
       * Helper method to save the binding for the widget.
       *
       * @param widget {qx.ui.core.Widget} widget to save binding.
       * @param id {var} the id from the binding.
       */
      __addBinding: function __addBinding(widget, id) {
        var bindings = this.__getBindings(widget);

        if (!bindings.includes(id)) {
          bindings.push(id);
        }

        if (!this.__boundItems.includes(widget)) {
          this.__boundItems.push(widget);
        }
      },

      /**
       * Helper method which returns all bound id from the widget.
       *
       * @param widget {qx.ui.core.Widget} widget to get all binding.
       * @return {Array} all bound id's.
       */
      __getBindings: function __getBindings(widget) {
        var bindings = widget.getUserData("BindingIds");

        if (bindings == null) {
          bindings = [];
          widget.setUserData("BindingIds", bindings);
        }

        return bindings;
      }
    },
    destruct: function destruct() {
      this.__boundItems = null;
    }
  });
  qx.ui.list.core.MWidgetController.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.virtual.core.IWidgetCellProvider": {
        "require": true
      },
      "qx.ui.list.provider.IListProvider": {
        "require": true
      },
      "qx.ui.list.core.MWidgetController": {
        "require": true
      },
      "qx.ui.virtual.layer.WidgetCell": {},
      "qx.util.Delegate": {},
      "qx.ui.form.ListItem": {},
      "qx.ui.virtual.cell.WidgetCell": {},
      "qx.ui.basic.Label": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * The provider implements the {@link qx.ui.virtual.core.IWidgetCellProvider} API,
   * which can be used as delegate for the widget cell rendering and it
   * provides a API to bind the model with the rendered item.
   *
   * @internal
   */
  qx.Class.define("qx.ui.list.provider.WidgetProvider", {
    extend: qx.core.Object,
    implement: [qx.ui.virtual.core.IWidgetCellProvider, qx.ui.list.provider.IListProvider],
    include: [qx.ui.list.core.MWidgetController],

    /**
     * Creates the <code>WidgetProvider</code>
     *
     * @param list {qx.ui.list.List} list to provide.
     */
    construct: function construct(list) {
      qx.core.Object.constructor.call(this);
      this._list = list;
      this._itemRenderer = this.createItemRenderer();
      this._groupRenderer = this.createGroupRenderer();

      this._itemRenderer.addListener("created", this._onItemCreated, this);

      this._groupRenderer.addListener("created", this._onGroupItemCreated, this);

      this._list.addListener("changeDelegate", this._onChangeDelegate, this);
    },
    members: {
      /** @type {qx.ui.virtual.cell.WidgetCell} the used item renderer */
      _itemRenderer: null,

      /** @type {qx.ui.virtual.cell.WidgetCell} the used group renderer */
      _groupRenderer: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */
      // interface implementation
      getCellWidget: function getCellWidget(row, column) {
        var widget = null;

        if (!this._list._isGroup(row)) {
          widget = this._itemRenderer.getCellWidget();
          widget.setUserData("cell.type", "item");

          this._bindItem(widget, this._list._lookup(row));

          if (this._list._manager.isItemSelected(row)) {
            this._styleSelectabled(widget);
          } else {
            this._styleUnselectabled(widget);
          }
        } else {
          widget = this._groupRenderer.getCellWidget();
          widget.setUserData("cell.type", "group");

          this._bindGroupItem(widget, this._list._lookupGroup(row));
        }

        return widget;
      },
      // interface implementation
      poolCellWidget: function poolCellWidget(widget) {
        this._removeBindingsFrom(widget);

        if (widget.getUserData("cell.type") == "item") {
          this._itemRenderer.pool(widget);
        } else if (widget.getUserData("cell.type") == "group") {
          this._groupRenderer.pool(widget);
        }

        this._onPool(widget);
      },
      // interface implementation
      createLayer: function createLayer() {
        return new qx.ui.virtual.layer.WidgetCell(this);
      },
      // interface implementation
      createItemRenderer: function createItemRenderer() {
        var createWidget = qx.util.Delegate.getMethod(this.getDelegate(), "createItem");

        if (createWidget == null) {
          createWidget = function createWidget() {
            return new qx.ui.form.ListItem();
          };
        }

        var renderer = new qx.ui.virtual.cell.WidgetCell();
        renderer.setDelegate({
          createWidget: createWidget
        });
        return renderer;
      },
      // interface implementation
      createGroupRenderer: function createGroupRenderer() {
        var createWidget = qx.util.Delegate.getMethod(this.getDelegate(), "createGroupItem");

        if (createWidget == null) {
          createWidget = function createWidget() {
            var group = new qx.ui.basic.Label();
            group.setAppearance("group-item");
            return group;
          };
        }

        var renderer = new qx.ui.virtual.cell.WidgetCell();
        renderer.setDelegate({
          createWidget: createWidget
        });
        return renderer;
      },
      // interface implementation
      styleSelectabled: function styleSelectabled(row) {
        var widget = this.__getWidgetFrom(row);

        this._styleSelectabled(widget);
      },
      // interface implementation
      styleUnselectabled: function styleUnselectabled(row) {
        var widget = this.__getWidgetFrom(row);

        this._styleUnselectabled(widget);
      },
      // interface implementation
      isSelectable: function isSelectable(row) {
        if (this._list._isGroup(row)) {
          return false;
        }

        var widget = this._list._layer.getRenderedCellWidget(row, 0);

        if (widget != null) {
          return widget.isEnabled();
        } else {
          return true;
        }
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL API
      ---------------------------------------------------------------------------
      */

      /**
       * Styles a selected item.
       *
       * @param widget {qx.ui.core.Widget} widget to style.
       */
      _styleSelectabled: function _styleSelectabled(widget) {
        this.__updateStates(widget, {
          selected: 1
        });
      },

      /**
       * Styles a not selected item.
       *
       * @param widget {qx.ui.core.Widget} widget to style.
       */
      _styleUnselectabled: function _styleUnselectabled(widget) {
        this.__updateStates(widget, {});
      },

      /**
       * Calls the delegate <code>onPool</code> method when it is used in the
       * {@link #delegate} property.
       *
       * @param item {qx.ui.core.Widget} Item to modify.
       */
      _onPool: function _onPool(item) {
        var onPool = qx.util.Delegate.getMethod(this.getDelegate(), "onPool");

        if (onPool != null) {
          onPool(item);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the created item widget event.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onItemCreated: function _onItemCreated(event) {
        var widget = event.getData();

        this._configureItem(widget);
      },

      /**
       * Event handler for the created item widget event.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onGroupItemCreated: function _onGroupItemCreated(event) {
        var widget = event.getData();

        this._configureGroupItem(widget);
      },

      /**
       * Event handler for the change delegate event.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onChangeDelegate: function _onChangeDelegate(event) {
        this._itemRenderer.dispose();

        this._itemRenderer = this.createItemRenderer();

        this._itemRenderer.addListener("created", this._onItemCreated, this);

        this._groupRenderer.dispose();

        this._groupRenderer = this.createGroupRenderer();

        this._groupRenderer.addListener("created", this._onGroupItemCreated, this);

        this.removeBindings();

        this._list.getPane().fullUpdate();
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Helper method to get the widget from the passed row.
       *
       * @param row {Integer} row to search.
       * @return {qx.ui.core.Widget|null} The found widget or <code>null</code> when no widget found.
       */
      __getWidgetFrom: function __getWidgetFrom(row) {
        return this._list._layer.getRenderedCellWidget(row, 0);
      },

      /**
       * Helper method to update the states from a widget.
       *
       * @param widget {qx.ui.core.Widget} widget to set states.
       * @param states {Map} the state to set.
       */
      __updateStates: function __updateStates(widget, states) {
        if (widget == null) {
          return;
        }

        this._itemRenderer.updateStates(widget, states);
      }
    },
    destruct: function destruct() {
      this._itemRenderer.dispose();

      this._groupRenderer.dispose();

      this._itemRenderer = this._groupRenderer = null;
    }
  });
  qx.ui.list.provider.WidgetProvider.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-27.js.map
