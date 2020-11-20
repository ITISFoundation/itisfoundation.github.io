function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qxapp.io.rest.ResourceFactory": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qxapp.utils.Utils": {
        "construct": true
      },
      "qx.event.Timer": {
        "construct": true
      },
      "qxapp.data.Permissions": {
        "construct": true
      },
      "qxapp.auth.Manager": {
        "construct": true
      },
      "qxapp.store.Store": {},
      "qxapp.component.filter.TextFilter": {},
      "qx.ui.form.Button": {},
      "qx.bom.Font": {},
      "qxapp.theme.Font": {},
      "qx.ui.basic.Label": {},
      "qx.ui.command.Command": {},
      "qx.ui.window.Window": {},
      "qx.ui.layout.Grow": {},
      "qxapp.component.widget.NewStudyDlg": {},
      "qxapp.data.model.Study": {},
      "qxapp.desktop.StudyEditor": {},
      "qxapp.component.form.ToggleButtonContainer": {},
      "qx.ui.layout.Flow": {},
      "qxapp.desktop.StudyBrowserListItem": {},
      "qxapp.component.metadata.StudyDetailsEditor": {},
      "qxapp.data.model.Node": {}
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
   * Widget that shows two lists of studies and study editor form:
   * - List1: User's studies (StudyBrowserListItem)
   * - List2: Template studies to start from (StudyBrowserListItem)
   * - Form: Extra editable information of the selected study
   *
   * It is the entry point to start editing or creatina new study.
   *
   * Also takes care of retrieveing the list of services and pushing the changes in the metadata.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let prjBrowser = this.__serviceBrowser = new qxapp.desktop.StudyBrowser();
   *   this.getRoot().add(prjBrowser);
   * </pre>
   */
  qx.Class.define("qxapp.desktop.StudyBrowser", {
    extend: qx.ui.core.Widget,
    construct: function construct(loadStudyId) {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.HBox());

      this.__studyResources = qxapp.io.rest.ResourceFactory.getInstance().createStudyResources();
      this.__studiesPane = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      this.__editPane = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
        appearance: "sidepanel",
        width: 570,
        allowGrowX: false,
        visibility: "excluded",
        padding: [0, 15]
      });

      this._addAt(this.__studiesPane, 0, {
        flex: 1
      });

      this._addAt(this.__editPane, 1);

      var iframe = qxapp.utils.Utils.createLoadingIFrame(this.tr("Studies"));

      this.__studiesPane.add(iframe, {
        flex: 1
      });

      var interval = 500;
      var userTimer = new qx.event.Timer(interval);
      userTimer.addListener("interval", function () {
        if (_this.__userReady) {
          userTimer.stop();

          _this.__studiesPane.removeAll();

          _this.__editPane.removeAll();

          iframe.dispose();

          _this.__createStudiesLayout();

          _this.__attachEventHandlers();

          if (loadStudyId) {
            var resource = _this.__studyResources.project;
            resource.addListenerOnce("getSuccess", function (e) {
              var studyData = e.getRequest().getResponse().data;

              _this.__startStudy(studyData);
            }, _this);
            resource.addListener("getError", function (ev) {
              if (qxapp.data.Permissions.getInstance().getRole() === "Guest") {
                // If guest fails to load study, log him out
                qxapp.auth.Manager.getInstance().logout();
              }

              console.error(ev);
            });
            resource.get({
              "project_id": loadStudyId
            });
          }
        }
      }, this);
      userTimer.start();

      this.__initResources();
    },
    events: {
      "startStudy": "qx.event.type.Data"
    },
    statics: {
      sortStudyList: function sortStudyList(studyList) {
        var sortByProperty = function sortByProperty(prop) {
          return function (a, b) {
            if (prop === "lastChangeDate") {
              return new Date(b[prop]) - new Date(a[prop]);
            }

            if (typeof a[prop] == "number") {
              return a[prop] - b[prop];
            }

            if (a[prop] < b[prop]) {
              return -1;
            } else if (a[prop] > b[prop]) {
              return 1;
            }

            return 0;
          };
        };

        studyList.sort(sortByProperty("lastChangeDate"));
      }
    },
    members: {
      __userReady: null,
      __servicesReady: null,
      __studyResources: null,
      __studyFilters: null,
      __userStudyContainer: null,
      __templateStudyContainer: null,
      __editStudyLayout: null,
      __creatingNewStudy: null,
      __studiesPane: null,
      __editPane: null,
      __userStudies: null,
      __templateStudies: null,
      __templateDeleteButton: null,
      __studiesDeleteButton: null,
      __selectedItemId: null,

      /**
       * Function that resets the selected item
       */
      resetSelection: function resetSelection() {
        if (this.__studyFilters) {
          this.__studyFilters.reset();
        }

        this.__itemSelected(null);
      },

      /**
       *  Function that asks the backend for the list of studies belonging to the user
       * and sets it
       */
      reloadUserStudies: function reloadUserStudies() {
        var _this2 = this;

        var resources = this.__studyResources.projects;
        resources.addListenerOnce("getSuccess", function (e) {
          var userStudyList = e.getRequest().getResponse().data;

          _this2.__setStudyList(userStudyList);
        }, this);
        resources.addListener("getError", function (e) {
          console.error(e);
        }, this);

        if (qxapp.data.Permissions.getInstance().canDo("studies.user.read")) {
          resources.get();
        } else {
          this.__setStudyList([]);
        }
      },

      /**
       *  Function that asks the backend for the list of template studies and sets it
       */
      reloadTemplateStudies: function reloadTemplateStudies() {
        var _this3 = this;

        var resources = this.__studyResources.templates;
        resources.addListenerOnce("getSuccess", function (e) {
          var tempStudyList = e.getRequest().getResponse().data;

          _this3.__setTemplateList(tempStudyList);
        }, this);
        resources.addListener("getError", function (e) {
          console.error(e);
        }, this);

        if (qxapp.data.Permissions.getInstance().canDo("studies.templates.read")) {
          resources.get();
        } else {
          this.__setTemplateList([]);
        }
      },
      __initResources: function __initResources() {
        this.__getUserProfile();

        this.__getServicesPreload();
      },
      __getUserProfile: function __getUserProfile() {
        var _this4 = this;

        var permissions = qxapp.data.Permissions.getInstance();
        permissions.addListener("userProfileRecieved", function (e) {
          _this4.__userReady = e.getData();
        }, this);
        permissions.loadUserRoleFromBackend();
      },
      __getServicesPreload: function __getServicesPreload() {
        var _this5 = this;

        var store = qxapp.store.Store.getInstance();
        store.addListener("servicesRegistered", function (e) {
          _this5.__servicesReady = e.getData();
        }, this);
        store.getServices(true);
      },
      __createStudiesLayout: function __createStudiesLayout() {
        var _this6 = this;

        var studyFilters = this.__studyFilters = new qxapp.component.filter.TextFilter("text", "studyBrowser");
        qxapp.utils.Utils.setIdToWidget(studyFilters, "studyFiltersTextFld");
        var newStudyBtn = new qx.ui.form.Button(this.tr("Create new study"), "@FontAwesome5Solid/plus-circle/18").set({
          appearance: "big-button",
          allowGrowX: false,
          width: 210
        });
        qxapp.utils.Utils.setIdToWidget(newStudyBtn, "newStudyBtn");
        newStudyBtn.addListener("execute", function () {
          return _this6.__createStudyBtnClkd();
        });
        var navBarLabelFont = qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["nav-bar-label"]);
        var studiesTitleContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

        var studiesDeleteButton = this.__studiesDeleteButton = this.__createDeleteButton();

        var myStudyLabel = new qx.ui.basic.Label(this.tr("My Studies")).set({
          font: navBarLabelFont
        });
        studiesTitleContainer.add(myStudyLabel);
        studiesTitleContainer.add(studiesDeleteButton);

        var userStudyList = this.__userStudyContainer = this.__createUserStudyList();

        var userStudyLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)).set({
          marginTop: 20
        });
        userStudyLayout.add(studiesTitleContainer);
        userStudyLayout.add(newStudyBtn);
        userStudyLayout.add(userStudyList);
        var templateTitleContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

        var templateDeleteButton = this.__templateDeleteButton = this.__createDeleteButton();

        var tempStudyLabel = new qx.ui.basic.Label(this.tr("Template Studies")).set({
          font: navBarLabelFont
        });
        templateTitleContainer.add(tempStudyLabel);
        templateTitleContainer.add(templateDeleteButton);

        var tempStudyList = this.__templateStudyContainer = this.__createTemplateStudyList();

        var tempStudyLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)).set({
          marginTop: 20
        });
        tempStudyLayout.add(templateTitleContainer);
        tempStudyLayout.add(tempStudyList);
        this.__editStudyLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));

        this.__studiesPane.add(studyFilters);

        this.__studiesPane.add(userStudyLayout);

        this.__studiesPane.add(tempStudyLayout);

        this.__editPane.add(this.__editStudyLayout);
      },
      __createDeleteButton: function __createDeleteButton() {
        var _this7 = this;

        var deleteButton = new qx.ui.form.Button(this.tr("Delete"), "@FontAwesome5Solid/trash/14").set({
          visibility: "excluded"
        });
        qxapp.utils.Utils.setIdToWidget(deleteButton, "deleteStudiesBtn");
        deleteButton.addListener("execute", function (e) {
          var thisButton = e.getTarget();
          var isTemplate = _this7.__templateDeleteButton === thisButton;
          var selection = isTemplate ? _this7.__templateStudyContainer.getSelection() : _this7.__userStudyContainer.getSelection();

          var win = _this7.__createConfirmWindow(selection.length > 1);

          win.center();
          win.open();
          win.addListener("close", function () {
            if (win["value"] === 1) {
              _this7.__deleteStudy(selection.map(function (button) {
                return _this7.__getStudyData(button.getUuid(), isTemplate);
              }), isTemplate);
            }
          }, _this7);
        }, this);
        return deleteButton;
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this8 = this;

        var textfield = this.__studyFilters.getChildControl("textfield", true);

        textfield.addListener("appear", function () {
          textfield.focus();
        }, this);
        var commandEsc = new qx.ui.command.Command("Esc");
        commandEsc.addListener("execute", function (e) {
          _this8.__itemSelected(null);
        });
      },
      __createStudyBtnClkd: function __createStudyBtnClkd(templateData) {
        var _this9 = this;

        if (this.__creatingNewStudy) {
          return;
        }

        this.__creatingNewStudy = true;
        var win = new qx.ui.window.Window(this.tr("Create New Study")).set({
          layout: new qx.ui.layout.Grow(),
          contentPadding: 0,
          showMinimize: false,
          showMaximize: false,
          minWidth: 500,
          centerOnAppear: true,
          autoDestroy: true,
          modal: true,
          appearance: "service-window"
        });
        var newStudyDlg = new qxapp.component.widget.NewStudyDlg(templateData);
        newStudyDlg.addListenerOnce("createStudy", function (e) {
          var minStudyData = qxapp.data.model.Study.createMinimumStudyObject();
          var data = e.getData();
          minStudyData["name"] = data.prjTitle;
          minStudyData["description"] = data.prjDescription;

          _this9.__createStudy(minStudyData, data.prjTemplateId);

          win.close();
        }, this);
        win.add(newStudyDlg);
        win.open();
        win.addListener("close", function () {
          _this9.__creatingNewStudy = false;
        }, this);
      },
      __createStudy: function __createStudy(minStudyData, templateId) {
        var _this10 = this;

        var resources = this.__studyResources.projects;

        if (templateId) {
          resources.addListenerOnce("postFromTemplateSuccess", function (e) {
            var studyData = e.getRequest().getResponse().data;

            _this10.__startStudy(studyData);
          }, this);
          resources.addListenerOnce("postFromTemplateError", function (e) {
            console.error(e);
          });
          resources.postFromTemplate({
            "template_id": templateId
          }, minStudyData);
        } else {
          resources.addListenerOnce("postSuccess", function (e) {
            var studyData = e.getRequest().getResponse().data;

            _this10.__startStudy(studyData);
          }, this);
          resources.addListenerOnce("postError", function (e) {
            console.error(e);
          });
          resources.post(null, minStudyData);
        }
      },
      __startStudy: function __startStudy(studyData) {
        var _this11 = this;

        if (this.__servicesReady === null) {
          this.__showChildren(false);

          var iframe = qxapp.utils.Utils.createLoadingIFrame(this.tr("Services"));

          this._add(iframe, {
            flex: 1
          });

          var interval = 500;
          var servicesTimer = new qx.event.Timer(interval);
          servicesTimer.addListener("interval", function () {
            if (_this11.__servicesReady) {
              servicesTimer.stop();

              _this11._remove(iframe);

              iframe.dispose();

              _this11.__showChildren(true);

              _this11.__loadStudy(studyData);
            }
          }, this);
          servicesTimer.start();
        } else {
          this.__loadStudy(studyData);
        }
      },
      __loadStudy: function __loadStudy(studyData) {
        var study = new qxapp.data.model.Study(studyData, true);
        var studyEditor = new qxapp.desktop.StudyEditor(study);
        this.fireDataEvent("startStudy", studyEditor);
      },
      __showChildren: function __showChildren(show) {
        var children = this._getChildren();

        for (var i = 0; i < children.length; i++) {
          if (show) {
            children[i].setVisibility("visible");
          } else {
            children[i].setVisibility("excluded");
          }
        }
      },
      __createUserStudyList: function __createUserStudyList() {
        var usrLst = this.__userStudyContainer = this.__createStudyListLayout();

        qxapp.utils.Utils.setIdToWidget(usrLst, "userStudiesList");
        this.reloadUserStudies();
        return usrLst;
      },
      __createTemplateStudyList: function __createTemplateStudyList() {
        var tempList = this.__templateStudyContainer = this.__createStudyListLayout();

        qxapp.utils.Utils.setIdToWidget(tempList, "templateStudiesList");
        this.reloadTemplateStudies();
        return tempList;
      },
      __setStudyList: function __setStudyList(userStudyList) {
        var _this12 = this;

        this.__userStudies = userStudyList;

        this.__userStudyContainer.removeAll();

        qxapp.desktop.StudyBrowser.sortStudyList(userStudyList);

        for (var i = 0; i < userStudyList.length; i++) {
          this.__userStudyContainer.add(this.__createStudyItem(userStudyList[i], false));
        }

        this.__itemSelected(this.__selectedItemId);

        if (this.__selectedItemId) {
          var button = this.__userStudyContainer.getChildren().find(function (btn) {
            return btn.getUuid() === _this12.__selectedItemId;
          });

          if (button) {
            button.setValue(true);
          }
        }
      },
      __setTemplateList: function __setTemplateList(tempStudyList) {
        var _this13 = this;

        this.__templateStudies = tempStudyList;

        this.__templateStudyContainer.removeAll();

        qxapp.desktop.StudyBrowser.sortStudyList(tempStudyList);

        for (var i = 0; i < tempStudyList.length; i++) {
          this.__templateStudyContainer.add(this.__createStudyItem(tempStudyList[i], true));
        }

        this.__itemSelected(this.__selectedItemId, true);

        if (this.__selectedItemId) {
          var button = this.__templateStudyContainer.getChildren().find(function (btn) {
            return btn.getUuid() === _this13.__selectedItemId;
          });

          if (button) {
            button.setValue(true);
          }
        }
      },
      __createStudyListLayout: function __createStudyListLayout() {
        return new qxapp.component.form.ToggleButtonContainer(new qx.ui.layout.Flow(8, 8));
      },
      __createStudyItem: function __createStudyItem(study, isTemplate) {
        var _this14 = this;

        var item = new qxapp.desktop.StudyBrowserListItem().set({
          uuid: study.uuid,
          studyTitle: study.name,
          icon: study.thumbnail ? study.thumbnail : qxapp.utils.Utils.getThumbnailFromUuid(study.uuid),
          creator: study.prjOwner ? "Created by: <b>" + study.prjOwner + "</b>" : null,
          lastChangeDate: study.lastChangeDate ? new Date(study.lastChangeDate) : null
        });
        item.subscribeToFilterGroup("studyBrowser");
        item.addListener("dbltap", function (e) {
          var studyData = _this14.__getStudyData(item.getUuid(), isTemplate);

          if (isTemplate) {
            _this14.__createStudyBtnClkd(studyData);
          } else {
            _this14.__startStudy(studyData);
          }
        });
        item.addListener("execute", function (e) {
          // Selection logic
          if (item.getValue()) {
            if (isTemplate) {
              _this14.__userStudyContainer.resetSelection();

              _this14.__templateStudyContainer.selectOne(item);
            } else {
              _this14.__templateStudyContainer.resetSelection();
            }

            _this14.__itemSelected(item.getUuid(), isTemplate);
          } else if (isTemplate) {
            _this14.__itemSelected(null);

            _this14.__templateDeleteButton.exclude();
          } else {
            var selection = _this14.__userStudyContainer.getSelection();

            if (selection.length) {
              _this14.__itemSelected(selection[0].getUuid());
            } else {
              _this14.__studiesDeleteButton.exclude();

              _this14.__itemSelected(null);
            }
          }
        }, this);
        return item;
      },
      __getStudyData: function __getStudyData(id, isTemplate) {
        var matchesId = function matchesId(study) {
          return study.uuid === id;
        };

        return isTemplate ? this.__templateStudies.find(matchesId) : this.__userStudies.find(matchesId);
      },
      __itemSelected: function __itemSelected(studyId) {
        var isTemplate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (studyId === null) {
          if (this.__userStudyContainer) {
            this.__userStudyContainer.resetSelection();
          }

          if (this.__templateStudyContainer) {
            this.__templateStudyContainer.resetSelection();
          }

          if (this.__editStudyLayout) {
            this.__editPane.exclude();
          }

          if (this.__studiesDeleteButton) {
            this.__studiesDeleteButton.exclude();
          }

          if (this.__templateDeleteButton) {
            this.__templateDeleteButton.exclude();
          }

          this.__selectedItemId = null;
          return;
        }

        this.__selectedItemId = studyId;

        var studyData = this.__getStudyData(studyId, isTemplate);

        this.__createForm(studyData, isTemplate);

        this.__editPane.setVisibility("visible");
      },
      __createForm: function __createForm(studyData, isTemplate) {
        var _this15 = this;

        this.__editStudyLayout.removeAll();

        var studyDetails = new qxapp.component.metadata.StudyDetailsEditor(studyData, isTemplate);
        studyDetails.addListener("closed", function () {
          return _this15.__itemSelected(null);
        }, this);
        studyDetails.addListener("updatedStudy", function (study) {
          return _this15.reloadUserStudies();
        }, this);
        studyDetails.addListener("updatedTemplate", function (template) {
          return _this15.reloadTemplateStudies();
        }, this);
        studyDetails.addListener("openedStudy", function () {
          if (isTemplate) {
            _this15.__createStudyBtnClkd(studyData);
          } else {
            _this15.__startStudy(studyData);
          }
        }, this);

        this.__editStudyLayout.add(studyDetails);

        this.__updateDeleteButtons(studyData, isTemplate);
      },
      __updateDeleteButtons: function __updateDeleteButtons(studyData, isTemplate) {
        var canDeleteTemplate = qxapp.data.Permissions.getInstance().canDo("studies.template.delete");
        var isCurrentUserOwner = studyData.prjOwner === qxapp.data.Permissions.getInstance().getLogin();
        var deleteButton = this.__studiesDeleteButton;

        if (isTemplate) {
          this.__studiesDeleteButton.exclude();

          deleteButton = this.__templateDeleteButton;
        } else {
          this.__templateDeleteButton.exclude();

          this.__studiesDeleteButton.setLabel(this.__userStudyContainer.getSelection().length > 1 ? this.tr("Delete selected") : this.tr("Delete"));
        }

        deleteButton.show();
        deleteButton.setEnabled(isCurrentUserOwner && (!isTemplate || canDeleteTemplate));
      },
      __deleteStudy: function __deleteStudy(studyData) {
        var _this16 = this;

        var isTemplate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        this.__stopInteractiveServicesInStudy(studyData);

        var resource = this.__studyResources.project;
        resource.addListenerOnce("delSuccess", function (ev) {
          if (isTemplate) {
            _this16.reloadTemplateStudies();
          } else {
            _this16.reloadUserStudies();
          }
        }, this);
        studyData.forEach(function (study) {
          resource.del({
            "project_id": study.uuid
          });
        });

        this.__itemSelected(null);
      },
      __stopInteractiveServicesInStudy: function __stopInteractiveServicesInStudy(studies) {
        var store = qxapp.store.Store.getInstance();
        studies.forEach(function (studyData) {
          for (var _i = 0, _Object$entries = Object.entries(studyData["workbench"]); _i < _Object$entries.length; _i++) {
            var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
                nodeId = _Object$entries$_i[0],
                nodedata = _Object$entries$_i[1];

            var metadata = store.getNodeMetaData(nodedata.key, nodedata.version);

            if (qxapp.data.model.Node.isDynamic(metadata) && qxapp.data.model.Node.isRealService(metadata)) {
              store.stopInteractiveService(nodeId);
            }
          }
        });
      },
      __createConfirmWindow: function __createConfirmWindow(isMulti) {
        var win = new qx.ui.window.Window("Confirmation").set({
          layout: new qx.ui.layout.VBox(10),
          width: 300,
          height: 60,
          modal: true,
          showMaximize: false,
          showMinimize: false,
          showClose: false,
          autoDestroy: false,
          appearance: "service-window"
        });
        var message = "Are you sure you want to delete the ".concat(isMulti ? "studies" : "study", "?");
        var text = new qx.ui.basic.Label(this.tr(message));
        win.add(text);
        var buttons = new qx.ui.container.Composite(new qx.ui.layout.HBox(10, "right"));
        var btnNo = new qx.ui.form.Button("No");
        qxapp.utils.Utils.setIdToWidget(btnNo, "cancelDeleteStudyBtn");
        var btnYes = new qx.ui.form.Button("Yes");
        qxapp.utils.Utils.setIdToWidget(btnYes, "confirmDeleteStudyBtn");
        btnNo.addListener("execute", function (e) {
          win["value"] = 0;
          win.close(0);
        }, this);
        btnYes.addListener("execute", function (e) {
          win["value"] = 1;
          win.close(1);
        }, this);
        buttons.add(btnNo);
        buttons.add(btnYes);
        win.add(buttons);
        return win;
      }
    }
  });
  qxapp.desktop.StudyBrowser.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=StudyBrowser.js.map?dt=1568886163107