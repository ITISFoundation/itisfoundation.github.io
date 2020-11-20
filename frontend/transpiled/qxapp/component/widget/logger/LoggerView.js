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
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qxapp.theme.Color": {},
      "qxapp.utils.Utils": {},
      "qx.ui.toolbar.ToolBar": {},
      "qx.ui.form.ToggleButton": {},
      "qx.ui.toolbar.Separator": {},
      "qx.ui.form.TextField": {},
      "qx.ui.toolbar.Part": {},
      "qx.ui.form.RadioGroup": {},
      "qxapp.data.Permissions": {},
      "qxapp.component.widget.logger.RemoteTableModel": {},
      "qx.ui.table.columnmodel.Resize": {},
      "qx.ui.table.Table": {},
      "qx.ui.table.cellrenderer.Html": {},
      "qxapp.ui.table.cellrenderer.Html": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qxapp - the simcore frontend
  
     https://osparc.io
  
     Copyright:
       2018 IT'IS Foundation, https://itis.swiss
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * Widget that shows a logging view.
   *
   * It consists of:
   * - a toolbar containing:
   *   - clear button
   *   - filter as you type textfiled
   *   - some log type filtering buttons
   * - log messages table
   *
   * Log messages have two inputs: "Origin" and "Message".
   *
   *   Depending on the log level, "Origin"'s color will change, also "Message"s coming from the same
   * origin will be rendered with the same color.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let loggerView = new qxapp.component.widget.logger.LoggerView(workbench);
   *   this.getRoot().add(loggerView);
   *   loggerView.info(null, "Hello world");
   * </pre>
   */
  var LOG_LEVEL = [{
    debug: -1
  }, {
    info: 0
  }, {
    warning: 1
  }, {
    error: 2
  }];
  Object.freeze(LOG_LEVEL);
  qx.Class.define("qxapp.component.widget.logger.LoggerView", {
    extend: qx.ui.core.Widget,
    construct: function construct(workbench) {
      qx.ui.core.Widget.constructor.call(this);
      this.set({
        workbench: workbench
      });

      this._setLayout(new qx.ui.layout.VBox());

      var filterToolbar = this.__createFilterToolbar();

      this._add(filterToolbar);

      var table = this.__createTableLayout();

      this._add(table, {
        flex: 1
      });

      this.__messengerColors = new Set();

      this.__createInitMsg();

      this.__textFilterField.addListener("changeValue", this.__applyFilters, this);
    },
    events: {},
    properties: {
      logLevel: {
        apply: "__applyFilters",
        nullable: false,
        check: "Number",
        init: LOG_LEVEL[0].debug
      },
      caseSensitive: {
        nullable: false,
        check: "Boolean",
        init: false
      },
      workbench: {
        check: "qxapp.data.model.Workbench",
        nullable: false
      },
      currentNodeId: {
        check: "String",
        nullable: true,
        apply: "__currentNodeIdChanged"
      }
    },
    statics: {
      getLevelColorTag: function getLevelColorTag(logLevel) {
        for (var i = 0; i < LOG_LEVEL.length; i++) {
          var logString = Object.keys(LOG_LEVEL[i])[0];
          var logNumber = LOG_LEVEL[i][logString];

          if (logNumber === logLevel) {
            var logColor = qxapp.theme.Color.colors["logger-" + logString + "-message"];
            return logColor;
          }
        }

        var logColorDef = qxapp.theme.Color.colors["logger-info-message"];
        return logColorDef;
      },
      getNewColor: function getNewColor() {
        var luminanceBG = qxapp.utils.Utils.getColorLuminance(qxapp.theme.Color.colors["table-row-background-selected"]);
        var luminanceText = null;
        var color = null;

        do {
          color = qxapp.utils.Utils.getRandomColor();
          luminanceText = qxapp.utils.Utils.getColorLuminance(color);
        } while (Math.abs(luminanceBG - luminanceText) < 0.4);

        return color;
      }
    },
    members: {
      __currentNodeButton: null,
      __textFilterField: null,
      __logModel: null,
      __logView: null,
      __messengerColors: null,
      __createFilterToolbar: function __createFilterToolbar() {
        var _this = this;

        var toolbar = new qx.ui.toolbar.ToolBar();
        var currentNodeButton = this.__currentNodeButton = new qx.ui.form.ToggleButton(this.tr("This node")).set({
          appearance: "toolbar-button"
        });
        currentNodeButton.addListener("changeValue", function (e) {
          // this.currectNodeClicked(currentNodeButton.getValue());
          _this.currectNodeClicked(e.getData());
        }, this);
        toolbar.add(currentNodeButton);
        toolbar.add(new qx.ui.toolbar.Separator());
        var textFilterField = this.__textFilterField = new qx.ui.form.TextField().set({
          appearance: "toolbar-textfield",
          liveUpdate: true,
          placeholder: this.tr("Filter")
        });
        toolbar.add(textFilterField, {
          flex: 1
        });
        var part = new qx.ui.toolbar.Part();
        var group = new qx.ui.form.RadioGroup();
        var logLevelSet = false;

        for (var i = 0; i < LOG_LEVEL.length; i++) {
          var level = Object.keys(LOG_LEVEL[i])[0];
          var logLevel = LOG_LEVEL[i][level];

          if (level === "debug" && !qxapp.data.Permissions.getInstance().canDo("study.logger.debug.read")) {
            continue;
          }

          var label = level.charAt(0).toUpperCase() + level.slice(1);
          var button = new qx.ui.form.ToggleButton(label).set({
            appearance: "toolbar-button"
          });
          button.logLevel = logLevel;
          group.add(button);
          part.add(button);

          if (!logLevelSet) {
            this.setLogLevel(logLevel);
            logLevelSet = true;
          }
        }

        group.addListener("changeValue", function (e) {
          _this.setLogLevel(e.getData().logLevel);
        }, this);
        toolbar.add(part);
        return toolbar;
      },
      __createTableLayout: function __createTableLayout() {
        var tableModel = this.__logModel = new qxapp.component.widget.logger.RemoteTableModel();
        var custom = {
          tableColumnModel: function tableColumnModel(obj) {
            return new qx.ui.table.columnmodel.Resize(obj);
          }
        }; // table

        var table = this.__logView = new qx.ui.table.Table(tableModel, custom).set({
          selectable: true,
          statusBarVisible: false,
          showCellFocusIndicator: false
        });
        var colModel = table.getTableColumnModel();
        colModel.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Html());
        colModel.setDataCellRenderer(1, new qxapp.ui.table.cellrenderer.Html().set({
          defaultCellStyle: "user-select: text"
        }));
        var resizeBehavior = colModel.getBehavior();
        resizeBehavior.setWidth(0, "15%");
        resizeBehavior.setWidth(1, "85%");

        this.__applyFilters();

        return table;
      },
      __currentNodeIdChanged: function __currentNodeIdChanged(newValue) {
        this.__currentNodeButton.setValue(false);
      },
      currectNodeClicked: function currectNodeClicked(checked) {
        var currentNodeId = this.getCurrentNodeId();

        if (checked && currentNodeId !== "root") {
          this.__nodeSelected(currentNodeId);
        } else {
          this.__nodeSelected();
        }
      },
      __nodeSelected: function __nodeSelected(nodeId) {
        var workbench = this.getWorkbench();
        var node = workbench.getNode(nodeId);

        if (node) {
          this.__textFilterField.setValue(node.getLabel());
        } else {
          this.__textFilterField.setValue("");
        }
      },
      debug: function debug(nodeId) {
        var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

        this.__addLogs(nodeId, [msg], LOG_LEVEL.debug);
      },
      info: function info(nodeId) {
        var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

        this.__addLogs(nodeId, [msg], LOG_LEVEL.info);
      },
      infos: function infos(nodeId) {
        var msgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [""];

        this.__addLogs(nodeId, msgs, LOG_LEVEL.info);
      },
      warn: function warn(nodeId) {
        var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

        this.__addLogs(nodeId, [msg], LOG_LEVEL.warning);
      },
      error: function error(nodeId) {
        var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

        this.__addLogs(nodeId, [msg], LOG_LEVEL.error);
      },
      __addLogs: function __addLogs(nodeId) {
        var _this2 = this;

        var msgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [""];
        var logLevel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var label = null;

        if (nodeId === "root") {
          label = "Workbench";
        } else {
          var workbench = this.getWorkbench();
          var node = workbench.getNode(nodeId);

          if (node) {
            label = node.getLabel();
            node.addListener("changeLabel", function (e) {
              var newLabel = e.getData();

              _this2.__logModel.nodeLabelChanged(nodeId, newLabel);

              _this2.__updateTable();
            }, this);
          } else {
            return;
          }
        }

        var nodeColor = this.__getNodesColor(nodeId);

        var msgColor = qxapp.component.widget.logger.LoggerView.getLevelColorTag(logLevel);
        var msgLogs = [];

        for (var i = 0; i < msgs.length; i++) {
          var msgLog = {
            nodeId: nodeId,
            label: label,
            msg: msgs[i],
            logLevel: logLevel,
            nodeColor: nodeColor,
            msgColor: msgColor
          };
          msgLogs.push(msgLog);
        }

        this.__logModel.addRows(msgLogs);

        this.__updateTable();
      },
      __updateTable: function __updateTable() {
        this.__logModel.reloadData();

        var nFilteredRows = this.__logModel.getFilteredRowCount();

        this.__logView.scrollCellVisible(0, nFilteredRows);
      },
      __getNodesColor: function __getNodesColor(nodeId) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.__messengerColors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            if (item[0] === nodeId) {
              return item[1];
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var color = qxapp.component.widget.logger.LoggerView.getNewColor();

        this.__messengerColors.add([nodeId, color]);

        return color;
      },
      __applyFilters: function __applyFilters() {
        if (this.__logModel === null) {
          return;
        }

        this.__logModel.setFilterString(this.__textFilterField.getValue());

        this.__logModel.setFilterLogLevel(this.getLogLevel());

        this.__logModel.reloadData();
      },
      __createInitMsg: function __createInitMsg() {
        var nodeId = null;
        var msg = "Logger initialized";
        this.debug(nodeId, msg);
      }
    }
  });
  qxapp.component.widget.logger.LoggerView.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=LoggerView.js.map?dt=1568886161704