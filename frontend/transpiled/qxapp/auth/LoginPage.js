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
      "qx.ui.layout.Grid": {
        "construct": true
      },
      "qx.ui.container.Stack": {
        "construct": true
      },
      "qxapp.auth.ui.LoginView": {
        "construct": true
      },
      "qxapp.auth.ui.RegistrationView": {
        "construct": true
      },
      "qxapp.auth.ui.ResetPassRequestView": {
        "construct": true
      },
      "qxapp.auth.ui.ResetPassView": {
        "construct": true
      },
      "qxapp.auth.core.Utils": {
        "construct": true
      },
      "qxapp.utils.Utils": {
        "construct": true
      },
      "qxapp.component.message.FlashMessenger": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qxapp.utils.LibVersions": {},
      "qxapp.ui.basic.LinkLabel": {},
      "qx.ui.basic.Label": {}
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
       * Pedro Crespo (pcrespov)
  
  ************************************************************************ */

  /**
   *  Main Authentication Page:
   *    A multi-page view that fills all page
   */
  qx.Class.define("qxapp.auth.LoginPage", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this); // Layout guarantees it gets centered in parent's page

      var layout = new qx.ui.layout.Grid();
      layout.setRowFlex(0, 1);
      layout.setColumnFlex(0, 1);

      this._setLayout(layout); // Pages


      var pages = new qx.ui.container.Stack().set({
        allowGrowX: false,
        allowGrowY: false,
        alignX: "center"
      });
      var login = new qxapp.auth.ui.LoginView();
      var register = new qxapp.auth.ui.RegistrationView();
      var resetRequest = new qxapp.auth.ui.ResetPassRequestView();
      var reset = new qxapp.auth.ui.ResetPassView();
      pages.add(login);
      pages.add(register);
      pages.add(resetRequest);
      pages.add(reset);

      this._add(pages, {
        row: 0,
        column: 0
      });

      var page = qxapp.auth.core.Utils.findParameterInFragment("page");
      var code = qxapp.auth.core.Utils.findParameterInFragment("code");

      if (page === "reset-password" && code !== null) {
        pages.setSelection([reset]);
      }

      var urlFragment = qxapp.utils.Utils.parseURLFragment();

      if (urlFragment.nav && urlFragment.nav.length) {
        if (urlFragment.nav[0] === "registration") {
          pages.setSelection([register]);
        } else if (urlFragment.nav[0] === "reset-password") {
          pages.setSelection([reset]);
        }
      } else if (urlFragment.params && urlFragment.params.registered) {
        qxapp.component.message.FlashMessenger.getInstance().logAs(this.tr("Your account has been created.<br>You can now use your credentials to login."));
      } // Transitions between pages


      login.addListener("done", function (msg) {
        login.resetValues();

        _this.fireDataEvent("done", msg);
      }, this);
      login.addListener("toReset", function (e) {
        pages.setSelection([resetRequest]);
        login.resetValues();
      }, this);
      login.addListener("toRegister", function (e) {
        pages.setSelection([register]);
        login.resetValues();
      }, this);
      [register, resetRequest, reset].forEach(function (srcPage) {
        srcPage.addListener("done", function (msg) {
          pages.setSelection([login]);
          srcPage.resetValues();
        }, _this);
      });

      this.__addVersionLink();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      "done": "qx.event.type.Data"
    },
    members: {
      __addVersionLink: function __addVersionLink() {
        var versionLinkLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({
          alignX: "center"
        })).set({
          margin: [10, 0]
        });
        var platformVersion = qxapp.utils.LibVersions.getPlatformVersion();

        if (platformVersion) {
          var text = platformVersion.name + " v" + platformVersion.version;
          var versionLink = new qxapp.ui.basic.LinkLabel(text, platformVersion.url).set({
            font: "text-12",
            textColor: "text-darker"
          });
          versionLinkLayout.add(versionLink);
          var separator = new qx.ui.basic.Label("::");
          versionLinkLayout.add(separator);
        }

        var organizationLink = new qxapp.ui.basic.LinkLabel("© 2019 IT'IS Foundation", "https://itis.swiss").set({
          font: "text-12",
          textColor: "text-darker"
        });
        versionLinkLayout.add(organizationLink);

        this._add(versionLinkLayout, {
          row: 1,
          column: 0
        });
      }
    }
  });
  qxapp.auth.LoginPage.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=LoginPage.js.map?dt=1568886159547