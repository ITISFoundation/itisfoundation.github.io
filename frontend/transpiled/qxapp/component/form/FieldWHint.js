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
      "qx.util.ResourceManager": {
        "construct": true
      },
      "qx.module.Css": {
        "construct": true
      },
      "qx.ui.form.TextField": {
        "construct": true
      },
      "qxapp.component.form.IconButton": {},
      "qxapp.ui.hint.Hint": {}
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
       * Ignacio Pascual (ignapas)
  
  ************************************************************************ */

  /**
   * @asset(hint/hint.css)
   */
  qx.Class.define("qxapp.component.form.FieldWHint", {
    extend: qx.ui.core.Widget,

    /**
     * Text field with a hint tooltip
     *
     * @extends qx.ui.core.Widget
     */
    construct: function construct(value, hint, field) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Canvas());

      var hintCssUri = qx.util.ResourceManager.getInstance().toUri("hint/hint.css");
      qx.module.Css.includeStylesheet(hintCssUri);
      this.__field = field || new qx.ui.form.TextField();

      if (value) {
        this.__field.setValue(value);
      }

      this.__field.setPaddingRight(18);

      this.getContentElement().addClass("hint-input");

      this.__field.getContentElement().addClass("hint-field");

      this._add(this.__field, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      });

      if (hint) {
        this.__hintText = hint;
      }

      this.__infoButton = this.getChildControl("infobutton");

      this.__attachEventHandlers();
    },
    members: {
      __field: null,
      __hint: null,
      __hintText: null,
      __infoButton: null,
      _createChildControlImpl: function _createChildControlImpl(id) {
        var control;

        switch (id) {
          case "infobutton":
            control = new qxapp.component.form.IconButton("@FontAwesome5Solid/info-circle/14");
            control.getContentElement().addClass("hint-button");

            this._add(control, {
              right: 0,
              bottom: 5
            });

            break;
        }

        return control || qxapp.component.form.FieldWHint.prototype._createChildControlImpl.base.call(this, id);
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this = this;

        if (this.__hintText) {
          this.__infoButton.addListener("mouseover", function () {
            return _this.__hint = new qxapp.ui.hint.Hint(_this.__infoButton, _this.__hintText);
          }, this);

          this.__infoButton.addListener("mouseout", function () {
            return _this.__hint.destroy();
          }, this);

          this.__field.bind("visibility", this, "visibility");
        }
      },
      getField: function getField() {
        return this.__field;
      }
    }
  });
  qxapp.component.form.FieldWHint.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=FieldWHint.js.map?dt=1568886160256