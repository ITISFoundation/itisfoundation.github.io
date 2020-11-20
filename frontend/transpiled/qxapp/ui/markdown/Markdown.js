(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.embed.Html": {
        "construct": true,
        "require": true
      },
      "qx.util.DynamicScriptLoader": {
        "construct": true
      },
      "qxapp.wrapper.DOMPurify": {},
      "qx.event.Timer": {},
      "qx.bom.Selector": {},
      "qx.bom.element.Dimension": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /*
   * oSPARC - The SIMCORE frontend - https://osparc.io
   * Copyright: 2019 IT'IS Foundation - https://itis.swiss
   * License: MIT - https://opensource.org/licenses/MIT
   * Authors: Ignacio Pascual (ignapas)
   *          Odei Maiz (odeimaiz)
   */

  /**
   * @asset(marked/marked.js)
   */

  /* global marked */

  /**
   * This class is just a special kind of rich label that takes markdown raw text, compiles it to HTML,
   * sanitizes it and applies it to its value property.
   */
  qx.Class.define("qxapp.ui.markdown.Markdown", {
    extend: qx.ui.embed.Html,

    /**
     * Markdown constructor. It directly accepts markdown as its first argument.
     * @param {String} markdown Plain text accepting markdown syntax. Its compiled version will be set in the value property of the label.
     */
    construct: function construct(markdown) {
      var _this = this;

      qx.ui.embed.Html.constructor.call(this);
      this.__loadMarked = new Promise(function (resolve, reject) {
        if (typeof marked === "function") {
          resolve(marked);
        } else {
          var loader = new qx.util.DynamicScriptLoader(["marked/marked.js"]);
          loader.addListenerOnce("ready", function () {
            resolve(marked);
          }, _this);
          loader.addListenerOnce("failed", function (e) {
            reject(Error("Failed to load ".concat(e.getData(), ". Value couldn't be updated.")));
          });
          loader.start();
        }
      });

      if (markdown) {
        this.setMarkdown(markdown);
      }

      this.addListener("resize", function (e) {
        return _this.__resizeMe();
      }, this);
    },
    properties: {
      /**
       * Holds the raw markdown text and updates the label's {@link #value} whenever new markdown arrives.
       */
      markdown: {
        check: "String",
        apply: "_applyMarkdown"
      }
    },
    members: {
      __loadMarked: null,

      /**
       * Apply function for the markdown property. Compiles the markdown text to HTML and applies it to the value property of the label.
       * @param {String} value Plain text accepting markdown syntax.
       */
      _applyMarkdown: function _applyMarkdown(value) {
        var _this2 = this;

        this.__loadMarked.then(function () {
          var html = marked(value);
          var safeHtml = qxapp.wrapper.DOMPurify.getInstance().sanitize(html);

          _this2.setHtml(safeHtml); // for some reason the content is not immediately there


          qx.event.Timer.once(function () {
            _this2.__parseImages();

            _this2.__resizeMe();
          }, _this2, 100);

          _this2.__resizeMe();
        })["catch"](function (error) {
          return console.error(error);
        });
      },
      __parseImages: function __parseImages() {
        var _this3 = this;

        var domElement = this.__getDomElement();

        if (domElement === null) {
          return;
        }

        var images = qx.bom.Selector.query("img", domElement);

        for (var i = 0; i < images.length; i++) {
          images[i].onload = function () {
            _this3.__resizeMe();
          };
        }
      },
      // qx.ui.embed.html scale to content
      __resizeMe: function __resizeMe() {
        var domElement = this.__getDomElement();

        if (domElement === null) {
          return;
        }

        if (domElement && domElement.children) {
          var elemHeight = this.__getChildrenElementHeight(domElement.children);

          this.setHeight(elemHeight);
        }
      },
      __getChildrenElementHeight: function __getChildrenElementHeight(children) {
        var height = 0;

        if (children.length) {
          for (var i = 0; i < children.length; i++) {
            height += this.__getElementHeight(children[i]);
          }
        }

        return height;
      },
      __getElementHeight: function __getElementHeight(element) {
        var size = qx.bom.element.Dimension.getSize(element); // add padding

        return size.height + 15;
      },
      __getDomElement: function __getDomElement() {
        if (!this.getContentElement) {
          return null;
        }

        var domElement = this.getContentElement().getDomElement();

        if (domElement) {
          return domElement;
        }

        return null;
      }
    }
  });
  qxapp.ui.markdown.Markdown.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Markdown.js.map?dt=1568886164713