(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Window": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.root.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.dom.Node": {
        "construct": true
      },
      "qx.event.Registration": {
        "construct": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.core.queue.Layout": {
        "construct": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.bom.client.OperatingSystem": {
        "construct": true
      },
      "qx.ui.core.Widget": {
        "construct": true
      },
      "qx.bom.client.Engine": {},
      "qx.html.Root": {},
      "qx.bom.Viewport": {},
      "qx.bom.element.Style": {},
      "qx.dom.Element": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "construct": true,
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This is the root widget for qooxdoo applications with an
   * "application" like behaviour. The widget will span the whole viewport
   * and the document body will have no scrollbars.
   *
   * The root widget does not support paddings and decorators with insets.
   *
   * If you want to enhance HTML pages with qooxdoo widgets please use
   * {@link qx.ui.root.Page} eventually in combination with
   * {@link qx.ui.root.Inline} widgets.
   *
   * This class uses a {@link qx.ui.layout.Canvas} as fixed layout. The layout
   * cannot be changed.
   *
   * @require(qx.event.handler.Window)
   * @ignore(qx.ui.popup)
   * @ignore(qx.ui.popup.Manager.*)
   * @ignore(qx.ui.menu)
   * @ignore(qx.ui.menu.Manager.*)
   * @ignore(qx.ui)
   */
  qx.Class.define("qx.ui.root.Application", {
    extend: qx.ui.root.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param doc {Document} Document to use
     */
    construct: function construct(doc) {
      // Symbolic links
      this.__window = qx.dom.Node.getWindow(doc);
      this.__doc = doc; // Base call

      qx.ui.root.Abstract.constructor.call(this); // Resize handling

      qx.event.Registration.addListener(this.__window, "resize", this._onResize, this); // Use a hard-coded canvas layout

      this._setLayout(new qx.ui.layout.Canvas()); // Directly schedule layout for root element


      qx.ui.core.queue.Layout.add(this); // Register as root

      qx.ui.core.FocusHandler.getInstance().connectTo(this);
      this.getContentElement().disableScrolling(); // quick fix for [BUG #7680]

      this.getContentElement().setStyle("-webkit-backface-visibility", "hidden"); // prevent scrolling on touch devices

      this.addListener("touchmove", this.__stopScrolling, this); // handle focus for iOS which seems to deny any focus action

      if (qx.core.Environment.get("os.name") == "ios") {
        this.getContentElement().addListener("tap", function (e) {
          var widget = qx.ui.core.Widget.getWidgetByElement(e.getTarget());

          while (widget && !widget.isFocusable()) {
            widget = widget.getLayoutParent();
          }

          if (widget && widget.isFocusable()) {
            widget.getContentElement().focus();
          }
        }, this, true);
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __window: null,
      __doc: null,
      // overridden

      /**
       * Create the widget's container HTML element.
       *
       * @lint ignoreDeprecated(alert)
       * @return {qx.html.Element} The container HTML element
       */
      _createContentElement: function _createContentElement() {
        var doc = this.__doc;

        if (qx.core.Environment.get("engine.name") == "webkit") {
          // In the "DOMContentLoaded" event of WebKit (Safari, Chrome) no body
          // element seems to be available in the DOM, if the HTML file did not
          // contain a body tag explicitly. Unfortunately, it cannot be added
          // here dynamically.
          if (!doc.body) {
            alert("The application could not be started due to a missing body tag in the HTML file!");
          }
        } // Apply application layout


        var hstyle = doc.documentElement.style;
        var bstyle = doc.body.style;
        hstyle.overflow = bstyle.overflow = "hidden";
        hstyle.padding = hstyle.margin = bstyle.padding = bstyle.margin = "0px";
        hstyle.width = hstyle.height = bstyle.width = bstyle.height = "100%";
        var elem = doc.createElement("div");
        doc.body.appendChild(elem);
        var root = new qx.html.Root(elem);
        root.setStyles({
          "position": "absolute",
          "overflowX": "hidden",
          "overflowY": "hidden"
        }); // Store reference to the widget in the DOM element.

        root.connectWidget(this);
        return root;
      },

      /**
       * Listener for window's resize event
       *
       * @param e {qx.event.type.Event} Event object
       */
      _onResize: function _onResize(e) {
        qx.ui.core.queue.Layout.add(this); // close all popups

        if (qx.ui.popup && qx.ui.popup.Manager) {
          qx.ui.popup.Manager.getInstance().hideAll();
        } // close all menus


        if (qx.ui.menu && qx.ui.menu.Manager) {
          qx.ui.menu.Manager.getInstance().hideAll();
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var width = qx.bom.Viewport.getWidth(this.__window);
        var height = qx.bom.Viewport.getHeight(this.__window);
        return {
          minWidth: width,
          width: width,
          maxWidth: width,
          minHeight: height,
          height: height,
          maxHeight: height
        };
      },
      // overridden
      _applyPadding: function _applyPadding(value, old, name) {
        if (value && (name == "paddingTop" || name == "paddingLeft")) {
          throw new Error("The root widget does not support 'left', or 'top' paddings!");
        }

        qx.ui.root.Application.prototype._applyPadding.base.call(this, value, old, name);
      },

      /**
       * Handler for the native 'touchstart' on the window which prevents
       * the native page scrolling.
       * @param e {qx.event.type.Touch} The qooxdoo touch event.
       */
      __stopScrolling: function __stopScrolling(e) {
        var node = e.getOriginalTarget();

        while (node && node.style) {
          var touchAction = qx.bom.element.Style.get(node, "touch-action") !== "none" && qx.bom.element.Style.get(node, "touch-action") !== "";
          var webkitOverflowScrolling = qx.bom.element.Style.get(node, "-webkit-overflow-scrolling") === "touch";
          var overflowX = qx.bom.element.Style.get(node, "overflowX") != "hidden";
          var overflowY = qx.bom.element.Style.get(node, "overflowY") != "hidden";

          if (touchAction || webkitOverflowScrolling || overflowY || overflowX) {
            return;
          }

          node = node.parentNode;
        }

        e.preventDefault();
      },
      // overridden
      destroy: function destroy() {
        if (this.$$disposed) {
          return;
        }

        qx.dom.Element.remove(this.getContentElement().getDomElement());
        qx.ui.root.Application.prototype.destroy.base.call(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__window = this.__doc = null;
    }
  });
  qx.ui.root.Application.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.bom.client.Event": {
        "require": true
      },
      "qx.bom.client.Browser": {},
      "qx.bom.HashHistory": {},
      "qx.bom.client.Engine": {},
      "qx.bom.IframeHistory": {},
      "qx.bom.NativeHistory": {},
      "qx.lang.Type": {},
      "qx.event.Timer": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "event.hashchange": {
          "load": true,
          "className": "qx.bom.client.Event"
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

  /* ************************************************************************
  
  
  ************************************************************************ */

  /**
   * A helper for using the browser history in JavaScript Applications without
   * reloading the main page.
   *
   * Adds entries to the browser history and fires a "request" event when one of
   * the entries was requested by the user (e.g. by clicking on the back button).
   *
   * This class is an abstract template class. Concrete implementations have to
   * provide implementations for the {@link #_readState} and {@link #_writeState}
   * methods.
   *
   * Browser history support is currently available for Internet Explorer 6/7,
   * Firefox, Opera 9 and WebKit. Safari 2 and older are not yet supported.
   *
   * This module is based on the ideas behind the YUI Browser History Manager
   * by Julien Lecomte (Yahoo), which is described at
   * http://yuiblog.com/blog/2007/02/21/browser-history-manager/. The Yahoo
   * implementation can be found at http://developer.yahoo.com/yui/history/.
   * The original code is licensed under a BSD license
   * (http://developer.yahoo.com/yui/license.txt).
   *
   * @asset(qx/static/blank.html)
   */
  qx.Class.define("qx.bom.History", {
    extend: qx.core.Object,
    type: "abstract",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this._baseUrl = window.location.href.split('#')[0] + '#';
      this._titles = {};

      this._setInitialState();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the user moved in the history. The data property of the event
       * holds the state, which was passed to {@link #addToHistory}.
       */
      "request": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * @type {Boolean} Whether the browser supports the 'hashchange' event natively.
       */
      SUPPORTS_HASH_CHANGE_EVENT: qx.core.Environment.get("event.hashchange"),

      /**
       * Get the singleton instance of the history manager.
       *
       * @return {History}
       */
      getInstance: function getInstance() {
        var runsInIframe = !(window == window.top);

        if (!this.$$instance) {
          // in iframe + IE9
          if (runsInIframe && qx.core.Environment.get("browser.documentmode") == 9) {
            this.$$instance = new qx.bom.HashHistory();
          } // in iframe + IE<9
          else if (runsInIframe && qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
              this.$$instance = new qx.bom.IframeHistory();
            } // browser with hashChange event
            else if (this.SUPPORTS_HASH_CHANGE_EVENT) {
                this.$$instance = new qx.bom.NativeHistory();
              } // IE without hashChange event
              else if (qx.core.Environment.get("engine.name") == "mshtml") {
                  this.$$instance = new qx.bom.IframeHistory();
                } // fallback
                else {
                    this.$$instance = new qx.bom.NativeHistory();
                  }
        }

        return this.$$instance;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Property holding the current title
       */
      title: {
        check: "String",
        event: "changeTitle",
        nullable: true,
        apply: "_applyTitle"
      },

      /**
       * Property holding the current state of the history.
       */
      state: {
        check: "String",
        event: "changeState",
        nullable: true,
        apply: "_applyState"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _titles: null,
      // property apply
      _applyState: function _applyState(value, old) {
        this._writeState(value);
      },

      /**
       * Populates the 'state' property with the initial state value
       */
      _setInitialState: function _setInitialState() {
        this.setState(this._readState());
      },

      /**
       * Encodes the state value into a format suitable as fragment identifier.
       *
       * @param value {String} The string to encode
       * @return {String} The encoded string
       */
      _encode: function _encode(value) {
        if (qx.lang.Type.isString(value)) {
          return encodeURIComponent(value);
        }

        return "";
      },

      /**
       * Decodes a fragment identifier into a string
       *
       * @param value {String} The fragment identifier
       * @return {String} The decoded fragment identifier
       */
      _decode: function _decode(value) {
        if (qx.lang.Type.isString(value)) {
          return decodeURIComponent(value);
        }

        return "";
      },
      // property apply
      _applyTitle: function _applyTitle(title) {
        if (title != null) {
          document.title = title || "";
        }
      },

      /**
       * Adds an entry to the browser history.
       *
       * @param state {String} a string representing the state of the
       *          application. This command will be delivered in the data property of
       *          the "request" event.
       * @param newTitle {String ? null} the page title to set after the history entry
       *          is done. This title should represent the new state of the application.
       */
      addToHistory: function addToHistory(state, newTitle) {
        if (!qx.lang.Type.isString(state)) {
          state = state + "";
        }

        if (qx.lang.Type.isString(newTitle)) {
          this.setTitle(newTitle);
          this._titles[state] = newTitle;
        }

        if (this.getState() !== state) {
          this._writeState(state);
        }
      },

      /**
       * Navigates back in the browser history.
       * Simulates a back button click.
       */
      navigateBack: function navigateBack() {
        qx.event.Timer.once(function () {
          history.back();
        }, this, 100);
      },

      /**
       * Navigates forward in the browser history.
       * Simulates a forward button click.
       */
      navigateForward: function navigateForward() {
        qx.event.Timer.once(function () {
          history.forward();
        }, this, 100);
      },

      /**
       * Called on changes to the history using the browser buttons.
       *
       * @param state {String} new state of the history
       */
      _onHistoryLoad: function _onHistoryLoad(state) {
        this.setState(state);
        this.fireDataEvent("request", state);

        if (this._titles[state] != null) {
          this.setTitle(this._titles[state]);
        }
      },

      /**
       * Browser dependent function to read the current state of the history
       *
       * @return {String} current state of the browser history
       */
      _readState: function _readState() {
        throw new Error("Abstract method call");
      },

      /**
       * Save a state into the browser history.
       *
       * @param state {String} state to save
       */
      _writeState: function _writeState(state) {
        throw new Error("Abstract method call");
      },

      /**
       * Sets the fragment identifier of the window URL
       *
       * @param value {String} the fragment identifier
       */
      _setHash: function _setHash(value) {
        var url = this._baseUrl + (value || "");
        var loc = window.location;

        if (url != loc.href) {
          loc.href = url;
        }
      },

      /**
       * Returns the fragment identifier of the top window URL. For gecko browsers we
       * have to use a regular expression to avoid encoding problems.
       *
       * @return {String} the fragment identifier
       */
      _getHash: function _getHash() {
        var hash = /#(.*)$/.exec(window.location.href);
        return hash && hash[1] ? hash[1] : "";
      }
    }
  });
  qx.bom.History.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-30.js.map
