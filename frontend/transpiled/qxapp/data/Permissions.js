(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qxapp.component.message.FlashMessenger": {},
      "qxapp.io.rest.ResourceFactory": {}
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
   * Singleton class for building Permission table and check doable operations.
   *
   * It implements HRBAC (Hierarchical Role Based Access Control) permission model.
   *
   * It is able to:
   * - add Actions to build a table of permissions
   * - load User's Role from the backend
   * - check whether a role can do a specific actions
   *
   * *Example*
   *
   * Here is a little example of how to use the class.
   *
   * <pre class='javascript'>
   *   qxapp.data.Permissions.getInstance().canDo("study.start", true)
   * </pre>
   */
  qx.Class.define("qxapp.data.Permissions", {
    extend: qx.core.Object,
    type: "singleton",
    construct: function construct() {
      var _this = this;

      var initPermissions = this.__getInitPermissions();

      var _loop = function _loop(role) {
        if (Object.prototype.hasOwnProperty.call(initPermissions, role)) {
          initPermissions[role].forEach(function (action) {
            _this.addAction(role, action);
          }, _this);
        }
      };

      for (var role in initPermissions) {
        _loop(role);
      }
    },
    events: {
      "userProfileRecieved": "qx.event.type.Event"
    },
    statics: {
      ACTIONS: {},
      ROLES: {
        anonymous: {
          can: [],
          inherits: []
        },
        guest: {
          can: [],
          inherits: ["anonymous"]
        },
        user: {
          can: [],
          inherits: ["guest"]
        },
        tester: {
          can: [],
          inherits: ["user"]
        },
        admin: {
          can: [],
          inherits: ["tester"]
        }
      }
    },
    members: {
      __userRole: null,
      __userLogin: null,
      getRole: function getRole() {
        return this.__userRole;
      },
      setRole: function setRole(role) {
        if (!qxapp.data.Permissions.ROLES[role]) {
          return;
        }

        this.__userRole = role;
      },
      getLogin: function getLogin() {
        return this.__userLogin;
      },
      getChildrenRoles: function getChildrenRoles(role) {
        role = role.toLowerCase();
        var childrenRoles = [];

        if (!qxapp.data.Permissions.ROLES[role]) {
          return childrenRoles;
        }

        if (!childrenRoles.includes(role)) {
          childrenRoles.unshift(role);
        }

        var children = qxapp.data.Permissions.ROLES[role].inherits;

        for (var i = 0; i < children.length; i++) {
          var child = children[i];

          if (!childrenRoles.includes(child)) {
            childrenRoles.unshift(child);
            var moreChildren = this.getChildrenRoles(child);

            for (var j = moreChildren.length - 1; j >= 0; j--) {
              if (!childrenRoles.includes(moreChildren[j])) {
                childrenRoles.unshift(moreChildren[j]);
              }
            }
          }
        }

        return childrenRoles;
      },
      __getInitPermissions: function __getInitPermissions() {
        return {
          "anonymous": [],
          "guest": ["studies.templates.read", "study.node.data.pull", "study.start", "study.stop", "study.update"],
          "user": ["studies.user.read", "studies.user.create", "storage.datcore.read", "preferences.user.update", "preferences.token.create", "preferences.token.delete", "study.node.create", "study.node.delete", "study.node.rename", "study.node.start", "study.node.data.push", "study.node.data.delete", "study.edge.create", "study.edge.delete"],
          "tester": ["services.all.read", "preferences.role.update", "study.nodestree.uuid.read", "study.filestree.uuid.read", "study.logger.debug.read", "studies.template.create", "studies.template.update", "studies.template.delete"],
          "admin": []
        };
      },
      __nextAction: function __nextAction() {
        var highestAction = 0.5;

        for (var key in qxapp.data.Permissions.ACTIONS) {
          if (highestAction < qxapp.data.Permissions.ACTIONS[key]) {
            highestAction = qxapp.data.Permissions.ACTIONS[key];
          }
        }

        return 2 * highestAction;
      },
      addAction: function addAction(role, action) {
        if (!qxapp.data.Permissions.ROLES[role]) {
          return;
        }

        qxapp.data.Permissions.ACTIONS[action] = this.__nextAction();
        qxapp.data.Permissions.ROLES[role].can.push(action);
      },
      // https://blog.nodeswat.com/implement-access-control-in-node-js-8567e7b484d1#2405
      __canRoleDo: function __canRoleDo(role, action) {
        var _this2 = this;

        role = role.toLowerCase(); // Check if role exists

        var roles = qxapp.data.Permissions.ROLES;

        if (!roles[role]) {
          return false;
        }

        var roleObj = roles[role]; // Check if this role has access

        if (roleObj.can.indexOf(action) !== -1) {
          return true;
        } // Check if there are any parents


        if (!roleObj.inherits || roleObj.inherits.length < 1) {
          return false;
        } // Check child roles until one returns true or all return false


        return roleObj.inherits.some(function (childRole) {
          return _this2.__canRoleDo(childRole, action);
        });
      },
      canDo: function canDo(action, showMsg) {
        var canDo = false;

        if (this.__userRole) {
          canDo = this.__canRoleDo(this.__userRole, action);
        }

        if (showMsg && !canDo) {
          qxapp.component.message.FlashMessenger.getInstance().logAs("Operation not permitted", "ERROR");
        }

        return canDo;
      },
      loadUserRoleFromBackend: function loadUserRoleFromBackend() {
        var _this3 = this;

        var userResources = qxapp.io.rest.ResourceFactory.getInstance().createUserResources();
        var profile = userResources.profile;
        profile.addListenerOnce("getSuccess", function (e) {
          var profileData = e.getRequest().getResponse().data;
          _this3.__userRole = profileData.role;
          _this3.__userLogin = profileData.login;

          _this3.fireDataEvent("userProfileRecieved", true);
        }, this);
        profile.addListenerOnce("getError", function (e) {
          console.error(e);
        });
        profile.get();
      }
    }
  });
  qxapp.data.Permissions.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Permissions.js.map?dt=1568886162214