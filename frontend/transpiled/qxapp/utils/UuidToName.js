(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
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
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * Singleton for trying to convert a (file) uuid into a human readable text.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let image = qxapp.utils.Avatar.getUrl(userEmail);
   * </pre>
   */
  qx.Class.define("qxapp.utils.UuidToName", {
    extend: qx.core.Object,
    type: "singleton",
    properties: {
      study: {
        check: "qxapp.data.model.Study",
        nullable: true
      }
    },
    members: {
      convertToName: function convertToName(itemUuid) {
        if (this.isPropertyInitialized("study")) {
          var prj = this.getStudy();

          if (itemUuid === prj.getUuid()) {
            return prj.getName();
          }

          var wrkb = prj.getWorkbench();
          var allNodes = wrkb.getNodes(true);

          for (var nodeId in allNodes) {
            var node = allNodes[nodeId];

            if (itemUuid === node.getNodeId()) {
              return node.getLabel();
            }
          }
        }

        return itemUuid;
      }
    }
  });
  qxapp.utils.UuidToName.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=UuidToName.js.map?dt=1568886164955