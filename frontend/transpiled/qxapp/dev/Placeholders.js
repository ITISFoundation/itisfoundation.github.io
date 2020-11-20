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

  /* eslint new-cap: [2, {capIsNewExceptions: ["B", "D", "J", "K", "L", "MD5"]}] */

  /* eslint operator-assignment: ["off"] */
  qx.Class.define("qxapp.dev.Placeholders", {
    type: "static",
    statics: {
      /**
       * Returns URL to an icon in collection
       *
       * See https://imgplaceholder.com/
      */
      getIcon: function getIcon(iconId, width) {
        var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        // see https://imgplaceholder.com/
        height = height === null ? width : height;
        var prefix = "https://imgplaceholder.com/";
        var shape = width + "x" + height;
        var url = prefix + shape + "/transparent/757575/" + iconId; // e.g. // https://imgplaceholder.com/128x128/transparent/757575/fa-user

        return url;
      },

      /**
       * Returns URL to a rectangular place-holder image of given
       * dimensions.
       *
       * See https://placeholder.com/
      */
      getImage: function getImage(width) {
        var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        //
        height = height === null ? width : height;
        var url = "//via.placeholder.com/" + width + "x" + height; // e.g. http://via.placeholder.com/350x150

        return url;
      }
    }
  });
  qxapp.dev.Placeholders.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Placeholders.js.map?dt=1568886163551