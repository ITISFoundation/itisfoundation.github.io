(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.Uri": {}
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
       * Richard Sternagel (rsternagel)
  
  ************************************************************************ */

  /**
   * Static helpers for handling HTTP requests.
   */
  qx.Bootstrap.define("qx.util.Request", {
    statics: {
      /**
       * Whether URL given points to resource that is cross-domain,
       * i.e. not of same origin.
       *
       * @param url {String} URL.
       * @return {Boolean} Whether URL is cross domain.
       */
      isCrossDomain: function isCrossDomain(url) {
        var result = qx.util.Uri.parseUri(url),
            location = window.location;

        if (!location) {
          return false;
        }

        var protocol = location.protocol; // URL is relative in the sense that it points to origin host

        if (!(url.indexOf("//") !== -1)) {
          return false;
        }

        if (protocol.substr(0, protocol.length - 1) == result.protocol && location.host === result.authority && location.port === result.port) {
          return false;
        }

        return true;
      },

      /**
       * Determine if given HTTP status is considered successful.
       *
       * @param status {Number} HTTP status.
       * @return {Boolean} Whether status is considered successful.
       */
      isSuccessful: function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
      },

      /**
       * Determine if given HTTP method is valid.
       *
       * @param method {String} HTTP method.
       * @return {Boolean} Whether method is a valid HTTP method.
       */
      isMethod: function isMethod(method) {
        var knownMethods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE", "CONNECT", "PATCH"];
        return knownMethods.indexOf(method) !== -1 ? true : false;
      },

      /**
       * Request body is ignored for HTTP method GET and HEAD.
       *
       * See http://www.w3.org/TR/XMLHttpRequest2/#the-send-method.
       *
       * @param method {String} The HTTP method.
       * @return {Boolean} Whether request may contain body.
       */
      methodAllowsRequestBody: function methodAllowsRequestBody(method) {
        return !/^(GET|HEAD)$/.test(method);
      }
    }
  });
  qx.util.Request.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.PropertyUtil": {},
      "qx.lang.String": {},
      "qx.lang.Type": {},
      "qx.core.Object": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ***********************************************************************
  
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
   * This is an util class responsible for serializing qooxdoo objects.
   *
   * @ignore(qx.data, qx.data.IListData)
   * @ignore(qx.locale, qx.locale.LocalizedString)
   */
  qx.Class.define("qx.util.Serializer", {
    statics: {
      /**
       * Serializes the properties of the given qooxdoo object. To get the
       * serialization working, every property needs to have a string
       * representation because the value of the property will be concatenated to the
       * serialized string.
       *
       * @param object {qx.core.Object} Any qooxdoo object
       * @param qxSerializer {Function?} Function used for serializing qooxdoo
       *   objects stored in the properties of the object. Check for the type of
       *   classes <ou want to serialize and return the serialized value. In all
       *   other cases, just return nothing.
       * @param dateFormat {qx.util.format.DateFormat?} If a date formater is given,
       *   the format method of this given formater is used to convert date
       *   objects into strings.
       * @return {String} The serialized object.
       */
      toUriParameter: function toUriParameter(object, qxSerializer, dateFormat) {
        var result = "";
        var properties = qx.util.PropertyUtil.getAllProperties(object.constructor);

        for (var name in properties) {
          // ignore property groups
          if (properties[name].group != undefined) {
            continue;
          }

          var value = object["get" + qx.lang.String.firstUp(name)](); // handle arrays

          if (qx.lang.Type.isArray(value)) {
            var isdataArray = qx.data && qx.data.IListData && qx.Class.hasInterface(value && value.constructor, qx.data.IListData);

            for (var i = 0; i < value.length; i++) {
              var valueAtI = isdataArray ? value.getItem(i) : value[i];
              result += this.__toUriParameter(name, valueAtI, qxSerializer);
            }
          } else if (qx.lang.Type.isDate(value) && dateFormat != null) {
            result += this.__toUriParameter(name, dateFormat.format(value), qxSerializer);
          } else {
            result += this.__toUriParameter(name, value, qxSerializer);
          }
        }

        return result.substring(0, result.length - 1);
      },

      /**
       * Helper method for {@link #toUriParameter}. Check for qooxdoo objects
       * and returns the serialized name value pair for the given parameter.
       *
       * @param name {String} The name of the value
       * @param value {var} The value itself
       * @param qxSerializer {Function?} The serializer for qooxdoo objects.
       * @return {String} The serialized name value pair.
       */
      __toUriParameter: function __toUriParameter(name, value, qxSerializer) {
        if (value && value.$$type == "Class") {
          value = value.classname;
        }

        if (value && (value.$$type == "Interface" || value.$$type == "Mixin")) {
          value = value.name;
        }

        if (value instanceof qx.core.Object && qxSerializer != null) {
          var encValue = encodeURIComponent(qxSerializer(value));

          if (encValue === undefined) {
            var encValue = encodeURIComponent(value);
          }
        } else {
          var encValue = encodeURIComponent(value);
        }

        return encodeURIComponent(name) + "=" + encValue + "&";
      },

      /**
       * Serializes the properties of the given qooxdoo object into a native
       * object.
       *
       * @param object {qx.core.Object}
       *   Any qooxdoo object
       *
       * @param qxSerializer {Function?}
       *   Function used for serializing qooxdoo objects stored in the properties
       *   of the object. Check for the type of classes you want to serialize
       *   and return the serialized value. In all other cases, just return
       *   nothing.
       * @param dateFormat {qx.util.format.DateFormat?} If a date formater is given,
       *   the format method of this given formater is used to convert date
       *   objects into strings.
       * @return {null|Array|String|Object}
       *   The serialized object. Depending on the input qooxdoo object, the returning
       *   type will vary.
       */
      toNativeObject: function toNativeObject(object, qxSerializer, dateFormat) {
        var result; // null or undefined

        if (object == null) {
          return null;
        } // data array


        if (qx.data && qx.data.IListData && qx.Class.hasInterface(object.constructor, qx.data.IListData)) {
          result = [];

          for (var i = 0; i < object.getLength(); i++) {
            result.push(qx.util.Serializer.toNativeObject(object.getItem(i), qxSerializer, dateFormat));
          }

          return result;
        } // other arrays


        if (qx.lang.Type.isArray(object)) {
          result = [];

          for (var i = 0; i < object.length; i++) {
            result.push(qx.util.Serializer.toNativeObject(object[i], qxSerializer, dateFormat));
          }

          return result;
        } // return names for qooxdoo classes


        if (object.$$type == "Class") {
          return object.classname;
        } // return names for qooxdoo interfaces and mixins


        if (object.$$type == "Interface" || object.$$type == "Mixin") {
          return object.name;
        } // qooxdoo object


        if (object instanceof qx.core.Object) {
          if (qxSerializer != null) {
            var returnValue = qxSerializer(object); // if we have something returned, return that

            if (returnValue != undefined) {
              return returnValue;
            } // continue otherwise

          }

          result = {};
          var properties = qx.util.PropertyUtil.getAllProperties(object.constructor);

          for (var name in properties) {
            // ignore property groups
            if (properties[name].group != undefined) {
              continue;
            }

            var value = object["get" + qx.lang.String.firstUp(name)]();
            result[name] = qx.util.Serializer.toNativeObject(value, qxSerializer, dateFormat);
          }

          return result;
        } // date objects with date format


        if (qx.lang.Type.isDate(object) && dateFormat != null) {
          return dateFormat.format(object);
        } // localized strings


        if (qx.locale && qx.locale.LocalizedString && object instanceof qx.locale.LocalizedString) {
          return object.toString();
        } // JavaScript objects


        if (qx.lang.Type.isObject(object)) {
          result = {};

          for (var key in object) {
            result[key] = qx.util.Serializer.toNativeObject(object[key], qxSerializer, dateFormat);
          }

          return result;
        } // all other stuff, including String, Date, RegExp


        return object;
      },

      /**
       * Serializes the properties of the given qooxdoo object into a json object.
       *
       * @param object {qx.core.Object} Any qooxdoo object
       * @param qxSerializer {Function?} Function used for serializing qooxdoo
       *   objects stored in the properties of the object. Check for the type of
       *   classes <ou want to serialize and return the serialized value. In all
       *   other cases, just return nothing.
       * @param dateFormat {qx.util.format.DateFormat?} If a date formater is given,
       *   the format method of this given formater is used to convert date
       *   objects into strings.
       * @return {String} The serialized object.
       */
      toJson: function toJson(object, qxSerializer, dateFormat) {
        var result = ""; // null or undefined

        if (object == null) {
          return "null";
        } // data array


        if (qx.data && qx.data.IListData && qx.Class.hasInterface(object.constructor, qx.data.IListData)) {
          result += "[";

          for (var i = 0; i < object.getLength(); i++) {
            result += qx.util.Serializer.toJson(object.getItem(i), qxSerializer, dateFormat) + ",";
          }

          if (result != "[") {
            result = result.substring(0, result.length - 1);
          }

          return result + "]";
        } // other arrays


        if (qx.lang.Type.isArray(object)) {
          result += "[";

          for (var i = 0; i < object.length; i++) {
            result += qx.util.Serializer.toJson(object[i], qxSerializer, dateFormat) + ",";
          }

          if (result != "[") {
            result = result.substring(0, result.length - 1);
          }

          return result + "]";
        } // return names for qooxdoo classes


        if (object.$$type == "Class") {
          return '"' + object.classname + '"';
        } // return names for qooxdoo interfaces and mixins


        if (object.$$type == "Interface" || object.$$type == "Mixin") {
          return '"' + object.name + '"';
        } // qooxdoo object


        if (object instanceof qx.core.Object) {
          if (qxSerializer != null) {
            var returnValue = qxSerializer(object); // if we have something returned, return that

            if (returnValue != undefined) {
              return '"' + returnValue + '"';
            } // continue otherwise

          }

          result += "{";
          var properties = qx.util.PropertyUtil.getAllProperties(object.constructor);

          for (var name in properties) {
            // ignore property groups
            if (properties[name].group != undefined) {
              continue;
            }

            var value = object["get" + qx.lang.String.firstUp(name)]();
            result += '"' + name + '":' + qx.util.Serializer.toJson(value, qxSerializer, dateFormat) + ",";
          }

          if (result != "{") {
            result = result.substring(0, result.length - 1);
          }

          return result + "}";
        } // localized strings


        if (qx.locale && qx.locale.LocalizedString && object instanceof qx.locale.LocalizedString) {
          object = object.toString(); // no return here because we want to have the string checks as well!
        } // date objects with formater


        if (qx.lang.Type.isDate(object) && dateFormat != null) {
          return '"' + dateFormat.format(object) + '"';
        } // javascript objects


        if (qx.lang.Type.isObject(object)) {
          result += "{";

          for (var key in object) {
            result += '"' + key + '":' + qx.util.Serializer.toJson(object[key], qxSerializer, dateFormat) + ",";
          }

          if (result != "{") {
            result = result.substring(0, result.length - 1);
          }

          return result + "}";
        } // strings


        if (qx.lang.Type.isString(object)) {
          // escape
          object = object.replace(/([\\])/g, '\\\\');
          object = object.replace(/(["])/g, '\\"');
          object = object.replace(/([\r])/g, '\\r');
          object = object.replace(/([\f])/g, '\\f');
          object = object.replace(/([\n])/g, '\\n');
          object = object.replace(/([\t])/g, '\\t');
          object = object.replace(/([\b])/g, '\\b');
          return '"' + object + '"';
        } // Date and RegExp


        if (qx.lang.Type.isDate(object) || qx.lang.Type.isRegExp(object)) {
          return '"' + object + '"';
        } // all other stuff


        return object + "";
      }
    }
  });
  qx.util.Serializer.$$dbClassInfo = $$dbClassInfo;
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
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Emitter": {
        "construct": true
      },
      "qx.util.Request": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.bom.client.Transport": {}
    },
    "environment": {
      "provided": ["qx.debug.io"],
      "required": {
        "qx.debug.io": {},
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "io.xhr": {
          "className": "qx.bom.client.Transport"
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * A wrapper of the XMLHttpRequest host object (or equivalent). The interface is
   * similar to <a href="http://www.w3.org/TR/XMLHttpRequest/">XmlHttpRequest</a>.
   *
   * Hides browser inconsistencies and works around bugs found in popular
   * implementations.
   *
   * <div class="desktop">
   * Example:
   *
   * <pre class="javascript">
   *  var req = new qx.bom.request.Xhr();
   *  req.onload = function() {
   *    // Handle data received
   *    req.responseText;
   *  }
   *
   *  req.open("GET", url);
   *  req.send();
   * </pre>
   *
   * Example for binary data:
   *
   * <pre class="javascript">
   *  var req = new qx.bom.request.Xhr();
   *  req.onload = function() {
   *    // Handle data received
   *    var blob = req.response;
   *    img.src = URL.createObjectURL(blob);
   *  }
   *
   *  req.open("GET", url);
   *  req.responseType = "blob";
   *  req.send();
   * </pre>
   
   * </div>
   *
   * @ignore(XDomainRequest)
   * @ignore(qx.event, qx.event.GlobalError.*)
   *
   * @require(qx.bom.request.Xhr#open)
   * @require(qx.bom.request.Xhr#send)
   * @require(qx.bom.request.Xhr#on)
   * @require(qx.bom.request.Xhr#onreadystatechange)
   * @require(qx.bom.request.Xhr#onload)
   * @require(qx.bom.request.Xhr#onloadend)
   * @require(qx.bom.request.Xhr#onerror)
   * @require(qx.bom.request.Xhr#onabort)
   * @require(qx.bom.request.Xhr#ontimeout)
   * @require(qx.bom.request.Xhr#setRequestHeader)
   * @require(qx.bom.request.Xhr#getAllResponseHeaders)
   * @require(qx.bom.request.Xhr#getRequest)
   * @require(qx.bom.request.Xhr#overrideMimeType)
   * @require(qx.bom.request.Xhr#dispose)
   * @require(qx.bom.request.Xhr#isDisposed)
   *
   * @group (IO)
   */
  qx.Bootstrap.define("qx.bom.request.Xhr", {
    extend: Object,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      var boundFunc = qx.Bootstrap.bind(this.__onNativeReadyStateChange, this); // GlobalError shouldn't be included in qx.Website builds so use it
      // if it's available but otherwise ignore it (see ignore stated above).

      if (qx.event && qx.event.GlobalError && qx.event.GlobalError.observeMethod) {
        this.__onNativeReadyStateChangeBound = qx.event.GlobalError.observeMethod(boundFunc);
      } else {
        this.__onNativeReadyStateChangeBound = boundFunc;
      }

      this.__onNativeAbortBound = qx.Bootstrap.bind(this.__onNativeAbort, this);
      this.__onNativeProgressBound = qx.Bootstrap.bind(this.__onNativeProgress, this);
      this.__onTimeoutBound = qx.Bootstrap.bind(this.__onTimeout, this);

      this.__initNativeXhr();

      this._emitter = new qx.event.Emitter(); // BUGFIX: IE
      // IE keeps connections alive unless aborted on unload

      if (window.attachEvent) {
        this.__onUnloadBound = qx.Bootstrap.bind(this.__onUnload, this);
        window.attachEvent("onunload", this.__onUnloadBound);
      }
    },
    statics: {
      UNSENT: 0,
      OPENED: 1,
      HEADERS_RECEIVED: 2,
      LOADING: 3,
      DONE: 4
    },
    events: {
      /** Fired at ready state changes. */
      "readystatechange": "qx.bom.request.Xhr",

      /** Fired on error. */
      "error": "qx.bom.request.Xhr",

      /** Fired at loadend. */
      "loadend": "qx.bom.request.Xhr",

      /** Fired on timeouts. */
      "timeout": "qx.bom.request.Xhr",

      /** Fired when the request is aborted. */
      "abort": "qx.bom.request.Xhr",

      /** Fired on successful retrieval. */
      "load": "qx.bom.request.Xhr",

      /** Fired on progress. */
      "progress": "qx.bom.request.Xhr"
    },
    members: {
      /*
      ---------------------------------------------------------------------------
        PUBLIC
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Number} Ready state.
       *
       * States can be:
       * UNSENT:           0,
       * OPENED:           1,
       * HEADERS_RECEIVED: 2,
       * LOADING:          3,
       * DONE:             4
       */
      readyState: 0,

      /**
       * @type {String} The response of the request as text.
       */
      responseText: "",

      /**
       * @type {Object} The response of the request as a Document object.
       */
      response: null,

      /**
       * @type {Object} The response of the request as object.
       */
      responseXML: null,

      /**
       * @type {Number} The HTTP status code.
       */
      status: 0,

      /**
       * @type {String} The HTTP status text.
       */
      statusText: "",

      /**
       * @type {String} The response Type to use in the request
       */
      responseType: "",

      /**
       * @type {Number} Timeout limit in milliseconds.
       *
       * 0 (default) means no timeout. Not supported for synchronous requests.
       */
      timeout: 0,

      /**
       * @type {Object} Wrapper to store data of the progress event which contains the keys
         <code>lengthComputable</code>, <code>loaded</code> and <code>total</code>
       */
      progress: null,

      /**
       * Initializes (prepares) request.
       *
       * @ignore(XDomainRequest)
       *
       * @param method {String?"GET"}
       *  The HTTP method to use.
       * @param url {String}
       *  The URL to which to send the request.
       * @param async {Boolean?true}
       *  Whether or not to perform the operation asynchronously.
       * @param user {String?null}
       *  Optional user name to use for authentication purposes.
       * @param password {String?null}
       *  Optional password to use for authentication purposes.
       */
      open: function open(method, url, async, user, password) {
        this.__checkDisposed(); // Mimick native behavior


        if (typeof url === "undefined") {
          throw new Error("Not enough arguments");
        } else if (typeof method === "undefined") {
          method = "GET";
        } // Reset flags that may have been set on previous request


        this.__abort = false;
        this.__send = false;
        this.__conditional = false; // Store URL for later checks

        this.__url = url;

        if (typeof async == "undefined") {
          async = true;
        }

        this.__async = async; // Default values according to spec.

        this.status = 0;
        this.statusText = this.responseText = "";
        this.responseXML = null;
        this.response = null; // BUGFIX
        // IE < 9 and FF < 3.5 cannot reuse the native XHR to issue many requests

        if (!this.__supportsManyRequests() && this.readyState > qx.bom.request.Xhr.UNSENT) {
          // XmlHttpRequest Level 1 requires open() to abort any pending requests
          // associated to the object. Since we're dealing with a new object here,
          // we have to emulate this behavior. Moreover, allow old native XHR to be garbage collected
          //
          // Dispose and abort.
          //
          this.dispose(); // Replace the underlying native XHR with a new one that can
          // be used to issue new requests.

          this.__initNativeXhr();
        } // Restore handler in case it was removed before


        this.__nativeXhr.onreadystatechange = this.__onNativeReadyStateChangeBound;

        try {
          if (qx.core.Environment.get("qx.debug.io")) {
            qx.Bootstrap.debug(qx.bom.request.Xhr, "Open native request with method: " + method + ", url: " + url + ", async: " + async);
          }

          this.__nativeXhr.open(method, url, async, user, password); // BUGFIX: IE, Firefox < 3.5
          // Some browsers do not support Cross-Origin Resource Sharing (CORS)
          // for XMLHttpRequest. Instead, an exception is thrown even for async requests
          // if URL is cross-origin (as per XHR level 1). Use the proprietary XDomainRequest
          // if available (supports CORS) and handle error (if there is one) this
          // way. Otherwise just assume network error.
          //
          // Basically, this allows to detect network errors.

        } catch (OpenError) {
          // Only work around exceptions caused by cross domain request attempts
          if (!qx.util.Request.isCrossDomain(url)) {
            // Is same origin
            throw OpenError;
          }

          if (!this.__async) {
            this.__openError = OpenError;
          }

          if (this.__async) {
            // Try again with XDomainRequest
            // (Success case not handled on purpose)
            // - IE 9
            if (window.XDomainRequest) {
              this.readyState = 4;
              this.__nativeXhr = new XDomainRequest();
              this.__nativeXhr.onerror = qx.Bootstrap.bind(function () {
                this._emit("readystatechange");

                this._emit("error");

                this._emit("loadend");
              }, this);

              if (qx.core.Environment.get("qx.debug.io")) {
                qx.Bootstrap.debug(qx.bom.request.Xhr, "Retry open native request with method: " + method + ", url: " + url + ", async: " + async);
              }

              this.__nativeXhr.open(method, url, async, user, password);

              return;
            } // Access denied
            // - IE 6: -2146828218
            // - IE 7: -2147024891
            // - Legacy Firefox


            window.setTimeout(qx.Bootstrap.bind(function () {
              if (this.__disposed) {
                return;
              }

              this.readyState = 4;

              this._emit("readystatechange");

              this._emit("error");

              this._emit("loadend");
            }, this));
          }
        } // BUGFIX: IE < 9
        // IE < 9 tends to cache overly aggressive. This may result in stale
        // representations. Force validating freshness of cached representation.


        if (qx.core.Environment.get("engine.name") === "mshtml" && qx.core.Environment.get("browser.documentmode") < 9 && this.__nativeXhr.readyState > 0) {
          this.__nativeXhr.setRequestHeader("If-Modified-Since", "-1");
        } // BUGFIX: Firefox
        // Firefox < 4 fails to trigger onreadystatechange OPENED for sync requests


        if (qx.core.Environment.get("engine.name") === "gecko" && parseInt(qx.core.Environment.get("engine.version"), 10) < 2 && !this.__async) {
          // Native XHR is already set to readyState DONE. Fake readyState
          // and call onreadystatechange manually.
          this.readyState = qx.bom.request.Xhr.OPENED;

          this._emit("readystatechange");
        }
      },

      /**
       * Sets an HTTP request header to be used by the request.
       *
       * Note: The request must be initialized before using this method.
       *
       * @param key {String}
       *  The name of the header whose value is to be set.
       * @param value {String}
       *  The value to set as the body of the header.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      setRequestHeader: function setRequestHeader(key, value) {
        this.__checkDisposed(); // Detect conditional requests


        if (key == "If-Match" || key == "If-Modified-Since" || key == "If-None-Match" || key == "If-Range") {
          this.__conditional = true;
        }

        this.__nativeXhr.setRequestHeader(key, value);

        return this;
      },

      /**
       * Sends request.
       *
       * @param data {String|Document?null}
       *  Optional data to send.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      send: function send(data) {
        this.__checkDisposed(); // BUGFIX: IE & Firefox < 3.5
        // For sync requests, some browsers throw error on open()
        // while it should be on send()
        //


        if (!this.__async && this.__openError) {
          throw this.__openError;
        } // BUGFIX: Opera
        // On network error, Opera stalls at readyState HEADERS_RECEIVED
        // This violates the spec. See here http://www.w3.org/TR/XMLHttpRequest2/#send
        // (Section: If there is a network error)
        //
        // To fix, assume a default timeout of 10 seconds. Note: The "error"
        // event will be fired correctly, because the error flag is inferred
        // from the statusText property. Of course, compared to other
        // browsers there is an additional call to ontimeout(), but this call
        // should not harm.
        //


        if (qx.core.Environment.get("engine.name") === "opera" && this.timeout === 0) {
          this.timeout = 10000;
        } // Timeout


        if (this.timeout > 0) {
          this.__timerId = window.setTimeout(this.__onTimeoutBound, this.timeout);
        } // BUGFIX: Firefox 2
        // "NS_ERROR_XPC_NOT_ENOUGH_ARGS" when calling send() without arguments


        data = typeof data == "undefined" ? null : data; // Whitelisting the allowed data types regarding the spec
        // -> http://www.w3.org/TR/XMLHttpRequest2/#the-send-method
        // All other data input will be transformed to a string to e.g. prevent
        // an SendError in Firefox (at least <= 31) and to harmonize it with the
        // behaviour of all other browsers (Chrome, IE and Safari)

        var dataType = qx.Bootstrap.getClass(data);
        data = data !== null && this.__dataTypeWhiteList.indexOf(dataType) === -1 ? data.toString() : data; // Some browsers may throw an error when sending of async request fails.
        // This violates the spec which states only sync requests should.

        try {
          if (qx.core.Environment.get("qx.debug.io")) {
            qx.Bootstrap.debug(qx.bom.request.Xhr, "Send native request");
          }

          if (this.__async) {
            this.__nativeXhr.responseType = this.responseType;
          }

          this.__nativeXhr.send(data);
        } catch (SendError) {
          if (!this.__async) {
            throw SendError;
          } // BUGFIX
          // Some browsers throws error when file not found via file:// protocol.
          // Synthesize readyState changes.


          if (this._getProtocol() === "file:") {
            this.readyState = 2;

            this.__readyStateChange();

            var that = this;
            window.setTimeout(function () {
              if (that.__disposed) {
                return;
              }

              that.readyState = 3;

              that.__readyStateChange();

              that.readyState = 4;

              that.__readyStateChange();
            });
          }
        } // BUGFIX: Firefox
        // Firefox fails to trigger onreadystatechange DONE for sync requests


        if (qx.core.Environment.get("engine.name") === "gecko" && !this.__async) {
          // Properties all set, only missing native readystatechange event
          this.__onNativeReadyStateChange();
        } // Set send flag


        this.__send = true;
        return this;
      },

      /**
       * Abort request - i.e. cancels any network activity.
       *
       * Note:
       *  On Windows 7 every browser strangely skips the loading phase
       *  when this method is called (because readyState never gets 3).
       *
       *  So keep this in mind if you rely on the phases which are
       *  passed through. They will be "opened", "sent", "abort"
       *  instead of normally "opened", "sent", "loading", "abort".
       *
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      abort: function abort() {
        this.__checkDisposed();

        this.__abort = true;

        this.__nativeXhr.abort();

        if (this.__nativeXhr && this.readyState !== qx.bom.request.Xhr.DONE) {
          this.readyState = this.__nativeXhr.readyState;
        }

        return this;
      },

      /**
       * Helper to emit events and call the callback methods.
       * @param event {String} The name of the event.
       */
      _emit: function _emit(event) {
        if (this["on" + event]) {
          this["on" + event]();
        }

        this._emitter.emit(event, this);
      },

      /**
       * Event handler for XHR event that fires at every state change.
       *
       * Replace with custom method to get informed about the communication progress.
       */
      onreadystatechange: function onreadystatechange() {},

      /**
       * Event handler for XHR event "load" that is fired on successful retrieval.
       *
       * Note: This handler is called even when the HTTP status indicates an error.
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
      * Event handler for XHR event "progress".
      *
      * Replace with custom method to listen to the "progress" event.
      */
      onprogress: function onprogress() {},

      /**
       * Add an event listener for the given event name.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function to execute when the event is fired
       * @param ctx {var?} The context of the listener.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      on: function on(name, listener, ctx) {
        this._emitter.on(name, listener, ctx);

        return this;
      },

      /**
       * Get a single response header from response.
       *
       * @param header {String}
       *  Key of the header to get the value from.
       * @return {String}
       *  Response header.
       */
      getResponseHeader: function getResponseHeader(header) {
        this.__checkDisposed();

        if (qx.core.Environment.get("browser.documentmode") === 9 && this.__nativeXhr.aborted) {
          return "";
        }

        return this.__nativeXhr.getResponseHeader(header);
      },

      /**
       * Get all response headers from response.
       *
       * @return {String} All response headers.
       */
      getAllResponseHeaders: function getAllResponseHeaders() {
        this.__checkDisposed();

        if (qx.core.Environment.get("browser.documentmode") === 9 && this.__nativeXhr.aborted) {
          return "";
        }

        return this.__nativeXhr.getAllResponseHeaders();
      },

      /**
       * Overrides the MIME type returned by the server
       * and must be called before @send()@.
       *
       * Note:
       *
       * * IE doesn't support this method so in this case an Error is thrown.
       * * after calling this method @getResponseHeader("Content-Type")@
       *   may return the original (Firefox 23, IE 10, Safari 6) or
       *   the overridden content type (Chrome 28+, Opera 15+).
       *
       *
       * @param mimeType {String} The mimeType for overriding.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      overrideMimeType: function overrideMimeType(mimeType) {
        this.__checkDisposed();

        if (this.__nativeXhr.overrideMimeType) {
          this.__nativeXhr.overrideMimeType(mimeType);
        } else {
          throw new Error("Native XHR object doesn't support overrideMimeType.");
        }

        return this;
      },

      /**
       * Get wrapped native XMLHttpRequest (or equivalent).
       *
       * Can be XMLHttpRequest or ActiveX.
       *
       * @return {Object} XMLHttpRequest or equivalent.
       */
      getRequest: function getRequest() {
        return this.__nativeXhr;
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Dispose object and wrapped native XHR.
       * @return {Boolean} <code>true</code> if the object was successfully disposed
       */
      dispose: function dispose() {
        if (this.__disposed) {
          return false;
        }

        window.clearTimeout(this.__timerId); // Remove unload listener in IE. Aborting on unload is no longer required
        // for this instance.

        if (window.detachEvent) {
          window.detachEvent("onunload", this.__onUnloadBound);
        } // May fail in IE


        try {
          this.__nativeXhr.onreadystatechange;
        } catch (PropertiesNotAccessable) {
          return false;
        } // Clear out listeners


        var noop = function noop() {};

        this.__nativeXhr.onreadystatechange = noop;
        this.__nativeXhr.onload = noop;
        this.__nativeXhr.onerror = noop;
        this.__nativeXhr.onprogress = noop; // Abort any network activity

        this.abort(); // Remove reference to native XHR

        this.__nativeXhr = null;
        this.__disposed = true;
        return true;
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
       * Create XMLHttpRequest (or equivalent).
       *
       * @return {Object} XMLHttpRequest or equivalent.
       */
      _createNativeXhr: function _createNativeXhr() {
        var xhr = qx.core.Environment.get("io.xhr");

        if (xhr === "xhr") {
          return new XMLHttpRequest();
        }

        if (xhr == "activex") {
          return new window.ActiveXObject("Microsoft.XMLHTTP");
        }

        qx.Bootstrap.error(this, "No XHR support available.");
      },

      /**
       * Get protocol of requested URL.
       *
       * @return {String} The used protocol.
       */
      _getProtocol: function _getProtocol() {
        var url = this.__url;
        var protocolRe = /^(\w+:)\/\//; // Could be http:// from file://

        if (url !== null && url.match) {
          var match = url.match(protocolRe);

          if (match && match[1]) {
            return match[1];
          }
        }

        return window.location.protocol;
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Object} XMLHttpRequest or equivalent.
       */
      __nativeXhr: null,

      /**
       * @type {Boolean} Whether request is async.
       */
      __async: null,

      /**
       * @type {Function} Bound __onNativeReadyStateChange handler.
       */
      __onNativeReadyStateChangeBound: null,

      /**
       * @type {Function} Bound __onNativeAbort handler.
       */
      __onNativeAbortBound: null,

      /**
       * @type {Function} Bound __onNativeProgress handler.
       */
      __onNativeProgressBound: null,

      /**
       * @type {Function} Bound __onUnload handler.
       */
      __onUnloadBound: null,

      /**
       * @type {Function} Bound __onTimeout handler.
       */
      __onTimeoutBound: null,

      /**
       * @type {Boolean} Send flag
       */
      __send: null,

      /**
       * @type {String} Requested URL
       */
      __url: null,

      /**
       * @type {Boolean} Abort flag
       */
      __abort: null,

      /**
       * @type {Boolean} Timeout flag
       */
      __timeout: null,

      /**
       * @type {Boolean} Whether object has been disposed.
       */
      __disposed: null,

      /**
       * @type {Number} ID of timeout timer.
       */
      __timerId: null,

      /**
       * @type {Error} Error thrown on open, if any.
       */
      __openError: null,

      /**
       * @type {Boolean} Conditional get flag
       */
      __conditional: null,

      /**
       * @type {Array} Whitelist with all allowed data types for the request payload
       */
      __dataTypeWhiteList: null,

      /**
       * Init native XHR.
       */
      __initNativeXhr: function __initNativeXhr() {
        // Create native XHR or equivalent and hold reference
        this.__nativeXhr = this._createNativeXhr(); // Track native ready state changes

        this.__nativeXhr.onreadystatechange = this.__onNativeReadyStateChangeBound; // Track native abort, when supported

        if (qx.Bootstrap.getClass(this.__nativeXhr.onabort) !== "Undefined") {
          this.__nativeXhr.onabort = this.__onNativeAbortBound;
        } // Track native progress, when supported


        if (qx.Bootstrap.getClass(this.__nativeXhr.onprogress) !== "Undefined") {
          this.__nativeXhr.onprogress = this.__onNativeProgressBound;
          this.progress = {
            lengthComputable: false,
            loaded: 0,
            total: 0
          };
        } // Reset flags


        this.__disposed = this.__send = this.__abort = false; // Initialize data white list

        this.__dataTypeWhiteList = ["ArrayBuffer", "Blob", "File", "HTMLDocument", "String", "FormData"];
      },

      /**
       * Track native abort.
       *
       * In case the end user cancels the request by other
       * means than calling abort().
       */
      __onNativeAbort: function __onNativeAbort() {
        // When the abort that triggered this method was not a result from
        // calling abort()
        if (!this.__abort) {
          this.abort();
        }
      },

      /**
       * Track native progress event.
       @param e {Event} The native progress event.
       */
      __onNativeProgress: function __onNativeProgress(e) {
        this.progress.lengthComputable = e.lengthComputable;
        this.progress.loaded = e.loaded;
        this.progress.total = e.total;

        this._emit("progress");
      },

      /**
       * Handle native onreadystatechange.
       *
       * Calls user-defined function onreadystatechange on each
       * state change and syncs the XHR status properties.
       */
      __onNativeReadyStateChange: function __onNativeReadyStateChange() {
        var nxhr = this.__nativeXhr,
            propertiesReadable = true;

        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug(qx.bom.request.Xhr, "Received native readyState: " + nxhr.readyState);
        } // BUGFIX: IE, Firefox
        // onreadystatechange() is called twice for readyState OPENED.
        //
        // Call onreadystatechange only when readyState has changed.


        if (this.readyState == nxhr.readyState) {
          return;
        } // Sync current readyState


        this.readyState = nxhr.readyState; // BUGFIX: IE
        // Superfluous onreadystatechange DONE when aborting OPENED
        // without send flag

        if (this.readyState === qx.bom.request.Xhr.DONE && this.__abort && !this.__send) {
          return;
        } // BUGFIX: IE
        // IE fires onreadystatechange HEADERS_RECEIVED and LOADING when sync
        //
        // According to spec, only onreadystatechange OPENED and DONE should
        // be fired.


        if (!this.__async && (nxhr.readyState == 2 || nxhr.readyState == 3)) {
          return;
        } // Default values according to spec.


        this.status = 0;
        this.statusText = this.responseText = "";
        this.responseXML = null;
        this.response = null;

        if (this.readyState >= qx.bom.request.Xhr.HEADERS_RECEIVED) {
          // In some browsers, XHR properties are not readable
          // while request is in progress.
          try {
            this.status = nxhr.status;
            this.statusText = nxhr.statusText;
            this.response = nxhr.response;

            if (this.responseType === "" || this.responseType === "text") {
              this.responseText = nxhr.responseText;
            }

            if (this.responseType === "" || this.responseType === "document") {
              this.responseXML = nxhr.responseXML;
            }
          } catch (XhrPropertiesNotReadable) {
            propertiesReadable = false;
          }

          if (propertiesReadable) {
            this.__normalizeStatus();

            this.__normalizeResponseXML();
          }
        }

        this.__readyStateChange(); // BUGFIX: IE
        // Memory leak in XMLHttpRequest (on-page)


        if (this.readyState == qx.bom.request.Xhr.DONE) {
          // Allow garbage collecting of native XHR
          if (nxhr) {
            nxhr.onreadystatechange = function () {};
          }
        }
      },

      /**
       * Handle readystatechange. Called internally when readyState is changed.
       */
      __readyStateChange: function __readyStateChange() {
        // Cancel timeout before invoking handlers because they may throw
        if (this.readyState === qx.bom.request.Xhr.DONE) {
          // Request determined DONE. Cancel timeout.
          window.clearTimeout(this.__timerId);
        } // Always fire "readystatechange"


        this._emit("readystatechange");

        if (this.readyState === qx.bom.request.Xhr.DONE) {
          this.__readyStateChangeDone();
        }
      },

      /**
       * Handle readystatechange. Called internally by
       * {@link #__readyStateChange} when readyState is DONE.
       */
      __readyStateChangeDone: function __readyStateChangeDone() {
        // Fire "timeout" if timeout flag is set
        if (this.__timeout) {
          this._emit("timeout"); // BUGFIX: Opera
          // Since Opera does not fire "error" on network error, fire additional
          // "error" on timeout (may well be related to network error)


          if (qx.core.Environment.get("engine.name") === "opera") {
            this._emit("error");
          }

          this.__timeout = false; // Fire either "abort", "load" or "error"
        } else {
          if (this.__abort) {
            this._emit("abort");
          } else {
            if (this.__isNetworkError()) {
              this._emit("error");
            } else {
              this._emit("load");
            }
          }
        } // Always fire "onloadend" when DONE


        this._emit("loadend");
      },

      /**
       * Check for network error.
       *
       * @return {Boolean} Whether a network error occurred.
       */
      __isNetworkError: function __isNetworkError() {
        var error; // Infer the XHR internal error flag from statusText when not aborted.
        // See http://www.w3.org/TR/XMLHttpRequest2/#error-flag and
        // http://www.w3.org/TR/XMLHttpRequest2/#the-statustext-attribute
        //
        // With file://, statusText is always falsy. Assume network error when
        // response is empty.

        if (this._getProtocol() === "file:") {
          error = !this.responseText;
        } else {
          error = this.status === 0;
        }

        return error;
      },

      /**
       * Handle faked timeout.
       */
      __onTimeout: function __onTimeout() {
        // Basically, mimick http://www.w3.org/TR/XMLHttpRequest2/#timeout-error
        var nxhr = this.__nativeXhr;
        this.readyState = qx.bom.request.Xhr.DONE; // Set timeout flag

        this.__timeout = true; // No longer consider request. Abort.

        nxhr.aborted = true;
        nxhr.abort();
        this.responseText = "";
        this.responseXML = null; // Signal readystatechange

        this.__readyStateChange();
      },

      /**
       * Normalize status property across browsers.
       */
      __normalizeStatus: function __normalizeStatus() {
        var isDone = this.readyState === qx.bom.request.Xhr.DONE; // BUGFIX: Most browsers
        // Most browsers tell status 0 when it should be 200 for local files

        if (this._getProtocol() === "file:" && this.status === 0 && isDone) {
          if (!this.__isNetworkError()) {
            this.status = 200;
          }
        } // BUGFIX: IE
        // IE sometimes tells 1223 when it should be 204


        if (this.status === 1223) {
          this.status = 204;
        } // BUGFIX: Opera
        // Opera tells 0 for conditional requests when it should be 304
        //
        // Detect response to conditional request that signals fresh cache.


        if (qx.core.Environment.get("engine.name") === "opera") {
          if (isDone && // Done
          this.__conditional && // Conditional request
          !this.__abort && // Not aborted
          this.status === 0 // But status 0!
          ) {
              this.status = 304;
            }
        }
      },

      /**
       * Normalize responseXML property across browsers.
       */
      __normalizeResponseXML: function __normalizeResponseXML() {
        // BUGFIX: IE
        // IE does not recognize +xml extension, resulting in empty responseXML.
        //
        // Check if Content-Type is +xml, verify missing responseXML then parse
        // responseText as XML.
        if (qx.core.Environment.get("engine.name") == "mshtml" && (this.getResponseHeader("Content-Type") || "").match(/[^\/]+\/[^\+]+\+xml/) && this.responseXML && !this.responseXML.documentElement) {
          var dom = new window.ActiveXObject("Microsoft.XMLDOM");
          dom.async = false;
          dom.validateOnParse = false;
          dom.loadXML(this.responseText);
          this.responseXML = dom;
        }
      },

      /**
       * Handler for native unload event.
       */
      __onUnload: function __onUnload() {
        try {
          // Abort and dispose
          if (this) {
            this.dispose();
          }
        } catch (e) {}
      },

      /**
       * Helper method to determine whether browser supports reusing the
       * same native XHR to send more requests.
       * @return {Boolean} <code>true</code> if request object reuse is supported
       */
      __supportsManyRequests: function __supportsManyRequests() {
        var name = qx.core.Environment.get("engine.name");
        var version = qx.core.Environment.get("browser.version");
        return !(name == "mshtml" && version < 9 || name == "gecko" && version < 3.5);
      },

      /**
       * Throw when already disposed.
       */
      __checkDisposed: function __checkDisposed() {
        if (this.__disposed) {
          throw new Error("Already disposed");
        }
      }
    },
    defer: function defer() {
      qx.core.Environment.add("qx.debug.io", false);
    }
  });
  qx.bom.request.Xhr.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Json": {
        "require": true
      },
      "qx.xml.Document": {
        "require": true
      },
      "qx.core.Assert": {}
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
   * Parsers for parsing response strings (especially for XHR).
   *
   * Known parsers are: <code>"json"</code> and <code>"xml"</code>.
   *
   * @require(qx.util.ResponseParser#parse)
   */
  qx.Bootstrap.define("qx.util.ResponseParser", {
    /**
     * @param parser {String|Function} See {@link #setParser}.
     */
    construct: function construct(parser) {
      if (parser !== undefined) {
        this.setParser(parser);
      }
    },
    statics: {
      /**
       * @type {Map} Map of parser functions. Parsers defined here can be
       * referenced symbolically, e.g. with {@link #setParser}.
       *
       * Known parsers are: <code>"json"</code> and <code>"xml"</code>.
       */
      PARSER: {
        json: qx.lang.Json.parse,
        xml: qx.xml.Document.fromString
      }
    },
    members: {
      __parser: null,

      /**
       * Returns given response parsed with parser
       * determined by {@link #_getParser}.
       *
       * @param response {String} response (e.g JSON/XML string)
       * @param contentType {String} contentType (e.g. 'application/json')
       * @return {String|Object} The parsed response of the request.
       */
      parse: function parse(response, contentType) {
        var parser = this._getParser(contentType);

        if (typeof parser === "function") {
          if (response !== "") {
            return parser.call(this, response);
          }
        }

        return response;
      },

      /**
       * Set parser used to parse response once request has
       * completed successfully.
       *
       * Usually, the parser is correctly inferred from the
       * content type of the response. This method allows to force the
       * parser being used, e.g. if the content type returned from
       * the backend is wrong or the response needs special parsing.
       *
       * Parser most typically used can be referenced symbolically.
       * To cover edge cases, a function can be given. When parsing
       * the response, this function is called with the raw response as
       * first argument.
       *
       * @param parser {String|Function}
       *
       * Can be:
       *
       * <ul>
       *   <li>A parser defined in {@link qx.util.ResponseParser#PARSER},
       *       referenced by string.</li>
       *   <li>The function to invoke.
       *       Receives the raw response as argument.</li>
       * </ul>
       *
       * @return {Function} The parser function
       */
      setParser: function setParser(parser) {
        // Symbolically given known parser
        if (typeof qx.util.ResponseParser.PARSER[parser] === "function") {
          return this.__parser = qx.util.ResponseParser.PARSER[parser];
        } // If parser is not a symbol, it must be a function


        {
          qx.core.Assert.assertFunction(parser);
        }
        return this.__parser = parser;
      },

      /**
       * Gets the parser.
       *
       * If not defined explicitly using {@link #setParser},
       * the parser is inferred from the content type.
       *
       * Override this method to extend the list of content types
       * being handled.
       *
       * @param contentType {String}
       * @return {Function|null} The parser function or <code>null</code> if the
       * content type is undetermined.
       *
       */
      _getParser: function _getParser(contentType) {
        var parser = this.__parser,
            contentTypeOrig = "",
            contentTypeNormalized = ""; // Use user-provided parser, if any

        if (parser) {
          return parser;
        } // See http://restpatterns.org/Glossary/MIME_Type


        contentTypeOrig = contentType || ""; // Ignore parameters (e.g. the character set)

        contentTypeNormalized = contentTypeOrig.replace(/;.*$/, "");

        if (/^application\/(\w|\.)*\+?json$/.test(contentTypeNormalized)) {
          parser = qx.util.ResponseParser.PARSER.json;
        }

        if (/^application\/xml$/.test(contentTypeNormalized)) {
          parser = qx.util.ResponseParser.PARSER.xml;
        } // Deprecated


        if (/[^\/]+\/[^\+]+\+xml$/.test(contentTypeOrig)) {
          parser = qx.util.ResponseParser.PARSER.xml;
        }

        return parser;
      }
    }
  });
  qx.util.ResponseParser.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {
        "construct": true
      },
      "qx.bom.rest.Resource": {},
      "qx.event.type.Rest": {},
      "qx.io.request.Xhr": {},
      "qx.lang.Function": {},
      "qx.event.Timer": {}
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
   * <pre class="javascript">
   * var description = {
   *  "get": { method: "GET", url: "/photo/{id}" },
   *  "put": { method: "PUT", url: "/photo/{id}"},
   *  "post": { method: "POST", url: "/photos/"}
   * };
   * var photo = new qx.io.rest.Resource(description);
   * // Can also be written: photo.invoke("get", {id: 1});
   * photo.get({id: 1});
   *
   * // Additionally sets request data (provide it as string or set the content type)
   * // In a RESTful environment this creates a new resource with the given 'id'
   * photo.configureRequest(function(req) {
   *  req.setRequestHeader("Content-Type", "application/json");
   * });
   * photo.put({id: 1}, {title: "Monkey"});
   *
   * // Additionally sets request data (provide it as string or set the content type)
   * // In a RESTful environment this adds a new resource to the resource collection 'photos'
   * photo.configureRequest(function(req) {
   *  req.setRequestHeader("Content-Type", "application/json");
   * });
   * photo.post(null, {title: "Monkey"});
   * </pre>
   *
   * To check for existence of URL parameters or constrain them to a certain format, you
   * can add a <code>check</code> property to the description. See {@link #map} for details.
   *
   * <pre class="javascript">
   * var description = {
   *  "get": { method: "GET", url: "/photo/{id}", check: { id: /\d+/ } }
   * };
   * var photo = new qx.io.rest.Resource(description);
   * // photo.get({id: "FAIL"});
   * // -- Error: "Parameter 'id' is invalid"
   * </pre>
   *
   * If your description happens to use the same action more than once, consider
   * defining another resource.
   *
   * <pre class="javascript">
   * var description = {
   *  "get": { method: "GET", url: "/photos"},
   * };
   * // Distinguish "photo" (singular) and "photos" (plural) resource
   * var photos = new qx.io.rest.Resource(description);
   * photos.get();
   * </pre>
   *
   * Basically, all routes of a resource should point to the same URL (resource in
   * terms of HTTP). One acceptable exception of this constraint are resources where
   * required parameters are part of the URL (<code>/photos/1/</code>) or filter
   * resources. For instance:
   *
   * <pre class="javascript">
   * var description = {
   *  "get": { method: "GET", url: "/photos/{tag}" }
   * };
   * var photos = new qx.io.rest.Resource(description);
   * photos.get();
   * photos.get({tag: "wildlife"})
   * </pre>
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
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.io.rest.Resource", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /**
     * @param description {Map?} Each key of the map is interpreted as
     *  <code>action</code> name. The value associated to the key must be a map
     *  with the properties <code>method</code> and <code>url</code>.
     *  <code>check</code> is optional. Also see {@link #map}.
     *
     * For example:
     *
     * <pre class="javascript">
     * { get: {method: "GET", url: "/photos/{id}", check: { id: /\d+/ }} }
     * </pre>
     *
     * @see qx.bom.rest
     * @see qx.io.rest
     */
    construct: function construct(description) {
      qx.core.Object.constructor.call(this);
      this.__longPollHandlers = {};
      this.__pollTimers = {};
      this.__routes = {};
      this._resource = this._tailorResource(this._getResource());

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
      "success": "qx.event.type.Rest",

      /**
       * Fired when request associated to action given in prefix was successful.
       *
       * For example, "indexSuccess" is fired when <code>index()</code> was
       * successful.
       */
      "actionSuccess": "qx.event.type.Rest",

      /**
       * Fired when any request fails.
       *
       * The action the failed request is associated to, as well as the
       * request itself, can be retrieved from the event’s properties.
       * Additionally, an action specific event is fired that follows the pattern
       * "<action>Error", e.g. "indexError".
       */
      "error": "qx.event.type.Rest",

      /**
       * Fired when any request associated to action given in prefix fails.
       *
       * For example, "indexError" is fired when <code>index()</code> failed.
       */
      "actionError": "qx.event.type.Rest"
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
        return qx.bom.rest.Resource.placeholdersFromUrl(url);
      }
    },
    members: {
      _resource: null,
      __longPollHandlers: null,
      __pollTimers: null,
      __routes: null,

      /**
       * Get resource.
       *
       * May be overridden to change type of resource.
       * @param description {Map?} See construct.
       * @return {qx.bom.rest.Resource} Resource implementation which does the heavy lifting.
       */
      _getResource: function _getResource(description) {
        return new qx.bom.rest.Resource(description);
      },

      /**
       * Tailors (apply dependency injection) the given resource to fit our needs.
       *
       * @param resource {qx.bom.rest.Resource} Resource.
       * @return {qx.bom.rest.Resource} Tailored resource.
       */
      _tailorResource: function _tailorResource(resource) {
        // inject different request implementation
        resource.setRequestFactory(this._getRequest); // inject different request handling

        resource.setRequestHandler({
          onsuccess: {
            callback: function callback(req, action) {
              return function () {
                var props = [req.getResponse(), null, false, req, action, req.getPhase()];
                this.fireEvent(action + "Success", qx.event.type.Rest, props);
                this.fireEvent("success", qx.event.type.Rest, props);
              };
            },
            context: this
          },
          onfail: {
            callback: function callback(req, action) {
              return function () {
                var props = [req.getResponse(), null, false, req, action, req.getPhase()];
                this.fireEvent(action + "Error", qx.event.type.Rest, props);
                this.fireEvent("error", qx.event.type.Rest, props);
              };
            },
            context: this
          },
          onloadend: {
            callback: function callback(req, action) {
              return function () {
                req.dispose();
              };
            },
            context: this
          }
        });
        return resource;
      },
      //
      // Request
      //

      /**
       * Configure request.
       *
       * @param callback {Function} Function called before request is send.
       *   Receives request, action, params and data.
       *
       * <pre class="javascript">
       * res.configureRequest(function(req, action, params, data) {
       *   if (action === "index") {
       *     req.setAccept("application/json");
       *   }
       * });
       * </pre>
       */
      configureRequest: function configureRequest(callback) {
        this._resource.configureRequest(callback);
      },

      /**
       * Get request.
       *
       * May be overridden to change type of request.
       * @return {qx.io.request.Xhr} Xhr object
       */
      _getRequest: function _getRequest() {
        return new qx.io.request.Xhr();
      },
      //
      // Routes and actions
      //

      /**
       * Map action to combination of method and URL pattern.
       *
       * <pre class="javascript">
       *   res.map("get", "GET", "/photos/{id}", {id: /\d+/});
       *
       *   // GET /photos/123
       *   res.get({id: "123"});
       * </pre>
       *
       * @param action {String} Action to associate to request.
       * @param method {String} Method to configure request with.
       * @param url {String} URL to configure request with. May contain positional
       *   parameters (<code>{param}</code>) that are replaced by values given when the action
       *   is invoked. Parameters are optional, unless a check is defined. A default
       *   value can be provided (<code>{param=default}</code>).
       * @param check {Map?} Map defining parameter constraints, where the key is
       *   the URL parameter and the value a regular expression (to match string) or
       *   <code>qx.io.rest.Resource.REQUIRED</code> (to verify existence).
       */
      map: function map(action, method, url, check) {
        // add dynamic methods also on ourself to allow 'invoke()' delegation
        this.__addAction(action, method, url, check);

        this._resource.map(action, method, url, check);
      },

      /**
       * Map actions to members.
       *
       * @param action {String} Action to associate to request.
       * @param method {String} Method to configure request with.
       * @param url {String} URL to configure request with. May contain positional
       *   parameters (<code>{param}</code>) that are replaced by values given when the action
       *   is invoked. Parameters are optional, unless a check is defined. A default
       *   value can be provided (<code>{param=default}</code>).
       * @param check {Map?} Map defining parameter constraints, where the key is
       *   the URL parameter and the value a regular expression (to match string) or
       *   <code>qx.io.rest.Resource.REQUIRED</code> (to verify existence).
       */
      __addAction: function __addAction(action, method, url, check) {
        this.__routes[action] = [method, url, check]; // Undefine generic getter when action is named "get"

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
       *  See {@link qx.io.request.AbstractRequest#requestData}.
       * @return {Number} Id of the action's invocation.
       */
      invoke: function invoke(action, params, data) {
        var params = params == null ? {} : params; // Cache parameters

        this.__routes[action].params = params;
        return this._resource.invoke(action, params, data);
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
        this._resource.setBaseUrl(baseUrl);
      },

      /**
       * Abort action.
       *
       * Example:
       *
       * <pre class="javascript">
       *   // Abort all invocations of action
       *   res.get({id: 1});
       *   res.get({id: 2});
       *   res.abort("get");
       *
       *   // Abort specific invocation of action (by id)
       *   var actionId = res.get({id: 1});
       *   res.abort(actionId);
       * </pre>
       *
       * @param varargs {String|Number} Action of which all invocations to abort
       *  (when string), or a single invocation of an action to abort (when number)
       */
      abort: function abort(varargs) {
        this._resource.abort(varargs);
      },

      /**
       * Resend request associated to action.
       *
       * Replays parameters given when action was invoked originally.
       *
       * @param action {String} Action to refresh.
       */
      refresh: function refresh(action) {
        this._resource.refresh(action);
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
       * @return {qx.event.Timer} Timer that periodically invokes action. Use to
       *   stop or resume. Is automatically disposed on disposal of object.
       */
      poll: function poll(action, interval, params, immediately) {
        // Dispose timer previously created for action
        if (this.__pollTimers[action]) {
          this.__pollTimers[action].dispose();
        } // Fallback to previous params


        if (typeof params == "undefined") {
          params = this.__routes[action].params;
        } // Invoke immediately


        if (immediately) {
          this.invoke(action, params);
        }

        var intervalListener = function intervalListener() {
          var reqs = this.getRequestsByAction(action),
              req = reqs ? reqs[0] : null;

          if (!immediately && !req) {
            this.invoke(action, params);
            return;
          }

          if (req && (req.isDone() || req.isDisposed())) {
            this.refresh(action);
          }
        };

        var timer = this.__pollTimers[action] = new qx.event.Timer(interval);
        timer.addListener("interval", intervalListener, this._resource);
        timer.start();
        return timer;
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
                res.debug("Received successful response more than " + res._getThrottleCount() + " times subsequently, each within " + res._getThrottleLimit() + " ms. Throttling.");
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
        return this._resource._getRequestConfig(action, params);
      },

      /**
       * Override to adjust the throttle limit.
       * @return {Integer} Throttle limit in milliseconds
       */
      _getThrottleLimit: function _getThrottleLimit() {
        return qx.io.rest.Resource.POLL_THROTTLE_LIMIT;
      },

      /**
       * Override to adjust the throttle count.
       * @return {Integer} Throttle count
       */
      _getThrottleCount: function _getThrottleCount() {
        return qx.io.rest.Resource.POLL_THROTTLE_COUNT;
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
          this.constructor.$$events[type] = "qx.event.type.Rest";
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

      if (this.__pollTimers) {
        for (action in this.__pollTimers) {
          var timer = this.__pollTimers[action];
          timer.stop();
          timer.dispose();
        }
      }

      if (this.__longPollHandlers) {
        for (action in this.__longPollHandlers) {
          var id = this.__longPollHandlers[action];
          this.removeListenerById(id);
        }
      }

      this._resource.destruct();

      this._resource = this.__routes = this.__pollTimers = this.__longPollHandlers = null;
    }
  });
  qx.io.rest.Resource.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-16.js.map
