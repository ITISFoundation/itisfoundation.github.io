(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.tabview.TabView": {
        "construct": true,
        "require": true
      },
      "qxapp.wrapper.JsonDiffPatch": {
        "construct": true
      },
      "qxapp.wrapper.JsonTreeViewer": {
        "construct": true
      },
      "qxapp.wrapper.DOMPurify": {
        "construct": true
      },
      "qx.ui.tabview.Page": {},
      "qxapp.utils.Utils": {},
      "qx.ui.layout.Grow": {},
      "qx.ui.container.Scroll": {},
      "qxapp.desktop.StudyBrowser": {},
      "qxapp.desktop.ServiceBrowser": {},
      "qxapp.desktop.DataBrowser": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qxapp - the simcore frontend
  
     https://osparc.io
  
     Copyright:
       2019 IT'IS Foundation, https://itis.swiss
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * Widget containing a TabView including:
   * - StudyBrowser
   * - ServiceBrowser
   * - DataManager
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let dashboard = new qxapp.desktop.Dashboard();
   *   this.getRoot().add(dashboard);
   * </pre>
   */
  qx.Class.define("qxapp.desktop.Dashboard", {
    extend: qx.ui.tabview.TabView,
    construct: function construct(studyId) {
      qx.ui.tabview.TabView.constructor.call(this);
      this.setBarPosition("left");
      qxapp.wrapper.JsonDiffPatch.getInstance().init();
      qxapp.wrapper.JsonTreeViewer.getInstance().init();
      qxapp.wrapper.DOMPurify.getInstance().init();

      this.__createMainViewLayout(studyId);
    },
    properties: {
      appearance: {
        init: "dashboard",
        refine: true
      }
    },
    members: {
      __prjBrowser: null,
      __serviceBrowser: null,
      __dataManager: null,
      getStudyBrowser: function getStudyBrowser() {
        return this.__prjBrowser;
      },
      getServiceBrowser: function getServiceBrowser() {
        return this.__serviceBrowser;
      },
      getDataManager: function getDataManager() {
        return this.__dataManager;
      },
      __createMainViewLayout: function __createMainViewLayout(studyId) {
        var _this = this;

        [[this.tr("Studies"), this.__createStudiesView], [this.tr("Services"), this.__createServicesLayout], [this.tr("Data"), this.__createDataManagerLayout]].forEach(function (tuple) {
          var tabPage = new qx.ui.tabview.Page(tuple[0]).set({
            appearance: "dashboard-page"
          });
          var tabButton = tabPage.getChildControl("button");
          var id = tuple[0].getMessageId().toLowerCase() + "TabBtn";
          qxapp.utils.Utils.setIdToWidget(tabButton, id);
          tabPage.setLayout(new qx.ui.layout.Grow());
          var viewLayout = tuple[1].call(_this, studyId);
          tabButton.addListener("execute", function () {
            if (viewLayout.resetSelection) {
              viewLayout.resetSelection();
            }
          }, _this);
          var scrollerMainView = new qx.ui.container.Scroll();
          scrollerMainView.add(viewLayout);
          tabPage.add(scrollerMainView);

          _this.add(tabPage);
        }, this);
      },
      __createStudiesView: function __createStudiesView(studyId) {
        var studiesView = this.__prjBrowser = new qxapp.desktop.StudyBrowser(studyId);
        return studiesView;
      },
      __createServicesLayout: function __createServicesLayout() {
        var servicesView = this.__serviceBrowser = new qxapp.desktop.ServiceBrowser();
        return servicesView;
      },
      __createDataManagerLayout: function __createDataManagerLayout() {
        var dataManagerView = this.__dataManager = new qxapp.desktop.DataBrowser();
        return dataManagerView;
      }
    }
  });
  qxapp.desktop.Dashboard.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Dashboard.js.map?dt=1568886162585