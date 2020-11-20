(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.splitpane.Pane": {
        "construct": true,
        "require": true
      },
      "qxapp.utils.UuidToName": {
        "construct": true
      },
      "qxapp.io.rest.ResourceFactory": {
        "construct": true
      },
      "qxapp.desktop.MainPanel": {
        "construct": true
      },
      "qxapp.desktop.SidePanel": {
        "construct": true
      },
      "qx.ui.container.Scroll": {
        "construct": true
      },
      "qxapp.component.widget.NodesTree": {},
      "qxapp.desktop.PanelView": {},
      "qxapp.component.metadata.StudyInfo": {},
      "qxapp.component.widget.logger.LoggerView": {},
      "qxapp.component.workbench.WorkbenchUI": {},
      "qxapp.component.widget.NodeView": {},
      "qx.ui.window.Window": {},
      "qx.ui.layout.Grow": {},
      "qx.core.Init": {},
      "qxapp.component.widget.DashGrid": {},
      "qxapp.file.FilePicker": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.VBox": {},
      "qx.ui.form.Button": {},
      "qxapp.data.Permissions": {},
      "qxapp.wrapper.WebSocket": {},
      "qxapp.io.request.ApiRequest": {},
      "qx.util.Serializer": {},
      "qxapp.wrapper.JsonDiffPatch": {},
      "qx.event.Timer": {},
      "qx.event.message.Bus": {}
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

  /* eslint newline-per-chained-call: 0 */
  qx.Class.define("qxapp.desktop.StudyEditor", {
    extend: qx.ui.splitpane.Pane,
    construct: function construct(study) {
      qx.ui.splitpane.Pane.constructor.call(this, "horizontal");
      qxapp.utils.UuidToName.getInstance().setStudy(study);
      this.__studyResources = qxapp.io.rest.ResourceFactory.getInstance().createStudyResources();
      this.setStudy(study);
      var mainPanel = this.__mainPanel = new qxapp.desktop.MainPanel().set({
        minWidth: 1000
      });
      var sidePanel = this.__sidePanel = new qxapp.desktop.SidePanel().set({
        minWidth: 0,
        maxWidth: 800,
        width: 500
      });
      var scroll = this.__scrollContainer = new qx.ui.container.Scroll().set({
        minWidth: 0
      });
      scroll.add(sidePanel);
      this.add(mainPanel, 1); // flex 1

      this.add(scroll, 0); // flex 0

      this.initDefault();
      this.connectEvents();

      this.__startAutoSaveTimer();

      this.__attachEventHandlers();
    },
    properties: {
      study: {
        check: "qxapp.data.model.Study",
        nullable: false
      }
    },
    events: {
      "changeMainViewCaption": "qx.event.type.Data",
      "studySaved": "qx.event.type.Data"
    },
    members: {
      __studyResources: null,
      __pipelineId: null,
      __mainPanel: null,
      __sidePanel: null,
      __scrollContainer: null,
      __workbenchUI: null,
      __nodesTree: null,
      __extraView: null,
      __loggerView: null,
      __nodeView: null,
      __currentNodeId: null,
      __autoSaveTimer: null,

      /**
       * Destructor
       */
      destruct: function destruct() {
        this.__stopAutoSaveTimer();
      },
      initDefault: function initDefault() {
        var _this = this;

        var study = this.getStudy();
        var nodesTree = this.__nodesTree = new qxapp.component.widget.NodesTree(study.getName(), study.getWorkbench());
        nodesTree.addListener("addNode", function () {
          _this.__addNode();
        }, this);
        nodesTree.addListener("removeNode", function (e) {
          var nodeId = e.getData();

          _this.__removeNode(nodeId);
        }, this);

        this.__sidePanel.addOrReplaceAt(new qxapp.desktop.PanelView(this.tr("Service tree"), nodesTree), 0);

        var extraView = this.__extraView = new qxapp.component.metadata.StudyInfo(study);
        extraView.setMaxHeight(300);

        this.__sidePanel.addOrReplaceAt(new qxapp.desktop.PanelView(this.tr("Study information"), extraView), 1);

        var loggerView = this.__loggerView = new qxapp.component.widget.logger.LoggerView(study.getWorkbench());

        this.__sidePanel.addOrReplaceAt(new qxapp.desktop.PanelView(this.tr("Logger"), loggerView), 2);

        var workbenchUI = this.__workbenchUI = new qxapp.component.workbench.WorkbenchUI(study.getWorkbench());
        workbenchUI.addListener("removeNode", function (e) {
          var nodeId = e.getData();

          _this.__removeNode(nodeId);
        }, this);
        workbenchUI.addListener("removeEdge", function (e) {
          var edgeId = e.getData();

          var workbench = _this.getStudy().getWorkbench();

          var currentNode = workbench.getNode(_this.__currentNodeId);
          var edge = workbench.getEdge(edgeId);
          var removed = false;

          if (currentNode && currentNode.isContainer() && edge.getOutputNodeId() === currentNode.getNodeId()) {
            var inputNode = workbench.getNode(edge.getInputNodeId());
            inputNode.setIsOutputNode(false); // Remove also dependencies from outter nodes

            var cNodeId = inputNode.getNodeId();
            var allNodes = workbench.getNodes(true);

            for (var nodeId in allNodes) {
              var node = allNodes[nodeId];

              if (node.isInputNode(cNodeId) && !currentNode.isInnerNode(node.getNodeId())) {
                workbench.removeEdge(edgeId);
              }
            }

            removed = true;
          } else {
            removed = workbench.removeEdge(edgeId);
          }

          if (removed) {
            _this.__workbenchUI.clearEdge(edgeId);
          }
        }, this);
        this.showInMainView(workbenchUI, "root");
        var nodeView = this.__nodeView = new qxapp.component.widget.NodeView().set({
          minHeight: 200
        });
        nodeView.setWorkbench(study.getWorkbench());
      },
      connectEvents: function connectEvents() {
        var _this2 = this;

        this.__mainPanel.getControls().addListener("startPipeline", this.__startPipeline, this);

        this.__mainPanel.getControls().addListener("stopPipeline", this.__stopPipeline, this);

        var workbench = this.getStudy().getWorkbench();
        workbench.addListener("workbenchChanged", this.__workbenchChanged, this);
        workbench.addListener("retrieveInputs", function (e) {
          var data = e.getData();
          var node = data["node"];
          var portKey = data["portKey"];

          _this2.__updatePipelineAndRetrieve(node, portKey);
        }, this);
        workbench.addListener("showInLogger", function (ev) {
          var data = ev.getData();
          var nodeId = data.nodeId;
          var msg = data.msg;

          _this2.getLogger().info(nodeId, msg);
        }, this);
        [this.__nodesTree, this.__workbenchUI].forEach(function (wb) {
          wb.addListener("nodeDoubleClicked", function (e) {
            var nodeId = e.getData();

            _this2.nodeSelected(nodeId, true);
          }, _this2);
        });
        var workbenchUI = this.__workbenchUI;
        var nodesTree = this.__nodesTree;
        nodesTree.addListener("changeSelectedNode", function (e) {
          var node = workbenchUI.getNodeUI(e.getData());

          if (node && node.classname.includes("NodeUI")) {
            node.setActive(true);
          }
        });
        workbenchUI.addListener("changeSelectedNode", function (e) {
          nodesTree.nodeSelected(e.getData());
        });
      },
      nodeSelected: function nodeSelected(nodeId) {
        var _this3 = this;

        var openNodeAndParents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (!nodeId) {
          this.__loggerView.setCurrentNodeId();

          return;
        }

        if (this.__nodeView) {
          this.__nodeView.restoreIFrame();
        }

        this.__currentNodeId = nodeId;

        var widget = this.__getWidgetForNode(nodeId);

        var workbench = this.getStudy().getWorkbench();

        if (widget != this.__workbenchUI && workbench.getNode(nodeId).isInKey("file-picker")) {
          // open file picker in window
          var filePicker = new qx.ui.window.Window(widget.getNode().getLabel()).set({
            layout: new qx.ui.layout.Grow(),
            contentPadding: 0,
            width: 570,
            height: 450,
            appearance: "service-window",
            showMinimize: false,
            modal: true
          });

          var showParentWorkbench = function showParentWorkbench() {
            var node = widget.getNode();

            _this3.nodeSelected(node.getParentNodeId() || "root");
          };

          filePicker.add(widget);
          qx.core.Init.getApplication().getRoot().add(filePicker);
          filePicker.show();
          filePicker.center();
          widget.addListener("finished", function () {
            return filePicker.close();
          }, this);
          filePicker.addListener("close", function () {
            return showParentWorkbench();
          });
        } else {
          this.showInMainView(widget, nodeId);
        }

        if (widget === this.__workbenchUI) {
          if (nodeId === "root") {
            this.__workbenchUI.loadModel(workbench);
          } else {
            var node = workbench.getNode(nodeId);

            this.__workbenchUI.loadModel(node);
          }
        }

        this.__nodesTree.nodeSelected(nodeId, openNodeAndParents);

        this.__loggerView.setCurrentNodeId(nodeId);
      },
      __getWidgetForNode: function __getWidgetForNode(nodeId) {
        // Find widget for the given nodeId
        var workbench = this.getStudy().getWorkbench();
        var widget = null;

        if (nodeId === "root") {
          widget = this.__workbenchUI;
        } else {
          var node = workbench.getNode(nodeId);

          if (node.isContainer()) {
            if (node.hasDedicatedWidget() && node.showDedicatedWidget()) {
              if (node.isInKey("multi-plot")) {
                widget = new qxapp.component.widget.DashGrid(node);
              }
            }

            if (widget === null) {
              widget = this.__workbenchUI;
            }
          } else if (node.isInKey("file-picker")) {
            widget = new qxapp.file.FilePicker(node, this.getStudy().getUuid());
          } else {
            this.__nodeView.setNode(node);

            this.__nodeView.buildLayout();

            widget = this.__nodeView;
          }
        }

        return widget;
      },
      __addNode: function __addNode() {
        if (this.__mainPanel.getMainView() !== this.__workbenchUI) {
          return;
        }

        this.__workbenchUI.openServiceCatalog();
      },
      __removeNode: function __removeNode(nodeId) {
        if (nodeId === this.__currentNodeId) {
          return false;
        }

        var workbench = this.getStudy().getWorkbench();
        var connectedEdges = workbench.getConnectedEdges(nodeId);

        if (workbench.removeNode(nodeId)) {
          // remove first the connected edges
          for (var i = 0; i < connectedEdges.length; i++) {
            var edgeId = connectedEdges[i];

            this.__workbenchUI.clearEdge(edgeId);
          }

          this.__workbenchUI.clearNode(nodeId);

          return true;
        }

        return false;
      },
      __removeEdge: function __removeEdge(edgeId) {
        var workbench = this.getStudy().getWorkbench();

        if (workbench.removeEdge(edgeId, this.__currentNodeId)) {
          this.__workbenchUI.clearEdge(edgeId);
        }
      },
      __workbenchChanged: function __workbenchChanged() {
        this.__nodesTree.populateTree();

        this.__nodesTree.nodeSelected(this.__currentNodeId);
      },
      showInMainView: function showInMainView(widget, nodeId) {
        var _this4 = this;

        var node = this.getStudy().getWorkbench().getNode(nodeId);

        if (node && node.hasDedicatedWidget()) {
          var dedicatedWrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox());
          var dedicatedWidget = node.getDedicatedWidget();
          var btnLabel = dedicatedWidget ? this.tr("Setup view") : this.tr("Grid view");
          var btnIcon = dedicatedWidget ? "@FontAwesome5Solid/wrench/16" : "@FontAwesome5Solid/eye/16";
          var expertModeBtn = new qx.ui.form.Button().set({
            label: btnLabel,
            icon: btnIcon,
            gap: 10,
            alignX: "right",
            height: 25,
            maxWidth: 150
          });
          expertModeBtn.addListener("execute", function () {
            node.setDedicatedWidget(!dedicatedWidget);

            _this4.nodeSelected(nodeId);
          }, this);
          dedicatedWrapper.add(expertModeBtn);
          dedicatedWrapper.add(widget, {
            flex: 1
          });

          this.__mainPanel.setMainView(dedicatedWrapper);
        } else {
          this.__mainPanel.setMainView(widget);
        }

        var nodesPath = this.getStudy().getWorkbench().getPathIds(nodeId);
        this.fireDataEvent("changeMainViewCaption", nodesPath);
      },
      getLogger: function getLogger() {
        return this.__loggerView;
      },
      __getCurrentPipeline: function __getCurrentPipeline() {
        var saveContainers = false;
        var savePosition = false;
        var currentPipeline = this.getStudy().getWorkbench().serializeWorkbench(saveContainers, savePosition);

        for (var nodeId in currentPipeline) {
          var currentNode = currentPipeline[nodeId];

          if (currentNode.key.includes("/neuroman")) {
            // HACK: Only Neuroman should enter here
            currentNode.key = "simcore/services/dynamic/modeler/webserver";
            currentNode.version = "2.8.0";
            var modelSelected = currentNode.inputs["inModel"];
            delete currentNode.inputs["inModel"];
            currentNode.inputs["model_name"] = modelSelected;
          }
        }

        return currentPipeline;
      },
      __updatePipelineAndRetrieve: function __updatePipelineAndRetrieve(node) {
        var portKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        this.updateStudyDocument(false, this.__retrieveInputs.bind(this, node, portKey));
        this.getLogger().debug("root", "Updating pipeline");
      },
      __retrieveInputs: function __retrieveInputs(node) {
        var portKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        this.getLogger().debug("root", "Retrieveing inputs");

        if (node) {
          node.retrieveInputs(portKey);
        }
      },
      __startPipeline: function __startPipeline() {
        if (!qxapp.data.Permissions.getInstance().canDo("study.start", true)) {
          return false;
        }

        return this.updateStudyDocument(true, this.__doStartPipeline);
      },
      __doStartPipeline: function __doStartPipeline() {
        var _this5 = this;

        this.getStudy().getWorkbench().clearProgressData();
        var socket = qxapp.wrapper.WebSocket.getInstance(); // callback for incoming logs

        var slotName = "logger";
        socket.removeSlot(slotName);
        socket.on(slotName, function (data) {
          var d = JSON.parse(data);
          var nodeId = d["Node"];
          var msgs = d["Messages"];
          this.getLogger().infos(nodeId, msgs);
        }, this);
        socket.emit(slotName); // callback for incoming progress

        var slotName2 = "progress";
        socket.removeSlot(slotName2);
        socket.on(slotName2, function (data) {
          var d = JSON.parse(data);
          var nodeId = d["Node"];
          var progress = 100 * Number.parseFloat(d["Progress"]).toFixed(4);
          var workbench = this.getStudy().getWorkbench();
          var node = workbench.getNode(nodeId);

          if (node) {
            node.setProgress(progress);
          }
        }, this); // post pipeline

        this.__pipelineId = null;
        var url = "/computation/pipeline/" + encodeURIComponent(this.getStudy().getUuid()) + "/start";
        var req = new qxapp.io.request.ApiRequest(url, "POST");
        req.addListener("success", this.__onPipelinesubmitted, this);
        req.addListener("error", function (e) {
          _this5.getLogger().error("root", "Error submitting pipeline");
        }, this);
        req.addListener("fail", function (e) {
          _this5.getLogger().error("root", "Failed submitting pipeline");
        }, this);
        req.send();
        this.getLogger().info("root", "Starting pipeline");
        return true;
      },
      __stopPipeline: function __stopPipeline() {
        var _this6 = this;

        if (!qxapp.data.Permissions.getInstance().canDo("study.stop", true)) {
          return false;
        }

        var req = new qxapp.io.request.ApiRequest("/stop_pipeline", "POST");
        var data = {};
        data["project_id"] = this.getStudy().getUuid();
        req.set({
          requestData: qx.util.Serializer.toJson(data)
        });
        req.addListener("success", this.__onPipelineStopped, this);
        req.addListener("error", function (e) {
          _this6.getLogger().error("root", "Error stopping pipeline");
        }, this);
        req.addListener("fail", function (e) {
          _this6.getLogger().error("root", "Failed stopping pipeline");
        }, this); // req.send();

        this.getLogger().info("root", "Stopping pipeline. Not yet implemented");
        return true;
      },
      __onPipelinesubmitted: function __onPipelinesubmitted(e) {
        var resp = e.getTarget().getResponse();
        var pipelineId = resp.data["project_id"];
        this.getLogger().debug("root", "Pipeline ID " + pipelineId);
        var notGood = [null, undefined, -1];

        if (notGood.includes(pipelineId)) {
          this.__pipelineId = null;
          this.getLogger().error("root", "Submition failed");
        } else {
          this.__pipelineId = pipelineId;
          this.getLogger().info("root", "Pipeline started");
        }
      },
      __onPipelineStopped: function __onPipelineStopped(e) {
        this.getStudy().getWorkbench().clearProgressData();
      },
      __startAutoSaveTimer: function __startAutoSaveTimer() {
        var _this7 = this;

        var diffPatcher = qxapp.wrapper.JsonDiffPatch.getInstance(); // Save every 5 seconds

        var interval = 5000;
        var timer = this.__autoSaveTimer = new qx.event.Timer(interval);
        timer.addListener("interval", function () {
          var newObj = _this7.getStudy().serializeStudy();

          var delta = diffPatcher.diff(_this7.__lastSavedPrj, newObj);

          if (delta) {
            var deltaKeys = Object.keys(delta); // lastChangeDate should not be taken into account as data change

            var index = deltaKeys.indexOf("lastChangeDate");

            if (index > -1) {
              deltaKeys.splice(index, 1);
            }

            if (deltaKeys.length > 0) {
              _this7.updateStudyDocument(false);
            }
          }
        }, this);
        timer.start();
      },
      __stopAutoSaveTimer: function __stopAutoSaveTimer() {
        if (this.__autoSaveTimer && this.__autoSaveTimer.isEnabled()) {
          this.__autoSaveTimer.stop();

          this.__autoSaveTimer.setEnabled(false);
        }
      },
      updateStudyDocument: function updateStudyDocument() {
        var _this8 = this;

        var run = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var cbSuccess = arguments.length > 1 ? arguments[1] : undefined;
        var cbError = arguments.length > 2 ? arguments[2] : undefined;
        this.getStudy().setLastChangeDate(new Date());
        var newObj = this.getStudy().serializeStudy();
        var prjUuid = this.getStudy().getUuid();
        var resource = this.__studyResources.project;
        resource.addListenerOnce("putSuccess", function (ev) {
          _this8.fireDataEvent("studySaved", true);

          _this8.__lastSavedPrj = qxapp.wrapper.JsonDiffPatch.getInstance().clone(newObj);

          if (cbSuccess) {
            cbSuccess.call(_this8);
          }
        }, this);
        resource.addListenerOnce("putError", function (ev) {
          _this8.getLogger().error("root", "Error updating pipeline");
        }, this);
        resource.put({
          "project_id": prjUuid,
          run: run
        }, newObj);
      },
      closeStudy: function closeStudy() {
        this.getStudy().closeStudy();
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this9 = this;

        this.__blocker.addListener("tap", this.__sidePanel.toggleCollapsed.bind(this.__sidePanel));

        var maximizeIframeCb = function maximizeIframeCb(msg) {
          _this9.__blocker.setStyles({
            display: msg.getData() ? "none" : "block"
          });

          _this9.__scrollContainer.setVisibility(msg.getData() ? "excluded" : "visible");
        };

        this.addListener("appear", function () {
          qx.event.message.Bus.getInstance().subscribe("maximizeIframe", maximizeIframeCb, _this9);
        }, this);
        this.addListener("disappear", function () {
          qx.event.message.Bus.getInstance().unsubscribe("maximizeIframe", maximizeIframeCb, _this9);
        }, this);
      }
    }
  });
  qxapp.desktop.StudyEditor.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=StudyEditor.js.map?dt=1568886163286