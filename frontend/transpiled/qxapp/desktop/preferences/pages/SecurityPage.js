(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.desktop.preferences.pages.BasePage": {
        "construct": true,
        "require": true
      },
      "qxapp.io.rest.ResourceFactory": {
        "construct": true
      },
      "qxapp.ui.form.LinkButton": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.VBox": {},
      "qx.ui.form.renderer.Single": {},
      "qx.ui.form.Form": {},
      "qx.ui.form.TextField": {},
      "qx.ui.form.Button": {},
      "qxapp.data.Permissions": {},
      "qx.ui.form.PasswordField": {},
      "qx.ui.form.validation.Manager": {},
      "qxapp.auth.core.Utils": {},
      "qxapp.io.request.ApiRequest": {},
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
   *  Security page
   *
   *  - access token
   *  - reset password (logged in)
   *
   */
  qx.Class.define("qxapp.desktop.preferences.pages.SecurityPage", {
    extend: qxapp.desktop.preferences.pages.BasePage,
    construct: function construct() {
      var iconSrc = "@FontAwesome5Solid/shield-alt/24";
      var title = this.tr("Security");
      qxapp.desktop.preferences.pages.BasePage.constructor.call(this, title, iconSrc);
      this.__tokenResources = qxapp.io.rest.ResourceFactory.getInstance().createTokenResources();
      this.add(this.__createPasswordSection());
      this.add(this.__createTokensSection());
    },
    members: {
      __tokenResources: null,
      __tokensList: null,
      __createTokensSection: function __createTokensSection() {
        // layout
        var box = this._createSectionBox(this.tr("Access Tokens"));

        var label = this._createHelpLabel(this.tr("List of API tokens to access external services. Currently, \
         only DAT-Core API keys are supported."));

        box.add(label);
        var linkBtn = new qxapp.ui.form.LinkButton(this.tr("To DAT-Core"), "https://app.blackfynn.io");
        box.add(linkBtn);
        this.__tokensList = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

        this.__rebuildTokensList();

        box.add(this.__tokensList);
        return box;
      },
      __rebuildTokensList: function __rebuildTokensList() {
        var _this = this;

        this.__tokensList.removeAll();

        var tokens = this.__tokenResources.tokens;
        tokens.addListenerOnce("getSuccess", function (e) {
          var tokensList = e.getRequest().getResponse().data;

          if (tokensList.length === 0) {
            var emptyForm = _this.__createEmptyTokenForm();

            _this.__tokensList.add(new qx.ui.form.renderer.Single(emptyForm));
          } else {
            for (var i = 0; i < tokensList.length; i++) {
              var token = tokensList[i];

              var tokenForm = _this.__createValidTokenForm(token["service"], token["token_key"], token["token_secret"]);

              _this.__tokensList.add(new qx.ui.form.renderer.Single(tokenForm));
            }
          }
        }, this);
        tokens.addListenerOnce("getError", function (e) {
          console.error(e);
        });
        tokens.get();
      },
      __createEmptyTokenForm: function __createEmptyTokenForm() {
        var _this2 = this;

        var form = new qx.ui.form.Form(); // FIXME: for the moment this is fixed since it has to be a unique id

        var newTokenService = new qx.ui.form.TextField();
        newTokenService.set({
          value: "blackfynn-datcore",
          readOnly: true
        });
        form.add(newTokenService, this.tr("Service")); // TODO:

        var newTokenKey = new qx.ui.form.TextField();
        newTokenKey.set({
          placeholder: this.tr("Introduce token key here")
        });
        form.add(newTokenKey, this.tr("Key"));
        var newTokenSecret = new qx.ui.form.TextField();
        newTokenSecret.set({
          placeholder: this.tr("Introduce token secret here")
        });
        form.add(newTokenSecret, this.tr("Secret"));
        var addTokenBtn = new qx.ui.form.Button(this.tr("Add"));
        addTokenBtn.setWidth(100);
        addTokenBtn.addListener("execute", function (e) {
          if (!qxapp.data.Permissions.getInstance().canDo("preferences.token.create", true)) {
            return;
          }

          var tokens = _this2.__tokenResources.tokens;
          tokens.addListenerOnce("postSuccess", function (ev) {
            _this2.__rebuildTokensList();
          }, _this2);
          tokens.addListenerOnce("getError", function (ev) {
            console.error(ev);
          });
          var newTokenInfo = {
            "service": newTokenService.getValue(),
            "token_key": newTokenKey.getValue(),
            "token_secret": newTokenSecret.getValue()
          };
          tokens.post(null, newTokenInfo);
        }, this);
        form.addButton(addTokenBtn);
        return form;
      },
      __createValidTokenForm: function __createValidTokenForm(service, key, secret) {
        var _this3 = this;

        var form = new qx.ui.form.Form();
        var tokenService = new qx.ui.form.TextField().set({
          value: service,
          readOnly: true
        });
        form.add(tokenService, this.tr("Service API"));
        var tokenKey = new qx.ui.form.TextField();
        tokenKey.set({
          value: key,
          readOnly: true
        });
        form.add(tokenKey, this.tr("Key"));

        if (secret) {
          var tokenSecret = new qx.ui.form.TextField();
          tokenSecret.set({
            value: secret,
            readOnly: true
          });
          form.add(tokenSecret, this.tr("Secret"));
        }

        var delTokenBtn = new qx.ui.form.Button(this.tr("Delete"));
        delTokenBtn.setWidth(100);
        delTokenBtn.addListener("execute", function (e) {
          if (!qxapp.data.Permissions.getInstance().canDo("preferences.token.delete", true)) {
            return;
          }

          var token = _this3.__tokenResources.token;
          token.addListenerOnce("delSuccess", function (eve) {
            _this3.__rebuildTokensList();
          }, _this3);
          token.addListenerOnce("delError", function (eve) {
            console.log(eve);
          });
          token.del({
            "service": service
          });
        }, this);
        form.addButton(delTokenBtn);
        return form;
      },
      __createPasswordSection: function __createPasswordSection() {
        var _this4 = this;

        // layout
        var box = this._createSectionBox(this.tr("Password"));

        var currentPassword = new qx.ui.form.PasswordField().set({
          required: true,
          placeholder: this.tr("Your current password")
        });
        box.add(currentPassword);
        var newPassword = new qx.ui.form.PasswordField().set({
          required: true,
          placeholder: this.tr("Your new password")
        });
        box.add(newPassword);
        var confirm = new qx.ui.form.PasswordField().set({
          required: true,
          placeholder: this.tr("Retype your new password")
        });
        box.add(confirm);
        var manager = new qx.ui.form.validation.Manager();
        manager.setValidator(function (_itemForms) {
          return qxapp.auth.core.Utils.checkSamePasswords(newPassword, confirm);
        });
        var resetBtn = new qx.ui.form.Button("Reset Password").set({
          allowGrowX: false
        });
        box.add(resetBtn);
        resetBtn.addListener("execute", function () {
          if (manager.validate()) {
            var request = new qxapp.io.request.ApiRequest("/auth/change-password", "POST");
            request.setRequestData({
              "current": currentPassword.getValue(),
              "new": newPassword.getValue(),
              "confirm": confirm.getValue()
            });
            request.addListenerOnce("success", function (e) {
              var res = e.getTarget().getResponse();
              qxapp.component.message.FlashMessenger.getInstance().log(res.data);
              [currentPassword, newPassword, confirm].forEach(function (item) {
                item.resetValue();
              });
            }, _this4);
            request.addListenerOnce("fail", function (e) {
              var error = e.getTarget().getResponse().error;
              var msg = error ? error["errors"][0].message : _this4.tr("Failed to reset password");
              qxapp.component.message.FlashMessenger.getInstance().logAs(msg, "ERROR");
              [currentPassword, newPassword, confirm].forEach(function (item) {
                item.resetValue();
              });
            }, _this4);
            request.send();
          }
        });
        return box;
      }
    }
  });
  qxapp.desktop.preferences.pages.SecurityPage.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=SecurityPage.js.map?dt=1568886163541