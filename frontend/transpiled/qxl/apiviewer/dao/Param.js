function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
      "qx.lang.Array": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
       2018 Zenesis Limited, http://www.zenesis.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * John Spackman (johnspackman)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Represents a parameter or return type, taken from JSDoc meta data
   *
   * Example data:
   *
          "@param": [
            {
              "name": "@param",
              "body": "options {Map?null} Optional layout data for widget.",
              "paramName": "options",
              "description": " Optional layout data for widget.",
              "optional": true,
              "defaultValue": "null",
              "type": "Map"
            }
          ],
          "@return": [
            {
              "name": "@return",
              "body": "{Integer} The index position or <code>-1</code> when\nthe given widget is no child of this layout.",
              "type": "Integer",
              "desc": " The index position or <code>-1</code> when\nthe given widget is no child of this layout."
            }
          ]
   */
  qx.Class.define("qxl.apiviewer.dao.Param", {
    extend: qx.core.Object,
    construct: function construct(meta, method) {
      qx.core.Object.constructor.call(this);
      this._meta = meta;
      this._method = method;
      this._types = [{
        type: "var"
      }];

      if (meta.type) {
        this._types = qx.lang.Array.toNativeArray(meta.type).map(function (type) {
          if (_typeof(type) === "object") {
            return {
              type: type.type,
              arrayDimensions: type.dimensions
            };
          }

          var m = type.match(/^([^[]+)((\[\])+)?$/);

          if (m && m[2]) {
            return {
              type: m[1],
              arrayDimensions: m[2].length / 2
            };
          }

          return {
            type: type
          };
        });
      }
    },
    members: _defineProperty({
      _method: null,
      _meta: null,
      _types: null,
      _arrayDimensions: 0,
      getMethod: function getMethod() {
        return this._method;
      },
      getClass: function getClass() {
        return this._method.getClass();
      },
      getName: function getName() {
        return this._meta.paramName;
      },
      getDescription: function getDescription() {
        return this._meta.desc;
      },
      getTypes: function getTypes() {
        return this._types;
      },
      getArrayDimensions: function getArrayDimensions() {
        return this._arrayDimensions;
      },
      getDefaultValue: function getDefaultValue() {
        return this._meta.defaultValue;
      },
      isOptional: function isOptional() {
        return Boolean(this._meta.optional);
      }
    }, "getDescription", function getDescription() {
      return this._meta.description;
    })
  });
  qxl.apiviewer.dao.Param.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Param.js.map?dt=1568886186651