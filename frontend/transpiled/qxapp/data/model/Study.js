(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qxapp.auth.Data": {
        "construct": true
      },
      "qxapp.data.model.Workbench": {
        "construct": true
      },
      "qxapp.utils.Utils": {
        "usage": "dynamic",
        "require": true
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
   * Class that stores Study data. It is also able to serialize itself.
   *
   *                                    -> {EDGES}
   * STUDY -> METADATA + WORKBENCH ->|
   *                                    -> {LINKS}
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let study = new qxapp.data.model.Study(studyData);
   *   let prjEditor = new qxapp.desktop.StudyEditor(study);
   * </pre>
   */
  qx.Class.define("qxapp.data.model.Study", {
    extend: qx.core.Object,

    /**
      * @param studyData {Object} Object containing the serialized Project Data
      * @param initWorkbench {Boolean} True to initialize workbench nodes. Default false
      */
    construct: function construct(studyData) {
      var initWorkbench = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      qx.core.Object.constructor.call(this);
      this.set({
        uuid: studyData.uuid === undefined ? this.getUuid() : studyData.uuid,
        name: studyData.name === undefined ? this.getName() : studyData.name,
        description: studyData.description === undefined ? this.getDescription() : studyData.description,
        thumbnail: studyData.thumbnail === undefined ? this.getThumbnail() : studyData.thumbnail,
        prjOwner: studyData.prjOwner === undefined ? qxapp.auth.Data.getInstance().getUserName() : studyData.prjOwner,
        creationDate: studyData.creationDate === undefined ? this.getCreationDate() : new Date(studyData.creationDate),
        lastChangeDate: studyData.lastChangeDate === undefined ? this.getLastChangeDate() : new Date(studyData.lastChangeDate)
      });
      var wbData = studyData.workbench === undefined ? {} : studyData.workbench;
      this.setWorkbench(new qxapp.data.model.Workbench(this, wbData));

      if (initWorkbench) {
        this.getWorkbench().initWorkbench();
      }
    },
    properties: {
      uuid: {
        check: "String",
        nullable: false,
        init: qxapp.utils.Utils.uuidv4()
      },
      name: {
        check: "String",
        nullable: false,
        init: "New Study",
        event: "changeName",
        apply: "__applyName"
      },
      description: {
        check: "String",
        nullable: false,
        event: "changeDescription",
        init: ""
      },
      thumbnail: {
        check: "String",
        nullable: true,
        event: "changeThumbnail",
        init: ""
      },
      prjOwner: {
        check: "String",
        nullable: false,
        event: "changePrjOwner",
        init: ""
      },
      creationDate: {
        check: "Date",
        nullable: false,
        event: "changeCreationDate",
        init: new Date()
      },
      lastChangeDate: {
        check: "Date",
        nullable: false,
        event: "changeLastChangeDate",
        init: new Date()
      },
      workbench: {
        check: "qxapp.data.model.Workbench",
        nullable: false
      }
    },
    statics: {
      createMinimumStudyObject: function createMinimumStudyObject() {
        // TODO: Check if this can be automatically generated from schema
        return {
          uuid: "",
          name: "",
          description: "",
          thumbnail: "",
          prjOwner: "",
          creationDate: new Date(),
          lastChangeDate: new Date(),
          workbench: {}
        };
      }
    },
    members: {
      __applyName: function __applyName(newName) {
        if (this.isPropertyInitialized("workbench")) {
          this.getWorkbench().setStudyName(newName);
        }
      },
      closeStudy: function closeStudy() {
        var nodes = this.getWorkbench().getNodes(true);

        for (var _i = 0, _Object$values = Object.values(nodes); _i < _Object$values.length; _i++) {
          var node = _Object$values[_i];
          node.stopInteractiveService();
        }
      },
      serializeStudy: function serializeStudy() {
        var jsonObject = {};
        var properties = this.constructor.$$properties;

        for (var key in properties) {
          var value = key === "workbench" ? this.getWorkbench().serializeWorkbench() : this.get(key);

          if (value !== null) {
            // only put the value in the payload if there is a value
            jsonObject[key] = value;
          }
        }

        return jsonObject;
      }
    }
  });
  qxapp.data.model.Study.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Study.js.map?dt=1568886162453