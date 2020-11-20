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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.log.Logger": {}
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
   * Contains some common methods available to all log appenders.
   */
  qx.Bootstrap.define("qx.log.appender.Util", {
    statics: {
      /**
       * Converts a single log entry to HTML
       *
       * @signature function(entry)
       * @param entry {Map} The entry to process
       */
      toHtml: function toHtml(entry) {
        var output = [];
        var item, msg, sub, list;
        output.push("<span class='offset'>", this.formatOffset(entry.offset, 6), "</span> ");

        if (entry.object) {
          if (entry.clazz) {
            output.push("<span class='object' title='Object instance with hash code: " + entry.object + "'>", entry.clazz.classname, "[", entry.object, "]</span>: ");
          } else {
            var obj = entry.win.qx.core.ObjectRegistry.fromHashCode(entry.object, true);

            if (obj) {
              output.push("<span class='object' title='Object instance with hash code: " + obj.$$hash + "'>", obj.classname, "[", obj.$$hash, "]</span>: ");
            }
          }
        } else if (entry.clazz) {
          output.push("<span class='object'>" + entry.clazz.classname, "</span>: ");
        }

        var items = entry.items;

        for (var i = 0, il = items.length; i < il; i++) {
          item = items[i];
          msg = item.text;

          if (msg instanceof Array) {
            var list = [];

            for (var j = 0, jl = msg.length; j < jl; j++) {
              sub = msg[j];

              if (typeof sub === "string") {
                list.push("<span>" + this.escapeHTML(sub) + "</span>");
              } else if (sub.key) {
                list.push("<span class='type-key'>" + sub.key + "</span>:<span class='type-" + sub.type + "'>" + this.escapeHTML(sub.text) + "</span>");
              } else {
                list.push("<span class='type-" + sub.type + "'>" + this.escapeHTML(sub.text) + "</span>");
              }
            }

            output.push("<span class='type-" + item.type + "'>");

            if (item.type === "map") {
              output.push("{", list.join(", "), "}");
            } else {
              output.push("[", list.join(", "), "]");
            }

            output.push("</span>");
          } else {
            output.push("<span class='type-" + item.type + "'>" + this.escapeHTML(msg) + "</span> ");
          }
        }

        var wrapper = document.createElement("DIV");
        wrapper.innerHTML = output.join("");
        wrapper.className = "level-" + entry.level;
        return wrapper;
      },

      /**
       * Formats a numeric time offset to 6 characters.
       *
       * @param offset {Integer} Current offset value
       * @param length {Integer?6} Refine the length
       * @return {String} Padded string
       */
      formatOffset: function formatOffset(offset, length) {
        var str = offset.toString();
        var diff = (length || 6) - str.length;
        var pad = "";

        for (var i = 0; i < diff; i++) {
          pad += "0";
        }

        return pad + str;
      },

      /**
       * Escapes the HTML in the given value
       *
       * @param value {String} value to escape
       * @return {String} escaped value
       */
      escapeHTML: function escapeHTML(value) {
        return String(value).replace(/[<>&"']/g, this.__escapeHTMLReplace);
      },

      /**
       * Internal replacement helper for HTML escape.
       *
       * @param ch {String} Single item to replace.
       * @return {String} Replaced item
       */
      __escapeHTMLReplace: function __escapeHTMLReplace(ch) {
        var map = {
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          "'": "&#39;",
          '"': "&quot;"
        };
        return map[ch] || "?";
      },

      /**
       * Converts a single log entry to plain text
       *
       * @param entry {Map} The entry to process
       * @return {String} the formatted log entry
       */
      toText: function toText(entry) {
        return this.toTextArray(entry).join(" ");
      },

      /**
       * Converts a single log entry to an array of plain text
       *
       * @param entry {Map} The entry to process
       * @return {Array} Argument list ready message array.
       */
      toTextArray: function toTextArray(entry) {
        var output = [];
        output.push(this.formatOffset(entry.offset, 6));

        if (entry.object) {
          if (entry.clazz) {
            output.push(entry.clazz.classname + "[" + entry.object + "]:");
          } else {
            var obj = entry.win.qx.core.ObjectRegistry.fromHashCode(entry.object, true);

            if (obj) {
              output.push(obj.classname + "[" + obj.$$hash + "]:");
            }
          }
        } else if (entry.clazz) {
          output.push(entry.clazz.classname + ":");
        }

        var items = entry.items;
        var item, msg;

        for (var i = 0, il = items.length; i < il; i++) {
          item = items[i];
          msg = item.text;

          if (item.trace && item.trace.length > 0) {
            if (typeof this.FORMAT_STACK == "function") {
              qx.log.Logger.deprecatedConstantWarning(qx.log.appender.Util, "FORMAT_STACK", "Use qx.dev.StackTrace.FORMAT_STACKTRACE instead");
              msg += "\n" + this.FORMAT_STACK(item.trace);
            } else {
              msg += "\n" + item.trace;
            }
          }

          if (msg instanceof Array) {
            var list = [];

            for (var j = 0, jl = msg.length; j < jl; j++) {
              list.push(msg[j].text);
            }

            if (item.type === "map") {
              output.push("{", list.join(", "), "}");
            } else {
              output.push("[", list.join(", "), "]");
            }
          } else {
            output.push(msg);
          }
        }

        return output;
      }
    }
  });
  qx.log.appender.Util.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.log.appender.Util": {
        "require": true,
        "defer": "runtime"
      },
      "qx.bom.client.Html": {
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
      "qx.log.Logger": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "html.console": {
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
  
  ************************************************************************ */

  /**
   * Processes the incoming log entry and displays it by means of the native
   * logging capabilities of the client.
   *
   * Supported browsers:
   * * Firefox <4 using FireBug (if available).
   * * Firefox >=4 using the Web Console.
   * * WebKit browsers using the Web Inspector/Developer Tools.
   * * Internet Explorer 8+ using the F12 Developer Tools.
   * * Opera >=10.60 using either the Error Console or Dragonfly
   *
   * Currently unsupported browsers:
   * * Opera <10.60
   *
   * @require(qx.log.appender.Util)
   * @require(qx.bom.client.Html)
   */
  qx.Bootstrap.define("qx.log.appender.Native", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Processes a single log entry
       *
       * @param entry {Map} The entry to process
       */
      process: function process(entry) {
        if (qx.core.Environment.get("html.console")) {
          // Firefox 4's Web Console doesn't support "debug"
          var level = console[entry.level] ? entry.level : "log";

          if (console[level]) {
            var args = qx.log.appender.Util.toText(entry);
            console[level](args);
          }
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.log.Logger.register(statics);
    }
  });
  qx.log.appender.Native.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-7.js.map
