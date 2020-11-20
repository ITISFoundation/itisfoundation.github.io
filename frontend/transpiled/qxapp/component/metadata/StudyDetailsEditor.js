function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
      "qx.ui.layout.Grow": {
        "construct": true
      },
      "qx.data.marshal.Json": {
        "construct": true
      },
      "qx.ui.container.Stack": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.VBox": {},
      "qxapp.component.metadata.StudyDetails": {},
      "qxapp.data.Permissions": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.form.Button": {},
      "qxapp.utils.Utils": {},
      "qx.ui.core.Spacer": {},
      "qx.ui.form.TextField": {},
      "qx.ui.form.TextArea": {},
      "qx.ui.basic.Label": {},
      "qxapp.io.rest.ResourceFactory": {},
      "qxapp.component.message.FlashMessenger": {},
      "qx.util.Serializer": {},
      "qxapp.wrapper.DOMPurify": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /*
   * oSPARC - The SIMCORE frontend - https://osparc.io
   * Copyright: 2019 IT'IS Foundation - https://itis.swiss
   * License: MIT - https://opensource.org/licenses/MIT
   * Authors: Ignacio Pascual (ignapas)
   *          Odei Maiz (odeimaiz)
   */

  /**
   * Widget that contains a stack with a StudyDetails and Study Details Editor form.
   *
   * It also provides options for opening the study and creating a template out of it if the
   * user has the permissios.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *    const serviceInfo = new qxapp.component.metadata.ServiceInfo(selectedService);
   *    this.add(serviceInfo);
   * </pre>
   */
  qx.Class.define("qxapp.component.metadata.StudyDetailsEditor", {
    extend: qx.ui.core.Widget,

    /**
      * @param study {Object|qxapp.data.model.Study} Study (metadata)
      * @param isTemplate {Boolean} Weather the study is template or not
      */
    construct: function construct(study, isTemplate) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Grow());

      this.__model = qx.data.marshal.Json.createModel(study);
      this.__stack = new qx.ui.container.Stack();
      this.__displayView = this.__createDisplayView(study);
      this.__editView = this.__createEditView();

      this.__stack.add(this.__displayView);

      this.__stack.add(this.__editView);

      this._add(this.__stack);

      this.__isTemplate = isTemplate; // Workaround: qx serializer is not doing well with uuid as object keys.

      this.__workbench = study.workbench;
    },
    events: {
      updatedStudy: "qx.event.type.Data",
      updatedTemplate: "qx.event.type.Data",
      closed: "qx.event.type.Event",
      openedStudy: "qx.event.type.Event"
    },
    properties: {
      mode: {
        check: ["display", "edit"],
        init: "display",
        nullable: false,
        apply: "_applyMode"
      }
    },
    members: {
      __stack: null,
      __workbench: null,
      __model: null,
      __isTemplate: null,
      __fields: null,
      __createDisplayView: function __createDisplayView(study) {
        var displayView = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        displayView.add(this.__createButtons());
        displayView.add(new qxapp.component.metadata.StudyDetails(study), {
          flex: 1
        });
        return displayView;
      },
      __createButtons: function __createButtons() {
        var _this = this;

        var isCurrentUserOwner = this.__isCurrentUserOwner();

        var canCreateTemplate = qxapp.data.Permissions.getInstance().canDo("studies.template.create");
        var canUpdateTemplate = qxapp.data.Permissions.getInstance().canDo("studies.template.update");
        var buttonsLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(8).set({
          alignY: "middle"
        })).set({
          marginTop: 10
        });
        var openButton = new qx.ui.form.Button("Open").set({
          appearance: "md-button"
        });
        qxapp.utils.Utils.setIdToWidget(openButton, "openStudyBtn");
        openButton.addListener("execute", function () {
          return _this.fireEvent("openedStudy");
        }, this);
        buttonsLayout.add(openButton);
        var modeButton = new qx.ui.form.Button("Edit", "@FontAwesome5Solid/edit/16").set({
          appearance: "md-button",
          visibility: isCurrentUserOwner && (!this.__isTemplate || canUpdateTemplate) ? "visible" : "excluded"
        });
        qxapp.utils.Utils.setIdToWidget(modeButton, "editStudyBtn");
        modeButton.addListener("execute", function () {
          return _this.setMode("edit");
        }, this);
        buttonsLayout.add(modeButton);
        buttonsLayout.add(new qx.ui.core.Spacer(), {
          flex: 1
        });

        if (isCurrentUserOwner && !this.__isTemplate && canCreateTemplate) {
          var saveAsTemplateButton = new qx.ui.form.Button(this.tr("Save as template")).set({
            appearance: "md-button"
          });
          qxapp.utils.Utils.setIdToWidget(saveAsTemplateButton, "saveAsTemplateBtn");
          saveAsTemplateButton.addListener("execute", function (e) {
            var btn = e.getTarget();
            btn.setIcon("@FontAwesome5Solid/circle-notch/12");
            btn.getChildControl("icon").getContentElement().addClass("rotate");

            _this.__saveAsTemplate(btn);
          }, this);
          buttonsLayout.add(saveAsTemplateButton);
        }

        return buttonsLayout;
      },
      __createEditView: function __createEditView() {
        var _this2 = this;

        var isCurrentUserOwner = this.__isCurrentUserOwner();

        var canUpdateTemplate = qxapp.data.Permissions.getInstance().canDo("studies.template.update");
        var fieldIsEnabled = isCurrentUserOwner && (!this.__isTemplate || canUpdateTemplate);
        var editView = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        var buttons = new qx.ui.container.Composite(new qx.ui.layout.HBox(8).set({
          alignX: "right"
        }));
        this.__fields = {
          name: new qx.ui.form.TextField(this.__model.getName()).set({
            font: "title-18",
            height: 35,
            enabled: fieldIsEnabled
          }),
          description: new qx.ui.form.TextArea(this.__model.getDescription()).set({
            autoSize: true,
            minHeight: 100,
            maxHeight: 500,
            enabled: fieldIsEnabled
          }),
          thumbnail: new qx.ui.form.TextField(this.__model.getThumbnail()).set({
            enabled: fieldIsEnabled
          })
        };
        var modeButton = new qx.ui.form.Button("Save", "@FontAwesome5Solid/save/16").set({
          appearance: "md-button"
        });
        qxapp.utils.Utils.setIdToWidget(modeButton, "studyDetailsEditorSaveBtn");
        modeButton.addListener("execute", function (e) {
          var btn = e.getTarget();
          btn.setIcon("@FontAwesome5Solid/circle-notch/16");
          btn.getChildControl("icon").getContentElement().addClass("rotate");

          _this2.__saveStudy(btn);
        }, this);
        var cancelButton = new qx.ui.form.Button(this.tr("Cancel")).set({
          appearance: "md-button",
          enabled: isCurrentUserOwner && (!this.__isTemplate || canUpdateTemplate)
        });
        qxapp.utils.Utils.setIdToWidget(cancelButton, "studyDetailsEditorCancelBtn");
        cancelButton.addListener("execute", function () {
          return _this2.setMode("display");
        }, this);
        var _this$__fields = this.__fields,
            name = _this$__fields.name,
            description = _this$__fields.description,
            thumbnail = _this$__fields.thumbnail;
        editView.add(new qx.ui.basic.Label(this.tr("Title")).set({
          font: "text-14",
          marginTop: 20
        }));
        qxapp.utils.Utils.setIdToWidget(name, "studyDetailsEditorTitleFld");
        editView.add(name);
        editView.add(new qx.ui.basic.Label(this.tr("Description")).set({
          font: "text-14"
        }));
        qxapp.utils.Utils.setIdToWidget(description, "studyDetailsEditorDescFld");
        editView.add(description);
        editView.add(new qx.ui.basic.Label(this.tr("Thumbnail")).set({
          font: "text-14"
        }));
        qxapp.utils.Utils.setIdToWidget(thumbnail, "studyDetailsEditorThumbFld");
        editView.add(thumbnail);
        editView.add(buttons);
        buttons.add(modeButton);
        buttons.add(cancelButton);
        return editView;
      },
      __saveStudy: function __saveStudy(btn) {
        var _this3 = this;

        var apiCall = qxapp.io.rest.ResourceFactory.getInstance().createStudyResources().project;
        apiCall.addListenerOnce("putSuccess", function (e) {
          btn.resetIcon();
          btn.getChildControl("icon").getContentElement().removeClass("rotate");

          _this3.fireDataEvent(_this3.__isTemplate ? "updatedTemplate" : "updatedStudy", e);

          var data = e.getData().data;

          _this3.__model.set(data);

          _this3.setMode("display");
        }, this);
        apiCall.addListenerOnce("putError", function (e) {
          btn.resetIcon();
          btn.getChildControl("icon").getContentElement().removeClass("rotate");
          console.error(e);
          qxapp.component.message.FlashMessenger.getInstance().logAs(_this3.tr("There was an error while updating the information."), "ERROR");
        }, this);
        apiCall.put({
          "project_id": this.__model.getUuid()
        }, this.__serializeForm());
      },
      __saveAsTemplate: function __saveAsTemplate(btn) {
        var _this4 = this;

        var apiCall = qxapp.io.rest.ResourceFactory.getInstance().createStudyResources().projects;
        apiCall.addListenerOnce("postSaveAsTemplateSuccess", function (e) {
          btn.resetIcon();
          btn.getChildControl("icon").getContentElement().removeClass("rotate");

          _this4.fireDataEvent("updatedTemplate", e);

          var data = e.getData().data;

          _this4.__model.set(data);

          _this4.setMode("display");
        }, this);
        apiCall.addListenerOnce("postSaveAsTemplateError", function (e) {
          btn.resetIcon();
          console.error(e);
          qxapp.component.message.FlashMessenger.getInstance().logAs(_this4.tr("There was an error while saving as template."), "ERROR");
        }, this);
        apiCall.postSaveAsTemplate({
          "study_id": this.__model.getUuid()
        }, this.__serializeForm());
      },
      __serializeForm: function __serializeForm() {
        var _this5 = this;

        var data = _objectSpread({}, qx.util.Serializer.toNativeObject(this.__model), {
          workbench: this.__workbench
        });

        for (var key in this.__fields) {
          data[key] = this.__fields[key].getValue();
        } // Protect text fields against injecting malicious html/code in them


        ["name", "description", "thumbnail"].forEach(function (fieldKey) {
          var dirty = data[fieldKey];
          var clean = qxapp.wrapper.DOMPurify.getInstance().sanitize(dirty);

          if (dirty !== clean) {
            qxapp.component.message.FlashMessenger.getInstance().logAs(_this5.tr("There was an issue in the text of ") + fieldKey, "ERROR");
          }

          data[fieldKey] = clean;
        }, this);
        return data;
      },
      _applyMode: function _applyMode(mode) {
        switch (mode) {
          case "display":
            this.__stack.setSelection([this.__displayView]);

            break;

          case "edit":
            this.__stack.setSelection([this.__editView]);

            break;
        }
      },
      __isCurrentUserOwner: function __isCurrentUserOwner() {
        if (this.__model) {
          return this.__model.getPrjOwner() === qxapp.data.Permissions.getInstance().getLogin();
        }

        return false;
      }
    }
  });
  qxapp.component.metadata.StudyDetailsEditor.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=StudyDetailsEditor.js.map?dt=1568886160732