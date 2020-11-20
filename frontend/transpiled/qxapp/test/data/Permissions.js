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
      "qxapp.data.model.Study": {},
      "qxapp.data.model.Workbench": {},
      "qxapp.data.Permissions": {},
      "qxapp.store.Data": {}
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
   * Test Permissions
   *
   */
  qx.Class.define("qxapp.test.data.Permissions", {
    extend: qx.dev.unit.TestCase,
    include: [qx.dev.unit.MRequirements, qx.dev.unit.MMock],
    members: {
      __workbench: null,
      setUp: function setUp() {
        console.debug("Setting up .. ");
        this.debug("Setting up ...");
      },
      tearDown: function tearDown() {
        console.debug("Tear down .. ");
        this.debug("Tear down ...");
        this.getSandbox().restore();
      },
      createEmptyWorkbench: function createEmptyWorkbench() {
        var studyData = {
          name: "Test Study",
          description: ""
        };
        var study = new qxapp.data.model.Study(studyData);
        var wbData = {};
        this.__workbench = new qxapp.data.model.Workbench(study, wbData);
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
      // test study.node.create
      testStudyNodeCreate: function testStudyNodeCreate() {
        this.createEmptyWorkbench();
        qxapp.data.Permissions.getInstance().setRole("guest");
        var anonNode = this.createDummyNode();
        this.assertNull(anonNode, "guest is not allowed to create nodes");
        qxapp.data.Permissions.getInstance().setRole("user");
        var userNode = this.createDummyNode();
        this.assertNotNull(userNode, "user is allowed to create nodes");
      },
      // test study.node.delete
      testStudyNodeDelete: function testStudyNodeDelete() {
        this.createEmptyWorkbench();
        qxapp.data.Permissions.getInstance().setRole("user");
        var dummyNode = this.createDummyNode();
        this.assertNotNull(dummyNode, "user is allowed to create nodes");
        qxapp.data.Permissions.getInstance().setRole("guest");

        var removed = this.__workbench.removeNode(dummyNode.getNodeId());

        this.assertFalse(removed, "guest is not allowed to delete nodes");
        qxapp.data.Permissions.getInstance().setRole("user");
        removed = this.__workbench.removeNode(dummyNode.getNodeId());
        this.assertTrue(removed, "user is allowed to delete nodes");
      },
      // test study.node.rename
      testStudyNodeRename: function testStudyNodeRename() {
        this.createEmptyWorkbench();
        qxapp.data.Permissions.getInstance().setRole("user");
        var node = this.createDummyNode();
        var newLabel = "my new label";
        qxapp.data.Permissions.getInstance().setRole("guest");
        node.renameNode(newLabel);
        this.assertNotIdentical(node.getLabel(), newLabel, "guest is not allowed to rename nodes");
        qxapp.data.Permissions.getInstance().setRole("user");
        node.renameNode(newLabel);
        this.assertIdentical(node.getLabel(), newLabel, "guest is not allowed to rename nodes");
      },
      // test study.edge.create
      testStudyEdgeCreate: function testStudyEdgeCreate() {
        this.createEmptyWorkbench();
        qxapp.data.Permissions.getInstance().setRole("user");
        var node1 = this.createDummyNode();
        var node2 = this.createDummyNode();
        qxapp.data.Permissions.getInstance().setRole("guest");

        var anonEdge = this.__workbench.createEdge(null, node1.getNodeId(), node2.getNodeId());

        this.assertNull(anonEdge, "guest is not allowed to create edges");
        qxapp.data.Permissions.getInstance().setRole("user");

        var userEdge = this.__workbench.createEdge(null, node1.getNodeId(), node2.getNodeId());

        this.assertNotNull(userEdge, "user is allowed to create edges");
      },
      // test study.edge.delete
      testStudyEdgeDelete: function testStudyEdgeDelete() {
        this.createEmptyWorkbench();
        qxapp.data.Permissions.getInstance().setRole("user");
        var node1 = this.createDummyNode();
        var node2 = this.createDummyNode();

        var edge = this.__workbench.createEdge(null, node1.getNodeId(), node2.getNodeId());

        qxapp.data.Permissions.getInstance().setRole("guest");

        var removed = this.__workbench.removeEdge(edge.getEdgeId());

        this.assertFalse(removed, "guest is not allowed to delete edges");
        qxapp.data.Permissions.getInstance().setRole("user");
        removed = this.__workbench.removeEdge(edge.getEdgeId());
        this.assertTrue(removed, "user is allowed to delete edges");
      },
      // test study.node.data.push
      testStudyNodeDataPush: function testStudyNodeDataPush() {
        var loc0 = "loc0";
        var file0 = "file0";
        var loc1 = "loc1";
        var file1 = "file1";
        var dataStore = qxapp.store.Data.getInstance();
        qxapp.data.Permissions.getInstance().setRole("guest");
        var req0sent = dataStore.copyFile(loc0, file0, loc1, file1);
        this.assertFalse(req0sent, "guest is not allowed to push files");
        qxapp.data.Permissions.getInstance().setRole("user");
        var req1sent = dataStore.copyFile(loc0, file0, loc1, file1);
        this.assertTrue(req1sent, "user is allowed to push files");
      },
      // test study.node.data.delete
      testStudyNodeDataDelete: function testStudyNodeDataDelete() {
        var loc0 = "loc0";
        var file0 = "file0";
        var dataStore = qxapp.store.Data.getInstance();
        qxapp.data.Permissions.getInstance().setRole("guest");
        var req0sent = dataStore.deleteFile(loc0, file0);
        this.assertFalse(req0sent, "guest is not allowed to delete files");
        qxapp.data.Permissions.getInstance().setRole("user");
        var req1sent = dataStore.deleteFile(loc0, file0);
        this.assertTrue(req1sent, "user is allowed to delete files");
      }
    }
  });
  qxapp.test.data.Permissions.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Permissions.js.map?dt=1568886164508