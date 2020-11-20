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
      "qxapp.component.filter.MFilterable": {
        "require": true
      },
      "qxapp.component.filter.IFilterable": {
        "require": true
      },
      "qx.ui.layout.VBox": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.indicator.ProgressBar": {},
      "qx.ui.basic.Atom": {},
      "qxapp.theme.Appearance": {},
      "qx.ui.layout.Flow": {},
      "qxapp.statics.NodeStatics": {},
      "qxapp.ui.basic.Chip": {},
      "qxapp.component.service.NodeStatus": {},
      "qxapp.utils.Utils": {},
      "qx.ui.basic.Image": {},
      "qx.ui.embed.Html": {}
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
   * Window that is used to represent a node in the WorkbenchUI.
   *
   * It implements Drag&Drop mechanism to provide internode connections.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let nodeUI = new qxapp.component.workbench.NodeUI(node);
   *   nodeUI.populateNodeLayout();
   *   workbench.add(nodeUI)
   * </pre>
   */
  var nodeWidth = 200;
  var portHeight = 16;
  qx.Class.define("qxapp.component.workbench.NodeUI", {
    extend: qx.ui.window.Window,
    include: qxapp.component.filter.MFilterable,
    implement: qxapp.component.filter.IFilterable,

    /**
     * @param node {qxapp.data.model.Node} Node owning the widget
     */
    construct: function construct(node) {
      qx.ui.window.Window.constructor.call(this);
      this.set({
        showMinimize: false,
        showMaximize: false,
        showClose: false,
        showStatusbar: false,
        resizable: false,
        allowMaximize: false,
        width: nodeWidth,
        maxWidth: nodeWidth,
        minWidth: nodeWidth,
        contentPadding: 0
      });
      this.setNode(node);

      this.__createNodeLayout();

      this.subscribeToFilterGroup("workbench");
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node",
        nullable: false
      },
      thumbnail: {
        check: "String",
        nullable: true,
        apply: "_applyThumbnail"
      },
      appearance: {
        init: "window-small-cap",
        refine: true
      }
    },
    events: {
      "edgeDragStart": "qx.event.type.Data",
      "edgeDragOver": "qx.event.type.Data",
      "edgeDrop": "qx.event.type.Data",
      "edgeDragEnd": "qx.event.type.Data",
      "nodeMoving": "qx.event.type.Event"
    },
    members: {
      __inputPortLayout: null,
      __outputPortLayout: null,
      __inputPort: null,
      __outputPort: null,
      __progressBar: null,
      __thumbnail: null,
      __status: null,
      getNodeId: function getNodeId() {
        return this.getNode().getNodeId();
      },
      getMetaData: function getMetaData() {
        return this.getNode().getMetaData();
      },
      __createNodeLayout: function __createNodeLayout() {
        this.setLayout(new qx.ui.layout.VBox());

        if (this.getNode().getThumbnail()) {
          this.setThumbnail(this.getNode().getThumbnail());
        }

        var inputsOutputsLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        this.add(inputsOutputsLayout, {
          flex: 1
        });
        var inputsBox = new qx.ui.layout.VBox(5);
        this.__inputPortLayout = new qx.ui.container.Composite(inputsBox).set({
          marginLeft: 4
        });
        inputsOutputsLayout.add(this.__inputPortLayout, {
          width: "50%"
        });
        var outputsBox = new qx.ui.layout.VBox(5);
        this.__outputPortLayout = new qx.ui.container.Composite(outputsBox).set({
          marginRight: 4
        });
        inputsOutputsLayout.add(this.__outputPortLayout, {
          width: "50%"
        });
        this.add(this.__createChipContainer());

        if (this.getNode().isComputational()) {
          this.__progressBar = new qx.ui.indicator.ProgressBar().set({
            height: 10,
            margin: 4
          });
          this.add(this.__progressBar);
        } else if (this.getNode().isDynamic()) {
          this.__addStatusIndicator();
        }
      },
      populateNodeLayout: function populateNodeLayout() {
        var node = this.getNode();
        node.bind("label", this, "caption");

        if (node.isContainer()) {
          this.setIcon("@FontAwesome5Solid/folder-open/14");
        }

        this.__inputPort = null;
        this.__outputPort = null;
        var metaData = node.getMetaData();

        if (metaData) {
          this.__createUIPorts(true, metaData.inputs);

          this.__createUIPorts(false, metaData.outputs);
        }

        if (node.isComputational()) {
          node.bind("progress", this.__progressBar, "value");
        }
      },
      getInputPort: function getInputPort() {
        return this.__inputPort;
      },
      getOutputPort: function getOutputPort() {
        return this.__outputPort;
      },
      __createUIPorts: function __createUIPorts(isInput, ports) {
        // Always create ports if node is a container
        if (!this.getNode().isContainer() && Object.keys(ports).length < 1) {
          return;
        }

        var portUI = this.__createUIPort(isInput);

        this.__createUIPortConnections(portUI, isInput);

        var label = {
          isInput: isInput,
          ui: portUI
        };
        label.ui.isInput = isInput;

        if (isInput) {
          this.__inputPort = label;

          this.__inputPortLayout.add(label.ui);
        } else {
          this.__outputPort = label;

          this.__outputPortLayout.add(label.ui);
        }
      },
      __createUIPort: function __createUIPort(isInput) {
        var labelText = isInput ? "in" : "out";
        var alignX = isInput ? "left" : "right";
        var uiPort = new qx.ui.basic.Atom(labelText).set({
          height: portHeight,
          draggable: true,
          droppable: true,
          alignX: alignX,
          allowGrowX: false
        });
        return uiPort;
      },
      __createUIPortConnections: function __createUIPortConnections(uiPort, isInput) {
        var _this = this;

        [["dragstart", "edgeDragStart"], ["dragover", "edgeDragOver"], ["drop", "edgeDrop"], ["dragend", "edgeDragEnd"]].forEach(function (eventPair) {
          uiPort.addListener(eventPair[0], function (e) {
            var eData = {
              event: e,
              nodeId: _this.getNodeId(),
              isInput: isInput
            };

            _this.fireDataEvent(eventPair[1], eData);
          }, _this);
        }, this);
      },
      getEdgePoint: function getEdgePoint(port) {
        var bounds = this.getCurrentBounds();
        var captionHeight = qxapp.theme.Appearance.appearances["window-small-cap/captionbar"].style().height || qxapp.theme.Appearance.appearances["window-small-cap/captionbar"].style().minHeight;
        var x = port.isInput ? bounds.left - 6 : bounds.left + bounds.width;
        var y = bounds.top + captionHeight + portHeight / 2 + 1;

        if (this.__thumbnail) {
          y += this.__thumbnail.getBounds().height;
        }

        return [x, y];
      },
      getCurrentBounds: function getCurrentBounds() {
        var bounds = this.getBounds();
        var cel = this.getContentElement();

        if (cel) {
          var domeEle = cel.getDomElement();

          if (domeEle) {
            bounds.left = parseInt(domeEle.style.left);
            bounds.top = parseInt(domeEle.style.top);
          }
        }

        return bounds;
      },
      __createChipContainer: function __createChipContainer() {
        var chipContainer = this.__chipContainer = new qx.ui.container.Composite(new qx.ui.layout.Flow(3, 3)).set({
          margin: [3, 4]
        });
        var category = this.getNode().isContainer() ? null : qxapp.statics.NodeStatics.getCategory(this.getNode().getMetaData().category);
        var nodeType = this.getNode().isContainer() ? "container" : this.getNode().getMetaData().type;
        var type = qxapp.statics.NodeStatics.getType(nodeType);

        if (type) {
          chipContainer.add(new qxapp.ui.basic.Chip(type.label, type.icon + "12"));
        }

        if (category) {
          chipContainer.add(new qxapp.ui.basic.Chip(category.label, category.icon + "12"));
        }

        return chipContainer;
      },
      __addStatusIndicator: function __addStatusIndicator() {
        this.__status = new qxapp.component.service.NodeStatus(this.getNode());

        this.__chipContainer.add(this.__status);
      },
      // override qx.ui.window.Window "move" event listener
      _onMovePointerMove: function _onMovePointerMove(e) {
        qxapp.component.workbench.NodeUI.prototype._onMovePointerMove.base.call(this, e);

        if (e.getPropagationStopped() === true) {
          this.fireEvent("nodeMoving");
        }
      },
      _applyThumbnail: function _applyThumbnail(thumbnail, oldThumbnail) {
        if (oldThumbnail !== null) {
          this.removeAt(0);
        }

        if (qxapp.utils.Utils.isUrl(thumbnail)) {
          this.__thumbnail = new qx.ui.basic.Image(thumbnail).set({
            height: 100,
            allowShrinkX: true,
            scale: true
          });
        } else {
          this.__thumbnail = new qx.ui.embed.Html(thumbnail).set({
            height: 100
          });
        }

        this.addAt(this.__thumbnail, 0);
      },
      _filter: function _filter() {
        this.setOpacity(0.4);
      },
      _unfilter: function _unfilter() {
        this.setOpacity(1);
      },
      _shouldApplyFilter: function _shouldApplyFilter(data) {
        if (data.text) {
          var label = this.getNode().getLabel().trim().toLowerCase();

          if (label.indexOf(data.text) === -1) {
            return true;
          }
        }

        if (data.tags && data.tags.length) {
          var category = this.getMetaData().category || "";
          var type = this.getMetaData().type || "";

          if (!data.tags.includes(category.trim().toLowerCase()) && !data.tags.includes(type.trim().toLowerCase())) {
            return true;
          }
        }

        return false;
      },
      _shouldReactToFilter: function _shouldReactToFilter(data) {
        if (data.text && data.text.length > 1) {
          return true;
        }

        if (data.tags && data.tags.length) {
          return true;
        }

        return false;
      }
    }
  });
  qxapp.component.workbench.NodeUI.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeUI.js.map?dt=1568886161810