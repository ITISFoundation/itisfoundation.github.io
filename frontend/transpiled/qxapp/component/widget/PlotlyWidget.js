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
      "qxapp.wrapper.Plotly": {
        "construct": true
      },
      "qx.dom.Element": {
        "construct": true
      },
      "qx.bom.element.Attribute": {
        "construct": true
      },
      "qx.bom.element.Style": {
        "construct": true
      }
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
   * Widget containing a Plotly dom element.
   *
   * Data for being plotted can be dynamically set adn rendered.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let plotlyWidget = new qxapp.component.widget.PlotlyWidget("elemId");
   *   this.getRoot().add(plotlyWidget);
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.PlotlyWidget", {
    extend: qx.ui.core.Widget,

    /**
      * @param elemId {String} Element id to set it as dom attribute
    */
    construct: function construct(elemId) {
      var _this = this;

      qx.ui.core.Widget.constructor.call(this);
      this.addListenerOnce("appear", function () {
        _this.__plotlyWrapper = new qxapp.wrapper.Plotly();

        _this.__plotlyWrapper.addListener("plotlyLibReady", function (e) {
          var ready = e.getData();

          if (ready) {
            var plotlyPlaceholder = qx.dom.Element.create("div");
            qx.bom.element.Attribute.set(plotlyPlaceholder, "id", elemId);
            qx.bom.element.Style.set(plotlyPlaceholder, "width", "100%");
            qx.bom.element.Style.set(plotlyPlaceholder, "height", "100%");

            _this.getContentElement().getDomElement().appendChild(plotlyPlaceholder);

            _this.__plotlyWrapper.createEmptyPlot(elemId);

            _this.fireDataEvent("plotlyWidgetReady", true);
          } else {
            console.debug("plotly.js was not loaded");

            _this.fireDataEvent("plotlyWidgetReady", false);
          }
        }, _this);

        _this.__plotlyWrapper.init();
      }, this);
      this.addListener("resize", function () {
        if (this.__plotlyWrapper) {
          this.__plotlyWrapper.resize();
        }
      }, this);
    },
    events: {
      "plotlyWidgetReady": "qx.event.type.Data"
    },
    members: {
      __plotlyWrapper: null,
      resize: function resize() {
        this.__plotlyWrapper.resize();
      },
      setData: function setData(ids, labels, values, tooltips, title) {
        this.__plotlyWrapper.setData(ids, labels, values, tooltips, title);
      }
    }
  });
  qxapp.component.widget.PlotlyWidget.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=PlotlyWidget.js.map?dt=1568886161449