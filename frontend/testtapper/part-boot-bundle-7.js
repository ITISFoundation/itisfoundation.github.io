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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Function": {
        "construct": true
      },
      "qx.lang.Type": {},
      "qx.Bootstrap": {},
      "qx.Promise": {},
      "qx.lang.String": {},
      "qx.type.BaseError": {},
      "qx.lang.Object": {},
      "qx.event.type.Data": {},
      "qx.util.Request": {},
      "qx.core.Assert": {},
      "qx.util.Serializer": {},
      "qx.lang.Json": {},
      "qx.util.Uri": {}
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * AbstractRequest serves as a base class for {@link qx.io.request.Xhr}
   * and {@link qx.io.request.Jsonp}. It contains methods to conveniently
   * communicate with transports found in {@link qx.bom.request}.
   *
   * The general procedure to derive a new request is to choose a
   * transport (override {@link #_createTransport}) and link
   * the transport’s response (override {@link #_getParsedResponse}).
   * The transport must implement {@link qx.bom.request.IRequest}.
   *
   * To adjust the behavior of {@link #send} override
   * {@link #_getConfiguredUrl} and {@link #_getConfiguredRequestHeaders}.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.io.request.AbstractRequest", {
    type: "abstract",
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /**
     * @param url {String?} The URL of the resource to request.
     */
    construct: function construct(url) {
      qx.core.Object.constructor.call(this);

      if (url !== undefined) {
        this.setUrl(url);
      }

      this.__requestHeaders = {};

      var transport = this._transport = this._createTransport();

      this._setPhase("unsent");

      this.__onReadyStateChangeBound = qx.lang.Function.bind(this._onReadyStateChange, this);
      this.__onLoadBound = qx.lang.Function.bind(this._onLoad, this);
      this.__onLoadEndBound = qx.lang.Function.bind(this._onLoadEnd, this);
      this.__onAbortBound = qx.lang.Function.bind(this._onAbort, this);
      this.__onTimeoutBound = qx.lang.Function.bind(this._onTimeout, this);
      this.__onErrorBound = qx.lang.Function.bind(this._onError, this);
      transport.onreadystatechange = this.__onReadyStateChangeBound;
      transport.onload = this.__onLoadBound;
      transport.onloadend = this.__onLoadEndBound;
      transport.onabort = this.__onAbortBound;
      transport.ontimeout = this.__onTimeoutBound;
      transport.onerror = this.__onErrorBound;
    },
    events: {
      /**
       * Fired on every change of the transport’s readyState.
       */
      "readyStateChange": "qx.event.type.Event",

      /**
       * Fired when request completes without error and transport’s status
       * indicates success.
       */
      "success": "qx.event.type.Event",

      /**
       * Fired when request completes without error.
       */
      "load": "qx.event.type.Event",

      /**
       * Fired when request completes with or without error.
       */
      "loadEnd": "qx.event.type.Event",

      /**
       * Fired when request is aborted.
       */
      "abort": "qx.event.type.Event",

      /**
       * Fired when request reaches timeout limit.
       */
      "timeout": "qx.event.type.Event",

      /**
       * Fired when request completes with error.
       */
      "error": "qx.event.type.Event",

      /**
       * Fired when request completes without error but erroneous HTTP status.
       */
      "statusError": "qx.event.type.Event",

      /**
       * Fired when the configured parser runs into an unrecoverable error.
       */
      "parseError": "qx.event.type.Data",

      /**
       * Fired on timeout, error or remote error.
       *
       * This event is fired for convenience. Usually, it is recommended
       * to handle error related events in a more fine-grained approach.
       */
      "fail": "qx.event.type.Event",

      /**
      * Fired on change of the parsed response.
      *
      * This event allows to use data binding with the
      * parsed response as source.
      *
      * For example, to bind the response to the value of a label:
      *
      * <pre class="javascript">
      * // req is an instance of qx.io.request.*,
      * // label an instance of qx.ui.basic.Label
      * req.bind("response", label, "value");
      * </pre>
      *
      * The response is parsed (and therefore changed) only
      * after the request completes successfully. This means
      * that when a new request is made the initial empty value
      * is ignored, instead only the final value is bound.
      *
      */
      "changeResponse": "qx.event.type.Data",

      /**
       * Fired on change of the phase.
       */
      "changePhase": "qx.event.type.Data"
    },
    properties: {
      /**
       * The URL of the resource to request.
       *
       * Note: Depending on the configuration of the request
       * and/or the transport chosen, query params may be appended
       * automatically.
       */
      url: {
        check: "String"
      },

      /**
       * Timeout limit in milliseconds. Default (0) means no limit.
       */
      timeout: {
        check: "Number",
        nullable: true,
        init: 0
      },

      /**
       * Data to be sent as part of the request.
       *
       * Supported types:
       *
       * * String
       * * Map
       * * qooxdoo Object
       * * Blob
       * * ArrayBuffer
       * * FormData
       *
       * For maps, Arrays and qooxdoo objects, a URL encoded string
       * with unsafe characters escaped is internally generated and sent
       * as part of the request.
       *
       * Depending on the underlying transport and its configuration, the request
       * data is transparently included as URL query parameters or embedded in the
       * request body as form data.
       *
       * If a string is given the user must make sure it is properly formatted and
       * escaped. See {@link qx.util.Serializer#toUriParameter}.
       *
       */
      requestData: {
        check: function check(value) {
          return qx.lang.Type.isString(value) || qx.Class.isSubClassOf(value.constructor, qx.core.Object) || qx.lang.Type.isObject(value) || qx.lang.Type.isArray(value) || qx.Bootstrap.getClass(value) == "Blob" || qx.Bootstrap.getClass(value) == "ArrayBuffer" || qx.Bootstrap.getClass(value) == "FormData";
        },
        nullable: true
      },

      /**
       * Authentication delegate.
       *
       * The delegate must implement {@link qx.io.request.authentication.IAuthentication}.
       */
      authentication: {
        check: "qx.io.request.authentication.IAuthentication",
        nullable: true
      }
    },
    members: {
      /**
       * Bound handlers.
       */
      __onReadyStateChangeBound: null,
      __onLoadBound: null,
      __onLoadEndBound: null,
      __onAbortBound: null,
      __onTimeoutBound: null,
      __onErrorBound: null,

      /**
       * Parsed response.
       */
      __response: null,

      /**
       * Abort flag.
       */
      __abort: null,

      /**
       * Current phase.
       */
      __phase: null,

      /**
       * Request headers.
       */
      __requestHeaders: null,

      /**
       * Request headers (deprecated).
       */
      __requestHeadersDeprecated: null,

      /**
       * Holds transport.
       */
      _transport: null,

      /**
       * Holds information about the parser status for the last request.
       */
      _parserFailed: false,

      /*
      ---------------------------------------------------------------------------
        CONFIGURE TRANSPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Create and return transport.
       *
       * This method MUST be overridden, unless the constructor is overridden as
       * well. It is called by the constructor and should return the transport that
       * is to be interfaced.
       *
       * @return {qx.bom.request} Transport.
       */
      _createTransport: function _createTransport() {
        throw new Error("Abstract method call");
      },

      /**
       * Get configured URL.
       *
       * A configured URL typically includes a query string that
       * encapsulates transport specific settings such as request
       * data or no-cache settings.
       *
       * This method MAY be overridden. It is called in {@link #send}
       * before the request is initialized.
       *
       * @return {String} The configured URL.
       */
      _getConfiguredUrl: function _getConfiguredUrl() {},

      /**
       * Get configuration related request headers.
       *
       * This method MAY be overridden to add request headers for features limited
       * to a certain transport.
       *
       * @return {Map} Map of request headers.
       */
      _getConfiguredRequestHeaders: function _getConfiguredRequestHeaders() {},

      /**
       * Get parsed response.
       *
       * Is called in the {@link #_onReadyStateChange} event handler
       * to parse and store the transport’s response.
       *
       * This method MUST be overridden.
       *
       * @return {String} The parsed response of the request.
       */
      _getParsedResponse: function _getParsedResponse() {
        throw new Error("Abstract method call");
      },

      /**
       * Get method.
       *
       * This method MAY be overridden. It is called in {@link #send}
       * before the request is initialized.
       *
       * @return {String} The method.
       */
      _getMethod: function _getMethod() {
        return "GET";
      },

      /**
       * Whether async.
       *
       * This method MAY be overridden. It is called in {@link #send}
       * before the request is initialized.
       *
       * @return {Boolean} Whether to process asynchronously.
       */
      _isAsync: function _isAsync() {
        return true;
      },

      /*
      ---------------------------------------------------------------------------
        INTERACT WITH TRANSPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Send request.
       */
      send: function send() {
        var transport = this._transport,
            url,
            method,
            async,
            requestData; //
        // Open request
        //

        url = this._getConfiguredUrl(); // Drop fragment (anchor) from URL as per
        // http://www.w3.org/TR/XMLHttpRequest/#the-open-method

        if (/\#/.test(url)) {
          url = url.replace(/\#.*/, "");
        }

        transport.timeout = this.getTimeout(); // Support transports with enhanced feature set

        method = this._getMethod();
        async = this._isAsync(); // Open

        if (qx.core.Environment.get("qx.debug.io")) {
          this.debug("Open low-level request with method: " + method + ", url: " + url + ", async: " + async);
        }

        transport.open(method, url, async);

        this._setPhase("opened"); //
        // Send request
        //


        requestData = this.getRequestData();

        if (["ArrayBuffer", "Blob", "FormData"].indexOf(qx.Bootstrap.getClass(requestData)) == -1) {
          requestData = this._serializeData(requestData);
        }

        this._setRequestHeaders(); // Send


        if (qx.core.Environment.get("qx.debug.io")) {
          this.debug("Send low-level request");
        }

        method == "GET" ? transport.send() : transport.send(requestData);

        this._setPhase("sent");
      },

      /**
      * The same as send() but also return a `qx.Promise` object. The promise
      * is resolved to this object if the request is successful.
      *
      * Calling `abort()` on the request object, rejects the promise. Calling
      * `cancel()` on the promise aborts the request if the request is not in a
      * final state.
      * If the promise has other listener paths, then cancelation of one path will
      * not have any effect on the request and consequently that call will not
      * affect the other paths.
      *
      * @param context {Object?} optional context to bind the qx.Promise.
      * @return {qx.Promise} The qx.Promise object
      * @throws {qx.type.BaseError} If the environment setting `qx.promise` is set to false
      */
      sendWithPromise: function sendWithPromise(context) {
        {
          context = context || this; // save this object's context

          var req = this;
          var promise = new qx.Promise(function (resolve, reject) {
            var listeners = [];
            var changeResponseListener = req.addListener("success", function (e) {
              listeners.forEach(req.removeListenerById.bind(req));
              resolve(req);
            }, this);
            listeners.push(changeResponseListener);
            var statusErrorListener = req.addListener("statusError", function (e) {
              listeners.forEach(req.removeListenerById.bind(req));
              var failMessage = qx.lang.String.format("%1: %2.", [req.getStatus(), req.getStatusText()]);
              var err = new qx.type.BaseError("statusError", failMessage);
              reject(err);
            }, this);
            listeners.push(statusErrorListener);
            var timeoutListener = req.addListener("timeout", function (e) {
              listeners.forEach(req.removeListenerById.bind(req));
              var failMessage = qx.lang.String.format("Request failed with timeout after %1 ms.", [req.getTimeout()]);
              var err = new qx.type.BaseError("timeout", failMessage);
              reject(err);
            }, this);
            listeners.push(timeoutListener);
            var parseErrorListener = req.addListener("parseError", function (e) {
              listeners.forEach(req.removeListenerById.bind(req));
              var failMessage = "Error parsing the response.";
              var err = new qx.type.BaseError("parseError", failMessage);
              reject(err);
            }, this);
            listeners.push(parseErrorListener);
            var abortListener = req.addListener("abort", function (e) {
              listeners.forEach(req.removeListenerById.bind(req));
              var failMessage = "Request aborted.";
              var err = new qx.type.BaseError("abort", failMessage);
              reject(err);
            }, this);
            listeners.push(abortListener);
            var errorListener = req.addListener("error", function (e) {
              listeners.forEach(req.removeListenerById.bind(req));
              var failMessage = "Request failed.";
              var err = new qx.type.BaseError("error", failMessage);
              reject(err);
            }, this);
            listeners.push(errorListener);
            req.send();
          }, context)["finally"](function () {
            if (req.getReadyState() !== 4) {
              req.abort();
            }
          });
          return promise; // eslint-disable-next-line no-else-return
        }
      },

      /**
       * Abort request.
       */
      abort: function abort() {
        if (qx.core.Environment.get("qx.debug.io")) {
          this.debug("Abort request");
        }

        this.__abort = true; // Update phase to "abort" before user handler are invoked [BUG #5485]

        this.__phase = "abort";

        this._transport.abort();
      },

      /*
      ---------------------------------------------------------------------------
       REQUEST HEADERS
      ---------------------------------------------------------------------------
      */

      /**
       * Apply configured request headers to transport.
       *
       * This method MAY be overridden to customize application of request headers
       * to transport.
       */
      _setRequestHeaders: function _setRequestHeaders() {
        var transport = this._transport,
            requestHeaders = this._getAllRequestHeaders();

        for (var key in requestHeaders) {
          transport.setRequestHeader(key, requestHeaders[key]);
        }
      },

      /**
       * Get all request headers.
       *
       * @return {Map} All request headers.
       */
      _getAllRequestHeaders: function _getAllRequestHeaders() {
        var requestHeaders = {}; // Transport specific headers

        qx.lang.Object.mergeWith(requestHeaders, this._getConfiguredRequestHeaders()); // Authentication delegate

        qx.lang.Object.mergeWith(requestHeaders, this.__getAuthRequestHeaders()); // User-defined, requestHeaders property (deprecated)

        qx.lang.Object.mergeWith(requestHeaders, this.__requestHeadersDeprecated); // User-defined

        qx.lang.Object.mergeWith(requestHeaders, this.__requestHeaders);
        return requestHeaders;
      },

      /**
      * Retrieve authentication headers from auth delegate.
      *
      * @return {Map} Authentication related request headers.
      */
      __getAuthRequestHeaders: function __getAuthRequestHeaders() {
        var auth = this.getAuthentication(),
            headers = {};

        if (auth) {
          auth.getAuthHeaders().forEach(function (header) {
            headers[header.key] = header.value;
          });
          return headers;
        }
      },

      /**
       * Set a request header.
       *
       * Note: Setting request headers has no effect after the request was send.
       *
       * @param key {String} Key of the header.
       * @param value {String} Value of the header.
       */
      setRequestHeader: function setRequestHeader(key, value) {
        this.__requestHeaders[key] = value;
      },

      /**
       * Get a request header.
       *
       * @param key {String} Key of the header.
       * @return {String} The value of the header.
       */
      getRequestHeader: function getRequestHeader(key) {
        return this.__requestHeaders[key];
      },

      /**
       * Remove a request header.
       *
       * Note: Removing request headers has no effect after the request was send.
       *
       * @param key {String} Key of the header.
       */
      removeRequestHeader: function removeRequestHeader(key) {
        if (this.__requestHeaders[key]) {
          delete this.__requestHeaders[key];
        }
      },

      /*
      ---------------------------------------------------------------------------
       QUERY TRANSPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Get low-level transport.
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
       * Get current ready state.
       *
       * States can be:
       * UNSENT:           0,
       * OPENED:           1,
       * HEADERS_RECEIVED: 2,
       * LOADING:          3,
       * DONE:             4
       *
       * @return {Number} Ready state.
       */
      getReadyState: function getReadyState() {
        return this._transport.readyState;
      },

      /**
       * Get current phase.
       *
       * A more elaborate version of {@link #getReadyState}, this method indicates
       * the current phase of the request. Maps to stateful (i.e. deterministic)
       * events (success, abort, timeout, statusError) and intermediate
       * readyStates (unsent, configured, loading, load).
       *
       * When the requests is successful, it progresses the states:<br>
       * 'unsent', 'opened', 'sent', 'loading', 'load', 'success'
       *
       * In case of failure, the final state is one of:<br>
       * 'abort', 'timeout', 'statusError'
       *
       * For each change of the phase, a {@link #changePhase} data event is fired.
       *
       * @return {String} Current phase.
       *
       */
      getPhase: function getPhase() {
        return this.__phase;
      },

      /**
       * Get status code.
       *
       * @return {Number} The transport’s status code.
       */
      getStatus: function getStatus() {
        return this._transport.status;
      },

      /**
       * Get status text.
       *
       * @return {String} The transport’s status text.
       */
      getStatusText: function getStatusText() {
        return this._transport.statusText;
      },

      /**
       * Get raw (unprocessed) response.
       *
       * @return {String} The raw response of the request.
       */
      getResponseText: function getResponseText() {
        return this._transport.responseText;
      },

      /**
       * Get all response headers from response.
       *
       * @return {String} All response headers.
       */
      getAllResponseHeaders: function getAllResponseHeaders() {
        return this._transport.getAllResponseHeaders();
      },

      /**
       * Get a single response header from response.
       *
       * @param key {String}
       *   Key of the header to get the value from.
       * @return {String}
       *   Response header.
       */
      getResponseHeader: function getResponseHeader(key) {
        return this._transport.getResponseHeader(key);
      },

      /**
       * Override the content type response header from response.
       *
       * @param contentType {String}
       *   Content type for overriding.
       * @see qx.bom.request.Xhr#overrideMimeType
       */
      overrideResponseContentType: function overrideResponseContentType(contentType) {
        return this._transport.overrideMimeType(contentType);
      },

      /**
       * Get the content type response header from response.
       *
       * @return {String}
       *   Content type response header.
       */
      getResponseContentType: function getResponseContentType() {
        return this.getResponseHeader("Content-Type");
      },

      /**
       * Whether request completed (is done).
       */
      isDone: function isDone() {
        return this.getReadyState() === 4;
      },

      /*
      ---------------------------------------------------------------------------
        RESPONSE
      ---------------------------------------------------------------------------
      */

      /**
       * Get parsed response.
       *
       * @return {String} The parsed response of the request.
       */
      getResponse: function getResponse() {
        return this.__response;
      },

      /**
       * Set response.
       *
       * @param response {String} The parsed response of the request.
       */
      _setResponse: function _setResponse(response) {
        var oldResponse = response;

        if (this.__response !== response) {
          this.__response = response;
          this.fireEvent("changeResponse", qx.event.type.Data, [this.__response, oldResponse]);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Handle "readyStateChange" event.
       */
      _onReadyStateChange: function _onReadyStateChange() {
        var readyState = this.getReadyState();

        if (qx.core.Environment.get("qx.debug.io")) {
          this.debug("Fire readyState: " + readyState);
        }

        this.fireEvent("readyStateChange"); // Transport switches to readyState DONE on abort and may already
        // have successful HTTP status when response is served from cache.
        //
        // Not fire custom event "loading" (or "success", when cached).

        if (this.__abort) {
          return;
        }

        if (readyState === 3) {
          this._setPhase("loading");
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
          this.debug("Request completed with HTTP status: " + this.getStatus());
        } // Event "load" fired in onLoad


        this._setPhase("load"); // Successful HTTP status


        if (qx.util.Request.isSuccessful(this.getStatus())) {
          // Parse response
          if (qx.core.Environment.get("qx.debug.io")) {
            this.debug("Response is of type: '" + this.getResponseContentType() + "'");
          }

          this._setResponse(this._getParsedResponse());

          if (this._parserFailed) {
            this.fireEvent("fail");
          } else {
            this._fireStatefulEvent("success");
          } // Erroneous HTTP status

        } else {
          try {
            this._setResponse(this._getParsedResponse());
          } catch (e) {} // ignore if it does not work
          // A remote error failure


          if (this.getStatus() !== 0) {
            this._fireStatefulEvent("statusError");

            this.fireEvent("fail");
          }
        }
      },

      /**
       * Handle "load" event.
       */
      _onLoad: function _onLoad() {
        this.fireEvent("load");
      },

      /**
       * Handle "loadEnd" event.
       */
      _onLoadEnd: function _onLoadEnd() {
        this.fireEvent("loadEnd");
      },

      /**
       * Handle "abort" event.
       */
      _onAbort: function _onAbort() {
        this._fireStatefulEvent("abort");
      },

      /**
       * Handle "timeout" event.
       */
      _onTimeout: function _onTimeout() {
        this._fireStatefulEvent("timeout"); // A network error failure


        this.fireEvent("fail");
      },

      /**
       * Handle "error" event.
       */
      _onError: function _onError() {
        this.fireEvent("error"); // A network error failure

        this.fireEvent("fail");
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL / HELPERS
      ---------------------------------------------------------------------------
      */

      /**
       * Fire stateful event.
       *
       * Fires event and sets phase to name of event.
       *
       * @param evt {String} Name of the event to fire.
       */
      _fireStatefulEvent: function _fireStatefulEvent(evt) {
        {
          qx.core.Assert.assertString(evt);
        }

        this._setPhase(evt);

        this.fireEvent(evt);
      },

      /**
       * Set phase.
       *
       * @param phase {String} The phase to set.
       */
      _setPhase: function _setPhase(phase) {
        var previousPhase = this.__phase;
        {
          qx.core.Assert.assertString(phase);
          qx.core.Assert.assertMatch(phase, /^(unsent)|(opened)|(sent)|(loading)|(load)|(success)|(abort)|(timeout)|(statusError)$/);
        }
        this.__phase = phase;
        this.fireDataEvent("changePhase", phase, previousPhase);
      },

      /**
       * Serialize data.
       *
       * @param data {String|Map|qx.core.Object} Data to serialize.
       * @return {String|null} Serialized data.
       */
      _serializeData: function _serializeData(data) {
        var isPost = typeof this.getMethod !== "undefined" && this.getMethod() == "POST",
            isJson = /application\/.*\+?json/.test(this.getRequestHeader("Content-Type"));

        if (!data) {
          return null;
        }

        if (qx.lang.Type.isString(data)) {
          return data;
        }

        if (qx.Class.isSubClassOf(data.constructor, qx.core.Object)) {
          return qx.util.Serializer.toUriParameter(data);
        }

        if (isJson && (qx.lang.Type.isObject(data) || qx.lang.Type.isArray(data))) {
          return qx.lang.Json.stringify(data);
        }

        if (qx.lang.Type.isObject(data)) {
          return qx.util.Uri.toParameter(data, isPost);
        }

        return null;
      }
    },
    environment: {
      "qx.debug.io": false
    },
    destruct: function destruct() {
      var transport = this._transport,
          noop = function noop() {};

      if (this._transport) {
        transport.onreadystatechange = transport.onload = transport.onloadend = transport.onabort = transport.ontimeout = transport.onerror = noop; // [BUG #8315] dispose asynchronously to work with Sinon.js fake server

        window.setTimeout(function () {
          transport.dispose();
        }, 0);
      }
    }
  });
  qx.io.request.AbstractRequest.$$dbClassInfo = $$dbClassInfo;
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
      "qx.io.request.AbstractRequest": {
        "construct": true,
        "require": true
      },
      "qx.lang.Type": {},
      "qx.bom.request.Xhr": {},
      "qx.util.Uri": {},
      "qx.util.Request": {},
      "qx.util.ResponseParser": {}
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * Send HTTP requests and handle responses using the HTTP client API.
   *
   * Configuration of the request is done with properties. Events are fired for
   * various states in the life cycle of a request, such as "success". Request
   * data is transparently processed.
   *
   * Here is how to request a JSON file and listen to the "success" event:
   *
   * <pre class="javascript">
   * var req = new qx.io.request.Xhr("/some/path/file.json");
   *
   * req.addListener("success", function(e) {
   *   var req = e.getTarget();
   *
   *   // Response parsed according to the server's
   *   // response content type, e.g. JSON
   *   req.getResponse();
   * }, this);
   *
   * // Send request
   * req.send();
   * </pre>
   *
   * Some noteable features:
   *
   * * Abstraction of low-level request
   * * Convenient setup using properties
   * * Fine-grained events
   * * Symbolic phases
   * * Transparent processing of request data
   * * Stream-lined authentication
   * * Automagic parsing of response based on content type
   *
   * Cross-origin requests are supported, but require browser support
   * (see <a href="http://caniuse.com/#search=CORS">caniuse.com</a>) and backend configuration
   * (see <a href="https://developer.mozilla.org/en-US/docs/docs/HTTP/Access_control_CORS>MDN</a>).
   * Note that IE's <code>XDomainRequest</code> is not currently supported.
   * For a cross-browser alternative, consider {@link qx.io.request.Jsonp}.
   *
   * In order to debug requests, set the environment flag
   * <code>qx.debug.io</code>.
   *
   * Internally uses {@link qx.bom.request.Xhr}.
   */
  qx.Class.define("qx.io.request.Xhr", {
    extend: qx.io.request.AbstractRequest,

    /**
     * @param url {String?} The URL of the resource to request.
     * @param method {String?} The HTTP method.
     */
    construct: function construct(url, method) {
      if (method !== undefined) {
        this.setMethod(method);
      }

      qx.io.request.AbstractRequest.constructor.call(this, url);
      this._parser = this._createResponseParser();
    },
    // Only document events with transport specific details.
    // For a complete list of events, refer to AbstractRequest.
    events: {
      /**
       * Fired on every change of the transport’s readyState.
       *
       * See {@link qx.bom.request.Xhr} for available readyStates.
       */
      "readyStateChange": "qx.event.type.Event",

      /**
       * Fired when request completes without error and transport status
       * indicates success.
       *
       * Refer to {@link qx.util.Request#isSuccessful} for a list of HTTP
       * status considered successful.
       */
      "success": "qx.event.type.Event",

      /**
       * Fired when request completes without error.
       *
       * Every request not canceled or aborted completes. This means that
       * even requests receiving a response with erroneous HTTP status
       * fire a "load" event. If you are only interested in successful
       * responses, listen to the {@link #success} event instead.
       */
      "load": "qx.event.type.Event",

      /**
       * Fired when request completes without error but erroneous HTTP status.
       *
       * Refer to {@link qx.util.Request#isSuccessful} for a list of HTTP
       * status considered successful.
       */
      "statusError": "qx.event.type.Event"
    },
    properties: {
      /**
       * The HTTP method.
       */
      method: {
        init: "GET"
      },

      /**
       * Whether the request should be executed asynchronously.
       */
      async: {
        check: "Boolean",
        init: true
      },

      /**
       * The content type to accept. By default, every content type
       * is accepted.
       *
       * Note: Some backends send distinct representations of the same
       * resource depending on the content type accepted. For instance,
       * a backend may respond with either a JSON (the accept header
       * indicates so) or a HTML representation (the default, no accept
       * header given).
       */
      accept: {
        check: "String",
        nullable: true
      },

      /**
       * Whether to allow request to be answered from cache.
       *
       * Allowed values:
       *
       * * <code>true</code>: Allow caching (Default)
       * * <code>false</code>: Prohibit caching. Appends nocache parameter to URL.
       * * <code>String</code>: Any Cache-Control request directive
       *
       * If a string is given, it is inserted in the request's Cache-Control
       * header. A request’s Cache-Control header may contain a number of directives
       * controlling the behavior of any caches in between client and origin
       * server.
       *
       * * <code>"no-cache"</code>: Force caches to submit request in order to
       *   validate the freshness of the representation. Note that the requested
       *   resource may still be served from cache if the representation is
       *   considered fresh. Use this directive to ensure freshness but save
       *   bandwidth when possible.
       * * <code>"no-store"</code>: Do not keep a copy of the representation under
       *   any conditions.
       *
       * See <a href="http://www.mnot.net/cache_docs/#CACHE-CONTROL">
       * Caching tutorial</a> for an excellent introduction to Caching in general.
       * Refer to the corresponding section in the
       * <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9">
       * HTTP 1.1 specification</a> for more details and advanced directives.
       *
       * It is recommended to choose an appropriate Cache-Control directive rather
       * than prohibit caching using the nocache parameter.
       */
      cache: {
        check: function check(value) {
          return qx.lang.Type.isBoolean(value) || qx.lang.Type.isString(value);
        },
        init: true
      }
    },
    members: {
      /**
       * @type {Function} Parser.
       */
      _parser: null,

      /*
      ---------------------------------------------------------------------------
        CONFIGURE TRANSPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Create XHR transport.
       *
       * @return {qx.bom.request.Xhr} Transport.
       */
      _createTransport: function _createTransport() {
        return new qx.bom.request.Xhr();
      },

      /**
       * Get configured URL.
       *
       * Append request data to URL if HTTP method is GET. Append random
       * string to URL if required by value of {@link #cache}.
       *
       * @return {String} The configured URL.
       */
      _getConfiguredUrl: function _getConfiguredUrl() {
        var url = this.getUrl(),
            serializedData;

        if (this.getMethod() === "GET" && this.getRequestData()) {
          serializedData = this._serializeData(this.getRequestData());
          url = qx.util.Uri.appendParamsToUrl(url, serializedData);
        }

        if (this.getCache() === false) {
          // Make sure URL cannot be served from cache and new request is made
          url = qx.util.Uri.appendParamsToUrl(url, {
            nocache: new Date().valueOf()
          });
        }

        return url;
      },
      // overridden
      _getConfiguredRequestHeaders: function _getConfiguredRequestHeaders() {
        var headers = {},
            isAllowsBody = qx.util.Request.methodAllowsRequestBody(this.getMethod()); // Follow convention to include X-Requested-With header when same origin

        if (!qx.util.Request.isCrossDomain(this.getUrl())) {
          headers["X-Requested-With"] = "XMLHttpRequest";
        } // Include Cache-Control header if configured


        if (qx.lang.Type.isString(this.getCache())) {
          headers["Cache-Control"] = this.getCache();
        } // By default, set content-type urlencoded for requests with body


        if (this.getRequestData() && isAllowsBody) {
          headers["Content-Type"] = "application/x-www-form-urlencoded";
        } // What representations to accept


        if (this.getAccept()) {
          if (qx.core.Environment.get("qx.debug.io")) {
            this.debug("Accepting: '" + this.getAccept() + "'");
          }

          headers["Accept"] = this.getAccept();
        }

        return headers;
      },
      // overridden
      _getMethod: function _getMethod() {
        return this.getMethod();
      },
      // overridden
      _isAsync: function _isAsync() {
        return this.isAsync();
      },

      /*
      ---------------------------------------------------------------------------
        PARSING
      ---------------------------------------------------------------------------
      */

      /**
       * Create response parser.
       *
       * @return {qx.util.ResponseParser} parser.
       */
      _createResponseParser: function _createResponseParser() {
        return new qx.util.ResponseParser();
      },

      /**
       * Returns response parsed with parser determined by content type.
       *
       * @return {String|Object} The parsed response of the request.
       */
      _getParsedResponse: function _getParsedResponse() {
        var response = this._transport.responseType === 'blob' ? this._transport.response : this._transport.responseText,
            contentType = this.getResponseContentType() || "",
            parsedResponse = "";

        try {
          parsedResponse = this._parser.parse(response, contentType);
          this._parserFailed = false;
        } catch (e) {
          this._parserFailed = true;
          this.fireDataEvent("parseError", {
            error: e,
            response: response
          });
        }

        return parsedResponse;
      },

      /**
       * Set parser used to parse response once request has
       * completed successfully.
       *
       * @see qx.util.ResponseParser#setParser
       *
       * @param parser {String|Function}
       * @return {Function} The parser function
       */
      setParser: function setParser(parser) {
        return this._parser.setParser(parser);
      }
    }
  });
  qx.io.request.Xhr.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-7.js.map
