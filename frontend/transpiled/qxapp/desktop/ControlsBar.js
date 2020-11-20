(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.toolbar.ToolBar": {
        "construct": true,
        "require": true
      },
      "qx.ui.toolbar.Part": {},
      "qxapp.desktop.ServiceFilters": {},
      "qxapp.component.filter.UIFilterController": {},
      "qx.ui.toolbar.Button": {},
      "qxapp.utils.Utils": {}
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
   * Widget that shows the play/stop study button.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let controlsBar = new qxapp.desktop.ControlsBar();
   *   this.getRoot().add(controlsBar);
   * </pre>
   */
  qx.Class.define("qxapp.desktop.ControlsBar", {
    extend: qx.ui.toolbar.ToolBar,
    construct: function construct() {
      qx.ui.toolbar.ToolBar.constructor.call(this);
      this.setSpacing(10);
      this.setAppearance("sidepanel");

      this.__initDefault();
    },
    events: {
      "startPipeline": "qx.event.type.Event",
      "stopPipeline": "qx.event.type.Event"
    },
    members: {
      __startButton: null,
      __stopButton: null,
      __initDefault: function __initDefault() {
        var filterCtrls = new qx.ui.toolbar.Part();
        var serviceFilters = new qxapp.desktop.ServiceFilters("workbench");
        qxapp.component.filter.UIFilterController.getInstance().registerContainer("workbench", serviceFilters);
        filterCtrls.add(serviceFilters);
        this.add(filterCtrls);
        this.addSpacer();
        var simCtrls = new qx.ui.toolbar.Part();
        this.__startButton = this.__createStartButton();
        this.__stopButton = this.__createStopButton();
        simCtrls.add(this.__startButton);
        simCtrls.add(this.__stopButton);
        this.add(simCtrls);
      },
      __createStartButton: function __createStartButton() {
        var _this = this;

        var startButton = new qx.ui.toolbar.Button(this.tr("Run"), "@FontAwesome5Solid/play/14");
        qxapp.utils.Utils.setIdToWidget(startButton, "runStudyBtn");
        startButton.addListener("execute", function () {
          _this.fireEvent("startPipeline");
        }, this);
        return startButton;
      },
      __createStopButton: function __createStopButton() {
        var _this2 = this;

        var stopButton = new qx.ui.toolbar.Button(this.tr("Stop"), "@FontAwesome5Solid/stop-circle/14");
        stopButton.addListener("execute", function () {
          _this2.fireEvent("stopPipeline");
        }, this);
        return stopButton;
      }
    }
  });
  qxapp.desktop.ControlsBar.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ControlsBar.js.map?dt=1568886162561