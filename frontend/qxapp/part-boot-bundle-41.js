(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * The slider of the SplitPane (used during drag sessions for fast feedback)
   *
   * @internal
   */
  qx.Class.define("qx.ui.splitpane.Slider", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      allowShrinkX: {
        refine: true,
        init: false
      },
      // overridden
      allowShrinkY: {
        refine: true,
        init: false
      }
    }
  });
  qx.ui.splitpane.Slider.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * The splitter is the element between the two panes.
   *
   * @internal
   *
   * @childControl knob {qx.ui.basic.Image} knob to resize the splitpane
   */
  qx.Class.define("qx.ui.splitpane.Splitter", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param parentWidget {qx.ui.splitpane.Pane} The underlaying split pane.
     */
    construct: function construct(parentWidget) {
      qx.ui.core.Widget.constructor.call(this); // set layout

      if (parentWidget.getOrientation() == "vertical") {
        this._setLayout(new qx.ui.layout.HBox(0, "center"));

        this._getLayout().setAlignY("middle");
      } else {
        this._setLayout(new qx.ui.layout.VBox(0, "middle"));

        this._getLayout().setAlignX("center");
      } // create knob child control


      if (this.getVisible()) {
        this._createChildControl("knob");
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
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

      /**
       * The visibility of the splitter.
       * Allows to remove the splitter in favor of other visual separation means like background color differences.
       */
      visible: {
        init: true,
        check: "Boolean",
        themeable: true,
        apply: "_applyVisible"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          // Create splitter knob
          case "knob":
            control = new qx.ui.basic.Image();

            this._add(control);

            break;
        }

        return control || qx.ui.splitpane.Splitter.prototype._createChildControlImpl.base.call(this, id);
      },
      _applyVisible: function _applyVisible(visible, old) {
        this.getChildControl("knob").setVisibility(visible ? "visible" : "excluded");
      }
    }
  });
  qx.ui.splitpane.Splitter.$$dbClassInfo = $$dbClassInfo;
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
      "qx.html.Element": {
        "construct": true,
        "require": true
      },
      "qx.bom.client.Engine": {
        "construct": true
      },
      "qx.util.ResourceManager": {
        "construct": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /* ************************************************************************
  
  
  ************************************************************************ */

  /**
   * A special blocker element for the splitpane which is based on
   * {@link qx.html.Element} and takes care of the positioning of the div.
   *
   * @internal
   * @asset(qx/static/blank.gif)
   */
  qx.Class.define("qx.ui.splitpane.Blocker", {
    extend: qx.html.Element,

    /**
     * @param orientation {String} The orientation of the split pane control.
     */
    construct: function construct(orientation) {
      var styles = {
        position: "absolute",
        zIndex: 11
      }; // IE needs some extra love here to convince it to block events.

      if (qx.core.Environment.get("engine.name") == "mshtml") {
        styles.backgroundImage = "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")";
        styles.backgroundRepeat = "repeat";
      }

      qx.html.Element.constructor.call(this, "div", styles); // Initialize orientation

      if (orientation) {
        this.setOrientation(orientation);
      } else {
        this.initOrientation();
      }
    },
    properties: {
      /**
       * The orientation of the blocker which should be the same as the
       * orientation of the splitpane.
       */
      orientation: {
        init: "horizontal",
        check: ["horizontal", "vertical"],
        apply: "_applyOrientation"
      }
    },
    members: {
      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        if (value == "horizontal") {
          this.setStyle("height", "100%");
          this.setStyle("cursor", "col-resize");
          this.setStyle("top", null);
        } else {
          this.setStyle("width", "100%");
          this.setStyle("left", null);
          this.setStyle("cursor", "row-resize");
        }
      },

      /**
       * Takes the two parameters and set the propper width of the blocker.
       *
       * @param offset {Number} The offset of the splitpane.
       * @param spliterSize {Number} The width of the splitter.
       */
      setWidth: function setWidth(offset, spliterSize) {
        var width = spliterSize + 2 * offset;
        this.setStyle("width", width + "px");
      },

      /**
       * Takes the two parameter and sets the propper height of the blocker.
       *
       * @param offset {Number} The offset of the splitpane.
       * @param spliterSize {Number} The height of the splitter.
       */
      setHeight: function setHeight(offset, spliterSize) {
        var height = spliterSize + 2 * offset;
        this.setStyle("height", height + "px");
      },

      /**
       * Takes the two parameter and sets the propper left position of
       * the blocker.
       *
       * @param offset {Number} The offset of the splitpane.
       * @param splitterLeft {Number} The left position of the splitter.
       */
      setLeft: function setLeft(offset, splitterLeft) {
        var left = splitterLeft - offset;
        this.setStyle("left", left + "px");
      },

      /**
       * Takes the two parameter and sets the propper top position of
       * the blocker.
       *
       * @param offset {Number} The offset of the splitpane.
       * @param splitterTop {Number} The top position of the splitter.
       */
      setTop: function setTop(offset, splitterTop) {
        var top = splitterTop - offset;
        this.setStyle("top", top + "px");
      }
    }
  });
  qx.ui.splitpane.Blocker.$$dbClassInfo = $$dbClassInfo;
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * Layouter for vertical split panes.
   *
   * @internal
   */
  qx.Class.define("qx.ui.splitpane.VLayout", {
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
        this.assert(name === "type" || name === "flex", "The property '" + name + "' is not supported by the split layout!");

        if (name == "flex") {
          this.assertNumber(value);
        }

        if (name == "type") {
          this.assertString(value);
        }
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var length = children.length;
        var child, type;
        var begin, splitter, slider, end;
        var paddingLeft = padding.left || 0;
        var paddingTop = padding.top || 0;

        for (var i = 0; i < length; i++) {
          child = children[i];
          type = child.getLayoutProperties().type;

          if (type === "splitter") {
            splitter = child;
          } else if (type === "slider") {
            slider = child;
          } else if (!begin) {
            begin = child;
          } else {
            end = child;
          }
        }

        if (begin && end) {
          var beginFlex = begin.getLayoutProperties().flex;
          var endFlex = end.getLayoutProperties().flex;

          if (beginFlex == null) {
            beginFlex = 1;
          }

          if (endFlex == null) {
            endFlex = 1;
          }

          var beginHint = begin.getSizeHint();
          var splitterHint = splitter.getSizeHint();
          var endHint = end.getSizeHint();
          var beginHeight = beginHint.height;
          var splitterHeight = splitterHint.height;
          var endHeight = endHint.height;

          if (beginFlex > 0 && endFlex > 0) {
            var flexSum = beginFlex + endFlex;
            var flexAvailable = availHeight - splitterHeight;
            var beginHeight = Math.round(flexAvailable / flexSum * beginFlex);
            var endHeight = flexAvailable - beginHeight;
            var sizes = qx.ui.layout.Util.arrangeIdeals(beginHint.minHeight, beginHeight, beginHint.maxHeight, endHint.minHeight, endHeight, endHint.maxHeight);
            beginHeight = sizes.begin;
            endHeight = sizes.end;
          } else if (beginFlex > 0) {
            beginHeight = availHeight - splitterHeight - endHeight;

            if (beginHeight < beginHint.minHeight) {
              beginHeight = beginHint.minHeight;
            }

            if (beginHeight > beginHint.maxHeight) {
              beginHeight = beginHint.maxHeight;
            }
          } else if (endFlex > 0) {
            endHeight = availHeight - beginHeight - splitterHeight;

            if (endHeight < endHint.minHeight) {
              endHeight = endHint.minHeight;
            }

            if (endHeight > endHint.maxHeight) {
              endHeight = endHint.maxHeight;
            }
          }

          begin.renderLayout(paddingLeft, paddingTop, availWidth, beginHeight);
          splitter.renderLayout(paddingLeft, beginHeight + paddingTop, availWidth, splitterHeight);
          end.renderLayout(paddingLeft, beginHeight + splitterHeight + paddingTop, availWidth, endHeight);
        } else {
          // Hide the splitter completely
          splitter.renderLayout(0, 0, 0, 0); // Render one child

          if (begin) {
            begin.renderLayout(paddingLeft, paddingTop, availWidth, availHeight);
          } else if (end) {
            end.renderLayout(paddingLeft, paddingTop, availWidth, availHeight);
          }
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var length = children.length;
        var child, hint, props;
        var minHeight = 0,
            height = 0,
            maxHeight = 0;
        var minWidth = 0,
            width = 0,
            maxWidth = 0;

        for (var i = 0; i < length; i++) {
          child = children[i];
          props = child.getLayoutProperties(); // The slider is not relevant for auto sizing

          if (props.type === "slider") {
            continue;
          }

          hint = child.getSizeHint();
          minHeight += hint.minHeight;
          height += hint.height;
          maxHeight += hint.maxHeight;

          if (hint.minWidth > minWidth) {
            minWidth = hint.minWidth;
          }

          if (hint.width > width) {
            width = hint.width;
          }

          if (hint.maxWidth > maxWidth) {
            maxWidth = hint.maxWidth;
          }
        }

        return {
          minHeight: minHeight,
          height: height,
          maxHeight: maxHeight,
          minWidth: minWidth,
          width: width,
          maxWidth: maxWidth
        };
      }
    }
  });
  qx.ui.splitpane.VLayout.$$dbClassInfo = $$dbClassInfo;
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * Layouter for horizontal split panes.
   *
   * @internal
   */
  qx.Class.define("qx.ui.splitpane.HLayout", {
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
        this.assert(name === "type" || name === "flex", "The property '" + name + "' is not supported by the split layout!");

        if (name == "flex") {
          this.assertNumber(value);
        }

        if (name == "type") {
          this.assertString(value);
        }
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var length = children.length;
        var child, type;
        var begin, splitter, slider, end;
        var paddingLeft = padding.left || 0;
        var paddingTop = padding.top || 0;

        for (var i = 0; i < length; i++) {
          child = children[i];
          type = child.getLayoutProperties().type;

          if (type === "splitter") {
            splitter = child;
          } else if (type === "slider") {
            slider = child;
          } else if (!begin) {
            begin = child;
          } else {
            end = child;
          }
        }

        if (begin && end) {
          var beginFlex = begin.getLayoutProperties().flex;
          var endFlex = end.getLayoutProperties().flex;

          if (beginFlex == null) {
            beginFlex = 1;
          }

          if (endFlex == null) {
            endFlex = 1;
          }

          var beginHint = begin.getSizeHint();
          var splitterHint = splitter.getSizeHint();
          var endHint = end.getSizeHint();
          var beginWidth = beginHint.width;
          var splitterWidth = splitterHint.width;
          var endWidth = endHint.width;

          if (beginFlex > 0 && endFlex > 0) {
            var flexSum = beginFlex + endFlex;
            var flexAvailable = availWidth - splitterWidth;
            var beginWidth = Math.round(flexAvailable / flexSum * beginFlex);
            var endWidth = flexAvailable - beginWidth;
            var sizes = qx.ui.layout.Util.arrangeIdeals(beginHint.minWidth, beginWidth, beginHint.maxWidth, endHint.minWidth, endWidth, endHint.maxWidth);
            beginWidth = sizes.begin;
            endWidth = sizes.end;
          } else if (beginFlex > 0) {
            beginWidth = availWidth - splitterWidth - endWidth;

            if (beginWidth < beginHint.minWidth) {
              beginWidth = beginHint.minWidth;
            }

            if (beginWidth > beginHint.maxWidth) {
              beginWidth = beginHint.maxWidth;
            }
          } else if (endFlex > 0) {
            endWidth = availWidth - beginWidth - splitterWidth;

            if (endWidth < endHint.minWidth) {
              endWidth = endHint.minWidth;
            }

            if (endWidth > endHint.maxWidth) {
              endWidth = endHint.maxWidth;
            }
          }

          begin.renderLayout(paddingLeft, paddingTop, beginWidth, availHeight);
          splitter.renderLayout(beginWidth + paddingLeft, paddingTop, splitterWidth, availHeight);
          end.renderLayout(beginWidth + splitterWidth + paddingLeft, paddingTop, endWidth, availHeight);
        } else {
          // Hide the splitter completely
          splitter.renderLayout(0, 0, 0, 0); // Render one child

          if (begin) {
            begin.renderLayout(paddingLeft, paddingTop, availWidth, availHeight);
          } else if (end) {
            end.renderLayout(paddingLeft, paddingTop, availWidth, availHeight);
          }
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var length = children.length;
        var child, hint, props;
        var minWidth = 0,
            width = 0,
            maxWidth = 0;
        var minHeight = 0,
            height = 0,
            maxHeight = 0;

        for (var i = 0; i < length; i++) {
          child = children[i];
          props = child.getLayoutProperties(); // The slider is not relevant for auto sizing

          if (props.type === "slider") {
            continue;
          }

          hint = child.getSizeHint();
          minWidth += hint.minWidth;
          width += hint.width;
          maxWidth += hint.maxWidth;

          if (hint.minHeight > minHeight) {
            minHeight = hint.minHeight;
          }

          if (hint.height > height) {
            height = hint.height;
          }

          if (hint.maxHeight > maxHeight) {
            maxHeight = hint.maxHeight;
          }
        }

        return {
          minWidth: minWidth,
          width: width,
          maxWidth: maxWidth,
          minHeight: minHeight,
          height: height,
          maxHeight: maxHeight
        };
      }
    }
  });
  qx.ui.splitpane.HLayout.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-41.js.map
