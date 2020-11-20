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
      "qx.ui.basic.Atom": {
        "construct": true
      },
      "qx.bom.Font": {
        "construct": true
      },
      "qxapp.theme.Font": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qxapp - the simcore frontend
  
     https://osparc.io
  
     Copyright:
       2019 IT'IS Foundation, https://itis.swiss
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * Base class for NodeInput and NodeOutput
   */
  qx.Class.define("qxapp.component.widget.NodeInOut", {
    extend: qx.ui.core.Widget,

    /**
      * @param node {qxapp.data.model.Node} Node owning the widget
    */
    construct: function construct(node) {
      this.setNode(node);
      qx.ui.core.Widget.constructor.call(this);
      var nodeInOutLayout = new qx.ui.layout.VBox(10);

      this._setLayout(nodeInOutLayout);

      this.set({
        decorator: "main"
      });
      var atom = this.__atom = new qx.ui.basic.Atom().set({
        rich: true,
        center: true,
        draggable: true,
        droppable: true
      });
      atom.getChildControl("label").set({
        font: qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["title-16"]),
        textAlign: "center"
      });

      this._add(atom, {
        flex: 1
      });
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node",
        nullable: false
      },
      inputPort: {
        init: null,
        nullable: true
      },
      outputPort: {
        init: null,
        nullable: true
      }
    },
    events: {
      "edgeDragStart": "qx.event.type.Data",
      "edgeDragOver": "qx.event.type.Data",
      "edgeDrop": "qx.event.type.Data",
      "edgeDragEnd": "qx.event.type.Data"
    },
    members: {
      __atom: null,
      getAtom: function getAtom() {
        return this.__atom;
      },
      getNodeId: function getNodeId() {
        return this.getNode().getNodeId();
      },
      getMetaData: function getMetaData() {
        return this.getNode().getMetaData();
      },
      emptyPorts: function emptyPorts() {
        this.setInputPort(null);
        this.setOutputPort(null);
      },
      getEdgePoint: function getEdgePoint(port) {
        var nodeBounds = this.getCurrentBounds();

        if (nodeBounds === null) {
          // not rendered yet
          return null;
        }

        var x = port.isInput ? null : 0;
        var y = nodeBounds.top + nodeBounds.height / 2;
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
      _createUIPorts: function _createUIPorts(isInput, ports) {
        // Always create ports if node is a container
        if (!this.getNode().isContainer() && Object.keys(ports).length < 1) {
          return;
        }

        this.__createUIPortConnections(this, isInput);

        var label = {
          isInput: isInput,
          ui: this
        };
        label.ui.isInput = isInput;
        isInput ? this.setInputPort(label) : this.setOutputPort(label);
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
      }
    }
  });
  qxapp.component.widget.NodeInOut.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeInOut.js.map?dt=1568886161131