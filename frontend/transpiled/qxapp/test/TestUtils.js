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
      "qx.util.Base64": {}
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
       * Pedro Crespo (pcrespov)
  
  ************************************************************************ */

  /**
   *
   */
  qx.Class.define("qxapp.test.TestUtils", {
    extend: qx.dev.unit.TestCase,
    members: {
      /*
      ---------------------- -----------------------------------------------------
        TESTS
      ---------------------------------------------------------------------------
      */
      testEncDecoding: function testEncDecoding() {
        var got = qx.util.Base64.decode(qx.util.Base64.encode("foo:bar")).split(":");
        this.assertIdentical(got[0], "foo");
        this.assertIdentical(got[1], "bar");
        got = qx.util.Base64.decode(qx.util.Base64.encode("foo:")).split(":");
        this.assertIdentical(got[0], "foo");
        this.assertIdentical(got[1], "");
        got = qx.util.Base64.decode(qx.util.Base64.encode("foo:" + null)).split(":");
        this.assertIdentical(got[0], "foo");
        this.assertIdentical(got[1], "null");
      }
    }
  });
  qxapp.test.TestUtils.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=TestUtils.js.map?dt=1568886164470