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
      "qxapp.theme.Color": {}
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

  /* global SVG */

  /* eslint new-cap: [2, {capIsNewExceptions: ["SVG", "M", "C"]}] */

  /**
   * @asset(svg/svg.*js)
   * @ignore(SVG)
   */

  /**
   * A qooxdoo wrapper for
   * <a href='https://github.com/svgdotjs/svg.js' target='_blank'>SVG</a>
   */
  qx.Class.define("qxapp.wrapper.Svg", {
    extend: qx.core.Object,
    statics: {
      NAME: "svg.js",
      VERSION: "2.7.1",
      URL: "https://github.com/svgdotjs/svg.js"
    },
    construct: function construct() {},
    properties: {
      libReady: {
        nullable: false,
        init: false,
        check: "Boolean"
      }
    },
    events: {
      "svgLibReady": "qx.event.type.Data"
    },
    members: {
      init: function init() {
        var _this = this;

        // initialize the script loading
        var svgPath = "svg/svg.js";
        var svgPathPath = "svg/svg.path.js";
        var dynLoader = new qx.util.DynamicScriptLoader([svgPath, svgPathPath]);
        dynLoader.addListenerOnce("ready", function (e) {
          console.log(svgPath + " loaded");

          _this.setLibReady(true);

          _this.fireDataEvent("svgLibReady", true);
        }, this);
        dynLoader.addListener("failed", function (e) {
          var data = e.getData();
          console.error("failed to load " + data.script);

          _this.fireDataEvent("svgLibReady", false);
        }, this);
        dynLoader.start();
      },
      createEmptyCanvas: function createEmptyCanvas(id) {
        return SVG(id);
      },
      drawCurve: function drawCurve(draw, controls) {
        var edgeWidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
        var portSphereDiameter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 4;
        var arrowSize = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 4;
        var edgeColor = qxapp.theme.Color.colors["workbench-edge-comp-active"];
        var path = draw.path().M(controls[0].x, controls[0].y).C(controls[1], controls[2], controls[3]).fill("none").stroke({
          width: edgeWidth,
          color: edgeColor
        });
        var marker1 = draw.marker(portSphereDiameter, portSphereDiameter, function (add) {
          add.circle(portSphereDiameter).fill(edgeColor);
        });
        path.marker("start", marker1);
        var marker2 = draw.marker(arrowSize, arrowSize, function (add) {
          add.path("M 0 0 V 4 L 2 2 Z").fill(edgeColor).size(arrowSize, arrowSize);
        });
        path.marker("end", marker2);
        path.markers = [marker1, marker2];
        return path;
      },
      updateCurve: function updateCurve(curve, controls) {
        if (curve.type === "path") {
          var mSegment = curve.getSegment(0);
          mSegment.coords = [controls[0].x, controls[0].y];
          curve.replaceSegment(0, mSegment);
          var cSegment = curve.getSegment(1);
          cSegment.coords = [controls[1].x, controls[1].y, controls[2].x, controls[2].y, controls[3].x, controls[3].y];
          curve.replaceSegment(1, cSegment);
        }
      },
      removeCurve: function removeCurve(curve) {
        if (curve.type === "path") {
          curve.remove();
        }
      },
      updateColor: function updateColor(curve, color) {
        if (curve.type === "path") {
          curve.attr({
            stroke: color
          });

          if (curve.markers) {
            curve.markers.forEach(function (markerDiv) {
              markerDiv.node.childNodes.forEach(function (node) {
                node.setAttribute("fill", color);
              });
            });
          }
        }
      }
    }
  });
  qxapp.wrapper.Svg.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Svg.js.map?dt=1568886166859