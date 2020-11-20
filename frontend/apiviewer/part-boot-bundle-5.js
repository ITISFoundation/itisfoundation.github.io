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
      "qx.bom.Stylesheet": {
        "construct": true
      }
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
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Global class which handles the single stylesheet used for qx.desktop.
   */
  qx.Class.define("qx.ui.style.Stylesheet", {
    type: "singleton",
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__sheet = qx.bom.Stylesheet.createElement();
      this.__rules = [];
    },
    members: {
      __rules: null,
      __sheet: null,

      /**
       * Adds a rule to the global stylesheet.
       * @param selector {String} The CSS selector to add the rule for.
       * @param css {String} The rule's content.
       */
      addRule: function addRule(selector, css) {
        if (this.hasRule(selector)) {
          return;
        }

        qx.bom.Stylesheet.addRule(this.__sheet, selector, css);

        this.__rules.push(selector);
      },

      /**
       * Check if a rule exists.
       * @param selector {String} The selector to check.
       * @return {Boolean} <code>true</code> if the rule exists
       */
      hasRule: function hasRule(selector) {
        return this.__rules.indexOf(selector) != -1;
      },

      /**
       * Remove the rule for the given selector.
       * @param selector {String} The selector to identify the rule.
       */
      removeRule: function removeRule(selector) {
        delete this.__rules[this.__rules.indexOf(selector)];
        qx.bom.Stylesheet.removeRule(this.__sheet, selector);
      }
    }
  });
  qx.ui.style.Stylesheet.$$dbClassInfo = $$dbClassInfo;
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
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A decorator is responsible for computing a widget's decoration styles.
   *
   */
  qx.Interface.define("qx.ui.decoration.IDecorator", {
    members: {
      /**
       * Returns the decorator's styles.
       *
       * @return {Map} Map of decoration styles
       */
      getStyles: function getStyles() {},

      /**
       * Returns the configured padding minus the border width.
       * @return {Map} Map of top, right, bottom and left padding values
       */
      getPadding: function getPadding() {},

      /**
       * Get the amount of space the decoration needs for its border and padding
       * on each side.
       *
       * @return {Map} the desired inset as a map with the keys <code>top</code>,
       *     <code>right</code>, <code>bottom</code>, <code>left</code>.
       */
      getInsets: function getInsets() {}
    }
  });
  qx.ui.decoration.IDecorator.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.decoration.IDecorator": {
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
       * Martin Wittemann (martinwittemann)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class acts as abstract class for all decorators. It offers the
   * properties for the insets handling. Each decorator has to define its own
   * default insets by implementing the template method
   * (http://en.wikipedia.org/wiki/Template_Method) <code>_getDefaultInsets</code>
   */
  qx.Class.define("qx.ui.decoration.Abstract", {
    extend: qx.core.Object,
    implement: [qx.ui.decoration.IDecorator],
    type: "abstract",
    members: {
      __insets: null,

      /**
       * Abstract method. Should return a map containing the default insets of
       * the decorator. This could look like this:
       * <pre>
       * return {
       *   top : 0,
       *   right : 0,
       *   bottom : 0,
       *   left : 0
       * };
       * </pre>
       * @return {Map} Map containing the insets.
       */
      _getDefaultInsets: function _getDefaultInsets() {
        throw new Error("Abstract method called.");
      },

      /**
       * Abstract method. Should return an boolean value if the decorator is
       * already initialized or not.
       * @return {Boolean} True, if the decorator is initialized.
       */
      _isInitialized: function _isInitialized() {
        throw new Error("Abstract method called.");
      },

      /**
       * Resets the insets.
       */
      _resetInsets: function _resetInsets() {
        this.__insets = null;
      },
      // interface implementation
      getInsets: function getInsets() {
        if (!this.__insets) {
          this.__insets = this._getDefaultInsets();
        }

        return this.__insets;
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__insets = null;
    }
  });
  qx.ui.decoration.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.theme": {}
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

  /**
   * Mixin responsible for setting the background color of a widget.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   */
  qx.Mixin.define("qx.ui.decoration.MBackgroundColor", {
    properties: {
      /** Color of the background */
      backgroundColor: {
        check: "Color",
        nullable: true,
        apply: "_applyBackgroundColor"
      }
    },
    members: {
      /**
       * Adds the background-color styles to the given map
       * @param styles {Map} CSS style map
       */
      _styleBackgroundColor: function _styleBackgroundColor(styles) {
        var bgcolor = this.getBackgroundColor();

        if (bgcolor && qx.core.Environment.get("qx.theme")) {
          bgcolor = qx.theme.manager.Color.getInstance().resolve(bgcolor);
        }

        if (bgcolor) {
          styles["background-color"] = bgcolor;
        }
      },
      // property apply
      _applyBackgroundColor: function _applyBackgroundColor() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MBackgroundColor.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {}
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mixin for the border radius CSS property.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * Keep in mind that this is not supported by all browsers:
   *
   * * Firefox 3,5+
   * * IE9+
   * * Safari 3.0+
   * * Opera 10.5+
   * * Chrome 4.0+
   */
  qx.Mixin.define("qx.ui.decoration.MBorderRadius", {
    properties: {
      /** top left corner radius */
      radiusTopLeft: {
        nullable: true,
        check: "Integer",
        apply: "_applyBorderRadius"
      },

      /** top right corner radius */
      radiusTopRight: {
        nullable: true,
        check: "Integer",
        apply: "_applyBorderRadius"
      },

      /** bottom left corner radius */
      radiusBottomLeft: {
        nullable: true,
        check: "Integer",
        apply: "_applyBorderRadius"
      },

      /** bottom right corner radius */
      radiusBottomRight: {
        nullable: true,
        check: "Integer",
        apply: "_applyBorderRadius"
      },

      /** Property group to set the corner radius of all sides */
      radius: {
        group: ["radiusTopLeft", "radiusTopRight", "radiusBottomRight", "radiusBottomLeft"],
        mode: "shorthand"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the border radius styles in place to the
       * given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleBorderRadius: function _styleBorderRadius(styles) {
        // Fixing the background bleed in Webkits
        // http://tumble.sneak.co.nz/post/928998513/fixing-the-background-bleed
        styles["-webkit-background-clip"] = "padding-box";
        styles["background-clip"] = "padding-box"; // radius handling

        var hasRadius = false;
        var radius = this.getRadiusTopLeft();

        if (radius > 0) {
          hasRadius = true;
          styles["-moz-border-radius-topleft"] = radius + "px";
          styles["-webkit-border-top-left-radius"] = radius + "px";
          styles["border-top-left-radius"] = radius + "px";
        }

        radius = this.getRadiusTopRight();

        if (radius > 0) {
          hasRadius = true;
          styles["-moz-border-radius-topright"] = radius + "px";
          styles["-webkit-border-top-right-radius"] = radius + "px";
          styles["border-top-right-radius"] = radius + "px";
        }

        radius = this.getRadiusBottomLeft();

        if (radius > 0) {
          hasRadius = true;
          styles["-moz-border-radius-bottomleft"] = radius + "px";
          styles["-webkit-border-bottom-left-radius"] = radius + "px";
          styles["border-bottom-left-radius"] = radius + "px";
        }

        radius = this.getRadiusBottomRight();

        if (radius > 0) {
          hasRadius = true;
          styles["-moz-border-radius-bottomright"] = radius + "px";
          styles["-webkit-border-bottom-right-radius"] = radius + "px";
          styles["border-bottom-right-radius"] = radius + "px";
        } // Fixing the background bleed in Webkits
        // http://tumble.sneak.co.nz/post/928998513/fixing-the-background-bleed


        if (hasRadius && qx.core.Environment.get("engine.name") == "webkit") {
          styles["-webkit-background-clip"] = "padding-box";
        } else {
          styles["background-clip"] = "padding-box";
        }
      },
      // property apply
      _applyBorderRadius: function _applyBorderRadius() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MBorderRadius.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Css": {},
      "qx.bom.Style": {},
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxshadow": {
          "className": "qx.bom.client.Css"
        },
        "qx.theme": {}
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

  /**
   * Mixin for the box shadow CSS property.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * Keep in mind that this is not supported by all browsers:
   *
   * * Firefox 3,5+
   * * IE9+
   * * Safari 3.0+
   * * Opera 10.5+
   * * Chrome 4.0+
   *
   * It is possible to define multiple box shadows by setting an 
   * array containing the needed values as the property value.
   * In case multiple values are specified, the values of the properties
   * are repeated until all match in length.
   *
   * An example:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       shadowBlurRadius: 2,
   *       shadowVerticalLength: 1,
   *       shadowColor: ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.4)'],
   *       inset: [true, false]
   *     }
   *   }
   * </pre>
   * which is the same as:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       shadowBlurRadius: [2, 2],
   *       shadowVerticalLength: [1, 1],
   *       shadowColor: ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.4)'],
   *       inset: [true, false]
   *     }
   *   }
   */
  qx.Mixin.define("qx.ui.decoration.MBoxShadow", {
    properties: {
      /** Horizontal length of the shadow. */
      shadowHorizontalLength: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** Vertical length of the shadow. */
      shadowVerticalLength: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** The blur radius of the shadow. */
      shadowBlurRadius: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** The spread radius of the shadow. */
      shadowSpreadRadius: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** The color of the shadow. */
      shadowColor: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** Inset shadows are drawn inside the border. */
      inset: {
        init: false,
        apply: "_applyBoxShadow"
      },

      /** Property group to set the shadow length. */
      shadowLength: {
        group: ["shadowHorizontalLength", "shadowVerticalLength"],
        mode: "shorthand"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the box shadow styles in place to the
       * given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleBoxShadow: function _styleBoxShadow(styles) {
        var propName = qx.core.Environment.get("css.boxshadow");

        if (!propName || this.getShadowVerticalLength() == null && this.getShadowHorizontalLength() == null) {
          return;
        }

        propName = qx.bom.Style.getCssName(propName);
        var Color = null;

        if (qx.core.Environment.get("qx.theme")) {
          Color = qx.theme.manager.Color.getInstance();
        }

        var boxShadowProperties = ["shadowVerticalLength", "shadowHorizontalLength", "shadowBlurRadius", "shadowSpreadRadius", "shadowColor", "inset"];
        (function (vLengths, hLengths, blurs, spreads, colors, insets) {
          for (var i = 0; i < vLengths.length; i++) {
            var vLength = vLengths[i] || 0;
            var hLength = hLengths[i] || 0;
            var blur = blurs[i] || 0;
            var spread = spreads[i] || 0;
            var color = colors[i] || "black";
            var inset = insets[i];

            if (Color) {
              color = Color.resolve(color);
            }

            if (color != null) {
              var value = (inset ? 'inset ' : '') + hLength + "px " + vLength + "px " + blur + "px " + spread + "px " + color; // apply or append the box shadow styles

              if (!styles[propName]) {
                styles[propName] = value;
              } else {
                styles[propName] += "," + value;
              }
            }
          }
        }).apply(this, this._getExtendedPropertyValueArrays(boxShadowProperties));
      },
      // property apply
      _applyBoxShadow: function _applyBoxShadow() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MBoxShadow.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.theme": {}
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

  /**
   * A basic decorator featuring simple borders based on CSS styles.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   */
  qx.Mixin.define("qx.ui.decoration.MSingleBorder", {
    properties: {
      /*
      ---------------------------------------------------------------------------
        PROPERTY: WIDTH
      ---------------------------------------------------------------------------
      */

      /** top width of border */
      widthTop: {
        check: "Number",
        init: 0,
        apply: "_applyWidth"
      },

      /** right width of border */
      widthRight: {
        check: "Number",
        init: 0,
        apply: "_applyWidth"
      },

      /** bottom width of border */
      widthBottom: {
        check: "Number",
        init: 0,
        apply: "_applyWidth"
      },

      /** left width of border */
      widthLeft: {
        check: "Number",
        init: 0,
        apply: "_applyWidth"
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY: STYLE
      ---------------------------------------------------------------------------
      */

      /** top style of border */
      styleTop: {
        nullable: true,
        check: ["solid", "dotted", "dashed", "double", "inset", "outset", "ridge", "groove"],
        init: "solid",
        apply: "_applyStyle"
      },

      /** right style of border */
      styleRight: {
        nullable: true,
        check: ["solid", "dotted", "dashed", "double", "inset", "outset", "ridge", "groove"],
        init: "solid",
        apply: "_applyStyle"
      },

      /** bottom style of border */
      styleBottom: {
        nullable: true,
        check: ["solid", "dotted", "dashed", "double", "inset", "outset", "ridge", "groove"],
        init: "solid",
        apply: "_applyStyle"
      },

      /** left style of border */
      styleLeft: {
        nullable: true,
        check: ["solid", "dotted", "dashed", "double", "inset", "outset", "ridge", "groove"],
        init: "solid",
        apply: "_applyStyle"
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY: COLOR
      ---------------------------------------------------------------------------
      */

      /** top color of border */
      colorTop: {
        nullable: true,
        check: "Color",
        apply: "_applyStyle"
      },

      /** right color of border */
      colorRight: {
        nullable: true,
        check: "Color",
        apply: "_applyStyle"
      },

      /** bottom color of border */
      colorBottom: {
        nullable: true,
        check: "Color",
        apply: "_applyStyle"
      },

      /** left color of border */
      colorLeft: {
        nullable: true,
        check: "Color",
        apply: "_applyStyle"
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY GROUP: EDGE
      ---------------------------------------------------------------------------
      */

      /** Property group to configure the left border */
      left: {
        group: ["widthLeft", "styleLeft", "colorLeft"]
      },

      /** Property group to configure the right border */
      right: {
        group: ["widthRight", "styleRight", "colorRight"]
      },

      /** Property group to configure the top border */
      top: {
        group: ["widthTop", "styleTop", "colorTop"]
      },

      /** Property group to configure the bottom border */
      bottom: {
        group: ["widthBottom", "styleBottom", "colorBottom"]
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY GROUP: TYPE
      ---------------------------------------------------------------------------
      */

      /** Property group to set the border width of all sides */
      width: {
        group: ["widthTop", "widthRight", "widthBottom", "widthLeft"],
        mode: "shorthand"
      },

      /** Property group to set the border style of all sides */
      style: {
        group: ["styleTop", "styleRight", "styleBottom", "styleLeft"],
        mode: "shorthand"
      },

      /** Property group to set the border color of all sides */
      color: {
        group: ["colorTop", "colorRight", "colorBottom", "colorLeft"],
        mode: "shorthand"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the border styles styles in place
       * to the given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleBorder: function _styleBorder(styles) {
        if (qx.core.Environment.get("qx.theme")) {
          var Color = qx.theme.manager.Color.getInstance();
          var colorTop = Color.resolve(this.getColorTop());
          var colorRight = Color.resolve(this.getColorRight());
          var colorBottom = Color.resolve(this.getColorBottom());
          var colorLeft = Color.resolve(this.getColorLeft());
        } else {
          var colorTop = this.getColorTop();
          var colorRight = this.getColorRight();
          var colorBottom = this.getColorBottom();
          var colorLeft = this.getColorLeft();
        } // Add borders


        var width = this.getWidthTop();

        if (width > 0) {
          styles["border-top"] = width + "px " + this.getStyleTop() + " " + (colorTop || "");
        }

        var width = this.getWidthRight();

        if (width > 0) {
          styles["border-right"] = width + "px " + this.getStyleRight() + " " + (colorRight || "");
        }

        var width = this.getWidthBottom();

        if (width > 0) {
          styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + (colorBottom || "");
        }

        var width = this.getWidthLeft();

        if (width > 0) {
          styles["border-left"] = width + "px " + this.getStyleLeft() + " " + (colorLeft || "");
        } // Check if valid


        {
          if (styles.length === 0) {
            throw new Error("Invalid Single decorator (zero border width). Use qx.ui.decorator.Background instead!");
          }
        } // Add basic styles

        styles.position = "absolute";
      },

      /**
       * Implementation of the interface for the single border.
       *
       * @return {Map} A map containing the default insets.
       *   (top, right, bottom, left)
       */
      _getDefaultInsetsForBorder: function _getDefaultInsetsForBorder() {
        return {
          top: this.getWidthTop(),
          right: this.getWidthRight(),
          bottom: this.getWidthBottom(),
          left: this.getWidthLeft()
        };
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyWidth: function _applyWidth() {
        this._applyStyle();

        this._resetInsets();
      },
      // property apply
      _applyStyle: function _applyStyle() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MSingleBorder.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Type": {},
      "qx.util.AliasManager": {},
      "qx.util.ResourceManager": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {}
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mixin for supporting the background images on decorators.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * It is possible to define multiple background images by setting an
   * array containing the needed values as the property value.
   * In case multiple values are specified, the values of the properties
   * are repeated until all match in length.
   *
   * An example:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       backgroundImage: ['foo1.png', 'foo2.png', 'bar1.png', 'bar2.png'],
   *       backgroundRepeat: 'no-repeat',
   *       backgroundPositionX: ['left', 'right', 'center'],
   *       backgroundPositionY: ['center', 'top']
   *     }
   *   }
   * </pre>
   * which is the same as:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       backgroundImage: ['foo1.png', 'foo2.png', 'bar1.png', 'bar2.png'],
   *       backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat'],
   *       backgroundPositionX: ['left', 'right', 'center', 'left'],
   *       backgroundPositionY: ['center', 'top', 'center', 'top']
   *     }
   *   }
   * </pre>
   */
  qx.Mixin.define("qx.ui.decoration.MBackgroundImage", {
    properties: {
      /** The URL of the background image */
      backgroundImage: {
        nullable: true,
        apply: "_applyBackgroundImage"
      },

      /** How the background image should be repeated */
      backgroundRepeat: {
        init: "repeat",
        apply: "_applyBackgroundImage"
      },

      /**
       * Either a string or a number, which defines the horizontal position
       * of the background image.
       *
       * If the value is an integer it is interpreted as a pixel value, otherwise
       * the value is taken to be a CSS value. For CSS, the values are "center",
       * "left" and "right".
       */
      backgroundPositionX: {
        nullable: true,
        apply: "_applyBackgroundPosition"
      },

      /**
       * Either a string or a number, which defines the vertical position
       * of the background image.
       *
       * If the value is an integer it is interpreted as a pixel value, otherwise
       * the value is taken to be a CSS value. For CSS, the values are "top",
       * "center" and "bottom".
       */
      backgroundPositionY: {
        nullable: true,
        apply: "_applyBackgroundPosition"
      },

      /**
       * Specifies where the background image is positioned.
       */
      backgroundOrigin: {
        nullable: true,
        apply: "_applyBackgroundImage"
      },

      /**
       * Property group to define the background position
       */
      backgroundPosition: {
        group: ["backgroundPositionY", "backgroundPositionX"]
      },

      /**
       * Whether to order gradients before Image-URL-based background declarations
       * if both qx.ui.decoration.MBackgroundImage and
       * qx.ui.decoration.MLinearBackgroundGradient decorations are used.
       */
      orderGradientsFront: {
        check: 'Boolean',
        init: false
      }
    },
    members: {
      /**
       * Adds the background-image styles to the given map
       * @param styles {Map} CSS style map
       */
      _styleBackgroundImage: function _styleBackgroundImage(styles) {
        if (!this.getBackgroundImage()) {
          return;
        }

        if ("background" in styles) {
          if (!qx.lang.Type.isArray(styles['background'])) {
            styles['background'] = [styles['background']];
          }
        } else {
          styles['background'] = [];
        }

        var backgroundImageProperties = ['backgroundImage', 'backgroundRepeat', 'backgroundPositionY', 'backgroundPositionX', 'backgroundOrigin'];
        (function (images, repeats, tops, lefts, origins) {
          for (var i = 0; i < images.length; i++) {
            var image = images[i];
            var repeat = repeats[i];
            var top = tops[i] || 0;
            var left = lefts[i] || 0;
            var origin = origins[i] || '';

            if (top == null) {
              top = 0;
            }

            if (left == null) {
              left = 0;
            }

            if (!isNaN(top)) {
              top += "px";
            }

            if (!isNaN(left)) {
              left += "px";
            }

            var id = qx.util.AliasManager.getInstance().resolve(image);
            var source = qx.util.ResourceManager.getInstance().toUri(id);
            var attrs = {
              image: 'url(' + source + ')',
              position: left + " " + top,
              repeat: 'repeat',
              origin: origin
            };

            if (repeat === "scale") {
              attrs.size = "100% 100%";
            } else {
              attrs.repeat = repeat;
            }

            var imageMarkup = [attrs.image, attrs.position + ('size' in attrs ? ' / ' + attrs.size : ''), attrs.repeat, attrs.origin];
            styles["background"][this.getOrderGradientsFront() ? 'push' : 'unshift'](imageMarkup.join(' '));

            if (true && source && source.endsWith(".png") && (repeat == "scale" || repeat == "no-repeat") && qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
              this.warn("Background PNGs with repeat == 'scale' or repeat == 'no-repeat' are not supported in this client! The image's resource id is '" + id + "'");
            }
          }
        }).apply(this, this._getExtendedPropertyValueArrays(backgroundImageProperties));
      },
      // property apply
      _applyBackgroundImage: function _applyBackgroundImage() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      },
      // property apply
      _applyBackgroundPosition: function _applyBackgroundPosition() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }

          if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
            this.warn("The backgroundPosition property is not supported by this client!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MBackgroundImage.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.decoration.MSingleBorder": {
        "require": true
      },
      "qx.ui.decoration.MBackgroundImage": {
        "require": true
      },
      "qx.bom.client.Css": {},
      "qx.theme.manager.Color": {},
      "qx.bom.Style": {},
      "qx.log.Logger": {},
      "qx.util.ColorUtil": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxshadow": {
          "className": "qx.bom.client.Css"
        },
        "qx.theme": {},
        "css.boxsizing": {
          "className": "qx.bom.client.Css"
        },
        "css.borderradius": {
          "className": "qx.bom.client.Css"
        },
        "css.rgba": {
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Border implementation with two CSS borders. Both borders can be styled
   * independent of each other.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   */
  qx.Mixin.define("qx.ui.decoration.MDoubleBorder", {
    include: [qx.ui.decoration.MSingleBorder, qx.ui.decoration.MBackgroundImage],
    construct: function construct() {
      // override the methods of single border and background image
      this._getDefaultInsetsForBorder = this.__getDefaultInsetsForDoubleBorder;
      this._styleBorder = this.__styleDoubleBorder;
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        PROPERTY: INNER WIDTH
      ---------------------------------------------------------------------------
      */

      /** top width of border */
      innerWidthTop: {
        check: "Number",
        init: 0,
        apply: "_applyDoubleBorder"
      },

      /** right width of border */
      innerWidthRight: {
        check: "Number",
        init: 0,
        apply: "_applyDoubleBorder"
      },

      /** bottom width of border */
      innerWidthBottom: {
        check: "Number",
        init: 0,
        apply: "_applyDoubleBorder"
      },

      /** left width of border */
      innerWidthLeft: {
        check: "Number",
        init: 0,
        apply: "_applyDoubleBorder"
      },

      /** Property group to set the inner border width of all sides */
      innerWidth: {
        group: ["innerWidthTop", "innerWidthRight", "innerWidthBottom", "innerWidthLeft"],
        mode: "shorthand"
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY: INNER COLOR
      ---------------------------------------------------------------------------
      */

      /** top inner color of border */
      innerColorTop: {
        nullable: true,
        check: "Color",
        apply: "_applyDoubleBorder"
      },

      /** right inner color of border */
      innerColorRight: {
        nullable: true,
        check: "Color",
        apply: "_applyDoubleBorder"
      },

      /** bottom inner color of border */
      innerColorBottom: {
        nullable: true,
        check: "Color",
        apply: "_applyDoubleBorder"
      },

      /** left inner color of border */
      innerColorLeft: {
        nullable: true,
        check: "Color",
        apply: "_applyDoubleBorder"
      },

      /**
       * Property group for the inner color properties.
       */
      innerColor: {
        group: ["innerColorTop", "innerColorRight", "innerColorBottom", "innerColorLeft"],
        mode: "shorthand"
      },

      /**
       * The opacity of the inner border.
       */
      innerOpacity: {
        check: "Number",
        init: 1,
        apply: "_applyDoubleBorder"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the outer border styles in place
       * to the given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      __styleDoubleBorder: function __styleDoubleBorder(styles) {
        var propName = qx.core.Environment.get("css.boxshadow");
        var color, innerColor, innerWidth;

        if (qx.core.Environment.get("qx.theme")) {
          var Color = qx.theme.manager.Color.getInstance();
          color = {
            top: Color.resolve(this.getColorTop()),
            right: Color.resolve(this.getColorRight()),
            bottom: Color.resolve(this.getColorBottom()),
            left: Color.resolve(this.getColorLeft())
          };
          innerColor = {
            top: Color.resolve(this.getInnerColorTop()),
            right: Color.resolve(this.getInnerColorRight()),
            bottom: Color.resolve(this.getInnerColorBottom()),
            left: Color.resolve(this.getInnerColorLeft())
          };
        } else {
          color = {
            top: this.getColorTop(),
            right: this.getColorRight(),
            bottom: this.getColorBottom(),
            left: this.getColorLeft()
          };
          innerColor = {
            top: this.getInnerColorTop(),
            right: this.getInnerColorRight(),
            bottom: this.getInnerColorBottom(),
            left: this.getInnerColorLeft()
          };
        }

        innerWidth = {
          top: this.getInnerWidthTop(),
          right: this.getInnerWidthRight(),
          bottom: this.getInnerWidthBottom(),
          left: this.getInnerWidthLeft()
        }; // Add outer borders

        var width = this.getWidthTop();

        if (width > 0) {
          styles["border-top"] = width + "px " + this.getStyleTop() + " " + color.top;
        }

        width = this.getWidthRight();

        if (width > 0) {
          styles["border-right"] = width + "px " + this.getStyleRight() + " " + color.right;
        }

        width = this.getWidthBottom();

        if (width > 0) {
          styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + color.bottom;
        }

        width = this.getWidthLeft();

        if (width > 0) {
          styles["border-left"] = width + "px " + this.getStyleLeft() + " " + color.left;
        }

        var innerOpacity = this.getInnerOpacity();

        if (innerOpacity < 1) {
          this.__processInnerOpacity(innerColor, innerOpacity);
        } // inner border


        if (innerWidth.top > 0 || innerWidth.right > 0 || innerWidth.bottom > 0 || innerWidth.left > 0) {
          var borderTop = (innerWidth.top || 0) + "px solid " + innerColor.top;
          var borderRight = (innerWidth.right || 0) + "px solid " + innerColor.right;
          var borderBottom = (innerWidth.bottom || 0) + "px solid " + innerColor.bottom;
          var borderLeft = (innerWidth.left || 0) + "px solid " + innerColor.left;
          styles[":before"] = {
            "width": "100%",
            "height": "100%",
            "position": "absolute",
            "content": '""',
            "border-top": borderTop,
            "border-right": borderRight,
            "border-bottom": borderBottom,
            "border-left": borderLeft,
            "left": 0,
            "top": 0
          };
          var boxSizingKey = qx.bom.Style.getCssName(qx.core.Environment.get("css.boxsizing"));
          styles[":before"][boxSizingKey] = "border-box"; // make sure to apply the border radius as well

          var borderRadiusKey = qx.core.Environment.get("css.borderradius");

          if (borderRadiusKey) {
            borderRadiusKey = qx.bom.Style.getCssName(borderRadiusKey);
            styles[":before"][borderRadiusKey] = "inherit";
          } // Add inner borders as shadows


          var shadowStyle = [];

          if (innerColor.top && innerWidth.top && innerColor.top == innerColor.bottom && innerColor.top == innerColor.right && innerColor.top == innerColor.left && innerWidth.top == innerWidth.bottom && innerWidth.top == innerWidth.right && innerWidth.top == innerWidth.left) {
            shadowStyle.push("inset 0 0 0 " + innerWidth.top + "px " + innerColor.top);
          } else {
            if (innerColor.top) {
              shadowStyle.push("inset 0 " + (innerWidth.top || 0) + "px " + innerColor.top);
            }

            if (innerColor.right) {
              shadowStyle.push("inset -" + (innerWidth.right || 0) + "px 0 " + innerColor.right);
            }

            if (innerColor.bottom) {
              shadowStyle.push("inset 0 -" + (innerWidth.bottom || 0) + "px " + innerColor.bottom);
            }

            if (innerColor.left) {
              shadowStyle.push("inset " + (innerWidth.left || 0) + "px 0 " + innerColor.left);
            }
          } // apply or append the box shadow styles


          if (shadowStyle.length > 0 && propName) {
            propName = qx.bom.Style.getCssName(propName);

            if (!styles[propName]) {
              styles[propName] = shadowStyle.join(",");
            } else {
              styles[propName] += "," + shadowStyle.join(",");
            }
          }
        } else {
          styles[":before"] = {
            border: 0
          };
        }
      },

      /**
       * Converts the inner border's colors to rgba.
       *
       * @param innerColor {Map} map of top, right, bottom and left colors
       * @param innerOpacity {Number} alpha value
       */
      __processInnerOpacity: function __processInnerOpacity(innerColor, innerOpacity) {
        if (!qx.core.Environment.get("css.rgba")) {
          {
            qx.log.Logger.warn("innerOpacity is configured but the browser doesn't support RGBA colors.");
          }
          return;
        }

        for (var edge in innerColor) {
          var rgb = qx.util.ColorUtil.stringToRgb(innerColor[edge]);
          rgb.push(innerOpacity);
          var rgbString = qx.util.ColorUtil.rgbToRgbString(rgb);
          innerColor[edge] = rgbString;
        }
      },
      _applyDoubleBorder: function _applyDoubleBorder() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      },

      /**
       * Implementation of the interface for the double border.
       *
       * @return {Map} A map containing the default insets.
       *   (top, right, bottom, left)
       */
      __getDefaultInsetsForDoubleBorder: function __getDefaultInsetsForDoubleBorder() {
        return {
          top: this.getWidthTop() + this.getInnerWidthTop(),
          right: this.getWidthRight() + this.getInnerWidthRight(),
          bottom: this.getWidthBottom() + this.getInnerWidthBottom(),
          left: this.getWidthLeft() + this.getInnerWidthLeft()
        };
      }
    }
  });
  qx.ui.decoration.MDoubleBorder.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Css": {},
      "qx.lang.Type": {},
      "qx.util.ColorUtil": {},
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.gradient.legacywebkit": {
          "className": "qx.bom.client.Css"
        },
        "css.gradient.filter": {
          "className": "qx.bom.client.Css"
        },
        "css.gradient.linear": {
          "className": "qx.bom.client.Css"
        },
        "css.borderradius": {
          "className": "qx.bom.client.Css"
        },
        "qx.theme": {}
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

  /**
   * Mixin for the linear background gradient CSS property.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * Keep in mind that this is not supported by all browsers:
   *
   * * Safari 4.0+
   * * Chrome 4.0+
   * * Firefox 3.6+
   * * Opera 11.1+
   * * IE 10+
   * * IE 5.5+ (with limitations)
   *
   * For IE 5.5 to IE 8,this class uses the filter rules to create the gradient. This
   * has some limitations: The start and end position property can not be used. For
   * more details, see the original documentation:
   * http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx
   *
   * For IE9, we create a gradient in a canvas element and render this gradient
   * as background image. Due to restrictions in the <code>background-image</code>
   * css property, we can not allow negative start values in that case.
   *
   * It is possible to define multiple background gradients by setting an 
   * array containing the needed values as the property value.
   * In case multiple values are specified, the values of the properties
   * are repeated until all match in length. It is not possible to define
   * multiple background gradients when falling back to filter rules (IE5.5 to IE8).
   *
   * An example:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       startColor:['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'],
   *       endColor: 'rgba(255, 255, 255, 0.2)',
   *       orientation: ['horizontal', 'vertical']
   *     }
   *   }
   * </pre>
   * which is the same as:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       startColor: ['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'],
   *       endColor: ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.2)'],
   *       orientation: ['horizontal', 'vertical', 'horizontal']
   *     }
   *   }
   * </pre>
   */
  qx.Mixin.define("qx.ui.decoration.MLinearBackgroundGradient", {
    properties: {
      /**
       * Start color of the background gradient.
       * Note that alpha transparency (rgba) is not supported in IE 8.
       */
      startColor: {
        nullable: true,
        apply: "_applyLinearBackgroundGradient"
      },

      /**
       * End color of the background gradient.
       * Note that alpha transparency (rgba) is not supported in IE 8.
       */
      endColor: {
        nullable: true,
        apply: "_applyLinearBackgroundGradient"
      },

      /** The orientation of the gradient. */
      orientation: {
        init: "vertical",
        apply: "_applyLinearBackgroundGradient"
      },

      /** Position in percent where to start the color. */
      startColorPosition: {
        init: 0,
        apply: "_applyLinearBackgroundGradient"
      },

      /** Position in percent where to start the color. */
      endColorPosition: {
        init: 100,
        apply: "_applyLinearBackgroundGradient"
      },

      /** Defines if the given positions are in % or px.*/
      colorPositionUnit: {
        init: "%",
        apply: "_applyLinearBackgroundGradient"
      },

      /** Property group to set the start color including its start position. */
      gradientStart: {
        group: ["startColor", "startColorPosition"],
        mode: "shorthand"
      },

      /** Property group to set the end color including its end position. */
      gradientEnd: {
        group: ["endColor", "endColorPosition"],
        mode: "shorthand"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the linear background styles in place to the
       * given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleLinearBackgroundGradient: function _styleLinearBackgroundGradient(styles) {
        var backgroundStyle = [];

        if (!this.getStartColor() || !this.getEndColor()) {
          return;
        }

        var styleImpl = this.__styleLinearBackgroundGradientAccordingToSpec;

        if (qx.core.Environment.get("css.gradient.legacywebkit")) {
          styleImpl = this.__styleLinearBackgroundGradientForLegacyWebkit;
        } else if (qx.core.Environment.get("css.gradient.filter") && !qx.core.Environment.get("css.gradient.linear") && qx.core.Environment.get("css.borderradius")) {
          styleImpl = this.__styleLinearBackgroundGradientWithCanvas;
        } else if (qx.core.Environment.get("css.gradient.filter") && !qx.core.Environment.get("css.gradient.linear")) {
          styleImpl = this.__styleLinearBackgroundGradientWithMSFilter;
        }

        var gradientProperties = ["startColor", "endColor", "colorPositionUnit", "orientation", "startColorPosition", "endColorPosition"];
        (function (startColors, endColors, units, orientations, startColorPositions, endColorPositions) {
          for (var i = 0; i < startColors.length; i++) {
            var startColor = this.__getColor(startColors[i]);

            var endColor = this.__getColor(endColors[i]);

            var unit = units[i];
            var orientation = orientations[i];
            var startColorPosition = startColorPositions[i];
            var endColorPosition = endColorPositions[i];

            if (!styleImpl(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle)) {
              break;
            }
          }

          if ("background" in styles) {
            if (!qx.lang.Type.isArray(styles['background'])) {
              styles['background'] = [styles['background']];
            }
          } else {
            styles['background'] = [];
          }

          var orderGradientsFront = 'getOrderGradientsFront' in this ? this.getOrderGradientsFront() : false;
          var operation = orderGradientsFront ? Array.prototype.unshift : Array.prototype.push;
          operation.apply(styles['background'], backgroundStyle);
        }).apply(this, this._getExtendedPropertyValueArrays(gradientProperties));
      },

      /**
       * Compute CSS rules to style the background with gradients.
       * This can be called multiple times and SHOULD layer the gradients on top of each other and on top of existing backgrounds.
       * Legacy implementation for old WebKit browsers (Chrome < 10).
       * 
       * @param startColor {Color} The color to start the gradient with
       * @param endColor {Color} The color to end the gradient with
       * @param unit {Color} The unit in which startColorPosition and endColorPosition are measured
       * @param orientation {String} Either 'horizontal' or 'vertical'
       * @param startColorPosition {Number} The position of the gradient’s starting point, measured in `unit` units along the `orientation` axis from top or left
       * @param endColorPosition {Number} The position of the gradient’s ending point, measured in `unit` units along the `orientation` axis from top or left
       * @param styles {Map} The complete styles currently poised to be applied by decorators. Should not be written to in this method (use `backgroundStyle` for that)
       * @param backgroundStyle {Map} This method should push new background styles onto this array.
       *
       * @return {Boolean} Whether this implementation supports multiple gradients atop each other (true).
       */
      __styleLinearBackgroundGradientForLegacyWebkit: function __styleLinearBackgroundGradientForLegacyWebkit(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
        // webkit uses px values if non are given
        unit = unit === "px" ? "" : unit;

        if (orientation == "horizontal") {
          var startPos = startColorPosition + unit + " 0" + unit;
          var endPos = endColorPosition + unit + " 0" + unit;
        } else {
          var startPos = "0" + unit + " " + startColorPosition + unit;
          var endPos = "0" + unit + " " + endColorPosition + unit;
        }

        var color = "from(" + startColor + "),to(" + endColor + ")";
        backgroundStyle.push("-webkit-gradient(linear," + startPos + "," + endPos + "," + color + ")");
        return true;
      },

      /**
       * Compute CSS rules to style the background with gradients.
       * This can be called multiple times and SHOULD layer the gradients on top of each other and on top of existing backgrounds.
       * IE9 canvas solution.
       * 
       * @param startColor {Color} The color to start the gradient with
       * @param endColor {Color} The color to end the gradient with
       * @param unit {Color} The unit in which startColorPosition and endColorPosition are measured
       * @param orientation {String} Either 'horizontal' or 'vertical'
       * @param startColorPosition {Number} The position of the gradient’s starting point, measured in `unit` units along the `orientation` axis from top or left
       * @param endColorPosition {Number} The position of the gradient’s ending point, measured in `unit` units along the `orientation` axis from top or left
       * @param styles {Map} The complete styles currently poised to be applied by decorators. Should not be written to in this method (use `backgroundStyle` for that)
       * @param backgroundStyle {Map} This method should push new background styles onto this array.
       *
       * @return {Boolean} Whether this implementation supports multiple gradients atop each other (true).
       */
      __styleLinearBackgroundGradientWithCanvas: function me(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
        if (!me.__canvas) {
          me.__canvas = document.createElement("canvas");
        }

        var isVertical = orientation == "vertical";
        var height = isVertical ? 200 : 1;
        var width = isVertical ? 1 : 200;
        var range = Math.max(100, endColorPosition - startColorPosition); // use the px difference as dimension

        if (unit === "px") {
          if (isVertical) {
            height = Math.max(height, endColorPosition - startColorPosition);
          } else {
            width = Math.max(width, endColorPosition - startColorPosition);
          }
        } else {
          if (isVertical) {
            height = Math.max(height, (endColorPosition - startColorPosition) * 2);
          } else {
            width = Math.max(width, (endColorPosition - startColorPosition) * 2);
          }
        }

        me.__canvas.width = width;
        me.__canvas.height = height;

        var ctx = me.__canvas.getContext('2d');

        if (isVertical) {
          var lingrad = ctx.createLinearGradient(0, 0, 0, height);
        } else {
          var lingrad = ctx.createLinearGradient(0, 0, width, 0);
        } // don't allow negative start values


        if (unit === "%") {
          lingrad.addColorStop(Math.max(0, startColorPosition) / range, startColor);
          lingrad.addColorStop(endColorPosition / range, endColor);
        } else {
          var comp = isVertical ? height : width;
          lingrad.addColorStop(Math.max(0, startColorPosition) / comp, startColor);
          lingrad.addColorStop(endColorPosition / comp, endColor);
        } //Clear the rect before drawing to allow for semitransparent colors


        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = lingrad;
        ctx.fillRect(0, 0, width, height);
        var size;

        if (unit === "%") {
          size = isVertical ? "100% " + range + "%" : range + "% 100%";
        } else {
          size = isVertical ? height + "px 100%" : "100% " + width + "px";
        }

        backgroundStyle.push("url(" + me.__canvas.toDataURL() + ") " + size);
        return true;
      },

      /**
       * Compute CSS rules to style the background with gradients.
       * This can be called multiple times and SHOULD layer the gradients on top of each other and on top of existing backgrounds.
       * Old IE filter fallback.
       * 
       * @param startColor {Color} The color to start the gradient with
       * @param endColor {Color} The color to end the gradient with
       * @param unit {Color} The unit in which startColorPosition and endColorPosition are measured
       * @param orientation {String} Either 'horizontal' or 'vertical'
       * @param startColorPosition {Number} The position of the gradient’s starting point, measured in `unit` units along the `orientation` axis from top or left
       * @param endColorPosition {Number} The position of the gradient’s ending point, measured in `unit` units along the `orientation` axis from top or left
       * @param styles {Map} The complete styles currently poised to be applied by decorators. Should not be written to in this method (use `backgroundStyle` for that). Note: this particular implementation will do that because it needs to change the `filter` property.
       * @param backgroundStyle {Map} This method should push new background styles onto this array.
       *
       * @return {Boolean} Whether this implementation supports multiple gradients atop each other (false).
       */
      __styleLinearBackgroundGradientWithMSFilter: function __styleLinearBackgroundGradientWithMSFilter(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
        var type = orientation == "horizontal" ? 1 : 0; // convert rgb, hex3 and named colors to hex6

        if (!qx.util.ColorUtil.isHex6String(startColor)) {
          startColor = qx.util.ColorUtil.stringToRgb(startColor);
          startColor = qx.util.ColorUtil.rgbToHexString(startColor);
        }

        if (!qx.util.ColorUtil.isHex6String(endColor)) {
          endColor = qx.util.ColorUtil.stringToRgb(endColor);
          endColor = qx.util.ColorUtil.rgbToHexString(endColor);
        } // get rid of the starting '#'


        startColor = startColor.substring(1, startColor.length);
        endColor = endColor.substring(1, endColor.length);
        var value = "progid:DXImageTransform.Microsoft.Gradient(GradientType=" + type + ", " + "StartColorStr='#FF" + startColor + "', " + "EndColorStr='#FF" + endColor + "';)";

        if (styles["filter"]) {
          styles["filter"] += ", " + value;
        } else {
          styles["filter"] = value;
        } // Elements with transparent backgrounds will not receive receive pointer
        // events if a Gradient filter is set.


        if (!styles["background-color"] || styles["background-color"] == "transparent") {
          // We don't support alpha transparency for the gradient color stops
          // so it doesn't matter which color we set here.
          styles["background-color"] = "white";
        }

        return false;
      },

      /**
       * Compute CSS rules to style the background with gradients.
       * This can be called multiple times and SHOULD layer the gradients on top of each other and on top of existing backgrounds.
       * Default implementation (uses spec-compliant syntax).
       * 
       * @param startColor {Color} The color to start the gradient with
       * @param endColor {Color} The color to end the gradient with
       * @param unit {Color} The unit in which startColorPosition and endColorPosition are measured
       * @param orientation {String} Either 'horizontal' or 'vertical'
       * @param startColorPosition {Number} The position of the gradient’s starting point, measured in `unit` units along the `orientation` axis from top or left
       * @param endColorPosition {Number} The position of the gradient’s ending point, measured in `unit` units along the `orientation` axis from top or left
       * @param styles {Map} The complete styles currently poised to be applied by decorators. Should not be written to in this method (use `backgroundStyle` for that)
       * @param backgroundStyle {Map} This method should push new background styles onto this array.
       *
       * @return {Boolean} Whether this implementation supports multiple gradients atop each other (true).
       */
      __styleLinearBackgroundGradientAccordingToSpec: function __styleLinearBackgroundGradientAccordingToSpec(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
        // WebKit, Opera and Gecko interpret 0deg as "to right"
        var deg = orientation == "horizontal" ? 0 : 270;
        var start = startColor + " " + startColorPosition + unit;
        var end = endColor + " " + endColorPosition + unit;
        var prefixedName = qx.core.Environment.get("css.gradient.linear"); // Browsers supporting the unprefixed implementation interpret 0deg as
        // "to top" as defined by the spec [BUG #6513]

        if (prefixedName === "linear-gradient") {
          deg = orientation == "horizontal" ? deg + 90 : deg - 90;
        }

        backgroundStyle.push(prefixedName + "(" + deg + "deg, " + start + "," + end + ")");
        return true;
      },

      /**
       * Helper to get a resolved color from a name
       * @param color {String} The color name
       * @return {Map} The resolved color
       */
      __getColor: function __getColor(color) {
        return qx.core.Environment.get("qx.theme") ? qx.theme.manager.Color.getInstance().resolve(color) : color;
      },
      // property apply
      _applyLinearBackgroundGradient: function _applyLinearBackgroundGradient() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MLinearBackgroundGradient.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.AliasManager": {},
      "qx.util.ResourceManager": {},
      "qx.bom.client.Css": {},
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.borderimage.standardsyntax": {
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
       2013 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Decorator which uses the CSS3 border image properties.
   */
  qx.Mixin.define("qx.ui.decoration.MBorderImage", {
    properties: {
      /**
       * Base image URL.
       */
      borderImage: {
        check: "String",
        nullable: true,
        apply: "_applyBorderImage"
      },

      /**
       * The top slice line of the base image. The slice properties divide the
       * image into nine regions, which define the corner, edge and the center
       * images.
       */
      sliceTop: {
        check: "Integer",
        nullable: true,
        init: null,
        apply: "_applyBorderImage"
      },

      /**
       * The right slice line of the base image. The slice properties divide the
       * image into nine regions, which define the corner, edge and the center
       * images.
       */
      sliceRight: {
        check: "Integer",
        nullable: true,
        init: null,
        apply: "_applyBorderImage"
      },

      /**
       * The bottom slice line of the base image. The slice properties divide the
       * image into nine regions, which define the corner, edge and the center
       * images.
       */
      sliceBottom: {
        check: "Integer",
        nullable: true,
        init: null,
        apply: "_applyBorderImage"
      },

      /**
       * The left slice line of the base image. The slice properties divide the
       * image into nine regions, which define the corner, edge and the center
       * images.
       */
      sliceLeft: {
        check: "Integer",
        nullable: true,
        init: null,
        apply: "_applyBorderImage"
      },

      /**
       * The slice properties divide the image into nine regions, which define the
       * corner, edge and the center images.
       */
      slice: {
        group: ["sliceTop", "sliceRight", "sliceBottom", "sliceLeft"],
        mode: "shorthand"
      },

      /**
       * This property specifies how the images for the sides and the middle part
       * of the border image are scaled and tiled horizontally.
       *
       * Values have the following meanings:
       * <ul>
       *   <li><strong>stretch</strong>: The image is stretched to fill the area.</li>
       *   <li><strong>repeat</strong>: The image is tiled (repeated) to fill the area.</li>
       *   <li><strong>round</strong>: The image is tiled (repeated) to fill the area. If it does not
       *    fill the area with a whole number of tiles, the image is rescaled so
       *    that it does.</li>
       * </ul>
       */
      repeatX: {
        check: ["stretch", "repeat", "round"],
        init: "stretch",
        apply: "_applyBorderImage"
      },

      /**
       * This property specifies how the images for the sides and the middle part
       * of the border image are scaled and tiled vertically.
       *
       * Values have the following meanings:
       * <ul>
       *   <li><strong>stretch</strong>: The image is stretched to fill the area.</li>
       *   <li><strong>repeat</strong>: The image is tiled (repeated) to fill the area.</li>
       *   <li><strong>round</strong>: The image is tiled (repeated) to fill the area. If it does not
       *    fill the area with a whole number of tiles, the image is rescaled so
       *    that it does.</li>
       * </ul>
       */
      repeatY: {
        check: ["stretch", "repeat", "round"],
        init: "stretch",
        apply: "_applyBorderImage"
      },

      /**
       * This property specifies how the images for the sides and the middle part
       * of the border image are scaled and tiled.
       */
      repeat: {
        group: ["repeatX", "repeatY"],
        mode: "shorthand"
      },

      /**
       * If set to <code>false</code>, the center image will be omitted and only
       * the border will be drawn.
       */
      fill: {
        check: "Boolean",
        init: true,
        apply: "_applyBorderImage"
      },

      /**
       * Configures the border image mode. Supported values:
       * <ul>
       *   <li>horizontal: left and right border images</li>
       *   <li>vertical: top and bottom border images</li>
       *   <li>grid: border images for all edges</li>
       * </ul>
       */
      borderImageMode: {
        check: ["horizontal", "vertical", "grid"],
        init: "grid"
      }
    },
    members: {
      /**
       * Adds the border-image styles to the given map
       * @param styles {Map} CSS style map
       */
      _styleBorderImage: function _styleBorderImage(styles) {
        if (!this.getBorderImage()) {
          return;
        }

        var resolvedImage = qx.util.AliasManager.getInstance().resolve(this.getBorderImage());
        var source = qx.util.ResourceManager.getInstance().toUri(resolvedImage);

        var computedSlices = this._getDefaultInsetsForBorderImage();

        var slice = [computedSlices.top, computedSlices.right, computedSlices.bottom, computedSlices.left];
        var repeat = [this.getRepeatX(), this.getRepeatY()].join(" ");
        var fill = this.getFill() && qx.core.Environment.get("css.borderimage.standardsyntax") ? " fill" : "";
        var styleName = qx.bom.Style.getPropertyName("borderImage");

        if (styleName) {
          var cssName = qx.bom.Style.getCssName(styleName);
          styles[cssName] = 'url("' + source + '") ' + slice.join(" ") + fill + " " + repeat;
        } // Apply border styles even if we couldn't determine the borderImage property name
        // (e.g. because the browser doesn't support it). This is needed to keep
        // the layout intact.


        styles["border-style"] = "solid";
        styles["border-color"] = "transparent";
        styles["border-width"] = slice.join("px ") + "px";
      },

      /**
       * Computes the inset values based on the border image slices (defined in the
       * decoration theme or computed from the fallback image sizes).
       *
       * @return {Map} Map with the top, right, bottom and left insets
       */
      _getDefaultInsetsForBorderImage: function _getDefaultInsetsForBorderImage() {
        if (!this.getBorderImage()) {
          return {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          };
        }

        var resolvedImage = qx.util.AliasManager.getInstance().resolve(this.getBorderImage());

        var computedSlices = this.__getSlices(resolvedImage);

        return {
          top: this.getSliceTop() || computedSlices[0],
          right: this.getSliceRight() || computedSlices[1],
          bottom: this.getSliceBottom() || computedSlices[2],
          left: this.getSliceLeft() || computedSlices[3]
        };
      },
      _applyBorderImage: function _applyBorderImage() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      },

      /**
       * Gets the slice sizes from the fallback border images.
       *
       * @param baseImage {String} Resource Id of the base border image
       * @return {Integer[]} Array with the top, right, bottom and left slice widths
       */
      __getSlices: function __getSlices(baseImage) {
        var mode = this.getBorderImageMode();
        var topSlice = 0;
        var rightSlice = 0;
        var bottomSlice = 0;
        var leftSlice = 0;
        var split = /(.*)(\.[a-z]+)$/.exec(baseImage);
        var prefix = split[1];
        var ext = split[2];
        var ResourceManager = qx.util.ResourceManager.getInstance();

        if (mode == "grid" || mode == "vertical") {
          topSlice = ResourceManager.getImageHeight(prefix + "-t" + ext);
          bottomSlice = ResourceManager.getImageHeight(prefix + "-b" + ext);
        }

        if (mode == "grid" || mode == "horizontal") {
          rightSlice = ResourceManager.getImageWidth(prefix + "-r" + ext);
          leftSlice = ResourceManager.getImageWidth(prefix + "-l" + ext);
        }

        return [topSlice, rightSlice, bottomSlice, leftSlice];
      }
    }
  });
  qx.ui.decoration.MBorderImage.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.CssTransition": {},
      "qx.bom.client.Browser": {},
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.transition": {
          "className": "qx.bom.client.CssTransition"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2017 OETIKER+PARTNER AG
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tobias Oetiker (oetiker)
  
  ************************************************************************ */

  /**
   * Mixin responsible for setting the css transition properties of a widget
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * Keep in mind that this is not supported by all browsers:
   *
   * * Firefox 16+
   * * IE 10+
   * * Edge
   * * Safari 6.1+
   * * Opera 12.10+
   * * Chrome 26+
   *
   * It is possible to define transitions by setting an
   * array containing the needed values as the property value.
   * In case multiple values are specified, the values of the properties
   * are repeated until all match in length.
   *
   * An example:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       transitionProperty: ['top','left']
   *       transitionDuration: '1s'
   *     }
   *   }
   * </pre>
   */
  qx.Mixin.define("qx.ui.decoration.MTransition", {
    properties: {
      /** transition property */
      transitionProperty: {
        nullable: true,
        apply: "_applyTransition"
      },

      /** transition duration */
      transitionDuration: {
        nullable: true,
        apply: "_applyTransition"
      },

      /** transition delay */
      transitionTimingFunction: {
        nullable: true,
        apply: "_applyTransition"
      },

      /** transition delay */
      transitionDelay: {
        nullable: true,
        apply: "_applyTransition"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the box shadow styles in place to the
       * given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleTransition: function _styleTransition(styles) {
        var propName = qx.core.Environment.get("css.transition");

        if (!propName || this.getTransitionDuration() == null) {
          return;
        }

        if (qx.bom.client.Browser.getName() === "chrome" && qx.bom.client.Browser.getVersion() >= 71) {
          // chrome has a repaint problem ... as suggested in
          // https://stackoverflow.com/a/21947628/235990 we are setting
          // a transform ...
          if (!styles.transform) {
            styles.transform = "translateZ(0)";
          }
        }

        propName = qx.bom.Style.getCssName(propName.name);
        var transitionProperties = ["transitionProperty", "transitionDuration", "transitionTimingFunction", "transitionDelay"];
        (function (tPros, tDurs, tTims, tDels) {
          for (var i = 0; i < tPros.length; i++) {
            var tPro = tPros[i] || 'all';
            var tDur = tDurs[i] || '0s';
            var tTim = tTims[i] || 'ease';
            var tDel = tDels[i] || '0s';
            var value = tPro + ' ' + tDur + ' ' + tTim + ' ' + tDel;

            if (!styles[propName]) {
              styles[propName] = value;
            } else {
              styles[propName] += "," + value;
            }
          }
        }).apply(this, this._getExtendedPropertyValueArrays(transitionProperties));
      },
      // property apply
      _applyTransition: function _applyTransition() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MTransition.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.decoration.Abstract": {
        "require": true
      },
      "qx.ui.decoration.IDecorator": {
        "require": true
      },
      "qx.ui.decoration.MBackgroundColor": {
        "require": true
      },
      "qx.ui.decoration.MBorderRadius": {
        "require": true
      },
      "qx.ui.decoration.MBoxShadow": {
        "require": true
      },
      "qx.ui.decoration.MDoubleBorder": {
        "require": true
      },
      "qx.ui.decoration.MLinearBackgroundGradient": {
        "require": true
      },
      "qx.ui.decoration.MBorderImage": {
        "require": true
      },
      "qx.ui.decoration.MTransition": {
        "require": true
      },
      "qx.lang.String": {},
      "qx.lang.Type": {}
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
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Decorator including all decoration possibilities from mixins:
   *
   * <ul>
   * <li>Background color</li>
   * <li>Background image</li>
   * <li>Background gradient</li>
   * <li>Single and double borders</li>
   * <li>Border radius</li>
   * <li>Box shadow</li>
   * </ul>
   */
  qx.Class.define("qx.ui.decoration.Decorator", {
    extend: qx.ui.decoration.Abstract,
    implement: [qx.ui.decoration.IDecorator],
    include: [qx.ui.decoration.MBackgroundColor, qx.ui.decoration.MBorderRadius, qx.ui.decoration.MBoxShadow, qx.ui.decoration.MDoubleBorder, qx.ui.decoration.MLinearBackgroundGradient, qx.ui.decoration.MBorderImage, qx.ui.decoration.MTransition],
    members: {
      __initialized: false,

      /**
       * Returns the configured padding minus the border width.
       * @return {Map} Map of top, right, bottom and left padding values
       */
      getPadding: function getPadding() {
        var insets = this.getInset();

        var slices = this._getDefaultInsetsForBorderImage();

        var borderTop = insets.top - (slices.top ? slices.top : this.getWidthTop());
        var borderRight = insets.right - (slices.right ? slices.right : this.getWidthRight());
        var borderBottom = insets.bottom - (slices.bottom ? slices.bottom : this.getWidthBottom());
        var borderLeft = insets.left - (slices.left ? slices.left : this.getWidthLeft());
        return {
          top: insets.top ? borderTop : this.getInnerWidthTop(),
          right: insets.right ? borderRight : this.getInnerWidthRight(),
          bottom: insets.bottom ? borderBottom : this.getInnerWidthBottom(),
          left: insets.left ? borderLeft : this.getInnerWidthLeft()
        };
      },

      /**
       * Returns the styles of the decorator as a map with property names written
       * in javascript style (e.g. <code>fontWeight</code> instead of <code>font-weight</code>).
       *
       * @param css {Boolean?} <code>true</code> if hyphenated CSS names should be returned.
       * @return {Map} style information
       */
      getStyles: function getStyles(css) {
        if (css) {
          return this._getStyles();
        }

        var jsStyles = {};

        var cssStyles = this._getStyles();

        for (var property in cssStyles) {
          jsStyles[qx.lang.String.camelCase(property)] = cssStyles[property];
        }

        return jsStyles;
      },

      /**
       * Collects all the style information from the decorators.
       *
       * @return {Map} style information
       */
      _getStyles: function _getStyles() {
        var styles = {};

        for (var name in this) {
          if (name.indexOf("_style") == 0 && this[name] instanceof Function) {
            this[name](styles);
          }
        }

        for (var name in styles) {
          if (qx.lang.Type.isArray(styles[name])) {
            styles[name] = styles[name].join(', ');
          }
        }

        this.__initialized = true;
        return styles;
      },
      // overridden
      _getDefaultInsets: function _getDefaultInsets() {
        var directions = ["top", "right", "bottom", "left"];
        var defaultInsets = {};

        for (var name in this) {
          if (name.indexOf("_getDefaultInsetsFor") == 0 && this[name] instanceof Function) {
            var currentInsets = this[name]();

            for (var i = 0; i < directions.length; i++) {
              var direction = directions[i]; // initialize with the first insets found

              if (defaultInsets[direction] == undefined) {
                defaultInsets[direction] = currentInsets[direction];
              } // take the largest inset


              if (currentInsets[direction] > defaultInsets[direction]) {
                defaultInsets[direction] = currentInsets[direction];
              }
            }
          }
        } // check if the mixins have created a default insets


        if (defaultInsets["top"] != undefined) {
          return defaultInsets;
        } // return a fallback which is 0 for all insets


        return {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        };
      },
      // overridden
      _isInitialized: function _isInitialized() {
        return this.__initialized;
      },

      /**
      * Ensures that every propertyValue specified in propertyNames is an array.
      * The value arrays are extended and repeated to match in length.
      * @param propertyNames {Array} Array containing the propertyNames.
      * @return {Array} Array containing the extended value arrays.
      */
      _getExtendedPropertyValueArrays: function _getExtendedPropertyValueArrays(propertyNames) {
        // transform non-array values to an array containing that value
        var propertyValues = propertyNames.map(function (propName) {
          var value = this.get(propName);

          if (!qx.lang.Type.isArray(value)) {
            value = [value];
          }

          return value;
        }, this); // Because it's possible to set multiple values for a property there's 
        // a chance that not all properties have the same number of values set.
        // Extend the value arrays by repeating existing values until all
        // arrays match in length.

        var items = Math.max.apply(Math, propertyValues.map(function (prop) {
          return prop.length;
        }));

        for (var i = 0; i < propertyValues.length; i++) {
          this.__extendArray(propertyValues[i], items);
        }

        return propertyValues;
      },

      /**
      * Extends an array up to the given length by repeating the elements already present.
      * @param array {Array} Incoming array. Has to contain at least one element.
      * @param to {Integer} Desired length. Must be greater than or equal to the the length of arr.
      */
      __extendArray: function __extendArray(array, to) {
        var initial = array.length;

        while (array.length < to) {
          array.push(array[array.length % initial]);
        }
      }
    }
  });
  qx.ui.decoration.Decorator.$$dbClassInfo = $$dbClassInfo;
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
   * This singleton manages global resource aliases.
   *
   * The AliasManager supports simple prefix replacement on strings. There are
   * some pre-defined aliases, and you can register your own with {@link #add}.
   * The AliasManager is automatically invoked in various situations, e.g. when
   * resolving the icon image for a button, so it is common to register aliases for
   * <a href="http://manual.qooxdoo.org/${qxversion}/pages/desktop/ui_resources.html">resource id's</a>.
   * You can of course call the AliasManager's {@link #resolve}
   * explicitly to get an alias resolution in any situation, but keep that
   * automatic invocation of the AliasManager in mind when defining new aliases as
   * they will be applied globally in many classes, not only your own.
   *
   * Examples:
   * <ul>
   *  <li> <code>foo</code> -> <code>bar/16pt/baz</code>  (resolves e.g. __"foo/a/b/c.png"__ to
   *    __"bar/16pt/baz/a/b/c.png"__)
   *  <li> <code>imgserver</code> -> <code>http&#058;&#047;&#047;imgs03.myserver.com/my/app/</code>
   *    (resolves e.g. __"imgserver/a/b/c.png"__ to
   *    __"http&#058;&#047;&#047;imgs03.myserver.com/my/app/a/b/c.png"__)
   * </ul>
   *
   * For resources, only aliases that resolve to proper resource id's can be __managed__
   * resources, and will be considered __unmanaged__ resources otherwise.
   */
  qx.Class.define("qx.util.AliasManager", {
    type: "singleton",
    extend: qx.util.ValueManager,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.util.ValueManager.constructor.call(this); // Contains defined aliases (like icons/, widgets/, application/, ...)

      this.__aliases = {}; // Define static alias from setting

      this.add("static", "qx/static");
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __aliases: null,

      /**
       * pre-process incoming dynamic value
       *
       * @param value {String} incoming value
       * @return {String} pre processed value
       */
      _preprocess: function _preprocess(value) {
        var dynamics = this._getDynamic();

        if (dynamics[value] === false) {
          return value;
        } else if (dynamics[value] === undefined) {
          if (value.charAt(0) === "/" || value.charAt(0) === "." || value.indexOf("http://") === 0 || value.indexOf("https://") === "0" || value.indexOf("file://") === 0) {
            dynamics[value] = false;
            return value;
          }

          if (this.__aliases[value]) {
            return this.__aliases[value];
          }

          var alias = value.substring(0, value.indexOf("/"));
          var resolved = this.__aliases[alias];

          if (resolved !== undefined) {
            dynamics[value] = resolved + value.substring(alias.length);
          }
        }

        return value;
      },

      /**
       * Define an alias to a resource path
       *
       * @param alias {String} alias name for the resource path/url
       * @param base {String} first part of URI for all images which use this alias
       */
      add: function add(alias, base) {
        // Store new alias value
        this.__aliases[alias] = base; // Localify stores

        var dynamics = this._getDynamic(); // Update old entries which use this alias


        for (var path in dynamics) {
          if (path.substring(0, path.indexOf("/")) === alias) {
            dynamics[path] = base + path.substring(alias.length);
          }
        }
      },

      /**
       * Remove a previously defined alias
       *
       * @param alias {String} alias name for the resource path/url
       */
      remove: function remove(alias) {
        delete this.__aliases[alias]; // No signal for depending objects here. These
        // will informed with the new value using add().
      },

      /**
       * Resolves a given path
       *
       * @param path {String} input path
       * @return {String} resulting path (with interpreted aliases)
       */
      resolve: function resolve(path) {
        var dynamic = this._getDynamic();

        if (path != null) {
          path = this._preprocess(path);
        }

        return dynamic[path] || path;
      },

      /**
       * Get registered aliases
       *
       * @return {Map} the map of the currently registered alias:resolution pairs
       */
      getAliases: function getAliases() {
        var res = {};

        for (var key in this.__aliases) {
          res[key] = this.__aliases[key];
        }

        return res;
      }
    }
  });
  qx.util.AliasManager.$$dbClassInfo = $$dbClassInfo;
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
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["html.webworker", "html.filereader", "html.geolocation", "html.audio", "html.audio.ogg", "html.audio.mp3", "html.audio.wav", "html.audio.au", "html.audio.aif", "html.video", "html.video.ogg", "html.video.h264", "html.video.webm", "html.storage.local", "html.storage.session", "html.storage.userdata", "html.classlist", "html.xpath", "html.xul", "html.canvas", "html.svg", "html.vml", "html.dataset", "html.element.contains", "html.element.compareDocumentPosition", "html.element.textcontent", "html.console", "html.image.naturaldimensions", "html.history.state", "html.selection", "html.node.isequalnode", "html.fullscreen"],
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
   * Internal class which contains the checks used by {@link qx.core.Environment}.
   * All checks in here are marked as internal which means you should never use
   * them directly.
   *
   * This class should contain all checks about HTML.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Html", {
    statics: {
      /**
       * Whether the client supports Web Workers.
       *
       * @internal
       * @return {Boolean} <code>true</code> if webworkers are supported
       */
      getWebWorker: function getWebWorker() {
        return window.Worker != null;
      },

      /**
       * Whether the client supports File Readers
       *
       * @internal
       * @return {Boolean} <code>true</code> if FileReaders are supported
       */
      getFileReader: function getFileReader() {
        return window.FileReader != null;
      },

      /**
       * Whether the client supports Geo Location.
       *
       * @internal
       * @return {Boolean} <code>true</code> if geolocation supported
       */
      getGeoLocation: function getGeoLocation() {
        return "geolocation" in navigator;
      },

      /**
       * Whether the client supports audio.
       *
       * @internal
       * @return {Boolean} <code>true</code> if audio is supported
       */
      getAudio: function getAudio() {
        return !!document.createElement('audio').canPlayType;
      },

      /**
       * Whether the client can play ogg audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioOgg: function getAudioOgg() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/ogg");
      },

      /**
       * Whether the client can play mp3 audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioMp3: function getAudioMp3() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/mpeg");
      },

      /**
       * Whether the client can play wave audio wave format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioWav: function getAudioWav() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/x-wav");
      },

      /**
       * Whether the client can play au audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioAu: function getAudioAu() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/basic");
      },

      /**
       * Whether the client can play aif audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioAif: function getAudioAif() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/x-aiff");
      },

      /**
       * Whether the client supports video.
       *
       * @internal
       * @return {Boolean} <code>true</code> if video is supported
       */
      getVideo: function getVideo() {
        return !!document.createElement('video').canPlayType;
      },

      /**
       * Whether the client supports ogg video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoOgg: function getVideoOgg() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/ogg; codecs="theora, vorbis"');
      },

      /**
       * Whether the client supports mp4 video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoH264: function getVideoH264() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
      },

      /**
       * Whether the client supports webm video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoWebm: function getVideoWebm() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/webm; codecs="vp8, vorbis"');
      },

      /**
       * Whether the client supports local storage.
       *
       * @internal
       * @return {Boolean} <code>true</code> if local storage is supported
       */
      getLocalStorage: function getLocalStorage() {
        try {
          // write once to make sure to catch safari's private mode [BUG #7718]
          window.localStorage.setItem("$qx_check", "test");
          window.localStorage.removeItem("$qx_check");
          return true;
        } catch (exc) {
          // Firefox Bug: localStorage doesn't work in file:/// documents
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=507361
          return false;
        }
      },

      /**
       * Whether the client supports session storage.
       *
       * @internal
       * @return {Boolean} <code>true</code> if session storage is supported
       */
      getSessionStorage: function getSessionStorage() {
        try {
          // write once to make sure to catch safari's private mode [BUG #7718]
          window.sessionStorage.setItem("$qx_check", "test");
          window.sessionStorage.removeItem("$qx_check");
          return true;
        } catch (exc) {
          // Firefox Bug: Local execution of window.sessionStorage throws error
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=357323
          return false;
        }
      },

      /**
       * Whether the client supports user data to persist data. This is only
       * relevant for IE < 8.
       *
       * @internal
       * @return {Boolean} <code>true</code> if the user data is supported.
       */
      getUserDataStorage: function getUserDataStorage() {
        var el = document.createElement("div");
        el.style["display"] = "none";
        document.getElementsByTagName("head")[0].appendChild(el);
        var supported = false;

        try {
          el.addBehavior("#default#userdata");
          el.load("qxtest");
          supported = true;
        } catch (e) {}

        document.getElementsByTagName("head")[0].removeChild(el);
        return supported;
      },

      /**
       * Whether the browser supports CSS class lists.
       * https://developer.mozilla.org/en-US/docs/DOM/element.classList
       *
       * @internal
       * @return {Boolean} <code>true</code> if class list is supported.
       */
      getClassList: function getClassList() {
        return !!(document.documentElement.classList && qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList");
      },

      /**
       * Checks if XPath could be used.
       *
       * @internal
       * @return {Boolean} <code>true</code> if xpath is supported.
       */
      getXPath: function getXPath() {
        return !!document.evaluate;
      },

      /**
       * Checks if XUL could be used.
       *
       * @internal
       * @return {Boolean} <code>true</code> if XUL is supported.
       */
      getXul: function getXul() {
        try {
          document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
          return true;
        } catch (e) {
          return false;
        }
      },

      /**
       * Checks if SVG could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if SVG is supported.
       */
      getSvg: function getSvg() {
        return document.implementation && document.implementation.hasFeature && (document.implementation.hasFeature("org.w3c.dom.svg", "1.0") || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));
      },

      /**
       * Checks if VML is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if VML is supported.
       */
      getVml: function getVml() {
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
        el.firstChild.style.behavior = "url(#default#VML)";
        var hasVml = _typeof(el.firstChild.adj) == "object";
        document.body.removeChild(el);
        return hasVml;
      },

      /**
       * Checks if canvas could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if canvas is supported.
       */
      getCanvas: function getCanvas() {
        return !!window.CanvasRenderingContext2D;
      },

      /**
       * Asynchronous check for using data urls.
       *
       * @internal
       * @param callback {Function} The function which should be executed as
       *   soon as the check is done.
       */
      getDataUrl: function getDataUrl(callback) {
        var data = new Image();

        data.onload = data.onerror = function () {
          // wrap that into a timeout because IE might execute it synchronously
          window.setTimeout(function () {
            callback.call(null, data.width == 1 && data.height == 1);
          }, 0);
        };

        data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      },

      /**
       * Checks if dataset could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if dataset is supported.
       */
      getDataset: function getDataset() {
        return !!document.documentElement.dataset;
      },

      /**
       * Check for element.contains
       *
       * @internal
       * @return {Boolean} <code>true</code> if element.contains is supported
       */
      getContains: function getContains() {
        // "object" in IE6/7/8, "function" in IE9
        return typeof document.documentElement.contains !== "undefined";
      },

      /**
       * Check for element.compareDocumentPosition
       *
       * @internal
       * @return {Boolean} <code>true</code> if element.compareDocumentPosition is supported
       */
      getCompareDocumentPosition: function getCompareDocumentPosition() {
        return typeof document.documentElement.compareDocumentPosition === "function";
      },

      /**
       * Check for element.textContent. Legacy IEs do not support this, use
       * innerText instead.
       *
       * @internal
       * @return {Boolean} <code>true</code> if textContent is supported
       */
      getTextContent: function getTextContent() {
        var el = document.createElement("span");
        return typeof el.textContent !== "undefined";
      },

      /**
       * Whether the client supports the fullscreen API.
       *
       * @internal
       * @return {Boolean} <code>true</code> if fullscreen is supported
       */
      getFullScreen: function getFullScreen() {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || false;
      },

      /**
       * Check for a console object.
       *
       * @internal
       * @return {Boolean} <code>true</code> if a console is available.
       */
      getConsole: function getConsole() {
        return typeof window.console !== "undefined";
      },

      /**
       * Check for the <code>naturalHeight</code> and <code>naturalWidth</code>
       * image element attributes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if both attributes are supported
       */
      getNaturalDimensions: function getNaturalDimensions() {
        var img = document.createElement("img");
        return typeof img.naturalHeight === "number" && typeof img.naturalWidth === "number";
      },

      /**
       * Check for HTML5 history manipulation support.
        * @internal
       * @return {Boolean} <code>true</code> if the HTML5 history API is supported
       */
      getHistoryState: function getHistoryState() {
        return typeof window.onpopstate !== "undefined" && typeof window.history.replaceState !== "undefined" && typeof window.history.pushState !== "undefined";
      },

      /**
       * Returns the name of the native object/function used to access the
       * document's text selection.
       *
       * @return {String|null} <code>getSelection</code> if the standard window.getSelection
       * function is available; <code>selection</code> if the MS-proprietary
       * document.selection object is available; <code>null</code> if no known
       * text selection API is available.
       */
      getSelection: function getSelection() {
        if (typeof window.getSelection === "function") {
          return "getSelection";
        }

        if (_typeof(document.selection) === "object") {
          return "selection";
        }

        return null;
      },

      /**
       * Check for the isEqualNode DOM method.
       *
       * @return {Boolean} <code>true</code> if isEqualNode is supported by DOM nodes
       */
      getIsEqualNode: function getIsEqualNode() {
        return typeof document.documentElement.isEqualNode === "function";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("html.webworker", statics.getWebWorker);
      qx.core.Environment.add("html.filereader", statics.getFileReader);
      qx.core.Environment.add("html.geolocation", statics.getGeoLocation);
      qx.core.Environment.add("html.audio", statics.getAudio);
      qx.core.Environment.add("html.audio.ogg", statics.getAudioOgg);
      qx.core.Environment.add("html.audio.mp3", statics.getAudioMp3);
      qx.core.Environment.add("html.audio.wav", statics.getAudioWav);
      qx.core.Environment.add("html.audio.au", statics.getAudioAu);
      qx.core.Environment.add("html.audio.aif", statics.getAudioAif);
      qx.core.Environment.add("html.video", statics.getVideo);
      qx.core.Environment.add("html.video.ogg", statics.getVideoOgg);
      qx.core.Environment.add("html.video.h264", statics.getVideoH264);
      qx.core.Environment.add("html.video.webm", statics.getVideoWebm);
      qx.core.Environment.add("html.storage.local", statics.getLocalStorage);
      qx.core.Environment.add("html.storage.session", statics.getSessionStorage);
      qx.core.Environment.add("html.storage.userdata", statics.getUserDataStorage);
      qx.core.Environment.add("html.classlist", statics.getClassList);
      qx.core.Environment.add("html.xpath", statics.getXPath);
      qx.core.Environment.add("html.xul", statics.getXul);
      qx.core.Environment.add("html.canvas", statics.getCanvas);
      qx.core.Environment.add("html.svg", statics.getSvg);
      qx.core.Environment.add("html.vml", statics.getVml);
      qx.core.Environment.add("html.dataset", statics.getDataset);
      qx.core.Environment.addAsync("html.dataurl", statics.getDataUrl);
      qx.core.Environment.add("html.element.contains", statics.getContains);
      qx.core.Environment.add("html.element.compareDocumentPosition", statics.getCompareDocumentPosition);
      qx.core.Environment.add("html.element.textcontent", statics.getTextContent);
      qx.core.Environment.add("html.console", statics.getConsole);
      qx.core.Environment.add("html.image.naturaldimensions", statics.getNaturalDimensions);
      qx.core.Environment.add("html.history.state", statics.getHistoryState);
      qx.core.Environment.add("html.selection", statics.getSelection);
      qx.core.Environment.add("html.node.isequalnode", statics.getIsEqualNode);
      qx.core.Environment.add("html.fullscreen", statics.getFullScreen);
    }
  });
  qx.bom.client.Html.$$dbClassInfo = $$dbClassInfo;
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
  
  ************************************************************************ */

  /**
   * Common base class for all focus events.
   */
  qx.Class.define("qx.event.type.Focus", {
    extend: qx.event.type.Event,
    members: {
      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param target {Object} Any possible event target
       * @param relatedTarget {Object} Any possible event target
       * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
       *     If the event is bubbling, the bubbling can be stopped using
       *     {@link qx.event.type.Event#stopPropagation}
       * @return {qx.event.type.Event} The initialized event instance
       */
      init: function init(target, relatedTarget, canBubble) {
        qx.event.type.Focus.prototype.init.base.call(this, canBubble, false);
        this._target = target;
        this._relatedTarget = relatedTarget;
        return this;
      }
    }
  });
  qx.event.type.Focus.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.Registration": {
        "construct": true
      },
      "qx.event.Timer": {
        "construct": true
      },
      "qx.ui.tooltip.ToolTip": {},
      "qx.ui.core.Widget": {},
      "qx.ui.form.IForm": {}
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
       * Adrian Olaru (adrianolaru)
  
  ************************************************************************ */

  /**
   * The tooltip manager globally manages the tooltips of all widgets. It will
   * display tooltips if the user hovers a widgets with a tooltip and hides all
   * other tooltips.
   */
  qx.Class.define("qx.ui.tooltip.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Register events

      qx.event.Registration.addListener(document.body, "pointerover", this.__onPointerOverRoot, this, true); // Instantiate timers

      this.__showTimer = new qx.event.Timer();

      this.__showTimer.addListener("interval", this.__onShowInterval, this);

      this.__hideTimer = new qx.event.Timer();

      this.__hideTimer.addListener("interval", this.__onHideInterval, this); // Init pointer position


      this.__pointerPosition = {
        left: 0,
        top: 0
      };
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Holds the current ToolTip instance */
      current: {
        check: "qx.ui.tooltip.ToolTip",
        nullable: true,
        apply: "_applyCurrent"
      },

      /** Show all invalid form fields tooltips . */
      showInvalidToolTips: {
        check: "Boolean",
        init: true
      },

      /** Show all tooltips. */
      showToolTips: {
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
      __pointerPosition: null,
      __hideTimer: null,
      __showTimer: null,
      __sharedToolTip: null,
      __sharedErrorToolTip: null,

      /**
       * Get the shared tooltip, which is used to display the
       * {@link qx.ui.core.Widget#toolTipText} and
       * {@link qx.ui.core.Widget#toolTipIcon} properties of widgets.
       * You can use this public shared instance to e.g. customize the
       * look and feel.
       *
       * @return {qx.ui.tooltip.ToolTip} The shared tooltip
       */
      getSharedTooltip: function getSharedTooltip() {
        if (!this.__sharedToolTip) {
          this.__sharedToolTip = new qx.ui.tooltip.ToolTip().set({
            rich: true
          });
        }

        return this.__sharedToolTip;
      },

      /**
       * Get the shared tooltip, which is used to display the
       * {@link qx.ui.core.Widget#toolTipText} and
       * {@link qx.ui.core.Widget#toolTipIcon} properties of widgets.
       * You can use this public shared instance to e.g. customize the
       * look and feel of the validation tooltips like
       * <code>getSharedErrorTooltip().getChildControl("atom").getChildControl("label").set({rich: true, wrap: true, width: 80})</code>
       *
       * @return {qx.ui.tooltip.ToolTip} The shared tooltip
       */
      getSharedErrorTooltip: function getSharedErrorTooltip() {
        if (!this.__sharedErrorToolTip) {
          this.__sharedErrorToolTip = new qx.ui.tooltip.ToolTip().set({
            appearance: "tooltip-error",
            rich: true
          });

          this.__sharedErrorToolTip.setLabel(""); // trigger label widget creation


          this.__sharedErrorToolTip.syncAppearance();
        }

        return this.__sharedErrorToolTip;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyCurrent: function _applyCurrent(value, old) {
        // Return if the new tooltip is a child of the old one
        if (old && qx.ui.core.Widget.contains(old, value)) {
          return;
        } // If old tooltip existing, hide it and clear widget binding


        if (old) {
          if (!old.isDisposed()) {
            old.exclude();
          }

          this.__showTimer.stop();

          this.__hideTimer.stop();
        }

        var Registration = qx.event.Registration;
        var el = document.body; // If new tooltip is not null, set it up and start the timer

        if (value) {
          this.__showTimer.startWith(value.getShowTimeout()); // Register hide handler


          Registration.addListener(el, "pointerout", this.__onPointerOutRoot, this, true);
          Registration.addListener(el, "focusout", this.__onFocusOutRoot, this, true);
          Registration.addListener(el, "pointermove", this.__onPointerMoveRoot, this, true);
        } else {
          // Deregister hide handler
          Registration.removeListener(el, "pointerout", this.__onPointerOutRoot, this, true);
          Registration.removeListener(el, "focusout", this.__onFocusOutRoot, this, true);
          Registration.removeListener(el, "pointermove", this.__onPointerMoveRoot, this, true);
        }
      },

      /*
      ---------------------------------------------------------------------------
        TIMER EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for the interval event of the show timer.
       *
       * @param e {qx.event.type.Event} Event object
       */
      __onShowInterval: function __onShowInterval(e) {
        var current = this.getCurrent();

        if (current && !current.isDisposed()) {
          this.__hideTimer.startWith(current.getHideTimeout());

          if (current.getPlaceMethod() == "widget") {
            current.placeToWidget(current.getOpener());
          } else {
            current.placeToPoint(this.__pointerPosition);
          }

          current.show();
        }

        this.__showTimer.stop();
      },

      /**
       * Event listener for the interval event of the hide timer.
       *
       * @param e {qx.event.type.Event} Event object
       */
      __onHideInterval: function __onHideInterval(e) {
        var current = this.getCurrent();

        if (current && !current.getAutoHide()) {
          return;
        }

        if (current && !current.isDisposed()) {
          current.exclude();
        }

        this.__hideTimer.stop();

        this.resetCurrent();
      },

      /*
      ---------------------------------------------------------------------------
        POINTER EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Global pointer move event handler
       *
       * @param e {qx.event.type.Pointer} The move pointer event
       */
      __onPointerMoveRoot: function __onPointerMoveRoot(e) {
        var pos = this.__pointerPosition;
        pos.left = Math.round(e.getDocumentLeft());
        pos.top = Math.round(e.getDocumentTop());
      },

      /**
       * Searches for the tooltip of the target widget. If any tooltip instance
       * is found this instance is bound to the target widget and the tooltip is
       * set as {@link #current}
       *
       * @param e {qx.event.type.Pointer} pointerover event
       */
      __onPointerOverRoot: function __onPointerOverRoot(e) {
        var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget()); // take first coordinates as backup if no move event will be fired (e.g. touch devices)

        this.__onPointerMoveRoot(e);

        this.showToolTip(target);
      },

      /**
       * Explicitly show tooltip for particular form item.
       *
       * @param target {Object | null} widget to show tooltip for
       */
      showToolTip: function showToolTip(target) {
        if (!target) {
          return;
        }

        var tooltip, tooltipText, tooltipIcon, invalidMessage; // Search first parent which has a tooltip

        while (target != null) {
          tooltip = target.getToolTip();
          tooltipText = target.getToolTipText() || null;
          tooltipIcon = target.getToolTipIcon() || null;

          if (qx.Class.hasInterface(target.constructor, qx.ui.form.IForm) && !target.isValid()) {
            invalidMessage = target.getInvalidMessage();
          }

          if (tooltip || tooltipText || tooltipIcon || invalidMessage) {
            break;
          }

          target = target.getLayoutParent();
        } //do nothing if


        if (!target //don't have a target
        // tooltip is disabled and the value of showToolTipWhenDisabled is false
        || !target.getEnabled() && !target.isShowToolTipWhenDisabled() //tooltip is blocked
        || target.isBlockToolTip() //an invalid message isn't set and tooltips are disabled
        || !invalidMessage && !this.getShowToolTips() //an invalid message is set and invalid tooltips are disabled
        || invalidMessage && !this.getShowInvalidToolTips()) {
          return;
        }

        if (invalidMessage) {
          tooltip = this.getSharedErrorTooltip().set({
            label: invalidMessage
          });
        }

        if (!tooltip) {
          tooltip = this.getSharedTooltip().set({
            label: tooltipText,
            icon: tooltipIcon
          });
        }

        this.setCurrent(tooltip);
        tooltip.setOpener(target);
      },

      /**
       * Resets the property {@link #current} if there was a
       * tooltip and no new one is created.
       *
       * @param e {qx.event.type.Pointer} pointerout event
       */
      __onPointerOutRoot: function __onPointerOutRoot(e) {
        var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());

        if (!target) {
          return;
        }

        var related = qx.ui.core.Widget.getWidgetByElement(e.getRelatedTarget());

        if (!related && e.getPointerType() == "mouse") {
          return;
        }

        var tooltip = this.getCurrent(); // If there was a tooltip and
        // - the destination target is the current tooltip
        //   or
        // - the current tooltip contains the destination target

        if (tooltip && (related == tooltip || qx.ui.core.Widget.contains(tooltip, related))) {
          return;
        } // If the destination target exists and the target contains it


        if (related && target && qx.ui.core.Widget.contains(target, related)) {
          return;
        }

        if (tooltip && !tooltip.getAutoHide()) {
          return;
        } // If there was a tooltip and there is no new one


        if (tooltip && !related) {
          this.setCurrent(null);
        } else {
          this.resetCurrent();
        }
      },

      /*
      ---------------------------------------------------------------------------
        FOCUS EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Reset the property {@link #current} if the
       * current tooltip is the tooltip of the target widget.
       *
       * @param e {qx.event.type.Focus} blur event
       */
      __onFocusOutRoot: function __onFocusOutRoot(e) {
        var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());

        if (!target) {
          return;
        }

        var tooltip = this.getCurrent();

        if (tooltip && !tooltip.getAutoHide()) {
          return;
        } // Only set to null if blurred widget is the
        // one which has created the current tooltip


        if (tooltip && tooltip == target.getToolTip()) {
          this.setCurrent(null);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // Deregister events
      qx.event.Registration.removeListener(document.body, "pointerover", this.__onPointerOverRoot, this, true); // Dispose timers

      this._disposeObjects("__showTimer", "__hideTimer", "__sharedToolTip");

      this.__pointerPosition = null;
    }
  });
  qx.ui.tooltip.Manager.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Blocker": {}
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
   * This mixin blocks events and can be included into all widgets.
   *
   * The {@link #block} and {@link #unblock} methods provided by this mixin can be used
   * to block any event from the widget. When blocked,
   * the blocker widget overlays the widget to block, including the padding area.
   *
   * The ({@link #blockContent} method can be used to block child widgets with a
   * zIndex below a certain value.
   */
  qx.Mixin.define("qx.ui.core.MBlocker", {
    properties: {
      /**
       * Color of the blocker
       */
      blockerColor: {
        check: "Color",
        init: null,
        nullable: true,
        apply: "_applyBlockerColor",
        themeable: true
      },

      /**
       * Opacity of the blocker
       */
      blockerOpacity: {
        check: "Number",
        init: 1,
        apply: "_applyBlockerOpacity",
        themeable: true
      }
    },
    members: {
      __blocker: null,

      /**
       * Template method for creating the blocker item.
       * @return {qx.ui.core.Blocker} The blocker to use.
       */
      _createBlocker: function _createBlocker() {
        return new qx.ui.core.Blocker(this);
      },
      // property apply
      _applyBlockerColor: function _applyBlockerColor(value, old) {
        this.getBlocker().setColor(value);
      },
      // property apply
      _applyBlockerOpacity: function _applyBlockerOpacity(value, old) {
        this.getBlocker().setOpacity(value);
      },

      /**
       * Block all events from this widget by placing a transparent overlay widget,
       * which receives all events, exactly over the widget.
       */
      block: function block() {
        this.getBlocker().block();
      },

      /**
       * Returns whether the widget is blocked.
       *
       * @return {Boolean} Whether the widget is blocked.
       */
      isBlocked: function isBlocked() {
        return this.__blocker && this.__blocker.isBlocked();
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it takes care of
       * the amount of {@link #block} calls. The blocker is only removed if
       * the number of {@link #unblock} calls is identical to {@link #block} calls.
       */
      unblock: function unblock() {
        if (this.__blocker) {
          this.__blocker.unblock();
        }
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it doesn't take care of
       * the amount of {@link #block} calls. The blocker is directly removed.
       */
      forceUnblock: function forceUnblock() {
        if (this.__blocker) {
          this.__blocker.forceUnblock();
        }
      },

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this.getBlocker().blockContent(zIndex);
      },

      /**
       * Get the blocker
       *
       * @return {qx.ui.core.Blocker} The blocker
       */
      getBlocker: function getBlocker() {
        if (!this.__blocker) {
          this.__blocker = this._createBlocker();
        }

        return this.__blocker;
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__blocker");
    }
  });
  qx.ui.core.MBlocker.$$dbClassInfo = $$dbClassInfo;
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin implements the key methods of the {@link qx.ui.window.IDesktop}.
   *
   * @ignore(qx.ui.window.Window)
   * @ignore(qx.ui.window.Window.*)
   */
  qx.Mixin.define("qx.ui.window.MDesktop", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The currently active window
       */
      activeWindow: {
        check: "qx.ui.window.Window",
        apply: "_applyActiveWindow",
        event: "changeActiveWindow",
        init: null,
        nullable: true
      }
    },
    events: {
      /**
       * Fired when a window was added.
       */
      windowAdded: "qx.event.type.Data",

      /**
       * Fired when a window was removed.
       */
      windowRemoved: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __windows: null,
      __manager: null,

      /**
       * Get the desktop's window manager. Each desktop must have a window manager.
       * If none is configured the default window manager {@link qx.ui.window.Window#DEFAULT_MANAGER_CLASS}
       * is used.
       *
       * @return {qx.ui.window.IWindowManager} The desktop's window manager
       */
      getWindowManager: function getWindowManager() {
        if (!this.__manager) {
          this.setWindowManager(new qx.ui.window.Window.DEFAULT_MANAGER_CLASS());
        }

        return this.__manager;
      },

      /**
       * Whether the configured layout supports a maximized window
       * e.g. is a Canvas.
       *
       * @return {Boolean} Whether the layout supports maximized windows
       */
      supportsMaximize: function supportsMaximize() {
        return true;
      },

      /**
       * Sets the desktop's window manager
       *
       * @param manager {qx.ui.window.IWindowManager} The window manager
       */
      setWindowManager: function setWindowManager(manager) {
        if (this.__manager) {
          this.__manager.setDesktop(null);
        }

        manager.setDesktop(this);
        this.__manager = manager;
      },

      /**
       * Event handler. Called if one of the managed windows changes its active
       * state.
       *
       * @param e {qx.event.type.Event} the event object.
       */
      _onChangeActive: function _onChangeActive(e) {
        if (e.getData()) {
          this.setActiveWindow(e.getTarget());
        } else if (this.getActiveWindow() == e.getTarget()) {
          this.setActiveWindow(null);
        }
      },
      // property apply
      _applyActiveWindow: function _applyActiveWindow(value, old) {
        this.getWindowManager().changeActiveWindow(value, old);
        this.getWindowManager().updateStack();
      },

      /**
       * Event handler. Called if one of the managed windows changes its modality
       *
       * @param e {qx.event.type.Event} the event object.
       */
      _onChangeModal: function _onChangeModal(e) {
        this.getWindowManager().updateStack();
      },

      /**
       * Event handler. Called if one of the managed windows changes its visibility
       * state.
       */
      _onChangeVisibility: function _onChangeVisibility() {
        this.getWindowManager().updateStack();
      },

      /**
       * Overrides the method {@link qx.ui.core.Widget#_afterAddChild}
       *
       * @param win {qx.ui.core.Widget} added widget
       */
      _afterAddChild: function _afterAddChild(win) {
        if (qx.Class.isDefined("qx.ui.window.Window") && win instanceof qx.ui.window.Window) {
          this._addWindow(win);
        }
      },

      /**
       * Handles the case, when a window is added to the desktop.
       *
       * @param win {qx.ui.window.Window} Window, which has been added
       */
      _addWindow: function _addWindow(win) {
        if (!this.getWindows().includes(win)) {
          this.getWindows().push(win);
          this.fireDataEvent("windowAdded", win);
          win.addListener("changeActive", this._onChangeActive, this);
          win.addListener("changeModal", this._onChangeModal, this);
          win.addListener("changeVisibility", this._onChangeVisibility, this);
        }

        if (win.getActive()) {
          this.setActiveWindow(win);
        }

        this.getWindowManager().updateStack();
      },

      /**
       * Overrides the method {@link qx.ui.core.Widget#_afterRemoveChild}
       *
       * @param win {qx.ui.core.Widget} removed widget
       */
      _afterRemoveChild: function _afterRemoveChild(win) {
        if (qx.Class.isDefined("qx.ui.window.Window") && win instanceof qx.ui.window.Window) {
          this._removeWindow(win);
        }
      },

      /**
       * Handles the case, when a window is removed from the desktop.
       *
       * @param win {qx.ui.window.Window} Window, which has been removed
       */
      _removeWindow: function _removeWindow(win) {
        if (this.getWindows().includes(win)) {
          qx.lang.Array.remove(this.getWindows(), win);
          this.fireDataEvent("windowRemoved", win);
          win.removeListener("changeActive", this._onChangeActive, this);
          win.removeListener("changeModal", this._onChangeModal, this);
          win.removeListener("changeVisibility", this._onChangeVisibility, this);
          this.getWindowManager().updateStack();
        }
      },

      /**
       * Get a list of all windows added to the desktop (including hidden windows)
       *
       * @return {qx.ui.window.Window[]} Array of managed windows
       */
      getWindows: function getWindows() {
        if (!this.__windows) {
          this.__windows = [];
        }

        return this.__windows;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeArray("__windows");

      this._disposeObjects("__manager");
    }
  });
  qx.ui.window.MDesktop.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MChildrenHandling": {
        "defer": "runtime",
        "require": true
      },
      "qx.ui.core.MBlocker": {
        "require": true
      },
      "qx.ui.window.MDesktop": {
        "require": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.ui.core.queue.Visibility": {
        "construct": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.bom.element.Cursor": {},
      "qx.dom.Node": {},
      "qx.bom.client.Event": {},
      "qx.bom.Event": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "event.help": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Shared implementation for all root widgets.
   */
  qx.Class.define("qx.ui.root.Abstract", {
    type: "abstract",
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MChildrenHandling, qx.ui.core.MBlocker, qx.ui.window.MDesktop],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Register as root for the focus handler

      qx.ui.core.FocusHandler.getInstance().addRoot(this); // Directly add to visibility queue

      qx.ui.core.queue.Visibility.add(this);
      this.initNativeHelp();
      this.addListener("keypress", this.__preventScrollWhenFocused, this);
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
        init: "root"
      },
      // overridden
      enabled: {
        refine: true,
        init: true
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /**
       *  Sets the global cursor style
       *
       *  The name of the cursor to show when the mouse pointer is over the widget.
       *  This is any valid CSS2 cursor name defined by W3C.
       *
       *  The following values are possible:
       *  <ul><li>default</li>
       *  <li>crosshair</li>
       *  <li>pointer (hand is the ie name and will mapped to pointer in non-ie).</li>
       *  <li>move</li>
       *  <li>n-resize</li>
       *  <li>ne-resize</li>
       *  <li>e-resize</li>
       *  <li>se-resize</li>
       *  <li>s-resize</li>
       *  <li>sw-resize</li>
       *  <li>w-resize</li>
       *  <li>nw-resize</li>
       *  <li>text</li>
       *  <li>wait</li>
       *  <li>help </li>
       *  <li>url([file]) = self defined cursor, file should be an ANI- or CUR-type</li>
       *  </ul>
       *
       * Please note that in the current implementation this has no effect in IE.
       */
      globalCursor: {
        check: "String",
        nullable: true,
        themeable: true,
        apply: "_applyGlobalCursor",
        event: "changeGlobalCursor"
      },

      /**
       * Whether the native context menu should be globally enabled. Setting this
       * property to <code>true</code> will allow native context menus in all
       * child widgets of this root.
       */
      nativeContextMenu: {
        refine: true,
        init: false
      },

      /**
       * If the user presses F1 in IE by default the onhelp event is fired and
       * IE’s help window is opened. Setting this property to <code>false</code>
       * prevents this behavior.
       */
      nativeHelp: {
        check: "Boolean",
        init: false,
        apply: "_applyNativeHelp"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __globalCursorStyleSheet: null,
      // overridden
      isRootWidget: function isRootWidget() {
        return true;
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      getLayout: function getLayout() {
        return this._getLayout();
      },
      // property apply
      _applyGlobalCursor: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(value, old) {// empty implementation
        },
        // This would be the optimal solution.
        // For performance reasons this is impractical in IE
        "default": function _default(value, old) {
          var Stylesheet = qx.bom.Stylesheet;
          var sheet = this.__globalCursorStyleSheet;

          if (!sheet) {
            this.__globalCursorStyleSheet = sheet = Stylesheet.createElement();
          }

          Stylesheet.removeAllRules(sheet);

          if (value) {
            Stylesheet.addRule(sheet, "*", qx.bom.element.Cursor.compile(value).replace(";", "") + " !important");
          }
        }
      }),
      // property apply
      _applyNativeContextMenu: function _applyNativeContextMenu(value, old) {
        if (value) {
          this.removeListener("contextmenu", this._onNativeContextMenu, this, true);
        } else {
          this.addListener("contextmenu", this._onNativeContextMenu, this, true);
        }
      },

      /**
       * Stops the <code>contextmenu</code> event from showing the native context menu
       *
       * @param e {qx.event.type.Mouse} The event object
       */
      _onNativeContextMenu: function _onNativeContextMenu(e) {
        if (e.getTarget().getNativeContextMenu()) {
          return;
        }

        e.preventDefault();
      },

      /**
      * Fix unexpected scrolling when pressing "Space" while a widget is focused.
      *
      * @param e {qx.event.type.KeySequence} The KeySequence event
      */
      __preventScrollWhenFocused: function __preventScrollWhenFocused(e) {
        // Require space pressed
        if (e.getKeyIdentifier() !== "Space") {
          return;
        }

        var target = e.getTarget(); // Require focused. Allow scroll when container or root widget.

        var focusHandler = qx.ui.core.FocusHandler.getInstance();

        if (!focusHandler.isFocused(target)) {
          return;
        } // Require that widget does not accept text input


        var el = target.getContentElement();
        var nodeName = el.getNodeName();
        var domEl = el.getDomElement();

        if (nodeName === "input" || nodeName === "textarea" || domEl && domEl.contentEditable === "true") {
          return;
        } // do not prevent "space" key for natively focusable elements


        nodeName = qx.dom.Node.getName(e.getOriginalTarget());

        if (nodeName && ["input", "textarea", "select", "a"].indexOf(nodeName) > -1) {
          return;
        } // Ultimately, prevent default


        e.preventDefault();
      },
      // property apply
      _applyNativeHelp: function _applyNativeHelp(value, old) {
        if (qx.core.Environment.get("event.help")) {
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
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__globalCursorStyleSheet = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics, members) {
      qx.ui.core.MChildrenHandling.remap(members);
    }
  });
  qx.ui.root.Abstract.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.root.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Basic": {
        "construct": true
      },
      "qx.ui.core.queue.Layout": {
        "construct": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.bom.client.Engine": {
        "construct": true
      },
      "qx.html.Root": {},
      "qx.bom.Document": {}
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This widget provides a root widget for popups and tooltips if qooxdoo is used
   * inside a traditional HTML page. Widgets placed into a page will overlay the
   * HTML content.
   *
   * For this reason the widget's layout is initialized with an instance of
   * {@link qx.ui.layout.Basic}. The widget's layout cannot be changed.
   *
   * The page widget does not support paddings and decorators with insets.
   *
   * Note: This widget does not support decorations!
   *
   * If you want to place widgets inside existing DOM elements
   * use {@link qx.ui.root.Inline}.
   */
  qx.Class.define("qx.ui.root.Page", {
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
      // Temporary storage of element to use
      this.__doc = doc;
      qx.ui.root.Abstract.constructor.call(this); // Use a hard-coded basic layout

      this._setLayout(new qx.ui.layout.Basic()); // Set a high zIndex to make sure the widgets really overlay the HTML page.


      this.setZIndex(10000); // Directly add to layout queue

      qx.ui.core.queue.Layout.add(this); // Register resize listener

      this.addListener("resize", this.__onResize, this); // Register as root

      qx.ui.core.FocusHandler.getInstance().connectTo(this); // Avoid the automatically scroll in to view.
      // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3236 for details.

      if (qx.core.Environment.get("engine.name") == "mshtml") {
        this.setKeepFocus(true);
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __timer: null,
      __doc: null,
      // overridden
      _createContentElement: function _createContentElement() {
        var elem = this.__doc.createElement("div");

        this.__doc.body.appendChild(elem);

        var root = new qx.html.Root(elem);
        root.setStyles({
          position: "absolute",
          textAlign: "left"
        }); // Store reference to the widget in the DOM element.

        root.connectWidget(this); // Mark the element of this root with a special attribute to prevent
        // that qx.event.handler.Focus is performing a focus action.
        // This would end up in a scrolling to the top which is not wanted in
        // an inline scenario
        // see Bug #2740

        if (qx.core.Environment.get("engine.name") == "gecko") {
          root.setAttribute("qxIsRootPage", 1);
        }

        return root;
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var width = qx.bom.Document.getWidth(this._window);
        var height = qx.bom.Document.getHeight(this._window);
        return {
          minWidth: width,
          width: width,
          maxWidth: width,
          minHeight: height,
          height: height,
          maxHeight: height
        };
      },

      /**
       * Adjust html element size on layout resizes.
       *
       * @param e {qx.event.type.Data} event object
       */
      __onResize: function __onResize(e) {
        // set the size to 0 so make the content element invisible
        // this works because the content element has overflow "show"
        this.getContentElement().setStyles({
          width: 0,
          height: 0
        });
      },

      /**
       * Whether the configured layout supports a maximized window
       * e.g. is a Canvas.
       *
       * @return {Boolean} Whether the layout supports maximized windows
       */
      supportsMaximize: function supportsMaximize() {
        return false;
      },
      // overridden
      _applyPadding: function _applyPadding(value, old, name) {
        if (value && (name == "paddingTop" || name == "paddingLeft")) {
          throw new Error("The root widget does not support 'left', or 'top' paddings!");
        }

        qx.ui.root.Page.prototype._applyPadding.base.call(this, value, old, name);
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__doc = null;
    }
  });
  qx.ui.root.Page.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Type": {},
      "qx.lang.Function": {},
      "qx.event.GlobalError": {},
      "qx.bom.client.Engine": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.globalErrorHandling": {
          "className": "qx.event.GlobalError"
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
   * The ImageLoader can preload and manage loaded image resources. It easily
   * handles multiple requests and supports callbacks for successful and failed
   * requests.
   *
   * After loading of an image the dimension of the image is stored as long
   * as the application is running. This is quite useful for in-memory layouting.
   *
   * Use {@link #load} to preload your own images.
   */
  qx.Bootstrap.define("qx.io.ImageLoader", {
    statics: {
      /** @type {Map} Internal data structure to cache image sizes */
      __data: {},

      /** @type {Map} Default image size */
      __defaultSize: {
        width: null,
        height: null
      },

      /** @type {RegExp} Known image types */
      __knownImageTypesRegExp: /\.(png|gif|jpg|jpeg|bmp)\b/i,

      /** @type {RegExp} Image types of a data URL */
      __dataUrlRegExp: /^data:image\/(png|gif|jpg|jpeg|bmp)\b/i,

      /**
       * Whether the given image has previously been loaded using the
       * {@link #load} method.
       *
       * @param source {String} Image source to query
       * @return {Boolean} <code>true</code> when the image is loaded
       */
      isLoaded: function isLoaded(source) {
        var entry = this.__data[source];
        return !!(entry && entry.loaded);
      },

      /**
       * Whether the given image has previously been requested using the
       * {@link #load} method but failed.
       *
       * @param source {String} Image source to query
       * @return {Boolean} <code>true</code> when the image loading failed
       */
      isFailed: function isFailed(source) {
        var entry = this.__data[source];
        return !!(entry && entry.failed);
      },

      /**
       * Whether the given image is currently loading.
       *
       * @param source {String} Image source to query
       * @return {Boolean} <code>true</code> when the image is loading in the moment.
       */
      isLoading: function isLoading(source) {
        var entry = this.__data[source];
        return !!(entry && entry.loading);
      },

      /**
       * Returns the format of a previously loaded image
       *
       * @param source {String} Image source to query
       * @return {String ? null} The format of the image or <code>null</code>
       */
      getFormat: function getFormat(source) {
        var entry = this.__data[source];

        if (!entry || !entry.format) {
          var result = this.__dataUrlRegExp.exec(source);

          if (result != null) {
            // If width and height aren't defined, provide some defaults
            var width = entry && qx.lang.Type.isNumber(entry.width) ? entry.width : this.__defaultSize.width;
            var height = entry && qx.lang.Type.isNumber(entry.height) ? entry.height : this.__defaultSize.height;
            entry = {
              loaded: true,
              format: result[1],
              width: width,
              height: height
            };
          }
        }

        return entry ? entry.format : null;
      },

      /**
       * Returns the size of a previously loaded image
       *
       * @param source {String} Image source to query
       * @return {Map} The dimension of the image (<code>width</code> and
       *    <code>height</code> as key). If the image is not yet loaded, the
       *    dimensions are given as <code>null</code> for width and height.
       */
      getSize: function getSize(source) {
        var entry = this.__data[source];
        return entry ? {
          width: entry.width,
          height: entry.height
        } : this.__defaultSize;
      },

      /**
       * Returns the image width
       *
       * @param source {String} Image source to query
       * @return {Integer} The width or <code>null</code> when the image is not loaded
       */
      getWidth: function getWidth(source) {
        var entry = this.__data[source];
        return entry ? entry.width : null;
      },

      /**
       * Returns the image height
       *
       * @param source {String} Image source to query
       * @return {Integer} The height or <code>null</code> when the image is not loaded
       */
      getHeight: function getHeight(source) {
        var entry = this.__data[source];
        return entry ? entry.height : null;
      },

      /**
       * Loads the given image. Supports a callback which is
       * executed when the image is loaded.
       *
       * This method works asynchronous.
       *
       * @param source {String} Image source to load
       * @param callback {Function?} Callback function to execute
       *   The first parameter of the callback is the given source url, the
       *   second parameter is the data entry which contains additional
       *   information about the image.
       * @param context {Object?} Context in which the given callback should be executed
       */
      load: function load(source, callback, context) {
        // Shorthand
        var entry = this.__data[source];

        if (!entry) {
          entry = this.__data[source] = {};
        } // Normalize context


        if (callback && !context) {
          context = window;
        } // Already known image source


        if (entry.loaded || entry.loading || entry.failed) {
          if (callback) {
            if (entry.loading) {
              entry.callbacks.push(callback, context);
            } else {
              callback.call(context, source, entry);
            }
          }
        } else {
          // Updating entry
          entry.loading = true;
          entry.callbacks = [];

          if (callback) {
            entry.callbacks.push(callback, context);
          } // Create image element


          var el = document.createElement('img'); // Create common callback routine

          var boundCallback = qx.lang.Function.listener(this.__onload, this, el, source); // Assign callback to element

          el.onload = boundCallback;
          el.onerror = boundCallback; // Start loading of image

          el.src = source; // save the element for aborting

          entry.element = el;
        }
      },

      /**
       * Abort the loading for the given url.
       *
       * @param source {String} URL of the image to abort its loading.
       */
      abort: function abort(source) {
        var entry = this.__data[source];

        if (entry && !entry.loaded) {
          entry.aborted = true;
          var callbacks = entry.callbacks;
          var element = entry.element; // Cleanup listeners

          element.onload = element.onerror = null; // prevent further loading

          element.src = ""; // Cleanup entry

          delete entry.callbacks;
          delete entry.element;
          delete entry.loading;

          for (var i = 0, l = callbacks.length; i < l; i += 2) {
            callbacks[i].call(callbacks[i + 1], source, entry);
          }
        }

        this.__data[source] = null;
      },

      /**
       * Calls a method based on qx.globalErrorHandling
       */
      __onload: function __onload() {
        var callback = qx.core.Environment.select("qx.globalErrorHandling", {
          "true": qx.event.GlobalError.observeMethod(this.__onLoadHandler),
          "false": this.__onLoadHandler
        });
        callback.apply(this, arguments);
      },

      /**
       * Internal event listener for all load/error events.
       *
       * @signature function(event, element, source)
       *
       * @param event {Event} Native event object
       * @param element {Element} DOM element which represents the image
       * @param source {String} The image source loaded
       */
      __onLoadHandler: function __onLoadHandler(event, element, source) {
        // Shorthand
        var entry = this.__data[source]; // [BUG #9149]: When loading a SVG IE11 won't have
        // the width/height of the element set, unless
        // it is inserted into the DOM.

        if (qx.bom.client.Engine.getName() == "mshtml" && parseFloat(qx.bom.client.Engine.getVersion()) === 11) {
          document.body.appendChild(element);
        }

        var isImageAvailable = function isImageAvailable(imgElem) {
          return imgElem && imgElem.height !== 0;
        }; // [BUG #7497]: IE11 doesn't properly emit an error event
        // when loading fails so augment success check


        if (event.type === "load" && isImageAvailable(element)) {
          // Store dimensions
          entry.loaded = true;
          entry.width = element.width;
          entry.height = element.height; // try to determine the image format

          var result = this.__knownImageTypesRegExp.exec(source);

          if (result != null) {
            entry.format = result[1];
          }
        } else {
          entry.failed = true;
        }

        if (qx.bom.client.Engine.getName() == "mshtml" && parseFloat(qx.bom.client.Engine.getVersion()) === 11) {
          document.body.removeChild(element);
        } // Cleanup listeners


        element.onload = element.onerror = null; // Cache callbacks

        var callbacks = entry.callbacks; // Cleanup entry

        delete entry.loading;
        delete entry.callbacks;
        delete entry.element; // Execute callbacks

        for (var i = 0, l = callbacks.length; i < l; i += 2) {
          callbacks[i].call(callbacks[i + 1], source, entry);
        }
      },

      /**
       * Dispose stored images.
       */
      dispose: function dispose() {
        this.__data = {};
      }
    }
  });
  qx.io.ImageLoader.$$dbClassInfo = $$dbClassInfo;
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
      "qx.html.Element": {
        "require": true
      },
      "qx.bom.element.Decoration": {},
      "qx.bom.client.Engine": {}
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
   * This is a simple image class using the low level image features of
   * qooxdoo and wraps it for the qx.html layer.
   */
  qx.Class.define("qx.html.Image", {
    extend: qx.html.Element,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __paddingTop: null,
      __paddingLeft: null,
      // this member variable is only used for IE browsers to be able
      // to the tag name which will be set. This is heavily connected to the runtime
      // change of decorators and the use of external (=unmanaged images). It is
      // necessary to be able to determine what tag will be used e.g. before the
      // ImageLoader has finished its loading of an external image.
      // See Bug #3894 for more details
      tagNameHint: null,

      /**
       * Maps padding to background-position if the widget is rendered as a
       * background image
       * @param paddingLeft {Integer} left padding value
       * @param paddingTop {Integer} top padding value
       */
      setPadding: function setPadding(paddingLeft, paddingTop) {
        this.__paddingLeft = paddingLeft;
        this.__paddingTop = paddingTop;

        if (this.getNodeName() == "div") {
          this.setStyle("backgroundPosition", paddingLeft + "px " + paddingTop + "px");
        }
      },

      /*
      ---------------------------------------------------------------------------
        ELEMENT API
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyProperty: function _applyProperty(name, value) {
        qx.html.Image.prototype._applyProperty.base.call(this, name, value);

        if (name === "source") {
          var elem = this.getDomElement(); // To prevent any wrong background-position or -repeat it is necessary
          // to reset those styles whenever a background-image is updated.
          // This is only necessary if any backgroundImage was set already.
          // See bug #3376 for details

          var styles = this.getAllStyles();

          if (this.getNodeName() == "div" && this.getStyle("backgroundImage")) {
            styles.backgroundRepeat = null;
          }

          var source = this._getProperty("source");

          var scale = this._getProperty("scale");

          var repeat = scale ? "scale" : "no-repeat"; // Source can be null in certain circumstances.
          // See bug #3701 for details.

          if (source != null) {
            // Normalize "" to null
            source = source || null;
            styles.paddingTop = this.__paddingTop;
            styles.paddingLeft = this.__paddingLeft;
            qx.bom.element.Decoration.update(elem, source, repeat, styles);
          }
        }
      },
      // overridden
      _removeProperty: function _removeProperty(key, direct) {
        if (key == "source") {
          // Work-around check for null in #_applyProperty, introduced with fix
          // for bug #3701. Use empty string that is later normalized to null.
          // This fixes bug #4524.
          this._setProperty(key, "", direct);
        } else {
          this._setProperty(key, null, direct);
        }
      },
      // overridden
      _createDomElement: function _createDomElement() {
        var scale = this._getProperty("scale");

        var repeat = scale ? "scale" : "no-repeat";

        if (qx.core.Environment.get("engine.name") == "mshtml") {
          var source = this._getProperty("source");

          if (this.tagNameHint != null) {
            this.setNodeName(this.tagNameHint);
          } else {
            this.setNodeName(qx.bom.element.Decoration.getTagName(repeat, source));
          }
        } else {
          this.setNodeName(qx.bom.element.Decoration.getTagName(repeat));
        }

        return qx.html.Image.prototype._createDomElement.base.call(this);
      },
      // overridden
      // be sure that style attributes are merged and not overwritten
      _copyData: function _copyData(fromMarkup) {
        return qx.html.Image.prototype._copyData.base.call(this, true);
      },

      /*
      ---------------------------------------------------------------------------
        IMAGE API
      ---------------------------------------------------------------------------
      */

      /**
       * Configures the image source
       *
       * @param value {Boolean} Whether the HTML mode should be used.
       * @return {qx.html.Label} This instance for for chaining support.
       */
      setSource: function setSource(value) {
        this._setProperty("source", value);

        return this;
      },

      /**
       * Returns the image source.
       *
       * @return {String} Current image source.
       */
      getSource: function getSource() {
        return this._getProperty("source");
      },

      /**
       * Resets the current source to null which means that no image
       * is shown anymore.
       * @return {qx.html.Image} The current instance for chaining
       */
      resetSource: function resetSource() {
        // webkit browser do not allow to remove the required "src" attribute.
        // If removing the attribute the old image is still visible.
        if (qx.core.Environment.get("engine.name") == "webkit") {
          this._setProperty("source", "qx/static/blank.gif");
        } else {
          this._removeProperty("source", true);
        }

        return this;
      },

      /**
       * Whether the image should be scaled or not.
       *
       * @param value {Boolean} Scale the image
       * @return {qx.html.Label} This instance for for chaining support.
       */
      setScale: function setScale(value) {
        this._setProperty("scale", value);

        return this;
      },

      /**
       * Returns whether the image is scaled or not.
       *
       * @return {Boolean} Whether the image is scaled
       */
      getScale: function getScale() {
        return this._getProperty("scale");
      }
    }
  });
  qx.html.Image.$$dbClassInfo = $$dbClassInfo;
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
        "require": true
      },
      "qx.bom.Label": {}
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
   * A cross browser label instance with support for rich HTML and text labels.
   *
   * Text labels supports ellipsis to reduce the text width.
   *
   * The mode can be changed through the method {@link #setRich}
   * which accepts a boolean value. The default mode is "text" which is
   * a good choice because it has a better performance.
   */
  qx.Class.define("qx.html.Label", {
    extend: qx.html.Element,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __rich: null,

      /*
      ---------------------------------------------------------------------------
        ELEMENT API
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyProperty: function _applyProperty(name, value) {
        qx.html.Label.prototype._applyProperty.base.call(this, name, value);

        if (name == "value") {
          var element = this.getDomElement();
          qx.bom.Label.setValue(element, value);
        }
      },
      // overridden
      _createDomElement: function _createDomElement() {
        var rich = this.__rich;
        var el = qx.bom.Label.create(this._content, rich);
        el.style.overflow = 'hidden';
        return el;
      },
      // overridden
      // be sure that style attributes are merged and not overwritten
      _copyData: function _copyData(fromMarkup) {
        return qx.html.Label.prototype._copyData.base.call(this, true);
      },

      /*
      ---------------------------------------------------------------------------
        LABEL API
      ---------------------------------------------------------------------------
      */

      /**
       * Toggles between rich HTML mode and pure text mode.
       *
       * @param value {Boolean} Whether the HTML mode should be used.
       * @return {qx.html.Label} This instance for chaining support.
       */
      setRich: function setRich(value) {
        var element = this.getDomElement();

        if (element) {
          throw new Error("The label mode cannot be modified after initial creation");
        }

        value = !!value;

        if (this.__rich == value) {
          return this;
        }

        this.__rich = value;
        return this;
      },

      /**
       * Sets the HTML/text content depending on the content mode.
       *
       * @param value {String} The content to be used.
       * @return {qx.html.Label} This instance for for chaining support.
       */
      setValue: function setValue(value) {
        this._setProperty("value", value);

        return this;
      },

      /**
       * Get the current content.
       *
       * @return {String} The labels's content
       */
      getValue: function getValue() {
        return this._getProperty("value");
      },

      /**
       * Reset the current content
       *
       * @return {qx.html.Label} This instance for for chaining support.
       */
      resetValue: function resetValue() {
        return this._removeProperty("value");
      }
    }
  });
  qx.html.Label.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.util.ResourceManager": {},
      "qx.bom.element.Style": {},
      "qx.bom.client.Css": {},
      "qx.theme.manager.Font": {},
      "qx.lang.Object": {},
      "qx.bom.Style": {},
      "qx.core.Assert": {},
      "qx.io.ImageLoader": {},
      "qx.log.Logger": {},
      "qx.bom.element.Background": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "css.alphaimageloaderneeded": {
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
       * Alexander Steitz (aback)
  
  ************************************************************************ */

  /**
   * Powerful creation and update features for images used for decoration
   * purposes like for rounded borders, icons, etc.
   *
   * Includes support for image clipping, PNG alpha channel support, additional
   * repeat options like <code>scale-x</code> or <code>scale-y</code>.
   */
  qx.Class.define("qx.bom.element.Decoration", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Boolean} Whether clipping hints should be logged */
      DEBUG: false,

      /** @type {Map} Collect warnings for potential clipped images */
      __warnings: {},

      /** @type {Map} List of repeat modes which supports the IE AlphaImageLoader */
      __alphaFixRepeats: qx.core.Environment.select("engine.name", {
        "mshtml": {
          "scale-x": true,
          "scale-y": true,
          "scale": true,
          "no-repeat": true
        },
        "default": null
      }),

      /** @type {Map} Mapping between background repeat and the tag to create */
      __repeatToTagname: {
        "scale-x": "img",
        "scale-y": "img",
        "scale": "img",
        "repeat": "div",
        "no-repeat": "div",
        "repeat-x": "div",
        "repeat-y": "div"
      },

      /**
       * Updates the element to display the given source
       * with the repeat option.
       *
       * @param element {Element} DOM element to update
       * @param source {String} Any valid URI
       * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
       *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
       *   <code>repeat-y</code>, <code>repeat</code>
       * @param style {Map} Additional styles to apply
       */
      update: function update(element, source, repeat, style) {
        var tag = this.getTagName(repeat, source);

        if (tag != element.tagName.toLowerCase()) {
          throw new Error("Image modification not possible because elements could not be replaced at runtime anymore!");
        }

        var ret = this.getAttributes(source, repeat, style);

        if (tag === "img") {
          element.src = ret.src || qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif");
        } // Fix for old background position


        if (element.style.backgroundPosition != "" && ret.style.backgroundPosition === undefined) {
          ret.style.backgroundPosition = null;
        } // Fix for old clip


        if (element.style.clip != "" && ret.style.clip === undefined) {
          ret.style.clip = null;
        } // Apply new styles


        qx.bom.element.Style.setStyles(element, ret.style); // we need to apply the filter to prevent black rendering artifacts
        // http://blog.hackedbrain.com/archive/2007/05/21/6110.aspx

        if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
          try {
            element.filters["DXImageTransform.Microsoft.AlphaImageLoader"].apply();
          } catch (e) {}
        }
      },

      /**
       * Creates the HTML for a decorator image element with the given options.
       *
       * @param source {String} Any valid URI
       * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
       *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
       *   <code>repeat-y</code>, <code>repeat</code>
       * @param style {Map} Additional styles to apply
       * @return {String} Decorator image HTML
       */
      create: function create(source, repeat, style) {
        var tag = this.getTagName(repeat, source);
        var ret = this.getAttributes(source, repeat, style);
        var css = qx.bom.element.Style.compile(ret.style);
        var ResourceManager = qx.util.ResourceManager.getInstance();

        if (ResourceManager.isFontUri(source)) {
          var font = qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]);
          var styles = qx.lang.Object.clone(font.getStyles());
          styles['width'] = style.width;
          styles['height'] = style.height;
          styles['fontSize'] = parseInt(style.width) > parseInt(style.height) ? style.height : style.width;
          styles['display'] = style.display;
          styles['verticalAlign'] = style.verticalAlign;
          styles['position'] = style.position;
          var css = "";

          for (var _style in styles) {
            if (styles.hasOwnProperty(_style)) {
              css += qx.bom.Style.getCssName(_style) + ": " + styles[_style] + ";";
            }
          }

          var resource = ResourceManager.getData(source);
          var charCode;

          if (resource) {
            charCode = resource[2];
          } else {
            charCode = parseInt(qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)\/(.*)$/)[2]), 16);
            qx.core.Assert.assertNumber(charCode, "Font source needs either a glyph name or the unicode number in hex");
          }

          return '<div style="' + css + '">' + String.fromCharCode(charCode) + '</div>';
        } else {
          if (tag === "img") {
            return '<img src="' + ret.src + '" style="' + css + '"/>';
          } else {
            return '<div style="' + css + '"></div>';
          }
        }
      },

      /**
       * Translates the given repeat option to a tag name. Useful
       * for systems which depends on early information of the tag
       * name to prepare element like {@link qx.html.Image}.
       *
       * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
       *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
       *   <code>repeat-y</code>, <code>repeat</code>
       * @param source {String?null} Source used to identify the image format
       * @return {String} The tag name: <code>div</code> or <code>img</code>
       */
      getTagName: function getTagName(repeat, source) {
        if (source && qx.core.Environment.get("css.alphaimageloaderneeded") && this.__alphaFixRepeats[repeat] && source.endsWith(".png")) {
          return "div";
        }

        return this.__repeatToTagname[repeat];
      },

      /**
       * This method is used to collect all needed attributes for
       * the tag name detected by {@link #getTagName}.
       *
       * @param source {String} Image source
       * @param repeat {String} Repeat mode of the image
       * @param style {Map} Additional styles to apply
       * @return {String} Markup for image
       */
      getAttributes: function getAttributes(source, repeat, style) {
        if (!style) {
          style = {};
        }

        if (!style.position) {
          style.position = "absolute";
        }

        if (qx.core.Environment.get("engine.name") == "mshtml") {
          // Add a fix for small blocks where IE has a minHeight
          // of the fontSize in quirks mode
          style.fontSize = 0;
          style.lineHeight = 0;
        } else if (qx.core.Environment.get("engine.name") == "webkit") {
          // This stops images from being draggable in webkit
          style.WebkitUserDrag = "none";
        }

        var format = qx.util.ResourceManager.getInstance().getImageFormat(source) || qx.io.ImageLoader.getFormat(source);
        {
          if (source != null && format == null) {
            qx.log.Logger.warn("ImageLoader: Not recognized format of external image '" + source + "'!");
          }
        }
        var result; // Enable AlphaImageLoader in IE6/IE7/IE8

        if (qx.core.Environment.get("css.alphaimageloaderneeded") && this.__alphaFixRepeats[repeat] && format === "png") {
          var dimension = this.__getDimension(source);

          this.__normalizeWidthHeight(style, dimension.width, dimension.height);

          result = this.processAlphaFix(style, repeat, source);
        } else {
          delete style.clip;

          if (repeat === "scale") {
            result = this.__processScale(style, repeat, source);
          } else if (repeat === "scale-x" || repeat === "scale-y") {
            result = this.__processScaleXScaleY(style, repeat, source);
          } else {
            // Native repeats or "no-repeat"
            result = this.__processRepeats(style, repeat, source);
          }
        }

        return result;
      },

      /**
       * Normalize the given width and height values
       *
       * @param style {Map} style information
       * @param width {Integer?null} width as number or null
       * @param height {Integer?null} height as number or null
       */
      __normalizeWidthHeight: function __normalizeWidthHeight(style, width, height) {
        if (style.width == null && width != null) {
          style.width = width + "px";
        }

        if (style.height == null && height != null) {
          style.height = height + "px";
        }
      },

      /**
       * Returns the dimension of the image by calling
       * {@link qx.util.ResourceManager} or {@link qx.io.ImageLoader}
       * depending on if the image is a managed one.
       *
       * @param source {String} image source
       * @return {Map} dimension of image
       */
      __getDimension: function __getDimension(source) {
        var width = qx.util.ResourceManager.getInstance().getImageWidth(source) || qx.io.ImageLoader.getWidth(source);
        var height = qx.util.ResourceManager.getInstance().getImageHeight(source) || qx.io.ImageLoader.getHeight(source);
        return {
          width: width,
          height: height
        };
      },

      /**
       * Get all styles for IE browser which need to load the image
       * with the help of the AlphaImageLoader
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param source {String} image source
       *
       * @return {Map} style infos
       */
      processAlphaFix: function processAlphaFix(style, repeat, source) {
        if (repeat == "repeat" || repeat == "repeat-x" || repeat == "repeat-y") {
          return style;
        }

        var sizingMethod = repeat == "no-repeat" ? "crop" : "scale";
        var filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + qx.util.ResourceManager.getInstance().toUri(source) + "', sizingMethod='" + sizingMethod + "')";
        style.filter = filter;
        style.backgroundImage = style.backgroundRepeat = "";
        delete style["background-image"];
        delete style["background-repeat"];
        return {
          style: style
        };
      },

      /**
       * Process scaled images.
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param source {String} image source
       *
       * @return {Map} image URI and style infos
       */
      __processScale: function __processScale(style, repeat, source) {
        var uri = qx.util.ResourceManager.getInstance().toUri(source);

        var dimension = this.__getDimension(source);

        this.__normalizeWidthHeight(style, dimension.width, dimension.height);

        return {
          src: uri,
          style: style
        };
      },

      /**
       * Process images which are either scaled horizontally or
       * vertically.
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param sourceid {String} image resource id
       *
       * @return {Map} image URI and style infos
       */
      __processScaleXScaleY: function __processScaleXScaleY(style, repeat, sourceid) {
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var clipped = ResourceManager.getCombinedFormat(sourceid);

        var dimension = this.__getDimension(sourceid);

        var uri;

        if (clipped) {
          var data = ResourceManager.getData(sourceid);
          var combinedid = data[4];

          if (clipped == "b64") {
            uri = ResourceManager.toDataUri(sourceid);
          } else {
            uri = ResourceManager.toUri(combinedid);
          }

          if (repeat === "scale-x") {
            style = this.__getStylesForClippedScaleX(style, data, dimension.height);
          } else {
            style = this.__getStylesForClippedScaleY(style, data, dimension.width);
          }

          return {
            src: uri,
            style: style
          };
        } // No clipped image available
        else {
            {
              this.__checkForPotentialClippedImage(sourceid);
            }

            if (repeat == "scale-x") {
              style.height = dimension.height == null ? null : dimension.height + "px"; // note: width is given by the user
            } else if (repeat == "scale-y") {
              style.width = dimension.width == null ? null : dimension.width + "px"; // note: height is given by the user
            }

            uri = ResourceManager.toUri(sourceid);
            return {
              src: uri,
              style: style
            };
          }
      },

      /**
       * Generates the style infos for horizontally scaled clipped images.
       *
       * @param style {Map} style infos
       * @param data {Array} image data retrieved from the {@link qx.util.ResourceManager}
       * @param height {Integer} image height
       *
       * @return {Map} style infos and image URI
       */
      __getStylesForClippedScaleX: function __getStylesForClippedScaleX(style, data, height) {
        // Use clipped image (multi-images on x-axis)
        var imageHeight = qx.util.ResourceManager.getInstance().getImageHeight(data[4]); // Add size and clipping

        style.clip = {
          top: -data[6],
          height: height
        };
        style.height = imageHeight + "px"; // note: width is given by the user
        // Fix user given y-coordinate to include the combined image offset

        if (style.top != null) {
          style.top = parseInt(style.top, 10) + data[6] + "px";
        } else if (style.bottom != null) {
          style.bottom = parseInt(style.bottom, 10) + height - imageHeight - data[6] + "px";
        }

        return style;
      },

      /**
       * Generates the style infos for vertically scaled clipped images.
       *
       * @param style {Map} style infos
       * @param data {Array} image data retrieved from the {@link qx.util.ResourceManager}
       * @param width {Integer} image width
       *
       * @return {Map} style infos and image URI
       */
      __getStylesForClippedScaleY: function __getStylesForClippedScaleY(style, data, width) {
        // Use clipped image (multi-images on x-axis)
        var imageWidth = qx.util.ResourceManager.getInstance().getImageWidth(data[4]); // Add size and clipping

        style.clip = {
          left: -data[5],
          width: width
        };
        style.width = imageWidth + "px"; // note: height is given by the user
        // Fix user given x-coordinate to include the combined image offset

        if (style.left != null) {
          style.left = parseInt(style.left, 10) + data[5] + "px";
        } else if (style.right != null) {
          style.right = parseInt(style.right, 10) + width - imageWidth - data[5] + "px";
        }

        return style;
      },

      /**
       * Process repeated images.
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param sourceid {String} image resource id
       *
       * @return {Map} image URI and style infos
       */
      __processRepeats: function __processRepeats(style, repeat, sourceid) {
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var clipped = ResourceManager.getCombinedFormat(sourceid);

        var dimension = this.__getDimension(sourceid); // Double axis repeats cannot be clipped


        if (clipped && repeat !== "repeat") {
          // data = [ 8, 5, "png", "qx", "qx/decoration/Modern/arrows-combined.png", -36, 0]
          var data = ResourceManager.getData(sourceid);
          var combinedid = data[4];

          if (clipped == "b64") {
            var uri = ResourceManager.toDataUri(sourceid);
            var offx = 0;
            var offy = 0;
          } else {
            var uri = ResourceManager.toUri(combinedid);
            var offx = data[5];
            var offy = data[6]; // honor padding for combined images

            if (style.paddingTop || style.paddingLeft || style.paddingRight || style.paddingBottom) {
              var top = style.paddingTop || 0;
              var left = style.paddingLeft || 0;
              offx += style.paddingLeft || 0;
              offy += style.paddingTop || 0;
              style.clip = {
                left: left,
                top: top,
                width: dimension.width,
                height: dimension.height
              };
            }
          }

          var bg = qx.bom.element.Background.getStyles(uri, repeat, offx, offy);

          for (var key in bg) {
            style[key] = bg[key];
          }

          if (dimension.width != null && style.width == null && (repeat == "repeat-y" || repeat === "no-repeat")) {
            style.width = dimension.width + "px";
          }

          if (dimension.height != null && style.height == null && (repeat == "repeat-x" || repeat === "no-repeat")) {
            style.height = dimension.height + "px";
          }

          return {
            style: style
          };
        } else {
          // honor padding
          var top = style.paddingTop || 0;
          var left = style.paddingLeft || 0;
          style.backgroundPosition = left + "px " + top + "px";
          {
            if (repeat !== "repeat") {
              this.__checkForPotentialClippedImage(sourceid);
            }
          }

          this.__normalizeWidthHeight(style, dimension.width, dimension.height);

          this.__getStylesForSingleRepeat(style, sourceid, repeat);

          return {
            style: style
          };
        }
      },

      /**
       * Generate all style infos for single repeated images
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param source {String} image source
       */
      __getStylesForSingleRepeat: function __getStylesForSingleRepeat(style, source, repeat) {
        // retrieve the "backgroundPosition" style if available to prevent
        // overwriting with default values
        var top = null;
        var left = null;

        if (style.backgroundPosition) {
          var backgroundPosition = style.backgroundPosition.split(" ");
          left = parseInt(backgroundPosition[0], 10);

          if (isNaN(left)) {
            left = backgroundPosition[0];
          }

          top = parseInt(backgroundPosition[1], 10);

          if (isNaN(top)) {
            top = backgroundPosition[1];
          }
        }

        var bg = qx.bom.element.Background.getStyles(source, repeat, left, top);

        for (var key in bg) {
          style[key] = bg[key];
        } // Reset the AlphaImageLoader filter if applied
        // This prevents IE from setting BOTH CSS filter AND backgroundImage
        // This is only a fallback if the image is not recognized as PNG
        // If it's a Alpha-PNG file it *may* result in display problems


        if (style.filter) {
          style.filter = "";
        }
      },

      /**
       * Output a warning if the image can be clipped.
       *
       * @param source {String} image source
       */
      __checkForPotentialClippedImage: function __checkForPotentialClippedImage(source) {
        if (this.DEBUG && qx.util.ResourceManager.getInstance().has(source) && source.indexOf("qx/icon") == -1) {
          if (!this.__warnings[source]) {
            qx.log.Logger.debug("Potential clipped image candidate: " + source);
            this.__warnings[source] = true;
          }
        }
      }
    }
  });
  qx.bom.element.Decoration.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.Timer": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A generic singleton that fires an "interval" event all 100 milliseconds. It
   * can be used whenever one needs to run code periodically. The main purpose of
   * this class is reduce the number of timers.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.Idle", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],
    type: "singleton",
    construct: function construct() {
      qx.core.Object.constructor.call(this);
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
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Interval for the timer, which periodically fires the "interval" event,
       * in milliseconds.
       */
      timeoutInterval: {
        check: "Number",
        init: 100,
        apply: "_applyTimeoutInterval"
      }
    },
    members: {
      __timer: null,
      // property apply
      _applyTimeoutInterval: function _applyTimeoutInterval(value) {
        if (this.__timer) {
          this.__timer.setInterval(value);
        }
      },

      /**
       * Fires an "interval" event
       */
      _onInterval: function _onInterval() {
        this.fireEvent("interval");
      },

      /**
       * Starts the timer but only if there are listeners for the "interval" event
       */
      __startTimer: function __startTimer() {
        if (!this.__timer && this.hasListener("interval")) {
          var timer = new qx.event.Timer(this.getTimeoutInterval());
          timer.addListener("interval", this._onInterval, this);
          timer.start();
          this.__timer = timer;
        }
      },

      /**
       * Stops the timer but only if there are no listeners for the interval event
       */
      __stopTimer: function __stopTimer() {
        if (this.__timer && !this.hasListener("interval")) {
          this.__timer.stop();

          this.__timer.dispose();

          this.__timer = null;
        }
      },

      /*
       * @Override
       */
      addListener: function addListener(type, listener, self, capture) {
        var result = qx.event.Idle.prototype.addListener.base.call(this, type, listener, self, capture);

        this.__startTimer();

        return result;
      },

      /*
       * @Override
       */
      addListenerOnce: function addListenerOnce(type, listener, self, capture) {
        var result = qx.event.Idle.prototype.addListenerOnce.base.call(this, type, listener, self, capture);

        this.__startTimer();

        return result;
      },

      /*
       * @Override
       */
      removeListener: function removeListener(type, listener, self, capture) {
        var result = qx.event.Idle.prototype.removeListener.base.call(this, type, listener, self, capture);

        this.__stopTimer();

        return result;
      },

      /*
       * @Override
       */
      removeListenerById: function removeListenerById(id) {
        var result = qx.event.Idle.prototype.removeListenerById.base.call(this, id);

        this.__stopTimer();

        return result;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__timer) {
        this.__timer.stop();
      }

      this.__timer = null;
    }
  });
  qx.event.Idle.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.placement.DirectAxis": {
        "construct": true
      },
      "qx.core.Assert": {},
      "qx.util.placement.KeepAlignAxis": {},
      "qx.util.placement.BestFitAxis": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Contains methods to compute a position for any object which should
   * be positioned relative to another object.
   */
  qx.Class.define("qx.util.placement.Placement", {
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__defaultAxis = qx.util.placement.DirectAxis;
    },
    properties: {
      /**
       * The axis object to use for the horizontal placement
       */
      axisX: {
        check: "Class"
      },

      /**
       * The axis object to use for the vertical placement
       */
      axisY: {
        check: "Class"
      },

      /**
       * Specify to which edge of the target object, the object should be attached
       */
      edge: {
        check: ["top", "right", "bottom", "left"],
        init: "top"
      },

      /**
       * Specify with which edge of the target object, the object should be aligned
       */
      align: {
        check: ["top", "right", "bottom", "left", "center", "middle"],
        init: "right"
      }
    },
    statics: {
      __instance: null,

      /**
       * DOM and widget independent method to compute the location
       * of an object to make it relative to any other object.
       *
       * @param size {Map} With the keys <code>width</code> and <code>height</code>
       *   of the object to align
       * @param area {Map} Available area to position the object. Has the keys
       *   <code>width</code> and <code>height</code>. Normally this is the parent
       *   object of the one to align.
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
       *   and <code>bottom</code>.
       * @param offsets {Map} Map with all offsets for each direction.
       *   Comes with the keys <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code>.
       * @param position {String} Alignment of the object on the target, any of
       *   "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right",
       *   "left-top", "left-middle", "left-bottom", "right-top", "right-middle", "right-bottom".
       * @param modeX {String} Horizontal placement mode. Valid values are:
       *   <ul>
       *   <li><code>direct</code>: place the object directly at the given
       *   location.</li>
       *   <li><code>keep-align</code>: if parts of the object is outside of the visible
       *   area it is moved to the best fitting 'edge' and 'alignment' of the target.
       *   It is guaranteed the the new position attaches the object to one of the
       *   target edges and that that is aligned with a target edge.</li>
       *   <li>best-fit</li>: If parts of the object are outside of the visible
       *   area it is moved into the view port ignoring any offset, and position
       *   values.
       *   </ul>
       * @param modeY {String} Vertical placement mode. Accepts the same values as
       *   the 'modeX' argument.
       * @return {Map} A map with the final location stored in the keys
       *   <code>left</code> and <code>top</code>.
       */
      compute: function compute(size, area, target, offsets, position, modeX, modeY) {
        this.__instance = this.__instance || new qx.util.placement.Placement();
        var splitted = position.split("-");
        var edge = splitted[0];
        var align = splitted[1];
        {
          if (align === "center" || align === "middle") {
            var expected = "middle";

            if (edge === "top" || edge === "bottom") {
              expected = "center";
            }

            qx.core.Assert.assertEquals(expected, align, "Please use '" + edge + "-" + expected + "' instead!");
          }
        }

        this.__instance.set({
          axisX: this.__getAxis(modeX),
          axisY: this.__getAxis(modeY),
          edge: edge,
          align: align
        });

        return this.__instance.compute(size, area, target, offsets);
      },
      __direct: null,
      __keepAlign: null,
      __bestFit: null,

      /**
       * Get the axis implementation for the given mode
       *
       * @param mode {String} One of <code>direct</code>, <code>keep-align</code> or
       *   <code>best-fit</code>
       * @return {qx.util.placement.AbstractAxis}
       */
      __getAxis: function __getAxis(mode) {
        switch (mode) {
          case "direct":
            this.__direct = this.__direct || qx.util.placement.DirectAxis;
            return this.__direct;

          case "keep-align":
            this.__keepAlign = this.__keepAlign || qx.util.placement.KeepAlignAxis;
            return this.__keepAlign;

          case "best-fit":
            this.__bestFit = this.__bestFit || qx.util.placement.BestFitAxis;
            return this.__bestFit;

          default:
            throw new Error("Invalid 'mode' argument!'");
        }
      }
    },
    members: {
      __defaultAxis: null,

      /**
       * DOM and widget independent method to compute the location
       * of an object to make it relative to any other object.
       *
       * @param size {Map} With the keys <code>width</code> and <code>height</code>
       *   of the object to align
       * @param area {Map} Available area to position the object. Has the keys
       *   <code>width</code> and <code>height</code>. Normally this is the parent
       *   object of the one to align.
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
       *   and <code>bottom</code>.
       * @param offsets {Map} Map with all offsets for each direction.
       *   Comes with the keys <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code>.
       * @return {Map} A map with the final location stored in the keys
       *   <code>left</code> and <code>top</code>.
       */
      compute: function compute(size, area, target, offsets) {
        {
          this.assertObject(size, "size");
          this.assertNumber(size.width, "size.width");
          this.assertNumber(size.height, "size.height");
          this.assertObject(area, "area");
          this.assertNumber(area.width, "area.width");
          this.assertNumber(area.height, "area.height");
          this.assertObject(target, "target");
          this.assertNumber(target.top, "target.top");
          this.assertNumber(target.right, "target.right");
          this.assertNumber(target.bottom, "target.bottom");
          this.assertNumber(target.left, "target.left");
          this.assertObject(offsets, "offsets");
          this.assertNumber(offsets.top, "offsets.top");
          this.assertNumber(offsets.right, "offsets.right");
          this.assertNumber(offsets.bottom, "offsets.bottom");
          this.assertNumber(offsets.left, "offsets.left");
        }

        var axisX = this.getAxisX() || this.__defaultAxis;

        var left = axisX.computeStart(size.width, {
          start: target.left,
          end: target.right
        }, {
          start: offsets.left,
          end: offsets.right
        }, area.width, this.__getPositionX());

        var axisY = this.getAxisY() || this.__defaultAxis;

        var top = axisY.computeStart(size.height, {
          start: target.top,
          end: target.bottom
        }, {
          start: offsets.top,
          end: offsets.bottom
        }, area.height, this.__getPositionY());
        return {
          left: left,
          top: top
        };
      },

      /**
       * Get the position value for the horizontal axis
       *
       * @return {String} the position
       */
      __getPositionX: function __getPositionX() {
        var edge = this.getEdge();
        var align = this.getAlign();

        if (edge == "left") {
          return "edge-start";
        } else if (edge == "right") {
          return "edge-end";
        } else if (align == "left") {
          return "align-start";
        } else if (align == "center") {
          return "align-center";
        } else if (align == "right") {
          return "align-end";
        }
      },

      /**
       * Get the position value for the vertical axis
       *
       * @return {String} the position
       */
      __getPositionY: function __getPositionY() {
        var edge = this.getEdge();
        var align = this.getAlign();

        if (edge == "top") {
          return "edge-start";
        } else if (edge == "bottom") {
          return "edge-end";
        } else if (align == "top") {
          return "align-start";
        } else if (align == "middle") {
          return "align-center";
        } else if (align == "bottom") {
          return "align-end";
        }
      }
    },
    destruct: function destruct() {
      this._disposeObjects('__defaultAxis');
    }
  });
  qx.util.placement.Placement.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.String": {},
      "qx.theme.manager.Color": {}
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
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * A wrapper for CSS font styles. Fond objects can be applied to instances
   * of {@link qx.html.Element}.
   */
  qx.Class.define("qx.bom.Font", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param size {String?} The font size (Unit: pixel)
     * @param family {String[]?} A sorted list of font families
     */
    construct: function construct(size, family) {
      qx.core.Object.constructor.call(this);
      this.__lookupMap = {
        fontFamily: "",
        fontSize: null,
        fontWeight: null,
        fontStyle: null,
        textDecoration: null,
        lineHeight: null,
        color: null,
        textShadow: null
      };

      if (size !== undefined) {
        this.setSize(size);
      }

      if (family !== undefined) {
        this.setFamily(family);
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Converts a typical CSS font definition string to an font object
       *
       * Example string: <code>bold italic 20px Arial</code>
       *
       * @param str {String} the CSS string
       * @return {qx.bom.Font} the created instance
       */
      fromString: function fromString(str) {
        var font = new qx.bom.Font();
        var parts = str.split(/\s+/);
        var name = [];
        var part;

        for (var i = 0; i < parts.length; i++) {
          switch (part = parts[i]) {
            case "bold":
              font.setBold(true);
              break;

            case "italic":
              font.setItalic(true);
              break;

            case "underline":
              font.setDecoration("underline");
              break;

            default:
              var temp = parseInt(part, 10);

              if (temp == part || qx.lang.String.contains(part, "px")) {
                font.setSize(temp);
              } else {
                name.push(part);
              }

              break;
          }
        }

        if (name.length > 0) {
          font.setFamily(name);
        }

        return font;
      },

      /**
       * Converts a map property definition into a font object.
       *
       * @param config {Map} map of property values
       * @return {qx.bom.Font} the created instance
       */
      fromConfig: function fromConfig(config) {
        var font = new qx.bom.Font();
        font.set(config);
        return font;
      },

      /** @type {Map} Default (empty) CSS styles */
      __defaultStyles: {
        fontFamily: "",
        fontSize: "",
        fontWeight: "",
        fontStyle: "",
        textDecoration: "",
        lineHeight: 1.2,
        color: "",
        textShadow: ""
      },

      /**
       * Returns a map of all properties in empty state.
       *
       * This is useful for resetting previously configured
       * font styles.
       *
       * @return {Map} Default styles
       */
      getDefaultStyles: function getDefaultStyles() {
        return this.__defaultStyles;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The font size (Unit: pixel) */
      size: {
        check: "Integer",
        nullable: true,
        apply: "_applySize"
      },

      /**
       * The line height as scaling factor of the default line height. A value
       * of 1 corresponds to the default line height
       */
      lineHeight: {
        check: "Number",
        nullable: true,
        apply: "_applyLineHeight"
      },

      /**
       * Characters that are used to test if the font has loaded properly. These
       * default to "WEei" in `qx.bom.webfont.Validator` and can be overridden
       * for certain cases like icon fonts that do not provide the predefined
       * characters.
       */
      comparisonString: {
        check: "String",
        init: null,
        nullable: true
      },

      /**
       * Version identifier that is appended to the URL to be loaded. Fonts
       * that are defined thru themes may be managed by the resource manager.
       * In this case updated fonts persist due to aggressive fontface caching
       * of some browsers. To get around this, set the `version` property to
       * the version of your font. It will be appended to the CSS URL and forces
       * the browser to re-validate.
       *
       * The version needs to be URL friendly, so only characters, numbers,
       * dash and dots are allowed here.
       */
      version: {
        check: function check(value) {
          return value === null || typeof value === "string" && /^[a-zA-Z0-9.-]+$/.test(value);
        },
        init: null,
        nullable: true
      },

      /** A sorted list of font families */
      family: {
        check: "Array",
        nullable: true,
        apply: "_applyFamily"
      },

      /** Whether the font is bold */
      bold: {
        check: "Boolean",
        nullable: true,
        apply: "_applyBold"
      },

      /** Whether the font is italic */
      italic: {
        check: "Boolean",
        nullable: true,
        apply: "_applyItalic"
      },

      /** The text decoration for this font */
      decoration: {
        check: ["underline", "line-through", "overline"],
        nullable: true,
        apply: "_applyDecoration"
      },

      /** The text color for this font */
      color: {
        check: "Color",
        nullable: true,
        apply: "_applyColor"
      },

      /** The text shadow for this font */
      textShadow: {
        nullable: true,
        check: "String",
        apply: "_applyTextShadow"
      },

      /** The weight property of the font as opposed to just setting it to 'bold' by setting the bold property to true */
      weight: {
        nullable: true,
        check: "String",
        apply: "_applyWeight"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __lookupMap: null,
      // property apply
      _applySize: function _applySize(value, old) {
        this.__lookupMap.fontSize = value === null ? null : value + "px";
      },
      _applyLineHeight: function _applyLineHeight(value, old) {
        this.__lookupMap.lineHeight = value === null ? null : value;
      },
      // property apply
      _applyFamily: function _applyFamily(value, old) {
        var family = "";

        for (var i = 0, l = value.length; i < l; i++) {
          // in FireFox 2 and WebKit fonts like 'serif' or 'sans-serif' must
          // not be quoted!
          if (value[i].indexOf(" ") > 0) {
            family += '"' + value[i] + '"';
          } else {
            family += value[i];
          }

          if (i !== l - 1) {
            family += ",";
          }
        } // font family is a special case. In order to render the labels correctly
        // we have to return a font family - even if it's an empty string to prevent
        // the browser from applying the element style


        this.__lookupMap.fontFamily = family;
      },
      // property apply
      _applyBold: function _applyBold(value, old) {
        this.__lookupMap.fontWeight = value == null ? null : value ? "bold" : "normal";
      },
      // property apply
      _applyItalic: function _applyItalic(value, old) {
        this.__lookupMap.fontStyle = value == null ? null : value ? "italic" : "normal";
      },
      // property apply
      _applyDecoration: function _applyDecoration(value, old) {
        this.__lookupMap.textDecoration = value == null ? null : value;
      },
      // property apply
      _applyColor: function _applyColor(value, old) {
        this.__lookupMap.color = null;

        if (value) {
          this.__lookupMap.color = qx.theme.manager.Color.getInstance().resolve(value);
        }
      },
      // property apply
      _applyWeight: function _applyWeight(value, old) {
        this.__lookupMap.fontWeight = value;
      },
      // property apply
      _applyTextShadow: function _applyTextShadow(value, old) {
        this.__lookupMap.textShadow = value == null ? null : value;
      },

      /**
       * Get a map of all CSS styles, which will be applied to the widget. Only
       * the styles which are set are returned.
       *
       * @return {Map} Map containing the current styles. The keys are property
       * names which can directly be used with the <code>set</code> method of each
       * widget.
       */
      getStyles: function getStyles() {
        return this.__lookupMap;
      }
    }
  });
  qx.bom.Font.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Font": {
        "require": true
      },
      "qx.bom.webfonts.Manager": {}
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
  
  ************************************************************************ */

  /**
   * Requests web fonts from {@link qx.bom.webfonts.Manager} and fires events
   * when their loading status is known.
   */
  qx.Class.define("qx.bom.webfonts.WebFont", {
    extend: qx.bom.Font,

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the status of a web font has been determined. The event data
       * is a map with the keys "family" (the font-family name) and "valid"
       * (Boolean).
       */
      "changeStatus": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The source of the webfont.
       */
      sources: {
        nullable: true,
        apply: "_applySources"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __families: null,
      // property apply
      _applySources: function _applySources(value, old) {
        var families = [];

        for (var i = 0, l = value.length; i < l; i++) {
          var familyName = this._quoteFontFamily(value[i].family);

          families.push(familyName);
          var sourcesList = value[i];
          sourcesList.comparisonString = this.getComparisonString();
          sourcesList.version = this.getVersion();

          qx.bom.webfonts.Manager.getInstance().require(familyName, sourcesList, this._onWebFontChangeStatus, this);
        }

        this.setFamily(families.concat(this.getFamily()));
      },

      /**
       * Propagates web font status changes
       *
       * @param ev {qx.event.type.Data} "changeStatus"
       */
      _onWebFontChangeStatus: function _onWebFontChangeStatus(ev) {
        var result = ev.getData();
        this.fireDataEvent("changeStatus", result);
        {
          if (result.valid === false) {
            this.warn("WebFont " + result.family + " was not applied, perhaps the source file could not be loaded.");
          }
        }
      },

      /**
       * Makes sure font-family names containing spaces are properly quoted
       *
       * @param familyName {String} A font-family CSS value
       * @return {String} The quoted family name
       */
      _quoteFontFamily: function _quoteFontFamily(familyName) {
        return familyName.replace(/["']/g, "");
      }
    }
  });
  qx.bom.webfonts.WebFont.$$dbClassInfo = $$dbClassInfo;
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
      "qx.dom.Element": {},
      "qx.bom.client.Css": {},
      "qx.bom.client.Html": {},
      "qx.bom.element.Style": {},
      "qx.core.Assert": {},
      "qx.bom.element.Attribute": {},
      "qx.bom.element.Dimension": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.textoverflow": {
          "className": "qx.bom.client.Css"
        },
        "html.xul": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Cross browser abstractions to work with labels.
   */
  qx.Bootstrap.define("qx.bom.Label", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} Contains all supported styles */
      __styles: {
        fontFamily: 1,
        fontSize: 1,
        fontWeight: 1,
        fontStyle: 1,
        lineHeight: 1
      },

      /**
       * Generates the helper DOM element for text measuring
       *
       * @return {Element} Helper DOM element
       */
      __prepareText: function __prepareText() {
        var el = this.__createMeasureElement(false);

        document.body.insertBefore(el, document.body.firstChild);
        return this._textElement = el;
      },

      /**
       * Generates the helper DOM element for HTML measuring
       *
       * @return {Element} Helper DOM element
       */
      __prepareHtml: function __prepareHtml() {
        var el = this.__createMeasureElement(true);

        document.body.insertBefore(el, document.body.firstChild);
        return this._htmlElement = el;
      },

      /**
       * Creates the measure element
       *
       * @param html {Boolean?false} Whether HTML markup should be used.
       * @return {Element} The measure element
       */
      __createMeasureElement: function __createMeasureElement(html) {
        var el = qx.dom.Element.create("div");
        var style = el.style;
        style.width = style.height = "auto";
        style.left = style.top = "-1000px";
        style.visibility = "hidden";
        style.position = "absolute";
        style.overflow = "visible";
        style.display = "block";

        if (html) {
          style.whiteSpace = "normal";
        } else {
          style.whiteSpace = "nowrap";

          if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
            var inner = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label"); // Force style inheritance for font styles to omit usage of
            // CSS "label" selector, See bug #1349 for details.

            var style = inner.style;
            style.padding = "0";
            style.margin = "0";
            style.width = "auto";

            for (var key in this.__styles) {
              style[key] = "inherit";
            }

            el.appendChild(inner);
          }
        }

        return el;
      },

      /**
       * Returns a map of all styles which should be applied as
       * a basic set.
       *
       * @param html {Boolean?false} Whether HTML markup should be used.
       * @return {Map} Initial styles which should be applied to a label element.
       */
      __getStyles: function __getStyles(html) {
        var styles = {};
        styles.overflow = "hidden";

        if (html) {
          styles.whiteSpace = "normal";
        } else if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          styles.display = "block";
        } else {
          styles.whiteSpace = "nowrap";
          styles[qx.core.Environment.get("css.textoverflow")] = "ellipsis";
        }

        return styles;
      },

      /**
       * Creates a label.
       *
       * The default mode is 'text' which means that the overlapping text is cut off
       * using ellipsis automatically. Text wrapping is disabled in this mode
       * as well. Spaces are normalized. Umlauts and other special symbols are only
       * allowed in unicode mode as normal characters.
       *
       * In the HTML mode you can insert any HTML, but loose the capability to cut
       * of overlapping text. Automatic text wrapping is enabled by default.
       *
       * It is not possible to modify the mode afterwards.
       *
       * @param content {String} Content of the label
       * @param html {Boolean?false} Whether HTML markup should be used.
       * @param win {Window?null} Window to create the element for
       * @return {Element} The created iframe node
       */
      create: function create(content, html, win) {
        if (!win) {
          win = window;
        }

        var el = win.document.createElement("div");

        if (html) {
          el.useHtml = true;
        }

        if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          // Gecko as of Firefox 2.x and 3.0 does not support ellipsis
          // for text overflow. We use this feature from XUL instead.
          var xulel = win.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
          var style = xulel.style;
          style.cursor = "inherit";
          style.color = "inherit";
          style.overflow = "hidden";
          style.maxWidth = "100%";
          style.padding = "0";
          style.margin = "0";
          style.width = "auto"; // Force style inheritance for font styles to omit usage of
          // CSS "label" selector, See bug #1349 for details.

          for (var key in this.__styles) {
            xulel.style[key] = "inherit";
          }

          xulel.setAttribute("crop", "end");
          el.appendChild(xulel);
        } else {
          qx.bom.element.Style.setStyles(el, this.__getStyles(html));
        }

        if (content) {
          this.setValue(el, content);
        }

        return el;
      },

      /** Sanitizer function */
      __sanitizer: null,

      /**
       * Sets a function to sanitize values. It will be used by {@link #setValue}.
       * The function to sanitize will get the <code>string</code> value and
       * should return a sanitized / cleared <code>string</code>.
       *
       * @param func {Function | null} Function to sanitize / clean HTML code
       *  from given string parameter
       */
      setSanitizer: function setSanitizer(func) {
        {
          if (func) {
            qx.core.Assert.assertFunction(func);
          }
        }
        qx.bom.Label.__sanitizer = func;
      },

      /**
       * Sets the content of the element.
       *
       * The possibilities of the value depends on the mode
       * defined using {@link #create}.
       *
       * @param element {Element} DOM element to modify.
       * @param value {String} Content to insert.
       */
      setValue: function setValue(element, value) {
        value = value || "";

        if (element.useHtml) {
          if (qx.bom.Label.__sanitizer && typeof qx.bom.Label.__sanitizer === "function") {
            value = qx.bom.Label.__sanitizer(value);
          }

          element.innerHTML = value;
        } else if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          element.firstChild.setAttribute("value", value);
        } else {
          qx.bom.element.Attribute.set(element, "text", value);
        }
      },

      /**
       * Returns the content of the element.
       *
       * @param element {Element} DOM element to query.
       * @return {String} Content stored in the element.
       */
      getValue: function getValue(element) {
        if (element.useHtml) {
          return element.innerHTML;
        } else if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          return element.firstChild.getAttribute("value") || "";
        } else {
          return qx.bom.element.Attribute.get(element, "text");
        }
      },

      /**
       * Returns the preferred dimensions of the given HTML content.
       *
       * @param content {String} The HTML markup to measure
       * @param styles {Map?null} Optional styles to apply
       * @param width {Integer} To support width for height it is possible to limit the width
       * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
       */
      getHtmlSize: function getHtmlSize(content, styles, width) {
        var element = this._htmlElement || this.__prepareHtml(); // apply width


        element.style.width = width != undefined ? width + "px" : "auto"; // insert content

        element.innerHTML = content;
        return this.__measureSize(element, styles);
      },

      /**
       * Returns the preferred dimensions of the given text.
       *
       * @param text {String} The text to measure
       * @param styles {Map} Optional styles to apply
       * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
       */
      getTextSize: function getTextSize(text, styles) {
        var element = this._textElement || this.__prepareText();

        if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          element.firstChild.setAttribute("value", text);
        } else {
          qx.bom.element.Attribute.set(element, "text", text);
        }

        return this.__measureSize(element, styles);
      },

      /**
       * Measure the size of the given element
       *
       * @param element {Element} The element to measure
       * @param styles {Map?null} Optional styles to apply
       * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
       */
      __measureSize: function __measureSize(element, styles) {
        // sync styles
        var keys = this.__styles;

        if (!styles) {
          styles = {};
        }

        for (var key in keys) {
          element.style[key] = styles[key] || "";
        } // detect size


        var size = qx.bom.element.Dimension.getSize(element); // all modern browser are needing one more pixel for width

        size.width++;
        return size;
      }
    }
  });
  qx.bom.Label.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.Stylesheet": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Style": {},
      "qx.bom.Event": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["css.animation", "css.animation.requestframe"],
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
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Responsible for checking all relevant animation properties.
   *
   * Spec: http://www.w3.org/TR/css3-animations/
   *
   * @require(qx.bom.Stylesheet)
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.CssAnimation", {
    statics: {
      /**
       * Main check method which returns an object if CSS animations are
       * supported. This object contains all necessary keys to work with CSS
       * animations.
       * <ul>
       *  <li><code>name</code> The name of the css animation style</li>
       *  <li><code>play-state</code> The name of the play-state style</li>
       *  <li><code>start-event</code> The name of the start event</li>
       *  <li><code>iteration-event</code> The name of the iteration event</li>
       *  <li><code>end-event</code> The name of the end event</li>
       *  <li><code>fill-mode</code> The fill-mode style</li>
       *  <li><code>keyframes</code> The name of the keyframes selector.</li>
       * </ul>
       *
       * @internal
       * @return {Object|null} The described object or null, if animations are
       *   not supported.
       */
      getSupport: function getSupport() {
        var name = qx.bom.client.CssAnimation.getName();

        if (name != null) {
          return {
            "name": name,
            "play-state": qx.bom.client.CssAnimation.getPlayState(),
            "start-event": qx.bom.client.CssAnimation.getAnimationStart(),
            "iteration-event": qx.bom.client.CssAnimation.getAnimationIteration(),
            "end-event": qx.bom.client.CssAnimation.getAnimationEnd(),
            "fill-mode": qx.bom.client.CssAnimation.getFillMode(),
            "keyframes": qx.bom.client.CssAnimation.getKeyFrames()
          };
        }

        return null;
      },

      /**
       * Checks for the 'animation-fill-mode' CSS style.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getFillMode: function getFillMode() {
        return qx.bom.Style.getPropertyName("AnimationFillMode");
      },

      /**
       * Checks for the 'animation-play-state' CSS style.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getPlayState: function getPlayState() {
        return qx.bom.Style.getPropertyName("AnimationPlayState");
      },

      /**
       * Checks for the style name used for animations.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getName: function getName() {
        return qx.bom.Style.getPropertyName("animation");
      },

      /**
       * Checks for the event name of animation start.
       * @internal
       * @return {String} The name of the event.
       */
      getAnimationStart: function getAnimationStart() {
        // special handling for mixed prefixed / unprefixed implementations
        if (qx.bom.Event.supportsEvent(window, "webkitanimationstart")) {
          return "webkitAnimationStart";
        }

        var mapping = {
          "msAnimation": "MSAnimationStart",
          "WebkitAnimation": "webkitAnimationStart",
          "MozAnimation": "animationstart",
          "OAnimation": "oAnimationStart",
          "animation": "animationstart"
        };
        return mapping[this.getName()];
      },

      /**
       * Checks for the event name of animation end.
       * @internal
       * @return {String} The name of the event.
       */
      getAnimationIteration: function getAnimationIteration() {
        // special handling for mixed prefixed / unprefixed implementations
        if (qx.bom.Event.supportsEvent(window, "webkitanimationiteration")) {
          return "webkitAnimationIteration";
        }

        var mapping = {
          "msAnimation": "MSAnimationIteration",
          "WebkitAnimation": "webkitAnimationIteration",
          "MozAnimation": "animationiteration",
          "OAnimation": "oAnimationIteration",
          "animation": "animationiteration"
        };
        return mapping[this.getName()];
      },

      /**
       * Checks for the event name of animation end.
       * @internal
       * @return {String} The name of the event.
       */
      getAnimationEnd: function getAnimationEnd() {
        // special handling for mixed prefixed / unprefixed implementations
        if (qx.bom.Event.supportsEvent(window, "webkitanimationend")) {
          return "webkitAnimationEnd";
        }

        var mapping = {
          "msAnimation": "MSAnimationEnd",
          "WebkitAnimation": "webkitAnimationEnd",
          "MozAnimation": "animationend",
          "OAnimation": "oAnimationEnd",
          "animation": "animationend"
        };
        return mapping[this.getName()];
      },

      /**
       * Checks what selector should be used to add keyframes to stylesheets.
       * @internal
       * @return {String|null} The name of the selector or null, if the selector
       *   is not supported.
       */
      getKeyFrames: function getKeyFrames() {
        var prefixes = qx.bom.Style.VENDOR_PREFIXES;
        var keyFrames = [];

        for (var i = 0; i < prefixes.length; i++) {
          var key = "@" + qx.bom.Style.getCssName(prefixes[i]) + "-keyframes";
          keyFrames.push(key);
        }

        ;
        keyFrames.unshift("@keyframes");
        var sheet = qx.bom.Stylesheet.createElement();

        for (var i = 0; i < keyFrames.length; i++) {
          try {
            qx.bom.Stylesheet.addRule(sheet, keyFrames[i] + " name", "");
            return keyFrames[i];
          } catch (e) {}
        }

        ;
        return null;
      },

      /**
       * Checks for the requestAnimationFrame method and return the prefixed name.
       * @internal
       * @return {String|null} A string the method name or null, if the method
       *   is not supported.
       */
      getRequestAnimationFrame: function getRequestAnimationFrame() {
        var choices = ["requestAnimationFrame", "msRequestAnimationFrame", "webkitRequestAnimationFrame", "mozRequestAnimationFrame", "oRequestAnimationFrame" // currently unspecified, so we guess the name!
        ];

        for (var i = 0; i < choices.length; i++) {
          if (window[choices[i]] != undefined) {
            return choices[i];
          }
        }

        ;
        return null;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("css.animation", statics.getSupport);
      qx.core.Environment.add("css.animation.requestframe", statics.getRequestAnimationFrame);
    }
  });
  qx.bom.client.CssAnimation.$$dbClassInfo = $$dbClassInfo;
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

//# sourceMappingURL=part-boot-bundle-5.js.map
