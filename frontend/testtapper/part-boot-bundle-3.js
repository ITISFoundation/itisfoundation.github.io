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
        "require": true
      },
      "qx.lang.Type": {
        "construct": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.test.delay.scale": {
          "construct": true
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
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   *  This class stores the information needed to instruct a running test to wait.
   *  It is thrown as an exception to be caught by the method executing the test.
   */
  qx.Class.define("qx.dev.unit.AsyncWrapper", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param delay {Integer?} The amount of time in milliseconds to wait
     * @param deferredFunction {Function?} The function to run after the timeout
     * has expired.
     * @param context {Object?window} Optional execution context for deferredFunction
     */
    construct: function construct(delay, deferredFunction, context) {
      for (var i = 0; i < 2; i++) {
        if (qx.lang.Type.isFunction(arguments[i])) {
          this.setDeferredFunction(arguments[i]);
        } else if (qx.lang.Type.isNumber(arguments[i])) {
          if (qx.core.Environment.get("qx.test.delay.scale")) {
            this.setDelay(arguments[i] * parseInt(qx.core.Environment.get("qx.test.delay.scale"), 10));
          } else {
            this.setDelay(arguments[i]);
          }
        }
      }

      if (context) {
        this.setContext(context);
      }
    },
    properties: {
      /** The function to run after the timeout has expired */
      deferredFunction: {
        check: "Function",
        init: false
      },

      /** The context in which the timeout function should be executed  */
      context: {
        check: "Object",
        init: null
      },

      /** The amount of time in milliseconds to wait */
      delay: {
        check: "Integer",
        nullable: false,
        init: 10000
      }
    }
  });
  qx.dev.unit.AsyncWrapper.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * This error is thrown by the unit test class if an infrastructure requirement
   * is not met. The unit testing framework should skip the test and visually mark
   * the test as not having been executed.
   */
  qx.Class.define("qx.dev.unit.RequirementError", {
    extend: Error,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param requirement {String?} The requirement ID, e.g. "SSL"
     * @param message {String?} Optional error message
     */
    construct: function construct(requirement, message) {
      this.__message = message || "Requirement not met";
      this.__requirement = requirement;
      var inst = Error.call(this, this.__message); // map stack trace properties since they're not added by Error's constructor

      if (inst.stack) {
        this.stack = inst.stack;
      }

      if (inst.stacktrace) {
        this.stacktrace = inst.stacktrace;
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __message: null,
      __requirement: null,

      /**
       * Returns the ID of the requirement that was not satisfied.
       *
       * @return {String} The requirement ID
       */
      getRequirement: function getRequirement() {
        return this.__requirement;
      },

      /**
       * Returns a string representation of the error.
       *
       * @return {String} Error message
       */
      toString: function toString() {
        var msg = this.__message;

        if (this.__requirement) {
          msg += ": " + this.__requirement;
        }

        return msg;
      }
    }
  });
  qx.dev.unit.RequirementError.$$dbClassInfo = $$dbClassInfo;
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
      "qx.theme.manager.Meta": {
        "construct": true
      },
      "qx.util.PropertyUtil": {},
      "qx.ui.core.queue.Layout": {},
      "qx.core.Init": {},
      "qx.ui.core.queue.Visibility": {},
      "qx.lang.Object": {}
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
   * The base class of all items, which should be laid out using a layout manager
   * {@link qx.ui.layout.Abstract}.
   */
  qx.Class.define("qx.ui.core.LayoutItem", {
    type: "abstract",
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this); // dynamic theme switch

      {
        qx.theme.manager.Meta.getInstance().addListener("changeTheme", this._onChangeTheme, this);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        DIMENSION
      ---------------------------------------------------------------------------
      */

      /**
       * The user provided minimal width.
       *
       * Also take a look at the related properties {@link #width} and {@link #maxWidth}.
       */
      minWidth: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The <code>LayoutItem</code>'s preferred width.
       *
       * The computed width may differ from the given width due to
       * stretching. Also take a look at the related properties
       * {@link #minWidth} and {@link #maxWidth}.
       */
      width: {
        check: "Integer",
        event: "changeWidth",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided maximal width.
       *
       * Also take a look at the related properties {@link #width} and {@link #minWidth}.
       */
      maxWidth: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided minimal height.
       *
       * Also take a look at the related properties {@link #height} and {@link #maxHeight}.
       */
      minHeight: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The item's preferred height.
       *
       * The computed height may differ from the given height due to
       * stretching. Also take a look at the related properties
       * {@link #minHeight} and {@link #maxHeight}.
       */
      height: {
        check: "Integer",
        event: "changeHeight",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided maximum height.
       *
       * Also take a look at the related properties {@link #height} and {@link #minHeight}.
       */
      maxHeight: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        STRETCHING
      ---------------------------------------------------------------------------
      */

      /** Whether the item can grow horizontally. */
      allowGrowX: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can shrink horizontally. */
      allowShrinkX: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can grow vertically. */
      allowGrowY: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can shrink vertically. */
      allowShrinkY: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Growing and shrinking in the horizontal direction */
      allowStretchX: {
        group: ["allowGrowX", "allowShrinkX"],
        mode: "shorthand",
        themeable: true
      },

      /** Growing and shrinking in the vertical direction */
      allowStretchY: {
        group: ["allowGrowY", "allowShrinkY"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        MARGIN
      ---------------------------------------------------------------------------
      */

      /** Margin of the widget (top) */
      marginTop: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (right) */
      marginRight: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (bottom) */
      marginBottom: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (left) */
      marginLeft: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /**
       * The 'margin' property is a shorthand property for setting 'marginTop',
       * 'marginRight', 'marginBottom' and 'marginLeft' at the same time.
       *
       * If four values are specified they apply to top, right, bottom and left respectively.
       * If there is only one value, it applies to all sides, if there are two or three,
       * the missing values are taken from the opposite side.
       */
      margin: {
        group: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        ALIGN
      ---------------------------------------------------------------------------
      */

      /**
       * Horizontal alignment of the item in the parent layout.
       *
       * Note: Item alignment is only supported by {@link LayoutItem} layouts where
       * it would have a visual effect. Except for {@link Spacer}, which provides
       * blank space for layouts, all classes that inherit {@link LayoutItem} support alignment.
       */
      alignX: {
        check: ["left", "center", "right"],
        nullable: true,
        apply: "_applyAlign",
        themeable: true
      },

      /**
       * Vertical alignment of the item in the parent layout.
       *
       * Note: Item alignment is only supported by {@link LayoutItem} layouts where
       * it would have a visual effect. Except for {@link Spacer}, which provides
       * blank space for layouts, all classes that inherit {@link LayoutItem} support alignment.
       */
      alignY: {
        check: ["top", "middle", "bottom", "baseline"],
        nullable: true,
        apply: "_applyAlign",
        themeable: true
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
        DYNAMIC THEME SWITCH SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the dynamic theme change.
       * @signature function()
       */
      _onChangeTheme: function _onChangeTheme() {
        // reset all themeable properties
        var props = qx.util.PropertyUtil.getAllProperties(this.constructor);

        for (var name in props) {
          var desc = props[name]; // only themeable properties not having a user value

          if (desc.themeable) {
            var userValue = qx.util.PropertyUtil.getUserValue(this, name);

            if (userValue == null) {
              qx.util.PropertyUtil.resetThemed(this, name);
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT PROCESS
      ---------------------------------------------------------------------------
      */

      /** @type {Integer} The computed height */
      __computedHeightForWidth: null,

      /** @type {Map} The computed size of the layout item */
      __computedLayout: null,

      /** @type {Boolean} Whether the current layout is valid */
      __hasInvalidLayout: null,

      /** @type {Map} Cached size hint */
      __sizeHint: null,

      /** @type {Boolean} Whether the margins have changed and must be updated */
      __updateMargin: null,

      /** @type {Map} user provided bounds of the widget, which override the layout manager */
      __userBounds: null,

      /** @type {Map} The item's layout properties */
      __layoutProperties: null,

      /**
       * Get the computed location and dimension as computed by
       * the layout manager.
       *
       * @return {Map|null} The location and dimensions in pixel
       *    (if the layout is valid). Contains the keys
       *    <code>width</code>, <code>height</code>, <code>left</code> and
       *    <code>top</code>.
       */
      getBounds: function getBounds() {
        return this.__userBounds || this.__computedLayout || null;
      },

      /**
       * Reconfigure number of separators
       */
      clearSeparators: function clearSeparators() {// empty template
      },

      /**
       * Renders a separator between two children
       *
       * @param separator {String|qx.ui.decoration.IDecorator} The separator to render
       * @param bounds {Map} Contains the left and top coordinate and the width and height
       *    of the separator to render.
       */
      renderSeparator: function renderSeparator(separator, bounds) {// empty template
      },

      /**
       * Used by the layout engine to apply coordinates and dimensions.
       *
       * @param left {Integer} Any integer value for the left position,
       *   always in pixels
       * @param top {Integer} Any integer value for the top position,
       *   always in pixels
       * @param width {Integer} Any positive integer value for the width,
       *   always in pixels
       * @param height {Integer} Any positive integer value for the height,
       *   always in pixels
       * @return {Map} A map of which layout sizes changed.
       */
      renderLayout: function renderLayout(left, top, width, height) {
        // do not render if the layout item is already disposed
        if (this.isDisposed()) {
          return null;
        }

        {
          var msg = "Something went wrong with the layout of " + this.toString() + "!";
          this.assertInteger(left, "Wrong 'left' argument. " + msg);
          this.assertInteger(top, "Wrong 'top' argument. " + msg);
          this.assertInteger(width, "Wrong 'width' argument. " + msg);
          this.assertInteger(height, "Wrong 'height' argument. " + msg); // this.assertInRange(width, this.getMinWidth() || -1, this.getMaxWidth() || 32000);
          // this.assertInRange(height, this.getMinHeight() || -1, this.getMaxHeight() || 32000);
        } // Height for width support
        // Results into a relayout which means that width/height is applied in the next iteration.

        var flowHeight = null;

        if (this.getHeight() == null && this._hasHeightForWidth()) {
          var flowHeight = this._getHeightForWidth(width);
        }

        if (flowHeight != null && flowHeight !== this.__computedHeightForWidth) {
          // This variable is used in the next computation of the size hint
          this.__computedHeightForWidth = flowHeight; // Re-add to layout queue

          qx.ui.core.queue.Layout.add(this);
          return null;
        } // Detect size changes
        // Dynamically create data structure for computed layout


        var computed = this.__computedLayout;

        if (!computed) {
          computed = this.__computedLayout = {};
        } // Detect changes


        var changes = {};

        if (left !== computed.left || top !== computed.top) {
          changes.position = true;
          computed.left = left;
          computed.top = top;
        }

        if (width !== computed.width || height !== computed.height) {
          changes.size = true;
          computed.width = width;
          computed.height = height;
        } // Clear invalidation marker


        if (this.__hasInvalidLayout) {
          changes.local = true;
          delete this.__hasInvalidLayout;
        }

        if (this.__updateMargin) {
          changes.margin = true;
          delete this.__updateMargin;
        } // Returns changes, especially for deriving classes


        return changes;
      },

      /**
       * Whether the item should be excluded from the layout
       *
       * @return {Boolean} Should the item be excluded by the layout
       */
      isExcluded: function isExcluded() {
        return false;
      },

      /**
       * Whether the layout of this item (to layout the children)
       * is valid.
       *
       * @return {Boolean} Returns <code>true</code>
       */
      hasValidLayout: function hasValidLayout() {
        return !this.__hasInvalidLayout;
      },

      /**
       * Indicate that the item has layout changes and propagate this information
       * up the item hierarchy.
       *
       */
      scheduleLayoutUpdate: function scheduleLayoutUpdate() {
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Called by the layout manager to mark this item's layout as invalid.
       * This function should clear all layout relevant caches.
       */
      invalidateLayoutCache: function invalidateLayoutCache() {
        // this.debug("Mark layout invalid!");
        this.__hasInvalidLayout = true;
        this.__sizeHint = null;
      },

      /**
       * A size hint computes the dimensions of a widget. It returns
       * the recommended dimensions as well as the min and max dimensions.
       * The min and max values already respect the stretching properties.
       *
       * <h3>Wording</h3>
       * <ul>
       * <li>User value: Value defined by the widget user, using the size properties</li>
       *
       * <li>Layout value: The value computed by {@link qx.ui.core.Widget#_getContentHint}</li>
       * </ul>
       *
       * <h3>Algorithm</h3>
       * <ul>
       * <li>minSize: If the user min size is not null, the user value is taken,
       *     otherwise the layout value is used.</li>
       *
       * <li>(preferred) size: If the user value is not null the user value is used,
       *     otherwise the layout value is used.</li>
       *
       * <li>max size: Same as the preferred size.</li>
       * </ul>
       *
       * @param compute {Boolean?true} Automatically compute size hint if currently not
       *   cached?
       * @return {Map} The map with the preferred width/height and the allowed
       *   minimum and maximum values in cases where shrinking or growing
       *   is required.
       */
      getSizeHint: function getSizeHint(compute) {
        var hint = this.__sizeHint;

        if (hint) {
          return hint;
        }

        if (compute === false) {
          return null;
        } // Compute as defined


        hint = this.__sizeHint = this._computeSizeHint(); // Respect height for width

        if (this._hasHeightForWidth() && this.__computedHeightForWidth && this.getHeight() == null) {
          hint.height = this.__computedHeightForWidth;
        } // normalize width


        if (hint.minWidth > hint.width) {
          hint.width = hint.minWidth;
        }

        if (hint.maxWidth < hint.width) {
          hint.width = hint.maxWidth;
        }

        if (!this.getAllowGrowX()) {
          hint.maxWidth = hint.width;
        }

        if (!this.getAllowShrinkX()) {
          hint.minWidth = hint.width;
        } // normalize height


        if (hint.minHeight > hint.height) {
          hint.height = hint.minHeight;
        }

        if (hint.maxHeight < hint.height) {
          hint.height = hint.maxHeight;
        }

        if (!this.getAllowGrowY()) {
          hint.maxHeight = hint.height;
        }

        if (!this.getAllowShrinkY()) {
          hint.minHeight = hint.height;
        } // Finally return


        return hint;
      },

      /**
       * Computes the size hint of the layout item.
       *
       * @return {Map} The map with the preferred width/height and the allowed
       *   minimum and maximum values.
       */
      _computeSizeHint: function _computeSizeHint() {
        var minWidth = this.getMinWidth() || 0;
        var minHeight = this.getMinHeight() || 0;
        var width = this.getWidth() || minWidth;
        var height = this.getHeight() || minHeight;
        var maxWidth = this.getMaxWidth() || Infinity;
        var maxHeight = this.getMaxHeight() || Infinity;
        return {
          minWidth: minWidth,
          width: width,
          maxWidth: maxWidth,
          minHeight: minHeight,
          height: height,
          maxHeight: maxHeight
        };
      },

      /**
       * Whether the item supports height for width.
       *
       * @return {Boolean} Whether the item supports height for width
       */
      _hasHeightForWidth: function _hasHeightForWidth() {
        var layout = this._getLayout();

        if (layout) {
          return layout.hasHeightForWidth();
        }

        return false;
      },

      /**
       * If an item wants to trade height for width it has to implement this
       * method and return the preferred height of the item if it is resized to
       * the given width. This function returns <code>null</code> if the item
       * do not support height for width.
       *
       * @param width {Integer} The computed width
       * @return {Integer} The desired height
       */
      _getHeightForWidth: function _getHeightForWidth(width) {
        var layout = this._getLayout();

        if (layout && layout.hasHeightForWidth()) {
          return layout.getHeightForWidth(width);
        }

        return null;
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      _getLayout: function _getLayout() {
        return null;
      },
      // property apply
      _applyMargin: function _applyMargin() {
        this.__updateMargin = true;
        var parent = this.$$parent;

        if (parent) {
          parent.updateLayoutProperties();
        }
      },
      // property apply
      _applyAlign: function _applyAlign() {
        var parent = this.$$parent;

        if (parent) {
          parent.updateLayoutProperties();
        }
      },
      // property apply
      _applyDimension: function _applyDimension() {
        qx.ui.core.queue.Layout.add(this);
      },
      // property apply
      _applyStretching: function _applyStretching() {
        qx.ui.core.queue.Layout.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        SUPPORT FOR USER BOUNDARIES
      ---------------------------------------------------------------------------
      */

      /**
       * Whether user bounds are set on this layout item
       *
       * @return {Boolean} Whether user bounds are set on this layout item
       */
      hasUserBounds: function hasUserBounds() {
        return !!this.__userBounds;
      },

      /**
       * Set user bounds of the widget. Widgets with user bounds are sized and
       * positioned manually and are ignored by any layout manager.
       *
       * @param left {Integer} left position (relative to the parent)
       * @param top {Integer} top position (relative to the parent)
       * @param width {Integer} width of the layout item
       * @param height {Integer} height of the layout item
       */
      setUserBounds: function setUserBounds(left, top, width, height) {
        this.__userBounds = {
          left: left,
          top: top,
          width: width,
          height: height
        };
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Clear the user bounds. After this call the layout item is laid out by
       * the layout manager again.
       *
       */
      resetUserBounds: function resetUserBounds() {
        delete this.__userBounds;
        qx.ui.core.queue.Layout.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} Empty storage pool
       *
       * @lint ignoreReferenceField(__emptyProperties)
       */
      __emptyProperties: {},

      /**
       * Stores the given layout properties
       *
       * @param props {Map} Incoming layout property data
       */
      setLayoutProperties: function setLayoutProperties(props) {
        if (props == null) {
          return;
        }

        var storage = this.__layoutProperties;

        if (!storage) {
          storage = this.__layoutProperties = {};
        } // Check values through parent


        var parent = this.getLayoutParent();

        if (parent) {
          parent.updateLayoutProperties(props);
        } // Copy over values


        for (var key in props) {
          if (props[key] == null) {
            delete storage[key];
          } else {
            storage[key] = props[key];
          }
        }
      },

      /**
       * Returns currently stored layout properties
       *
       * @return {Map} Returns a map of layout properties
       */
      getLayoutProperties: function getLayoutProperties() {
        return this.__layoutProperties || this.__emptyProperties;
      },

      /**
       * Removes all stored layout properties.
       *
       */
      clearLayoutProperties: function clearLayoutProperties() {
        delete this.__layoutProperties;
      },

      /**
       * Should be executed on every change of layout properties.
       *
       * This also includes "virtual" layout properties like margin or align
       * when they have an effect on the parent and not on the widget itself.
       *
       * This method is always executed on the parent not on the
       * modified widget itself.
       *
       * @param props {Map?null} Optional map of known layout properties
       */
      updateLayoutProperties: function updateLayoutProperties(props) {
        var layout = this._getLayout();

        if (layout) {
          // Verify values through underlying layout
          {
            if (props) {
              for (var key in props) {
                if (props[key] !== null) {
                  layout.verifyLayoutProperty(this, key, props[key]);
                }
              }
            }
          } // Precomputed and cached children data need to be
          // rebuild on upcoming (re-)layout.

          layout.invalidateChildrenCache();
        }

        qx.ui.core.queue.Layout.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        HIERARCHY SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the application root
       *
       * @return {qx.ui.root.Abstract} The currently used root
       */
      getApplicationRoot: function getApplicationRoot() {
        return qx.core.Init.getApplication().getRoot();
      },

      /**
       * Get the items parent. Even if the item has been added to a
       * layout, the parent is always a child of the containing item. The parent
       * item may be <code>null</code>.
       *
       * @return {qx.ui.core.Widget|null} The parent.
       */
      getLayoutParent: function getLayoutParent() {
        return this.$$parent || null;
      },

      /**
       * Set the parent
       *
       * @param parent {qx.ui.core.Widget|null} The new parent.
       */
      setLayoutParent: function setLayoutParent(parent) {
        if (this.$$parent === parent) {
          return;
        }

        this.$$parent = parent || null;
        qx.ui.core.queue.Visibility.add(this);
      },

      /**
       * Whether the item is a root item and directly connected to
       * the DOM.
       *
       * @return {Boolean} Whether the item a root item
       */
      isRootWidget: function isRootWidget() {
        return false;
      },

      /**
       * Returns the root item. The root item is the item which
       * is directly inserted into an existing DOM node at HTML level.
       * This is often the BODY element of a typical web page.
       *
       * @return {qx.ui.core.Widget} The root item (if available)
       */
      _getRoot: function _getRoot() {
        var parent = this;

        while (parent) {
          if (parent.isRootWidget()) {
            return parent;
          }

          parent = parent.$$parent;
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        CLONE SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      clone: function clone() {
        var clone = qx.ui.core.LayoutItem.prototype.clone.base.call(this);
        var props = this.__layoutProperties;

        if (props) {
          clone.__layoutProperties = qx.lang.Object.clone(props);
        }

        return clone;
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
      this.$$parent = this.$$subparent = this.__layoutProperties = this.__computedLayout = this.__userBounds = this.__sizeHint = null;
    }
  });
  qx.ui.core.LayoutItem.$$dbClassInfo = $$dbClassInfo;
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
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin contains the methods needed to use the translation features
   * of qooxdoo.
   *
   * @ignore(qx.locale.Manager)
   */
  qx.Mixin.define("qx.locale.MTranslation", {
    members: {
      /**
       * Translate a message
       * Mark the message for translation.
       *
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object?} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       */
      tr: function tr(messageId, varargs) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.tr.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      },

      /**
       * Translate a plural message
       * Mark the messages for translation.
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} if greater than 1 the plural form otherwise the singular form is returned.
       * @param varargs {Object?} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       */
      trn: function trn(singularMessageId, pluralMessageId, count, varargs) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.trn.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      },

      /**
       * Translate a message with translation hint
       * Mark the messages for translation.
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object?} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       */
      trc: function trc(hint, messageId, varargs) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.trc.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      },

      /**
       * Translate a plural message with translation hint
       * Mark the messages for translation.
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} if greater than 1 the plural form otherwise the singular form is returned.
       * @param varargs {Object?} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       */
      trnc: function trnc(hint, singularMessageId, pluralMessageId, count, varargs) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.trnc.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      },

      /**
       * Mark the message for translation but return the original message.
       *
       * @param messageId {String} the message ID
       * @return {String} messageId
       */
      marktr: function marktr(messageId) {
        var nlsManager = qx.locale.Manager;

        if (nlsManager) {
          return nlsManager.marktr.apply(nlsManager, arguments);
        }

        throw new Error("To enable localization please include qx.locale.Manager into your build!");
      }
    }
  });
  qx.locale.MTranslation.$$dbClassInfo = $$dbClassInfo;
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
      "qx.theme.manager.Color": {},
      "qx.theme.manager.Decoration": {},
      "qx.theme.manager.Font": {},
      "qx.theme.manager.Icon": {},
      "qx.theme.manager.Appearance": {},
      "qx.core.Environment": {},
      "qx.Theme": {}
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
   * Manager for meta themes
   */
  qx.Class.define("qx.theme.manager.Meta", {
    type: "singleton",
    extend: qx.core.Object,
    events: {
      /** Fires if any theme manager has been changed. */
      "changeTheme": "qx.event.type.Event"
    },
    properties: {
      /**
       * Meta theme. Applies the defined color, decoration, ... themes to
       * the corresponding managers.
       */
      theme: {
        check: "Theme",
        nullable: false,
        apply: "_applyTheme"
      }
    },
    members: {
      // property apply
      _applyTheme: function _applyTheme(value, old) {
        // collect changes
        var colorChanged = true;
        var decorationChanged = true;
        var fontChanged = true;
        var iconChanged = true;
        var appearanceChanged = true;

        if (old) {
          colorChanged = value.meta.color !== old.meta.color;
          decorationChanged = value.meta.decoration !== old.meta.decoration;
          fontChanged = value.meta.font !== old.meta.font;
          iconChanged = value.meta.icon !== old.meta.icon;
          appearanceChanged = value.meta.appearance !== old.meta.appearance;
        }

        var colorMgr = qx.theme.manager.Color.getInstance();
        var decorationMgr = qx.theme.manager.Decoration.getInstance();
        var fontMgr = qx.theme.manager.Font.getInstance();
        var iconMgr = qx.theme.manager.Icon.getInstance();
        var appearanceMgr = qx.theme.manager.Appearance.getInstance(); // suspend listeners

        this._suspendEvents(); // apply meta changes


        if (colorChanged) {
          // color theme changed, but decorator not? force decorator
          if (!decorationChanged) {
            var dec = decorationMgr.getTheme();

            decorationMgr._applyTheme(dec);
          }

          colorMgr.setTheme(value.meta.color);
        }

        decorationMgr.setTheme(value.meta.decoration);
        fontMgr.setTheme(value.meta.font);
        iconMgr.setTheme(value.meta.icon);
        appearanceMgr.setTheme(value.meta.appearance); // fire change event only if at least one theme manager changed

        if (colorChanged || decorationChanged || fontChanged || iconChanged || appearanceChanged) {
          this.fireEvent("changeTheme");
        } // re add listener


        this._activateEvents();
      },
      __timer: null,

      /**
       * Fires <code>changeTheme</code> event.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      _fireEvent: function _fireEvent(e) {
        if (e.getTarget() === qx.theme.manager.Color.getInstance()) {
          // force clearing all previously created CSS rules, to be able to
          // re-create decorator rules with changed color theme
          qx.theme.manager.Decoration.getInstance().refresh();
        }

        this.fireEvent("changeTheme");
      },

      /**
       * Removes listeners for <code>changeTheme</code> event of all
       * related theme managers.
       */
      _suspendEvents: function _suspendEvents() {
        var colorMgr = qx.theme.manager.Color.getInstance();
        var decorationMgr = qx.theme.manager.Decoration.getInstance();
        var fontMgr = qx.theme.manager.Font.getInstance();
        var iconMgr = qx.theme.manager.Icon.getInstance();
        var appearanceMgr = qx.theme.manager.Appearance.getInstance(); // suspend listeners

        if (colorMgr.hasListener("changeTheme")) {
          colorMgr.removeListener("changeTheme", this._fireEvent, this);
        }

        if (decorationMgr.hasListener("changeTheme")) {
          decorationMgr.removeListener("changeTheme", this._fireEvent, this);
        }

        if (fontMgr.hasListener("changeTheme")) {
          fontMgr.removeListener("changeTheme", this._fireEvent, this);
        }

        if (iconMgr.hasListener("changeTheme")) {
          iconMgr.removeListener("changeTheme", this._fireEvent, this);
        }

        if (appearanceMgr.hasListener("changeTheme")) {
          appearanceMgr.removeListener("changeTheme", this._fireEvent, this);
        }
      },

      /**
       * Activates listeners for <code>changeTheme</code> event of all related
       * theme managers, to forwards the event to this meta manager instance.
       */
      _activateEvents: function _activateEvents() {
        var colorMgr = qx.theme.manager.Color.getInstance();
        var decorationMgr = qx.theme.manager.Decoration.getInstance();
        var fontMgr = qx.theme.manager.Font.getInstance();
        var iconMgr = qx.theme.manager.Icon.getInstance();
        var appearanceMgr = qx.theme.manager.Appearance.getInstance(); // add listeners to check changes

        if (!colorMgr.hasListener("changeTheme")) {
          colorMgr.addListener("changeTheme", this._fireEvent, this);
        }

        if (!decorationMgr.hasListener("changeTheme")) {
          decorationMgr.addListener("changeTheme", this._fireEvent, this);
        }

        if (!fontMgr.hasListener("changeTheme")) {
          fontMgr.addListener("changeTheme", this._fireEvent, this);
        }

        if (!iconMgr.hasListener("changeTheme")) {
          iconMgr.addListener("changeTheme", this._fireEvent, this);
        }

        if (!appearanceMgr.hasListener("changeTheme")) {
          appearanceMgr.addListener("changeTheme", this._fireEvent, this);
        }
      },

      /**
       * Initialize the themes which were selected using the settings. Should only
       * be called from qooxdoo based application.
       */
      initialize: function initialize() {
        var env = qx.core.Environment;
        var theme, obj;
        theme = env.get("qx.theme");

        if (theme) {
          obj = qx.Theme.getByName(theme);

          if (!obj) {
            throw new Error("The theme to use is not available: " + theme);
          }

          this.setTheme(obj);
        }
      }
    },

    /*
    *****************************************************************************
       ENVIRONMENT SETTINGS
    *****************************************************************************
    */
    environment: {
      "qx.theme": "qx.theme.Modern"
    }
  });
  qx.theme.manager.Meta.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.ui.core.EventHandler": {},
      "qx.event.handler.DragDrop": {},
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.LayoutItem": {
        "construct": true,
        "require": true
      },
      "qx.locale.MTranslation": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.core.Assert": {},
      "qx.util.ObjectPool": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.Abstract": {},
      "qx.ui.core.queue.Layout": {},
      "qx.ui.core.queue.Visibility": {},
      "qx.lang.Object": {},
      "qx.theme.manager.Decoration": {},
      "qx.ui.core.queue.Manager": {},
      "qx.html.Element": {},
      "qx.lang.Array": {},
      "qx.event.Registration": {},
      "qx.event.dispatch.MouseCapture": {},
      "qx.Bootstrap": {},
      "qx.locale.Manager": {},
      "qx.bom.client.Engine": {},
      "qx.theme.manager.Color": {},
      "qx.lang.Type": {},
      "qx.ui.core.queue.Appearance": {},
      "qx.theme.manager.Appearance": {},
      "qx.core.Property": {},
      "qx.ui.core.DragDropCursor": {},
      "qx.bom.element.Location": {},
      "qx.ui.core.queue.Dispose": {},
      "qx.core.ObjectRegistry": {},
      "qx.ui.core.queue.Widget": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /* ************************************************************************
  
  
  
  ************************************************************************ */

  /**
   * This is the base class for all widgets.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @use(qx.ui.core.EventHandler)
   * @use(qx.event.handler.DragDrop)
   * @asset(qx/static/blank.gif)
   *
   * @ignore(qx.ui.root.Inline)
   */
  qx.Class.define("qx.ui.core.Widget", {
    extend: qx.ui.core.LayoutItem,
    include: [qx.locale.MTranslation],
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.LayoutItem.constructor.call(this); // Create basic element

      this.__contentElement = this.__createContentElement(); // Initialize properties

      this.initFocusable();
      this.initSelectable();
      this.initNativeContextMenu();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired after the widget appears on the screen.
       */
      appear: "qx.event.type.Event",

      /**
       * Fired after the widget disappears from the screen.
       */
      disappear: "qx.event.type.Event",

      /**
       * Fired after the creation of a child control. The passed data is the
       * newly created child widget.
       */
      createChildControl: "qx.event.type.Data",

      /**
       * Fired on resize (after layout) of the widget.
       * The data property of the event contains the widget's computed location
       * and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      resize: "qx.event.type.Data",

      /**
       * Fired on move (after layout) of the widget.
       * The data property of the event contains the widget's computed location
       * and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      move: "qx.event.type.Data",

      /**
       * Fired after the appearance has been applied. This happens before the
       * widget becomes visible, on state and appearance changes. The data field
       * contains the state map. This can be used to react on state changes or to
       * read properties set by the appearance.
       */
      syncAppearance: "qx.event.type.Data",

      /** Fired if the mouse cursor moves over the widget.
       *  The data property of the event contains the widget's computed location
       *  and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      mousemove: "qx.event.type.Mouse",

      /**
       * Fired if the mouse cursor enters the widget.
       *
       * Note: This event is also dispatched if the widget is disabled!
       */
      mouseover: "qx.event.type.Mouse",

      /**
       * Fired if the mouse cursor leaves widget.
       *
       * Note: This event is also dispatched if the widget is disabled!
       */
      mouseout: "qx.event.type.Mouse",

      /** Mouse button is pressed on the widget. */
      mousedown: "qx.event.type.Mouse",

      /** Mouse button is released on the widget. */
      mouseup: "qx.event.type.Mouse",

      /** Widget is clicked using left or middle button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      click: "qx.event.type.Mouse",

      /** Widget is clicked using a non primary button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      auxclick: "qx.event.type.Mouse",

      /** Widget is double clicked using left or middle button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      dblclick: "qx.event.type.Mouse",

      /** Widget is clicked using the right mouse button. */
      contextmenu: "qx.event.type.Mouse",

      /** Fired before the context menu is opened. */
      beforeContextmenuOpen: "qx.event.type.Data",

      /** Fired if the mouse wheel is used over the widget. */
      mousewheel: "qx.event.type.MouseWheel",

      /** Fired if a touch at the screen is started. */
      touchstart: "qx.event.type.Touch",

      /** Fired if a touch at the screen has ended. */
      touchend: "qx.event.type.Touch",

      /** Fired during a touch at the screen. */
      touchmove: "qx.event.type.Touch",

      /** Fired if a touch at the screen is canceled. */
      touchcancel: "qx.event.type.Touch",

      /** Fired when a pointer taps on the screen. */
      tap: "qx.event.type.Tap",

      /** Fired when a pointer holds on the screen. */
      longtap: "qx.event.type.Tap",

      /** Fired when a pointer taps twice on the screen. */
      dbltap: "qx.event.type.Tap",

      /** Fired when a pointer swipes over the screen. */
      swipe: "qx.event.type.Touch",

      /** Fired when two pointers performing a rotate gesture on the screen. */
      rotate: "qx.event.type.Rotate",

      /** Fired when two pointers performing a pinch in/out gesture on the screen. */
      pinch: "qx.event.type.Pinch",

      /** Fired when an active pointer moves on the screen (after pointerdown till pointerup). */
      track: "qx.event.type.Track",

      /** Fired when an active pointer moves on the screen or the mouse wheel is used. */
      roll: "qx.event.type.Roll",

      /** Fired if a pointer (mouse/touch/pen) moves or changes any of it's values. */
      pointermove: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) hovers the widget. */
      pointerover: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) leaves this widget. */
      pointerout: "qx.event.type.Pointer",

      /**
       * Fired if a pointer (mouse/touch/pen) button is pressed or
       * a finger touches the widget.
       */
      pointerdown: "qx.event.type.Pointer",

      /**
       * Fired if all pointer (mouse/touch/pen) buttons are released or
       * the finger is lifted from the widget.
       */
      pointerup: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) action is canceled. */
      pointercancel: "qx.event.type.Pointer",

      /** This event if fired if a keyboard key is released. */
      keyup: "qx.event.type.KeySequence",

      /**
       * This event if fired if a keyboard key is pressed down. This event is
       * only fired once if the user keeps the key pressed for a while.
       */
      keydown: "qx.event.type.KeySequence",

      /**
       * This event is fired any time a key is pressed. It will be repeated if
       * the user keeps the key pressed. The pressed key can be determined using
       * {@link qx.event.type.KeySequence#getKeyIdentifier}.
       */
      keypress: "qx.event.type.KeySequence",

      /**
       * This event is fired if the pressed key or keys result in a printable
       * character. Since the character is not necessarily associated with a
       * single physical key press, the event does not have a key identifier
       * getter. This event gets repeated if the user keeps pressing the key(s).
       *
       * The unicode code of the pressed key can be read using
       * {@link qx.event.type.KeyInput#getCharCode}.
       */
      keyinput: "qx.event.type.KeyInput",

      /**
       * The event is fired when the widget gets focused. Only widgets which are
       * {@link #focusable} receive this event.
       */
      focus: "qx.event.type.Focus",

      /**
       * The event is fired when the widget gets blurred. Only widgets which are
       * {@link #focusable} receive this event.
       */
      blur: "qx.event.type.Focus",

      /**
       * When the widget itself or any child of the widget receive the focus.
       */
      focusin: "qx.event.type.Focus",

      /**
       * When the widget itself or any child of the widget lost the focus.
       */
      focusout: "qx.event.type.Focus",

      /**
       * When the widget gets active (receives keyboard events etc.)
       */
      activate: "qx.event.type.Focus",

      /**
       * When the widget gets inactive
       */
      deactivate: "qx.event.type.Focus",

      /**
       * Fired if the widget becomes the capturing widget by a call to {@link #capture}.
       */
      capture: "qx.event.type.Event",

      /**
       * Fired if the widget looses the capturing mode by a call to
       * {@link #releaseCapture} or a mouse click.
       */
      losecapture: "qx.event.type.Event",

      /**
       * Fired on the drop target when the drag&drop action is finished
       * successfully. This event is normally used to transfer the data
       * from the drag to the drop target.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      drop: "qx.event.type.Drag",

      /**
       * Fired on a potential drop target when leaving it.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragleave: "qx.event.type.Drag",

      /**
       * Fired on a potential drop target when reaching it via the pointer.
       * This event can be canceled if none of the incoming data types
       * are supported.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragover: "qx.event.type.Drag",

      /**
       * Fired during the drag. Contains the current pointer coordinates
       * using {@link qx.event.type.Drag#getDocumentLeft} and
       * {@link qx.event.type.Drag#getDocumentTop}
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      drag: "qx.event.type.Drag",

      /**
       * Initiate the drag-and-drop operation. This event is cancelable
       * when the drag operation is currently not allowed/possible.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragstart: "qx.event.type.Drag",

      /**
       * Fired on the source (drag) target every time a drag session was ended.
       */
      dragend: "qx.event.type.Drag",

      /**
       * Fired when the drag configuration has been modified e.g. the user
       * pressed a key which changed the selected action. This event will be
       * fired on the draggable and the droppable element. In case of the
       * droppable element, you can cancel the event and prevent a drop based on
       * e.g. the current action.
       */
      dragchange: "qx.event.type.Drag",

      /**
       * Fired when the drop was successfully done and the target widget
       * is now asking for data. The listener should transfer the data,
       * respecting the selected action, to the event. This can be done using
       * the event's {@link qx.event.type.Drag#addData} method.
       */
      droprequest: "qx.event.type.Drag"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        PADDING
      ---------------------------------------------------------------------------
      */

      /** Padding of the widget (top) */
      paddingTop: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (right) */
      paddingRight: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (bottom) */
      paddingBottom: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (left) */
      paddingLeft: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /**
       * The 'padding' property is a shorthand property for setting 'paddingTop',
       * 'paddingRight', 'paddingBottom' and 'paddingLeft' at the same time.
       *
       * If four values are specified they apply to top, right, bottom and left respectively.
       * If there is only one value, it applies to all sides, if there are two or three,
       * the missing values are taken from the opposite side.
       */
      padding: {
        group: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        STYLING PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * The z-index property sets the stack order of an element. An element with
       * greater stack order is always in front of another element with lower stack order.
       */
      zIndex: {
        nullable: true,
        init: 10,
        apply: "_applyZIndex",
        event: "changeZIndex",
        check: "Integer",
        themeable: true
      },

      /**
       * The decorator property points to an object, which is responsible
       * for drawing the widget's decoration, e.g. border, background or shadow.
       *
       * This can be a decorator object or a string pointing to a decorator
       * defined in the decoration theme.
       */
      decorator: {
        nullable: true,
        init: null,
        apply: "_applyDecorator",
        event: "changeDecorator",
        check: "Decorator",
        themeable: true
      },

      /**
       * The background color the rendered widget.
       */
      backgroundColor: {
        nullable: true,
        check: "Color",
        apply: "_applyBackgroundColor",
        event: "changeBackgroundColor",
        themeable: true
      },

      /**
       * The text color the rendered widget.
       */
      textColor: {
        nullable: true,
        check: "Color",
        apply: "_applyTextColor",
        event: "changeTextColor",
        themeable: true,
        inheritable: true
      },

      /**
       * The widget's font. The value is either a font name defined in the font
       * theme or an instance of {@link qx.bom.Font}.
       */
      font: {
        nullable: true,
        apply: "_applyFont",
        check: "Font",
        event: "changeFont",
        themeable: true,
        inheritable: true,
        dereference: true
      },

      /**
       * Mapping to native style property opacity.
       *
       * The uniform opacity setting to be applied across an entire object.
       * Behaves like the new CSS-3 Property.
       * Any values outside the range 0.0 (fully transparent) to 1.0
       * (fully opaque) will be clamped to this range.
       */
      opacity: {
        check: "Number",
        apply: "_applyOpacity",
        themeable: true,
        nullable: true,
        init: null
      },

      /**
       * Mapping to native style property cursor.
       *
       * The name of the cursor to show when the pointer is over the widget.
       * This is any valid CSS2 cursor name defined by W3C.
       *
       * The following values are possible crossbrowser:
       * <ul><li>default</li>
       * <li>crosshair</li>
       * <li>pointer</li>
       * <li>move</li>
       * <li>n-resize</li>
       * <li>ne-resize</li>
       * <li>e-resize</li>
       * <li>se-resize</li>
       * <li>s-resize</li>
       * <li>sw-resize</li>
       * <li>w-resize</li>
       * <li>nw-resize</li>
       * <li>nesw-resize</li>
       * <li>nwse-resize</li>
       * <li>text</li>
       * <li>wait</li>
       * <li>help </li>
       * </ul>
       */
      cursor: {
        check: "String",
        apply: "_applyCursor",
        themeable: true,
        inheritable: true,
        nullable: true,
        init: null
      },

      /**
       * Sets the tooltip instance to use for this widget. If only the tooltip
       * text and icon have to be set its better to use the {@link #toolTipText}
       * and {@link #toolTipIcon} properties since they use a shared tooltip
       * instance.
       *
       * If this property is set the {@link #toolTipText} and {@link #toolTipIcon}
       * properties are ignored.
       */
      toolTip: {
        check: "qx.ui.tooltip.ToolTip",
        nullable: true
      },

      /**
       * The text of the widget's tooltip. This text can contain HTML markup.
       * The text is displayed using a shared tooltip instance. If the tooltip
       * must be customized beyond the text and an icon {@link #toolTipIcon}, the
       * {@link #toolTip} property has to be used
       */
      toolTipText: {
        check: "String",
        nullable: true,
        event: "changeToolTipText",
        apply: "_applyToolTipText"
      },

      /**
      * The icon URI of the widget's tooltip. This icon is displayed using a shared
      * tooltip instance. If the tooltip must be customized beyond the tooltip text
      * {@link #toolTipText} and the icon, the {@link #toolTip} property has to be
      * used.
      */
      toolTipIcon: {
        check: "String",
        nullable: true,
        event: "changeToolTipText"
      },

      /**
       * Controls if a tooltip should shown or not.
       */
      blockToolTip: {
        check: "Boolean",
        init: false
      },

      /**
       * Forces to show tooltip when widget is disabled.
       */
      showToolTipWhenDisabled: {
        check: "Boolean",
        init: false
      },

      /*
      ---------------------------------------------------------------------------
        MANAGEMENT PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * Controls the visibility. Valid values are:
       *
       * <ul>
       *   <li><b>visible</b>: Render the widget</li>
       *   <li><b>hidden</b>: Hide the widget but don't relayout the widget's parent.</li>
       *   <li><b>excluded</b>: Hide the widget and relayout the parent as if the
       *     widget was not a child of its parent.</li>
       * </ul>
       */
      visibility: {
        check: ["visible", "hidden", "excluded"],
        init: "visible",
        apply: "_applyVisibility",
        event: "changeVisibility"
      },

      /**
       * Whether the widget is enabled. Disabled widgets are usually grayed out
       * and do not process user created events. While in the disabled state most
       * user input events are blocked. Only the {@link #pointerover} and
       * {@link #pointerout} events will be dispatched.
       */
      enabled: {
        init: true,
        check: "Boolean",
        inheritable: true,
        apply: "_applyEnabled",
        event: "changeEnabled"
      },

      /**
       * Whether the widget is anonymous.
       *
       * Anonymous widgets are ignored in the event hierarchy. This is useful
       * for combined widgets where the internal structure do not have a custom
       * appearance with a different styling from the element around. This is
       * especially true for widgets like checkboxes or buttons where the text
       * or icon are handled synchronously for state changes to the outer widget.
       */
      anonymous: {
        init: false,
        check: "Boolean",
        apply: "_applyAnonymous"
      },

      /**
       * Defines the tab index of an widget. If widgets with tab indexes are part
       * of the current focus root these elements are sorted in first priority. Afterwards
       * the sorting continues by rendered position, zIndex and other criteria.
       *
       * Please note: The value must be between 1 and 32000.
       */
      tabIndex: {
        check: "Integer",
        nullable: true,
        apply: "_applyTabIndex"
      },

      /**
       * Whether the widget is focusable e.g. rendering a focus border and visualize
       * as active element.
       *
       * See also {@link #isTabable} which allows runtime checks for
       * <code>isChecked</code> or other stuff to test whether the widget is
       * reachable via the TAB key.
       */
      focusable: {
        check: "Boolean",
        init: false,
        apply: "_applyFocusable"
      },

      /**
       * If this property is enabled, the widget and all of its child widgets
       * will never get focused. The focus keeps at the currently
       * focused widget.
       *
       * This only works for widgets which are not {@link #focusable}.
       *
       * This is mainly useful for widget authors. Please use with caution!
       */
      keepFocus: {
        check: "Boolean",
        init: false,
        apply: "_applyKeepFocus"
      },

      /**
       * If this property if enabled, the widget and all of its child widgets
       * will never get activated. The activation keeps at the currently
       * activated widget.
       *
       * This is mainly useful for widget authors. Please use with caution!
       */
      keepActive: {
        check: "Boolean",
        init: false,
        apply: "_applyKeepActive"
      },

      /** Whether the widget acts as a source for drag&drop operations */
      draggable: {
        check: "Boolean",
        init: false,
        apply: "_applyDraggable"
      },

      /** Whether the widget acts as a target for drag&drop operations */
      droppable: {
        check: "Boolean",
        init: false,
        apply: "_applyDroppable"
      },

      /**
       * Whether the widget contains content which may be selected by the user.
       *
       * If the value set to <code>true</code> the native browser selection can
       * be used for text selection. But it is normally useful for
       * forms fields, longer texts/documents, editors, etc.
       */
      selectable: {
        check: "Boolean",
        init: false,
        event: "changeSelectable",
        apply: "_applySelectable"
      },

      /**
       * Whether to show a context menu and which one
       */
      contextMenu: {
        check: "qx.ui.menu.Menu",
        apply: "_applyContextMenu",
        nullable: true,
        event: "changeContextMenu"
      },

      /**
       * Whether the native context menu should be enabled for this widget. To
       * globally enable the native context menu set the {@link #nativeContextMenu}
       * property of the root widget ({@link qx.ui.root.Abstract}) to
       * <code>true</code>.
       */
      nativeContextMenu: {
        check: "Boolean",
        init: false,
        themeable: true,
        event: "changeNativeContextMenu",
        apply: "_applyNativeContextMenu"
      },

      /**
       * The appearance ID. This ID is used to identify the appearance theme
       * entry to use for this widget. This controls the styling of the element.
       */
      appearance: {
        check: "String",
        init: "widget",
        apply: "_applyAppearance",
        event: "changeAppearance"
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Whether the widget should print out hints and debug messages */
      DEBUG: false,

      /** Whether to throw an error on focus/blur if the widget is unfocusable */
      UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR: true,

      /**
       * Returns the widget, which contains the given DOM element.
       *
       * @param element {Element} The DOM element to search the widget for.
       * @param considerAnonymousState {Boolean?false} If true, anonymous widget
       *   will not be returned.
       * @return {qx.ui.core.Widget} The widget containing the element.
       */
      getWidgetByElement: function getWidgetByElement(element, considerAnonymousState) {
        while (element) {
          {
            qx.core.Assert.assertTrue(!element.$$widget && !element.$$widgetObject || element.$$widgetObject && element.$$widget && element.$$widgetObject.toHashCode() === element.$$widget);
          }
          var widget = element.$$widgetObject; // check for anonymous widgets

          if (widget) {
            if (!considerAnonymousState || !widget.getAnonymous()) {
              return widget;
            }
          } // Fix for FF, which occasionally breaks (BUG#3525)


          try {
            element = element.parentNode;
          } catch (e) {
            return null;
          }
        }

        return null;
      },

      /**
       * Whether the "parent" widget contains the "child" widget.
       *
       * @param parent {qx.ui.core.Widget} The parent widget
       * @param child {qx.ui.core.Widget} The child widget
       * @return {Boolean} Whether one of the "child"'s parents is "parent"
       */
      contains: function contains(parent, child) {
        while (child) {
          child = child.getLayoutParent();

          if (parent == child) {
            return true;
          }
        }

        return false;
      },

      /** @type {Map} Contains all pooled separators for reuse */
      __separatorPool: new qx.util.ObjectPool()
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __contentElement: null,
      __initialAppearanceApplied: null,
      __toolTipTextListenerId: null,

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */

      /**
       * @type {qx.ui.layout.Abstract} The connected layout manager
       */
      __layoutManager: null,
      // overridden
      _getLayout: function _getLayout() {
        return this.__layoutManager;
      },

      /**
       * Set a layout manager for the widget. A a layout manager can only be connected
       * with one widget. Reset the connection with a previous widget first, if you
       * like to use it in another widget instead.
       *
       * @param layout {qx.ui.layout.Abstract} The new layout or
       *     <code>null</code> to reset the layout.
       */
      _setLayout: function _setLayout(layout) {
        {
          if (layout) {
            this.assertInstance(layout, qx.ui.layout.Abstract);
          }
        }

        if (this.__layoutManager) {
          this.__layoutManager.connectToWidget(null);
        }

        if (layout) {
          layout.connectToWidget(this);
        }

        this.__layoutManager = layout;
        qx.ui.core.queue.Layout.add(this);
      },
      // overridden
      setLayoutParent: function setLayoutParent(parent) {
        if (this.$$parent === parent) {
          return;
        }

        var content = this.getContentElement();

        if (this.$$parent && !this.$$parent.$$disposed) {
          this.$$parent.getContentElement().remove(content);
        }

        this.$$parent = parent || null;

        if (parent && !parent.$$disposed) {
          this.$$parent.getContentElement().add(content);
        } // Update inheritable properties


        this.$$refreshInheritables(); // Update visibility cache

        qx.ui.core.queue.Visibility.add(this);
      },

      /** @type {Boolean} Whether insets have changed and must be updated */
      _updateInsets: null,
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        var changes = qx.ui.core.Widget.prototype.renderLayout.base.call(this, left, top, width, height); // Directly return if superclass has detected that no
        // changes needs to be applied

        if (!changes) {
          return null;
        }

        if (qx.lang.Object.isEmpty(changes) && !this._updateInsets) {
          return null;
        }

        var content = this.getContentElement();
        var inner = changes.size || this._updateInsets;
        var pixel = "px";
        var contentStyles = {}; // Move content to new position

        if (changes.position) {
          contentStyles.left = left + pixel;
          contentStyles.top = top + pixel;
        }

        if (inner || changes.margin) {
          contentStyles.width = width + pixel;
          contentStyles.height = height + pixel;
        }

        if (Object.keys(contentStyles).length > 0) {
          content.setStyles(contentStyles);
        }

        if (inner || changes.local || changes.margin) {
          if (this.__layoutManager && this.hasLayoutChildren()) {
            var inset = this.getInsets();
            var innerWidth = width - inset.left - inset.right;
            var innerHeight = height - inset.top - inset.bottom;
            var decorator = this.getDecorator();
            var decoratorPadding = {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            };

            if (decorator) {
              decorator = qx.theme.manager.Decoration.getInstance().resolve(decorator);
              decoratorPadding = decorator.getPadding();
            }

            var padding = {
              top: this.getPaddingTop() + decoratorPadding.top,
              right: this.getPaddingRight() + decoratorPadding.right,
              bottom: this.getPaddingBottom() + decoratorPadding.bottom,
              left: this.getPaddingLeft() + decoratorPadding.left
            };

            this.__layoutManager.renderLayout(innerWidth, innerHeight, padding);
          } else if (this.hasLayoutChildren()) {
            throw new Error("At least one child in control " + this._findTopControl() + " requires a layout, but no one was defined!");
          }
        } // Fire events


        if (changes.position && this.hasListener("move")) {
          this.fireDataEvent("move", this.getBounds());
        }

        if (changes.size && this.hasListener("resize")) {
          this.fireDataEvent("resize", this.getBounds());
        } // Cleanup flags


        delete this._updateInsets;
        return changes;
      },

      /*
      ---------------------------------------------------------------------------
        SEPARATOR SUPPORT
      ---------------------------------------------------------------------------
      */
      __separators: null,
      // overridden
      clearSeparators: function clearSeparators() {
        var reg = this.__separators;

        if (!reg) {
          return;
        }

        var pool = qx.ui.core.Widget.__separatorPool;
        var content = this.getContentElement();
        var widget;

        for (var i = 0, l = reg.length; i < l; i++) {
          widget = reg[i];
          pool.poolObject(widget);
          content.remove(widget.getContentElement());
        } // Clear registry


        reg.length = 0;
      },
      // overridden
      renderSeparator: function renderSeparator(separator, bounds) {
        // Insert
        var widget = qx.ui.core.Widget.__separatorPool.getObject(qx.ui.core.Widget);

        widget.set({
          decorator: separator
        });
        var elem = widget.getContentElement();
        this.getContentElement().add(elem); // Move

        var domEl = elem.getDomElement(); // use the DOM element because the cache of the qx.html.Element could be
        // wrong due to changes made by the decorators which work on the DOM element too

        if (domEl) {
          domEl.style.top = bounds.top + "px";
          domEl.style.left = bounds.left + "px";
          domEl.style.width = bounds.width + "px";
          domEl.style.height = bounds.height + "px";
        } else {
          elem.setStyles({
            left: bounds.left + "px",
            top: bounds.top + "px",
            width: bounds.width + "px",
            height: bounds.height + "px"
          });
        } // Remember element


        if (!this.__separators) {
          this.__separators = [];
        }

        this.__separators.push(widget);
      },

      /*
      ---------------------------------------------------------------------------
        SIZE HINTS
      ---------------------------------------------------------------------------
      */
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        // Start with the user defined values
        var width = this.getWidth();
        var minWidth = this.getMinWidth();
        var maxWidth = this.getMaxWidth();
        var height = this.getHeight();
        var minHeight = this.getMinHeight();
        var maxHeight = this.getMaxHeight();
        {
          if (minWidth !== null && maxWidth !== null) {
            this.assert(minWidth <= maxWidth, "minWidth is larger than maxWidth!");
          }

          if (minHeight !== null && maxHeight !== null) {
            this.assert(minHeight <= maxHeight, "minHeight is larger than maxHeight!");
          }
        } // Ask content

        var contentHint = this._getContentHint();

        var insets = this.getInsets();
        var insetX = insets.left + insets.right;
        var insetY = insets.top + insets.bottom;

        if (width == null) {
          width = contentHint.width + insetX;
        }

        if (height == null) {
          height = contentHint.height + insetY;
        }

        if (minWidth == null) {
          minWidth = insetX;

          if (contentHint.minWidth != null) {
            minWidth += contentHint.minWidth; // do not apply bigger min width than max width [BUG #5008]

            if (minWidth > maxWidth && maxWidth != null) {
              minWidth = maxWidth;
            }
          }
        }

        if (minHeight == null) {
          minHeight = insetY;

          if (contentHint.minHeight != null) {
            minHeight += contentHint.minHeight; // do not apply bigger min height than max height [BUG #5008]

            if (minHeight > maxHeight && maxHeight != null) {
              minHeight = maxHeight;
            }
          }
        }

        if (maxWidth == null) {
          if (contentHint.maxWidth == null) {
            maxWidth = Infinity;
          } else {
            maxWidth = contentHint.maxWidth + insetX; // do not apply bigger min width than max width [BUG #5008]

            if (maxWidth < minWidth && minWidth != null) {
              maxWidth = minWidth;
            }
          }
        }

        if (maxHeight == null) {
          if (contentHint.maxHeight == null) {
            maxHeight = Infinity;
          } else {
            maxHeight = contentHint.maxHeight + insetY; // do not apply bigger min width than max width [BUG #5008]

            if (maxHeight < minHeight && minHeight != null) {
              maxHeight = minHeight;
            }
          }
        } // Build size hint and return


        return {
          width: width,
          minWidth: minWidth,
          maxWidth: maxWidth,
          height: height,
          minHeight: minHeight,
          maxHeight: maxHeight
        };
      },
      // overridden
      invalidateLayoutCache: function invalidateLayoutCache() {
        qx.ui.core.Widget.prototype.invalidateLayoutCache.base.call(this);

        if (this.__layoutManager) {
          this.__layoutManager.invalidateLayoutCache();
        }
      },

      /**
       * Returns the recommended/natural dimensions of the widget's content.
       *
       * For labels and images this may be their natural size when defined without
       * any dimensions. For containers this may be the recommended size of the
       * underlying layout manager.
       *
       * Developer note: This can be overwritten by the derived classes to allow
       * a custom handling here.
       *
       * @return {Map}
       */
      _getContentHint: function _getContentHint() {
        var layout = this.__layoutManager;

        if (layout) {
          if (this.hasLayoutChildren()) {
            var hint = layout.getSizeHint();
            {
              var msg = "The layout of the widget" + this.toString() + " returned an invalid size hint!";
              this.assertInteger(hint.width, "Wrong 'left' argument. " + msg);
              this.assertInteger(hint.height, "Wrong 'top' argument. " + msg);
            }
            return hint;
          } else {
            return {
              width: 0,
              height: 0
            };
          }
        } else {
          return {
            width: 100,
            height: 50
          };
        }
      },
      // overridden
      _getHeightForWidth: function _getHeightForWidth(width) {
        // Prepare insets
        var insets = this.getInsets();
        var insetX = insets.left + insets.right;
        var insetY = insets.top + insets.bottom; // Compute content width

        var contentWidth = width - insetX; // Compute height

        var layout = this._getLayout();

        if (layout && layout.hasHeightForWidth()) {
          var contentHeight = layout.getHeightForWidth(contentWidth);
        } else {
          contentHeight = this._getContentHeightForWidth(contentWidth);
        } // Computed box height


        var height = contentHeight + insetY;
        return height;
      },

      /**
       * Returns the computed height for the given width.
       *
       * @abstract
       * @param width {Integer} Incoming width (as limitation)
       * @return {Integer} Computed height while respecting the given width.
       */
      _getContentHeightForWidth: function _getContentHeightForWidth(width) {
        throw new Error("Abstract method call: _getContentHeightForWidth()!");
      },

      /*
      ---------------------------------------------------------------------------
        INSET CALCULATION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the sum of the widget's padding and border width.
       *
       * @return {Map} Contains the keys <code>top</code>, <code>right</code>,
       *   <code>bottom</code> and <code>left</code>. All values are integers.
       */
      getInsets: function getInsets() {
        var top = this.getPaddingTop();
        var right = this.getPaddingRight();
        var bottom = this.getPaddingBottom();
        var left = this.getPaddingLeft();

        if (this.getDecorator()) {
          var decorator = qx.theme.manager.Decoration.getInstance().resolve(this.getDecorator());
          var inset = decorator.getInsets();
          {
            this.assertNumber(inset.top, "Invalid top decorator inset detected: " + inset.top);
            this.assertNumber(inset.right, "Invalid right decorator inset detected: " + inset.right);
            this.assertNumber(inset.bottom, "Invalid bottom decorator inset detected: " + inset.bottom);
            this.assertNumber(inset.left, "Invalid left decorator inset detected: " + inset.left);
          }
          top += inset.top;
          right += inset.right;
          bottom += inset.bottom;
          left += inset.left;
        }

        return {
          "top": top,
          "right": right,
          "bottom": bottom,
          "left": left
        };
      },

      /*
      ---------------------------------------------------------------------------
        COMPUTED LAYOUT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the widget's computed inner size as available
       * through the layout process.
       *
       * This function is guaranteed to return a correct value
       * during a {@link #resize} or {@link #move} event dispatch.
       *
       * @return {Map} The widget inner dimension in pixel (if the layout is
       *    valid). Contains the keys <code>width</code> and <code>height</code>.
       */
      getInnerSize: function getInnerSize() {
        var computed = this.getBounds();

        if (!computed) {
          return null;
        } // Return map data


        var insets = this.getInsets();
        return {
          width: computed.width - insets.left - insets.right,
          height: computed.height - insets.top - insets.bottom
        };
      },

      /*
      ---------------------------------------------------------------------------
        ANIMATION SUPPORT: USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Fade out this widget.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeOut: function fadeOut(duration) {
        return this.getContentElement().fadeOut(duration);
      },

      /**
       * Fade in the widget.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeIn: function fadeIn(duration) {
        return this.getContentElement().fadeIn(duration);
      },

      /*
      ---------------------------------------------------------------------------
        VISIBILITY SUPPORT: USER API
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyAnonymous: function _applyAnonymous(value) {
        if (value) {
          this.getContentElement().setAttribute("qxanonymous", "true");
        } else {
          this.getContentElement().removeAttribute("qxanonymous");
        }
      },

      /**
       * Make this widget visible.
       *
       */
      show: function show() {
        this.setVisibility("visible");
      },

      /**
       * Hide this widget.
       *
       */
      hide: function hide() {
        this.setVisibility("hidden");
      },

      /**
       * Hide this widget and exclude it from the underlying layout.
       *
       */
      exclude: function exclude() {
        this.setVisibility("excluded");
      },

      /**
       * Whether the widget is locally visible.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is visible
       */
      isVisible: function isVisible() {
        return this.getVisibility() === "visible";
      },

      /**
       * Whether the widget is locally hidden.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is hidden
       */
      isHidden: function isHidden() {
        return this.getVisibility() !== "visible";
      },

      /**
       * Whether the widget is locally excluded.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is excluded
       */
      isExcluded: function isExcluded() {
        return this.getVisibility() === "excluded";
      },

      /**
       * Detects if the widget and all its parents are visible.
       *
       * WARNING: Please use this method with caution because it flushes the
       * internal queues which might be an expensive operation.
       *
       * @return {Boolean} true, if the widget is currently on the screen
       */
      isSeeable: function isSeeable() {
        // Flush the queues because to detect if the widget ins visible, the
        // queues need to be flushed (see bug #5254)
        qx.ui.core.queue.Manager.flush(); // if the element is already rendered, a check for the offsetWidth is enough

        var element = this.getContentElement().getDomElement();

        if (element) {
          // will also be 0 if the parents are not visible
          return element.offsetWidth > 0;
        } // if no element is available, it can not be visible


        return false;
      },

      /*
      ---------------------------------------------------------------------------
        CREATION OF HTML ELEMENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Create the widget's content HTML element.
       *
       * @return {qx.html.Element} The content HTML element
       */
      __createContentElement: function __createContentElement() {
        var el = this._createContentElement();

        el.connectWidget(this); // make sure to allow all pointer events

        el.setStyles({
          "touch-action": "none",
          "-ms-touch-action": "none"
        });
        {
          el.setAttribute("qxClass", this.classname);
        }
        var styles = {
          "zIndex": 10,
          "boxSizing": "border-box"
        };

        if (!qx.ui.root.Inline || !(this instanceof qx.ui.root.Inline)) {
          styles.position = "absolute";
        }

        el.setStyles(styles);
        return el;
      },

      /**
       * Creates the content element. The style properties
       * position and zIndex are modified from the Widget
       * core.
       *
       * This function may be overridden to customize a class
       * content.
       *
       * @return {qx.html.Element} The widget's content element
       */
      _createContentElement: function _createContentElement() {
        return new qx.html.Element("div", {
          overflowX: "hidden",
          overflowY: "hidden"
        });
      },

      /**
       * Returns the element wrapper of the widget's content element.
       * This method exposes widget internal and must be used with caution!
       *
       * @return {qx.html.Element} The widget's content element
       */
      getContentElement: function getContentElement() {
        return this.__contentElement;
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING
      ---------------------------------------------------------------------------
      */

      /** @type {qx.ui.core.LayoutItem[]} List of all child widgets */
      __widgetChildren: null,

      /**
       * Returns all children, which are layout relevant. This excludes all widgets,
       * which have a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>.
       *
       * @internal
       * @return {qx.ui.core.Widget[]} All layout relevant children.
       */
      getLayoutChildren: function getLayoutChildren() {
        var children = this.__widgetChildren;

        if (!children) {
          return this.__emptyChildren;
        }

        var layoutChildren;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];

          if (child.hasUserBounds() || child.isExcluded()) {
            if (layoutChildren == null) {
              layoutChildren = children.concat();
            }

            qx.lang.Array.remove(layoutChildren, child);
          }
        }

        return layoutChildren || children;
      },

      /**
       * Marks the layout of this widget as invalid and triggers a layout update.
       * This is a shortcut for <code>qx.ui.core.queue.Layout.add(this);</code>.
       */
      scheduleLayoutUpdate: function scheduleLayoutUpdate() {
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Resets the cache for children which should be laid out.
       */
      invalidateLayoutChildren: function invalidateLayoutChildren() {
        var layout = this.__layoutManager;

        if (layout) {
          layout.invalidateChildrenCache();
        }

        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Returns whether the layout has children, which are layout relevant. This
       * excludes all widgets, which have a {@link qx.ui.core.Widget#visibility}
       * value of <code>exclude</code>.
       *
       * @return {Boolean} Whether the layout has layout relevant children
       */
      hasLayoutChildren: function hasLayoutChildren() {
        var children = this.__widgetChildren;

        if (!children) {
          return false;
        }

        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (!child.hasUserBounds() && !child.isExcluded()) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns the widget which contains the children and
       * is relevant for laying them out. This is from the user point of
       * view and may not be identical to the technical structure.
       *
       * @return {qx.ui.core.Widget} Widget which contains the children.
       */
      getChildrenContainer: function getChildrenContainer() {
        return this;
      },

      /**
       * @type {Array} Placeholder for children list in empty widgets.
       *     Mainly to keep instance number low.
       *
       * @lint ignoreReferenceField(__emptyChildren)
       */
      __emptyChildren: [],

      /**
       * Returns the children list
       *
       * @return {qx.ui.core.LayoutItem[]} The children array (Arrays are
       *   reference types, so please do not modify it in-place).
       */
      _getChildren: function _getChildren() {
        return this.__widgetChildren || this.__emptyChildren;
      },

      /**
       * Returns the index position of the given widget if it is
       * a child widget. Otherwise it returns <code>-1</code>.
       *
       * @param child {qx.ui.core.Widget} the widget to query for
       * @return {Integer} The index position or <code>-1</code> when
       *   the given widget is no child of this layout.
       */
      _indexOf: function _indexOf(child) {
        var children = this.__widgetChildren;

        if (!children) {
          return -1;
        }

        return children.indexOf(child);
      },

      /**
       * Whether the widget contains children.
       *
       * @return {Boolean} Returns <code>true</code> when the widget has children.
       */
      _hasChildren: function _hasChildren() {
        var children = this.__widgetChildren;
        return children != null && !!children[0];
      },

      /**
       * Recursively adds all children to the given queue
       *
       * @param queue {Array} The queue to add widgets to
       */
      addChildrenToQueue: function addChildrenToQueue(queue) {
        var children = this.__widgetChildren;

        if (!children) {
          return;
        }

        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          queue.push(child);
          child.addChildrenToQueue(queue);
        }
      },

      /**
       * Adds a new child widget.
       *
       * The supported keys of the layout options map depend on the layout manager
       * used to position the widget. The options are documented in the class
       * documentation of each layout manager {@link qx.ui.layout}.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to add.
       * @param options {Map?null} Optional layout data for widget.
       */
      _add: function _add(child, options) {
        {
          this.assertInstance(child, qx.ui.core.LayoutItem.constructor, "'Child' must be an instance of qx.ui.core.LayoutItem!");
        } // When moving in the same widget, remove widget first

        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren, child);
        }

        if (this.__widgetChildren) {
          this.__widgetChildren.push(child);
        } else {
          this.__widgetChildren = [child];
        }

        this.__addHelper(child, options);
      },

      /**
       * Add a child widget at the specified index
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param index {Integer} Index, at which the widget will be inserted. If no
       *   widget exists at the given index, the new widget gets appended to the
       *   current list of children.
       * @param options {Map?null} Optional layout data for widget.
       */
      _addAt: function _addAt(child, index, options) {
        if (!this.__widgetChildren) {
          this.__widgetChildren = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren, child);
        }

        var ref = this.__widgetChildren[index];

        if (ref === child) {
          child.setLayoutProperties(options);
        }

        if (ref) {
          qx.lang.Array.insertBefore(this.__widgetChildren, child, ref);
        } else {
          this.__widgetChildren.push(child);
        }

        this.__addHelper(child, options);
      },

      /**
       * Add a widget before another already inserted widget
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param before {qx.ui.core.LayoutItem} widget before the new widget will be inserted.
       * @param options {Map?null} Optional layout data for widget.
       */
      _addBefore: function _addBefore(child, before, options) {
        {
          this.assertInArray(before, this._getChildren(), "The 'before' widget is not a child of this widget!");
        }

        if (child == before) {
          return;
        }

        if (!this.__widgetChildren) {
          this.__widgetChildren = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren, child);
        }

        qx.lang.Array.insertBefore(this.__widgetChildren, child, before);

        this.__addHelper(child, options);
      },

      /**
       * Add a widget after another already inserted widget
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param after {qx.ui.core.LayoutItem} widget, after which the new widget will
       *   be inserted
       * @param options {Map?null} Optional layout data for widget.
       */
      _addAfter: function _addAfter(child, after, options) {
        {
          this.assertInArray(after, this._getChildren(), "The 'after' widget is not a child of this widget!");
        }

        if (child == after) {
          return;
        }

        if (!this.__widgetChildren) {
          this.__widgetChildren = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren, child);
        }

        qx.lang.Array.insertAfter(this.__widgetChildren, child, after);

        this.__addHelper(child, options);
      },

      /**
       * Remove the given child widget.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to remove
       */
      _remove: function _remove(child) {
        if (!this.__widgetChildren) {
          throw new Error("This widget has no children!");
        }

        qx.lang.Array.remove(this.__widgetChildren, child);

        this.__removeHelper(child);
      },

      /**
       * Remove the widget at the specified index.
       *
       * @param index {Integer} Index of the widget to remove.
       * @return {qx.ui.core.LayoutItem} The removed item.
       */
      _removeAt: function _removeAt(index) {
        if (!this.__widgetChildren) {
          throw new Error("This widget has no children!");
        }

        var child = this.__widgetChildren[index];
        qx.lang.Array.removeAt(this.__widgetChildren, index);

        this.__removeHelper(child);

        return child;
      },

      /**
       * Remove all children.
       *
       * @return {Array} An array containing the removed children.
       */
      _removeAll: function _removeAll() {
        if (!this.__widgetChildren) {
          return [];
        } // Working on a copy to make it possible to clear the
        // internal array before calling setLayoutParent()


        var children = this.__widgetChildren.concat();

        this.__widgetChildren.length = 0;

        for (var i = children.length - 1; i >= 0; i--) {
          this.__removeHelper(children[i]);
        }

        qx.ui.core.queue.Layout.add(this);
        return children;
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING - TEMPLATE METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * This method gets called each time after a child widget was added and can
       * be overridden to get notified about child adds.
       *
       * @signature function(child)
       * @param child {qx.ui.core.LayoutItem} The added child.
       */
      _afterAddChild: null,

      /**
       * This method gets called each time after a child widget was removed and
       * can be overridden to get notified about child removes.
       *
       * @signature function(child)
       * @param child {qx.ui.core.LayoutItem} The removed child.
       */
      _afterRemoveChild: null,

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING - IMPLEMENTATION
      ---------------------------------------------------------------------------
      */

      /**
       * Convenience function to add a child widget. It will insert the child to
       * the parent widget and schedule a layout update.
       *
       * @param child {qx.ui.core.LayoutItem} The child to add.
       * @param options {Map|null} Optional layout data for the widget.
       */
      __addHelper: function __addHelper(child, options) {
        {
          this.assertInstance(child, qx.ui.core.LayoutItem, "Invalid widget to add: " + child);
          this.assertNotIdentical(child, this, "Could not add widget to itself: " + child);

          if (options != null) {
            this.assertType(options, "object", "Invalid layout data: " + options);
          }
        } // Remove from old parent

        var parent = child.getLayoutParent();

        if (parent && parent != this) {
          parent._remove(child);
        } // Remember parent


        child.setLayoutParent(this); // Import options: This call will
        //  - clear the layout's children cache as well and
        //  - add its parent (this widget) to the layout queue

        if (options) {
          child.setLayoutProperties(options);
        } else {
          this.updateLayoutProperties();
        } // call the template method


        if (this._afterAddChild) {
          this._afterAddChild(child);
        }
      },

      /**
       * Convenience function to remove a child widget. It will remove it
       * from the parent widget and schedule a layout update.
       *
       * @param child {qx.ui.core.LayoutItem} The child to remove.
       */
      __removeHelper: function __removeHelper(child) {
        {
          this.assertNotUndefined(child);
        }

        if (child.getLayoutParent() !== this) {
          throw new Error("Remove Error: " + child + " is not a child of this widget!");
        } // Clear parent connection


        child.setLayoutParent(null); // clear the layout's children cache

        if (this.__layoutManager) {
          this.__layoutManager.invalidateChildrenCache();
        } // Add to layout queue


        qx.ui.core.queue.Layout.add(this); // call the template method

        if (this._afterRemoveChild) {
          this._afterRemoveChild(child);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Enables pointer event capturing. All pointer events will dispatched on this
       * widget until capturing is disabled using {@link #releaseCapture} or a
       * pointer button is clicked. If the widgets becomes the capturing widget the
       * {@link #capture} event is fired. Once it loses capture mode the
       * {@link #losecapture} event is fired.
       *
       * @param capture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       */
      capture: function capture(_capture) {
        this.getContentElement().capture(_capture);
      },

      /**
       * Disables pointer capture mode enabled by {@link #capture}.
       */
      releaseCapture: function releaseCapture() {
        this.getContentElement().releaseCapture();
      },

      /**
       * Checks if pointer event capturing is enabled for this widget.
       *
       * @return {Boolean} <code>true</code> if capturing is active
       */
      isCapturing: function isCapturing() {
        var el = this.getContentElement().getDomElement();

        if (!el) {
          return false;
        }

        var manager = qx.event.Registration.getManager(el);
        var dispatcher = manager.getDispatcher(qx.event.dispatch.MouseCapture);
        return el == dispatcher.getCaptureElement();
      },

      /*
      ---------------------------------------------------------------------------
        PADDING SUPPORT
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyPadding: function _applyPadding(value, old, name) {
        this._updateInsets = true;
        qx.ui.core.queue.Layout.add(this);

        this.__updateContentPadding(name, value);
      },

      /**
       * Helper to updated the css padding of the content element considering the
       * padding of the decorator.
       * @param style {String} The name of the css padding property e.g. <code>paddingTop</code>
       * @param value {Number} The value to set.
       */
      __updateContentPadding: function __updateContentPadding(style, value) {
        var content = this.getContentElement();
        var decorator = this.getDecorator();
        decorator = qx.theme.manager.Decoration.getInstance().resolve(decorator);

        if (decorator) {
          var direction = qx.Bootstrap.firstLow(style.replace("padding", ""));
          value += decorator.getPadding()[direction] || 0;
        }

        content.setStyle(style, value + "px");
      },

      /*
      ---------------------------------------------------------------------------
        DECORATION SUPPORT
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyDecorator: function _applyDecorator(value, old) {
        var content = this.getContentElement();

        if (old) {
          old = qx.theme.manager.Decoration.getInstance().getCssClassName(old);
          content.removeClass(old);
        }

        if (value) {
          value = qx.theme.manager.Decoration.getInstance().addCssClass(value);
          content.addClass(value);
        }

        if (value || old) {
          qx.ui.core.queue.Layout.add(this);
        }
      },

      /*
      ---------------------------------------------------------------------------
        OTHER PROPERTIES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyToolTipText: function _applyToolTipText(value, old) {
        {
          if (this.__toolTipTextListenerId) {
            return;
          }

          var manager = qx.locale.Manager.getInstance();
          this.__toolTipTextListenerId = manager.addListener("changeLocale", function () {
            var toolTipText = this.getToolTipText();

            if (toolTipText && toolTipText.translate) {
              this.setToolTipText(toolTipText.translate());
            }
          }, this);
        }
      },
      // property apply
      _applyTextColor: function _applyTextColor(value, old) {// empty template
      },
      // property apply
      _applyZIndex: function _applyZIndex(value, old) {
        this.getContentElement().setStyle("zIndex", value == null ? 0 : value);
      },
      // property apply
      _applyVisibility: function _applyVisibility(value, old) {
        var content = this.getContentElement();

        if (value === "visible") {
          content.show();
        } else {
          content.hide();
        } // only force a layout update if visibility change from/to "exclude"


        var parent = this.$$parent;

        if (parent && (old == null || value == null || old === "excluded" || value === "excluded")) {
          parent.invalidateLayoutChildren();
        } // Update visibility cache


        qx.ui.core.queue.Visibility.add(this);
      },
      // property apply
      _applyOpacity: function _applyOpacity(value, old) {
        this.getContentElement().setStyle("opacity", value == 1 ? null : value);
      },
      // property apply
      _applyCursor: function _applyCursor(value, old) {
        if (value == null && !this.isSelectable()) {
          value = "default";
        } // In Opera the cursor must be set directly.
        // http://bugzilla.qooxdoo.org/show_bug.cgi?id=1729


        this.getContentElement().setStyle("cursor", value, qx.core.Environment.get("engine.name") == "opera");
      },
      // property apply
      _applyBackgroundColor: function _applyBackgroundColor(value, old) {
        var color = this.getBackgroundColor();
        var content = this.getContentElement();
        var resolved = qx.theme.manager.Color.getInstance().resolve(color);
        content.setStyle("backgroundColor", resolved);
      },
      // property apply
      _applyFont: function _applyFont(value, old) {// empty template
      },

      /*
      ---------------------------------------------------------------------------
        DYNAMIC THEME SWITCH SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _onChangeTheme: function _onChangeTheme() {
        if (this.isDisposed()) {
          return;
        }

        qx.ui.core.Widget.prototype._onChangeTheme.base.call(this); // update the appearance


        this.updateAppearance(); // DECORATOR //

        var value = this.getDecorator();

        this._applyDecorator(null, value);

        this._applyDecorator(value); // FONT //


        value = this.getFont();

        if (qx.lang.Type.isString(value)) {
          this._applyFont(value, value);
        } // TEXT COLOR //


        value = this.getTextColor();

        if (qx.lang.Type.isString(value)) {
          this._applyTextColor(value, value);
        } // BACKGROUND COLOR //


        value = this.getBackgroundColor();

        if (qx.lang.Type.isString(value)) {
          this._applyBackgroundColor(value, value);
        }
      },

      /*
      ---------------------------------------------------------------------------
        STATE HANDLING
      ---------------------------------------------------------------------------
      */

      /** @type {Map} The current widget states */
      __states: null,

      /** @type {Boolean} Whether the widget has state changes which are not yet queued */
      $$stateChanges: null,

      /** @type {Map} Can be overridden to forward states to the child controls. */
      _forwardStates: null,

      /**
       * Returns whether a state is set.
       *
       * @param state {String} the state to check.
       * @return {Boolean} whether the state is set.
       */
      hasState: function hasState(state) {
        var states = this.__states;
        return !!states && !!states[state];
      },

      /**
       * Sets a state.
       *
       * @param state {String} The state to add
       */
      addState: function addState(state) {
        // Dynamically create state map
        var states = this.__states;

        if (!states) {
          states = this.__states = {};
        }

        if (states[state]) {
          return;
        } // Add state and queue


        this.__states[state] = true; // Fast path for hovered state

        if (state === "hovered") {
          this.syncAppearance();
        } else if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls;

        if (forward && forward[state] && controls) {
          var control;

          for (var id in controls) {
            control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              controls[id].addState(state);
            }
          }
        }
      },

      /**
       * Clears a state.
       *
       * @param state {String} the state to clear.
       */
      removeState: function removeState(state) {
        // Check for existing state
        var states = this.__states;

        if (!states || !states[state]) {
          return;
        } // Clear state and queue


        delete this.__states[state]; // Fast path for hovered state

        if (state === "hovered") {
          this.syncAppearance();
        } else if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls;

        if (forward && forward[state] && controls) {
          for (var id in controls) {
            var control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              control.removeState(state);
            }
          }
        }
      },

      /**
       * Replaces the first state with the second one.
       *
       * This method is ideal for state transitions e.g. normal => selected.
       *
       * @param old {String} Previous state
       * @param value {String} New state
       */
      replaceState: function replaceState(old, value) {
        var states = this.__states;

        if (!states) {
          states = this.__states = {};
        }

        if (!states[value]) {
          states[value] = true;
        }

        if (states[old]) {
          delete states[old];
        }

        if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls;

        if (forward && forward[value] && controls) {
          for (var id in controls) {
            var control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              control.replaceState(old, value);
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPEARANCE SUPPORT
      ---------------------------------------------------------------------------
      */

      /** @type {String} The currently compiled selector to lookup the matching appearance */
      __appearanceSelector: null,

      /** @type {Boolean} Whether the selectors needs to be recomputed before updating appearance */
      __updateSelector: null,

      /**
       * Renders the appearance using the current widget states.
       *
       * Used exclusively by {qx.ui.core.queue.Appearance}.
       */
      syncAppearance: function syncAppearance() {
        var states = this.__states;
        var selector = this.__appearanceSelector;
        var manager = qx.theme.manager.Appearance.getInstance(); // Cache deep accessor

        var styler = qx.core.Property.$$method.setThemed;
        var unstyler = qx.core.Property.$$method.resetThemed; // Check for requested selector update

        if (this.__updateSelector) {
          // Clear flag
          delete this.__updateSelector; // Check if the selector was created previously

          if (selector) {
            // Query old selector
            var oldData = manager.styleFrom(selector, states, null, this.getAppearance()); // Clear current selector (to force recompute)

            selector = null;
          }
        } // Build selector


        if (!selector) {
          var obj = this;
          var id = [];

          do {
            id.push(obj.$$subcontrol || obj.getAppearance());
          } while (obj = obj.$$subparent); // Combine parent control IDs, add top level appearance, filter result
          // to not include positioning information anymore (e.g. #3)


          selector = id.reverse().join("/").replace(/#[0-9]+/g, "");
          this.__appearanceSelector = selector;
        } // Query current selector


        var newData = manager.styleFrom(selector, states, null, this.getAppearance());

        if (newData) {
          if (oldData) {
            for (var prop in oldData) {
              if (newData[prop] === undefined) {
                this[unstyler[prop]]();
              }
            }
          } // Check property availability of new data


          {
            for (var prop in newData) {
              if (!this[styler[prop]]) {
                throw new Error(this.classname + ' has no themeable property "' + prop + '" while styling ' + selector);
              }
            }
          } // Apply new data

          for (var prop in newData) {
            newData[prop] === undefined ? this[unstyler[prop]]() : this[styler[prop]](newData[prop]);
          }
        } else if (oldData) {
          // Clear old data
          for (var prop in oldData) {
            this[unstyler[prop]]();
          }
        }

        this.fireDataEvent("syncAppearance", this.__states);
      },
      // property apply
      _applyAppearance: function _applyAppearance(value, old) {
        this.updateAppearance();
      },

      /**
       * Helper method called from the visibility queue to detect outstanding changes
       * to the appearance.
       *
       * @internal
       */
      checkAppearanceNeeds: function checkAppearanceNeeds() {
        // CASE 1: Widget has never got an appearance already because it was never
        // visible before. Normally add it to the queue is the easiest way to update it.
        if (!this.__initialAppearanceApplied) {
          qx.ui.core.queue.Appearance.add(this);
          this.__initialAppearanceApplied = true;
        } // CASE 2: Widget has got an appearance before, but was hidden for some time
        // which results into maybe omitted state changes have not been applied.
        // In this case the widget is already queued in the appearance. This is basically
        // what all addState/removeState do, but the queue itself may not have been registered
        // to be flushed
        else if (this.$$stateChanges) {
            qx.ui.core.queue.Appearance.add(this);
            delete this.$$stateChanges;
          }
      },

      /**
       * Refreshes the appearance of this widget and all
       * registered child controls.
       */
      updateAppearance: function updateAppearance() {
        // Clear selector
        this.__updateSelector = true; // Add to appearance queue

        qx.ui.core.queue.Appearance.add(this); // Update child controls

        var controls = this.__childControls;

        if (controls) {
          var obj;

          for (var id in controls) {
            obj = controls[id];

            if (obj instanceof qx.ui.core.Widget) {
              obj.updateAppearance();
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET QUEUE
      ---------------------------------------------------------------------------
      */

      /**
       * This method is called during the flush of the
       * {@link qx.ui.core.queue.Widget widget queue}.
       *
       * @param jobs {Map} A map of jobs.
       */
      syncWidget: function syncWidget(jobs) {// empty implementation
      },

      /*
      ---------------------------------------------------------------------------
        EVENT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the next event target in the parent chain. May
       * also return the widget itself if it is not anonymous.
       *
       * @return {qx.ui.core.Widget} A working event target of this widget.
       *    May be <code>null</code> as well.
       */
      getEventTarget: function getEventTarget() {
        var target = this;

        while (target.getAnonymous()) {
          target = target.getLayoutParent();

          if (!target) {
            return null;
          }
        }

        return target;
      },

      /**
       * Returns the next focus target in the parent chain. May
       * also return the widget itself if it is not anonymous and focusable.
       *
       * @return {qx.ui.core.Widget} A working focus target of this widget.
       *    May be <code>null</code> as well.
       */
      getFocusTarget: function getFocusTarget() {
        var target = this;

        if (!target.getEnabled()) {
          return null;
        }

        while (target.getAnonymous() || !target.getFocusable()) {
          target = target.getLayoutParent();

          if (!target || !target.getEnabled()) {
            return null;
          }
        }

        return target;
      },

      /**
       * Returns the element which should be focused.
       *
       * @return {qx.html.Element} The html element to focus.
       */
      getFocusElement: function getFocusElement() {
        return this.getContentElement();
      },

      /**
       * Whether the widget is reachable by pressing the TAB key.
       *
       * Normally tests for both, the focusable property and a positive or
       * undefined tabIndex property. The widget must have a DOM element
       * since only visible widgets are tabable.
       *
       * @return {Boolean} Whether the element is tabable.
       */
      isTabable: function isTabable() {
        return !!this.getContentElement().getDomElement() && this.isFocusable();
      },
      // property apply
      _applyFocusable: function _applyFocusable(value, old) {
        var target = this.getFocusElement(); // Apply native tabIndex attribute

        if (value) {
          var tabIndex = this.getTabIndex();

          if (tabIndex == null) {
            tabIndex = 1;
          }

          target.setAttribute("tabIndex", tabIndex); // Omit native dotted outline border

          target.setStyle("outline", "none");
        } else {
          if (target.isNativelyFocusable()) {
            target.setAttribute("tabIndex", -1);
          } else if (old) {
            target.setAttribute("tabIndex", null);
          }
        }
      },
      // property apply
      _applyKeepFocus: function _applyKeepFocus(value) {
        var target = this.getFocusElement();
        target.setAttribute("qxKeepFocus", value ? "on" : null);
      },
      // property apply
      _applyKeepActive: function _applyKeepActive(value) {
        var target = this.getContentElement();
        target.setAttribute("qxKeepActive", value ? "on" : null);
      },
      // property apply
      _applyTabIndex: function _applyTabIndex(value) {
        if (value == null) {
          value = 1;
        } else if (value < 1 || value > 32000) {
          throw new Error("TabIndex property must be between 1 and 32000");
        }

        if (this.getFocusable() && value != null) {
          this.getFocusElement().setAttribute("tabIndex", value);
        }
      },
      // property apply
      _applySelectable: function _applySelectable(value, old) {
        // Re-apply cursor if not in "initSelectable"
        if (old !== null) {
          this._applyCursor(this.getCursor());
        } // Apply qooxdoo attribute


        this.getContentElement().setSelectable(value);
      },
      // property apply
      _applyEnabled: function _applyEnabled(value, old) {
        if (value === false) {
          this.addState("disabled"); // hovered not configured in widget, but as this is a
          // standardized name in qooxdoo and we never want a hover
          // state for disabled widgets, remove this state every time

          this.removeState("hovered"); // Blur when focused

          if (this.isFocusable()) {
            // Remove focused state
            this.removeState("focused"); // Remove tabIndex

            this._applyFocusable(false, true);
          } // Remove draggable


          if (this.isDraggable()) {
            this._applyDraggable(false, true);
          } // Remove droppable


          if (this.isDroppable()) {
            this._applyDroppable(false, true);
          }
        } else {
          this.removeState("disabled"); // Re-add tabIndex

          if (this.isFocusable()) {
            this._applyFocusable(true, false);
          } // Re-add draggable


          if (this.isDraggable()) {
            this._applyDraggable(true, false);
          } // Re-add droppable


          if (this.isDroppable()) {
            this._applyDroppable(true, false);
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        CONTEXT MENU
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyNativeContextMenu: function _applyNativeContextMenu(value, old, name) {// empty body to allow overriding
      },
      // property apply
      _applyContextMenu: function _applyContextMenu(value, old) {
        if (old) {
          old.removeState("contextmenu");

          if (old.getOpener() == this) {
            old.resetOpener();
          }

          if (!value) {
            this.removeListener("contextmenu", this._onContextMenuOpen);
            this.removeListener("longtap", this._onContextMenuOpen);
            old.removeListener("changeVisibility", this._onBeforeContextMenuOpen, this);
          }
        }

        if (value) {
          value.setOpener(this);
          value.addState("contextmenu");

          if (!old) {
            this.addListener("contextmenu", this._onContextMenuOpen);
            this.addListener("longtap", this._onContextMenuOpen);
            value.addListener("changeVisibility", this._onBeforeContextMenuOpen, this);
          }
        }
      },

      /**
       * Event listener for <code>contextmenu</code> event
       *
       * @param e {qx.event.type.Pointer} The event object
       */
      _onContextMenuOpen: function _onContextMenuOpen(e) {
        // only allow long tap context menu on touch interactions
        if (e.getType() == "longtap") {
          if (e.getPointerType() !== "touch") {
            return;
          }
        }

        this.getContextMenu().openAtPointer(e); // Do not show native menu
        // don't open any other contextmenus

        e.stop();
      },

      /**
       * Event listener for <code>beforeContextmenuOpen</code> event
       *
       * @param e {qx.event.type.Data} The data event
       */
      _onBeforeContextMenuOpen: function _onBeforeContextMenuOpen(e) {
        if (e.getData() == "visible" && this.hasListener("beforeContextmenuOpen")) {
          this.fireDataEvent("beforeContextmenuOpen", e);
        }
      },

      /*
      ---------------------------------------------------------------------------
        USEFUL COMMON EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener which stops a bubbling event from
       * propagates further.
       *
       * @param e {qx.event.type.Event} Any bubbling event
       */
      _onStopEvent: function _onStopEvent(e) {
        e.stopPropagation();
      },

      /*
      ---------------------------------------------------------------------------
        DRAG & DROP SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Helper to return a instance of a {@link qx.ui.core.DragDropCursor}.
       * If you want to use your own DragDropCursor, override this method
       * and return your custom instance.
       * @return {qx.ui.core.DragDropCursor} A drag drop cursor implementation.
       */
      _getDragDropCursor: function _getDragDropCursor() {
        return qx.ui.core.DragDropCursor.getInstance();
      },
      // property apply
      _applyDraggable: function _applyDraggable(value, old) {
        if (!this.isEnabled() && value === true) {
          value = false;
        } // Force cursor creation


        this._getDragDropCursor(); // Process listeners


        if (value) {
          this.addListener("dragstart", this._onDragStart);
          this.addListener("drag", this._onDrag);
          this.addListener("dragend", this._onDragEnd);
          this.addListener("dragchange", this._onDragChange);
        } else {
          this.removeListener("dragstart", this._onDragStart);
          this.removeListener("drag", this._onDrag);
          this.removeListener("dragend", this._onDragEnd);
          this.removeListener("dragchange", this._onDragChange);
        } // Sync DOM attribute


        this.getContentElement().setAttribute("qxDraggable", value ? "on" : null);
      },
      // property apply
      _applyDroppable: function _applyDroppable(value, old) {
        if (!this.isEnabled() && value === true) {
          value = false;
        } // Sync DOM attribute


        this.getContentElement().setAttribute("qxDroppable", value ? "on" : null);
      },

      /**
       * Event listener for own <code>dragstart</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragStart: function _onDragStart(e) {
        this._getDragDropCursor().placeToPointer(e);

        this.getApplicationRoot().setGlobalCursor("default");
      },

      /**
       * Event listener for own <code>drag</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDrag: function _onDrag(e) {
        this._getDragDropCursor().placeToPointer(e);
      },

      /**
       * Event listener for own <code>dragend</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragEnd: function _onDragEnd(e) {
        this._getDragDropCursor().moveTo(-1000, -1000);

        this.getApplicationRoot().resetGlobalCursor();
      },

      /**
       * Event listener for own <code>dragchange</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragChange: function _onDragChange(e) {
        var cursor = this._getDragDropCursor();

        var action = e.getCurrentAction();
        action ? cursor.setAction(action) : cursor.resetAction();
      },

      /*
      ---------------------------------------------------------------------------
        VISUALIZE FOCUS STATES
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler which is executed when the widget receives the focus.
       *
       * This method is used by the {@link qx.ui.core.FocusHandler} to
       * apply states etc. to a focused widget.
       *
       * @internal
       */
      visualizeFocus: function visualizeFocus() {
        this.addState("focused");
      },

      /**
       * Event handler which is executed when the widget lost the focus.
       *
       * This method is used by the {@link qx.ui.core.FocusHandler} to
       * remove states etc. from a previously focused widget.
       *
       * @internal
       */
      visualizeBlur: function visualizeBlur() {
        this.removeState("focused");
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL CHILD INTO VIEW
      ---------------------------------------------------------------------------
      */

      /**
       * The method scrolls the given item into view.
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param alignX {String?null} Alignment of the item. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param alignY {String?null} Alignment of the item. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoView: function scrollChildIntoView(child, alignX, alignY, direct) {
        // Scroll directly on default
        direct = typeof direct == "undefined" ? true : direct; // Always lazy scroll when either
        // - the child
        // - its layout parent
        // - its siblings
        // have layout changes scheduled.
        //
        // This is to make sure that the scroll position is computed
        // after layout changes have been applied to the DOM. Note that changes
        // scheduled for the grand parent (and up) are not tracked and need to
        // be signaled manually.

        var Layout = qx.ui.core.queue.Layout;
        var parent; // Child

        if (direct) {
          direct = !Layout.isScheduled(child);
          parent = child.getLayoutParent(); // Parent

          if (direct && parent) {
            direct = !Layout.isScheduled(parent); // Siblings

            if (direct) {
              parent.getChildren().forEach(function (sibling) {
                direct = direct && !Layout.isScheduled(sibling);
              });
            }
          }
        }

        this.scrollChildIntoViewX(child, alignX, direct);
        this.scrollChildIntoViewY(child, alignY, direct);
      },

      /**
       * The method scrolls the given item into view (x-axis only).
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param align {String?null} Alignment of the item. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewX: function scrollChildIntoViewX(child, align, direct) {
        this.getContentElement().scrollChildIntoViewX(child.getContentElement(), align, direct);
      },

      /**
       * The method scrolls the given item into view (y-axis only).
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewY: function scrollChildIntoViewY(child, align, direct) {
        this.getContentElement().scrollChildIntoViewY(child.getContentElement(), align, direct);
      },

      /*
      ---------------------------------------------------------------------------
        FOCUS SYSTEM USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Focus this widget.
       *
       */
      focus: function focus() {
        if (this.isFocusable()) {
          this.getFocusElement().focus();
        } else if (qx.ui.core.Widget.UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR) {
          throw new Error("Widget is not focusable!");
        }
      },

      /**
       * Remove focus from this widget.
       *
       */
      blur: function blur() {
        if (this.isFocusable()) {
          this.getFocusElement().blur();
        } else if (qx.ui.core.Widget.UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR) {
          throw new Error("Widget is not focusable!");
        }
      },

      /**
       * Activate this widget e.g. for keyboard events.
       *
       */
      activate: function activate() {
        this.getContentElement().activate();
      },

      /**
       * Deactivate this widget e.g. for keyboard events.
       *
       */
      deactivate: function deactivate() {
        this.getContentElement().deactivate();
      },

      /**
       * Focus this widget when using the keyboard. This is
       * mainly thought for the advanced qooxdoo keyboard handling
       * and should not be used by the application developer.
       *
       * @internal
       */
      tabFocus: function tabFocus() {
        this.getFocusElement().focus();
      },

      /*
      ---------------------------------------------------------------------------
        CHILD CONTROL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Whether the given ID is assigned to a child control.
       *
       * @param id {String} ID of the child control
       * @return {Boolean} <code>true</code> when the child control is registered.
       */
      hasChildControl: function hasChildControl(id) {
        if (!this.__childControls) {
          return false;
        }

        return !!this.__childControls[id];
      },

      /** @type {Map} Map of instantiated child controls */
      __childControls: null,

      /**
       * Returns a map of all already created child controls
       *
       * @return {Map} mapping of child control id to the child widget.
       */
      _getCreatedChildControls: function _getCreatedChildControls() {
        return this.__childControls;
      },

      /**
       * Returns the child control from the given ID. Returns
       * <code>null</code> when the child control is unknown.
       *
       * It is designed for widget authors, who want to access child controls,
       * which are created by the widget itself.
       *
       * <b>Warning</b>: This method exposes widget internals and modifying the
       * returned sub widget may bring the widget into an inconsistent state.
       * Accessing child controls defined in a super class or in an foreign class
       * is not supported. Do not use it if the result can be achieved using public
       * API or theming.
       *
       * @param id {String} ID of the child control
       * @param notcreate {Boolean?false} Whether the child control
       *    should not be created dynamically if not yet available.
       * @return {qx.ui.core.Widget} Child control
       */
      getChildControl: function getChildControl(id, notcreate) {
        if (!this.__childControls) {
          if (notcreate) {
            return null;
          }

          this.__childControls = {};
        }

        var control = this.__childControls[id];

        if (control) {
          return control;
        }

        if (notcreate === true) {
          return null;
        }

        return this._createChildControl(id);
      },

      /**
       * Shows the given child control by ID
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} the child control
       */
      _showChildControl: function _showChildControl(id) {
        var control = this.getChildControl(id);
        control.show();
        return control;
      },

      /**
       * Excludes the given child control by ID
       *
       * @param id {String} ID of the child control
       */
      _excludeChildControl: function _excludeChildControl(id) {
        var control = this.getChildControl(id, true);

        if (control) {
          control.exclude();
        }
      },

      /**
       * Whether the given child control is visible.
       *
       * @param id {String} ID of the child control
       * @return {Boolean} <code>true</code> when the child control is visible.
       */
      _isChildControlVisible: function _isChildControlVisible(id) {
        var control = this.getChildControl(id, true);

        if (control) {
          return control.isVisible();
        }

        return false;
      },

      /**
       * Release the child control by ID and decouple the
       * child from the parent. This method does not dispose the child control.
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} The released control
       */
      _releaseChildControl: function _releaseChildControl(id) {
        var control = this.getChildControl(id, false);

        if (!control) {
          throw new Error("Unsupported control: " + id);
        } // remove connection to parent


        delete control.$$subcontrol;
        delete control.$$subparent; // remove state forwarding

        var states = this.__states;
        var forward = this._forwardStates;

        if (states && forward && control instanceof qx.ui.core.Widget) {
          for (var state in states) {
            if (forward[state]) {
              control.removeState(state);
            }
          }
        }

        delete this.__childControls[id];
        return control;
      },

      /**
       * Force the creation of the given child control by ID.
       *
       * Do not override this method! Override {@link #_createChildControlImpl}
       * instead if you need to support new controls.
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} The created control
       * @throws {Error} when the control was created before
       */
      _createChildControl: function _createChildControl(id) {
        if (!this.__childControls) {
          this.__childControls = {};
        } else if (this.__childControls[id]) {
          throw new Error("Child control '" + id + "' already created!");
        }

        var pos = id.indexOf("#");

        try {
          if (pos == -1) {
            var control = this._createChildControlImpl(id);
          } else {
            var control = this._createChildControlImpl(id.substring(0, pos), id.substring(pos + 1, id.length));
          }
        } catch (exc) {
          exc.message = "Exception while creating child control '" + id + "' of widget " + this.toString() + ": " + exc.message;
          throw exc;
        }

        if (!control) {
          throw new Error("Unsupported control: " + id);
        } // Establish connection to parent


        control.$$subcontrol = id;
        control.$$subparent = this; // Support for state forwarding

        var states = this.__states;
        var forward = this._forwardStates;

        if (states && forward && control instanceof qx.ui.core.Widget) {
          for (var state in states) {
            if (forward[state]) {
              control.addState(state);
            }
          }
        } // If the appearance is already synced after the child control
        // we need to update the appearance now, because the selector
        // might be not correct in certain cases.


        if (control.$$resyncNeeded) {
          delete control.$$resyncNeeded;
          control.updateAppearance();
        }

        this.fireDataEvent("createChildControl", control); // Register control and return

        return this.__childControls[id] = control;
      },

      /**
       * Internal method to create child controls. This method
       * should be overwritten by classes which extends this one
       * to support new child control types.
       *
       * @param id {String} ID of the child control. If a # is used, the id is
       *   the part in front of the #.
       * @param hash {String?undefined} If a child control name contains a #,
       *   all text following the # will be the hash argument.
       * @return {qx.ui.core.Widget} The created control or <code>null</code>
       */
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        return null;
      },

      /**
       * Dispose all registered controls. This is automatically
       * executed by the widget.
       *
       */
      _disposeChildControls: function _disposeChildControls() {
        var controls = this.__childControls;

        if (!controls) {
          return;
        }

        var Widget = qx.ui.core.Widget;

        for (var id in controls) {
          var control = controls[id];

          if (!Widget.contains(this, control)) {
            control.destroy();
          } else {
            control.dispose();
          }
        }

        delete this.__childControls;
      },

      /**
       * Finds and returns the top level control. This is the first
       * widget which is not a child control of any other widget.
       *
       * @return {qx.ui.core.Widget} The top control
       */
      _findTopControl: function _findTopControl() {
        var obj = this;

        while (obj) {
          if (!obj.$$subparent) {
            return obj;
          }

          obj = obj.$$subparent;
        }

        return null;
      },

      /**
       * Return the ID (name) if this instance was a created as a child control of another widget.
       *
       * See the first parameter id in {@link qx.ui.core.Widget#_createChildControlImpl}
       *
       * @return {String|null} ID of the current widget or null if it was not created as a subcontrol
       */
      getSubcontrolId: function getSubcontrolId() {
        return this.$$subcontrol || null;
      },

      /*
      ---------------------------------------------------------------------------
        LOWER LEVEL ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the location of the content element in context of the document
       * dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element
       *   (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default,
       *   uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to
       *   border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute
       *   positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for
       *   static/relative positioned content).
       *
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the element relative to the document.
       */
      getContentLocation: function getContentLocation(mode) {
        var domEl = this.getContentElement().getDomElement();
        return domEl ? qx.bom.element.Location.get(domEl, mode) : null;
      },

      /**
       * Directly modifies the relative left position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param value {Integer} Left position
       */
      setDomLeft: function setDomLeft(value) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.left = value + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /**
       * Directly modifies the relative top position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param value {Integer} Top position
       */
      setDomTop: function setDomTop(value) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.top = value + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /**
       * Directly modifies the relative left and top position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param left {Integer} Left position
       * @param top {Integer} Top position
       */
      setDomPosition: function setDomPosition(left, top) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.left = left + "px";
          domEl.style.top = top + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /*
      ---------------------------------------------------------------------------
        ENHANCED DISPOSE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Removes this widget from its parent and disposes it.
       *
       * Please note that the widget is not disposed synchronously. The
       * real dispose happens after the next queue flush.
       *
       */
      destroy: function destroy() {
        if (this.$$disposed) {
          return;
        }

        var parent = this.$$parent;

        if (parent) {
          parent._remove(this);
        }

        qx.ui.core.queue.Dispose.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        CLONE SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      clone: function clone() {
        var clone = qx.ui.core.Widget.prototype.clone.base.call(this);

        if (this.getChildren) {
          var children = this.getChildren();

          for (var i = 0, l = children.length; i < l; i++) {
            clone.add(children[i].clone());
          }
        }

        return clone;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // Some dispose stuff is not needed in global shutdown, otherwise
      // it just slows down things a bit, so do not do them.
      if (!qx.core.ObjectRegistry.inShutDown) {
        {
          if (this.__toolTipTextListenerId) {
            qx.locale.Manager.getInstance().removeListenerById(this.__toolTipTextListenerId);
          }
        } // Remove widget pointer from DOM

        var contentEl = this.getContentElement();

        if (contentEl) {
          contentEl.disconnectWidget(this);
        } // Clean up all child controls


        this._disposeChildControls(); // Remove from ui queues


        qx.ui.core.queue.Appearance.remove(this);
        qx.ui.core.queue.Layout.remove(this);
        qx.ui.core.queue.Visibility.remove(this);
        qx.ui.core.queue.Widget.remove(this);
      }

      if (this.getContextMenu()) {
        this.setContextMenu(null);
      } // pool decorators if not in global shutdown


      if (!qx.core.ObjectRegistry.inShutDown) {
        this.clearSeparators();
        this.__separators = null;
      } else {
        this._disposeArray("__separators");
      } // Clear children array


      this._disposeArray("__widgetChildren"); // Cleanup map of appearance states


      this.__states = this.__childControls = null; // Dispose layout manager and HTML elements

      this._disposeObjects("__layoutManager", "__contentElement");
    }
  });
  qx.ui.core.Widget.$$dbClassInfo = $$dbClassInfo;
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
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Emitter": {
        "construct": true
      },
      "qx.util.Request": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.bom.client.Transport": {}
    },
    "environment": {
      "provided": ["qx.debug.io"],
      "required": {
        "qx.debug.io": {},
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "io.xhr": {
          "className": "qx.bom.client.Transport"
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * A wrapper of the XMLHttpRequest host object (or equivalent). The interface is
   * similar to <a href="http://www.w3.org/TR/XMLHttpRequest/">XmlHttpRequest</a>.
   *
   * Hides browser inconsistencies and works around bugs found in popular
   * implementations.
   *
   * <div class="desktop">
   * Example:
   *
   * <pre class="javascript">
   *  var req = new qx.bom.request.Xhr();
   *  req.onload = function() {
   *    // Handle data received
   *    req.responseText;
   *  }
   *
   *  req.open("GET", url);
   *  req.send();
   * </pre>
   *
   * Example for binary data:
   *
   * <pre class="javascript">
   *  var req = new qx.bom.request.Xhr();
   *  req.onload = function() {
   *    // Handle data received
   *    var blob = req.response;
   *    img.src = URL.createObjectURL(blob);
   *  }
   *
   *  req.open("GET", url);
   *  req.responseType = "blob";
   *  req.send();
   * </pre>
   
   * </div>
   *
   * @ignore(XDomainRequest)
   * @ignore(qx.event, qx.event.GlobalError.*)
   *
   * @require(qx.bom.request.Xhr#open)
   * @require(qx.bom.request.Xhr#send)
   * @require(qx.bom.request.Xhr#on)
   * @require(qx.bom.request.Xhr#onreadystatechange)
   * @require(qx.bom.request.Xhr#onload)
   * @require(qx.bom.request.Xhr#onloadend)
   * @require(qx.bom.request.Xhr#onerror)
   * @require(qx.bom.request.Xhr#onabort)
   * @require(qx.bom.request.Xhr#ontimeout)
   * @require(qx.bom.request.Xhr#setRequestHeader)
   * @require(qx.bom.request.Xhr#getAllResponseHeaders)
   * @require(qx.bom.request.Xhr#getRequest)
   * @require(qx.bom.request.Xhr#overrideMimeType)
   * @require(qx.bom.request.Xhr#dispose)
   * @require(qx.bom.request.Xhr#isDisposed)
   *
   * @group (IO)
   */
  qx.Bootstrap.define("qx.bom.request.Xhr", {
    extend: Object,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      var boundFunc = qx.Bootstrap.bind(this.__onNativeReadyStateChange, this); // GlobalError shouldn't be included in qx.Website builds so use it
      // if it's available but otherwise ignore it (see ignore stated above).

      if (qx.event && qx.event.GlobalError && qx.event.GlobalError.observeMethod) {
        this.__onNativeReadyStateChangeBound = qx.event.GlobalError.observeMethod(boundFunc);
      } else {
        this.__onNativeReadyStateChangeBound = boundFunc;
      }

      this.__onNativeAbortBound = qx.Bootstrap.bind(this.__onNativeAbort, this);
      this.__onNativeProgressBound = qx.Bootstrap.bind(this.__onNativeProgress, this);
      this.__onTimeoutBound = qx.Bootstrap.bind(this.__onTimeout, this);

      this.__initNativeXhr();

      this._emitter = new qx.event.Emitter(); // BUGFIX: IE
      // IE keeps connections alive unless aborted on unload

      if (window.attachEvent) {
        this.__onUnloadBound = qx.Bootstrap.bind(this.__onUnload, this);
        window.attachEvent("onunload", this.__onUnloadBound);
      }
    },
    statics: {
      UNSENT: 0,
      OPENED: 1,
      HEADERS_RECEIVED: 2,
      LOADING: 3,
      DONE: 4
    },
    events: {
      /** Fired at ready state changes. */
      "readystatechange": "qx.bom.request.Xhr",

      /** Fired on error. */
      "error": "qx.bom.request.Xhr",

      /** Fired at loadend. */
      "loadend": "qx.bom.request.Xhr",

      /** Fired on timeouts. */
      "timeout": "qx.bom.request.Xhr",

      /** Fired when the request is aborted. */
      "abort": "qx.bom.request.Xhr",

      /** Fired on successful retrieval. */
      "load": "qx.bom.request.Xhr",

      /** Fired on progress. */
      "progress": "qx.bom.request.Xhr"
    },
    members: {
      /*
      ---------------------------------------------------------------------------
        PUBLIC
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Number} Ready state.
       *
       * States can be:
       * UNSENT:           0,
       * OPENED:           1,
       * HEADERS_RECEIVED: 2,
       * LOADING:          3,
       * DONE:             4
       */
      readyState: 0,

      /**
       * @type {String} The response of the request as text.
       */
      responseText: "",

      /**
       * @type {Object} The response of the request as a Document object.
       */
      response: null,

      /**
       * @type {Object} The response of the request as object.
       */
      responseXML: null,

      /**
       * @type {Number} The HTTP status code.
       */
      status: 0,

      /**
       * @type {String} The HTTP status text.
       */
      statusText: "",

      /**
       * @type {String} The response Type to use in the request
       */
      responseType: "",

      /**
       * @type {Number} Timeout limit in milliseconds.
       *
       * 0 (default) means no timeout. Not supported for synchronous requests.
       */
      timeout: 0,

      /**
       * @type {Object} Wrapper to store data of the progress event which contains the keys
         <code>lengthComputable</code>, <code>loaded</code> and <code>total</code>
       */
      progress: null,

      /**
       * Initializes (prepares) request.
       *
       * @ignore(XDomainRequest)
       *
       * @param method {String?"GET"}
       *  The HTTP method to use.
       * @param url {String}
       *  The URL to which to send the request.
       * @param async {Boolean?true}
       *  Whether or not to perform the operation asynchronously.
       * @param user {String?null}
       *  Optional user name to use for authentication purposes.
       * @param password {String?null}
       *  Optional password to use for authentication purposes.
       */
      open: function open(method, url, async, user, password) {
        this.__checkDisposed(); // Mimick native behavior


        if (typeof url === "undefined") {
          throw new Error("Not enough arguments");
        } else if (typeof method === "undefined") {
          method = "GET";
        } // Reset flags that may have been set on previous request


        this.__abort = false;
        this.__send = false;
        this.__conditional = false; // Store URL for later checks

        this.__url = url;

        if (typeof async == "undefined") {
          async = true;
        }

        this.__async = async; // Default values according to spec.

        this.status = 0;
        this.statusText = this.responseText = "";
        this.responseXML = null;
        this.response = null; // BUGFIX
        // IE < 9 and FF < 3.5 cannot reuse the native XHR to issue many requests

        if (!this.__supportsManyRequests() && this.readyState > qx.bom.request.Xhr.UNSENT) {
          // XmlHttpRequest Level 1 requires open() to abort any pending requests
          // associated to the object. Since we're dealing with a new object here,
          // we have to emulate this behavior. Moreover, allow old native XHR to be garbage collected
          //
          // Dispose and abort.
          //
          this.dispose(); // Replace the underlying native XHR with a new one that can
          // be used to issue new requests.

          this.__initNativeXhr();
        } // Restore handler in case it was removed before


        this.__nativeXhr.onreadystatechange = this.__onNativeReadyStateChangeBound;

        try {
          if (qx.core.Environment.get("qx.debug.io")) {
            qx.Bootstrap.debug(qx.bom.request.Xhr, "Open native request with method: " + method + ", url: " + url + ", async: " + async);
          }

          this.__nativeXhr.open(method, url, async, user, password); // BUGFIX: IE, Firefox < 3.5
          // Some browsers do not support Cross-Origin Resource Sharing (CORS)
          // for XMLHttpRequest. Instead, an exception is thrown even for async requests
          // if URL is cross-origin (as per XHR level 1). Use the proprietary XDomainRequest
          // if available (supports CORS) and handle error (if there is one) this
          // way. Otherwise just assume network error.
          //
          // Basically, this allows to detect network errors.

        } catch (OpenError) {
          // Only work around exceptions caused by cross domain request attempts
          if (!qx.util.Request.isCrossDomain(url)) {
            // Is same origin
            throw OpenError;
          }

          if (!this.__async) {
            this.__openError = OpenError;
          }

          if (this.__async) {
            // Try again with XDomainRequest
            // (Success case not handled on purpose)
            // - IE 9
            if (window.XDomainRequest) {
              this.readyState = 4;
              this.__nativeXhr = new XDomainRequest();
              this.__nativeXhr.onerror = qx.Bootstrap.bind(function () {
                this._emit("readystatechange");

                this._emit("error");

                this._emit("loadend");
              }, this);

              if (qx.core.Environment.get("qx.debug.io")) {
                qx.Bootstrap.debug(qx.bom.request.Xhr, "Retry open native request with method: " + method + ", url: " + url + ", async: " + async);
              }

              this.__nativeXhr.open(method, url, async, user, password);

              return;
            } // Access denied
            // - IE 6: -2146828218
            // - IE 7: -2147024891
            // - Legacy Firefox


            window.setTimeout(qx.Bootstrap.bind(function () {
              if (this.__disposed) {
                return;
              }

              this.readyState = 4;

              this._emit("readystatechange");

              this._emit("error");

              this._emit("loadend");
            }, this));
          }
        } // BUGFIX: IE < 9
        // IE < 9 tends to cache overly aggressive. This may result in stale
        // representations. Force validating freshness of cached representation.


        if (qx.core.Environment.get("engine.name") === "mshtml" && qx.core.Environment.get("browser.documentmode") < 9 && this.__nativeXhr.readyState > 0) {
          this.__nativeXhr.setRequestHeader("If-Modified-Since", "-1");
        } // BUGFIX: Firefox
        // Firefox < 4 fails to trigger onreadystatechange OPENED for sync requests


        if (qx.core.Environment.get("engine.name") === "gecko" && parseInt(qx.core.Environment.get("engine.version"), 10) < 2 && !this.__async) {
          // Native XHR is already set to readyState DONE. Fake readyState
          // and call onreadystatechange manually.
          this.readyState = qx.bom.request.Xhr.OPENED;

          this._emit("readystatechange");
        }
      },

      /**
       * Sets an HTTP request header to be used by the request.
       *
       * Note: The request must be initialized before using this method.
       *
       * @param key {String}
       *  The name of the header whose value is to be set.
       * @param value {String}
       *  The value to set as the body of the header.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      setRequestHeader: function setRequestHeader(key, value) {
        this.__checkDisposed(); // Detect conditional requests


        if (key == "If-Match" || key == "If-Modified-Since" || key == "If-None-Match" || key == "If-Range") {
          this.__conditional = true;
        }

        this.__nativeXhr.setRequestHeader(key, value);

        return this;
      },

      /**
       * Sends request.
       *
       * @param data {String|Document?null}
       *  Optional data to send.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      send: function send(data) {
        this.__checkDisposed(); // BUGFIX: IE & Firefox < 3.5
        // For sync requests, some browsers throw error on open()
        // while it should be on send()
        //


        if (!this.__async && this.__openError) {
          throw this.__openError;
        } // BUGFIX: Opera
        // On network error, Opera stalls at readyState HEADERS_RECEIVED
        // This violates the spec. See here http://www.w3.org/TR/XMLHttpRequest2/#send
        // (Section: If there is a network error)
        //
        // To fix, assume a default timeout of 10 seconds. Note: The "error"
        // event will be fired correctly, because the error flag is inferred
        // from the statusText property. Of course, compared to other
        // browsers there is an additional call to ontimeout(), but this call
        // should not harm.
        //


        if (qx.core.Environment.get("engine.name") === "opera" && this.timeout === 0) {
          this.timeout = 10000;
        } // Timeout


        if (this.timeout > 0) {
          this.__timerId = window.setTimeout(this.__onTimeoutBound, this.timeout);
        } // BUGFIX: Firefox 2
        // "NS_ERROR_XPC_NOT_ENOUGH_ARGS" when calling send() without arguments


        data = typeof data == "undefined" ? null : data; // Whitelisting the allowed data types regarding the spec
        // -> http://www.w3.org/TR/XMLHttpRequest2/#the-send-method
        // All other data input will be transformed to a string to e.g. prevent
        // an SendError in Firefox (at least <= 31) and to harmonize it with the
        // behaviour of all other browsers (Chrome, IE and Safari)

        var dataType = qx.Bootstrap.getClass(data);
        data = data !== null && this.__dataTypeWhiteList.indexOf(dataType) === -1 ? data.toString() : data; // Some browsers may throw an error when sending of async request fails.
        // This violates the spec which states only sync requests should.

        try {
          if (qx.core.Environment.get("qx.debug.io")) {
            qx.Bootstrap.debug(qx.bom.request.Xhr, "Send native request");
          }

          if (this.__async) {
            this.__nativeXhr.responseType = this.responseType;
          }

          this.__nativeXhr.send(data);
        } catch (SendError) {
          if (!this.__async) {
            throw SendError;
          } // BUGFIX
          // Some browsers throws error when file not found via file:// protocol.
          // Synthesize readyState changes.


          if (this._getProtocol() === "file:") {
            this.readyState = 2;

            this.__readyStateChange();

            var that = this;
            window.setTimeout(function () {
              if (that.__disposed) {
                return;
              }

              that.readyState = 3;

              that.__readyStateChange();

              that.readyState = 4;

              that.__readyStateChange();
            });
          }
        } // BUGFIX: Firefox
        // Firefox fails to trigger onreadystatechange DONE for sync requests


        if (qx.core.Environment.get("engine.name") === "gecko" && !this.__async) {
          // Properties all set, only missing native readystatechange event
          this.__onNativeReadyStateChange();
        } // Set send flag


        this.__send = true;
        return this;
      },

      /**
       * Abort request - i.e. cancels any network activity.
       *
       * Note:
       *  On Windows 7 every browser strangely skips the loading phase
       *  when this method is called (because readyState never gets 3).
       *
       *  So keep this in mind if you rely on the phases which are
       *  passed through. They will be "opened", "sent", "abort"
       *  instead of normally "opened", "sent", "loading", "abort".
       *
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      abort: function abort() {
        this.__checkDisposed();

        this.__abort = true;

        this.__nativeXhr.abort();

        if (this.__nativeXhr && this.readyState !== qx.bom.request.Xhr.DONE) {
          this.readyState = this.__nativeXhr.readyState;
        }

        return this;
      },

      /**
       * Helper to emit events and call the callback methods.
       * @param event {String} The name of the event.
       */
      _emit: function _emit(event) {
        if (this["on" + event]) {
          this["on" + event]();
        }

        this._emitter.emit(event, this);
      },

      /**
       * Event handler for XHR event that fires at every state change.
       *
       * Replace with custom method to get informed about the communication progress.
       */
      onreadystatechange: function onreadystatechange() {},

      /**
       * Event handler for XHR event "load" that is fired on successful retrieval.
       *
       * Note: This handler is called even when the HTTP status indicates an error.
       *
       * Replace with custom method to listen to the "load" event.
       */
      onload: function onload() {},

      /**
       * Event handler for XHR event "loadend" that is fired on retrieval.
       *
       * Note: This handler is called even when a network error (or similar)
       * occurred.
       *
       * Replace with custom method to listen to the "loadend" event.
       */
      onloadend: function onloadend() {},

      /**
       * Event handler for XHR event "error" that is fired on a network error.
       *
       * Replace with custom method to listen to the "error" event.
       */
      onerror: function onerror() {},

      /**
      * Event handler for XHR event "abort" that is fired when request
      * is aborted.
      *
      * Replace with custom method to listen to the "abort" event.
      */
      onabort: function onabort() {},

      /**
      * Event handler for XHR event "timeout" that is fired when timeout
      * interval has passed.
      *
      * Replace with custom method to listen to the "timeout" event.
      */
      ontimeout: function ontimeout() {},

      /**
      * Event handler for XHR event "progress".
      *
      * Replace with custom method to listen to the "progress" event.
      */
      onprogress: function onprogress() {},

      /**
       * Add an event listener for the given event name.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function to execute when the event is fired
       * @param ctx {var?} The context of the listener.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      on: function on(name, listener, ctx) {
        this._emitter.on(name, listener, ctx);

        return this;
      },

      /**
       * Get a single response header from response.
       *
       * @param header {String}
       *  Key of the header to get the value from.
       * @return {String}
       *  Response header.
       */
      getResponseHeader: function getResponseHeader(header) {
        this.__checkDisposed();

        if (qx.core.Environment.get("browser.documentmode") === 9 && this.__nativeXhr.aborted) {
          return "";
        }

        return this.__nativeXhr.getResponseHeader(header);
      },

      /**
       * Get all response headers from response.
       *
       * @return {String} All response headers.
       */
      getAllResponseHeaders: function getAllResponseHeaders() {
        this.__checkDisposed();

        if (qx.core.Environment.get("browser.documentmode") === 9 && this.__nativeXhr.aborted) {
          return "";
        }

        return this.__nativeXhr.getAllResponseHeaders();
      },

      /**
       * Overrides the MIME type returned by the server
       * and must be called before @send()@.
       *
       * Note:
       *
       * * IE doesn't support this method so in this case an Error is thrown.
       * * after calling this method @getResponseHeader("Content-Type")@
       *   may return the original (Firefox 23, IE 10, Safari 6) or
       *   the overridden content type (Chrome 28+, Opera 15+).
       *
       *
       * @param mimeType {String} The mimeType for overriding.
       * @return {qx.bom.request.Xhr} Self for chaining.
       */
      overrideMimeType: function overrideMimeType(mimeType) {
        this.__checkDisposed();

        if (this.__nativeXhr.overrideMimeType) {
          this.__nativeXhr.overrideMimeType(mimeType);
        } else {
          throw new Error("Native XHR object doesn't support overrideMimeType.");
        }

        return this;
      },

      /**
       * Get wrapped native XMLHttpRequest (or equivalent).
       *
       * Can be XMLHttpRequest or ActiveX.
       *
       * @return {Object} XMLHttpRequest or equivalent.
       */
      getRequest: function getRequest() {
        return this.__nativeXhr;
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Dispose object and wrapped native XHR.
       * @return {Boolean} <code>true</code> if the object was successfully disposed
       */
      dispose: function dispose() {
        if (this.__disposed) {
          return false;
        }

        window.clearTimeout(this.__timerId); // Remove unload listener in IE. Aborting on unload is no longer required
        // for this instance.

        if (window.detachEvent) {
          window.detachEvent("onunload", this.__onUnloadBound);
        } // May fail in IE


        try {
          this.__nativeXhr.onreadystatechange;
        } catch (PropertiesNotAccessable) {
          return false;
        } // Clear out listeners


        var noop = function noop() {};

        this.__nativeXhr.onreadystatechange = noop;
        this.__nativeXhr.onload = noop;
        this.__nativeXhr.onerror = noop;
        this.__nativeXhr.onprogress = noop; // Abort any network activity

        this.abort(); // Remove reference to native XHR

        this.__nativeXhr = null;
        this.__disposed = true;
        return true;
      },

      /**
       * Check if the request has already beed disposed.
       * @return {Boolean} <code>true</code>, if the request has been disposed.
       */
      isDisposed: function isDisposed() {
        return !!this.__disposed;
      },

      /*
      ---------------------------------------------------------------------------
        PROTECTED
      ---------------------------------------------------------------------------
      */

      /**
       * Create XMLHttpRequest (or equivalent).
       *
       * @return {Object} XMLHttpRequest or equivalent.
       */
      _createNativeXhr: function _createNativeXhr() {
        var xhr = qx.core.Environment.get("io.xhr");

        if (xhr === "xhr") {
          return new XMLHttpRequest();
        }

        if (xhr == "activex") {
          return new window.ActiveXObject("Microsoft.XMLHTTP");
        }

        qx.Bootstrap.error(this, "No XHR support available.");
      },

      /**
       * Get protocol of requested URL.
       *
       * @return {String} The used protocol.
       */
      _getProtocol: function _getProtocol() {
        var url = this.__url;
        var protocolRe = /^(\w+:)\/\//; // Could be http:// from file://

        if (url !== null && url.match) {
          var match = url.match(protocolRe);

          if (match && match[1]) {
            return match[1];
          }
        }

        return window.location.protocol;
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Object} XMLHttpRequest or equivalent.
       */
      __nativeXhr: null,

      /**
       * @type {Boolean} Whether request is async.
       */
      __async: null,

      /**
       * @type {Function} Bound __onNativeReadyStateChange handler.
       */
      __onNativeReadyStateChangeBound: null,

      /**
       * @type {Function} Bound __onNativeAbort handler.
       */
      __onNativeAbortBound: null,

      /**
       * @type {Function} Bound __onNativeProgress handler.
       */
      __onNativeProgressBound: null,

      /**
       * @type {Function} Bound __onUnload handler.
       */
      __onUnloadBound: null,

      /**
       * @type {Function} Bound __onTimeout handler.
       */
      __onTimeoutBound: null,

      /**
       * @type {Boolean} Send flag
       */
      __send: null,

      /**
       * @type {String} Requested URL
       */
      __url: null,

      /**
       * @type {Boolean} Abort flag
       */
      __abort: null,

      /**
       * @type {Boolean} Timeout flag
       */
      __timeout: null,

      /**
       * @type {Boolean} Whether object has been disposed.
       */
      __disposed: null,

      /**
       * @type {Number} ID of timeout timer.
       */
      __timerId: null,

      /**
       * @type {Error} Error thrown on open, if any.
       */
      __openError: null,

      /**
       * @type {Boolean} Conditional get flag
       */
      __conditional: null,

      /**
       * @type {Array} Whitelist with all allowed data types for the request payload
       */
      __dataTypeWhiteList: null,

      /**
       * Init native XHR.
       */
      __initNativeXhr: function __initNativeXhr() {
        // Create native XHR or equivalent and hold reference
        this.__nativeXhr = this._createNativeXhr(); // Track native ready state changes

        this.__nativeXhr.onreadystatechange = this.__onNativeReadyStateChangeBound; // Track native abort, when supported

        if (qx.Bootstrap.getClass(this.__nativeXhr.onabort) !== "Undefined") {
          this.__nativeXhr.onabort = this.__onNativeAbortBound;
        } // Track native progress, when supported


        if (qx.Bootstrap.getClass(this.__nativeXhr.onprogress) !== "Undefined") {
          this.__nativeXhr.onprogress = this.__onNativeProgressBound;
          this.progress = {
            lengthComputable: false,
            loaded: 0,
            total: 0
          };
        } // Reset flags


        this.__disposed = this.__send = this.__abort = false; // Initialize data white list

        this.__dataTypeWhiteList = ["ArrayBuffer", "Blob", "File", "HTMLDocument", "String", "FormData"];
      },

      /**
       * Track native abort.
       *
       * In case the end user cancels the request by other
       * means than calling abort().
       */
      __onNativeAbort: function __onNativeAbort() {
        // When the abort that triggered this method was not a result from
        // calling abort()
        if (!this.__abort) {
          this.abort();
        }
      },

      /**
       * Track native progress event.
       @param e {Event} The native progress event.
       */
      __onNativeProgress: function __onNativeProgress(e) {
        this.progress.lengthComputable = e.lengthComputable;
        this.progress.loaded = e.loaded;
        this.progress.total = e.total;

        this._emit("progress");
      },

      /**
       * Handle native onreadystatechange.
       *
       * Calls user-defined function onreadystatechange on each
       * state change and syncs the XHR status properties.
       */
      __onNativeReadyStateChange: function __onNativeReadyStateChange() {
        var nxhr = this.__nativeXhr,
            propertiesReadable = true;

        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug(qx.bom.request.Xhr, "Received native readyState: " + nxhr.readyState);
        } // BUGFIX: IE, Firefox
        // onreadystatechange() is called twice for readyState OPENED.
        //
        // Call onreadystatechange only when readyState has changed.


        if (this.readyState == nxhr.readyState) {
          return;
        } // Sync current readyState


        this.readyState = nxhr.readyState; // BUGFIX: IE
        // Superfluous onreadystatechange DONE when aborting OPENED
        // without send flag

        if (this.readyState === qx.bom.request.Xhr.DONE && this.__abort && !this.__send) {
          return;
        } // BUGFIX: IE
        // IE fires onreadystatechange HEADERS_RECEIVED and LOADING when sync
        //
        // According to spec, only onreadystatechange OPENED and DONE should
        // be fired.


        if (!this.__async && (nxhr.readyState == 2 || nxhr.readyState == 3)) {
          return;
        } // Default values according to spec.


        this.status = 0;
        this.statusText = this.responseText = "";
        this.responseXML = null;
        this.response = null;

        if (this.readyState >= qx.bom.request.Xhr.HEADERS_RECEIVED) {
          // In some browsers, XHR properties are not readable
          // while request is in progress.
          try {
            this.status = nxhr.status;
            this.statusText = nxhr.statusText;
            this.response = nxhr.response;

            if (this.responseType === "" || this.responseType === "text") {
              this.responseText = nxhr.responseText;
            }

            if (this.responseType === "" || this.responseType === "document") {
              this.responseXML = nxhr.responseXML;
            }
          } catch (XhrPropertiesNotReadable) {
            propertiesReadable = false;
          }

          if (propertiesReadable) {
            this.__normalizeStatus();

            this.__normalizeResponseXML();
          }
        }

        this.__readyStateChange(); // BUGFIX: IE
        // Memory leak in XMLHttpRequest (on-page)


        if (this.readyState == qx.bom.request.Xhr.DONE) {
          // Allow garbage collecting of native XHR
          if (nxhr) {
            nxhr.onreadystatechange = function () {};
          }
        }
      },

      /**
       * Handle readystatechange. Called internally when readyState is changed.
       */
      __readyStateChange: function __readyStateChange() {
        // Cancel timeout before invoking handlers because they may throw
        if (this.readyState === qx.bom.request.Xhr.DONE) {
          // Request determined DONE. Cancel timeout.
          window.clearTimeout(this.__timerId);
        } // Always fire "readystatechange"


        this._emit("readystatechange");

        if (this.readyState === qx.bom.request.Xhr.DONE) {
          this.__readyStateChangeDone();
        }
      },

      /**
       * Handle readystatechange. Called internally by
       * {@link #__readyStateChange} when readyState is DONE.
       */
      __readyStateChangeDone: function __readyStateChangeDone() {
        // Fire "timeout" if timeout flag is set
        if (this.__timeout) {
          this._emit("timeout"); // BUGFIX: Opera
          // Since Opera does not fire "error" on network error, fire additional
          // "error" on timeout (may well be related to network error)


          if (qx.core.Environment.get("engine.name") === "opera") {
            this._emit("error");
          }

          this.__timeout = false; // Fire either "abort", "load" or "error"
        } else {
          if (this.__abort) {
            this._emit("abort");
          } else {
            if (this.__isNetworkError()) {
              this._emit("error");
            } else {
              this._emit("load");
            }
          }
        } // Always fire "onloadend" when DONE


        this._emit("loadend");
      },

      /**
       * Check for network error.
       *
       * @return {Boolean} Whether a network error occurred.
       */
      __isNetworkError: function __isNetworkError() {
        var error; // Infer the XHR internal error flag from statusText when not aborted.
        // See http://www.w3.org/TR/XMLHttpRequest2/#error-flag and
        // http://www.w3.org/TR/XMLHttpRequest2/#the-statustext-attribute
        //
        // With file://, statusText is always falsy. Assume network error when
        // response is empty.

        if (this._getProtocol() === "file:") {
          error = !this.responseText;
        } else {
          error = this.status === 0;
        }

        return error;
      },

      /**
       * Handle faked timeout.
       */
      __onTimeout: function __onTimeout() {
        // Basically, mimick http://www.w3.org/TR/XMLHttpRequest2/#timeout-error
        var nxhr = this.__nativeXhr;
        this.readyState = qx.bom.request.Xhr.DONE; // Set timeout flag

        this.__timeout = true; // No longer consider request. Abort.

        nxhr.aborted = true;
        nxhr.abort();
        this.responseText = "";
        this.responseXML = null; // Signal readystatechange

        this.__readyStateChange();
      },

      /**
       * Normalize status property across browsers.
       */
      __normalizeStatus: function __normalizeStatus() {
        var isDone = this.readyState === qx.bom.request.Xhr.DONE; // BUGFIX: Most browsers
        // Most browsers tell status 0 when it should be 200 for local files

        if (this._getProtocol() === "file:" && this.status === 0 && isDone) {
          if (!this.__isNetworkError()) {
            this.status = 200;
          }
        } // BUGFIX: IE
        // IE sometimes tells 1223 when it should be 204


        if (this.status === 1223) {
          this.status = 204;
        } // BUGFIX: Opera
        // Opera tells 0 for conditional requests when it should be 304
        //
        // Detect response to conditional request that signals fresh cache.


        if (qx.core.Environment.get("engine.name") === "opera") {
          if (isDone && // Done
          this.__conditional && // Conditional request
          !this.__abort && // Not aborted
          this.status === 0 // But status 0!
          ) {
              this.status = 304;
            }
        }
      },

      /**
       * Normalize responseXML property across browsers.
       */
      __normalizeResponseXML: function __normalizeResponseXML() {
        // BUGFIX: IE
        // IE does not recognize +xml extension, resulting in empty responseXML.
        //
        // Check if Content-Type is +xml, verify missing responseXML then parse
        // responseText as XML.
        if (qx.core.Environment.get("engine.name") == "mshtml" && (this.getResponseHeader("Content-Type") || "").match(/[^\/]+\/[^\+]+\+xml/) && this.responseXML && !this.responseXML.documentElement) {
          var dom = new window.ActiveXObject("Microsoft.XMLDOM");
          dom.async = false;
          dom.validateOnParse = false;
          dom.loadXML(this.responseText);
          this.responseXML = dom;
        }
      },

      /**
       * Handler for native unload event.
       */
      __onUnload: function __onUnload() {
        try {
          // Abort and dispose
          if (this) {
            this.dispose();
          }
        } catch (e) {}
      },

      /**
       * Helper method to determine whether browser supports reusing the
       * same native XHR to send more requests.
       * @return {Boolean} <code>true</code> if request object reuse is supported
       */
      __supportsManyRequests: function __supportsManyRequests() {
        var name = qx.core.Environment.get("engine.name");
        var version = qx.core.Environment.get("browser.version");
        return !(name == "mshtml" && version < 9 || name == "gecko" && version < 3.5);
      },

      /**
       * Throw when already disposed.
       */
      __checkDisposed: function __checkDisposed() {
        if (this.__disposed) {
          throw new Error("Already disposed");
        }
      }
    },
    defer: function defer() {
      qx.core.Environment.add("qx.debug.io", false);
    }
  });
  qx.bom.request.Xhr.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.client.Engine": {
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
      "qx.bom.client.Browser": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {}
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
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This handler provides events for qooxdoo application startup/shutdown logic.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.bom.client.Engine)
   */
  qx.Class.define("qx.event.handler.Application", {
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

      this._window = manager.getWindow();
      this.__domReady = false;
      this.__loaded = false;
      this.__isReady = false;
      this.__isUnloaded = false; // Initialize observers

      this._initObserver(); // Store instance (only supported for main app window, this
      // is the reason why this is OK here)


      qx.event.handler.Application.$$instance = this;
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
        ready: 1,
        shutdown: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_WINDOW,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /**
       * Sends the currently running application the ready signal. Used
       * exclusively by package loader system.
       *
       * @internal
       */
      onScriptLoaded: function onScriptLoaded() {
        var inst = qx.event.handler.Application.$$instance;

        if (inst) {
          inst.__fireReady();
        }
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
      __isReady: null,
      __domReady: null,
      __loaded: null,
      __isUnloaded: null,

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Fires a global ready event.
       *
       */
      __fireReady: function __fireReady() {
        // Wrapper qxloader needed to be compatible with old generator
        if (!this.__isReady && this.__domReady && qx.$$loader.scriptLoaded) {
          // If qooxdoo is loaded within a frame in IE, the document is ready before
          // the "ready" listener can be added. To avoid any startup issue check
          // for the availability of the "ready" listener before firing the event.
          // So at last the native "load" will trigger the "ready" event.
          if (qx.core.Environment.get("engine.name") == "mshtml") {
            if (qx.event.Registration.hasListener(this._window, "ready")) {
              this.__isReady = true; // Fire user event

              qx.event.Registration.fireEvent(this._window, "ready");
            }
          } else {
            this.__isReady = true; // Fire user event

            qx.event.Registration.fireEvent(this._window, "ready");
          }
        }
      },

      /**
       * Whether the application is ready.
       *
       * @return {Boolean} ready status
       */
      isApplicationReady: function isApplicationReady() {
        return this.__isReady;
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT/STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native application event listeners.
       *
       */
      _initObserver: function _initObserver() {
        // in Firefox the loader script sets the ready state
        if (qx.$$domReady || document.readyState == "complete" || document.readyState == "ready") {
          this.__domReady = true;

          this.__fireReady();
        } else {
          this._onNativeLoadWrapped = qx.lang.Function.bind(this._onNativeLoad, this);

          if (qx.core.Environment.get("engine.name") == "gecko" || qx.core.Environment.get("engine.name") == "opera" || qx.core.Environment.get("engine.name") == "webkit" || qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") > 8) {
            // Using native method supported by Mozilla, Webkit, Opera and IE >= 9
            qx.bom.Event.addNativeListener(this._window, "DOMContentLoaded", this._onNativeLoadWrapped);
          } else {
            var self = this; // Continually check to see if the document is ready

            var timer = function timer() {
              try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");

                if (document.body) {
                  self._onNativeLoadWrapped();
                }
              } catch (error) {
                window.setTimeout(timer, 100);
              }
            };

            timer();
          } // Additional load listener as fallback


          qx.bom.Event.addNativeListener(this._window, "load", this._onNativeLoadWrapped);
        }

        this._onNativeUnloadWrapped = qx.lang.Function.bind(this._onNativeUnload, this);
        qx.bom.Event.addNativeListener(this._window, "unload", this._onNativeUnloadWrapped);
      },

      /**
       * Disconnect the native application event listeners.
       *
       */
      _stopObserver: function _stopObserver() {
        if (this._onNativeLoadWrapped) {
          qx.bom.Event.removeNativeListener(this._window, "load", this._onNativeLoadWrapped);
        }

        qx.bom.Event.removeNativeListener(this._window, "unload", this._onNativeUnloadWrapped);
        this._onNativeLoadWrapped = null;
        this._onNativeUnloadWrapped = null;
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * When qx.globalErrorHandling is enabled the callback will observed
       */
      _onNativeLoad: function _onNativeLoad() {
        var callback = qx.core.Environment.select("qx.globalErrorHandling", {
          "true": qx.event.GlobalError.observeMethod(this.__onNativeLoadHandler),
          "false": this.__onNativeLoadHandler
        });
        callback.apply(this, arguments);
      },

      /**
       * Event listener for native load event
       */
      __onNativeLoadHandler: function __onNativeLoadHandler() {
        this.__domReady = true;

        this.__fireReady();
      },

      /**
       * When qx.globalErrorHandling is enabled the callback will observed
       */
      _onNativeUnload: function _onNativeUnload() {
        var callback = qx.core.Environment.select("qx.globalErrorHandling", {
          "true": qx.event.GlobalError.observeMethod(this.__onNativeUnloadHandler),
          "false": this.__onNativeUnloadHandler
        });
        callback.apply(this, arguments);
      },

      /**
       * Event listener for native unload event
       */
      __onNativeUnloadHandler: function __onNativeUnloadHandler() {
        if (!this.__isUnloaded) {
          this.__isUnloaded = true;

          try {
            // Fire user event
            qx.event.Registration.fireEvent(this._window, "shutdown");
          } catch (e) {
            // IE doesn't execute the "finally" block if no "catch" block is present
            throw e;
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
      this._stopObserver();

      this._window = null;
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
  qx.event.handler.Application.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.Event": {}
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
   * Common base class for all native events (DOM events, IO events, ...).
   */
  qx.Class.define("qx.event.type.Native", {
    extend: qx.event.type.Event,
    members: {
      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param nativeEvent {Event} The DOM event to use
       * @param target {Object?} The event target
       * @param relatedTarget {Object?null} The related event target
       * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
       *     If the event is bubbling, the bubbling can be stopped using
       *     {@link qx.event.type.Event#stopPropagation}
       * @param cancelable {Boolean?false} Whether or not an event can have its default
       *     action prevented. The default action can either be the browser's
       *     default action of a native event (e.g. open the context menu on a
       *     right click) or the default action of a qooxdoo class (e.g. close
       *     the window widget). The default action can be prevented by calling
       *     {@link #preventDefault}
       * @return {qx.event.type.Event} The initialized event instance
       */
      init: function init(nativeEvent, target, relatedTarget, canBubble, cancelable) {
        qx.event.type.Native.prototype.init.base.call(this, canBubble, cancelable);
        this._target = target || qx.bom.Event.getTarget(nativeEvent);
        this._relatedTarget = relatedTarget || qx.bom.Event.getRelatedTarget(nativeEvent);

        if (nativeEvent.timeStamp) {
          this._timeStamp = nativeEvent.timeStamp;
        }

        this._native = nativeEvent;
        this._returnValue = null;
        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.Native.prototype.clone.base.call(this, embryo);
        var nativeClone = {};
        clone._native = this._cloneNativeEvent(this._native, nativeClone);
        clone._returnValue = this._returnValue;
        return clone;
      },

      /**
       * Clone the native browser event
       *
       * @param nativeEvent {Event} The native browser event
       * @param clone {Object} The initialized clone.
       * @return {Object} The cloned event
       */
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        clone.preventDefault = function () {};

        return clone;
      },

      /**
       * Prevent browser default behavior, e.g. opening the context menu, ...
       */
      preventDefault: function preventDefault() {
        qx.event.type.Native.prototype.preventDefault.base.call(this);
        qx.bom.Event.preventDefault(this._native);
      },

      /**
       * Get the native browser event object of this event.
       *
       * @return {Event} The native browser event
       */
      getNativeEvent: function getNativeEvent() {
        return this._native;
      },

      /**
       * Sets the event's return value. If the return value is set in a
       * beforeunload event, the user will be asked by the browser, whether
       * he really wants to leave the page. The return string will be displayed in
       * the message box.
       *
       * @param returnValue {String?null} Return value
       */
      setReturnValue: function setReturnValue(returnValue) {
        this._returnValue = returnValue;
      },

      /**
       * Retrieves the event's return value.
       *
       * @return {String?null} The return value
       */
      getReturnValue: function getReturnValue() {
        return this._returnValue;
      }
    }
  });
  qx.event.type.Native.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.type.Native": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.Pool": {
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
      "qx.event.GlobalError": {}
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
   * This handler provides event for the window object.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.type.Native)
   * @require(qx.event.Pool)
   */
  qx.Class.define("qx.event.handler.Window", {
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

      this._manager = manager;
      this._window = manager.getWindow(); // Initialize observers

      this._initWindowObserver();
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
        error: 1,
        load: 1,
        beforeunload: 1,
        unload: 1,
        resize: 1,
        scroll: 1,
        beforeshutdown: 1
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
        OBSERVER INIT/STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native window event listeners.
       *
       */
      _initWindowObserver: function _initWindowObserver() {
        this._onNativeWrapper = qx.lang.Function.listener(this._onNative, this);
        var types = qx.event.handler.Window.SUPPORTED_TYPES;

        for (var key in types) {
          qx.bom.Event.addNativeListener(this._window, key, this._onNativeWrapper);
        }
      },

      /**
       * Disconnect the native window event listeners.
       *
       */
      _stopWindowObserver: function _stopWindowObserver() {
        var types = qx.event.handler.Window.SUPPORTED_TYPES;

        for (var key in types) {
          qx.bom.Event.removeNativeListener(this._window, key, this._onNativeWrapper);
        }
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * When qx.globalErrorHandling is enabled the callback will observed
       */
      _onNative: function _onNative() {
        var callback = qx.core.Environment.select("qx.globalErrorHandling", {
          "true": qx.event.GlobalError.observeMethod(this.__onNativeHandler),
          "false": this.__onNativeHandler
        });
        callback.apply(this, arguments);
      },

      /**
       * Native listener for all supported events.
       *
       * @param e {Event} Native event
       * @return {String|undefined}
       */
      __onNativeHandler: function __onNativeHandler(e) {
        if (this.isDisposed()) {
          return;
        }

        var win = this._window;
        var doc;

        try {
          doc = win.document;
        } catch (ex) {
          // IE7 sometimes dispatches "unload" events on protected windows
          // Ignore these events
          return;
        }

        var html = doc.documentElement; // At least Safari 3.1 and Opera 9.2.x have a bubbling scroll event
        // which needs to be ignored here.
        //
        // In recent WebKit nightlies scroll events do no longer bubble
        //
        // Internet Explorer does not have a target in resize events.

        var target = qx.bom.Event.getTarget(e);

        if (target == null || target === win || target === doc || target === html) {
          var event = qx.event.Registration.createEvent(e.type, qx.event.type.Native, [e, win]);
          qx.event.Registration.dispatchEvent(win, event);
          var result = event.getReturnValue();

          if (result != null) {
            e.returnValue = result;
            return result;
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
      this._stopWindowObserver();

      this._manager = this._window = null;
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
  qx.event.handler.Window.$$dbClassInfo = $$dbClassInfo;
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
      "qx.log.Logger": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.Bootstrap": {}
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
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "qx.application": {}
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
       * Sebastian Werner (wpbasti)
       * Daniel Wagner (d_wagner)
       * John Spackman
  
  ************************************************************************ */

  /**
   * This is the base class for non-browser qooxdoo applications.
   */
  qx.Class.define("qx.core.BaseInit", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      __application: null,

      /**
       * Returns the instantiated qooxdoo application.
       *
       * @return {qx.core.Object} The application instance.
       */
      getApplication: function getApplication() {
        return this.__application || null;
      },

      /**
       * Runs when the application is loaded. Automatically creates an instance
       * of the class defined by the setting <code>qx.application</code>.
       *
       */
      ready: function ready() {
        if (this.__application) {
          return;
        }

        if (qx.core.Environment.get("engine.name") == "") {
          qx.log.Logger.warn("Could not detect engine!");
        }

        if (qx.core.Environment.get("engine.version") == "") {
          qx.log.Logger.warn("Could not detect the version of the engine!");
        }

        if (qx.core.Environment.get("os.name") == "") {
          qx.log.Logger.warn("Could not detect operating system!");
        }

        qx.log.Logger.debug(this, "Load runtime: " + (new Date() - qx.Bootstrap.LOADSTART) + "ms");
        var app = qx.core.Environment.get("qx.application");
        var clazz = qx.Class.getByName(app);

        if (clazz) {
          this.__application = new clazz();
          var start = new Date();

          this.__application.main();

          qx.log.Logger.debug(this, "Main runtime: " + (new Date() - start) + "ms");
          var start = new Date();

          this.__application.finalize();

          qx.log.Logger.debug(this, "Finalize runtime: " + (new Date() - start) + "ms");
        } else {
          qx.log.Logger.warn("Missing application class: " + app);
        }
      },

      /**
       * Runs before the document is unloaded. Calls the application's close
       * method to check if the unload process should be stopped.
       *
       * @param e {qx.event.type.Native} Incoming beforeunload event.
       */
      __close: function __close(e) {
        var app = this.__application;

        if (app) {
          app.close();
        }
      },

      /**
       * Runs when the document is unloaded. Automatically terminates a previously
       * created application instance.
       *
       */
      __shutdown: function __shutdown() {
        var app = this.__application;

        if (app) {
          app.terminate();
        }
      }
    }
  });
  qx.core.BaseInit.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Application": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Window": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.dispatch.Direct": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.BaseInit": {
        "require": true
      },
      "qx.event.Registration": {
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
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This is the base class for all qooxdoo applications.
   *
   * @require(qx.event.handler.Application)
   * @require(qx.event.handler.Window)
   * @require(qx.event.dispatch.Direct)
   */
  qx.Class.define("qx.core.Init", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the instantiated qooxdoo application.
       *
       * @return {qx.core.Object} The application instance.
       */
      getApplication: qx.core.BaseInit.getApplication,

      /**
       * Runs when the application is loaded. Automatically creates an instance
       * of the class defined by the setting <code>qx.application</code>.
       *
       */
      ready: qx.core.BaseInit.ready,

      /**
       * Runs before the document is unloaded. Calls the application's close
       * method to check if the unload process should be stopped.
       *
       * @param e {qx.event.type.Native} Incoming beforeunload event.
       */
      __close: function __close(e) {
        var app = this.getApplication();

        if (app) {
          e.setReturnValue(app.close());
        }
      },

      /**
       * Runs when the document is unloaded. Automatically terminates a previously
       * created application instance.
       *
       */
      __shutdown: function __shutdown() {
        var app = this.getApplication();

        if (app) {
          app.terminate();
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addListener(window, "ready", statics.ready, statics);
      qx.event.Registration.addListener(window, "shutdown", statics.__shutdown, statics);
      qx.event.Registration.addListener(window, "beforeunload", statics.__close, statics);
    }
  });
  qx.core.Init.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.DeferredCallManager": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2013 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tristan Koch (tristankoch)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Sinon.JS 1.9.1
  
       Homepage:
         http://sinonjs.org/
  
       Documentation:
         http://sinonjs.org/docs/
  
       Discussion:
         http://groups.google.com/group/sinonjs
  
       Code:
         https://github.com/cjohansen/Sinon.JS
  
       Copyright:
         (c) 2010-2014, Christian Johansen
  
       License:
         BSD: http://www.opensource.org/licenses/bsd-license.php
  
  ************************************************************************ */

  /**
   * Exposes Sinon.JS to qooxdoo.
   *
   * This class exposes Sinon.JS (http://sinonjs.org/) and is not to be used
   * directly. Instead, you should include qx.dev.unit.MMock in your TestCase
   * and use the wrappers provided.
   *
   * @internal
   * @ignore(module, require, global, ProgressEvent, CustomEvent, clearImmediate)
   * @ignore(process.*) 
   * @lint ignoreDeprecated(eval)
   * @ignore(module.exports.*)
   *
   */
  qx.Bootstrap.define("qx.dev.unit.Sinon", {
    statics: {
      /**
       * Get the Sinon.JS object.
       *
       * @signature function()
       * @return {Object} The Sinon.JS object
       *
       */
      getSinon: null
    }
  });
  /**
   * @ignore(module, require, global, process.*, setImmediate)
   * @ignore(msSetImmediate)
   * @lint ignoreUnused(alen, requestMethod, index)
   * @lint ignoreNoLoopBlock()
   * @ignore (process.*)  
   * @ignore (setTimeout.*) 
   *
   * @lint ignoreJsdocKey(author, license, depend)
   */

  (function () {
    /**
     * Below is the original Sinon.JS code with some minor changes:
     *
     * - aliased "throws" as "throwsException"
     * - replaced references to this.sinon which do not make sense within a closure
     * - in failAssertion, "assert.fail" takes precedence over "object.fail"
     *
     */

    /**
     * Sinon.JS 1.9.1, 2014/04/03
     *
     * @author Christian Johansen (christian@cjohansen.no)
     * @author Contributors: https://github.com/cjohansen/Sinon.JS/blob/master/AUTHORS
     *
     * (The BSD License)
     *
     * Copyright (c) 2010-2014, Christian Johansen, christian@cjohansen.no
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without modification,
     * are permitted provided that the following conditions are met:
     *
     *     * Redistributions of source code must retain the above copyright notice,
     *       this list of conditions and the following disclaimer.
     *     * Redistributions in binary form must reproduce the above copyright notice,
     *       this list of conditions and the following disclaimer in the documentation
     *       and/or other materials provided with the distribution.
     *     * Neither the name of Christian Johansen nor the names of his contributors
     *       may be used to endorse or promote products derived from this software
     *       without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
     * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
     * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
     * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
     * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
     * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
     * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
     * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    this.sinon = function () {
      var samsam, formatio;

      function define(mod, deps, fn) {
        if (mod == "samsam") {
          samsam = deps();
        } else {
          formatio = fn(samsam);
        }
      }

      define.amd = true;
      (typeof define === "function" && define.amd && function (m) {
        define("samsam", m);
      } || (typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && function (m) {
        module.exports = m();
      } || // Node
      function (m) {
        this.samsam = m();
      } // Browser globals
      )(function () {
        var o = Object.prototype;
        var div = typeof document !== "undefined" && document.createElement("div");

        function isNaN(value) {
          // Unlike global isNaN, this avoids type coercion
          // typeof check avoids IE host object issues, hat tip to
          // lodash
          var val = value; // JsLint thinks value !== value is "weird"

          return typeof value === "number" && value !== val;
        }

        function getClass(value) {
          // Returns the internal [[Class]] by calling Object.prototype.toString
          // with the provided value as this. Return value is a string, naming the
          // internal class, e.g. "Array"
          return o.toString.call(value).split(/[ \]]/)[1];
        }
        /**
         * @param object {Object}
         *
         * Returns ``true`` if ``object`` is an ``arguments`` object,
         * ``false`` otherwise.
         */


        function isArguments(object) {
          if (_typeof(object) !== "object" || typeof object.length !== "number" || getClass(object) === "Array") {
            return false;
          }

          if (typeof object.callee == "function") {
            return true;
          }

          try {
            object[object.length] = 6;
            delete object[object.length];
          } catch (e) {
            return true;
          }

          return false;
        }
        /**
         * @param object {Object}
         *
         * Returns ``true`` if ``object`` is a DOM element node. Unlike
         * Underscore.js/lodash, this function will return ``false`` if ``object``
         * is an *element-like* object, i.e. a regular object with a ``nodeType``
         * property that holds the value ``1``.
         */


        function isElement(object) {
          if (!object || object.nodeType !== 1 || !div) {
            return false;
          }

          try {
            object.appendChild(div);
            object.removeChild(div);
          } catch (e) {
            return false;
          }

          return true;
        }
        /**
         * @param object {Object}
         *
         * Return an array of own property names.
         */


        function keys(object) {
          var ks = [],
              prop;

          for (prop in object) {
            if (o.hasOwnProperty.call(object, prop)) {
              ks.push(prop);
            }
          }

          return ks;
        }
        /**
         * @param value {Object}
         *
         * Returns true if the object is a ``Date``, or *date-like*. Duck typing
         * of date objects work by checking that the object has a ``getTime``
         * function whose return value equals the return value from the object's
         * ``valueOf``.
         */


        function isDate(value) {
          return typeof value.getTime == "function" && value.getTime() == value.valueOf();
        }
        /**
         * @param value {Object}
         *
         * Returns ``true`` if ``value`` is ``-0``.
         */


        function isNegZero(value) {
          return value === 0 && 1 / value === -Infinity;
        }
        /**
         * @param obj1 {Object}
         * @param obj2 {Object}
         *
         * Returns ``true`` if two objects are strictly equal. Compared to
         * ``===`` there are two exceptions:
         *
         *   - NaN is considered equal to NaN
         *   - -0 and +0 are not considered equal
         */


        function identical(obj1, obj2) {
          if (obj1 === obj2 || isNaN(obj1) && isNaN(obj2)) {
            return obj1 !== 0 || isNegZero(obj1) === isNegZero(obj2);
          }
        }
        /**
         * @param obj1 {Object}
         * @param obj2 {Object}
         *
         * Deep equal comparison. Two values are "deep equal" if:
         *
         *   - They are equal, according to samsam.identical
         *   - They are both date objects representing the same time
         *   - They are both arrays containing elements that are all deepEqual
         *   - They are objects with the same set of properties, and each property
         *     in ``obj1`` is deepEqual to the corresponding property in ``obj2``
         *
         * Supports cyclic objects.
         */


        function deepEqualCyclic(obj1, obj2) {
          // used for cyclic comparison
          // contain already visited objects
          var objects1 = [],
              objects2 = [],
              // contain pathes (position in the object structure)
          // of the already visited objects
          // indexes same as in objects arrays
          paths1 = [],
              paths2 = [],
              // contains combinations of already compared objects
          // in the manner: { "$1['ref']$2['ref']": true }
          compared = {};
          /**
           * used to check, if the value of a property is an object
           * (cyclic logic is only needed for objects)
           * only needed for cyclic logic
           */

          function isObject(value) {
            if (_typeof(value) === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {
              return true;
            }

            return false;
          }
          /**
           * returns the index of the given object in the
           * given objects array, -1 if not contained
           * only needed for cyclic logic
           */


          function getIndex(objects, obj) {
            var i;

            for (i = 0; i < objects.length; i++) {
              if (objects[i] === obj) {
                return i;
              }
            }

            return -1;
          } // does the recursion for the deep equal check


          return function deepEqual(obj1, obj2, path1, path2) {
            var type1 = _typeof(obj1);

            var type2 = _typeof(obj2); // == null also matches undefined


            if (obj1 === obj2 || isNaN(obj1) || isNaN(obj2) || obj1 == null || obj2 == null || type1 !== "object" || type2 !== "object") {
              return identical(obj1, obj2);
            } // Elements are only equal if identical(expected, actual)


            if (isElement(obj1) || isElement(obj2)) {
              return false;
            }

            var isDate1 = isDate(obj1),
                isDate2 = isDate(obj2);

            if (isDate1 || isDate2) {
              if (!isDate1 || !isDate2 || obj1.getTime() !== obj2.getTime()) {
                return false;
              }
            }

            if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
              if (obj1.toString() !== obj2.toString()) {
                return false;
              }
            }

            var class1 = getClass(obj1);
            var class2 = getClass(obj2);
            var keys1 = keys(obj1);
            var keys2 = keys(obj2);

            if (isArguments(obj1) || isArguments(obj2)) {
              if (obj1.length !== obj2.length) {
                return false;
              }
            } else {
              if (type1 !== type2 || class1 !== class2 || keys1.length !== keys2.length) {
                return false;
              }
            }

            var key, i, l, // following vars are used for the cyclic logic
            value1, value2, isObject1, isObject2, index1, index2, newPath1, newPath2;

            for (i = 0, l = keys1.length; i < l; i++) {
              key = keys1[i];

              if (!o.hasOwnProperty.call(obj2, key)) {
                return false;
              } // Start of the cyclic logic


              value1 = obj1[key];
              value2 = obj2[key];
              isObject1 = isObject(value1);
              isObject2 = isObject(value2); // determine, if the objects were already visited
              // (it's faster to check for isObject first, than to
              // get -1 from getIndex for non objects)

              index1 = isObject1 ? getIndex(objects1, value1) : -1;
              index2 = isObject2 ? getIndex(objects2, value2) : -1; // determine the new pathes of the objects
              // - for non cyclic objects the current path will be extended
              //   by current property name
              // - for cyclic objects the stored path is taken

              newPath1 = index1 !== -1 ? paths1[index1] : path1 + '[' + JSON.stringify(key) + ']';
              newPath2 = index2 !== -1 ? paths2[index2] : path2 + '[' + JSON.stringify(key) + ']'; // stop recursion if current objects are already compared

              if (compared[newPath1 + newPath2]) {
                return true;
              } // remember the current objects and their pathes


              if (index1 === -1 && isObject1) {
                objects1.push(value1);
                paths1.push(newPath1);
              }

              if (index2 === -1 && isObject2) {
                objects2.push(value2);
                paths2.push(newPath2);
              } // remember that the current objects are already compared


              if (isObject1 && isObject2) {
                compared[newPath1 + newPath2] = true;
              } // End of cyclic logic
              // neither value1 nor value2 is a cycle
              // continue with next level


              if (!deepEqual(value1, value2, newPath1, newPath2)) {
                return false;
              }
            }

            return true;
          }(obj1, obj2, '$1', '$2');
        }

        var match;

        function arrayContains(array, subset) {
          if (subset.length === 0) {
            return true;
          }

          var i, l, j, k;

          for (i = 0, l = array.length; i < l; ++i) {
            if (match(array[i], subset[0])) {
              for (j = 0, k = subset.length; j < k; ++j) {
                if (!match(array[i + j], subset[j])) {
                  return false;
                }
              }

              return true;
            }
          }

          return false;
        }
        /**
         * @param object {Object}
         * @param matcher {object}
         *
         * Compare arbitrary value ``object`` with matcher.
         */


        match = function match(object, matcher) {
          if (matcher && typeof matcher.test === "function") {
            return matcher.test(object);
          }

          if (typeof matcher === "function") {
            return matcher(object) === true;
          }

          if (typeof matcher === "string") {
            matcher = matcher.toLowerCase();
            var notNull = typeof object === "string" || !!object;
            return notNull && String(object).toLowerCase().indexOf(matcher) >= 0;
          }

          if (typeof matcher === "number") {
            return matcher === object;
          }

          if (typeof matcher === "boolean") {
            return matcher === object;
          }

          if (getClass(object) === "Array" && getClass(matcher) === "Array") {
            return arrayContains(object, matcher);
          }

          if (matcher && _typeof(matcher) === "object") {
            var prop;

            for (prop in matcher) {
              if (!match(object[prop], matcher[prop])) {
                return false;
              }
            }

            return true;
          }

          throw new Error("Matcher was not a string, a number, a function, a boolean or an object");
        };

        return {
          isArguments: isArguments,
          isElement: isElement,
          isDate: isDate,
          isNegZero: isNegZero,
          identical: identical,
          deepEqual: deepEqualCyclic,
          match: match,
          keys: keys
        };
      });
      (typeof define === "function" && define.amd && function (m) {
        define("formatio", ["samsam"], m);
      } || (typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && function (m) {
        module.exports = m(require("samsam"));
      } || function (m) {
        this.formatio = m(this.samsam);
      })(function (samsam) {
        var formatio = {
          excludeConstructors: ["Object", /^.$/],
          quoteStrings: true
        };
        var specialObjects = [];

        if (typeof global !== "undefined") {
          specialObjects.push({
            object: global,
            value: "[object global]"
          });
        }

        if (typeof document !== "undefined") {
          specialObjects.push({
            object: document,
            value: "[object HTMLDocument]"
          });
        }

        if (typeof window !== "undefined") {
          specialObjects.push({
            object: window,
            value: "[object Window]"
          });
        }

        function functionName(func) {
          if (!func) {
            return "";
          }

          if (func.displayName) {
            return func.displayName;
          }

          if (func.name) {
            return func.name;
          }

          var matches = func.toString().match(/function\s+([^\(]+)/m);
          return matches && matches[1] || "";
        }

        function _constructorName(f, object) {
          var name = functionName(object && object.constructor);
          var excludes = f.excludeConstructors || formatio.excludeConstructors || [];
          var i, l;

          for (i = 0, l = excludes.length; i < l; ++i) {
            if (typeof excludes[i] === "string" && excludes[i] === name) {
              return "";
            } else if (excludes[i].test && excludes[i].test(name)) {
              return "";
            }
          }

          return name;
        }

        function isCircular(object, objects) {
          if (_typeof(object) !== "object") {
            return false;
          }

          var i, l;

          for (i = 0, l = objects.length; i < l; ++i) {
            if (objects[i] === object) {
              return true;
            }
          }

          return false;
        }

        function _ascii(f, object, processed, indent) {
          if (typeof object === "string") {
            var qs = f.quoteStrings;
            var quote = typeof qs !== "boolean" || qs;
            return processed || quote ? '"' + object + '"' : object;
          }

          if (typeof object === "function" && !(object instanceof RegExp)) {
            return _ascii.func(object);
          }

          processed = processed || [];

          if (isCircular(object, processed)) {
            return "[Circular]";
          }

          if (Object.prototype.toString.call(object) === "[object Array]") {
            return _ascii.array.call(f, object, processed);
          }

          if (!object) {
            return String(1 / object === -Infinity ? "-0" : object);
          }

          if (samsam.isElement(object)) {
            return _ascii.element(object);
          }

          if (typeof object.toString === "function" && object.toString !== Object.prototype.toString) {
            return object.toString();
          }

          var i, l;

          for (i = 0, l = specialObjects.length; i < l; i++) {
            if (object === specialObjects[i].object) {
              return specialObjects[i].value;
            }
          }

          return _ascii.object.call(f, object, processed, indent);
        }

        _ascii.func = function (func) {
          return "function " + functionName(func) + "() {}";
        };

        _ascii.array = function (array, processed) {
          processed = processed || [];
          processed.push(array);
          var i,
              l,
              pieces = [];

          for (i = 0, l = array.length; i < l; ++i) {
            pieces.push(_ascii(this, array[i], processed));
          }

          return "[" + pieces.join(", ") + "]";
        };

        _ascii.object = function (object, processed, indent) {
          processed = processed || [];
          processed.push(object);
          indent = indent || 0;
          var pieces = [],
              properties = samsam.keys(object).sort();
          var length = 3;
          var prop, str, obj, i, l;

          for (i = 0, l = properties.length; i < l; ++i) {
            prop = properties[i];
            obj = object[prop];

            if (isCircular(obj, processed)) {
              str = "[Circular]";
            } else {
              str = _ascii(this, obj, processed, indent + 2);
            }

            str = (/\s/.test(prop) ? '"' + prop + '"' : prop) + ": " + str;
            length += str.length;
            pieces.push(str);
          }

          var cons = _constructorName(this, object);

          var prefix = cons ? "[" + cons + "] " : "";
          var is = "";

          for (i = 0, l = indent; i < l; ++i) {
            is += " ";
          }

          if (length + indent > 80) {
            return prefix + "{\n  " + is + pieces.join(",\n  " + is) + "\n" + is + "}";
          }

          return prefix + "{ " + pieces.join(", ") + " }";
        };

        _ascii.element = function (element) {
          var tagName = element.tagName.toLowerCase();
          var attrs = element.attributes,
              attr,
              pairs = [],
              attrName,
              i,
              l,
              val;

          for (i = 0, l = attrs.length; i < l; ++i) {
            attr = attrs.item(i);
            attrName = attr.nodeName.toLowerCase().replace("html:", "");
            val = attr.nodeValue;

            if (attrName !== "contenteditable" || val !== "inherit") {
              if (!!val) {
                pairs.push(attrName + "=\"" + val + "\"");
              }
            }
          }

          var formatted = "<" + tagName + (pairs.length > 0 ? " " : "");
          var content = element.innerHTML;

          if (content.length > 20) {
            content = content.substr(0, 20) + "[...]";
          }

          var res = formatted + pairs.join(" ") + ">" + content + "</" + tagName + ">";
          return res.replace(/ contentEditable="inherit"/, "");
        };

        function Formatio(options) {
          for (var opt in options) {
            this[opt] = options[opt];
          }
        }

        Formatio.prototype = {
          functionName: functionName,
          configure: function configure(options) {
            return new Formatio(options);
          },
          constructorName: function constructorName(object) {
            return _constructorName(this, object);
          },
          ascii: function ascii(object, processed, indent) {
            return _ascii(this, object, processed, indent);
          }
        };
        return Formatio.prototype;
      });
      /*jslint eqeqeq: false, onevar: false, forin: true, nomen: false, regexp: false, plusplus: false*/

      /*global module, require, __dirname, document*/

      /**
       * Sinon core utilities. For internal use only.
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */

      var sinon = function (formatio) {
        var div = typeof document != "undefined" && document.createElement("div");
        var hasOwn = Object.prototype.hasOwnProperty;

        function isDOMNode(obj) {
          var success = false;

          try {
            obj.appendChild(div);
            success = div.parentNode == obj;
          } catch (e) {
            return false;
          } finally {
            try {
              obj.removeChild(div);
            } catch (e) {// Remove failed, not much we can do about that
            }
          }

          return success;
        }

        function isElement(obj) {
          return div && obj && obj.nodeType === 1 && isDOMNode(obj);
        }

        function isFunction(obj) {
          return typeof obj === "function" || !!(obj && obj.constructor && obj.call && obj.apply);
        }

        function isReallyNaN(val) {
          return typeof val === 'number' && isNaN(val);
        }

        function mirrorProperties(target, source) {
          for (var prop in source) {
            if (!hasOwn.call(target, prop)) {
              target[prop] = source[prop];
            }
          }
        }

        function isRestorable(obj) {
          return typeof obj === "function" && typeof obj.restore === "function" && obj.restore.sinon;
        }

        var sinon = {
          wrapMethod: function wrapMethod(object, property, method) {
            if (!object) {
              throw new TypeError("Should wrap property of object");
            }

            if (typeof method != "function") {
              throw new TypeError("Method wrapper should be function");
            }

            var wrappedMethod = object[property],
                error;

            if (!isFunction(wrappedMethod)) {
              error = new TypeError("Attempted to wrap " + _typeof(wrappedMethod) + " property " + property + " as function");
            }

            if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
              error = new TypeError("Attempted to wrap " + property + " which is already wrapped");
            }

            if (wrappedMethod.calledBefore) {
              var verb = !!wrappedMethod.returns ? "stubbed" : "spied on";
              error = new TypeError("Attempted to wrap " + property + " which is already " + verb);
            }

            if (error) {
              if (wrappedMethod._stack) {
                error.stack += '\n--------------\n' + wrappedMethod._stack;
              }

              throw error;
            } // IE 8 does not support hasOwnProperty on the window object and Firefox has a problem
            // when using hasOwn.call on objects from other frames.


            var owned = object.hasOwnProperty ? object.hasOwnProperty(property) : hasOwn.call(object, property);
            object[property] = method;
            method.displayName = property; // Set up a stack trace which can be used later to find what line of
            // code the original method was created on.

            method._stack = new Error('Stack Trace for original').stack;

            method.restore = function () {
              // For prototype properties try to reset by delete first.
              // If this fails (ex: localStorage on mobile safari) then force a reset
              // via direct assignment.
              if (!owned) {
                delete object[property];
              }

              if (object[property] === method) {
                object[property] = wrappedMethod;
              }
            };

            method.restore.sinon = true;
            mirrorProperties(method, wrappedMethod);
            return method;
          },
          extend: function extend(target) {
            for (var i = 1, l = arguments.length; i < l; i += 1) {
              for (var prop in arguments[i]) {
                if (arguments[i].hasOwnProperty(prop)) {
                  target[prop] = arguments[i][prop];
                } // DONT ENUM bug, only care about toString


                if (arguments[i].hasOwnProperty("toString") && arguments[i].toString != target.toString) {
                  target.toString = arguments[i].toString;
                }
              }
            }

            return target;
          },
          create: function create(proto) {
            var F = function F() {};

            F.prototype = proto;
            return new F();
          },
          deepEqual: function deepEqual(a, b) {
            if (sinon.match && sinon.match.isMatcher(a)) {
              return a.test(b);
            }

            if (_typeof(a) != 'object' || _typeof(b) != 'object') {
              if (isReallyNaN(a) && isReallyNaN(b)) {
                return true;
              } else {
                return a === b;
              }
            }

            if (isElement(a) || isElement(b)) {
              return a === b;
            }

            if (a === b) {
              return true;
            }

            if (a === null && b !== null || a !== null && b === null) {
              return false;
            }

            if (a instanceof RegExp && b instanceof RegExp) {
              return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
            }

            var aString = Object.prototype.toString.call(a);

            if (aString != Object.prototype.toString.call(b)) {
              return false;
            }

            if (aString == "[object Date]") {
              return a.valueOf() === b.valueOf();
            }

            var prop,
                aLength = 0,
                bLength = 0;

            if (aString == "[object Array]" && a.length !== b.length) {
              return false;
            }

            for (prop in a) {
              aLength += 1;

              if (!deepEqual(a[prop], b[prop])) {
                return false;
              }
            }

            for (prop in b) {
              bLength += 1;
            }

            return aLength == bLength;
          },
          functionName: function functionName(func) {
            var name = func.displayName || func.name; // Use function decomposition as a last resort to get function
            // name. Does not rely on function decomposition to work - if it
            // doesn't debugging will be slightly less informative
            // (i.e. toString will say 'spy' rather than 'myFunc').

            if (!name) {
              var matches = func.toString().match(/function ([^\s\(]+)/);
              name = matches && matches[1];
            }

            return name;
          },
          functionToString: function toString() {
            if (this.getCall && this.callCount) {
              var thisValue,
                  prop,
                  i = this.callCount;

              while (i--) {
                thisValue = this.getCall(i).thisValue;

                for (prop in thisValue) {
                  if (thisValue[prop] === this) {
                    return prop;
                  }
                }
              }
            }

            return this.displayName || "sinon fake";
          },
          getConfig: function getConfig(custom) {
            var config = {};
            custom = custom || {};
            var defaults = sinon.defaultConfig;

            for (var prop in defaults) {
              if (defaults.hasOwnProperty(prop)) {
                config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];
              }
            }

            return config;
          },
          format: function format(val) {
            return "" + val;
          },
          defaultConfig: {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
          },
          timesInWords: function timesInWords(count) {
            return count == 1 && "once" || count == 2 && "twice" || count == 3 && "thrice" || (count || 0) + " times";
          },
          calledInOrder: function calledInOrder(spies) {
            for (var i = 1, l = spies.length; i < l; i++) {
              if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {
                return false;
              }
            }

            return true;
          },
          orderByFirstCall: function orderByFirstCall(spies) {
            return spies.sort(function (a, b) {
              // uuid, won't ever be equal
              var aCall = a.getCall(0);
              var bCall = b.getCall(0);
              var aId = aCall && aCall.callId || -1;
              var bId = bCall && bCall.callId || -1;
              return aId < bId ? -1 : 1;
            });
          },
          log: function log() {},
          logError: function logError(label, err) {
            var msg = label + " threw exception: ";
            sinon.log(msg + "[" + err.name + "] " + err.message);

            if (err.stack) {
              sinon.log(err.stack);
            }

            setTimeout(function () {
              err.message = msg + err.message;
              throw err;
            }, 0);
          },
          typeOf: function typeOf(value) {
            if (value === null) {
              return "null";
            } else if (value === undefined) {
              return "undefined";
            }

            var string = Object.prototype.toString.call(value);
            return string.substring(8, string.length - 1).toLowerCase();
          },
          createStubInstance: function createStubInstance(constructor) {
            if (typeof constructor !== "function") {
              throw new TypeError("The constructor should be a function.");
            }

            return sinon.stub(sinon.create(constructor.prototype));
          },
          restore: function restore(object) {
            if (object !== null && _typeof(object) === "object") {
              for (var prop in object) {
                if (isRestorable(object[prop])) {
                  object[prop].restore();
                }
              }
            } else if (isRestorable(object)) {
              object.restore();
            }
          }
        };
        var isNode = typeof module !== "undefined" && module.exports;
        var isAMD = typeof define === 'function' && _typeof(define.amd) === 'object' && define.amd;

        if (isAMD) {
          define(function () {
            return sinon;
          });
        } else if (isNode) {
          try {
            formatio = require("formatio");
          } catch (e) {}

          module.exports = sinon;
          module.exports.spy = require("./sinon/spy");
          module.exports.spyCall = require("./sinon/call");
          module.exports.behavior = require("./sinon/behavior");
          module.exports.stub = require("./sinon/stub");
          module.exports.mock = require("./sinon/mock");
          module.exports.collection = require("./sinon/collection");
          module.exports.assert = require("./sinon/assert");
          module.exports.sandbox = require("./sinon/sandbox");
          module.exports.test = require("./sinon/test");
          module.exports.testCase = require("./sinon/test_case");
          module.exports.assert = require("./sinon/assert");
          module.exports.match = require("./sinon/match");
        }

        if (formatio) {
          var formatter = formatio.configure({
            quoteStrings: false
          });

          sinon.format = function () {
            return formatter.ascii.apply(formatter, arguments);
          };
        } else if (isNode) {
          try {
            var util = require("util");

            sinon.format = function (value) {
              return _typeof(value) == "object" && value.toString === Object.prototype.toString ? util.inspect(value) : value;
            };
          } catch (e) {
            /* Node, but no util module - would be very old, but better safe than
             sorry */
          }
        }

        return sinon;
      }(_typeof(formatio) == "object" && formatio);
      /* @depend ../sinon.js */

      /*jslint eqeqeq: false, onevar: false, plusplus: false*/

      /*global module, require, sinon*/

      /**
       * Match functions
       *
       * @author Maximilian Antoni (mail@maxantoni.de)
       * @license BSD
       *
       * Copyright (c) 2012 Maximilian Antoni
       */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        function assertType(value, type, name) {
          var actual = sinon.typeOf(value);

          if (actual !== type) {
            throw new TypeError("Expected type of " + name + " to be " + type + ", but was " + actual);
          }
        }

        var matcher = {
          toString: function toString() {
            return this.message;
          }
        };

        function isMatcher(object) {
          return matcher.isPrototypeOf(object);
        }

        function matchObject(expectation, actual) {
          if (actual === null || actual === undefined) {
            return false;
          }

          for (var key in expectation) {
            if (expectation.hasOwnProperty(key)) {
              var exp = expectation[key];
              var act = actual[key];

              if (match.isMatcher(exp)) {
                if (!exp.test(act)) {
                  return false;
                }
              } else if (sinon.typeOf(exp) === "object") {
                if (!matchObject(exp, act)) {
                  return false;
                }
              } else if (!sinon.deepEqual(exp, act)) {
                return false;
              }
            }
          }

          return true;
        }

        matcher.or = function (m2) {
          if (!arguments.length) {
            throw new TypeError("Matcher expected");
          } else if (!isMatcher(m2)) {
            m2 = match(m2);
          }

          var m1 = this;
          var or = sinon.create(matcher);

          or.test = function (actual) {
            return m1.test(actual) || m2.test(actual);
          };

          or.message = m1.message + ".or(" + m2.message + ")";
          return or;
        };

        matcher.and = function (m2) {
          if (!arguments.length) {
            throw new TypeError("Matcher expected");
          } else if (!isMatcher(m2)) {
            m2 = match(m2);
          }

          var m1 = this;
          var and = sinon.create(matcher);

          and.test = function (actual) {
            return m1.test(actual) && m2.test(actual);
          };

          and.message = m1.message + ".and(" + m2.message + ")";
          return and;
        };

        var match = function match(expectation, message) {
          var m = sinon.create(matcher);
          var type = sinon.typeOf(expectation);

          switch (type) {
            case "object":
              if (typeof expectation.test === "function") {
                m.test = function (actual) {
                  return expectation.test(actual) === true;
                };

                m.message = "match(" + sinon.functionName(expectation.test) + ")";
                return m;
              }

              var str = [];

              for (var key in expectation) {
                if (expectation.hasOwnProperty(key)) {
                  str.push(key + ": " + expectation[key]);
                }
              }

              m.test = function (actual) {
                return matchObject(expectation, actual);
              };

              m.message = "match(" + str.join(", ") + ")";
              break;

            case "number":
              m.test = function (actual) {
                return expectation == actual;
              };

              break;

            case "string":
              m.test = function (actual) {
                if (typeof actual !== "string") {
                  return false;
                }

                return actual.indexOf(expectation) !== -1;
              };

              m.message = "match(\"" + expectation + "\")";
              break;

            case "regexp":
              m.test = function (actual) {
                if (typeof actual !== "string") {
                  return false;
                }

                return expectation.test(actual);
              };

              break;

            case "function":
              m.test = expectation;

              if (message) {
                m.message = message;
              } else {
                m.message = "match(" + sinon.functionName(expectation) + ")";
              }

              break;

            default:
              m.test = function (actual) {
                return sinon.deepEqual(expectation, actual);
              };

          }

          if (!m.message) {
            m.message = "match(" + expectation + ")";
          }

          return m;
        };

        match.isMatcher = isMatcher;
        match.any = match(function () {
          return true;
        }, "any");
        match.defined = match(function (actual) {
          return actual !== null && actual !== undefined;
        }, "defined");
        match.truthy = match(function (actual) {
          return !!actual;
        }, "truthy");
        match.falsy = match(function (actual) {
          return !actual;
        }, "falsy");

        match.same = function (expectation) {
          return match(function (actual) {
            return expectation === actual;
          }, "same(" + expectation + ")");
        };

        match.typeOf = function (type) {
          assertType(type, "string", "type");
          return match(function (actual) {
            return sinon.typeOf(actual) === type;
          }, "typeOf(\"" + type + "\")");
        };

        match.instanceOf = function (type) {
          assertType(type, "function", "type");
          return match(function (actual) {
            return actual instanceof type;
          }, "instanceOf(" + sinon.functionName(type) + ")");
        };

        function createPropertyMatcher(propertyTest, messagePrefix) {
          return function (property, value) {
            assertType(property, "string", "property");
            var onlyProperty = arguments.length === 1;
            var message = messagePrefix + "(\"" + property + "\"";

            if (!onlyProperty) {
              message += ", " + value;
            }

            message += ")";
            return match(function (actual) {
              if (actual === undefined || actual === null || !propertyTest(actual, property)) {
                return false;
              }

              return onlyProperty || sinon.deepEqual(value, actual[property]);
            }, message);
          };
        }

        match.has = createPropertyMatcher(function (actual, property) {
          if (_typeof(actual) === "object") {
            return property in actual;
          }

          return actual[property] !== undefined;
        }, "has");
        match.hasOwn = createPropertyMatcher(function (actual, property) {
          return actual.hasOwnProperty(property);
        }, "hasOwn");
        match.bool = match.typeOf("boolean");
        match.number = match.typeOf("number");
        match.string = match.typeOf("string");
        match.object = match.typeOf("object");
        match.func = match.typeOf("function");
        match.array = match.typeOf("array");
        match.regexp = match.typeOf("regexp");
        match.date = match.typeOf("date");

        if (commonJSModule) {
          module.exports = match;
        } else {
          sinon.match = match;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /**
        * @depend ../sinon.js
        * @depend match.js
        */

      /*jslint eqeqeq: false, onevar: false, plusplus: false*/

      /*global module, require, sinon*/

      /**
        * Spy calls
        *
        * @author Christian Johansen (christian@cjohansen.no)
        * @author Maximilian Antoni (mail@maxantoni.de)
        * @license BSD
        *
        * Copyright (c) 2010-2013 Christian Johansen
        * Copyright (c) 2013 Maximilian Antoni
        */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        function throwYieldError(proxy, text, args) {
          var msg = sinon.functionName(proxy) + text;

          if (args.length) {
            msg += " Received [" + slice.call(args).join(", ") + "]";
          }

          throw new Error(msg);
        }

        var slice = Array.prototype.slice;
        var callProto = {
          calledOn: function calledOn(thisValue) {
            if (sinon.match && sinon.match.isMatcher(thisValue)) {
              return thisValue.test(this.thisValue);
            }

            return this.thisValue === thisValue;
          },
          calledWith: function calledWith() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
              if (!sinon.deepEqual(arguments[i], this.args[i])) {
                return false;
              }
            }

            return true;
          },
          calledWithMatch: function calledWithMatch() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
              var actual = this.args[i];
              var expectation = arguments[i];

              if (!sinon.match || !sinon.match(expectation).test(actual)) {
                return false;
              }
            }

            return true;
          },
          calledWithExactly: function calledWithExactly() {
            return arguments.length == this.args.length && this.calledWith.apply(this, arguments);
          },
          notCalledWith: function notCalledWith() {
            return !this.calledWith.apply(this, arguments);
          },
          notCalledWithMatch: function notCalledWithMatch() {
            return !this.calledWithMatch.apply(this, arguments);
          },
          returned: function returned(value) {
            return sinon.deepEqual(value, this.returnValue);
          },
          threw: function threw(error) {
            if (typeof error === "undefined" || !this.exception) {
              return !!this.exception;
            }

            return this.exception === error || this.exception.name === error;
          },
          calledWithNew: function calledWithNew() {
            return this.proxy.prototype && this.thisValue instanceof this.proxy;
          },
          calledBefore: function calledBefore(other) {
            return this.callId < other.callId;
          },
          calledAfter: function calledAfter(other) {
            return this.callId > other.callId;
          },
          callArg: function callArg(pos) {
            this.args[pos]();
          },
          callArgOn: function callArgOn(pos, thisValue) {
            this.args[pos].apply(thisValue);
          },
          callArgWith: function callArgWith(pos) {
            this.callArgOnWith.apply(this, [pos, null].concat(slice.call(arguments, 1)));
          },
          callArgOnWith: function callArgOnWith(pos, thisValue) {
            var args = slice.call(arguments, 2);
            this.args[pos].apply(thisValue, args);
          },
          "yield": function _yield() {
            this.yieldOn.apply(this, [null].concat(slice.call(arguments, 0)));
          },
          yieldOn: function yieldOn(thisValue) {
            var args = this.args;

            for (var i = 0, l = args.length; i < l; ++i) {
              if (typeof args[i] === "function") {
                args[i].apply(thisValue, slice.call(arguments, 1));
                return;
              }
            }

            throwYieldError(this.proxy, " cannot yield since no callback was passed.", args);
          },
          yieldTo: function yieldTo(prop) {
            this.yieldToOn.apply(this, [prop, null].concat(slice.call(arguments, 1)));
          },
          yieldToOn: function yieldToOn(prop, thisValue) {
            var args = this.args;

            for (var i = 0, l = args.length; i < l; ++i) {
              if (args[i] && typeof args[i][prop] === "function") {
                args[i][prop].apply(thisValue, slice.call(arguments, 2));
                return;
              }
            }

            throwYieldError(this.proxy, " cannot yield to '" + prop + "' since no callback was passed.", args);
          },
          toString: function toString() {
            var callStr = this.proxy.toString() + "(";
            var args = [];

            for (var i = 0, l = this.args.length; i < l; ++i) {
              args.push(sinon.format(this.args[i]));
            }

            callStr = callStr + args.join(", ") + ")";

            if (typeof this.returnValue != "undefined") {
              callStr += " => " + sinon.format(this.returnValue);
            }

            if (this.exception) {
              callStr += " !" + this.exception.name;

              if (this.exception.message) {
                callStr += "(" + this.exception.message + ")";
              }
            }

            return callStr;
          }
        };
        callProto.invokeCallback = callProto["yield"];

        function createSpyCall(spy, thisValue, args, returnValue, exception, id) {
          if (typeof id !== "number") {
            throw new TypeError("Call id is not a number");
          }

          var proxyCall = sinon.create(callProto);
          proxyCall.proxy = spy;
          proxyCall.thisValue = thisValue;
          proxyCall.args = args;
          proxyCall.returnValue = returnValue;
          proxyCall.exception = exception;
          proxyCall.callId = id;
          return proxyCall;
        }

        createSpyCall.toString = callProto.toString; // used by mocks

        if (commonJSModule) {
          module.exports = createSpyCall;
        } else {
          sinon.spyCall = createSpyCall;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /**
        * @depend ../sinon.js
        * @depend call.js
        */

      /*jslint eqeqeq: false, onevar: false, plusplus: false*/

      /*global module, require, sinon*/

      /**
        * Spy functions
        *
        * @author Christian Johansen (christian@cjohansen.no)
        * @license BSD
        *
        * Copyright (c) 2010-2013 Christian Johansen
        */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;
        var push = Array.prototype.push;
        var slice = Array.prototype.slice;
        var callId = 0;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        function spy(object, property) {
          if (!property && typeof object == "function") {
            return spy.create(object);
          }

          if (!object && !property) {
            return spy.create(function () {});
          }

          var method = object[property];
          return sinon.wrapMethod(object, property, spy.create(method));
        }

        function matchingFake(fakes, args, strict) {
          if (!fakes) {
            return;
          }

          for (var i = 0, l = fakes.length; i < l; i++) {
            if (fakes[i].matches(args, strict)) {
              return fakes[i];
            }
          }
        }

        function incrementCallCount() {
          this.called = true;
          this.callCount += 1;
          this.notCalled = false;
          this.calledOnce = this.callCount == 1;
          this.calledTwice = this.callCount == 2;
          this.calledThrice = this.callCount == 3;
        }

        function createCallProperties() {
          this.firstCall = this.getCall(0);
          this.secondCall = this.getCall(1);
          this.thirdCall = this.getCall(2);
          this.lastCall = this.getCall(this.callCount - 1);
        }

        var vars = "a,b,c,d,e,f,g,h,i,j,k,l";

        function createProxy(func) {
          // Retain the function length:
          var p;

          if (func.length) {
            eval("p = (function proxy(" + vars.substring(0, func.length * 2 - 1) + ") { return p.invoke(func, this, slice.call(arguments)); });");
          } else {
            p = function proxy() {
              return p.invoke(func, this, slice.call(arguments));
            };
          }

          return p;
        }

        var uuid = 0; // Public API

        var spyApi = {
          reset: function reset() {
            this.called = false;
            this.notCalled = true;
            this.calledOnce = false;
            this.calledTwice = false;
            this.calledThrice = false;
            this.callCount = 0;
            this.firstCall = null;
            this.secondCall = null;
            this.thirdCall = null;
            this.lastCall = null;
            this.args = [];
            this.returnValues = [];
            this.thisValues = [];
            this.exceptions = [];
            this.callIds = [];

            if (this.fakes) {
              for (var i = 0; i < this.fakes.length; i++) {
                this.fakes[i].reset();
              }
            }
          },
          create: function create(func) {
            var name;

            if (typeof func != "function") {
              func = function func() {};
            } else {
              name = sinon.functionName(func);
            }

            var proxy = createProxy(func);
            sinon.extend(proxy, spy);
            delete proxy.create;
            sinon.extend(proxy, func);
            proxy.reset();
            proxy.prototype = func.prototype;
            proxy.displayName = name || "spy";
            proxy.toString = sinon.functionToString;
            proxy._create = sinon.spy.create;
            proxy.id = "spy#" + uuid++;
            return proxy;
          },
          invoke: function invoke(func, thisValue, args) {
            var matching = matchingFake(this.fakes, args);
            var exception, returnValue;
            incrementCallCount.call(this);
            push.call(this.thisValues, thisValue);
            push.call(this.args, args);
            push.call(this.callIds, callId++);

            try {
              if (matching) {
                returnValue = matching.invoke(func, thisValue, args);
              } else {
                returnValue = (this.func || func).apply(thisValue, args);
              }

              var thisCall = this.getCall(this.callCount - 1);

              if (thisCall.calledWithNew() && _typeof(returnValue) !== 'object') {
                returnValue = thisValue;
              }
            } catch (e) {
              exception = e;
            }

            push.call(this.exceptions, exception);
            push.call(this.returnValues, returnValue);
            createCallProperties.call(this);

            if (exception !== undefined) {
              throw exception;
            }

            return returnValue;
          },
          getCall: function getCall(i) {
            if (i < 0 || i >= this.callCount) {
              return null;
            }

            return sinon.spyCall(this, this.thisValues[i], this.args[i], this.returnValues[i], this.exceptions[i], this.callIds[i]);
          },
          getCalls: function getCalls() {
            var calls = [];
            var i;

            for (i = 0; i < this.callCount; i++) {
              calls.push(this.getCall(i));
            }

            return calls;
          },
          calledBefore: function calledBefore(spyFn) {
            if (!this.called) {
              return false;
            }

            if (!spyFn.called) {
              return true;
            }

            return this.callIds[0] < spyFn.callIds[spyFn.callIds.length - 1];
          },
          calledAfter: function calledAfter(spyFn) {
            if (!this.called || !spyFn.called) {
              return false;
            }

            return this.callIds[this.callCount - 1] > spyFn.callIds[spyFn.callCount - 1];
          },
          withArgs: function withArgs() {
            var args = slice.call(arguments);

            if (this.fakes) {
              var match = matchingFake(this.fakes, args, true);

              if (match) {
                return match;
              }
            } else {
              this.fakes = [];
            }

            var original = this;

            var fake = this._create();

            fake.matchingAguments = args;
            fake.parent = this;
            push.call(this.fakes, fake);

            fake.withArgs = function () {
              return original.withArgs.apply(original, arguments);
            };

            for (var i = 0; i < this.args.length; i++) {
              if (fake.matches(this.args[i])) {
                incrementCallCount.call(fake);
                push.call(fake.thisValues, this.thisValues[i]);
                push.call(fake.args, this.args[i]);
                push.call(fake.returnValues, this.returnValues[i]);
                push.call(fake.exceptions, this.exceptions[i]);
                push.call(fake.callIds, this.callIds[i]);
              }
            }

            createCallProperties.call(fake);
            return fake;
          },
          matches: function matches(args, strict) {
            var margs = this.matchingAguments;

            if (margs.length <= args.length && sinon.deepEqual(margs, args.slice(0, margs.length))) {
              return !strict || margs.length == args.length;
            }
          },
          printf: function printf(format) {
            var spy = this;
            var args = slice.call(arguments, 1);
            var formatter;
            return (format || "").replace(/%(.)/g, function (match, specifyer) {
              formatter = spyApi.formatters[specifyer];

              if (typeof formatter == "function") {
                return formatter.call(null, spy, args);
              } else if (!isNaN(parseInt(specifyer, 10))) {
                return sinon.format(args[specifyer - 1]);
              }

              return "%" + specifyer;
            });
          }
        };

        function delegateToCalls(method, matchAny, actual, notCalled) {
          spyApi[method] = function () {
            if (!this.called) {
              if (notCalled) {
                return notCalled.apply(this, arguments);
              }

              return false;
            }

            var currentCall;
            var matches = 0;

            for (var i = 0, l = this.callCount; i < l; i += 1) {
              currentCall = this.getCall(i);

              if (currentCall[actual || method].apply(currentCall, arguments)) {
                matches += 1;

                if (matchAny) {
                  return true;
                }
              }
            }

            return matches === this.callCount;
          };
        }

        delegateToCalls("calledOn", true);
        delegateToCalls("alwaysCalledOn", false, "calledOn");
        delegateToCalls("calledWith", true);
        delegateToCalls("calledWithMatch", true);
        delegateToCalls("alwaysCalledWith", false, "calledWith");
        delegateToCalls("alwaysCalledWithMatch", false, "calledWithMatch");
        delegateToCalls("calledWithExactly", true);
        delegateToCalls("alwaysCalledWithExactly", false, "calledWithExactly");
        delegateToCalls("neverCalledWith", false, "notCalledWith", function () {
          return true;
        });
        delegateToCalls("neverCalledWithMatch", false, "notCalledWithMatch", function () {
          return true;
        });
        delegateToCalls("threw", true);
        delegateToCalls("alwaysThrew", false, "threw");
        delegateToCalls("returned", true);
        delegateToCalls("alwaysReturned", false, "returned");
        delegateToCalls("calledWithNew", true);
        delegateToCalls("alwaysCalledWithNew", false, "calledWithNew");
        delegateToCalls("callArg", false, "callArgWith", function () {
          throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
        });
        spyApi.callArgWith = spyApi.callArg;
        delegateToCalls("callArgOn", false, "callArgOnWith", function () {
          throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
        });
        spyApi.callArgOnWith = spyApi.callArgOn;
        delegateToCalls("yield", false, "yield", function () {
          throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
        }); // "invokeCallback" is an alias for "yield" since "yield" is invalid in strict mode.

        spyApi.invokeCallback = spyApi["yield"];
        delegateToCalls("yieldOn", false, "yieldOn", function () {
          throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
        });
        delegateToCalls("yieldTo", false, "yieldTo", function (property) {
          throw new Error(this.toString() + " cannot yield to '" + property + "' since it was not yet invoked.");
        });
        delegateToCalls("yieldToOn", false, "yieldToOn", function (property) {
          throw new Error(this.toString() + " cannot yield to '" + property + "' since it was not yet invoked.");
        });
        spyApi.formatters = {
          "c": function c(spy) {
            return sinon.timesInWords(spy.callCount);
          },
          "n": function n(spy) {
            return spy.toString();
          },
          "C": function C(spy) {
            var calls = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
              var stringifiedCall = "    " + spy.getCall(i).toString();

              if (/\n/.test(calls[i - 1])) {
                stringifiedCall = "\n" + stringifiedCall;
              }

              push.call(calls, stringifiedCall);
            }

            return calls.length > 0 ? "\n" + calls.join("\n") : "";
          },
          "t": function t(spy) {
            var objects = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
              push.call(objects, sinon.format(spy.thisValues[i]));
            }

            return objects.join(", ");
          },
          "*": function _(spy, args) {
            var formatted = [];

            for (var i = 0, l = args.length; i < l; ++i) {
              push.call(formatted, sinon.format(args[i]));
            }

            return formatted.join(", ");
          }
        };
        sinon.extend(spy, spyApi);
        spy.spyCall = sinon.spyCall;

        if (commonJSModule) {
          module.exports = spy;
        } else {
          sinon.spy = spy;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /**
       * @depend ../sinon.js
       */

      /*jslint eqeqeq: false, onevar: false*/

      /*global module, require, sinon, process, setImmediate, setTimeout*/

      /**
       * Stub behavior
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @author Tim Fischbach (mail@timfischbach.de)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        var slice = Array.prototype.slice;
        var join = Array.prototype.join;
        var proto;

        var nextTick = function () {
          if ((typeof process === "undefined" ? "undefined" : _typeof(process)) === "object" && typeof process.nextTick === "function") {
            return process.nextTick;
          } else if (typeof setImmediate === "function") {
            return setImmediate;
          } else {
            return function (callback) {
              setTimeout(callback, 0);
            };
          }
        }();

        function throwsException(error, message) {
          if (typeof error == "string") {
            this.exception = new Error(message || "");
            this.exception.name = error;
          } else if (!error) {
            this.exception = new Error("Error");
          } else {
            this.exception = error;
          }

          return this;
        }

        function getCallback(behavior, args) {
          var callArgAt = behavior.callArgAt;

          if (callArgAt < 0) {
            var callArgProp = behavior.callArgProp;

            for (var i = 0, l = args.length; i < l; ++i) {
              if (!callArgProp && typeof args[i] == "function") {
                return args[i];
              }

              if (callArgProp && args[i] && typeof args[i][callArgProp] == "function") {
                return args[i][callArgProp];
              }
            }

            return null;
          }

          return args[callArgAt];
        }

        function getCallbackError(behavior, func, args) {
          if (behavior.callArgAt < 0) {
            var msg;

            if (behavior.callArgProp) {
              msg = sinon.functionName(behavior.stub) + " expected to yield to '" + behavior.callArgProp + "', but no object with such a property was passed.";
            } else {
              msg = sinon.functionName(behavior.stub) + " expected to yield, but no callback was passed.";
            }

            if (args.length > 0) {
              msg += " Received [" + join.call(args, ", ") + "]";
            }

            return msg;
          }

          return "argument at index " + behavior.callArgAt + " is not a function: " + func;
        }

        function callCallback(behavior, args) {
          if (typeof behavior.callArgAt == "number") {
            var func = getCallback(behavior, args);

            if (typeof func != "function") {
              throw new TypeError(getCallbackError(behavior, func, args));
            }

            if (behavior.callbackAsync) {
              nextTick(function () {
                func.apply(behavior.callbackContext, behavior.callbackArguments);
              });
            } else {
              func.apply(behavior.callbackContext, behavior.callbackArguments);
            }
          }
        }

        proto = {
          create: function create(stub) {
            var behavior = sinon.extend({}, sinon.behavior);
            delete behavior.create;
            behavior.stub = stub;
            return behavior;
          },
          isPresent: function isPresent() {
            return typeof this.callArgAt == 'number' || this.exception || typeof this.returnArgAt == 'number' || this.returnThis || this.returnValueDefined;
          },
          invoke: function invoke(context, args) {
            callCallback(this, args);

            if (this.exception) {
              throw this.exception;
            } else if (typeof this.returnArgAt == 'number') {
              return args[this.returnArgAt];
            } else if (this.returnThis) {
              return context;
            }

            return this.returnValue;
          },
          onCall: function onCall(index) {
            return this.stub.onCall(index);
          },
          onFirstCall: function onFirstCall() {
            return this.stub.onFirstCall();
          },
          onSecondCall: function onSecondCall() {
            return this.stub.onSecondCall();
          },
          onThirdCall: function onThirdCall() {
            return this.stub.onThirdCall();
          },
          withArgs: function withArgs()
          /* arguments */
          {
            throw new Error("Defining a stub by invoking \"stub.onCall(...).withArgs(...)\" is not supported. Use \"stub.withArgs(...).onCall(...)\" to define sequential behavior for calls with certain arguments.");
          },
          callsArg: function callsArg(pos) {
            if (typeof pos != "number") {
              throw new TypeError("argument index is not number");
            }

            this.callArgAt = pos;
            this.callbackArguments = [];
            this.callbackContext = undefined;
            this.callArgProp = undefined;
            this.callbackAsync = false;
            return this;
          },
          callsArgOn: function callsArgOn(pos, context) {
            if (typeof pos != "number") {
              throw new TypeError("argument index is not number");
            }

            if (_typeof(context) != "object") {
              throw new TypeError("argument context is not an object");
            }

            this.callArgAt = pos;
            this.callbackArguments = [];
            this.callbackContext = context;
            this.callArgProp = undefined;
            this.callbackAsync = false;
            return this;
          },
          callsArgWith: function callsArgWith(pos) {
            if (typeof pos != "number") {
              throw new TypeError("argument index is not number");
            }

            this.callArgAt = pos;
            this.callbackArguments = slice.call(arguments, 1);
            this.callbackContext = undefined;
            this.callArgProp = undefined;
            this.callbackAsync = false;
            return this;
          },
          callsArgOnWith: function callsArgWith(pos, context) {
            if (typeof pos != "number") {
              throw new TypeError("argument index is not number");
            }

            if (_typeof(context) != "object") {
              throw new TypeError("argument context is not an object");
            }

            this.callArgAt = pos;
            this.callbackArguments = slice.call(arguments, 2);
            this.callbackContext = context;
            this.callArgProp = undefined;
            this.callbackAsync = false;
            return this;
          },
          yields: function yields() {
            this.callArgAt = -1;
            this.callbackArguments = slice.call(arguments, 0);
            this.callbackContext = undefined;
            this.callArgProp = undefined;
            this.callbackAsync = false;
            return this;
          },
          yieldsOn: function yieldsOn(context) {
            if (_typeof(context) != "object") {
              throw new TypeError("argument context is not an object");
            }

            this.callArgAt = -1;
            this.callbackArguments = slice.call(arguments, 1);
            this.callbackContext = context;
            this.callArgProp = undefined;
            this.callbackAsync = false;
            return this;
          },
          yieldsTo: function yieldsTo(prop) {
            this.callArgAt = -1;
            this.callbackArguments = slice.call(arguments, 1);
            this.callbackContext = undefined;
            this.callArgProp = prop;
            this.callbackAsync = false;
            return this;
          },
          yieldsToOn: function yieldsToOn(prop, context) {
            if (_typeof(context) != "object") {
              throw new TypeError("argument context is not an object");
            }

            this.callArgAt = -1;
            this.callbackArguments = slice.call(arguments, 2);
            this.callbackContext = context;
            this.callArgProp = prop;
            this.callbackAsync = false;
            return this;
          },
          "throws": throwsException,
          throwsException: throwsException,
          returns: function returns(value) {
            this.returnValue = value;
            this.returnValueDefined = true;
            return this;
          },
          returnsArg: function returnsArg(pos) {
            if (typeof pos != "number") {
              throw new TypeError("argument index is not number");
            }

            this.returnArgAt = pos;
            return this;
          },
          returnsThis: function returnsThis() {
            this.returnThis = true;
            return this;
          }
        }; // create asynchronous versions of callsArg* and yields* methods

        for (var method in proto) {
          // need to avoid creating anotherasync versions of the newly added async methods
          if (proto.hasOwnProperty(method) && method.match(/^(callsArg|yields)/) && !method.match(/Async/)) {
            proto[method + 'Async'] = function (syncFnName) {
              return function () {
                var result = this[syncFnName].apply(this, arguments);
                this.callbackAsync = true;
                return result;
              };
            }(method);
          }
        }

        if (commonJSModule) {
          module.exports = proto;
        } else {
          sinon.behavior = proto;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /**
       * @depend ../sinon.js
       * @depend spy.js
       * @depend behavior.js
       */

      /*jslint eqeqeq: false, onevar: false*/

      /*global module, require, sinon*/

      /**
       * Stub functions
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        function stub(object, property, func) {
          if (!!func && typeof func != "function") {
            throw new TypeError("Custom stub should be function");
          }

          var wrapper;

          if (func) {
            wrapper = sinon.spy && sinon.spy.create ? sinon.spy.create(func) : func;
          } else {
            wrapper = stub.create();
          }

          if (!object && typeof property === "undefined") {
            return sinon.stub.create();
          }

          if (typeof property === "undefined" && _typeof(object) == "object") {
            for (var prop in object) {
              if (typeof object[prop] === "function") {
                stub(object, prop);
              }
            }

            return object;
          }

          return sinon.wrapMethod(object, property, wrapper);
        }

        function getDefaultBehavior(stub) {
          return stub.defaultBehavior || getParentBehaviour(stub) || sinon.behavior.create(stub);
        }

        function getParentBehaviour(stub) {
          return stub.parent && getCurrentBehavior(stub.parent);
        }

        function getCurrentBehavior(stub) {
          var behavior = stub.behaviors[stub.callCount - 1];
          return behavior && behavior.isPresent() ? behavior : getDefaultBehavior(stub);
        }

        var uuid = 0;
        sinon.extend(stub, function () {
          var proto = {
            create: function create() {
              var _functionStub = function functionStub() {
                return getCurrentBehavior(_functionStub).invoke(this, arguments);
              };

              _functionStub.id = "stub#" + uuid++;
              var orig = _functionStub;
              _functionStub = sinon.spy.create(_functionStub);
              _functionStub.func = orig;
              sinon.extend(_functionStub, stub);
              _functionStub._create = sinon.stub.create;
              _functionStub.displayName = "stub";
              _functionStub.toString = sinon.functionToString;
              _functionStub.defaultBehavior = null;
              _functionStub.behaviors = [];
              return _functionStub;
            },
            resetBehavior: function resetBehavior() {
              var i;
              this.defaultBehavior = null;
              this.behaviors = [];
              delete this.returnValue;
              delete this.returnArgAt;
              this.returnThis = false;

              if (this.fakes) {
                for (i = 0; i < this.fakes.length; i++) {
                  this.fakes[i].resetBehavior();
                }
              }
            },
            onCall: function onCall(index) {
              if (!this.behaviors[index]) {
                this.behaviors[index] = sinon.behavior.create(this);
              }

              return this.behaviors[index];
            },
            onFirstCall: function onFirstCall() {
              return this.onCall(0);
            },
            onSecondCall: function onSecondCall() {
              return this.onCall(1);
            },
            onThirdCall: function onThirdCall() {
              return this.onCall(2);
            }
          };

          for (var method in sinon.behavior) {
            if (sinon.behavior.hasOwnProperty(method) && !proto.hasOwnProperty(method) && method != 'create' && method != 'withArgs' && method != 'invoke') {
              proto[method] = function (behaviorMethod) {
                return function () {
                  this.defaultBehavior = this.defaultBehavior || sinon.behavior.create(this);
                  this.defaultBehavior[behaviorMethod].apply(this.defaultBehavior, arguments);
                  return this;
                };
              }(method);
            }
          }

          return proto;
        }());

        if (commonJSModule) {
          module.exports = stub;
        } else {
          sinon.stub = stub;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /**
       * @depend ../sinon.js
       * @depend stub.js
       */

      /*jslint eqeqeq: false, onevar: false, nomen: false*/

      /*global module, require, sinon*/

      /**
       * Mock functions.
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;
        var push = [].push;
        var match;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        match = sinon.match;

        if (!match && commonJSModule) {
          match = require("./match");
        }

        function mock(object) {
          if (!object) {
            return sinon.expectation.create("Anonymous mock");
          }

          return mock.create(object);
        }

        sinon.mock = mock;
        sinon.extend(mock, function () {
          function each(collection, callback) {
            if (!collection) {
              return;
            }

            for (var i = 0, l = collection.length; i < l; i += 1) {
              callback(collection[i]);
            }
          }

          return {
            create: function create(object) {
              if (!object) {
                throw new TypeError("object is null");
              }

              var mockObject = sinon.extend({}, mock);
              mockObject.object = object;
              delete mockObject.create;
              return mockObject;
            },
            expects: function expects(method) {
              if (!method) {
                throw new TypeError("method is falsy");
              }

              if (!this.expectations) {
                this.expectations = {};
                this.proxies = [];
              }

              if (!this.expectations[method]) {
                this.expectations[method] = [];
                var mockObject = this;
                sinon.wrapMethod(this.object, method, function () {
                  return mockObject.invokeMethod(method, this, arguments);
                });
                push.call(this.proxies, method);
              }

              var expectation = sinon.expectation.create(method);
              push.call(this.expectations[method], expectation);
              return expectation;
            },
            restore: function restore() {
              var object = this.object;
              each(this.proxies, function (proxy) {
                if (typeof object[proxy].restore == "function") {
                  object[proxy].restore();
                }
              });
            },
            verify: function verify() {
              var expectations = this.expectations || {};
              var messages = [],
                  met = [];
              each(this.proxies, function (proxy) {
                each(expectations[proxy], function (expectation) {
                  if (!expectation.met()) {
                    push.call(messages, expectation.toString());
                  } else {
                    push.call(met, expectation.toString());
                  }
                });
              });
              this.restore();

              if (messages.length > 0) {
                sinon.expectation.fail(messages.concat(met).join("\n"));
              } else {
                sinon.expectation.pass(messages.concat(met).join("\n"));
              }

              return true;
            },
            invokeMethod: function invokeMethod(method, thisValue, args) {
              var expectations = this.expectations && this.expectations[method];
              var length = expectations && expectations.length || 0,
                  i;

              for (i = 0; i < length; i += 1) {
                if (!expectations[i].met() && expectations[i].allowsCall(thisValue, args)) {
                  return expectations[i].apply(thisValue, args);
                }
              }

              var messages = [],
                  available,
                  exhausted = 0;

              for (i = 0; i < length; i += 1) {
                if (expectations[i].allowsCall(thisValue, args)) {
                  available = available || expectations[i];
                } else {
                  exhausted += 1;
                }

                push.call(messages, "    " + expectations[i].toString());
              }

              if (exhausted === 0) {
                return available.apply(thisValue, args);
              }

              messages.unshift("Unexpected call: " + sinon.spyCall.toString.call({
                proxy: method,
                args: args
              }));
              sinon.expectation.fail(messages.join("\n"));
            }
          };
        }());
        var times = sinon.timesInWords;

        sinon.expectation = function () {
          var slice = Array.prototype.slice;
          var _invoke = sinon.spy.invoke;

          function callCountInWords(callCount) {
            if (callCount == 0) {
              return "never called";
            } else {
              return "called " + times(callCount);
            }
          }

          function expectedCallCountInWords(expectation) {
            var min = expectation.minCalls;
            var max = expectation.maxCalls;

            if (typeof min == "number" && typeof max == "number") {
              var str = times(min);

              if (min != max) {
                str = "at least " + str + " and at most " + times(max);
              }

              return str;
            }

            if (typeof min == "number") {
              return "at least " + times(min);
            }

            return "at most " + times(max);
          }

          function receivedMinCalls(expectation) {
            var hasMinLimit = typeof expectation.minCalls == "number";
            return !hasMinLimit || expectation.callCount >= expectation.minCalls;
          }

          function receivedMaxCalls(expectation) {
            if (typeof expectation.maxCalls != "number") {
              return false;
            }

            return expectation.callCount == expectation.maxCalls;
          }

          function verifyMatcher(possibleMatcher, arg) {
            if (match && match.isMatcher(possibleMatcher)) {
              return possibleMatcher.test(arg);
            } else {
              return true;
            }
          }

          return {
            minCalls: 1,
            maxCalls: 1,
            create: function create(methodName) {
              var expectation = sinon.extend(sinon.stub.create(), sinon.expectation);
              delete expectation.create;
              expectation.method = methodName;
              return expectation;
            },
            invoke: function invoke(func, thisValue, args) {
              this.verifyCallAllowed(thisValue, args);
              return _invoke.apply(this, arguments);
            },
            atLeast: function atLeast(num) {
              if (typeof num != "number") {
                throw new TypeError("'" + num + "' is not number");
              }

              if (!this.limitsSet) {
                this.maxCalls = null;
                this.limitsSet = true;
              }

              this.minCalls = num;
              return this;
            },
            atMost: function atMost(num) {
              if (typeof num != "number") {
                throw new TypeError("'" + num + "' is not number");
              }

              if (!this.limitsSet) {
                this.minCalls = null;
                this.limitsSet = true;
              }

              this.maxCalls = num;
              return this;
            },
            never: function never() {
              return this.exactly(0);
            },
            once: function once() {
              return this.exactly(1);
            },
            twice: function twice() {
              return this.exactly(2);
            },
            thrice: function thrice() {
              return this.exactly(3);
            },
            exactly: function exactly(num) {
              if (typeof num != "number") {
                throw new TypeError("'" + num + "' is not a number");
              }

              this.atLeast(num);
              return this.atMost(num);
            },
            met: function met() {
              return !this.failed && receivedMinCalls(this);
            },
            verifyCallAllowed: function verifyCallAllowed(thisValue, args) {
              if (receivedMaxCalls(this)) {
                this.failed = true;
                sinon.expectation.fail(this.method + " already called " + times(this.maxCalls));
              }

              if ("expectedThis" in this && this.expectedThis !== thisValue) {
                sinon.expectation.fail(this.method + " called with " + thisValue + " as thisValue, expected " + this.expectedThis);
              }

              if (!("expectedArguments" in this)) {
                return;
              }

              if (!args) {
                sinon.expectation.fail(this.method + " received no arguments, expected " + sinon.format(this.expectedArguments));
              }

              if (args.length < this.expectedArguments.length) {
                sinon.expectation.fail(this.method + " received too few arguments (" + sinon.format(args) + "), expected " + sinon.format(this.expectedArguments));
              }

              if (this.expectsExactArgCount && args.length != this.expectedArguments.length) {
                sinon.expectation.fail(this.method + " received too many arguments (" + sinon.format(args) + "), expected " + sinon.format(this.expectedArguments));
              }

              for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                if (!verifyMatcher(this.expectedArguments[i], args[i])) {
                  sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) + ", didn't match " + this.expectedArguments.toString());
                }

                if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                  sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) + ", expected " + sinon.format(this.expectedArguments));
                }
              }
            },
            allowsCall: function allowsCall(thisValue, args) {
              if (this.met() && receivedMaxCalls(this)) {
                return false;
              }

              if ("expectedThis" in this && this.expectedThis !== thisValue) {
                return false;
              }

              if (!("expectedArguments" in this)) {
                return true;
              }

              args = args || [];

              if (args.length < this.expectedArguments.length) {
                return false;
              }

              if (this.expectsExactArgCount && args.length != this.expectedArguments.length) {
                return false;
              }

              for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                if (!verifyMatcher(this.expectedArguments[i], args[i])) {
                  return false;
                }

                if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                  return false;
                }
              }

              return true;
            },
            withArgs: function withArgs() {
              this.expectedArguments = slice.call(arguments);
              return this;
            },
            withExactArgs: function withExactArgs() {
              this.withArgs.apply(this, arguments);
              this.expectsExactArgCount = true;
              return this;
            },
            on: function on(thisValue) {
              this.expectedThis = thisValue;
              return this;
            },
            toString: function toString() {
              var args = (this.expectedArguments || []).slice();

              if (!this.expectsExactArgCount) {
                push.call(args, "[...]");
              }

              var callStr = sinon.spyCall.toString.call({
                proxy: this.method || "anonymous mock expectation",
                args: args
              });
              var message = callStr.replace(", [...", "[, ...") + " " + expectedCallCountInWords(this);

              if (this.met()) {
                return "Expectation met: " + message;
              }

              return "Expected " + message + " (" + callCountInWords(this.callCount) + ")";
            },
            verify: function verify() {
              if (!this.met()) {
                sinon.expectation.fail(this.toString());
              } else {
                sinon.expectation.pass(this.toString());
              }

              return true;
            },
            pass: function pass(message) {
              sinon.assert.pass(message);
            },
            fail: function fail(message) {
              var exception = new Error(message);
              exception.name = "ExpectationError";
              throw exception;
            }
          };
        }();

        if (commonJSModule) {
          module.exports = mock;
        } else {
          sinon.mock = mock;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /**
       * @depend ../sinon.js
       * @depend stub.js
       * @depend mock.js
       */

      /*jslint eqeqeq: false, onevar: false, forin: true*/

      /*global module, require, sinon*/

      /**
       * Collections of stubs, spies and mocks.
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;
        var push = [].push;
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        function getFakes(fakeCollection) {
          if (!fakeCollection.fakes) {
            fakeCollection.fakes = [];
          }

          return fakeCollection.fakes;
        }

        function each(fakeCollection, method) {
          var fakes = getFakes(fakeCollection);

          for (var i = 0, l = fakes.length; i < l; i += 1) {
            if (typeof fakes[i][method] == "function") {
              fakes[i][method]();
            }
          }
        }

        function compact(fakeCollection) {
          var fakes = getFakes(fakeCollection);
          var i = 0;

          while (i < fakes.length) {
            fakes.splice(i, 1);
          }
        }

        var collection = {
          verify: function resolve() {
            each(this, "verify");
          },
          restore: function restore() {
            each(this, "restore");
            compact(this);
          },
          verifyAndRestore: function verifyAndRestore() {
            var exception;

            try {
              this.verify();
            } catch (e) {
              exception = e;
            }

            this.restore();

            if (exception) {
              throw exception;
            }
          },
          add: function add(fake) {
            push.call(getFakes(this), fake);
            return fake;
          },
          spy: function spy() {
            return this.add(sinon.spy.apply(sinon, arguments));
          },
          stub: function stub(object, property, value) {
            if (property) {
              var original = object[property];

              if (typeof original != "function") {
                if (!hasOwnProperty.call(object, property)) {
                  throw new TypeError("Cannot stub non-existent own property " + property);
                }

                object[property] = value;
                return this.add({
                  restore: function restore() {
                    object[property] = original;
                  }
                });
              }
            }

            if (!property && !!object && _typeof(object) == "object") {
              var stubbedObj = sinon.stub.apply(sinon, arguments);

              for (var prop in stubbedObj) {
                if (typeof stubbedObj[prop] === "function") {
                  this.add(stubbedObj[prop]);
                }
              }

              return stubbedObj;
            }

            return this.add(sinon.stub.apply(sinon, arguments));
          },
          mock: function mock() {
            return this.add(sinon.mock.apply(sinon, arguments));
          },
          inject: function inject(obj) {
            var col = this;

            obj.spy = function () {
              return col.spy.apply(col, arguments);
            };

            obj.stub = function () {
              return col.stub.apply(col, arguments);
            };

            obj.mock = function () {
              return col.mock.apply(col, arguments);
            };

            return obj;
          }
        };

        if (commonJSModule) {
          module.exports = collection;
        } else {
          sinon.collection = collection;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /*jslint eqeqeq: false, plusplus: false, evil: true, onevar: false, browser: true, forin: false*/

      /*global module, require, window*/

      /**
       * Fake timer API
       * setTimeout
       * setInterval
       * clearTimeout
       * clearInterval
       * tick
       * reset
       * Date
       *
       * Inspired by jsUnitMockTimeOut from JsUnit
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      if (typeof sinon == "undefined") {
        var sinon = {};
      }

      (function (global) {
        // node expects setTimeout/setInterval to return a fn object w/ .ref()/.unref()
        // browsers, a number.
        // see https://github.com/cjohansen/Sinon.JS/pull/436
        var timeoutResult = setTimeout(function () {}, 0);
        var addTimerReturnsObject = _typeof(timeoutResult) === 'object';
        clearTimeout(timeoutResult);
        var id = 1;

        function addTimer(args, recurring) {
          if (args.length === 0) {
            throw new Error("Function requires at least 1 parameter");
          }

          if (typeof args[0] === "undefined") {
            throw new Error("Callback must be provided to timer calls");
          }

          var toId = id++;
          var delay = args[1] || 0;

          if (!this.timeouts) {
            this.timeouts = {};
          }

          this.timeouts[toId] = {
            id: toId,
            func: args[0],
            callAt: this.now + delay,
            invokeArgs: Array.prototype.slice.call(args, 2)
          };

          if (recurring === true) {
            this.timeouts[toId].interval = delay;
          }

          if (addTimerReturnsObject) {
            return {
              id: toId,
              ref: function ref() {},
              unref: function unref() {}
            };
          } else {
            return toId;
          }
        }

        function parseTime(str) {
          if (!str) {
            return 0;
          }

          var strings = str.split(":");
          var l = strings.length,
              i = l;
          var ms = 0,
              parsed;

          if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
            throw new Error("tick only understands numbers and 'h:m:s'");
          }

          while (i--) {
            parsed = parseInt(strings[i], 10);

            if (parsed >= 60) {
              throw new Error("Invalid time " + str);
            }

            ms += parsed * Math.pow(60, l - i - 1);
          }

          return ms * 1000;
        }

        function createObject(object) {
          var newObject;

          if (Object.create) {
            newObject = Object.create(object);
          } else {
            var F = function F() {};

            F.prototype = object;
            newObject = new F();
          }

          newObject.Date.clock = newObject;
          return newObject;
        }

        sinon.clock = {
          now: 0,
          create: function create(now) {
            var clock = createObject(this);

            if (typeof now == "number") {
              clock.now = now;
            }

            if (!!now && _typeof(now) == "object") {
              throw new TypeError("now should be milliseconds since UNIX epoch");
            }

            return clock;
          },
          setTimeout: function setTimeout(callback, timeout) {
            return addTimer.call(this, arguments, false);
          },
          clearTimeout: function clearTimeout(timerId) {
            if (!this.timeouts) {
              this.timeouts = [];
            }

            if (timerId in this.timeouts) {
              delete this.timeouts[timerId];
            }
          },
          setInterval: function setInterval(callback, timeout) {
            return addTimer.call(this, arguments, true);
          },
          clearInterval: function clearInterval(timerId) {
            this.clearTimeout(timerId);
          },
          setImmediate: function setImmediate(callback) {
            var passThruArgs = Array.prototype.slice.call(arguments, 1);
            return addTimer.call(this, [callback, 0].concat(passThruArgs), false);
          },
          clearImmediate: function clearImmediate(timerId) {
            this.clearTimeout(timerId);
          },
          tick: function tick(ms) {
            ms = typeof ms == "number" ? ms : parseTime(ms);
            var tickFrom = this.now,
                tickTo = this.now + ms,
                previous = this.now;
            var timer = this.firstTimerInRange(tickFrom, tickTo);
            var firstException;

            while (timer && tickFrom <= tickTo) {
              if (this.timeouts[timer.id]) {
                tickFrom = this.now = timer.callAt;

                try {
                  this.callTimer(timer);
                } catch (e) {
                  firstException = firstException || e;
                }
              }

              timer = this.firstTimerInRange(previous, tickTo);
              previous = tickFrom;
            }

            this.now = tickTo;

            if (firstException) {
              throw firstException;
            }

            return this.now;
          },
          firstTimerInRange: function firstTimerInRange(from, to) {
            var timer,
                smallest = null,
                originalTimer;

            for (var id in this.timeouts) {
              if (this.timeouts.hasOwnProperty(id)) {
                if (this.timeouts[id].callAt < from || this.timeouts[id].callAt > to) {
                  continue;
                }

                if (smallest === null || this.timeouts[id].callAt < smallest) {
                  originalTimer = this.timeouts[id];
                  smallest = this.timeouts[id].callAt;
                  timer = {
                    func: this.timeouts[id].func,
                    callAt: this.timeouts[id].callAt,
                    interval: this.timeouts[id].interval,
                    id: this.timeouts[id].id,
                    invokeArgs: this.timeouts[id].invokeArgs
                  };
                }
              }
            }

            return timer || null;
          },
          callTimer: function callTimer(timer) {
            var exception;

            if (typeof timer.interval == "number") {
              this.timeouts[timer.id].callAt += timer.interval;
            } else {
              delete this.timeouts[timer.id];
            }

            try {
              if (typeof timer.func == "function") {
                timer.func.apply(null, timer.invokeArgs);
              } else {
                eval(timer.func);
              }
            } catch (e) {
              exception = e;
            }

            if (!this.timeouts[timer.id]) {
              if (exception) {
                throw exception;
              }

              return;
            }

            if (exception) {
              throw exception;
            }
          },
          reset: function reset() {
            this.timeouts = {};
          },
          Date: function () {
            var NativeDate = Date;

            function ClockDate(year, month, date, hour, minute, second, ms) {
              // Defensive and verbose to avoid potential harm in passing
              // explicit undefined when user does not pass argument
              switch (arguments.length) {
                case 0:
                  return new NativeDate(ClockDate.clock.now);

                case 1:
                  return new NativeDate(year);

                case 2:
                  return new NativeDate(year, month);

                case 3:
                  return new NativeDate(year, month, date);

                case 4:
                  return new NativeDate(year, month, date, hour);

                case 5:
                  return new NativeDate(year, month, date, hour, minute);

                case 6:
                  return new NativeDate(year, month, date, hour, minute, second);

                default:
                  return new NativeDate(year, month, date, hour, minute, second, ms);
              }
            }

            return mirrorDateProperties(ClockDate, NativeDate);
          }()
        };

        function mirrorDateProperties(target, source) {
          if (source.now) {
            target.now = function now() {
              return target.clock.now;
            };
          } else {
            delete target.now;
          }

          if (source.toSource) {
            target.toSource = function toSource() {
              return source.toSource();
            };
          } else {
            delete target.toSource;
          }

          target.toString = function toString() {
            return source.toString();
          };

          target.prototype = source.prototype;
          target.parse = source.parse;
          target.UTC = source.UTC;
          target.prototype.toUTCString = source.prototype.toUTCString;

          for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
              target[prop] = source[prop];
            }
          }

          return target;
        }

        var methods = ["Date", "setTimeout", "setInterval", "clearTimeout", "clearInterval"];

        if (typeof global.setImmediate !== "undefined") {
          methods.push("setImmediate");
        }

        if (typeof global.clearImmediate !== "undefined") {
          methods.push("clearImmediate");
        }

        function restore() {
          var method;

          for (var i = 0, l = this.methods.length; i < l; i++) {
            method = this.methods[i];

            if (global[method].hadOwnProperty) {
              global[method] = this["_" + method];
            } else {
              try {
                delete global[method];
              } catch (e) {}
            }
          } // Prevent multiple executions which will completely remove these props


          this.methods = [];
          qx.util.DeferredCallManager.getInstance().refreshTimeout();
        }

        function stubGlobal(method, clock) {
          clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(global, method);
          clock["_" + method] = global[method];

          if (method == "Date") {
            var date = mirrorDateProperties(clock[method], global[method]);
            global[method] = date;
          } else {
            global[method] = function () {
              return clock[method].apply(clock, arguments);
            };

            for (var prop in clock[method]) {
              if (clock[method].hasOwnProperty(prop)) {
                global[method][prop] = clock[method][prop];
              }
            }
          }

          global[method].clock = clock;
        }

        sinon.useFakeTimers = function useFakeTimers(now) {
          var clock = sinon.clock.create(now);
          clock.restore = restore;
          clock.methods = Array.prototype.slice.call(arguments, typeof now == "number" ? 1 : 0);

          if (clock.methods.length === 0) {
            clock.methods = methods;
          }

          for (var i = 0, l = clock.methods.length; i < l; i++) {
            stubGlobal(clock.methods[i], clock);
          }

          return clock;
        };
      })(typeof global != "undefined" && typeof global !== "function" ? global : this);

      sinon.timers = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setImmediate: typeof setImmediate !== "undefined" ? setImmediate : undefined,
        clearImmediate: typeof clearImmediate !== "undefined" ? clearImmediate : undefined,
        setInterval: setInterval,
        clearInterval: clearInterval,
        Date: Date
      };

      if (typeof module !== 'undefined' && module.exports) {
        module.exports = sinon;
      }
      /*jslint eqeqeq: false, onevar: false*/

      /*global sinon, module, require, ActiveXObject, XMLHttpRequest, DOMParser*/

      /**
       * Minimal Event interface implementation
       *
       * Original implementation by Sven Fuchs: https://gist.github.com/995028
       * Modifications and tests by Christian Johansen.
       *
       * @author Sven Fuchs (svenfuchs@artweb-design.de)
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2011 Sven Fuchs, Christian Johansen
       */


      if (typeof sinon == "undefined") {
        this.sinon = {};
      }

      (function () {
        var push = [].push;

        sinon.Event = function Event(type, bubbles, cancelable, target) {
          this.initEvent(type, bubbles, cancelable, target);
        };

        sinon.Event.prototype = {
          initEvent: function initEvent(type, bubbles, cancelable, target) {
            this.type = type;
            this.bubbles = bubbles;
            this.cancelable = cancelable;
            this.target = target;
          },
          stopPropagation: function stopPropagation() {},
          preventDefault: function preventDefault() {
            this.defaultPrevented = true;
          }
        };

        sinon.ProgressEvent = function ProgressEvent(type, progressEventRaw, target) {
          this.initEvent(type, false, false, target);
          this.loaded = progressEventRaw.loaded || null;
          this.total = progressEventRaw.total || null;
        };

        sinon.ProgressEvent.prototype = new sinon.Event();
        sinon.ProgressEvent.prototype.constructor = sinon.ProgressEvent;

        sinon.CustomEvent = function CustomEvent(type, customData, target) {
          this.initEvent(type, false, false, target);
          this.detail = customData.detail || null;
        };

        sinon.CustomEvent.prototype = new sinon.Event();
        sinon.CustomEvent.prototype.constructor = sinon.CustomEvent;
        sinon.EventTarget = {
          addEventListener: function addEventListener(event, listener) {
            this.eventListeners = this.eventListeners || {};
            this.eventListeners[event] = this.eventListeners[event] || [];
            push.call(this.eventListeners[event], listener);
          },
          removeEventListener: function removeEventListener(event, listener) {
            var listeners = this.eventListeners && this.eventListeners[event] || [];

            for (var i = 0, l = listeners.length; i < l; ++i) {
              if (listeners[i] == listener) {
                return listeners.splice(i, 1);
              }
            }
          },
          dispatchEvent: function dispatchEvent(event) {
            var type = event.type;
            var listeners = this.eventListeners && this.eventListeners[type] || [];

            for (var i = 0; i < listeners.length; i++) {
              if (typeof listeners[i] == "function") {
                listeners[i].call(this, event);
              } else {
                listeners[i].handleEvent(event);
              }
            }

            return !!event.defaultPrevented;
          }
        };
      })();
      /**
       * @depend ../../sinon.js
       * @depend event.js
       */

      /*jslint eqeqeq: false, onevar: false*/

      /*global sinon, module, require, ActiveXObject, XMLHttpRequest, DOMParser*/

      /**
       * Fake XMLHttpRequest object
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */
      // wrapper for global


      (function (global) {
        if (typeof sinon === "undefined") {
          global.sinon = {};
        }

        var supportsProgress = typeof ProgressEvent !== "undefined";
        var supportsCustomEvent = typeof CustomEvent !== "undefined";
        sinon.xhr = {
          XMLHttpRequest: global.XMLHttpRequest
        };
        var xhr = sinon.xhr;
        xhr.GlobalXMLHttpRequest = global.XMLHttpRequest;
        xhr.GlobalActiveXObject = global.ActiveXObject;
        xhr.supportsActiveX = typeof xhr.GlobalActiveXObject != "undefined";
        xhr.supportsXHR = typeof xhr.GlobalXMLHttpRequest != "undefined";
        xhr.workingXHR = xhr.supportsXHR ? xhr.GlobalXMLHttpRequest : xhr.supportsActiveX ? function () {
          return new xhr.GlobalActiveXObject("MSXML2.XMLHTTP.3.0");
        } : false;
        xhr.supportsCORS = 'withCredentials' in new sinon.xhr.GlobalXMLHttpRequest();
        /*jsl:ignore*/

        var unsafeHeaders = {
          "Accept-Charset": true,
          "Accept-Encoding": true,
          "Connection": true,
          "Content-Length": true,
          "Cookie": true,
          "Cookie2": true,
          "Content-Transfer-Encoding": true,
          "Date": true,
          "Expect": true,
          "Host": true,
          "Keep-Alive": true,
          "Referer": true,
          "TE": true,
          "Trailer": true,
          "Transfer-Encoding": true,
          "Upgrade": true,
          "User-Agent": true,
          "Via": true
        };
        /*jsl:end*/

        function FakeXMLHttpRequest() {
          this.readyState = FakeXMLHttpRequest.UNSENT;
          this.requestHeaders = {};
          this.requestBody = null;
          this.status = 0;
          this.statusText = "";
          this.upload = new UploadProgress();

          if (sinon.xhr.supportsCORS) {
            this.withCredentials = false;
          }

          var xhr = this;
          var events = ["loadstart", "load", "abort", "loadend"];

          function addEventListener(eventName) {
            xhr.addEventListener(eventName, function (event) {
              var listener = xhr["on" + eventName];

              if (listener && typeof listener == "function") {
                listener.call(this, event);
              }
            });
          }

          for (var i = events.length - 1; i >= 0; i--) {
            addEventListener(events[i]);
          }

          if (typeof FakeXMLHttpRequest.onCreate == "function") {
            FakeXMLHttpRequest.onCreate(this);
          }
        } // An upload object is created for each
        // FakeXMLHttpRequest and allows upload
        // events to be simulated using uploadProgress
        // and uploadError.


        function UploadProgress() {
          this.eventListeners = {
            "progress": [],
            "load": [],
            "abort": [],
            "error": []
          };
        }

        UploadProgress.prototype.addEventListener = function (event, listener) {
          this.eventListeners[event].push(listener);
        };

        UploadProgress.prototype.removeEventListener = function (event, listener) {
          var listeners = this.eventListeners[event] || [];

          for (var i = 0, l = listeners.length; i < l; ++i) {
            if (listeners[i] == listener) {
              return listeners.splice(i, 1);
            }
          }
        };

        UploadProgress.prototype.dispatchEvent = function (event) {
          var listeners = this.eventListeners[event.type] || [];

          for (var i = 0, listener; (listener = listeners[i]) != null; i++) {
            listener(event);
          }
        };

        function verifyState(xhr) {
          if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR");
          }

          if (xhr.sendFlag) {
            throw new Error("INVALID_STATE_ERR");
          }
        } // filtering to enable a white-list version of Sinon FakeXhr,
        // where whitelisted requests are passed through to real XHR


        function each(collection, callback) {
          if (!collection) return;

          for (var i = 0, l = collection.length; i < l; i += 1) {
            callback(collection[i]);
          }
        }

        function some(collection, callback) {
          for (var index = 0; index < collection.length; index++) {
            if (callback(collection[index]) === true) return true;
          }

          return false;
        } // largest arity in XHR is 5 - XHR#open


        var apply = function apply(obj, method, args) {
          switch (args.length) {
            case 0:
              return obj[method]();

            case 1:
              return obj[method](args[0]);

            case 2:
              return obj[method](args[0], args[1]);

            case 3:
              return obj[method](args[0], args[1], args[2]);

            case 4:
              return obj[method](args[0], args[1], args[2], args[3]);

            case 5:
              return obj[method](args[0], args[1], args[2], args[3], args[4]);
          }
        };

        FakeXMLHttpRequest.filters = [];

        FakeXMLHttpRequest.addFilter = function (fn) {
          this.filters.push(fn);
        };

        var IE6Re = /MSIE 6/;

        FakeXMLHttpRequest.defake = function (fakeXhr, xhrArgs) {
          var xhr = new sinon.xhr.workingXHR();
          each(["open", "setRequestHeader", "send", "abort", "getResponseHeader", "getAllResponseHeaders", "addEventListener", "overrideMimeType", "removeEventListener"], function (method) {
            fakeXhr[method] = function () {
              return apply(xhr, method, arguments);
            };
          });

          var copyAttrs = function copyAttrs(args) {
            each(args, function (attr) {
              try {
                fakeXhr[attr] = xhr[attr];
              } catch (e) {
                if (!IE6Re.test(navigator.userAgent)) throw e;
              }
            });
          };

          var stateChange = function stateChange() {
            fakeXhr.readyState = xhr.readyState;

            if (xhr.readyState >= FakeXMLHttpRequest.HEADERS_RECEIVED) {
              copyAttrs(["status", "statusText"]);
            }

            if (xhr.readyState >= FakeXMLHttpRequest.LOADING) {
              copyAttrs(["responseText"]);
            }

            if (xhr.readyState === FakeXMLHttpRequest.DONE) {
              copyAttrs(["responseXML"]);
            }

            if (fakeXhr.onreadystatechange) fakeXhr.onreadystatechange.call(fakeXhr, {
              target: fakeXhr
            });
          };

          if (xhr.addEventListener) {
            for (var event in fakeXhr.eventListeners) {
              if (fakeXhr.eventListeners.hasOwnProperty(event)) {
                each(fakeXhr.eventListeners[event], function (handler) {
                  xhr.addEventListener(event, handler);
                });
              }
            }

            xhr.addEventListener("readystatechange", stateChange);
          } else {
            xhr.onreadystatechange = stateChange;
          }

          apply(xhr, "open", xhrArgs);
        };

        FakeXMLHttpRequest.useFilters = false;

        function verifyRequestOpened(xhr) {
          if (xhr.readyState != FakeXMLHttpRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR - " + xhr.readyState);
          }
        }

        function verifyRequestSent(xhr) {
          if (xhr.readyState == FakeXMLHttpRequest.DONE) {
            throw new Error("Request done");
          }
        }

        function verifyHeadersReceived(xhr) {
          if (xhr.async && xhr.readyState != FakeXMLHttpRequest.HEADERS_RECEIVED) {
            throw new Error("No headers received");
          }
        }

        function verifyResponseBodyType(body) {
          if (typeof body != "string") {
            var error = new Error("Attempted to respond to fake XMLHttpRequest with " + body + ", which is not a string.");
            error.name = "InvalidBodyException";
            throw error;
          }
        }

        sinon.extend(FakeXMLHttpRequest.prototype, sinon.EventTarget, {
          async: true,
          open: function open(method, url, async, username, password) {
            this.method = method;
            this.url = url;
            this.async = typeof async == "boolean" ? async : true;
            this.username = username;
            this.password = password;
            this.responseText = null;
            this.responseXML = null;
            this.requestHeaders = {};
            this.sendFlag = false;

            if (sinon.FakeXMLHttpRequest.useFilters === true) {
              var xhrArgs = arguments;
              var defake = some(FakeXMLHttpRequest.filters, function (filter) {
                return filter.apply(this, xhrArgs);
              });

              if (defake) {
                return sinon.FakeXMLHttpRequest.defake(this, arguments);
              }
            }

            this.readyStateChange(FakeXMLHttpRequest.OPENED);
          },
          readyStateChange: function readyStateChange(state) {
            this.readyState = state;

            if (typeof this.onreadystatechange == "function") {
              try {
                this.onreadystatechange();
              } catch (e) {
                sinon.logError("Fake XHR onreadystatechange handler", e);
              }
            }

            this.dispatchEvent(new sinon.Event("readystatechange"));

            switch (this.readyState) {
              case FakeXMLHttpRequest.DONE:
                this.dispatchEvent(new sinon.Event("load", false, false, this));
                this.dispatchEvent(new sinon.Event("loadend", false, false, this));
                this.upload.dispatchEvent(new sinon.Event("load", false, false, this));

                if (supportsProgress) {
                  this.upload.dispatchEvent(new sinon.ProgressEvent('progress', {
                    loaded: 100,
                    total: 100
                  }));
                }

                break;
            }
          },
          setRequestHeader: function setRequestHeader(header, value) {
            verifyState(this);

            if (unsafeHeaders[header] || /^(Sec-|Proxy-)/.test(header)) {
              throw new Error("Refused to set unsafe header \"" + header + "\"");
            }

            if (this.requestHeaders[header]) {
              this.requestHeaders[header] += "," + value;
            } else {
              this.requestHeaders[header] = value;
            }
          },
          // Helps testing
          setResponseHeaders: function setResponseHeaders(headers) {
            verifyRequestOpened(this);
            this.responseHeaders = {};

            for (var header in headers) {
              if (headers.hasOwnProperty(header)) {
                this.responseHeaders[header] = headers[header];
              }
            }

            if (this.async) {
              this.readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);
            } else {
              this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
            }
          },
          // Currently treats ALL data as a DOMString (i.e. no Document)
          send: function send(data) {
            verifyState(this);

            if (!/^(get|head)$/i.test(this.method)) {
              if (this.requestHeaders["Content-Type"]) {
                var value = this.requestHeaders["Content-Type"].split(";");
                this.requestHeaders["Content-Type"] = value[0] + ";charset=utf-8";
              } else {
                this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";
              }

              this.requestBody = data;
            }

            this.errorFlag = false;
            this.sendFlag = this.async;
            this.readyStateChange(FakeXMLHttpRequest.OPENED);

            if (typeof this.onSend == "function") {
              this.onSend(this);
            }

            this.dispatchEvent(new sinon.Event("loadstart", false, false, this));
          },
          abort: function abort() {
            this.aborted = true;
            this.responseText = null;
            this.errorFlag = true;
            this.requestHeaders = {};

            if (this.readyState > sinon.FakeXMLHttpRequest.UNSENT && this.sendFlag) {
              this.readyStateChange(sinon.FakeXMLHttpRequest.DONE);
              this.sendFlag = false;
            }

            this.readyState = sinon.FakeXMLHttpRequest.UNSENT;
            this.dispatchEvent(new sinon.Event("abort", false, false, this));
            this.upload.dispatchEvent(new sinon.Event("abort", false, false, this));

            if (typeof this.onerror === "function") {
              this.onerror();
            }
          },
          getResponseHeader: function getResponseHeader(header) {
            if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
              return null;
            }

            if (/^Set-Cookie2?$/i.test(header)) {
              return null;
            }

            header = header.toLowerCase();

            for (var h in this.responseHeaders) {
              if (h.toLowerCase() == header) {
                return this.responseHeaders[h];
              }
            }

            return null;
          },
          getAllResponseHeaders: function getAllResponseHeaders() {
            if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
              return "";
            }

            var headers = "";

            for (var header in this.responseHeaders) {
              if (this.responseHeaders.hasOwnProperty(header) && !/^Set-Cookie2?$/i.test(header)) {
                headers += header + ": " + this.responseHeaders[header] + "\r\n";
              }
            }

            return headers;
          },
          setResponseBody: function setResponseBody(body) {
            verifyRequestSent(this);
            verifyHeadersReceived(this);
            verifyResponseBodyType(body);
            var chunkSize = this.chunkSize || 10;
            var index = 0;
            this.responseText = "";

            do {
              if (this.async) {
                this.readyStateChange(FakeXMLHttpRequest.LOADING);
              }

              this.responseText += body.substring(index, index + chunkSize);
              index += chunkSize;
            } while (index < body.length);

            var type = this.getResponseHeader("Content-Type");

            if (this.responseText && (!type || /(text\/xml)|(application\/xml)|(\+xml)/.test(type))) {
              try {
                this.responseXML = FakeXMLHttpRequest.parseXML(this.responseText);
              } catch (e) {// Unable to parse XML - no biggie
              }
            }

            if (this.async) {
              this.readyStateChange(FakeXMLHttpRequest.DONE);
            } else {
              this.readyState = FakeXMLHttpRequest.DONE;
            }
          },
          respond: function respond(status, headers, body) {
            this.status = typeof status == "number" ? status : 200;
            this.statusText = FakeXMLHttpRequest.statusCodes[this.status];
            this.setResponseHeaders(headers || {});
            this.setResponseBody(body || "");
          },
          uploadProgress: function uploadProgress(progressEventRaw) {
            if (supportsProgress) {
              this.upload.dispatchEvent(new sinon.ProgressEvent("progress", progressEventRaw));
            }
          },
          uploadError: function uploadError(error) {
            if (supportsCustomEvent) {
              this.upload.dispatchEvent(new sinon.CustomEvent("error", {
                "detail": error
              }));
            }
          }
        });
        sinon.extend(FakeXMLHttpRequest, {
          UNSENT: 0,
          OPENED: 1,
          HEADERS_RECEIVED: 2,
          LOADING: 3,
          DONE: 4
        }); // Borrowed from JSpec

        FakeXMLHttpRequest.parseXML = function parseXML(text) {
          var xmlDoc;

          if (typeof DOMParser != "undefined") {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(text, "text/xml");
          } else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(text);
          }

          return xmlDoc;
        };

        FakeXMLHttpRequest.statusCodes = {
          100: "Continue",
          101: "Switching Protocols",
          200: "OK",
          201: "Created",
          202: "Accepted",
          203: "Non-Authoritative Information",
          204: "No Content",
          205: "Reset Content",
          206: "Partial Content",
          300: "Multiple Choice",
          301: "Moved Permanently",
          302: "Found",
          303: "See Other",
          304: "Not Modified",
          305: "Use Proxy",
          307: "Temporary Redirect",
          400: "Bad Request",
          401: "Unauthorized",
          402: "Payment Required",
          403: "Forbidden",
          404: "Not Found",
          405: "Method Not Allowed",
          406: "Not Acceptable",
          407: "Proxy Authentication Required",
          408: "Request Timeout",
          409: "Conflict",
          410: "Gone",
          411: "Length Required",
          412: "Precondition Failed",
          413: "Request Entity Too Large",
          414: "Request-URI Too Long",
          415: "Unsupported Media Type",
          416: "Requested Range Not Satisfiable",
          417: "Expectation Failed",
          422: "Unprocessable Entity",
          500: "Internal Server Error",
          501: "Not Implemented",
          502: "Bad Gateway",
          503: "Service Unavailable",
          504: "Gateway Timeout",
          505: "HTTP Version Not Supported"
        };

        sinon.useFakeXMLHttpRequest = function () {
          sinon.FakeXMLHttpRequest.restore = function restore(keepOnCreate) {
            if (xhr.supportsXHR) {
              global.XMLHttpRequest = xhr.GlobalXMLHttpRequest;
            }

            if (xhr.supportsActiveX) {
              global.ActiveXObject = xhr.GlobalActiveXObject;
            }

            delete sinon.FakeXMLHttpRequest.restore;

            if (keepOnCreate !== true) {
              delete sinon.FakeXMLHttpRequest.onCreate;
            }
          };

          if (xhr.supportsXHR) {
            global.XMLHttpRequest = sinon.FakeXMLHttpRequest;
          }

          if (xhr.supportsActiveX) {
            global.ActiveXObject = function ActiveXObject(objId) {
              if (objId == "Microsoft.XMLHTTP" || /^Msxml2\.XMLHTTP/i.test(objId)) {
                return new sinon.FakeXMLHttpRequest();
              }

              return new xhr.GlobalActiveXObject(objId);
            };
          }

          return sinon.FakeXMLHttpRequest;
        };

        sinon.FakeXMLHttpRequest = FakeXMLHttpRequest;
      })((typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" ? global : this);

      if (typeof module !== 'undefined' && module.exports) {
        module.exports = sinon;
      }
      /**
       * @depend fake_xml_http_request.js
       */

      /*jslint eqeqeq: false, onevar: false, regexp: false, plusplus: false*/

      /*global module, require, window*/

      /**
       * The Sinon "server" mimics a web server that receives requests from
       * sinon.FakeXMLHttpRequest and provides an API to respond to those requests,
       * both synchronously and asynchronously. To respond synchronously, canned
       * answers have to be provided upfront.
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      if (typeof sinon == "undefined") {
        var sinon = {};
      }

      sinon.fakeServer = function () {
        var push = [].push;

        function F() {}

        function _create(proto) {
          F.prototype = proto;
          return new F();
        }

        function responseArray(handler) {
          var response = handler;

          if (Object.prototype.toString.call(handler) != "[object Array]") {
            response = [200, {}, handler];
          }

          if (typeof response[2] != "string") {
            throw new TypeError("Fake server response body should be string, but was " + _typeof(response[2]));
          }

          return response;
        }

        var wloc = typeof window !== "undefined" ? window.location : {};
        var rCurrLoc = new RegExp("^" + wloc.protocol + "//" + wloc.host);

        function matchOne(response, reqMethod, reqUrl) {
          var rmeth = response.method;
          var matchMethod = !rmeth || rmeth.toLowerCase() == reqMethod.toLowerCase();
          var url = response.url;
          var matchUrl = !url || url == reqUrl || typeof url.test == "function" && url.test(reqUrl);
          return matchMethod && matchUrl;
        }

        function match(response, request) {
          var requestUrl = request.url;

          if (!/^https?:\/\//.test(requestUrl) || rCurrLoc.test(requestUrl)) {
            requestUrl = requestUrl.replace(rCurrLoc, "");
          }

          if (matchOne(response, this.getHTTPMethod(request), requestUrl)) {
            if (typeof response.response == "function") {
              var ru = response.url;
              var args = [request].concat(ru && typeof ru.exec == "function" ? ru.exec(requestUrl).slice(1) : []);
              return response.response.apply(response, args);
            }

            return true;
          }

          return false;
        }

        function log(response, request) {
          var str;
          str = "Request:\n" + sinon.format(request) + "\n\n";
          str += "Response:\n" + sinon.format(response) + "\n\n";
          sinon.log(str);
        }

        return {
          create: function create() {
            var server = _create(this);

            this.xhr = sinon.useFakeXMLHttpRequest();
            server.requests = [];

            this.xhr.onCreate = function (xhrObj) {
              server.addRequest(xhrObj);
            };

            return server;
          },
          addRequest: function addRequest(xhrObj) {
            var server = this;
            push.call(this.requests, xhrObj);

            xhrObj.onSend = function () {
              server.handleRequest(this);

              if (server.autoRespond && !server.responding) {
                setTimeout(function () {
                  server.responding = false;
                  server.respond();
                }, server.autoRespondAfter || 10);
                server.responding = true;
              }
            };
          },
          getHTTPMethod: function getHTTPMethod(request) {
            if (this.fakeHTTPMethods && /post/i.test(request.method)) {
              var matches = (request.requestBody || "").match(/_method=([^\b;]+)/);
              return !!matches ? matches[1] : request.method;
            }

            return request.method;
          },
          handleRequest: function handleRequest(xhr) {
            if (xhr.async) {
              if (!this.queue) {
                this.queue = [];
              }

              push.call(this.queue, xhr);
            } else {
              this.processRequest(xhr);
            }
          },
          respondWith: function respondWith(method, url, body) {
            if (arguments.length == 1 && typeof method != "function") {
              this.response = responseArray(method);
              return;
            }

            if (!this.responses) {
              this.responses = [];
            }

            if (arguments.length == 1) {
              body = method;
              url = method = null;
            }

            if (arguments.length == 2) {
              body = url;
              url = method;
              method = null;
            }

            push.call(this.responses, {
              method: method,
              url: url,
              response: typeof body == "function" ? body : responseArray(body)
            });
          },
          respond: function respond() {
            if (arguments.length > 0) this.respondWith.apply(this, arguments);
            var queue = this.queue || [];
            var requests = queue.splice(0, queue.length);
            var request;

            while (request = requests.shift()) {
              this.processRequest(request);
            }
          },
          processRequest: function processRequest(request) {
            try {
              if (request.aborted) {
                return;
              }

              var response = this.response || [404, {}, ""];

              if (this.responses) {
                for (var l = this.responses.length, i = l - 1; i >= 0; i--) {
                  if (match.call(this, this.responses[i], request)) {
                    response = this.responses[i].response;
                    break;
                  }
                }
              }

              if (request.readyState != 4) {
                log(response, request);
                request.respond(response[0], response[1], response[2]);
              }
            } catch (e) {
              sinon.logError("Fake server request processing", e);
            }
          },
          restore: function restore() {
            return this.xhr.restore && this.xhr.restore.apply(this.xhr, arguments);
          }
        };
      }();

      if (typeof module !== 'undefined' && module.exports) {
        module.exports = sinon;
      }
      /**
       * @depend fake_server.js
       * @depend fake_timers.js
       */

      /*jslint browser: true, eqeqeq: false, onevar: false*/

      /*global sinon*/

      /**
       * Add-on for sinon.fakeServer that automatically handles a fake timer along with
       * the FakeXMLHttpRequest. The direct inspiration for this add-on is jQuery
       * 1.3.x, which does not use xhr object's onreadystatehandler at all - instead,
       * it polls the object for completion with setInterval. Despite the direct
       * motivation, there is nothing jQuery-specific in this file, so it can be used
       * in any environment where the ajax implementation depends on setInterval or
       * setTimeout.
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      (function () {
        function Server() {}

        Server.prototype = sinon.fakeServer;
        sinon.fakeServerWithClock = new Server();

        sinon.fakeServerWithClock.addRequest = function addRequest(xhr) {
          if (xhr.async) {
            if (_typeof(setTimeout.clock) == "object") {
              this.clock = setTimeout.clock;
            } else {
              this.clock = sinon.useFakeTimers();
              this.resetClock = true;
            }

            if (!this.longestTimeout) {
              var clockSetTimeout = this.clock.setTimeout;
              var clockSetInterval = this.clock.setInterval;
              var server = this;

              this.clock.setTimeout = function (fn, timeout) {
                server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);
                return clockSetTimeout.apply(this, arguments);
              };

              this.clock.setInterval = function (fn, timeout) {
                server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);
                return clockSetInterval.apply(this, arguments);
              };
            }
          }

          return sinon.fakeServer.addRequest.call(this, xhr);
        };

        sinon.fakeServerWithClock.respond = function respond() {
          var returnVal = sinon.fakeServer.respond.apply(this, arguments);

          if (this.clock) {
            this.clock.tick(this.longestTimeout || 0);
            this.longestTimeout = 0;

            if (this.resetClock) {
              this.clock.restore();
              this.resetClock = false;
            }
          }

          return returnVal;
        };

        sinon.fakeServerWithClock.restore = function restore() {
          if (this.clock) {
            this.clock.restore();
          }

          return sinon.fakeServer.restore.apply(this, arguments);
        };
      })();
      /**
       * @depend ../sinon.js
       * @depend collection.js
       * @depend util/fake_timers.js
       * @depend util/fake_server_with_clock.js
       */

      /*jslint eqeqeq: false, onevar: false, plusplus: false*/

      /*global require, module*/

      /**
       * Manages fake collections as well as fake utilities such as Sinon's
       * timers and fake XHR implementation in one convenient object.
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      if (typeof module !== 'undefined' && module.exports) {
        var sinon = require("../sinon");

        sinon.extend(sinon, require("./util/fake_timers"));
      }

      (function () {
        var push = [].push;

        function exposeValue(sandbox, config, key, value) {
          if (!value) {
            return;
          }

          if (config.injectInto && !(key in config.injectInto)) {
            config.injectInto[key] = value;
            sandbox.injectedKeys.push(key);
          } else {
            push.call(sandbox.args, value);
          }
        }

        function prepareSandboxFromConfig(config) {
          var sandbox = sinon.create(sinon.sandbox);

          if (config.useFakeServer) {
            if (_typeof(config.useFakeServer) == "object") {
              sandbox.serverPrototype = config.useFakeServer;
            }

            sandbox.useFakeServer();
          }

          if (config.useFakeTimers) {
            if (_typeof(config.useFakeTimers) == "object") {
              sandbox.useFakeTimers.apply(sandbox, config.useFakeTimers);
            } else {
              sandbox.useFakeTimers();
            }
          }

          return sandbox;
        }

        sinon.sandbox = sinon.extend(sinon.create(sinon.collection), {
          useFakeTimers: function useFakeTimers() {
            this.clock = sinon.useFakeTimers.apply(sinon, arguments);
            return this.add(this.clock);
          },
          serverPrototype: sinon.fakeServer,
          useFakeServer: function useFakeServer() {
            var proto = this.serverPrototype || sinon.fakeServer;

            if (!proto || !proto.create) {
              return null;
            }

            this.server = proto.create();
            return this.add(this.server);
          },
          inject: function inject(obj) {
            sinon.collection.inject.call(this, obj);

            if (this.clock) {
              obj.clock = this.clock;
            }

            if (this.server) {
              obj.server = this.server;
              obj.requests = this.server.requests;
            }

            return obj;
          },
          restore: function restore() {
            sinon.collection.restore.apply(this, arguments);
            this.restoreContext();
          },
          restoreContext: function restoreContext() {
            if (this.injectedKeys) {
              for (var i = 0, j = this.injectedKeys.length; i < j; i++) {
                delete this.injectInto[this.injectedKeys[i]];
              }

              this.injectedKeys = [];
            }
          },
          create: function create(config) {
            if (!config) {
              return sinon.create(sinon.sandbox);
            }

            var sandbox = prepareSandboxFromConfig(config);
            sandbox.args = sandbox.args || [];
            sandbox.injectedKeys = [];
            sandbox.injectInto = config.injectInto;
            var prop,
                value,
                exposed = sandbox.inject({});

            if (config.properties) {
              for (var i = 0, l = config.properties.length; i < l; i++) {
                prop = config.properties[i];
                value = exposed[prop] || prop == "sandbox" && sandbox;
                exposeValue(sandbox, config, prop, value);
              }
            } else {
              exposeValue(sandbox, config, "sandbox", value);
            }

            return sandbox;
          }
        });
        sinon.sandbox.useFakeXMLHttpRequest = sinon.sandbox.useFakeServer;

        if (typeof module !== 'undefined' && module.exports) {
          module.exports = sinon.sandbox;
        }
      })();
      /**
       * @depend ../sinon.js
       * @depend stub.js
       * @depend mock.js
       * @depend sandbox.js
       */

      /*jslint eqeqeq: false, onevar: false, forin: true, plusplus: false*/

      /*global module, require, sinon*/

      /**
       * Test function, sandboxes fakes
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        function test(callback) {
          var type = _typeof(callback);

          if (type != "function") {
            throw new TypeError("sinon.test needs to wrap a test function, got " + type);
          }

          return function () {
            var config = sinon.getConfig(sinon.config);
            config.injectInto = config.injectIntoThis && this || config.injectInto;
            var sandbox = sinon.sandbox.create(config);
            var exception, result;
            var args = Array.prototype.slice.call(arguments).concat(sandbox.args);

            try {
              result = callback.apply(this, args);
            } catch (e) {
              exception = e;
            }

            if (typeof exception !== "undefined") {
              sandbox.restore();
              throw exception;
            } else {
              sandbox.verifyAndRestore();
            }

            return result;
          };
        }

        test.config = {
          injectIntoThis: true,
          injectInto: null,
          properties: ["spy", "stub", "mock", "clock", "server", "requests"],
          useFakeTimers: true,
          useFakeServer: true
        };

        if (commonJSModule) {
          module.exports = test;
        } else {
          sinon.test = test;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /**
       * @depend ../sinon.js
       * @depend test.js
       */

      /*jslint eqeqeq: false, onevar: false, eqeqeq: false*/

      /*global module, require, sinon*/

      /**
       * Test case, sandboxes all test functions
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      (function (sinon) {
        var commonJSModule = typeof module !== 'undefined' && module.exports;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon || !Object.prototype.hasOwnProperty) {
          return;
        }

        function createTest(property, setUp, tearDown) {
          return function () {
            if (setUp) {
              setUp.apply(this, arguments);
            }

            var exception, result;

            try {
              result = property.apply(this, arguments);
            } catch (e) {
              exception = e;
            }

            if (tearDown) {
              tearDown.apply(this, arguments);
            }

            if (exception) {
              throw exception;
            }

            return result;
          };
        }

        function testCase(tests, prefix) {
          /*jsl:ignore*/
          if (!tests || _typeof(tests) != "object") {
            throw new TypeError("sinon.testCase needs an object with test functions");
          }
          /*jsl:end*/


          prefix = prefix || "test";
          var rPrefix = new RegExp("^" + prefix);
          var methods = {},
              testName,
              property,
              method;
          var setUp = tests.setUp;
          var tearDown = tests.tearDown;

          for (testName in tests) {
            if (tests.hasOwnProperty(testName)) {
              property = tests[testName];

              if (/^(setUp|tearDown)$/.test(testName)) {
                continue;
              }

              if (typeof property == "function" && rPrefix.test(testName)) {
                method = property;

                if (setUp || tearDown) {
                  method = createTest(property, setUp, tearDown);
                }

                methods[testName] = sinon.test(method);
              } else {
                methods[testName] = tests[testName];
              }
            }
          }

          return methods;
        }

        if (commonJSModule) {
          module.exports = testCase;
        } else {
          sinon.testCase = testCase;
        }
      })(_typeof(sinon) == "object" && sinon || null);
      /**
       * @depend ../sinon.js
       * @depend stub.js
       */

      /*jslint eqeqeq: false, onevar: false, nomen: false, plusplus: false*/

      /*global module, require, sinon*/

      /**
       * Assertions matching the test spy retrieval interface.
       *
       * @author Christian Johansen (christian@cjohansen.no)
       * @license BSD
       *
       * Copyright (c) 2010-2013 Christian Johansen
       */


      (function (sinon, global) {
        var commonJSModule = typeof module !== "undefined" && module.exports;
        var slice = Array.prototype.slice;
        var assert;

        if (!sinon && commonJSModule) {
          sinon = require("../sinon");
        }

        if (!sinon) {
          return;
        }

        function verifyIsStub() {
          var method;

          for (var i = 0, l = arguments.length; i < l; ++i) {
            method = arguments[i];

            if (!method) {
              assert.fail("fake is not a spy");
            }

            if (typeof method != "function") {
              assert.fail(method + " is not a function");
            }

            if (typeof method.getCall != "function") {
              assert.fail(method + " is not stubbed");
            }
          }
        }

        function failAssertion(object, msg) {
          object = object || global;
          var failMethod = object.fail || assert.fail;
          failMethod.call(object, msg);
        }

        function mirrorPropAsAssertion(name, method, message) {
          if (arguments.length == 2) {
            message = method;
            method = name;
          }

          assert[name] = function (fake) {
            verifyIsStub(fake);
            var args = slice.call(arguments, 1);
            var failed = false;

            if (typeof method == "function") {
              failed = !method(fake);
            } else {
              failed = typeof fake[method] == "function" ? !fake[method].apply(fake, args) : !fake[method];
            }

            if (failed) {
              failAssertion(this, fake.printf.apply(fake, [message].concat(args)));
            } else {
              assert.pass(name);
            }
          };
        }

        function exposedName(prefix, prop) {
          return !prefix || /^fail/.test(prop) ? prop : prefix + prop.slice(0, 1).toUpperCase() + prop.slice(1);
        }

        assert = {
          failException: "AssertError",
          fail: function fail(message) {
            var error = new Error(message);
            error.name = this.failException || assert.failException;
            throw error;
          },
          pass: function pass(assertion) {},
          callOrder: function assertCallOrder() {
            verifyIsStub.apply(null, arguments);
            var expected = "",
                actual = "";

            if (!sinon.calledInOrder(arguments)) {
              try {
                expected = [].join.call(arguments, ", ");
                var calls = slice.call(arguments);
                var i = calls.length;

                while (i) {
                  if (!calls[--i].called) {
                    calls.splice(i, 1);
                  }
                }

                actual = sinon.orderByFirstCall(calls).join(", ");
              } catch (e) {// If this fails, we'll just fall back to the blank string
              }

              failAssertion(this, "expected " + expected + " to be " + "called in order but were called as " + actual);
            } else {
              assert.pass("callOrder");
            }
          },
          callCount: function assertCallCount(method, count) {
            verifyIsStub(method);

            if (method.callCount != count) {
              var msg = "expected %n to be called " + sinon.timesInWords(count) + " but was called %c%C";
              failAssertion(this, method.printf(msg));
            } else {
              assert.pass("callCount");
            }
          },
          expose: function expose(target, options) {
            if (!target) {
              throw new TypeError("target is null or undefined");
            }

            var o = options || {};
            var prefix = typeof o.prefix == "undefined" && "assert" || o.prefix;
            var includeFail = typeof o.includeFail == "undefined" || !!o.includeFail;

            for (var method in this) {
              if (method != "export" && (includeFail || !/^(fail)/.test(method))) {
                target[exposedName(prefix, method)] = this[method];
              }
            }

            return target;
          },
          match: function match(actual, expectation) {
            var matcher = sinon.match(expectation);

            if (matcher.test(actual)) {
              assert.pass("match");
            } else {
              var formatted = ["expected value to match", "    expected = " + sinon.format(expectation), "    actual = " + sinon.format(actual)];
              failAssertion(this, formatted.join("\n"));
            }
          }
        };
        mirrorPropAsAssertion("called", "expected %n to have been called at least once but was never called");
        mirrorPropAsAssertion("notCalled", function (spy) {
          return !spy.called;
        }, "expected %n to not have been called but was called %c%C");
        mirrorPropAsAssertion("calledOnce", "expected %n to be called once but was called %c%C");
        mirrorPropAsAssertion("calledTwice", "expected %n to be called twice but was called %c%C");
        mirrorPropAsAssertion("calledThrice", "expected %n to be called thrice but was called %c%C");
        mirrorPropAsAssertion("calledOn", "expected %n to be called with %1 as this but was called with %t");
        mirrorPropAsAssertion("alwaysCalledOn", "expected %n to always be called with %1 as this but was called with %t");
        mirrorPropAsAssertion("calledWithNew", "expected %n to be called with new");
        mirrorPropAsAssertion("alwaysCalledWithNew", "expected %n to always be called with new");
        mirrorPropAsAssertion("calledWith", "expected %n to be called with arguments %*%C");
        mirrorPropAsAssertion("calledWithMatch", "expected %n to be called with match %*%C");
        mirrorPropAsAssertion("alwaysCalledWith", "expected %n to always be called with arguments %*%C");
        mirrorPropAsAssertion("alwaysCalledWithMatch", "expected %n to always be called with match %*%C");
        mirrorPropAsAssertion("calledWithExactly", "expected %n to be called with exact arguments %*%C");
        mirrorPropAsAssertion("alwaysCalledWithExactly", "expected %n to always be called with exact arguments %*%C");
        mirrorPropAsAssertion("neverCalledWith", "expected %n to never be called with arguments %*%C");
        mirrorPropAsAssertion("neverCalledWithMatch", "expected %n to never be called with match %*%C");
        mirrorPropAsAssertion("threw", "%n did not throw exception%C");
        mirrorPropAsAssertion("alwaysThrew", "%n did not always throw exception%C");

        if (commonJSModule) {
          module.exports = assert;
        } else {
          sinon.assert = assert;
        }
      })(_typeof(sinon) == "object" && sinon || null, typeof window != "undefined" ? window : global);

      return sinon;
    }.call(typeof window != 'undefined' && window || {});
    /**
     * End of original code.
     */
    // Every assertion in Sinon.JS fails by calling this method.
    //
    // (In fact, in vanilla Sinon.JS 1.0.0. this is not really the case,
    //  because the "fail" method of the TestCase takes precedence over
    // "fail" method of Sinon.JS)
    //
    // Instead of throwing an exception directly, delegate to the
    // "fail" method of the TestCase. In Testrunner2, this means
    // that the wrapped fail method is called and ensures that
    // the entire body of each test function is executed.
    //


    this.sinon.assert.fail = function (msg) {
      this.fail(msg, true);
    }; // HTTP Status 207 is missing in map to resolve code to status text


    this.sinon.FakeXMLHttpRequest.statusCodes[207] = "Multi-Status";
    var origSinon = this.sinon; // Expose to qooxdoo

    var Sinon = qx.dev.unit.Sinon;

    Sinon.getSinon = function () {
      return origSinon;
    };
  }).call(window);
  qx.dev.unit.Sinon.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.bom.Event": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["event.touch", "event.mouseevent", "event.mousecreateevent", "event.dispatchevent", "event.customevent", "event.mspointer", "event.help", "event.hashchange", "event.mousewheel", "event.auxclick", "event.passive"],
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
   * This class should contain all checks about events.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Event", {
    statics: {
      /**
       * Checks if touch events are supported.
       *
       * @internal
       * @return {Boolean} <code>true</code> if touch events are supported.
       */
      getTouch: function getTouch() {
        return "ontouchstart" in window;
      },

      /**
       * Checks if MSPointer events are available.
       *
       * @internal
       * @return {Boolean} <code>true</code> if pointer events are supported.
       */
      getMsPointer: function getMsPointer() {
        // Fixes issue #9182: new unified pointer input model since Chrome 55
        // see https://github.com/qooxdoo/qooxdoo/issues/9182
        if ("PointerEvent" in window) {
          return true;
        }

        if ("pointerEnabled" in window.navigator) {
          return window.navigator.pointerEnabled;
        } else if ("msPointerEnabled" in window.navigator) {
          return window.navigator.msPointerEnabled;
        }

        return false;
      },

      /**
       * Checks if the proprietary <code>help</code> event is available.
       *
       * @internal
       * @return {Boolean} <code>true</code> if the "help" event is supported.
       */
      getHelp: function getHelp() {
        return "onhelp" in document;
      },

      /**
       * Checks if the <code>hashchange</code> event is available
       *
       * @internal
       * @return {Boolean} <code>true</code> if the "hashchange" event is supported.
       */
      getHashChange: function getHashChange() {
        // avoid false positive in IE7
        var engine = qx.bom.client.Engine.getName();
        var hashchange = "onhashchange" in window;
        return engine !== "mshtml" && hashchange || engine === "mshtml" && "documentMode" in document && document.documentMode >= 8 && hashchange;
      },

      /**
       * Checks if the DOM2 dispatchEvent method is available
       * @return {Boolean} <code>true</code> if dispatchEvent is supported.
       */
      getDispatchEvent: function getDispatchEvent() {
        return typeof document.dispatchEvent == "function";
      },

      /**
       * Checks if the CustomEvent constructor is available and supports
       * custom event types.
       *
       * @return {Boolean} <code>true</code> if Custom Events are available
       */
      getCustomEvent: function getCustomEvent() {
        if (!window.CustomEvent) {
          return false;
        }

        try {
          new window.CustomEvent("foo");
          return true;
        } catch (ex) {
          return false;
        }
      },

      /**
       * Checks if the MouseEvent constructor is available and supports
       * custom event types.
       *
       * @return {Boolean} <code>true</code> if Mouse Events are available
       */
      getMouseEvent: function getMouseEvent() {
        if (!window.MouseEvent) {
          return false;
        }

        try {
          new window.MouseEvent("foo");
          return true;
        } catch (ex) {
          return false;
        }
      },

      /**
       * Returns the event type used in pointer layer to create mouse events.
       *
       * @return {String} Either <code>MouseEvents</code> or <code>UIEvents</code>
       */
      getMouseCreateEvent: function getMouseCreateEvent() {
        /* For instance, in IE9, the pageX property of synthetic MouseEvents is
        always 0 and cannot be overridden, so plain UIEvents have to be used with
        mouse event properties added accordingly. */
        try {
          var e = document.createEvent("MouseEvents");
          var orig = e.pageX;
          e.initMouseEvent("click", false, false, window, 0, 0, 0, orig + 1, 0, false, false, false, false, 0, null);

          if (e.pageX !== orig) {
            return "MouseEvents";
          }

          return "UIEvents";
        } catch (ex) {
          return "UIEvents";
        }
      },

      /**
       * Checks if the MouseWheel event is available and on which target.
       *
       * @param win {Window ? null} An optional window instance to check.
       * @return {Map} A map containing two values: type and target.
       */
      getMouseWheel: function getMouseWheel(win) {
        if (!win) {
          win = window;
        } // Fix for bug #3234


        var targets = [win, win.document, win.document.body];
        var target = win;
        var type = "DOMMouseScroll"; // for FF < 17

        for (var i = 0; i < targets.length; i++) {
          // check for the spec event (DOM-L3)
          if (qx.bom.Event.supportsEvent(targets[i], "wheel")) {
            type = "wheel";
            target = targets[i];
            break;
          } // check for the non spec event


          if (qx.bom.Event.supportsEvent(targets[i], "mousewheel")) {
            type = "mousewheel";
            target = targets[i];
            break;
          }
        }

        ;
        return {
          type: type,
          target: target
        };
      },

      /**
       * Detects if the engine/browser supports auxclick events
       * 
       * See https://github.com/qooxdoo/qooxdoo/issues/9268 
       *
       * @return {Boolean} <code>true</code> if auxclick events are supported.
       */
      getAuxclickEvent: function getAuxclickEvent() {
        var hasAuxclick = false;

        try {
          hasAuxclick = "onauxclick" in document.documentElement;
        } catch (ex) {}

        ;
        return hasAuxclick ? true : false;
      },

      /**
       * Checks whether the browser supports passive event handlers.
       */
      getPassive: function getPassive() {
        var passiveSupported = false;

        try {
          var options = Object.defineProperties({}, {
            passive: {
              get: function get() {
                // this function will be called when the browser
                // attempts to access the passive property.
                passiveSupported = true;
              }
            }
          });
          window.addEventListener("test", options, options);
          window.removeEventListener("test", options, options);
        } catch (err) {
          passiveSupported = false;
        }

        return passiveSupported;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("event.touch", statics.getTouch);
      qx.core.Environment.add("event.mouseevent", statics.getMouseEvent);
      qx.core.Environment.add("event.mousecreateevent", statics.getMouseCreateEvent);
      qx.core.Environment.add("event.dispatchevent", statics.getDispatchEvent);
      qx.core.Environment.add("event.customevent", statics.getCustomEvent);
      qx.core.Environment.add("event.mspointer", statics.getMsPointer);
      qx.core.Environment.add("event.help", statics.getHelp);
      qx.core.Environment.add("event.hashchange", statics.getHashChange);
      qx.core.Environment.add("event.mousewheel", statics.getMouseWheel);
      qx.core.Environment.add("event.auxclick", statics.getAuxclickEvent);
      qx.core.Environment.add("event.passive", statics.getPassive);
    }
  });
  qx.bom.client.Event.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "provided": ["device.name", "device.touch", "device.type", "device.pixelRatio"],
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
   * The class is responsible for device detection. This is specially useful
   * if you are on a mobile device.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Device", {
    statics: {
      /** Maps user agent names to device IDs */
      __ids: {
        "Windows Phone": "iemobile",
        "iPod": "ipod",
        "iPad": "ipad",
        "iPhone": "iphone",
        "PSP": "psp",
        "PLAYSTATION 3": "ps3",
        "Nintendo Wii": "wii",
        "Nintendo DS": "ds",
        "XBOX": "xbox",
        "Xbox": "xbox"
      },

      /**
       * Returns the name of the current device if detectable. It falls back to
       * <code>pc</code> if the detection for other devices fails.
       *
       * @internal
       * @return {String} The string of the device found.
       */
      getName: function getName() {
        var str = [];

        for (var key in qx.bom.client.Device.__ids) {
          str.push(key);
        }

        var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
        var match = reg.exec(navigator.userAgent);

        if (match && match[1]) {
          return qx.bom.client.Device.__ids[match[1]];
        }

        return "pc";
      },

      /**
       * Determines on what type of device the application is running.
       * Valid values are: "mobile", "tablet" or "desktop".
       * @return {String} The device type name of determined device.
       */
      getType: function getType() {
        return qx.bom.client.Device.detectDeviceType(navigator.userAgent);
      },

      /**
       * Detects the device type, based on given userAgentString.
       *
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {String} The device type name of determined device: "mobile","desktop","tablet"
       */
      detectDeviceType: function detectDeviceType(userAgentString) {
        if (qx.bom.client.Device.detectTabletDevice(userAgentString)) {
          return "tablet";
        } else if (qx.bom.client.Device.detectMobileDevice(userAgentString)) {
          return "mobile";
        }

        return "desktop";
      },

      /**
       * Detects if a device is a mobile phone. (Tablets excluded.)
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {Boolean} Flag which indicates whether it is a mobile device.
       */
      detectMobileDevice: function detectMobileDevice(userAgentString) {
        return /android.+mobile|ip(hone|od)|bada\/|blackberry|BB10|maemo|opera m(ob|in)i|fennec|NetFront|phone|psp|symbian|IEMobile|windows (ce|phone)|xda/i.test(userAgentString);
      },

      /**
       * Detects if a device is a tablet device.
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {Boolean} Flag which indicates whether it is a tablet device.
       */
      detectTabletDevice: function detectTabletDevice(userAgentString) {
        var isIE10Tablet = /MSIE 10/i.test(userAgentString) && /ARM/i.test(userAgentString) && !/windows phone/i.test(userAgentString);
        var isCommonTablet = !/android.+mobile|Tablet PC/i.test(userAgentString) && /Android|ipad|tablet|playbook|silk|kindle|psp/i.test(userAgentString);
        return isIE10Tablet || isCommonTablet;
      },

      /**
       * Detects the device's pixel ratio. Returns 1 if detection is not possible.
       *
       * @return {Number} The device's pixel ratio
       */
      getDevicePixelRatio: function getDevicePixelRatio() {
        if (typeof window.devicePixelRatio !== "undefined") {
          return window.devicePixelRatio;
        }

        return 1;
      },

      /**
       * Detects if either touch events or pointer events are supported.
       * Additionally it checks if touch is enabled for pointer events.
       *
       * @return {Boolean} <code>true</code>, if the device supports touch
       */
      getTouch: function getTouch() {
        return "ontouchstart" in window || window.navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("device.name", statics.getName);
      qx.core.Environment.add("device.touch", statics.getTouch);
      qx.core.Environment.add("device.type", statics.getType);
      qx.core.Environment.add("device.pixelRatio", statics.getDevicePixelRatio);
    }
  });
  qx.bom.client.Device.$$dbClassInfo = $$dbClassInfo;
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
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This handler accepts the useraction event fired by the keyboard, mouse and
   * pointer handlers after an user triggered action has occurred.
   */
  qx.Class.define("qx.event.handler.UserAction", {
    extend: qx.core.Object,
    implement: qx.event.IEventHandler,

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
        useraction: 1
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
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
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
  qx.event.handler.UserAction.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.Array": {},
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
  
  ************************************************************************ */

  /**
   * Keeps data about the visibility of all widgets. Updates the internal
   * tree when widgets are added, removed or modify their visibility.
   */
  qx.Class.define("qx.ui.core.queue.Visibility", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue: [],

      /** @type {Map} map of widgets by hash code which are in the queue */
      __lookup: {},

      /** @type {Map} Maps hash codes to visibility */
      __data: {},

      /**
       * Clears the cached data of the given widget. Normally only used
       * during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       */
      remove: function remove(widget) {
        if (this.__lookup[widget.$$hash]) {
          delete this.__lookup[widget.$$hash];
          qx.lang.Array.remove(this.__queue, widget);
        }

        delete this.__data[widget.$$hash];
      },

      /**
       * Whether the given widget is visible.
       *
       * Please note that the information given by this method is queued and may not be accurate
       * until the next queue flush happens.
       *
       * @param widget {qx.ui.core.Widget} The widget to query
       * @return {Boolean} Whether the widget is visible
       */
      isVisible: function isVisible(widget) {
        return this.__data[widget.$$hash] || false;
      },

      /**
       * Computes the visibility for the given widget
       *
       * @param widget {qx.ui.core.Widget} The widget to update
       * @return {Boolean} Whether the widget is visible
       */
      __computeVisible: function __computeVisible(widget) {
        var data = this.__data;
        var hash = widget.$$hash;
        var visible; // Respect local value

        if (widget.isExcluded()) {
          visible = false;
        } else {
          // Parent hierarchy
          var parent = widget.$$parent;

          if (parent) {
            visible = this.__computeVisible(parent);
          } else {
            visible = widget.isRootWidget();
          }
        }

        return data[hash] = visible;
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
        qx.ui.core.queue.Manager.scheduleFlush("visibility");
      },

      /**
       * Flushes the visibility queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Dispose all registered objects
        var queue = this.__queue;
        var data = this.__data; // Dynamically add children to queue
        // Only respect already known widgets because otherwise the children
        // are also already in the queue (added on their own)

        for (var i = queue.length - 1; i >= 0; i--) {
          var hash = queue[i].$$hash;

          if (data[hash] != null) {
            // recursive method call which adds widgets to the queue so be
            // careful with that one (performance critical)
            queue[i].addChildrenToQueue(queue);
          }
        } // Cache old data, clear current data
        // Do this before starting with recomputation because
        // new data may also be added by related widgets and not
        // only the widget itself.


        var oldData = {};

        for (var i = queue.length - 1; i >= 0; i--) {
          var hash = queue[i].$$hash;
          oldData[hash] = data[hash];
          data[hash] = null;
        } // Finally recompute


        for (var i = queue.length - 1; i >= 0; i--) {
          var widget = queue[i];
          var hash = widget.$$hash;
          queue.splice(i, 1); // Only update when not already updated by another widget

          if (data[hash] == null) {
            this.__computeVisible(widget);
          } // Check for updates required to the appearance.
          // Hint: Invisible widgets are ignored inside appearance flush


          if (data[hash] && data[hash] != oldData[hash]) {
            widget.checkAppearanceNeeds();
          }
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue = [];
        this.__lookup = {};
      }
    }
  });
  qx.ui.core.queue.Visibility.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.handler.UserAction": {
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
      "qx.bom.AnimationFrame": {},
      "qx.ui.core.queue.Widget": {},
      "qx.log.Logger": {},
      "qx.ui.core.queue.Visibility": {},
      "qx.ui.core.queue.Appearance": {},
      "qx.ui.core.queue.Layout": {},
      "qx.html.Element": {
        "defer": "runtime"
      },
      "qx.ui.core.queue.Dispose": {},
      "qx.event.Registration": {
        "defer": "runtime"
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class performs the auto flush of all layout relevant queues.
   *
   * @require(qx.event.handler.UserAction)
   */
  qx.Class.define("qx.ui.core.queue.Manager", {
    statics: {
      /** @type {Boolean} Whether a flush was scheduled */
      __scheduled: false,

      /** @type {Boolean} true, if the flush should not be executed */
      __canceled: false,

      /** @type {Map} Internal data structure for the current job list */
      __jobs: {},

      /** @type {Integer} Counts how often a flush failed due to exceptions */
      __retries: 0,

      /** @type {Integer} Maximum number of flush retries */
      MAX_RETRIES: 10,

      /**
       * Schedule a deferred flush of all queues.
       *
       * @param job {String} The job, which should be performed. Valid values are
       *     <code>layout</code>, <code>decoration</code> and <code>element</code>.
       */
      scheduleFlush: function scheduleFlush(job) {
        // Sometimes not executed in context, fix this
        var self = qx.ui.core.queue.Manager;
        self.__jobs[job] = true;

        if (!self.__scheduled) {
          self.__canceled = false;
          qx.bom.AnimationFrame.request(function () {
            if (self.__canceled) {
              self.__canceled = false;
              return;
            }

            self.flush();
          }, self);
          self.__scheduled = true;
        }
      },

      /**
       * Flush all layout queues in the correct order. This function is called
       * deferred if {@link #scheduleFlush} is called.
       *
       */
      flush: function flush() {
        // Sometimes not executed in context, fix this
        var self = qx.ui.core.queue.Manager; // Stop when already executed

        if (self.__inFlush) {
          return;
        }

        self.__inFlush = true; // Cancel timeout if called manually

        self.__canceled = true;
        var jobs = self.__jobs;

        self.__executeAndRescheduleOnError(function () {
          // Process jobs
          while (jobs.visibility || jobs.widget || jobs.appearance || jobs.layout || jobs.element) {
            // No else blocks here because each flush can influence the following flushes!
            if (jobs.widget) {
              delete jobs.widget;
              {
                try {
                  qx.ui.core.queue.Widget.flush();
                } catch (e) {
                  qx.log.Logger.error(qx.ui.core.queue.Widget, "Error in the 'Widget' queue:" + e, e);
                }
              }
            }

            if (jobs.visibility) {
              delete jobs.visibility;
              {
                try {
                  qx.ui.core.queue.Visibility.flush();
                } catch (e) {
                  qx.log.Logger.error(qx.ui.core.queue.Visibility, "Error in the 'Visibility' queue:" + e, e);
                }
              }
            }

            if (jobs.appearance) {
              delete jobs.appearance;
              {
                try {
                  qx.ui.core.queue.Appearance.flush();
                } catch (e) {
                  qx.log.Logger.error(qx.ui.core.queue.Appearance, "Error in the 'Appearance' queue:" + e, e);
                }
              }
            } // Defer layout as long as possible


            if (jobs.widget || jobs.visibility || jobs.appearance) {
              continue;
            }

            if (jobs.layout) {
              delete jobs.layout;
              {
                try {
                  qx.ui.core.queue.Layout.flush();
                } catch (e) {
                  qx.log.Logger.error(qx.ui.core.queue.Layout, "Error in the 'Layout' queue:" + e, e);
                }
              }
            } // Defer element as long as possible


            if (jobs.widget || jobs.visibility || jobs.appearance || jobs.layout) {
              continue;
            }

            if (jobs.element) {
              delete jobs.element;
              qx.html.Element.flush();
            }
          }
        }, function () {
          self.__scheduled = false;
        });

        self.__executeAndRescheduleOnError(function () {
          if (jobs.dispose) {
            delete jobs.dispose;
            {
              try {
                qx.ui.core.queue.Dispose.flush();
              } catch (e) {
                qx.log.Logger.error("Error in the 'Dispose' queue:" + e);
              }
            }
          }
        }, function () {
          // Clear flag
          self.__inFlush = false;
        }); // flush succeeded successfully. Reset retries


        self.__retries = 0;
      },

      /**
       * Executes the callback code. If the callback throws an error the current
       * flush is cleaned up and rescheduled. The finally code is called after the
       * callback even if it has thrown an exception.
       *
       * @signature function(callback, finallyCode)
       * @param callback {Function} the callback function
       * @param finallyCode {Function} function to be called in the finally block
       */
      __executeAndRescheduleOnError: function __executeAndRescheduleOnError(callback, finallyCode) {
        callback();
        finallyCode();
      },

      /**
       * Handler used on touch devices to prevent the queue from manipulating
       * the dom during the touch - mouse - ... event sequence. Usually, iOS
       * devices fire a click event 300ms after the touchend event. So using
       * 500ms should be a good value to be on the save side. This is necessary
       * due to the fact that the event chain is stopped if a manipulation in
       * the DOM is done.
       *
       * @param e {qx.event.type.Data} The user action data event.
       */
      __onUserAction: function __onUserAction(e) {
        qx.ui.core.queue.Manager.flush();
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    defer: function defer(statics) {
      // Replace default scheduler for HTML element with local one.
      // This is quite a hack, but allows us to force other flushes
      // before the HTML element flush.
      qx.html.Element._scheduleFlush = statics.scheduleFlush; // Register to user action

      qx.event.Registration.addListener(window, "useraction", qx.core.Environment.get("event.touch") ? statics.__onUserAction : statics.flush);
    }
  });
  qx.ui.core.queue.Manager.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.element.Dimension": {},
      "qx.bom.Document": {},
      "qx.bom.Viewport": {},
      "qx.bom.Stylesheet": {},
      "qxWeb": {
        "defer": "runtime"
      },
      "qx.bom.element.Location": {},
      "qx.lang.String": {},
      "qx.bom.element.Style": {},
      "qx.bom.element.Class": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2011-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * CSS/Style property manipulation module
   * @group (Core)
   */
  qx.Bootstrap.define("qx.module.Css", {
    statics: {
      /**
       * INTERNAL
       *
       * Returns the rendered height of the first element in the collection.
       * @attach {qxWeb}
       * @param force {Boolean?false} When true also get the height of a <em>non displayed</em> element
       * @return {Number} The first item's rendered height
       */
      _getHeight: function _getHeight(force) {
        var elem = this[0];

        if (elem) {
          if (qx.dom.Node.isElement(elem)) {
            var elementHeight;

            if (force) {
              var stylesToSwap = {
                display: "block",
                position: "absolute",
                visibility: "hidden"
              };
              elementHeight = qx.module.Css.__swap(elem, stylesToSwap, "_getHeight", this);
            } else {
              elementHeight = qx.bom.element.Dimension.getHeight(elem);
            }

            return elementHeight;
          } else if (qx.dom.Node.isDocument(elem)) {
            return qx.bom.Document.getHeight(qx.dom.Node.getWindow(elem));
          } else if (qx.dom.Node.isWindow(elem)) {
            return qx.bom.Viewport.getHeight(elem);
          }
        }

        return null;
      },

      /**
       * INTERNAL
       *
       * Returns the rendered width of the first element in the collection
       * @attach {qxWeb}
       * @param force {Boolean?false} When true also get the width of a <em>non displayed</em> element
       * @return {Number} The first item's rendered width
       */
      _getWidth: function _getWidth(force) {
        var elem = this[0];

        if (elem) {
          if (qx.dom.Node.isElement(elem)) {
            var elementWidth;

            if (force) {
              var stylesToSwap = {
                display: "block",
                position: "absolute",
                visibility: "hidden"
              };
              elementWidth = qx.module.Css.__swap(elem, stylesToSwap, "_getWidth", this);
            } else {
              elementWidth = qx.bom.element.Dimension.getWidth(elem);
            }

            return elementWidth;
          } else if (qx.dom.Node.isDocument(elem)) {
            return qx.bom.Document.getWidth(qx.dom.Node.getWindow(elem));
          } else if (qx.dom.Node.isWindow(elem)) {
            return qx.bom.Viewport.getWidth(elem);
          }
        }

        return null;
      },

      /**
       * INTERNAL
       *
       * Returns the content height of the first element in the collection.
       * This is the maximum height the element can use, excluding borders,
       * margins, padding or scroll bars.
       * @attach {qxWeb}
       * @param force {Boolean?false} When true also get the content height of a <em>non displayed</em> element
       * @return {Number} Computed content height
       */
      _getContentHeight: function _getContentHeight(force) {
        var obj = this[0];

        if (qx.dom.Node.isElement(obj)) {
          var contentHeight;

          if (force) {
            var stylesToSwap = {
              position: "absolute",
              visibility: "hidden",
              display: "block"
            };
            contentHeight = qx.module.Css.__swap(obj, stylesToSwap, "_getContentHeight", this);
          } else {
            contentHeight = qx.bom.element.Dimension.getContentHeight(obj);
          }

          return contentHeight;
        }

        return null;
      },

      /**
       * INTERNAL
       *
       * Returns the content width of the first element in the collection.
       * This is the maximum width the element can use, excluding borders,
       * margins, padding or scroll bars.
       * @attach {qxWeb}
       * @param force {Boolean?false} When true also get the content width of a <em>non displayed</em> element
       * @return {Number} Computed content width
       */
      _getContentWidth: function _getContentWidth(force) {
        var obj = this[0];

        if (qx.dom.Node.isElement(obj)) {
          var contentWidth;

          if (force) {
            var stylesToSwap = {
              position: "absolute",
              visibility: "hidden",
              display: "block"
            };
            contentWidth = qx.module.Css.__swap(obj, stylesToSwap, "_getContentWidth", this);
          } else {
            contentWidth = qx.bom.element.Dimension.getContentWidth(obj);
          }

          return contentWidth;
        }

        return null;
      },

      /**
       * Maps HTML elements to their default "display" style values.
       */
      __displayDefaults: {},

      /**
       * Attempts tp determine the default "display" style value for
       * elements with the given tag name.
       *
       * @param tagName {String} Tag name
       * @param  doc {Document?} Document element. Default: The current document
       * @return {String} The default "display" value, e.g. <code>inline</code>
       * or <code>block</code>
       */
      __getDisplayDefault: function __getDisplayDefault(tagName, doc) {
        var defaults = qx.module.Css.__displayDefaults;

        if (!defaults[tagName]) {
          var docu = doc || document;
          var tempEl = qxWeb(docu.createElement(tagName)).appendTo(doc.body);
          defaults[tagName] = tempEl.getStyle("display");
          tempEl.remove();
        }

        return defaults[tagName] || "";
      },

      /**
       * Swaps the given styles of the element and execute the callback
       * before the original values are restored.
       *
       * Finally returns the return value of the callback.
       *
       * @param element {Element} the DOM element to operate on
       * @param styles {Map} the styles to swap
       * @param methodName {String} the callback functions name
       * @param context {Object} the context in which the callback should be called
       * @return {Object} the return value of the callback
       */
      __swap: function __swap(element, styles, methodName, context) {
        // get the current values
        var currentValues = {};

        for (var styleProperty in styles) {
          currentValues[styleProperty] = element.style[styleProperty];
          element.style[styleProperty] = styles[styleProperty];
        }

        var value = context[methodName]();

        for (var styleProperty in currentValues) {
          element.style[styleProperty] = currentValues[styleProperty];
        }

        return value;
      },

      /**
       * Includes a Stylesheet file
       *
       * @attachStatic {qxWeb}
       * @param uri {String} The stylesheet's URI
       * @param doc {Document?} Document to modify
       */
      includeStylesheet: function includeStylesheet(uri, doc) {
        qx.bom.Stylesheet.includeFile(uri, doc);
      }
    },
    members: {
      /**
       * Returns the rendered height of the first element in the collection.
       * @attach {qxWeb}
       * @param force {Boolean?false} When true also get the height of a <em>non displayed</em> element
       * @return {Number} The first item's rendered height
       */
      getHeight: function getHeight(force) {
        return this._getHeight(force);
      },

      /**
       * Returns the rendered width of the first element in the collection
       * @attach {qxWeb}
       * @param force {Boolean?false} When true also get the width of a <em>non displayed</em> element
       * @return {Number} The first item's rendered width
       */
      getWidth: function getWidth(force) {
        return this._getWidth(force);
      },

      /**
       * Returns the content height of the first element in the collection.
       * This is the maximum height the element can use, excluding borders,
       * margins, padding or scroll bars.
       * @attach {qxWeb}
       * @param force {Boolean?false} When true also get the content height of a <em>non displayed</em> element
       * @return {Number} Computed content height
       */
      getContentHeight: function getContentHeight(force) {
        return this._getContentHeight(force);
      },

      /**
       * Returns the content width of the first element in the collection.
       * This is the maximum width the element can use, excluding borders,
       * margins, padding or scroll bars.
       * @attach {qxWeb}
       * @param force {Boolean?false} When true also get the content width of a <em>non displayed</em> element
       * @return {Number} Computed content width
       */
      getContentWidth: function getContentWidth(force) {
        return this._getContentWidth(force);
      },

      /**
       * Shows any elements with "display: none" in the collection. If an element
       * was hidden by using the {@link #hide} method, its previous
       * "display" style value will be re-applied. Otherwise, the
       * default "display" value for the element type will be applied.
       *
       * @attach {qxWeb}
       * @return {qxWeb} The collection for chaining
       */
      show: function show() {
        this._forEachElementWrapped(function (item) {
          var currentVal = item.getStyle("display");
          var prevVal = item[0].$$qPrevDisp;
          var newVal;

          if (currentVal == "none") {
            if (prevVal && prevVal != "none") {
              newVal = prevVal;
            } else {
              var doc = qxWeb.getDocument(item[0]);
              newVal = qx.module.Css.__getDisplayDefault(item[0].tagName, doc);
            }

            item.setStyle("display", newVal);
            item[0].$$qPrevDisp = "none";
          }
        });

        return this;
      },

      /**
       * Hides all elements in the collection by setting their "display"
       * style to "none". The previous value is stored so it can be re-applied
       * when {@link #show} is called.
       *
       * @attach {qxWeb}
       * @return {qxWeb} The collection for chaining
       */
      hide: function hide() {
        this._forEachElementWrapped(function (item) {
          var prevStyle = item.getStyle("display");

          if (prevStyle !== "none") {
            item[0].$$qPrevDisp = prevStyle;
            item.setStyle("display", "none");
          }
        });

        return this;
      },

      /**
       * Returns the distance between the first element in the collection and its
       * offset parent
       *
       * @attach {qxWeb}
       * @return {Map} a map with the keys <code>left</code> and <code>top</code>
       * containing the distance between the elements
       */
      getPosition: function getPosition() {
        var obj = this[0];

        if (qx.dom.Node.isElement(obj)) {
          return qx.bom.element.Location.getPosition(obj);
        }

        return null;
      },

      /**
       * Returns the computed location of the given element in the context of the
       * document dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
       *
       * @attach {qxWeb}
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} A map with the keys <code>left</code>, <code>top</code>,
       * <code>right</code> and <code>bottom</code> which contains the distance
       * of the element relative to the document.
       */
      getOffset: function getOffset(mode) {
        var elem = this[0];

        if (elem && qx.dom.Node.isElement(elem)) {
          return qx.bom.element.Location.get(elem, mode);
        }

        return null;
      },

      /**
       * Modifies the given style property on all elements in the collection.
       *
       * @attach {qxWeb}
       * @param name {String} Name of the style property to modify
       * @param value {var} The value to apply
       * @return {qxWeb} The collection for chaining
       */
      setStyle: function setStyle(name, value) {
        if (/\w-\w/.test(name)) {
          name = qx.lang.String.camelCase(name);
        }

        this._forEachElement(function (item) {
          qx.bom.element.Style.set(item, name, value);
        });

        return this;
      },

      /**
       * Returns the value of the given style property for the first item in the
       * collection.
       *
       * @attach {qxWeb}
       * @param name {String} Style property name
       * @return {var} Style property value
       */
      getStyle: function getStyle(name) {
        if (this[0] && qx.dom.Node.isElement(this[0])) {
          if (/\w-\w/.test(name)) {
            name = qx.lang.String.camelCase(name);
          }

          return qx.bom.element.Style.get(this[0], name);
        }

        return null;
      },

      /**
       * Sets multiple style properties for each item in the collection.
       *
       * @attach {qxWeb}
       * @param styles {Map} A map of style property name/value pairs
       * @return {qxWeb} The collection for chaining
       */
      setStyles: function setStyles(styles) {
        for (var name in styles) {
          this.setStyle(name, styles[name]);
        }

        return this;
      },

      /**
       * Returns the values of multiple style properties for each item in the
       * collection
       *
       * @attach {qxWeb}
       * @param names {String[]} List of style property names
       * @return {Map} Map of style property name/value pairs
       */
      getStyles: function getStyles(names) {
        var styles = {};

        for (var i = 0; i < names.length; i++) {
          styles[names[i]] = this.getStyle(names[i]);
        }

        return styles;
      },

      /**
       * Adds a class name to each element in the collection
       *
       * @attach {qxWeb}
       * @param name {String} Class name
       * @return {qxWeb} The collection for chaining
       */
      addClass: function addClass(name) {
        this._forEachElement(function (item) {
          qx.bom.element.Class.add(item, name);
        });

        return this;
      },

      /**
       * Adds multiple class names to each element in the collection
       *
       * @attach {qxWeb}
       * @param names {String[]} List of class names to add
       * @return {qxWeb} The collection for chaining
       */
      addClasses: function addClasses(names) {
        this._forEachElement(function (item) {
          qx.bom.element.Class.addClasses(item, names);
        });

        return this;
      },

      /**
       * Removes a class name from each element in the collection
       *
       * @attach {qxWeb}
       * @param name {String} The class name to remove
       * @return {qxWeb} The collection for chaining
       */
      removeClass: function removeClass(name) {
        this._forEachElement(function (item) {
          qx.bom.element.Class.remove(item, name);
        });

        return this;
      },

      /**
       * Removes multiple class names from each element in the collection.
       * Use {@link qx.module.Attribute#removeAttribute} to remove all classes.
       *
       * @attach {qxWeb}
       * @param names {String[]} List of class names to remove
       * @return {qxWeb} The collection for chaining
       */
      removeClasses: function removeClasses(names) {
        this._forEachElement(function (item) {
          qx.bom.element.Class.removeClasses(item, names);
        });

        return this;
      },

      /**
       * Checks if the first element in the collection has the given class name
       *
       * @attach {qxWeb}
       * @param name {String} Class name to check for
       * @return {Boolean} <code>true</code> if the first item has the given class name
       */
      hasClass: function hasClass(name) {
        if (!this[0] || !qx.dom.Node.isElement(this[0])) {
          return false;
        }

        return qx.bom.element.Class.has(this[0], name);
      },

      /**
       * Returns the class name of the first element in the collection
       *
       * @attach {qxWeb}
       * @return {String} Class name
       */
      getClass: function getClass() {
        if (!this[0] || !qx.dom.Node.isElement(this[0])) {
          return "";
        }

        return qx.bom.element.Class.get(this[0]);
      },

      /**
       * Toggles the given class name on each item in the collection
       *
       * @attach {qxWeb}
       * @param name {String} Class name
       * @return {qxWeb} The collection for chaining
       */
      toggleClass: function toggleClass(name) {
        var bCls = qx.bom.element.Class;

        this._forEachElement(function (item) {
          bCls.has(item, name) ? bCls.remove(item, name) : bCls.add(item, name);
        });

        return this;
      },

      /**
       * Toggles the given list of class names on each item in the collection
       *
       * @attach {qxWeb}
       * @param names {String[]} Class names
       * @return {qxWeb} The collection for chaining
       */
      toggleClasses: function toggleClasses(names) {
        for (var i = 0, l = names.length; i < l; i++) {
          this.toggleClass(names[i]);
        }

        return this;
      },

      /**
       * Replaces a class name on each element in the collection
       *
       * @attach {qxWeb}
       * @param oldName {String} Class name to remove
       * @param newName {String} Class name to add
       * @return {qxWeb} The collection for chaining
       */
      replaceClass: function replaceClass(oldName, newName) {
        this._forEachElement(function (item) {
          qx.bom.element.Class.replace(item, oldName, newName);
        });

        return this;
      }
    },
    defer: function defer(statics) {
      qxWeb.$attachAll(this); // manually attach private method which is ignored by attachAll

      qxWeb.$attach({
        "_getWidth": statics._getWidth,
        "_getHeight": statics._getHeight,
        "_getContentHeight": statics._getContentHeight,
        "_getContentWidth": statics._getContentWidth
      });
    }
  });
  qx.module.Css.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.lang.normalize.Array": {
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Environment": {}
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
       2007-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
     ======================================================================
  
     This class uses ideas and code snippets presented at
     http://webreflection.blogspot.com/2008/05/habemus-array-unlocked-length-in-ie8.html
     http://webreflection.blogspot.com/2008/05/stack-and-arrayobject-how-to-create.html
  
     Author:
       Andrea Giammarchi
  
     License:
       MIT: http://www.opensource.org/licenses/mit-license.php
  
     ======================================================================
  
     This class uses documentation of the native Array methods from the MDC
     documentation of Mozilla.
  
     License:
       CC Attribution-Sharealike License:
       http://creativecommons.org/licenses/by-sa/2.5/
  
  ************************************************************************ */

  /**
   * This class is the common superclass for most array classes in
   * qooxdoo. It supports all of the shiny 1.6 JavaScript array features
   * like <code>forEach</code> and <code>map</code>.
   *
   * This class may be instantiated instead of the native Array if
   * one wants to work with a feature-unified Array instead of the native
   * one. This class uses native features whereever possible but fills
   * all missing implementations with custom ones.
   *
   * Through the ability to extend from this class one could add even
   * more utility features on top of it.
   *
   * @require(qx.bom.client.Engine)
   * @require(qx.lang.normalize.Array)
   */
  qx.Bootstrap.define("qx.type.BaseArray", {
    extend: Array,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Creates a new Array with the given length or the listed elements.
     *
     * <pre class="javascript">
     * var arr1 = new qx.type.BaseArray(arrayLength);
     * var arr2 = new qx.type.BaseArray(item0, item1, ..., itemN);
     * </pre>
     *
     * * <code>arrayLength</code>: The initial length of the array. You can access
     * this value using the length property. If the value specified is not a
     * number, an array of length 1 is created, with the first element having
     * the specified value. The maximum length allowed for an
     * array is 2^32-1, i.e. 4,294,967,295.
     * * <code>itemN</code>:  A value for the element in that position in the
     * array. When this form is used, the array is initialized with the specified
     * values as its elements, and the array's length property is set to the
     * number of arguments.
     *
     * @param length_or_items {Integer|var?null} The initial length of the array
     *        OR an argument list of values.
     */
    construct: function construct(length_or_items) {},

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Converts a base array to a native Array
       *
       * @signature function()
       * @return {Array} The native array
       */
      toArray: null,

      /**
       * Returns the current number of items stored in the Array
       *
       * @signature function()
       * @return {Integer} number of items
       */
      valueOf: null,

      /**
       * Removes the last element from an array and returns that element.
       *
       * This method modifies the array.
       *
       * @signature function()
       * @return {var} The last element of the array.
       */
      pop: null,

      /**
       * Adds one or more elements to the end of an array and returns the new length of the array.
       *
       * This method modifies the array.
       *
       * @signature function(varargs)
       * @param varargs {var} The elements to add to the end of the array.
       * @return {Integer} The new array's length
       */
      push: null,

      /**
       * Reverses the order of the elements of an array -- the first becomes the last, and the last becomes the first.
       *
       * This method modifies the array.
       *
       * @signature function()
       * @return {Array} Returns the modified array (works in place)
       */
      reverse: null,

      /**
       * Removes the first element from an array and returns that element.
       *
       * This method modifies the array.
       *
       * @signature function()
       * @return {var} The first element of the array.
       */
      shift: null,

      /**
       * Sorts the elements of an array.
       *
       * This method modifies the array.
       *
       * @signature function(compareFunction)
       * @param compareFunction {Function?null} Specifies a function that defines the sort order. If omitted,
       *   the array is sorted lexicographically (in dictionary order) according to the string conversion of each element.
       * @return {Array} Returns the modified array (works in place)
       */
      sort: null,

      /**
       * Adds and/or removes elements from an array.
       *
       * @signature function(index, howMany, varargs)
       * @param index {Integer} Index at which to start changing the array. If negative, will begin
       *   that many elements from the end.
       * @param howMany {Integer} An integer indicating the number of old array elements to remove.
       *   If <code>howMany</code> is 0, no elements are removed. In this case, you should specify
       *   at least one new element.
       * @param varargs {var?null} The elements to add to the array. If you don't specify any elements,
       *   splice simply removes elements from the array.
       * @return {qx.type.BaseArray} New array with the removed elements.
       */
      splice: null,

      /**
       * Adds one or more elements to the front of an array and returns the new length of the array.
       *
       * This method modifies the array.
       *
       * @signature function(varargs)
       * @param varargs {var} The elements to add to the front of the array.
       * @return {Integer} The new array's length
       */
      unshift: null,

      /**
       * Returns a new array comprised of this array joined with other array(s) and/or value(s).
       *
       * This method does not modify the array and returns a modified copy of the original.
       *
       * @signature function(varargs)
       * @param varargs {Array|var} Arrays and/or values to concatenate to the resulting array.
       * @return {qx.type.BaseArray} New array built of the given arrays or values.
       */
      concat: null,

      /**
       * Joins all elements of an array into a string.
       *
       * @signature function(separator)
       * @param separator {String} Specifies a string to separate each element of the array. The separator is
       *   converted to a string if necessary. If omitted, the array elements are separated with a comma.
       * @return {String} The stringified values of all elements divided by the given separator.
       */
      join: null,

      /**
       * Extracts a section of an array and returns a new array.
       *
       * @signature function(begin, end)
       * @param begin {Integer} Zero-based index at which to begin extraction. As a negative index, start indicates
       *   an offset from the end of the sequence. slice(-2) extracts the second-to-last element and the last element
       *   in the sequence.
       * @param end {Integer?length} Zero-based index at which to end extraction. slice extracts up to but not including end.
       *   <code>slice(1,4)</code> extracts the second element through the fourth element (elements indexed 1, 2, and 3).
       *   As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second-to-last element in the sequence.
       *   If end is omitted, slice extracts to the end of the sequence.
       * @return {qx.type.BaseArray} An new array which contains a copy of the given region.
       */
      slice: null,

      /**
       * Returns a string representing the array and its elements. Overrides the Object.prototype.toString method.
       *
       * @signature function()
       * @return {String} The string representation of the array.
       */
      toString: null,

      /**
       * Returns the first (least) index of an element within the array equal to the specified value, or -1 if none is found.
       *
       * @signature function(searchElement, fromIndex)
       * @param searchElement {var} Element to locate in the array.
       * @param fromIndex {Integer?0} The index at which to begin the search. Defaults to 0, i.e. the
       *   whole array will be searched. If the index is greater than or equal to the length of the
       *   array, -1 is returned, i.e. the array will not be searched. If negative, it is taken as
       *   the offset from the end of the array. Note that even when the index is negative, the array
       *   is still searched from front to back. If the calculated index is less than 0, the whole
       *   array will be searched.
       * @return {Integer} The index of the given element
       */
      indexOf: null,

      /**
       * Returns the last (greatest) index of an element within the array equal to the specified value, or -1 if none is found.
       *
       * @signature function(searchElement, fromIndex)
       * @param searchElement {var} Element to locate in the array.
       * @param fromIndex {Integer?length} The index at which to start searching backwards. Defaults to
       *   the array's length, i.e. the whole array will be searched. If the index is greater than
       *   or equal to the length of the array, the whole array will be searched. If negative, it
       *   is taken as the offset from the end of the array. Note that even when the index is
       *   negative, the array is still searched from back to front. If the calculated index is
       *   less than 0, -1 is returned, i.e. the array will not be searched.
       * @return {Integer} The index of the given element
       */
      lastIndexOf: null,

      /**
       * Executes a provided function once per array element.
       *
       * <code>forEach</code> executes the provided function (<code>callback</code>) once for each
       * element present in the array.  <code>callback</code> is invoked only for indexes of the array
       * which have assigned values; it is not invoked for indexes which have been deleted or which
       * have never been assigned values.
       *
       * <code>callback</code> is invoked with three arguments: the value of the element, the index
       * of the element, and the Array object being traversed.
       *
       * If a <code>obj</code> parameter is provided to <code>forEach</code>, it will be used
       * as the <code>this</code> for each invocation of the <code>callback</code>.  If it is not
       * provided, or is <code>null</code>, the global object associated with <code>callback</code>
       * is used instead.
       *
       * <code>forEach</code> does not mutate the array on which it is called.
       *
       * The range of elements processed by <code>forEach</code> is set before the first invocation of
       * <code>callback</code>.  Elements which are appended to the array after the call to
       * <code>forEach</code> begins will not be visited by <code>callback</code>. If existing elements
       * of the array are changed, or deleted, their value as passed to <code>callback</code> will be
       * the value at the time <code>forEach</code> visits them; elements that are deleted are not visited.
       *
       * @signature function(callback, obj)
       * @param callback {Function} Function to execute for each element.
       * @param obj {Object} Object to use as this when executing callback.
       */
      forEach: null,

      /**
       * Creates a new array with all elements that pass the test implemented by the provided
       * function.
       *
       * <code>filter</code> calls a provided <code>callback</code> function once for each
       * element in an array, and constructs a new array of all the values for which
       * <code>callback</code> returns a true value.  <code>callback</code> is invoked only
       * for indexes of the array which have assigned values; it is not invoked for indexes
       * which have been deleted or which have never been assigned values.  Array elements which
       * do not pass the <code>callback</code> test are simply skipped, and are not included
       * in the new array.
       *
       * <code>callback</code> is invoked with three arguments: the value of the element, the
       * index of the element, and the Array object being traversed.
       *
       * If a <code>obj</code> parameter is provided to <code>filter</code>, it will
       * be used as the <code>this</code> for each invocation of the <code>callback</code>.
       * If it is not provided, or is <code>null</code>, the global object associated with
       * <code>callback</code> is used instead.
       *
       * <code>filter</code> does not mutate the array on which it is called. The range of
       * elements processed by <code>filter</code> is set before the first invocation of
       * <code>callback</code>. Elements which are appended to the array after the call to
       * <code>filter</code> begins will not be visited by <code>callback</code>. If existing
       * elements of the array are changed, or deleted, their value as passed to <code>callback</code>
       * will be the value at the time <code>filter</code> visits them; elements that are deleted
       * are not visited.
       *
       * @signature function(callback, obj)
       * @param callback {Function} Function to test each element of the array.
       * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
       * @return {qx.type.BaseArray} The newly created array with all matching elements
       */
      filter: null,

      /**
       * Creates a new array with the results of calling a provided function on every element in this array.
       *
       * <code>map</code> calls a provided <code>callback</code> function once for each element in an array,
       * in order, and constructs a new array from the results.  <code>callback</code> is invoked only for
       * indexes of the array which have assigned values; it is not invoked for indexes which have been
       * deleted or which have never been assigned values.
       *
       * <code>callback</code> is invoked with three arguments: the value of the element, the index of the
       * element, and the Array object being traversed.
       *
       * If a <code>obj</code> parameter is provided to <code>map</code>, it will be used as the
       * <code>this</code> for each invocation of the <code>callback</code>. If it is not provided, or is
       * <code>null</code>, the global object associated with <code>callback</code> is used instead.
       *
       * <code>map</code> does not mutate the array on which it is called.
       *
       * The range of elements processed by <code>map</code> is set before the first invocation of
       * <code>callback</code>. Elements which are appended to the array after the call to <code>map</code>
       * begins will not be visited by <code>callback</code>.  If existing elements of the array are changed,
       * or deleted, their value as passed to <code>callback</code> will be the value at the time
       * <code>map</code> visits them; elements that are deleted are not visited.
       *
       * @signature function(callback, obj)
       * @param callback {Function} Function produce an element of the new Array from an element of the current one.
       * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
       * @return {qx.type.BaseArray} A new array which contains the return values of every item executed through the given function
       */
      map: null,

      /**
       * Tests whether some element in the array passes the test implemented by the provided function.
       *
       * <code>some</code> executes the <code>callback</code> function once for each element present in
       * the array until it finds one where <code>callback</code> returns a true value. If such an element
       * is found, <code>some</code> immediately returns <code>true</code>. Otherwise, <code>some</code>
       * returns <code>false</code>. <code>callback</code> is invoked only for indexes of the array which
       * have assigned values; it is not invoked for indexes which have been deleted or which have never
       * been assigned values.
       *
       * <code>callback</code> is invoked with three arguments: the value of the element, the index of the
       * element, and the Array object being traversed.
       *
       * If a <code>obj</code> parameter is provided to <code>some</code>, it will be used as the
       * <code>this</code> for each invocation of the <code>callback</code>. If it is not provided, or is
       * <code>null</code>, the global object associated with <code>callback</code> is used instead.
       *
       * <code>some</code> does not mutate the array on which it is called.
       *
       * The range of elements processed by <code>some</code> is set before the first invocation of
       * <code>callback</code>.  Elements that are appended to the array after the call to <code>some</code>
       * begins will not be visited by <code>callback</code>. If an existing, unvisited element of the array
       * is changed by <code>callback</code>, its value passed to the visiting <code>callback</code> will
       * be the value at the time that <code>some</code> visits that element's index; elements that are
       * deleted are not visited.
       *
       * @signature function(callback, obj)
       * @param callback {Function} Function to test for each element.
       * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
       * @return {Boolean} Whether at least one elements passed the test
       */
      some: null,

      /**
       * Tests whether all elements in the array pass the test implemented by the provided function.
       *
       * <code>every</code> executes the provided <code>callback</code> function once for each element
       * present in the array until it finds one where <code>callback</code> returns a false value. If
       * such an element is found, the <code>every</code> method immediately returns <code>false</code>.
       * Otherwise, if <code>callback</code> returned a true value for all elements, <code>every</code>
       * will return <code>true</code>.  <code>callback</code> is invoked only for indexes of the array
       * which have assigned values; it is not invoked for indexes which have been deleted or which have
       * never been assigned values.
       *
       * <code>callback</code> is invoked with three arguments: the value of the element, the index of
       * the element, and the Array object being traversed.
       *
       * If a <code>obj</code> parameter is provided to <code>every</code>, it will be used as
       * the <code>this</code> for each invocation of the <code>callback</code>. If it is not provided,
       * or is <code>null</code>, the global object associated with <code>callback</code> is used instead.
       *
       * <code>every</code> does not mutate the array on which it is called. The range of elements processed
       * by <code>every</code> is set before the first invocation of <code>callback</code>. Elements which
       * are appended to the array after the call to <code>every</code> begins will not be visited by
       * <code>callback</code>.  If existing elements of the array are changed, their value as passed
       * to <code>callback</code> will be the value at the time <code>every</code> visits them; elements
       * that are deleted are not visited.
       *
       * @signature function(callback, obj)
       * @param callback {Function} Function to test for each element.
       * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
       * @return {Boolean} Whether all elements passed the test
       */
      every: null
    }
  });

  (function () {
    function createStackConstructor(stack) {
      // In IE don't inherit from Array but use an empty object as prototype
      // and copy the methods from Array
      if (qx.core.Environment.get("engine.name") == "mshtml") {
        Stack.prototype = {
          length: 0,
          $$isArray: true
        };
        var args = "pop.push.reverse.shift.sort.splice.unshift.join.slice".split(".");

        for (var length = args.length; length;) {
          Stack.prototype[args[--length]] = Array.prototype[args[length]];
        }
      }

      ; // Remember Array's slice method

      var slice = Array.prototype.slice; // Fix "concat" method

      Stack.prototype.concat = function () {
        var constructor = this.slice(0);

        for (var i = 0, length = arguments.length; i < length; i++) {
          var copy;

          if (arguments[i] instanceof Stack) {
            copy = slice.call(arguments[i], 0);
          } else if (arguments[i] instanceof Array) {
            copy = arguments[i];
          } else {
            copy = [arguments[i]];
          }

          constructor.push.apply(constructor, copy);
        }

        return constructor;
      }; // Fix "toString" method


      Stack.prototype.toString = function () {
        return slice.call(this, 0).toString();
      }; // Fix "toLocaleString"


      Stack.prototype.toLocaleString = function () {
        return slice.call(this, 0).toLocaleString();
      }; // Fix constructor


      Stack.prototype.constructor = Stack; // Add JS 1.6 Array features

      Stack.prototype.indexOf = Array.prototype.indexOf;
      Stack.prototype.lastIndexOf = Array.prototype.lastIndexOf;
      Stack.prototype.forEach = Array.prototype.forEach;
      Stack.prototype.some = Array.prototype.some;
      Stack.prototype.every = Array.prototype.every;
      var filter = Array.prototype.filter;
      var map = Array.prototype.map; // Fix methods which generates a new instance
      // to return an instance of the same class

      Stack.prototype.filter = function () {
        var ret = new this.constructor();
        ret.push.apply(ret, filter.apply(this, arguments));
        return ret;
      };

      Stack.prototype.map = function () {
        var ret = new this.constructor();
        ret.push.apply(ret, map.apply(this, arguments));
        return ret;
      };

      Stack.prototype.slice = function () {
        var ret = new this.constructor();
        ret.push.apply(ret, Array.prototype.slice.apply(this, arguments));
        return ret;
      };

      Stack.prototype.splice = function () {
        var ret = new this.constructor();
        ret.push.apply(ret, Array.prototype.splice.apply(this, arguments));
        return ret;
      }; // Add new "toArray" method for convert a base array to a native Array


      Stack.prototype.toArray = function () {
        return Array.prototype.slice.call(this, 0);
      }; // Add valueOf() to return the length


      Stack.prototype.valueOf = function () {
        return this.length;
      }; // Return final class


      return Stack;
    }

    function Stack(length) {
      if (arguments.length === 1 && typeof length === "number") {
        this.length = -1 < length && length === length >> .5 ? length : this.push(length);
      } else if (arguments.length) {
        this.push.apply(this, arguments);
      }
    }

    ;

    function PseudoArray() {}

    ;
    PseudoArray.prototype = [];
    Stack.prototype = new PseudoArray();
    Stack.prototype.length = 0;
    qx.type.BaseArray = createStackConstructor(Stack);
  })();

  qx.type.BaseArray.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-3.js.map
