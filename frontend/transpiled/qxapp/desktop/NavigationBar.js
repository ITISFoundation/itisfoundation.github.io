function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qxapp.component.widget.LogoOnOff": {
        "construct": true
      },
      "qx.ui.toolbar.Separator": {
        "construct": true
      },
      "qx.ui.form.Button": {
        "construct": true
      },
      "qxapp.utils.Utils": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.core.Spacer": {
        "construct": true
      },
      "qxapp.ui.form.LinkButton": {
        "construct": true
      },
      "qxapp.auth.Data": {
        "construct": true
      },
      "qxapp.utils.Avatar": {
        "construct": true
      },
      "qx.bom.Font": {},
      "qxapp.theme.Font": {},
      "qx.ui.basic.Label": {},
      "qx.event.Timer": {},
      "qx.ui.menu.Menu": {},
      "qx.ui.menu.Button": {},
      "qxapp.component.widget.NewGHIssue": {},
      "qxapp.About": {},
      "qx.core.Init": {},
      "qx.ui.form.MenuButton": {},
      "qxapp.desktop.preferences.Preferences": {}
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
   * Widget containing:
   * - LogoOnOff
   * - Dashboard button
   * - List of buttons for node navigation (only study editing)
   * - User menu
   *   - Preferences
   *   - Help
   *   - About
   *   - Logout
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let navBar = new qxapp.desktop.NavigationBar();
   *   this.getRoot().add(navBar);
   * </pre>
   */
  var NAVIGATION_BUTTON_HEIGHT = 32;
  qx.Class.define("qxapp.desktop.NavigationBar", {
    extend: qx.ui.core.Widget,
    construct: function construct() {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.HBox(10).set({
        alignY: "middle"
      }));

      this.set({
        paddingLeft: 10,
        paddingRight: 10,
        maxHeight: 50,
        backgroundColor: "background-main-lighter"
      });
      var commonBtnSettings = {
        allowGrowY: false,
        minWidth: 32,
        minHeight: NAVIGATION_BUTTON_HEIGHT
      };
      var logo = qxapp.component.widget.LogoOnOff.getInstance();

      this._add(logo);

      this._add(new qx.ui.toolbar.Separator());

      var dashboardBtn = this.__dashboardBtn = new qx.ui.form.Button().set({
        rich: true
      });
      qxapp.utils.Utils.setIdToWidget(dashboardBtn, "dashboardBtn");
      dashboardBtn.set(commonBtnSettings);
      dashboardBtn.addListener("execute", function () {
        _this.fireEvent("dashboardPressed");
      }, this);

      this.__highlightDashboard();

      this._add(dashboardBtn);

      this._add(new qx.ui.toolbar.Separator());

      var hBox = new qx.ui.layout.HBox(5).set({
        alignY: "middle"
      });
      var mainViewCaptionLayout = this.__mainViewCaptionLayout = new qx.ui.container.Composite(hBox);

      this._add(mainViewCaptionLayout);

      this._add(new qx.ui.core.Spacer(5), {
        flex: 1
      });

      this._add(new qxapp.ui.form.LinkButton(this.tr("User manual"), "https://docs.osparc.io").set({
        appearance: "link-button"
      }));

      this._add(new qxapp.ui.form.LinkButton(this.tr("Give us feedback"), qxapp.desktop.NavigationBar.FEEDBACK_FORM_URL).set({
        appearance: "link-button"
      }));

      var userEmail = qxapp.auth.Data.getInstance().getEmail() || "bizzy@itis.ethz.ch";
      var userName = qxapp.auth.Data.getInstance().getUserName() || "bizzy";

      var userBtn = this.__createUserBtn();

      userBtn.set(_objectSpread({}, commonBtnSettings, {
        icon: qxapp.utils.Avatar.getUrl(userEmail, NAVIGATION_BUTTON_HEIGHT),
        label: userName
      }));

      this._add(userBtn);
    },
    events: {
      "nodeDoubleClicked": "qx.event.type.Data",
      "dashboardPressed": "qx.event.type.Event"
    },
    properties: {
      study: {
        check: "qxapp.data.model.Study",
        nullable: true
      }
    },
    statics: {
      FEEDBACK_FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSe232bTigsM2zV97Kjp2OhCenl6o9gNGcDFt2kO_dfkIjtQAQ/viewform?usp=sf_link"
    },
    members: {
      __dashboardBtn: null,
      __mainViewCaptionLayout: null,
      setPathButtons: function setPathButtons(nodeIds) {
        var _this2 = this;

        this.__mainViewCaptionLayout.removeAll();

        var navBarLabelFont = qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["nav-bar-label"]);

        if (nodeIds.length === 0) {
          this.__highlightDashboard(true);
        }

        var _loop = function _loop(i) {
          var btn = new qx.ui.form.Button().set({
            rich: true,
            maxHeight: NAVIGATION_BUTTON_HEIGHT
          });
          var nodeId = nodeIds[i];

          if (nodeId === "root") {
            _this2.getStudy().bind("name", btn, "label");
          } else {
            var node = _this2.getStudy().getWorkbench().getNode(nodeId);

            if (node) {
              node.bind("label", btn, "label");
            }
          }

          btn.addListener("execute", function () {
            this.fireDataEvent("nodeDoubleClicked", nodeId);
          }, _this2);

          _this2.__mainViewCaptionLayout.add(btn);

          if (i < nodeIds.length - 1) {
            var mainViewCaption = _this2.__mainViewCaption = new qx.ui.basic.Label(">").set({
              font: navBarLabelFont
            });

            _this2.__mainViewCaptionLayout.add(mainViewCaption);
          }

          if (i === nodeIds.length - 1) {
            _this2.__highlightDashboard(false);

            btn.setLabel("<b>" + btn.getLabel() + "</b>");
          }
        };

        for (var i = 0; i < nodeIds.length; i++) {
          _loop(i);
        }
      },
      __highlightDashboard: function __highlightDashboard() {
        var highlight = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var label = this.tr("Dashboard");
        highlight ? this.__dashboardBtn.setLabel("<b>" + label + "</b>") : this.__dashboardBtn.setLabel(label);
      },
      studySaved: function studySaved() {
        var _this3 = this;

        var _loop2 = function _loop2(i) {
          var widget = _this3.__mainViewCaptionLayout.getChildren()[i];

          if (widget instanceof qx.ui.form.Button) {
            var waitFor = 500;
            qx.event.Timer.once(function (ev) {
              widget.removeState("hovered");
            }, _this3, waitFor);
            widget.addState("hovered");
            return {
              v: void 0
            };
          }
        };

        for (var i = 0; i < this.__mainViewCaptionLayout.getChildren().length; i++) {
          var _ret = _loop2(i);

          if (_typeof(_ret) === "object") return _ret.v;
        }
      },
      __createUserBtn: function __createUserBtn() {
        var menu = new qx.ui.menu.Menu();
        var preferences = new qx.ui.menu.Button(this.tr("Preferences"));
        preferences.addListener("execute", this.__onOpenAccountSettings, this);
        qxapp.utils.Utils.setIdToWidget(preferences, "userMenuPreferencesBtn");
        menu.add(preferences);
        menu.addSeparator();
        var helpBtn = new qx.ui.menu.Button(this.tr("Help"));
        helpBtn.addListener("execute", function () {
          return window.open("https://docs.osparc.io");
        });
        qxapp.utils.Utils.setIdToWidget(helpBtn, "userMenuHelpBtn");
        menu.add(helpBtn);
        var newIssueBtn = new qx.ui.menu.Button(this.tr("Open issue in GitHub"));
        newIssueBtn.addListener("execute", function () {
          return window.open(qxapp.component.widget.NewGHIssue.getNewIssueUrl());
        });
        qxapp.utils.Utils.setIdToWidget(newIssueBtn, "userMenuGithubBtn");
        menu.add(newIssueBtn);
        var aboutBtn = new qx.ui.menu.Button(this.tr("About"));
        aboutBtn.addListener("execute", function () {
          return qxapp.About.getInstance().open();
        });
        qxapp.utils.Utils.setIdToWidget(aboutBtn, "userMenuAboutBtn");
        menu.add(aboutBtn);
        menu.addSeparator();
        var logout = new qx.ui.menu.Button(this.tr("Logout"));
        logout.addListener("execute", function (e) {
          qx.core.Init.getApplication().logout();
        });
        qxapp.utils.Utils.setIdToWidget(logout, "userMenuLogoutBtn");
        menu.add(logout);
        var userBtn = new qx.ui.form.MenuButton(null, null, menu);
        userBtn.getChildControl("icon").getContentElement().setStyles({
          "border-radius": "16px"
        });
        qxapp.utils.Utils.setIdToWidget(userBtn, "userMenuMainBtn");
        return userBtn;
      },
      __onOpenAccountSettings: function __onOpenAccountSettings() {
        if (!this.__preferencesWin) {
          this.__preferencesWin = new qxapp.desktop.preferences.Preferences();
        }

        var win = this.__preferencesWin;

        if (win) {
          win.center();
          win.open();
        }
      }
    }
  });
  qxapp.desktop.NavigationBar.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NavigationBar.js.map?dt=1568886162735