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
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007 Christian Boulanger
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Boulanger
  
  ************************************************************************ */

  /**
   * A message to be dispatched on the message bus.
   */
  qx.Class.define("qx.event.message.Message", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param name {String} The name of the message
     * @param data {var} Any type of data to attach
     */
    construct: function construct(name, data) {
      qx.core.Object.constructor.call(this);

      if (name != null) {
        this.setName(name);
      }

      if (data != null) {
        this.setData(data);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Event name of the message. Based on this name the message is dispatched
       * to the event listeners.
       */
      name: {
        check: "String"
      },

      /**
       * Any data the sender wants to pass with the event.
       */
      data: {
        init: null,
        nullable: true
      },

      /**
       * A reference to the sending object.
       */
      sender: {
        check: "Object",
        nullable: true
      }
    },
    destruct: function destruct() {
      this.setData(null);
      this.setSender(null);
    }
  });
  qx.event.message.Message.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Message.js.map?dt=1568886169096