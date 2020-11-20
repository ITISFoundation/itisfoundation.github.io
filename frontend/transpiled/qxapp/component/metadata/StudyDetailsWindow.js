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
      "qxapp.component.metadata.StudyDetails": {
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
   * Authors: Odei Maiz (odeimaiz)
   */

  /**
   * Window that contains the StudyDetails of the given study metadata.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   const win = new qxapp.component.metadata.StudyDetailsWindow(study);
   *   win.center();
   *   win.open();
   * </pre>
   */
  qx.Class.define("qxapp.component.metadata.StudyDetailsWindow", {
    extend: qx.ui.window.Window,

    /**
      * @param study {Object|qxapp.data.model.Study} Study (metadata)
      */
    construct: function construct(study) {
      qx.ui.window.Window.constructor.call(this, this.tr("Study information") + " · " + study.getName());
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
      var thumbnailWidth = (windowWidth - 250) / 1.67;
      var studyDetails = new qxapp.component.metadata.StudyDetails(study, thumbnailWidth);
      var scroll = new qx.ui.container.Scroll().set({
        height: windowHeight
      });
      scroll.add(studyDetails);
      this.add(scroll);
    },
    properties: {
      appearance: {
        refine: true,
        init: "info-service-window"
      }
    }
  });
  qxapp.component.metadata.StudyDetailsWindow.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=StudyDetailsWindow.js.map?dt=1568886160755