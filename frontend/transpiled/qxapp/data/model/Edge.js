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
      "qxapp.utils.Utils": {
        "construct": true
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
   * Class that stores Edge data.
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
   *   let edge = new qxapp.data.model.Edge(edgeId, node1Id, node2Id);
   * </pre>
   */
  qx.Class.define("qxapp.data.model.Edge", {
    extend: qx.core.Object,

    /**
      * @param edgeId {String} uuid if the edge. If not provided, a random one will be assigned
      * @param node1Id {String} uuid of the node where the edge comes from
      * @param node2Id {String} uuid of the node where the edge goes to
    */
    construct: function construct(edgeId, node1Id, node2Id) {
      qx.core.Object.constructor.call(this);
      this.setEdgeId(edgeId || qxapp.utils.Utils.uuidv4());
      this.setInputNodeId(node1Id);
      this.setOutputNodeId(node2Id);
    },
    properties: {
      edgeId: {
        check: "String",
        nullable: false
      },
      inputNodeId: {
        init: null,
        check: "String"
      },
      outputNodeId: {
        init: null,
        check: "String"
      }
    }
  });
  qxapp.data.model.Edge.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Edge.js.map?dt=1568886162227