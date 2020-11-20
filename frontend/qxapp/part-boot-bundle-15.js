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
      "qx.lang.Type": {
        "construct": true
      },
      "qx.lang.Array": {
        "construct": true
      },
      "qx.Promise": {},
      "qx.util.ResourceManager": {},
      "qx.bom.request.Script": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2016 Visionet GmbH, http://www.visionet.de
       2016 OETIKER+PARTNER AG, https://www.oetiker.ch
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Dietrich Streifert (level420)
       * Tobias Oetiker (oetiker)
  
  ************************************************************************ */

  /**
   * Dynamically load non qx scripts. This class is aware of all scripts that have
   * been loaded using its instances, so if two instances load jquery, it will only
   * be loaded once, and the second instance will wait for the jquery to be loaded
   * before continuing to load additional scripts.
   *
   * Usage example:
   *
   * <pre>
   *  ... assets ...
   * /**
   *  * @asset(myapp/jquery/*)
   *  * @asset(myapp/highcharts/*)
   *  *
   *  * @ignore(jQuery.*)
   *  * @ignore(Highcharts.*)
   *  ...
   *
   *
   *    // in debug mode load the uncompressed unobfuscated scripts
   *    var src = '';
   *    var min = '.min';
   *    if (qx.core.Environment.get("qx.debug")) {
   *      src = '.src';
   *      min = '';
   *    }
   *
   *    // initialize the script loading
   *    var dynLoader = new qx.util.DynamicScriptLoader([
   *        "myapp/jquery/jquery"+min+".js",
   *        "myapp/highcharts/highcharts"+src+".js",
   *        "myapp/highcharts/highcharts-more"+src+".js",
   *        "myapp/highcharts/highcharts-modifications.js"
   *    ]);
   *
   *
   *    dynLoader.addListenerOnce('ready',function(e){
   *      console.log("all scripts have been loaded!");
   *    });
   *
   *    dynLoader.addListener('failed',function(e){
   *      var data = e.getData();
   *      console.log("failed to load "+data.script);
   *    });
   *
   *    dynLoader.start();
   *    
   * </pre>
   */
  qx.Class.define("qx.util.DynamicScriptLoader", {
    extend: qx.core.Object,

    /**
     * Create a loader for the given scripts.
     *
     * @param scriptArr {Array|String} the uri name(s) of the script(s) to load 
     */
    construct: function construct(scriptArr) {
      qx.core.Object.constructor.call(this);
      this.__started = false;
      this.__QUEUE = qx.lang.Type.isString(scriptArr) ? [scriptArr] : qx.lang.Array.clone(scriptArr);
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * fired when a script is loaded successfully. The data contains 'script' and 'status' keys.
       */
      loaded: 'qx.event.type.Data',

      /**
       * fired when a specific script fails loading.  The data contains 'script' and 'status' keys.
       */
      failed: 'qx.event.type.Data',

      /**
       * fired when all given scripts are loaded, each time loadScriptsDynamic is called.
       */
      ready: 'qx.event.type.Event'
    },
    statics: {
      /**
       * Map of scripts being added at the present time. Key is script name; value is instance of this class which
       * is loading it.
       */
      __IN_PROGRESS: {},

      /**
       * Map of scripts that have fully loaded. Key is script name; value is true
       */
      __LOADED: {}
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Array of the scripts to be loaded
       */
      __QUEUE: null,

      /**
       * True if start has been called.
       */
      __started: null,

      /**
       * Start loading scripts. This may only be called once!
       * @return {Promise?} a promise which will be resolved after load of all scripts if promise support is enabled; nothing (undefined) if promises are not enabled.
       */
      start: function start() {
        return new qx.Promise(function (resolve, reject) {
          this.addListenerOnce("ready", resolve, this);
          this.addListenerOnce("failed", function (e) {
            reject(new Error(e.getData()));
          }, this);

          if (this.isDisposed()) {
            reject(new Error('disposed'));
          }

          if (this.__started) {
            reject(new Error('you can only call start once per instance'));
          }

          this.__started = true;

          this.__loadScripts();
        }, this);
      },

      /**
       * Chain loading scripts.
       *
       * Recursively called until the array of scripts is consumed
       *
       */
      __loadScripts: function __loadScripts() {
        var DynamicScriptLoader = qx.util.DynamicScriptLoader;
        var script;
        var dynLoader;
        var id1, id2;
        var uri;
        var loader;
        script = this.__QUEUE.shift();

        if (!script) {
          this.fireEvent("ready");
          return;
        }

        if (DynamicScriptLoader.__LOADED[script]) {
          this.fireDataEvent('loaded', {
            script: script,
            status: 'preloaded'
          });

          this.__loadScripts();

          return;
        }

        dynLoader = DynamicScriptLoader.__IN_PROGRESS[script];

        if (dynLoader) {
          id1 = dynLoader.addListener('loaded', function (e) {
            if (this.isDisposed()) {
              return;
            }

            var data = e.getData();

            if (data.script === script) {
              dynLoader.removeListenerById(id2);
              dynLoader.removeListenerById(id1);
              this.fireDataEvent('loaded', data);

              this.__loadScripts();
            }
          }, this);
          id2 = dynLoader.addListener('failed', function (e) {
            if (this.isDisposed()) {
              return;
            }

            var data = e.getData();
            dynLoader.removeListenerById(id1);
            dynLoader.removeListenerById(id2);
            this.fireDataEvent('failed', {
              script: script,
              status: 'loading of ' + data.script + ' failed while waiting for ' + script
            });
          }, this);
          return;
        }

        uri = qx.util.ResourceManager.getInstance().toUri(script);
        loader = new qx.bom.request.Script();
        loader.on("load", function (request) {
          if (this.isDisposed()) {
            return;
          }

          DynamicScriptLoader.__LOADED[script] = true;
          delete DynamicScriptLoader.__IN_PROGRESS[script];
          this.fireDataEvent('loaded', {
            script: script,
            status: request.status
          });

          this.__loadScripts();
        }, this);

        var onError = function onError(request) {
          if (this.isDisposed()) {
            return;
          }

          delete DynamicScriptLoader.__IN_PROGRESS[script];
          this.fireDataEvent('failed', {
            script: script,
            status: request.status
          });
        };

        loader.on("error", onError, this);
        loader.on("timeout", onError, this); // this.debug("Loading " + script + " started");

        loader.open("GET", uri);
        DynamicScriptLoader.__IN_PROGRESS[script] = this;
        loader.send();
      }
    },
    destruct: function destruct() {
      var DynamicScriptLoader = qx.util.DynamicScriptLoader;

      for (var key in DynamicScriptLoader.__IN_PROGRESS) {
        if (DynamicScriptLoader.__IN_PROGRESS[key] === this) {
          delete DynamicScriptLoader.__IN_PROGRESS[key];
        }
      }

      this.__QUEUE = undefined;
    }
  });
  qx.util.DynamicScriptLoader.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.Registration": {
        "construct": true
      },
      "qx.bom.Element": {
        "construct": true
      },
      "qx.ui.popup.Popup": {},
      "qx.lang.Array": {},
      "qx.ui.core.Widget": {}
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
   * This singleton is used to manager multiple instances of popups and their
   * state.
   */
  qx.Class.define("qx.ui.popup.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create data structure, use an array because order matters [BUG #4323]

      this.__objects = []; // Register pointerdown handler

      qx.event.Registration.addListener(document.documentElement, "pointerdown", this.__onPointerDown, this, true); // Hide all popups on window blur

      qx.bom.Element.addListener(window, "blur", this.hideAll, this);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __objects: null,

      /**
       * Registers a visible popup.
       *
       * @param obj {qx.ui.popup.Popup} The popup to register
       */
      add: function add(obj) {
        {
          if (!(obj instanceof qx.ui.popup.Popup)) {
            throw new Error("Object is no popup: " + obj);
          }
        }

        this.__objects.push(obj);

        this.__updateIndexes();
      },

      /**
       * Removes a popup from the registry
       *
       * @param obj {qx.ui.popup.Popup} The popup which was excluded
       */
      remove: function remove(obj) {
        {
          if (!(obj instanceof qx.ui.popup.Popup)) {
            throw new Error("Object is no popup: " + obj);
          }
        }
        qx.lang.Array.remove(this.__objects, obj);

        this.__updateIndexes();
      },

      /**
       * Excludes all currently open popups,
       * except those with {@link qx.ui.popup.Popup#autoHide} set to false.
       */
      hideAll: function hideAll() {
        var l = this.__objects.length,
            current = {};

        while (l--) {
          current = this.__objects[l];

          if (current.getAutoHide()) {
            current.exclude();
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Updates the zIndex of all registered items to push
       * newly added ones on top of existing ones
       *
       */
      __updateIndexes: function __updateIndexes() {
        var min = 1e7;

        for (var i = 0; i < this.__objects.length; i++) {
          this.__objects[i].setZIndex(min++);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for pointer down events
       *
       * @param e {qx.event.type.Pointer} Pointer event object
       */
      __onPointerDown: function __onPointerDown(e) {
        // Get the corresponding widget of the target since we are dealing with
        // DOM elements here. This is necessary because we have to be aware of
        // Inline applications which are not covering the whole document and
        // therefore are not able to get all pointer events when only the
        // application root is monitored.
        var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());
        var reg = this.__objects;

        for (var i = 0; i < reg.length; i++) {
          var obj = reg[i];

          if (!obj.getAutoHide() || target == obj || qx.ui.core.Widget.contains(obj, target)) {
            continue;
          }

          obj.exclude();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      qx.event.Registration.removeListener(document.documentElement, "pointerdown", this.__onPointerDown, this, true);

      this._disposeArray("__objects");
    }
  });
  qx.ui.popup.Manager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.Atom": {
        "construct": true
      },
      "qx.ui.basic.Label": {},
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A multi-purpose widget, which combines a label with an icon.
   *
   * The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text
   * combination in different ways.
   *
   * This is useful for all types of buttons, tooltips, ...
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var atom = new qx.ui.basic.Atom("Icon Right", "icon/32/actions/go-next.png");
   *   this.getRoot().add(atom);
   * </pre>
   *
   * This example creates an atom with the label "Icon Right" and an icon.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/atom.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   *
   * @childControl label {qx.ui.basic.Label} label part of the atom
   * @childControl icon {qx.ui.basic.Image} icon part of the atom
   */
  qx.Class.define("qx.ui.basic.Atom", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     */
    construct: function construct(label, icon) {
      {
        this.assertArgumentsCount(arguments, 0, 2);
      }
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Atom());

      if (label != null) {
        this.setLabel(label);
      }

      if (icon !== undefined) {
        this.setIcon(icon);
      }
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
        init: "atom"
      },

      /** The label/caption/text of the qx.ui.basic.Atom instance */
      label: {
        apply: "_applyLabel",
        nullable: true,
        check: "String",
        event: "changeLabel"
      },

      /**
       * Switches between rich HTML and text content. The text mode (<code>false</code>) supports
       * advanced features like ellipsis when the available space is not
       * enough. HTML mode (<code>true</code>) supports multi-line content and all the
       * markup features of HTML content.
       */
      rich: {
        check: "Boolean",
        init: false,
        apply: "_applyRich"
      },

      /** Any URI String supported by qx.ui.basic.Image to display an icon */
      icon: {
        check: "String",
        apply: "_applyIcon",
        nullable: true,
        themeable: true,
        event: "changeIcon"
      },

      /**
       * The space between the icon and the label
       */
      gap: {
        check: "Integer",
        nullable: false,
        event: "changeGap",
        apply: "_applyGap",
        themeable: true,
        init: 4
      },

      /**
       * Configure the visibility of the sub elements/widgets.
       * Possible values: both, label, icon
       */
      show: {
        init: "both",
        check: ["both", "label", "icon"],
        themeable: true,
        inheritable: true,
        apply: "_applyShow",
        event: "changeShow"
      },

      /**
       * The position of the icon in relation to the text.
       * Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
       */
      iconPosition: {
        init: "left",
        check: ["top", "right", "bottom", "left", "top-left", "bottom-left", "top-right", "bottom-right"],
        themeable: true,
        apply: "_applyIconPosition"
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
        init: false,
        check: "Boolean",
        themeable: true,
        apply: "_applyCenter"
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
          case "label":
            control = new qx.ui.basic.Label(this.getLabel());
            control.setAnonymous(true);
            control.setRich(this.getRich());
            control.setSelectable(this.getSelectable());

            this._add(control);

            if (this.getLabel() == null || this.getShow() === "icon") {
              control.exclude();
            }

            break;

          case "icon":
            control = new qx.ui.basic.Image(this.getIcon());
            control.setAnonymous(true);

            this._addAt(control, 0);

            if (this.getIcon() == null || this.getShow() === "label") {
              control.exclude();
            }

            break;
        }

        return control || qx.ui.basic.Atom.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        hovered: true
      },

      /**
       * Updates the visibility of the label
       */
      _handleLabel: function _handleLabel() {
        if (this.getLabel() == null || this.getShow() === "icon") {
          this._excludeChildControl("label");
        } else {
          this._showChildControl("label");
        }
      },

      /**
       * Updates the visibility of the icon
       */
      _handleIcon: function _handleIcon() {
        if (this.getIcon() == null || this.getShow() === "label") {
          this._excludeChildControl("icon");
        } else {
          this._showChildControl("icon");
        }
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        var label = this.getChildControl("label", true);

        if (label) {
          label.setValue(value);
        }

        this._handleLabel();
      },
      // property apply
      _applyRich: function _applyRich(value, old) {
        var label = this.getChildControl("label", true);

        if (label) {
          label.setRich(value);
        }
      },
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        var icon = this.getChildControl("icon", true);

        if (icon) {
          icon.setSource(value);
        }

        this._handleIcon();
      },
      // property apply
      _applyGap: function _applyGap(value, old) {
        this._getLayout().setGap(value);
      },
      // property apply
      _applyShow: function _applyShow(value, old) {
        this._handleLabel();

        this._handleIcon();
      },
      // property apply
      _applyIconPosition: function _applyIconPosition(value, old) {
        this._getLayout().setIconPosition(value);
      },
      // property apply
      _applyCenter: function _applyCenter(value, old) {
        this._getLayout().setCenter(value);
      },
      // overridden
      _applySelectable: function _applySelectable(value, old) {
        qx.ui.basic.Atom.prototype._applySelectable.base.call(this, value, old);

        var label = this.getChildControl("label", true);

        if (label) {
          this.getChildControl("label").setSelectable(value);
        }
      }
    }
  });
  qx.ui.basic.Atom.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Type": {}
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
   * Static helpers for parsing and modifying URIs.
   */
  qx.Bootstrap.define("qx.util.Uri", {
    statics: {
      /**
       * Split URL
       *
       * Code taken from:
       *   parseUri 1.2.2
       *   (c) Steven Levithan <stevenlevithan.com>
       *   MIT License
       *
       *
       * @param str {String} String to parse as URI
       * @param strict {Boolean} Whether to parse strictly by the rules
       * @return {Object} Map with parts of URI as properties
       */
      parseUri: function parseUri(str, strict) {
        var options = {
          key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
          q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
          },
          parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@?]*)(?::([^:@?]*))?)?@)?((?:\[[0-9A-Fa-f:]+\])|(?:[^:\/?#\[\]]*))(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@?]+:[^:@?\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@?]*)(?::([^:@?]*))?)?@)?((?:\[[0-9A-Fa-f:]+\])|(?:[^:\/?#\[\]]*))(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
          }
        };
        var o = options,
            m = options.parser[strict ? "strict" : "loose"].exec(str),
            uri = {},
            i = 14;

        while (i--) {
          uri[o.key[i]] = m[i] || "";
        }

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
          if ($1) {
            uri[o.q.name][$1] = $2;
          }
        });
        return uri;
      },

      /**
       * Append string to query part of URL. Respects existing query.
       *
       * @param url {String} URL to append string to.
       * @param params {String} Parameters to append to URL.
       * @return {String} URL with string appended in query part.
       */
      appendParamsToUrl: function appendParamsToUrl(url, params) {
        if (params === undefined) {
          return url;
        }

        {
          if (!(qx.lang.Type.isString(params) || qx.lang.Type.isObject(params))) {
            throw new Error("params must be either string or object");
          }
        }

        if (qx.lang.Type.isObject(params)) {
          params = qx.util.Uri.toParameter(params);
        }

        if (!params) {
          return url;
        }

        return url += /\?/.test(url) ? "&" + params : "?" + params;
      },

      /**
       * Serializes an object to URI parameters (also known as query string).
       *
       * Escapes characters that have a special meaning in URIs as well as
       * umlauts. Uses the global function encodeURIComponent, see
       * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
       *
       * Note: For URI parameters that are to be sent as
       * application/x-www-form-urlencoded (POST), spaces should be encoded
       * with "+".
       *
       * @param obj {Object}   Object to serialize.
       * @param post {Boolean} Whether spaces should be encoded with "+".
       * @return {String}      Serialized object. Safe to append to URIs or send as
       *                       URL encoded string.
       */
      toParameter: function toParameter(obj, post) {
        var key,
            parts = [];

        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            var value = obj[key];

            if (value instanceof Array) {
              for (var i = 0; i < value.length; i++) {
                this.__toParameterPair(key, value[i], parts, post);
              }
            } else {
              this.__toParameterPair(key, value, parts, post);
            }
          }
        }

        return parts.join("&");
      },

      /**
       * Encodes key/value to URI safe string and pushes to given array.
       *
       * @param key {String} Key.
       * @param value {String} Value.
       * @param parts {Array} Array to push to.
       * @param post {Boolean} Whether spaces should be encoded with "+".
       */
      __toParameterPair: function __toParameterPair(key, value, parts, post) {
        var encode = window.encodeURIComponent;

        if (post) {
          parts.push(encode(key).replace(/%20/g, "+") + "=" + encode(value).replace(/%20/g, "+"));
        } else {
          parts.push(encode(key) + "=" + encode(value));
        }
      },

      /**
       * Takes a relative URI and returns an absolute one.
       *
       * @param uri {String} relative URI
       * @return {String} absolute URI
       */
      getAbsolute: function getAbsolute(uri) {
        var div = document.createElement("div");
        div.innerHTML = '<a href="' + uri + '">0</a>';
        return div.firstChild.href;
      }
    }
  });
  qx.util.Uri.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.CssAnimation": {
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.bom.Event": {},
      "qx.bom.element.Style": {},
      "qx.log.Logger": {},
      "qx.lang.String": {},
      "qx.bom.element.AnimationHandle": {},
      "qx.bom.element.Transform": {},
      "qx.bom.Style": {},
      "qx.bom.client.OperatingSystem": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation": {
          "load": true,
          "className": "qx.bom.client.CssAnimation"
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
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class is responsible for applying CSS3 animations to plain DOM elements.
   *
   * The implementation is mostly a cross-browser wrapper for applying the
   * animations, including transforms. If the browser does not support
   * CSS animations, but you have set a keep frame, the keep frame will be applied
   * immediately, thus making the animations optional.
   *
   * The API aligns closely to the spec wherever possible.
   *
   * http://www.w3.org/TR/css3-animations/
   *
   * {@link qx.bom.element.Animation} is the class, which takes care of the
   * feature detection for CSS animations and decides which implementation
   * (CSS or JavaScript) should be used. Most likely, this implementation should
   * be the one to use.
   */
  qx.Bootstrap.define("qx.bom.element.AnimationCss", {
    statics: {
      // initialization
      __sheet: null,
      __rulePrefix: "Anni",
      __id: 0,

      /** Static map of rules */
      __rules: {},

      /** The used keys for transforms. */
      __transitionKeys: {
        "scale": true,
        "rotate": true,
        "skew": true,
        "translate": true
      },

      /** Map of cross browser CSS keys. */
      __cssAnimationKeys: qx.core.Environment.get("css.animation"),

      /**
       * This is the main function to start the animation in reverse mode.
       * For further details, take a look at the documentation of the wrapper
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      animateReverse: function animateReverse(el, desc, duration) {
        return this._animate(el, desc, duration, true);
      },

      /**
       * This is the main function to start the animation. For further details,
       * take a look at the documentation of the wrapper
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      animate: function animate(el, desc, duration) {
        return this._animate(el, desc, duration, false);
      },

      /**
       * Internal method to start an animation either reverse or not.
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @param reverse {Boolean} <code>true</code>, if the animation should be
       *   reversed.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      _animate: function _animate(el, desc, duration, reverse) {
        this.__normalizeDesc(desc); // debug validation


        {
          this.__validateDesc(desc);
        } // reverse the keep property if the animation is reverse as well

        var keep = desc.keep;

        if (keep != null && (reverse || desc.alternate && desc.repeat % 2 == 0)) {
          keep = 100 - keep;
        }

        if (!this.__sheet) {
          this.__sheet = qx.bom.Stylesheet.createElement();
        }

        var keyFrames = desc.keyFrames;

        if (duration == undefined) {
          duration = desc.duration;
        } // if animations are supported


        if (this.__cssAnimationKeys != null) {
          var name = this.__addKeyFrames(keyFrames, reverse);

          var style = name + " " + duration + "ms " + desc.timing + " " + (desc.delay ? desc.delay + "ms " : "") + desc.repeat + " " + (desc.alternate ? "alternate" : "");
          qx.bom.Event.addNativeListener(el, this.__cssAnimationKeys["start-event"], this.__onAnimationStart);
          qx.bom.Event.addNativeListener(el, this.__cssAnimationKeys["iteration-event"], this.__onAnimationIteration);
          qx.bom.Event.addNativeListener(el, this.__cssAnimationKeys["end-event"], this.__onAnimationEnd);
          {
            if (qx.bom.element.Style.get(el, "display") == "none") {
              qx.log.Logger.warn(el, "Some browsers will not animate elements with display==none");
            }
          }
          el.style[qx.lang.String.camelCase(this.__cssAnimationKeys["name"])] = style; // use the fill mode property if available and suitable

          if (keep && keep == 100 && this.__cssAnimationKeys["fill-mode"]) {
            el.style[this.__cssAnimationKeys["fill-mode"]] = "forwards";
          }
        }

        var animation = new qx.bom.element.AnimationHandle();
        animation.desc = desc;
        animation.el = el;
        animation.keep = keep;
        el.$$animation = animation; // additional transform keys

        if (desc.origin != null) {
          qx.bom.element.Transform.setOrigin(el, desc.origin);
        } // fallback for browsers not supporting animations


        if (this.__cssAnimationKeys == null) {
          window.setTimeout(function () {
            qx.bom.element.AnimationCss.__onAnimationEnd({
              target: el
            });
          }, 0);
        }

        return animation;
      },

      /**
       * Handler for the animation start.
       * @param e {Event} The native event from the browser.
       */
      __onAnimationStart: function __onAnimationStart(e) {
        if (e.target.$$animation) {
          e.target.$$animation.emit("start", e.target);
        }
      },

      /**
       * Handler for the animation iteration.
       * @param e {Event} The native event from the browser.
       */
      __onAnimationIteration: function __onAnimationIteration(e) {
        // It could happen that an animation end event is fired before an
        // animation iteration appears [BUG #6928]
        if (e.target != null && e.target.$$animation != null) {
          e.target.$$animation.emit("iteration", e.target);
        }
      },

      /**
       * Handler for the animation end.
       * @param e {Event} The native event from the browser.
       */
      __onAnimationEnd: function __onAnimationEnd(e) {
        var el = e.target;
        var animation = el.$$animation; // ignore events when already cleaned up

        if (!animation) {
          return;
        }

        var desc = animation.desc;

        if (qx.bom.element.AnimationCss.__cssAnimationKeys != null) {
          // reset the styling
          var key = qx.lang.String.camelCase(qx.bom.element.AnimationCss.__cssAnimationKeys["name"]);
          el.style[key] = "";
          qx.bom.Event.removeNativeListener(el, qx.bom.element.AnimationCss.__cssAnimationKeys["name"], qx.bom.element.AnimationCss.__onAnimationEnd);
        }

        if (desc.origin != null) {
          qx.bom.element.Transform.setOrigin(el, "");
        }

        qx.bom.element.AnimationCss.__keepFrame(el, desc.keyFrames[animation.keep]);

        el.$$animation = null;
        animation.el = null;
        animation.ended = true;
        animation.emit("end", el);
      },

      /**
       * Helper method which takes an element and a key frame description and
       * applies the properties defined in the given frame to the element. This
       * method is used to keep the state of the animation.
       * @param el {Element} The element to apply the frame to.
       * @param endFrame {Map} The description of the end frame, which is basically
       *   a map containing CSS properties and values including transforms.
       */
      __keepFrame: function __keepFrame(el, endFrame) {
        // keep the element at this animation step
        var transforms;

        for (var style in endFrame) {
          if (style in qx.bom.element.AnimationCss.__transitionKeys) {
            if (!transforms) {
              transforms = {};
            }

            transforms[style] = endFrame[style];
          } else {
            el.style[qx.lang.String.camelCase(style)] = endFrame[style];
          }
        } // transform keeping


        if (transforms) {
          qx.bom.element.Transform.transform(el, transforms);
        }
      },

      /**
       * Preprocessing of the description to make sure every necessary key is
       * set to its default.
       * @param desc {Map} The description of the animation.
       */
      __normalizeDesc: function __normalizeDesc(desc) {
        if (!desc.hasOwnProperty("alternate")) {
          desc.alternate = false;
        }

        if (!desc.hasOwnProperty("keep")) {
          desc.keep = null;
        }

        if (!desc.hasOwnProperty("repeat")) {
          desc.repeat = 1;
        }

        if (!desc.hasOwnProperty("timing")) {
          desc.timing = "linear";
        }

        if (!desc.hasOwnProperty("origin")) {
          desc.origin = null;
        }
      },

      /**
       * Debugging helper to validate the description.
       * @signature function(desc)
       * @param desc {Map} The description of the animation.
       */
      __validateDesc: function __validateDesc(desc) {
        var possibleKeys = ["origin", "duration", "keep", "keyFrames", "delay", "repeat", "timing", "alternate"]; // check for unknown keys

        for (var name in desc) {
          if (!(possibleKeys.indexOf(name) != -1)) {
            qx.Bootstrap.warn("Unknown key '" + name + "' in the animation description.");
          }
        }

        ;

        if (desc.keyFrames == null) {
          qx.Bootstrap.warn("No 'keyFrames' given > 0");
        } else {
          // check the key frames
          for (var pos in desc.keyFrames) {
            if (pos < 0 || pos > 100) {
              qx.Bootstrap.warn("Keyframe position needs to be between 0 and 100");
            }
          }
        }
      },

      /**
       * Helper to add the given frames to an internal CSS stylesheet. It parses
       * the description and adds the key frames to the sheet.
       * @param frames {Map} A map of key frames that describe the animation.
       * @param reverse {Boolean} <code>true</code>, if the key frames should
       *   be added in reverse order.
       * @return {String} The generated name of the keyframes rule.
       */
      __addKeyFrames: function __addKeyFrames(frames, reverse) {
        var rule = ""; // for each key frame

        for (var position in frames) {
          rule += (reverse ? -(position - 100) : position) + "% {";
          var frame = frames[position];
          var transforms; // each style

          for (var style in frame) {
            if (style in this.__transitionKeys) {
              if (!transforms) {
                transforms = {};
              }

              transforms[style] = frame[style];
            } else {
              var propName = qx.bom.Style.getPropertyName(style);
              var prefixed = propName !== null ? qx.bom.Style.getCssName(propName) : "";
              rule += (prefixed || style) + ":" + frame[style] + ";";
            }
          } // transform handling


          if (transforms) {
            rule += qx.bom.element.Transform.getCss(transforms);
          }

          rule += "} ";
        } // cached shorthand


        if (this.__rules[rule]) {
          return this.__rules[rule];
        }

        var name = this.__rulePrefix + this.__id++;
        var selector = this.__cssAnimationKeys["keyframes"] + " " + name;
        qx.bom.Stylesheet.addRule(this.__sheet, selector, rule);
        this.__rules[rule] = name;
        return name;
      },

      /**
       * Internal helper to reset the cache.
       */
      __clearCache: function __clearCache() {
        this.__id = 0;

        if (this.__sheet) {
          this.__sheet.ownerNode.remove();

          this.__sheet = null;
          this.__rules = {};
        }
      }
    },
    defer: function defer(statics) {
      // iOS 8 seems to stumble over the old sheet object on tab
      // changes or leaving the browser [BUG #8986]
      if (qx.core.Environment.get("os.name") === "ios" && parseInt(qx.core.Environment.get("os.version")) >= 8) {
        document.addEventListener("visibilitychange", function () {
          if (!document.hidden) {
            statics.__clearCache();
          }
        }, false);
      }
    }
  });
  qx.bom.element.AnimationCss.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Object": {},
      "qx.bom.element.AnimationHandle": {},
      "qx.bom.Style": {},
      "qx.bom.element.Transform": {},
      "qx.util.ColorUtil": {},
      "qx.bom.AnimationFrame": {},
      "qx.lang.String": {}
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
   * This class offers the same API as the CSS3 animation layer in
   * {@link qx.bom.element.AnimationCss} but uses JavaScript to fake the behavior.
   *
   * {@link qx.bom.element.Animation} is the class, which takes care of the
   * feature detection for CSS animations and decides which implementation
   * (CSS or JavaScript) should be used. Most likely, this implementation should
   * be the one to use.
   *
   * @ignore(qx.bom.element.Style.*)
   * @use(qx.bom.element.AnimationJs#play)
   */
  qx.Bootstrap.define("qx.bom.element.AnimationJs", {
    statics: {
      /**
       * The maximal time a frame should take.
       */
      __maxStepTime: 30,

      /**
       * The supported CSS units.
       */
      __units: ["%", "in", "cm", "mm", "em", "ex", "pt", "pc", "px"],

      /** The used keys for transforms. */
      __transitionKeys: {
        "scale": true,
        "rotate": true,
        "skew": true,
        "translate": true
      },

      /**
       * This is the main function to start the animation. For further details,
       * take a look at the documentation of the wrapper
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      animate: function animate(el, desc, duration) {
        return this._animate(el, desc, duration, false);
      },

      /**
       * This is the main function to start the animation in reversed mode.
       * For further details, take a look at the documentation of the wrapper
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      animateReverse: function animateReverse(el, desc, duration) {
        return this._animate(el, desc, duration, true);
      },

      /**
       * Helper to start the animation, either in reversed order or not.
       *
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @param reverse {Boolean} <code>true</code>, if the animation should be
       *   reversed.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      _animate: function _animate(el, desc, duration, reverse) {
        // stop if an animation is already running
        if (el.$$animation) {
          return el.$$animation;
        }

        desc = qx.lang.Object.clone(desc, true);

        if (duration == undefined) {
          duration = desc.duration;
        }

        var keyFrames = desc.keyFrames;

        var keys = this.__getOrderedKeys(keyFrames);

        var stepTime = this.__getStepTime(duration, keys);

        var steps = parseInt(duration / stepTime, 10);

        this.__normalizeKeyFrames(keyFrames, el);

        var delta = this.__calculateDelta(steps, stepTime, keys, keyFrames, duration, desc.timing);

        var handle = new qx.bom.element.AnimationHandle();
        handle.jsAnimation = true;

        if (reverse) {
          delta.reverse();
          handle.reverse = true;
        }

        handle.desc = desc;
        handle.el = el;
        handle.delta = delta;
        handle.stepTime = stepTime;
        handle.steps = steps;
        el.$$animation = handle;
        handle.i = 0;
        handle.initValues = {};
        handle.repeatSteps = this.__applyRepeat(steps, desc.repeat);
        var delay = desc.delay || 0;
        var self = this;
        handle.delayId = window.setTimeout(function () {
          handle.delayId = null;
          self.play(handle);
        }, delay);
        return handle;
      },

      /**
       * Try to normalize the keyFrames by adding the default / set values of the
       * element.
       * @param keyFrames {Map} The map of key frames.
       * @param el {Element} The element to animate.
       */
      __normalizeKeyFrames: function __normalizeKeyFrames(keyFrames, el) {
        // collect all possible keys and its units
        var units = {};

        for (var percent in keyFrames) {
          for (var name in keyFrames[percent]) {
            // prefixed key calculation
            var prefixed = qx.bom.Style.getPropertyName(name);

            if (prefixed && prefixed != name) {
              var prefixedName = qx.bom.Style.getCssName(prefixed);
              keyFrames[percent][prefixedName] = keyFrames[percent][name];
              delete keyFrames[percent][name];
              name = prefixedName;
            } // check for the available units


            if (units[name] == undefined) {
              var item = keyFrames[percent][name];

              if (typeof item == "string") {
                units[name] = this.__getUnit(item);
              } else {
                units[name] = "";
              }
            }
          }

          ;
        } // add all missing keys


        for (var percent in keyFrames) {
          var frame = keyFrames[percent];

          for (var name in units) {
            if (frame[name] == undefined) {
              if (name in el.style) {
                // get the computed style if possible
                if (window.getComputedStyle) {
                  frame[name] = window.getComputedStyle(el, null)[name];
                } else {
                  frame[name] = el.style[name];
                }
              } else {
                frame[name] = el[name];
              } // if its a unit we know, set 0 as fallback


              if (frame[name] === "" && this.__units.indexOf(units[name]) != -1) {
                frame[name] = "0" + units[name];
              }
            }
          }

          ;
        }

        ;
      },

      /**
       * Checks for transform keys and returns a cloned frame
       * with the right transform style set.
       * @param frame {Map} A single key frame of the description.
       * @return {Map} A modified clone of the given frame.
       */
      __normalizeKeyFrameTransforms: function __normalizeKeyFrameTransforms(frame) {
        frame = qx.lang.Object.clone(frame);
        var transforms;

        for (var name in frame) {
          if (name in this.__transitionKeys) {
            if (!transforms) {
              transforms = {};
            }

            transforms[name] = frame[name];
            delete frame[name];
          }
        }

        ;

        if (transforms) {
          var transformStyle = qx.bom.element.Transform.getCss(transforms).split(":");

          if (transformStyle.length > 1) {
            frame[transformStyle[0]] = transformStyle[1].replace(";", "");
          }
        }

        return frame;
      },

      /**
       * Precalculation of the delta which will be applied during the animation.
       * The whole deltas will be calculated prior to the animation and stored
       * in a single array. This method takes care of that calculation.
       *
       * @param steps {Integer} The amount of steps to take to the end of the
       *   animation.
       * @param stepTime {Integer} The amount of milliseconds each step takes.
       * @param keys {Array} Ordered list of keys in the key frames map.
       * @param keyFrames {Map} The map of key frames.
       * @param duration {Integer} Time in milliseconds the animation should take.
       * @param timing {String} The given timing function.
       * @return {Array} An array containing the animation deltas.
       */
      __calculateDelta: function __calculateDelta(steps, stepTime, keys, keyFrames, duration, timing) {
        var delta = new Array(steps);
        var keyIndex = 1;
        delta[0] = this.__normalizeKeyFrameTransforms(keyFrames[0]);
        var last = keyFrames[0];
        var next = keyFrames[keys[keyIndex]];
        var stepsToNext = Math.floor(keys[keyIndex] / (stepTime / duration * 100));
        var calculationIndex = 1; // is used as counter for the timing calculation
        // for every step

        for (var i = 1; i < delta.length; i++) {
          // switch key frames if we crossed a percent border
          if (i * stepTime / duration * 100 > keys[keyIndex]) {
            last = next;
            keyIndex++;
            next = keyFrames[keys[keyIndex]];
            stepsToNext = Math.floor(keys[keyIndex] / (stepTime / duration * 100)) - stepsToNext;
            calculationIndex = 1;
          }

          delta[i] = {};
          var transforms; // for every property

          for (var name in next) {
            var nItem = next[name] + ""; // transform values

            if (name in this.__transitionKeys) {
              if (!transforms) {
                transforms = {};
              }

              if (qx.Bootstrap.isArray(last[name])) {
                if (!qx.Bootstrap.isArray(next[name])) {
                  next[name] = [next[name]];
                }

                transforms[name] = [];

                for (var j = 0; j < next[name].length; j++) {
                  var item = next[name][j] + "";
                  var x = calculationIndex / stepsToNext;
                  transforms[name][j] = this.__getNextValue(item, last[name], timing, x);
                }
              } else {
                var x = calculationIndex / stepsToNext;
                transforms[name] = this.__getNextValue(nItem, last[name], timing, x);
              } // color values

            } else if (nItem.charAt(0) == "#") {
              // get the two values from the frames as RGB arrays
              var value0 = qx.util.ColorUtil.cssStringToRgb(last[name]);
              var value1 = qx.util.ColorUtil.cssStringToRgb(nItem);
              var stepValue = []; // calculate every color channel

              for (var j = 0; j < value0.length; j++) {
                var range = value0[j] - value1[j];
                var x = calculationIndex / stepsToNext;
                var timingX = qx.bom.AnimationFrame.calculateTiming(timing, x);
                stepValue[j] = parseInt(value0[j] - range * timingX, 10);
              }

              delta[i][name] = qx.util.ColorUtil.rgbToHexString(stepValue);
            } else if (!isNaN(parseFloat(nItem))) {
              var x = calculationIndex / stepsToNext;
              delta[i][name] = this.__getNextValue(nItem, last[name], timing, x);
            } else {
              delta[i][name] = last[name] + "";
            }
          } // save all transformations in the delta values


          if (transforms) {
            var transformStyle = qx.bom.element.Transform.getCss(transforms).split(":");

            if (transformStyle.length > 1) {
              delta[i][transformStyle[0]] = transformStyle[1].replace(";", "");
            }
          }

          calculationIndex++;
        } // make sure the last key frame is right


        delta[delta.length - 1] = this.__normalizeKeyFrameTransforms(keyFrames[100]);
        return delta;
      },

      /**
       * Ties to parse out the unit of the given value.
       *
       * @param item {String} A CSS value including its unit.
       * @return {String} The unit of the given value.
       */
      __getUnit: function __getUnit(item) {
        return item.substring((parseFloat(item) + "").length, item.length);
      },

      /**
       * Returns the next value based on the given arguments.
       *
       * @param nextItem {String} The CSS value of the next frame
       * @param lastItem {String} The CSS value of the last frame
       * @param timing {String} The timing used for the calculation
       * @param x {Number} The x position of the animation on the time axis
       * @return {String} The calculated value including its unit.
       */
      __getNextValue: function __getNextValue(nextItem, lastItem, timing, x) {
        var range = parseFloat(nextItem) - parseFloat(lastItem);
        return parseFloat(lastItem) + range * qx.bom.AnimationFrame.calculateTiming(timing, x) + this.__getUnit(nextItem);
      },

      /**
       * Internal helper for the {@link qx.bom.element.AnimationHandle} to play
       * the animation.
       * @internal
       * @param handle {qx.bom.element.AnimationHandle} The hand which
       *   represents the animation.
       * @return {qx.bom.element.AnimationHandle} The handle for chaining.
       */
      play: function play(handle) {
        handle.emit("start", handle.el);
        var id = window.setInterval(function () {
          handle.repeatSteps--;
          var values = handle.delta[handle.i % handle.steps]; // save the init values

          if (handle.i === 0) {
            for (var name in values) {
              if (handle.initValues[name] === undefined) {
                // animate element property
                if (handle.el[name] !== undefined) {
                  handle.initValues[name] = handle.el[name];
                } // animate CSS property
                else if (qx.bom.element.Style) {
                    handle.initValues[name] = qx.bom.element.Style.get(handle.el, qx.lang.String.camelCase(name));
                  } else {
                    handle.initValues[name] = handle.el.style[qx.lang.String.camelCase(name)];
                  }
              }
            }
          }

          qx.bom.element.AnimationJs.__applyStyles(handle.el, values);

          handle.i++; // iteration condition

          if (handle.i % handle.steps == 0) {
            handle.emit("iteration", handle.el);

            if (handle.desc.alternate) {
              handle.delta.reverse();
            }
          } // end condition


          if (handle.repeatSteps < 0) {
            qx.bom.element.AnimationJs.stop(handle);
          }
        }, handle.stepTime);
        handle.animationId = id;
        return handle;
      },

      /**
       * Internal helper for the {@link qx.bom.element.AnimationHandle} to pause
       * the animation.
       * @internal
       * @param handle {qx.bom.element.AnimationHandle} The hand which
       *   represents the animation.
       * @return {qx.bom.element.AnimationHandle} The handle for chaining.
       */
      pause: function pause(handle) {
        // stop the interval
        window.clearInterval(handle.animationId);
        handle.animationId = null;
        return handle;
      },

      /**
       * Internal helper for the {@link qx.bom.element.AnimationHandle} to stop
       * the animation.
       * @internal
       * @param handle {qx.bom.element.AnimationHandle} The hand which
       *   represents the animation.
       * @return {qx.bom.element.AnimationHandle} The handle for chaining.
       */
      stop: function stop(handle) {
        var desc = handle.desc;
        var el = handle.el;
        var initValues = handle.initValues;

        if (handle.animationId) {
          window.clearInterval(handle.animationId);
        } // clear the delay if the animation has not been started


        if (handle.delayId) {
          window.clearTimeout(handle.delayId);
        } // check if animation is already stopped


        if (el == undefined) {
          return handle;
        } // if we should keep a frame


        var keep = desc.keep;

        if (keep != undefined && !handle.stopped) {
          if (handle.reverse || desc.alternate && desc.repeat && desc.repeat % 2 == 0) {
            keep = 100 - keep;
          }

          this.__applyStyles(el, desc.keyFrames[keep]);
        } else {
          this.__applyStyles(el, initValues);
        }

        el.$$animation = null;
        handle.el = null;
        handle.ended = true;
        handle.animationId = null;
        handle.emit("end", el);
        return handle;
      },

      /**
       * Takes care of the repeat key of the description.
       * @param steps {Integer} The number of steps one iteration would take.
       * @param repeat {Integer|String} It can be either a number how often the
       * animation should be repeated or the string 'infinite'.
       * @return {Integer} The number of steps to animate.
       */
      __applyRepeat: function __applyRepeat(steps, repeat) {
        if (repeat == undefined) {
          return steps;
        }

        if (repeat == "infinite") {
          return Number.MAX_VALUE;
        }

        return steps * repeat;
      },

      /**
       * Central method to apply css styles and element properties.
       * @param el {Element} The DOM element to apply the styles.
       * @param styles {Map} A map containing styles and values.
       */
      __applyStyles: function __applyStyles(el, styles) {
        for (var key in styles) {
          // ignore undefined values (might be a bad detection)
          if (styles[key] === undefined) {
            continue;
          } // apply element property value - only if a CSS property
          // is *not* available


          if (typeof el.style[key] === "undefined" && key in el) {
            el[key] = styles[key];
            continue;
          }

          var name = qx.bom.Style.getPropertyName(key) || key;

          if (qx.bom.element.Style) {
            qx.bom.element.Style.set(el, name, styles[key]);
          } else {
            el.style[name] = styles[key];
          }
        }
      },

      /**
       * Dynamic calculation of the steps time considering a max step time.
       * @param duration {Number} The duration of the animation.
       * @param keys {Array} An array containing the ordered set of key frame keys.
       * @return {Integer} The best suited step time.
       */
      __getStepTime: function __getStepTime(duration, keys) {
        // get min difference
        var minDiff = 100;

        for (var i = 0; i < keys.length - 1; i++) {
          minDiff = Math.min(minDiff, keys[i + 1] - keys[i]);
        }

        ;
        var stepTime = duration * minDiff / 100;

        while (stepTime > this.__maxStepTime) {
          stepTime = stepTime / 2;
        }

        return Math.round(stepTime);
      },

      /**
       * Helper which returns the ordered keys of the key frame map.
       * @param keyFrames {Map} The map of key frames.
       * @return {Array} An ordered list of keys.
       */
      __getOrderedKeys: function __getOrderedKeys(keyFrames) {
        var keys = Object.keys(keyFrames);

        for (var i = 0; i < keys.length; i++) {
          keys[i] = parseInt(keys[i], 10);
        }

        ;
        keys.sort(function (a, b) {
          return a - b;
        });
        return keys;
      }
    }
  });
  qx.bom.element.AnimationJs.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Keyboard input event object.
   *
   * the interface of this class is based on the DOM Level 3 keyboard event
   * interface: http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
   */
  qx.Class.define("qx.event.type.KeyInput", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Object} The event target
       * @param charCode {Integer} the character code
       * @return {qx.event.type.KeyInput} The initialized key event instance
       */
      init: function init(domEvent, target, charCode) {
        qx.event.type.KeyInput.prototype.init.base.call(this, domEvent, target, null, true, true);
        this._charCode = charCode;
        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.KeyInput.prototype.clone.base.call(this, embryo);
        clone._charCode = this._charCode;
        return clone;
      },

      /**
       * Unicode number of the pressed character.
       *
       * @return {Integer} Unicode number of the pressed character
       */
      getCharCode: function getCharCode() {
        return this._charCode;
      },

      /**
       * Returns the pressed character
       *
       * @return {String} The character
       */
      getChar: function getChar() {
        return String.fromCharCode(this._charCode);
      }
    }
  });
  qx.event.type.KeyInput.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {
        "require": true
      },
      "qx.event.util.Keyboard": {}
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
   * Keyboard event object.
   *
   * the interface of this class is based on the DOM Level 3 keyboard event
   * interface: http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
   */
  qx.Class.define("qx.event.type.KeySequence", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Object} The event target
       * @param identifier {String} Key identifier
       * @return {qx.event.type.KeySequence} The initialized key event instance
       */
      init: function init(domEvent, target, identifier) {
        qx.event.type.KeySequence.prototype.init.base.call(this, domEvent, target, null, true, true);
        this._keyCode = domEvent.keyCode;
        this._identifier = identifier;
        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.KeySequence.prototype.clone.base.call(this, embryo);
        clone._keyCode = this._keyCode;
        clone._identifier = this._identifier;
        return clone;
      },

      /**
       * Identifier of the pressed key. This property is modeled after the <em>KeyboardEvent.keyIdentifier</em> property
       * of the W3C DOM 3 event specification
       * (http://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/events.html#Events-KeyboardEvent-keyIdentifier).
       *
       * Printable keys are represented by an unicode string, non-printable keys
       * have one of the following values:
       *
       * <table>
       * <tr><th>Backspace</th><td>The Backspace (Back) key.</td></tr>
       * <tr><th>Tab</th><td>The Horizontal Tabulation (Tab) key.</td></tr>
       * <tr><th>Space</th><td>The Space (Spacebar) key.</td></tr>
       * <tr><th>Enter</th><td>The Enter key. Note: This key identifier is also used for the Return (Macintosh numpad) key.</td></tr>
       * <tr><th>Shift</th><td>The Shift key.</td></tr>
       * <tr><th>Control</th><td>The Control (Ctrl) key.</td></tr>
       * <tr><th>Alt</th><td>The Alt (Menu) key.</td></tr>
       * <tr><th>CapsLock</th><td>The CapsLock key</td></tr>
       * <tr><th>Meta</th><td>The Meta key. (Apple Meta and Windows key)</td></tr>
       * <tr><th>Escape</th><td>The Escape (Esc) key.</td></tr>
       * <tr><th>Left</th><td>The Left Arrow key.</td></tr>
       * <tr><th>Up</th><td>The Up Arrow key.</td></tr>
       * <tr><th>Right</th><td>The Right Arrow key.</td></tr>
       * <tr><th>Down</th><td>The Down Arrow key.</td></tr>
       * <tr><th>PageUp</th><td>The Page Up key.</td></tr>
       * <tr><th>PageDown</th><td>The Page Down (Next) key.</td></tr>
       * <tr><th>End</th><td>The End key.</td></tr>
       * <tr><th>Home</th><td>The Home key.</td></tr>
       * <tr><th>Insert</th><td>The Insert (Ins) key. (Does not fire in Opera/Win)</td></tr>
       * <tr><th>Delete</th><td>The Delete (Del) Key.</td></tr>
       * <tr><th>F1</th><td>The F1 key.</td></tr>
       * <tr><th>F2</th><td>The F2 key.</td></tr>
       * <tr><th>F3</th><td>The F3 key.</td></tr>
       * <tr><th>F4</th><td>The F4 key.</td></tr>
       * <tr><th>F5</th><td>The F5 key.</td></tr>
       * <tr><th>F6</th><td>The F6 key.</td></tr>
       * <tr><th>F7</th><td>The F7 key.</td></tr>
       * <tr><th>F8</th><td>The F8 key.</td></tr>
       * <tr><th>F9</th><td>The F9 key.</td></tr>
       * <tr><th>F10</th><td>The F10 key.</td></tr>
       * <tr><th>F11</th><td>The F11 key.</td></tr>
       * <tr><th>F12</th><td>The F12 key.</td></tr>
       * <tr><th>NumLock</th><td>The Num Lock key.</td></tr>
       * <tr><th>PrintScreen</th><td>The Print Screen (PrintScrn, SnapShot) key.</td></tr>
       * <tr><th>Scroll</th><td>The scroll lock key</td></tr>
       * <tr><th>Pause</th><td>The pause/break key</td></tr>
       * <tr><th>Win</th><td>The Windows Logo key</td></tr>
       * <tr><th>Apps</th><td>The Application key (Windows Context Menu)</td></tr>
       * </table>
       *
       * @return {String} The key identifier
       */
      getKeyIdentifier: function getKeyIdentifier() {
        return this._identifier;
      },

      /**
       * Returns the native keyCode and is best used on keydown/keyup events to
       * check which physical key was pressed.
       * Don't use this on keypress events because it's erroneous and
       * inconsistent across browsers. But it can be used to detect which key is
       * exactly pressed (e.g. for num pad keys).
       * In any regular case, you should use {@link #getKeyIdentifier} which
       * takes care of all cross browser stuff.
       *
       * The key codes are not character codes, they are just ASCII codes to
       * identify the keyboard (or other input devices) keys.
       *
       * @return {Number} The key code.
       */
      getKeyCode: function getKeyCode() {
        return this._keyCode;
      },

      /**
       * Checks whether the pressed key is printable.
       *
       * @return {Boolean} Whether the pressed key is printable.
       */
      isPrintable: function isPrintable() {
        return qx.event.util.Keyboard.isPrintableKeyIdentifier(this._identifier);
      }
    }
  });
  qx.event.type.KeySequence.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.OperatingSystem": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
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
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Utilities for working with character codes and key identifiers
   */
  qx.Bootstrap.define("qx.event.util.Keyboard", {
    statics: {
      /*
      ---------------------------------------------------------------------------
        KEY MAPS
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} maps the charcodes of special printable keys to key identifiers
       *
       * @lint ignoreReferenceField(specialCharCodeMap)
       */
      specialCharCodeMap: {
        8: "Backspace",
        // The Backspace (Back) key.
        9: "Tab",
        // The Horizontal Tabulation (Tab) key.
        //   Note: This key identifier is also used for the
        //   Return (Macintosh numpad) key.
        13: "Enter",
        // The Enter key.
        27: "Escape",
        // The Escape (Esc) key.
        32: "Space" // The Space (Spacebar) key.

      },

      /**
       * @type {Map} maps the keycodes of the numpad keys to the right charcodes
       *
       * @lint ignoreReferenceField(numpadToCharCode)
       */
      numpadToCharCode: {
        96: "0".charCodeAt(0),
        97: "1".charCodeAt(0),
        98: "2".charCodeAt(0),
        99: "3".charCodeAt(0),
        100: "4".charCodeAt(0),
        101: "5".charCodeAt(0),
        102: "6".charCodeAt(0),
        103: "7".charCodeAt(0),
        104: "8".charCodeAt(0),
        105: "9".charCodeAt(0),
        106: "*".charCodeAt(0),
        107: "+".charCodeAt(0),
        109: "-".charCodeAt(0),
        110: ",".charCodeAt(0),
        111: "/".charCodeAt(0)
      },

      /**
       * @type {Map} maps the keycodes of non printable keys to key identifiers
       *
       * @lint ignoreReferenceField(keyCodeToIdentifierMap)
       */
      keyCodeToIdentifierMap: {
        16: "Shift",
        // The Shift key.
        17: "Control",
        // The Control (Ctrl) key.
        18: "Alt",
        // The Alt (Menu) key.
        20: "CapsLock",
        // The CapsLock key
        224: "Meta",
        // The Meta key. (Apple Meta and Windows key)
        37: "Left",
        // The Left Arrow key.
        38: "Up",
        // The Up Arrow key.
        39: "Right",
        // The Right Arrow key.
        40: "Down",
        // The Down Arrow key.
        33: "PageUp",
        // The Page Up key.
        34: "PageDown",
        // The Page Down (Next) key.
        35: "End",
        // The End key.
        36: "Home",
        // The Home key.
        45: "Insert",
        // The Insert (Ins) key. (Does not fire in Opera/Win)
        46: "Delete",
        // The Delete (Del) Key.
        112: "F1",
        // The F1 key.
        113: "F2",
        // The F2 key.
        114: "F3",
        // The F3 key.
        115: "F4",
        // The F4 key.
        116: "F5",
        // The F5 key.
        117: "F6",
        // The F6 key.
        118: "F7",
        // The F7 key.
        119: "F8",
        // The F8 key.
        120: "F9",
        // The F9 key.
        121: "F10",
        // The F10 key.
        122: "F11",
        // The F11 key.
        123: "F12",
        // The F12 key.
        144: "NumLock",
        // The Num Lock key.
        44: "PrintScreen",
        // The Print Screen (PrintScrn, SnapShot) key.
        145: "Scroll",
        // The scroll lock key
        19: "Pause",
        // The pause/break key
        // The left Windows Logo key or left cmd key
        91: qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Win",
        92: "Win",
        // The right Windows Logo key or left cmd key
        // The Application key (Windows Context Menu) or right cmd key
        93: qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Apps"
      },

      /** char code for capital A */
      charCodeA: "A".charCodeAt(0),

      /** char code for capital Z */
      charCodeZ: "Z".charCodeAt(0),

      /** char code for 0 */
      charCode0: "0".charCodeAt(0),

      /** char code for 9 */
      charCode9: "9".charCodeAt(0),

      /**
       * converts a keyboard code to the corresponding identifier
       *
       * @param keyCode {Integer} key code
       * @return {String} key identifier
       */
      keyCodeToIdentifier: function keyCodeToIdentifier(keyCode) {
        if (this.isIdentifiableKeyCode(keyCode)) {
          var numPadKeyCode = this.numpadToCharCode[keyCode];

          if (numPadKeyCode) {
            return String.fromCharCode(numPadKeyCode);
          }

          return this.keyCodeToIdentifierMap[keyCode] || this.specialCharCodeMap[keyCode] || String.fromCharCode(keyCode);
        } else {
          return "Unidentified";
        }
      },

      /**
       * converts a character code to the corresponding identifier
       *
       * @param charCode {String} character code
       * @return {String} key identifier
       */
      charCodeToIdentifier: function charCodeToIdentifier(charCode) {
        return this.specialCharCodeMap[charCode] || String.fromCharCode(charCode).toUpperCase();
      },

      /**
       * Check whether the keycode can be reliably detected in keyup/keydown events
       *
       * @param keyCode {String} key code to check.
       * @return {Boolean} Whether the keycode can be reliably detected in keyup/keydown events.
       */
      isIdentifiableKeyCode: function isIdentifiableKeyCode(keyCode) {
        if (keyCode >= this.charCodeA && keyCode <= this.charCodeZ) {
          return true;
        } // 0-9


        if (keyCode >= this.charCode0 && keyCode <= this.charCode9) {
          return true;
        } // Enter, Space, Tab, Backspace


        if (this.specialCharCodeMap[keyCode]) {
          return true;
        } // Numpad


        if (this.numpadToCharCode[keyCode]) {
          return true;
        } // non printable keys


        if (this.isNonPrintableKeyCode(keyCode)) {
          return true;
        }

        return false;
      },

      /**
       * Checks whether the keyCode represents a non printable key
       *
       * @param keyCode {String} key code to check.
       * @return {Boolean} Whether the keyCode represents a non printable key.
       */
      isNonPrintableKeyCode: function isNonPrintableKeyCode(keyCode) {
        return this.keyCodeToIdentifierMap[keyCode] ? true : false;
      },

      /**
       * Checks whether a given string is a valid keyIdentifier
       *
       * @param keyIdentifier {String} The key identifier.
       * @return {Boolean} whether the given string is a valid keyIdentifier
       */
      isValidKeyIdentifier: function isValidKeyIdentifier(keyIdentifier) {
        if (this.identifierToKeyCodeMap[keyIdentifier]) {
          return true;
        }

        if (keyIdentifier.length != 1) {
          return false;
        }

        if (keyIdentifier >= "0" && keyIdentifier <= "9") {
          return true;
        }

        if (keyIdentifier >= "A" && keyIdentifier <= "Z") {
          return true;
        }

        switch (keyIdentifier) {
          case "+":
          case "-":
          case "*":
          case "/":
          case ",":
            return true;

          default:
            return false;
        }
      },

      /**
       * Checks whether a given string is a printable keyIdentifier.
       *
       * @param keyIdentifier {String} The key identifier.
       * @return {Boolean} whether the given string is a printable keyIdentifier.
       */
      isPrintableKeyIdentifier: function isPrintableKeyIdentifier(keyIdentifier) {
        if (keyIdentifier === "Space") {
          return true;
        } else {
          return this.identifierToKeyCodeMap[keyIdentifier] ? false : true;
        }
      }
    },
    defer: function defer(statics) {
      // construct inverse of keyCodeToIdentifierMap
      if (!statics.identifierToKeyCodeMap) {
        statics.identifierToKeyCodeMap = {};

        for (var key in statics.keyCodeToIdentifierMap) {
          statics.identifierToKeyCodeMap[statics.keyCodeToIdentifierMap[key]] = parseInt(key, 10);
        }

        for (var key in statics.specialCharCodeMap) {
          statics.identifierToKeyCodeMap[statics.specialCharCodeMap[key]] = parseInt(key, 10);
        }
      }
    }
  });
  qx.event.util.Keyboard.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.Wheel": {}
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
       * Fabian Jakobs (fjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mouse wheel event object.
   */
  qx.Class.define("qx.event.type.MouseWheel", {
    extend: qx.event.type.Mouse,
    members: {
      // overridden
      stop: function stop() {
        this.stopPropagation();
        this.preventDefault();
      },

      /**
       * Get the amount the wheel has been scrolled
       *
       * @param axis {String?} Optional parameter which defines the scroll axis.
       *   The value can either be <code>"x"</code> or <code>"y"</code>.
       * @return {Integer} Scroll wheel movement for the given axis. If no axis
       *   is given, the y axis is used.
       */
      getWheelDelta: function getWheelDelta(axis) {
        return qx.util.Wheel.getDelta(this._native, axis);
      }
    }
  });
  qx.event.type.MouseWheel.$$dbClassInfo = $$dbClassInfo;
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
   * Orientation event object.
   */
  qx.Class.define("qx.event.type.Orientation", {
    extend: qx.event.type.Event,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __orientation: null,
      __mode: null,

      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param orientation {String} One of <code>0</code>, <code>90</code> or <code>-90</code>
       * @param mode {String} <code>landscape</code> or <code>portrait</code>
       * @return {qx.event.type.Orientation} The initialized event instance
       */
      init: function init(orientation, mode) {
        qx.event.type.Orientation.prototype.init.base.call(this, false, false);
        this.__orientation = orientation;
        this.__mode = mode;
        return this;
      },

      /**
       * Get a copy of this object
       *
       * @param embryo {qx.event.type.Orientation?null} Optional event class, which will
       *     be configured using the data of this event instance. The event must be
       *     an instance of this event class. If the data is <code>null</code>,
       *     a new pooled instance is created.
       *
       * @return {qx.event.type.Orientation} a copy of this object
       */
      clone: function clone(embryo) {
        var clone = qx.event.type.Orientation.prototype.clone.base.call(this, embryo);
        clone.__orientation = this.__orientation;
        clone.__mode = this.__mode;
        return clone;
      },

      /**
       * Returns the current orientation of the viewport in degree.
       *
       * All possible values and their meaning:
       *
       * * <code>0</code>: "Portrait"
       * * <code>-90</code>: "Landscape (right, screen turned clockwise)"
       * * <code>90</code>: "Landscape (left, screen turned counterclockwise)"
       * * <code>180</code>: "Portrait (upside-down portrait)"
       *
       * @return {Integer} The current orientation in degree
       */
      getOrientation: function getOrientation() {
        return this.__orientation;
      },

      /**
       * Whether the viewport orientation is currently in landscape mode.
       *
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in landscape mode.
       */
      isLandscape: function isLandscape() {
        return this.__mode == "landscape";
      },

      /**
       * Whether the viewport orientation is currently in portrait mode.
       *
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in portrait mode.
       */
      isPortrait: function isPortrait() {
        return this.__mode == "portrait";
      }
    }
  });
  qx.event.type.Orientation.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {
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
       * Martin Wittemann (martinwittemann)
       * Tino Butz (tbtz)
  
  ************************************************************************ */

  /**
   * Touch event object.
   *
   * For more information see:
   *     https://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
   */
  qx.Class.define("qx.event.type.Touch", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Touch.prototype._cloneNativeEvent.base.call(this, nativeEvent, clone);

        clone.pageX = nativeEvent.pageX;
        clone.pageY = nativeEvent.pageY;
        clone.offsetX = nativeEvent.offsetX;
        clone.offsetY = nativeEvent.offsetY; // Workaround for BUG #6491

        clone.layerX = nativeEvent.offsetX || nativeEvent.layerX;
        clone.layerY = nativeEvent.offsetY || nativeEvent.layerY;
        clone.scale = nativeEvent.scale;
        clone.rotation = nativeEvent.rotation;
        clone._rotation = nativeEvent._rotation;
        clone.delta = nativeEvent.delta;
        clone.srcElement = nativeEvent.srcElement;
        clone.targetTouches = [];

        for (var i = 0; i < nativeEvent.targetTouches.length; i++) {
          clone.targetTouches[i] = nativeEvent.targetTouches[i];
        }

        clone.changedTouches = [];

        for (i = 0; i < nativeEvent.changedTouches.length; i++) {
          clone.changedTouches[i] = nativeEvent.changedTouches[i];
        }

        clone.touches = [];

        for (i = 0; i < nativeEvent.touches.length; i++) {
          clone.touches[i] = nativeEvent.touches[i];
        }

        return clone;
      },
      // overridden
      stop: function stop() {
        this.stopPropagation();
      },

      /**
       * Returns an array of native Touch objects representing all current
       * touches on the document.
       * Returns an empty array for the "touchend" event.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     https://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getAllTouches: function getAllTouches() {
        return this._native.touches;
      },

      /**
       * Returns an array of native Touch objects representing all touches
       * associated with the event target element.
       * Returns an empty array for the "touchend" event.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     https://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getTargetTouches: function getTargetTouches() {
        return this._native.targetTouches;
      },

      /**
       * Returns an array of native Touch objects representing all touches of
       * the target element that changed in this event.
       *
       * On the "touchstart" event the array contains all touches that were
       * added to the target element.
       * On the "touchmove" event the array contains all touches that were
       * moved on the target element.
       * On the "touchend" event the array contains all touches that used
       * to be on the target element.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     https://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getChangedTargetTouches: function getChangedTargetTouches() {
        return this._native.changedTouches;
      },

      /**
       * Checks whether more than one touch is associated with the event target
       * element.
       *
       * @return {Boolean} Is multi-touch
       */
      isMultiTouch: function isMultiTouch() {
        return this.__getEventSpecificTouches().length > 1;
      },

      /**
       * Returns the distance between two fingers since the start of the event.
       * The distance is a multiplier of the initial distance.
       * Initial value: 1.0.
       * Gestures:
       * < 1.0, pinch close / zoom out.
       * > 1.0, pinch open / to zoom in.
       *
       * @return {Float} The scale distance between two fingers
       */
      getScale: function getScale() {
        return this._native.scale;
      },

      /**
       * Returns the delta of the rotation since the start of the event, in degrees.
       * Initial value is 0.0
       * Clockwise > 0
       * Counter-clockwise < 0.
       *
       * @return {Float} The rotation delta
       */
      getRotation: function getRotation() {
        if (typeof this._native._rotation === "undefined") {
          return this._native.rotation;
        } else {
          return this._native._rotation;
        }
      },

      /**
       * Returns an array with the calculated delta coordinates of all active touches,
       * relative to the position on <code>touchstart</code> event.
       *
       * @return {Array} an array with objects for each active touch which contains the delta as <code>x</code> and
       * <code>y</code>, the touch identifier as <code>identifier</code> and the movement axis as <code>axis</code>.
       */
      getDelta: function getDelta() {
        return this._native.delta;
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The horizontal position of the touch in the document.
       */
      getDocumentLeft: function getDocumentLeft(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).pageX;
      },

      /**
       * Get the vertical position at which the event occurred relative to the
       * top of the document. This property takes into account any scrolling of
       * the page.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The vertical position of the touch in the document.
       */
      getDocumentTop: function getDocumentTop(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).pageY;
      },

      /**
       * Get the horizontal coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The horizontal position of the touch
       */
      getScreenLeft: function getScreenLeft(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).screenX;
      },

      /**
       * Get the vertical coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The vertical position of the touch
       */
      getScreenTop: function getScreenTop(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).screenY;
      },

      /**
       * Get the the horizontal coordinate at which the event occurred relative
       * to the viewport.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The horizontal position of the touch
       */
      getViewportLeft: function getViewportLeft(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).clientX;
      },

      /**
       * Get the vertical coordinate at which the event occurred relative
       * to the viewport.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The vertical position of the touch
       */
      getViewportTop: function getViewportTop(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).clientY;
      },

      /**
       * Returns the unique identifier for a certain touch object.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} Unique identifier of the touch object
       */
      getIdentifier: function getIdentifier(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).identifier;
      },

      /**
       * Returns an event specific touch on the target element. This function is
       * used as the "touchend" event only offers Touch objects in the
       * changedTouches array.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object to
       *     retrieve
       * @return {Object} A native Touch object
       */
      __getEventSpecificTouch: function __getEventSpecificTouch(touchIndex) {
        touchIndex = touchIndex == null ? 0 : touchIndex;
        return this.__getEventSpecificTouches()[touchIndex];
      },

      /**
       * Returns the event specific touches on the target element. This function
       * is used as the "touchend" event only offers Touch objects in the
       * changedTouches array.
       *
       * @return {Object[]} Array of native Touch objects
       */
      __getEventSpecificTouches: function __getEventSpecificTouches() {
        var touches = this._isTouchEnd() ? this.getChangedTargetTouches() : this.getTargetTouches();
        return touches;
      },

      /**
       * Indicates if the event occurs during the "touchend" phase. Needed to
       * determine the event specific touches. Override this method if you derive
       * from this class and want to indicate that the specific event occurred
       * during the "touchend" phase.
       *
       * @return {Boolean} Whether the event occurred during the "touchend" phase
       */
      _isTouchEnd: function _isTouchEnd() {
        return this.getType() == "touchend" || this.getType() == "touchcancel";
      }
    }
  });
  qx.event.type.Touch.$$dbClassInfo = $$dbClassInfo;
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
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
   ************************************************************************ */

  /**
   * Util for mouse wheel normalization.
   */
  qx.Bootstrap.define("qx.util.Wheel", {
    statics: {
      /**
       * The maximal measured scroll wheel delta.
       * @internal
       */
      MAXSCROLL: null,

      /**
       * The minimal measured scroll wheel delta.
       * @internal
       */
      MINSCROLL: null,

      /**
       * The normalization factor for the speed calculation.
       * @internal
       */
      FACTOR: 1,

      /**
       * Is the Wheel actually a touchpad ?
       * @internal
       */
      IS_TOUCHPAD: false,

      /**
       * Get the amount the wheel has been scrolled
       *
       * @param domEvent {Event} The native wheel event.
       * @param axis {String?} Optional parameter which defines the scroll axis.
       *   The value can either be <code>"x"</code> or <code>"y"</code>.
       * @return {Integer} Scroll wheel movement for the given axis. If no axis
       *   is given, the y axis is used.
       */
      getDelta: function getDelta(domEvent, axis) {
        // default case
        if (axis === undefined) {
          // default case
          var delta = 0;

          if (domEvent.wheelDelta !== undefined) {
            delta = -domEvent.wheelDelta;
          } else if (domEvent.detail !== 0) {
            delta = domEvent.detail;
          } else if (domEvent.deltaY !== undefined) {
            // use deltaY as default for firefox
            delta = domEvent.deltaY;
          }

          return this.__normalize(delta);
        } // get the x scroll delta


        if (axis === "x") {
          var x = 0;

          if (domEvent.wheelDelta !== undefined) {
            if (domEvent.wheelDeltaX !== undefined) {
              x = domEvent.wheelDeltaX ? this.__normalize(-domEvent.wheelDeltaX) : 0;
            }
          } else {
            if (domEvent.axis && domEvent.axis == domEvent.HORIZONTAL_AXIS && domEvent.detail !== undefined && domEvent.detail > 0) {
              x = this.__normalize(domEvent.detail);
            } else if (domEvent.deltaX !== undefined) {
              x = this.__normalize(domEvent.deltaX);
            }
          }

          return x;
        } // get the y scroll delta


        if (axis === "y") {
          var y = 0;

          if (domEvent.wheelDelta !== undefined) {
            if (domEvent.wheelDeltaY !== undefined) {
              y = domEvent.wheelDeltaY ? this.__normalize(-domEvent.wheelDeltaY) : 0;
            } else {
              y = this.__normalize(-domEvent.wheelDelta);
            }
          } else {
            if (!(domEvent.axis && domEvent.axis == domEvent.HORIZONTAL_AXIS) && domEvent.detail !== undefined && domEvent.detail > 0) {
              y = this.__normalize(domEvent.detail);
            } else if (domEvent.deltaY !== undefined) {
              y = this.__normalize(domEvent.deltaY);
            }
          }

          return y;
        } // default case, return 0


        return 0;
      },

      /**
       * Normalizer for the mouse wheel data.
       *
       * @param delta {Number} The mouse delta.
       * @return {Number} The normalized delta value
       */
      __normalize: function __normalize(delta) {
        if (qx.util.Wheel.IS_TOUCHPAD) {
          // Reset normalization values that may be re-computed once a real mouse is plugged.
          qx.util.Wheel.MINSCROLL = null;
          qx.util.Wheel.MAXSCROLL = null;
          qx.util.Wheel.FACTOR = 1;
          return delta;
        }

        var absDelta = Math.abs(delta);

        if (absDelta === 0) {
          return 0;
        } // store the min value


        if (qx.util.Wheel.MINSCROLL == null || qx.util.Wheel.MINSCROLL > absDelta) {
          qx.util.Wheel.MINSCROLL = absDelta;

          this.__recalculateMultiplicator();
        } // store the max value


        if (qx.util.Wheel.MAXSCROLL == null || qx.util.Wheel.MAXSCROLL < absDelta) {
          qx.util.Wheel.MAXSCROLL = absDelta;

          this.__recalculateMultiplicator();
        } // special case for systems not speeding up


        if (qx.util.Wheel.MAXSCROLL === absDelta && qx.util.Wheel.MINSCROLL === absDelta) {
          return 2 * (delta / absDelta);
        }

        var range = qx.util.Wheel.MAXSCROLL - qx.util.Wheel.MINSCROLL;
        var ret = delta / range * Math.log(range) * qx.util.Wheel.FACTOR; // return at least 1 or -1

        return ret < 0 ? Math.min(ret, -1) : Math.max(ret, 1);
      },

      /**
       * Recalculates the factor with which the calculated delta is normalized.
       */
      __recalculateMultiplicator: function __recalculateMultiplicator() {
        var max = qx.util.Wheel.MAXSCROLL || 0;
        var min = qx.util.Wheel.MINSCROLL || max;

        if (max <= min) {
          return;
        }

        var range = max - min;
        var maxRet = max / range * Math.log(range);

        if (maxRet == 0) {
          maxRet = 1;
        }

        qx.util.Wheel.FACTOR = 6 / maxRet;
      }
    }
  });
  qx.util.Wheel.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["plugin.gears", "plugin.quicktime", "plugin.quicktime.version", "plugin.windowsmedia", "plugin.windowsmedia.version", "plugin.divx", "plugin.divx.version", "plugin.silverlight", "plugin.silverlight.version", "plugin.pdf", "plugin.pdf.version", "plugin.activex", "plugin.skype"],
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
   * Contains detection for QuickTime, Windows Media, DivX, Silverlight and gears.
   * If no version could be detected the version is set to an empty string as
   * default.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Plugin", {
    statics: {
      /**
       * Checks for the availability of google gears plugin.
       *
       * @internal
       * @return {Boolean} <code>true</code> if gears is available
       */
      getGears: function getGears() {
        return !!(window.google && window.google.gears);
      },

      /**
       * Checks for ActiveX availability.
       *
       * @internal
       * @return {Boolean} <code>true</code> if ActiveX is available
       */
      getActiveX: function getActiveX() {
        if (typeof window.ActiveXObject === "function") {
          return true;
        }

        try {
          // in IE11 Preview, ActiveXObject is undefined but instances can
          // still be created
          return window.ActiveXObject !== undefined && (_typeof(new window.ActiveXObject("Microsoft.XMLHTTP")) === "object" || _typeof(new window.ActiveXObject("MSXML2.DOMDocument.6.0")) === "object");
        } catch (ex) {
          return false;
        }
      },

      /**
       * Checks for Skypes 'Click to call' availability.
       *
       * @internal
       * @return {Boolean} <code>true</code> if the plugin is available.
       */
      getSkype: function getSkype() {
        // IE Support
        if (qx.bom.client.Plugin.getActiveX()) {
          try {
            new ActiveXObject("Skype.Detection");
            return true;
          } catch (e) {}
        }

        var mimeTypes = navigator.mimeTypes;

        if (mimeTypes) {
          // FF support
          if ("application/x-skype" in mimeTypes) {
            return true;
          } // webkit support


          for (var i = 0; i < mimeTypes.length; i++) {
            var desc = mimeTypes[i];

            if (desc.type.indexOf("skype.click2call") != -1) {
              return true;
            }
          }

          ;
        }

        return false;
      },

      /**
       * Database of supported features.
       * Filled with additional data at initialization
       */
      __db: {
        quicktime: {
          plugin: ["QuickTime"],
          control: "QuickTimeCheckObject.QuickTimeCheck.1" // call returns boolean: instance.IsQuickTimeAvailable(0)

        },
        wmv: {
          plugin: ["Windows Media"],
          control: "WMPlayer.OCX.7" // version string in: instance.versionInfo

        },
        divx: {
          plugin: ["DivX Web Player"],
          control: "npdivx.DivXBrowserPlugin.1"
        },
        silverlight: {
          plugin: ["Silverlight"],
          control: "AgControl.AgControl" // version string in: instance.version (Silverlight 1.0)
          // version string in: instance.settings.version (Silverlight 1.1)
          // version check possible using instance.IsVersionSupported

        },
        pdf: {
          plugin: ["Chrome PDF Viewer", "Adobe Acrobat"],
          control: "AcroPDF.PDF" // this is detecting Acrobat PDF version > 7 and Chrome PDF Viewer

        }
      },

      /**
       * Fetches the version of the quicktime plugin.
       * @return {String} The version of the plugin, if available,
       *   an empty string otherwise
       * @internal
       */
      getQuicktimeVersion: function getQuicktimeVersion() {
        var entry = qx.bom.client.Plugin.__db["quicktime"];
        return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
      },

      /**
       * Fetches the version of the windows media plugin.
       * @return {String} The version of the plugin, if available,
       *   an empty string otherwise
       * @internal
       */
      getWindowsMediaVersion: function getWindowsMediaVersion() {
        var entry = qx.bom.client.Plugin.__db["wmv"];
        return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin, true);
      },

      /**
       * Fetches the version of the divx plugin.
       * @return {String} The version of the plugin, if available,
       *   an empty string otherwise
       * @internal
       */
      getDivXVersion: function getDivXVersion() {
        var entry = qx.bom.client.Plugin.__db["divx"];
        return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
      },

      /**
       * Fetches the version of the silverlight plugin.
       * @return {String} The version of the plugin, if available,
       *   an empty string otherwise
       * @internal
       */
      getSilverlightVersion: function getSilverlightVersion() {
        var entry = qx.bom.client.Plugin.__db["silverlight"];
        return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
      },

      /**
       * Fetches the version of the pdf plugin.
       *
       * There are two built-in PDF viewer shipped with browsers:
       *
       * <ul>
       *  <li>Chrome PDF Viewer</li>
       *  <li>PDF.js (Firefox)</li>
       * </ul>
       *
       * While the Chrome PDF Viewer is implemented as plugin and therefore
       * detected by this method PDF.js is <strong>not</strong>.
       *
       * See the dedicated environment key (<em>plugin.pdfjs</em>) instead,
       * which you might check additionally.
       *
       * @return {String} The version of the plugin, if available,
       *  an empty string otherwise
       * @internal
       */
      getPdfVersion: function getPdfVersion() {
        var entry = qx.bom.client.Plugin.__db["pdf"];
        return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
      },

      /**
       * Checks if the quicktime plugin is available.
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getQuicktime: function getQuicktime() {
        var entry = qx.bom.client.Plugin.__db["quicktime"];
        return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
      },

      /**
       * Checks if the windows media plugin is available.
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getWindowsMedia: function getWindowsMedia() {
        var entry = qx.bom.client.Plugin.__db["wmv"];
        return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin, true);
      },

      /**
       * Checks if the divx plugin is available.
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getDivX: function getDivX() {
        var entry = qx.bom.client.Plugin.__db["divx"];
        return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
      },

      /**
       * Checks if the silverlight plugin is available.
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getSilverlight: function getSilverlight() {
        var entry = qx.bom.client.Plugin.__db["silverlight"];
        return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
      },

      /**
       * Checks if the pdf plugin is available.
       *
       * There are two built-in PDF viewer shipped with browsers:
       *
       * <ul>
       *  <li>Chrome PDF Viewer</li>
       *  <li>PDF.js (Firefox)</li>
       * </ul>
       *
       * While the Chrome PDF Viewer is implemented as plugin and therefore
       * detected by this method PDF.js is <strong>not</strong>.
       *
       * See the dedicated environment key (<em>plugin.pdfjs</em>) instead,
       * which you might check additionally.
       *
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getPdf: function getPdf() {
        var entry = qx.bom.client.Plugin.__db["pdf"];
        return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
      },

      /**
       * Internal helper for getting the version of a given plugin.
       *
       * @param activeXName {String} The name which should be used to generate
       *   the test ActiveX Object.
       * @param pluginNames {Array} The names with which the plugins are listed in
       *   the navigator.plugins list.
       * @param forceActiveX {Boolean?false} Force detection using ActiveX
       *   for IE11 plugins that aren't listed in navigator.plugins
       * @return {String} The version of the plugin as string.
       */
      __getVersion: function __getVersion(activeXName, pluginNames, forceActiveX) {
        var available = qx.bom.client.Plugin.__isAvailable(activeXName, pluginNames, forceActiveX); // don't check if the plugin is not available


        if (!available) {
          return "";
        } // IE checks


        if (qx.bom.client.Engine.getName() == "mshtml" && (qx.bom.client.Browser.getDocumentMode() < 11 || forceActiveX)) {
          try {
            var obj = new ActiveXObject(activeXName);
            var version; // pdf version detection

            if (obj.GetVersions && obj.GetVersions()) {
              version = obj.GetVersions().split(',');

              if (version.length > 1) {
                version = version[0].split('=');

                if (version.length === 2) {
                  return version[1];
                }
              }
            }

            version = obj.versionInfo;

            if (version != undefined) {
              return version;
            }

            version = obj.version;

            if (version != undefined) {
              return version;
            }

            version = obj.settings.version;

            if (version != undefined) {
              return version;
            }
          } catch (ex) {
            return "";
          }

          return ""; // all other browsers
        } else {
          var plugins = navigator.plugins;
          var verreg = /([0-9]\.[0-9])/g;

          for (var i = 0; i < plugins.length; i++) {
            var plugin = plugins[i];

            for (var j = 0; j < pluginNames.length; j++) {
              if (plugin.name.indexOf(pluginNames[j]) !== -1) {
                if (verreg.test(plugin.name) || verreg.test(plugin.description)) {
                  return RegExp.$1;
                }
              }
            }
          }

          return "";
        }
      },

      /**
       * Internal helper for getting the availability of a given plugin.
       *
       * @param activeXName {String} The name which should be used to generate
       *   the test ActiveX Object.
       * @param pluginNames {Array} The names with which the plugins are listed in
       *   the navigator.plugins list.
       * @param forceActiveX {Boolean?false} Force detection using ActiveX
       *   for IE11 plugins that aren't listed in navigator.plugins
       * @return {Boolean} <code>true</code>, if the plugin available
       */
      __isAvailable: function __isAvailable(activeXName, pluginNames, forceActiveX) {
        // IE checks
        if (qx.bom.client.Engine.getName() == "mshtml" && (qx.bom.client.Browser.getDocumentMode() < 11 || forceActiveX)) {
          if (!this.getActiveX()) {
            return false;
          }

          try {
            new ActiveXObject(activeXName);
          } catch (ex) {
            return false;
          }

          return true; // all other
        } else {
          var plugins = navigator.plugins;

          if (!plugins) {
            return false;
          }

          var name;

          for (var i = 0; i < plugins.length; i++) {
            name = plugins[i].name;

            for (var j = 0; j < pluginNames.length; j++) {
              if (name.indexOf(pluginNames[j]) !== -1) {
                return true;
              }
            }
          }

          return false;
        }
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("plugin.gears", statics.getGears);
      qx.core.Environment.add("plugin.quicktime", statics.getQuicktime);
      qx.core.Environment.add("plugin.quicktime.version", statics.getQuicktimeVersion);
      qx.core.Environment.add("plugin.windowsmedia", statics.getWindowsMedia);
      qx.core.Environment.add("plugin.windowsmedia.version", statics.getWindowsMediaVersion);
      qx.core.Environment.add("plugin.divx", statics.getDivX);
      qx.core.Environment.add("plugin.divx.version", statics.getDivXVersion);
      qx.core.Environment.add("plugin.silverlight", statics.getSilverlight);
      qx.core.Environment.add("plugin.silverlight.version", statics.getSilverlightVersion);
      qx.core.Environment.add("plugin.pdf", statics.getPdf);
      qx.core.Environment.add("plugin.pdf.version", statics.getPdfVersion);
      qx.core.Environment.add("plugin.activex", statics.getActiveX);
      qx.core.Environment.add("plugin.skype", statics.getSkype);
    }
  });
  qx.bom.client.Plugin.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Plugin": {
        "defer": "runtime"
      },
      "qx.bom.client.Xml": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "plugin.activex": {
          "className": "qx.bom.client.Plugin",
          "defer": true
        },
        "xml.implementation": {
          "className": "qx.bom.client.Xml"
        },
        "xml.domparser": {
          "className": "qx.bom.client.Xml"
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
   * Cross browser XML document creation API
   *
   * The main purpose of this class is to allow you to create XML document objects in a
   * cross-browser fashion. Use <code>create</code> to create an empty document,
   * <code>fromString</code> to create one from an existing XML text. Both methods
   * return a *native DOM object*. That means you use standard DOM methods on such
   * an object (e.g. <code>createElement</code>).
   *
   * The following links provide further information on XML documents:
   *
   * * <a href="http://www.w3.org/TR/DOM-Level-2-Core/core.html#i-Document">W3C Interface Specification</a>
   * * <a href="http://msdn2.microsoft.com/en-us/library/ms535918.aspx">MS xml Object</a>
   * * <a href="http://msdn2.microsoft.com/en-us/library/ms764622.aspx">MSXML GUIDs and ProgIDs</a>
   * * <a href="https://developer.mozilla.org/en-US/docs/Parsing_and_serializing_XML">MDN Parsing and Serializing XML</a>
   */
  qx.Bootstrap.define("qx.xml.Document", {
    statics: {
      /** @type {String} ActiveX class name of DOMDocument (IE specific) */
      DOMDOC: null,

      /** @type {String} ActiveX class name of XMLHttpRequest (IE specific) */
      XMLHTTP: null,

      /**
       * Whether the given element is a XML document or element
       * which is part of a XML document.
       *
       * @param elem {Document|Element} Any DOM Document or Element
       * @return {Boolean} Whether the document is a XML document
       */
      isXmlDocument: function isXmlDocument(elem) {
        if (elem.nodeType === 9) {
          return elem.documentElement.nodeName !== "HTML";
        } else if (elem.ownerDocument) {
          return this.isXmlDocument(elem.ownerDocument);
        } else {
          return false;
        }
      },

      /**
       * Create an XML document.
       *
       * Returns a native DOM document object, set up for XML.
       *
       * @param namespaceUri {String ? null} The namespace URI of the document element to create or null.
       * @param qualifiedName {String ? null} The qualified name of the document element to be created or null.
       * @return {Document} empty XML object
       */
      create: function create(namespaceUri, qualifiedName) {
        // ActiveX - This is the preferred way for IE9 as well since it has no XPath
        // support when using the native implementation.createDocument
        if (qx.core.Environment.get("plugin.activex")) {
          var obj = new ActiveXObject(this.DOMDOC); //The SelectionLanguage property is no longer needed in MSXML 6; trying
          // to set it causes an exception in IE9.

          if (this.DOMDOC == "MSXML2.DOMDocument.3.0") {
            obj.setProperty("SelectionLanguage", "XPath");
          }

          if (qualifiedName) {
            var str = '<\?xml version="1.0" encoding="utf-8"?>\n<';
            str += qualifiedName;

            if (namespaceUri) {
              str += " xmlns='" + namespaceUri + "'";
            }

            str += " />";
            obj.loadXML(str);
          }

          return obj;
        }

        if (qx.core.Environment.get("xml.implementation")) {
          return document.implementation.createDocument(namespaceUri || "", qualifiedName || "", null);
        }

        throw new Error("No XML implementation available!");
      },

      /**
       * The string passed in is parsed into a DOM document.
       *
       * @param str {String} the string to be parsed
       * @return {Document} XML document with given content
       * @signature function(str)
       */
      fromString: function fromString(str) {
        // Legacy IE/ActiveX
        if (qx.core.Environment.get("plugin.activex")) {
          var dom = qx.xml.Document.create();
          dom.loadXML(str);
          return dom;
        }

        if (qx.core.Environment.get("xml.domparser")) {
          var parser = new DOMParser();
          return parser.parseFromString(str, "text/xml");
        }

        throw new Error("No XML implementation available!");
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      // Detecting available ActiveX implementations.
      if (qx.core.Environment.get("plugin.activex")) {
        // According to information on the Microsoft XML Team's WebLog
        // it is recommended to check for availability of MSXML versions 6.0 and 3.0.
        // http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
        var domDoc = ["MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.3.0"];
        var httpReq = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0"];

        for (var i = 0, l = domDoc.length; i < l; i++) {
          try {
            // Keep both objects in sync with the same version.
            // This is important as there were compatibility issues detected.
            new ActiveXObject(domDoc[i]);
            new ActiveXObject(httpReq[i]);
          } catch (ex) {
            continue;
          } // Update static constants


          statics.DOMDOC = domDoc[i];
          statics.XMLHTTP = httpReq[i]; // Stop loop here

          break;
        }
      }
    }
  });
  qx.xml.Document.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.Selection": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.selection": {
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
       * Alexander Steitz (aback)
  
  ************************************************************************ */

  /**
   * Low-level Range API which is used together with the low-level Selection API.
   * This is especially useful whenever a developer want to work on text level,
   * e.g. for an editor.
   */
  qx.Bootstrap.define("qx.bom.Range", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the range object of the given node.
       *
       * @signature function(node)
       * @param node {Node} node to get the range of
       * @return {Range} valid range of given selection
       */
      get: qx.core.Environment.select("html.selection", {
        "selection": function selection(node) {
          // check for the type of the given node
          // for legacy IE the nodes input, textarea, button and body
          // have access to own TextRange objects. Everything else is
          // gathered via the selection object.
          if (qx.dom.Node.isElement(node)) {
            switch (node.nodeName.toLowerCase()) {
              case "input":
                switch (node.type) {
                  case "text":
                  case "password":
                  case "hidden":
                  case "button":
                  case "reset":
                  case "file":
                  case "submit":
                    return node.createTextRange();

                  default:
                    return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
                }

                break;

              case "textarea":
              case "body":
              case "button":
                return node.createTextRange();

              default:
                return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
            }
          } else {
            if (node == null) {
              node = window;
            } // need to pass the document node to work with multi-documents


            return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
          }
        },
        // suitable for gecko, opera and webkit
        "default": function _default(node) {
          var doc = qx.dom.Node.getDocument(node); // get the selection object of the corresponding document

          var sel = qx.bom.Selection.getSelectionObject(doc);

          if (sel.rangeCount > 0) {
            return sel.getRangeAt(0);
          } else {
            return doc.createRange();
          }
        }
      })
    }
  });
  qx.bom.Range.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Event": {
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.event.Registration": {},
      "qx.event.handler.DragDrop": {}
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
   * Event object class for drag events
   */
  qx.Class.define("qx.event.type.Drag", {
    extend: qx.event.type.Event,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param cancelable {Boolean?false} Whether or not an event can have its default
       *     action prevented. The default action can either be the browser's
       *     default action of a native event (e.g. open the context menu on a
       *     right click) or the default action of a qooxdoo class (e.g. close
       *     the window widget). The default action can be prevented by calling
       *     {@link qx.event.type.Event#preventDefault}
       * @param originalEvent {qx.event.type.Track} The original (mouse) event to use
       * @return {qx.event.type.Event} The initialized event instance
       */
      init: function init(cancelable, originalEvent) {
        qx.event.type.Drag.prototype.init.base.call(this, true, cancelable);

        if (originalEvent) {
          this._native = originalEvent.getNativeEvent() || null;
          this._originalTarget = originalEvent.getOriginalTarget() || null;
        } else {
          this._native = null;
          this._originalTarget = null;
        }

        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.Drag.prototype.clone.base.call(this, embryo);
        clone._native = this._native;
        return clone;
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Integer} The horizontal mouse position in the document.
       */
      getDocumentLeft: function getDocumentLeft() {
        if (this._native == null) {
          return 0;
        }

        var x = this._native.pageX;

        if (x !== undefined) {
          // iOS 6 does not copy pageX over to the fake pointer event
          if (x == 0 && this._native.pointerType == "touch") {
            x = this._native._original.changedTouches[0].pageX || 0;
          }

          return Math.round(x);
        } else {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(win);
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
        if (this._native == null) {
          return 0;
        }

        var y = this._native.pageY;

        if (y !== undefined) {
          // iOS 6 does not copy pageY over to the fake pointer event
          if (y == 0 && this._native.pointerType == "touch") {
            y = this._native._original.changedTouches[0].pageY || 0;
          }

          return Math.round(y);
        } else {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(win);
        }
      },

      /**
       * Returns the drag&drop event handler responsible for the target
       *
       * @return {qx.event.handler.DragDrop} The drag&drop handler
       */
      getManager: function getManager() {
        return qx.event.Registration.getManager(this.getTarget()).getHandler(qx.event.handler.DragDrop);
      },

      /**
       * Used during <code>dragstart</code> listener to
       * inform the manager about supported data types.
       *
       * @param type {String} Data type to add to list of supported types
       */
      addType: function addType(type) {
        this.getManager().addType(type);
      },

      /**
       * Used during <code>dragstart</code> listener to
       * inform the manager about supported drop actions.
       *
       * @param action {String} Action to add to the list of supported actions
       */
      addAction: function addAction(action) {
        this.getManager().addAction(action);
      },

      /**
       * Whether the given type is supported by the drag
       * target (source target).
       *
       * This is used in the event listeners for <code>dragover</code>
       * or <code>dragdrop</code>.
       *
       * @param type {String} The type to look for
       * @return {Boolean} Whether the given type is supported
       */
      supportsType: function supportsType(type) {
        return this.getManager().supportsType(type);
      },

      /**
       * Whether the given action is supported by the drag
       * target (source target).
       *
       * This is used in the event listeners for <code>dragover</code>
       * or <code>dragdrop</code>.
       *
       * @param action {String} The action to look for
       * @return {Boolean} Whether the given action is supported
       */
      supportsAction: function supportsAction(action) {
        return this.getManager().supportsAction(action);
      },

      /**
       * Adds data of the given type to the internal storage. The data
       * is available until the <code>dragend</code> event is fired.
       *
       * @param type {String} Any valid type
       * @param data {var} Any data to store
       */
      addData: function addData(type, data) {
        this.getManager().addData(type, data);
      },

      /**
       * Returns the data of the given type. Used in the <code>drop</code> listener.
       * 
       * Note that this is a synchronous method and if any of the drag and drop 
       * events handlers are implemented using Promises, this may fail; @see
       * `getDataAsync`.
       *
       * @param type {String} Any of the supported types.
       * @return {var} The data for the given type
       */
      getData: function getData(type) {
        return this.getManager().getData(type);
      },

      /**
       * Returns the data of the given type. Used in the <code>drop</code> listener.
       * 
       * @param type {String} Any of the supported types.
       * @return {qx.Promise|var} The data for the given type
       */
      getDataAsync: function getDataAsync(type) {
        return this.getManager().getDataAsync(type);
      },

      /**
       * Returns the type which was requested last, to be used
       * in the <code>droprequest</code> listener.
       *
       * @return {String} The last requested data type
       */
      getCurrentType: function getCurrentType() {
        return this.getManager().getCurrentType();
      },

      /**
       * Returns the currently selected action. Depends on the
       * supported actions of the source target and the modification
       * keys pressed by the user.
       *
       * Used in the <code>droprequest</code> listener.
       *
       * @return {String} The action. May be one of <code>move</code>,
       *    <code>copy</code> or <code>alias</code>.
       */
      getCurrentAction: function getCurrentAction() {
        if (this.getDefaultPrevented()) {
          return null;
        }

        return this.getManager().getCurrentAction();
      },

      /**
       * Returns the currently selected action. Depends on the
       * supported actions of the source target and the modification
       * keys pressed by the user.
       *
       * Used in the <code>droprequest</code> listener.
       *
       * @return {qx.Promise|String} The action. May be one of <code>move</code>,
       *    <code>copy</code> or <code>alias</code>.
       */
      getCurrentActionAsync: function getCurrentActionAsync() {
        if (this.getDefaultPrevented()) {
          return null;
        }

        return this.getManager().getCurrentActionAsync();
      },

      /**
       * Whether the current drop target allows the current drag target.
       *
       * This can be called from within the "drag" event to enable/disable
       * a drop target selectively, for example based on the child item,
       * above and beyond the one-time choice made by the the "dragover"
       * event for the droppable widget itself.
       *
       * @param isAllowed {Boolean} False if a drop should be disallowed
       */
      setDropAllowed: function setDropAllowed(isAllowed) {
        this.getManager().setDropAllowed(isAllowed);
      },

      /**
       * Returns the target which has been initially tapped on.
       * @return {qx.ui.core.Widget} The tapped widget.
       */
      getDragTarget: function getDragTarget() {
        return this.getManager().getDragTarget();
      },

      /**
       * Stops the drag&drop session and fires a <code>dragend</code> event.
       */
      stopSession: function stopSession() {
        this.getManager().clearSession();
      }
    }
  });
  qx.event.type.Drag.$$dbClassInfo = $$dbClassInfo;
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
      "qx.theme.manager.Color": {
        "construct": true
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
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The blocker element is used to block interaction with the application.
   *
   * It is usually transparent or semi-transparent and blocks all events from
   * the underlying elements.
   */
  qx.Class.define("qx.html.Blocker", {
    extend: qx.html.Element,

    /**
     * @param backgroundColor {Color?null} the blocker's background color. This
     *    color can be themed and will be resolved by the blocker.
     * @param opacity {Number?0} The blocker's opacity
     */
    construct: function construct(backgroundColor, opacity) {
      var backgroundColor = backgroundColor ? qx.theme.manager.Color.getInstance().resolve(backgroundColor) : null;
      var styles = {
        position: "absolute",
        opacity: opacity || 0,
        backgroundColor: backgroundColor
      }; // IE needs some extra love here to convince it to block events.

      if (qx.core.Environment.get("engine.name") == "mshtml") {
        styles.backgroundImage = "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")";
        styles.backgroundRepeat = "repeat";
      }

      qx.html.Element.constructor.call(this, "div", styles);
      this.addListener("mousedown", this._stopPropagation, this);
      this.addListener("mouseup", this._stopPropagation, this);
      this.addListener("click", this._stopPropagation, this);
      this.addListener("dblclick", this._stopPropagation, this);
      this.addListener("mousemove", this._stopPropagation, this);
      this.addListener("mouseover", this._stopPropagation, this);
      this.addListener("mouseout", this._stopPropagation, this);
      this.addListener("mousewheel", this._stopPropagation, this);
      this.addListener("roll", this._stopPropagation, this);
      this.addListener("contextmenu", this._stopPropagation, this);
      this.addListener("pointerdown", this._stopPropagation, this);
      this.addListener("pointerup", this._stopPropagation, this);
      this.addListener("pointermove", this._stopPropagation, this);
      this.addListener("pointerover", this._stopPropagation, this);
      this.addListener("pointerout", this._stopPropagation, this);
      this.addListener("tap", this._stopPropagation, this);
      this.addListener("dbltap", this._stopPropagation, this);
      this.addListener("swipe", this._stopPropagation, this);
      this.addListener("longtap", this._stopPropagation, this);
      this.addListener("appear", this.__refreshCursor, this);
      this.addListener("disappear", this.__refreshCursor, this);
    },
    members: {
      /**
       * Stop the event propagation from the passed event.
       *
       * @param e {qx.event.type.Mouse} mouse event to stop propagation.
       */
      _stopPropagation: function _stopPropagation(e) {
        e.stopPropagation();
      },

      /**
       * Refreshes the cursor by setting it to <code>null</code> and then to the
       * old value.
       */
      __refreshCursor: function __refreshCursor() {
        var currentCursor = this.getStyle("cursor");
        this.setStyle("cursor", null, true);
        this.setStyle("cursor", currentCursor, true);
      }
    }
  });
  qx.html.Blocker.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.manager.Decoration": {}
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
   * Common set of utility methods used by the standard qooxdoo layouts.
   *
   * @internal
   */
  qx.Class.define("qx.ui.layout.Util", {
    statics: {
      /** @type {RegExp} Regular expression to match percent values */
      PERCENT_VALUE: /[0-9]+(?:\.[0-9]+)?%/,

      /**
       * Computes the flex offsets needed to reduce the space
       * difference as much as possible by respecting the
       * potential of the given elements (being in the range of
       * their min/max values)
       *
       * @param flexibles {Map} Each entry must have these keys:
       *   <code>id</code>, <code>potential</code> and <code>flex</code>.
       *   The ID is used in the result map as the key for the user to work
       *   with later (e.g. upgrade sizes etc. to respect the given offset)
       *   The potential is an integer value which is the difference of the
       *   currently interesting direction (e.g. shrinking=width-minWidth, growing=
       *   maxWidth-width). The flex key holds the flex value of the item.
       * @param avail {Integer} Full available space to allocate (ignoring used one)
       * @param used {Integer} Size of already allocated space
       * @return {Map} A map which contains the calculated offsets under the key
       *   which is identical to the ID given in the incoming map.
       */
      computeFlexOffsets: function computeFlexOffsets(flexibles, avail, used) {
        var child, key, flexSum, flexStep;
        var grow = avail > used;
        var remaining = Math.abs(avail - used);
        var roundingOffset, currentOffset; // Preprocess data

        var result = {};

        for (key in flexibles) {
          child = flexibles[key];
          result[key] = {
            potential: grow ? child.max - child.value : child.value - child.min,
            flex: grow ? child.flex : 1 / child.flex,
            offset: 0
          };
        } // Continue as long as we need to do anything


        while (remaining != 0) {
          // Find minimum potential for next correction
          flexStep = Infinity;
          flexSum = 0;

          for (key in result) {
            child = result[key];

            if (child.potential > 0) {
              flexSum += child.flex;
              flexStep = Math.min(flexStep, child.potential / child.flex);
            }
          } // No potential found, quit here


          if (flexSum == 0) {
            break;
          } // Respect maximum potential given through remaining space
          // The parent should always win in such conflicts.


          flexStep = Math.min(remaining, flexStep * flexSum) / flexSum; // Start with correction

          roundingOffset = 0;

          for (key in result) {
            child = result[key];

            if (child.potential > 0) {
              // Compute offset for this step
              currentOffset = Math.min(remaining, child.potential, Math.ceil(flexStep * child.flex)); // Fix rounding issues

              roundingOffset += currentOffset - flexStep * child.flex;

              if (roundingOffset >= 1) {
                roundingOffset -= 1;
                currentOffset -= 1;
              } // Update child status


              child.potential -= currentOffset;

              if (grow) {
                child.offset += currentOffset;
              } else {
                child.offset -= currentOffset;
              } // Update parent status


              remaining -= currentOffset;
            }
          }
        }

        return result;
      },

      /**
       * Computes the offset which needs to be added to the top position
       * to result in the stated vertical alignment. Also respects
       * existing margins (without collapsing).
       *
       * @param align {String} One of <code>top</code>, <code>center</code> or <code>bottom</code>.
       * @param width {Integer} The visible width of the widget
       * @param availWidth {Integer} The available inner width of the parent
       * @param marginLeft {Integer?0} Optional left margin of the widget
       * @param marginRight {Integer?0} Optional right margin of the widget
       * @return {Integer} Computed top coordinate
       */
      computeHorizontalAlignOffset: function computeHorizontalAlignOffset(align, width, availWidth, marginLeft, marginRight) {
        if (marginLeft == null) {
          marginLeft = 0;
        }

        if (marginRight == null) {
          marginRight = 0;
        }

        var value = 0;

        switch (align) {
          case "left":
            value = marginLeft;
            break;

          case "right":
            // Align right changes priority to right edge:
            // To align to the right is more important here than to left.
            value = availWidth - width - marginRight;
            break;

          case "center":
            // Ideal center position
            value = Math.round((availWidth - width) / 2); // Try to make this possible (with left-right priority)

            if (value < marginLeft) {
              value = marginLeft;
            } else if (value < marginRight) {
              value = Math.max(marginLeft, availWidth - width - marginRight);
            }

            break;
        }

        return value;
      },

      /**
       * Computes the offset which needs to be added to the top position
       * to result in the stated vertical alignment. Also respects
       * existing margins (without collapsing).
       *
       * @param align {String} One of <code>top</code>, <code>middle</code> or <code>bottom</code>.
       * @param height {Integer} The visible height of the widget
       * @param availHeight {Integer} The available inner height of the parent
       * @param marginTop {Integer?0} Optional top margin of the widget
       * @param marginBottom {Integer?0} Optional bottom margin of the widget
       * @return {Integer} Computed top coordinate
       */
      computeVerticalAlignOffset: function computeVerticalAlignOffset(align, height, availHeight, marginTop, marginBottom) {
        if (marginTop == null) {
          marginTop = 0;
        }

        if (marginBottom == null) {
          marginBottom = 0;
        }

        var value = 0;

        switch (align) {
          case "top":
            value = marginTop;
            break;

          case "bottom":
            // Align bottom changes priority to bottom edge:
            // To align to the bottom is more important here than to top.
            value = availHeight - height - marginBottom;
            break;

          case "middle":
            // Ideal middle position
            value = Math.round((availHeight - height) / 2); // Try to make this possible (with top-down priority)

            if (value < marginTop) {
              value = marginTop;
            } else if (value < marginBottom) {
              value = Math.max(marginTop, availHeight - height - marginBottom);
            }

            break;
        }

        return value;
      },

      /**
       * Collapses two margins.
       *
       * Supports positive and negative margins.
       * Collapsing find the largest positive and the largest
       * negative value. Afterwards the result is computed through the
       * subtraction of the negative from the positive value.
       *
       * @param varargs {arguments} Any number of configured margins
       * @return {Integer} The collapsed margin
       */
      collapseMargins: function collapseMargins(varargs) {
        var max = 0,
            min = 0;

        for (var i = 0, l = arguments.length; i < l; i++) {
          var value = arguments[i];

          if (value < 0) {
            min = Math.min(min, value);
          } else if (value > 0) {
            max = Math.max(max, value);
          }
        }

        return max + min;
      },

      /**
       * Computes the sum of all horizontal gaps. Normally the
       * result is used to compute the available width in a widget.
       *
       * The method optionally respects margin collapsing as well. In
       * this mode the spacing is collapsed together with the margins.
       *
       * @param children {Array} List of children
       * @param spacing {Integer?0} Spacing between every child
       * @param collapse {Boolean?false} Optional margin collapsing mode
       * @return {Integer} Sum of all gaps in the final layout.
       */
      computeHorizontalGaps: function computeHorizontalGaps(children, spacing, collapse) {
        if (spacing == null) {
          spacing = 0;
        }

        var gaps = 0;

        if (collapse) {
          // Add first child
          gaps += children[0].getMarginLeft();

          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += this.collapseMargins(spacing, children[i - 1].getMarginRight(), children[i].getMarginLeft());
          } // Add last child


          gaps += children[l - 1].getMarginRight();
        } else {
          // Simple adding of all margins
          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += children[i].getMarginLeft() + children[i].getMarginRight();
          } // Add spacing


          gaps += spacing * (l - 1);
        }

        return gaps;
      },

      /**
       * Computes the sum of all vertical gaps. Normally the
       * result is used to compute the available height in a widget.
       *
       * The method optionally respects margin collapsing as well. In
       * this mode the spacing is collapsed together with the margins.
       *
       * @param children {Array} List of children
       * @param spacing {Integer?0} Spacing between every child
       * @param collapse {Boolean?false} Optional margin collapsing mode
       * @return {Integer} Sum of all gaps in the final layout.
       */
      computeVerticalGaps: function computeVerticalGaps(children, spacing, collapse) {
        if (spacing == null) {
          spacing = 0;
        }

        var gaps = 0;

        if (collapse) {
          // Add first child
          gaps += children[0].getMarginTop();

          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += this.collapseMargins(spacing, children[i - 1].getMarginBottom(), children[i].getMarginTop());
          } // Add last child


          gaps += children[l - 1].getMarginBottom();
        } else {
          // Simple adding of all margins
          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += children[i].getMarginTop() + children[i].getMarginBottom();
          } // Add spacing


          gaps += spacing * (l - 1);
        }

        return gaps;
      },

      /**
       * Computes the gaps together with the configuration of separators.
       *
       * @param children {qx.ui.core.LayoutItem[]} List of children
       * @param spacing {Integer} Configured spacing
       * @param separator {String|qx.ui.decoration.IDecorator} Separator to render
       * @return {Integer} Sum of gaps
       */
      computeHorizontalSeparatorGaps: function computeHorizontalSeparatorGaps(children, spacing, separator) {
        var instance = qx.theme.manager.Decoration.getInstance().resolve(separator);
        var insets = instance.getInsets();
        var width = insets.left + insets.right;
        var gaps = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          gaps += child.getMarginLeft() + child.getMarginRight();
        }

        gaps += (spacing + width + spacing) * (l - 1);
        return gaps;
      },

      /**
       * Computes the gaps together with the configuration of separators.
       *
       * @param children {qx.ui.core.LayoutItem[]} List of children
       * @param spacing {Integer} Configured spacing
       * @param separator {String|qx.ui.decoration.IDecorator} Separator to render
       * @return {Integer} Sum of gaps
       */
      computeVerticalSeparatorGaps: function computeVerticalSeparatorGaps(children, spacing, separator) {
        var instance = qx.theme.manager.Decoration.getInstance().resolve(separator);
        var insets = instance.getInsets();
        var height = insets.top + insets.bottom;
        var gaps = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          gaps += child.getMarginTop() + child.getMarginBottom();
        }

        gaps += (spacing + height + spacing) * (l - 1);
        return gaps;
      },

      /**
       * Arranges two sizes in one box to best respect their individual limitations.
       *
       * Mainly used by split layouts (Split Panes) where the layout is mainly defined
       * by the outer dimensions.
       *
       * @param beginMin {Integer} Minimum size of first widget (from size hint)
       * @param beginIdeal {Integer} Ideal size of first widget (maybe after dragging the splitter)
       * @param beginMax {Integer} Maximum size of first widget (from size hint)
       * @param endMin {Integer} Minimum size of second widget (from size hint)
       * @param endIdeal {Integer} Ideal size of second widget (maybe after dragging the splitter)
       * @param endMax {Integer} Maximum size of second widget (from size hint)
       * @return {Map} Map with the keys <code>begin</code and <code>end</code> with the
       *   arranged dimensions.
       */
      arrangeIdeals: function arrangeIdeals(beginMin, beginIdeal, beginMax, endMin, endIdeal, endMax) {
        if (beginIdeal < beginMin || endIdeal < endMin) {
          if (beginIdeal < beginMin && endIdeal < endMin) {
            // Just increase both, can not rearrange them otherwise
            // Result into overflowing of the overlapping content
            // Should normally not happen through auto sizing!
            beginIdeal = beginMin;
            endIdeal = endMin;
          } else if (beginIdeal < beginMin) {
            // Reduce end, increase begin to min
            endIdeal -= beginMin - beginIdeal;
            beginIdeal = beginMin; // Re-check to keep min size of end

            if (endIdeal < endMin) {
              endIdeal = endMin;
            }
          } else if (endIdeal < endMin) {
            // Reduce begin, increase end to min
            beginIdeal -= endMin - endIdeal;
            endIdeal = endMin; // Re-check to keep min size of begin

            if (beginIdeal < beginMin) {
              beginIdeal = beginMin;
            }
          }
        }

        if (beginIdeal > beginMax || endIdeal > endMax) {
          if (beginIdeal > beginMax && endIdeal > endMax) {
            // Just reduce both, can not rearrange them otherwise
            // Leaves a blank area in the pane!
            beginIdeal = beginMax;
            endIdeal = endMax;
          } else if (beginIdeal > beginMax) {
            // Increase end, reduce begin to max
            endIdeal += beginIdeal - beginMax;
            beginIdeal = beginMax; // Re-check to keep max size of end

            if (endIdeal > endMax) {
              endIdeal = endMax;
            }
          } else if (endIdeal > endMax) {
            // Increase begin, reduce end to max
            beginIdeal += endIdeal - endMax;
            endIdeal = endMax; // Re-check to keep max size of begin

            if (beginIdeal > beginMax) {
              beginIdeal = beginMax;
            }
          }
        }

        return {
          begin: beginIdeal,
          end: endIdeal
        };
      }
    }
  });
  qx.ui.layout.Util.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-15.js.map
