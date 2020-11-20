(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.data.Array": {
        "construct": true
      },
      "qx.ui.container.Composite": {
        "construct": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.core.Init": {
        "construct": true
      },
      "qxapp.ui.message.FlashMessage": {},
      "qx.event.Timer": {}
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
       * Ignacio Pascual (ignapas)
  
  ************************************************************************ */

  /**
   *   Singleton class that pops up a window showing a log message. The time the window is visible depends
   * on the length of the message. Also if a second message is added will be stacked to the previous one.
   *
   *   Depending on the log level ("DEBUG", "INFO", "WARNING", "ERROR") the background color of the window
   * will be different.
   *
   * *Example*
   *
   * Here is a little example of how to use the class.
   *
   * <pre class='javascript'>
   *   qxapp.component.message.FlashMessenger.getInstance().log(log);
   * </pre>
   */
  qx.Class.define("qxapp.component.message.FlashMessenger", {
    extend: qx.core.Object,
    type: "singleton",
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__messages = new qx.data.Array();
      this.__messageContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      var root = qx.core.Init.getApplication().getRoot();
      root.add(this.__messageContainer, {
        top: 10
      });
      this.__displayedMessagesCount = 0;

      this.__attachEventHandlers();
    },
    statics: {
      MAX_DISPLAYED: 3
    },
    members: {
      __messages: null,
      __messageContainer: null,
      __displayedMessagesCount: null,

      /**
       * Public function to log a FlashMessage to the user.
       *
       * @param {String} message Message that the message will show.
       * @param {String="INFO","DEBUG","WARNING","ERROR"} level Level of the warning. The color of the badge will change accordingly.
       * @param {*} logger IDK
       */
      logAs: function logAs(message) {
        var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "INFO";
        var logger = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        this.log({
          message: message,
          level: level.toUpperCase(),
          logger: logger
        });
      },

      /**
       * Public function to log a FlashMessage to the user.
       *
       * @param {Object} logMessage Constructed message to log.
       * @param {String} logMessage.message Message that the message will show.
       * @param {String="INFO","DEBUG","WARNING","ERROR"} logMessage.level Level of the warning. The color of the badge will change accordingly.
       * @param {*} logMessage.logger IDK
       */
      log: function log(logMessage) {
        var _this = this;

        var message = logMessage.message;
        var level = logMessage.level.toUpperCase(); // "DEBUG", "INFO", "WARNING", "ERROR"

        var logger = logMessage.logger;

        if (logger) {
          message = logger + ": " + message;
        }

        var flash = new qxapp.ui.message.FlashMessage(message, level);
        flash.addListener("closeMessage", function () {
          return _this.__removeMessage(flash);
        }, this);

        this.__messages.push(flash);
      },

      /**
       * Private method to show a message to the user. It will stack it on the previous ones.
       *
       * @param {qxapp.ui.message.FlashMessage} message FlassMessage element to show.
       */
      __showMessage: function __showMessage(message) {
        var _this2 = this;

        this.__messages.remove(message);

        this.__messageContainer.resetDecorator();

        this.__messageContainer.add(message);

        var _message$getSizeHint = message.getSizeHint(),
            width = _message$getSizeHint.width;

        if (this.__displayedMessagesCount === 0 || width > this.__messageContainer.getWidth()) {
          this.__updateContainerPosition(width);
        }

        this.__displayedMessagesCount++;
        var wordCount = message.getMessage().split(" ").length;
        var readingTime = Math.max(5500, wordCount * 370); // An average reader takes 300ms to read a word

        qx.event.Timer.once(function () {
          return _this2.__removeMessage(message);
        }, this, readingTime);
      },

      /**
       * Private method to remove a message. If there are still messages in the queue, it will show the next available one.
       *
       * @param {qxapp.ui.message.FlashMessage} message FlassMessage element to remove.
       */
      __removeMessage: function __removeMessage(message) {
        var _this3 = this;

        if (this.__messageContainer.indexOf(message) > -1) {
          this.__displayedMessagesCount--;

          this.__messageContainer.setDecorator("flash-container-transitioned");

          this.__messageContainer.remove(message);

          qx.event.Timer.once(function () {
            if (_this3.__messages.length) {
              // There are still messages to show
              _this3.__showMessage(_this3.__messages.getItem(0));
            }
          }, this, 200);
        }
      },

      /**
       * Function to re-position the message container according to the next message size, or its own size, if the previous is missing.
       *
       * @param {Integer} messageWidth Size of the next message to add in pixels.
       */
      __updateContainerPosition: function __updateContainerPosition(messageWidth) {
        var width = messageWidth || this.__messageContainer.getSizeHint().width;

        var root = qx.core.Init.getApplication().getRoot();

        if (root && root.getBounds()) {
          this.__messageContainer.setLayoutProperties({
            left: Math.round((root.getBounds().width - width) / 2)
          });
        }
      },
      __attachEventHandlers: function __attachEventHandlers() {
        var _this4 = this;

        this.__messages.addListener("change", function (e) {
          var data = e.getData();

          if (data.type === "add") {
            if (_this4.__displayedMessagesCount < qxapp.component.message.FlashMessenger.MAX_DISPLAYED) {
              _this4.__showMessage(data.added[0]);
            }
          }
        }, this);
      }
    }
  });
  qxapp.component.message.FlashMessenger.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=FlashMessenger.js.map?dt=1568886160490