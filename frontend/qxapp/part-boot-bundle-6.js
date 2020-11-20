(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["io.maxrequests", "io.ssl", "io.xhr"],
      "required": {}
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
       * Carsten Lergenmueller (carstenl)
       * Fabian Jakobs (fbjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Determines browser-dependent information about the transport layer.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Transport", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the maximum number of parallel requests the current browser
       * supports per host addressed.
       *
       * Note that this assumes one connection can support one request at a time
       * only. Technically, this is not correct when pipelining is enabled (which
       * it currently is only for IE 8 and Opera). In this case, the number
       * returned will be too low, as one connection supports multiple pipelined
       * requests. This is accepted for now because pipelining cannot be
       * detected from JavaScript and because modern browsers have enough
       * parallel connections already - it's unlikely an app will require more
       * than 4 parallel XMLHttpRequests to one server at a time.
       *
       * @internal
       * @return {Integer} Maximum number of parallel requests
       */
      getMaxConcurrentRequestCount: function getMaxConcurrentRequestCount() {
        var maxConcurrentRequestCount; // Parse version numbers.

        var versionParts = qx.bom.client.Engine.getVersion().split(".");
        var versionMain = 0;
        var versionMajor = 0;
        var versionMinor = 0; // Main number

        if (versionParts[0]) {
          versionMain = versionParts[0];
        } // Major number


        if (versionParts[1]) {
          versionMajor = versionParts[1];
        } // Minor number


        if (versionParts[2]) {
          versionMinor = versionParts[2];
        } // IE 8 gives the max number of connections in a property
        // see http://msdn.microsoft.com/en-us/library/cc197013(VS.85).aspx


        if (window.maxConnectionsPerServer) {
          maxConcurrentRequestCount = window.maxConnectionsPerServer;
        } else if (qx.bom.client.Engine.getName() == "opera") {
          // Opera: 8 total
          // see http://operawiki.info/HttpProtocol
          maxConcurrentRequestCount = 8;
        } else if (qx.bom.client.Engine.getName() == "webkit") {
          // Safari: 4
          // http://www.stevesouders.com/blog/2008/03/20/roundup-on-parallel-connections/
          // Bug #6917: Distinguish Chrome from Safari, Chrome has 6 connections
          //       according to
          //      http://stackoverflow.com/questions/561046/how-many-concurrent-ajax-xmlhttprequest-requests-are-allowed-in-popular-browser
          maxConcurrentRequestCount = 4;
        } else if (qx.bom.client.Engine.getName() == "gecko" && (versionMain > 1 || versionMain == 1 && versionMajor > 9 || versionMain == 1 && versionMajor == 9 && versionMinor >= 1)) {
          // FF 3.5 (== Gecko 1.9.1): 6 Connections.
          // see  http://gemal.dk/blog/2008/03/18/firefox_3_beta_5_will_have_improved_connection_parallelism/
          maxConcurrentRequestCount = 6;
        } else {
          // Default is 2, as demanded by RFC 2616
          // see http://blogs.msdn.com/ie/archive/2005/04/11/407189.aspx
          maxConcurrentRequestCount = 2;
        }

        return maxConcurrentRequestCount;
      },

      /**
       * Checks whether the app is loaded with SSL enabled which means via https.
       *
       * @internal
       * @return {Boolean} <code>true</code>, if the app runs on https
       */
      getSsl: function getSsl() {
        return window.location.protocol === "https:";
      },

      /**
       * Checks what kind of XMLHttpRequest object the browser supports
       * for the current protocol, if any.
       *
       * The standard XMLHttpRequest is preferred over ActiveX XMLHTTP.
       *
       * @internal
       * @return {String}
       *  <code>"xhr"</code>, if the browser provides standard XMLHttpRequest.<br/>
       *  <code>"activex"</code>, if the browser provides ActiveX XMLHTTP.<br/>
       *  <code>""</code>, if there is not XHR support at all.
       */
      getXmlHttpRequest: function getXmlHttpRequest() {
        // Standard XHR can be disabled in IE's security settings,
        // therefore provide ActiveX as fallback. Additionally,
        // standard XHR in IE7 is broken for file protocol.
        var supports = window.ActiveXObject ? function () {
          if (window.location.protocol !== "file:") {
            try {
              new window.XMLHttpRequest();
              return "xhr";
            } catch (noXhr) {}
          }

          try {
            new window.ActiveXObject("Microsoft.XMLHTTP");
            return "activex";
          } catch (noActiveX) {}
        }() : function () {
          try {
            new window.XMLHttpRequest();
            return "xhr";
          } catch (noXhr) {}
        }();
        return supports || "";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("io.maxrequests", statics.getMaxConcurrentRequestCount);
      qx.core.Environment.add("io.ssl", statics.getSsl);
      qx.core.Environment.add("io.xhr", statics.getXmlHttpRequest);
    }
  });
  qx.bom.client.Transport.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Device": {},
      "qx.bom.client.Engine": {
        "defer": "runtime"
      },
      "qx.bom.client.Transport": {
        "defer": "runtime"
      },
      "qx.util.LibraryManager": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine",
          "defer": true
        },
        "io.ssl": {
          "className": "qx.bom.client.Transport",
          "defer": true
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Contains information about images (size, format, clipping, ...) and
   * other resources like CSS files, local data, ...
   */
  qx.Class.define("qx.util.ResourceManager", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} the shared image registry */
      __registry: qx.$$resources || {},

      /** @type {Map} prefix per library used in HTTPS mode for IE */
      __urlPrefix: {}
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Detects whether there is a high-resolution image available.
       * A high-resolution image is assumed to have the same file name as
       * the parameter source, but with a pixelRatio identifier before the file
       * extension, like "@2x".
       * Medium Resolution: "example.png", high-resolution: "example@2x.png"
       *
       * @param lowResImgSrc {String} source of the low resolution image.
       * @param factor {Number} Factor to find the right image. If not set calculated by getDevicePixelRatio()
       * @return {String|Boolean} If a high-resolution image source.
       */
      findHighResolutionSource: function findHighResolutionSource(lowResImgSrc, factor) {
        var pixelRatioCandidates = ["3", "2", "1.5"]; // Calculate the optimal ratio, based on the rem scale factor of the application and the device pixel ratio.

        if (!factor) {
          factor = parseFloat(qx.bom.client.Device.getDevicePixelRatio().toFixed(2));
        }

        if (factor <= 1) {
          return false;
        }

        var i = pixelRatioCandidates.length;

        while (i > 0 && factor > pixelRatioCandidates[--i]) {}

        var hiResImgSrc;
        var k; // Search for best img with a higher resolution.

        for (k = i; k >= 0; k--) {
          hiResImgSrc = this.getHighResolutionSource(lowResImgSrc, pixelRatioCandidates[k]);

          if (hiResImgSrc) {
            return hiResImgSrc;
          }
        } // Search for best img with a lower resolution.


        for (k = i + 1; k < pixelRatioCandidates.length; k++) {
          hiResImgSrc = this.getHighResolutionSource(lowResImgSrc, pixelRatioCandidates[k]);

          if (hiResImgSrc) {
            return hiResImgSrc;
          }
        }

        return null;
      },

      /**
       * Returns the source name for the high-resolution image based on the passed
       * parameters.
       * @param source {String} the source of the medium resolution image.
       * @param pixelRatio {Number} the pixel ratio of the high-resolution image.
       * @return {String} the high-resolution source name or null if no source could be found.
       */
      getHighResolutionSource: function getHighResolutionSource(source, pixelRatio) {
        var fileExtIndex = source.lastIndexOf('.');

        if (fileExtIndex > -1) {
          var pixelRatioIdentifier = "@" + pixelRatio + "x";
          var candidate = source.slice(0, fileExtIndex) + pixelRatioIdentifier + source.slice(fileExtIndex);

          if (this.has(candidate)) {
            return candidate;
          }
        }

        return null;
      },

      /**
       * Get all known resource IDs.
       *
       * @param pathfragment{String|null|undefined} an optional path fragment to check against with id.indexOf(pathfragment)
       * @return {Array|null} an array containing the IDs or null if the registry is not initialized
       */
      getIds: function getIds(pathfragment) {
        var registry = qx.util.ResourceManager.__registry;

        if (!registry) {
          return null;
        }

        var ids = [];

        for (var id in registry) {
          if (registry.hasOwnProperty(id)) {
            if (pathfragment && id.indexOf(pathfragment) == -1) {
              continue;
            }

            ids.push(id);
          }
        }

        return ids;
      },

      /**
       * Whether the registry has information about the given resource.
       *
       * @param id {String} The resource to get the information for
       * @return {Boolean} <code>true</code> when the resource is known.
       */
      has: function has(id) {
        return !!qx.util.ResourceManager.__registry[id];
      },

      /**
       * Get information about an resource.
       *
       * @param id {String} The resource to get the information for
       * @return {Array} Registered data or <code>null</code>
       */
      getData: function getData(id) {
        return qx.util.ResourceManager.__registry[id] || null;
      },

      /**
       * Returns the width of the given resource ID,
       * when it is not a known image <code>0</code> is
       * returned.
       *
       * @param id {String} Resource identifier
       * @return {Integer} The image width, maybe <code>null</code> when the width is unknown
       */
      getImageWidth: function getImageWidth(id) {
        var size;

        if (id && id.startsWith("@")) {
          var part = id.split("/");
          size = parseInt(part[2], 10);

          if (size) {
            id = part[0] + "/" + part[1];
          }
        }

        var entry = qx.util.ResourceManager.__registry[id]; // [ width, height, codepoint ]

        if (size && entry) {
          var width = Math.ceil(size / entry[1] * entry[0]);
          return width;
        }

        return entry ? entry[0] : null;
      },

      /**
       * Returns the height of the given resource ID,
       * when it is not a known image <code>0</code> is
       * returned.
       *
       * @param id {String} Resource identifier
       * @return {Integer} The image height, maybe <code>null</code> when the height is unknown
       */
      getImageHeight: function getImageHeight(id) {
        if (id && id.startsWith("@")) {
          var part = id.split("/");
          var size = parseInt(part[2], 10);

          if (size) {
            return size;
          }
        }

        var entry = qx.util.ResourceManager.__registry[id];
        return entry ? entry[1] : null;
      },

      /**
       * Returns the format of the given resource ID,
       * when it is not a known image <code>null</code>
       * is returned.
       *
       * @param id {String} Resource identifier
       * @return {String} File format of the image
       */
      getImageFormat: function getImageFormat(id) {
        if (id && id.startsWith("@")) {
          return "font";
        }

        var entry = qx.util.ResourceManager.__registry[id];
        return entry ? entry[2] : null;
      },

      /**
       * Returns the format of the combined image (png, gif, ...), if the given
       * resource identifier is an image contained in one, or the empty string
       * otherwise.
       *
       * @param id {String} Resource identifier
       * @return {String} The type of the combined image containing id
       */
      getCombinedFormat: function getCombinedFormat(id) {
        var clippedtype = "";
        var entry = qx.util.ResourceManager.__registry[id];
        var isclipped = entry && entry.length > 4 && typeof entry[4] == "string" && this.constructor.__registry[entry[4]];

        if (isclipped) {
          var combId = entry[4];
          var combImg = this.constructor.__registry[combId];
          clippedtype = combImg[2];
        }

        return clippedtype;
      },

      /**
       * Converts the given resource ID to a full qualified URI
       *
       * @param id {String} Resource ID
       * @return {String} Resulting URI
       */
      toUri: function toUri(id) {
        if (id == null) {
          return id;
        }

        var entry = qx.util.ResourceManager.__registry[id];

        if (!entry) {
          return id;
        }

        if (typeof entry === "string") {
          var lib = entry;
        } else {
          var lib = entry[3]; // no lib reference
          // may mean that the image has been registered dynamically

          if (!lib) {
            return id;
          }
        }

        var urlPrefix = "";

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("io.ssl")) {
          urlPrefix = qx.util.ResourceManager.__urlPrefix[lib];
        }

        return urlPrefix + qx.util.LibraryManager.getInstance().get(lib, "resourceUri") + "/" + id;
      },

      /**
       * Construct a data: URI for an image resource.
       *
       * Constructs a data: URI for a given resource id, if this resource is
       * contained in a base64 combined image. If this is not the case (e.g.
       * because the combined image has not been loaded yet), returns the direct
       * URI to the image file itself.
       *
       * @param resid {String} resource id of the image
       * @return {String} "data:" or "http:" URI
       */
      toDataUri: function toDataUri(resid) {
        var resentry = this.constructor.__registry[resid];
        var combined = resentry ? this.constructor.__registry[resentry[4]] : null;
        var uri;

        if (combined) {
          var resstruct = combined[4][resid];
          uri = "data:image/" + resstruct["type"] + ";" + resstruct["encoding"] + "," + resstruct["data"];
        } else {
          uri = this.toUri(resid);
        }

        return uri;
      },

      /**
       * Checks whether a given resource id for an image is a font handle.
       *
       * @param resid {String} resource id of the image
       * @return {Boolean} True if it's a font URI
       */
      isFontUri: function isFontUri(resid) {
        return resid ? resid.startsWith("@") : false;
      }
    },
    defer: function defer(statics) {
      if (qx.core.Environment.get("engine.name") == "mshtml") {
        // To avoid a "mixed content" warning in IE when the application is
        // delivered via HTTPS a prefix has to be added. This will transform the
        // relative URL to an absolute one in IE.
        // Though this warning is only displayed in conjunction with images which
        // are referenced as a CSS "background-image", every resource path is
        // changed when the application is served with HTTPS.
        if (qx.core.Environment.get("io.ssl")) {
          for (var lib in qx.$$libraries) {
            var resourceUri;

            if (qx.util.LibraryManager.getInstance().get(lib, "resourceUri")) {
              resourceUri = qx.util.LibraryManager.getInstance().get(lib, "resourceUri");
            } else {
              // default for libraries without a resourceUri set
              statics.__urlPrefix[lib] = "";
              continue;
            }

            var href; //first check if there is base url set

            var baseElements = document.getElementsByTagName("base");

            if (baseElements.length > 0) {
              href = baseElements[0].href;
            } // It is valid to to begin a URL with "//" so this case has to
            // be considered. If the to resolved URL begins with "//" the
            // manager prefixes it with "https:" to avoid any problems for IE


            if (resourceUri.match(/^\/\//) != null) {
              statics.__urlPrefix[lib] = window.location.protocol;
            } // If the resourceUri begins with a single slash, include the current
            // hostname
            else if (resourceUri.match(/^\//) != null) {
                if (href) {
                  statics.__urlPrefix[lib] = href;
                } else {
                  statics.__urlPrefix[lib] = window.location.protocol + "//" + window.location.host;
                }
              } // If the resolved URL begins with "./" the final URL has to be
              // put together using the document.URL property.
              // IMPORTANT: this is only applicable for the source version
              else if (resourceUri.match(/^\.\//) != null) {
                  var url = document.URL;
                  statics.__urlPrefix[lib] = url.substring(0, url.lastIndexOf("/") + 1);
                } else if (resourceUri.match(/^http/) != null) {
                  // Let absolute URLs pass through
                  statics.__urlPrefix[lib] = "";
                } else {
                  if (!href) {
                    // check for parameters with URLs as value
                    var index = window.location.href.indexOf("?");

                    if (index == -1) {
                      href = window.location.href;
                    } else {
                      href = window.location.href.substring(0, index);
                    }
                  }

                  statics.__urlPrefix[lib] = href.substring(0, href.lastIndexOf("/") + 1);
                }
          }
        }
      }
    }
  });
  qx.util.ResourceManager.$$dbClassInfo = $$dbClassInfo;
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
      }
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
  
     Author:
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Provides read/write access to library-specific information such as
   * source/resource URIs.
   */
  qx.Class.define("qx.util.LibraryManager", {
    extend: qx.core.Object,
    type: "singleton",
    statics: {
      /** @type {Map} The libraries used by this application */
      __libs: qx.$$libraries || {}
    },
    members: {
      /**
       * Checks whether the library with the given namespace is known to the
       * application.
       * @param namespace {String} The library's namespace
       * @return {Boolean} <code>true</code> if the given library is known
       */
      has: function has(namespace) {
        return !!qx.util.LibraryManager.__libs[namespace];
      },

      /**
       * Returns the value of an attribute of the given library
       * @param namespace {String} The library's namespace
       * @param key {String} Name of the attribute
       * @return {var|null} The attribute's value or <code>null</code> if it's not defined
       */
      get: function get(namespace, key) {
        return qx.util.LibraryManager.__libs[namespace][key] ? qx.util.LibraryManager.__libs[namespace][key] : null;
      },

      /**
       * Sets an attribute on the given library.
       *
       * @param namespace {String} The library's namespace
       * @param key {String} Name of the attribute
       * @param value {var} Value of the attribute
       */
      set: function set(namespace, key, value) {
        qx.util.LibraryManager.__libs[namespace][key] = value;
      }
    }
  });
  qx.util.LibraryManager.$$dbClassInfo = $$dbClassInfo;
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
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Abstract base class for all managers of themed values.
   */
  qx.Class.define("qx.util.ValueManager", {
    type: "abstract",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create empty dynamic map

      this._dynamic = {};
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _dynamic: null,

      /**
       * Returns the dynamically interpreted result for the incoming value
       *
       * @param value {String} dynamically interpreted identifier
       * @return {var} return the (translated) result of the incoming value
       */
      resolveDynamic: function resolveDynamic(value) {
        return this._dynamic[value];
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        return !!this._dynamic[value];
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        if (value && this._dynamic[value]) {
          return this._dynamic[value];
        }

        return value;
      },

      /**
       * Sets the dynamics map.
       * @param value {Map} The map.
       */
      _setDynamic: function _setDynamic(value) {
        this._dynamic = value;
      },

      /**
       * Returns the dynamics map.
       * @return {Map} The map.
       */
      _getDynamic: function _getDynamic() {
        return this._dynamic;
      }
    }
  });
  qx.util.ValueManager.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.ValueManager": {
        "require": true
      },
      "qx.util.ColorUtil": {}
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
   * Manager for color themes
   */
  qx.Class.define("qx.theme.manager.Color", {
    type: "singleton",
    extend: qx.util.ValueManager,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** the currently selected color theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _applyTheme: function _applyTheme(value) {
        var dest = {};

        if (value) {
          var colors = value.colors;

          for (var name in colors) {
            dest[name] = this.__parseColor(colors, name);
          }
        }

        this._setDynamic(dest);
      },

      /**
       * Helper to take a color stored in the theme and returns the string color value.
       * In most of the times that means it just returns the string stored in the theme.
       * It additionally checks if its a valid color at all.
       *
       * @param colors {Map} The map of color definitions.
       * @param name {String} The name of the color to check.
       * @return {String} The resolved color as string.
       */
      __parseColor: function __parseColor(colors, name) {
        var color = colors[name];

        if (typeof color === "string") {
          if (!qx.util.ColorUtil.isCssString(color)) {
            // check for references to in theme colors
            if (colors[color] != undefined) {
              return this.__parseColor(colors, color);
            }

            throw new Error("Could not parse color: " + color);
          }

          return color;
        } else if (color instanceof Array) {
          return qx.util.ColorUtil.rgbToRgbString(color);
        }

        throw new Error("Could not parse color: " + color);
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        var cache = this._dynamic;
        var resolved = cache[value];

        if (resolved) {
          return resolved;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && theme.colors[value]) {
          return cache[value] = theme.colors[value];
        }

        return value;
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        var cache = this._dynamic;

        if (value && cache[value] !== undefined) {
          return true;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && value && theme.colors[value] !== undefined) {
          cache[value] = theme.colors[value];
          return true;
        }

        return false;
      }
    }
  });
  qx.theme.manager.Color.$$dbClassInfo = $$dbClassInfo;
})();

//
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "construct": true
      },
      "qx.bom.client.Browser": {
        "construct": true
      },
      "qx.lang.Type": {},
      "qx.ui.style.Stylesheet": {},
      "qx.Bootstrap": {},
      "qx.ui.decoration.Decorator": {},
      "qx.ui.decoration.IDecorator": {},
      "qx.lang.Object": {},
      "qx.util.AliasManager": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "construct": true,
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
  
  ************************************************************************ */

  /**
   * Manager for decoration themes
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.theme.manager.Decoration", {
    type: "singleton",
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],
    statics: {
      /** The prefix for all created CSS classes*/
      CSS_CLASSNAME_PREFIX: "qx-"
    },
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__rules = [];
      this.__legacyIe = qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9;
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Selected decoration theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __dynamic: null,
      __rules: null,
      __legacyIe: false,

      /**
       * Returns the name which will be / is used as css class name.
       * @param value {String|qx.ui.decoration.IDecorator} The decorator string or instance.
       * @return {String} The css class name.
       */
      getCssClassName: function getCssClassName(value) {
        var prefix = qx.theme.manager.Decoration.CSS_CLASSNAME_PREFIX;

        if (qx.lang.Type.isString(value)) {
          return prefix + value;
        } else {
          return prefix + value.toHashCode();
        }
      },

      /**
       * Adds a css class to the global stylesheet for the given decorator.
       * This includes resolving the decorator if it's a string.
       * @param value {String|qx.ui.decoration.IDecorator} The decorator string or instance.
       * @return {String} the css class name.
       */
      addCssClass: function addCssClass(value) {
        var sheet = qx.ui.style.Stylesheet.getInstance();
        var instance = value;
        value = this.getCssClassName(value);
        var selector = "." + value;

        if (sheet.hasRule(selector)) {
          return value;
        }

        if (qx.lang.Type.isString(instance)) {
          instance = this.resolve(instance);
        }

        if (!instance) {
          throw new Error("Unable to resolve decorator '" + value + "'.");
        } // create and add a CSS rule


        var css = "";
        var styles = instance.getStyles(true); // Sort the styles so that more specific styles come after the group styles, 
        // eg background-color comes after background. The sort order is alphabetical
        // so that short cut rules come before actual

        Object.keys(styles).sort().forEach(function (key) {
          // if we find a map value, use it as pseudo class
          if (qx.Bootstrap.isObject(styles[key])) {
            var innerCss = "";
            var innerStyles = styles[key];
            var inner = false;

            for (var innerKey in innerStyles) {
              inner = true;
              innerCss += innerKey + ":" + innerStyles[innerKey] + ";";
            }

            var innerSelector = this.__legacyIe ? selector : selector + (inner ? ":" : "");

            this.__rules.push(innerSelector + key);

            sheet.addRule(innerSelector + key, innerCss);
            return;
          }

          css += key + ":" + styles[key] + ";";
        }, this);

        if (css) {
          sheet.addRule(selector, css);

          this.__rules.push(selector);
        }

        return value;
      },

      /**
       * Removes all previously by {@link #addCssClass} created CSS rule from
       * the global stylesheet.
       */
      removeAllCssClasses: function removeAllCssClasses() {
        // remove old rules
        for (var i = 0; i < this.__rules.length; i++) {
          var selector = this.__rules[i];
          qx.ui.style.Stylesheet.getInstance().removeRule(selector);
        }

        ;
        this.__rules = [];
      },

      /**
       * Returns the dynamically interpreted result for the incoming value
       *
       * @param value {String} dynamically interpreted idenfier
       * @return {var} return the (translated) result of the incoming value
       */
      resolve: function resolve(value) {
        if (!value) {
          return null;
        }

        if (_typeof(value) === "object") {
          return value;
        }

        var cache = this.__dynamic;

        if (!cache) {
          cache = this.__dynamic = {};
        }

        var resolved = cache[value];

        if (resolved) {
          return resolved;
        }

        var theme = this.getTheme();

        if (!theme) {
          return null;
        }

        if (!theme.decorations[value]) {
          return null;
        } // create an empty decorator


        var decorator = new qx.ui.decoration.Decorator(); // handle recursive decorator includes

        var recurseDecoratorInclude = function recurseDecoratorInclude(currentEntry, name) {
          // follow the include chain to the topmost decorator entry
          if (currentEntry.include && theme.decorations[currentEntry.include]) {
            recurseDecoratorInclude(theme.decorations[currentEntry.include], currentEntry.include);
          } // apply styles from the included decorator, 
          // overwriting existing values.


          if (currentEntry.style) {
            decorator.set(currentEntry.style);
          }
        }; // start with the current decorator entry


        recurseDecoratorInclude(theme.decorations[value], value);
        cache[value] = decorator;
        return cache[value];
      },

      /**
       * Whether the given value is valid for being used in a property
       * with the 'check' configured to 'Decorator'.
       *
       * @param value {var} Incoming value
       * @return {Boolean} Whether the value is valid for being used in a Decorator property
       */
      isValidPropertyValue: function isValidPropertyValue(value) {
        if (typeof value === "string") {
          return this.isDynamic(value);
        } else if (_typeof(value) === "object") {
          var clazz = value.constructor;
          return qx.Class.hasInterface(clazz, qx.ui.decoration.IDecorator);
        }

        return false;
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns <code>true</code> if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        if (!value) {
          return false;
        }

        var theme = this.getTheme();

        if (!theme) {
          return false;
        }

        return !!theme.decorations[value];
      },

      /**
       * Whether the given decorator is cached
       *
       * @param decorator {String|qx.ui.decoration.IDecorator} The decorator to check
       * @return {Boolean} <code>true</code> if the decorator is cached
       * @internal
       */
      isCached: function isCached(decorator) {
        return !this.__dynamic ? false : qx.lang.Object.contains(this.__dynamic, decorator);
      },
      // property apply
      _applyTheme: function _applyTheme(value, old) {
        var aliasManager = qx.util.AliasManager.getInstance(); // remove old rules

        this.removeAllCssClasses();

        if (old) {
          for (var alias in old.aliases) {
            aliasManager.remove(alias);
          }
        }

        if (value) {
          for (var alias in value.aliases) {
            aliasManager.add(alias, value.aliases[alias]);
          }
        }

        this._disposeMap("__dynamic");

        this.__dynamic = {};
      },

      /**
       * Clears internal caches and removes all previously created CSS classes.
       */
      clear: function clear() {
        // remove aliases
        var aliasManager = qx.util.AliasManager.getInstance();
        var theme = this.getTheme();

        if (!aliasManager.isDisposed() && theme && theme.alias) {
          for (var alias in theme.aliases) {
            aliasManager.remove(alias, theme.aliases[alias]);
          }
        } // remove old rules


        this.removeAllCssClasses();

        this._disposeMap("__dynamic");

        this.__dynamic = {};
      },

      /**
       * Refreshes all decorator by clearing internal caches and re applying
       * aliases.
       */
      refresh: function refresh() {
        this.clear();
        var aliasManager = qx.util.AliasManager.getInstance();
        var theme = this.getTheme();

        if (theme && theme.alias) {
          for (var alias in theme.aliases) {
            aliasManager.add(alias, theme.aliases[alias]);
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
      this.clear();
    }
  });
  qx.theme.manager.Decoration.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.ValueManager": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.Font": {},
      "qx.lang.Object": {},
      "qx.bom.webfonts.WebFont": {}
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
   * Manager for font themes
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   * @ignore(qx.$$fontBootstrap)
   */
  qx.Class.define("qx.theme.manager.Font", {
    type: "singleton",
    extend: qx.util.ValueManager,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.util.ValueManager.constructor.call(this); // Grab bootstrap info

      if (qx.$$fontBootstrap) {
        this._manifestFonts = qx.$$fontBootstrap;
        delete qx.$$fontBootstrap;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** the currently selected font theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _manifestFonts: null,

      /**
       * Returns the dynamically interpreted result for the incoming value
       *
       * @param value {String} dynamically interpreted identifier
       * @return {var} return the (translated) result of the incoming value
       */
      resolveDynamic: function resolveDynamic(value) {
        var dynamic = this._dynamic;
        return value instanceof qx.bom.Font ? value : dynamic[value];
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        var cache = this._dynamic;
        var resolved = cache[value];

        if (resolved) {
          return resolved;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && theme.fonts[value]) {
          var font = this.__getFontClass(theme.fonts[value]);

          var fo = new font(); // Inject information about custom charcter set tests before we apply the
          // complete blob in one.

          if (theme.fonts[value].comparisonString) {
            fo.setComparisonString(theme.fonts[value].comparisonString);
          }

          return cache[value] = fo.set(theme.fonts[value]);
        }

        return value;
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        var cache = this._dynamic;

        if (value && (value instanceof qx.bom.Font || cache[value] !== undefined)) {
          return true;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && value && theme.fonts[value]) {
          var font = this.__getFontClass(theme.fonts[value]);

          var fo = new font(); // Inject information about custom charcter set tests before we apply the
          // complete blob in one.

          if (theme.fonts[value].comparisonString) {
            fo.setComparisonString(theme.fonts[value].comparisonString);
          }

          cache[value] = fo.set(theme.fonts[value]);
          return true;
        }

        return false;
      },

      /**
       * Checks for includes and resolves them recursively
       *
       * @param fonts {Map} all fonts of the theme
       * @param fontName {String} font name to include
       */
      __resolveInclude: function __resolveInclude(fonts, fontName) {
        if (fonts[fontName].include) {
          // get font infos out of the font theme
          var fontToInclude = fonts[fonts[fontName].include]; // delete 'include' key - not part of the merge

          fonts[fontName].include = null;
          delete fonts[fontName].include;
          fonts[fontName] = qx.lang.Object.mergeWith(fonts[fontName], fontToInclude, false);

          this.__resolveInclude(fonts, fontName);
        }
      },
      // apply method
      _applyTheme: function _applyTheme(value) {
        var dest = this._dynamic;

        for (var key in dest) {
          if (dest[key].themed) {
            dest[key].dispose();
            delete dest[key];
          }
        }

        if (value) {
          var source = this._manifestFonts ? Object.assign(value.fonts, this._manifestFonts) : value.fonts;

          for (var key in source) {
            if (source[key].include && source[source[key].include]) {
              this.__resolveInclude(source, key);
            }

            var font = this.__getFontClass(source[key]);

            var fo = new font(); // Inject information about custom charcter set tests before we apply the
            // complete blob in one.

            if (source[key].comparisonString) {
              fo.setComparisonString(source[key].comparisonString);
            }

            dest[key] = fo.set(source[key]);
            dest[key].themed = true;
          }
        }

        this._setDynamic(dest);
      },

      /**
       * Decides which Font class should be used based on the theme configuration
       *
       * @param config {Map} The font's configuration map
       * @return {Class}
       */
      __getFontClass: function __getFontClass(config) {
        if (config.sources) {
          return qx.bom.webfonts.WebFont;
        }

        return qx.bom.Font;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeMap("_dynamic");
    }
  });
  qx.theme.manager.Font.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.AliasManager": {}
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
   * Manager for icon themes
   */
  qx.Class.define("qx.theme.manager.Icon", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** currently used icon theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // property apply
      _applyTheme: function _applyTheme(value, old) {
        var aliasManager = qx.util.AliasManager.getInstance();

        if (old) {
          for (var alias in old.aliases) {
            aliasManager.remove(alias);
          }
        }

        if (value) {
          for (var alias in value.aliases) {
            aliasManager.add(alias, value.aliases[alias]);
          }
        }
      }
    }
  });
  qx.theme.manager.Icon.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.Array": {}
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
   * Manager for appearance themes
   */
  qx.Class.define("qx.theme.manager.Appearance", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__styleCache = {};
      this.__aliasMap = {};
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Currently used appearance theme */
      theme: {
        check: "Theme",
        nullable: true,
        event: "changeTheme",
        apply: "_applyTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * @lint ignoreReferenceField(__defaultStates)
       */
      __defaultStates: {},
      __styleCache: null,
      __aliasMap: null,
      // property apply
      _applyTheme: function _applyTheme() {
        // empty the caches
        this.__aliasMap = {};
        this.__styleCache = {};
      },

      /*
      ---------------------------------------------------------------------------
        THEME HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the appearance entry ID to use
       * when all aliases etc. are processed.
       *
       * @param id {String} ID to resolve.
       * @param theme {Theme} Theme to use for lookup.
       * @param defaultId {String} ID for a fallback.
       * @param chain {Array} The appearance id chain.
       * @return {String} Resolved ID
       */
      __resolveId: function __resolveId(id, theme, defaultId, chain) {
        var db = theme.appearances;
        var entry = db[id];

        if (!entry) {
          var divider = "/";
          var end = [];
          var splitted = id.split(divider);
          var chainCopy = qx.lang.Array.clone(splitted);
          var alias;

          while (!entry && splitted.length > 0) {
            end.unshift(splitted.pop());
            var baseid = splitted.join(divider);
            entry = db[baseid];

            if (entry) {
              alias = entry.alias || entry;

              if (typeof alias === "string") {
                var mapped = alias + divider + end.join(divider);
                return this.__resolveId(mapped, theme, defaultId, chainCopy);
              }
            }
          } // check if we find a control fitting in the appearance [BUG #4020]


          for (var i = 0; i < end.length - 1; i++) {
            // remove the first id, it has already been checked at startup
            end.shift(); // build a new subid without the former first id

            var subId = end.join(divider);

            var resolved = this.__resolveId(subId, theme, null, chainCopy);

            if (resolved) {
              return resolved;
            }
          } // check for the fallback


          if (defaultId != null) {
            return this.__resolveId(defaultId, theme, null, chainCopy);
          } // it's safe to output this message here since we can be sure that the return
          // value is 'null' and something went wrong with the id lookup.


          {
            if (typeof chain !== "undefined") {
              this.debug("Cannot find a matching appearance for '" + chain.join("/") + "'.");

              if (chain.length > 1) {
                this.info("Hint: This may be an issue with nested child controls and a missing alias definition in the appearance theme.");
              }
            }
          }
          return null;
        } else if (typeof entry === "string") {
          return this.__resolveId(entry, theme, defaultId, chainCopy);
        } else if (entry.include && !entry.style) {
          return this.__resolveId(entry.include, theme, defaultId, chainCopy);
        }

        return id;
      },

      /**
       * Get the result of the "state" function for a given id and states
       *
       * @param id {String} id of the appearance (e.g. "button", "label", ...)
       * @param states {Map} hash map defining the set states
       * @param theme {Theme?} appearance theme
       * @param defaultId {String} fallback id.
       * @return {Map} map of widget properties as returned by the "state" function
       */
      styleFrom: function styleFrom(id, states, theme, defaultId) {
        if (!theme) {
          theme = this.getTheme();
        } // Resolve ID


        var aliasMap = this.__aliasMap;

        if (!aliasMap[theme.name]) {
          aliasMap[theme.name] = {};
        }

        var resolved = aliasMap[theme.name][id];

        if (!resolved) {
          resolved = aliasMap[theme.name][id] = this.__resolveId(id, theme, defaultId);
        } // Query theme for ID


        var entry = theme.appearances[resolved];

        if (!entry) {
          this.warn("Missing appearance: " + id);
          return null;
        } // Entries with includes, but without style are automatically merged
        // by the ID handling in {@link #getEntry}. When there is no style method in the
        // final object the appearance is empty and null could be returned.


        if (!entry.style) {
          return null;
        } // Build an unique cache name from ID and state combination


        var unique = resolved;

        if (states) {
          // Create data fields
          var bits = entry.$$bits;

          if (!bits) {
            bits = entry.$$bits = {};
            entry.$$length = 0;
          } // Compute sum


          var sum = 0;

          for (var state in states) {
            if (!states[state]) {
              continue;
            }

            if (bits[state] == null) {
              bits[state] = 1 << entry.$$length++;
            }

            sum += bits[state];
          } // Only append the sum if it is bigger than zero


          if (sum > 0) {
            unique += ":" + sum;
          }
        } // Using cache if available


        var cache = this.__styleCache;

        if (cache[theme.name] && cache[theme.name][unique] !== undefined) {
          return cache[theme.name][unique];
        } // Fallback to default (empty) states map


        if (!states) {
          states = this.__defaultStates;
        } // Compile the appearance


        var result; // If an include or base is defined, too, we need to merge the entries

        if (entry.include || entry.base) {
          // Gather included data
          var incl;

          if (entry.include) {
            incl = this.styleFrom(entry.include, states, theme, defaultId);
          } // This process tries to insert the original data first, and
          // append the new data later, to higher prioritize the local
          // data above the included/inherited data. This is especially needed
          // for property groups or properties which includes other
          // properties when modified.


          var local = entry.style(states, incl); // Create new map

          result = {}; // Copy base data, but exclude overwritten local and included stuff

          if (entry.base) {
            var base = this.styleFrom(resolved, states, entry.base, defaultId);

            if (entry.include) {
              for (var baseIncludeKey in base) {
                if (!incl.hasOwnProperty(baseIncludeKey) && !local.hasOwnProperty(baseIncludeKey)) {
                  result[baseIncludeKey] = base[baseIncludeKey];
                }
              }
            } else {
              for (var baseKey in base) {
                if (!local.hasOwnProperty(baseKey)) {
                  result[baseKey] = base[baseKey];
                }
              }
            }
          } // Copy include data, but exclude overwritten local stuff


          if (entry.include) {
            for (var includeKey in incl) {
              if (!local.hasOwnProperty(includeKey)) {
                result[includeKey] = incl[includeKey];
              }
            }
          } // Append local data


          for (var localKey in local) {
            result[localKey] = local[localKey];
          }
        } else {
          result = entry.style(states);
        } // Cache new entry and return


        if (!cache[theme.name]) {
          cache[theme.name] = {};
        }

        return cache[theme.name][unique] = result || null;
      }
    }
  });
  qx.theme.manager.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

//
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.dev.StackTrace": {}
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
   * Theme classes contain styling information for certain aspects of the
   * graphical user interface.
   *
   * Supported themes are: colors, decorations, fonts, icons, appearances.
   * The additional meta theme allows for grouping of the individual
   * themes.
   *
   * For more details, take a look at the
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/desktop/ui_theming.html' target='_blank'>
   * documentation of the theme system in the qooxdoo manual.</a>
   */
  qx.Bootstrap.define("qx.Theme", {
    statics: {
      /*
      ---------------------------------------------------------------------------
         PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Theme config
       *
       * Example:
       * <pre class='javascript'>
       * qx.Theme.define("name",
       * {
       *   aliases : {
       *     "aliasKey" : "resourceFolderOrUri"
       *   },
       *   extend : otherTheme,
       *   include : [MMixinTheme],
       *   patch : [MMixinTheme],
       *   colors : {},
       *   decorations : {},
       *   fonts : {},
       *   widgets : {},
       *   appearances : {},
       *   meta : {},
       *   boot : function(){}
       * });
       * </pre>
       *
       * For more details, take a look at the
       * <a href='http://manual.qooxdoo.org/${qxversion}/pages/desktop/ui_theming.html' target='_blank'>
       * documentation of the theme system in the qooxdoo manual.</a>
       *
       * @param name {String} name of the mixin
       * @param config {Map} config structure
       */
      define: function define(name, config) {
        if (!config) {
          var config = {};
        }

        config.include = this.__normalizeArray(config.include);
        config.patch = this.__normalizeArray(config.patch); // Validate incoming data

        {
          this.__validateConfig(name, config);
        } // Create alias

        var theme = {
          $$type: "Theme",
          name: name,
          title: config.title,
          // Attach toString
          toString: this.genericToString
        }; // Remember extend

        if (config.extend) {
          theme.supertheme = config.extend;
        } // Assign to namespace


        theme.basename = qx.Bootstrap.createNamespace(name, theme); // Convert theme entry from Object to Function (for prototype inheritance)

        this.__convert(theme, config);

        this.__initializeAliases(theme, config); // Store class reference in global class registry


        this.$$registry[name] = theme; // Include mixin themes

        for (var i = 0, a = config.include, l = a.length; i < l; i++) {
          this.include(theme, a[i]);
        }

        for (var i = 0, a = config.patch, l = a.length; i < l; i++) {
          this.patch(theme, a[i]);
        } // Run boot code


        if (config.boot) {
          config.boot();
        }
      },

      /**
       * Normalize an object to an array
       *
       * @param objectOrArray {Object|Array} Either an object that is to be
       *   normalized to an array, or an array, which is just passed through
       *
       * @return {Array} Either an array that has the original object as its
       *   single item, or the original array itself
       */
      __normalizeArray: function __normalizeArray(objectOrArray) {
        if (!objectOrArray) {
          return [];
        }

        if (qx.Bootstrap.isArray(objectOrArray)) {
          return objectOrArray;
        } else {
          return [objectOrArray];
        }
      },

      /**
       * Initialize alias inheritance
       *
       * @param theme {Map} The theme
       * @param config {Map} config structure
       */
      __initializeAliases: function __initializeAliases(theme, config) {
        var aliases = config.aliases || {};

        if (config.extend && config.extend.aliases) {
          qx.Bootstrap.objectMergeWith(aliases, config.extend.aliases, false);
        }

        theme.aliases = aliases;
      },

      /**
       * Return a map of all known themes
       *
       * @return {Map} known themes
       */
      getAll: function getAll() {
        return this.$$registry;
      },

      /**
       * Returns a theme by name
       *
       * @param name {String} theme name to check
       * @return {Object ? void} theme object
       */
      getByName: function getByName(name) {
        return this.$$registry[name];
      },

      /**
       * Determine if theme exists
       *
       * @param name {String} theme name to check
       * @return {Boolean} true if theme exists
       */
      isDefined: function isDefined(name) {
        return this.getByName(name) !== undefined;
      },

      /**
       * Determine the number of themes which are defined
       *
       * @return {Number} the number of classes
       */
      getTotalNumber: function getTotalNumber() {
        return qx.Bootstrap.objectGetLength(this.$$registry);
      },

      /*
      ---------------------------------------------------------------------------
         PRIVATE/INTERNAL API
      ---------------------------------------------------------------------------
      */

      /**
       * This method will be attached to all themes to return
       * a nice identifier for them.
       *
       * @internal
       * @return {String} The interface identifier
       */
      genericToString: function genericToString() {
        return "[Theme " + this.name + "]";
      },

      /**
       * Extract the inheritable key (could be only one)
       *
       * @param config {Map} The map from where to extract the key
       * @return {String} the key which was found
       */
      __extractType: function __extractType(config) {
        for (var i = 0, keys = this.__inheritableKeys, l = keys.length; i < l; i++) {
          if (config[keys[i]]) {
            return keys[i];
          }
        }
      },

      /**
       * Convert existing entry to a prototype based inheritance function
       *
       * @param theme {Theme} newly created theme object
       * @param config {Map} incoming theme configuration
       */
      __convert: function __convert(theme, config) {
        var type = this.__extractType(config); // Use theme key from extended theme if own one is not available


        if (config.extend && !type) {
          type = config.extend.type;
        } // Save theme type


        theme.type = type || "other"; // Create pseudo class

        var clazz = function clazz() {}; // Process extend config


        if (config.extend) {
          clazz.prototype = new config.extend.$$clazz();
        }

        var target = clazz.prototype;
        var source = config[type]; // Copy entries to prototype

        for (var id in source) {
          target[id] = source[id]; // Appearance themes only:
          // Convert base flag to class reference (needed for mixin support)

          if (target[id].base) {
            {
              if (!config.extend) {
                throw new Error("Found base flag in entry '" + id + "' of theme '" + config.name + "'. Base flags are not allowed for themes without a valid super theme!");
              }
            }
            target[id].base = config.extend;
          }
        } // store pseudo class


        theme.$$clazz = clazz; // and create instance under the old key

        theme[type] = new clazz();
      },

      /** @type {Map} Internal theme registry */
      $$registry: {},

      /** @type {Array} Keys which support inheritance */
      __inheritableKeys: ["colors", "borders", "decorations", "fonts", "icons", "widgets", "appearances", "meta"],

      /** @type {Map} allowed keys in theme definition */
      __allowedKeys: {
        "title": "string",
        // String
        "aliases": "object",
        // Map
        "type": "string",
        // String
        "extend": "object",
        // Theme
        "colors": "object",
        // Map
        "borders": "object",
        // Map
        "decorations": "object",
        // Map
        "fonts": "object",
        // Map
        "icons": "object",
        // Map
        "widgets": "object",
        // Map
        "appearances": "object",
        // Map
        "meta": "object",
        // Map
        "include": "object",
        // Array
        "patch": "object",
        // Array
        "boot": "function" // Function

      },

      /** @type {Map} allowed keys inside a meta theme block */
      __metaKeys: {
        "color": "object",
        "border": "object",
        "decoration": "object",
        "font": "object",
        "icon": "object",
        "appearance": "object",
        "widget": "object"
      },

      /**
       * Validates incoming configuration and checks keys and values
       *
       * @signature function(name, config)
       * @param name {String} The name of the class
       * @param config {Map} Configuration map
       * @throws {Error} if the given config is not valid (e.g. wrong key or wrong key value)
       */
      __validateConfig: function __validateConfig(name, config) {
        var allowed = this.__allowedKeys;

        for (var key in config) {
          if (allowed[key] === undefined) {
            throw new Error('The configuration key "' + key + '" in theme "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value is undefined/null!');
          }

          if (allowed[key] !== null && _typeof(config[key]) !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" in theme "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        } // Validate maps


        var maps = ["colors", "borders", "decorations", "fonts", "icons", "widgets", "appearances", "meta"];

        for (var i = 0, l = maps.length; i < l; i++) {
          var key = maps[i];

          if (config[key] !== undefined && (config[key] instanceof Array || config[key] instanceof RegExp || config[key] instanceof Date || config[key].classname !== undefined)) {
            throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value needs to be a map!');
          }
        } // Check conflicts (detect number ...)


        var counter = 0;

        for (var i = 0, l = maps.length; i < l; i++) {
          var key = maps[i];

          if (config[key]) {
            counter++;
          }

          if (counter > 1) {
            throw new Error("You can only define one theme category per file! Invalid theme: " + name);
          }
        } // Validate meta


        if (config.meta) {
          var value;

          for (var key in config.meta) {
            value = config.meta[key];

            if (this.__metaKeys[key] === undefined) {
              throw new Error('The key "' + key + '" is not allowed inside a meta theme block.');
            }

            if (_typeof(value) !== this.__metaKeys[key]) {
              throw new Error('The type of the key "' + key + '" inside the meta block is wrong.');
            }

            if (!(_typeof(value) === "object" && value !== null && value.$$type === "Theme")) {
              throw new Error('The content of a meta theme must reference to other themes. The value for "' + key + '" in theme "' + name + '" is invalid: ' + value);
            }
          }
        } // Validate extend


        if (config.extend && config.extend.$$type !== "Theme") {
          throw new Error('Invalid extend in theme "' + name + '": ' + config.extend);
        } // Validate include


        if (config.include) {
          for (var i = 0, l = config.include.length; i < l; i++) {
            if (typeof config.include[i] == "undefined" || config.include[i].$$type !== "Theme") {
              throw new Error('Invalid include in theme "' + name + '": ' + config.include[i]);
            }
          }
        } // Validate patch


        if (config.patch) {
          for (var i = 0, l = config.patch.length; i < l; i++) {
            if (typeof config.patch[i] === "undefined" || config.patch[i].$$type !== "Theme") {
              throw new Error('Invalid patch in theme "' + name + '": ' + config.patch[i]);
            }
          }
        }
      },

      /**
       * Include all keys of the given mixin theme into the theme. The mixin may
       * include keys which are already defined in the target theme. Existing
       * features of equal name will be overwritten.
       *
       * @param theme {Theme} An existing theme which should be modified by including the mixin theme.
       * @param mixinTheme {Theme} The theme to be included.
       */
      patch: function patch(theme, mixinTheme) {
        this.__checkForInvalidTheme(mixinTheme);

        var type = this.__extractType(mixinTheme);

        if (type !== this.__extractType(theme)) {
          throw new Error("The mixins '" + theme.name + "' are not compatible '" + mixinTheme.name + "'!");
        }

        var source = mixinTheme[type];
        var target = theme.$$clazz.prototype;

        for (var key in source) {
          target[key] = source[key];
        }
      },

      /**
       * Include all keys of the given mixin theme into the theme. If the
       * mixin includes any keys that are already available in the
       * class, they will be silently ignored. Use the {@link #patch} method
       * if you need to overwrite keys in the current class.
       *
       * @param theme {Theme} An existing theme which should be modified by including the mixin theme.
       * @param mixinTheme {Theme} The theme to be included.
       */
      include: function include(theme, mixinTheme) {
        this.__checkForInvalidTheme(mixinTheme);

        var type = mixinTheme.type;

        if (type !== theme.type) {
          throw new Error("The mixins '" + theme.name + "' are not compatible '" + mixinTheme.name + "'!");
        }

        var source = mixinTheme[type];
        var target = theme.$$clazz.prototype;

        for (var key in source) {
          //Skip keys already present
          if (target[key] !== undefined) {
            continue;
          }

          target[key] = source[key];
        }
      },

      /**
       * Helper method to check for an invalid theme
       *
       * @param mixinTheme {qx.Theme?null} theme to check
       * @throws {Error} if the theme is not valid
       */
      __checkForInvalidTheme: function __checkForInvalidTheme(mixinTheme) {
        if (typeof mixinTheme === "undefined" || mixinTheme == null) {
          var errorObj = new Error("Mixin theme is not a valid theme!");
          {
            var stackTrace = qx.dev.StackTrace.getStackTraceFromError(errorObj);
            qx.Bootstrap.error(this, stackTrace);
          }
          throw errorObj;
        }
      }
    }
  });
  qx.Theme.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {},
      "qx.event.GlobalError": {
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
  
  ************************************************************************ */

  /**
   * Global timer support.
   *
   * This class can be used to periodically fire an event. This event can be
   * used to simulate e.g. a background task. The static method
   * {@link #once} is a special case. It will call a function deferred after a
   * given timeout.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.Timer", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param interval {Number} initial interval in milliseconds of the timer.
     */
    construct: function construct(interval) {
      qx.core.Object.constructor.call(this);

      if (interval != null) {
        this.setInterval(interval);
      } // don't use qx.lang.Function.bind because this function would add a
      // disposed check, which could break the functionality. In IE the handler
      // may get called after "clearInterval" (i.e. after the timer is disposed)
      // and we must be able to handle this.


      var self = this;

      this.__oninterval = function () {
        self._oninterval.call(self);
      };
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** This event if fired each time the interval time has elapsed */
      "interval": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Start a function after a given timeout.
       *
       * @param func {Function} Function to call
       * @param obj {Object} context (this), the function is called with
       * @param timeout {Number} Number of milliseconds to wait before the
       *   function is called.
       * @return {qx.event.Timer} The timer object used for the timeout. This
       *    object can be used to cancel the timeout. Note that the timer is
       *    only valid until the timer has been executed.
       */
      once: function once(func, obj, timeout) {
        {
          // check the given parameter
          qx.core.Assert.assertFunction(func, "func is not a function");
          qx.core.Assert.assertNotUndefined(timeout, "No timeout given");
        } // Create time instance

        var timer = new qx.event.Timer(timeout); // Bug #3481: append original function to timer instance so it can be
        // read by a debugger

        timer.__onceFunc = func; // Add event listener to interval

        timer.addListener("interval", function (e) {
          timer.stop();
          func.call(obj, e);
          delete timer.__onceFunc;
          timer.dispose();
          obj = null;
        }, obj); // Directly start timer

        timer.start();
        return timer;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * With the enabled property the Timer can be started and suspended.
       * Setting it to "true" is equivalent to {@link #start}, setting it
       * to "false" is equivalent to {@link #stop}.
       */
      enabled: {
        init: false,
        check: "Boolean",
        apply: "_applyEnabled"
      },

      /**
       * Time in milliseconds between two callback calls.
       * This property can be set to modify the interval of
       * a running timer.
       */
      interval: {
        check: "Integer",
        init: 1000,
        apply: "_applyInterval"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __intervalHandler: null,
      __oninterval: null,

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */

      /**
       * Apply the interval of the timer.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyInterval: function _applyInterval(value, old) {
        if (this.getEnabled()) {
          this.restart();
        }
      },

      /**
       * Apply the enabled state of the timer.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyEnabled: function _applyEnabled(value, old) {
        if (old) {
          window.clearInterval(this.__intervalHandler);
          this.__intervalHandler = null;
        } else if (value) {
          this.__intervalHandler = window.setInterval(this.__oninterval, this.getInterval());
        }
      },

      /*
      ---------------------------------------------------------------------------
        USER-ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Start the timer
       *
       */
      start: function start() {
        this.setEnabled(true);
      },

      /**
       * Start the timer with a given interval
       *
       * @param interval {Integer} Time in milliseconds between two callback calls.
       */
      startWith: function startWith(interval) {
        this.setInterval(interval);
        this.start();
      },

      /**
       * Stop the timer.
       *
       */
      stop: function stop() {
        this.setEnabled(false);
      },

      /**
       * Restart the timer.
       * This makes it possible to change the interval of a running timer.
       *
       */
      restart: function restart() {
        this.stop();
        this.start();
      },

      /**
       * Restart the timer. with a given interval.
       *
       * @param interval {Integer} Time in milliseconds between two callback calls.
       */
      restartWith: function restartWith(interval) {
        this.stop();
        this.startWith(interval);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT-MAPPER
      ---------------------------------------------------------------------------
      */

      /**
       * timer callback
       *
       * @signature function()
       */
      _oninterval: qx.event.GlobalError.observeMethod(function () {
        if (this.$$disposed) {
          return;
        }

        if (this.getEnabled()) {
          this.fireEvent("interval");
        }
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__intervalHandler) {
        window.clearInterval(this.__intervalHandler);
      }

      this.__intervalHandler = this.__oninterval = null;
    }
  });
  qx.event.Timer.$$dbClassInfo = $$dbClassInfo;
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin exposes all methods to manage the layout manager of a widget.
   * It can only be included into instances of {@link qx.ui.core.Widget}.
   *
   * To optimize the method calls the including widget should call the method
   * {@link #remap} in its defer function. This will map the protected
   * methods to the public ones and save one method call for each function.
   */
  qx.Mixin.define("qx.ui.core.MLayoutHandling", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set a layout manager for the widget. A a layout manager can only be connected
       * with one widget. Reset the connection with a previous widget first, if you
       * like to use it in another widget instead.
       *
       * @param layout {qx.ui.layout.Abstract} The new layout or
       *     <code>null</code> to reset the layout.
       */
      setLayout: function setLayout(layout) {
        this._setLayout(layout);
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      getLayout: function getLayout() {
        return this._getLayout();
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Mapping of protected methods to public.
       * This omits an additional function call when using these methods. Call
       * this methods in the defer block of the including class.
       *
       * @param members {Map} The including classes members map
       */
      remap: function remap(members) {
        members.getLayout = members._getLayout;
        members.setLayout = members._setLayout;
      }
    }
  });
  qx.ui.core.MLayoutHandling.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MChildrenHandling": {
        "defer": "runtime",
        "require": true
      },
      "qx.ui.core.MLayoutHandling": {
        "defer": "runtime",
        "require": true
      },
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
   * The Composite is a generic container widget.
   *
   * It exposes all methods to set layouts and to manage child widgets
   * as public methods. You must configure this widget with a layout manager to
   * define the way the widget's children are positioned.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create the composite
   *   var composite = new qx.ui.container.Composite()
   *
   *   // configure it with a horizontal box layout with a spacing of '5'
   *   composite.setLayout(new qx.ui.layout.HBox(5));
   *
   *   // add some children
   *   composite.add(new qx.ui.basic.Label("Name: "));
   *   composite.add(new qx.ui.form.TextField());
   *
   *   this.getRoot().add(composite);
   * </pre>
   *
   * This example horizontally groups a label and text field by using a
   * Composite configured with a horizontal box layout as a container.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/composite.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.Composite", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MChildrenHandling, qx.ui.core.MLayoutHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param layout {qx.ui.layout.Abstract} A layout instance to use to
     *   place widgets on the screen.
     */
    construct: function construct(layout) {
      qx.ui.core.Widget.constructor.call(this);

      if (layout != null) {
        this._setLayout(layout);
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * This event is fired after a child widget was added to this widget. The
       * {@link qx.event.type.Data#getData} method of the event returns the
       * added child.
       */
      addChildWidget: "qx.event.type.Data",

      /**
       * This event is fired after a child widget has been removed from this widget.
       * The {@link qx.event.type.Data#getData} method of the event returns the
       * removed child.
       */
      removeChildWidget: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _afterAddChild: function _afterAddChild(child) {
        this.fireNonBubblingEvent("addChildWidget", qx.event.type.Data, [child]);
      },
      // overridden
      _afterRemoveChild: function _afterRemoveChild(child) {
        this.fireNonBubblingEvent("removeChildWidget", qx.event.type.Data, [child]);
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics, members) {
      qx.ui.core.MChildrenHandling.remap(members);
      qx.ui.core.MLayoutHandling.remap(members);
    }
  });
  qx.ui.container.Composite.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Function": {},
      "qx.event.Idle": {},
      "qx.bom.element.Location": {},
      "qx.util.placement.Placement": {}
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
       * Martin Wittemann (martinwittemann)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Methods to place popup like widgets to other widgets, points,
   * pointer event coordinates, etc.
   */
  qx.Mixin.define("qx.ui.core.MPlacement", {
    statics: {
      __visible: null,
      __direction: "left",

      /**
       * Set the always visible element. If an element is set, the
       * {@link #moveTo} method takes care of every move and tries not to cover
       * the given element with a movable widget like a popup or context menu.
       *
       * @param elem {qx.ui.core.Widget} The widget which should always be visible.
       */
      setVisibleElement: function setVisibleElement(elem) {
        this.__visible = elem;
      },

      /**
       * Returns the given always visible element. See {@link #setVisibleElement}
       * for more details.
       *
       * @return {qx.ui.core.Widget|null} The given widget.
       */
      getVisibleElement: function getVisibleElement() {
        return this.__visible;
      },

      /**
       * Set the move direction for an element which hides always visible element.
       * The value has only an effect when the {@link #setVisibleElement} is set.
       *
       * @param direction {String} The direction <code>left</code> or <code>top</code>.
       */
      setMoveDirection: function setMoveDirection(direction) {
        if (direction === "top" || direction === "left") {
          this.__direction = direction;
        } else {
          throw new Error("Invalid value for the parameter 'direction' [qx.ui.core.MPlacement.setMoveDirection()], the value was '" + direction + "' " + "but 'top' or 'left' are allowed.");
        }
      },

      /**
       * Returns the move direction for an element which hides always visible element.
       * See {@link #setMoveDirection} for more details.
       *
       * @return {String} The move direction.
       */
      getMoveDirection: function getMoveDirection() {
        return this.__direction;
      }
    },
    properties: {
      /**
       * Position of the aligned object in relation to the opener.
       *
       * Please note than changes to this property are only applied
       * when re-aligning the widget.
       *
       * The first part of the value is the edge to attach to. The second
       * part the alignment of the orthogonal edge after the widget
       * has been attached.
       *
       * The default value "bottom-left" for example means that the
       * widget should be shown directly under the given target and
       * then should be aligned to be left edge:
       *
       * <pre>
       * +--------+
       * | target |
       * +--------+
       * +-------------+
       * |   widget    |
       * +-------------+
       * </pre>
       */
      position: {
        check: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right", "left-top", "left-middle", "left-bottom", "right-top", "right-middle", "right-bottom"],
        init: "bottom-left",
        themeable: true
      },

      /**
       * Whether the widget should be placed relative to an other widget or to
       * the pointer.
       */
      placeMethod: {
        check: ["widget", "pointer"],
        init: "pointer",
        themeable: true
      },

      /** Whether the widget should moved using DOM methods. */
      domMove: {
        check: "Boolean",
        init: false
      },

      /**
       * Selects the algorithm to place the widget horizontally. <code>direct</code>
       * uses {@link qx.util.placement.DirectAxis}, <code>keep-align</code>
       * uses {@link qx.util.placement.KeepAlignAxis} and <code>best-fit</code>
       * uses {@link qx.util.placement.BestFitAxis}.
       */
      placementModeX: {
        check: ["direct", "keep-align", "best-fit"],
        init: "keep-align",
        themeable: true
      },

      /**
       * Selects the algorithm to place the widget vertically. <code>direct</code>
       * uses {@link qx.util.placement.DirectAxis}, <code>keep-align</code>
       * uses {@link qx.util.placement.KeepAlignAxis} and <code>best-fit</code>
       * uses {@link qx.util.placement.BestFitAxis}.
       */
      placementModeY: {
        check: ["direct", "keep-align", "best-fit"],
        init: "keep-align",
        themeable: true
      },

      /** Left offset of the pointer (in pixel) */
      offsetLeft: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Top offset of the pointer (in pixel) */
      offsetTop: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Right offset of the pointer (in pixel) */
      offsetRight: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Bottom offset of the pointer (in pixel) */
      offsetBottom: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Offsets in one group */
      offset: {
        group: ["offsetTop", "offsetRight", "offsetBottom", "offsetLeft"],
        mode: "shorthand",
        themeable: true
      }
    },
    members: {
      __ptwLiveUpdater: null,
      __ptwLiveDisappearListener: null,
      __ptwLiveUpdateDisappearListener: null,

      /**
       * Returns the location data like {qx.bom.element.Location#get} does,
       * but does not rely on DOM elements coordinates to be rendered. Instead,
       * this method works with the available layout data available in the moment
       * when it is executed.
       * This works best when called in some type of <code>resize</code> or
       * <code>move</code> event which are supported by all widgets out of the
       * box.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Map|null} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the widget relative coords the document.
       */
      getLayoutLocation: function getLayoutLocation(widget) {
        // Use post-layout dimensions
        // which do not rely on the final rendered DOM element
        var insets, bounds, left, top; // Add bounds of the widget itself

        bounds = widget.getBounds();

        if (!bounds) {
          return null;
        }

        left = bounds.left;
        top = bounds.top; // Keep size to protect it for loop

        var size = bounds; // Now loop up with parents until reaching the root

        widget = widget.getLayoutParent();

        while (widget && !widget.isRootWidget()) {
          // Add coordinates
          bounds = widget.getBounds();
          left += bounds.left;
          top += bounds.top; // Add insets

          insets = widget.getInsets();
          left += insets.left;
          top += insets.top; // Next parent

          widget = widget.getLayoutParent();
        } // Add the rendered location of the root widget


        if (widget && widget.isRootWidget()) {
          var rootCoords = widget.getContentLocation();

          if (rootCoords) {
            left += rootCoords.left;
            top += rootCoords.top;
          }
        } // Build location data


        return {
          left: left,
          top: top,
          right: left + size.width,
          bottom: top + size.height
        };
      },

      /**
       * Sets the position. Uses low-level, high-performance DOM
       * methods when the property {@link #domMove} is enabled.
       * Checks if an always visible element is set and moves the widget to not
       * overlay the always visible widget if possible. The algorithm tries to
       * move the widget as far left as necessary but not of the screen.
       * ({@link #setVisibleElement})
       *
       * @param left {Integer} The left position
       * @param top {Integer} The top position
       */
      moveTo: function moveTo(left, top) {
        var visible = qx.ui.core.MPlacement.getVisibleElement(); // if we have an always visible element

        if (visible) {
          var bounds = this.getBounds();
          var elemLocation = visible.getContentLocation(); // if we have bounds for both elements

          if (bounds && elemLocation) {
            var bottom = top + bounds.height;
            var right = left + bounds.width; // horizontal placement wrong
            // each number is for the upcomming check (huge element is
            // the always visible, eleme prefixed)
            //     | 3 |
            //   ---------
            //   | |---| |
            //   |       |
            // --|-|   |-|--
            // 1 | |   | | 2
            // --|-|   |-|--
            //   |       |
            //   | |---| |
            //   ---------
            //     | 4 |

            if (right > elemLocation.left && left < elemLocation.right && bottom > elemLocation.top && top < elemLocation.bottom) {
              var direction = qx.ui.core.MPlacement.getMoveDirection();

              if (direction === "left") {
                left = Math.max(elemLocation.left - bounds.width, 0);
              } else {
                top = Math.max(elemLocation.top - bounds.height, 0);
              }
            }
          }
        }

        if (this.getDomMove()) {
          this.setDomPosition(left, top);
        } else {
          this.setLayoutProperties({
            left: left,
            top: top
          });
        }
      },

      /**
       * Places the widget to another (at least laid out) widget. The DOM
       * element is not needed, but the bounds are needed to compute the
       * location of the widget to align to.
       *
       * @param target {qx.ui.core.Widget} Target coords align coords
       * @param liveupdate {Boolean} Flag indicating if the position of the
       * widget should be checked and corrected automatically.
       * @return {Boolean} true if the widget was successfully placed
       */
      placeToWidget: function placeToWidget(target, liveupdate) {
        // Use the idle event to make sure that the widget's position gets
        // updated automatically (e.g. the widget gets scrolled).
        if (liveupdate) {
          this.__cleanupFromLastPlaceToWidgetLiveUpdate(); // Bind target and livupdate to placeToWidget


          this.__ptwLiveUpdater = qx.lang.Function.bind(this.placeToWidget, this, target, false);
          qx.event.Idle.getInstance().addListener("interval", this.__ptwLiveUpdater); // Remove the listener when the element disappears.

          this.__ptwLiveUpdateDisappearListener = function () {
            this.__cleanupFromLastPlaceToWidgetLiveUpdate();
          };

          this.addListener("disappear", this.__ptwLiveUpdateDisappearListener, this);
        }

        var coords = target.getContentLocation() || this.getLayoutLocation(target);

        if (coords != null) {
          this._place(coords);

          return true;
        } else {
          return false;
        }
      },

      /**
       * Removes all resources allocated by the last run of placeToWidget with liveupdate=true
       */
      __cleanupFromLastPlaceToWidgetLiveUpdate: function __cleanupFromLastPlaceToWidgetLiveUpdate() {
        if (this.__ptwLiveUpdater) {
          qx.event.Idle.getInstance().removeListener("interval", this.__ptwLiveUpdater);
          this.__ptwLiveUpdater = null;
        }

        if (this.__ptwLiveUpdateDisappearListener) {
          this.removeListener("disappear", this.__ptwLiveUpdateDisappearListener, this);
          this.__ptwLiveUpdateDisappearListener = null;
        }
      },

      /**
       * Places the widget to the pointer position.
       *
       * @param event {qx.event.type.Pointer} Pointer event to align to
       */
      placeToPointer: function placeToPointer(event) {
        var left = Math.round(event.getDocumentLeft());
        var top = Math.round(event.getDocumentTop());
        var coords = {
          left: left,
          top: top,
          right: left,
          bottom: top
        };

        this._place(coords);
      },

      /**
       * Places the widget to any (rendered) DOM element.
       *
       * @param elem {Element} DOM element to align to
       * @param liveupdate {Boolean} Flag indicating if the position of the
       * widget should be checked and corrected automatically.
       */
      placeToElement: function placeToElement(elem, liveupdate) {
        var location = qx.bom.element.Location.get(elem);
        var coords = {
          left: location.left,
          top: location.top,
          right: location.left + elem.offsetWidth,
          bottom: location.top + elem.offsetHeight
        }; // Use the idle event to make sure that the widget's position gets
        // updated automatically (e.g. the widget gets scrolled).

        if (liveupdate) {
          // Bind target and livupdate to placeToWidget
          this.__ptwLiveUpdater = qx.lang.Function.bind(this.placeToElement, this, elem, false);
          qx.event.Idle.getInstance().addListener("interval", this.__ptwLiveUpdater); // Remove the listener when the element disappears.

          this.addListener("disappear", function () {
            if (this.__ptwLiveUpdater) {
              qx.event.Idle.getInstance().removeListener("interval", this.__ptwLiveUpdater);
              this.__ptwLiveUpdater = null;
            }
          }, this);
        }

        this._place(coords);
      },

      /**
       * Places the widget in relation to the given point
       *
       * @param point {Map} Coordinate of any point with the keys <code>left</code>
       *   and <code>top</code>.
       */
      placeToPoint: function placeToPoint(point) {
        var coords = {
          left: point.left,
          top: point.top,
          right: point.left,
          bottom: point.top
        };

        this._place(coords);
      },

      /**
       * Returns the placement offsets as a map
       *
       * @return {Map} The placement offsets
       */
      _getPlacementOffsets: function _getPlacementOffsets() {
        return {
          left: this.getOffsetLeft(),
          top: this.getOffsetTop(),
          right: this.getOffsetRight(),
          bottom: this.getOffsetBottom()
        };
      },

      /**
       * Get the size of the object to place. The callback will be called with
       * the size as first argument. This methods works asynchronously.
       *
       * The size of the object to place is the size of the widget. If a widget
       * including this mixin needs a different size it can implement the method
       * <code>_computePlacementSize</code>, which returns the size.
       *
       *  @param callback {Function} This function will be called with the size as
       *    first argument
       */
      __getPlacementSize: function __getPlacementSize(callback) {
        var size = null;

        if (this._computePlacementSize) {
          var size = this._computePlacementSize();
        } else if (this.isVisible()) {
          var size = this.getBounds();
        }

        if (size == null) {
          this.addListenerOnce("appear", function () {
            this.__getPlacementSize(callback);
          }, this);
        } else {
          callback.call(this, size);
        }
      },

      /**
       * Internal method to read specific this properties and
       * apply the results to the this afterwards.
       *
       * @param coords {Map} Location of the object to align the this to. This map
       *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
       *   and <code>bottom</code>.
       */
      _place: function _place(coords) {
        this.__getPlacementSize(function (size) {
          var result = qx.util.placement.Placement.compute(size, this.getLayoutParent().getBounds(), coords, this._getPlacementOffsets(), this.getPosition(), this.getPlacementModeX(), this.getPlacementModeY()); // state handling for tooltips e.g.

          this.removeState("placementLeft");
          this.removeState("placementRight");
          this.addState(coords.left < result.left ? "placementRight" : "placementLeft");
          this.moveTo(result.left, result.top);
        });
      }
    },
    destruct: function destruct() {
      this.__cleanupFromLastPlaceToWidgetLiveUpdate();
    }
  });
  qx.ui.core.MPlacement.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.Composite": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MPlacement": {
        "require": true
      },
      "qx.core.Init": {},
      "qx.ui.popup.Manager": {}
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
   * Popups are widgets, which can be placed on top of the application.
   * They are automatically added to the application root.
   *
   * Popups are used to display menus, the lists of combo or select boxes,
   * tooltips, etc.
   */
  qx.Class.define("qx.ui.popup.Popup", {
    extend: qx.ui.container.Composite,
    include: qx.ui.core.MPlacement,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct(layout) {
      qx.ui.container.Composite.constructor.call(this, layout); // Initialize visibility

      this.initVisibility();
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
        init: "popup"
      },
      // overridden
      visibility: {
        refine: true,
        init: "excluded"
      },

      /**
       * Whether to let the system decide when to hide the popup. Setting
       * this to false gives you better control but it also requires you
       * to handle the closing of the popup.
       */
      autoHide: {
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
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      show: function show() {
        // Lazy adding to the root element, otherwise it could happen that
        // IE scrolls automatically to top, see bug #3955 for details.
        if (this.getLayoutParent() == null) {
          // Automatically add to application's root
          qx.core.Init.getApplication().getRoot().add(this);
        }

        qx.ui.popup.Popup.prototype.show.base.call(this);
      },
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.popup.Popup.prototype._applyVisibility.base.call(this, value, old);

        var mgr = qx.ui.popup.Manager.getInstance();
        value === "visible" ? mgr.add(this) : mgr.remove(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (!qx.ui.popup.Manager.getInstance().isDisposed()) {
        qx.ui.popup.Manager.getInstance().remove(this);
      }
    }
  });
  qx.ui.popup.Popup.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.popup.Popup": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.basic.Atom": {},
      "qx.ui.basic.Image": {}
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
   * A Tooltip provides additional information for widgets when the user hovers
   * over a widget.
   *
   * @childControl atom {qx.ui.basic.Atom} atom widget which represents the content of the tooltip
   */
  qx.Class.define("qx.ui.tooltip.ToolTip", {
    extend: qx.ui.popup.Popup,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} label of the tooltip
     * @param icon {String?null} Icon URL of the tooltip
     */
    construct: function construct(label, icon) {
      qx.ui.popup.Popup.constructor.call(this); // Use static layout

      this.setLayout(new qx.ui.layout.HBox());

      this._createChildControl("arrow"); // Integrate atom


      this._createChildControl("atom"); // Initialize properties


      if (label != null) {
        this.setLabel(label);
      }

      if (icon != null) {
        this.setIcon(icon);
      }

      this.addListener("pointerover", this._onPointerOver, this);
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
        init: "tooltip"
      },

      /** Interval after the tooltip is shown (in milliseconds) */
      showTimeout: {
        check: "Integer",
        init: 700,
        themeable: true
      },

      /** Interval after the tooltip is hidden (in milliseconds) */
      hideTimeout: {
        check: "Integer",
        init: 4000,
        themeable: true
      },

      /** The label/caption/text of the ToolTip's atom. */
      label: {
        check: "String",
        nullable: true,
        apply: "_applyLabel"
      },

      /**
       * Any URI String supported by qx.ui.basic.Image to display an icon in
       * ToolTips's atom.
       */
      icon: {
        check: "String",
        nullable: true,
        apply: "_applyIcon",
        themeable: true
      },

      /**
       * Switches between rich HTML and text content. The text mode
       * (<code>false</code>) supports advanced features like ellipsis when the
       * available space is not enough. HTML mode (<code>true</code>) supports
       * multi-line content and all the markup features of HTML content.
       */
      rich: {
        check: "Boolean",
        init: false,
        apply: "_applyRich"
      },

      /** Widget that opened the tooltip */
      opener: {
        check: "qx.ui.core.Widget",
        nullable: true
      },

      /** Position of the arrow pointing towards the opening widget **/
      arrowPosition: {
        check: ["left", "right"],
        init: "left",
        themeable: true,
        apply: "_applyArrowPosition"
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
        placementLeft: true
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "atom":
            control = new qx.ui.basic.Atom();

            this._add(control, {
              flex: 1
            });

            break;

          case "arrow":
            control = new qx.ui.basic.Image();

            this._add(control);

        }

        return control || qx.ui.tooltip.ToolTip.prototype._createChildControlImpl.base.call(this, id);
      },

      /**
       * Listener method for "pointerover" event
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onPointerOver: function _onPointerOver(e) {//this.hide();
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        var atom = this.getChildControl("atom");
        value == null ? atom.resetIcon() : atom.setIcon(value);
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        var atom = this.getChildControl("atom");
        value == null ? atom.resetLabel() : atom.setLabel(value);
      },
      // property apply
      _applyRich: function _applyRich(value, old) {
        var atom = this.getChildControl("atom");
        atom.setRich(value);
      },
      // property apply
      _applyArrowPosition: function _applyArrowPosition(value, old) {
        this._getLayout().setReversed(value == "left");
      }
    }
  });
  qx.ui.tooltip.ToolTip.$$dbClassInfo = $$dbClassInfo;
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
   * Form interface for all form widgets. It includes the API for enabled,
   * required and valid states.
   */
  qx.Interface.define("qx.ui.form.IForm", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the enabled state was modified */
      "changeEnabled": "qx.event.type.Data",

      /** Fired when the valid state was modified */
      "changeValid": "qx.event.type.Data",

      /** Fired when the invalidMessage was modified */
      "changeInvalidMessage": "qx.event.type.Data",

      /** Fired when the required was modified */
      "changeRequired": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        ENABLED PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Set the enabled state of the widget.
       *
       * @param enabled {Boolean} The enabled state.
       */
      setEnabled: function setEnabled(enabled) {
        return arguments.length == 1;
      },

      /**
       * Return the current set enabled state.
       *
       * @return {Boolean} If the widget is enabled.
       */
      getEnabled: function getEnabled() {},

      /*
      ---------------------------------------------------------------------------
        REQUIRED PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the required state of a widget.
       *
       * @param required {Boolean} A flag signaling if the widget is required.
       */
      setRequired: function setRequired(required) {
        return arguments.length == 1;
      },

      /**
       * Return the current required state of the widget.
       *
       * @return {Boolean} True, if the widget is required.
       */
      getRequired: function getRequired() {},

      /*
      ---------------------------------------------------------------------------
        VALID PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the valid state of the widget.
       *
       * @param valid {Boolean} The valid state of the widget.
       */
      setValid: function setValid(valid) {
        return arguments.length == 1;
      },

      /**
       * Returns the valid state of the widget.
       *
       * @return {Boolean} If the state of the widget is valid.
       */
      getValid: function getValid() {},

      /*
      ---------------------------------------------------------------------------
        INVALID MESSAGE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the invalid message of the widget.
       *
       * @param message {String} The invalid message.
       */
      setInvalidMessage: function setInvalidMessage(message) {
        return arguments.length == 1;
      },

      /**
       * Returns the invalid message of the widget.
       *
       * @return {String} The current set message.
       */
      getInvalidMessage: function getInvalidMessage() {},

      /*
      ---------------------------------------------------------------------------
        REQUIRED INVALID MESSAGE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the invalid message if required of the widget.
       *
       * @param message {String} The invalid message.
       */
      setRequiredInvalidMessage: function setRequiredInvalidMessage(message) {
        return arguments.length == 1;
      },

      /**
       * Returns the invalid message if required of the widget.
       *
       * @return {String} The current set message.
       */
      getRequiredInvalidMessage: function getRequiredInvalidMessage() {}
    }
  });
  qx.ui.form.IForm.$$dbClassInfo = $$dbClassInfo;
})();

//
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["html.stylesheet.createstylesheet", "html.stylesheet.insertrule", "html.stylesheet.deleterule", "html.stylesheet.addimport", "html.stylesheet.removeimport"],
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
   * This class contains checks related to Stylesheet objects.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Stylesheet", {
    statics: {
      /**
       * Returns a stylesheet to be used for feature checks
       *
       * @return {StyleSheet} Stylesheet element
       */
      __getStylesheet: function __getStylesheet() {
        if (!qx.bom.client.Stylesheet.__stylesheet) {
          qx.bom.client.Stylesheet.__stylesheet = qx.bom.Stylesheet.createElement();
        }

        return qx.bom.client.Stylesheet.__stylesheet;
      },

      /**
       * Check for IE's non-standard document.createStyleSheet function.
       * In IE9 (standards mode), the typeof check returns "function" so false is
       * returned. This is intended since IE9 supports the DOM-standard
       * createElement("style") which should be used instead.
       *
       * @internal
       * @return {Boolean} <code>true</code> if the browser supports
       * document.createStyleSheet
       */
      getCreateStyleSheet: function getCreateStyleSheet() {
        return _typeof(document.createStyleSheet) === "object";
      },

      /**
       * Check for stylesheet.insertRule. Legacy IEs do not support this.
       *
       * @internal
       * @return {Boolean} <code>true</code> if insertRule is supported
       */
      getInsertRule: function getInsertRule() {
        return typeof qx.bom.client.Stylesheet.__getStylesheet().insertRule === "function";
      },

      /**
       * Check for stylesheet.deleteRule. Legacy IEs do not support this.
       *
       * @internal
       * @return {Boolean} <code>true</code> if deleteRule is supported
       */
      getDeleteRule: function getDeleteRule() {
        return typeof qx.bom.client.Stylesheet.__getStylesheet().deleteRule === "function";
      },

      /**
       * Decides whether to use the legacy IE-only stylesheet.addImport or the
       * DOM-standard stylesheet.insertRule('@import [...]')
       *
       * @internal
       * @return {Boolean} <code>true</code> if stylesheet.addImport is supported
       */
      getAddImport: function getAddImport() {
        return _typeof(qx.bom.client.Stylesheet.__getStylesheet().addImport) === "object";
      },

      /**
       * Decides whether to use the legacy IE-only stylesheet.removeImport or the
       * DOM-standard stylesheet.deleteRule('@import [...]')
       *
       * @internal
       * @return {Boolean} <code>true</code> if stylesheet.removeImport is supported
       */
      getRemoveImport: function getRemoveImport() {
        return _typeof(qx.bom.client.Stylesheet.__getStylesheet().removeImport) === "object";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("html.stylesheet.createstylesheet", statics.getCreateStyleSheet);
      qx.core.Environment.add("html.stylesheet.insertrule", statics.getInsertRule);
      qx.core.Environment.add("html.stylesheet.deleterule", statics.getDeleteRule);
      qx.core.Environment.add("html.stylesheet.addimport", statics.getAddImport);
      qx.core.Environment.add("html.stylesheet.removeimport", statics.getRemoveImport);
    }
  });
  qx.bom.client.Stylesheet.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.client.Stylesheet": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Assert": {},
      "qx.dom.Element": {},
      "qx.util.Uri": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.stylesheet.createstylesheet": {
          "className": "qx.bom.client.Stylesheet"
        },
        "html.stylesheet.insertrule": {
          "className": "qx.bom.client.Stylesheet"
        },
        "html.stylesheet.deleterule": {
          "className": "qx.bom.client.Stylesheet"
        },
        "html.stylesheet.addimport": {
          "className": "qx.bom.client.Stylesheet"
        },
        "html.stylesheet.removeimport": {
          "className": "qx.bom.client.Stylesheet"
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Andreas Junghans (lucidcake)
  
  ************************************************************************ */

  /**
   * Cross-browser wrapper to work with CSS stylesheets.
   * @require(qx.bom.client.Stylesheet)
   */
  qx.Bootstrap.define("qx.bom.Stylesheet", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Include a CSS file
       *
       * <em>Note:</em> Using a resource ID as the <code>href</code> parameter
       * will no longer be supported. Call
       * <code>qx.util.ResourceManager.getInstance().toUri(href)</code> to get
       * valid URI to be used with this method.
       *
       * @param href {String} Href value
       * @param doc {Document?} Document to modify
       */
      includeFile: function includeFile(href, doc) {
        if (!doc) {
          doc = document;
        }

        var el = doc.createElement("link");
        el.type = "text/css";
        el.rel = "stylesheet";
        el.href = href;
        var head = doc.getElementsByTagName("head")[0];
        head.appendChild(el);
      },

      /**
       * Create a new Stylesheet node and append it to the document
       *
       * @param text {String?} optional string of css rules
       * @return {StyleSheet} the generates stylesheet element
       */
      createElement: function createElement(text) {
        if (qx.core.Environment.get("html.stylesheet.createstylesheet")) {
          var sheet = document.createStyleSheet();

          if (text) {
            sheet.cssText = text;
          }

          return sheet;
        } else {
          var elem = document.createElement("style");
          elem.type = "text/css";

          if (text) {
            elem.appendChild(document.createTextNode(text));
          }

          document.getElementsByTagName("head")[0].appendChild(elem);
          return elem.sheet;
        }
      },

      /**
       * Insert a new CSS rule into a given Stylesheet
       *
       * @param sheet {Object} the target Stylesheet object
       * @param selector {String} the selector
       * @param entry {String} style rule
       */
      addRule: function addRule(sheet, selector, entry) {
        {
          var msg = "qx.bom.Stylesheet.addRule: The rule '" + entry + "' for the selector '" + selector + "' must not be enclosed in braces";
          qx.core.Assert.assertFalse(/^\s*?\{.*?\}\s*?$/.test(entry), msg);
        }

        if (qx.core.Environment.get("html.stylesheet.insertrule")) {
          sheet.insertRule(selector + "{" + entry + "}", sheet.cssRules.length);
        } else {
          sheet.addRule(selector, entry);
        }
      },

      /**
       * Remove a CSS rule from a stylesheet
       *
       * @param sheet {Object} the Stylesheet
       * @param selector {String} the Selector of the rule to remove
       */
      removeRule: function removeRule(sheet, selector) {
        if (qx.core.Environment.get("html.stylesheet.deleterule")) {
          var rules = sheet.cssRules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; --i) {
            if (rules[i].selectorText == selector) {
              sheet.deleteRule(i);
            }
          }
        } else {
          var rules = sheet.rules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; --i) {
            if (rules[i].selectorText == selector) {
              sheet.removeRule(i);
            }
          }
        }
      },

      /**
       * Remove the given sheet from its owner.
       * @param sheet {Object} the stylesheet object
       */
      removeSheet: function removeSheet(sheet) {
        var owner = sheet.ownerNode ? sheet.ownerNode : sheet.owningElement;
        qx.dom.Element.removeChild(owner, owner.parentNode);
      },

      /**
       * Remove all CSS rules from a stylesheet
       *
       * @param sheet {Object} the stylesheet object
       */
      removeAllRules: function removeAllRules(sheet) {
        if (qx.core.Environment.get("html.stylesheet.deleterule")) {
          var rules = sheet.cssRules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; i--) {
            sheet.deleteRule(i);
          }
        } else {
          var rules = sheet.rules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; i--) {
            sheet.removeRule(i);
          }
        }
      },

      /**
       * Add an import of an external CSS file to a stylesheet
       *
       * @param sheet {Object} the stylesheet object
       * @param url {String} URL of the external stylesheet file
       */
      addImport: function addImport(sheet, url) {
        if (qx.core.Environment.get("html.stylesheet.addimport")) {
          sheet.addImport(url);
        } else {
          sheet.insertRule('@import "' + url + '";', sheet.cssRules.length);
        }
      },

      /**
       * Removes an import from a stylesheet
       *
       * @param sheet {Object} the stylesheet object
       * @param url {String} URL of the imported CSS file
       */
      removeImport: function removeImport(sheet, url) {
        if (qx.core.Environment.get("html.stylesheet.removeimport")) {
          var imports = sheet.imports;
          var len = imports.length;

          for (var i = len - 1; i >= 0; i--) {
            if (imports[i].href == url || imports[i].href == qx.util.Uri.getAbsolute(url)) {
              sheet.removeImport(i);
            }
          }
        } else {
          var rules = sheet.cssRules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; i--) {
            if (rules[i].href == url) {
              sheet.deleteRule(i);
            }
          }
        }
      },

      /**
       * Remove all imports from a stylesheet
       *
       * @param sheet {Object} the stylesheet object
       */
      removeAllImports: function removeAllImports(sheet) {
        if (qx.core.Environment.get("html.stylesheet.removeimport")) {
          var imports = sheet.imports;
          var len = imports.length;

          for (var i = len - 1; i >= 0; i--) {
            sheet.removeImport(i);
          }
        } else {
          var rules = sheet.cssRules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; i--) {
            if (rules[i].type == rules[i].IMPORT_RULE) {
              sheet.deleteRule(i);
            }
          }
        }
      }
    }
  });
  qx.bom.Stylesheet.$$dbClassInfo = $$dbClassInfo;
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
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Basic implementation for an event emitter. This supplies a basic and
   * minimalistic event mechanism.
   */
  qx.Bootstrap.define("qx.event.Emitter", {
    extend: Object,
    statics: {
      /** Static storage for all event listener */
      __storage: []
    },
    members: {
      __listener: null,
      __any: null,

      /**
       * Attach a listener to the event emitter. The given <code>name</code>
       * will define the type of event. Handing in a <code>'*'</code> will
       * listen to all events emitted by the event emitter.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      on: function on(name, listener, ctx) {
        var id = qx.event.Emitter.__storage.length;

        this.__getStorage(name).push({
          listener: listener,
          ctx: ctx,
          id: id,
          name: name
        });

        qx.event.Emitter.__storage.push({
          name: name,
          listener: listener,
          ctx: ctx
        });

        return id;
      },

      /**
       * Attach a listener to the event emitter which will be executed only once.
       * The given <code>name</code> will define the type of event. Handing in a
       * <code>'*'</code> will listen to all events emitted by the event emitter.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      once: function once(name, listener, ctx) {
        var id = qx.event.Emitter.__storage.length;

        this.__getStorage(name).push({
          listener: listener,
          ctx: ctx,
          once: true,
          id: id
        });

        qx.event.Emitter.__storage.push({
          name: name,
          listener: listener,
          ctx: ctx
        });

        return id;
      },

      /**
       * Remove a listener from the event emitter. The given <code>name</code>
       * will define the type of event.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer|null} The listener's id if it was removed or
       * <code>null</code> if it wasn't found
       */
      off: function off(name, listener, ctx) {
        var storage = this.__getStorage(name);

        for (var i = storage.length - 1; i >= 0; i--) {
          var entry = storage[i];

          if (entry.listener == listener && entry.ctx == ctx) {
            storage.splice(i, 1);
            qx.event.Emitter.__storage[entry.id] = null;
            return entry.id;
          }
        }

        return null;
      },

      /**
       * Removes the listener identified by the given <code>id</code>. The id
       * will be return on attaching the listener and can be stored for removing.
       *
       * @param id {Integer} The id of the listener.
       * @return {Integer|null} The listener's id if it was removed or
       * <code>null</code> if it wasn't found
       */
      offById: function offById(id) {
        var entry = qx.event.Emitter.__storage[id];

        if (entry) {
          this.off(entry.name, entry.listener, entry.ctx);
        }

        return null;
      },

      /**
       * Alternative for {@link #on}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      addListener: function addListener(name, listener, ctx) {
        return this.on(name, listener, ctx);
      },

      /**
       * Alternative for {@link #once}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      addListenerOnce: function addListenerOnce(name, listener, ctx) {
        return this.once(name, listener, ctx);
      },

      /**
       * Alternative for {@link #off}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       */
      removeListener: function removeListener(name, listener, ctx) {
        this.off(name, listener, ctx);
      },

      /**
       * Alternative for {@link #offById}.
       * @param id {Integer} The id of the listener.
       */
      removeListenerById: function removeListenerById(id) {
        this.offById(id);
      },

      /**
       * Emits an event with the given name. The data will be passed
       * to the listener.
       * @param name {String} The name of the event to emit.
       * @param data {var?undefined} The data which should be passed to the listener.
       */
      emit: function emit(name, data) {
        var storage = this.__getStorage(name).concat();

        var toDelete = [];

        for (var i = 0; i < storage.length; i++) {
          var entry = storage[i];
          entry.listener.call(entry.ctx, data);

          if (entry.once) {
            toDelete.push(entry);
          }
        } // listener callbacks could manipulate the storage
        // (e.g. module.Event.once)


        toDelete.forEach(function (entry) {
          var origStorage = this.__getStorage(name);

          var idx = origStorage.indexOf(entry);
          origStorage.splice(idx, 1);
        }.bind(this)); // call on any

        storage = this.__getStorage("*");

        for (var i = storage.length - 1; i >= 0; i--) {
          var entry = storage[i];
          entry.listener.call(entry.ctx, data);
        }
      },

      /**
       * Returns the internal attached listener.
       * @internal
       * @return {Map} A map which has the event name as key. The values are
       *   arrays containing a map with 'listener' and 'ctx'.
       */
      getListeners: function getListeners() {
        return this.__listener;
      },

      /**
       * Returns the data entry for a given event id. If the entry could
       * not be found, undefined will be returned.
       * @internal
       * @param id {Number} The listeners id
       * @return {Map|undefined} The data entry if found
       */
      getEntryById: function getEntryById(id) {
        for (var name in this.__listener) {
          var store = this.__listener[name];

          for (var i = 0, j = store.length; i < j; i++) {
            if (store[i].id === id) {
              return store[i];
            }
          }
        }
      },

      /**
       * Internal helper which will return the storage for the given name.
       * @param name {String} The name of the event.
       * @return {Array} An array which is the storage for the listener and
       *   the given event name.
       */
      __getStorage: function __getStorage(name) {
        if (this.__listener == null) {
          this.__listener = {};
        }

        if (this.__listener[name] == null) {
          this.__listener[name] = [];
        }

        return this.__listener[name];
      }
    }
  });
  qx.event.Emitter.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.normalize.Date": {
        "require": true,
        "defer": "runtime"
      },
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
      "qx.bom.client.CssAnimation": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation.requestframe": {
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * This is a cross browser wrapper for requestAnimationFrame. For further
   * information about the feature, take a look at spec:
   * http://www.w3.org/TR/animation-timing/
   *
   * This class offers two ways of using this feature. First, the plain
   * API the spec describes.
   *
   * Here is a sample usage:
   * <pre class='javascript'>var start = Date.now();
   * var cb = function(time) {
   *   if (time >= start + duration) {
   *     // ... do some last tasks
   *   } else {
   *     var timePassed = time - start;
   *     // ... calculate the current step and apply it
   *     qx.bom.AnimationFrame.request(cb, this);
   *   }
   * };
   * qx.bom.AnimationFrame.request(cb, this);
   * </pre>
   *
   * Another way of using it is to use it as an instance emitting events.
   *
   * Here is a sample usage of that API:
   * <pre class='javascript'>var frame = new qx.bom.AnimationFrame();
   * frame.on("end", function() {
   *   // ... do some last tasks
   * }, this);
   * frame.on("frame", function(timePassed) {
   *   // ... calculate the current step and apply it
   * }, this);
   * frame.startSequence(duration);
   * </pre>
   *
   * @require(qx.lang.normalize.Date)
   */
  qx.Bootstrap.define("qx.bom.AnimationFrame", {
    extend: qx.event.Emitter,
    events: {
      /** Fired as soon as the animation has ended. */
      "end": undefined,

      /**
       * Fired on every frame having the passed time as value
       * (might be a float for higher precision).
       */
      "frame": "Number"
    },
    members: {
      __canceled: false,

      /**
       * Method used to start a series of animation frames. The series will end as
       * soon as the given duration is over.
       *
       * @param duration {Number} The duration the sequence should take.
       *
       * @ignore(performance.*)
       */
      startSequence: function startSequence(duration) {
        this.__canceled = false;
        var start = window.performance && performance.now ? performance.now() + qx.bom.AnimationFrame.__start : Date.now();

        var cb = function cb(time) {
          if (this.__canceled) {
            this.id = null;
            return;
          } // final call


          if (time >= start + duration) {
            this.emit("end");
            this.id = null;
          } else {
            var timePassed = Math.max(time - start, 0);
            this.emit("frame", timePassed);
            this.id = qx.bom.AnimationFrame.request(cb, this);
          }
        };

        this.id = qx.bom.AnimationFrame.request(cb, this);
      },

      /**
       * Cancels a started sequence of frames. It will do nothing if no
       * sequence is running.
       */
      cancelSequence: function cancelSequence() {
        this.__canceled = true;
      }
    },
    statics: {
      /**
       * The default time in ms the timeout fallback implementation uses.
       */
      TIMEOUT: 30,

      /**
       * Calculation of the predefined timing functions. Approximation of the real
       * bezier curves has been used for easier calculation. This is good and close
       * enough for the predefined functions like <code>ease</code> or
       * <code>linear</code>.
       *
       * @param func {String} The defined timing function. One of the following values:
       *   <code>"ease-in"</code>, <code>"ease-out"</code>, <code>"linear"</code>,
       *   <code>"ease-in-out"</code>, <code>"ease"</code>.
       * @param x {Integer} The percent value of the function.
       * @return {Integer} The calculated value
       */
      calculateTiming: function calculateTiming(func, x) {
        if (func == "ease-in") {
          var a = [3.1223e-7, 0.0757, 1.2646, -0.167, -0.4387, 0.2654];
        } else if (func == "ease-out") {
          var a = [-7.0198e-8, 1.652, -0.551, -0.0458, 0.1255, -0.1807];
        } else if (func == "linear") {
          return x;
        } else if (func == "ease-in-out") {
          var a = [2.482e-7, -0.2289, 3.3466, -1.0857, -1.7354, 0.7034];
        } else {
          // default is 'ease'
          var a = [-0.0021, 0.2472, 9.8054, -21.6869, 17.7611, -5.1226];
        } // A 6th grade polynomial has been used as approximation of the original
        // bezier curves  described in the transition spec
        // http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        // (the same is used for animations as well)


        var y = 0;

        for (var i = 0; i < a.length; i++) {
          y += a[i] * Math.pow(x, i);
        }

        ;
        return y;
      },

      /**
       * Request for an animation frame. If the native <code>requestAnimationFrame</code>
       * method is supported, it will be used. Otherwise, we use timeouts with a
       * 30ms delay. The HighResolutionTime will be used if supported but the time given
       * to the callback will still be a timestamp starting at 1 January 1970 00:00:00 UTC.
       *
       * @param callback {Function} The callback function which will get the current
       *   time as argument (which could be a float for higher precision).
       * @param context {var} The context of the callback.
       * @return {Number} The id of the request.
       */
      request: function request(callback, context) {
        var req = qx.core.Environment.get("css.animation.requestframe");

        var cb = function cb(time) {
          // check for high resolution time
          if (time < 1e10) {
            time = qx.bom.AnimationFrame.__start + time;
          }

          time = time || Date.now();
          callback.call(context, time);
        };

        if (req) {
          return window[req](cb);
        } else {
          // make sure to use an indirection because setTimeout passes a
          // number as first argument as well
          return window.setTimeout(function () {
            cb();
          }, qx.bom.AnimationFrame.TIMEOUT);
        }
      }
    },

    /**
     * @ignore(performance.timing.*)
     */
    defer: function defer(statics) {
      // check and use the high resolution start time if available
      statics.__start = window.performance && performance.timing && performance.timing.navigationStart; // if not, simply use the current time

      if (!statics.__start) {
        statics.__start = Date.now();
      }
    }
  });
  qx.bom.AnimationFrame.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {},
      "qx.lang.Object": {},
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
       * Fabian Jakobs (fjakobs)
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * The widget queue handles the deferred computation of certain widget properties.
   * It is used e.g. for the tree to update the indentation of tree nodes.
   *
   * This queue calls the method {@link qx.ui.core.Widget#syncWidget} of each
   * queued widget before the layout queues are processed.
   */
  qx.Class.define("qx.ui.core.queue.Widget", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue: [],

      /**
       * @type {Object} This contains a map of widgets hash ($$hash) and their
       * corresponding map of jobs.
       */
      __jobs: {},

      /**
       * Clears given job of a widget from the internal queue. If no jobs left, the
       * widget will be removed completely from queue. If job param is <code>null</code>
       * or <code>undefined</code> widget will be removed completely from queue.
       * Normally only used during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       * @param job {String?} Job identifier. If not used, it will be converted to
       * "$$default".
       */
      remove: function remove(widget, job) {
        var queue = this.__queue;

        if (!queue.includes(widget)) {
          return;
        }

        var hash = widget.$$hash; // remove widget and all corresponding jobs, if job param is not given.

        if (job == null) {
          qx.lang.Array.remove(queue, widget);
          delete this.__jobs[hash];
          return;
        }

        if (this.__jobs[hash]) {
          delete this.__jobs[hash][job];

          if (qx.lang.Object.getLength(this.__jobs[hash]) == 0) {
            qx.lang.Array.remove(queue, widget);
          }
        }
      },

      /**
       * Adds a widget to the queue. The second param can be used to identify
       * several jobs. You can add one job at once, which will be returned as
       * an map at flushing on method {@link qx.ui.core.Widget#syncWidget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       * @param job {String?} Job identifier. If not used, it will be converted to
       * "$$default".
       */
      add: function add(widget, job) {
        var queue = this.__queue; //add widget if not containing

        if (!queue.includes(widget)) {
          queue.unshift(widget);
        } //add job


        if (job == null) {
          job = "$$default";
        }

        var hash = widget.$$hash;

        if (!this.__jobs[hash]) {
          this.__jobs[hash] = {};
        }

        this.__jobs[hash][job] = true;
        qx.ui.core.queue.Manager.scheduleFlush("widget");
      },

      /**
       * Flushes the widget queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Process all registered widgets
        var queue = this.__queue;
        var obj, jobs;

        for (var i = queue.length - 1; i >= 0; i--) {
          // Order is important to allow the same widget to be requeued directly
          obj = queue[i];
          jobs = this.__jobs[obj.$$hash];
          queue.splice(i, 1);
          obj.syncWidget(jobs);
        } // Empty check


        if (queue.length != 0) {
          return;
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue = [];
        this.__jobs = {};
      }
    }
  });
  qx.ui.core.queue.Widget.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {},
      "qx.ui.core.queue.Manager": {},
      "qx.ui.core.queue.Visibility": {}
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
   * The AppearanceQueue registers all widgets which are influences through
   * state changes.
   */
  qx.Class.define("qx.ui.core.queue.Appearance", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue: [],

      /** @type {Map} map of widgets by hash code which are in the queue */
      __lookup: {},

      /**
       * Clears the widget from the internal queue. Normally only used
       * during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       */
      remove: function remove(widget) {
        if (this.__lookup[widget.$$hash]) {
          qx.lang.Array.remove(this.__queue, widget);
          delete this.__lookup[widget.$$hash];
        }
      },

      /**
       * Adds a widget to the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       */
      add: function add(widget) {
        if (this.__lookup[widget.$$hash]) {
          return;
        }

        this.__queue.unshift(widget);

        this.__lookup[widget.$$hash] = widget;
        qx.ui.core.queue.Manager.scheduleFlush("appearance");
      },

      /**
       * Whether the given widget is already queued
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the widget is queued
       */
      has: function has(widget) {
        return !!this.__lookup[widget.$$hash];
      },

      /**
       * Flushes the appearance queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        var Visibility = qx.ui.core.queue.Visibility;
        var queue = this.__queue;
        var obj;

        for (var i = queue.length - 1; i >= 0; i--) {
          // Order is important to allow the same widget to be re-queued directly
          obj = queue[i];
          queue.splice(i, 1);
          delete this.__lookup[obj.$$hash]; // Only apply to currently visible widgets

          if (Visibility.isVisible(obj)) {
            obj.syncAppearance();
          } else {
            obj.$$stateChanges = true;
          }
        }
      }
    }
  });
  qx.ui.core.queue.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.queue.Manager": {},
      "qx.ui.core.queue.Visibility": {}
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
   * The layout queue manages all widgets, which need a recalculation of their
   * layout. The {@link #flush} method computes the layout of all queued widgets
   * and their dependent widgets.
   */
  qx.Class.define("qx.ui.core.queue.Layout", {
    statics: {
      /** @type {Map} This contains all the queued widgets for the next flush. */
      __queue: {},

      /** Nesting level cache **/
      __nesting: {},

      /**
       * Clears the widget from the internal queue. Normally only used
       * during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       */
      remove: function remove(widget) {
        delete this.__queue[widget.$$hash];
      },

      /**
       * Mark a widget's layout as invalid and add its layout root to
       * the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} Widget to add.
       */
      add: function add(widget) {
        this.__queue[widget.$$hash] = widget;
        qx.ui.core.queue.Manager.scheduleFlush("layout");
      },

      /**
      * Check whether the queue has scheduled changes for a widget.
      * Note that the layout parent can have changes scheduled that
      * affect the children widgets.
      *
      * @param widget {qx.ui.core.Widget} Widget to check.
      * @return {Boolean} Whether the widget given has layout changes queued.
      */
      isScheduled: function isScheduled(widget) {
        return !!this.__queue[widget.$$hash];
      },

      /**
       * Update the layout of all widgets, which layout is marked as invalid.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       *
       */
      flush: function flush() {
        // get sorted widgets to (re-)layout
        var queue = this.__getSortedQueue(); // iterate in reversed order to process widgets with the smallest nesting
        // level first because these may affect the inner lying children


        for (var i = queue.length - 1; i >= 0; i--) {
          var widget = queue[i]; // continue if a relayout of one of the root's parents has made the
          // layout valid

          if (widget.hasValidLayout()) {
            continue;
          } // overflow areas or qx.ui.root.*


          if (widget.isRootWidget() && !widget.hasUserBounds()) {
            // This is a real root widget. Set its size to its preferred size.
            var hint = widget.getSizeHint();
            widget.renderLayout(0, 0, hint.width, hint.height);
          } else {
            // This is an inner item of layout changes. Do a relayout of its
            // children without changing its position and size.
            var bounds = widget.getBounds();
            widget.renderLayout(bounds.left, bounds.top, bounds.width, bounds.height);
          }
        }
      },

      /**
       * Get the widget's nesting level. Top level widgets have a nesting level
       * of <code>0</code>.
       *
       * @param widget {qx.ui.core.Widget} The widget to query.
       * @return {Integer} The nesting level
       */
      getNestingLevel: function getNestingLevel(widget) {
        var cache = this.__nesting;
        var level = 0;
        var parent = widget; // Detecting level

        while (true) {
          if (cache[parent.$$hash] != null) {
            level += cache[parent.$$hash];
            break;
          }

          if (!parent.$$parent) {
            break;
          }

          parent = parent.$$parent;
          level += 1;
        } // Update the processed hierarchy (runs from inner to outer)


        var leveldown = level;

        while (widget && widget !== parent) {
          cache[widget.$$hash] = leveldown--;
          widget = widget.$$parent;
        }

        return level;
      },

      /**
       * Group widget by their nesting level.
       *
       * @return {Map[]} A sparse array. Each entry of the array contains a widget
       *     map with all widgets of the same level as the array index.
       */
      __getLevelGroupedWidgets: function __getLevelGroupedWidgets() {
        var VisibilityQueue = qx.ui.core.queue.Visibility; // clear cache

        this.__nesting = {}; // sparse level array

        var levels = [];
        var queue = this.__queue;
        var widget, level;

        for (var hash in queue) {
          widget = queue[hash];

          if (VisibilityQueue.isVisible(widget)) {
            level = this.getNestingLevel(widget); // create hierarchy

            if (!levels[level]) {
              levels[level] = {};
            } // store widget in level map


            levels[level][hash] = widget; // remove widget from layout queue

            delete queue[hash];
          }
        }

        return levels;
      },

      /**
       * Compute all layout roots of the given widgets. Layout roots are either
       * root widgets or widgets, which preferred size has not changed by the
       * layout changes of its children.
       *
       * This function returns the roots ordered by their nesting factors. The
       * layout with the largest nesting level comes first.
       *
       * @return {qx.ui.core.Widget[]} Ordered list or layout roots.
       */
      __getSortedQueue: function __getSortedQueue() {
        var sortedQueue = [];

        var levels = this.__getLevelGroupedWidgets();

        for (var level = levels.length - 1; level >= 0; level--) {
          // Ignore empty levels (levels is an sparse array)
          if (!levels[level]) {
            continue;
          }

          for (var hash in levels[level]) {
            var widget = levels[level][hash]; // This is a real layout root. Add it directly to the list

            if (level == 0 || widget.isRootWidget() || widget.hasUserBounds()) {
              sortedQueue.push(widget);
              widget.invalidateLayoutCache();
              continue;
            } // compare old size hint to new size hint


            var oldSizeHint = widget.getSizeHint(false);

            if (oldSizeHint) {
              widget.invalidateLayoutCache();
              var newSizeHint = widget.getSizeHint();
              var hintChanged = !widget.getBounds() || oldSizeHint.minWidth !== newSizeHint.minWidth || oldSizeHint.width !== newSizeHint.width || oldSizeHint.maxWidth !== newSizeHint.maxWidth || oldSizeHint.minHeight !== newSizeHint.minHeight || oldSizeHint.height !== newSizeHint.height || oldSizeHint.maxHeight !== newSizeHint.maxHeight;
            } else {
              hintChanged = true;
            }

            if (hintChanged) {
              // Since the level is > 0, the widget must
              // have a parent != null.
              var parent = widget.getLayoutParent();

              if (!levels[level - 1]) {
                levels[level - 1] = {};
              }

              levels[level - 1][parent.$$hash] = parent;
            } else {
              // this is an internal layout root since its own preferred size
              // has not changed.
              sortedQueue.push(widget);
            }
          }
        }

        return sortedQueue;
      }
    }
  });
  qx.ui.core.queue.Layout.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The DisposeQueue registers all widgets which are should be disposed.
   * This queue makes it possible to remove widgets from the DOM using
   * the layout and element queues and dispose them afterwards.
   */
  qx.Class.define("qx.ui.core.queue.Dispose", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue: [],

      /**
       * Adds a widget to the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       */
      add: function add(widget) {
        var queue = this.__queue;

        if (queue.includes(widget)) {
          return;
        }

        queue.unshift(widget);
        qx.ui.core.queue.Manager.scheduleFlush("dispose");
      },

      /**
       * Whether the dispose queue is empty
       * @return {Boolean}
       * @internal
       */
      isEmpty: function isEmpty() {
        return this.__queue.length == 0;
      },

      /**
       * Flushes the dispose queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Dispose all registered objects
        var queue = this.__queue;

        for (var i = queue.length - 1; i >= 0; i--) {
          var widget = queue[i];
          queue.splice(i, 1);
          widget.dispose();
        } // Empty check


        if (queue.length != 0) {
          return;
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue = [];
      }
    }
  });
  qx.ui.core.queue.Dispose.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Style": {},
      "qx.bom.client.Engine": {},
      "qx.dom.Node": {}
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Contains support for calculating dimensions of HTML elements.
   *
   * We differ between the box (or border) size which is available via
   * {@link #getWidth} and {@link #getHeight} and the content or scroll
   * sizes which are available via {@link #getContentWidth} and
   * {@link #getContentHeight}.
   */
  qx.Bootstrap.define("qx.bom.element.Dimension", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the rendered width of the given element.
       *
       * This is the visible width of the object, which need not to be identical
       * to the width configured via CSS. This highly depends on the current
       * box-sizing for the document and maybe even for the element.
       *
       * @signature function(element)
       * @param element {Element} element to query
       * @return {Integer} width of the element
       */
      getWidth: function getWidth(element) {
        var rect = element.getBoundingClientRect();
        return Math.round(rect.right - rect.left);
      },

      /**
       * Returns the rendered height of the given element.
       *
       * This is the visible height of the object, which need not to be identical
       * to the height configured via CSS. This highly depends on the current
       * box-sizing for the document and maybe even for the element.
       *
       * @signature function(element)
       * @param element {Element} element to query
       * @return {Integer} height of the element
       */
      getHeight: function getHeight(element) {
        var rect = element.getBoundingClientRect();
        return Math.round(rect.bottom - rect.top);
      },

      /**
       * Returns the rendered size of the given element.
       *
       * @param element {Element} element to query
       * @return {Map} map containing the width and height of the element
       */
      getSize: function getSize(element) {
        return {
          width: this.getWidth(element),
          height: this.getHeight(element)
        };
      },

      /** @type {Map} Contains all overflow values where scrollbars are invisible */
      __hiddenScrollbars: {
        visible: true,
        hidden: true
      },

      /**
       * Returns the content width.
       *
       * The content width is basically the maximum
       * width used or the maximum width which can be used by the content. This
       * excludes all kind of styles of the element like borders, paddings, margins,
       * and even scrollbars.
       *
       * Please note that with visible scrollbars the content width returned
       * may be larger than the box width returned via {@link #getWidth}.
       *
       * @param element {Element} element to query
       * @return {Integer} Computed content width
       */
      getContentWidth: function getContentWidth(element) {
        var Style = qx.bom.element.Style;
        var overflowX = qx.bom.element.Style.get(element, "overflowX");
        var paddingLeft = parseInt(Style.get(element, "paddingLeft") || "0px", 10);
        var paddingRight = parseInt(Style.get(element, "paddingRight") || "0px", 10);

        if (this.__hiddenScrollbars[overflowX]) {
          var contentWidth = element.clientWidth;

          if (qx.core.Environment.get("engine.name") == "opera" || qx.dom.Node.isBlockNode(element)) {
            contentWidth = contentWidth - paddingLeft - paddingRight;
          } // IE seems to return 0 on clientWidth if the element is 0px
          // in height so we use the offsetWidth instead


          if (qx.core.Environment.get("engine.name") == "mshtml") {
            if (contentWidth === 0 && element.offsetHeight === 0) {
              return element.offsetWidth;
            }
          }

          return contentWidth;
        } else {
          if (element.clientWidth >= element.scrollWidth) {
            // Scrollbars visible, but not needed? We need to substract both paddings
            return Math.max(element.clientWidth, element.scrollWidth) - paddingLeft - paddingRight;
          } else {
            // Scrollbars visible and needed. We just remove the left padding,
            // as the right padding is not respected in rendering.
            var width = element.scrollWidth - paddingLeft; // IE renders the paddingRight as well with scrollbars on

            if (qx.core.Environment.get("engine.name") == "mshtml") {
              width -= paddingRight;
            }

            return width;
          }
        }
      },

      /**
       * Returns the content height.
       *
       * The content height is basically the maximum
       * height used or the maximum height which can be used by the content. This
       * excludes all kind of styles of the element like borders, paddings, margins,
       * and even scrollbars.
       *
       * Please note that with visible scrollbars the content height returned
       * may be larger than the box height returned via {@link #getHeight}.
       *
       * @param element {Element} element to query
       * @return {Integer} Computed content height
       */
      getContentHeight: function getContentHeight(element) {
        var Style = qx.bom.element.Style;
        var overflowY = qx.bom.element.Style.get(element, "overflowY");
        var paddingTop = parseInt(Style.get(element, "paddingTop") || "0px", 10);
        var paddingBottom = parseInt(Style.get(element, "paddingBottom") || "0px", 10);

        if (this.__hiddenScrollbars[overflowY]) {
          return element.clientHeight - paddingTop - paddingBottom;
        } else {
          if (element.clientHeight >= element.scrollHeight) {
            // Scrollbars visible, but not needed? We need to substract both paddings
            return Math.max(element.clientHeight, element.scrollHeight) - paddingTop - paddingBottom;
          } else {
            // Scrollbars visible and needed. We just remove the top padding,
            // as the bottom padding is not respected in rendering.
            return element.scrollHeight - paddingTop;
          }
        }
      },

      /**
       * Returns the rendered content size of the given element.
       *
       * @param element {Element} element to query
       * @return {Map} map containing the content width and height of the element
       */
      getContentSize: function getContentSize(element) {
        return {
          width: this.getContentWidth(element),
          height: this.getContentHeight(element)
        };
      }
    }
  });
  qx.bom.element.Dimension.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.Viewport": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
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
       * Sebastian Werner (wpbasti)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Yahoo! UI Library
         http://developer.yahoo.com/yui
         Version 2.2.0
  
       Copyright:
         (c) 2007, Yahoo! Inc.
  
       License:
         BSD: http://developer.yahoo.com/yui/license.txt
  
     ----------------------------------------------------------------------
  
       http://developer.yahoo.com/yui/license.html
  
       Copyright (c) 2009, Yahoo! Inc.
       All rights reserved.
  
       Redistribution and use of this software in source and binary forms,
       with or without modification, are permitted provided that the
       following conditions are met:
  
       * Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in
         the documentation and/or other materials provided with the
         distribution.
       * Neither the name of Yahoo! Inc. nor the names of its contributors
         may be used to endorse or promote products derived from this
         software without specific prior written permission of Yahoo! Inc.
  
       THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
       FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
       COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
       INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
       (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
       SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
       HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
       STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
       ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
       OF THE POSSIBILITY OF SUCH DAMAGE.
  
  ************************************************************************ */

  /**
   * Includes library functions to work with the current document.
   */
  qx.Bootstrap.define("qx.bom.Document", {
    statics: {
      /**
       * Whether the document is in quirks mode (e.g. non XHTML, HTML4 Strict or missing doctype)
       *
       * @signature function(win)
       * @param win {Window?window} The window to query
       * @return {Boolean} true when containing document is in quirks mode
       */
      isQuirksMode: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(win) {
          if (qx.core.Environment.get("engine.version") >= 8) {
            return (win || window).document.documentMode === 5;
          } else {
            return (win || window).document.compatMode !== "CSS1Compat";
          }
        },
        "webkit": function webkit(win) {
          if (document.compatMode === undefined) {
            var el = (win || window).document.createElement("div");
            el.style.cssText = "position:absolute;width:0;height:0;width:1";
            return el.style.width === "1px" ? true : false;
          } else {
            return (win || window).document.compatMode !== "CSS1Compat";
          }
        },
        "default": function _default(win) {
          return (win || window).document.compatMode !== "CSS1Compat";
        }
      }),

      /**
       * Whether the document is in standard mode (e.g. XHTML, HTML4 Strict or doctype defined)
       *
       * @param win {Window?window} The window to query
       * @return {Boolean} true when containing document is in standard mode
       */
      isStandardMode: function isStandardMode(win) {
        return !this.isQuirksMode(win);
      },

      /**
       * Returns the width of the document.
       *
       * Internet Explorer in standard mode stores the proprietary <code>scrollWidth</code> property
       * on the <code>documentElement</code>, but in quirks mode on the body element. All
       * other known browsers simply store the correct value on the <code>documentElement</code>.
       *
       * If the viewport is wider than the document the viewport width is returned.
       *
       * As the html element has no visual appearance it also can not scroll. This
       * means that we must use the body <code>scrollWidth</code> in all non mshtml clients.
       *
       * Verified to correctly work with:
       *
       * * Mozilla Firefox 2.0.0.4
       * * Opera 9.2.1
       * * Safari 3.0 beta (3.0.2)
       * * Internet Explorer 7.0
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The width of the actual document (which includes the body and its margin).
       *
       * NOTE: Opera 9.5x and 9.6x have wrong value for the scrollWidth property,
       * if an element use negative value for top and left to be outside the viewport!
       * See: http://bugzilla.qooxdoo.org/show_bug.cgi?id=2869
       */
      getWidth: function getWidth(win) {
        var doc = (win || window).document;
        var view = qx.bom.Viewport.getWidth(win);
        var scroll = this.isStandardMode(win) ? doc.documentElement.scrollWidth : doc.body.scrollWidth;
        return Math.max(scroll, view);
      },

      /**
       * Returns the height of the document.
       *
       * Internet Explorer in standard mode stores the proprietary <code>scrollHeight</code> property
       * on the <code>documentElement</code>, but in quirks mode on the body element. All
       * other known browsers simply store the correct value on the <code>documentElement</code>.
       *
       * If the viewport is higher than the document the viewport height is returned.
       *
       * As the html element has no visual appearance it also can not scroll. This
       * means that we must use the body <code>scrollHeight</code> in all non mshtml clients.
       *
       * Verified to correctly work with:
       *
       * * Mozilla Firefox 2.0.0.4
       * * Opera 9.2.1
       * * Safari 3.0 beta (3.0.2)
       * * Internet Explorer 7.0
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The height of the actual document (which includes the body and its margin).
       *
       * NOTE: Opera 9.5x and 9.6x have wrong value for the scrollWidth property,
       * if an element use negative value for top and left to be outside the viewport!
       * See: http://bugzilla.qooxdoo.org/show_bug.cgi?id=2869
       */
      getHeight: function getHeight(win) {
        var doc = (win || window).document;
        var view = qx.bom.Viewport.getHeight(win);
        var scroll = this.isStandardMode(win) ? doc.documentElement.scrollHeight : doc.body.scrollHeight;
        return Math.max(scroll, view);
      }
    }
  });
  qx.bom.Document.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.Document": {},
      "qx.bom.client.OperatingSystem": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Sebastian Fastner (fastner)
       * Tino Butz (tbtz)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Unify Project
  
       Homepage:
         http://unify-project.org
  
       Copyright:
         2009-2010 Deutsche Telekom AG, Germany, http://telekom.com
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
     * Yahoo! UI Library
         http://developer.yahoo.com/yui
         Version 2.2.0
  
       Copyright:
         (c) 2007, Yahoo! Inc.
  
       License:
         BSD: http://developer.yahoo.com/yui/license.txt
  
     ----------------------------------------------------------------------
  
       http://developer.yahoo.com/yui/license.html
  
       Copyright (c) 2009, Yahoo! Inc.
       All rights reserved.
  
       Redistribution and use of this software in source and binary forms,
       with or without modification, are permitted provided that the
       following conditions are met:
  
       * Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in
         the documentation and/or other materials provided with the
         distribution.
       * Neither the name of Yahoo! Inc. nor the names of its contributors
         may be used to endorse or promote products derived from this
         software without specific prior written permission of Yahoo! Inc.
  
       THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
       FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
       COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
       INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
       (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
       SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
       HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
       STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
       ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
       OF THE POSSIBILITY OF SUCH DAMAGE.
  
  ************************************************************************ */

  /**
   * Includes library functions to work with the client's viewport (window).
   * Orientation related functions are point to window.top as default.
   */
  qx.Bootstrap.define("qx.bom.Viewport", {
    statics: {
      /**
       * Returns the current width of the viewport (excluding the vertical scrollbar
       * if present).
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The width of the viewable area of the page (excluding scrollbars).
       */
      getWidth: function getWidth(win) {
        var win = win || window;
        var doc = win.document;
        return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientWidth : doc.body.clientWidth;
      },

      /**
       * Returns the current height of the viewport (excluding the horizontal scrollbar
       * if present).
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The Height of the viewable area of the page (excluding scrollbars).
       */
      getHeight: function getHeight(win) {
        var win = win || window;
        var doc = win.document; // [BUG #7785] Document element's clientHeight is calculated wrong on iPad iOS7

        if (qx.core.Environment.get("os.name") == "ios" && window.innerHeight != doc.documentElement.clientHeight) {
          return window.innerHeight;
        }

        return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientHeight : doc.body.clientHeight;
      },

      /**
       * Returns the scroll position of the viewport
       *
       * All clients except IE < 9 support the non-standard property <code>pageXOffset</code>.
       * As this is easier to evaluate we prefer this property over <code>scrollLeft</code>.
       * Since the window could differ from the one the application is running in, we can't
       * use a one-time environment check to decide which property to use.
       *
       * @param win {Window?window} The window to query
       * @return {Integer} Scroll position in pixels from left edge, always a positive integer or zero
       */
      getScrollLeft: function getScrollLeft(win) {
        var win = win ? win : window;

        if (typeof win.pageXOffset !== "undefined") {
          return win.pageXOffset;
        } // Firefox is using 'documentElement.scrollLeft' and Chrome is using
        // 'document.body.scrollLeft'. For the other value each browser is returning
        // 0, so we can use this check to get the positive value without using specific
        // browser checks.


        var doc = win.document;
        return doc.documentElement.scrollLeft || doc.body.scrollLeft;
      },

      /**
       * Returns the scroll position of the viewport
       *
       * All clients except MSHTML support the non-standard property <code>pageYOffset</code>.
       * As this is easier to evaluate we prefer this property over <code>scrollTop</code>.
       * Since the window could differ from the one the application is running in, we can't
       * use a one-time environment check to decide which property to use.
       *
       * @param win {Window?window} The window to query
       * @return {Integer} Scroll position in pixels from top edge, always a positive integer or zero
       */
      getScrollTop: function getScrollTop(win) {
        var win = win ? win : window;

        if (typeof win.pageYOffset !== "undefined") {
          return win.pageYOffset;
        } // Firefox is using 'documentElement.scrollTop' and Chrome is using
        // 'document.body.scrollTop'. For the other value each browser is returning
        // 0, so we can use this check to get the positive value without using specific
        // browser checks.


        var doc = win.document;
        return doc.documentElement.scrollTop || doc.body.scrollTop;
      },

      /**
       * Returns an orientation normalizer value that should be added to device orientation
       * to normalize behaviour on different devices.
       *
       * @param win {Window} The window to query
       * @return {Map} Orientation normalizing value
       */
      __getOrientationNormalizer: function __getOrientationNormalizer(win) {
        // Calculate own understanding of orientation (0 = portrait, 90 = landscape)
        var currentOrientation = this.getWidth(win) > this.getHeight(win) ? 90 : 0;
        var deviceOrientation = win.orientation;

        if (deviceOrientation == null || Math.abs(deviceOrientation % 180) == currentOrientation) {
          // No device orientation available or device orientation equals own understanding of orientation
          return {
            "-270": 90,
            "-180": 180,
            "-90": -90,
            "0": 0,
            "90": 90,
            "180": 180,
            "270": -90
          };
        } else {
          // Device orientation is not equal to own understanding of orientation
          return {
            "-270": 180,
            "-180": -90,
            "-90": 0,
            "0": 90,
            "90": 180,
            "180": -90,
            "270": 0
          };
        }
      },
      // Cache orientation normalizer map on start
      __orientationNormalizer: null,

      /**
       * Returns the current orientation of the viewport in degree.
       *
       * All possible values and their meaning:
       *
       * * <code>-90</code>: "Landscape"
       * * <code>0</code>: "Portrait"
       * * <code>90</code>: "Landscape"
       * * <code>180</code>: "Portrait"
       *
       * @param win {Window?window.top} The window to query. (Default = top window)
       * @return {Integer} The current orientation in degree
       */
      getOrientation: function getOrientation(win) {
        // Set window.top as default, because orientationChange event is only fired top window
        var win = win || window.top; // The orientation property of window does not have the same behaviour over all devices
        // iPad has 0degrees = Portrait, Playbook has 90degrees = Portrait, same for Android Honeycomb
        //
        // To fix this an orientationNormalizer map is calculated on application start
        //
        // The calculation of getWidth and getHeight returns wrong values if you are in an input field
        // on iPad and rotate your device!

        var orientation = win.orientation;

        if (orientation == null) {
          // Calculate orientation from window width and window height
          orientation = this.getWidth(win) > this.getHeight(win) ? 90 : 0;
        } else {
          if (this.__orientationNormalizer == null) {
            this.__orientationNormalizer = this.__getOrientationNormalizer(win);
          } // Normalize orientation value


          orientation = this.__orientationNormalizer[orientation];
        }

        return orientation;
      },

      /**
       * Whether the viewport orientation is currently in landscape mode.
       *
       * @param win {Window?window} The window to query
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in landscape mode.
       */
      isLandscape: function isLandscape(win) {
        var orientation = this.getOrientation(win);
        return orientation === -90 || orientation === 90;
      },

      /**
       * Whether the viewport orientation is currently in portrait mode.
       *
       * @param win {Window?window} The window to query
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in portrait mode.
       */
      isPortrait: function isPortrait(win) {
        var orientation = this.getOrientation(win);
        return orientation === 0 || orientation === 180;
      }
    }
  });
  qx.bom.Viewport.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Style": {},
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {},
      "qx.bom.element.BoxSizing": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.quirksmode": {
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * jQuery Dimension Plugin
         http://jquery.com/
         Version 1.1.3
  
       Copyright:
         (c) 2007, Paul Bakaus & Brandon Aaron
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         Paul Bakaus
         Brandon Aaron
  
  ************************************************************************ */

  /**
   * Query the location of an arbitrary DOM element in relation to its top
   * level body element. Works in all major browsers:
   *
   * * Mozilla 1.5 + 2.0
   * * Internet Explorer 6.0 + 7.0 (both standard & quirks mode)
   * * Opera 9.2
   * * Safari 3.0 beta
   *
   * @ignore(SVGElement)
   */
  qx.Bootstrap.define("qx.bom.element.Location", {
    statics: {
      /**
       * Queries a style property for the given element
       *
       * @param elem {Element} DOM element to query
       * @param style {String} Style property
       * @return {String} Value of given style property
       */
      __style: function __style(elem, style) {
        return qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false);
      },

      /**
       * Queries a style property for the given element and parses it to an integer value
       *
       * @param elem {Element} DOM element to query
       * @param style {String} Style property
       * @return {Integer} Value of given style property
       */
      __num: function __num(elem, style) {
        return parseInt(qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false), 10) || 0;
      },

      /**
       * Computes the scroll offset of the given element relative to the document
       * <code>body</code>.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> scroll offsets
       */
      __computeScroll: function __computeScroll(elem) {
        var left = 0,
            top = 0; // Find window

        var win = qx.dom.Node.getWindow(elem);
        left -= qx.bom.Viewport.getScrollLeft(win);
        top -= qx.bom.Viewport.getScrollTop(win);
        return {
          left: left,
          top: top
        };
      },

      /**
       * Computes the offset of the given element relative to the document
       * <code>body</code>.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
       */
      __computeBody: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(elem) {
          // Find body element
          var doc = qx.dom.Node.getDocument(elem);
          var body = doc.body;
          var left = 0;
          var top = 0;
          left -= body.clientLeft + doc.documentElement.clientLeft;
          top -= body.clientTop + doc.documentElement.clientTop;

          if (!qx.core.Environment.get("browser.quirksmode")) {
            left += this.__num(body, "borderLeftWidth");
            top += this.__num(body, "borderTopWidth");
          }

          return {
            left: left,
            top: top
          };
        },
        "webkit": function webkit(elem) {
          // Find body element
          var doc = qx.dom.Node.getDocument(elem);
          var body = doc.body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop;
          return {
            left: left,
            top: top
          };
        },
        "gecko": function gecko(elem) {
          // Find body element
          var body = qx.dom.Node.getDocument(elem).body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop; // Correct substracted border (only in content-box mode)

          if (qx.bom.element.BoxSizing.get(body) !== "border-box") {
            left += this.__num(body, "borderLeftWidth");
            top += this.__num(body, "borderTopWidth");
          }

          return {
            left: left,
            top: top
          };
        },
        // At the moment only correctly supported by Opera
        "default": function _default(elem) {
          // Find body element
          var body = qx.dom.Node.getDocument(elem).body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop;
          return {
            left: left,
            top: top
          };
        }
      }),

      /**
       * Computes the sum of all offsets of the given element node.
       *
       * @signature function(elem)
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
       */
      __computeOffset: function __computeOffset(elem) {
        var rect = elem.getBoundingClientRect(); // Firefox 3.0 alpha 6 (gecko 1.9) returns floating point numbers
        // use Math.round() to round them to style compatible numbers
        // MSHTML returns integer numbers

        return {
          left: Math.round(rect.left),
          top: Math.round(rect.top)
        };
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
       *
       * @param elem {Element} DOM element to query
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the element relative to the document.
       */
      get: function get(elem, mode) {
        if (elem.tagName == "BODY") {
          var location = this.__getBodyLocation(elem);

          var left = location.left;
          var top = location.top;
        } else {
          var body = this.__computeBody(elem);

          var offset = this.__computeOffset(elem); // Reduce by viewport scrolling.
          // Hint: getBoundingClientRect returns the location of the
          // element in relation to the viewport which includes
          // the scrolling


          var scroll = this.__computeScroll(elem);

          var left = offset.left + body.left - scroll.left;
          var top = offset.top + body.top - scroll.top;
        }

        var elementWidth;
        var elementHeight;

        if (elem instanceof SVGElement) {
          var rect = elem.getBoundingClientRect();
          elementWidth = rect.width;
          elementHeight = rect.height;
        } else {
          elementWidth = elem.offsetWidth;
          elementHeight = elem.offsetHeight;
        }

        var right = left + elementWidth;
        var bottom = top + elementHeight;

        if (mode) {
          // In this modes we want the size as seen from a child what means that we want the full width/height
          // which may be higher than the outer width/height when the element has scrollbars.
          if (mode == "padding" || mode == "scroll") {
            var overX = qx.bom.element.Style.get(elem, "overflowX");

            if (overX == "scroll" || overX == "auto") {
              right += elem.scrollWidth - elementWidth + this.__num(elem, "borderLeftWidth") + this.__num(elem, "borderRightWidth");
            }

            var overY = qx.bom.element.Style.get(elem, "overflowY");

            if (overY == "scroll" || overY == "auto") {
              bottom += elem.scrollHeight - elementHeight + this.__num(elem, "borderTopWidth") + this.__num(elem, "borderBottomWidth");
            }
          }

          switch (mode) {
            case "padding":
              left += this.__num(elem, "paddingLeft");
              top += this.__num(elem, "paddingTop");
              right -= this.__num(elem, "paddingRight");
              bottom -= this.__num(elem, "paddingBottom");
            // no break here

            case "scroll":
              left -= elem.scrollLeft;
              top -= elem.scrollTop;
              right -= elem.scrollLeft;
              bottom -= elem.scrollTop;
            // no break here

            case "border":
              left += this.__num(elem, "borderLeftWidth");
              top += this.__num(elem, "borderTopWidth");
              right -= this.__num(elem, "borderRightWidth");
              bottom -= this.__num(elem, "borderBottomWidth");
              break;

            case "margin":
              left -= this.__num(elem, "marginLeft");
              top -= this.__num(elem, "marginTop");
              right += this.__num(elem, "marginRight");
              bottom += this.__num(elem, "marginBottom");
              break;
          }
        }

        return {
          left: left,
          top: top,
          right: right,
          bottom: bottom
        };
      },

      /**
       * Get the location of the body element relative to the document.
       * @param body {Element} The body element.
       * @return {Map} map with the keys <code>left</code> and <code>top</code>
       */
      __getBodyLocation: function __getBodyLocation(body) {
        var top = body.offsetTop;
        var left = body.offsetLeft;
        top += this.__num(body, "marginTop");
        left += this.__num(body, "marginLeft");

        if (qx.core.Environment.get("engine.name") === "gecko") {
          top += this.__num(body, "borderLeftWidth");
          left += this.__num(body, "borderTopWidth");
        }

        return {
          left: left,
          top: top
        };
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The left distance
       *   of the element relative to the document.
       */
      getLeft: function getLeft(elem, mode) {
        return this.get(elem, mode).left;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The top distance
       *   of the element relative to the document.
       */
      getTop: function getTop(elem, mode) {
        return this.get(elem, mode).top;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The right distance
       *   of the element relative to the document.
       */
      getRight: function getRight(elem, mode) {
        return this.get(elem, mode).right;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The bottom distance
       *   of the element relative to the document.
       */
      getBottom: function getBottom(elem, mode) {
        return this.get(elem, mode).bottom;
      },

      /**
       * Returns the distance between two DOM elements. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem1 {Element} First element
       * @param elem2 {Element} Second element
       * @param mode1 {String?null} Mode for first element
       * @param mode2 {String?null} Mode for second element
       * @return {Map} Returns a map with <code>left</code> and <code>top</code>
       *   which contains the distance of the elements from each other.
       */
      getRelative: function getRelative(elem1, elem2, mode1, mode2) {
        var loc1 = this.get(elem1, mode1);
        var loc2 = this.get(elem2, mode2);
        return {
          left: loc1.left - loc2.left,
          top: loc1.top - loc2.top,
          right: loc1.right - loc2.right,
          bottom: loc1.bottom - loc2.bottom
        };
      },

      /**
       * Returns the distance between the given element to its offset parent.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Returns a map with <code>left</code> and <code>top</code>
       *   which contains the distance of the elements from each other.
       */
      getPosition: function getPosition(elem) {
        return this.getRelative(elem, this.getOffsetParent(elem));
      },

      /**
       * Detects the offset parent of the given element
       *
       * @param element {Element} Element to query for offset parent
       * @return {Element} Detected offset parent
       */
      getOffsetParent: function getOffsetParent(element) {
        // Ther is no offsetParent for SVG elements
        if (element instanceof SVGElement) {
          return document.body;
        }

        var offsetParent = element.offsetParent || document.body;
        var Style = qx.bom.element.Style;

        while (offsetParent && !/^body|html$/i.test(offsetParent.tagName) && Style.get(offsetParent, "position") === "static") {
          offsetParent = offsetParent.offsetParent;
        }

        return offsetParent;
      }
    }
  });
  qx.bom.element.Location.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.Style": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["css.textoverflow", "css.placeholder", "css.borderradius", "css.boxshadow", "css.gradient.linear", "css.gradient.filter", "css.gradient.radial", "css.gradient.legacywebkit", "css.boxmodel", "css.rgba", "css.borderimage", "css.borderimage.standardsyntax", "css.usermodify", "css.userselect", "css.userselect.none", "css.appearance", "css.float", "css.boxsizing", "css.inlineblock", "css.opacity", "css.textShadow", "css.textShadow.filter", "css.alphaimageloaderneeded", "css.pointerevents", "css.flexboxSyntax"],
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The purpose of this class is to contain all checks about css.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   * @ignore(WebKitCSSMatrix)
   * @require(qx.bom.Style)
   */
  qx.Bootstrap.define("qx.bom.client.Css", {
    statics: {
      __WEBKIT_LEGACY_GRADIENT: null,

      /**
       * Checks what box model is used in the current environment.
       * @return {String} It either returns "content" or "border".
       * @internal
       */
      getBoxModel: function getBoxModel() {
        var content = qx.bom.client.Engine.getName() !== "mshtml" || !qx.bom.client.Browser.getQuirksMode();
        return content ? "content" : "border";
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>textOverflow</code> style property.
       *
       * @return {String|null} textOverflow property name or <code>null</code> if
       * textOverflow is not supported.
       * @internal
       */
      getTextOverflow: function getTextOverflow() {
        return qx.bom.Style.getPropertyName("textOverflow");
      },

      /**
       * Checks if a placeholder could be used.
       * @return {Boolean} <code>true</code>, if it could be used.
       * @internal
       */
      getPlaceholder: function getPlaceholder() {
        var i = document.createElement("input");
        return "placeholder" in i;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>appearance</code> style property.
       *
       * @return {String|null} appearance property name or <code>null</code> if
       * appearance is not supported.
       * @internal
       */
      getAppearance: function getAppearance() {
        return qx.bom.Style.getPropertyName("appearance");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>borderRadius</code> style property.
       *
       * @return {String|null} borderRadius property name or <code>null</code> if
       * borderRadius is not supported.
       * @internal
       */
      getBorderRadius: function getBorderRadius() {
        return qx.bom.Style.getPropertyName("borderRadius");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>boxShadow</code> style property.
       *
       * @return {String|null} boxShadow property name or <code>null</code> if
       * boxShadow is not supported.
       * @internal
       */
      getBoxShadow: function getBoxShadow() {
        return qx.bom.Style.getPropertyName("boxShadow");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>borderImage</code> style property.
       *
       * @return {String|null} borderImage property name or <code>null</code> if
       * borderImage is not supported.
       * @internal
       */
      getBorderImage: function getBorderImage() {
        return qx.bom.Style.getPropertyName("borderImage");
      },

      /**
       * Returns the type of syntax this client supports for its CSS border-image
       * implementation. Some browsers do not support the "fill" keyword defined
       * in the W3C draft (http://www.w3.org/TR/css3-background/) and will not
       * show the border image if it's set. Others follow the standard closely and
       * will omit the center image if "fill" is not set.
       *
       * @return {Boolean|null} <code>true</code> if the standard syntax is supported.
       * <code>null</code> if the supported syntax could not be detected.
       * @internal
       */
      getBorderImageSyntax: function getBorderImageSyntax() {
        var styleName = qx.bom.client.Css.getBorderImage();

        if (!styleName) {
          return null;
        }

        var el = document.createElement("div");

        if (styleName === "borderImage") {
          // unprefixed implementation: check individual properties
          el.style[styleName] = 'url("foo.png") 4 4 4 4 fill stretch';

          if (el.style.borderImageSource.indexOf("foo.png") >= 0 && el.style.borderImageSlice.indexOf("4 fill") >= 0 && el.style.borderImageRepeat.indexOf("stretch") >= 0) {
            return true;
          }
        } else {
          // prefixed implementation, assume no support for "fill"
          el.style[styleName] = 'url("foo.png") 4 4 4 4 stretch'; // serialized value is unreliable, so just a simple check

          if (el.style[styleName].indexOf("foo.png") >= 0) {
            return false;
          }
        } // unable to determine syntax


        return null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>userSelect</code> style property.
       *
       * @return {String|null} userSelect property name or <code>null</code> if
       * userSelect is not supported.
       * @internal
       */
      getUserSelect: function getUserSelect() {
        return qx.bom.Style.getPropertyName("userSelect");
      },

      /**
       * Returns the (possibly vendor-prefixed) value for the
       * <code>userSelect</code> style property that disables selection. For Gecko,
       * "-moz-none" is returned since "none" only makes the target element appear
       * as if its text could not be selected
       *
       * @internal
       * @return {String|null} the userSelect property value that disables
       * selection or <code>null</code> if userSelect is not supported
       */
      getUserSelectNone: function getUserSelectNone() {
        var styleProperty = qx.bom.client.Css.getUserSelect();

        if (styleProperty) {
          var el = document.createElement("span");
          el.style[styleProperty] = "-moz-none";
          return el.style[styleProperty] === "-moz-none" ? "-moz-none" : "none";
        }

        return null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>userModify</code> style property.
       *
       * @return {String|null} userModify property name or <code>null</code> if
       * userModify is not supported.
       * @internal
       */
      getUserModify: function getUserModify() {
        return qx.bom.Style.getPropertyName("userModify");
      },

      /**
       * Returns the vendor-specific name of the <code>float</code> style property
       *
       * @return {String|null} <code>cssFloat</code> for standards-compliant
       * browsers, <code>styleFloat</code> for legacy IEs, <code>null</code> if
       * the client supports neither property.
       * @internal
       */
      getFloat: function getFloat() {
        var style = document.documentElement.style;
        return style.cssFloat !== undefined ? "cssFloat" : style.styleFloat !== undefined ? "styleFloat" : null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name this client uses for
       * <code>linear-gradient</code>.
       * http://dev.w3.org/csswg/css3-images/#linear-gradients
       *
       * @return {String|null} Prefixed linear-gradient name or <code>null</code>
       * if linear gradients are not supported
       * @internal
       */
      getLinearGradient: function getLinearGradient() {
        qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT = false;
        var value = "linear-gradient(0deg, #fff, #000)";
        var el = document.createElement("div");
        var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);

        if (!style) {
          //try old WebKit syntax (versions 528 - 534.16)
          value = "-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))";
          var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value, false);

          if (style) {
            qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT = true;
          }
        } // not supported


        if (!style) {
          return null;
        }

        var match = /(.*?)\(/.exec(style);
        return match ? match[1] : null;
      },

      /**
       * Returns <code>true</code> if the browser supports setting gradients
       * using the filter style. This usually only applies for IE browsers
       * starting from IE5.5.
       * http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx
       *
       * @return {Boolean} <code>true</code> if supported.
       * @internal
       */
      getFilterGradient: function getFilterGradient() {
        return qx.bom.client.Css.__isFilterSupported("DXImageTransform.Microsoft.Gradient", "startColorStr=#550000FF, endColorStr=#55FFFF00");
      },

      /**
       * Returns the (possibly vendor-prefixed) name this client uses for
       * <code>radial-gradient</code>.
       *
       * @return {String|null} Prefixed radial-gradient name or <code>null</code>
       * if radial gradients are not supported
       * @internal
       */
      getRadialGradient: function getRadialGradient() {
        var value = "radial-gradient(0px 0px, cover, red 50%, blue 100%)";
        var el = document.createElement("div");
        var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);

        if (!style) {
          return null;
        }

        var match = /(.*?)\(/.exec(style);
        return match ? match[1] : null;
      },

      /**
       * Checks if **only** the old WebKit (version < 534.16) syntax for
       * linear gradients is supported, e.g.
       * <code>linear-gradient(0deg, #fff, #000)</code>
       *
       * @return {Boolean} <code>true</code> if the legacy syntax must be used
       * @internal
       */
      getLegacyWebkitGradient: function getLegacyWebkitGradient() {
        if (qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT === null) {
          qx.bom.client.Css.getLinearGradient();
        }

        return qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT;
      },

      /**
       * Checks if rgba colors can be used:
       * http://www.w3.org/TR/2010/PR-css3-color-20101028/#rgba-color
       *
       * @return {Boolean} <code>true</code>, if rgba colors are supported.
       * @internal
       */
      getRgba: function getRgba() {
        var el;

        try {
          el = document.createElement("div");
        } catch (ex) {
          el = document.createElement();
        } // try catch for IE


        try {
          el.style["color"] = "rgba(1, 2, 3, 0.5)";

          if (el.style["color"].indexOf("rgba") != -1) {
            return true;
          }
        } catch (ex) {}

        return false;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>boxSizing</code> style property.
       *
       * @return {String|null} boxSizing property name or <code>null</code> if
       * boxSizing is not supported.
       * @internal
       */
      getBoxSizing: function getBoxSizing() {
        return qx.bom.Style.getPropertyName("boxSizing");
      },

      /**
       * Returns the browser-specific name used for the <code>display</code> style
       * property's <code>inline-block</code> value.
       *
       * @internal
       * @return {String|null}
       */
      getInlineBlock: function getInlineBlock() {
        var el = document.createElement("span");
        el.style.display = "inline-block";

        if (el.style.display == "inline-block") {
          return "inline-block";
        }

        el.style.display = "-moz-inline-box";

        if (el.style.display !== "-moz-inline-box") {
          return "-moz-inline-box";
        }

        return null;
      },

      /**
       * Checks if CSS opacity is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if opacity is supported
       */
      getOpacity: function getOpacity() {
        return typeof document.documentElement.style.opacity == "string";
      },

      /**
       * Checks if CSS texShadow is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if textShadow is supported
       */
      getTextShadow: function getTextShadow() {
        return !!qx.bom.Style.getPropertyName("textShadow");
      },

      /**
       * Returns <code>true</code> if the browser supports setting text shadow
       * using the filter style. This usually only applies for IE browsers
       * starting from IE5.5.
       *
       * @internal
       * @return {Boolean} <code>true</code> if textShadow is supported
       */
      getFilterTextShadow: function getFilterTextShadow() {
        return qx.bom.client.Css.__isFilterSupported("DXImageTransform.Microsoft.Shadow", "color=#666666,direction=45");
      },

      /**
       * Checks if the given filter is supported.
       *
       * @param filterClass {String} The name of the filter class
       * @param initParams {String} Init values for the filter
       * @return {Boolean} <code>true</code> if the given filter is supported
       */
      __isFilterSupported: function __isFilterSupported(filterClass, initParams) {
        var supported = false;
        var value = "progid:" + filterClass + "(" + initParams + ");";
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.style.filter = value;

        if (el.filters && el.filters.length > 0 && el.filters.item(filterClass).enabled == true) {
          supported = true;
        }

        document.body.removeChild(el);
        return supported;
      },

      /**
       * Checks if the Alpha Image Loader must be used to display transparent PNGs.
       *
       * @return {Boolean} <code>true</code> if the Alpha Image Loader is required
       */
      getAlphaImageLoaderNeeded: function getAlphaImageLoaderNeeded() {
        return qx.bom.client.Engine.getName() == "mshtml" && qx.bom.client.Browser.getDocumentMode() < 9;
      },

      /**
       * Checks if pointer events are available.
       *
       * @internal
       * @return {Boolean} <code>true</code> if pointer events are supported.
       */
      getPointerEvents: function getPointerEvents() {
        var el = document.documentElement; // Check if browser reports that pointerEvents is a known style property

        if ("pointerEvents" in el.style) {
          // The property is defined in Opera and IE9 but setting it has no effect
          var initial = el.style.pointerEvents;
          el.style.pointerEvents = "auto"; // don't assume support if a nonsensical value isn't ignored

          el.style.pointerEvents = "foo";
          var supported = el.style.pointerEvents == "auto";
          el.style.pointerEvents = initial;
          return supported;
        }

        return false;
      },

      /**
       * Returns which Flexbox syntax is supported by the browser.
       * <code>display: box;</code> old 2009 version of Flexbox.
       * <code>display: flexbox;</code> tweener phase in 2011.
       * <code>display: flex;</code> current specification.
       * @internal
       * @return {String} <code>flex</code>,<code>flexbox</code>,<code>box</code> or <code>null</code>
       */
      getFlexboxSyntax: function getFlexboxSyntax() {
        var detectedSyntax = null;
        var detector = document.createElement("detect");
        var flexSyntax = [{
          value: "flex",
          syntax: "flex"
        }, {
          value: "-ms-flexbox",
          syntax: "flexbox"
        }, {
          value: "-webkit-flex",
          syntax: "flex"
        }];

        for (var i = 0; i < flexSyntax.length; i++) {
          // old IEs will throw an "Invalid argument" exception here
          try {
            detector.style.display = flexSyntax[i].value;
          } catch (ex) {
            return null;
          }

          if (detector.style.display === flexSyntax[i].value) {
            detectedSyntax = flexSyntax[i].syntax;
            break;
          }
        }

        detector = null;
        return detectedSyntax;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("css.textoverflow", statics.getTextOverflow);
      qx.core.Environment.add("css.placeholder", statics.getPlaceholder);
      qx.core.Environment.add("css.borderradius", statics.getBorderRadius);
      qx.core.Environment.add("css.boxshadow", statics.getBoxShadow);
      qx.core.Environment.add("css.gradient.linear", statics.getLinearGradient);
      qx.core.Environment.add("css.gradient.filter", statics.getFilterGradient);
      qx.core.Environment.add("css.gradient.radial", statics.getRadialGradient);
      qx.core.Environment.add("css.gradient.legacywebkit", statics.getLegacyWebkitGradient);
      qx.core.Environment.add("css.boxmodel", statics.getBoxModel);
      qx.core.Environment.add("css.rgba", statics.getRgba);
      qx.core.Environment.add("css.borderimage", statics.getBorderImage);
      qx.core.Environment.add("css.borderimage.standardsyntax", statics.getBorderImageSyntax);
      qx.core.Environment.add("css.usermodify", statics.getUserModify);
      qx.core.Environment.add("css.userselect", statics.getUserSelect);
      qx.core.Environment.add("css.userselect.none", statics.getUserSelectNone);
      qx.core.Environment.add("css.appearance", statics.getAppearance);
      qx.core.Environment.add("css.float", statics.getFloat);
      qx.core.Environment.add("css.boxsizing", statics.getBoxSizing);
      qx.core.Environment.add("css.inlineblock", statics.getInlineBlock);
      qx.core.Environment.add("css.opacity", statics.getOpacity);
      qx.core.Environment.add("css.textShadow", statics.getTextShadow);
      qx.core.Environment.add("css.textShadow.filter", statics.getFilterTextShadow);
      qx.core.Environment.add("css.alphaimageloaderneeded", statics.getAlphaImageLoaderNeeded);
      qx.core.Environment.add("css.pointerevents", statics.getPointerEvents);
      qx.core.Environment.add("css.flexboxSyntax", statics.getFlexboxSyntax);
    }
  });
  qx.bom.client.Css.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.normalize.String": {
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Style": {}
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
   * Contains methods to control and query the element's clip property
   *
   * @require(qx.lang.normalize.String)
   */
  qx.Bootstrap.define("qx.bom.element.Clip", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Compiles the given clipping into a CSS compatible string. This
       * is a simple square which describes the visible area of an DOM element.
       * Changing the clipping does not change the dimensions of
       * an element.
       *
       * @param map {Map}  Map which contains <code>left</code>, <code>top</code>
       *   <code>width</code> and <code>height</code> of the clipped area.
       * @return {String} CSS compatible string
       */
      compile: function compile(map) {
        if (!map) {
          return "clip:auto;";
        }

        var left = map.left;
        var top = map.top;
        var width = map.width;
        var height = map.height;
        var right, bottom;

        if (left == null) {
          right = width == null ? "auto" : width + "px";
          left = "auto";
        } else {
          right = width == null ? "auto" : left + width + "px";
          left = left + "px";
        }

        if (top == null) {
          bottom = height == null ? "auto" : height + "px";
          top = "auto";
        } else {
          bottom = height == null ? "auto" : top + height + "px";
          top = top + "px";
        }

        return "clip:rect(" + top + "," + right + "," + bottom + "," + left + ");";
      },

      /**
       * Gets the clipping of the given element.
       *
       * @param element {Element} DOM element to query
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {Map} Map which contains <code>left</code>, <code>top</code>
       *   <code>width</code> and <code>height</code> of the clipped area.
       *   Each one could be null or any integer value.
       */
      get: function get(element, mode) {
        var clip = qx.bom.element.Style.get(element, "clip", mode, false);
        var left, top, width, height;
        var right, bottom;

        if (typeof clip === "string" && clip !== "auto" && clip !== "") {
          clip = clip.trim(); // Do not use "global" here. This will break Firefox because of
          // an issue that the lastIndex will not be reset on separate calls.

          if (/\((.*)\)/.test(clip)) {
            var result = RegExp.$1; // Process result
            // Some browsers store values space-separated, others comma-separated.
            // Handle both cases by means of feature-detection.

            if (/,/.test(result)) {
              var split = result.split(",");
            } else {
              var split = result.split(" ");
            }

            top = split[0].trim();
            right = split[1].trim();
            bottom = split[2].trim();
            left = split[3].trim(); // Normalize "auto" to null

            if (left === "auto") {
              left = null;
            }

            if (top === "auto") {
              top = null;
            }

            if (right === "auto") {
              right = null;
            }

            if (bottom === "auto") {
              bottom = null;
            } // Convert to integer values


            if (top != null) {
              top = parseInt(top, 10);
            }

            if (right != null) {
              right = parseInt(right, 10);
            }

            if (bottom != null) {
              bottom = parseInt(bottom, 10);
            }

            if (left != null) {
              left = parseInt(left, 10);
            } // Compute width and height


            if (right != null && left != null) {
              width = right - left;
            } else if (right != null) {
              width = right;
            }

            if (bottom != null && top != null) {
              height = bottom - top;
            } else if (bottom != null) {
              height = bottom;
            }
          } else {
            throw new Error("Could not parse clip string: " + clip);
          }
        } // Return map when any value is available.


        return {
          left: left || null,
          top: top || null,
          width: width || null,
          height: height || null
        };
      },

      /**
       * Sets the clipping of the given element. This is a simple
       * square which describes the visible area of an DOM element.
       * Changing the clipping does not change the dimensions of
       * an element.
       *
       * @param element {Element} DOM element to modify
       * @param map {Map} A map with one or more of these available keys:
       *   <code>left</code>, <code>top</code>, <code>width</code>, <code>height</code>.
       */
      set: function set(element, map) {
        if (!map) {
          element.style.clip = "rect(auto,auto,auto,auto)";
          return;
        }

        var left = map.left;
        var top = map.top;
        var width = map.width;
        var height = map.height;
        var right, bottom;

        if (left == null) {
          right = width == null ? "auto" : width + "px";
          left = "auto";
        } else {
          right = width == null ? "auto" : left + width + "px";
          left = left + "px";
        }

        if (top == null) {
          bottom = height == null ? "auto" : height + "px";
          top = "auto";
        } else {
          bottom = height == null ? "auto" : top + height + "px";
          top = top + "px";
        }

        element.style.clip = "rect(" + top + "," + right + "," + bottom + "," + left + ")";
      },

      /**
       * Resets the clipping of the given DOM element.
       *
       * @param element {Element} DOM element to modify
       */
      reset: function reset(element) {
        element.style.clip = "rect(auto, auto, auto, auto)";
      }
    }
  });
  qx.bom.element.Clip.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Style": {},
      "qx.bom.client.Engine": {
        "defer": "runtime"
      },
      "qx.bom.client.Browser": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.quirksmode": {
          "defer": true,
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
  
  ************************************************************************ */

  /**
   * Contains methods to control and query the element's cursor property
   */
  qx.Bootstrap.define("qx.bom.element.Cursor", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Internal helper structure to map cursor values to supported ones */
      __map: {},

      /**
       * Compiles the given cursor into a CSS compatible string.
       *
       * @param cursor {String} Valid CSS cursor name
       * @return {String} CSS string
       */
      compile: function compile(cursor) {
        return "cursor:" + (this.__map[cursor] || cursor) + ";";
      },

      /**
       * Returns the computed cursor style for the given element.
       *
       * @param element {Element} The element to query
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {String} Computed cursor value of the given element.
       */
      get: function get(element, mode) {
        return qx.bom.element.Style.get(element, "cursor", mode, false);
      },

      /**
       * Applies a new cursor style to the given element
       *
       * @param element {Element} The element to modify
       * @param value {String} New cursor value to set
       */
      set: function set(element, value) {
        element.style.cursor = this.__map[value] || value;
      },

      /**
       * Removes the local cursor style applied to the element
       *
       * @param element {Element} The element to modify
       */
      reset: function reset(element) {
        element.style.cursor = "";
      }
    },
    defer: function defer(statics) {
      // < IE 9
      if (qx.core.Environment.get("engine.name") == "mshtml" && (parseFloat(qx.core.Environment.get("engine.version")) < 9 || qx.core.Environment.get("browser.documentmode") < 9) && !qx.core.Environment.get("browser.quirksmode")) {
        statics.__map["nesw-resize"] = "ne-resize";
        statics.__map["nwse-resize"] = "nw-resize";
      }
    }
  });
  qx.bom.element.Cursor.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Css": {},
      "qx.bom.element.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "css.opacity": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Christian Hagendorn (chris_schmidt)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Cross-browser opacity support.
   *
   * Optimized for animations (contains workarounds for typical flickering
   * in some browsers). Reduced class dependencies for optimal size and
   * performance.
   */
  qx.Bootstrap.define("qx.bom.element.Opacity", {
    statics: {
      /**
       * Compiles the given opacity value into a cross-browser CSS string.
       * Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @signature function(opacity)
       * @param opacity {Float} A float number between 0 and 1
       * @return {String} CSS compatible string
       */
      compile: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(opacity) {
          if (opacity >= 1) {
            opacity = 1;
          }

          if (opacity < 0.00001) {
            opacity = 0;
          }

          if (qx.core.Environment.get("css.opacity")) {
            return "opacity:" + opacity + ";";
          } else {
            return "zoom:1;filter:alpha(opacity=" + opacity * 100 + ");";
          }
        },
        "default": function _default(opacity) {
          return "opacity:" + opacity + ";";
        }
      }),

      /**
       * Sets opacity of given element. Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @param element {Element} DOM element to modify
       * @param opacity {Float} A float number between 0 and 1
       * @signature function(element, opacity)
       */
      set: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element, opacity) {
          if (qx.core.Environment.get("css.opacity")) {
            element.style.opacity = opacity;
          } else {
            // Read in computed filter
            var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false);

            if (opacity >= 1) {
              opacity = 1;
            }

            if (opacity < 0.00001) {
              opacity = 0;
            } // IE has trouble with opacity if it does not have layout (hasLayout)
            // Force it by setting the zoom level


            if (!element.currentStyle || !element.currentStyle.hasLayout) {
              element.style.zoom = 1;
            } // Remove old alpha filter and add new one


            element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "") + "alpha(opacity=" + opacity * 100 + ")";
          }
        },
        "default": function _default(element, opacity) {
          element.style.opacity = opacity;
        }
      }),

      /**
       * Resets opacity of given element.
       *
       * @param element {Element} DOM element to modify
       * @signature function(element)
       */
      reset: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element) {
          if (qx.core.Environment.get("css.opacity")) {
            element.style.opacity = "";
          } else {
            // Read in computed filter
            var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false); // Remove old alpha filter

            element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "");
          }
        },
        "default": function _default(element) {
          element.style.opacity = "";
        }
      }),

      /**
       * Gets computed opacity of given element. Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @param element {Element} DOM element to modify
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {Float} A float number between 0 and 1
       * @signature function(element, mode)
       */
      get: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element, mode) {
          if (qx.core.Environment.get("css.opacity")) {
            var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);

            if (opacity != null) {
              return parseFloat(opacity);
            }

            return 1.0;
          } else {
            var filter = qx.bom.element.Style.get(element, "filter", mode, false);

            if (filter) {
              var opacity = filter.match(/alpha\(opacity=(.*)\)/);

              if (opacity && opacity[1]) {
                return parseFloat(opacity[1]) / 100;
              }
            }

            return 1.0;
          }
        },
        "default": function _default(element, mode) {
          var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);

          if (opacity != null) {
            return parseFloat(opacity);
          }

          return 1.0;
        }
      })
    }
  });
  qx.bom.element.Opacity.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Css": {},
      "qx.bom.Style": {},
      "qx.log.Logger": {},
      "qx.bom.element.Style": {},
      "qx.bom.Document": {},
      "qx.dom.Node": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxsizing": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Contains methods to control and query the element's box-sizing property.
   *
   * Supported values:
   *
   * * "content-box" = W3C model (dimensions are content specific)
   * * "border-box" = Microsoft model (dimensions are box specific incl. border and padding)
   */
  qx.Bootstrap.define("qx.bom.element.BoxSizing", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} Internal data structure for __usesNativeBorderBox() */
      __nativeBorderBox: {
        tags: {
          button: true,
          select: true
        },
        types: {
          search: true,
          button: true,
          submit: true,
          reset: true,
          checkbox: true,
          radio: true
        }
      },

      /**
       * Whether the given elements defaults to the "border-box" Microsoft model in all cases.
       *
       * @param element {Element} DOM element to query
       * @return {Boolean} true when the element uses "border-box" independently from the doctype
       */
      __usesNativeBorderBox: function __usesNativeBorderBox(element) {
        var map = this.__nativeBorderBox;
        return map.tags[element.tagName.toLowerCase()] || map.types[element.type];
      },

      /**
       * Compiles the given box sizing into a CSS compatible string.
       *
       * @param value {String} Valid CSS box-sizing value
       * @return {String} CSS string
       */
      compile: function compile(value) {
        if (qx.core.Environment.get("css.boxsizing")) {
          var prop = qx.bom.Style.getCssName(qx.core.Environment.get("css.boxsizing"));
          return prop + ":" + value + ";";
        } else {
          {
            qx.log.Logger.warn(this, "This client does not support dynamic modification of the boxSizing property.");
            qx.log.Logger.trace();
          }
        }
      },

      /**
       * Returns the box sizing for the given element.
       *
       * @param element {Element} The element to query
       * @return {String} Box sizing value of the given element.
       */
      get: function get(element) {
        if (qx.core.Environment.get("css.boxsizing")) {
          return qx.bom.element.Style.get(element, "boxSizing", null, false) || "";
        }

        if (qx.bom.Document.isStandardMode(qx.dom.Node.getWindow(element))) {
          if (!this.__usesNativeBorderBox(element)) {
            return "content-box";
          }
        }

        return "border-box";
      },

      /**
       * Applies a new box sizing to the given element
       *
       * @param element {Element} The element to modify
       * @param value {String} New box sizing value to set
       */
      set: function set(element, value) {
        if (qx.core.Environment.get("css.boxsizing")) {
          // IE8 bombs when trying to apply an unsupported value
          try {
            element.style[qx.core.Environment.get("css.boxsizing")] = value;
          } catch (ex) {
            {
              qx.log.Logger.warn(this, "This client does not support the boxSizing value", value);
            }
          }
        } else {
          {
            qx.log.Logger.warn(this, "This client does not support dynamic modification of the boxSizing property.");
          }
        }
      },

      /**
       * Removes the local box sizing applied to the element
       *
       * @param element {Element} The element to modify
       */
      reset: function reset(element) {
        this.set(element, "");
      }
    }
  });
  qx.bom.element.BoxSizing.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.String": {
        "require": true,
        "defer": "runtime"
      },
      "qx.bom.client.Css": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Object": {},
      "qx.bom.Style": {},
      "qx.bom.element.Clip": {
        "require": true
      },
      "qx.bom.element.Cursor": {
        "require": true
      },
      "qx.bom.element.Opacity": {
        "require": true
      },
      "qx.bom.element.BoxSizing": {
        "require": true
      },
      "qx.core.Assert": {},
      "qx.dom.Node": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.appearance": {
          "className": "qx.bom.client.Css"
        },
        "css.userselect": {
          "className": "qx.bom.client.Css"
        },
        "css.textoverflow": {
          "className": "qx.bom.client.Css"
        },
        "css.borderimage": {
          "className": "qx.bom.client.Css"
        },
        "css.float": {
          "className": "qx.bom.client.Css"
        },
        "css.usermodify": {
          "className": "qx.bom.client.Css"
        },
        "css.boxsizing": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Style querying and modification of HTML elements.
   *
   * Automatically normalizes cross-browser differences for setting and reading
   * CSS attributes. Optimized for performance.
   *
   * @require(qx.lang.String)
   * @require(qx.bom.client.Css)
  
   * @require(qx.bom.element.Clip#set)
   * @require(qx.bom.element.Cursor#set)
   * @require(qx.bom.element.Opacity#set)
   * @require(qx.bom.element.BoxSizing#set)
  
   * @require(qx.bom.element.Clip#get)
   * @require(qx.bom.element.Cursor#get)
   * @require(qx.bom.element.Opacity#get)
   * @require(qx.bom.element.BoxSizing#get)
  
   * @require(qx.bom.element.Clip#reset)
   * @require(qx.bom.element.Cursor#reset)
   * @require(qx.bom.element.Opacity#reset)
   * @require(qx.bom.element.BoxSizing#reset)
  
   * @require(qx.bom.element.Clip#compile)
   * @require(qx.bom.element.Cursor#compile)
   * @require(qx.bom.element.Opacity#compile)
   * @require(qx.bom.element.BoxSizing#compile)
   */
  qx.Bootstrap.define("qx.bom.element.Style", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      __styleNames: null,
      __cssNames: null,

      /**
       * Detect vendor specific properties.
       */
      __detectVendorProperties: function __detectVendorProperties() {
        var styleNames = {
          "appearance": qx.core.Environment.get("css.appearance"),
          "userSelect": qx.core.Environment.get("css.userselect"),
          "textOverflow": qx.core.Environment.get("css.textoverflow"),
          "borderImage": qx.core.Environment.get("css.borderimage"),
          "float": qx.core.Environment.get("css.float"),
          "userModify": qx.core.Environment.get("css.usermodify"),
          "boxSizing": qx.core.Environment.get("css.boxsizing")
        };
        this.__cssNames = {};

        for (var key in qx.lang.Object.clone(styleNames)) {
          if (!styleNames[key]) {
            delete styleNames[key];
          } else {
            if (key === 'float') {
              this.__cssNames['cssFloat'] = key;
            } else {
              this.__cssNames[key] = qx.bom.Style.getCssName(styleNames[key]);
            }
          }
        }

        this.__styleNames = styleNames;
      },

      /**
       * Gets the (possibly vendor-prefixed) name of a style property and stores
       * it to avoid multiple checks.
       *
       * @param name {String} Style property name to check
       * @return {String|null} The client-specific name of the property, or
       * <code>null</code> if it's not supported.
       */
      __getStyleName: function __getStyleName(name) {
        var styleName = qx.bom.Style.getPropertyName(name);

        if (styleName) {
          this.__styleNames[name] = styleName;
        }

        return styleName;
      },

      /**
       * Mshtml has proprietary pixel* properties for locations and dimensions
       * which return the pixel value. Used by getComputed() in mshtml variant.
       *
       * @internal
       */
      __mshtmlPixel: {
        width: "pixelWidth",
        height: "pixelHeight",
        left: "pixelLeft",
        right: "pixelRight",
        top: "pixelTop",
        bottom: "pixelBottom"
      },

      /**
       * Whether a special class is available for the processing of this style.
       *
       * @internal
       */
      __special: {
        clip: qx.bom.element.Clip,
        cursor: qx.bom.element.Cursor,
        opacity: qx.bom.element.Opacity,
        boxSizing: qx.bom.element.BoxSizing
      },

      /*
      ---------------------------------------------------------------------------
        COMPILE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Compiles the given styles into a string which can be used to
       * concat a HTML string for innerHTML usage.
       *
       * @param map {Map} Map of style properties to compile
       * @return {String} Compiled string of given style properties.
       */
      compile: function compile(map) {
        var html = [];
        var special = this.__special;
        var cssNames = this.__cssNames;
        var name, value;

        for (name in map) {
          // read value
          value = map[name];

          if (value == null) {
            continue;
          } // normalize name


          name = this.__cssNames[name] || name; // process special properties

          if (special[name]) {
            html.push(special[name].compile(value));
          } else {
            if (!cssNames[name]) {
              cssNames[name] = qx.bom.Style.getCssName(name);
            }

            html.push(cssNames[name], ":", value === "" ? "\"\"" : value, ";");
          }
        }

        return html.join("");
      },

      /*
      ---------------------------------------------------------------------------
        CSS TEXT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Set the full CSS content of the style attribute
       *
       * @param element {Element} The DOM element to modify
       * @param value {String} The full CSS string
       */
      setCss: function setCss(element, value) {
        element.setAttribute("style", value);
      },

      /**
       * Returns the full content of the style attribute.
       *
       * @param element {Element} The DOM element to query
       * @return {String} the full CSS string
       * @signature function(element)
       */
      getCss: function getCss(element) {
        return element.getAttribute("style");
      },

      /*
      ---------------------------------------------------------------------------
        STYLE ATTRIBUTE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Checks whether the browser supports the given CSS property.
       *
       * @param propertyName {String} The name of the property
       * @return {Boolean} Whether the property id supported
       */
      isPropertySupported: function isPropertySupported(propertyName) {
        return this.__special[propertyName] || this.__styleNames[propertyName] || propertyName in document.documentElement.style;
      },

      /** @type {Integer} Computed value of a style property. Compared to the cascaded style,
       * this one also interprets the values e.g. translates <code>em</code> units to
       * <code>px</code>.
       */
      COMPUTED_MODE: 1,

      /** @type {Integer} Cascaded value of a style property. */
      CASCADED_MODE: 2,

      /**
       * @type {Integer} Local value of a style property. Ignores inheritance cascade.
       *   Does not interpret values.
       */
      LOCAL_MODE: 3,

      /**
       * Sets the value of a style property
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param value {var} The value for the given style
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      set: function set(element, name, value, smart) {
        {
          qx.core.Assert.assertElement(element, "Invalid argument 'element'");
          qx.core.Assert.assertString(name, "Invalid argument 'name'");

          if (smart !== undefined) {
            qx.core.Assert.assertBoolean(smart, "Invalid argument 'smart'");
          }
        } // normalize name

        name = this.__styleNames[name] || this.__getStyleName(name) || name; // special handling for specific properties
        // through this good working switch this part costs nothing when
        // processing non-smart properties

        if (smart !== false && this.__special[name]) {
          this.__special[name].set(element, value);
        } else {
          element.style[name] = value !== null ? value : "";
        }
      },

      /**
       * Convenience method to modify a set of styles at once.
       *
       * @param element {Element} The DOM element to modify
       * @param styles {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      setStyles: function setStyles(element, styles, smart) {
        {
          qx.core.Assert.assertElement(element, "Invalid argument 'element'");
          qx.core.Assert.assertMap(styles, "Invalid argument 'styles'");

          if (smart !== undefined) {
            qx.core.Assert.assertBoolean(smart, "Invalid argument 'smart'");
          }
        } // inline calls to "set" and "reset" because this method is very
        // performance critical!

        var styleNames = this.__styleNames;
        var special = this.__special;
        var style = element.style;

        for (var key in styles) {
          var value = styles[key];
          var name = styleNames[key] || this.__getStyleName(key) || key;

          if (value === undefined) {
            if (smart !== false && special[name]) {
              special[name].reset(element);
            } else {
              style[name] = "";
            }
          } else {
            if (smart !== false && special[name]) {
              special[name].set(element, value);
            } else {
              style[name] = value !== null ? value : "";
            }
          }
        }
      },

      /**
       * Resets the value of a style property
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      reset: function reset(element, name, smart) {
        // normalize name
        name = this.__styleNames[name] || this.__getStyleName(name) || name; // special handling for specific properties

        if (smart !== false && this.__special[name]) {
          this.__special[name].reset(element);
        } else {
          element.style[name] = "";
        }
      },

      /**
       * Gets the value of a style property.
       *
       * *Computed*
       *
       * Returns the computed value of a style property. Compared to the cascaded style,
       * this one also interprets the values e.g. translates <code>em</code> units to
       * <code>px</code>.
       *
       * *Cascaded*
       *
       * Returns the cascaded value of a style property.
       *
       * *Local*
       *
       * Ignores inheritance cascade. Does not interpret values.
       *
       * @signature function(element, name, mode, smart)
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param mode {Number} Choose one of the modes {@link #COMPUTED_MODE}, {@link #CASCADED_MODE},
       *   {@link #LOCAL_MODE}. The computed mode is the default one.
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       * @return {var} The value of the property
       */
      get: function get(element, name, mode, smart) {
        // normalize name
        name = this.__styleNames[name] || this.__getStyleName(name) || name; // special handling

        if (smart !== false && this.__special[name]) {
          return this.__special[name].get(element, mode);
        } // switch to right mode


        switch (mode) {
          case this.LOCAL_MODE:
            return element.style[name] || "";

          case this.CASCADED_MODE:
            // Currently only supported by Opera and Internet Explorer
            if (element.currentStyle) {
              return element.currentStyle[name] || "";
            }

            throw new Error("Cascaded styles are not supported in this browser!");

          default:
            // Opera, Mozilla and Safari 3+ also have a global getComputedStyle which is identical
            // to the one found under document.defaultView.
            // The problem with this is however that this does not work correctly
            // when working with frames and access an element of another frame.
            // Then we must use the <code>getComputedStyle</code> of the document
            // where the element is defined.
            var doc = qx.dom.Node.getDocument(element);
            var getStyle = doc.defaultView ? doc.defaultView.getComputedStyle : undefined;

            if (getStyle !== undefined) {
              // Support for the DOM2 getComputedStyle method
              //
              // Safari >= 3 & Gecko > 1.4 expose all properties to the returned
              // CSSStyleDeclaration object. In older browsers the function
              // "getPropertyValue" is needed to access the values.
              //
              // On a computed style object all properties are read-only which is
              // identical to the behavior of MSHTML's "currentStyle".
              var computed = getStyle(element, null); // All relevant browsers expose the configured style properties to
              // the CSSStyleDeclaration objects

              if (computed && computed[name]) {
                return computed[name];
              }
            } else {
              // if the element is not inserted into the document "currentStyle"
              // may be undefined. In this case always return the local style.
              if (!element.currentStyle) {
                return element.style[name] || "";
              } // Read cascaded style. Shorthand properties like "border" are not available
              // on the currentStyle object.


              var currentStyle = element.currentStyle[name] || element.style[name] || ""; // Pixel values are always OK

              if (/^-?[\.\d]+(px)?$/i.test(currentStyle)) {
                return currentStyle;
              } // Try to convert non-pixel values


              var pixel = this.__mshtmlPixel[name];

              if (pixel && pixel in element.style) {
                // Backup local and runtime style
                var localStyle = element.style[name]; // Overwrite local value with cascaded value
                // This is needed to have the pixel value setup

                element.style[name] = currentStyle || 0; // Read pixel value and add "px"

                var value = element.style[pixel] + "px"; // Recover old local value

                element.style[name] = localStyle; // Return value

                return value;
              } // Just the current style


              return currentStyle;
            }

            return element.style[name] || "";
        }
      }
    },
    defer: function defer(statics) {
      statics.__detectVendorProperties();
    }
  });
  qx.bom.element.Style.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Html": {
        "require": true
      },
      "qx.log.Logger": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.classlist": {
          "load": true,
          "className": "qx.bom.client.Html"
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Base2
       http://code.google.com/p/base2/
       Version 0.9
  
       Copyright:
         (c) 2006-2007, Dean Edwards
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Dean Edwards
  
  ************************************************************************ */

  /**
   * CSS class name support for HTML elements. Supports multiple class names
   * for each element. Can query and apply class names to HTML elements.
   */
  qx.Bootstrap.define("qx.bom.element.Class", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {RegExp} Regular expressions to split class names */
      __splitter: /\s+/g,

      /** @type {RegExp} String trim regular expression. */
      __trim: /^\s+|\s+$/g,

      /**
       * Adds a className to the given element
       * If successfully added the given className will be returned
       *
       * @signature function(element, name)
       * @param element {Element} The element to modify
       * @param name {String} The class name to add
       * @return {String} The added classname (if so)
       */
      add: {
        "native": function native(element, name) {
          if (name.length > 0) {
            element.classList.add(name);
          }

          return name;
        },
        "default": function _default(element, name) {
          if (!this.has(element, name)) {
            element.className += (element.className ? " " : "") + name;
          }

          return name;
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Adds multiple classes to the given element
       *
       * @signature function(element, classes)
       * @param element {Element} DOM element to modify
       * @param classes {String[]} List of classes to add.
       * @return {String} The resulting class name which was applied
       */
      addClasses: {
        "native": function native(element, classes) {
          for (var i = 0; i < classes.length; i++) {
            if (classes[i].length > 0) {
              element.classList.add(classes[i]);
            }
          }

          return element.className;
        },
        "default": function _default(element, classes) {
          var keys = {};
          var result;
          var old = element.className;

          if (old) {
            result = old.split(this.__splitter);

            for (var i = 0, l = result.length; i < l; i++) {
              keys[result[i]] = true;
            }

            for (var i = 0, l = classes.length; i < l; i++) {
              if (!keys[classes[i]]) {
                result.push(classes[i]);
              }
            }
          } else {
            result = classes;
          }

          return element.className = result.join(" ");
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Gets the classname of the given element
       *
       * @param element {Element} The element to query
       * @return {String} The retrieved classname
       */
      get: function get(element) {
        var className = element.className;

        if (typeof className.split !== 'function') {
          if (_typeof(className) === 'object') {
            if (qx.Bootstrap.getClass(className) == 'SVGAnimatedString') {
              className = className.baseVal;
            } else {
              {
                qx.log.Logger.warn(this, "className for element " + element + " cannot be determined");
              }
              className = '';
            }
          }

          if (typeof className === 'undefined') {
            {
              qx.log.Logger.warn(this, "className for element " + element + " is undefined");
            }
            className = '';
          }
        }

        return className;
      },

      /**
       * Whether the given element has the given className.
       *
       * @signature function(element, name)
       * @param element {Element} The DOM element to check
       * @param name {String} The class name to check for
       * @return {Boolean} true when the element has the given classname
       */
      has: {
        "native": function native(element, name) {
          return element.classList.contains(name);
        },
        "default": function _default(element, name) {
          var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
          return regexp.test(element.className);
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Removes a className from the given element
       *
       * @signature function(element, name)
       * @param element {Element} The DOM element to modify
       * @param name {String} The class name to remove
       * @return {String} The removed class name
       */
      remove: {
        "native": function native(element, name) {
          element.classList.remove(name);
          return name;
        },
        "default": function _default(element, name) {
          var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
          element.className = element.className.replace(regexp, "$2");
          return name;
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Removes multiple classes from the given element
       *
       * @signature function(element, classes)
       * @param element {Element} DOM element to modify
       * @param classes {String[]} List of classes to remove.
       * @return {String} The resulting class name which was applied
       */
      removeClasses: {
        "native": function native(element, classes) {
          for (var i = 0; i < classes.length; i++) {
            element.classList.remove(classes[i]);
          }

          return element.className;
        },
        "default": function _default(element, classes) {
          var reg = new RegExp("\\b" + classes.join("\\b|\\b") + "\\b", "g");
          return element.className = element.className.replace(reg, "").replace(this.__trim, "").replace(this.__splitter, " ");
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Replaces the first given class name with the second one
       *
       * @param element {Element} The DOM element to modify
       * @param oldName {String} The class name to remove
       * @param newName {String} The class name to add
       * @return {String} The added class name
       */
      replace: function replace(element, oldName, newName) {
        if (!this.has(element, oldName)) {
          return "";
        }

        this.remove(element, oldName);
        return this.add(element, newName);
      },

      /**
       * Toggles a className of the given element
       *
       * @signature function(element, name, toggle)
       * @param element {Element} The DOM element to modify
       * @param name {String} The class name to toggle
       * @param toggle {Boolean?null} Whether to switch class on/off. Without
       *    the parameter an automatic toggling would happen.
       * @return {String} The class name
       */
      toggle: {
        "native": function native(element, name, toggle) {
          if (toggle === undefined) {
            element.classList.toggle(name);
          } else {
            toggle ? this.add(element, name) : this.remove(element, name);
          }

          return name;
        },
        "default": function _default(element, name, toggle) {
          if (toggle == null) {
            toggle = !this.has(element, name);
          }

          toggle ? this.add(element, name) : this.remove(element, name);
          return name;
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"]
    }
  });
  qx.bom.element.Class.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.client.Event": {
        "require": true,
        "construct": true
      },
      "qx.bom.client.Device": {
        "require": true,
        "construct": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "construct": true,
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "construct": true,
        "require": true
      },
      "qx.bom.client.Browser": {
        "construct": true,
        "require": true
      },
      "qx.lang.Function": {},
      "qx.dom.Node": {},
      "qx.event.Emitter": {},
      "qx.bom.Event": {},
      "qx.event.type.dom.Pointer": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.lang.Array": {},
      "qx.event.Utils": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine",
          "construct": true
        },
        "browser.documentmode": {
          "load": true,
          "className": "qx.bom.client.Browser",
          "construct": true
        },
        "event.mspointer": {
          "construct": true,
          "className": "qx.bom.client.Event"
        },
        "device.touch": {
          "construct": true,
          "className": "qx.bom.client.Device"
        },
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "event.dispatchevent": {
          "className": "qx.bom.client.Event"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Low-level pointer event handler.
   *
   * @require(qx.bom.client.Event)
   * @require(qx.bom.client.Device)
   */
  qx.Bootstrap.define("qx.event.handler.PointerCore", {
    extend: Object,
    implement: [qx.core.IDisposable],
    statics: {
      MOUSE_TO_POINTER_MAPPING: {
        mousedown: "pointerdown",
        mouseup: "pointerup",
        mousemove: "pointermove",
        mouseout: "pointerout",
        mouseover: "pointerover"
      },
      TOUCH_TO_POINTER_MAPPING: {
        touchstart: "pointerdown",
        touchend: "pointerup",
        touchmove: "pointermove",
        touchcancel: "pointercancel"
      },
      MSPOINTER_TO_POINTER_MAPPING: {
        MSPointerDown: "pointerdown",
        MSPointerMove: "pointermove",
        MSPointerUp: "pointerup",
        MSPointerCancel: "pointercancel",
        MSPointerLeave: "pointerleave",
        MSPointerEnter: "pointerenter",
        MSPointerOver: "pointerover",
        MSPointerOut: "pointerout"
      },
      POINTER_TO_GESTURE_MAPPING: {
        pointerdown: "gesturebegin",
        pointerup: "gesturefinish",
        pointercancel: "gesturecancel",
        pointermove: "gesturemove"
      },
      LEFT_BUTTON: qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") <= 8 ? 1 : 0,
      SIM_MOUSE_DISTANCE: 25,
      SIM_MOUSE_DELAY: 2500,

      /**
       * Coordinates of the last touch. This needs to be static because the target could
       * change between touch and simulated mouse events. Touch events will be detected
       * by one instance which moves the target. The simulated mouse events will be fired with
       * a delay which causes another target and with that, another instance of this handler.
       * last touch was.
       */
      __lastTouch: null
    },

    /**
     * Create a new instance
     *
     * @param target {Element} element on which to listen for native touch events
     * @param emitter {qx.event.Emitter?} Event emitter (used if dispatchEvent
     * is not supported, e.g. in IE8)
     */
    construct: function construct(target, emitter) {
      this.__defaultTarget = target;
      this.__emitter = emitter;
      this.__eventNames = [];
      this.__buttonStates = [];
      this.__activeTouches = [];
      this._processedFlag = "$$qx" + this.classname.substr(this.classname.lastIndexOf(".") + 1) + "Processed";
      var engineName = qx.core.Environment.get("engine.name");
      var docMode = parseInt(qx.core.Environment.get("browser.documentmode"), 10);

      if (engineName == "mshtml" && docMode == 10) {
        // listen to native prefixed events and custom unprefixed (see bug #8921)
        this.__eventNames = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel", "MSPointerOver", "MSPointerOut", "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout"];

        this._initPointerObserver();
      } else {
        if (qx.core.Environment.get("event.mspointer")) {
          this.__nativePointerEvents = true;
        }

        this.__eventNames = ["pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout"];

        this._initPointerObserver();
      }

      if (!qx.core.Environment.get("event.mspointer")) {
        if (qx.core.Environment.get("device.touch")) {
          this.__eventNames = ["touchstart", "touchend", "touchmove", "touchcancel"];

          this._initObserver(this._onTouchEvent);
        }

        this.__eventNames = ["mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "contextmenu"];

        this._initObserver(this._onMouseEvent);
      }
    },
    members: {
      __defaultTarget: null,
      __emitter: null,
      __eventNames: null,
      __nativePointerEvents: false,
      __wrappedListener: null,
      __lastButtonState: 0,
      __buttonStates: null,
      __primaryIdentifier: null,
      __activeTouches: null,
      _processedFlag: null,

      /**
       * Adds listeners to native pointer events if supported
       */
      _initPointerObserver: function _initPointerObserver() {
        this._initObserver(this._onPointerEvent);
      },

      /**
       * Register native event listeners
       * @param callback {Function} listener callback
       * @param useEmitter {Boolean} attach listener to Emitter instead of
       * native event
       */
      _initObserver: function _initObserver(callback, useEmitter) {
        this.__wrappedListener = qx.lang.Function.listener(callback, this);

        this.__eventNames.forEach(function (type) {
          if (useEmitter && qx.dom.Node.isDocument(this.__defaultTarget)) {
            if (!this.__defaultTarget.$$emitter) {
              this.__defaultTarget.$$emitter = new qx.event.Emitter();
            }

            this.__defaultTarget.$$emitter.on(type, this.__wrappedListener);
          } else {
            qx.bom.Event.addNativeListener(this.__defaultTarget, type, this.__wrappedListener);
          }
        }.bind(this));
      },

      /**
       * Handler for native pointer events
       * @param domEvent {Event}  Native DOM event
       */
      _onPointerEvent: function _onPointerEvent(domEvent) {
        if (!qx.core.Environment.get("event.mspointer") || // workaround for bug #8533
        qx.core.Environment.get("browser.documentmode") === 10 && domEvent.type.toLowerCase().indexOf("ms") == -1) {
          return;
        }

        if (!this.__nativePointerEvents) {
          domEvent.stopPropagation();
        }

        var type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[domEvent.type] || domEvent.type;
        var target = qx.bom.Event.getTarget(domEvent);
        var evt = new qx.event.type.dom.Pointer(type, domEvent);

        this._fireEvent(evt, type, target);
      },

      /**
       * Handler for touch events
       * @param domEvent {Event} Native DOM event
       */
      _onTouchEvent: function _onTouchEvent(domEvent) {
        if (domEvent[this._processedFlag]) {
          return;
        }

        domEvent[this._processedFlag] = true;
        var type = qx.event.handler.PointerCore.TOUCH_TO_POINTER_MAPPING[domEvent.type];
        var changedTouches = domEvent.changedTouches;

        this._determineActiveTouches(domEvent.type, changedTouches); // Detecting vacuum touches. (Touches which are not active anymore, but did not fire a touchcancel event)


        if (domEvent.touches.length < this.__activeTouches.length) {
          // Firing pointer cancel for previously active touches.
          for (var i = this.__activeTouches.length - 1; i >= 0; i--) {
            var cancelEvent = new qx.event.type.dom.Pointer("pointercancel", domEvent, {
              identifier: this.__activeTouches[i].identifier,
              target: domEvent.target,
              pointerType: "touch",
              pointerId: this.__activeTouches[i].identifier + 2
            });

            this._fireEvent(cancelEvent, "pointercancel", domEvent.target);
          } // Reset primary identifier


          this.__primaryIdentifier = null; // cleanup of active touches array.

          this.__activeTouches = []; // Do nothing after pointer cancel.

          return;
        }

        if (domEvent.type == "touchstart" && this.__primaryIdentifier === null) {
          this.__primaryIdentifier = changedTouches[0].identifier;
        }

        for (var i = 0, l = changedTouches.length; i < l; i++) {
          var touch = changedTouches[i];
          var touchTarget = domEvent.view.document.elementFromPoint(touch.clientX, touch.clientY) || domEvent.target;
          var touchProps = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            pageX: touch.pageX,
            pageY: touch.pageY,
            identifier: touch.identifier,
            screenX: touch.screenX,
            screenY: touch.screenY,
            target: touchTarget,
            pointerType: "touch",
            pointerId: touch.identifier + 2
          };

          if (domEvent.type == "touchstart") {
            // Fire pointerenter before pointerdown
            var overEvt = new qx.event.type.dom.Pointer("pointerover", domEvent, touchProps);

            this._fireEvent(overEvt, "pointerover", touchProps.target);
          }

          if (touch.identifier == this.__primaryIdentifier) {
            touchProps.isPrimary = true; // always simulate left click on touch interactions for primary pointer

            touchProps.button = 0;
            touchProps.buttons = 1;
            qx.event.handler.PointerCore.__lastTouch = {
              "x": touch.clientX,
              "y": touch.clientY,
              "time": new Date().getTime()
            };
          }

          var evt = new qx.event.type.dom.Pointer(type, domEvent, touchProps);

          this._fireEvent(evt, type, touchProps.target);

          if (domEvent.type == "touchend" || domEvent.type == "touchcancel") {
            // Fire pointerout after pointerup
            var outEvt = new qx.event.type.dom.Pointer("pointerout", domEvent, touchProps); // fire on the original target to make sure over / out event are on the same target

            this._fireEvent(outEvt, "pointerout", domEvent.target);

            if (this.__primaryIdentifier == touch.identifier) {
              this.__primaryIdentifier = null;
            }
          }
        }
      },

      /**
      * Handler for touch events
      * @param domEvent {Event} Native DOM event
      */
      _onMouseEvent: function _onMouseEvent(domEvent) {
        if (domEvent[this._processedFlag]) {
          return;
        }

        domEvent[this._processedFlag] = true;

        if (this._isSimulatedMouseEvent(domEvent.clientX, domEvent.clientY)) {
          /*
            Simulated MouseEvents are fired by browsers directly after TouchEvents
            for improving compatibility. They should not trigger PointerEvents.
          */
          return;
        }

        if (domEvent.type == "mousedown") {
          this.__buttonStates[domEvent.which] = 1;
        } else if (domEvent.type == "mouseup") {
          if (qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("engine.name") == "gecko") {
            if (this.__buttonStates[domEvent.which] != 1 && domEvent.ctrlKey) {
              this.__buttonStates[1] = 0;
            }
          }

          this.__buttonStates[domEvent.which] = 0;
        }

        var type = qx.event.handler.PointerCore.MOUSE_TO_POINTER_MAPPING[domEvent.type];
        var target = qx.bom.Event.getTarget(domEvent);
        var buttonsPressed = qx.lang.Array.sum(this.__buttonStates);
        var mouseProps = {
          pointerType: "mouse",
          pointerId: 1
        }; // if the button state changes but not from or to zero

        if (this.__lastButtonState != buttonsPressed && buttonsPressed !== 0 && this.__lastButtonState !== 0) {
          var moveEvt = new qx.event.type.dom.Pointer("pointermove", domEvent, mouseProps);

          this._fireEvent(moveEvt, "pointermove", target);
        }

        this.__lastButtonState = buttonsPressed; // pointerdown should only trigger form the first pressed button.

        if (domEvent.type == "mousedown" && buttonsPressed > 1) {
          return;
        } // pointerup should only trigger if user releases all buttons.


        if (domEvent.type == "mouseup" && buttonsPressed > 0) {
          return;
        }

        if (domEvent.type == "contextmenu") {
          this.__buttonStates[domEvent.which] = 0;
          return;
        }

        var evt = new qx.event.type.dom.Pointer(type, domEvent, mouseProps);

        this._fireEvent(evt, type, target);
      },

      /**
       * Determines the current active touches.
       * @param type {String} the DOM event type.
       * @param changedTouches {Array} the current changed touches.
       */
      _determineActiveTouches: function _determineActiveTouches(type, changedTouches) {
        if (type == "touchstart") {
          for (var i = 0; i < changedTouches.length; i++) {
            this.__activeTouches.push(changedTouches[i]);
          }
        } else if (type == "touchend" || type == "touchcancel") {
          var updatedActiveTouches = [];

          for (var i = 0; i < this.__activeTouches.length; i++) {
            var add = true;

            for (var j = 0; j < changedTouches.length; j++) {
              if (this.__activeTouches[i].identifier == changedTouches[j].identifier) {
                add = false;
                break;
              }
            }

            if (add) {
              updatedActiveTouches.push(this.__activeTouches[i]);
            }
          }

          this.__activeTouches = updatedActiveTouches;
        }
      },

      /**
       * Detects whether the given MouseEvent position is identical to the previously fired TouchEvent position.
       * If <code>true</code> the corresponding event can be identified as simulated.
       * @param x {Integer} current mouse x
       * @param y {Integer} current mouse y
       * @return {Boolean} <code>true</code> if passed mouse position is a synthetic MouseEvent.
       */
      _isSimulatedMouseEvent: function _isSimulatedMouseEvent(x, y) {
        var touch = qx.event.handler.PointerCore.__lastTouch;

        if (touch) {
          var timeSinceTouch = new Date().getTime() - touch.time;
          var dist = qx.event.handler.PointerCore.SIM_MOUSE_DISTANCE;
          var distX = Math.abs(x - qx.event.handler.PointerCore.__lastTouch.x);
          var distY = Math.abs(y - qx.event.handler.PointerCore.__lastTouch.y);

          if (timeSinceTouch < qx.event.handler.PointerCore.SIM_MOUSE_DELAY) {
            if (distX < dist || distY < dist) {
              return true;
            }
          }
        }

        return false;
      },

      /**
       * Removes native pointer event listeners.
       */
      _stopObserver: function _stopObserver() {
        for (var i = 0; i < this.__eventNames.length; i++) {
          qx.bom.Event.removeNativeListener(this.__defaultTarget, this.__eventNames[i], this.__wrappedListener);
        }
      },

      /**
       * Fire a touch event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       * @return {qx.Promise?} a promise, if one was returned by event handlers
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        target = target || domEvent.target;
        type = type || domEvent.type;
        var gestureEvent;

        if ((domEvent.pointerType !== "mouse" || domEvent.button <= qx.event.handler.PointerCore.LEFT_BUTTON) && (type == "pointerdown" || type == "pointerup" || type == "pointermove")) {
          gestureEvent = new qx.event.type.dom.Pointer(qx.event.handler.PointerCore.POINTER_TO_GESTURE_MAPPING[type], domEvent);
          qx.event.type.dom.Pointer.normalize(gestureEvent);

          try {
            gestureEvent.srcElement = target;
          } catch (ex) {// Nothing - strict mode prevents writing to read only properties
          }
        }

        if (qx.core.Environment.get("event.dispatchevent")) {
          var tracker = {};

          if (!this.__nativePointerEvents) {
            qx.event.Utils.then(tracker, function () {
              return target.dispatchEvent(domEvent);
            });
          }

          if (gestureEvent) {
            qx.event.Utils.then(tracker, function () {
              return target.dispatchEvent(gestureEvent);
            });
          }

          return tracker.promise;
        } else {
          // ensure compatibility with native events for IE8
          try {
            domEvent.srcElement = target;
          } catch (ex) {// Nothing - strict mode prevents writing to read only properties
          }

          while (target) {
            if (target.$$emitter) {
              domEvent.currentTarget = target;

              if (!domEvent._stopped) {
                target.$$emitter.emit(type, domEvent);
              }

              if (gestureEvent && !gestureEvent._stopped) {
                gestureEvent.currentTarget = target;
                target.$$emitter.emit(gestureEvent.type, gestureEvent);
              }
            }

            target = target.parentNode;
          }
        }
      },

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this._stopObserver();

        this.__defaultTarget = this.__emitter = null;
      }
    }
  });
  qx.event.handler.PointerCore.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.CssAnimation": {},
      "qx.bom.element.AnimationCss": {},
      "qx.bom.element.AnimationJs": {},
      "qx.lang.String": {},
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation": {
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
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Wrapper for {@link qx.bom.element.AnimationCss} and
   * {@link qx.bom.element.AnimationJs}. It offers the public API and decides using
   * feature checks either to use CSS animations or JS animations.
   *
   * If you use this class, the restrictions of the JavaScript animations apply.
   * This means that you can not use transforms and custom bezier timing functions.
   */
  qx.Bootstrap.define("qx.bom.element.Animation", {
    statics: {
      /**
       * This function takes care of the feature check and starts the animation.
       * It takes a DOM element to apply the animation to, and a description.
       * The description should be a map, which could look like this:
       *
       * <pre class="javascript">
       * {
       *   "duration": 1000,
       *   "keep": 100,
       *   "keyFrames": {
       *     0 : {"opacity": 1, "scale": 1},
       *     100 : {"opacity": 0, "scale": 0}
       *   },
       *   "origin": "50% 50%",
       *   "repeat": 1,
       *   "timing": "ease-out",
       *   "alternate": false,
       *   "delay" : 2000
       * }
       * </pre>
       *
       * *duration* is the time in milliseconds one animation cycle should take.
       *
       * *keep* is the key frame to apply at the end of the animation. (optional)
       *   Keep in mind that the keep key is reversed in case you use an reverse
       *   animation or set the alternate key and a even repeat count.
       *
       * *keyFrames* is a map of separate frames. Each frame is defined by a
       *   number which is the percentage value of time in the animation. The value
       *   is a map itself which holds css properties or transforms
       *   {@link qx.bom.element.Transform} (Transforms only for CSS Animations).
       *
       * *origin* maps to the transform origin {@link qx.bom.element.Transform#setOrigin}
       *   (Only for CSS animations).
       *
       * *repeat* is the amount of time the animation should be run in
       *   sequence. You can also use "infinite".
       *
       * *timing* takes one of the predefined value:
       *   <code>ease</code> | <code>linear</code> | <code>ease-in</code>
       *   | <code>ease-out</code> | <code>ease-in-out</code> |
       *   <code>cubic-bezier(&lt;number&gt;, &lt;number&gt;, &lt;number&gt;, &lt;number&gt;)</code>
       *   (cubic-bezier only available for CSS animations)
       *
       * *alternate* defines if every other animation should be run in reverse order.
       *
       * *delay* is the time in milliseconds the animation should wait before start.
       *
       * @param el {Element} The element to animate.
       * @param desc {Map} The animations description.
       * @param duration {Integer?} The duration in milliseconds of the animation
       *   which will override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} AnimationHandle instance to control
       *   the animation.
       */
      animate: function animate(el, desc, duration) {
        var onlyCssKeys = qx.bom.element.Animation.__hasOnlyCssKeys(el, desc.keyFrames);

        if (qx.core.Environment.get("css.animation") && onlyCssKeys) {
          return qx.bom.element.AnimationCss.animate(el, desc, duration);
        } else {
          return qx.bom.element.AnimationJs.animate(el, desc, duration);
        }
      },

      /**
       * Starts an animation in reversed order. For further details, take a look at
       * the {@link #animate} method.
       * @param el {Element} The element to animate.
       * @param desc {Map} The animations description.
       * @param duration {Integer?} The duration in milliseconds of the animation
       *   which will override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} AnimationHandle instance to control
       *   the animation.
       */
      animateReverse: function animateReverse(el, desc, duration) {
        var onlyCssKeys = qx.bom.element.Animation.__hasOnlyCssKeys(el, desc.keyFrames);

        if (qx.core.Environment.get("css.animation") && onlyCssKeys) {
          return qx.bom.element.AnimationCss.animateReverse(el, desc, duration);
        } else {
          return qx.bom.element.AnimationJs.animateReverse(el, desc, duration);
        }
      },

      /**
       * Detection helper which detects if only CSS keys are in
       * the animations key frames.
       * @param el {Element} The element to check for the styles.
       * @param keyFrames {Map} The keyFrames of the animation.
       * @return {Boolean} <code>true</code> if only css properties are included.
       */
      __hasOnlyCssKeys: function __hasOnlyCssKeys(el, keyFrames) {
        var keys = [];

        for (var nr in keyFrames) {
          var frame = keyFrames[nr];

          for (var key in frame) {
            if (keys.indexOf(key) == -1) {
              keys.push(key);
            }
          }
        }

        var transformKeys = ["scale", "rotate", "skew", "translate"];

        for (var i = 0; i < keys.length; i++) {
          var key = qx.lang.String.camelCase(keys[i]);

          if (!(key in el.style)) {
            // check for transform keys
            if (transformKeys.indexOf(keys[i]) != -1) {
              continue;
            } // check for prefixed keys


            if (qx.bom.Style.getPropertyName(key)) {
              continue;
            }

            return false;
          }
        }

        ;
        return true;
      }
    }
  });
  qx.bom.element.Animation.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.IEventDispatcher": {
        "require": true
      },
      "qx.event.Utils": {},
      "qx.event.type.Event": {}
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Event dispatcher for all bubbling events.
   */
  qx.Class.define("qx.event.dispatch.AbstractBubbling", {
    extend: qx.core.Object,
    implement: qx.event.IEventDispatcher,
    type: "abstract",

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
      this._manager = manager;
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        EVENT DISPATCHER HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the parent of the given target
       *
       * @abstract
       * @param target {var} The target which parent should be found
       * @return {var} The parent of the given target
       */
      _getParent: function _getParent(target) {
        throw new Error("Missing implementation");
      },

      /*
      ---------------------------------------------------------------------------
        EVENT DISPATCHER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canDispatchEvent: function canDispatchEvent(target, event, type) {
        return event.getBubbles();
      },
      // interface implementation
      dispatchEvent: function dispatchEvent(target, event, type) {
        var parent = target;
        var manager = this._manager;
        var captureListeners, bubbleListeners;
        var context; // Cache list for AT_TARGET

        var targetList = [];
        captureListeners = manager.getListeners(target, type, true);
        bubbleListeners = manager.getListeners(target, type, false);

        if (captureListeners) {
          targetList.push(captureListeners);
        }

        if (bubbleListeners) {
          targetList.push(bubbleListeners);
        } // Cache list for CAPTURING_PHASE and BUBBLING_PHASE


        var parent = this._getParent(target);

        var bubbleList = [];
        var bubbleTargets = [];
        var captureList = [];
        var captureTargets = []; // Walk up the tree and look for event listeners

        while (parent != null) {
          // Attention:
          // We do not follow the DOM2 events specifications here
          // http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-flow-capture
          // Opera is the only browser which conforms to the spec.
          // Safari and Mozilla do it the same way like qooxdoo does
          // and add the capture events of the target to the execution list.
          captureListeners = manager.getListeners(parent, type, true);

          if (captureListeners) {
            captureList.push(captureListeners);
            captureTargets.push(parent);
          }

          bubbleListeners = manager.getListeners(parent, type, false);

          if (bubbleListeners) {
            bubbleList.push(bubbleListeners);
            bubbleTargets.push(parent);
          }

          parent = this._getParent(parent);
        }

        var self = this;
        var tracker = {};
        var __TRACE_LOGGING = false; //(event._type == "pointerup" && event._target.className === "qx-toolbar-button-checked");

        var __TRACE = function __TRACE() {};

        if (__TRACE_LOGGING) {
          var serial = (this.SERIAL || 0) + 1;
          this.SERIAL = serial + 1;

          __TRACE = function __TRACE() {
            var args = [].slice.apply(arguments);
            args.unshift("serial #" + serial + ": ");
            console.log.apply(this, args);
          };
        }

        qx.event.Utils["catch"](tracker, function () {
          // This function must exist to suppress "unhandled rejection" messages from promises
          __TRACE("Aborted serial=" + serial + ", type=" + event.getType());
        }); // capturing phase

        qx.event.Utils.then(tracker, function () {
          // loop through the hierarchy in reverted order (from root)
          event.setEventPhase(qx.event.type.Event.CAPTURING_PHASE);

          __TRACE("captureList=" + captureList.length);

          return qx.event.Utils.series(captureList, function (localList, i) {
            __TRACE("captureList[" + i + "]: localList.length=" + localList.length);

            var currentTarget = captureTargets[i];
            event.setCurrentTarget(currentTarget);
            var result = qx.event.Utils.series(localList, function (listener, listenerIndex) {
              context = listener.context || currentTarget;
              {
                // warn if the context is disposed
                if (context && context.isDisposed && context.isDisposed()) {
                  self.warn("The context object '" + context + "' for the event '" + type + "' of '" + currentTarget + "'is already disposed.");
                }
              }

              if (!self._manager.isBlacklisted(listener.unique)) {
                __TRACE("captureList[" + i + "] => localList[" + listenerIndex + "] callListener");

                return listener.handler.call(context, event);
              } else {
                __TRACE("captureList[" + i + "] => localList[" + listenerIndex + "] is blacklisted");
              }
            }, true);

            if (result === qx.event.Utils.ABORT) {
              return qx.event.Utils.reject(tracker);
            }

            if (event.getPropagationStopped()) {
              return qx.event.Utils.reject(tracker);
            }

            return result;
          });
        }); // at target

        qx.event.Utils.then(tracker, function () {
          event.setEventPhase(qx.event.type.Event.AT_TARGET);
          event.setCurrentTarget(target);

          __TRACE("targetList=" + targetList.length);

          return qx.event.Utils.series(targetList, function (localList, i) {
            __TRACE("targetList[" + i + "] localList.length=" + localList.length);

            var result = qx.event.Utils.series(localList, function (listener, listenerIndex) {
              __TRACE("targetList[" + i + "] -> localList[" + listenerIndex + "] callListener");

              context = listener.context || target;
              {
                // warn if the context is disposed
                if (context && context.isDisposed && context.isDisposed()) {
                  self.warn("The context object '" + context + "' for the event '" + type + "' of '" + target + "'is already disposed.");
                }
              }

              __TRACE("Calling target serial=" + serial + ", type=" + event.getType());

              return listener.handler.call(context, event);
            }, true);

            if (result === qx.event.Utils.ABORT) {
              return qx.event.Utils.reject(tracker);
            }

            if (event.getPropagationStopped()) {
              return qx.event.Utils.reject(tracker);
            }

            return result;
          });
        }); // bubbling phase
        // loop through the hierarchy in normal order (to root)

        qx.event.Utils.then(tracker, function () {
          event.setEventPhase(qx.event.type.Event.BUBBLING_PHASE);

          __TRACE("bubbleList=" + bubbleList.length);

          return qx.event.Utils.series(bubbleList, function (localList, i) {
            __TRACE("bubbleList[" + i + "] localList.length=" + localList.length);

            var currentTarget = bubbleTargets[i];
            event.setCurrentTarget(currentTarget);
            var result = qx.event.Utils.series(localList, function (listener, listenerIndex) {
              __TRACE("bubbleList[" + i + "] -> localList[" + listenerIndex + "] callListener");

              context = listener.context || currentTarget;
              {
                // warn if the context is disposed
                if (context && context.isDisposed && context.isDisposed()) {
                  self.warn("The context object '" + context + "' for the event '" + type + "' of '" + currentTarget + "'is already disposed.");
                }
              }
              return listener.handler.call(context, event);
            }, true);

            if (result === qx.event.Utils.ABORT) {
              return qx.event.Utils.reject(tracker);
            }

            if (event.getPropagationStopped()) {
              return qx.event.Utils.reject(tracker);
            }

            return result;
          });
        });

        if (__TRACE_LOGGING) {
          if (tracker.promise) {
            __TRACE("events promised");

            qx.event.Utils.then(tracker, function () {
              __TRACE("events promised done");
            });
          } else {
            __TRACE("events done");
          }
        }

        return tracker.promise;
      }
    }
  });
  qx.event.dispatch.AbstractBubbling.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.dispatch.AbstractBubbling": {
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Event dispatcher for all bubbling events on DOM elements.
   */
  qx.Class.define("qx.event.dispatch.DomBubbling", {
    extend: qx.event.dispatch.AbstractBubbling,
    statics: {
      /** @type {Integer} Priority of this dispatcher */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL
    },
    members: {
      // overridden
      _getParent: function _getParent(target) {
        return target.parentNode;
      },
      // interface implementation
      canDispatchEvent: function canDispatchEvent(target, event, type) {
        return target.nodeType !== undefined && event.getBubbles();
      }
    },
    defer: function defer(statics) {
      qx.event.Registration.addDispatcher(statics);
    }
  });
  qx.event.dispatch.DomBubbling.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.UserAction": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "usage": "dynamic",
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
      "qx.bom.client.Engine": {
        "construct": true,
        "defer": "runtime",
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.event.type.KeyInput": {},
      "qx.event.Utils": {},
      "qx.event.type.Data": {},
      "qx.event.type.KeySequence": {},
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.event.util.Keyboard": {},
      "qx.event.handler.Focus": {},
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.ObjectRegistry": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
          "className": "qx.bom.client.Engine",
          "load": true,
          "defer": true
        },
        "browser.version": {
          "className": "qx.bom.client.Browser",
          "load": true
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class provides unified key event handler for Internet Explorer,
   * Firefox, Opera and Safari.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.handler.UserAction)
   */
  qx.Class.define("qx.event.handler.Keyboard", {
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

      this.__manager = manager;
      this.__window = manager.getWindow(); // Gecko ignores key events when not explicitly clicked in the document.

      if (qx.core.Environment.get("engine.name") == "gecko") {
        this.__root = this.__window;
      } else {
        this.__root = this.__window.document.documentElement;
      } // Internal sequence cache


      this.__lastUpDownType = {}; // Initialize observer

      this._initKeyObserver();
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
        keyup: 1,
        keydown: 1,
        keypress: 1,
        keyinput: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __onKeyUpDownWrapper: null,
      __manager: null,
      __window: null,
      __root: null,
      __lastUpDownType: null,
      __lastKeyCode: null,
      __inputListeners: null,
      __onKeyPressWrapper: null,

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
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Fire a key input event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param charCode {Integer} character code
       * @return {qx.Promise?} a promise if the event handlers created one
       */
      _fireInputEvent: function _fireInputEvent(domEvent, charCode) {
        var target = this.__getEventTarget();

        var tracker = {};
        var self = this; // Only fire when target is defined and visible

        if (target && target.offsetWidth != 0) {
          var event = qx.event.Registration.createEvent("keyinput", qx.event.type.KeyInput, [domEvent, target, charCode]);
          qx.event.Utils.then(tracker, function () {
            self.__manager.dispatchEvent(target, event);
          });
        } // Fire user action event
        // Needs to check if still alive first


        if (this.__window) {
          var self = this;
          qx.event.Utils.then(tracker, function () {
            return qx.event.Registration.fireEvent(self.__window, "useraction", qx.event.type.Data, ["keyinput"]);
          });
        }

        return tracker.promise;
      },

      /**
       * Fire a key up/down/press event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String} type og the event
       * @param keyIdentifier {String} key identifier
       * @return {qx.Promise?} a promise, if any of the event handlers returned a promise
       */
      _fireSequenceEvent: function _fireSequenceEvent(domEvent, type, keyIdentifier) {
        var target = this.__getEventTarget();

        var keyCode = domEvent.keyCode;
        var tracker = {};
        var self = this; // Fire key event

        var event = qx.event.Registration.createEvent(type, qx.event.type.KeySequence, [domEvent, target, keyIdentifier]);
        qx.event.Utils.then(tracker, function () {
          return self.__manager.dispatchEvent(target, event);
        }); // IE and Safari suppress a "keypress" event if the "keydown" event's
        // default action was prevented. In this case we emulate the "keypress"
        //
        // FireFox suppresses "keypress" when "keydown" default action is prevented.
        // from version 29: https://bugzilla.mozilla.org/show_bug.cgi?id=935876.

        if (event.getDefaultPrevented() && type == "keydown") {
          if (qx.core.Environment.get("engine.name") == "mshtml" || qx.core.Environment.get("engine.name") == "webkit" || qx.core.Environment.get("engine.name") == "gecko" && qx.core.Environment.get("browser.version") >= 29) {
            // some key press events are already emulated. Ignore these events.
            if (!qx.event.util.Keyboard.isNonPrintableKeyCode(keyCode) && !this._emulateKeyPress[keyCode]) {
              qx.event.Utils.then(tracker, function () {
                return self._fireSequenceEvent(domEvent, "keypress", keyIdentifier);
              });
            }
          }
        } // Fire user action event
        // Needs to check if still alive first


        if (this.__window) {
          qx.event.Utils.then(tracker, function () {
            return qx.event.Registration.fireEvent(self.__window, "useraction", qx.event.type.Data, [type]);
          });
        }

        return tracker.promise;
      },

      /**
       * Get the target element for key events
       *
       * @return {Element} the event target element
       */
      __getEventTarget: function __getEventTarget() {
        var focusHandler = this.__manager.getHandler(qx.event.handler.Focus);

        var target = focusHandler.getActive(); // Fallback to focused element when active is null or invisible

        if (!target || target.offsetWidth == 0) {
          target = focusHandler.getFocus();
        } // Fallback to body when focused is null or invisible


        if (!target || target.offsetWidth == 0) {
          target = this.__manager.getWindow().document.body;
        }

        return target;
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT/STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native key event listeners.
       *
       * @signature function()
       */
      _initKeyObserver: function _initKeyObserver() {
        this.__onKeyUpDownWrapper = qx.lang.Function.listener(this.__onKeyUpDown, this);
        this.__onKeyPressWrapper = qx.lang.Function.listener(this.__onKeyPress, this);
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__root, "keyup", this.__onKeyUpDownWrapper);
        Event.addNativeListener(this.__root, "keydown", this.__onKeyUpDownWrapper);
        Event.addNativeListener(this.__root, "keypress", this.__onKeyPressWrapper);
      },

      /**
       * Stops the native key event listeners.
       *
       * @signature function()
       */
      _stopKeyObserver: function _stopKeyObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__root, "keyup", this.__onKeyUpDownWrapper);
        Event.removeNativeListener(this.__root, "keydown", this.__onKeyUpDownWrapper);
        Event.removeNativeListener(this.__root, "keypress", this.__onKeyPressWrapper);

        for (var key in this.__inputListeners || {}) {
          var listener = this.__inputListeners[key];
          Event.removeNativeListener(listener.target, "keypress", listener.callback);
        }

        delete this.__inputListeners;
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Low level handler for "keyup" and "keydown" events
       *
       * @internal
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event object
       */
      __onKeyUpDown: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "gecko|webkit|mshtml": function geckoWebkitMshtml(domEvent) {
          var keyCode = 0;
          var charCode = 0;
          var type = domEvent.type;
          keyCode = domEvent.keyCode;
          var tracker = {};
          var self = this;
          qx.event.Utils.track(tracker, this._idealKeyHandler(keyCode, charCode, type, domEvent)); // On non print-able character be sure to add a keypress event

          if (type == "keydown") {
            /*
             * We need an artificial keypress event for every keydown event.
             * Newer browsers do not fire keypress for a regular charachter key (e.g when typing 'a')
             * if it was typed with the CTRL, ALT or META Key pressed during typing, like
             * doing it when typing the combination CTRL+A
             */
            var isModifierDown = domEvent.ctrlKey || domEvent.altKey || domEvent.metaKey; // non-printable, backspace, tab or the modfier keys are down

            if (qx.event.util.Keyboard.isNonPrintableKeyCode(keyCode) || this._emulateKeyPress[keyCode] || isModifierDown) {
              qx.event.Utils.then(tracker, function () {
                return self._idealKeyHandler(keyCode, charCode, "keypress", domEvent);
              });
            }
          } // Store last type


          this.__lastUpDownType[keyCode] = type;
          return tracker.promise;
        },
        "opera": function opera(domEvent) {
          this.__lastKeyCode = domEvent.keyCode;
          return this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
        }
      })),

      /**
       * some keys like "up", "down", "pageup", "pagedown" do not bubble a
       * "keypress" event in Firefox. To work around this bug we attach keypress
       * listeners directly to the input events.
       *
       * https://bugzilla.mozilla.org/show_bug.cgi?id=467513
       *
       * @signature function(target, type, keyCode)
       * @param target {Element} The event target
       * @param type {String} The event type
       * @param keyCode {Integer} the key code
       */
      __firefoxInputFix: qx.core.Environment.select("engine.name", {
        "gecko": function gecko(target, type, keyCode) {
          if (type === "keydown" && (keyCode == 33 || keyCode == 34 || keyCode == 38 || keyCode == 40) && target.type == "text" && target.tagName.toLowerCase() === "input" && target.getAttribute("autoComplete") !== "off") {
            if (!this.__inputListeners) {
              this.__inputListeners = {};
            }

            var hash = qx.core.ObjectRegistry.toHashCode(target);

            if (this.__inputListeners[hash]) {
              return;
            }

            var self = this;
            this.__inputListeners[hash] = {
              target: target,
              callback: function callback(domEvent) {
                qx.bom.Event.stopPropagation(domEvent);

                self.__onKeyPress(domEvent);
              }
            };
            var listener = qx.event.GlobalError.observeMethod(this.__inputListeners[hash].callback);
            qx.bom.Event.addNativeListener(target, "keypress", listener);
          }
        },
        "default": null
      }),

      /**
       * Low level key press handler
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event object
       */
      __onKeyPress: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          domEvent = window.event || domEvent;

          if (this._charCode2KeyCode[domEvent.keyCode]) {
            return this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
          } else {
            return this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
          }
        },
        "gecko": function gecko(domEvent) {
          if (qx.core.Environment.get("engine.version") < 66) {
            var charCode = domEvent.charCode;
            var type = domEvent.type;
            return this._idealKeyHandler(domEvent.keyCode, charCode, type, domEvent);
          } else {
            if (this._charCode2KeyCode[domEvent.keyCode]) {
              return this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
            } else {
              return this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
            }
          }
        },
        "webkit": function webkit(domEvent) {
          if (this._charCode2KeyCode[domEvent.keyCode]) {
            return this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
          } else {
            return this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
          }
        },
        "opera": function opera(domEvent) {
          var keyCode = domEvent.keyCode;
          var type = domEvent.type; // Some keys are identified differently for key up/down and keypress
          // (e.g. "v" gets identified as "F7").
          // So we store the last key up/down keycode and compare it to the
          // current keycode.
          // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=603

          if (keyCode != this.__lastKeyCode) {
            return this._idealKeyHandler(0, this.__lastKeyCode, type, domEvent);
          } else {
            if (qx.event.util.Keyboard.keyCodeToIdentifierMap[domEvent.keyCode]) {
              return this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
            } else {
              return this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
            }
          }
        }
      })),

      /*
      ---------------------------------------------------------------------------
        IDEAL KEY HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Key handler for an idealized browser.
       * Runs after the browser specific key handlers have normalized the key events.
       *
       * @param keyCode {String} keyboard code
       * @param charCode {String} character code
       * @param eventType {String} type of the event (keydown, keypress, keyup)
       * @param domEvent {Element} DomEvent
       * @return {qx.Promise?} a promise, if an event handler created one
       */
      _idealKeyHandler: function _idealKeyHandler(keyCode, charCode, eventType, domEvent) {
        var keyIdentifier; // Use: keyCode

        if (keyCode || !keyCode && !charCode) {
          keyIdentifier = qx.event.util.Keyboard.keyCodeToIdentifier(keyCode);
          return this._fireSequenceEvent(domEvent, eventType, keyIdentifier);
        } // Use: charCode
        else {
            keyIdentifier = qx.event.util.Keyboard.charCodeToIdentifier(charCode);
            var tracker = {};
            var self = this;
            qx.event.Utils.track(tracker, this._fireSequenceEvent(domEvent, "keypress", keyIdentifier));
            return qx.event.Utils.then(tracker, function () {
              return self._fireInputEvent(domEvent, charCode);
            });
          }
      },

      /*
      ---------------------------------------------------------------------------
        KEY MAPS
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} maps the charcodes of special keys for key press emulation
       *
       * @lint ignoreReferenceField(_emulateKeyPress)
       */
      _emulateKeyPress: qx.core.Environment.select("engine.name", {
        "mshtml": {
          8: true,
          9: true
        },
        "webkit": {
          8: true,
          9: true,
          27: true
        },
        "gecko": qx.core.Environment.get("browser.version") >= 65 ? {
          8: true,
          9: true,
          27: true
        } : {},
        "default": {}
      }),

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * converts a key identifier back to a keycode
       *
       * @param keyIdentifier {String} The key identifier to convert
       * @return {Integer} keyboard code
       */
      _identifierToKeyCode: function _identifierToKeyCode(keyIdentifier) {
        return qx.event.util.Keyboard.identifierToKeyCodeMap[keyIdentifier] || keyIdentifier.charCodeAt(0);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopKeyObserver();

      this.__lastKeyCode = this.__manager = this.__window = this.__root = this.__lastUpDownType = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics, members) {
      // register at the event handler
      qx.event.Registration.addHandler(statics);

      if (qx.core.Environment.get("engine.name") !== "opera") {
        members._charCode2KeyCode = {
          13: 13,
          27: 27
        };
      }
    }
  });
  qx.event.handler.Keyboard.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.UserAction": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
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
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.bom.Event": {},
      "qx.event.type.MouseWheel": {},
      "qx.event.type.Mouse": {},
      "qx.event.type.Data": {},
      "qx.lang.Function": {},
      "qx.bom.client.Event": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.dom.Hierarchy": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "load": true,
          "className": "qx.bom.client.OperatingSystem"
        },
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
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This class provides an unified mouse event handler for Internet Explorer,
   * Firefox, Opera and Safari
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.handler.UserAction)
   * @ignore(qx.event.handler.DragDrop)
   */
  qx.Class.define("qx.event.handler.Mouse", {
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

      this.__manager = manager;
      this.__window = manager.getWindow();
      this.__root = this.__window.document; // Initialize observers

      this._initButtonObserver();

      this._initMoveObserver();

      this._initWheelObserver();
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
        mousemove: 1,
        mouseover: 1,
        mouseout: 1,
        mousedown: 1,
        mouseup: 1,
        click: 1,
        auxclick: 1,
        dblclick: 1,
        contextmenu: 1,
        mousewheel: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT + qx.event.IEventHandler.TARGET_WINDOW,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __onButtonEventWrapper: null,
      __onMoveEventWrapper: null,
      __onWheelEventWrapper: null,
      __lastEventType: null,
      __lastMouseDownTarget: null,
      __manager: null,
      __window: null,
      __root: null,
      __preventNextClick: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      // The iPhone requires for attaching mouse events natively to every element which
      // should react on mouse events. As of version 3.0 it also requires to keep the
      // listeners as long as the event should work. In 2.0 it was enough to attach the
      // listener once.
      registerEvent: qx.core.Environment.get("os.name") === "ios" ? function (target, type, capture) {
        target["on" + type] = function () {
          return null;
        };
      } : function () {
        return null;
      },
      // interface implementation
      unregisterEvent: qx.core.Environment.get("os.name") === "ios" ? function (target, type, capture) {
        target["on" + type] = undefined;
      } : function () {
        return null;
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Fire a mouse event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String} type of the event
       * @param target {Element} event target
       */
      __fireEvent: function __fireEvent(domEvent, type, target) {
        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        } // we need a true node for the fireEvent
        // e.g. when hovering over text of disabled textfields IE is returning
        // an empty object as "srcElement"


        if (target && target.nodeType) {
          qx.event.Registration.fireEvent(target, type || domEvent.type, type == "mousewheel" ? qx.event.type.MouseWheel : qx.event.type.Mouse, [domEvent, target, null, true, true]);
        } // Fire user action event


        qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type || domEvent.type]);
      },

      /**
       * Helper to prevent the next click.
       * @internal
       */
      preventNextClick: function preventNextClick() {
        this.__preventNextClick = true;
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native mouse button event listeners.
       *
       * @signature function()
       */
      _initButtonObserver: function _initButtonObserver() {
        this.__onButtonEventWrapper = qx.lang.Function.listener(this._onButtonEvent, this);
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__root, "mousedown", this.__onButtonEventWrapper);
        Event.addNativeListener(this.__root, "mouseup", this.__onButtonEventWrapper);
        Event.addNativeListener(this.__root, "click", this.__onButtonEventWrapper);
        Event.addNativeListener(this.__root, "auxclick", this.__onButtonEventWrapper);
        Event.addNativeListener(this.__root, "dblclick", this.__onButtonEventWrapper);
        Event.addNativeListener(this.__root, "contextmenu", this.__onButtonEventWrapper);
      },

      /**
       * Initializes the native mouse move event listeners.
       *
       * @signature function()
       */
      _initMoveObserver: function _initMoveObserver() {
        this.__onMoveEventWrapper = qx.lang.Function.listener(this._onMoveEvent, this);
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__root, "mousemove", this.__onMoveEventWrapper);
        Event.addNativeListener(this.__root, "mouseover", this.__onMoveEventWrapper);
        Event.addNativeListener(this.__root, "mouseout", this.__onMoveEventWrapper);
      },

      /**
       * Initializes the native mouse wheel event listeners.
       *
       * @signature function()
       */
      _initWheelObserver: function _initWheelObserver() {
        this.__onWheelEventWrapper = qx.lang.Function.listener(this._onWheelEvent, this);
        var data = qx.bom.client.Event.getMouseWheel(this.__window);
        qx.bom.Event.addNativeListener(data.target, data.type, this.__onWheelEventWrapper);
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Disconnects the native mouse button event listeners.
       *
       * @signature function()
       */
      _stopButtonObserver: function _stopButtonObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__root, "mousedown", this.__onButtonEventWrapper);
        Event.removeNativeListener(this.__root, "mouseup", this.__onButtonEventWrapper);
        Event.removeNativeListener(this.__root, "click", this.__onButtonEventWrapper);
        Event.removeNativeListener(this.__root, "dblclick", this.__onButtonEventWrapper);
        Event.removeNativeListener(this.__root, "contextmenu", this.__onButtonEventWrapper);
      },

      /**
       * Disconnects the native mouse move event listeners.
       *
       * @signature function()
       */
      _stopMoveObserver: function _stopMoveObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__root, "mousemove", this.__onMoveEventWrapper);
        Event.removeNativeListener(this.__root, "mouseover", this.__onMoveEventWrapper);
        Event.removeNativeListener(this.__root, "mouseout", this.__onMoveEventWrapper);
      },

      /**
       * Disconnects the native mouse wheel event listeners.
       *
       * @signature function()
       */
      _stopWheelObserver: function _stopWheelObserver() {
        var data = qx.bom.client.Event.getMouseWheel(this.__window);
        qx.bom.Event.removeNativeListener(data.target, data.type, this.__onWheelEventWrapper);
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Global handler for all mouse move related events like "mousemove",
       * "mouseout" and "mouseover".
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onMoveEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        this.__fireEvent(domEvent);
      }),

      /**
       * Global handler for all mouse button related events like "mouseup",
       * "mousedown", "click", "dblclick" and "contextmenu".
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onButtonEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        var type = domEvent.type;
        var target = qx.bom.Event.getTarget(domEvent);

        if (type == "click" && this.__preventNextClick) {
          delete this.__preventNextClick;
          return;
        } // Safari (and maybe gecko) takes text nodes as targets for events
        // See: http://www.quirksmode.org/js/events_properties.html


        if (qx.core.Environment.get("engine.name") == "gecko" || qx.core.Environment.get("engine.name") == "webkit") {
          if (target && target.nodeType == 3) {
            target = target.parentNode;
          }
        } // prevent click events on drop during Drag&Drop [BUG #6846]


        var isDrag = qx.event.handler.DragDrop && this.__manager.getHandler(qx.event.handler.DragDrop).isSessionActive();

        if (isDrag && type == "click") {
          return;
        }

        if (this.__doubleClickFixPre) {
          this.__doubleClickFixPre(domEvent, type, target);
        }

        this.__fireEvent(domEvent, type, target);
        /*
         * In order to normalize middle button click events we
         * need to fire an artificial click event if the client
         * fires auxclick events for non primary buttons instead.
         * 
         * See https://github.com/qooxdoo/qooxdoo/issues/9268
         */


        if (type == "auxclick" && domEvent.button == 1) {
          this.__fireEvent(domEvent, "click", target);
        }

        if (this.__rightClickFixPost) {
          this.__rightClickFixPost(domEvent, type, target);
        }

        if (this.__differentTargetClickFixPost && !isDrag) {
          this.__differentTargetClickFixPost(domEvent, type, target);
        }

        this.__lastEventType = type;
      }),

      /**
       * Global handler for the mouse wheel event.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onWheelEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        this.__fireEvent(domEvent, "mousewheel");
      }),

      /*
      ---------------------------------------------------------------------------
        CROSS BROWSER SUPPORT FIXES
      ---------------------------------------------------------------------------
      */

      /**
       * Normalizes the click sequence of right click events in Webkit and Opera.
       * The normalized sequence is:
       *
       *  1. mousedown  <- not fired by Webkit
       *  2. mouseup  <- not fired by Webkit
       *  3. contextmenu <- not fired by Opera
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __rightClickFixPost: qx.core.Environment.select("engine.name", {
        "opera": function opera(domEvent, type, target) {
          if (type == "mouseup" && domEvent.button == 2) {
            this.__fireEvent(domEvent, "contextmenu", target);
          }
        },
        "default": null
      }),

      /**
       * Normalizes the click sequence of double click event in the Internet
       * Explorer. The normalized sequence is:
       *
       *  1. mousedown
       *  2. mouseup
       *  3. click
       *  4. mousedown  <- not fired by IE
       *  5. mouseup
       *  6. click  <- not fired by IE
       *  7. dblclick
       *
       *  Note: This fix is only applied, when the IE event model is used, otherwise
       *  the fix is ignored.
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __doubleClickFixPre: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent, type, target) {
          // Do only apply the fix when the event is from the IE event model,
          // otherwise do not apply the fix.
          if (domEvent.target !== undefined) {
            return;
          }

          if (type == "mouseup" && this.__lastEventType == "click") {
            this.__fireEvent(domEvent, "mousedown", target);
          } else if (type == "dblclick") {
            this.__fireEvent(domEvent, "click", target);
          }
        },
        "default": null
      }),

      /**
       * If the mouseup event happens on a different target than the corresponding
       * mousedown event the internet explorer dispatches a click event on the
       * first common ancestor of both targets. The presence of this click event
       * is essential for the qooxdoo widget system. All other browsers don't fire
       * the click event so it must be emulated.
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __differentTargetClickFixPost: qx.core.Environment.select("engine.name", {
        "mshtml": null,
        "default": function _default(domEvent, type, target) {
          switch (type) {
            case "mousedown":
              this.__lastMouseDownTarget = target;
              break;

            case "mouseup":
              if (target !== this.__lastMouseDownTarget) {
                var commonParent = qx.dom.Hierarchy.getCommonParent(target, this.__lastMouseDownTarget);

                if (commonParent) {
                  this.__fireEvent(domEvent, "click", commonParent);
                }
              }

          }
        }
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopButtonObserver();

      this._stopMoveObserver();

      this._stopWheelObserver();

      this.__manager = this.__window = this.__root = this.__lastMouseDownTarget = null;
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
  qx.event.handler.Mouse.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.ObjectRegistry": {},
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Native": {}
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
  
  ************************************************************************ */

  /**
   * This class supports typical DOM element inline events like scroll,
   * change, select, ...
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.handler.Element", {
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
      qx.core.Object.constructor.call(this);
      this._manager = manager;
      this._registeredEvents = {};
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
        abort: true,
        // Image elements
        load: true,
        // Image elements
        scroll: true,
        select: true,
        reset: true,
        // Form Elements
        submit: true // Form Elements

      },

      /** @type {MAP} Whether the event is cancelable */
      CANCELABLE: {
        selectstart: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false
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
      canHandleEvent: function canHandleEvent(target, type) {
        // Don't handle "load" event of Iframe. Unfortunately, both Element and
        // Iframe handler support "load" event. Should be handled by
        // qx.event.handler.Iframe only. Fixes [#BUG 4587].
        if (type === "load") {
          return target.tagName.toLowerCase() !== "iframe";
        } else {
          return true;
        }
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        var elementId = qx.core.ObjectRegistry.toHashCode(target);
        var eventId = elementId + "-" + type;
        var listener = qx.lang.Function.listener(this._onNative, this, eventId);
        qx.bom.Event.addNativeListener(target, type, listener);
        this._registeredEvents[eventId] = {
          element: target,
          type: type,
          listener: listener
        };
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {
        var events = this._registeredEvents;

        if (!events) {
          return;
        }

        var elementId = qx.core.ObjectRegistry.toHashCode(target);
        var eventId = elementId + "-" + type;
        var eventData = this._registeredEvents[eventId];

        if (eventData) {
          qx.bom.Event.removeNativeListener(target, type, eventData.listener);
        }

        delete this._registeredEvents[eventId];
      },

      /*
      ---------------------------------------------------------------------------
        EVENT-HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Default event handler.
       *
       * @signature function(nativeEvent, eventId)
       * @param nativeEvent {Event} Native event
       * @param eventId {Integer} ID of the event (as stored internally)
       */
      _onNative: qx.event.GlobalError.observeMethod(function (nativeEvent, eventId) {
        var events = this._registeredEvents;

        if (!events) {
          return;
        }

        var eventData = events[eventId];
        var isCancelable = this.constructor.CANCELABLE[eventData.type];
        qx.event.Registration.fireNonBubblingEvent(eventData.element, eventData.type, qx.event.type.Native, [nativeEvent, undefined, undefined, undefined, isCancelable]);
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      var entry;
      var events = this._registeredEvents;

      for (var id in events) {
        entry = events[id];
        qx.bom.Event.removeNativeListener(entry.element, entry.type, entry.listener);
      }

      this._manager = this._registeredEvents = null;
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
  qx.event.handler.Element.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.ObjectRegistry": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.event.Utils": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
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
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This class supports <code>appear</code> and <code>disappear</code> events
   * on DOM level.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.handler.Appear", {
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
      qx.core.Object.constructor.call(this);
      this.__manager = manager;
      this.__targets = {}; // Register

      qx.event.handler.Appear.__instances[this.$$hash] = this;
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
        appear: true,
        disappear: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /** @type {Map} Stores all appear manager instances */
      __instances: {},

      /**
       * Refreshes all appear handlers. Useful after massive DOM manipulations e.g.
       * through qx.html.Element.
       *
       */
      refresh: function refresh() {
        var all = this.__instances;

        for (var hash in all) {
          all[hash].refresh();
        }
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager: null,
      __targets: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        var hash = qx.core.ObjectRegistry.toHashCode(target) + type;
        var targets = this.__targets;

        if (targets && !targets[hash]) {
          targets[hash] = target;
          target.$$displayed = target.offsetWidth > 0;
        }
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {
        var hash = qx.core.ObjectRegistry.toHashCode(target) + type;
        var targets = this.__targets;

        if (!targets) {
          return;
        }

        if (targets[hash]) {
          delete targets[hash];
        }
      },

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * This method should be called by all DOM tree modifying routines
       * to check the registered nodes for changes.
       *
       * @return {qx.Promise?} a promise, if one or more of the event handlers returned one 
       */
      refresh: function refresh() {
        var targets = this.__targets;
        var legacyIe = qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9;
        var tracker = {};
        var self = this;
        Object.keys(targets).forEach(function (hash) {
          var elem = targets[hash];

          if (elem === undefined) {
            return;
          }

          qx.event.Utils.then(tracker, function () {
            var displayed = elem.offsetWidth > 0;

            if (!displayed && legacyIe) {
              // force recalculation in IE 8. See bug #7872
              displayed = elem.offsetWidth > 0;
            }

            if (!!elem.$$displayed !== displayed) {
              elem.$$displayed = displayed;
              var evt = qx.event.Registration.createEvent(displayed ? "appear" : "disappear");
              return self.__manager.dispatchEvent(elem, evt);
            }
          });
        });
        return tracker.promise;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__manager = this.__targets = null; // Deregister

      delete qx.event.handler.Appear.__instances[this.$$hash];
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
  qx.event.handler.Appear.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.OperatingSystem": {},
      "qx.bom.Viewport": {},
      "qx.event.type.Orientation": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tino Butz (tbtz)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Unify Project
  
       Homepage:
         http://unify-project.org
  
       Copyright:
         2009-2010 Deutsche Telekom AG, Germany, http://telekom.com
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
  ************************************************************************ */

  /**
   * This class provides a handler for the orientation event.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.handler.Orientation", {
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

      this.__manager = manager;
      this.__window = manager.getWindow();

      this._initObserver();
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
        orientationchange: 1
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
      __manager: null,
      __window: null,
      __nativeEventType: null,
      _currentOrientation: null,
      __onNativeWrapper: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {// Nothing needs to be done here
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native orientation change event listeners.
       */
      _initObserver: function _initObserver() {
        this.__onNativeWrapper = qx.lang.Function.listener(this._onNative, this); // Handle orientation change event for Android devices by the resize event.
        // See http://stackoverflow.com/questions/1649086/detect-rotation-of-android-phone-in-the-browser-with-javascript
        // for more information.

        this.__nativeEventType = qx.bom.Event.supportsEvent(this.__window, "orientationchange") ? "orientationchange" : "resize";
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__window, this.__nativeEventType, this.__onNativeWrapper);
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Disconnects the native orientation change event listeners.
       */
      _stopObserver: function _stopObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__window, this.__nativeEventType, this.__onNativeWrapper);
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the native orientation change event.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} The touch event from the browser.
       */
      _onNative: qx.event.GlobalError.observeMethod(function (domEvent) {
        var detectOrientationChangeDelay = 0;

        if (qx.core.Environment.get("os.name") == "android") {
          // On Android Devices the detection of orientation mode has to be delayed.
          // See: http://stackoverflow.com/questions/8985805/orientation-change-in-android-using-javascript
          detectOrientationChangeDelay = 300;
        }

        qx.lang.Function.delay(this._onOrientationChange, detectOrientationChangeDelay, this, domEvent);
      }),

      /**
       * Handler for the detection of an orientation change.
       * @param domEvent {Event} The touch event from the browser.
       */
      _onOrientationChange: function _onOrientationChange(domEvent) {
        var Viewport = qx.bom.Viewport;
        var orientation = Viewport.getOrientation(domEvent.target);

        if (this._currentOrientation != orientation) {
          this._currentOrientation = orientation;
          var mode = Viewport.isLandscape(domEvent.target) ? "landscape" : "portrait";
          qx.event.Registration.fireEvent(this.__window, "orientationchange", qx.event.type.Orientation, [orientation, mode]);
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

      this.__manager = this.__window = null;
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
  qx.event.handler.Orientation.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.type.Native": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {},
      "qx.bom.client.Engine": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
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
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Common base class for all DOM events.
   */
  qx.Class.define("qx.event.type.Dom", {
    extend: qx.event.type.Native,
    statics: {
      /** @type {Integer} The modifier mask for the shift key. */
      SHIFT_MASK: 1,

      /** @type {Integer} The modifier mask for the control key. */
      CTRL_MASK: 2,

      /** @type {Integer} The modifier mask for the alt key. */
      ALT_MASK: 4,

      /** @type {Integer} The modifier mask for the meta key (e.g. apple key on Macs). */
      META_MASK: 8,

      /** @type {Integer} The modifier mask for the CapsLock modifier. */
      CAPSLOCK_MASK: 16,

      /** @type {Integer} The modifier mask for the NumLock modifier. */
      NUMLOCK_MASK: 32,

      /** @type {Integer} The modifier mask for the ScrollLock modifier. */
      SCROLLLOCK_MASK: 64
    },
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Dom.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);

        clone.shiftKey = nativeEvent.shiftKey;
        clone.ctrlKey = nativeEvent.ctrlKey;
        clone.altKey = nativeEvent.altKey;
        clone.metaKey = nativeEvent.metaKey;

        if (typeof nativeEvent.getModifierState === "function") {
          clone.numLock = nativeEvent.getModifierState("NumLock");
          clone.capsLock = nativeEvent.getModifierState("CapsLock");
          clone.scrollLock = nativeEvent.getModifierState("ScrollLock");
        } else {
          clone.numLock = false;
          clone.capsLock = false;
          clone.scrollLock = false;
        }

        return clone;
      },

      /**
       * Return in a bit map, which modifier keys are pressed. The constants
       * {@link #SHIFT_MASK}, {@link #CTRL_MASK}, {@link #ALT_MASK},
       * {@link #META_MASK} and {@link #CAPSLOCK_MASK} define the bit positions
       * of the corresponding keys.
       *
       * @return {Integer} A bit map with the pressed modifier keys.
       */
      getModifiers: function getModifiers() {
        var mask = 0;
        var evt = this._native;

        if (evt.shiftKey) {
          mask |= qx.event.type.Dom.SHIFT_MASK;
        }

        if (evt.ctrlKey) {
          mask |= qx.event.type.Dom.CTRL_MASK;
        }

        if (evt.altKey) {
          mask |= qx.event.type.Dom.ALT_MASK;
        }

        if (evt.metaKey) {
          mask |= qx.event.type.Dom.META_MASK;
        }

        return mask;
      },

      /**
       * Return in a bit map, which lock keys are pressed. The constants
       * {@link #CAPSLOCK_MASK}, {@link #NUMLOCK_MASK}, and {@link #SCROLLLOCK_MASK} 
       * define the bit positions of the corresponding keys.
       *
       * @return {Integer} A bit map with the locked keys.
       */
      getKeyLockState: function getKeyLockState() {
        var mask = 0;
        var evt = this._native;

        if (evt.capsLock) {
          mask |= qx.event.type.Dom.CAPSLOCK_MASK;
        }

        if (evt.numLock) {
          mask |= qx.event.type.Dom.NUMLOCK_MASK;
        }

        if (evt.scrollLock) {
          mask |= qx.event.type.Dom.SCROLLLOCK_MASK;
        }

        return mask;
      },

      /**
       * Returns whether the ctrl key is pressed.
       *
       * @return {Boolean} whether the ctrl key is pressed.
       */
      isCtrlPressed: function isCtrlPressed() {
        return this._native.ctrlKey;
      },

      /**
       * Returns whether the shift key is pressed.
       *
       * @return {Boolean} whether the shift key is pressed.
       */
      isShiftPressed: function isShiftPressed() {
        return this._native.shiftKey;
      },

      /**
       * Returns whether the alt key is pressed.
       *
       * @return {Boolean} whether the alt key is pressed.
       */
      isAltPressed: function isAltPressed() {
        return this._native.altKey;
      },

      /**
       * Returns whether the meta key is pressed.
       *
       * @return {Boolean} whether the meta key is pressed.
       */
      isMetaPressed: function isMetaPressed() {
        return this._native.metaKey;
      },

      /**
        * Returns whether the caps-lock modifier is active
        *
        * @return {Boolean} whether the CapsLock key is pressed.
        */
      isCapsLocked: function isCapsLocked() {
        return this._native.capsLock;
      },

      /**
        * Returns whether the num-lock modifier is active
        *
        * @return {Boolean} whether the NumLock key is pressed.
        */
      isNumLocked: function isNumLocked() {
        return this._native.numLock;
      },

      /**
        * Returns whether the scroll-lock modifier is active
        *
        * @return {Boolean} whether the ScrollLock key is pressed.
        */
      isScrollLocked: function isScrollLocked() {
        return this._native.scrollLock;
      },

      /**
       * Returns whether the ctrl key or (on the Mac) the command key is pressed.
       *
       * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
       *           or the ctrl key is pressed on another system.
       */
      isCtrlOrCommandPressed: function isCtrlOrCommandPressed() {
        // Opera seems to use ctrlKey for the cmd key so don't fix that for opera
        // on mac [BUG #5884]
        if (qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("engine.name") != "opera") {
          return this._native.metaKey;
        } else {
          return this._native.ctrlKey;
        }
      }
    }
  });
  qx.event.type.Dom.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.type.Dom": {
        "require": true
      },
      "qx.bom.client.Browser": {},
      "qx.bom.client.Engine": {},
      "qx.dom.Node": {},
      "qx.bom.Viewport": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "browser.name": {
          "className": "qx.bom.client.Browser"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
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
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Mouse event object.
   *
   * the interface of this class is based on the DOM Level 2 mouse event
   * interface: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
   */
  qx.Class.define("qx.event.type.Mouse", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Mouse.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);

        clone.button = nativeEvent.button;
        clone.clientX = Math.round(nativeEvent.clientX);
        clone.clientY = Math.round(nativeEvent.clientY);
        clone.pageX = nativeEvent.pageX ? Math.round(nativeEvent.pageX) : undefined;
        clone.pageY = nativeEvent.pageY ? Math.round(nativeEvent.pageY) : undefined;
        clone.screenX = Math.round(nativeEvent.screenX);
        clone.screenY = Math.round(nativeEvent.screenY);
        clone.wheelDelta = nativeEvent.wheelDelta;
        clone.wheelDeltaX = nativeEvent.wheelDeltaX;
        clone.wheelDeltaY = nativeEvent.wheelDeltaY;
        clone.delta = nativeEvent.delta;
        clone.deltaX = nativeEvent.deltaX;
        clone.deltaY = nativeEvent.deltaY;
        clone.deltaZ = nativeEvent.deltaZ;
        clone.detail = nativeEvent.detail;
        clone.axis = nativeEvent.axis;
        clone.wheelX = nativeEvent.wheelX;
        clone.wheelY = nativeEvent.wheelY;
        clone.HORIZONTAL_AXIS = nativeEvent.HORIZONTAL_AXIS;
        clone.srcElement = nativeEvent.srcElement;
        clone.target = nativeEvent.target;
        return clone;
      },

      /**
       * @type {Map} Contains the button ID to identifier data.
       *
       * @lint ignoreReferenceField(__buttonsDom2EventModel)
       */
      __buttonsDom2EventModel: {
        0: "left",
        2: "right",
        1: "middle"
      },

      /**
       * @type {Map} Contains the button ID to identifier data.
       *
       * @lint ignoreReferenceField(__buttonsDom3EventModel)
       */
      __buttonsDom3EventModel: {
        0: "none",
        1: "left",
        2: "right",
        4: "middle"
      },

      /**
       * @type {Map} Contains the button ID to identifier data.
       *
       * @lint ignoreReferenceField(__buttonsMshtmlEventModel)
       */
      __buttonsMshtmlEventModel: {
        1: "left",
        2: "right",
        4: "middle"
      },
      // overridden
      stop: function stop() {
        this.stopPropagation();
      },

      /**
       * During mouse events caused by the depression or release of a mouse button,
       * this method can be used to check which mouse button changed state.
       *
       * Only internet explorer can compute the button during mouse move events. For
       * all other browsers the button only contains sensible data during
       * "click" events like "click", "dblclick", "mousedown", "mouseup" or "contextmenu".
       *
       * But still, browsers act different on click:
       * <pre>
       * <- = left mouse button
       * -> = right mouse button
       * ^  = middle mouse button
       *
       * Browser | click, dblclick | contextmenu
       * ---------------------------------------
       * Firefox | <- ^ ->         | ->
       * Chrome  | <- ^            | ->
       * Safari  | <- ^            | ->
       * IE      | <- (^ is <-)    | ->
       * Opera   | <-              | -> (twice)
       * </pre>
       *
       * @return {String} One of "left", "right", "middle" or "none"
       */
      getButton: function getButton() {
        switch (this._type) {
          case "contextmenu":
            return "right";

          case "click":
            // IE does not support buttons on click --> assume left button
            if (qx.core.Environment.get("browser.name") === "ie" && qx.core.Environment.get("browser.documentmode") < 9) {
              return "left";
            }

          default:
            if (!(qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") <= 8)) {
              // if the button value is -1, we should use the DOM level 3 .buttons attribute
              // the value -1 is only set for pointer events: http://msdn.microsoft.com/en-us/library/ie/ff974877(v=vs.85).aspx
              if (this._native.button === -1) {
                return this.__buttonsDom3EventModel[this._native.buttons] || "none";
              }

              return this.__buttonsDom2EventModel[this._native.button] || "none";
            } else {
              return this.__buttonsMshtmlEventModel[this._native.button] || "none";
            }

        }
      },

      /**
       * Whether the left button is pressed
       *
       * @return {Boolean} true when the left button is pressed
       */
      isLeftPressed: function isLeftPressed() {
        return this.getButton() === "left";
      },

      /**
       * Whether the middle button is pressed
       *
       * @return {Boolean} true when the middle button is pressed
       */
      isMiddlePressed: function isMiddlePressed() {
        return this.getButton() === "middle";
      },

      /**
       * Whether the right button is pressed
       *
       * @return {Boolean} true when the right button is pressed
       */
      isRightPressed: function isRightPressed() {
        return this.getButton() === "right";
      },

      /**
       * Get a secondary event target related to an UI event. This attribute is
       * used with the mouseover event to indicate the event target which the
       * pointing device exited and with the mouseout event to indicate the
       * event target which the pointing device entered.
       *
       * @return {Element} The secondary event target.
       * @signature function()
       */
      getRelatedTarget: function getRelatedTarget() {
        return this._relatedTarget;
      },

      /**
       * Get the he horizontal coordinate at which the event occurred relative
       * to the viewport.
       *
       * @return {Integer} The horizontal mouse position
       */
      getViewportLeft: function getViewportLeft() {
        return Math.round(this._native.clientX);
      },

      /**
       * Get the vertical coordinate at which the event occurred relative
       * to the viewport.
       *
       * @return {Integer} The vertical mouse position
       * @signature function()
       */
      getViewportTop: function getViewportTop() {
        return Math.round(this._native.clientY);
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Integer} The horizontal mouse position in the document.
       */
      getDocumentLeft: function getDocumentLeft() {
        if (this._native.pageX !== undefined) {
          return Math.round(this._native.pageX);
        } else if (this._native.srcElement) {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(win);
        } else {
          return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(window);
        }
      },

      /**
       * Get the vertical position at which the event occurred relative to the
       * top of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Integer} The vertical mouse position in the document.
       */
      getDocumentTop: function getDocumentTop() {
        if (this._native.pageY !== undefined) {
          return Math.round(this._native.pageY);
        } else if (this._native.srcElement) {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(win);
        } else {
          return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(window);
        }
      },

      /**
       * Get the horizontal coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * Note: This value is usually not very useful unless you want to
       * position a native popup window at this coordinate.
       *
       * @return {Integer} The horizontal mouse position on the screen.
       */
      getScreenLeft: function getScreenLeft() {
        return Math.round(this._native.screenX);
      },

      /**
       * Get the vertical coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * Note: This value is usually not very useful unless you want to
       * position a native popup window at this coordinate.
       *
       * @return {Integer} The vertical mouse position on the screen.
       */
      getScreenTop: function getScreenTop() {
        return Math.round(this._native.screenY);
      }
    }
  });
  qx.event.type.Mouse.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Mouse": {
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
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Pointer event object.
   *
   * the interface of this class is based on the pointer event interface:
   * http://www.w3.org/TR/pointerevents/
   */
  qx.Class.define("qx.event.type.Pointer", {
    extend: qx.event.type.Mouse,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        clone = qx.event.type.Pointer.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);
        clone.pointerId = nativeEvent.pointerId;
        clone.width = nativeEvent.width;
        clone.height = nativeEvent.height;
        clone.pressure = nativeEvent.pressure;
        clone.tiltX = nativeEvent.tiltX;
        clone.tiltY = nativeEvent.tiltY;
        clone.pointerType = nativeEvent.pointerType;
        clone.isPrimary = nativeEvent.isPrimary;
        clone._original = nativeEvent._original;
        clone.MSPOINTER_TYPE_MOUSE = nativeEvent.MSPOINTER_TYPE_MOUSE;
        clone.MSPOINTER_TYPE_PEN = nativeEvent.MSPOINTER_TYPE_PEN;
        clone.MSPOINTER_TYPE_TOUCH = nativeEvent.MSPOINTER_TYPE_TOUCH;
        return clone;
      },
      // overridden
      getDocumentLeft: function getDocumentLeft() {
        var x = qx.event.type.Pointer.prototype.getDocumentLeft.base.call(this); // iOS 6 does not copy pageX over to the fake pointer event

        if (x == 0 && this.getPointerType() == "touch" && this._native._original !== undefined) {
          x = Math.round(this._native._original.changedTouches[0].pageX) || 0;
        }

        return x;
      },
      // overridden
      getDocumentTop: function getDocumentTop() {
        var y = qx.event.type.Pointer.prototype.getDocumentTop.base.call(this); // iOS 6 does not copy pageY over to the fake pointer event

        if (y == 0 && this.getPointerType() == "touch" && this._native._original !== undefined) {
          y = Math.round(this._native._original.changedTouches[0].pageY) || 0;
        }

        return y;
      },

      /**
       * Returns a unique identified for the pointer. This id is
       * unique for all active pointers.
       *
       * @return {Number} The unique id.
       */
      getPointerId: function getPointerId() {
        return this._native.pointerId || 0;
      },

      /**
       * Returns the contact geometry in it's width.
       *
       * @return {Number} The number of pixels (width) of the contact geometry.
       */
      getWidth: function getWidth() {
        return this._native.width || 0;
      },

      /**
       * Returns the contact geometry in it's height.
       *
       * @return {Number} The number of pixels (height) of the contact geometry.
       */
      getHeight: function getHeight() {
        return this._native.height || 0;
      },

      /**
       * Returns the pressure of the pointer in a rage from 0 to 1.
       *
       * @return {Number} <code>1</code> for full pressure. The default is 0.
       */
      getPressure: function getPressure() {
        return this._native.pressure || 0;
      },

      /**
       * Returns the plane angle in degrees between the Y-Z plane and the
       * plane containing e.g. the stylus and the Y axis.
       *
       * @return {Number} A value between -90 and 90. The default is 0.
       */
      getTiltX: function getTiltX() {
        return this._native.tiltX || 0;
      },

      /**
       * Returns the plane angle in degrees between the X-Z plane and the
       * plane containing e.g. the stylus and the X axis.
       *
       * @return {Number} A value between -90 and 90. The default is 0.
       */
      getTiltY: function getTiltY() {
        return this._native.tiltY || 0;
      },
      // overridden
      getOriginalTarget: function getOriginalTarget() {
        if (this._native && this._native._original) {
          // fake pointer events
          var orig = this._native._original; // In IE8, the original event can be a DispCEventObj which throws an
          // exception when trying to access its properties.

          try {
            // touch events have a wrong target compared to mouse events
            if (orig.type.indexOf("touch") == 0) {
              if (orig.changedTouches[0]) {
                return document.elementFromPoint(orig.changedTouches[0].clientX, orig.changedTouches[0].clientY);
              }
            }
          } catch (ex) {
            return qx.bom.Event.getTarget(this._native);
          }

          return qx.bom.Event.getTarget(orig);
        } else if (this._native) {
          // native pointer events
          return qx.bom.Event.getTarget(this._native);
        }

        return qx.event.type.Pointer.prototype.getOriginalTarget.base.call(this);
      },

      /**
       * Returns the device type which the event triggered. This can be one
       * of the following strings: <code>mouse</code>, <code>wheel</code>,
       * <code>pen</code> or <code>touch</code>.
       *
       * @return {String} The type of the pointer.
       */
      getPointerType: function getPointerType() {
        if (typeof this._native.pointerType == "string") {
          return this._native.pointerType;
        }

        if (typeof this._native.pointerType == "number") {
          if (this._native.pointerType == this._native.MSPOINTER_TYPE_MOUSE) {
            return "mouse";
          }

          if (this._native.pointerType == this._native.MSPOINTER_TYPE_PEN) {
            return "pen";
          }

          if (this._native.pointerType == this._native.MSPOINTER_TYPE_TOUCH) {
            return "touch";
          }
        }

        return "";
      },

      /**
       * Returns whether the pointer is the primary pointer.
       *
       * @return {Boolean} <code>true</code>, if it's the primary pointer.
       */
      isPrimary: function isPrimary() {
        return !!this._native.isPrimary;
      }
    }
  });
  qx.event.type.Pointer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
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
       * Tino Butz (tbtz)
  
  ************************************************************************ */

  /**
   * Tap is a single pointer gesture fired when one pointer goes down and up on
   * the same location.
   */
  qx.Class.define("qx.event.type.Tap", {
    extend: qx.event.type.Pointer
  });
  qx.event.type.Tap.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
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
       * Tino Butz (tbtz)
  
  ************************************************************************ */

  /**
   * Swipe is a single pointer gesture fired when a pointer is moved in one direction.
   * It contains some additional data like the primary axis, the velocity and the distance.
   */
  qx.Class.define("qx.event.type.Swipe", {
    extend: qx.event.type.Pointer,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Swipe.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);

        clone.swipe = nativeEvent.swipe;
        return clone;
      },

      /**
       * Returns the start time of the performed swipe.
       *
       * @return {Integer} the start time
       */
      getStartTime: function getStartTime() {
        return this._native.swipe.startTime;
      },

      /**
       * Returns the duration the performed swipe took.
       *
       * @return {Integer} the duration
       */
      getDuration: function getDuration() {
        return this._native.swipe.duration;
      },

      /**
       * Returns whether the performed swipe was on the x or y axis.
       *
       * @return {String} "x"/"y" axis
       */
      getAxis: function getAxis() {
        return this._native.swipe.axis;
      },

      /**
       * Returns the direction of the performed swipe in reference to the axis.
       * y = up / down
       * x = left / right
       *
       * @return {String} the direction
       */
      getDirection: function getDirection() {
        return this._native.swipe.direction;
      },

      /**
       * Returns the velocity of the performed swipe.
       *
       * @return {Number} the velocity
       */
      getVelocity: function getVelocity() {
        return this._native.swipe.velocity;
      },

      /**
       * Returns the distance of the performed swipe.
       *
       * @return {Integer} the distance
       */
      getDistance: function getDistance() {
        return this._native.swipe.distance;
      }
    }
  });
  qx.event.type.Swipe.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
  
  ************************************************************************ */

  /**
   * Track is a single pointer gesture and contains of a three vent types:
   * <code>trackstart</code>, <code>track</code> and <code>trackend</code>. These
   * events will be fired when a pointer grabs an item and moves the pointer on it.
   */
  qx.Class.define("qx.event.type.Track", {
    extend: qx.event.type.Pointer,
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Track.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);

        clone.delta = nativeEvent.delta;
        return clone;
      },

      /**
       * Returns a map with the calculated delta coordinates and axis,
       * relative to the position on <code>trackstart</code> event.
       *
       * @return {Map} a map with contains the delta as <code>x</code> and
       * <code>y</code> and the movement axis as <code>axis</code>.
       */
      getDelta: function getDelta() {
        return this._native.delta;
      }
    }
  });
  qx.event.type.Track.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
  
  ************************************************************************ */

  /**
   * Rotate is a multi pointer gesture fired when two finger moved around
   * a single point. It contains the angle of the rotation.
   */
  qx.Class.define("qx.event.type.Rotate", {
    extend: qx.event.type.Pointer,
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Rotate.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);

        clone.angle = nativeEvent.angle;
        return clone;
      },

      /**
       * Returns a number with the current calculated angle between the primary and secondary active pointers.
       *
       * @return {Number} the angle of the two active pointers.
       */
      getAngle: function getAngle() {
        return this._native.angle;
      }
    }
  });
  qx.event.type.Rotate.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
  
  ************************************************************************ */

  /**
   * Pinch is a multi pointer gesture fired when two finger moved towards
   * or away from each other. It contains the scaling factor of the pinch.
   */
  qx.Class.define("qx.event.type.Pinch", {
    extend: qx.event.type.Pointer,
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Pinch.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);

        clone.scale = nativeEvent.scale;
        return clone;
      },

      /**
       * Returns the calculated scale of this event.
       *
       * @return {Float} the scale value of this event.
       */
      getScale: function getScale() {
        return this._native.scale;
      }
    }
  });
  qx.event.type.Pinch.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.lang.Function": {},
      "qx.bom.client.Event": {},
      "qx.bom.client.Engine": {},
      "qx.bom.Event": {},
      "qx.bom.client.Browser": {},
      "qx.bom.element.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "load": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "event.mspointer": {
          "className": "qx.bom.client.Event"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
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
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
       * Tino Butz (tbtz)
       * Christian Hagendorn (chris_schmidt)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Listens for native touch events and fires composite events like "tap" and
   * "swipe"
   *
   * @ignore(qx.event.*)
   */
  qx.Bootstrap.define("qx.event.handler.TouchCore", {
    extend: Object,
    implement: [qx.core.IDisposable],
    statics: {
      /** @type {Integer} The maximum distance of a tap. Only if the x or y distance of
       *      the performed tap is less or equal the value of this constant, a tap
       *      event is fired.
       */
      TAP_MAX_DISTANCE: qx.core.Environment.get("os.name") != "android" ? 10 : 40,

      /** @type {Map} The direction of a swipe relative to the axis */
      SWIPE_DIRECTION: {
        x: ["left", "right"],
        y: ["up", "down"]
      },

      /** @type {Integer} The minimum distance of a swipe. Only if the x or y distance
       *      of the performed swipe is greater as or equal the value of this
       *      constant, a swipe event is fired.
       */
      SWIPE_MIN_DISTANCE: qx.core.Environment.get("os.name") != "android" ? 11 : 41,

      /** @type {Integer} The minimum velocity of a swipe. Only if the velocity of the
       *      performed swipe is greater as or equal the value of this constant, a
       *      swipe event is fired.
       */
      SWIPE_MIN_VELOCITY: 0,

      /**
       * @type {Integer} The time delta in milliseconds to fire a long tap event.
       */
      LONGTAP_TIME: 500
    },

    /**
     * Create a new instance
     *
     * @param target {Element} element on which to listen for native touch events
     * @param emitter {qx.event.Emitter} Event emitter object
     */
    construct: function construct(target, emitter) {
      this.__target = target;
      this.__emitter = emitter;

      this._initTouchObserver();

      this.__pointers = [];
      this.__touchStartPosition = {};
    },
    members: {
      __target: null,
      __emitter: null,
      __onTouchEventWrapper: null,
      __originalTarget: null,
      __touchStartPosition: null,
      __startTime: null,
      __beginScalingDistance: null,
      __beginRotation: null,
      __pointers: null,
      __touchEventNames: null,

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native touch event listeners.
       */
      _initTouchObserver: function _initTouchObserver() {
        this.__onTouchEventWrapper = qx.lang.Function.listener(this._onTouchEvent, this);
        this.__touchEventNames = ["touchstart", "touchmove", "touchend", "touchcancel"];

        if (qx.core.Environment.get("event.mspointer")) {
          var engineVersion = parseInt(qx.core.Environment.get("engine.version"), 10);

          if (engineVersion == 10) {
            // IE 10
            this.__touchEventNames = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel"];
          } else {
            // IE 11+
            this.__touchEventNames = ["pointerdown", "pointermove", "pointerup", "pointercancel"];
          }
        }

        for (var i = 0; i < this.__touchEventNames.length; i++) {
          qx.bom.Event.addNativeListener(this.__target, this.__touchEventNames[i], this.__onTouchEventWrapper);
        }
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Disconnects the native touch event listeners.
       */
      _stopTouchObserver: function _stopTouchObserver() {
        for (var i = 0; i < this.__touchEventNames.length; i++) {
          qx.bom.Event.removeNativeListener(this.__target, this.__touchEventNames[i], this.__onTouchEventWrapper);
        }
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for native touch events.
       *
       * @param domEvent {Event} The touch event from the browser.
       */
      _onTouchEvent: function _onTouchEvent(domEvent) {
        this._commonTouchEventHandler(domEvent);
      },

      /**
       * Calculates the scaling distance between two touches.
       * @param touch0 {Event} The touch event from the browser.
       * @param touch1 {Event} The touch event from the browser.
       * @return {Number} the calculated distance.
       */
      _getScalingDistance: function _getScalingDistance(touch0, touch1) {
        return Math.sqrt(Math.pow(touch0.pageX - touch1.pageX, 2) + Math.pow(touch0.pageY - touch1.pageY, 2));
      },

      /**
       * Calculates the rotation between two touches.
       * @param touch0 {Event} The touch event from the browser.
       * @param touch1 {Event} The touch event from the browser.
       * @return {Number} the calculated rotation.
       */
      _getRotationAngle: function _getRotationAngle(touch0, touch1) {
        var x = touch0.pageX - touch1.pageX;
        var y = touch0.pageY - touch1.pageY;
        return Math.atan2(y, x) * 180 / Math.PI;
      },

      /**
       * Calculates the delta of the touch position relative to its position when <code>touchstart/code> event occurred.
       * @param touches {Array} an array with the current active touches, provided by <code>touchmove/code> event.
       * @return {Array} an array containing objects with the calculated delta as <code>x</code>,
       * <code>y</code> and the identifier of the corresponding touch.
       */
      _calcTouchesDelta: function _calcTouchesDelta(touches) {
        var delta = [];

        for (var i = 0; i < touches.length; i++) {
          delta.push(this._calcSingleTouchDelta(touches[i]));
        }

        return delta;
      },

      /**
       * Calculates the delta of one single touch position relative to its position when <code>touchstart/code> event occurred.
       * @param touch {Event} the current active touch, provided by <code>touchmove/code> event.
       * @return {Map} a map containing deltaX as <code>x</code>, deltaY as <code>y</code>, the direction of the movement as <code>axis</code> and the touch identifier as <code>identifier</code>.
       */
      _calcSingleTouchDelta: function _calcSingleTouchDelta(touch) {
        if (this.__touchStartPosition.hasOwnProperty(touch.identifier)) {
          var touchStartPosition = this.__touchStartPosition[touch.identifier];
          var deltaX = Math.floor(touch.clientX - touchStartPosition[0]);
          var deltaY = Math.floor(touch.clientY - touchStartPosition[1]);
          var axis = "x";

          if (Math.abs(deltaX / deltaY) < 1) {
            axis = "y";
          }

          return {
            "x": deltaX,
            "y": deltaY,
            "axis": axis,
            "identifier": touch.identifier
          };
        } else {
          return {
            "x": 0,
            "y": 0,
            "axis": null,
            "identifier": touch.identifier
          };
        }
      },

      /**
       * Called by an event handler.
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       */
      _commonTouchEventHandler: function _commonTouchEventHandler(domEvent, type) {
        var type = type || domEvent.type;

        if (qx.core.Environment.get("event.mspointer")) {
          type = this._mapPointerEvent(type);

          var touches = this._detectTouchesByPointer(domEvent, type);

          domEvent.changedTouches = touches;
          domEvent.targetTouches = touches;
          domEvent.touches = touches;
        }

        domEvent.delta = [];

        if (type == "touchstart") {
          this.__originalTarget = this._getTarget(domEvent);

          if (domEvent.touches && domEvent.touches.length > 1) {
            this.__beginScalingDistance = this._getScalingDistance(domEvent.touches[0], domEvent.touches[1]);
            this.__beginRotation = this._getRotationAngle(domEvent.touches[0], domEvent.touches[1]);
          }

          for (var i = 0; i < domEvent.changedTouches.length; i++) {
            var touch = domEvent.changedTouches[i];
            this.__touchStartPosition[touch.identifier] = [touch.clientX, touch.clientY];
          }
        }

        if (type == "touchmove") {
          // Polyfill for scale
          if (typeof domEvent.scale == "undefined" && domEvent.targetTouches.length > 1) {
            var currentScalingDistance = this._getScalingDistance(domEvent.targetTouches[0], domEvent.targetTouches[1]);

            domEvent.scale = currentScalingDistance / this.__beginScalingDistance;
          } // Polyfill for rotation


          if ((typeof domEvent.rotation == "undefined" || qx.core.Environment.get("event.mspointer")) && domEvent.targetTouches.length > 1) {
            var currentRotation = this._getRotationAngle(domEvent.targetTouches[0], domEvent.targetTouches[1]);

            domEvent._rotation = currentRotation - this.__beginRotation;
          }

          domEvent.delta = this._calcTouchesDelta(domEvent.targetTouches);
        }

        this._fireEvent(domEvent, type, this.__originalTarget);

        if (qx.core.Environment.get("event.mspointer")) {
          if (type == "touchend" || type == "touchcancel") {
            delete this.__pointers[domEvent.pointerId];
          }
        }

        if ((type == "touchend" || type == "touchcancel") && domEvent.changedTouches[0]) {
          delete this.__touchStartPosition[domEvent.changedTouches[0].identifier];
        }
      },

      /**
      * Creates an array with all current used touches out of multiple serial pointer events.
      * Needed because pointerEvents do not provide a touch list.
      * @param domEvent {Event} DOM event
      * @param type {String ? null} type of the event
      * @return {Array} touch list array.
      */
      _detectTouchesByPointer: function _detectTouchesByPointer(domEvent, type) {
        var touches = [];

        if (type == "touchstart") {
          this.__pointers[domEvent.pointerId] = domEvent;
        } else if (type == "touchmove") {
          this.__pointers[domEvent.pointerId] = domEvent;
        }

        for (var pointerId in this.__pointers) {
          var pointer = this.__pointers[pointerId];
          touches.push(pointer);
        }

        return touches;
      },

      /**
      * Maps a pointer event type to the corresponding touch event type.
      * @param type {String} the event type to parse.
      * @return {String} the parsed event name.
      */
      _mapPointerEvent: function _mapPointerEvent(type) {
        type = type.toLowerCase();

        if (type.indexOf("pointerdown") !== -1) {
          return "touchstart";
        } else if (type.indexOf("pointerup") !== -1) {
          return "touchend";
        } else if (type.indexOf("pointermove") !== -1) {
          return "touchmove";
        } else if (type.indexOf("pointercancel") !== -1) {
          return "touchcancel";
        }

        return type;
      },

      /**
       * Return the target of the event.
       *
       * @param domEvent {Event} DOM event
       * @return {Element} Event target
       */
      _getTarget: function _getTarget(domEvent) {
        var target = qx.bom.Event.getTarget(domEvent); // Text node. Fix Safari Bug, see http://www.quirksmode.org/js/events_properties.html

        if (qx.core.Environment.get("engine.name") == "webkit") {
          if (target && target.nodeType == 3) {
            target = target.parentNode;
          }
        } else if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 11) {
          // Fix for IE10 and pointer-events:none
          //
          // Changed the condition above to match exactly those browsers
          // for which the fix was intended
          // See: https://github.com/qooxdoo/qooxdoo/issues/9481
          //
          var targetForIE = this.__evaluateTarget(domEvent);

          if (targetForIE) {
            target = targetForIE;
          }
        }

        return target;
      },

      /**
       * This method fixes "pointer-events:none" for Internet Explorer 10.
       * Checks which elements are placed to position x/y and traverses the array
       * till one element has no "pointer-events:none" inside its style attribute.
       * @param domEvent {Event} DOM event
       * @return {Element | null} Event target
       */
      __evaluateTarget: function __evaluateTarget(domEvent) {
        var clientX = null;
        var clientY = null;

        if (domEvent && domEvent.touches && domEvent.touches.length !== 0) {
          clientX = domEvent.touches[0].clientX;
          clientY = domEvent.touches[0].clientY;
        } // Retrieve an array with elements on point X/Y.


        var hitTargets = document.msElementsFromPoint(clientX, clientY);

        if (hitTargets) {
          // Traverse this array for the elements which has no pointer-events:none inside.
          for (var i = 0; i < hitTargets.length; i++) {
            var currentTarget = hitTargets[i];
            var pointerEvents = qx.bom.element.Style.get(currentTarget, "pointer-events", 3);

            if (pointerEvents != "none") {
              return currentTarget;
            }
          }
        }

        return null;
      },

      /**
       * Fire a touch event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        if (!target) {
          target = this._getTarget(domEvent);
        }

        var type = type || domEvent.type;

        if (target && target.nodeType && this.__emitter) {
          this.__emitter.emit(type, domEvent);
        }
      },

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this._stopTouchObserver();

        this.__originalTarget = this.__target = this.__touchEventNames = this.__pointers = this.__emitter = this.__beginScalingDistance = this.__beginRotation = null;
      }
    }
  });
  qx.event.handler.TouchCore.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.UserAction": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Orientation": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Tap": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Swipe": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Track": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Rotate": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Pinch": {
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
      "qx.event.handler.TouchCore": {
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
      "qx.event.type.Touch": {},
      "qx.event.type.Data": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Event": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "event.touch": {
          "defer": true,
          "className": "qx.bom.client.Event"
        }
      }
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
       * Martin Wittemann (martinwittemann)
       * Tino Butz (tbtz)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This class provides a unified touch event handler.
   *
   * @require(qx.event.handler.UserAction)
   * @require(qx.event.handler.Orientation)
   * @require(qx.event.type.Tap)
   * @require(qx.event.type.Swipe)
   * @require(qx.event.type.Track)
   * @require(qx.event.type.Rotate)
   * @require(qx.event.type.Pinch)
   */
  qx.Class.define("qx.event.handler.Touch", {
    extend: qx.event.handler.TouchCore,
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
      // Define shorthands
      this.__manager = manager;
      this.__window = manager.getWindow();
      this.__root = this.__window.document;
      qx.event.handler.TouchCore.apply(this, [this.__root]);
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
        touchstart: 1,
        touchmove: 1,
        touchend: 1,
        touchcancel: 1,
        // Appears when the touch is interrupted, e.g. by an alert box
        tap: 1,
        longtap: 1,
        swipe: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /** @type {Map} Mapping of mouse events to touch events */
      MOUSE_TO_TOUCH_MAPPING: {
        "mousedown": "touchstart",
        "mousemove": "touchmove",
        "mouseup": "touchend"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager: null,
      __window: null,
      __root: null,
      // Checks if the mouse movement is happening while simulating a touch event
      __isInTouch: false,

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
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Fire a touch event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       * @param eventTypeClass {Class ? qx.event.type.Touch} the event type class
       */
      _fireEvent: function _fireEvent(domEvent, type, target, eventTypeClass) {
        if (!target) {
          target = this._getTarget(domEvent);
        }

        var type = type || domEvent.type;

        if (target && target.nodeType) {
          qx.event.Registration.fireEvent(target, type, eventTypeClass || qx.event.type.Touch, [domEvent, target, null, true, true]);
        } // Fire user action event


        qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type]);
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the native touch events.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} The touch event from the browser.
       */
      _onTouchEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        this._commonTouchEventHandler(domEvent);
      }),

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this.__callBase("dispose");

        this.__manager = this.__window = this.__root = null;
      },

      /**
       * Call overridden method.
       *
       * @param method {String} Name of the overridden method.
       * @param args {Array} Arguments.
       */
      __callBase: function __callBase(method, args) {
        qx.event.handler.TouchCore.prototype[method].apply(this, args || []);
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics); // Prevent scrolling on the document to avoid scrolling at all

      if (qx.core.Environment.get("event.touch")) {
        // get the handler to assure that the instance is created
        qx.event.Registration.getManager(document).getHandler(statics);
      }
    }
  });
  qx.event.handler.Touch.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Event": {},
      "qx.event.handler.Appear": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class provides a handler for the online event.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.handler.Offline", {
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
      qx.core.Object.constructor.call(this);
      this.__manager = manager;
      this.__window = manager.getWindow();

      this._initObserver();
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
        online: true,
        offline: true
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
      __manager: null,
      __window: null,
      __onNativeWrapper: null,

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

      /**
       * Connects the native online and offline event listeners.
       */
      _initObserver: function _initObserver() {
        this.__onNativeWrapper = qx.lang.Function.listener(this._onNative, this);
        qx.bom.Event.addNativeListener(this.__window, "offline", this.__onNativeWrapper);
        qx.bom.Event.addNativeListener(this.__window, "online", this.__onNativeWrapper);
      },

      /**
       * Disconnects the native online and offline event listeners.
       */
      _stopObserver: function _stopObserver() {
        qx.bom.Event.removeNativeListener(this.__window, "offline", this.__onNativeWrapper);
        qx.bom.Event.removeNativeListener(this.__window, "online", this.__onNativeWrapper);
      },

      /**
       * Native handler function which fires a qooxdoo event.
       * @signature function(domEvent)
       * @param domEvent {Event} Native DOM event
       */
      _onNative: qx.event.GlobalError.observeMethod(function (domEvent) {
        qx.event.Registration.fireEvent(this.__window, domEvent.type, qx.event.type.Event, []);
      }),

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns whether the current window thinks its online or not.
       * @return {Boolean} <code>true</code> if its online
       */
      isOnline: function isOnline() {
        return !!this.__window.navigator.onLine;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__manager = null;

      this._stopObserver(); // Deregister


      delete qx.event.handler.Appear.__instances[this.$$hash];
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
  qx.event.handler.Offline.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "usage": "dynamic",
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
      "qx.lang.Function": {
        "construct": true
      },
      "qx.bom.client.Engine": {
        "construct": true,
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.client.Browser": {},
      "qx.bom.Event": {},
      "qx.event.type.Data": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
          "className": "qx.bom.client.Engine",
          "load": true
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
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
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */
  // Original behavior:
  // ================================================================
  // Normally a "change" event should occur on blur of the element
  // (http://www.w3.org/TR/DOM-Level-2-Events/events.html)
  // However this is not true for "file" upload fields
  // And this is also not true for checkboxes and radiofields (all non mshtml)
  // And this is also not true for select boxes where the selections
  // happens in the opened popup (Gecko + Webkit)
  // Normalized behavior:
  // ================================================================
  // Change on blur for textfields, textareas and file
  // Instant change event on checkboxes, radiobuttons
  // Select field fires on select (when using popup or size>1)
  // but differs when using keyboard:
  // mshtml+opera=keypress; mozilla+safari=blur
  // Input event for textareas does not work in Safari 3 beta (WIN)
  // Safari 3 beta (WIN) repeats change event for select box on blur when selected using popup
  // Opera fires "change" on radio buttons two times for each change

  /**
   * This handler provides an "change" event for all form fields and an
   * "input" event for form fields of type "text" and "textarea".
   *
   * To let these events work it is needed to create the elements using
   * {@link qx.bom.Input}
   */
  qx.Class.define("qx.event.handler.Input", {
    extend: qx.core.Object,
    implement: qx.event.IEventHandler,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this._onChangeCheckedWrapper = qx.lang.Function.listener(this._onChangeChecked, this);
      this._onChangeValueWrapper = qx.lang.Function.listener(this._onChangeValue, this);
      this._onInputWrapper = qx.lang.Function.listener(this._onInput, this);
      this._onPropertyWrapper = qx.lang.Function.listener(this._onProperty, this); // special event handler for opera

      if (qx.core.Environment.get("engine.name") == "opera") {
        this._onKeyDownWrapper = qx.lang.Function.listener(this._onKeyDown, this);
        this._onKeyUpWrapper = qx.lang.Function.listener(this._onKeyUp, this);
      }
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
        input: 1,
        change: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // special handling for opera
      __enter: false,
      __onInputTimeoutId: null,
      // stores the former set value for opera and IE
      __oldValue: null,
      // stores the former set value for IE
      __oldInputValue: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {
        var lower = target.tagName.toLowerCase();

        if (type === "input" && (lower === "input" || lower === "textarea")) {
          return true;
        }

        if (type === "change" && (lower === "input" || lower === "textarea" || lower === "select")) {
          return true;
        }

        return false;
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        if (qx.core.Environment.get("engine.name") == "mshtml" && (qx.core.Environment.get("engine.version") < 9 || qx.core.Environment.get("engine.version") >= 9 && qx.core.Environment.get("browser.documentmode") < 9)) {
          if (!target.__inputHandlerAttached) {
            var tag = target.tagName.toLowerCase();
            var elementType = target.type;

            if (elementType === "text" || elementType === "password" || tag === "textarea" || elementType === "checkbox" || elementType === "radio") {
              qx.bom.Event.addNativeListener(target, "propertychange", this._onPropertyWrapper);
            }

            if (elementType !== "checkbox" && elementType !== "radio") {
              qx.bom.Event.addNativeListener(target, "change", this._onChangeValueWrapper);
            }

            if (elementType === "text" || elementType === "password") {
              this._onKeyPressWrapped = qx.lang.Function.listener(this._onKeyPress, this, target);
              qx.bom.Event.addNativeListener(target, "keypress", this._onKeyPressWrapped);
            }

            target.__inputHandlerAttached = true;
          }
        } else {
          if (type === "input") {
            this.__registerInputListener(target);
          } else if (type === "change") {
            if (target.type === "radio" || target.type === "checkbox") {
              qx.bom.Event.addNativeListener(target, "change", this._onChangeCheckedWrapper);
            } else {
              qx.bom.Event.addNativeListener(target, "change", this._onChangeValueWrapper);
            } // special enter bugfix for opera


            if (qx.core.Environment.get("engine.name") == "opera" || qx.core.Environment.get("engine.name") == "mshtml") {
              if (target.type === "text" || target.type === "password") {
                this._onKeyPressWrapped = qx.lang.Function.listener(this._onKeyPress, this, target);
                qx.bom.Event.addNativeListener(target, "keypress", this._onKeyPressWrapped);
              }
            }
          }
        }
      },
      __registerInputListener: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(target) {
          if (qx.core.Environment.get("engine.version") >= 9 && qx.core.Environment.get("browser.documentmode") >= 9) {
            qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);

            if (target.type === "text" || target.type === "password" || target.type === "textarea") {
              // Fixed input for delete and backspace key
              this._inputFixWrapper = qx.lang.Function.listener(this._inputFix, this, target);
              qx.bom.Event.addNativeListener(target, "keyup", this._inputFixWrapper);
            }
          }
        },
        "webkit": function webkit(target) {
          var tag = target.tagName.toLowerCase(); // the change event is not fired while typing
          // this has been fixed in the latest nightlies

          if (parseFloat(qx.core.Environment.get("engine.version")) < 532 && tag == "textarea") {
            qx.bom.Event.addNativeListener(target, "keypress", this._onInputWrapper);
          }

          qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
        },
        "opera": function opera(target) {
          // register key events for filtering "enter" on input events
          qx.bom.Event.addNativeListener(target, "keyup", this._onKeyUpWrapper);
          qx.bom.Event.addNativeListener(target, "keydown", this._onKeyDownWrapper); // register an blur event for preventing the input event on blur

          qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
        },
        "default": function _default(target) {
          qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
        }
      }),
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type) {
        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("engine.version") < 9 && qx.core.Environment.get("browser.documentmode") < 9) {
          if (target.__inputHandlerAttached) {
            var tag = target.tagName.toLowerCase();
            var elementType = target.type;

            if (elementType === "text" || elementType === "password" || tag === "textarea" || elementType === "checkbox" || elementType === "radio") {
              qx.bom.Event.removeNativeListener(target, "propertychange", this._onPropertyWrapper);
            }

            if (elementType !== "checkbox" && elementType !== "radio") {
              qx.bom.Event.removeNativeListener(target, "change", this._onChangeValueWrapper);
            }

            if (elementType === "text" || elementType === "password") {
              qx.bom.Event.removeNativeListener(target, "keypress", this._onKeyPressWrapped);
            }

            try {
              delete target.__inputHandlerAttached;
            } catch (ex) {
              target.__inputHandlerAttached = null;
            }
          }
        } else {
          if (type === "input") {
            this.__unregisterInputListener(target);
          } else if (type === "change") {
            if (target.type === "radio" || target.type === "checkbox") {
              qx.bom.Event.removeNativeListener(target, "change", this._onChangeCheckedWrapper);
            } else {
              qx.bom.Event.removeNativeListener(target, "change", this._onChangeValueWrapper);
            }
          }

          if (qx.core.Environment.get("engine.name") == "opera" || qx.core.Environment.get("engine.name") == "mshtml") {
            if (target.type === "text" || target.type === "password") {
              qx.bom.Event.removeNativeListener(target, "keypress", this._onKeyPressWrapped);
            }
          }
        }
      },
      __unregisterInputListener: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(target) {
          if (qx.core.Environment.get("engine.version") >= 9 && qx.core.Environment.get("browser.documentmode") >= 9) {
            qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);

            if (target.type === "text" || target.type === "password" || target.type === "textarea") {
              // Fixed input for delete and backspace key
              qx.bom.Event.removeNativeListener(target, "keyup", this._inputFixWrapper);
            }
          }
        },
        "webkit": function webkit(target) {
          var tag = target.tagName.toLowerCase(); // the change event is not fired while typing
          // this has been fixed in the latest nightlies

          if (parseFloat(qx.core.Environment.get("engine.version")) < 532 && tag == "textarea") {
            qx.bom.Event.removeNativeListener(target, "keypress", this._onInputWrapper);
          }

          qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
        },
        "opera": function opera(target) {
          // unregister key events for filtering "enter" on input events
          qx.bom.Event.removeNativeListener(target, "keyup", this._onKeyUpWrapper);
          qx.bom.Event.removeNativeListener(target, "keydown", this._onKeyDownWrapper);
          qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
        },
        "default": function _default(target) {
          qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
        }
      }),

      /*
      ---------------------------------------------------------------------------
        FOR OPERA AND IE (KEYPRESS TO SIMULATE CHANGE EVENT)
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for fixing the different behavior when pressing the enter key.
       *
       * FF and Safari fire a "change" event if the user presses the enter key.
       * IE and Opera fire the event only if the focus is changed.
       *
       * @signature function(e, target)
       * @param e {Event} DOM event object
       * @param target {Element} The event target
       */
      _onKeyPress: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(e, target) {
          if (e.keyCode === 13) {
            if (target.value !== this.__oldValue) {
              this.__oldValue = target.value;
              qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
            }
          }
        },
        "opera": function opera(e, target) {
          if (e.keyCode === 13) {
            if (target.value !== this.__oldValue) {
              this.__oldValue = target.value;
              qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
            }
          }
        },
        "default": null
      }),

      /*
      ---------------------------------------------------------------------------
        FOR IE (KEYUP TO SIMULATE INPUT EVENT)
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for fixing the different behavior when pressing the backspace or
       * delete key.
       *
       * The other browsers fire a "input" event if the user presses the backspace
       * or delete key.
       * IE fire the event only for other keys.
       *
       * @signature function(e, target)
       * @param e {Event} DOM event object
       * @param target {Element} The event target
       */
      _inputFix: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(e, target) {
          if (e.keyCode === 46 || e.keyCode === 8) {
            if (target.value !== this.__oldInputValue) {
              this.__oldInputValue = target.value;
              qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
            }
          }
        },
        "default": null
      }),

      /*
      ---------------------------------------------------------------------------
        FOR OPERA ONLY LISTENER (KEY AND BLUR)
      ---------------------------------------------------------------------------
      */

      /**
       * Key event listener for opera which recognizes if the enter key has been
       * pressed.
       *
       * @signature function(e)
       * @param e {Event} DOM event object
       */
      _onKeyDown: qx.core.Environment.select("engine.name", {
        "opera": function opera(e) {
          // enter is pressed
          if (e.keyCode === 13) {
            this.__enter = true;
          }
        },
        "default": null
      }),

      /**
       * Key event listener for opera which recognizes if the enter key has been
       * pressed.
       *
       * @signature function(e)
       * @param e {Event} DOM event object
       */
      _onKeyUp: qx.core.Environment.select("engine.name", {
        "opera": function opera(e) {
          // enter is pressed
          if (e.keyCode === 13) {
            this.__enter = false;
          }
        },
        "default": null
      }),

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Internal function called by input elements created using {@link qx.bom.Input}.
       *
       * @signature function(e)
       * @param e {Event} Native DOM event
       */
      _onInput: qx.event.GlobalError.observeMethod(function (e) {
        var target = qx.bom.Event.getTarget(e);
        var tag = target.tagName.toLowerCase(); // ignore native input event when triggered by return in input element

        if (!this.__enter || tag !== "input") {
          // opera lower 10.6 needs a special treatment for input events because
          // they are also fired on blur
          if (qx.core.Environment.get("engine.name") == "opera" && qx.core.Environment.get("browser.version") < 10.6) {
            this.__onInputTimeoutId = window.setTimeout(function () {
              qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
            }, 0);
          } else {
            qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
          }
        }
      }),

      /**
       * Internal function called by input elements created using {@link qx.bom.Input}.
       *
       * @signature function(e)
       * @param e {Event} Native DOM event
       */
      _onChangeValue: qx.event.GlobalError.observeMethod(function (e) {
        var target = qx.bom.Event.getTarget(e);
        var data = target.value;

        if (target.type === "select-multiple") {
          var data = [];

          for (var i = 0, o = target.options, l = o.length; i < l; i++) {
            if (o[i].selected) {
              data.push(o[i].value);
            }
          }
        }

        qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [data]);
      }),

      /**
       * Internal function called by input elements created using {@link qx.bom.Input}.
       *
       * @signature function(e)
       * @param e {Event} Native DOM event
       */
      _onChangeChecked: qx.event.GlobalError.observeMethod(function (e) {
        var target = qx.bom.Event.getTarget(e);

        if (target.type === "radio") {
          if (target.checked) {
            qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
          }
        } else {
          qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.checked]);
        }
      }),

      /**
       * Internal function called by input elements created using {@link qx.bom.Input}.
       *
       * @signature function(e)
       * @param e {Event} Native DOM event
       */
      _onProperty: qx.core.Environment.select("engine.name", {
        "mshtml": qx.event.GlobalError.observeMethod(function (e) {
          var target = qx.bom.Event.getTarget(e);
          var prop = e.propertyName;

          if (prop === "value" && (target.type === "text" || target.type === "password" || target.tagName.toLowerCase() === "textarea")) {
            if (!target.$$inValueSet) {
              qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
            }
          } else if (prop === "checked") {
            if (target.type === "checkbox") {
              qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.checked]);
            } else if (target.checked) {
              qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
            }
          }
        }),
        "default": function _default() {}
      })
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
  qx.event.handler.Input.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Event": {},
      "qx.lang.Object": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "event.customevent": {
          "className": "qx.bom.client.Event"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Cross-browser custom UI event
   */
  qx.Bootstrap.define("qx.event.type.dom.Custom", {
    extend: Object,
    statics: {
      PROPERTIES: {
        bubbles: false,
        cancelable: true
      }
    },

    /**
     * @param type {String} event type
     * @param domEvent {Event} Native event that will be used as a template for the new event
     * @param customProps {Map} Map of event properties (will override the domEvent's values)
     * @return {Event} event object
     */
    construct: function construct(type, domEvent, customProps) {
      this._type = type;
      this._event = this._createEvent();

      this._initEvent(domEvent, customProps);

      this._event._original = domEvent;

      this._event.preventDefault = function () {
        if (this._original.preventDefault) {
          this._original.preventDefault();
        } else {
          // In IE8, the original event can be a DispCEventObj which throws an
          // exception when trying to access its properties.
          try {
            this._original.returnValue = false;
          } catch (ex) {}
        }
      };

      if (this._event.stopPropagation) {
        this._event._nativeStopPropagation = this._event.stopPropagation;
      }

      this._event.stopPropagation = function () {
        this._stopped = true;

        if (this._nativeStopPropagation) {
          this._original.stopPropagation();

          this._nativeStopPropagation();
        } else {
          this._original.cancelBubble = true;
        }
      };

      return this._event;
    },
    members: {
      _type: null,
      _event: null,

      /**
       * Creates a custom event object
       * @return {Event} event object
       */
      _createEvent: function _createEvent() {
        var evt;

        if (qx.core.Environment.get("event.customevent")) {
          evt = new window.CustomEvent(this._type);
        } else if (typeof document.createEvent == "function") {
          evt = document.createEvent("UIEvents");
        } else if (_typeof(document.createEventObject) == "object") {
          // IE8 doesn't support custom event types
          evt = {};
          evt.type = this._type;
        }

        return evt;
      },

      /**
       * Initializes a custom event
       *
       * @param domEvent {Event} Native event that will be used as a template for the new event
       * @param customProps {Map?} Map of event properties (will override the domEvent's values)
       */
      _initEvent: function _initEvent(domEvent, customProps) {
        customProps = customProps || {};
        var properties = qx.lang.Object.clone(qx.event.type.dom.Custom.PROPERTIES);

        for (var prop in customProps) {
          properties[prop] = customProps[prop];
        }

        if (this._event.initEvent) {
          this._event.initEvent(this._type, properties.bubbles, properties.cancelable);
        }

        for (var prop in properties) {
          try {
            this._event[prop] = properties[prop];
          } catch (ex) {//Nothing - strict mode prevents writing to read only properties
          }
        }
      }
    }
  });
  qx.event.type.dom.Custom.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.type.dom.Custom": {
        "construct": true,
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.bom.client.Event": {},
      "qx.bom.client.Engine": {
        "defer": "runtime"
      },
      "qx.bom.client.OperatingSystem": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "event.mouseevent": {
          "className": "qx.bom.client.Event"
        },
        "event.mousecreateevent": {
          "className": "qx.bom.client.Event"
        },
        "engine.name": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "os.name": {
          "defer": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "os.version": {
          "defer": true,
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
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Synthetic pointer event
   */
  qx.Bootstrap.define("qx.event.type.dom.Pointer", {
    extend: qx.event.type.dom.Custom,
    statics: {
      MOUSE_PROPERTIES: ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "pageX", "pageY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "which", "relatedTarget", // IE8 properties:
      "fromElement", "toElement"],
      POINTER_PROPERTIES: {
        pointerId: 1,
        width: 0,
        height: 0,
        pressure: 0.5,
        tiltX: 0,
        tiltY: 0,
        pointerType: "",
        isPrimary: false
      },
      READONLY_PROPERTIES: [],
      BIND_METHODS: ["getPointerType", "getViewportLeft", "getViewportTop", "getDocumentLeft", "getDocumentTop", "getScreenLeft", "getScreenTop"],

      /**
       * Returns the device type which the event triggered. This can be one
       * of the following strings: <code>mouse</code>, <code>pen</code>
       * or <code>touch</code>.
       *
       * @return {String} The type of the pointer.
       */
      getPointerType: function getPointerType() {
        if (typeof this.pointerType == "string") {
          return this.pointerType;
        }

        if (typeof this.pointerType == "number") {
          if (this.pointerType == this.MSPOINTER_TYPE_MOUSE) {
            return "mouse";
          }

          if (this.pointerType == this.MSPOINTER_TYPE_PEN) {
            return "pen";
          }

          if (this.pointerType == this.MSPOINTER_TYPE_TOUCH) {
            return "touch";
          }
        }

        return "";
      },

      /**
       * Get the horizontal coordinate at which the event occurred relative
       * to the viewport.
       *
       * @return {Number} The horizontal mouse position
       */
      getViewportLeft: function getViewportLeft() {
        return this.clientX;
      },

      /**
       * Get the vertical coordinate at which the event occurred relative
       * to the viewport.
       *
       * @return {Number} The vertical mouse position
       * @signature function()
       */
      getViewportTop: function getViewportTop() {
        return this.clientY;
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Number} The horizontal mouse position in the document.
       */
      getDocumentLeft: function getDocumentLeft() {
        if (this.pageX !== undefined) {
          return this.pageX;
        } else {
          var win = qx.dom.Node.getWindow(this.srcElement);
          return this.clientX + qx.bom.Viewport.getScrollLeft(win);
        }
      },

      /**
       * Get the vertical position at which the event occurred relative to the
       * top of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Number} The vertical mouse position in the document.
       */
      getDocumentTop: function getDocumentTop() {
        if (this.pageY !== undefined) {
          return this.pageY;
        } else {
          var win = qx.dom.Node.getWindow(this.srcElement);
          return this.clientY + qx.bom.Viewport.getScrollTop(win);
        }
      },

      /**
       * Get the horizontal coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * Note: This value is usually not very useful unless you want to
       * position a native popup window at this coordinate.
       *
       * @return {Number} The horizontal mouse position on the screen.
       */
      getScreenLeft: function getScreenLeft() {
        return this.screenX;
      },

      /**
       * Get the vertical coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * Note: This value is usually not very useful unless you want to
       * position a native popup window at this coordinate.
       *
       * @return {Number} The vertical mouse position on the screen.
       */
      getScreenTop: function getScreenTop() {
        return this.screenY;
      },

      /**
       * Manipulates the event object, adding methods if they're not
       * already present
       *
       * @param event {Event} Native event object
       */
      normalize: function normalize(event) {
        var bindMethods = qx.event.type.dom.Pointer.BIND_METHODS;

        for (var i = 0, l = bindMethods.length; i < l; i++) {
          if (typeof event[bindMethods[i]] != "function") {
            event[bindMethods[i]] = qx.event.type.dom.Pointer[bindMethods[i]].bind(event);
          }
        }
      }
    },
    construct: function construct(type, domEvent, customProps) {
      return qx.event.type.dom.Custom.constructor.call(this, type, domEvent, customProps);
    },
    members: {
      _createEvent: function _createEvent() {
        var evt;

        if (qx.core.Environment.get("event.mouseevent")) {
          evt = new window.MouseEvent(this._type);
        } else if (typeof document.createEvent == "function") {
          /* In IE9, the pageX property of synthetic MouseEvents is always 0
          and cannot be overridden, so we create a plain UIEvent and add
          the mouse event properties ourselves. */
          evt = document.createEvent(qx.core.Environment.get("event.mousecreateevent"));
        } else if (_typeof(document.createEventObject) == "object") {
          // IE8 doesn't support custom event types
          evt = {};
          evt.type = this._type;
        }

        return evt;
      },
      _initEvent: function _initEvent(domEvent, customProps) {
        customProps = customProps || {};
        var evt = this._event;
        var properties = {};
        qx.event.type.dom.Pointer.normalize(domEvent);
        Object.keys(qx.event.type.dom.Pointer.POINTER_PROPERTIES).concat(qx.event.type.dom.Pointer.MOUSE_PROPERTIES).forEach(function (propName) {
          if (typeof customProps[propName] !== "undefined") {
            properties[propName] = customProps[propName];
          } else if (typeof domEvent[propName] !== "undefined") {
            properties[propName] = domEvent[propName];
          } else if (typeof qx.event.type.dom.Pointer.POINTER_PROPERTIES[propName] !== "undefined") {
            properties[propName] = qx.event.type.dom.Pointer.POINTER_PROPERTIES[propName];
          }
        });
        var buttons;

        switch (domEvent.which) {
          case 1:
            buttons = 1;
            break;

          case 2:
            buttons = 4;
            break;

          case 3:
            buttons = 2;
            break;

          default:
            buttons = 0;
        }

        if (buttons !== undefined) {
          properties.buttons = buttons;
          properties.pressure = buttons ? 0.5 : 0;
        }

        if (evt.initMouseEvent) {
          evt.initMouseEvent(this._type, properties.bubbles, properties.cancelable, properties.view, properties.detail, properties.screenX, properties.screenY, properties.clientX, properties.clientY, properties.ctrlKey, properties.altKey, properties.shiftKey, properties.metaKey, properties.button, properties.relatedTarget);
        } else if (evt.initUIEvent) {
          evt.initUIEvent(this._type, properties.bubbles, properties.cancelable, properties.view, properties.detail);
        }

        for (var prop in properties) {
          if (evt[prop] !== properties[prop] && qx.event.type.dom.Pointer.READONLY_PROPERTIES.indexOf(prop) === -1) {
            try {
              evt[prop] = properties[prop];
            } catch (ex) {// Nothing - cannot override properties in strict mode
            }
          }
        } // normalize Windows 8 pointer types


        switch (evt.pointerType) {
          case domEvent.MSPOINTER_TYPE_MOUSE:
            evt.pointerType = "mouse";
            break;

          case domEvent.MSPOINTER_TYPE_PEN:
            evt.pointerType = "pen";
            break;

          case domEvent.MSPOINTER_TYPE_TOUCH:
            evt.pointerType = "touch";
            break;
        }

        if (evt.pointerType == "mouse") {
          evt.isPrimary = true;
        }
      }
    },
    defer: function defer(statics) {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        statics.READONLY_PROPERTIES.push("buttons");
      } else if (qx.core.Environment.get("os.name") == "ios" && parseFloat(qx.core.Environment.get("os.version")) >= 8) {
        statics.READONLY_PROPERTIES = statics.READONLY_PROPERTIES.concat(statics.MOUSE_PROPERTIES);
      }
    }
  });
  qx.event.type.dom.Pointer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.DomBubbling": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Pointer": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.dom.Pointer": {
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
      "qx.event.handler.PointerCore": {
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
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.bom.Event": {},
      "qx.event.Utils": {},
      "qx.event.type.Data": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
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
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Unified pointer event handler.
   * @require(qx.event.dispatch.DomBubbling)
   * @require(qx.event.type.Pointer) // load-time dependency for early native events
   * @require(qx.event.type.dom.Pointer)
   */
  qx.Class.define("qx.event.handler.Pointer", {
    extend: qx.event.handler.PointerCore,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        pointermove: 1,
        pointerover: 1,
        pointerout: 1,
        pointerdown: 1,
        pointerup: 1,
        pointercancel: 1,
        gesturebegin: 1,
        gesturemove: 1,
        gesturefinish: 1,
        gesturecancel: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      // Define shorthands
      this.__manager = manager;
      this.__window = manager.getWindow();
      this.__root = this.__window.document;
      qx.event.handler.PointerCore.apply(this, [this.__root]);
    },
    members: {
      __manager: null,
      __window: null,
      __root: null,
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },
      // overridden
      _initPointerObserver: function _initPointerObserver() {
        var useEmitter = false;

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          // Workaround for bug #8293: Use an emitter to listen to the
          // pointer events fired by a pointer handler attached by qxWeb.
          useEmitter = true;
        }

        this._initObserver(this._onPointerEvent, useEmitter);
      },

      /**
       * Fire a pointer event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        } // respect anonymous elements


        while (target && target.getAttribute && target.getAttribute("qxanonymous")) {
          target = target.parentNode;
        }

        if (!type) {
          type = domEvent.type;
        }

        type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[type] || type;

        if (target && target.nodeType) {
          qx.event.type.dom.Pointer.normalize(domEvent); // ensure compatibility with native events for IE8

          try {
            domEvent.srcElement = target;
          } catch (ex) {// Nothing - cannot change properties in strict mode
          }

          var tracker = {};
          var self = this;
          qx.event.Utils.track(tracker, function () {
            return qx.event.Registration.fireEvent(target, type, qx.event.type.Pointer, [domEvent, target, null, true, true]);
          });
          qx.event.Utils.then(tracker, function () {
            if ((domEvent.getPointerType() !== "mouse" || domEvent.button <= qx.event.handler.PointerCore.LEFT_BUTTON) && (type == "pointerdown" || type == "pointerup" || type == "pointermove" || type == "pointercancel")) {
              return qx.event.Registration.fireEvent(self.__root, qx.event.handler.PointerCore.POINTER_TO_GESTURE_MAPPING[type], qx.event.type.Pointer, [domEvent, target, null, false, false]);
            }
          });
          qx.event.Utils.then(tracker, function () {
            // Fire user action event
            return qx.event.Registration.fireEvent(self.__window, "useraction", qx.event.type.Data, [type]);
          });
          return tracker.promise;
        }
      },
      // overridden
      _onPointerEvent: function _onPointerEvent(domEvent) {
        if (domEvent._original && domEvent._original[this._processedFlag]) {
          return;
        }

        var type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[domEvent.type] || domEvent.type;
        return this._fireEvent(domEvent, type, qx.bom.Event.getTarget(domEvent));
      },

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this.__callBase("dispose");

        this.__manager = this.__window = this.__root = null;
      },

      /**
       * Call overridden method.
       *
       * @param method {String} Name of the overridden method.
       * @param args {Array} Arguments.
       */
      __callBase: function __callBase(method, args) {
        qx.event.handler.PointerCore.prototype[method].apply(this, args || []);
      }
    },
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
      qx.event.Registration.getManager(document).getHandler(statics);
    }
  });
  qx.event.handler.Pointer.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.bom.client.Event": {},
      "qx.bom.Event": {},
      "qx.bom.AnimationFrame": {},
      "qx.lang.Function": {},
      "qx.event.type.dom.Custom": {},
      "qx.util.Wheel": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.event.Timer": {}
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
        "event.mousewheel": {
          "className": "qx.bom.client.Event"
        },
        "event.dispatchevent": {
          "className": "qx.bom.client.Event"
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
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Listens for (native or synthetic) pointer events and fires events
   * for gestures like "tap" or "swipe"
   */
  qx.Bootstrap.define("qx.event.handler.GestureCore", {
    extend: Object,
    implement: [qx.core.IDisposable],
    statics: {
      TYPES: ["tap", "swipe", "longtap", "dbltap", "track", "trackstart", "trackend", "rotate", "pinch", "roll"],
      GESTURE_EVENTS: ["gesturebegin", "gesturefinish", "gesturemove", "gesturecancel"],

      /** @type {Map} Maximum distance between a pointer-down and pointer-up event, values are configurable */
      TAP_MAX_DISTANCE: {
        "touch": 40,
        "mouse": 5,
        "pen": 20
      },
      // values are educated guesses

      /** @type {Map} Maximum distance between two subsequent taps, values are configurable */
      DOUBLETAP_MAX_DISTANCE: {
        "touch": 10,
        "mouse": 4,
        "pen": 10
      },
      // values are educated guesses

      /** @type {Map} The direction of a swipe relative to the axis */
      SWIPE_DIRECTION: {
        x: ["left", "right"],
        y: ["up", "down"]
      },

      /**
       * @type {Integer} The time delta in milliseconds to fire a long tap event.
       */
      LONGTAP_TIME: 500,

      /**
       * @type {Integer} Maximum time between two tap events that will still trigger a
       * dbltap event.
       */
      DOUBLETAP_TIME: 500,

      /**
       * @type {Integer} Factor which is used for adapting the delta of the mouse wheel
       * event to the roll events,
       */
      ROLL_FACTOR: 18,

      /**
       * @type {Integer} Factor which is used for adapting the delta of the touchpad gesture
       * event to the roll events,
       */
      TOUCHPAD_ROLL_FACTOR: 1,

      /**
       * @type {Integer} Minimum number of wheel events to receive during the
       * TOUCHPAD_WHEEL_EVENTS_PERIOD to detect a touchpad.
       */
      TOUCHPAD_WHEEL_EVENTS_THRESHOLD: 10,

      /**
       * @type {Integer} Period (in ms) during which the wheel events are counted in order
       * to detect a touchpad.
       */
      TOUCHPAD_WHEEL_EVENTS_PERIOD: 100,

      /**
       * @type {Integer} Timeout (in ms) after which the touchpad detection is reset if no wheel
       * events are received in the meantime.
       */
      TOUCHPAD_WHEEL_EVENTS_TIMEOUT: 5000
    },

    /**
     * @param target {Element} DOM Element that should fire gesture events
     * @param emitter {qx.event.Emitter?} Event emitter (used if dispatchEvent
     * is not supported, e.g. in IE8)
     */
    construct: function construct(target, emitter) {
      this.__defaultTarget = target;
      this.__emitter = emitter;
      this.__gesture = {};
      this.__lastTap = {};
      this.__stopMomentum = {};
      this.__momentum = {};
      this.__rollEvents = [];

      this._initObserver();
    },
    members: {
      __defaultTarget: null,
      __emitter: null,
      __gesture: null,
      __eventName: null,
      __primaryTarget: null,
      __isMultiPointerGesture: null,
      __initialAngle: null,
      __lastTap: null,
      __rollImpulseId: null,
      __stopMomentum: null,
      __initialDistance: null,
      __momentum: null,
      __rollEvents: null,
      __rollEventsCountStart: 0,
      __rollEventsCount: 0,
      __touchPadDetectionPerformed: false,
      __lastRollEventTime: 0,

      /**
       * Register pointer event listeners
       */
      _initObserver: function _initObserver() {
        qx.event.handler.GestureCore.GESTURE_EVENTS.forEach(function (gestureType) {
          qxWeb(this.__defaultTarget).on(gestureType, this.checkAndFireGesture, this);
        }.bind(this));

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          qxWeb(this.__defaultTarget).on("dblclick", this._onDblClick, this);
        } // list to wheel events


        var data = qx.core.Environment.get("event.mousewheel");
        qxWeb(data.target).on(data.type, this._fireRoll, this);
      },

      /**
       * Remove native pointer event listeners.
       */
      _stopObserver: function _stopObserver() {
        qx.event.handler.GestureCore.GESTURE_EVENTS.forEach(function (pointerType) {
          qxWeb(this.__defaultTarget).off(pointerType, this.checkAndFireGesture, this);
        }.bind(this));

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          qxWeb(this.__defaultTarget).off("dblclick", this._onDblClick, this);
        }

        var data = qx.core.Environment.get("event.mousewheel");
        qxWeb(data.target).off(data.type, this._fireRoll, this);
      },

      /**
       * Checks if a gesture was made and fires the gesture event.
       *
       * @param domEvent {qx.event.type.Pointer} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      checkAndFireGesture: function checkAndFireGesture(domEvent, type, target) {
        if (!type) {
          type = domEvent.type;
        }

        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        }

        if (type == "gesturebegin") {
          this.gestureBegin(domEvent, target);
        } else if (type == "gesturemove") {
          this.gestureMove(domEvent, target);
        } else if (type == "gesturefinish") {
          this.gestureFinish(domEvent, target);
        } else if (type == "gesturecancel") {
          this.gestureCancel(domEvent.pointerId);
        }
      },

      /**
       * Helper method for gesture start.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      gestureBegin: function gestureBegin(domEvent, target) {
        if (this.__gesture[domEvent.pointerId]) {
          this.__stopLongTapTimer(this.__gesture[domEvent.pointerId]);

          delete this.__gesture[domEvent.pointerId];
        }
        /*
          If the dom event's target or one of its ancestors have
          a gesture handler, we don't need to fire the gesture again
          since it bubbles.
         */


        if (this._hasIntermediaryHandler(target)) {
          return;
        }

        this.__gesture[domEvent.pointerId] = {
          "startTime": new Date().getTime(),
          "lastEventTime": new Date().getTime(),
          "startX": domEvent.clientX,
          "startY": domEvent.clientY,
          "clientX": domEvent.clientX,
          "clientY": domEvent.clientY,
          "velocityX": 0,
          "velocityY": 0,
          "target": target,
          "isTap": true,
          "isPrimary": domEvent.isPrimary,
          "longTapTimer": window.setTimeout(this.__fireLongTap.bind(this, domEvent, target), qx.event.handler.GestureCore.LONGTAP_TIME)
        };

        if (domEvent.isPrimary) {
          this.__isMultiPointerGesture = false;
          this.__primaryTarget = target;

          this.__fireTrack("trackstart", domEvent, target);
        } else {
          this.__isMultiPointerGesture = true;

          if (Object.keys(this.__gesture).length === 2) {
            this.__initialAngle = this._calcAngle();
            this.__initialDistance = this._calcDistance();
          }
        }
      },

      /**
       * Helper method for gesture move.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      gestureMove: function gestureMove(domEvent, target) {
        var gesture = this.__gesture[domEvent.pointerId];

        if (gesture) {
          var oldClientX = gesture.clientX;
          var oldClientY = gesture.clientY;
          gesture.clientX = domEvent.clientX;
          gesture.clientY = domEvent.clientY;
          gesture.lastEventTime = new Date().getTime();

          if (oldClientX) {
            gesture.velocityX = gesture.clientX - oldClientX;
          }

          if (oldClientY) {
            gesture.velocityY = gesture.clientY - oldClientY;
          }

          if (Object.keys(this.__gesture).length === 2) {
            this.__fireRotate(domEvent, gesture.target);

            this.__firePinch(domEvent, gesture.target);
          }

          if (!this.__isMultiPointerGesture) {
            this.__fireTrack("track", domEvent, gesture.target);

            this._fireRoll(domEvent, "touch", gesture.target);
          } // abort long tap timer if the distance is too big


          if (gesture.isTap) {
            gesture.isTap = this._isBelowTapMaxDistance(domEvent);

            if (!gesture.isTap) {
              this.__stopLongTapTimer(gesture);
            }
          }
        }
      },

      /**
       * Checks if a DOM element located between the target of a gesture
       * event and the element this handler is attached to has a gesture
       * handler of its own.
       *
       * @param target {Element} The gesture event's target
       * @return {Boolean}
       */
      _hasIntermediaryHandler: function _hasIntermediaryHandler(target) {
        while (target && target !== this.__defaultTarget) {
          if (target.$$gestureHandler) {
            return true;
          }

          target = target.parentNode;
        }

        return false;
      },

      /**
       * Helper method for gesture end.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      gestureFinish: function gestureFinish(domEvent, target) {
        // If no start position is available for this pointerup event, cancel gesture recognition.
        if (!this.__gesture[domEvent.pointerId]) {
          return;
        }

        var gesture = this.__gesture[domEvent.pointerId]; // delete the long tap

        this.__stopLongTapTimer(gesture);
        /*
          If the dom event's target or one of its ancestors have
          a gesture handler, we don't need to fire the gesture again
          since it bubbles.
         */


        if (this._hasIntermediaryHandler(target)) {
          return;
        } // always start the roll impulse on the original target


        this.__handleRollImpulse(gesture.velocityX, gesture.velocityY, domEvent, gesture.target);

        this.__fireTrack("trackend", domEvent, gesture.target);

        if (gesture.isTap) {
          if (target !== gesture.target) {
            delete this.__gesture[domEvent.pointerId];
            return;
          }

          this._fireEvent(domEvent, "tap", domEvent.target || target);

          var isDblTap = false;

          if (Object.keys(this.__lastTap).length > 0) {
            // delete old tap entries
            var limit = Date.now() - qx.event.handler.GestureCore.DOUBLETAP_TIME;

            for (var time in this.__lastTap) {
              if (time < limit) {
                delete this.__lastTap[time];
              } else {
                var lastTap = this.__lastTap[time];

                var isBelowDoubleTapDistance = this.__isBelowDoubleTapDistance(lastTap.x, lastTap.y, domEvent.clientX, domEvent.clientY, domEvent.getPointerType());

                var isSameTarget = lastTap.target === (domEvent.target || target);
                var isSameButton = lastTap.button === domEvent.button;

                if (isBelowDoubleTapDistance && isSameButton && isSameTarget) {
                  isDblTap = true;
                  delete this.__lastTap[time];

                  this._fireEvent(domEvent, "dbltap", domEvent.target || target);
                }
              }
            }
          }

          if (!isDblTap) {
            this.__lastTap[Date.now()] = {
              x: domEvent.clientX,
              y: domEvent.clientY,
              target: domEvent.target || target,
              button: domEvent.button
            };
          }
        } else if (!this._isBelowTapMaxDistance(domEvent)) {
          var swipe = this.__getSwipeGesture(domEvent, target);

          if (swipe) {
            domEvent.swipe = swipe;

            this._fireEvent(domEvent, "swipe", gesture.target || target);
          }
        }

        delete this.__gesture[domEvent.pointerId];
      },

      /**
       * Stops the momentum scrolling currently running.
       *
       * @param id {Integer} The timeoutId of a 'roll' event
       */
      stopMomentum: function stopMomentum(id) {
        this.__stopMomentum[id] = true;
      },

      /**
       * Cancels the gesture if running.
       * @param id {Number} The pointer Id.
       */
      gestureCancel: function gestureCancel(id) {
        if (this.__gesture[id]) {
          this.__stopLongTapTimer(this.__gesture[id]);

          delete this.__gesture[id];
        }

        if (this.__momentum[id]) {
          this.stopMomentum(this.__momentum[id]);
          delete this.__momentum[id];
        }
      },

      /**
       * Update the target of a running gesture. This is used in virtual widgets
       * when the DOM element changes.
       *
       * @param id {String} The pointer id.
       * @param target {Element} The new target element.
       * @internal
       */
      updateGestureTarget: function updateGestureTarget(id, target) {
        this.__gesture[id].target = target;
      },

      /**
       * Method which will be called recursively to provide a momentum scrolling.
       * @param deltaX {Number} The last offset in X direction
       * @param deltaY {Number} The last offset in Y direction
       * @param domEvent {Event} The original gesture event
       * @param target {Element} The target of the momentum roll events
       * @param time {Number ?} The time in ms between the last two calls
       */
      __handleRollImpulse: function __handleRollImpulse(deltaX, deltaY, domEvent, target, time) {
        var oldTimeoutId = domEvent.timeoutId;

        if (!time && this.__momentum[domEvent.pointerId]) {
          // new roll impulse started, stop the old one
          this.stopMomentum(this.__momentum[domEvent.pointerId]);
        } // do nothing if we don't need to scroll


        if (Math.abs(deltaY) < 1 && Math.abs(deltaX) < 1 || this.__stopMomentum[oldTimeoutId] || !this.getWindow()) {
          delete this.__stopMomentum[oldTimeoutId];
          delete this.__momentum[domEvent.pointerId];
          return;
        }

        if (!time) {
          time = 1;
          var startFactor = 2.8;
          deltaY = deltaY / startFactor;
          deltaX = deltaX / startFactor;
        }

        time += 0.0006;
        deltaY = deltaY / time;
        deltaX = deltaX / time; // set up a new timer with the new delta

        var timeoutId = qx.bom.AnimationFrame.request(qx.lang.Function.bind(function (deltaX, deltaY, domEvent, target, time) {
          this.__handleRollImpulse(deltaX, deltaY, domEvent, target, time);
        }, this, deltaX, deltaY, domEvent, target, time));
        deltaX = Math.round(deltaX * 100) / 100;
        deltaY = Math.round(deltaY * 100) / 100; // scroll the desired new delta

        domEvent.delta = {
          x: -deltaX,
          y: -deltaY
        };
        domEvent.momentum = true;
        domEvent.timeoutId = timeoutId;
        this.__momentum[domEvent.pointerId] = timeoutId;

        this._fireEvent(domEvent, "roll", domEvent.target || target);
      },

      /**
      * Calculates the angle of the primary and secondary pointer.
      * @return {Number} the rotation angle of the 2 pointers.
      */
      _calcAngle: function _calcAngle() {
        var pointerA = null;
        var pointerB = null;

        for (var pointerId in this.__gesture) {
          var gesture = this.__gesture[pointerId];

          if (pointerA === null) {
            pointerA = gesture;
          } else {
            pointerB = gesture;
          }
        }

        var x = pointerA.clientX - pointerB.clientX;
        var y = pointerA.clientY - pointerB.clientY;
        return (360 + Math.atan2(y, x) * (180 / Math.PI)) % 360;
      },

      /**
       * Calculates the scaling distance between two pointers.
       * @return {Number} the calculated distance.
       */
      _calcDistance: function _calcDistance() {
        var pointerA = null;
        var pointerB = null;

        for (var pointerId in this.__gesture) {
          var gesture = this.__gesture[pointerId];

          if (pointerA === null) {
            pointerA = gesture;
          } else {
            pointerB = gesture;
          }
        }

        var scale = Math.sqrt(Math.pow(pointerA.clientX - pointerB.clientX, 2) + Math.pow(pointerA.clientY - pointerB.clientY, 2));
        return scale;
      },

      /**
       * Checks if the distance between the x/y coordinates of DOM event
       * exceeds TAP_MAX_DISTANCE and returns the result.
       *
       * @param domEvent {Event} The DOM event from the browser.
       * @return {Boolean|null} true if distance is below TAP_MAX_DISTANCE.
       */
      _isBelowTapMaxDistance: function _isBelowTapMaxDistance(domEvent) {
        var delta = this._getDeltaCoordinates(domEvent);

        var maxDistance = qx.event.handler.GestureCore.TAP_MAX_DISTANCE[domEvent.getPointerType()];

        if (!delta) {
          return null;
        }

        return Math.abs(delta.x) <= maxDistance && Math.abs(delta.y) <= maxDistance;
      },

      /**
       * Checks if the distance between the x1/y1 and x2/y2 is
       * below the TAP_MAX_DISTANCE and returns the result.
       *
       * @param x1 {Number} The x position of point one.
       * @param y1 {Number} The y position of point one.
       * @param x2 {Number} The x position of point two.
       * @param y2 {Number} The y position of point two.
       * @param type {String} The pointer type e.g. "mouse"
       * @return {Boolean} <code>true</code>, if points are in range
       */
      __isBelowDoubleTapDistance: function __isBelowDoubleTapDistance(x1, y1, x2, y2, type) {
        var clazz = qx.event.handler.GestureCore;
        var inX = Math.abs(x1 - x2) < clazz.DOUBLETAP_MAX_DISTANCE[type];
        var inY = Math.abs(y1 - y2) < clazz.DOUBLETAP_MAX_DISTANCE[type];
        return inX && inY;
      },

      /**
      * Calculates the delta coordinates in relation to the position on <code>pointerstart</code> event.
      * @param domEvent {Event} The DOM event from the browser.
      * @return {Map} containing the deltaX as x, and deltaY as y.
      */
      _getDeltaCoordinates: function _getDeltaCoordinates(domEvent) {
        var gesture = this.__gesture[domEvent.pointerId];

        if (!gesture) {
          return null;
        }

        var deltaX = domEvent.clientX - gesture.startX;
        var deltaY = domEvent.clientY - gesture.startY;
        var axis = "x";

        if (Math.abs(deltaX / deltaY) < 1) {
          axis = "y";
        }

        return {
          "x": deltaX,
          "y": deltaY,
          "axis": axis
        };
      },

      /**
       * Fire a gesture event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String} type of the event
       * @param target {Element ? null} event target
       * @return {qx.Promise?} a promise, if one or more of the event handlers returned a promise
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        // The target may have been removed, e.g. menu hide on tap
        if (!this.__defaultTarget) {
          return;
        }

        var evt;

        if (qx.core.Environment.get("event.dispatchevent")) {
          evt = new qx.event.type.dom.Custom(type, domEvent, {
            bubbles: true,
            swipe: domEvent.swipe,
            scale: domEvent.scale,
            angle: domEvent.angle,
            delta: domEvent.delta,
            pointerType: domEvent.pointerType,
            momentum: domEvent.momentum
          });
          return target.dispatchEvent(evt);
        } else if (this.__emitter) {
          evt = new qx.event.type.dom.Custom(type, domEvent, {
            target: this.__defaultTarget,
            currentTarget: this.__defaultTarget,
            srcElement: this.__defaultTarget,
            swipe: domEvent.swipe,
            scale: domEvent.scale,
            angle: domEvent.angle,
            delta: domEvent.delta,
            pointerType: domEvent.pointerType,
            momentum: domEvent.momentum
          });

          this.__emitter.emit(type, domEvent);
        }
      },

      /**
       * Fire "tap" and "dbltap" events after a native "dblclick"
       * event to fix IE 8's broken mouse event sequence.
       *
       * @param domEvent {Event} dblclick event
       */
      _onDblClick: function _onDblClick(domEvent) {
        var target = qx.bom.Event.getTarget(domEvent);

        this._fireEvent(domEvent, "tap", target);

        this._fireEvent(domEvent, "dbltap", target);
      },

      /**
       * Returns the swipe gesture when the user performed a swipe.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       * @return {Map|null} returns the swipe data when the user performed a swipe, null if the gesture was no swipe.
       */
      __getSwipeGesture: function __getSwipeGesture(domEvent, target) {
        var gesture = this.__gesture[domEvent.pointerId];

        if (!gesture) {
          return null;
        }

        var clazz = qx.event.handler.GestureCore;

        var deltaCoordinates = this._getDeltaCoordinates(domEvent);

        var duration = new Date().getTime() - gesture.startTime;
        var axis = Math.abs(deltaCoordinates.x) >= Math.abs(deltaCoordinates.y) ? "x" : "y";
        var distance = deltaCoordinates[axis];
        var direction = clazz.SWIPE_DIRECTION[axis][distance < 0 ? 0 : 1];
        var velocity = duration !== 0 ? distance / duration : 0;
        var swipe = {
          startTime: gesture.startTime,
          duration: duration,
          axis: axis,
          direction: direction,
          distance: distance,
          velocity: velocity
        };
        return swipe;
      },

      /**
       * Fires a track event.
       *
       * @param type {String} the track type
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      __fireTrack: function __fireTrack(type, domEvent, target) {
        domEvent.delta = this._getDeltaCoordinates(domEvent);

        this._fireEvent(domEvent, type, domEvent.target || target);
      },

      /**
       * Fires a roll event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       * @param rollFactor {Integer} the roll factor to apply
       */
      __fireRollEvent: function __fireRollEvent(domEvent, target, rollFactor) {
        domEvent.delta = {
          x: qx.util.Wheel.getDelta(domEvent, "x") * rollFactor,
          y: qx.util.Wheel.getDelta(domEvent, "y") * rollFactor
        };
        domEvent.delta.axis = Math.abs(domEvent.delta.x / domEvent.delta.y) < 1 ? "y" : "x";
        domEvent.pointerType = "wheel";

        this._fireEvent(domEvent, "roll", domEvent.target || target);
      },

      /**
       * Triggers the adaptative roll scrolling.
       *
       * @param target {Element} event target
       */
      __performAdaptativeRollScrolling: function __performAdaptativeRollScrolling(target) {
        var rollFactor = qx.event.handler.GestureCore.ROLL_FACTOR;

        if (qx.util.Wheel.IS_TOUCHPAD) {
          // The domEvent was generated by a touchpad
          rollFactor = qx.event.handler.GestureCore.TOUCHPAD_ROLL_FACTOR;
        }

        this.__lastRollEventTime = new Date().getTime();
        var reLength = this.__rollEvents.length;

        for (var i = 0; i < reLength; i++) {
          var domEvent = this.__rollEvents[i];

          this.__fireRollEvent(domEvent, target, rollFactor);
        }

        this.__rollEvents = [];
      },

      /**
       * Ends touch pad detection process.
       */
      __endTouchPadDetection: function __endTouchPadDetection() {
        if (this.__rollEvents.length > qx.event.handler.GestureCore.TOUCHPAD_WHEEL_EVENTS_THRESHOLD) {
          qx.util.Wheel.IS_TOUCHPAD = true;
        } else {
          qx.util.Wheel.IS_TOUCHPAD = false;
        }

        this.__touchPadDetectionPerformed = true;
      },

      /**
       * Is touchpad detection enabled ? Default implementation activates it only for Mac OS after Sierra (>= 10.12).
       * @return {boolean} true if touchpad detection should occur.
       * @internal
       */
      _isTouchPadDetectionEnabled: function _isTouchPadDetectionEnabled() {
        return qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("os.version") >= 10.12;
      },

      /**
       * Fires a roll event after determining the roll factor to apply. Mac OS Sierra (10.12+)
       * introduces a lot more wheel events fired from the trackpad, so the roll factor to be applied
       * has to be reduced in order to make the scrolling less sensitive.
       *
       * @param domEvent {Event} DOM event
       * @param type {String} The type of the dom event
       * @param target {Element} event target
       */
      _fireRoll: function _fireRoll(domEvent, type, target) {
        var now;
        var detectionTimeout;

        if (domEvent.type === qx.core.Environment.get("event.mousewheel").type) {
          if (this._isTouchPadDetectionEnabled()) {
            now = new Date().getTime();
            detectionTimeout = qx.event.handler.GestureCore.TOUCHPAD_WHEEL_EVENTS_TIMEOUT;

            if (this.__lastRollEventTime > 0 && now - this.__lastRollEventTime > detectionTimeout) {
              // The detection timeout was reached. A new detection step should occur.
              this.__touchPadDetectionPerformed = false;
              this.__rollEvents = [];
              this.__lastRollEventTime = 0;
            }

            if (!this.__touchPadDetectionPerformed) {
              // We are into a detection session. We count the events so that we can decide if
              // they were fired by a real mouse wheel or a touchpad. Just swallow them until the
              // detection period is over.
              if (this.__rollEvents.length === 0) {
                // detection starts
                this.__rollEventsCountStart = now;
                qx.event.Timer.once(function () {
                  if (!this.__touchPadDetectionPerformed) {
                    // There were not enough events during the TOUCHPAD_WHEEL_EVENTS_PERIOD to actually
                    // trigger a scrolling. Trigger it manually.
                    this.__endTouchPadDetection();

                    this.__performAdaptativeRollScrolling(target);
                  }
                }, this, qx.event.handler.GestureCore.TOUCHPAD_WHEEL_EVENTS_PERIOD + 50);
              }

              this.__rollEvents.push(domEvent);

              this.__rollEventsCount++;

              if (now - this.__rollEventsCountStart > qx.event.handler.GestureCore.TOUCHPAD_WHEEL_EVENTS_PERIOD) {
                this.__endTouchPadDetection();
              }
            }

            if (this.__touchPadDetectionPerformed) {
              if (this.__rollEvents.length === 0) {
                this.__rollEvents.push(domEvent);
              } // Detection is done. We can now decide the roll factor to apply to the delta.
              // Default to a real mouse wheel event as opposed to a touchpad one.


              this.__performAdaptativeRollScrolling(target);
            }
          } else {
            this.__fireRollEvent(domEvent, target, qx.event.handler.GestureCore.ROLL_FACTOR);
          }
        } else {
          var gesture = this.__gesture[domEvent.pointerId];
          domEvent.delta = {
            x: -gesture.velocityX,
            y: -gesture.velocityY,
            axis: Math.abs(gesture.velocityX / gesture.velocityY) < 1 ? "y" : "x"
          };

          this._fireEvent(domEvent, "roll", domEvent.target || target);
        }
      },

      /**
       * Fires a rotate event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      __fireRotate: function __fireRotate(domEvent, target) {
        if (!domEvent.isPrimary) {
          var angle = this._calcAngle();

          domEvent.angle = Math.round((angle - this.__initialAngle) % 360);

          this._fireEvent(domEvent, "rotate", this.__primaryTarget);
        }
      },

      /**
       * Fires a pinch event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      __firePinch: function __firePinch(domEvent, target) {
        if (!domEvent.isPrimary) {
          var distance = this._calcDistance();

          var scale = distance / this.__initialDistance;
          domEvent.scale = Math.round(scale * 100) / 100;

          this._fireEvent(domEvent, "pinch", this.__primaryTarget);
        }
      },

      /**
       * Fires the long tap event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      __fireLongTap: function __fireLongTap(domEvent, target) {
        var gesture = this.__gesture[domEvent.pointerId];

        if (gesture) {
          this._fireEvent(domEvent, "longtap", domEvent.target || target);

          gesture.longTapTimer = null;
          gesture.isTap = false;
        }
      },

      /**
       * Stops the time for the long tap event.
       * @param gesture {Map} Data may representing the gesture.
       */
      __stopLongTapTimer: function __stopLongTapTimer(gesture) {
        if (gesture.longTapTimer) {
          window.clearTimeout(gesture.longTapTimer);
          gesture.longTapTimer = null;
        }
      },

      /**
       * Dispose the current instance
       */
      dispose: function dispose() {
        for (var gesture in this.__gesture) {
          this.__stopLongTapTimer(gesture);
        }

        this._stopObserver();

        this.__defaultTarget = this.__emitter = null;
      }
    }
  });
  qx.event.handler.GestureCore.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      },
      "qx.event.Registration": {},
      "qx.event.handler.Gesture": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Roll event object.
   */
  qx.Class.define("qx.event.type.Roll", {
    extend: qx.event.type.Pointer,
    members: {
      // overridden
      stop: function stop() {
        this.stopPropagation();
        this.preventDefault();
      },
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Roll.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);

        clone.delta = nativeEvent.delta;
        clone.momentum = nativeEvent.momentum;
        clone.timeoutId = nativeEvent.timeoutId;
        return clone;
      },

      /**
       * Boolean flag to indicate if this event was triggered by a momentum.
       * @return {Boolean} <code>true</code>, if the event is momentum based
       */
      getMomentum: function getMomentum() {
        return this._native.momentum;
      },

      /**
       * Stops the momentum events.
       */
      stopMomentum: function stopMomentum() {
        if (this._native.timeoutId) {
          qx.event.Registration.getManager(this._originalTarget).getHandler(qx.event.handler.Gesture).stopMomentum(this._native.timeoutId);
        }
      },

      /**
       * Returns a map with the calculated delta coordinates and axis,
       * relative to the last <code>roll</code> event.
       *
       * @return {Map} a map with contains the delta as <code>x</code> and
       * <code>y</code>
       */
      getDelta: function getDelta() {
        return this._native.delta;
      }
    }
  });
  qx.event.type.Roll.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Pointer": {
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
      "qx.event.handler.GestureCore": {
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
      "qx.event.type.Tap": {
        "require": true
      },
      "qx.event.type.Swipe": {
        "require": true
      },
      "qx.event.type.Rotate": {
        "require": true
      },
      "qx.event.type.Pinch": {
        "require": true
      },
      "qx.event.type.Track": {
        "require": true
      },
      "qx.event.type.Roll": {
        "require": true
      },
      "qx.lang.Function": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.bom.Event": {},
      "qx.bom.client.Event": {},
      "qx.event.type.Pointer": {},
      "qx.event.type.Data": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
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
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Unified gesture event handler.
   *
   * @require(qx.event.handler.Pointer)
   */
  qx.Class.define("qx.event.handler.Gesture", {
    extend: qx.event.handler.GestureCore,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        tap: 1,
        swipe: 1,
        longtap: 1,
        dbltap: 1,
        rotate: 1,
        pinch: 1,
        track: 1,
        trackstart: 1,
        trackend: 1,
        roll: 1
      },
      GESTURE_EVENTS: ["gesturebegin", "gesturefinish", "gesturemove", "gesturecancel"],

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,
      EVENT_CLASSES: {
        "tap": qx.event.type.Tap,
        "longtap": qx.event.type.Tap,
        "dbltap": qx.event.type.Tap,
        "swipe": qx.event.type.Swipe,
        "rotate": qx.event.type.Rotate,
        "pinch": qx.event.type.Pinch,
        "track": qx.event.type.Track,
        "trackstart": qx.event.type.Track,
        "trackend": qx.event.type.Track,
        "roll": qx.event.type.Roll
      }
    },

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      // Define shorthands
      this.__manager = manager;
      this.__window = manager.getWindow();
      this.__root = this.__window.document;
      qx.event.handler.GestureCore.apply(this, [this.__root]);
    },
    members: {
      __manager: null,
      __window: null,
      __root: null,
      __listener: null,
      __onDblClickWrapped: null,
      __fireRollWrapped: null,

      /**
       * Getter for the internal __window object
       * @return {Window} DOM window instance
       */
      getWindow: function getWindow() {
        return this.__window;
      },
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },
      // overridden
      _initObserver: function _initObserver() {
        this.__listener = qx.lang.Function.listener(this.checkAndFireGesture, this);
        qx.event.handler.Gesture.GESTURE_EVENTS.forEach(function (type) {
          qx.event.Registration.addListener(this.__root, type, this.__listener, this);
        }.bind(this));

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          this.__onDblClickWrapped = qx.lang.Function.listener(this._onDblClick, this);
          qx.bom.Event.addNativeListener(this.__root, "dblclick", this.__onDblClickWrapped);
        } // list to wheel events


        var data = qx.bom.client.Event.getMouseWheel(this.__window);
        this.__fireRollWrapped = qx.lang.Function.listener(this._fireRoll, this); // replaced the useCapture (4th parameter) from this to true
        // see https://github.com/qooxdoo/qooxdoo/pull/9292

        qx.bom.Event.addNativeListener(data.target, data.type, this.__fireRollWrapped, true, false);
      },

      /**
       * Checks if a gesture was made and fires the gesture event.
       *
       * @param pointerEvent {qx.event.type.Pointer} Pointer event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      checkAndFireGesture: function checkAndFireGesture(pointerEvent, type, target) {
        this.__callBase("checkAndFireGesture", [pointerEvent.getNativeEvent(), pointerEvent.getType(), pointerEvent.getTarget()]);
      },
      // overridden
      _stopObserver: function _stopObserver() {
        qx.event.handler.Gesture.GESTURE_EVENTS.forEach(function (type) {
          qx.event.Registration.removeListener(this.__root, type, this.__listener);
        }.bind(this));

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          qx.bom.Event.removeNativeListener(this.__root, "dblclick", this.__onDblClickWrapped);
        }

        var data = qx.bom.client.Event.getMouseWheel(this.__window);
        qx.bom.Event.removeNativeListener(data.target, data.type, this.__fireRollWrapped);
      },
      // overridden
      _hasIntermediaryHandler: function _hasIntermediaryHandler(target) {
        /* This check is irrelevant for qx.Desktop since there is only one
           gesture handler */
        return false;
      },

      /**
       * Fire a touch event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        }

        if (!type) {
          type = domEvent.type;
        }

        var eventTypeClass = qx.event.handler.Gesture.EVENT_CLASSES[type] || qx.event.type.Pointer;

        if (target && target.nodeType) {
          qx.event.Registration.fireEvent(target, type, eventTypeClass, [domEvent, target, null, true, true]);
        } // Fire user action event


        qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type]);
      },

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this._stopObserver();

        this.__callBase("dispose");

        this.__manager = this.__window = this.__root = this.__onDblClickWrapped = null;
      },

      /**
       * Call overridden method.
       *
       * @param method {String} Name of the overridden method.
       * @param args {Array} Arguments.
       */
      __callBase: function __callBase(method, args) {
        qx.event.handler.GestureCore.prototype[method].apply(this, args || []);
      }
    },
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
      qx.event.Registration.getManager(document).getHandler(statics);
    }
  });
  qx.event.handler.Gesture.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.Direct": {
        "require": true
      },
      "qx.event.dispatch.DomBubbling": {
        "require": true
      },
      "qx.event.handler.Keyboard": {
        "require": true
      },
      "qx.event.handler.Mouse": {
        "require": true
      },
      "qx.event.handler.Element": {
        "require": true
      },
      "qx.event.handler.Appear": {
        "require": true
      },
      "qx.event.handler.Touch": {
        "require": true
      },
      "qx.event.handler.Offline": {
        "require": true
      },
      "qx.event.handler.Input": {
        "require": true
      },
      "qx.event.handler.Pointer": {
        "require": true
      },
      "qx.event.handler.Gesture": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.Registration": {},
      "qx.event.handler.Focus": {},
      "qx.event.dispatch.MouseCapture": {},
      "qx.bom.client.Engine": {},
      "qx.xml.Document": {},
      "qx.dom.Hierarchy": {}
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
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This class is mainly a convenience wrapper for DOM elements to
   * qooxdoo's event system.
   *
   * @require(qx.event.dispatch.Direct)
   * @require(qx.event.dispatch.DomBubbling)
   * @require(qx.event.handler.Keyboard)
   * @require(qx.event.handler.Mouse)
   * @require(qx.event.handler.Element)
   * @require(qx.event.handler.Appear)
   * @require(qx.event.handler.Touch)
   * @require(qx.event.handler.Offline)
   * @require(qx.event.handler.Input)
   * @require(qx.event.handler.Pointer)
   * @require(qx.event.handler.Gesture)
   */
  qx.Class.define("qx.bom.Element", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /*
      ---------------------------------------------------------------------------
        EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Add an event listener to a DOM element. The event listener is passed an
       * instance of {@link Event} containing all relevant information
       * about the event as parameter.
       *
       * @param element {Element} DOM element to attach the event on.
       * @param type {String} Name of the event e.g. "click", "keydown", ...
       * @param listener {Function} Event listener function
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener. When not given, the corresponding dispatcher
       *         usually falls back to a default, which is the target
       *         by convention. Note this is not a strict requirement, i.e.
       *         custom dispatchers can follow a different strategy.
       * @param capture {Boolean} Whether to attach the event to the
       *       capturing phase or the bubbling phase of the event. The default is
       *       to attach the event handler to the bubbling phase.
       * @return {String} An opaque id, which can be used to remove the event listener
       *       using the {@link #removeListenerById} method.
       */
      addListener: function addListener(element, type, listener, self, capture) {
        return qx.event.Registration.addListener(element, type, listener, self, capture);
      },

      /**
       * Remove an event listener from a from DOM node.
       *
       * Note: All registered event listeners will automatically be removed from
       *   the DOM at page unload so it is not necessary to detach events yourself.
       *
       * @param element {Element} DOM Element
       * @param type {String} Name of the event
       * @param listener {Function} The pointer to the event listener
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener.
       * @param capture {Boolean} Whether to remove the event listener of
       *       the bubbling or of the capturing phase.
       * @return {Boolean} <code>true</code> if the listener was removed
       */
      removeListener: function removeListener(element, type, listener, self, capture) {
        return qx.event.Registration.removeListener(element, type, listener, self, capture);
      },

      /**
       * Removes an event listener from an event target by an id returned by
       * {@link #addListener}
       *
       * @param target {Object} The event target
       * @param id {String} The id returned by {@link #addListener}
       * @return {Boolean} <code>true</code> if the listener was removed
       */
      removeListenerById: function removeListenerById(target, id) {
        return qx.event.Registration.removeListenerById(target, id);
      },

      /**
       * Check whether there are one or more listeners for an event type
       * registered at the element.
       *
       * @param element {Element} DOM element
       * @param type {String} The event type
       * @param capture {Boolean ? false} Whether to check for listeners of
       *       the bubbling or of the capturing phase.
       * @return {Boolean} Whether the element has event listeners of the given type.
       */
      hasListener: function hasListener(element, type, capture) {
        return qx.event.Registration.hasListener(element, type, capture);
      },

      /**
       * Focuses the given element. The element needs to have a positive <code>tabIndex</code> value.
       *
       * @param element {Element} DOM element to focus
       */
      focus: function focus(element) {
        qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).focus(element);
      },

      /**
       * Blurs the given element
       *
       * @param element {Element} DOM element to blur
       */
      blur: function blur(element) {
        qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).blur(element);
      },

      /**
       * Activates the given element. The active element receives all key board events.
       *
       * @param element {Element} DOM element to focus
       */
      activate: function activate(element) {
        qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).activate(element);
      },

      /**
       * Deactivates the given element. The active element receives all key board events.
       *
       * @param element {Element} DOM element to focus
       */
      deactivate: function deactivate(element) {
        qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).deactivate(element);
      },

      /**
       * Captures the given element
       *
       * @param element {Element} DOM element to capture
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       */
      capture: function capture(element, containerCapture) {
        qx.event.Registration.getManager(element).getDispatcher(qx.event.dispatch.MouseCapture).activateCapture(element, containerCapture);
      },

      /**
       * Releases the given element (from a previous {@link #capture} call)
       *
       * @param element {Element} DOM element to release
       */
      releaseCapture: function releaseCapture(element) {
        qx.event.Registration.getManager(element).getDispatcher(qx.event.dispatch.MouseCapture).releaseCapture(element);
      },

      /*
      ---------------------------------------------------------------------------
        UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Clone given DOM element. May optionally clone all attached
       * events (recursively) as well.
       *
       * @param element {Element} Element to clone
       * @param events {Boolean?false} Whether events should be copied as well
       * @return {Element} The copied element
       */
      clone: function clone(element, events) {
        var clone;

        if (events || qx.core.Environment.get("engine.name") == "mshtml" && !qx.xml.Document.isXmlDocument(element)) {
          var mgr = qx.event.Registration.getManager(element);
          var all = qx.dom.Hierarchy.getDescendants(element);
          all.push(element);
        } // IE copies events bound via attachEvent() when
        // using cloneNode(). Calling detachEvent() on the
        // clone will also remove the events from the original.
        //
        // In order to get around this, we detach all locally
        // attached events first, do the cloning and recover
        // them afterwards again.


        if (qx.core.Environment.get("engine.name") == "mshtml") {
          for (var i = 0, l = all.length; i < l; i++) {
            mgr.toggleAttachedEvents(all[i], false);
          }
        } // Do the native cloning


        var clone = element.cloneNode(true); // Recover events on original elements

        if (qx.core.Environment.get("engine.name") == "mshtml") {
          for (var i = 0, l = all.length; i < l; i++) {
            mgr.toggleAttachedEvents(all[i], true);
          }
        } // Attach events from original element


        if (events === true) {
          // Produce recursive list of elements in the clone
          var cloneAll = qx.dom.Hierarchy.getDescendants(clone);
          cloneAll.push(clone); // Process all elements and copy over listeners

          var eventList, cloneElem, origElem, eventEntry;

          for (var i = 0, il = all.length; i < il; i++) {
            origElem = all[i];
            eventList = mgr.serializeListeners(origElem);

            if (eventList.length > 0) {
              cloneElem = cloneAll[i];

              for (var j = 0, jl = eventList.length; j < jl; j++) {
                eventEntry = eventList[j];
                mgr.addListener(cloneElem, eventEntry.type, eventEntry.handler, eventEntry.self, eventEntry.capture);
              }
            }
          }
        } // Finally return the clone


        return clone;
      }
    }
  });
  qx.bom.Element.$$dbClassInfo = $$dbClassInfo;
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
      "qx.dom.Node": {},
      "qx.bom.client.Html": {},
      "qx.lang.Array": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.element.contains": {
          "className": "qx.bom.client.Html"
        },
        "html.element.compareDocumentPosition": {
          "className": "qx.bom.client.Html"
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Methods to operate on nodes and elements on a DOM tree. This contains
   * special getters to query for child nodes, siblings, etc. This class also
   * supports to operate on one element and reorganize the content with
   * the insertion of new HTML or nodes.
   */
  qx.Bootstrap.define("qx.dom.Hierarchy", {
    statics: {
      /**
       * Returns the DOM index of the given node
       *
       * @param node {Node} Node to look for
       * @return {Integer} The DOM index
       */
      getNodeIndex: function getNodeIndex(node) {
        var index = 0;

        while (node && (node = node.previousSibling)) {
          index++;
        }

        return index;
      },

      /**
       * Returns the DOM index of the given element (ignoring non-elements)
       *
       * @param element {Element} Element to look for
       * @return {Integer} The DOM index
       */
      getElementIndex: function getElementIndex(element) {
        var index = 0;
        var type = qx.dom.Node.ELEMENT;

        while (element && (element = element.previousSibling)) {
          if (element.nodeType == type) {
            index++;
          }
        }

        return index;
      },

      /**
       * Return the next element to the supplied element
       *
       * "nextSibling" is not good enough as it might return a text or comment element
       *
       * @param element {Element} Starting element node
       * @return {Element | null} Next element node
       */
      getNextElementSibling: function getNextElementSibling(element) {
        while (element && (element = element.nextSibling) && !qx.dom.Node.isElement(element)) {
          continue;
        }

        return element || null;
      },

      /**
       * Return the previous element to the supplied element
       *
       * "previousSibling" is not good enough as it might return a text or comment element
       *
       * @param element {Element} Starting element node
       * @return {Element | null} Previous element node
       */
      getPreviousElementSibling: function getPreviousElementSibling(element) {
        while (element && (element = element.previousSibling) && !qx.dom.Node.isElement(element)) {
          continue;
        }

        return element || null;
      },

      /**
       * Whether the first element contains the second one
       *
       * Uses native non-standard contains() in Internet Explorer,
       * Opera and Webkit (supported since Safari 3.0 beta)
       *
       * @param element {Element} Parent element
       * @param target {Node} Child node
       * @return {Boolean}
       */
      contains: function contains(element, target) {
        if (qx.core.Environment.get("html.element.contains")) {
          if (qx.dom.Node.isDocument(element)) {
            var doc = qx.dom.Node.getDocument(target);
            return element && doc == element;
          } else if (qx.dom.Node.isDocument(target)) {
            return false;
          } else {
            return element.contains(target);
          }
        } else if (qx.core.Environment.get("html.element.compareDocumentPosition")) {
          // https://developer.mozilla.org/en-US/docs/DOM:Node.compareDocumentPosition
          return !!(element.compareDocumentPosition(target) & 16);
        } else {
          while (target) {
            if (element == target) {
              return true;
            }

            target = target.parentNode;
          }

          return false;
        }
      },

      /**
       * Whether the element is inserted into the document
       * for which it was created.
       *
       * @param element {Element} DOM element to check
       * @return {Boolean} <code>true</code> when the element is inserted
       *    into the document.
       */
      isRendered: function isRendered(element) {
        var doc = element.ownerDocument || element.document;

        if (qx.core.Environment.get("html.element.contains")) {
          // Fast check for all elements which are not in the DOM
          if (!element.parentNode) {
            return false;
          }

          return doc.body.contains(element);
        } else if (qx.core.Environment.get("html.element.compareDocumentPosition")) {
          // Gecko way, DOM3 method
          return !!(doc.compareDocumentPosition(element) & 16);
        } else {
          while (element) {
            if (element == doc.body) {
              return true;
            }

            element = element.parentNode;
          }

          return false;
        }
      },

      /**
       * Checks if <code>element</code> is a descendant of <code>ancestor</code>.
       *
       * @param element {Element} first element
       * @param ancestor {Element} second element
       * @return {Boolean} Element is a descendant of ancestor
       */
      isDescendantOf: function isDescendantOf(element, ancestor) {
        return this.contains(ancestor, element);
      },

      /**
       * Get the common parent element of two given elements. Returns
       * <code>null</code> when no common element has been found.
       *
       * Uses native non-standard contains() in Opera and Internet Explorer
       *
       * @param element1 {Element} First element
       * @param element2 {Element} Second element
       * @return {Element} the found parent, if none was found <code>null</code>
       */
      getCommonParent: function getCommonParent(element1, element2) {
        if (element1 === element2) {
          return element1;
        }

        if (qx.core.Environment.get("html.element.contains")) {
          while (element1 && qx.dom.Node.isElement(element1)) {
            if (element1.contains(element2)) {
              return element1;
            }

            element1 = element1.parentNode;
          }

          return null;
        } else {
          var known = [];

          while (element1 || element2) {
            if (element1) {
              if (known.includes(element1)) {
                return element1;
              }

              known.push(element1);
              element1 = element1.parentNode;
            }

            if (element2) {
              if (known.includes(element2)) {
                return element2;
              }

              known.push(element2);
              element2 = element2.parentNode;
            }
          }

          return null;
        }
      },

      /**
       * Collects all of element's ancestors and returns them as an array of
       * elements.
       *
       * @param element {Element} DOM element to query for ancestors
       * @return {Array} list of all parents
       */
      getAncestors: function getAncestors(element) {
        return this._recursivelyCollect(element, "parentNode");
      },

      /**
       * Returns element's children.
       *
       * @param element {Element} DOM element to query for child elements
       * @return {Array} list of all child elements
       */
      getChildElements: function getChildElements(element) {
        element = element.firstChild;

        if (!element) {
          return [];
        }

        var arr = this.getNextSiblings(element);

        if (element.nodeType === 1) {
          arr.unshift(element);
        }

        return arr;
      },

      /**
       * Collects all of element's descendants (deep) and returns them as an array
       * of elements.
       *
       * @param element {Element} DOM element to query for child elements
       * @return {Array} list of all found elements
       */
      getDescendants: function getDescendants(element) {
        return qx.lang.Array.fromCollection(element.getElementsByTagName("*"));
      },

      /**
       * Returns the first child that is an element. This is opposed to firstChild DOM
       * property which will return any node (whitespace in most usual cases).
       *
       * @param element {Element} DOM element to query for first descendant
       * @return {Element} the first descendant
       */
      getFirstDescendant: function getFirstDescendant(element) {
        element = element.firstChild;

        while (element && element.nodeType != 1) {
          element = element.nextSibling;
        }

        return element;
      },

      /**
       * Returns the last child that is an element. This is opposed to lastChild DOM
       * property which will return any node (whitespace in most usual cases).
       *
       * @param element {Element} DOM element to query for last descendant
       * @return {Element} the last descendant
       */
      getLastDescendant: function getLastDescendant(element) {
        element = element.lastChild;

        while (element && element.nodeType != 1) {
          element = element.previousSibling;
        }

        return element;
      },

      /**
       * Collects all of element's previous siblings and returns them as an array of elements.
       *
       * @param element {Element} DOM element to query for previous siblings
       * @return {Array} list of found DOM elements
       */
      getPreviousSiblings: function getPreviousSiblings(element) {
        return this._recursivelyCollect(element, "previousSibling");
      },

      /**
       * Collects all of element's next siblings and returns them as an array of
       * elements.
       *
       * @param element {Element} DOM element to query for next siblings
       * @return {Array} list of found DOM elements
       */
      getNextSiblings: function getNextSiblings(element) {
        return this._recursivelyCollect(element, "nextSibling");
      },

      /**
       * Recursively collects elements whose relationship is specified by
       * property.  <code>property</code> has to be a property (a method won't
       * do!) of element that points to a single DOM node. Returns an array of
       * elements.
       *
       * @param element {Element} DOM element to start with
       * @param property {String} property to look for
       * @return {Array} result list
       */
      _recursivelyCollect: function _recursivelyCollect(element, property) {
        var list = [];

        while (element = element[property]) {
          if (element.nodeType == 1) {
            list.push(element);
          }
        }

        return list;
      },

      /**
       * Collects all of element's siblings and returns them as an array of elements.
       *
       * @param element {var} DOM element to start with
       * @return {Array} list of all found siblings
       */
      getSiblings: function getSiblings(element) {
        return this.getPreviousSiblings(element).reverse().concat(this.getNextSiblings(element));
      },

      /**
       * Whether the given element is empty.
       * Inspired by Base2 (Dean Edwards)
       *
       * @param element {Element} The element to check
       * @return {Boolean} true when the element is empty
       */
      isEmpty: function isEmpty(element) {
        element = element.firstChild;

        while (element) {
          if (element.nodeType === qx.dom.Node.ELEMENT || element.nodeType === qx.dom.Node.TEXT) {
            return false;
          }

          element = element.nextSibling;
        }

        return true;
      },

      /**
       * Removes all of element's text nodes which contain only whitespace
       *
       * @param element {Element} Element to cleanup
       */
      cleanWhitespace: function cleanWhitespace(element) {
        var node = element.firstChild;

        while (node) {
          var nextNode = node.nextSibling;

          if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
            element.removeChild(node);
          }

          node = nextNode;
        }
      }
    }
  });
  qx.dom.Hierarchy.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Style": {},
      "qx.bom.client.Engine": {},
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.bom.element.Location": {},
      "qx.event.Registration": {}
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
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Contains methods to control and query the element's scroll properties
   */
  qx.Class.define("qx.bom.element.Scroll", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} The typical native scrollbar size in the environment */
      __scrollbarSize: null,

      /**
       * Get the typical native scrollbar size in the environment
       *
       * @return {Number} The native scrollbar size
       */
      getScrollbarWidth: function getScrollbarWidth() {
        if (this.__scrollbarSize !== null) {
          return this.__scrollbarSize;
        }

        var Style = qx.bom.element.Style;

        var getStyleSize = function getStyleSize(el, propertyName) {
          return parseInt(Style.get(el, propertyName), 10) || 0;
        };

        var getBorderRight = function getBorderRight(el) {
          return Style.get(el, "borderRightStyle") == "none" ? 0 : getStyleSize(el, "borderRightWidth");
        };

        var getBorderLeft = function getBorderLeft(el) {
          return Style.get(el, "borderLeftStyle") == "none" ? 0 : getStyleSize(el, "borderLeftWidth");
        };

        var getInsetRight = qx.core.Environment.select("engine.name", {
          "mshtml": function mshtml(el) {
            if (Style.get(el, "overflowY") == "hidden" || el.clientWidth == 0) {
              return getBorderRight(el);
            }

            return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
          },
          "default": function _default(el) {
            // Alternative method if clientWidth is unavailable
            // clientWidth == 0 could mean both: unavailable or really 0
            if (el.clientWidth == 0) {
              var ov = Style.get(el, "overflow");
              var sbv = ov == "scroll" || ov == "-moz-scrollbars-vertical" ? 16 : 0;
              return Math.max(0, getBorderRight(el) + sbv);
            }

            return Math.max(0, el.offsetWidth - el.clientWidth - getBorderLeft(el));
          }
        });

        var getScrollBarSizeRight = function getScrollBarSizeRight(el) {
          return getInsetRight(el) - getBorderRight(el);
        };

        var t = document.createElement("div");
        var s = t.style;
        s.height = s.width = "100px";
        s.overflow = "scroll";
        document.body.appendChild(t);
        var c = getScrollBarSizeRight(t);
        this.__scrollbarSize = c;
        document.body.removeChild(t);
        return this.__scrollbarSize;
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL INTO VIEW
      ---------------------------------------------------------------------------
      */

      /**
       * The method scrolls the element into view (x-axis only).
       *
       * @param element {Element} DOM element to scroll into view
       * @param stop {Element?null} Any parent element which functions as
       *   outermost element to scroll. Default is the HTML document.
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       */
      intoViewX: function intoViewX(element, stop, align) {
        var parent = element.parentNode;
        var doc = qx.dom.Node.getDocument(element);
        var body = doc.body;
        var parentLocation, parentLeft, parentRight;
        var parentOuterWidth, parentClientWidth, parentScrollWidth;
        var parentLeftBorder, parentRightBorder, parentScrollBarWidth;
        var elementLocation, elementLeft, elementRight, elementWidth;
        var leftOffset, rightOffset, scrollDiff;
        var alignLeft = align === "left";
        var alignRight = align === "right"; // Correcting stop position

        stop = stop ? stop.parentNode : doc; // Go up the parent chain

        while (parent && parent != stop) {
          // "overflow" is always visible for both: document.body and document.documentElement
          if (parent.scrollWidth > parent.clientWidth && (parent === body || qx.bom.element.Style.get(parent, "overflowY") != "visible")) {
            // Calculate parent data
            // Special handling for body element
            if (parent === body) {
              parentLeft = parent.scrollLeft;
              parentRight = parentLeft + qx.bom.Viewport.getWidth();
              parentOuterWidth = qx.bom.Viewport.getWidth();
              parentClientWidth = parent.clientWidth;
              parentScrollWidth = parent.scrollWidth;
              parentLeftBorder = 0;
              parentRightBorder = 0;
              parentScrollBarWidth = 0;
            } else {
              parentLocation = qx.bom.element.Location.get(parent);
              parentLeft = parentLocation.left;
              parentRight = parentLocation.right;
              parentOuterWidth = parent.offsetWidth;
              parentClientWidth = parent.clientWidth;
              parentScrollWidth = parent.scrollWidth;
              parentLeftBorder = parseInt(qx.bom.element.Style.get(parent, "borderLeftWidth"), 10) || 0;
              parentRightBorder = parseInt(qx.bom.element.Style.get(parent, "borderRightWidth"), 10) || 0;
              parentScrollBarWidth = parentOuterWidth - parentClientWidth - parentLeftBorder - parentRightBorder;
            } // Calculate element data


            elementLocation = qx.bom.element.Location.get(element);
            elementLeft = elementLocation.left;
            elementRight = elementLocation.right;
            elementWidth = element.offsetWidth; // Relative position from each other

            leftOffset = elementLeft - parentLeft - parentLeftBorder;
            rightOffset = elementRight - parentRight + parentRightBorder; // Scroll position rearrangement

            scrollDiff = 0; // be sure that element is on left edge

            if (alignLeft) {
              scrollDiff = leftOffset;
            } // be sure that element is on right edge
            else if (alignRight) {
                scrollDiff = rightOffset + parentScrollBarWidth;
              } // element must go down
              // * when current left offset is smaller than 0
              // * when width is bigger than the inner width of the parent
              else if (leftOffset < 0 || elementWidth > parentClientWidth) {
                  scrollDiff = leftOffset;
                } // element must go up
                // * when current right offset is bigger than 0
                else if (rightOffset > 0) {
                    scrollDiff = rightOffset + parentScrollBarWidth;
                  }

            parent.scrollLeft += scrollDiff; // Browsers that follow the CSSOM View Spec fire the "scroll"
            // event asynchronously. See #intoViewY for more details.

            qx.event.Registration.fireNonBubblingEvent(parent, "scroll");
          }

          if (parent === body) {
            break;
          }

          parent = parent.parentNode;
        }
      },

      /**
       * The method scrolls the element into view (y-axis only).
       *
       * @param element {Element} DOM element to scroll into view
       * @param stop {Element?null} Any parent element which functions as
       *   outermost element to scroll. Default is the HTML document.
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       */
      intoViewY: function intoViewY(element, stop, align) {
        var parent = element.parentNode;
        var doc = qx.dom.Node.getDocument(element);
        var body = doc.body;
        var parentLocation, parentTop, parentBottom;
        var parentOuterHeight, parentClientHeight, parentScrollHeight;
        var parentTopBorder, parentBottomBorder, parentScrollBarHeight;
        var elementLocation, elementTop, elementBottom, elementHeight;
        var topOffset, bottomOffset, scrollDiff;
        var alignTop = align === "top";
        var alignBottom = align === "bottom"; // Correcting stop position

        stop = stop ? stop.parentNode : doc; // Go up the parent chain

        while (parent && parent != stop) {
          // "overflow" is always visible for both: document.body and document.documentElement
          if (parent.scrollHeight > parent.clientHeight && (parent === body || qx.bom.element.Style.get(parent, "overflowY") != "visible")) {
            // Calculate parent data
            // Special handling for body element
            if (parent === body) {
              parentTop = parent.scrollTop;
              parentBottom = parentTop + qx.bom.Viewport.getHeight();
              parentOuterHeight = qx.bom.Viewport.getHeight();
              parentClientHeight = parent.clientHeight;
              parentScrollHeight = parent.scrollHeight;
              parentTopBorder = 0;
              parentBottomBorder = 0;
              parentScrollBarHeight = 0;
            } else {
              parentLocation = qx.bom.element.Location.get(parent);
              parentTop = parentLocation.top;
              parentBottom = parentLocation.bottom;
              parentOuterHeight = parent.offsetHeight;
              parentClientHeight = parent.clientHeight;
              parentScrollHeight = parent.scrollHeight;
              parentTopBorder = parseInt(qx.bom.element.Style.get(parent, "borderTopWidth"), 10) || 0;
              parentBottomBorder = parseInt(qx.bom.element.Style.get(parent, "borderBottomWidth"), 10) || 0;
              parentScrollBarHeight = parentOuterHeight - parentClientHeight - parentTopBorder - parentBottomBorder;
            } // Calculate element data


            elementLocation = qx.bom.element.Location.get(element);
            elementTop = elementLocation.top;
            elementBottom = elementLocation.bottom;
            elementHeight = element.offsetHeight; // Relative position from each other

            topOffset = elementTop - parentTop - parentTopBorder;
            bottomOffset = elementBottom - parentBottom + parentBottomBorder; // Scroll position rearrangement

            scrollDiff = 0; // be sure that element is on top edge

            if (alignTop) {
              scrollDiff = topOffset;
            } // be sure that element is on bottom edge
            else if (alignBottom) {
                scrollDiff = bottomOffset + parentScrollBarHeight;
              } // element must go down
              // * when current top offset is smaller than 0
              // * when height is bigger than the inner height of the parent
              else if (topOffset < 0 || elementHeight > parentClientHeight) {
                  scrollDiff = topOffset;
                } // element must go up
                // * when current bottom offset is bigger than 0
                else if (bottomOffset > 0) {
                    scrollDiff = bottomOffset + parentScrollBarHeight;
                  }

            parent.scrollTop += scrollDiff; // Browsers that follow the CSSOM View Spec fire the "scroll"
            // event asynchronously.
            //
            // The widget layer expects the "scroll" event to be fired before
            // the "appear" event. Fire non-bubbling "scroll" in all browsers,
            // since a duplicate "scroll" should not cause any issues and it
            // is hard to track which version of the browser engine started to
            // follow the CSSOM Spec. Fixes [BUG #4570].

            qx.event.Registration.fireNonBubblingEvent(parent, "scroll");
          }

          if (parent === body) {
            break;
          }

          parent = parent.parentNode;
        }
      },

      /**
       * The method scrolls the element into view.
       *
       * @param element {Element} DOM element to scroll into view
       * @param stop {Element?null} Any parent element which functions as
       *   outermost element to scroll. Default is the HTML document.
       * @param alignX {String} Alignment of the element. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be undefined.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param alignY {String} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be undefined.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       */
      intoView: function intoView(element, stop, alignX, alignY) {
        this.intoViewX(element, stop, alignX);
        this.intoViewY(element, stop, alignY);
      }
    }
  });
  qx.bom.element.Scroll.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Html": {
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Range": {},
      "qx.util.StringSplit": {},
      "qx.bom.client.Engine": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.selection": {
          "load": true,
          "className": "qx.bom.client.Html"
        },
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
  
     Authors:
       * Alexander Steitz (aback)
  
  ************************************************************************ */

  /**
   * Low-level selection API to select elements like input and textarea elements
   * as well as text nodes or elements which their child nodes.
   *
   * @ignore(qx.bom.Element, qx.bom.Element.blur)
   */
  qx.Bootstrap.define("qx.bom.Selection", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the native selection object.
       *
       * @signature function(documentNode)
       * @param documentNode {document} Document node to retrieve the connected selection from
       * @return {Selection} native selection object
       */
      getSelectionObject: qx.core.Environment.select("html.selection", {
        "selection": function selection(documentNode) {
          return documentNode.selection;
        },
        // suitable for gecko, opera, webkit and mshtml >= 9
        "default": function _default(documentNode) {
          return qx.dom.Node.getWindow(documentNode).getSelection();
        }
      }),

      /**
       * Returns the current selected text.
       *
       * @signature function(node)
       * @param node {Node} node to retrieve the selection for
       * @return {String|null} selected text as string
       */
      get: qx.core.Environment.select("html.selection", {
        "selection": function selection(node) {
          // to get the selected text in legacy IE you have to work with the TextRange
          // of the selection object. So always pass the document node to the
          // Range class to get this TextRange object.
          var rng = qx.bom.Range.get(qx.dom.Node.getDocument(node));
          return rng.text;
        },
        // suitable for gecko, opera and webkit
        "default": function _default(node) {
          if (this.__isInputOrTextarea(node)) {
            return node.value.substring(node.selectionStart, node.selectionEnd);
          } else {
            return this.getSelectionObject(qx.dom.Node.getDocument(node)).toString();
          }
        }
      }),

      /**
       * Returns the length of the selection
       *
       * @signature function(node)
       * @param node {Node} Form node or document/window to check.
       * @return {Integer|null} length of the selection or null
       */
      getLength: qx.core.Environment.select("html.selection", {
        "selection": function selection(node) {
          var selectedValue = this.get(node); // get the selected part and split it by linebreaks

          var split = qx.util.StringSplit.split(selectedValue, /\r\n/); // return the length substracted by the count of linebreaks
          // legacy IE counts linebreaks as two chars
          // -> harmonize this to one char per linebreak

          return selectedValue.length - (split.length - 1);
        },
        "default": function _default(node) {
          if (qx.core.Environment.get("engine.name") == "opera") {
            var selectedValue, selectedLength, split;

            if (this.__isInputOrTextarea(node)) {
              var start = node.selectionStart;
              var end = node.selectionEnd;
              selectedValue = node.value.substring(start, end);
              selectedLength = end - start;
            } else {
              selectedValue = qx.bom.Selection.get(node);
              selectedLength = selectedValue.length;
            } // get the selected part and split it by linebreaks


            split = qx.util.StringSplit.split(selectedValue, /\r\n/); // substract the count of linebreaks
            // Opera counts each linebreak as two chars
            // -> harmonize this to one char per linebreak

            return selectedLength - (split.length - 1);
          } // suitable for gecko and webkit


          if (this.__isInputOrTextarea(node)) {
            return node.selectionEnd - node.selectionStart;
          } else {
            return this.get(node).length;
          }
        }
      }),

      /**
       * Returns the start of the selection
       *
       * @signature function(node)
       * @param node {Node} node to check for
       * @return {Integer} start of current selection or "-1" if the current
       *                   selection is not within the given node
       */
      getStart: qx.core.Environment.select("html.selection", {
        "selection": function selection(node) {
          if (this.__isInputOrTextarea(node)) {
            var documentRange = qx.bom.Range.get(); // Check if the document.selection is the text range inside the input element

            if (!node.contains(documentRange.parentElement())) {
              return -1;
            }

            var range = qx.bom.Range.get(node);
            var len = node.value.length; // Synchronize range start and end points

            range.moveToBookmark(documentRange.getBookmark());
            range.moveEnd('character', len);
            return len - range.text.length;
          } else {
            var range = qx.bom.Range.get(node);
            var parentElement = range.parentElement(); // get a range which holds the text of the parent element

            var elementRange = qx.bom.Range.get();

            try {
              // IE throws an invalid argument error when the document has no selection
              elementRange.moveToElementText(parentElement);
            } catch (ex) {
              return 0;
            } // Move end points of full range so it starts at the user selection
            // and ends at the end of the element text.


            var bodyRange = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));
            bodyRange.setEndPoint("StartToStart", range);
            bodyRange.setEndPoint("EndToEnd", elementRange); // selection is at beginning

            if (elementRange.compareEndPoints("StartToStart", bodyRange) == 0) {
              return 0;
            }

            var moved;
            var steps = 0;

            while (true) {
              moved = bodyRange.moveStart("character", -1); // Starting points of both ranges are equal

              if (elementRange.compareEndPoints("StartToStart", bodyRange) == 0) {
                break;
              } // Moving had no effect -> range is at begin of body


              if (moved == 0) {
                break;
              } else {
                steps++;
              }
            }

            return ++steps;
          }
        },
        "default": function _default(node) {
          if (qx.core.Environment.get("engine.name") === "gecko" || qx.core.Environment.get("engine.name") === "webkit") {
            if (this.__isInputOrTextarea(node)) {
              return node.selectionStart;
            } else {
              var documentElement = qx.dom.Node.getDocument(node);
              var documentSelection = this.getSelectionObject(documentElement); // gecko and webkit do differ how the user selected the text
              // "left-to-right" or "right-to-left"

              if (documentSelection.anchorOffset < documentSelection.focusOffset) {
                return documentSelection.anchorOffset;
              } else {
                return documentSelection.focusOffset;
              }
            }
          }

          if (this.__isInputOrTextarea(node)) {
            return node.selectionStart;
          } else {
            return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).anchorOffset;
          }
        }
      }),

      /**
       * Returns the end of the selection
       *
       * @signature function(node)
       * @param node {Node} node to check
       * @return {Integer} end of current selection
       */
      getEnd: qx.core.Environment.select("html.selection", {
        "selection": function selection(node) {
          if (this.__isInputOrTextarea(node)) {
            var documentRange = qx.bom.Range.get(); // Check if the document.selection is the text range inside the input element

            if (!node.contains(documentRange.parentElement())) {
              return -1;
            }

            var range = qx.bom.Range.get(node);
            var len = node.value.length; // Synchronize range start and end points

            range.moveToBookmark(documentRange.getBookmark());
            range.moveStart('character', -len);
            return range.text.length;
          } else {
            var range = qx.bom.Range.get(node);
            var parentElement = range.parentElement(); // get a range which holds the text of the parent element

            var elementRange = qx.bom.Range.get();

            try {
              // IE throws an invalid argument error when the document has no selection
              elementRange.moveToElementText(parentElement);
            } catch (ex) {
              return 0;
            }

            var len = elementRange.text.length; // Move end points of full range so it ends at the user selection
            // and starts at the start of the element text.

            var bodyRange = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));
            bodyRange.setEndPoint("EndToEnd", range);
            bodyRange.setEndPoint("StartToStart", elementRange); // selection is at beginning

            if (elementRange.compareEndPoints("EndToEnd", bodyRange) == 0) {
              return len - 1;
            }

            var moved;
            var steps = 0;

            while (true) {
              moved = bodyRange.moveEnd("character", 1); // Ending points of both ranges are equal

              if (elementRange.compareEndPoints("EndToEnd", bodyRange) == 0) {
                break;
              } // Moving had no effect -> range is at begin of body


              if (moved == 0) {
                break;
              } else {
                steps++;
              }
            }

            return len - ++steps;
          }
        },
        "default": function _default(node) {
          if (qx.core.Environment.get("engine.name") === "gecko" || qx.core.Environment.get("engine.name") === "webkit") {
            if (this.__isInputOrTextarea(node)) {
              return node.selectionEnd;
            } else {
              var documentElement = qx.dom.Node.getDocument(node);
              var documentSelection = this.getSelectionObject(documentElement); // gecko and webkit do differ how the user selected the text
              // "left-to-right" or "right-to-left"

              if (documentSelection.focusOffset > documentSelection.anchorOffset) {
                return documentSelection.focusOffset;
              } else {
                return documentSelection.anchorOffset;
              }
            }
          }

          if (this.__isInputOrTextarea(node)) {
            return node.selectionEnd;
          } else {
            return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).focusOffset;
          }
        }
      }),

      /**
       * Utility method to check for an input or textarea element
       *
       * @param node {Node} node to check
       * @return {Boolean} Whether the given node is an input or textarea element
       */
      __isInputOrTextarea: function __isInputOrTextarea(node) {
        return qx.dom.Node.isElement(node) && (node.nodeName.toLowerCase() == "input" || node.nodeName.toLowerCase() == "textarea");
      },

      /**
       * Sets a selection at the given node with the given start and end.
       * For text nodes, input and textarea elements the start and end parameters
       * set the boundaries at the text.
       * For element nodes the start and end parameters are used to select the
       * childNodes of the given element.
       *
       * @signature function(node, start, end)
       * @param node {Node} node to set the selection at
       * @param start {Integer} start of the selection
       * @param end {Integer} end of the selection
       * @return {Boolean} whether a selection is drawn
       */
      set: qx.core.Environment.select("html.selection", {
        "selection": function selection(node, start, end) {
          var rng; // if the node is the document itself then work on with the body element

          if (qx.dom.Node.isDocument(node)) {
            node = node.body;
          }

          if (qx.dom.Node.isElement(node) || qx.dom.Node.isText(node)) {
            switch (node.nodeName.toLowerCase()) {
              case "input":
              case "textarea":
              case "button":
                if (end === undefined) {
                  end = node.value.length;
                }

                if (start >= 0 && start <= node.value.length && end >= 0 && end <= node.value.length) {
                  rng = qx.bom.Range.get(node);
                  rng.collapse(true);
                  rng.moveStart("character", start);
                  rng.moveEnd("character", end - start);
                  rng.select();
                  return true;
                }

                break;

              case "#text":
                if (end === undefined) {
                  end = node.nodeValue.length;
                }

                if (start >= 0 && start <= node.nodeValue.length && end >= 0 && end <= node.nodeValue.length) {
                  // get a range of the body element
                  rng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node)); // use the parent node -> "moveToElementText" expects an element

                  rng.moveToElementText(node.parentNode);
                  rng.collapse(true);
                  rng.moveStart("character", start);
                  rng.moveEnd("character", end - start);
                  rng.select();
                  return true;
                }

                break;

              default:
                if (end === undefined) {
                  end = node.childNodes.length - 1;
                } // check start and end -> childNodes


                if (node.childNodes[start] && node.childNodes[end]) {
                  // get the TextRange of the body element
                  // IMPORTANT: only with a range of the body the method "moveElementToText" is available
                  rng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node)); // position it at the given node

                  rng.moveToElementText(node.childNodes[start]);
                  rng.collapse(true); // create helper range

                  var newRng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));
                  newRng.moveToElementText(node.childNodes[end]); // set the end of the range to the end of the helper range

                  rng.setEndPoint("EndToEnd", newRng);
                  rng.select();
                  return true;
                }

            }
          }

          return false;
        },
        // suitable for gecko, opera, webkit and mshtml >=9
        "default": function _default(node, start, end) {
          // special handling for input and textarea elements
          var nodeName = node.nodeName.toLowerCase();

          if (qx.dom.Node.isElement(node) && (nodeName == "input" || nodeName == "textarea")) {
            // if "end" is not given set it to the end
            if (end === undefined) {
              end = node.value.length;
            } // check boundaries


            if (start >= 0 && start <= node.value.length && end >= 0 && end <= node.value.length) {
              node.focus();
              node.select();
              node.setSelectionRange(start, end);
              return true;
            }
          } else {
            var validBoundaries = false;
            var sel = qx.dom.Node.getWindow(node).getSelection();
            var rng = qx.bom.Range.get(node); // element or text node?
            // for elements nodes the offsets are applied to childNodes
            // for text nodes the offsets are applied to the text content

            if (qx.dom.Node.isText(node)) {
              if (end === undefined) {
                end = node.length;
              }

              if (start >= 0 && start < node.length && end >= 0 && end <= node.length) {
                validBoundaries = true;
              }
            } else if (qx.dom.Node.isElement(node)) {
              if (end === undefined) {
                end = node.childNodes.length - 1;
              }

              if (start >= 0 && node.childNodes[start] && end >= 0 && node.childNodes[end]) {
                validBoundaries = true;
              }
            } else if (qx.dom.Node.isDocument(node)) {
              // work on with the body element
              node = node.body;

              if (end === undefined) {
                end = node.childNodes.length - 1;
              }

              if (start >= 0 && node.childNodes[start] && end >= 0 && node.childNodes[end]) {
                validBoundaries = true;
              }
            }

            if (validBoundaries) {
              // collapse the selection if needed
              if (!sel.isCollapsed) {
                sel.collapseToStart();
              } // set start and end of the range


              rng.setStart(node, start); // for element nodes set the end after the childNode

              if (qx.dom.Node.isText(node)) {
                rng.setEnd(node, end);
              } else {
                rng.setEndAfter(node.childNodes[end]);
              } // remove all existing ranges and add the new one


              if (sel.rangeCount > 0) {
                sel.removeAllRanges();
              }

              sel.addRange(rng);
              return true;
            }
          }

          return false;
        }
      }),

      /**
       * Selects all content/childNodes of the given node
       *
       * @param node {Node} text, element or document node
       * @return {Boolean} whether a selection is drawn
       */
      setAll: function setAll(node) {
        return qx.bom.Selection.set(node, 0);
      },

      /**
       * Clears the selection on the given node.
       *
       * @param node {Node} node to clear the selection for
       */
      clear: qx.core.Environment.select("html.selection", {
        "selection": function selection(node) {
          var rng = qx.bom.Range.get(node);
          var parent = rng.parentElement();
          var documentRange = qx.bom.Range.get(qx.dom.Node.getDocument(node)); // only collapse if the selection is really on the given node
          // -> compare the two parent elements of the ranges with each other and
          // the given node

          if (qx.dom.Node.isText(node)) {
            node = node.parentNode;
          }

          if (parent == documentRange.parentElement() && parent == node) {
            var sel = qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node));
            sel.empty();
          }
        },
        "default": function _default(node) {
          var sel = qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node));
          var nodeName = node.nodeName.toLowerCase(); // if the node is an input or textarea element use the specialized methods

          if (qx.dom.Node.isElement(node) && (nodeName == "input" || nodeName == "textarea")) {
            node.setSelectionRange(0, 0);

            if (qx.bom.Element && qx.bom.Element.blur) {
              qx.bom.Element.blur(node);
            }
          } // if the given node is the body/document node -> collapse the selection
          else if (qx.dom.Node.isDocument(node) || nodeName == "body") {
              sel.collapse(node.body ? node.body : node, 0);
            } // if an element/text node is given the current selection has to
            // encompass the node. Only then the selection is cleared.
            else {
                var rng = qx.bom.Range.get(node);

                if (!rng.collapsed) {
                  var compareNode;
                  var commonAncestor = rng.commonAncestorContainer; // compare the parentNode of the textNode with the given node
                  // (if this node is an element) to decide whether the selection
                  // is cleared or not.

                  if (qx.dom.Node.isElement(node) && qx.dom.Node.isText(commonAncestor)) {
                    compareNode = commonAncestor.parentNode;
                  } else {
                    compareNode = commonAncestor;
                  }

                  if (compareNode == node) {
                    sel.collapse(node, 0);
                  }
                }
              }
        }
      })
    }
  });
  qx.bom.Selection.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.DomBubbling": {
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "usage": "dynamic",
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
      "qx.bom.client.OperatingSystem": {
        "construct": true
      },
      "qx.application.Inline": {
        "construct": true
      },
      "qx.core.Init": {
        "construct": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.Selection": {},
      "qx.event.type.Focus": {},
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.bom.element.Attribute": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "os.version": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.name": {
          "load": true,
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
   * This handler is used to normalize all focus/activation requirements
   * and normalize all cross browser quirks in this area.
   *
   * Notes:
   *
   * * Webkit and Opera (before 9.5) do not support tabIndex for all elements
   * (See also: https://bugs.webkit.org/show_bug.cgi?id=7138)
   *
   * * TabIndex is normally 0, which means all naturally focusable elements are focusable.
   * * TabIndex > 0 means that the element is focusable and tabable
   * * TabIndex < 0 means that the element, even if naturally possible, is not focusable.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @use(qx.event.dispatch.DomBubbling)
   */
  qx.Class.define("qx.event.handler.Focus", {
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
     *
     * @ignore(qx.application.Inline)
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this._manager = manager;
      this._window = manager.getWindow();
      this._document = this._window.document;
      this._root = this._document.documentElement;
      this._body = this._document.body;

      if (qx.core.Environment.get("os.name") == "ios" && parseFloat(qx.core.Environment.get("os.version")) > 6 && (!qx.application.Inline || !qx.core.Init.getApplication() instanceof qx.application.Inline)) {
        this.__needsScrollFix = true;
      } // Initialize


      this._initObserver();
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The active DOM element */
      active: {
        apply: "_applyActive",
        nullable: true
      },

      /** The focussed DOM element */
      focus: {
        apply: "_applyFocus",
        nullable: true
      }
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
        focus: 1,
        blur: 1,
        focusin: 1,
        focusout: 1,
        activate: 1,
        deactivate: 1
      },

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /**
       * @type {Map} See: http://msdn.microsoft.com/en-us/library/ms534654(VS.85).aspx
       */
      FOCUSABLE_ELEMENTS: qx.core.Environment.select("engine.name", {
        "mshtml": {
          a: 1,
          body: 1,
          button: 1,
          frame: 1,
          iframe: 1,
          img: 1,
          input: 1,
          object: 1,
          select: 1,
          textarea: 1
        },
        "gecko": {
          a: 1,
          body: 1,
          button: 1,
          frame: 1,
          iframe: 1,
          img: 1,
          input: 1,
          object: 1,
          select: 1,
          textarea: 1
        },
        "opera": {
          button: 1,
          input: 1,
          select: 1,
          textarea: 1
        },
        "webkit": {
          button: 1,
          input: 1,
          select: 1,
          textarea: 1
        }
      })
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __onNativeMouseDownWrapper: null,
      __onNativeMouseUpWrapper: null,
      __onNativeFocusWrapper: null,
      __onNativeBlurWrapper: null,
      __onNativeDragGestureWrapper: null,
      __onNativeSelectStartWrapper: null,
      __onNativeFocusInWrapper: null,
      __onNativeFocusOutWrapper: null,
      __previousFocus: null,
      __previousActive: null,
      __down: "",
      __up: "",
      __needsScrollFix: false,
      __relatedTarget: null,

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
        FOCUS/BLUR USER INTERFACE
      ---------------------------------------------------------------------------
      */

      /**
       * Focuses the given DOM element
       *
       * @param element {Element} DOM element to focus
       */
      focus: function focus(element) {
        // Fixed timing issue with IE, see [BUG #3267]
        if (qx.core.Environment.get("engine.name") == "mshtml") {
          window.setTimeout(function () {
            try {
              // focus element before set cursor position
              element.focus(); // Fixed cursor position issue with IE, only when nothing is selected.
              // See [BUG #3519] for details.

              var selection = qx.bom.Selection.get(element);

              if (selection.length == 0 && typeof element.createTextRange == "function") {
                var textRange = element.createTextRange();
                textRange.moveStart('character', element.value.length);
                textRange.collapse();
                textRange.select();
              }
            } catch (ex) {}
          }, 0);
        } else {
          // Fix re-focusing on mousup event
          // See https://github.com/qooxdoo/qooxdoo/issues/9393 and
          // discussion in https://github.com/qooxdoo/qooxdoo/pull/9394
          window.setTimeout(function () {
            try {
              element.focus();
            } catch (ex) {}
          }, 0);
        }

        this.setFocus(element);
        this.setActive(element);
      },

      /**
       * Activates the given DOM element
       *
       * @param element {Element} DOM element to activate
       */
      activate: function activate(element) {
        this.setActive(element);
      },

      /**
       * Blurs the given DOM element
       *
       * @param element {Element} DOM element to focus
       */
      blur: function blur(element) {
        try {
          element.blur();
        } catch (ex) {}

        if (this.getActive() === element) {
          this.resetActive();
        }

        if (this.getFocus() === element) {
          this.resetFocus();
        }
      },

      /**
       * Deactivates the given DOM element
       *
       * @param element {Element} DOM element to activate
       */
      deactivate: function deactivate(element) {
        if (this.getActive() === element) {
          this.resetActive();
        }
      },

      /**
       * Tries to activate the given element. This checks whether
       * the activation is allowed first.
       *
       * @param element {Element} DOM element to activate
       */
      tryActivate: function tryActivate(element) {
        var active = this.__findActivatableElement(element);

        if (active) {
          this.setActive(active);
        }
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Shorthand to fire events from within this class.
       *
       * @param target {Element} DOM element which is the target
       * @param related {Element} DOM element which is the related target
       * @param type {String} Name of the event to fire
       * @param bubbles {Boolean} Whether the event should bubble
       * @return {qx.Promise?} a promise, if one or more of the event handlers returned a promise
       */
      __fireEvent: function __fireEvent(target, related, type, bubbles) {
        var Registration = qx.event.Registration;
        var evt = Registration.createEvent(type, qx.event.type.Focus, [target, related, bubbles]);
        return Registration.dispatchEvent(target, evt);
      },

      /*
      ---------------------------------------------------------------------------
        WINDOW FOCUS/BLUR SUPPORT
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} Whether the window is focused currently */
      _windowFocused: true,

      /**
       * Helper for native event listeners to react on window blur
       */
      __doWindowBlur: function __doWindowBlur() {
        // Omit doubled blur events
        // which is a common behavior at least for gecko based clients
        if (this._windowFocused) {
          this._windowFocused = false;

          this.__fireEvent(this._window, null, "blur", false);
        }
      },

      /**
       * Helper for native event listeners to react on window focus
       */
      __doWindowFocus: function __doWindowFocus() {
        // Omit doubled focus events
        // which is a common behavior at least for gecko based clients
        if (!this._windowFocused) {
          this._windowFocused = true;

          this.__fireEvent(this._window, null, "focus", false);
        }
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE OBSERVER
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes event listeners.
       *
       * @signature function()
       */
      _initObserver: qx.core.Environment.select("engine.name", {
        "gecko": function gecko() {
          // Bind methods
          this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
          this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
          this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
          this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);
          this.__onNativeDragGestureWrapper = qx.lang.Function.listener(this.__onNativeDragGesture, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true); // Capturing is needed for gecko to correctly
          // handle focus of input and textarea fields

          qx.bom.Event.addNativeListener(this._window, "focus", this.__onNativeFocusWrapper, true);
          qx.bom.Event.addNativeListener(this._window, "blur", this.__onNativeBlurWrapper, true); // Capture drag events

          qx.bom.Event.addNativeListener(this._window, "draggesture", this.__onNativeDragGestureWrapper, true);
        },
        "mshtml": function mshtml() {
          // Bind methods
          this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
          this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
          this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
          this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);
          this.__onNativeSelectStartWrapper = qx.lang.Function.listener(this.__onNativeSelectStart, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper); // MSHTML supports their own focusin and focusout events
          // To detect which elements get focus the target is useful
          // The window blur can detected using focusout and look
          // for the toTarget property which is empty in this case.

          qx.bom.Event.addNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper);
          qx.bom.Event.addNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper); // Add selectstart to prevent selection

          qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper);
        },
        "webkit": qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          "edge": function edge(domEvent) {
            // Bind methods
            this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
            this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
            this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);
            this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
            this.__onNativeSelectStartWrapper = qx.lang.Function.listener(this.__onNativeSelectStart, this); // Register events

            qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
            qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
            qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper, false);
            qx.bom.Event.addNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper);
            qx.bom.Event.addNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper);
          },
          "default": function _default(domEvent) {
            // Bind methods
            this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
            this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
            this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);
            this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
            this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);
            this.__onNativeSelectStartWrapper = qx.lang.Function.listener(this.__onNativeSelectStart, this); // Register events

            qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
            qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
            qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper, false);
            qx.bom.Event.addNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper, true);
            qx.bom.Event.addNativeListener(this._window, "focus", this.__onNativeFocusWrapper, true);
            qx.bom.Event.addNativeListener(this._window, "blur", this.__onNativeBlurWrapper, true);
          }
        }),
        "opera": function opera() {
          // Bind methods
          this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
          this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
          this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
          this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
          qx.bom.Event.addNativeListener(this._window, "DOMFocusIn", this.__onNativeFocusInWrapper, true);
          qx.bom.Event.addNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper, true);
        }
      }),

      /**
       * Disconnects event listeners.
       *
       * @signature function()
       */
      _stopObserver: qx.core.Environment.select("engine.name", {
        "gecko": function gecko() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "focus", this.__onNativeFocusWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "blur", this.__onNativeBlurWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "draggesture", this.__onNativeDragGestureWrapper, true);
        },
        "mshtml": function mshtml() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper);
          qx.bom.Event.removeNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper);
          qx.bom.Event.removeNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper);
          qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper);
        },
        "webkit": qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          "edge": function edge() {
            qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper);
            qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper);
            qx.bom.Event.removeNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper);
            qx.bom.Event.removeNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper);
            qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper);
          },
          "default": function _default() {
            qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
            qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
            qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper, false);
            qx.bom.Event.removeNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper, true);
            qx.bom.Event.removeNativeListener(this._window, "focus", this.__onNativeFocusWrapper, true);
            qx.bom.Event.removeNativeListener(this._window, "blur", this.__onNativeBlurWrapper, true);
          }
        }),
        "opera": function opera() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "DOMFocusIn", this.__onNativeFocusInWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper, true);
        }
      }),

      /*
      ---------------------------------------------------------------------------
        NATIVE LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Native event listener for <code>draggesture</code> event
       * supported by gecko. Used to stop native drag and drop when
       * selection is disabled.
       *
       * @see https://developer.mozilla.org/en-US/docs/Drag_and_Drop
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeDragGesture: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "gecko": function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>DOMFocusIn</code> or <code>focusin</code>
       * depending on the client's engine.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocusIn: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          // Force window focus to be the first
          this.__doWindowFocus(); // Update internal data


          var target = qx.bom.Event.getTarget(domEvent); // IE focusin is also fired on elements which are not focusable at all
          // We need to look up for the next focusable element.

          var focusTarget = this.__findFocusableElement(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } // Make target active


          this.tryActivate(target);
        },
        "webkit": qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          "edge": function edge(domEvent) {
            // Force window focus to be the first
            this.__doWindowFocus(); // Update internal data


            var target = qx.bom.Event.getTarget(domEvent); // IE focusin is also fired on elements which are not focusable at all
            // We need to look up for the next focusable element.

            var focusTarget = this.__findFocusableElement(target);

            if (focusTarget) {
              this.setFocus(focusTarget);
            } // Make target active


            this.tryActivate(target);
          },
          "default": null
        }),
        "opera": function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target == this._document || target == this._window) {
            this.__doWindowFocus();

            if (this.__previousFocus) {
              this.setFocus(this.__previousFocus);
              delete this.__previousFocus;
            }

            if (this.__previousActive) {
              this.setActive(this.__previousActive);
              delete this.__previousActive;
            }
          } else {
            this.setFocus(target);
            this.tryActivate(target); // Clear selection

            if (!this.__isSelectable(target)) {
              target.selectionStart = 0;
              target.selectionEnd = 0;
            }
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>DOMFocusOut</code> or <code>focusout</code>
       * depending on the client's engine.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocusOut: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          var relatedTarget = qx.bom.Event.getRelatedTarget(domEvent); // If the focus goes to nowhere (the document is blurred)

          if (relatedTarget == null) {
            // Update internal representation
            this.__doWindowBlur(); // Reset active and focus


            this.resetFocus();
            this.resetActive();
          }
        },
        "webkit": qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          "edge": function edge(domEvent) {
            var relatedTarget = qx.bom.Event.getRelatedTarget(domEvent); // If the focus goes to nowhere (the document is blurred)

            if (relatedTarget == null) {
              // Update internal representation
              this.__doWindowBlur(); // Reset active and focus


              this.resetFocus();
              this.resetActive();
            }
          },
          "default": function _default(domEvent) {
            var target = qx.bom.Event.getTarget(domEvent);

            if (target === this.getFocus()) {
              this.resetFocus();
            }

            if (target === this.getActive()) {
              this.resetActive();
            }
          }
        }),
        "opera": function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target == this._document) {
            this.__doWindowBlur(); // Store old focus/active elements
            // Opera do not fire focus events for them
            // when refocussing the window (in my opinion an error)


            this.__previousFocus = this.getFocus();
            this.__previousActive = this.getActive();
            this.resetFocus();
            this.resetActive();
          } else {
            if (target === this.getFocus()) {
              this.resetFocus();
            }

            if (target === this.getActive()) {
              this.resetActive();
            }
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>blur</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeBlur: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "gecko": function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowBlur();

            this.resetActive();
            this.resetFocus();
          }
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowBlur(); // Store old focus/active elements
            // Opera do not fire focus events for them
            // when refocussing the window (in my opinion an error)


            this.__previousFocus = this.getFocus();
            this.__previousActive = this.getActive();
            this.resetActive();
            this.resetFocus();
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>focus</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocus: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "gecko": function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowFocus(); // Always speak of the body, not the window or document


            target = this._body;
          }

          this.setFocus(target);
          this.tryActivate(target);
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowFocus();

            if (this.__previousFocus) {
              this.setFocus(this.__previousFocus);
              delete this.__previousFocus;
            }

            if (this.__previousActive) {
              this.setActive(this.__previousActive);
              delete this.__previousActive;
            }
          } else {
            this.__relatedTarget = domEvent.relatedTarget;
            this.setFocus(target);
            this.__relatedTarget = null;
            this.tryActivate(target);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>mousedown</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeMouseDown: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent); // Stop events when no focus element available (or blocked)

          var focusTarget = this.__findFocusableElement(target);

          if (focusTarget) {
            // Add unselectable to keep selection
            if (!this.__isSelectable(target)) {
              // The element is not selectable. Block selection.
              target.unselectable = "on"; // Unselectable may keep the current selection which
              // is not what we like when changing the focus element.
              // So we clear it

              try {
                if (document.selection) {
                  document.selection.empty();
                }
              } catch (ex) {} // ignore 'Unknown runtime error'
              // The unselectable attribute stops focussing as well.
              // Do this manually.


              try {
                focusTarget.focus();
              } catch (ex) {// ignore "Can't move focus of this control" error
              }
            }
          } else {
            // Stop event for blocking support
            qx.bom.Event.preventDefault(domEvent); // Add unselectable to keep selection

            if (!this.__isSelectable(target)) {
              target.unselectable = "on";
            }
          }
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } else {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "gecko": function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } else {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "opera": function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement(target);

          if (!this.__isSelectable(target)) {
            // Prevent the default action for all non-selectable
            // targets. This prevents text selection and context menu.
            qx.bom.Event.preventDefault(domEvent); // The stopped event keeps the selection
            // of the previously focused element.
            // We need to clear the old selection.

            if (focusTarget) {
              var current = this.getFocus();

              if (current && current.selectionEnd) {
                current.selectionStart = 0;
                current.selectionEnd = 0;
                current.blur();
              } // The prevented event also stop the focus, do
              // it manually if needed.


              if (focusTarget) {
                this.setFocus(focusTarget);
              }
            }
          } else if (focusTarget) {
            this.setFocus(focusTarget);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>mouseup</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeMouseUp: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target.unselectable) {
            target.unselectable = "off";
          }

          this.tryActivate(this.__fixFocus(target));
        },
        "gecko": function gecko(domEvent) {
          // As of Firefox 3.0:
          // Gecko fires mouseup on XUL elements
          // We only want to deal with real HTML elements
          var target = qx.bom.Event.getTarget(domEvent);

          while (target && target.offsetWidth === undefined) {
            target = target.parentNode;
          }

          if (target) {
            this.tryActivate(target);
          }
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);
          this.tryActivate(this.__fixFocus(target));
        },
        "opera": function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);
          this.tryActivate(this.__fixFocus(target));
        },
        "default": null
      })),

      /**
       * Fix for bug #9331.
       *
       * @signature function(target)
       * @param target {Element} element to check
       * @return {Element} return correct target (in case of compound input controls should always return textfield);
       */
      __getCorrectFocusTarget: function __getCorrectFocusTarget(target) {
        var focusedElement = this.getFocus();

        if (focusedElement && target != focusedElement) {
          if (focusedElement.nodeName.toLowerCase() === "input" || focusedElement.nodeName.toLowerCase() === "textarea") {
            return focusedElement;
          } // Check compound widgets


          var widget = qx.ui.core.Widget.getWidgetByElement(focusedElement),
              textField = widget && widget.getChildControl && widget.getChildControl("textfield", true);

          if (textField) {
            return textField.getContentElement().getDomElement();
          }
        }

        return target;
      },

      /**
       * Fix for bug #2602.
       *
       * @signature function(target)
       * @param target {Element} target element from mouse up event
       * @return {Element} Element to activate;
       */
      __fixFocus: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(target) {
          return this.__getCorrectFocusTarget(target);
        },
        "webkit": function webkit(target) {
          return this.__getCorrectFocusTarget(target);
        },
        "default": function _default(target) {
          return target;
        }
      })),

      /**
       * Native event listener for <code>selectstart</code>.
       *
       *@signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeSelectStart: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "default": null
      })),

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Whether the given element is focusable. This is perfectly modeled to the
       * browsers behavior and this way may differ in the various clients.
       *
       * @param el {Element} DOM Element to query
       * @return {Boolean} Whether the element is focusable
       */
      __isFocusable: function __isFocusable(el) {
        var index = qx.bom.element.Attribute.get(el, "tabIndex");

        if (index >= 1) {
          return true;
        }

        var focusable = qx.event.handler.Focus.FOCUSABLE_ELEMENTS;

        if (index >= 0 && focusable[el.tagName]) {
          return true;
        }

        return false;
      },

      /**
       * Returns the next focusable parent element of an activated DOM element.
       *
       * @param el {Element} Element to start lookup with.
       * @return {Element|null} The next focusable element.
       */
      __findFocusableElement: function __findFocusableElement(el) {
        while (el && el.nodeType === 1) {
          if (el.getAttribute("qxKeepFocus") == "on") {
            return null;
          }

          if (this.__isFocusable(el)) {
            return el;
          }

          el = el.parentNode;
        } // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.


        return this._body;
      },

      /**
       * Returns the next activatable element. May be the element itself.
       * Works a bit different than the method {@link #__findFocusableElement}
       * as it looks up for a parent which is has a keep focus flag. When
       * there is such a parent it returns null otherwise the original
       * incoming element.
       *
       * @param el {Element} Element to start lookup with.
       * @return {Element} The next activatable element.
       */
      __findActivatableElement: function __findActivatableElement(el) {
        var orig = el;

        while (el && el.nodeType === 1) {
          if (el.getAttribute("qxKeepActive") == "on") {
            return null;
          }

          el = el.parentNode;
        }

        return orig;
      },

      /**
       * Whether the given el (or its content) should be selectable
       * by the user.
       *
       * @param node {Element} Node to start lookup with
       * @return {Boolean} Whether the content is selectable.
       */
      __isSelectable: function __isSelectable(node) {
        while (node && node.nodeType === 1) {
          var attr = node.getAttribute("qxSelectable");

          if (attr != null) {
            return attr === "on";
          }

          node = node.parentNode;
        }

        return true;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // apply routine
      _applyActive: function _applyActive(value, old) {
        // Fire events
        if (old) {
          this.__fireEvent(old, value, "deactivate", true);
        }

        if (value) {
          this.__fireEvent(value, old, "activate", true);
        } // correct scroll position for iOS 7


        if (this.__needsScrollFix) {
          window.scrollTo(0, 0);
        }
      },
      // apply routine
      _applyFocus: function _applyFocus(value, old) {
        // Fire bubbling events
        if (old) {
          this.__fireEvent(old, value, "focusout", true);
        }

        if (value) {
          this.__fireEvent(value, old, "focusin", true);
        } // Fire after events


        if (old) {
          this.__fireEvent(old, value, "blur", false);
        }

        if (value) {
          this.__fireEvent(value, old || this.__relatedTarget, "focus", false);
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

      this._manager = this._window = this._document = this._root = this._body = this.__mouseActive = this.__relatedTarget = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics); // For faster lookups generate uppercase tag names dynamically

      var focusable = statics.FOCUSABLE_ELEMENTS;

      for (var entry in focusable) {
        focusable[entry.toUpperCase()] = 1;
      }
    }
  });
  qx.event.handler.Focus.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Focus": {
        "defer": "runtime"
      },
      "qx.event.handler.Window": {
        "defer": "runtime"
      },
      "qx.event.handler.Capture": {
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.dispatch.AbstractBubbling": {
        "construct": true,
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.dom.Hierarchy": {},
      "qx.bom.Event": {},
      "qx.event.type.Event": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "load": true,
          "className": "qx.bom.client.Browser"
        },
        "os.version": {
          "load": true,
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
      2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
     License:
      MIT: https://opensource.org/licenses/MIT
      See the LICENSE file in the project's top-level directory for details.
     Authors:
      * Fabian Jakobs (fjakobs)
  ************************************************************************ */

  /**
   * Implementation of the Internet Explorer specific event capturing mode for
   * mouse events http://msdn2.microsoft.com/en-us/library/ms536742.aspx.
   *
   * This class is used internally by {@link qx.event.Manager} to do mouse event
   * capturing.
   *
   * @use(qx.event.handler.Focus)
   * @use(qx.event.handler.Window)
   * @use(qx.event.handler.Capture)
   */
  qx.Class.define("qx.event.dispatch.MouseCapture", {
    extend: qx.event.dispatch.AbstractBubbling,

    /**
     * @param manager {qx.event.Manager} Event manager for the window to use
     * @param registration {qx.event.Registration} The event registration to use
     */
    construct: function construct(manager, registration) {
      qx.event.dispatch.AbstractBubbling.constructor.call(this, manager);
      this.__window = manager.getWindow();
      this.__registration = registration;
      manager.addListener(this.__window, "blur", this.releaseCapture, this);
      manager.addListener(this.__window, "focus", this.releaseCapture, this);
      manager.addListener(this.__window, "scroll", this.releaseCapture, this);
    },
    statics: {
      /** @type {Integer} Priority of this dispatcher */
      PRIORITY: qx.event.Registration.PRIORITY_FIRST
    },
    members: {
      __registration: null,
      __captureElement: null,
      __containerCapture: true,
      __window: null,
      // overridden
      _getParent: function _getParent(target) {
        return target.parentNode;
      },

      /*
      ---------------------------------------------------------------------------
        EVENT DISPATCHER INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      canDispatchEvent: function canDispatchEvent(target, event, type) {
        return !!(this.__captureElement && this.__captureEvents[type]);
      },
      // overridden
      dispatchEvent: function dispatchEvent(target, event, type) {
        if (type == "click") {
          event.stopPropagation();
          this.releaseCapture();
          return;
        }

        if (this.__containerCapture || !qx.dom.Hierarchy.contains(this.__captureElement, target)) {
          target = this.__captureElement;
        }

        return qx.event.dispatch.MouseCapture.prototype.dispatchEvent.base.call(this, target, event, type);
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * @lint ignoreReferenceField(__captureEvents)
       */
      __captureEvents: {
        "mouseup": 1,
        "mousedown": 1,
        "click": 1,
        "dblclick": 1,
        "mousemove": 1,
        "mouseout": 1,
        "mouseover": 1,
        "pointerdown": 1,
        "pointerup": 1,
        "pointermove": 1,
        "pointerover": 1,
        "pointerout": 1,
        "tap": 1,
        "dbltap": 1
      },

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Set the given element as target for event
       *
       * @param element {Element} The element which should capture the mouse events.
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. IF false events originating in the container
       *   are not captured.
       */
      activateCapture: function activateCapture(element, containerCapture) {
        var containerCapture = containerCapture !== false;

        if (this.__captureElement === element && this.__containerCapture == containerCapture) {
          return;
        }

        if (this.__captureElement) {
          this.releaseCapture();
        } // turn on native mouse capturing if the browser supports it


        if (this.hasNativeCapture) {
          this.nativeSetCapture(element, containerCapture);
          var self = this;

          var onNativeListener = function onNativeListener() {
            qx.bom.Event.removeNativeListener(element, "losecapture", onNativeListener);
            self.releaseCapture();
          };

          qx.bom.Event.addNativeListener(element, "losecapture", onNativeListener);
        }

        this.__containerCapture = containerCapture;
        this.__captureElement = element;

        this.__registration.fireEvent(element, "capture", qx.event.type.Event, [true, false]);
      },

      /**
       * Get the element currently capturing events.
       *
       * @return {Element|null} The current capture element. This value may be
       *    null.
       */
      getCaptureElement: function getCaptureElement() {
        return this.__captureElement;
      },

      /**
       * Stop capturing of mouse events.
       */
      releaseCapture: function releaseCapture() {
        var element = this.__captureElement;

        if (!element) {
          return;
        }

        this.__captureElement = null;

        this.__registration.fireEvent(element, "losecapture", qx.event.type.Event, [true, false]); // turn off native mouse capturing if the browser supports it


        this.nativeReleaseCapture(element);
      },

      /** Whether the browser should use native mouse capturing */
      hasNativeCapture: qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9 || parseInt(qx.core.Environment.get("os.version"), 10) > 7 && qx.core.Environment.get("browser.documentmode") > 9,

      /**
       * If the browser supports native mouse capturing, sets the mouse capture to
       * the object that belongs to the current document.
       *
       * Please note that under Windows 7 (but not Windows 8), capturing is
       * not only applied to mouse events as expected, but also to native pointer events.
       *
       * @param element {Element} The capture DOM element
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       * @signature function(element, containerCapture)
       */
      nativeSetCapture: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element, containerCapture) {
          element.setCapture(containerCapture !== false);
        },
        "default": function _default() {}
      }),

      /**
       * If the browser supports native mouse capturing, removes mouse capture
       * from the object in the current document.
       *
       * @param element {Element} The DOM element to release the capture for
       * @signature function(element)
       */
      nativeReleaseCapture: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element) {
          element.releaseCapture();
        },
        "default": function _default() {}
      })
    },
    defer: function defer(statics) {
      qx.event.Registration.addDispatcher(statics);
    }
  });
  qx.event.dispatch.MouseCapture.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.root.Page": {}
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
   * For a GUI application on a traditional, HTML-dominated web page.
   *
   * The ideal environment for typical portal sites which use just a few qooxdoo
   * widgets. {@link qx.ui.root.Inline} can be used to embed qooxdoo widgets
   * into the page flow.
   *
   * @require(qx.core.Init)
   */
  qx.Class.define("qx.application.Inline", {
    extend: qx.application.AbstractGui,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _createRootWidget: function _createRootWidget() {
        return new qx.ui.root.Page(document);
      }
    }
  });
  qx.application.Inline.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This class provides capture event support at DOM level.
   */
  qx.Class.define("qx.event.handler.Capture", {
    extend: qx.core.Object,
    implement: qx.event.IEventHandler,

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
        capture: true,
        losecapture: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

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
      }
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
  qx.event.handler.Capture.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {},
      "qx.bom.element.Attribute": {}
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
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Manages children structures of an element. Easy and convenient APIs
   * to insert, remove and replace children.
   */
  qx.Bootstrap.define("qx.dom.Element", {
    statics: {
      /**
       * Whether the given <code>child</code> is a child of <code>parent</code>
       *
       * @param parent {Element} parent element
       * @param child {Node} child node
       * @return {Boolean} true when the given <code>child</code> is a child of <code>parent</code>
       */
      hasChild: function hasChild(parent, child) {
        return child.parentNode === parent;
      },

      /**
       * Whether the given <code>element</code> has children.
       *
       * @param element {Element} element to test
       * @return {Boolean} true when the given <code>element</code> has at least one child node
       */
      hasChildren: function hasChildren(element) {
        return !!element.firstChild;
      },

      /**
       * Whether the given <code>element</code> has any child elements.
       *
       * @param element {Element} element to test
       * @return {Boolean} true when the given <code>element</code> has at least one child element
       */
      hasChildElements: function hasChildElements(element) {
        element = element.firstChild;

        while (element) {
          if (element.nodeType === 1) {
            return true;
          }

          element = element.nextSibling;
        }

        return false;
      },

      /**
       * Returns the parent element of the given element.
       *
       * @param element {Element} Element to find the parent for
       * @return {Element} The parent element
       */
      getParentElement: function getParentElement(element) {
        return element.parentNode;
      },

      /**
       * Checks if the <code>element</code> is in the DOM, but note that
       * the method is very expensive!
       *
       * @param element {Element} The DOM element to check.
       * @param win {Window} The window to check for.
       * @return {Boolean} <code>true</code> if the <code>element</code> is in
       *          the DOM, <code>false</code> otherwise.
       */
      isInDom: function isInDom(element, win) {
        if (!win) {
          win = window;
        }

        var domElements = win.document.getElementsByTagName(element.nodeName);

        for (var i = 0, l = domElements.length; i < l; i++) {
          if (domElements[i] === element) {
            return true;
          }
        }

        return false;
      },

      /*
      ---------------------------------------------------------------------------
        INSERTION
      ---------------------------------------------------------------------------
      */

      /**
       * Inserts <code>node</code> at the given <code>index</code>
       * inside <code>parent</code>.
       *
       * @param node {Node} node to insert
       * @param parent {Element} parent element node
       * @param index {Integer} where to insert
       * @return {Boolean} returns true (successful)
       */
      insertAt: function insertAt(node, parent, index) {
        var ref = parent.childNodes[index];

        if (ref) {
          parent.insertBefore(node, ref);
        } else {
          parent.appendChild(node);
        }

        return true;
      },

      /**
       * Insert <code>node</code> into <code>parent</code> as first child.
       * Indexes of other children will be incremented by one.
       *
       * @param node {Node} Node to insert
       * @param parent {Element} parent element node
       * @return {Boolean} returns true (successful)
       */
      insertBegin: function insertBegin(node, parent) {
        if (parent.firstChild) {
          this.insertBefore(node, parent.firstChild);
        } else {
          parent.appendChild(node);
        }

        return true;
      },

      /**
       * Insert <code>node</code> into <code>parent</code> as last child.
       *
       * @param node {Node} Node to insert
       * @param parent {Element} parent element node
       * @return {Boolean} returns true (successful)
       */
      insertEnd: function insertEnd(node, parent) {
        parent.appendChild(node);
        return true;
      },

      /**
       * Inserts <code>node</code> before <code>ref</code> in the same parent.
       *
       * @param node {Node} Node to insert
       * @param ref {Node} Node which will be used as reference for insertion
       * @return {Boolean} returns true (successful)
       */
      insertBefore: function insertBefore(node, ref) {
        ref.parentNode.insertBefore(node, ref);
        return true;
      },

      /**
       * Inserts <code>node</code> after <code>ref</code> in the same parent.
       *
       * @param node {Node} Node to insert
       * @param ref {Node} Node which will be used as reference for insertion
       * @return {Boolean} returns true (successful)
       */
      insertAfter: function insertAfter(node, ref) {
        var parent = ref.parentNode;

        if (ref == parent.lastChild) {
          parent.appendChild(node);
        } else {
          return this.insertBefore(node, ref.nextSibling);
        }

        return true;
      },

      /*
      ---------------------------------------------------------------------------
        REMOVAL
      ---------------------------------------------------------------------------
      */

      /**
       * Removes the given <code>node</code> from its parent element.
       *
       * @param node {Node} Node to remove
       * @return {Boolean} <code>true</code> when node was successfully removed,
       *   otherwise <code>false</code>
       */
      remove: function remove(node) {
        if (!node.parentNode) {
          return false;
        }

        node.parentNode.removeChild(node);
        return true;
      },

      /**
       * Removes the given <code>node</code> from the <code>parent</code>.
       *
       * @param node {Node} Node to remove
       * @param parent {Element} parent element which contains the <code>node</code>
       * @return {Boolean} <code>true</code> when node was successfully removed,
       *   otherwise <code>false</code>
       */
      removeChild: function removeChild(node, parent) {
        if (node.parentNode !== parent) {
          return false;
        }

        parent.removeChild(node);
        return true;
      },

      /**
       * Removes the node at the given <code>index</code>
       * from the <code>parent</code>.
       *
       * @param index {Integer} position of the node which should be removed
       * @param parent {Element} parent DOM element
       * @return {Boolean} <code>true</code> when node was successfully removed,
       *   otherwise <code>false</code>
       */
      removeChildAt: function removeChildAt(index, parent) {
        var child = parent.childNodes[index];

        if (!child) {
          return false;
        }

        parent.removeChild(child);
        return true;
      },

      /*
      ---------------------------------------------------------------------------
        REPLACE
      ---------------------------------------------------------------------------
      */

      /**
       * Replaces <code>oldNode</code> with <code>newNode</code> in the current
       * parent of <code>oldNode</code>.
       *
       * @param newNode {Node} DOM node to insert
       * @param oldNode {Node} DOM node to remove
       * @return {Boolean} <code>true</code> when node was successfully replaced
       */
      replaceChild: function replaceChild(newNode, oldNode) {
        if (!oldNode.parentNode) {
          return false;
        }

        oldNode.parentNode.replaceChild(newNode, oldNode);
        return true;
      },

      /**
       * Replaces the node at <code>index</code> with <code>newNode</code> in
       * the given parent.
       *
       * @param newNode {Node} DOM node to insert
       * @param index {Integer} position of old DOM node
       * @param parent {Element} parent DOM element
       * @return {Boolean} <code>true</code> when node was successfully replaced
       */
      replaceAt: function replaceAt(newNode, index, parent) {
        var oldNode = parent.childNodes[index];

        if (!oldNode) {
          return false;
        }

        parent.replaceChild(newNode, oldNode);
        return true;
      },

      /**
       * Stores helper element for element creation in WebKit
       *
       * @internal
       */
      __helperElement: {},

      /**
       * Creates and returns a DOM helper element.
       *
       * @param win {Window?} Window to create the element for
       * @return {Element} The created element node
       */
      getHelperElement: function getHelperElement(win) {
        if (!win) {
          win = window;
        } // key is needed to allow using different windows


        var key = win.location.href;

        if (!qx.dom.Element.__helperElement[key]) {
          var helper = qx.dom.Element.__helperElement[key] = win.document.createElement("div"); // innerHTML will only parsed correctly if element is appended to document

          if (qx.core.Environment.get("engine.name") == "webkit") {
            helper.style.display = "none";
            win.document.body.appendChild(helper);
          }
        }

        return qx.dom.Element.__helperElement[key];
      },

      /**
       * Creates a DOM element.
       *
       * @param name {String} Tag name of the element
       * @param attributes {Map?} Map of attributes to apply
       * @param win {Window?} Window to create the element for
       * @return {Element} The created element node
       */
      create: function create(name, attributes, win) {
        if (!win) {
          win = window;
        }

        if (!name) {
          throw new Error("The tag name is missing!");
        }

        var element = win.document.createElement(name);

        for (var key in attributes) {
          qx.bom.element.Attribute.set(element, key, attributes[key]);
        }

        return element;
      },

      /**
       * Removes all content from the given element
       *
       * @param element {Element} element to clean
       * @return {String} empty string (new HTML content)
       */
      empty: function empty(element) {
        return element.innerHTML = "";
      }
    }
  });
  qx.dom.Element.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Init": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2017 Zenesis Limited, http://www.zenesis.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * John Spackman (john.spackman@zenesis.com, @johnspackman)
  
  ************************************************************************ */

  /**
   * Provides a registry of top level objects
   */
  qx.Class.define("qx.core.Id", {
    extend: qx.core.Object,
    type: "singleton",
    members: {
      __registeredObjects: null,
      __registeredIdHashes: null,

      /*
       * @Override
       */
      _createQxObject: function _createQxObject(id) {
        // Create the object, but don't add it to the list of owned objects
        var result = this._createQxObjectImpl(id);

        return result;
      },

      /*
       * @Override
       */
      _createQxObjectImpl: function _createQxObjectImpl(id) {
        if (this.__registeredObjects) {
          var obj = this.__registeredObjects[id];

          if (obj !== undefined) {
            return obj;
          }
        }

        switch (id) {
          case "application":
            return qx.core.Init.getApplication() || undefined;
        }

        return undefined;
      },

      /**
       * Returns an object path which can be used to locate an object anywhere in the application
       * with a call to `qx.core.Id.getQxObject()`.
       *
       * This will return null if it is not possible to calculate a path because one of the
       * ancestors has a null `qxObjectId`.
       *
       * This will also return null if the top-most ancestor is not one of the globals registered
       * with `registerObject` or a known global (such as the application); however, by passing
       * `true` as the `suppressWarnings` parameter, this will prevent errors from appearing in
       * the console when this happens
       *
       * @param obj {qx.core.Object} the object
       * @param suppressWarnings {Boolean?} default: false; silently returns null if an ID cannot be created
       * @return {String} full path to the object
       */
      getAbsoluteIdOf: function getAbsoluteIdOf(obj, suppressWarnings) {
        if (this.__registeredIdHashes && this.__registeredIdHashes[obj.toHashCode()]) {
          return obj.getQxObjectId();
        }

        var segs = [];
        var application = qx.core.Init.getApplication();

        while (obj) {
          var id = obj.getQxObjectId();

          if (!id) {
            if (!suppressWarnings) {
              this.error("Cannot determine an absolute Object ID because one of the ancestor ObjectID's is null (got as far as " + segs.join('/') + ")");
            }

            return null;
          }

          segs.unshift(id);
          var owner = obj.getQxOwner();

          if (owner) {
            // Find the ID of the owner, *if* it is registered as a top level object
            var ownerId = null;

            if (owner === application) {
              ownerId = "application";
            } else {
              ownerId = this.__registeredIdHashes && this.__registeredIdHashes[owner.toHashCode()] || null;
            } // When we have found the ID of a top level object, add it to the path and stop


            if (ownerId) {
              segs.unshift(ownerId);
              break;
            }
          } else {
            if (!suppressWarnings) {
              this.error("Cannot determine a global absolute Object ID because the topmost object is not registered");
            }

            return null;
          }

          obj = owner;
        }

        var path = segs.join("/");
        return path;
      },

      /**
       * Registers an object with an ID; as this is registering a global object which is the root of a tree
       * of objects with IDs, the `id` parameter can be provided to set the ID used for the root object - this
       * allows an object to be registered under a well known, common name without affecting the API of the
       * object.
       *
       * @param obj {qx.core.Object} the object to register
       * @param id {String?} the ID to register the object under, otherwise the object's own Object Id is used
       */
      register: function register(obj, id) {
        if (!this.__registeredObjects) {
          this.__registeredObjects = {};
          this.__registeredIdHashes = {};
        }

        if (!id) {
          id = obj.getQxObjectId();
        }

        this.__registeredObjects[id] = obj;
        this.__registeredIdHashes[obj.toHashCode()] = id;

        obj._cascadeQxObjectIdChanges();
      },

      /**
       * Unregisters a previously registered object with an ID
       *
       * @param data {Object|String} the object to unregister, or the ID of the object
       * @return {Boolean} whether there was an object to unregister
       */
      unregister: function unregister(data) {
        if (!this.__registeredObjects) {
          return false;
        }

        var id;

        if (typeof data == "string") {
          id = data;
        } else {
          var hash = data.toHashCode();
          id = this.__registeredIdHashes[hash];

          if (!id) {
            return false;
          }
        }

        var obj = this.__registeredObjects[id];

        if (obj) {
          delete this.__registeredObjects[id];
          delete this.__registeredIdHashes[obj.toHashCode()];

          obj._cascadeQxObjectIdChanges();

          return true;
        }

        return false;
      },

      /**
       * Returns a map of the objects that have been registered as id roots, with
       * the topmost part of the ID as key.
       * @return {Object}
       */
      getRegisteredObjects: function getRegisteredObjects() {
        return this.__registeredObjects;
      }
    },
    statics: {
      /**
       * Returns a top level instance
       *
       * @param id {String} the ID to look for
       * @return {qx.core.Object?} the object
       */
      getQxObject: function getQxObject(id) {
        return this.getInstance().getQxObject(id);
      },

      /**
       * Helper for `qx.core.Id.getAbsoluteIdOf`
       *
       * @param obj {qx.core.Object} the object
       * @param suppressWarnings {Boolean?} default: false; silently returns null if an ID cannot be created
       * @return {String} full path to the object
       */
      getAbsoluteIdOf: function getAbsoluteIdOf(obj, suppressWarnings) {
        return this.getInstance().getAbsoluteIdOf(obj, suppressWarnings);
      }
    }
  });
  qx.core.Id.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Browser": {},
      "qx.lang.Type": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.element.textcontent": {
          "load": true
        },
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Alexander Steitz (aback)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Attribute/Property handling for DOM HTML elements.
   *
   * Also includes support for HTML properties like <code>checked</code>
   * or <code>value</code>. This feature set is supported cross-browser
   * through one common interface and is independent of the differences between
   * the multiple implementations.
   *
   * Supports applying text and HTML content using the attribute names
   * <code>text</code> and <code>html</code>.
   */
  qx.Bootstrap.define("qx.bom.element.Attribute", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Internal map of attribute conversions */
      __hints: {
        // Name translation table (camelcase is important for some attributes)
        names: {
          "class": "className",
          "for": "htmlFor",
          html: "innerHTML",
          text: qx.core.Environment.get("html.element.textcontent") ? "textContent" : "innerText",
          colspan: "colSpan",
          rowspan: "rowSpan",
          valign: "vAlign",
          datetime: "dateTime",
          accesskey: "accessKey",
          tabindex: "tabIndex",
          maxlength: "maxLength",
          readonly: "readOnly",
          longdesc: "longDesc",
          cellpadding: "cellPadding",
          cellspacing: "cellSpacing",
          frameborder: "frameBorder",
          usemap: "useMap"
        },
        // Attributes which are only applyable on a DOM element (not using compile())
        runtime: {
          "html": 1,
          "text": 1
        },
        // Attributes which are (forced) boolean
        bools: {
          compact: 1,
          nowrap: 1,
          ismap: 1,
          declare: 1,
          noshade: 1,
          checked: 1,
          disabled: 1,
          readOnly: 1,
          multiple: 1,
          selected: 1,
          noresize: 1,
          defer: 1,
          allowTransparency: 1
        },
        // Interpreted as property (element.property)
        property: {
          // Used by qx.html.Element
          $$element: 1,
          $$elementObject: 1,
          // Used by qx.ui.core.Widget
          $$widget: 1,
          $$widgetObject: 1,
          // Native properties
          checked: 1,
          readOnly: 1,
          multiple: 1,
          selected: 1,
          value: 1,
          maxLength: 1,
          className: 1,
          innerHTML: 1,
          innerText: 1,
          textContent: 1,
          htmlFor: 1,
          tabIndex: 1
        },
        qxProperties: {
          $$widget: 1,
          $$widgetObject: 1,
          $$element: 1,
          $$elementObject: 1
        },
        // Default values when "null" is given to a property
        propertyDefault: {
          disabled: false,
          checked: false,
          readOnly: false,
          multiple: false,
          selected: false,
          value: "",
          className: "",
          innerHTML: "",
          innerText: "",
          textContent: "",
          htmlFor: "",
          tabIndex: 0,
          maxLength: qx.core.Environment.select("engine.name", {
            "mshtml": 2147483647,
            "webkit": 524288,
            "default": -1
          })
        },
        // Properties which can be removed to reset them
        removeableProperties: {
          disabled: 1,
          multiple: 1,
          maxLength: 1
        }
      },

      /**
       * Compiles an incoming attribute map to a string which
       * could be used when building HTML blocks using innerHTML.
       *
       * This method silently ignores runtime attributes like
       * <code>html</code> or <code>text</code>.
       *
       * @param map {Map} Map of attributes. The key is the name of the attribute.
       * @return {String} Returns a compiled string ready for usage.
       */
      compile: function compile(map) {
        var html = [];
        var runtime = this.__hints.runtime;

        for (var key in map) {
          if (!runtime[key]) {
            html.push(key, "='", map[key], "'");
          }
        }

        return html.join("");
      },

      /**
       * Returns the value of the given HTML attribute
       *
       * @param element {Element} The DOM element to query
       * @param name {String} Name of the attribute
       * @return {var} The value of the attribute
       */
      get: function get(element, name) {
        var hints = this.__hints;
        var value; // normalize name

        name = hints.names[name] || name; // respect properties

        if (hints.property[name]) {
          value = element[name];

          if (typeof hints.propertyDefault[name] !== "undefined" && value == hints.propertyDefault[name]) {
            // only return null for all non-boolean properties
            if (typeof hints.bools[name] === "undefined") {
              return null;
            } else {
              return value;
            }
          }
        } else {
          // fallback to attribute
          value = element.getAttribute(name); // All modern browsers interpret "" as true but not IE8, which set the property to "" reset

          if (hints.bools[name] && !(qx.core.Environment.get("engine.name") == "mshtml" && parseInt(qx.core.Environment.get("browser.documentmode"), 10) <= 8)) {
            return qx.Bootstrap.isString(value); // also respect empty strings as true
          }
        }

        if (hints.bools[name]) {
          return !!value;
        }

        return value;
      },

      /**
       * Sets an HTML attribute on the given DOM element
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the attribute
       * @param value {var} New value of the attribute
       */
      set: function set(element, name, value) {
        if (typeof value === "undefined") {
          return;
        }

        var hints = this.__hints; // normalize name

        name = hints.names[name] || name; // respect booleans

        if (hints.bools[name] && !qx.lang.Type.isBoolean(value)) {
          value = qx.lang.Type.isString(value);
        } // apply attribute
        // only properties which can be applied by the browser or qxProperties
        // otherwise use the attribute methods


        if (hints.property[name] && (!(element[name] === undefined) || hints.qxProperties[name])) {
          // resetting the attribute/property
          if (value == null) {
            // for properties which need to be removed for a correct reset
            if (hints.removeableProperties[name]) {
              element.removeAttribute(name);
              return;
            } else if (typeof hints.propertyDefault[name] !== "undefined") {
              value = hints.propertyDefault[name];
            }
          }

          element[name] = value;
        } else {
          if ((hints.bools[name] || value === null) && name.indexOf("data-") !== 0) {
            if (value === true) {
              element.setAttribute(name, name);
            } else if (value === false || value === null) {
              element.removeAttribute(name);
            }
          } else if (value === null) {
            element.removeAttribute(name);
          } else {
            element.setAttribute(name, value);
          }
        }
      },

      /**
       * Resets an HTML attribute on the given DOM element
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the attribute
       */
      reset: function reset(element, name) {
        if (name.indexOf("data-") === 0) {
          element.removeAttribute(name);
        } else {
          this.set(element, name, null);
        }
      }
    }
  });
  qx.bom.element.Attribute.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.event.Registration": {
        "construct": true,
        "defer": "runtime",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.event.type.Event": {},
      "qx.event.Pool": {},
      "qx.event.Utils": {}
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
   * Connects the widgets to the browser DOM events.
   */
  qx.Class.define("qx.ui.core.EventHandler", {
    extend: qx.core.Object,
    implement: qx.event.IEventHandler,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__manager = qx.event.Registration.getManager(window);
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_FIRST,

      /** @type {Map} Supported event types. Identical to events map of qx.ui.core.Widget */
      SUPPORTED_TYPES: {
        // mouse events
        mousemove: 1,
        mouseover: 1,
        mouseout: 1,
        mousedown: 1,
        mouseup: 1,
        click: 1,
        auxclick: 1,
        dblclick: 1,
        contextmenu: 1,
        mousewheel: 1,
        // key events
        keyup: 1,
        keydown: 1,
        keypress: 1,
        keyinput: 1,
        // mouse capture
        capture: 1,
        losecapture: 1,
        // focus events
        focusin: 1,
        focusout: 1,
        focus: 1,
        blur: 1,
        activate: 1,
        deactivate: 1,
        // appear events
        appear: 1,
        disappear: 1,
        // drag drop events
        dragstart: 1,
        dragend: 1,
        dragover: 1,
        dragleave: 1,
        drop: 1,
        drag: 1,
        dragchange: 1,
        droprequest: 1,
        // touch events
        touchstart: 1,
        touchend: 1,
        touchmove: 1,
        touchcancel: 1,
        // gestures
        tap: 1,
        longtap: 1,
        swipe: 1,
        dbltap: 1,
        track: 1,
        trackend: 1,
        trackstart: 1,
        pinch: 1,
        rotate: 1,
        roll: 1,
        // pointer events
        pointermove: 1,
        pointerover: 1,
        pointerout: 1,
        pointerdown: 1,
        pointerup: 1,
        pointercancel: 1
      },

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager: null,

      /**
       * @type {Map} Supported focus event types
       *
       * @lint ignoreReferenceField(__focusEvents)
       */
      __focusEvents: {
        focusin: 1,
        focusout: 1,
        focus: 1,
        blur: 1
      },

      /**
       * @type {Map} Map of events which should be fired independently from being disabled
       *
       * @lint ignoreReferenceField(__ignoreDisabled)
       */
      __ignoreDisabled: {
        // mouse events
        mouseover: 1,
        mouseout: 1,
        // appear events
        appear: 1,
        disappear: 1
      },
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {
        return target instanceof qx.ui.core.Widget;
      },

      /**
       * Dispatches a DOM event on a widget.
       *
       * @param domEvent {qx.event.type.Event} The event object to dispatch.
       */
      _dispatchEvent: function _dispatchEvent(domEvent) {
        // EVENT TARGET
        var domTarget = domEvent.getTarget();
        var widgetTarget = qx.ui.core.Widget.getWidgetByElement(domTarget);
        var targetChanged = false;

        while (widgetTarget && widgetTarget.isAnonymous()) {
          var targetChanged = true;
          widgetTarget = widgetTarget.getLayoutParent();
        } // don't activate anonymous widgets!


        if (widgetTarget && targetChanged && domEvent.getType() == "activate") {
          widgetTarget.getContentElement().activate();
        } // Correcting target for focus events


        if (this.__focusEvents[domEvent.getType()]) {
          widgetTarget = widgetTarget && widgetTarget.getFocusTarget(); // Whether nothing is returned

          if (!widgetTarget) {
            return;
          }
        } // EVENT RELATED TARGET


        if (domEvent.getRelatedTarget) {
          var domRelatedTarget = domEvent.getRelatedTarget();
          var widgetRelatedTarget = qx.ui.core.Widget.getWidgetByElement(domRelatedTarget);

          while (widgetRelatedTarget && widgetRelatedTarget.isAnonymous()) {
            widgetRelatedTarget = widgetRelatedTarget.getLayoutParent();
          }

          if (widgetRelatedTarget) {
            // Correcting target for focus events
            if (this.__focusEvents[domEvent.getType()]) {
              widgetRelatedTarget = widgetRelatedTarget.getFocusTarget();
            } // If target and related target are identical ignore the event


            if (widgetRelatedTarget === widgetTarget) {
              return;
            }
          }
        } // EVENT CURRENT TARGET


        var currentTarget = domEvent.getCurrentTarget();
        var currentWidget = qx.ui.core.Widget.getWidgetByElement(currentTarget);

        if (!currentWidget || currentWidget.isAnonymous()) {
          return;
        } // Correcting target for focus events


        if (this.__focusEvents[domEvent.getType()]) {
          currentWidget = currentWidget.getFocusTarget();
        } // Ignore most events in the disabled state.


        var type = domEvent.getType();

        if (!currentWidget || !(currentWidget.isEnabled() || this.__ignoreDisabled[type])) {
          return;
        } // PROCESS LISTENERS
        // Load listeners


        var capture = domEvent.getEventPhase() == qx.event.type.Event.CAPTURING_PHASE;

        var listeners = this.__manager.getListeners(currentWidget, type, capture);

        if (domEvent.getEventPhase() == qx.event.type.Event.AT_TARGET) {
          if (!listeners) {
            listeners = [];
          }

          var otherListeners = this.__manager.getListeners(currentWidget, type, !capture);

          if (otherListeners) {
            listeners = listeners.concat(otherListeners);
          }
        }

        if (!listeners || listeners.length === 0) {
          return;
        } // Create cloned event with correct target


        var widgetEvent = qx.event.Pool.getInstance().getObject(domEvent.constructor);
        domEvent.clone(widgetEvent);
        widgetEvent.setTarget(widgetTarget);
        widgetEvent.setRelatedTarget(widgetRelatedTarget || null);
        widgetEvent.setCurrentTarget(currentWidget); // Keep original target of DOM event, otherwise map it to the original

        var orig = domEvent.getOriginalTarget();

        if (orig) {
          var widgetOriginalTarget = qx.ui.core.Widget.getWidgetByElement(orig);

          while (widgetOriginalTarget && widgetOriginalTarget.isAnonymous()) {
            widgetOriginalTarget = widgetOriginalTarget.getLayoutParent();
          }

          widgetEvent.setOriginalTarget(widgetOriginalTarget);
        } else {
          widgetEvent.setOriginalTarget(domTarget);
        } // Dispatch it on all listeners


        var tracker = {};
        qx.event.Utils.then(tracker, function () {
          return qx.event.Utils.series(listeners, function (listener) {
            var context = listener.context || currentWidget;
            return listener.handler.call(context, widgetEvent);
          });
        }); // Synchronize propagation stopped/prevent default property

        qx.event.Utils.then(tracker, function () {
          if (widgetEvent.getPropagationStopped()) {
            domEvent.stopPropagation();
          }

          if (widgetEvent.getDefaultPrevented()) {
            domEvent.preventDefault();
          }
        });
        return qx.event.Utils.then(tracker, function () {
          qx.event.Pool.getInstance().poolObject(widgetEvent);
        });
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        var elem;

        if (type === "focus" || type === "blur") {
          elem = target.getFocusElement();
        } else {
          elem = target.getContentElement();
        }

        if (elem) {
          elem.addListener(type, this._dispatchEvent, this, capture);
        }
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {
        var elem;

        if (type === "focus" || type === "blur") {
          elem = target.getFocusElement();
        } else {
          elem = target.getContentElement();
        }

        if (elem) {
          elem.removeListener(type, this._dispatchEvent, this, capture);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__manager = null;
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
  qx.ui.core.EventHandler.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Gesture": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Keyboard": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Capture": {
        "require": true,
        "defer": "runtime"
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
        "construct": true,
        "defer": "runtime",
        "require": true
      },
      "qx.event.Utils": {},
      "qx.Promise": {},
      "qx.event.type.Drag": {},
      "qx.ui.core.Widget": {},
      "qx.ui.core.DragDropCursor": {},
      "qx.bom.element.Style": {}
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
   * Event handler, which supports drag events on DOM elements.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.handler.Gesture)
   * @require(qx.event.handler.Keyboard)
   * @require(qx.event.handler.Capture)
   */
  qx.Class.define("qx.event.handler.DragDrop", {
    extend: qx.core.Object,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this.__manager = manager;
      this.__root = manager.getWindow().document.documentElement; // Initialize listener

      this.__manager.addListener(this.__root, "longtap", this._onLongtap, this);

      this.__manager.addListener(this.__root, "pointerdown", this._onPointerdown, this, true);

      qx.event.Registration.addListener(window, "blur", this._onWindowBlur, this); // Initialize data structures

      this.__rebuildStructures();
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
        dragstart: 1,
        dragend: 1,
        dragover: 1,
        dragleave: 1,
        drop: 1,
        drag: 1,
        dragchange: 1,
        droprequest: 1
      },

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /**
       * Array of strings holding the names of the allowed mouse buttons
       * for Drag & Drop. The default is "left" but could be extended with
       * "middle" or "right"
       */
      ALLOWED_BUTTONS: ["left"],

      /**
       * The distance needed to change the mouse position before a drag session start.
       */
      MIN_DRAG_DISTANCE: 5
    },
    properties: {
      /**
       * Widget instance of the drag & drop cursor. If non is given, the default
       * {@link qx.ui.core.DragDropCursor} will be used.
       */
      cursor: {
        check: "qx.ui.core.Widget",
        nullable: true,
        init: null
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager: null,
      __root: null,
      __dropTarget: null,
      __dragTarget: null,
      __types: null,
      __actions: null,
      __keys: null,
      __cache: null,
      __currentType: null,
      __currentAction: null,
      __sessionActive: false,
      __validDrop: false,
      __validAction: false,
      __dragTargetWidget: null,
      __startConfig: null,

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
        PUBLIC METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Registers a supported type
       *
       * @param type {String} The type to add
       */
      addType: function addType(type) {
        this.__types[type] = true;
      },

      /**
       * Registers a supported action. One of <code>move</code>,
       * <code>copy</code> or <code>alias</code>.
       *
       * @param action {String} The action to add
       */
      addAction: function addAction(action) {
        this.__actions[action] = true;
      },

      /**
       * Whether the current drag target supports the given type
       *
       * @param type {String} Any type
       * @return {Boolean} Whether the type is supported
       */
      supportsType: function supportsType(type) {
        return !!this.__types[type];
      },

      /**
       * Whether the current drag target supports the given action
       *
       * @param type {String} Any type
       * @return {Boolean} Whether the action is supported
       */
      supportsAction: function supportsAction(type) {
        return !!this.__actions[type];
      },

      /**
       * Whether the current drop target allows the current drag target.
       *
       * @param isAllowed {Boolean} False if a drop should be disallowed
       */
      setDropAllowed: function setDropAllowed(isAllowed) {
        this.__validDrop = isAllowed;

        this.__detectAction();
      },

      /**
       * Returns the data of the given type during the <code>drop</code> event
       * on the drop target. This method fires a <code>droprequest</code> at
       * the drag target which should be answered by calls to {@link #addData}.
       *
       * Note that this is a synchronous method and if any of the drag and drop
       * events handlers are implemented using Promises, this may fail; @see
       * `getDataAsync`.
       *
       * @param type {String} Any supported type
       * @return {var} The result data in a promise
       */
      getData: function getData(type) {
        if (!this.__validDrop || !this.__dropTarget) {
          throw new Error("This method must not be used outside the drop event listener!");
        }

        if (!this.__types[type]) {
          throw new Error("Unsupported data type: " + type + "!");
        }

        if (!this.__cache[type]) {
          this.__currentType = type;

          this.__fireEvent("droprequest", this.__dragTarget, this.__dropTarget, false, false);
        }

        if (!this.__cache[type]) {
          throw new Error("Please use a droprequest listener to the drag source to fill the manager with data!");
        }

        return this.__cache[type] || null;
      },

      /**
       * Returns the data of the given type during the <code>drop</code> event
       * on the drop target. This method fires a <code>droprequest</code> at
       * the drag target which should be answered by calls to {@link #addData}.
       *
       * @param type {String} Any supported type
       * @return {qx.Promise} The result data in a promise
       */
      getDataAsync: function getDataAsync(type) {
        if (!this.__validDrop || !this.__dropTarget) {
          throw new Error("This method must not be used outside the drop event listener!");
        }

        if (!this.__types[type]) {
          throw new Error("Unsupported data type: " + type + "!");
        }

        var tracker = {};
        var self = this;

        if (!this.__cache[type]) {
          qx.event.Utils.then(tracker, function () {
            self.__currentType = type;
            return self.__fireEvent("droprequest", self.__dragTarget, self.__dropTarget, false);
          });
        }

        return qx.event.Utils.then(tracker, function () {
          if (!this.__cache[type]) {
            throw new Error("Please use a droprequest listener to the drag source to fill the manager with data!");
          }

          return this.__cache[type] || null;
        });
      },

      /**
       * Returns the currently selected action (by user keyboard modifiers)
       *
       * @return {String} One of <code>move</code>, <code>copy</code> or
       *    <code>alias</code>
       */
      getCurrentAction: function getCurrentAction() {
        this.__detectAction();

        return this.__currentAction;
      },

      /**
       * Returns the currently selected action (by user keyboard modifiers)
       *
       * @return {qx.Promise|String} One of <code>move</code>, <code>copy</code> or
       *    <code>alias</code>
       */
      getCurrentActionAsync: function getCurrentActionAsync() {
        var self = this;
        return qx.Promise.resolve(self.__detectAction()).then(function () {
          return self.__currentAction;
        });
      },

      /**
       * Returns the widget which has been the target of the drag start.
       * @return {qx.ui.core.Widget} The widget on which the drag started.
       */
      getDragTarget: function getDragTarget() {
        return this.__dragTargetWidget;
      },

      /**
       * Adds data of the given type to the internal storage. The data
       * is available until the <code>dragend</code> event is fired.
       *
       * @param type {String} Any valid type
       * @param data {var} Any data to store
       */
      addData: function addData(type, data) {
        this.__cache[type] = data;
      },

      /**
       * Returns the type which was requested last.
       *
       * @return {String} The last requested data type
       */
      getCurrentType: function getCurrentType() {
        return this.__currentType;
      },

      /**
       * Returns if a drag session is currently active
       *
       * @return {Boolean} active drag session
       */
      isSessionActive: function isSessionActive() {
        return this.__sessionActive;
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Rebuilds the internal data storage used during a drag&drop session
       */
      __rebuildStructures: function __rebuildStructures() {
        this.__types = {};
        this.__actions = {};
        this.__keys = {};
        this.__cache = {};
      },

      /**
       * Detects the current action and stores it under the private
       * field <code>__currentAction</code>. Also fires the event
       * <code>dragchange</code> on every modification.
       *
       * @return {qx.Promise|null}
       */
      __detectAction: function __detectAction() {
        if (this.__dragTarget == null) {
          {
            return qx.Promise.reject();
          }
        }

        var actions = this.__actions;
        var keys = this.__keys;
        var current = null;

        if (this.__validDrop) {
          if (keys.Shift && keys.Control && actions.alias) {
            current = "alias";
          } else if (keys.Shift && keys.Alt && actions.copy) {
            current = "copy";
          } else if (keys.Shift && actions.move) {
            current = "move";
          } else if (keys.Alt && actions.alias) {
            current = "alias";
          } else if (keys.Control && actions.copy) {
            current = "copy";
          } else if (actions.move) {
            current = "move";
          } else if (actions.copy) {
            current = "copy";
          } else if (actions.alias) {
            current = "alias";
          }
        }

        var self = this;
        var tracker = {};
        var old = this.__currentAction;

        if (current != old) {
          if (this.__dropTarget) {
            qx.event.Utils["catch"](function () {
              self.__validAction = false;
              current = null;
            });
            qx.event.Utils.then(tracker, function () {
              self.__currentAction = current;
              return self.__fireEvent("dragchange", self.__dropTarget, self.__dragTarget, true);
            });
            qx.event.Utils.then(tracker, function (validAction) {
              self.__validAction = validAction;

              if (!validAction) {
                current = null;
              }
            });
          }
        }

        return qx.event.Utils.then(tracker, function () {
          if (current != old) {
            self.__currentAction = current;
            return self.__fireEvent("dragchange", self.__dragTarget, self.__dropTarget, false);
          }
        });
      },

      /**
       * Wrapper for {@link qx.event.Registration#fireEvent} for drag&drop events
       * needed in this class.
       *
       * @param type {String} Event type
       * @param target {Object} Target to fire on
       * @param relatedTarget {Object} Related target, i.e. drag or drop target
       *    depending on the drag event
       * @param cancelable {Boolean} Whether the event is cancelable
       * @param original {qx.event.type.Pointer} Original pointer event
       * @return {qx.Promise|Boolean} <code>true</code> if the event's default behavior was
       * not prevented
       */
      __fireEvent: function __fireEvent(type, target, relatedTarget, cancelable, original, async) {
        var Registration = qx.event.Registration;
        var dragEvent = Registration.createEvent(type, qx.event.type.Drag, [cancelable, original]);

        if (target !== relatedTarget) {
          dragEvent.setRelatedTarget(relatedTarget);
        }

        var result = Registration.dispatchEvent(target, dragEvent);
        {
          if (async === undefined || async) {
            return qx.Promise.resolve(result).then(function () {
              return !dragEvent.getDefaultPrevented();
            });
          } else {
            {
              if (result instanceof qx.Promise) {
                this.error("DragDrop event \"" + type + "\" returned a promise but a synchronous event was required, drag and drop may not work as expected (consider using getDataAsync)");
              }
            }
            return result;
          }
        }
      },

      /**
       * Finds next draggable parent of the given element. Maybe the element itself as well.
       *
       * Looks for the attribute <code>qxDraggable</code> with the value <code>on</code>.
       *
       * @param elem {Element} The element to query
       * @return {Element} The next parent element which is draggable. May also be <code>null</code>
       */
      __findDraggable: function __findDraggable(elem) {
        while (elem && elem.nodeType == 1) {
          if (elem.getAttribute("qxDraggable") == "on") {
            return elem;
          }

          elem = elem.parentNode;
        }

        return null;
      },

      /**
       * Finds next droppable parent of the given element. Maybe the element itself as well.
       *
       * Looks for the attribute <code>qxDroppable</code> with the value <code>on</code>.
       *
       * @param elem {Element} The element to query
       * @return {Element} The next parent element which is droppable. May also be <code>null</code>
       */
      __findDroppable: function __findDroppable(elem) {
        while (elem && elem.nodeType == 1) {
          if (elem.getAttribute("qxDroppable") == "on") {
            return elem;
          }

          elem = elem.parentNode;
        }

        return null;
      },

      /**
       * Cleans up a drag&drop session when <code>dragstart</code> was fired before.
       *
       * @return {qx.Promise?} promise, if one was created by event handlers
       */
      clearSession: function clearSession() {
        //this.debug("clearSession");
        // Deregister from root events
        this.__manager.removeListener(this.__root, "pointermove", this._onPointermove, this);

        this.__manager.removeListener(this.__root, "pointerup", this._onPointerup, this, true);

        this.__manager.removeListener(this.__root, "keydown", this._onKeyDown, this, true);

        this.__manager.removeListener(this.__root, "keyup", this._onKeyUp, this, true);

        this.__manager.removeListener(this.__root, "keypress", this._onKeyPress, this, true);

        this.__manager.removeListener(this.__root, "roll", this._onRoll, this, true);

        var tracker = {};
        var self = this; // Fire dragend event

        if (this.__dragTarget) {
          qx.event.Utils.then(tracker, function () {
            return self.__fireEvent("dragend", self.__dragTarget, self.__dropTarget, false);
          });
        }

        return qx.event.Utils.then(tracker, function () {
          // Cleanup
          self.__validDrop = false;
          self.__dropTarget = null;

          if (self.__dragTargetWidget) {
            self.__dragTargetWidget.removeState("drag");

            self.__dragTargetWidget = null;
          } // Clear init
          //self.debug("Clearing drag target");


          self.__dragTarget = null;
          self.__sessionActive = false;
          self.__startConfig = null;

          self.__rebuildStructures();
        });
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for long tap which takes care of starting the drag & drop session for
       * touch interactions.
       * @param e {qx.event.type.Tap} The longtap event.
       */
      _onLongtap: function _onLongtap(e) {
        // only for touch
        if (e.getPointerType() != "touch") {
          return;
        } // prevent scrolling


        this.__manager.addListener(this.__root, "roll", this._onRoll, this, true);

        return this._start(e);
      },

      /**
       * Helper to start the drag & drop session. It is responsible for firing the
       * dragstart event and attaching the key listener.
       * @param e {qx.event.type.Pointer} Either a longtap or pointermove event.
       *
       * @return {Boolean} Returns <code>false</code> if drag session should be
       * canceled.
       */
      _start: function _start(e) {
        // only for primary pointer and allowed buttons
        var isButtonOk = qx.event.handler.DragDrop.ALLOWED_BUTTONS.indexOf(e.getButton()) !== -1;

        if (!e.isPrimary() || !isButtonOk) {
          return false;
        } // start target can be none as the drag & drop handler might
        // be created after the first start event


        var target = this.__startConfig ? this.__startConfig.target : e.getTarget();

        var draggable = this.__findDraggable(target);

        if (draggable) {
          // This is the source target
          //this.debug("Setting dragtarget = " + draggable);
          this.__dragTarget = draggable;
          var widgetOriginalTarget = qx.ui.core.Widget.getWidgetByElement(this.__startConfig.original);

          while (widgetOriginalTarget && widgetOriginalTarget.isAnonymous()) {
            widgetOriginalTarget = widgetOriginalTarget.getLayoutParent();
          }

          if (widgetOriginalTarget) {
            this.__dragTargetWidget = widgetOriginalTarget;
            widgetOriginalTarget.addState("drag");
          } // fire cancelable dragstart


          var self = this;
          var tracker = {};
          qx.event.Utils["catch"](function () {
            //self.debug("dragstart FAILED, setting __sessionActive=false");
            self.__sessionActive = false;
          });
          qx.event.Utils.then(tracker, function () {
            return self.__fireEvent("dragstart", self.__dragTarget, self.__dropTarget, true, e);
          });
          return qx.event.Utils.then(tracker, function (validAction) {
            if (!validAction) {
              return;
            } //self.debug("dragstart ok, setting __sessionActive=true")


            self.__manager.addListener(self.__root, "keydown", self._onKeyDown, self, true);

            self.__manager.addListener(self.__root, "keyup", self._onKeyUp, self, true);

            self.__manager.addListener(self.__root, "keypress", self._onKeyPress, self, true);

            self.__sessionActive = true;
          });
        }
      },

      /**
       * Event handler for the pointerdown event which stores the initial targets and the coordinates.
       * @param e {qx.event.type.Pointer} The pointerdown event.
       */
      _onPointerdown: function _onPointerdown(e) {
        if (e.isPrimary()) {
          this.__startConfig = {
            target: e.getTarget(),
            original: e.getOriginalTarget(),
            left: e.getDocumentLeft(),
            top: e.getDocumentTop()
          };

          this.__manager.addListener(this.__root, "pointermove", this._onPointermove, this);

          this.__manager.addListener(this.__root, "pointerup", this._onPointerup, this, true);
        }
      },

      /**
       * Event handler for the pointermove event which starts the drag session and
       * is responsible for firing the drag, dragover and dragleave event.
       * @param e {qx.event.type.Pointer} The pointermove event.
       */
      _onPointermove: function _onPointermove(e) {
        // only allow drag & drop for primary pointer
        if (!e.isPrimary()) {
          return;
        } //this.debug("_onPointermove: start");


        var self = this;
        var tracker = {};
        qx.event.Utils["catch"](function () {
          return self.clearSession();
        }); // start the drag session for mouse

        if (!self.__sessionActive && e.getPointerType() == "mouse") {
          var delta = self._getDelta(e); // if the mouse moved a bit in any direction


          var distance = qx.event.handler.DragDrop.MIN_DRAG_DISTANCE;

          if (delta && (Math.abs(delta.x) > distance || Math.abs(delta.y) > distance)) {
            //self.debug("_onPointermove: outside min drag distance");
            qx.event.Utils.then(tracker, function () {
              return self._start(e);
            });
          }
        }

        return qx.event.Utils.then(tracker, function () {
          // check if the session has been activated
          if (!self.__sessionActive) {
            //self.debug("not active");
            return;
          }

          var tracker = {};
          qx.event.Utils.then(tracker, function () {
            //self.debug("active, firing drag");
            return self.__fireEvent("drag", self.__dragTarget, self.__dropTarget, true, e);
          });
          qx.event.Utils.then(tracker, function (validAction) {
            if (!validAction) {
              this.clearSession();
            } //self.debug("drag");
            // find current hovered droppable


            var el = e.getTarget();

            if (self.__startConfig.target === el) {
              // on touch devices the native events return wrong elements as target (its always the element where the dragging started)
              el = e.getNativeEvent().view.document.elementFromPoint(e.getDocumentLeft(), e.getDocumentTop());
            }

            var cursor = self.getCursor();

            if (!cursor) {
              cursor = qx.ui.core.DragDropCursor.getInstance();
            }

            var cursorEl = cursor.getContentElement().getDomElement();

            if (cursorEl && (el === cursorEl || cursorEl.contains(el))) {
              var display = qx.bom.element.Style.get(cursorEl, "display"); // get the cursor out of the way

              qx.bom.element.Style.set(cursorEl, "display", "none");
              el = e.getNativeEvent().view.document.elementFromPoint(e.getDocumentLeft(), e.getDocumentTop());
              qx.bom.element.Style.set(cursorEl, "display", display);
            }

            if (el !== cursorEl) {
              var droppable = self.__findDroppable(el); // new drop target detected


              if (droppable && droppable != self.__dropTarget) {
                var dropLeaveTarget = self.__dropTarget;
                self.__validDrop = true; // initial value should be true

                self.__dropTarget = droppable;
                var innerTracker = {};
                qx.event.Utils["catch"](innerTracker, function () {
                  self.__dropTarget = null;
                  self.__validDrop = false;
                }); // fire dragleave for previous drop target

                if (dropLeaveTarget) {
                  qx.event.Utils.then(innerTracker, function () {
                    return self.__fireEvent("dragleave", dropLeaveTarget, self.__dragTarget, false, e);
                  });
                }

                qx.event.Utils.then(innerTracker, function () {
                  return self.__fireEvent("dragover", droppable, self.__dragTarget, true, e);
                });
                return qx.event.Utils.then(innerTracker, function (validDrop) {
                  self.__validDrop = validDrop;
                });
              } // only previous drop target
              else if (!droppable && self.__dropTarget) {
                  var innerTracker = {};
                  qx.event.Utils.then(innerTracker, function () {
                    return self.__fireEvent("dragleave", self.__dropTarget, self.__dragTarget, false, e);
                  });
                  return qx.event.Utils.then(innerTracker, function () {
                    self.__dropTarget = null;
                    self.__validDrop = false;
                    return self.__detectAction();
                  });
                }
            }
          });
          return qx.event.Utils.then(tracker, function () {
            // Reevaluate current action
            var keys = self.__keys;
            keys.Control = e.isCtrlPressed();
            keys.Shift = e.isShiftPressed();
            keys.Alt = e.isAltPressed();
            return self.__detectAction();
          });
        });
      },

      /**
       * Helper function to compute the delta between current cursor position from given event
       * and the stored coordinates at {@link #_onPointerdown}.
       *
       * @param e {qx.event.type.Pointer} The pointer event
       *
       * @return {Map} containing the deltaX as x, and deltaY as y.
       */
      _getDelta: function _getDelta(e) {
        if (!this.__startConfig) {
          return null;
        }

        var deltaX = e.getDocumentLeft() - this.__startConfig.left;

        var deltaY = e.getDocumentTop() - this.__startConfig.top;

        return {
          "x": deltaX,
          "y": deltaY
        };
      },

      /**
       * Handler for the pointerup event which is responsible fore firing the drop event.
       * @param e {qx.event.type.Pointer} The pointerup event
       */
      _onPointerup: function _onPointerup(e) {
        if (!e.isPrimary()) {
          return;
        }

        var tracker = {};
        var self = this; // Fire drop event in success case

        if (this.__validDrop && this.__validAction) {
          qx.event.Utils.then(tracker, function () {
            return self.__fireEvent("drop", self.__dropTarget, self.__dragTarget, false, e);
          });
        }

        return qx.event.Utils.then(tracker, function () {
          // Stop event
          if (e.getTarget() == self.__dragTarget) {
            e.stopPropagation();
          } // Clean up


          return self.clearSession();
        });
      },

      /**
       * Roll listener to stop scrolling on touch devices.
       * @param e {qx.event.type.Roll} The roll event.
       */
      _onRoll: function _onRoll(e) {
        e.stop();
      },

      /**
       * Event listener for window's <code>blur</code> event
       *
       * @param e {qx.event.type.Event} Event object
       */
      _onWindowBlur: function _onWindowBlur(e) {
        return this.clearSession();
      },

      /**
       * Event listener for root's <code>keydown</code> event
       *
       * @param e {qx.event.type.KeySequence} Event object
       */
      _onKeyDown: function _onKeyDown(e) {
        var iden = e.getKeyIdentifier();

        switch (iden) {
          case "Alt":
          case "Control":
          case "Shift":
            if (!this.__keys[iden]) {
              this.__keys[iden] = true;
              return this.__detectAction();
            }

        }
      },

      /**
       * Event listener for root's <code>keyup</code> event
       *
       * @param e {qx.event.type.KeySequence} Event object
       */
      _onKeyUp: function _onKeyUp(e) {
        var iden = e.getKeyIdentifier();

        switch (iden) {
          case "Alt":
          case "Control":
          case "Shift":
            if (this.__keys[iden]) {
              this.__keys[iden] = false;
              return this.__detectAction();
            }

        }
      },

      /**
       * Event listener for root's <code>keypress</code> event
       *
       * @param e {qx.event.type.KeySequence} Event object
       */
      _onKeyPress: function _onKeyPress(e) {
        var iden = e.getKeyIdentifier();

        switch (iden) {
          case "Escape":
            return this.clearSession();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      qx.event.Registration.removeListener(window, "blur", this._onWindowBlur, this); // Clear fields

      this.__dragTarget = this.__dropTarget = this.__manager = this.__root = this.__types = this.__actions = this.__keys = this.__cache = null;
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
  qx.event.handler.DragDrop.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {},
      "qx.core.Property": {}
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
   * A helper class for accessing the property system directly.
   *
   * This class is rather to be used internally. For all regular usage of the
   * property system the default API should be sufficient.
   */
  qx.Class.define("qx.util.PropertyUtil", {
    statics: {
      /**
       * Get the property map of the given class
       *
       * @param clazz {Class} a qooxdoo class
       * @return {Map} A properties map as defined in {@link qx.Class#define}
       *   including the properties of included mixins and not including refined
       *   properties.
       */
      getProperties: function getProperties(clazz) {
        return clazz.$$properties;
      },

      /**
       * Get the property map of the given class including the properties of all
       * superclasses!
       *
       * @param clazz {Class} a qooxdoo class
       * @return {Map} The properties map as defined in {@link qx.Class#define}
       *   including the properties of included mixins of the current class and
       *   all superclasses.
       */
      getAllProperties: function getAllProperties(clazz) {
        var properties = {};
        var superclass = clazz; // go threw the class hierarchy

        while (superclass != qx.core.Object) {
          var currentProperties = this.getProperties(superclass);

          for (var property in currentProperties) {
            properties[property] = currentProperties[property];
          }

          superclass = superclass.superclass;
        }

        return properties;
      },

      /*
      -------------------------------------------------------------------------
        USER VALUES
      -------------------------------------------------------------------------
      */

      /**
       * Returns the user value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @return {var} The user value
       */
      getUserValue: function getUserValue(object, propertyName) {
        return object["$$user_" + propertyName];
      },

      /**
      * Sets the user value of the given property
      *
      * @param object {Object} The object to access
      * @param propertyName {String} The name of the property
      * @param value {var} The value to set
      */
      setUserValue: function setUserValue(object, propertyName, value) {
        object["$$user_" + propertyName] = value;
      },

      /**
      * Deletes the user value of the given property
      *
      * @param object {Object} The object to access
      * @param propertyName {String} The name of the property
      */
      deleteUserValue: function deleteUserValue(object, propertyName) {
        delete object["$$user_" + propertyName];
      },

      /*
      -------------------------------------------------------------------------
        INIT VALUES
      -------------------------------------------------------------------------
      */

      /**
       * Returns the init value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @return {var} The init value
       */
      getInitValue: function getInitValue(object, propertyName) {
        return object["$$init_" + propertyName];
      },

      /**
      * Sets the init value of the given property
      *
      * @param object {Object} The object to access
      * @param propertyName {String} The name of the property
      * @param value {var} The value to set
      */
      setInitValue: function setInitValue(object, propertyName, value) {
        object["$$init_" + propertyName] = value;
      },

      /**
      * Deletes the init value of the given property
      *
      * @param object {Object} The object to access
      * @param propertyName {String} The name of the property
      */
      deleteInitValue: function deleteInitValue(object, propertyName) {
        delete object["$$init_" + propertyName];
      },

      /*
      -------------------------------------------------------------------------
        THEME VALUES
      -------------------------------------------------------------------------
      */

      /**
       * Returns the theme value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @return {var} The theme value
       */
      getThemeValue: function getThemeValue(object, propertyName) {
        return object["$$theme_" + propertyName];
      },

      /**
      * Sets the theme value of the given property
      *
      * @param object {Object} The object to access
      * @param propertyName {String} The name of the property
      * @param value {var} The value to set
      */
      setThemeValue: function setThemeValue(object, propertyName, value) {
        object["$$theme_" + propertyName] = value;
      },

      /**
      * Deletes the theme value of the given property
      *
      * @param object {Object} The object to access
      * @param propertyName {String} The name of the property
      */
      deleteThemeValue: function deleteThemeValue(object, propertyName) {
        delete object["$$theme_" + propertyName];
      },

      /*
      -------------------------------------------------------------------------
        THEMED PROPERTY
      -------------------------------------------------------------------------
      */

      /**
       * Sets a themed property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
      * @param value {var} The value to set
       */
      setThemed: function setThemed(object, propertyName, value) {
        var styler = qx.core.Property.$$method.setThemed;
        object[styler[propertyName]](value);
      },

      /**
      * Resets a themed property
      *
      * @param object {Object} The object to access
      * @param propertyName {String} The name of the property
      */
      resetThemed: function resetThemed(object, propertyName) {
        var unstyler = qx.core.Property.$$method.resetThemed;
        object[unstyler[propertyName]]();
      }
    }
  });
  qx.util.PropertyUtil.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.LayoutItem": {}
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
   * Base class for all layout managers.
   *
   * Custom layout manager must derive from
   * this class and implement the methods {@link #invalidateLayoutCache},
   * {@link #renderLayout} and {@link #getSizeHint}.
   */
  qx.Class.define("qx.ui.layout.Abstract", {
    type: "abstract",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {Map} The cached size hint */
      __sizeHint: null,

      /** @type {Boolean} Whether the children cache is valid. This field is protected
       *    because sub classes must be able to access it quickly.
       */
      _invalidChildrenCache: null,

      /** @type {qx.ui.core.Widget} The connected widget */
      __widget: null,

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */

      /**
       * Invalidate all layout relevant caches. Automatically deletes the size hint.
       *
       * @abstract
       */
      invalidateLayoutCache: function invalidateLayoutCache() {
        this.__sizeHint = null;
      },

      /**
       * Applies the children layout.
       *
       * @abstract
       * @param availWidth {Integer} Final width available for the content (in pixel)
       * @param availHeight {Integer} Final height available for the content (in pixel)
       * @param padding {Map} Map containing the padding values. Keys:
       * <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>
       */
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        this.warn("Missing renderLayout() implementation!");
      },

      /**
       * Computes the layout dimensions and possible ranges of these.
       *
       * @return {Map|null} The map with the preferred width/height and the allowed
       *   minimum and maximum values in cases where shrinking or growing
       *   is required. Can also return <code>null</code> when this detection
       *   is not supported by the layout.
       */
      getSizeHint: function getSizeHint() {
        if (this.__sizeHint) {
          return this.__sizeHint;
        }

        return this.__sizeHint = this._computeSizeHint();
      },

      /**
       * Whether the layout manager supports height for width.
       *
       * @return {Boolean} Whether the layout manager supports height for width
       */
      hasHeightForWidth: function hasHeightForWidth() {
        return false;
      },

      /**
       * If layout wants to trade height for width it has to implement this
       * method and return the preferred height if it is resized to
       * the given width. This function returns <code>null</code> if the item
       * do not support height for width.
       *
       * @param width {Integer} The computed width
       * @return {Integer} The desired height
       */
      getHeightForWidth: function getHeightForWidth(width) {
        this.warn("Missing getHeightForWidth() implementation!");
        return null;
      },

      /**
       * This computes the size hint of the layout and returns it.
       *
       * @abstract
       * @return {Map} The size hint.
       */
      _computeSizeHint: function _computeSizeHint() {
        return null;
      },

      /**
       * This method is called, on each child "add" and "remove" action and
       * whenever the layout data of a child is changed. The method should be used
       * to clear any children relevant cached data.
       *
       */
      invalidateChildrenCache: function invalidateChildrenCache() {
        this._invalidChildrenCache = true;
      },

      /**
       * Verifies the value of a layout property.
       *
       * Note: This method is only available in the debug builds.
       *
       * @signature function(item, name, value)
       * @param item {Object} The affected layout item
       * @param name {Object} Name of the layout property
       * @param value {Object} Value of the layout property
       */
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {// empty implementation
      },

      /**
       * Remove all currently visible separators
       */
      _clearSeparators: function _clearSeparators() {
        // It may be that the widget do not implement clearSeparators which is especially true
        // when it do not inherit from LayoutItem.
        var widget = this.__widget;

        if (widget instanceof qx.ui.core.LayoutItem) {
          widget.clearSeparators();
        }
      },

      /**
       * Renders a separator between two children
       *
       * @param separator {String|qx.ui.decoration.IDecorator} The separator to render
       * @param bounds {Map} Contains the left and top coordinate and the width and height
       *    of the separator to render.
       */
      _renderSeparator: function _renderSeparator(separator, bounds) {
        this.__widget.renderSeparator(separator, bounds);
      },

      /**
       * This method is called by the widget to connect the widget with the layout.
       *
       * @param widget {qx.ui.core.Widget} The widget to connect to.
       */
      connectToWidget: function connectToWidget(widget) {
        if (widget && this.__widget) {
          throw new Error("It is not possible to manually set the connected widget.");
        }

        this.__widget = widget; // Invalidate cache

        this.invalidateChildrenCache();
      },

      /**
       * Return the widget that is this layout is responsible for.
       *
       * @return {qx.ui.core.Widget} The widget connected to this layout.
       */
      _getWidget: function _getWidget() {
        return this.__widget;
      },

      /**
       * Indicate that the layout has layout changed and propagate this information
       * up the widget hierarchy.
       *
       * Also a generic property apply method for all layout relevant properties.
       */
      _applyLayoutChange: function _applyLayoutChange() {
        if (this.__widget) {
          this.__widget.scheduleLayoutUpdate();
        }
      },

      /**
       * Returns the list of all layout relevant children.
       *
       * @return {Array} List of layout relevant children.
       */
      _getLayoutChildren: function _getLayoutChildren() {
        return this.__widget.getLayoutChildren();
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__widget = this.__sizeHint = null;
    }
  });
  qx.ui.layout.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "defer": "runtime",
        "require": true
      },
      "qx.core.ObjectRegistry": {},
      "qx.core.Object": {},
      "qx.core.MAssert": {
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
       * Fabian Jakobs (fjakobs)
       * Jonathan Weiß (jonathan_rass)
  
     ======================================================================
  
       This class uses documentation of the native String methods from the MDC
       documentation of Mozilla.
  
       License:
         CC Attribution-Sharealike License:
         http://creativecommons.org/licenses/by-sa/2.5/
  
  ************************************************************************ */

  /**
   * This class emulates the built-in JavaScript String class. It can be used as
   * base class for classes, which need to derive from String.
   *
   * Instances of this class can be used in any place a JavaScript string can.
   */
  qx.Class.define("qx.type.BaseString", {
    extend: Object,

    /**
     * @param txt {String?""} Initialize with this string
     */
    construct: function construct(txt) {
      var txt = txt || ""; // no base call needed

      this.__txt = txt;
      this.length = txt.length;
    },
    members: {
      $$isString: true,
      length: 0,
      __txt: null,

      /**
       * Returns a string representing the specified object.
       *
       * The valueOf method of String returns the primitive value of a String
       * object as a string data type.
       * This method is usually called internally by JavaScript and not
       * explicitly in code.
       *
       * @return {String} A new string containing the string value.
       */
      toString: function toString() {
        return this.__txt;
      },

      /**
       *  Returns the specified character from a string.
       *
       * Characters in a string are indexed from left to right. The index of the
       * first character is 0, and the index of the last character in a string
       * called stringName is stringName.length - 1. If the index you supply is
       * out of range, JavaScript returns an empty string.
       *
       * @signature function(index)
       * @param index {Integer} An integer between 0 and 1 less than the length
       *   of the string.
       * @return {String} The character.
       */
      charAt: null,

      /**
       * Returns the primitive value of a String object.
       *
       * The valueOf method of String returns the primitive value of a String
       * object as a string data type.
       * This method is usually called internally by JavaScript and not
       * explicitly in code.
       *
       * @signature function()
       * @return {String} A new string containing the primitive value.
       */
      valueOf: null,

      /**
       * Returns a number indicating the Unicode value of the character at the given index.
       *
       * @signature function(index)
       * @param index {Integer} An integer greater than 0 and less than the length
       *   of the string; if it is not a number, it defaults to 0.
       * @return {Integer} The number.
       */
      charCodeAt: null,

      /**
       * Combines the text of two or more strings and returns a new string.
       * Changes to the text in one string do not affect the other string.
       *
       * @signature function(stringN)
       * @param stringN {String} One or more strings to be combined.
       * @return {String} The combined string.
       */
      concat: null,

      /**
       * Returns the index within the calling String object of the first
       * occurrence of the specified value, starting the search at fromIndex,
       * returns -1 if the value is not found.
       *
       * @signature function(index, offset)
       * @param index {String} A string representing the value to search for.
       * @param offset {Integer?0} The location within the calling string to start
       *   the search from. It can be any integer between 0 and the length of the
       *   string. The default value is 0.
       * @return {Integer} The index or -1.
       */
      indexOf: null,

      /**
       * Returns the index within the calling String object of the last occurrence
       * of the specified value, or -1 if not found. The calling string is
       * searched backward, starting at fromIndex.
       *
       * @signature function(index, offset)
       * @param index {String} A string representing the value to search for.
       * @param offset {Integer?0} The location within the calling string to start
       *   the search from, indexed from left to right. It can be any integer
       *   between 0 and the length of the string. The default value is the length
       *    of the string.
       * @return {Integer} The index or -1.
       */
      lastIndexOf: null,

      /**
       * Used to retrieve the matches when matching a string against a regular
       * expression.
       *
       * If the regular expression does not include the g flag, returns the same
       * result as regexp.exec(string). If the regular expression includes the g
       * flag, the method returns an Array containing all matches.
       *
       * @signature function(regexp)
       * @param regexp {Object} A regular expression object. If a non-RegExp object
       *  obj is passed, it is implicitly converted to a RegExp by using
       *   new RegExp(obj).
       * @return {Object} The matching RegExp object or an array containing all
       *   matches.
       */
      match: null,

      /**
       * Finds a match between a regular expression and a string, and replaces the
       * matched substring with a new substring.
       *
       * @signature function(regexp, aFunction)
       * @param regexp {Object} A RegExp object. The match is replaced by the
       *   return value of parameter #2. Or a String that is to be replaced by
       *   newSubStr.
       * @param aFunction {Function} A function to be invoked to create the new
       *   substring (to put in place of the substring received from parameter
       *   #1).
       * @return {String} The new substring.
       */
      replace: null,

      /**
       * Executes the search for a match between a regular expression and this
       * String object.
       *
       * If successful, search returns the index of the regular expression inside
       * the string. Otherwise, it returns -1.
       *
       * @signature function(regexp)
       * @param regexp {Object} A regular expression object. If a non-RegExp object
       *  obj is passed, it is implicitly converted to a RegExp by using
       *   new RegExp(obj).
       * @return {Object} The matching RegExp object or -1.
       *   matches.
       */
      search: null,

      /**
       * Extracts a section of a string and returns a new string.
       *
       * Slice extracts the text from one string and returns a new string. Changes
       * to the text in one string do not affect the other string.
       * As a negative index, endSlice indicates an offset from the end of the
       * string.
       *
       * @signature function(beginslice, endSlice)
       * @param beginslice {Integer} The zero-based index at which to begin
       *   extraction.
       * @param endSlice {Integer?null} The zero-based index at which to end
       *   extraction. If omitted, slice extracts to the end of the string.
       * @return {String} The extracted string.
       */
      slice: null,

      /**
       * Splits a String object into an array of strings by separating the string
       * into substrings.
       *
       * When found, separator is removed from the string and the substrings are
       * returned in an array. If separator is omitted, the array contains one
       * element consisting of the entire string.
       *
       * If separator is a regular expression that contains capturing parentheses,
       * then each time separator is matched the results (including any undefined
       * results) of the capturing parentheses are spliced into the output array.
       * However, not all browsers support this capability.
       *
       * Note: When the string is empty, split returns an array containing one
       *
       * @signature function(separator, limit)
       * @param separator {String?null} Specifies the character to use for
       *   separating the string. The separator is treated as a string or a regular
       *   expression. If separator is omitted, the array returned contains one
       *   element consisting of the entire string.
       * @param limit {Integer?null} Integer specifying a limit on the number of
       *   splits to be found.
       * @return {Array} The Array containing substrings.
       */
      split: null,

      /**
       * Returns the characters in a string beginning at the specified location
       * through the specified number of characters.
       *
       * Start is a character index. The index of the first character is 0, and the
       * index of the last character is 1 less than the length of the string. substr
       *  begins extracting characters at start and collects length characters
       * (unless it reaches the end of the string first, in which case it will
       * return fewer).
       * If start is positive and is greater than or equal to the length of the
       * string, substr returns an empty string.
       *
       * @signature function(start, length)
       * @param start {Integer} Location at which to begin extracting characters
       *   (an integer between 0 and one less than the length of the string).
       * @param length {Integer?null} The number of characters to extract.
       * @return {String} The substring.
       */
      substr: null,

      /**
       * Returns a subset of a String object.
       *
       * substring extracts characters from indexA up to but not including indexB.
       * In particular:
       * If indexA equals indexB, substring returns an empty string.
       * If indexB is omitted, substring extracts characters to the end of the
       * string.
       * If either argument is less than 0 or is NaN, it is treated as if it were
       * 0.
       * If either argument is greater than stringName.length, it is treated as if
       * it were stringName.length.
       * If indexA is larger than indexB, then the effect of substring is as if
       * the two arguments were swapped; for example, str.substring(1, 0) == str.substring(0, 1).
       *
       * @signature function(indexA, indexB)
       * @param indexA {Integer} An integer between 0 and one less than the
       *   length of the string.
       * @param indexB {Integer?null} (optional) An integer between 0 and the
       *   length of the string.
       * @return {String} The subset.
       */
      substring: null,

      /**
       * Returns the calling string value converted to lowercase.
       * The toLowerCase method returns the value of the string converted to
       * lowercase. toLowerCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLowerCase: null,

      /**
       * Returns the calling string value converted to uppercase.
       * The toUpperCase method returns the value of the string converted to
       * uppercase. toUpperCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toUpperCase: null,

      /**
       * Return unique hash code of object
       *
       * @return {Integer} unique hash code of the object
       */
      toHashCode: function toHashCode() {
        return qx.core.ObjectRegistry.toHashCode(this);
      },

      /**
       * The characters within a string are converted to lower case while
       * respecting the current locale.
       *
       * The toLowerCase method returns the value of the string converted to
       * lowercase. toLowerCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLocaleLowerCase: null,

      /**
       * The characters within a string are converted to upper case while
       * respecting the current locale.
       * The toUpperCase method returns the value of the string converted to
       * uppercase. toUpperCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLocaleUpperCase: null,

      /**
       * Call the same method of the super class.
       *
       * @param args {arguments} the arguments variable of the calling method
       * @param varags {var} variable number of arguments passed to the overwritten function
       * @return {var} the return value of the method of the base class.
       */
      base: function base(args, varags) {
        return qx.core.Object.prototype.base.apply(this, arguments);
      }
    },

    /*
     *****************************************************************************
        DEFER
     *****************************************************************************
     */
    defer: function defer(statics, members) {
      // add asserts into each debug build
      {
        qx.Class.include(statics, qx.core.MAssert);
      }
      var mappedFunctions = ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'replace', 'search', 'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase', 'toLocaleLowerCase', 'toLocaleUpperCase', 'trim']; // feature/bug detection:
      // Some older Firefox version (<2) break if valueOf is overridden

      members.valueOf = members.toString;

      if (new statics("").valueOf() == null) {
        delete members.valueOf;
      }

      for (var i = 0, l = mappedFunctions.length; i < l; i++) {
        members[mappedFunctions[i]] = String.prototype[mappedFunctions[i]];
      }
    }
  });
  qx.type.BaseString.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.type.BaseString": {
        "construct": true,
        "require": true
      },
      "qx.locale.Manager": {}
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
   * This class contains the translation of a message and all information
   * to translate it again into a different language.
   */
  qx.Class.define("qx.locale.LocalizedString", {
    extend: qx.type.BaseString,

    /**
     * @param translation {String} The translated message
     * @param messageId {String} The messageId to translate
     * @param args {Array} list of arguments passed used as values for format strings
     * @param localized {Boolean} True if the string uses localize instead of translate
     */
    construct: function construct(translation, messageId, args, localized) {
      qx.type.BaseString.constructor.call(this, translation);
      this.__messageId = messageId;
      this.__localized = !!localized;
      this.__args = args;
    },
    members: {
      __localized: null,
      __messageId: null,
      __args: null,

      /**
       * Get a translation of the string using the current locale.
       *
       * @return {qx.locale.LocalizedString|String} This string translated using the current
       *    locale.
       */
      translate: function translate() {
        if (this.__localized) {
          return qx.locale.Manager.getInstance().localize(this.__messageId, this.__args);
        }

        return qx.locale.Manager.getInstance().translate(this.__messageId, this.__args);
      },

      /**
       * Returns the messageId.
       *
       * @return {String} The messageId of this localized String
       */
      getMessageId: function getMessageId() {
        return this.__messageId;
      }
    }
  });
  qx.locale.LocalizedString.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.OperatingSystem": {},
      "qx.lang.Type": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["locale", "locale.variant", "locale.default"],
      "required": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class comes with all relevant information regarding
   * the client's selected locale.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Locale", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * The name of the system locale e.g. "de" when the full locale is "de_AT"
       * @return {String} The current locale
       * @internal
       */
      getLocale: function getLocale() {
        var locale = qx.bom.client.Locale.__getNavigatorLocale();

        var index = locale.indexOf("-");

        if (index != -1) {
          locale = locale.substr(0, index);
        }

        return locale;
      },

      /**
       * The name of the variant for the system locale e.g. "at" when the
       * full locale is "de_AT"
       *
       * @return {String} The locales variant.
       * @internal
       */
      getVariant: function getVariant() {
        var locale = qx.bom.client.Locale.__getNavigatorLocale();

        var variant = "";
        var index = locale.indexOf("-");

        if (index != -1) {
          variant = locale.substr(index + 1);
        }

        return variant;
      },

      /**
       * Internal helper for accessing the navigators language.
       *
       * @return {String} The language set by the navigator.
       */
      __getNavigatorLocale: function __getNavigatorLocale() {
        var locale = navigator.userLanguage || navigator.language || ""; // Android Bug: Android does not return the system language from the
        // navigator language before version 4.4.x. Try to parse the language
        // from the userAgent.
        // See http://code.google.com/p/android/issues/detail?id=4641

        if (qx.bom.client.OperatingSystem.getName() == "android") {
          var version = /^(\d+)\.(\d+)(\..+)?/i.exec(qx.bom.client.OperatingSystem.getVersion());

          if (qx.lang.Type.isArray(version) && version.length >= 3) {
            if (parseInt(version[1]) < 4 || parseInt(version[1]) === 4 && parseInt(version[2]) < 4) {
              var match = /(\w{2})-(\w{2})/i.exec(navigator.userAgent);

              if (match) {
                locale = match[0];
              }
            }
          }
        }

        return locale.toLowerCase();
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("locale", statics.getLocale);
      qx.core.Environment.add("locale.variant", statics.getVariant);
      qx.core.Environment.add("locale.default", "C");
    }
  });
  qx.bom.client.Locale.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.Direct": {
        "require": true
      },
      "qx.locale.LocalizedString": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
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
      "qx.lang.Array": {},
      "qx.bom.client.Locale": {
        "require": true
      },
      "qx.log.Logger": {},
      "qx.lang.String": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "locale": {
          "className": "qx.bom.client.Locale"
        },
        "locale.default": {
          "className": "qx.bom.client.Locale",
          "load": true
        },
        "locale.variant": {
          "className": "qx.bom.client.Locale"
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
   * The qx.locale.Manager provides static translation methods (like tr()) and
   * general locale information.
   *
   * @require(qx.event.dispatch.Direct)
   * @require(qx.locale.LocalizedString)
   *
   * @cldr()
   */
  qx.Class.define("qx.locale.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__translations = qx.$$translations || {};
      this.__locales = qx.$$locales || {};
      this.initLocale();
      this.__clientLocale = this.getLocale();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Translate a message
       *
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      tr: function tr(messageId, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 1);
        return qx.locale.Manager.getInstance().translate(messageId, args);
      },

      /**
       * Translate a plural message
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} singular form if equals 1, otherwise plural
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trn: function trn(singularMessageId, pluralMessageId, count, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 3); // assumes "Two forms, singular used for one only" (seems to be the most common form)
        // (http://www.gnu.org/software/gettext/manual/html_node/gettext_150.html#Plural-forms)
        // closely related with bug #745

        if (count != 1) {
          return qx.locale.Manager.getInstance().translate(pluralMessageId, args);
        } else {
          return qx.locale.Manager.getInstance().translate(singularMessageId, args);
        }
      },

      /**
       * Translate a message with translation hint (from developer addressed to translator).
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trc: function trc(hint, messageId, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 2);
        return qx.locale.Manager.getInstance().translate(messageId, args);
      },

      /**
       * Translate a plural message with translation hint (from developer addressed to translator).
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} singular form if equals 1, otherwise plural
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trnc: function trnc(hint, singularMessageId, pluralMessageId, count, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 4); // see trn()

        if (count != 1) {
          return qx.locale.Manager.getInstance().translate(pluralMessageId, args);
        } else {
          return qx.locale.Manager.getInstance().translate(singularMessageId, args);
        }
      },

      /**
       * Mark the message for translation but return the original message.
       *
       * @param messageId {String} the message ID
       * @return {String} messageId
       */
      marktr: function marktr(messageId) {
        return messageId;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** current locale. locale is an language code like de, de_AT, en, en_GB, fr, ... */
      locale: {
        check: "String",
        apply: "_applyLocale",
        event: "changeLocale",
        init: function () {
          var locale = qx.core.Environment.get("locale");

          if (!locale || locale === "") {
            return qx.core.Environment.get("locale.default");
          }

          var variant = qx.core.Environment.get("locale.variant");

          if (variant !== "") {
            locale += "_" + variant;
          }

          return locale;
        }()
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __defaultLocale: qx.core.Environment.get("locale.default"),
      __locale: null,
      __language: null,
      __translations: null,
      __locales: null,
      __clientLocale: null,

      /**
       * Get the language code of the current locale
       *
       * This is the first part of a locale definition. The language for "de_DE" would be "de"
       *
       * @return {String} language code
       */
      getLanguage: function getLanguage() {
        return this.__language;
      },

      /**
       * Get the territory code of the current locale
       *
       * This is the second part of a locale definition. The territory for "de_DE" would be "DE"
       *
       * @return {String} territory code
       */
      getTerritory: function getTerritory() {
        return this.getLocale().split("_")[1] || "";
      },

      /**
       * Return the available application locales
       *
       * This corresponds to the LOCALES setting in config.json. Without argument,
       * it only returns the currently loaded locales, with an argument of true
       * all locales that went into the build. This is particularly interesting if
       * locales were generated as dedicated I18N parts, and have to be loaded
       * explicitly before being available.
       *
       * @param includeNonloaded {Boolean?null} include locales not yet loaded
       * @return {String[]} array of available locales
       */
      getAvailableLocales: function getAvailableLocales(includeNonloaded) {
        var locales = [];

        for (var locale in this.__locales) {
          if (locale != this.__defaultLocale) {
            if (this.__locales[locale] === null && !includeNonloaded) {
              continue; // skip not yet loaded locales
            }

            locales.push(locale);
          }
        }

        return locales;
      },

      /**
       * Extract the language part from a locale.
       *
       * @param locale {String} locale to be used
       * @return {String} language
       */
      __extractLanguage: function __extractLanguage(locale) {
        var language;

        if (locale == null) {
          return null;
        }

        var pos = locale.indexOf("_");

        if (pos == -1) {
          language = locale;
        } else {
          language = locale.substring(0, pos);
        }

        return language;
      },
      // property apply
      _applyLocale: function _applyLocale(value, old) {
        {
          if (!(value in this.__locales || value == this.__clientLocale)) {
            qx.log.Logger.warn("Locale: " + value + " not available.");
          }
        }
        this.__locale = value;
        this.__language = this.__extractLanguage(value);
      },

      /**
       * Add a translation to the translation manager.
       *
       * If <code>languageCode</code> already exists, its map will be updated with
       * <code>translationMap</code> (new keys will be added, existing keys will be
       * overwritten).
       *
       * @param languageCode {String} language code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
       * @param translationMap {Map} mapping of message identifiers to message strings in the target
       *                             language, e.g. <i>{"greeting_short" : "Hello"}</i>. Plural forms
       *                             are separate keys.
       */
      addTranslation: function addTranslation(languageCode, translationMap) {
        var catalog = this.__translations;

        if (catalog[languageCode]) {
          for (var key in translationMap) {
            catalog[languageCode][key] = translationMap[key];
          }
        } else {
          catalog[languageCode] = translationMap;
        }
      },

      /**
       * Add a localization to the localization manager.
       *
       * If <code>localeCode</code> already exists, its map will be updated with
       * <code>localeMap</code> (new keys will be added, existing keys will be overwritten).
       *
       * @param localeCode {String} locale code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
       * @param localeMap {Map} mapping of locale keys to the target locale values, e.g.
       *                        <i>{"cldr_date_format_short" : "M/d/yy"}</i>.
       */
      addLocale: function addLocale(localeCode, localeMap) {
        var catalog = this.__locales;

        if (catalog[localeCode]) {
          for (var key in localeMap) {
            catalog[localeCode][key] = localeMap[key];
          }
        } else {
          catalog[localeCode] = localeMap;
        }
      },

      /**
       * Translate a message using the current locale and apply format string to the arguments.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      translate: function translate(messageId, args, locale) {
        var catalog = this.__translations;
        return this.__lookupAndExpand(catalog, messageId, args, locale);
      },

      /**
       * Provide localization (CLDR) data.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      localize: function localize(messageId, args, locale) {
        var catalog = this.__locales;
        return this.__lookupAndExpand(catalog, messageId, args, locale);
      },

      /**
       * Look up an I18N key in a catalog and expand format strings.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param catalog {Map} map of I18N keys and their values
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      __lookupAndExpand: function __lookupAndExpand(catalog, messageId, args, locale) {
        {
          this.assertObject(catalog);
          this.assertString(messageId);
          this.assertArray(args);
        }
        var txt;

        if (!catalog) {
          return messageId;
        }

        if (locale) {
          var language = this.__extractLanguage(locale);
        } else {
          locale = this.__locale;
          language = this.__language;
        } // e.g. DE_at


        if (!txt && catalog[locale]) {
          txt = catalog[locale][messageId];
        } // e.g. DE


        if (!txt && catalog[language]) {
          txt = catalog[language][messageId];
        } // C


        if (!txt && catalog[this.__defaultLocale]) {
          txt = catalog[this.__defaultLocale][messageId];
        }

        if (!txt) {
          txt = messageId;
        }

        if (args.length > 0) {
          var translatedArgs = [];

          for (var i = 0; i < args.length; i++) {
            var arg = args[i];

            if (arg && arg.translate) {
              translatedArgs[i] = arg.translate();
            } else {
              translatedArgs[i] = arg;
            }
          }

          txt = qx.lang.String.format(txt, translatedArgs);
        }

        {
          txt = new qx.locale.LocalizedString(txt, messageId, args, catalog === this.__locales);
        }
        return txt;
      }
    }
  });
  qx.locale.Manager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.util.AliasManager": {},
      "qx.theme.manager.Color": {},
      "qx.io.ImageLoader": {},
      "qx.lang.String": {},
      "qx.bom.client.Css": {},
      "qx.html.Image": {},
      "qx.html.Label": {},
      "qx.html.Element": {},
      "qx.util.ResourceManager": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {},
      "qx.bom.element.Decoration": {},
      "qx.lang.Type": {},
      "qx.bom.AnimationFrame": {},
      "qx.theme.manager.Font": {},
      "qx.lang.Object": {},
      "qx.theme.manager.Decoration": {},
      "qx.ui.core.queue.Layout": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.alphaimageloaderneeded": {
          "className": "qx.bom.client.Css"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine",
          "load": true
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * The image class displays an image file
   *
   * This class supports image clipping, which means that multiple images can be combined
   * into one large image and only the relevant part is shown.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var image = new qx.ui.basic.Image("icon/32/actions/format-justify-left.png");
   *
   *   this.getRoot().add(image);
   * </pre>
   *
   * This example create a widget to display the image
   * <code>icon/32/actions/format-justify-left.png</code>.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/image.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.ui.basic.Image", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param source {String?null} The URL of the image to display.
     */
    construct: function construct(source) {
      this.__contentElements = {};
      qx.ui.core.Widget.constructor.call(this);

      if (source) {
        this.setSource(source);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The URL of the image. Setting it will possibly abort loading of current image. */
      source: {
        check: "String",
        init: null,
        nullable: true,
        event: "changeSource",
        apply: "_applySource",
        themeable: true
      },

      /**
       * Whether the image should be scaled to the given dimensions
       *
       * This is disabled by default because it prevents the usage
       * of image clipping when enabled.
       */
      scale: {
        check: "Boolean",
        init: false,
        event: "changeScale",
        themeable: true,
        apply: "_applyScale"
      },
      // overridden
      appearance: {
        refine: true,
        init: "image"
      },
      // overridden
      allowShrinkX: {
        refine: true,
        init: false
      },
      // overridden
      allowShrinkY: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowX: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowY: {
        refine: true,
        init: false
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired if the image source can not be loaded. This event can only be
       * fired for the first loading of an unmanaged resource (external image).
       */
      loadingFailed: "qx.event.type.Event",

      /**
       * Fired if the image has been loaded. This is even true for managed
       * resources (images known by generator).
       */
      loaded: "qx.event.type.Event",

      /** Fired when the pending request has been aborted. */
      aborted: "qx.event.type.Event"
    },
    statics: {
      PLACEHOLDER_IMAGE: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __width: null,
      __height: null,
      __mode: null,
      __contentElements: null,
      __currentContentElement: null,
      __wrapper: null,
      __requestId: 0,
      // overridden
      _onChangeTheme: function _onChangeTheme() {
        qx.ui.basic.Image.prototype._onChangeTheme.base.call(this); // restyle source (theme change might have changed the resolved url)


        this._styleSource();
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      getContentElement: function getContentElement() {
        return this.__getSuitableContentElement();
      },
      // overridden
      _createContentElement: function _createContentElement() {
        return this.__getSuitableContentElement();
      },
      // overridden
      _getContentHint: function _getContentHint() {
        return {
          width: this.__width || 0,
          height: this.__height || 0
        };
      },
      // overridden
      _applyDecorator: function _applyDecorator(value, old) {
        qx.ui.basic.Image.prototype._applyDecorator.base.call(this, value, old);

        var source = this.getSource();
        source = qx.util.AliasManager.getInstance().resolve(source);
        var el = this.getContentElement();

        if (this.__wrapper) {
          el = el.getChild(0);
        }

        this.__setSource(el, source);
      },
      // overridden
      _applyTextColor: function _applyTextColor(value) {
        if (this.__getMode() === "font") {
          var el = this.getContentElement();

          if (this.__wrapper) {
            el = el.getChild(0);
          }

          if (value) {
            el.setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
          } else {
            el.removeStyle("color");
          }
        }
      },
      // overridden
      _applyPadding: function _applyPadding(value, old, name) {
        qx.ui.basic.Image.prototype._applyPadding.base.call(this, value, old, name);

        var element = this.getContentElement();

        if (this.__wrapper) {
          element.getChild(0).setStyles({
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        } else if (this.__getMode() === 'font') {
          element.setStyles({
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        } else {
          element.setPadding(this.getPaddingLeft() || 0, this.getPaddingTop() || 0);
        }
      },
      renderLayout: function renderLayout(left, top, width, height) {
        qx.ui.basic.Image.prototype.renderLayout.base.call(this, left, top, width, height);
        var element = this.getContentElement();

        if (this.__wrapper) {
          element.getChild(0).setStyles({
            width: width - (this.getPaddingLeft() || 0) - (this.getPaddingRight() || 0),
            height: height - (this.getPaddingTop() || 0) - (this.getPaddingBottom() || 0),
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        }
      },

      /*
      ---------------------------------------------------------------------------
        IMAGE API
      ---------------------------------------------------------------------------
      */
      // property apply, overridden
      _applyEnabled: function _applyEnabled(value, old) {
        qx.ui.basic.Image.prototype._applyEnabled.base.call(this, value, old);

        if (this.getSource()) {
          this._styleSource();
        }
      },
      // property apply
      _applySource: function _applySource(value, old) {
        // abort loading current image
        if (old) {
          if (qx.io.ImageLoader.isLoading(old)) {
            qx.io.ImageLoader.abort(old);
          }
        }

        this._styleSource();
      },
      // property apply
      _applyScale: function _applyScale(value) {
        this._styleSource();
      },

      /**
       * Remembers the mode to keep track which contentElement is currently in use.
       * @param mode {String} internal mode (alphaScaled|scaled|nonScaled)
       */
      __setMode: function __setMode(mode) {
        this.__mode = mode;
      },

      /**
       * Returns the current mode if set. Otherwise checks the current source and
       * the current scaling to determine the current mode.
       *
       * @return {String} current internal mode
       */
      __getMode: function __getMode() {
        if (this.__mode == null) {
          var source = this.getSource();

          if (source && qx.lang.String.startsWith(source, "@")) {
            this.__mode = "font";
          }

          var isPng = false;

          if (source != null) {
            isPng = source.endsWith(".png");
          }

          if (this.getScale() && isPng && qx.core.Environment.get("css.alphaimageloaderneeded")) {
            this.__mode = "alphaScaled";
          } else if (this.getScale()) {
            this.__mode = "scaled";
          } else {
            this.__mode = "nonScaled";
          }
        }

        return this.__mode;
      },

      /**
       * Creates a contentElement suitable for the current mode
       *
       * @param mode {String} internal mode
       * @return {qx.html.Image} suitable image content element
       */
      __createSuitableContentElement: function __createSuitableContentElement(mode) {
        var scale;
        var tagName;
        var clazz = qx.html.Image;

        switch (mode) {
          case "font":
            clazz = qx.html.Label;
            scale = true;
            tagName = "div";
            break;

          case "alphaScaled":
            scale = true;
            tagName = "div";
            break;

          case "nonScaled":
            scale = false;
            tagName = "div";
            break;

          default:
            scale = true;
            tagName = "img";
            break;
        }

        var element = new clazz(tagName);
        element.connectWidget(this);
        element.setStyles({
          "overflowX": "hidden",
          "overflowY": "hidden",
          "boxSizing": "border-box"
        });

        if (mode == "font") {
          element.setRich(true);
        } else {
          element.setScale(scale);

          if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
            var wrapper = this.__wrapper = new qx.html.Element("div");
            element.connectWidget(this);
            wrapper.setStyle("position", "absolute");
            wrapper.add(element);
            return wrapper;
          }
        }

        return element;
      },

      /**
       * Returns a contentElement suitable for the current mode
       *
       * @return {qx.html.Image} suitable image contentElement
       */
      __getSuitableContentElement: function __getSuitableContentElement() {
        if (this.$$disposed) {
          return null;
        }

        var mode = this.__getMode();

        if (this.__contentElements[mode] == null) {
          this.__contentElements[mode] = this.__createSuitableContentElement(mode);
        }

        var element = this.__contentElements[mode];

        if (!this.__currentContentElement) {
          this.__currentContentElement = element;
        }

        return element;
      },

      /**
       * Applies the source to the clipped image instance or preload
       * an image to detect sizes and apply it afterwards.
       *
       */
      _styleSource: function _styleSource() {
        var AliasManager = qx.util.AliasManager.getInstance();
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var source = AliasManager.resolve(this.getSource());
        var element = this.getContentElement();

        if (this.__wrapper) {
          element = element.getChild(0);
        }

        if (!source) {
          this.__resetSource(element);

          return;
        }

        this.__checkForContentElementSwitch(source);

        if (qx.core.Environment.get("engine.name") == "mshtml" && (parseInt(qx.core.Environment.get("engine.version"), 10) < 9 || qx.core.Environment.get("browser.documentmode") < 9)) {
          var repeat = this.getScale() ? "scale" : "no-repeat";
          element.tagNameHint = qx.bom.element.Decoration.getTagName(repeat, source);
        }

        var contentEl = this.__getContentElement(); // Detect if the image registry knows this image


        if (ResourceManager.isFontUri(source)) {
          this.__setManagedImage(contentEl, source);

          var color = this.getTextColor();

          if (qx.lang.Type.isString(color)) {
            this._applyTextColor(color, null);
          }
        } else if (ResourceManager.has(source)) {
          var highResolutionSource = ResourceManager.findHighResolutionSource(source);

          if (highResolutionSource) {
            var imageWidth = ResourceManager.getImageWidth(source);
            var imageHeight = ResourceManager.getImageHeight(source);
            this.setWidth(imageWidth);
            this.setHeight(imageHeight); // set background size on current element (div or img)

            var backgroundSize = imageWidth + "px, " + imageHeight + "px";

            this.__currentContentElement.setStyle("background-size", backgroundSize);

            this.setSource(highResolutionSource);
            source = highResolutionSource;
          }

          this.__setManagedImage(contentEl, source);

          this.__fireLoadEvent();
        } else if (qx.io.ImageLoader.isLoaded(source)) {
          this.__setUnmanagedImage(contentEl, source);

          this.__fireLoadEvent();
        } else {
          this.__loadUnmanagedImage(contentEl, source);
        }
      },

      /**
       * Helper function, which fires <code>loaded</code> event asynchronously.
       * It emulates native <code>loaded</code> event of an image object. This
       * helper will be called, if you try to load a managed image or an
       * previously loaded unmanaged image.
       */
      __fireLoadEvent: function __fireLoadEvent() {
        this.__requestId++;
        qx.bom.AnimationFrame.request(function (rId) {
          // prevent firing of the event if source changed in the meantime
          if (rId === this.__requestId) {
            this.fireEvent("loaded");
          } else {
            this.fireEvent("aborted");
          }
        }.bind(this, this.__requestId));
      },

      /**
       * Returns the content element.
       * @return {qx.html.Image} content element
       */
      __getContentElement: function __getContentElement() {
        var contentEl = this.__currentContentElement;

        if (this.__wrapper) {
          contentEl = contentEl.getChild(0);
        }

        return contentEl;
      },

      /**
       * Checks if the current content element is capable to display the image
       * with the current settings (scaling, alpha PNG)
       *
       * @param source {String} source of the image
       */
      __checkForContentElementSwitch: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(source) {
          var alphaImageLoader = qx.core.Environment.get("css.alphaimageloaderneeded");
          var isPng = source.endsWith(".png");
          var isFont = source.startsWith("@");

          if (isFont) {
            this.__setMode("font");
          } else if (alphaImageLoader && isPng) {
            if (this.getScale() && this.__getMode() != "alphaScaled") {
              this.__setMode("alphaScaled");
            } else if (!this.getScale() && this.__getMode() != "nonScaled") {
              this.__setMode("nonScaled");
            }
          } else {
            if (this.getScale() && this.__getMode() != "scaled") {
              this.__setMode("scaled");
            } else if (!this.getScale() && this.__getMode() != "nonScaled") {
              this.__setMode("nonScaled");
            }
          }

          this.__checkForContentElementReplacement(this.__getSuitableContentElement());
        },
        "default": function _default(source) {
          var isFont = source && qx.lang.String.startsWith(source, "@");

          if (isFont) {
            this.__setMode("font");
          } else if (this.getScale() && this.__getMode() != "scaled") {
            this.__setMode("scaled");
          } else if (!this.getScale() && this.__getMode() != "nonScaled") {
            this.__setMode("nonScaled");
          }

          this.__checkForContentElementReplacement(this.__getSuitableContentElement());
        }
      }),

      /**
       * Checks the current child and replaces it if necessary
       *
       * @param elementToAdd {qx.html.Image} content element to add
       */
      __checkForContentElementReplacement: function __checkForContentElementReplacement(elementToAdd) {
        var currentContentElement = this.__currentContentElement;

        if (currentContentElement != elementToAdd) {
          if (currentContentElement != null) {
            var pixel = "px";
            var styles = {}; //inherit styles from current element

            var currentStyles = currentContentElement.getAllStyles();

            if (currentStyles) {
              for (var prop in currentStyles) {
                styles[prop] = currentStyles[prop];
              }
            } // Don't transfer background image when switching from image to icon font


            if (this.__getMode() === "font") {
              delete styles.backgroundImage;
            } // Copy dimension and location of the current content element


            var bounds = this.getBounds();

            if (bounds != null) {
              styles.width = bounds.width + pixel;
              styles.height = bounds.height + pixel;
            }

            var insets = this.getInsets();
            styles.left = parseInt(currentContentElement.getStyle("left") || insets.left) + pixel;
            styles.top = parseInt(currentContentElement.getStyle("top") || insets.top) + pixel;
            styles.zIndex = 10;
            var newEl = this.__wrapper ? elementToAdd.getChild(0) : elementToAdd;
            newEl.setStyles(styles, true);
            newEl.setSelectable(this.getSelectable());

            if (!currentContentElement.isVisible()) {
              elementToAdd.hide();
            } else if (!elementToAdd.isVisible()) {
              elementToAdd.show();
            }

            if (!currentContentElement.isIncluded()) {
              elementToAdd.exclude();
            } else if (!elementToAdd.isIncluded()) {
              elementToAdd.include();
            }

            var container = currentContentElement.getParent();

            if (container) {
              var index = container.getChildren().indexOf(currentContentElement);
              container.removeAt(index);
              container.addAt(elementToAdd, index);
            } // force re-application of source so __setSource is called again


            var hint = newEl.getNodeName();

            if (newEl.setSource) {
              newEl.setSource(null);
            } else {
              newEl.setValue("");
            }

            var currentEl = this.__getContentElement();

            newEl.tagNameHint = hint;
            newEl.setAttribute("class", currentEl.getAttribute("class")); // Flush elements to make sure the DOM elements are created.

            qx.html.Element.flush();
            var currentDomEl = currentEl.getDomElement();
            var newDomEl = elementToAdd.getDomElement(); // copy event listeners

            var listeners = currentContentElement.getListeners() || [];
            listeners.forEach(function (listenerData) {
              elementToAdd.addListener(listenerData.type, listenerData.handler, listenerData.self, listenerData.capture);
            });

            if (currentDomEl && newDomEl) {
              // Switch the DOM elements' hash codes. This is required for the event
              // layer to work [BUG #7447]
              var currentHash = currentDomEl.$$hash;
              currentDomEl.$$hash = newDomEl.$$hash;
              newDomEl.$$hash = currentHash;
            }

            this.__currentContentElement = elementToAdd;
          }
        }
      },

      /**
       * Use the ResourceManager to set a managed image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setManagedImage: function __setManagedImage(el, source) {
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var isFont = ResourceManager.isFontUri(source); // Try to find a disabled image in registry

        if (!this.getEnabled()) {
          var disabled = source.replace(/\.([a-z]+)$/, "-disabled.$1");

          if (!isFont && ResourceManager.has(disabled)) {
            source = disabled;
            this.addState("replacement");
          } else {
            this.removeState("replacement");
          }
        } // Optimize case for enabled changes when no disabled image was found


        if (!isFont && el.getSource() === source) {
          return;
        } // Special case for non resource manager handled font icons


        if (isFont) {
          // Don't use scale if size is set via postfix
          if (this.getScale() && parseInt(source.split("/")[2], 10)) {
            this.setScale(false);
          } // Adjust size if scaling is applied


          var width;
          var height;

          if (this.getScale()) {
            var hint = this.getSizeHint();
            width = this.getWidth() || hint.width;
            height = this.getHeight() || hint.height;
          } else {
            var font = qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]);
            {
              this.assertObject(font, "Virtual image source contains unkown font descriptor");
            }
            var size = parseInt(source.split("/")[2] || font.getSize(), 10);
            width = ResourceManager.getImageWidth(source) || size;
            height = ResourceManager.getImageHeight(source) || size;
          }

          this.__updateContentHint(width, height);

          this.__setSource(el, source); // Apply source

        } else {
          // Apply source
          this.__setSource(el, source); // Compare with old sizes and relayout if necessary


          this.__updateContentHint(ResourceManager.getImageWidth(source), ResourceManager.getImageHeight(source));
        }
      },
      _applyDimension: function _applyDimension() {
        qx.ui.basic.Image.prototype._applyDimension.base.call(this);

        var isFont = this.getSource() && qx.lang.String.startsWith(this.getSource(), "@");

        if (isFont) {
          var el = this.getContentElement();

          if (el) {
            if (this.getScale()) {
              var hint = this.getSizeHint();
              var width = this.getWidth() || hint.width || 40;
              var height = this.getHeight() || hint.height || 40;
              el.setStyle("fontSize", (width > height ? height : width) + "px");
            } else {
              var font = qx.theme.manager.Font.getInstance().resolve(this.getSource().match(/@([^/]+)/)[1]);
              el.setStyle("fontSize", font.getSize() + "px");
            }
          }
        }
      },

      /**
       * Use the infos of the ImageLoader to set an unmanaged image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setUnmanagedImage: function __setUnmanagedImage(el, source) {
        var ImageLoader = qx.io.ImageLoader; // Apply source

        this.__setSource(el, source); // Compare with old sizes and relayout if necessary


        var width = ImageLoader.getWidth(source);
        var height = ImageLoader.getHeight(source);

        this.__updateContentHint(width, height);
      },

      /**
       * Use the ImageLoader to load an unmanaged image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __loadUnmanagedImage: function __loadUnmanagedImage(el, source) {
        var ImageLoader = qx.io.ImageLoader;
        {
          // loading external images via HTTP/HTTPS is a common usecase, as is
          // using data URLs.
          var sourceLC = source.toLowerCase();

          if (!sourceLC.startsWith("http") && !sourceLC.startsWith("data:image/")) {
            var self = qx.ui.basic.Image;

            if (!self.__warned) {
              self.__warned = {};
            }

            if (!self.__warned[source]) {
              this.debug("try to load an unmanaged relative image: " + source);
              self.__warned[source] = true;
            }
          }
        } // only try to load the image if it not already failed

        if (!ImageLoader.isFailed(source)) {
          ImageLoader.load(source, this.__loaderCallback, this);
        } else {
          this.__resetSource(el);
        }
      },

      /**
       * Reset source displayed by the DOM element.
       *
       * @param el {Element} image DOM element
       */
      __resetSource: function __resetSource(el) {
        if (el != null) {
          if (el instanceof qx.html.Image) {
            el.resetSource();
          } else {
            el.resetValue();
          }
        }
      },

      /**
       * Combines the decorator's image styles with our own image to make sure
       * gradient and backgroundImage decorators work on Images.
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setSource: function __setSource(el, source) {
        var isFont = source && qx.lang.String.startsWith(source, "@");

        if (isFont) {
          var sparts = source.split("/");
          var fontSource = source;

          if (sparts.length > 2) {
            fontSource = sparts[0] + "/" + sparts[1];
          }

          var ResourceManager = qx.util.ResourceManager.getInstance();
          var font = qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]);
          var fontStyles = qx.lang.Object.clone(font.getStyles());
          delete fontStyles.color;
          el.setStyles(fontStyles);
          el.setStyle("font");
          el.setStyle("display", "table-cell");
          el.setStyle("verticalAlign", "middle");
          el.setStyle("textAlign", "center");

          if (this.getScale()) {
            el.setStyle("fontSize", (this.__width > this.__height ? this.__height : this.__width) + "px");
          } else {
            var size = parseInt(sparts[2] || qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]).getSize());
            el.setStyle("fontSize", size + "px");
          }

          var resource = ResourceManager.getData(fontSource);

          if (resource) {
            el.setValue(String.fromCharCode(resource[2]));
          } else {
            var charCode = parseInt(qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)\/(.*)$/)[2]), 16);
            {
              this.assertNumber(charCode, "Font source needs either a glyph name or the unicode number in hex");
            }
            el.setValue(String.fromCharCode(charCode));
          }

          return;
        } else if (el.getNodeName() == "div") {
          // checks if a decorator already set.
          // In this case we have to merge background styles
          var decorator = qx.theme.manager.Decoration.getInstance().resolve(this.getDecorator());

          if (decorator) {
            var hasGradient = decorator.getStartColor() && decorator.getEndColor();
            var hasBackground = decorator.getBackgroundImage();

            if (hasGradient || hasBackground) {
              var repeat = this.getScale() ? "scale" : "no-repeat"; // get the style attributes for the given source

              var attr = qx.bom.element.Decoration.getAttributes(source, repeat); // get the background image(s) defined by the decorator

              var decoratorStyle = decorator.getStyles(true);
              var combinedStyles = {
                "backgroundImage": attr.style.backgroundImage,
                "backgroundPosition": attr.style.backgroundPosition || "0 0",
                "backgroundRepeat": attr.style.backgroundRepeat || "no-repeat"
              };

              if (hasBackground) {
                combinedStyles["backgroundPosition"] += "," + decoratorStyle["background-position"] || "0 0";
                combinedStyles["backgroundRepeat"] += ", " + decorator.getBackgroundRepeat();
              }

              if (hasGradient) {
                combinedStyles["backgroundPosition"] += ", 0 0";
                combinedStyles["backgroundRepeat"] += ", no-repeat";
              }

              combinedStyles["backgroundImage"] += "," + (decoratorStyle["background-image"] || decoratorStyle["background"]); // apply combined background images

              el.setStyles(combinedStyles);
              return;
            }
          } else {
            // force re-apply to remove old decorator styles
            if (el.setSource) {
              el.setSource(null);
            }
          }
        }

        if (el.setSource) {
          el.setSource(source);
        }
      },

      /**
       * Event handler fired after the preloader has finished loading the icon
       *
       * @param source {String} Image source which was loaded
       * @param imageInfo {Map} Dimensions of the loaded image
       */
      __loaderCallback: function __loaderCallback(source, imageInfo) {
        // Ignore the callback on already disposed images
        if (this.$$disposed === true) {
          return;
        } // Ignore when the source has already been modified


        if (source !== qx.util.AliasManager.getInstance().resolve(this.getSource())) {
          this.fireEvent("aborted");
          return;
        } /// Output a warning if the image could not loaded and quit


        if (imageInfo.failed) {
          this.warn("Image could not be loaded: " + source);
          this.fireEvent("loadingFailed");
        } else if (imageInfo.aborted) {
          this.fireEvent("aborted");
          return;
        } else {
          this.fireEvent("loaded");
        } // Update image


        this.__setUnmanagedImage(this.__getContentElement(), source);
      },

      /**
       * Updates the content hint when the image size has been changed
       *
       * @param width {Integer} width of the image
       * @param height {Integer} height of the image
       */
      __updateContentHint: function __updateContentHint(width, height) {
        // Compare with old sizes and relayout if necessary
        if (width !== this.__width || height !== this.__height) {
          this.__width = width;
          this.__height = height;
          qx.ui.core.queue.Layout.add(this);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      for (var mode in this.__contentElements) {
        if (this.__contentElements.hasOwnProperty(mode)) {
          this.__contentElements[mode].disconnectWidget(this);
        }
      }

      delete this.__currentContentElement;

      if (this.__wrapper) {
        delete this.__wrapper;
      }

      this._disposeMap("__contentElements");
    }
  });
  qx.ui.basic.Image.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Image": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MPlacement": {
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
   * This widget is used as feedback widget in drag and drop actions.
   */
  qx.Class.define("qx.ui.core.DragDropCursor", {
    extend: qx.ui.basic.Image,
    include: qx.ui.core.MPlacement,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.basic.Image.constructor.call(this); // Put above other stuff

      this.setZIndex(1e8); // Move using DOM

      this.setDomMove(true); // Automatically add to root

      var root = this.getApplicationRoot();
      root.add(this, {
        left: -1000,
        top: -1000
      });
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "dragdrop-cursor"
      },

      /** The current drag&drop action */
      action: {
        check: ["alias", "copy", "move"],
        apply: "_applyAction",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    members: {
      // property apply
      _applyAction: function _applyAction(value, old) {
        if (old) {
          this.removeState(old);
        }

        if (value) {
          this.addState(value);
        }
      }
    }
  });
  qx.ui.core.DragDropCursor.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "construct": true,
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.theme.manager.Meta": {
        "construct": true
      },
      "qx.theme.manager.Color": {},
      "qx.event.Registration": {},
      "qx.event.handler.Focus": {},
      "qx.ui.core.Widget": {},
      "qx.html.Blocker": {},
      "qx.event.type.Event": {},
      "qx.ui.core.FocusHandler": {}
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
   * This class blocks events and can be included into all widgets.
   *
   * The {@link #block} and {@link #unblock} methods provided by this class can be used
   * to block any event from the widget. When blocked,
   * the blocker widget overlays the widget to block, including the padding area.
   *
   * @ignore(qx.ui.root.Abstract)
   */
  qx.Class.define("qx.ui.core.Blocker", {
    extend: qx.core.Object,
    events: {
      /**
       * Fires after {@link #block} executed.
       */
      blocked: "qx.event.type.Event",

      /**
       * Fires after {@link #unblock} executed.
       */
      unblocked: "qx.event.type.Event"
    },

    /**
     * Creates a blocker for the passed widget.
     *
     * @param widget {qx.ui.core.Widget} Widget which should be added the blocker
     */
    construct: function construct(widget) {
      qx.core.Object.constructor.call(this);
      this._widget = widget;
      widget.addListener("resize", this.__onBoundsChange, this);
      widget.addListener("move", this.__onBoundsChange, this);
      widget.addListener("disappear", this.__onWidgetDisappear, this);

      if (qx.Class.isDefined("qx.ui.root.Abstract") && widget instanceof qx.ui.root.Abstract) {
        this._isRoot = true;
        this.setKeepBlockerActive(true);
      } // dynamic theme switch


      {
        qx.theme.manager.Meta.getInstance().addListener("changeTheme", this._onChangeTheme, this);
      }
      this.__activeElements = [];
      this.__focusElements = [];
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Color of the blocker
       */
      color: {
        check: "Color",
        init: null,
        nullable: true,
        apply: "_applyColor",
        themeable: true
      },

      /**
       * Opacity of the blocker
       */
      opacity: {
        check: "Number",
        init: 1,
        apply: "_applyOpacity",
        themeable: true
      },

      /**
       * If this property is enabled, the blocker created with {@link #block}
       * will always stay activated. This means that the blocker then gets all keyboard
       * events, this is useful to block keyboard input on other widgets.
       * Take care that only one blocker instance will be kept active, otherwise your
       * browser will freeze.
       *
       * Setting this property to true is ignored, if the blocker is attached to a
       * widget with a focus handler, as this would mean that the focus handler
       * tries to activate the widget behind the blocker.
       *
       * fixes:
       *     https://github.com/qooxdoo/qooxdoo/issues/9449
       *     https://github.com/qooxdoo/qooxdoo/issues/8104
       */
      keepBlockerActive: {
        check: "Boolean",
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __blocker: null,
      __blockerCount: 0,
      __activeElements: null,
      __focusElements: null,
      __timer: null,
      _widget: null,
      _isRoot: false,
      __appearListener: null,

      /**
       * Adjust html element size on layout resizes.
       *
       * @param e {qx.event.type.Data} event object
       */
      __onBoundsChange: function __onBoundsChange(e) {
        var data = e.getData();

        if (this.isBlocked()) {
          this._updateBlockerBounds(data);
        }
      },

      /**
       * Widget re-appears: Update blocker size/position and attach to (new) parent
       */
      __onWidgetAppear: function __onWidgetAppear() {
        this._updateBlockerBounds(this._widget.getBounds());

        if (this._widget.isRootWidget()) {
          this._widget.getContentElement().add(this.getBlockerElement());
        } else {
          this._widget.getLayoutParent().getContentElement().add(this.getBlockerElement());
        }
      },

      /**
       * Remove the blocker if the widget disappears
       */
      __onWidgetDisappear: function __onWidgetDisappear() {
        if (this.isBlocked()) {
          this.getBlockerElement().getParent().remove(this.getBlockerElement());

          this._widget.addListenerOnce("appear", this.__onWidgetAppear, this);
        }
      },

      /**
       * set the blocker's size and position
       * @param bounds {Map} Map with the new width, height, left and top values
       */
      _updateBlockerBounds: function _updateBlockerBounds(bounds) {
        this.getBlockerElement().setStyles({
          width: bounds.width + "px",
          height: bounds.height + "px",
          left: bounds.left + "px",
          top: bounds.top + "px"
        });
      },
      // property apply
      _applyColor: function _applyColor(value, old) {
        var color = qx.theme.manager.Color.getInstance().resolve(value);

        this.__setBlockersStyle("backgroundColor", color);
      },
      // property apply
      _applyOpacity: function _applyOpacity(value, old) {
        this.__setBlockersStyle("opacity", value);
      },

      /**
       * Handler for the theme change.
       * @signature function()
       */
      _onChangeTheme: function _onChangeTheme() {
        this._applyColor(this.getColor());
      },

      /**
       * Set the style to all blockers (blocker and content blocker).
       *
       * @param key {String} The name of the style attribute.
       * @param value {String} The value.
       */
      __setBlockersStyle: function __setBlockersStyle(key, value) {
        var blockers = [];
        this.__blocker && blockers.push(this.__blocker);

        for (var i = 0; i < blockers.length; i++) {
          blockers[i].setStyle(key, value);
        }
      },

      /**
       * Backup the current active and focused widget.
       */
      _backupActiveWidget: function _backupActiveWidget() {
        var focusHandler = qx.event.Registration.getManager(window).getHandler(qx.event.handler.Focus);
        var activeWidget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getActive());
        var focusedWidget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getFocus());

        this.__activeElements.push(activeWidget);

        this.__focusElements.push(focusedWidget);

        if (activeWidget) {
          activeWidget.deactivate();
        }

        if (focusedWidget && focusedWidget.isFocusable()) {
          focusedWidget.blur();
        }
      },

      /**
       * Restore the current active and focused widget.
       */
      _restoreActiveWidget: function _restoreActiveWidget() {
        var widget;
        var focusElementsLength = this.__focusElements.length;

        if (focusElementsLength > 0) {
          widget = this.__focusElements.pop();

          if (widget && !widget.isDisposed() && widget.isFocusable()) {
            widget.focus();
          }
        }

        var activeElementsLength = this.__activeElements.length;

        if (activeElementsLength > 0) {
          widget = this.__activeElements.pop();

          if (widget && !widget.isDisposed()) {
            widget.activate();
          }
        }
      },

      /**
       * Creates the blocker element.
       *
       * @return {qx.html.Element} The blocker element
       */
      __createBlockerElement: function __createBlockerElement() {
        return new qx.html.Blocker(this.getColor(), this.getOpacity());
      },

      /**
       * Get/create the blocker element
       *
       * @param widget {qx.ui.core.Widget} The blocker will be added to this
       * widget's content element
       * @return {qx.html.Element} The blocker element
       */
      getBlockerElement: function getBlockerElement(widget) {
        if (!this.__blocker) {
          this.__blocker = this.__createBlockerElement();

          this.__blocker.setStyle("zIndex", 15);

          if (!widget) {
            if (this._isRoot) {
              widget = this._widget;
            } else {
              widget = this._widget.getLayoutParent();
            }
          }

          widget.getContentElement().add(this.__blocker);

          this.__blocker.exclude();
        }

        return this.__blocker;
      },

      /**
       * Block all events from this widget by placing a transparent overlay widget,
       * which receives all events, exactly over the widget.
       */
      block: function block() {
        this._block();
      },

      /**
       * Adds the blocker to the appropriate element and includes it.
       *
       * @param zIndex {Number} All child widgets with a zIndex below this value will be blocked
       * @param blockContent {Boolean} append the blocker to the widget's content if true
       */
      _block: function _block(zIndex, blockContent) {
        if (!this._isRoot && !this._widget.getLayoutParent()) {
          this.__appearListener = this._widget.addListenerOnce("appear", this._block.bind(this, zIndex));
          return;
        }

        var parent;

        if (this._isRoot || blockContent) {
          parent = this._widget;
        } else {
          parent = this._widget.getLayoutParent();
        }

        var blocker = this.getBlockerElement(parent);

        if (zIndex != null) {
          blocker.setStyle("zIndex", zIndex);
        }

        this.__blockerCount++;

        if (this.__blockerCount < 2) {
          this._backupActiveWidget();

          var bounds = this._widget.getBounds(); // no bounds -> widget not yet rendered -> bounds will be set on resize


          if (bounds) {
            this._updateBlockerBounds(bounds);
          }

          blocker.include();

          if (!blockContent) {
            blocker.activate();
          }

          blocker.addListener("deactivate", this.__activateBlockerElement, this);
          blocker.addListener("keypress", this.__stopTabEvent, this);
          blocker.addListener("keydown", this.__stopTabEvent, this);
          blocker.addListener("keyup", this.__stopTabEvent, this);
          this.fireEvent("blocked", qx.event.type.Event);
        }
      },

      /**
       * Returns whether the widget is blocked.
       *
       * @return {Boolean} Whether the widget is blocked.
       */
      isBlocked: function isBlocked() {
        return this.__blockerCount > 0;
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it takes care of
       * the amount of {@link #block} calls. The blocker is only removed if
       * the number of {@link #unblock} calls is identical to {@link #block} calls.
       */
      unblock: function unblock() {
        if (this.__appearListener) {
          this._widget.removeListenerById(this.__appearListener);
        }

        if (!this.isBlocked()) {
          return;
        }

        this.__blockerCount--;

        if (this.__blockerCount < 1) {
          this.__unblock();

          this.__blockerCount = 0;
        }
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it doesn't take care of
       * the amount of {@link #block} calls. The blocker is directly removed.
       */
      forceUnblock: function forceUnblock() {
        if (!this.isBlocked()) {
          return;
        }

        this.__blockerCount = 0;

        this.__unblock();
      },

      /**
       * Unblock the widget blocked by {@link #block}.
       */
      __unblock: function __unblock() {
        this._restoreActiveWidget();

        var blocker = this.getBlockerElement();
        blocker.removeListener("deactivate", this.__activateBlockerElement, this);
        blocker.removeListener("keypress", this.__stopTabEvent, this);
        blocker.removeListener("keydown", this.__stopTabEvent, this);
        blocker.removeListener("keyup", this.__stopTabEvent, this);
        blocker.exclude();
        this.fireEvent("unblocked", qx.event.type.Event);
      },

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this._block(zIndex, true);
      },

      /**
       * Stops the passed "Tab" event.
       *
       * @param e {qx.event.type.KeySequence} event to stop.
       */
      __stopTabEvent: function __stopTabEvent(e) {
        if (e.getKeyIdentifier() == "Tab") {
          e.stop();
        }
      },

      /**
       * Sets the blocker element to active.
       */
      __activateBlockerElement: function __activateBlockerElement() {
        //
        // If this._widget is attached to the focus handler as a focus root,
        // activating the blocker after this widget was deactivated,
        // leads to the focus handler re-activate the widget behind
        // the blocker, loosing tab handling for this._widget which is
        // visually in front. Hence we prevent activating the
        // blocker in this situation.
        //
        // fixes:
        //  https://github.com/qooxdoo/qooxdoo/issues/9449
        //  https://github.com/qooxdoo/qooxdoo/issues/8104
        //
        if (this.getKeepBlockerActive() && !qx.ui.core.FocusHandler.getInstance().isFocusRoot(this._widget)) {
          this.getBlockerElement().activate();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // remove dynamic theme listener
      {
        qx.theme.manager.Meta.getInstance().removeListener("changeTheme", this._onChangeTheme, this);
      }

      this._widget.removeListener("resize", this.__onBoundsChange, this);

      this._widget.removeListener("move", this.__onBoundsChange, this);

      this._widget.removeListener("appear", this.__onWidgetAppear, this);

      this._widget.removeListener("disappear", this.__onWidgetDisappear, this);

      if (this.__appearListener) {
        this._widget.removeListenerById(this.__appearListener);
      }

      this._disposeObjects("__blocker", "__timer");

      this.__activeElements = this.__focusElements = this._widget = null;
    }
  });
  qx.ui.core.Blocker.$$dbClassInfo = $$dbClassInfo;
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
      },
      "qx.ui.layout.Util": {},
      "qx.lang.Type": {}
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
   * The Canvas is an extended Basic layout.
   *
   * It is possible to position a widget relative to the right or bottom edge of
   * the available space. It further supports stretching between left and right
   * or top and bottom e.g. <code>left=20</code> and <code>right=20</code> would
   * keep a margin of 20 pixels to both edges. The Canvas layout has support for
   * percent dimensions and locations.
   *
   * *Features*
   *
   * * Pixel dimensions and locations
   * * Percent dimensions and locations
   * * Stretching between left+right and top+bottom
   * * Minimum and maximum dimensions
   * * Children are automatically shrunk to their minimum dimensions if not enough space is available
   * * Auto sizing (ignoring percent values)
   * * Margins (also negative ones)
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>left</strong> <em>(Integer|String)</em>: The left coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>top</strong> <em>(Integer|String)</em>: The top coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>right</strong> <em>(Integer|String)</em>: The right coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>bottom</strong> <em>(Integer|String)</em>: The bottom coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>edge</strong> <em>(Integer|String)</em>: The coordinate in pixels or as a percent string to be used for all four edges.
   * <li><strong>width</strong> <em>(String)</em>: A percent width e.g. <code>40%</code>.</li>
   * <li><strong>height</strong> <em>(String)</em>: A percent height e.g. <code>60%</code>.</li>
   * </ul>
   *
   * *Notes*
   *
   * <ul>
   * <li>Stretching (<code>left</code>-><code>right</code> or <code>top</code>-><code>bottom</code>)
   *   has a higher priority than the preferred dimensions</li>
   * <li>Stretching has a lower priority than the min/max dimensions.</li>
   * <li>Percent values have no influence on the size hint of the layout.</li>
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the canvas layout.
   *
   * <pre class="javascript">
   * var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
   *
   * // simple positioning
   * container.add(new qx.ui.core.Widget(), {top: 10, left: 10});
   *
   * // stretch vertically with 10 pixel distance to the parent's top
   * // and bottom border
   * container.add(new qx.ui.core.Widget(), {top: 10, left: 10, bottom: 10});
   *
   * // percent positioning and size
   * container.add(new qx.ui.core.Widget(), {left: "50%", top: "50%", width: "25%", height: "40%"});
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/canvas.html'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Canvas", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * If desktop mode is active, the children's minimum sizes are ignored
       * by the layout calculation. This is necessary to prevent the desktop
       * from growing if e.g. a window is moved beyond the edge of the desktop
       */
      desktop: {
        check: "Boolean",
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
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        var layoutProperties = {
          top: 1,
          left: 1,
          bottom: 1,
          right: 1,
          width: 1,
          height: 1,
          edge: 1
        };
        this.assert(layoutProperties[name] == 1, "The property '" + name + "' is not supported by the Canvas layout!");

        if (name == "width" || name == "height") {
          this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
        } else {
          if (typeof value === "number") {
            this.assertInteger(value);
          } else if (qx.lang.Type.isString(value)) {
            this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
          } else {
            this.fail("Bad format of layout property '" + name + "': " + value + ". The value must be either an integer or an percent string.");
          }
        }
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child, size, props;
        var left, top, right, bottom, width, height;
        var marginTop, marginRight, marginBottom, marginLeft;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          props = child.getLayoutProperties(); // Cache margins

          marginTop = child.getMarginTop();
          marginRight = child.getMarginRight();
          marginBottom = child.getMarginBottom();
          marginLeft = child.getMarginLeft(); // **************************************
          //   Processing location
          // **************************************

          left = props.left != null ? props.left : props.edge;

          if (qx.lang.Type.isString(left)) {
            left = Math.round(parseFloat(left) * availWidth / 100);
          }

          right = props.right != null ? props.right : props.edge;

          if (qx.lang.Type.isString(right)) {
            right = Math.round(parseFloat(right) * availWidth / 100);
          }

          top = props.top != null ? props.top : props.edge;

          if (qx.lang.Type.isString(top)) {
            top = Math.round(parseFloat(top) * availHeight / 100);
          }

          bottom = props.bottom != null ? props.bottom : props.edge;

          if (qx.lang.Type.isString(bottom)) {
            bottom = Math.round(parseFloat(bottom) * availHeight / 100);
          } // **************************************
          //   Processing dimension
          // **************************************
          // Stretching has higher priority than dimension data


          if (left != null && right != null) {
            width = availWidth - left - right - marginLeft - marginRight; // Limit computed value

            if (width < size.minWidth) {
              width = size.minWidth;
            } else if (width > size.maxWidth) {
              width = size.maxWidth;
            } // Add margin


            left += marginLeft;
          } else {
            // Layout data has higher priority than data from size hint
            width = props.width;

            if (width == null) {
              width = size.width;
            } else {
              width = Math.round(parseFloat(width) * availWidth / 100); // Limit computed value

              if (width < size.minWidth) {
                width = size.minWidth;
              } else if (width > size.maxWidth) {
                width = size.maxWidth;
              }
            }

            if (right != null) {
              left = availWidth - width - right - marginRight - marginLeft;
            } else if (left == null) {
              left = marginLeft;
            } else {
              left += marginLeft;
            }
          } // Stretching has higher priority than dimension data


          if (top != null && bottom != null) {
            height = availHeight - top - bottom - marginTop - marginBottom; // Limit computed value

            if (height < size.minHeight) {
              height = size.minHeight;
            } else if (height > size.maxHeight) {
              height = size.maxHeight;
            } // Add margin


            top += marginTop;
          } else {
            // Layout data has higher priority than data from size hint
            height = props.height;

            if (height == null) {
              height = size.height;
            } else {
              height = Math.round(parseFloat(height) * availHeight / 100); // Limit computed value

              if (height < size.minHeight) {
                height = size.minHeight;
              } else if (height > size.maxHeight) {
                height = size.maxHeight;
              }
            }

            if (bottom != null) {
              top = availHeight - height - bottom - marginBottom - marginTop;
            } else if (top == null) {
              top = marginTop;
            } else {
              top += marginTop;
            }
          }

          left += padding.left;
          top += padding.top; // Apply layout

          child.renderLayout(left, top, width, height);
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var neededWidth = 0,
            neededMinWidth = 0;
        var neededHeight = 0,
            neededMinHeight = 0;
        var width, minWidth;
        var height, minHeight;

        var children = this._getLayoutChildren();

        var child, props, hint;
        var desktop = this.isDesktop();
        var left, top, right, bottom;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          props = child.getLayoutProperties();
          hint = child.getSizeHint(); // Cache margins

          var marginX = child.getMarginLeft() + child.getMarginRight();
          var marginY = child.getMarginTop() + child.getMarginBottom(); // Compute width

          width = hint.width + marginX;
          minWidth = hint.minWidth + marginX;
          left = props.left != null ? props.left : props.edge;

          if (left && typeof left === "number") {
            width += left;
            minWidth += left;
          }

          right = props.right != null ? props.right : props.edge;

          if (right && typeof right === "number") {
            width += right;
            minWidth += right;
          }

          neededWidth = Math.max(neededWidth, width);
          neededMinWidth = desktop ? 0 : Math.max(neededMinWidth, minWidth); // Compute height

          height = hint.height + marginY;
          minHeight = hint.minHeight + marginY;
          top = props.top != null ? props.top : props.edge;

          if (top && typeof top === "number") {
            height += top;
            minHeight += top;
          }

          bottom = props.bottom != null ? props.bottom : props.edge;

          if (bottom && typeof bottom === "number") {
            height += bottom;
            minHeight += bottom;
          }

          neededHeight = Math.max(neededHeight, height);
          neededMinHeight = desktop ? 0 : Math.max(neededMinHeight, minHeight);
        }

        return {
          width: neededWidth,
          minWidth: neededMinWidth,
          height: neededHeight,
          minHeight: neededMinHeight
        };
      }
    }
  });
  qx.ui.layout.Canvas.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.html.Element": {
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
   * This is the root element for a set of {@link qx.html.Element}s.
   *
   * To make other elements visible these elements must be inserted
   * into an root element at any level.
   *
   * A root element uses an existing DOM element where is assumed that
   * this element is always visible. In the easiest case, the root element
   * is identical to the document's body.
   */
  qx.Class.define("qx.html.Root", {
    extend: qx.html.Element,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Creates a root element
     *
     * @param elem {Element?null} DOM element to use
     */
    construct: function construct(elem) {
      qx.html.Element.constructor.call(this);

      if (elem != null) {
        this.useElement(elem);
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Sets the element to an already existing node. It will be
       * assumed that this DOM element is already visible e.g.
       * like a normal displayed element in the document's body.
       *
       * @param elem {Element} the dom element to set
       * @throws {Error} if the element is assigned again
       */
      useElement: function useElement(elem) {
        // Base call
        qx.html.Root.prototype.useElement.base.call(this, elem); // Mark as root

        this.setRoot(true); // Register for synchronization

        qx.html.Element._modified[this.$$hash] = this;
      }
    }
  });
  qx.html.Root.$$dbClassInfo = $$dbClassInfo;
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Adrian Olaru (adrianolaru)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Cross-Browser Split
       http://blog.stevenlevithan.com/archives/cross-browser-split
       Version 1.0.1
  
       Copyright:
         (c) 2006-2007, Steven Levithan <http://stevenlevithan.com>
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Steven Levithan
  
  ************************************************************************ */

  /**
   * Implements an ECMA-compliant, uniform cross-browser split method
   */
  qx.Bootstrap.define("qx.util.StringSplit", {
    statics: {
      /**
       * ECMA-compliant, uniform cross-browser split method
       *
       * @param str {String} Incoming string to split
       * @param separator {RegExp} Specifies the character to use for separating the string.
       *   The separator is treated as a string or a  regular expression. If separator is
       *   omitted, the array returned contains one element consisting of the entire string.
       * @param limit {Integer?} Integer specifying a limit on the number of splits to be found.
       * @return {String[]} split string
       */
      split: function split(str, separator, limit) {
        // if `separator` is not a regex, use the native `split`
        if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
          return String.prototype.split.call(str, separator, limit);
        }

        var output = [],
            lastLastIndex = 0,
            flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.sticky ? "y" : ""),
            separator = RegExp(separator.source, flags + "g"),
            // make `global` and avoid `lastIndex` issues by working with a copy
        separator2,
            match,
            lastIndex,
            lastLength,
            compliantExecNpcg = /()??/.exec("")[1] === undefined; // NPCG: nonparticipating capturing group

        str = str + ""; // type conversion

        if (!compliantExecNpcg) {
          separator2 = RegExp("^" + separator.source + "$(?!\\s)", flags); // doesn't need /g or /y, but they don't hurt
        }
        /* behavior for `limit`: if it's...
        - `undefined`: no limit.
        - `NaN` or zero: return an empty array.
        - a positive number: use `Math.floor(limit)`.
        - a negative number: no limit.
        - other: type-convert, then use the above rules. */


        if (limit === undefined || +limit < 0) {
          limit = Infinity;
        } else {
          limit = Math.floor(+limit);

          if (!limit) {
            return [];
          }
        }

        while (match = separator.exec(str)) {
          lastIndex = match.index + match[0].length; // `separator.lastIndex` is not reliable cross-browser

          if (lastIndex > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index)); // fix browsers whose `exec` methods don't consistently return `undefined` for nonparticipating capturing groups

            if (!compliantExecNpcg && match.length > 1) {
              match[0].replace(separator2, function () {
                for (var i = 1; i < arguments.length - 2; i++) {
                  if (arguments[i] === undefined) {
                    match[i] = undefined;
                  }
                }
              });
            }

            if (match.length > 1 && match.index < str.length) {
              Array.prototype.push.apply(output, match.slice(1));
            }

            lastLength = match[0].length;
            lastLastIndex = lastIndex;

            if (output.length >= limit) {
              break;
            }
          }

          if (separator.lastIndex === match.index) {
            separator.lastIndex++; // avoid an infinite loop
          }
        }

        if (lastLastIndex === str.length) {
          if (lastLength || !separator.test("")) {
            output.push("");
          }
        } else {
          output.push(str.slice(lastLastIndex));
        }

        return output.length > limit ? output.slice(0, limit) : output;
      }
    }
  });
  qx.util.StringSplit.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-6.js.map
