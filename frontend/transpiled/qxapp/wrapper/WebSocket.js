(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.util.DynamicScriptLoader": {},
      "qx.lang.Function": {}
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

  /* global io */

  /**
   * @asset(socketio/socket.io.js)
   * @ignore(io)
   */

  /**
   * A qooxdoo wrapper for
   * <a href='https://github.com/socketio/socket.io' target='_blank'>WebSocket</a>
   */
  qx.Class.define("qxapp.wrapper.WebSocket", {
    extend: qx.core.Object,
    type: "singleton",
    statics: {
      NAME: "socket.io",
      VERSION: "2.2.0",
      URL: "https://github.com/socketio/socket.io"
    },
    // Socket.io events
    events: {
      /** socket.io connect event */
      "connect": "qx.event.type.Event",

      /** socket.io connecting event */
      "connecting": "qx.event.type.Data",

      /** socket.io connect_failed event */
      "connect_failed": "qx.event.type.Event",

      /** socket.io message event */
      "message": "qx.event.type.Data",

      /** socket.io close event */
      "close": "qx.event.type.Data",

      /** socket.io disconnect event */
      "disconnect": "qx.event.type.Event",

      /** socket.io reconnect event */
      "reconnect": "qx.event.type.Data",

      /** socket.io reconnecting event */
      "reconnecting": "qx.event.type.Data",

      /** socket.io reconnect_failed event */
      "reconnect_failed": "qx.event.type.Event",

      /** socket.io error event */
      "error": "qx.event.type.Data"
    },
    properties: {
      libReady: {
        nullable: false,
        init: false,
        check: "Boolean"
      },

      /**
       * The url used to connect to socket.io
       */
      url: {
        nullable: false,
        init: "/",
        check: "String"
      },

      /** The port used to connect */
      port: {
        nullable: true,
        init: null,
        check: "Number"
      },

      /** The namespace (socket.io namespace), can be empty */
      namespace: {
        nullable: true,
        init: "",
        check: "String"
      },

      /** The socket (socket.io), can be null */
      socket: {
        nullable: true,
        init: null,
        check: "Object"
      },

      /** Parameter for socket.io indicating if we should reconnect or not */
      reconnect: {
        nullable: true,
        init: true,
        check: "Boolean"
      },
      connectTimeout: {
        nullable: true,
        init: 10000,
        check: "Number"
      },

      /** Reconnection delay for socket.io. */
      reconnectionDelay: {
        nullable: false,
        init: 500,
        check: "Number"
      },

      /** Max reconnection attemps */
      maxReconnectionAttemps: {
        nullable: false,
        init: 1000,
        check: "Number"
      }
    },

    /** Constructor
     * @param {string} [namespace] The namespace to connect on
     * @returns {void}
     */
    construct: function construct(namespace) {
      // this.base();
      if (namespace === undefined) {
        namespace = "app";
      }

      if (namespace) {
        this.setNamespace(namespace);
      }

      this.__name = [];
    },
    members: {
      // The name store an array of events
      __name: null,

      /**
       * Trying to using socket.io to connect and plug every event from socket.io to qooxdoo one
       * @returns {void}
       */
      connect: function connect() {
        var _this = this;

        // initialize the script loading
        var socketIOPath = "socketio/socket.io.js";
        var dynLoader = new qx.util.DynamicScriptLoader([socketIOPath]);
        dynLoader.addListenerOnce("ready", function (e) {
          console.log(socketIOPath + " loaded");

          _this.setLibReady(true);

          if (_this.getSocket() !== null) {
            _this.disconnect();
          }

          var dir = _this.getUrl();

          if (_this.getPort() > 0) {
            dir += ":" + _this.getPort();
          }

          console.log("socket in", dir);
          var mySocket = io.connect(dir, {
            "reconnect": _this.getReconnect(),
            "connect timeout": _this.getConnectTimeout(),
            "reconnection delay": _this.getReconnectionDelay(),
            "max reconnection attempts": _this.getMaxReconnectionAttemps(),
            "force new connection": true
          });

          _this.setSocket(mySocket);

          ["connecting", "message", "close", "reconnect", "reconnecting", "error"].forEach(function (event) {
            _this.on(event, function (ev) {
              _this.fireDataEvent(event, ev);
            }, _this);
          }, _this);
          ["connect", "connect_failed", "disconnect", "reconnect_failed"].forEach(function (event) {
            _this.on(event, function () {
              _this.fireDataEvent(event);
            }, _this);
          }, _this);
        }, this);
        dynLoader.start();
      },
      disconnect: function disconnect() {
        if (this.getSocket() !== null) {
          this.getSocket().removeAllListeners();
          this.getSocket().disconnect();
        }
      },

      /**
       * Emit an event using socket.io
       *
       * @param {string} name The event name to send to Node.JS
       * @param {object} jsonObject The JSON object to send to socket.io as parameters
       * @returns {void}
       */
      emit: function emit(name, jsonObject) {
        console.log("emit", name);
        this.getSocket().emit(name, jsonObject);
      },

      /**
       * Connect and event from socket.io like qooxdoo event
       *
       * @param {string} name The event name to watch
       * @param {function} fn The function wich will catch event response
       * @param {mixed} that A link to this
       * @returns {void}
       */
      on: function on(name, fn, that) {
        this.__name.push(name);

        if (typeof that !== "undefined" && that !== null) {
          this.getSocket().on(name, qx.lang.Function.bind(fn, that));
        } else {
          this.getSocket().on(name, fn);
        }
      },
      slotExists: function slotExists(name) {
        for (var i = 0; i < this.__name.length; ++i) {
          if (this.__name[i] === name) {
            return true;
          }
        }

        return false;
      },
      removeSlot: function removeSlot(name) {
        var index = this.__name.indexOf(name);

        if (index > -1) {
          this.getSocket().removeAllListeners(this.__name[index]);

          this.__name.splice(index, 1);
        }
      }
    },

    /**
     * Destructor
     * @returns {void}
     */
    destruct: function destruct() {
      if (this.getSocket() !== null) {
        // Deleting listeners
        if (this.__name !== null && this.__name.length >= 1) {
          for (var i = 0; i < this.__name.length; ++i) {
            this.getSocket().removeAllListeners(this.__name[i]);
          }
        }

        this.__name = null;
        this.removeAllBindings(); // Disconnecting socket.io

        try {
          this.getSocket().socket.disconnect();
        } catch (e) {}

        try {
          this.getSocket().disconnect();
        } catch (e) {}

        this.getSocket().removeAllListeners("connect");
        this.getSocket().removeAllListeners("connecting");
        this.getSocket().removeAllListeners("connect_failed");
        this.getSocket().removeAllListeners("message");
        this.getSocket().removeAllListeners("close");
        this.getSocket().removeAllListeners("disconnect");
        this.getSocket().removeAllListeners("reconnect");
        this.getSocket().removeAllListeners("reconnecting");
        this.getSocket().removeAllListeners("reconnect_failed");
        this.getSocket().removeAllListeners("error");
      }
    }
  });
  qxapp.wrapper.WebSocket.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=WebSocket.js.map?dt=1568886166895