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
      "qxapp.dev.fake.srv.db.User": {},
      "qx.lang.Json": {},
      "qx.util.Base64": {},
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
  qx.Class.define("qxapp.dev.fake.srv.restapi.Authentication", {
    type: "static",
    statics: {
      REMEMBER: false,
      mockData: [{
        method: "GET",
        url: "api/v1.0/token",
        response: function response(request) {
          console.log("Received request:", request); // Defaults unauthorized

          var status = 401;
          var headers = {
            "Content-Type": "application/json"
          };
          var body = null;
          var login = qxapp.dev.fake.srv.restapi.Authentication.decodeAuthHeader(request.requestHeaders);
          var userId = qxapp.dev.fake.srv.restapi.Authentication.checkCredentials(login);

          if (userId !== null) {
            console.debug("User ", qxapp.dev.fake.srv.db.User.DUMMYNAMES[userId], "is logging in ...");
            status = 200;
            body = {
              token: qxapp.dev.fake.srv.restapi.Authentication.createToken(userId)
            };
          }

          request.respond(status, headers, qx.lang.Json.stringify(body));
        }
      }],
      createToken: function createToken(userId) {
        var expiration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 24;
        return "this-is-a-dummy-token-that-expires-in-" + String(expiration) + "hours-for-" + String(userId);
      },
      getUserIdFromToken: function getUserIdFromToken(token) {
        if (token.startsWith("this-is-a-dummy-token-that-expires-in-")) {
          var parts = token.split("-");
          return parts.pop();
        }

        return null;
      },
      checkCredentials: function checkCredentials(login) {
        var userId = qxapp.dev.fake.srv.db.User.DUMMYNAMES.findIndex(function (userName, userIndex) {
          var user = qxapp.dev.fake.srv.db.User.getObject(userIndex);
          return (login.email == user.email || login.email == user.username) && login.password == user.passwordHash;
        });
        return userId >= 0 ? userId : null;
      },

      /**
       * Gets {email, password} from header
       * produced by qx.io.request.authentication.Basic
      */
      decodeAuthHeader: function decodeAuthHeader(requestHeaders) {
        var res = {
          email: null,
          password: null
        };
        var header = requestHeaders["Authorization"]; // Remove 'Basic $value'

        var value = header.split(" ")[1]; // parse '$username : $password'

        var pair = qx.util.Base64.decode(value).split(":");
        res.email = pair[0];
        res.password = pair[1];
        return res;
      },

      /**
       * Parse {email:, password:} object extracting
       * parameters from body
       *
      */
      parseLoginParameters: function parseLoginParameters(requestBody) {
        var res = {
          email: null,
          password: null
        };
        var vars = requestBody.split("&");

        for (var i = 0; i < vars.length; ++i) {
          var pair = vars[i].split("=");
          res[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }

        return res;
      }
    },
    defer: function defer(mystatics) {
      if (qx.core.Environment.get("dev.enableFakeSrv")) {
        console.debug("REST API Authentication enabled");
        qx.dev.FakeServer.getInstance().configure(mystatics.mockData);
      }
    }
  });
  qxapp.dev.fake.srv.restapi.Authentication.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Authentication.js.map?dt=1568886163889