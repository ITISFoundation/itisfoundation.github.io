(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Label": {
        "construct": true,
        "require": true
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
       * Ignacio Pascual (ignapas)
  
  ************************************************************************ */

  /**
   * Widget containing a JsonTreeViewer dom element
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let jsonTreeWidget = new qxapp.component.widget.JsonTreeWidget(data);
   *   this.getRoot().add(jsonTreeWidget);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.JsonTreeWidget", {
    extend: qx.ui.basic.Label,

    /**
     * @param data {Object} Json object to be displayed by JsonTreeViewer
     */
    construct: function construct(data) {
      var prettyJson = JSON.stringify(data, null, "&emsp;").replace(/\n/ig, "<br>");
      qx.ui.basic.Label.constructor.call(this, prettyJson);
      this.set({
        rich: true
      });
    }
  });
  qxapp.component.widget.JsonTreeWidget.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=JsonTreeWidget.js.map?dt=1568886161010