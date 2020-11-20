(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.component.widget.NodeInOut": {
        "construct": true,
        "require": true
      }
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
   * Widget that represents an input node in a container.
   *
   * It offers Drag&Drop mechanism for connecting input nodes to inner nodes.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let nodeInput = new qxapp.component.widget.NodeInput(node);
   *   nodeInput.populateNodeLayout();
   *   this.getRoot().add(nodeInput);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.NodeInput", {
    extend: qxapp.component.widget.NodeInOut,

    /**
      * @param node {qxapp.data.model.Node} Node owning the widget
    */
    construct: function construct(node) {
      qxapp.component.widget.NodeInOut.constructor.call(this, node);
      var atom = this.getAtom();
      this.getNode().bind("label", atom, "label");
    },
    members: {
      populateNodeLayout: function populateNodeLayout() {
        this.emptyPorts();
        var metaData = this.getNode().getMetaData();

        this._createUIPorts(false, metaData.outputs);
      }
    }
  });
  qxapp.component.widget.NodeInput.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeInput.js.map?dt=1568886161142