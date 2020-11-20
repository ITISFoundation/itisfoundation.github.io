(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.desktop.PanelView": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Grow": {
        "construct": true
      },
      "qxapp.component.widget.inputs.NodeOutputListIcon": {},
      "qxapp.component.widget.inputs.NodeOutputTree": {}
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
   * Widget that represents the output of an input node.
   * It creates a VBox with widgets representing each of the output ports of the node.
   * It can also create widget for representing default inputs (isInputModel = false).
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let nodePorts = new qxapp.component.widget.NodePorts(node, isInputModel);
   *   this.getRoot().add(nodePorts);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.NodePorts", {
    extend: qxapp.desktop.PanelView,

    /**
     * @param node {qxapp.data.model.Node} Node owning the widget
     * @param isInputModel {Boolean} false for representing defaultInputs
     */
    construct: function construct(node) {
      var isInputModel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      this.setIsInputModel(isInputModel);
      this.setNode(node);

      this._setLayout(new qx.ui.layout.Grow());

      qxapp.desktop.PanelView.constructor.call(this, node.getLabel());
      node.bind("label", this, "title");
    },
    properties: {
      isInputModel: {
        check: "Boolean",
        init: true,
        nullable: false
      },
      node: {
        check: "qxapp.data.model.Node",
        nullable: false
      }
    },
    members: {
      getNodeId: function getNodeId() {
        return this.getNode().getNodeId();
      },
      getMetaData: function getMetaData() {
        return this.getNode().getMetaData();
      },
      populatePortsData: function populatePortsData() {
        var metaData = this.getNode().getMetaData();

        if (this.getIsInputModel()) {
          this.__createUIPorts(false, metaData.outputs);
        } else if (metaData.inputsDefault) {
          this.__createUIPorts(false, metaData.inputsDefault);
        }
      },
      __createUIPorts: function __createUIPorts(isInput, ports) {
        // Always create ports if node is a container
        if (!this.getNode().isContainer() && Object.keys(ports).length < 1) {
          return;
        }

        if (ports.defaultNeuromanModels) {
          // Maintaining NodeOutputListIcon for Neuroman
          var nodeOutputList = new qxapp.component.widget.inputs.NodeOutputListIcon(this.getNode(), ports.defaultNeuromanModels, "defaultNeuromanModels");
          this.setContent(nodeOutputList.getOutputWidget());
        } else {
          var portTree = new qxapp.component.widget.inputs.NodeOutputTree(this.getNode(), ports);
          this.setContent(portTree);
        }
      }
    }
  });
  qxapp.component.widget.NodePorts.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodePorts.js.map?dt=1568886161179