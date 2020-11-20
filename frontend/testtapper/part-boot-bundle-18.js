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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Can be included for implementing {@link qx.ui.form.IModel}. It only contains
   * a nullable property named 'model' with a 'changeModel' event.
   */
  qx.Mixin.define("qx.ui.form.MModelProperty", {
    properties: {
      /**
       * Model property for storing additional information for the including
       * object. It can act as value property on form items for example.
       *
       * Be careful using that property as this is used for the
       * {@link qx.ui.form.MModelSelection} it has some restrictions:
       *
       * * Don't use equal models in one widget using the
       *     {@link qx.ui.form.MModelSelection}.
       *
       * * Avoid setting only some model properties if the widgets are added to
       *     a {@link qx.ui.form.MModelSelection} widget.
       *
       * Both restrictions result of the fact, that the set models are deputies
       * for their widget.
       */
      model: {
        nullable: true,
        event: "changeModel",
        apply: "_applyModel",
        dereference: true
      }
    },
    members: {
      // apply method
      _applyModel: function _applyModel(value, old) {// Empty implementation
      }
    }
  });
  qx.ui.form.MModelProperty.$$dbClassInfo = $$dbClassInfo;
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
   * Each object which wants to store data representative for the real item
   * should implement this interface.
   */
  qx.Interface.define("qx.ui.form.IModel", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the model data changes */
      "changeModel": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set the representative data for the item.
       *
       * @param value {var} The data.
       */
      setModel: function setModel(value) {},

      /**
       * Returns the representative data for the item
       *
       * @return {var} The data.
       */
      getModel: function getModel() {},

      /**
       * Sets the representative data to null.
       */
      resetModel: function resetModel() {}
    }
  });
  qx.ui.form.IModel.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.MModelProperty": {
        "require": true
      },
      "qx.ui.form.IModel": {
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.basic.Label": {},
      "qx.ui.basic.Image": {},
      "qx.ui.tree.core.FolderOpenButton": {},
      "qx.ui.core.Spacer": {},
      "qx.util.PropertyUtil": {}
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Derrell Lipman (derrell)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * The AbstractItem serves as a common superclass for the {@link
   * qx.ui.tree.core.AbstractTreeItem} and {@link qx.ui.tree.VirtualTreeItem} classes.
   *
   * @childControl label {qx.ui.basic.Label} label of the tree item
   * @childControl icon {qx.ui.basic.Image} icon of the tree item
   * @childControl open {qx.ui.tree.core.FolderOpenButton} button to open/close a subtree
   */
  qx.Class.define("qx.ui.tree.core.AbstractItem", {
    extend: qx.ui.core.Widget,
    type: "abstract",
    include: [qx.ui.form.MModelProperty],
    implement: [qx.ui.form.IModel],

    /**
     * @param label {String?null} The tree item's caption text
     */
    construct: function construct(label) {
      qx.ui.core.Widget.constructor.call(this);

      if (label != null) {
        this.setLabel(label);
      }

      this._setLayout(new qx.ui.layout.HBox());

      this._addWidgets();

      this.initOpen();
    },
    properties: {
      /**
       * Whether the tree item is opened.
       */
      open: {
        check: "Boolean",
        init: false,
        event: "changeOpen",
        apply: "_applyOpen"
      },

      /**
       * Controls, when to show the open symbol. If the mode is "auto" , the open
       * symbol is shown only if the item has child items.
       */
      openSymbolMode: {
        check: ["always", "never", "auto"],
        init: "auto",
        event: "changeOpenSymbolMode",
        apply: "_applyOpenSymbolMode"
      },

      /**
       * The number of pixel to indent the tree item for each level.
       */
      indent: {
        check: "Integer",
        init: 19,
        apply: "_applyIndent",
        event: "changeIndent",
        themeable: true
      },

      /**
       * URI of "closed" icon. Can be any URI String supported by qx.ui.basic.Image.
       **/
      icon: {
        check: "String",
        apply: "_applyIcon",
        event: "changeIcon",
        nullable: true,
        themeable: true
      },

      /**
       * URI of "opened" icon. Can be any URI String supported by qx.ui.basic.Image.
       **/
      iconOpened: {
        check: "String",
        apply: "_applyIconOpened",
        event: "changeIconOpened",
        nullable: true,
        themeable: true
      },

      /**
       * The label/caption/text
       */
      label: {
        check: "String",
        apply: "_applyLabel",
        event: "changeLabel",
        init: ""
      }
    },
    members: {
      __labelAdded: null,
      __iconAdded: null,
      __spacer: null,

      /**
       * This method configures the tree item by adding its sub widgets like
       * label, icon, open symbol, ...
       *
       * This method must be overridden by sub classes.
       */
      _addWidgets: function _addWidgets() {
        throw new Error("Abstract method call.");
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "label":
            control = new qx.ui.basic.Label().set({
              alignY: "middle",
              anonymous: true,
              value: this.getLabel()
            });
            break;

          case "icon":
            control = new qx.ui.basic.Image().set({
              alignY: "middle",
              anonymous: true,
              source: this.getIcon()
            });
            break;

          case "open":
            control = new qx.ui.tree.core.FolderOpenButton().set({
              alignY: "middle"
            });
            control.addListener("changeOpen", this._onChangeOpen, this);
            control.addListener("resize", this._updateIndent, this);
            break;
        }

        return control || qx.ui.tree.core.AbstractItem.prototype._createChildControlImpl.base.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        TREE ITEM CONFIGURATION
      ---------------------------------------------------------------------------
      */

      /**
       * Adds a sub widget to the tree item's horizontal box layout.
       *
       * @param widget {qx.ui.core.Widget} The widget to add
       * @param options {Map?null} The (optional) layout options to use for the widget
       */
      addWidget: function addWidget(widget, options) {
        this._add(widget, options);
      },

      /**
       * Adds the spacer used to render the indentation to the item's horizontal
       * box layout. If the spacer has been added before, it is removed from its
       * old position and added to the end of the layout.
       */
      addSpacer: function addSpacer() {
        if (!this.__spacer) {
          this.__spacer = new qx.ui.core.Spacer();
        } else {
          this._remove(this.__spacer);
        }

        this._add(this.__spacer);
      },

      /**
       * Adds the open button to the item's horizontal box layout. If the open
       * button has been added before, it is removed from its old position and
       * added to the end of the layout.
       */
      addOpenButton: function addOpenButton() {
        this._add(this.getChildControl("open"));
      },

      /**
       * Event handler, which listens to open state changes of the open button
       *
       * @param e {qx.event.type.Data} The event object
       */
      _onChangeOpen: function _onChangeOpen(e) {
        if (this.isOpenable()) {
          this.setOpen(e.getData());
        }
      },

      /**
       * Adds the icon widget to the item's horizontal box layout. If the icon
       * widget has been added before, it is removed from its old position and
       * added to the end of the layout.
       */
      addIcon: function addIcon() {
        var icon = this.getChildControl("icon");

        if (this.__iconAdded) {
          this._remove(icon);
        }

        this._add(icon);

        this.__iconAdded = true;
      },

      /**
       * Adds the label to the item's horizontal box layout. If the label
       * has been added before, it is removed from its old position and
       * added to the end of the layout.
       *
       * @param text {String?0} The label's contents
       */
      addLabel: function addLabel(text) {
        var label = this.getChildControl("label");

        if (this.__labelAdded) {
          this._remove(label);
        }

        if (text) {
          this.setLabel(text);
        } else {
          label.setValue(this.getLabel());
        }

        this._add(label);

        this.__labelAdded = true;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        // Set "closed" icon - even when "opened" - if no "opened" icon was
        // user-defined
        if (!this.__getUserValueIconOpened()) {
          this.__setIconSource(value);
        } else if (!this.isOpen()) {
          this.__setIconSource(value);
        }
      },
      // property apply
      _applyIconOpened: function _applyIconOpened(value, old) {
        if (this.isOpen()) {
          // ... both "closed" and "opened" icon were user-defined
          if (this.__getUserValueIcon() && this.__getUserValueIconOpened()) {
            this.__setIconSource(value);
          } // .. only "opened" icon was user-defined
          else if (!this.__getUserValueIcon() && this.__getUserValueIconOpened()) {
              this.__setIconSource(value);
            }
        }
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        var label = this.getChildControl("label", true);

        if (label) {
          label.setValue(value);
        }
      },
      // property apply
      _applyOpen: function _applyOpen(value, old) {
        var open = this.getChildControl("open", true);

        if (open) {
          open.setOpen(value);
        } //
        // Determine source of icon for "opened" or "closed" state
        //


        var source; // Opened

        if (value) {
          // Never overwrite user-defined icon with themed "opened" icon
          source = this.__getUserValueIconOpened() ? this.getIconOpened() : null;
        } // Closed
        else {
            source = this.getIcon();
          }

        if (source) {
          this.__setIconSource(source);
        }

        value ? this.addState("opened") : this.removeState("opened");
      },

      /**
      * Get user-defined value of "icon" property
      *
      * @return {var} The user value of the property "icon"
      */
      __getUserValueIcon: function __getUserValueIcon() {
        return qx.util.PropertyUtil.getUserValue(this, "icon");
      },

      /**
      * Get user-defined value of "iconOpened" property
      *
      * @return {var} The user value of the property "iconOpened"
      */
      __getUserValueIconOpened: function __getUserValueIconOpened() {
        return qx.util.PropertyUtil.getUserValue(this, "iconOpened");
      },

      /**
      * Set source of icon child control
      *
      * @param url {String} The URL of the icon
      */
      __setIconSource: function __setIconSource(url) {
        var icon = this.getChildControl("icon", true);

        if (icon) {
          icon.setSource(url);
        }
      },

      /*
      ---------------------------------------------------------------------------
        INDENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Whether the tree item can be opened.
       *
       * @return {Boolean} Whether the tree item can be opened.
       */
      isOpenable: function isOpenable() {
        var openMode = this.getOpenSymbolMode();
        return openMode === "always" || openMode === "auto" && this.hasChildren();
      },

      /**
       * Whether the open symbol should be shown
       *
       * @return {Boolean} Whether the open symbol should be shown.
       */
      _shouldShowOpenSymbol: function _shouldShowOpenSymbol() {
        throw new Error("Abstract method call.");
      },
      // property apply
      _applyOpenSymbolMode: function _applyOpenSymbolMode(value, old) {
        this._updateIndent();
      },

      /**
       * Update the indentation of the tree item.
       */
      _updateIndent: function _updateIndent() {
        var openWidth = 0;
        var open = this.getChildControl("open", true);

        if (open) {
          if (this._shouldShowOpenSymbol()) {
            open.show();
            var openBounds = open.getBounds();

            if (openBounds) {
              openWidth = openBounds.width;
            } else {
              return;
            }
          } else {
            open.exclude();
          }
        }

        if (this.__spacer) {
          this.__spacer.setWidth((this.getLevel() + 1) * this.getIndent() - openWidth);
        }
      },
      // property apply
      _applyIndent: function _applyIndent(value, old) {
        this._updateIndent();
      },

      /**
       * Computes the item's nesting level. If the item is not part of a tree
       * this function will return <code>null</code>.
       *
       * @return {Integer|null} The item's nesting level or <code>null</code>.
       */
      getLevel: function getLevel() {
        throw new Error("Abstract method call.");
      },
      // overridden
      syncWidget: function syncWidget(jobs) {
        this._updateIndent();
      },

      /**
       * Whether the item has any children
       *
       * @return {Boolean} Whether the item has any children.
       */
      hasChildren: function hasChildren() {
        throw new Error("Abstract method call.");
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__spacer");
    }
  });
  qx.ui.tree.core.AbstractItem.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.tree.core.AbstractItem": {
        "require": true
      },
      "qx.ui.tree.core.Util": {},
      "qx.lang.String": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * The tree item is a tree element for the {@link VirtualTree}, which can have
   * nested tree elements.
   */
  qx.Class.define("qx.ui.tree.VirtualTreeItem", {
    extend: qx.ui.tree.core.AbstractItem,
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "virtual-tree-folder"
      }
    },
    members: {
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        selected: true
      },
      // overridden
      _addWidgets: function _addWidgets() {
        this.addSpacer();
        this.addOpenButton();
        this.addIcon();
        this.addLabel();
      },
      // overridden
      _shouldShowOpenSymbol: function _shouldShowOpenSymbol() {
        var open = this.getChildControl("open", true);

        if (open == null) {
          return false;
        }

        return this.isOpenable();
      },
      // overridden
      getLevel: function getLevel() {
        return this.getUserData("cell.level");
      },
      // overridden
      hasChildren: function hasChildren() {
        var model = this.getModel();
        var childProperty = this.getUserData("cell.childProperty");
        var showLeafs = this.getUserData("cell.showLeafs");
        return qx.ui.tree.core.Util.hasChildren(model, childProperty, !showLeafs);
      },
      // apply method
      _applyModel: function _applyModel(value, old) {
        var childProperty = this.getUserData("cell.childProperty");
        var showLeafs = this.getUserData("cell.showLeafs");

        if (value != null && qx.ui.tree.core.Util.isNode(value, childProperty)) {
          var eventType = "change" + qx.lang.String.firstUp(childProperty); // listen to children property changes

          if (qx.Class.hasProperty(value.constructor, childProperty)) {
            value.addListener(eventType, this._onChangeChildProperty, this);
          } // children property has been set already, immediately add
          // listener for indent updating


          if (qx.ui.tree.core.Util.hasChildren(value, childProperty, !showLeafs)) {
            value.get(childProperty).addListener("changeLength", this._onChangeLength, this);

            this._updateIndent();
          }
        }

        if (old != null && qx.ui.tree.core.Util.isNode(old, childProperty)) {
          var eventType = "change" + qx.lang.String.firstUp(childProperty);
          old.removeListener(eventType, this._onChangeChildProperty, this);
          var oldChildren = old.get(childProperty);

          if (oldChildren) {
            oldChildren.removeListener("changeLength", this._onChangeLength, this);
          }
        }
      },

      /**
       * Handler to update open/close icon when model length changed.
       */
      _onChangeLength: function _onChangeLength() {
        this._updateIndent();
      },

      /**
       * Handler to add listener to array of children property.
       *
       * @param e {qx.event.type.Data} Data event; provides children array
       */
      _onChangeChildProperty: function _onChangeChildProperty(e) {
        var children = e.getData();
        var old = e.getOldData();

        if (children) {
          this._updateIndent();

          children.addListener("changeLength", this._onChangeLength, this);
        }

        if (old) {
          old.removeListener("changeLength", this._onChangeLength, this);
        }
      }
    }
  });
  qx.ui.tree.VirtualTreeItem.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-18.js.map
