function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Form": {
        "construct": true,
        "require": true
      },
      "qx.locale.MTranslation": {
        "require": true
      },
      "qx.data.controller.Form": {
        "construct": true
      },
      "qx.data.marshal.Json": {},
      "qx.lang.String": {},
      "qx.lang.Type": {},
      "qx.util.format.DateFormat": {},
      "qx.data.controller.List": {},
      "qx.ui.form.DateField": {},
      "qx.ui.form.TextField": {},
      "qx.ui.form.Spinner": {},
      "qx.ui.form.PasswordField": {},
      "qx.ui.form.TextArea": {},
      "qx.ui.form.CheckBox": {},
      "qx.ui.form.SelectBox": {},
      "qx.ui.form.ComboBox": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
     Copyright: 2013 OETIKER+PARTNER AG
                2018 ITIS Foundation
     License:   MIT
     Authors:   Tobi Oetiker <tobi@oetiker.ch>
     Utf8Check: äöü
  ************************************************************************ */

  /**
   * Create a form. The argument to the form
   * widget defines the structure of the form.
   *
   * <pre class='javascript'>
   *   {
   *     key: {
   *       displayOrder: 5,
   *       label: "Widget SelectBox Test",
   *       description: "Test Input for SelectBox",
   *       defaultValue: "dog",
   *       type: "string",
   *       widget: {
   *         type: "SelectBox",
   *         structure: [{
   *           key: "dog",
   *           label: "A Dog"
   *         }, {
   *           key: "cat",
   *           label: "A Cat"
   *         }]
   *       }
   *     },
   *   }
   * </pre>
   *
   * The default widgets for data types are as follows:
   *     string: text
   *     integer: spinner
   *     bool:  checkBox
   *     number: text
   *     data:  file-upload/selection
   *
   * The following widget types are supported:
   *     selectBox: { structure: [ {key: x, label: y}, ...] },
   *     date: { }, // following unix tradition, dates are represented in epoc seconds
   *     password: {},
   *     textArea: {},
   *     hiddenText: {},
   *     checkBox: {},
   *     comboBox: {},
   *
   *
   * Populate the new form using the setData method, providing a map
   * with the required data.
   *
   */
  qx.Class.define("qxapp.component.form.Auto", {
    extend: qx.ui.form.Form,
    include: [qx.locale.MTranslation],

    /**
       * @param structure {Array} form structure
       */
    construct: function construct(content, node) {
      var _this = this;

      // node is necessary for creating links
      if (node) {
        this.setNode(node);
      } else {
        this.setNode(null);
      }

      qx.ui.form.Form.constructor.call(this);
      this.__ctrlMap = {};
      this.__ctrlLinkMap = {};
      var formCtrl = this.__formCtrl = new qx.data.controller.Form(null, this);
      this.__boxCtrl = {};
      this.__typeMap = {};

      for (var key in content) {
        this.__addField(content[key], key);
      }

      var model = this.__model = formCtrl.createModel(true);
      model.addListener("changeBubble", function (e) {
        if (!_this.__settingData) {
          _this.fireDataEvent("changeData", _this.getData());
        }
      }, this);
    },
    properties: {
      node: {
        check: "qxapp.data.model.Node",
        nullable: true
      }
    },
    events: {
      /**
       * fire when the form changes content and
       * and provide access to the data
       */
      "changeData": "qx.event.type.Data",
      "linkAdded": "qx.event.type.Data",
      "linkRemoved": "qx.event.type.Data"
    },
    members: {
      __boxCtrl: null,
      __ctrlMap: null,
      __ctrlLinkMap: null,
      __formCtrl: null,
      __model: null,
      __settingData: false,
      __typeMap: null,

      /**
       * Use normal Form validation to validate the content of the form
       *
       * @return {let} validation output
       */
      validate: function validate() {
        return this.__formCtrl.validate();
      },

      /**
       * Reset the form content
       *
       */
      reset: function reset() {
        this.__formCtrl.reset();
      },

      /**
       * get a handle to the control with the given name
       *
       * @param key {let} key of the the field
       * @return {let} control associated with the field
       */
      getControl: function getControl(key) {
        return this.__ctrlMap[key];
      },
      getControlLink: function getControlLink(key) {
        return this.__ctrlLinkMap[key];
      },

      /**
       * fetch the data for this form
       *
       * @return {let} all data from the form
       */
      getData: function getData() {
        return this.__getData(this.__model);
      },

      /**
       * load new data into the data main model
       *
       * @param data {let} map with key value pairs to apply
       * @param relax {let} ignore non existing keys
       */
      setData: function setData(data, relax) {
        this.__setData(this.__model, data, relax);
      },

      /**
       * set access level to the data main model
       *
       * @param data {let} map with key access level pairs to apply
       */
      setAccessLevel: function setAccessLevel(data) {
        this.__setAccessLevel(this.__model, data);
      },

      /**
       * set the data in a selectbox
       *
       * @param box {let} selectbox name
       * @param data {let} configuration of the box
       */
      setSelectBoxData: function setSelectBoxData(box, data) {
        var model;
        this.__settingData = true;

        if (data.length == 0) {
          model = qx.data.marshal.Json.createModel([{
            label: "",
            key: null
          }]);
        } else {
          model = qx.data.marshal.Json.createModel(data);
        }

        this.__boxCtrl[box].setModel(model);

        this.__boxCtrl[box].getTarget().resetSelection();

        this.__settingData = false;
      },

      /**
       * load new data into a model
       * if relax is set unknown properties will be ignored
       *
       * @param model {let} TODOC
       * @param data {let} TODOC
       * @param relax {let} TODOC
       */
      __setData: function __setData(model, data, relax) {
        this.__settingData = true;

        for (var key in data) {
          if (data[key] !== null && _typeof(data[key]) === "object" && data[key].nodeUuid) {
            this.addLink(key, data[key].nodeUuid, data[key].output);
            continue;
          }

          this.getControl(key).setEnabled(true);
          var upkey = qx.lang.String.firstUp(key);
          var setter = "set" + upkey;
          var value = data[key];

          if (relax && !model[setter]) {
            continue;
          }

          model[setter](value);
        }

        this.__settingData = false;
        /* only fire ONE if there was an attempt at change */

        this.fireDataEvent("changeData", this.getData());
      },

      /**
       * turn a model object into a plain data structure
       *
       * @param model {let} TODOC
       * @return {let} TODOC
       */
      __getData: function __getData(model) {
        var props = model.constructor.$$properties;
        var data = {};

        for (var key in props) {
          var getter = "get" + qx.lang.String.firstUp(key);
          data[key] = model[getter]();
        }

        return data;
      },

      /**
       * set access level to the data model
       *
       * @param model {let} TODOC
       * @param data {let} TODOC
       */
      __setAccessLevel: function __setAccessLevel(model, data) {
        this.__settingData = true;

        for (var key in data) {
          var control = this.getControl(key);

          if (control) {
            switch (data[key]) {
              case "Invisible":
                {
                  control.setEnabled(false);
                  control.setVisibility("excluded");
                  break;
                }

              case "ReadOnly":
                {
                  control.setEnabled(false);
                  control.setVisibility("visible");
                  break;
                }

              case "ReadAndWrite":
                {
                  control.setEnabled(true);
                  control.setVisibility("visible");
                  break;
                }
            }
          }
        }

        this.__settingData = false;
        /* only fire ONE if there was an attempt at change */

        this.fireDataEvent("changeData", this.getData());
      },
      __setupDateField: function __setupDateField(s) {
        this.__formCtrl.addBindingOptions(s.key, {
          // model2target
          converter: function converter(data) {
            if (/^\d+$/.test(String(data))) {
              var d = new Date();
              d.setTime(parseInt(data) * 1000);
              var d2 = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
              return d2;
            }

            if (qx.lang.Type.isDate(data)) {
              return data;
            }

            return null;
          }
        }, {
          // target2model
          converter: function converter(data) {
            if (qx.lang.Type.isDate(data)) {
              var d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0, 0));
              return Math.round(d.getTime() / 1000);
            }

            return null;
          }
        });

        if (!s.set) {
          s.set = {};
        }

        s.set.dateFormat = new qx.util.format.DateFormat(this["tr"](s.set.dateFormat ? s.set.dateFormat : "dd.MM.yyyy"));
        var dateValue = s.defaultValue;

        if (dateValue !== null) {
          if (typeof dateValue == "number") {
            s.defaultValue = new Date(dateValue * 1000);
          } else {
            s.defaultValue = new Date(dateValue);
          }
        }
      },
      __setupTextArea: function __setupTextArea(s, key, control) {
        if (s.widget.minHeight) {
          control.setMinHeight(s.widget.minHeight);
        }

        this.__setupTextField(s, key, control);
      },
      __setupTextField: function __setupTextField(s, key) {
        this.__formCtrl.addBindingOptions(key, {
          // model2target
          converter: function converter(data) {
            return String(data);
          }
        }, {
          // target2model
          converter: function converter(data) {
            return data;
          }
        });
      },
      __setupNumberField: function __setupNumberField(s, key) {
        if (!s.set) {
          s.set = {};
        }

        if (s.defaultValue) {
          s.set.value = qx.lang.Type.isNumber(s.defaultValue) ? String(s.defaultValue) : s.defaultValue;
        } else {
          s.set.value = String(0);
        }

        this.__formCtrl.addBindingOptions(key, {
          // model2target
          converter: function converter(data) {
            if (qx.lang.Type.isNumber(data)) {
              return String(data);
            }

            return data;
          }
        }, {
          // target2model
          converter: function converter(data) {
            return parseFloat(data);
          }
        });
      },
      __setupSpinner: function __setupSpinner(s, key) {
        if (!s.set) {
          s.set = {};
        }

        if (s.defaultValue) {
          s.set.value = parseInt(String(s.defaultValue));
        } else {
          s.set.value = 0;
        }

        this.__formCtrl.addBindingOptions(key, {
          // model2target
          converter: function converter(data) {
            var d = String(data);

            if (/^\d+$/.test(d)) {
              return parseInt(d);
            }

            return null;
          }
        }, {
          // target2model
          converter: function converter(data) {
            return parseInt(data);
          }
        });
      },
      __setupSelectBox: function __setupSelectBox(s, key, control) {
        var controller = this.__boxCtrl[key] = new qx.data.controller.List(null, control, "label");
        controller.setDelegate({
          bindItem: function bindItem(ctrl, item, index) {
            ctrl.bindProperty("key", "model", null, item, index);
            ctrl.bindProperty("label", "label", null, item, index);
          }
        });
        var cfg = s.widget;

        if (cfg.structure) {
          cfg.structure.forEach(function (item) {
            item.label = item.label ? this["tr"](item.label) : null;
          }, this);
        } else {
          cfg.structure = [{
            label: "",
            key: null
          }];
        }

        if (s.defaultValue) {
          s.set.value = [s.defaultValue];
        }

        var sbModel = qx.data.marshal.Json.createModel(cfg.structure);
        controller.setModel(sbModel);
      },
      __setupComboBox: function __setupComboBox(s, key, control) {
        var ctrl = this.__boxCtrl[key] = new qx.data.controller.List(null, control);
        var cfg = s.cfg;

        if (cfg.structure) {
          cfg.structure.forEach(function (item) {
            item = item ? this["tr"](item) : null;
          }, this);
        } else {
          cfg.structure = [];
        }

        var sbModel = qx.data.marshal.Json.createModel(cfg.structure);
        ctrl.setModel(sbModel);
      },
      __setupBoolField: function __setupBoolField(s, key, control) {
        if (!s.set) {
          s.set = {};
        }

        this.__formCtrl.addBindingOptions(key, {
          // model2target
          converter: function converter(data) {
            return data;
          }
        }, {
          // target2model
          converter: function converter(data) {
            return data;
          }
        });
      },
      __setupFileButton: function __setupFileButton(s, key) {
        this.__formCtrl.addBindingOptions(key, {
          // model2target
          converter: function converter(data) {
            return String(data);
          }
        }, {
          // target2model
          converter: function converter(data) {
            return data;
          }
        });
      },
      __addField: function __addField(s, key) {
        if (s.defaultValue) {
          if (!s.set) {
            s.set = {};
          }

          s.set.value = s.defaultValue;
        }

        if (!s.widget) {
          var type = s.type;

          if (type.match(/^data:/)) {
            type = "data";
          }

          s.widget = {
            type: {
              string: "Text",
              integer: "Spinner",
              number: "Number",
              "boolean": "CheckBox",
              data: "FileButton"
            }[type]
          };
        }

        var control;
        var setup;

        switch (s.widget.type) {
          case "Date":
            control = new qx.ui.form.DateField();
            setup = this.__setupDateField;
            break;

          case "Text":
            control = new qx.ui.form.TextField();
            setup = this.__setupTextField;
            break;

          case "Number":
            control = new qx.ui.form.TextField();
            setup = this.__setupNumberField;
            break;

          case "Spinner":
            control = new qx.ui.form.Spinner();
            control.set({
              maximum: 10000,
              minimum: -10000
            });
            setup = this.__setupSpinner;
            break;

          case "Password":
            control = new qx.ui.form.PasswordField();
            setup = this.__setupTextField;
            break;

          case "TextArea":
            control = new qx.ui.form.TextArea();
            setup = this.__setupTextArea;
            break;

          case "CheckBox":
            control = new qx.ui.form.CheckBox();
            setup = this.__setupBoolField;
            break;

          case "SelectBox":
            control = new qx.ui.form.SelectBox();
            setup = this.__setupSelectBox;
            break;

          case "ComboBox":
            control = new qx.ui.form.ComboBox();
            setup = this.__setupComboBox;
            break;

          case "FileButton":
            control = new qx.ui.form.TextField();
            setup = this.__setupFileButton;
            break;

          default:
            throw new Error("unknown widget type " + s.widget.type);
        }

        this.__ctrlMap[key] = control;
        var option = {}; // could use this to pass on info to the form renderer

        this.add(control, s.label ? this["tr"](s.label) : null, null, key, null, option);
        setup.call(this, s, key, control);

        if (s.set) {
          if (s.set.filter) {
            s.set.filter = RegExp(s.filter);
          }

          if (s.set.placeholder) {
            s.set.placeholder = this["tr"](s.set.placeholder);
          }

          if (s.set.label) {
            s.set.label = this["tr"](s.set.label);
          }

          control.set(s.set);
        }

        control.key = key;
        control.description = s.description;
        this.__ctrlMap[key] = control;
        var controlLink = new qx.ui.form.TextField().set({
          enabled: false
        });
        controlLink.key = key;
        this.__ctrlLinkMap[key] = controlLink;
      },
      isPortAvailable: function isPortAvailable(portId) {
        var port = this.getControl(portId);

        if (!port || !port.getEnabled() || Object.prototype.hasOwnProperty.call(port, "link")) {
          return false;
        }

        return true;
      },
      addLink: function addLink(toPortId, fromNodeId, fromPortId) {
        if (!this.isPortAvailable(toPortId)) {
          return false;
        }

        this.getControl(toPortId).setEnabled(false);
        this.getControl(toPortId).link = {
          nodeUuid: fromNodeId,
          output: fromPortId
        };
        var workbench = this.getNode().getWorkbench();
        var fromNode = workbench.getNode(fromNodeId);
        var fromNodeLabel = fromNode.getLabel();
        var port = fromNode.getOutput(fromPortId);
        var fromPortLabel = port ? port.label : null;

        if (fromNode.getKey().includes("/neuroman")) {
          // HACK: Only Neuroman should enter here
          fromPortLabel = fromPortId;
        }

        if (fromNodeLabel && fromPortLabel) {
          this.getControlLink(toPortId).setValue("Linked to " + fromNodeLabel + ": " + fromPortLabel);
        } else {
          this.getControlLink(toPortId).setValue("Linked to " + fromNodeId + ": " + fromPortId);
        }

        this.fireDataEvent("linkAdded", toPortId);
        return true;
      },
      removeLink: function removeLink(toPortId) {
        this.getControl(toPortId).setEnabled(true);

        if ("link" in this.getControl(toPortId)) {
          delete this.getControl(toPortId).link;
        }

        this.fireDataEvent("linkRemoved", toPortId);
      }
    }
  });
  qxapp.component.form.Auto.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Auto.js.map?dt=1568886160233