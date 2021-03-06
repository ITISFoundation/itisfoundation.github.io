(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.layer.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.theme.manager.Color": {},
      "qx.theme.manager.Decoration": {}
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
   * Abstract base class for the {@link Row} and {@link Column} layers.
   */
  qx.Class.define("qx.ui.virtual.layer.AbstractBackground", {
    extend: qx.ui.virtual.layer.Abstract,

    /*
     *****************************************************************************
        CONSTRUCTOR
     *****************************************************************************
     */

    /**
     * @param colorEven {Color?null} color for even indexes
     * @param colorOdd {Color?null} color for odd indexes
     */
    construct: function construct(colorEven, colorOdd) {
      qx.ui.virtual.layer.Abstract.constructor.call(this);

      if (colorEven) {
        this.setColorEven(colorEven);
      }

      if (colorOdd) {
        this.setColorOdd(colorOdd);
      }

      this.__customColors = {};
      this.__decorators = {};
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** color for event indexes */
      colorEven: {
        nullable: true,
        check: "Color",
        apply: "_applyColorEven",
        themeable: true
      },

      /** color for odd indexes */
      colorOdd: {
        nullable: true,
        check: "Color",
        apply: "_applyColorOdd",
        themeable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __colorEven: null,
      __colorOdd: null,
      __customColors: null,
      __decorators: null,

      /*
      ---------------------------------------------------------------------------
        COLOR HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the color for the given index
       *
       * @param index {Integer} Index to set the color for
       * @param color {Color|null} the color to set. A value of <code>null</code>
       *    will reset the color.
       */
      setColor: function setColor(index, color) {
        if (color) {
          this.__customColors[index] = qx.theme.manager.Color.getInstance().resolve(color);
        } else {
          delete this.__customColors[index];
        }
      },

      /**
       * Clear all colors set using {@link #setColor}.
       */
      clearCustomColors: function clearCustomColors() {
        this.__customColors = {};
        this.updateLayerData();
      },

      /**
       * Get the color at the given index
       *
       * @param index {Integer} The index to get the color for.
       * @return {Color} The color at the given index
       */
      getColor: function getColor(index) {
        var customColor = this.__customColors[index];

        if (customColor) {
          return customColor;
        } else {
          return index % 2 == 0 ? this.__colorEven : this.__colorOdd;
        }
      },
      // property apply
      _applyColorEven: function _applyColorEven(value, old) {
        if (value) {
          this.__colorEven = qx.theme.manager.Color.getInstance().resolve(value);
        } else {
          this.__colorEven = null;
        }

        this.updateLayerData();
      },
      // property apply
      _applyColorOdd: function _applyColorOdd(value, old) {
        if (value) {
          this.__colorOdd = qx.theme.manager.Color.getInstance().resolve(value);
        } else {
          this.__colorOdd = null;
        }

        this.updateLayerData();
      },

      /**
       * Sets the decorator for the given index
       *
       * @param index {Integer} Index to set the color for
       * @param decorator {qx.ui.decoration.IDecorator|null} the decorator to set. A value of
       *    <code>null</code> will reset the decorator.
       */
      setBackground: function setBackground(index, decorator) {
        if (decorator) {
          this.__decorators[index] = qx.theme.manager.Decoration.getInstance().resolve(decorator);
        } else {
          delete this.__decorators[index];
        }

        this.updateLayerData();
      },

      /**
       * Get the decorator at the given index
       *
       * @param index {Integer} The index to get the decorator for.
       * @return {qx.ui.decoration.IDecorator} The decorator at the given index
       */
      getBackground: function getBackground(index) {
        return this.__decorators[index];
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__customColors = this.__decorators = null;
    }
  });
  qx.ui.virtual.layer.AbstractBackground.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.layer.AbstractBackground": {
        "require": true
      },
      "qx.lang.Array": {},
      "qx.bom.element.Style": {}
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
   * The Row layer renders row background colors.
   */
  qx.Class.define("qx.ui.virtual.layer.Row", {
    extend: qx.ui.virtual.layer.AbstractBackground,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "row-layer"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _fullUpdate: function _fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        var html = [];
        var width = qx.lang.Array.sum(columnSizes);
        var top = 0;
        var row = firstRow;
        var childIndex = 0;

        for (var y = 0; y < rowSizes.length; y++) {
          var color = this.getColor(row);
          var backgroundColor = color ? "background-color:" + color + ";" : "";
          var decorator = this.getBackground(row);
          var styles = decorator ? qx.bom.element.Style.compile(decorator.getStyles()) : "";
          html.push("<div style='", "position: absolute;", "left: 0;", "top:", top, "px;", "height:", rowSizes[y], "px;", "width:", width, "px;", backgroundColor, styles, "'>", "</div>");
          childIndex++;
          top += rowSizes[y];
          row += 1;
        }

        var el = this.getContentElement().getDomElement(); // hide element before changing the child nodes to avoid
        // premature reflow calculations

        el.style.display = "none";
        el.innerHTML = html.join("");
        el.style.display = "block";
        this._width = width;
      },
      // overridden
      _updateLayerWindow: function _updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        if (firstRow !== this.getFirstRow() || rowSizes.length !== this.getRowSizes().length || this._width < qx.lang.Array.sum(columnSizes)) {
          this._fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
        }
      },
      // overridden
      setColor: function setColor(index, color) {
        qx.ui.virtual.layer.Row.prototype.setColor.base.call(this, index, color);

        if (this.__isRowRendered(index)) {
          this.updateLayerData();
        }
      },
      // overridden
      setBackground: function setBackground(index, decorator) {
        qx.ui.virtual.layer.Row.prototype.setBackground.base.call(this, index, decorator);

        if (this.__isRowRendered(index)) {
          this.updateLayerData();
        }
      },

      /**
       * Whether the row with the given index is currently rendered (i.e. in the
       * layer's view port).
       *
       * @param index {Integer} The row's index
       * @return {Boolean} Whether the row is rendered
       */
      __isRowRendered: function __isRowRendered(index) {
        var firstRow = this.getFirstRow();
        var lastRow = firstRow + this.getRowSizes().length - 1;
        return index >= firstRow && index <= lastRow;
      }
    }
  });
  qx.ui.virtual.layer.Row.$$dbClassInfo = $$dbClassInfo;
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This interface needs to implemented from all {@link qx.ui.list.List} providers.
   *
   * @internal
   */
  qx.Interface.define("qx.ui.list.provider.IListProvider", {
    members: {
      /**
       * Creates a layer for item and group rendering.
       *
       * @return {qx.ui.virtual.layer.Abstract} new layer.
       */
      createLayer: function createLayer() {},

      /**
       * Creates a renderer for item rendering.
       *
       * @return {var} new item renderer.
       */
      createItemRenderer: function createItemRenderer() {},

      /**
       * Creates a renderer for group rendering.
       *
       * @return {var} new group renderer.
       */
      createGroupRenderer: function createGroupRenderer() {},

      /**
       * Styles a selected item.
       *
       * @param row {Integer} row to style.
       */
      styleSelectabled: function styleSelectabled(row) {},

      /**
       * Styles a not selected item.
       *
       * @param row {Integer} row to style.
       */
      styleUnselectabled: function styleUnselectabled(row) {},

      /**
       * Returns if the passed row can be selected or not.
       *
       * @param row {Integer} row to select.
       * @return {Boolean} <code>true</code> when the row can be selected,
       *    <code>false</code> otherwise.
       */
      isSelectable: function isSelectable(row) {},

      /**
       * The path to the property which holds the information that should be
       * shown as a label. This is only needed if objects are stored in the model.
       *
       * @param path {String} path to the property.
       */
      setLabelPath: function setLabelPath(path) {},

      /**
       * The path to the property which holds the information that should be
       * shown as an icon. This is only needed if objects are stored in the model
       * and if the icon should be shown.
       *
       * @param path {String} path to the property.
       */
      setIconPath: function setIconPath(path) {},

      /**
       * A map containing the options for the label binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       *
       * @param options {Map} options for the label binding.
       */
      setLabelOptions: function setLabelOptions(options) {},

      /**
       * A map containing the options for the icon binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       *
       * @param options {Map} options for the icon binding.
       */
      setIconOptions: function setIconOptions(options) {},

      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.list.core.IListDelegate} interface.
       *
       * @param delegate {Object} delegation object.
       */
      setDelegate: function setDelegate(delegate) {},

      /**
       * Remove all bindings from all bounded items.
       */
      removeBindings: function removeBindings() {}
    }
  });
  qx.ui.list.provider.IListProvider.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {}
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
   * The mixin controls the binding between model and item.
   *
   * @internal
   */
  qx.Mixin.define("qx.ui.list.core.MWidgetController", {
    construct: function construct() {
      this.__boundItems = [];
    },
    properties: {
      /**
       * The path to the property which holds the information that should be
       * shown as a label. This is only needed if objects are stored in the model.
       */
      labelPath: {
        check: "String",
        nullable: true
      },

      /**
       * The path to the property which holds the information that should be
       * shown as an icon. This is only needed if objects are stored in the model
       * and if the icon should be shown.
       */
      iconPath: {
        check: "String",
        nullable: true
      },

      /**
       * The path to the property which holds the information that should be
       * displayed as a group label. This is only needed if objects are stored in the
       * model.
       */
      groupLabelPath: {
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
       * A map containing the options for the group label binding. The possible keys
       * can be found in the {@link qx.data.SingleValueBinding} documentation.
       */
      groupLabelOptions: {
        nullable: true
      },

      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.list.core.IListDelegate} interface.
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
       * Helper-Method for binding the default properties from
       * the model to the target widget. The used default properties
       * depends on the passed item. When the passed item is
       * a list item the "label" and "icon" property is used.
       * When the passed item is a group item the "value" property is
       * used.
       *
       * This method should only be called in the
       * {@link IListDelegate#bindItem} function
       * implemented by the {@link #delegate} property.
       *
       * @param item {qx.ui.core.Widget} The internally created and used
       *   list or group item.
       * @param index {Integer} The index of the item.
       */
      bindDefaultProperties: function bindDefaultProperties(item, index) {
        if (item.getUserData("cell.type") != "group") {
          // bind model first
          this.bindProperty("", "model", null, item, index);
          this.bindProperty(this.getLabelPath(), "label", this.getLabelOptions(), item, index);

          if (this.getIconPath() != null) {
            this.bindProperty(this.getIconPath(), "icon", this.getIconOptions(), item, index);
          }
        } else {
          this.bindProperty(this.getGroupLabelPath(), "value", this.getGroupLabelOptions(), item, index);
        }
      },

      /**
       * Helper-Method for binding a given property from the model to the target
       * widget.
       * This method should only be called in the
       * {@link IListDelegate#bindItem} function implemented by the
       * {@link #delegate} property.
       *
       * @param sourcePath {String | null} The path to the property in the model.
       *   If you use an empty string, the whole model item will be bound.
       * @param targetProperty {String} The name of the property in the target widget.
       * @param options {Map | null} The options to use for the binding.
       * @param targetWidget {qx.ui.core.Widget} The target widget.
       * @param index {Integer} The index of the current binding.
       */
      bindProperty: function bindProperty(sourcePath, targetProperty, options, targetWidget, index) {
        var type = targetWidget.getUserData("cell.type");

        var bindPath = this.__getBindPath(index, sourcePath, type);

        if (options) {
          options.ignoreConverter = "model";
        }

        var id = this._list.bind(bindPath, targetWidget, targetProperty, options);

        this.__addBinding(targetWidget, id);
      },

      /**
       * Helper-Method for binding a given property from the target widget to
       * the model.
       * This method should only be called in the
       * {@link IListDelegate#bindItem} function implemented by the
       * {@link #delegate} property.
       *
       * @param targetPath {String | null} The path to the property in the model.
       * @param sourceProperty {String} The name of the property in the target.
       * @param options {Map | null} The options to use for the binding.
       * @param sourceWidget {qx.ui.core.Widget} The source widget.
       * @param index {Integer} The index of the current binding.
       */
      bindPropertyReverse: function bindPropertyReverse(targetPath, sourceProperty, options, sourceWidget, index) {
        var type = sourceWidget.getUserData("cell.type");

        var bindPath = this.__getBindPath(index, targetPath, type);

        var id = sourceWidget.bind(sourceProperty, this._list, bindPath, options);

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
       * Configure the passed item if a delegate is set and the needed
       * function {@link IListDelegate#configureItem} is available.
       *
       * @param item {qx.ui.core.Widget} item to configure.
       */
      _configureItem: function _configureItem(item) {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.configureItem != null) {
          delegate.configureItem(item);
        }
      },

      /**
       * Configure the passed item if a delegate is set and the needed
       * function {@link IListDelegate#configureGroupItem} is available.
       *
       * @param item {qx.ui.core.Widget} item to configure.
       */
      _configureGroupItem: function _configureGroupItem(item) {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.configureGroupItem != null) {
          delegate.configureGroupItem(item);
        }
      },

      /**
       * Sets up the binding for the given item and index.
       *
       * @param item {qx.ui.core.Widget} The internally created and used item.
       * @param index {Integer} The index of the item.
       */
      _bindItem: function _bindItem(item, index) {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.bindItem != null) {
          delegate.bindItem(this, item, index);
        } else {
          this.bindDefaultProperties(item, index);
        }
      },

      /**
       * Sets up the binding for the given group item and index.
       *
       * @param item {qx.ui.core.Widget} The internally created and used item.
       * @param index {Integer} The index of the item.
       */
      _bindGroupItem: function _bindGroupItem(item, index) {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.bindGroupItem != null) {
          delegate.bindGroupItem(this, item, index);
        } else {
          this.bindDefaultProperties(item, index);
        }
      },

      /**
       * Removes the binding of the given item.
       *
       * @param item {qx.ui.core.Widget} The item which the binding should
       *   be removed.
       */
      _removeBindingsFrom: function _removeBindingsFrom(item) {
        var bindings = this.__getBindings(item);

        while (bindings.length > 0) {
          var id = bindings.pop();

          try {
            this._list.removeBinding(id);
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
       * @param type {String} The type <code>["item", "group"]</code>.
       * @return {String} The binding path
       */
      __getBindPath: function __getBindPath(index, path, type) {
        var bindPath = "model[" + index + "]";

        if (type == "group") {
          bindPath = "groups[" + index + "]";
        }

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
  qx.ui.list.core.MWidgetController.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.list.provider.IListProvider": {
        "require": true
      },
      "qx.ui.list.core.MWidgetController": {
        "require": true
      },
      "qx.ui.virtual.layer.WidgetCell": {},
      "qx.util.Delegate": {},
      "qx.ui.form.ListItem": {},
      "qx.ui.virtual.cell.WidgetCell": {},
      "qx.ui.basic.Label": {}
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
  
  ************************************************************************ */

  /**
   * The provider implements the {@link qx.ui.virtual.core.IWidgetCellProvider} API,
   * which can be used as delegate for the widget cell rendering and it
   * provides a API to bind the model with the rendered item.
   *
   * @internal
   */
  qx.Class.define("qx.ui.list.provider.WidgetProvider", {
    extend: qx.core.Object,
    implement: [qx.ui.virtual.core.IWidgetCellProvider, qx.ui.list.provider.IListProvider],
    include: [qx.ui.list.core.MWidgetController],

    /**
     * Creates the <code>WidgetProvider</code>
     *
     * @param list {qx.ui.list.List} list to provide.
     */
    construct: function construct(list) {
      qx.core.Object.constructor.call(this);
      this._list = list;
      this._itemRenderer = this.createItemRenderer();
      this._groupRenderer = this.createGroupRenderer();

      this._itemRenderer.addListener("created", this._onItemCreated, this);

      this._groupRenderer.addListener("created", this._onGroupItemCreated, this);

      this._list.addListener("changeDelegate", this._onChangeDelegate, this);
    },
    members: {
      /** @type {qx.ui.virtual.cell.WidgetCell} the used item renderer */
      _itemRenderer: null,

      /** @type {qx.ui.virtual.cell.WidgetCell} the used group renderer */
      _groupRenderer: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */
      // interface implementation
      getCellWidget: function getCellWidget(row, column) {
        var widget = null;

        if (!this._list._isGroup(row)) {
          widget = this._itemRenderer.getCellWidget();
          widget.setUserData("cell.type", "item");

          this._bindItem(widget, this._list._lookup(row));

          if (this._list._manager.isItemSelected(row)) {
            this._styleSelectabled(widget);
          } else {
            this._styleUnselectabled(widget);
          }
        } else {
          widget = this._groupRenderer.getCellWidget();
          widget.setUserData("cell.type", "group");

          this._bindGroupItem(widget, this._list._lookupGroup(row));
        }

        return widget;
      },
      // interface implementation
      poolCellWidget: function poolCellWidget(widget) {
        this._removeBindingsFrom(widget);

        if (widget.getUserData("cell.type") == "item") {
          this._itemRenderer.pool(widget);
        } else if (widget.getUserData("cell.type") == "group") {
          this._groupRenderer.pool(widget);
        }

        this._onPool(widget);
      },
      // interface implementation
      createLayer: function createLayer() {
        return new qx.ui.virtual.layer.WidgetCell(this);
      },
      // interface implementation
      createItemRenderer: function createItemRenderer() {
        var createWidget = qx.util.Delegate.getMethod(this.getDelegate(), "createItem");

        if (createWidget == null) {
          createWidget = function createWidget() {
            return new qx.ui.form.ListItem();
          };
        }

        var renderer = new qx.ui.virtual.cell.WidgetCell();
        renderer.setDelegate({
          createWidget: createWidget
        });
        return renderer;
      },
      // interface implementation
      createGroupRenderer: function createGroupRenderer() {
        var createWidget = qx.util.Delegate.getMethod(this.getDelegate(), "createGroupItem");

        if (createWidget == null) {
          createWidget = function createWidget() {
            var group = new qx.ui.basic.Label();
            group.setAppearance("group-item");
            return group;
          };
        }

        var renderer = new qx.ui.virtual.cell.WidgetCell();
        renderer.setDelegate({
          createWidget: createWidget
        });
        return renderer;
      },
      // interface implementation
      styleSelectabled: function styleSelectabled(row) {
        var widget = this.__getWidgetFrom(row);

        this._styleSelectabled(widget);
      },
      // interface implementation
      styleUnselectabled: function styleUnselectabled(row) {
        var widget = this.__getWidgetFrom(row);

        this._styleUnselectabled(widget);
      },
      // interface implementation
      isSelectable: function isSelectable(row) {
        if (this._list._isGroup(row)) {
          return false;
        }

        var widget = this._list._layer.getRenderedCellWidget(row, 0);

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
        this.__updateStates(widget, {
          selected: 1
        });
      },

      /**
       * Styles a not selected item.
       *
       * @param widget {qx.ui.core.Widget} widget to style.
       */
      _styleUnselectabled: function _styleUnselectabled(widget) {
        this.__updateStates(widget, {});
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
       * Event handler for the created item widget event.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onItemCreated: function _onItemCreated(event) {
        var widget = event.getData();

        this._configureItem(widget);
      },

      /**
       * Event handler for the created item widget event.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onGroupItemCreated: function _onGroupItemCreated(event) {
        var widget = event.getData();

        this._configureGroupItem(widget);
      },

      /**
       * Event handler for the change delegate event.
       *
       * @param event {qx.event.type.Data} fired event.
       */
      _onChangeDelegate: function _onChangeDelegate(event) {
        this._itemRenderer.dispose();

        this._itemRenderer = this.createItemRenderer();

        this._itemRenderer.addListener("created", this._onItemCreated, this);

        this._groupRenderer.dispose();

        this._groupRenderer = this.createGroupRenderer();

        this._groupRenderer.addListener("created", this._onGroupItemCreated, this);

        this.removeBindings();

        this._list.getPane().fullUpdate();
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Helper method to get the widget from the passed row.
       *
       * @param row {Integer} row to search.
       * @return {qx.ui.core.Widget|null} The found widget or <code>null</code> when no widget found.
       */
      __getWidgetFrom: function __getWidgetFrom(row) {
        return this._list._layer.getRenderedCellWidget(row, 0);
      },

      /**
       * Helper method to update the states from a widget.
       *
       * @param widget {qx.ui.core.Widget} widget to set states.
       * @param states {Map} the state to set.
       */
      __updateStates: function __updateStates(widget, states) {
        if (widget == null) {
          return;
        }

        this._itemRenderer.updateStates(widget, states);
      }
    },
    destruct: function destruct() {
      this._itemRenderer.dispose();

      this._groupRenderer.dispose();

      this._itemRenderer = this._groupRenderer = null;
    }
  });
  qx.ui.list.provider.WidgetProvider.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-56.js.map
