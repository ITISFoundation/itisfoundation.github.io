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
      },
      "qx.bom.Iframe": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A cross browser iframe instance.
   */
  qx.Class.define("qx.html.Iframe", {
    extend: qx.html.Element,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Wrapper for the HTML Iframe element.
     * @param url {String} Location which should be loaded inside the Iframe.
     * @param styles {Map?null} optional map of CSS styles, where the key is the name
     *    of the style and the value is the value to use.
     * @param attributes {Map?null} optional map of element attributes, where the
     *    key is the name of the attribute and the value is the value to use.
     */
    construct: function construct(url, styles, attributes) {
      qx.html.Element.constructor.call(this, "iframe", styles, attributes);
      this.setSource(url);
      this.addListener("navigate", this.__onNavigate, this); // add yourself to the element queue to enforce the creation of DOM element

      qx.html.Element._modified[this.$$hash] = this;

      qx.html.Element._scheduleFlush("element");
    },

    /*
     *****************************************************************************
        EVENTS
     *****************************************************************************
     */
    events: {
      /**
       * The "load" event is fired after the iframe content has successfully been loaded.
       */
      "load": "qx.event.type.Event",

      /**
      * The "navigate" event is fired whenever the location of the iframe
      * changes.
      *
      * Useful to track user navigation and internally used to keep the source
      * property in sync. Only works when the destination source is of same
      * origin than the page embedding the iframe.
      */
      "navigate": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        ELEMENT API
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyProperty: function _applyProperty(name, value) {
        qx.html.Iframe.prototype._applyProperty.base.call(this, name, value);

        if (name == "source") {
          var element = this.getDomElement();
          var currentUrl = qx.bom.Iframe.queryCurrentUrl(element); // Skip if frame is already on URL.
          //
          // When URL of Iframe and source property get out of sync, the source
          // property needs to be updated [BUG #4481]. This is to make sure the
          // same source is not set twice on the BOM level.

          if (value === currentUrl) {
            return;
          }

          qx.bom.Iframe.setSource(element, value);
        }
      },
      // overridden
      _createDomElement: function _createDomElement() {
        return qx.bom.Iframe.create(this._content);
      },

      /*
      ---------------------------------------------------------------------------
        IFRAME API
      ---------------------------------------------------------------------------
      */

      /**
       * Get the DOM window object of an iframe.
       *
       * @return {Window} The DOM window object of the iframe.
       */
      getWindow: function getWindow() {
        var element = this.getDomElement();

        if (element) {
          return qx.bom.Iframe.getWindow(element);
        } else {
          return null;
        }
      },

      /**
       * Get the DOM document object of an iframe.
       *
       * @return {Document} The DOM document object of the iframe.
       */
      getDocument: function getDocument() {
        var element = this.getDomElement();

        if (element) {
          return qx.bom.Iframe.getDocument(element);
        } else {
          return null;
        }
      },

      /**
       * Get the HTML body element of the iframe.
       *
       * @return {Element} The DOM node of the <code>body</code> element of the iframe.
       */
      getBody: function getBody() {
        var element = this.getDomElement();

        if (element) {
          return qx.bom.Iframe.getBody(element);
        } else {
          return null;
        }
      },

      /**
       * Sets iframe's source attribute to given value
       *
       * @param source {String} URL to be set.
       * @return {qx.html.Iframe} The current instance for chaining
       */
      setSource: function setSource(source) {
        // the source needs to be applied directly in case the iFrame is hidden
        this._setProperty("source", source, true);

        return this;
      },

      /**
       * Get the current source.
       *
       * @return {String} The iframe's source
       */
      getSource: function getSource() {
        return this._getProperty("source");
      },

      /**
       * Sets iframe's name attribute to given value
       *
       * @param name {String} Name to be set.
       * @return {qx.html.Iframe} The current instance for chaining
       */
      setName: function setName(name) {
        this.setAttribute("name", name);
        return this;
      },

      /**
       * Get the current name.
       *
       * @return {String} The iframe's name.
       */
      getName: function getName() {
        return this.getAttribute("name");
      },

      /**
       * Reloads iframe
       */
      reload: function reload() {
        var element = this.getDomElement();

        if (element) {
          var url = this.getSource();
          this.setSource(null);
          this.setSource(url);
        }
      },

      /*
      ---------------------------------------------------------------------------
        LISTENER
      ---------------------------------------------------------------------------
      */

      /**
      * Handle user navigation. Sync actual URL of iframe with source property.
      *
      * @param e {qx.event.type.Data} navigate event
      */
      __onNavigate: function __onNavigate(e) {
        var actualUrl = e.getData();

        if (actualUrl) {
          this.setSource(actualUrl);
        }
      }
    }
  });
  qx.html.Iframe.$$dbClassInfo = $$dbClassInfo;
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
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Iframe": {},
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
   * This handler provides a "load" event for iframes
   */
  qx.Class.define("qx.event.handler.Iframe", {
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
        load: 1,
        navigate: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false,

      /**
       * Internal function called by iframes created using {@link qx.bom.Iframe}.
       *
       * @signature function(target)
       * @internal
       * @param target {Element} DOM element which is the target of this event
       */
      onevent: qx.event.GlobalError.observeMethod(function (target) {
        // Fire navigate event when actual URL diverges from stored URL
        var currentUrl = qx.bom.Iframe.queryCurrentUrl(target);

        if (currentUrl !== target.$$url) {
          qx.event.Registration.fireEvent(target, "navigate", qx.event.type.Data, [currentUrl]);
          target.$$url = currentUrl;
        } // Always fire load event


        qx.event.Registration.fireEvent(target, "load");
      })
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
        return target.tagName.toLowerCase() === "iframe";
      },
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
  qx.event.handler.Iframe.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Iframe": {
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
      "qx.lang.Object": {},
      "qx.dom.Element": {},
      "qx.dom.Hierarchy": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.log.Logger": {},
      "qx.bom.Event": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
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
       * Andreas Ecker (ecker)
       * Jonathan Weiß (jonathan_rass)
       * Christian Hagendorn (Chris_schmidt)
  
  ************************************************************************ */

  /**
   * Cross browser abstractions to work with iframes.
   *
   * @require(qx.event.handler.Iframe)
   */
  qx.Class.define("qx.bom.Iframe", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * @type {Map} Default attributes for creation {@link #create}.
       */
      DEFAULT_ATTRIBUTES: {
        onload: "qx.event.handler.Iframe.onevent(this)",
        frameBorder: 0,
        frameSpacing: 0,
        marginWidth: 0,
        marginHeight: 0,
        hspace: 0,
        vspace: 0,
        border: 0,
        allowTransparency: true
      },

      /**
       * Creates an DOM element.
       *
       * Attributes may be given directly with this call. This is critical
       * for some attributes e.g. name, type, ... in many clients.
       *
       * @param attributes {Map?null} Map of attributes to apply
       * @param win {Window?null} Window to create the element for
       * @return {Element} The created iframe node
       */
      create: function create(attributes, win) {
        // Work on a copy to not modify given attributes map
        var attributes = attributes ? qx.lang.Object.clone(attributes) : {};
        var initValues = qx.bom.Iframe.DEFAULT_ATTRIBUTES;

        for (var key in initValues) {
          if (attributes[key] == null) {
            attributes[key] = initValues[key];
          }
        }

        return qx.dom.Element.create("iframe", attributes, win);
      },

      /**
       * Get the DOM window object of an iframe.
       *
       * @param iframe {Element} DOM element of the iframe.
       * @return {Window?null} The DOM window object of the iframe or null.
       * @signature function(iframe)
       */
      getWindow: function getWindow(iframe) {
        try {
          return iframe.contentWindow;
        } catch (ex) {
          return null;
        }
      },

      /**
       * Get the DOM document object of an iframe.
       *
       * @param iframe {Element} DOM element of the iframe.
       * @return {Document} The DOM document object of the iframe.
       */
      getDocument: function getDocument(iframe) {
        if ("contentDocument" in iframe) {
          try {
            return iframe.contentDocument;
          } catch (ex) {
            return null;
          }
        }

        try {
          var win = this.getWindow(iframe);
          return win ? win.document : null;
        } catch (ex) {
          return null;
        }
      },

      /**
       * Get the HTML body element of the iframe.
       *
       * @param iframe {Element} DOM element of the iframe.
       * @return {Element} The DOM node of the <code>body</code> element of the iframe.
       */
      getBody: function getBody(iframe) {
        try {
          var doc = this.getDocument(iframe);
          return doc ? doc.getElementsByTagName("body")[0] : null;
        } catch (ex) {
          return null;
        }
      },

      /**
       * Sets iframe's source attribute to given value
       *
       * @param iframe {Element} DOM element of the iframe.
       * @param source {String} URL to be set.
       * @signature function(iframe, source)
       */
      setSource: function setSource(iframe, source) {
        try {
          // the guru says ...
          // it is better to use 'replace' than 'src'-attribute, since 'replace'
          // does not interfere with the history (which is taken care of by the
          // history manager), but there has to be a loaded document
          if (this.getWindow(iframe) && qx.dom.Hierarchy.isRendered(iframe)) {
            /*
              Some gecko users might have an exception here:
              Exception... "Component returned failure code: 0x805e000a
              [nsIDOMLocation.replace]"  nsresult: "0x805e000a (<unknown>)"
            */
            try {
              // Webkit on Mac can't set the source when the iframe is still
              // loading its current page
              if (qx.core.Environment.get("engine.name") == "webkit" && qx.core.Environment.get("os.name") == "osx") {
                var contentWindow = this.getWindow(iframe);

                if (contentWindow) {
                  contentWindow.stop();
                }
              }

              this.getWindow(iframe).location.replace(source);
            } catch (ex) {
              iframe.src = source;
            }
          } else {
            iframe.src = source;
          } // This is a programmer provided source. Remember URL for this source
          // for later comparison with current URL. The current URL can diverge
          // if the end-user navigates in the Iframe.


          this.__rememberUrl(iframe);
        } catch (ex) {
          qx.log.Logger.warn("Iframe source could not be set!");
        }
      },

      /**
       * Returns the current (served) URL inside the iframe
       *
       * @param iframe {Element} DOM element of the iframe.
       * @return {String} Returns the location href or null (if a query is not possible/allowed)
       */
      queryCurrentUrl: function queryCurrentUrl(iframe) {
        var doc = this.getDocument(iframe);

        try {
          if (doc && doc.location) {
            return doc.location.href;
          }
        } catch (ex) {}

        ;
        return "";
      },

      /**
      * Remember actual URL of iframe.
      *
      * @param iframe {Element} DOM element of the iframe.
      */
      __rememberUrl: function __rememberUrl(iframe) {
        // URL can only be detected after load. Retrieve and store URL once.
        var callback = function callback() {
          qx.bom.Event.removeNativeListener(iframe, "load", callback);
          iframe.$$url = qx.bom.Iframe.queryCurrentUrl(iframe);
        };

        qx.bom.Event.addNativeListener(iframe, "load", callback);
      }
    }
  });
  qx.bom.Iframe.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-9.js.map
