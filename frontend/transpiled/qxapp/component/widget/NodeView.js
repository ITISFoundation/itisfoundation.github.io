(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.splitpane.Pane": {
        "construct": true,
        "require": true
      },
      "qxapp.desktop.SidePanel": {
        "construct": true
      },
      "qx.ui.toolbar.ToolBar": {
        "construct": true
      },
      "qx.ui.toolbar.Part": {
        "construct": true
      },
      "qx.ui.basic.Atom": {
        "construct": true
      },
      "qx.ui.toolbar.Button": {
        "construct": true
      },
      "qx.ui.container.Scroll": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.groupbox.GroupBox": {
        "construct": true
      },
      "qx.ui.core.Widget": {},
      "qxapp.component.widget.NodeDataManager": {},
      "qx.ui.window.Window": {},
      "qx.ui.layout.Grow": {},
      "qxapp.component.metadata.ServiceInfoWindow": {},
      "qx.event.message.Bus": {}
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
   * Widget that displays the main view of a node.
   * - On the left side shows the default inputs if any and also what the input nodes offer
   * - In the center the content of the node: settings, mapper, iframe...
   *
   * When a node is set the layout is built
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let nodeView = new qxapp.component.widget.NodeView();
   *   nodeView.setWorkbench(workbench);
   *   nodeView.setNode(workbench.getNode1());
   *   nodeView.buildLayout();
   *   this.getRoot().add(nodeView);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.NodeView", {
    extend: qx.ui.splitpane.Pane,
    construct: function construct() {
      qx.ui.splitpane.Pane.constructor.call(this);
      var inputPanel = this.__inputPanel = new qxapp.desktop.SidePanel().set({
        minWidth: 300
      });
      var titleBar = new qx.ui.toolbar.ToolBar();
      var titlePart = new qx.ui.toolbar.Part();
      var buttonPart = new qx.ui.toolbar.Part();
      titleBar.add(titlePart);
      titleBar.addSpacer();
      titleBar.add(buttonPart);
      this.add(titleBar, 0);
      titlePart.add(new qx.ui.basic.Atom(this.tr("Inputs")).set({
        font: "title-18"
      }));
      var collapseBtn = this.__collapseBtn = new qx.ui.toolbar.Button(this.tr("Collapse all"), "@FontAwesome5Solid/minus-square/14");
      buttonPart.add(collapseBtn);
      inputPanel.add(titleBar);
      var scroll = this.__scrollContainer = new qx.ui.container.Scroll();
      var inputContainer = this.__inputNodesLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      scroll.add(inputContainer);
      inputPanel.add(scroll, {
        flex: 1
      });
      this.add(inputPanel, 0);
      var mainLayout = this.__mainLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      this.add(mainLayout, 1);
      this.__settingsLayout = new qx.ui.groupbox.GroupBox(this.tr("Settings")).set({
        appearance: "settings-groupbox",
        maxWidth: 500,
        alignX: "center"
      });

      this.__settingsLayout.setLayout(new qx.ui.layout.VBox());

      this.__mapperLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      this.__iFrameLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      mainLayout.add(this.__initToolbar());

      this.__attachEventHandlers();
    },
    properties: {
      workbench: {
        check: "qxapp.data.model.Workbench",
        nullable: false
      },
      node: {
        check: "qxapp.data.model.Node",
        apply: "_applyNode"
      }
    },
    members: {
      __mainLayout: null,
      __scrollContainer: null,
      __inputPanel: null,
      __inputNodesLayout: null,
      __settingsLayout: null,
      __mapperLayout: null,
      __iFrameLayout: null,
      __toolbar: null,
      __title: null,
      __buttonContainer: null,
      __filesButton: null,
      __collapseBtn: null,
      __initToolbar: function __initToolbar() {
        var _this = this;

        var toolbar = this.__toolbar = new qx.ui.toolbar.ToolBar();
        var titlePart = new qx.ui.toolbar.Part();
        var infoPart = new qx.ui.toolbar.Part();
        var buttonsPart = this.__buttonContainer = new qx.ui.toolbar.Part();
        toolbar.add(titlePart);
        toolbar.add(infoPart);
        toolbar.addSpacer();
        var title = this.__title = new qx.ui.basic.Atom().set({
          font: "title-18"
        });
        titlePart.add(title);
        var infoBtn = new qx.ui.toolbar.Button(this.tr("Info"), "@FontAwesome5Solid/info-circle/14");
        infoPart.add(infoBtn);
        var filesBtn = this.__filesButton = new qx.ui.toolbar.Button(this.tr("Files"), "@FontAwesome5Solid/folder-open/14");
        buttonsPart.add(filesBtn);
        filesBtn.addListener("execute", function () {
          return _this.__openNodeDataManager();
        }, this);
        infoBtn.addListener("execute", function () {
          return _this.__openServiceInfo();
        }, this);
        return toolbar;
      },
      buildLayout: function buildLayout() {
        this.__addInputPortsUIs();

        this.__addSettings();

        this.__addMapper();

        this.__addIFrame();

        this.__addButtons();
      },
      __addInputPortsUIs: function __addInputPortsUIs() {
        this.__inputNodesLayout.removeAll(); // Add the default inputs if any


        if (Object.keys(this.getNode().getInputsDefault()).length > 0) {
          this.__createInputPortsUI(this.getNode(), false);
        } // Add the representations for the inputs


        var inputNodes = this.getNode().getInputNodes();

        for (var i = 0; i < inputNodes.length; i++) {
          var inputNode = this.getWorkbench().getNode(inputNodes[i]);

          if (inputNode.isContainer()) {
            for (var exposedInnerNodeId in inputNode.getExposedInnerNodes()) {
              var exposedInnerNode = inputNode.getExposedInnerNodes()[exposedInnerNodeId];

              this.__createInputPortsUI(exposedInnerNode);
            }
          } else {
            this.__createInputPortsUI(inputNode);
          }
        }
      },
      __createInputPortsUI: function __createInputPortsUI(inputNode) {
        var isInputModel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var nodePorts = null;

        if (isInputModel) {
          nodePorts = inputNode.getOutputWidget();
        } else {
          nodePorts = inputNode.getInputsDefaultWidget();
        }

        if (nodePorts) {
          this.__inputNodesLayout.add(nodePorts, {
            flex: 1
          });
        }

        nodePorts.setCollapsed(false);
        return nodePorts;
      },
      __addSettings: function __addSettings() {
        var propsWidget = this.getNode().getPropsWidget();

        this.__settingsLayout.removeAll();

        if (propsWidget && Object.keys(this.getNode().getInputs()).length) {
          this.__settingsLayout.add(propsWidget);

          this.__mainLayout.add(this.__settingsLayout);
        } else if (qx.ui.core.Widget.contains(this.__mainLayout, this.__settingsLayout)) {
          this.__mainLayout.remove(this.__settingsLayout);
        }
      },
      __addMapper: function __addMapper() {
        var mapper = this.getNode().getInputsMapper();

        this.__mapperLayout.removeAll();

        if (mapper) {
          this.__mapperLayout.add(mapper, {
            flex: 1
          });

          this.__mainLayout.add(this.__mapperLayout, {
            flex: 1
          });
        } else if (qx.ui.core.Widget.contains(this.__mainLayout, this.__mapperLayout)) {
          this.__mainLayout.remove(this.__mapperLayout);
        }
      },
      __addIFrame: function __addIFrame() {
        var _this2 = this;

        var iFrame = this.getNode().getIFrame();

        this.__iFrameLayout.removeAll();

        if (iFrame) {
          iFrame.addListener("maximize", function (e) {
            _this2.__maximizeIFrame(true);
          }, this);
          iFrame.addListener("restore", function (e) {
            _this2.__maximizeIFrame(false);
          }, this);

          this.__maximizeIFrame(iFrame.hasState("maximized"));

          this.__iFrameLayout.add(iFrame, {
            flex: 1
          });

          this.__mainLayout.add(this.__iFrameLayout, {
            flex: 1
          });
        } else if (qx.ui.core.Widget.contains(this.__mainLayout, this.__iFrameLayout)) {
          this.__mainLayout.remove(this.__iFrameLayout);
        }
      },
      __maximizeIFrame: function __maximizeIFrame(maximize) {
        var othersStatus = maximize ? "excluded" : "visible";

        this.__inputNodesLayout.setVisibility(othersStatus);

        this.__settingsLayout.setVisibility(othersStatus);

        this.__mapperLayout.setVisibility(othersStatus);

        this.__toolbar.setVisibility(othersStatus);
      },
      hasIFrame: function hasIFrame() {
        return this.isPropertyInitialized("node") && this.getNode().getIFrame();
      },
      restoreIFrame: function restoreIFrame() {
        if (this.hasIFrame()) {
          var iFrame = this.getNode().getIFrame();

          if (iFrame) {
            iFrame.maximizeIFrame(false);
          }
        }
      },
      __addButtons: function __addButtons() {
        this.__buttonContainer.removeAll();

        var retrieveIFrameButton = this.getNode().getRetrieveIFrameButton();

        if (retrieveIFrameButton) {
          this.__buttonContainer.add(retrieveIFrameButton);
        }

        var restartIFrameButton = this.getNode().getRestartIFrameButton();

        if (restartIFrameButton) {
          this.__buttonContainer.add(restartIFrameButton);
        }

        this.__buttonContainer.add(this.__filesButton);

        this.__toolbar.add(this.__buttonContainer);
      },
      __openNodeDataManager: function __openNodeDataManager() {
        var nodeDataManager = new qxapp.component.widget.NodeDataManager(this.getNode());
        var win = new qx.ui.window.Window(this.getNode().getLabel()).set({
          layout: new qx.ui.layout.Grow(),
          contentPadding: 0,
          showMinimize: false,
          width: 900,
          height: 600,
          appearance: "service-window"
        });
        win.add(nodeDataManager);
        win.center();
        win.open();
      },
      __openServiceInfo: function __openServiceInfo() {
        var win = new qxapp.component.metadata.ServiceInfoWindow(this.getNode().getMetaData());
        win.center();
        win.open();
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this3 = this;

        this.__blocker.addListener("tap", this.__inputPanel.toggleCollapsed.bind(this.__inputPanel));

        var maximizeIframeCb = function maximizeIframeCb(msg) {
          _this3.__blocker.setStyles({
            display: msg.getData() ? "none" : "block"
          });

          _this3.__inputPanel.setVisibility(msg.getData() ? "excluded" : "visible");
        };

        this.addListener("appear", function () {
          qx.event.message.Bus.getInstance().subscribe("maximizeIframe", maximizeIframeCb, _this3);
        }, this);
        this.addListener("disappear", function () {
          qx.event.message.Bus.getInstance().unsubscribe("maximizeIframe", maximizeIframeCb, _this3);
        }, this);

        this.__collapseBtn.addListener("execute", function () {
          _this3.__inputNodesLayout.getChildren().forEach(function (node) {
            node.setCollapsed(true);
          });
        }, this);
      },
      _applyNode: function _applyNode(node) {
        this.__title.setLabel(node.getLabel());
      }
    }
  });
  qxapp.component.widget.NodeView.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeView.js.map?dt=1568886161262