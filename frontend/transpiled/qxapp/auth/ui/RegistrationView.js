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
      "qxapp.utils.Utils": {},
      "qx.ui.form.PasswordField": {},
      "qx.util.Validate": {},
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

  /**
   *
   *  TODO: add a check to prevent bots to register users
  */
  qx.Class.define("qxapp.auth.ui.RegistrationView", {
    extend: qxapp.auth.core.BaseAuthPage,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __email: null,
      // overrides base
      _buildPage: function _buildPage() {
        var _this = this;

        var validator = new qx.ui.form.validation.Manager();

        this._addTitleHeader(this.tr("Registration")); // email, pass1 == pass2


        var email = new qx.ui.form.TextField().set({
          required: true,
          placeholder: this.tr("Introduce your email")
        });
        this.add(email);
        qxapp.utils.Utils.setIdToWidget(email, "registrationEmailFld");
        this.__email = email; // const uname = new qx.ui.form.TextField().set({
        //   required: true,
        //   placeholder: this.tr("Introduce a user name")
        // });
        // this.add(uname);

        var pass1 = new qx.ui.form.PasswordField().set({
          required: true,
          placeholder: this.tr("Introduce a password")
        });
        qxapp.utils.Utils.setIdToWidget(pass1, "registrationPass1Fld");
        this.add(pass1);
        var pass2 = new qx.ui.form.PasswordField().set({
          required: true,
          placeholder: this.tr("Retype the password")
        });
        qxapp.utils.Utils.setIdToWidget(pass2, "registrationPass2Fld");
        this.add(pass2);
        var urlFragment = qxapp.utils.Utils.parseURLFragment();
        var token = urlFragment.params ? urlFragment.params.invitation || null : null;
        var invitation = new qx.ui.form.TextField().set({
          visibility: "excluded",
          value: token
        });
        this.add(invitation); // validation

        validator.add(email, qx.util.Validate.email());
        validator.setValidator(function (_itemForms) {
          return qxapp.auth.core.Utils.checkSamePasswords(pass1, pass2);
        }); // submit & cancel buttons

        var grp = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
        var submitBtn = new qx.ui.form.Button(this.tr("Submit"));
        qxapp.utils.Utils.setIdToWidget(submitBtn, "registrationSubmitBtn");
        grp.add(submitBtn, {
          flex: 1
        });
        var cancelBtn = new qx.ui.form.Button(this.tr("Cancel"));
        qxapp.utils.Utils.setIdToWidget(cancelBtn, "registrationCancelBtn");
        grp.add(cancelBtn, {
          flex: 1
        }); // interaction

        submitBtn.addListener("execute", function (e) {
          var valid = validator.validate();

          if (valid) {
            _this.__submit({
              email: email.getValue(),
              password: pass1.getValue(),
              confirm: pass2.getValue(),
              invitation: invitation.getValue() ? invitation.getValue() : ""
            });
          }
        }, this);
        cancelBtn.addListener("execute", function (e) {
          return _this.fireDataEvent("done", null);
        }, this);
        this.add(grp);
      },
      __submit: function __submit(userData) {
        console.debug("Registering new user");
        var manager = qxapp.auth.Manager.getInstance();

        var successFun = function successFun(log) {
          this.fireDataEvent("done", log.message);
          qxapp.component.message.FlashMessenger.getInstance().log(log);
        };

        var failFun = function failFun(msg) {
          msg = msg || this.tr("Cannot register user");
          qxapp.component.message.FlashMessenger.getInstance().logAs(msg, "ERROR");
        };

        manager.register(userData, successFun, failFun, this);
      }
    }
  });
  qxapp.auth.ui.RegistrationView.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=RegistrationView.js.map?dt=1568886159773