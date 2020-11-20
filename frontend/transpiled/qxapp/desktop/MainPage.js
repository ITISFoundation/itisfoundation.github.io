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
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qxapp.io.WatchDog": {
        "construct": true
      },
      "qxapp.desktop.NavigationBar": {},
      "qxapp.data.Permissions": {},
      "qx.ui.container.Stack": {},
      "qxapp.desktop.Dashboard": {}
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
   * Widget managing the layout once the user is logged in.
   *
   * It offers a:
   * - NavigationBar
   * - Main View (Stack).
   *   - Dashboard (Stack):
   *     - StudyBrowser
   *     - ServiceBrowser
   *     - DataManager
   *   - StudyEditor
   *
   * <pre class='javascript'>
   *   let layoutManager = new qxapp.desktop.MainPage();
   *   this.getRoot().add(layoutManager);
   * </pre>
   */
  qx.Class.define("qxapp.desktop.MainPage", {
    extend: qx.ui.core.Widget,
    construct: function construct(studyId) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.VBox());

      var navBar = this.__navBar = this.__createNavigationBar();

      this._add(navBar);

      var prjStack = this.__prjStack = this.__createMainView(studyId);

      this._add(prjStack, {
        flex: 1
      });

      qxapp.io.WatchDog.getInstance().startCheck();
    },
    events: {},
    members: {
      __navBar: null,
      __prjStack: null,
      __dashboard: null,
      __studyEditor: null,
      __createNavigationBar: function __createNavigationBar() {
        var _this = this;

        var navBar = new qxapp.desktop.NavigationBar().set({
          height: 100
        });
        navBar.addListener("dashboardPressed", function () {
          if (!qxapp.data.Permissions.getInstance().canDo("studies.user.create", true)) {
            return;
          }

          if (_this.__studyEditor) {
            _this.__studyEditor.updateStudyDocument();

            _this.__studyEditor.closeStudy();
          }

          _this.__showDashboard();
        }, this);
        navBar.addListener("nodeDoubleClicked", function (e) {
          if (_this.__studyEditor) {
            var nodeId = e.getData();

            _this.__studyEditor.nodeSelected(nodeId, true);
          }
        }, this);
        return navBar;
      },
      __createMainView: function __createMainView(studyId) {
        var _this2 = this;

        var prjStack = new qx.ui.container.Stack();
        var dashboard = this.__dashboard = new qxapp.desktop.Dashboard(studyId);
        dashboard.getStudyBrowser().addListener("startStudy", function (e) {
          var studyEditor = e.getData();

          _this2.__showStudyEditor(studyEditor);
        }, this);
        prjStack.add(dashboard);
        return prjStack;
      },
      __showDashboard: function __showDashboard() {
        this.__prjStack.setSelection([this.__dashboard]);

        this.__dashboard.getStudyBrowser().reloadUserStudies();

        this.__navBar.setPathButtons([]);

        if (this.__studyEditor) {
          this.__studyEditor.destruct();
        }
      },
      __showStudyEditor: function __showStudyEditor(studyEditor) {
        var _this3 = this;

        if (this.__studyEditor) {
          this.__prjStack.remove(this.__studyEditor);
        }

        this.__studyEditor = studyEditor;
        var study = studyEditor.getStudy();

        this.__prjStack.add(this.__studyEditor);

        this.__prjStack.setSelection([this.__studyEditor]);

        this.__navBar.setStudy(study);

        this.__navBar.setPathButtons(study.getWorkbench().getPathIds("root"));

        this.__studyEditor.addListener("changeMainViewCaption", function (ev) {
          var elements = ev.getData();

          _this3.__navBar.setPathButtons(elements);
        }, this);

        this.__studyEditor.addListener("studySaved", function (ev) {
          var wasSaved = ev.getData();

          if (wasSaved) {
            _this3.__navBar.studySaved();
          }
        }, this);
      }
    }
  });
  qxapp.desktop.MainPage.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=MainPage.js.map?dt=1568886162648