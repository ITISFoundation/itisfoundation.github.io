(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.selection.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.ui.virtual.core.Pane": {
        "construct": true
      },
      "qx.bom.element.Location": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * Abstract base class for selection manager, which manage selectable items
   * rendered in a virtual {@link qx.ui.virtual.core.Pane}.
   */
  qx.Class.define("qx.ui.virtual.selection.Abstract", {
    extend: qx.ui.core.selection.Abstract,

    /*
     *****************************************************************************
        CONSTRUCTOR
     *****************************************************************************
     */

    /**
     * @param pane {qx.ui.virtual.core.Pane} The virtual pane on which the
     *    selectable item are rendered
     * @param selectionDelegate {qx.ui.virtual.selection.ISelectionDelegate?null} An optional delegate,
     *    which can be used to customize the behavior of the selection manager
     *    without sub classing it.
     */
    construct: function construct(pane, selectionDelegate) {
      qx.ui.core.selection.Abstract.constructor.call(this);
      {
        this.assertInstance(pane, qx.ui.virtual.core.Pane);
      }
      this._pane = pane;
      this._delegate = selectionDelegate || {};
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // Determines if automatically scrolling of selected item into view is active.
      _autoScrollIntoView: true,

      /*
      ---------------------------------------------------------------------------
        DELEGATE METHODS
      ---------------------------------------------------------------------------
      */
      // overridden
      _isSelectable: function _isSelectable(item) {
        return this._delegate.isItemSelectable ? this._delegate.isItemSelectable(item) : true;
      },
      // overridden
      _styleSelectable: function _styleSelectable(item, type, enabled) {
        if (this._delegate.styleSelectable) {
          this._delegate.styleSelectable(item, type, enabled);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Attach pointer events to the managed pane.
       */
      attachPointerEvents: function attachPointerEvents() {
        var paneElement = this._pane.getContentElement();

        paneElement.addListener("pointerdown", this.handlePointerDown, this);
        paneElement.addListener("tap", this.handleTap, this);
        paneElement.addListener("pointerover", this.handlePointerOver, this);
        paneElement.addListener("pointermove", this.handlePointerMove, this);
        paneElement.addListener("losecapture", this.handleLoseCapture, this);
      },

      /**
       * Detach pointer events from the managed pane.
       */
      detatchPointerEvents: function detatchPointerEvents() {
        var paneElement = this._pane.getContentElement();

        paneElement.removeListener("pointerdown", this.handlePointerDown, this);
        paneElement.removeListener("tap", this.handleTap, this);
        paneElement.removeListener("pointerover", this.handlePointerOver, this);
        paneElement.removeListener("pointermove", this.handlePointerMove, this);
        paneElement.removeListener("losecapture", this.handleLoseCapture, this);
      },

      /**
       * Attach key events to manipulate the selection using the keyboard. The
       * event target doesn't need to be the pane itself. It can be an widget,
       * which received key events. Usually the key event target is the
       * {@link qx.ui.virtual.core.Scroller}.
       *
       * @param target {qx.core.Object} the key event target.
       *
       */
      attachKeyEvents: function attachKeyEvents(target) {
        target.addListener("keypress", this.handleKeyPress, this);
      },

      /**
       * Detach key events.
       *
       * @param target {qx.core.Object} the key event target.
       */
      detachKeyEvents: function detachKeyEvents(target) {
        target.removeListener("keypress", this.handleKeyPress, this);
      },

      /**
       * Attach list events. The selection mode <code>one</code> need to know,
       * when selectable items are added or removed. If this mode is used the
       * <code>list</code> parameter must fire <code>addItem</code> and
       * <code>removeItem</code> events.
       *
       * @param list {qx.core.Object} the event target for <code>addItem</code> and
       *    <code>removeItem</code> events
       */
      attachListEvents: function attachListEvents(list) {
        list.addListener("addItem", this.handleAddItem, this);
        list.addListener("removeItem", this.handleRemoveItem, this);
      },

      /**
       * Detach list events.
       *
       * @param list {qx.core.Object} the event target for <code>addItem</code> and
       *    <code>removeItem</code> events
       */
      detachListEvents: function detachListEvents(list) {
        list.removeListener("addItem", this.handleAddItem, this);
        list.removeListener("removeItem", this.handleRemoveItem, this);
      },

      /*
      ---------------------------------------------------------------------------
        IMPLEMENT ABSTRACT METHODS
      ---------------------------------------------------------------------------
      */
      // overridden
      _capture: function _capture() {
        this._pane.capture();
      },
      // overridden
      _releaseCapture: function _releaseCapture() {
        this._pane.releaseCapture();
      },
      // overridden
      _getScroll: function _getScroll() {
        return {
          left: this._pane.getScrollX(),
          top: this._pane.getScrollY()
        };
      },
      // overridden
      _scrollBy: function _scrollBy(xoff, yoff) {
        this._pane.setScrollX(this._pane.getScrollX() + xoff);

        this._pane.setScrollY(this._pane.getScrollY() + yoff);
      },
      // overridden
      _getLocation: function _getLocation() {
        var elem = this._pane.getContentElement().getDomElement();

        return elem ? qx.bom.element.Location.get(elem) : null;
      },
      // overridden
      _getDimension: function _getDimension() {
        return this._pane.getInnerSize();
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this._pane = this._delegate = null;
    }
  });
  qx.ui.virtual.selection.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.selection.Abstract": {
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
       * Fabian Jakobs (fjakobs)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * Row selection manager
   */
  qx.Class.define("qx.ui.virtual.selection.Row", {
    extend: qx.ui.virtual.selection.Abstract,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns the number of all items in the pane. This number may contain
       * unselectable items as well.
       *
       * @return {Integer} number of items
       */
      _getItemCount: function _getItemCount() {
        return this._pane.getRowConfig().getItemCount();
      },

      /*
      ---------------------------------------------------------------------------
        IMPLEMENT ABSTRACT METHODS
      ---------------------------------------------------------------------------
      */
      // overridden
      _getSelectableFromPointerEvent: function _getSelectableFromPointerEvent(event) {
        var cell = this._pane.getCellAtPosition(event.getDocumentLeft(), event.getDocumentTop());

        if (!cell) {
          return null;
        }

        return this._isSelectable(cell.row) ? cell.row : null;
      },
      // overridden
      getSelectables: function getSelectables(all) {
        var selectables = [];

        for (var i = 0, l = this._getItemCount(); i < l; i++) {
          if (this._isSelectable(i)) {
            selectables.push(i);
          }
        }

        return selectables;
      },
      // overridden
      _getSelectableRange: function _getSelectableRange(item1, item2) {
        var selectables = [];
        var min = Math.min(item1, item2);
        var max = Math.max(item1, item2);

        for (var i = min; i <= max; i++) {
          if (this._isSelectable(i)) {
            selectables.push(i);
          }
        }

        return selectables;
      },
      // overridden
      _getFirstSelectable: function _getFirstSelectable() {
        var count = this._getItemCount();

        for (var i = 0; i < count; i++) {
          if (this._isSelectable(i)) {
            return i;
          }
        }

        return null;
      },
      // overridden
      _getLastSelectable: function _getLastSelectable() {
        var count = this._getItemCount();

        for (var i = count - 1; i >= 0; i--) {
          if (this._isSelectable(i)) {
            return i;
          }
        }

        return null;
      },
      // overridden
      _getRelatedSelectable: function _getRelatedSelectable(item, relation) {
        if (relation == "above") {
          var startIndex = item - 1;
          var endIndex = 0;
          var increment = -1;
        } else if (relation == "under") {
          var startIndex = item + 1;
          var endIndex = this._getItemCount() - 1;
          var increment = 1;
        } else {
          return null;
        }

        for (var i = startIndex; i !== endIndex + increment; i += increment) {
          if (this._isSelectable(i)) {
            return i;
          }
        }

        return null;
      },
      // overridden
      _getPage: function _getPage(lead, up) {
        if (up) {
          return this._getFirstSelectable();
        } else {
          return this._getLastSelectable();
        }
      },
      // overridden
      _selectableToHashCode: function _selectableToHashCode(item) {
        return item;
      },
      // overridden
      _scrollItemIntoView: function _scrollItemIntoView(item) {
        if (this._autoScrollIntoView) {
          this._pane.scrollRowIntoView(item);
        }
      },
      // overridden
      _getSelectableLocationX: function _getSelectableLocationX(item) {
        return {
          left: 0,
          right: this._pane.getColumnConfig().getTotalSize() - 1
        };
      },
      // overridden
      _getSelectableLocationY: function _getSelectableLocationY(item) {
        var rowConfig = this._pane.getRowConfig();

        var itemTop = rowConfig.getItemPosition(item);
        var itemBottom = itemTop + rowConfig.getItemSize(item) - 1;
        return {
          top: itemTop,
          bottom: itemBottom
        };
      }
    }
  });
  qx.ui.virtual.selection.Row.$$dbClassInfo = $$dbClassInfo;
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
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2017 Cajus Pollmeier
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Cajus Pollmeier
       * Derrell Lipman
  
  ************************************************************************ */

  /**
   * Because of the virtual nature of the VirtualTree, and the fact that
   * rendering occurs asynchronously, it is not a simple matter to bind a
   * property in the model that will open or close branches in the
   * tree. Instead, this controller listens to both the model and the tree, and
   * synchronizes the openness of branches in the tree.
   * 
   * To use this controller, simply instantiate it with the requisite
   * constructor arguments.
   */
  qx.Class.define("qx.ui.tree.core.OpenCloseController", {
    extend: qx.core.Object,

    /**
     * @param tree {qx.ui.tree.VirtualTree}
     *   The tree whose branch open or closed state is to be synchronized to a
     *   model property.
     * 
     * @param rootModel {qx.data.Array}
     *   The tree root model wherein a property is to be synchronized to the
     *   tree branches' open or closed states
     */
    construct: function construct(tree, rootModel) {
      var openProperty = tree.getOpenProperty();
      qx.core.Object.constructor.call(this); // Save the tree and initialize storage of listener IDs

      this._tree = tree;
      this._lids = []; // Sync tree nodes

      var sync = function (node) {
        if (qx.Class.hasProperty(node.constructor, "children")) {
          node.getChildren().forEach(sync);
        }

        if (qx.Class.hasProperty(node.constructor, openProperty)) {
          if (node.get(openProperty)) {
            tree.openNode(node);
          } else {
            tree.closeNode(node);
          }
        }
      }.bind(this);

      sync(rootModel); // Wire change listeners

      var lid = tree.addListener("open", this._onOpen, this);

      this._lids.push([tree, lid]);

      lid = tree.addListener("close", this._onClose, this);

      this._lids.push([tree, lid]);

      lid = rootModel.addListener("changeBubble", this._onChangeBubble, this);

      this._lids.push([rootModel, lid]);
    },
    members: {
      /** The tree which is synced to the model */
      _tree: null,

      /** Listener IDs that we manage */
      _lids: null,
      // event listener for "open" on the tree
      _onOpen: function _onOpen(ev) {
        ev.getData().set(this._tree.getOpenProperty(), true);
      },
      // event listener for "close" on the tree
      _onClose: function _onClose(ev) {
        ev.getData().set(this._tree.getOpenProperty(), false);
      },
      // event listener for model changes
      _onChangeBubble: function _onChangeBubble(ev) {
        var index;
        var item;
        var isOpen;
        var bubble = ev.getData(); // Extract the index of the current item

        index = bubble.name.replace(/.*\[([0-9]+)\]$/, "$1"); // Retrieve that indexed array item if it's an array; otherwise the item itself

        item = bubble.item.getItem ? bubble.item.getItem(index) : bubble.item; // If this item isn't being deleted and has an open property...

        if (item && qx.Class.hasProperty(item.constructor, this._tree.getOpenProperty())) {
          // ... then find out if this branch is open
          isOpen = item.get(this._tree.getOpenProperty()); // Open or close the tree branch as necessary

          if (isOpen && !this._tree.isNodeOpen(item)) {
            this._tree.openNode(item);
          } else if (!isOpen && this._tree.isNodeOpen(item)) {
            this._tree.closeNode(item);
          }
        } // Rebuild the internal lookup table


        this._tree.refresh();
      }
    },
    destruct: function destruct() {
      this._tree = null;

      this._lids.forEach(function (data) {
        data[0].removeListenerById(data[1]);
      });
    }
  });
  qx.ui.tree.core.OpenCloseController.$$dbClassInfo = $$dbClassInfo;
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * A widget cell provider provides the {@link qx.ui.virtual.layer.WidgetCell}
   * with configured widgets to render the cells and pools/releases unused
   * cell widgets.
   */
  qx.Interface.define("qx.ui.virtual.core.IWidgetCellProvider", {
    members: {
      /**
       * This method returns the configured cell for the given cell. The return
       * value may be <code>null</code> to indicate that the cell should be empty.
       *
       * @param row {Integer} The cell's row index.
       * @param column {Integer} The cell's column index.
       * @return {qx.ui.core.LayoutItem} The configured widget for the given cell.
       */
      getCellWidget: function getCellWidget(row, column) {},

      /**
       * Release the given cell widget. Either pool or destroy the widget.
       *
       * @param widget {qx.ui.core.LayoutItem} The cell widget to pool.
       */
      poolCellWidget: function poolCellWidget(widget) {}
    }
  });
  qx.ui.virtual.core.IWidgetCellProvider.$$dbClassInfo = $$dbClassInfo;
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
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This interface needs to implemented from all {@link qx.ui.tree.VirtualTree}
   * providers.
   *
   * @internal
   */
  qx.Interface.define("qx.ui.tree.provider.IVirtualTreeProvider", {
    members: {
      /**
       * Creates a layer for node and leaf rendering.
       *
       * @return {qx.ui.virtual.layer.Abstract} new layer.
       */
      createLayer: function createLayer() {},

      /**
       * Creates a renderer for rendering.
       *
       * @return {var} new node renderer.
       */
      createRenderer: function createRenderer() {},

      /**
       * Sets the name of the property, where the children are stored in the model.
       *
       * @param value {String} The child property name.
       */
      setChildProperty: function setChildProperty(value) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertString(value);
      },

      /**
       * Sets the name of the property, where the value for the tree folders label
       * is stored in the model classes.
       *
       * @param value {String} The label path.
       */
      setLabelPath: function setLabelPath(value) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertString(value);
      },

      /**
       * Styles a selected item.
       *
       * @param row {Integer} row to style.
       */
      styleSelectabled: function styleSelectabled(row) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInteger(row);
      },

      /**
       * Styles a not selected item.
       *
       * @param row {Integer} row to style.
       */
      styleUnselectabled: function styleUnselectabled(row) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInteger(row);
      },

      /**
       * Returns if the passed row can be selected or not.
       *
       * @param row {Integer} row to select.
       * @return {Boolean} <code>true</code> when the row can be selected,
       *    <code>false</code> otherwise.
       */
      isSelectable: function isSelectable(row) {
        this.assertArgumentsCount(arguments, 1, 1);
        this.assertInteger(row);
      }
    }
  });
  qx.ui.tree.provider.IVirtualTreeProvider.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.data.SingleValueBinding": {},
      "qx.util.OOUtil": {},
      "qx.util.Delegate": {},
      "qx.lang.Array": {}
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
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The mixin controls the binding between model and item.
   *
   * @internal
   */
  qx.Mixin.define("qx.ui.tree.core.MWidgetController", {
    construct: function construct() {
      this.__boundItems = [];
    },
    properties: {
      /**
       * The name of the property, where the value for the tree node/leaf label
       * is stored in the model classes.
       */
      labelPath: {
        check: "String",
        nullable: true
      },

      /**
       * The path to the property which holds the information that should be
       * shown as an icon.
       */
      iconPath: {
        check: "String",
        nullable: true
      },

      /**
       * A map containing the options for the label binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      labelOptions: {
        nullable: true
      },

      /**
       * A map containing the options for the icon binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      iconOptions: {
        nullable: true
      },

      /**
       * The name of the property, where the children are stored in the model.
       * Instead of the {@link #labelPath} must the child property a direct
       * property form the model instance.
       */
      childProperty: {
        check: "String",
        nullable: true
      },

      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.tree.core.IVirtualTreeDelegate} interface.
       */
      delegate: {
        event: "changeDelegate",
        init: null,
        nullable: true
      }
    },
    members: {
      /** @type {Array} which contains the bounded items */
      __boundItems: null,

      /**
       * Helper-Method for binding the default properties from the model to the
       * target widget. The used default properties  depends on the passed item.
       *
       * This method should only be called in the {@link IVirtualTreeDelegate#bindItem}
       * function implemented by the {@link #delegate} property.
       *
       * @param item {qx.ui.core.Widget} The internally created and used node or
       *   leaf.
       * @param index {Integer} The index of the item (node or leaf).
       */
      bindDefaultProperties: function bindDefaultProperties(item, index) {
        // bind model first
        this.bindProperty("", "model", null, item, index);
        this.bindProperty(this.getLabelPath(), "label", this.getLabelOptions(), item, index);

        var bindPath = this.__getBindPath(index);

        var bindTarget = this._tree.getLookupTable();

        bindTarget = qx.data.SingleValueBinding.resolvePropertyChain(bindTarget, bindPath);

        if (qx.util.OOUtil.hasProperty(bindTarget.constructor, this.getChildProperty())) {
          this.bindProperty(this.getChildProperty() + ".length", "appearance", {
            converter: function converter() {
              return "virtual-tree-folder";
            }
          }, item, index);
        } else {
          item.setAppearance("virtual-tree-file");
        }

        if (this.getIconPath() != null) {
          this.bindProperty(this.getIconPath(), "icon", this.getIconOptions(), item, index);
        }
      },

      /**
       * Helper-Method for binding a given property from the model to the target
       * widget.
       *
       * This method should only be called in the {@link IVirtualTreeDelegate#bindItem}
       * function implemented by the {@link #delegate} property.
       *
       * @param sourcePath {String | null} The path to the property in the model.
       *   If you use an empty string, the whole model item will be bound.
       * @param targetProperty {String} The name of the property in the target widget.
       * @param options {Map | null} The options to use for the binding.
       * @param targetWidget {qx.ui.core.Widget} The target widget.
       * @param index {Integer} The index of the current binding.
       */
      bindProperty: function bindProperty(sourcePath, targetProperty, options, targetWidget, index) {
        var bindPath = this.__getBindPath(index, sourcePath);

        var bindTarget = this._tree.getLookupTable();

        var id = bindTarget.bind(bindPath, targetWidget, targetProperty, options);

        this.__addBinding(targetWidget, id);
      },

      /**
       * Helper-Method for binding a given property from the target widget to
       * the model.
       * This method should only be called in the
       * {@link qx.ui.tree.core.IVirtualTreeDelegate#bindItem} function implemented by the
       * {@link #delegate} property.
       *
       * @param targetPath {String | null} The path to the property in the model.
       * @param sourceProperty {String} The name of the property in the target.
       * @param options {Map | null} The options to use for the binding.
       * @param sourceWidget {qx.ui.core.Widget} The source widget.
       * @param index {Integer} The index of the current binding.
       */
      bindPropertyReverse: function bindPropertyReverse(targetPath, sourceProperty, options, sourceWidget, index) {
        var bindPath = this.__getBindPath(index, targetPath);

        var bindTarget = this._tree.getLookupTable();

        var id = sourceWidget.bind(sourceProperty, bindTarget, bindPath, options);

        this.__addBinding(sourceWidget, id);
      },

      /**
       * Remove all bindings from all bounded items.
       */
      removeBindings: function removeBindings() {
        while (this.__boundItems.length > 0) {
          var item = this.__boundItems.pop();

          this._removeBindingsFrom(item);
        }
      },

      /**
       * Sets up the binding for the given item and index.
       *
       * @param item {qx.ui.core.Widget} The internally created and used item.
       * @param index {Integer} The index of the item.
       */
      _bindItem: function _bindItem(item, index) {
        var bindItem = qx.util.Delegate.getMethod(this.getDelegate(), "bindItem");

        if (bindItem != null) {
          bindItem(this, item, index);
        } else {
          this.bindDefaultProperties(item, index);
        }
      },

      /**
       * Removes the binding of the given item.
       *
       * @param item {qx.ui.core.Widget} The item which the binding should be
       *   removed.
       */
      _removeBindingsFrom: function _removeBindingsFrom(item) {
        var bindings = this.__getBindings(item);

        while (bindings.length > 0) {
          var id = bindings.pop();

          try {
            this._tree.getLookupTable().removeBinding(id);
          } catch (e) {
            item.removeBinding(id);
          }
        }

        if (this.__boundItems.includes(item)) {
          qx.lang.Array.remove(this.__boundItems, item);
        }
      },

      /**
       * Helper method to create the path for binding.
       *
       * @param index {Integer} The index of the item.
       * @param path {String|null} The path to the property.
       * @return {String} The binding path
       */
      __getBindPath: function __getBindPath(index, path) {
        var bindPath = "[" + index + "]";

        if (path != null && path != "") {
          bindPath += "." + path;
        }

        return bindPath;
      },

      /**
       * Helper method to save the binding for the widget.
       *
       * @param widget {qx.ui.core.Widget} widget to save binding.
       * @param id {var} the id from the binding.
       */
      __addBinding: function __addBinding(widget, id) {
        var bindings = this.__getBindings(widget);

        if (!bindings.includes(id)) {
          bindings.push(id);
        }

        if (!this.__boundItems.includes(widget)) {
          this.__boundItems.push(widget);
        }
      },

      /**
       * Helper method which returns all bound id from the widget.
       *
       * @param widget {qx.ui.core.Widget} widget to get all binding.
       * @return {Array} all bound id's.
       */
      __getBindings: function __getBindings(widget) {
        var bindings = widget.getUserData("BindingIds");

        if (bindings == null) {
          bindings = [];
          widget.setUserData("BindingIds", bindings);
        }

        return bindings;
      }
    },
    destruct: function destruct() {
      this.__boundItems = null;
    }
  });
  qx.ui.tree.core.MWidgetController.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.virtual.core.IWidgetCellProvider": {
        "require": true
      },
      "qx.ui.tree.provider.IVirtualTreeProvider": {
        "require": true
      },
      "qx.ui.tree.core.MWidgetController": {
        "require": true
      },
      "qx.ui.core.queue.Widget": {},
      "qx.ui.virtual.layer.WidgetCell": {},
      "qx.util.Delegate": {},
      "qx.ui.tree.VirtualTreeItem": {},
      "qx.ui.virtual.cell.WidgetCell": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * The provider implements the {@link qx.ui.virtual.core.IWidgetCellProvider}
   * API, which can be used as delegate for the widget cell rendering and it
   * provides a API to bind the model with the rendered item.
   *
   * @internal
   */
  qx.Class.define("qx.ui.tree.provider.WidgetProvider", {
    extend: qx.core.Object,
    implement: [qx.ui.virtual.core.IWidgetCellProvider, qx.ui.tree.provider.IVirtualTreeProvider],
    include: [qx.ui.tree.core.MWidgetController],

    /**
     * @param tree {qx.ui.tree.VirtualTree} tree to provide.
     */
    construct: function construct(tree) {
      qx.core.Object.constructor.call(this);
      this._tree = tree;
      this.addListener("changeDelegate", this._onChangeDelegate, this);

      this._onChangeDelegate();
    },
    members: {
      /** @type {qx.ui.tree.VirtualTree} tree to provide. */
      _tree: null,

      /** @type {qx.ui.virtual.cell.WidgetCell} the used item renderer. */
      _renderer: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */
      // interface implementation
      getCellWidget: function getCellWidget(row, column) {
        var item = this._tree.getLookupTable().getItem(row);

        var hasChildren = false;

        if (this._tree.isNode(item)) {
          hasChildren = this._tree.hasChildren(item);
        }

        var widget = this._renderer.getCellWidget();

        widget.setOpen(hasChildren && this._tree.isNodeOpen(item));
        widget.addListener("changeOpen", this.__onOpenChanged, this);
        widget.setUserData("cell.childProperty", this.getChildProperty());
        widget.setUserData("cell.showLeafs", this._tree.isShowLeafs());

        if (this._tree.getSelection().contains(item)) {
          this._styleSelectabled(widget);
        } else {
          this._styleUnselectabled(widget);
        }

        var level = this._tree.getLevel(row);

        if (!this._tree.isShowTopLevelOpenCloseIcons()) {
          level -= 1;
        }

        widget.setUserData("cell.level", level);

        if (!this._tree.isShowTopLevelOpenCloseIcons() && level == -1) {
          widget.setOpenSymbolMode("never");
        } else {
          widget.setOpenSymbolMode("auto");
        }

        if (this._tree.getOpenProperty()) {
          widget.setModel(item);
        }

        this._bindItem(widget, row);

        qx.ui.core.queue.Widget.add(widget);
        return widget;
      },
      // interface implementation
      poolCellWidget: function poolCellWidget(widget) {
        widget.removeListener("changeOpen", this.__onOpenChanged, this);

        this._removeBindingsFrom(widget);

        this._renderer.pool(widget);

        this._onPool(widget);
      },
      // Interface implementation
      createLayer: function createLayer() {
        return new qx.ui.virtual.layer.WidgetCell(this);
      },
      // Interface implementation
      createRenderer: function createRenderer() {
        var createItem = qx.util.Delegate.getMethod(this.getDelegate(), "createItem");

        if (createItem == null) {
          createItem = function createItem() {
            return new qx.ui.tree.VirtualTreeItem();
          };
        }

        var renderer = new qx.ui.virtual.cell.WidgetCell();
        renderer.setDelegate({
          createWidget: createItem
        });
        return renderer;
      },
      // interface implementation
      styleSelectabled: function styleSelectabled(row) {
        var widget = this._tree._layer.getRenderedCellWidget(row, 0);

        this._styleSelectabled(widget);
      },
      // interface implementation
      styleUnselectabled: function styleUnselectabled(row) {
        var widget = this._tree._layer.getRenderedCellWidget(row, 0);

        this._styleUnselectabled(widget);
      },
      // interface implementation
      isSelectable: function isSelectable(row) {
        var widget = this._tree._layer.getRenderedCellWidget(row, 0);

        if (widget != null) {
          return widget.isEnabled();
        } else {
          return true;
        }
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL API
      ---------------------------------------------------------------------------
      */

      /**
       * Styles a selected item.
       *
       * @param widget {qx.ui.core.Widget} widget to style.
       */
      _styleSelectabled: function _styleSelectabled(widget) {
        if (widget == null) {
          return;
        }

        this._renderer.updateStates(widget, {
          selected: 1
        });
      },

      /**
       * Styles a not selected item.
       *
       * @param widget {qx.ui.core.Widget} widget to style.
       */
      _styleUnselectabled: function _styleUnselectabled(widget) {
        if (widget == null) {
          return;
        }

        this._renderer.updateStates(widget, {});
      },

      /**
       * Calls the delegate <code>onPool</code> method when it is used in the
       * {@link #delegate} property.
       *
       * @param item {qx.ui.core.Widget} Item to modify.
       */
      _onPool: function _onPool(item) {
        var onPool = qx.util.Delegate.getMethod(this.getDelegate(), "onPool");

        if (onPool != null) {
          onPool(item);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the created item's.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onItemCreated: function _onItemCreated(event) {
        var configureItem = qx.util.Delegate.getMethod(this.getDelegate(), "configureItem");

        if (configureItem != null) {
          var leaf = event.getData();
          configureItem(leaf);
        }
      },

      /**
       * Event handler for the change delegate event.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onChangeDelegate: function _onChangeDelegate(event) {
        if (this._renderer != null) {
          this._renderer.dispose();

          this.removeBindings();
        }

        this._renderer = this.createRenderer();

        this._renderer.addListener("created", this._onItemCreated, this);
      },

      /**
       * Handler when a node changes opened or closed state.
       *
       * @param event {qx.event.type.Data} The data event.
       */
      __onOpenChanged: function __onOpenChanged(event) {
        var widget = event.getTarget();
        var row = widget.getUserData("cell.row");

        var item = this._tree.getLookupTable().getItem(row);

        if (event.getData()) {
          this._tree.openNodeWithoutScrolling(item);
        } else {
          this._tree.closeNodeWithoutScrolling(item);
        }
      }
    },
    destruct: function destruct() {
      this.removeBindings();

      this._renderer.dispose();

      this._tree = this._renderer = null;
    }
  });
  qx.ui.tree.provider.WidgetProvider.$$dbClassInfo = $$dbClassInfo;
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
       2013 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This utility class implements some methods for the <code>VirtualTree</code>.
   */
  qx.Class.define("qx.ui.tree.core.Util", {
    statics: {
      /**
       * Returns if the passed item is a node or a leaf.
       *
       * @param node {qx.core.Object} Node to check.
       * @param childProperty {String} The property name to find the children.
       * @return {Boolean} <code>True</code> when the passed item is a node,
       *   </code>false</code> when it is a leaf.
       */
      isNode: function isNode(node, childProperty) {
        if (node == null || childProperty == null) {
          return false;
        }

        return qx.Class.hasProperty(node.constructor, childProperty);
      },

      /**
       * Returns whether the node has visible children or not.
       *
       * @param node {qx.core.Object} Node to check.
       * @param childProperty {String} The property name to find the children.
       * @param ignoreLeafs {Boolean?} Indicates whether leafs are ignored. This means when it is set to
       *    <code>true</code> a node which contains only leafs has no children. The default value is <code>false</code>.
       * @return {Boolean} <code>True</code> when the node has visible children,
       *   <code>false</code> otherwise.
       */
      hasChildren: function hasChildren(node, childProperty, ignoreLeafs) {
        if (node == null || childProperty == null || !this.isNode(node, childProperty)) {
          return false;
        }

        var children = node.get(childProperty);

        if (children == null) {
          return false;
        }

        if (!ignoreLeafs) {
          return children.length > 0;
        } else {
          for (var i = 0; i < children.getLength(); i++) {
            var child = children.getItem(i);

            if (this.isNode(child, childProperty)) {
              return true;
            }
          }
        }

        return false;
      }
    }
  });
  qx.ui.tree.core.Util.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Function": {},
      "qx.lang.Type": {}
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
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Methods to work with the delegate pattern.
   */
  qx.Class.define("qx.util.Delegate", {
    statics: {
      /**
       * Returns the delegate method given my its name.
       *
       * @param delegate {Object} The delegate object to check the method.
       * @param specificMethod {String} The name of the delegate method.
       * @return {Function|null} The requested method or null, if no method is set.
       */
      getMethod: function getMethod(delegate, specificMethod) {
        if (qx.util.Delegate.containsMethod(delegate, specificMethod)) {
          return qx.lang.Function.bind(delegate[specificMethod], delegate);
        }

        return null;
      },

      /**
       * Checks, if the given delegate is valid or if a specific method is given.
       *
       * @param delegate {Object} The delegate object.
       * @param specificMethod {String} The name of the method to search for.
       * @return {Boolean} True, if everything was ok.
       */
      containsMethod: function containsMethod(delegate, specificMethod) {
        var Type = qx.lang.Type;

        if (Type.isObject(delegate)) {
          return Type.isFunction(delegate[specificMethod]);
        }

        return false;
      }
    }
  });
  qx.util.Delegate.$$dbClassInfo = $$dbClassInfo;
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * The axis maps virtual screen coordinates to item indexes. By default all
   * items have the same size but it is also possible to give specific items
   * a different size.
   */
  qx.Class.define("qx.ui.virtual.core.Axis", {
    extend: qx.core.Object,

    /**
     * @param defaultItemSize {Integer} The default size of the items.
     * @param itemCount {Integer} The number of item on the axis.
     */
    construct: function construct(defaultItemSize, itemCount) {
      qx.core.Object.constructor.call(this);
      this.itemCount = itemCount;
      this.defaultItemSize = defaultItemSize; // sparse array

      this.customSizes = {};
    },
    events: {
      /** Every change to the axis configuration triggers this event. */
      "change": "qx.event.type.Event"
    },
    members: {
      __ranges: null,

      /**
       * Get the default size of the items.
       *
       * @return {Integer} The default item size.
       */
      getDefaultItemSize: function getDefaultItemSize() {
        return this.defaultItemSize;
      },

      /**
       * Set the default size the items.
       *
       * @param defaultItemSize {Integer} The default size of the items.
       */
      setDefaultItemSize: function setDefaultItemSize(defaultItemSize) {
        if (this.defaultItemSize !== defaultItemSize) {
          this.defaultItemSize = defaultItemSize;
          this.__ranges = null;
          this.fireNonBubblingEvent("change");
        }
      },

      /**
       * Get the number of items in the axis.
       *
       * @return {Integer} The number of items.
       */
      getItemCount: function getItemCount() {
        return this.itemCount;
      },

      /**
       * Set the number of items in the axis.
       *
       * @param itemCount {Integer} The new item count.
       */
      setItemCount: function setItemCount(itemCount) {
        if (this.itemCount !== itemCount) {
          this.itemCount = itemCount;
          this.__ranges = null;
          this.fireNonBubblingEvent("change");
        }
      },

      /**
       * Sets the size of a specific item. This allow item, which have a size
       * different from the default size.
       *
       * @param index {Integer} Index of the item to change.
       * @param size {Integer} New size of the item.
       */
      setItemSize: function setItemSize(index, size) {
        {
          this.assertArgumentsCount(arguments, 2, 2);
          this.assert(size >= 0 || size === null, "'size' must be 'null' or an integer larger than 0.");
        }

        if (this.customSizes[index] == size) {
          return;
        }

        if (size === null) {
          delete this.customSizes[index];
        } else {
          this.customSizes[index] = size;
        }

        this.__ranges = null;
        this.fireNonBubblingEvent("change");
      },

      /**
       * Get the size of the item at the given index.
       *
       * @param index {Integer} Index of the item to get the size for.
       * @return {Integer} Size of the item.
       */
      getItemSize: function getItemSize(index) {
        // custom size of 0 is not allowed
        return this.customSizes[index] || this.defaultItemSize;
      },

      /**
       * Reset all custom sizes set with {@link #setItemSize}.
       */
      resetItemSizes: function resetItemSizes() {
        this.customSizes = {};
        this.__ranges = null;
        this.fireNonBubblingEvent("change");
      },

      /**
       * Split the position range into disjunct intervals. Each interval starts
       * with a custom sized cell. Each position is contained in exactly one range.
       * The ranges are sorted according to their start position.
       *
       * Complexity: O(n log n) (n = number of custom sized cells)
       *
       * @return {Map[]} The sorted list of ranges.
       */
      __getRanges: function __getRanges() {
        if (this.__ranges) {
          return this.__ranges;
        }

        var defaultSize = this.defaultItemSize;
        var itemCount = this.itemCount;
        var indexes = [];

        for (var key in this.customSizes) {
          var index = parseInt(key, 10);

          if (index < itemCount) {
            indexes.push(index);
          }
        }

        if (indexes.length == 0) {
          var ranges = [{
            startIndex: 0,
            endIndex: itemCount - 1,
            firstItemSize: defaultSize,
            rangeStart: 0,
            rangeEnd: itemCount * defaultSize - 1
          }];
          this.__ranges = ranges;
          return ranges;
        }

        indexes.sort(function (a, b) {
          return a > b ? 1 : -1;
        });
        var ranges = [];
        var correctionSum = 0;

        for (var i = 0; i < indexes.length; i++) {
          var index = indexes[i];

          if (index >= itemCount) {
            break;
          }

          var cellSize = this.customSizes[index];
          var rangeStart = index * defaultSize + correctionSum;
          correctionSum += cellSize - defaultSize;
          ranges[i] = {
            startIndex: index,
            firstItemSize: cellSize,
            rangeStart: rangeStart
          };

          if (i > 0) {
            ranges[i - 1].rangeEnd = rangeStart - 1;
            ranges[i - 1].endIndex = index - 1;
          }
        } // fix first range


        if (ranges[0].rangeStart > 0) {
          ranges.unshift({
            startIndex: 0,
            endIndex: ranges[0].startIndex - 1,
            firstItemSize: defaultSize,
            rangeStart: 0,
            rangeEnd: ranges[0].rangeStart - 1
          });
        } // fix last range


        var lastRange = ranges[ranges.length - 1];
        var remainingItemsSize = (itemCount - lastRange.startIndex - 1) * defaultSize;
        lastRange.rangeEnd = lastRange.rangeStart + lastRange.firstItemSize + remainingItemsSize - 1;
        lastRange.endIndex = itemCount - 1;
        this.__ranges = ranges;
        return ranges;
      },

      /**
       * Returns the range, which contains the position
       *
       * Complexity: O(log n) (n = number of custom sized cells)
       *
       * @param position {Integer} The position.
       * @return {Map} The range, which contains the given position.
       */
      __findRangeByPosition: function __findRangeByPosition(position) {
        var ranges = this.__ranges || this.__getRanges();

        var start = 0;
        var end = ranges.length - 1; // binary search in the sorted ranges list

        while (true) {
          var pivot = start + (end - start >> 1);
          var range = ranges[pivot];

          if (range.rangeEnd < position) {
            start = pivot + 1;
          } else if (range.rangeStart > position) {
            end = pivot - 1;
          } else {
            return range;
          }
        }
      },

      /**
       * Get the item and the offset into the item at the given position.
       *
       * @param position {Integer|null} The position to get the item for.
       * @return {Map} A map with the keys <code>index</code> and
       *    <code>offset</code>. The index is the index of the item containing the
       *    position and offsets specifies offset into this item. If the position
       *    is outside of the range, <code>null</code> is returned.
       */
      getItemAtPosition: function getItemAtPosition(position) {
        if (position < 0 || position >= this.getTotalSize()) {
          return null;
        }

        var range = this.__findRangeByPosition(position);

        var startPos = range.rangeStart;
        var index = range.startIndex;
        var firstItemSize = range.firstItemSize;

        if (startPos + firstItemSize > position) {
          return {
            index: index,
            offset: position - startPos
          };
        } else {
          var defaultSize = this.defaultItemSize;
          return {
            index: index + 1 + Math.floor((position - startPos - firstItemSize) / defaultSize),
            offset: (position - startPos - firstItemSize) % defaultSize
          };
        }
      },

      /**
       * Returns the range, which contains the position.
       *
       * Complexity: O(log n) (n = number of custom sized cells)
       *
       * @param index {Integer} The index of the item to get the range for.
       * @return {Map} The range for the index.
       */
      __findRangeByIndex: function __findRangeByIndex(index) {
        var ranges = this.__ranges || this.__getRanges();

        var start = 0;
        var end = ranges.length - 1; // binary search in the sorted ranges list

        while (true) {
          var pivot = start + (end - start >> 1);
          var range = ranges[pivot];

          if (range.endIndex < index) {
            start = pivot + 1;
          } else if (range.startIndex > index) {
            end = pivot - 1;
          } else {
            return range;
          }
        }
      },

      /**
       * Get the start position of the item with the given index.
       *
       * @param index {Integer} The item's index.
       * @return {Integer|null} The start position of the item. If the index is outside
       *    of the axis range <code>null</code> is returned.
       */
      getItemPosition: function getItemPosition(index) {
        if (index < 0 || index >= this.itemCount) {
          return null;
        }

        var range = this.__findRangeByIndex(index);

        if (range.startIndex == index) {
          return range.rangeStart;
        } else {
          return range.rangeStart + range.firstItemSize + (index - range.startIndex - 1) * this.defaultItemSize;
        }
      },

      /**
       * Returns the sum of all cell sizes.
       *
       * @return {Integer} The sum of all item sizes.
       */
      getTotalSize: function getTotalSize() {
        var ranges = this.__ranges || this.__getRanges();

        return ranges[ranges.length - 1].rangeEnd + 1;
      },

      /**
       * Get an array of item sizes starting with the item at "startIndex". The
       * sum of all sizes in the returned array is at least "minSizeSum".
       *
       * @param startIndex {Integer} The index of the first item.
       * @param minSizeSum {Integer} The minimum sum of the item sizes.
       * @return {Integer[]} List of item sizes starting with the size of the item
       *    at index <code>startIndex</code>. The sum of the item sizes is at least
       *    <code>minSizeSum</code>.
       */
      getItemSizes: function getItemSizes(startIndex, minSizeSum) {
        var customSizes = this.customSizes;
        var defaultSize = this.defaultItemSize;
        var sum = 0;
        var sizes = [];
        var i = 0;

        while (sum < minSizeSum) {
          var itemSize = customSizes[startIndex] != null ? customSizes[startIndex] : defaultSize;
          startIndex++;
          sum += itemSize;
          sizes[i++] = itemSize;

          if (startIndex >= this.itemCount) {
            break;
          }
        }

        return sizes;
      }
    },
    destruct: function destruct() {
      this.customSizes = this.__ranges = null;
    }
  });
  qx.ui.virtual.core.Axis.$$dbClassInfo = $$dbClassInfo;
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * A layer is responsible to render one aspect of a virtual pane. The pane tells
   * each layer to render/update a specific window of the virtual grid.
   */
  qx.Interface.define("qx.ui.virtual.core.ILayer", {
    members: {
      /**
       * Do a complete update of the layer. All cached data should be discarded.
       * This method is called e.g. after changes to the grid geometry
       * (row/column sizes, row/column count, ...).
       *
       * Note: This method can only be called after the widgets initial appear
       * event has been fired because it may work with the widget's DOM elements.
       *
       * @param firstRow {Integer} Index of the first row to display.
       * @param firstColumn {Integer} Index of the first column to display.
       * @param rowSizes {Integer[]} Array of heights for each row to display.
       * @param columnSizes {Integer[]} Array of widths for each column to display.
       */
      fullUpdate: function fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        this.assertArgumentsCount(arguments, 6, 6);
        this.assertPositiveInteger(firstRow);
        this.assertPositiveInteger(firstColumn);
        this.assertArray(rowSizes);
        this.assertArray(columnSizes);
      },

      /**
       * Update the layer to display a different window of the virtual grid.
       * This method is called if the pane is scrolled, resized or cells
       * are prefetched. The implementation can assume that no other grid
       * data has been changed since the last "fullUpdate" of "updateLayerWindow"
       * call.
       *
       * Note: This method can only be called after the widgets initial appear
       * event has been fired because it may work with the widget's DOM elements.
       *
       * @param firstRow {Integer} Index of the first row to display.
       * @param firstColumn {Integer} Index of the first column to display.
       * @param rowSizes {Integer[]} Array of heights for each row to display.
       * @param columnSizes {Integer[]} Array of widths for each column to display.
       */
      updateLayerWindow: function updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        this.assertArgumentsCount(arguments, 6, 6);
        this.assertPositiveInteger(firstRow);
        this.assertPositiveInteger(firstColumn);
        this.assertArray(rowSizes);
        this.assertArray(columnSizes);
      },

      /**
       * Update the layer to reflect changes in the data the layer displays.
       */
      updateLayerData: function updateLayerData() {}
    }
  });
  qx.ui.virtual.core.ILayer.$$dbClassInfo = $$dbClassInfo;
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * David Perez Carmona (david-perez)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * EXPERIMENTAL!
   *
   * A cell event instance contains all data for pointer events related to cells in
   * a pane.
   **/
  qx.Class.define("qx.ui.virtual.core.CellEvent", {
    extend: qx.event.type.Pointer,
    properties: {
      /** The table row of the event target. */
      row: {
        check: "Integer",
        nullable: true
      },

      /** The table column of the event target. */
      column: {
        check: "Integer",
        nullable: true
      }
    },
    members: {
      /**
       * Initialize the event.
       *
       * @param scroller {qx.ui.table.pane.Scroller} The tables pane scroller.
       * @param me {qx.event.type.Pointer} The original pointer event.
       * @param row {Integer?null} The cell's row index.
       * @param column {Integer?null} The cell's column index.
       */
      init: function init(scroller, me, row, column) {
        me.clone(this);
        this.setBubbles(false);
        this.setRow(row);
        this.setColumn(column);
      }
    }
  });
  qx.ui.virtual.core.CellEvent.$$dbClassInfo = $$dbClassInfo;
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

//# sourceMappingURL=part-boot-bundle-45.js.map
