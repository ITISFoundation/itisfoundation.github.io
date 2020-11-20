(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Atom": {
        "construct": true,
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
  qx.Class.define("qxapp.ui.basic.Chip", {
    extend: qx.ui.basic.Atom,
    construct: function construct(label, icon) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);
    },
    properties: {
      appearance: {
        init: "chip",
        refine: true
      }
    }
  });
  qxapp.ui.basic.Chip.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Chip.js.map?dt=1568886164621