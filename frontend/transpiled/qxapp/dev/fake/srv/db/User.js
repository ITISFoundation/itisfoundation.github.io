(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.String": {},
      "qxapp.utils.Avatar": {},
      "qxapp.dev.fake.srv.db.Project": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);
  qx.Class.define("qxapp.dev.fake.srv.db.User", {
    type: "static",
    statics: {
      DUMMYNAMES: ["bizzy", "crespo", "anderegg", "guidon", "tobi", "maiz", "zastrow"],

      /**
       * Creates a json object for a given user id
      */
      getObject: function getObject(userId) {
        var uname = qxapp.dev.fake.srv.db.User.DUMMYNAMES[userId];
        var uemail = qxapp.dev.fake.srv.db.User.getEmail(userId);
        var user = {
          id: userId,
          username: uname,
          fullname: qx.lang.String.capitalize(uname),
          email: uemail,
          avatarUrl: qxapp.utils.Avatar.getUrl(uemail, 200),
          passwordHash: "z43",
          // This is supposed to be hashed
          projects: [] // Ids of projects associated to it

        };
        var pnames = qxapp.dev.fake.srv.db.Project.DUMMYNAMES;

        for (var i = 0; i < uname.length; i++) {
          var pid = i % pnames.length;
          user.projects.push(qxapp.dev.fake.srv.db.Project.getObject(pid));
        }

        return user;
      },
      getEmail: function getEmail(userId) {
        var userName = qxapp.dev.fake.srv.db.User.DUMMYNAMES[userId];
        var tail = "@itis.ethz.ch";

        if (userName == "tobi") {
          tail = "@oetiker.ch";
        }

        return userName + tail;
      }
    }
  });
  qxapp.dev.fake.srv.db.User.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=User.js.map?dt=1568886163867