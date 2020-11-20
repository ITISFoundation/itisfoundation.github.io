(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.Composite": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.splitpane.Pane": {}
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
   * Widget containing a Vertical Box with widgets.
   * Used for the side panel in the study editor.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let sidePanel = new qxapp.desktop.SidePanel();
   *   sidePanel.addAt(widget1, 0);
   *   sidePanel.addAt(widget2, 1);
   *   sidePanel.addAt(widget3, 2);
   *   this.getRoot().add(sidePanel);
   * </pre>
   */
  qx.Class.define("qxapp.desktop.SidePanel", {
    extend: qx.ui.container.Composite,
    construct: function construct() {
      qx.ui.container.Composite.constructor.call(this);
      this.setAppearance("sidepanel");

      this._setLayout(new qx.ui.layout.VBox());

      this.__attachEventHandlers();
    },
    properties: {
      collapsed: {
        init: false,
        check: "Boolean",
        apply: "_applyCollapsed"
      }
    },
    members: {
      __savedWidth: null,
      __savedMinWidth: null,

      /**
       * Add a widget at the specified index. If the index already has a child, then replace it.
       *
       * @param {qx.ui.core.LayoutItem} child Widget to add
       * @param {Integer} index Index, at which the widget will be inserted
       * @param {Map?null} options Optional layout data for widget.
       */
      addOrReplaceAt: function addOrReplaceAt(child, index) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        if (this.getChildren()[index]) {
          var visibility = this.getChildren()[index].getVisibility();
          child.setVisibility(visibility);
          this.removeAt(index);
        }

        this.addAt(child, index, options);
      },

      /**
       * Toggle the visibility of the side panel with a nice transition.
       */
      toggleCollapsed: function toggleCollapsed() {
        this.setCollapsed(!this.getCollapsed());
      },
      _applyCollapsed: function _applyCollapsed(collapsed) {
        this.__setDecorators("sidepanel");

        this.getChildren().forEach(function (child) {
          return child.setVisibility(collapsed ? "excluded" : "visible");
        });

        var splitpaneContainer = this.__getSplitpaneContainer();

        if (collapsed) {
          // Save widths
          this.__savedWidth = this.__getCssWidth();
          this.__savedMinWidth = splitpaneContainer.getMinWidth();
          splitpaneContainer.set({
            minWidth: 0,
            width: 20
          });
        } else {
          // Restore widths
          splitpaneContainer.set({
            minWidth: this.__savedMinWidth,
            width: this.__savedWidth
          });
        } // Workaround: have to update splitpane's prop


        var splitpane = this.__getParentSplitpane();

        if (splitpane && this.__savedWidth) {
          splitpane.__endSize = this.__savedWidth; // eslint-disable-line no-underscore-dangle
        }
      },
      __getParentSplitpane: function __getParentSplitpane() {
        var parent = this.getLayoutParent();

        while (parent && parent instanceof qx.ui.splitpane.Pane === false) {
          parent = parent.getLayoutParent();
        }

        return parent;
      },
      __getSplitpaneContainer: function __getSplitpaneContainer() {
        var splitpane = this.__getParentSplitpane();

        if (splitpane == null) {
          // eslint-disable-line no-eq-null
          return this;
        }

        var container = this;

        while (container.getLayoutParent() !== splitpane) {
          container = container.getLayoutParent();
        }

        return container;
      },
      __getCssWidth: function __getCssWidth() {
        if (this.__getSplitpaneContainer().getWidth()) {
          return this.__getSplitpaneContainer().getWidth();
        } else if (this.__getSplitpaneContainer().getContentElement().getDomElement()) {
          return parseInt(this.__getSplitpaneContainer().getContentElement().getDomElement().style.width);
        }

        return 300;
      },
      __setDecorators: function __setDecorators() {
        var decorator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var splitpane = this.__getParentSplitpane() || this;
        var widget = this;

        do {
          if (decorator) {
            widget.setDecorator(decorator);
          } else {
            widget.resetDecorator();
          }

          widget = widget.getLayoutParent();
        } while (widget && widget !== splitpane);
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this = this;

        this.addListenerOnce("appear", function () {
          _this.__getSplitpaneContainer().getContentElement().getDomElement().addEventListener("transitionend", function () {
            if (_this.getCollapsed()) {
              _this.addListenerOnce("resize", function (e) {
                if (_this.getCollapsed() && _this.__getCssWidth() !== _this.__savedWidth) {
                  _this.__savedWidth = e.getData().width;

                  _this.setCollapsed(false);
                } else {
                  _this.__savedWidth = e.getData().width;
                }
              }, _this);
            } else {
              _this.__setDecorators();
            }
          });
        }, this);
      }
    }
  });
  qxapp.desktop.SidePanel.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=SidePanel.js.map?dt=1568886162900