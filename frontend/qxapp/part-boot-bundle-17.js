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
      "qx.core.Assert": {
        "construct": true
      },
      "qx.ui.core.ISingleSelectionProvider": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Responsible for the single selection management.
   *
   * The class manage a list of {@link qx.ui.core.Widget} which are returned from
   * {@link qx.ui.core.ISingleSelectionProvider#getItems}.
   *
   * @internal
   */
  qx.Class.define("qx.ui.core.SingleSelectionManager", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Construct the single selection manager.
     *
     * @param selectionProvider {qx.ui.core.ISingleSelectionProvider} The provider
     * for selection.
     */
    construct: function construct(selectionProvider) {
      qx.core.Object.constructor.call(this);
      {
        qx.core.Assert.assertInterface(selectionProvider, qx.ui.core.ISingleSelectionProvider, "Invalid selectionProvider!");
      }
      this.__selectionProvider = selectionProvider;
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the selection was modified */
      "changeSelected": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * If the value is <code>true</code> the manager allows an empty selection,
       * otherwise the first selectable element returned from the
       * <code>qx.ui.core.ISingleSelectionProvider</code> will be selected.
       */
      allowEmptySelection: {
        check: "Boolean",
        init: true,
        apply: "__applyAllowEmptySelection"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.Widget} The selected widget. */
      __selected: null,

      /** @type {qx.ui.core.ISingleSelectionProvider} The provider for selection management */
      __selectionProvider: null,

      /*
      ---------------------------------------------------------------------------
         PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the current selected element.
       *
       * @return {qx.ui.core.Widget | null} The current selected widget or
       *    <code>null</code> if the selection is empty.
       */
      getSelected: function getSelected() {
        return this.__selected;
      },

      /**
       * Selects the passed element.
       *
       * @param item {qx.ui.core.Widget} Element to select.
       * @throws {Error} if the element is not a child element.
       */
      setSelected: function setSelected(item) {
        if (!this.__isChildElement(item)) {
          throw new Error("Could not select " + item + ", because it is not a child element!");
        }

        this.__setSelected(item);
      },

      /**
       * Reset the current selection. If {@link #allowEmptySelection} is set to
       * <code>true</code> the first element will be selected.
       */
      resetSelected: function resetSelected() {
        this.__setSelected(null);
      },

      /**
       * Return <code>true</code> if the passed element is selected.
       *
       * @param item {qx.ui.core.Widget} Element to check if selected.
       * @return {Boolean} <code>true</code> if passed element is selected,
       *    <code>false</code> otherwise.
       * @throws {Error} if the element is not a child element.
       */
      isSelected: function isSelected(item) {
        if (!this.__isChildElement(item)) {
          throw new Error("Could not check if " + item + " is selected," + " because it is not a child element!");
        }

        return this.__selected === item;
      },

      /**
       * Returns <code>true</code> if selection is empty.
       *
       * @return {Boolean} <code>true</code> if selection is empty,
       *    <code>false</code> otherwise.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__selected == null;
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        var items = this.__selectionProvider.getItems();

        var result = [];

        for (var i = 0; i < items.length; i++) {
          if (this.__selectionProvider.isItemSelectable(items[i])) {
            result.push(items[i]);
          }
        } // in case of an user selectable list, remove the enabled items


        if (!all) {
          for (var i = result.length - 1; i >= 0; i--) {
            if (!result[i].getEnabled()) {
              result.splice(i, 1);
            }
          }

          ;
        }

        return result;
      },

      /*
      ---------------------------------------------------------------------------
         APPLY METHODS
      ---------------------------------------------------------------------------
      */
      // apply method
      __applyAllowEmptySelection: function __applyAllowEmptySelection(value, old) {
        if (!value) {
          this.__setSelected(this.__selected);
        }
      },

      /*
      ---------------------------------------------------------------------------
         HELPERS
      ---------------------------------------------------------------------------
      */

      /**
       * Set selected element.
       *
       * If passes value is <code>null</code>, the selection will be reseted.
       *
       * @param item {qx.ui.core.Widget | null} element to select, or
       *    <code>null</code> to reset selection.
       */
      __setSelected: function __setSelected(item) {
        var oldSelected = this.__selected;
        var newSelected = item;

        if (newSelected != null && oldSelected === newSelected) {
          return;
        }

        if (!this.isAllowEmptySelection() && newSelected == null) {
          var firstElement = this.getSelectables(true)[0];

          if (firstElement) {
            newSelected = firstElement;
          }
        }

        this.__selected = newSelected;
        this.fireDataEvent("changeSelected", newSelected, oldSelected);
      },

      /**
       * Checks if passed element is a child element.
       *
       * @param item {qx.ui.core.Widget} Element to check if child element.
       * @return {Boolean} <code>true</code> if element is child element,
       *    <code>false</code> otherwise.
       */
      __isChildElement: function __isChildElement(item) {
        var items = this.__selectionProvider.getItems();

        for (var i = 0; i < items.length; i++) {
          if (items[i] === item) {
            return true;
          }
        }

        return false;
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      if (this.__selectionProvider.toHashCode) {
        this._disposeObjects("__selectionProvider");
      } else {
        this.__selectionProvider = null;
      }

      this._disposeObjects("__selected");
    }
  });
  qx.ui.core.SingleSelectionManager.$$dbClassInfo = $$dbClassInfo;
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
  
  ************************************************************************ */

  /**
   * The grow layout stretches all children to the full available size
   * but still respects limits configured by min/max values.
   *
   * It will place all children over each other with the top and left coordinates
   * set to <code>0</code>. The {@link qx.ui.container.Stack} and the
   * {@link qx.ui.core.scroll.ScrollPane} are using this layout.
   *
   * *Features*
   *
   * * Auto-sizing
   * * Respects minimum and maximum child dimensions
   *
   * *Item Properties*
   *
   * None
   *
   * *Example*
   *
   * <pre class="javascript">
   * var layout = new qx.ui.layout.Grow();
   *
   * var w1 = new qx.ui.core.Widget();
   * var w2 = new qx.ui.core.Widget();
   * var w3 = new qx.ui.core.Widget();
   *
   * var container = new qx.ui.container.Composite(layout);
   * container.add(w1);
   * container.add(w2);
   * container.add(w3);
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/grow.html'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Grow", {
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
        this.assert(false, "The property '" + name + "' is not supported by the Grow layout!");
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child, size, width, height; // Render children

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          width = availWidth;

          if (width < size.minWidth) {
            width = size.minWidth;
          } else if (width > size.maxWidth) {
            width = size.maxWidth;
          }

          height = availHeight;

          if (height < size.minHeight) {
            height = size.minHeight;
          } else if (height > size.maxHeight) {
            height = size.maxHeight;
          }

          child.renderLayout(padding.left, padding.top, width, height);
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var child, size;
        var neededWidth = 0,
            neededHeight = 0;
        var minWidth = 0,
            minHeight = 0;
        var maxWidth = Infinity,
            maxHeight = Infinity; // Iterate over children

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          neededWidth = Math.max(neededWidth, size.width);
          neededHeight = Math.max(neededHeight, size.height);
          minWidth = Math.max(minWidth, size.minWidth);
          minHeight = Math.max(minHeight, size.minHeight);
          maxWidth = Math.min(maxWidth, size.maxWidth);
          maxHeight = Math.min(maxHeight, size.maxHeight);
        } // Return hint


        return {
          width: neededWidth,
          height: neededHeight,
          minWidth: minWidth,
          minHeight: minHeight,
          maxWidth: maxWidth,
          maxHeight: maxHeight
        };
      }
    }
  });
  qx.ui.layout.Grow.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {},
      "qx.util.PropertyUtil": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This mixin is included by all widgets, which support an 'execute' like
   * buttons or menu entries.
   */
  qx.Mixin.define("qx.ui.core.MExecutable", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired if the {@link #execute} method is invoked.*/
      "execute": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * A command called if the {@link #execute} method is called, e.g. on a
       * button tap.
       */
      command: {
        check: "qx.ui.command.Command",
        apply: "_applyCommand",
        event: "changeCommand",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __executableBindingIds: null,
      __semaphore: false,
      __executeListenerId: null,

      /**
       * @type {Map} Set of properties, which will by synced from the command to the
       *    including widget
       *
       * @lint ignoreReferenceField(_bindableProperties)
       */
      _bindableProperties: ["label", "icon", "toolTipText", "value", "menu"],

      /**
       * Initiate the execute action.
       */
      execute: function execute() {
        var cmd = this.getCommand();

        if (cmd) {
          if (this.__semaphore) {
            this.__semaphore = false;
          } else {
            this.__semaphore = true;
            cmd.execute(this);
          }
        }

        this.fireEvent("execute");
      },

      /**
       * Handler for the execute event of the command.
       *
       * @param e {qx.event.type.Event} The execute event of the command.
       */
      __onCommandExecute: function __onCommandExecute(e) {
        if (this.isEnabled()) {
          if (this.__semaphore) {
            this.__semaphore = false;
            return;
          }

          if (this.isEnabled()) {
            this.__semaphore = true;
            this.execute();
          }
        }
      },
      // property apply
      _applyCommand: function _applyCommand(value, old) {
        // execute forwarding
        if (old != null) {
          old.removeListenerById(this.__executeListenerId);
        }

        if (value != null) {
          this.__executeListenerId = value.addListener("execute", this.__onCommandExecute, this);
        } // binding stuff


        var ids = this.__executableBindingIds;

        if (ids == null) {
          this.__executableBindingIds = ids = {};
        }

        var selfPropertyValue;

        for (var i = 0; i < this._bindableProperties.length; i++) {
          var property = this._bindableProperties[i]; // remove the old binding

          if (old != null && !old.isDisposed() && ids[property] != null) {
            old.removeBinding(ids[property]);
            ids[property] = null;
          } // add the new binding


          if (value != null && qx.Class.hasProperty(this.constructor, property)) {
            // handle the init value (don't sync the initial null)
            var cmdPropertyValue = value.get(property);

            if (cmdPropertyValue == null) {
              selfPropertyValue = this.get(property); // check also for themed values [BUG #5906]

              if (selfPropertyValue == null) {
                // update the appearance to make sure every themed property is up to date
                this.$$resyncNeeded = true;
                this.syncAppearance();
                selfPropertyValue = qx.util.PropertyUtil.getThemeValue(this, property);
              }
            } else {
              // Reset the self property value [BUG #4534]
              selfPropertyValue = null;
            } // set up the binding


            ids[property] = value.bind(property, this, property); // reapply the former value

            if (selfPropertyValue) {
              this.set(property, selfPropertyValue);
            }
          }
        }
      }
    },
    destruct: function destruct() {
      this._applyCommand(null, this.getCommand());

      this.__executableBindingIds = null;
    }
  });
  qx.ui.core.MExecutable.$$dbClassInfo = $$dbClassInfo;
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
   * Form interface for all form widgets which are executable in some way. This
   * could be a button for example.
   */
  qx.Interface.define("qx.ui.form.IExecutable", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the widget is executed. Sets the "data" property of the
       * event to the object that issued the command.
       */
      "execute": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        COMMAND PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Set the command of this executable.
       *
       * @param command {qx.ui.command.Command} The command.
       */
      setCommand: function setCommand(command) {
        return arguments.length == 1;
      },

      /**
       * Return the current set command of this executable.
       *
       * @return {qx.ui.command.Command} The current set command.
       */
      getCommand: function getCommand() {},

      /**
       * Fire the "execute" event on the command.
       */
      execute: function execute() {}
    }
  });
  qx.ui.form.IExecutable.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.basic.Label": {}
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
   * A atom layout. Used to place an image and label in relation
   * to each other. Useful to create buttons, list items, etc.
   *
   * *Features*
   *
   * * Gap between icon and text (using {@link #gap})
   * * Vertical and horizontal mode (using {@link #iconPosition})
   * * Sorting options to place first child on top/left or bottom/right (using {@link #iconPosition})
   * * Automatically middles/centers content to the available space
   * * Auto-sizing
   * * Supports more than two children (will be processed the same way like the previous ones)
   *
   * *Item Properties*
   *
   * None
   *
   * *Notes*
   *
   * * Does not support margins and alignment of {@link qx.ui.core.LayoutItem}.
   *
   * *Alternative Names*
   *
   * None
   */
  qx.Class.define("qx.ui.layout.Atom", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The gap between the icon and the text */
      gap: {
        check: "Integer",
        init: 4,
        apply: "_applyLayoutChange"
      },

      /** The position of the icon in relation to the text */
      iconPosition: {
        check: ["left", "top", "right", "bottom", "top-left", "bottom-left", "top-right", "bottom-right"],
        init: "left",
        apply: "_applyLayoutChange"
      },

      /**
       * Whether the content should be rendered centrally when to much space
       * is available. Enabling this property centers in both axis. The behavior
       * when disabled of the centering depends on the {@link #iconPosition} property.
       * If the icon position is <code>left</code> or <code>right</code>, the X axis
       * is not centered, only the Y axis. If the icon position is <code>top</code>
       * or <code>bottom</code>, the Y axis is not centered. In case of e.g. an
       * icon position of <code>top-left</code> no axis is centered.
       */
      center: {
        check: "Boolean",
        init: false,
        apply: "_applyLayoutChange"
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
        this.assert(false, "The property '" + name + "' is not supported by the Atom layout!");
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var left = padding.left;
        var top = padding.top;
        var Util = qx.ui.layout.Util;
        var iconPosition = this.getIconPosition();

        var children = this._getLayoutChildren();

        var length = children.length;
        var width, height;
        var child, hint;
        var gap = this.getGap();
        var center = this.getCenter(); // reverse ordering

        var allowedPositions = ["bottom", "right", "top-right", "bottom-right"];

        if (allowedPositions.indexOf(iconPosition) != -1) {
          var start = length - 1;
          var end = -1;
          var increment = -1;
        } else {
          var start = 0;
          var end = length;
          var increment = 1;
        } // vertical


        if (iconPosition == "top" || iconPosition == "bottom") {
          if (center) {
            var allocatedHeight = 0;

            for (var i = start; i != end; i += increment) {
              height = children[i].getSizeHint().height;

              if (height > 0) {
                allocatedHeight += height;

                if (i != start) {
                  allocatedHeight += gap;
                }
              }
            }

            top += Math.round((availHeight - allocatedHeight) / 2);
          }

          var childTop = top;

          for (var i = start; i != end; i += increment) {
            child = children[i];
            hint = child.getSizeHint();
            width = Math.min(hint.maxWidth, Math.max(availWidth, hint.minWidth));
            height = hint.height;
            left = Util.computeHorizontalAlignOffset("center", width, availWidth) + padding.left;
            child.renderLayout(left, childTop, width, height); // Ignore pseudo invisible elements

            if (height > 0) {
              childTop = top + height + gap;
            }
          }
        } // horizontal
        // in this way it also supports shrinking of the first label
        else {
            var remainingWidth = availWidth;
            var shrinkTarget = null;
            var count = 0;

            for (var i = start; i != end; i += increment) {
              child = children[i];
              width = child.getSizeHint().width;

              if (width > 0) {
                if (!shrinkTarget && child instanceof qx.ui.basic.Label) {
                  shrinkTarget = child;
                } else {
                  remainingWidth -= width;
                }

                count++;
              }
            }

            if (count > 1) {
              var gapSum = (count - 1) * gap;
              remainingWidth -= gapSum;
            }

            if (shrinkTarget) {
              var hint = shrinkTarget.getSizeHint();
              var shrinkTargetWidth = Math.max(hint.minWidth, Math.min(remainingWidth, hint.maxWidth));
              remainingWidth -= shrinkTargetWidth;
            }

            if (center && remainingWidth > 0) {
              left += Math.round(remainingWidth / 2);
            }

            for (var i = start; i != end; i += increment) {
              child = children[i];
              hint = child.getSizeHint();
              height = Math.min(hint.maxHeight, Math.max(availHeight, hint.minHeight));

              if (child === shrinkTarget) {
                width = shrinkTargetWidth;
              } else {
                width = hint.width;
              }

              var align = "middle";

              if (iconPosition == "top-left" || iconPosition == "top-right") {
                align = "top";
              } else if (iconPosition == "bottom-left" || iconPosition == "bottom-right") {
                align = "bottom";
              }

              var childTop = top + Util.computeVerticalAlignOffset(align, hint.height, availHeight);
              child.renderLayout(left, childTop, width, height); // Ignore pseudo invisible childs for gap e.g.
              // empty text or unavailable images

              if (width > 0) {
                left += width + gap;
              }
            }
          }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var length = children.length;
        var hint, result; // Fast path for only one child

        if (length === 1) {
          var hint = children[0].getSizeHint(); // Work on a copy, but do not respect max
          // values as a Atom can be rendered bigger
          // than its content.

          result = {
            width: hint.width,
            height: hint.height,
            minWidth: hint.minWidth,
            minHeight: hint.minHeight
          };
        } else {
          var minWidth = 0,
              width = 0;
          var minHeight = 0,
              height = 0;
          var iconPosition = this.getIconPosition();
          var gap = this.getGap();

          if (iconPosition === "top" || iconPosition === "bottom") {
            var count = 0;

            for (var i = 0; i < length; i++) {
              hint = children[i].getSizeHint(); // Max of widths

              width = Math.max(width, hint.width);
              minWidth = Math.max(minWidth, hint.minWidth); // Sum of heights

              if (hint.height > 0) {
                height += hint.height;
                minHeight += hint.minHeight;
                count++;
              }
            }

            if (count > 1) {
              var gapSum = (count - 1) * gap;
              height += gapSum;
              minHeight += gapSum;
            }
          } else {
            var count = 0;

            for (var i = 0; i < length; i++) {
              hint = children[i].getSizeHint(); // Max of heights

              height = Math.max(height, hint.height);
              minHeight = Math.max(minHeight, hint.minHeight); // Sum of widths

              if (hint.width > 0) {
                width += hint.width;
                minWidth += hint.minWidth;
                count++;
              }
            }

            if (count > 1) {
              var gapSum = (count - 1) * gap;
              width += gapSum;
              minWidth += gapSum;
            }
          } // Build hint


          result = {
            minWidth: minWidth,
            width: width,
            minHeight: minHeight,
            height: height
          };
        }

        return result;
      }
    }
  });
  qx.ui.layout.Atom.$$dbClassInfo = $$dbClassInfo;
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
   * A Button widget which supports various states and allows it to be used
   * via the mouse, touch, pen and the keyboard.
   *
   * If the user presses the button by clicking on it, or the <code>Enter</code> or
   * <code>Space</code> keys, the button fires an {@link qx.ui.core.MExecutable#execute} event.
   *
   * If the {@link qx.ui.core.MExecutable#command} property is set, the
   * command is executed as well.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.Button("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button was clicked");
   *   }, this);
   *
   *   this.getRoot().add(button);
   * </pre>
   *
   * This example creates a button with the label "Hello World" and attaches an
   * event listener to the {@link #execute} event.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/button.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.Button", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} label of the atom
     * @param icon {String?null} Icon URL of the atom
     * @param command {qx.ui.command.Command?null} Command instance to connect with
     */
    construct: function construct(label, icon, command) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);

      if (command != null) {
        this.setCommand(command);
      } // Add listeners


      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut);
      this.addListener("pointerdown", this._onPointerDown);
      this.addListener("pointerup", this._onPointerUp);
      this.addListener("tap", this._onTap);
      this.addListener("keydown", this._onKeyDown);
      this.addListener("keyup", this._onKeyUp); // Stop events

      this.addListener("dblclick", function (e) {
        e.stopPropagation();
      });
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
        init: "button"
      },
      // overridden
      focusable: {
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
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        hovered: true,
        pressed: true,
        disabled: true
      },

      /*
      ---------------------------------------------------------------------------
        USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Manually press the button
       */
      press: function press() {
        if (this.hasState("abandoned")) {
          return;
        }

        this.addState("pressed");
      },

      /**
       * Manually release the button
       */
      release: function release() {
        if (this.hasState("pressed")) {
          this.removeState("pressed");
        }
      },

      /**
       * Completely reset the button (remove all states)
       */
      reset: function reset() {
        this.removeState("pressed");
        this.removeState("abandoned");
        this.removeState("hovered");
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener method for "pointerover" event
       * <ul>
       * <li>Adds state "hovered"</li>
       * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
          this.addState("pressed");
        }

        this.addState("hovered");
      },

      /**
       * Listener method for "pointerout" event
       * <ul>
       * <li>Removes "hovered" state</li>
       * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerOut: function _onPointerOut(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        this.removeState("hovered");

        if (this.hasState("pressed")) {
          this.removeState("pressed");
          this.addState("abandoned");
        }
      },

      /**
       * Listener method for "pointerdown" event
       * <ul>
       * <li>Removes "abandoned" state</li>
       * <li>Adds "pressed" state</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerDown: function _onPointerDown(e) {
        if (!e.isLeftPressed()) {
          return;
        }

        e.stopPropagation(); // Activate capturing if the button get a pointerout while
        // the button is pressed.

        this.capture();
        this.removeState("abandoned");
        this.addState("pressed");
      },

      /**
       * Listener method for "pointerup" event
       * <ul>
       * <li>Removes "pressed" state (if set)</li>
       * <li>Removes "abandoned" state (if set)</li>
       * <li>Adds "hovered" state (if "abandoned" state is not set)</li>
       *</ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerUp: function _onPointerUp(e) {
        this.releaseCapture(); // We must remove the states before executing the command
        // because in cases were the window lost the focus while
        // executing we get the capture phase back (mouseout).

        var hasPressed = this.hasState("pressed");
        var hasAbandoned = this.hasState("abandoned");

        if (hasPressed) {
          this.removeState("pressed");
        }

        if (hasAbandoned) {
          this.removeState("abandoned");
        }

        e.stopPropagation();
      },

      /**
       * Listener method for "tap" event which stops the propagation.
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onTap: function _onTap(e) {
        // "execute" is fired here so that the button can be dragged
        // without executing it (e.g. in a TabBar with overflow)
        this.execute();
        e.stopPropagation();
      },

      /**
       * Listener method for "keydown" event.<br/>
       * Removes "abandoned" and adds "pressed" state
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyDown: function _onKeyDown(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            this.removeState("abandoned");
            this.addState("pressed");
            e.stopPropagation();
        }
      },

      /**
       * Listener method for "keyup" event.<br/>
       * Removes "abandoned" and "pressed" state (if "pressed" state is set)
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyUp: function _onKeyUp(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            if (this.hasState("pressed")) {
              this.removeState("abandoned");
              this.removeState("pressed");
              this.execute();
              e.stopPropagation();
            }

        }
      }
    }
  });
  qx.ui.form.Button.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-17.js.map
