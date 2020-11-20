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
   * A basic layout, which supports positioning of child widgets by absolute
   * left/top coordinates. This layout is very simple but should also
   * perform best.
   *
   * *Features*
   *
   * * Basic positioning using <code>left</code> and <code>top</code> properties
   * * Respects minimum and maximum dimensions without shrinking/growing
   * * Margins for top and left side (including negative ones)
   * * Respects right and bottom margins in the size hint
   * * Auto-sizing
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>left</strong> <em>(Integer)</em>: The left coordinate in pixel</li>
   * <li><strong>top</strong> <em>(Integer)</em>: The top coordinate in pixel</li>
   * </ul>
   *
   * *Details*
   *
   * The default location of any widget is zero for both
   * <code>left</code> and <code>top</code>.
   *
   * *Example*
   *
   * Here is a little example of how to use the basic layout.
   *
   * <pre class="javascript">
   * var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
   *
   * // simple positioning
   * container.add(new qx.ui.core.Widget(), {left: 10, top: 10});
   * container.add(new qx.ui.core.Widget(), {left: 100, top: 50});
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/basic.html'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Basic", {
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
        this.assert(name == "left" || name == "top", "The property '" + name + "' is not supported by the Basic layout!");
        this.assertInteger(value);
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child, size, props, left, top; // Render children

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          props = child.getLayoutProperties();
          left = padding.left + (props.left || 0) + child.getMarginLeft();
          top = padding.top + (props.top || 0) + child.getMarginTop();
          child.renderLayout(left, top, size.width, size.height);
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var child, size, props;
        var neededWidth = 0,
            neededHeight = 0;
        var localWidth, localHeight; // Iterate over children

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          props = child.getLayoutProperties();
          localWidth = size.width + (props.left || 0) + child.getMarginLeft() + child.getMarginRight();
          localHeight = size.height + (props.top || 0) + child.getMarginTop() + child.getMarginBottom();

          if (localWidth > neededWidth) {
            neededWidth = localWidth;
          }

          if (localHeight > neededHeight) {
            neededHeight = localHeight;
          }
        } // Return hint


        return {
          width: neededWidth,
          height: neededHeight
        };
      }
    }
  });
  qx.ui.layout.Basic.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.util.ResourceManager": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * The background class contains methods to compute and set the background image
   * of a DOM element.
   *
   * It fixes a background position issue in Firefox 2.
   */
  qx.Class.define("qx.bom.element.Background", {
    statics: {
      /** @type {Array} Internal helper to improve compile performance */
      __tmpl: ["background-image:url(", null, ");", "background-position:", null, ";", "background-repeat:", null, ";"],

      /** @type {Map} Empty styles when no image is given */
      __emptyStyles: {
        backgroundImage: null,
        backgroundPosition: null,
        backgroundRepeat: null
      },

      /**
       * Computes the background position CSS value
       *
       * @param left {Integer|String} either an integer pixel value or a CSS
       *    string value
       * @param top {Integer|String} either an integer pixel value or a CSS
       *    string value
       * @return {String} The background position CSS value
       */
      __computePosition: function __computePosition(left, top) {
        // Correcting buggy Firefox background-position implementation
        // Have problems with identical values
        var engine = qx.core.Environment.get("engine.name");
        var version = qx.core.Environment.get("engine.version");

        if (engine == "gecko" && version < 1.9 && left == top && typeof left == "number") {
          top += 0.01;
        }

        if (left) {
          var leftCss = typeof left == "number" ? left + "px" : left;
        } else {
          leftCss = "0";
        }

        if (top) {
          var topCss = typeof top == "number" ? top + "px" : top;
        } else {
          topCss = "0";
        }

        return leftCss + " " + topCss;
      },

      /**
       * Compiles the background into a CSS compatible string.
       *
       * @param source {String?null} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer|String?null} The horizontal offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "center", "left" and "right"
       * @param top {Integer|String?null} The vertical offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "top", "bottom" and "center"
       * @return {String} CSS string
       */
      compile: function compile(source, repeat, left, top) {
        var position = this.__computePosition(left, top);

        var backgroundImageUrl = qx.util.ResourceManager.getInstance().toUri(source); // Updating template

        var tmpl = this.__tmpl;
        tmpl[1] = "'" + backgroundImageUrl + "'"; // Put in quotes so spaces work

        tmpl[4] = position;
        tmpl[7] = repeat;
        return tmpl.join("");
      },

      /**
       * Get standard css background styles
       *
       * @param source {String} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer|String?null} The horizontal offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "center", "left" and "right"
       * @param top {Integer|String?null} The vertical offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "top", "bottom" and "center"
       * @return {Map} A map of CSS styles
       */
      getStyles: function getStyles(source, repeat, left, top) {
        if (!source) {
          return this.__emptyStyles;
        }

        var position = this.__computePosition(left, top);

        var backgroundImageUrl = qx.util.ResourceManager.getInstance().toUri(source);
        var backgroundImageCssString = "url('" + backgroundImageUrl + "')"; // Put in quotes so spaces work

        var map = {
          backgroundPosition: position,
          backgroundImage: backgroundImageCssString
        };

        if (repeat != null) {
          map.backgroundRepeat = repeat;
        }

        return map;
      },

      /**
       * Set the background on the given DOM element
       *
       * @param element {Element} The element to modify
       * @param source {String?null} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer?null} The horizontal offset of the image inside of
       *     the image element.
       * @param top {Integer?null} The vertical offset of the image inside of
       *     the image element.
       */
      set: function set(element, source, repeat, left, top) {
        var styles = this.getStyles(source, repeat, left, top);

        for (var prop in styles) {
          element.style[prop] = styles[prop];
        }
      }
    }
  });
  qx.bom.element.Background.$$dbClassInfo = $$dbClassInfo;
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
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Abstract class to compute the position of an object on one axis.
   */
  qx.Bootstrap.define("qx.util.placement.AbstractAxis", {
    extend: Object,
    statics: {
      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       * @abstract
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        throw new Error("abstract method call!");
      },

      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: function _moveToEdgeAndAlign(size, target, offsets, position) {
        switch (position) {
          case "edge-start":
            return target.start - offsets.end - size;

          case "edge-end":
            return target.end + offsets.start;

          case "align-start":
            return target.start + offsets.start;

          case "align-center":
            return target.start + parseInt((target.end - target.start - size) / 2, 10) + offsets.start;

          case "align-end":
            return target.end - offsets.end - size;
        }
      },

      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: function _isInRange(start, size, areaSize) {
        return start >= 0 && start + size <= areaSize;
      }
    }
  });
  qx.util.placement.AbstractAxis.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object directly at the specified position. It is not moved if
   * parts of the object are outside of the axis' range.
   */
  qx.Bootstrap.define("qx.util.placement.DirectAxis", {
    statics: {
      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        return this._moveToEdgeAndAlign(size, target, offsets, position);
      }
    }
  });
  qx.util.placement.DirectAxis.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object to the target. If parts of the object are outside of the
   * range this class places the object at the best "edge", "alignment"
   * combination so that the overlap between object and range is maximized.
   */
  qx.Bootstrap.define("qx.util.placement.KeepAlignAxis", {
    statics: {
      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: qx.util.placement.AbstractAxis._isInRange,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        var start = this._moveToEdgeAndAlign(size, target, offsets, position);

        var range1End, range2Start;

        if (this._isInRange(start, size, areaSize)) {
          return start;
        }

        if (position == "edge-start" || position == "edge-end") {
          range1End = target.start - offsets.end;
          range2Start = target.end + offsets.start;
        } else {
          range1End = target.end - offsets.end;
          range2Start = target.start + offsets.start;
        }

        if (range1End > areaSize - range2Start) {
          start = Math.max(0, range1End - size);
        } else {
          start = range2Start;
        }

        return start;
      }
    }
  });
  qx.util.placement.KeepAlignAxis.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object according to the target. If parts of the object are outside
   * of the axis' range the object's start is adjusted so that the overlap between
   * the object and the axis is maximized.
   */
  qx.Bootstrap.define("qx.util.placement.BestFitAxis", {
    statics: {
      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: qx.util.placement.AbstractAxis._isInRange,

      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        var start = this._moveToEdgeAndAlign(size, target, offsets, position);

        if (this._isInRange(start, size, areaSize)) {
          return start;
        }

        if (start < 0) {
          start = Math.min(0, areaSize - size);
        }

        if (start + size > areaSize) {
          start = Math.max(0, areaSize - size);
        }

        return start;
      }
    }
  });
  qx.util.placement.BestFitAxis.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.ResourceManager": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.event.Timer": {},
      "qx.lang.Array": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.bom.Stylesheet": {},
      "qx.bom.webfonts.Validator": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "browser.name": {
          "className": "qx.bom.client.Browser"
        },
        "browser.version": {
          "className": "qx.bom.client.Browser"
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
  ************************************************************************ */

  /**
   * Manages font-face definitions, making sure that each rule is only applied
   * once. It supports adding fonts of the same family but with different style
   * and weight. For instance, the following declaration uses 4 different source
   * files and combine them in a single font family.
   *
   * <pre class='javascript'>
   *   sources: [
   *     {
   *       family: "Sansation",
   *       source: [
   *         "fonts/Sansation-Regular.ttf"
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontWeight: "bold",
   *       source: [
   *         "fonts/Sansation-Bold.ttf",
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontStyle: "italic",
   *       source: [
   *         "fonts/Sansation-Italic.ttf",
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontWeight: "bold",
   *       fontStyle: "italic",
   *       source: [
   *         "fonts/Sansation-BoldItalic.ttf",
   *       ]
   *     }
   *   ]
   * </pre>
   * 
   * This class does not need to be disposed, except when you want to abort the loading
   * and validation process.
   */
  qx.Class.define("qx.bom.webfonts.Manager", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__createdStyles = [];
      this.__validators = {};
      this.__queue = [];
      this.__preferredFormats = this.getPreferredFormats();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * List of known font definition formats (i.e. file extensions). Used to
       * identify the type of each font file configured for a web font.
       */
      FONT_FORMATS: ["eot", "woff", "ttf", "svg"],

      /**
       * Timeout (in ms) to wait before deciding that a web font was not loaded.
       */
      VALIDATION_TIMEOUT: 5000
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __createdStyles: null,
      __styleSheet: null,
      __validators: null,
      __preferredFormats: null,
      __queue: null,
      __queueInterval: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Adds the necessary font-face rule for a web font to the document. Also
       * creates a web font Validator ({@link qx.bom.webfonts.Validator}) that
       * checks if the webFont was applied correctly.
       *
       * @param familyName {String} Name of the web font
       * @param sourcesList {Object} List of source URLs along with their style
       * (e.g. fontStyle: "italic") and weight (e.g. fontWeight: "bold").
       * For maximum compatibility, this should include EOT, WOFF and TTF versions
       * of the font.
       * @param callback {Function?} Optional event listener callback that will be
       * executed once the validator has determined whether the webFont was
       * applied correctly.
       * See {@link qx.bom.webfonts.Validator#changeStatus}
       * @param context {Object?} Optional context for the callback function
       */
      require: function require(familyName, sourcesList, callback, context) {
        var sourceUrls = sourcesList.source;
        var comparisonString = sourcesList.comparisonString;
        var version = sourcesList.version;
        var fontWeight = sourcesList.fontWeight;
        var fontStyle = sourcesList.fontStyle;
        var sources = [];

        for (var i = 0, l = sourceUrls.length; i < l; i++) {
          var split = sourceUrls[i].split("#");
          var src = qx.util.ResourceManager.getInstance().toUri(split[0]);

          if (split.length > 1) {
            src = src + "#" + split[1];
          }

          sources.push(src);
        } // old IEs need a break in between adding @font-face rules


        if (qx.core.Environment.get("engine.name") == "mshtml" && (parseInt(qx.core.Environment.get("engine.version")) < 9 || qx.core.Environment.get("browser.documentmode") < 9)) {
          if (!this.__queueInterval) {
            this.__queueInterval = new qx.event.Timer(100);

            this.__queueInterval.addListener("interval", this.__flushQueue, this);
          }

          if (!this.__queueInterval.isEnabled()) {
            this.__queueInterval.start();
          }

          this.__queue.push([familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context]);
        } else {
          this.__require(familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context);
        }
      },

      /**
       * Removes a font's font-face definition from the style sheet. This means
       * the font will no longer be available and any elements using it will
       * fall back to the their regular font-families.
       *
       * @param familyName {String} font-family name
       * @param fontWeight {String} the font-weight.
       * @param fontStyle {String} the font-style.
       */
      remove: function remove(familyName, fontWeight, fontStyle) {
        var fontLookupKey = this.__createFontLookupKey(familyName, fontWeight, fontStyle);

        var index = null;

        for (var i = 0, l = this.__createdStyles.length; i < l; i++) {
          if (this.__createdStyles[i] == fontLookupKey) {
            index = i;

            this.__removeRule(familyName, fontWeight, fontStyle);

            break;
          }
        }

        if (index !== null) {
          qx.lang.Array.removeAt(this.__createdStyles, index);
        }

        if (familyName in this.__validators) {
          this.__validators[familyName].dispose();

          delete this.__validators[familyName];
        }
      },

      /**
       * Returns the preferred font format(s) for the currently used browser. Some
       * browsers support multiple formats, e.g. WOFF and TTF or WOFF and EOT. In
       * those cases, WOFF is considered the preferred format.
       *
       * @return {String[]} List of supported font formats ordered by preference
       * or empty Array if none could be determined
       */
      getPreferredFormats: function getPreferredFormats() {
        var preferredFormats = [];
        var browser = qx.core.Environment.get("browser.name");
        var browserVersion = qx.core.Environment.get("browser.version");
        var os = qx.core.Environment.get("os.name");
        var osVersion = qx.core.Environment.get("os.version");

        if (browser == "ie" && qx.core.Environment.get("browser.documentmode") >= 9 || browser == "firefox" && browserVersion >= 3.6 || browser == "chrome" && browserVersion >= 6) {
          preferredFormats.push("woff");
        }

        if (browser == "opera" && browserVersion >= 10 || browser == "safari" && browserVersion >= 3.1 || browser == "firefox" && browserVersion >= 3.5 || browser == "chrome" && browserVersion >= 4 || browser == "mobile safari" && os == "ios" && osVersion >= 4.2) {
          preferredFormats.push("ttf");
        }

        if (browser == "ie" && browserVersion >= 4) {
          preferredFormats.push("eot");
        }

        if (browser == "mobileSafari" && os == "ios" && osVersion >= 4.1) {
          preferredFormats.push("svg");
        }

        return preferredFormats;
      },

      /**
       * Removes the styleSheet element used for all web font definitions from the
       * document. This means all web fonts declared by the manager will no longer
       * be available and elements using them will fall back to their regular
       * font-families
       */
      removeStyleSheet: function removeStyleSheet() {
        this.__createdStyles = [];

        if (this.__styleSheet) {
          qx.bom.Stylesheet.removeSheet(this.__styleSheet);
        }

        this.__styleSheet = null;
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE API
      ---------------------------------------------------------------------------
      */

      /**
       * Creates a lookup key to index the created fonts.
       * @param familyName {String} font-family name
       * @param fontWeight {String} the font-weight.
       * @param fontStyle {String} the font-style.
       * @return {string} the font lookup key
       */
      __createFontLookupKey: function __createFontLookupKey(familyName, fontWeight, fontStyle) {
        var lookupKey = familyName + "_" + (fontWeight ? fontWeight : "normal") + "_" + (fontStyle ? fontStyle : "normal");
        return lookupKey;
      },

      /**
       * Does the actual work of adding stylesheet rules and triggering font
       * validation
       *
       * @param familyName {String} Name of the web font
       * @param sources {String[]} List of source URLs. For maximum compatibility,
       * this should include EOT, WOFF and TTF versions of the font.
       * @param fontWeight {String} the web font should be registered using a
       * fontWeight font weight.
       * @param fontStyle {String} the web font should be registered using an
       * fontStyle font style.
       * @param comparisonString {String} String to check whether the font has loaded or not
       * @param version {String?} Optional version that is appended to the font URL to be able to override caching
       * @param callback {Function?} Optional event listener callback that will be
       * executed once the validator has determined whether the webFont was
       * applied correctly.
       * @param context {Object?} Optional context for the callback function
       */
      __require: function __require(familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context) {
        var fontLookupKey = this.__createFontLookupKey(familyName, fontWeight, fontStyle);

        if (!this.__createdStyles.includes(fontLookupKey)) {
          var sourcesMap = this.__getSourcesMap(sources);

          var rule = this.__getRule(familyName, fontWeight, fontStyle, sourcesMap, version);

          if (!rule) {
            throw new Error("Couldn't create @font-face rule for WebFont " + familyName + "!");
          }

          if (!this.__styleSheet) {
            this.__styleSheet = qx.bom.Stylesheet.createElement();
          }

          try {
            this.__addRule(rule);
          } catch (ex) {
            {
              this.warn("Error while adding @font-face rule:", ex.message);
              return;
            }
          }

          this.__createdStyles.push(fontLookupKey);
        }

        if (!this.__validators[familyName]) {
          this.__validators[familyName] = new qx.bom.webfonts.Validator(familyName, comparisonString);

          this.__validators[familyName].setTimeout(qx.bom.webfonts.Manager.VALIDATION_TIMEOUT);

          this.__validators[familyName].addListenerOnce("changeStatus", this.__onFontChangeStatus, this);
        }

        if (callback) {
          var cbContext = context || window;

          this.__validators[familyName].addListenerOnce("changeStatus", callback, cbContext);
        }

        this.__validators[familyName].validate();
      },

      /**
       * Processes the next item in the queue
       */
      __flushQueue: function __flushQueue() {
        if (this.__queue.length == 0) {
          this.__queueInterval.stop();

          return;
        }

        var next = this.__queue.shift();

        this.__require.apply(this, next);
      },

      /**
       * Removes the font-face declaration if a font could not be validated
       *
       * @param ev {qx.event.type.Data} qx.bom.webfonts.Validator#changeStatus
       */
      __onFontChangeStatus: function __onFontChangeStatus(ev) {
        var result = ev.getData();

        if (result.valid === false) {
          qx.event.Timer.once(function () {
            this.remove(result.family);
          }, this, 250);
        }
      },

      /**
       * Uses a naive regExp match to determine the format of each defined source
       * file for a webFont. Returns a map with the format names as keys and the
       * corresponding source URLs as values.
       *
       * @param sources {String[]} Array of source URLs
       * @return {Map} Map of formats and URLs
       */
      __getSourcesMap: function __getSourcesMap(sources) {
        var formats = qx.bom.webfonts.Manager.FONT_FORMATS;
        var sourcesMap = {};

        for (var i = 0, l = sources.length; i < l; i++) {
          var type = null;

          for (var x = 0; x < formats.length; x++) {
            var reg = new RegExp("\.(" + formats[x] + ")");
            var match = reg.exec(sources[i]);

            if (match) {
              type = match[1];
            }
          }

          if (type) {
            sourcesMap[type] = sources[i];
          }
        }

        return sourcesMap;
      },

      /**
       * Assembles the body of a font-face rule for a single webFont.
       *
       * @param familyName {String} Font-family name
       * @param fontWeight {String} the web font should be registered using a
       * fontWeight font weight.
       * @param fontStyle {String} the web font should be registered using an
       * fontStyle font style.
       * @param sourcesMap {Map} Map of font formats and sources
       * @param version {String?} Optional version to be appended to the URL
       * @return {String} The computed CSS rule
       */
      __getRule: function __getRule(familyName, fontWeight, fontStyle, sourcesMap, version) {
        var rules = [];
        var formatList = this.__preferredFormats.length > 0 ? this.__preferredFormats : qx.bom.webfonts.Manager.FONT_FORMATS;

        for (var i = 0, l = formatList.length; i < l; i++) {
          var format = formatList[i];

          if (sourcesMap[format]) {
            rules.push(this.__getSourceForFormat(format, sourcesMap[format], version));
          }
        }

        var rule = "src: " + rules.join(",\n") + ";";
        rule = "font-family: " + familyName + ";\n" + rule;
        rule = rule + "\nfont-style: " + (fontStyle ? fontStyle : "normal") + ";";
        rule = rule + "\nfont-weight: " + (fontWeight ? fontWeight : "normal") + ";";
        return rule;
      },

      /**
       * Returns the full src value for a given font URL depending on the type
        * @param format {String} The font format, one of eot, woff, ttf, svg
       * @param url {String} The font file's URL
       * @param version {String?} Optional version to be appended to the URL
       * @return {String} The src directive
       */
      __getSourceForFormat: function __getSourceForFormat(format, url, version) {
        if (version) {
          url += "?" + version;
        }

        switch (format) {
          case "eot":
            return "url('" + url + "');" + "src: url('" + url + "?#iefix') format('embedded-opentype')";

          case "woff":
            return "url('" + url + "') format('woff')";

          case "ttf":
            return "url('" + url + "') format('truetype')";

          case "svg":
            return "url('" + url + "') format('svg')";

          default:
            return null;
        }
      },

      /**
       * Adds a font-face rule to the document
       *
       * @param rule {String} The body of the CSS rule
       */
      __addRule: function __addRule(rule) {
        var completeRule = "@font-face {" + rule + "}\n";

        if (qx.core.Environment.get("browser.name") == "ie" && qx.core.Environment.get("browser.documentmode") < 9) {
          var cssText = this.__fixCssText(this.__styleSheet.cssText);

          cssText += completeRule;
          this.__styleSheet.cssText = cssText;
        } else {
          this.__styleSheet.insertRule(completeRule, this.__styleSheet.cssRules.length);
        }
      },

      /**
       * Removes the font-face declaration for the given font-family from the
       * stylesheet
       *
       * @param familyName {String} The font-family name
       * @param fontWeight {String} fontWeight font-weight.
       * @param fontStyle {String} fontStyle font-style.
       */
      __removeRule: function __removeRule(familyName, fontWeight, fontStyle) {
        // In IE and edge even if the rule was added with font-style first
        // and font-weight second, it is not guaranteed that the attributes
        // remain in that order. Therefore we check for both version,
        // style first, weight second and weight first, style second.
        // Without this fix the rule isn't found and removed reliable. 
        var regtext = "@font-face.*?" + familyName + "(.*font-style: *" + (fontStyle ? fontStyle : "normal") + ".*font-weight: *" + (fontWeight ? fontWeight : "normal") + ")|" + "(.*font-weight: *" + (fontWeight ? fontWeight : "normal") + ".*font-style: *" + (fontStyle ? fontStyle : "normal") + ")";
        var reg = new RegExp(regtext, "m");

        for (var i = 0, l = document.styleSheets.length; i < l; i++) {
          var sheet = document.styleSheets[i];

          if (sheet.cssText) {
            var cssText = sheet.cssText.replace(/\n/g, "").replace(/\r/g, "");
            cssText = this.__fixCssText(cssText);

            if (reg.exec(cssText)) {
              cssText = cssText.replace(reg, "");
            }

            sheet.cssText = cssText;
          } else if (sheet.cssRules) {
            for (var j = 0, m = sheet.cssRules.length; j < m; j++) {
              var cssText = sheet.cssRules[j].cssText.replace(/\n/g, "").replace(/\r/g, "");

              if (reg.exec(cssText)) {
                this.__styleSheet.deleteRule(j);

                return;
              }
            }
          }
        }
      },

      /**
       * IE 6 and 7 omit the trailing quote after the format name when
       * querying cssText. This needs to be fixed before cssText is replaced
       * or all rules will be invalid and no web fonts will work any more.
       *
       * @param cssText {String} CSS text
       * @return {String} Fixed CSS text
       */
      __fixCssText: function __fixCssText(cssText) {
        return cssText.replace("'eot)", "'eot')").replace("('embedded-opentype)", "('embedded-opentype')");
      }
    },

    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__queueInterval) {
        this.__queueInterval.stop();

        this.__queueInterval.dispose();
      }

      delete this.__createdStyles;
      this.removeStyleSheet();

      for (var prop in this.__validators) {
        this.__validators[prop].dispose();
      }

      qx.bom.webfonts.Validator.removeDefaultHelperElements();
    }
  });
  qx.bom.webfonts.Manager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.Emitter": {
        "require": true
      },
      "qx.bom.client.CssAnimation": {
        "construct": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation": {
          "construct": true,
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
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * This is a simple handle, which will be returned when an animation is
   * started using the {@link qx.bom.element.Animation#animate} method. It
   * basically controls the animation.
   *
   * @ignore(qx.bom.element.AnimationJs)
   */
  qx.Bootstrap.define("qx.bom.element.AnimationHandle", {
    extend: qx.event.Emitter,
    construct: function construct() {
      var css = qx.core.Environment.get("css.animation");
      this.__playState = css && css["play-state"];
      this.__playing = true;
      this.addListenerOnce("end", this.__setEnded, this);
    },
    events: {
      /** Fired when the animation started via {@link qx.bom.element.Animation}. */
      "start": "Element",

      /**
       * Fired when the animation started via {@link qx.bom.element.Animation} has
       * ended.
       */
      "end": "Element",

      /** Fired on every iteration of the animation. */
      "iteration": "Element"
    },
    members: {
      __playState: null,
      __playing: false,
      __ended: false,

      /**
       * Accessor of the playing state.
       * @return {Boolean} <code>true</code>, if the animations is playing.
       */
      isPlaying: function isPlaying() {
        return this.__playing;
      },

      /**
       * Accessor of the ended state.
       * @return {Boolean} <code>true</code>, if the animations has ended.
       */
      isEnded: function isEnded() {
        return this.__ended;
      },

      /**
       * Accessor of the paused state.
       * @return {Boolean} <code>true</code>, if the animations is paused.
       */
      isPaused: function isPaused() {
        return this.el.style[this.__playState] == "paused";
      },

      /**
       * Pauses the animation, if running. If not running, it will be ignored.
       */
      pause: function pause() {
        if (this.el) {
          this.el.style[this.__playState] = "paused";
          this.el.$$animation.__playing = false; // in case the animation is based on JS

          if (this.animationId && qx.bom.element.AnimationJs) {
            qx.bom.element.AnimationJs.pause(this);
          }
        }
      },

      /**
       * Resumes an animation. This does not start the animation once it has ended.
       * In this case you need to start a new Animation.
       */
      play: function play() {
        if (this.el) {
          this.el.style[this.__playState] = "running";
          this.el.$$animation.__playing = true; // in case the animation is based on JS

          if (this.i != undefined && qx.bom.element.AnimationJs) {
            qx.bom.element.AnimationJs.play(this);
          }
        }
      },

      /**
       * Stops the animation if running.
       */
      stop: function stop() {
        if (this.el && qx.core.Environment.get("css.animation") && !this.jsAnimation) {
          this.el.style[this.__playState] = "";
          this.el.style[qx.core.Environment.get("css.animation").name] = "";
          this.el.$$animation.__playing = false;
          this.el.$$animation.__ended = true;
        } // in case the animation is based on JS
        else if (this.jsAnimation) {
            this.stopped = true;
            qx.bom.element.AnimationJs.stop(this);
          }
      },

      /**
       * Set the animation state to ended
       */
      __setEnded: function __setEnded() {
        this.__playing = false;
        this.__ended = true;
      }
    }
  });
  qx.bom.element.AnimationHandle.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Style": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["css.transform", "css.transform.3d"],
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
   * Responsible for checking all relevant CSS transform properties.
   *
   * Specs:
   * http://www.w3.org/TR/css3-2d-transforms/
   * http://www.w3.org/TR/css3-3d-transforms/
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.CssTransform", {
    statics: {
      /**
       * Main check method which returns an object if CSS animations are
       * supported. This object contains all necessary keys to work with CSS
       * animations.
       * <ul>
       *  <li><code>name</code> The name of the css transform style</li>
       *  <li><code>style</code> The name of the css transform-style style</li>
       *  <li><code>origin</code> The name of the transform-origin style</li>
       *  <li><code>3d</code> Whether 3d transforms are supported</li>
       *  <li><code>perspective</code> The name of the perspective style</li>
       *  <li><code>perspective-origin</code> The name of the perspective-origin style</li>
       *  <li><code>backface-visibility</code> The name of the backface-visibility style</li>
       * </ul>
       *
       * @internal
       * @return {Object|null} The described object or null, if animations are
       *   not supported.
       */
      getSupport: function getSupport() {
        var name = qx.bom.client.CssTransform.getName();

        if (name != null) {
          return {
            "name": name,
            "style": qx.bom.client.CssTransform.getStyle(),
            "origin": qx.bom.client.CssTransform.getOrigin(),
            "3d": qx.bom.client.CssTransform.get3D(),
            "perspective": qx.bom.client.CssTransform.getPerspective(),
            "perspective-origin": qx.bom.client.CssTransform.getPerspectiveOrigin(),
            "backface-visibility": qx.bom.client.CssTransform.getBackFaceVisibility()
          };
        }

        return null;
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getStyle: function getStyle() {
        return qx.bom.Style.getPropertyName("transformStyle");
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getPerspective: function getPerspective() {
        return qx.bom.Style.getPropertyName("perspective");
      },

      /**
       * Checks for the style name used to set the perspective origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getPerspectiveOrigin: function getPerspectiveOrigin() {
        return qx.bom.Style.getPropertyName("perspectiveOrigin");
      },

      /**
       * Checks for the style name used to set the backface visibility.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getBackFaceVisibility: function getBackFaceVisibility() {
        return qx.bom.Style.getPropertyName("backfaceVisibility");
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getOrigin: function getOrigin() {
        return qx.bom.Style.getPropertyName("transformOrigin");
      },

      /**
       * Checks for the style name used for transforms.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getName: function getName() {
        return qx.bom.Style.getPropertyName("transform");
      },

      /**
       * Checks if 3D transforms are supported.
       * @internal
       * @return {Boolean} <code>true</code>, if 3D transformations are supported
       */
      get3D: function get3D() {
        return qx.bom.client.CssTransform.getPerspective() != null;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("css.transform", statics.getSupport);
      qx.core.Environment.add("css.transform.3d", statics.get3D);
    }
  });
  qx.bom.client.CssTransform.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.CssTransform": {
        "require": true
      },
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.transform": {
          "load": true,
          "className": "qx.bom.client.CssTransform"
        },
        "css.transform.3d": {
          "className": "qx.bom.client.CssTransform"
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
   * This class is responsible for applying CSS3 transforms to plain DOM elements.
   * The implementation is mostly a cross browser wrapper for applying the
   * transforms.
   * The API is keep to the spec as close as possible.
   *
   * http://www.w3.org/TR/css3-3d-transforms/
   */
  qx.Bootstrap.define("qx.bom.element.Transform", {
    statics: {
      /** Internal storage of the CSS names */
      __cssKeys: qx.core.Environment.get("css.transform"),

      /**
       * Method to apply multiple transforms at once to the given element. It
       * takes a map containing the transforms you want to apply plus the values
       * e.g.<code>{scale: 2, rotate: "5deg"}</code>.
       * The values can be either singular, which means a single value will
       * be added to the CSS. If you give an array, the values will be split up
       * and each array entry will be used for the X, Y or Z dimension in that
       * order e.g. <code>{scale: [2, 0.5]}</code> will result in a element
       * double the size in X direction and half the size in Y direction.
       * The values can be either singular, which means a single value will
       * be added to the CSS. If you give an array, the values will be join to
       * a string.
       * 3d suffixed properties will be taken for translate and scale if they are
       * available and an array with three values is given.
       * Make sure your browser supports all transformations you apply.
       *
       * @param el {Element} The element to apply the transformation.
       * @param transforms {Map} The map containing the transforms and value.
       */
      transform: function transform(el, transforms) {
        var transformCss = this.getTransformValue(transforms);

        if (this.__cssKeys != null) {
          var style = this.__cssKeys["name"];
          el.style[style] = transformCss;
        }
      },

      /**
       * Translates the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to translate e.g. <code>"10px"</code>.
       */
      translate: function translate(el, value) {
        this.transform(el, {
          translate: value
        });
      },

      /**
       * Scales the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {Number|Array} The value to scale.
       */
      scale: function scale(el, value) {
        this.transform(el, {
          scale: value
        });
      },

      /**
       * Rotates the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to rotate e.g. <code>"90deg"</code>.
       */
      rotate: function rotate(el, value) {
        this.transform(el, {
          rotate: value
        });
      },

      /**
       * Skews the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to skew e.g. <code>"90deg"</code>.
       */
      skew: function skew(el, value) {
        this.transform(el, {
          skew: value
        });
      },

      /**
       * Converts the given map to a string which could be added to a css
       * stylesheet.
       * @param transforms {Map} The transforms map. For a detailed description,
       * take a look at the {@link #transform} method.
       * @return {String} The CSS value.
       */
      getCss: function getCss(transforms) {
        var transformCss = this.getTransformValue(transforms);

        if (this.__cssKeys != null) {
          var style = this.__cssKeys["name"];
          return qx.bom.Style.getCssName(style) + ":" + transformCss + ";";
        }

        return "";
      },

      /**
       * Sets the transform-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} CSS position values like <code>50% 50%</code> or
       *   <code>left top</code>.
       */
      setOrigin: function setOrigin(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["origin"]] = value;
        }
      },

      /**
       * Returns the transform-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>50% 50%</code>
       */
      getOrigin: function getOrigin(el) {
        if (this.__cssKeys != null) {
          return el.style[this.__cssKeys["origin"]];
        }

        return "";
      },

      /**
       * Sets the transform-style property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} Either <code>flat</code> or <code>preserve-3d</code>.
       */
      setStyle: function setStyle(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["style"]] = value;
        }
      },

      /**
       * Returns the transform-style property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, either <code>flat</code> or
       *   <code>preserve-3d</code>.
       */
      getStyle: function getStyle(el) {
        if (this.__cssKeys != null) {
          return el.style[this.__cssKeys["style"]];
        }

        return "";
      },

      /**
       * Sets the perspective property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
       * @param el {Element} The dom element to set the property.
       * @param value {Number} The perspective layer. Numbers between 100
       *   and 5000 give the best results.
       */
      setPerspective: function setPerspective(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["perspective"]] = value + "px";
        }
      },

      /**
       * Returns the perspective property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>500</code>
       */
      getPerspective: function getPerspective(el) {
        if (this.__cssKeys != null) {
          return el.style[this.__cssKeys["perspective"]];
        }

        return "";
      },

      /**
       * Sets the perspective-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} CSS position values like <code>50% 50%</code> or
       *   <code>left top</code>.
       */
      setPerspectiveOrigin: function setPerspectiveOrigin(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["perspective-origin"]] = value;
        }
      },

      /**
       * Returns the perspective-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>50% 50%</code>
       */
      getPerspectiveOrigin: function getPerspectiveOrigin(el) {
        if (this.__cssKeys != null) {
          var value = el.style[this.__cssKeys["perspective-origin"]];

          if (value != "") {
            return value;
          } else {
            var valueX = el.style[this.__cssKeys["perspective-origin"] + "X"];
            var valueY = el.style[this.__cssKeys["perspective-origin"] + "Y"];

            if (valueX != "") {
              return valueX + " " + valueY;
            }
          }
        }

        return "";
      },

      /**
       * Sets the backface-visibility property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
       * @param el {Element} The dom element to set the property.
       * @param value {Boolean} <code>true</code> if the backface should be visible.
       */
      setBackfaceVisibility: function setBackfaceVisibility(el, value) {
        if (this.__cssKeys != null) {
          el.style[this.__cssKeys["backface-visibility"]] = value ? "visible" : "hidden";
        }
      },

      /**
       * Returns the backface-visibility property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
       * @param el {Element} The dom element to read the property.
       * @return {Boolean} <code>true</code>, if the backface is visible.
       */
      getBackfaceVisibility: function getBackfaceVisibility(el) {
        if (this.__cssKeys != null) {
          return el.style[this.__cssKeys["backface-visibility"]] == "visible";
        }

        return true;
      },

      /**
       * Converts the given transforms map to a valid CSS string.
       *
       * @param transforms {Map} A map containing the transforms.
       * @return {String} The CSS transforms.
       */
      getTransformValue: function getTransformValue(transforms) {
        var value = "";
        var properties3d = ["translate", "scale"];

        for (var property in transforms) {
          var params = transforms[property]; // if an array is given

          if (qx.Bootstrap.isArray(params)) {
            // use 3d properties for translate and scale if all 3 parameter are given
            if (params.length === 3 && properties3d.indexOf(property) > -1 && qx.core.Environment.get("css.transform.3d")) {
              value += this._compute3dProperty(property, params);
            } // use axis related properties
            else {
                value += this._computeAxisProperties(property, params);
              } // case for single values given

          } else {
            // single value case
            value += property + "(" + params + ") ";
          }
        }

        return value.trim();
      },

      /**
       * Helper function to create 3d property.
       *
       * @param property {String} Property of transform, e.g. translate
       * @param params {Array} Array with three values, each one stands for an axis.
       *
       * @return {String} Computed property and its value
       */
      _compute3dProperty: function _compute3dProperty(property, params) {
        var cssValue = "";
        property += "3d";

        for (var i = 0; i < params.length; i++) {
          if (params[i] == null) {
            params[i] = 0;
          }
        }

        cssValue += property + "(" + params.join(", ") + ") ";
        return cssValue;
      },

      /**
       * Helper function to create axis related properties.
       *
       * @param property {String} Property of transform, e.g. rotate
       * @param params {Array} Array with values, each one stands for an axis.
       *
       * @return {String} Computed property and its value
       */
      _computeAxisProperties: function _computeAxisProperties(property, params) {
        var value = "";
        var dimensions = ["X", "Y", "Z"];

        for (var i = 0; i < params.length; i++) {
          if (params[i] == null || i == 2 && !qx.core.Environment.get("css.transform.3d")) {
            continue;
          }

          value += property + dimensions[i] + "(";
          value += params[i];
          value += ") ";
        }

        return value;
      }
    }
  });
  qx.bom.element.Transform.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.xml.Document": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["xml.implementation", "xml.domparser", "xml.selectsinglenode", "xml.selectnodes", "xml.getelementsbytagnamens", "xml.domproperties", "xml.attributens", "xml.createelementns", "xml.createnode", "xml.getqualifieditem"],
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
   * This class should contain all XML-related checks
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Xml", {
    statics: {
      /**
       * Checks if XML is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if XML is supported
       */
      getImplementation: function getImplementation() {
        return document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("XML", "1.0");
      },

      /**
       * Checks if an XML DOMParser is available
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOMParser is supported
       */
      getDomParser: function getDomParser() {
        return typeof window.DOMParser !== "undefined";
      },

      /**
       * Checks if the proprietary selectSingleNode method is available on XML DOM
       * nodes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if selectSingleNode is available
       */
      getSelectSingleNode: function getSelectSingleNode() {
        return typeof qx.xml.Document.create().selectSingleNode !== "undefined";
      },

      /**
       * Checks if the proprietary selectNodes method is available on XML DOM
       * nodes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if selectSingleNode is available
       */
      getSelectNodes: function getSelectNodes() {
        return typeof qx.xml.Document.create().selectNodes !== "undefined";
      },

      /**
       * Checks availability of the getElementsByTagNameNS XML DOM method.
       *
       * @internal
       * @return {Boolean} <code>true</code> if getElementsByTagNameNS is available
       */
      getElementsByTagNameNS: function getElementsByTagNameNS() {
        return typeof qx.xml.Document.create().getElementsByTagNameNS !== "undefined";
      },

      /**
       * Checks if MSXML-style DOM Level 2 properties are supported.
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getDomProperties: function getDomProperties() {
        var doc = qx.xml.Document.create();
        return "getProperty" in doc && typeof doc.getProperty("SelectionLanguage") === "string";
      },

      /**
       * Checks if the getAttributeNS and setAttributeNS methods are supported on
       * XML DOM elements
       *
       * @internal
       * @return {Boolean} <code>true</code> if get/setAttributeNS is supported
       */
      getAttributeNS: function getAttributeNS() {
        var docElem = qx.xml.Document.fromString("<a></a>").documentElement;
        return typeof docElem.getAttributeNS === "function" && typeof docElem.setAttributeNS === "function";
      },

      /**
       * Checks if the createElementNS method is supported on XML DOM documents
       *
       * @internal
       * @return {Boolean} <code>true</code> if createElementNS is supported
       */
      getCreateElementNS: function getCreateElementNS() {
        return typeof qx.xml.Document.create().createElementNS === "function";
      },

      /**
       * Checks if the proprietary createNode method is supported on XML DOM
       * documents
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getCreateNode: function getCreateNode() {
        return typeof qx.xml.Document.create().createNode !== "undefined";
      },

      /**
       * Checks if the proprietary getQualifiedItem method is supported for XML
       * element attributes
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getQualifiedItem: function getQualifiedItem() {
        var docElem = qx.xml.Document.fromString("<a></a>").documentElement;
        return typeof docElem.attributes.getQualifiedItem !== "undefined";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("xml.implementation", statics.getImplementation);
      qx.core.Environment.add("xml.domparser", statics.getDomParser);
      qx.core.Environment.add("xml.selectsinglenode", statics.getSelectSingleNode);
      qx.core.Environment.add("xml.selectnodes", statics.getSelectNodes);
      qx.core.Environment.add("xml.getelementsbytagnamens", statics.getElementsByTagNameNS);
      qx.core.Environment.add("xml.domproperties", statics.getDomProperties);
      qx.core.Environment.add("xml.attributens", statics.getAttributeNS);
      qx.core.Environment.add("xml.createelementns", statics.getCreateElementNS);
      qx.core.Environment.add("xml.createnode", statics.getCreateNode);
      qx.core.Environment.add("xml.getqualifieditem", statics.getQualifiedItem);
    }
  });
  qx.bom.client.Xml.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.event.Timer": {},
      "qx.bom.element.Dimension": {},
      "qx.lang.Object": {},
      "qx.bom.element.Style": {}
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
   * Checks whether a given font is available on the document and fires events
   * accordingly.
   * 
   * This class does not need to be disposed, unless you want to abort the validation
   * early
   */
  qx.Class.define("qx.bom.webfonts.Validator", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param fontFamily {String} The name of the font to be verified
     * @param comparisonString {String?} String to be used to detect whether a font was loaded or not
     * whether the font has loaded properly
     */
    construct: function construct(fontFamily, comparisonString) {
      qx.core.Object.constructor.call(this);

      if (comparisonString) {
        this.setComparisonString(comparisonString);
      }

      if (fontFamily) {
        this.setFontFamily(fontFamily);
        this.__requestedHelpers = this._getRequestedHelpers();
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Sets of serif and sans-serif fonts to be used for size comparisons.
       * At least one of these fonts should be present on any system.
       */
      COMPARISON_FONTS: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        serif: ["Times New Roman", "Georgia", "serif"]
      },

      /**
       * Map of common CSS attributes to be used for all  size comparison elements
       */
      HELPER_CSS: {
        position: "absolute",
        margin: "0",
        padding: "0",
        top: "-1000px",
        left: "-1000px",
        fontSize: "350px",
        width: "auto",
        height: "auto",
        lineHeight: "normal",
        fontVariant: "normal",
        visibility: "hidden"
      },

      /**
       * The string to be used in the size comparison elements. This is the default string
       * which is used for the {@link #COMPARISON_FONTS} and the font to be validated. It
       * can be overridden for the font to be validated using the {@link #comparisonString}
       * property.
       */
      COMPARISON_STRING: "WEei",
      __defaultSizes: null,
      __defaultHelpers: null,

      /**
       * Removes the two common helper elements used for all size comparisons from
       * the DOM
       */
      removeDefaultHelperElements: function removeDefaultHelperElements() {
        var defaultHelpers = qx.bom.webfonts.Validator.__defaultHelpers;

        if (defaultHelpers) {
          for (var prop in defaultHelpers) {
            document.body.removeChild(defaultHelpers[prop]);
          }
        }

        delete qx.bom.webfonts.Validator.__defaultHelpers;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The font-family this validator should check
       */
      fontFamily: {
        nullable: true,
        init: null,
        apply: "_applyFontFamily"
      },

      /**
       * Comparison string used to check whether the font has loaded or not.
       */
      comparisonString: {
        nullable: true,
        init: null
      },

      /**
       * Time in milliseconds from the beginning of the check until it is assumed
       * that a font is not available
       */
      timeout: {
        check: "Integer",
        init: 5000
      }
    },

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
       MEMBERS
    *****************************************************************************
    */
    members: {
      __requestedHelpers: null,
      __checkTimer: null,
      __checkStarted: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Validates the font
       */
      validate: function validate() {
        this.__checkStarted = new Date().getTime();

        if (this.__checkTimer) {
          this.__checkTimer.restart();
        } else {
          this.__checkTimer = new qx.event.Timer(100);

          this.__checkTimer.addListener("interval", this.__onTimerInterval, this); // Give the browser a chance to render the new elements


          qx.event.Timer.once(function () {
            this.__checkTimer.start();
          }, this, 0);
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROTECTED API
      ---------------------------------------------------------------------------
      */

      /**
       * Removes the helper elements from the DOM
       */
      _reset: function _reset() {
        if (this.__requestedHelpers) {
          for (var prop in this.__requestedHelpers) {
            var elem = this.__requestedHelpers[prop];
            document.body.removeChild(elem);
          }

          this.__requestedHelpers = null;
        }
      },

      /**
       * Checks if the font is available by comparing the widths of the elements
       * using the generic fonts to the widths of the elements using the font to
       * be validated
       *
       * @return {Boolean} Whether or not the font caused the elements to differ
       * in size
       */
      _isFontValid: function _isFontValid() {
        if (!qx.bom.webfonts.Validator.__defaultSizes) {
          this.__init();
        }

        if (!this.__requestedHelpers) {
          this.__requestedHelpers = this._getRequestedHelpers();
        } // force rerendering for chrome


        this.__requestedHelpers.sans.style.visibility = "visible";
        this.__requestedHelpers.sans.style.visibility = "hidden";
        this.__requestedHelpers.serif.style.visibility = "visible";
        this.__requestedHelpers.serif.style.visibility = "hidden";
        var requestedSans = qx.bom.element.Dimension.getWidth(this.__requestedHelpers.sans);
        var requestedSerif = qx.bom.element.Dimension.getWidth(this.__requestedHelpers.serif);
        var cls = qx.bom.webfonts.Validator;

        if (requestedSans !== cls.__defaultSizes.sans || requestedSerif !== cls.__defaultSizes.serif) {
          return true;
        }

        return false;
      },

      /**
       * Creates the two helper elements styled with the font to be checked
       *
       * @return {Map} A map with the keys <pre>sans</pre> and <pre>serif</pre>
       * and the created span elements as values
       */
      _getRequestedHelpers: function _getRequestedHelpers() {
        var fontsSans = [this.getFontFamily()].concat(qx.bom.webfonts.Validator.COMPARISON_FONTS.sans);
        var fontsSerif = [this.getFontFamily()].concat(qx.bom.webfonts.Validator.COMPARISON_FONTS.serif);
        return {
          sans: this._getHelperElement(fontsSans, this.getComparisonString()),
          serif: this._getHelperElement(fontsSerif, this.getComparisonString())
        };
      },

      /**
       * Creates a span element with the comparison text (either {@link #COMPARISON_STRING} or
       * {@link #comparisonString}) and styled with the default CSS ({@link #HELPER_CSS}) plus
       * the given font-family value and appends it to the DOM
       *
       * @param fontFamily {String} font-family string
       * @param comparisonString {String?} String to be used to detect whether a font was loaded or not
       * @return {Element} the created DOM element
       */
      _getHelperElement: function _getHelperElement(fontFamily, comparisonString) {
        var styleMap = qx.lang.Object.clone(qx.bom.webfonts.Validator.HELPER_CSS);

        if (fontFamily) {
          if (styleMap.fontFamily) {
            styleMap.fontFamily += "," + fontFamily.join(",");
          } else {
            styleMap.fontFamily = fontFamily.join(",");
          }
        }

        var elem = document.createElement("span");
        elem.innerHTML = comparisonString || qx.bom.webfonts.Validator.COMPARISON_STRING;
        qx.bom.element.Style.setStyles(elem, styleMap);
        document.body.appendChild(elem);
        return elem;
      },
      // property apply
      _applyFontFamily: function _applyFontFamily(value, old) {
        if (value !== old) {
          this._reset();
        }
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE API
      ---------------------------------------------------------------------------
      */

      /**
       * Creates the default helper elements and gets their widths
       */
      __init: function __init() {
        var cls = qx.bom.webfonts.Validator;

        if (!cls.__defaultHelpers) {
          cls.__defaultHelpers = {
            sans: this._getHelperElement(cls.COMPARISON_FONTS.sans),
            serif: this._getHelperElement(cls.COMPARISON_FONTS.serif)
          };
        }

        cls.__defaultSizes = {
          sans: qx.bom.element.Dimension.getWidth(cls.__defaultHelpers.sans),
          serif: qx.bom.element.Dimension.getWidth(cls.__defaultHelpers.serif)
        };
      },

      /**
       * Triggers helper element size comparison and fires a ({@link #changeStatus})
       * event with the result.
       */
      __onTimerInterval: function __onTimerInterval() {
        if (this._isFontValid()) {
          this.__checkTimer.stop();

          this._reset();

          this.fireDataEvent("changeStatus", {
            family: this.getFontFamily(),
            valid: true
          });
        } else {
          var now = new Date().getTime();

          if (now - this.__checkStarted >= this.getTimeout()) {
            this.__checkTimer.stop();

            this._reset();

            this.fireDataEvent("changeStatus", {
              family: this.getFontFamily(),
              valid: false
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
      this._reset();

      this.__checkTimer.stop();

      this.__checkTimer.removeListener("interval", this.__onTimerInterval, this);

      this._disposeObjects("__checkTimer");
    }
  });
  qx.bom.webfonts.Validator.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.root.Application": {}
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
   * For a GUI application that looks & feels like native desktop application
   * (often called "RIA" - Rich Internet Application).
   *
   * Such a stand-alone application typically creates and updates all content
   * dynamically. Often it is called a "single-page application", since the
   * document itself is never reloaded or changed. Communication with the server
   * is done with AJAX.
   *
   * @require(qx.core.Init)
   */
  qx.Class.define("qx.application.Standalone", {
    extend: qx.application.AbstractGui,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _createRootWidget: function _createRootWidget() {
        return new qx.ui.root.Application(document);
      }
    }
  });
  qx.application.Standalone.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-6.js.map
