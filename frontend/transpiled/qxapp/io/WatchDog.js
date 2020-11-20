(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qxapp.io.rest.ResourceFactory": {
        "construct": true
      },
      "qx.event.Timer": {
        "construct": true
      },
      "qxapp.component.message.FlashMessenger": {},
      "qxapp.component.widget.LogoOnOff": {}
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
   * Singleton class that does some network connection checks.
   *
   * It has two levels:
   * - Listens to the online/offline event to check whether there is Internet connection or not.
   * - Checks whether the webserver is reachable by doing some HealthCheck calls.
   *
   * *Example*
   *
   * Here is a little example of how to use the class.
   *
   * <pre class='javascript'>
   *   qxapp.io.WatchDog.getInstance().startCheck();
   * </pre>
   */
  qx.Class.define("qxapp.io.WatchDog", {
    extend: qx.core.Object,
    type: "singleton",
    construct: function construct() {
      var resource = qxapp.io.rest.ResourceFactory.getInstance().createHealthCheck();
      this.__healthCheckResource = resource.healthCheck;
      var interval = 5000;
      this.__timer = new qx.event.Timer(interval);
      window.addEventListener("online", this.__updateOnlineStatus, this);
      window.addEventListener("offline", this.__updateOnlineStatus, this);
    },
    properties: {
      onLine: {
        check: "Boolean",
        init: true,
        nullable: false
      },
      healthCheck: {
        check: "Boolean",
        init: true,
        nullable: false
      }
    },
    members: {
      __healthCheckResource: null,
      __timer: null,
      startCheck: function startCheck() {
        var _this = this;

        var timer = this.__timer;
        timer.addListener("interval", function () {
          if (_this.getOnLine()) {
            _this.__checkHealthCheckAsync();
          }
        }, this);
        timer.start();

        this.__checkHealthCheckAsync();
      },
      stopCheck: function stopCheck() {
        if (this.__timer && this.__timer.isEnabled()) {
          this.__timer.stop();
        }
      },
      __checkHealthCheckAsync: function __checkHealthCheckAsync() {
        var _this2 = this;

        var resources = this.__healthCheckResource;
        resources.addListener("getSuccess", function (e) {
          _this2.__updateHealthCheckStatus(true);
        }, this);
        resources.addListener("getError", function (e) {
          _this2.__updateHealthCheckStatus(false);
        }, this);
        resources.get();
      },
      __updateOnlineStatus: function __updateOnlineStatus(e) {
        this.setOnLine(window.navigator.onLine);

        if (this.getOnLine()) {
          qxapp.component.message.FlashMessenger.getInstance().info("Internet is back");
        } else {
          qxapp.component.message.FlashMessenger.getInstance().error("Internet is down");
        }
      },
      __updateHealthCheckStatus: function __updateHealthCheckStatus(status) {
        this.setHealthCheck(status);
        var logo = qxapp.component.widget.LogoOnOff.getInstance();

        if (logo) {
          logo.online(status);
        }
      } // members

    }
  });
  qxapp.io.WatchDog.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=WatchDog.js.map?dt=1568886164173