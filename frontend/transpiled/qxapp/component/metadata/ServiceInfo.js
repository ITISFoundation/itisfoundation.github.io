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
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qxapp.desktop.PanelView": {},
      "qx.ui.basic.Image": {},
      "qxapp.utils.Utils": {},
      "qx.ui.basic.Label": {},
      "qxapp.ui.markdown.Markdown": {},
      "qx.ui.container.Scroll": {},
      "qxapp.component.widget.JsonTreeWidget": {}
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
   * Widget that displays the available information of the given service metadata.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *    const serviceInfo = new qxapp.component.metadata.ServiceInfo(selectedService);
   *    this.add(serviceInfo);
   * </pre>
   */
  qx.Class.define("qxapp.component.metadata.ServiceInfo", {
    extend: qx.ui.core.Widget,

    /**
      * @param metadata {Object} Service metadata
      */
    construct: function construct(metadata) {
      qx.ui.core.Widget.constructor.call(this);
      this.set({
        padding: 5,
        backgroundColor: "background-main"
      });

      this._setLayout(new qx.ui.layout.VBox(8));

      this.__metadata = metadata;

      this.__createServiceInfoView();
    },
    members: {
      __metadata: null,
      __createServiceInfoView: function __createServiceInfoView() {
        var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8).set({
          alignY: "middle"
        }));
        var hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        hBox.add(this.__createThumbnail());
        hBox.add(this.__createExtraInfo(), {
          flex: 1
        });
        container.add(hBox);
        container.add(this.__createDescription());

        var rawMetadata = this.__createRawMetadata();

        var more = new qxapp.desktop.PanelView(this.tr("raw metadata"), rawMetadata).set({
          caretSize: 14
        });
        more.setCollapsed(true);
        more.getChildControl("title").setFont("text-12");
        container.add(more);

        this._add(container);
      },
      __createThumbnail: function __createThumbnail() {
        return new qx.ui.basic.Image(this.__metadata.thumbnail || qxapp.utils.Utils.getThumbnailFromString(this.__metadata.key)).set({
          scale: true,
          width: 300,
          height: 180
        });
      },
      __createExtraInfo: function __createExtraInfo() {
        var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8).set({
          alignY: "middle"
        }));
        container.add(this.__createTitle());
        container.add(this.__createContact());
        container.add(this.__createAuthors());

        var badges = this.__createBadges();

        if (badges) {
          container.add(badges);
        }

        return container;
      },
      __createTitle: function __createTitle() {
        var titleContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
        var title = new qx.ui.basic.Label(this.__metadata.name).set({
          font: "title-16",
          rich: true
        });
        titleContainer.add(title);
        var version = new qx.ui.basic.Label("v" + this.__metadata.version).set({
          rich: true
        });
        titleContainer.add(version);
        return titleContainer;
      },
      __createContact: function __createContact() {
        var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
        container.add(new qx.ui.basic.Label(this.tr("Contact")).set({
          font: "title-12"
        }));
        container.add(new qx.ui.basic.Label(this.__metadata.contact));
        return container;
      },
      __createAuthors: function __createAuthors() {
        var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
        container.add(new qx.ui.basic.Label(this.tr("Authors")).set({
          font: "title-12"
        }));

        for (var i in this.__metadata.authors) {
          var author = this.__metadata.authors[i];
          var authorLine = "".concat(author.name, " \xB7 ").concat(author.affiliation, " \xB7 ").concat(author.email);
          container.add(new qx.ui.basic.Label(authorLine));
        }

        return container;
      },
      __createBadges: function __createBadges() {
        if ("badges" in this.__metadata) {
          var badges = new qxapp.ui.markdown.Markdown();
          var markdown = "";

          for (var i in this.__metadata.badges) {
            var badge = this.__metadata.badges[i];
            markdown += "[![".concat(badge.name, "](").concat(badge.image, ")](").concat(badge.url, ") ");
          }

          badges.setMarkdown(markdown);
          return badges;
        }

        return null;
      },
      __createDescription: function __createDescription() {
        var description = new qxapp.ui.markdown.Markdown();
        description.setMarkdown(this.__metadata.description);
        return description;
      },
      __createRawMetadata: function __createRawMetadata() {
        var container = new qx.ui.container.Scroll();
        container.add(new qxapp.component.widget.JsonTreeWidget(this.__metadata, "serviceDescriptionSettings"));
        return container;
      }
    }
  });
  qxapp.component.metadata.ServiceInfo.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ServiceInfo.js.map?dt=1568886160565