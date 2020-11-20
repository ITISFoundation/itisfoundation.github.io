(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "osparc.theme.osparcdark.Appearance": {
        "require": true
      },
      "osparc.theme.osparcdark.Image": {}
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
       * Tobias Oetiker (oetiker)
  
  ************************************************************************ */
  qx.Theme.define("qxapp.theme.Appearance", {
    extend: osparc.theme.osparcdark.Appearance,
    appearances: {
      "pb-list": {
        include: "list",
        alias: "list",
        style: function style(states) {
          return {
            decorator: null,
            padding: 0
          };
        }
      },
      "pb-listitem": {
        include: "material-button",
        style: function style(states) {
          var style = {
            decorator: "pb-listitem",
            padding: 5,
            backgroundColor: "background-main-lighter+"
          };

          if (states.hovered) {
            style.backgroundColor = "#444";
          }

          if (states.selected || states.checked) {
            style.backgroundColor = "#555";
          }

          return style;
        }
      },
      "selectable": {
        include: "material-button",
        style: function style(states) {
          var style = {
            decorator: "no-radius-button",
            padding: 5,
            backgroundColor: "transparent"
          };

          if (states.hovered) {
            style.backgroundColor = "background-main-lighter+";
          }

          if (states.selected || states.checked) {
            style.backgroundColor = "#444";
          }

          return style;
        }
      },

      /*
      ---------------------------------------------------------------------------
        WINDOW-SMALL-CAP CHOOSER
      ---------------------------------------------------------------------------
      */
      "window-small-cap": {
        include: "window",
        // get all the settings from window
        alias: "window",
        // redirect kids to window/kid
        style: function style(states) {
          return {
            backgroundColor: "background-selected-dark",
            decorator: states.maximized ? "window-small-cap-maximized" : "window-small-cap"
          };
        }
      },
      "window-small-cap/captionbar": {
        include: "window/captionbar",
        // load defaults from window captionbar
        alias: "window/captionbar",
        // redirect kids
        style: function style(states) {
          return {
            padding: [0, 3, 0, 3],
            minHeight: 20,
            backgroundColor: "background-selected-dark",
            decorator: "workbench-small-cap-captionbar"
          };
        }
      },
      "window-small-cap/title": {
        include: "window/title",
        style: function style(states) {
          return {
            marginLeft: 2,
            font: "small"
          };
        }
      },
      "window-small-cap/minimize-button": {
        alias: "window/minimize-button",
        include: "window/minimize-button",
        style: function style(states) {
          return {
            icon: osparc.theme.osparcdark.Image.URLS["window-minimize"] + "/14"
          };
        }
      },
      "window-small-cap/restore-button": {
        alias: "window/restore-button",
        include: "window/restore-button",
        style: function style(states) {
          return {
            icon: osparc.theme.osparcdark.Image.URLS["window-restore"] + "/14"
          };
        }
      },
      "window-small-cap/maximize-button": {
        alias: "window/maximize-button",
        include: "window/maximize-button",
        style: function style(states) {
          return {
            icon: osparc.theme.osparcdark.Image.URLS["window-maximize"] + "/14"
          };
        }
      },
      "window-small-cap/close-button": {
        alias: "window/close-button",
        include: "window/close-button",
        style: function style(states) {
          return {
            icon: osparc.theme.osparcdark.Image.URLS["window-close"] + "/14"
          };
        }
      },
      "service-window": {
        include: "window",
        alias: "window",
        style: function style(state) {
          return {
            decorator: state.maximized ? "service-window-maximized" : "service-window"
          };
        }
      },
      "service-window/captionbar": {
        include: "window/captionbar",
        style: function style(state) {
          return {
            backgroundColor: "material-button-background",
            decorator: "workbench-small-cap-captionbar"
          };
        }
      },
      "info-service-window": {
        include: "service-window",
        alias: "service-window",
        style: function style(state) {
          return {
            maxHeight: state.maximized ? null : 500
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        PanelView
      ---------------------------------------------------------------------------
      */
      "panelview": {
        style: function style(state) {
          return {
            decorator: "panelview"
          };
        }
      },
      "panelview/title": {
        style: function style(state) {
          return {
            font: "title-14"
          };
        }
      },
      "panelview-titlebar": {
        style: function style(state) {
          return {
            height: 24,
            padding: [0, 5],
            alignY: "middle",
            cursor: "pointer"
          };
        }
      },
      "panelview-content": {
        style: function style(state) {
          return {
            decorator: "panelview-content",
            margin: [0, 4, 4, 4]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        Toolbar
      ---------------------------------------------------------------------------
      */
      "toolbar-textfield": {
        include: "material-textfield",
        style: function style(state) {
          return {
            backgroundColor: "transparent",
            marginTop: 8
          };
        }
      },
      "toolbar-label": {
        style: function style(state) {
          return {
            marginTop: 11,
            marginRight: 3
          };
        }
      },
      "textfilter": {},
      "textfilter/textfield": "toolbar-textfield",
      "toolbar-selectbox": {
        include: "textfield",
        alias: "selectbox",
        style: function style() {
          return {
            margin: [7, 10],
            paddingLeft: 5
          };
        }
      },
      "toolbar-selectbox/arrow": {
        include: "selectbox/arrow",
        style: function style(_style) {
          return {
            cursor: _style.disabled ? "auto" : "pointer"
          };
        }
      },
      "toolbar-selectbox/list": {
        include: "selectbox/list",
        style: function style() {
          return {
            padding: 0
          };
        }
      },
      "toolbar-progressbar": {
        include: "progressbar",
        alias: "progressbar",
        style: function style() {
          return {
            margin: [7, 10]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        SidePanel
      ---------------------------------------------------------------------------
      */
      sidepanel: {
        style: function style(state) {
          return {
            backgroundColor: "background-main-lighter"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        Splitpane
      ---------------------------------------------------------------------------
      */
      "splitpane/splitter": {
        style: function style(state) {
          return {
            visible: false
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        NodePorts
      ---------------------------------------------------------------------------
      */
      "node-ports": {
        style: function style(state) {
          return {
            backgroundColor: "background-main-lighter+"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        Jumbo
      ---------------------------------------------------------------------------
      */
      "jumbo": {
        include: "material-button",
        alias: "material-button",
        style: function style(state) {
          return {
            padding: [7, 8, 5, 8]
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        ServiceBrowser
      ---------------------------------------------------------------------------
      */
      "service-browser": {
        style: function style(state) {
          return {
            padding: 8,
            decorator: "service-browser"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        Buttons
      ---------------------------------------------------------------------------
      */
      "link-button": {
        include: "material-button",
        style: function style(state) {
          return {
            decorator: "link-button",
            backgroundColor: "transparent",
            textColor: state.hovered ? "text" : "text-darker"
          };
        }
      },
      "big-button": {
        include: "material-button",
        alias: "material-button",
        style: function style(state) {
          return {
            allowStretchY: false,
            allowStretchX: false,
            minHeight: 50,
            center: true
          };
        }
      },
      "big-button/label": {
        include: "material-button/label",
        style: function style(state) {
          return {
            font: "title-16"
          };
        }
      },
      "md-button": {
        include: "material-button",
        alias: "material-button",
        style: function style(state) {
          return {
            allowStretchY: false,
            allowStretchX: false,
            minHeight: 35,
            center: true
          };
        }
      },
      "md-button/label": {
        include: "material-button/label",
        style: function style(state) {
          return {
            font: "text-16"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        FlashMessage
      ---------------------------------------------------------------------------
      */
      "flash": {
        style: function style(state) {
          return {
            padding: 10,
            backgroundColor: "background-main-lighter+",
            decorator: "flash"
          };
        }
      },
      "flash/badge": {
        style: function style(state) {
          return {
            decorator: "flash-badge"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        IFrame
      ---------------------------------------------------------------------------
      */
      "iframe": {},

      /*
      ---------------------------------------------------------------------------
        GroupBox
      ---------------------------------------------------------------------------
      */
      "settings-groupbox": {
        include: "groupbox",
        alias: "groupbox"
      },
      "settings-groupbox/frame": {
        include: "groupbox/frame",
        style: function style(state) {
          return {
            decorator: "no-border"
          };
        }
      },
      "settings-groupbox/legend": {
        alias: "atom",
        include: "groupbox/legend",
        style: function style(state) {
          return {
            font: "title-16"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        Hints
      ---------------------------------------------------------------------------
      */
      "hint": {
        style: function style(state) {
          return {
            backgroundColor: "background-main-lighter+",
            decorator: "hint",
            padding: 5
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        Chip
      ---------------------------------------------------------------------------
      */
      "chip": {
        include: "atom",
        alias: "atom",
        style: function style(state) {
          return {
            decorator: "chip",
            backgroundColor: "background-main-lighter",
            padding: [3, 5]
          };
        }
      },
      "chip/label": {
        include: "atom/label",
        style: function style(state) {
          return {
            font: "text-10"
          };
        }
      },

      /*
      ---------------------------------------------------------------------------
        Dashboard
      ---------------------------------------------------------------------------
      */
      "dashboard": {
        include: "tabview",
        alias: "tabview"
      },
      "dashboard/pane": {
        style: function style(state) {
          return {
            padding: [0, 0, 0, 15]
          };
        }
      },
      "dashboard/bar/content": {
        style: function style(state) {
          return {
            width: 120,
            paddingTop: 15
          };
        }
      },
      "dashboard-page": {
        include: "tabview-page",
        alias: "tabview-page"
      },
      "dashboard-page/button": {
        include: "tabview-page/button",
        alias: "tabview-page/button",
        style: function style(state) {
          return {
            font: state.checked ? "title-16" : "text-16"
          };
        }
      }
    }
  });
  qxapp.theme.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Appearance.js.map?dt=1568886164579