(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.embed.AbstractIframe": {
        "construct": true,
        "require": true
      },
      "qx.ui.embed.Iframe": {},
      "qx.html.Element": {},
      "qx.ui.form.Button": {},
      "osparc.theme.osparcdark.Image": {},
      "qx.event.message.Bus": {},
      "qx.bom.element.Location": {},
      "qx.bom.element.Dimension": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
     Copyright: 2018 ITIS Foundation
     License:   MIT
     Authors:   Tobi Oetiker <tobi@oetiker.ch>
     Utf8Check: äöü
  ************************************************************************ */

  /**
   * When moving an iframe node in the dom, it reloads its content. This is
   * rather unfortunate when the content is another web application.
   * This Iframe widget solves the problem by attaching the iframe to a
   * permanent location and just moving it into position as the actual
   * widget manifests in different locations. There are limits as to where
   * the widget can be displayed as the widget hierarchy may prevent correct
   * visualisation. By default the iframe is attached to the root node of
   * the document, but an alternate attachment can be specified as required.
   *
   */
  qx.Class.define("qxapp.component.widget.PersistentIframe", {
    extend: qx.ui.embed.AbstractIframe,

    /**
     *
     * @param source {String} URL for the iframe content
     * @param poolEl {Element?} Dom node for attaching the iframe
     */
    construct: function construct(source, el) {
      qx.ui.embed.AbstractIframe.constructor.call(this, source);
    },
    properties: {
      /**
       * Show a Maximize Button
       */
      showMaximize: {
        check: "boolean",
        init: false,
        apply: "_applyShowMaximize"
      }
    },
    events: {
      /** Fired if the iframe is restored from a minimized or maximized state */
      "restore": "qx.event.type.Event",

      /** Fired if the iframe is maximized */
      "maximize": "qx.event.type.Event"
    },
    members: {
      __iframe: null,
      __syncScheduled: null,
      __actionButton: null,
      // override
      _createContentElement: function _createContentElement() {
        var _this = this;

        var iframe = this.__iframe = new qx.ui.embed.Iframe(this.getSource());
        iframe.addListener("load", function (e) {
          _this.fireEvent("load");
        });
        iframe.addListener("navigate", function (e) {
          _this.fireDataEvent("navigate", e.getData());
        });
        var standin = new qx.html.Element("div");
        var appRoot = this.getApplicationRoot();
        appRoot.add(iframe, {
          top: -10000
        });
        var actionButton = this.__actionButton = new qx.ui.form.Button(null, osparc.theme.osparcdark.Image.URLS["window-maximize"] + "/20").set({
          zIndex: 20,
          backgroundColor: "transparent",
          decorator: null
        });
        appRoot.add(actionButton, {
          top: -10000
        });
        actionButton.addListener("execute", function (e) {
          _this.maximizeIFrame(!_this.hasState("maximized"));

          qx.event.message.Bus.getInstance().dispatchByName("maximizeIframe", _this.hasState("maximized"));
        }, this);
        appRoot.add(actionButton);
        standin.addListener("appear", function (e) {
          _this.__syncIframePos();
        });
        standin.addListener("disappear", function (e) {
          iframe.setLayoutProperties({
            top: -10000
          });
          actionButton.setLayoutProperties({
            top: -10000
          });
        });
        this.addListener("move", function (e) {
          // got to let the new layout render first or we don't see it
          _this.__syncIframePos();
        });
        this.addListener("resize", function (e) {
          // got to let the new layout render first or we don't see it
          _this.__syncIframePos();
        });
        this.addListener("changeVisibility", function (e) {
          var visibility = e.getData()[0];

          if (visibility == "none") {
            iframe.set({
              zIndex: -10000
            });
          } else {
            _this.__syncIframePos();
          }
        });
        return standin;
      },
      maximizeIFrame: function maximizeIFrame(maximize) {
        var actionButton = this.__actionButton;

        if (maximize) {
          this.fireEvent("maximize");
          this.addState("maximized");
          actionButton.setIcon(osparc.theme.osparcdark.Image.URLS["window-restore"] + "/20");
        } else {
          this.fireEvent("restore");
          this.removeState("maximized");
          actionButton.setIcon(osparc.theme.osparcdark.Image.URLS["window-maximize"] + "/20");
        }
      },
      __syncIframePos: function __syncIframePos() {
        var _this2 = this;

        if (this.__syncScheduled) {
          return;
        }

        this.__syncScheduled = true;
        window.setTimeout(function () {
          _this2.__syncScheduled = false;
          var iframeParentPos = qx.bom.element.Location.get(qx.bom.element.Location.getOffsetParent(_this2.__iframe.getContentElement().getDomElement()), "scroll");
          var divPos = qx.bom.element.Location.get(_this2.getContentElement().getDomElement(), "scroll");
          var divSize = qx.bom.element.Dimension.getSize(_this2.getContentElement().getDomElement());

          _this2.__iframe.setLayoutProperties({
            top: divPos.top - iframeParentPos.top,
            left: divPos.left - iframeParentPos.left
          });

          _this2.__iframe.set({
            width: divSize.width,
            height: divSize.height
          });

          _this2.__actionButton.setLayoutProperties({
            top: divPos.top - iframeParentPos.top,
            right: iframeParentPos.right - iframeParentPos.left - divPos.right
          });
        }, 0);
      },
      _applyShowMaximize: function _applyShowMaximize(newValue, oldValue) {
        this._maximizeBtn.show();
      },
      _applySource: function _applySource(newValue) {
        this.__iframe.setSource(newValue);
      },
      // override
      _getIframeElement: function _getIframeElement() {
        return this.__iframe._getIframeElement(); // eslint-disable-line no-underscore-dangle
      },

      /**
       * Cover the iframe with a transparent blocker div element. This prevents
       * pointer or key events to be handled by the iframe. To release the blocker
       * use {@link #release}.
       *
       */
      block: function block() {
        this.__iframe.block();
      },

      /**
       * Release the blocker set by {@link #block}.
       *
       */
      release: function release() {
        this.__iframe.release();
      }
    },
    destruct: function destruct() {
      this.__iframe.exclude();

      this.__iframe.dispose();

      this.__iframe = undefined;
    }
  });
  qxapp.component.widget.PersistentIframe.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=PersistentIframe.js.map?dt=1568886161426