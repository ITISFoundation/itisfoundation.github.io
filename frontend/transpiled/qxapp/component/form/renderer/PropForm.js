(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.renderer.Single": {
        "construct": true,
        "require": true
      },
      "qx.ui.basic.Atom": {},
      "qxapp.component.form.FieldWHint": {},
      "qx.event.message.Bus": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.form.Button": {},
      "qxapp.store.Store": {}
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

  /* eslint no-underscore-dangle: ["error", { "allowAfterThis": true, "allow": ["__ctrlMap"] }] */

  /**
   * A special renderer for AutoForms which includes notes below the section header
   * widget and next to the individual form widgets.
   */
  qx.Class.define("qxapp.component.form.renderer.PropForm", {
    extend: qx.ui.form.renderer.Single,

    /**
       * create a page for the View Tab with the given title
       *
       * @param vizWidget {Widget} visualization widget to embedd
       */
    construct: function construct(form, workbench, node) {
      // workbench and node are necessary for creating links
      if (workbench) {
        this.setWorkbench(workbench);
      } else {
        this.setWorkbench(null);
      }

      if (node) {
        this.setNode(node);
      } else {
        this.setNode(null);
      }

      qx.ui.form.renderer.Single.constructor.call(this, form);

      var fl = this._getLayout(); // have plenty of space for input, not for the labels


      fl.setColumnFlex(0, 0);
      fl.setColumnAlign(0, "left", "top");
      fl.setColumnFlex(1, 1);
      fl.setColumnMinWidth(1, 130);
      this.setDroppable(true);

      this.__attachDragoverHighlighter();
    },
    events: {
      "removeLink": "qx.event.type.Data",
      "dataFieldModified": "qx.event.type.Data"
    },
    properties: {
      workbench: {
        check: "qxapp.data.model.Workbench",
        nullable: true
      },
      node: {
        check: "qxapp.data.model.Node",
        nullable: true
      }
    },
    statics: {
      getRetrievingAtom: function getRetrievingAtom() {
        return new qx.ui.basic.Atom("", "qxapp/loading.gif");
      },
      getRetrievedAtom: function getRetrievedAtom(success) {
        var icon = success ? "@FontAwesome5Solid/check/12" : "@FontAwesome5Solid/times/12";
        return new qx.ui.basic.Atom("", icon);
      }
    },
    // eslint-disable-next-line qx-rules/no-refs-in-members
    members: {
      _gridPos: {
        label: 0,
        entryField: 1,
        retrieveStatus: 2
      },
      _retrieveStatus: {
        failed: 0,
        retrieving: 1,
        succeed: 2
      },
      addItems: function addItems(items, names, title, itemOptions, headerOptions) {
        var _this = this;

        // add the header
        if (title !== null) {
          this._add(this._createHeader(title), {
            row: this._row,
            column: this._gridPos.label,
            colSpan: Object.keys(this._gridPos).length
          });

          this._row++;
        } // add the items


        var _loop = function _loop(i) {
          var item = items[i];

          var label = _this._createLabel(names[i], item);

          _this._add(label, {
            row: _this._row,
            column: _this._gridPos.label
          });

          label.setBuddy(item);
          var field = new qxapp.component.form.FieldWHint(null, item.description, item);
          field.key = item.key;

          _this._add(field, {
            row: _this._row,
            column: _this._gridPos.entryField
          });

          _this._row++;

          _this._connectVisibility(item, label); // store the names for translation


          {
            _this._names.push({
              name: names[i],
              label: label,
              item: items[i]
            });
          }

          _this.__createDropMechanism(item, item.key); // Notify focus and focus out


          var msgDataFn = function msgDataFn(nodeId, portId) {
            return _this.__arePortsCompatible(nodeId, portId, _this.getNode().getNodeId(), item.key);
          };

          item.addListener("focus", function () {
            if (_this.getNode()) {
              qx.event.message.Bus.getInstance().dispatchByName("inputFocus", msgDataFn);
            }
          }, _this);
          item.addListener("focusout", function () {
            if (_this.getNode()) {
              qx.event.message.Bus.getInstance().dispatchByName("inputFocusout", msgDataFn);
            }
          }, _this);
        };

        for (var i = 0; i < items.length; i++) {
          _loop(i);
        }
      },
      getValues: function getValues() {
        var data = this._form.getData();

        for (var portId in data) {
          var ctrl = this._form.getControl(portId);

          if (ctrl && ctrl.link) {
            if (this.getNode().getKey().includes("/neuroman")) {
              // HACK: Only Neuroman should enter here
              data[portId] = ctrl.link["output"];
            } else {
              data[portId] = ctrl.link;
            }
          } // FIXME: "null" should be a valid input


          if (data[portId] === "null") {
            data[portId] = null;
          }
        }

        var filteredData = {};

        for (var key in data) {
          if (data[key] !== null) {
            filteredData[key] = data[key];
          }
        }

        return filteredData;
      },
      __getLayoutChild: function __getLayoutChild(portId, column) {
        var row = null;

        var children = this._getChildren();

        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var layoutProps = child.getLayoutProperties();

          if (layoutProps.column === this._gridPos.label && child.getBuddy().key === portId) {
            row = layoutProps.row;
            break;
          }
        }

        if (row !== null) {
          for (var _i = 0; _i < children.length; _i++) {
            var _child = children[_i];

            var _layoutProps = _child.getLayoutProperties();

            if (_layoutProps.column === column && _layoutProps.row === row) {
              return {
                child: _child,
                idx: _i
              };
            }
          }
        }

        return null;
      },
      __getEntryFieldChild: function __getEntryFieldChild(portId) {
        return this.__getLayoutChild(portId, this._gridPos.entryField);
      },
      __getRetrieveStatusChild: function __getRetrieveStatusChild(portId) {
        return this.__getLayoutChild(portId, this._gridPos.retrieveStatus);
      },
      linkAdded: function linkAdded(portId) {
        var data = this.__getEntryFieldChild(portId);

        if (data) {
          var child = data.child;
          var idx = data.idx;
          var layoutProps = child.getLayoutProperties();

          this._remove(child);

          var hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
          hBox.add(this._form.getControlLink(portId), {
            flex: 1
          });
          var unlinkBtn = new qx.ui.form.Button(this.tr("Unlink"), "@FontAwesome5Solid/unlink/14");
          unlinkBtn.addListener("execute", function () {
            this.fireDataEvent("removeLink", portId);
          }, this);
          hBox.add(unlinkBtn);
          hBox.key = portId;

          this._addAt(hBox, idx, {
            row: layoutProps.row,
            column: this._gridPos.entryField
          });

          this.fireDataEvent("dataFieldModified", portId);
        }
      },
      linkRemoved: function linkRemoved(portId) {
        var data = this.__getEntryFieldChild(portId);

        if (data) {
          var child = data.child;
          var idx = data.idx;
          var layoutProps = child.getLayoutProperties();

          if (layoutProps.column === this._gridPos.entryField) {
            this._remove(child);

            var field = new qxapp.component.form.FieldWHint(null, this._form.getControl(portId).description, this._form.getControl(portId));

            this._addAt(field, idx, {
              row: layoutProps.row,
              column: layoutProps.column
            });

            this.fireDataEvent("dataFieldModified", portId);
          }
        }
      },
      retrievingPortData: function retrievingPortData(portId) {
        var status = this._retrieveStatus.retrieving;

        if (portId) {
          var data = this.__getEntryFieldChild(portId);

          if (data) {
            var child = data.child;
            var idx = data.idx;
            var layoutProps = child.getLayoutProperties();

            this.__setRetrievingStatus(status, portId, idx + 1, layoutProps.row);
          }
        } else {
          for (var i = this._getChildren().length; i--;) {
            var _child2 = this._getChildren()[i];

            var _layoutProps2 = _child2.getLayoutProperties();

            if (_layoutProps2.column === this._gridPos.entryField) {
              var ctrl = this._form.getControl(_child2.key);

              if (ctrl && ctrl.link) {
                this.__setRetrievingStatus(status, _child2.key, i, _layoutProps2.row);
              }
            }
          }
        }
      },
      retrievedPortData: function retrievedPortData(portId, succeed) {
        var status = succeed ? this._retrieveStatus.succeed : this._retrieveStatus.failed;

        if (portId) {
          var data = this.__getEntryFieldChild(portId);

          if (data) {
            var child = data.child;
            var idx = data.idx;
            var layoutProps = child.getLayoutProperties(); // this._remove(child);

            this.__setRetrievingStatus(status, portId, idx + 1, layoutProps.row);
          }
        } else {
          var children = this._getChildren();

          for (var i = 0; i < children.length; i++) {
            var _child3 = children[i];

            var _layoutProps3 = _child3.getLayoutProperties();

            if (_layoutProps3.column === this._gridPos.retrieveStatus) {
              // this._remove(child);
              this.__setRetrievingStatus(status, portId, i, _layoutProps3.row);
            }
          }
        }
      },
      __setRetrievingStatus: function __setRetrievingStatus(status, portId, idx, row) {
        var icon;

        switch (status) {
          case this._retrieveStatus.failed:
            icon = qxapp.component.form.renderer.PropForm.getRetrievedAtom(false);
            break;

          case this._retrieveStatus.retrieving:
            icon = qxapp.component.form.renderer.PropForm.getRetrievingAtom();
            break;

          case this._retrieveStatus.succeed:
            icon = qxapp.component.form.renderer.PropForm.getRetrievedAtom(true);
            break;
        }

        icon.key = portId; // remove first if any

        var children = this._getChildren();

        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var layoutProps = child.getLayoutProperties();

          if (layoutProps.row === row && layoutProps.column === this._gridPos.retrieveStatus) {
            this._remove(child);
          }
        }

        this._addAt(icon, idx, {
          row: row,
          column: this._gridPos.retrieveStatus
        });
      },
      __isInputData: function __isInputData(portId) {
        var port = this.getNode().getInput(portId);

        if (port) {
          return port.type.includes("data");
        }

        return false;
      },
      __arePortsCompatible: function __arePortsCompatible(node1Id, port1Id, node2Id, port2Id) {
        if (this.getWorkbench() && node1Id && node2Id) {
          var node1 = this.getWorkbench().getNode(node1Id);
          var node2 = this.getWorkbench().getNode(node2Id);

          if (node1 && node2) {
            var port1 = node1.getOutput(port1Id);
            var port2 = node2.getInput(port2Id);
            return qxapp.store.Store.getInstance().arePortsCompatible(port1, port2);
          }
        }

        return false;
      },
      __createDropMechanism: function __createDropMechanism(uiElement, portId) {
        var _this2 = this;

        if (this.getNode()) {
          uiElement.set({
            droppable: true
          });
          uiElement.nodeId = this.getNode().getNodeId();
          uiElement.portId = portId;
          uiElement.addListener("dragover", function (e) {
            if (e.supportsType("osparc-port-link")) {
              var from = e.getRelatedTarget();
              var dragNodeId = from.nodeId;
              var dragPortId = from.portId;
              var to = e.getCurrentTarget();
              var dropNodeId = to.nodeId;
              var dropPortId = to.portId;

              if (_this2.__arePortsCompatible(dragNodeId, dragPortId, dropNodeId, dropPortId)) {
                _this2.__highlightCompatibles(e.getRelatedTarget());

                e.stopPropagation();
              } else {
                e.preventDefault();
              }
            }
          }, this);
          uiElement.addListener("drop", function (e) {
            if (e.supportsType("osparc-port-link")) {
              var from = e.getRelatedTarget();
              var dragNodeId = from.nodeId;
              var dragPortId = from.portId;
              var to = e.getCurrentTarget(); // let dropNodeId = to.nodeId;

              var dropPortId = to.portId;

              _this2.getNode().addPortLink(dropPortId, dragNodeId, dragPortId);
            }
          }, this);
        }
      },
      __getCompatibleInputs: function __getCompatibleInputs(output) {
        var _this3 = this;

        return this._getChildren().filter(function (child) {
          return child.getField && _this3.__arePortsCompatible(output.nodeId, output.portId, child.getField().nodeId, child.getField().portId);
        });
      },
      __highlightCompatibles: function __highlightCompatibles(output) {
        var inputs = this.__getCompatibleInputs(output);

        for (var i in inputs) {
          var input = inputs[i].getField();
          input.setDecorator("material-textfield-focused");
        }
      },
      __unhighlightAll: function __unhighlightAll() {
        var inputs = this._getChildren().filter(function (child) {
          return child.getField;
        });

        for (var i in inputs) {
          var input = inputs[i];
          input.getField().resetDecorator();
        }
      },
      __attachDragoverHighlighter: function __attachDragoverHighlighter() {
        var _this4 = this;

        this.addListener("dragover", function (e) {
          if (e.supportsType("osparc-port-link")) {
            _this4.__highlightCompatibles(e.getRelatedTarget());

            e.preventDefault();
          }
        }, this);
        this.addListener("dragleave", function (e) {
          if (e.supportsType("osparc-port-link")) {
            _this4.__unhighlightAll();
          }
        }, this);
        this.addListener("mouseup", function (e) {
          _this4.__unhighlightAll();
        });
      }
    }
  });
  qxapp.component.form.renderer.PropForm.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=PropForm.js.map?dt=1568886160459