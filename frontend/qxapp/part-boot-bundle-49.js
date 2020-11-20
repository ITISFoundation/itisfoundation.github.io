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
   * A cell renderer for header cells.
   */
  qx.Interface.define("qx.ui.table.IHeaderRenderer", {
    members: {
      /**
       * Creates a header cell.
       *
       * The cellInfo map contains the following properties:
       * <ul>
       * <li>col (int): the model index of the column.</li>
       * <li>xPos (int): the x position of the column in the table pane.</li>
       * <li>name (string): the name of the column.</li>
       * <li>editable (boolean): whether the column is editable.</li>
       * <li>sorted (boolean): whether the column is sorted.</li>
       * <li>sortedAscending (boolean): whether sorting is ascending.</li>
       * </ul>
       *
       * @abstract
       * @param cellInfo {Map} A map containing the information about the cell to
       *      create.
       * @return {qx.ui.core.Widget} the widget that renders the header cell.
       */
      createHeaderCell: function createHeaderCell(cellInfo) {
        return true;
      },

      /**
       * Updates a header cell.
       *
       * @abstract
       * @param cellInfo {Map} A map containing the information about the cell to
       *      create. This map has the same structure as in {@link #createHeaderCell}.
       * @param cellWidget {qx.ui.core.Widget} the widget that renders the header cell. This is
       *      the same widget formally created by {@link #createHeaderCell}.
       */
      updateHeaderCell: function updateHeaderCell(cellInfo, cellWidget) {
        return true;
      }
    }
  });
  qx.ui.table.IHeaderRenderer.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.table.IHeaderRenderer": {
        "require": true
      },
      "qx.ui.table.headerrenderer.HeaderCell": {},
      "qx.ui.tooltip.ToolTip": {},
      "qx.util.DisposeUtil": {}
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
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * The default header cell renderer.
   */
  qx.Class.define("qx.ui.table.headerrenderer.Default", {
    extend: qx.core.Object,
    implement: qx.ui.table.IHeaderRenderer,

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * @type {String} The state which will be set for header cells of sorted columns.
       */
      STATE_SORTED: "sorted",

      /**
       * @type {String} The state which will be set when sorting is ascending.
       */
      STATE_SORTED_ASCENDING: "sortedAscending"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * ToolTip to show if the pointer hovers of the icon
       */
      toolTip: {
        check: "String",
        init: null,
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      createHeaderCell: function createHeaderCell(cellInfo) {
        var widget = new qx.ui.table.headerrenderer.HeaderCell();
        this.updateHeaderCell(cellInfo, widget);
        return widget;
      },
      // overridden
      updateHeaderCell: function updateHeaderCell(cellInfo, cellWidget) {
        var DefaultHeaderCellRenderer = qx.ui.table.headerrenderer.Default; // check for localization [BUG #2699]

        if (cellInfo.name && cellInfo.name.translate) {
          cellWidget.setLabel(cellInfo.name.translate());
        } else {
          cellWidget.setLabel(cellInfo.name);
        } // Set image tooltip if given


        var widgetToolTip = cellWidget.getToolTip();

        if (this.getToolTip() != null) {
          if (widgetToolTip == null) {
            // We have no tooltip yet -> Create one
            widgetToolTip = new qx.ui.tooltip.ToolTip(this.getToolTip());
            cellWidget.setToolTip(widgetToolTip); // Link disposer to cellwidget to prevent memory leak

            qx.util.DisposeUtil.disposeTriggeredBy(widgetToolTip, cellWidget);
          } else {
            // Update tooltip text
            widgetToolTip.setLabel(this.getToolTip());
          }
        }

        cellInfo.sorted ? cellWidget.addState(DefaultHeaderCellRenderer.STATE_SORTED) : cellWidget.removeState(DefaultHeaderCellRenderer.STATE_SORTED);
        cellInfo.sortedAscending ? cellWidget.addState(DefaultHeaderCellRenderer.STATE_SORTED_ASCENDING) : cellWidget.removeState(DefaultHeaderCellRenderer.STATE_SORTED_ASCENDING);
      }
    }
  });
  qx.ui.table.headerrenderer.Default.$$dbClassInfo = $$dbClassInfo;
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
   * A cell renderer for data cells.
   */
  qx.Interface.define("qx.ui.table.ICellRenderer", {
    members: {
      /**
       * Creates the HTML for a data cell.
       *
       * The cellInfo map contains the following properties:
       * <ul>
       * <li>value (var): the cell's value.</li>
       * <li>rowData (var): contains the row data for the row, the cell belongs to.
       *   The kind of this object depends on the table model, see
       *   {@link qx.ui.table.ITableModel#getRowData}</li>
       * <li>row (int): the model index of the row the cell belongs to.</li>
       * <li>col (int): the model index of the column the cell belongs to.</li>
       * <li>table (qx.ui.table.Table): the table the cell belongs to.</li>
       * <li>xPos (int): the x position of the cell in the table pane.</li>
       * <li>selected (boolean): whether the cell is selected.</li>
       * <li>focusedRow (boolean): whether the cell is in the same row as the
       *   focused cell.</li>
       * <li>editable (boolean): whether the cell is editable.</li>
       * <li>style (string): The CSS styles that should be applied to the outer HTML
       *   element.</li>
       * <li>styleLeft (string): The left position of the cell.</li>
       * <li>styleWidth (string): The cell's width (pixel).</li>
       * <li>styleHeight (string): The cell's height (pixel).</li>
       * </ul>
       *
       * @param cellInfo {Map} A map containing the information about the cell to
       *     create.
       * @param htmlArr {String[]} Target string container. The HTML of the data
       *     cell should be appended to this array.
       *
       * @return {Boolean|undefined}
       *   A return value of <i>true</i> specifies that no additional cells in
       *   the row shall be rendered. This may be used, for example, for
       *   separator rows or for other special rendering purposes. Traditional
       *   cell renderers had no defined return value, so returned nothing
       *   (undefined). If this method returns either false or nothing, then
       *   rendering continues with the next cell in the row, which the normal
       *   mode of operation.
       */
      createDataCellHtml: function createDataCellHtml(cellInfo, htmlArr) {
        return true;
      }
    }
  });
  qx.ui.table.ICellRenderer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.Stylesheet": {
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
      "qx.ui.table.ICellRenderer": {
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
      "qx.bom.element.Style": {},
      "qx.bom.client.Css": {},
      "qx.bom.element.BoxSizing": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxsizing": {
          "className": "qx.bom.client.Css"
        },
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
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * An abstract data cell renderer that does the basic coloring
   * (borders, selected look, ...).
   *
   * @require(qx.bom.Stylesheet)
   */
  qx.Class.define("qx.ui.table.cellrenderer.Abstract", {
    type: "abstract",
    implement: qx.ui.table.ICellRenderer,
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      var cr = qx.ui.table.cellrenderer.Abstract;

      if (!cr.__clazz) {
        cr.__clazz = qx.ui.table.cellrenderer.Abstract;

        this._createStyleSheet(); // add dynamic theme listener


        {
          qx.theme.manager.Meta.getInstance().addListener("changeTheme", this._onChangeTheme, this);
        }
      }
    },
    properties: {
      /**
       * The default cell style. The value of this property will be provided
       * to the cell renderer as cellInfo.style.
       */
      defaultCellStyle: {
        init: null,
        check: "String",
        nullable: true
      }
    },
    members: {
      /**
       * Handler for the theme change.
       * @signature function()
       */
      _onChangeTheme: function _onChangeTheme() {
        qx.bom.Stylesheet.removeAllRules(qx.ui.table.cellrenderer.Abstract.__clazz.stylesheet);

        this._createStyleSheet();
      },

      /**
       * the sum of the horizontal insets. This is needed to compute the box model
       * independent size
       */
      _insetX: 13,
      // paddingLeft + paddingRight + borderRight

      /**
       * the sum of the vertical insets. This is needed to compute the box model
       * independent size
       */
      _insetY: 0,

      /**
       * Creates the style sheet used for the table cells.
       */
      _createStyleSheet: function _createStyleSheet() {
        var colorMgr = qx.theme.manager.Color.getInstance();
        var stylesheet = ".qooxdoo-table-cell {" + qx.bom.element.Style.compile({
          position: "absolute",
          top: "0px",
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderRight: "1px solid " + colorMgr.resolve("table-column-line"),
          padding: "0px 6px",
          cursor: "default",
          textOverflow: "ellipsis",
          userSelect: "none"
        }) + "} " + ".qooxdoo-table-cell-right { text-align:right } " + ".qooxdoo-table-cell-italic { font-style:italic} " + ".qooxdoo-table-cell-bold { font-weight:bold } ";

        if (qx.core.Environment.get("css.boxsizing")) {
          stylesheet += ".qooxdoo-table-cell {" + qx.bom.element.BoxSizing.compile("content-box") + "}";
        }

        qx.ui.table.cellrenderer.Abstract.__clazz.stylesheet = qx.bom.Stylesheet.createElement(stylesheet);
      },

      /**
       * Get a string of the cell element's HTML classes.
       *
       * This method may be overridden by sub classes.
       *
       * @param cellInfo {Map} cellInfo of the cell
       * @return {String} The table cell HTML classes as string.
       */
      _getCellClass: function _getCellClass(cellInfo) {
        return "qooxdoo-table-cell";
      },

      /**
       * Returns the CSS styles that should be applied to the main div of this
       * cell.
       *
       * This method may be overridden by sub classes.
       *
       * @param cellInfo {Map} The information about the cell.
       *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
       * @return {var} the CSS styles of the main div.
       */
      _getCellStyle: function _getCellStyle(cellInfo) {
        return cellInfo.style || "";
      },

      /**
        * Retrieve any extra attributes the cell renderer wants applied to this
        * cell.
        *
        * @param cellInfo {Map} The information about the cell.
        *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
        *
        * @return {String}
        *   The extra attributes to be applied to this cell.
        */
      _getCellAttributes: function _getCellAttributes(cellInfo) {
        return "";
      },

      /**
       * Returns the HTML that should be used inside the main div of this cell.
       *
       * This method may be overridden by sub classes.
       *
       * @param cellInfo {Map} The information about the cell.
       *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
       * @return {String} the inner HTML of the cell.
       */
      _getContentHtml: function _getContentHtml(cellInfo) {
        return cellInfo.value || "";
      },

      /**
       * Get the cell size taking the box model into account
       *
       * @param width {Integer} The cell's (border-box) width in pixel
       * @param height {Integer} The cell's (border-box) height in pixel
       * @param insetX {Integer} The cell's horizontal insets, i.e. the sum of
       *    horizontal paddings and borders
       * @param insetY {Integer} The cell's vertical insets, i.e. the sum of
       *    vertical paddings and borders
       * @return {String} The CSS style string for the cell size
       */
      _getCellSizeStyle: function _getCellSizeStyle(width, height, insetX, insetY) {
        var style = "";

        if (qx.core.Environment.get("css.boxmodel") == "content") {
          width -= insetX;
          height -= insetY;
        }

        style += "width:" + Math.max(width, 0) + "px;";
        style += "height:" + Math.max(height, 0) + "px;";
        return style;
      },
      // interface implementation
      createDataCellHtml: function createDataCellHtml(cellInfo, htmlArr) {
        htmlArr.push('<div class="', this._getCellClass(cellInfo), '" style="', 'left:', cellInfo.styleLeft, 'px;', this._getCellSizeStyle(cellInfo.styleWidth, cellInfo.styleHeight, this._insetX, this._insetY), this._getCellStyle(cellInfo), '" ', this._getCellAttributes(cellInfo), '>' + this._getContentHtml(cellInfo), '</div>');
      }
    },
    destruct: function destruct() {
      // remove dynamic theme listener
      {
        qx.theme.manager.Meta.getInstance().removeListener("changeTheme", this._onChangeTheme, this);
      }
    }
  });
  qx.ui.table.cellrenderer.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.cellrenderer.Abstract": {
        "require": true
      },
      "qx.bom.String": {},
      "qx.util.format.NumberFormat": {},
      "qx.util.format.DateFormat": {}
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
   * The default data cell renderer.
   */
  qx.Class.define("qx.ui.table.cellrenderer.Default", {
    extend: qx.ui.table.cellrenderer.Abstract,

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      STYLEFLAG_ALIGN_RIGHT: 1,
      STYLEFLAG_BOLD: 2,
      STYLEFLAG_ITALIC: 4,
      _numberFormat: null
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Whether the alignment should automatically be set according to the cell value.
       * If true numbers will be right-aligned.
       */
      useAutoAlign: {
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
      /**
       * Determines the styles to apply to the cell
       *
       * @param cellInfo {Map} cellInfo of the cell
       *     See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
       * @return {Integer} the sum of any of the STYLEFLAGS defined below
       */
      _getStyleFlags: function _getStyleFlags(cellInfo) {
        if (this.getUseAutoAlign()) {
          if (typeof cellInfo.value == "number") {
            return qx.ui.table.cellrenderer.Default.STYLEFLAG_ALIGN_RIGHT;
          }
        }

        return 0;
      },
      // overridden
      _getCellClass: function _getCellClass(cellInfo) {
        var cellClass = qx.ui.table.cellrenderer.Default.prototype._getCellClass.base.call(this, cellInfo);

        if (!cellClass) {
          return "";
        }

        var stylesToApply = this._getStyleFlags(cellInfo);

        if (stylesToApply & qx.ui.table.cellrenderer.Default.STYLEFLAG_ALIGN_RIGHT) {
          cellClass += " qooxdoo-table-cell-right";
        }

        if (stylesToApply & qx.ui.table.cellrenderer.Default.STYLEFLAG_BOLD) {
          cellClass += " qooxdoo-table-cell-bold";
        }

        if (stylesToApply & qx.ui.table.cellrenderer.Default.STYLEFLAG_ITALIC) {
          cellClass += " qooxdoo-table-cell-italic";
        }

        return cellClass;
      },
      // overridden
      _getContentHtml: function _getContentHtml(cellInfo) {
        return qx.bom.String.escape(this._formatValue(cellInfo));
      },

      /**
       * Formats a value.
       *
       * @param cellInfo {Map} A map containing the information about the cell to
       *          create. This map has the same structure as in
       *          {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
       * @return {String} the formatted value.
       */
      _formatValue: function _formatValue(cellInfo) {
        var value = cellInfo.value;
        var res;

        if (value == null) {
          return "";
        }

        if (typeof value == "string") {
          return value;
        } else if (typeof value == "number") {
          if (!qx.ui.table.cellrenderer.Default._numberFormat) {
            qx.ui.table.cellrenderer.Default._numberFormat = new qx.util.format.NumberFormat();

            qx.ui.table.cellrenderer.Default._numberFormat.setMaximumFractionDigits(2);
          }

          res = qx.ui.table.cellrenderer.Default._numberFormat.format(value);
        } else if (value instanceof Date) {
          res = qx.util.format.DateFormat.getDateInstance().format(value);
        } else {
          res = value.toString();
        }

        return res;
      }
    }
  });
  qx.ui.table.cellrenderer.Default.$$dbClassInfo = $$dbClassInfo;
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
   * A factory creating widgets to use for editing table cells.
   */
  qx.Interface.define("qx.ui.table.ICellEditorFactory", {
    members: {
      /**
       * Creates a cell editor.
       *
       * The cellInfo map contains the following properties:
       * <ul>
       * <li>value (var): the cell's value.</li>
       * <li>row (int): the model index of the row the cell belongs to.</li>
       * <li>col (int): the model index of the column the cell belongs to.</li>
       * <li>xPos (int): the x position of the cell in the table pane.</li>
       * <li>table (qx.ui.table.Table) reference to the table, the cell belongs to. </li>
       * </ul>
       *
       * @abstract
       * @param cellInfo {Map} A map containing the information about the cell to
       *      create.
       * @return {qx.ui.core.Widget} the widget that should be used as cell editor.
       */
      createCellEditor: function createCellEditor(cellInfo) {
        return true;
      },

      /**
       * Returns the current value of a cell editor.
       *
       * @abstract
       * @param cellEditor {qx.ui.core.Widget} The cell editor formally created by
       *      {@link #createCellEditor}.
       * @return {var} the current value from the editor.
       */
      getCellEditorValue: function getCellEditorValue(cellEditor) {
        return true;
      }
    }
  });
  qx.ui.table.ICellEditorFactory.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.table.ICellEditorFactory": {
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
   * An abstract cell editor factory creating text/password/spinner/... fields.
   */
  qx.Class.define("qx.ui.table.celleditor.AbstractField", {
    extend: qx.core.Object,
    implement: qx.ui.table.ICellEditorFactory,
    type: "abstract",
    properties: {
      /**
       * function that validates the result
       * the function will be called with the new value and the old value and is
       * supposed to return the value that is set as the table value.
       **/
      validationFunction: {
        check: "Function",
        nullable: true,
        init: null
      }
    },
    members: {
      /**
       * Factory to create the editor widget
       *
       * @return {qx.ui.core.Widget} The editor widget
       */
      _createEditor: function _createEditor() {
        throw new Error("Abstract method call!");
      },
      // interface implementation
      createCellEditor: function createCellEditor(cellInfo) {
        var cellEditor = this._createEditor();

        cellEditor.originalValue = cellInfo.value;

        if (cellInfo.value === null || cellInfo.value === undefined) {
          cellInfo.value = "";
        }

        cellEditor.setValue("" + cellInfo.value);
        cellEditor.addListener("appear", function () {
          cellEditor.selectAllText();
        });
        return cellEditor;
      },
      // interface implementation
      getCellEditorValue: function getCellEditorValue(cellEditor) {
        var value = cellEditor.getValue(); // validation function will be called with new and old value

        var validationFunc = this.getValidationFunction();

        if (validationFunc) {
          value = validationFunc(value, cellEditor.originalValue);
        }

        if (typeof cellEditor.originalValue == "number") {
          value = parseFloat(value);
        }

        return value;
      }
    }
  });
  qx.ui.table.celleditor.AbstractField.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.celleditor.AbstractField": {
        "require": true
      },
      "qx.ui.form.TextField": {}
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
   * A cell editor factory creating text fields.
   */
  qx.Class.define("qx.ui.table.celleditor.TextField", {
    extend: qx.ui.table.celleditor.AbstractField,
    members: {
      // overridden
      getCellEditorValue: function getCellEditorValue(cellEditor) {
        var value = cellEditor.getValue(); // validation function will be called with new and old value

        var validationFunc = this.getValidationFunction();

        if (validationFunc) {
          value = validationFunc(value, cellEditor.originalValue);
        }

        if (typeof cellEditor.originalValue == "number") {
          // Correct problem of NaN displaying when value is null string.
          //if (value != null) {
          if (value != null && value != '') {
            value = parseFloat(value);
          }
        }

        return value;
      },
      _createEditor: function _createEditor() {
        var cellEditor = new qx.ui.form.TextField();
        cellEditor.setAppearance("table-editor-textfield");
        return cellEditor;
      }
    }
  });
  qx.ui.table.celleditor.TextField.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.table.headerrenderer.Default": {
        "require": true
      },
      "qx.ui.table.cellrenderer.Default": {
        "require": true
      },
      "qx.ui.table.celleditor.TextField": {
        "require": true
      },
      "qx.ui.table.IHeaderRenderer": {},
      "qx.ui.table.ICellRenderer": {},
      "qx.ui.table.ICellEditorFactory": {},
      "qx.lang.Array": {}
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
   * A model that contains all meta data about columns, such as width, renderer,
   * visibility and order.
   *
   * @see qx.ui.table.ITableModel
   */
  qx.Class.define("qx.ui.table.columnmodel.Basic", {
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__overallColumnArr = [];
      this.__visibleColumnArr = [];
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the width of a column has changed. The data property of the event is
       * a map having the following attributes:
       * <ul>
       *   <li>col: The model index of the column the width of which has changed.</li>
       *   <li>newWidth: The new width of the column in pixels.</li>
       *   <li>oldWidth: The old width of the column in pixels.</li>
       * </ul>
       */
      "widthChanged": "qx.event.type.Data",

      /**
       * Fired when the visibility of a column has changed. This event is equal to
        * "visibilityChanged", but is fired right before.
       */
      "visibilityChangedPre": "qx.event.type.Data",

      /**
       * Fired when the visibility of a column has changed. The data property of the
       * event is a map having the following attributes:
       * <ul>
       *   <li>col: The model index of the column the visibility of which has changed.</li>
       *   <li>visible: Whether the column is now visible.</li>
       * </ul>
       */
      "visibilityChanged": "qx.event.type.Data",

      /**
       * Fired when the column order has changed. The data property of the
       * event is a map having the following attributes:
       * <ul>
       *   <li>col: The model index of the column that was moved.</li>
       *   <li>fromOverXPos: The old overall x position of the column.</li>
       *   <li>toOverXPos: The new overall x position of the column.</li>
       * </ul>
       */
      "orderChanged": "qx.event.type.Data",

      /**
       * Fired when the cell renderer of a column has changed.
       * The data property of the event is a map having the following attributes:
       * <ul>
       *   <li>col: The model index of the column that was moved.</li>
       * </ul>
       */
      "headerCellRendererChanged": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} the default width of a column in pixels. */
      DEFAULT_WIDTH: 100,

      /** @type {qx.ui.table.headerrenderer.Default} the default header cell renderer. */
      DEFAULT_HEADER_RENDERER: qx.ui.table.headerrenderer.Default,

      /** @type {qx.ui.table.cellrenderer.Default} the default data cell renderer. */
      DEFAULT_DATA_RENDERER: qx.ui.table.cellrenderer.Default,

      /** @type {qx.ui.table.celleditor.TextField} the default editor factory. */
      DEFAULT_EDITOR_FACTORY: qx.ui.table.celleditor.TextField
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __internalChange: null,
      __colToXPosMap: null,
      __visibleColumnArr: null,
      __overallColumnArr: null,
      __columnDataArr: null,
      __headerRenderer: null,
      __dataRenderer: null,
      __editorFactory: null,

      /**
       * Initializes the column model.
       *
       * @param colCount {Integer}
       *   The number of columns the model should have.
       *
       * @param table {qx.ui.table.Table}
       *   The table to which this column model is attached.
       */
      init: function init(colCount, table) {
        {
          this.assertInteger(colCount, "Invalid argument 'colCount'.");
        }
        this.__columnDataArr = [];
        var width = qx.ui.table.columnmodel.Basic.DEFAULT_WIDTH;
        var headerRenderer = this.__headerRenderer || (this.__headerRenderer = new qx.ui.table.columnmodel.Basic.DEFAULT_HEADER_RENDERER());
        var dataRenderer = this.__dataRenderer || (this.__dataRenderer = new qx.ui.table.columnmodel.Basic.DEFAULT_DATA_RENDERER());
        var editorFactory = this.__editorFactory || (this.__editorFactory = new qx.ui.table.columnmodel.Basic.DEFAULT_EDITOR_FACTORY());
        this.__overallColumnArr = [];
        this.__visibleColumnArr = []; // Get the initially hidden column array, if one was provided. Older
        // subclasses may not provide the 'table' argument, so we treat them
        // traditionally with no initially hidden columns.

        var initiallyHiddenColumns; // Was a table provided to us?

        if (table) {
          // Yup. Get its list of initially hidden columns, if the user provided
          // such a list.
          initiallyHiddenColumns = table.getInitiallyHiddenColumns();
        } // If no table was specified, or if the user didn't provide a list of
        // initially hidden columns, use an empty list.


        initiallyHiddenColumns = initiallyHiddenColumns || [];

        for (var col = 0; col < colCount; col++) {
          this.__columnDataArr[col] = {
            width: width,
            headerRenderer: headerRenderer,
            dataRenderer: dataRenderer,
            editorFactory: editorFactory
          };
          this.__overallColumnArr[col] = col;
          this.__visibleColumnArr[col] = col;
        }

        this.__colToXPosMap = null; // If any columns are initially hidden, hide them now. Make it an
        // internal change so that events are not generated.

        this.__internalChange = true;

        for (var hidden = 0; hidden < initiallyHiddenColumns.length; hidden++) {
          this.setColumnVisible(initiallyHiddenColumns[hidden], false);
        }

        this.__internalChange = false;

        for (col = 0; col < colCount; col++) {
          var data = {
            col: col,
            visible: this.isColumnVisible(col)
          };
          this.fireDataEvent("visibilityChangedPre", data);
          this.fireDataEvent("visibilityChanged", data);
        }
      },

      /**
       * Return the array of visible columns
       *
       * @return {Array} List of all visible columns
       */
      getVisibleColumns: function getVisibleColumns() {
        return this.__visibleColumnArr != null ? this.__visibleColumnArr : [];
      },

      /**
       * Sets the width of a column.
       *
       * @param col {Integer}
       *   The model index of the column.
       *
       * @param width {Integer}
       *   The new width the column should get in pixels.
       *
       * @param isPointerAction {Boolean}
       *   <i>true</i> if the column width is being changed as a result of a
       *   pointer drag in the header; false or undefined otherwise.
       *
       */
      setColumnWidth: function setColumnWidth(col, width, isPointerAction) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertInteger(width, "Invalid argument 'width'.");
          this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
        }
        var oldWidth = this.__columnDataArr[col].width;

        if (oldWidth != width) {
          this.__columnDataArr[col].width = width;
          var data = {
            col: col,
            newWidth: width,
            oldWidth: oldWidth,
            isPointerAction: isPointerAction || false
          };
          this.fireDataEvent("widthChanged", data);
        }
      },

      /**
       * Returns the width of a column.
       *
       * @param col {Integer} the model index of the column.
       * @return {Integer} the width of the column in pixels.
       */
      getColumnWidth: function getColumnWidth(col) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
        }
        return this.__columnDataArr[col].width;
      },

      /**
       * Sets the header renderer of a column.
       *
       * @param col {Integer} the model index of the column.
       * @param renderer {qx.ui.table.IHeaderRenderer} the new header renderer the column
       *      should get.
       */
      setHeaderCellRenderer: function setHeaderCellRenderer(col, renderer) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertInterface(renderer, qx.ui.table.IHeaderRenderer, "Invalid argument 'renderer'.");
          this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
        }
        var oldRenderer = this.__columnDataArr[col].headerRenderer;

        if (oldRenderer !== this.__headerRenderer) {
          oldRenderer.dispose();
        }

        this.__columnDataArr[col].headerRenderer = renderer;
        this.fireDataEvent("headerCellRendererChanged", {
          col: col
        });
      },

      /**
       * Returns the header renderer of a column.
       *
       * @param col {Integer} the model index of the column.
       * @return {qx.ui.table.IHeaderRenderer} the header renderer of the column.
       */
      getHeaderCellRenderer: function getHeaderCellRenderer(col) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
        }
        return this.__columnDataArr[col].headerRenderer;
      },

      /**
       * Sets the data renderer of a column.
       *
       * @param col {Integer} the model index of the column.
       * @param renderer {qx.ui.table.ICellRenderer} the new data renderer
       *   the column should get.
       * @return {qx.ui.table.ICellRenderer?null} If an old renderer was set and
       *   it was not the default renderer, the old renderer is returned for
       *   pooling or disposing.
       */
      setDataCellRenderer: function setDataCellRenderer(col, renderer) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertInterface(renderer, qx.ui.table.ICellRenderer, "Invalid argument 'renderer'.");
          this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
        }
        var oldRenderer = this.__columnDataArr[col].dataRenderer;
        this.__columnDataArr[col].dataRenderer = renderer;

        if (oldRenderer !== this.__dataRenderer) {
          return oldRenderer;
        }

        return null;
      },

      /**
       * Returns the data renderer of a column.
       *
       * @param col {Integer} the model index of the column.
       * @return {qx.ui.table.ICellRenderer} the data renderer of the column.
       */
      getDataCellRenderer: function getDataCellRenderer(col) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
        }
        return this.__columnDataArr[col].dataRenderer;
      },

      /**
       * Sets the cell editor factory of a column.
       *
       * @param col {Integer} the model index of the column.
       * @param factory {qx.ui.table.ICellEditorFactory} the new cell editor factory the column should get.
       */
      setCellEditorFactory: function setCellEditorFactory(col, factory) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertInterface(factory, qx.ui.table.ICellEditorFactory, "Invalid argument 'factory'.");
          this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
        }
        var oldFactory = this.__columnDataArr[col].editorFactory;

        if (oldFactory === factory) {
          return;
        }

        if (oldFactory !== this.__editorFactory) {
          oldFactory.dispose();
        }

        this.__columnDataArr[col].editorFactory = factory;
      },

      /**
       * Returns the cell editor factory of a column.
       *
       * @param col {Integer} the model index of the column.
       * @return {qx.ui.table.ICellEditorFactory} the cell editor factory of the column.
       */
      getCellEditorFactory: function getCellEditorFactory(col) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
        }
        return this.__columnDataArr[col].editorFactory;
      },

      /**
       * Returns the map that translates model indexes to x positions.
       *
       * The returned map contains for a model index (int) a map having two
       * properties: overX (the overall x position of the column, int) and
       * visX (the visible x position of the column, int). visX is missing for
       * hidden columns.
       *
       * @return {Map} the "column to x position" map.
       */
      _getColToXPosMap: function _getColToXPosMap() {
        if (this.__colToXPosMap == null) {
          this.__colToXPosMap = {};

          for (var overX = 0; overX < this.__overallColumnArr.length; overX++) {
            var col = this.__overallColumnArr[overX];
            this.__colToXPosMap[col] = {
              overX: overX
            };
          }

          for (var visX = 0; visX < this.__visibleColumnArr.length; visX++) {
            var col = this.__visibleColumnArr[visX];
            this.__colToXPosMap[col].visX = visX;
          }
        }

        return this.__colToXPosMap;
      },

      /**
       * Returns the number of visible columns.
       *
       * @return {Integer} the number of visible columns.
       */
      getVisibleColumnCount: function getVisibleColumnCount() {
        return this.__visibleColumnArr != null ? this.__visibleColumnArr.length : 0;
      },

      /**
       * Returns the model index of a column at a certain visible x position.
       *
       * @param visXPos {Integer} the visible x position of the column.
       * @return {Integer} the model index of the column.
       */
      getVisibleColumnAtX: function getVisibleColumnAtX(visXPos) {
        {
          this.assertInteger(visXPos, "Invalid argument 'visXPos'.");
        }
        return this.__visibleColumnArr[visXPos];
      },

      /**
       * Returns the visible x position of a column.
       *
       * @param col {Integer} the model index of the column.
       * @return {Integer} the visible x position of the column.
       */
      getVisibleX: function getVisibleX(col) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
        }
        return this._getColToXPosMap()[col].visX;
      },

      /**
       * Returns the overall number of columns (including hidden columns).
       *
       * @return {Integer} the overall number of columns.
       */
      getOverallColumnCount: function getOverallColumnCount() {
        return this.__overallColumnArr.length;
      },

      /**
       * Returns the model index of a column at a certain overall x position.
       *
       * @param overXPos {Integer} the overall x position of the column.
       * @return {Integer} the model index of the column.
       */
      getOverallColumnAtX: function getOverallColumnAtX(overXPos) {
        {
          this.assertInteger(overXPos, "Invalid argument 'overXPos'.");
        }
        return this.__overallColumnArr[overXPos];
      },

      /**
       * Returns the overall x position of a column.
       *
       * @param col {Integer} the model index of the column.
       * @return {Integer} the overall x position of the column.
       */
      getOverallX: function getOverallX(col) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
        }
        return this._getColToXPosMap()[col].overX;
      },

      /**
       * Returns whether a certain column is visible.
       *
       * @param col {Integer} the model index of the column.
       * @return {Boolean} whether the column is visible.
       */
      isColumnVisible: function isColumnVisible(col) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
        }
        return this._getColToXPosMap()[col].visX != null;
      },

      /**
       * Sets whether a certain column is visible.
       *
       * @param col {Integer} the model index of the column.
       * @param visible {Boolean} whether the column should be visible.
       */
      setColumnVisible: function setColumnVisible(col, visible) {
        {
          this.assertInteger(col, "Invalid argument 'col'.");
          this.assertBoolean(visible, "Invalid argument 'visible'.");
        }

        if (visible != this.isColumnVisible(col)) {
          if (visible) {
            var colToXPosMap = this._getColToXPosMap();

            var overX = colToXPosMap[col].overX;

            if (overX == null) {
              throw new Error("Showing column failed: " + col + ". The column is not added to this TablePaneModel.");
            } // get the visX of the next visible column after the column to show


            var nextVisX;

            for (var x = overX + 1; x < this.__overallColumnArr.length; x++) {
              var currCol = this.__overallColumnArr[x];
              var currVisX = colToXPosMap[currCol].visX;

              if (currVisX != null) {
                nextVisX = currVisX;
                break;
              }
            } // If there comes no visible column any more, then show the column
            // at the end


            if (nextVisX == null) {
              nextVisX = this.__visibleColumnArr.length;
            } // Add the column to the visible columns


            this.__visibleColumnArr.splice(nextVisX, 0, col);
          } else {
            var visX = this.getVisibleX(col);

            this.__visibleColumnArr.splice(visX, 1);
          } // Invalidate the __colToXPosMap


          this.__colToXPosMap = null; // Inform the listeners

          if (!this.__internalChange) {
            var data = {
              col: col,
              visible: visible
            };
            this.fireDataEvent("visibilityChangedPre", data);
            this.fireDataEvent("visibilityChanged", data);
          }
        }
      },

      /**
       * Moves a column.
       *
       * @param fromOverXPos {Integer} the overall x position of the column to move.
       * @param toOverXPos {Integer} the overall x position of where the column should be
       *      moved to.
       */
      moveColumn: function moveColumn(fromOverXPos, toOverXPos) {
        {
          this.assertInteger(fromOverXPos, "Invalid argument 'fromOverXPos'.");
          this.assertInteger(toOverXPos, "Invalid argument 'toOverXPos'.");
        }
        this.__internalChange = true;
        var col = this.__overallColumnArr[fromOverXPos];
        var visible = this.isColumnVisible(col);

        if (visible) {
          this.setColumnVisible(col, false);
        }

        this.__overallColumnArr.splice(fromOverXPos, 1);

        this.__overallColumnArr.splice(toOverXPos, 0, col); // Invalidate the __colToXPosMap


        this.__colToXPosMap = null;

        if (visible) {
          this.setColumnVisible(col, true);
        }

        this.__internalChange = false; // Inform the listeners

        var data = {
          col: col,
          fromOverXPos: fromOverXPos,
          toOverXPos: toOverXPos
        };
        this.fireDataEvent("orderChanged", data);
      },

      /**
       * Reorders all columns to new overall positions. Will fire one "orderChanged" event
       * without data afterwards
       *
       * @param newPositions {Integer[]} Array mapping the index of a column in table model to its wanted overall
       *                            position on screen (both zero based). If the table models holds
       *                            col0, col1, col2 and col3 and you give [1,3,2,0], the new column order
       *                            will be col3, col0, col2, col1
       */
      setColumnsOrder: function setColumnsOrder(newPositions) {
        {
          this.assertArray(newPositions, "Invalid argument 'newPositions'.");
        }

        if (newPositions.length == this.__overallColumnArr.length) {
          this.__internalChange = true; // Go through each column an switch visible ones to invisible. Reason is unknown,
          // this just mimicks the behaviour of moveColumn. Possibly useful because setting
          // a column visible later updates a map with its screen coords.

          var isVisible = new Array(newPositions.length);

          for (var colIdx = 0; colIdx < this.__overallColumnArr.length; colIdx++) {
            var visible = this.isColumnVisible(colIdx);
            isVisible[colIdx] = visible; //Remember, as this relies on this.__colToXPosMap which is cleared below

            if (visible) {
              this.setColumnVisible(colIdx, false);
            }
          } // Store new position values


          this.__overallColumnArr = qx.lang.Array.clone(newPositions); // Invalidate the __colToXPosMap

          this.__colToXPosMap = null; // Go through each column an switch invisible ones back to visible

          for (var colIdx = 0; colIdx < this.__overallColumnArr.length; colIdx++) {
            if (isVisible[colIdx]) {
              this.setColumnVisible(colIdx, true);
            }
          }

          this.__internalChange = false; // Inform the listeners. Do not add data as all known listeners in qooxdoo
          // only take this event to mean "total repaint necesscary". Fabian will look
          // after deprecating the data part of the orderChanged - event

          this.fireDataEvent("orderChanged");
        } else {
          throw new Error("setColumnsOrder: Invalid number of column positions given, expected " + this.__overallColumnArr.length + ", got " + newPositions.length);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      for (var i = 0; i < this.__columnDataArr.length; i++) {
        this.__columnDataArr[i].headerRenderer.dispose();

        this.__columnDataArr[i].dataRenderer.dispose();

        this.__columnDataArr[i].editorFactory.dispose();
      }

      this.__overallColumnArr = this.__visibleColumnArr = this.__columnDataArr = this.__colToXPosMap = null;

      this._disposeObjects("__headerRenderer", "__dataRenderer", "__editorFactory");
    }
  });
  qx.ui.table.columnmodel.Basic.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.table.columnmodel.Basic": {
        "construct": true,
        "require": true
      },
      "qx.locale.MTranslation": {
        "require": true
      },
      "qx.ui.table.columnmodel.resizebehavior.Default": {},
      "qx.event.Timer": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.tableResizeDebug": {}
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
   * A table column model that automatically resizes columns based on a
   * selected behavior.
   *
   * @see qx.ui.table.columnmodel.Basic
   */
  qx.Class.define("qx.ui.table.columnmodel.Resize", {
    extend: qx.ui.table.columnmodel.Basic,
    include: qx.locale.MTranslation,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.table.columnmodel.Basic.constructor.call(this); // We don't want to recursively call ourself based on our resetting of
      // column sizes.  Track when we're resizing.

      this.__bInProgress = false; // Track when the table has appeared.  We want to ignore resize events
      // until then since we won't be able to determine the available width
      // anyway.

      this.__bAppeared = false;
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The behavior to use.
       *
       * The provided behavior must extend {@link qx.ui.table.columnmodel.resizebehavior.Abstract} and
       * implement the <i>onAppear</i>, <i>onTableWidthChanged</i>,
       * <i>onColumnWidthChanged</i> and <i>onVisibilityChanged</i>methods.
       */
      behavior: {
        check: "qx.ui.table.columnmodel.resizebehavior.Abstract",
        init: null,
        nullable: true,
        apply: "_applyBehavior",
        event: "changeBehavior"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __bAppeared: null,
      __bInProgress: null,
      __table: null,
      // Behavior modifier
      _applyBehavior: function _applyBehavior(value, old) {
        if (old != null) {
          old.dispose();
          old = null;
        } // Tell the new behavior how many columns there are


        value._setNumColumns(this.getOverallColumnCount());

        value.setTableColumnModel(this);
      },

      /**
       * Initializes the column model.
       *
       * @param numColumns {Integer} the number of columns the model should have.
       * @param table {qx.ui.table.Table}
       *   The table which this model is used for. This allows us access to
       *   other aspects of the table, as the <i>behavior</i> sees fit.
       */
      init: function init(numColumns, table) {
        // Call our superclass
        qx.ui.table.columnmodel.Resize.prototype.init.base.call(this, numColumns, table);

        if (this.__table == null) {
          this.__table = table; // We'll do our column resizing when the table appears, ...

          table.addListener("appear", this._onappear, this); // ... when the inner width of the table changes, ...

          table.addListener("tableWidthChanged", this._onTableWidthChanged, this); // ... when a vertical scroll bar appears or disappears

          table.addListener("verticalScrollBarChanged", this._onverticalscrollbarchanged, this); // We want to manipulate the button visibility menu

          table.addListener("columnVisibilityMenuCreateEnd", this._addResetColumnWidthButton, this); // ... when columns are resized, ...

          this.addListener("widthChanged", this._oncolumnwidthchanged, this); // ... and when a column visibility changes.

          this.addListener("visibilityChanged", this._onvisibilitychanged, this);
        } // Set the initial resize behavior


        if (this.getBehavior() == null) {
          this.setBehavior(new qx.ui.table.columnmodel.resizebehavior.Default());
        } // Tell the behavior how many columns there are


        this.getBehavior()._setNumColumns(numColumns);
      },

      /**
       * Get the table widget
       *
       * @return {qx.ui.table.Table} the table widget
       */
      getTable: function getTable() {
        return this.__table;
      },

      /**
       * Reset the column widths to their "onappear" defaults.
       *
       * @param event {qx.event.type.Data}
       *   The "columnVisibilityMenuCreateEnd" event indicating that the menu is
       *   being generated.  The data is a map containing properties <i>table</i>
       *   and <i>menu</i>.
       *
       */
      _addResetColumnWidthButton: function _addResetColumnWidthButton(event) {
        var data = event.getData();
        var columnButton = data.columnButton;
        var menu = data.menu;
        var o; // Add a separator between the column names and our reset button

        o = columnButton.factory("separator");
        menu.add(o); // Add a button to reset the column widths

        o = columnButton.factory("user-button", {
          text: this.tr("Reset column widths")
        });
        menu.add(o);
        o.addListener("execute", this._onappear, this);
      },

      /**
       * Event handler for the "appear" event.
       *
       * @param event {qx.event.type.Event}
       *   The "onappear" event object.
       *
       */
      _onappear: function _onappear(event) {
        // Is this a recursive call?
        if (this.__bInProgress) {
          // Yup.  Ignore it.
          return;
        }

        this.__bInProgress = true;
        {
          if (qx.core.Environment.get("qx.tableResizeDebug")) {
            this.debug("onappear");
          }
        } // this handler is also called by the "execute" event of the menu button

        this.getBehavior().onAppear(event, event.getType() !== "appear");

        this.__table._updateScrollerWidths();

        this.__table._updateScrollBarVisibility();

        this.__bInProgress = false;
        this.__bAppeared = true;
      },

      /**
       * Event handler for the "tableWidthChanged" event.
       *
       * @param event {qx.event.type.Event}
       *   The "onwindowresize" event object.
       *
       */
      _onTableWidthChanged: function _onTableWidthChanged(event) {
        // Is this a recursive call or has the table not yet been rendered?
        if (this.__bInProgress || !this.__bAppeared) {
          // Yup.  Ignore it.
          return;
        }

        this.__bInProgress = true;
        {
          if (qx.core.Environment.get("qx.tableResizeDebug")) {
            this.debug("ontablewidthchanged");
          }
        }
        this.getBehavior().onTableWidthChanged(event);
        this.__bInProgress = false;
      },

      /**
       * Event handler for the "verticalScrollBarChanged" event.
       *
       * @param event {qx.event.type.Data}
       *   The "verticalScrollBarChanged" event object.  The data is a boolean
       *   indicating whether a vertical scroll bar is now present.
       *
       */
      _onverticalscrollbarchanged: function _onverticalscrollbarchanged(event) {
        // Is this a recursive call or has the table not yet been rendered?
        if (this.__bInProgress || !this.__bAppeared) {
          // Yup.  Ignore it.
          return;
        }

        this.__bInProgress = true;
        {
          if (qx.core.Environment.get("qx.tableResizeDebug")) {
            this.debug("onverticalscrollbarchanged");
          }
        }
        this.getBehavior().onVerticalScrollBarChanged(event);
        qx.event.Timer.once(function () {
          if (this.__table && !this.__table.isDisposed()) {
            this.__table._updateScrollerWidths();

            this.__table._updateScrollBarVisibility();
          }
        }, this, 0);
        this.__bInProgress = false;
      },

      /**
       * Event handler for the "widthChanged" event.
       *
       * @param event {qx.event.type.Data}
       *   The "widthChanged" event object.
       *
       */
      _oncolumnwidthchanged: function _oncolumnwidthchanged(event) {
        // Is this a recursive call or has the table not yet been rendered?
        if (this.__bInProgress || !this.__bAppeared) {
          // Yup.  Ignore it.
          return;
        }

        this.__bInProgress = true;
        {
          if (qx.core.Environment.get("qx.tableResizeDebug")) {
            this.debug("oncolumnwidthchanged");
          }
        }
        this.getBehavior().onColumnWidthChanged(event);
        this.__bInProgress = false;
      },

      /**
       * Event handler for the "visibilityChanged" event.
       *
       * @param event {qx.event.type.Data}
       *   The "visibilityChanged" event object.
       *
       */
      _onvisibilitychanged: function _onvisibilitychanged(event) {
        // Is this a recursive call or has the table not yet been rendered?
        if (this.__bInProgress || !this.__bAppeared) {
          // Yup.  Ignore it.
          return;
        }

        this.__bInProgress = true;
        {
          if (qx.core.Environment.get("qx.tableResizeDebug")) {
            this.debug("onvisibilitychanged");
          }
        }
        this.getBehavior().onVisibilityChanged(event);
        this.__bInProgress = false;
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      var behavior = this.getBehavior();

      if (behavior) {
        behavior.dispose();
      }

      this.__table = null;
    }
  });
  qx.ui.table.columnmodel.Resize.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MDragDropScrolling": {
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.table.rowrenderer.Default": {
        "construct": true
      },
      "qx.locale.Manager": {
        "construct": true
      },
      "qx.ui.table.columnmenu.Button": {},
      "qx.ui.table.selection.Manager": {},
      "qx.ui.table.selection.Model": {},
      "qx.ui.table.columnmodel.Basic": {},
      "qx.ui.table.pane.Pane": {},
      "qx.ui.table.pane.Header": {},
      "qx.ui.table.pane.Scroller": {},
      "qx.ui.table.pane.Model": {},
      "qx.ui.basic.Label": {},
      "qx.ui.table.model.Simple": {},
      "qx.event.Registration": {},
      "qx.log.Logger": {},
      "qx.ui.table.pane.FocusIndicator": {},
      "qx.lang.Number": {},
      "qx.event.Timer": {},
      "qx.core.Assert": {},
      "qx.ui.table.IColumnMenuItem": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * Table
   *
   * A detailed description can be found in the package description
   * {@link qx.ui.table}.
   *
   * @childControl statusbar {qx.ui.basic.Label} label to show the status of the table
   * @childControl column-button {qx.ui.table.columnmenu.Button} button to open the column menu
   */
  qx.Class.define("qx.ui.table.Table", {
    extend: qx.ui.core.Widget,
    include: qx.ui.core.MDragDropScrolling,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param tableModel {qx.ui.table.ITableModel ? null}
     *   The table model to read the data from.
     *
     * @param custom {Map ? null}
     *   A map provided to override the various supplemental classes allocated
     *   within this constructor.  Each property must be a function which
     *   returns an object instance, as indicated by shown the defaults listed
     *   here:
     *
     *   <dl>
     *     <dt>initiallyHiddenColumns</dt>
     *       <dd>
     *         {Array?}
     *         A list of column numbers that should be initially invisible. Any
     *         column not mentioned will be initially visible, and if no array
     *         is provided, all columns will be initially visible.
     *       </dd>
     *     <dt>selectionManager</dt>
     *       <dd><pre class='javascript'>
     *         function(obj)
     *         {
     *           return new qx.ui.table.selection.Manager(obj);
     *         }
     *       </pre></dd>
     *     <dt>selectionModel</dt>
     *       <dd><pre class='javascript'>
     *         function(obj)
     *         {
     *           return new qx.ui.table.selection.Model(obj);
     *         }
     *       </pre></dd>
     *     <dt>tableColumnModel</dt>
     *       <dd><pre class='javascript'>
     *         function(obj)
     *         {
     *           return new qx.ui.table.columnmodel.Basic(obj);
     *         }
     *       </pre></dd>
     *     <dt>tablePaneModel</dt>
     *       <dd><pre class='javascript'>
     *         function(obj)
     *         {
     *           return new qx.ui.table.pane.Model(obj);
     *         }
     *       </pre></dd>
     *     <dt>tablePane</dt>
     *       <dd><pre class='javascript'>
     *         function(obj)
     *         {
     *           return new qx.ui.table.pane.Pane(obj);
     *         }
     *       </pre></dd>
     *     <dt>tablePaneHeader</dt>
     *       <dd><pre class='javascript'>
     *         function(obj)
     *         {
     *           return new qx.ui.table.pane.Header(obj);
     *         }
     *       </pre></dd>
     *     <dt>tablePaneScroller</dt>
     *       <dd><pre class='javascript'>
     *         function(obj)
     *         {
     *           return new qx.ui.table.pane.Scroller(obj);
     *         }
     *       </pre></dd>
     *     <dt>tablePaneModel</dt>
     *       <dd><pre class='javascript'>
     *         function(obj)
     *         {
     *           return new qx.ui.table.pane.Model(obj);
     *         }
     *       </pre></dd>
     *     <dt>columnMenu</dt>
     *       <dd><pre class='javascript'>
     *         function()
     *         {
     *           return new qx.ui.table.columnmenu.Button();
     *         }
     *       </pre></dd>
     *   </dl>
     */
    construct: function construct(tableModel, custom) {
      qx.ui.core.Widget.constructor.call(this); //
      // Use default objects if custom objects are not specified
      //

      if (!custom) {
        custom = {};
      }

      if (custom.initiallyHiddenColumns) {
        this.setInitiallyHiddenColumns(custom.initiallyHiddenColumns);
      }

      if (custom.selectionManager) {
        this.setNewSelectionManager(custom.selectionManager);
      }

      if (custom.selectionModel) {
        this.setNewSelectionModel(custom.selectionModel);
      }

      if (custom.tableColumnModel) {
        this.setNewTableColumnModel(custom.tableColumnModel);
      }

      if (custom.tablePane) {
        this.setNewTablePane(custom.tablePane);
      }

      if (custom.tablePaneHeader) {
        this.setNewTablePaneHeader(custom.tablePaneHeader);
      }

      if (custom.tablePaneScroller) {
        this.setNewTablePaneScroller(custom.tablePaneScroller);
      }

      if (custom.tablePaneModel) {
        this.setNewTablePaneModel(custom.tablePaneModel);
      }

      if (custom.columnMenu) {
        this.setNewColumnMenu(custom.columnMenu);
      }

      this._setLayout(new qx.ui.layout.VBox()); // Create the child widgets


      this.__scrollerParent = new qx.ui.container.Composite(new qx.ui.layout.HBox());

      this._add(this.__scrollerParent, {
        flex: 1
      }); // Allocate a default data row renderer


      this.setDataRowRenderer(new qx.ui.table.rowrenderer.Default(this)); // Create the models

      this.__selectionManager = this.getNewSelectionManager()(this);
      this.setSelectionModel(this.getNewSelectionModel()(this));
      this.setTableModel(tableModel || this.getEmptyTableModel()); // create the main meta column

      this.setMetaColumnCounts([-1]); // Make focusable

      this.setTabIndex(1);
      this.addListener("keydown", this._onKeyDown);
      this.addListener("focus", this._onFocusChanged);
      this.addListener("blur", this._onFocusChanged); // attach the resize listener to the last child of the layout. This
      // ensures that all other children are laid out before

      var spacer = new qx.ui.core.Widget().set({
        height: 0
      });

      this._add(spacer);

      spacer.addListener("resize", this._onResize, this);
      this.__focusedCol = null;
      this.__focusedRow = null; // add an event listener which updates the table content on locale change

      {
        qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
      }
      this.initStatusBarVisible(); // If the table model has an init() method...

      tableModel = this.getTableModel();

      if (tableModel.init && typeof tableModel.init == "function") {
        // ... then call it now to allow the table model to affect table
        // properties.
        tableModel.init(this);
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Dispatched before adding the column list to the column visibility menu.
       * The event data is a map with two properties: table and menu.  Listeners
       * may add additional items to the menu, which appear at the top of the
       * menu.
       */
      "columnVisibilityMenuCreateStart": "qx.event.type.Data",

      /**
       * Dispatched after adding the column list to the column visibility menu.
       * The event data is a map with two properties: table and menu.  Listeners
       * may add additional items to the menu, which appear at the bottom of the
       * menu.
       */
      "columnVisibilityMenuCreateEnd": "qx.event.type.Data",

      /**
       * Dispatched when the width of the table has changed.
       */
      "tableWidthChanged": "qx.event.type.Event",

      /**
       * Dispatched when updating scrollbars discovers that a vertical scrollbar
       * is needed when it previously was not, or vice versa.  The data is a
       * boolean indicating whether a vertical scrollbar is now being used.
       */
      "verticalScrollBarChanged": "qx.event.type.Data",

      /**
       * Dispatched when a data cell has been tapped.
       */
      "cellTap": "qx.ui.table.pane.CellEvent",

      /**
       * Dispatched when a data cell has been tapped.
       */
      "cellDbltap": "qx.ui.table.pane.CellEvent",

      /**
       * Dispatched when the context menu is needed in a data cell
       */
      "cellContextmenu": "qx.ui.table.pane.CellEvent",

      /**
       * Dispatched after a cell editor is flushed.
       *
       * The data is a map containing this properties:
       * <ul>
       *   <li>row</li>
       *   <li>col</li>
       *   <li>value</li>
       *   <li>oldValue</li>
       * </ul>
       */
      "dataEdited": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Events that must be redirected to the scrollers. */
      __redirectEvents: {
        cellTap: 1,
        cellDbltap: 1,
        cellContextmenu: 1
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "table"
      },
      focusable: {
        refine: true,
        init: true
      },
      minWidth: {
        refine: true,
        init: 50
      },

      /**
       * The list of columns that are initially hidden. This property is set by
       * the constructor, from the value received in
       * custom.initiallyHiddenColumns, and is only used when a column model is
       * initialized. It can be of great benefit in tables with numerous columns
       * where most are not initially visible. The process of creating the
       * headers for all of the columns, only to have those columns discarded
       * shortly thereafter when setColumnVisibility(false) is called, is a
       * waste of (significant, in some browsers) time. Specifying the
       * non-visible columns at constructor time can therefore avoid the initial
       * creation of all of those superfluous widgets.
       */
      initiallyHiddenColumns: {
        init: null
      },

      /**
       * Whether the widget contains content which may be selected by the user.
       *
       * If the value set to <code>true</code> the native browser selection can
       * be used for text selection. But it is normally useful for
       * forms fields, longer texts/documents, editors, etc.
       *
       * Note: This has no effect on Table!
       */
      selectable: {
        refine: true,
        init: false
      },

      /** The selection model. */
      selectionModel: {
        check: "qx.ui.table.selection.Model",
        apply: "_applySelectionModel",
        event: "changeSelectionModel"
      },

      /** The table model. */
      tableModel: {
        check: "qx.ui.table.ITableModel",
        apply: "_applyTableModel",
        event: "changeTableModel"
      },

      /** The height of the table rows. */
      rowHeight: {
        check: "Number",
        init: 20,
        apply: "_applyRowHeight",
        event: "changeRowHeight",
        themeable: true
      },

      /**
       * Force line height to match row height.  May be disabled if cell
       * renderers being used wish to render multiple lines of data within a
       * cell.  (With the default setting, all but the first of multiple lines
       * of data will not be visible.)
       */
      forceLineHeight: {
        check: "Boolean",
        init: true
      },

      /**
       *  Whether the header cells are visible. When setting this to false,
       *  you'll likely also want to set the {#columnVisibilityButtonVisible}
       *  property to false as well, to entirely remove the header row.
       */
      headerCellsVisible: {
        check: "Boolean",
        init: true,
        apply: "_applyHeaderCellsVisible",
        themeable: true
      },

      /** The height of the header cells. */
      headerCellHeight: {
        check: "Integer",
        init: 16,
        apply: "_applyHeaderCellHeight",
        event: "changeHeaderCellHeight",
        nullable: true,
        themeable: true
      },

      /** Whether to show the status bar */
      statusBarVisible: {
        check: "Boolean",
        init: true,
        apply: "_applyStatusBarVisible"
      },

      /** The Statusbartext, set it, if you want some more Information */
      additionalStatusBarText: {
        nullable: true,
        init: null,
        apply: "_applyAdditionalStatusBarText"
      },

      /** Whether to show the column visibility button */
      columnVisibilityButtonVisible: {
        check: "Boolean",
        init: true,
        apply: "_applyColumnVisibilityButtonVisible",
        themeable: true
      },

      /**
       * @type {Integer[]} The number of columns per meta column. If the last array entry is -1,
       * this meta column will get the remaining columns.
       */
      metaColumnCounts: {
        check: "Object",
        apply: "_applyMetaColumnCounts"
      },

      /**
       * Whether the focus should moved when the pointer is moved over a cell. If false
       * the focus is only moved on pointer taps.
       */
      focusCellOnPointerMove: {
        check: "Boolean",
        init: false,
        apply: "_applyFocusCellOnPointerMove"
      },

      /**
       * Whether row focus change by keyboard also modifies selection
       */
      rowFocusChangeModifiesSelection: {
        check: "Boolean",
        init: true
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
        init: true,
        apply: "_applyContextMenuFromDataCellsOnly"
      },

      /**
       * Whether the table should keep the first visible row complete. If set to false,
       * the first row may be rendered partial, depending on the vertical scroll value.
       */
      keepFirstVisibleRowComplete: {
        check: "Boolean",
        init: true,
        apply: "_applyKeepFirstVisibleRowComplete"
      },

      /**
       * Whether the table cells should be updated when only the selection or the
       * focus changed. This slows down the table update but allows to react on a
       * changed selection or a changed focus in a cell renderer.
       */
      alwaysUpdateCells: {
        check: "Boolean",
        init: false
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
        init: true,
        apply: "_applyResetSelectionOnHeaderTap"
      },

      /** The renderer to use for styling the rows. */
      dataRowRenderer: {
        check: "qx.ui.table.IRowRenderer",
        init: null,
        nullable: true,
        event: "changeDataRowRenderer"
      },

      /**
       * A function to call when before modal cell editor is opened.
       *
       * @signature function(cellEditor, cellInfo)
       *
       * @param cellEditor {qx.ui.window.Window}
       *   The modal window which has been created for this cell editor
       *
       * @param cellInfo {Map}
       *   Information about the cell for which this cell editor was created.
       *   It contains the following properties:
       *       col, row, xPos, value
       *
       */
      modalCellEditorPreOpenFunction: {
        check: "Function",
        init: null,
        nullable: true
      },

      /**
       * By default, all Scrollers' (meta-columns') horizontal scrollbars are
       * shown if any one is required. Allow not showing any that are not
       * required.
       */
      excludeScrollerScrollbarsIfNotNeeded: {
        check: "Boolean",
        init: false,
        nullable: false
      },

      /**
       * A function to instantiate a new column menu button.
       */
      newColumnMenu: {
        check: "Function",
        init: function init() {
          return new qx.ui.table.columnmenu.Button();
        }
      },

      /**
       * A function to instantiate a selection manager.  this allows subclasses of
       * Table to subclass this internal class.  To take effect, this property must
       * be set before calling the Table constructor.
       */
      newSelectionManager: {
        check: "Function",
        init: function init(obj) {
          return new qx.ui.table.selection.Manager(obj);
        }
      },

      /**
       * A function to instantiate a selection model.  this allows subclasses of
       * Table to subclass this internal class.  To take effect, this property must
       * be set before calling the Table constructor.
       */
      newSelectionModel: {
        check: "Function",
        init: function init(obj) {
          return new qx.ui.table.selection.Model(obj);
        }
      },

      /**
       * A function to instantiate a table column model.  This allows subclasses
       * of Table to subclass this internal class.  To take effect, this
       * property must be set before calling the Table constructor.
       */
      newTableColumnModel: {
        check: "Function",
        init: function init(table) {
          return new qx.ui.table.columnmodel.Basic(table);
        }
      },

      /**
       * A function to instantiate a table pane.  this allows subclasses of
       * Table to subclass this internal class.  To take effect, this property
       * must be set before calling the Table constructor.
       */
      newTablePane: {
        check: "Function",
        init: function init(obj) {
          return new qx.ui.table.pane.Pane(obj);
        }
      },

      /**
       * A function to instantiate a table pane.  this allows subclasses of
       * Table to subclass this internal class.  To take effect, this property
       * must be set before calling the Table constructor.
       */
      newTablePaneHeader: {
        check: "Function",
        init: function init(obj) {
          return new qx.ui.table.pane.Header(obj);
        }
      },

      /**
       * A function to instantiate a table pane scroller.  this allows
       * subclasses of Table to subclass this internal class.  To take effect,
       * this property must be set before calling the Table constructor.
       */
      newTablePaneScroller: {
        check: "Function",
        init: function init(obj) {
          return new qx.ui.table.pane.Scroller(obj);
        }
      },

      /**
       * A function to instantiate a table pane model.  this allows subclasses
       * of Table to subclass this internal class.  To take effect, this
       * property must be set before calling the Table constructor.
       */
      newTablePaneModel: {
        check: "Function",
        init: function init(columnModel) {
          return new qx.ui.table.pane.Model(columnModel);
        }
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __focusedCol: null,
      __focusedRow: null,
      __scrollerParent: null,
      __selectionManager: null,
      __additionalStatusBarText: null,
      __lastRowCount: null,
      __internalChange: null,
      __columnMenuButtons: null,
      __columnModel: null,
      __emptyTableModel: null,
      __hadVerticalScrollBar: null,
      __timer: null,
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "statusbar":
            control = new qx.ui.basic.Label();
            control.set({
              allowGrowX: true
            });

            this._add(control);

            break;

          case "column-button":
            control = this.getNewColumnMenu()();
            control.set({
              focusable: false
            }); // Create the initial menu too

            var menu = control.factory("menu", {
              table: this
            }); // Add a listener to initialize the column menu when it becomes visible

            menu.addListener("appear", this._initColumnMenu, this);
            break;
        }

        return control || qx.ui.table.Table.prototype._createChildControlImpl.base.call(this, id);
      },
      // property modifier
      _applySelectionModel: function _applySelectionModel(value, old) {
        this.__selectionManager.setSelectionModel(value);

        if (old != null) {
          old.removeListener("changeSelection", this._onSelectionChanged, this);
        }

        value.addListener("changeSelection", this._onSelectionChanged, this);
      },
      // property modifier
      _applyRowHeight: function _applyRowHeight(value, old) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].updateVerScrollBarMaximum();
        }
      },
      // property modifier
      _applyHeaderCellsVisible: function _applyHeaderCellsVisible(value, old) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          if (value) {
            scrollerArr[i]._showChildControl("header");
          } else {
            scrollerArr[i]._excludeChildControl("header");
          }
        } // also hide the column visibility button


        if (this.getColumnVisibilityButtonVisible()) {
          this._applyColumnVisibilityButtonVisible(value);
        }
      },
      // property modifier
      _applyHeaderCellHeight: function _applyHeaderCellHeight(value, old) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].getHeader().setHeight(value);
        }
      },

      /**
       * Get an empty table model instance to use for this table. Use this table
       * to configure the table with no table model.
       *
       * @return {qx.ui.table.ITableModel} The empty table model
       */
      getEmptyTableModel: function getEmptyTableModel() {
        if (!this.__emptyTableModel) {
          this.__emptyTableModel = new qx.ui.table.model.Simple();

          this.__emptyTableModel.setColumns([]);

          this.__emptyTableModel.setData([]);
        }

        return this.__emptyTableModel;
      },
      // property modifier
      _applyTableModel: function _applyTableModel(value, old) {
        this.getTableColumnModel().init(value.getColumnCount(), this);

        if (old != null) {
          old.removeListener("metaDataChanged", this._onTableModelMetaDataChanged, this);
          old.removeListener("dataChanged", this._onTableModelDataChanged, this);
        }

        value.addListener("metaDataChanged", this._onTableModelMetaDataChanged, this);
        value.addListener("dataChanged", this._onTableModelDataChanged, this); // Update the status bar

        this._updateStatusBar();

        this._updateTableData(0, value.getRowCount(), 0, value.getColumnCount());

        this._onTableModelMetaDataChanged(); // If the table model has an init() method, call it. We don't, however,
        // call it if this is the initial setting of the table model, as the
        // scrollers are not yet initialized. In that case, the init method is
        // called explicitly by the Table constructor.


        if (old && value.init && typeof value.init == "function") {
          value.init(this);
        }
      },

      /**
       * Get the The table column model.
       *
       * @return {qx.ui.table.columnmodel.Basic} The table's column model
       */
      getTableColumnModel: function getTableColumnModel() {
        if (!this.__columnModel) {
          var columnModel = this.__columnModel = this.getNewTableColumnModel()(this);
          columnModel.addListener("visibilityChanged", this._onColVisibilityChanged, this);
          columnModel.addListener("widthChanged", this._onColWidthChanged, this);
          columnModel.addListener("orderChanged", this._onColOrderChanged, this); // Get the current table model

          var tableModel = this.getTableModel();
          columnModel.init(tableModel.getColumnCount(), this); // Reset the table column model in each table pane model

          var scrollerArr = this._getPaneScrollerArr();

          for (var i = 0; i < scrollerArr.length; i++) {
            var paneScroller = scrollerArr[i];
            var paneModel = paneScroller.getTablePaneModel();
            paneModel.setTableColumnModel(columnModel);
          }
        }

        return this.__columnModel;
      },
      // property modifier
      _applyStatusBarVisible: function _applyStatusBarVisible(value, old) {
        if (value) {
          this._showChildControl("statusbar");
        } else {
          this._excludeChildControl("statusbar");
        }

        if (value) {
          this._updateStatusBar();
        }
      },
      // property modifier
      _applyAdditionalStatusBarText: function _applyAdditionalStatusBarText(value, old) {
        this.__additionalStatusBarText = value;

        this._updateStatusBar();
      },
      // property modifier
      _applyColumnVisibilityButtonVisible: function _applyColumnVisibilityButtonVisible(value, old) {
        if (value) {
          this._showChildControl("column-button");
        } else {
          this._excludeChildControl("column-button");
        }
      },
      // property modifier
      _applyMetaColumnCounts: function _applyMetaColumnCounts(value, old) {
        var metaColumnCounts = value;

        var scrollerArr = this._getPaneScrollerArr();

        var handlers = {};

        if (value > old) {
          // Save event listeners on the redirected events so we can re-apply
          // them to new scrollers.
          var manager = qx.event.Registration.getManager(scrollerArr[0]);

          for (var evName in qx.ui.table.Table.__redirectEvents) {
            handlers[evName] = {};
            handlers[evName].capture = manager.getListeners(scrollerArr[0], evName, true);
            handlers[evName].bubble = manager.getListeners(scrollerArr[0], evName, false);
          }
        } // Remove the panes not needed any more


        this._cleanUpMetaColumns(metaColumnCounts.length); // Update the old panes


        var leftX = 0;

        for (var i = 0; i < scrollerArr.length; i++) {
          var paneScroller = scrollerArr[i];
          var paneModel = paneScroller.getTablePaneModel();
          paneModel.setFirstColumnX(leftX);
          paneModel.setMaxColumnCount(metaColumnCounts[i]);
          leftX += metaColumnCounts[i];
        } // Add the new panes


        if (metaColumnCounts.length > scrollerArr.length) {
          var columnModel = this.getTableColumnModel();

          for (var i = scrollerArr.length; i < metaColumnCounts.length; i++) {
            var paneModel = this.getNewTablePaneModel()(columnModel);
            paneModel.setFirstColumnX(leftX);
            paneModel.setMaxColumnCount(metaColumnCounts[i]);
            leftX += metaColumnCounts[i];
            var paneScroller = this.getNewTablePaneScroller()(this);
            paneScroller.setTablePaneModel(paneModel); // Register event listener for vertical scrolling

            paneScroller.addListener("changeScrollY", this._onScrollY, this); // Apply redirected events to this new scroller

            for (evName in qx.ui.table.Table.__redirectEvents) {
              // On first setting of meta columns (constructing phase), there
              // are no handlers to deal with yet.
              if (!handlers[evName]) {
                break;
              }

              if (handlers[evName].capture && handlers[evName].capture.length > 0) {
                var capture = handlers[evName].capture;

                for (var j = 0; j < capture.length; j++) {
                  // Determine what context to use.  If the context does not
                  // exist, we assume that the context is this table.  If it
                  // does exist and it equals the first pane scroller (from
                  // which we retrieved the listeners) then set the context
                  // to be this new pane scroller.  Otherwise leave the context
                  // as it was set.
                  var context = capture[j].context;

                  if (!context) {
                    context = this;
                  } else if (context == scrollerArr[0]) {
                    context = paneScroller;
                  }

                  paneScroller.addListener(evName, capture[j].handler, context, true);
                }
              }

              if (handlers[evName].bubble && handlers[evName].bubble.length > 0) {
                var bubble = handlers[evName].bubble;

                for (var j = 0; j < bubble.length; j++) {
                  // Determine what context to use.  If the context does not
                  // exist, we assume that the context is this table.  If it
                  // does exist and it equals the first pane scroller (from
                  // which we retrieved the listeners) then set the context
                  // to be this new pane scroller.  Otherwise leave the context
                  // as it was set.
                  var context = bubble[j].context;

                  if (!context) {
                    context = this;
                  } else if (context == scrollerArr[0]) {
                    context = paneScroller;
                  }

                  paneScroller.addListener(evName, bubble[j].handler, context, false);
                }
              }
            } // last meta column is flexible


            var flex = i == metaColumnCounts.length - 1 ? 1 : 0;

            this.__scrollerParent.add(paneScroller, {
              flex: flex
            });

            scrollerArr = this._getPaneScrollerArr();
          }
        } // Update all meta columns


        for (var i = 0; i < scrollerArr.length; i++) {
          var paneScroller = scrollerArr[i];
          var isLast = i == scrollerArr.length - 1; // Set the right header height

          paneScroller.getHeader().setHeight(this.getHeaderCellHeight()); // Put the column visibility button in the top right corner of the last meta column

          paneScroller.setTopRightWidget(isLast ? this.getChildControl("column-button") : null);
        }

        if (!this.isColumnVisibilityButtonVisible()) {
          this._excludeChildControl("column-button");
        }

        this._updateScrollerWidths();

        this._updateScrollBarVisibility();
      },
      // property modifier
      _applyFocusCellOnPointerMove: function _applyFocusCellOnPointerMove(value, old) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].setFocusCellOnPointerMove(value);
        }
      },
      // property modifier
      _applyShowCellFocusIndicator: function _applyShowCellFocusIndicator(value, old) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].setShowCellFocusIndicator(value);
        }
      },
      // property modifier
      _applyContextMenuFromDataCellsOnly: function _applyContextMenuFromDataCellsOnly(value, old) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].setContextMenuFromDataCellsOnly(value);
        }
      },
      // property modifier
      _applyKeepFirstVisibleRowComplete: function _applyKeepFirstVisibleRowComplete(value, old) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].onKeepFirstVisibleRowCompleteChanged();
        }
      },
      // property modifier
      _applyResetSelectionOnHeaderTap: function _applyResetSelectionOnHeaderTap(value, old) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].setResetSelectionOnHeaderTap(value);
        }
      },

      /**
       * Returns the selection manager.
       *
       * @return {qx.ui.table.selection.Manager} the selection manager.
       */
      getSelectionManager: function getSelectionManager() {
        return this.__selectionManager;
      },

      /**
       * Returns an array containing all TablePaneScrollers in this table.
       *
       * @return {qx.ui.table.pane.Scroller[]} all TablePaneScrollers in this table.
       */
      _getPaneScrollerArr: function _getPaneScrollerArr() {
        return this.__scrollerParent.getChildren();
      },

      /**
       * Returns a TablePaneScroller of this table.
       *
       * @param metaColumn {Integer} the meta column to get the TablePaneScroller for.
       * @return {qx.ui.table.pane.Scroller} the qx.ui.table.pane.Scroller.
       */
      getPaneScroller: function getPaneScroller(metaColumn) {
        return this._getPaneScrollerArr()[metaColumn];
      },

      /**
       * Cleans up the meta columns.
       *
       * @param fromMetaColumn {Integer} the first meta column to clean up. All following
       *      meta columns will be cleaned up, too. All previous meta columns will
       *      stay unchanged. If 0 all meta columns will be cleaned up.
       */
      _cleanUpMetaColumns: function _cleanUpMetaColumns(fromMetaColumn) {
        var scrollerArr = this._getPaneScrollerArr();

        if (scrollerArr != null) {
          for (var i = scrollerArr.length - 1; i >= fromMetaColumn; i--) {
            scrollerArr[i].destroy();
          }
        }
      },

      /**
       * Event handler. Called when the locale has changed.
       *
       * @param evt {Event} the event.
       */
      _onChangeLocale: function _onChangeLocale(evt) {
        this.updateContent();

        this._updateStatusBar();
      },
      // overridden
      _onChangeTheme: function _onChangeTheme() {
        qx.ui.table.Table.prototype._onChangeTheme.base.call(this);

        this.getDataRowRenderer().initThemeValues();
        this.updateContent();

        this._updateStatusBar();
      },

      /**
       * Event handler. Called when the selection has changed.
       *
       * @param evt {Map} the event.
       */
      _onSelectionChanged: function _onSelectionChanged(evt) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].onSelectionChanged();
        }

        this._updateStatusBar();
      },

      /**
       * Event handler. Called when the table model meta data has changed.
       *
       * @param evt {Map} the event.
       */
      _onTableModelMetaDataChanged: function _onTableModelMetaDataChanged(evt) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].onTableModelMetaDataChanged();
        }

        this._updateStatusBar();
      },

      /**
       * Event handler. Called when the table model data has changed.
       *
       * @param evt {Map} the event.
       */
      _onTableModelDataChanged: function _onTableModelDataChanged(evt) {
        var data = evt.getData();

        this._updateTableData(data.firstRow, data.lastRow, data.firstColumn, data.lastColumn, data.removeStart, data.removeCount);
      },
      // overridden
      _onContextMenuOpen: function _onContextMenuOpen(e) {// This is Widget's context menu handler which typically retrieves
        // and displays the menu as soon as it receives a "contextmenu" event.
        // We want to allow the cellContextmenu handler to create the menu,
        // so we'll override this method with a null one, and do the menu
        // placement and display handling in our _onContextMenu method.
      },

      /**
       * To update the table if the table model has changed and remove selection.
       *
       * @param firstRow {Integer} The index of the first row that has changed.
       * @param lastRow {Integer} The index of the last row that has changed.
       * @param firstColumn {Integer} The model index of the first column that has changed.
       * @param lastColumn {Integer} The model index of the last column that has changed.
       * @param removeStart {Integer ? null} The first index of the interval (including), to remove selection.
       * @param removeCount {Integer ? null} The count of the interval, to remove selection.
       */
      _updateTableData: function _updateTableData(firstRow, lastRow, firstColumn, lastColumn, removeStart, removeCount) {
        var scrollerArr = this._getPaneScrollerArr(); // update selection if rows were removed


        if (removeCount) {
          this.getSelectionModel().removeSelectionInterval(removeStart, removeStart + removeCount - 1, true); // remove focus if the focused row has been removed

          if (this.__focusedRow >= removeStart && this.__focusedRow < removeStart + removeCount) {
            this.setFocusedCell();
          }
        }

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].onTableModelDataChanged(firstRow, lastRow, firstColumn, lastColumn);
        }

        var rowCount = this.getTableModel().getRowCount();

        if (rowCount != this.__lastRowCount) {
          this.__lastRowCount = rowCount;

          this._updateScrollBarVisibility();

          this._updateStatusBar();
        }
      },

      /**
       * Event handler. Called when a TablePaneScroller has been scrolled vertically.
       *
       * @param evt {Map} the event.
       */
      _onScrollY: function _onScrollY(evt) {
        if (!this.__internalChange) {
          this.__internalChange = true; // Set the same scroll position to all meta columns

          var scrollerArr = this._getPaneScrollerArr();

          for (var i = 0; i < scrollerArr.length; i++) {
            scrollerArr[i].setScrollY(evt.getData());
          }

          this.__internalChange = false;
        }
      },

      /**
       * Event handler. Called when a key was pressed.
       *
       * @param evt {qx.event.type.KeySequence} the event.
       * @deprecated {6.0} please use _onKeyDown instead!
       */
      _onKeyPress: function _onKeyPress(evt) {
        qx.log.Logger.deprecatedMethodWarning(this._onKeyPress, "The method '_onKeyPress()' is deprecated. Please use '_onKeyDown()' instead.");
        qx.log.Logger.deprecateMethodOverriding(this, qx.ui.table.Table, "_onKeyPress", "The method '_onKeyPress()' is deprecated. Please use '_onKeyDown()' instead.");

        this._onKeyDown(evt);
      },

      /**
       * Event handler. Called when on key down event
       *
       * @param evt {qx.event.type.KeySequence} the event.
       */
      _onKeyDown: function _onKeyDown(evt) {
        if (!this.getEnabled()) {
          return;
        } // No editing mode


        var oldFocusedRow = this.__focusedRow;
        var consumed = false; // Handle keys that are independent from the modifiers

        var identifier = evt.getKeyIdentifier();

        if (this.isEditing()) {
          // Editing mode
          if (evt.getModifiers() == 0) {
            switch (identifier) {
              case "Enter":
                this.stopEditing();
                var oldFocusedRow = this.__focusedRow;
                this.moveFocusedCell(0, 1);

                if (this.__focusedRow != oldFocusedRow) {
                  consumed = this.startEditing();
                }

                break;

              case "Escape":
                this.cancelEditing();
                this.focus();
                break;

              default:
                consumed = false;
                break;
            }
          }
        } else {
          consumed = true; // No editing mode

          if (evt.isCtrlPressed()) {
            // Handle keys that depend on modifiers
            switch (identifier) {
              case "A":
                // Ctrl + A
                var rowCount = this.getTableModel().getRowCount();

                if (rowCount > 0) {
                  this.getSelectionModel().setSelectionInterval(0, rowCount - 1);
                }

                break;

              default:
                consumed = false;
                break;
            }
          } else {
            // Handle keys that are independent from the modifiers
            switch (identifier) {
              case "Space":
                this.__selectionManager.handleSelectKeyDown(this.__focusedRow, evt);

                break;

              case "F2":
              case "Enter":
                this.startEditing();
                consumed = true;
                break;

              case "Home":
                this.setFocusedCell(this.__focusedCol, 0, true);
                break;

              case "End":
                var rowCount = this.getTableModel().getRowCount();
                this.setFocusedCell(this.__focusedCol, rowCount - 1, true);
                break;

              case "Left":
                this.moveFocusedCell(-1, 0);
                break;

              case "Right":
                this.moveFocusedCell(1, 0);
                break;

              case "Up":
                this.moveFocusedCell(0, -1);
                break;

              case "Down":
                this.moveFocusedCell(0, 1);
                break;

              case "PageUp":
              case "PageDown":
                var scroller = this.getPaneScroller(0);
                var pane = scroller.getTablePane();
                var rowHeight = this.getRowHeight();
                var direction = identifier == "PageUp" ? -1 : 1;
                rowCount = pane.getVisibleRowCount() - 1;
                scroller.setScrollY(scroller.getScrollY() + direction * rowCount * rowHeight);
                this.moveFocusedCell(0, direction * rowCount);
                break;

              default:
                consumed = false;
            }
          }
        }

        if (oldFocusedRow != this.__focusedRow && this.getRowFocusChangeModifiesSelection()) {
          // The focus moved -> Let the selection manager handle this event
          this.__selectionManager.handleMoveKeyDown(this.__focusedRow, evt);
        }

        if (consumed) {
          evt.preventDefault();
          evt.stopPropagation();
        }
      },

      /**
       * Event handler. Called when the table gets the focus.
       *
       * @param evt {Map} the event.
       */
      _onFocusChanged: function _onFocusChanged(evt) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].onFocusChanged();
        }
      },

      /**
       * Event handler. Called when the visibility of a column has changed.
       *
       * @param evt {Map} the event.
       */
      _onColVisibilityChanged: function _onColVisibilityChanged(evt) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].onColVisibilityChanged();
        }

        var data = evt.getData();

        if (this.__columnMenuButtons != null && data.col != null && data.visible != null) {
          this.__columnMenuButtons[data.col].setColumnVisible(data.visible);
        }

        this._updateScrollerWidths();

        this._updateScrollBarVisibility();
      },

      /**
       * Event handler. Called when the width of a column has changed.
       *
       * @param evt {Map} the event.
       */
      _onColWidthChanged: function _onColWidthChanged(evt) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          var data = evt.getData();
          scrollerArr[i].setColumnWidth(data.col, data.newWidth);
        }

        this._updateScrollerWidths();

        this._updateScrollBarVisibility();
      },

      /**
       * Event handler. Called when the column order has changed.
       *
       * @param evt {Map} the event.
       */
      _onColOrderChanged: function _onColOrderChanged(evt) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].onColOrderChanged();
        } // A column may have been moved between meta columns


        this._updateScrollerWidths();

        this._updateScrollBarVisibility();
      },

      /**
       * Gets the TablePaneScroller at a certain x position in the page. If there is
       * no TablePaneScroller at this position, null is returned.
       *
       * @param pageX {Integer} the position in the page to check (in pixels).
       * @return {qx.ui.table.pane.Scroller} the TablePaneScroller or null.
       */
      getTablePaneScrollerAtPageX: function getTablePaneScrollerAtPageX(pageX) {
        var metaCol = this._getMetaColumnAtPageX(pageX);

        return metaCol != -1 ? this.getPaneScroller(metaCol) : null;
      },

      /**
       * Sets the currently focused cell. A value of <code>null</code> hides the
       * focus cell.
       *
       * @param col {Integer?null} the model index of the focused cell's column.
       * @param row {Integer?null} the model index of the focused cell's row.
       * @param scrollVisible {Boolean ? false} whether to scroll the new focused cell
       *          visible.
       */
      setFocusedCell: function setFocusedCell(col, row, scrollVisible) {
        if (!this.isEditing() && (col != this.__focusedCol || row != this.__focusedRow)) {
          if (col === null) {
            col = 0;
          }

          this.__focusedCol = col;
          this.__focusedRow = row;

          var scrollerArr = this._getPaneScrollerArr();

          for (var i = 0; i < scrollerArr.length; i++) {
            scrollerArr[i].setFocusedCell(col, row);
          }

          if (col != null && scrollVisible) {
            this.scrollCellVisible(col, row);
          }
        }
      },

      /**
       * Resets (clears) the current selection
       */
      resetSelection: function resetSelection() {
        this.getSelectionModel().resetSelection();
      },

      /**
       * Resets the focused cell.
       */
      resetCellFocus: function resetCellFocus() {
        this.setFocusedCell(null, null, false);
      },

      /**
       * Returns the column of the currently focused cell.
       *
       * @return {Integer} the model index of the focused cell's column.
       */
      getFocusedColumn: function getFocusedColumn() {
        return this.__focusedCol;
      },

      /**
       * Returns the row of the currently focused cell.
       *
       * @return {Integer} the model index of the focused cell's column.
       */
      getFocusedRow: function getFocusedRow() {
        return this.__focusedRow;
      },

      /**
       * Select whether the focused row is highlighted
       *
       * @param bHighlight {Boolean}
       *   Flag indicating whether the focused row should be highlighted.
       *
       */
      highlightFocusedRow: function highlightFocusedRow(bHighlight) {
        this.getDataRowRenderer().setHighlightFocusRow(bHighlight);
      },

      /**
       * Remove the highlighting of the current focus row.
       *
       * This is used to temporarily remove the highlighting of the currently
       * focused row, and is expected to be used most typically by adding a
       * listener on the "pointerout" event, so that the focus highlighting is
       * suspended when the pointer leaves the table:
       *
       *     table.addListener("pointerout", table.clearFocusedRowHighlight);
       *
       * @param evt {qx.event.type.Pointer} Incoming pointer event
       */
      clearFocusedRowHighlight: function clearFocusedRowHighlight(evt) {
        if (evt) {
          var relatedTarget = evt.getRelatedTarget();

          if (relatedTarget instanceof qx.ui.table.pane.Pane || relatedTarget instanceof qx.ui.table.pane.FocusIndicator) {
            return;
          }
        } // Remove focus from any cell that has it


        this.resetCellFocus(); // Now, for each pane scroller...

        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          // ... repaint without focus.
          scrollerArr[i].onFocusChanged();
        }
      },

      /**
       * Moves the focus.
       *
       * @param deltaX {Integer} The delta by which the focus should be moved on the x axis.
       * @param deltaY {Integer} The delta by which the focus should be moved on the y axis.
       */
      moveFocusedCell: function moveFocusedCell(deltaX, deltaY) {
        var col = this.__focusedCol;
        var row = this.__focusedRow; // could also be undefined [BUG #4676]

        if (col == null || row == null) {
          return;
        }

        if (deltaX != 0) {
          var columnModel = this.getTableColumnModel();
          var x = columnModel.getVisibleX(col);
          var colCount = columnModel.getVisibleColumnCount();
          x = qx.lang.Number.limit(x + deltaX, 0, colCount - 1);
          col = columnModel.getVisibleColumnAtX(x);
        }

        if (deltaY != 0) {
          var tableModel = this.getTableModel();
          row = qx.lang.Number.limit(row + deltaY, 0, tableModel.getRowCount() - 1);
        }

        this.setFocusedCell(col, row, true);
      },

      /**
       * Scrolls a cell visible.
       *
       * @param col {Integer} the model index of the column the cell belongs to.
       * @param row {Integer} the model index of the row the cell belongs to.
       */
      scrollCellVisible: function scrollCellVisible(col, row) {
        // get the dom element
        var elem = this.getContentElement().getDomElement(); // if the dom element is not available, the table hasn't been rendered

        if (!elem) {
          // postpone the scroll until the table has appeared
          this.addListenerOnce("appear", function () {
            this.scrollCellVisible(col, row);
          }, this);
        }

        var columnModel = this.getTableColumnModel();
        var x = columnModel.getVisibleX(col);

        var metaColumn = this._getMetaColumnAtColumnX(x);

        if (metaColumn != -1) {
          this.getPaneScroller(metaColumn).scrollCellVisible(col, row);
        }
      },

      /**
       * Returns whether currently a cell is editing.
       *
       * @return {var} whether currently a cell is editing.
       */
      isEditing: function isEditing() {
        if (this.__focusedCol != null) {
          var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);

          var metaColumn = this._getMetaColumnAtColumnX(x);

          return this.getPaneScroller(metaColumn).isEditing();
        }

        return false;
      },

      /**
       * Starts editing the currently focused cell. Does nothing if already editing
       * or if the column is not editable.
       *
       * @return {Boolean} whether editing was started
       */
      startEditing: function startEditing() {
        if (this.__focusedCol != null) {
          var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);

          var metaColumn = this._getMetaColumnAtColumnX(x);

          var started = this.getPaneScroller(metaColumn).startEditing();
          return started;
        }

        return false;
      },

      /**
       * Stops editing and writes the editor's value to the model.
       */
      stopEditing: function stopEditing() {
        if (this.__focusedCol != null) {
          var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);

          var metaColumn = this._getMetaColumnAtColumnX(x);

          this.getPaneScroller(metaColumn).stopEditing();
        }
      },

      /**
       * Stops editing without writing the editor's value to the model.
       */
      cancelEditing: function cancelEditing() {
        if (this.__focusedCol != null) {
          var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);

          var metaColumn = this._getMetaColumnAtColumnX(x);

          this.getPaneScroller(metaColumn).cancelEditing();
        }
      },

      /**
       * Update the table content of every attached table pane.
       */
      updateContent: function updateContent() {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].getTablePane().updateContent(true);
        }
      },

      /**
       * Activates the blocker widgets on all column headers and the
       * column button
       */
      blockHeaderElements: function blockHeaderElements() {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].getHeader().getBlocker().blockContent(20);
        }

        this.getChildControl("column-button").getBlocker().blockContent(20);
      },

      /**
       * Deactivates the blocker widgets on all column headers and the
       * column button
       */
      unblockHeaderElements: function unblockHeaderElements() {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          scrollerArr[i].getHeader().getBlocker().unblock();
        }

        this.getChildControl("column-button").getBlocker().unblock();
      },

      /**
       * Gets the meta column at a certain x position in the page. If there is no
       * meta column at this position, -1 is returned.
       *
       * @param pageX {Integer} the position in the page to check (in pixels).
       * @return {Integer} the index of the meta column or -1.
       */
      _getMetaColumnAtPageX: function _getMetaColumnAtPageX(pageX) {
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          var pos = scrollerArr[i].getContentLocation();

          if (pageX >= pos.left && pageX <= pos.right) {
            return i;
          }
        }

        return -1;
      },

      /**
       * Returns the meta column a column is shown in. If the column is not shown at
       * all, -1 is returned.
       *
       * @param visXPos {Integer} the visible x position of the column.
       * @return {Integer} the meta column the column is shown in.
       */
      _getMetaColumnAtColumnX: function _getMetaColumnAtColumnX(visXPos) {
        var metaColumnCounts = this.getMetaColumnCounts();
        var rightXPos = 0;

        for (var i = 0; i < metaColumnCounts.length; i++) {
          var counts = metaColumnCounts[i];
          rightXPos += counts;

          if (counts == -1 || visXPos < rightXPos) {
            return i;
          }
        }

        return -1;
      },

      /**
       * Updates the text shown in the status bar.
       */
      _updateStatusBar: function _updateStatusBar() {
        var tableModel = this.getTableModel();

        if (this.getStatusBarVisible()) {
          var selectedRowCount = this.getSelectionModel().getSelectedCount();
          var rowCount = tableModel.getRowCount();
          var text;

          if (rowCount >= 0) {
            if (selectedRowCount == 0) {
              text = this.trn("one row", "%1 rows", rowCount, rowCount);
            } else {
              text = this.trn("one of one row", "%1 of %2 rows", rowCount, selectedRowCount, rowCount);
            }
          }

          if (this.__additionalStatusBarText) {
            if (text) {
              text += this.__additionalStatusBarText;
            } else {
              text = this.__additionalStatusBarText;
            }
          }

          if (text) {
            this.getChildControl("statusbar").setValue(text);
          }
        }
      },

      /**
       * Updates the widths of all scrollers.
       */
      _updateScrollerWidths: function _updateScrollerWidths() {
        // Give all scrollers except for the last one the wanted width
        // (The last one has a flex with)
        var scrollerArr = this._getPaneScrollerArr();

        for (var i = 0; i < scrollerArr.length; i++) {
          var isLast = i == scrollerArr.length - 1;
          var width = scrollerArr[i].getTablePaneModel().getTotalWidth();
          scrollerArr[i].setPaneWidth(width);
          var flex = isLast ? 1 : 0;
          scrollerArr[i].setLayoutProperties({
            flex: flex
          });
        }
      },

      /**
       * Updates the visibility of the scrollbars in the meta columns.
       */
      _updateScrollBarVisibility: function _updateScrollBarVisibility() {
        if (!this.getBounds()) {
          return;
        }

        var horBar = qx.ui.table.pane.Scroller.HORIZONTAL_SCROLLBAR;
        var verBar = qx.ui.table.pane.Scroller.VERTICAL_SCROLLBAR;

        var scrollerArr = this._getPaneScrollerArr(); // Check which scroll bars are needed


        var horNeeded = false;
        var verNeeded = false;
        var excludeScrollerScrollbarsIfNotNeeded; // Determine whether we need to render horizontal scrollbars for meta
        // columns that don't themselves actually require it

        excludeScrollerScrollbarsIfNotNeeded = this.getExcludeScrollerScrollbarsIfNotNeeded();

        if (!excludeScrollerScrollbarsIfNotNeeded) {
          for (var i = 0; i < scrollerArr.length; i++) {
            var isLast = i == scrollerArr.length - 1; // Only show the last vertical scrollbar

            var bars = scrollerArr[i].getNeededScrollBars(horNeeded, !isLast);

            if (bars & horBar) {
              horNeeded = true;
            }

            if (isLast && bars & verBar) {
              verNeeded = true;
            }
          }
        } // Set the needed scrollbars


        for (var i = 0; i < scrollerArr.length; i++) {
          isLast = i == scrollerArr.length - 1; // If we don't want to include scrollbars for meta columns that don't
          // require it, find out whether this meta column requires it.

          if (excludeScrollerScrollbarsIfNotNeeded) {
            horNeeded = !!(scrollerArr[i].getNeededScrollBars(false, !isLast) & horBar); // Show the horizontal scrollbar if needed. Specify null to indicate
            // that the scrollbar should be hidden rather than excluded.

            scrollerArr[i].setHorizontalScrollBarVisible(horNeeded || null);
          } else {
            // Show the horizontal scrollbar if needed.
            scrollerArr[i].setHorizontalScrollBarVisible(horNeeded);
          } // If this is the last meta-column...


          if (isLast) {
            // ... then get the current (old) use of vertical scroll bar
            verNeeded = !!(scrollerArr[i].getNeededScrollBars(false, false) & verBar);

            if (this.__hadVerticalScrollBar == null) {
              this.__hadVerticalScrollBar = scrollerArr[i].getVerticalScrollBarVisible();
              this.__timer = qx.event.Timer.once(function () {
                // reset the last visible state of the vertical scroll bar
                // in a timeout to prevent infinite loops.
                this.__hadVerticalScrollBar = null;
                this.__timer = null;
              }, this, 0);
            }
          }

          scrollerArr[i].setVerticalScrollBarVisible(isLast && verNeeded); // If this is the last meta-column and the use of a vertical scroll bar
          // has changed...

          if (isLast && verNeeded != this.__hadVerticalScrollBar) {
            // ... then dispatch an event to any awaiting listeners
            this.fireDataEvent("verticalScrollBarChanged", verNeeded);
          }
        }
      },

      /**
       * Initialize the column menu
       */
      _initColumnMenu: function _initColumnMenu() {
        var tableModel = this.getTableModel();
        var columnModel = this.getTableColumnModel();
        var columnButton = this.getChildControl("column-button"); // Remove all items from the menu. We'll rebuild it here.

        columnButton.empty(); // Inform listeners who may want to insert menu items at the beginning

        var menu = columnButton.getMenu();
        var data = {
          table: this,
          menu: menu,
          columnButton: columnButton
        };
        this.fireDataEvent("columnVisibilityMenuCreateStart", data);
        this.__columnMenuButtons = {};

        for (var col = 0, l = tableModel.getColumnCount(); col < l; col++) {
          var menuButton = columnButton.factory("menu-button", {
            text: tableModel.getColumnName(col),
            column: col,
            bVisible: columnModel.isColumnVisible(col)
          });
          qx.core.Assert.assertInterface(menuButton, qx.ui.table.IColumnMenuItem);
          menuButton.addListener("changeColumnVisible", this._createColumnVisibilityCheckBoxHandler(col), this);
          this.__columnMenuButtons[col] = menuButton;
        } // Inform listeners who may want to insert menu items at the end


        data = {
          table: this,
          menu: menu,
          columnButton: columnButton
        };
        this.fireDataEvent("columnVisibilityMenuCreateEnd", data);
      },

      /**
       * Creates a handler for a check box of the column visibility menu.
       *
       * @param col {Integer} the model index of column to create the handler for.
       * @return {Function} The created event handler.
       */
      _createColumnVisibilityCheckBoxHandler: function _createColumnVisibilityCheckBoxHandler(col) {
        return function (evt) {
          var columnModel = this.getTableColumnModel();
          columnModel.setColumnVisible(col, evt.getData());
        };
      },

      /**
       * Sets the width of a column.
       *
       * @param col {Integer} the model index of column.
       * @param width {Integer} the new width in pixels.
       */
      setColumnWidth: function setColumnWidth(col, width) {
        this.getTableColumnModel().setColumnWidth(col, width);
      },

      /**
       * Resize event handler
       */
      _onResize: function _onResize() {
        this.fireEvent("tableWidthChanged");

        this._updateScrollerWidths();

        this._updateScrollBarVisibility();
      },
      // overridden
      addListener: function addListener(type, listener, self, capture) {
        if (qx.ui.table.Table.__redirectEvents[type]) {
          // start the id with the type (needed for removing)
          var id = [type];

          for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++) {
            id.push(arr[i].addListener.apply(arr[i], arguments));
          } // join the id's of every event with "


          return id.join('"');
        } else {
          return qx.ui.table.Table.prototype.addListener.base.call(this, type, listener, self, capture);
        }
      },
      // overridden
      removeListener: function removeListener(type, listener, self, capture) {
        if (qx.ui.table.Table.__redirectEvents[type]) {
          for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++) {
            arr[i].removeListener.apply(arr[i], arguments);
          }
        } else {
          qx.ui.table.Table.prototype.removeListener.base.call(this, type, listener, self, capture);
        }
      },
      // overridden
      removeListenerById: function removeListenerById(id) {
        var ids = id.split('"'); // type is the first entry of the connected id

        var type = ids.shift();

        if (qx.ui.table.Table.__redirectEvents[type]) {
          var removed = true;

          for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++) {
            removed = arr[i].removeListenerById.call(arr[i], ids[i]) && removed;
          }

          return removed;
        } else {
          return qx.ui.table.Table.prototype.removeListenerById.base.call(this, id);
        }
      },
      destroy: function destroy() {
        this.getChildControl("column-button").getMenu().destroy();
        qx.ui.table.Table.prototype.destroy.base.call(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // remove the event listener which handled the locale change
      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      } // we allocated these objects on init so we have to clean them up.

      var selectionModel = this.getSelectionModel();

      if (selectionModel) {
        selectionModel.dispose();
      }

      var dataRowRenderer = this.getDataRowRenderer();

      if (dataRowRenderer) {
        dataRowRenderer.dispose();
      }

      this._cleanUpMetaColumns(0);

      this.getTableColumnModel().dispose();

      this._disposeObjects("__selectionManager", "__scrollerParent", "__emptyTableModel", "__emptyTableModel", "__columnModel", "__timer");

      this._disposeMap("__columnMenuButtons");
    }
  });
  qx.ui.table.Table.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.format.IFormat": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Type": {
        "construct": true
      },
      "qx.locale.Manager": {
        "construct": true
      },
      "qx.locale.Number": {},
      "qx.lang.String": {}
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
   * A formatter and parser for numbers.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.util.format.NumberFormat", {
    extend: qx.core.Object,
    implement: [qx.util.format.IFormat, qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param locale {String} optional locale to be used
     * @throws {Error} If the argument is not a string.
     */
    construct: function construct(locale) {
      qx.core.Object.constructor.call(this);

      if (arguments.length > 0) {
        if (arguments.length === 1) {
          if (qx.lang.Type.isString(locale)) {
            this.setLocale(locale);
          } else {
            throw new Error("Wrong argument type. String is expected.");
          }
        } else {
          throw new Error("Wrong number of arguments.");
        }
      }

      if (!locale) {
        this.setLocale(qx.locale.Manager.getInstance().getLocale());
        {
          qx.locale.Manager.getInstance().bind("locale", this, "locale");
        }
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The minimum number of integer digits (digits before the decimal separator).
       * Missing digits will be filled up with 0 ("19" -> "0019").
       */
      minimumIntegerDigits: {
        check: "Number",
        init: 0
      },

      /**
       * The maximum number of integer digits (superfluous digits will be cut off
       * ("1923" -> "23").
       */
      maximumIntegerDigits: {
        check: "Number",
        nullable: true
      },

      /**
       * The minimum number of fraction digits (digits after the decimal separator).
       * Missing digits will be filled up with 0 ("1.5" -> "1.500")
       */
      minimumFractionDigits: {
        check: "Number",
        init: 0
      },

      /**
       * The maximum number of fraction digits (digits after the decimal separator).
       * Superfluous digits will cause rounding ("1.8277" -> "1.83")
       */
      maximumFractionDigits: {
        check: "Number",
        nullable: true
      },

      /** Whether thousand groupings should be used {e.g. "1,432,234.65"}. */
      groupingUsed: {
        check: "Boolean",
        init: true
      },

      /** The prefix to put before the number {"EUR " -> "EUR 12.31"}. */
      prefix: {
        check: "String",
        init: "",
        event: "changeNumberFormat"
      },

      /** Sets the postfix to put after the number {" %" -> "56.13 %"}. */
      postfix: {
        check: "String",
        init: "",
        event: "changeNumberFormat"
      },

      /** Locale used */
      locale: {
        check: "String",
        init: null,
        event: "changeLocale"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Formats a number.
       *
       * @param num {Number} the number to format.
       * @return {String} the formatted number as a string.
       */
      format: function format(num) {
        // handle special cases
        if (isNaN(num)) {
          return "NaN";
        }

        switch (num) {
          case Infinity:
            return "Infinity";

          case -Infinity:
            return "-Infinity";
        }

        var negative = num < 0;

        if (negative) {
          num = -num;
        }

        if (this.getMaximumFractionDigits() != null) {
          // Do the rounding
          var mover = Math.pow(10, this.getMaximumFractionDigits());
          num = Math.round(num * mover) / mover;
        }

        var integerDigits = String(Math.floor(num)).length;
        var numStr = "" + num; // Prepare the integer part

        var integerStr = numStr.substring(0, integerDigits);

        while (integerStr.length < this.getMinimumIntegerDigits()) {
          integerStr = "0" + integerStr;
        }

        if (this.getMaximumIntegerDigits() != null && integerStr.length > this.getMaximumIntegerDigits()) {
          // NOTE: We cut off even though we did rounding before, because there
          //     may be rounding errors ("12.24000000000001" -> "12.24")
          integerStr = integerStr.substring(integerStr.length - this.getMaximumIntegerDigits());
        } // Prepare the fraction part


        var fractionStr = numStr.substring(integerDigits + 1);

        while (fractionStr.length < this.getMinimumFractionDigits()) {
          fractionStr += "0";
        }

        if (this.getMaximumFractionDigits() != null && fractionStr.length > this.getMaximumFractionDigits()) {
          // We have already rounded -> Just cut off the rest
          fractionStr = fractionStr.substring(0, this.getMaximumFractionDigits());
        } // Add the thousand groupings


        if (this.getGroupingUsed()) {
          var origIntegerStr = integerStr;
          integerStr = "";
          var groupPos;

          for (groupPos = origIntegerStr.length; groupPos > 3; groupPos -= 3) {
            integerStr = "" + qx.locale.Number.getGroupSeparator(this.getLocale()) + origIntegerStr.substring(groupPos - 3, groupPos) + integerStr;
          }

          integerStr = origIntegerStr.substring(0, groupPos) + integerStr;
        } // Workaround: prefix and postfix are null even their defaultValue is "" and
        //             allowNull is set to false?!?


        var prefix = this.getPrefix() ? this.getPrefix() : "";
        var postfix = this.getPostfix() ? this.getPostfix() : ""; // Assemble the number

        var str = prefix + (negative ? "-" : "") + integerStr;

        if (fractionStr.length > 0) {
          str += "" + qx.locale.Number.getDecimalSeparator(this.getLocale()) + fractionStr;
        }

        str += postfix;
        return str;
      },

      /**
       * Parses a number.
       *
       * @param str {String} the string to parse.
       * @return {Double} the number.
       * @throws {Error} If the number string does not match the number format.
       */
      parse: function parse(str) {
        // use the escaped separators for regexp
        var groupSepEsc = qx.lang.String.escapeRegexpChars(qx.locale.Number.getGroupSeparator(this.getLocale()) + "");
        var decimalSepEsc = qx.lang.String.escapeRegexpChars(qx.locale.Number.getDecimalSeparator(this.getLocale()) + "");
        var regex = new RegExp("^(" + qx.lang.String.escapeRegexpChars(this.getPrefix()) + ')?([-+]){0,1}' + '([0-9]{1,3}(?:' + groupSepEsc + '{0,1}[0-9]{3}){0,}){0,1}' + '(' + decimalSepEsc + '\\d+){0,1}(' + qx.lang.String.escapeRegexpChars(this.getPostfix()) + ")?$");
        var hit = regex.exec(str);

        if (hit == null) {
          throw new Error("Number string '" + str + "' does not match the number format");
        } // hit[1] = potential prefix


        var negative = hit[2] == "-";
        var integerStr = hit[3] || "0";
        var fractionStr = hit[4]; // hit[5] = potential postfix
        // Remove the thousand groupings

        integerStr = integerStr.replace(new RegExp(groupSepEsc, "g"), "");
        var asStr = (negative ? "-" : "") + integerStr;

        if (fractionStr != null && fractionStr.length != 0) {
          // Remove the leading decimal separator from the fractions string
          fractionStr = fractionStr.replace(new RegExp(decimalSepEsc), "");
          asStr += "." + fractionStr;
        }

        return parseFloat(asStr);
      }
    },
    destruct: function destruct() {
      {
        qx.locale.Manager.getInstance().removeRelatedBindings(this);
      }
    }
  });
  qx.util.format.NumberFormat.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.util.format.NumberFormat": {
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.cellrenderer.Default": {
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
       2007 by Tartan Solutions, Inc, http://www.tartansolutions.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Dan Hummon
  
  ************************************************************************ */

  /**
   * The conditional cell renderer allows special per cell formatting based on
   * conditions on the cell's value.
   *
   * @require(qx.util.format.NumberFormat)
   */
  qx.Class.define("qx.ui.table.cellrenderer.Conditional", {
    extend: qx.ui.table.cellrenderer.Default,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param align {String|null}
     *   The default text alignment to format the cell with by default.
     *
     * @param color {String|null}
     *   The default font color to format the cell with by default.
     *
     * @param style {String|null}
     *   The default font style to format the cell with by default.
     *
     * @param weight {String|null}
     *   The default font weight to format the cell with by default.
     */
    construct: function construct(align, color, style, weight) {
      qx.ui.table.cellrenderer.Default.constructor.call(this);
      this.numericAllowed = ["==", "!=", ">", "<", ">=", "<="];
      this.betweenAllowed = ["between", "!between"];
      this.conditions = [];
      this.__defaultTextAlign = align || "";
      this.__defaultColor = color || "";
      this.__defaultFontStyle = style || "";
      this.__defaultFontWeight = weight || "";
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __defaultTextAlign: null,
      __defaultColor: null,
      __defaultFontStyle: null,
      __defaultFontWeight: null,

      /**
       * Applies the cell styles to the style map.
       * @param condition {Array} The matched condition
       * @param style {Map} map of already applied styles.
       */
      __applyFormatting: function __applyFormatting(condition, style) {
        if (condition[1] != null) {
          style["text-align"] = condition[1];
        }

        if (condition[2] != null) {
          style["color"] = condition[2];
        }

        if (condition[3] != null) {
          style["font-style"] = condition[3];
        }

        if (condition[4] != null) {
          style["font-weight"] = condition[4];
        }
      },

      /**
       * The addNumericCondition method is used to add a basic numeric condition to
       * the cell renderer.
       *
       * Note: Passing null is different from passing an empty string in the align,
       * color, style and weight arguments. Null will allow pre-existing formatting
       * to pass through, where an empty string will clear it back to the default
       * formatting set in the constructor.
       *
       *
       * @param condition {String} The type of condition. Accepted strings are "==", "!=", ">", "<", ">=",
       *     and "<=".
       * @param value1 {Integer} The value to compare against.
       * @param align {String|null} The text alignment to format the cell with if the condition matches.
       * @param color {String|null} The font color to format the cell with if the condition matches.
       * @param style {String|null} The font style to format the cell with if the condition matches.
       * @param weight {String|null} The font weight to format the cell with if the condition matches.
       * @param target {String|null} The text value of the column to compare against. If this is null,
       *     comparisons will be against the contents of this cell.
       * @throws {Error} If the condition can not be recognized or value is null.
       */
      addNumericCondition: function addNumericCondition(condition, value1, align, color, style, weight, target) {
        var temp = null;

        if (this.numericAllowed.includes(condition)) {
          if (value1 != null) {
            temp = [condition, align, color, style, weight, value1, target];
          }
        }

        if (temp != null) {
          this.conditions.push(temp);
        } else {
          throw new Error("Condition not recognized or value is null!");
        }
      },

      /**
       * The addBetweenCondition method is used to add a between condition to the
       * cell renderer.
       *
       * Note: Passing null is different from passing an empty string in the align,
       * color, style and weight arguments. Null will allow pre-existing formatting
       * to pass through, where an empty string will clear it back to the default
       * formatting set in the constructor.
       *
       *
       * @param condition {String} The type of condition. Accepted strings are "between" and "!between".
       * @param value1 {Integer} The first value to compare against.
       * @param value2 {Integer} The second value to compare against.
       * @param align {String|null} The text alignment to format the cell with if the condition matches.
       * @param color {String|null} The font color to format the cell with if the condition matches.
       * @param style {String|null} The font style to format the cell with if the condition matches.
       * @param weight {String|null} The font weight to format the cell with if the condition matches.
       * @param target {String|null} The text value of the column to compare against. If this is null,
       *     comparisons will be against the contents of this cell.
       * @throws {Error} If the condition can not be recognized or value is null.
       */
      addBetweenCondition: function addBetweenCondition(condition, value1, value2, align, color, style, weight, target) {
        if (this.betweenAllowed.includes(condition)) {
          if (value1 != null && value2 != null) {
            var temp = [condition, align, color, style, weight, value1, value2, target];
          }
        }

        if (temp != null) {
          this.conditions.push(temp);
        } else {
          throw new Error("Condition not recognized or value1/value2 is null!");
        }
      },

      /**
       * The addRegex method is used to add a regular expression condition to the
       * cell renderer.
       *
       * Note: Passing null is different from passing an empty string in the align,
       * color, style and weight arguments. Null will allow pre-existing formatting
       * to pass through, where an empty string will clear it back to the default
       * formatting set in the constructor.
       *
       *
       * @param regex {String} The regular expression to match against.
       * @param align {String|null} The text alignment to format the cell with if the condition matches.
       * @param color {String|null} The font color to format the cell with if the condition matches.
       * @param style {String|null} The font style to format the cell with if the condition matches.
       * @param weight {String|null} The font weight to format the cell with if the condition matches.
       * @param target {String|null} The text value of the column to compare against. If this is null,
       *     comparisons will be against the contents of this cell.
       * @throws {Error} If the regex is null.
       */
      addRegex: function addRegex(regex, align, color, style, weight, target) {
        if (regex != null) {
          var temp = ["regex", align, color, style, weight, regex, target];
        }

        if (temp != null) {
          this.conditions.push(temp);
        } else {
          throw new Error("regex cannot be null!");
        }
      },

      /**
       * Overridden; called whenever the cell updates. The cell will iterate through
       * each available condition and apply formatting for those that
       * match. Multiple conditions can match, but later conditions will override
       * earlier ones. Conditions with null values will stack with other conditions
       * that apply to that value.
       *
       * @param cellInfo {Map} The information about the cell.
       *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
       * @return {Map}
       */
      _getCellStyle: function _getCellStyle(cellInfo) {
        var tableModel = cellInfo.table.getTableModel();
        var i;
        var cond_test;
        var compareValue;
        var style = {
          "text-align": this.__defaultTextAlign,
          "color": this.__defaultColor,
          "font-style": this.__defaultFontStyle,
          "font-weight": this.__defaultFontWeight
        };

        for (i in this.conditions) {
          cond_test = false;

          if (this.numericAllowed.includes(this.conditions[i][0])) {
            if (this.conditions[i][6] == null) {
              compareValue = cellInfo.value;
            } else {
              compareValue = tableModel.getValueById(this.conditions[i][6], cellInfo.row);
            }

            switch (this.conditions[i][0]) {
              case "==":
                if (compareValue == this.conditions[i][5]) {
                  cond_test = true;
                }

                break;

              case "!=":
                if (compareValue != this.conditions[i][5]) {
                  cond_test = true;
                }

                break;

              case ">":
                if (compareValue > this.conditions[i][5]) {
                  cond_test = true;
                }

                break;

              case "<":
                if (compareValue < this.conditions[i][5]) {
                  cond_test = true;
                }

                break;

              case ">=":
                if (compareValue >= this.conditions[i][5]) {
                  cond_test = true;
                }

                break;

              case "<=":
                if (compareValue <= this.conditions[i][5]) {
                  cond_test = true;
                }

                break;
            }
          } else if (this.betweenAllowed.includes(this.conditions[i][0])) {
            if (this.conditions[i][7] == null) {
              compareValue = cellInfo.value;
            } else {
              compareValue = tableModel.getValueById(this.conditions[i][7], cellInfo.row);
            }

            switch (this.conditions[i][0]) {
              case "between":
                if (compareValue >= this.conditions[i][5] && compareValue <= this.conditions[i][6]) {
                  cond_test = true;
                }

                break;

              case "!between":
                if (compareValue < this.conditions[i][5] || compareValue > this.conditions[i][6]) {
                  cond_test = true;
                }

                break;
            }
          } else if (this.conditions[i][0] == "regex") {
            if (this.conditions[i][6] == null) {
              compareValue = cellInfo.value;
            } else {
              compareValue = tableModel.getValueById(this.conditions[i][6], cellInfo.row);
            }

            var the_pattern = new RegExp(this.conditions[i][5], 'g');
            cond_test = the_pattern.test(compareValue);
          } // Apply formatting, if any.


          if (cond_test == true) {
            this.__applyFormatting(this.conditions[i], style);
          }
        }

        var styleString = [];

        for (var key in style) {
          if (style[key]) {
            styleString.push(key, ":", style[key], ";");
          }
        }

        return styleString.join("");
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.numericAllowed = this.betweenAllowed = this.conditions = null;
    }
  });
  qx.ui.table.cellrenderer.Conditional.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.table.cellrenderer.Conditional": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007 OpenHex SPRL, http://www.openhex.org
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Dirk Wellmann (dw(at)piponline.net)
  
  ************************************************************************ */

  /**
   * This Cellrender is for transparent use, without escaping! Use this Cellrender
   * to output plain HTML content.
   */
  qx.Class.define("qx.ui.table.cellrenderer.Html", {
    extend: qx.ui.table.cellrenderer.Conditional,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _getContentHtml: function _getContentHtml(cellInfo) {
        return cellInfo.value || "";
      },
      // overridden
      _getCellClass: function _getCellClass(cellInfo) {
        return "qooxdoo-table-cell";
      }
    }
  });
  qx.ui.table.cellrenderer.Html.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-49.js.map
