(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.Stack": {
        "construct": true,
        "require": true
      },
      "qx.ui.basic.Image": {
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
   * Singleton that contains a stack of two logos.
   *
   * If online the white logo will be selected, if the webserver gets disconnected, the logo will turn red
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let logo = qxapp.component.widget.LogoOnOff.getInstance();
       logo.online(true/false);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.LogoOnOff", {
    extend: qx.ui.container.Stack,
    type: "singleton",
    construct: function construct() {
      var _this = this;

      qx.ui.container.Stack.constructor.call(this);
      ["qxapp/osparc-red.svg", "qxapp/osparc-white.svg"].forEach(function (logo) {
        var image = new qx.ui.basic.Image(logo).set({
          width: 92,
          height: 32,
          scale: true
        });

        _this._add(image);
      }, this);
    },
    members: {
      online: function online() {
        var _online = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        this.setSelection([this.getSelectables()[_online ? 1 : 0]]);
      }
    }
  });
  qxapp.component.widget.LogoOnOff.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=LogoOnOff.js.map?dt=1568886161022