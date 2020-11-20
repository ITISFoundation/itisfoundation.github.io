(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Atom": {
        "construct": true,
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /*
   * oSPARC - The SIMCORE frontend - https://osparc.io
   * Copyright: 2019 IT'IS Foundation - https://itis.swiss
   * License: MIT - https://opensource.org/licenses/MIT
   * Authors: Ignacio Pascual (ignapas)
   */
  qx.Class.define("qxapp.component.service.NodeStatus", {
    extend: qx.ui.basic.Atom,
    construct: function construct(node) {
      qx.ui.basic.Atom.constructor.call(this, this.tr("Idle"), "@FontAwesome5Solid/clock/12");
      this.__node = node;
      this.__label = this.getChildControl("label");
      this.__icon = this.getChildControl("icon");

      if (node.isInKey("file-picker")) {
        this.__setupFilepicker();
      } else {
        this.__setupInteractive();
      }
    },
    properties: {
      appearance: {
        init: "chip",
        refine: true
      }
    },
    members: {
      __node: null,
      __label: null,
      __icon: null,
      __addClass: function __addClass(element, className) {
        if (element) {
          var currentClass = element.getAttribute("class");

          if (currentClass && currentClass.includes(className.trim())) {
            return;
          }

          element.setAttribute("class", ((currentClass || "") + " " + className).trim());
        }
      },
      __removeClass: function __removeClass(element, className) {
        var currentClass = element.getAttribute("class");

        if (currentClass) {
          var regex = new RegExp(className.trim(), "g");
          element.setAttribute("class", currentClass.replace(regex, ""));
        }
      },
      __setupInteractive: function __setupInteractive() {
        var _this = this;

        this.__node.bind("interactiveStatus", this.__label, "value", {
          converter: function converter(status) {
            if (status === "ready") {
              return _this.tr("Ready");
            } else if (status === "failed") {
              return _this.tr("Error");
            } else if (status === "starting") {
              return _this.tr("Starting...");
            } else if (status === "pending") {
              return _this.tr("Pending...");
            }

            return _this.tr("Idle");
          }
        });

        this.__node.bind("interactiveStatus", this.__icon, "source", {
          converter: function converter(status) {
            if (status === "ready") {
              return "@FontAwesome5Solid/check/12";
            } else if (status === "failed") {
              return "@FontAwesome5Solid/exclamation-circle/12";
            } else if (status === "starting") {
              return "@FontAwesome5Solid/circle-notch/12";
            } else if (status === "pending") {
              return "@FontAwesome5Solid/circle-notch/12";
            }

            return "@FontAwesome5Solid/check/12";
          },
          onUpdate: function onUpdate(source, target) {
            if (source.getInteractiveStatus() === "ready") {
              _this.__removeClass(_this.__icon.getContentElement(), "rotate");

              target.setTextColor("ready-green");
            } else if (source.getInteractiveStatus() === "failed") {
              _this.__removeClass(_this.__icon.getContentElement(), "rotate");

              target.setTextColor("failed-red");
            } else {
              _this.__addClass(_this.__icon.getContentElement(), "rotate");

              target.resetTextColor();
            }
          }
        });
      },
      __setupFilepicker: function __setupFilepicker() {
        var _this2 = this;

        var node = this.__node;

        this.__node.bind("progress", this.__icon, "source", {
          converter: function converter(progress) {
            if (progress === 100) {
              return "@FontAwesome5Solid/check/12";
            }

            return "@FontAwesome5Solid/file/12";
          },
          onUpdate: function onUpdate(source, target) {
            if (source.getProgress() === 100) {
              target.setTextColor("ready-green");
            } else {
              target.resetTextColor();
            }
          }
        });

        this.__node.bind("progress", this.__label, "value", {
          converter: function converter(progress) {
            if (progress === 100) {
              var outInfo = node.getOutputValues().outFile;

              if ("label" in outInfo) {
                return outInfo.label;
              }

              var splitFilename = outInfo.path.split("/");
              return splitFilename[splitFilename.length - 1];
            }

            return _this2.tr("Select a file");
          }
        });
      }
    }
  });
  qxapp.component.service.NodeStatus.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=NodeStatus.js.map?dt=1568886160792