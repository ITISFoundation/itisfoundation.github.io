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
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.basic.Atom": {},
      "qx.ui.basic.Image": {},
      "qx.ui.layout.Grow": {}
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
       * Ignacio Pascual (ignapas)
  
  ************************************************************************ */

  /* eslint-disable no-use-before-define */

  /**
   * Display widget with a title bar and collapsible content.
   */
  qx.Class.define("qxapp.desktop.PanelView", {
    extend: qx.ui.core.Widget,
    construct: function construct(title, content) {
      qx.ui.core.Widget.constructor.call(this); // Layout

      this._setLayout(new qx.ui.layout.VBox()); // Title bar


      this.__titleBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(5).set({
        alignY: "middle"
      })).set({
        appearance: "panelview-titlebar"
      });

      this._add(this.__titleBar);

      this.__caret = this.getChildControl("caret"); // Set if coming in the constructor arguments

      if (title) {
        this.setTitle(title);
      }

      if (content) {
        this.setContent(content);
      } // Attach handlers


      this.__attachEventHandlers();
    },
    statics: {
      MORE_CARET: "@MaterialIcons/expand_more/",
      LESS_CARET: "@MaterialIcons/expand_less/"
    },
    properties: {
      title: {
        check: "String",
        nullable: true,
        apply: "_applyTitle"
      },
      content: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applyContent"
      },
      collapsed: {
        init: false,
        check: "Boolean",
        apply: "_applyCollapsed"
      },
      sideCollapsed: {
        init: false,
        check: "Boolean",
        apply: "_applySideCollapsed"
      },
      appearance: {
        init: "panelview",
        refine: true
      },
      caretSize: {
        init: 20,
        nullable: false,
        check: "Integer",
        apply: "_applyCaretSize"
      }
    },
    members: {
      __titleBar: null,
      __titleLabel: null,
      __caret: null,
      __innerContainer: null,
      __containerHeight: null,
      __layoutFlex: null,
      __minHeight: null,
      __contentMinHeight: null,
      _createChildControlImpl: function _createChildControlImpl(id) {
        var control;

        switch (id) {
          case "title":
            control = new qx.ui.basic.Atom(this.getTitle());

            this.__titleBar.addAt(control, 0);

            break;

          case "caret":
            control = new qx.ui.basic.Image(this.__getCaretId(this.getCollapsed())).set({
              visibility: "excluded"
            });

            this.__titleBar.addAt(control, 1);

            break;
        }

        return control || qxapp.desktop.PanelView.prototype._createChildControlImpl.base.call(this, id);
      },
      toggleCollapsed: function toggleCollapsed() {
        this.setCollapsed(!this.getCollapsed());
      },
      toggleSideCollapsed: function toggleSideCollapsed() {
        this.setSideCollapsed(!this.getSideCollapsed());
      },
      _applyCollapsed: function _applyCollapsed(collapsed) {
        if (this.getContent()) {
          this.__caret.setSource(this.__getCaretId(collapsed));

          if (collapsed) {
            this.__minHeight = this.getMinHeight();

            if (this.getContent()) {
              this.__contentMinHeight = this.getContent().getMinHeight();
              this.getContent().setMinHeight(0);
            }

            this.setMinHeight(0);

            if (this.getLayoutProperties().flex) {
              this.__layoutFlex = this.getLayoutProperties().flex;
              this.setLayoutProperties({
                flex: 0
              });
            }
          } else {
            this.setMinHeight(this.__minHeight);

            if (this.getContent()) {
              this.getContent().setMinHeight(this.__contentMinHeight);
            }

            if (this.__layoutFlex) {
              this.setLayoutProperties({
                flex: this.__layoutFlex
              });
            }
          }

          this.__innerContainer.setHeight(collapsed ? 0 : this.__containerHeight);
        }
      },
      _applyContent: function _applyContent(content, oldContent) {
        var _this = this;

        if (this.__innerContainer === null) {
          this.__innerContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow()).set({
            appearance: "panelview-content",
            padding: 0
          });

          this._addAt(this.__innerContainer, 1, {
            flex: 1
          });

          this.__innerContainer.addListener("changeHeight", function (e) {
            var height = e.getOldData();

            if (height != 0) {
              _this.__containerHeight = height;
            }
          }, this);

          content.addListenerOnce("appear", function () {
            content.getContentElement().getDomElement().style.transform = "translateZ(0)";
          });
        }

        this.__innerContainer.removeAll();

        this.__innerContainer.add(content);

        this.__innerContainer.setHeight(this.getCollapsed() ? 0 : this.__containerHeight);

        if (content) {
          this.__caret.show();
        } else {
          this.__caret.exclude();
        }
      },
      _applyTitle: function _applyTitle(title) {
        this.__titleLabel = this.getChildControl("title");

        this.__titleLabel.setLabel(title);
      },
      _applySideCollapsed: function _applySideCollapsed(sideCollapse, old) {
        this.setCollapsed(sideCollapse);
      },
      _applyCaretSize: function _applyCaretSize(size) {
        this.__caret.setSource(this.__getCaretId(this.getCollapsed()));
      },
      __getCaretId: function __getCaretId(collapsed) {
        var caretSize = this.getCaretSize();
        var moreCaret = qxapp.desktop.PanelView.MORE_CARET;
        var lessCaret = qxapp.desktop.PanelView.LESS_CARET;
        return collapsed ? moreCaret + caretSize : lessCaret + caretSize;
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this2 = this;

        this.__titleBar.addListener("tap", function () {
          _this2.toggleCollapsed();
        }, this);
      }
    }
  });
  qxapp.desktop.PanelView.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=PanelView.js.map?dt=1568886162770