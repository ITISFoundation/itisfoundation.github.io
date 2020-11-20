(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.theme.Color": {
        "require": true
      },
      "qxapp.theme.Decoration": {
        "require": true
      },
      "qxapp.theme.Font": {
        "require": true
      },
      "qx.theme.icon.Oxygen": {
        "require": true
      },
      "qxapp.theme.Appearance": {
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
       * Tobias Oetiker (oetiker)
  
  ************************************************************************ */
  qx.Theme.define("qxapp.theme.Theme", {
    meta: {
      color: qxapp.theme.Color,
      decoration: qxapp.theme.Decoration,
      font: qxapp.theme.Font,
      icon: qx.theme.icon.Oxygen,
      appearance: qxapp.theme.Appearance
    }
  });
  qxapp.theme.Theme.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Theme.js.map?dt=1568886159385