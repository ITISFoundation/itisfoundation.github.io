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
  
     qxapp - the simcore frontend
  
     https://osparc.io
  
     Copyright:
       2018 IT'IS Foundation, https://itis.swiss
  
     License:
       MIT: https://opensource.org/licenses/MIT
  
     Authors:
       * Tobi Oetiker (oetiker)
  
  ************************************************************************ */

  /**
   * Collection of methods for doing MymeType operations.
   * https://en.wikipedia.org/wiki/Media_type
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   const sameType = qxapp.data.MimeType(mtA).match(new qxapp.data.MimeType(mtB));
   * </pre>
   */
  qx.Class.define("qxapp.data.MimeType", {
    extend: qx.core.Object,
    properties: {
      type: {},
      subType: {},
      parameters: {}
    },

    /**
      * @param string {String} source string
    */
    construct: function construct(string) {
      qx.core.Object.constructor.call(this);
      this.parse(string);
    },
    statics: {
      getMimeType: function getMimeType(type) {
        var match = type.match(/data:([^/\s]+\/[^/;\s]*)/);

        if (match) {
          return match[1];
        }

        return null;
      }
    },
    members: {
      parse: function parse(string) {
        var input = String(string).split(";");
        var essence = input.shift().split("/", 2);
        this.setType(essence[0].toLowerCase());
        this.setSubType(essence[1].toLowerCase());
        var para = {};
        input.forEach(function (p) {
          var kv = p.split("=", 2);
          para[kv[0]] = kv[1];
        });
        this.setParameters(para);
      },
      toString: function toString() {
        var p = this.getParameters();
        var kv = Object.keys(p).sort(function (a, b) {
          a = String(a);
          b = String(b);

          if (a > b) {
            return 1;
          }

          if (a < b) {
            return -1;
          }

          return 0;
        }).map(function (k) {
          return k + "=" + p[k];
        }).join(";");
        return this.getEssence() + (kv ? ";" + kv : "");
      },
      getEssence: function getEssence() {
        return this.getType() + "/" + this.getSubType();
      },
      match: function match(partner) {
        var matchType = this.getType() === partner.getType() || this.getType() === "*" || partner.getType() === "*";
        var matchSubType = this.getSubType() === partner.getSubType() || this.getSubType() === "*" || partner.getSubType() === "*";
        return matchType && matchSubType;
      }
    }
  });
  qxapp.data.MimeType.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=MimeType.js.map?dt=1568886162170