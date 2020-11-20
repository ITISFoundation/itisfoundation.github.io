(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.Window": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Grow": {
        "construct": true
      },
      "qxapp.component.metadata.ServiceInfo": {
        "construct": true
      },
      "qx.ui.container.Scroll": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /*
   * oSPARC - The SIMCORE frontend - https://osparc.io
   * Copyright: 2019 IT'IS Foundation - https://itis.swiss
   * License: MIT - https://opensource.org/licenses/MIT
   * Authors: Ignacio Pascual (ignapas)
   *          Odei Maiz (odeimaiz)
   */

  /**
   * Window that contains the ServiceInfo of the given service metadata.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   const win = new qxapp.component.metadata.ServiceInfoWindow(service);
   *   win.center();
   *   win.open();
   * </pre>
   */
  qx.Class.define("qxapp.component.metadata.ServiceInfoWindow", {
    extend: qx.ui.window.Window,

    /**
      * @param metadata {Object} Service metadata
      */
    construct: function construct(metadata) {
      qx.ui.window.Window.constructor.call(this, this.tr("Service information") + " · " + metadata.name);
      var windowWidth = 700;
      var windowHeight = 800;
      this.set({
        layout: new qx.ui.layout.Grow(),
        contentPadding: 10,
        showMinimize: false,
        resizable: true,
        modal: true,
        width: windowWidth,
        height: windowHeight
      });
      var serviceDetails = new qxapp.component.metadata.ServiceInfo(metadata);
      var scroll = new qx.ui.container.Scroll();
      scroll.add(serviceDetails);
      this.add(scroll);
    },
    properties: {
      appearance: {
        refine: true,
        init: "info-service-window"
      }
    }
  });
  qxapp.component.metadata.ServiceInfoWindow.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ServiceInfoWindow.js.map?dt=1568886160580