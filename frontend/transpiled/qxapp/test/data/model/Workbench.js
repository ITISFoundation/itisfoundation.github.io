(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.dev.unit.TestCase": {
        "require": true
      },
      "qx.dev.unit.MRequirements": {
        "require": true
      },
      "qx.dev.unit.MMock": {
        "require": true
      },
      "qxapp.data.Permissions": {},
      "qxapp.data.model.Study": {},
      "qxapp.data.model.Workbench": {}
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
   * Test Workbench class
   *
   */
  qx.Class.define("qxapp.test.data.model.Workbench", {
    extend: qx.dev.unit.TestCase,
    include: [qx.dev.unit.MRequirements, qx.dev.unit.MMock],
    members: {
      setUp: function setUp() {
        console.debug("Setting up .. ");
        this.debug("Setting up ..."); // ToDo OM: Tobi is this correct?

        qxapp.data.Permissions.getInstance().setRole("user");
        var studyData = {
          name: "Test Study",
          description: ""
        };
        var study = new qxapp.data.model.Study(studyData);
        var wbData = {};
        this.__workbench = new qxapp.data.model.Workbench(study, wbData);
      },
      tearDown: function tearDown() {
        console.debug("Tear down .. ");
        this.debug("Tear down ...");
        this.getSandbox().restore();
      },
      createDummyNode: function createDummyNode() {
        var key = null;
        var version = null;
        var uuid = null;
        var parent = null;
        var populateNodeData = true;
        return this.__workbench.createNode(key, version, uuid, parent, populateNodeData);
      },

      /*
      ---------------------- -----------------------------------------------------
        TESTS
      ---------------------------------------------------------------------------
      */
      testDuplicatedNodeConnections: function testDuplicatedNodeConnections() {
        var edgeId = null;
        var node1 = this.createDummyNode();
        var node2 = this.createDummyNode();

        var edge1 = this.__workbench.createEdge(edgeId, node1.getNodeId(), node2.getNodeId());

        var edge2 = this.__workbench.createEdge(edgeId, node1.getNodeId(), node2.getNodeId());

        this.assertIdentical(edge1.getEdgeId(), edge2.getEdgeId(), "Both edges must be the same");
      },
      testUniqueName: function testUniqueName() {
        var node1 = this.createDummyNode();
        var node2 = this.createDummyNode();
        this.assertNotIdentical(node1.getLabel(), node2.getLabel(), "Labels must be different");
      }
    }
  });
  qxapp.test.data.model.Workbench.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Workbench.js.map?dt=1568886164521