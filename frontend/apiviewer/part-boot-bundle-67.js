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
      }
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
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Abstract for all transport implementations
   */
  qx.Class.define("qx.io.remote.transport.Abstract", {
    type: "abstract",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.setRequestHeaders({});
      this.setParameters({});
      this.setFormFields({});
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Event when a request is created */
      "created": "qx.event.type.Event",

      /** Event when a request is configured */
      "configured": "qx.event.type.Event",

      /** Event when a request is send */
      "sending": "qx.event.type.Event",

      /** Event when a request is received */
      "receiving": "qx.event.type.Event",

      /** Event when a request is completed */
      "completed": "qx.event.type.Event",

      /** Event when a request is aborted */
      "aborted": "qx.event.type.Event",

      /** Event when a request has failed */
      "failed": "qx.event.type.Event",

      /** Event when a request has timed out */
      "timeout": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Target url to issue the request to */
      url: {
        check: "String",
        nullable: true
      },

      /** Determines what type of request to issue */
      method: {
        check: "String",
        nullable: true,
        init: "GET"
      },

      /** Set the request to asynchronous */
      asynchronous: {
        check: "Boolean",
        nullable: true,
        init: true
      },

      /** Set the data to be sent via this request */
      data: {
        check: "String",
        nullable: true
      },

      /** Username to use for HTTP authentication */
      username: {
        check: "String",
        nullable: true
      },

      /** Password to use for HTTP authentication */
      password: {
        check: "String",
        nullable: true
      },

      /** The state of the current request */
      state: {
        check: ["created", "configured", "sending", "receiving", "completed", "aborted", "timeout", "failed"],
        init: "created",
        event: "changeState",
        apply: "_applyState"
      },

      /** Request headers */
      requestHeaders: {
        check: "Object",
        nullable: true
      },

      /** Request parameters to send. */
      parameters: {
        check: "Object",
        nullable: true
      },

      /** Request form fields to send. */
      formFields: {
        check: "Object",
        nullable: true
      },

      /** Response Type */
      responseType: {
        check: "String",
        nullable: true
      },

      /** Use Basic HTTP Authentication */
      useBasicHttpAuth: {
        check: "Boolean",
        nullable: true
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
        USER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Sending a request.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @throws {Error} the abstract function warning.
       */
      send: function send() {
        throw new Error("send is abstract");
      },

      /**
       * Force the transport into the aborted state ("aborted").
       *
       * Listeners of the "aborted" signal are notified about the event.
       *
       */
      abort: function abort() {
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.warn("Aborting...");
          }
        }
        this.setState("aborted");
      },

      /**
       * Force the transport into the timeout state ("timeout").
       *
       * Listeners of the "timeout" signal are notified about the event.
       *
       */
      timeout: function timeout() {
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.warn("Timeout...");
          }
        }
        this.setState("timeout");
      },

      /**
       * Force the transport into the failed state ("failed").
       *
       * Listeners of the "failed" signal are notified about the event.
       *
       */
      failed: function failed() {
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.warn("Failed...");
          }
        }
        this.setState("failed");
      },

      /*
      ---------------------------------------------------------------------------
        REQUEST HEADER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Add a request header to this transports qx.io.remote.Request.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @param vLabel {String} Request header name
       * @param vValue {var} Value for the header
       * @throws {Error} the abstract function warning.
       */
      setRequestHeader: function setRequestHeader(vLabel, vValue) {
        throw new Error("setRequestHeader is abstract");
      },

      /*
      ---------------------------------------------------------------------------
        RESPONSE HEADER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the request header of the request.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @param vLabel {String} Response header name
       * @return {Object}
       * @throws {Error} the abstract function warning.
       */
      getResponseHeader: function getResponseHeader(vLabel) {
        throw new Error("getResponseHeader is abstract");
      },

      /**
       * Provides an hash of all response headers.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @return {Object}
       * @throws {Error} the abstract function warning.
       */
      getResponseHeaders: function getResponseHeaders() {
        throw new Error("getResponseHeaders is abstract");
      },

      /*
      ---------------------------------------------------------------------------
        STATUS SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the current status code of the request if available or -1 if not.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @return {Integer}
       * @throws {Error} the abstract function warning.
       */
      getStatusCode: function getStatusCode() {
        throw new Error("getStatusCode is abstract");
      },

      /**
       * Provides the status text for the current request if available and null otherwise.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @return {String}
       * @throws {Error} the abstract function warning.
       */
      getStatusText: function getStatusText() {
        throw new Error("getStatusText is abstract");
      },

      /*
      ---------------------------------------------------------------------------
        RESPONSE DATA SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Provides the response text from the request when available and null otherwise.
       * By passing true as the "partial" parameter of this method, incomplete data will
       * be made available to the caller.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @return {String}
       * @throws {Error} the abstract function warning.
       */
      getResponseText: function getResponseText() {
        throw new Error("getResponseText is abstract");
      },

      /**
       * Provides the XML provided by the response if any and null otherwise.
       * By passing true as the "partial" parameter of this method, incomplete data will
       * be made available to the caller.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @return {Object}
       * @throws {Error} the abstract function warning.
       */
      getResponseXml: function getResponseXml() {
        throw new Error("getResponseXml is abstract");
      },

      /**
       * Returns the length of the content as fetched thus far.
       *
       * This method is virtual and concrete subclasses are supposed to
       * implement it.
       *
       * @abstract
       * @return {Integer}
       * @throws {Error} the abstract function warning.
       */
      getFetchedLength: function getFetchedLength() {
        throw new Error("getFetchedLength is abstract");
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */

      /**
       * Apply method for "state" property. For each state value a corresponding
       * event is fired to inform the listeners.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyState: function _applyState(value, old) {
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.debug("State: " + value);
          }
        }

        switch (value) {
          case "created":
            this.fireEvent("created");
            break;

          case "configured":
            this.fireEvent("configured");
            break;

          case "sending":
            this.fireEvent("sending");
            break;

          case "receiving":
            this.fireEvent("receiving");
            break;

          case "completed":
            this.fireEvent("completed");
            break;

          case "aborted":
            this.fireEvent("aborted");
            break;

          case "failed":
            this.fireEvent("failed");
            break;

          case "timeout":
            this.fireEvent("timeout");
            break;
        }

        return true;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.setRequestHeaders(null);
      this.setParameters(null);
      this.setFormFields(null);
    }
  });
  qx.io.remote.transport.Abstract.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.io.remote.transport.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "construct": true,
        "defer": "runtime"
      },
      "qx.bom.Iframe": {
        "construct": true
      },
      "qx.bom.element.Style": {
        "construct": true
      },
      "qx.dom.Element": {
        "construct": true,
        "defer": "runtime"
      },
      "qx.dom.Node": {
        "construct": true
      },
      "qx.event.Registration": {
        "construct": true,
        "defer": "runtime"
      },
      "qx.lang.Function": {
        "construct": true
      },
      "qx.bom.Event": {
        "construct": true,
        "defer": "runtime"
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.io.remote.Exchange": {
        "defer": "runtime"
      },
      "qx.lang.Json": {},
      "qx.util.ResourceManager": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
          "className": "qx.bom.client.Engine",
          "defer": true
        },
        "qx.debug.io.remote": {},
        "qx.debug.io.remote.data": {}
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

  /* ************************************************************************
  
  
  ************************************************************************ */

  /**
   * Transports requests to a server using an IFRAME.
   *
   * This class should not be used directly by client programmers.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @asset(qx/static/blank.gif)
   */
  qx.Class.define("qx.io.remote.transport.Iframe", {
    extend: qx.io.remote.transport.Abstract,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.io.remote.transport.Abstract.constructor.call(this); // Unique identifiers for iframe and form

      var vUniqueId = new Date().valueOf();
      var vFrameName = "frame_" + vUniqueId;
      var vFormName = "form_" + vUniqueId; // This is to prevent the "mixed secure and insecure content" warning in IE with https

      var vFrameSource;

      if (qx.core.Environment.get("engine.name") == "mshtml") {
        vFrameSource = "javascript:void(0)";
      } // Create a hidden iframe.
      // The purpose of the iframe is to receive data coming back from the server (see below).


      this.__frame = qx.bom.Iframe.create({
        id: vFrameName,
        name: vFrameName,
        src: vFrameSource
      });
      qx.bom.element.Style.set(this.__frame, "display", "none"); // Create form element with textarea as conduit for request data.
      // The target of the form is the hidden iframe, which means the response
      // coming back from the server is written into the iframe.

      this.__form = qx.dom.Element.create("form", {
        id: vFormName,
        name: vFormName,
        target: vFrameName
      });
      qx.bom.element.Style.set(this.__form, "display", "none");
      qx.dom.Element.insertEnd(this.__form, qx.dom.Node.getBodyElement(document));
      this.__data = qx.dom.Element.create("textarea", {
        id: "_data_",
        name: "_data_"
      });
      qx.dom.Element.insertEnd(this.__data, this.__form); // Finally, attach iframe to DOM and add listeners

      qx.dom.Element.insertEnd(this.__frame, qx.dom.Node.getBodyElement(document));
      qx.event.Registration.addListener(this.__frame, "load", this._onload, this); // qx.event.handler.Iframe does not yet support the readystatechange event

      this.__onreadystatechangeWrapper = qx.lang.Function.listener(this._onreadystatechange, this);
      qx.bom.Event.addNativeListener(this.__frame, "readystatechange", this.__onreadystatechangeWrapper);
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Capabilities of this transport type.
       *
       * @internal
       */
      handles: {
        synchronous: false,
        asynchronous: true,
        crossDomain: false,
        fileUpload: true,
        programmaticFormFields: true,
        responseTypes: ["text/plain", "text/javascript", "application/json", "application/xml", "text/html"]
      },

      /**
       * Returns always true, because iframe transport is supported by all browsers.
       *
       * @return {Boolean}
       */
      isSupported: function isSupported() {
        return true;
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * For reference:
       * http://msdn.microsoft.com/en-us/library/ie/ms534359%28v=vs.85%29.aspx
       *
       * @internal
       */
      _numericMap: {
        "uninitialized": 1,
        "loading": 2,
        "loaded": 2,
        "interactive": 3,
        "complete": 4
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __data: null,
      __lastReadyState: 0,
      __form: null,
      __frame: null,
      __onreadystatechangeWrapper: null,

      /*
      ---------------------------------------------------------------------------
        USER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Sends a request with the use of a form.
       *
       */
      send: function send() {
        var vMethod = this.getMethod();
        var vUrl = this.getUrl(); // --------------------------------------
        //   Adding parameters
        // --------------------------------------

        var vParameters = this.getParameters(false);
        var vParametersList = [];

        for (var vId in vParameters) {
          var value = vParameters[vId];

          if (value instanceof Array) {
            for (var i = 0; i < value.length; i++) {
              vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value[i]));
            }
          } else {
            vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value));
          }
        }

        if (vParametersList.length > 0) {
          vUrl += (vUrl.indexOf("?") >= 0 ? "&" : "?") + vParametersList.join("&");
        } // --------------------------------------------------------
        //   Adding data parameters (if no data is already present)
        // --------------------------------------------------------


        if (this.getData() === null) {
          var vParameters = this.getParameters(true);
          var vParametersList = [];

          for (var vId in vParameters) {
            var value = vParameters[vId];

            if (value instanceof Array) {
              for (var i = 0; i < value.length; i++) {
                vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value[i]));
              }
            } else {
              vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value));
            }
          }

          if (vParametersList.length > 0) {
            this.setData(vParametersList.join("&"));
          }
        } // --------------------------------------
        //   Adding form fields
        // --------------------------------------


        var vFormFields = this.getFormFields();

        for (var vId in vFormFields) {
          var vField = document.createElement("textarea");
          vField.name = vId;
          vField.appendChild(document.createTextNode(vFormFields[vId]));

          this.__form.appendChild(vField);
        } // --------------------------------------
        //   Preparing form
        // --------------------------------------


        this.__form.action = vUrl;
        this.__form.method = vMethod; // --------------------------------------
        //   Sending data
        // --------------------------------------

        this.__data.appendChild(document.createTextNode(this.getData()));

        this.__form.submit();

        this.setState("sending");
      },

      /**
       * Converting complete state to numeric value and update state property
       *
       * @signature function(e)
       * @param e {qx.event.type.Event} event object
       */
      _onload: qx.event.GlobalError.observeMethod(function (e) {
        // Timing-issue in Opera
        // Do not switch state to complete in case load event fires before content
        // of iframe was updated
        if (qx.core.Environment.get("engine.name") == "opera" && this.getIframeHtmlContent() == "") {
          return;
        }

        if (this.__form.src) {
          return;
        }

        this._switchReadyState(qx.io.remote.transport.Iframe._numericMap.complete);
      }),

      /**
       * Converting named readyState to numeric value and update state property
       *
       * @signature function(e)
       * @param e {qx.event.type.Event} event object
       */
      _onreadystatechange: qx.event.GlobalError.observeMethod(function (e) {
        this._switchReadyState(qx.io.remote.transport.Iframe._numericMap[this.__frame.readyState]);
      }),

      /**
       * Switches the readystate by setting the internal state.
       *
       * @param vReadyState {String} readystate value
       */
      _switchReadyState: function _switchReadyState(vReadyState) {
        // Ignoring already stopped requests
        switch (this.getState()) {
          case "completed":
          case "aborted":
          case "failed":
          case "timeout":
            this.warn("Ignore Ready State Change");
            return;
        } // Updating internal state


        while (this.__lastReadyState < vReadyState) {
          this.setState(qx.io.remote.Exchange._nativeMap[++this.__lastReadyState]);
        }
      },

      /*
      ---------------------------------------------------------------------------
        REQUEST HEADER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Sets a request header with the given value.
       *
       * This method is not implemented at the moment.
       *
       * @param vLabel {String} request header name
       * @param vValue {var} request header value
       */
      setRequestHeader: function setRequestHeader(vLabel, vValue) {},

      /*
      ---------------------------------------------------------------------------
        RESPONSE HEADER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the value of the given response header.
       *
       * This method is not implemented at the moment and returns always "null".
       *
       * @param vLabel {String} Response header name
       * @return {null} Returns null
       */
      getResponseHeader: function getResponseHeader(vLabel) {
        return null;
      },

      /**
       * Provides an hash of all response headers.
       *
       * This method is not implemented at the moment and returns an empty map.
       *
       * @return {Map} empty map
       */
      getResponseHeaders: function getResponseHeaders() {
        return {};
      },

      /*
      ---------------------------------------------------------------------------
        STATUS SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the current status code of the request if available or -1 if not.
       * This method needs implementation (returns always 200).
       *
       * @return {Integer} status code
       */
      getStatusCode: function getStatusCode() {
        return 200;
      },

      /**
       * Provides the status text for the current request if available and null otherwise.
       * This method needs implementation (returns always an empty string)
       *
       * @return {String} status code text
       */
      getStatusText: function getStatusText() {
        return "";
      },

      /*
      ---------------------------------------------------------------------------
        FRAME UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the DOM window object of the used iframe.
       *
       * @return {Object} DOM window object
       */
      getIframeWindow: function getIframeWindow() {
        return qx.bom.Iframe.getWindow(this.__frame);
      },

      /**
       * Returns the document node of the used iframe.
       *
       * @return {Object} document node
       */
      getIframeDocument: function getIframeDocument() {
        return qx.bom.Iframe.getDocument(this.__frame);
      },

      /**
       * Returns the body node of the used iframe.
       *
       * @return {Object} body node
       */
      getIframeBody: function getIframeBody() {
        return qx.bom.Iframe.getBody(this.__frame);
      },

      /*
      ---------------------------------------------------------------------------
        RESPONSE DATA SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the iframe content (innerHTML) as text.
       *
       * @return {String} iframe content as text
       */
      getIframeTextContent: function getIframeTextContent() {
        var vBody = this.getIframeBody();

        if (!vBody) {
          return null;
        }

        if (!vBody.firstChild) {
          return "";
        } // Mshtml returns the content inside a PRE
        // element if we use plain text


        if (vBody.firstChild.tagName && vBody.firstChild.tagName.toLowerCase() == "pre") {
          return vBody.firstChild.innerHTML;
        } else {
          return vBody.innerHTML;
        }
      },

      /**
       * Returns the iframe content as HTML.
       *
       * @return {String} iframe content as HTML
       */
      getIframeHtmlContent: function getIframeHtmlContent() {
        var vBody = this.getIframeBody();
        return vBody ? vBody.innerHTML : null;
      },

      /**
       * Returns the length of the content as fetched thus far.
       * This method needs implementation (returns always 0).
       *
       * @return {Integer} Returns 0
       */
      getFetchedLength: function getFetchedLength() {
        return 0;
      },

      /**
       * Returns the content of the response
       *
       * @return {null | String} null or text of the response (=iframe content).
       */
      getResponseContent: function getResponseContent() {
        if (this.getState() !== "completed") {
          {
            if (qx.core.Environment.get("qx.debug.io.remote")) {
              this.warn("Transfer not complete, ignoring content!");
            }
          }
          return null;
        }

        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.debug("Returning content for responseType: " + this.getResponseType());
          }
        }
        var vText = this.getIframeTextContent();

        switch (this.getResponseType()) {
          case "text/plain":
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + this._responseContent);
              }
            }
            return vText;

          case "text/html":
            vText = this.getIframeHtmlContent();
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + this._responseContent);
              }
            }
            return vText;

          case "application/json":
            vText = this.getIframeHtmlContent();
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + this._responseContent);
              }
            }

            try {
              return vText && vText.length > 0 ? qx.lang.Json.parse(vText) : null;
            } catch (ex) {
              return this.error("Could not execute json: (" + vText + ")", ex);
            }

          case "text/javascript":
            vText = this.getIframeHtmlContent();
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + this._responseContent);
              }
            }

            try {
              return vText && vText.length > 0 ? window.eval(vText) : null;
            } catch (ex) {
              return this.error("Could not execute javascript: (" + vText + ")", ex);
            }

          case "application/xml":
            vText = this.getIframeDocument();
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + this._responseContent);
              }
            }
            return vText;

          default:
            this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
            return null;
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer() {
      // basic registration to qx.io.remote.Exchange
      // the real availability check (activeX stuff and so on) follows at the first real request
      qx.io.remote.Exchange.registerType(qx.io.remote.transport.Iframe, "qx.io.remote.transport.Iframe");
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__frame) {
        qx.event.Registration.removeListener(this.__frame, "load", this._onload, this);
        qx.bom.Event.removeNativeListener(this.__frame, "readystatechange", this.__onreadystatechangeWrapper); // Reset source to a blank image for gecko
        // Otherwise it will switch into a load-without-end behaviour

        if (qx.core.Environment.get("engine.name") == "gecko") {
          this.__frame.src = qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif");
        } // Finally, remove element node


        qx.dom.Element.remove(this.__frame);
      }

      if (this.__form) {
        qx.dom.Element.remove(this.__form);
      }

      this.__frame = this.__form = this.__data = null;
    }
  });
  qx.io.remote.transport.Iframe.$$dbClassInfo = $$dbClassInfo;
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
      "qx.io.remote.transport.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.io.remote.Exchange": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.debug.io.remote": {},
        "qx.debug.io.remote.data": {}
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
   * Transports requests to a server using dynamic script tags.
   *
   * This class should not be used directly by client programmers.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.io.remote.transport.Script", {
    extend: qx.io.remote.transport.Abstract,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.io.remote.transport.Abstract.constructor.call(this);
      var vUniqueId = ++qx.io.remote.transport.Script.__uniqueId;

      if (vUniqueId >= 2000000000) {
        qx.io.remote.transport.Script.__uniqueId = vUniqueId = 1;
      }

      this.__element = null;
      this.__uniqueId = vUniqueId;
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Unique identifier for each instance.
       *
       * @internal
       */
      __uniqueId: 0,

      /**
       * Registry for all script transport instances.
       *
       * @internal
       */
      _instanceRegistry: {},

      /**
       * Internal URL parameter prefix.
       *
       * @internal
       */
      ScriptTransport_PREFIX: "_ScriptTransport_",

      /**
       * Internal URL parameter ID.
       *
       * @internal
       */
      ScriptTransport_ID_PARAM: "_ScriptTransport_id",

      /**
       * Internal URL parameter data prefix.
       *
       * @internal
       */
      ScriptTransport_DATA_PARAM: "_ScriptTransport_data",

      /**
       * Capabilities of this transport type.
       *
       * @internal
       */
      handles: {
        synchronous: false,
        asynchronous: true,
        crossDomain: true,
        fileUpload: false,
        programmaticFormFields: false,
        responseTypes: ["text/plain", "text/javascript", "application/json"]
      },

      /**
       * Returns always true, because script transport is supported by all browsers.
       * @return {Boolean} <code>true</code>
       */
      isSupported: function isSupported() {
        return true;
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * For reference:
       * http://msdn.microsoft.com/en-us/library/ie/ms534359%28v=vs.85%29.aspx
       *
       * @internal
       */
      _numericMap: {
        "uninitialized": 1,
        "loading": 2,
        "loaded": 2,
        "interactive": 3,
        "complete": 4
      },

      /**
       * This method can be called by the script loaded by the ScriptTransport
       * class.
       *
       * @signature function(id, content)
       * @param id {String} Id of the corresponding transport object,
       *     which is passed as an URL parameter to the server an
       * @param content {String} This string is passed to the content property
       *     of the {@link qx.io.remote.Response} object.
       */
      _requestFinished: qx.event.GlobalError.observeMethod(function (id, content) {
        var vInstance = qx.io.remote.transport.Script._instanceRegistry[id];

        if (vInstance == null) {
          {
            if (qx.core.Environment.get("qx.debug.io.remote")) {
              this.warn("Request finished for an unknown instance (probably aborted or timed out before)");
            }
          }
        } else {
          vInstance._responseContent = content;

          vInstance._switchReadyState(qx.io.remote.transport.Script._numericMap.complete);
        }
      })
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __lastReadyState: 0,
      __element: null,
      __uniqueId: null,

      /*
      ---------------------------------------------------------------------------
        USER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Sends the request using "script" elements
       *
       */
      send: function send() {
        var vUrl = this.getUrl(); // --------------------------------------
        //   Adding parameters
        // --------------------------------------

        vUrl += (vUrl.indexOf("?") >= 0 ? "&" : "?") + qx.io.remote.transport.Script.ScriptTransport_ID_PARAM + "=" + this.__uniqueId;
        var vParameters = this.getParameters();
        var vParametersList = [];

        for (var vId in vParameters) {
          if (vId.indexOf(qx.io.remote.transport.Script.ScriptTransport_PREFIX) == 0) {
            this.error("Illegal parameter name. The following prefix is used internally by qooxdoo): " + qx.io.remote.transport.Script.ScriptTransport_PREFIX);
          }

          var value = vParameters[vId];

          if (value instanceof Array) {
            for (var i = 0; i < value.length; i++) {
              vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value[i]));
            }
          } else {
            vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value));
          }
        }

        if (vParametersList.length > 0) {
          vUrl += "&" + vParametersList.join("&");
        } // --------------------------------------
        //   Sending data
        // --------------------------------------


        var vData = this.getData();

        if (vData != null) {
          vUrl += "&" + qx.io.remote.transport.Script.ScriptTransport_DATA_PARAM + "=" + encodeURIComponent(vData);
        }

        qx.io.remote.transport.Script._instanceRegistry[this.__uniqueId] = this;
        this.__element = document.createElement("script"); // IE needs this (it ignores the
        // encoding from the header sent by the
        // server for dynamic script tags)

        this.__element.charset = "utf-8";
        this.__element.src = vUrl;
        {
          if (qx.core.Environment.get("qx.debug.io.remote.data")) {
            this.debug("Request: " + vUrl);
          }
        }
        document.body.appendChild(this.__element);
      },

      /**
       * Switches the readystate by setting the internal state.
       *
       * @param vReadyState {String} readystate value
       */
      _switchReadyState: function _switchReadyState(vReadyState) {
        // Ignoring already stopped requests
        switch (this.getState()) {
          case "completed":
          case "aborted":
          case "failed":
          case "timeout":
            this.warn("Ignore Ready State Change");
            return;
        } // Updating internal state


        while (this.__lastReadyState < vReadyState) {
          this.setState(qx.io.remote.Exchange._nativeMap[++this.__lastReadyState]);
        }
      },

      /*
      ---------------------------------------------------------------------------
        REQUEST HEADER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Sets a request header with the given value.
       *
       * This method is not implemented at the moment.
       *
       * @param vLabel {String} Request header name
       * @param vValue {var} Request header value
       */
      setRequestHeader: function setRequestHeader(vLabel, vValue) {},

      /*
      ---------------------------------------------------------------------------
        RESPONSE HEADER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the value of the given response header.
       *
       * This method is not implemented at the moment and returns always "null".
       *
       * @param vLabel {String} Response header name
       * @return {null} Returns null
       */
      getResponseHeader: function getResponseHeader(vLabel) {
        return null;
      },

      /**
       * Provides an hash of all response headers.
       *
       * This method is not implemented at the moment and returns an empty map.
       *
       * @return {Map} empty map
       */
      getResponseHeaders: function getResponseHeaders() {
        return {};
      },

      /*
      ---------------------------------------------------------------------------
        STATUS SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the current status code of the request if available or -1 if not.
       * This method needs implementation (returns always 200).
       *
       * @return {Integer} status code
       */
      getStatusCode: function getStatusCode() {
        return 200;
      },

      /**
       * Provides the status text for the current request if available and null otherwise.
       * This method needs implementation (returns always an empty string)
       *
       * @return {String} always an empty string.
       */
      getStatusText: function getStatusText() {
        return "";
      },

      /*
      ---------------------------------------------------------------------------
        RESPONSE DATA SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the length of the content as fetched thus far.
       * This method needs implementation (returns always 0).
       *
       * @return {Integer} Returns 0
       */
      getFetchedLength: function getFetchedLength() {
        return 0;
      },

      /**
       * Returns the content of the response.
       *
       * @return {null | String} If successful content of response as string.
       */
      getResponseContent: function getResponseContent() {
        if (this.getState() !== "completed") {
          {
            if (qx.core.Environment.get("qx.debug.io.remote")) {
              this.warn("Transfer not complete, ignoring content!");
            }
          }
          return null;
        }

        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.debug("Returning content for responseType: " + this.getResponseType());
          }
        }

        switch (this.getResponseType()) {
          case "text/plain": // server is responsible for using a string as the response

          case "application/json":
          case "text/javascript":
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + this._responseContent);
              }
            }
            var ret = this._responseContent;
            return ret === 0 ? 0 : ret || null;

          default:
            this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
            return null;
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer() {
      // basic registration to qx.io.remote.Exchange
      // the real availability check (activeX stuff and so on) follows at the first real request
      qx.io.remote.Exchange.registerType(qx.io.remote.transport.Script, "qx.io.remote.transport.Script");
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__element) {
        delete qx.io.remote.transport.Script._instanceRegistry[this.__uniqueId];
        document.body.removeChild(this.__element);
      }

      this.__element = this._responseContent = null;
    }
  });
  qx.io.remote.transport.Script.$$dbClassInfo = $$dbClassInfo;
})();

//
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
      "qx.io.remote.transport.Abstract": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.xml.Document": {},
      "qx.lang.Function": {},
      "qx.bom.client.Browser": {},
      "qx.event.Timer": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.io.remote.Exchange": {
        "defer": "runtime"
      },
      "qx.lang.Json": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "qx.debug.io.remote.data": {},
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
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
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Derrell Lipman (derrell)
  
  ************************************************************************ */

  /**
   * Transports requests to a server using the native XmlHttpRequest object.
   *
   * This class should not be used directly by client programmers.
   */
  qx.Class.define("qx.io.remote.transport.XmlHttp", {
    extend: qx.io.remote.transport.Abstract,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Capabilities of this transport type.
       *
       * @internal
       */
      handles: {
        synchronous: true,
        asynchronous: true,
        crossDomain: false,
        fileUpload: false,
        programmaticFormFields: false,
        responseTypes: ["text/plain", "text/javascript", "application/json", "application/xml", "text/html"]
      },

      /**
       * Return a new XMLHttpRequest object suitable for the client browser.
       *
       * @return {Object} native XMLHttpRequest object
       * @signature function()
       */
      createRequestObject: qx.core.Environment.select("engine.name", {
        "default": function _default() {
          return new XMLHttpRequest();
        },
        // IE7's native XmlHttp does not care about trusted zones. To make this
        // work in the localhost scenario, you can use the following registry setting:
        //
        // [HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\Main\
        // FeatureControl\FEATURE_XMLHTTP_RESPECT_ZONEPOLICY]
        // "Iexplore.exe"=dword:00000001
        //
        // Generally it seems that the ActiveXObject is more stable. jQuery
        // seems to use it always. We prefer the ActiveXObject for the moment, but allow
        // fallback to XMLHTTP if ActiveX is disabled.
        "mshtml": function mshtml() {
          if (window.ActiveXObject && qx.xml.Document.XMLHTTP) {
            return new ActiveXObject(qx.xml.Document.XMLHTTP);
          }

          if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
          }
        }
      }),

      /**
       * Whether the transport type is supported by the client.
       *
       * @return {Boolean} supported or not
       */
      isSupported: function isSupported() {
        return !!this.createRequestObject();
      },

      /** The timeout for Xhr requests */
      __timeout: 0,

      /**
       * Sets the timeout for requests
       * @deprecated {6.0} This method is deprecated from the start because synchronous I/O itself is deprecated
       *  in the W3C spec {@link https://xhr.spec.whatwg.org/} and timeouts are indicative of synchronous I/O and/or
       *  other server issues.  However, this API is still supported by many browsers and this API is useful
       *  for code which has not made the transition to asynchronous I/O   
       */
      setTimeout: function setTimeout(timeout) {
        this.__timeout = timeout;
      },

      /**
       * Returns the timeout for requests
       */
      getTimeout: function getTimeout() {
        return this.__timeout;
      }
    },

    /*
     *****************************************************************************
        PROPERTIES
     *****************************************************************************
     */
    properties: {
      /**
       * If true and the responseType property is set to "application/json", getResponseContent() will
       * return a Javascript map containing the JSON contents, i. e. the result qx.lang.Json.parse().
       * If false, the raw string data will be returned and the parsing must be done manually.
       * This is useful for special JSON dialects / extensions which are not supported by
       * qx.lang.Json.
       */
      parseJson: {
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
      /*
      ---------------------------------------------------------------------------
        CORE METHODS
      ---------------------------------------------------------------------------
      */
      __localRequest: false,
      __lastReadyState: 0,
      __request: null,

      /**
       * Returns the native request object
       *
       * @return {Object} native XmlHTTPRequest object
       */
      getRequest: function getRequest() {
        if (this.__request === null) {
          this.__request = qx.io.remote.transport.XmlHttp.createRequestObject();
          this.__request.onreadystatechange = qx.lang.Function.bind(this._onreadystatechange, this);
        }

        return this.__request;
      },

      /*
      ---------------------------------------------------------------------------
        USER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Implementation for sending the request
       *
       */
      send: function send() {
        this.__lastReadyState = 0;
        var vRequest = this.getRequest();
        var vMethod = this.getMethod();
        var vAsynchronous = this.getAsynchronous();
        var vUrl = this.getUrl(); // --------------------------------------
        //   Local handling
        // --------------------------------------

        var vLocalRequest = window.location.protocol === "file:" && !/^http(s){0,1}\:/.test(vUrl);
        this.__localRequest = vLocalRequest; // --------------------------------------
        //   Adding URL parameters
        // --------------------------------------

        var vParameters = this.getParameters(false);
        var vParametersList = [];

        for (var vId in vParameters) {
          var value = vParameters[vId];

          if (value instanceof Array) {
            for (var i = 0; i < value.length; i++) {
              vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value[i]));
            }
          } else {
            vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value));
          }
        }

        if (vParametersList.length > 0) {
          vUrl += (vUrl.indexOf("?") >= 0 ? "&" : "?") + vParametersList.join("&");
        } // --------------------------------------------------------
        //   Adding data parameters (if no data is already present)
        // --------------------------------------------------------


        if (this.getData() === null) {
          var vParameters = this.getParameters(true);
          var vParametersList = [];

          for (var vId in vParameters) {
            var value = vParameters[vId];

            if (value instanceof Array) {
              for (var i = 0; i < value.length; i++) {
                vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value[i]));
              }
            } else {
              vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value));
            }
          }

          if (vParametersList.length > 0) {
            this.setData(vParametersList.join("&"));
          }
        }

        var encode64 = function encode64(input) {
          var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
          var output = "";
          var chr1, chr2, chr3;
          var enc1, enc2, enc3, enc4;
          var i = 0;

          do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
              enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
              enc4 = 64;
            }

            output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
          } while (i < input.length);

          return output;
        }; // --------------------------------------
        //   Opening connection
        // --------------------------------------


        try {
          if (this.getUsername()) {
            if (this.getUseBasicHttpAuth()) {
              vRequest.open(vMethod, vUrl, vAsynchronous);
              vRequest.setRequestHeader('Authorization', 'Basic ' + encode64(this.getUsername() + ':' + this.getPassword()));
            } else {
              vRequest.open(vMethod, vUrl, vAsynchronous, this.getUsername(), this.getPassword());
            }
          } else {
            vRequest.open(vMethod, vUrl, vAsynchronous);
          }
        } catch (ex) {
          this.error("Failed with exception: " + ex);
          this.failed();
          return;
        } // Apply timeout


        var timeout = qx.io.remote.transport.XmlHttp.getTimeout();

        if (timeout && vAsynchronous) {
          vRequest.timeout = timeout;
        } // --------------------------------------
        //   Applying request header
        // --------------------------------------
        // Removed adding a referer header as this is not allowed anymore on most
        // browsers
        // See issue https://github.com/qooxdoo/qooxdoo/issues/9298


        var vRequestHeaders = this.getRequestHeaders();

        for (var vId in vRequestHeaders) {
          vRequest.setRequestHeader(vId, vRequestHeaders[vId]);
        } // --------------------------------------
        //   Sending data
        // --------------------------------------


        try {
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data")) {
              this.debug("Request: " + this.getData());
            }
          } // IE9 executes the call synchronous when the call is to file protocol
          // See [BUG #4762] for details

          if (vLocalRequest && vAsynchronous && qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("engine.version") == 9 && qx.core.Environment.get("browser.documentmode") == 9) {
            qx.event.Timer.once(function () {
              vRequest.send(this.getData());
            }, this, 0);
          } else {
            vRequest.send(this.getData());
          }
        } catch (ex) {
          if (vLocalRequest) {
            this.failedLocally();
          } else {
            this.error("Failed to send data to URL '" + vUrl + "': " + ex, "send");
            this.failed();
          }

          return;
        } // --------------------------------------
        //   Readystate for sync requests
        // --------------------------------------


        if (!vAsynchronous) {
          this._onreadystatechange();
        }
      },

      /**
       * Force the transport into the failed state ("failed").
       *
       * This method should be used only if the requests URI was local
       * access. I.e. it started with "file://".
       *
       */
      failedLocally: function failedLocally() {
        if (this.getState() === "failed") {
          return;
        } // should only occur on "file://" access


        this.warn("Could not load from file: " + this.getUrl());
        this.failed();
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Listener method for change of the "readystate".
       * Sets the internal state and informs the transport layer.
       *
       * @signature function(e)
       * @param e {Event} native event
       */
      _onreadystatechange: qx.event.GlobalError.observeMethod(function (e) {
        // Ignoring already stopped requests
        switch (this.getState()) {
          case "completed":
          case "aborted":
          case "failed":
          case "timeout":
            {
              if (qx.core.Environment.get("qx.debug.io.remote")) {
                this.warn("Ignore Ready State Change");
              }
            }
            return;
        } // Checking status code


        var vReadyState = this.getReadyState();

        if (vReadyState == 4) {
          // The status code is only meaningful when we reach ready state 4.
          // (Important for Opera since it goes through other states before
          // reaching 4, and the status code is not valid before 4 is reached.)
          if (!qx.io.remote.Exchange.wasSuccessful(this.getStatusCode(), vReadyState, this.__localRequest)) {
            // Fix for bug #2272
            // The IE doesn't set the state to 'sending' even though the send method
            // is called. This only occurs if the server (which is called) goes
            // down or a network failure occurs.
            if (this.getState() === "configured") {
              this.setState("sending");
            }

            this.failed();
            return;
          }
        } // Sometimes the xhr call skips the send state


        if (vReadyState == 3 && this.__lastReadyState == 1) {
          this.setState(qx.io.remote.Exchange._nativeMap[++this.__lastReadyState]);
        } // Updating internal state


        while (this.__lastReadyState < vReadyState) {
          this.setState(qx.io.remote.Exchange._nativeMap[++this.__lastReadyState]);
        }
      }),

      /*
      ---------------------------------------------------------------------------
        READY STATE
      ---------------------------------------------------------------------------
      */

      /**
       * Get the ready state of this transports request.
       *
       * For qx.io.remote.transport.XmlHttp, ready state is a number between 1 to 4.
       *
       * @return {Integer} ready state number
       */
      getReadyState: function getReadyState() {
        var vReadyState = null;

        try {
          vReadyState = this.getRequest().readyState;
        } catch (ex) {}

        return vReadyState;
      },

      /*
      ---------------------------------------------------------------------------
        REQUEST HEADER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Set a request header to this transports request.
       *
       * @param vLabel {String} Request header name
       * @param vValue {var} Request header value
       */
      setRequestHeader: function setRequestHeader(vLabel, vValue) {
        this.getRequestHeaders()[vLabel] = vValue;
      },

      /*
      ---------------------------------------------------------------------------
        RESPONSE HEADER SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns a specific header provided by the server upon sending a request,
       * with header name determined by the argument headerName.
       *
       * Only available at readyState 3 and 4 universally and in readyState 2
       * in Gecko.
       *
       * Please note: Some servers/proxies (such as Selenium RC) will capitalize
       * response header names. This is in accordance with RFC 2616[1], which
       * states that HTTP 1.1 header names are case-insensitive, so your
       * application should be case-agnostic when dealing with response headers.
       *
       * [1]<a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2">RFC 2616: HTTP Message Headers</a>
       *
       * @param vLabel {String} Response header name
       * @return {String|null} Response header value
       */
      getResponseHeader: function getResponseHeader(vLabel) {
        var vResponseHeader = null;

        try {
          vResponseHeader = this.getRequest().getResponseHeader(vLabel) || null;
        } catch (ex) {}

        return vResponseHeader;
      },

      /**
       * Returns all response headers of the request.
       *
       * @return {var} response headers
       */
      getStringResponseHeaders: function getStringResponseHeaders() {
        var vSourceHeader = null;

        try {
          var vLoadHeader = this.getRequest().getAllResponseHeaders();

          if (vLoadHeader) {
            vSourceHeader = vLoadHeader;
          }
        } catch (ex) {}

        return vSourceHeader;
      },

      /**
       * Provides a hash of all response headers.
       *
       * @return {var} hash of all response headers
       */
      getResponseHeaders: function getResponseHeaders() {
        var vSourceHeader = this.getStringResponseHeaders();
        var vHeader = {};

        if (vSourceHeader) {
          var vValues = vSourceHeader.split(/[\r\n]+/g);

          for (var i = 0, l = vValues.length; i < l; i++) {
            var vPair = vValues[i].match(/^([^:]+)\s*:\s*(.+)$/i);

            if (vPair) {
              vHeader[vPair[1]] = vPair[2];
            }
          }
        }

        return vHeader;
      },

      /*
      ---------------------------------------------------------------------------
        STATUS SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the current status code of the request if available or -1 if not.
       *
       * @return {Integer} current status code
       */
      getStatusCode: function getStatusCode() {
        var vStatusCode = -1;

        try {
          vStatusCode = this.getRequest().status; // [BUG #4476]
          // IE sometimes tells 1223 when it should be 204

          if (vStatusCode === 1223) {
            vStatusCode = 204;
          }
        } catch (ex) {}

        return vStatusCode;
      },

      /**
       * Provides the status text for the current request if available and null
       * otherwise.
       *
       * @return {String} current status code text
       */
      getStatusText: function getStatusText() {
        var vStatusText = "";

        try {
          vStatusText = this.getRequest().statusText;
        } catch (ex) {}

        return vStatusText;
      },

      /*
      ---------------------------------------------------------------------------
        RESPONSE DATA SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Provides the response text from the request when available and null
       * otherwise.  By passing true as the "partial" parameter of this method,
       * incomplete data will be made available to the caller.
       *
       * @return {String} Content of the response as string
       */
      getResponseText: function getResponseText() {
        var vResponseText = null;

        try {
          vResponseText = this.getRequest().responseText;
        } catch (ex) {
          vResponseText = null;
        }

        return vResponseText;
      },

      /**
       * Provides the XML provided by the response if any and null otherwise.  By
       * passing true as the "partial" parameter of this method, incomplete data will
       * be made available to the caller.
       *
       * @return {String} Content of the response as XML
       * @throws {Error} If an error within the response occurs.
       */
      getResponseXml: function getResponseXml() {
        var vResponseXML = null;
        var vStatus = this.getStatusCode();
        var vReadyState = this.getReadyState();

        if (qx.io.remote.Exchange.wasSuccessful(vStatus, vReadyState, this.__localRequest)) {
          try {
            vResponseXML = this.getRequest().responseXML;
          } catch (ex) {}
        } // Typical behaviour on file:// on mshtml
        // Could we check this with something like: /^file\:/.test(path); ?
        // No browser check here, because it doesn't seem to break other browsers
        //    * test for this.req.responseXML's objecthood added by *
        //    * FRM, 20050816                                       *


        if (_typeof(vResponseXML) == "object" && vResponseXML != null) {
          if (!vResponseXML.documentElement) {
            // Clear xml file declaration, this breaks non unicode files (like ones with Umlauts)
            var s = String(this.getRequest().responseText).replace(/<\?xml[^\?]*\?>/, "");
            vResponseXML.loadXML(s);
          } // Re-check if fixed...


          if (!vResponseXML.documentElement) {
            throw new Error("Missing Document Element!");
          }

          if (vResponseXML.documentElement.tagName == "parseerror") {
            throw new Error("XML-File is not well-formed!");
          }
        } else {
          throw new Error("Response was not a valid xml document [" + this.getRequest().responseText + "]");
        }

        return vResponseXML;
      },

      /**
       * Returns the length of the content as fetched thus far
       *
       * @return {Integer} Length of the response text.
       */
      getFetchedLength: function getFetchedLength() {
        var vText = this.getResponseText();
        return typeof vText == "string" ? vText.length : 0;
      },

      /**
       * Returns the content of the response
       *
       * @return {null | String} Response content if available
       */
      getResponseContent: function getResponseContent() {
        var state = this.getState();

        if (state !== "completed" && state != "failed") {
          {
            if (qx.core.Environment.get("qx.debug.io.remote")) {
              this.warn("Transfer not complete or failed, ignoring content!");
            }
          }
          return null;
        }

        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.debug("Returning content for responseType: " + this.getResponseType());
          }
        }
        var vText = this.getResponseText();

        if (state == "failed") {
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data")) {
              this.debug("Failed: " + vText);
            }
          }
          return vText;
        }

        switch (this.getResponseType()) {
          case "text/plain":
          case "text/html":
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + vText);
              }
            }
            return vText;

          case "application/json":
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + vText);
              }
            }

            try {
              if (vText && vText.length > 0) {
                var ret;

                if (this.getParseJson()) {
                  ret = qx.lang.Json.parse(vText);
                  ret = ret === 0 ? 0 : ret || null;
                } else {
                  ret = vText;
                }

                return ret;
              } else {
                return null;
              }
            } catch (ex) {
              this.error("Could not execute json: [" + vText + "]", ex);
              return "<pre>Could not execute json: \n" + vText + "\n</pre>";
            }

          case "text/javascript":
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + vText);
              }
            }

            try {
              if (vText && vText.length > 0) {
                var ret = window.eval(vText);
                return ret === 0 ? 0 : ret || null;
              } else {
                return null;
              }
            } catch (ex) {
              this.error("Could not execute javascript: [" + vText + "]", ex);
              return null;
            }

          case "application/xml":
            vText = this.getResponseXml();
            {
              if (qx.core.Environment.get("qx.debug.io.remote.data")) {
                this.debug("Response: " + vText);
              }
            }
            return vText === 0 ? 0 : vText || null;

          default:
            this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
            return null;
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */

      /**
       * Apply method for the "state" property.
       * Fires an event for each state value to inform the listeners.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyState: function _applyState(value, old) {
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.debug("State: " + value);
          }
        }

        switch (value) {
          case "created":
            this.fireEvent("created");
            break;

          case "configured":
            this.fireEvent("configured");
            break;

          case "sending":
            this.fireEvent("sending");
            break;

          case "receiving":
            this.fireEvent("receiving");
            break;

          case "completed":
            this.fireEvent("completed");
            break;

          case "failed":
            this.fireEvent("failed");
            break;

          case "aborted":
            this.getRequest().abort();
            this.fireEvent("aborted");
            break;

          case "timeout":
            this.getRequest().abort();
            this.fireEvent("timeout");
            break;
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer() {
      // basic registration to qx.io.remote.Exchange
      // the real availability check (activeX stuff and so on) follows at the first real request
      qx.io.remote.Exchange.registerType(qx.io.remote.transport.XmlHttp, "qx.io.remote.transport.XmlHttp");
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      var vRequest = this.getRequest();

      if (vRequest) {
        // Clean up state change handler
        // Note that for IE the proper way to do this is to set it to a
        // dummy function, not null (Google on "onreadystatechange dummy IE unhook")
        // http://groups.google.com/group/Google-Web-Toolkit-Contributors/browse_thread/thread/7e7ee67c191a6324
        vRequest.onreadystatechange = function () {}; // Aborting


        switch (vRequest.readyState) {
          case 1:
          case 2:
          case 3:
            vRequest.abort();
        }
      }

      this.__request = null;
    }
  });
  qx.io.remote.transport.XmlHttp.$$dbClassInfo = $$dbClassInfo;
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
  
  ************************************************************************ */

  /**
   * This class is used to work with the result of a HTTP request.
   */
  qx.Class.define("qx.io.remote.Response", {
    extend: qx.event.type.Event,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        PROPERTIES
      ---------------------------------------------------------------------------
      */

      /** State of the response. */
      state: {
        check: "Integer",
        nullable: true
      },

      /** Status code of the response. */
      statusCode: {
        check: "Integer",
        nullable: true
      },

      /** Content of the response. */
      content: {
        nullable: true
      },

      /** The headers of the response. */
      responseHeaders: {
        check: "Object",
        nullable: true,
        apply: "_applyResponseHeaders"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __lowerHeaders: null,

      /*
      ---------------------------------------------------------------------------
        USER METHODS
      ---------------------------------------------------------------------------
      */
      // overridden
      clone: function clone(embryo) {
        var clone = qx.io.remote.Response.prototype.clone.base.call(this, embryo);
        clone.setType(this.getType());
        clone.setState(this.getState());
        clone.setStatusCode(this.getStatusCode());
        clone.setContent(this.getContent());
        clone.setResponseHeaders(this.getResponseHeaders());
        return clone;
      },

      /**
       * Returns a specific response header
       * @param vHeader {String} Response header name
       * @return {Object | null} The header value or null;
       */
      getResponseHeader: function getResponseHeader(vHeader) {
        if (this.__lowerHeaders) {
          return this.__lowerHeaders[vHeader.toLowerCase()] || null;
        }

        return null;
      },

      /**
       * Keep lower-cased shadow of response headers for later
       * case-insensitive matching.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyResponseHeaders: function _applyResponseHeaders(value, old) {
        var lowerHeaders = {};

        if (value !== null) {
          Object.keys(value).forEach(function (key) {
            lowerHeaders[key.toLowerCase()] = value[key];
          });
          this.__lowerHeaders = lowerHeaders;
        }
      }
    }
  });
  qx.io.remote.Response.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.lang.Array": {},
      "qx.type.BaseArray": {}
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
       2009 Sebastian Werner, http://sebastian-werner.net
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
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
   * This class is mainly a convenience wrapper for DOM elements to
   * qooxdoo's event system.
   *
   * @ignore(qxWeb)
   */
  qx.Bootstrap.define("qx.bom.Html", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Helper method for XHTML replacement.
       *
       * @param all {String} Complete string
       * @param front {String} Front of the match
       * @param tag {String} Tag name
       * @return {String} XHTML corrected tag
       */
      __fixNonDirectlyClosableHelper: function __fixNonDirectlyClosableHelper(all, front, tag) {
        return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ? all : front + "></" + tag + ">";
      },

      /** @type {Map} Contains wrap fragments for specific HTML matches */
      __convertMap: {
        opt: [1, "<select multiple='multiple'>", "</select>"],
        // option or optgroup
        leg: [1, "<fieldset>", "</fieldset>"],
        table: [1, "<table>", "</table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        def: qx.core.Environment.select("engine.name", {
          "mshtml": [1, "div<div>", "</div>"],
          "default": null
        })
      },

      /**
       * Fixes "XHTML"-style tags in all browsers.
       * Replaces tags which are not allowed to be closed directly such as
       * <code>div</code> or <code>p</code>. They are patched to use opening and
       * closing tags instead, e.g. <code>&lt;p&gt;</code> => <code>&lt;p&gt;&lt;/p&gt;</code>
       *
       * @param html {String} HTML to fix
       * @return {String} Fixed HTML
       */
      fixEmptyTags: function fixEmptyTags(html) {
        return html.replace(/(<(\w+)[^>]*?)\/>/g, this.__fixNonDirectlyClosableHelper);
      },

      /**
       * Translates a HTML string into an array of elements.
       *
       * @param html {String} HTML string
       * @param context {Document} Context document in which (helper) elements should be created
       * @return {Array} List of resulting elements
       */
      __convertHtmlString: function __convertHtmlString(html, context) {
        var div = context.createElement("div");
        html = qx.bom.Html.fixEmptyTags(html); // Trim whitespace, otherwise indexOf won't work as expected

        var tags = html.replace(/^\s+/, "").substring(0, 5).toLowerCase(); // Auto-wrap content into required DOM structure

        var wrap,
            map = this.__convertMap;

        if (!tags.indexOf("<opt")) {
          wrap = map.opt;
        } else if (!tags.indexOf("<leg")) {
          wrap = map.leg;
        } else if (tags.match(/^<(thead|tbody|tfoot|colg|cap)/)) {
          wrap = map.table;
        } else if (!tags.indexOf("<tr")) {
          wrap = map.tr;
        } else if (!tags.indexOf("<td") || !tags.indexOf("<th")) {
          wrap = map.td;
        } else if (!tags.indexOf("<col")) {
          wrap = map.col;
        } else {
          wrap = map.def;
        } // Omit string concat when no wrapping is needed


        if (wrap) {
          // Go to html and back, then peel off extra wrappers
          div.innerHTML = wrap[1] + html + wrap[2]; // Move to the right depth

          var depth = wrap[0];

          while (depth--) {
            div = div.lastChild;
          }
        } else {
          div.innerHTML = html;
        } // Fix IE specific bugs


        if (qx.core.Environment.get("engine.name") == "mshtml") {
          // Remove IE's autoinserted <tbody> from table fragments
          // String was a <table>, *may* have spurious <tbody>
          var hasBody = /<tbody/i.test(html); // String was a bare <thead> or <tfoot>

          var tbody = !tags.indexOf("<table") && !hasBody ? div.firstChild && div.firstChild.childNodes : wrap[1] == "<table>" && !hasBody ? div.childNodes : [];

          for (var j = tbody.length - 1; j >= 0; --j) {
            if (tbody[j].tagName.toLowerCase() === "tbody" && !tbody[j].childNodes.length) {
              tbody[j].parentNode.removeChild(tbody[j]);
            }
          } // IE completely kills leading whitespace when innerHTML is used


          if (/^\s/.test(html)) {
            div.insertBefore(context.createTextNode(html.match(/^\s*/)[0]), div.firstChild);
          }
        }

        return qx.lang.Array.fromCollection(div.childNodes);
      },

      /**
       * Cleans-up the given HTML and append it to a fragment
       *
       * When no <code>context</code> is given the global document is used to
       * create new DOM elements.
       *
       * When a <code>fragment</code> is given the nodes are appended to this
       * fragment except the script tags. These are returned in a separate Array.
       *
       * Please note: HTML coming from user input must be validated prior
       * to passing it to this method. HTML is temporarily inserted to the DOM
       * using <code>innerHTML</code>. As a consequence, scripts included in
       * attribute event handlers may be executed.
       *
       * @param objs {Element[]|String[]} Array of DOM elements or HTML strings
       * @param context {Document?document} Context in which the elements should be created
       * @param fragment {Element?null} Document fragment to appends elements to
       * @return {Element[]} Array of elements (when a fragment is given it only contains script elements)
       */
      clean: function clean(objs, context, fragment) {
        context = context || document; // !context.createElement fails in IE with an error but returns typeof 'object'

        if (typeof context.createElement === "undefined") {
          context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
        } // Fast-Path:
        // If a single string is passed in and it's a single tag
        // just do a createElement and skip the rest


        if (!fragment && objs.length === 1 && typeof objs[0] === "string") {
          var match = /^<(\w+)\s*\/?>$/.exec(objs[0]);

          if (match) {
            return [context.createElement(match[1])];
          }
        } // Iterate through items in incoming array


        var obj,
            ret = [];

        for (var i = 0, l = objs.length; i < l; i++) {
          obj = objs[i]; // Convert HTML string into DOM nodes

          if (typeof obj === "string") {
            obj = this.__convertHtmlString(obj, context);
          } // Append or merge depending on type


          if (obj.nodeType) {
            ret.push(obj);
          } else if (obj instanceof qx.type.BaseArray || typeof qxWeb !== "undefined" && obj instanceof qxWeb) {
            ret.push.apply(ret, Array.prototype.slice.call(obj, 0));
          } else if (obj.toElement) {
            ret.push(obj.toElement());
          } else {
            ret.push.apply(ret, obj);
          }
        } // Append to fragment and filter out scripts... or...


        if (fragment) {
          return qx.bom.Html.extractScripts(ret, fragment);
        } // Otherwise return the array of all elements


        return ret;
      },

      /**
       * Extracts script elements from an element list. Optionally
       * attaches them to a given document fragment
       *
       * @param elements {Element[]} list of elements
       * @param fragment {Document?} document fragment
       * @return {Element[]} Array containing the script elements
       */
      extractScripts: function extractScripts(elements, fragment) {
        var scripts = [],
            elem;

        for (var i = 0; elements[i]; i++) {
          elem = elements[i];

          if (elem.nodeType == 1 && elem.tagName.toLowerCase() === "script" && (!elem.type || elem.type.toLowerCase() === "text/javascript")) {
            // Trying to remove the element from DOM
            if (elem.parentNode) {
              elem.parentNode.removeChild(elements[i]);
            } // Store in script list


            scripts.push(elem);
          } else {
            if (elem.nodeType === 1) {
              // Recursively search for scripts and append them to the list of elements to process
              var scriptList = qx.lang.Array.fromCollection(elem.getElementsByTagName("script"));
              elements.splice.apply(elements, [i + 1, 0].concat(scriptList));
            } // Finally append element to fragment


            if (fragment) {
              fragment.appendChild(elem);
            }
          }
        }

        return scripts;
      }
    }
  });
  qx.bom.Html.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Css": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.rgba": {
          "load": true,
          "className": "qx.bom.client.Css"
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
       * Martin Wittemann (martinwittemann)
       * Tristan Koch (trkoch)
  
  ************************************************************************ */

  /**
   * Indigo color theme
   */
  qx.Theme.define("qx.theme.indigo.Color", {
    colors: {
      // main
      "background": "white",
      "dark-blue": "#323335",
      "light-background": "#F4F4F4",
      "font": "#262626",
      "highlight": "#3D72C9",
      // bright blue
      "highlight-shade": "#5583D0",
      // bright blue
      // backgrounds
      "background-selected": "#3D72C9",
      "background-selected-disabled": "#CDCDCD",
      "background-selected-dark": "#323335",
      "background-disabled": "#F7F7F7",
      "background-disabled-checked": "#BBBBBB",
      "background-pane": "white",
      // tabview
      "tabview-unselected": "#1866B5",
      "tabview-button-border": "#134983",
      "tabview-label-active-disabled": "#D9D9D9",
      // text colors
      "link": "#24B",
      // scrollbar
      "scrollbar-bright": "#F1F1F1",
      "scrollbar-dark": "#EBEBEB",
      // form
      "button": "#E8F0E3",
      "button-border": "#BBB",
      "button-border-hovered": "#939393",
      "invalid": "#C00F00",
      "button-box-bright": "#F9F9F9",
      "button-box-dark": "#E3E3E3",
      "button-box-bright-pressed": "#BABABA",
      "button-box-dark-pressed": "#EBEBEB",
      "border-lead": "#888888",
      // window
      "window-border": "#dddddd",
      "window-border-inner": "#F4F4F4",
      // group box
      "white-box-border": "#dddddd",
      // shadows
      "shadow": qx.core.Environment.get("css.rgba") ? "rgba(0, 0, 0, 0.4)" : "#666666",
      // borders
      "border-main": "#dddddd",
      "border-light": "#B7B7B7",
      "border-light-shadow": "#686868",
      // separator
      "border-separator": "#808080",
      // text
      "text": "#262626",
      "text-disabled": "#A7A6AA",
      "text-selected": "white",
      "text-placeholder": "#CBC8CD",
      // tooltip
      "tooltip": "#FE0",
      "tooltip-text": "black",
      // table
      "table-header": [242, 242, 242],
      "table-focus-indicator": "#3D72C9",
      // used in table code
      "table-header-cell": [235, 234, 219],
      "table-row-background-focused-selected": "#3D72C9",
      "table-row-background-focused": "#F4F4F4",
      "table-row-background-selected": [51, 94, 168],
      "table-row-background-even": "white",
      "table-row-background-odd": "white",
      "table-row-selected": [255, 255, 255],
      "table-row": [0, 0, 0],
      "table-row-line": "#EEE",
      "table-column-line": "#EEE",
      // used in progressive code
      "progressive-table-header": "#AAAAAA",
      "progressive-table-row-background-even": [250, 248, 243],
      "progressive-table-row-background-odd": [255, 255, 255],
      "progressive-progressbar-background": "gray",
      "progressive-progressbar-indicator-done": "#CCCCCC",
      "progressive-progressbar-indicator-undone": "white",
      "progressive-progressbar-percent-background": "gray",
      "progressive-progressbar-percent-text": "white"
    }
  });
  qx.theme.indigo.Color.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
     * Martin Wittemann (martinwittemann)
  
  ************************************************************************* */

  /**
   * The simple qooxdoo decoration theme.
   */
  qx.Theme.define("qx.theme.simple.Decoration", {
    aliases: {
      decoration: "qx/decoration/Simple"
    },
    decorations: {
      /*
      ---------------------------------------------------------------------------
        CORE
      ---------------------------------------------------------------------------
      */
      "border-blue": {
        style: {
          width: 4,
          color: "background-selected"
        }
      },
      "main": {
        style: {
          width: 1,
          color: "border-main"
        }
      },
      "main-dark": {
        style: {
          width: 1,
          color: "button-border"
        }
      },
      "popup": {
        style: {
          width: 1,
          color: "window-border",
          shadowLength: 2,
          shadowBlurRadius: 5,
          shadowColor: "shadow"
        }
      },
      "dragover": {
        style: {
          bottom: [2, "solid", "dark-blue"]
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON
      ---------------------------------------------------------------------------
      */
      "button-box": {
        style: {
          radius: 3,
          width: 1,
          color: "button-border",
          gradientStart: ["button-box-bright", 40],
          gradientEnd: ["button-box-dark", 70],
          backgroundColor: "button-box-bright"
        }
      },
      "button-box-pressed": {
        include: "button-box",
        style: {
          gradientStart: ["button-box-bright-pressed", 40],
          gradientEnd: ["button-box-dark-pressed", 70],
          backgroundColor: "button-box-bright-pressed"
        }
      },
      "button-box-pressed-hovered": {
        include: "button-box-pressed",
        style: {
          color: "button-border-hovered"
        }
      },
      "button-box-hovered": {
        include: "button-box",
        style: {
          color: "button-border-hovered"
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON INVALID
      ---------------------------------------------------------------------------
      */
      "button-box-invalid": {
        include: "button-box",
        style: {
          color: "invalid"
        }
      },
      "button-box-pressed-invalid": {
        include: "button-box-pressed",
        style: {
          color: "invalid"
        }
      },
      "button-box-hovered-invalid": {
        include: "button-box-invalid"
      },
      "button-box-pressed-hovered-invalid": {
        include: "button-box-pressed-invalid"
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON FOCUSED
      ---------------------------------------------------------------------------
      */
      "button-box-focused": {
        include: "button-box",
        style: {
          color: "background-selected"
        }
      },
      "button-box-pressed-focused": {
        include: "button-box-pressed",
        style: {
          color: "background-selected"
        }
      },
      "button-box-hovered-focused": {
        include: "button-box-focused"
      },
      "button-box-pressed-hovered-focused": {
        include: "button-box-pressed-focused"
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON RIGHT
      ---------------------------------------------------------------------------
      */
      "button-box-right": {
        include: "button-box",
        style: {
          radius: [0, 3, 3, 0]
        }
      },
      "button-box-pressed-right": {
        include: "button-box-pressed",
        style: {
          radius: [0, 3, 3, 0]
        }
      },
      "button-box-pressed-hovered-right": {
        include: "button-box-pressed-hovered",
        style: {
          radius: [0, 3, 3, 0]
        }
      },
      "button-box-hovered-right": {
        include: "button-box-hovered",
        style: {
          radius: [0, 3, 3, 0]
        }
      },
      "button-box-focused-right": {
        include: "button-box-focused",
        style: {
          radius: [0, 3, 3, 0]
        }
      },
      "button-box-hovered-focused-right": {
        include: "button-box-hovered-focused",
        style: {
          radius: [0, 3, 3, 0]
        }
      },
      "button-box-pressed-focused-right": {
        include: "button-box-pressed-focused",
        style: {
          radius: [0, 3, 3, 0]
        }
      },
      "button-box-pressed-hovered-focused-right": {
        include: "button-box-pressed-hovered-focused",
        style: {
          radius: [0, 3, 3, 0]
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON BORDERLESS RIGHT
      ---------------------------------------------------------------------------
      */
      "button-box-right-borderless": {
        include: "button-box",
        style: {
          radius: [0, 3, 3, 0],
          width: [1, 1, 1, 0]
        }
      },
      "button-box-pressed-right-borderless": {
        include: "button-box-pressed",
        style: {
          radius: [0, 3, 3, 0],
          width: [1, 1, 1, 0]
        }
      },
      "button-box-pressed-hovered-right-borderless": {
        include: "button-box-pressed-hovered",
        style: {
          radius: [0, 3, 3, 0],
          width: [1, 1, 1, 0]
        }
      },
      "button-box-hovered-right-borderless": {
        include: "button-box-hovered",
        style: {
          radius: [0, 3, 3, 0],
          width: [1, 1, 1, 0]
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON TOP RIGHT
      ---------------------------------------------------------------------------
      */
      "button-box-top-right": {
        include: "button-box",
        style: {
          radius: [0, 3, 0, 0],
          width: [1, 1, 1, 0]
        }
      },
      "button-box-pressed-top-right": {
        include: "button-box-pressed",
        style: {
          radius: [0, 3, 0, 0],
          width: [1, 1, 1, 0]
        }
      },
      "button-box-pressed-hovered-top-right": {
        include: "button-box-pressed-hovered",
        style: {
          radius: [0, 3, 0, 0],
          width: [1, 1, 1, 0]
        }
      },
      "button-box-hovered-top-right": {
        include: "button-box-hovered",
        style: {
          radius: [0, 3, 0, 0],
          width: [1, 1, 1, 0]
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON BOTOM RIGHT
      ---------------------------------------------------------------------------
      */
      "button-box-bottom-right": {
        include: "button-box",
        style: {
          radius: [0, 0, 3, 0],
          width: [0, 1, 1, 0]
        }
      },
      "button-box-pressed-bottom-right": {
        include: "button-box-pressed",
        style: {
          radius: [0, 0, 3, 0],
          width: [0, 1, 1, 0]
        }
      },
      "button-box-pressed-hovered-bottom-right": {
        include: "button-box-pressed-hovered",
        style: {
          radius: [0, 0, 3, 0],
          width: [0, 1, 1, 0]
        }
      },
      "button-box-hovered-bottom-right": {
        include: "button-box-hovered",
        style: {
          radius: [0, 0, 3, 0],
          width: [0, 1, 1, 0]
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON BOTOM LEFT
      ---------------------------------------------------------------------------
      */
      "button-box-bottom-left": {
        include: "button-box",
        style: {
          radius: [0, 0, 0, 3],
          width: [0, 0, 1, 1]
        }
      },
      "button-box-pressed-bottom-left": {
        include: "button-box-pressed",
        style: {
          radius: [0, 0, 0, 3],
          width: [0, 0, 1, 1]
        }
      },
      "button-box-pressed-hovered-bottom-left": {
        include: "button-box-pressed-hovered",
        style: {
          radius: [0, 0, 0, 3],
          width: [0, 0, 1, 1]
        }
      },
      "button-box-hovered-bottom-left": {
        include: "button-box-hovered",
        style: {
          radius: [0, 0, 0, 3],
          width: [0, 0, 1, 1]
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON TOP LEFT
      ---------------------------------------------------------------------------
      */
      "button-box-top-left": {
        include: "button-box",
        style: {
          radius: [3, 0, 0, 0],
          width: [1, 0, 0, 1]
        }
      },
      "button-box-pressed-top-left": {
        include: "button-box-pressed",
        style: {
          radius: [3, 0, 0, 0],
          width: [1, 0, 0, 1]
        }
      },
      "button-box-pressed-hovered-top-left": {
        include: "button-box-pressed-hovered",
        style: {
          radius: [3, 0, 0, 0],
          width: [1, 0, 0, 1]
        }
      },
      "button-box-hovered-top-left": {
        include: "button-box-hovered",
        style: {
          radius: [3, 0, 0, 0],
          width: [1, 0, 0, 1]
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON MIDDLE
      ---------------------------------------------------------------------------
      */
      "button-box-middle": {
        include: "button-box",
        style: {
          radius: 0,
          width: [1, 0, 1, 1]
        }
      },
      "button-box-pressed-middle": {
        include: "button-box-pressed",
        style: {
          radius: 0,
          width: [1, 0, 1, 1]
        }
      },
      "button-box-pressed-hovered-middle": {
        include: "button-box-pressed-hovered",
        style: {
          radius: 0,
          width: [1, 0, 1, 1]
        }
      },
      "button-box-hovered-middle": {
        include: "button-box-hovered",
        style: {
          radius: 0,
          width: [1, 0, 1, 1]
        }
      },

      /*
      ---------------------------------------------------------------------------
        BUTTON LEFT
      ---------------------------------------------------------------------------
      */
      "button-box-left": {
        include: "button-box",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },
      "button-box-pressed-left": {
        include: "button-box-pressed",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },
      "button-box-pressed-hovered-left": {
        include: "button-box-pressed-hovered",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },
      "button-box-hovered-left": {
        include: "button-box-hovered",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },
      "button-box-focused-left": {
        include: "button-box-focused",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },
      "button-box-hovered-focused-left": {
        include: "button-box-hovered-focused",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },
      "button-box-pressed-hovered-focused-left": {
        include: "button-box-pressed-hovered-focused",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },
      "button-box-pressed-focused-left": {
        include: "button-box-pressed-focused",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },

      /*
      ---------------------------------------------------------------------------
        SEPARATOR
      ---------------------------------------------------------------------------
      */
      "separator-horizontal": {
        style: {
          widthLeft: 1,
          colorLeft: "border-separator"
        }
      },
      "separator-vertical": {
        style: {
          widthTop: 1,
          colorTop: "border-separator"
        }
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL KNOB
      ---------------------------------------------------------------------------
      */
      "scroll-knob": {
        style: {
          radius: 3,
          width: 1,
          color: "button-border",
          backgroundColor: "scrollbar-bright"
        }
      },
      "scroll-knob-pressed": {
        include: "scroll-knob",
        style: {
          backgroundColor: "scrollbar-dark"
        }
      },
      "scroll-knob-hovered": {
        include: "scroll-knob",
        style: {
          color: "button-border-hovered"
        }
      },
      "scroll-knob-pressed-hovered": {
        include: "scroll-knob-pressed",
        style: {
          color: "button-border-hovered"
        }
      },

      /*
      ---------------------------------------------------------------------------
        HOVER BUTTON
      ---------------------------------------------------------------------------
      */
      "button-hover": {
        style: {
          backgroundColor: "button",
          radius: 3
        }
      },

      /*
      ---------------------------------------------------------------------------
        WINDOW
      ---------------------------------------------------------------------------
      */
      "window": {
        style: {
          width: 1,
          color: "window-border",
          innerWidth: 4,
          innerColor: "window-border-inner",
          shadowLength: 1,
          shadowBlurRadius: 3,
          shadowColor: "shadow",
          backgroundColor: "background"
        }
      },
      "window-active": {
        include: "window",
        style: {
          shadowLength: 2,
          shadowBlurRadius: 5
        }
      },
      "window-caption": {
        style: {
          width: [0, 0, 2, 0],
          color: "window-border-inner"
        }
      },

      /*
      ---------------------------------------------------------------------------
        GROUP BOX
      ---------------------------------------------------------------------------
      */
      "white-box": {
        style: {
          width: 1,
          color: "white-box-border",
          shadowBlurRadius: 2,
          shadowColor: "#999999",
          radius: 7,
          backgroundColor: "white",
          shadowLength: 0
        }
      },

      /*
      ---------------------------------------------------------------------------
        TEXT FIELD
      ---------------------------------------------------------------------------
      */
      "inset": {
        style: {
          width: 1,
          color: ["border-light-shadow", "border-light", "border-light", "border-light"]
        }
      },
      "focused-inset": {
        style: {
          width: 2,
          color: "background-selected"
        }
      },
      "border-invalid": {
        style: {
          width: 2,
          color: "invalid"
        }
      },

      /*
      ---------------------------------------------------------------------------
        LIST ITEM
      ---------------------------------------------------------------------------
      */
      "lead-item": {
        style: {
          width: 1,
          style: "dotted",
          color: "border-lead"
        }
      },

      /*
      ---------------------------------------------------------------------------
        TOOL TIP
      ---------------------------------------------------------------------------
      */
      "tooltip": {
        style: {
          width: 1,
          color: "tooltip-text",
          shadowLength: 1,
          shadowBlurRadius: 2,
          shadowColor: "shadow"
        }
      },
      "tooltip-error": {
        style: {
          radius: 5,
          backgroundColor: "invalid"
        }
      },

      /*
      ---------------------------------------------------------------------------
        TOOLBAR
      ---------------------------------------------------------------------------
      */
      "toolbar-separator": {
        style: {
          widthLeft: 1,
          colorLeft: "button-border"
        }
      },

      /*
      ---------------------------------------------------------------------------
        MENU
      ---------------------------------------------------------------------------
      */
      "menu-separator": {
        style: {
          widthTop: 1,
          colorTop: "background-selected"
        }
      },

      /*
      ---------------------------------------------------------------------------
        MENU BAR
      ---------------------------------------------------------------------------
      */
      "menubar-button-hovered": {
        style: {
          width: 1,
          color: "border-main",
          radius: 3,
          backgroundColor: "white"
        }
      },
      "menubar-button-pressed": {
        include: "menubar-button-hovered",
        style: {
          radius: [3, 3, 0, 0],
          width: [1, 1, 0, 1]
        }
      },

      /*
      ---------------------------------------------------------------------------
        DATE CHOOSER
      ---------------------------------------------------------------------------
      */
      "datechooser-date-pane": {
        style: {
          widthTop: 1,
          colorTop: "gray",
          style: "solid"
        }
      },
      "datechooser-weekday": {
        style: {
          widthBottom: 1,
          colorBottom: "gray",
          style: "solid"
        }
      },
      "datechooser-week": {
        style: {
          widthRight: 1,
          colorRight: "gray",
          style: "solid"
        }
      },
      "datechooser-week-header": {
        style: {
          widthBottom: 1,
          colorBottom: "gray",
          widthRight: 1,
          colorRight: "gray",
          style: "solid"
        }
      },

      /*
      ---------------------------------------------------------------------------
        TAB VIEW
      ---------------------------------------------------------------------------
      */
      "tabview-page-button-top": {
        style: {
          width: [1, 1, 0, 1],
          backgroundColor: "background",
          color: "border-main",
          radius: [3, 3, 0, 0]
        }
      },
      "tabview-page-button-bottom": {
        include: "tabview-page-button-top",
        style: {
          radius: [0, 0, 3, 3],
          width: [0, 1, 1, 1]
        }
      },
      "tabview-page-button-left": {
        include: "tabview-page-button-top",
        style: {
          radius: [3, 0, 0, 3],
          width: [1, 0, 1, 1]
        }
      },
      "tabview-page-button-right": {
        include: "tabview-page-button-top",
        style: {
          radius: [0, 3, 3, 0],
          width: [1, 1, 1, 0]
        }
      },

      /*
      ---------------------------------------------------------------------------
        TABLE
      ---------------------------------------------------------------------------
      */
      "statusbar": {
        style: {
          widthTop: 1,
          colorTop: "background-selected",
          styleTop: "solid"
        }
      },
      "table-scroller-focus-indicator": {
        style: {
          width: 2,
          color: "table-focus-indicator",
          style: "solid"
        }
      },
      "table-header": {
        include: "button-box",
        style: {
          radius: 0,
          width: [1, 0, 1, 0]
        }
      },
      "table-header-column-button": {
        include: "table-header",
        style: {
          width: 1,
          color: "button-border"
        }
      },
      "table-header-cell": {
        style: {
          widthRight: 1,
          color: "button-border"
        }
      },
      "table-header-cell-first": {
        include: "table-header-cell",
        style: {
          widthLeft: 1
        }
      },
      "progressive-table-header": {
        include: "button-box",
        style: {
          radius: 0,
          width: [1, 0, 1, 1]
        }
      },
      "progressive-table-header-cell": {
        style: {
          widthRight: 1,
          color: "button-border"
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROGRESSBAR
      ---------------------------------------------------------------------------
      */
      "progressbar": {
        style: {
          backgroundColor: "#FFF",
          width: 1,
          color: "border-separator"
        }
      },

      /*
      ---------------------------------------------------------------------------
        RADIO BUTTON
      ---------------------------------------------------------------------------
      */
      "radiobutton": {
        style: {
          radius: 10,
          width: 1,
          color: "button-border",
          innerColor: "background",
          innerWidth: 2
        }
      },
      "radiobutton-focused": {
        include: "radiobutton",
        style: {
          color: "background-selected"
        }
      },
      "radiobutton-invalid": {
        include: "radiobutton",
        style: {
          color: "invalid"
        }
      },

      /*
      ---------------------------------------------------------------------------
        CHECK BOX
      ---------------------------------------------------------------------------
      */
      "checkbox": {
        style: {
          width: 1,
          color: "button-border"
        }
      },
      "checkbox-focused": {
        include: "checkbox",
        style: {
          color: "background-selected"
        }
      },
      "checkbox-invalid": {
        include: "checkbox",
        style: {
          color: "invalid"
        }
      }
    }
  });
  qx.theme.simple.Decoration.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.simple.Decoration": {
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
     * Martin Wittemann (martinwittemann)
  
  ************************************************************************* */

  /**
   * The indigo qooxdoo decoration theme.
   */
  qx.Theme.define("qx.theme.indigo.Decoration", {
    extend: qx.theme.simple.Decoration,
    aliases: {
      decoration: "qx/decoration/Simple"
    },
    decorations: {
      "window": {
        style: {
          width: 1,
          color: "window-border",
          shadowLength: 1,
          shadowBlurRadius: 3,
          shadowColor: "shadow",
          backgroundColor: "background",
          radius: 3
        }
      },
      "window-caption": {
        style: {
          radius: [3, 3, 0, 0],
          color: "window-border",
          widthBottom: 1
        }
      },
      "window-caption-active": {
        style: {
          radius: [3, 3, 0, 0],
          color: "highlight",
          widthBottom: 3
        }
      },
      "white-box": {
        style: {
          width: 1,
          color: "white-box-border",
          backgroundColor: "white"
        }
      },
      "statusbar": {
        style: {
          widthTop: 1,
          colorTop: "border-main",
          styleTop: "solid"
        }
      },
      "app-header": {
        style: {
          innerWidthBottom: 1,
          innerColorBottom: "highlight-shade",
          widthBottom: 9,
          colorBottom: "highlight",
          gradientStart: ["#505154", 0],
          gradientEnd: ["#323335", 100],
          backgroundColor: "#323335"
        }
      }
    }
  });
  qx.theme.indigo.Decoration.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
     * Martin Wittemann (martinwittemann)
  
  ************************************************************************* */

  /* ************************************************************************
  
  
  ************************************************************************* */

  /**
   * The simple qooxdoo font theme.
   *
   * @asset(qx/decoration/Indigo/font/JosefinSlab-SemiBold.woff)
   * @asset(qx/decoration/Indigo/font/JosefinSlab-SemiBold.ttf)
   */
  qx.Theme.define("qx.theme.indigo.Font", {
    fonts: {
      "default": {
        size: 12,
        family: ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
        color: "font",
        lineHeight: 1.8
      },
      "bold": {
        size: 12,
        family: ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
        bold: true,
        color: "font",
        lineHeight: 1.8
      },
      "headline": {
        size: 22,
        family: ["serif"],
        sources: [{
          family: "JosefinSlab",
          source: ["qx/decoration/Indigo/font/JosefinSlab-SemiBold.woff", "qx/decoration/Indigo/font/JosefinSlab-SemiBold.ttf"]
        }]
      },
      "small": {
        size: 11,
        family: ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
        color: "font",
        lineHeight: 1.8
      },
      "monospace": {
        size: 11,
        family: ["DejaVu Sans Mono", "Courier New", "monospace"],
        color: "font",
        lineHeight: 1.8
      }
    }
  });
  qx.theme.indigo.Font.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.simple.Image": {}
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
     * Martin Wittemann (martinwittemann)
  
  ************************************************************************* */

  /* ************************************************************************
  
  
  ************************************************************************* */

  /**
   * The simple qooxdoo appearance theme.
   *
   * @asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)
   * @asset(qx/icon/${qx.icontheme}/16/places/folder-open.png)
   * @asset(qx/icon/${qx.icontheme}/16/places/folder.png)
   * @asset(qx/icon/${qx.icontheme}/16/mimetypes/text-plain.png)
   * @asset(qx/icon/${qx.icontheme}/16/actions/view-refresh.png)
   * @asset(qx/icon/${qx.icontheme}/16/actions/window-close.png)
   * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)
   * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
   */
  qx.Theme.define("qx.theme.simple.Appearance", {
    appearances: {
      /*
      ---------------------------------------------------------------------------
        CORE
      ---------------------------------------------------------------------------
      */
      "widget": {},
      "label": {
        style: function style(states) {
          return {
            textColor: states.disabled ? "text-disabled" : undefined
          };
        }
      },
      "image": {
        style: function style(states) {
          return {
            opacity: !states.replacement && states.disabled ? 0.3 : undefined
          };
        }
      },
      "atom": {},
      "atom/label": "label",
      "atom/icon": "image",
      "root": {
        style: function style(states) {
          return {
            backgroundColor: "background",
            textColor: "text",
            font: "default"
          };
        }
      },
      "popup": {
        style: function style(states) {
          return {
            decorator: "popup",
            backgroundColor: "background-pane"
          };
        }
      },
      "tooltip": {
        include: "popup",
        style: function style(states) {
          return {
            backgroundColor: "tooltip",
            textColor: "tooltip-text",
            decorator: "tooltip",
            padding: [1, 3, 2, 3],
            offset: [10, 5, 5, 5]
          };
        }
      },
      "tooltip/atom": "atom",
      "tooltip-error": {
        include: "tooltip",
        style: function style(states) {
          return {
            textColor: "text-selected",
            showTimeout: 100,
            hideTimeout: 10000,
            decorator: "tooltip-error",
            font: "bold",
            backgroundColor: undefined
          };
        }
      },
      "tooltip-error/atom": "atom",
      "iframe": {
        style: function style(states) {
          return {
            backgroundColor: "white",
            decorator: "main-dark"
          };
        }
      },
      "move-frame": {
        style: function style(states) {
          return {
            decorator: "main-dark"
          };
        }
      },
      "resize-frame": "move-frame",
      "dragdrop-cursor": {
        style: function style(states) {
          var icon = "nodrop";

          if (states.copy) {
            icon = "copy";
          } else if (states.move) {
            icon = "move";
          } else if (states.alias) {
            icon = "alias";
          }

          return {
            source: qx.theme.simple.Image.URLS["cursor-" + icon],
            position: "right-top",
            offset: [2, 16, 2, 6]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        SLIDEBAR
      ---------------------------------------------------------------------------
      */
      "slidebar": {},
      "slidebar/scrollpane": {},
      "slidebar/content": {},
      "slidebar/button-forward": {
        alias: "button",
        include: "button",
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["arrow-" + (states.vertical ? "down" : "right")]
          };
        }
      },
      "slidebar/button-backward": {
        alias: "button",
        include: "button",
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["arrow-" + (states.vertical ? "up" : "left")]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        TABLE
      ---------------------------------------------------------------------------
      */
      "table": "widget",
      "table/statusbar": {
        style: function style(states) {
          return {
            decorator: "statusbar",
            padding: [2, 5]
          };
        }
      },
      "table/column-button": {
        alias: "button",
        style: function style(states) {
          return {
            decorator: "table-header-column-button",
            padding: 3,
            icon: qx.theme.simple.Image.URLS["select-column-order"]
          };
        }
      },
      "table-column-reset-button": {
        include: "menu-button",
        alias: "menu-button",
        style: function style() {
          return {
            icon: "icon/16/actions/view-refresh.png"
          };
        }
      },
      "table-scroller/scrollbar-x": "scrollbar",
      "table-scroller/scrollbar-y": "scrollbar",
      "table-scroller": "widget",
      "table-scroller/header": {
        style: function style() {
          return {
            decorator: "table-header"
          };
        }
      },
      "table-scroller/pane": {},
      "table-scroller/focus-indicator": {
        style: function style(states) {
          return {
            decorator: "main"
          };
        }
      },
      "table-scroller/resize-line": {
        style: function style(states) {
          return {
            backgroundColor: "button-border",
            width: 3
          };
        }
      },
      "table-header-cell": {
        alias: "atom",
        style: function style(states) {
          return {
            decorator: states.first ? "table-header-cell-first" : "table-header-cell",
            minWidth: 13,
            font: "bold",
            paddingTop: 3,
            paddingLeft: 5,
            cursor: states.disabled ? undefined : "pointer",
            sortIcon: states.sorted ? qx.theme.simple.Image.URLS["table-" + (states.sortedAscending ? "ascending" : "descending")] : undefined
          };
        }
      },
      "table-header-cell/icon": {
        include: "atom/icon",
        style: function style(states) {
          return {
            paddingRight: 5
          };
        }
      },
      "table-header-cell/sort-icon": {
        style: function style(states) {
          return {
            alignY: "middle",
            alignX: "right",
            paddingRight: 5
          };
        }
      },
      "table-editor-textfield": {
        include: "textfield",
        style: function style(states) {
          return {
            decorator: undefined,
            padding: [2, 2]
          };
        }
      },
      "table-editor-selectbox": {
        include: "selectbox",
        alias: "selectbox",
        style: function style(states) {
          return {
            padding: [0, 2]
          };
        }
      },
      "table-editor-combobox": {
        include: "combobox",
        alias: "combobox",
        style: function style(states) {
          return {
            decorator: undefined
          };
        }
      },
      "progressive-table-header": {
        style: function style(states) {
          return {
            decorator: "progressive-table-header"
          };
        }
      },
      "progressive-table-header-cell": {
        style: function style(states) {
          return {
            decorator: "progressive-table-header-cell",
            padding: [5, 6, 5, 6]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        TREEVIRTUAL
      ---------------------------------------------------------------------------
      */
      "treevirtual": {
        include: "textfield",
        alias: "table",
        style: function style(states, superStyles) {
          return {
            padding: [superStyles.padding[0] + 2, superStyles.padding[1] + 1]
          };
        }
      },
      "treevirtual-folder": {
        style: function style(states) {
          return {
            icon: states.opened ? "icon/16/places/folder-open.png" : "icon/16/places/folder.png",
            opacity: states.drag ? 0.5 : undefined
          };
        }
      },
      "treevirtual-file": {
        include: "treevirtual-folder",
        alias: "treevirtual-folder",
        style: function style(states) {
          return {
            icon: "icon/16/mimetypes/text-plain.png",
            opacity: states.drag ? 0.5 : undefined
          };
        }
      },
      "treevirtual-line": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-line"]
          };
        }
      },
      "treevirtual-contract": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["tree-minus"]
          };
        }
      },
      "treevirtual-expand": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["tree-plus"]
          };
        }
      },
      "treevirtual-only-contract": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-minus-only"]
          };
        }
      },
      "treevirtual-only-expand": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-plus-only"]
          };
        }
      },
      "treevirtual-start-contract": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-minus-start"]
          };
        }
      },
      "treevirtual-start-expand": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-plus-start"]
          };
        }
      },
      "treevirtual-end-contract": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-minus-end"]
          };
        }
      },
      "treevirtual-end-expand": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-plus-end"]
          };
        }
      },
      "treevirtual-cross-contract": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-minus-cross"]
          };
        }
      },
      "treevirtual-cross-expand": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-plus-cross"]
          };
        }
      },
      "treevirtual-end": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-end"]
          };
        }
      },
      "treevirtual-cross": {
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["treevirtual-cross"]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        RESIZER
      ---------------------------------------------------------------------------
      */
      "resizer": {
        style: function style(states) {
          return {
            decorator: "main-dark"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        SPLITPANE
      ---------------------------------------------------------------------------
      */
      "splitpane": {},
      "splitpane/splitter": {
        style: function style(states) {
          return {
            backgroundColor: "light-background"
          };
        }
      },
      "splitpane/splitter/knob": {
        style: function style(states) {
          return {
            source: qx.theme.simple.Image.URLS["knob-" + (states.horizontal ? "horizontal" : "vertical")],
            padding: 2
          };
        }
      },
      "splitpane/slider": {
        style: function style(states) {
          return {
            backgroundColor: "border-light-shadow",
            opacity: 0.3
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        MENU
      ---------------------------------------------------------------------------
      */
      "menu": {
        style: function style(states) {
          var result = {
            backgroundColor: "background",
            decorator: "main",
            spacingX: 6,
            spacingY: 1,
            iconColumnWidth: 16,
            arrowColumnWidth: 4,
            padding: 1,
            placementModeY: states.submenu || states.contextmenu ? "best-fit" : "keep-align"
          };

          if (states.submenu) {
            result.position = "right-top";
            result.offset = [-2, -3];
          }

          if (states.contextmenu) {
            result.offset = 4;
          }

          return result;
        }
      },
      "menu/slidebar": "menu-slidebar",
      "menu-slidebar": "widget",
      "menu-slidebar-button": {
        style: function style(states) {
          return {
            backgroundColor: states.hovered ? "background-selected" : undefined,
            padding: 6,
            center: true
          };
        }
      },
      "menu-slidebar/button-backward": {
        include: "menu-slidebar-button",
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["arrow-up" + (states.hovered ? "-invert" : "")]
          };
        }
      },
      "menu-slidebar/button-forward": {
        include: "menu-slidebar-button",
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["arrow-down" + (states.hovered ? "-invert" : "")]
          };
        }
      },
      "menu-separator": {
        style: function style(states) {
          return {
            height: 0,
            decorator: "menu-separator",
            marginTop: 4,
            marginBottom: 4,
            marginLeft: 2,
            marginRight: 2
          };
        }
      },
      "menu-button": {
        alias: "atom",
        style: function style(states) {
          return {
            backgroundColor: states.selected ? "background-selected" : undefined,
            textColor: states.selected ? "text-selected" : undefined,
            padding: [2, 6]
          };
        }
      },
      "menu-button/icon": {
        include: "image",
        style: function style(states) {
          return {
            alignY: "middle"
          };
        }
      },
      "menu-button/label": {
        include: "label",
        style: function style(states) {
          return {
            alignY: "middle",
            padding: 1
          };
        }
      },
      "menu-button/shortcut": {
        include: "label",
        style: function style(states) {
          return {
            alignY: "middle",
            marginLeft: 14,
            padding: 1
          };
        }
      },
      "menu-button/arrow": {
        include: "image",
        style: function style(states) {
          return {
            source: qx.theme.simple.Image.URLS["arrow-right" + (states.selected ? "-invert" : "")],
            alignY: "middle"
          };
        }
      },
      "menu-checkbox": {
        alias: "menu-button",
        include: "menu-button",
        style: function style(states) {
          return {
            icon: !states.checked ? undefined : qx.theme.simple.Image.URLS["menu-checkbox" + (states.selected ? "-invert" : "")]
          };
        }
      },
      "menu-radiobutton": {
        alias: "menu-button",
        include: "menu-button",
        style: function style(states) {
          return {
            icon: !states.checked ? undefined : qx.theme.simple.Image.URLS["menu-radiobutton" + (states.selected ? "-invert" : "")]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        MENU BAR
      ---------------------------------------------------------------------------
      */
      "menubar": {
        style: function style(states) {
          return {
            backgroundColor: "light-background",
            padding: [4, 2]
          };
        }
      },
      "menubar-button": {
        style: function style(states) {
          var decorator;
          var padding = [2, 6];

          if (!states.disabled) {
            if (states.pressed) {
              decorator = "menubar-button-pressed";
              padding = [1, 5, 2, 5];
            } else if (states.hovered) {
              decorator = "menubar-button-hovered";
              padding = [1, 5];
            }
          }

          return {
            padding: padding,
            cursor: states.disabled ? undefined : "pointer",
            textColor: "link",
            decorator: decorator
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        VIRTUAL WIDGETS
      ---------------------------------------------------------------------------
      */
      "virtual-list": "list",
      "virtual-list/row-layer": "row-layer",
      "row-layer": "widget",
      "column-layer": "widget",
      "group-item": {
        include: "label",
        alias: "label",
        style: function style(states) {
          return {
            padding: 4,
            backgroundColor: "#BABABA",
            textColor: "white",
            font: "bold"
          };
        }
      },
      "virtual-selectbox": "selectbox",
      "virtual-selectbox/dropdown": "popup",
      "virtual-selectbox/dropdown/list": {
        alias: "virtual-list"
      },
      "virtual-combobox": "combobox",
      "virtual-combobox/dropdown": "popup",
      "virtual-combobox/dropdown/list": {
        alias: "virtual-list"
      },
      "virtual-tree": {
        include: "tree",
        alias: "tree",
        style: function style(states) {
          return {
            itemHeight: 21
          };
        }
      },
      "virtual-tree-folder": "tree-folder",
      "virtual-tree-file": "tree-file",
      "cell": {
        style: function style(states) {
          return {
            backgroundColor: states.selected ? "table-row-background-selected" : "table-row-background-even",
            textColor: states.selected ? "text-selected" : "text",
            padding: [3, 6]
          };
        }
      },
      "cell-string": "cell",
      "cell-number": {
        include: "cell",
        style: function style(states) {
          return {
            textAlign: "right"
          };
        }
      },
      "cell-image": "cell",
      "cell-boolean": "cell",
      "cell-atom": "cell",
      "cell-date": "cell",
      "cell-html": "cell",

      /*
      ---------------------------------------------------------------------------
        SCROLLBAR
      ---------------------------------------------------------------------------
      */
      "scrollbar": {},
      "scrollbar/slider": {},
      "scrollbar/slider/knob": {
        style: function style(states) {
          var decorator = "scroll-knob";

          if (!states.disabled) {
            if (states.hovered && !states.pressed && !states.checked) {
              decorator = "scroll-knob-hovered";
            } else if (states.hovered && (states.pressed || states.checked)) {
              decorator = "scroll-knob-pressed-hovered";
            } else if (states.pressed || states.checked) {
              decorator = "scroll-knob-pressed";
            }
          }

          return {
            height: 14,
            width: 14,
            cursor: states.disabled ? undefined : "pointer",
            decorator: decorator,
            minHeight: states.horizontal ? undefined : 20,
            minWidth: states.horizontal ? 20 : undefined
          };
        }
      },
      "scrollbar/button": {
        style: function style(states) {
          var styles = {};
          styles.padding = 4;
          var icon = "";

          if (states.left) {
            icon = "left";
            styles.marginRight = 2;
          } else if (states.right) {
            icon += "right";
            styles.marginLeft = 2;
          } else if (states.up) {
            icon += "up";
            styles.marginBottom = 2;
          } else {
            icon += "down";
            styles.marginTop = 2;
          }

          styles.icon = qx.theme.simple.Image.URLS["arrow-" + icon];
          styles.cursor = "pointer";
          styles.decorator = "button-box";
          return styles;
        }
      },
      "scrollbar/button-begin": "scrollbar/button",
      "scrollbar/button-end": "scrollbar/button",

      /*
      ---------------------------------------------------------------------------
        SCROLLAREA
      ---------------------------------------------------------------------------
      */
      "scrollarea/corner": {
        style: function style(states) {
          return {
            backgroundColor: "background"
          };
        }
      },
      "scrollarea": "widget",
      "scrollarea/pane": "widget",
      "scrollarea/scrollbar-x": "scrollbar",
      "scrollarea/scrollbar-y": "scrollbar",

      /*
      ---------------------------------------------------------------------------
        TEXT FIELD
      ---------------------------------------------------------------------------
      */
      "textfield": {
        style: function style(states) {
          var textColor;

          if (states.disabled) {
            textColor = "text-disabled";
          } else if (states.showingPlaceholder) {
            textColor = "text-placeholder";
          } else {
            textColor = undefined;
          }

          var decorator;
          var padding;

          if (states.disabled) {
            decorator = "inset";
            padding = [2, 3];
          } else if (states.invalid) {
            decorator = "border-invalid";
            padding = [1, 2];
          } else if (states.focused) {
            decorator = "focused-inset";
            padding = [1, 2];
          } else {
            padding = [2, 3];
            decorator = "inset";
          }

          return {
            decorator: decorator,
            padding: padding,
            textColor: textColor,
            backgroundColor: states.disabled ? "background-disabled" : "white"
          };
        }
      },
      "textarea": "textfield",

      /*
      ---------------------------------------------------------------------------
        RADIO BUTTON
      ---------------------------------------------------------------------------
      */
      "radiobutton/icon": {
        style: function style(states) {
          var decorator = "radiobutton";

          if (states.focused && !states.invalid) {
            decorator = "radiobutton-focused";
          }

          decorator += states.invalid && !states.disabled ? "-invalid" : "";
          var backgroundColor;

          if (states.disabled && states.checked) {
            backgroundColor = "background-disabled-checked";
          } else if (states.disabled) {
            backgroundColor = "background-disabled";
          } else if (states.checked) {
            backgroundColor = "background-selected";
          }

          return {
            decorator: decorator,
            width: 12,
            height: 12,
            backgroundColor: backgroundColor
          };
        }
      },
      "radiobutton": {
        style: function style(states) {
          // set an empty icon to be sure that the icon image is rendered
          return {
            icon: qx.theme.simple.Image.URLS["blank"]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        FORM
      ---------------------------------------------------------------------------
      */
      "form-renderer-label": {
        include: "label",
        style: function style() {
          return {
            paddingTop: 3
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        CHECK BOX
      ---------------------------------------------------------------------------
      */
      "checkbox": {
        alias: "atom",
        style: function style(states) {
          // The "disabled" icon is set to an icon **without** the -disabled
          // suffix on purpose. This is because the Image widget handles this
          // already by replacing the current image with a disabled version
          // (if available). If no disabled image is found, the opacity style
          // is used.
          var icon; // Checked

          if (states.checked) {
            icon = qx.theme.simple.Image.URLS["checkbox-checked"]; // Undetermined
          } else if (states.undetermined) {
            icon = qx.theme.simple.Image.URLS["checkbox-undetermined"]; // Unchecked
          } else {
            // empty icon
            icon = qx.theme.simple.Image.URLS["blank"];
          }

          return {
            icon: icon,
            gap: 6
          };
        }
      },
      "checkbox/icon": {
        style: function style(states) {
          var decorator = "checkbox";

          if (states.focused && !states.invalid) {
            decorator = "checkbox-focused";
          }

          decorator += states.invalid && !states.disabled ? "-invalid" : "";
          var padding; // Checked

          if (states.checked) {
            padding = 2; // Undetermined
          } else if (states.undetermined) {
            padding = [4, 2];
          }

          return {
            decorator: decorator,
            width: 12,
            height: 12,
            padding: padding,
            backgroundColor: "white"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        SPINNER
      ---------------------------------------------------------------------------
      */
      "spinner": {
        style: function style(states) {
          return {
            textColor: states.disabled ? "text-disabled" : undefined
          };
        }
      },
      "spinner/textfield": "textfield",
      "spinner/upbutton": {
        alias: "combobox/button",
        include: "combobox/button",
        style: function style(states) {
          var decorator = "button-box-top-right";

          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered-top-right";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered-top-right";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed-top-right";
          }

          return {
            icon: qx.theme.simple.Image.URLS["arrow-up-small"],
            decorator: decorator,
            width: 17
          };
        }
      },
      "spinner/downbutton": {
        alias: "combobox/button",
        include: "combobox/button",
        style: function style(states) {
          var decorator = "button-box-bottom-right";

          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered-bottom-right";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered-bottom-right";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed-bottom-right";
          }

          return {
            icon: qx.theme.simple.Image.URLS["arrow-down-small"],
            decorator: decorator,
            width: 17
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        SELECTBOX
      ---------------------------------------------------------------------------
      */
      "selectbox": "button-frame",
      "selectbox/atom": "atom",
      "selectbox/popup": "popup",
      "selectbox/list": {
        alias: "list",
        include: "list",
        style: function style() {
          return {
            decorator: undefined
          };
        }
      },
      "selectbox/arrow": {
        include: "image",
        style: function style(states) {
          return {
            source: qx.theme.simple.Image.URLS["arrow-down"],
            paddingRight: 4,
            paddingLeft: 5
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        COMBO BOX
      ---------------------------------------------------------------------------
      */
      "combobox": {},
      "combobox/button": {
        alias: "button-frame",
        include: "button-frame",
        style: function style(states) {
          var decorator = "button-box-right-borderless";

          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered-right-borderless";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered-right-borderless";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed-right-borderless";
          }

          return {
            icon: qx.theme.simple.Image.URLS["arrow-down"],
            decorator: decorator,
            padding: [0, 5],
            width: 19
          };
        }
      },
      "combobox/popup": "popup",
      "combobox/list": {
        alias: "list"
      },
      "combobox/textfield": "textfield",

      /*
      ---------------------------------------------------------------------------
        DATEFIELD
      ---------------------------------------------------------------------------
      */
      "datefield": "textfield",
      "datefield/button": {
        alias: "combobox/button",
        include: "combobox/button",
        style: function style(states) {
          return {
            icon: "icon/16/apps/office-calendar.png",
            padding: [0, 0, 0, 3],
            backgroundColor: undefined,
            decorator: undefined,
            width: 19
          };
        }
      },
      "datefield/textfield": {
        alias: "textfield",
        include: "textfield",
        style: function style(states) {
          return {
            decorator: undefined,
            padding: 0
          };
        }
      },
      "datefield/list": {
        alias: "datechooser",
        include: "datechooser",
        style: function style(states) {
          return {
            decorator: undefined
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        LIST
      ---------------------------------------------------------------------------
      */
      "list": {
        alias: "scrollarea",
        include: "textfield"
      },
      "listitem": {
        alias: "atom",
        style: function style(states) {
          var padding = [3, 5, 3, 5];

          if (states.lead) {
            padding = [2, 4, 2, 4];
          }

          if (states.dragover) {
            padding[2] -= 2;
          }

          var backgroundColor;

          if (states.selected) {
            backgroundColor = "background-selected";

            if (states.disabled) {
              backgroundColor += "-disabled";
            }
          }

          return {
            gap: 4,
            padding: padding,
            backgroundColor: backgroundColor,
            textColor: states.selected ? "text-selected" : undefined,
            decorator: states.lead ? "lead-item" : states.dragover ? "dragover" : undefined,
            opacity: states.drag ? 0.5 : undefined
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        SLIDER
      ---------------------------------------------------------------------------
      */
      "slider": {
        style: function style(states) {
          var decorator;
          var padding;

          if (states.disabled) {
            decorator = "inset";
            padding = [2, 3];
          } else if (states.invalid) {
            decorator = "border-invalid";
            padding = [1, 2];
          } else if (states.focused) {
            decorator = "focused-inset";
            padding = [1, 2];
          } else {
            padding = [2, 3];
            decorator = "inset";
          }

          return {
            decorator: decorator,
            padding: padding
          };
        }
      },
      "slider/knob": "scrollbar/slider/knob",

      /*
      ---------------------------------------------------------------------------
        BUTTON
      ---------------------------------------------------------------------------
      */
      "button-frame": {
        alias: "atom",
        style: function style(states) {
          var decorator = "button-box";

          if (!states.disabled) {
            if (states.hovered && !states.pressed && !states.checked) {
              decorator = "button-box-hovered";
            } else if (states.hovered && (states.pressed || states.checked)) {
              decorator = "button-box-pressed-hovered";
            } else if (states.pressed || states.checked) {
              decorator = "button-box-pressed";
            }
          }

          if (states.invalid && !states.disabled) {
            decorator += "-invalid";
          } else if (states.focused) {
            decorator += "-focused";
          }

          return {
            decorator: decorator,
            padding: [3, 8],
            cursor: states.disabled ? undefined : "pointer",
            minWidth: 5,
            minHeight: 5
          };
        }
      },
      "button-frame/label": {
        alias: "atom/label",
        style: function style(states) {
          return {
            textColor: states.disabled ? "text-disabled" : undefined
          };
        }
      },
      "button": {
        alias: "button-frame",
        include: "button-frame",
        style: function style(states) {
          return {
            center: true
          };
        }
      },
      "hover-button": {
        alias: "button",
        include: "button",
        style: function style(states) {
          return {
            decorator: states.hovered ? "button-hover" : undefined
          };
        }
      },
      "menubutton": {
        include: "button",
        alias: "button",
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["arrow-down"],
            iconPosition: "right"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        SPLIT BUTTON
      ---------------------------------------------------------------------------
      */
      "splitbutton": {},
      "splitbutton/button": {
        alias: "atom",
        style: function style(states) {
          var decorator = "button-box";

          if (!states.disabled) {
            if (states.pressed || states.checked) {
              decorator += "-pressed";
            }

            if (states.hovered) {
              decorator += "-hovered";
            }
          }

          if (states.focused) {
            decorator += "-focused";
          }

          decorator += "-left";
          return {
            decorator: decorator,
            padding: [3, 8],
            cursor: states.disabled ? undefined : "pointer"
          };
        }
      },
      "splitbutton/arrow": {
        style: function style(states) {
          var decorator = "button-box";

          if (!states.disabled) {
            if (states.pressed || states.checked) {
              decorator += "-pressed";
            }

            if (states.hovered) {
              decorator += "-hovered";
            }
          }

          if (states.focused) {
            decorator += "-focused";
          }

          decorator += "-right";
          return {
            icon: qx.theme.simple.Image.URLS["arrow-down"],
            decorator: decorator,
            cursor: states.disabled ? undefined : "pointer",
            padding: [3, 4]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        GROUP BOX
      ---------------------------------------------------------------------------
      */
      "groupbox": {},
      "groupbox/legend": {
        alias: "atom",
        style: function style(states) {
          return {
            textColor: states.invalid ? "invalid" : undefined,
            padding: 5,
            margin: 4,
            font: "bold"
          };
        }
      },
      "groupbox/frame": {
        style: function style(states) {
          return {
            backgroundColor: "background",
            padding: [6, 9],
            margin: [18, 2, 2, 2],
            decorator: "white-box"
          };
        }
      },
      "check-groupbox": "groupbox",
      "check-groupbox/legend": {
        alias: "checkbox",
        include: "checkbox",
        style: function style(states) {
          return {
            textColor: states.invalid ? "invalid" : undefined,
            padding: 5,
            margin: 4,
            font: "bold"
          };
        }
      },
      "radio-groupbox": "groupbox",
      "radio-groupbox/legend": {
        alias: "radiobutton",
        include: "radiobutton",
        style: function style(states) {
          return {
            textColor: states.invalid ? "invalid" : undefined,
            padding: 5,
            margin: 4,
            font: "bold"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        TREE
      ---------------------------------------------------------------------------
      */
      "tree-folder/open": {
        include: "image",
        style: function style(states) {
          return {
            source: states.opened ? qx.theme.simple.Image.URLS["tree-minus"] : qx.theme.simple.Image.URLS["tree-plus"]
          };
        }
      },
      "tree-folder": {
        style: function style(states) {
          var backgroundColor;

          if (states.selected) {
            backgroundColor = "background-selected";

            if (states.disabled) {
              backgroundColor += "-disabled";
            }
          }

          return {
            padding: [2, 8, 2, 5],
            icon: states.opened ? "icon/16/places/folder-open.png" : "icon/16/places/folder.png",
            backgroundColor: backgroundColor,
            iconOpened: "icon/16/places/folder-open.png",
            opacity: states.drag ? 0.5 : undefined
          };
        }
      },
      "tree-folder/icon": {
        include: "image",
        style: function style(states) {
          return {
            padding: [0, 4, 0, 0]
          };
        }
      },
      "tree-folder/label": {
        style: function style(states) {
          return {
            padding: [1, 2],
            textColor: states.selected && !states.disabled ? "text-selected" : undefined
          };
        }
      },
      "tree-file": {
        include: "tree-folder",
        alias: "tree-folder",
        style: function style(states) {
          return {
            icon: "icon/16/mimetypes/text-plain.png",
            opacity: states.drag ? 0.5 : undefined
          };
        }
      },
      "tree": {
        include: "list",
        alias: "list",
        style: function style(states) {
          return {
            contentPadding: states.invalid && !states.disabled ? [3, 0] : [4, 1],
            padding: states.focused ? 0 : 1
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        WINDOW
      ---------------------------------------------------------------------------
      */
      "window": {
        style: function style(states) {
          return {
            contentPadding: [10, 10, 10, 10],
            backgroundColor: "background",
            decorator: states.maximized ? undefined : states.active ? "window-active" : "window"
          };
        }
      },
      "window-resize-frame": "resize-frame",
      "window/pane": {},
      "window/captionbar": {
        style: function style(states) {
          return {
            backgroundColor: states.active ? "light-background" : "background-disabled",
            padding: 8,
            font: "bold",
            decorator: "window-caption"
          };
        }
      },
      "window/icon": {
        style: function style(states) {
          return {
            marginRight: 4
          };
        }
      },
      "window/title": {
        style: function style(states) {
          return {
            cursor: "default",
            font: "bold",
            marginRight: 20,
            alignY: "middle"
          };
        }
      },
      "window/minimize-button": {
        alias: "button",
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["window-minimize"],
            padding: [1, 2],
            cursor: states.disabled ? undefined : "pointer"
          };
        }
      },
      "window/restore-button": {
        alias: "button",
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["window-restore"],
            padding: [1, 2],
            cursor: states.disabled ? undefined : "pointer"
          };
        }
      },
      "window/maximize-button": {
        alias: "button",
        style: function style(states) {
          return {
            icon: qx.theme.simple.Image.URLS["window-maximize"],
            padding: [1, 2],
            cursor: states.disabled ? undefined : "pointer"
          };
        }
      },
      "window/close-button": {
        alias: "button",
        style: function style(states) {
          return {
            marginLeft: 2,
            icon: qx.theme.simple.Image.URLS["window-close"],
            padding: [1, 2],
            cursor: states.disabled ? undefined : "pointer"
          };
        }
      },
      "window/statusbar": {
        style: function style(states) {
          return {
            decorator: "statusbar",
            padding: [2, 6]
          };
        }
      },
      "window/statusbar-text": "label",

      /*
      ---------------------------------------------------------------------------
        DATE CHOOSER
      ---------------------------------------------------------------------------
      */
      "datechooser": {
        style: function style(states) {
          return {
            decorator: "main",
            minWidth: 220
          };
        }
      },
      "datechooser/navigation-bar": {
        style: function style(states) {
          return {
            backgroundColor: "background",
            textColor: states.disabled ? "text-disabled" : states.invalid ? "invalid" : undefined,
            padding: [2, 10]
          };
        }
      },
      "datechooser/last-year-button-tooltip": "tooltip",
      "datechooser/last-month-button-tooltip": "tooltip",
      "datechooser/next-year-button-tooltip": "tooltip",
      "datechooser/next-month-button-tooltip": "tooltip",
      "datechooser/last-year-button": "datechooser/button",
      "datechooser/last-month-button": "datechooser/button",
      "datechooser/next-year-button": "datechooser/button",
      "datechooser/next-month-button": "datechooser/button",
      "datechooser/button/icon": {},
      "datechooser/button": {
        style: function style(states) {
          var result = {
            width: 17,
            show: "icon",
            cursor: states.disabled ? undefined : "pointer"
          };

          if (states.lastYear) {
            result.icon = qx.theme.simple.Image.URLS["arrow-rewind"];
          } else if (states.lastMonth) {
            result.icon = qx.theme.simple.Image.URLS["arrow-left"];
          } else if (states.nextYear) {
            result.icon = qx.theme.simple.Image.URLS["arrow-forward"];
          } else if (states.nextMonth) {
            result.icon = qx.theme.simple.Image.URLS["arrow-right"];
          }

          return result;
        }
      },
      "datechooser/month-year-label": {
        style: function style(states) {
          return {
            font: "bold",
            textAlign: "center"
          };
        }
      },
      "datechooser/date-pane": {
        style: function style(states) {
          return {
            decorator: "datechooser-date-pane",
            backgroundColor: "background"
          };
        }
      },
      "datechooser/weekday": {
        style: function style(states) {
          return {
            decorator: "datechooser-weekday",
            font: "bold",
            textAlign: "center",
            textColor: states.disabled ? "text-disabled" : states.weekend ? "background-selected-dark" : "background",
            backgroundColor: states.weekend ? "background" : "background-selected-dark",
            paddingTop: 2
          };
        }
      },
      "datechooser/day": {
        style: function style(states) {
          return {
            textAlign: "center",
            decorator: states.today ? "main" : undefined,
            textColor: states.disabled ? "text-disabled" : states.selected ? "text-selected" : states.otherMonth ? "text-disabled" : undefined,
            backgroundColor: states.disabled ? undefined : states.selected ? "background-selected" : undefined,
            padding: states.today ? [1, 3] : [2, 4]
          };
        }
      },
      "datechooser/week": {
        style: function style(states) {
          return {
            textAlign: "center",
            textColor: "background-selected-dark",
            padding: [2, 4],
            decorator: states.header ? "datechooser-week-header" : "datechooser-week"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROGRESSBAR
      ---------------------------------------------------------------------------
      */
      "progressbar": {
        style: function style(states) {
          return {
            decorator: "progressbar",
            padding: 1,
            backgroundColor: "white",
            width: 200,
            height: 20
          };
        }
      },
      "progressbar/progress": {
        style: function style(states) {
          return {
            backgroundColor: states.disabled ? "background-disabled-checked" : "background-selected"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        TOOLBAR
      ---------------------------------------------------------------------------
      */
      "toolbar": {
        style: function style(states) {
          return {
            backgroundColor: "light-background",
            padding: 0
          };
        }
      },
      "toolbar/part": {
        style: function style(states) {
          return {
            margin: [0, 15]
          };
        }
      },
      "toolbar/part/container": {},
      "toolbar/part/handle": {},
      "toolbar-separator": {
        style: function style(states) {
          return {
            decorator: "toolbar-separator",
            margin: [7, 0],
            width: 4
          };
        }
      },
      "toolbar-button": {
        alias: "atom",
        style: function style(states) {
          var decorator = "button-box";

          if (states.disabled) {
            decorator = "button-box";
          } else if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed";
          } // set the right left and right decorator


          if (states.left) {
            decorator += "-left";
          } else if (states.right) {
            decorator += "-right";
          } else if (states.middle) {
            decorator += "-middle";
          } // set the margin


          var margin = [7, 10];

          if (states.left || states.middle || states.right) {
            margin = [7, 0];
          }

          return {
            cursor: states.disabled ? undefined : "pointer",
            decorator: decorator,
            margin: margin,
            padding: [3, 5]
          };
        }
      },
      "toolbar-menubutton": {
        alias: "toolbar-button",
        include: "toolbar-button",
        style: function style(states) {
          return {
            showArrow: true
          };
        }
      },
      "toolbar-menubutton/arrow": {
        alias: "image",
        include: "image",
        style: function style(states) {
          return {
            source: qx.theme.simple.Image.URLS["arrow-down"],
            cursor: states.disabled ? undefined : "pointer",
            padding: [0, 5],
            marginLeft: 2
          };
        }
      },
      "toolbar-splitbutton": {},
      "toolbar-splitbutton/button": {
        alias: "toolbar-button",
        include: "toolbar-button",
        style: function style(states) {
          var decorator = "button-box";

          if (states.disabled) {
            decorator = "button-box";
          } else if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed";
          } // default margin, when the button is alone


          var margin = [7, 0, 7, 10];

          if (states.left || states.middle || states.right) {
            margin = [7, 0, 7, 0];
          } // set the right left and right decorator


          if (states.left) {
            decorator += "-left";
          } else if (states.right) {
            decorator += "-middle";
          } else if (states.middle) {
            decorator += "-middle";
          } else {
            decorator += "-left";
          }

          return {
            icon: qx.theme.simple.Image.URLS["arrow-down"],
            decorator: decorator,
            margin: margin
          };
        }
      },
      "toolbar-splitbutton/arrow": {
        alias: "toolbar-button",
        include: "toolbar-button",
        style: function style(states) {
          var decorator = "button-box";

          if (states.disabled) {
            decorator = "button-box";
          } else if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed";
          } // default margin, when the button is alone


          var margin = [7, 10, 7, 0];

          if (states.left || states.middle || states.right) {
            margin = [7, 0, 7, 0];
          } // set the right left and right decorator


          if (states.left) {
            decorator += "-middle";
          } else if (states.right) {
            decorator += "-right";
          } else if (states.middle) {
            decorator += "-middle";
          } else {
            decorator += "-right";
          }

          return {
            icon: qx.theme.simple.Image.URLS["arrow-down"],
            decorator: decorator,
            margin: margin
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        TABVIEW
      ---------------------------------------------------------------------------
      */
      "tabview": {},
      "tabview/bar": {
        alias: "slidebar",
        style: function style(states) {
          var marginTop = 0,
              marginRight = 0,
              marginBottom = 0,
              marginLeft = 0;

          if (states.barTop) {
            marginBottom -= 1;
          } else if (states.barBottom) {
            marginTop -= 1;
          } else if (states.barRight) {
            marginLeft -= 1;
          } else {
            marginRight -= 1;
          }

          return {
            marginBottom: marginBottom,
            marginTop: marginTop,
            marginLeft: marginLeft,
            marginRight: marginRight
          };
        }
      },
      "tabview/bar/button-forward": {
        include: "slidebar/button-forward",
        alias: "slidebar/button-forward",
        style: function style(states) {
          if (states.barTop) {
            return {
              marginTop: 4,
              marginBottom: 2,
              decorator: null
            };
          } else if (states.barBottom) {
            return {
              marginTop: 2,
              marginBottom: 4,
              decorator: null
            };
          } else if (states.barLeft) {
            return {
              marginLeft: 4,
              marginRight: 2,
              decorator: null
            };
          } else {
            return {
              marginLeft: 2,
              marginRight: 4,
              decorator: null
            };
          }
        }
      },
      "tabview/bar/button-backward": {
        include: "slidebar/button-backward",
        alias: "slidebar/button-backward",
        style: function style(states) {
          if (states.barTop) {
            return {
              marginTop: 4,
              marginBottom: 2,
              decorator: null
            };
          } else if (states.barBottom) {
            return {
              marginTop: 2,
              marginBottom: 4,
              decorator: null
            };
          } else if (states.barLeft) {
            return {
              marginLeft: 4,
              marginRight: 2,
              decorator: null
            };
          } else {
            return {
              marginLeft: 2,
              marginRight: 4,
              decorator: null
            };
          }
        }
      },
      "tabview/pane": {
        style: function style(states) {
          return {
            backgroundColor: "background",
            decorator: "main",
            padding: 10
          };
        }
      },
      "tabview-page": "widget",
      "tabview-page/button": {
        style: function style(states) {
          var decorator; // default padding

          if (states.barTop || states.barBottom) {
            var padding = [8, 16, 8, 13];
          } else {
            var padding = [8, 4, 8, 4];
          } // decorator


          if (states.checked) {
            if (states.barTop) {
              decorator = "tabview-page-button-top";
            } else if (states.barBottom) {
              decorator = "tabview-page-button-bottom";
            } else if (states.barRight) {
              decorator = "tabview-page-button-right";
            } else if (states.barLeft) {
              decorator = "tabview-page-button-left";
            }
          } else {
            for (var i = 0; i < padding.length; i++) {
              padding[i] += 1;
            } // reduce the size by 1 because we have different decorator border width


            if (states.barTop) {
              padding[2] -= 1;
            } else if (states.barBottom) {
              padding[0] -= 1;
            } else if (states.barRight) {
              padding[3] -= 1;
            } else if (states.barLeft) {
              padding[1] -= 1;
            }
          }

          return {
            zIndex: states.checked ? 10 : 5,
            decorator: decorator,
            textColor: states.disabled ? "text-disabled" : states.checked ? null : "link",
            padding: padding,
            cursor: "pointer"
          };
        }
      },
      "tabview-page/button/label": {
        alias: "label",
        style: function style(states) {
          return {
            padding: [0, 1, 0, 1]
          };
        }
      },
      "tabview-page/button/icon": "image",
      "tabview-page/button/close-button": {
        alias: "atom",
        style: function style(states) {
          return {
            cursor: states.disabled ? undefined : "pointer",
            icon: qx.theme.simple.Image.URLS["tabview-close"]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        COLOR POPUP
      ---------------------------------------------------------------------------
      */
      "colorpopup": {
        alias: "popup",
        include: "popup",
        style: function style(states) {
          return {
            padding: 5
          };
        }
      },
      "colorpopup/field": {
        style: function style(states) {
          return {
            margin: 2,
            width: 14,
            height: 14,
            backgroundColor: "background",
            decorator: "main-dark"
          };
        }
      },
      "colorpopup/selector-button": "button",
      "colorpopup/auto-button": "button",
      "colorpopup/preview-pane": "groupbox",
      "colorpopup/current-preview": {
        style: function style(state) {
          return {
            height: 20,
            padding: 4,
            marginLeft: 4,
            decorator: "main-dark",
            allowGrowX: true
          };
        }
      },
      "colorpopup/selected-preview": {
        style: function style(state) {
          return {
            height: 20,
            padding: 4,
            marginRight: 4,
            decorator: "main-dark",
            allowGrowX: true
          };
        }
      },
      "colorpopup/colorselector-okbutton": {
        alias: "button",
        include: "button",
        style: function style(states) {
          return {
            icon: "icon/16/actions/dialog-ok.png"
          };
        }
      },
      "colorpopup/colorselector-cancelbutton": {
        alias: "button",
        include: "button",
        style: function style(states) {
          return {
            icon: "icon/16/actions/dialog-cancel.png"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        COLOR SELECTOR
      ---------------------------------------------------------------------------
      */
      "colorselector": "widget",
      "colorselector/control-bar": "widget",
      "colorselector/visual-pane": "groupbox",
      "colorselector/control-pane": "widget",
      "colorselector/preset-grid": "widget",
      "colorselector/colorbucket": {
        style: function style(states) {
          return {
            decorator: "main-dark",
            width: 16,
            height: 16
          };
        }
      },
      "colorselector/preset-field-set": "groupbox",
      "colorselector/input-field-set": {
        include: "groupbox",
        alias: "groupbox",
        style: function style() {
          return {
            paddingTop: 12
          };
        }
      },
      "colorselector/preview-field-set": {
        include: "groupbox",
        alias: "groupbox",
        style: function style() {
          return {
            paddingTop: 12
          };
        }
      },
      "colorselector/hex-field-composite": "widget",
      "colorselector/hex-field": "textfield",
      "colorselector/rgb-spinner-composite": "widget",
      "colorselector/rgb-spinner-red": "spinner",
      "colorselector/rgb-spinner-green": "spinner",
      "colorselector/rgb-spinner-blue": "spinner",
      "colorselector/hsb-spinner-composite": "widget",
      "colorselector/hsb-spinner-hue": "spinner",
      "colorselector/hsb-spinner-saturation": "spinner",
      "colorselector/hsb-spinner-brightness": "spinner",
      "colorselector/preview-content-old": {
        style: function style(states) {
          return {
            decorator: "main-dark",
            width: 50,
            height: 25
          };
        }
      },
      "colorselector/preview-content-new": {
        style: function style(states) {
          return {
            decorator: "main-dark",
            backgroundColor: "white",
            width: 50,
            height: 25
          };
        }
      },
      "colorselector/hue-saturation-field": {
        style: function style(states) {
          return {
            decorator: "main-dark",
            margin: 5
          };
        }
      },
      "colorselector/brightness-field": {
        style: function style(states) {
          return {
            decorator: "main-dark",
            margin: [5, 7]
          };
        }
      },
      "colorselector/hue-saturation-pane": "widget",
      "colorselector/hue-saturation-handle": "widget",
      "colorselector/brightness-pane": "widget",
      "colorselector/brightness-handle": "widget",

      /*
      ---------------------------------------------------------------------------
        APPLICATION
      ---------------------------------------------------------------------------
      */
      "app-header": {
        style: function style(states) {
          return {
            font: "headline",
            textColor: "text-selected",
            backgroundColor: "background-selected-dark",
            padding: [8, 12]
          };
        }
      },
      "app-header-label": {
        style: function style(states) {
          return {
            paddingTop: 5
          };
        }
      },
      "app-splitpane": {
        alias: "splitpane",
        style: function style(states) {
          return {
            padding: [0, 10, 10, 10],
            backgroundColor: "light-background"
          };
        }
      }
    }
  });
  qx.theme.simple.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.simple.Appearance": {
        "require": true
      },
      "qx.theme.simple.Image": {}
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
     * Martin Wittemann (martinwittemann)
  
  ************************************************************************* */

  /* ************************************************************************
  
  
  ************************************************************************* */

  /**
   * The simple qooxdoo appearance theme.
   *
   * @asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)
   * @asset(qx/icon/${qx.icontheme}/16/places/folder-open.png)
   * @asset(qx/icon/${qx.icontheme}/16/places/folder.png)
   * @asset(qx/icon/${qx.icontheme}/16/mimetypes/text-plain.png)
   * @asset(qx/icon/${qx.icontheme}/16/actions/view-refresh.png)
   * @asset(qx/icon/${qx.icontheme}/16/actions/window-close.png)
   * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)
   * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
   */
  qx.Theme.define("qx.theme.indigo.Appearance", {
    extend: qx.theme.simple.Appearance,
    appearances: {
      "colorselector/input-field-set": {
        include: "groupbox",
        alias: "groupbox",
        style: function style() {
          return {
            paddingTop: 0
          };
        }
      },
      "colorselector/preview-field-set": {
        include: "groupbox",
        alias: "groupbox",
        style: function style() {
          return {
            paddingTop: 0
          };
        }
      },
      "toolbar": {
        style: function style(states) {
          return {
            backgroundColor: "light-background",
            padding: [4, 0]
          };
        }
      },
      "splitpane/splitter/knob": {
        style: function style(states) {
          return {
            source: qx.theme.simple.Image.URLS["knob-" + (states.horizontal ? "horizontal" : "vertical")],
            padding: 3
          };
        }
      },
      "window": {
        style: function style(states) {
          return {
            contentPadding: [10, 10, 10, 10],
            backgroundColor: states.maximized ? "background" : undefined,
            decorator: states.maximized ? undefined : states.active ? "window-active" : "window"
          };
        }
      },
      "window/captionbar": {
        style: function style(states) {
          var active = states.active && !states.disabled;
          return {
            padding: [3, 8, active ? 1 : 3, 8],
            textColor: active ? "highlight" : "font",
            decorator: active ? "window-caption-active" : "window-caption"
          };
        }
      },
      "window/title": {
        style: function style(states) {
          return {
            cursor: "default",
            font: "default",
            marginRight: 20,
            alignY: "middle"
          };
        }
      },
      "virtual-tree": {
        include: "tree",
        alias: "tree",
        style: function style(states) {
          return {
            itemHeight: 27
          };
        }
      },
      "app-header": {
        style: function style(states) {
          return {
            font: "headline",
            textColor: "text-selected",
            decorator: "app-header",
            padding: 10
          };
        }
      },
      "app-header-label": {
        style: function style(states) {
          return {
            paddingTop: 5
          };
        }
      },
      "app-splitpane": {
        alias: "splitpane",
        style: function style(states) {
          return {
            padding: [0, 10, 10, 10],
            backgroundColor: "light-background"
          };
        }
      }
    }
  });
  qx.theme.indigo.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-67.js.map
