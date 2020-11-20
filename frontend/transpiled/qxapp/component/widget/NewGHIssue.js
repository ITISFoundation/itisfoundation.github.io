(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxapp.utils.LibVersions": {}
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
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   const url = qxapp.component.widget.NewGHIssue.getNewIssueUrl();
   *   window.open(url);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.NewGHIssue", {
    type: "static",
    statics: {
      getNewIssueUrl: function getNewIssueUrl() {
        var temp = qxapp.component.widget.NewGHIssue.getTemplate();
        var env = "```json\n";
        env += JSON.stringify(qxapp.utils.LibVersions.getEnvLibs(), null, 2);
        env += "\n```";
        var body = encodeURIComponent(temp + env);
        var url = "https://github.com/ITISFoundation/osparc-simcore/issues/new";
        url += "?labels=tester_review,UX_improvements";
        url += "&projects=ITISFoundation/3";
        url += "&body=" + body;
        return url;
      },
      getTemplate: function getTemplate() {
        return "\n## Long story short\n<!-- Please describe your review or bug you found. -->\n\n## Expected behaviour\n<!-- What is the behaviour you expect? -->\n\n## Actual behaviour\n<!-- What's actually happening? -->\n\n## Steps to reproduce\n<!-- Please describe steps to reproduce the issue. -->\n\nNote: your environment was attached but will not be displayed\n<!--\n## Your environment\n";
      }
    }
  });
  qxapp.component.widget.NewGHIssue.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NewGHIssue.js.map?dt=1568886161030