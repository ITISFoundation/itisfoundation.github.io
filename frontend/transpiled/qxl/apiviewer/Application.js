(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.application.Standalone": {
        "construct": true,
        "require": true
      },
      "qx.util.ResourceManager": {
        "construct": true
      },
      "qx.bom.Stylesheet": {
        "construct": true
      },
      "qx.log.appender.Native": {},
      "qx.log.appender.Console": {},
      "qx.ui.core.Widget": {},
      "qxl.apiviewer.MWidgetRegistry": {},
      "qxl.apiviewer.Viewer": {},
      "qxl.apiviewer.Controller": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "apiviewer": {}
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
       2018 Zenesis Limited, http://www.zenesis.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * John Spackman (johnspackman)
       * Til Schneider (til132)
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /* ************************************************************************
  
  
  ************************************************************************ */

  /**
   * Your apiviewer application
   *
   * @asset(qxl/apiviewer/*)
   */
  qx.Class.define("qxl.apiviewer.Application", {
    extend: qx.application.Standalone,
    construct: function construct() {
      qx.application.Standalone.constructor.call(this);
      var uri = qx.util.ResourceManager.getInstance().toUri("qxl/apiviewer/css/apiviewer.css");
      qx.bom.Stylesheet.includeFile(uri);
    },

    /*
    *****************************************************************************
     MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      main: function main() {
        // Call super class
        qxl.apiviewer.Application.prototype.main.base.call(this); // Add log appenders

        {
          qx.log.appender.Native;
          qx.log.appender.Console;
        }
        qx.Class.include(qx.ui.core.Widget, qxl.apiviewer.MWidgetRegistry);
        this.viewer = new qxl.apiviewer.Viewer();
        this.controller = new qxl.apiviewer.Controller(); // set variables for later usage.

        this.getRoot().add(this.viewer, {
          edge: 0
        });
      },
      // overridden
      finalize: function finalize() {
        qxl.apiviewer.Application.prototype.finalize.base.call(this); // Finally load the data

        var apidata = qx.core.Environment.get("apiviewer");
        this.viewer._searchView.apiindex = apidata.apiindex;
        this.controller.load(apidata);
      }
    },

    /*
    *****************************************************************************
     DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("viewer", "controller");
    }
  });
  qxl.apiviewer.Application.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Application.js.map?dt=1568886166919