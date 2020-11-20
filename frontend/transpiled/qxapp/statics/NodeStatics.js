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

  /*
   * oSPARC - The SIMCORE frontend - https://osparc.io
   * Copyright: 2019 IT'IS Foundation - https://itis.swiss
   * License: MIT - https://opensource.org/licenses/MIT
   * Authors: Ignacio Pascual (ignapas)
   */
  qx.Class.define("qxapp.statics.NodeStatics", {
    statics: {
      CATEGORIES: {
        postpro: {
          label: "Postpro",
          icon: "@FontAwesome5Solid/chart-bar/"
        },
        notebook: {
          label: "Notebook",
          icon: "@FontAwesome5Solid/file-code/"
        },
        solver: {
          label: "Solver",
          icon: "@FontAwesome5Solid/calculator/"
        },
        simulator: {
          label: "Simulator",
          icon: "@FontAwesome5Solid/brain/"
        },
        modeling: {
          label: "Modeling",
          icon: "@FontAwesome5Solid/cube/"
        },
        data: {
          label: "Data",
          icon: "@FontAwesome5Solid/file/"
        }
      },
      TYPES: {
        computational: {
          label: "Computational",
          icon: "@FontAwesome5Solid/cogs/"
        },
        dynamic: {
          label: "Interactive",
          icon: "@FontAwesome5Solid/mouse-pointer/"
        },
        container: {
          label: "Group of nodes",
          icon: "@FontAwesome5Solid/box-open/"
        }
      },
      getCategory: function getCategory(category) {
        return qxapp.statics.NodeStatics.CATEGORIES[category.trim().toLowerCase()];
      },
      getType: function getType(type) {
        return qxapp.statics.NodeStatics.TYPES[type.trim().toLowerCase()];
      }
    }
  });
  qxapp.statics.NodeStatics.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeStatics.js.map?dt=1568886164260