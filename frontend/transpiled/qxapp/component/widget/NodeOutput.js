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
   * Widget that represents what nodes need to be exposed to outside the container.
   *
   * It offers Drag&Drop mechanism for exposing inner nodes.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let nodeOutput = new qxapp.component.widget.NodeOutput(node);
   *   nodeOutput.populateNodeLayout();
   *   this.getRoot().add(nodeOutput);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.NodeOutput", {
    extend: qxapp.component.widget.NodeInOut,

    /**
      * @param node {qxapp.data.model.Node} Node owning the widget
    */
    construct: function construct(node) {
      qxapp.component.widget.NodeInOut.constructor.call(this, node);
      var atom = this.getAtom();
      this.getNode().bind("label", atom, "label", {
        converter: function converter(data) {
          return data + "'s<br>outputs";
        }
      });
    },
    members: {
      populateNodeLayout: function populateNodeLayout() {
        this.emptyPorts();
        var metaData = this.getNode().getMetaData();

        this._createUIPorts(true, metaData.inputs);
      }
    }
  });
  qxapp.component.widget.NodeOutput.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeOutput.js.map?dt=1568886161158