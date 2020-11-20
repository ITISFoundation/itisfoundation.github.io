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
      "qxapp.utils.Utils": {}
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
   * Test Utils
   *
   */
  qx.Class.define("qxapp.test.utils.Utils", {
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
      },

      /*
      ---------------------- -----------------------------------------------------
        TESTS
      ---------------------------------------------------------------------------
      */
      testCompareVersionNumbers: function testCompareVersionNumbers() {
        this.assertPositiveNumber(qxapp.utils.Utils.compareVersionNumbers("1.0.1", "1.0.0"));
        this.assertPositiveNumber(-1 * qxapp.utils.Utils.compareVersionNumbers("1.0.0", "1.0.1"));
        this.assertEquals(qxapp.utils.Utils.compareVersionNumbers("1.0.1", "1.0.1"), 0);
        var unsorted = ["1.0.5", "1.0.4", "2.8.0", "2.11.0", "2.10.0", "2.9.0"];
        var sorted = ["1.0.4", "1.0.5", "2.8.0", "2.9.0", "2.10.0", "2.11.0"];
        var result = unsorted.sort(qxapp.utils.Utils.compareVersionNumbers);
        this.assertArrayEquals(sorted, result);
      }
    }
  });
  qxapp.test.utils.Utils.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Utils.js.map?dt=1568886164536