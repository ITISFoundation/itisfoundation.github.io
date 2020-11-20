(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.ToggleButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.IModel": {
        "require": true
      },
      "qxapp.component.filter.IFilterable": {
        "require": true
      },
      "qx.ui.form.MModelProperty": {
        "require": true
      },
      "qxapp.component.filter.MFilterable": {
        "require": true
      },
      "qx.util.format.DateFormat": {
        "construct": true
      },
      "qx.locale.Date": {
        "construct": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.ui.basic.Label": {},
      "qxapp.utils.Utils": {},
      "qx.ui.basic.Image": {}
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
       * Tobias Oetiker (oetiker)
  
  ************************************************************************ */

  /* eslint "qx-rules/no-refs-in-members": "warn" */

  /**
   * Widget used mainly by StudyBrowser for displaying Studies
   *
   * It consists of a thumbnail and creator and last change as caption
   */
  qx.Class.define("qxapp.desktop.StudyBrowserListItem", {
    extend: qx.ui.form.ToggleButton,
    implement: [qx.ui.form.IModel, qxapp.component.filter.IFilterable],
    include: [qx.ui.form.MModelProperty, qxapp.component.filter.MFilterable],
    construct: function construct() {
      qx.ui.form.ToggleButton.constructor.call(this);
      this.set({
        width: 210
      }); // create a date format like "Oct. 19, 2018 11:31 AM"

      this._dateFormat = new qx.util.format.DateFormat(qx.locale.Date.getDateFormat("medium") + " " + qx.locale.Date.getTimeFormat("short"));
      var layout = new qx.ui.layout.VBox(5).set({
        alignY: "middle"
      });

      this._setLayout(layout);

      this.addListener("pointerover", this._onPointerOver, this);
      this.addListener("pointerout", this._onPointerOut, this);
    },
    events: {
      /** (Fired by {@link qx.ui.form.List}) */
      "action": "qx.event.type.Event"
    },
    properties: {
      appearance: {
        refine: true,
        init: "pb-listitem"
      },
      uuid: {
        check: "String",
        apply: "_applyUuid"
      },
      studyTitle: {
        check: "String",
        apply: "_applyStudyTitle",
        nullable: true
      },
      creator: {
        check: "String",
        apply: "_applyCreator",
        nullable: true
      },
      lastChangeDate: {
        check: "Date",
        apply: "_applylastChangeDate",
        nullable: true
      }
    },
    members: {
      // eslint-disable-line qx-rules/no-refs-in-members
      _dateFormat: null,
      _forwardStates: {
        focused: true,
        hovered: true,
        selected: true,
        dragover: true
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id) {
        var control;

        switch (id) {
          case "studyTitle":
            control = new qx.ui.basic.Label(this.getStudyTitle()).set({
              margin: [5, 0],
              font: "title-14",
              anonymous: true
            });
            qxapp.utils.Utils.setIdToWidget(control, "studyBrowserListItem_title");

            this._addAt(control, 0);

            break;

          case "icon":
            control = new qx.ui.basic.Image(this.getIcon()).set({
              anonymous: true,
              scale: true,
              allowStretchX: true,
              allowStretchY: true,
              maxHeight: 120
            });

            this._addAt(control, 1);

            break;

          case "creator":
            control = new qx.ui.basic.Label(this.getCreator()).set({
              rich: true,
              allowGrowY: false,
              anonymous: true
            });
            qxapp.utils.Utils.setIdToWidget(control, "studyBrowserListItem_creator");

            this._addAt(control, 2);

            break;

          case "lastChangeDate":
            control = new qx.ui.basic.Label().set({
              rich: true,
              allowGrowY: false,
              anonymous: true
            });
            qxapp.utils.Utils.setIdToWidget(control, "studyBrowserListItem_lastChangeDate");

            this._addAt(control, 3);

            break;
        }

        return control || qxapp.desktop.StudyBrowserListItem.prototype._createChildControlImpl.base.call(this, id);
      },
      // overriden
      _applyUuid: function _applyUuid(value, old) {
        qxapp.utils.Utils.setIdToWidget(this, "studyBrowserListItem_" + value);
      },
      _applyIcon: function _applyIcon(value, old) {
        var icon = this.getChildControl("icon");
        icon.set({
          source: value,
          paddingTop: value && value.match(/^@/) ? 30 : 0
        });
      },
      _applyStudyTitle: function _applyStudyTitle(value, old) {
        var label = this.getChildControl("studyTitle");
        label.setValue(value);
      },
      _applyCreator: function _applyCreator(value, old) {
        var label = this.getChildControl("creator");
        label.setValue(value);
      },
      _applylastChangeDate: function _applylastChangeDate(value, old) {
        var label = this.getChildControl("lastChangeDate");

        if (value) {
          var dateStr = this._dateFormat.format(value);

          label.setValue("Last change: <b>" + dateStr + "</b>");
        } else {
          label.resetValue();
        }
      },

      /**
       * Event handler for the pointer over event.
       */
      _onPointerOver: function _onPointerOver() {
        this.addState("hovered");
      },

      /**
       * Event handler for the pointer out event.
       */
      _onPointerOut: function _onPointerOut() {
        this.removeState("hovered");
      },

      /**
       * Event handler for filtering events.
       */
      _filter: function _filter() {
        this.exclude();
      },
      _unfilter: function _unfilter() {
        this.show();
      },
      _shouldApplyFilter: function _shouldApplyFilter(data) {
        if (data.text) {
          var checks = [this.getStudyTitle(), this.getCreator()];

          for (var i = 0; i < checks.length; i++) {
            var label = checks[i].trim().toLowerCase();

            if (label.indexOf(data.text) !== -1) {
              return false;
            }
          }

          return true;
        }

        return false;
      },
      _shouldReactToFilter: function _shouldReactToFilter(data) {
        if (data.text && data.text.length > 1) {
          return true;
        }

        return false;
      }
    },
    destruct: function destruct() {
      this._dateFormat.dispose();

      this._dateFormat = null;
      this.removeListener("pointerover", this._onPointerOver, this);
      this.removeListener("pointerout", this._onPointerOut, this);
    }
  });
  qxapp.desktop.StudyBrowserListItem.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=StudyBrowserListItem.js.map?dt=1568886163147