(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.bom.element.Attribute": {
        "construct": true
      },
      "qxapp.wrapper.Svg": {
        "construct": true
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
       * Odei Maiz (odeimaiz)
  
  ************************************************************************ */

  /**
   * Widget that provides a SVG painting layer that goes on top of the WorkbenchUI.
   *
   * In this layer arrows that represent internode connections are drawn.
   *
   * Also provides access to the SVG Wrapper.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let svgWidget = new qxapp.component.workbench.SvgWidget("SvgWidgetLayer");
   *   this.getRoot().add(svgWidget);
   * </pre>
   */
  qx.Class.define("qxapp.component.workbench.SvgWidget", {
    extend: qx.ui.core.Widget,

    /**
      * @param svgLayerId {String} Element id to set it as dom attribute
    */
    construct: function construct(svgLayerId) {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);
      this.addListenerOnce("appear", function () {
        var el = _this.getContentElement().getDomElement();

        qx.bom.element.Attribute.set(el, "id", svgLayerId);
        _this.__svgWrapper = new qxapp.wrapper.Svg();

        _this.__svgWrapper.addListener("svgLibReady", function () {
          _this.__edgesCanvas = _this.__svgWrapper.createEmptyCanvas(svgLayerId);

          _this.fireDataEvent("SvgWidgetReady", true);
        });

        _this.__svgWrapper.init();
      });
    },
    events: {
      "SvgWidgetReady": "qx.event.type.Data"
    },
    members: {
      __svgWrapper: null,
      __edgesCanvas: null,
      __getControls: function __getControls(x1, y1, x2, y2) {
        var offset = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 60;
        return [{
          x: x1,
          y: y1
        }, {
          x: x1 + offset,
          y: y1
        }, {
          x: x2 - offset,
          y: y2
        }, {
          x: x2,
          y: y2
        }];
      },
      drawCurve: function drawCurve(x1, y1, x2, y2) {
        var controls = this.__getControls(x1, y1, x2, y2);

        return this.__svgWrapper.drawCurve(this.__edgesCanvas, controls);
      },
      updateCurve: function updateCurve(curve, x1, y1, x2, y2) {
        var controls = this.__getControls(x1, y1, x2, y2);

        this.__svgWrapper.updateCurve(curve, controls);
      },
      removeCurve: function removeCurve(curve) {
        this.__svgWrapper.removeCurve(curve);
      },
      updateColor: function updateColor(curve, color) {
        this.__svgWrapper.updateColor(curve, color);
      }
    }
  });
  qxapp.component.workbench.SvgWidget.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=SvgWidget.js.map?dt=1568886161899