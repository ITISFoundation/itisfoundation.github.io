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

//# sourceMappingURL=part-boot-bundle-2.js.map
