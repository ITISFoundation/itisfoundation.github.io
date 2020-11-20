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
      "qx.locale.MTranslation": {
        "require": true
      },
      "qxapp.utils.Utils": {
        "construct": true
      },
      "qxapp.store.Store": {
        "construct": true
      },
      "qxapp.component.widget.NodePorts": {},
      "qxapp.component.widget.InputsMapper": {},
      "qxapp.component.form.Auto": {},
      "qxapp.component.form.renderer.PropForm": {},
      "qxapp.data.Permissions": {},
      "qxapp.component.widget.PersistentIframe": {},
      "qx.io.request.Xhr": {},
      "qx.util.Serializer": {},
      "qx.ui.toolbar.Button": {},
      "qxapp.io.request.ApiRequest": {},
      "qx.event.Timer": {}
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
   * Class that stores Node data.
   *
   *   For the given version-key, this class will take care of pulling the metadata, store it and
   * fill in all the information.
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
   *   let node = new qxapp.data.model.Node(this, key, version, uuid);
   *   node.populateNodeData(nodeData);
   *   node.giveUniqueName();
   *   node.startInteractiveNode();
   * </pre>
   */
  qx.Class.define("qxapp.data.model.Node", {
    extend: qx.core.Object,
    include: qx.locale.MTranslation,

    /**
      * @param workbench {qxapp.data.model.Workbench} workbench owning the widget the node
      * @param key {String} key of the service represented by the node
      * @param version {String} version of the service represented by the node
      * @param uuid {String} uuid of the service represented by the node (not needed for new Nodes)
    */
    construct: function construct(workbench, key, version, uuid) {
      this.setWorkbench(workbench);
      qx.core.Object.constructor.call(this);
      this.__metaData = {};
      this.__innerNodes = {};
      this.__inputNodes = [];
      this.__inputsDefault = {};
      this.__outputs = {};
      this.set({
        nodeId: uuid || qxapp.utils.Utils.uuidv4(),
        key: key,
        version: version
      });
      var store = qxapp.store.Store.getInstance();
      var metaData = this.__metaData = store.getNodeMetaData(key, version);

      if (metaData) {
        if (metaData.name) {
          this.setLabel(metaData.name);
        }

        if (metaData.inputsDefault) {
          this.__addInputsDefault(metaData.inputsDefault);
        }

        if (metaData.inputs) {
          this.__addInputs(metaData.inputs);
        }

        if (metaData.outputs) {
          this.__addOutputs(metaData.outputs);
        }

        if (metaData.dedicatedWidget) {
          this.setDedicatedWidget(metaData.dedicatedWidget);
        }
      }
    },
    properties: {
      workbench: {
        check: "qxapp.data.model.Workbench",
        nullable: false
      },
      key: {
        check: "String",
        nullable: true
      },
      version: {
        check: "String",
        nullable: true
      },
      nodeId: {
        check: "String",
        nullable: false
      },
      label: {
        check: "String",
        init: "Node",
        nullable: true,
        event: "changeLabel"
      },
      propsWidget: {
        check: "qxapp.component.form.renderer.PropForm",
        init: null,
        nullable: true
      },
      inputAccess: {
        check: "Object",
        nullable: true
      },
      inputsMapper: {
        check: "qx.ui.core.Widget",
        init: null,
        nullable: true
      },
      parentNodeId: {
        check: "String",
        nullable: true
      },
      dedicatedWidget: {
        check: "Boolean",
        init: null,
        nullable: true
      },
      isOutputNode: {
        check: "Boolean",
        init: false,
        nullable: false
      },
      serviceUrl: {
        check: "String",
        nullable: true,
        event: "changeServiceUrl"
      },
      iFrame: {
        check: "qxapp.component.widget.PersistentIframe",
        init: null,
        nullable: true
      },
      restartIFrameButton: {
        check: "qx.ui.form.Button",
        init: null
      },
      retrieveIFrameButton: {
        check: "qx.ui.form.Button",
        init: null
      },
      progress: {
        check: "Number",
        init: 0,
        event: "changeProgress"
      },
      thumbnail: {
        check: "String",
        nullable: true,
        init: ""
      },
      interactiveStatus: {
        check: "String",
        nullable: true,
        event: "changeInteractiveStatus"
      }
    },
    events: {
      "retrieveInputs": "qx.event.type.Data",
      "showInLogger": "qx.event.type.Data"
    },
    statics: {
      isDynamic: function isDynamic(metaData) {
        return metaData && metaData.type && metaData.type === "dynamic";
      },
      isComputational: function isComputational(metaData) {
        return metaData && metaData.type && metaData.type === "computational";
      },
      isRealService: function isRealService(metaData) {
        return metaData && metaData.type && (metaData.key.includes("simcore/services/dynamic") || metaData.key.includes("simcore/services/comp"));
      }
    },
    members: {
      __metaData: null,
      __innerNodes: null,
      __inputNodes: null,
      __settingsForm: null,
      __inputsDefault: null,
      __inputsDefaultWidget: null,
      __outputs: null,
      __outputWidget: null,
      __posX: null,
      __posY: null,
      isInKey: function isInKey(str) {
        if (this.getMetaData() === null) {
          return false;
        }

        if (this.getKey() === null) {
          return false;
        }

        return this.getKey().includes(str);
      },
      hasDedicatedWidget: function hasDedicatedWidget() {
        if (this.getDedicatedWidget() === null) {
          return false;
        }

        return true;
      },
      showDedicatedWidget: function showDedicatedWidget() {
        if (this.hasDedicatedWidget()) {
          return this.getDedicatedWidget();
        }

        return false;
      },
      isContainer: function isContainer() {
        var hasKey = this.getKey() === null;
        var hasChildren = this.hasChildren();
        return hasKey || hasChildren;
      },
      isDynamic: function isDynamic() {
        return qxapp.data.model.Node.isDynamic(this.getMetaData());
      },
      isComputational: function isComputational() {
        return qxapp.data.model.Node.isComputational(this.getMetaData());
      },
      isRealService: function isRealService() {
        return qxapp.data.model.Node.isRealService(this.getMetaData());
      },
      getMetaData: function getMetaData() {
        return this.__metaData;
      },
      getInputValues: function getInputValues() {
        if (this.isPropertyInitialized("propsWidget") && this.getPropsWidget()) {
          return this.getPropsWidget().getValues();
        }

        return {};
      },
      getInputsDefault: function getInputsDefault() {
        return this.__inputsDefault;
      },
      getInput: function getInput(outputId) {
        return this.__inputs[outputId];
      },
      getInputs: function getInputs() {
        return this.__inputs;
      },
      getOutput: function getOutput(outputId) {
        return this.__outputs[outputId];
      },
      getOutputs: function getOutputs() {
        return this.__outputs;
      },
      getOutputValues: function getOutputValues() {
        var output = {};

        for (var outputId in this.__outputs) {
          if (this.__outputs[outputId].value) {
            output[outputId] = this.__outputs[outputId].value;
          }
        }

        return output;
      },
      hasChildren: function hasChildren() {
        var innerNodes = this.getInnerNodes();

        if (innerNodes) {
          return Object.keys(innerNodes).length > 0;
        }

        return false;
      },
      getInnerNodes: function getInnerNodes() {
        var recursive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var innerNodes = Object.assign({}, this.__innerNodes);

        if (recursive) {
          for (var innerNodeId in this.__innerNodes) {
            var myInnerNodes = this.__innerNodes[innerNodeId].getInnerNodes(true);

            innerNodes = Object.assign(innerNodes, myInnerNodes);
          }
        }

        return innerNodes;
      },
      addInnerNode: function addInnerNode(innerNodeId, innerNode) {
        this.__innerNodes[innerNodeId] = innerNode;
        innerNode.setParentNodeId(this.getNodeId());
      },
      removeInnerNode: function removeInnerNode(innerNodeId) {
        delete this.__innerNodes[innerNodeId];
      },
      isInnerNode: function isInnerNode(inputNodeId) {
        return inputNodeId in this.__innerNodes;
      },
      getExposedInnerNodes: function getExposedInnerNodes() {
        var recursive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var innerNodes = this.getInnerNodes(recursive);
        var exposedInnerNodes = {};

        for (var innerNodeId in innerNodes) {
          var innerNode = innerNodes[innerNodeId];

          if (innerNode.getIsOutputNode()) {
            exposedInnerNodes[innerNodeId] = innerNode;
          }
        }

        return exposedInnerNodes;
      },
      getInputNodes: function getInputNodes() {
        return this.__inputNodes;
      },
      populateNodeData: function populateNodeData(nodeData) {
        if (nodeData) {
          if (nodeData.label) {
            this.setLabel(nodeData.label);
          }

          this.setInputData(nodeData);
          this.setOutputData(nodeData);

          if (nodeData.inputNodes) {
            this.setInputNodes(nodeData);
          }

          if (nodeData.outputNode) {
            this.setIsOutputNode(nodeData.outputNode);
          }

          if (nodeData.position) {
            this.setPosition(nodeData.position.x, nodeData.position.y);
          }

          if (nodeData.progress) {
            this.setProgress(nodeData.progress);
          }

          if (nodeData.thumbnail) {
            this.setThumbnail(nodeData.thumbnail);
          }
        }

        if (this.__inputsDefaultWidget) {
          this.__inputsDefaultWidget.populatePortsData();
        }

        if (this.__outputWidget) {
          this.__outputWidget.populatePortsData();
        }
      },
      giveUniqueName: function giveUniqueName() {
        var label = this.getLabel();

        this.__giveUniqueName(label, 2);
      },
      __giveUniqueName: function __giveUniqueName(label, suffix) {
        var newLabel = label + "_" + suffix;
        var allModels = this.getWorkbench().getNodes(true);
        var nodes = Object.values(allModels);

        for (var _i = 0, _nodes = nodes; _i < _nodes.length; _i++) {
          var node = _nodes[_i];

          if (node.getNodeId() !== this.getNodeId() && node.getLabel().localeCompare(this.getLabel()) === 0) {
            this.setLabel(newLabel);

            this.__giveUniqueName(label, suffix + 1);
          }
        }
      },
      repopulateOutputPortData: function repopulateOutputPortData() {
        if (this.__outputWidget) {
          this.__outputWidget.populatePortsData();
        }
      },
      getInputsDefaultWidget: function getInputsDefaultWidget() {
        return this.__inputsDefaultWidget;
      },
      __addInputsDefaultWidgets: function __addInputsDefaultWidgets() {
        var isInputModel = false;
        this.__inputsDefaultWidget = new qxapp.component.widget.NodePorts(this, isInputModel);
      },

      /**
       * Remove those inputs that can't be respresented in the settings form
       * (Those are needed for creating connections between nodes)
       *
       */
      __removeNonSettingInputs: function __removeNonSettingInputs(inputs) {
        var filteredInputs = JSON.parse(JSON.stringify(inputs));

        for (var inputId in filteredInputs) {
          var input = filteredInputs[inputId];

          if (input.type.includes("data:application/s4l-api/")) {
            delete filteredInputs[inputId];
          }
        }

        return filteredInputs;
      },

      /**
       * Add mapper widget if any
       *
       */
      __addMapper: function __addMapper(inputs) {
        var filteredInputs = JSON.parse(JSON.stringify(inputs));

        if (filteredInputs.mapper) {
          var inputsMapper = new qxapp.component.widget.InputsMapper(this, filteredInputs["mapper"]);
          this.setInputsMapper(inputsMapper);
          delete filteredInputs["mapper"];
        }

        return filteredInputs;
      },

      /**
       * Add settings widget with those inputs that can be represented in a form
       *
       */
      __addSettings: function __addSettings(inputs) {
        var _this = this;

        var form = this.__settingsForm = new qxapp.component.form.Auto(inputs, this);
        form.addListener("linkAdded", function (e) {
          var changedField = e.getData();

          _this.getPropsWidget().linkAdded(changedField);
        }, this);
        form.addListener("linkRemoved", function (e) {
          var changedField = e.getData();

          _this.getPropsWidget().linkRemoved(changedField);
        }, this);
        var propsWidget = new qxapp.component.form.renderer.PropForm(form, this.getWorkbench(), this);
        this.setPropsWidget(propsWidget);
        propsWidget.addListener("removeLink", function (e) {
          var changedField = e.getData();

          _this.__settingsForm.removeLink(changedField);
        }, this);
        propsWidget.addListener("dataFieldModified", function (e) {
          var portId = e.getData();

          _this.__retrieveInputs(portId);
        }, this);
      },
      getOutputWidget: function getOutputWidget() {
        return this.__outputWidget;
      },
      __addOutputWidget: function __addOutputWidget() {
        var isInputModel = true;
        this.__outputWidget = new qxapp.component.widget.NodePorts(this, isInputModel);
      },
      __addInputsDefault: function __addInputsDefault(inputsDefault) {
        this.__inputsDefault = inputsDefault;

        this.__addInputsDefaultWidgets();
      },
      __addInputs: function __addInputs(inputs) {
        this.__inputs = inputs;

        if (inputs === null) {
          return;
        }

        var filteredInputs = this.__removeNonSettingInputs(inputs);

        filteredInputs = this.__addMapper(filteredInputs);

        this.__addSettings(filteredInputs);
      },
      __addOutputs: function __addOutputs(outputs) {
        this.__outputs = outputs;

        this.__addOutputWidget();
      },
      setInputData: function setInputData(nodeData) {
        if (this.__settingsForm && nodeData) {
          this.__settingsForm.setData(nodeData.inputs);

          if ("inputAccess" in nodeData) {
            this.__settingsForm.setAccessLevel(nodeData.inputAccess);

            this.setInputAccess(nodeData.inputAccess);
          }
        }
      },
      setOutputData: function setOutputData(nodeData) {
        if (nodeData.outputs) {
          for (var outputKey in nodeData.outputs) {
            this.__outputs[outputKey].value = nodeData.outputs[outputKey];
          }
        }
      },
      // post edge creation routine
      edgeAdded: function edgeAdded(edge) {
        if (this.isInKey("multi-plot")) {
          var inputNode = this.getWorkbench().getNode(edge.getInputNodeId());
          var innerNodes = Object.values(this.getInnerNodes());

          for (var i = 0; i < innerNodes.length; i++) {
            var innerNode = innerNodes[i];

            if (innerNode.addInputNode(inputNode.getNodeId())) {
              this.createAutomaticPortConns(inputNode, innerNode);
            }
          }

          this.__retrieveInputs();
        }
      },
      createAutomaticPortConns: function createAutomaticPortConns(node1, node2) {
        // create automatic port connections
        console.log("createAutomaticPortConns", node1, node2);
        var outPorts = node1.getOutputs();
        var inPorts = node2.getInputs();

        for (var outPort in outPorts) {
          for (var inPort in inPorts) {
            if (qxapp.store.Store.getInstance().arePortsCompatible(outPorts[outPort], inPorts[inPort])) {
              if (node2.addPortLink(inPort, node1.getNodeId(), outPort)) {
                break;
              }
            }
          }
        }
      },
      addPortLink: function addPortLink(toPortId, fromNodeId, fromPortId) {
        return this.__settingsForm.addLink(toPortId, fromNodeId, fromPortId);
      },
      addInputNode: function addInputNode(inputNodeId) {
        if (!this.__inputNodes.includes(inputNodeId)) {
          this.__inputNodes.push(inputNodeId);

          return true;
        }

        return false;
      },
      setInputNodes: function setInputNodes(nodeData) {
        if (nodeData.inputNodes) {
          for (var i = 0; i < nodeData.inputNodes.length; i++) {
            this.addInputNode(nodeData.inputNodes[i]);
          }
        }
      },
      removeInputNode: function removeInputNode(inputNodeId) {
        var index = this.__inputNodes.indexOf(inputNodeId);

        if (index > -1) {
          // remove node connection
          this.__inputNodes.splice(index, 1); // remove port connections


          var inputs = this.getInputValues();

          for (var portId in inputs) {
            if (inputs[portId] && Object.prototype.hasOwnProperty.call(inputs[portId], "nodeUuid")) {
              if (inputs[portId]["nodeUuid"] === inputNodeId) {
                this.__settingsForm.removeLink(portId);
              }
            }
          }

          return true;
        }

        return false;
      },
      isInputNode: function isInputNode(inputNodeId) {
        var index = this.__inputNodes.indexOf(inputNodeId);

        return index > -1;
      },
      renameNode: function renameNode(newLabel) {
        if (!qxapp.data.Permissions.getInstance().canDo("study.node.rename", true)) {
          return false;
        }

        this.setLabel(newLabel);
        return true;
      },
      restartIFrame: function restartIFrame(loadThis) {
        var _this2 = this;

        if (this.getIFrame() === null) {
          this.setIFrame(new qxapp.component.widget.PersistentIframe());
        }

        if (loadThis) {
          this.getIFrame().resetSource();
          this.getIFrame().setSource(loadThis);
        } else if (this.getServiceUrl() !== null) {
          this.getIFrame().resetSource();

          if (this.getKey().includes("3d-viewer")) {
            // HACK: add this argument to only load the defined colorMaps
            // https://github.com/Kitware/visualizer/commit/197acaf
            var srvUrl = this.getServiceUrl();
            var arg = "?serverColorMaps";

            if (srvUrl[srvUrl.length - 1] !== "/") {
              arg = "/" + arg;
            }

            this.getIFrame().setSource(srvUrl + arg);
          } else {
            this.getIFrame().setSource(this.getServiceUrl());
          }

          if (this.getKey().includes("raw-graphs")) {
            // Listen to the postMessage from RawGraphs, posting a new graph
            window.addEventListener("message", function (e) {
              var _e$data = e.data,
                  id = _e$data.id,
                  imgData = _e$data.imgData;

              if (imgData && id === "svgChange") {
                var img = document.createElement("img");
                img.src = imgData;

                _this2.setThumbnail(img.outerHTML);
              }
            }, false);
          }
        }
      },
      __showLoadingIFrame: function __showLoadingIFrame() {
        var loadingUri = qxapp.utils.Utils.getLoaderUri();
        this.restartIFrame(loadingUri);
      },
      __retrieveInputs: function __retrieveInputs(portKey) {
        var data = {
          node: this,
          portKey: portKey
        };
        this.fireDataEvent("retrieveInputs", data);
      },
      retrieveInputs: function retrieveInputs() {
        var _this3 = this;

        var portKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (this.isDynamic() && this.isRealService()) {
          if (!qxapp.data.Permissions.getInstance().canDo("study.update")) {
            return;
          }

          var srvUrl = this.getServiceUrl();

          if (srvUrl) {
            var urlUpdate = srvUrl + "/retrieve";
            urlUpdate = urlUpdate.replace("//retrieve", "/retrieve");
            var updReq = new qx.io.request.Xhr();
            var reqData = {
              "port_keys": portKey ? [portKey] : []
            };
            updReq.set({
              url: urlUpdate,
              method: "POST",
              requestData: qx.util.Serializer.toJson(reqData)
            });
            updReq.addListener("success", function (e) {
              var _e$getTarget$getRespo = e.getTarget().getResponse(),
                  data = _e$getTarget$getRespo.data;

              _this3.getPropsWidget().retrievedPortData(portKey, true);

              console.log(data);
            }, this);
            updReq.addListener("fail", function (e) {
              var _e$getTarget$getRespo2 = e.getTarget().getResponse(),
                  error = _e$getTarget$getRespo2.error;

              _this3.getPropsWidget().retrievedPortData(portKey, false);

              console.error("fail", error);
            }, this);
            updReq.addListener("error", function (e) {
              var _e$getTarget$getRespo3 = e.getTarget().getResponse(),
                  error = _e$getTarget$getRespo3.error;

              _this3.getPropsWidget().retrievedPortData(portKey, false);

              console.error("error", error);
            }, this);
            updReq.send();
            this.getPropsWidget().retrievingPortData(portKey);
          }
        }
      },
      startInteractiveNode: function startInteractiveNode() {
        var _this4 = this;

        if (this.isDynamic() && this.isRealService()) {
          var retrieveBtn = new qx.ui.toolbar.Button(this.tr("Retrieve"), "@FontAwesome5Solid/spinner/14");
          retrieveBtn.addListener("execute", function (e) {
            _this4.__retrieveInputs();
          }, this);
          retrieveBtn.setEnabled(false);
          this.setRetrieveIFrameButton(retrieveBtn);
          var restartBtn = new qx.ui.toolbar.Button(this.tr("Restart"), "@FontAwesome5Solid/redo-alt/14");
          restartBtn.addListener("execute", function (e) {
            _this4.restartIFrame();
          }, this);
          restartBtn.setEnabled(false);
          this.setRestartIFrameButton(restartBtn);

          this.__showLoadingIFrame();

          this.__startService();
        }
      },
      __startService: function __startService() {
        var _this5 = this;

        var metaData = this.getMetaData();
        var msg = "Starting " + metaData.key + ":" + metaData.version + "...";
        var msgData = {
          nodeId: this.getNodeId(),
          msg: msg
        };
        this.fireDataEvent("showInLogger", msgData);
        this.setProgress(0);
        this.setInteractiveStatus("starting");
        var prjId = this.getWorkbench().getStudy().getUuid(); // start the service

        var url = "/running_interactive_services";
        var query = "?project_id=" + encodeURIComponent(prjId);
        query += "&service_uuid=" + encodeURIComponent(this.getNodeId());

        if (metaData.key.includes("/neuroman")) {
          // HACK: Only Neuroman should enter here
          query += "&service_key=" + encodeURIComponent("simcore/services/dynamic/modeler/webserver");
          query += "&service_tag=" + encodeURIComponent("2.8.0");
        } else {
          query += "&service_key=" + encodeURIComponent(metaData.key);
          query += "&service_tag=" + encodeURIComponent(metaData.version);
        }

        var request = new qxapp.io.request.ApiRequest(url + query, "POST");
        request.addListener("success", this.__onInteractiveNodeStarted, this);
        request.addListener("error", function (e) {
          var errorMsg = "Error when starting " + metaData.key + ":" + metaData.version + ": " + e.getTarget().getResponse()["error"];
          var errorMsgData = {
            nodeId: _this5.getNodeId(),
            msg: errorMsg
          };

          _this5.fireDataEvent("showInLogger", errorMsgData);

          _this5.setInteractiveStatus("failed");
        }, this);
        request.addListener("fail", function (e) {
          var failMsg = "Failed starting " + metaData.key + ":" + metaData.version + ": " + e.getTarget().getResponse()["error"];
          var failMsgData = {
            nodeId: _this5.getNodeId(),
            msg: failMsg
          };

          _this5.setInteractiveStatus("failed");

          _this5.fireDataEvent("showInLogger", failMsgData);
        }, this);
        request.send();
      },
      __onNodeState: function __onNodeState(e) {
        var _this6 = this;

        var req = e.getTarget();

        var _req$getResponse = req.getResponse(),
            data = _req$getResponse.data,
            error = _req$getResponse.error;

        if (error) {
          var msg = "Error received: " + error;
          var msgData = {
            nodeId: this.getNodeId(),
            msg: msg
          };
          this.setInteractiveStatus("failed");
          this.fireDataEvent("showInLogger", msgData);
          return;
        }

        var serviceState = data["service_state"];

        switch (serviceState) {
          case "starting":
          case "pulling":
            {
              this.setInteractiveStatus("starting");
              var interval = 5000;
              qx.event.Timer.once(function () {
                return _this6.__nodeState();
              }, this, interval);
              break;
            }

          case "pending":
            {
              this.setInteractiveStatus("pending");
              var _interval = 10000;
              qx.event.Timer.once(function () {
                return _this6.__nodeState();
              }, this, _interval);
              break;
            }

          case "running":
            {
              // const publishedPort = data["published_port"];
              var servicePath = data["service_basepath"];
              var entryPointD = data["entry_point"];
              var nodeId = data["service_uuid"];

              if (nodeId !== this.getNodeId()) {
                return;
              }

              if (servicePath) {
                var entryPoint = entryPointD ? "/" + entryPointD : "/";
                var srvUrl = servicePath + entryPoint; // FIXME: this is temporary until the reverse proxy works for these services
                // if (this.getKey().includes("neuroman") || this.getKey().includes("modeler")) {
                //   srvUrl = "http://" + window.location.hostname + ":" + publishedPort + srvUrl;
                // }

                this.__serviceReadyIn(srvUrl);
              }

              break;
            }

          case "complete":
            break;

          case "failed":
            {
              this.setInteractiveStatus("failed");

              var _msg = "Service failed: " + data["service_message"];

              var _msgData = {
                nodeId: this.getNodeId(),
                msg: _msg
              };
              this.fireDataEvent("showInLogger", _msgData);
              return;
            }

          default:
            break;
        }
      },
      __nodeState: function __nodeState() {
        var _this7 = this;

        var url = "/running_interactive_services/" + encodeURIComponent(this.getNodeId());
        var request = new qxapp.io.request.ApiRequest(url, "GET");
        request.addListener("success", this.__onNodeState, this);
        request.addListener("error", function (e) {
          var errorMsg = "Error when starting " + _this7.getKey() + ":" + _this7.getVersion() + ": " + e.getTarget().getResponse()["error"];
          var errorMsgData = {
            nodeId: _this7.getNodeId(),
            msg: errorMsg
          };

          _this7.fireDataEvent("showInLogger", errorMsgData);
        }, this);
        request.addListener("fail", function (e) {
          var failMsg = "Failed starting " + _this7.getKey() + ":" + _this7.getVersion() + ": " + e.getTarget().getResponse()["error"];
          var failMsgData = {
            nodeId: _this7.getNodeId(),
            msg: failMsg
          };

          _this7.fireDataEvent("showInLogger", failMsgData);
        }, this);
        request.send();
      },
      __onInteractiveNodeStarted: function __onInteractiveNodeStarted(e) {
        var req = e.getTarget();

        var _req$getResponse2 = req.getResponse(),
            error = _req$getResponse2.error;

        if (error) {
          var msg = "Error received: " + error;
          var msgData = {
            nodeId: this.getNodeId(),
            msg: msg
          };
          this.fireDataEvent("showInLogger", msgData);
          return;
        }

        this.__nodeState();
      },
      __serviceReadyIn: function __serviceReadyIn(srvUrl) {
        var _this8 = this;

        this.setServiceUrl(srvUrl);
        this.setInteractiveStatus("ready");
        var msg = "Service ready on " + srvUrl;
        var msgData = {
          nodeId: this.getNodeId(),
          msg: msg
        };
        this.fireDataEvent("showInLogger", msgData);
        this.getRetrieveIFrameButton().setEnabled(true);
        this.getRestartIFrameButton().setEnabled(true);
        this.setProgress(100); // FIXME: Apparently no all services are inmediately ready when they publish the port

        var waitFor = 4000;
        qx.event.Timer.once(function (ev) {
          _this8.restartIFrame();
        }, this, waitFor);

        this.__retrieveInputs();
      },
      removeNode: function removeNode() {
        this.stopInteractiveService();
        var innerNodes = Object.values(this.getInnerNodes());

        for (var _i2 = 0, _innerNodes = innerNodes; _i2 < _innerNodes.length; _i2++) {
          var innerNode = _innerNodes[_i2];
          innerNode.removeNode();
        }

        var parentNodeId = this.getParentNodeId();

        if (parentNodeId) {
          var parentNode = this.getWorkbench().getNode(parentNodeId);
          parentNode.removeInnerNode(this.getNodeId());
        }
      },
      removeIFrame: function removeIFrame() {
        var iFrame = this.getIFrame();

        if (iFrame) {
          iFrame.destroy();
          this.setIFrame(null);
        }
      },
      stopInteractiveService: function stopInteractiveService() {
        if (this.isDynamic() && this.isRealService()) {
          var store = qxapp.store.Store.getInstance();
          store.stopInteractiveService(this.getNodeId());
          this.removeIFrame();
        }
      },
      setPosition: function setPosition(x, y) {
        this.__posX = x;
        this.__posY = y;
      },
      getPosition: function getPosition() {
        return {
          x: this.__posX,
          y: this.__posY
        };
      },
      serialize: function serialize(saveContainers, savePosition) {
        if (!saveContainers && this.isContainer()) {
          return null;
        } // node generic


        var nodeEntry = {
          key: this.getKey(),
          version: this.getVersion(),
          label: this.getLabel(),
          inputs: this.getInputValues(),
          inputAccess: this.getInputAccess(),
          inputNodes: this.getInputNodes(),
          outputNode: this.getIsOutputNode(),
          outputs: this.getOutputValues(),
          parent: this.getParentNodeId(),
          progress: this.getProgress(),
          thumbnail: this.getThumbnail()
        };

        if (savePosition) {
          nodeEntry.position = {
            x: this.getPosition().x,
            y: this.getPosition().y
          };
        } // remove null entries from the payload


        var filteredNodeEntry = {};

        for (var key in nodeEntry) {
          if (nodeEntry[key] !== null) {
            filteredNodeEntry[key] = nodeEntry[key];
          }
        }

        return filteredNodeEntry;
      }
    }
  });
  qxapp.data.model.Node.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Node.js.map?dt=1568886162420