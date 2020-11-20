(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Button": {
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
  
  ************************************************************************ */

  /**
   * A Button with low optical impact presenting as a simple weblink
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   const link = new qxapp.ui.basic.LinkLabel(this.tr("oSparc"),"https://osparc.io");
   *   this.getRoot().add(link);
   * </pre>
   */
  qx.Class.define("qxapp.ui.form.LinkButton", {
    extend: qx.ui.form.Button,

    /**
      * @param label {String} Label to use
      * @param url {String} Url to point to
      * @param height {Integer?12} Height of the link icon
    */
    construct: function construct(label, url) {
      var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 12;
      qx.ui.form.Button.constructor.call(this, label);
      this.set({
        iconPosition: "right",
        allowGrowX: false
      });

      if (url) {
        this.setIcon("@FontAwesome5Solid/external-link-alt/" + height);
        this.addListener("execute", function () {
          window.open(url);
        }, this);
      }
    }
  });
  qxapp.ui.form.LinkButton.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=LinkButton.js.map?dt=1568886164671