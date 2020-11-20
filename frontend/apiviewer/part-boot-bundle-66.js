(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.io.remote.transport.Iframe": {},
      "qx.io.remote.transport.Script": {},
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
      "qx.lang.Object": {},
      "qx.log.Logger": {},
      "qx.io.remote.transport.XmlHttp": {},
      "qx.event.Registration": {},
      "qx.io.remote.Response": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.debug.io.remote": {}
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
       2006 Derrell Lipman
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Derrell Lipman (derrell)
       * Andreas Junghans (lucidcake)
  
  ************************************************************************ */

  /**
   * Transport layer to control which transport class (XmlHttp, Iframe or Script)
   * can be used.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @use(qx.io.remote.transport.Iframe)
   * @use(qx.io.remote.transport.Script)
   * @internal
   */
  qx.Class.define("qx.io.remote.Exchange", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Constructor method.
     *
     * @param vRequest {qx.io.remote.Request} request object
     */
    construct: function construct(vRequest) {
      qx.core.Object.constructor.call(this);
      this.setRequest(vRequest);
      vRequest.setTransport(this);
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired whenever a request is send */
      "sending": "qx.event.type.Event",

      /** Fired whenever a request is received */
      "receiving": "qx.event.type.Event",

      /** Fired whenever a request is completed */
      "completed": "qx.io.remote.Response",

      /** Fired whenever a request is aborted */
      "aborted": "qx.event.type.Event",

      /** Fired whenever a request has failed */
      "failed": "qx.io.remote.Response",

      /** Fired whenever a request has timed out */
      "timeout": "qx.io.remote.Response"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /* ************************************************************************
         Class data, properties and methods
      ************************************************************************ */

      /*
      ---------------------------------------------------------------------------
        TRANSPORT TYPE HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Predefined order of types.
       *
       * @internal
       */
      typesOrder: ["qx.io.remote.transport.XmlHttp", "qx.io.remote.transport.Iframe", "qx.io.remote.transport.Script"],

      /**
       * Marker for initialized types.
       *
       * @internal
       */
      typesReady: false,

      /**
       * Map of all available types.
       *
       * @internal
       */
      typesAvailable: {},

      /**
       * Map of all supported types.
       *
       * @internal
       */
      typesSupported: {},

      /**
       * Registers a transport type.
       * At the moment one out of XmlHttp, Iframe or Script.
       *
       * @param vClass {Object} transport class
       * @param vId {String} unique id
       */
      registerType: function registerType(vClass, vId) {
        qx.io.remote.Exchange.typesAvailable[vId] = vClass;
      },

      /**
       * Initializes the available type of transport classes and
       * checks for the supported ones.
       *
       * @throws {Error} an error if no supported transport type is available
       */
      initTypes: function initTypes() {
        if (qx.io.remote.Exchange.typesReady) {
          return;
        }

        for (var vId in qx.io.remote.Exchange.typesAvailable) {
          var vTransporterImpl = qx.io.remote.Exchange.typesAvailable[vId];

          if (vTransporterImpl.isSupported()) {
            qx.io.remote.Exchange.typesSupported[vId] = vTransporterImpl;
          }
        }

        qx.io.remote.Exchange.typesReady = true;

        if (qx.lang.Object.isEmpty(qx.io.remote.Exchange.typesSupported)) {
          throw new Error("No supported transport types were found!");
        }
      },

      /**
       * Checks which supported transport class can handle the request with the
       * given content type.
       *
       * @param vImpl {Object} transport implementation
       * @param vNeeds {Map} requirements for the request like e.g. "cross-domain"
       * @param vResponseType {String} content type
       * @return {Boolean} <code>true</code> if the transport implementation supports
       * the request's requirements
       */
      canHandle: function canHandle(vImpl, vNeeds, vResponseType) {
        if (!vImpl.handles.responseTypes.includes(vResponseType)) {
          return false;
        }

        for (var vKey in vNeeds) {
          if (!vImpl.handles[vKey]) {
            return false;
          }
        }

        return true;
      },

      /*
      ---------------------------------------------------------------------------
        MAPPING
      ---------------------------------------------------------------------------
      */

      /**
       * http://msdn.microsoft.com/en-us/library/ie/ms534359%28v=vs.85%29.aspx
       *
       * 0: UNINITIALIZED
       * The object has been created, but not initialized (the open method has not been called).
       *
       * 1: LOADING
       * The object has been created, but the send method has not been called.
       *
       * 2: LOADED
       * The send method has been called, but the status and headers are not yet available.
       *
       * 3: INTERACTIVE
       * Some data has been received. Calling the responseBody and responseText properties at this state to obtain partial results will return an error, because status and response headers are not fully available.
       *
       * 4: COMPLETED
       * All the data has been received, and the complete data is available in the
       *
       * @internal
       */
      _nativeMap: {
        0: "created",
        1: "configured",
        2: "sending",
        3: "receiving",
        4: "completed"
      },

      /*
      ---------------------------------------------------------------------------
        UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Called from the transport class when a request was completed.
       *
       * @param vStatusCode {Integer} status code of the request
       * @param vReadyState {String} readystate of the request
       * @param vIsLocal {Boolean} whether the request is a local one
       * @return {Boolean | var} Returns boolean value depending on the status code
       */
      wasSuccessful: function wasSuccessful(vStatusCode, vReadyState, vIsLocal) {
        if (vIsLocal) {
          switch (vStatusCode) {
            case null:
            case 0:
              return true;

            case -1:
              // Not Available (OK for readystates: MSXML<4=1-3, MSXML>3=1-2, Gecko=1)
              return vReadyState < 4;

            default:
              // at least older versions of Safari don't set the status code for local file access
              return typeof vStatusCode === "undefined";
          }
        } else {
          switch (vStatusCode) {
            case -1:
              // Not Available (OK for readystates: MSXML<4=1-3, MSXML>3=1-2, Gecko=1)
              {
                if (qx.core.Environment.get("qx.debug.io.remote") && vReadyState > 3) {
                  qx.log.Logger.debug(this, "Failed with statuscode: -1 at readyState " + vReadyState);
                }
              }
              return vReadyState < 4;

            case 200: // OK

            case 304:
              // Not Modified
              return true;

            case 201: // Created

            case 202: // Accepted

            case 203: // Non-Authoritative Information

            case 204: // No Content

            case 205:
              // Reset Content
              return true;

            case 206:
              // Partial Content
              {
                if (qx.core.Environment.get("qx.debug.io.remote") && vReadyState === 4) {
                  qx.log.Logger.debug(this, "Failed with statuscode: 206 (Partial content while being complete!)");
                }
              }
              return vReadyState !== 4;

            case 300: // Multiple Choices

            case 301: // Moved Permanently

            case 302: // Moved Temporarily

            case 303: // See Other

            case 305: // Use Proxy

            case 400: // Bad Request

            case 401: // Unauthorized

            case 402: // Payment Required

            case 403: // Forbidden

            case 404: // Not Found

            case 405: // Method Not Allowed

            case 406: // Not Acceptable

            case 407: // Proxy Authentication Required

            case 408: // Request Time-Out

            case 409: // Conflict

            case 410: // Gone

            case 411: // Length Required

            case 412: // Precondition Failed

            case 413: // Request Entity Too Large

            case 414: // Request-URL Too Large

            case 415: // Unsupported Media Type

            case 500: // Server Error

            case 501: // Not Implemented

            case 502: // Bad Gateway

            case 503: // Out of Resources

            case 504: // Gateway Time-Out

            case 505:
              // HTTP Version not supported
              {
                if (qx.core.Environment.get("qx.debug.io.remote")) {
                  qx.log.Logger.debug(this, "Failed with typical HTTP statuscode: " + vStatusCode);
                }
              }
              return false;
            // The following case labels are wininet.dll error codes that may
            // be encountered.
            // Server timeout

            case 12002: // Internet Name Not Resolved

            case 12007: // 12029 to 12031 correspond to dropped connections.

            case 12029:
            case 12030:
            case 12031: // Connection closed by server.

            case 12152: // See above comments for variable status.

            case 13030:
              {
                if (qx.core.Environment.get("qx.debug.io.remote")) {
                  qx.log.Logger.debug(this, "Failed with MSHTML specific HTTP statuscode: " + vStatusCode);
                }
              }
              return false;

            default:
              // Handle all 20x status codes as OK as defined in the corresponding RFC
              // http://www.w3.org/Protocols/rfc2616/rfc2616.html
              if (vStatusCode > 206 && vStatusCode < 300) {
                return true;
              }

              qx.log.Logger.debug(this, "Unknown status code: " + vStatusCode + " (" + vReadyState + ")");
              return false;
          }
        }
      },

      /**
       * Status code to string conversion
       *
       * @param vStatusCode {Integer} request status code
       * @return {String} String presentation of status code
       */
      statusCodeToString: function statusCodeToString(vStatusCode) {
        switch (vStatusCode) {
          case -1:
            return "Not available";

          case 0:
            // Attempt to generate a potentially meaningful error.
            // Get the current URL
            var url = window.location.href; // Are we on a local page obtained via file: protocol?

            if (url.toLowerCase().startsWith("file:")) {
              // Yup. Can't issue remote requests from here.
              return "Unknown status code. Possibly due to application URL using 'file:' protocol?";
            } else {
              return "Unknown status code. Possibly due to a cross-domain request?";
            }

            break;

          case 200:
            return "Ok";

          case 304:
            return "Not modified";

          case 206:
            return "Partial content";

          case 204:
            return "No content";

          case 300:
            return "Multiple choices";

          case 301:
            return "Moved permanently";

          case 302:
            return "Moved temporarily";

          case 303:
            return "See other";

          case 305:
            return "Use proxy";

          case 400:
            return "Bad request";

          case 401:
            return "Unauthorized";

          case 402:
            return "Payment required";

          case 403:
            return "Forbidden";

          case 404:
            return "Not found";

          case 405:
            return "Method not allowed";

          case 406:
            return "Not acceptable";

          case 407:
            return "Proxy authentication required";

          case 408:
            return "Request time-out";

          case 409:
            return "Conflict";

          case 410:
            return "Gone";

          case 411:
            return "Length required";

          case 412:
            return "Precondition failed";

          case 413:
            return "Request entity too large";

          case 414:
            return "Request-URL too large";

          case 415:
            return "Unsupported media type";

          case 500:
            return "Server error";

          case 501:
            return "Not implemented";

          case 502:
            return "Bad gateway";

          case 503:
            return "Out of resources";

          case 504:
            return "Gateway time-out";

          case 505:
            return "HTTP version not supported";

          case 12002:
            return "Server timeout";

          case 12029:
            return "Connection dropped";

          case 12030:
            return "Connection dropped";

          case 12031:
            return "Connection dropped";

          case 12152:
            return "Connection closed by server";

          case 13030:
            return "MSHTML-specific HTTP status code";

          default:
            return "Unknown status code";
        }
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Set the request to send with this transport. */
      request: {
        check: "qx.io.remote.Request",
        nullable: true
      },

      /**
       * Set the implementation to use to send the request with.
       *
       *  The implementation should be a subclass of qx.io.remote.transport.Abstract and
       *  must implement all methods in the transport API.
       */
      implementation: {
        check: "qx.io.remote.transport.Abstract",
        nullable: true,
        apply: "_applyImplementation"
      },

      /** Current state of the transport layer. */
      state: {
        check: ["configured", "sending", "receiving", "completed", "aborted", "timeout", "failed"],
        init: "configured",
        event: "changeState",
        apply: "_applyState"
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
        CORE METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Sends the request.
       *
       * @return {var | Boolean} Returns true if the request was sent.
       * @lint ignoreUnused(field)
       */
      send: function send() {
        var vRequest = this.getRequest();

        if (!vRequest) {
          return this.error("Please attach a request object first");
        }

        qx.io.remote.Exchange.initTypes();
        var vUsage = qx.io.remote.Exchange.typesOrder;
        var vSupported = qx.io.remote.Exchange.typesSupported; // Mapping settings to contenttype and needs to check later
        // if the selected transport implementation can handle
        // fulfill these requirements.

        var vResponseType = vRequest.getResponseType();
        var vNeeds = {};

        if (vRequest.getAsynchronous()) {
          vNeeds.asynchronous = true;
        } else {
          vNeeds.synchronous = true;
        }

        if (vRequest.getCrossDomain()) {
          vNeeds.crossDomain = true;
        }

        if (vRequest.getFileUpload()) {
          vNeeds.fileUpload = true;
        } // See if there are any programmatic form fields requested


        for (var field in vRequest.getFormFields()) {
          // There are.
          vNeeds.programmaticFormFields = true; // No need to search further

          break;
        }

        var vTransportImpl, vTransport;

        for (var i = 0, l = vUsage.length; i < l; i++) {
          vTransportImpl = vSupported[vUsage[i]];

          if (vTransportImpl) {
            if (!qx.io.remote.Exchange.canHandle(vTransportImpl, vNeeds, vResponseType)) {
              continue;
            }

            try {
              {
                if (qx.core.Environment.get("qx.debug.io.remote")) {
                  this.debug("Using implementation: " + vTransportImpl.classname);
                }
              }
              vTransport = new vTransportImpl();
              this.setImplementation(vTransport);
              vTransport.setUseBasicHttpAuth(vRequest.getUseBasicHttpAuth());
              vTransport.send();
              return true;
            } catch (ex) {
              this.error("Request handler throws error");
              this.error(ex);
              return false;
            }
          }
        }

        this.error("There is no transport implementation available to handle this request: " + vRequest);
      },

      /**
       * Force the transport into the aborted ("aborted")
       *  state.
       *
       */
      abort: function abort() {
        var vImplementation = this.getImplementation();

        if (vImplementation) {
          {
            if (qx.core.Environment.get("qx.debug.io.remote")) {
              this.debug("Abort: implementation " + vImplementation.toHashCode());
            }
          }
          vImplementation.abort();
        } else {
          {
            if (qx.core.Environment.get("qx.debug.io.remote")) {
              this.debug("Abort: forcing state to be aborted");
            }
          }
          this.setState("aborted");
        }
      },

      /**
       * Force the transport into the timeout state.
       *
       */
      timeout: function timeout() {
        var vImplementation = this.getImplementation();

        if (vImplementation) {
          var str = "";

          for (var key in vImplementation.getParameters()) {
            str += "&" + key + "=" + vImplementation.getParameters()[key];
          }

          this.warn("Timeout: implementation " + vImplementation.toHashCode() + ", " + vImplementation.getUrl() + " [" + vImplementation.getMethod() + "], " + str);
          vImplementation.timeout();
        } else {
          this.warn("Timeout: forcing state to timeout");
          this.setState("timeout");
        } // Disable future timeouts in case user handler blocks


        this.__disableRequestTimeout();
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATES
      ---------------------------------------------------------------------------
      */

      /**
       * Disables the timer of the request to prevent that the timer is expiring
       * even if the user handler (e.g. "completed") was already called.
       *
       */
      __disableRequestTimeout: function __disableRequestTimeout() {
        var vRequest = this.getRequest();

        if (vRequest) {
          vRequest.setTimeout(0);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for "sending" event.
       *
       * @param e {qx.event.type.Event} event object
       */
      _onsending: function _onsending(e) {
        this.setState("sending");
      },

      /**
       * Event listener for "receiving" event.
       *
       * @param e {qx.event.type.Event} event object
       */
      _onreceiving: function _onreceiving(e) {
        this.setState("receiving");
      },

      /**
       * Event listener for "completed" event.
       *
       * @param e {qx.event.type.Event} event object
       */
      _oncompleted: function _oncompleted(e) {
        this.setState("completed");
      },

      /**
       * Event listener for "abort" event.
       *
       * @param e {qx.event.type.Event} event object
       */
      _onabort: function _onabort(e) {
        this.setState("aborted");
      },

      /**
       * Event listener for "failed" event.
       *
       * @param e {qx.event.type.Event} event object
       */
      _onfailed: function _onfailed(e) {
        this.setState("failed");
      },

      /**
       * Event listener for "timeout" event.
       *
       * @param e {qx.event.type.Event} event object
       */
      _ontimeout: function _ontimeout(e) {
        this.setState("timeout");
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */

      /**
       * Apply method for the implementation property.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyImplementation: function _applyImplementation(value, old) {
        if (old) {
          old.removeListener("sending", this._onsending, this);
          old.removeListener("receiving", this._onreceiving, this);
          old.removeListener("completed", this._oncompleted, this);
          old.removeListener("aborted", this._onabort, this);
          old.removeListener("timeout", this._ontimeout, this);
          old.removeListener("failed", this._onfailed, this);
        }

        if (value) {
          var vRequest = this.getRequest();
          value.setUrl(vRequest.getUrl());
          value.setMethod(vRequest.getMethod());
          value.setAsynchronous(vRequest.getAsynchronous());
          value.setUsername(vRequest.getUsername());
          value.setPassword(vRequest.getPassword());
          value.setParameters(vRequest.getParameters(false));
          value.setFormFields(vRequest.getFormFields());
          value.setRequestHeaders(vRequest.getRequestHeaders()); // Set the parseJson property which is currently only supported for XmlHttp transport
          // (which is the only transport supporting JSON parsing so far).

          if (value instanceof qx.io.remote.transport.XmlHttp) {
            value.setParseJson(vRequest.getParseJson());
          }

          var data = vRequest.getData();

          if (data === null) {
            var vParameters = vRequest.getParameters(true);
            var vParametersList = [];

            for (var vId in vParameters) {
              var paramValue = vParameters[vId];

              if (paramValue instanceof Array) {
                for (var i = 0; i < paramValue.length; i++) {
                  vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(paramValue[i]));
                }
              } else {
                vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(paramValue));
              }
            }

            if (vParametersList.length > 0) {
              value.setData(vParametersList.join("&"));
            }
          } else {
            value.setData(data);
          }

          value.setResponseType(vRequest.getResponseType());
          value.addListener("sending", this._onsending, this);
          value.addListener("receiving", this._onreceiving, this);
          value.addListener("completed", this._oncompleted, this);
          value.addListener("aborted", this._onabort, this);
          value.addListener("timeout", this._ontimeout, this);
          value.addListener("failed", this._onfailed, this);
        }
      },

      /**
       * Apply method for the state property.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyState: function _applyState(value, old) {
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.debug("State: " + old + " => " + value);
          }
        }

        switch (value) {
          case "sending":
            this.fireEvent("sending");
            break;

          case "receiving":
            this.fireEvent("receiving");
            break;

          case "completed":
          case "aborted":
          case "timeout":
          case "failed":
            var vImpl = this.getImplementation();

            if (!vImpl) {
              // implementation has already been disposed
              break;
            } // Disable future timeouts in case user handler blocks


            this.__disableRequestTimeout();

            if (this.hasListener(value)) {
              var vResponse = qx.event.Registration.createEvent(value, qx.io.remote.Response);

              if (value == "completed") {
                var vContent = vImpl.getResponseContent();
                vResponse.setContent(vContent);
                /*
                 * Was there acceptable content?  This might occur, for example, if
                 * the web server was shut down unexpectedly and thus the connection
                 * closed with no data having been sent.
                 */

                if (vContent === null) {
                  // Nope.  Change COMPLETED to FAILED.
                  {
                    if (qx.core.Environment.get("qx.debug.io.remote")) {
                      this.debug("Altered State: " + value + " => failed");
                    }
                  }
                  value = "failed";
                }
              } else if (value == "failed") {
                vResponse.setContent(vImpl.getResponseContent());
              }

              vResponse.setStatusCode(vImpl.getStatusCode());
              vResponse.setResponseHeaders(vImpl.getResponseHeaders());
              this.dispatchEvent(vResponse);
            } // Disconnect and dispose implementation


            this.setImplementation(null);
            vImpl.dispose(); // Fire event to listeners
            //this.fireDataEvent(vEventType, vResponse);

            break;
        }
      }
    },

    /*
    *****************************************************************************
       ENVIRONMENT SETTINGS
    *****************************************************************************
    */
    environment: {
      "qx.debug.io.remote": false,
      "qx.debug.io.remote.data": false
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      var vImpl = this.getImplementation();

      if (vImpl) {
        this.setImplementation(null);
        vImpl.dispose();
      }

      this.setRequest(null);
    }
  });
  qx.io.remote.Exchange.$$dbClassInfo = $$dbClassInfo;
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
        "require": true
      },
      "qx.util.StringBuilder": {},
      "qx.bom.String": {},
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
  
       Based on Public Domain code by Christopher Diggins
       http://www.cdiggins.com/tokenizer.html
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christopher Diggins (original tokenizer code)
  
  ************************************************************************ */

  /**
   * Simple JavaScript tokenizer used to print syntax highlighted
   * JavaScript code.
   *
   * Based on Public Domain code by Christopher Diggins
   * http://www.cdiggins.com/tokenizer.html
   */
  qx.Class.define("qx.dev.Tokenizer", {
    extend: qx.core.Object,
    statics: {
      /**
       * Tokenizes a string of JavaScript code.
       *
       * @param javaScriptText {String} String of JavaScript code to tokenize
       * @return {Map[]} Array of tokens. A token is a map with the fields
       *   <code>type</code> containing the token type and <code>value</code>,
       *   which contains the string value of the token from the input string.
       */
      tokenizeJavaScript: function tokenizeJavaScript(javaScriptText) {
        var keywords = {
          "break": 1,
          "case": 1,
          "catch": 1,
          "continue": 1,
          "default": 1,
          "delete": 1,
          "do": 1,
          "else": 1,
          "finally": 1,
          "for": 1,
          "function": 1,
          "if": 1,
          "in": 1,
          "instanceof": 1,
          "new": 1,
          "return": 1,
          "switch": 1,
          "throw": 1,
          "try": 1,
          "typeof": 1,
          "var": 1,
          "while": 1,
          "with": 1
        };
        var atoms = {
          "void": 1,
          "null": 1,
          "true": 1,
          "false": 1,
          "NaN": 1,
          "Infinity": 1,
          "this": 1
        };
        var qxkeys = {
          "statics": 1,
          "members": 1,
          "construct": 1,
          "destruct": 1,
          "events": 1,
          "properties": 1,
          "extend": 1,
          "implement": 1
        };

        var reg = function reg(str) {
          return new RegExp("^" + str + "$");
        };

        var str_re_line_comment = "\\/\\/.*?[\\n\\r$]";
        var str_re_full_comment = "\\/\\*(?:.|[\\n\\r])*?\\*\\/";
        var str_re_ident = "[a-zA-Z_][a-zA-Z0-9_]*\\b";
        var str_re_integer = "[+-]?\\d+";
        var str_re_float = "[+-]?\\d+(([.]\\d+)*([eE][+-]?\\d+))?";
        var str_re_doublequote = '["][^"]*["]';
        var str_re_singlequote = "['][^']*[']";
        var str_re_tab = "\\t";
        var str_re_nl = "\\r\\n|\\r|\\n";
        var str_re_space = "\\s";
        var re_regexp_part = "(?:\\/(?!\\*)[^\\t\\n\\r\\f\\v\\/]+?\\/[mgi]*)";
        var str_re_regexp_all = ["\\.(?:match|search|split)\\s*\\(\\s*\\(*\\s*" + re_regexp_part + "\\s*\\)*\\s*\\)", "\\.(?:replace)\\s*\\(\\s*\\(*\\s*" + re_regexp_part + "\\s*\\)*\\s*?,?", "\\s*\\(*\\s*" + re_regexp_part + "\\)*\\.(?:test|exec)\\s*\\(\\s*", "(?::|=|\\?)\\s*\\(*\\s*" + re_regexp_part + "\\s*\\)*", "[\\(,]\\s*" + re_regexp_part + "\\s*[,\\)]"].join("|");
        var re_line_comment = reg(str_re_line_comment);
        var re_full_comment = reg(str_re_full_comment);
        var re_ident = reg(str_re_ident);
        var re_integer = reg(str_re_integer);
        var re_float = reg(str_re_float);
        var re_doublequote = reg(str_re_doublequote);
        var re_singlequote = reg(str_re_singlequote);
        var re_tab = reg(str_re_tab);
        var re_nl = reg(str_re_nl);
        var re_space = reg(str_re_space);
        var re_regexp_all = reg(str_re_regexp_all);
        var re_token = new RegExp([str_re_line_comment, str_re_full_comment, str_re_ident, str_re_integer, str_re_float, str_re_doublequote, str_re_singlequote, str_re_singlequote, str_re_tab, str_re_nl, str_re_space, str_re_regexp_all, "."].join("|"), "g");
        var tokens = [];
        var a = javaScriptText.match(re_token);

        for (var i = 0; i < a.length; i++) {
          var token = a[i];

          if (token.match(re_line_comment)) {
            tokens.push({
              type: "linecomment",
              value: token
            });
          } else if (token.match(re_full_comment)) {
            tokens.push({
              type: "fullcomment",
              value: token
            });
          } else if (token.match(re_regexp_all)) {
            tokens.push({
              type: "regexp",
              value: token
            });
          } else if (token.match(re_singlequote)) {
            tokens.push({
              type: "qstr",
              value: token
            });
          } else if (token.match(re_doublequote)) {
            tokens.push({
              type: "qqstr",
              value: token
            });
          } else if (keywords[token]) {
            tokens.push({
              type: "keyword",
              value: token
            });
          } else if (atoms[token]) {
            tokens.push({
              type: "atom",
              value: token
            });
          } else if (qxkeys[token]) {
            tokens.push({
              type: "qxkey",
              value: token
            });
          } else if (token.match(re_ident)) {
            tokens.push({
              type: "ident",
              value: token
            });
          } else if (token.match(re_float)) {
            tokens.push({
              type: "real",
              value: token
            });
          } else if (token.match(re_integer)) {
            tokens.push({
              type: "int",
              value: token
            });
          } else if (token.match(re_nl)) {
            tokens.push({
              type: "nl",
              value: token
            });
          } else if (token.match(reg(re_space))) {
            tokens.push({
              type: "ws",
              value: token
            });
          } else if (token.match(re_tab)) {
            tokens.push({
              type: "tab",
              value: token
            });
          } else if (token == ">") {
            tokens.push({
              type: "sym",
              value: ">"
            });
          } else if (token == "<") {
            tokens.push({
              type: "sym",
              value: "<"
            });
          } else if (token == "&") {
            tokens.push({
              type: "sym",
              value: "&"
            });
          } else {
            tokens.push({
              type: "sym",
              value: token
            });
          }
        }

        return tokens;
      },

      /**
       * Create a colored HTML string for a string of JavaScript code.
       * The colored elements are placed in <code>span</code> elements
       * with class names corresponding to the token types. The returned code
       * should be placed into <code>pre</code> tags to preserve the
       * indentation.
       *
       * @param javaScriptText {String} String of JavaScript code to tokenize
       * @param forPreTag {Boolean ? false} Whatever the HTML should be generated
       *   for a pre tag or not
       * @return {String} HTML fragment with the colored JavaScript code.
       */
      javaScriptToHtml: function javaScriptToHtml(javaScriptText, forPreTag) {
        var tokens = qx.dev.Tokenizer.tokenizeJavaScript(javaScriptText);
        var js = new qx.util.StringBuilder();

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];
          var htmlValue = qx.bom.String.escape(token.value);

          switch (token.type) {
            case "regexp":
              js.add("<span class='regexp'>", htmlValue, "</span>");
              break;

            case "ident":
              js.add("<span class='ident'>", htmlValue, "</span>");
              break;

            case "linecomment":
            case "fullcomment":
              js.add("<span class='comment'>", htmlValue, "</span>");
              break;

            case "qstr":
            case "qqstr":
              js.add("<span class='string'>", htmlValue, "</span>");
              break;

            case "keyword":
            case "atom":
            case "qxkey":
              js.add("<span class='", token.type, "'>", htmlValue, "</span>");
              break;

            case "nl":
              var nl = qx.core.Environment.get("engine.name") == "mshtml" && !forPreTag ? "<br>" : "\n";
              js.add(nl);
              break;

            case "ws":
              var ws = qx.core.Environment.get("engine.name") == "mshtml" && !forPreTag ? "&nbsp;" : " ";
              js.add(ws);
              break;

            default:
              js.add(htmlValue);
          }
        }

        return js.get();
      }
    }
  });
  qx.dev.Tokenizer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.type.BaseArray": {
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
  
  ************************************************************************ */

  /**
   * A string builder class
   *
   * += operator is faster in Firefox and Opera.
   * Array push/join is faster in Internet Explorer
   *
   * Even with this wrapper, which costs some time, this is
   * faster in Firefox than the alternative Array concat in
   * all browsers (which is in relation to IE's performance issues
   * only marginal). The IE performance loss caused by this
   * wrapper is not relevant.
   *
   * So this class seems to be the best compromise to handle
   * string concatenation.
   */
  qx.Class.define("qx.util.StringBuilder", {
    extend: qx.type.BaseArray,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Creates a new StringBuilder with the given length or as a concatenation of the given arguments substrings.
     *
     * <pre class="javascript">
     * var sb1 = new qx.util.StringBuilder(length);
     * var sb2 = new qx.util.StringBuilder(item0, item1, ..., itemN);
     * </pre>
     *
     *
     * * <code>length</code>: The initial length of the StringBuilder.
     * * <code>itemN</code>:  A substring that will make up the newly created StringBuilder.
     * The StringBuilder's length property is set to the number of arguments.
     *
     * @param length_or_items {Integer|var?null} The initial length of the StringBuilder
     *        OR an argument list of values.
     */
    construct: function construct(length_or_items) {
      qx.type.BaseArray.apply(this, arguments);
    },

    /*
    *****************************************************************************
      MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Removes all content
       *
       */
      clear: function clear() {
        this.length = 0;
      },

      /**
       * Returns the concatted strings.
       *
       * @return {String} Concatted strings
       */
      get: function get() {
        return this.join("");
      },

      /**
       * Adds new strings. Supports multiple arguments.
       *
       * @signature function(varargs)
       * @param varargs {String} The separate strings to add
       */
      add: null,

      /**
       * Whether the string builder is empty
       *
       * @return {Boolean} <code>true</code> when the builder is empty
       */
      isEmpty: function isEmpty() {
        return this.length === 0;
      },

      /**
       * Returns the size of the strings
       *
       * @return {Integer} The string length
       */
      size: function size() {
        return this.join("").length;
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics, members) {
      members.add = members.push;
      members.toString = members.get;
      members.valueOf = members.get;
    }
  });
  qx.util.StringBuilder.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Attribute": {},
      "qx.bom.Html": {},
      "qx.bom.Input": {},
      "qxWeb": {
        "defer": "runtime"
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2011-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Attribute/Property handling for DOM elements.
   * @group (Core)
   */
  qx.Bootstrap.define("qx.module.Attribute", {
    members: {
      /**
       * Returns the HTML content of the first item in the collection
       * @attach {qxWeb}
       * @return {String|null} HTML content or null if the collection is empty
       */
      getHtml: function getHtml() {
        if (this[0] && this[0].nodeType === 1) {
          return qx.bom.element.Attribute.get(this[0], "html");
        }

        return null;
      },

      /**
       * Sets the HTML content of each item in the collection
       *
       * @attach {qxWeb}
       * @param html {String} HTML string
       * @return {qxWeb} The collection for chaining
       */
      setHtml: function setHtml(html) {
        html = qx.bom.Html.fixEmptyTags(html);

        this._forEachElement(function (item) {
          qx.bom.element.Attribute.set(item, "html", html);
        });

        return this;
      },

      /**
       * Sets an HTML attribute on each item in the collection
       *
       * @attach {qxWeb}
       * @param name {String} Attribute name
       * @param value {var} Attribute value
       * @return {qxWeb} The collection for chaining
       */
      setAttribute: function setAttribute(name, value) {
        this._forEachElement(function (item) {
          qx.bom.element.Attribute.set(item, name, value);
        });

        return this;
      },

      /**
       * Returns the value of the given attribute for the first item in the
       * collection.
       *
       * @attach {qxWeb}
       * @param name {String} Attribute name
       * @return {var} Attribute value
       */
      getAttribute: function getAttribute(name) {
        if (this[0] && this[0].nodeType === 1) {
          return qx.bom.element.Attribute.get(this[0], name);
        }

        return null;
      },

      /**
       * Removes the given attribute from all elements in the collection
       *
       * @attach {qxWeb}
       * @param name {String} Attribute name
       * @return {qxWeb} The collection for chaining
       */
      removeAttribute: function removeAttribute(name) {
        this._forEachElement(function (item) {
          qx.bom.element.Attribute.set(item, name, null);
        });

        return this;
      },

      /**
       * Sets multiple attributes for each item in the collection.
       *
       * @attach {qxWeb}
       * @param attributes {Map} A map of attribute name/value pairs
       * @return {qxWeb} The collection for chaining
       */
      setAttributes: function setAttributes(attributes) {
        for (var name in attributes) {
          this.setAttribute(name, attributes[name]);
        }

        return this;
      },

      /**
       * Returns the values of multiple attributes for the first item in the collection
       *
       * @attach {qxWeb}
       * @param names {String[]} List of attribute names
       * @return {Map} Map of attribute name/value pairs
       */
      getAttributes: function getAttributes(names) {
        var attributes = {};

        for (var i = 0; i < names.length; i++) {
          attributes[names[i]] = this.getAttribute(names[i]);
        }

        return attributes;
      },

      /**
       * Removes multiple attributes from each item in the collection.
       *
       * @attach {qxWeb}
       * @param attributes {String[]} List of attribute names
       * @return {qxWeb} The collection for chaining
       */
      removeAttributes: function removeAttributes(attributes) {
        for (var i = 0, l = attributes.length; i < l; i++) {
          this.removeAttribute(attributes[i]);
        }

        return this;
      },

      /**
       * Sets a property on each item in the collection
       *
       * @attach {qxWeb}
       * @param name {String} Property name
       * @param value {var} Property value
       * @return {qxWeb} The collection for chaining
       */
      setProperty: function setProperty(name, value) {
        for (var i = 0; i < this.length; i++) {
          this[i][name] = value;
        }

        return this;
      },

      /**
       * Returns the value of the given property for the first item in the
       * collection
       *
       * @attach {qxWeb}
       * @param name {String} Property name
       * @return {var} Property value
       */
      getProperty: function getProperty(name) {
        if (this[0]) {
          return this[0][name];
        }

        return null;
      },

      /**
       * Sets multiple properties for each item in the collection.
       *
       * @attach {qxWeb}
       * @param properties {Map} A map of property name/value pairs
       * @return {qxWeb} The collection for chaining
       */
      setProperties: function setProperties(properties) {
        for (var name in properties) {
          this.setProperty(name, properties[name]);
        }

        return this;
      },

      /**
       * Removes multiple properties for each item in the collection.
       *
       * @attach {qxWeb}
       * @param properties {String[]} An array of property names
       * @return {qxWeb} The collection for chaining
       */
      removeProperties: function removeProperties(properties) {
        for (var i = 0; i < properties.length; i++) {
          this.removeProperty(properties[i]);
        }

        return this;
      },

      /**
       * Returns the values of multiple properties for the first item in the collection
       *
       * @attach {qxWeb}
       * @param names {String[]} List of property names
       * @return {Map} Map of property name/value pairs
       */
      getProperties: function getProperties(names) {
        var properties = {};

        for (var i = 0; i < names.length; i++) {
          properties[names[i]] = this.getProperty(names[i]);
        }

        return properties;
      },

      /**
       * Deletes a property from each item in the collection
       *
       * @attach {qxWeb}
       * @param name {String} Property name
       * @return {qxWeb} The collection for chaining
       */
      removeProperty: function removeProperty(name) {
        if (this[0]) {
          this[0][name] = undefined;
        }

        return this;
      },

      /**
       * Returns the currently configured value for the first item in the collection.
       * Works with simple input fields as well as with select boxes or option
       * elements. Returns an array for select boxes with multi selection. In all
       * other cases, a string is returned.
       *
       * @attach {qxWeb}
       * @return {String|String[]} String value or Array of string values (for multiselect)
       */
      getValue: function getValue() {
        if (this[0] && this[0].nodeType === 1) {
          return qx.bom.Input.getValue(this[0]);
        }

        return null;
      },

      /**
       * Applies the given value to each element in the collection.
       * Normally the value is given as a string/number value and applied to the
       * field content (textfield, textarea) or used to detect whether the field
       * is checked (checkbox, radiobutton).
       * Supports array values for selectboxes (multiple selection) and checkboxes
       * or radiobuttons (for convenience).
       *
       * Please note: To modify the value attribute of a checkbox or radiobutton
       * use {@link #setAttribute} instead and manipulate the <code>checked</code> attribute.
       *
       * @attach {qxWeb}
       * @param value {String|Number|Array} The value to apply
       * @return {qxWeb} The collection for chaining
       */
      setValue: function setValue(value) {
        this._forEachElement(function (item) {
          qx.bom.Input.setValue(item, value);
        });

        return this;
      }
    },
    defer: function defer(statics) {
      qxWeb.$attachAll(this);
    }
  });
  qx.module.Attribute.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.Event": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Event": {},
      "qxWeb": {
        "defer": "runtime"
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Common normalizations for native events
   *
   * @require(qx.module.Event)
   * @require(qx.bom.Event#getTarget)
   * @require(qx.bom.Event#getRelatedTarget)
   *
   * @group (Event_Normalization)
   */
  qx.Bootstrap.define("qx.module.event.Native", {
    statics: {
      /**
       * List of event types to be normalized
       */
      TYPES: ["*"],

      /**
       * List of qx.bom.Event methods to be attached to native event objects
       * @internal
       */
      FORWARD_METHODS: ["getTarget", "getRelatedTarget"],

      /**
       * List of qx.module.event.Native methods to be attached to native event objects
       * @internal
       */
      BIND_METHODS: ["preventDefault", "stopPropagation", "getType"],

      /**
       * Prevent the native default behavior of the event.
       */
      preventDefault: function preventDefault() {
        try {
          // this allows us to prevent some key press events in IE.
          // See bug #1049
          this.keyCode = 0;
        } catch (ex) {}

        this.returnValue = false;
      },

      /**
       * Stops the event's propagation to the element's parent
       */
      stopPropagation: function stopPropagation() {
        this.cancelBubble = true;
      },

      /**
       * Returns the event's type
       *
       * @return {String} event type
       */
      getType: function getType() {
        return this._type || this.type;
      },

      /**
       * Returns the target of the event.
       *
       * @signature function ()
       * @return {Object} Any valid native event target
       */
      getTarget: function getTarget() {},

      /**
       * Computes the related target from the native DOM event
       *
       * @signature function ()
       * @return {Element} The related target
       */
      getRelatedTarget: function getRelatedTarget() {},

      /**
       * Computes the current target from the native DOM event. Emulates the current target
       * for all browsers without native support (like older IEs).
       *
       * @signature function ()
       * @return {Element} The current target
       */
      getCurrentTarget: function getCurrentTarget() {},

      /**
       * Manipulates the native event object, adding methods if they're not
       * already present
       *
       * @param event {Event} Native event object
       * @param element {Element} DOM element the listener was attached to
       * @return {Event} Normalized event object
       * @internal
       */
      normalize: function normalize(event, element) {
        if (!event) {
          return event;
        }

        var fwdMethods = qx.module.event.Native.FORWARD_METHODS;

        for (var i = 0, l = fwdMethods.length; i < l; i++) {
          event[fwdMethods[i]] = qx.bom.Event[fwdMethods[i]].bind(null, event);
        }

        var bindMethods = qx.module.event.Native.BIND_METHODS;

        for (var i = 0, l = bindMethods.length; i < l; i++) {
          if (typeof event[bindMethods[i]] != "function") {
            event[bindMethods[i]] = qx.module.event.Native[bindMethods[i]].bind(event);
          }
        }

        event.getCurrentTarget = function () {
          return event.currentTarget || element;
        };

        return event;
      }
    },
    defer: function defer(statics) {
      qxWeb.$registerEventNormalization(statics.TYPES, statics.normalize);
    }
  });
  qx.module.event.Native.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-66.js.map
