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
      "qxapp.data.Permissions": {},
      "qxapp.data.model.Edge": {},
      "qxapp.data.model.Node": {}
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
   * Class that stores Workbench data.
   *
   * It takes care of creating, storing and managing nodes and edges.
   *
   *                                    -> {EDGES}
   * STUDY -> METADATA + WORKBENCH ->|
   *                                    -> {LINKS}
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   study.setWorkbench(new qxapp.data.model.Workbench(study, study.workbench));
   * </pre>
   */
  qx.Class.define("qxapp.data.model.Workbench", {
    extend: qx.core.Object,

    /**
      * @param study {qxapp.data.model.Study} Study owning the Workbench
      * @param workbenchData {qx.core.Object} Object containing the workbench raw data
      */
    construct: function construct(study, workbenchData) {
      qx.core.Object.constructor.call(this);
      this.setStudy(study);
      this.setStudyName(study.getName());

      this.__deserializeWorkbench(workbenchData);
    },
    properties: {
      study: {
        check: "qxapp.data.model.Study",
        nullable: false
      },
      studyName: {
        check: "String",
        nullable: false
      }
    },
    events: {
      "workbenchChanged": "qx.event.type.Event",
      "retrieveInputs": "qx.event.type.Data",
      "showInLogger": "qx.event.type.Data"
    },
    members: {
      __nodesTopLevel: null,
      __edges: null,
      isContainer: function isContainer() {
        return false;
      },
      getNode: function getNode(nodeId) {
        var allNodes = this.getNodes(true);
        var exists = Object.prototype.hasOwnProperty.call(allNodes, nodeId);

        if (exists) {
          return allNodes[nodeId];
        }

        return null;
      },
      getNodes: function getNodes() {
        var recursive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var nodes = Object.assign({}, this.__nodesTopLevel);

        if (recursive) {
          var topLevelNodes = Object.values(this.__nodesTopLevel);

          for (var _i = 0, _topLevelNodes = topLevelNodes; _i < _topLevelNodes.length; _i++) {
            var topLevelNode = _topLevelNodes[_i];
            var innerNodes = topLevelNode.getInnerNodes(true);
            nodes = Object.assign(nodes, innerNodes);
          }
        }

        return nodes;
      },
      getPathIds: function getPathIds(nodeId) {
        if (nodeId === "root" || nodeId === undefined) {
          return ["root"];
        }

        var nodePath = [];
        nodePath.unshift(nodeId);
        var node = this.getNode(nodeId);
        var parentNodeId = node.getParentNodeId();

        while (parentNodeId) {
          var checkThisNode = this.getNode(parentNodeId);

          if (checkThisNode) {
            nodePath.unshift(parentNodeId);
            parentNodeId = checkThisNode.getParentNodeId();
          }
        }

        nodePath.unshift("root");
        return nodePath;
      },
      getConnectedEdges: function getConnectedEdges(nodeId) {
        var connectedEdges = [];
        var edges = Object.values(this.__edges);

        for (var _i2 = 0, _edges = edges; _i2 < _edges.length; _i2++) {
          var edge = _edges[_i2];

          if (edge.getInputNodeId() === nodeId) {
            connectedEdges.push(edge.getEdgeId());
          }

          if (edge.getOutputNodeId() === nodeId) {
            connectedEdges.push(edge.getEdgeId());
          }
        }

        return connectedEdges;
      },
      getEdge: function getEdge(edgeId, node1Id, node2Id) {
        var exists = Object.prototype.hasOwnProperty.call(this.__edges, edgeId);

        if (exists) {
          return this.__edges[edgeId];
        }

        var edges = Object.values(this.__edges);

        for (var _i3 = 0, _edges2 = edges; _i3 < _edges2.length; _i3++) {
          var edge = _edges2[_i3];

          if (edge.getInputNodeId() === node1Id && edge.getOutputNodeId() === node2Id) {
            return edge;
          }
        }

        return null;
      },
      createEdge: function createEdge(edgeId, node1Id, node2Id) {
        var existingEdge = this.getEdge(edgeId, node1Id, node2Id);

        if (existingEdge) {
          return existingEdge;
        }

        if (!qxapp.data.Permissions.getInstance().canDo("study.edge.create", true)) {
          return null;
        }

        var edge = new qxapp.data.model.Edge(edgeId, node1Id, node2Id);
        this.addEdge(edge); // post edge creation

        this.getNode(node2Id).edgeAdded(edge);
        return edge;
      },
      addEdge: function addEdge(edge) {
        var edgeId = edge.getEdgeId();
        var node1Id = edge.getInputNodeId();
        var node2Id = edge.getOutputNodeId();
        var exists = this.getEdge(edgeId, node1Id, node2Id);

        if (!exists) {
          this.__edges[edgeId] = edge;
        }
      },
      createNode: function createNode(key, version, uuid, parent, populateNodeData) {
        var existingNode = this.getNode(uuid);

        if (existingNode) {
          return existingNode;
        }

        if (!qxapp.data.Permissions.getInstance().canDo("study.node.create", true)) {
          return null;
        }

        var node = new qxapp.data.model.Node(this, key, version, uuid);
        var metaData = node.getMetaData();

        if (metaData && Object.prototype.hasOwnProperty.call(metaData, "innerNodes")) {
          var innerNodeMetaDatas = Object.values(metaData["innerNodes"]);

          for (var _i4 = 0, _innerNodeMetaDatas = innerNodeMetaDatas; _i4 < _innerNodeMetaDatas.length; _i4++) {
            var innerNodeMetaData = _innerNodeMetaDatas[_i4];
            this.createNode(innerNodeMetaData.key, innerNodeMetaData.version, null, node, true);
          }
        }

        this.__initNodeSignals(node);

        if (populateNodeData) {
          node.populateNodeData();
          node.giveUniqueName();
        }

        this.addNode(node, parent);

        if (populateNodeData) {
          node.startInteractiveNode();
        }

        return node;
      },
      __initNodeSignals: function __initNodeSignals(node) {
        var _this = this;

        if (node) {
          node.addListener("showInLogger", function (e) {
            _this.fireDataEvent("showInLogger", e.getData());
          }, this);
          node.addListener("retrieveInputs", function (e) {
            _this.fireDataEvent("retrieveInputs", e.getData());
          }, this);
        }
      },
      cloneNode: function cloneNode(nodeToClone) {
        var key = nodeToClone.getKey();
        var version = nodeToClone.getVersion();
        var parentNode = this.getNode(nodeToClone.getParentNodeId());
        var node = this.createNode(key, version, null, parentNode, true);
        var nodeData = nodeToClone.serialize();
        node.setInputData(nodeData);
        node.setOutputData(nodeData);
        node.setInputNodes(nodeData);
        node.setIsOutputNode(nodeToClone.getIsOutputNode());
        return node;
      },
      addNode: function addNode(node, parentNode) {
        var uuid = node.getNodeId();

        if (parentNode) {
          parentNode.addInnerNode(uuid, node);
        } else {
          this.__nodesTopLevel[uuid] = node;
        }

        this.fireEvent("workbenchChanged");
      },
      removeNode: function removeNode(nodeId) {
        if (!qxapp.data.Permissions.getInstance().canDo("study.node.delete", true)) {
          return false;
        } // remove first the connected edges


        var connectedEdges = this.getConnectedEdges(nodeId);

        for (var i = 0; i < connectedEdges.length; i++) {
          var edgeId = connectedEdges[i];
          this.removeEdge(edgeId);
        }

        var node = this.getNode(nodeId);

        if (node) {
          node.removeNode();
          var isTopLevel = Object.prototype.hasOwnProperty.call(this.__nodesTopLevel, nodeId);

          if (isTopLevel) {
            delete this.__nodesTopLevel[nodeId];
          }

          this.fireEvent("workbenchChanged");
          return true;
        }

        return false;
      },
      removeEdge: function removeEdge(edgeId, currentNodeId) {
        if (!qxapp.data.Permissions.getInstance().canDo("study.edge.delete", true)) {
          return false;
        }

        var edge = this.getEdge(edgeId);

        if (currentNodeId !== undefined) {
          var currentNode = this.getNode(currentNodeId);

          if (currentNode && currentNode.isContainer() && edge.getOutputNodeId() === currentNode.getNodeId()) {
            var inputNode = this.getNode(edge.getInputNodeId());
            inputNode.setIsOutputNode(false); // Remove also dependencies from outter nodes

            var cNodeId = inputNode.getNodeId();
            var allNodes = this.getNodes(true);

            for (var nodeId in allNodes) {
              var node = allNodes[nodeId];

              if (node.isInputNode(cNodeId) && !currentNode.isInnerNode(node.getNodeId())) {
                this.removeEdge(edgeId);
              }
            }
          }
        }

        if (edge) {
          var inputNodeId = edge.getInputNodeId();
          var outputNodeId = edge.getOutputNodeId();

          var _node = this.getNode(outputNodeId);

          if (_node) {
            _node.removeInputNode(inputNodeId);

            delete this.__edges[edgeId];
            return true;
          }
        }

        return false;
      },
      clearProgressData: function clearProgressData() {
        var allNodes = this.getNodes(true);
        var nodes = Object.values(allNodes);

        for (var _i5 = 0, _nodes = nodes; _i5 < _nodes.length; _i5++) {
          var node = _nodes[_i5];

          if (node.isComputational() && !node.isInKey("file-picker")) {
            node.setProgress(0);
          }
        }
      },
      __deserializeWorkbench: function __deserializeWorkbench(workbenchData) {
        this.__nodesTopLevel = {};
        this.__edges = {};

        this.__deserializeNodes(workbenchData);

        this.__deserializeEdges(workbenchData);
      },
      __deserializeNodes: function __deserializeNodes(workbenchData) {
        var keys = Object.keys(workbenchData); // Create first all the nodes

        for (var i = 0; i < keys.length; i++) {
          var nodeId = keys[i];
          var nodeData = workbenchData[nodeId];

          if (nodeData.parent && nodeData.parent !== null) {
            var _parentNode = this.getNode(nodeData.parent);

            if (_parentNode === null) {
              // If parent was not yet created, delay the creation of its' children
              keys.push(nodeId); // check if there is an inconsitency

              var nKeys = keys.length;

              if (nKeys > 1) {
                if (keys[nKeys - 1] === keys[nKeys - 2]) {
                  console.log(nodeId, "will never be created, parent missing", nodeData.parent);
                  return;
                }
              }

              continue;
            }
          }

          var parentNode = null;

          if (nodeData.parent) {
            parentNode = this.getNode(nodeData.parent);
          }

          var node = null;

          if (nodeData.key) {
            // not container
            // this.createNode(nodeData.key, nodeData.version, nodeId, parentNode, false);
            node = new qxapp.data.model.Node(this, nodeData.key, nodeData.version, nodeId);
          } else {
            // container
            // this.createNode(null, null, nodeId, parentNode, false);
            node = new qxapp.data.model.Node(this, null, null, nodeId);
          }

          if (node) {
            this.__initNodeSignals(node);

            this.addNode(node, parentNode);
          }
        } // Then populate them (this will avoid issues of connecting nodes that might not be created yet)


        for (var _i6 = 0; _i6 < keys.length; _i6++) {
          var _nodeId = keys[_i6];
          var _nodeData = workbenchData[_nodeId];
          this.getNode(_nodeId).populateNodeData(_nodeData);
        }

        for (var _i7 = 0; _i7 < keys.length; _i7++) {
          var _nodeId2 = keys[_i7];
          this.getNode(_nodeId2).giveUniqueName();
        }
      },
      initWorkbench: function initWorkbench() {
        var allModels = this.getNodes(true);
        var nodes = Object.values(allModels);

        for (var _i8 = 0, _nodes2 = nodes; _i8 < _nodes2.length; _i8++) {
          var node = _nodes2[_i8];
          node.startInteractiveNode();
        }
      },
      __deserializeEdges: function __deserializeEdges(workbenchData) {
        for (var nodeId in workbenchData) {
          var nodeData = workbenchData[nodeId];
          var node = this.getNode(nodeId);

          if (node === null) {
            continue;
          }

          if (nodeData.inputNodes) {
            for (var i = 0; i < nodeData.inputNodes.length; i++) {
              var outputNodeId = nodeData.inputNodes[i];
              var edge = new qxapp.data.model.Edge(null, outputNodeId, nodeId);
              this.addEdge(edge);
              node.addInputNode(outputNodeId);
            }
          }

          if (nodeData.outputNode) {
            var _edge = new qxapp.data.model.Edge(null, nodeId, nodeData.parent);

            this.addEdge(_edge);
          }
        }
      },
      serializeWorkbench: function serializeWorkbench() {
        var saveContainers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var savePosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var workbench = {};
        var allModels = this.getNodes(true);
        var nodes = Object.values(allModels);

        for (var _i9 = 0, _nodes3 = nodes; _i9 < _nodes3.length; _i9++) {
          var node = _nodes3[_i9];
          var data = node.serialize(saveContainers, savePosition);

          if (data) {
            workbench[node.getNodeId()] = data;
          }
        }

        return workbench;
      }
    }
  });
  qxapp.data.model.Workbench.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Workbench.js.map?dt=1568886162536