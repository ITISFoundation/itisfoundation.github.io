(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.Window": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.form.TextField": {},
      "qx.ui.form.Button": {},
      "qx.ui.command.Command": {}
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
   *   Window that shows a text field with the input item label
   * that can be used for renaming it
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   let itemRenamer = new qxapp.component.widget.TreeItemRenamer(selectedItem);
   *   itemRenamer.addListener("labelChanged", e => {
   *     const data = e.getData();
   *     const newLabel = data.newLabel;
   *     const nodeId = selectedItem.getNodeId();
   *     let node = this.getWorkbench().getNode(nodeId);
   *     node.setLabel(newLabel);
   *   }, this);
   *   itemRenamer.open();
   * </pre>
   */
  qx.Class.define("qxapp.component.widget.TreeItemRenamer", {
    extend: qx.ui.window.Window,
    construct: function construct(selectedItem) {
      qx.ui.window.Window.constructor.call(this, "Rename");
      var oldLabel = selectedItem.getLabel();
      var maxWidth = 350;
      var minWidth = 100;
      var labelWidth = Math.min(Math.max(parseInt(oldLabel.length * 4), minWidth), maxWidth);
      this.set({
        appearance: "window-small-cap",
        layout: new qx.ui.layout.HBox(4),
        padding: 2,
        modal: true,
        showMaximize: false,
        showMinimize: false,
        width: labelWidth
      });

      this.__populateNodeLabelEditor(selectedItem, labelWidth);
    },
    events: {
      "labelChanged": "qx.event.type.Data"
    },
    members: {
      __populateNodeLabelEditor: function __populateNodeLabelEditor(selectedItem, labelWidth) {
        var _this = this;

        var oldLabel = selectedItem.getLabel(); // Create a text field in which to edit the data

        var labelEditor = new qx.ui.form.TextField(oldLabel).set({
          allowGrowX: true,
          minWidth: labelWidth
        });
        this.add(labelEditor, {
          flex: 1
        });
        this.addListener("appear", function (e) {
          labelEditor.focus();
          labelEditor.setTextSelection(0, labelEditor.getValue().length);
        }, this); // Create the "Save" button to close the cell editor

        var save = new qx.ui.form.Button("Save");
        save.addListener("execute", function (e) {
          var newLabel = labelEditor.getValue();
          selectedItem.setLabel(newLabel);
          var data = {
            newLabel: newLabel
          };

          _this.fireDataEvent("labelChanged", data);

          _this.close();
        }, this);
        this.add(save); // Let user press Enter from the cell editor text field to finish.

        var command = new qx.ui.command.Command("Enter");
        command.addListener("execute", function (e) {
          save.execute();
          command.dispose();
          command = null;
        }); // Let user press Enter from the cell editor text field to finish.

        var commandEsc = new qx.ui.command.Command("Esc");
        commandEsc.addListener("execute", function (e) {
          _this.close();

          commandEsc.dispose();
          commandEsc = null;
        });
      }
    }
  });
  qxapp.component.widget.TreeItemRenamer.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=TreeItemRenamer.js.map?dt=1568886161466