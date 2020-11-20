(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);
  qx.Class.define("qxapp.dev.fake.srv.db.Project", {
    type: "static",
    statics: {
      DUMMYNAMES: ["My EM-Simulation", "FDTD-Simulation", "Some Neuro-Simulatoin", "Clancy Model", "DemoPrj", "LF Simulation"],

      /**
       * Creates a json object for a given study id
      */
      getObject: function getObject(studyId) {
        var name = qxapp.dev.fake.srv.db.Project.DUMMYNAMES[studyId];
        var study = {
          id: studyId,
          name: name,
          description: "Short description of study " + name,
          thumbnail: "https://imgplaceholder.com/171x96/cccccc/757575/ion-plus-round",
          createdDate: new Date(1990 + name.length, 11, 25),
          modifiedDate: new Date(1990 + name.length, 12, 25)
        };
        return study;
      }
    }
  });
  qxapp.dev.fake.srv.db.Project.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Project.js.map?dt=1568886163857