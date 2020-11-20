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
  qx.Class.define("qxapp.dev.fake.stimulationSelectivity.Data", {
    type: "static",
    statics: {
      itemList: [{
        key: "StSeSubgroup-UUID",
        label: "Subgroup"
      }],
      compare: function compare(a, b) {
        if (a.label < b.label) {
          return -1;
        }

        if (a.label > b.label) {
          return 1;
        }

        return 0;
      },
      getItemList: function getItemList() {
        var itemList = qxapp.dev.fake.stimulationSelectivity.Data.itemList;
        itemList.sort(this.compare);
        return itemList;
      } // statics

    }
  });
  qxapp.dev.fake.stimulationSelectivity.Data.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Data.js.map?dt=1568886163914