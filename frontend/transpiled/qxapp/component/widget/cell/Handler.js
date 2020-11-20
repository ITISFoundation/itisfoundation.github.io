(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.io.request.Xhr": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);
  qx.Class.define("qxapp.component.widget.cell.Handler", {
    extend: qx.core.Object,
    construct: function construct(node) {
      qx.core.Object.constructor.call(this);
      this.setNode(node);
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node",
        nullable: true
      }
    },
    events: {
      "outputUpdated": "qx.event.type.Event"
    },
    members: {
      __editor: null,
      __output: null,
      getTitle: function getTitle() {
        return this.getNode().getLabel();
      },
      getUuid: function getUuid() {
        return this.getNode().getNodeId();
      },
      getEditor: function getEditor() {
        return this.getNode().getIFrame();
      },
      getOutput: function getOutput() {
        return this.__output;
      },
      retrieveOutput: function retrieveOutput() {
        var _this = this;

        var outUrl = this.getNode().getServiceUrl() + "/output";
        outUrl = outUrl.replace("//output", "/output");
        var outReq = new qx.io.request.Xhr();
        outReq.addListener("success", function (e) {
          var data = e.getTarget().getResponse();

          if (data === "") {
            var width = 100;
            var height = 100;
            var backgroundColor = "transparent";
            var plusColor = "757575";
            var plusUrl = "https://imgplaceholder.com/" + width + "x" + height + "/" + backgroundColor + "/" + plusColor + "/ion-plus-round";
            _this.__output = "<img src='" + plusUrl + "' alt='Add new plot'></img>";
          } else {
            _this.__output = data;
          }

          _this.fireEvent("outputUpdated");
        }, this);
        outReq.set({
          url: outUrl,
          method: "GET"
        });
        outReq.send();
      }
    }
  });
  qxapp.component.widget.cell.Handler.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Handler.js.map?dt=1568886161505