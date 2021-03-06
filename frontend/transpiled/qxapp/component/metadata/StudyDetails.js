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
      "qxapp.data.model.Study": {
        "construct": true
      },
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.basic.Image": {},
      "qx.ui.layout.Grid": {},
      "qx.ui.basic.Label": {},
      "qx.util.format.DateFormat": {},
      "qx.locale.Date": {},
      "qxapp.ui.markdown.Markdown": {}
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
   * Widget that displays the available information of the given study metadata.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *    const studyDetails = new qxapp.component.metadata.StudyDetails(study);
   *    this.add(studyDetails);
   * </pre>
   */
  qx.Class.define("qxapp.component.metadata.StudyDetails", {
    extend: qx.ui.core.Widget,

    /**
      * @param study {Object|qxapp.data.model.Study} Study (metadata)
      * @param maxHeight {Integer} Max Height of the thumbnail
      */
    construct: function construct(study, maxHeight) {
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.VBox(10));

      if (study instanceof qxapp.data.model.Study) {
        this.__study = study;
      } else {
        this.__study = new qxapp.data.model.Study(study);
      }

      this.__populateLayout(maxHeight);
    },
    members: {
      __study: null,
      __populateLayout: function __populateLayout(maxHeight) {
        var hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        var vBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        vBox.add(this.__createTitle());
        vBox.add(this.__createExtraInfo());
        hBox.add(vBox);
        hBox.add(this.__createThumbnail(maxHeight), {
          flex: 1
        });

        this._add(hBox);

        this._add(this.__createDescription());
      },
      __createThumbnail: function __createThumbnail(maxHeight) {
        var image = new qx.ui.basic.Image().set({
          scale: true,
          allowStretchX: true,
          allowStretchY: true,
          maxHeight: maxHeight ? parseInt(maxHeight) : 200
        });

        this.__study.bind("thumbnail", image, "source");

        this.__study.bind("thumbnail", image, "visibility", {
          converter: function converter(thumbnail) {
            if (thumbnail) {
              return "visible";
            }

            return "excluded";
          }
        });

        return image;
      },
      __createExtraInfo: function __createExtraInfo() {
        var grid = new qx.ui.layout.Grid(5, 3);
        grid.setColumnAlign(0, "right", "middle");
        grid.setColumnAlign(1, "left", "middle");
        grid.setColumnFlex(0, 1);
        grid.setColumnFlex(1, 1);
        var moreInfo = new qx.ui.container.Composite(grid).set({
          maxWidth: 220,
          alignY: "middle"
        });
        var creationDate = new qx.ui.basic.Label();
        var lastChangeDate = new qx.ui.basic.Label();
        var owner = new qx.ui.basic.Label(); // create a date format like "Oct. 19, 2018 11:31 AM"

        var dateFormat = new qx.util.format.DateFormat(qx.locale.Date.getDateFormat("medium") + " " + qx.locale.Date.getTimeFormat("short"));
        var dateOptions = {
          converter: function converter(date) {
            return dateFormat.format(date);
          }
        };

        this.__study.bind("creationDate", creationDate, "value", dateOptions);

        this.__study.bind("lastChangeDate", lastChangeDate, "value", dateOptions);

        this.__study.bind("prjOwner", owner, "value");

        moreInfo.add(new qx.ui.basic.Label(this.tr("Owner")).set({
          font: "title-12"
        }), {
          row: 0,
          column: 0
        });
        moreInfo.add(owner, {
          row: 0,
          column: 1
        });
        moreInfo.add(new qx.ui.basic.Label(this.tr("Creation date")).set({
          font: "title-12"
        }), {
          row: 1,
          column: 0
        });
        moreInfo.add(creationDate, {
          row: 1,
          column: 1
        });
        moreInfo.add(new qx.ui.basic.Label(this.tr("Last modified")).set({
          font: "title-12"
        }), {
          row: 2,
          column: 0
        });
        moreInfo.add(lastChangeDate, {
          row: 2,
          column: 1
        });
        return moreInfo;
      },
      __createTitle: function __createTitle() {
        var title = new qx.ui.basic.Label().set({
          font: "nav-bar-label",
          allowStretchX: true,
          rich: true
        });

        this.__study.bind("name", title, "value");

        return title;
      },
      __createDescription: function __createDescription() {
        var description = new qxapp.ui.markdown.Markdown();

        this.__study.bind("description", description, "markdown");

        return description;
      }
    }
  });
  qxapp.component.metadata.StudyDetails.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=StudyDetails.js.map?dt=1568886160619