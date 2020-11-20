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
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.basic.Label": {},
      "qx.bom.Font": {},
      "qxapp.theme.Font": {},
      "qx.ui.form.Button": {},
      "qxapp.file.FilesTree": {},
      "qx.ui.toolbar.ToolBar": {},
      "qx.ui.toolbar.Part": {},
      "qxapp.file.FilesAdd": {},
      "qxapp.file.FileLabelWithActions": {},
      "qxapp.component.widget.PlotlyWidget": {},
      "qxapp.utils.Utils": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qxapp - the simcore frontend
  
     https://osparc.io
  
     Copyright:
       2019 IT'IS Foundation, https://itis.swiss
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * Widget that provides access to the data belonging to the active user.
   * - On the left side: myData FilesTree with the FileLabelWithActions
   * - On the right side: a pie chart reflecting the data resources consumed (hidden until there is real info)
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let dataManager = new qxapp.desktop.DataBrowser();
   *   this.getRoot().add(dataManager);
   * </pre>
   */

  /* global document */
  qx.Class.define("qxapp.desktop.DataBrowser", {
    extend: qx.ui.core.Widget,
    construct: function construct() {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);
      var prjBrowserLayout = new qx.ui.layout.VBox(10);

      this._setLayout(prjBrowserLayout);

      this.__createDataManagerLayout();

      this.addListener("appear", function () {
        _this.__initResources(null);
      }, this);
    },
    members: {
      __filesTree: null,
      __selectedFileLayout: null,
      __pieChart: null,
      __initResources: function __initResources(locationId) {
        this.__filesTree.populateTree(null, locationId);
      },
      __resetCache: function __resetCache() {
        this.__filesTree.resetCache();
      },
      __createDataManagerLayout: function __createDataManagerLayout() {
        var dataManagerMainLayout = this.__createVBoxWLabel(this.tr("Data Manager"));

        var dataManagerLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
        dataManagerMainLayout.add(dataManagerLayout, {
          flex: 1
        });

        var treeLayout = this.__createTreeLayout();

        dataManagerLayout.add(treeLayout, {
          flex: 1
        });
        var showPieChart = false;

        if (showPieChart) {
          var chartLayout = this.__createChartLayout();

          dataManagerLayout.add(chartLayout);
        }

        this._add(dataManagerMainLayout, {
          flex: 1
        });
      },
      __createVBoxWLabel: function __createVBoxWLabel(text) {
        var vBoxLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)).set({
          marginTop: 20
        });
        var label = new qx.ui.basic.Label(text).set({
          font: qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["nav-bar-label"]),
          minWidth: 150
        });
        vBoxLayout.add(label);
        return vBoxLayout;
      },
      __createTreeLayout: function __createTreeLayout() {
        var _this2 = this;

        var treeLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); // button for refetching data

        var reloadBtn = new qx.ui.form.Button().set({
          label: this.tr("Reload"),
          icon: "@FontAwesome5Solid/sync-alt/16",
          allowGrowX: false
        });
        reloadBtn.addListener("execute", function () {
          this.__resetCache();

          this.__initResources(null);
        }, this);
        treeLayout.add(reloadBtn);
        var filesTree = this.__filesTree = new qxapp.file.FilesTree().set({
          dragMechnism: true,
          dropMechnism: true
        });
        filesTree.addListener("selectionChanged", function () {
          _this2.__selectionChanged();
        }, this);
        filesTree.addListener("fileCopied", function (e) {
          if (e) {
            _this2.__initResources(null);
          }
        }, this);
        treeLayout.add(filesTree, {
          flex: 1
        });

        var actionsToolbar = this.__createActionsToolbar();

        treeLayout.add(actionsToolbar);
        return treeLayout;
      },
      __createActionsToolbar: function __createActionsToolbar() {
        var _this3 = this;

        var actionsToolbar = new qx.ui.toolbar.ToolBar();
        var fileActions = new qx.ui.toolbar.Part();
        var addFile = new qx.ui.toolbar.Part();
        actionsToolbar.add(fileActions);
        actionsToolbar.addSpacer();
        actionsToolbar.add(addFile);
        var addBtn = new qxapp.file.FilesAdd();
        addBtn.addListener("fileAdded", function (e) {
          var fileMetadata = e.getData();

          _this3.__initResources(fileMetadata["locationId"]);
        }, this);
        addFile.add(addBtn);
        var selectedFileLayout = this.__selectedFileLayout = new qxapp.file.FileLabelWithActions();
        selectedFileLayout.addListener("fileDeleted", function (e) {
          var fileMetadata = e.getData();

          _this3.__initResources(fileMetadata["locationId"]);
        }, this);
        fileActions.add(selectedFileLayout);
        return actionsToolbar;
      },
      __createChartLayout: function __createChartLayout() {
        var _this4 = this;

        var chartLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        var label = new qx.ui.basic.Label(this.tr("Data Resources")).set({
          font: qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["nav-bar-label"]),
          minWidth: 500
        });
        chartLayout.add(label);
        var plotlyDivId = "DataResources";
        var plotly = new qxapp.component.widget.PlotlyWidget(plotlyDivId);
        plotly.addListener("plotlyWidgetReady", function (e) {
          if (e.getData()) {
            _this4.__pieChart = plotly;
            var myPlot = document.getElementById(plotlyDivId);
            myPlot.on("plotly_click", function (data) {
              _this4.__reloadChartData(data["points"][0]["id"][0]);
            }, _this4);

            _this4.__reloadChartData();
          }
        }, this);
        chartLayout.add(plotly, {
          flex: 1
        });
        return chartLayout;
      },
      __selectionChanged: function __selectionChanged() {
        this.__filesTree.resetSelection();

        var selectionData = this.__filesTree.getSelectedFile();

        if (selectionData) {
          this.__selectedFileLayout.itemSelected(selectionData["selectedItem"], selectionData["isFile"]);
        }
      },
      __reloadChartData: function __reloadChartData(pathId) {
        if (this.__pieChart) {
          var dataInfo = this.__getDataInfo(pathId);

          var ids = dataInfo["ids"];
          var labels = dataInfo["labels"];
          var values = dataInfo["values"];
          var tooltips = dataInfo["tooltips"];
          var title = dataInfo["title"];

          this.__pieChart.setData(ids, labels, values, tooltips, title);
        }
      },
      __getDataInfo: function __getDataInfo(pathId) {
        var context = pathId || "/";

        var children = this.__filesTree.getModel().getChildren();

        var data = {
          "ids": [],
          "labels": [],
          "values": [],
          "tooltips": [],
          "title": context
        };

        if (pathId === undefined) {
          data["ids"].push("FreeSpaceId");
          data["labels"].push("Free space");
          var value = Math.floor(Math.random() * 1000000) + 1;
          data["values"].push(value);
          data["tooltips"].push(qxapp.utils.Utils.bytesToSize(value));
        }

        for (var i = 0; i < children.length; i++) {
          var child = children.toArray()[i];
          data["ids"].push(child.getLabel());
          data["labels"].push(child.getLabel());
          var value2 = Math.floor(Math.random() * 1000000) + 1;
          data["values"].push(value2);
          data["tooltips"].push(qxapp.utils.Utils.bytesToSize(value2));
        }

        return data;
      }
    }
  });
  qxapp.desktop.DataBrowser.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=DataBrowser.js.map?dt=1568886162627