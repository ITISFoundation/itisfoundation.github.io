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
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.VBox": {},
      "qx.ui.form.TextField": {},
      "qxapp.utils.Utils": {},
      "qx.ui.form.TextArea": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.basic.Label": {},
      "qx.ui.form.Button": {},
      "qx.ui.form.validation.Manager": {},
      "qx.ui.form.validation.AsyncValidator": {}
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
   * Widget that provides the form for creating a new study
   *
   * After doing some Study title validation the following data event is fired:
   * <pre class='javascript'>
   *   {
   *     prjTitle: title,
   *     prjDescription: desc,
   *     prjTemplateId: templ
   *   };
   * </pre>
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let newStudyDlg = new qxapp.component.widget.NewStudyDlg();
   *   this.getRoot().add(newStudyDlg);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.NewStudyDlg", {
    extend: qx.ui.core.Widget,
    construct: function construct() {
      var template = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      qx.ui.core.Widget.constructor.call(this);
      var newPrjLayout = new qx.ui.layout.Canvas();

      this._setLayout(newPrjLayout);

      this.__createForm(template);
    },
    events: {
      "createStudy": "qx.event.type.Data"
    },
    members: {
      __createForm: function __createForm(template) {
        var prjFormLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
        var studyTitle = new qx.ui.form.TextField().set({
          placeholder: this.tr("Study Title"),
          value: template ? template.name : ""
        });
        qxapp.utils.Utils.setIdToWidget(studyTitle, "newStudyTitleFld");
        this.addListener("appear", function () {
          studyTitle.activate();
          studyTitle.focus();
        });
        prjFormLayout.add(studyTitle);
        var description = new qx.ui.form.TextArea().set({
          minHeight: 150,
          placeholder: this.tr("Describe your study..."),
          value: template ? template.description : ""
        });
        qxapp.utils.Utils.setIdToWidget(description, "newStudyDescFld");
        prjFormLayout.add(description, {
          flex: 1
        });

        if (template) {
          var templateLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
          var label1 = new qx.ui.basic.Label(this.tr("Selected template: "));
          var label2 = new qx.ui.basic.Label(template.name);
          templateLayout.add(label1);
          templateLayout.add(label2);
          prjFormLayout.add(templateLayout);
        }

        var createBtn = new qx.ui.form.Button(this.tr("Create"));
        qxapp.utils.Utils.setIdToWidget(createBtn, "newStudySubmitBtn");
        prjFormLayout.add(createBtn); // create the form manager

        var manager = new qx.ui.form.validation.Manager(); // create a async validator function

        var studyTitleValidator = new qx.ui.form.validation.AsyncValidator(function (validator, value) {
          if (value === null || value.length === 0) {
            validator.setValid(false, "Study title is required");
          } else {
            validator.setValid(true);
          }
        });
        manager.add(studyTitle, studyTitleValidator);
        manager.addListener("complete", function () {
          if (!manager.getValid()) {
            return;
          }

          var title = studyTitle.getValue();
          var desc = description.getValue();
          var data = {
            prjTitle: title,
            prjDescription: desc ? desc : ""
          };

          if (template) {
            data["prjTemplateId"] = template.uuid;
          }

          this.fireDataEvent("createStudy", data);
        }, this);
        createBtn.addListener("execute", function () {
          manager.validate();
        }, this);

        this._add(prjFormLayout, {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        });
      }
    }
  });
  qxapp.component.widget.NewStudyDlg.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NewStudyDlg.js.map?dt=1568886161067