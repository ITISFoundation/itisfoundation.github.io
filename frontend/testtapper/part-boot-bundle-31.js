(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.dev.unit.TestSuite": {},
      "qx.dev.unit.JsUnitTestResult": {},
      "qx.dev.unit.TestResult": {},
      "qx.lang.Json": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * This mixin contains the methods needed to implement a loader that will
   * create a suite of unit tests from a given namespace and run it directly or
   * provide the necessary information to a more advanced runner application
   */
  qx.Mixin.define("qx.dev.unit.MTestLoader", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The test suite */
      suite: {
        check: "qx.dev.unit.TestSuite",
        nullable: true,
        init: null
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    members: {
      /**
       * Parses the url parameters and tries to find the classes to test.
       * The pattern is like <code>index.html?testclass=qx.test</code>
       *
       * @return {String} the class/namespace to test
       */
      _getClassNameFromUrl: function _getClassNameFromUrl() {
        var params = window.location.search;
        var className = params.match(/[\?&]testclass=([A-Za-z0-9_\.]+)/);

        if (className) {
          className = className[1];
        } else {
          className = "__unknown_class__";
        }

        return className;
      },

      /**
       * Sets the top level namespace of the test cases to test. All classes
       * below this namespace extending {@link TestCase} will be tested.
       *
       * @param namespace {Object} Namespace to add
       */
      setTestNamespace: function setTestNamespace(namespace) {
        var suite = new qx.dev.unit.TestSuite();
        suite.add(namespace);
        this.setSuite(suite);
      },

      /**
       * Run all tests and export the results to JSUnit
       */
      runJsUnit: function runJsUnit() {
        var testResult = new qx.dev.unit.JsUnitTestResult();
        this.getSuite().run(testResult);
        testResult.exportToJsUnit();
      },

      /**
       * Run tests as standalone application
       */
      runStandAlone: function runStandAlone() {
        var testResult = new qx.dev.unit.TestResult();
        testResult.addListener("failure", function (e) {
          var ex = e.getData()[0].exception;
          var test = e.getData()[0].test;
          this.error("Test '" + test.getFullName() + "' failed: " + ex.message + " - " + ex.getComment());

          if (ex.getStackTrace) {
            this.error("Stack trace: " + ex.getStackTrace().join("\n"));
          }
        }, this);
        testResult.addListener("error", function (e) {
          var ex = e.getData()[0].exception;
          var test = e.getData()[0].test;
          this.error("The test '" + test.getFullName() + "' had an error: " + ex, ex);
        }, this);
        this.getSuite().run(testResult);
      },

      /**
       * Get a list of test descriptions
       *
       * @return {String} A description of all tests.
       */
      getTestDescriptions: function getTestDescriptions() {
        var desc = [];
        var classes = this.getSuite().getTestClasses();

        for (var i = 0; i < classes.length; i++) {
          var cls = classes[i];
          var clsDesc = {};
          clsDesc.classname = cls.getName();
          clsDesc.tests = [];
          var methods = cls.getTestMethods();

          for (var j = 0; j < methods.length; j++) {
            clsDesc.tests.push(methods[j].getName());
          }

          desc.push(clsDesc);
        }

        return qx.lang.Json.stringify(desc);
      },

      /**
       * Runs exactly one test from the test suite
       *
       * @param testResult {qx.dev.unit.TestResult} the result logger
       * @param className {String} Name of the test class
       * @param methodName {String} Name of the test method
       */
      runTests: function runTests(testResult, className, methodName) {
        var classes = this.getSuite().getTestClasses();

        for (var i = 0; i < classes.length; i++) {
          if (className == classes[i].getName()) {
            var methods = classes[i].getTestMethods();

            for (var j = 0; j < methods.length; j++) {
              if (methodName && methods[j].getName() != methodName) {
                continue;
              }

              methods[j].run(testResult);
            }

            return;
          }
        }
      },

      /**
       * Runs all tests inside of the given namespace
       *
       * @param testResult {qx.dev.unit.TestResult} the result logger
       * @param namespaceName {String} Namespace of the tests to run
       */
      runTestsFromNamespace: function runTestsFromNamespace(testResult, namespaceName) {
        var classes = this.getSuite().getTestClasses();

        for (var i = 0; i < classes.length; i++) {
          if (classes[i].getName().indexOf(namespaceName) == 0) {
            classes[i].run(testResult);
          }
        }
      }
    }
  });
  qx.dev.unit.MTestLoader.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.dev.unit.MTestLoader": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2010 1&1 Internet AG, Germany, http://www.1and1.org
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * Test loader for server-side/"headless" environments
   */
  qx.Class.define("qx.dev.unit.TestLoaderBasic", {
    extend: qx.core.Object,
    include: [qx.dev.unit.MTestLoader],

    /**
     *
     * @param nameSpace {String} Test namespace, e.g. myapplication.test.*
     */
    construct: function construct(nameSpace) {
      if (nameSpace) {
        this.setTestNamespace(nameSpace);
      }
    }
  });
  qx.dev.unit.TestLoaderBasic.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.type.BaseError": {},
      "qx.dev.unit.AsyncWrapper": {},
      "qx.core.AssertionError": {},
      "qx.event.Timer": {},
      "qx.dev.unit.MeasurementResult": {},
      "qx.event.Registration": {},
      "qx.lang.String": {},
      "qx.dev.Debug": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * The test result class runs the test functions and fires events depending on
   * the result of the test run.
   */
  qx.Class.define("qx.dev.unit.TestResult", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired before the test is started
       *
       * Event data: The test {@link qx.dev.unit.TestFunction}
       */
      startTest: "qx.event.type.Data",

      /** Fired after the test has finished
       *
       * Event data: The test {@link qx.dev.unit.TestFunction}
       */
      endTest: "qx.event.type.Data",

      /**
       * Fired if the test raised an {@link qx.core.AssertionError}
       *
       * Event data: The test {@link qx.dev.unit.TestFunction}
       */
      error: "qx.event.type.Data",

      /**
       * Fired if the test failed with a different exception
       *
       * Event data: The test {@link qx.dev.unit.TestFunction}
       */
      failure: "qx.event.type.Data",

      /**
       * Fired if an asynchronous test sets a timeout
       *
       * Event data: The test {@link qx.dev.unit.TestFunction}
       */
      wait: "qx.event.type.Data",

      /**
       * Fired if the test was skipped, e.g. because a requirement was not met.
       *
       * Event data: The test {@link qx.dev.unit.TestFunction}
       */
      skip: "qx.event.type.Data",

      /**
       * Fired if a performance test returned results.
       *
       * Event data: The test {@link qx.dev.unit.TestFunction}
       */
      endMeasurement: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Run a test function using a given test result
       *
       * @param testResult {qx.dev.unit.TestResult} The test result to use to run the test
       * @param test {qx.dev.unit.TestSuite|qx.dev.unit.TestFunction} The test
       * @param testFunction {var} The test function
       */
      run: function run(testResult, test, testFunction) {
        testResult.run(test, testFunction);
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _timeout: null,

      /**
       * Run the test
       *
       * @param test {qx.dev.unit.TestSuite|qx.dev.unit.TestFunction} The test
       * @param testFunction {Function} The test function
       * @param self {Object?} The context in which to run the test function
       * @param resume {Boolean?} Resume a currently waiting test
       *
       * @return {var} The return value of the test function
       */
      run: function run(test, testFunction, self, resume) {
        if (!this._timeout) {
          this._timeout = {};
        }

        var testClass = test.getTestClass();

        if (!testClass.hasListener("assertionFailed")) {
          testClass.addListener("assertionFailed", function (ev) {
            var error = [{
              exception: ev.getData(),
              test: test
            }];
            this.fireDataEvent("failure", error);
          }, this);
        }

        if (resume && !this._timeout[test.getFullName()]) {
          this._timeout[test.getFullName()] = "failed";
          var qxEx = new qx.type.BaseError("Error in asynchronous test", "resume() called before wait()");

          this._createError("failure", [qxEx], test);

          this.fireDataEvent("endTest", test);
          return undefined;
        }

        this.fireDataEvent("startTest", test);

        if (this._timeout[test.getFullName()]) {
          if (this._timeout[test.getFullName()] !== "failed") {
            this._timeout[test.getFullName()].stop();

            this._timeout[test.getFullName()].dispose();
          }

          delete this._timeout[test.getFullName()];
        } else {
          try {
            test.setUp();
          } catch (ex) {
            if (ex instanceof qx.dev.unit.AsyncWrapper) {
              if (this._timeout[test.getFullName()]) {
                // Do nothing if there's already a timeout for this test
                return;
              }

              if (ex.getDelay()) {
                var that = this;

                var defaultTimeoutFunction = function defaultTimeoutFunction() {
                  throw new qx.core.AssertionError("Asynchronous Test Error in setUp", "Timeout reached before resume() was called.");
                };

                var timeoutFunc = ex.getDeferredFunction() ? ex.getDeferredFunction() : defaultTimeoutFunction;
                var context = ex.getContext() ? ex.getContext() : window;
                this._timeout[test.getFullName()] = qx.event.Timer.once(function () {
                  this.run(test, timeoutFunc, context);
                }, that, ex.getDelay());
                this.fireDataEvent("wait", test);
              }

              return undefined;
            } else {
              try {
                this.tearDown(test);
              } catch (except) {
                /* Any exceptions here are likely caused by setUp having failed
                 previously, so we'll ignore them. */
              }

              if (ex.classname == "qx.dev.unit.RequirementError") {
                this._createError("skip", [ex], test);

                this.fireDataEvent("endTest", test);
              } else {
                if (ex instanceof qx.type.BaseError && ex.message == qx.type.BaseError.DEFAULTMESSAGE) {
                  ex.message = "setUp failed";
                } else {
                  ex.message = "setUp failed: " + ex.message;
                }

                this._createError("error", [ex], test);

                this.fireDataEvent("endTest", test);
              }

              return undefined;
            }
          }
        }

        var returnValue;

        try {
          returnValue = testFunction.call(self || window);
        } catch (ex) {
          var error = true;

          if (ex instanceof qx.dev.unit.AsyncWrapper) {
            if (this._timeout[test.getFullName()]) {
              // Do nothing if there's already a timeout for this test
              return;
            }

            if (ex.getDelay()) {
              var that = this;

              var defaultTimeoutFunction = function defaultTimeoutFunction() {
                throw new qx.core.AssertionError("Asynchronous Test Error", "Timeout reached before resume() was called.");
              };

              var timeoutFunc = ex.getDeferredFunction() ? ex.getDeferredFunction() : defaultTimeoutFunction;
              var context = ex.getContext() ? ex.getContext() : window;
              this._timeout[test.getFullName()] = qx.event.Timer.once(function () {
                this.run(test, timeoutFunc, context);
              }, that, ex.getDelay());
              this.fireDataEvent("wait", test);
            }
          } else if (ex instanceof qx.dev.unit.MeasurementResult) {
            error = false;

            this._createError("endMeasurement", [ex], test);
          } else {
            try {
              this.tearDown(test);
            } catch (except) {}

            if (ex.classname == "qx.core.AssertionError") {
              this._createError("failure", [ex], test);

              this.fireDataEvent("endTest", test);
            } else if (ex.classname == "qx.dev.unit.RequirementError") {
              this._createError("skip", [ex], test);

              this.fireDataEvent("endTest", test);
            } else {
              this._createError("error", [ex], test);

              this.fireDataEvent("endTest", test);
            }
          }
        }

        if (!error) {
          try {
            this.tearDown(test);
            this.fireDataEvent("endTest", test);
          } catch (ex) {
            if (ex instanceof qx.type.BaseError && ex.message == qx.type.BaseError.DEFAULTMESSAGE) {
              ex.message = "tearDown failed";
            } else {
              ex.message = "tearDown failed: " + ex.message;
            }

            this._createError("error", [ex], test);

            this.fireDataEvent("endTest", test);
          }
        }
        /*
        if (!this._timeout[test.getFullName()]) {
          this.__removeListeners(test.getTestClass()[test.getName()]);
        }
        */


        return returnValue;
      },

      /**
       * Fire an error event
       *
       * @param eventName {String} Name of the event
       * @param exceptions {Error[]} The exception(s), which caused the test to fail
       * @param test {qx.dev.unit.TestSuite|qx.dev.unit.TestFunction} The test
       */
      _createError: function _createError(eventName, exceptions, test) {
        var errors = [];

        for (var i = 0, l = exceptions.length; i < l; i++) {
          // WebKit and Opera
          errors.push({
            exception: exceptions[i],
            test: test
          });
        }

        this.fireDataEvent(eventName, errors);
      },

      /**
       * Wraps the AUT's qx.event.Registration.addListener function so that it
       * stores references to all added listeners in an array attached to the
       * current test function. This is done so that any listeners left over after
       * test execution can be removed to make sure they don't influence other
       * tests.
       *
       * @param testFunction {qx.dev.unit.TestFunction} The current test
       */
      __wrapAddListener: function __wrapAddListener(testFunction) {
        testFunction._addedListeners = [];

        if (!qx.event.Registration.addListenerOriginal) {
          qx.event.Registration.addListenerOriginal = qx.event.Registration.addListener;

          qx.event.Registration.addListener = function (target, type, listener, self, capture) {
            var listenerId = qx.event.Registration.addListenerOriginal(target, type, listener, self, capture);
            var store = true;

            if (target.classname && target.classname.indexOf("testrunner.unit") == 0 || self && self.classname && self.classname.indexOf("testrunner.unit") == 0) {
              store = false;
            }

            if (store) {
              testFunction._addedListeners.push([target, listenerId]);
            }

            return listenerId;
          };
        }
      },

      /**
       * Removes any listeners left over after a test's run.
       *
       * @param testFunction {qx.dev.unit.TestFunction} The current test
       */
      __removeListeners: function __removeListeners(testFunction) {
        // remove listeners added during test execution
        if (testFunction._addedListeners) {
          var listeners = testFunction._addedListeners;

          for (var i = 0, l = listeners.length; i < l; i++) {
            var target = listeners[i][0];
            var id = listeners[i][1];

            try {
              qx.event.Registration.removeListenerById(target, id);
            } catch (ex) {}
          }
        }
      },

      /**
       * Calls the generic tearDown method on the test class, then the specific
       * tearDown for the test, if one is defined.
       *
       * @param test {Object} The test object (first argument of {@link #run})
       */
      tearDown: function tearDown(test) {
        test.tearDown();
        var testClass = test.getTestClass();
        var specificTearDown = "tearDown" + qx.lang.String.firstUp(test.getName());

        if (testClass[specificTearDown]) {
          testClass[specificTearDown]();
        }

        testClass.doAutoDispose();

        if (false && qx.dev.Debug.disposeProfilingActive) {
          var testName = test.getFullName();
          var undisposed = qx.dev.Debug.stopDisposeProfiling();

          for (var i = 0; i < undisposed.length; i++) {
            var trace;

            if (undisposed[i].stackTrace) {
              trace = undisposed[i].stackTrace.join("\n");
            }

            window.top.qx.log.Logger.warn("Undisposed object in " + testName + ": " + undisposed[i].object.classname + "[" + undisposed[i].object.toHashCode() + "]" + "\n" + trace);
          }
        }
      }
    },
    destruct: function destruct() {
      this._timeout = null;
    }
  });
  qx.dev.unit.TestResult.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.History": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Type": {},
      "qx.bom.Iframe": {},
      "qx.util.ResourceManager": {},
      "qx.event.Timer": {},
      "qx.event.Idle": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * History manager implementation for IE greater 7. IE reloads iframe
   * content on history actions even just hash value changed. This
   * implementation forwards history states (hashes) to a helper iframe.
   *
   * This class must be disposed of after use
   *
   * @internal
   */
  qx.Class.define("qx.bom.HashHistory", {
    extend: qx.bom.History,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.bom.History.constructor.call(this);
      this._baseUrl = null;

      this.__initIframe();
    },
    members: {
      __checkOnHashChange: null,
      __iframe: null,
      __iframeReady: false,
      //overridden
      addToHistory: function addToHistory(state, newTitle) {
        if (!qx.lang.Type.isString(state)) {
          state = state + "";
        }

        if (qx.lang.Type.isString(newTitle)) {
          this.setTitle(newTitle);
          this._titles[state] = newTitle;
        }

        if (this.getState() !== state) {
          this._writeState(state);
        }
      },

      /**
       * Initializes the iframe
       *
       */
      __initIframe: function __initIframe() {
        this.__iframe = this.__createIframe();
        document.body.appendChild(this.__iframe);

        this.__waitForIFrame(function () {
          this._baseUrl = this.__iframe.contentWindow.document.location.href;

          this.__attachListeners();
        }, this);
      },

      /**
       * IMPORTANT NOTE FOR IE:
       * Setting the source before adding the iframe to the document.
       * Otherwise IE will bring up a "Unsecure items ..." warning in SSL mode
       *
       * @return {Element}
       */
      __createIframe: function __createIframe() {
        var iframe = qx.bom.Iframe.create({
          src: qx.util.ResourceManager.getInstance().toUri("qx/static/blank.html") + "#"
        });
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";
        return iframe;
      },

      /**
       * Waits for the IFrame being loaded. Once the IFrame is loaded
       * the callback is called with the provided context.
       *
       * @param callback {Function} This function will be called once the iframe is loaded
       * @param context {Object?window} The context for the callback.
       * @param retry {Integer} number of tries to initialize the iframe
       */
      __waitForIFrame: function __waitForIFrame(callback, context, retry) {
        if (typeof retry === "undefined") {
          retry = 0;
        }

        if (!this.__iframe.contentWindow || !this.__iframe.contentWindow.document) {
          if (retry > 20) {
            throw new Error("can't initialize iframe");
          }

          qx.event.Timer.once(function () {
            this.__waitForIFrame(callback, context, ++retry);
          }, this, 10);
          return;
        }

        this.__iframeReady = true;
        callback.call(context || window);
      },

      /**
       * Attach hash change listeners
       */
      __attachListeners: function __attachListeners() {
        qx.event.Idle.getInstance().addListener("interval", this.__onHashChange, this);
      },

      /**
       * Remove hash change listeners
       */
      __detatchListeners: function __detatchListeners() {
        qx.event.Idle.getInstance().removeListener("interval", this.__onHashChange, this);
      },

      /**
       * hash change event handler
       */
      __onHashChange: function __onHashChange() {
        var currentState = this._readState();

        if (qx.lang.Type.isString(currentState) && currentState != this.getState()) {
          this._onHistoryLoad(currentState);
        }
      },

      /**
       * Browser dependent function to read the current state of the history
       *
       * @return {String} current state of the browser history
       */
      _readState: function _readState() {
        var hash = !this._getHash() ? "" : this._getHash().substr(1);
        return this._decode(hash);
      },

      /**
       * Returns the fragment identifier of the top window URL. For gecko browsers we
       * have to use a regular expression to avoid encoding problems.
       *
       * @return {String|null} the fragment identifier or <code>null</code> if the
       * iframe isn't ready yet
       */
      _getHash: function _getHash() {
        if (!this.__iframeReady) {
          return null;
        }

        return this.__iframe.contentWindow.document.location.hash;
      },

      /**
       * Save a state into the browser history.
       *
       * @param state {String} state to save
       */
      _writeState: function _writeState(state) {
        this._setHash(this._encode(state));
      },

      /**
       * Sets the fragment identifier of the window URL
       *
       * @param value {String} the fragment identifier
       */
      _setHash: function _setHash(value) {
        if (!this.__iframe || !this._baseUrl) {
          return;
        }

        var hash = !this.__iframe.contentWindow.document.location.hash ? "" : this.__iframe.contentWindow.document.location.hash.substr(1);

        if (value != hash) {
          this.__iframe.contentWindow.document.location.hash = value;
        }
      }
    },
    destruct: function destruct() {
      this.__detatchListeners();

      this.__iframe = null;
    }
  });
  qx.bom.HashHistory.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.History": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Type": {},
      "qx.event.Timer": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.event.Idle": {},
      "qx.bom.Iframe": {},
      "qx.util.ResourceManager": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.version": {
          "className": "qx.bom.client.Browser"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * Implements an iFrame based history manager for IE 6/7/8.
   *
   * Creates a hidden iFrame and uses document.write to store entries in the
   * history browser's stack.
   *
   * This class must be disposed of after use
   *
   * @internal
   */
  qx.Class.define("qx.bom.IframeHistory", {
    extend: qx.bom.History,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.bom.History.constructor.call(this);

      this.__initTimer();
    },
    members: {
      __iframe: null,
      __iframeReady: false,
      __writeStateTimner: null,
      __dontApplyState: null,
      __locationState: null,
      // overridden
      _setInitialState: function _setInitialState() {
        qx.bom.IframeHistory.prototype._setInitialState.base.call(this);

        this.__locationState = this._getHash();
      },
      //overridden
      _setHash: function _setHash(value) {
        qx.bom.IframeHistory.prototype._setHash.base.call(this, value);

        this.__locationState = this._encode(value);
      },
      //overridden
      addToHistory: function addToHistory(state, newTitle) {
        if (!qx.lang.Type.isString(state)) {
          state = state + "";
        }

        if (qx.lang.Type.isString(newTitle)) {
          this.setTitle(newTitle);
          this._titles[state] = newTitle;
        }

        if (this.getState() !== state) {
          this.setState(state);
        }

        this.fireDataEvent("request", state);
      },
      //overridden
      _onHistoryLoad: function _onHistoryLoad(state) {
        this._setState(state);

        this.fireDataEvent("request", state);

        if (this._titles[state] != null) {
          this.setTitle(this._titles[state]);
        }
      },

      /**
       * Helper function to set state property. This will only be called
       * by _onHistoryLoad. It determines, that no apply of state will be called.
       * @param state {String} State loaded from history
       */
      _setState: function _setState(state) {
        this.__dontApplyState = true;
        this.setState(state);
        this.__dontApplyState = false;
      },
      //overridden
      _applyState: function _applyState(value, old) {
        if (this.__dontApplyState) {
          return;
        }

        this._writeState(value);
      },

      /**
       * Get state from the iframe
       *
       * @return {String} current state of the browser history
       */
      _readState: function _readState() {
        if (!this.__iframeReady) {
          return this._decode(this._getHash());
        }

        var doc = this.__iframe.contentWindow.document;
        var elem = doc.getElementById("state");
        return elem ? this._decode(elem.innerText) : "";
      },

      /**
       * Store state to the iframe
       *
       * @param state {String} state to save
       */
      _writeState: function _writeState(state) {
        if (!this.__iframeReady) {
          this.__clearWriteSateTimer();

          this.__writeStateTimner = qx.event.Timer.once(function () {
            this._writeState(state);
          }, this, 50);
          return;
        }

        this.__clearWriteSateTimer();

        var state = this._encode(state); // IE8 is sometimes recognizing a hash change as history entry. Cause of sporadic surface of this behavior, we have to prevent setting hash.


        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.version") != 8) {
          this._setHash(state);
        }

        var doc = this.__iframe.contentWindow.document;
        doc.open();
        doc.write('<html><body><div id="state">' + state + '</div></body></html>');
        doc.close();
      },

      /**
       * Helper function to clear the write state timer.
       */
      __clearWriteSateTimer: function __clearWriteSateTimer() {
        if (this.__writeStateTimner) {
          this.__writeStateTimner.stop();

          this.__writeStateTimner.dispose();
        }
      },

      /**
       * Initialize the polling timer
       */
      __initTimer: function __initTimer() {
        this.__initIframe(function () {
          qx.event.Idle.getInstance().addListener("interval", this.__onHashChange, this);
        });
      },

      /**
       * Hash change listener.
       *
       * @param e {qx.event.type.Event} event instance
       */
      __onHashChange: function __onHashChange(e) {
        // the location only changes if the user manually changes the fragment
        // identifier.
        var currentState = null;

        var locationState = this._getHash();

        if (!this.__isCurrentLocationState(locationState)) {
          currentState = this.__storeLocationState(locationState);
        } else {
          currentState = this._readState();
        }

        if (qx.lang.Type.isString(currentState) && currentState != this.getState()) {
          this._onHistoryLoad(currentState);
        }
      },

      /**
       * Stores the given location state.
       *
       * @param locationState {String} location state
       * @return {String}
       */
      __storeLocationState: function __storeLocationState(locationState) {
        locationState = this._decode(locationState);

        this._writeState(locationState);

        return locationState;
      },

      /**
       * Checks whether the given location state is the current one.
       *
       * @param locationState {String} location state to check
       * @return {Boolean}
       */
      __isCurrentLocationState: function __isCurrentLocationState(locationState) {
        return qx.lang.Type.isString(locationState) && locationState == this.__locationState;
      },

      /**
       * Initializes the iframe
       *
       * @param handler {Function?null} if given this callback is executed after iframe is ready to use
       */
      __initIframe: function __initIframe(handler) {
        this.__iframe = this.__createIframe();
        document.body.appendChild(this.__iframe);

        this.__waitForIFrame(function () {
          this._writeState(this.getState());

          if (handler) {
            handler.call(this);
          }
        }, this);
      },

      /**
       * IMPORTANT NOTE FOR IE:
       * Setting the source before adding the iframe to the document.
       * Otherwise IE will bring up a "Unsecure items ..." warning in SSL mode
       *
       * @return {qx.bom.Iframe}
       */
      __createIframe: function __createIframe() {
        var iframe = qx.bom.Iframe.create({
          src: qx.util.ResourceManager.getInstance().toUri("qx/static/blank.html")
        });
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";
        return iframe;
      },

      /**
       * Waits for the IFrame being loaded. Once the IFrame is loaded
       * the callback is called with the provided context.
       *
       * @param callback {Function} This function will be called once the iframe is loaded
       * @param context {Object?window} The context for the callback.
       * @param retry {Integer} number of tries to initialize the iframe
       */
      __waitForIFrame: function __waitForIFrame(callback, context, retry) {
        if (typeof retry === "undefined") {
          retry = 0;
        }

        if (!this.__iframe.contentWindow || !this.__iframe.contentWindow.document) {
          if (retry > 20) {
            throw new Error("can't initialize iframe");
          }

          qx.event.Timer.once(function () {
            this.__waitForIFrame(callback, context, ++retry);
          }, this, 10);
          return;
        }

        this.__iframeReady = true;
        callback.call(context || window);
      }
    },
    destruct: function destruct() {
      this.__iframe = null;

      if (this.__writeStateTimner) {
        this.__writeStateTimner.dispose();

        this.__writeStateTimner = null;
      }

      qx.event.Idle.getInstance().removeListener("interval", this.__onHashChange, this);
    }
  });
  qx.bom.IframeHistory.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.History": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Function": {},
      "qx.event.GlobalError": {},
      "qx.bom.Event": {},
      "qx.event.Idle": {},
      "qx.lang.Type": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.event.Timer": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Default history manager implementation. Either polls for URL fragment
   * identifier (hash) changes or uses the native "hashchange" event.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @internal
   */
  qx.Class.define("qx.bom.NativeHistory", {
    extend: qx.bom.History,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.bom.History.constructor.call(this);

      this.__attachListeners();
    },
    members: {
      __checkOnHashChange: null,

      /**
       * Attach hash change listeners
       */
      __attachListeners: function __attachListeners() {
        if (qx.bom.History.SUPPORTS_HASH_CHANGE_EVENT) {
          var boundFunc = qx.lang.Function.bind(this.__onHashChange, this);
          this.__checkOnHashChange = qx.event.GlobalError.observeMethod(boundFunc);
          qx.bom.Event.addNativeListener(window, "hashchange", this.__checkOnHashChange);
        } else {
          qx.event.Idle.getInstance().addListener("interval", this.__onHashChange, this);
        }
      },

      /**
       * Remove hash change listeners
       */
      __detatchListeners: function __detatchListeners() {
        if (qx.bom.History.SUPPORTS_HASH_CHANGE_EVENT) {
          qx.bom.Event.removeNativeListener(window, "hashchange", this.__checkOnHashChange);
        } else {
          qx.event.Idle.getInstance().removeListener("interval", this.__onHashChange, this);
        }
      },

      /**
       * hash change event handler
       */
      __onHashChange: function __onHashChange() {
        var currentState = this._readState();

        if (qx.lang.Type.isString(currentState) && currentState != this.getState()) {
          this._onHistoryLoad(currentState);
        }
      },

      /**
       * Browser dependent function to read the current state of the history
       *
       * @return {String} current state of the browser history
       */
      _readState: function _readState() {
        return this._decode(this._getHash());
      },

      /**
       * Save a state into the browser history.
       *
       * @param state {String} state to save
       */
      _writeState: qx.core.Environment.select("engine.name", {
        "opera": function opera(state) {
          qx.event.Timer.once(function () {
            this._setHash(this._encode(state));
          }, this, 0);
        },
        "default": function _default(state) {
          this._setHash(this._encode(state));
        }
      })
    },
    destruct: function destruct() {
      this.__detatchListeners();
    }
  });
  qx.bom.NativeHistory.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.ui.core.MChildrenHandling": {
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.util.PropertyUtil": {},
      "qx.ui.core.Spacer": {},
      "qx.ui.toolbar.Separator": {},
      "qx.ui.menubar.Button": {},
      "qx.ui.toolbar.Part": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Martin Wittemann (martinwittemann)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * The Toolbar class is the main part of the toolbar widget.
   *
   * It can handle added {@link Button}s, {@link CheckBox}es, {@link RadioButton}s
   * and {@link Separator}s in its {@link #add} method. The {@link #addSpacer} method
   * adds a spacer at the current toolbar position. This means that the widgets
   * added after the method call of {@link #addSpacer} are aligned to the right of
   * the toolbar.
   *
   * For more details on the documentation of the toolbar widget, take a look at the
   * documentation of the {@link qx.ui.toolbar}-Package.
   */
  qx.Class.define("qx.ui.toolbar.ToolBar", {
    extend: qx.ui.core.Widget,
    include: qx.ui.core.MChildrenHandling,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // add needed layout

      this._setLayout(new qx.ui.layout.HBox()); // initialize the overflow handling


      this.__removedItems = [];
      this.__removePriority = [];
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Appearance of the widget */
      appearance: {
        refine: true,
        init: "toolbar"
      },

      /** Holds the currently open menu (when the toolbar is used for menus) */
      openMenu: {
        check: "qx.ui.menu.Menu",
        event: "changeOpenMenu",
        nullable: true
      },

      /** Whether icons, labels, both or none should be shown. */
      show: {
        init: "both",
        check: ["both", "label", "icon"],
        inheritable: true,
        apply: "_applyShow",
        event: "changeShow"
      },

      /** The spacing between every child of the toolbar */
      spacing: {
        nullable: true,
        check: "Integer",
        themeable: true,
        apply: "_applySpacing"
      },

      /**
       * Widget which will be shown if at least one toolbar item is hidden.
       * Keep in mind to add this widget to the toolbar before you set it as
       * indicator!
       */
      overflowIndicator: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applyOverflowIndicator"
      },

      /** Enables the overflow handling which automatically removes items.*/
      overflowHandling: {
        init: false,
        check: "Boolean",
        apply: "_applyOverflowHandling"
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired if an item will be hidden by the {@link #overflowHandling}.*/
      "hideItem": "qx.event.type.Data",

      /** Fired if an item will be shown by the {@link #overflowHandling}.*/
      "showItem": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        OVERFLOW HANDLING
      ---------------------------------------------------------------------------
      */
      __removedItems: null,
      __removePriority: null,
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        // get the original hint
        var hint = qx.ui.toolbar.ToolBar.prototype._computeSizeHint.base.call(this);

        if (true && this.getOverflowHandling()) {
          var minWidth = 0; // if an overflow widget is given, use its width + spacing as min width

          var overflowWidget = this.getOverflowIndicator();

          if (overflowWidget) {
            minWidth = overflowWidget.getSizeHint().width + this.getSpacing();
          } // reset the minWidth because we reduce the count of elements


          hint.minWidth = minWidth;
        }

        return hint;
      },

      /**
       * Resize event handler.
       *
       * @param e {qx.event.type.Data} The resize event.
       */
      _onResize: function _onResize(e) {
        this._recalculateOverflow(e.getData().width);
      },

      /**
       * Responsible for calculation the overflow based on the available width.
       *
       * @param width {Integer?null} The available width.
       * @param requiredWidth {Integer?null} The required width for the widget
       *   if available.
       */
      _recalculateOverflow: function _recalculateOverflow(width, requiredWidth) {
        // do nothing if overflow handling is not enabled
        if (!this.getOverflowHandling()) {
          return;
        } // get all required sizes


        requiredWidth = requiredWidth || this.getSizeHint().width;
        var overflowWidget = this.getOverflowIndicator();
        var overflowWidgetWidth = 0;

        if (overflowWidget) {
          overflowWidgetWidth = overflowWidget.getSizeHint().width;
        }

        if (width == undefined && this.getBounds() != null) {
          width = this.getBounds().width;
        } // if we still don't have a width, than we are not added to a parent


        if (width == undefined) {
          // we should ignore it in that case
          return;
        } // if we have not enough space


        if (width < requiredWidth) {
          do {
            // get the next child
            var childToHide = this._getNextToHide(); // if there is no child to hide, just do nothing


            if (!childToHide) {
              return;
            } // get margins or spacing


            var margins = childToHide.getMarginLeft() + childToHide.getMarginRight();
            margins = Math.max(margins, this.getSpacing());
            var childWidth = childToHide.getSizeHint().width + margins;

            this.__hideChild(childToHide); // new width is the requiredWidth - the removed childs width


            requiredWidth -= childWidth; // show the overflowWidgetWidth

            if (overflowWidget && overflowWidget.getVisibility() != "visible") {
              overflowWidget.setVisibility("visible"); // if we need to add the overflow indicator, we need to add its width

              requiredWidth += overflowWidgetWidth; // add spacing or margins

              var overflowWidgetMargins = overflowWidget.getMarginLeft() + overflowWidget.getMarginRight();
              requiredWidth += Math.max(overflowWidgetMargins, this.getSpacing());
            }
          } while (requiredWidth > width); // if we can possibly show something

        } else if (this.__removedItems.length > 0) {
          do {
            var removedChild = this.__removedItems[0]; // if we have something we can show

            if (removedChild) {
              // get the margins or spacing
              var margins = removedChild.getMarginLeft() + removedChild.getMarginRight();
              margins = Math.max(margins, this.getSpacing()); // check if the element has been rendered before [BUG #4542]

              if (removedChild.getContentElement().getDomElement() == null) {
                // if not, apply the decorator element because it can change the
                // width of the child with padding e.g.
                removedChild.syncAppearance(); // also invalidate the layout cache to trigger size hint
                // recalculation

                removedChild.invalidateLayoutCache();
              }

              var removedChildWidth = removedChild.getSizeHint().width; // check if it fits in in case its the last child to replace

              var fits = false; // if we can remove the overflow widget if its available

              if (this.__removedItems.length == 1 && overflowWidgetWidth > 0) {
                var addedMargin = margins - this.getSpacing();
                var wouldRequiredWidth = requiredWidth - overflowWidgetWidth + removedChildWidth + addedMargin;
                fits = width > wouldRequiredWidth;
              } // if it just fits in || it fits in when we remove the overflow widget


              if (width > requiredWidth + removedChildWidth + margins || fits) {
                this.__showChild(removedChild);

                requiredWidth += removedChildWidth; // check if we need to remove the overflow widget

                if (overflowWidget && this.__removedItems.length == 0) {
                  overflowWidget.setVisibility("excluded");
                }
              } else {
                return;
              }
            }
          } while (width >= requiredWidth && this.__removedItems.length > 0);
        }
      },

      /**
       * Helper to show a toolbar item.
       *
       * @param child {qx.ui.core.Widget} The widget to show.
       */
      __showChild: function __showChild(child) {
        child.setVisibility("visible");

        this.__removedItems.shift();

        this.fireDataEvent("showItem", child);
      },

      /**
       * Helper to exclude a toolbar item.
       *
       * @param child {qx.ui.core.Widget} The widget to exclude.
       */
      __hideChild: function __hideChild(child) {
        // ignore the call if no child is given
        if (!child) {
          return;
        }

        this.__removedItems.unshift(child);

        child.setVisibility("excluded");
        this.fireDataEvent("hideItem", child);
      },

      /**
       * Responsible for returning the next item to remove. In It checks the
       * priorities added by {@link #setRemovePriority}. If all priorized widgets
       * already excluded, it takes the widget added at last.
       *
       * @return {qx.ui.core.Widget|null} The widget which should be removed next.
       *   If null is returned, no widget is available to remove.
       */
      _getNextToHide: function _getNextToHide() {
        // get the elements by priority
        for (var i = this.__removePriority.length - 1; i >= 0; i--) {
          var item = this.__removePriority[i]; // maybe a priority is left out and spacers don't have the visibility

          if (item && item.getVisibility && item.getVisibility() == "visible") {
            return item;
          }
        }

        ; // if there is non found by priority, check all available widgets

        var children = this._getChildren();

        for (var i = children.length - 1; i >= 0; i--) {
          var child = children[i]; // ignore the overflow widget

          if (child == this.getOverflowIndicator()) {
            continue;
          } // spacer don't have the visibility


          if (child.getVisibility && child.getVisibility() == "visible") {
            return child;
          }
        }

        ;
      },

      /**
       * The removal of the toolbar items is priority based. You can change these
       * priorities with this method. The higher a priority, the earlier it will
       * be excluded. Remember to use every priority only once! If you want
       * override an already set priority, use the override parameter.
       * Keep in mind to only use already added items.
       *
       * @param item {qx.ui.core.Widget} The item to give the priority.
       * @param priority {Integer} The priority, higher means removed earlier.
       * @param override {Boolean} true, if the priority should be overridden.
       */
      setRemovePriority: function setRemovePriority(item, priority, override) {
        // security check for overriding priorities
        if (!override && this.__removePriority[priority] != undefined) {
          throw new Error("Priority already in use!");
        }

        this.__removePriority[priority] = item;
      },
      // property apply
      _applyOverflowHandling: function _applyOverflowHandling(value, old) {
        // invalidate the own and the parents layout cache because the size hint changes
        this.invalidateLayoutCache();
        var parent = this.getLayoutParent();

        if (parent) {
          parent.invalidateLayoutCache();
        } // recalculate if possible


        var bounds = this.getBounds();

        if (bounds && bounds.width) {
          this._recalculateOverflow(bounds.width);
        } // if the handling has been enabled


        if (value) {
          // add the resize listener
          this.addListener("resize", this._onResize, this); // if the handles has been disabled
        } else {
          this.removeListener("resize", this._onResize, this); // set the overflow indicator to excluded

          var overflowIndicator = this.getOverflowIndicator();

          if (overflowIndicator) {
            overflowIndicator.setVisibility("excluded");
          } // set all buttons back to visible


          for (var i = 0; i < this.__removedItems.length; i++) {
            this.__removedItems[i].setVisibility("visible");
          }

          ; // reset the removed items

          this.__removedItems = [];
        }
      },
      // property apply
      _applyOverflowIndicator: function _applyOverflowIndicator(value, old) {
        if (old) {
          this._remove(old);
        }

        if (value) {
          // check if its a child of the toolbar
          if (this._indexOf(value) == -1) {
            throw new Error("Widget must be child of the toolbar.");
          } // hide the widget


          value.setVisibility("excluded");
        }
      },

      /*
      ---------------------------------------------------------------------------
        MENU OPEN
      ---------------------------------------------------------------------------
      */
      __allowMenuOpenHover: false,

      /**
       * Indicate if a menu could be opened on hover or not.
       *
       * @internal
       * @param value {Boolean} <code>true</code> if a menu could be opened,
       *    <code>false</code> otherwise.
       */
      _setAllowMenuOpenHover: function _setAllowMenuOpenHover(value) {
        this.__allowMenuOpenHover = value;
      },

      /**
       * Return if a menu could be opened on hover or not.
       *
       * @internal
       * @return {Boolean} <code>true</code> if a menu could be opened,
       *    <code>false</code> otherwise.
       */
      _isAllowMenuOpenHover: function _isAllowMenuOpenHover() {
        return this.__allowMenuOpenHover;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applySpacing: function _applySpacing(value, old) {
        var layout = this._getLayout();

        value == null ? layout.resetSpacing() : layout.setSpacing(value);
      },
      // property apply
      _applyShow: function _applyShow(value) {
        var children = this._getChildren();

        for (var i = 0; i < children.length; i++) {
          if (children[i].setShow) {
            children[i].setShow(value);
          }
        }

        ;
      },

      /*
      ---------------------------------------------------------------------------
        CHILD HANDLING
      ---------------------------------------------------------------------------
      */
      // overridden
      _add: function _add(child, options) {
        qx.ui.toolbar.ToolBar.prototype._add.base.call(this, child, options); // sync the show property (bug #6743) - but only if show wasn't explicitly set for the child (bug #6823)


        if (child.setShow && !qx.util.PropertyUtil.getUserValue(child, "show")) {
          child.setShow(this.getShow());
        }

        var newWidth = this.getSizeHint().width + child.getSizeHint().width + 2 * this.getSpacing();

        this._recalculateOverflow(null, newWidth);
      },
      // overridden
      _addAt: function _addAt(child, index, options) {
        qx.ui.toolbar.ToolBar.prototype._addAt.base.call(this, child, index, options); // sync the show property (bug #6743) - but only if show wasn't explicitly set for the child (bug #6823)


        if (child.setShow && !qx.util.PropertyUtil.getUserValue(child, "show")) {
          child.setShow(this.getShow());
        }

        var newWidth = this.getSizeHint().width + child.getSizeHint().width + 2 * this.getSpacing();

        this._recalculateOverflow(null, newWidth);
      },
      // overridden
      _addBefore: function _addBefore(child, before, options) {
        qx.ui.toolbar.ToolBar.prototype._addBefore.base.call(this, child, before, options); // sync the show property (bug #6743) - but only if show wasn't explicitly set for the child (bug #6823)


        if (child.setShow && !qx.util.PropertyUtil.getUserValue(child, "show")) {
          child.setShow(this.getShow());
        }

        var newWidth = this.getSizeHint().width + child.getSizeHint().width + 2 * this.getSpacing();

        this._recalculateOverflow(null, newWidth);
      },
      // overridden
      _addAfter: function _addAfter(child, after, options) {
        qx.ui.toolbar.ToolBar.prototype._addAfter.base.call(this, child, after, options); // sync the show property (bug #6743) - but only if show wasn't explicitly set for the child (bug #6823)


        if (child.setShow && !qx.util.PropertyUtil.getUserValue(child, "show")) {
          child.setShow(this.getShow());
        }

        var newWidth = this.getSizeHint().width + child.getSizeHint().width + 2 * this.getSpacing();

        this._recalculateOverflow(null, newWidth);
      },
      // overridden
      _remove: function _remove(child) {
        qx.ui.toolbar.ToolBar.prototype._remove.base.call(this, child);

        var newWidth = this.getSizeHint().width - child.getSizeHint().width - 2 * this.getSpacing();

        this._recalculateOverflow(null, newWidth);
      },
      // overridden
      _removeAt: function _removeAt(index) {
        var child = this._getChildren()[index];

        qx.ui.toolbar.ToolBar.prototype._removeAt.base.call(this, index);

        var newWidth = this.getSizeHint().width - child.getSizeHint().width - 2 * this.getSpacing();

        this._recalculateOverflow(null, newWidth);

        return child;
      },
      // overridden
      _removeAll: function _removeAll() {
        var children = qx.ui.toolbar.ToolBar.prototype._removeAll.base.call(this);

        this._recalculateOverflow(null, 0);

        return children;
      },

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Add a spacer to the toolbar. The spacer has a flex
       * value of one and will stretch to the available space.
       *
       * @return {qx.ui.core.Spacer} The newly added spacer object. A reference
       *   to the spacer is needed to remove this spacer from the layout.
       */
      addSpacer: function addSpacer() {
        var spacer = new qx.ui.core.Spacer();

        this._add(spacer, {
          flex: 1
        });

        return spacer;
      },

      /**
       * Adds a separator to the toolbar.
       */
      addSeparator: function addSeparator() {
        this.add(new qx.ui.toolbar.Separator());
      },

      /**
       * Returns all nested buttons which contains a menu to show. This is mainly
       * used for keyboard support.
       *
       * @return {Array} List of all menu buttons
       */
      getMenuButtons: function getMenuButtons() {
        var children = this.getChildren();
        var buttons = [];
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child instanceof qx.ui.menubar.Button) {
            buttons.push(child);
          } else if (child instanceof qx.ui.toolbar.Part) {
            buttons.push.apply(buttons, child.getMenuButtons());
          }
        }

        return buttons;
      }
    },
    destruct: function destruct() {
      if (this.hasListener("resize")) {
        this.removeListener("resize", this._onResize, this);
      }
    }
  });
  qx.ui.toolbar.ToolBar.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This mixin is included by all widgets which supports native overflowing.
   */
  qx.Mixin.define("qx.ui.core.MNativeOverflow", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Whether the widget should have horizontal scrollbars.
       */
      overflowX: {
        check: ["hidden", "visible", "scroll", "auto"],
        nullable: true,
        apply: "_applyOverflowX"
      },

      /**
       * Whether the widget should have vertical scrollbars.
       */
      overflowY: {
        check: ["hidden", "visible", "scroll", "auto"],
        nullable: true,
        apply: "_applyOverflowY"
      },

      /**
       * Overflow group property
       */
      overflow: {
        group: ["overflowX", "overflowY"]
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // property apply
      _applyOverflowX: function _applyOverflowX(value) {
        this.getContentElement().setStyle("overflowX", value);
      },
      // property apply
      _applyOverflowY: function _applyOverflowY(value) {
        this.getContentElement().setStyle("overflowY", value);
      }
    }
  });
  qx.ui.core.MNativeOverflow.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MNativeOverflow": {
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.theme.manager.Font": {},
      "qx.bom.Font": {},
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The Html widget embeds plain HTML code into the application
   *
   * *Example*
   *
   * Here is a little example of how to use the canvas widget.
   *
   * <pre class='javascript'>
   * var html = new qx.ui.embed.Html();
   * html.setHtml("<h1>Hello World</h1>");
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/html.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.embed.Html", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MNativeOverflow],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param html {String} Initial HTML content
     */
    construct: function construct(html) {
      qx.ui.core.Widget.constructor.call(this);

      if (html != null) {
        this.setHtml(html);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Any text string which can contain HTML, too */
      html: {
        check: "String",
        apply: "_applyHtml",
        event: "changeHtml",
        nullable: true
      },

      /**
       * The css classname for the html embed.
       * <b>IMPORTANT</b> Paddings and borders does not work
       * in the css class. These styles cause conflicts with
       * the layout engine.
       */
      cssClass: {
        check: "String",
        init: "",
        apply: "_applyCssClass"
      },
      // overridden
      selectable: {
        refine: true,
        init: true
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      getFocusElement: function getFocusElement() {
        return this.getContentElement();
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyHtml: function _applyHtml(value, old) {
        var elem = this.getContentElement(); // Workaround for http://bugzilla.qooxdoo.org/show_bug.cgi?id=7679

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") == 9) {
          elem.setStyle("position", "relative");
        } // Insert HTML content


        elem.setAttribute("html", value || "");
      },
      // property apply
      _applyCssClass: function _applyCssClass(value, old) {
        this.getContentElement().removeClass(old);
        this.getContentElement().addClass(value);
      },
      // overridden
      _applySelectable: function _applySelectable(value) {
        qx.ui.embed.Html.prototype._applySelectable.base.call(this, value);
        /*
         * We have to set the value to "text" in Webkit for the content element
         */


        if (qx.core.Environment.get("engine.name") == "webkit") {
          this.getContentElement().setStyle("userSelect", value ? "text" : "none");
        }
      },

      /*
      ---------------------------------------------------------------------------
        FONT SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyFont: function _applyFont(value, old) {
        var styles = value ? qx.theme.manager.Font.getInstance().resolve(value).getStyles() : qx.bom.Font.getDefaultStyles(); // check if text color already set - if so this local value has higher priority

        if (this.getTextColor() != null) {
          delete styles["color"];
        }

        this.getContentElement().setStyles(styles);
      },

      /*
      ---------------------------------------------------------------------------
        TEXT COLOR SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyTextColor: function _applyTextColor(value, old) {
        if (value) {
          this.getContentElement().setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
        } else {
          this.getContentElement().removeStyle("color");
        }
      }
    }
  });
  qx.ui.embed.Html.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.bom.Stylesheet": {
        "construct": true
      },
      "qx.log.Logger": {
        "construct": true
      },
      "qx.bom.element.Class": {},
      "qx.log.appender.Util": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This appender is used to log to an existing DOM element
   */
  qx.Class.define("qx.log.appender.Element", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param element {Element} DOM element to use for log output.
     */
    construct: function construct(element) {
      qx.core.Object.constructor.call(this);
      var style = ['.qxappender .level-debug{background:white}', '.qxappender .level-info{background:#DEEDFA}', '.qxappender .level-warn{background:#FFF7D5}', '.qxappender .level-error{background:#FFE2D5}', '.qxappender .level-user{background:#E3EFE9}', '.qxappender .type-string{color:black;font-weight:normal;}', '.qxappender .type-number{color:#155791;font-weight:normal;}', '.qxappender .type-boolean{color:#15BC91;font-weight:normal;}', '.qxappender .type-array{color:#CC3E8A;font-weight:bold;}', '.qxappender .type-map{color:#CC3E8A;font-weight:bold;}', '.qxappender .type-key{color:#565656;font-style:italic}', '.qxappender .type-class{color:#5F3E8A;font-weight:bold}', '.qxappender .type-instance{color:#565656;font-weight:bold}', '.qxappender .type-stringify{color:#565656;font-weight:bold}']; // Include stylesheet

      qx.bom.Stylesheet.createElement(style.join("")); // Finally register to log engine

      qx.log.Logger.register(this);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __element: null,

      /**
       * Configures the DOM element to use.
       *
       * @param element {Element} DOM element to log to
       */
      setElement: function setElement(element) {
        // Clear old element
        this.clear(); // Add classname

        if (element) {
          qx.bom.element.Class.add(element, "qxappender");
        } // Link to element


        this.__element = element;
      },

      /**
       * Clears the current output.
       *
       */
      clear: function clear() {
        var elem = this.__element; // Remove all messages

        if (elem) {
          elem.innerHTML = "";
        }
      },

      /**
       * Processes a single log entry
       *
       * @signature function(entry)
       * @param entry {Map} The entry to process
       */
      process: function process(entry) {
        var elem = this.__element;

        if (!elem) {
          return;
        } // Append new content


        elem.appendChild(qx.log.appender.Util.toHtml(entry)); // Scroll down

        elem.scrollTop = elem.scrollHeight;
      }
    }
  });
  qx.log.appender.Element.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.ui.core.MPlacement": {
        "require": true
      },
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.menu.Layout": {
        "construct": true
      },
      "qx.ui.core.Blocker": {
        "construct": true
      },
      "qx.ui.menu.Separator": {},
      "qx.ui.menu.Manager": {},
      "qx.ui.menu.AbstractButton": {},
      "qx.ui.menu.MenuSlideBar": {},
      "qx.ui.layout.Grow": {},
      "qx.lang.Array": {},
      "qx.ui.core.queue.Widget": {},
      "qx.core.ObjectRegistry": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The menu is a popup like control which supports buttons. It comes
   * with full keyboard navigation and an improved timeout based pointer
   * control behavior.
   *
   * This class is the container for all derived instances of
   * {@link qx.ui.menu.AbstractButton}.
   *
   * @childControl slidebar {qx.ui.menu.MenuSlideBar} shows a slidebar to easily navigate inside the menu (if too little space is left)
   */
  qx.Class.define("qx.ui.menu.Menu", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MPlacement, qx.ui.core.MRemoteChildrenHandling],
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Use hard coded layout

      this._setLayout(new qx.ui.menu.Layout()); // Automatically add to application's root


      var root = this.getApplicationRoot();
      root.add(this); // Register pointer listeners

      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut); // add resize listener

      this.addListener("resize", this._onResize, this);
      root.addListener("resize", this._onResize, this);
      this._blocker = new qx.ui.core.Blocker(root); // Initialize properties

      this.initVisibility();
      this.initKeepFocus();
      this.initKeepActive();
    },
    properties: {
      /*
      ---------------------------------------------------------------------------
        WIDGET PROPERTIES
      ---------------------------------------------------------------------------
      */
      // overridden
      appearance: {
        refine: true,
        init: "menu"
      },
      // overridden
      allowGrowX: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowY: {
        refine: true,
        init: false
      },
      // overridden
      visibility: {
        refine: true,
        init: "excluded"
      },
      // overridden
      keepFocus: {
        refine: true,
        init: true
      },
      // overridden
      keepActive: {
        refine: true,
        init: true
      },

      /*
      ---------------------------------------------------------------------------
        STYLE OPTIONS
      ---------------------------------------------------------------------------
      */

      /** The spacing between each cell of the menu buttons */
      spacingX: {
        check: "Integer",
        apply: "_applySpacingX",
        init: 0,
        themeable: true
      },

      /** The spacing between each menu button */
      spacingY: {
        check: "Integer",
        apply: "_applySpacingY",
        init: 0,
        themeable: true
      },

      /**
      * Default icon column width if no icons are rendered.
      * This property is ignored as soon as an icon is present.
      */
      iconColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyIconColumnWidth"
      },

      /** Default arrow column width if no sub menus are rendered */
      arrowColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyArrowColumnWidth"
      },

      /**
       * Color of the blocker
       */
      blockerColor: {
        check: "Color",
        init: null,
        nullable: true,
        apply: "_applyBlockerColor",
        themeable: true
      },

      /**
       * Opacity of the blocker
       */
      blockerOpacity: {
        check: "Number",
        init: 1,
        apply: "_applyBlockerOpacity",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        FUNCTIONALITY PROPERTIES
      ---------------------------------------------------------------------------
      */

      /** The currently selected button */
      selectedButton: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applySelectedButton"
      },

      /** The currently opened button (sub menu is visible) */
      openedButton: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applyOpenedButton"
      },

      /** Widget that opened the menu */
      opener: {
        check: "qx.ui.core.Widget",
        nullable: true
      },

      /*
      ---------------------------------------------------------------------------
        BEHAVIOR PROPERTIES
      ---------------------------------------------------------------------------
      */

      /** Interval in ms after which sub menus should be opened */
      openInterval: {
        check: "Integer",
        themeable: true,
        init: 250,
        apply: "_applyOpenInterval"
      },

      /** Interval in ms after which sub menus should be closed  */
      closeInterval: {
        check: "Integer",
        themeable: true,
        init: 250,
        apply: "_applyCloseInterval"
      },

      /** Blocks the background if value is <code>true<code> */
      blockBackground: {
        check: "Boolean",
        themeable: true,
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __scheduledOpen: null,
      __onAfterSlideBarAdd: null,

      /** @type {qx.ui.core.Blocker} blocker for background blocking */
      _blocker: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Opens the menu and configures the opener
       */
      open: function open() {
        if (this.getOpener() != null) {
          var isPlaced = this.placeToWidget(this.getOpener(), true);

          if (isPlaced) {
            this.__updateSlideBar();

            this.show();
            this._placementTarget = this.getOpener();
          } else {
            this.warn("Could not open menu instance because 'opener' widget is not visible");
          }
        } else {
          this.warn("The menu instance needs a configured 'opener' widget!");
        }
      },

      /**
       * Opens the menu at the pointer position
       *
       * @param e {qx.event.type.Pointer} Pointer event to align to
       */
      openAtPointer: function openAtPointer(e) {
        this.placeToPointer(e);

        this.__updateSlideBar();

        this.show();
        this._placementTarget = {
          left: e.getDocumentLeft(),
          top: e.getDocumentTop()
        };
      },

      /**
       * Opens the menu in relation to the given point
       *
       * @param point {Map} Coordinate of any point with the keys <code>left</code>
       *   and <code>top</code>.
       */
      openAtPoint: function openAtPoint(point) {
        this.placeToPoint(point);

        this.__updateSlideBar();

        this.show();
        this._placementTarget = point;
      },

      /**
       * Convenience method to add a separator to the menu
       */
      addSeparator: function addSeparator() {
        this.add(new qx.ui.menu.Separator());
      },

      /**
       * Returns the column sizes detected during the pre-layout phase
       *
       * @return {Array} List of all column widths
       */
      getColumnSizes: function getColumnSizes() {
        return this._getMenuLayout().getColumnSizes();
      },

      /**
       * Return all selectable menu items.
       *
       * @return {qx.ui.core.Widget[]} selectable widgets
       */
      getSelectables: function getSelectables() {
        var result = [];
        var children = this.getChildren();

        for (var i = 0; i < children.length; i++) {
          if (children[i].isEnabled()) {
            result.push(children[i]);
          }
        }

        return result;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIconColumnWidth: function _applyIconColumnWidth(value, old) {
        this._getMenuLayout().setIconColumnWidth(value);
      },
      // property apply
      _applyArrowColumnWidth: function _applyArrowColumnWidth(value, old) {
        this._getMenuLayout().setArrowColumnWidth(value);
      },
      // property apply
      _applySpacingX: function _applySpacingX(value, old) {
        this._getMenuLayout().setColumnSpacing(value);
      },
      // property apply
      _applySpacingY: function _applySpacingY(value, old) {
        this._getMenuLayout().setSpacing(value);
      },
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.menu.Menu.prototype._applyVisibility.base.call(this, value, old);

        var mgr = qx.ui.menu.Manager.getInstance();

        if (value === "visible") {
          // Register to manager (zIndex handling etc.)
          mgr.add(this); // Mark opened in parent menu

          var parentMenu = this.getParentMenu();

          if (parentMenu) {
            parentMenu.setOpenedButton(this.getOpener());
          }
        } else if (old === "visible") {
          // Deregister from manager (zIndex handling etc.)
          mgr.remove(this); // Unmark opened in parent menu

          var parentMenu = this.getParentMenu();

          if (parentMenu && parentMenu.getOpenedButton() == this.getOpener()) {
            parentMenu.resetOpenedButton();
          } // Clear properties


          this.resetOpenedButton();
          this.resetSelectedButton();
        }

        this.__updateBlockerVisibility();
      },

      /**
       * Updates the blocker's visibility
       */
      __updateBlockerVisibility: function __updateBlockerVisibility() {
        if (this.isVisible()) {
          if (this.getBlockBackground()) {
            var zIndex = this.getZIndex();

            this._blocker.blockContent(zIndex - 1);
          }
        } else {
          if (this._blocker.isBlocked()) {
            this._blocker.unblock();
          }
        }
      },

      /**
       * Get the parent menu. Returns <code>null</code> if the menu doesn't have a
       * parent menu.
       *
       * @return {qx.ui.core.Widget|null} The parent menu.
       */
      getParentMenu: function getParentMenu() {
        var widget = this.getOpener();

        if (!widget || !(widget instanceof qx.ui.menu.AbstractButton)) {
          return null;
        }

        if (widget && widget.getContextMenu() === this) {
          return null;
        }

        while (widget && !(widget instanceof qx.ui.menu.Menu)) {
          widget = widget.getLayoutParent();
        }

        return widget;
      },
      // property apply
      _applySelectedButton: function _applySelectedButton(value, old) {
        if (old) {
          old.removeState("selected");
        }

        if (value) {
          value.addState("selected");
        }
      },
      // property apply
      _applyOpenedButton: function _applyOpenedButton(value, old) {
        if (old && old.getMenu()) {
          old.getMenu().exclude();
        }

        if (value) {
          value.getMenu().open();
        }
      },
      // property apply
      _applyBlockerColor: function _applyBlockerColor(value, old) {
        this._blocker.setColor(value);
      },
      // property apply
      _applyBlockerOpacity: function _applyBlockerOpacity(value, old) {
        this._blocker.setOpacity(value);
      },

      /*
      ---------------------------------------------------------------------------
      SCROLLING SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("slidebar", true) || this;
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "slidebar":
            var control = new qx.ui.menu.MenuSlideBar();

            var layout = this._getLayout();

            this._setLayout(new qx.ui.layout.Grow());

            var slidebarLayout = control.getLayout();
            control.setLayout(layout);
            slidebarLayout.dispose();
            var children = qx.lang.Array.clone(this.getChildren());

            for (var i = 0; i < children.length; i++) {
              control.add(children[i]);
            }

            this.removeListener("resize", this._onResize, this);
            control.getChildrenContainer().addListener("resize", this._onResize, this);

            this._add(control);

            break;
        }

        return control || qx.ui.menu.Menu.prototype._createChildControlImpl.base.call(this, id);
      },

      /**
       * Get the menu layout manager
       *
       * @return {qx.ui.layout.Abstract} The menu layout manager
       */
      _getMenuLayout: function _getMenuLayout() {
        if (this.hasChildControl("slidebar")) {
          return this.getChildControl("slidebar").getChildrenContainer().getLayout();
        } else {
          return this._getLayout();
        }
      },

      /**
       * Get the menu bounds
       *
       * @return {Map} The menu bounds
       */
      _getMenuBounds: function _getMenuBounds() {
        if (this.hasChildControl("slidebar")) {
          return this.getChildControl("slidebar").getChildrenContainer().getBounds();
        } else {
          return this.getBounds();
        }
      },

      /**
       * Computes the size of the menu. This method is used by the
       * {@link qx.ui.core.MPlacement} mixin.
       * @return {Map} The menu bounds
       */
      _computePlacementSize: function _computePlacementSize() {
        return this._getMenuBounds();
      },

      /**
       * Updates the visibility of the slidebar based on the menu's current size
       * and position.
       */
      __updateSlideBar: function __updateSlideBar() {
        var menuBounds = this._getMenuBounds();

        if (!menuBounds) {
          this.addListenerOnce("resize", this.__updateSlideBar, this);
          return;
        }

        var rootHeight = this.getLayoutParent().getBounds().height;
        var top = this.getLayoutProperties().top;
        var left = this.getLayoutProperties().left; // Adding the slidebar must be deferred because this call can happen
        // during the layout flush, which make it impossible to move existing
        // layout to the slidebar

        if (top < 0) {
          this._assertSlideBar(function () {
            this.setHeight(menuBounds.height + top);
            this.moveTo(left, 0);
          });
        } else if (top + menuBounds.height > rootHeight) {
          this._assertSlideBar(function () {
            this.setHeight(rootHeight - top);
          });
        } else {
          this.setHeight(null);
        }
      },

      /**
       * Schedules the addition of the slidebar and calls the given callback
       * after the slidebar has been added.
       *
       * @param callback {Function} the callback to call
       * @return {var|undefined} The return value of the callback if the slidebar
       * already exists, or <code>undefined</code> if it doesn't
       */
      _assertSlideBar: function _assertSlideBar(callback) {
        if (this.hasChildControl("slidebar")) {
          return callback.call(this);
        }

        this.__onAfterSlideBarAdd = callback;
        qx.ui.core.queue.Widget.add(this);
      },
      // overridden
      syncWidget: function syncWidget(jobs) {
        this.getChildControl("slidebar");

        if (this.__onAfterSlideBarAdd) {
          this.__onAfterSlideBarAdd.call(this);

          delete this.__onAfterSlideBarAdd;
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Update position if the menu or the root is resized
       */
      _onResize: function _onResize() {
        if (this.isVisible()) {
          var target = this._placementTarget;

          if (!target) {
            return;
          } else if (target instanceof qx.ui.core.Widget) {
            this.placeToWidget(target, true);
          } else if (target.top !== undefined) {
            this.placeToPoint(target);
          } else {
            throw new Error("Unknown target: " + target);
          }

          this.__updateSlideBar();
        }
      },

      /**
       * Event listener for pointerover event.
       *
       * @param e {qx.event.type.Pointer} pointerover event
       */
      _onPointerOver: function _onPointerOver(e) {
        // Cache manager
        var mgr = qx.ui.menu.Manager.getInstance(); // Be sure this menu is kept

        mgr.cancelClose(this); // Change selection

        var target = e.getTarget();

        if (target.isEnabled() && target instanceof qx.ui.menu.AbstractButton) {
          // Select button directly
          this.setSelectedButton(target);
          var subMenu = target.getMenu && target.getMenu();

          if (subMenu) {
            subMenu.setOpener(target); // Finally schedule for opening

            mgr.scheduleOpen(subMenu); // Remember scheduled menu for opening

            this.__scheduledOpen = subMenu;
          } else {
            var opened = this.getOpenedButton();

            if (opened) {
              mgr.scheduleClose(opened.getMenu());
            }

            if (this.__scheduledOpen) {
              mgr.cancelOpen(this.__scheduledOpen);
              this.__scheduledOpen = null;
            }
          }
        } else if (!this.getOpenedButton()) {
          // When no button is opened reset the selection
          // Otherwise keep it
          this.resetSelectedButton();
        }
      },

      /**
       * Event listener for pointerout event.
       *
       * @param e {qx.event.type.Pointer} pointerout event
       */
      _onPointerOut: function _onPointerOut(e) {
        // Cache manager
        var mgr = qx.ui.menu.Manager.getInstance(); // Detect whether the related target is out of the menu

        if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget())) {
          // Update selected property
          // Force it to the open sub menu in cases where that is opened
          // Otherwise reset it. Menus which are left by the cursor should
          // not show any selection.
          var opened = this.getOpenedButton();
          opened ? this.setSelectedButton(opened) : this.resetSelectedButton(); // Cancel a pending close request for the currently
          // opened sub menu

          if (opened) {
            mgr.cancelClose(opened.getMenu());
          } // When leaving this menu to the outside, stop
          // all pending requests to open any other sub menu


          if (this.__scheduledOpen) {
            mgr.cancelOpen(this.__scheduledOpen);
          }
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (!qx.core.ObjectRegistry.inShutDown) {
        qx.ui.menu.Manager.getInstance().remove(this);
      }

      this.getApplicationRoot().removeListener("resize", this._onResize, this);
      this._placementTarget = null;

      this._disposeObjects("_blocker");
    }
  });
  qx.ui.menu.Menu.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Button": {
        "construct": true,
        "require": true
      },
      "qx.ui.menu.Manager": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * A button which opens the connected menu when tapping on it.
   */
  qx.Class.define("qx.ui.form.MenuButton", {
    extend: qx.ui.form.Button,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Initial label
     * @param icon {String?null} Initial icon
     * @param menu {qx.ui.menu.Menu} Connect to menu instance
     */
    construct: function construct(label, icon, menu) {
      qx.ui.form.Button.constructor.call(this, label, icon); // Initialize properties

      if (menu != null) {
        this.setMenu(menu);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The menu instance to show when tapping on the button */
      menu: {
        check: "qx.ui.menu.Menu",
        nullable: true,
        apply: "_applyMenu",
        event: "changeMenu"
      },
      // overridden
      appearance: {
        refine: true,
        init: "menubutton"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.form.MenuButton.prototype._applyVisibility.base.call(this, value, old); // hide the menu too


        var menu = this.getMenu();

        if (value != "visible" && menu) {
          menu.hide();
        }
      },
      // property apply
      _applyMenu: function _applyMenu(value, old) {
        if (old) {
          old.removeListener("changeVisibility", this._onMenuChange, this);
          old.resetOpener();
        }

        if (value) {
          value.addListener("changeVisibility", this._onMenuChange, this);
          value.setOpener(this);
          value.removeState("submenu");
          value.removeState("contextmenu");
        }
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Positions and shows the attached menu widget.
       *
       * @param selectFirst {Boolean?false} Whether the first menu button should be selected
       */
      open: function open(selectFirst) {
        var menu = this.getMenu();

        if (menu) {
          // Hide all menus first
          qx.ui.menu.Manager.getInstance().hideAll(); // Open the attached menu

          menu.setOpener(this);
          menu.open(); // Select first item

          if (selectFirst) {
            var first = menu.getSelectables()[0];

            if (first) {
              menu.setSelectedButton(first);
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener for visibility property changes of the attached menu
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onMenuChange: function _onMenuChange(e) {
        var menu = this.getMenu();

        if (menu.isVisible()) {
          this.addState("pressed");
        } else {
          this.removeState("pressed");
        }
      },
      // overridden
      _onPointerDown: function _onPointerDown(e) {
        // call the base function to get into the capture phase [BUG #4340]
        qx.ui.form.MenuButton.prototype._onPointerDown.base.call(this, e); // only open on left clicks [BUG #5125]


        if (e.getButton() != "left") {
          return;
        }

        var menu = this.getMenu();

        if (menu) {
          // Toggle sub menu visibility
          if (!menu.isVisible()) {
            this.open();
          } else {
            menu.exclude();
          } // Event is processed, stop it for others


          e.stopPropagation();
        }
      },
      // overridden
      _onPointerUp: function _onPointerUp(e) {
        // call base for firing the execute event
        qx.ui.form.MenuButton.prototype._onPointerUp.base.call(this, e); // Just stop propagation to stop menu manager
        // from getting the event


        e.stopPropagation();
      },
      // overridden
      _onPointerOver: function _onPointerOver(e) {
        // Add hovered state
        this.addState("hovered");
      },
      // overridden
      _onPointerOut: function _onPointerOut(e) {
        // Just remove the hover state
        this.removeState("hovered");
      },
      // overridden
      _onKeyDown: function _onKeyDown(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
            this.removeState("abandoned");
            this.addState("pressed");
            var menu = this.getMenu();

            if (menu) {
              // Toggle sub menu visibility
              if (!menu.isVisible()) {
                this.open();
              } else {
                menu.exclude();
              }
            }

            e.stopPropagation();
        }
      },
      // overridden
      _onKeyUp: function _onKeyUp(e) {// no action required here
      }
    }
  });
  qx.ui.form.MenuButton.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.MenuButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.toolbar.ToolBar": {},
      "qx.ui.menu.Manager": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * A menubar button
   */
  qx.Class.define("qx.ui.menubar.Button", {
    extend: qx.ui.form.MenuButton,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct(label, icon, menu) {
      qx.ui.form.MenuButton.constructor.call(this, label, icon, menu);
      this.removeListener("keydown", this._onKeyDown);
      this.removeListener("keyup", this._onKeyUp);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "menubar-button"
      },
      show: {
        refine: true,
        init: "inherit"
      },
      focusable: {
        refine: true,
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Inspects the parent chain to find the MenuBar
       *
       * @return {qx.ui.menubar.MenuBar} MenuBar instance or <code>null</code>.
       */
      getMenuBar: function getMenuBar() {
        var parent = this;

        while (parent) {
          /* this method is also used by toolbar.MenuButton, so we need to check
             for a ToolBar instance. */
          if (parent instanceof qx.ui.toolbar.ToolBar) {
            return parent;
          }

          parent = parent.getLayoutParent();
        }

        return null;
      },
      // overridden
      open: function open(selectFirst) {
        qx.ui.menubar.Button.prototype.open.base.call(this, selectFirst);
        var menubar = this.getMenuBar();

        if (menubar) {
          menubar._setAllowMenuOpenHover(true);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener for visibility property changes of the attached menu
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onMenuChange: function _onMenuChange(e) {
        var menu = this.getMenu();
        var menubar = this.getMenuBar();

        if (menu.isVisible()) {
          this.addState("pressed"); // Sync with open menu property

          if (menubar) {
            menubar.setOpenMenu(menu);
          }
        } else {
          this.removeState("pressed"); // Sync with open menu property

          if (menubar && menubar.getOpenMenu() == menu) {
            menubar.resetOpenMenu();

            menubar._setAllowMenuOpenHover(false);
          }
        }
      },
      // overridden
      _onPointerUp: function _onPointerUp(e) {
        qx.ui.menubar.Button.prototype._onPointerUp.base.call(this, e); // Set state 'pressed' to visualize that the menu is open.


        var menu = this.getMenu();

        if (menu && menu.isVisible() && !this.hasState("pressed")) {
          this.addState("pressed");
        }
      },

      /**
       * Event listener for pointerover event
       *
       * @param e {qx.event.type.Pointer} pointerover event object
       */
      _onPointerOver: function _onPointerOver(e) {
        // Add hovered state
        this.addState("hovered"); // Open submenu

        if (this.getMenu() && e.getPointerType() == "mouse") {
          var menubar = this.getMenuBar();

          if (menubar && menubar._isAllowMenuOpenHover()) {
            // Hide all open menus
            qx.ui.menu.Manager.getInstance().hideAll(); // Set it again, because hideAll remove it.

            menubar._setAllowMenuOpenHover(true); // Then show the attached menu


            if (this.isEnabled()) {
              this.open();
            }
          }
        }
      }
    }
  });
  qx.ui.menubar.Button.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.menubar.Button": {
        "require": true
      },
      "qx.ui.toolbar.PartContainer": {},
      "qx.ui.core.queue.Appearance": {},
      "qx.ui.basic.Image": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * The button to fill the menubar
   *
   * @childControl arrow {qx.ui.basic.Image} arrow widget to show a submenu is available
   */
  qx.Class.define("qx.ui.toolbar.MenuButton", {
    extend: qx.ui.menubar.Button,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Appearance of the widget */
      appearance: {
        refine: true,
        init: "toolbar-menubutton"
      },

      /** Whether the button should show an arrow to indicate the menu behind it */
      showArrow: {
        check: "Boolean",
        init: false,
        themeable: true,
        apply: "_applyShowArrow"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.toolbar.MenuButton.prototype._applyVisibility.base.call(this, value, old); // hide the menu too


        var menu = this.getMenu();

        if (value != "visible" && menu) {
          menu.hide();
        } // trigger a appearance recalculation of the parent


        var parent = this.getLayoutParent();

        if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
          qx.ui.core.queue.Appearance.add(parent);
        }
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "arrow":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._addAt(control, 10);

            break;
        }

        return control || qx.ui.toolbar.MenuButton.prototype._createChildControlImpl.base.call(this, id);
      },
      // property apply routine
      _applyShowArrow: function _applyShowArrow(value, old) {
        if (value) {
          this._showChildControl("arrow");
        } else {
          this._excludeChildControl("arrow");
        }
      }
    }
  });
  qx.ui.toolbar.MenuButton.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.ui.core.MExecutable": {
        "require": true
      },
      "qx.ui.form.IExecutable": {
        "require": true
      },
      "qx.ui.menu.ButtonLayout": {
        "construct": true
      },
      "qx.ui.basic.Image": {},
      "qx.ui.basic.Label": {},
      "qx.ui.menu.Manager": {},
      "qx.locale.Manager": {},
      "qx.core.ObjectRegistry": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The abstract menu button class is used for all type of menu content
   * for example normal buttons, checkboxes or radiobuttons.
   *
   * @childControl icon {qx.ui.basic.Image} icon of the button
   * @childControl label {qx.ui.basic.Label} label of the button
   * @childControl shortcut {qx.ui.basic.Label} shows if specified the shortcut
   * @childControl arrow {qx.ui.basic.Image} shows the arrow to show an additional widget (e.g. popup or submenu)
   */
  qx.Class.define("qx.ui.menu.AbstractButton", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],
    type: "abstract",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Use hard coded layout

      this._setLayout(new qx.ui.menu.ButtonLayout()); // Add listeners


      this.addListener("tap", this._onTap);
      this.addListener("keypress", this._onKeyPress); // Add command listener

      this.addListener("changeCommand", this._onChangeCommand, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      blockToolTip: {
        refine: true,
        init: true
      },

      /** The label text of the button */
      label: {
        check: "String",
        apply: "_applyLabel",
        nullable: true,
        event: "changeLabel"
      },

      /** Whether a sub menu should be shown and which one */
      menu: {
        check: "qx.ui.menu.Menu",
        apply: "_applyMenu",
        nullable: true,
        dereference: true,
        event: "changeMenu"
      },

      /** The icon to use */
      icon: {
        check: "String",
        apply: "_applyIcon",
        themeable: true,
        nullable: true,
        event: "changeIcon"
      },

      /** Indicates whether the label for the command (shortcut) should be visible or not. */
      showCommandLabel: {
        check: "Boolean",
        apply: "_applyShowCommandLabel",
        themeable: true,
        init: true,
        event: "changeShowCommandLabel"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "icon":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._add(control, {
              column: 0
            });

            break;

          case "label":
            control = new qx.ui.basic.Label();
            control.setAnonymous(true);

            this._add(control, {
              column: 1
            });

            break;

          case "shortcut":
            control = new qx.ui.basic.Label();
            control.setAnonymous(true);

            if (!this.getShowCommandLabel()) {
              control.exclude();
            }

            this._add(control, {
              column: 2
            });

            break;

          case "arrow":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._add(control, {
              column: 3
            });

            break;
        }

        return control || qx.ui.menu.AbstractButton.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        selected: 1
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the dimensions of all children
       *
       * @return {Array} Preferred width of each child
       */
      getChildrenSizes: function getChildrenSizes() {
        var iconWidth = 0,
            labelWidth = 0,
            shortcutWidth = 0,
            arrowWidth = 0;

        if (this._isChildControlVisible("icon")) {
          var icon = this.getChildControl("icon");
          iconWidth = icon.getMarginLeft() + icon.getSizeHint().width + icon.getMarginRight();
        }

        if (this._isChildControlVisible("label")) {
          var label = this.getChildControl("label");
          labelWidth = label.getMarginLeft() + label.getSizeHint().width + label.getMarginRight();
        }

        if (this._isChildControlVisible("shortcut")) {
          var shortcut = this.getChildControl("shortcut");
          shortcutWidth = shortcut.getMarginLeft() + shortcut.getSizeHint().width + shortcut.getMarginRight();
        }

        if (this._isChildControlVisible("arrow")) {
          var arrow = this.getChildControl("arrow");
          arrowWidth = arrow.getMarginLeft() + arrow.getSizeHint().width + arrow.getMarginRight();
        }

        return [iconWidth, labelWidth, shortcutWidth, arrowWidth];
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for tap
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onTap: function _onTap(e) {
        if (e.isLeftPressed()) {
          this.execute();
          qx.ui.menu.Manager.getInstance().hideAll();
        } // right click
        else {
            // only prevent contextmenu event if button has no further context menu.
            if (!this.getContextMenu()) {
              qx.ui.menu.Manager.getInstance().preventContextMenuOnce();
            }
          }
      },

      /**
       * Event listener for keypress event
       *
       * @param e {qx.event.type.KeySequence} keypress event
       */
      _onKeyPress: function _onKeyPress(e) {
        this.execute();
      },

      /**
       * Event listener for command changes. Updates the text of the shortcut.
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onChangeCommand: function _onChangeCommand(e) {
        var command = e.getData(); // do nothing if no command is set

        if (command == null) {
          return;
        }

        {
          var oldCommand = e.getOldData();

          if (!oldCommand) {
            qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
          }

          if (!command) {
            qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
          }
        }
        var cmdString = command != null ? command.toString() : "";
        this.getChildControl("shortcut").setValue(cmdString);
      },

      /**
       * Update command string on locale changes
       */
      _onChangeLocale: function _onChangeLocale(e) {
        var command = this.getCommand();

        if (command != null) {
          this.getChildControl("shortcut").setValue(command.toString());
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        if (value) {
          this._showChildControl("icon").setSource(value);
        } else {
          this._excludeChildControl("icon");
        }
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        if (value) {
          this._showChildControl("label").setValue(value);
        } else {
          this._excludeChildControl("label");
        }
      },
      // property apply
      _applyMenu: function _applyMenu(value, old) {
        if (old) {
          old.resetOpener();
          old.removeState("submenu");
        }

        if (value) {
          this._showChildControl("arrow");

          value.setOpener(this);
          value.addState("submenu");
        } else {
          this._excludeChildControl("arrow");
        }
      },
      // property apply
      _applyShowCommandLabel: function _applyShowCommandLabel(value, old) {
        if (value) {
          this._showChildControl("shortcut");
        } else {
          this._excludeChildControl("shortcut");
        }
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      this.removeListener("changeCommand", this._onChangeCommand, this);

      if (this.getMenu()) {
        if (!qx.core.ObjectRegistry.inShutDown) {
          this.getMenu().destroy();
        }
      }

      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      }
    }
  });
  qx.ui.menu.AbstractButton.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.Abstract": {
        "require": true
      },
      "qx.lang.Array": {},
      "qx.ui.layout.Util": {},
      "qx.ui.menu.Menu": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Layout used for the menu buttons which may contain four elements. A icon,
   * a label, a shortcut text and an arrow (for a sub menu)
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.ButtonLayout", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        this.assert(name == "column", "The property '" + name + "' is not supported by the MenuButton layout!");
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child;
        var column;
        var columnChildren = [];

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          column = child.getLayoutProperties().column;
          columnChildren[column] = child;
        }

        var menu = this.__getMenu(children[0]);

        var columns = menu.getColumnSizes();
        var spacing = menu.getSpacingX(); // stretch label column

        var neededWidth = qx.lang.Array.sum(columns) + spacing * (columns.length - 1);

        if (neededWidth < availWidth) {
          columns[1] += availWidth - neededWidth;
        }

        var left = padding.left,
            top = padding.top;
        var Util = qx.ui.layout.Util;

        for (var i = 0, l = columns.length; i < l; i++) {
          child = columnChildren[i];

          if (child) {
            var hint = child.getSizeHint();
            var childTop = top + Util.computeVerticalAlignOffset(child.getAlignY() || "middle", hint.height, availHeight, 0, 0);
            var offsetLeft = Util.computeHorizontalAlignOffset(child.getAlignX() || "left", hint.width, columns[i], child.getMarginLeft(), child.getMarginRight());
            child.renderLayout(left + offsetLeft, childTop, hint.width, hint.height);
          }

          if (columns[i] > 0) {
            left += columns[i] + spacing;
          }
        }
      },

      /**
       * Get the widget's menu
       *
       * @param widget {qx.ui.core.Widget} the widget to get the menu for
       * @return {qx.ui.menu.Menu} the menu
       */
      __getMenu: function __getMenu(widget) {
        while (!(widget instanceof qx.ui.menu.Menu)) {
          widget = widget.getLayoutParent();
        }

        return widget;
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var neededHeight = 0;
        var neededWidth = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var hint = children[i].getSizeHint();
          neededWidth += hint.width;
          neededHeight = Math.max(neededHeight, hint.height);
        }

        return {
          width: neededWidth,
          height: neededHeight
        };
      }
    }
  });
  qx.ui.menu.ButtonLayout.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.menu.AbstractButton": {
        "construct": true,
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The real menu button class which supports a command and an icon. All
   * other features are inherited from the {@link qx.ui.menu.AbstractButton}
   * class.
   */
  qx.Class.define("qx.ui.menu.Button", {
    extend: qx.ui.menu.AbstractButton,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Initial label
     * @param icon {String} Initial icon
     * @param command {qx.ui.command.Command} Initial command (shortcut)
     * @param menu {qx.ui.menu.Menu} Initial sub menu
     */
    construct: function construct(label, icon, command, menu) {
      qx.ui.menu.AbstractButton.constructor.call(this); // Initialize with incoming arguments

      if (label != null) {
        this.setLabel(label);
      }

      if (icon != null) {
        this.setIcon(icon);
      }

      if (command != null) {
        this.setCommand(command);
      }

      if (menu != null) {
        this.setMenu(menu);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "menu-button"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */
      // overridden
      _onTap: function _onTap(e) {
        if (e.isLeftPressed() && this.getMenu()) {
          this.execute(); // don't close menus if the button is a sub menu button

          this.getMenu().open();
          return;
        }

        qx.ui.menu.Button.prototype._onTap.base.call(this, e);
      }
    }
  });
  qx.ui.menu.Button.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.dev.unit.TestFunction": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A TestSuite is a collection of test functions, classes and other test suites,
   * which should be run together.
   */
  qx.Class.define("qx.dev.unit.AbstractTestSuite", {
    extend: qx.core.Object,
    type: "abstract",
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this._tests = [];
    },
    members: {
      _tests: null,

      /**
       * Add a single function to test
       *
       * @param name {String} Name of the function
       * @param fcn {Function} The test function
       */
      addTestFunction: function addTestFunction(name, fcn) {
        this._tests.push(new qx.dev.unit.TestFunction(null, name, fcn));
      },

      /**
       * Add a method from a class as test to the suite
       *
       * @param testCase {qx.dev.unit.TestCase} The class containing the test method
       * @param functionName {String} The name of the test method
       */
      addTestMethod: function addTestMethod(testCase, functionName) {
        this._tests.push(new qx.dev.unit.TestFunction(testCase, functionName));
      },

      /**
       * Add a test function to the suite, which fails.
       *
       * @param functionName {String} Name of the function
       * @param message {String} The fail message
       */
      addFail: function addFail(functionName, message) {
        this.addTestFunction(functionName, function () {
          this.fail(message);
        });
      },

      /**
       * Run all tests using the given test result
       *
       * @param testResult {qx.dev.unit.TestResult} Test result class, which runs the tests.
       */
      run: function run(testResult) {
        for (var i = 0; i < this._tests.length; i++) {
          this._tests[i].run(testResult);
        }
      },

      /**
       * Get a list of all test methods in the suite
       *
       * @return {Function[]} A list of all test methods in the suite
       */
      getTestMethods: function getTestMethods() {
        var methods = [];

        for (var i = 0; i < this._tests.length; i++) {
          var test = this._tests[i];

          if (test instanceof qx.dev.unit.TestFunction) {
            methods.push(test);
          }
        }

        return methods;
      }
    },
    destruct: function destruct() {
      this._disposeArray("_tests");
    }
  });
  qx.dev.unit.AbstractTestSuite.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.dev.unit.AbstractTestSuite": {
        "construct": true,
        "require": true
      },
      "qx.lang.Type": {},
      "qx.dev.unit.TestCase": {},
      "qx.dev.unit.TestClass": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A TestSuite is a collection of test functions, classes and other test suites,
   * which should be run together.
   */
  qx.Class.define("qx.dev.unit.TestSuite", {
    extend: qx.dev.unit.AbstractTestSuite,

    /**
     * @param testClassOrNamespace {var} Either a string with the name of the test
     *    class or test namespace or a reference to the test class or namespace.
     *    All test in the given class/namespace will be added to the suite.
     */
    construct: function construct(testClassOrNamespace) {
      qx.dev.unit.AbstractTestSuite.constructor.call(this);
      this._tests = [];

      if (testClassOrNamespace) {
        this.add(testClassOrNamespace);
      }
    },
    members: {
      /**
       * Add a test class or namespace to the suite
       *
       * @lint ignoreDeprecated(alert, eval)
       *
       * @param testClassOrNamespace {var} Either a string with the name of the test
       *    class or test namespace or a reference to the test class or namespace.
       *    All test in the given class/namespace will be added to the suite.
       */
      add: function add(testClassOrNamespace) {
        // This try-block is needed to avoid errors (e.g. "too much recursion")
        //      try
        //      {
        if (qx.lang.Type.isString(testClassOrNamespace)) {
          var evalTestClassOrNamespace = window.eval(testClassOrNamespace);

          if (!evalTestClassOrNamespace) {
            this.addFail(testClassOrNamespace, "The class/namespace '" + testClassOrNamespace + "' is undefined!");
          }

          testClassOrNamespace = evalTestClassOrNamespace;
        }

        if (qx.lang.Type.isFunction(testClassOrNamespace)) {
          this.addTestClass(testClassOrNamespace);
        } else if (qx.lang.Type.isObject(testClassOrNamespace)) {
          this.addTestNamespace(testClassOrNamespace);
        } else {
          this.addFail("existsCheck", "Unknown test class '" + testClassOrNamespace + "'!");
          return;
        } //      }
        //      catch (ex)
        //      {
        //        window.alert("An error occurred while adding test classes/namespaces\nPlease try a different test file.");
        //      }

      },

      /**
       * Add all tests from the given namespace to the suite
       *
       * @param namespace {Object} The topmost namespace of the tests classes to add.
       */
      addTestNamespace: function addTestNamespace(namespace) {
        if (qx.lang.Type.isFunction(namespace) && namespace.classname) {
          if (qx.Class.isSubClassOf(namespace, qx.dev.unit.TestCase)) {
            if (namespace.$$classtype !== "abstract") {
              this.addTestClass(namespace);
            }

            return;
          }
        } else if (qx.lang.Type.isObject(namespace) && !(namespace instanceof Array)) {
          for (var key in namespace) {
            this.addTestNamespace(namespace[key]);
          }
        }
      },

      /**
       * Add a test class to the suite
       *
       * @param clazz {Class} The test class to add
       */
      addTestClass: function addTestClass(clazz) {
        this._tests.push(new qx.dev.unit.TestClass(clazz));
      },

      /**
       * Get a list of all test classes in the suite
       *
       * @return {Class[]} A list of all test classes in the suite
       */
      getTestClasses: function getTestClasses() {
        var classes = [];

        for (var i = 0; i < this._tests.length; i++) {
          var test = this._tests[i];

          if (test instanceof qx.dev.unit.TestClass) {
            classes.push(test);
          }
        }

        return classes;
      }
    }
  });
  qx.dev.unit.TestSuite.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.dev.unit.TestResult": {
        "construct": true,
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Test result class, which can export the results to JSUnit
   */
  qx.Class.define("qx.dev.unit.JsUnitTestResult", {
    extend: qx.dev.unit.TestResult,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.dev.unit.TestResult.constructor.call(this);
      this.__testFunctionNames = [];
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __testFunctionNames: null,

      /**
       * Run the test
       * @param test {qx.dev.unit.TestFunction} The test.
       * @param testFunction {Function} A reference to a test function.
       */
      run: function run(test, testFunction) {
        var testFunctionName = "$test_" + test.getFullName().replace(/\W/g, "_");

        this.__testFunctionNames.push(testFunctionName);

        window[testFunctionName] = testFunction;
      },

      /**
       * Export the test functions to JSUnit
       */
      exportToJsUnit: function exportToJsUnit() {
        var self = this; // global

        window.exposeTestFunctionNames = function () {
          return self.__testFunctionNames;
        }; // global


        window.isTestPageLoaded = true;
      }
    }
  });
  qx.dev.unit.JsUnitTestResult.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Performance test result object. Used to communicate measurements to the unit
   * testing framework.
   */
  qx.Class.define("qx.dev.unit.MeasurementResult", {
    extend: Object,

    /**
     *
     * @param message {String} Description
     * @param iterations {Number} Amount of times the tested code was executed
     * @param ownTime {Number} Elapsed JavaScript execution time
     * @param renderTime {Number} Elapsed DOM rendering time
     */
    construct: function construct(message, iterations, ownTime, renderTime) {
      this.__message = message;
      this.__iterations = iterations;
      this.__ownTime = ownTime;
      this.__renderTime = renderTime;
    },
    members: {
      __message: null,
      __iterations: null,
      __ownTime: null,
      __renderTime: null,

      /**
       * Returns the stored data as a map.
       * @return {Map} The stored data.
       */
      getData: function getData() {
        return {
          message: this.__message,
          iterations: this.__iterations,
          ownTime: this.__ownTime,
          renderTime: this.__renderTime
        };
      },

      /**
       * Returns a readable summary of this result
       *
       * @return {String} Result summary
       */
      toString: function toString() {
        return ["Measured: " + this.__message, "Iterations: " + this.__iterations, "Time: " + this.__ownTime + "ms", "Render time: " + this.__renderTime + "ms"].join("\n");
      }
    }
  });
  qx.dev.unit.MeasurementResult.$$dbClassInfo = $$dbClassInfo;
})();

//
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.log.Logger": {},
      "qx.lang.Object": {},
      "qx.lang.Type": {},
      "qx.data.IListData": {},
      "qx.lang.String": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006, 2007 Derrell Lipman
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Derrell Lipman (derrell)
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * Useful debug capabilities
   * @ignore(qx.ui.decoration.IDecorator)
   * @ignore(qx.theme.manager.Decoration)
   * @ignore(qx.ui.core.queue.Dispose)
   * @ignore(qx.bom.Font)
   * @ignore(qx.theme.manager.Font)
   */
  qx.Class.define("qx.dev.Debug", {
    statics: {
      /**
       * Flag that shows whether dispose profiling is currently active
       * @internal
       */
      disposeProfilingActive: false,

      /**
       * Recursively display an object (as a debug message)
       *
       *
       * @param obj {Object}
       *   The object to be recursively displayed
       *
       * @param initialMessage {String|null}
       *   The initial message to be displayed.
       *
       * @param maxLevel {Integer ? 10}
       *   The maximum level of recursion.  Objects beyond this level will not
       *   be displayed.
       *
       */
      debugObject: function debugObject(obj, initialMessage, maxLevel) {
        // We've compiled the complete message.  Give 'em what they came for!
        qx.log.Logger.debug(this, qx.dev.Debug.debugObjectToString(obj, initialMessage, maxLevel, false));
      },

      /**
       * Recursively display an object (into a string)
       *
       *
       * @param obj {Object}
       *   The object to be recursively displayed
       *
       * @param initialMessage {String|null}
       *   The initial message to be displayed.
       *
       * @param maxLevel {Integer ? 10}
       *   The maximum level of recursion.  Objects beyond this level will not
       *   be displayed.
       *
       * @param bHtml {Boolean ? false}
       *   If true, then render the debug message in HTML;
       *   Otherwise, use spaces for indentation and "\n" for end of line.
       *
       * @return {String}
       *   The string containing the recursive display of the object
       *
       * @lint ignoreUnused(prop)
       */
      debugObjectToString: function debugObjectToString(obj, initialMessage, maxLevel, bHtml) {
        // If a maximum recursion level was not specified...
        if (!maxLevel) {
          // ... then create one arbitrarily
          maxLevel = 10;
        } // If they want html, the differences are "<br>" instead of "\n"
        // and how we do the indentation.  Define the end-of-line string
        // and a start-of-line function.


        var eol = bHtml ? "</span><br>" : "\n";

        var sol = function sol(currentLevel) {
          var indentStr;

          if (!bHtml) {
            indentStr = "";

            for (var i = 0; i < currentLevel; i++) {
              indentStr += "  ";
            }
          } else {
            indentStr = "<span style='padding-left:" + currentLevel * 8 + "px;'>";
          }

          return indentStr;
        }; // Initialize an empty message to be displayed


        var message = ""; // Function to recursively display an object

        var displayObj = function displayObj(obj, level, maxLevel) {
          // If we've exceeded the maximum recursion level...
          if (level > maxLevel) {
            // ... then tell 'em so, and get outta dodge.
            message += sol(level) + "*** TOO MUCH RECURSION: not displaying ***" + eol;
            return;
          } // Is this an ordinary non-recursive item?


          if (_typeof(obj) != "object") {
            // Yup.  Just add it to the message.
            message += sol(level) + obj + eol;
            return;
          } // We have an object  or array.  For each child...


          for (var prop in obj) {
            // Is this child a recursive item?
            if (_typeof(obj[prop]) == "object") {
              try {
                // Yup.  Determine the type and add it to the message
                if (obj[prop] instanceof Array) {
                  message += sol(level) + prop + ": " + "Array" + eol;
                } else if (obj[prop] === null) {
                  message += sol(level) + prop + ": " + "null" + eol;
                  continue;
                } else if (obj[prop] === undefined) {
                  message += sol(level) + prop + ": " + "undefined" + eol;
                  continue;
                } else {
                  message += sol(level) + prop + ": " + "Object" + eol;
                } // Recurse into it to display its children.


                displayObj(obj[prop], level + 1, maxLevel);
              } catch (e) {
                message += sol(level) + prop + ": EXCEPTION expanding property" + eol;
              }
            } else {
              // We have an ordinary non-recursive item.  Add it to the message.
              message += sol(level) + prop + ": " + obj[prop] + eol;
            }
          }
        }; // Was an initial message provided?


        if (initialMessage) {
          // Yup.  Add it to the displayable message.
          message += sol(0) + initialMessage + eol;
        }

        if (obj instanceof Array) {
          message += sol(0) + "Array, length=" + obj.length + ":" + eol;
        } else if (_typeof(obj) == "object") {
          var count = 0;

          for (var prop in obj) {
            count++;
          }

          message += sol(0) + "Object, count=" + count + ":" + eol;
        }

        message += sol(0) + "------------------------------------------------------------" + eol;

        try {
          // Recursively display this object
          displayObj(obj, 0, maxLevel);
        } catch (ex) {
          message += sol(0) + "*** EXCEPTION (" + ex + ") ***" + eol;
        }

        message += sol(0) + "============================================================" + eol;
        return message;
      },

      /**
       * Get the name of a member/static function or constructor defined using the new style class definition.
       * If the function could not be found <code>null</code> is returned.
       *
       * This function uses a linear search, so don't use it in performance critical
       * code.
       *
       * @param func {Function} member function to get the name of.
       * @param functionType {String?"all"} Where to look for the function. Possible values are "members", "statics", "constructor", "all"
       * @return {String|null} Name of the function (null if not found).
       */
      getFunctionName: function getFunctionName(func, functionType) {
        var clazz = func.self;

        if (!clazz) {
          return null;
        } // unwrap


        while (func.wrapper) {
          func = func.wrapper;
        }

        switch (functionType) {
          case "construct":
            return func == clazz ? "construct" : null;

          case "members":
            return qx.lang.Object.getKeyFromValue(clazz, func);

          case "statics":
            return qx.lang.Object.getKeyFromValue(clazz.prototype, func);

          default:
            // constructor
            if (func == clazz) {
              return "construct";
            }

            return qx.lang.Object.getKeyFromValue(clazz.prototype, func) || qx.lang.Object.getKeyFromValue(clazz, func) || null;
        }
      },

      /**
       * Returns a string representing the given model. The string will include
       * all model objects to a given recursive depth.
       *
       * @param model {qx.core.Object} The model object.
       * @param maxLevel {Number ? 10} The amount of max recursive depth.
       * @param html {Boolean ? false} If the returned string should have \n\r as
       *   newline of <br>.
       * @param indent {Number ? 1} The indentation level.
       *   (Needed for the recursion)
       *
       * @return {String} A string representation of the given model.
       */
      debugProperties: function debugProperties(model, maxLevel, html, indent) {
        // set the default max depth of the recursion
        if (maxLevel == null) {
          maxLevel = 10;
        } // set the default startin indent


        if (indent == null) {
          indent = 1;
        }

        var newLine = "";
        html ? newLine = "<br>" : newLine = "\r\n";
        var message = "";

        if (qx.lang.Type.isNumber(model) || qx.lang.Type.isString(model) || qx.lang.Type.isBoolean(model) || model == null || maxLevel <= 0) {
          return model;
        } else if (qx.Class.hasInterface(model.constructor, qx.data.IListData)) {
          // go threw the data structure
          for (var i = 0; i < model.length; i++) {
            // print out the indentation
            for (var j = 0; j < indent; j++) {
              message += "-";
            }

            message += "index(" + i + "): " + this.debugProperties(model.getItem(i), maxLevel - 1, html, indent + 1) + newLine;
          }

          return message + newLine;
        } else if (model.constructor != null) {
          // go threw all properties
          var properties = model.constructor.$$properties;

          for (var key in properties) {
            message += newLine; // print out the indentation

            for (var j = 0; j < indent; j++) {
              message += "-";
            }

            message += " " + key + ": " + this.debugProperties(model["get" + qx.lang.String.firstUp(key)](), maxLevel - 1, html, indent + 1);
          }

          return message;
        }

        return "";
      },

      /**
       * Starts a dispose profiling session. Use {@link #stopDisposeProfiling} to
       * get the results
       *
       * @return {Number|undefined}
       *   Returns a handle which may be passed to {@link #stopDisposeProfiling}
       *   indicating the start point for searching for undisposed objects.
       */
      startDisposeProfiling: function startDisposeProfiling() {},

      /**
       * Returns a list of any (qx) objects that were created but not disposed
       * since {@link #startDisposeProfiling} was called. Also returns a stack
       * trace recorded at the time the object was created. The starting point
       * of dispose tracking is reset, so to do further dispose profiling, a new
       * call to {@link #startDisposeProfile} must be issued.
       *
       * @signature function(checkFunction)
       * @param checkFunction {Function} Custom check function. It is called once
       * for each object that was created after dispose profiling was started,
       * with the object as the only parameter. If it returns false, the object
       * will not be included in the returned list
       * @return {Map[]} List of maps. Each map contains two keys:
       * <code>object</code> and <code>stackTrace</code>
       */
      stopDisposeProfiling: function stopDisposeProfiling() {},

      /**
       * Returns a list of any (qx) objects that were created but not disposed
       * since {@link #startDisposeProfiling} was called. Also returns a stack
       * trace recorded at the time the object was created. Does not restart the
       * tracking point, so subsequent calls to this method will continue to
       * show undisposed objects since {@link #startDisposeProfiling} was
       * called.
       *
       * @signature function(checkFunction)
       * @param checkFunction {Function} Custom check function. It is called once
       * for each object that was created after dispose profiling was started,
       * with the object as the only parameter. If it returns false, the object
       * will not be included in the returned list
       * @return {Map[]} List of maps. Each map contains two keys:
       * <code>object</code> and <code>stackTrace</code>
       */
      showDisposeProfiling: function showDisposeProfiling() {}
    }
  });
  qx.dev.Debug.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * A widget used for decoration proposes to structure a toolbar. Each
   * Separator renders a line between the buttons around.
   */
  qx.Class.define("qx.ui.toolbar.Separator", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "toolbar-separator"
      },
      // overridden
      anonymous: {
        refine: true,
        init: true
      },
      // overridden
      width: {
        refine: true,
        init: 0
      },
      // overridden
      height: {
        refine: true,
        init: 0
      }
    }
  });
  qx.ui.toolbar.Separator.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.basic.Image": {},
      "qx.ui.toolbar.PartContainer": {},
      "qx.ui.toolbar.Separator": {},
      "qx.ui.menubar.Button": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A part is a container for multiple toolbar buttons. Each part comes
   * with a handle which may be used in later versions to drag the part
   * around and move it to another position. Currently mainly used
   * for structuring large toolbars beyond the capabilities of the
   * {@link Separator}.
   *
   * @childControl handle {qx.ui.basic.Image} prat handle to visualize the separation
   * @childControl container {qx.ui.toolbar.PartContainer} holds the content of the toolbar part
   */
  qx.Class.define("qx.ui.toolbar.Part", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Hard coded HBox layout

      this._setLayout(new qx.ui.layout.HBox()); // Force creation of the handle


      this._createChildControl("handle");
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "toolbar/part"
      },

      /** Whether icons, labels, both or none should be shown. */
      show: {
        init: "both",
        check: ["both", "label", "icon"],
        inheritable: true,
        event: "changeShow"
      },

      /** The spacing between every child of the toolbar */
      spacing: {
        nullable: true,
        check: "Integer",
        themeable: true,
        apply: "_applySpacing"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "handle":
            control = new qx.ui.basic.Image();
            control.setAlignY("middle");

            this._add(control);

            break;

          case "container":
            control = new qx.ui.toolbar.PartContainer();
            control.addListener("syncAppearance", this.__onSyncAppearance, this);

            this._add(control);

            control.addListener("changeChildren", function () {
              this.__onSyncAppearance();
            }, this);
            break;
        }

        return control || qx.ui.toolbar.Part.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("container");
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      _applySpacing: function _applySpacing(value, old) {
        var layout = this.getChildControl("container").getLayout();
        value == null ? layout.resetSpacing() : layout.setSpacing(value);
      },

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Helper which applies the left, right and middle states.
       */
      __onSyncAppearance: function __onSyncAppearance() {
        // check every child
        var children = this.getChildrenContainer().getChildren();
        children = children.filter(function (child) {
          return child.getVisibility() == "visible";
        });

        for (var i = 0; i < children.length; i++) {
          // if its the first child
          if (i == 0 && i != children.length - 1) {
            children[i].addState("left");
            children[i].removeState("right");
            children[i].removeState("middle"); // if its the last child
          } else if (i == children.length - 1 && i != 0) {
            children[i].addState("right");
            children[i].removeState("left");
            children[i].removeState("middle"); // if there is only one child
          } else if (i == 0 && i == children.length - 1) {
            children[i].removeState("left");
            children[i].removeState("middle");
            children[i].removeState("right");
          } else {
            children[i].addState("middle");
            children[i].removeState("right");
            children[i].removeState("left");
          }
        }

        ;
      },

      /**
       * Adds a separator to the toolbar part.
       */
      addSeparator: function addSeparator() {
        this.add(new qx.ui.toolbar.Separator());
      },

      /**
       * Returns all nested buttons which contains a menu to show. This is mainly
       * used for keyboard support.
       *
       * @return {Array} List of all menu buttons
       */
      getMenuButtons: function getMenuButtons() {
        var children = this.getChildren();
        var buttons = [];
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child instanceof qx.ui.menubar.Button) {
            buttons.push(child);
          }
        }

        return buttons;
      }
    }
  });
  qx.ui.toolbar.Part.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.log.Logger": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Contains some common methods available to all log appenders.
   */
  qx.Bootstrap.define("qx.log.appender.Util", {
    statics: {
      /**
       * Converts a single log entry to HTML
       *
       * @signature function(entry)
       * @param entry {Map} The entry to process
       */
      toHtml: function toHtml(entry) {
        var output = [];
        var item, msg, sub, list;
        output.push("<span class='offset'>", this.formatOffset(entry.offset, 6), "</span> ");

        if (entry.object) {
          if (entry.clazz) {
            output.push("<span class='object' title='Object instance with hash code: " + entry.object + "'>", entry.clazz.classname, "[", entry.object, "]</span>: ");
          } else {
            var obj = entry.win.qx.core.ObjectRegistry.fromHashCode(entry.object, true);

            if (obj) {
              output.push("<span class='object' title='Object instance with hash code: " + obj.$$hash + "'>", obj.classname, "[", obj.$$hash, "]</span>: ");
            }
          }
        } else if (entry.clazz) {
          output.push("<span class='object'>" + entry.clazz.classname, "</span>: ");
        }

        var items = entry.items;

        for (var i = 0, il = items.length; i < il; i++) {
          item = items[i];
          msg = item.text;

          if (msg instanceof Array) {
            var list = [];

            for (var j = 0, jl = msg.length; j < jl; j++) {
              sub = msg[j];

              if (typeof sub === "string") {
                list.push("<span>" + this.escapeHTML(sub) + "</span>");
              } else if (sub.key) {
                list.push("<span class='type-key'>" + sub.key + "</span>:<span class='type-" + sub.type + "'>" + this.escapeHTML(sub.text) + "</span>");
              } else {
                list.push("<span class='type-" + sub.type + "'>" + this.escapeHTML(sub.text) + "</span>");
              }
            }

            output.push("<span class='type-" + item.type + "'>");

            if (item.type === "map") {
              output.push("{", list.join(", "), "}");
            } else {
              output.push("[", list.join(", "), "]");
            }

            output.push("</span>");
          } else {
            output.push("<span class='type-" + item.type + "'>" + this.escapeHTML(msg) + "</span> ");
          }
        }

        var wrapper = document.createElement("DIV");
        wrapper.innerHTML = output.join("");
        wrapper.className = "level-" + entry.level;
        return wrapper;
      },

      /**
       * Formats a numeric time offset to 6 characters.
       *
       * @param offset {Integer} Current offset value
       * @param length {Integer?6} Refine the length
       * @return {String} Padded string
       */
      formatOffset: function formatOffset(offset, length) {
        var str = offset.toString();
        var diff = (length || 6) - str.length;
        var pad = "";

        for (var i = 0; i < diff; i++) {
          pad += "0";
        }

        return pad + str;
      },

      /**
       * Escapes the HTML in the given value
       *
       * @param value {String} value to escape
       * @return {String} escaped value
       */
      escapeHTML: function escapeHTML(value) {
        return String(value).replace(/[<>&"']/g, this.__escapeHTMLReplace);
      },

      /**
       * Internal replacement helper for HTML escape.
       *
       * @param ch {String} Single item to replace.
       * @return {String} Replaced item
       */
      __escapeHTMLReplace: function __escapeHTMLReplace(ch) {
        var map = {
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          "'": "&#39;",
          '"': "&quot;"
        };
        return map[ch] || "?";
      },

      /**
       * Converts a single log entry to plain text
       *
       * @param entry {Map} The entry to process
       * @return {String} the formatted log entry
       */
      toText: function toText(entry) {
        return this.toTextArray(entry).join(" ");
      },

      /**
       * Converts a single log entry to an array of plain text
       *
       * @param entry {Map} The entry to process
       * @return {Array} Argument list ready message array.
       */
      toTextArray: function toTextArray(entry) {
        var output = [];
        output.push(this.formatOffset(entry.offset, 6));

        if (entry.object) {
          if (entry.clazz) {
            output.push(entry.clazz.classname + "[" + entry.object + "]:");
          } else {
            var obj = entry.win.qx.core.ObjectRegistry.fromHashCode(entry.object, true);

            if (obj) {
              output.push(obj.classname + "[" + obj.$$hash + "]:");
            }
          }
        } else if (entry.clazz) {
          output.push(entry.clazz.classname + ":");
        }

        var items = entry.items;
        var item, msg;

        for (var i = 0, il = items.length; i < il; i++) {
          item = items[i];
          msg = item.text;

          if (item.trace && item.trace.length > 0) {
            if (typeof this.FORMAT_STACK == "function") {
              qx.log.Logger.deprecatedConstantWarning(qx.log.appender.Util, "FORMAT_STACK", "Use qx.dev.StackTrace.FORMAT_STACKTRACE instead");
              msg += "\n" + this.FORMAT_STACK(item.trace);
            } else {
              msg += "\n" + item.trace;
            }
          }

          if (msg instanceof Array) {
            var list = [];

            for (var j = 0, jl = msg.length; j < jl; j++) {
              list.push(msg[j].text);
            }

            if (item.type === "map") {
              output.push("{", list.join(", "), "}");
            } else {
              output.push("[", list.join(", "), "]");
            }
          } else {
            output.push(msg);
          }
        }

        return output;
      }
    }
  });
  qx.log.appender.Util.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.VBox": {
        "require": true
      },
      "qx.lang.Array": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Layouter used by the qooxdoo menu's to render their buttons
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.Layout", {
    extend: qx.ui.layout.VBox,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Spacing between each cell on the menu buttons */
      columnSpacing: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /**
       * Whether a column and which column should automatically span
       * when the following cell is empty. Spanning may be disabled
       * through setting this property to <code>null</code>.
       */
      spanColumn: {
        check: "Integer",
        init: 1,
        nullable: true,
        apply: "_applyLayoutChange"
      },

      /** Default icon column width if no icons are rendered */
      iconColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyLayoutChange"
      },

      /** Default arrow column width if no sub menus are rendered */
      arrowColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyLayoutChange"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __columnSizes: null,

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var child, sizes, spacing;
        var spanColumn = this.getSpanColumn();
        var columnSizes = this.__columnSizes = [0, 0, 0, 0];
        var columnSpacing = this.getColumnSpacing();
        var spanColumnWidth = 0;
        var maxInset = 0; // Compute column sizes and insets

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child.isAnonymous()) {
            continue;
          }

          sizes = child.getChildrenSizes();

          for (var column = 0; column < sizes.length; column++) {
            if (spanColumn != null && column == spanColumn && sizes[spanColumn + 1] == 0) {
              spanColumnWidth = Math.max(spanColumnWidth, sizes[column]);
            } else {
              columnSizes[column] = Math.max(columnSizes[column], sizes[column]);
            }
          }

          var insets = children[i].getInsets();
          maxInset = Math.max(maxInset, insets.left + insets.right);
        } // Fix label column width is cases where the maximum button with no shortcut
        // is larger than the maximum button with a shortcut


        if (spanColumn != null && columnSizes[spanColumn] + columnSpacing + columnSizes[spanColumn + 1] < spanColumnWidth) {
          columnSizes[spanColumn] = spanColumnWidth - columnSizes[spanColumn + 1] - columnSpacing;
        } // When merging the cells for label and shortcut
        // ignore the spacing between them


        if (spanColumnWidth == 0) {
          spacing = columnSpacing * 2;
        } else {
          spacing = columnSpacing * 3;
        } // Fix zero size icon column


        if (columnSizes[0] == 0) {
          columnSizes[0] = this.getIconColumnWidth();
        } // Fix zero size arrow column


        if (columnSizes[3] == 0) {
          columnSizes[3] = this.getArrowColumnWidth();
        }

        var height = qx.ui.menu.Layout.prototype._computeSizeHint.base.call(this).height; // Build hint


        return {
          minHeight: height,
          height: height,
          width: qx.lang.Array.sum(columnSizes) + maxInset + spacing
        };
      },

      /*
      ---------------------------------------------------------------------------
        CUSTOM ADDONS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the column sizes detected during the pre-layout phase
       *
       * @return {Array} List of all column widths
       */
      getColumnSizes: function getColumnSizes() {
        return this.__columnSizes || null;
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__columnSizes = null;
    }
  });
  qx.ui.menu.Layout.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This widget draws a separator line between two instances of
   * {@link qx.ui.menu.AbstractButton} and is inserted into the
   * {@link qx.ui.menu.Menu}.
   *
   * For convenience reasons there is also
   * a method {@link qx.ui.menu.Menu#addSeparator} to append instances
   * of this class to the menu.
   */
  qx.Class.define("qx.ui.menu.Separator", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "menu-separator"
      },
      // overridden
      anonymous: {
        refine: true,
        init: true
      }
    }
  });
  qx.ui.menu.Separator.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.event.Registration": {
        "construct": true
      },
      "qx.bom.client.Event": {
        "construct": true
      },
      "qx.bom.Element": {
        "construct": true
      },
      "qx.event.Timer": {
        "construct": true
      },
      "qx.ui.menu.Menu": {},
      "qx.ui.menu.AbstractButton": {},
      "qx.lang.Array": {},
      "qx.ui.core.Widget": {},
      "qx.ui.menubar.Button": {},
      "qx.ui.menu.Button": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "event.touch": {
          "construct": true,
          "className": "qx.bom.client.Event"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * This singleton manages visible menu instances and supports some
   * core features to schedule menu open/close with timeout support.
   *
   * It also manages the whole keyboard support for the currently
   * registered widgets.
   *
   * The zIndex order is also managed by this class.
   */
  qx.Class.define("qx.ui.menu.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create data structure

      this.__objects = [];
      var el = document.body;
      var Registration = qx.event.Registration; // React on pointer/mouse events, but on native, to support inline applications

      Registration.addListener(window.document.documentElement, "pointerdown", this._onPointerDown, this, true);
      Registration.addListener(el, "roll", this._onRoll, this, true); // React on keypress events

      Registration.addListener(el, "keydown", this._onKeyUpDown, this, true);
      Registration.addListener(el, "keyup", this._onKeyUpDown, this, true);
      Registration.addListener(el, "keypress", this._onKeyPress, this, true); // only use the blur event to hide windows on non touch devices [BUG #4033]
      // When the menu is located on top of an iFrame, the select will fail

      if (!qx.core.Environment.get("event.touch")) {
        // Hide all when the window is blurred
        qx.bom.Element.addListener(window, "blur", this.hideAll, this);
      } // Create open timer


      this.__openTimer = new qx.event.Timer();

      this.__openTimer.addListener("interval", this._onOpenInterval, this); // Create close timer


      this.__closeTimer = new qx.event.Timer();

      this.__closeTimer.addListener("interval", this._onCloseInterval, this);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __scheduleOpen: null,
      __scheduleClose: null,
      __openTimer: null,
      __closeTimer: null,
      __objects: null,

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Query engine for menu children.
       *
       * @param menu {qx.ui.menu.Menu} Any menu instance
       * @param start {Integer} Child index to start with
       * @param iter {Integer} Iteration count, normally <code>+1</code> or <code>-1</code>
       * @param loop {Boolean?false} Whether to wrap when reaching the begin/end of the list
       * @return {qx.ui.menu.Button} Any menu button or <code>null</code>
       */
      _getChild: function _getChild(menu, start, iter, loop) {
        var children = menu.getChildren();
        var length = children.length;
        var child;

        for (var i = start; i < length && i >= 0; i += iter) {
          child = children[i];

          if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
            return child;
          }
        }

        if (loop) {
          i = i == length ? 0 : length - 1;

          for (; i != start; i += iter) {
            child = children[i];

            if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
              return child;
            }
          }
        }

        return null;
      },

      /**
       * Whether the given widget is inside any Menu instance.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Boolean} <code>true</code> when the widget is part of any menu
       */
      _isInMenu: function _isInMenu(widget) {
        while (widget) {
          if (widget instanceof qx.ui.menu.Menu) {
            return true;
          }

          widget = widget.getLayoutParent();
        }

        return false;
      },

      /**
       * Whether the given widget is one of the menu openers.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Boolean} <code>true</code> if the widget is a menu opener
       */
      _isMenuOpener: function _isMenuOpener(widget) {
        var menus = this.__objects;

        for (var i = 0; i < menus.length; i++) {
          if (menus[i].getOpener() === widget) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns an instance of a menu button if the given widget is a child
       *
       * @param widget {qx.ui.core.Widget} any widget
       * @return {qx.ui.menu.Button} Any menu button instance or <code>null</code>
       */
      _getMenuButton: function _getMenuButton(widget) {
        while (widget) {
          if (widget instanceof qx.ui.menu.AbstractButton) {
            return widget;
          }

          widget = widget.getLayoutParent();
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Adds a menu to the list of visible menus.
       *
       * @param obj {qx.ui.menu.Menu} Any menu instance.
       */
      add: function add(obj) {
        {
          if (!(obj instanceof qx.ui.menu.Menu)) {
            throw new Error("Object is no menu: " + obj);
          }
        }
        var reg = this.__objects;
        reg.push(obj);
        obj.setZIndex(1e6 + reg.length);
      },

      /**
       * Remove a menu from the list of visible menus.
       *
       * @param obj {qx.ui.menu.Menu} Any menu instance.
       */
      remove: function remove(obj) {
        {
          if (!(obj instanceof qx.ui.menu.Menu)) {
            throw new Error("Object is no menu: " + obj);
          }
        }
        var reg = this.__objects;

        if (reg) {
          qx.lang.Array.remove(reg, obj);
        }
      },

      /**
       * Hides all currently opened menus.
       */
      hideAll: function hideAll() {
        var reg = this.__objects;

        if (reg) {
          for (var i = reg.length - 1; i >= 0; i--) {
            reg[i].exclude();
          }
        }
      },

      /**
       * Returns the menu which was opened at last (which
       * is the active one this way)
       *
       * @return {qx.ui.menu.Menu} The current active menu or <code>null</code>
       */
      getActiveMenu: function getActiveMenu() {
        var reg = this.__objects;
        return reg.length > 0 ? reg[reg.length - 1] : null;
      },

      /*
      ---------------------------------------------------------------------------
        SCHEDULED OPEN/CLOSE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Schedules the given menu to be opened after the
       * {@link qx.ui.menu.Menu#openInterval} configured by the
       * menu instance itself.
       *
       * @param menu {qx.ui.menu.Menu} The menu to schedule for open
       */
      scheduleOpen: function scheduleOpen(menu) {
        // Cancel close of given menu first
        this.cancelClose(menu); // When the menu is already visible

        if (menu.isVisible()) {
          // Cancel all other open requests
          if (this.__scheduleOpen) {
            this.cancelOpen(this.__scheduleOpen);
          }
        } // When the menu is not visible and not scheduled already
        // then schedule it for opening
        else if (this.__scheduleOpen != menu) {
            // menu.debug("Schedule open");
            this.__scheduleOpen = menu;

            this.__openTimer.restartWith(menu.getOpenInterval());
          }
      },

      /**
       * Schedules the given menu to be closed after the
       * {@link qx.ui.menu.Menu#closeInterval} configured by the
       * menu instance itself.
       *
       * @param menu {qx.ui.menu.Menu} The menu to schedule for close
       */
      scheduleClose: function scheduleClose(menu) {
        // Cancel open of the menu first
        this.cancelOpen(menu); // When the menu is already invisible

        if (!menu.isVisible()) {
          // Cancel all other close requests
          if (this.__scheduleClose) {
            this.cancelClose(this.__scheduleClose);
          }
        } // When the menu is visible and not scheduled already
        // then schedule it for closing
        else if (this.__scheduleClose != menu) {
            // menu.debug("Schedule close");
            this.__scheduleClose = menu;

            this.__closeTimer.restartWith(menu.getCloseInterval());
          }
      },

      /**
       * When the given menu is scheduled for open this pending
       * request is canceled.
       *
       * @param menu {qx.ui.menu.Menu} The menu to cancel for open
       */
      cancelOpen: function cancelOpen(menu) {
        if (this.__scheduleOpen == menu) {
          // menu.debug("Cancel open");
          this.__openTimer.stop();

          this.__scheduleOpen = null;
        }
      },

      /**
       * When the given menu is scheduled for close this pending
       * request is canceled.
       *
       * @param menu {qx.ui.menu.Menu} The menu to cancel for close
       */
      cancelClose: function cancelClose(menu) {
        if (this.__scheduleClose == menu) {
          // menu.debug("Cancel close");
          this.__closeTimer.stop();

          this.__scheduleClose = null;
        }
      },

      /*
      ---------------------------------------------------------------------------
        TIMER EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for a pending open request. Configured to the interval
       * of the current menu to open.
       *
       * @param e {qx.event.type.Event} Interval event
       */
      _onOpenInterval: function _onOpenInterval(e) {
        // Stop timer
        this.__openTimer.stop(); // Open menu and reset flag


        this.__scheduleOpen.open();

        this.__scheduleOpen = null;
      },

      /**
       * Event listener for a pending close request. Configured to the interval
       * of the current menu to close.
       *
       * @param e {qx.event.type.Event} Interval event
       */
      _onCloseInterval: function _onCloseInterval(e) {
        // Stop timer, reset scheduling flag
        this.__closeTimer.stop(); // Close menu and reset flag


        this.__scheduleClose.exclude();

        this.__scheduleClose = null;
      },

      /*
      ---------------------------------------------------------------------------
        CONTEXTMENU EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Internal function registers a handler to stop next
       * <code>contextmenu</code> event.
       * This function will be called by {@link qx.ui.menu.Button#_onTap}, if
       * right click was pressed.
       *
       * @internal
       */
      preventContextMenuOnce: function preventContextMenuOnce() {
        qx.event.Registration.addListener(document.body, "contextmenu", this.__onPreventContextMenu, this, true);
      },

      /**
       * Internal event handler to stop <code>contextmenu</code> event bubbling,
       * if target is inside the opened menu.
       *
       * @param e {qx.event.type.Mouse} contextmenu event
       *
       * @internal
       */
      __onPreventContextMenu: function __onPreventContextMenu(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true);

        if (this._isInMenu(target)) {
          e.stopPropagation();
          e.preventDefault();
        } // stop only once


        qx.event.Registration.removeListener(document.body, "contextmenu", this.__onPreventContextMenu, this, true);
      },

      /*
      ---------------------------------------------------------------------------
        POINTER EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for pointerdown events
       *
       * @param e {qx.event.type.Pointer} pointerdown event
       */
      _onPointerDown: function _onPointerDown(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true); // If the target is 'null' the tap appears on a DOM element witch is not
        // a widget. This happens normally with an inline application, when the user
        // taps not in the inline application. In this case all all currently
        // open menus should be closed.

        if (target == null) {
          this.hideAll();
          return;
        } // If the target is the one which has opened the current menu
        // we ignore the pointerdown to let the button process the event
        // further with toggling or ignoring the tap.


        if (target.getMenu && target.getMenu() && target.getMenu().isVisible()) {
          return;
        } // All taps not inside a menu will hide all currently open menus


        if (this.__objects.length > 0 && !this._isInMenu(target)) {
          this.hideAll();
        }
      },

      /*
      ---------------------------------------------------------------------------
        KEY EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} Map of all keys working on an active menu selection
       * @lint ignoreReferenceField(__selectionKeys)
       */
      __selectionKeys: {
        "Enter": 1,
        "Space": 1
      },

      /**
       * @type {Map} Map of all keys working without a selection
       * @lint ignoreReferenceField(__navigationKeys)
       */
      __navigationKeys: {
        "Escape": 1,
        "Up": 1,
        "Down": 1,
        "Left": 1,
        "Right": 1
      },

      /**
       * Event handler for all keyup/keydown events. Stops all events
       * when any menu is opened.
       *
       * @param e {qx.event.type.KeySequence} Keyboard event
       */
      _onKeyUpDown: function _onKeyUpDown(e) {
        var menu = this.getActiveMenu();

        if (!menu) {
          return;
        } // Stop for all supported key combos


        var iden = e.getKeyIdentifier();

        if (this.__navigationKeys[iden] || this.__selectionKeys[iden] && menu.getSelectedButton()) {
          e.stopPropagation();
        }
      },

      /**
       * Event handler for all keypress events. Delegates the event to the more
       * specific methods defined in this class.
       *
       * Currently processes the keys: <code>Up</code>, <code>Down</code>,
       * <code>Left</code>, <code>Right</code> and <code>Enter</code>.
       *
       * @param e {qx.event.type.KeySequence} Keyboard event
       */
      _onKeyPress: function _onKeyPress(e) {
        var menu = this.getActiveMenu();

        if (!menu) {
          return;
        }

        var iden = e.getKeyIdentifier();
        var navigation = this.__navigationKeys[iden];
        var selection = this.__selectionKeys[iden];

        if (navigation) {
          switch (iden) {
            case "Up":
              this._onKeyPressUp(menu);

              break;

            case "Down":
              this._onKeyPressDown(menu);

              break;

            case "Left":
              this._onKeyPressLeft(menu);

              break;

            case "Right":
              this._onKeyPressRight(menu);

              break;

            case "Escape":
              this.hideAll();
              break;
          }

          e.stopPropagation();
          e.preventDefault();
        } else if (selection) {
          // Do not process these events when no item is hovered
          var button = menu.getSelectedButton();

          if (button) {
            switch (iden) {
              case "Enter":
                this._onKeyPressEnter(menu, button, e);

                break;

              case "Space":
                this._onKeyPressSpace(menu, button, e);

                break;
            }

            e.stopPropagation();
            e.preventDefault();
          }
        }
      },

      /**
       * Event handler for <code>Up</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressUp: function _onKeyPressUp(menu) {
        // Query for previous child
        var selectedButton = menu.getSelectedButton();
        var children = menu.getChildren();
        var start = selectedButton ? menu.indexOf(selectedButton) - 1 : children.length - 1;

        var nextItem = this._getChild(menu, start, -1, true); // Reconfigure property


        if (nextItem) {
          menu.setSelectedButton(nextItem);
        } else {
          menu.resetSelectedButton();
        }
      },

      /**
       * Event handler for <code>Down</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressDown: function _onKeyPressDown(menu) {
        // Query for next child
        var selectedButton = menu.getSelectedButton();
        var start = selectedButton ? menu.indexOf(selectedButton) + 1 : 0;

        var nextItem = this._getChild(menu, start, 1, true); // Reconfigure property


        if (nextItem) {
          menu.setSelectedButton(nextItem);
        } else {
          menu.resetSelectedButton();
        }
      },

      /**
       * Event handler for <code>Left</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressLeft: function _onKeyPressLeft(menu) {
        var menuOpener = menu.getOpener();

        if (!menuOpener) {
          return;
        } // Back to the "parent" menu


        if (menuOpener instanceof qx.ui.menu.AbstractButton) {
          var parentMenu = menuOpener.getLayoutParent();
          parentMenu.resetOpenedButton();
          parentMenu.setSelectedButton(menuOpener);
        } // Goto the previous toolbar button
        else if (menuOpener instanceof qx.ui.menubar.Button) {
            var buttons = menuOpener.getMenuBar().getMenuButtons();
            var index = buttons.indexOf(menuOpener); // This should not happen, definitely!

            if (index === -1) {
              return;
            } // Get previous button, fallback to end if first arrived


            var prevButton = null;
            var length = buttons.length;

            for (var i = 1; i <= length; i++) {
              var button = buttons[(index - i + length) % length];

              if (button.isEnabled() && button.isVisible()) {
                prevButton = button;
                break;
              }
            }

            if (prevButton && prevButton != menuOpener) {
              prevButton.open(true);
            }
          }
      },

      /**
       * Event handler for <code>Right</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressRight: function _onKeyPressRight(menu) {
        var selectedButton = menu.getSelectedButton(); // Open sub-menu of hovered item and select first child

        if (selectedButton) {
          var subMenu = selectedButton.getMenu();

          if (subMenu) {
            // Open previously hovered item
            menu.setOpenedButton(selectedButton); // Hover first item in new submenu

            var first = this._getChild(subMenu, 0, 1);

            if (first) {
              subMenu.setSelectedButton(first);
            }

            return;
          }
        } // No hover and no open item
        // When first button has a menu, open it, otherwise only hover it
        else if (!menu.getOpenedButton()) {
            var first = this._getChild(menu, 0, 1);

            if (first) {
              menu.setSelectedButton(first);

              if (first.getMenu()) {
                menu.setOpenedButton(first);
              }

              return;
            }
          } // Jump to the next toolbar button


        var menuOpener = menu.getOpener(); // Look up opener hierarchy for menu button

        if (menuOpener instanceof qx.ui.menu.Button && selectedButton) {
          // From one inner selected button try to find the top level
          // menu button which has opened the whole menu chain.
          while (menuOpener) {
            menuOpener = menuOpener.getLayoutParent();

            if (menuOpener instanceof qx.ui.menu.Menu) {
              menuOpener = menuOpener.getOpener();

              if (menuOpener instanceof qx.ui.menubar.Button) {
                break;
              }
            } else {
              break;
            }
          }

          if (!menuOpener) {
            return;
          }
        } // Ask the toolbar for the next menu button


        if (menuOpener instanceof qx.ui.menubar.Button) {
          var buttons = menuOpener.getMenuBar().getMenuButtons();
          var index = buttons.indexOf(menuOpener); // This should not happen, definitely!

          if (index === -1) {
            return;
          } // Get next button, fallback to first if end arrived


          var nextButton = null;
          var length = buttons.length;

          for (var i = 1; i <= length; i++) {
            var button = buttons[(index + i) % length];

            if (button.isEnabled() && button.isVisible()) {
              nextButton = button;
              break;
            }
          }

          if (nextButton && nextButton != menuOpener) {
            nextButton.open(true);
          }
        }
      },

      /**
       * Event handler for <code>Enter</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       * @param button {qx.ui.menu.AbstractButton} The selected button
       * @param e {qx.event.type.KeySequence} The keypress event
       */
      _onKeyPressEnter: function _onKeyPressEnter(menu, button, e) {
        // Route keypress event to the selected button
        if (button.hasListener("keypress")) {
          // Clone and reconfigure event
          var clone = e.clone();
          clone.setBubbles(false);
          clone.setTarget(button); // Finally dispatch the clone

          button.dispatchEvent(clone);
        } // Hide all open menus


        this.hideAll();
      },

      /**
       * Event handler for <code>Space</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       * @param button {qx.ui.menu.AbstractButton} The selected button
       * @param e {qx.event.type.KeySequence} The keypress event
       */
      _onKeyPressSpace: function _onKeyPressSpace(menu, button, e) {
        // Route keypress event to the selected button
        if (button.hasListener("keypress")) {
          // Clone and reconfigure event
          var clone = e.clone();
          clone.setBubbles(false);
          clone.setTarget(button); // Finally dispatch the clone

          button.dispatchEvent(clone);
        }
      },

      /**
       * Event handler for roll which hides all windows on scroll.
       *
       * @param e {qx.event.type.Roll} The roll event.
       */
      _onRoll: function _onRoll(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true);

        if (this.__objects.length > 0 && !this._isInMenu(target) && !this._isMenuOpener(target) && !e.getMomentum()) {
          this.hideAll();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      var Registration = qx.event.Registration;
      var el = document.body; // React on pointerdown events

      Registration.removeListener(window.document.documentElement, "pointerdown", this._onPointerDown, this, true); // React on keypress events

      Registration.removeListener(el, "keydown", this._onKeyUpDown, this, true);
      Registration.removeListener(el, "keyup", this._onKeyUpDown, this, true);
      Registration.removeListener(el, "keypress", this._onKeyPress, this, true);

      this._disposeObjects("__openTimer", "__closeTimer");

      this._disposeArray("__objects");
    }
  });
  qx.ui.menu.Manager.$$dbClassInfo = $$dbClassInfo;
})();

//
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
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.core.MRemoteLayoutHandling": {
        "require": true
      },
      "qx.ui.form.RepeatButton": {},
      "qx.ui.container.Composite": {},
      "qx.ui.core.scroll.ScrollPane": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.layout.VBox": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * Container, which provides scrolling in one dimension (vertical or horizontal).
   *
   * @childControl button-forward {qx.ui.form.RepeatButton} button to step forward
   * @childControl button-backward {qx.ui.form.RepeatButton} button to step backward
   * @childControl content {qx.ui.container.Composite} container to hold the content
   * @childControl scrollpane {qx.ui.core.scroll.ScrollPane} the scroll pane holds the content to enable scrolling
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create slide bar container
   *   slideBar = new qx.ui.container.SlideBar().set({
   *     width: 300
   *   });
   *
   *   // set layout
   *   slideBar.setLayout(new qx.ui.layout.HBox());
   *
   *   // add some widgets
   *   for (var i=0; i<10; i++)
   *   {
   *     slideBar.add((new qx.ui.core.Widget()).set({
   *       backgroundColor : (i % 2 == 0) ? "red" : "blue",
   *       width : 60
   *     }));
   *   }
   *
   *   this.getRoot().add(slideBar);
   * </pre>
   *
   * This example creates a SlideBar and add some widgets with alternating
   * background colors. Since the content is larger than the container, two
   * scroll buttons at the left and the right edge are shown.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/slidebar.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.SlideBar", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MRemoteLayoutHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param orientation {String?"horizontal"} The slide bar orientation
     */
    construct: function construct(orientation) {
      qx.ui.core.Widget.constructor.call(this);
      var scrollPane = this.getChildControl("scrollpane");

      this._add(scrollPane, {
        flex: 1
      });

      if (orientation != null) {
        this.setOrientation(orientation);
      } else {
        this.initOrientation();
      }

      this.addListener("roll", this._onRoll, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "slidebar"
      },

      /** Orientation of the bar */
      orientation: {
        check: ["horizontal", "vertical"],
        init: "horizontal",
        apply: "_applyOrientation"
      },

      /** The number of pixels to scroll if the buttons are pressed */
      scrollStep: {
        check: "Integer",
        init: 15,
        themeable: true
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired on scroll animation end invoked by 'scroll*' methods. */
      scrollAnimationEnd: "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("content");
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "button-forward":
            control = new qx.ui.form.RepeatButton();
            control.addListener("execute", this._onExecuteForward, this);
            control.setFocusable(false);

            this._addAt(control, 2);

            break;

          case "button-backward":
            control = new qx.ui.form.RepeatButton();
            control.addListener("execute", this._onExecuteBackward, this);
            control.setFocusable(false);

            this._addAt(control, 0);

            break;

          case "content":
            control = new qx.ui.container.Composite();
            this.getChildControl("scrollpane").add(control);
            break;

          case "scrollpane":
            control = new qx.ui.core.scroll.ScrollPane();
            control.addListener("update", this._onResize, this);
            control.addListener("scrollX", this._onScroll, this);
            control.addListener("scrollY", this._onScroll, this);
            control.addListener("scrollAnimationEnd", this._onScrollAnimationEnd, this);
            break;
        }

        return control || qx.ui.container.SlideBar.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        barLeft: true,
        barTop: true,
        barRight: true,
        barBottom: true
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC SCROLL API
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls the element's content by the given amount.
       *
       * @param offset {Integer?0} Amount to scroll
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollBy: function scrollBy(offset, duration) {
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          pane.scrollByX(offset, duration);
        } else {
          pane.scrollByY(offset, duration);
        }
      },

      /**
       * Scrolls the element's content to the given coordinate
       *
       * @param value {Integer} The position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollTo: function scrollTo(value, duration) {
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          pane.scrollToX(value, duration);
        } else {
          pane.scrollToY(value, duration);
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyEnabled: function _applyEnabled(value, old, name) {
        qx.ui.container.SlideBar.prototype._applyEnabled.base.call(this, value, old, name);

        this._updateArrowsEnabled();
      },
      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        var oldLayouts = [this.getLayout(), this._getLayout()];
        var buttonForward = this.getChildControl("button-forward");
        var buttonBackward = this.getChildControl("button-backward"); // old can also be null, so we have to check both explicitly to set
        // the states correctly.

        if (old == "vertical" && value == "horizontal") {
          buttonForward.removeState("vertical");
          buttonBackward.removeState("vertical");
          buttonForward.addState("horizontal");
          buttonBackward.addState("horizontal");
        } else if (old == "horizontal" && value == "vertical") {
          buttonForward.removeState("horizontal");
          buttonBackward.removeState("horizontal");
          buttonForward.addState("vertical");
          buttonBackward.addState("vertical");
        }

        if (value == "horizontal") {
          this._setLayout(new qx.ui.layout.HBox());

          this.setLayout(new qx.ui.layout.HBox());
        } else {
          this._setLayout(new qx.ui.layout.VBox());

          this.setLayout(new qx.ui.layout.VBox());
        }

        if (oldLayouts[0]) {
          oldLayouts[0].dispose();
        }

        if (oldLayouts[1]) {
          oldLayouts[1].dispose();
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls pane on roll events
       *
       * @param e {qx.event.type.Roll} the roll event
       */
      _onRoll: function _onRoll(e) {
        // only wheel and touch
        if (e.getPointerType() == "mouse") {
          return;
        }

        var delta = 0;
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          delta = e.getDelta().x;
          var position = pane.getScrollX();
          var max = pane.getScrollMaxX();
          var steps = parseInt(delta); // pass the event to the parent if both scrollbars are at the end

          if (!(steps < 0 && position <= 0 || steps > 0 && position >= max || delta == 0)) {
            e.stop();
          } else {
            e.stopMomentum();
          }
        } else {
          delta = e.getDelta().y;
          var position = pane.getScrollY();
          var max = pane.getScrollMaxY();
          var steps = parseInt(delta); // pass the event to the parent if both scrollbars are at the end

          if (!(steps < 0 && position <= 0 || steps > 0 && position >= max || delta == 0)) {
            e.stop();
          } else {
            e.stopMomentum();
          }
        }

        this.scrollBy(parseInt(delta, 10)); // block all momentum scrolling

        if (e.getMomentum()) {
          e.stop();
        }
      },

      /**
       * Update arrow enabled state after scrolling
       */
      _onScroll: function _onScroll() {
        this._updateArrowsEnabled();
      },

      /**
       * Handler to fire the 'scrollAnimationEnd' event.
       */
      _onScrollAnimationEnd: function _onScrollAnimationEnd() {
        this.fireEvent("scrollAnimationEnd");
      },

      /**
       * Listener for resize event. This event is fired after the
       * first flush of the element which leads to another queuing
       * when the changes modify the visibility of the scroll buttons.
       *
       * @param e {Event} Event object
       */
      _onResize: function _onResize(e) {
        var content = this.getChildControl("scrollpane").getChildren()[0];

        if (!content) {
          return;
        }

        var innerSize = this.getInnerSize();
        var contentSize = content.getBounds();
        var overflow = this.getOrientation() === "horizontal" ? contentSize.width > innerSize.width : contentSize.height > innerSize.height;

        if (overflow) {
          this._showArrows();

          this._updateArrowsEnabled();
        } else {
          this._hideArrows();
        }
      },

      /**
       * Scroll handler for left scrolling
       *
       */
      _onExecuteBackward: function _onExecuteBackward() {
        this.scrollBy(-this.getScrollStep());
      },

      /**
       * Scroll handler for right scrolling
       *
       */
      _onExecuteForward: function _onExecuteForward() {
        this.scrollBy(this.getScrollStep());
      },

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Update arrow enabled state
       */
      _updateArrowsEnabled: function _updateArrowsEnabled() {
        // set the disables state directly because we are overriding the
        // inheritance
        if (!this.getEnabled()) {
          this.getChildControl("button-backward").setEnabled(false);
          this.getChildControl("button-forward").setEnabled(false);
          return;
        }

        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          var position = pane.getScrollX();
          var max = pane.getScrollMaxX();
        } else {
          var position = pane.getScrollY();
          var max = pane.getScrollMaxY();
        }

        this.getChildControl("button-backward").setEnabled(position > 0);
        this.getChildControl("button-forward").setEnabled(position < max);
      },

      /**
       * Show the arrows (Called from resize event)
       *
       */
      _showArrows: function _showArrows() {
        this._showChildControl("button-forward");

        this._showChildControl("button-backward");
      },

      /**
       * Hide the arrows (Called from resize event)
       *
       */
      _hideArrows: function _hideArrows() {
        this._excludeChildControl("button-forward");

        this._excludeChildControl("button-backward");

        this.scrollTo(0);
      }
    }
  });
  qx.ui.container.SlideBar.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.SlideBar": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.HoverButton": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The MenuSlideBar is used to scroll menus if they don't fit on the screen.
   *
   * @childControl button-forward {qx.ui.form.HoverButton} scrolls forward of hovered
   * @childControl button-backward {qx.ui.form.HoverButton} scrolls backward if hovered
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.MenuSlideBar", {
    extend: qx.ui.container.SlideBar,
    construct: function construct() {
      qx.ui.container.SlideBar.constructor.call(this, "vertical");
    },
    properties: {
      appearance: {
        refine: true,
        init: "menu-slidebar"
      }
    },
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "button-forward":
            control = new qx.ui.form.HoverButton();
            control.addListener("execute", this._onExecuteForward, this);

            this._addAt(control, 2);

            break;

          case "button-backward":
            control = new qx.ui.form.HoverButton();
            control.addListener("execute", this._onExecuteBackward, this);

            this._addAt(control, 0);

            break;
        }

        return control || qx.ui.menu.MenuSlideBar.prototype._createChildControlImpl.base.call(this, id);
      }
    }
  });
  qx.ui.menu.MenuSlideBar.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.lang.Type": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * Wrapper object for a method containing unit test code.
   */
  qx.Class.define("qx.dev.unit.TestFunction", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * There are two ways to define a test function. First by passing a class
     * and a method name to the constructor or second by giving a the method
     * directly.
     *
     * @param testCase {qx.dev.unit.TestCase?null} The test class, which contains the test method
     * @param methodName {String?null} The name of the method
     * @param testFunction {Function?null} A reference to a test function. If this
     *    parameter is set the other parameters are ignored.
     */
    construct: function construct(testCase, methodName, testFunction) {
      if (testFunction) {
        this.setTestFunction(testFunction);
      }

      if (testCase) {
        this.setClassName(testCase.classname);
        this.setTestClass(testCase);
      }

      this.setName(methodName);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The test function */
      testFunction: {
        check: "Function"
      },

      /** Name of the test */
      name: {
        check: "String"
      },

      /** Name of the class containing the test */
      className: {
        check: "String",
        init: ""
      },

      /** The test class */
      testClass: {
        check: "qx.dev.unit.TestCase",
        init: null
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Runs the test and logs the test result to a {@link TestResult} instance,
       *
       * @param testResult {qx.dev.unit.TestResult} The class used to log the test result.
       */
      run: function run(testResult) {
        var inst = this.getTestClass();
        var method = this.getName();
        inst.set({
          testFunc: this,
          testResult: testResult
        });
        testResult.run(this, function () {
          switch (inst[method].constructor.name) {
            case "Function":
              try {
                inst[method]();
              } catch (ex) {
                throw ex;
              }

              break;

            case "AsyncFunction":
              inst[method]().then(function () {
                inst.resume();
              })["catch"](function (ex) {
                inst.resume(function () {
                  throw ex;
                });
              });
              inst.wait();
          }
        });
      },

      /**
       * Call the test class' <code>setUp</code> method.
       */
      setUp: function setUp() {
        var inst = this.getTestClass();

        if (qx.lang.Type.isFunction(inst.setUp)) {
          inst.setUp();
        }
      },

      /**
       * Call the test class' <code>tearDown</code> method.
       */
      tearDown: function tearDown() {
        var inst = this.getTestClass();

        if (qx.lang.Type.isFunction(inst.tearDown)) {
          inst.tearDown();
        }
      },

      /**
       * Get the full name of the test.
       *
       * @return {String} The test's full name
       */
      getFullName: function getFullName() {
        return [this.getClassName(), this.getName()].join(":");
      }
    }
  });
  qx.dev.unit.TestFunction.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "construct": true,
        "require": true
      },
      "qx.dev.unit.AbstractTestSuite": {
        "construct": true,
        "require": true
      },
      "qx.dev.unit.TestCase": {
        "construct": true
      },
      "qx.lang.Type": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class represents a test suite for an unit test class.
   *
   * To create your own unit tests, create a class that derives from this one, and
   * add member methods that start with "test*". You can use assertion methods
   * inherited from *TestClass* to ease the implementation process.
   *
   * A simple example:
   * <pre class='javascript'>
   * qx. Class.define("myapp.test.MyUnitTest"),
   * {
   *   extend  : qx.dev.unit.TestCase,
   *
   *   members :
   *   {
   *     testMe : function ()
   *     {
   *       // 'assertEquals' is from the parent
   *       this.assertEquals(4, 3+1, "failure message");
   *     }
   *   }
   * }
   * </pre>
   */
  qx.Class.define("qx.dev.unit.TestClass", {
    extend: qx.dev.unit.AbstractTestSuite,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param clazz {Class} Test class. Must be a sub class of {@link TestCase}.
     */
    construct: function construct(clazz) {
      qx.dev.unit.AbstractTestSuite.constructor.call(this);

      if (!clazz) {
        this.addFail("existsCheck", "Unknown test class!");
        return;
      }

      if (!qx.Class.isSubClassOf(clazz, qx.dev.unit.TestCase)) {
        this.addFail("Sub class check.", "The test class '" + clazz.classname + "'is not a sub class of 'qx.dev.unit.TestCase'");
        return;
      }

      var proto = clazz.prototype;
      var testCase = new clazz();

      for (var test in proto) {
        if (qx.lang.Type.isFunctionOrAsyncFunction(proto[test]) && test.indexOf("test") == 0) {
          this.addTestMethod(testCase, test);
        }
      }

      this.setName(clazz.classname);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Name of the test suite */
      name: {
        check: "String"
      }
    }
  });
  qx.dev.unit.TestClass.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Atom": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MExecutable": {
        "require": true
      },
      "qx.ui.form.IExecutable": {
        "require": true
      },
      "qx.event.AcceleratingTimer": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The HoverButton is an {@link qx.ui.basic.Atom}, which fires repeatedly
   * execute events while the pointer is over the widget.
   *
   * The rate at which the execute event is fired accelerates is the pointer keeps
   * inside of the widget. The initial delay and the interval time can be set using
   * the properties {@link #firstInterval} and {@link #interval}. The
   * {@link #execute} events will be fired in a shorter amount of time if the pointer
   * remains over the widget, until the min {@link #minTimer} is reached.
   * The {@link #timerDecrease} property sets the amount of milliseconds which will
   * decreased after every firing.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.HoverButton("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button is hovered");
   *   }, this);
   *
   *   this.getRoot.add(button);
   * </pre>
   *
   * This example creates a button with the label "Hello World" and attaches an
   * event listener to the {@link #execute} event.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/hoverbutton.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.HoverButton", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     */
    construct: function construct(label, icon) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);
      this.addListener("pointerover", this._onPointerOver, this);
      this.addListener("pointerout", this._onPointerOut, this);
      this.__timer = new qx.event.AcceleratingTimer();

      this.__timer.addListener("interval", this._onInterval, this);
    },
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "hover-button"
      },

      /**
       * Interval used after the first run of the timer. Usually a smaller value
       * than the "firstInterval" property value to get a faster reaction.
       */
      interval: {
        check: "Integer",
        init: 80
      },

      /**
       * Interval used for the first run of the timer. Usually a greater value
       * than the "interval" property value to a little delayed reaction at the first
       * time.
       */
      firstInterval: {
        check: "Integer",
        init: 200
      },

      /** This configures the minimum value for the timer interval. */
      minTimer: {
        check: "Integer",
        init: 20
      },

      /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
      timerDecrease: {
        check: "Integer",
        init: 2
      }
    },
    members: {
      __timer: null,

      /**
       * Start timer on pointer over
       *
       * @param e {qx.event.type.Pointer} The pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        this.__timer.set({
          interval: this.getInterval(),
          firstInterval: this.getFirstInterval(),
          minimum: this.getMinTimer(),
          decrease: this.getTimerDecrease()
        }).start();

        this.addState("hovered");
      },

      /**
       * Stop timer on pointer out
       *
       * @param e {qx.event.type.Pointer} The pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        this.__timer.stop();

        this.removeState("hovered");

        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }
      },

      /**
       * Fire execute event on timer interval event
       */
      _onInterval: function _onInterval() {
        if (this.isEnabled()) {
          this.execute();
        } else {
          this.__timer.stop();
        }
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__timer");
    }
  });
  qx.ui.form.HoverButton.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-31.js.map
