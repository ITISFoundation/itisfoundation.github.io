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
      "qx.ui.form.TextField": {},
      "qxapp.data.Permissions": {},
      "qx.ui.form.SelectBox": {},
      "qx.ui.form.ListItem": {},
      "qx.ui.form.Form": {},
      "qx.ui.form.renderer.Single": {},
      "qx.ui.basic.Image": {},
      "qx.ui.decoration.Decorator": {},
      "qx.data.marshal.Json": {},
      "qx.data.controller.Object": {},
      "qxapp.utils.Avatar": {},
      "qx.ui.form.validation.Manager": {},
      "qx.util.Validate": {},
      "qx.ui.form.Button": {},
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
   *  User profile in preferences dialog
   *
   *  - user name, surname, email, avatar
   *
   */
  qx.Class.define("qxapp.desktop.preferences.pages.ProfilePage", {
    extend: qxapp.desktop.preferences.pages.BasePage,
    construct: function construct() {
      var iconSrc = "@FontAwesome5Solid/sliders-h/24";
      var title = this.tr("Profile");
      qxapp.desktop.preferences.pages.BasePage.constructor.call(this, title, iconSrc);
      this.__userProfileData = null;
      this.__userProfileModel = null;
      this.add(this.__createProfileUser());
    },
    members: {
      __userProfileData: null,
      __userProfileModel: null,
      __createProfileUser: function __createProfileUser() {
        var _this = this;

        // layout
        var box = this._createSectionBox("User");

        var email = new qx.ui.form.TextField().set({
          placeholder: this.tr("Email")
        });
        var firstName = new qx.ui.form.TextField().set({
          placeholder: this.tr("First Name")
        });
        var lastName = new qx.ui.form.TextField().set({
          placeholder: this.tr("Last Name")
        });
        var role = null;
        var permissions = qxapp.data.Permissions.getInstance();

        if (permissions.canDo("preferences.role.update")) {
          role = new qx.ui.form.SelectBox();
          var roles = permissions.getChildrenRoles(permissions.getRole());

          for (var i = 0; i < roles.length; i++) {
            var roleItem = new qx.ui.form.ListItem(roles[i]);
            role.add(roleItem);
            role.setSelection([roleItem]);
          }

          role.addListener("changeSelection", function (e) {
            var newRole = e.getData()[0].getLabel();
            permissions.setRole(newRole);
          }, this);
        } else {
          role = new qx.ui.form.TextField().set({
            readOnly: true
          });
        }

        var form = new qx.ui.form.Form();
        form.add(email, "", null, "email");
        form.add(firstName, "", null, "firstName");
        form.add(lastName, "", null, "lastName");
        form.add(role, "", null, "role");
        box.add(new qx.ui.form.renderer.Single(form));
        var img = new qx.ui.basic.Image().set({
          decorator: new qx.ui.decoration.Decorator().set({
            radius: 50
          }),
          alignX: "center"
        });
        box.add(img); // binding to a model

        var raw = {
          "firstName": null,
          "lastName": null,
          "email": null,
          "role": null
        };
        {
          raw = {
            "firstName": "Bizzy",
            "lastName": "Zastrow",
            "email": "bizzy@itis.ethz.ch",
            "role": "Tester"
          };
        }
        var model = this.__userProfileModel = qx.data.marshal.Json.createModel(raw);
        var controller = new qx.data.controller.Object(model);
        controller.addTarget(email, "value", "email", true);
        controller.addTarget(firstName, "value", "firstName", true, null, {
          converter: function converter(data) {
            return data.replace(/^\w/, function (c) {
              return c.toUpperCase();
            });
          }
        });
        controller.addTarget(lastName, "value", "lastName", true);
        controller.addTarget(role, "value", "role", false);
        controller.addTarget(img, "source", "email", false, {
          converter: function converter(data) {
            return qxapp.utils.Avatar.getUrl(email.getValue(), 150);
          }
        }); // validation

        var manager = new qx.ui.form.validation.Manager();
        manager.add(email, qx.util.Validate.email());
        [firstName, lastName].forEach(function (field) {
          manager.add(field, qx.util.Validate.regExp(/[^\.\d]+/), _this.tr("Avoid dots or numbers in text"));
        });
        var updateBtn = new qx.ui.form.Button("Update Profile").set({
          allowGrowX: false
        });
        box.add(updateBtn); // update trigger

        updateBtn.addListener("execute", function () {
          if (!qxapp.data.Permissions.getInstance().canDo("preferences.user.update", true)) {
            _this.__resetDataToModel();

            return;
          }

          if (manager.validate()) {
            var emailReq = new qxapp.io.request.ApiRequest("/auth/change-email", "POST");
            emailReq.setRequestData({
              "email": model.getEmail()
            });
            var profileReq = new qxapp.io.request.ApiRequest("/me", "PUT");
            profileReq.setRequestData({
              "first_name": model.getFirstName(),
              "last_name": model.getLastName()
            });
            [emailReq, profileReq].forEach(function (req) {
              // requests
              req.addListenerOnce("success", function (e) {
                var res = e.getTarget().getResponse();

                if (res && res.data) {
                  qxapp.component.message.FlashMessenger.getInstance().log(res.data);
                }
              }, _this);
              req.addListenerOnce("fail", function (e) {
                // FIXME: should revert to old?? or GET? Store might resolve this??
                _this.__resetDataToModel();

                var error = e.getTarget().getResponse().error;
                var msg = error ? error["errors"][0].message : _this.tr("Failed to update profile");
                qxapp.component.message.FlashMessenger.getInstance().logAs(msg, "ERROR");
              }, _this);
              req.send();
            });
          }
        }, this);

        this.__getValuesFromServer();

        return box;
      },
      __getValuesFromServer: function __getValuesFromServer() {
        var _this2 = this;

        // get values from server
        var request = new qxapp.io.request.ApiRequest("/me", "GET");
        request.addListenerOnce("success", function (e) {
          var data = e.getTarget().getResponse()["data"];

          _this2.__setDataToModel(data);
        }, this);
        request.addListenerOnce("fail", function (e) {
          var error = e.getTarget().getResponse().error;
          var msg = error ? error["errors"][0].message : _this2.tr("Failed to get profile");
          qxapp.component.message.FlashMessenger.getInstance().logAs(msg, "ERROR", "user");
        });
        request.send();
      },
      __setDataToModel: function __setDataToModel(data) {
        if (data) {
          this.__userProfileData = data;

          this.__userProfileModel.set({
            "firstName": data["first_name"] || "",
            "lastName": data["last_name"] || "",
            "email": data["login"],
            "role": data["role"] || ""
          });
        }
      },
      __resetDataToModel: function __resetDataToModel() {
        this.__setDataToModel(this.__userProfileData);
      }
    }
  });
  qxapp.desktop.preferences.pages.ProfilePage.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ProfilePage.js.map?dt=1568886163477