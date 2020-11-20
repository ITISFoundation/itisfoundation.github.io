(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.locale.Manager": {}
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
       * Pedro Crespo (pcrespov)
  
  ************************************************************************ */

  /* global document */
  qx.Class.define("qxapp.auth.core.Utils", {
    type: "static",
    statics: {
      checkSamePasswords: function checkSamePasswords(passwordField1, passwordField2) {
        var isValid = passwordField1.getValue() == passwordField2.getValue();

        if (!isValid) {
          [passwordField1, passwordField2].forEach(function (pass) {
            pass.set({
              invalidMessage: qx.locale.Manager.tr("Passwords do not match"),
              valid: false
            });
          });
        }

        return isValid;
      },

      /** Finds parameters in the fragment
       *
       * Expected fragment format as https://osparc.io#page=reset-password;code=123546
       * where fragment is #page=reset-password;code=123546
       */
      findParameterInFragment: function findParameterInFragment(parameterName) {
        var result = null;
        var params = window.location.hash.substr(1).split(";");
        params.forEach(function (item) {
          var tmp = item.split("=");

          if (tmp[0] === parameterName) {
            result = decodeURIComponent(tmp[1]);
          }
        });
        return result;
      },
      removeParameterInFragment: function removeParameterInFragment(parameterName) {
        var url = window.location.href;
        var value = qxapp.auth.core.Utils.findParameterInFragment(parameterName);

        if (value) {
          var removeMe = parameterName + "=" + value; // In case the parameterhas an ampersand in front

          url = url.replace(";" + removeMe, "");
          url = url.replace(removeMe, "");

          if (url.slice(-1) === "#") {
            // clean remaining character if all parameters were removed
            url = url.replace("#", "");
          }

          window.history.replaceState("", document.title, url);
        }
      }
    }
  });
  qxapp.auth.core.Utils.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Utils.js.map?dt=1568886159668