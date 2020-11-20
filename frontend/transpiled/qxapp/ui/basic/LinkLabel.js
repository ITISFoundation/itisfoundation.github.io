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
       2018 IT'IS Foundation, https://itis.swiss
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * A Label with low optical impact presenting as a simple weblink
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
  qx.Class.define("qxapp.ui.basic.LinkLabel", {
    extend: qx.ui.basic.Label,
    construct: function construct(label, url) {
      qx.ui.basic.Label.constructor.call(this, "<u>" + label + "</u>");
      this.set({
        rich: true,
        cursor: "pointer",
        url: url
      });
      this.addListener("click", this._onClick);
    },
    properties: {
      url: {
        check: "String",
        nullable: true
      }
    },
    members: {
      _onClick: function _onClick(e) {
        window.open(this.getUrl());
      }
    }
  });
  qxapp.ui.basic.LinkLabel.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=LinkLabel.js.map?dt=1568886164637