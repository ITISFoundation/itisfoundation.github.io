(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.auth.core.BaseAuthPage": {
        "require": true
      },
      "qx.ui.form.validation.Manager": {},
      "qx.ui.form.TextField": {},
      "qx.util.Validate": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.form.Button": {},
      "qxapp.auth.Manager": {},
      "qxapp.component.message.FlashMessenger": {}
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

  /** Page to request password reset for a non-logged-in user
   *
   */
  qx.Class.define("qxapp.auth.ui.ResetPassRequestView", {
    extend: qxapp.auth.core.BaseAuthPage,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overrides base
      _buildPage: function _buildPage() {
        var _this = this;

        var manager = new qx.ui.form.validation.Manager();

        this._addTitleHeader(this.tr("Reset Password")); // email


        var email = new qx.ui.form.TextField();
        email.setRequired(true);
        email.setPlaceholder(this.tr("Introduce your registration email"));
        this.add(email);
        manager.add(email, qx.util.Validate.email()); // submit and cancel buttons

        var grp = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
        var submitBtn = new qx.ui.form.Button(this.tr("Submit"));
        grp.add(submitBtn, {
          flex: 1
        });
        var cancelBtn = new qx.ui.form.Button(this.tr("Cancel"));
        grp.add(cancelBtn, {
          flex: 1
        }); // interaction

        submitBtn.addListener("execute", function (e) {
          var valid = manager.validate();

          if (valid) {
            _this.__submit(email);
          }
        }, this);
        cancelBtn.addListener("execute", function (e) {
          return _this.fireDataEvent("done", null);
        }, this);
        this.add(grp);
      },
      __submit: function __submit(email) {
        console.debug("sends email to reset password to ", email);
        var manager = qxapp.auth.Manager.getInstance();

        var successFun = function successFun(log) {
          this.fireDataEvent("done", log.message);
          qxapp.component.message.FlashMessenger.getInstance().log(log);
        };

        var failFun = function failFun(msg) {
          msg = msg || this.tr("Could not request password reset");
          qxapp.component.message.FlashMessenger.getInstance().logAs(msg, "ERROR");
        };

        manager.resetPasswordRequest(email.getValue(), successFun, failFun, this);
      }
    }
  });
  qxapp.auth.ui.ResetPassRequestView.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ResetPassRequestView.js.map?dt=1568886159806