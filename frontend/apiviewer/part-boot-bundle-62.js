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
      "qx.ui.table.cellrenderer.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.bom.Stylesheet": {
        "construct": true
      },
      "qx.util.ResourceManager": {},
      "qx.io.ImageLoader": {},
      "qx.bom.client.Css": {},
      "qx.bom.element.Decoration": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.inlineblock": {
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
       * Carsten Lergenmueller (carstenl)
  
  ************************************************************************ */

  /**
   * A template class for cell renderer, which display images. Concrete
   * implementations must implement the method {@link #_identifyImage}.
   */
  qx.Class.define("qx.ui.table.cellrenderer.AbstractImage", {
    extend: qx.ui.table.cellrenderer.Abstract,
    type: "abstract",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.table.cellrenderer.Abstract.constructor.call(this);
      var clazz = qx.ui.table.cellrenderer.AbstractImage;

      if (!clazz.stylesheet) {
        clazz.stylesheet = qx.bom.Stylesheet.createElement(".qooxdoo-table-cell-icon {  text-align:center;  padding-top:1px;}");
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Whether to repeat or scale the image.
       *
       * @param repeat {String}
       *   One of
       *     <code>scale</code>,
       *     <code>scale-x</code>,
       *     <code>scale-y</code>,
       *     <code>repeat</code>,
       *     <code>repeat-x</code>,
       *     <code>repeat-y</code>,
       *     <code>no-repeat</code>
      */
      repeat: {
        check: function check(value) {
          var valid = ["scale", "scale-x", "scale-y", "repeat", "repeat-x", "repeat-y", "no-repeat"];
          return valid.includes(value);
        },
        init: "no-repeat"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __defaultWidth: 16,
      __defaultHeight: 16,
      __imageData: null,
      // overridden
      _insetY: 2,

      /**
       * Identifies the Image to show. This is a template method, which must be
       * implemented by sub classes.
       *
       * @abstract
       * @param cellInfo {Map} The information about the cell.
       *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
       * @return {Map} A map having the following attributes:
       *           <ul>
       *           <li>
       *             "url": (type string) must be the URL of the image to show.
       *             The url given must either be managed by the {@link qx.util.ResourceManager}
       *             or pre-loaded with {@link qx.io.ImageLoader}. This is to make sure that
       *             the renderer knows the dimensions and the format of the image.
       *           </li>
       *           <li>"imageWidth": (type int) the width of the image in pixels.</li>
       *           <li>"imageHeight": (type int) the height of the image in pixels.</li>
       *           <li>"tooltip": (type string) must be the image tooltip text.</li>
       *           </ul>
       * @throws {Error} the abstract function warning.
       */
      _identifyImage: function _identifyImage(cellInfo) {
        throw new Error("_identifyImage is abstract");
      },

      /**
       * Retrieves the image infos.
       *
       * @param cellInfo {Map} The information about the cell.
       *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
       * @return {Map} Map with an "url" attribute (type string)
       *                 holding the URL of the image to show
       *                 and a "tooltip" attribute
       *                 (type string) being the tooltip text (or null if none was specified)
       */
      _getImageInfos: function _getImageInfos(cellInfo) {
        // Query the subclass about image and tooltip
        var imageData = this._identifyImage(cellInfo); // If subclass refuses to give map, construct it with required properties
        // If no map is given, but instead a string, assume that this string is
        // the URL of the image [BUG #4289]


        if (imageData == null || typeof imageData == "string") {
          imageData = {
            url: imageData,
            tooltip: null
          };
        } // If sizes are not included in map given by subclass,
        // fall-back to calculated image size


        if (!imageData.imageWidth || !imageData.imageHeight) {
          var sizes = this.__getImageSize(imageData.url);

          imageData.imageWidth = sizes.width;
          imageData.imageHeight = sizes.height;
        } // Add width and height keys to map [BUG #4289]
        // - [width|height] is read by _getContentHtml()
        // - [imageWidth|imageHeight] is possibly read in legacy applications


        imageData.width = imageData.imageWidth;
        imageData.height = imageData.imageHeight;
        return imageData;
      },

      /**
       * Compute the size of the given image
       *
       * @param source {String} the image URL
       * @return {Map} A map containing the image's <code>width</code> and
       *    <code>height</code>
       */
      __getImageSize: function __getImageSize(source) {
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var ImageLoader = qx.io.ImageLoader;
        var width, height; // Detect if the image registry knows this image

        if (ResourceManager.has(source)) {
          width = ResourceManager.getImageWidth(source);
          height = ResourceManager.getImageHeight(source);
        } else if (ImageLoader.isLoaded(source)) {
          width = ImageLoader.getWidth(source);
          height = ImageLoader.getHeight(source);
        } else {
          width = this.__defaultWidth;
          height = this.__defaultHeight;
        }

        return {
          width: width,
          height: height
        };
      },
      // overridden
      createDataCellHtml: function createDataCellHtml(cellInfo, htmlArr) {
        this.__imageData = this._getImageInfos(cellInfo);
        return qx.ui.table.cellrenderer.AbstractImage.prototype.createDataCellHtml.base.call(this, cellInfo, htmlArr);
      },
      // overridden
      _getCellClass: function _getCellClass(cellInfo) {
        return qx.ui.table.cellrenderer.AbstractImage.prototype._getCellClass.base.call(this) + " qooxdoo-table-cell-icon";
      },
      // overridden
      _getContentHtml: function _getContentHtml(cellInfo) {
        var content = "<div></div>"; // set image

        if (this.__imageData.url) {
          var srcUrl = this.__imageData.url;
          var highResolutionSource = qx.util.ResourceManager.getInstance().findHighResolutionSource(this.__imageData.url);

          if (highResolutionSource) {
            srcUrl = highResolutionSource;
          }

          var style = {
            width: this.__imageData.width + "px",
            height: this.__imageData.height + "px",
            display: qx.core.Environment.get("css.inlineblock"),
            verticalAlign: "top",
            position: "static"
          };

          if (qx.util.ResourceManager.getInstance().getCombinedFormat(this.__imageData.url) === "") {
            // background size is critical for high-resolution images but breaks combined images
            style["background-size"] = this.__imageData.width + "px " + this.__imageData.height + "px";
          }

          content = qx.bom.element.Decoration.create(srcUrl, this.getRepeat(), style);
        }

        return content;
      },
      // overridden
      _getCellAttributes: function _getCellAttributes(cellInfo) {
        var tooltip = this.__imageData.tooltip;

        if (tooltip) {
          return "title='" + tooltip + "'";
        } else {
          return "";
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__imageData = null;
    }
  });
  qx.ui.table.cellrenderer.AbstractImage.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.cellrenderer.AbstractImage": {
        "construct": true,
        "require": true
      },
      "qx.util.AliasManager": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007 by Tartan Solutions, Inc, http://www.tartansolutions.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Dan Hummon
  
  ************************************************************************ */

  /**
   * The image cell renderer renders image into table cells.
   */
  qx.Class.define("qx.ui.table.cellrenderer.Image", {
    extend: qx.ui.table.cellrenderer.AbstractImage,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param height {Integer?16} The height of the image. The default is 16.
     * @param width {Integer?16} The width of the image. The default is 16.
     */
    construct: function construct(width, height) {
      qx.ui.table.cellrenderer.AbstractImage.constructor.call(this);

      if (width) {
        this.__imageWidth = width;
      }

      if (height) {
        this.__imageHeight = height;
      }

      this.__am = qx.util.AliasManager.getInstance();
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __am: null,
      __imageHeight: 16,
      __imageWidth: 16,
      // overridden
      _identifyImage: function _identifyImage(cellInfo) {
        var imageHints = {
          imageWidth: this.__imageWidth,
          imageHeight: this.__imageHeight
        };

        if (cellInfo.value == "") {
          imageHints.url = null;
        } else {
          imageHints.url = this.__am.resolve(cellInfo.value);
        }

        imageHints.tooltip = cellInfo.tooltip;
        return imageHints;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__am = null;
    }
  });
  qx.ui.table.cellrenderer.Image.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.io.remote.RequestQueue": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
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
   * This class is used to send HTTP requests to the server.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * Note: This class will be deprecated in a future release. Instead,
   * please use classes found in {@link qx.io.request}.
   */
  qx.Class.define("qx.io.remote.Request", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param vUrl {String}
     *   Target url to issue the request to.
     *
     * @param vMethod {String}
     *   Determines http method (GET, POST, PUT, etc.) to use. See "method" property
     *   for valid values and default value.
     *
     * @param vResponseType {String}
     *   The mime type of the response. Default is text/plain.
     */
    construct: function construct(vUrl, vMethod, vResponseType) {
      qx.core.Object.constructor.call(this);
      this.__requestHeaders = {};
      this.__urlParameters = {};
      this.__dataParameters = {};
      this.__formFields = {};

      if (vUrl !== undefined) {
        this.setUrl(vUrl);
      }

      if (vMethod !== undefined) {
        this.setMethod(vMethod);
      }

      if (vResponseType !== undefined) {
        this.setResponseType(vResponseType);
      }

      this.setProhibitCaching(true); // Get the next sequence number for this request

      this.__seqNum = ++qx.io.remote.Request.__seqNum;
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the Request object changes its state to 'created' */
      "created": "qx.event.type.Event",

      /** Fired when the Request object changes its state to 'configured' */
      "configured": "qx.event.type.Event",

      /** Fired when the Request object changes its state to 'sending' */
      "sending": "qx.event.type.Event",

      /** Fired when the Request object changes its state to 'receiving' */
      "receiving": "qx.event.type.Event",

      /**
       * Fired once the request has finished successfully. The event object
       * can be used to read the transferred data.
       */
      "completed": "qx.io.remote.Response",

      /** Fired when the pending request has been aborted. */
      "aborted": "qx.event.type.Event",

      /** Fired when the pending request fails. */
      "failed": "qx.io.remote.Response",

      /** Fired when the pending request times out. */
      "timeout": "qx.io.remote.Response"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /*
      ---------------------------------------------------------------------------
        SEQUENCE NUMBER
      ---------------------------------------------------------------------------
      */

      /**
       * Sequence (id) number of a request, used to associate a response or error
       * with its initiating request.
       */
      __seqNum: 0,

      /**
       * Returns true if the given HTTP method allows a request body being transferred to the server.
       * This is currently POST and PUT. Other methods require their data being encoded into
       * the URL
       *
       * @param httpMethod {String} one of the values of the method property
       * @return {Boolean}
       */
      methodAllowsRequestBody: function methodAllowsRequestBody(httpMethod) {
        return httpMethod == "POST" || httpMethod == "PUT";
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Target url to issue the request to.
       */
      url: {
        check: "String",
        init: ""
      },

      /**
       * Determines what type of request to issue (GET, POST, PUT, HEAD, DELETE).
       */
      method: {
        check: ["GET", "POST", "PUT", "HEAD", "DELETE"],
        apply: "_applyMethod",
        init: "GET"
      },

      /**
       * Set the request to asynchronous.
       */
      asynchronous: {
        check: "Boolean",
        init: true
      },

      /**
       * Set the data to be sent via this request
       */
      data: {
        check: "String",
        nullable: true
      },

      /**
       * Username to use for HTTP authentication.
       * Set to NULL if HTTP authentication is not used.
       */
      username: {
        check: "String",
        nullable: true
      },

      /**
       * Password to use for HTTP authentication.
       * Set to NULL if HTTP authentication is not used.
       */
      password: {
        check: "String",
        nullable: true
      },

      /**
       * The state that the request is in, while being processed.
       */
      state: {
        check: ["configured", "queued", "sending", "receiving", "completed", "aborted", "timeout", "failed"],
        init: "configured",
        apply: "_applyState",
        event: "changeState"
      },

      /**
       * Response type of request.
       *
       * The response type is a MIME type, default is text/plain. Other supported
       * MIME types are text/javascript, text/html, application/json,
       * application/xml.
       */
      responseType: {
        check: ["text/plain", "text/javascript", "application/json", "application/xml", "text/html"],
        init: "text/plain",
        apply: "_applyResponseType"
      },

      /**
       * Number of milliseconds before the request is being timed out.
       *
       * If this property is null, the timeout for the request comes is the
       * qx.io.remote.RequestQueue's property defaultTimeout.
       */
      timeout: {
        check: "Integer",
        nullable: true
      },

      /**
       * Prohibit request from being cached.
       *
       * Setting the value to <i>true</i> adds a parameter "nocache" to the
       * request URL with a value of the current time, as well as adding request
       * headers Pragma:no-cache and Cache-Control:no-cache.
       *
       * Setting the value to <i>false</i> removes the parameter and request
       * headers.
       *
       * As a special case, this property may be set to the string value
       * "no-url-params-on-post" which will prevent the nocache parameter from
       * being added to the URL if the POST method is used but will still add
       * the Pragma and Cache-Control headers.  This is useful if your backend
       * does nasty things like mixing parameters specified in the URL into
       * form fields in the POST request.  (One example of this nasty behavior
       * is known as "mixed mode" in Oracle, as described here:
       * http://docs.oracle.com/cd/B32110_01/web.1013/b28963/concept.htm#i1005684)
       */
      prohibitCaching: {
        check: function check(v) {
          return typeof v == "boolean" || v === "no-url-params-on-post";
        },
        init: true,
        apply: "_applyProhibitCaching"
      },

      /**
       * Indicate that the request is cross domain.
       *
       * A request is cross domain if the request's URL points to a host other than
       * the local host. This switches the concrete implementation that is used for
       * sending the request from qx.io.remote.transport.XmlHttp to
       * qx.io.remote.transport.Script, because only the latter can handle cross
       * domain requests.
       */
      crossDomain: {
        check: "Boolean",
        init: false
      },

      /**
       * Indicate that the request will be used for a file upload.
       *
       * The request will be used for a file upload.  This switches the concrete
       * implementation that is used for sending the request from
       * qx.io.remote.transport.XmlHttp to qx.io.remote.IFrameTransport, because only
       * the latter can handle file uploads.
       */
      fileUpload: {
        check: "Boolean",
        init: false
      },

      /**
       * The transport instance used for the request.
       *
       * This is necessary to be able to abort an asynchronous request.
       */
      transport: {
        check: "qx.io.remote.Exchange",
        nullable: true
      },

      /**
       * Use Basic HTTP Authentication.
       */
      useBasicHttpAuth: {
        check: "Boolean",
        init: false
      },

      /**
       * If true and the responseType property is set to "application/json", getContent() will
       * return a Javascript map containing the JSON contents, i. e. the result qx.lang.Json.parse().
       * If false, the raw string data will be returned and the parsing must be done manually.
       * This is useful for special JSON dialects / extensions which are not supported by
       * qx.lang.Json.
       *
       * Note that this is currently only respected by qx.io.remote.transport.XmlHttp, i. e.
       * if the transport used is the one using XMLHttpRequests. The other transports
       * do not support JSON parsing, so this property has no effect.
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
      __requestHeaders: null,
      __urlParameters: null,
      __dataParameters: null,
      __formFields: null,
      __seqNum: null,

      /*
      ---------------------------------------------------------------------------
        CORE METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Schedule this request for transport to server.
       *
       * The request is added to the singleton class qx.io.remote.RequestQueue's
       * list of pending requests.
       *
       */
      send: function send() {
        qx.io.remote.RequestQueue.getInstance().add(this);
      },

      /**
       * Abort sending this request.
       *
       * The request is removed from the singleton class qx.io.remote.RequestQueue's
       * list of pending events. If the request haven't been scheduled this
       * method is a noop.
       *
       */
      abort: function abort() {
        qx.io.remote.RequestQueue.getInstance().abort(this);
      },

      /**
       * Abort sending this request if it has not already been aborted.
       *
       */
      reset: function reset() {
        switch (this.getState()) {
          case "sending":
          case "receiving":
            this.error("Aborting already sent request!");
          // no break

          case "queued":
            this.abort();
            break;
        }
      },

      /*
      ---------------------------------------------------------------------------
        STATE ALIASES
      ---------------------------------------------------------------------------
      */

      /**
       * Determine if this request is in the configured state.
       *
       * @return {Boolean} <true> if the request is in the configured state; <false> otherwise.
       */
      isConfigured: function isConfigured() {
        return this.getState() === "configured";
      },

      /**
       * Determine if this request is in the queued state.
       *
       * @return {Boolean} <true> if the request is in the queued state; <false> otherwise.
       */
      isQueued: function isQueued() {
        return this.getState() === "queued";
      },

      /**
       * Determine if this request is in the sending state.
       *
       * @return {Boolean} <true> if the request is in the sending state; <false> otherwise.
       */
      isSending: function isSending() {
        return this.getState() === "sending";
      },

      /**
       * Determine if this request is in the receiving state.
       *
       * @return {Boolean} <true> if the request is in the receiving state; <false> otherwise.
       */
      isReceiving: function isReceiving() {
        return this.getState() === "receiving";
      },

      /**
       * Determine if this request is in the completed state.
       *
       * @return {Boolean} <true> if the request is in the completed state; <false> otherwise.
       */
      isCompleted: function isCompleted() {
        return this.getState() === "completed";
      },

      /**
       * Determine if this request is in the aborted state.
       *
       * @return {Boolean} <true> if the request is in the aborted state; <false> otherwise.
       */
      isAborted: function isAborted() {
        return this.getState() === "aborted";
      },

      /**
       * Determine if this request is in the timeout state.
       *
       * @return {Boolean} <true> if the request is in the timeout state; <false> otherwise.
       */
      isTimeout: function isTimeout() {
        return this.getState() === "timeout";
      },

      /**
       * Determine if this request is in the failed state.
       *
       * @return {Boolean} <true> if the request is in the failed state; <false> otherwise.
       */
      isFailed: function isFailed() {
        return this.getState() === "failed";
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Dispatches a clone of the given event on this instance
       *
       * @param e {qx.event.type.Event} The original event
       */
      __forwardEvent: qx.event.GlobalError.observeMethod(function (e) {
        var clonedEvent = e.clone();
        clonedEvent.setTarget(this);
        this.dispatchEvent(clonedEvent);
      }),

      /**
       * Event handler called when the request enters the queued state.
       *
       * @param e {qx.event.type.Event} Event indicating state change
       */
      _onqueued: function _onqueued(e) {
        // Modify internal state
        this.setState("queued"); // Bubbling up

        this.__forwardEvent(e);
      },

      /**
       * Event handler called when the request enters the sending state.
       *
       * @param e {qx.event.type.Event} Event indicating state change
       */
      _onsending: function _onsending(e) {
        // Modify internal state
        this.setState("sending"); // Bubbling up

        this.__forwardEvent(e);
      },

      /**
       * Event handler called when the request enters the receiving state.
       *
       * @param e {qx.event.type.Event} Event indicating state change
       */
      _onreceiving: function _onreceiving(e) {
        // Modify internal state
        this.setState("receiving"); // Bubbling up

        this.__forwardEvent(e);
      },

      /**
       * Event handler called when the request enters the completed state.
       *
       * @param e {qx.event.type.Event} Event indicating state change
       */
      _oncompleted: function _oncompleted(e) {
        // Modify internal state
        this.setState("completed"); // Bubbling up

        this.__forwardEvent(e); // Automatically dispose after event completion


        this.dispose();
      },

      /**
       * Event handler called when the request enters the aborted state.
       *
       * @param e {qx.event.type.Event} Event indicating state change
       */
      _onaborted: function _onaborted(e) {
        // Modify internal state
        this.setState("aborted"); // Bubbling up

        this.__forwardEvent(e); // Automatically dispose after event completion


        this.dispose();
      },

      /**
       * Event handler called when the request enters the timeout state.
       *
       * @param e {qx.event.type.Event} Event indicating state change
       */
      _ontimeout: function _ontimeout(e) {
        /*
          // User's handler can block until timeout.
          switch(this.getState())
          {
            // If we're no longer running...
            case "completed":
            case "timeout":
            case "aborted":
            case "failed":
              // then don't bubble up the timeout event
              return;
          }
        */
        // Modify internal state
        this.setState("timeout"); // Bubbling up

        this.__forwardEvent(e); // Automatically dispose after event completion


        this.dispose();
      },

      /**
       * Event handler called when the request enters the failed state.
       *
       * @param e {qx.event.type.Event} Event indicating state change
       */
      _onfailed: function _onfailed(e) {
        // Modify internal state
        this.setState("failed"); // Bubbling up

        this.__forwardEvent(e); // Automatically dispose after event completion


        this.dispose();
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyState: function _applyState(value, old) {
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.debug("State: " + value);
          }
        }
      },
      // property apply
      _applyProhibitCaching: function _applyProhibitCaching(value, old) {
        if (!value) {
          this.removeParameter("nocache");
          this.removeRequestHeader("Pragma");
          this.removeRequestHeader("Cache-Control");
          return;
        } // If value isn't "no-url-params-on-post" or this isn't a POST request


        if (value !== "no-url-params-on-post" || this.getMethod() != "POST") {
          // ... then add a parameter to the URL to make it unique on each
          // request.  The actual id, "nocache" is irrelevant; it's the fact
          // that a (usually) different date is added to the URL on each request
          // that prevents caching.
          this.setParameter("nocache", new Date().valueOf());
        } else {
          // Otherwise, we don't want the nocache parameter in the URL.
          this.removeParameter("nocache");
        } // Add the HTTP 1.0 request to avoid use of a cache


        this.setRequestHeader("Pragma", "no-cache"); // Add the HTTP 1.1 request to avoid use of a cache

        this.setRequestHeader("Cache-Control", "no-cache");
      },
      // property apply
      _applyMethod: function _applyMethod(value, old) {
        if (qx.io.remote.Request.methodAllowsRequestBody(value)) {
          this.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        } else {
          this.removeRequestHeader("Content-Type");
        } // Re-test the prohibit caching property.  We may need to add or remove
        // the "nocache" parameter.  We explicitly call the _apply method since
        // it wouldn't be called normally when setting the value to its already
        // existant value.


        var prohibitCaching = this.getProhibitCaching();

        this._applyProhibitCaching(prohibitCaching, prohibitCaching);
      },
      // property apply
      _applyResponseType: function _applyResponseType(value, old) {
        this.setRequestHeader("X-Qooxdoo-Response-Type", value);
      },

      /*
      ---------------------------------------------------------------------------
        REQUEST HEADER
      ---------------------------------------------------------------------------
      */

      /**
       * Add a request header to the request.
       *
       * Example: request.setRequestHeader("Content-Type", "text/html")
       *
       * Please note: Some browsers, such as Safari 3 and 4, will capitalize
       * header field names. This is in accordance with RFC 2616[1], which states
       * that HTTP 1.1 header names are case-insensitive, so your server backend
       * should be case-agnostic when dealing with request headers.
       *
       * [1]<a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2">RFC 2616: HTTP Message Headers</a>
       *
       * @param vId {String} The identifier to use for this added header
       * @param vValue {String} The value to use for this added header
       */
      setRequestHeader: function setRequestHeader(vId, vValue) {
        this.__requestHeaders[vId] = vValue;
      },

      /**
       * Remove a previously-added request header
       *
       * @param vId {String} The id of the header to be removed
       */
      removeRequestHeader: function removeRequestHeader(vId) {
        delete this.__requestHeaders[vId];
      },

      /**
       * Retrieve the value of a header which was previously set
       *
       * @param vId {String} The id of the header value being requested
       * @return {String} The value of the header with the specified id
       */
      getRequestHeader: function getRequestHeader(vId) {
        return this.__requestHeaders[vId] || null;
      },

      /**
       * Return the object containing all of the headers which have been added.
       *
       * @return {Object} The returned object has as its property names each of the ids of headers
       *     which have been added, and as each property value, the value of the
       *     property corresponding to that id.
       */
      getRequestHeaders: function getRequestHeaders() {
        return this.__requestHeaders;
      },

      /*
      ---------------------------------------------------------------------------
        PARAMETERS
      ---------------------------------------------------------------------------
      */

      /**
       * Add a parameter to the request.
       *
       * @param vId {String}
       *   String identifier of the parameter to add.
       *
       * @param vValue {var}
       *   Value of parameter. May be a string (for one parameter) or an array
       *   of strings (for setting multiple parameter values with the same
       *   parameter name).
       *
       * @param bAsData {Boolean}
       *   If <i>false</i>, add the parameter to the URL.  If <i>true</i> then
       *   instead the parameters added by calls to this method will be combined
       *   into a string added as the request data, as if the entire set of
       *   parameters had been pre-build and passed to setData().
       *
       * Note: Parameters requested to be sent as data will be silently dropped
       *       if data is manually added via a call to setData().
       *
       * Note: Some transports, e.g. Script, do not support passing parameters
       *       as data.
       *
       */
      setParameter: function setParameter(vId, vValue, bAsData) {
        if (bAsData) {
          this.__dataParameters[vId] = vValue;
        } else {
          this.__urlParameters[vId] = vValue;
        }
      },

      /**
       * Remove a parameter from the request.
       *
       * @param vId {String}
       *   Identifier of the parameter to remove.
       *
       * @param bFromData {Boolean}
       *   If <i>false</i> then remove the parameter of the URL parameter list.
       *   If <i>true</i> then remove it from the list of parameters to be sent
       *   as request data.
       *
       */
      removeParameter: function removeParameter(vId, bFromData) {
        if (bFromData) {
          delete this.__dataParameters[vId];
        } else {
          delete this.__urlParameters[vId];
        }
      },

      /**
       * Get a parameter in the request.
       *
       * @param vId {String}
       *   Identifier of the parameter to get.
       *
       * @param bFromData {Boolean}
       *   If <i>false</i> then retrieve the parameter from the URL parameter
       *   list. If <i>true</i> then retrieve it from the list of parameters to
       *   be sent as request data.
       *
       * @return {var}
       *   The requested parameter value
       *
       */
      getParameter: function getParameter(vId, bFromData) {
        if (bFromData) {
          return this.__dataParameters[vId] || null;
        } else {
          return this.__urlParameters[vId] || null;
        }
      },

      /**
       * Returns the object containing all parameters for the request.
       *
       * @param bFromData {Boolean}
       *   If <i>false</i> then retrieve the URL parameter list.
       *   If <i>true</i> then retrieve the data parameter list.
       *
       * @return {Object}
       *   The returned object has as its property names each of the ids of
       *   parameters which have been added, and as each property value, the
       *   value of the property corresponding to that id.
       */
      getParameters: function getParameters(bFromData) {
        return bFromData ? this.__dataParameters : this.__urlParameters;
      },

      /*
      ---------------------------------------------------------------------------
        FORM FIELDS
      ---------------------------------------------------------------------------
      */

      /**
       * Add a form field to the POST request.
       *
       * NOTE: Adding any programmatic form fields using this method will switch the
       *       Transport implementation to IframeTransport.
       *
       * NOTE: Use of these programmatic form fields disallow use of synchronous
       *       requests and cross-domain requests.  Be sure that you do not need
       *       those features when setting these programmatic form fields.
       *
       * @param vId {String} String identifier of the form field to add.
       * @param vValue {String} Value of form field
       */
      setFormField: function setFormField(vId, vValue) {
        this.__formFields[vId] = vValue;
      },

      /**
       * Remove a form field from the POST request.
       *
       * @param vId {String} Identifier of the form field to remove.
       */
      removeFormField: function removeFormField(vId) {
        delete this.__formFields[vId];
      },

      /**
       * Get a form field in the POST request.
       *
       * @param vId {String} Identifier of the form field to get.
       * @return {String|null} Value of form field or <code>null</code> if no value
       *    exists for the passed identifier.
       */
      getFormField: function getFormField(vId) {
        return this.__formFields[vId] || null;
      },

      /**
       * Returns the object containing all form fields for the POST request.
       *
       * @return {Object} The returned object has as its property names each of the ids of
       *     form fields which have been added, and as each property value, the value
       *     of the property corresponding to that id.
       */
      getFormFields: function getFormFields() {
        return this.__formFields;
      },

      /**
       * Obtain the sequence (id) number used for this request
       *
       * @return {Integer} The sequence number of this request
       */
      getSequenceNumber: function getSequenceNumber() {
        return this.__seqNum;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.setTransport(null);
      this.__requestHeaders = this.__urlParameters = this.__dataParameters = this.__formFields = null;
    }
  });
  qx.io.remote.Request.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-62.js.map
