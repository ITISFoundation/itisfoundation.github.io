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
      "qx.ui.basic.Label": {},
      "qxapp.component.form.IconButton": {}
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
   * A FlashMessage provides brief messages about the app processes. It is used and handled by qxapp.component.message.FlashMessenger.
   */
  qx.Class.define("qxapp.ui.message.FlashMessage", {
    extend: qx.ui.core.Widget,

    /**
     * Constructor for the FlashMessage.
     *
     * @param {String} message Message that the user will read.
     * @param {String="INFO","DEBUG","WARNING","ERROR"} level Logging level of the message. Each level has different, distinct color.
     */
    construct: function construct(message, level) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.HBox(10));

      this.set({
        maxWidth: 340,
        allowStretchX: false,
        alignX: "center"
      });
      var badge = this.getChildControl("badge");
      badge.setBackgroundColor(qxapp.ui.message.FlashMessage.LOG_LEVEL_COLOR_MAP[level]);

      if (message) {
        this.setMessage(message);
      }

      this.getChildControl("closebutton");
    },
    properties: {
      appearance: {
        init: "flash",
        refine: true
      },
      message: {
        check: "String",
        nullable: true,
        apply: "_applyMessage"
      }
    },
    statics: {
      LOG_LEVEL_COLOR_MAP: {
        "INFO": "blue",
        "DEBUG": "yellow",
        "WARING": "orange",
        "ERROR": "red"
      }
    },
    events: {
      "closeMessage": "qx.event.type.Event"
    },
    members: {
      __closeCb: null,
      _createChildControlImpl: function _createChildControlImpl(id) {
        var _this = this;

        var control;

        switch (id) {
          case "message":
            control = new qx.ui.basic.Label().set({
              rich: true
            });

            this._add(control, {
              flex: 1
            });

            break;

          case "closebutton":
            control = new qxapp.component.form.IconButton("@MaterialIcons/close/16", function () {
              return _this.fireEvent("closeMessage");
            }).set({
              alignY: "middle"
            });

            this._add(control);

            break;

          case "badge":
            control = new qx.ui.core.Widget().set({
              height: 10,
              width: 10,
              allowStretchX: false,
              allowStretchY: false,
              alignY: "middle"
            });

            this._add(control);

            break;
        }

        return control || qxapp.ui.message.FlashMessage.prototype._createChildControlImpl.base.call(this, id);
      },
      _applyMessage: function _applyMessage(value) {
        var label = this.getChildControl("message");

        if (label) {
          label.setValue(value);
        }
      }
    }
  });
  qxapp.ui.message.FlashMessage.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=FlashMessage.js.map?dt=1568886164733