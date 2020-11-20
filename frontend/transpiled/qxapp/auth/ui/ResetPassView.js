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
      "qx.ui.form.PasswordField": {},
      "qxapp.utils.Utils": {},
      "qx.ui.form.TextField": {},
      "qxapp.auth.core.Utils": {},
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

  /** Page to reset user's password
   *
   */
  qx.Class.define("qxapp.auth.ui.ResetPassView", {
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

        var validator = new qx.ui.form.validation.Manager();

        this._addTitleHeader(this.tr("Reset Password"));

        var password = new qx.ui.form.PasswordField().set({
          required: true,
          placeholder: this.tr("Your new password")
        });
        this.add(password);
        var confirm = new qx.ui.form.PasswordField().set({
          required: true,
          placeholder: this.tr("Retype your new password")
        });
        this.add(confirm);
        var urlFragment = qxapp.utils.Utils.parseURLFragment();
        var resetCode = urlFragment.params ? urlFragment.params.code || null : null;
        var code = new qx.ui.form.TextField().set({
          visibility: "excluded",
          value: resetCode
        });
        this.add(code);
        validator.setValidator(function (_itemForms) {
          return qxapp.auth.core.Utils.checkSamePasswords(password, confirm);
        }); // submit and cancel buttons

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
          var valid = validator.validate();

          if (valid) {
            _this.__submit(password.getValue(), confirm.getValue(), code.getValue());
          }
        }, this);
        cancelBtn.addListener("execute", function (e) {
          _this.fireDataEvent("done", null);
        }, this);
        this.add(grp);
      },
      __submit: function __submit(password, confirm, code) {
        var manager = qxapp.auth.Manager.getInstance();

        var successFun = function successFun(log) {
          this.fireDataEvent("done", log.message);
          qxapp.component.message.FlashMessenger.getInstance().log(log);
        };

        var failFun = function failFun(msg) {
          msg = msg || this.tr("Could not reset password");
          qxapp.component.message.FlashMessenger.getInstance().logAs(msg, "ERROR", "user");
        };

        manager.resetPassword(password, confirm, code, successFun, failFun, this);
      }
    }
  });
  qxapp.auth.ui.ResetPassView.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ResetPassView.js.map?dt=1568886159848