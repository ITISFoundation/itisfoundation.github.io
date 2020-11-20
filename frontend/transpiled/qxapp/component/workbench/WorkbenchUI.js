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
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.bom.Font": {
        "construct": true
      },
      "qxapp.theme.Font": {
        "construct": true
      },
      "qx.ui.basic.Label": {
        "construct": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.window.Desktop": {
        "construct": true
      },
      "qx.ui.window.Manager": {
        "construct": true
      },
      "qxapp.component.workbench.SvgWidget": {
        "construct": true
      },
      "qx.ui.form.Button": {},
      "qxapp.component.workbench.ServiceCatalog": {},
      "qx.ui.core.queue.Layout": {},
      "qxapp.component.workbench.NodeUI": {},
      "qxapp.component.workbench.EdgeUI": {},
      "qx.bom.Element": {},
      "qxapp.component.widget.NodeInput": {},
      "qxapp.component.widget.NodeOutput": {},
      "qxapp.store.Store": {},
      "qx.ui.core.queue.Visibility": {},
      "qxapp.theme.Color": {},
      "qxapp.component.filter.UIFilterController": {},
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

  /**
   *   Widget containing the layout where NodeUIs and EdgeUIs, and when the model loaded
   * is a container-node, also NodeInput and NodeOutput are rendered.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let workbenchUI = new qxapp.component.workbench.WorkbenchUI(workbench);
   *   this.getRoot().add(workbenchUI);
   * </pre>
   */
  var BUTTON_SIZE = 50;
  var BUTTON_SPACING = 10;
  var NODE_INPUTS_WIDTH = 200;
  qx.Class.define("qxapp.component.workbench.WorkbenchUI", {
    extend: qx.ui.core.Widget,

    /**
      * @param workbench {qxapp.data.model.Workbench} Workbench owning the widget
    */
    construct: function construct(workbench) {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);
      this.__nodesUI = [];
      this.__edgesUI = [];
      var hBox = new qx.ui.layout.HBox();

      this._setLayout(hBox);

      var inputNodesLayout = this.__inputNodesLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
      inputNodesLayout.set({
        width: NODE_INPUTS_WIDTH,
        maxWidth: NODE_INPUTS_WIDTH,
        allowGrowX: false
      });
      var navBarLabelFont = qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["nav-bar-label"]);
      var inputLabel = new qx.ui.basic.Label(this.tr("Inputs")).set({
        font: navBarLabelFont,
        alignX: "center"
      });
      inputNodesLayout.add(inputLabel);

      this._add(inputNodesLayout);

      this.__desktopCanvas = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      this._add(this.__desktopCanvas, {
        flex: 1
      });

      var nodesExposedLayout = this.__outputNodesLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
      nodesExposedLayout.set({
        width: NODE_INPUTS_WIDTH,
        maxWidth: NODE_INPUTS_WIDTH,
        allowGrowX: false
      });
      var outputLabel = new qx.ui.basic.Label(this.tr("Outputs")).set({
        font: navBarLabelFont,
        alignX: "center"
      });
      nodesExposedLayout.add(outputLabel);

      this._add(nodesExposedLayout);

      this.__desktop = new qx.ui.window.Desktop(new qx.ui.window.Manager());

      this.__desktopCanvas.add(this.__desktop, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });

      this.__startHint = new qx.ui.basic.Label(this.tr("Double click on this area to start")).set({
        font: "workbench-start-hint",
        textColor: "workbench-start-hint",
        visibility: "excluded"
      });

      this.__desktopCanvas.add(this.__startHint);

      this.__svgWidget = new qxapp.component.workbench.SvgWidget("SvgWidgetLayer"); // this gets fired once the widget has appeared and the library has been loaded
      // due to the qx rendering, this will always happen after setup, so we are
      // sure to catch this event

      this.__svgWidget.addListenerOnce("SvgWidgetReady", function () {
        // Will be called only the first time Svg lib is loaded
        _this.removeAll();

        _this.setWorkbench(workbench);

        _this.__nodeSelected("root");
      });

      this.__desktop.add(this.__svgWidget, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });

      var buttonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(BUTTON_SPACING));

      this.__desktopCanvas.add(buttonContainer, {
        bottom: 10,
        right: 10
      });

      var unlinkButton = this.__unlinkButton = this.__getUnlinkButton();

      unlinkButton.setVisibility("excluded");
      buttonContainer.add(unlinkButton);

      this.__addEventListeners();
    },
    events: {
      "nodeDoubleClicked": "qx.event.type.Data",
      "removeNode": "qx.event.type.Data",
      "removeEdge": "qx.event.type.Data",
      "changeSelectedNode": "qx.event.type.Data"
    },
    properties: {
      workbench: {
        check: "qxapp.data.model.Workbench",
        nullable: false,
        apply: "loadModel"
      }
    },
    members: {
      __unlinkButton: null,
      __nodesUI: null,
      __edgesUI: null,
      __inputNodesLayout: null,
      __outputNodesLayout: null,
      __desktop: null,
      __svgWidget: null,
      __tempEdgeNodeId: null,
      __tempEdgeRepr: null,
      __pointerPosX: null,
      __pointerPosY: null,
      __selectedItemId: null,
      __currentModel: null,
      __getUnlinkButton: function __getUnlinkButton() {
        var icon = "@FontAwesome5Solid/unlink/16";
        var unlinkBtn = new qx.ui.form.Button(null, icon);
        unlinkBtn.set({
          width: BUTTON_SIZE,
          height: BUTTON_SIZE
        });
        unlinkBtn.addListener("execute", function () {
          if (this.__selectedItemId && this.__isSelectedItemAnEdge()) {
            this.__removeEdge(this.__getEdgeUI(this.__selectedItemId));

            this.__selectedItemId = null;
          }
        }, this);
        return unlinkBtn;
      },
      openServiceCatalog: function openServiceCatalog() {
        var srvCat = this.__createServiceCatalog();

        srvCat.open();
      },
      __createServiceCatalog: function __createServiceCatalog(pos) {
        var _this2 = this;

        var srvCat = new qxapp.component.workbench.ServiceCatalog();

        if (pos) {
          srvCat.moveTo(pos.x, pos.y);
        } else {
          // srvCat.center();
          var bounds = this.getLayoutParent().getBounds();
          var workbenchUICenter = {
            x: bounds.left + parseInt((bounds.left + bounds.width) / 2),
            y: bounds.top + parseInt((bounds.top + bounds.height) / 2)
          };
          srvCat.moveTo(workbenchUICenter.x - 200, workbenchUICenter.y - 200);
        }

        srvCat.addListener("addService", function (ev) {
          _this2.__addServiceFromCatalog(ev, pos);
        }, this);
        return srvCat;
      },
      __addServiceFromCatalog: function __addServiceFromCatalog(e, pos) {
        var data = e.getData();
        var service = data.service;
        var nodeAId = data.contextNodeId;
        var portA = data.contextPort;
        var parent = null;

        if (this.__currentModel.isContainer()) {
          parent = this.__currentModel;
        }

        var node = this.getWorkbench().createNode(service.getKey(), service.getVersion(), null, parent, true);

        if (!node) {
          return;
        }

        var nodeUI = this.__createNodeUI(node.getNodeId());

        this.__addNodeToWorkbench(nodeUI, pos);

        if (nodeAId !== null && portA !== null) {
          var nodeBId = nodeUI.getNodeId();

          var portB = this.__findCompatiblePort(nodeUI, portA); // swap node-ports to have node1 as input and node2 as output


          if (portA.isInput) {
            var _ref = [nodeBId, portB, nodeAId, portA];
            nodeAId = _ref[0];
            portA = _ref[1];
            nodeBId = _ref[2];
            portB = _ref[3];
          }

          this.__createEdgeBetweenNodes({
            nodeUuid: nodeAId
          }, {
            nodeUuid: nodeBId
          });
        }
      },
      __addNodeToWorkbench: function __addNodeToWorkbench(nodeUI, position) {
        var _this3 = this;

        if (position === undefined || position === null) {
          position = {};
          var farthestRight = 0;

          for (var i = 0; i < this.__nodesUI.length; i++) {
            var boundPos = this.__nodesUI[i].getBounds();

            var rightPos = boundPos.left + boundPos.width;

            if (farthestRight < rightPos) {
              farthestRight = rightPos;
            }
          }

          position.x = 50 + farthestRight;
          position.y = 200;
        }

        nodeUI.getNode().setPosition(position.x, position.y);
        nodeUI.moveTo(position.x, position.y);
        this.addWindowToDesktop(nodeUI);

        this.__nodesUI.push(nodeUI);

        nodeUI.addListener("nodeMoving", function () {
          this.__updateEdges(nodeUI);

          this.__updatePosition(nodeUI);
        }, this);
        nodeUI.addListener("appear", function () {
          this.__updateEdges(nodeUI);
        }, this);
        nodeUI.addListener("tap", function (e) {
          _this3.__selectedItemChanged(nodeUI.getNodeId());

          e.stopPropagation();
        }, this);
        nodeUI.addListener("dbltap", function (e) {
          _this3.__nodeSelected(nodeUI.getNodeId());

          e.stopPropagation();
        }, this);
        qx.ui.core.queue.Layout.flush();

        this.__updateHint();
      },
      __createNodeUI: function __createNodeUI(nodeId) {
        var node = this.getWorkbench().getNode(nodeId);
        var nodeUI = new qxapp.component.workbench.NodeUI(node);
        nodeUI.populateNodeLayout();

        this.__createDragDropMechanism(nodeUI);

        return nodeUI;
      },
      __createEdgeUI: function __createEdgeUI(node1Id, node2Id, edgeId) {
        var _this4 = this;

        var edge = this.getWorkbench().createEdge(edgeId, node1Id, node2Id);

        if (!edge) {
          return null;
        }

        if (this.__edgeRepresetationExists(edge)) {
          return null;
        } // build representation


        var nodeUI1 = this.getNodeUI(node1Id);
        var nodeUI2 = this.getNodeUI(node2Id);
        var port1 = nodeUI1.getOutputPort();
        var port2 = nodeUI2.getInputPort();

        if (port1 && port2) {
          if (this.__currentModel.isContainer() && nodeUI2.getNodeId() === this.__currentModel.getNodeId()) {
            nodeUI1.getNode().setIsOutputNode(true);
          } else {
            nodeUI2.getNode().addInputNode(node1Id);
          }

          var pointList = this.__getEdgePoints(nodeUI1, port1, nodeUI2, port2);

          var x1 = pointList[0] ? pointList[0][0] : 0;
          var y1 = pointList[0] ? pointList[0][1] : 0;
          var x2 = pointList[1] ? pointList[1][0] : 0;
          var y2 = pointList[1] ? pointList[1][1] : 0;

          var edgeRepresentation = this.__svgWidget.drawCurve(x1, y1, x2, y2);

          var edgeUI = new qxapp.component.workbench.EdgeUI(edge, edgeRepresentation);

          this.__edgesUI.push(edgeUI);

          edgeUI.getRepresentation().node.addEventListener("click", function (e) {
            // this is needed to get out of the context of svg
            edgeUI.fireDataEvent("edgeSelected", edgeUI.getEdgeId());
            e.stopPropagation();
          }, this);
          edgeUI.addListener("edgeSelected", function (e) {
            _this4.__selectedItemChanged(edgeUI.getEdgeId());
          }, this);
          return edgeUI;
        }

        return null;
      },
      __edgeRepresetationExists: function __edgeRepresetationExists(edge) {
        for (var i = 0; i < this.__edgesUI.length; i++) {
          var edgeUI = this.__edgesUI[i];

          if (edgeUI.getEdge().getEdgeId() === edge.getEdgeId()) {
            return true;
          }
        }

        return false;
      },
      __createDragDropMechanism: function __createDragDropMechanism(nodeUI) {
        var _this5 = this;

        var evType = "pointermove";
        nodeUI.addListener("edgeDragStart", function (e) {
          var data = e.getData();
          var event = data.event;
          var dragNodeId = data.nodeId;
          var dragIsInput = data.isInput; // Register supported actions

          event.addAction("move"); // Register supported types

          event.addType("osparc-node-link");
          var dragData = {
            dragNodeId: dragNodeId,
            dragIsInput: dragIsInput
          };
          event.addData("osparc-node-link", dragData);
          _this5.__tempEdgeNodeId = dragData.dragNodeId;
          _this5.__tempEdgeIsInput = dragData.dragIsInput;
          qx.bom.Element.addListener(_this5.__desktop, evType, _this5.__startTempEdge, _this5);
        }, this);
        nodeUI.addListener("edgeDragOver", function (e) {
          var data = e.getData();
          var event = data.event;
          var dropNodeId = data.nodeId;
          var dropIsInput = data.isInput;
          var compatible = false;

          if (event.supportsType("osparc-node-link")) {
            var dragNodeId = event.getData("osparc-node-link").dragNodeId;
            var dragIsInput = event.getData("osparc-node-link").dragIsInput;

            var dragNode = _this5.getNodeUI(dragNodeId);

            var dropNode = _this5.getNodeUI(dropNodeId);

            var dragPortTarget = dragIsInput ? dragNode.getInputPort() : dragNode.getOutputPort();
            var dropPortTarget = dropIsInput ? dropNode.getInputPort() : dropNode.getOutputPort();
            compatible = _this5.__areNodesCompatible(dragPortTarget, dropPortTarget);
          }

          if (!compatible) {
            event.preventDefault();
          }
        }, this);
        nodeUI.addListener("edgeDrop", function (e) {
          var data = e.getData();
          var event = data.event;
          var dropNodeId = data.nodeId;
          var dropIsInput = data.isInput;

          if (event.supportsType("osparc-node-link")) {
            var dragNodeId = event.getData("osparc-node-link").dragNodeId;
            var dragIsInput = event.getData("osparc-node-link").dragIsInput;
            var nodeAId = dropIsInput ? dragNodeId : dropNodeId;
            var nodeBId = dragIsInput ? dragNodeId : dropNodeId;

            _this5.__createEdgeBetweenNodes({
              nodeUuid: nodeAId
            }, {
              nodeUuid: nodeBId
            });

            _this5.__removeTempEdge();

            qx.bom.Element.removeListener(_this5.__desktop, evType, _this5.__startTempEdge, _this5);
          }
        }, this);
        nodeUI.addListener("edgeDragEnd", function (e) {
          var data = e.getData();
          var dragNodeId = data.nodeId;
          var posX = _this5.__pointerPosX;
          var posY = _this5.__pointerPosY;

          if (_this5.__tempEdgeNodeId === dragNodeId) {
            var pos = {
              x: posX,
              y: posY
            };

            var srvCat = _this5.__createServiceCatalog(pos);

            if (_this5.__tempEdgeIsInput === true) {
              srvCat.setContext(dragNodeId, _this5.getNodeUI(dragNodeId).getInputPort());
            } else {
              srvCat.setContext(dragNodeId, _this5.getNodeUI(dragNodeId).getOutputPort());
            }

            srvCat.addListener("close", function (ev) {
              this.__removeTempEdge();
            }, _this5);
            srvCat.open();
          }

          qx.bom.Element.removeListener(_this5.__desktop, evType, _this5.__startTempEdge, _this5);
        }, this);
      },
      __createNodeInputUI: function __createNodeInputUI(inputNode) {
        var nodeInput = new qxapp.component.widget.NodeInput(inputNode);
        nodeInput.populateNodeLayout();

        this.__createDragDropMechanism(nodeInput);

        this.__inputNodesLayout.add(nodeInput, {
          flex: 1
        });

        return nodeInput;
      },
      __createNodeInputUIs: function __createNodeInputUIs(model) {
        this.__clearNodeInputUIs();

        var inputNodes = model.getInputNodes();

        for (var i = 0; i < inputNodes.length; i++) {
          var inputNode = this.getWorkbench().getNode(inputNodes[i]);

          var inputLabel = this.__createNodeInputUI(inputNode);

          this.__nodesUI.push(inputLabel);
        }
      },
      __clearNodeInputUIs: function __clearNodeInputUIs() {
        // remove all but the title
        while (this.__inputNodesLayout.getChildren().length > 1) {
          this.__inputNodesLayout.removeAt(this.__inputNodesLayout.getChildren().length - 1);
        }
      },
      __createNodeOutputUI: function __createNodeOutputUI(currentModel) {
        var nodeOutput = new qxapp.component.widget.NodeOutput(currentModel);
        nodeOutput.populateNodeLayout();

        this.__createDragDropMechanism(nodeOutput);

        this.__outputNodesLayout.add(nodeOutput, {
          flex: 1
        });

        return nodeOutput;
      },
      __createNodeOutputUIs: function __createNodeOutputUIs(model) {
        this.__clearNodeOutputUIs();

        var outputLabel = this.__createNodeOutputUI(model);

        this.__nodesUI.push(outputLabel);
      },
      __clearNodeOutputUIs: function __clearNodeOutputUIs() {
        // remove all but the title
        while (this.__outputNodesLayout.getChildren().length > 1) {
          this.__outputNodesLayout.removeAt(this.__outputNodesLayout.getChildren().length - 1);
        }
      },
      __removeSelectedNode: function __removeSelectedNode() {
        for (var i = 0; i < this.__nodesUI.length; i++) {
          if (this.__desktop.getActiveWindow() === this.__nodesUI[i]) {
            this.__removeNode(this.__nodesUI[i]);

            return;
          }
        }
      },
      __areNodesCompatible: function __areNodesCompatible(topLevelPort1, topLevelPort2) {
        return qxapp.store.Store.getInstance().areNodesCompatible(topLevelPort1, topLevelPort2);
      },
      __findCompatiblePort: function __findCompatiblePort(nodeB, portA) {
        if (portA.isInput && nodeB.getOutputPort()) {
          return nodeB.getOutputPort();
        } else if (nodeB.getInputPort()) {
          return nodeB.getInputPort();
        }

        return null;
      },
      __createEdgeBetweenNodes: function __createEdgeBetweenNodes(from, to, edgeId) {
        var node1Id = from.nodeUuid;
        var node2Id = to.nodeUuid;

        this.__createEdgeUI(node1Id, node2Id, edgeId);
      },
      __createEdgeBetweenNodesAndInputNodes: function __createEdgeBetweenNodesAndInputNodes(from, to, edgeId) {
        var inputNodes = this.__inputNodesLayout.getChildren(); // Children[0] is the title


        for (var i = 1; i < inputNodes.length; i++) {
          var inputNodeId = inputNodes[i].getNodeId();

          if (inputNodeId === from.nodeUuid) {
            var node1Id = from.nodeUuid;
            var node2Id = to.nodeUuid;

            this.__createEdgeUI(node1Id, node2Id, edgeId);
          }
        }
      },
      __updatePosition: function __updatePosition(nodeUI) {
        var cBounds = nodeUI.getCurrentBounds();
        var node = this.getWorkbench().getNode(nodeUI.getNodeId());
        node.setPosition(cBounds.left, cBounds.top);
      },
      __updateEdges: function __updateEdges(nodeUI) {
        var _this6 = this;

        var edgesInvolved = this.getWorkbench().getConnectedEdges(nodeUI.getNodeId());
        edgesInvolved.forEach(function (edgeId) {
          var edgeUI = _this6.__getEdgeUI(edgeId);

          if (edgeUI) {
            var node1 = _this6.getNodeUI(edgeUI.getEdge().getInputNodeId());

            var port1 = node1.getOutputPort();

            var node2 = _this6.getNodeUI(edgeUI.getEdge().getOutputNodeId());

            var port2 = node2.getInputPort();

            var pointList = _this6.__getEdgePoints(node1, port1, node2, port2);

            var x1 = pointList[0][0];
            var y1 = pointList[0][1];
            var x2 = pointList[1][0];
            var y2 = pointList[1][1];

            _this6.__svgWidget.updateCurve(edgeUI.getRepresentation(), x1, y1, x2, y2);
          }
        });
      },
      __startTempEdge: function __startTempEdge(pointerEvent) {
        if (this.__tempEdgeNodeId === null) {
          return;
        }

        var nodeUI = this.getNodeUI(this.__tempEdgeNodeId);

        if (nodeUI === null) {
          return;
        }

        var port;

        if (this.__tempEdgeIsInput) {
          port = nodeUI.getInputPort();
        } else {
          port = nodeUI.getOutputPort();
        }

        if (port === null) {
          return;
        }

        var navBarHeight = 50;
        var inputNodesLayoutWidth = this.__inputNodesLayout.isVisible() ? this.__inputNodesLayout.getWidth() : 0;
        this.__pointerPosX = pointerEvent.getViewportLeft() - this.getBounds().left - inputNodesLayoutWidth;
        this.__pointerPosY = pointerEvent.getViewportTop() - navBarHeight;
        var portPos = nodeUI.getEdgePoint(port);

        if (portPos[0] === null) {
          portPos[0] = parseInt(this.__desktopCanvas.getBounds().width - 6);
        }

        var x1;
        var y1;
        var x2;
        var y2;

        if (port.isInput) {
          x1 = this.__pointerPosX;
          y1 = this.__pointerPosY;
          x2 = portPos[0];
          y2 = portPos[1];
        } else {
          x1 = portPos[0];
          y1 = portPos[1];
          x2 = this.__pointerPosX;
          y2 = this.__pointerPosY;
        }

        if (this.__tempEdgeRepr === null) {
          this.__tempEdgeRepr = this.__svgWidget.drawCurve(x1, y1, x2, y2);
        } else {
          this.__svgWidget.updateCurve(this.__tempEdgeRepr, x1, y1, x2, y2);
        }
      },
      __removeTempEdge: function __removeTempEdge() {
        if (this.__tempEdgeRepr !== null) {
          this.__svgWidget.removeCurve(this.__tempEdgeRepr);
        }

        this.__tempEdgeRepr = null;
        this.__tempEdgeNodeId = null;
        this.__pointerPosX = null;
        this.__pointerPosY = null;
      },
      __getEdgePoints: function __getEdgePoints(node1, port1, node2, port2) {
        // swap node-ports to have node1 as input and node2 as output
        if (port1.isInput) {
          var _ref2 = [node2, port2, node1, port1];
          node1 = _ref2[0];
          port1 = _ref2[1];
          node2 = _ref2[2];
          port2 = _ref2[3];
        }

        var p1 = node1.getEdgePoint(port1);
        var p2 = node2.getEdgePoint(port2);

        if (p2[0] === null) {
          p2[0] = parseInt(this.__desktopCanvas.getBounds().width - 6);
        }

        return [p1, p2];
      },
      getNodeUI: function getNodeUI(nodeId) {
        for (var i = 0; i < this.__nodesUI.length; i++) {
          if (this.__nodesUI[i].getNodeId() === nodeId) {
            return this.__nodesUI[i];
          }
        }

        return null;
      },
      __getEdgeUI: function __getEdgeUI(edgeId) {
        for (var i = 0; i < this.__edgesUI.length; i++) {
          if (this.__edgesUI[i].getEdgeId() === edgeId) {
            return this.__edgesUI[i];
          }
        }

        return null;
      },
      __removeNode: function __removeNode(node) {
        this.fireDataEvent("removeNode", node.getNodeId());
      },
      clearNode: function clearNode(nodeId) {
        this.__clearNode(nodeId);
      },
      __removeAllNodes: function __removeAllNodes() {
        while (this.__nodesUI.length > 0) {
          this.__removeNode(this.__nodesUI[this.__nodesUI.length - 1]);
        }
      },
      clearEdge: function clearEdge(edgeId) {
        this.__clearEdge(this.__getEdgeUI(edgeId));
      },
      __removeEdge: function __removeEdge(edge) {
        this.fireDataEvent("removeEdge", edge.getEdgeId());
      },
      __removeAllEdges: function __removeAllEdges() {
        while (this.__edgesUI.length > 0) {
          this.__removeEdge(this.__edgesUI[this.__edgesUI.length - 1]);
        }
      },
      removeAll: function removeAll() {
        this.__removeAllNodes();

        this.__removeAllEdges();
      },
      __clearNode: function __clearNode(nodeId) {
        var nodeUI = this.getNodeUI(nodeId);

        if (this.__desktop.getChildren().includes(nodeUI)) {
          this.__desktop.remove(nodeUI);
        }

        var index = this.__nodesUI.indexOf(nodeUI);

        if (index > -1) {
          this.__nodesUI.splice(index, 1);
        }

        this.__updateHint();
      },
      __clearAllNodes: function __clearAllNodes() {
        while (this.__nodesUI.length > 0) {
          this.__clearNode(this.__nodesUI[this.__nodesUI.length - 1].getNodeId());
        }
      },
      __clearEdge: function __clearEdge(edge) {
        this.__svgWidget.removeCurve(edge.getRepresentation());

        var index = this.__edgesUI.indexOf(edge);

        if (index > -1) {
          this.__edgesUI.splice(index, 1);
        }
      },
      __clearAllEdges: function __clearAllEdges() {
        while (this.__edgesUI.length > 0) {
          this.__clearEdge(this.__edgesUI[this.__edgesUI.length - 1]);
        }
      },
      clearAll: function clearAll() {
        this.__clearAllNodes();

        this.__clearAllEdges();
      },
      loadModel: function loadModel(model) {
        this.clearAll();
        this.__currentModel = model;

        if (model) {
          var isContainer = model.isContainer();

          if (isContainer) {
            this.__inputNodesLayout.setVisibility("visible");

            this.__createNodeInputUIs(model);

            this.__outputNodesLayout.setVisibility("visible");

            this.__createNodeOutputUIs(model);
          } else {
            this.__inputNodesLayout.setVisibility("excluded");

            this.__outputNodesLayout.setVisibility("excluded");
          }

          qx.ui.core.queue.Visibility.flush();
          var nodes = isContainer ? model.getInnerNodes() : model.getNodes();

          for (var nodeUuid in nodes) {
            var node = nodes[nodeUuid];

            var nodeUI = this.__createNodeUI(nodeUuid);

            this.__addNodeToWorkbench(nodeUI, node.getPosition());
          }

          for (var _nodeUuid in nodes) {
            var _node = nodes[_nodeUuid];

            var inputNodes = _node.getInputNodes();

            for (var i = 0; i < inputNodes.length; i++) {
              var inputNode = inputNodes[i];

              if (inputNode in nodes) {
                this.__createEdgeBetweenNodes({
                  nodeUuid: inputNode
                }, {
                  nodeUuid: _nodeUuid
                });
              } else {
                if (!isContainer) {
                  console.log("Shouldn't be the case");
                }

                this.__createEdgeBetweenNodesAndInputNodes({
                  nodeUuid: inputNode
                }, {
                  nodeUuid: _nodeUuid
                });
              }
            }
          }

          var innerNodes = isContainer ? model.getInnerNodes() : {};

          for (var innerNodeId in innerNodes) {
            var innerNode = innerNodes[innerNodeId];

            if (innerNode.getIsOutputNode()) {
              this.__createEdgeBetweenNodes({
                nodeUuid: innerNode.getNodeId()
              }, {
                nodeUuid: model.getNodeId()
              });
            }
          }
        }
      },
      addWindowToDesktop: function addWindowToDesktop(node) {
        this.__desktop.add(node);

        node.open();
      },
      __selectedItemChanged: function __selectedItemChanged(newID) {
        var oldId = this.__selectedItemId;

        if (oldId) {
          if (this.__isSelectedItemAnEdge()) {
            var unselectedEdge = this.__getEdgeUI(oldId);

            var unselectedColor = qxapp.theme.Color.colors["workbench-edge-comp-active"];

            this.__svgWidget.updateColor(unselectedEdge.getRepresentation(), unselectedColor);
          }
        }

        this.__selectedItemId = newID;

        if (this.__isSelectedItemAnEdge()) {
          var selectedEdge = this.__getEdgeUI(newID);

          var selectedColor = qxapp.theme.Color.colors["workbench-edge-selected"];

          this.__svgWidget.updateColor(selectedEdge.getRepresentation(), selectedColor);
        } else if (newID) {
          this.fireDataEvent("changeSelectedNode", newID);
        }

        this.__unlinkButton.setVisibility(this.__isSelectedItemAnEdge() ? "visible" : "excluded");
      },
      __nodeSelected: function __nodeSelected(nodeId) {
        this.fireDataEvent("nodeDoubleClicked", nodeId);
      },
      __isSelectedItemAnEdge: function __isSelectedItemAnEdge() {
        return Boolean(this.__getEdgeUI(this.__selectedItemId));
      },
      __addEventListeners: function __addEventListeners() {
        var _this7 = this;

        this.addListener("appear", function () {
          // Reset filters and sidebars
          qxapp.component.filter.UIFilterController.getInstance().resetGroup("workbench");
          qxapp.component.filter.UIFilterController.getInstance().setContainerVisibility("workbench", "visible");
          qx.event.message.Bus.getInstance().dispatchByName("maximizeIframe", false);
        });
        this.addListener("disappear", function () {
          // Reset filters
          qxapp.component.filter.UIFilterController.getInstance().resetGroup("workbench");
          qxapp.component.filter.UIFilterController.getInstance().setContainerVisibility("workbench", "excluded");
        });

        this.__desktop.addListener("tap", function (e) {
          _this7.__selectedItemChanged(null);
        }, this);

        this.addListener("dbltap", function (e) {
          var x = e.getViewportLeft() - _this7.getBounds().left;

          var y = e.getViewportTop();
          var pos = {
            x: x,
            y: y
          };

          var srvCat = _this7.__createServiceCatalog(pos);

          srvCat.open();
        }, this);

        this.__desktopCanvas.addListener("resize", function () {
          return _this7.__updateHint();
        }, this);
      },
      __updateHint: function __updateHint() {
        var isEmptyWorkspace = Object.keys(this.getWorkbench().getNodes()).length === 0;

        this.__startHint.setVisibility(isEmptyWorkspace ? "visible" : "excluded");

        if (isEmptyWorkspace) {
          var hintBounds = this.__startHint.getBounds() || this.__startHint.getSizeHint();

          var _this$__desktopCanvas = this.__desktopCanvas.getBounds(),
              height = _this$__desktopCanvas.height,
              width = _this$__desktopCanvas.width;

          this.__startHint.setLayoutProperties({
            top: Math.round((height - hintBounds.height) / 2),
            left: Math.round((width - hintBounds.width) / 2)
          });
        }
      }
    }
  });
  qxapp.component.workbench.WorkbenchUI.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=WorkbenchUI.js.map?dt=1568886162092