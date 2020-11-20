(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.utils.Utils": {},
      "qx.event.message.Bus": {}
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
   * Common functions for all elements that can be filtered
   */
  qx.Mixin.define("qxapp.component.filter.MFilterable", {
    members: {
      /**
       * Used to subscribe the element to a filter group.
       *
       * @param {String} groupId Id of the filter group to subscribe to.
       */
      subscribeToFilterGroup: function subscribeToFilterGroup(groupId) {
        var msgName = qxapp.utils.Utils.capitalize(groupId, "filter");
        qx.event.message.Bus.getInstance().subscribe(msgName, this.__subscriber, this);
      },

      /**
       * Subscriber function for incoming messages. It implements the common filtering workflow of every
       * filterable GUI element: If the filter state is appropiate, compare it with the own state and act
       * accordingly by applying the filter or removing it.
       *
       * @param {qx.event.message.Message} msg Message dispatched.
       */
      __subscriber: function __subscriber(msg) {
        if (this._shouldReactToFilter(msg.getData(), msg) && this._shouldApplyFilter(msg.getData(), msg)) {
          this._filter(msg.getData(), msg);
        } else {
          this._unfilter(msg.getData(), msg);
        }
      }
    }
  });
  qxapp.component.filter.MFilterable.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=MFilterable.js.map?dt=1568886159917