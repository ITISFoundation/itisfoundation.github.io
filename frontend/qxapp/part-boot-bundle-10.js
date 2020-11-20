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
       * Til Schneider (til132)
       * Jonathan Weiß (jonathan_rass)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Abstract base class for iframe widgets.
   */
  qx.Class.define("qx.ui.embed.AbstractIframe", {
    extend: qx.ui.core.Widget,

    /**
     * @param source {String} URL which should initially set.
     */
    construct: function construct(source) {
      qx.ui.core.Widget.constructor.call(this);

      if (source) {
        this.setSource(source);
      }

      this._getIframeElement().addListener("navigate", this.__onNavigate, this);
    },
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
    properties: {
      /**
       * Source URL of the iframe.
       */
      source: {
        check: "String",
        apply: "_applySource",
        init: "about:blank"
      },

      /**
       * Name of the iframe.
       */
      frameName: {
        check: "String",
        init: "",
        apply: "_applyFrameName"
      }
    },
    members: {
      /**
       * Get the Element wrapper for the iframe
       *
       * @abstract
       * @return {qx.html.Iframe} the iframe element wrapper
       */
      _getIframeElement: function _getIframeElement() {
        throw new Error("Abstract method call");
      },
      // property apply
      _applySource: function _applySource(value, old) {
        this._getIframeElement().setSource(value);
      },
      // property apply
      _applyFrameName: function _applyFrameName(value, old) {
        this._getIframeElement().setAttribute("name", value);
      },

      /**
       * Get the DOM window object of an iframe.
       *
       * @return {Window} The DOM window object of the iframe.
       */
      getWindow: function getWindow() {
        return this._getIframeElement().getWindow();
      },

      /**
       * Get the DOM document object of an iframe.
       *
       * @return {Document} The DOM document object of the iframe.
       */
      getDocument: function getDocument() {
        return this._getIframeElement().getDocument();
      },

      /**
       * Get the HTML body element of the iframe.
       *
       * @return {Element} The DOM node of the <code>body</code> element of the iframe.
       */
      getBody: function getBody() {
        return this._getIframeElement().getBody();
      },

      /**
       * Get the current name.
       *
       * @return {String} The iframe's name.
       */
      getName: function getName() {
        return this._getIframeElement().getName();
      },

      /**
       * Reload the contents of the iframe.
       *
       */
      reload: function reload() {
        this._getIframeElement().reload();
      },

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

        this.fireDataEvent("navigate", actualUrl);
      }
    }
  });
  qx.ui.embed.AbstractIframe.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.embed.AbstractIframe": {
        "construct": true,
        "require": true
      },
      "qx.event.Registration": {
        "construct": true
      },
      "qx.bom.client.EcmaScript": {
        "construct": true
      },
      "qx.bom.Event": {
        "construct": true
      },
      "qx.lang.Function": {
        "construct": true
      },
      "qx.html.Iframe": {},
      "qx.html.Blocker": {},
      "qx.bom.client.Event": {},
      "qx.bom.client.Browser": {},
      "qx.bom.Iframe": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "ecmascript.mutationobserver": {
          "construct": true,
          "className": "qx.bom.client.EcmaScript"
        },
        "event.help": {
          "className": "qx.bom.client.Event"
        },
        "browser.name": {
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
       * Til Schneider (til132)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * Container widget for internal frames (iframes).
   * An iframe can display any HTML page inside the widget.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   * var document = this.getRoot();
   * var iframe = new qx.ui.embed.Iframe("http://www.qooxdoo.org");
   * document.add(iframe);
   * </pre>
   *
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/iframe.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   * 
   * 
   * *Notes*
   * When modifying this file, note that the test qx.test.ui.embed.Iframe.testSyncSourceAfterDOMMove
   * has been disabled under Chrome because of problems with Travis and Github.  Changes to this file
   * should be tested manually against that test.
   */
  qx.Class.define("qx.ui.embed.Iframe", {
    extend: qx.ui.embed.AbstractIframe,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @ignore(MutationObserver)
     * @param source {String} URL which should initially set.
     */
    construct: function construct(source) {
      if (source != null) {
        this.__source = source;
      }

      qx.ui.embed.AbstractIframe.constructor.call(this, source);
      qx.event.Registration.addListener(document.body, "pointerdown", this.block, this, true);
      qx.event.Registration.addListener(document.body, "pointerup", this.release, this, true);
      qx.event.Registration.addListener(document.body, "losecapture", this.release, this, true);
      this.__blockerElement = this._createBlockerElement();

      if (qx.core.Environment.get("ecmascript.mutationobserver")) {
        this.addListenerOnce("appear", function () {
          var element = this.getContentElement().getDomElement(); // Mutation record check callback

          var isDOMNodeInserted = function isDOMNodeInserted(mutationRecord) {
            var i; // 'our' iframe was either added...

            if (mutationRecord.addedNodes) {
              for (i = mutationRecord.addedNodes.length; i >= 0; --i) {
                if (mutationRecord.addedNodes[i] == element) {
                  return true;
                }
              }
            } // ...or removed


            if (mutationRecord.removedNodes) {
              for (i = mutationRecord.removedNodes.length; i >= 0; --i) {
                if (mutationRecord.removedNodes[i] == element) {
                  return true;
                }
              }
            }

            return false;
          };

          var observer = new MutationObserver(function (mutationRecords) {
            if (mutationRecords.some(isDOMNodeInserted)) {
              this._syncSourceAfterDOMMove();
            }
          }.bind(this)); // Observe parent element

          var parent = this.getLayoutParent().getContentElement().getDomElement();
          observer.observe(parent, {
            childList: true
          });
        }, this);
      } else // !qx.core.Environment.get("ecmascript.mutationobserver")
        {
          this.addListenerOnce("appear", function () {
            var element = this.getContentElement().getDomElement();
            qx.bom.Event.addNativeListener(element, "DOMNodeInserted", this._onDOMNodeInserted);
          }, this);
          this._onDOMNodeInserted = qx.lang.Function.listener(this._syncSourceAfterDOMMove, this);
        }
    },
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "iframe"
      },

      /**
       * Whether to show the frame's native context menu.
       *
       * Note: This only works if the iframe source is served from the same domain
       * as the main application.
       */
      nativeContextMenu: {
        refine: true,
        init: false
      },

      /**
       * If the user presses F1 in IE by default the onhelp event is fired and
       * IE’s help window is opened. Setting this property to <code>false</code>
       * prevents this behavior.
       *
       * Note: This only works if the iframe source is served from the same domain
       * as the main application.
       */
      nativeHelp: {
        check: "Boolean",
        init: false,
        apply: "_applyNativeHelp"
      },

      /**
       * Whether the widget should have scrollbars.
       */
      scrollbar: {
        check: ["auto", "no", "yes"],
        nullable: true,
        themeable: true,
        apply: "_applyScrollbar"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __source: null,
      __blockerElement: null,
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        qx.ui.embed.Iframe.prototype.renderLayout.base.call(this, left, top, width, height);
        var pixel = "px";
        var insets = this.getInsets();

        this.__blockerElement.setStyles({
          "left": left + insets.left + pixel,
          "top": top + insets.top + pixel,
          "width": width - insets.left - insets.right + pixel,
          "height": height - insets.top - insets.bottom + pixel
        });
      },
      // overridden
      _createContentElement: function _createContentElement() {
        var iframe = new qx.html.Iframe(this.__source);
        iframe.addListener("load", this._onIframeLoad, this);
        return iframe;
      },
      // overridden
      _getIframeElement: function _getIframeElement() {
        return this.getContentElement();
      },

      /**
       * Creates <div> element which is aligned over iframe node to avoid losing pointer events.
       *
       * @return {Object} Blocker element node
       */
      _createBlockerElement: function _createBlockerElement() {
        var el = new qx.html.Blocker();
        el.setStyles({
          "zIndex": 20,
          "display": "none"
        });
        return el;
      },

      /**
       * Reacts on native load event and redirects it to the widget.
       *
       * @param e {qx.event.type.Event} Native load event
       */
      _onIframeLoad: function _onIframeLoad(e) {
        this._applyNativeContextMenu(this.getNativeContextMenu(), null);

        this._applyNativeHelp(this.getNativeHelp(), null);

        this.fireNonBubblingEvent("load");
      },

      /*
      ---------------------------------------------------------------------------
        METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Cover the iframe with a transparent blocker div element. This prevents
       * pointer or key events to be handled by the iframe. To release the blocker
       * use {@link #release}.
       *
       */
      block: function block() {
        this.__blockerElement.setStyle("display", "block");
      },

      /**
       * Release the blocker set by {@link #block}.
       *
       */
      release: function release() {
        this.__blockerElement.setStyle("display", "none");
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyNativeContextMenu: function _applyNativeContextMenu(value, old) {
        if (value !== false && old !== false) {
          return;
        }

        var doc = this.getDocument();

        if (!doc) {
          return;
        }

        try {
          var documentElement = doc.documentElement;
        } catch (e) {
          // this may fail due to security restrictions
          return;
        }

        if (old === false) {
          qx.event.Registration.removeListener(documentElement, "contextmenu", this._onNativeContextMenu, this, true);
        }

        if (value === false) {
          qx.event.Registration.addListener(documentElement, "contextmenu", this._onNativeContextMenu, this, true);
        }
      },

      /**
       * Stops the <code>contextmenu</code> event from showing the native context menu
       *
       * @param e {qx.event.type.Mouse} The event object
       */
      _onNativeContextMenu: function _onNativeContextMenu(e) {
        e.preventDefault();
      },
      // property apply
      _applyNativeHelp: function _applyNativeHelp(value, old) {
        if (qx.core.Environment.get("event.help")) {
          var document = this.getDocument();

          if (!document) {
            return;
          }

          try {
            if (old === false) {
              qx.bom.Event.removeNativeListener(document, "help", function () {
                return false;
              });
            }

            if (value === false) {
              qx.bom.Event.addNativeListener(document, "help", function () {
                return false;
              });
            }
          } catch (e) {
            {
              this.warn("Unable to set 'nativeHelp' property, possibly due to security restrictions");
            }
          }
        }
      },

      /**
       * Checks if the iframe element is out of sync. This can happen in Firefox
       * if the iframe is moved around and the source is changed right after.
       * The root cause is that Firefox is reloading the iframe when its position
       * in DOM has changed.
       */
      _syncSourceAfterDOMMove: function _syncSourceAfterDOMMove() {
        var iframeDomElement = this.getContentElement() && this.getContentElement().getDomElement();

        if (!iframeDomElement) {
          return;
        }

        var iframeSource = iframeDomElement.src; // remove trailing "/"

        if (iframeSource.charAt(iframeSource.length - 1) == "/") {
          iframeSource = iframeSource.substring(0, iframeSource.length - 1);
        }

        if (iframeSource != this.getSource()) {
          if (qx.core.Environment.get("browser.name") != "edge" && qx.core.Environment.get("browser.name") != "ie") {
            qx.bom.Iframe.getWindow(iframeDomElement).stop();
          }

          iframeDomElement.src = this.getSource();
        }
      },
      // property apply
      _applyScrollbar: function _applyScrollbar(value) {
        this.getContentElement().setAttribute("scrolling", value);
      },
      // overridden
      setLayoutParent: function setLayoutParent(parent) {
        qx.ui.embed.Iframe.prototype.setLayoutParent.base.call(this, parent);

        if (parent) {
          this.getLayoutParent().getContentElement().add(this.__blockerElement);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.getLayoutParent() && this.__blockerElement.getParent()) {
        this.getLayoutParent().getContentElement().remove(this.__blockerElement);
      }

      this._disposeObjects("__blockerElement");

      qx.event.Registration.removeListener(document.body, "pointerdown", this.block, this, true);
      qx.event.Registration.removeListener(document.body, "pointerup", this.release, this, true);
      qx.event.Registration.removeListener(document.body, "losecapture", this.release, this, true);
    }
  });
  qx.ui.embed.Iframe.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.String": {}
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
       * Christian Hagendorn (cs)
  
  ************************************************************************ */

  /**
   * Methods to convert colors between different color spaces.
   *
   * @ignore(qx.theme.*)
   * @ignore(qx.Class)
   * @ignore(qx.Class.*)
   */
  qx.Bootstrap.define("qx.util.ColorUtil", {
    statics: {
      /**
       * Regular expressions for color strings
       */
      REGEXP: {
        hex3: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        rgb: /^rgb\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*\)$/,
        rgba: /^rgba\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*\)$/
      },

      /**
       * CSS3 system color names.
       */
      SYSTEM: {
        activeborder: true,
        activecaption: true,
        appworkspace: true,
        background: true,
        buttonface: true,
        buttonhighlight: true,
        buttonshadow: true,
        buttontext: true,
        captiontext: true,
        graytext: true,
        highlight: true,
        highlighttext: true,
        inactiveborder: true,
        inactivecaption: true,
        inactivecaptiontext: true,
        infobackground: true,
        infotext: true,
        menu: true,
        menutext: true,
        scrollbar: true,
        threeddarkshadow: true,
        threedface: true,
        threedhighlight: true,
        threedlightshadow: true,
        threedshadow: true,
        window: true,
        windowframe: true,
        windowtext: true
      },

      /**
       * Named colors, only the 16 basic colors plus the following ones:
       * transparent, grey, magenta, orange and brown
       */
      NAMED: {
        black: [0, 0, 0],
        silver: [192, 192, 192],
        gray: [128, 128, 128],
        white: [255, 255, 255],
        maroon: [128, 0, 0],
        red: [255, 0, 0],
        purple: [128, 0, 128],
        fuchsia: [255, 0, 255],
        green: [0, 128, 0],
        lime: [0, 255, 0],
        olive: [128, 128, 0],
        yellow: [255, 255, 0],
        navy: [0, 0, 128],
        blue: [0, 0, 255],
        teal: [0, 128, 128],
        aqua: [0, 255, 255],
        // Additional values
        transparent: [-1, -1, -1],
        magenta: [255, 0, 255],
        // alias for fuchsia
        orange: [255, 165, 0],
        brown: [165, 42, 42]
      },

      /**
       * Whether the incoming value is a named color.
       *
       * @param value {String} the color value to test
       * @return {Boolean} true if the color is a named color
       */
      isNamedColor: function isNamedColor(value) {
        return this.NAMED[value] !== undefined;
      },

      /**
       * Whether the incoming value is a system color.
       *
       * @param value {String} the color value to test
       * @return {Boolean} true if the color is a system color
       */
      isSystemColor: function isSystemColor(value) {
        return this.SYSTEM[value] !== undefined;
      },

      /**
       * Whether the color theme manager is loaded. Generally
       * part of the GUI of qooxdoo.
       *
       * @return {Boolean} <code>true</code> when color theme support is ready.
       **/
      supportsThemes: function supportsThemes() {
        if (qx.Class) {
          return qx.Class.isDefined("qx.theme.manager.Color");
        }

        return false;
      },

      /**
       * Whether the incoming value is a themed color.
       *
       * @param value {String} the color value to test
       * @return {Boolean} true if the color is a themed color
       */
      isThemedColor: function isThemedColor(value) {
        if (!this.supportsThemes()) {
          return false;
        }

        if (qx.theme && qx.theme.manager && qx.theme.manager.Color) {
          return qx.theme.manager.Color.getInstance().isDynamic(value);
        }

        return false;
      },

      /**
       * Try to convert an incoming string to an RGB array.
       * Supports themed, named and system colors, but also RGB strings,
       * hex3 and hex6 values.
       *
       * @param str {String} any string
       * @return {Array} returns an array of red, green, blue on a successful transformation
       * @throws {Error} if the string could not be parsed
       */
      stringToRgb: function stringToRgb(str) {
        if (this.supportsThemes() && this.isThemedColor(str)) {
          str = qx.theme.manager.Color.getInstance().resolveDynamic(str);
        }

        if (this.isNamedColor(str)) {
          return this.NAMED[str].concat();
        } else if (this.isSystemColor(str)) {
          throw new Error("Could not convert system colors to RGB: " + str);
        } else if (this.isRgbaString(str)) {
          return this.__rgbaStringToRgb(str);
        } else if (this.isRgbString(str)) {
          return this.__rgbStringToRgb();
        } else if (this.isHex3String(str)) {
          return this.__hex3StringToRgb();
        } else if (this.isHex6String(str)) {
          return this.__hex6StringToRgb();
        }

        throw new Error("Could not parse color: " + str);
      },

      /**
       * Try to convert an incoming string to an RGB array.
       * Support named colors, RGB strings, hex3 and hex6 values.
       *
       * @param str {String} any string
       * @return {Array} returns an array of red, green, blue on a successful transformation
       * @throws {Error} if the string could not be parsed
       */
      cssStringToRgb: function cssStringToRgb(str) {
        if (this.isNamedColor(str)) {
          return this.NAMED[str];
        } else if (this.isSystemColor(str)) {
          throw new Error("Could not convert system colors to RGB: " + str);
        } else if (this.isRgbString(str)) {
          return this.__rgbStringToRgb();
        } else if (this.isRgbaString(str)) {
          return this.__rgbaStringToRgb();
        } else if (this.isHex3String(str)) {
          return this.__hex3StringToRgb();
        } else if (this.isHex6String(str)) {
          return this.__hex6StringToRgb();
        }

        throw new Error("Could not parse color: " + str);
      },

      /**
       * Try to convert an incoming string to an RGB string, which can be used
       * for all color properties.
       * Supports themed, named and system colors, but also RGB strings,
       * hex3 and hex6 values.
       *
       * @param str {String} any string
       * @return {String} a RGB string
       * @throws {Error} if the string could not be parsed
       */
      stringToRgbString: function stringToRgbString(str) {
        return this.rgbToRgbString(this.stringToRgb(str));
      },

      /**
       * Converts a RGB array to an RGB string
       *
       * @param rgb {Array} an array with red, green and blue values and optionally
       * an alpha value
       * @return {String} an RGB string
       */
      rgbToRgbString: function rgbToRgbString(rgb) {
        return "rgb" + (rgb[3] !== undefined ? "a" : "") + "(" + rgb.join(",") + ")";
      },

      /**
       * Converts a RGB array to an hex6 string
       *
       * @param rgb {Array} an array with red, green and blue
       * @return {String} a hex6 string (#xxxxxx)
       */
      rgbToHexString: function rgbToHexString(rgb) {
        return "#" + qx.lang.String.pad(rgb[0].toString(16).toUpperCase(), 2) + qx.lang.String.pad(rgb[1].toString(16).toUpperCase(), 2) + qx.lang.String.pad(rgb[2].toString(16).toUpperCase(), 2);
      },

      /**
       * Detects if a string is a valid qooxdoo color
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid qooxdoo color
       */
      isValidPropertyValue: function isValidPropertyValue(str) {
        return this.isThemedColor(str) || this.isNamedColor(str) || this.isHex3String(str) || this.isHex6String(str) || this.isRgbString(str) || this.isRgbaString(str);
      },

      /**
       * Detects if a string is a valid CSS color string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid CSS color string
       */
      isCssString: function isCssString(str) {
        return this.isSystemColor(str) || this.isNamedColor(str) || this.isHex3String(str) || this.isHex6String(str) || this.isRgbString(str) || this.isRgbaString(str);
      },

      /**
       * Detects if a string is a valid hex3 string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid hex3 string
       */
      isHex3String: function isHex3String(str) {
        return this.REGEXP.hex3.test(str);
      },

      /**
       * Detects if a string is a valid hex6 string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid hex6 string
       */
      isHex6String: function isHex6String(str) {
        return this.REGEXP.hex6.test(str);
      },

      /**
       * Detects if a string is a valid RGB string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid RGB string
       */
      isRgbString: function isRgbString(str) {
        return this.REGEXP.rgb.test(str);
      },

      /**
       * Detects if a string is a valid RGBA string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid RGBA string
       */
      isRgbaString: function isRgbaString(str) {
        return this.REGEXP.rgba.test(str);
      },

      /**
       * Converts a regexp object match of a rgb string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __rgbStringToRgb: function __rgbStringToRgb() {
        var red = parseInt(RegExp.$1, 10);
        var green = parseInt(RegExp.$2, 10);
        var blue = parseInt(RegExp.$3, 10);
        return [red, green, blue];
      },

      /**
       * Converts a regexp object match of a rgba string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __rgbaStringToRgb: function __rgbaStringToRgb() {
        var red = parseInt(RegExp.$1, 10);
        var green = parseInt(RegExp.$2, 10);
        var blue = parseInt(RegExp.$3, 10);
        var alpha = parseFloat(RegExp.$4, 10);

        if (red === 0 && green === 0 & blue === 0 && alpha === 0) {
          return [-1, -1, -1];
        }

        return [red, green, blue];
      },

      /**
       * Converts a regexp object match of a hex3 string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __hex3StringToRgb: function __hex3StringToRgb() {
        var red = parseInt(RegExp.$1, 16) * 17;
        var green = parseInt(RegExp.$2, 16) * 17;
        var blue = parseInt(RegExp.$3, 16) * 17;
        return [red, green, blue];
      },

      /**
       * Converts a regexp object match of a hex6 string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __hex6StringToRgb: function __hex6StringToRgb() {
        var red = parseInt(RegExp.$1, 16) * 16 + parseInt(RegExp.$2, 16);
        var green = parseInt(RegExp.$3, 16) * 16 + parseInt(RegExp.$4, 16);
        var blue = parseInt(RegExp.$5, 16) * 16 + parseInt(RegExp.$6, 16);
        return [red, green, blue];
      },

      /**
       * Converts a hex3 string to an RGB array
       *
       * @param value {String} a hex3 (#xxx) string
       * @return {Array} an array with red, green, blue
       */
      hex3StringToRgb: function hex3StringToRgb(value) {
        if (this.isHex3String(value)) {
          return this.__hex3StringToRgb(value);
        }

        throw new Error("Invalid hex3 value: " + value);
      },

      /**
       * Converts a hex3 (#xxx) string to a hex6 (#xxxxxx) string.
       *
       * @param value {String} a hex3 (#xxx) string
       * @return {String} The hex6 (#xxxxxx) string or the passed value when the
       *   passed value is not an hex3 (#xxx) value.
       */
      hex3StringToHex6String: function hex3StringToHex6String(value) {
        if (this.isHex3String(value)) {
          return this.rgbToHexString(this.hex3StringToRgb(value));
        }

        return value;
      },

      /**
       * Converts a hex6 string to an RGB array
       *
       * @param value {String} a hex6 (#xxxxxx) string
       * @return {Array} an array with red, green, blue
       */
      hex6StringToRgb: function hex6StringToRgb(value) {
        if (this.isHex6String(value)) {
          return this.__hex6StringToRgb(value);
        }

        throw new Error("Invalid hex6 value: " + value);
      },

      /**
       * Converts a hex string to an RGB array
       *
       * @param value {String} a hex3 (#xxx) or hex6 (#xxxxxx) string
       * @return {Array} an array with red, green, blue
       */
      hexStringToRgb: function hexStringToRgb(value) {
        if (this.isHex3String(value)) {
          return this.__hex3StringToRgb(value);
        }

        if (this.isHex6String(value)) {
          return this.__hex6StringToRgb(value);
        }

        throw new Error("Invalid hex value: " + value);
      },

      /**
       * Convert RGB colors to HSB
       *
       * @param rgb {Number[]} red, blue and green as array
       * @return {Array} an array with hue, saturation and brightness
       */
      rgbToHsb: function rgbToHsb(rgb) {
        var hue, saturation, brightness;
        var red = rgb[0];
        var green = rgb[1];
        var blue = rgb[2];
        var cmax = red > green ? red : green;

        if (blue > cmax) {
          cmax = blue;
        }

        var cmin = red < green ? red : green;

        if (blue < cmin) {
          cmin = blue;
        }

        brightness = cmax / 255.0;

        if (cmax != 0) {
          saturation = (cmax - cmin) / cmax;
        } else {
          saturation = 0;
        }

        if (saturation == 0) {
          hue = 0;
        } else {
          var redc = (cmax - red) / (cmax - cmin);
          var greenc = (cmax - green) / (cmax - cmin);
          var bluec = (cmax - blue) / (cmax - cmin);

          if (red == cmax) {
            hue = bluec - greenc;
          } else if (green == cmax) {
            hue = 2.0 + redc - bluec;
          } else {
            hue = 4.0 + greenc - redc;
          }

          hue = hue / 6.0;

          if (hue < 0) {
            hue = hue + 1.0;
          }
        }

        return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
      },

      /**
       * Convert HSB colors to RGB
       *
       * @param hsb {Number[]} an array with hue, saturation and brightness
       * @return {Integer[]} an array with red, green, blue
       */
      hsbToRgb: function hsbToRgb(hsb) {
        var i, f, p, r, t;
        var hue = hsb[0] / 360;
        var saturation = hsb[1] / 100;
        var brightness = hsb[2] / 100;

        if (hue >= 1.0) {
          hue %= 1.0;
        }

        if (saturation > 1.0) {
          saturation = 1.0;
        }

        if (brightness > 1.0) {
          brightness = 1.0;
        }

        var tov = Math.floor(255 * brightness);
        var rgb = {};

        if (saturation == 0.0) {
          rgb.red = rgb.green = rgb.blue = tov;
        } else {
          hue *= 6.0;
          i = Math.floor(hue);
          f = hue - i;
          p = Math.floor(tov * (1.0 - saturation));
          r = Math.floor(tov * (1.0 - saturation * f));
          t = Math.floor(tov * (1.0 - saturation * (1.0 - f)));

          switch (i) {
            case 0:
              rgb.red = tov;
              rgb.green = t;
              rgb.blue = p;
              break;

            case 1:
              rgb.red = r;
              rgb.green = tov;
              rgb.blue = p;
              break;

            case 2:
              rgb.red = p;
              rgb.green = tov;
              rgb.blue = t;
              break;

            case 3:
              rgb.red = p;
              rgb.green = r;
              rgb.blue = tov;
              break;

            case 4:
              rgb.red = t;
              rgb.green = p;
              rgb.blue = tov;
              break;

            case 5:
              rgb.red = tov;
              rgb.green = p;
              rgb.blue = r;
              break;
          }
        }

        return [rgb.red, rgb.green, rgb.blue];
      },

      /**
       * Creates a random color.
       *
       * @return {String} a valid qooxdoo/CSS rgb color string.
       */
      randomColor: function randomColor() {
        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        var b = Math.round(Math.random() * 255);
        return this.rgbToRgbString([r, g, b]);
      }
    }
  });
  qx.util.ColorUtil.$$dbClassInfo = $$dbClassInfo;
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
        "construct": true,
        "require": true
      },
      "qx.lang.Object": {},
      "qx.ui.layout.Util": {}
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
   * The grid layout manager arranges the items in a two dimensional
   * grid. Widgets can be placed into the grid's cells and may span multiple rows
   * and columns.
   *
   * *Features*
   *
   * * Flex values for rows and columns
   * * Minimal and maximal column and row sizes
   * * Manually setting of column and row sizes
   * * Horizontal and vertical alignment
   * * Horizontal and vertical spacing
   * * Column and row spans
   * * Auto-sizing
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>row</strong> <em>(Integer)</em>: The row of the cell the
   *   widget should occupy. Each cell can only containing one widget. This layout
   *   property is mandatory.
   * </li>
   * <li><strong>column</strong> <em>(Integer)</em>: The column of the cell the
   *   widget should occupy. Each cell can only containing one widget. This layout
   *   property is mandatory.
   * </li>
   * <li><strong>rowSpan</strong> <em>(Integer)</em>: The number of rows, the
   *   widget should span, starting from the row specified in the <code>row</code>
   *   property. The cells in the spanned rows must be empty as well.
   * </li>
   * <li><strong>colSpan</strong> <em>(Integer)</em>: The number of columns, the
   *   widget should span, starting from the column specified in the <code>column</code>
   *   property. The cells in the spanned columns must be empty as well.
   * </li>
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the grid layout.
   *
   * <pre class="javascript">
   * var layout = new qx.ui.layout.Grid();
   * layout.setRowFlex(0, 1); // make row 0 flexible
   * layout.setColumnWidth(1, 200); // set with of column 1 to 200 pixel
   *
   * var container = new qx.ui.container.Composite(layout);
   * container.add(new qx.ui.core.Widget(), {row: 0, column: 0});
   * container.add(new qx.ui.core.Widget(), {row: 0, column: 1});
   * container.add(new qx.ui.core.Widget(), {row: 1, column: 0, rowSpan: 2});
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/grid.html'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Grid", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param spacingX {Integer?0} The horizontal spacing between grid cells.
     *     Sets {@link #spacingX}.
     * @param spacingY {Integer?0} The vertical spacing between grid cells.
     *     Sets {@link #spacingY}.
     */
    construct: function construct(spacingX, spacingY) {
      qx.ui.layout.Abstract.constructor.call(this);
      this.__rowData = [];
      this.__colData = [];

      if (spacingX) {
        this.setSpacingX(spacingX);
      }

      if (spacingY) {
        this.setSpacingY(spacingY);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The horizontal spacing between grid cells.
       */
      spacingX: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /**
       * The vertical spacing between grid cells.
       */
      spacingY: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {Array} 2D array of grid cell data */
      __grid: null,
      __rowData: null,
      __colData: null,
      __colSpans: null,
      __rowSpans: null,
      __maxRowIndex: null,
      __maxColIndex: null,

      /** @type {Array} cached row heights */
      __rowHeights: null,

      /** @type {Array} cached column widths */
      __colWidths: null,
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        var layoutProperties = {
          "row": 1,
          "column": 1,
          "rowSpan": 1,
          "colSpan": 1
        };
        this.assert(layoutProperties[name] == 1, "The property '" + name + "' is not supported by the Grid layout!");
        this.assertInteger(value);
        this.assert(value >= 0, "Value must be positive");
      },

      /**
       * Rebuild the internal representation of the grid
       */
      __buildGrid: function __buildGrid() {
        var grid = [];
        var colSpans = [];
        var rowSpans = [];
        var maxRowIndex = -1;
        var maxColIndex = -1;

        var children = this._getLayoutChildren();

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          var props = child.getLayoutProperties();
          var row = props.row;
          var column = props.column;
          props.colSpan = props.colSpan || 1;
          props.rowSpan = props.rowSpan || 1; // validate arguments

          if (row == null || column == null) {
            throw new Error("The layout properties 'row' and 'column' of the child widget '" + child + "' must be defined!");
          }

          if (grid[row] && grid[row][column]) {
            throw new Error("Cannot add widget '" + child + "'!. " + "There is already a widget '" + grid[row][column] + "' in this cell (" + row + ", " + column + ") for '" + this + "'");
          }

          for (var x = column; x < column + props.colSpan; x++) {
            for (var y = row; y < row + props.rowSpan; y++) {
              if (grid[y] == undefined) {
                grid[y] = [];
              }

              grid[y][x] = child;
              maxColIndex = Math.max(maxColIndex, x);
              maxRowIndex = Math.max(maxRowIndex, y);
            }
          }

          if (props.rowSpan > 1) {
            rowSpans.push(child);
          }

          if (props.colSpan > 1) {
            colSpans.push(child);
          }
        } // make sure all columns are defined so that accessing the grid using
        // this.__grid[column][row] will never raise an exception


        for (var y = 0; y <= maxRowIndex; y++) {
          if (grid[y] == undefined) {
            grid[y] = [];
          }
        }

        this.__grid = grid;
        this.__colSpans = colSpans;
        this.__rowSpans = rowSpans;
        this.__maxRowIndex = maxRowIndex;
        this.__maxColIndex = maxColIndex;
        this.__rowHeights = null;
        this.__colWidths = null; // Clear invalidation marker

        delete this._invalidChildrenCache;
      },

      /**
       * Stores data for a grid row
       *
       * @param row {Integer} The row index
       * @param key {String} The key under which the data should be stored
       * @param value {var} data to store
       */
      _setRowData: function _setRowData(row, key, value) {
        var rowData = this.__rowData[row];

        if (!rowData) {
          this.__rowData[row] = {};
          this.__rowData[row][key] = value;
        } else {
          rowData[key] = value;
        }
      },

      /**
       * Stores data for a grid column
       *
       * @param column {Integer} The column index
       * @param key {String} The key under which the data should be stored
       * @param value {var} data to store
       */
      _setColumnData: function _setColumnData(column, key, value) {
        var colData = this.__colData[column];

        if (!colData) {
          this.__colData[column] = {};
          this.__colData[column][key] = value;
        } else {
          colData[key] = value;
        }
      },

      /**
       * Shortcut to set both horizontal and vertical spacing between grid cells
       * to the same value.
       *
       * @param spacing {Integer} new horizontal and vertical spacing
       * @return {qx.ui.layout.Grid} This object (for chaining support).
       */
      setSpacing: function setSpacing(spacing) {
        this.setSpacingY(spacing);
        this.setSpacingX(spacing);
        return this;
      },

      /**
       * Set the default cell alignment for a column. This alignment can be
       * overridden on a per cell basis by setting the cell's content widget's
       * <code>alignX</code> and <code>alignY</code> properties.
       *
       * If on a grid cell both row and a column alignment is set, the horizontal
       * alignment is taken from the column and the vertical alignment is taken
       * from the row.
       *
       * @param column {Integer} Column index
       * @param hAlign {String} The horizontal alignment. Valid values are
       *    "left", "center" and "right".
       * @param vAlign {String} The vertical alignment. Valid values are
       *    "top", "middle", "bottom"
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnAlign: function setColumnAlign(column, hAlign, vAlign) {
        {
          this.assertInteger(column, "Invalid parameter 'column'");
          this.assertInArray(hAlign, ["left", "center", "right"]);
          this.assertInArray(vAlign, ["top", "middle", "bottom"]);
        }

        this._setColumnData(column, "hAlign", hAlign);

        this._setColumnData(column, "vAlign", vAlign);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get a map of the column's alignment.
       *
       * @param column {Integer} The column index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal column alignment.
       */
      getColumnAlign: function getColumnAlign(column) {
        var colData = this.__colData[column] || {};
        return {
          vAlign: colData.vAlign || "top",
          hAlign: colData.hAlign || "left"
        };
      },

      /**
       * Set the default cell alignment for a row. This alignment can be
       * overridden on a per cell basis by setting the cell's content widget's
       * <code>alignX</code> and <code>alignY</code> properties.
       *
       * If on a grid cell both row and a column alignment is set, the horizontal
       * alignment is taken from the column and the vertical alignment is taken
       * from the row.
       *
       * @param row {Integer} Row index
       * @param hAlign {String} The horizontal alignment. Valid values are
       *    "left", "center" and "right".
       * @param vAlign {String} The vertical alignment. Valid values are
       *    "top", "middle", "bottom"
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowAlign: function setRowAlign(row, hAlign, vAlign) {
        {
          this.assertInteger(row, "Invalid parameter 'row'");
          this.assertInArray(hAlign, ["left", "center", "right"]);
          this.assertInArray(vAlign, ["top", "middle", "bottom"]);
        }

        this._setRowData(row, "hAlign", hAlign);

        this._setRowData(row, "vAlign", vAlign);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get a map of the row's alignment.
       *
       * @param row {Integer} The Row index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal row alignment.
       */
      getRowAlign: function getRowAlign(row) {
        var rowData = this.__rowData[row] || {};
        return {
          vAlign: rowData.vAlign || "top",
          hAlign: rowData.hAlign || "left"
        };
      },

      /**
       * Get the widget located in the cell. If a the cell is empty or the widget
       * has a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>,
       * <code>null</code> is returned.
       *
       * @param row {Integer} The cell's row index
       * @param column {Integer} The cell's column index
       * @return {qx.ui.core.Widget|null}The cell's widget. The value may be null.
       */
      getCellWidget: function getCellWidget(row, column) {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        }

        var row = this.__grid[row] || {};
        return row[column] || null;
      },

      /**
       * Get the number of rows in the grid layout.
       *
       * @return {Integer} The number of rows in the layout
       */
      getRowCount: function getRowCount() {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        }

        return this.__maxRowIndex + 1;
      },

      /**
       * Get the number of columns in the grid layout.
       *
       * @return {Integer} The number of columns in the layout
       */
      getColumnCount: function getColumnCount() {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        }

        return this.__maxColIndex + 1;
      },

      /**
       * Get a map of the cell's alignment. For vertical alignment the row alignment
       * takes precedence over the column alignment. For horizontal alignment it is
       * the over way round. If an alignment is set on the cell widget using
       * {@link qx.ui.core.LayoutItem#setLayoutProperties}, this alignment takes
       * always precedence over row or column alignment.
       *
       * @param row {Integer} The cell's row index
       * @param column {Integer} The cell's column index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal cell alignment.
       */
      getCellAlign: function getCellAlign(row, column) {
        var vAlign = "top";
        var hAlign = "left";
        var rowData = this.__rowData[row];
        var colData = this.__colData[column];
        var widget = this.__grid[row][column];

        if (widget) {
          var widgetProps = {
            vAlign: widget.getAlignY(),
            hAlign: widget.getAlignX()
          };
        } else {
          widgetProps = {};
        } // compute vAlign
        // precedence : widget -> row -> column


        if (widgetProps.vAlign) {
          vAlign = widgetProps.vAlign;
        } else if (rowData && rowData.vAlign) {
          vAlign = rowData.vAlign;
        } else if (colData && colData.vAlign) {
          vAlign = colData.vAlign;
        } // compute hAlign
        // precedence : widget -> column -> row


        if (widgetProps.hAlign) {
          hAlign = widgetProps.hAlign;
        } else if (colData && colData.hAlign) {
          hAlign = colData.hAlign;
        } else if (rowData && rowData.hAlign) {
          hAlign = rowData.hAlign;
        }

        return {
          vAlign: vAlign,
          hAlign: hAlign
        };
      },

      /**
       * Set the flex value for a grid column.
       * By default the column flex value is <code>0</code>.
       *
       * @param column {Integer} The column index
       * @param flex {Integer} The column's flex value
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnFlex: function setColumnFlex(column, flex) {
        this._setColumnData(column, "flex", flex);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the flex value of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's flex value
       */
      getColumnFlex: function getColumnFlex(column) {
        var colData = this.__colData[column] || {};
        return colData.flex !== undefined ? colData.flex : 0;
      },

      /**
       * Set the flex value for a grid row.
       * By default the row flex value is <code>0</code>.
       *
       * @param row {Integer} The row index
       * @param flex {Integer} The row's flex value
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowFlex: function setRowFlex(row, flex) {
        this._setRowData(row, "flex", flex);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the flex value of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's flex value
       */
      getRowFlex: function getRowFlex(row) {
        var rowData = this.__rowData[row] || {};
        var rowFlex = rowData.flex !== undefined ? rowData.flex : 0;
        return rowFlex;
      },

      /**
       * Set the maximum width of a grid column.
       * The default value is <code>Infinity</code>.
       *
       * @param column {Integer} The column index
       * @param maxWidth {Integer} The column's maximum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnMaxWidth: function setColumnMaxWidth(column, maxWidth) {
        this._setColumnData(column, "maxWidth", maxWidth);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the maximum width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's maximum width
       */
      getColumnMaxWidth: function getColumnMaxWidth(column) {
        var colData = this.__colData[column] || {};
        return colData.maxWidth !== undefined ? colData.maxWidth : Infinity;
      },

      /**
       * Set the preferred width of a grid column.
       * The default value is <code>Infinity</code>.
       *
       * @param column {Integer} The column index
       * @param width {Integer} The column's width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnWidth: function setColumnWidth(column, width) {
        this._setColumnData(column, "width", width);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the preferred width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's width
       */
      getColumnWidth: function getColumnWidth(column) {
        var colData = this.__colData[column] || {};
        return colData.width !== undefined ? colData.width : null;
      },

      /**
       * Set the minimum width of a grid column.
       * The default value is <code>0</code>.
       *
       * @param column {Integer} The column index
       * @param minWidth {Integer} The column's minimum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnMinWidth: function setColumnMinWidth(column, minWidth) {
        this._setColumnData(column, "minWidth", minWidth);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the minimum width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's minimum width
       */
      getColumnMinWidth: function getColumnMinWidth(column) {
        var colData = this.__colData[column] || {};
        return colData.minWidth || 0;
      },

      /**
       * Set the maximum height of a grid row.
       * The default value is <code>Infinity</code>.
       *
       * @param row {Integer} The row index
       * @param maxHeight {Integer} The row's maximum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowMaxHeight: function setRowMaxHeight(row, maxHeight) {
        this._setRowData(row, "maxHeight", maxHeight);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the maximum height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's maximum width
       */
      getRowMaxHeight: function getRowMaxHeight(row) {
        var rowData = this.__rowData[row] || {};
        return rowData.maxHeight || Infinity;
      },

      /**
       * Set the preferred height of a grid row.
       * The default value is <code>Infinity</code>.
       *
       * @param row {Integer} The row index
       * @param height {Integer} The row's width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowHeight: function setRowHeight(row, height) {
        this._setRowData(row, "height", height);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the preferred height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's width
       */
      getRowHeight: function getRowHeight(row) {
        var rowData = this.__rowData[row] || {};
        return rowData.height !== undefined ? rowData.height : null;
      },

      /**
       * Set the minimum height of a grid row.
       * The default value is <code>0</code>.
       *
       * @param row {Integer} The row index
       * @param minHeight {Integer} The row's minimum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowMinHeight: function setRowMinHeight(row, minHeight) {
        this._setRowData(row, "minHeight", minHeight);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the minimum height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's minimum width
       */
      getRowMinHeight: function getRowMinHeight(row) {
        var rowData = this.__rowData[row] || {};
        return rowData.minHeight || 0;
      },

      /**
       * Computes the widget's size hint including the widget's margins
       *
       * @param widget {qx.ui.core.LayoutItem} The widget to get the size for
       * @return {Map} a size hint map
       */
      __getOuterSize: function __getOuterSize(widget) {
        var hint = widget.getSizeHint();
        var hMargins = widget.getMarginLeft() + widget.getMarginRight();
        var vMargins = widget.getMarginTop() + widget.getMarginBottom();
        var outerSize = {
          height: hint.height + vMargins,
          width: hint.width + hMargins,
          minHeight: hint.minHeight + vMargins,
          minWidth: hint.minWidth + hMargins,
          maxHeight: hint.maxHeight + vMargins,
          maxWidth: hint.maxWidth + hMargins
        };
        return outerSize;
      },

      /**
       * Check whether all row spans fit with their preferred height into the
       * preferred row heights. If there is not enough space, the preferred
       * row sizes are increased. The distribution respects the flex and max
       * values of the rows.
       *
       *  The same is true for the min sizes.
       *
       *  The height array is modified in place.
       *
       * @param rowHeights {Map[]} The current row height array as computed by
       *     {@link #_getRowHeights}.
       */
      _fixHeightsRowSpan: function _fixHeightsRowSpan(rowHeights) {
        var vSpacing = this.getSpacingY();

        for (var i = 0, l = this.__rowSpans.length; i < l; i++) {
          var widget = this.__rowSpans[i];

          var hint = this.__getOuterSize(widget);

          var widgetProps = widget.getLayoutProperties();
          var widgetRow = widgetProps.row;
          var prefSpanHeight = vSpacing * (widgetProps.rowSpan - 1);
          var minSpanHeight = prefSpanHeight;
          var rowFlexes = {};

          for (var j = 0; j < widgetProps.rowSpan; j++) {
            var row = widgetProps.row + j;
            var rowHeight = rowHeights[row];
            var rowFlex = this.getRowFlex(row);

            if (rowFlex > 0) {
              // compute flex array for the preferred height
              rowFlexes[row] = {
                min: rowHeight.minHeight,
                value: rowHeight.height,
                max: rowHeight.maxHeight,
                flex: rowFlex
              };
            }

            prefSpanHeight += rowHeight.height;
            minSpanHeight += rowHeight.minHeight;
          } // If there is not enough space for the preferred size
          // increment the preferred row sizes.


          if (prefSpanHeight < hint.height) {
            if (!qx.lang.Object.isEmpty(rowFlexes)) {
              var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(rowFlexes, hint.height, prefSpanHeight);

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                var offset = rowIncrements[widgetRow + k] ? rowIncrements[widgetRow + k].offset : 0;
                rowHeights[widgetRow + k].height += offset;
              } // row is too small and we have no flex value set

            } else {
              var totalSpacing = vSpacing * (widgetProps.rowSpan - 1);
              var availableHeight = hint.height - totalSpacing; // get the row height which every child would need to share the
              // available hight equally

              var avgRowHeight = Math.floor(availableHeight / widgetProps.rowSpan); // get the hight already used and the number of children which do
              // not have at least that avg row height

              var usedHeight = 0;
              var rowsNeedAddition = 0;

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                var currentHeight = rowHeights[widgetRow + k].height;
                usedHeight += currentHeight;

                if (currentHeight < avgRowHeight) {
                  rowsNeedAddition++;
                }
              } // the difference of available and used needs to be shared among
              // those not having the min size


              var additionalRowHeight = Math.floor((availableHeight - usedHeight) / rowsNeedAddition); // add the extra height to the too small children

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                if (rowHeights[widgetRow + k].height < avgRowHeight) {
                  rowHeights[widgetRow + k].height += additionalRowHeight;
                }
              }
            }
          } // If there is not enough space for the min size
          // increment the min row sizes.


          if (minSpanHeight < hint.minHeight) {
            var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(rowFlexes, hint.minHeight, minSpanHeight);

            for (var j = 0; j < widgetProps.rowSpan; j++) {
              var offset = rowIncrements[widgetRow + j] ? rowIncrements[widgetRow + j].offset : 0;
              rowHeights[widgetRow + j].minHeight += offset;
            }
          }
        }
      },

      /**
       * Check whether all col spans fit with their preferred width into the
       * preferred column widths. If there is not enough space the preferred
       * column sizes are increased. The distribution respects the flex and max
       * values of the columns.
       *
       *  The same is true for the min sizes.
       *
       *  The width array is modified in place.
       *
       * @param colWidths {Map[]} The current column width array as computed by
       *     {@link #_getColWidths}.
       */
      _fixWidthsColSpan: function _fixWidthsColSpan(colWidths) {
        var hSpacing = this.getSpacingX();

        for (var i = 0, l = this.__colSpans.length; i < l; i++) {
          var widget = this.__colSpans[i];

          var hint = this.__getOuterSize(widget);

          var widgetProps = widget.getLayoutProperties();
          var widgetColumn = widgetProps.column;
          var prefSpanWidth = hSpacing * (widgetProps.colSpan - 1);
          var minSpanWidth = prefSpanWidth;
          var colFlexes = {};
          var offset;

          for (var j = 0; j < widgetProps.colSpan; j++) {
            var col = widgetProps.column + j;
            var colWidth = colWidths[col];
            var colFlex = this.getColumnFlex(col); // compute flex array for the preferred width

            if (colFlex > 0) {
              colFlexes[col] = {
                min: colWidth.minWidth,
                value: colWidth.width,
                max: colWidth.maxWidth,
                flex: colFlex
              };
            }

            prefSpanWidth += colWidth.width;
            minSpanWidth += colWidth.minWidth;
          } // If there is not enough space for the preferred size
          // increment the preferred column sizes.


          if (prefSpanWidth < hint.width) {
            var colIncrements = qx.ui.layout.Util.computeFlexOffsets(colFlexes, hint.width, prefSpanWidth);

            for (var j = 0; j < widgetProps.colSpan; j++) {
              offset = colIncrements[widgetColumn + j] ? colIncrements[widgetColumn + j].offset : 0;
              colWidths[widgetColumn + j].width += offset;
            }
          } // If there is not enough space for the min size
          // increment the min column sizes.


          if (minSpanWidth < hint.minWidth) {
            var colIncrements = qx.ui.layout.Util.computeFlexOffsets(colFlexes, hint.minWidth, minSpanWidth);

            for (var j = 0; j < widgetProps.colSpan; j++) {
              offset = colIncrements[widgetColumn + j] ? colIncrements[widgetColumn + j].offset : 0;
              colWidths[widgetColumn + j].minWidth += offset;
            }
          }
        }
      },

      /**
       * Compute the min/pref/max row heights.
       *
       * @return {Map[]} An array containing height information for each row. The
       *     entries have the keys <code>minHeight</code>, <code>maxHeight</code> and
       *     <code>height</code>.
       */
      _getRowHeights: function _getRowHeights() {
        if (this.__rowHeights != null) {
          return this.__rowHeights;
        }

        var rowHeights = [];
        var maxRowIndex = this.__maxRowIndex;
        var maxColIndex = this.__maxColIndex;

        for (var row = 0; row <= maxRowIndex; row++) {
          var minHeight = 0;
          var height = 0;
          var maxHeight = 0;

          for (var col = 0; col <= maxColIndex; col++) {
            var widget = this.__grid[row][col];

            if (!widget) {
              continue;
            } // ignore rows with row spans at this place
            // these rows will be taken into account later


            var widgetRowSpan = widget.getLayoutProperties().rowSpan || 0;

            if (widgetRowSpan > 1) {
              continue;
            }

            var cellSize = this.__getOuterSize(widget);

            if (this.getRowFlex(row) > 0) {
              minHeight = Math.max(minHeight, cellSize.minHeight);
            } else {
              minHeight = Math.max(minHeight, cellSize.height);
            }

            height = Math.max(height, cellSize.height);
          }

          var minHeight = Math.max(minHeight, this.getRowMinHeight(row));
          var maxHeight = this.getRowMaxHeight(row);

          if (this.getRowHeight(row) !== null) {
            var height = this.getRowHeight(row);
          } else {
            var height = Math.max(minHeight, Math.min(height, maxHeight));
          }

          rowHeights[row] = {
            minHeight: minHeight,
            height: height,
            maxHeight: maxHeight
          };
        }

        if (this.__rowSpans.length > 0) {
          this._fixHeightsRowSpan(rowHeights);
        }

        this.__rowHeights = rowHeights;
        return rowHeights;
      },

      /**
       * Compute the min/pref/max column widths.
       *
       * @return {Map[]} An array containing width information for each column. The
       *     entries have the keys <code>minWidth</code>, <code>maxWidth</code> and
       *     <code>width</code>.
       */
      _getColWidths: function _getColWidths() {
        if (this.__colWidths != null) {
          return this.__colWidths;
        }

        var colWidths = [];
        var maxColIndex = this.__maxColIndex;
        var maxRowIndex = this.__maxRowIndex;

        for (var col = 0; col <= maxColIndex; col++) {
          var width = 0;
          var minWidth = 0;
          var maxWidth = Infinity;

          for (var row = 0; row <= maxRowIndex; row++) {
            var widget = this.__grid[row][col];

            if (!widget) {
              continue;
            } // ignore columns with col spans at this place
            // these columns will be taken into account later


            var widgetColSpan = widget.getLayoutProperties().colSpan || 0;

            if (widgetColSpan > 1) {
              continue;
            }

            var cellSize = this.__getOuterSize(widget);

            minWidth = Math.max(minWidth, cellSize.minWidth);
            width = Math.max(width, cellSize.width);
          }

          minWidth = Math.max(minWidth, this.getColumnMinWidth(col));
          maxWidth = this.getColumnMaxWidth(col);

          if (this.getColumnWidth(col) !== null) {
            var width = this.getColumnWidth(col);
          } else {
            var width = Math.max(minWidth, Math.min(width, maxWidth));
          }

          colWidths[col] = {
            minWidth: minWidth,
            width: width,
            maxWidth: maxWidth
          };
        }

        if (this.__colSpans.length > 0) {
          this._fixWidthsColSpan(colWidths);
        }

        this.__colWidths = colWidths;
        return colWidths;
      },

      /**
       * Computes for each column by how many pixels it must grow or shrink, taking
       * the column flex values and min/max widths into account.
       *
       * @param width {Integer} The grid width
       * @return {Integer[]} Sparse array of offsets to add to each column width. If
       *     an array entry is empty nothing should be added to the column.
       */
      _getColumnFlexOffsets: function _getColumnFlexOffsets(width) {
        var hint = this.getSizeHint();
        var diff = width - hint.width;

        if (diff == 0) {
          return {};
        } // collect all flexible children


        var colWidths = this._getColWidths();

        var flexibles = {};

        for (var i = 0, l = colWidths.length; i < l; i++) {
          var col = colWidths[i];
          var colFlex = this.getColumnFlex(i);

          if (colFlex <= 0 || col.width == col.maxWidth && diff > 0 || col.width == col.minWidth && diff < 0) {
            continue;
          }

          flexibles[i] = {
            min: col.minWidth,
            value: col.width,
            max: col.maxWidth,
            flex: colFlex
          };
        }

        return qx.ui.layout.Util.computeFlexOffsets(flexibles, width, hint.width);
      },

      /**
       * Computes for each row by how many pixels it must grow or shrink, taking
       * the row flex values and min/max heights into account.
       *
       * @param height {Integer} The grid height
       * @return {Integer[]} Sparse array of offsets to add to each row height. If
       *     an array entry is empty nothing should be added to the row.
       */
      _getRowFlexOffsets: function _getRowFlexOffsets(height) {
        var hint = this.getSizeHint();
        var diff = height - hint.height;

        if (diff == 0) {
          return {};
        } // collect all flexible children


        var rowHeights = this._getRowHeights();

        var flexibles = {};

        for (var i = 0, l = rowHeights.length; i < l; i++) {
          var row = rowHeights[i];
          var rowFlex = this.getRowFlex(i);

          if (rowFlex <= 0 || row.height == row.maxHeight && diff > 0 || row.height == row.minHeight && diff < 0) {
            continue;
          }

          flexibles[i] = {
            min: row.minHeight,
            value: row.height,
            max: row.maxHeight,
            flex: rowFlex
          };
        }

        return qx.ui.layout.Util.computeFlexOffsets(flexibles, height, hint.height);
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        }

        var Util = qx.ui.layout.Util;
        var hSpacing = this.getSpacingX();
        var vSpacing = this.getSpacingY(); // calculate column widths

        var prefWidths = this._getColWidths();

        var colStretchOffsets = this._getColumnFlexOffsets(availWidth);

        var colWidths = [];
        var maxColIndex = this.__maxColIndex;
        var maxRowIndex = this.__maxRowIndex;
        var offset;

        for (var col = 0; col <= maxColIndex; col++) {
          offset = colStretchOffsets[col] ? colStretchOffsets[col].offset : 0;
          colWidths[col] = prefWidths[col].width + offset;
        } // calculate row heights


        var prefHeights = this._getRowHeights();

        var rowStretchOffsets = this._getRowFlexOffsets(availHeight);

        var rowHeights = [];

        for (var row = 0; row <= maxRowIndex; row++) {
          offset = rowStretchOffsets[row] ? rowStretchOffsets[row].offset : 0;
          rowHeights[row] = prefHeights[row].height + offset;
        } // do the layout


        var left = 0;

        for (var col = 0; col <= maxColIndex; col++) {
          var top = 0;

          for (var row = 0; row <= maxRowIndex; row++) {
            var widget = this.__grid[row][col]; // ignore empty cells

            if (!widget) {
              top += rowHeights[row] + vSpacing;
              continue;
            }

            var widgetProps = widget.getLayoutProperties(); // ignore cells, which have cell spanning but are not the origin
            // of the widget

            if (widgetProps.row !== row || widgetProps.column !== col) {
              top += rowHeights[row] + vSpacing;
              continue;
            } // compute sizes width including cell spanning


            var spanWidth = hSpacing * (widgetProps.colSpan - 1);

            for (var i = 0; i < widgetProps.colSpan; i++) {
              spanWidth += colWidths[col + i];
            }

            var spanHeight = vSpacing * (widgetProps.rowSpan - 1);

            for (var i = 0; i < widgetProps.rowSpan; i++) {
              spanHeight += rowHeights[row + i];
            }

            var cellHint = widget.getSizeHint();
            var marginTop = widget.getMarginTop();
            var marginLeft = widget.getMarginLeft();
            var marginBottom = widget.getMarginBottom();
            var marginRight = widget.getMarginRight();
            var cellWidth = Math.max(cellHint.minWidth, Math.min(spanWidth - marginLeft - marginRight, cellHint.maxWidth));
            var cellHeight = Math.max(cellHint.minHeight, Math.min(spanHeight - marginTop - marginBottom, cellHint.maxHeight));
            var cellAlign = this.getCellAlign(row, col);
            var cellLeft = left + Util.computeHorizontalAlignOffset(cellAlign.hAlign, cellWidth, spanWidth, marginLeft, marginRight);
            var cellTop = top + Util.computeVerticalAlignOffset(cellAlign.vAlign, cellHeight, spanHeight, marginTop, marginBottom);
            widget.renderLayout(cellLeft + padding.left, cellTop + padding.top, cellWidth, cellHeight);
            top += rowHeights[row] + vSpacing;
          }

          left += colWidths[col] + hSpacing;
        }
      },
      // overridden
      invalidateLayoutCache: function invalidateLayoutCache() {
        qx.ui.layout.Grid.prototype.invalidateLayoutCache.base.call(this);
        this.__colWidths = null;
        this.__rowHeights = null;
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        } // calculate col widths


        var colWidths = this._getColWidths();

        var minWidth = 0,
            width = 0;

        for (var i = 0, l = colWidths.length; i < l; i++) {
          var col = colWidths[i];

          if (this.getColumnFlex(i) > 0) {
            minWidth += col.minWidth;
          } else {
            minWidth += col.width;
          }

          width += col.width;
        } // calculate row heights


        var rowHeights = this._getRowHeights();

        var minHeight = 0,
            height = 0;

        for (var i = 0, l = rowHeights.length; i < l; i++) {
          var row = rowHeights[i];

          if (this.getRowFlex(i) > 0) {
            minHeight += row.minHeight;
          } else {
            minHeight += row.height;
          }

          height += row.height;
        }

        var spacingX = this.getSpacingX() * (colWidths.length - 1);
        var spacingY = this.getSpacingY() * (rowHeights.length - 1);
        var hint = {
          minWidth: minWidth + spacingX,
          width: width + spacingX,
          minHeight: minHeight + spacingY,
          height: height + spacingY
        };
        return hint;
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__grid = this.__rowData = this.__colData = this.__colSpans = this.__rowSpans = this.__colWidths = this.__rowHeights = null;
    }
  });
  qx.ui.layout.Grid.$$dbClassInfo = $$dbClassInfo;
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
       2017 Martijn Evers, The Netherlands
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martijn Evers (mever)
  
  ************************************************************************ */

  /**
   * Field interface.
   *
   * This interface allows any value to be set as long as the following constraint
   * is met: any value returned by {@link getValue} can be set by {@link setValue}.
   *
   * This specifies the interface for handling the model value of a field.
   * The model value is always in a consistent state (see duration example), and
   * should only handle model values of a type that correctly represents the
   * data available through its UI. E.g.: duration can ideally be modeled by a number
   * of time units, like seconds. When using a date the duration may be
   * unclear (since Unix time?). Type conversions should be handled by data binding.
   *
   * The model value is not necessary what is shown to the end-user
   * by implementing class. A good example is the {@link qx.ui.form.TextField}
   * which is able to operate with or without live updating the model value.
   *
   * Duration example: a field for duration may use two date pickers for begin
   * and end dates. When the end date is before the start date the model is in
   * inconsistent state. getValue should never return such state. And calling
   * it must result in either null or the last consistent value (depending
   * on implementation or setting).
   */
  qx.Interface.define("qx.ui.form.IField", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the model value was modified */
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
       * Sets the field model value. Should also update the UI.
       *
       * @param value {var|null} Updates the field with the new model value.
       * @return {null|Error} Should return an error when the type of
       *  model value is not compatible with the implementing class (the concrete field).
       */
      setValue: function setValue(value) {
        return arguments.length == 1;
      },

      /**
       * Resets the model value to its initial value. Should also update the UI.
       */
      resetValue: function resetValue() {},

      /**
       * Returns a consistent and up-to-date model value.
       *
       * Note: returned value can also be a promise of type <code>Promise&lt;*|null&gt;</code>.
       *
       * @return {var|null} The model value plain or as promise.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.IField.$$dbClassInfo = $$dbClassInfo;
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
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Each object, which should support single selection have to
   * implement this interface.
   */
  qx.Interface.define("qx.ui.core.ISingleSelection", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the selection was modified */
      "changeSelection": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {qx.ui.core.Widget[]} List of items.
       */
      getSelection: function getSelection() {
        return true;
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if the item is not a child element.
       */
      setSelection: function setSelection(items) {
        return arguments.length == 1;
      },

      /**
       * Clears the whole selection at once.
       */
      resetSelection: function resetSelection() {
        return true;
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if the item is not a child element.
       */
      isSelected: function isSelected(item) {
        return arguments.length == 1;
      },

      /**
       * Whether the selection is empty.
       *
       * @return {Boolean} Whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return true;
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return arguments.length == 1;
      }
    }
  });
  qx.ui.core.ISingleSelection.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.ui.core.SingleSelectionManager": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This mixin links all methods to manage the single selection.
   *
   * The class which includes the mixin has to implements two methods:
   *
   * <ul>
   * <li><code>_getItems</code>, this method has to return a <code>Array</code>
   *    of <code>qx.ui.core.Widget</code> that should be managed from the manager.
   * </li>
   * <li><code>_isAllowEmptySelection</code>, this method has to return a
   *    <code>Boolean</code> value for allowing empty selection or not.
   * </li>
   * </ul>
   */
  qx.Mixin.define("qx.ui.core.MSingleSelectionHandling", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the value was modified */
      "changeValue": "qx.event.type.Data",

      /** Fires after the selection was modified */
      "changeSelection": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.SingleSelectionManager} the single selection manager */
      __manager: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * setValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @param item {null|qx.ui.core.Widget} Item to set as selected value.
       * @returns {null|TypeError} The status of this operation.
       */
      setValue: function setValue(item) {
        if (null === item) {
          this.resetSelection();
          return null;
        }

        if (item instanceof qx.ui.core.Widget) {
          this.__getManager().setSelected(item);

          return null;
        } else {
          return new TypeError("Given argument is not null or a {qx.ui.core.Widget}.");
        }
      },

      /**
       * getValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @returns {null|qx.ui.core.Widget} The currently selected widget or null if there is none.
       */
      getValue: function getValue() {
        return this.__getManager().getSelected() || null;
      },

      /**
       * resetValue implements part of the {@link qx.ui.form.IField} interface.
       */
      resetValue: function resetValue() {
        this.__getManager().resetSelected();
      },

      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {qx.ui.core.Widget[]} List of items.
       */
      getSelection: function getSelection() {
        var selected = this.__getManager().getSelected();

        if (selected) {
          return [selected];
        } else {
          return [];
        }
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if one of the items is not a child element and if
       *    items contains more than one elements.
       */
      setSelection: function setSelection(items) {
        switch (items.length) {
          case 0:
            this.resetSelection();
            break;

          case 1:
            this.__getManager().setSelected(items[0]);

            break;

          default:
            throw new Error("Could only select one item, but the selection array contains " + items.length + " items!");
        }
      },

      /**
       * Clears the whole selection at once.
       */
      resetSelection: function resetSelection() {
        this.__getManager().resetSelected();
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item.
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if one of the items is not a child element.
       */
      isSelected: function isSelected(item) {
        return this.__getManager().isSelected(item);
      },

      /**
       * Whether the selection is empty.
       *
       * @return {Boolean} Whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__getManager().isSelectionEmpty();
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return this.__getManager().getSelectables(all);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>changeSelected</code> event on single
       * selection manager.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      _onChangeSelected: function _onChangeSelected(e) {
        var newValue = e.getData();
        var oldValue = e.getOldData();
        this.fireDataEvent("changeValue", newValue, oldValue);
        newValue == null ? newValue = [] : newValue = [newValue];
        oldValue == null ? oldValue = [] : oldValue = [oldValue];
        this.fireDataEvent("changeSelection", newValue, oldValue);
      },

      /**
       * Return the selection manager if it is already exists, otherwise creates
       * the manager.
       *
       * @return {qx.ui.core.SingleSelectionManager} Single selection manager.
       */
      __getManager: function __getManager() {
        if (this.__manager == null) {
          var that = this;
          this.__manager = new qx.ui.core.SingleSelectionManager({
            getItems: function getItems() {
              return that._getItems();
            },
            isItemSelectable: function isItemSelectable(item) {
              if (that._isItemSelectable) {
                return that._isItemSelectable(item);
              } else {
                return item.isVisible();
              }
            }
          });

          this.__manager.addListener("changeSelected", this._onChangeSelected, this);
        }

        this.__manager.setAllowEmptySelection(this._isAllowEmptySelection());

        return this.__manager;
      }
    },

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__manager");
    }
  });
  qx.ui.core.MSingleSelectionHandling.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.IField": {
        "require": true
      },
      "qx.ui.core.ISingleSelection": {
        "require": true
      },
      "qx.ui.core.MSingleSelectionHandling": {
        "require": true
      },
      "qx.ui.core.MChildrenHandling": {
        "require": true
      },
      "qx.ui.layout.Grow": {
        "construct": true
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
       * Adrian Olaru (adrianolaru)
  
  ************************************************************************ */

  /**
   * The stack container puts its child widgets on top of each other and only the
   * topmost widget is visible.
   *
   * This is used e.g. in the tab view widget. Which widget is visible can be
   * controlled by using the {@link #getSelection} method.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create stack container
   *   var stack = new qx.ui.container.Stack();
   *
   *   // add some children
   *   stack.add(new qx.ui.core.Widget().set({
   *    backgroundColor: "red"
   *   }));
   *   stack.add(new qx.ui.core.Widget().set({
   *    backgroundColor: "green"
   *   }));
   *   stack.add(new qx.ui.core.Widget().set({
   *    backgroundColor: "blue"
   *   }));
   *
   *   // select green widget
   *   stack.setSelection([stack.getChildren()[1]]);
   *
   *   this.getRoot().add(stack);
   * </pre>
   *
   * This example creates an stack with three children. Only the selected "green"
   * widget is visible.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/stack.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.Stack", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.IField, qx.ui.core.ISingleSelection],
    include: [qx.ui.core.MSingleSelectionHandling, qx.ui.core.MChildrenHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Grow());

      this.addListener("changeSelection", this.__onChangeSelection, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Whether the size of the widget depends on the selected child. When
       * disabled (default) the size is configured to the largest child.
       */
      dynamic: {
        check: "Boolean",
        init: false,
        apply: "_applyDynamic"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // property apply
      _applyDynamic: function _applyDynamic(value) {
        var children = this._getChildren();

        var selected = this.getSelection()[0];
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child != selected) {
            if (value) {
              children[i].exclude();
            } else {
              children[i].hide();
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS FOR SELECTION API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the widget for the selection.
       * @return {qx.ui.core.Widget[]} Widgets to select.
       */
      _getItems: function _getItems() {
        return this.getChildren();
      },

      /**
       * Returns if the selection could be empty or not.
       *
       * @return {Boolean} <code>true</code> If selection could be empty,
       *    <code>false</code> otherwise.
       */
      _isAllowEmptySelection: function _isAllowEmptySelection() {
        return true;
      },

      /**
       * Returns whether the given item is selectable.
       *
       * @param item {qx.ui.core.Widget} The item to be checked
       * @return {Boolean} Whether the given item is selectable
       */
      _isItemSelectable: function _isItemSelectable(item) {
        return true;
      },

      /**
       * Event handler for <code>changeSelection</code>.
       *
       * Shows the new selected widget and hide the old one.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      __onChangeSelection: function __onChangeSelection(e) {
        var old = e.getOldData()[0];
        var value = e.getData()[0];

        if (old) {
          if (this.isDynamic()) {
            old.exclude();
          } else {
            old.hide();
          }
        }

        if (value) {
          value.show();
        }
      },
      //overridden
      _afterAddChild: function _afterAddChild(child) {
        var selected = this.getSelection()[0];

        if (!selected) {
          this.setSelection([child]);
        } else if (selected !== child) {
          if (this.isDynamic()) {
            child.exclude();
          } else {
            child.hide();
          }
        }
      },
      //overridden
      _afterRemoveChild: function _afterRemoveChild(child) {
        if (this.getSelection()[0] === child) {
          var first = this._getChildren()[0];

          if (first) {
            this.setSelection([first]);
          } else {
            this.resetSelection();
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Go to the previous child in the children list.
       */
      previous: function previous() {
        var selected = this.getSelection()[0];
        var go = this._indexOf(selected) - 1;

        var children = this._getChildren();

        if (go < 0) {
          go = children.length - 1;
        }

        var prev = children[go];
        this.setSelection([prev]);
      },

      /**
       * Go to the next child in the children list.
       */
      next: function next() {
        var selected = this.getSelection()[0];
        var go = this._indexOf(selected) + 1;

        var children = this._getChildren();

        var next = children[go] || children[0];
        this.setSelection([next]);
      }
    }
  });
  qx.ui.container.Stack.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-10.js.map
