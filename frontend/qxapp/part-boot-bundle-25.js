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
      "qx.ui.tabview.TabButton": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A page is the way to add content to a {@link TabView}. Each page gets a
   * button to switch to the page. Only one page is visible at a time.
   *
   * @childControl button {qx.ui.tabview.TabButton} tab button connected to the page
   */
  qx.Class.define("qx.ui.tabview.Page", {
    extend: qx.ui.container.Composite,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Initial label of the tab
     * @param icon {String} Initial icon of the tab
     */
    construct: function construct(label, icon) {
      qx.ui.container.Composite.constructor.call(this);

      this._createChildControl("button"); // init


      if (label != null) {
        this.setLabel(label);
      }

      if (icon != null) {
        this.setIcon(icon);
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired by {@link qx.ui.tabview.TabButton} if the close button is tapped.
       */
      "close": "qx.event.type.Event"
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
        init: "tabview-page"
      },

      /** The label/caption/text of the Page's button. */
      label: {
        check: "String",
        init: "",
        apply: "_applyLabel"
      },

      /** Any URI String supported by qx.ui.basic.Image to display an icon in Page's button. */
      icon: {
        check: "String",
        init: "",
        apply: "_applyIcon",
        nullable: true
      },

      /** Indicates if the close button of a TabButton should be shown. */
      showCloseButton: {
        check: "Boolean",
        init: false,
        apply: "_applyShowCloseButton"
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

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        barTop: 1,
        barRight: 1,
        barBottom: 1,
        barLeft: 1,
        firstTab: 1,
        lastTab: 1
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        var btn = this.getChildControl("button");

        if (value) {
          btn.setIcon(value);

          btn._showChildControl("icon");
        } else {
          btn._excludeChildControl("icon");
        }
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        this.getChildControl("button").setLabel(value);
      },
      // overridden
      _applyEnabled: function _applyEnabled(value, old) {
        qx.ui.tabview.Page.prototype._applyEnabled.base.call(this, value, old); // delegate to non-child widget button
        // since enabled is inheritable value may be null


        var btn = this.getChildControl("button");
        value == null ? btn.resetEnabled() : btn.setEnabled(value);
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "button":
            control = new qx.ui.tabview.TabButton();
            control.setAllowGrowX(true);
            control.setAllowGrowY(true);
            control.setUserData("page", this);
            control.addListener("close", this._onButtonClose, this);
            break;
        }

        return control || qx.ui.tabview.Page.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyShowCloseButton: function _applyShowCloseButton(value, old) {
        this.getChildControl("button").setShowCloseButton(value);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Fires an "close" event when the close button of the TabButton of the page
       * is tapped.
       */
      _onButtonClose: function _onButtonClose() {
        this.fireEvent("close");
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the button used within this page. This method is used by
       * the TabView to access the button.
       *
       * @internal
       * @return {qx.ui.form.RadioButton} The button associated with this page.
       */
      getButton: function getButton() {
        return this.getChildControl("button");
      }
    }
  });
  qx.ui.tabview.Page.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.core.MRemoteLayoutHandling": {
        "require": true
      },
      "qx.ui.form.RepeatButton": {},
      "qx.ui.container.Composite": {},
      "qx.ui.core.scroll.ScrollPane": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.layout.VBox": {}
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
   * Container, which provides scrolling in one dimension (vertical or horizontal).
   *
   * @childControl button-forward {qx.ui.form.RepeatButton} button to step forward
   * @childControl button-backward {qx.ui.form.RepeatButton} button to step backward
   * @childControl content {qx.ui.container.Composite} container to hold the content
   * @childControl scrollpane {qx.ui.core.scroll.ScrollPane} the scroll pane holds the content to enable scrolling
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create slide bar container
   *   slideBar = new qx.ui.container.SlideBar().set({
   *     width: 300
   *   });
   *
   *   // set layout
   *   slideBar.setLayout(new qx.ui.layout.HBox());
   *
   *   // add some widgets
   *   for (var i=0; i<10; i++)
   *   {
   *     slideBar.add((new qx.ui.core.Widget()).set({
   *       backgroundColor : (i % 2 == 0) ? "red" : "blue",
   *       width : 60
   *     }));
   *   }
   *
   *   this.getRoot().add(slideBar);
   * </pre>
   *
   * This example creates a SlideBar and add some widgets with alternating
   * background colors. Since the content is larger than the container, two
   * scroll buttons at the left and the right edge are shown.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/slidebar.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.SlideBar", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MRemoteLayoutHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param orientation {String?"horizontal"} The slide bar orientation
     */
    construct: function construct(orientation) {
      qx.ui.core.Widget.constructor.call(this);
      var scrollPane = this.getChildControl("scrollpane");

      this._add(scrollPane, {
        flex: 1
      });

      if (orientation != null) {
        this.setOrientation(orientation);
      } else {
        this.initOrientation();
      }

      this.addListener("roll", this._onRoll, this);
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
        init: "slidebar"
      },

      /** Orientation of the bar */
      orientation: {
        check: ["horizontal", "vertical"],
        init: "horizontal",
        apply: "_applyOrientation"
      },

      /** The number of pixels to scroll if the buttons are pressed */
      scrollStep: {
        check: "Integer",
        init: 15,
        themeable: true
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired on scroll animation end invoked by 'scroll*' methods. */
      scrollAnimationEnd: "qx.event.type.Event"
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
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("content");
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "button-forward":
            control = new qx.ui.form.RepeatButton();
            control.addListener("execute", this._onExecuteForward, this);
            control.setFocusable(false);

            this._addAt(control, 2);

            break;

          case "button-backward":
            control = new qx.ui.form.RepeatButton();
            control.addListener("execute", this._onExecuteBackward, this);
            control.setFocusable(false);

            this._addAt(control, 0);

            break;

          case "content":
            control = new qx.ui.container.Composite();
            this.getChildControl("scrollpane").add(control);
            break;

          case "scrollpane":
            control = new qx.ui.core.scroll.ScrollPane();
            control.addListener("update", this._onResize, this);
            control.addListener("scrollX", this._onScroll, this);
            control.addListener("scrollY", this._onScroll, this);
            control.addListener("scrollAnimationEnd", this._onScrollAnimationEnd, this);
            break;
        }

        return control || qx.ui.container.SlideBar.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        barLeft: true,
        barTop: true,
        barRight: true,
        barBottom: true
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC SCROLL API
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls the element's content by the given amount.
       *
       * @param offset {Integer?0} Amount to scroll
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollBy: function scrollBy(offset, duration) {
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          pane.scrollByX(offset, duration);
        } else {
          pane.scrollByY(offset, duration);
        }
      },

      /**
       * Scrolls the element's content to the given coordinate
       *
       * @param value {Integer} The position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollTo: function scrollTo(value, duration) {
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          pane.scrollToX(value, duration);
        } else {
          pane.scrollToY(value, duration);
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyEnabled: function _applyEnabled(value, old, name) {
        qx.ui.container.SlideBar.prototype._applyEnabled.base.call(this, value, old, name);

        this._updateArrowsEnabled();
      },
      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        var oldLayouts = [this.getLayout(), this._getLayout()];
        var buttonForward = this.getChildControl("button-forward");
        var buttonBackward = this.getChildControl("button-backward"); // old can also be null, so we have to check both explicitly to set
        // the states correctly.

        if (old == "vertical" && value == "horizontal") {
          buttonForward.removeState("vertical");
          buttonBackward.removeState("vertical");
          buttonForward.addState("horizontal");
          buttonBackward.addState("horizontal");
        } else if (old == "horizontal" && value == "vertical") {
          buttonForward.removeState("horizontal");
          buttonBackward.removeState("horizontal");
          buttonForward.addState("vertical");
          buttonBackward.addState("vertical");
        }

        if (value == "horizontal") {
          this._setLayout(new qx.ui.layout.HBox());

          this.setLayout(new qx.ui.layout.HBox());
        } else {
          this._setLayout(new qx.ui.layout.VBox());

          this.setLayout(new qx.ui.layout.VBox());
        }

        if (oldLayouts[0]) {
          oldLayouts[0].dispose();
        }

        if (oldLayouts[1]) {
          oldLayouts[1].dispose();
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls pane on roll events
       *
       * @param e {qx.event.type.Roll} the roll event
       */
      _onRoll: function _onRoll(e) {
        // only wheel and touch
        if (e.getPointerType() == "mouse") {
          return;
        }

        var delta = 0;
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          delta = e.getDelta().x;
          var position = pane.getScrollX();
          var max = pane.getScrollMaxX();
          var steps = parseInt(delta); // pass the event to the parent if both scrollbars are at the end

          if (!(steps < 0 && position <= 0 || steps > 0 && position >= max || delta == 0)) {
            e.stop();
          } else {
            e.stopMomentum();
          }
        } else {
          delta = e.getDelta().y;
          var position = pane.getScrollY();
          var max = pane.getScrollMaxY();
          var steps = parseInt(delta); // pass the event to the parent if both scrollbars are at the end

          if (!(steps < 0 && position <= 0 || steps > 0 && position >= max || delta == 0)) {
            e.stop();
          } else {
            e.stopMomentum();
          }
        }

        this.scrollBy(parseInt(delta, 10)); // block all momentum scrolling

        if (e.getMomentum()) {
          e.stop();
        }
      },

      /**
       * Update arrow enabled state after scrolling
       */
      _onScroll: function _onScroll() {
        this._updateArrowsEnabled();
      },

      /**
       * Handler to fire the 'scrollAnimationEnd' event.
       */
      _onScrollAnimationEnd: function _onScrollAnimationEnd() {
        this.fireEvent("scrollAnimationEnd");
      },

      /**
       * Listener for resize event. This event is fired after the
       * first flush of the element which leads to another queuing
       * when the changes modify the visibility of the scroll buttons.
       *
       * @param e {Event} Event object
       */
      _onResize: function _onResize(e) {
        var content = this.getChildControl("scrollpane").getChildren()[0];

        if (!content) {
          return;
        }

        var innerSize = this.getInnerSize();
        var contentSize = content.getBounds();
        var overflow = this.getOrientation() === "horizontal" ? contentSize.width > innerSize.width : contentSize.height > innerSize.height;

        if (overflow) {
          this._showArrows();

          this._updateArrowsEnabled();
        } else {
          this._hideArrows();
        }
      },

      /**
       * Scroll handler for left scrolling
       *
       */
      _onExecuteBackward: function _onExecuteBackward() {
        this.scrollBy(-this.getScrollStep());
      },

      /**
       * Scroll handler for right scrolling
       *
       */
      _onExecuteForward: function _onExecuteForward() {
        this.scrollBy(this.getScrollStep());
      },

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Update arrow enabled state
       */
      _updateArrowsEnabled: function _updateArrowsEnabled() {
        // set the disables state directly because we are overriding the
        // inheritance
        if (!this.getEnabled()) {
          this.getChildControl("button-backward").setEnabled(false);
          this.getChildControl("button-forward").setEnabled(false);
          return;
        }

        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          var position = pane.getScrollX();
          var max = pane.getScrollMaxX();
        } else {
          var position = pane.getScrollY();
          var max = pane.getScrollMaxY();
        }

        this.getChildControl("button-backward").setEnabled(position > 0);
        this.getChildControl("button-forward").setEnabled(position < max);
      },

      /**
       * Show the arrows (Called from resize event)
       *
       */
      _showArrows: function _showArrows() {
        this._showChildControl("button-forward");

        this._showChildControl("button-backward");
      },

      /**
       * Hide the arrows (Called from resize event)
       *
       */
      _hideArrows: function _hideArrows() {
        this._excludeChildControl("button-forward");

        this._excludeChildControl("button-backward");

        this.scrollTo(0);
      }
    }
  });
  qx.ui.container.SlideBar.$$dbClassInfo = $$dbClassInfo;
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
   * This interface should be used in all objects managing a set of items
   * implementing {@link qx.ui.form.IModel}.
   */
  qx.Interface.define("qx.ui.form.IModelSelection", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Tries to set the selection using the given array containing the
       * representative models for the selectables.
       *
       * @param value {Array} An array of models.
       */
      setModelSelection: function setModelSelection(value) {},

      /**
       * Returns an array of the selected models.
       *
       * @return {Array} An array containing the models of the currently selected
       *   items.
       */
      getModelSelection: function getModelSelection() {}
    }
  });
  qx.ui.form.IModelSelection.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.data.Array": {
        "construct": true
      },
      "qx.lang.Array": {}
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
   * This mixin offers the selection of the model properties.
   * It can only be included if the object including it implements the
   * {@link qx.ui.core.ISingleSelection} interface and the selectables implement
   * the {@link qx.ui.form.IModel} interface.
   */
  qx.Mixin.define("qx.ui.form.MModelSelection", {
    construct: function construct() {
      // create the selection array
      this.__modelSelection = new qx.data.Array(); // listen to the changes

      this.__modelSelection.addListener("change", this.__onModelSelectionArrayChange, this);

      this.addListener("changeSelection", this.__onModelSelectionChange, this);
    },
    events: {
      /**
       * Pseudo event. It will never be fired because the array itself can not
       * be changed. But the event description is needed for the data binding.
       */
      changeModelSelection: "qx.event.type.Data"
    },
    members: {
      __modelSelection: null,
      __inSelectionChange: false,

      /**
       * Handler for the selection change of the including class e.g. SelectBox,
       * List, ...
       * It sets the new modelSelection via {@link #setModelSelection}.
       */
      __onModelSelectionChange: function __onModelSelectionChange() {
        if (this.__inSelectionChange) {
          return;
        }

        var data = this.getSelection(); // create the array with the modes inside

        var modelSelection = [];

        for (var i = 0; i < data.length; i++) {
          var item = data[i]; // fallback if getModel is not implemented

          var model = item.getModel ? item.getModel() : null;

          if (model !== null) {
            modelSelection.push(model);
          }
        }

        try {
          this.setModelSelection(modelSelection);
        } catch (e) {
          throw new Error("Could not set the model selection. Maybe your models are not unique? " + e);
        }
      },

      /**
       * Listener for the change of the internal model selection data array.
       */
      __onModelSelectionArrayChange: function __onModelSelectionArrayChange() {
        this.__inSelectionChange = true;
        var selectables = this.getSelectables(true);
        var itemSelection = [];

        var modelSelection = this.__modelSelection.toArray();

        for (var i = 0; i < modelSelection.length; i++) {
          var model = modelSelection[i];

          for (var j = 0; j < selectables.length; j++) {
            var selectable = selectables[j]; // fallback if getModel is not implemented

            var selectableModel = selectable.getModel ? selectable.getModel() : null;

            if (model === selectableModel) {
              itemSelection.push(selectable);
              break;
            }
          }
        }

        this.setSelection(itemSelection);
        this.__inSelectionChange = false; // check if the setting has worked

        var currentSelection = this.getSelection();

        if (!qx.lang.Array.equals(currentSelection, itemSelection)) {
          // if not, set the actual selection
          this.__onModelSelectionChange();
        }
      },

      /**
       * Returns always an array of the models of the selected items. If no
       * item is selected or no model is given, the array will be empty.
       *
       * *CAREFUL!* The model selection can only work if every item item in the
       * selection providing widget has a model property!
       *
       * @return {qx.data.Array} An array of the models of the selected items.
       */
      getModelSelection: function getModelSelection() {
        return this.__modelSelection;
      },

      /**
       * Takes the given models in the array and searches for the corresponding
       * selectables. If an selectable does have that model attached, it will be
       * selected.
       *
       * *Attention:* This method can have a time complexity of O(n^2)!
       *
       * *CAREFUL!* The model selection can only work if every item item in the
       * selection providing widget has a model property!
       *
       * @param modelSelection {Array} An array of models, which should be
       *   selected.
       */
      setModelSelection: function setModelSelection(modelSelection) {
        // check for null values
        if (!modelSelection) {
          this.__modelSelection.removeAll();

          return;
        }

        {
          this.assertArray(modelSelection, "Please use an array as parameter.");
        } // add the first two parameter

        modelSelection.unshift(this.__modelSelection.getLength()); // remove index

        modelSelection.unshift(0); // start index

        var returnArray = this.__modelSelection.splice.apply(this.__modelSelection, modelSelection);

        returnArray.dispose();
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__modelSelection");
    }
  });
  qx.ui.form.MModelSelection.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.ISingleSelection": {
        "require": true
      },
      "qx.ui.form.IField": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.IModelSelection": {
        "require": true
      },
      "qx.ui.core.MSingleSelectionHandling": {
        "require": true
      },
      "qx.ui.form.MModelSelection": {
        "require": true
      },
      "qx.lang.String": {},
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The radio group handles a collection of items from which only one item
   * can be selected. Selection another item will deselect the previously selected
   * item.
   *
   * This class is e.g. used to create radio groups or {@link qx.ui.form.RadioButton}
   * or {@link qx.ui.toolbar.RadioButton} instances.
   *
   * We also offer a widget for the same purpose which uses this class. So if
   * you like to act with a widget instead of a pure logic coupling of the
   * widgets, take a look at the {@link qx.ui.form.RadioButtonGroup} widget.
   */
  qx.Class.define("qx.ui.form.RadioGroup", {
    extend: qx.core.Object,
    implement: [qx.ui.core.ISingleSelection, qx.ui.form.IField, qx.ui.form.IForm, qx.ui.form.IModelSelection],
    include: [qx.ui.core.MSingleSelectionHandling, qx.ui.form.MModelSelection],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param varargs {qx.core.Object} A variable number of items, which are
     *     initially added to the radio group, the first item will be selected.
     */
    construct: function construct(varargs) {
      qx.core.Object.constructor.call(this); // create item array

      this.__items = []; // add listener before call add!!!

      this.addListener("changeSelection", this.__onChangeSelection, this);

      if (varargs != null) {
        this.add.apply(this, arguments);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The property name in each of the added widgets that is grouped
       */
      groupedProperty: {
        check: "String",
        apply: "_applyGroupedProperty",
        event: "changeGroupedProperty",
        init: "value"
      },

      /**
       * The property name in each of the added widgets that is informed of the
       * RadioGroup object it is a member of
       */
      groupProperty: {
        check: "String",
        event: "changeGroupProperty",
        init: "group"
      },

      /**
       * Whether the radio group is enabled
       */
      enabled: {
        check: "Boolean",
        apply: "_applyEnabled",
        event: "changeEnabled",
        init: true
      },

      /**
       * Whether the selection should wrap around. This means that the successor of
       * the last item is the first item.
       */
      wrap: {
        check: "Boolean",
        init: true
      },

      /**
       * If is set to <code>true</code> the selection could be empty,
       * otherwise is always one <code>RadioButton</code> selected.
       */
      allowEmptySelection: {
        check: "Boolean",
        init: false,
        apply: "_applyAllowEmptySelection"
      },

      /**
       * Flag signaling if the group at all is valid. All children will have the
       * same state.
       */
      valid: {
        check: "Boolean",
        init: true,
        apply: "_applyValid",
        event: "changeValid"
      },

      /**
       * Flag signaling if the group is required.
       */
      required: {
        check: "Boolean",
        init: false,
        event: "changeRequired"
      },

      /**
       * Message which is shown in an invalid tooltip.
       */
      invalidMessage: {
        check: "String",
        init: "",
        event: "changeInvalidMessage",
        apply: "_applyInvalidMessage"
      },

      /**
       * Message which is shown in an invalid tooltip if the {@link #required} is
       * set to true.
       */
      requiredInvalidMessage: {
        check: "String",
        nullable: true,
        event: "changeInvalidMessage"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.form.IRadioItem[]} The items of the radio group */
      __items: null,

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Get all managed items
       *
       * @return {qx.ui.form.IRadioItem[]} All managed items.
       */
      getItems: function getItems() {
        return this.__items;
      },

      /*
      ---------------------------------------------------------------------------
        REGISTRY
      ---------------------------------------------------------------------------
      */

      /**
       * Add the passed items to the radio group.
       *
       * @param varargs {qx.ui.form.IRadioItem} A variable number of items to add.
       */
      add: function add(varargs) {
        var items = this.__items;
        var item;
        var groupedProperty = this.getGroupedProperty();
        var groupedPropertyUp = qx.lang.String.firstUp(groupedProperty);

        for (var i = 0, l = arguments.length; i < l; i++) {
          item = arguments[i];

          if (items.includes(item)) {
            continue;
          } // Register listeners


          item.addListener("change" + groupedPropertyUp, this._onItemChangeChecked, this); // Push RadioButton to array

          items.push(item); // Inform radio button about new group

          item.set(this.getGroupProperty(), this); // Need to update internal value?

          if (item.get(groupedProperty)) {
            this.setSelection([item]);
          }
        } // Select first item when only one is registered


        if (!this.isAllowEmptySelection() && items.length > 0 && !this.getSelection()[0]) {
          this.setSelection([items[0]]);
        }
      },

      /**
       * Remove an item from the radio group.
       *
       * @param item {qx.ui.form.IRadioItem} The item to remove.
       */
      remove: function remove(item) {
        var items = this.__items;
        var groupedProperty = this.getGroupedProperty();
        var groupedPropertyUp = qx.lang.String.firstUp(groupedProperty);

        if (items.includes(item)) {
          // Remove RadioButton from array
          qx.lang.Array.remove(items, item); // Inform radio button about new group

          if (item.get(this.getGroupProperty()) === this) {
            item.reset(this.getGroupProperty());
          } // Deregister listeners


          item.removeListener("change" + groupedPropertyUp, this._onItemChangeChecked, this); // if the radio was checked, set internal selection to null

          if (item.get(groupedProperty)) {
            this.resetSelection();
          }
        }
      },

      /**
       * Returns an array containing the group's items.
       *
       * @return {qx.ui.form.IRadioItem[]} The item array
       */
      getChildren: function getChildren() {
        return this.__items;
      },

      /*
      ---------------------------------------------------------------------------
        LISTENER FOR ITEM CHANGES
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>changeValue</code> event of every managed item.
       *
       * @param e {qx.event.type.Data} Data event
       */
      _onItemChangeChecked: function _onItemChangeChecked(e) {
        var item = e.getTarget();
        var groupedProperty = this.getGroupedProperty();

        if (item.get(groupedProperty)) {
          this.setSelection([item]);
        } else if (this.getSelection()[0] == item) {
          this.resetSelection();
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyGroupedProperty: function _applyGroupedProperty(value, old) {
        var item;
        var oldFirstUp = qx.lang.String.firstUp(old);
        var newFirstUp = qx.lang.String.firstUp(value);

        for (var i = 0; i < this.__items.length; i++) {
          item = this.__items[i]; // remove the listener for the old change event

          item.removeListener("change" + oldFirstUp, this._onItemChangeChecked, this); // add the listener for the new change event

          item.removeListener("change" + newFirstUp, this._onItemChangeChecked, this);
        }
      },
      // property apply
      _applyInvalidMessage: function _applyInvalidMessage(value, old) {
        for (var i = 0; i < this.__items.length; i++) {
          this.__items[i].setInvalidMessage(value);
        }
      },
      // property apply
      _applyValid: function _applyValid(value, old) {
        for (var i = 0; i < this.__items.length; i++) {
          this.__items[i].setValid(value);
        }
      },
      // property apply
      _applyEnabled: function _applyEnabled(value, old) {
        var items = this.__items;

        if (value == null) {
          for (var i = 0, l = items.length; i < l; i++) {
            items[i].resetEnabled();
          }
        } else {
          for (var i = 0, l = items.length; i < l; i++) {
            items[i].setEnabled(value);
          }
        }
      },
      // property apply
      _applyAllowEmptySelection: function _applyAllowEmptySelection(value, old) {
        if (!value && this.isSelectionEmpty()) {
          this.resetSelection();
        }
      },

      /*
      ---------------------------------------------------------------------------
        SELECTION
      ---------------------------------------------------------------------------
      */

      /**
       * Select the item following the given item.
       */
      selectNext: function selectNext() {
        var item = this.getSelection()[0];
        var items = this.__items;
        var index = items.indexOf(item);

        if (index == -1) {
          return;
        }

        var i = 0;
        var length = items.length; // Find next enabled item

        if (this.getWrap()) {
          index = (index + 1) % length;
        } else {
          index = Math.min(index + 1, length - 1);
        }

        while (i < length && !items[index].getEnabled()) {
          index = (index + 1) % length;
          i++;
        }

        this.setSelection([items[index]]);
      },

      /**
       * Select the item previous the given item.
       */
      selectPrevious: function selectPrevious() {
        var item = this.getSelection()[0];
        var items = this.__items;
        var index = items.indexOf(item);

        if (index == -1) {
          return;
        }

        var i = 0;
        var length = items.length; // Find previous enabled item

        if (this.getWrap()) {
          index = (index - 1 + length) % length;
        } else {
          index = Math.max(index - 1, 0);
        }

        while (i < length && !items[index].getEnabled()) {
          index = (index - 1 + length) % length;
          i++;
        }

        this.setSelection([items[index]]);
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS FOR SELECTION API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the items for the selection.
       *
       * @return {qx.ui.form.IRadioItem[]} Items to select.
       */
      _getItems: function _getItems() {
        return this.getItems();
      },

      /**
       * Returns if the selection could be empty or not.
       *
       * @return {Boolean} <code>true</code> If selection could be empty,
       *    <code>false</code> otherwise.
       */
      _isAllowEmptySelection: function _isAllowEmptySelection() {
        return this.isAllowEmptySelection();
      },

      /**
       * Returns whether the item is selectable. In opposite to the default
       * implementation (which checks for visible items) every radio button
       * which is part of the group is selected even if it is currently not visible.
       *
       * @param item {qx.ui.form.IRadioItem} The item to check if its selectable.
       * @return {Boolean} <code>true</code> if the item is part of the radio group
       *    <code>false</code> otherwise.
       */
      _isItemSelectable: function _isItemSelectable(item) {
        return this.__items.indexOf(item) != -1;
      },

      /**
       * Event handler for <code>changeSelection</code>.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      __onChangeSelection: function __onChangeSelection(e) {
        var value = e.getData()[0];
        var old = e.getOldData()[0];
        var groupedProperty = this.getGroupedProperty();

        if (old) {
          old.set(groupedProperty, false);
        }

        if (value) {
          value.set(groupedProperty, true);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeArray("__items");
    }
  });
  qx.ui.form.RadioGroup.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-25.js.map
