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
      "qxapp.data.MimeType": {}
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
   * Test MimeType class
   *
   */
  qx.Class.define("qxapp.test.data.MimeType", {
    extend: qx.dev.unit.TestCase,
    include: [qx.dev.unit.MRequirements, qx.dev.unit.MMock],
    members: {
      setUp: function setUp() {
        console.debug("Setting up .. ");
        this.debug("Setting up ...");
      },
      tearDown: function tearDown() {
        console.debug("Tear down .. ");
        this.debug("Tear down ...");
        this.getSandbox().restore();
      },

      /*
      ---------------------- -----------------------------------------------------
        TESTS
      ---------------------------------------------------------------------------
      */
      testGetMimeType: function testGetMimeType() {
        var _this = this;

        [["image", null], ["data:*/*", "*/*"], ["data:text/csv", "text/csv"], ["data:image/svg+xml", "image/svg+xml"]].forEach(function (pair) {
          var a = qxapp.data.MimeType.getMimeType(pair[0]);

          _this.assertIdentical(a, pair[1], "should return " + pair[1]);
        }, this);
      },
      testMatch: function testMatch() {
        var aPortType = "data:*/*";
        var bPortType = "data:text/csv";
        var aMimeType = qxapp.data.MimeType.getMimeType(aPortType);
        var bMimeType = qxapp.data.MimeType.getMimeType(bPortType);
        var a = new qxapp.data.MimeType(aMimeType);
        var b = new qxapp.data.MimeType(bMimeType);
        this.assert(a.match(b), "*/* should match everything");
      }
    }
  });
  qxapp.test.data.MimeType.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=MimeType.js.map?dt=1568886164484