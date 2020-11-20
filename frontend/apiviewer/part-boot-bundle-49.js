(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.menubar.Button": {
        "require": true
      },
      "qx.ui.toolbar.PartContainer": {},
      "qx.ui.core.queue.Appearance": {},
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
  
  ************************************************************************ */

  /**
   * The button to fill the menubar
   *
   * @childControl arrow {qx.ui.basic.Image} arrow widget to show a submenu is available
   */
  qx.Class.define("qx.ui.toolbar.MenuButton", {
    extend: qx.ui.menubar.Button,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Appearance of the widget */
      appearance: {
        refine: true,
        init: "toolbar-menubutton"
      },

      /** Whether the button should show an arrow to indicate the menu behind it */
      showArrow: {
        check: "Boolean",
        init: false,
        themeable: true,
        apply: "_applyShowArrow"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.toolbar.MenuButton.prototype._applyVisibility.base.call(this, value, old); // hide the menu too


        var menu = this.getMenu();

        if (value != "visible" && menu) {
          menu.hide();
        } // trigger a appearance recalculation of the parent


        var parent = this.getLayoutParent();

        if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
          qx.ui.core.queue.Appearance.add(parent);
        }
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "arrow":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._addAt(control, 10);

            break;
        }

        return control || qx.ui.toolbar.MenuButton.prototype._createChildControlImpl.base.call(this, id);
      },
      // property apply routine
      _applyShowArrow: function _applyShowArrow(value, old) {
        if (value) {
          this._showChildControl("arrow");
        } else {
          this._excludeChildControl("arrow");
        }
      }
    }
  });
  qx.ui.toolbar.MenuButton.$$dbClassInfo = $$dbClassInfo;
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Generic escaping and unescaping of DOM strings.
   *
   * {@link qx.bom.String} for (un)escaping of HTML strings.
   * {@link qx.xml.String} for (un)escaping of XML strings.
   */
  qx.Bootstrap.define("qx.util.StringEscape", {
    statics: {
      /**
       * generic escaping method
       *
       * @param str {String} string to escape
       * @param charCodeToEntities {Map} entity to charcode map
       * @return {String} escaped string
       */
      escape: function escape(str, charCodeToEntities) {
        var entity,
            result = "";

        for (var i = 0, l = str.length; i < l; i++) {
          var chr = str.charAt(i);
          var code = chr.charCodeAt(0);

          if (charCodeToEntities[code]) {
            entity = "&" + charCodeToEntities[code] + ";";
          } else {
            if (code > 0x7F) {
              entity = "&#" + code + ";";
            } else {
              entity = chr;
            }
          }

          result += entity;
        }

        return result;
      },

      /**
       * generic unescaping method
       *
       * @param str {String} string to unescape
       * @param entitiesToCharCode {Map} charcode to entity map
       * @return {String} unescaped string
       */
      unescape: function unescape(str, entitiesToCharCode) {
        return str.replace(/&[#\w]+;/gi, function (entity) {
          var chr = entity;
          var entity = entity.substring(1, entity.length - 1);
          var code = entitiesToCharCode[entity];

          if (code) {
            chr = String.fromCharCode(code);
          } else {
            if (entity.charAt(0) == '#') {
              if (entity.charAt(1).toUpperCase() == 'X') {
                code = entity.substring(2); // match hex number

                if (code.match(/^[0-9A-Fa-f]+$/gi)) {
                  chr = String.fromCharCode(parseInt(code, 16));
                }
              } else {
                code = entity.substring(1); // match integer

                if (code.match(/^\d+$/gi)) {
                  chr = String.fromCharCode(parseInt(code, 10));
                }
              }
            }
          }

          return chr;
        });
      }
    }
  });
  qx.util.StringEscape.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.virtual.core.ILayer": {
        "require": true
      },
      "qx.ui.core.queue.Widget": {}
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
   * Abstract base class for layers of a virtual pane.
   *
   * This class queues calls to {@link #fullUpdate}, {@link #updateLayerWindow}
   * and {@link #updateLayerData} and only performs the absolute necessary
   * actions. Concrete implementation of this class must at least implement
   * the {@link #_fullUpdate} method. Additionally the two methods
   * {@link #_updateLayerWindow} and {@link #_updateLayerData} may be implemented
   * to increase the performance.
   */
  qx.Class.define("qx.ui.virtual.layer.Abstract", {
    extend: qx.ui.core.Widget,
    type: "abstract",
    implement: [qx.ui.virtual.core.ILayer],

    /*
     *****************************************************************************
        CONSTRUCTOR
     *****************************************************************************
     */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);
      this.__jobs = {};
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      anonymous: {
        refine: true,
        init: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __jobs: null,
      __arguments: null,
      __firstRow: null,
      __firstColumn: null,
      __rowSizes: null,
      __columnSizes: null,

      /**
       * Get the first rendered row
       *
       * @return {Integer} The first rendered row
       */
      getFirstRow: function getFirstRow() {
        return this.__firstRow;
      },

      /**
       * Get the first rendered column
       *
       * @return {Integer} The first rendered column
       */
      getFirstColumn: function getFirstColumn() {
        return this.__firstColumn;
      },

      /**
       * Get the sizes of the rendered rows
       *
       * @return {Integer[]} List of row heights
       */
      getRowSizes: function getRowSizes() {
        return this.__rowSizes || [];
      },

      /**
       * Get the sizes of the rendered column
       *
       * @return {Integer[]} List of column widths
       */
      getColumnSizes: function getColumnSizes() {
        return this.__columnSizes || [];
      },
      // overridden
      syncWidget: function syncWidget(jobs) {
        // return if the layer is not yet rendered
        // it will rendered in the appear event
        if (!this.getContentElement().getDomElement()) {
          return;
        }

        if (this.__jobs.fullUpdate || this.__jobs.updateLayerWindow && this.__jobs.updateLayerData) {
          this._fullUpdate.apply(this, this.__arguments);
        } else if (this.__jobs.updateLayerWindow) {
          this._updateLayerWindow.apply(this, this.__arguments);
        } else if (this.__jobs.updateLayerData && this.__rowSizes) {
          this._updateLayerData();
        }

        if (this.__jobs.fullUpdate || this.__jobs.updateLayerWindow) {
          var args = this.__arguments;
          this.__firstRow = args[0];
          this.__firstColumn = args[1];
          this.__rowSizes = args[2];
          this.__columnSizes = args[3];
        }

        this.__jobs = {};
      },

      /**
       * Update the layer to reflect changes in the data the layer displays.
       *
       * Note: It is guaranteed that this method is only called after the layer
       * has been rendered.
       */
      _updateLayerData: function _updateLayerData() {
        this._fullUpdate(this.__firstRow, this.__firstColumn, this.__rowSizes, this.__columnSizes);
      },

      /**
       * Do a complete update of the layer. All cached data should be discarded.
       * This method is called e.g. after changes to the grid geometry
       * (row/column sizes, row/column count, ...).
       *
       * Note: It is guaranteed that this method is only called after the layer
       * has been rendered.
       *
       * @param firstRow {Integer} Index of the first row to display
       * @param firstColumn {Integer} Index of the first column to display
       * @param rowSizes {Integer[]} Array of heights for each row to display
       * @param columnSizes {Integer[]} Array of widths for each column to display
       */
      _fullUpdate: function _fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        throw new Error("Abstract method '_fullUpdate' called!");
      },

      /**
       * Update the layer to display a different window of the virtual grid.
       * This method is called if the pane is scrolled, resized or cells
       * are prefetched. The implementation can assume that no other grid
       * data has been changed since the last "fullUpdate" of "updateLayerWindow"
       * call.
       *
       * Note: It is guaranteed that this method is only called after the layer
       * has been rendered.
       *
       * @param firstRow {Integer} Index of the first row to display
       * @param firstColumn {Integer} Index of the first column to display
       * @param rowSizes {Integer[]} Array of heights for each row to display
       * @param columnSizes {Integer[]} Array of widths for each column to display
       */
      _updateLayerWindow: function _updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        this._fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
      },
      // interface implementation
      updateLayerData: function updateLayerData() {
        this.__jobs.updateLayerData = true;
        qx.ui.core.queue.Widget.add(this);
      },
      // interface implementation
      fullUpdate: function fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        this.__arguments = arguments;
        this.__jobs.fullUpdate = true;
        qx.ui.core.queue.Widget.add(this);
      },
      // interface implementation
      updateLayerWindow: function updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        this.__arguments = arguments;
        this.__jobs.updateLayerWindow = true;
        qx.ui.core.queue.Widget.add(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__jobs = this.__arguments = this.__rowSizes = this.__columnSizes = null;
    }
  });
  qx.ui.virtual.layer.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.ui.core.MChildrenHandling": {
        "require": true
      },
      "qx.ui.virtual.core.IWidgetCellProvider": {
        "construct": true
      },
      "qx.ui.core.Spacer": {},
      "qx.ui.core.FocusHandler": {},
      "qx.ui.core.Widget": {}
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
   * The WidgetCell layer renders each cell with a qooxdoo widget. The concrete
   * widget instance for each cell is provided by a cell provider.
   */
  qx.Class.define("qx.ui.virtual.layer.WidgetCell", {
    extend: qx.ui.virtual.layer.Abstract,
    include: [qx.ui.core.MChildrenHandling],

    /**
     * @param widgetCellProvider {qx.ui.virtual.core.IWidgetCellProvider} This
     *    class manages the life cycle of the cell widgets.
     */
    construct: function construct(widgetCellProvider) {
      qx.ui.virtual.layer.Abstract.constructor.call(this);
      this.setZIndex(12);
      {
        this.assertInterface(widgetCellProvider, qx.ui.virtual.core.IWidgetCellProvider);
      }
      this._cellProvider = widgetCellProvider;
      this.__spacerPool = [];
    },

    /*
     *****************************************************************************
        PROPERTIES
     *****************************************************************************
     */
    properties: {
      // overridden
      anonymous: {
        refine: true,
        init: false
      }
    },
    events: {
      /**
       * Is fired when the {@link #_fullUpdate} or the
       * {@link #_updateLayerWindow} is finished.
       */
      updated: "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __spacerPool: null,

      /**
      * Returns the widget used to render the given cell. May return null if the
      * cell isn’t rendered currently rendered.
      *
      * @param row {Integer} The cell's row index
      * @param column {Integer} The cell's column index
      * @return {qx.ui.core.LayoutItem|null} the widget used to render the given
      *    cell or <code>null</code>
      */
      getRenderedCellWidget: function getRenderedCellWidget(row, column) {
        if (this._getChildren().length === 0) {
          return null;
        }

        var columnCount = this.getColumnSizes().length;
        var rowCount = this.getRowSizes().length;
        var firstRow = this.getFirstRow();
        var firstColumn = this.getFirstColumn();

        if (row < firstRow || row >= firstRow + rowCount || column < firstColumn || column >= firstColumn + columnCount) {
          return null;
        }

        var childIndex = column - firstColumn + (row - firstRow) * columnCount;

        var widget = this._getChildren()[childIndex];

        if (!widget || widget.getUserData("cell.empty")) {
          return null;
        } else {
          return widget;
        }
      },

      /**
       * Get the spacer widget, for empty cells
       *
       * @return {qx.ui.core.Spacer} The spacer widget.
       */
      _getSpacer: function _getSpacer() {
        var spacer = this.__spacerPool.pop();

        if (!spacer) {
          spacer = new qx.ui.core.Spacer();
          spacer.setUserData("cell.empty", 1);
        }

        return spacer;
      },

      /**
       * Activates one of the still not empty items.
       * @param elementToPool {qx.ui.core.Widget} The widget which gets pooled.
       */
      _activateNotEmptyChild: function _activateNotEmptyChild(elementToPool) {
        // get the current active element
        var active = qx.ui.core.FocusHandler.getInstance().getActiveWidget(); // if the element to pool is active or one of its children

        if (active == elementToPool || qx.ui.core.Widget.contains(elementToPool, active)) {
          // search for a new child to activate
          var children = this._getChildren();

          for (var i = children.length - 1; i >= 0; i--) {
            if (!children[i].getUserData("cell.empty")) {
              children[i].activate();
              break;
            }
          }

          ;
        }
      },
      // overridden
      _fullUpdate: function _fullUpdate(firstRow, firstColumn, rowSizes, columnSizes) {
        var cellProvider = this._cellProvider;

        var children = this._getChildren().concat();

        for (var i = 0; i < children.length; i++) {
          var child = children[i];

          if (child.getUserData("cell.empty")) {
            this.__spacerPool.push(child);
          } else {
            this._activateNotEmptyChild(child);

            cellProvider.poolCellWidget(child);
          }
        }

        var top = 0;
        var left = 0;
        var visibleItems = [];

        for (var y = 0; y < rowSizes.length; y++) {
          for (var x = 0; x < columnSizes.length; x++) {
            var row = firstRow + y;
            var column = firstColumn + x;

            var item = cellProvider.getCellWidget(row, column) || this._getSpacer();

            visibleItems.push(item);
            item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
            item.setUserData("cell.row", row);
            item.setUserData("cell.column", column);

            this._add(item);

            left += columnSizes[x];
          }

          top += rowSizes[y];
          left = 0;
        }

        children.forEach(function (child) {
          if (visibleItems.indexOf(child) === -1) {
            this._remove(child);
          }
        }.bind(this));
        this.fireEvent("updated");
      },
      _updateLayerWindow: function _updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes) {
        // compute overlap of old and new window
        //
        //      +---+
        //      |  ##--+
        //      |  ##  |
        //      +--##  |
        //         +---+
        //
        {
          this.assertPositiveInteger(firstRow);
          this.assertPositiveInteger(firstColumn);
          this.assertArray(rowSizes);
          this.assertArray(columnSizes);
        }
        var lastRow = firstRow + rowSizes.length - 1;
        var lastColumn = firstColumn + columnSizes.length - 1;
        var overlap = {
          firstRow: Math.max(firstRow, this.getFirstRow()),
          lastRow: Math.min(lastRow, this._lastRow),
          firstColumn: Math.max(firstColumn, this.getFirstColumn()),
          lastColumn: Math.min(lastColumn, this._lastColumn)
        };
        this._lastColumn = lastColumn;
        this._lastRow = lastRow;

        if (overlap.firstRow > overlap.lastRow || overlap.firstColumn > overlap.lastColumn) {
          return this._fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
        } // collect the widgets to move


        var children = this._getChildren();

        var lineLength = this.getColumnSizes().length;
        var widgetsToMove = [];
        var widgetsToMoveIndexes = {};

        for (var row = firstRow; row <= lastRow; row++) {
          widgetsToMove[row] = [];

          for (var column = firstColumn; column <= lastColumn; column++) {
            if (row >= overlap.firstRow && row <= overlap.lastRow && column >= overlap.firstColumn && column <= overlap.lastColumn) {
              var x = column - this.getFirstColumn();
              var y = row - this.getFirstRow();
              var index = y * lineLength + x;
              widgetsToMove[row][column] = children[index];
              widgetsToMoveIndexes[index] = true;
            }
          }
        }

        var cellProvider = this._cellProvider; // pool widgets

        var children = this._getChildren().concat();

        for (var i = 0; i < children.length; i++) {
          if (!widgetsToMoveIndexes[i]) {
            var child = children[i];

            if (child.getUserData("cell.empty")) {
              this.__spacerPool.push(child);
            } else {
              this._activateNotEmptyChild(child);

              cellProvider.poolCellWidget(child);
            }
          }
        }

        var top = 0;
        var left = 0;
        var visibleItems = [];

        for (var y = 0; y < rowSizes.length; y++) {
          for (var x = 0; x < columnSizes.length; x++) {
            var row = firstRow + y;
            var column = firstColumn + x;

            var item = widgetsToMove[row][column] || cellProvider.getCellWidget(row, column) || this._getSpacer();

            visibleItems.push(item);
            item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
            item.setUserData("cell.row", row);
            item.setUserData("cell.column", column);

            this._add(item);

            left += columnSizes[x];
          }

          top += rowSizes[y];
          left = 0;
        }

        children.forEach(function (child) {
          if (visibleItems.indexOf(child) === -1) {
            this._remove(child);
          }
        }.bind(this));
        this.fireEvent("updated");
      }
    },
    destruct: function destruct() {
      var children = this._getChildren();

      for (var i = 0; i < children.length; i++) {
        children[i].dispose();
      }

      this._cellProvider = this.__spacerPool = null;
    }
  });
  qx.ui.virtual.layer.WidgetCell.$$dbClassInfo = $$dbClassInfo;
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A widget cell renderer manages a pool of widgets to render cells in a
   * {@link qx.ui.virtual.layer.WidgetCell} layer.
   */
  qx.Interface.define("qx.ui.virtual.cell.IWidgetCell", {
    members: {
      /**
       * Get a widget instance to render the cell
       *
       * @param data {var} Data needed for the cell to render.
       * @param states {Map} The states set on the cell (e.g. <i>selected</i>,
       * <i>focused</i>, <i>editable</i>).
       *
       * @return {qx.ui.core.LayoutItem} The cell widget
       */
      getCellWidget: function getCellWidget(data, states) {},

      /**
       * Release the given widget instance.
       *
       * Either pool or dispose the widget.
       *
       * @param widget {qx.ui.core.LayoutItem} The cell widget to pool
       */
      pool: function pool(widget) {},

      /**
       * Update the states of the given widget.
       *
       * @param widget {qx.ui.core.LayoutItem} The cell widget to update
       * @param states {Map} The cell widget's states
       */
      updateStates: function updateStates(widget, states) {},

      /**
       * Update the data the cell widget should display
       *
       * @param widget {qx.ui.core.LayoutItem} The cell widget to update
       * @param data {var} The data to display
       */
      updateData: function updateData(widget, data) {}
    }
  });
  qx.ui.virtual.cell.IWidgetCell.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.virtual.cell.IWidgetCell": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /**
   * Abstract base class for widget based cell renderer.
   */
  qx.Class.define("qx.ui.virtual.cell.AbstractWidget", {
    extend: qx.core.Object,
    implement: [qx.ui.virtual.cell.IWidgetCell],
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__pool = [];
    },
    events: {
      /** Fired when a new <code>LayoutItem</code> is created. */
      "created": "qx.event.type.Data"
    },
    members: {
      __pool: null,

      /**
       * Creates the widget instance.
       *
       * @abstract
       * @return {qx.ui.core.LayoutItem} The widget used to render a cell
       */
      _createWidget: function _createWidget() {
        throw new Error("abstract method call");
      },
      // interface implementation
      updateData: function updateData(widget, data) {
        throw new Error("abstract method call");
      },
      // interface implementation
      updateStates: function updateStates(widget, states) {
        var oldStates = widget.getUserData("cell.states"); // remove old states

        if (oldStates) {
          var newStates = states || {};

          for (var state in oldStates) {
            if (!newStates[state]) {
              widget.removeState(state);
            }
          }
        } else {
          oldStates = {};
        } // apply new states


        if (states) {
          for (var state in states) {
            if (!oldStates.state) {
              widget.addState(state);
            }
          }
        }

        widget.setUserData("cell.states", states);
      },
      // interface implementation
      getCellWidget: function getCellWidget(data, states) {
        var widget = this.__getWidgetFromPool();

        this.updateStates(widget, states);
        this.updateData(widget, data);
        return widget;
      },
      // interface implementation
      pool: function pool(widget) {
        this.__pool.push(widget);
      },

      /**
       * Cleanup all <code>LayoutItem</code> and destroy them.
       */
      _cleanupPool: function _cleanupPool() {
        var widget = this.__pool.pop();

        while (widget) {
          widget.destroy();
          widget = this.__pool.pop();
        }
      },

      /**
       * Returns a <code>LayoutItem</code> from the pool, when the pool is empty
       * a new <code>LayoutItem</code> is created.
       *
       * @return {qx.ui.core.LayoutItem} The cell widget
       */
      __getWidgetFromPool: function __getWidgetFromPool() {
        var widget = this.__pool.shift();

        if (widget == null) {
          widget = this._createWidget();
          this.fireDataEvent("created", widget);
        }

        return widget;
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this._cleanupPool();

      this.__pool = null;
    }
  });
  qx.ui.virtual.cell.AbstractWidget.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.virtual.cell.AbstractWidget": {
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.util.PropertyUtil": {}
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
   * EXPERIMENTAL!
   *
   * Cell renderer can be used for Widget rendering. The Widget creation can be configured with the
   * {@link #delegate} property:
   *
   * <pre class="javascript">
   * widgetCell.setDelegate(
   * {
   *   createWidget : function() {
   *     return new qx.ui.form.ListItem();
   *   }
   * });
   * </pre>
   *
   * When the {@link #delegate} property is not used {@link qx.ui.core.Widget} instances are created as
   * fallback.
   *
   * The {@link #updateData} method can be used to update any Widget property. Just use a <code>Map</code>
   * with property name as key:
   *
   * <pre class="javascript">
   * // widget is a qx.ui.form.ListItem instance
   * widgetCell.updateData(widget,
   * {
   *   label: "my label value",
   *   icon: "qx/icon/22/emotes/face-angel.png"
   * });
   * </pre>
   */
  qx.Class.define("qx.ui.virtual.cell.WidgetCell", {
    extend: qx.ui.virtual.cell.AbstractWidget,
    properties: {
      /**
       * Delegation object, which can have one or more functions defined by the
       * {@link qx.ui.virtual.cell.IWidgetCellDelegate} interface.
       */
      delegate: {
        apply: "_applyDelegate",
        init: null,
        nullable: true
      }
    },
    members: {
      // apply method
      _applyDelegate: function _applyDelegate(value, old) {
        this._cleanupPool();
      },
      // overridden
      _createWidget: function _createWidget() {
        var delegate = this.getDelegate();

        if (delegate != null && delegate.createWidget != null) {
          return delegate.createWidget();
        } else {
          return new qx.ui.core.Widget();
        }
      },
      // overridden
      updateData: function updateData(widget, data) {
        for (var key in data) {
          if (qx.Class.hasProperty(widget.constructor, key)) {
            qx.util.PropertyUtil.setUserValue(widget, key, data[key]);
          } else {
            throw new Error("Can't update data! The key '" + key + "' is not a Property!");
          }
        }
      }
    }
  });
  qx.ui.virtual.cell.WidgetCell.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Image": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MExecutable": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The small folder open/close button
   */
  qx.Class.define("qx.ui.tree.core.FolderOpenButton", {
    extend: qx.ui.basic.Image,
    include: qx.ui.core.MExecutable,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.basic.Image.constructor.call(this);
      this.initOpen();
      this.addListener("tap", this._onTap);
      this.addListener("pointerdown", this._stopPropagation, this);
      this.addListener("pointerup", this._stopPropagation, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Whether the button state is "open"
       */
      open: {
        check: "Boolean",
        init: false,
        event: "changeOpen",
        apply: "_applyOpen"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // property apply
      _applyOpen: function _applyOpen(value, old) {
        value ? this.addState("opened") : this.removeState("opened");
        this.execute();
      },

      /**
       * Stop tap event propagation
       *
       * @param e {qx.event.type.Event} The event object
       */
      _stopPropagation: function _stopPropagation(e) {
        e.stopPropagation();
      },

      /**
       * Pointer tap event listener
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onTap: function _onTap(e) {
        this.toggleOpen();
        e.stopPropagation();
      }
    }
  });
  qx.ui.tree.core.FolderOpenButton.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.Grid": {
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The default header cell widget
   *
   * @childControl label {qx.ui.basic.Label} label of the header cell
   * @childControl sort-icon {qx.ui.basic.Image} sort icon of the header cell
   * @childControl icon {qx.ui.basic.Image} icon of the header cell
   */
  qx.Class.define("qx.ui.table.headerrenderer.HeaderCell", {
    extend: qx.ui.container.Composite,
    construct: function construct() {
      qx.ui.container.Composite.constructor.call(this);
      var layout = new qx.ui.layout.Grid();
      layout.setRowFlex(0, 1);
      layout.setColumnFlex(1, 1);
      layout.setColumnFlex(2, 1);
      this.setLayout(layout);
    },
    properties: {
      appearance: {
        refine: true,
        init: "table-header-cell"
      },

      /** header cell label */
      label: {
        check: "String",
        init: null,
        nullable: true,
        apply: "_applyLabel"
      },

      /** The icon URL of the sorting indicator */
      sortIcon: {
        check: "String",
        init: null,
        nullable: true,
        apply: "_applySortIcon",
        themeable: true
      },

      /** Icon URL */
      icon: {
        check: "String",
        init: null,
        nullable: true,
        apply: "_applyIcon"
      }
    },
    members: {
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        if (value) {
          this._showChildControl("label").setValue(value);
        } else {
          this._excludeChildControl("label");
        }
      },
      // property apply
      _applySortIcon: function _applySortIcon(value, old) {
        if (value) {
          this._showChildControl("sort-icon").setSource(value);
        } else {
          this._excludeChildControl("sort-icon");
        }
      },
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        if (value) {
          this._showChildControl("icon").setSource(value);
        } else {
          this._excludeChildControl("icon");
        }
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "label":
            control = new qx.ui.basic.Label(this.getLabel()).set({
              anonymous: true,
              allowShrinkX: true
            });

            this._add(control, {
              row: 0,
              column: 1
            });

            break;

          case "sort-icon":
            control = new qx.ui.basic.Image(this.getSortIcon());
            control.setAnonymous(true);

            this._add(control, {
              row: 0,
              column: 2
            });

            break;

          case "icon":
            control = new qx.ui.basic.Image(this.getIcon()).set({
              anonymous: true,
              allowShrinkX: true
            });

            this._add(control, {
              row: 0,
              column: 0
            });

            break;
        }

        return control || qx.ui.table.headerrenderer.HeaderCell.prototype._createChildControlImpl.base.call(this, id);
      }
    }
  });
  qx.ui.table.headerrenderer.HeaderCell.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.LayoutItem": {
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
       2007-2008 Derrell Lipman
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Derrell Lipman (derrell)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * All of the resizing information about a column.
   *
   *  This is used internally by qx.ui.table and qx.ui.progressive's table and
   *  may be used for other widgets as well.
   */
  qx.Class.define("qx.ui.core.ColumnData", {
    extend: qx.ui.core.LayoutItem,
    construct: function construct() {
      qx.ui.core.LayoutItem.constructor.call(this);
      this.setColumnWidth("auto");
    },
    members: {
      __computedWidth: null,
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        this.__computedWidth = width;
      },

      /**
       * Get the computed width of the column.
       * @return {Integer} Computed column width
       */
      getComputedWidth: function getComputedWidth() {
        return this.__computedWidth;
      },

      /**
       * Get the column's flex value
       *
       * @return {Integer} The column's flex value
       */
      getFlex: function getFlex() {
        return this.getLayoutProperties().flex || 0;
      },

      /**
       * Set the column width. The column width can be one of the following
       * values:
       *
       * * Pixels: e.g. <code>23</code>
       * * Autosized: <code>"auto"</code>
       * * Flex: e.g. <code>"1*"</code>
       * * Percent: e.g. <code>"33%"</code>
       *
       * @param width {Integer|String} The column width
       * @param flex {Integer?0} Optional flex value of the column
       */
      setColumnWidth: function setColumnWidth(width, flex) {
        var flex = flex || 0;
        var percent = null;

        if (typeof width == "number") {
          this.setWidth(width);
        } else if (typeof width == "string") {
          if (width == "auto") {
            flex = 1;
          } else {
            var match = width.match(/^[0-9]+(?:\.[0-9]+)?([%\*])$/);

            if (match) {
              if (match[1] == "*") {
                flex = parseFloat(width);
              } else {
                percent = width;
              }
            }
          }
        }

        this.setLayoutProperties({
          flex: flex,
          width: percent
        });
      }
    },
    environment: {
      "qx.tableResizeDebug": false
    }
  });
  qx.ui.core.ColumnData.$$dbClassInfo = $$dbClassInfo;
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
       2007 Derrell Lipman
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Derrell Lipman (derrell)
  
  ************************************************************************ */

  /**
   * An abstract resize behavior.  All resize behaviors should extend this
   * class.
   */
  qx.Class.define("qx.ui.table.columnmodel.resizebehavior.Abstract", {
    type: "abstract",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Called when the ResizeTableColumnModel is initialized, and upon loading of
       * a new TableModel, to allow the Resize Behaviors to know how many columns
       * are in use.
       *
       * @abstract
       * @param numColumns {Integer} The number of columns in use.
       * @throws {Error} the abstract function warning.
       */
      _setNumColumns: function _setNumColumns(numColumns) {
        throw new Error("_setNumColumns is abstract");
      },

      /**
       * Called when the table has first been rendered.
       *
       * @abstract
       * @param event {var} The <i>onappear</i> event object.
       * @param forceRefresh {Boolean?false} Whether a refresh should be forced
       * @throws {Error} the abstract function warning.
       */
      onAppear: function onAppear(event, forceRefresh) {
        throw new Error("onAppear is abstract");
      },

      /**
       * Called when the table width changes due to either a window size change
       * or a parent object changing size causing the table to change size.
       *
       * @abstract
       * @param event {var} The <i>tableWidthChanged</i> event object.
       * @throws {Error} the abstract function warning.
       */
      onTableWidthChanged: function onTableWidthChanged(event) {
        throw new Error("onTableWidthChanged is abstract");
      },

      /**
       * Called when the use of vertical scroll bar in the table changes, either
       * from present to not present, or vice versa.
       *
       * @abstract
       * @param event {var} The <i>verticalScrollBarChanged</i> event object.  This event has data,
       *     obtained via event.getValue(), which is a boolean indicating whether a
       *     vertical scroll bar is now present.
       * @throws {Error} the abstract function warning.
       */
      onVerticalScrollBarChanged: function onVerticalScrollBarChanged(event) {
        throw new Error("onVerticalScrollBarChanged is abstract");
      },

      /**
       * Called when a column width is changed.
       *
       * @abstract
       * @param event {var} The <i>widthChanged</i> event object.  This event has data, obtained via
       *     event.getValue(), which is an object with three properties: the column
       *     which changed width (data.col), the old width (data.oldWidth) and the new
       *     width (data.newWidth).
       * @throws {Error} the abstract function warning.
       */
      onColumnWidthChanged: function onColumnWidthChanged(event) {
        throw new Error("onColumnWidthChanged is abstract");
      },

      /**
       * Called when a column visibility is changed.
       *
       * @abstract
       * @param event {var} The <i>visibilityChanged</i> event object.  This event has data, obtained
       *     via event.getValue(), which is an object with two properties: the column
       *     which changed width (data.col) and the new visibility of the column
       *     (data.visible).
       * @throws {Error} the abstract function warning.
       */
      onVisibilityChanged: function onVisibilityChanged(event) {
        throw new Error("onVisibilityChanged is abstract");
      },

      /**
       * Determine the inner width available to columns in the table.
       *
       * @return {Integer} The available width
       */
      _getAvailableWidth: function _getAvailableWidth() {
        var tableColumnModel = this.getTableColumnModel(); // Get the inner width off the table

        var table = tableColumnModel.getTable();

        var scrollerArr = table._getPaneScrollerArr();

        if (!scrollerArr[0] || !scrollerArr[0].getLayoutParent().getBounds()) {
          return null;
        }

        ;
        var scrollerParentWidth = scrollerArr[0].getLayoutParent().getBounds().width;
        var lastScroller = scrollerArr[scrollerArr.length - 1];
        scrollerParentWidth -= lastScroller.getPaneInsetRight();
        return scrollerParentWidth;
      }
    }
  });
  qx.ui.table.columnmodel.resizebehavior.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.ui.core.ColumnData": {
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.columnmodel.resizebehavior.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.util.DeferredCall": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007 Derrell Lipman
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Derrell Lipman (derrell)
  
  ************************************************************************ */

  /**
   * The default resize behavior.  Until a resize model is loaded, the default
   * behavior is to:
   * <ol>
   *   <li>
   *     Upon the table initially appearing, and upon any window resize, divide
   *     the table space equally between the visible columns.
   *   </li>
   *   <li>
   *     When a column is increased in width, all columns to its right are
   *     pushed to the right with no change to their widths.  This may push some
   *     columns off the right edge of the table, causing a horizontal scroll
   *     bar to appear.
   *   </li>
   *   <li>
   *     When a column is decreased in width, if the total width of all columns
   *     is <i>greater than</i> the table width, no additional column width
   *     change is made.
   *   </li>
   *   <li>
   *     When a column is decreased in width, if the total width of all columns
   *     is <i>less than</i> the table width, the visible column
   *     immediately to the right of the column which decreased in width has its
   *     width increased to fill the remaining space.
   *   </li>
   * </ol>
   *
   * A resize model may be loaded to provide more guidance on how to adjust
   * column width upon each of the events: initial appear, window resize, and
   * column resize. *** TO BE FILLED IN ***
   *
   * @require(qx.ui.core.ColumnData)
   */
  qx.Class.define("qx.ui.table.columnmodel.resizebehavior.Default", {
    extend: qx.ui.table.columnmodel.resizebehavior.Abstract,
    construct: function construct() {
      qx.ui.table.columnmodel.resizebehavior.Abstract.constructor.call(this);
      this.__resizeColumnData = []; // This layout is not connected to a widget but to this class. This class
      // must implement the method "getLayoutChildren", which must return all
      // columns (LayoutItems) which should be recalculated. The call
      // "layout.renderLayout" will call the method "renderLayout" on each column
      // data object
      // The advantage of the use of the normal layout manager is that the
      // semantics of flex and percent are exactly the same as in the widget code.

      this.__layout = new qx.ui.layout.HBox();

      this.__layout.connectToWidget(this);

      this.__deferredComputeColumnsFlexWidth = new qx.util.DeferredCall(this._computeColumnsFlexWidth, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * A function to instantiate a resize behavior column data object.
       */
      newResizeBehaviorColumnData: {
        check: "Function",
        init: function init(obj) {
          return new qx.ui.core.ColumnData();
        }
      },

      /**
       * Whether to reinitialize default widths on each appear event.
       * Typically, one would want to initialize the default widths only upon
       * the first appearance of the table, but the original behavior was to
       * reinitialize it even if the table is hidden and then reshown
       * (e.g. it's in a pageview and the page is switched and then switched
       * back).
       */
      initializeWidthsOnEveryAppear: {
        check: "Boolean",
        init: false
      },

      /**
       * The table column model in use.  Of particular interest is the method
       * <i>getTable</i> which is a reference to the table widget.  This allows
       * access to any other features of the table, for use in calculating widths
       * of columns.
       */
      tableColumnModel: {
        check: "qx.ui.table.columnmodel.Resize"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __layout: null,
      __layoutChildren: null,
      __resizeColumnData: null,
      __deferredComputeColumnsFlexWidth: null,

      /**
       * Whether we have initialized widths on the first appear yet
       */
      __widthsInitialized: false,

      /**
       * Set the width of a column.
       *
       * @param col {Integer} The column whose width is to be set
       *
       * @param width {Integer|String}
       *   The width of the specified column.  The width may be specified as
       *   integer number of pixels (e.g. 100), a string representing percentage
       *   of the inner width of the Table (e.g. "25%"), or a string
       *   representing a flex width (e.g. "1*").
       *
       * @param flex {Integer?0} Optional flex value of the column
       *
       * @throws {Error}
       *   Error is thrown if the provided column number is out of the range.
       */
      setWidth: function setWidth(col, width, flex) {
        // Ensure the column is within range
        if (col >= this.__resizeColumnData.length) {
          throw new Error("Column number out of range");
        } // Set the new width


        this.__resizeColumnData[col].setColumnWidth(width, flex);

        this.__deferredComputeColumnsFlexWidth.schedule();
      },

      /**
       * Set the minimum width of a column.
       *
       * @param col {Integer}
       *   The column whose minimum width is to be set
       *
       * @param width {Integer}
       *   The minimum width of the specified column.
       *
       *
       * @throws {Error}
       *   Error is thrown if the provided column number is out of the range.
       */
      setMinWidth: function setMinWidth(col, width) {
        // Ensure the column is within range
        if (col >= this.__resizeColumnData.length) {
          throw new Error("Column number out of range");
        } // Set the new width


        this.__resizeColumnData[col].setMinWidth(width);

        this.__deferredComputeColumnsFlexWidth.schedule();
      },

      /**
       * Set the maximum width of a column.
       *
       * @param col {Integer}
       *   The column whose maximum width is to be set
       *
       * @param width {Integer}
       *   The maximum width of the specified column.
       *
       *
       * @throws {Error}
       *   Error is thrown if the provided column number is out of the range.
       */
      setMaxWidth: function setMaxWidth(col, width) {
        // Ensure the column is within range
        if (col >= this.__resizeColumnData.length) {
          throw new Error("Column number out of range");
        } // Set the new width


        this.__resizeColumnData[col].setMaxWidth(width);

        this.__deferredComputeColumnsFlexWidth.schedule();
      },

      /**
       * Set any or all of the width, minimum width, and maximum width of a
       * column in a single call.
       *
       * @param col {Integer}
       *   The column whose attributes are to be changed
       *
       * @param map {Map}
       *   A map containing any or all of the property names "width", "minWidth",
       *   and "maxWidth".  The property values are as described for
       *   {@link #setWidth}, {@link #setMinWidth} and {@link #setMaxWidth}
       *   respectively.
       *
       *
       * @throws {Error}
       *   Error is thrown if the provided column number is out of the range.
       */
      set: function set(col, map) {
        for (var prop in map) {
          switch (prop) {
            case "width":
              this.setWidth(col, map[prop]);
              break;

            case "minWidth":
              this.setMinWidth(col, map[prop]);
              break;

            case "maxWidth":
              this.setMaxWidth(col, map[prop]);
              break;

            default:
              throw new Error("Unknown property: " + prop);
          }
        }
      },
      // overloaded
      onAppear: function onAppear(event, forceRefresh) {
        // If we haven't initialized widths at least once, or
        // they want us to reinitialize widths on every appear event...
        if (forceRefresh === true || !this.__widthsInitialized || this.getInitializeWidthsOnEveryAppear()) {
          // Calculate column widths
          this._computeColumnsFlexWidth(); // Track that we've initialized widths at least once


          this.__widthsInitialized = true;
        }
      },
      // overloaded
      onTableWidthChanged: function onTableWidthChanged(event) {
        this._computeColumnsFlexWidth();
      },
      // overloaded
      onVerticalScrollBarChanged: function onVerticalScrollBarChanged(event) {
        this._computeColumnsFlexWidth();
      },
      // overloaded
      onColumnWidthChanged: function onColumnWidthChanged(event) {
        // Extend the next column to fill blank space
        this._extendNextColumn(event);
      },
      // overloaded
      onVisibilityChanged: function onVisibilityChanged(event) {
        // Event data properties: col, visible
        var data = event.getData(); // If a column just became visible, resize all columns.

        if (data.visible) {
          this._computeColumnsFlexWidth();

          return;
        } // Extend the last column to fill blank space


        this._extendLastColumn(event);
      },
      // overloaded
      _setNumColumns: function _setNumColumns(numColumns) {
        var colData = this.__resizeColumnData; // Are there now fewer (or the same number of) columns than there were
        // previously?

        if (numColumns <= colData.length) {
          // Yup.  Delete the extras.
          colData.splice(numColumns, colData.length);
          return;
        } // There are more columns than there were previously.  Allocate more.


        for (var i = colData.length; i < numColumns; i++) {
          colData[i] = this.getNewResizeBehaviorColumnData()();
          colData[i].columnNumber = i;
        }
      },

      /**
       * This method is required by the box layout. If returns an array of items
       * to relayout.
       *
       * @return {qx.ui.core.ColumnData[]} The list of column data object to layout.
       */
      getLayoutChildren: function getLayoutChildren() {
        return this.__layoutChildren;
      },

      /**
       * Computes the width of all flexible children.
       *
       */
      _computeColumnsFlexWidth: function _computeColumnsFlexWidth() {
        this.__deferredComputeColumnsFlexWidth.cancel();

        var width = this._getAvailableWidth();

        if (width === null) {
          return;
        }

        var tableColumnModel = this.getTableColumnModel();
        var visibleColumns = tableColumnModel.getVisibleColumns();
        var visibleColumnsLength = visibleColumns.length;
        var colData = this.__resizeColumnData;
        var i, l;

        if (visibleColumnsLength === 0) {
          return;
        } // Create an array of the visible columns


        var columns = [];

        for (i = 0; i < visibleColumnsLength; i++) {
          columns.push(colData[visibleColumns[i]]);
        }

        this.__layoutChildren = columns;

        this.__clearLayoutCaches(); // Use a horizontal box layout to determine the available width.


        this.__layout.renderLayout(width, 100, {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }); // Now that we've calculated the width, set it.


        for (i = 0, l = columns.length; i < l; i++) {
          var colWidth = columns[i].getComputedWidth();
          tableColumnModel.setColumnWidth(visibleColumns[i], colWidth);
        }
      },

      /**
       * Clear all layout caches of the column datas.
       */
      __clearLayoutCaches: function __clearLayoutCaches() {
        this.__layout.invalidateChildrenCache();

        var children = this.__layoutChildren;

        for (var i = 0, l = children.length; i < l; i++) {
          children[i].invalidateLayoutCache();
        }
      },

      /**
       * Extend the visible column to right of the column which just changed
       * width, to fill any available space within the inner width of the table.
       * This means that if the sum of the widths of all columns exceeds the
       * inner width of the table, no change is made.  If, on the other hand,
       * the sum of the widths of all columns is less than the inner width of
       * the table, the visible column to the right of the column which just
       * changed width is extended to take up the width available within the
       * inner width of the table.
       *
       *
       * @param event {qx.event.type.Data}
       *   The event object.
       *
       */
      _extendNextColumn: function _extendNextColumn(event) {
        var tableColumnModel = this.getTableColumnModel(); // Event data properties: col, oldWidth, newWidth

        var data = event.getData();
        var visibleColumns = tableColumnModel.getVisibleColumns(); // Determine the available width

        var width = this._getAvailableWidth(); // Determine the number of visible columns


        var numColumns = visibleColumns.length; // Did this column become longer than it was?

        if (data.newWidth > data.oldWidth) {
          // Yup.  Don't resize anything else.  The other columns will just get
          // pushed off and require scrollbars be added (if not already there).
          return;
        } // This column became shorter.  See if we no longer take up the full
        // space that's available to us.


        var i;
        var nextCol;
        var widthUsed = 0;

        for (i = 0; i < numColumns; i++) {
          widthUsed += tableColumnModel.getColumnWidth(visibleColumns[i]);
        } // If the used width is less than the available width...


        if (widthUsed < width) {
          // ... then determine the next visible column
          for (i = 0; i < visibleColumns.length; i++) {
            if (visibleColumns[i] == data.col) {
              nextCol = visibleColumns[i + 1];
              break;
            }
          }

          if (nextCol) {
            // Make the next column take up the available space.
            var newWidth = width - (widthUsed - tableColumnModel.getColumnWidth(nextCol));
            tableColumnModel.setColumnWidth(nextCol, newWidth);
          }
        }
      },

      /**
       * If a column was just made invisible, extend the last column to fill any
       * available space within the inner width of the table.  This means that
       * if the sum of the widths of all columns exceeds the inner width of the
       * table, no change is made.  If, on the other hand, the sum of the widths
       * of all columns is less than the inner width of the table, the last
       * column is extended to take up the width available within the inner
       * width of the table.
       *
       *
       * @param event {qx.event.type.Data}
       *   The event object.
       *
       */
      _extendLastColumn: function _extendLastColumn(event) {
        var tableColumnModel = this.getTableColumnModel(); // Event data properties: col, visible

        var data = event.getData(); // If the column just became visible, don't make any width changes

        if (data.visible) {
          return;
        } // Get the array of visible columns


        var visibleColumns = tableColumnModel.getVisibleColumns(); // If no columns are visible...

        if (visibleColumns.length == 0) {
          return;
        } // Determine the available width


        var width = this._getAvailableWidth(tableColumnModel); // Determine the number of visible columns


        var numColumns = visibleColumns.length; // See if we no longer take up the full space that's available to us.

        var i;
        var lastCol;
        var widthUsed = 0;

        for (i = 0; i < numColumns; i++) {
          widthUsed += tableColumnModel.getColumnWidth(visibleColumns[i]);
        } // If the used width is less than the available width...


        if (widthUsed < width) {
          // ... then get the last visible column
          lastCol = visibleColumns[visibleColumns.length - 1]; // Make the last column take up the available space.

          var newWidth = width - (widthUsed - tableColumnModel.getColumnWidth(lastCol));
          tableColumnModel.setColumnWidth(lastCol, newWidth);
        }
      },

      /**
       * Returns an array of the resizing information of a column.
       *
       * @return {qx.ui.core.ColumnData[]} array of the resizing information of a column.
       */
      _getResizeColumnData: function _getResizeColumnData() {
        return this.__resizeColumnData;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__resizeColumnData = this.__layoutChildren = null;

      this._disposeObjects("__layout", "__deferredComputeColumnsFlexWidth");
    }
  });
  qx.ui.table.columnmodel.resizebehavior.Default.$$dbClassInfo = $$dbClassInfo;
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
  
  ************************************************************************ */

  /**
   * Interface for a row renderer.
   */
  qx.Interface.define("qx.ui.table.IRowRenderer", {
    members: {
      /**
       * Updates a data row.
       *
       * The rowInfo map contains the following properties:
       * <ul>
       * <li>rowData (var): contains the row data for the row.
       *   The kind of this object depends on the table model, see
       *   {@link ITableModel#getRowData()}</li>
       * <li>row (int): the model index of the row.</li>
       * <li>selected (boolean): whether a cell in this row is selected.</li>
       * <li>focusedRow (boolean): whether the focused cell is in this row.</li>
       * <li>table (qx.ui.table.Table): the table the row belongs to.</li>
       * </ul>
       *
       * @abstract
       * @param rowInfo {Map} A map containing the information about the row to
       *      update.
       * @param rowElement {Element} the DOM element that renders the data row.
       */
      updateDataRowElement: function updateDataRowElement(rowInfo, rowElement) {},

      /**
       * Get the row's height CSS style taking the box model into account
       *
       * @param height {Integer} The row's (border-box) height in pixel
       */
      getRowHeightStyle: function getRowHeightStyle(height) {},

      /**
       * Create a style string, which will be set as the style property of the row.
       *
       * @param rowInfo {Map} A map containing the information about the row to
       *      update. See {@link #updateDataRowElement} for more information.
       */
      createRowStyle: function createRowStyle(rowInfo) {},

      /**
       * Create a HTML class string, which will be set as the class property of the row.
       *
       * @param rowInfo {Map} A map containing the information about the row to
       *      update. See {@link #updateDataRowElement} for more information.
       */
      getRowClass: function getRowClass(rowInfo) {}
    }
  });
  qx.ui.table.IRowRenderer.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.table.IRowRenderer": {
        "require": true
      },
      "qx.theme.manager.Meta": {
        "construct": true
      },
      "qx.theme.manager.Font": {},
      "qx.theme.manager.Color": {},
      "qx.bom.element.Style": {},
      "qx.bom.Font": {},
      "qx.bom.client.Css": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxmodel": {
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
       2007 Visionet GmbH, http://www.visionet.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132) STZ-IDA
       * Dietrich Streifert (level420) Visionet
  
  ************************************************************************ */

  /**
   * The default data row renderer.
   */
  qx.Class.define("qx.ui.table.rowrenderer.Default", {
    extend: qx.core.Object,
    implement: qx.ui.table.IRowRenderer,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.initThemeValues(); // dynamic theme switch

      {
        qx.theme.manager.Meta.getInstance().addListener("changeTheme", this.initThemeValues, this);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Whether the focused row should be highlighted. */
      highlightFocusRow: {
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
      _colors: null,
      _fontStyle: null,
      _fontStyleString: null,

      /**
       * Initializes the colors from the color theme.
       * @internal
       */
      initThemeValues: function initThemeValues() {
        this._fontStyleString = "";
        this._fontStyle = {};
        this._colors = {}; // link to font theme

        this._renderFont(qx.theme.manager.Font.getInstance().resolve("default")); // link to color theme


        var colorMgr = qx.theme.manager.Color.getInstance();
        this._colors.bgcolFocusedSelected = colorMgr.resolve("table-row-background-focused-selected");
        this._colors.bgcolFocused = colorMgr.resolve("table-row-background-focused");
        this._colors.bgcolSelected = colorMgr.resolve("table-row-background-selected");
        this._colors.bgcolEven = colorMgr.resolve("table-row-background-even");
        this._colors.bgcolOdd = colorMgr.resolve("table-row-background-odd");
        this._colors.colSelected = colorMgr.resolve("table-row-selected");
        this._colors.colNormal = colorMgr.resolve("table-row");
        this._colors.horLine = colorMgr.resolve("table-row-line");
      },

      /**
       * the sum of the vertical insets. This is needed to compute the box model
       * independent size
       */
      _insetY: 1,
      // borderBottom

      /**
       * Render the new font and update the table pane content
       * to reflect the font change.
       *
       * @param font {qx.bom.Font} The font to use for the table row
       */
      _renderFont: function _renderFont(font) {
        if (font) {
          this._fontStyle = font.getStyles();
          this._fontStyleString = qx.bom.element.Style.compile(this._fontStyle);
          this._fontStyleString = this._fontStyleString.replace(/"/g, "'");
        } else {
          this._fontStyleString = "";
          this._fontStyle = qx.bom.Font.getDefaultStyles();
        }
      },
      // interface implementation
      updateDataRowElement: function updateDataRowElement(rowInfo, rowElem) {
        var fontStyle = this._fontStyle;
        var style = rowElem.style; // set font styles

        qx.bom.element.Style.setStyles(rowElem, fontStyle);

        if (rowInfo.focusedRow && this.getHighlightFocusRow()) {
          style.backgroundColor = rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused;
        } else {
          if (rowInfo.selected) {
            style.backgroundColor = this._colors.bgcolSelected;
          } else {
            style.backgroundColor = rowInfo.row % 2 == 0 ? this._colors.bgcolEven : this._colors.bgcolOdd;
          }
        }

        style.color = rowInfo.selected ? this._colors.colSelected : this._colors.colNormal;
        style.borderBottom = "1px solid " + this._colors.horLine;
      },

      /**
       * Get the row's height CSS style taking the box model into account
       *
       * @param height {Integer} The row's (border-box) height in pixel
       * @return {String} CSS rule for the row height
       */
      getRowHeightStyle: function getRowHeightStyle(height) {
        if (qx.core.Environment.get("css.boxmodel") == "content") {
          height -= this._insetY;
        }

        return "height:" + height + "px;";
      },
      // interface implementation
      createRowStyle: function createRowStyle(rowInfo) {
        var rowStyle = [];
        rowStyle.push(";");
        rowStyle.push(this._fontStyleString);
        rowStyle.push("background-color:");

        if (rowInfo.focusedRow && this.getHighlightFocusRow()) {
          rowStyle.push(rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused);
        } else {
          if (rowInfo.selected) {
            rowStyle.push(this._colors.bgcolSelected);
          } else {
            rowStyle.push(rowInfo.row % 2 == 0 ? this._colors.bgcolEven : this._colors.bgcolOdd);
          }
        }

        rowStyle.push(';color:');
        rowStyle.push(rowInfo.selected ? this._colors.colSelected : this._colors.colNormal);
        rowStyle.push(';border-bottom: 1px solid ', this._colors.horLine);
        return rowStyle.join("");
      },
      getRowClass: function getRowClass(rowInfo) {
        return "";
      },

      /**
       * Add extra attributes to each row.
       *
       * @param rowInfo {Object}
       *   The following members are available in rowInfo:
       *   <dl>
       *     <dt>table {qx.ui.table.Table}</dt>
       *     <dd>The table object</dd>
       *
       *     <dt>styleHeight {Integer}</dt>
       *     <dd>The height of this (and every) row</dd>
       *
       *     <dt>row {Integer}</dt>
       *     <dd>The number of the row being added</dd>
       *
       *     <dt>selected {Boolean}</dt>
       *     <dd>Whether the row being added is currently selected</dd>
       *
       *     <dt>focusedRow {Boolean}</dt>
       *     <dd>Whether the row being added is currently focused</dd>
       *
       *     <dt>rowData {Array}</dt>
       *     <dd>The array row from the data model of the row being added</dd>
       *   </dl>
       *
       * @return {String}
       *   Any additional attributes and their values that should be added to the
       *   div tag for the row.
       */
      getRowAttributes: function getRowAttributes(rowInfo) {
        return "";
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._colors = this._fontStyle = this._fontStyleString = null; // remove dynamic theme listener

      {
        qx.theme.manager.Meta.getInstance().removeListener("changeTheme", this.initThemeValues, this);
      }
    }
  });
  qx.ui.table.rowrenderer.Default.$$dbClassInfo = $$dbClassInfo;
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
       2009 Derrell Lipman
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Derrell Lipman (derrell)
  
  ************************************************************************ */

  /**
   * Interface for creating the column visibility menu
   */
  qx.Interface.define("qx.ui.table.IColumnMenuButton", {
    properties: {
      /**
       * The menu which is displayed when this button is pressed.
       */
      menu: {}
    },
    members: {
      /**
       * Instantiate a sub-widget.
       *
       * @param item {String}
       *   One of the following strings, indicating what type of
       *   column-menu-specific object to instantiate:
       *   <dl>
       *     <dt>menu</dt>
       *     <dd>
       *       Instantiate a menu which will appear when the column visibility
       *       button is pressed. No options are provided in this case.
       *     </dd>
       *     <dt>menu-button</dt>
       *     <dd>
       *       Instantiate a button to correspond to a column within the
       *       table. The options are a map containing <i>text</i>, the name of
       *       the column; <i>column</i>, the column number; and
       *       <i>bVisible</i>, a boolean indicating whether this column is
       *       currently visible. The instantiated return object must implement
       *       interface {@link qx.ui.table.IColumnMenuItem}
       *     </dd>
       *     <dt>user-button</dt>
       *     <dd>
       *       Instantiate a button for other than a column name. This is used,
       *       for example, to add the "Reset column widths" button when the
       *       Resize column model is requested. The options is a map containing
       *       <i>text</i>, the text to present in the button.
       *     </dd>
       *     <dt>separator</dt>
       *     <dd>
       *       Instantiate a separator object to added to the menu. This is
       *       used, for example, to separate the table column name list from
       *       the "Reset column widths" button when the Resize column model is
       *       requested. No options are provided in this case.
       *     </dd>
       *   </dl>
       *
       * @param options {Map}
       *   Options specific to the <i>item</i> being requested.
       *
       * @return {qx.ui.core.Widget}
       *   The instantiated object as specified by <i>item</i>.
       */
      factory: function factory(item, options) {
        return true;
      },

      /**
       * Empty the menu of all items, in preparation for building a new column
       * visibility menu.
       *
       */
      empty: function empty() {
        return true;
      }
    }
  });
  qx.ui.table.IColumnMenuButton.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.MenuButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.table.IColumnMenuButton": {
        "require": true
      },
      "qx.ui.core.Blocker": {
        "construct": true
      },
      "qx.ui.menu.Menu": {},
      "qx.ui.table.columnmenu.MenuItem": {},
      "qx.ui.menu.Button": {},
      "qx.ui.menu.Separator": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 Derrell Lipman
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Derrell Lipman (derrell)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * The traditional qx.ui.menu.MenuButton to access the column visibility menu.
   */
  qx.Class.define("qx.ui.table.columnmenu.Button", {
    extend: qx.ui.form.MenuButton,
    implement: qx.ui.table.IColumnMenuButton,

    /**
     * Create a new instance of a column visibility menu button. This button
     * also contains the factory for creating each of the sub-widgets.
     */
    construct: function construct() {
      qx.ui.form.MenuButton.constructor.call(this); // add blocker

      this.__blocker = new qx.ui.core.Blocker(this);
    },
    members: {
      __columnMenuButtons: null,
      __blocker: null,
      // Documented in qx.ui.table.IColumnMenu
      factory: function factory(item, options) {
        switch (item) {
          case "menu":
            var menu = new qx.ui.menu.Menu();
            this.setMenu(menu);
            return menu;

          case "menu-button":
            var menuButton = new qx.ui.table.columnmenu.MenuItem(options.text);
            menuButton.setColumnVisible(options.bVisible);
            this.getMenu().add(menuButton);
            return menuButton;

          case "user-button":
            var button = new qx.ui.menu.Button(options.text);
            button.set({
              appearance: "table-column-reset-button"
            });
            return button;

          case "separator":
            return new qx.ui.menu.Separator();

          default:
            throw new Error("Unrecognized factory request: " + item);
        }
      },

      /**
       * Returns the blocker of the columnmenu button.
       *
       * @return {qx.ui.core.Blocker} the blocker.
       */
      getBlocker: function getBlocker() {
        return this.__blocker;
      },
      // Documented in qx.ui.table.IColumnMenu
      empty: function empty() {
        var menu = this.getMenu();
        var entries = menu.getChildren();

        for (var i = 0, l = entries.length; i < l; i++) {
          entries[0].destroy();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__blocker.dispose();
    }
  });
  qx.ui.table.columnmenu.Button.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.type.Dom": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
  
  ************************************************************************ */

  /**
   * A selection manager. This is a helper class that handles all selection
   * related events and updates a SelectionModel.
   * <p>
   * Widgets that support selection should use this manager. This way the only
   * thing the widget has to do is mapping pointer or key events to indexes and
   * call the corresponding handler method.
   *
   * @see SelectionModel
   */
  qx.Class.define("qx.ui.table.selection.Manager", {
    extend: qx.core.Object,

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
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The selection model where to set the selection changes.
       */
      selectionModel: {
        check: "qx.ui.table.selection.Model"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __lastPointerDownHandled: null,

      /**
       * Handles the tap event.
       *
       * @param index {Integer} the index the pointer is pointing at.
       * @param evt {qx.event.type.Tap} the pointer event.
       */
      handleTap: function handleTap(index, evt) {
        if (evt.isLeftPressed()) {
          var selectionModel = this.getSelectionModel();

          if (!selectionModel.isSelectedIndex(index)) {
            // This index is not selected -> We react when the pointer is pressed (because of drag and drop)
            this._handleSelectEvent(index, evt);

            this.__lastPointerDownHandled = true;
          } else {
            // This index is already selected -> We react when the pointer is released (because of drag and drop)
            this.__lastPointerDownHandled = false;
          }
        } else if (evt.isRightPressed() && evt.getModifiers() == 0) {
          var selectionModel = this.getSelectionModel();

          if (!selectionModel.isSelectedIndex(index)) {
            // This index is not selected -> Set the selection to this index
            selectionModel.setSelectionInterval(index, index);
          }
        }

        if (evt.isLeftPressed() && !this.__lastPointerDownHandled) {
          this._handleSelectEvent(index, evt);
        }
      },

      /**
       * Handles the key down event that is used as replacement for pointer taps
       * (Normally space).
       *
       * @param index {Integer} the index that is currently focused.
       * @param evt {Map} the key event.
       */
      handleSelectKeyDown: function handleSelectKeyDown(index, evt) {
        this._handleSelectEvent(index, evt);
      },

      /**
       * Handles a key down event that moved the focus (E.g. up, down, home, end, ...).
       *
       * @param index {Integer} the index that is currently focused.
       * @param evt {Map} the key event.
       */
      handleMoveKeyDown: function handleMoveKeyDown(index, evt) {
        var selectionModel = this.getSelectionModel();

        switch (evt.getModifiers()) {
          case 0:
            selectionModel.setSelectionInterval(index, index);
            break;

          case qx.event.type.Dom.SHIFT_MASK:
            var anchor = selectionModel.getAnchorSelectionIndex();

            if (anchor == -1) {
              selectionModel.setSelectionInterval(index, index);
            } else {
              selectionModel.setSelectionInterval(anchor, index);
            }

            break;
        }
      },

      /**
       * Handles a select event.
       *
       * @param index {Integer} the index the event is pointing at.
       * @param evt {Map} the pointer event.
       */
      _handleSelectEvent: function _handleSelectEvent(index, evt) {
        var selectionModel = this.getSelectionModel();
        var leadIndex = selectionModel.getLeadSelectionIndex();
        var anchorIndex = selectionModel.getAnchorSelectionIndex();

        if (evt.isShiftPressed()) {
          if (index != leadIndex || selectionModel.isSelectionEmpty()) {
            // The lead selection index was changed
            if (anchorIndex == -1) {
              anchorIndex = index;
            }

            if (evt.isCtrlOrCommandPressed()) {
              selectionModel.addSelectionInterval(anchorIndex, index);
            } else {
              selectionModel.setSelectionInterval(anchorIndex, index);
            }
          }
        } else if (evt.isCtrlOrCommandPressed()) {
          if (selectionModel.isSelectedIndex(index)) {
            selectionModel.removeSelectionInterval(index, index);
          } else {
            selectionModel.addSelectionInterval(index, index);
          }
        } else {
          // setSelectionInterval checks to see if the change is really necessary
          selectionModel.setSelectionInterval(index, index);
        }
      }
    }
  });
  qx.ui.table.selection.Manager.$$dbClassInfo = $$dbClassInfo;
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
       * David Perez Carmona (david-perez)
  
  ************************************************************************ */

  /**
   * A selection model.
   */
  qx.Class.define("qx.ui.table.selection.Model", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__selectedRangeArr = [];
      this.__anchorSelectionIndex = -1;
      this.__leadSelectionIndex = -1;
      this.hasBatchModeRefCount = 0;
      this.__hadChangeEventInBatchMode = false;
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the selection has changed. */
      "changeSelection": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {int} The selection mode "none". Nothing can ever be selected. */
      NO_SELECTION: 1,

      /** @type {int} The selection mode "single". This mode only allows one selected item. */
      SINGLE_SELECTION: 2,

      /**
       * @type {int} The selection mode "single interval". This mode only allows one
       * continuous interval of selected items.
       */
      SINGLE_INTERVAL_SELECTION: 3,

      /**
       * @type {int} The selection mode "multiple interval". This mode only allows any
       * selection.
       */
      MULTIPLE_INTERVAL_SELECTION: 4,

      /**
       * @type {int} The selection mode "multiple interval". This mode only allows any
       * selection. The difference with the previous one, is that multiple
       * selection is eased. A tap on an item, toggles its selection state.
       * On the other hand, MULTIPLE_INTERVAL_SELECTION does this behavior only
       * when Ctrl-tapping an item.
       */
      MULTIPLE_INTERVAL_SELECTION_TOGGLE: 5
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Set the selection mode. Valid values are {@link #NO_SELECTION},
       * {@link #SINGLE_SELECTION}, {@link #SINGLE_INTERVAL_SELECTION},
       * {@link #MULTIPLE_INTERVAL_SELECTION} and
       * {@link #MULTIPLE_INTERVAL_SELECTION_TOGGLE}.
       */
      selectionMode: {
        init: 2,
        //SINGLE_SELECTION,
        check: [1, 2, 3, 4, 5],
        //[ NO_SELECTION, SINGLE_SELECTION, SINGLE_INTERVAL_SELECTION, MULTIPLE_INTERVAL_SELECTION, MULTIPLE_INTERVAL_SELECTION_TOGGLE ],
        apply: "_applySelectionMode"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __hadChangeEventInBatchMode: null,
      __anchorSelectionIndex: null,
      __leadSelectionIndex: null,
      __selectedRangeArr: null,
      // selectionMode property modifier
      _applySelectionMode: function _applySelectionMode(selectionMode) {
        this.resetSelection();
      },

      /**
       *
       * Activates / Deactivates batch mode. In batch mode, no change events will be thrown but
       * will be collected instead. When batch mode is turned off again and any events have
       * been collected, one event is thrown to inform the listeners.
       *
       * This method supports nested calling, i. e. batch mode can be turned more than once.
       * In this case, batch mode will not end until it has been turned off once for each
       * turning on.
       *
       * @param batchMode {Boolean} true to activate batch mode, false to deactivate
       * @return {Boolean} true if batch mode is active, false otherwise
       * @throws {Error} if batch mode is turned off once more than it has been turned on
       */
      setBatchMode: function setBatchMode(batchMode) {
        if (batchMode) {
          this.hasBatchModeRefCount += 1;
        } else {
          if (this.hasBatchModeRefCount == 0) {
            throw new Error("Try to turn off batch mode althoug it was not turned on.");
          }

          this.hasBatchModeRefCount -= 1;

          if (this.__hadChangeEventInBatchMode) {
            this.__hadChangeEventInBatchMode = false;

            this._fireChangeSelection();
          }
        }

        return this.hasBatchMode();
      },

      /**
       *
       * Returns whether batch mode is active. See setter for a description of batch mode.
       *
       * @return {Boolean} true if batch mode is active, false otherwise
       */
      hasBatchMode: function hasBatchMode() {
        return this.hasBatchModeRefCount > 0;
      },

      /**
       * Returns the first argument of the last call to {@link #setSelectionInterval()},
       * {@link #addSelectionInterval()} or {@link #removeSelectionInterval()}.
       *
       * @return {Integer} the anchor selection index.
       */
      getAnchorSelectionIndex: function getAnchorSelectionIndex() {
        return this.__anchorSelectionIndex;
      },

      /**
       * Sets the anchor selection index. Only use this function, if you want manipulate
       * the selection manually.
       *
       * @param index {Integer} the index to set.
       */
      _setAnchorSelectionIndex: function _setAnchorSelectionIndex(index) {
        this.__anchorSelectionIndex = index;
      },

      /**
       * Returns the second argument of the last call to {@link #setSelectionInterval()},
       * {@link #addSelectionInterval()} or {@link #removeSelectionInterval()}.
       *
       * @return {Integer} the lead selection index.
       */
      getLeadSelectionIndex: function getLeadSelectionIndex() {
        return this.__leadSelectionIndex;
      },

      /**
       * Sets the lead selection index. Only use this function, if you want manipulate
       * the selection manually.
       *
       * @param index {Integer} the index to set.
       */
      _setLeadSelectionIndex: function _setLeadSelectionIndex(index) {
        this.__leadSelectionIndex = index;
      },

      /**
       * Returns an array that holds all the selected ranges of the table. Each
       * entry is a map holding information about the "minIndex" and "maxIndex" of the
       * selection range.
       *
       * @return {Map[]} array with all the selected ranges.
       */
      _getSelectedRangeArr: function _getSelectedRangeArr() {
        return this.__selectedRangeArr;
      },

      /**
       * Resets (clears) the selection.
       */
      resetSelection: function resetSelection() {
        if (!this.isSelectionEmpty()) {
          this._resetSelection();

          this._fireChangeSelection();
        }
      },

      /**
       * Returns whether the selection is empty.
       *
       * @return {Boolean} whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__selectedRangeArr.length == 0;
      },

      /**
       * Returns the number of selected items.
       *
       * @return {Integer} the number of selected items.
       */
      getSelectedCount: function getSelectedCount() {
        var selectedCount = 0;

        for (var i = 0; i < this.__selectedRangeArr.length; i++) {
          var range = this.__selectedRangeArr[i];
          selectedCount += range.maxIndex - range.minIndex + 1;
        }

        return selectedCount;
      },

      /**
       * Returns whether an index is selected.
       *
       * @param index {Integer} the index to check.
       * @return {Boolean} whether the index is selected.
       */
      isSelectedIndex: function isSelectedIndex(index) {
        for (var i = 0; i < this.__selectedRangeArr.length; i++) {
          var range = this.__selectedRangeArr[i];

          if (index >= range.minIndex && index <= range.maxIndex) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns the selected ranges as an array. Each array element has a
       * <code>minIndex</code> and a <code>maxIndex</code> property.
       *
       * @return {Map[]} the selected ranges.
       */
      getSelectedRanges: function getSelectedRanges() {
        // clone the selection array and the individual elements - this prevents the
        // caller from messing with the internal model
        var retVal = [];

        for (var i = 0; i < this.__selectedRangeArr.length; i++) {
          retVal.push({
            minIndex: this.__selectedRangeArr[i].minIndex,
            maxIndex: this.__selectedRangeArr[i].maxIndex
          });
        }

        return retVal;
      },

      /**
       * Calls an iterator function for each selected index.
       *
       * Usage Example:
       * <pre class='javascript'>
       * var selectedRowData = [];
       * mySelectionModel.iterateSelection(function(index) {
       *   selectedRowData.push(myTableModel.getRowData(index));
       * });
       * </pre>
       *
       * @param iterator {Function} the function to call for each selected index.
       *          Gets the current index as parameter.
       * @param object {var ? null} the object to use when calling the handler.
       *          (this object will be available via "this" in the iterator)
       */
      iterateSelection: function iterateSelection(iterator, object) {
        for (var i = 0; i < this.__selectedRangeArr.length; i++) {
          for (var j = this.__selectedRangeArr[i].minIndex; j <= this.__selectedRangeArr[i].maxIndex; j++) {
            iterator.call(object, j);
          }
        }
      },

      /**
       * Sets the selected interval. This will clear the former selection.
       *
       * @param fromIndex {Integer} the first index of the selection (including).
       * @param toIndex {Integer} the last index of the selection (including).
       */
      setSelectionInterval: function setSelectionInterval(fromIndex, toIndex) {
        var me = qx.ui.table.selection.Model;

        switch (this.getSelectionMode()) {
          case me.NO_SELECTION:
            return;

          case me.SINGLE_SELECTION:
            // Ensure there is actually a change of selection
            if (this.isSelectedIndex(toIndex)) {
              return;
            }

            fromIndex = toIndex;
            break;

          case me.MULTIPLE_INTERVAL_SELECTION_TOGGLE:
            this.setBatchMode(true);

            try {
              for (var i = fromIndex; i <= toIndex; i++) {
                if (!this.isSelectedIndex(i)) {
                  this._addSelectionInterval(i, i);
                } else {
                  this.removeSelectionInterval(i, i);
                }
              }
            } catch (e) {
              throw e;
            } finally {
              this.setBatchMode(false);
            }

            this._fireChangeSelection();

            return;
        }

        this._resetSelection();

        this._addSelectionInterval(fromIndex, toIndex);

        this._fireChangeSelection();
      },

      /**
       * Adds a selection interval to the current selection.
       *
       * @param fromIndex {Integer} the first index of the selection (including).
       * @param toIndex {Integer} the last index of the selection (including).
       */
      addSelectionInterval: function addSelectionInterval(fromIndex, toIndex) {
        var SelectionModel = qx.ui.table.selection.Model;

        switch (this.getSelectionMode()) {
          case SelectionModel.NO_SELECTION:
            return;

          case SelectionModel.MULTIPLE_INTERVAL_SELECTION:
          case SelectionModel.MULTIPLE_INTERVAL_SELECTION_TOGGLE:
            this._addSelectionInterval(fromIndex, toIndex);

            this._fireChangeSelection();

            break;

          default:
            this.setSelectionInterval(fromIndex, toIndex);
            break;
        }
      },

      /**
       * Removes an interval from the current selection.
       *
       * @param fromIndex {Integer} the first index of the interval (including).
       * @param toIndex {Integer} the last index of the interval (including).
       * @param rowsRemoved {Boolean?} rows were removed that caused this selection to change.
       *   If rows were removed, move the selections over so the same rows are selected as before.
       */
      removeSelectionInterval: function removeSelectionInterval(fromIndex, toIndex, rowsRemoved) {
        this.__anchorSelectionIndex = fromIndex;
        this.__leadSelectionIndex = toIndex;
        var minIndex = Math.min(fromIndex, toIndex);
        var maxIndex = Math.max(fromIndex, toIndex);
        var removeCount = maxIndex + 1 - minIndex; // Crop the affected ranges

        var newRanges = [];
        var extraRange = null;

        for (var i = 0; i < this.__selectedRangeArr.length; i++) {
          var range = this.__selectedRangeArr[i];

          if (range.minIndex > maxIndex) {
            if (rowsRemoved) {
              // Move whole selection up.
              range.minIndex -= removeCount;
              range.maxIndex -= removeCount;
            }
          } else if (range.maxIndex >= minIndex) {
            // This range is affected
            var minIsIn = range.minIndex >= minIndex;
            var maxIsIn = range.maxIndex >= minIndex && range.maxIndex <= maxIndex;

            if (minIsIn && maxIsIn) {
              // This range is removed completely
              range = null;
            } else if (minIsIn) {
              if (rowsRemoved) {
                range.minIndex = minIndex;
                range.maxIndex -= removeCount;
              } else {
                // The range is cropped from the left
                range.minIndex = maxIndex + 1;
              }
            } else if (maxIsIn) {
              // The range is cropped from the right
              range.maxIndex = minIndex - 1;
            } else {
              if (rowsRemoved) {
                range.maxIndex -= removeCount;
              } else {
                // The range is split
                extraRange = {
                  minIndex: maxIndex + 1,
                  maxIndex: range.maxIndex
                };
                range.maxIndex = minIndex - 1;
              }
            }
          }

          if (range) {
            newRanges.push(range);
            range = null;
          }

          if (extraRange) {
            newRanges.push(extraRange);
            extraRange = null;
          }
        }

        this.__selectedRangeArr = newRanges;

        this._fireChangeSelection();
      },

      /**
       * Resets (clears) the selection, but doesn't inform the listeners.
       */
      _resetSelection: function _resetSelection() {
        this.__selectedRangeArr = [];
        this.__anchorSelectionIndex = -1;
        this.__leadSelectionIndex = -1;
      },

      /**
       * Adds a selection interval to the current selection, but doesn't inform
       * the listeners.
       *
       * @param fromIndex {Integer} the first index of the selection (including).
       * @param toIndex {Integer} the last index of the selection (including).
       */
      _addSelectionInterval: function _addSelectionInterval(fromIndex, toIndex) {
        this.__anchorSelectionIndex = fromIndex;
        this.__leadSelectionIndex = toIndex;
        var minIndex = Math.min(fromIndex, toIndex);
        var maxIndex = Math.max(fromIndex, toIndex); // Find the index where the new range should be inserted

        var newRangeIndex = 0;

        for (; newRangeIndex < this.__selectedRangeArr.length; newRangeIndex++) {
          var range = this.__selectedRangeArr[newRangeIndex];

          if (range.minIndex > minIndex) {
            break;
          }
        } // Add the new range


        this.__selectedRangeArr.splice(newRangeIndex, 0, {
          minIndex: minIndex,
          maxIndex: maxIndex
        }); // Merge overlapping ranges


        var lastRange = this.__selectedRangeArr[0];

        for (var i = 1; i < this.__selectedRangeArr.length; i++) {
          var range = this.__selectedRangeArr[i];

          if (lastRange.maxIndex + 1 >= range.minIndex) {
            // The ranges are overlapping -> merge them
            lastRange.maxIndex = Math.max(lastRange.maxIndex, range.maxIndex); // Remove the current range

            this.__selectedRangeArr.splice(i, 1); // Check this index another time


            i--;
          } else {
            lastRange = range;
          }
        }
      },
      // this._dumpRanges();

      /**
       * Logs the current ranges for debug purposes.
       *
       */
      _dumpRanges: function _dumpRanges() {
        var text = "Ranges:";

        for (var i = 0; i < this.__selectedRangeArr.length; i++) {
          var range = this.__selectedRangeArr[i];
          text += " [" + range.minIndex + ".." + range.maxIndex + "]";
        }

        this.debug(text);
      },

      /**
       * Fires the "changeSelection" event to all registered listeners. If the selection model
       * currently is in batch mode, only one event will be thrown when batch mode is ended.
       *
       */
      _fireChangeSelection: function _fireChangeSelection() {
        if (this.hasBatchMode()) {
          // In batch mode, remember event but do not throw (yet)
          this.__hadChangeEventInBatchMode = true;
        } else {
          // If not in batch mode, throw event
          this.fireEvent("changeSelection");
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__selectedRangeArr = null;
    }
  });
  qx.ui.table.selection.Model.$$dbClassInfo = $$dbClassInfo;
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The table pane that shows a certain section from a table. This class handles
   * the display of the data part of a table and is therefore the base for virtual
   * scrolling.
   */
  qx.Class.define("qx.ui.table.pane.Pane", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param paneScroller {qx.ui.table.pane.Scroller} the TablePaneScroller the header belongs to.
     */
    construct: function construct(paneScroller) {
      qx.ui.core.Widget.constructor.call(this);
      this.__paneScroller = paneScroller;
      this.__lastColCount = 0;
      this.__lastRowCount = 0;
      this.__rowCache = [];
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Whether the current view port of the pane has not loaded data.
       * The data object of the event indicates if the table pane has to reload
       * data or not. Can be used to give the user feedback of the loading state
       * of the rows.
       */
      "paneReloadsData": "qx.event.type.Data",

      /**
       * Whenever the content of the table pane has been updated (rendered)
       * trigger a paneUpdated event. This allows the canvas cellrenderer to act
       * once the new cells have been integrated in the dom.
       */
      "paneUpdated": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The index of the first row to show. */
      firstVisibleRow: {
        check: "Number",
        init: 0,
        apply: "_applyFirstVisibleRow"
      },

      /** The number of rows to show. */
      visibleRowCount: {
        check: "Number",
        init: 0,
        apply: "_applyVisibleRowCount"
      },

      /**
       * Maximum number of cached rows. If the value is <code>-1</code> the cache
       * size is unlimited
       */
      maxCacheLines: {
        check: "Number",
        init: 1000,
        apply: "_applyMaxCacheLines"
      },
      // overridden
      allowShrinkX: {
        refine: true,
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __lastRowCount: null,
      __lastColCount: null,
      __paneScroller: null,
      __tableContainer: null,
      __focusedRow: null,
      __focusedCol: null,
      // sparse array to cache rendered rows
      __rowCache: null,
      __rowCacheCount: 0,
      // property modifier
      _applyFirstVisibleRow: function _applyFirstVisibleRow(value, old) {
        this.updateContent(false, value - old);
      },
      // property modifier
      _applyVisibleRowCount: function _applyVisibleRowCount(value, old) {
        this.updateContent(true);
      },
      // overridden
      _getContentHint: function _getContentHint() {
        // the preferred height is 400 pixel. We don't use rowCount * rowHeight
        // because this is typically too large.
        return {
          width: this.getPaneScroller().getTablePaneModel().getTotalWidth(),
          height: 400
        };
      },

      /**
       * Returns the TablePaneScroller this pane belongs to.
       *
       * @return {qx.ui.table.pane.Scroller} the TablePaneScroller.
       */
      getPaneScroller: function getPaneScroller() {
        return this.__paneScroller;
      },

      /**
       * Returns the table this pane belongs to.
       *
       * @return {qx.ui.table.Table} the table.
       */
      getTable: function getTable() {
        return this.__paneScroller.getTable();
      },

      /**
       * Sets the currently focused cell.
       *
       * @param col {Integer?null} the model index of the focused cell's column.
       * @param row {Integer?null} the model index of the focused cell's row.
       * @param massUpdate {Boolean ? false} Whether other updates are planned as well.
       *          If true, no repaint will be done.
       */
      setFocusedCell: function setFocusedCell(col, row, massUpdate) {
        if (col != this.__focusedCol || row != this.__focusedRow) {
          var oldRow = this.__focusedRow;
          this.__focusedCol = col;
          this.__focusedRow = row; // Update the focused row background

          if (row != oldRow && !massUpdate) {
            if (oldRow !== null) {
              this.updateContent(false, null, oldRow, true);
            }

            if (row !== null) {
              this.updateContent(false, null, row, true);
            }
          }
        }
      },

      /**
       * Event handler. Called when the selection has changed.
       */
      onSelectionChanged: function onSelectionChanged() {
        this.updateContent(false, null, null, true);
      },

      /**
       * Event handler. Called when the table gets or looses the focus.
       */
      onFocusChanged: function onFocusChanged() {
        this.updateContent(false, null, null, true);
      },

      /**
       * Sets the column width.
       *
       * @param col {Integer} the column to change the width for.
       * @param width {Integer} the new width.
       */
      setColumnWidth: function setColumnWidth(col, width) {
        this.updateContent(true);
      },

      /**
       * Event handler. Called the column order has changed.
       *
       */
      onColOrderChanged: function onColOrderChanged() {
        this.updateContent(true);
      },

      /**
       * Event handler. Called when the pane model has changed.
       */
      onPaneModelChanged: function onPaneModelChanged() {
        this.updateContent(true);
      },

      /**
       * Event handler. Called when the table model data has changed.
       *
       * @param firstRow {Integer} The index of the first row that has changed.
       * @param lastRow {Integer} The index of the last row that has changed.
       * @param firstColumn {Integer} The model index of the first column that has changed.
       * @param lastColumn {Integer} The model index of the last column that has changed.
       */
      onTableModelDataChanged: function onTableModelDataChanged(firstRow, lastRow, firstColumn, lastColumn) {
        this.__rowCacheClear();

        var paneFirstRow = this.getFirstVisibleRow();
        var rowCount = this.getVisibleRowCount();

        if (lastRow == -1 || lastRow >= paneFirstRow && firstRow < paneFirstRow + rowCount) {
          // The change intersects this pane
          this.updateContent();
        }
      },

      /**
       * Event handler. Called when the table model meta data has changed.
       *
       */
      onTableModelMetaDataChanged: function onTableModelMetaDataChanged() {
        this.updateContent(true);
      },
      // property apply method
      _applyMaxCacheLines: function _applyMaxCacheLines(value, old) {
        if (this.__rowCacheCount >= value && value !== -1) {
          this.__rowCacheClear();
        }
      },

      /**
       * Clear the row cache
       */
      __rowCacheClear: function __rowCacheClear() {
        this.__rowCache = [];
        this.__rowCacheCount = 0;
      },

      /**
       * Get a line from the row cache.
       *
       * @param row {Integer} Row index to get
       * @param selected {Boolean} Whether the row is currently selected
       * @param focused {Boolean} Whether the row is currently focused
       * @return {String|null} The cached row or null if a row with the given
       *     index is not cached.
       */
      __rowCacheGet: function __rowCacheGet(row, selected, focused) {
        if (!selected && !focused && this.__rowCache[row]) {
          return this.__rowCache[row];
        } else {
          return null;
        }
      },

      /**
       * Add a line to the row cache.
       *
       * @param row {Integer} Row index to set
       * @param rowString {String} computed row string to cache
       * @param selected {Boolean} Whether the row is currently selected
       * @param focused {Boolean} Whether the row is currently focused
       */
      __rowCacheSet: function __rowCacheSet(row, rowString, selected, focused) {
        var maxCacheLines = this.getMaxCacheLines();

        if (!selected && !focused && !this.__rowCache[row] && maxCacheLines > 0) {
          this._applyMaxCacheLines(maxCacheLines);

          this.__rowCache[row] = rowString;
          this.__rowCacheCount += 1;
        }
      },

      /**
       * Updates the content of the pane.
       *
       * @param completeUpdate {Boolean ? false} if true a complete update is performed.
       *      On a complete update all cell widgets are recreated.
       * @param scrollOffset {Integer ? null} If set specifies how many rows to scroll.
       * @param onlyRow {Integer ? null} if set only the specified row will be updated.
       * @param onlySelectionOrFocusChanged {Boolean ? false} if true, cell values won't
       *          be updated. Only the row background will.
       */
      updateContent: function updateContent(completeUpdate, scrollOffset, onlyRow, onlySelectionOrFocusChanged) {
        if (completeUpdate) {
          this.__rowCacheClear();
        }

        if (scrollOffset && Math.abs(scrollOffset) <= Math.min(10, this.getVisibleRowCount())) {
          this._scrollContent(scrollOffset);
        } else if (onlySelectionOrFocusChanged && !this.getTable().getAlwaysUpdateCells()) {
          this._updateRowStyles(onlyRow);
        } else {
          this._updateAllRows();
        }
      },

      /**
       * If only focus or selection changes it is sufficient to only update the
       * row styles. This method updates the row styles of all visible rows or
       * of just one row.
       *
       * @param onlyRow {Integer|null ? null} If this parameter is set only the row
       *     with this index is updated.
       */
      _updateRowStyles: function _updateRowStyles(onlyRow) {
        var elem = this.getContentElement().getDomElement();

        if (!elem || !elem.firstChild) {
          this._updateAllRows();

          return;
        }

        var table = this.getTable();
        var selectionModel = table.getSelectionModel();
        var tableModel = table.getTableModel();
        var rowRenderer = table.getDataRowRenderer();
        var rowNodes = elem.firstChild.childNodes;
        var cellInfo = {
          table: table
        }; // We don't want to execute the row loop below more than necessary. If
        // onlyRow is not null, we want to do the loop only for that row.
        // In that case, we start at (set the "row" variable to) that row, and
        // stop at (set the "end" variable to the offset of) the next row.

        var row = this.getFirstVisibleRow();
        var y = 0; // How many rows do we need to update?

        var end = rowNodes.length;

        if (onlyRow != null) {
          // How many rows are we skipping?
          var offset = onlyRow - row;

          if (offset >= 0 && offset < end) {
            row = onlyRow;
            y = offset;
            end = offset + 1;
          } else {
            return;
          }
        }

        for (; y < end; y++, row++) {
          cellInfo.row = row;
          cellInfo.selected = selectionModel.isSelectedIndex(row);
          cellInfo.focusedRow = this.__focusedRow == row;
          cellInfo.rowData = tableModel.getRowData(row);
          rowRenderer.updateDataRowElement(cellInfo, rowNodes[y]);
        }

        ;
      },

      /**
       * Get the HTML table fragment for the given row range.
       *
       * @param firstRow {Integer} Index of the first row
       * @param rowCount {Integer} Number of rows
       * @return {String} The HTML table fragment for the given row range.
       */
      _getRowsHtml: function _getRowsHtml(firstRow, rowCount) {
        var table = this.getTable();
        var selectionModel = table.getSelectionModel();
        var tableModel = table.getTableModel();
        var columnModel = table.getTableColumnModel();
        var paneModel = this.getPaneScroller().getTablePaneModel();
        var rowRenderer = table.getDataRowRenderer();
        tableModel.prefetchRows(firstRow, firstRow + rowCount - 1);
        var rowHeight = table.getRowHeight();
        var colCount = paneModel.getColumnCount();
        var left = 0;
        var cols = []; // precompute column properties

        for (var x = 0; x < colCount; x++) {
          var col = paneModel.getColumnAtX(x);
          var cellWidth = columnModel.getColumnWidth(col);
          cols.push({
            col: col,
            xPos: x,
            editable: tableModel.isColumnEditable(col),
            focusedCol: this.__focusedCol == col,
            styleLeft: left,
            styleWidth: cellWidth
          });
          left += cellWidth;
        }

        var rowsArr = [];
        var paneReloadsData = false;

        for (var row = firstRow; row < firstRow + rowCount; row++) {
          var selected = selectionModel.isSelectedIndex(row);
          var focusedRow = this.__focusedRow == row;

          var cachedRow = this.__rowCacheGet(row, selected, focusedRow);

          if (cachedRow) {
            rowsArr.push(cachedRow);
            continue;
          }

          var rowHtml = [];
          var cellInfo = {
            table: table
          };
          cellInfo.styleHeight = rowHeight;
          cellInfo.row = row;
          cellInfo.selected = selected;
          cellInfo.focusedRow = focusedRow;
          cellInfo.rowData = tableModel.getRowData(row);

          if (!cellInfo.rowData) {
            paneReloadsData = true;
          }

          rowHtml.push('<div ');
          var rowAttributes = rowRenderer.getRowAttributes(cellInfo);

          if (rowAttributes) {
            rowHtml.push(rowAttributes);
          }

          var rowClass = rowRenderer.getRowClass(cellInfo);

          if (rowClass) {
            rowHtml.push('class="', rowClass, '" ');
          }

          var rowStyle = rowRenderer.createRowStyle(cellInfo);
          rowStyle += ";position:relative;" + rowRenderer.getRowHeightStyle(rowHeight) + "width:100%;";

          if (rowStyle) {
            rowHtml.push('style="', rowStyle, '" ');
          }

          rowHtml.push('>');
          var stopLoop = false;

          for (x = 0; x < colCount && !stopLoop; x++) {
            var col_def = cols[x];

            for (var attr in col_def) {
              cellInfo[attr] = col_def[attr];
            }

            var col = cellInfo.col; // Use the "getValue" method of the tableModel to get the cell's
            // value working directly on the "rowData" object
            // (-> cellInfo.rowData[col];) is not a solution because you can't
            // work with the columnIndex -> you have to use the columnId of the
            // columnIndex This is exactly what the method "getValue" does

            cellInfo.value = tableModel.getValue(col, row);
            var cellRenderer = columnModel.getDataCellRenderer(col); // Retrieve the current default cell style for this column.

            cellInfo.style = cellRenderer.getDefaultCellStyle(); // Allow a cell renderer to tell us not to draw any further cells in
            // the row. Older, or traditional cell renderers don't return a
            // value, however, from createDataCellHtml, so assume those are
            // returning false.
            //
            // Tested with http://tinyurl.com/333hyhv

            stopLoop = cellRenderer.createDataCellHtml(cellInfo, rowHtml) || false;
          }

          rowHtml.push('</div>');
          var rowString = rowHtml.join("");

          this.__rowCacheSet(row, rowString, selected, focusedRow);

          rowsArr.push(rowString);
        }

        this.fireDataEvent("paneReloadsData", paneReloadsData);
        return rowsArr.join("");
      },

      /**
       * Scrolls the pane's contents by the given offset.
       *
       * @param rowOffset {Integer} Number of lines to scroll. Scrolling up is
       *     represented by a negative offset.
       */
      _scrollContent: function _scrollContent(rowOffset) {
        var el = this.getContentElement().getDomElement();

        if (!(el && el.firstChild)) {
          this._updateAllRows();

          return;
        }

        var tableBody = el.firstChild;
        var tableChildNodes = tableBody.childNodes;
        var rowCount = this.getVisibleRowCount();
        var firstRow = this.getFirstVisibleRow();
        var tabelModel = this.getTable().getTableModel();
        var modelRowCount = 0;
        modelRowCount = tabelModel.getRowCount(); // don't handle this special case here

        if (firstRow + rowCount > modelRowCount) {
          this._updateAllRows();

          return;
        } // remove old lines


        var removeRowBase = rowOffset < 0 ? rowCount + rowOffset : 0;
        var addRowBase = rowOffset < 0 ? 0 : rowCount - rowOffset;

        for (var i = Math.abs(rowOffset) - 1; i >= 0; i--) {
          var rowElem = tableChildNodes[removeRowBase];

          try {
            tableBody.removeChild(rowElem);
          } catch (exp) {
            break;
          }
        } // render new lines


        if (!this.__tableContainer) {
          this.__tableContainer = document.createElement("div");
        }

        var tableDummy = '<div>';
        tableDummy += this._getRowsHtml(firstRow + addRowBase, Math.abs(rowOffset));
        tableDummy += '</div>';
        this.__tableContainer.innerHTML = tableDummy;
        var newTableRows = this.__tableContainer.firstChild.childNodes; // append new lines

        if (rowOffset > 0) {
          for (var i = newTableRows.length - 1; i >= 0; i--) {
            var rowElem = newTableRows[0];
            tableBody.appendChild(rowElem);
          }
        } else {
          for (var i = newTableRows.length - 1; i >= 0; i--) {
            var rowElem = newTableRows[newTableRows.length - 1];
            tableBody.insertBefore(rowElem, tableBody.firstChild);
          }
        } // update focus indicator


        if (this.__focusedRow !== null) {
          this._updateRowStyles(this.__focusedRow - rowOffset);

          this._updateRowStyles(this.__focusedRow);
        }

        this.fireEvent("paneUpdated");
      },

      /**
       * Updates the content of the pane (implemented using array joins).
       */
      _updateAllRows: function _updateAllRows() {
        var elem = this.getContentElement().getDomElement();

        if (!elem) {
          // pane has not yet been rendered
          this.addListenerOnce("appear", this._updateAllRows, this);
          return;
        }

        var table = this.getTable();
        var tableModel = table.getTableModel();
        var paneModel = this.getPaneScroller().getTablePaneModel();
        var colCount = paneModel.getColumnCount();
        var rowHeight = table.getRowHeight();
        var firstRow = this.getFirstVisibleRow();
        var rowCount = this.getVisibleRowCount();
        var modelRowCount = tableModel.getRowCount();

        if (firstRow + rowCount > modelRowCount) {
          rowCount = Math.max(0, modelRowCount - firstRow);
        }

        var rowWidth = paneModel.getTotalWidth();
        var htmlArr; // If there are any rows...

        if (rowCount > 0) {
          // ... then create a div for them and add the rows to it.
          htmlArr = ["<div style='", "width: 100%;", table.getForceLineHeight() ? "line-height: " + rowHeight + "px;" : "", "overflow: hidden;", "'>", this._getRowsHtml(firstRow, rowCount), "</div>"];
        } else {
          // Otherwise, don't create the div, as even an empty div creates a
          // white row in IE.
          htmlArr = [];
        }

        var data = htmlArr.join("");
        elem.innerHTML = data;
        this.setWidth(rowWidth);
        this.__lastColCount = colCount;
        this.__lastRowCount = rowCount;
        this.fireEvent("paneUpdated");
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__tableContainer = this.__paneScroller = this.__rowCache = null;
      this.removeListener("track", this._onTrack, this);
    }
  });
  qx.ui.table.pane.Pane.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.Blocker": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
  
  ************************************************************************ */

  /**
   * Shows the header of a table.
   */
  qx.Class.define("qx.ui.table.pane.Header", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param paneScroller {qx.ui.table.pane.Scroller} the TablePaneScroller the header belongs to.
     */
    construct: function construct(paneScroller) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.HBox()); // add blocker


      this.__blocker = new qx.ui.core.Blocker(this);
      this.__paneScroller = paneScroller;
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __paneScroller: null,
      __moveFeedback: null,
      __lastPointerOverColumn: null,
      __blocker: null,

      /**
       * Returns the TablePaneScroller this header belongs to.
       *
       * @return {qx.ui.table.pane.Scroller} the TablePaneScroller.
       */
      getPaneScroller: function getPaneScroller() {
        return this.__paneScroller;
      },

      /**
       * Returns the table this header belongs to.
       *
       * @return {qx.ui.table.Table} the table.
       */
      getTable: function getTable() {
        return this.__paneScroller.getTable();
      },

      /**
       * Returns the blocker of the header.
       *
       * @return {qx.ui.core.Blocker} the blocker.
       */
      getBlocker: function getBlocker() {
        return this.__blocker;
      },

      /**
       * Event handler. Called the column order has changed.
       *
       */
      onColOrderChanged: function onColOrderChanged() {
        this._updateContent(true);
      },

      /**
       * Event handler. Called when the pane model has changed.
       */
      onPaneModelChanged: function onPaneModelChanged() {
        this._updateContent(true);
      },

      /**
       * Event handler. Called when the table model meta data has changed.
       *
       */
      onTableModelMetaDataChanged: function onTableModelMetaDataChanged() {
        this._updateContent();
      },

      /**
       * Sets the column width. This overrides the width from the column model.
       *
       * @param col {Integer}
       *   The column to change the width for.
       *
       * @param width {Integer}
       *   The new width.
       *
       * @param isPointerAction {Boolean}
       *   <i>true</i> if the column width is being changed as a result of a
       *   pointer drag in the header; false or undefined otherwise.
       *
       */
      setColumnWidth: function setColumnWidth(col, width, isPointerAction) {
        var child = this.getHeaderWidgetAtColumn(col);

        if (child != null) {
          child.setWidth(width);
        }
      },

      /**
       * Sets the column the pointer is currently over.
       *
       * @param col {Integer} the model index of the column the pointer is currently over or
       *      null if the pointer is over no column.
       */
      setPointerOverColumn: function setPointerOverColumn(col) {
        if (col != this.__lastPointerOverColumn) {
          if (this.__lastPointerOverColumn != null) {
            var widget = this.getHeaderWidgetAtColumn(this.__lastPointerOverColumn);

            if (widget != null) {
              widget.removeState("hovered");
            }
          }

          if (col != null) {
            this.getHeaderWidgetAtColumn(col).addState("hovered");
          }

          this.__lastPointerOverColumn = col;
        }
      },

      /**
       * Get the header widget for the given column
       *
       * @param col {Integer} The column number
       * @return {qx.ui.table.headerrenderer.HeaderCell} The header cell widget
       */
      getHeaderWidgetAtColumn: function getHeaderWidgetAtColumn(col) {
        var xPos = this.getPaneScroller().getTablePaneModel().getX(col);
        return this._getChildren()[xPos];
      },

      /**
       * Shows the feedback shown while a column is moved by the user.
       *
       * @param col {Integer} the model index of the column to show the move feedback for.
       * @param x {Integer} the x position the left side of the feedback should have
       *      (in pixels, relative to the left side of the header).
       */
      showColumnMoveFeedback: function showColumnMoveFeedback(col, x) {
        var pos = this.getContentLocation();

        if (this.__moveFeedback == null) {
          var table = this.getTable();
          var xPos = this.getPaneScroller().getTablePaneModel().getX(col);

          var cellWidget = this._getChildren()[xPos];

          var tableModel = table.getTableModel();
          var columnModel = table.getTableColumnModel();
          var cellInfo = {
            xPos: xPos,
            col: col,
            name: tableModel.getColumnName(col),
            table: table
          };
          var cellRenderer = columnModel.getHeaderCellRenderer(col);
          var feedback = cellRenderer.createHeaderCell(cellInfo);
          var size = cellWidget.getBounds(); // Configure the feedback

          feedback.setWidth(size.width);
          feedback.setHeight(size.height);
          feedback.setZIndex(1000000);
          feedback.setOpacity(0.8);
          feedback.setLayoutProperties({
            top: pos.top
          });
          this.getApplicationRoot().add(feedback);
          this.__moveFeedback = feedback;
        }

        this.__moveFeedback.setLayoutProperties({
          left: pos.left + x
        });

        this.__moveFeedback.show();
      },

      /**
       * Hides the feedback shown while a column is moved by the user.
       */
      hideColumnMoveFeedback: function hideColumnMoveFeedback() {
        if (this.__moveFeedback != null) {
          this.__moveFeedback.destroy();

          this.__moveFeedback = null;
        }
      },

      /**
       * Returns whether the column move feedback is currently shown.
       *
       * @return {Boolean} <code>true</code> whether the column move feedback is
       *    currently shown, <code>false</code> otherwise.
       */
      isShowingColumnMoveFeedback: function isShowingColumnMoveFeedback() {
        return this.__moveFeedback != null;
      },

      /**
       * Updates the content of the header.
       *
       * @param completeUpdate {Boolean} if true a complete update is performed. On a
       *      complete update all header widgets are recreated.
       */
      _updateContent: function _updateContent(completeUpdate) {
        var table = this.getTable();
        var tableModel = table.getTableModel();
        var columnModel = table.getTableColumnModel();
        var paneModel = this.getPaneScroller().getTablePaneModel();

        var children = this._getChildren();

        var colCount = paneModel.getColumnCount();
        var sortedColumn = tableModel.getSortColumnIndex(); // Remove all widgets on the complete update

        if (completeUpdate) {
          this._cleanUpCells();
        } // Update the header


        var cellInfo = {};
        cellInfo.sortedAscending = tableModel.isSortAscending();

        for (var x = 0; x < colCount; x++) {
          var col = paneModel.getColumnAtX(x);

          if (col === undefined) {
            continue;
          }

          var colWidth = columnModel.getColumnWidth(col);
          var cellRenderer = columnModel.getHeaderCellRenderer(col);
          cellInfo.xPos = x;
          cellInfo.col = col;
          cellInfo.name = tableModel.getColumnName(col);
          cellInfo.editable = tableModel.isColumnEditable(col);
          cellInfo.sorted = col == sortedColumn;
          cellInfo.table = table; // Get the cached widget

          var cachedWidget = children[x]; // Create or update the widget

          if (cachedWidget == null) {
            // We have no cached widget -> create it
            cachedWidget = cellRenderer.createHeaderCell(cellInfo);
            cachedWidget.set({
              width: colWidth
            });

            this._add(cachedWidget);
          } else {
            // This widget already created before -> recycle it
            cellRenderer.updateHeaderCell(cellInfo, cachedWidget);
          } // set the states


          if (x === 0) {
            cachedWidget.addState("first");
            cachedWidget.removeState("last");
          } else if (x === colCount - 1) {
            cachedWidget.removeState("first");
            cachedWidget.addState("last");
          } else {
            cachedWidget.removeState("first");
            cachedWidget.removeState("last");
          }
        }
      },

      /**
       * Cleans up all header cells.
       *
       */
      _cleanUpCells: function _cleanUpCells() {
        var children = this._getChildren();

        for (var x = children.length - 1; x >= 0; x--) {
          var cellWidget = children[x];
          cellWidget.destroy();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__blocker.dispose();

      this._disposeObjects("__paneScroller");
    }
  });
  qx.ui.table.pane.Header.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.scroll.MScrollBarFactory": {
        "require": true
      },
      "qx.ui.layout.Grid": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.bom.client.Device": {
        "construct": true
      },
      "qx.bom.client.Scroll": {
        "construct": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.event.Timer": {
        "construct": true
      },
      "qx.ui.table.pane.FocusIndicator": {},
      "qx.ui.core.scroll.AbstractScrollArea": {},
      "qx.ui.table.pane.Clipper": {},
      "qx.ui.table.pane.CellEvent": {},
      "qx.lang.Number": {},
      "qx.ui.window.Window": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "device.type": {
          "construct": true,
          "className": "qx.bom.client.Device"
        },
        "os.scrollBarOverlayed": {
          "construct": true,
          "className": "qx.bom.client.Scroll"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * Shows a whole meta column. This includes a {@link Header},
   * a {@link Pane} and the needed scroll bars. This class handles the
   * virtual scrolling and does all the pointer event handling.
   *
   * @childControl header {qx.ui.table.pane.Header} header pane
   * @childControl pane {qx.ui.table.pane.Pane} table pane to show the data
   * @childControl focus-indicator {qx.ui.table.pane.FocusIndicator} shows the current focused cell
   * @childControl resize-line {qx.ui.core.Widget} resize line widget
   * @childControl scrollbar-x {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar}
   *               horizontal scrollbar widget (depends on the "qx.nativeScrollBars" setting which implementation is used)
   * @childControl scrollbar-y {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar}
   *               vertical scrollbar widget (depends on the "qx.nativeScrollBars" setting which implementation is used)
   */
  qx.Class.define("qx.ui.table.pane.Scroller", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.scroll.MScrollBarFactory],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param table {qx.ui.table.Table} the table the scroller belongs to.
     */
    construct: function construct(table) {
      qx.ui.core.Widget.constructor.call(this);
      this.__table = table; // init layout

      var grid = new qx.ui.layout.Grid();
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(1, 1);

      this._setLayout(grid); // init child controls


      this.__header = this._showChildControl("header");
      this.__tablePane = this._showChildControl("pane"); // the top line containing the header clipper and the top right widget

      this.__top = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
        minWidth: 0
      });

      this._add(this.__top, {
        row: 0,
        column: 0,
        colSpan: 2
      }); // embed header into a scrollable container


      this._headerClipper = this._createHeaderClipper();

      this._headerClipper.add(this.__header);

      this._headerClipper.addListener("losecapture", this._onChangeCaptureHeader, this);

      this._headerClipper.addListener("pointermove", this._onPointermoveHeader, this);

      this._headerClipper.addListener("pointerdown", this._onPointerdownHeader, this);

      this._headerClipper.addListener("pointerup", this._onPointerupHeader, this);

      this._headerClipper.addListener("tap", this._onTapHeader, this);

      this.__top.add(this._headerClipper, {
        flex: 1
      }); // embed pane into a scrollable container


      this._paneClipper = this._createPaneClipper();

      this._paneClipper.add(this.__tablePane);

      this._paneClipper.addListener("roll", this._onRoll, this);

      this._paneClipper.addListener("pointermove", this._onPointermovePane, this);

      this._paneClipper.addListener("pointerdown", this._onPointerdownPane, this);

      this._paneClipper.addListener("tap", this._onTapPane, this);

      this._paneClipper.addListener("contextmenu", this._onTapPane, this);

      this._paneClipper.addListener("contextmenu", this._onContextMenu, this);

      if (qx.core.Environment.get("device.type") === "desktop") {
        this._paneClipper.addListener("dblclick", this._onDbltapPane, this);
      } else {
        this._paneClipper.addListener("dbltap", this._onDbltapPane, this);
      }

      this._paneClipper.addListener("resize", this._onResizePane, this); // if we have overlayed scroll bars, we should use a separate container


      if (qx.core.Environment.get("os.scrollBarOverlayed")) {
        this.__clipperContainer = new qx.ui.container.Composite();

        this.__clipperContainer.setLayout(new qx.ui.layout.Canvas());

        this.__clipperContainer.add(this._paneClipper, {
          edge: 0
        });

        this._add(this.__clipperContainer, {
          row: 1,
          column: 0
        });
      } else {
        this._add(this._paneClipper, {
          row: 1,
          column: 0
        });
      } // init scroll bars


      this.__horScrollBar = this._showChildControl("scrollbar-x");
      this.__verScrollBar = this._showChildControl("scrollbar-y"); // init focus indicator

      this.__focusIndicator = this.getChildControl("focus-indicator"); // need to run the apply method at least once [BUG #4057]

      this.initShowCellFocusIndicator(); // force creation of the resize line

      this.getChildControl("resize-line").hide();
      this.addListener("pointerout", this._onPointerout, this);
      this.addListener("appear", this._onAppear, this);
      this.addListener("disappear", this._onDisappear, this);
      this.__timer = new qx.event.Timer();

      this.__timer.addListener("interval", this._oninterval, this);

      this.initScrollTimeout();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {int} The minimum width a column could get in pixels. */
      MIN_COLUMN_WIDTH: 10,

      /** @type {int} The radius of the resize region in pixels. */
      RESIZE_REGION_RADIUS: 5,

      /**
       * (int) The number of pixels the pointer may move between pointer down and pointer up
       * in order to count as a tap.
       */
      TAP_TOLERANCE: 5,

      /**
       * (int) The mask for the horizontal scroll bar.
       * May be combined with {@link #VERTICAL_SCROLLBAR}.
       *
       * @see #getNeededScrollBars
       */
      HORIZONTAL_SCROLLBAR: 1,

      /**
       * (int) The mask for the vertical scroll bar.
       * May be combined with {@link #HORIZONTAL_SCROLLBAR}.
       *
       * @see #getNeededScrollBars
       */
      VERTICAL_SCROLLBAR: 2
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    events: {
      /** Dispatched if the pane is scrolled horizontally */
      "changeScrollY": "qx.event.type.Data",

      /** Dispatched if the pane is scrolled vertically */
      "changeScrollX": "qx.event.type.Data",

      /**See {@link qx.ui.table.Table#cellTap}.*/
      "cellTap": "qx.ui.table.pane.CellEvent",

      /*** See {@link qx.ui.table.Table#cellDbltap}.*/
      "cellDbltap": "qx.ui.table.pane.CellEvent",

      /**See {@link qx.ui.table.Table#cellContextmenu}.*/
      "cellContextmenu": "qx.ui.table.pane.CellEvent",

      /** Dispatched when a sortable header was tapped */
      "beforeSort": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Whether to show the horizontal scroll bar. This is a tri-state
       * value. `true` means show the scroll bar; `false` means exclude it; null
       * means hide it so it retains its space but doesn't show a scroll bar.
       */
      horizontalScrollBarVisible: {
        check: "Boolean",
        init: false,
        apply: "_applyHorizontalScrollBarVisible",
        event: "changeHorizontalScrollBarVisible",
        nullable: true
      },

      /** Whether to show the vertical scroll bar */
      verticalScrollBarVisible: {
        check: "Boolean",
        init: false,
        apply: "_applyVerticalScrollBarVisible",
        event: "changeVerticalScrollBarVisible"
      },

      /** The table pane model. */
      tablePaneModel: {
        check: "qx.ui.table.pane.Model",
        apply: "_applyTablePaneModel",
        event: "changeTablePaneModel"
      },

      /**
       * Whether column resize should be live. If false, during resize only a line is
       * shown and the real resize happens when the user releases the pointer button.
       */
      liveResize: {
        check: "Boolean",
        init: false
      },

      /**
       * Whether the focus should moved when the pointer is moved over a cell. If false
       * the focus is only moved on pointer taps.
       */
      focusCellOnPointerMove: {
        check: "Boolean",
        init: false
      },

      /**
       * Whether to handle selections via the selection manager before setting the
       * focus.  The traditional behavior is to handle selections after setting the
       * focus, but setting the focus means redrawing portions of the table, and
       * some subclasses may want to modify the data to be displayed based on the
       * selection.
       */
      selectBeforeFocus: {
        check: "Boolean",
        init: false
      },

      /**
       * Whether the cell focus indicator should be shown
       */
      showCellFocusIndicator: {
        check: "Boolean",
        init: true,
        apply: "_applyShowCellFocusIndicator"
      },

      /**
       * By default, the "cellContextmenu" event is fired only when a data cell
       * is right-clicked. It is not fired when a right-click occurs in the
       * empty area of the table below the last data row. By turning on this
       * property, "cellContextMenu" events will also be generated when a
       * right-click occurs in that empty area. In such a case, row identifier
       * in the event data will be null, so event handlers can check (row ===
       * null) to handle this case.
       */
      contextMenuFromDataCellsOnly: {
        check: "Boolean",
        init: true
      },

      /**
       * Whether to reset the selection when a header cell is tapped. Since
       * most data models do not have provisions to retain a selection after
       * sorting, the default is to reset the selection in this case. Some data
       * models, however, do have the capability to retain the selection, so
       * when using those, this property should be set to false.
       */
      resetSelectionOnHeaderTap: {
        check: "Boolean",
        init: true
      },

      /**
       * Interval time (in milliseconds) for the table update timer.
       * Setting this to 0 clears the timer.
       */
      scrollTimeout: {
        check: "Integer",
        init: 100,
        apply: "_applyScrollTimeout"
      },
      appearance: {
        refine: true,
        init: "table-scroller"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __lastRowCount: null,
      __table: null,
      __updateInterval: null,
      __updateContentPlanned: null,
      __onintervalWrapper: null,
      _moveColumn: null,
      __lastMoveColPos: null,
      _lastMoveTargetX: null,
      _lastMoveTargetScroller: null,
      __lastMovePointerPageX: null,
      __resizeColumn: null,
      __lastResizePointerPageX: null,
      __lastResizeWidth: null,
      __lastPointerDownCell: null,
      __firedTapEvent: false,
      __ignoreTap: null,
      __lastPointerPageX: null,
      __lastPointerPageY: null,
      __focusedCol: null,
      __focusedRow: null,
      _cellEditor: null,
      __cellEditorFactory: null,
      __topRightWidget: null,
      __horScrollBar: null,
      __verScrollBar: null,
      __header: null,
      _headerClipper: null,
      __tablePane: null,
      _paneClipper: null,
      __clipperContainer: null,
      __focusIndicator: null,
      __top: null,
      __timer: null,
      __focusIndicatorPointerDownListener: null,

      /**
       * The right inset of the pane. The right inset is the maximum of the
       * top right widget width and the scrollbar width (if visible).
       *
       * @return {Integer} The right inset of the pane
       */
      getPaneInsetRight: function getPaneInsetRight() {
        var topRight = this.getTopRightWidget();
        var topRightWidth = topRight && topRight.isVisible() && topRight.getBounds() ? topRight.getBounds().width + topRight.getMarginLeft() + topRight.getMarginRight() : 0;
        var scrollBar = this.__verScrollBar;
        var scrollBarWidth = this.getVerticalScrollBarVisible() ? this.getVerticalScrollBarWidth() + scrollBar.getMarginLeft() + scrollBar.getMarginRight() : 0;
        return Math.max(topRightWidth, scrollBarWidth);
      },

      /**
       * Set the pane's width
       *
       * @param width {Integer} The pane's width
       */
      setPaneWidth: function setPaneWidth(width) {
        if (this.isVerticalScrollBarVisible()) {
          width += this.getPaneInsetRight();
        }

        this.setWidth(width);
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "header":
            control = this.getTable().getNewTablePaneHeader()(this);
            break;

          case "pane":
            control = this.getTable().getNewTablePane()(this);
            break;

          case "focus-indicator":
            control = new qx.ui.table.pane.FocusIndicator(this);
            control.setUserBounds(0, 0, 0, 0);
            control.setZIndex(1000);
            control.addListener("pointerup", this._onPointerupFocusIndicator, this);

            this._paneClipper.add(control);

            control.show(); // must be active for editor to operate

            control.setDecorator(null); // it can be initially invisible, though.

            break;

          case "resize-line":
            control = new qx.ui.core.Widget();
            control.setUserBounds(0, 0, 0, 0);
            control.setZIndex(1000);

            this._paneClipper.add(control);

            break;

          case "scrollbar-x":
            control = this._createScrollBar("horizontal").set({
              alignY: "bottom"
            });
            control.addListener("scroll", this._onScrollX, this);

            if (this.__clipperContainer != null) {
              control.setMinHeight(qx.ui.core.scroll.AbstractScrollArea.DEFAULT_SCROLLBAR_WIDTH);

              this.__clipperContainer.add(control, {
                bottom: 0,
                right: 0,
                left: 0
              });
            } else {
              this._add(control, {
                row: 2,
                column: 0
              });
            }

            break;

          case "scrollbar-y":
            control = this._createScrollBar("vertical");
            control.addListener("scroll", this._onScrollY, this);

            if (this.__clipperContainer != null) {
              this.__clipperContainer.add(control, {
                right: 0,
                bottom: 0,
                top: 0
              });
            } else {
              this._add(control, {
                row: 1,
                column: 1
              });
            }

            break;
        }

        return control || qx.ui.table.pane.Scroller.prototype._createChildControlImpl.base.call(this, id);
      },
      // property modifier
      _applyHorizontalScrollBarVisible: function _applyHorizontalScrollBarVisible(value, old) {
        if (value === null) {
          this.__horScrollBar.setVisibility("hidden");
        } else {
          this.__horScrollBar.setVisibility(value ? "visible" : "excluded");
        }
      },
      // property modifier
      _applyVerticalScrollBarVisible: function _applyVerticalScrollBarVisible(value, old) {
        this.__verScrollBar.setVisibility(value ? "visible" : "excluded");
      },
      // property modifier
      _applyTablePaneModel: function _applyTablePaneModel(value, old) {
        if (old != null) {
          old.removeListener("modelChanged", this._onPaneModelChanged, this);
        }

        value.addListener("modelChanged", this._onPaneModelChanged, this);
      },
      // property modifier
      _applyShowCellFocusIndicator: function _applyShowCellFocusIndicator(value, old) {
        if (value) {
          this.__focusIndicator.setDecorator("table-scroller-focus-indicator");

          this._updateFocusIndicator();
        } else {
          if (this.__focusIndicator) {
            this.__focusIndicator.setDecorator(null);
          }
        }
      },

      /**
       * Get the current position of the vertical scroll bar.
       *
       * @return {Integer} The current scroll position.
       */
      getScrollY: function getScrollY() {
        return this.__verScrollBar.getPosition();
      },

      /**
       * Set the current position of the vertical scroll bar.
       *
       * @param scrollY {Integer} The new scroll position.
       * @param renderSync {Boolean?false} Whether the table update should be
       *     performed synchronously.
       */
      setScrollY: function setScrollY(scrollY, renderSync) {
        this.__verScrollBar.scrollTo(scrollY);

        if (renderSync) {
          this._updateContent();
        }
      },

      /**
       * Get the current position of the vertical scroll bar.
       *
       * @return {Integer} The current scroll position.
       */
      getScrollX: function getScrollX() {
        return this.__horScrollBar.getPosition();
      },

      /**
       * Set the current position of the vertical scroll bar.
       *
       * @param scrollX {Integer} The new scroll position.
       */
      setScrollX: function setScrollX(scrollX) {
        this.__horScrollBar.scrollTo(scrollX);
      },

      /**
       * Returns the table this scroller belongs to.
       *
       * @return {qx.ui.table.Table} the table.
       */
      getTable: function getTable() {
        return this.__table;
      },

      /**
       * Creates and returns an instance of pane clipper.
       *
       * @return {qx.ui.table.pane.Clipper} pane clipper.
       */
      _createPaneClipper: function _createPaneClipper() {
        return new qx.ui.table.pane.Clipper();
      },

      /**
       * Creates and returns an instance of header clipper.
       *
       * @return {qx.ui.table.pane.Clipper} pane clipper.
       */
      _createHeaderClipper: function _createHeaderClipper() {
        return new qx.ui.table.pane.Clipper();
      },

      /**
       * Event handler. Called when the visibility of a column has changed.
       */
      onColVisibilityChanged: function onColVisibilityChanged() {
        this.updateHorScrollBarMaximum();

        this._updateFocusIndicator();
      },

      /**
       * Sets the column width.
       *
       * @param col {Integer} the column to change the width for.
       * @param width {Integer} the new width.
       */
      setColumnWidth: function setColumnWidth(col, width) {
        this.__header.setColumnWidth(col, width);

        this.__tablePane.setColumnWidth(col, width);

        var paneModel = this.getTablePaneModel();
        var x = paneModel.getX(col);

        if (x != -1) {
          // The change was in this scroller
          this.updateHorScrollBarMaximum();

          this._updateFocusIndicator();
        }
      },

      /**
       * Event handler. Called when the column order has changed.
       *
       */
      onColOrderChanged: function onColOrderChanged() {
        this.__header.onColOrderChanged();

        this.__tablePane.onColOrderChanged();

        this.updateHorScrollBarMaximum();
      },

      /**
       * Event handler. Called when the table model has changed.
       *
       * @param firstRow {Integer} The index of the first row that has changed.
       * @param lastRow {Integer} The index of the last row that has changed.
       * @param firstColumn {Integer} The model index of the first column that has changed.
       * @param lastColumn {Integer} The model index of the last column that has changed.
       */
      onTableModelDataChanged: function onTableModelDataChanged(firstRow, lastRow, firstColumn, lastColumn) {
        this.__tablePane.onTableModelDataChanged(firstRow, lastRow, firstColumn, lastColumn);

        var rowCount = this.getTable().getTableModel().getRowCount();

        if (rowCount != this.__lastRowCount) {
          this.updateVerScrollBarMaximum();

          if (this.getFocusedRow() >= rowCount) {
            if (rowCount == 0) {
              this.setFocusedCell(null, null);
            } else {
              this.setFocusedCell(this.getFocusedColumn(), rowCount - 1);
            }
          }

          this.__lastRowCount = rowCount;
        }
      },

      /**
       * Event handler. Called when the selection has changed.
       */
      onSelectionChanged: function onSelectionChanged() {
        this.__tablePane.onSelectionChanged();
      },

      /**
       * Event handler. Called when the table gets or looses the focus.
       */
      onFocusChanged: function onFocusChanged() {
        this.__tablePane.onFocusChanged();
      },

      /**
       * Event handler. Called when the table model meta data has changed.
       *
       */
      onTableModelMetaDataChanged: function onTableModelMetaDataChanged() {
        this.__header.onTableModelMetaDataChanged();

        this.__tablePane.onTableModelMetaDataChanged();
      },

      /**
       * Event handler. Called when the pane model has changed.
       */
      _onPaneModelChanged: function _onPaneModelChanged() {
        this.__header.onPaneModelChanged();

        this.__tablePane.onPaneModelChanged();
      },

      /**
       * Event listener for the pane clipper's resize event
       */
      _onResizePane: function _onResizePane() {
        this.updateHorScrollBarMaximum();
        this.updateVerScrollBarMaximum(); // The height has changed -> Update content

        this._updateContent();

        this.__header._updateContent();

        this.__table._updateScrollBarVisibility();
      },

      /**
       * Updates the maximum of the horizontal scroll bar, so it corresponds to the
       * total width of the columns in the table pane.
       */
      updateHorScrollBarMaximum: function updateHorScrollBarMaximum() {
        var paneSize = this._paneClipper.getInnerSize();

        if (!paneSize) {
          // will be called on the next resize event again
          return;
        }

        var scrollSize = this.getTablePaneModel().getTotalWidth();
        var scrollBar = this.__horScrollBar;

        if (paneSize.width < scrollSize) {
          var max = Math.max(0, scrollSize - paneSize.width);
          scrollBar.setMaximum(max);
          scrollBar.setKnobFactor(paneSize.width / scrollSize);
          var pos = scrollBar.getPosition();
          scrollBar.setPosition(Math.min(pos, max));
        } else {
          scrollBar.setMaximum(0);
          scrollBar.setKnobFactor(1);
          scrollBar.setPosition(0);
        }
      },

      /**
       * Updates the maximum of the vertical scroll bar, so it corresponds to the
       * number of rows in the table.
       */
      updateVerScrollBarMaximum: function updateVerScrollBarMaximum() {
        var paneSize = this._paneClipper.getInnerSize();

        if (!paneSize) {
          // will be called on the next resize event again
          return;
        }

        var tableModel = this.getTable().getTableModel();
        var rowCount = tableModel.getRowCount();

        if (this.getTable().getKeepFirstVisibleRowComplete()) {
          rowCount += 1;
        }

        var rowHeight = this.getTable().getRowHeight();
        var scrollSize = rowCount * rowHeight;
        var scrollBar = this.__verScrollBar;

        if (paneSize.height < scrollSize) {
          var max = Math.max(0, scrollSize - paneSize.height);
          scrollBar.setMaximum(max);
          scrollBar.setKnobFactor(paneSize.height / scrollSize);
          var pos = scrollBar.getPosition();
          scrollBar.setPosition(Math.min(pos, max));
        } else {
          scrollBar.setMaximum(0);
          scrollBar.setKnobFactor(1);
          scrollBar.setPosition(0);
        }
      },

      /**
       * Event handler. Called when the table property "keepFirstVisibleRowComplete"
       * changed.
       */
      onKeepFirstVisibleRowCompleteChanged: function onKeepFirstVisibleRowCompleteChanged() {
        this.updateVerScrollBarMaximum();

        this._updateContent();
      },

      /**
       * Event handler for the scroller's appear event
       */
      _onAppear: function _onAppear() {
        // after the Scroller appears we start the interval again
        this._startInterval(this.getScrollTimeout());
      },

      /**
       * Event handler for the disappear event
       */
      _onDisappear: function _onDisappear() {
        // before the scroller disappears we need to stop it
        this._stopInterval();
      },

      /**
       * Event handler. Called when the horizontal scroll bar moved.
       *
       * @param e {Map} the event.
       */
      _onScrollX: function _onScrollX(e) {
        var scrollLeft = e.getData();
        this.fireDataEvent("changeScrollX", scrollLeft, e.getOldData());

        this._headerClipper.scrollToX(scrollLeft);

        this._paneClipper.scrollToX(scrollLeft);
      },

      /**
       * Event handler. Called when the vertical scroll bar moved.
       *
       * @param e {Map} the event.
       */
      _onScrollY: function _onScrollY(e) {
        this.fireDataEvent("changeScrollY", e.getData(), e.getOldData());

        this._postponedUpdateContent();
      },

      /**
       * Event handler. Called when the user moved the mouse wheel.
       *
       * @param e {qx.event.type.Roll} the event.
       */
      _onRoll: function _onRoll(e) {
        var table = this.getTable();

        if (e.getPointerType() == "mouse" || !table.getEnabled()) {
          return;
        } // vertical scrolling


        var delta = e.getDelta(); // normalize that at least one step is scrolled at a time

        if (delta.y > 0 && delta.y < 1) {
          delta.y = 1;
        } else if (delta.y < 0 && delta.y > -1) {
          delta.y = -1;
        }

        this.__verScrollBar.scrollBy(parseInt(delta.y, 10));

        var scrolled = delta.y != 0 && !this.__isAtEdge(this.__verScrollBar, delta.y); // horizontal scrolling
        // normalize that at least one step is scrolled at a time

        if (delta.x > 0 && delta.x < 1) {
          delta.x = 1;
        } else if (delta.x < 0 && delta.x > -1) {
          delta.x = -1;
        }

        this.__horScrollBar.scrollBy(parseInt(delta.x, 10)); // Update the focus


        if (this.__lastPointerPageX && this.getFocusCellOnPointerMove()) {
          this._focusCellAtPagePos(this.__lastPointerPageX, this.__lastPointerPageY);
        }

        scrolled = scrolled || delta.x != 0 && !this.__isAtEdge(this.__horScrollBar, delta.x); // pass the event to the parent if the scrollbar is at an edge

        if (scrolled) {
          e.stop();
        } else {
          e.stopMomentum();
        }
      },

      /**
       * Checks if the table has been scrolled.
       * @param scrollBar {qx.ui.core.scroll.IScrollBar} The scrollbar to check
       * @param delta {Number} The scroll delta.
       * @return {Boolean} <code>true</code>, if the scrolling is a the edge
       */
      __isAtEdge: function __isAtEdge(scrollBar, delta) {
        var position = scrollBar.getPosition();
        return delta < 0 && position <= 0 || delta > 0 && position >= scrollBar.getMaximum();
      },

      /**
       * Common column resize logic.
       *
       * @param pageX {Integer} the current pointer x position.
       */
      __handleResizeColumn: function __handleResizeColumn(pageX) {
        var table = this.getTable(); // We are currently resizing -> Update the position

        var headerCell = this.__header.getHeaderWidgetAtColumn(this.__resizeColumn);

        var minColumnWidth = headerCell.getSizeHint().minWidth;
        var newWidth = Math.max(minColumnWidth, this.__lastResizeWidth + pageX - this.__lastResizePointerPageX);

        if (this.getLiveResize()) {
          var columnModel = table.getTableColumnModel();
          columnModel.setColumnWidth(this.__resizeColumn, newWidth, true);
        } else {
          this.__header.setColumnWidth(this.__resizeColumn, newWidth, true);

          var paneModel = this.getTablePaneModel();

          this._showResizeLine(paneModel.getColumnLeft(this.__resizeColumn) + newWidth);
        }

        this.__lastResizePointerPageX += newWidth - this.__lastResizeWidth;
        this.__lastResizeWidth = newWidth;
      },

      /**
       * Common column move logic.
       *
       * @param pageX {Integer} the current pointer x position.
       *
       */
      __handleMoveColumn: function __handleMoveColumn(pageX) {
        // We are moving a column
        // Check whether we moved outside the tap tolerance so we can start
        // showing the column move feedback
        // (showing the column move feedback prevents the ontap event)
        var tapTolerance = qx.ui.table.pane.Scroller.TAP_TOLERANCE;

        if (this.__header.isShowingColumnMoveFeedback() || pageX > this.__lastMovePointerPageX + tapTolerance || pageX < this.__lastMovePointerPageX - tapTolerance) {
          this.__lastMoveColPos += pageX - this.__lastMovePointerPageX;

          this.__header.showColumnMoveFeedback(this._moveColumn, this.__lastMoveColPos); // Get the responsible scroller


          var targetScroller = this.__table.getTablePaneScrollerAtPageX(pageX);

          if (this._lastMoveTargetScroller && this._lastMoveTargetScroller != targetScroller) {
            this._lastMoveTargetScroller.hideColumnMoveFeedback();
          }

          if (targetScroller != null) {
            this._lastMoveTargetX = targetScroller.showColumnMoveFeedback(pageX);
          } else {
            this._lastMoveTargetX = null;
          }

          this._lastMoveTargetScroller = targetScroller;
          this.__lastMovePointerPageX = pageX;
        }
      },

      /**
       * Event handler. Called when the user moved the pointer over the header.
       *
       * @param e {Map} the event.
       */
      _onPointermoveHeader: function _onPointermoveHeader(e) {
        var table = this.getTable();

        if (!table.getEnabled()) {
          return;
        }

        var useResizeCursor = false;
        var pointerOverColumn = null;
        var pageX = e.getDocumentLeft();
        var pageY = e.getDocumentTop(); // Workaround: In onmousewheel the event has wrong coordinates for pageX
        //       and pageY. So we remember the last move event.

        this.__lastPointerPageX = pageX;
        this.__lastPointerPageY = pageY;

        if (this.__resizeColumn != null) {
          // We are currently resizing -> Update the position
          this.__handleResizeColumn(pageX);

          useResizeCursor = true;
          e.stopPropagation();
        } else if (this._moveColumn != null) {
          // We are moving a column
          this.__handleMoveColumn(pageX);

          e.stopPropagation();
        } else {
          var resizeCol = this._getResizeColumnForPageX(pageX);

          if (resizeCol != -1) {
            // The pointer is over a resize region -> Show the right cursor
            useResizeCursor = true;
          } else {
            var tableModel = table.getTableModel();

            var col = this._getColumnForPageX(pageX);

            if (col != null && tableModel.isColumnSortable(col)) {
              pointerOverColumn = col;
            }
          }
        }

        var cursor = useResizeCursor ? "col-resize" : null;
        this.getApplicationRoot().setGlobalCursor(cursor);
        this.setCursor(cursor);

        this.__header.setPointerOverColumn(pointerOverColumn);
      },

      /**
       * Event handler. Called when the user moved the pointer over the pane.
       *
       * @param e {Map} the event.
       */
      _onPointermovePane: function _onPointermovePane(e) {
        var table = this.getTable();

        if (!table.getEnabled()) {
          return;
        } //var useResizeCursor = false;


        var pageX = e.getDocumentLeft();
        var pageY = e.getDocumentTop(); // Workaround: In onpointerwheel the event has wrong coordinates for pageX
        //       and pageY. So we remember the last move event.

        this.__lastPointerPageX = pageX;
        this.__lastPointerPageY = pageY;

        var row = this._getRowForPagePos(pageX, pageY);

        if (row != null && this._getColumnForPageX(pageX) != null) {
          // The pointer is over the data -> update the focus
          if (this.getFocusCellOnPointerMove()) {
            this._focusCellAtPagePos(pageX, pageY);
          }
        }

        this.__header.setPointerOverColumn(null);
      },

      /**
       * Event handler. Called when the user pressed a pointer button over the header.
       *
       * @param e {Map} the event.
       */
      _onPointerdownHeader: function _onPointerdownHeader(e) {
        if (!this.getTable().getEnabled()) {
          return;
        }

        var pageX = e.getDocumentLeft(); // pointer is in header

        var resizeCol = this._getResizeColumnForPageX(pageX);

        if (resizeCol != -1) {
          // The pointer is over a resize region -> Start resizing
          this._startResizeHeader(resizeCol, pageX);

          e.stop();
        } else {
          // The pointer is not in a resize region
          var moveCol = this._getColumnForPageX(pageX);

          if (moveCol != null) {
            this._startMoveHeader(moveCol, pageX);

            e.stop();
          }
        }
      },

      /**
       * Start a resize session of the header.
       *
       * @param resizeCol {Integer} the column index
       * @param pageX {Integer} x coordinate of the pointer event
       */
      _startResizeHeader: function _startResizeHeader(resizeCol, pageX) {
        var columnModel = this.getTable().getTableColumnModel(); // The pointer is over a resize region -> Start resizing

        this.__resizeColumn = resizeCol;
        this.__lastResizePointerPageX = pageX;
        this.__lastResizeWidth = columnModel.getColumnWidth(this.__resizeColumn);

        this._headerClipper.capture();
      },

      /**
       * Start a move session of the header.
       *
       * @param moveCol {Integer} the column index
       * @param pageX {Integer} x coordinate of the pointer event
       */
      _startMoveHeader: function _startMoveHeader(moveCol, pageX) {
        // Prepare column moving
        this._moveColumn = moveCol;
        this.__lastMovePointerPageX = pageX;
        this.__lastMoveColPos = this.getTablePaneModel().getColumnLeft(moveCol);

        this._headerClipper.capture();
      },

      /**
       * Event handler. Called when the user pressed a pointer button over the pane.
       *
       * @param e {Map} the event.
       */
      _onPointerdownPane: function _onPointerdownPane(e) {
        var table = this.getTable();

        if (!table.getEnabled()) {
          return;
        }

        if (table.isEditing()) {
          table.stopEditing();
        }

        var pageX = e.getDocumentLeft();
        var pageY = e.getDocumentTop();

        var row = this._getRowForPagePos(pageX, pageY);

        var col = this._getColumnForPageX(pageX);

        if (row !== null) {
          // The focus indicator blocks the tap event on the scroller so we
          // store the current cell and listen for the pointerup event on the
          // focus indicator
          //
          // INVARIANT:
          //  The members of this object always contain the last position of
          //  the cell on which the pointerdown event occurred.
          //  *** These values are never cleared! ***.
          //  Different browsers/OS combinations issue events in different
          //  orders, and the context menu event, in particular, can be issued
          //  early or late (Firefox on Linux issues it early; Firefox on
          //  Windows issues it late) so no one may clear these values.
          //
          this.__lastPointerDownCell = {
            row: row,
            col: col
          }; // On the other hand, we need to know if we've issued the tap event
          // so we don't issue it twice, both from pointer-up on the focus
          // indicator, and from the tap even on the pane. Both possibilities
          // are necessary, however, to maintain the qooxdoo order of events.

          this.__firedTapEvent = false;
        }
      },

      /**
       * Event handler for the focus indicator's pointerup event
       *
       * @param e {qx.event.type.Pointer} The pointer event
       */
      _onPointerupFocusIndicator: function _onPointerupFocusIndicator(e) {
        if (this.__lastPointerDownCell && !this.__firedTapEvent && !this.isEditing() && this.__focusIndicator.getRow() == this.__lastPointerDownCell.row && this.__focusIndicator.getColumn() == this.__lastPointerDownCell.col) {
          this.fireEvent("cellTap", qx.ui.table.pane.CellEvent, [this, e, this.__lastPointerDownCell.row, this.__lastPointerDownCell.col], true);
          this.__firedTapEvent = true;
        } else if (!this.isEditing()) {
          // if no cellTap event should be fired, act like a pointerdown which
          // invokes the change of the selection e.g. [BUG #1632]
          this._onPointerdownPane(e);
        }
      },

      /**
       * Event handler. Called when the event capturing of the header changed.
       * Stops/finishes an active header resize/move session if it lost capturing
       * during the session to stay in a stable state.
       *
       * @param e {qx.event.type.Data} The data event
       */
      _onChangeCaptureHeader: function _onChangeCaptureHeader(e) {
        if (this.__resizeColumn != null) {
          this._stopResizeHeader();
        }

        if (this._moveColumn != null) {
          this._stopMoveHeader();
        }
      },

      /**
       * Stop a resize session of the header.
       *
       */
      _stopResizeHeader: function _stopResizeHeader() {
        var columnModel = this.getTable().getTableColumnModel(); // We are currently resizing -> Finish resizing

        if (!this.getLiveResize()) {
          this._hideResizeLine();

          columnModel.setColumnWidth(this.__resizeColumn, this.__lastResizeWidth, true);
        }

        this.__resizeColumn = null;

        this._headerClipper.releaseCapture();

        this.getApplicationRoot().setGlobalCursor(null);
        this.setCursor(null);
      },

      /**
       * Stop a move session of the header.
       *
       */
      _stopMoveHeader: function _stopMoveHeader() {
        var columnModel = this.getTable().getTableColumnModel();
        var paneModel = this.getTablePaneModel(); // We are moving a column -> Drop the column

        this.__header.hideColumnMoveFeedback();

        if (this._lastMoveTargetScroller) {
          this._lastMoveTargetScroller.hideColumnMoveFeedback();
        }

        if (this._lastMoveTargetX != null) {
          var fromVisXPos = paneModel.getFirstColumnX() + paneModel.getX(this._moveColumn);
          var toVisXPos = this._lastMoveTargetX;

          if (toVisXPos != fromVisXPos && toVisXPos != fromVisXPos + 1) {
            // The column was really moved to another position
            // (and not moved before or after itself, which is a noop)
            // Translate visible positions to overall positions
            var fromCol = columnModel.getVisibleColumnAtX(fromVisXPos);
            var toCol = columnModel.getVisibleColumnAtX(toVisXPos);
            var fromOverXPos = columnModel.getOverallX(fromCol);
            var toOverXPos = toCol != null ? columnModel.getOverallX(toCol) : columnModel.getOverallColumnCount();

            if (toOverXPos > fromOverXPos) {
              // Don't count the column itself
              toOverXPos--;
            } // Move the column


            columnModel.moveColumn(fromOverXPos, toOverXPos); // update the focus indicator including the editor

            this._updateFocusIndicator();
          }
        }

        this._moveColumn = null;
        this._lastMoveTargetX = null;

        this._headerClipper.releaseCapture();
      },

      /**
       * Event handler. Called when the user released a pointer button over the header.
       *
       * @param e {Map} the event.
       */
      _onPointerupHeader: function _onPointerupHeader(e) {
        var table = this.getTable();

        if (!table.getEnabled()) {
          return;
        }

        if (this.__resizeColumn != null) {
          this._stopResizeHeader();

          this.__ignoreTap = true;
          e.stop();
        } else if (this._moveColumn != null) {
          this._stopMoveHeader();

          e.stop();
        }
      },

      /**
       * Event handler. Called when the user tapped a pointer button over the header.
       *
       * @param e {Map} the event.
       */
      _onTapHeader: function _onTapHeader(e) {
        if (this.__ignoreTap) {
          this.__ignoreTap = false;
          return;
        }

        var table = this.getTable();

        if (!table.getEnabled()) {
          return;
        }

        var tableModel = table.getTableModel();
        var pageX = e.getDocumentLeft();

        var resizeCol = this._getResizeColumnForPageX(pageX);

        if (resizeCol == -1) {
          // pointer is not in a resize region
          var col = this._getColumnForPageX(pageX);

          if (col != null && tableModel.isColumnSortable(col)) {
            // Sort that column
            var sortCol = tableModel.getSortColumnIndex();
            var ascending = col != sortCol ? true : !tableModel.isSortAscending();
            var data = {
              column: col,
              ascending: ascending,
              tapEvent: e
            };

            if (this.fireDataEvent("beforeSort", data, null, true)) {
              // Stop cell editing
              if (table.isEditing()) {
                table.stopEditing();
              }

              tableModel.sortByColumn(col, ascending);

              if (this.getResetSelectionOnHeaderTap()) {
                table.getSelectionModel().resetSelection();
              }
            }
          }
        }

        e.stop();
      },

      /**
       * Event handler. Called when the user tapped a pointer button over the pane.
       *
       * @param e {Map} the event.
       */
      _onTapPane: function _onTapPane(e) {
        var table = this.getTable();

        if (!table.getEnabled()) {
          return;
        }

        var pageX = e.getDocumentLeft();
        var pageY = e.getDocumentTop();

        var row = this._getRowForPagePos(pageX, pageY);

        var col = this._getColumnForPageX(pageX);

        if (row != null && col != null) {
          var selectBeforeFocus = this.getSelectBeforeFocus();

          if (selectBeforeFocus) {
            table.getSelectionManager().handleTap(row, e);
          } // The pointer is over the data -> update the focus


          if (!this.getFocusCellOnPointerMove()) {
            this._focusCellAtPagePos(pageX, pageY);
          }

          if (!selectBeforeFocus) {
            table.getSelectionManager().handleTap(row, e);
          }

          if (this.__focusIndicator.isHidden() || this.__lastPointerDownCell && !this.__firedTapEvent && !this.isEditing() && row == this.__lastPointerDownCell.row && col == this.__lastPointerDownCell.col) {
            this.fireEvent("cellTap", qx.ui.table.pane.CellEvent, [this, e, row, col], true);
            this.__firedTapEvent = true;
          }
        }
      },

      /**
       * Event handler. Called when a context menu is invoked in a cell.
       *
       * @param e {qx.event.type.Pointer} the event.
       */
      _onContextMenu: function _onContextMenu(e) {
        var pageX = e.getDocumentLeft();
        var pageY = e.getDocumentTop();

        var row = this._getRowForPagePos(pageX, pageY);

        var col = this._getColumnForPageX(pageX);
        /*
         * The 'row' value will be null if the right-click was in the blank
         * area below the last data row. Some applications desire to receive
         * the context menu event anyway, and can set the property value of
         * contextMenuFromDataCellsOnly to false to achieve that.
         */


        if (row === null && this.getContextMenuFromDataCellsOnly()) {
          return;
        }

        if (!this.getShowCellFocusIndicator() || row === null || this.__lastPointerDownCell && row == this.__lastPointerDownCell.row && col == this.__lastPointerDownCell.col) {
          this.fireEvent("cellContextmenu", qx.ui.table.pane.CellEvent, [this, e, row, col], true); // Now that the cellContextmenu handler has had a chance to build
          // the menu for this cell, display it (if there is one).

          var menu = this.getTable().getContextMenu();

          if (menu) {
            // A menu with no children means don't display any context menu
            // including the default context menu even if the default context
            // menu is allowed to be displayed normally. There's no need to
            // actually show an empty menu, though.
            if (menu.getChildren().length > 0) {
              menu.openAtPointer(e);
            } else {
              menu.exclude();
            } // Do not show native menu


            e.preventDefault();
          }
        }
      },
      // overridden
      _onContextMenuOpen: function _onContextMenuOpen(e) {// This is Widget's context menu handler which typically retrieves
        // and displays the menu as soon as it receives a "contextmenu" event.
        // We want to allow the cellContextmenu handler to create the menu,
        // so we'll override this method with a null one, and do the menu
        // placement and display handling in our _onContextMenu method.
      },

      /**
       * Event handler. Called when the user double tapped a pointer button over the pane.
       *
       * @param e {Map} the event.
       */
      _onDbltapPane: function _onDbltapPane(e) {
        var pageX = e.getDocumentLeft();
        var pageY = e.getDocumentTop();

        var col = this._getColumnForPageX(pageX);

        if (col !== null) {
          this._focusCellAtPagePos(pageX, pageY);

          this.startEditing();

          var row = this._getRowForPagePos(pageX, pageY);

          if (row != -1 && row != null) {
            this.fireEvent("cellDbltap", qx.ui.table.pane.CellEvent, [this, e, row], true);
          }
        }
      },

      /**
       * Event handler. Called when the pointer moved out.
       *
       * @param e {Map} the event.
       */
      _onPointerout: function _onPointerout(e) {
        var table = this.getTable();

        if (!table.getEnabled()) {
          return;
        } // Reset the resize cursor when the pointer leaves the header
        // If currently a column is resized then do nothing
        // (the cursor will be reset on pointerup)


        if (this.__resizeColumn == null) {
          this.setCursor(null);
          this.getApplicationRoot().setGlobalCursor(null);
        }

        this.__header.setPointerOverColumn(null); // in case the focus follows the pointer, it should be remove on pointerout


        if (this.getFocusCellOnPointerMove()) {
          this.__table.setFocusedCell();
        }
      },

      /**
       * Shows the resize line.
       *
       * @param x {Integer} the position where to show the line (in pixels, relative to
       *      the left side of the pane).
       */
      _showResizeLine: function _showResizeLine(x) {
        var resizeLine = this._showChildControl("resize-line");

        var width = resizeLine.getWidth();

        var paneBounds = this._paneClipper.getBounds();

        resizeLine.setUserBounds(x - Math.round(width / 2), 0, width, paneBounds.height);
      },

      /**
       * Hides the resize line.
       */
      _hideResizeLine: function _hideResizeLine() {
        this._excludeChildControl("resize-line");
      },

      /**
       * Shows the feedback shown while a column is moved by the user.
       *
       * @param pageX {Integer} the x position of the pointer in the page (in pixels).
       * @return {Integer} the visible x position of the column in the whole table.
       */
      showColumnMoveFeedback: function showColumnMoveFeedback(pageX) {
        var paneModel = this.getTablePaneModel();
        var columnModel = this.getTable().getTableColumnModel();

        var paneLeft = this.__tablePane.getContentLocation().left;

        var colCount = paneModel.getColumnCount();
        var targetXPos = 0;
        var targetX = 0;
        var currX = paneLeft;

        for (var xPos = 0; xPos < colCount; xPos++) {
          var col = paneModel.getColumnAtX(xPos);
          var colWidth = columnModel.getColumnWidth(col);

          if (pageX < currX + colWidth / 2) {
            break;
          }

          currX += colWidth;
          targetXPos = xPos + 1;
          targetX = currX - paneLeft;
        } // Ensure targetX is visible


        var scrollerLeft = this._paneClipper.getContentLocation().left;

        var scrollerWidth = this._paneClipper.getBounds().width;

        var scrollX = scrollerLeft - paneLeft; // NOTE: +2/-1 because of feedback width

        targetX = qx.lang.Number.limit(targetX, scrollX + 2, scrollX + scrollerWidth - 1);

        this._showResizeLine(targetX); // Return the overall target x position


        return paneModel.getFirstColumnX() + targetXPos;
      },

      /**
       * Hides the feedback shown while a column is moved by the user.
       */
      hideColumnMoveFeedback: function hideColumnMoveFeedback() {
        this._hideResizeLine();
      },

      /**
       * Sets the focus to the cell that's located at the page position
       * <code>pageX</code>/<code>pageY</code>. If there is no cell at that position,
       * nothing happens.
       *
       * @param pageX {Integer} the x position in the page (in pixels).
       * @param pageY {Integer} the y position in the page (in pixels).
       */
      _focusCellAtPagePos: function _focusCellAtPagePos(pageX, pageY) {
        var row = this._getRowForPagePos(pageX, pageY);

        if (row != -1 && row != null) {
          // The pointer is over the data -> update the focus
          var col = this._getColumnForPageX(pageX);

          this.__table.setFocusedCell(col, row);
        }
      },

      /**
       * Sets the currently focused cell.
       *
       * @param col {Integer} the model index of the focused cell's column.
       * @param row {Integer} the model index of the focused cell's row.
       */
      setFocusedCell: function setFocusedCell(col, row) {
        if (!this.isEditing()) {
          this.__tablePane.setFocusedCell(col, row, this.__updateContentPlanned);

          this.__focusedCol = col;
          this.__focusedRow = row;

          this._updateFocusIndicator();
        }
      },

      /**
       * Returns the column of currently focused cell.
       *
       * @return {Integer} the model index of the focused cell's column.
       */
      getFocusedColumn: function getFocusedColumn() {
        return this.__focusedCol;
      },

      /**
       * Returns the row of currently focused cell.
       *
       * @return {Integer} the model index of the focused cell's column.
       */
      getFocusedRow: function getFocusedRow() {
        return this.__focusedRow;
      },

      /**
       * Scrolls a cell visible.
       *
       * @param col {Integer} the model index of the column the cell belongs to.
       * @param row {Integer} the model index of the row the cell belongs to.
       */
      scrollCellVisible: function scrollCellVisible(col, row) {
        var paneModel = this.getTablePaneModel();
        var xPos = paneModel.getX(col);

        if (xPos != -1) {
          var clipperSize = this._paneClipper.getInnerSize();

          if (!clipperSize) {
            return;
          }

          var columnModel = this.getTable().getTableColumnModel();
          var colLeft = paneModel.getColumnLeft(col);
          var colWidth = columnModel.getColumnWidth(col);
          var rowHeight = this.getTable().getRowHeight();
          var rowTop = row * rowHeight;
          var scrollX = this.getScrollX();
          var scrollY = this.getScrollY(); // NOTE: We don't use qx.lang.Number.limit, because min should win if max < min

          var minScrollX = Math.min(colLeft, colLeft + colWidth - clipperSize.width);
          var maxScrollX = colLeft;
          this.setScrollX(Math.max(minScrollX, Math.min(maxScrollX, scrollX)));
          var minScrollY = rowTop + rowHeight - clipperSize.height;

          if (this.getTable().getKeepFirstVisibleRowComplete()) {
            minScrollY += rowHeight;
          }

          var maxScrollY = rowTop;
          this.setScrollY(Math.max(minScrollY, Math.min(maxScrollY, scrollY)), true);
        }
      },

      /**
       * Returns whether currently a cell is editing.
       *
       * @return {var} whether currently a cell is editing.
       */
      isEditing: function isEditing() {
        return this._cellEditor != null;
      },

      /**
       * Starts editing the currently focused cell. Does nothing if already
       * editing, if the column is not editable, or if the cell editor for the
       * column ascertains that the particular cell is not editable.
       *
       * @return {Boolean} whether editing was started
       */
      startEditing: function startEditing() {
        var table = this.getTable();
        var tableModel = table.getTableModel();
        var col = this.__focusedCol;

        if (!this.isEditing() && col != null && tableModel.isColumnEditable(col)) {
          var row = this.__focusedRow;
          var xPos = this.getTablePaneModel().getX(col);
          var value = tableModel.getValue(col, row); // scroll cell into view

          this.scrollCellVisible(col, row);
          this.__cellEditorFactory = table.getTableColumnModel().getCellEditorFactory(col);
          var cellInfo = {
            col: col,
            row: row,
            xPos: xPos,
            value: value,
            table: table
          }; // Get a cell editor

          this._cellEditor = this.__cellEditorFactory.createCellEditor(cellInfo); // We handle two types of cell editors: the traditional in-place
          // editor, where the cell editor returned by the factory must fit in
          // the space of the table cell; and a modal window in which the
          // editing takes place.  Additionally, if the cell editor determines
          // that it does not want to edit the particular cell being requested,
          // it may return null to indicate that that cell is not editable.

          if (this._cellEditor === null) {
            // This cell is not editable even though its column is.
            return false;
          } else if (this._cellEditor instanceof qx.ui.window.Window) {
            // It's a window.  Ensure that it's modal.
            this._cellEditor.setModal(true); // At least for the time being, we disallow the close button.  It
            // acts differently than a cellEditor.close(), and invokes a bug
            // someplace.  Modal window cell editors should provide their own
            // buttons or means to activate a cellEditor.close() or equivalently
            // cellEditor.hide().


            this._cellEditor.setShowClose(false); // Arrange to be notified when it is closed.


            this._cellEditor.addListener("close", this._onCellEditorModalWindowClose, this); // If there's a pre-open function defined for the table...


            var f = table.getModalCellEditorPreOpenFunction();

            if (f != null) {
              f(this._cellEditor, cellInfo);
            } // Open it now.


            this._cellEditor.open();
          } else {
            // prevent tap event from bubbling up to the table
            this.__focusIndicatorPointerDownListener = this.__focusIndicator.addListener("pointerdown", function (e) {
              this.__lastPointerDownCell = {
                row: this.__focusedRow,
                col: this.__focusedCol
              };
              e.stopPropagation();
            }, this);

            this.__focusIndicator.add(this._cellEditor);

            this.__focusIndicator.addState("editing");

            this.__focusIndicator.setKeepActive(false); // Make the focus indicator visible during editing


            this.__focusIndicator.setDecorator("table-scroller-focus-indicator");

            this._cellEditor.focus();

            this._cellEditor.activate();
          }

          return true;
        }

        return false;
      },

      /**
       * Stops editing and writes the editor's value to the model.
       */
      stopEditing: function stopEditing() {
        // If the focus indicator is not being shown normally...
        if (!this.getShowCellFocusIndicator()) {
          // ... then hide it again
          this.__focusIndicator.setDecorator(null);
        }

        this.flushEditor();
        this.cancelEditing();
      },

      /**
       * Writes the editor's value to the model.
       */
      flushEditor: function flushEditor() {
        if (this.isEditing()) {
          var value = this.__cellEditorFactory.getCellEditorValue(this._cellEditor);

          var oldValue = this.getTable().getTableModel().getValue(this.__focusedCol, this.__focusedRow);
          this.getTable().getTableModel().setValue(this.__focusedCol, this.__focusedRow, value);

          this.__table.focus(); // Fire an event containing the value change.


          this.__table.fireDataEvent("dataEdited", {
            row: this.__focusedRow,
            col: this.__focusedCol,
            oldValue: oldValue,
            value: value
          });
        }
      },

      /**
       * Stops editing without writing the editor's value to the model.
       */
      cancelEditing: function cancelEditing() {
        if (this.isEditing()) {
          if (!(this._cellEditor instanceof qx.ui.window.Window)) {
            this.__focusIndicator.removeState("editing");

            this.__focusIndicator.setKeepActive(true);

            if (this.__focusIndicatorPointerDownListener !== null) {
              this.__focusIndicator.removeListenerById(this.__focusIndicatorPointerDownListener);

              this.__focusIndicatorPointerDownListener = null;
            }
          }

          this._cellEditor.destroy();

          this._cellEditor = null;
          this.__cellEditorFactory = null;
        }
      },

      /**
       * Event handler. Called when the modal window of the cell editor closes.
       *
       * @param e {Map} the event.
       */
      _onCellEditorModalWindowClose: function _onCellEditorModalWindowClose(e) {
        this.stopEditing();
      },

      /**
       * Returns the model index of the column the pointer is over or null if the pointer
       * is not over a column.
       *
       * @param pageX {Integer} the x position of the pointer in the page (in pixels).
       * @return {Integer} the model index of the column the pointer is over.
       */
      _getColumnForPageX: function _getColumnForPageX(pageX) {
        var columnModel = this.getTable().getTableColumnModel();
        var paneModel = this.getTablePaneModel();
        var colCount = paneModel.getColumnCount();

        var currX = this.__tablePane.getContentLocation().left;

        for (var x = 0; x < colCount; x++) {
          var col = paneModel.getColumnAtX(x);
          var colWidth = columnModel.getColumnWidth(col);
          currX += colWidth;

          if (pageX < currX) {
            return col;
          }
        }

        return null;
      },

      /**
       * Returns the model index of the column that should be resized when dragging
       * starts here. Returns -1 if the pointer is in no resize region of any column.
       *
       * @param pageX {Integer} the x position of the pointer in the page (in pixels).
       * @return {Integer} the column index.
       */
      _getResizeColumnForPageX: function _getResizeColumnForPageX(pageX) {
        var columnModel = this.getTable().getTableColumnModel();
        var paneModel = this.getTablePaneModel();
        var colCount = paneModel.getColumnCount();

        var currX = this.__header.getContentLocation().left;

        var regionRadius = qx.ui.table.pane.Scroller.RESIZE_REGION_RADIUS;

        for (var x = 0; x < colCount; x++) {
          var col = paneModel.getColumnAtX(x);
          var colWidth = columnModel.getColumnWidth(col);
          currX += colWidth;

          if (pageX >= currX - regionRadius && pageX <= currX + regionRadius) {
            return col;
          }
        }

        return -1;
      },

      /**
       * Returns the model index of the row the pointer is currently over. Returns -1 if
       * the pointer is over the header. Returns null if the pointer is not over any
       * column.
       *
       * @param pageX {Integer} the pointer x position in the page.
       * @param pageY {Integer} the pointer y position in the page.
       * @return {Integer} the model index of the row the pointer is currently over.
       */
      _getRowForPagePos: function _getRowForPagePos(pageX, pageY) {
        var panePos = this.__tablePane.getContentLocation();

        if (pageX < panePos.left || pageX > panePos.right) {
          // There was no cell or header cell hit
          return null;
        }

        if (pageY >= panePos.top && pageY <= panePos.bottom) {
          // This event is in the pane -> Get the row
          var rowHeight = this.getTable().getRowHeight();

          var scrollY = this.__verScrollBar.getPosition();

          if (this.getTable().getKeepFirstVisibleRowComplete()) {
            scrollY = Math.floor(scrollY / rowHeight) * rowHeight;
          }

          var tableY = scrollY + pageY - panePos.top;
          var row = Math.floor(tableY / rowHeight);
          var tableModel = this.getTable().getTableModel();
          var rowCount = tableModel.getRowCount();
          return row < rowCount ? row : null;
        }

        var headerPos = this.__header.getContentLocation();

        if (pageY >= headerPos.top && pageY <= headerPos.bottom && pageX <= headerPos.right) {
          // This event is in the pane -> Return -1 for the header
          return -1;
        }

        return null;
      },

      /**
       * Sets the widget that should be shown in the top right corner.
       *
       * The widget will not be disposed, when this table scroller is disposed. So the
       * caller has to dispose it.
       *
       * @param widget {qx.ui.core.Widget} The widget to set. May be null.
       */
      setTopRightWidget: function setTopRightWidget(widget) {
        var oldWidget = this.__topRightWidget;

        if (oldWidget != null) {
          this.__top.remove(oldWidget);
        }

        if (widget != null) {
          this.__top.add(widget);
        }

        this.__topRightWidget = widget;
      },

      /**
       * Get the top right widget
       *
       * @return {qx.ui.core.Widget} The top right widget.
       */
      getTopRightWidget: function getTopRightWidget() {
        return this.__topRightWidget;
      },

      /**
       * Returns the header.
       *
       * @return {qx.ui.table.pane.Header} the header.
       */
      getHeader: function getHeader() {
        return this.__header;
      },

      /**
       * Returns the table pane.
       *
       * @return {qx.ui.table.pane.Pane} the table pane.
       */
      getTablePane: function getTablePane() {
        return this.__tablePane;
      },

      /**
       * Get the rendered width of the vertical scroll bar. The return value is
       * <code>0</code> if the scroll bar is invisible or not yet rendered.
       *
       * @internal
       * @return {Integer} The width of the vertical scroll bar
       */
      getVerticalScrollBarWidth: function getVerticalScrollBarWidth() {
        var scrollBar = this.__verScrollBar;
        return scrollBar.isVisible() ? scrollBar.getSizeHint().width || 0 : 0;
      },

      /**
       * Returns which scrollbars are needed.
       *
       * @param forceHorizontal {Boolean ? false} Whether to show the horizontal
       *      scrollbar always.
       * @param preventVertical {Boolean ? false} Whether to show the vertical scrollbar
       *      never.
       * @return {Integer} which scrollbars are needed. This may be any combination of
       *      {@link #HORIZONTAL_SCROLLBAR} or {@link #VERTICAL_SCROLLBAR}
       *      (combined by OR).
       */
      getNeededScrollBars: function getNeededScrollBars(forceHorizontal, preventVertical) {
        var verScrollBar = this.__verScrollBar;
        var verBarWidth = verScrollBar.getSizeHint().width + verScrollBar.getMarginLeft() + verScrollBar.getMarginRight();
        var horScrollBar = this.__horScrollBar;
        var horBarHeight = horScrollBar.getSizeHint().height + horScrollBar.getMarginTop() + horScrollBar.getMarginBottom(); // Get the width and height of the view (without scroll bars)

        var clipperSize = this._paneClipper.getInnerSize();

        var viewWidth = clipperSize ? clipperSize.width : 0;

        if (this.getVerticalScrollBarVisible()) {
          viewWidth += verBarWidth;
        }

        var viewHeight = clipperSize ? clipperSize.height : 0;

        if (this.getHorizontalScrollBarVisible()) {
          viewHeight += horBarHeight;
        }

        var tableModel = this.getTable().getTableModel();
        var rowCount = tableModel.getRowCount(); // Get the (virtual) width and height of the pane

        var paneWidth = this.getTablePaneModel().getTotalWidth();
        var paneHeight = this.getTable().getRowHeight() * rowCount; // Check which scrollbars are needed

        var horNeeded = false;
        var verNeeded = false;

        if (paneWidth > viewWidth) {
          horNeeded = true;

          if (paneHeight > viewHeight - horBarHeight) {
            verNeeded = true;
          }
        } else if (paneHeight > viewHeight) {
          verNeeded = true;

          if (!preventVertical && paneWidth > viewWidth - verBarWidth) {
            horNeeded = true;
          }
        } // Create the mask


        var horBar = qx.ui.table.pane.Scroller.HORIZONTAL_SCROLLBAR;
        var verBar = qx.ui.table.pane.Scroller.VERTICAL_SCROLLBAR;
        return (forceHorizontal || horNeeded ? horBar : 0) | (preventVertical || !verNeeded ? 0 : verBar);
      },

      /**
       * Return the pane clipper. It is sometimes required for special activities
       * such as tracking events for drag&drop.
       *
       * @return {qx.ui.table.pane.Clipper}
       *   The pane clipper for this scroller.
       */
      getPaneClipper: function getPaneClipper() {
        return this._paneClipper;
      },

      /**
       * Returns the scroll area container widget (which enables more precise
       * operations e.g. bounds retrieval for drag session scrolling).
       *
       * @see qx.ui.core.MDragDropScrolling#_getBounds
       * @return {qx.ui.table.pane.Clipper}
       *   The pane clipper for this scroller.
       */
      getScrollAreaContainer: function getScrollAreaContainer() {
        return this.getPaneClipper();
      },
      // property apply method
      _applyScrollTimeout: function _applyScrollTimeout(value, old) {
        this._startInterval(value);
      },

      /**
       * Starts the current running interval
       *
       * @param timeout {Integer} The timeout between two table updates
       */
      _startInterval: function _startInterval(timeout) {
        this.__timer.setInterval(timeout);

        this.__timer.start();
      },

      /**
       * stops the current running interval
       */
      _stopInterval: function _stopInterval() {
        this.__timer.stop();
      },

      /**
       * Does a postponed update of the content.
       *
       * @see #_updateContent
       */
      _postponedUpdateContent: function _postponedUpdateContent() {
        //this.__updateContentPlanned = true;
        this._updateContent();
      },

      /**
       * Timer event handler. Periodically checks whether a table update is
       * required. The update interval is controlled by the {@link #scrollTimeout}
       * property.
       *
       * @signature function()
       */
      _oninterval: qx.event.GlobalError.observeMethod(function () {
        if (this.__updateContentPlanned && !this.__tablePane._layoutPending) {
          this.__updateContentPlanned = false;

          this._updateContent();
        }
      }),

      /**
       * Updates the content. Sets the right section the table pane should show and
       * does the scrolling.
       */
      _updateContent: function _updateContent() {
        var paneSize = this._paneClipper.getInnerSize();

        if (!paneSize) {
          return;
        }

        var paneHeight = paneSize.height;

        var scrollX = this.__horScrollBar.getPosition();

        var scrollY = this.__verScrollBar.getPosition();

        var rowHeight = this.getTable().getRowHeight();
        var firstRow = Math.floor(scrollY / rowHeight);

        var oldFirstRow = this.__tablePane.getFirstVisibleRow();

        this.__tablePane.setFirstVisibleRow(firstRow);

        var visibleRowCount = Math.ceil(paneHeight / rowHeight);
        var paneOffset = 0;
        var firstVisibleRowComplete = this.getTable().getKeepFirstVisibleRowComplete();

        if (!firstVisibleRowComplete) {
          // NOTE: We don't consider paneOffset, because this may cause alternating
          //       adding and deleting of one row when scrolling. Instead we add one row
          //       in every case.
          visibleRowCount++;
          paneOffset = scrollY % rowHeight;
        }

        this.__tablePane.setVisibleRowCount(visibleRowCount);

        if (firstRow != oldFirstRow) {
          this._updateFocusIndicator();
        }

        this._paneClipper.scrollToX(scrollX); // Avoid expensive calls to setScrollTop if
        // scrolling is not needed


        if (!firstVisibleRowComplete) {
          this._paneClipper.scrollToY(paneOffset);
        }
      },

      /**
       * Updates the location and the visibility of the focus indicator.
       *
       */
      _updateFocusIndicator: function _updateFocusIndicator() {
        var table = this.getTable();

        if (!table.getEnabled()) {
          return;
        }

        this.__focusIndicator.moveToCell(this.__focusedCol, this.__focusedRow);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopInterval(); // this object was created by the table on init so we have to clean it up.


      var tablePaneModel = this.getTablePaneModel();

      if (tablePaneModel) {
        tablePaneModel.dispose();
      }

      this.__lastPointerDownCell = this.__topRightWidget = this.__table = null;

      this._disposeObjects("__horScrollBar", "__verScrollBar", "_headerClipper", "_paneClipper", "__focusIndicator", "__header", "__tablePane", "__top", "__timer", "__clipperContainer");
    }
  });
  qx.ui.table.pane.Scroller.$$dbClassInfo = $$dbClassInfo;
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
  
  ************************************************************************ */

  /**
   * The model of a table pane. This model works as proxy to a
   * {@link qx.ui.table.columnmodel.Basic} and manages the visual order of the columns shown in
   * a {@link Pane}.
   */
  qx.Class.define("qx.ui.table.pane.Model", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     *
     * @param tableColumnModel {qx.ui.table.columnmodel.Basic} The TableColumnModel of which this
     *    model is the proxy.
     */
    construct: function construct(tableColumnModel) {
      qx.core.Object.constructor.call(this);
      this.setTableColumnModel(tableColumnModel);
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the model changed. */
      "modelChanged": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {string} The type of the event fired when the model changed. */
      EVENT_TYPE_MODEL_CHANGED: "modelChanged"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The visible x position of the first column this model should contain. */
      firstColumnX: {
        check: "Integer",
        init: 0,
        apply: "_applyFirstColumnX"
      },

      /**
       * The maximum number of columns this model should contain. If -1 this model will
       * contain all remaining columns.
       */
      maxColumnCount: {
        check: "Number",
        init: -1,
        apply: "_applyMaxColumnCount"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __columnCount: null,
      __tableColumnModel: null,
      // property modifier
      _applyFirstColumnX: function _applyFirstColumnX(value, old) {
        this.__columnCount = null;
        this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
      },
      // property modifier
      _applyMaxColumnCount: function _applyMaxColumnCount(value, old) {
        this.__columnCount = null;
        this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
      },

      /**
       * Connects the table model to the column model
       *
       * @param tableColumnModel {qx.ui.table.columnmodel.Basic} the column model
       */
      setTableColumnModel: function setTableColumnModel(tableColumnModel) {
        if (this.__tableColumnModel) {
          this.__tableColumnModel.removeListener("visibilityChangedPre", this._onColVisibilityChanged, this);

          this.__tableColumnModel.removeListener("headerCellRendererChanged", this._onHeaderCellRendererChanged, this);
        }

        this.__tableColumnModel = tableColumnModel;

        this.__tableColumnModel.addListener("visibilityChangedPre", this._onColVisibilityChanged, this);

        this.__tableColumnModel.addListener("headerCellRendererChanged", this._onHeaderCellRendererChanged, this);

        this.__columnCount = null;
      },

      /**
       * Event handler. Called when the visibility of a column has changed.
       *
       * @param evt {Map} the event.
       */
      _onColVisibilityChanged: function _onColVisibilityChanged(evt) {
        this.__columnCount = null;
        this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
      },

      /**
       * Event handler. Called when the cell renderer of a column has changed.
       *
       * @param evt {Map} the event.
       */
      _onHeaderCellRendererChanged: function _onHeaderCellRendererChanged(evt) {
        this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
      },

      /**
       * Returns the number of columns in this model.
       *
       * @return {Integer} the number of columns in this model.
       */
      getColumnCount: function getColumnCount() {
        if (this.__columnCount == null) {
          var firstX = this.getFirstColumnX();
          var maxColCount = this.getMaxColumnCount();

          var totalColCount = this.__tableColumnModel.getVisibleColumnCount();

          if (maxColCount == -1 || firstX + maxColCount > totalColCount) {
            this.__columnCount = totalColCount - firstX;
          } else {
            this.__columnCount = maxColCount;
          }
        }

        return this.__columnCount;
      },

      /**
       * Returns the model index of the column at the position <code>xPos</code>.
       *
       * @param xPos {Integer} the x position in the table pane of the column.
       * @return {Integer} the model index of the column.
       */
      getColumnAtX: function getColumnAtX(xPos) {
        var firstX = this.getFirstColumnX();
        return this.__tableColumnModel.getVisibleColumnAtX(firstX + xPos);
      },

      /**
       * Returns the x position of the column <code>col</code>.
       *
       * @param col {Integer} the model index of the column.
       * @return {Integer} the x position in the table pane of the column.
       */
      getX: function getX(col) {
        var firstX = this.getFirstColumnX();
        var maxColCount = this.getMaxColumnCount();
        var x = this.__tableColumnModel.getVisibleX(col) - firstX;

        if (x >= 0 && (maxColCount == -1 || x < maxColCount)) {
          return x;
        } else {
          return -1;
        }
      },

      /**
       * Gets the position of the left side of a column (in pixels, relative to the
       * left side of the table pane).
       *
       * This value corresponds to the sum of the widths of all columns left of the
       * column.
       *
       * @param col {Integer} the model index of the column.
       * @return {var} the position of the left side of the column.
       */
      getColumnLeft: function getColumnLeft(col) {
        var left = 0;
        var colCount = this.getColumnCount();

        for (var x = 0; x < colCount; x++) {
          var currCol = this.getColumnAtX(x);

          if (currCol == col) {
            return left;
          }

          left += this.__tableColumnModel.getColumnWidth(currCol);
        }

        return -1;
      },

      /**
       * Returns the total width of all columns in the model.
       *
       * @return {Integer} the total width of all columns in the model.
       */
      getTotalWidth: function getTotalWidth() {
        var totalWidth = 0;
        var colCount = this.getColumnCount();

        for (var x = 0; x < colCount; x++) {
          var col = this.getColumnAtX(x);
          totalWidth += this.__tableColumnModel.getColumnWidth(col);
        }

        return totalWidth;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__tableColumnModel) {
        this.__tableColumnModel.removeListener("visibilityChangedPre", this._onColVisibilityChanged, this);

        this.__tableColumnModel.removeListener("headerCellRendererChanged", this._onHeaderCellRendererChanged, this);
      }

      this.__tableColumnModel = null;
    }
  });
  qx.ui.table.pane.Model.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.model.Abstract": {
        "construct": true,
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
  
  ************************************************************************ */

  /**
   * A simple table model that provides an API for changing the model data.
   */
  qx.Class.define("qx.ui.table.model.Simple", {
    extend: qx.ui.table.model.Abstract,
    construct: function construct() {
      qx.ui.table.model.Abstract.constructor.call(this);
      this._rowArr = [];
      this.__sortColumnIndex = -1; // Array of objects, each with property "ascending" and "descending"

      this.__sortMethods = [];
      this.__editableColArr = null;
    },
    properties: {
      /**
       * Whether sorting should be case sensitive
       */
      caseSensitiveSorting: {
        check: "Boolean",
        init: true
      }
    },
    statics: {
      /**
       * Default ascending sort method to use if no custom method has been
       * provided.
       *
       * @param row1 {var} first row
       * @param row2 {var} second row
       * @param columnIndex {Integer} the column to be sorted
       * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
       */
      _defaultSortComparatorAscending: function _defaultSortComparatorAscending(row1, row2, columnIndex) {
        var obj1 = row1[columnIndex];
        var obj2 = row2[columnIndex];

        if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
          var result = isNaN(obj1) ? isNaN(obj2) ? 0 : 1 : isNaN(obj2) ? -1 : null;

          if (result != null) {
            return result;
          }
        }

        return obj1 > obj2 ? 1 : obj1 == obj2 ? 0 : -1;
      },

      /**
       * Same as the Default ascending sort method but using case insensitivity
       *
       * @param row1 {var} first row
       * @param row2 {var} second row
       * @param columnIndex {Integer} the column to be sorted
       * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
       */
      _defaultSortComparatorInsensitiveAscending: function _defaultSortComparatorInsensitiveAscending(row1, row2, columnIndex) {
        var obj1 = row1[columnIndex].toLowerCase ? row1[columnIndex].toLowerCase() : row1[columnIndex];
        var obj2 = row2[columnIndex].toLowerCase ? row2[columnIndex].toLowerCase() : row2[columnIndex];

        if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
          var result = isNaN(obj1) ? isNaN(obj2) ? 0 : 1 : isNaN(obj2) ? -1 : null;

          if (result != null) {
            return result;
          }
        }

        return obj1 > obj2 ? 1 : obj1 == obj2 ? 0 : -1;
      },

      /**
       * Default descending sort method to use if no custom method has been
       * provided.
       *
       * @param row1 {var} first row
       * @param row2 {var} second row
       * @param columnIndex {Integer} the column to be sorted
       * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
       */
      _defaultSortComparatorDescending: function _defaultSortComparatorDescending(row1, row2, columnIndex) {
        var obj1 = row1[columnIndex];
        var obj2 = row2[columnIndex];

        if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
          var result = isNaN(obj1) ? isNaN(obj2) ? 0 : 1 : isNaN(obj2) ? -1 : null;

          if (result != null) {
            return result;
          }
        }

        return obj1 < obj2 ? 1 : obj1 == obj2 ? 0 : -1;
      },

      /**
       * Same as the Default descending sort method but using case insensitivity
       *
       * @param row1 {var} first row
       * @param row2 {var} second row
       * @param columnIndex {Integer} the column to be sorted
       * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
       */
      _defaultSortComparatorInsensitiveDescending: function _defaultSortComparatorInsensitiveDescending(row1, row2, columnIndex) {
        var obj1 = row1[columnIndex].toLowerCase ? row1[columnIndex].toLowerCase() : row1[columnIndex];
        var obj2 = row2[columnIndex].toLowerCase ? row2[columnIndex].toLowerCase() : row2[columnIndex];

        if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
          var result = isNaN(obj1) ? isNaN(obj2) ? 0 : 1 : isNaN(obj2) ? -1 : null;

          if (result != null) {
            return result;
          }
        }

        return obj1 < obj2 ? 1 : obj1 == obj2 ? 0 : -1;
      }
    },
    members: {
      _rowArr: null,
      __editableColArr: null,
      __sortableColArr: null,
      __sortMethods: null,
      __sortColumnIndex: null,
      __sortAscending: null,
      // overridden
      getRowData: function getRowData(rowIndex) {
        var rowData = this._rowArr[rowIndex];

        if (rowData == null || rowData.originalData == null) {
          return rowData;
        } else {
          return rowData.originalData;
        }
      },

      /**
       * Returns the data of one row as map containing the column IDs as key and
       * the cell values as value. Also the meta data is included.
       *
       * @param rowIndex {Integer} the model index of the row.
       * @return {Map} a Map containing the column values.
       */
      getRowDataAsMap: function getRowDataAsMap(rowIndex) {
        var rowData = this._rowArr[rowIndex];

        if (rowData != null) {
          var map = {}; // get the current set data

          for (var col = 0; col < this.getColumnCount(); col++) {
            map[this.getColumnId(col)] = rowData[col];
          }

          if (rowData.originalData != null) {
            // merge in the meta data
            for (var key in rowData.originalData) {
              if (map[key] == undefined) {
                map[key] = rowData.originalData[key];
              }
            }
          }

          return map;
        } // may be null, which is ok


        return rowData && rowData.originalData ? rowData.originalData : null;
      },

      /**
       * Gets the whole data as an array of maps.
       *
       * Note: Individual items are retrieved by {@link #getRowDataAsMap}.
       * @return {Map[]} Array of row data maps
       */
      getDataAsMapArray: function getDataAsMapArray() {
        var len = this.getRowCount();
        var data = [];

        for (var i = 0; i < len; i++) {
          data.push(this.getRowDataAsMap(i));
        }

        return data;
      },

      /**
       * Sets all columns editable or not editable.
       *
       * @param editable {Boolean} whether all columns are editable.
       */
      setEditable: function setEditable(editable) {
        this.__editableColArr = [];

        for (var col = 0; col < this.getColumnCount(); col++) {
          this.__editableColArr[col] = editable;
        }

        this.fireEvent("metaDataChanged");
      },

      /**
       * Sets whether a column is editable.
       *
       * @param columnIndex {Integer} the column of which to set the editable state.
       * @param editable {Boolean} whether the column should be editable.
       */
      setColumnEditable: function setColumnEditable(columnIndex, editable) {
        if (editable != this.isColumnEditable(columnIndex)) {
          if (this.__editableColArr == null) {
            this.__editableColArr = [];
          }

          this.__editableColArr[columnIndex] = editable;
          this.fireEvent("metaDataChanged");
        }
      },
      // overridden
      isColumnEditable: function isColumnEditable(columnIndex) {
        return this.__editableColArr ? this.__editableColArr[columnIndex] == true : false;
      },

      /**
       * Sets whether a column is sortable.
       *
       * @param columnIndex {Integer} the column of which to set the sortable state.
       * @param sortable {Boolean} whether the column should be sortable.
       */
      setColumnSortable: function setColumnSortable(columnIndex, sortable) {
        if (sortable != this.isColumnSortable(columnIndex)) {
          if (this.__sortableColArr == null) {
            this.__sortableColArr = [];
          }

          this.__sortableColArr[columnIndex] = sortable;
          this.fireEvent("metaDataChanged");
        }
      },
      // overridden
      isColumnSortable: function isColumnSortable(columnIndex) {
        return this.__sortableColArr ? this.__sortableColArr[columnIndex] !== false : true;
      },
      // overridden
      sortByColumn: function sortByColumn(columnIndex, ascending) {
        // NOTE: We use different comparators for ascending and descending,
        //     because comparators should be really fast.
        var comparator;
        var sortMethods = this.__sortMethods[columnIndex];

        if (sortMethods) {
          comparator = ascending ? sortMethods.ascending : sortMethods.descending;
        } else {
          if (this.getCaseSensitiveSorting()) {
            comparator = ascending ? qx.ui.table.model.Simple._defaultSortComparatorAscending : qx.ui.table.model.Simple._defaultSortComparatorDescending;
          } else {
            comparator = ascending ? qx.ui.table.model.Simple._defaultSortComparatorInsensitiveAscending : qx.ui.table.model.Simple._defaultSortComparatorInsensitiveDescending;
          }
        }

        comparator.columnIndex = columnIndex;

        this._rowArr.sort(function (row1, row2) {
          return comparator(row1, row2, columnIndex);
        });

        this.__sortColumnIndex = columnIndex;
        this.__sortAscending = ascending;
        var data = {
          columnIndex: columnIndex,
          ascending: ascending
        };
        this.fireDataEvent("sorted", data);
        this.fireEvent("metaDataChanged");
      },

      /**
       * Specify the methods to use for ascending and descending sorts of a
       * particular column.
       *
       * @param columnIndex {Integer}
       *   The index of the column for which the sort methods are being
       *   provided.
       *
       * @param compare {Function|Map}
       *   If provided as a Function, this is the comparator function to sort in
       *   ascending order. It takes three parameters: the two arrays of row data,
       *   row1 and row2, being compared and the column index sorting was requested 
       *   for. 
       *
       *   For backwards compatability, user-supplied compare functions may still 
       *   take only two parameters, the two arrays of row data, row1 and row2, 
       *   being compared and obtain the column index as arguments.callee.columnIndex. 
       *   This is deprecated, however, as arguments.callee is disallowed in ES5 strict
       *   mode and ES6.
       *
       *   The comparator function must return 1, 0 or -1, when the column in row1
       *   is greater than, equal to, or less than, respectively, the column in
       *   row2.
       *
       *   If this parameter is a Map, it shall have two properties: "ascending"
       *   and "descending". The property value of each is a comparator
       *   function, as described above.
       *
       *   If only the "ascending" function is provided (i.e. this parameter is
       *   a Function, not a Map), then the "descending" function is built
       *   dynamically by passing the two parameters to the "ascending" function
       *   in reversed order. <i>Use of a dynamically-built "descending" function
       *   generates at least one extra function call for each row in the table,
       *   and possibly many more. If the table is expected to have more than
       *   about 1000 rows, you will likely want to provide a map with a custom
       *   "descending" sort function as well as the "ascending" one.</i>
       *
       */
      setSortMethods: function setSortMethods(columnIndex, compare) {
        var methods;

        if (qx.lang.Type.isFunction(compare)) {
          methods = {
            ascending: compare,
            descending: function descending(row1, row2, columnIndex) {
              /* assure backwards compatibility for sort functions using
               * arguments.callee.columnIndex and fix a bug where retreiveing
               * column index via this way did not work for the case where a 
               * single comparator function was used. 
               * Note that arguments.callee is not available in ES5 strict mode and ES6. 
               * See discussion in 
               * https://github.com/qooxdoo/qooxdoo/pull/9499#pullrequestreview-99655182
               */
              compare.columnIndex = columnIndex;
              return compare(row2, row1, columnIndex);
            }
          };
        } else {
          methods = compare;
        }

        this.__sortMethods[columnIndex] = methods;
      },

      /**
       * Returns the sortMethod(s) for a table column.
       *
       * @param columnIndex {Integer} The index of the column for which the sort
       *   methods are being  provided.
       *
       * @return {Map} a map with the two properties "ascending"
       *   and "descending" for the specified column.
       *   The property value of each is a comparator function, as described
       *   in {@link #setSortMethods}.
       */
      getSortMethods: function getSortMethods(columnIndex) {
        return this.__sortMethods[columnIndex];
      },

      /**
       * Clears the sorting.
       */
      clearSorting: function clearSorting() {
        if (this.__sortColumnIndex != -1) {
          this.__sortColumnIndex = -1;
          this.__sortAscending = true;
          this.fireEvent("metaDataChanged");
        }
      },
      // overridden
      getSortColumnIndex: function getSortColumnIndex() {
        return this.__sortColumnIndex;
      },

      /**
       * Set the sort column index
       *
       * WARNING: This should be called only by subclasses with intimate
       *          knowledge of what they are doing!
       *
       * @param columnIndex {Integer} index of the column
       */
      _setSortColumnIndex: function _setSortColumnIndex(columnIndex) {
        this.__sortColumnIndex = columnIndex;
      },
      // overridden
      isSortAscending: function isSortAscending() {
        return this.__sortAscending;
      },

      /**
       * Set whether to sort in ascending order or not.
       *
       * WARNING: This should be called only by subclasses with intimate
       *          knowledge of what they are doing!
       *
       * @param ascending {Boolean}
       *   <i>true</i> for an ascending sort;
       *   <i> false</i> for a descending sort.
       */
      _setSortAscending: function _setSortAscending(ascending) {
        this.__sortAscending = ascending;
      },
      // overridden
      getRowCount: function getRowCount() {
        return this._rowArr.length;
      },
      // overridden
      getValue: function getValue(columnIndex, rowIndex) {
        if (rowIndex < 0 || rowIndex >= this._rowArr.length) {
          throw new Error("this._rowArr out of bounds: " + rowIndex + " (0.." + this._rowArr.length + ")");
        }

        return this._rowArr[rowIndex][columnIndex];
      },
      // overridden
      setValue: function setValue(columnIndex, rowIndex, value) {
        if (this._rowArr[rowIndex][columnIndex] != value) {
          this._rowArr[rowIndex][columnIndex] = value; // Inform the listeners

          if (this.hasListener("dataChanged")) {
            var data = {
              firstRow: rowIndex,
              lastRow: rowIndex,
              firstColumn: columnIndex,
              lastColumn: columnIndex
            };
            this.fireDataEvent("dataChanged", data);
          }

          if (columnIndex == this.__sortColumnIndex) {
            this.clearSorting();
          }
        }
      },

      /**
       * Sets the whole data in a bulk.
       *
       * @param rowArr {var[][]} An array containing an array for each row. Each
       *          row-array contains the values in that row in the order of the columns
       *          in this model.
       * @param clearSorting {Boolean ? true} Whether to clear the sort state.
       */
      setData: function setData(rowArr, clearSorting) {
        this._rowArr = rowArr; // Inform the listeners

        if (this.hasListener("dataChanged")) {
          var data = {
            firstRow: 0,
            lastRow: rowArr.length - 1,
            firstColumn: 0,
            lastColumn: this.getColumnCount() - 1
          };
          this.fireDataEvent("dataChanged", data);
        }

        if (clearSorting !== false) {
          this.clearSorting();
        }
      },

      /**
       * Returns the data of this model.
       *
       * Warning: Do not alter this array! If you want to change the data use
       * {@link #setData}, {@link #setDataAsMapArray} or {@link #setValue} instead.
       *
       * @return {var[][]} An array containing an array for each row. Each
       *           row-array contains the values in that row in the order of the columns
       *           in this model.
       */
      getData: function getData() {
        return this._rowArr;
      },

      /**
       * Sets the whole data in a bulk.
       *
       * @param mapArr {Map[]} An array containing a map for each row. Each
       *        row-map contains the column IDs as key and the cell values as value.
       * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
       *        If true {@link #getRowData} will return the original map.
       * @param clearSorting {Boolean ? true} Whether to clear the sort state.
       */
      setDataAsMapArray: function setDataAsMapArray(mapArr, rememberMaps, clearSorting) {
        this.setData(this._mapArray2RowArr(mapArr, rememberMaps), clearSorting);
      },

      /**
       * Adds some rows to the model.
       *
       * Warning: The given array will be altered!
       *
       * @param rowArr {var[][]} An array containing an array for each row. Each
       *          row-array contains the values in that row in the order of the columns
       *          in this model.
       * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
       *          the rows are appended to the end.
       * @param clearSorting {Boolean ? true} Whether to clear the sort state.
       */
      addRows: function addRows(rowArr, startIndex, clearSorting) {
        if (startIndex == null) {
          startIndex = this._rowArr.length;
        } // Prepare the rowArr so it can be used for apply


        rowArr.splice(0, 0, startIndex, 0); // Insert the new rows

        Array.prototype.splice.apply(this._rowArr, rowArr); // Inform the listeners

        var data = {
          firstRow: startIndex,
          lastRow: this._rowArr.length - 1,
          firstColumn: 0,
          lastColumn: this.getColumnCount() - 1
        };
        this.fireDataEvent("dataChanged", data);

        if (clearSorting !== false) {
          this.clearSorting();
        }
      },

      /**
       * Adds some rows to the model.
       *
       * Warning: The given array (mapArr) will be altered!
       *
       * @param mapArr {Map[]} An array containing a map for each row. Each
       *        row-map contains the column IDs as key and the cell values as value.
       * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
       *        the rows are appended to the end.
       * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
       *        If true {@link #getRowData} will return the original map.
       * @param clearSorting {Boolean ? true} Whether to clear the sort state.
       */
      addRowsAsMapArray: function addRowsAsMapArray(mapArr, startIndex, rememberMaps, clearSorting) {
        this.addRows(this._mapArray2RowArr(mapArr, rememberMaps), startIndex, clearSorting);
      },

      /**
       * Sets rows in the model. The rows overwrite the old rows starting at
       * <code>startIndex</code> to <code>startIndex+rowArr.length</code>.
       *
       * Warning: The given array will be altered!
       *
       * @param rowArr {var[][]} An array containing an array for each row. Each
       *          row-array contains the values in that row in the order of the columns
       *          in this model.
       * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
       *          the rows are set from the beginning (0).
       * @param clearSorting {Boolean ? true} Whether to clear the sort state.
       */
      setRows: function setRows(rowArr, startIndex, clearSorting) {
        if (startIndex == null) {
          startIndex = 0;
        } // Prepare the rowArr so it can be used for apply


        rowArr.splice(0, 0, startIndex, rowArr.length); // Replace rows

        Array.prototype.splice.apply(this._rowArr, rowArr); // Inform the listeners

        var data = {
          firstRow: startIndex,
          lastRow: this._rowArr.length - 1,
          firstColumn: 0,
          lastColumn: this.getColumnCount() - 1
        };
        this.fireDataEvent("dataChanged", data);

        if (clearSorting !== false) {
          this.clearSorting();
        }
      },

      /**
       * Set rows in the model. The rows overwrite the old rows starting at
       * <code>startIndex</code> to <code>startIndex+rowArr.length</code>.
       *
       * Warning: The given array (mapArr) will be altered!
       *
       * @param mapArr {Map[]} An array containing a map for each row. Each
       *        row-map contains the column IDs as key and the cell values as value.
       * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
       *        the rows are appended to the end.
       * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
       *        If true {@link #getRowData} will return the original map.
       * @param clearSorting {Boolean ? true} Whether to clear the sort state.
       */
      setRowsAsMapArray: function setRowsAsMapArray(mapArr, startIndex, rememberMaps, clearSorting) {
        this.setRows(this._mapArray2RowArr(mapArr, rememberMaps), startIndex, clearSorting);
      },

      /**
       * Removes some rows from the model.
       *
       * @param startIndex {Integer} the index of the first row to remove.
       * @param howMany {Integer} the number of rows to remove.
       * @param clearSorting {Boolean ? true} Whether to clear the sort state.
       */
      removeRows: function removeRows(startIndex, howMany, clearSorting) {
        this._rowArr.splice(startIndex, howMany); // Inform the listeners


        var data = {
          firstRow: startIndex,
          lastRow: this._rowArr.length - 1,
          firstColumn: 0,
          lastColumn: this.getColumnCount() - 1,
          removeStart: startIndex,
          removeCount: howMany
        };
        this.fireDataEvent("dataChanged", data);

        if (clearSorting !== false) {
          this.clearSorting();
        }
      },

      /**
       * Creates an array of maps to an array of arrays.
       *
       * @param mapArr {Map[]} An array containing a map for each row. Each
       *          row-map contains the column IDs as key and the cell values as value.
       * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
       *        If true {@link #getRowData} will return the original map.
       * @return {var[][]} An array containing an array for each row. Each
       *           row-array contains the values in that row in the order of the columns
       *           in this model.
       */
      _mapArray2RowArr: function _mapArray2RowArr(mapArr, rememberMaps) {
        var rowCount = mapArr.length;
        var columnCount = this.getColumnCount();
        var dataArr = new Array(rowCount);
        var columnArr;

        for (var i = 0; i < rowCount; ++i) {
          columnArr = [];

          if (rememberMaps) {
            columnArr.originalData = mapArr[i];
          }

          for (var j = 0; j < columnCount; ++j) {
            columnArr[j] = mapArr[i][this.getColumnId(j)];
          }

          dataArr[i] = columnArr;
        }

        return dataArr;
      }
    },
    destruct: function destruct() {
      this._rowArr = this.__editableColArr = this.__sortMethods = this.__sortableColArr = null;
    }
  });
  qx.ui.table.model.Simple.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.Grow": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The focus indicator widget
   */
  qx.Class.define("qx.ui.table.pane.FocusIndicator", {
    extend: qx.ui.container.Composite,

    /**
     * @param scroller {qx.ui.table.pane.Scroller} The scroller, which contains this focus indicator
     */
    construct: function construct(scroller) {
      // use the grow layout to make sure that the editing control
      // always fills the focus indicator box.
      qx.ui.container.Composite.constructor.call(this, new qx.ui.layout.Grow());
      this.__scroller = scroller;
      this.setKeepActive(true);
      this.addListener("keypress", this._onKeyPress, this);
    },
    properties: {
      // overridden
      visibility: {
        refine: true,
        init: "excluded"
      },

      /** Table row, where the indicator is placed. */
      row: {
        check: "Integer",
        nullable: true
      },

      /** Table column, where the indicator is placed. */
      column: {
        check: "Integer",
        nullable: true
      }
    },
    members: {
      __scroller: null,

      /**
       * Keypress handler. Suppress all key events but "Enter" and "Escape"
       *
       * @param e {qx.event.type.KeySequence} key event
       */
      _onKeyPress: function _onKeyPress(e) {
        var iden = e.getKeyIdentifier();

        if (iden !== "Escape" && iden !== "Enter") {
          e.stopPropagation();
        }
      },

      /**
       * Move the focus indicator to the given table cell.
       *
       * @param col {Integer?null} The table column
       * @param row {Integer?null} The table row
       */
      moveToCell: function moveToCell(col, row) {
        // check if the focus indicator is shown and if the new column is
        // editable. if not, just exclude the indicator because the pointer events
        // should go to the cell itself linked with HTML links [BUG #4250]
        if (!this.__scroller.getShowCellFocusIndicator() && !this.__scroller.getTable().getTableModel().isColumnEditable(col)) {
          this.exclude();
          return;
        } else {
          this.show();
        }

        if (col == null) {
          this.hide();
          this.setRow(null);
          this.setColumn(null);
        } else {
          var xPos = this.__scroller.getTablePaneModel().getX(col);

          if (xPos == -1) {
            this.hide();
            this.setRow(null);
            this.setColumn(null);
          } else {
            var table = this.__scroller.getTable();

            var columnModel = table.getTableColumnModel();

            var paneModel = this.__scroller.getTablePaneModel();

            var firstRow = this.__scroller.getTablePane().getFirstVisibleRow();

            var rowHeight = table.getRowHeight();
            this.setUserBounds(paneModel.getColumnLeft(col) - 2, (row - firstRow) * rowHeight - 2, columnModel.getColumnWidth(col) + 3, rowHeight + 3);
            this.show();
            this.setRow(row);
            this.setColumn(col);
          }
        }
      }
    },
    destruct: function destruct() {
      this.__scroller = null;
    }
  });
  qx.ui.table.pane.FocusIndicator.$$dbClassInfo = $$dbClassInfo;
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
       2009 Derrell Lipman
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Derrell Lipman (derrell)
  
  ************************************************************************ */

  /**
   * Interface for a column menu item corresponding to a table column.
   */
  qx.Interface.define("qx.ui.table.IColumnMenuItem", {
    properties: {
      /**
       * Whether the table column associated with this menu item is visible
       * Should be of type {Boolean}!
       */
      columnVisible: {}
    },
    events: {
      /**
       * Dispatched when a column changes visibility state. The event data is a
       * boolean indicating whether the table column associated with this menu
       * item is now visible.
       */
      changeColumnVisible: "qx.event.type.Data"
    }
  });
  qx.ui.table.IColumnMenuItem.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.locale.Manager": {}
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
   * Provides information about locale-dependent number formatting (like the decimal
   * separator).
   *
   * @cldr()
   */
  qx.Class.define("qx.locale.Number", {
    statics: {
      /**
       * Get decimal separator for number formatting
       *
       * @param locale {String} optional locale to be used
       * @return {String} decimal separator.
       */
      getDecimalSeparator: function getDecimalSeparator(locale) {
        return qx.locale.Manager.getInstance().localize("cldr_number_decimal_separator", [], locale);
      },

      /**
       * Get thousand grouping separator for number formatting
       *
       * @param locale {String} optional locale to be used
       * @return {String} group separator.
       */
      getGroupSeparator: function getGroupSeparator(locale) {
        return qx.locale.Manager.getInstance().localize("cldr_number_group_separator", [], locale);
      },

      /**
       * Get percent format string
       *
       * @param locale {String} optional locale to be used
       * @return {String} percent format string.
       */
      getPercentFormat: function getPercentFormat(locale) {
        return qx.locale.Manager.getInstance().localize("cldr_number_percent_format", [], locale);
      }
    }
  });
  qx.locale.Number.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-49.js.map
