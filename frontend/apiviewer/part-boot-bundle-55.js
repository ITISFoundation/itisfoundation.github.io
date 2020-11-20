(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.lang.Type": {
        "construct": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.test.delay.scale": {
          "construct": true
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   *  This class stores the information needed to instruct a running test to wait.
   *  It is thrown as an exception to be caught by the method executing the test.
   */
  qx.Class.define("qx.dev.unit.AsyncWrapper", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param delay {Integer?} The amount of time in milliseconds to wait
     * @param deferredFunction {Function?} The function to run after the timeout
     * has expired.
     * @param context {Object?window} Optional execution context for deferredFunction
     */
    construct: function construct(delay, deferredFunction, context) {
      for (var i = 0; i < 2; i++) {
        if (qx.lang.Type.isFunction(arguments[i])) {
          this.setDeferredFunction(arguments[i]);
        } else if (qx.lang.Type.isNumber(arguments[i])) {
          if (qx.core.Environment.get("qx.test.delay.scale")) {
            this.setDelay(arguments[i] * parseInt(qx.core.Environment.get("qx.test.delay.scale"), 10));
          } else {
            this.setDelay(arguments[i]);
          }
        }
      }

      if (context) {
        this.setContext(context);
      }
    },
    properties: {
      /** The function to run after the timeout has expired */
      deferredFunction: {
        check: "Function",
        init: false
      },

      /** The context in which the timeout function should be executed  */
      context: {
        check: "Object",
        init: null
      },

      /** The amount of time in milliseconds to wait */
      delay: {
        check: "Integer",
        nullable: false,
        init: 10000
      }
    }
  });
  qx.dev.unit.AsyncWrapper.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * This error is thrown by the unit test class if an infrastructure requirement
   * is not met. The unit testing framework should skip the test and visually mark
   * the test as not having been executed.
   */
  qx.Class.define("qx.dev.unit.RequirementError", {
    extend: Error,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param requirement {String?} The requirement ID, e.g. "SSL"
     * @param message {String?} Optional error message
     */
    construct: function construct(requirement, message) {
      this.__message = message || "Requirement not met";
      this.__requirement = requirement;
      var inst = Error.call(this, this.__message); // map stack trace properties since they're not added by Error's constructor

      if (inst.stack) {
        this.stack = inst.stack;
      }

      if (inst.stacktrace) {
        this.stacktrace = inst.stacktrace;
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __message: null,
      __requirement: null,

      /**
       * Returns the ID of the requirement that was not satisfied.
       *
       * @return {String} The requirement ID
       */
      getRequirement: function getRequirement() {
        return this.__requirement;
      },

      /**
       * Returns a string representation of the error.
       *
       * @return {String} Error message
       */
      toString: function toString() {
        var msg = this.__message;

        if (this.__requirement) {
          msg += ": " + this.__requirement;
        }

        return msg;
      }
    }
  });
  qx.dev.unit.RequirementError.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-55.js.map
