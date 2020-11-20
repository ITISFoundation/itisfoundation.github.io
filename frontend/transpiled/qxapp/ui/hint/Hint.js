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
      "qx.ui.layout.Basic": {
        "construct": true
      },
      "qx.ui.basic.Label": {
        "construct": true
      },
      "qx.bom.element.Location": {},
      "qx.bom.element.Dimension": {},
      "qx.core.Init": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /*
   * oSPARC - The SIMCORE frontend - https://osparc.io
   * Copyright: 2019 IT'IS Foundation - https://itis.swiss
   * License: MIT - https://opensource.org/licenses/MIT
   * Authors: Ignacio Pascual (ignapas)
   */
  qx.Class.define("qxapp.ui.hint.Hint", {
    extend: qx.ui.core.Widget,
    construct: function construct(element, text) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.VBox());

      this.set({
        backgroundColor: "transparent"
      });
      this.__hintContainer = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      this.__hintContainer.set({
        appearance: "hint"
      });

      this.__caret = new qx.ui.container.Composite().set({
        height: 5,
        backgroundColor: "transparent"
      });

      this.__caret.getContentElement().addClass("hint");

      this._add(this.__caret);

      this.__hintContainer.add(new qx.ui.basic.Label(text).set({
        rich: true,
        maxWidth: 250
      }));

      this._add(this.__hintContainer, {
        flex: 1
      });

      this.positionHint(element);
    },
    members: {
      positionHint: function positionHint(element) {
        var _this = this;

        this.addListener("appear", function () {
          var _qx$bom$element$Locat = qx.bom.element.Location.get(element.getContentElement().getDomElement()),
              top = _qx$bom$element$Locat.top,
              left = _qx$bom$element$Locat.left;

          var _qx$bom$element$Dimen = qx.bom.element.Dimension.getSize(element.getContentElement().getDomElement()),
              width = _qx$bom$element$Dimen.width,
              height = _qx$bom$element$Dimen.height;

          var selfBounds = _this.getBounds();

          _this.setLayoutProperties({
            top: top + height,
            left: Math.floor(left + (width - selfBounds.width) / 2)
          });
        }, this);
        var root = qx.core.Init.getApplication().getRoot();
        root.add(this, {
          top: -10000
        });
      }
    }
  });
  qxapp.ui.hint.Hint.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Hint.js.map?dt=1568886164686