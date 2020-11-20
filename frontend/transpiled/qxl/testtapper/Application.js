function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.application.Standalone": {
        "require": true
      },
      "qx.log.Logger": {},
      "qx.bom.History": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.VBox": {},
      "qx.ui.basic.Label": {},
      "qxl.logpane.LogPane": {},
      "qx.Promise": {},
      "qx.Bootstrap": {},
      "qx.dev.unit.TestLoaderBasic": {},
      "qx.dev.unit.TestResult": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2018 Oetiker+Partner AG
  
     License: MIT
  
     Authors: Tobias Oetiker
  
  ************************************************************************ */

  /**
   * Test Runner
   *
   * @asset(qxl/testtapper/run.js)
   */
  qx.Class.define("qxl.testtapper.Application", {
    extend: qx.application.Standalone,
    members: {
      _cnt: null,
      _failed: null,
      log: function log(text) {
        console.log(text);
        qx.log.Logger.debug(text);
      },
      info: function info(text) {
        console.log(text);
        qx.log.Logger.info(text);
      },
      error: function error(text) {
        console.log(text);
        qx.log.Logger.error(text);
      },
      main: function main() {
        var _this = this;

        qxl.testtapper.Application.prototype.main.base.call(this);
        this._cnt = 0;
        this._failed = {}; // eslint-disable-next-line no-undef

        var cfg = {};
        qx.bom.History.getInstance().getState().split(';').forEach(function (item) {
          var _item$split = item.split('='),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];

          cfg[key] = value;
        });
        var main_container = new qx.ui.container.Composite();
        main_container.setLayout(new qx.ui.layout.VBox());
        main_container.add(new qx.ui.basic.Label("\n                <h1>TestTAPper - the Qooxdoo Testrunner is at work</h1>\n                ").set({
          rich: true
        })); //            qx.log.appender.Native;

        var logger = new qxl.logpane.LogPane();
        logger.setShowToolBar(false);
        logger.fetch();
        main_container.add(logger, {
          flex: 1
        });
        main_container.setHeight(640);
        main_container.setWidth(1024);
        this.getRoot().add(main_container);
        var matcher = new RegExp("\\.test\\." + (cfg.module || ''));

        if (cfg.module) {
          this.log("# running only tests that match " + cfg.module);
        }

        var clazzes = Object.keys(qx.Class.$$registry).filter(function (clazz) {
          return clazz.match(matcher) && qx.Class.$$registry[clazz].$$classtype === undefined;
        }).sort();
        var pChain = new qx.Promise(function (resolve, reject) {
          return resolve(true);
        });
        clazzes.forEach(function (clazz) {
          pChain = pChain.then(function () {
            return _this.runAll(qx.Class.$$registry[clazz]).then(function () {
              _this.info("# done testing ".concat(clazz, "."));
            });
          });
        });
        return pChain.then(function () {
          _this.log("1..".concat(_this._cnt));

          main_container.add(new qx.ui.basic.Label("\n                    <h1>TestTAPper - is Done</h1>\n                    ").set({
            rich: true
          }));
        });
      },
      runAll: function runAll(clazz) {
        var _this2 = this;

        var that = this;
        this.info("# start testing ".concat(clazz, "."));
        var methodNames = Object.keys(clazz.prototype).filter(function (name) {
          return name.match(/^test/) && qx.Bootstrap.isFunctionOrAsyncFunction(clazz.prototype[name]);
        }).sort();
        return new qx.Promise(function (resolve) {
          var pos = clazz.classname.lastIndexOf(".");
          var pkgname = clazz.classname.substring(0, pos);
          var loader = new qx.dev.unit.TestLoaderBasic(pkgname);
          var testResult = new qx.dev.unit.TestResult();
          var methodNameIndex = -1;

          var next = function next() {
            methodNameIndex++;

            if (methodNameIndex < methodNames.length) {
              loader.runTests(testResult, clazz.classname, methodNames[methodNameIndex]);
            } else {
              resolve();
            }
          };

          var showExceptions = function showExceptions(arr) {
            arr.forEach(function (item) {
              if (item.test.getFullName) {
                var test = item.test.getFullName();
                that._failed[test] = true;
                that._cnt++;
                var message = String(item.exception);

                if (item.exception) {
                  if (item.exception.message) {
                    message = item.exception.message;

                    _this2.info("not ok ".concat(that._cnt, " - ").concat(test, " - ").concat(message));
                  } else {
                    _this2.error('# ' + item.exception);
                  }
                }
              } else {
                _this2.error('Unexpected Error - ', item);
              }
            });
            setTimeout(next, 0);
          };

          loader.getSuite().add(clazz);
          testResult.addListener("startTest", function (evt) {
            _this2.info('# start ' + evt.getData().getFullName());
          });
          testResult.addListener("wait", function (evt) {
            _this2.info('# wait ' + evt.getData().getFullName());
          });
          testResult.addListener("endMeasurement", function (evt) {
            _this2.info('# endMeasurement ' + evt.getData()[0].test.getFullName());
          });
          testResult.addListener("endTest", function (evt) {
            var test = evt.getData().getFullName();

            if (!that._failed[test]) {
              that._cnt++;

              _this2.info("ok ".concat(that._cnt, " - ") + test);
            }

            setTimeout(next, 0);
          });
          testResult.addListener("failure", function (evt) {
            return showExceptions(evt.getData());
          });
          testResult.addListener("error", function (evt) {
            return showExceptions(evt.getData());
          });
          testResult.addListener("skip", function (evt) {
            that._cnt++;
            var test = evt.getData()[0].test.getFullName();
            that._failed[test] = true;

            _this2.info("ok ".concat(that._cnt, " - # SKIP ").concat(test));
          });
          next();
        });
      }
    }
  });
  qxl.testtapper.Application.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Application.js.map?dt=1568886166988