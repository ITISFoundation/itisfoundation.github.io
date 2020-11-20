(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.StringSplit": {},
      "qxapp.dev.fake.srv.db.User": {},
      "qx.lang.Json": {},
      "qx.dev.FakeServer": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "dev.enableFakeSrv": {
          "defer": true
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);
  qx.Class.define("qxapp.dev.fake.srv.restapi.User", {
    type: "static",
    statics: {
      mockData: [{
        method: "GET",
        url: "api/v1.0/user/{id}",
        response: function response(request) {
          var status = 200; // OK

          var headers = {
            "Content-Type": "application/json"
          };
          var parts = qx.util.StringSplit.split(request.url, "/");
          var userId = parts[parts.length - 1];
          var data = qxapp.dev.fake.srv.db.User.createMock(userId);
          var body = qx.lang.Json.stringify(data);
          request.respond(status, headers, body); // FIXME: unite api/v1/uisers
        }
      }, {
        method: "GET",
        url: "api/v1.0/users",
        response: function response(request) {
          var users = qxapp.dev.fake.srv.db.User.DUMMYNAMES;
          var data = [];

          for (var i = 0; i < users.length; i++) {
            data.push({
              id: i,
              username: users[i]
            });
          }

          request.respond(200, {
            "Content-Type": "application/json"
          }, qx.lang.Json.stringify(data));
        }
      }]
    },
    defer: function defer(mystatics) {
      if (qx.core.Environment.get("dev.enableFakeSrv")) {
        console.debug("REST API enabled", this.classname);
        qx.dev.FakeServer.getInstance().configure(mystatics.mockData);
      }
    }
  });
  qxapp.dev.fake.srv.restapi.User.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=User.js.map?dt=1568886163907