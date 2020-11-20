(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qxapp.desktop.ControlsBar": {
        "construct": true
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
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /* eslint no-underscore-dangle: 0 */

  /**
   * Widget containing a Vertical Box with a MainView and ControlsBar.
   * Used as Main View in the study editor.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let mainPanel = this.__mainPanel = new qxapp.desktop.MainPanel();
   *   mainPanel.setMainView(widget);
   *   this.getRoot().add(mainPanel);
   * </pre>
   */
  qx.Class.define("qxapp.desktop.MainPanel", {
    extend: qx.ui.core.Widget,
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.VBox());

      var hBox = this.__mainView = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
        allowGrowY: true
      });

      this._add(hBox, {
        flex: 1
      });

      var controlsBar = this.__controlsBar = new qxapp.desktop.ControlsBar();

      this._add(controlsBar);
    },
    properties: {
      mainView: {
        nullable: false,
        check: "qx.ui.core.Widget",
        apply: "__applyMainView"
      }
    },
    members: {
      __mainView: null,
      __controlsBar: null,
      __applyMainView: function __applyMainView(newWidget) {
        this.__mainView.removeAll();

        this.__mainView.add(newWidget, {
          flex: 1
        });
      },
      getControls: function getControls() {
        return this.__controlsBar;
      }
    }
  });
  qxapp.desktop.MainPanel.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=MainPanel.js.map?dt=1568886162664