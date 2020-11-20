(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
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
       2008-2010 Sebastian Werner, http://sebastian-werner.net
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Andreas Ecker (ecker)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Sizzle CSS Selector Engine - v2.3.0
  
       Homepage:
         http://sizzlejs.com/
  
       Documentation:
         https://github.com/jquery/sizzle/wiki/Sizzle-Documentation
  
       Discussion:
         https://groups.google.com/forum/#!forum/sizzlejs
  
       Code:
         https://github.com/jquery/sizzle
  
       Copyright:
         (c) 2009, 2013 jQuery Foundation and other contributors
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
     ----------------------------------------------------------------------
  
      Copyright 2013 jQuery Foundation and other contributors
      http://jquery.com/
  
      Permission is hereby granted, free of charge, to any person obtaining
      a copy of this software and associated documentation files (the
      "Software"), to deal in the Software without restriction, including
      without limitation the rights to use, copy, modify, merge, publish,
      distribute, sublicense, and/or sell copies of the Software, and to
      permit persons to whom the Software is furnished to do so, subject to
      the following conditions:
  
      The above copyright notice and this permission notice shall be
      included in all copies or substantial portions of the Software.
  
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
      EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
      NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
      LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
      OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
      WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  
     ----------------------------------------------------------------------
  
      Version:
         v2.3.0
         commit  8d56cba3212f6722a0b47330143d329d7297277e
  
  ************************************************************************ */

  /**
   * The selector engine supports virtually all CSS 3 Selectors  – this even
   * includes some parts that are infrequently implemented such as escaped
   * selectors (<code>.foo\\+bar</code>), Unicode selectors, and results returned
   * in document order. There are a few notable exceptions to the CSS 3 selector
   * support:
   *
   * * <code>:root</code>
   * * <code>:target</code>
   * * <code>:nth-last-child</code>
   * * <code>:nth-of-type</code>
   * * <code>:nth-last-of-type</code>
   * * <code>:first-of-type</code>
   * * <code>:last-of-type</code>
   * * <code>:only-of-type</code>
   * * <code>:lang()</code>
   *
   * In addition to the CSS 3 Selectors the engine supports the following
   * additional selectors or conventions.
   *
   * *Changes*
   *
   * * <code>:not(a.b)</code>: Supports non-simple selectors in <code>:not()</code> (most browsers only support <code>:not(a)</code>, for example).
   * * <code>:not(div > p)</code>: Supports full selectors in <code>:not()</code>.
   * * <code>:not(div, p)</code>: Supports multiple selectors in <code>:not()</code>.
   * * <code>[NAME=VALUE]</code>: Doesn't require quotes around the specified value in an attribute selector.
   *
   * *Additions*
   *
   * * <code>[NAME!=VALUE]</code>: Finds all elements whose <code>NAME</code> attribute doesn't match the specified value. Is equivalent to doing <code>:not([NAME=VALUE])</code>.
   * * <code>:contains(TEXT)</code>: Finds all elements whose textual context contains the word <code>TEXT</code> (case sensitive).
   * * <code>:header</code>: Finds all elements that are a header element (h1, h2, h3, h4, h5, h6).
   * * <code>:parent</code>: Finds all elements that contains another element.
   *
   * *Positional Selector Additions*
   *
   * * <code>:first</code>/</code>:last</code>: Finds the first or last matching element on the page. (e.g. <code>div:first</code> would find the first div on the page, in document order)
   * * <code>:even</code>/<code>:odd</code>: Finds every other element on the page (counting begins at 0, so <code>:even</code> would match the first element).
   * * <code>:eq</code>/<code>:nth</code>: Finds the Nth element on the page (e.g. <code>:eq(5)</code> finds the 6th element on the page).
   * * <code>:lt</code>/<code>:gt</code>: Finds all elements at positions less than or greater than the specified positions.
   *
   * *Form Selector Additions*
   *
   * * <code>:input</code>: Finds all input elements (includes textareas, selects, and buttons).
   * * <code>:text</code>, <code>:checkbox</code>, <code>:file</code>, <code>:password</code>, <code>:submit</code>, <code>:image</code>, <code>:reset</code>, <code>:button</code>: Finds the input element with the specified input type (<code>:button</code> also finds button elements).
   *
   * Based on Sizzle by John Resig, see:
   *
   * * http://sizzlejs.com/
   *
   * For further usage details also have a look at the wiki page at:
   *
   * * https://github.com/jquery/sizzle/wiki/Sizzle-Home
   */
  qx.Bootstrap.define("qx.bom.Selector", {
    statics: {
      /**
       * Queries the document for the given selector. Supports all CSS3 selectors
       * plus some extensions as mentioned in the class description.
       *
       * @signature function(selector, context)
       * @param selector {String} Valid selector (CSS3 + extensions)
       * @param context {Element} Context element (result elements must be children of this element)
       * @return {Array} Matching elements
       */
      query: null,

      /**
       * Returns an reduced array which only contains the elements from the given
       * array which matches the given selector
       *
       * @signature function(selector, set)
       * @param selector {String} Selector to filter given set
       * @param set {Array} List to filter according to given selector
       * @return {Array} New array containing matching elements
       */
      matches: null
    }
  });
  /**
   * Below is the original Sizzle code. Snapshot date is mentioned in the head of
   * this file.
   * @lint ignoreUnused(j, rnot, rendsWithNot)
   */

  /*!
   * Sizzle CSS Selector Engine v2.3.0
   * https://sizzlejs.com/
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license
   * http://jquery.org/license
   *
   * Date: 2016-01-04
   */

  (function (window) {
    var i,
        support,
        Expr,
        getText,
        isXML,
        tokenize,
        compile,
        select,
        outermostContext,
        sortInput,
        hasDuplicate,
        // Local document vars
    setDocument,
        document,
        docElem,
        documentIsHTML,
        rbuggyQSA,
        rbuggyMatches,
        matches,
        contains,
        // Instance-specific data
    expando = "sizzle" + 1 * new Date(),
        preferredDoc = window.document,
        dirruns = 0,
        done = 0,
        classCache = createCache(),
        tokenCache = createCache(),
        compilerCache = createCache(),
        sortOrder = function sortOrder(a, b) {
      if (a === b) {
        hasDuplicate = true;
      }

      return 0;
    },
        // Instance methods
    hasOwn = {}.hasOwnProperty,
        arr = [],
        pop = arr.pop,
        push_native = arr.push,
        push = arr.push,
        slice = arr.slice,
        // Use a stripped-down indexOf as it's faster than native
    // https://jsperf.com/thor-indexof-vs-for/5
    indexOf = function indexOf(list, elem) {
      var i = 0,
          len = list.length;

      for (; i < len; i++) {
        if (list[i] === elem) {
          return i;
        }
      }

      return -1;
    },
        booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
        // Regular expressions
    // http://www.w3.org/TR/css3-selectors/#whitespace
    whitespace = "[\\x20\\t\\r\\n\\f]",
        // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
    identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",
        // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
    attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + // Operator (capture 2)
    "*([*^$|!~]?=)" + whitespace + // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
    "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
        pseudos = ":(" + identifier + ")(?:\\((" + // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
    // 1. quoted (capture 3; capture 4 or capture 5)
    "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" + // 2. simple (capture 6)
    "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" + // 3. anything else (capture 2)
    ".*" + ")\\)|)",
        // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    rwhitespace = new RegExp(whitespace + "+", "g"),
        rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
        rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
        rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
        rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
        rpseudo = new RegExp(pseudos),
        ridentifier = new RegExp("^" + identifier + "$"),
        matchExpr = {
      "ID": new RegExp("^#(" + identifier + ")"),
      "CLASS": new RegExp("^\\.(" + identifier + ")"),
      "TAG": new RegExp("^(" + identifier + "|[*])"),
      "ATTR": new RegExp("^" + attributes),
      "PSEUDO": new RegExp("^" + pseudos),
      "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
      "bool": new RegExp("^(?:" + booleans + ")$", "i"),
      // For use in libraries implementing .is()
      // We use this for POS matching in `select`
      "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
    },
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,
        rnative = /^[^{]+\{\s*\[native \w/,
        // Easily-parseable/retrievable ID or TAG or CLASS selectors
    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
        rsibling = /[+~]/,
        // CSS escapes
    // http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
        funescape = function funescape(_, escaped, escapedWhitespace) {
      var high = "0x" + escaped - 0x10000; // NaN means non-codepoint
      // Support: Firefox<24
      // Workaround erroneous numeric interpretation of +"0x"

      return high !== high || escapedWhitespace ? escaped : high < 0 ? // BMP codepoint
      String.fromCharCode(high + 0x10000) : // Supplemental Plane codepoint (surrogate pair)
      String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    },
        // CSS string/identifier serialization
    // https://drafts.csswg.org/cssom/#common-serializing-idioms
    rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g,
        fcssescape = function fcssescape(ch, asCodePoint) {
      if (asCodePoint) {
        // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
        if (ch === "\0") {
          return "\uFFFD";
        } // Control characters and (dependent upon position) numbers get escaped as code points


        return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
      } // Other potentially-special ASCII characters get backslash-escaped


      return "\\" + ch;
    },
        // Used for iframes
    // See setDocument()
    // Removing the function wrapper causes a "Permission Denied"
    // error in IE
    unloadHandler = function unloadHandler() {
      setDocument();
    },
        disabledAncestor = addCombinator(function (elem) {
      return elem.disabled === true;
    }, {
      dir: "parentNode",
      next: "legend"
    }); // Optimize for push.apply( _, NodeList )


    try {
      push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes); // Support: Android<4.0
      // Detect silently failing push.apply

      arr[preferredDoc.childNodes.length].nodeType;
    } catch (e) {
      push = {
        apply: arr.length ? // Leverage slice if possible
        function (target, els) {
          push_native.apply(target, slice.call(els));
        } : // Support: IE<9
        // Otherwise append directly
        function (target, els) {
          var j = target.length,
              i = 0; // Can't trust NodeList.length

          while (target[j++] = els[i++]) {}

          target.length = j - 1;
        }
      };
    }

    function Sizzle(selector, context, results, seed) {
      var m,
          i,
          elem,
          nid,
          match,
          groups,
          newSelector,
          newContext = context && context.ownerDocument,
          // nodeType defaults to 9, since context defaults to document
      nodeType = context ? context.nodeType : 9;
      results = results || []; // Return early from calls with invalid selector or context

      if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
        return results;
      } // Try to shortcut find operations (as opposed to filters) in HTML documents


      if (!seed) {
        if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
          setDocument(context);
        }

        context = context || document;

        if (documentIsHTML) {
          // If the selector is sufficiently simple, try using a "get*By*" DOM method
          // (excepting DocumentFragment context, where the methods don't exist)
          if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
            // ID selector
            if (m = match[1]) {
              // Document context
              if (nodeType === 9) {
                if (elem = context.getElementById(m)) {
                  // Support: IE, Opera, Webkit
                  // TODO: identify versions
                  // getElementById can match elements by name instead of ID
                  if (elem.id === m) {
                    results.push(elem);
                    return results;
                  }
                } else {
                  return results;
                } // Element context

              } else {
                // Support: IE, Opera, Webkit
                // TODO: identify versions
                // getElementById can match elements by name instead of ID
                if (newContext && (elem = newContext.getElementById(m)) && contains(context, elem) && elem.id === m) {
                  results.push(elem);
                  return results;
                }
              } // Type selector

            } else if (match[2]) {
              push.apply(results, context.getElementsByTagName(selector));
              return results; // Class selector
            } else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
              push.apply(results, context.getElementsByClassName(m));
              return results;
            }
          } // Take advantage of querySelectorAll


          if (support.qsa && !compilerCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
            if (nodeType !== 1) {
              newContext = context;
              newSelector = selector; // qSA looks outside Element context, which is not what we want
              // Thanks to Andrew Dupont for this workaround technique
              // Support: IE <=8
              // Exclude object elements
            } else if (context.nodeName.toLowerCase() !== "object") {
              // Capture the context ID, setting it first if necessary
              if (nid = context.getAttribute("id")) {
                nid = nid.replace(rcssescape, fcssescape);
              } else {
                context.setAttribute("id", nid = expando);
              } // Prefix every selector in the list


              groups = tokenize(selector);
              i = groups.length;

              while (i--) {
                groups[i] = "#" + nid + " " + toSelector(groups[i]);
              }

              newSelector = groups.join(","); // Expand context for sibling selectors

              newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
            }

            if (newSelector) {
              try {
                push.apply(results, newContext.querySelectorAll(newSelector));
                return results;
              } catch (qsaError) {} finally {
                if (nid === expando) {
                  context.removeAttribute("id");
                }
              }
            }
          }
        }
      } // All others


      return select(selector.replace(rtrim, "$1"), context, results, seed);
    }
    /**
     * Create key-value caches of limited size
     * @return {function} Returns the Object data after storing it on itself with
     *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
     *	deleting the oldest entry
     */


    function createCache() {
      var keys = [];

      function cache(key, value) {
        // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
        if (keys.push(key + " ") > Expr.cacheLength) {
          // Only keep the most recent entries
          delete cache[keys.shift()];
        }

        return cache[key + " "] = value;
      }

      return cache;
    }
    /**
     * Mark a function for special use by Sizzle
     * @param fn {Function} The function to mark
     */


    function markFunction(fn) {
      fn[expando] = true;
      return fn;
    }
    /**
     * Support testing using an element
     * @param fn {Function} Passed the created element and returns a boolean result
     */


    function assert(fn) {
      var el = document.createElement("fieldset");

      try {
        return !!fn(el);
      } catch (e) {
        return false;
      } finally {
        // Remove from its parent by default
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        } // release memory in IE


        el = null;
      }
    }
    /**
     * Adds the same handler for all of the specified attrs
     * @param attrs {String} Pipe-separated list of attributes
     * @param handler {Function} The method that will be applied
     */


    function addHandle(attrs, handler) {
      var arr = attrs.split("|"),
          i = arr.length;

      while (i--) {
        Expr.attrHandle[arr[i]] = handler;
      }
    }
    /**
     * Checks document order of two siblings
     * @param a {Element}
     * @param b {Element}
     * @return {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
     */


    function siblingCheck(a, b) {
      var cur = b && a,
          diff = cur && a.nodeType === 1 && b.nodeType === 1 && a.sourceIndex - b.sourceIndex; // Use IE sourceIndex if available on both nodes

      if (diff) {
        return diff;
      } // Check if b follows a


      if (cur) {
        while (cur = cur.nextSibling) {
          if (cur === b) {
            return -1;
          }
        }
      }

      return a ? 1 : -1;
    }
    /**
     * Returns a function to use in pseudos for input types
     * @param type {String}
     */


    function createInputPseudo(type) {
      return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === type;
      };
    }
    /**
     * Returns a function to use in pseudos for buttons
     * @param type {String}
     */


    function createButtonPseudo(type) {
      return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && elem.type === type;
      };
    }
    /**
     * Returns a function to use in pseudos for :enabled/:disabled
     * @param disabled {Boolean} true for :disabled; false for :enabled
     */


    function createDisabledPseudo(disabled) {
      // Known :disabled false positives:
      // IE: *[disabled]:not(button, input, select, textarea, optgroup, option, menuitem, fieldset)
      // not IE: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
      return function (elem) {
        // Check form elements and option elements for explicit disabling
        return "label" in elem && elem.disabled === disabled || "form" in elem && elem.disabled === disabled || // Check non-disabled form elements for fieldset[disabled] ancestors
        "form" in elem && elem.disabled === false && ( // Support: IE6-11+
        // Ancestry is covered for us
        elem.isDisabled === disabled || // Otherwise, assume any non-<option> under fieldset[disabled] is disabled

        /* jshint -W018 */
        elem.isDisabled !== !disabled && ("label" in elem || !disabledAncestor(elem)) !== disabled);
      };
    }
    /**
     * Returns a function to use in pseudos for positionals
     * @param fn {Function}
     */


    function createPositionalPseudo(fn) {
      return markFunction(function (argument) {
        argument = +argument;
        return markFunction(function (seed, matches) {
          var j,
              matchIndexes = fn([], seed.length, argument),
              i = matchIndexes.length; // Match elements found at the specified indexes

          while (i--) {
            if (seed[j = matchIndexes[i]]) {
              seed[j] = !(matches[j] = seed[j]);
            }
          }
        });
      });
    }
    /**
     * Checks a node for validity as a Sizzle context
     * @param context {Element|Object}
     * @return {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
     */


    function testContext(context) {
      return context && typeof context.getElementsByTagName !== "undefined" && context;
    } // Expose support vars for convenience


    support = Sizzle.support = {};
    /**
     * Detects XML nodes
     * @param elem {Element|Object} An element or a document
     * @return {Boolean} True iff elem is a non-HTML XML node
     */

    isXML = Sizzle.isXML = function (elem) {
      // documentElement is verified for cases where it doesn't yet exist
      // (such as loading iframes in IE - #4833)
      var documentElement = elem && (elem.ownerDocument || elem).documentElement;
      return documentElement ? documentElement.nodeName !== "HTML" : false;
    };
    /**
     * Sets document-related variables once based on the current document
     * @param doc {Element|Object} An element or document object to use to set the document
     * @return {Object} Returns the current document
     */


    setDocument = Sizzle.setDocument = function (node) {
      var hasCompare,
          subWindow,
          doc = node ? node.ownerDocument || node : preferredDoc; // Return early if doc is invalid or already selected

      if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
        return document;
      } // Update global variables


      document = doc;
      docElem = document.documentElement;
      documentIsHTML = !isXML(document); // Support: IE 9-11, Edge
      // Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)

      if (preferredDoc !== document && (subWindow = document.defaultView) && subWindow.top !== subWindow) {
        // Support: IE 11, Edge
        if (subWindow.addEventListener) {
          subWindow.addEventListener("unload", unloadHandler, false); // Support: IE 9 - 10 only
        } else if (subWindow.attachEvent) {
          subWindow.attachEvent("onunload", unloadHandler);
        }
      }
      /* Attributes
      ---------------------------------------------------------------------- */
      // Support: IE<8
      // Verify that getAttribute really returns attributes and not properties
      // (excepting IE8 booleans)


      support.attributes = assert(function (el) {
        el.className = "i";
        return !el.getAttribute("className");
      });
      /* getElement(s)By*
      ---------------------------------------------------------------------- */
      // Check if getElementsByTagName("*") returns only elements

      support.getElementsByTagName = assert(function (el) {
        el.appendChild(document.createComment(""));
        return !el.getElementsByTagName("*").length;
      }); // Support: IE<9

      support.getElementsByClassName = rnative.test(document.getElementsByClassName); // Support: IE<10
      // Check if getElementById returns elements by name
      // The broken getElementById methods don't pick up programmatically-set names,
      // so use a roundabout getElementsByName test

      support.getById = assert(function (el) {
        docElem.appendChild(el).id = expando;
        return !document.getElementsByName || !document.getElementsByName(expando).length;
      }); // ID find and filter

      if (support.getById) {
        Expr.find["ID"] = function (id, context) {
          if (typeof context.getElementById !== "undefined" && documentIsHTML) {
            var m = context.getElementById(id);
            return m ? [m] : [];
          }
        };

        Expr.filter["ID"] = function (id) {
          var attrId = id.replace(runescape, funescape);
          return function (elem) {
            return elem.getAttribute("id") === attrId;
          };
        };
      } else {
        // Support: IE6/7
        // getElementById is not reliable as a find shortcut
        delete Expr.find["ID"];

        Expr.filter["ID"] = function (id) {
          var attrId = id.replace(runescape, funescape);
          return function (elem) {
            var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
            return node && node.value === attrId;
          };
        };
      } // Tag


      Expr.find["TAG"] = support.getElementsByTagName ? function (tag, context) {
        if (typeof context.getElementsByTagName !== "undefined") {
          return context.getElementsByTagName(tag); // DocumentFragment nodes don't have gEBTN
        } else if (support.qsa) {
          return context.querySelectorAll(tag);
        }
      } : function (tag, context) {
        var elem,
            tmp = [],
            i = 0,
            // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
        results = context.getElementsByTagName(tag); // Filter out possible comments

        if (tag === "*") {
          while (elem = results[i++]) {
            if (elem.nodeType === 1) {
              tmp.push(elem);
            }
          }

          return tmp;
        }

        return results;
      }; // Class

      Expr.find["CLASS"] = support.getElementsByClassName && function (className, context) {
        if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
          return context.getElementsByClassName(className);
        }
      };
      /* QSA/matchesSelector
      ---------------------------------------------------------------------- */
      // QSA and matchesSelector support
      // matchesSelector(:active) reports false when true (IE9/Opera 11.5)


      rbuggyMatches = []; // qSa(:focus) reports false when true (Chrome 21)
      // We allow this because of a bug in IE8/9 that throws an error
      // whenever `document.activeElement` is accessed on an iframe
      // So, we allow :focus to pass through QSA all the time to avoid the IE error
      // See https://bugs.jquery.com/ticket/13378

      rbuggyQSA = [];

      if (support.qsa = rnative.test(document.querySelectorAll)) {
        // Build QSA regex
        // Regex strategy adopted from Diego Perini
        assert(function (el) {
          // Select is set to empty string on purpose
          // This is to test IE's treatment of not explicitly
          // setting a boolean content attribute,
          // since its presence should be enough
          // https://bugs.jquery.com/ticket/12359
          docElem.appendChild(el).innerHTML = "<a id='" + expando + "'></a>" + "<select id='" + expando + "-\r\\' msallowcapture=''>" + "<option selected=''></option></select>"; // Support: IE8, Opera 11-12.16
          // Nothing should be selected when empty strings follow ^= or $= or *=
          // The test attribute must be unknown in Opera but "safe" for WinRT
          // https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section

          if (el.querySelectorAll("[msallowcapture^='']").length) {
            rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
          } // Support: IE8
          // Boolean attributes and "value" are not treated correctly


          if (!el.querySelectorAll("[selected]").length) {
            rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
          } // Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+


          if (!el.querySelectorAll("[id~=" + expando + "-]").length) {
            rbuggyQSA.push("~=");
          } // Webkit/Opera - :checked should return selected option elements
          // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
          // IE8 throws error here and will not see later tests


          if (!el.querySelectorAll(":checked").length) {
            rbuggyQSA.push(":checked");
          } // Support: Safari 8+, iOS 8+
          // https://bugs.webkit.org/show_bug.cgi?id=136851
          // In-page `selector#id sibling-combinator selector` fails


          if (!el.querySelectorAll("a#" + expando + "+*").length) {
            rbuggyQSA.push(".#.+[+~]");
          }
        });
        assert(function (el) {
          el.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>"; // Support: Windows 8 Native Apps
          // The type and name attributes are restricted during .innerHTML assignment

          var input = document.createElement("input");
          input.setAttribute("type", "hidden");
          el.appendChild(input).setAttribute("name", "D"); // Support: IE8
          // Enforce case-sensitivity of name attribute

          if (el.querySelectorAll("[name=d]").length) {
            rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
          } // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
          // IE8 throws error here and will not see later tests


          if (el.querySelectorAll(":enabled").length !== 2) {
            rbuggyQSA.push(":enabled", ":disabled");
          } // Support: IE9-11+
          // IE's :disabled selector does not pick up the children of disabled fieldsets


          docElem.appendChild(el).disabled = true;

          if (el.querySelectorAll(":disabled").length !== 2) {
            rbuggyQSA.push(":enabled", ":disabled");
          } // Opera 10-11 does not throw on post-comma invalid pseudos


          el.querySelectorAll("*,:x");
          rbuggyQSA.push(",.*:");
        });
      }

      if (support.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {
        assert(function (el) {
          // Check to see if it's possible to do matchesSelector
          // on a disconnected node (IE 9)
          support.disconnectedMatch = matches.call(el, "*"); // This should fail with an exception
          // Gecko does not error, returns false instead

          matches.call(el, "[s!='']:x");
          rbuggyMatches.push("!=", pseudos);
        });
      }

      rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
      rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
      /* Contains
      ---------------------------------------------------------------------- */

      hasCompare = rnative.test(docElem.compareDocumentPosition); // Element contains another
      // Purposefully self-exclusive
      // As in, an element does not contain itself

      contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
      } : function (a, b) {
        if (b) {
          while (b = b.parentNode) {
            if (b === a) {
              return true;
            }
          }
        }

        return false;
      };
      /* Sorting
      ---------------------------------------------------------------------- */
      // Document order sorting

      sortOrder = hasCompare ? function (a, b) {
        // Flag for duplicate removal
        if (a === b) {
          hasDuplicate = true;
          return 0;
        } // Sort on method existence if only one input has compareDocumentPosition


        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;

        if (compare) {
          return compare;
        } // Calculate position if both inputs belong to the same document


        compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : // Otherwise we know they are disconnected
        1; // Disconnected nodes

        if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {
          // Choose the first element that is related to our preferred document
          if (a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
            return -1;
          }

          if (b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
            return 1;
          } // Maintain original order


          return sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;
        }

        return compare & 4 ? -1 : 1;
      } : function (a, b) {
        // Exit early if the nodes are identical
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }

        var cur,
            i = 0,
            aup = a.parentNode,
            bup = b.parentNode,
            ap = [a],
            bp = [b]; // Parentless nodes are either documents or disconnected

        if (!aup || !bup) {
          return a === document ? -1 : b === document ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0; // If the nodes are siblings, we can do a quick check
        } else if (aup === bup) {
          return siblingCheck(a, b);
        } // Otherwise we need full lists of their ancestors for comparison


        cur = a;

        while (cur = cur.parentNode) {
          ap.unshift(cur);
        }

        cur = b;

        while (cur = cur.parentNode) {
          bp.unshift(cur);
        } // Walk down the tree looking for a discrepancy


        while (ap[i] === bp[i]) {
          i++;
        }

        return i ? // Do a sibling check if the nodes have a common ancestor
        siblingCheck(ap[i], bp[i]) : // Otherwise nodes in our document sort first
        ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
      };
      return document;
    };

    Sizzle.matches = function (expr, elements) {
      return Sizzle(expr, null, null, elements);
    };

    Sizzle.matchesSelector = function (elem, expr) {
      // Set document vars if needed
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem);
      } // Make sure that attribute selectors are quoted


      expr = expr.replace(rattributeQuotes, "='$1']");

      if (support.matchesSelector && documentIsHTML && !compilerCache[expr + " "] && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
        try {
          var ret = matches.call(elem, expr); // IE 9's matchesSelector returns false on disconnected nodes

          if (ret || support.disconnectedMatch || // As well, disconnected nodes are said to be in a document
          // fragment in IE 9
          elem.document && elem.document.nodeType !== 11) {
            return ret;
          }
        } catch (e) {}
      }

      return Sizzle(expr, document, null, [elem]).length > 0;
    };

    Sizzle.contains = function (context, elem) {
      // Set document vars if needed
      if ((context.ownerDocument || context) !== document) {
        setDocument(context);
      }

      return contains(context, elem);
    };

    Sizzle.attr = function (elem, name) {
      // Set document vars if needed
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem);
      }

      var fn = Expr.attrHandle[name.toLowerCase()],
          // Don't get fooled by Object.prototype properties (jQuery #13807)
      val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
      return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
    };

    Sizzle.escape = function (sel) {
      return (sel + "").replace(rcssescape, fcssescape);
    };

    Sizzle.error = function (msg) {
      throw new Error("Syntax error, unrecognized expression: " + msg);
    };
    /**
     * Document sorting and removing duplicates
     * @param results {ArrayLike}
     */


    Sizzle.uniqueSort = function (results) {
      var elem,
          duplicates = [],
          j = 0,
          i = 0; // Unless we *know* we can detect duplicates, assume their presence

      hasDuplicate = !support.detectDuplicates;
      sortInput = !support.sortStable && results.slice(0);
      results.sort(sortOrder);

      if (hasDuplicate) {
        while (elem = results[i++]) {
          if (elem === results[i]) {
            j = duplicates.push(i);
          }
        }

        while (j--) {
          results.splice(duplicates[j], 1);
        }
      } // Clear input after sorting to release objects
      // See https://github.com/jquery/sizzle/pull/225


      sortInput = null;
      return results;
    };
    /**
     * Utility function for retrieving the text value of an array of DOM nodes
     * @param elem {Array|Element}
     */


    getText = Sizzle.getText = function (elem) {
      var node,
          ret = "",
          i = 0,
          nodeType = elem.nodeType;

      if (!nodeType) {
        // If no nodeType, this is expected to be an array
        while (node = elem[i++]) {
          // Do not traverse comment nodes
          ret += getText(node);
        }
      } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (jQuery #11153)
        if (typeof elem.textContent === "string") {
          return elem.textContent;
        } else {
          // Traverse its children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem);
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
      } // Do not include comment or processing instruction nodes


      return ret;
    };

    Expr = Sizzle.selectors = {
      // Can be adjusted by the user
      cacheLength: 50,
      createPseudo: markFunction,
      match: matchExpr,
      attrHandle: {},
      find: {},
      relative: {
        ">": {
          dir: "parentNode",
          first: true
        },
        " ": {
          dir: "parentNode"
        },
        "+": {
          dir: "previousSibling",
          first: true
        },
        "~": {
          dir: "previousSibling"
        }
      },
      preFilter: {
        "ATTR": function ATTR(match) {
          match[1] = match[1].replace(runescape, funescape); // Move the given value to match[3] whether quoted or unquoted

          match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);

          if (match[2] === "~=") {
            match[3] = " " + match[3] + " ";
          }

          return match.slice(0, 4);
        },
        "CHILD": function CHILD(match) {
          /* matches from matchExpr["CHILD"]
          	1 type (only|nth|...)
          	2 what (child|of-type)
          	3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
          	4 xn-component of xn+y argument ([+-]?\d*n|)
          	5 sign of xn-component
          	6 x of xn-component
          	7 sign of y-component
          	8 y of y-component
          */
          match[1] = match[1].toLowerCase();

          if (match[1].slice(0, 3) === "nth") {
            // nth-* requires argument
            if (!match[3]) {
              Sizzle.error(match[0]);
            } // numeric x and y parameters for Expr.filter.CHILD
            // remember that false/true cast respectively to 0/1


            match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
            match[5] = +(match[7] + match[8] || match[3] === "odd"); // other types prohibit arguments
          } else if (match[3]) {
            Sizzle.error(match[0]);
          }

          return match;
        },
        "PSEUDO": function PSEUDO(match) {
          var excess,
              unquoted = !match[6] && match[2];

          if (matchExpr["CHILD"].test(match[0])) {
            return null;
          } // Accept quoted arguments as-is


          if (match[3]) {
            match[2] = match[4] || match[5] || ""; // Strip excess characters from unquoted arguments
          } else if (unquoted && rpseudo.test(unquoted) && ( // Get excess from tokenize (recursively)
          excess = tokenize(unquoted, true)) && ( // advance to the next closing parenthesis
          excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
            // excess is a negative index
            match[0] = match[0].slice(0, excess);
            match[2] = unquoted.slice(0, excess);
          } // Return only captures needed by the pseudo filter method (type and argument)


          return match.slice(0, 3);
        }
      },
      filter: {
        "TAG": function TAG(nodeNameSelector) {
          var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
          return nodeNameSelector === "*" ? function () {
            return true;
          } : function (elem) {
            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
          };
        },
        "CLASS": function CLASS(className) {
          var pattern = classCache[className + " "];
          return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function (elem) {
            return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
          });
        },
        "ATTR": function ATTR(name, operator, check) {
          return function (elem) {
            var result = Sizzle.attr(elem, name);

            if (result == null) {
              return operator === "!=";
            }

            if (!operator) {
              return true;
            }

            result += "";
            return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
          };
        },
        "CHILD": function CHILD(type, what, argument, first, last) {
          var simple = type.slice(0, 3) !== "nth",
              forward = type.slice(-4) !== "last",
              ofType = what === "of-type";
          return first === 1 && last === 0 ? // Shortcut for :nth-*(n)
          function (elem) {
            return !!elem.parentNode;
          } : function (elem, context, xml) {
            var cache,
                uniqueCache,
                outerCache,
                node,
                nodeIndex,
                start,
                dir = simple !== forward ? "nextSibling" : "previousSibling",
                parent = elem.parentNode,
                name = ofType && elem.nodeName.toLowerCase(),
                useCache = !xml && !ofType,
                diff = false;

            if (parent) {
              // :(first|last|only)-(child|of-type)
              if (simple) {
                while (dir) {
                  node = elem;

                  while (node = node[dir]) {
                    if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                      return false;
                    }
                  } // Reverse direction for :only-* (if we haven't yet done so)


                  start = dir = type === "only" && !start && "nextSibling";
                }

                return true;
              }

              start = [forward ? parent.firstChild : parent.lastChild]; // non-xml :nth-child(...) stores cache data on `parent`

              if (forward && useCache) {
                // Seek `elem` from a previously-cached index
                // ...in a gzip-friendly way
                node = parent;
                outerCache = node[expando] || (node[expando] = {}); // Support: IE <9 only
                // Defend against cloned attroperties (jQuery gh-1709)

                uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                cache = uniqueCache[type] || [];
                nodeIndex = cache[0] === dirruns && cache[1];
                diff = nodeIndex && cache[2];
                node = nodeIndex && parent.childNodes[nodeIndex];

                while (node = ++nodeIndex && node && node[dir] || ( // Fallback to seeking `elem` from the start
                diff = nodeIndex = 0) || start.pop()) {
                  // When found, cache indexes on `parent` and break
                  if (node.nodeType === 1 && ++diff && node === elem) {
                    uniqueCache[type] = [dirruns, nodeIndex, diff];
                    break;
                  }
                }
              } else {
                // Use previously-cached element index if available
                if (useCache) {
                  // ...in a gzip-friendly way
                  node = elem;
                  outerCache = node[expando] || (node[expando] = {}); // Support: IE <9 only
                  // Defend against cloned attroperties (jQuery gh-1709)

                  uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                  cache = uniqueCache[type] || [];
                  nodeIndex = cache[0] === dirruns && cache[1];
                  diff = nodeIndex;
                } // xml :nth-child(...)
                // or :nth-last-child(...) or :nth(-last)?-of-type(...)


                if (diff === false) {
                  // Use the same loop as above to seek `elem` from the start
                  while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                    if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                      // Cache the index of each encountered element
                      if (useCache) {
                        outerCache = node[expando] || (node[expando] = {}); // Support: IE <9 only
                        // Defend against cloned attroperties (jQuery gh-1709)

                        uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                        uniqueCache[type] = [dirruns, diff];
                      }

                      if (node === elem) {
                        break;
                      }
                    }
                  }
                }
              } // Incorporate the offset, then check against cycle size


              diff -= last;
              return diff === first || diff % first === 0 && diff / first >= 0;
            }
          };
        },
        "PSEUDO": function PSEUDO(pseudo, argument) {
          // pseudo-class names are case-insensitive
          // http://www.w3.org/TR/selectors/#pseudo-classes
          // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
          // Remember that setFilters inherits from pseudos
          var args,
              fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo); // The user may use createPseudo to indicate that
          // arguments are needed to create the filter function
          // just as Sizzle does

          if (fn[expando]) {
            return fn(argument);
          } // But maintain support for old signatures


          if (fn.length > 1) {
            args = [pseudo, pseudo, "", argument];
            return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
              var idx,
                  matched = fn(seed, argument),
                  i = matched.length;

              while (i--) {
                idx = indexOf(seed, matched[i]);
                seed[idx] = !(matches[idx] = matched[i]);
              }
            }) : function (elem) {
              return fn(elem, 0, args);
            };
          }

          return fn;
        }
      },
      pseudos: {
        // Potentially complex pseudos
        "not": markFunction(function (selector) {
          // Trim the selector passed to compile
          // to avoid treating leading and trailing
          // spaces as combinators
          var input = [],
              results = [],
              matcher = compile(selector.replace(rtrim, "$1"));
          return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
            var elem,
                unmatched = matcher(seed, null, xml, []),
                i = seed.length; // Match elements unmatched by `matcher`

            while (i--) {
              if (elem = unmatched[i]) {
                seed[i] = !(matches[i] = elem);
              }
            }
          }) : function (elem, context, xml) {
            input[0] = elem;
            matcher(input, null, xml, results); // Don't keep the element (issue #299)

            input[0] = null;
            return !results.pop();
          };
        }),
        "has": markFunction(function (selector) {
          return function (elem) {
            return Sizzle(selector, elem).length > 0;
          };
        }),
        "contains": markFunction(function (text) {
          text = text.replace(runescape, funescape);
          return function (elem) {
            return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
          };
        }),
        // "Whether an element is represented by a :lang() selector
        // is based solely on the element's language value
        // being equal to the identifier C,
        // or beginning with the identifier C immediately followed by "-".
        // The matching of C against the element's language value is performed case-insensitively.
        // The identifier C does not have to be a valid language name."
        // http://www.w3.org/TR/selectors/#lang-pseudo
        "lang": markFunction(function (lang) {
          // lang value must be a valid identifier
          if (!ridentifier.test(lang || "")) {
            Sizzle.error("unsupported lang: " + lang);
          }

          lang = lang.replace(runescape, funescape).toLowerCase();
          return function (elem) {
            var elemLang;

            do {
              if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                elemLang = elemLang.toLowerCase();
                return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
              }
            } while ((elem = elem.parentNode) && elem.nodeType === 1);

            return false;
          };
        }),
        // Miscellaneous
        "target": function target(elem) {
          var hash = window.location && window.location.hash;
          return hash && hash.slice(1) === elem.id;
        },
        "root": function root(elem) {
          return elem === docElem;
        },
        "focus": function focus(elem) {
          return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
        },
        // Boolean properties
        "enabled": createDisabledPseudo(false),
        "disabled": createDisabledPseudo(true),
        "checked": function checked(elem) {
          // In CSS3, :checked should return both checked and selected elements
          // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
          var nodeName = elem.nodeName.toLowerCase();
          return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;
        },
        "selected": function selected(elem) {
          // Accessing this property makes selected-by-default
          // options in Safari work properly
          if (elem.parentNode) {
            elem.parentNode.selectedIndex;
          }

          return elem.selected === true;
        },
        // Contents
        "empty": function empty(elem) {
          // http://www.w3.org/TR/selectors/#empty-pseudo
          // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
          //   but not by others (comment: 8; processing instruction: 7; etc.)
          // nodeType < 6 works because attributes (2) do not appear as children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            if (elem.nodeType < 6) {
              return false;
            }
          }

          return true;
        },
        "parent": function parent(elem) {
          return !Expr.pseudos["empty"](elem);
        },
        // Element/input types
        "header": function header(elem) {
          return rheader.test(elem.nodeName);
        },
        "input": function input(elem) {
          return rinputs.test(elem.nodeName);
        },
        "button": function button(elem) {
          var name = elem.nodeName.toLowerCase();
          return name === "input" && elem.type === "button" || name === "button";
        },
        "text": function text(elem) {
          var attr;
          return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ( // Support: IE<8
          // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
          (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
        },
        // Position-in-collection
        "first": createPositionalPseudo(function () {
          return [0];
        }),
        "last": createPositionalPseudo(function (matchIndexes, length) {
          return [length - 1];
        }),
        "eq": createPositionalPseudo(function (matchIndexes, length, argument) {
          return [argument < 0 ? argument + length : argument];
        }),
        "even": createPositionalPseudo(function (matchIndexes, length) {
          var i = 0;

          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }

          return matchIndexes;
        }),
        "odd": createPositionalPseudo(function (matchIndexes, length) {
          var i = 1;

          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }

          return matchIndexes;
        }),
        "lt": createPositionalPseudo(function (matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;

          for (; --i >= 0;) {
            matchIndexes.push(i);
          }

          return matchIndexes;
        }),
        "gt": createPositionalPseudo(function (matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;

          for (; ++i < length;) {
            matchIndexes.push(i);
          }

          return matchIndexes;
        })
      }
    };
    Expr.pseudos["nth"] = Expr.pseudos["eq"]; // Add button/input type pseudos

    for (i in {
      radio: true,
      checkbox: true,
      file: true,
      password: true,
      image: true
    }) {
      Expr.pseudos[i] = createInputPseudo(i);
    }

    for (i in {
      submit: true,
      reset: true
    }) {
      Expr.pseudos[i] = createButtonPseudo(i);
    } // Easy API for creating new setFilters


    function setFilters() {}

    setFilters.prototype = Expr.filters = Expr.pseudos;
    Expr.setFilters = new setFilters();

    tokenize = Sizzle.tokenize = function (selector, parseOnly) {
      var matched,
          match,
          tokens,
          type,
          soFar,
          groups,
          preFilters,
          cached = tokenCache[selector + " "];

      if (cached) {
        return parseOnly ? 0 : cached.slice(0);
      }

      soFar = selector;
      groups = [];
      preFilters = Expr.preFilter;

      while (soFar) {
        // Comma and first run
        if (!matched || (match = rcomma.exec(soFar))) {
          if (match) {
            // Don't consume trailing commas as valid
            soFar = soFar.slice(match[0].length) || soFar;
          }

          groups.push(tokens = []);
        }

        matched = false; // Combinators

        if (match = rcombinators.exec(soFar)) {
          matched = match.shift();
          tokens.push({
            value: matched,
            // Cast descendant combinators to space
            type: match[0].replace(rtrim, " ")
          });
          soFar = soFar.slice(matched.length);
        } // Filters


        for (type in Expr.filter) {
          if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
            matched = match.shift();
            tokens.push({
              value: matched,
              type: type,
              matches: match
            });
            soFar = soFar.slice(matched.length);
          }
        }

        if (!matched) {
          break;
        }
      } // Return the length of the invalid excess
      // if we're just parsing
      // Otherwise, throw an error or return tokens


      return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : // Cache the tokens
      tokenCache(selector, groups).slice(0);
    };

    function toSelector(tokens) {
      var i = 0,
          len = tokens.length,
          selector = "";

      for (; i < len; i++) {
        selector += tokens[i].value;
      }

      return selector;
    }

    function addCombinator(matcher, combinator, base) {
      var dir = combinator.dir,
          skip = combinator.next,
          key = skip || dir,
          checkNonElements = base && key === "parentNode",
          doneName = done++;
      return combinator.first ? // Check against closest ancestor/preceding element
      function (elem, context, xml) {
        while (elem = elem[dir]) {
          if (elem.nodeType === 1 || checkNonElements) {
            return matcher(elem, context, xml);
          }
        }
      } : // Check against all ancestor/preceding elements
      function (elem, context, xml) {
        var oldCache,
            uniqueCache,
            outerCache,
            newCache = [dirruns, doneName]; // We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching

        if (xml) {
          while (elem = elem[dir]) {
            if (elem.nodeType === 1 || checkNonElements) {
              if (matcher(elem, context, xml)) {
                return true;
              }
            }
          }
        } else {
          while (elem = elem[dir]) {
            if (elem.nodeType === 1 || checkNonElements) {
              outerCache = elem[expando] || (elem[expando] = {}); // Support: IE <9 only
              // Defend against cloned attroperties (jQuery gh-1709)

              uniqueCache = outerCache[elem.uniqueID] || (outerCache[elem.uniqueID] = {});

              if (skip && skip === elem.nodeName.toLowerCase()) {
                elem = elem[dir] || elem;
              } else if ((oldCache = uniqueCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                // Assign to newCache so results back-propagate to previous elements
                return newCache[2] = oldCache[2];
              } else {
                // Reuse newcache so results back-propagate to previous elements
                uniqueCache[key] = newCache; // A match means we're done; a fail means we have to keep checking

                if (newCache[2] = matcher(elem, context, xml)) {
                  return true;
                }
              }
            }
          }
        }
      };
    }

    function elementMatcher(matchers) {
      return matchers.length > 1 ? function (elem, context, xml) {
        var i = matchers.length;

        while (i--) {
          if (!matchers[i](elem, context, xml)) {
            return false;
          }
        }

        return true;
      } : matchers[0];
    }

    function multipleContexts(selector, contexts, results) {
      var i = 0,
          len = contexts.length;

      for (; i < len; i++) {
        Sizzle(selector, contexts[i], results);
      }

      return results;
    }

    function condense(unmatched, map, filter, context, xml) {
      var elem,
          newUnmatched = [],
          i = 0,
          len = unmatched.length,
          mapped = map != null;

      for (; i < len; i++) {
        if (elem = unmatched[i]) {
          if (!filter || filter(elem, context, xml)) {
            newUnmatched.push(elem);

            if (mapped) {
              map.push(i);
            }
          }
        }
      }

      return newUnmatched;
    }

    function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
      if (postFilter && !postFilter[expando]) {
        postFilter = setMatcher(postFilter);
      }

      if (postFinder && !postFinder[expando]) {
        postFinder = setMatcher(postFinder, postSelector);
      }

      return markFunction(function (seed, results, context, xml) {
        var temp,
            i,
            elem,
            preMap = [],
            postMap = [],
            preexisting = results.length,
            // Get initial elements from seed or context
        elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),
            // Prefilter to get matcher input, preserving a map for seed-results synchronization
        matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems,
            matcherOut = matcher ? // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
        postFinder || (seed ? preFilter : preexisting || postFilter) ? // ...intermediate processing is necessary
        [] : // ...otherwise use results directly
        results : matcherIn; // Find primary matches

        if (matcher) {
          matcher(matcherIn, matcherOut, context, xml);
        } // Apply postFilter


        if (postFilter) {
          temp = condense(matcherOut, postMap);
          postFilter(temp, [], context, xml); // Un-match failing elements by moving them back to matcherIn

          i = temp.length;

          while (i--) {
            if (elem = temp[i]) {
              matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
            }
          }
        }

        if (seed) {
          if (postFinder || preFilter) {
            if (postFinder) {
              // Get the final matcherOut by condensing this intermediate into postFinder contexts
              temp = [];
              i = matcherOut.length;

              while (i--) {
                if (elem = matcherOut[i]) {
                  // Restore matcherIn since elem is not yet a final match
                  temp.push(matcherIn[i] = elem);
                }
              }

              postFinder(null, matcherOut = [], temp, xml);
            } // Move matched elements from seed to results to keep them synchronized


            i = matcherOut.length;

            while (i--) {
              if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {
                seed[temp] = !(results[temp] = elem);
              }
            }
          } // Add elements to results, through postFinder if defined

        } else {
          matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);

          if (postFinder) {
            postFinder(null, results, matcherOut, xml);
          } else {
            push.apply(results, matcherOut);
          }
        }
      });
    }

    function matcherFromTokens(tokens) {
      var checkContext,
          matcher,
          j,
          len = tokens.length,
          leadingRelative = Expr.relative[tokens[0].type],
          implicitRelative = leadingRelative || Expr.relative[" "],
          i = leadingRelative ? 1 : 0,
          // The foundational matcher ensures that elements are reachable from top-level context(s)
      matchContext = addCombinator(function (elem) {
        return elem === checkContext;
      }, implicitRelative, true),
          matchAnyContext = addCombinator(function (elem) {
        return indexOf(checkContext, elem) > -1;
      }, implicitRelative, true),
          matchers = [function (elem, context, xml) {
        var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml)); // Avoid hanging onto element (issue #299)

        checkContext = null;
        return ret;
      }];

      for (; i < len; i++) {
        if (matcher = Expr.relative[tokens[i].type]) {
          matchers = [addCombinator(elementMatcher(matchers), matcher)];
        } else {
          matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches); // Return special upon seeing a positional matcher

          if (matcher[expando]) {
            // Find the next relative operator (if any) for proper handling
            j = ++i;

            for (; j < len; j++) {
              if (Expr.relative[tokens[j].type]) {
                break;
              }
            }

            return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector( // If the preceding token was a descendant combinator, insert an implicit any-element `*`
            tokens.slice(0, i - 1).concat({
              value: tokens[i - 2].type === " " ? "*" : ""
            })).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
          }

          matchers.push(matcher);
        }
      }

      return elementMatcher(matchers);
    }

    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
      var bySet = setMatchers.length > 0,
          byElement = elementMatchers.length > 0,
          superMatcher = function superMatcher(seed, context, xml, results, outermost) {
        var elem,
            j,
            matcher,
            matchedCount = 0,
            i = "0",
            unmatched = seed && [],
            setMatched = [],
            contextBackup = outermostContext,
            // We must always have either seed elements or outermost context
        elems = seed || byElement && Expr.find["TAG"]("*", outermost),
            // Use integer dirruns iff this is the outermost matcher
        dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1,
            len = elems.length;

        if (outermost) {
          outermostContext = context === document || context || outermost;
        } // Add elements passing elementMatchers directly to results
        // Support: IE<9, Safari
        // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id


        for (; i !== len && (elem = elems[i]) != null; i++) {
          if (byElement && elem) {
            j = 0;

            if (!context && elem.ownerDocument !== document) {
              setDocument(elem);
              xml = !documentIsHTML;
            }

            while (matcher = elementMatchers[j++]) {
              if (matcher(elem, context || document, xml)) {
                results.push(elem);
                break;
              }
            }

            if (outermost) {
              dirruns = dirrunsUnique;
            }
          } // Track unmatched elements for set filters


          if (bySet) {
            // They will have gone through all possible matchers
            if (elem = !matcher && elem) {
              matchedCount--;
            } // Lengthen the array for every element, matched or not


            if (seed) {
              unmatched.push(elem);
            }
          }
        } // `i` is now the count of elements visited above, and adding it to `matchedCount`
        // makes the latter nonnegative.


        matchedCount += i; // Apply set filters to unmatched elements
        // NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
        // equals `i`), unless we didn't visit _any_ elements in the above loop because we have
        // no element matchers and no seed.
        // Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
        // case, which will result in a "00" `matchedCount` that differs from `i` but is also
        // numerically zero.

        if (bySet && i !== matchedCount) {
          j = 0;

          while (matcher = setMatchers[j++]) {
            matcher(unmatched, setMatched, context, xml);
          }

          if (seed) {
            // Reintegrate element matches to eliminate the need for sorting
            if (matchedCount > 0) {
              while (i--) {
                if (!(unmatched[i] || setMatched[i])) {
                  setMatched[i] = pop.call(results);
                }
              }
            } // Discard index placeholder values to get only actual matches


            setMatched = condense(setMatched);
          } // Add matches to results


          push.apply(results, setMatched); // Seedless set matches succeeding multiple successful matchers stipulate sorting

          if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
            Sizzle.uniqueSort(results);
          }
        } // Override manipulation of globals by nested matchers


        if (outermost) {
          dirruns = dirrunsUnique;
          outermostContext = contextBackup;
        }

        return unmatched;
      };

      return bySet ? markFunction(superMatcher) : superMatcher;
    }

    compile = Sizzle.compile = function (selector, match
    /* Internal Use Only */
    ) {
      var i,
          setMatchers = [],
          elementMatchers = [],
          cached = compilerCache[selector + " "];

      if (!cached) {
        // Generate a function of recursive functions that can be used to check each element
        if (!match) {
          match = tokenize(selector);
        }

        i = match.length;

        while (i--) {
          cached = matcherFromTokens(match[i]);

          if (cached[expando]) {
            setMatchers.push(cached);
          } else {
            elementMatchers.push(cached);
          }
        } // Cache the compiled function


        cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers)); // Save selector and tokenization

        cached.selector = selector;
      }

      return cached;
    };
    /**
     * A low-level selection function that works with Sizzle's compiled
     *  selector functions
     * @param selector {String|Function} A selector or a pre-compiled
     *  selector function built with Sizzle.compile
     * @param context {Element}
     * @param results {Array}
     * @param seed {Array} A set of elements to match against
     */


    select = Sizzle.select = function (selector, context, results, seed) {
      var i,
          tokens,
          token,
          type,
          find,
          compiled = typeof selector === "function" && selector,
          match = !seed && tokenize(selector = compiled.selector || selector);
      results = results || []; // Try to minimize operations if there is only one selector in the list and no seed
      // (the latter of which guarantees us context)

      if (match.length === 1) {
        // Reduce context if the leading compound selector is an ID
        tokens = match[0] = match[0].slice(0);

        if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
          context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];

          if (!context) {
            return results; // Precompiled matchers will still verify ancestry, so step up a level
          } else if (compiled) {
            context = context.parentNode;
          }

          selector = selector.slice(tokens.shift().value.length);
        } // Fetch a seed set for right-to-left matching


        i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;

        while (i--) {
          token = tokens[i]; // Abort if we hit a combinator

          if (Expr.relative[type = token.type]) {
            break;
          }

          if (find = Expr.find[type]) {
            // Search, expanding context for leading sibling combinators
            if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {
              // If seed is empty or no tokens remain, we can return early
              tokens.splice(i, 1);
              selector = seed.length && toSelector(tokens);

              if (!selector) {
                push.apply(results, seed);
                return results;
              }

              break;
            }
          }
        }
      } // Compile and execute a filtering function if one is not provided
      // Provide `match` to avoid retokenization if we modified the selector above


      (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, !context || rsibling.test(selector) && testContext(context.parentNode) || context);
      return results;
    }; // One-time assignments
    // Sort stability


    support.sortStable = expando.split("").sort(sortOrder).join("") === expando; // Support: Chrome 14-35+
    // Always assume duplicates if they aren't passed to the comparison function

    support.detectDuplicates = !!hasDuplicate; // Initialize against the default document

    setDocument(); // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
    // Detached nodes confoundingly follow *each other*

    support.sortDetached = assert(function (el) {
      // Should return 1, but returns 4 (following)
      return el.compareDocumentPosition(document.createElement("fieldset")) & 1;
    }); // Support: IE<8
    // Prevent attribute/property "interpolation"
    // https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx

    if (!assert(function (el) {
      el.innerHTML = "<a href='#'></a>";
      return el.firstChild.getAttribute("href") === "#";
    })) {
      addHandle("type|href|height|width", function (elem, name, isXML) {
        if (!isXML) {
          return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
        }
      });
    } // Support: IE<9
    // Use defaultValue in place of getAttribute("value")


    if (!support.attributes || !assert(function (el) {
      el.innerHTML = "<input/>";
      el.firstChild.setAttribute("value", "");
      return el.firstChild.getAttribute("value") === "";
    })) {
      addHandle("value", function (elem, name, isXML) {
        if (!isXML && elem.nodeName.toLowerCase() === "input") {
          return elem.defaultValue;
        }
      });
    } // Support: IE<9
    // Use getAttributeNode to fetch booleans when getAttribute lies


    if (!assert(function (el) {
      return el.getAttribute("disabled") == null;
    })) {
      addHandle(booleans, function (elem, name, isXML) {
        var val;

        if (!isXML) {
          return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
        }
      });
    } // EXPOSE qooxdoo variant


    qx.bom.Selector.query = function (selector, context) {
      return Sizzle(selector, context);
    };

    qx.bom.Selector.matches = function (selector, set) {
      return Sizzle(selector, null, null, set);
    }; // EXPOSE qooxdoo variant

  })(window);

  qx.bom.Selector.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.normalize.Function": {
        "require": true
      },
      "qx.lang.normalize.String": {
        "require": true
      },
      "qx.lang.normalize.Date": {
        "require": true
      },
      "qx.lang.normalize.Array": {
        "require": true
      },
      "qx.lang.normalize.Error": {
        "require": true
      },
      "qx.lang.normalize.Object": {
        "require": true
      },
      "qx.lang.normalize.Number": {
        "require": true
      },
      "qx.Bootstrap": {
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
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Adds JavaScript features that may not be supported by all clients.
   *
   * @require(qx.lang.normalize.Function)
   * @require(qx.lang.normalize.String)
   * @require(qx.lang.normalize.Date)
   * @require(qx.lang.normalize.Array)
   * @require(qx.lang.normalize.Error)
   * @require(qx.lang.normalize.Object)
   * @require(qx.lang.normalize.Number)
   *
   * @group (Polyfill)
   */
  qx.Bootstrap.define("qx.module.Polyfill", {});
  qx.module.Polyfill.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Browser": {
        "defer": "runtime"
      },
      "qx.bom.client.Engine": {
        "defer": "runtime"
      },
      "qx.bom.client.Device": {
        "defer": "runtime"
      },
      "qx.bom.client.Event": {
        "defer": "runtime"
      },
      "qxWeb": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "browser.name": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.version": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.quirksmode": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.documentmode": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "engine.name": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "device.name": {
          "defer": true,
          "className": "qx.bom.client.Device"
        },
        "device.type": {
          "defer": true,
          "className": "qx.bom.client.Device"
        },
        "event.touch": {
          "defer": true,
          "className": "qx.bom.client.Event"
        },
        "event.mspointer": {
          "defer": true,
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
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Module for querying information about the environment / runtime.
   * It adds a static key <code>env</code> to qxWeb and offers the given methods.
   *
   * The following values are predefined:
   *
   * * <code>browser.name</code> : The name of the browser
   * * <code>browser.version</code> : The version of the browser
   * * <code>browser.quirksmode</code>  : <code>true</code> if the browser is in quirksmode
   * * <code>browser.documentmode</code> : The document mode of the browser
   *
   * * <code>device.name</code> : The name of the device e.g. <code>iPad</code>.
   * * <code>device.type</code> : Either <code>desktop</code>, <code>tablet</code> or <code>mobile</code>.
   *
   * * <code>engine.name</code> : The name of the browser engine
   * * <code>engine.version</code> : The version of the browser engine
   *
   * * <code>event.touch</code> : Checks if touch events are supported
   * * <code>event.mspointer</code> : Checks if MSPointer events are available
   * @group (Core)
   */
  qx.Bootstrap.define("qx.module.Environment", {
    statics: {
      /**
       * Get the value stored for the given key.
       *
       * @attachStatic {qxWeb, env.get}
       * @param key {String} The key to check for.
       * @return {var} The value stored for the given key.
       * @lint environmentNonLiteralKey(key)
       */
      get: function get(key) {
        return qx.core.Environment.get(key);
      },

      /**
       * Adds a new environment setting which can be queried via {@link #get}.
       * @param key {String} The key to store the value for.
       *
       * @attachStatic {qxWeb, env.add}
       * @param value {var} The value to store.
       * @return {qxWeb} The collection for chaining.
       */
      add: function add(key, value) {
        qx.core.Environment.add(key, value);
        return this;
      }
    },
    defer: function defer(statics) {
      // make sure the desired keys are available (browser.* and engine.*)
      qx.core.Environment.get("browser.name");
      qx.core.Environment.get("browser.version");
      qx.core.Environment.get("browser.quirksmode");
      qx.core.Environment.get("browser.documentmode");
      qx.core.Environment.get("engine.name");
      qx.core.Environment.get("engine.version");
      qx.core.Environment.get("device.name");
      qx.core.Environment.get("device.type");
      qx.core.Environment.get("event.touch");
      qx.core.Environment.get("event.mspointer");
      qxWeb.$attachAll(this, "env");
    }
  });
  qx.module.Environment.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.event.PointerHandler": {
        "defer": "runtime"
      },
      "qx.module.Polyfill": {
        "require": true,
        "defer": "runtime"
      },
      "qx.module.Environment": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qxWeb": {
        "defer": "runtime"
      },
      "qx.bom.Event": {},
      "qx.lang.Type": {},
      "qx.lang.Array": {},
      "qx.event.Emitter": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2011-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Support for native and custom events.
   *
   * @require(qx.module.Polyfill)
   * @require(qx.module.Environment)
   * @use(qx.module.event.PointerHandler)
   * @group (Core)
   */
  qx.Bootstrap.define("qx.module.Event", {
    statics: {
      /**
       * Event normalization registry
       *
       * @internal
       */
      __normalizations: {},

      /**
       * Registry of event hooks
       * @internal
       */
      __hooks: {
        on: {},
        off: {}
      },
      __isReady: false,

      /**
       * Executes the given function once the document is ready.
       *
       * @attachStatic {qxWeb}
       * @param callback {Function} callback function
       */
      ready: function ready(callback) {
        // DOM is already ready
        if (document.readyState === "complete") {
          window.setTimeout(callback, 1);
          return;
        } // listen for the load event so the callback is executed no matter what


        var onWindowLoad = function onWindowLoad() {
          qx.module.Event.__isReady = true;
          callback();
        };

        qxWeb(window).on("load", onWindowLoad);

        var wrappedCallback = function wrappedCallback() {
          qxWeb(window).off("load", onWindowLoad);
          callback();
        }; // Listen for DOMContentLoaded event if available (no way to reliably detect
        // support)


        if (qxWeb.env.get("engine.name") !== "mshtml" || qxWeb.env.get("browser.documentmode") > 8) {
          qx.bom.Event.addNativeListener(document, "DOMContentLoaded", wrappedCallback);
        } else {
          // Continually check to see if the document is ready
          var timer = function timer() {
            // onWindowLoad already executed
            if (qx.module.Event.__isReady) {
              return;
            }

            try {
              // If DOMContentLoaded is unavailable, use the trick by Diego Perini
              // http://javascript.nwbox.com/IEContentLoaded/
              document.documentElement.doScroll("left");

              if (document.body) {
                wrappedCallback();
              }
            } catch (error) {
              window.setTimeout(timer, 100);
            }
          };

          timer();
        }
      },

      /**
       * Registers a normalization function for the given event types. Listener
       * callbacks for these types will be called with the return value of the
       * normalization function instead of the regular event object.
       *
       * The normalizer will be called with two arguments: The original event
       * object and the element on which the event was triggered
       *
       * @attachStatic {qxWeb, $registerEventNormalization}
       * @param types {String[]} List of event types to be normalized. Use an
       * asterisk (<code>*</code>) to normalize all event types
       * @param normalizer {Function} Normalizer function
       */
      $registerEventNormalization: function $registerEventNormalization(types, normalizer) {
        if (!qx.lang.Type.isArray(types)) {
          types = [types];
        }

        var registry = qx.module.Event.__normalizations;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (qx.lang.Type.isFunction(normalizer)) {
            if (!registry[type]) {
              registry[type] = [];
            }

            registry[type].push(normalizer);
          }
        }
      },

      /**
       * Unregisters a normalization function from the given event types.
       *
       * @attachStatic {qxWeb, $unregisterEventNormalization}
       * @param types {String[]} List of event types
       * @param normalizer {Function} Normalizer function
       */
      $unregisterEventNormalization: function $unregisterEventNormalization(types, normalizer) {
        if (!qx.lang.Type.isArray(types)) {
          types = [types];
        }

        var registry = qx.module.Event.__normalizations;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (registry[type]) {
            qx.lang.Array.remove(registry[type], normalizer);
          }
        }
      },

      /**
       * Returns all registered event normalizers
       *
       * @attachStatic {qxWeb, $getEventNormalizationRegistry}
       * @return {Map} Map of event types/normalizer functions
       */
      $getEventNormalizationRegistry: function $getEventNormalizationRegistry() {
        return qx.module.Event.__normalizations;
      },

      /**
       * Registers an event hook for the given event types.
       *
       * @attachStatic {qxWeb, $registerEventHook}
       * @param types {String[]} List of event types
       * @param registerHook {Function} Hook function to be called on event registration
       * @param unregisterHook {Function?} Hook function to be called on event deregistration
       * @internal
       */
      $registerEventHook: function $registerEventHook(types, registerHook, unregisterHook) {
        if (!qx.lang.Type.isArray(types)) {
          types = [types];
        }

        var onHooks = qx.module.Event.__hooks.on;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (qx.lang.Type.isFunction(registerHook)) {
            if (!onHooks[type]) {
              onHooks[type] = [];
            }

            onHooks[type].push(registerHook);
          }
        }

        if (!unregisterHook) {
          return;
        }

        var offHooks = qx.module.Event.__hooks.off;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (qx.lang.Type.isFunction(unregisterHook)) {
            if (!offHooks[type]) {
              offHooks[type] = [];
            }

            offHooks[type].push(unregisterHook);
          }
        }
      },

      /**
       * Unregisters a hook from the given event types.
       *
       * @attachStatic {qxWeb, $unregisterEventHooks}
       * @param types {String[]} List of event types
       * @param registerHook {Function} Hook function to be called on event registration
       * @param unregisterHook {Function?} Hook function to be called on event deregistration
       * @internal
       */
      $unregisterEventHook: function $unregisterEventHook(types, registerHook, unregisterHook) {
        if (!qx.lang.Type.isArray(types)) {
          types = [types];
        }

        var onHooks = qx.module.Event.__hooks.on;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (onHooks[type]) {
            qx.lang.Array.remove(onHooks[type], registerHook);
          }
        }

        if (!unregisterHook) {
          return;
        }

        var offHooks = qx.module.Event.__hooks.off;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (offHooks[type]) {
            qx.lang.Array.remove(offHooks[type], unregisterHook);
          }
        }
      },

      /**
       * Returns all registered event hooks
       *
       * @attachStatic {qxWeb, $getEventHookRegistry}
       * @return {Map} Map of event types/registration hook functions
       * @internal
       */
      $getEventHookRegistry: function $getEventHookRegistry() {
        return qx.module.Event.__hooks;
      }
    },
    members: {
      /**
       * Registers a listener for the given event type on each item in the
       * collection. This can be either native or custom events.
       *
       * @attach {qxWeb}
       * @param type {String} Type of the event to listen for
       * @param listener {Function} Listener callback
       * @param context {Object?} Context the callback function will be executed in.
       * Default: The element on which the listener was registered
       * @param useCapture {Boolean?} Attach the listener to the capturing
       * phase if true
       * @return {qxWeb} The collection for chaining
       */
      on: function on(type, listener, context, useCapture) {
        for (var i = 0; i < this.length; i++) {
          var el = this[i];
          var ctx = context || qxWeb(el); // call hooks

          var hooks = qx.module.Event.__hooks.on; // generic

          var typeHooks = hooks["*"] || []; // type specific

          if (hooks[type]) {
            typeHooks = typeHooks.concat(hooks[type]);
          }

          for (var j = 0, m = typeHooks.length; j < m; j++) {
            typeHooks[j](el, type, listener, context);
          }

          var bound = function (el, event) {
            // apply normalizations
            var registry = qx.module.Event.__normalizations; // generic

            var normalizations = registry["*"] || []; // type specific

            if (registry[type]) {
              normalizations = normalizations.concat(registry[type]);
            }

            for (var x = 0, y = normalizations.length; x < y; x++) {
              event = normalizations[x](event, el, type);
            } // call original listener with normalized event


            listener.apply(this, [event]);
          }.bind(ctx, el);

          bound.original = listener; // add native listener

          qx.bom.Event.addNativeListener(el, type, bound, useCapture); // create an emitter if necessary

          if (!el.$$emitter) {
            el.$$emitter = new qx.event.Emitter();
          }

          el.$$lastlistenerId = el.$$emitter.on(type, bound, ctx); // save the useCapture for removing

          el.$$emitter.getEntryById(el.$$lastlistenerId).useCapture = !!useCapture;

          if (!el.__listener) {
            el.__listener = {};
          }

          if (!el.__listener[type]) {
            el.__listener[type] = {};
          }

          el.__listener[type][el.$$lastlistenerId] = bound;

          if (!context) {
            // store a reference to the dynamically created context so we know
            // what to check for when removing the listener
            if (!el.__ctx) {
              el.__ctx = {};
            }

            el.__ctx[el.$$lastlistenerId] = ctx;
          }
        }

        return this;
      },

      /**
       * Unregisters event listeners for the given type from each element in the
       * collection.
       *
       * @attach {qxWeb}
       * @param type {String} Type of the event
       * @param listener {Function} Listener callback
       * @param context {Object?} Listener callback context
       * @param useCapture {Boolean?} Attach the listener to the capturing
       * phase if true
       * @return {qxWeb} The collection for chaining
       */
      off: function off(type, listener, context, useCapture) {
        var removeAll = listener === null && context === null;

        for (var j = 0; j < this.length; j++) {
          var el = this[j]; // continue if no listeners are available

          if (!el.__listener) {
            continue;
          }

          var types = [];

          if (type !== null) {
            types.push(type);
          } else {
            // no type specified, remove all listeners
            for (var listenerType in el.__listener) {
              types.push(listenerType);
            }
          }

          for (var i = 0, l = types.length; i < l; i++) {
            for (var id in el.__listener[types[i]]) {
              var storedListener = el.__listener[types[i]][id];

              if (removeAll || storedListener == listener || storedListener.original == listener) {
                // get the stored context
                var hasStoredContext = typeof el.__ctx !== "undefined" && el.__ctx[id];
                var storedContext;

                if (!context && hasStoredContext) {
                  storedContext = el.__ctx[id];
                } // remove the listener from the emitter


                var result = el.$$emitter.off(types[i], storedListener, storedContext || context); // check if it's a bound listener which means it was a native event

                if (removeAll || storedListener.original == listener) {
                  // remove the native listener
                  qx.bom.Event.removeNativeListener(el, types[i], storedListener, useCapture);
                } // BUG #9184
                // only if the emitter was successfully removed also delete the key in the data structure


                if (result !== null) {
                  delete el.__listener[types[i]][id];
                }

                if (hasStoredContext) {
                  delete el.__ctx[id];
                }
              }
            } // call hooks


            var hooks = qx.module.Event.__hooks.off; // generic

            var typeHooks = hooks["*"] || []; // type specific

            if (hooks[type]) {
              typeHooks = typeHooks.concat(hooks[type]);
            }

            for (var k = 0, m = typeHooks.length; k < m; k++) {
              typeHooks[k](el, type, listener, context);
            }
          }
        }

        return this;
      },

      /**
       * Removes all event listeners (or all listeners for a given type) from the
       * collection.
       *
       * @attach {qxWeb}
       * @param type {String?} Event type. All listeners will be removed if this is undefined.
       * @return {qxWeb} The collection for chaining
       */
      allOff: function allOff(type) {
        return this.off(type || null, null, null);
      },

      /**
       * Removes the listener with the given id.
       * @param id {Number} The id of the listener to remove
       * @return {qxWeb} The collection for chaining.
       */
      offById: function offById(id) {
        var entry = this[0].$$emitter.getEntryById(id);
        return this.off(entry.name, entry.listener.original, entry.ctx, entry.useCapture);
      },

      /**
       * Fire an event of the given type.
       *
       * @attach {qxWeb}
       * @param type {String} Event type
       * @param data {var?} Optional data that will be passed to the listener
       * callback function.
       * @return {qxWeb} The collection for chaining
       */
      emit: function emit(type, data) {
        for (var j = 0; j < this.length; j++) {
          var el = this[j];

          if (el.$$emitter) {
            el.$$emitter.emit(type, data);
          }
        }

        return this;
      },

      /**
       * Attaches a listener for the given event that will be executed only once.
       *
       * @attach {qxWeb}
       * @param type {String} Type of the event to listen for
       * @param listener {Function} Listener callback
       * @param context {Object?} Context the callback function will be executed in.
       * Default: The element on which the listener was registered
       * @return {qxWeb} The collection for chaining
       */
      once: function once(type, listener, context) {
        var self = this;

        var wrappedListener = function wrappedListener(data) {
          self.off(type, wrappedListener, context);
          listener.call(this, data);
        };

        this.on(type, wrappedListener, context);
        return this;
      },

      /**
       * Checks if one or more listeners for the given event type are attached to
       * the first element in the collection.
       *
       * *Important:* Make sure you are handing in the *identical* context object to get
       * the correct result. Especially when using a collection instance this is a common pitfall.
       *
       * @attach {qxWeb}
       * @param type {String} Event type, e.g. <code>mousedown</code>
       * @param listener {Function?} Event listener to check for.
       * @param context {Object?} Context object listener to check for.
       * @return {Boolean} <code>true</code> if one or more listeners are attached
       */
      hasListener: function hasListener(type, listener, context) {
        if (!this[0] || !this[0].$$emitter || !this[0].$$emitter.getListeners()[type]) {
          return false;
        }

        if (listener) {
          var attachedListeners = this[0].$$emitter.getListeners()[type];

          for (var i = 0; i < attachedListeners.length; i++) {
            var hasListener = false;

            if (attachedListeners[i].listener == listener) {
              hasListener = true;
            }

            if (attachedListeners[i].listener.original && attachedListeners[i].listener.original == listener) {
              hasListener = true;
            }

            if (hasListener) {
              if (context !== undefined) {
                if (attachedListeners[i].ctx === context) {
                  return true;
                }
              } else {
                return true;
              }
            }
          }

          return false;
        }

        return this[0].$$emitter.getListeners()[type].length > 0;
      },

      /**
       * Copies any event listeners that are attached to the elements in the
       * collection to the provided target element
       *
       * @internal
       * @param target {Element} Element to attach the copied listeners to
       */
      copyEventsTo: function copyEventsTo(target) {
        // Copy both arrays to make sure the original collections are not manipulated.
        // If e.g. the 'target' array contains a DOM node with child nodes we run into
        // problems because the 'target' array is flattened within this method.
        var source = this.concat();
        var targetCopy = target.concat(); // get all children of source and target

        for (var i = source.length - 1; i >= 0; i--) {
          var descendants = source[i].getElementsByTagName("*");

          for (var j = 0; j < descendants.length; j++) {
            source.push(descendants[j]);
          }
        }

        for (var i = targetCopy.length - 1; i >= 0; i--) {
          var descendants = targetCopy[i].getElementsByTagName("*");

          for (var j = 0; j < descendants.length; j++) {
            targetCopy.push(descendants[j]);
          }
        } // make sure no emitter object has been copied


        targetCopy.forEach(function (el) {
          el.$$emitter = null;
        });

        for (var i = 0; i < source.length; i++) {
          var el = source[i];

          if (!el.$$emitter) {
            continue;
          }

          var storage = el.$$emitter.getListeners();

          for (var name in storage) {
            for (var j = storage[name].length - 1; j >= 0; j--) {
              var listener = storage[name][j].listener;

              if (listener.original) {
                listener = listener.original;
              }

              qxWeb(targetCopy[i]).on(name, listener, storage[name][j].ctx);
            }
          }
        }
      },

      /**
       * Bind one or two callbacks to the collection.
       * If only the first callback is defined the collection
       * does react on 'pointerover' only.
       *
       * @attach {qxWeb}
       *
       * @param callbackIn {Function} callback when hovering over
       * @param callbackOut {Function?} callback when hovering out
       * @return {qxWeb} The collection for chaining
       */
      hover: function hover(callbackIn, callbackOut) {
        this.on("pointerover", callbackIn, this);

        if (qx.lang.Type.isFunction(callbackOut)) {
          this.on("pointerout", callbackOut, this);
        }

        return this;
      },

      /**
       * Adds a listener for the given type and checks if the target fulfills the selector check.
       * If the check is successful the callback is executed with the target and event as arguments.
       *
       * @attach{qxWeb}
       *
       * @param eventType {String} name of the event to watch out for (attached to the document object)
       * @param target {String|Element|Element[]|qxWeb} Selector expression, DOM element,
       * Array of DOM elements or collection
       * @param callback {Function} function to call if the selector matches.
       * The callback will get the target as qxWeb collection and the event as arguments
       * @param context {Object?} optional context object to call the callback
       * @return {qxWeb} The collection for chaining
       */
      onMatchTarget: function onMatchTarget(eventType, target, callback, context) {
        context = context !== undefined ? context : this;

        var listener = function listener(e) {
          var eventTarget = qxWeb(e.getTarget());

          if (eventTarget.is(target)) {
            callback.call(context, eventTarget, qxWeb.object.clone(e));
          } else {
            var targetToMatch = typeof target == "string" ? this.find(target) : qxWeb(target);

            for (var i = 0, l = targetToMatch.length; i < l; i++) {
              if (eventTarget.isChildOf(qxWeb(targetToMatch[i]))) {
                callback.call(context, eventTarget, qxWeb.object.clone(e));
                break;
              }
            }
          }
        }; // make sure to store the infos for 'offMatchTarget' at each element of the collection
        // to be able to remove the listener separately


        this.forEach(function (el) {
          var matchTarget = {
            type: eventType,
            listener: listener,
            callback: callback,
            context: context
          };

          if (!el.$$matchTargetInfo) {
            el.$$matchTargetInfo = [];
          }

          el.$$matchTargetInfo.push(matchTarget);
        });
        this.on(eventType, listener);
        return this;
      },

      /**
       * Removes a listener for the given type and selector check.
       *
       * @attach{qxWeb}
       *
       * @param eventType {String} name of the event to remove for
       * @param target {String|Element|Element[]|qxWeb} Selector expression, DOM element,
       * Array of DOM elements or collection
       * @param callback {Function} function to remove
       * @param context {Object?} optional context object to remove
       * @return {qxWeb} The collection for chaining
       */
      offMatchTarget: function offMatchTarget(eventType, target, callback, context) {
        context = context !== undefined ? context : this;
        this.forEach(function (el) {
          if (el.$$matchTargetInfo && qxWeb.type.get(el.$$matchTargetInfo) == "Array") {
            var infos = el.$$matchTargetInfo;

            for (var i = infos.length - 1; i >= 0; i--) {
              var entry = infos[i];

              if (entry.type == eventType && entry.callback == callback && entry.context == context) {
                this.off(eventType, entry.listener);
                infos.splice(i, 1);
              }
            }

            if (infos.length === 0) {
              el.$$matchTargetInfo = null;
            }
          }
        }, this);
        return this;
      }
    },
    defer: function defer(statics) {
      qxWeb.$attachAll(this); // manually attach internal $-methods as they are ignored by the previous method-call

      qxWeb.$attachStatic({
        "$registerEventNormalization": statics.$registerEventNormalization,
        "$unregisterEventNormalization": statics.$unregisterEventNormalization,
        "$getEventNormalizationRegistry": statics.$getEventNormalizationRegistry,
        "$registerEventHook": statics.$registerEventHook,
        "$unregisterEventHook": statics.$unregisterEventHook,
        "$getEventHookRegistry": statics.$getEventHookRegistry
      });
    }
  });
  qx.module.Event.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.Event": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Event": {},
      "qx.event.Emitter": {},
      "qx.event.handler.PointerCore": {},
      "qxWeb": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "event.dispatchevent": {
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
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * TODOC
   *
   * @require(qx.module.Event)
   *
   * @group (Event_Normalization)
   */
  qx.Bootstrap.define("qx.module.event.PointerHandler", {
    statics: {
      /**
       * List of events that require a pointer handler
       */
      TYPES: ["pointermove", "pointerover", "pointerout", "pointerdown", "pointerup", "pointercancel", "gesturebegin", "gesturemove", "gesturefinish", "gesturecancel"],

      /**
       * Creates a pointer handler for the given element when a pointer event listener
       * is attached to it
       *
       * @param element {Element} DOM element
       * @param type {String} event type
       */
      register: function register(element, type) {
        if (!element.$$pointerHandler) {
          if (!qx.core.Environment.get("event.dispatchevent")) {
            if (!element.$$emitter) {
              element.$$emitter = new qx.event.Emitter();
            }
          }

          element.$$pointerHandler = new qx.event.handler.PointerCore(element, element.$$emitter);
        }
      },

      /**
       * Removes the pointer event handler from the element if there are no more
       * pointer event listeners attached to it
       * @param element {Element} DOM element
       */
      unregister: function unregister(element) {
        // check if there are any registered listeners left
        if (element.$$pointerHandler) {
          // in a standalone or in-line application the pointer handler of
          // document will be qx.event.handler.Pointer, do not dispose that handler.
          // see constructor of qx.event.handler.Pointer
          if (element.$$pointerHandler.classname === "qx.event.handler.Pointer") {
            return;
          }

          var listeners = element.$$emitter.getListeners();

          for (var type in listeners) {
            if (qx.module.event.PointerHandler.TYPES.indexOf(type) !== -1) {
              if (listeners[type].length > 0) {
                return;
              }
            }
          } // no more listeners, get rid of the handler


          element.$$pointerHandler.dispose();
          element.$$pointerHandler = undefined;
        }
      }
    },
    defer: function defer(statics) {
      qxWeb.$registerEventHook(statics.TYPES, statics.register, statics.unregister);
    }
  });
  qx.module.event.PointerHandler.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.Css": {
        "require": true,
        "defer": "runtime"
      },
      "qx.module.Event": {
        "require": true,
        "defer": "runtime"
      },
      "qx.module.Environment": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Animation": {},
      "qxWeb": {
        "defer": "runtime"
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Cross browser animation layer. It uses feature detection to check if CSS
   * animations are available and ready to use. If not, a JavaScript-based
   * fallback will be used.
   *
   * @require(qx.module.Css)
   * @require(qx.module.Event)
   * @require(qx.module.Environment)
   */
  qx.Bootstrap.define("qx.module.Animation", {
    events: {
      /** Fired when an animation starts. */
      "animationStart": undefined,

      /** Fired when an animation has ended one iteration. */
      "animationIteration": undefined,

      /** Fired when an animation has ended. */
      "animationEnd": undefined
    },
    statics: {
      /**
       * Animation description used in {@link #fadeOut}.
       */
      _fadeOut: {
        duration: 700,
        timing: "ease-out",
        keep: 100,
        keyFrames: {
          0: {
            opacity: 1
          },
          100: {
            opacity: 0,
            display: "none"
          }
        }
      },

      /**
       * Animation description used in {@link #fadeIn}.
       */
      _fadeIn: {
        duration: 700,
        timing: "ease-in",
        keep: 100,
        keyFrames: {
          0: {
            opacity: 0
          },
          100: {
            opacity: 1
          }
        }
      },

      /**
       * Animation execute either regular or reversed direction.
       * @param desc {Map} The animation"s description.
       * @param duration {Number?} The duration in milliseconds of the animation,
       *   which will override the duration given in the description.
       * @param reverse {Boolean} <code>true</code>, if the animation should be reversed
       */
      _animate: function _animate(desc, duration, reverse) {
        this._forEachElement(function (el, i) {
          // stop all running animations
          if (el.$$animation) {
            el.$$animation.stop();
          }

          var handle;

          if (reverse) {
            handle = qx.bom.element.Animation.animateReverse(el, desc, duration);
          } else {
            handle = qx.bom.element.Animation.animate(el, desc, duration);
          }

          var self = this; // only register for the first element

          if (i == 0) {
            handle.on("start", function () {
              self.emit("animationStart");
            }, handle);
            handle.on("iteration", function () {
              self.emit("animationIteration");
            }, handle);
          }

          handle.on("end", function () {
            for (var i = 0; i < self.length; i++) {
              if (self[i].$$animation) {
                return;
              }
            }

            self.emit("animationEnd");
          }, el);
        });
      }
    },
    members: {
      /**
       * Returns the stored animation handles. The handles are only
       * available while an animation is running.
       *
       * @internal
       * @return {Array} An array of animation handles.
       */
      getAnimationHandles: function getAnimationHandles() {
        var animationHandles = [];

        for (var i = 0; i < this.length; i++) {
          animationHandles[i] = this[i].$$animation;
        }

        return animationHandles;
      },

      /**
       * Starts the animation with the given description.
       *
       * *duration* is the time in milliseconds one animation cycle should take.
       *
       * *keep* is the key frame to apply at the end of the animation. (optional)
       *
       * *keyFrames* is a map of separate frames. Each frame is defined by a
       *   number which is the percentage value of time in the animation. The value
       *   is a map itself which holds css properties or transforms
       *   (Transforms only for CSS Animations).
       *
       * *origin* maps to the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin">transform origin</a>
       * (Only for CSS animations).
       *
       * *repeat* is the amount of time the animation should be run in
       *   sequence. You can also use "infinite".
       *
       * *timing* takes one of these predefined values:
       *   <code>ease</code> | <code>linear</code> | <code>ease-in</code>
       *   | <code>ease-out</code> | <code>ease-in-out</code> |
       *   <code>cubic-bezier(&lt;number&gt;, &lt;number&gt;, &lt;number&gt;, &lt;number&gt;)</code>
       *   (cubic-bezier only available for CSS animations)
       *
       * *alternate* defines if every other animation should be run in reverse order.
       *
       * *delay* is the time in milliseconds the animation should wait before start.
       *
       * @attach {qxWeb}
       * @param desc {Map} The animation"s description.
       * @param duration {Number?} The duration in milliseconds of the animation,
       *   which will override the duration given in the description.
       * @return {qxWeb} The collection for chaining.
       */
      animate: function animate(desc, duration) {
        qx.module.Animation._animate.bind(this)(desc, duration, false);

        return this;
      },

      /**
       * Starts an animation in reversed order. For further details, take a look at
       * the {@link #animate} method.
       * @attach {qxWeb}
       * @param desc {Map} The animation"s description.
       * @param duration {Number?} The duration in milliseconds of the animation,
       *   which will override the duration given in the description.
       * @return {qxWeb} The collection for chaining.
       */
      animateReverse: function animateReverse(desc, duration) {
        qx.module.Animation._animate.bind(this)(desc, duration, true);

        return this;
      },

      /**
       * Manipulates the play state of the animation.
       * This can be used to continue an animation when paused.
       * @attach {qxWeb}
       * @return {qxWeb} The collection for chaining.
       */
      play: function play() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle) {
            handle.play();
          }
        }

        return this;
      },

      /**
       * Manipulates the play state of the animation.
       * This can be used to pause an animation when running.
       * @attach {qxWeb}
       * @return {qxWeb} The collection for chaining.
       */
      pause: function pause() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle) {
            handle.pause();
          }
        }

        return this;
      },

      /**
       * Stops a running animation.
       * @attach {qxWeb}
       * @return {qxWeb} The collection for chaining.
       */
      stop: function stop() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle) {
            handle.stop();
          }
        }

        return this;
      },

      /**
       * Returns whether an animation is running or not.
       * @attach {qxWeb}
       * @return {Boolean} <code>true</code>, if an animation is running.
       */
      isPlaying: function isPlaying() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle && handle.isPlaying()) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns whether an animation has ended or not.
       * @attach {qxWeb}
       * @return {Boolean} <code>true</code>, if an animation has ended.
       */
      isEnded: function isEnded() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle && !handle.isEnded()) {
            return false;
          }
        }

        return true;
      },

      /**
       * Fades in all elements in the collection.
       * @attach {qxWeb}
       * @param duration {Number?} The duration in milliseconds.
       * @return {qxWeb} The collection for chaining.
       */
      fadeIn: function fadeIn(duration) {
        // remove "display: none" style
        this.setStyle("display", "");
        return this.animate(qx.module.Animation._fadeIn, duration);
      },

      /**
       * Fades out all elements in the collection.
       * @attach {qxWeb}
       * @param duration {Number?} The duration in milliseconds.
       * @return {qxWeb} The collection for chaining.
       */
      fadeOut: function fadeOut(duration) {
        return this.animate(qx.module.Animation._fadeOut, duration);
      }
    },
    defer: function defer(statics) {
      qxWeb.$attachAll(this);
      /**
       * End value for opacity style. This value is modified for all browsers which are
       * 'optimizing' this style value by not setting it (like IE9). This leads to a wrong
       * end state for the 'fadeIn' animation if a opacity value is set by CSS.
       */

      if (qxWeb.env.get("browser.name") === "ie" && qxWeb.env.get("browser.version") <= 9) {
        // has to be fixed using direct access since we cannot store the value as static member.
        // The 'fadeIn' description is evaluated during class definition
        statics._fadeIn.keyFrames[100].opacity = 0.99;
      }
    }
  });
  qx.module.Animation.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.Animation": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.log.Logger": {},
      "qx.bom.Element": {},
      "qx.dom.Hierarchy": {},
      "qx.bom.client.Engine": {},
      "qx.bom.element.Scroll": {},
      "qx.bom.Selection": {},
      "qx.event.handler.Appear": {},
      "qx.event.Registration": {
        "defer": "runtime"
      },
      "qx.event.handler.Focus": {},
      "qx.event.dispatch.MouseCapture": {},
      "qx.core.Assert": {},
      "qx.dom.Element": {},
      "qx.core.Id": {},
      "qx.bom.element.Attribute": {},
      "qx.bom.element.Style": {},
      "qx.lang.Array": {},
      "qx.bom.client.Css": {},
      "qx.event.Manager": {},
      "qx.util.DeferredCall": {
        "defer": "runtime"
      },
      "qx.core.ObjectRegistry": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "module.objectid": {},
        "css.userselect": {
          "className": "qx.bom.client.Css"
        },
        "css.userselect.none": {
          "className": "qx.bom.client.Css"
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
  
  ************************************************************************ */

  /**
   * High-performance, high-level DOM element creation and management.
   *
   * Includes support for HTML and style attributes. Elements also have
   * got a powerful children and visibility management.
   *
   * Processes DOM insertion and modification with advanced logic
   * to reduce the real transactions.
   *
   * From the view of the parent you can use the following children management
   * methods:
   * {@link #getChildren}, {@link #indexOf}, {@link #hasChild}, {@link #add},
   * {@link #addAt}, {@link #remove}, {@link #removeAt}, {@link #removeAll}
   *
   * Each child itself also has got some powerful methods to control its
   * position:
   * {@link #getParent}, {@link #free},
   * {@link #insertInto}, {@link #insertBefore}, {@link #insertAfter},
   * {@link #moveTo}, {@link #moveBefore}, {@link #moveAfter},
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.module.Animation)
   */
  qx.Class.define("qx.html.Element", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Creates a new Element
     *
     * @param tagName {String?"div"} Tag name of the element to create
     * @param styles {Map?null} optional map of CSS styles, where the key is the name
     *    of the style and the value is the value to use.
     * @param attributes {Map?null} optional map of element attributes, where the
     *    key is the name of the attribute and the value is the value to use.
     */
    construct: function construct(tagName, styles, attributes) {
      qx.core.Object.constructor.call(this); // {String} Set tag name

      this.__nodeName = tagName || "div";
      this.__styleValues = styles || null;
      this.__attribValues = attributes || null;
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /*
      ---------------------------------------------------------------------------
        STATIC DATA
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} If debugging should be enabled */
      DEBUG: false,

      /** @type {Map} Contains the modified {@link qx.html.Element}s. The key is the hash code. */
      _modified: {},

      /** @type {Map} Contains the {@link qx.html.Element}s which should get hidden or visible at the next flush. The key is the hash code. */
      _visibility: {},

      /** @type {Map} Contains the {@link qx.html.Element}s which should scrolled at the next flush */
      _scroll: {},

      /** @type {Array} List of post actions for elements. The key is the action name. The value the {@link qx.html.Element}. */
      _actions: [],

      /**  @type {Map} List of all selections. */
      __selection: {},
      __focusHandler: null,
      __mouseCapture: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC ELEMENT FLUSH
      ---------------------------------------------------------------------------
      */

      /**
       * Schedule a deferred element queue flush. If the widget subsystem is used
       * this method gets overwritten by {@link qx.ui.core.queue.Manager}.
       *
       * @param job {String} The job descriptor. Should always be <code>"element"</code>.
       */
      _scheduleFlush: function _scheduleFlush(job) {
        qx.html.Element.__deferredCall.schedule();
      },

      /**
       * Flush the global modified list
       */
      flush: function flush() {
        var obj;
        {
          if (this.DEBUG) {
            qx.log.Logger.debug(this, "Flushing elements...");
          }
        } // blur elements, which will be removed

        var focusHandler = this.__getFocusHandler();

        var focusedDomElement = focusHandler.getFocus();

        if (focusedDomElement && this.__willBecomeInvisible(focusedDomElement)) {
          focusHandler.blur(focusedDomElement);
        } // decativate elements, which will be removed


        var activeDomElement = focusHandler.getActive();

        if (activeDomElement && this.__willBecomeInvisible(activeDomElement)) {
          qx.bom.Element.deactivate(activeDomElement);
        } // release capture for elements, which will be removed


        var captureDomElement = this.__getCaptureElement();

        if (captureDomElement && this.__willBecomeInvisible(captureDomElement)) {
          qx.bom.Element.releaseCapture(captureDomElement);
        }

        var later = [];
        var modified = this._modified;

        for (var hc in modified) {
          obj = modified[hc]; // Ignore all hidden elements except iframes
          // but keep them until they get visible (again)

          if (obj.__willBeSeeable() || obj.classname == "qx.html.Iframe") {
            // Separately queue rendered elements
            if (obj.__element && qx.dom.Hierarchy.isRendered(obj.__element)) {
              later.push(obj);
            } // Flush invisible elements first
            else {
                {
                  if (this.DEBUG) {
                    obj.debug("Flush invisible element");
                  }
                }

                obj.__flush();
              } // Cleanup modification list


            delete modified[hc];
          }
        }

        for (var i = 0, l = later.length; i < l; i++) {
          obj = later[i];
          {
            if (this.DEBUG) {
              obj.debug("Flush rendered element");
            }
          }

          obj.__flush();
        } // Process visibility list


        var visibility = this._visibility;

        for (var hc in visibility) {
          obj = visibility[hc];
          var element = obj.__element;

          if (!element) {
            delete visibility[hc];
            continue;
          }

          {
            if (this.DEBUG) {
              qx.log.Logger.debug(this, "Switching visibility to: " + obj.__visible);
            }
          } // hiding or showing an object and deleting it right after that may
          // cause an disposed object in the visibility queue [BUG #3607]

          if (!obj.$$disposed) {
            element.style.display = obj.__visible ? "" : "none"; // also hide the element (fixed some rendering problem in IE<8 & IE8 quirks)

            if (qx.core.Environment.get("engine.name") == "mshtml") {
              if (!(document.documentMode >= 8)) {
                element.style.visibility = obj.__visible ? "visible" : "hidden";
              }
            }
          }

          delete visibility[hc];
        } // Process scroll list


        var scroll = this._scroll;

        for (var hc in scroll) {
          obj = scroll[hc];
          var elem = obj.__element;

          if (elem && elem.offsetWidth) {
            var done = true; // ScrollToX

            if (obj.__lazyScrollX != null) {
              obj.__element.scrollLeft = obj.__lazyScrollX;
              delete obj.__lazyScrollX;
            } // ScrollToY


            if (obj.__lazyScrollY != null) {
              obj.__element.scrollTop = obj.__lazyScrollY;
              delete obj.__lazyScrollY;
            } // ScrollIntoViewX


            var intoViewX = obj.__lazyScrollIntoViewX;

            if (intoViewX != null) {
              var child = intoViewX.element.getDomElement();

              if (child && child.offsetWidth) {
                qx.bom.element.Scroll.intoViewX(child, elem, intoViewX.align);
                delete obj.__lazyScrollIntoViewX;
              } else {
                done = false;
              }
            } // ScrollIntoViewY


            var intoViewY = obj.__lazyScrollIntoViewY;

            if (intoViewY != null) {
              var child = intoViewY.element.getDomElement();

              if (child && child.offsetWidth) {
                qx.bom.element.Scroll.intoViewY(child, elem, intoViewY.align);
                delete obj.__lazyScrollIntoViewY;
              } else {
                done = false;
              }
            } // Clear flag if all things are done
            // Otherwise wait for the next flush


            if (done) {
              delete scroll[hc];
            }
          }
        }

        var activityEndActions = {
          "releaseCapture": 1,
          "blur": 1,
          "deactivate": 1
        }; // Process action list

        for (var i = 0; i < this._actions.length; i++) {
          var action = this._actions[i];
          var element = action.element.__element;

          if (!element || !activityEndActions[action.type] && !action.element.__willBeSeeable()) {
            continue;
          }

          var args = action.args;
          args.unshift(element);
          qx.bom.Element[action.type].apply(qx.bom.Element, args);
        }

        this._actions = []; // Process selection

        for (var hc in this.__selection) {
          var selection = this.__selection[hc];
          var elem = selection.element.__element;

          if (elem) {
            qx.bom.Selection.set(elem, selection.start, selection.end);
            delete this.__selection[hc];
          }
        } // Fire appear/disappear events


        qx.event.handler.Appear.refresh();
      },

      /**
       * Get the focus handler
       *
       * @return {qx.event.handler.Focus} The focus handler
       */
      __getFocusHandler: function __getFocusHandler() {
        if (!this.__focusHandler) {
          var eventManager = qx.event.Registration.getManager(window);
          this.__focusHandler = eventManager.getHandler(qx.event.handler.Focus);
        }

        return this.__focusHandler;
      },

      /**
       * Get the mouse capture element
       *
       * @return {Element} The mouse capture DOM element
       */
      __getCaptureElement: function __getCaptureElement() {
        if (!this.__mouseCapture) {
          var eventManager = qx.event.Registration.getManager(window);
          this.__mouseCapture = eventManager.getDispatcher(qx.event.dispatch.MouseCapture);
        }

        return this.__mouseCapture.getCaptureElement();
      },

      /**
       * Whether the given DOM element will become invisible after the flush
       *
       * @param domElement {Element} The DOM element to check
       * @return {Boolean} Whether the element will become invisible
       */
      __willBecomeInvisible: function __willBecomeInvisible(domElement) {
        var element = this.fromDomElement(domElement);
        return element && !element.__willBeSeeable();
      },

      /**
       * Finds the Widget for a given DOM element
       *
       * @param domElement {DOM} the DOM element
       * @return {qx.ui.core.Widget} the Widget that created the DOM element
       */
      fromDomElement: function fromDomElement(domElement) {
        {
          qx.core.Assert.assertTrue(!domElement.$$element && !domElement.$$elementObject || domElement.$$element === domElement.$$elementObject.toHashCode());
        }
        return domElement.$$elementObject;
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
        PROTECTED HELPERS/DATA
      ---------------------------------------------------------------------------
      */
      __nodeName: null,

      /** @type {Element} DOM element of this object */
      __element: null,

      /** @type {qx.ui.core.Widget} the Widget this element is attached to */
      __widget: null,

      /** @type {Boolean} Marker for always visible root nodes (often the body node) */
      __root: false,

      /** @type {Boolean} Whether the element should be included in the render result */
      __included: true,

      /** @type {Boolean} Whether the element should be visible in the render result */
      __visible: true,
      __lazyScrollIntoViewX: null,
      __lazyScrollIntoViewY: null,
      __lazyScrollX: null,
      __lazyScrollY: null,
      __styleJobs: null,
      __attribJobs: null,
      __propertyJobs: null,
      __styleValues: null,
      __attribValues: null,
      __propertyValues: null,
      __eventValues: null,
      __children: null,
      __modifiedChildren: null,
      __parent: null,

      /**
       * Add the element to the global modification list.
       *
       */
      _scheduleChildrenUpdate: function _scheduleChildrenUpdate() {
        if (this.__modifiedChildren) {
          return;
        }

        this.__modifiedChildren = true;
        qx.html.Element._modified[this.$$hash] = this;

        qx.html.Element._scheduleFlush("element");
      },

      /**
       * Internal helper to generate the DOM element
       *
       * @return {Element} DOM element
       */
      _createDomElement: function _createDomElement() {
        return qx.dom.Element.create(this.__nodeName);
      },

      /**
       * Connects a widget to this element, and to the DOM element in this Element.  They
       * remain associated until disposed or disconnectWidget is called
       *
       * @param widget {qx.ui.core.Widget} the widget
       */
      connectWidget: function connectWidget(widget) {
        {
          qx.core.Assert.assertTrue(!this.__widget || this.__widget === widget);
        }
        this.__widget = widget;

        if (this.__element) {
          {
            qx.core.Assert.assertTrue(!this.__element.$$widget && !this.__element.$$widgetObject || this.__element.$$widgetObject === widget && this.__element.$$widget === widget.toHashCode());
          }
          this.__element.$$widget = widget.toHashCode();
          this.__element.$$widgetObject = widget;
        }

        if (qx.core.Environment.get("module.objectid")) {
          this.updateObjectId();
        }
      },

      /**
       * Disconnects a widget from this element and the DOM element.  The DOM element remains
       * untouched, except that it can no longer be used to find the Widget.
       *
       * @param widget {qx.ui.core.Widget} the Widget
       */
      disconnectWidget: function disconnectWidget(widget) {
        {
          qx.core.Assert.assertTrue(this.__widget === widget);
        }
        delete this.__widget;

        if (this.__element) {
          {
            qx.core.Assert.assertTrue(!this.__element.$$widget && !this.__element.$$widgetObject || this.__element.$$widgetObject === widget && this.__element.$$widget === widget.toHashCode());
          }
          this.__element.$$widget = "";
          delete this.__element.$$widgetObject;
        }

        if (qx.core.Environment.get("module.objectid")) {
          this.updateObjectId();
        }
      },

      /**
       * Connects a DOM element to this Element; if this Element is already connected to a Widget
       * then the Widget is also connected.
       *
       * @param domElement {DOM} the DOM element to associate
       */
      __connectDomElement: function __connectDomElement(domElement) {
        {
          qx.core.Assert.assertTrue(!this.__element || this.__element === domElement);
          qx.core.Assert.assertTrue(domElement.$$elementObject === this && domElement.$$element === this.toHashCode() || !domElement.$$elementObject && !domElement.$$element);
        }
        ;
        this.__element = domElement;
        domElement.$$elementObject = this;
        domElement.$$element = this.toHashCode();

        if (this.__widget) {
          domElement.$$widget = this.__widget.toHashCode();
          domElement.$$widgetObject = this.__widget;
        }
      },

      /*
      ---------------------------------------------------------------------------
        FLUSH OBJECT
      ---------------------------------------------------------------------------
      */

      /**
       * Syncs data of an HtmlElement object to the DOM.
       *
       */
      __flush: function __flush() {
        {
          if (this.DEBUG) {
            this.debug("Flush: " + this.getAttribute("id"));
          }
        }
        var length;
        var children = this.__children;

        if (children) {
          length = children.length;
          var child;

          for (var i = 0; i < length; i++) {
            child = children[i];

            if (child.__visible && child.__included && !child.__element) {
              child.__flush();
            }
          }
        }

        if (!this.__element) {
          this.__connectDomElement(this._createDomElement());

          this._copyData(false);

          if (children && length > 0) {
            this._insertChildren();
          }
        } else {
          this._syncData();

          if (this.__modifiedChildren) {
            this._syncChildren();
          }
        }

        delete this.__modifiedChildren;
      },

      /*
      ---------------------------------------------------------------------------
        SUPPORT FOR CHILDREN FLUSH
      ---------------------------------------------------------------------------
      */

      /**
       * Append all child nodes to the DOM
       * element. This function is used when the element is initially
       * created. After this initial apply {@link #_syncChildren} is used
       * instead.
       *
       */
      _insertChildren: function _insertChildren() {
        var children = this.__children;
        var length = children.length;
        var child;

        if (length > 2) {
          var domElement = document.createDocumentFragment();

          for (var i = 0; i < length; i++) {
            child = children[i];

            if (child.__element && child.__included) {
              domElement.appendChild(child.__element);
            }
          }

          this.__element.appendChild(domElement);
        } else {
          var domElement = this.__element;

          for (var i = 0; i < length; i++) {
            child = children[i];

            if (child.__element && child.__included) {
              domElement.appendChild(child.__element);
            }
          }
        }
      },

      /**
       * Synchronize internal children hierarchy to the DOM. This is used
       * for further runtime updates after the element has been created
       * initially.
       *
       */
      _syncChildren: function _syncChildren() {
        var dataChildren = this.__children;
        var dataLength = dataChildren.length;
        var dataChild;
        var dataEl;
        var domParent = this.__element;
        var domChildren = domParent.childNodes;
        var domPos = 0;
        var domEl;
        {
          var domOperations = 0;
        } // Remove children from DOM which are excluded or remove first

        for (var i = domChildren.length - 1; i >= 0; i--) {
          domEl = domChildren[i];
          dataEl = qx.html.Element.fromDomElement(domEl);

          if (!dataEl || !dataEl.__included || dataEl.__parent !== this) {
            domParent.removeChild(domEl);
            {
              domOperations++;
            }
          }
        } // Start from beginning and bring DOM in sync
        // with the data structure


        for (var i = 0; i < dataLength; i++) {
          dataChild = dataChildren[i]; // Only process visible childs

          if (dataChild.__included) {
            dataEl = dataChild.__element;
            domEl = domChildren[domPos];

            if (!dataEl) {
              continue;
            } // Only do something when out of sync
            // If the data element is not there it may mean that it is still
            // marked as visible=false


            if (dataEl != domEl) {
              if (domEl) {
                domParent.insertBefore(dataEl, domEl);
              } else {
                domParent.appendChild(dataEl);
              }

              {
                domOperations++;
              }
            } // Increase counter


            domPos++;
          }
        } // User feedback


        {
          if (qx.html.Element.DEBUG) {
            this.debug("Synced DOM with " + domOperations + " operations");
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        SUPPORT FOR ATTRIBUTE/STYLE/EVENT FLUSH
      ---------------------------------------------------------------------------
      */
      updateObjectId: function updateObjectId() {
        // Copy Object Id
        if (qx.core.Environment.get("module.objectid")) {
          var id = null;

          if (this.__widget && this.__widget.getQxObjectId()) {
            id = qx.core.Id.getAbsoluteIdOf(this.__widget, true) || null;
          }

          this.setAttribute("data-qx-object-id", id, true);
        }
      },

      /**
       * Copies data between the internal representation and the DOM. This
       * simply copies all the data and only works well directly after
       * element creation. After this the data must be synced using {@link #_syncData}
       *
       * @param fromMarkup {Boolean} Whether the copy should respect styles
       *   given from markup
       */
      _copyData: function _copyData(fromMarkup) {
        var elem = this.__element; // Copy attributes

        var data = this.__attribValues;

        if (data) {
          var Attribute = qx.bom.element.Attribute;

          for (var key in data) {
            Attribute.set(elem, key, data[key]);
          }
        } // Copy styles


        var data = this.__styleValues;

        if (data) {
          var Style = qx.bom.element.Style;

          if (fromMarkup) {
            Style.setStyles(elem, data);
          } else {
            // Set styles at once which is a lot faster in most browsers
            // compared to separate modifications of many single style properties.
            Style.setCss(elem, Style.compile(data));
          }
        } // Copy properties


        var data = this.__propertyValues;

        if (data) {
          for (var key in data) {
            this._applyProperty(key, data[key]);
          }
        } // Attach events


        var data = this.__eventValues;

        if (data) {
          // Import listeners
          qx.event.Registration.getManager(elem).importListeners(elem, data); // Cleanup event map
          // Events are directly attached through event manager
          // after initial creation. This differs from the
          // handling of styles and attributes where queuing happens
          // through the complete runtime of the application.

          delete this.__eventValues;
        }
      },

      /**
       * Synchronizes data between the internal representation and the DOM. This
       * is the counterpart of {@link #_copyData} and is used for further updates
       * after the element has been created.
       *
       */
      _syncData: function _syncData() {
        var elem = this.__element;
        var Attribute = qx.bom.element.Attribute;
        var Style = qx.bom.element.Style; // Sync attributes

        var jobs = this.__attribJobs;

        if (jobs) {
          var data = this.__attribValues;

          if (data) {
            var value;

            for (var key in jobs) {
              value = data[key];

              if (value !== undefined) {
                Attribute.set(elem, key, value);
              } else {
                Attribute.reset(elem, key);
              }
            }
          }

          this.__attribJobs = null;
        } // Sync styles


        var jobs = this.__styleJobs;

        if (jobs) {
          var data = this.__styleValues;

          if (data) {
            var styles = {};

            for (var key in jobs) {
              styles[key] = data[key];
            }

            Style.setStyles(elem, styles);
          }

          this.__styleJobs = null;
        } // Sync misc


        var jobs = this.__propertyJobs;

        if (jobs) {
          var data = this.__propertyValues;

          if (data) {
            var value;

            for (var key in jobs) {
              this._applyProperty(key, data[key]);
            }
          }

          this.__propertyJobs = null;
        } // Note: Events are directly kept in sync

      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE HELPERS/DATA
      ---------------------------------------------------------------------------
      */

      /**
       * Walk up the internal children hierarchy and
       * look if one of the children is marked as root.
       *
       * This method is quite performance hungry as it
       * really walks up recursively.
       * @return {Boolean} <code>true</code> if the element will be seeable
       */
      __willBeSeeable: function __willBeSeeable() {
        var pa = this; // Any chance to cache this information in the parents?

        while (pa) {
          if (pa.__root) {
            return true;
          }

          if (!pa.__included || !pa.__visible) {
            return false;
          }

          pa = pa.__parent;
        }

        return false;
      },

      /**
       * Internal helper for all children addition needs
       *
       * @param child {var} the element to add
       * @throws {Error} if the given element is already a child
       *     of this element
       */
      __addChildHelper: function __addChildHelper(child) {
        if (child.__parent === this) {
          throw new Error("Child is already in: " + child);
        }

        if (child.__root) {
          throw new Error("Root elements could not be inserted into other ones.");
        } // Remove from previous parent


        if (child.__parent) {
          child.__parent.remove(child);
        } // Convert to child of this object


        child.__parent = this; // Prepare array

        if (!this.__children) {
          this.__children = [];
        } // Schedule children update


        if (this.__element) {
          this._scheduleChildrenUpdate();
        }
      },

      /**
       * Internal helper for all children removal needs
       *
       * @param child {qx.html.Element} the removed element
       * @throws {Error} if the given element is not a child
       *     of this element
       */
      __removeChildHelper: function __removeChildHelper(child) {
        if (child.__parent !== this) {
          throw new Error("Has no child: " + child);
        } // Schedule children update


        if (this.__element) {
          this._scheduleChildrenUpdate();
        } // Remove reference to old parent


        delete child.__parent;
      },

      /**
       * Internal helper for all children move needs
       *
       * @param child {qx.html.Element} the moved element
       * @throws {Error} if the given element is not a child
       *     of this element
       */
      __moveChildHelper: function __moveChildHelper(child) {
        if (child.__parent !== this) {
          throw new Error("Has no child: " + child);
        } // Schedule children update


        if (this.__element) {
          this._scheduleChildrenUpdate();
        }
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN MANAGEMENT (EXECUTED ON THE PARENT)
      ---------------------------------------------------------------------------
      */

      /**
       * Returns a copy of the internal children structure.
       *
       * Please do not modify the array in place. If you need
       * to work with the data in such a way make yourself
       * a copy of the data first.
       *
       * @return {Array} the children list
       */
      getChildren: function getChildren() {
        return this.__children || null;
      },

      /**
       * Get a child element at the given index
       *
       * @param index {Integer} child index
       * @return {qx.html.Element|null} The child element or <code>null</code> if
       *     no child is found at that index.
       */
      getChild: function getChild(index) {
        var children = this.__children;
        return children && children[index] || null;
      },

      /**
       * Returns whether the element has any child nodes
       *
       * @return {Boolean} Whether the element has any child nodes
       */
      hasChildren: function hasChildren() {
        var children = this.__children;
        return children && children[0] !== undefined;
      },

      /**
       * Find the position of the given child
       *
       * @param child {qx.html.Element} the child
       * @return {Integer} returns the position. If the element
       *     is not a child <code>-1</code> will be returned.
       */
      indexOf: function indexOf(child) {
        var children = this.__children;
        return children ? children.indexOf(child) : -1;
      },

      /**
       * Whether the given element is a child of this element.
       *
       * @param child {qx.html.Element} the child
       * @return {Boolean} Returns <code>true</code> when the given
       *    element is a child of this element.
       */
      hasChild: function hasChild(child) {
        var children = this.__children;
        return children && children.indexOf(child) !== -1;
      },

      /**
       * Append all given children at the end of this element.
       *
       * @param varargs {qx.html.Element} elements to insert
       * @return {qx.html.Element} this object (for chaining support)
       */
      add: function add(varargs) {
        if (arguments[1]) {
          for (var i = 0, l = arguments.length; i < l; i++) {
            this.__addChildHelper(arguments[i]);
          }

          this.__children.push.apply(this.__children, arguments);
        } else {
          this.__addChildHelper(varargs);

          this.__children.push(varargs);
        } // Chaining support


        return this;
      },

      /**
       * Inserts a new element into this element at the given position.
       *
       * @param child {qx.html.Element} the element to insert
       * @param index {Integer} the index (starts at 0 for the
       *     first child) to insert (the index of the following
       *     children will be increased by one)
       * @return {qx.html.Element} this object (for chaining support)
       */
      addAt: function addAt(child, index) {
        this.__addChildHelper(child);

        qx.lang.Array.insertAt(this.__children, child, index); // Chaining support

        return this;
      },

      /**
       * Removes all given children
       *
       * @param childs {qx.html.Element} children to remove
       * @return {qx.html.Element} this object (for chaining support)
       */
      remove: function remove(childs) {
        var children = this.__children;

        if (!children) {
          return this;
        }

        if (arguments[1]) {
          var child;

          for (var i = 0, l = arguments.length; i < l; i++) {
            child = arguments[i];

            this.__removeChildHelper(child);

            qx.lang.Array.remove(children, child);
          }
        } else {
          this.__removeChildHelper(childs);

          qx.lang.Array.remove(children, childs);
        } // Chaining support


        return this;
      },

      /**
       * Removes the child at the given index
       *
       * @param index {Integer} the position of the
       *     child (starts at 0 for the first child)
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeAt: function removeAt(index) {
        var children = this.__children;

        if (!children) {
          throw new Error("Has no children!");
        }

        var child = children[index];

        if (!child) {
          throw new Error("Has no child at this position!");
        }

        this.__removeChildHelper(child);

        qx.lang.Array.removeAt(this.__children, index); // Chaining support

        return this;
      },

      /**
       * Remove all children from this element.
       *
       * @return {qx.html.Element} A reference to this.
       */
      removeAll: function removeAll() {
        var children = this.__children;

        if (children) {
          for (var i = 0, l = children.length; i < l; i++) {
            this.__removeChildHelper(children[i]);
          } // Clear array


          children.length = 0;
        } // Chaining support


        return this;
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN MANAGEMENT (EXECUTED ON THE CHILD)
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the parent of this element.
       *
       * @return {qx.html.Element|null} The parent of this element
       */
      getParent: function getParent() {
        return this.__parent || null;
      },

      /**
       * Insert self into the given parent. Normally appends self to the end,
       * but optionally a position can be defined. With index <code>0</code> it
       * will be inserted at the begin.
       *
       * @param parent {qx.html.Element} The new parent of this element
       * @param index {Integer?null} Optional position
       * @return {qx.html.Element} this object (for chaining support)
       */
      insertInto: function insertInto(parent, index) {
        parent.__addChildHelper(this);

        if (index == null) {
          parent.__children.push(this);
        } else {
          qx.lang.Array.insertAt(this.__children, this, index);
        }

        return this;
      },

      /**
       * Insert self before the given (related) element
       *
       * @param rel {qx.html.Element} the related element
       * @return {qx.html.Element} this object (for chaining support)
       */
      insertBefore: function insertBefore(rel) {
        var parent = rel.__parent;

        parent.__addChildHelper(this);

        qx.lang.Array.insertBefore(parent.__children, this, rel);
        return this;
      },

      /**
       * Insert self after the given (related) element
       *
       * @param rel {qx.html.Element} the related element
       * @return {qx.html.Element} this object (for chaining support)
       */
      insertAfter: function insertAfter(rel) {
        var parent = rel.__parent;

        parent.__addChildHelper(this);

        qx.lang.Array.insertAfter(parent.__children, this, rel);
        return this;
      },

      /**
       * Move self to the given index in the current parent.
       *
       * @param index {Integer} the index (starts at 0 for the first child)
       * @return {qx.html.Element} this object (for chaining support)
       * @throws {Error} when the given element is not child
       *      of this element.
       */
      moveTo: function moveTo(index) {
        var parent = this.__parent;

        parent.__moveChildHelper(this);

        var oldIndex = parent.__children.indexOf(this);

        if (oldIndex === index) {
          throw new Error("Could not move to same index!");
        } else if (oldIndex < index) {
          index--;
        }

        qx.lang.Array.removeAt(parent.__children, oldIndex);
        qx.lang.Array.insertAt(parent.__children, this, index);
        return this;
      },

      /**
       * Move self before the given (related) child.
       *
       * @param rel {qx.html.Element} the related child
       * @return {qx.html.Element} this object (for chaining support)
       */
      moveBefore: function moveBefore(rel) {
        var parent = this.__parent;
        return this.moveTo(parent.__children.indexOf(rel));
      },

      /**
       * Move self after the given (related) child.
       *
       * @param rel {qx.html.Element} the related child
       * @return {qx.html.Element} this object (for chaining support)
       */
      moveAfter: function moveAfter(rel) {
        var parent = this.__parent;
        return this.moveTo(parent.__children.indexOf(rel) + 1);
      },

      /**
       * Remove self from the current parent.
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      free: function free() {
        var parent = this.__parent;

        if (!parent) {
          throw new Error("Has no parent to remove from.");
        }

        if (!parent.__children) {
          return this;
        }

        parent.__removeChildHelper(this);

        qx.lang.Array.remove(parent.__children, this);
        return this;
      },

      /*
      ---------------------------------------------------------------------------
        DOM ELEMENT ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the DOM element (if created). Please use this with caution.
       * It is better to make all changes to the object itself using the public
       * API rather than to the underlying DOM element.
       *
       * @return {Element|null} The DOM element node, if available.
       */
      getDomElement: function getDomElement() {
        return this.__element || null;
      },

      /**
       * Returns the nodeName of the DOM element.
       *
       * @return {String} The node name
       */
      getNodeName: function getNodeName() {
        return this.__nodeName;
      },

      /**
       * Sets the nodeName of the DOM element.
       *
       * @param name {String} The node name
       */
      setNodeName: function setNodeName(name) {
        this.__nodeName = name;
      },

      /**
       * Sets the element's root flag, which indicates
       * whether the element should be a root element or not.
       * @param root {Boolean} The root flag.
       */
      setRoot: function setRoot(root) {
        this.__root = root;
      },

      /**
       * Uses existing markup for this element. This is mainly used
       * to insert pre-built markup blocks into the element hierarchy.
       *
       * @param html {String} HTML markup with one root element
       *   which is used as the main element for this instance.
       * @return {Element} The created DOM element
       */
      useMarkup: function useMarkup(html) {
        if (this.__element) {
          throw new Error("Could not overwrite existing element!");
        } // Prepare extraction
        // We have a IE specific issue with "Unknown error" messages
        // when we try to use the same DOM node again. I am not sure
        // why this happens. Would be a good performance improvement,
        // but does not seem to work.


        if (qx.core.Environment.get("engine.name") == "mshtml") {
          var helper = document.createElement("div");
        } else {
          var helper = qx.dom.Element.getHelperElement();
        } // Extract first element


        helper.innerHTML = html;
        this.useElement(helper.firstChild);
        return this.__element;
      },

      /**
       * Uses an existing element instead of creating one. This may be interesting
       * when the DOM element is directly needed to add content etc.
       *
       * @param elem {Element} Element to reuse
       */
      useElement: function useElement(elem) {
        if (this.__element) {
          throw new Error("Could not overwrite existing element!");
        } // Use incoming element


        this.__connectDomElement(elem); // Copy currently existing data over to element


        this._copyData(true);
      },

      /**
       * Whether the element is focusable (or will be when created)
       *
       * @return {Boolean} <code>true</code> when the element is focusable.
       */
      isFocusable: function isFocusable() {
        var tabIndex = this.getAttribute("tabIndex");

        if (tabIndex >= 1) {
          return true;
        }

        var focusable = qx.event.handler.Focus.FOCUSABLE_ELEMENTS;

        if (tabIndex >= 0 && focusable[this.__nodeName]) {
          return true;
        }

        return false;
      },

      /**
       * Set whether the element is selectable. It uses the qooxdoo attribute
       * qxSelectable with the values 'on' or 'off'.
       * In webkit, a special css property will be used (-webkit-user-select).
       *
       * @param value {Boolean} True, if the element should be selectable.
       */
      setSelectable: function setSelectable(value) {
        this.setAttribute("qxSelectable", value ? "on" : "off");
        var userSelect = qx.core.Environment.get("css.userselect");

        if (userSelect) {
          this.setStyle(userSelect, value ? "text" : qx.core.Environment.get("css.userselect.none"));
        }
      },

      /**
       * Whether the element is natively focusable (or will be when created)
       *
       * This ignores the configured tabIndex.
       *
       * @return {Boolean} <code>true</code> when the element is focusable.
       */
      isNativelyFocusable: function isNativelyFocusable() {
        return !!qx.event.handler.Focus.FOCUSABLE_ELEMENTS[this.__nodeName];
      },

      /*
      ---------------------------------------------------------------------------
        EXCLUDE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Marks the element as included which means it will be moved into
       * the DOM again and synced with the internal data representation.
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      include: function include() {
        if (this.__included) {
          return this;
        }

        delete this.__included;

        if (this.__parent) {
          this.__parent._scheduleChildrenUpdate();
        }

        return this;
      },

      /**
       * Marks the element as excluded which means it will be removed
       * from the DOM and ignored for updates until it gets included again.
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      exclude: function exclude() {
        if (!this.__included) {
          return this;
        }

        this.__included = false;

        if (this.__parent) {
          this.__parent._scheduleChildrenUpdate();
        }

        return this;
      },

      /**
       * Whether the element is part of the DOM
       *
       * @return {Boolean} Whether the element is part of the DOM.
       */
      isIncluded: function isIncluded() {
        return this.__included === true;
      },

      /*
      ---------------------------------------------------------------------------
        ANIMATION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Fades in the element.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeIn: function fadeIn(duration) {
        var col = qxWeb(this.__element);

        if (col.isPlaying()) {
          col.stop();
        } // create the element right away


        if (!this.__element) {
          this.__flush();

          col.push(this.__element);
        }

        if (this.__element) {
          col.fadeIn(duration).once("animationEnd", function () {
            this.show();
            qx.html.Element.flush();
          }, this);
          return col.getAnimationHandles()[0];
        }
      },

      /**
       * Fades out the element.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeOut: function fadeOut(duration) {
        var col = qxWeb(this.__element);

        if (col.isPlaying()) {
          col.stop();
        }

        if (this.__element) {
          col.fadeOut(duration).once("animationEnd", function () {
            this.hide();
            qx.html.Element.flush();
          }, this);
          return col.getAnimationHandles()[0];
        }
      },

      /*
      ---------------------------------------------------------------------------
        VISIBILITY SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Marks the element as visible which means that a previously applied
       * CSS style of display=none gets removed and the element will inserted
       * into the DOM, when this had not already happened before.
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      show: function show() {
        if (this.__visible) {
          return this;
        }

        if (this.__element) {
          qx.html.Element._visibility[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        } // Must be sure that the element gets included into the DOM.


        if (this.__parent) {
          this.__parent._scheduleChildrenUpdate();
        }

        delete this.__visible;
        return this;
      },

      /**
       * Marks the element as hidden which means it will kept in DOM (if it
       * is already there, but configured hidden using a CSS style of display=none).
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      hide: function hide() {
        if (!this.__visible) {
          return this;
        }

        if (this.__element) {
          qx.html.Element._visibility[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }

        this.__visible = false;
        return this;
      },

      /**
       * Whether the element is visible.
       *
       * Please note: This does not control the visibility or parent inclusion recursively.
       *
       * @return {Boolean} Returns <code>true</code> when the element is configured
       *   to be visible.
       */
      isVisible: function isVisible() {
        return this.__visible === true;
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls the given child element into view. Only scrolls children.
       * Do not influence elements on top of this element.
       *
       * If the element is currently invisible it gets scrolled automatically
       * at the next time it is visible again (queued).
       *
       * @param elem {qx.html.Element} The element to scroll into the viewport.
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewX: function scrollChildIntoViewX(elem, align, direct) {
        var thisEl = this.__element;
        var childEl = elem.getDomElement();

        if (direct !== false && thisEl && thisEl.offsetWidth && childEl && childEl.offsetWidth) {
          qx.bom.element.Scroll.intoViewX(childEl, thisEl, align);
        } else {
          this.__lazyScrollIntoViewX = {
            element: elem,
            align: align
          };
          qx.html.Element._scroll[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }

        delete this.__lazyScrollX;
      },

      /**
       * Scrolls the given child element into view. Only scrolls children.
       * Do not influence elements on top of this element.
       *
       * If the element is currently invisible it gets scrolled automatically
       * at the next time it is visible again (queued).
       *
       * @param elem {qx.html.Element} The element to scroll into the viewport.
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewY: function scrollChildIntoViewY(elem, align, direct) {
        var thisEl = this.__element;
        var childEl = elem.getDomElement();

        if (direct !== false && thisEl && thisEl.offsetWidth && childEl && childEl.offsetWidth) {
          qx.bom.element.Scroll.intoViewY(childEl, thisEl, align);
        } else {
          this.__lazyScrollIntoViewY = {
            element: elem,
            align: align
          };
          qx.html.Element._scroll[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }

        delete this.__lazyScrollY;
      },

      /**
       * Scrolls the element to the given left position.
       *
       * @param x {Integer} Horizontal scroll position
       * @param lazy {Boolean?false} Whether the scrolling should be performed
       *    during element flush.
       */
      scrollToX: function scrollToX(x, lazy) {
        var thisEl = this.__element;

        if (lazy !== true && thisEl && thisEl.offsetWidth) {
          thisEl.scrollLeft = x;
          delete this.__lazyScrollX;
        } else {
          this.__lazyScrollX = x;
          qx.html.Element._scroll[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }

        delete this.__lazyScrollIntoViewX;
      },

      /**
       * Get the horizontal scroll position.
       *
       * @return {Integer} Horizontal scroll position
       */
      getScrollX: function getScrollX() {
        var thisEl = this.__element;

        if (thisEl) {
          return thisEl.scrollLeft;
        }

        return this.__lazyScrollX || 0;
      },

      /**
       * Scrolls the element to the given top position.
       *
       * @param y {Integer} Vertical scroll position
       * @param lazy {Boolean?false} Whether the scrolling should be performed
       *    during element flush.
       */
      scrollToY: function scrollToY(y, lazy) {
        var thisEl = this.__element;

        if (lazy !== true && thisEl && thisEl.offsetWidth) {
          thisEl.scrollTop = y;
          delete this.__lazyScrollY;
        } else {
          this.__lazyScrollY = y;
          qx.html.Element._scroll[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }

        delete this.__lazyScrollIntoViewY;
      },

      /**
       * Get the vertical scroll position.
       *
       * @return {Integer} Vertical scroll position
       */
      getScrollY: function getScrollY() {
        var thisEl = this.__element;

        if (thisEl) {
          return thisEl.scrollTop;
        }

        return this.__lazyScrollY || 0;
      },

      /**
       * Disables browser-native scrolling
       */
      disableScrolling: function disableScrolling() {
        this.enableScrolling();
        this.scrollToX(0);
        this.scrollToY(0);
        this.addListener("scroll", this.__onScroll, this);
      },

      /**
       * Re-enables browser-native scrolling
       */
      enableScrolling: function enableScrolling() {
        this.removeListener("scroll", this.__onScroll, this);
      },
      __inScroll: null,

      /**
       * Handler for the scroll-event
       *
       * @param e {qx.event.type.Native} scroll-event
       */
      __onScroll: function __onScroll(e) {
        if (!this.__inScroll) {
          this.__inScroll = true;
          this.__element.scrollTop = 0;
          this.__element.scrollLeft = 0;
          delete this.__inScroll;
        }
      },

      /*
      ---------------------------------------------------------------------------
        TEXT SELECTION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Get the selection of the element.
       *
       * If the underlaying DOM element is not yet created, this methods returns
       * a null value.
       *
       * @return {String|null}
       */
      getTextSelection: function getTextSelection() {
        var el = this.__element;

        if (el) {
          return qx.bom.Selection.get(el);
        }

        return null;
      },

      /**
       * Get the length of selection of the element.
       *
       * If the underlaying DOM element is not yet created, this methods returns
       * a null value.
       *
       * @return {Integer|null}
       */
      getTextSelectionLength: function getTextSelectionLength() {
        var el = this.__element;

        if (el) {
          return qx.bom.Selection.getLength(el);
        }

        return null;
      },

      /**
       * Get the start of the selection of the element.
       *
       * If the underlaying DOM element is not yet created, this methods returns
       * a null value.
       *
       * @return {Integer|null}
       */
      getTextSelectionStart: function getTextSelectionStart() {
        var el = this.__element;

        if (el) {
          return qx.bom.Selection.getStart(el);
        }

        return null;
      },

      /**
       * Get the end of the selection of the element.
       *
       * If the underlaying DOM element is not yet created, this methods returns
       * a null value.
       *
       * @return {Integer|null}
       */
      getTextSelectionEnd: function getTextSelectionEnd() {
        var el = this.__element;

        if (el) {
          return qx.bom.Selection.getEnd(el);
        }

        return null;
      },

      /**
       * Set the selection of the element with the given start and end value.
       * If no end value is passed the selection will extend to the end.
       *
       * This method only works if the underlying DOM element is already created.
       *
       * @param start {Integer} start of the selection (zero based)
       * @param end {Integer} end of the selection
       */
      setTextSelection: function setTextSelection(start, end) {
        var el = this.__element;

        if (el) {
          qx.bom.Selection.set(el, start, end);
          return;
        } // if element not created, save the selection for flushing


        qx.html.Element.__selection[this.toHashCode()] = {
          element: this,
          start: start,
          end: end
        };

        qx.html.Element._scheduleFlush("element");
      },

      /**
       * Clears the selection of the element.
       *
       * This method only works if the underlying DOM element is already created.
       *
       */
      clearTextSelection: function clearTextSelection() {
        var el = this.__element;

        if (el) {
          qx.bom.Selection.clear(el);
        }

        delete qx.html.Element.__selection[this.toHashCode()];
      },

      /*
      ---------------------------------------------------------------------------
        FOCUS/ACTIVATE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Takes the action to process as argument and queues this action if the
       * underlying DOM element is not yet created.
       *
       * @param action {String} action to queue
       * @param args {Array} optional list of arguments for the action
       */
      __performAction: function __performAction(action, args) {
        var actions = qx.html.Element._actions;
        actions.push({
          type: action,
          element: this,
          args: args || []
        });

        qx.html.Element._scheduleFlush("element");
      },

      /**
       * Focus this element.
       *
       * If the underlaying DOM element is not yet created, the
       * focus is queued for processing after the element creation.
       *
       */
      focus: function focus() {
        this.__performAction("focus");
      },

      /**
       * Mark this element to get blurred on the next flush of the queue
       *
       */
      blur: function blur() {
        this.__performAction("blur");
      },

      /**
       * Mark this element to get activated on the next flush of the queue
       *
       */
      activate: function activate() {
        this.__performAction("activate");
      },

      /**
       * Mark this element to get deactivated on the next flush of the queue
       *
       */
      deactivate: function deactivate() {
        this.__performAction("deactivate");
      },

      /**
       * Captures all mouse events to this element
       *
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       */
      capture: function capture(containerCapture) {
        this.__performAction("capture", [containerCapture !== false]);
      },

      /**
       * Releases this element from a previous {@link #capture} call
       */
      releaseCapture: function releaseCapture() {
        this.__performAction("releaseCapture");
      },

      /*
      ---------------------------------------------------------------------------
        STYLE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Set up the given style attribute
       *
       * @param key {String} the name of the style attribute
       * @param value {var} the value
       * @param direct {Boolean?false} Whether the value should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      setStyle: function setStyle(key, value, direct) {
        if (!this.__styleValues) {
          this.__styleValues = {};
        }

        if (this.__styleValues[key] == value) {
          return this;
        }

        if (value == null) {
          delete this.__styleValues[key];
        } else {
          this.__styleValues[key] = value;
        } // Uncreated elements simply copy all data
        // on creation. We don't need to remember any
        // jobs. It is a simple full list copy.


        if (this.__element) {
          // Omit queuing in direct mode
          if (direct) {
            qx.bom.element.Style.set(this.__element, key, value);
            return this;
          } // Dynamically create if needed


          if (!this.__styleJobs) {
            this.__styleJobs = {};
          } // Store job info


          this.__styleJobs[key] = true; // Register modification

          qx.html.Element._modified[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }

        return this;
      },

      /**
       * Convenience method to modify a set of styles at once.
       *
       * @param map {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @param direct {Boolean?false} Whether the values should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      setStyles: function setStyles(map, direct) {
        // inline calls to "set" because this method is very
        // performance critical!
        var Style = qx.bom.element.Style;

        if (!this.__styleValues) {
          this.__styleValues = {};
        }

        if (this.__element) {
          // Dynamically create if needed
          if (!this.__styleJobs) {
            this.__styleJobs = {};
          }

          for (var key in map) {
            var value = map[key];

            if (this.__styleValues[key] == value) {
              continue;
            }

            if (value == null) {
              delete this.__styleValues[key];
            } else {
              this.__styleValues[key] = value;
            } // Omit queuing in direct mode


            if (direct) {
              Style.set(this.__element, key, value);
              continue;
            } // Store job info


            this.__styleJobs[key] = true;
          } // Register modification


          qx.html.Element._modified[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        } else {
          for (var key in map) {
            var value = map[key];

            if (this.__styleValues[key] == value) {
              continue;
            }

            if (value == null) {
              delete this.__styleValues[key];
            } else {
              this.__styleValues[key] = value;
            }
          }
        }

        return this;
      },

      /**
       * Removes the given style attribute
       *
       * @param key {String} the name of the style attribute
       * @param direct {Boolean?false} Whether the value should be removed
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeStyle: function removeStyle(key, direct) {
        this.setStyle(key, null, direct);
        return this;
      },

      /**
       * Get the value of the given style attribute.
       *
       * @param key {String} name of the style attribute
       * @return {var} the value of the style attribute
       */
      getStyle: function getStyle(key) {
        return this.__styleValues ? this.__styleValues[key] : null;
      },

      /**
       * Returns a map of all styles. Do not modify the result map!
       *
       * @return {Map} All styles or <code>null</code> when none are configured.
       */
      getAllStyles: function getAllStyles() {
        return this.__styleValues || null;
      },

      /*
      ---------------------------------------------------------------------------
        ATTRIBUTE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Set up the given attribute
       *
       * @param key {String} the name of the attribute
       * @param value {var} the value
       * @param direct {Boolean?false} Whether the value should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      setAttribute: function setAttribute(key, value, direct) {
        if (!this.__attribValues) {
          this.__attribValues = {};
        }

        if (this.__attribValues[key] == value) {
          return this;
        }

        if (value == null) {
          delete this.__attribValues[key];
        } else {
          this.__attribValues[key] = value;
        } // Uncreated elements simply copy all data
        // on creation. We don't need to remember any
        // jobs. It is a simple full list copy.


        if (this.__element) {
          // Omit queuing in direct mode
          if (direct) {
            qx.bom.element.Attribute.set(this.__element, key, value);
            return this;
          } // Dynamically create if needed


          if (!this.__attribJobs) {
            this.__attribJobs = {};
          } // Store job info


          this.__attribJobs[key] = true; // Register modification

          qx.html.Element._modified[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }

        return this;
      },

      /**
       * Convenience method to modify a set of attributes at once.
       *
       * @param map {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @param direct {Boolean?false} Whether the values should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      setAttributes: function setAttributes(map, direct) {
        for (var key in map) {
          this.setAttribute(key, map[key], direct);
        }

        return this;
      },

      /**
       * Removes the given attribute
       *
       * @param key {String} the name of the attribute
       * @param direct {Boolean?false} Whether the value should be removed
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeAttribute: function removeAttribute(key, direct) {
        return this.setAttribute(key, null, direct);
      },

      /**
       * Get the value of the given attribute.
       *
       * @param key {String} name of the attribute
       * @return {var} the value of the attribute
       */
      getAttribute: function getAttribute(key) {
        return this.__attribValues ? this.__attribValues[key] : null;
      },

      /*
      ---------------------------------------------------------------------------
        CSS CLASS SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Adds a css class to the element.
       * @param name {String} Name of the CSS class.
       */
      addClass: function addClass(name) {
        var value = ((this.getAttribute("class") || "") + " " + name).trim();
        this.setAttribute("class", value);
      },

      /**
       * Removes a CSS class from the current element.
       * @param name {String} Name of the CSS class.
       */
      removeClass: function removeClass(name) {
        var currentClass = this.getAttribute("class");

        if (currentClass) {
          this.setAttribute("class", currentClass.replace(name, "").trim());
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Applies a special property with the given value.
       *
       * This property apply routine can be easily overwritten and
       * extended by sub classes to add new low level features which
       * are not easily possible using styles and attributes.
       *
       * @param name {String} Unique property identifier
       * @param value {var} Any valid value (depends on the property)
       * @return {qx.html.Element} this object (for chaining support)
       * @abstract
       */
      _applyProperty: function _applyProperty(name, value) {// empty implementation
      },

      /**
       * Set up the given property.
       *
       * @param key {String} the name of the property
       * @param value {var} the value
       * @param direct {Boolean?false} Whether the value should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      _setProperty: function _setProperty(key, value, direct) {
        if (!this.__propertyValues) {
          this.__propertyValues = {};
        }

        if (this.__propertyValues[key] == value) {
          return this;
        }

        if (value == null) {
          delete this.__propertyValues[key];
        } else {
          this.__propertyValues[key] = value;
        } // Uncreated elements simply copy all data
        // on creation. We don't need to remember any
        // jobs. It is a simple full list copy.


        if (this.__element) {
          // Omit queuing in direct mode
          if (direct) {
            this._applyProperty(key, value);

            return this;
          } // Dynamically create if needed


          if (!this.__propertyJobs) {
            this.__propertyJobs = {};
          } // Store job info


          this.__propertyJobs[key] = true; // Register modification

          qx.html.Element._modified[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }

        return this;
      },

      /**
       * Removes the given misc
       *
       * @param key {String} the name of the misc
       * @param direct {Boolean?false} Whether the value should be removed
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      _removeProperty: function _removeProperty(key, direct) {
        return this._setProperty(key, null, direct);
      },

      /**
       * Get the value of the given misc.
       *
       * @param key {String} name of the misc
       * @return {var} the value of the misc
       */
      _getProperty: function _getProperty(key) {
        var db = this.__propertyValues;

        if (!db) {
          return null;
        }

        var value = db[key];
        return value == null ? null : value;
      },

      /*
      ---------------------------------------------------------------------------
        EVENT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Adds an event listener to the element.
       *
       * @param type {String} Name of the event
       * @param listener {Function} Function to execute on event
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener. When not given, the corresponding dispatcher
       *         usually falls back to a default, which is the target
       *         by convention. Note this is not a strict requirement, i.e.
       *         custom dispatchers can follow a different strategy.
       * @param capture {Boolean ? false} Whether capturing should be enabled
       * @return {var} An opaque id, which can be used to remove the event listener
       *         using the {@link #removeListenerById} method.
       */
      addListener: function addListener(type, listener, self, capture) {
        if (this.$$disposed) {
          return null;
        }

        {
          var msg = "Failed to add event listener for type '" + type + "'" + " to the target '" + this + "': ";
          this.assertString(type, msg + "Invalid event type.");
          this.assertFunction(listener, msg + "Invalid callback function");

          if (self !== undefined) {
            this.assertObject(self, "Invalid context for callback.");
          }

          if (capture !== undefined) {
            this.assertBoolean(capture, "Invalid capture flag.");
          }
        }

        if (this.__element) {
          return qx.event.Registration.addListener(this.__element, type, listener, self, capture);
        }

        if (!this.__eventValues) {
          this.__eventValues = {};
        }

        if (capture == null) {
          capture = false;
        }

        var unique = qx.event.Manager.getNextUniqueId();
        var id = type + (capture ? "|capture|" : "|bubble|") + unique;
        this.__eventValues[id] = {
          type: type,
          listener: listener,
          self: self,
          capture: capture,
          unique: unique
        };
        return id;
      },

      /**
       * Removes an event listener from the element.
       *
       * @param type {String} Name of the event
       * @param listener {Function} Function to execute on event
       * @param self {Object} Execution context of given function
       * @param capture {Boolean ? false} Whether capturing should be enabled
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeListener: function removeListener(type, listener, self, capture) {
        if (this.$$disposed) {
          return null;
        }

        {
          var msg = "Failed to remove event listener for type '" + type + "'" + " from the target '" + this + "': ";
          this.assertString(type, msg + "Invalid event type.");
          this.assertFunction(listener, msg + "Invalid callback function");

          if (self !== undefined) {
            this.assertObject(self, "Invalid context for callback.");
          }

          if (capture !== undefined) {
            this.assertBoolean(capture, "Invalid capture flag.");
          }
        }

        if (this.__element) {
          if (listener.$$wrapped_callback && listener.$$wrapped_callback[type + this.$$hash]) {
            var callback = listener.$$wrapped_callback[type + this.$$hash];
            delete listener.$$wrapped_callback[type + this.$$hash];
            listener = callback;
          }

          qx.event.Registration.removeListener(this.__element, type, listener, self, capture);
        } else {
          var values = this.__eventValues;
          var entry;

          if (capture == null) {
            capture = false;
          }

          for (var key in values) {
            entry = values[key]; // Optimized for performance: Testing references first

            if (entry.listener === listener && entry.self === self && entry.capture === capture && entry.type === type) {
              delete values[key];
              break;
            }
          }
        }

        return this;
      },

      /**
       * Removes an event listener from an event target by an id returned by
       * {@link #addListener}
       *
       * @param id {var} The id returned by {@link #addListener}
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeListenerById: function removeListenerById(id) {
        if (this.$$disposed) {
          return null;
        }

        if (this.__element) {
          qx.event.Registration.removeListenerById(this.__element, id);
        } else {
          delete this.__eventValues[id];
        }

        return this;
      },

      /**
       * Check if there are one or more listeners for an event type.
       *
       * @param type {String} name of the event type
       * @param capture {Boolean ? false} Whether to check for listeners of
       *         the bubbling or of the capturing phase.
       * @return {Boolean} Whether the object has a listener of the given type.
       */
      hasListener: function hasListener(type, capture) {
        if (this.$$disposed) {
          return false;
        }

        if (this.__element) {
          return qx.event.Registration.hasListener(this.__element, type, capture);
        }

        var values = this.__eventValues;
        var entry;

        if (capture == null) {
          capture = false;
        }

        for (var key in values) {
          entry = values[key]; // Optimized for performance: Testing fast types first

          if (entry.capture === capture && entry.type === type) {
            return true;
          }
        }

        return false;
      },

      /**
       * Serializes and returns all event listeners attached to this element
       * @return {Map[]} an Array containing a map for each listener. The maps
       * have the following keys:
       * <ul>
       *   <li><code>type</code> (String): Event name</li>
       *   <li><code>handler</code> (Function): Callback function</li>
       *   <li><code>self</code> (Object): The callback's context</li>
       *   <li><code>capture</code> (Boolean): If <code>true</code>, the listener is
       * attached to the capturing phase</li>
       * </ul>
       */
      getListeners: function getListeners() {
        if (this.$$disposed) {
          return null;
        }

        if (this.__element) {
          return qx.event.Registration.getManager(this.__element).serializeListeners(this.__element);
        }

        var listeners = [];

        for (var id in this.__eventValues) {
          var listenerData = this.__eventValues[id];
          listeners.push({
            type: listenerData.type,
            handler: listenerData.listener,
            self: listenerData.self,
            capture: listenerData.capture
          });
        }

        return listeners;
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      statics.__deferredCall = new qx.util.DeferredCall(statics.flush, statics);
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.$$hash) {
        delete qx.html.Element._modified[this.$$hash];
        delete qx.html.Element._scroll[this.$$hash];
      }

      var el = this.__element;

      if (el) {
        qx.event.Registration.getManager(el).removeAllListeners(el);
        el.$$element = "";
        delete el.$$elementObject;
        el.$$widget = "";
        delete el.$$widgetObject;
      }

      if (!qx.core.ObjectRegistry.inShutDown) {
        var parent = this.__parent;

        if (parent && !parent.$$disposed) {
          parent.remove(this);
        }
      }

      this._disposeArray("__children");

      this.__attribValues = this.__styleValues = this.__eventValues = this.__propertyValues = this.__attribJobs = this.__styleJobs = this.__propertyJobs = this.__element = this.__parent = this.__lazyScrollIntoViewX = this.__lazyScrollIntoViewY = null;
    }
  });
  qx.html.Element.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Focus": {
        "defer": "runtime"
      },
      "qx.event.handler.Window": {
        "defer": "runtime"
      },
      "qx.event.handler.Capture": {
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.dispatch.AbstractBubbling": {
        "construct": true,
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.dom.Hierarchy": {},
      "qx.bom.Event": {},
      "qx.event.type.Event": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "load": true,
          "className": "qx.bom.client.Browser"
        },
        "os.version": {
          "load": true,
          "className": "qx.bom.client.OperatingSystem"
        }
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
   * Implementation of the Internet Explorer specific event capturing mode for
   * mouse events http://msdn2.microsoft.com/en-us/library/ms536742.aspx.
   *
   * This class is used internally by {@link qx.event.Manager} to do mouse event
   * capturing.
   *
   * @use(qx.event.handler.Focus)
   * @use(qx.event.handler.Window)
   * @use(qx.event.handler.Capture)
   */
  qx.Class.define("qx.event.dispatch.MouseCapture", {
    extend: qx.event.dispatch.AbstractBubbling,

    /**
     * @param manager {qx.event.Manager} Event manager for the window to use
     * @param registration {qx.event.Registration} The event registration to use
     */
    construct: function construct(manager, registration) {
      qx.event.dispatch.AbstractBubbling.constructor.call(this, manager);
      this.__window = manager.getWindow();
      this.__registration = registration;
      manager.addListener(this.__window, "blur", this.releaseCapture, this);
      manager.addListener(this.__window, "focus", this.releaseCapture, this);
      manager.addListener(this.__window, "scroll", this.releaseCapture, this);
    },
    statics: {
      /** @type {Integer} Priority of this dispatcher */
      PRIORITY: qx.event.Registration.PRIORITY_FIRST
    },
    members: {
      __registration: null,
      __captureElement: null,
      __containerCapture: true,
      __window: null,
      // overridden
      _getParent: function _getParent(target) {
        return target.parentNode;
      },

      /*
      ---------------------------------------------------------------------------
        EVENT DISPATCHER INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      canDispatchEvent: function canDispatchEvent(target, event, type) {
        return !!(this.__captureElement && this.__captureEvents[type]);
      },
      // overridden
      dispatchEvent: function dispatchEvent(target, event, type) {
        if (type == "click") {
          event.stopPropagation();
          this.releaseCapture();
          return;
        }

        if (this.__containerCapture || !qx.dom.Hierarchy.contains(this.__captureElement, target)) {
          target = this.__captureElement;
        }

        return qx.event.dispatch.MouseCapture.prototype.dispatchEvent.base.call(this, target, event, type);
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * @lint ignoreReferenceField(__captureEvents)
       */
      __captureEvents: {
        "mouseup": 1,
        "mousedown": 1,
        "click": 1,
        "dblclick": 1,
        "mousemove": 1,
        "mouseout": 1,
        "mouseover": 1,
        "pointerdown": 1,
        "pointerup": 1,
        "pointermove": 1,
        "pointerover": 1,
        "pointerout": 1,
        "tap": 1,
        "dbltap": 1
      },

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Set the given element as target for event
       *
       * @param element {Element} The element which should capture the mouse events.
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. IF false events originating in the container
       *   are not captured.
       */
      activateCapture: function activateCapture(element, containerCapture) {
        var containerCapture = containerCapture !== false;

        if (this.__captureElement === element && this.__containerCapture == containerCapture) {
          return;
        }

        if (this.__captureElement) {
          this.releaseCapture();
        } // turn on native mouse capturing if the browser supports it


        if (this.hasNativeCapture) {
          this.nativeSetCapture(element, containerCapture);
          var self = this;

          var onNativeListener = function onNativeListener() {
            qx.bom.Event.removeNativeListener(element, "losecapture", onNativeListener);
            self.releaseCapture();
          };

          qx.bom.Event.addNativeListener(element, "losecapture", onNativeListener);
        }

        this.__containerCapture = containerCapture;
        this.__captureElement = element;

        this.__registration.fireEvent(element, "capture", qx.event.type.Event, [true, false]);
      },

      /**
       * Get the element currently capturing events.
       *
       * @return {Element|null} The current capture element. This value may be
       *    null.
       */
      getCaptureElement: function getCaptureElement() {
        return this.__captureElement;
      },

      /**
       * Stop capturing of mouse events.
       */
      releaseCapture: function releaseCapture() {
        var element = this.__captureElement;

        if (!element) {
          return;
        }

        this.__captureElement = null;

        this.__registration.fireEvent(element, "losecapture", qx.event.type.Event, [true, false]); // turn off native mouse capturing if the browser supports it


        this.nativeReleaseCapture(element);
      },

      /** Whether the browser should use native mouse capturing */
      hasNativeCapture: qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9 || parseInt(qx.core.Environment.get("os.version"), 10) > 7 && qx.core.Environment.get("browser.documentmode") > 9,

      /**
       * If the browser supports native mouse capturing, sets the mouse capture to
       * the object that belongs to the current document.
       *
       * Please note that under Windows 7 (but not Windows 8), capturing is
       * not only applied to mouse events as expected, but also to native pointer events.
       *
       * @param element {Element} The capture DOM element
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       * @signature function(element, containerCapture)
       */
      nativeSetCapture: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element, containerCapture) {
          element.setCapture(containerCapture !== false);
        },
        "default": function _default() {}
      }),

      /**
       * If the browser supports native mouse capturing, removes mouse capture
       * from the object in the current document.
       *
       * @param element {Element} The DOM element to release the capture for
       * @signature function(element)
       */
      nativeReleaseCapture: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element) {
          element.releaseCapture();
        },
        "default": function _default() {}
      })
    },
    defer: function defer(statics) {
      qx.event.Registration.addDispatcher(statics);
    }
  });
  qx.event.dispatch.MouseCapture.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.DomBubbling": {
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "usage": "dynamic",
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
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "construct": true
      },
      "qx.application.Inline": {
        "construct": true
      },
      "qx.core.Init": {
        "construct": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.Selection": {},
      "qx.event.type.Focus": {},
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.bom.element.Attribute": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "os.version": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.name": {
          "load": true,
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
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This handler is used to normalize all focus/activation requirements
   * and normalize all cross browser quirks in this area.
   *
   * Notes:
   *
   * * Webkit and Opera (before 9.5) do not support tabIndex for all elements
   * (See also: https://bugs.webkit.org/show_bug.cgi?id=7138)
   *
   * * TabIndex is normally 0, which means all naturally focusable elements are focusable.
   * * TabIndex > 0 means that the element is focusable and tabable
   * * TabIndex < 0 means that the element, even if naturally possible, is not focusable.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @use(qx.event.dispatch.DomBubbling)
   */
  qx.Class.define("qx.event.handler.Focus", {
    extend: qx.core.Object,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     *
     * @ignore(qx.application.Inline)
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this._manager = manager;
      this._window = manager.getWindow();
      this._document = this._window.document;
      this._root = this._document.documentElement;
      this._body = this._document.body;

      if (qx.core.Environment.get("os.name") == "ios" && parseFloat(qx.core.Environment.get("os.version")) > 6 && (!qx.application.Inline || !qx.core.Init.getApplication() instanceof qx.application.Inline)) {
        this.__needsScrollFix = true;
      } // Initialize


      this._initObserver();
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The active DOM element */
      active: {
        apply: "_applyActive",
        nullable: true
      },

      /** The focussed DOM element */
      focus: {
        apply: "_applyFocus",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        focus: 1,
        blur: 1,
        focusin: 1,
        focusout: 1,
        activate: 1,
        deactivate: 1
      },

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /**
       * @type {Map} See: http://msdn.microsoft.com/en-us/library/ms534654(VS.85).aspx
       */
      FOCUSABLE_ELEMENTS: qx.core.Environment.select("engine.name", {
        "mshtml": {
          a: 1,
          body: 1,
          button: 1,
          frame: 1,
          iframe: 1,
          img: 1,
          input: 1,
          object: 1,
          select: 1,
          textarea: 1
        },
        "gecko": {
          a: 1,
          body: 1,
          button: 1,
          frame: 1,
          iframe: 1,
          img: 1,
          input: 1,
          object: 1,
          select: 1,
          textarea: 1
        },
        "opera": {
          button: 1,
          input: 1,
          select: 1,
          textarea: 1
        },
        "webkit": {
          button: 1,
          input: 1,
          select: 1,
          textarea: 1
        }
      })
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __onNativeMouseDownWrapper: null,
      __onNativeMouseUpWrapper: null,
      __onNativeFocusWrapper: null,
      __onNativeBlurWrapper: null,
      __onNativeDragGestureWrapper: null,
      __onNativeSelectStartWrapper: null,
      __onNativeFocusInWrapper: null,
      __onNativeFocusOutWrapper: null,
      __previousFocus: null,
      __previousActive: null,
      __down: "",
      __up: "",
      __needsScrollFix: false,
      __relatedTarget: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },

      /*
      ---------------------------------------------------------------------------
        FOCUS/BLUR USER INTERFACE
      ---------------------------------------------------------------------------
      */

      /**
       * Focuses the given DOM element
       *
       * @param element {Element} DOM element to focus
       */
      focus: function focus(element) {
        // Fixed timing issue with IE, see [BUG #3267]
        if (qx.core.Environment.get("engine.name") == "mshtml") {
          window.setTimeout(function () {
            try {
              // focus element before set cursor position
              element.focus(); // Fixed cursor position issue with IE, only when nothing is selected.
              // See [BUG #3519] for details.

              var selection = qx.bom.Selection.get(element);

              if (selection.length == 0 && typeof element.createTextRange == "function") {
                var textRange = element.createTextRange();
                textRange.moveStart('character', element.value.length);
                textRange.collapse();
                textRange.select();
              }
            } catch (ex) {}
          }, 0);
        } else {
          // Fix re-focusing on mousup event
          // See https://github.com/qooxdoo/qooxdoo/issues/9393 and
          // discussion in https://github.com/qooxdoo/qooxdoo/pull/9394
          window.setTimeout(function () {
            try {
              element.focus();
            } catch (ex) {}
          }, 0);
        }

        this.setFocus(element);
        this.setActive(element);
      },

      /**
       * Activates the given DOM element
       *
       * @param element {Element} DOM element to activate
       */
      activate: function activate(element) {
        this.setActive(element);
      },

      /**
       * Blurs the given DOM element
       *
       * @param element {Element} DOM element to focus
       */
      blur: function blur(element) {
        try {
          element.blur();
        } catch (ex) {}

        if (this.getActive() === element) {
          this.resetActive();
        }

        if (this.getFocus() === element) {
          this.resetFocus();
        }
      },

      /**
       * Deactivates the given DOM element
       *
       * @param element {Element} DOM element to activate
       */
      deactivate: function deactivate(element) {
        if (this.getActive() === element) {
          this.resetActive();
        }
      },

      /**
       * Tries to activate the given element. This checks whether
       * the activation is allowed first.
       *
       * @param element {Element} DOM element to activate
       */
      tryActivate: function tryActivate(element) {
        var active = this.__findActivatableElement(element);

        if (active) {
          this.setActive(active);
        }
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Shorthand to fire events from within this class.
       *
       * @param target {Element} DOM element which is the target
       * @param related {Element} DOM element which is the related target
       * @param type {String} Name of the event to fire
       * @param bubbles {Boolean} Whether the event should bubble
       * @return {qx.Promise?} a promise, if one or more of the event handlers returned a promise
       */
      __fireEvent: function __fireEvent(target, related, type, bubbles) {
        var Registration = qx.event.Registration;
        var evt = Registration.createEvent(type, qx.event.type.Focus, [target, related, bubbles]);
        return Registration.dispatchEvent(target, evt);
      },

      /*
      ---------------------------------------------------------------------------
        WINDOW FOCUS/BLUR SUPPORT
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} Whether the window is focused currently */
      _windowFocused: true,

      /**
       * Helper for native event listeners to react on window blur
       */
      __doWindowBlur: function __doWindowBlur() {
        // Omit doubled blur events
        // which is a common behavior at least for gecko based clients
        if (this._windowFocused) {
          this._windowFocused = false;

          this.__fireEvent(this._window, null, "blur", false);
        }
      },

      /**
       * Helper for native event listeners to react on window focus
       */
      __doWindowFocus: function __doWindowFocus() {
        // Omit doubled focus events
        // which is a common behavior at least for gecko based clients
        if (!this._windowFocused) {
          this._windowFocused = true;

          this.__fireEvent(this._window, null, "focus", false);
        }
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE OBSERVER
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes event listeners.
       *
       * @signature function()
       */
      _initObserver: qx.core.Environment.select("engine.name", {
        "gecko": function gecko() {
          // Bind methods
          this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
          this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
          this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
          this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);
          this.__onNativeDragGestureWrapper = qx.lang.Function.listener(this.__onNativeDragGesture, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true); // Capturing is needed for gecko to correctly
          // handle focus of input and textarea fields

          qx.bom.Event.addNativeListener(this._window, "focus", this.__onNativeFocusWrapper, true);
          qx.bom.Event.addNativeListener(this._window, "blur", this.__onNativeBlurWrapper, true); // Capture drag events

          qx.bom.Event.addNativeListener(this._window, "draggesture", this.__onNativeDragGestureWrapper, true);
        },
        "mshtml": function mshtml() {
          // Bind methods
          this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
          this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
          this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
          this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);
          this.__onNativeSelectStartWrapper = qx.lang.Function.listener(this.__onNativeSelectStart, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper); // MSHTML supports their own focusin and focusout events
          // To detect which elements get focus the target is useful
          // The window blur can detected using focusout and look
          // for the toTarget property which is empty in this case.

          qx.bom.Event.addNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper);
          qx.bom.Event.addNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper); // Add selectstart to prevent selection

          qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper);
        },
        "webkit": qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          "edge": function edge(domEvent) {
            // Bind methods
            this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
            this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
            this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);
            this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
            this.__onNativeSelectStartWrapper = qx.lang.Function.listener(this.__onNativeSelectStart, this); // Register events

            qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
            qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
            qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper, false);
            qx.bom.Event.addNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper);
            qx.bom.Event.addNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper);
          },
          "default": function _default(domEvent) {
            // Bind methods
            this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
            this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
            this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);
            this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
            this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);
            this.__onNativeSelectStartWrapper = qx.lang.Function.listener(this.__onNativeSelectStart, this); // Register events

            qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
            qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
            qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper, false);
            qx.bom.Event.addNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper, true);
            qx.bom.Event.addNativeListener(this._window, "focus", this.__onNativeFocusWrapper, true);
            qx.bom.Event.addNativeListener(this._window, "blur", this.__onNativeBlurWrapper, true);
          }
        }),
        "opera": function opera() {
          // Bind methods
          this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
          this.__onNativeMouseUpWrapper = qx.lang.Function.listener(this.__onNativeMouseUp, this);
          this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
          this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
          qx.bom.Event.addNativeListener(this._window, "DOMFocusIn", this.__onNativeFocusInWrapper, true);
          qx.bom.Event.addNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper, true);
        }
      }),

      /**
       * Disconnects event listeners.
       *
       * @signature function()
       */
      _stopObserver: qx.core.Environment.select("engine.name", {
        "gecko": function gecko() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "focus", this.__onNativeFocusWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "blur", this.__onNativeBlurWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "draggesture", this.__onNativeDragGestureWrapper, true);
        },
        "mshtml": function mshtml() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper);
          qx.bom.Event.removeNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper);
          qx.bom.Event.removeNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper);
          qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper);
        },
        "webkit": qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          "edge": function edge() {
            qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper);
            qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper);
            qx.bom.Event.removeNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper);
            qx.bom.Event.removeNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper);
            qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper);
          },
          "default": function _default() {
            qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
            qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
            qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper, false);
            qx.bom.Event.removeNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper, true);
            qx.bom.Event.removeNativeListener(this._window, "focus", this.__onNativeFocusWrapper, true);
            qx.bom.Event.removeNativeListener(this._window, "blur", this.__onNativeBlurWrapper, true);
          }
        }),
        "opera": function opera() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper, true);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "DOMFocusIn", this.__onNativeFocusInWrapper, true);
          qx.bom.Event.removeNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper, true);
        }
      }),

      /*
      ---------------------------------------------------------------------------
        NATIVE LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Native event listener for <code>draggesture</code> event
       * supported by gecko. Used to stop native drag and drop when
       * selection is disabled.
       *
       * @see https://developer.mozilla.org/en-US/docs/Drag_and_Drop
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeDragGesture: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "gecko": function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>DOMFocusIn</code> or <code>focusin</code>
       * depending on the client's engine.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocusIn: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          // Force window focus to be the first
          this.__doWindowFocus(); // Update internal data


          var target = qx.bom.Event.getTarget(domEvent); // IE focusin is also fired on elements which are not focusable at all
          // We need to look up for the next focusable element.

          var focusTarget = this.__findFocusableElement(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } // Make target active


          this.tryActivate(target);
        },
        "webkit": qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          "edge": function edge(domEvent) {
            // Force window focus to be the first
            this.__doWindowFocus(); // Update internal data


            var target = qx.bom.Event.getTarget(domEvent); // IE focusin is also fired on elements which are not focusable at all
            // We need to look up for the next focusable element.

            var focusTarget = this.__findFocusableElement(target);

            if (focusTarget) {
              this.setFocus(focusTarget);
            } // Make target active


            this.tryActivate(target);
          },
          "default": null
        }),
        "opera": function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target == this._document || target == this._window) {
            this.__doWindowFocus();

            if (this.__previousFocus) {
              this.setFocus(this.__previousFocus);
              delete this.__previousFocus;
            }

            if (this.__previousActive) {
              this.setActive(this.__previousActive);
              delete this.__previousActive;
            }
          } else {
            this.setFocus(target);
            this.tryActivate(target); // Clear selection

            if (!this.__isSelectable(target)) {
              target.selectionStart = 0;
              target.selectionEnd = 0;
            }
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>DOMFocusOut</code> or <code>focusout</code>
       * depending on the client's engine.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocusOut: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          var relatedTarget = qx.bom.Event.getRelatedTarget(domEvent); // If the focus goes to nowhere (the document is blurred)

          if (relatedTarget == null) {
            // Update internal representation
            this.__doWindowBlur(); // Reset active and focus


            this.resetFocus();
            this.resetActive();
          }
        },
        "webkit": qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          "edge": function edge(domEvent) {
            var relatedTarget = qx.bom.Event.getRelatedTarget(domEvent); // If the focus goes to nowhere (the document is blurred)

            if (relatedTarget == null) {
              // Update internal representation
              this.__doWindowBlur(); // Reset active and focus


              this.resetFocus();
              this.resetActive();
            }
          },
          "default": function _default(domEvent) {
            var target = qx.bom.Event.getTarget(domEvent);

            if (target === this.getFocus()) {
              this.resetFocus();
            }

            if (target === this.getActive()) {
              this.resetActive();
            }
          }
        }),
        "opera": function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target == this._document) {
            this.__doWindowBlur(); // Store old focus/active elements
            // Opera do not fire focus events for them
            // when refocussing the window (in my opinion an error)


            this.__previousFocus = this.getFocus();
            this.__previousActive = this.getActive();
            this.resetFocus();
            this.resetActive();
          } else {
            if (target === this.getFocus()) {
              this.resetFocus();
            }

            if (target === this.getActive()) {
              this.resetActive();
            }
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>blur</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeBlur: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "gecko": function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowBlur();

            this.resetActive();
            this.resetFocus();
          }
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowBlur(); // Store old focus/active elements
            // Opera do not fire focus events for them
            // when refocussing the window (in my opinion an error)


            this.__previousFocus = this.getFocus();
            this.__previousActive = this.getActive();
            this.resetActive();
            this.resetFocus();
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>focus</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocus: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "gecko": function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowFocus(); // Always speak of the body, not the window or document


            target = this._body;
          }

          this.setFocus(target);
          this.tryActivate(target);
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowFocus();

            if (this.__previousFocus) {
              this.setFocus(this.__previousFocus);
              delete this.__previousFocus;
            }

            if (this.__previousActive) {
              this.setActive(this.__previousActive);
              delete this.__previousActive;
            }
          } else {
            this.__relatedTarget = domEvent.relatedTarget;
            this.setFocus(target);
            this.__relatedTarget = null;
            this.tryActivate(target);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>mousedown</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeMouseDown: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent); // Stop events when no focus element available (or blocked)

          var focusTarget = this.__findFocusableElement(target);

          if (focusTarget) {
            // Add unselectable to keep selection
            if (!this.__isSelectable(target)) {
              // The element is not selectable. Block selection.
              target.unselectable = "on"; // Unselectable may keep the current selection which
              // is not what we like when changing the focus element.
              // So we clear it

              try {
                if (document.selection) {
                  document.selection.empty();
                }
              } catch (ex) {} // ignore 'Unknown runtime error'
              // The unselectable attribute stops focussing as well.
              // Do this manually.


              try {
                focusTarget.focus();
              } catch (ex) {// ignore "Can't move focus of this control" error
              }
            }
          } else {
            // Stop event for blocking support
            qx.bom.Event.preventDefault(domEvent); // Add unselectable to keep selection

            if (!this.__isSelectable(target)) {
              target.unselectable = "on";
            }
          }
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } else {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "gecko": function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } else {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "opera": function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement(target);

          if (!this.__isSelectable(target)) {
            // Prevent the default action for all non-selectable
            // targets. This prevents text selection and context menu.
            qx.bom.Event.preventDefault(domEvent); // The stopped event keeps the selection
            // of the previously focused element.
            // We need to clear the old selection.

            if (focusTarget) {
              var current = this.getFocus();

              if (current && current.selectionEnd) {
                current.selectionStart = 0;
                current.selectionEnd = 0;
                current.blur();
              } // The prevented event also stop the focus, do
              // it manually if needed.


              if (focusTarget) {
                this.setFocus(focusTarget);
              }
            }
          } else if (focusTarget) {
            this.setFocus(focusTarget);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>mouseup</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeMouseUp: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target.unselectable) {
            target.unselectable = "off";
          }

          this.tryActivate(this.__fixFocus(target));
        },
        "gecko": function gecko(domEvent) {
          // As of Firefox 3.0:
          // Gecko fires mouseup on XUL elements
          // We only want to deal with real HTML elements
          var target = qx.bom.Event.getTarget(domEvent);

          while (target && target.offsetWidth === undefined) {
            target = target.parentNode;
          }

          if (target) {
            this.tryActivate(target);
          }
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);
          this.tryActivate(this.__fixFocus(target));
        },
        "opera": function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);
          this.tryActivate(this.__fixFocus(target));
        },
        "default": null
      })),

      /**
       * Fix for bug #9331.
       *
       * @signature function(target)
       * @param target {Element} element to check
       * @return {Element} return correct target (in case of compound input controls should always return textfield);
       */
      __getCorrectFocusTarget: function __getCorrectFocusTarget(target) {
        var focusedElement = this.getFocus();

        if (focusedElement && target != focusedElement) {
          if (focusedElement.nodeName.toLowerCase() === "input" || focusedElement.nodeName.toLowerCase() === "textarea") {
            return focusedElement;
          } // Check compound widgets


          var widget = qx.ui.core.Widget.getWidgetByElement(focusedElement),
              textField = widget && widget.getChildControl && widget.getChildControl("textfield", true);

          if (textField) {
            return textField.getContentElement().getDomElement();
          }
        }

        return target;
      },

      /**
       * Fix for bug #2602.
       *
       * @signature function(target)
       * @param target {Element} target element from mouse up event
       * @return {Element} Element to activate;
       */
      __fixFocus: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(target) {
          return this.__getCorrectFocusTarget(target);
        },
        "webkit": function webkit(target) {
          return this.__getCorrectFocusTarget(target);
        },
        "default": function _default(target) {
          return target;
        }
      })),

      /**
       * Native event listener for <code>selectstart</code>.
       *
       *@signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeSelectStart: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "webkit": function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "default": null
      })),

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Whether the given element is focusable. This is perfectly modeled to the
       * browsers behavior and this way may differ in the various clients.
       *
       * @param el {Element} DOM Element to query
       * @return {Boolean} Whether the element is focusable
       */
      __isFocusable: function __isFocusable(el) {
        var index = qx.bom.element.Attribute.get(el, "tabIndex");

        if (index >= 1) {
          return true;
        }

        var focusable = qx.event.handler.Focus.FOCUSABLE_ELEMENTS;

        if (index >= 0 && focusable[el.tagName]) {
          return true;
        }

        return false;
      },

      /**
       * Returns the next focusable parent element of an activated DOM element.
       *
       * @param el {Element} Element to start lookup with.
       * @return {Element|null} The next focusable element.
       */
      __findFocusableElement: function __findFocusableElement(el) {
        while (el && el.nodeType === 1) {
          if (el.getAttribute("qxKeepFocus") == "on") {
            return null;
          }

          if (this.__isFocusable(el)) {
            return el;
          }

          el = el.parentNode;
        } // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.


        return this._body;
      },

      /**
       * Returns the next activatable element. May be the element itself.
       * Works a bit different than the method {@link #__findFocusableElement}
       * as it looks up for a parent which is has a keep focus flag. When
       * there is such a parent it returns null otherwise the original
       * incoming element.
       *
       * @param el {Element} Element to start lookup with.
       * @return {Element} The next activatable element.
       */
      __findActivatableElement: function __findActivatableElement(el) {
        var orig = el;

        while (el && el.nodeType === 1) {
          if (el.getAttribute("qxKeepActive") == "on") {
            return null;
          }

          el = el.parentNode;
        }

        return orig;
      },

      /**
       * Whether the given el (or its content) should be selectable
       * by the user.
       *
       * @param node {Element} Node to start lookup with
       * @return {Boolean} Whether the content is selectable.
       */
      __isSelectable: function __isSelectable(node) {
        while (node && node.nodeType === 1) {
          var attr = node.getAttribute("qxSelectable");

          if (attr != null) {
            return attr === "on";
          }

          node = node.parentNode;
        }

        return true;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // apply routine
      _applyActive: function _applyActive(value, old) {
        // Fire events
        if (old) {
          this.__fireEvent(old, value, "deactivate", true);
        }

        if (value) {
          this.__fireEvent(value, old, "activate", true);
        } // correct scroll position for iOS 7


        if (this.__needsScrollFix) {
          window.scrollTo(0, 0);
        }
      },
      // apply routine
      _applyFocus: function _applyFocus(value, old) {
        // Fire bubbling events
        if (old) {
          this.__fireEvent(old, value, "focusout", true);
        }

        if (value) {
          this.__fireEvent(value, old, "focusin", true);
        } // Fire after events


        if (old) {
          this.__fireEvent(old, value, "blur", false);
        }

        if (value) {
          this.__fireEvent(value, old || this.__relatedTarget, "focus", false);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopObserver();

      this._manager = this._window = this._document = this._root = this._body = this.__mouseActive = this.__relatedTarget = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics); // For faster lookups generate uppercase tag names dynamically

      var focusable = statics.FOCUSABLE_ELEMENTS;

      for (var entry in focusable) {
        focusable[entry.toUpperCase()] = 1;
      }
    }
  });
  qx.event.handler.Focus.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
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
  
  ************************************************************************ */

  /**
   * This interface defines what an application class has to implement.
   */
  qx.Interface.define("qx.application.IApplication", {
    members: {
      /**
       * Called when the application relevant classes are loaded and ready.
       *
       */
      main: function main() {},

      /**
       * Called when the application's main method was executed to handle
       * "final" tasks like rendering or retrieving data.
       *
       */
      finalize: function finalize() {},

      /**
       * Called in the document.beforeunload event of the browser. If the method
       * returns a string value, the user will be asked by the browser, whether
       * he really wants to leave the page. The return string will be displayed in
       * the message box.
       *
       * @return {String?null} message text on unloading the page
       */
      close: function close() {},

      /**
       * This method contains the last code which is run inside the page and may contain cleanup code.
       *
       */
      terminate: function terminate() {}
    }
  });
  qx.application.IApplication.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Init": {
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.application.IApplication": {
        "require": true
      },
      "qx.locale.MTranslation": {
        "require": true
      },
      "qx.theme.manager.Meta": {},
      "qx.ui.tooltip.Manager": {},
      "qx.ui.style.Stylesheet": {},
      "qx.ui.core.queue.Manager": {}
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
   * Abstract base class for GUI applications using qooxdoo widgets.
   *
   * @require(qx.core.Init)
   */
  qx.Class.define("qx.application.AbstractGui", {
    type: "abstract",
    extend: qx.core.Object,
    implement: [qx.application.IApplication],
    include: qx.locale.MTranslation,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.Widget} The root widget */
      __root: null,

      /**
       * Create the root widget. This method is abstract and must be overridden
       * by sub classes.
       *
       * @return {qx.ui.core.Widget} The root widget. This widget must be configured
       *     with a {@link qx.ui.layout.Basic} or {@link qx.ui.layout.Canvas} layout.
       */
      _createRootWidget: function _createRootWidget() {
        throw new Error("Abstract method call");
      },

      /**
       * Returns the application's root widget. The root widgets can act as container
       * for popups. It is configured with a {@link qx.ui.layout.Basic} (if the
       * application is an inline application) layout or a {@link qx.ui.layout.Canvas}
       * (if the application is a standalone application) layout .
       *
       * The root has the same add method as the configured layout
       * ({@link qx.ui.layout.Basic} or {@link qx.ui.layout.Canvas}).
       *
       * @return {qx.ui.core.Widget} The application's root widget.
       */
      getRoot: function getRoot() {
        return this.__root;
      },
      // interface method
      main: function main() {
        // Initialize themes
        qx.theme.manager.Meta.getInstance().initialize(); // Initialize tooltip manager

        qx.ui.tooltip.Manager.getInstance();
        var rule = ["-webkit-touch-callout: none;", "-ms-touch-select: none;", "-webkit-tap-highlight-color: rgba(0,0,0,0);", "-webkit-tap-highlight-color: transparent;"].join("");
        qx.ui.style.Stylesheet.getInstance().addRule("*", rule);
        this.__root = this._createRootWidget(); // make sure we start with a good scroll position

        window.scrollTo(0, 0);
      },
      // interface method
      finalize: function finalize() {
        this.render();
      },

      /**
       * Updates the GUI rendering
       *
       */
      render: function render() {
        qx.ui.core.queue.Manager.flush();
      },
      // interface method
      close: function close(val) {// empty
      },
      // interface method
      terminate: function terminate() {// empty
      }
    }
  });
  qx.application.AbstractGui.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Init": {
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.application.AbstractGui": {
        "require": true
      },
      "qx.ui.root.Page": {}
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
   * For a GUI application on a traditional, HTML-dominated web page.
   *
   * The ideal environment for typical portal sites which use just a few qooxdoo
   * widgets. {@link qx.ui.root.Inline} can be used to embed qooxdoo widgets
   * into the page flow.
   *
   * @require(qx.core.Init)
   */
  qx.Class.define("qx.application.Inline", {
    extend: qx.application.AbstractGui,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _createRootWidget: function _createRootWidget() {
        return new qx.ui.root.Page(document);
      }
    }
  });
  qx.application.Inline.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "defer": "runtime",
        "require": true
      },
      "qx.core.ObjectRegistry": {},
      "qx.core.Object": {},
      "qx.core.MAssert": {
        "defer": "runtime"
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
       * Fabian Jakobs (fjakobs)
       * Jonathan Weiß (jonathan_rass)
  
     ======================================================================
  
       This class uses documentation of the native String methods from the MDC
       documentation of Mozilla.
  
       License:
         CC Attribution-Sharealike License:
         http://creativecommons.org/licenses/by-sa/2.5/
  
  ************************************************************************ */

  /**
   * This class emulates the built-in JavaScript String class. It can be used as
   * base class for classes, which need to derive from String.
   *
   * Instances of this class can be used in any place a JavaScript string can.
   */
  qx.Class.define("qx.type.BaseString", {
    extend: Object,

    /**
     * @param txt {String?""} Initialize with this string
     */
    construct: function construct(txt) {
      var txt = txt || ""; // no base call needed

      this.__txt = txt;
      this.length = txt.length;
    },
    members: {
      $$isString: true,
      length: 0,
      __txt: null,

      /**
       * Returns a string representing the specified object.
       *
       * The valueOf method of String returns the primitive value of a String
       * object as a string data type.
       * This method is usually called internally by JavaScript and not
       * explicitly in code.
       *
       * @return {String} A new string containing the string value.
       */
      toString: function toString() {
        return this.__txt;
      },

      /**
       *  Returns the specified character from a string.
       *
       * Characters in a string are indexed from left to right. The index of the
       * first character is 0, and the index of the last character in a string
       * called stringName is stringName.length - 1. If the index you supply is
       * out of range, JavaScript returns an empty string.
       *
       * @signature function(index)
       * @param index {Integer} An integer between 0 and 1 less than the length
       *   of the string.
       * @return {String} The character.
       */
      charAt: null,

      /**
       * Returns the primitive value of a String object.
       *
       * The valueOf method of String returns the primitive value of a String
       * object as a string data type.
       * This method is usually called internally by JavaScript and not
       * explicitly in code.
       *
       * @signature function()
       * @return {String} A new string containing the primitive value.
       */
      valueOf: null,

      /**
       * Returns a number indicating the Unicode value of the character at the given index.
       *
       * @signature function(index)
       * @param index {Integer} An integer greater than 0 and less than the length
       *   of the string; if it is not a number, it defaults to 0.
       * @return {Integer} The number.
       */
      charCodeAt: null,

      /**
       * Combines the text of two or more strings and returns a new string.
       * Changes to the text in one string do not affect the other string.
       *
       * @signature function(stringN)
       * @param stringN {String} One or more strings to be combined.
       * @return {String} The combined string.
       */
      concat: null,

      /**
       * Returns the index within the calling String object of the first
       * occurrence of the specified value, starting the search at fromIndex,
       * returns -1 if the value is not found.
       *
       * @signature function(index, offset)
       * @param index {String} A string representing the value to search for.
       * @param offset {Integer?0} The location within the calling string to start
       *   the search from. It can be any integer between 0 and the length of the
       *   string. The default value is 0.
       * @return {Integer} The index or -1.
       */
      indexOf: null,

      /**
       * Returns the index within the calling String object of the last occurrence
       * of the specified value, or -1 if not found. The calling string is
       * searched backward, starting at fromIndex.
       *
       * @signature function(index, offset)
       * @param index {String} A string representing the value to search for.
       * @param offset {Integer?0} The location within the calling string to start
       *   the search from, indexed from left to right. It can be any integer
       *   between 0 and the length of the string. The default value is the length
       *    of the string.
       * @return {Integer} The index or -1.
       */
      lastIndexOf: null,

      /**
       * Used to retrieve the matches when matching a string against a regular
       * expression.
       *
       * If the regular expression does not include the g flag, returns the same
       * result as regexp.exec(string). If the regular expression includes the g
       * flag, the method returns an Array containing all matches.
       *
       * @signature function(regexp)
       * @param regexp {Object} A regular expression object. If a non-RegExp object
       *  obj is passed, it is implicitly converted to a RegExp by using
       *   new RegExp(obj).
       * @return {Object} The matching RegExp object or an array containing all
       *   matches.
       */
      match: null,

      /**
       * Finds a match between a regular expression and a string, and replaces the
       * matched substring with a new substring.
       *
       * @signature function(regexp, aFunction)
       * @param regexp {Object} A RegExp object. The match is replaced by the
       *   return value of parameter #2. Or a String that is to be replaced by
       *   newSubStr.
       * @param aFunction {Function} A function to be invoked to create the new
       *   substring (to put in place of the substring received from parameter
       *   #1).
       * @return {String} The new substring.
       */
      replace: null,

      /**
       * Executes the search for a match between a regular expression and this
       * String object.
       *
       * If successful, search returns the index of the regular expression inside
       * the string. Otherwise, it returns -1.
       *
       * @signature function(regexp)
       * @param regexp {Object} A regular expression object. If a non-RegExp object
       *  obj is passed, it is implicitly converted to a RegExp by using
       *   new RegExp(obj).
       * @return {Object} The matching RegExp object or -1.
       *   matches.
       */
      search: null,

      /**
       * Extracts a section of a string and returns a new string.
       *
       * Slice extracts the text from one string and returns a new string. Changes
       * to the text in one string do not affect the other string.
       * As a negative index, endSlice indicates an offset from the end of the
       * string.
       *
       * @signature function(beginslice, endSlice)
       * @param beginslice {Integer} The zero-based index at which to begin
       *   extraction.
       * @param endSlice {Integer?null} The zero-based index at which to end
       *   extraction. If omitted, slice extracts to the end of the string.
       * @return {String} The extracted string.
       */
      slice: null,

      /**
       * Splits a String object into an array of strings by separating the string
       * into substrings.
       *
       * When found, separator is removed from the string and the substrings are
       * returned in an array. If separator is omitted, the array contains one
       * element consisting of the entire string.
       *
       * If separator is a regular expression that contains capturing parentheses,
       * then each time separator is matched the results (including any undefined
       * results) of the capturing parentheses are spliced into the output array.
       * However, not all browsers support this capability.
       *
       * Note: When the string is empty, split returns an array containing one
       *
       * @signature function(separator, limit)
       * @param separator {String?null} Specifies the character to use for
       *   separating the string. The separator is treated as a string or a regular
       *   expression. If separator is omitted, the array returned contains one
       *   element consisting of the entire string.
       * @param limit {Integer?null} Integer specifying a limit on the number of
       *   splits to be found.
       * @return {Array} The Array containing substrings.
       */
      split: null,

      /**
       * Returns the characters in a string beginning at the specified location
       * through the specified number of characters.
       *
       * Start is a character index. The index of the first character is 0, and the
       * index of the last character is 1 less than the length of the string. substr
       *  begins extracting characters at start and collects length characters
       * (unless it reaches the end of the string first, in which case it will
       * return fewer).
       * If start is positive and is greater than or equal to the length of the
       * string, substr returns an empty string.
       *
       * @signature function(start, length)
       * @param start {Integer} Location at which to begin extracting characters
       *   (an integer between 0 and one less than the length of the string).
       * @param length {Integer?null} The number of characters to extract.
       * @return {String} The substring.
       */
      substr: null,

      /**
       * Returns a subset of a String object.
       *
       * substring extracts characters from indexA up to but not including indexB.
       * In particular:
       * If indexA equals indexB, substring returns an empty string.
       * If indexB is omitted, substring extracts characters to the end of the
       * string.
       * If either argument is less than 0 or is NaN, it is treated as if it were
       * 0.
       * If either argument is greater than stringName.length, it is treated as if
       * it were stringName.length.
       * If indexA is larger than indexB, then the effect of substring is as if
       * the two arguments were swapped; for example, str.substring(1, 0) == str.substring(0, 1).
       *
       * @signature function(indexA, indexB)
       * @param indexA {Integer} An integer between 0 and one less than the
       *   length of the string.
       * @param indexB {Integer?null} (optional) An integer between 0 and the
       *   length of the string.
       * @return {String} The subset.
       */
      substring: null,

      /**
       * Returns the calling string value converted to lowercase.
       * The toLowerCase method returns the value of the string converted to
       * lowercase. toLowerCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLowerCase: null,

      /**
       * Returns the calling string value converted to uppercase.
       * The toUpperCase method returns the value of the string converted to
       * uppercase. toUpperCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toUpperCase: null,

      /**
       * Return unique hash code of object
       *
       * @return {Integer} unique hash code of the object
       */
      toHashCode: function toHashCode() {
        return qx.core.ObjectRegistry.toHashCode(this);
      },

      /**
       * The characters within a string are converted to lower case while
       * respecting the current locale.
       *
       * The toLowerCase method returns the value of the string converted to
       * lowercase. toLowerCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLocaleLowerCase: null,

      /**
       * The characters within a string are converted to upper case while
       * respecting the current locale.
       * The toUpperCase method returns the value of the string converted to
       * uppercase. toUpperCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLocaleUpperCase: null,

      /**
       * Call the same method of the super class.
       *
       * @param args {arguments} the arguments variable of the calling method
       * @param varags {var} variable number of arguments passed to the overwritten function
       * @return {var} the return value of the method of the base class.
       */
      base: function base(args, varags) {
        return qx.core.Object.prototype.base.apply(this, arguments);
      }
    },

    /*
     *****************************************************************************
        DEFER
     *****************************************************************************
     */
    defer: function defer(statics, members) {
      // add asserts into each debug build
      {
        qx.Class.include(statics, qx.core.MAssert);
      }
      var mappedFunctions = ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'replace', 'search', 'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase', 'toLocaleLowerCase', 'toLocaleUpperCase', 'trim']; // feature/bug detection:
      // Some older Firefox version (<2) break if valueOf is overridden

      members.valueOf = members.toString;

      if (new statics("").valueOf() == null) {
        delete members.valueOf;
      }

      for (var i = 0, l = mappedFunctions.length; i < l; i++) {
        members[mappedFunctions[i]] = String.prototype[mappedFunctions[i]];
      }
    }
  });
  qx.type.BaseString.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.type.BaseString": {
        "construct": true,
        "require": true
      },
      "qx.locale.Manager": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class contains the translation of a message and all information
   * to translate it again into a different language.
   */
  qx.Class.define("qx.locale.LocalizedString", {
    extend: qx.type.BaseString,

    /**
     * @param translation {String} The translated message
     * @param messageId {String} The messageId to translate
     * @param args {Array} list of arguments passed used as values for format strings
     * @param localized {Boolean} True if the string uses localize instead of translate
     */
    construct: function construct(translation, messageId, args, localized) {
      qx.type.BaseString.constructor.call(this, translation);
      this.__messageId = messageId;
      this.__localized = !!localized;
      this.__args = args;
    },
    members: {
      __localized: null,
      __messageId: null,
      __args: null,

      /**
       * Get a translation of the string using the current locale.
       *
       * @return {qx.locale.LocalizedString|String} This string translated using the current
       *    locale.
       */
      translate: function translate() {
        if (this.__localized) {
          return qx.locale.Manager.getInstance().localize(this.__messageId, this.__args);
        }

        return qx.locale.Manager.getInstance().translate(this.__messageId, this.__args);
      },

      /**
       * Returns the messageId.
       *
       * @return {String} The messageId of this localized String
       */
      getMessageId: function getMessageId() {
        return this.__messageId;
      }
    }
  });
  qx.locale.LocalizedString.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.OperatingSystem": {},
      "qx.lang.Type": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["locale", "locale.variant", "locale.default"],
      "required": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class comes with all relevant information regarding
   * the client's selected locale.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Locale", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * The name of the system locale e.g. "de" when the full locale is "de_AT"
       * @return {String} The current locale
       * @internal
       */
      getLocale: function getLocale() {
        var locale = qx.bom.client.Locale.__getNavigatorLocale();

        var index = locale.indexOf("-");

        if (index != -1) {
          locale = locale.substr(0, index);
        }

        return locale;
      },

      /**
       * The name of the variant for the system locale e.g. "at" when the
       * full locale is "de_AT"
       *
       * @return {String} The locales variant.
       * @internal
       */
      getVariant: function getVariant() {
        var locale = qx.bom.client.Locale.__getNavigatorLocale();

        var variant = "";
        var index = locale.indexOf("-");

        if (index != -1) {
          variant = locale.substr(index + 1);
        }

        return variant;
      },

      /**
       * Internal helper for accessing the navigators language.
       *
       * @return {String} The language set by the navigator.
       */
      __getNavigatorLocale: function __getNavigatorLocale() {
        var locale = navigator.userLanguage || navigator.language || ""; // Android Bug: Android does not return the system language from the
        // navigator language before version 4.4.x. Try to parse the language
        // from the userAgent.
        // See http://code.google.com/p/android/issues/detail?id=4641

        if (qx.bom.client.OperatingSystem.getName() == "android") {
          var version = /^(\d+)\.(\d+)(\..+)?/i.exec(qx.bom.client.OperatingSystem.getVersion());

          if (qx.lang.Type.isArray(version) && version.length >= 3) {
            if (parseInt(version[1]) < 4 || parseInt(version[1]) === 4 && parseInt(version[2]) < 4) {
              var match = /(\w{2})-(\w{2})/i.exec(navigator.userAgent);

              if (match) {
                locale = match[0];
              }
            }
          }
        }

        return locale.toLowerCase();
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("locale", statics.getLocale);
      qx.core.Environment.add("locale.variant", statics.getVariant);
      qx.core.Environment.add("locale.default", "C");
    }
  });
  qx.bom.client.Locale.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.Direct": {
        "require": true
      },
      "qx.locale.LocalizedString": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
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
      "qx.lang.Array": {},
      "qx.bom.client.Locale": {
        "require": true
      },
      "qx.log.Logger": {},
      "qx.lang.String": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "locale": {
          "className": "qx.bom.client.Locale"
        },
        "locale.default": {
          "className": "qx.bom.client.Locale",
          "load": true
        },
        "locale.variant": {
          "className": "qx.bom.client.Locale"
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
   * The qx.locale.Manager provides static translation methods (like tr()) and
   * general locale information.
   *
   * @require(qx.event.dispatch.Direct)
   * @require(qx.locale.LocalizedString)
   *
   * @cldr()
   */
  qx.Class.define("qx.locale.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__translations = qx.$$translations || {};
      this.__locales = qx.$$locales || {};
      this.initLocale();
      this.__clientLocale = this.getLocale();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Translate a message
       *
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      tr: function tr(messageId, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 1);
        return qx.locale.Manager.getInstance().translate(messageId, args);
      },

      /**
       * Translate a plural message
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} singular form if equals 1, otherwise plural
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trn: function trn(singularMessageId, pluralMessageId, count, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 3); // assumes "Two forms, singular used for one only" (seems to be the most common form)
        // (http://www.gnu.org/software/gettext/manual/html_node/gettext_150.html#Plural-forms)
        // closely related with bug #745

        if (count != 1) {
          return qx.locale.Manager.getInstance().translate(pluralMessageId, args);
        } else {
          return qx.locale.Manager.getInstance().translate(singularMessageId, args);
        }
      },

      /**
       * Translate a message with translation hint (from developer addressed to translator).
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trc: function trc(hint, messageId, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 2);
        return qx.locale.Manager.getInstance().translate(messageId, args);
      },

      /**
       * Translate a plural message with translation hint (from developer addressed to translator).
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} singular form if equals 1, otherwise plural
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trnc: function trnc(hint, singularMessageId, pluralMessageId, count, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 4); // see trn()

        if (count != 1) {
          return qx.locale.Manager.getInstance().translate(pluralMessageId, args);
        } else {
          return qx.locale.Manager.getInstance().translate(singularMessageId, args);
        }
      },

      /**
       * Mark the message for translation but return the original message.
       *
       * @param messageId {String} the message ID
       * @return {String} messageId
       */
      marktr: function marktr(messageId) {
        return messageId;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** current locale. locale is an language code like de, de_AT, en, en_GB, fr, ... */
      locale: {
        check: "String",
        apply: "_applyLocale",
        event: "changeLocale",
        init: function () {
          var locale = qx.core.Environment.get("locale");

          if (!locale || locale === "") {
            return qx.core.Environment.get("locale.default");
          }

          var variant = qx.core.Environment.get("locale.variant");

          if (variant !== "") {
            locale += "_" + variant;
          }

          return locale;
        }()
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __defaultLocale: qx.core.Environment.get("locale.default"),
      __locale: null,
      __language: null,
      __translations: null,
      __locales: null,
      __clientLocale: null,

      /**
       * Get the language code of the current locale
       *
       * This is the first part of a locale definition. The language for "de_DE" would be "de"
       *
       * @return {String} language code
       */
      getLanguage: function getLanguage() {
        return this.__language;
      },

      /**
       * Get the territory code of the current locale
       *
       * This is the second part of a locale definition. The territory for "de_DE" would be "DE"
       *
       * @return {String} territory code
       */
      getTerritory: function getTerritory() {
        return this.getLocale().split("_")[1] || "";
      },

      /**
       * Return the available application locales
       *
       * This corresponds to the LOCALES setting in config.json. Without argument,
       * it only returns the currently loaded locales, with an argument of true
       * all locales that went into the build. This is particularly interesting if
       * locales were generated as dedicated I18N parts, and have to be loaded
       * explicitly before being available.
       *
       * @param includeNonloaded {Boolean?null} include locales not yet loaded
       * @return {String[]} array of available locales
       */
      getAvailableLocales: function getAvailableLocales(includeNonloaded) {
        var locales = [];

        for (var locale in this.__locales) {
          if (locale != this.__defaultLocale) {
            if (this.__locales[locale] === null && !includeNonloaded) {
              continue; // skip not yet loaded locales
            }

            locales.push(locale);
          }
        }

        return locales;
      },

      /**
       * Extract the language part from a locale.
       *
       * @param locale {String} locale to be used
       * @return {String} language
       */
      __extractLanguage: function __extractLanguage(locale) {
        var language;

        if (locale == null) {
          return null;
        }

        var pos = locale.indexOf("_");

        if (pos == -1) {
          language = locale;
        } else {
          language = locale.substring(0, pos);
        }

        return language;
      },
      // property apply
      _applyLocale: function _applyLocale(value, old) {
        {
          if (!(value in this.__locales || value == this.__clientLocale)) {
            qx.log.Logger.warn("Locale: " + value + " not available.");
          }
        }
        this.__locale = value;
        this.__language = this.__extractLanguage(value);
      },

      /**
       * Add a translation to the translation manager.
       *
       * If <code>languageCode</code> already exists, its map will be updated with
       * <code>translationMap</code> (new keys will be added, existing keys will be
       * overwritten).
       *
       * @param languageCode {String} language code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
       * @param translationMap {Map} mapping of message identifiers to message strings in the target
       *                             language, e.g. <i>{"greeting_short" : "Hello"}</i>. Plural forms
       *                             are separate keys.
       */
      addTranslation: function addTranslation(languageCode, translationMap) {
        var catalog = this.__translations;

        if (catalog[languageCode]) {
          for (var key in translationMap) {
            catalog[languageCode][key] = translationMap[key];
          }
        } else {
          catalog[languageCode] = translationMap;
        }
      },

      /**
       * Add a localization to the localization manager.
       *
       * If <code>localeCode</code> already exists, its map will be updated with
       * <code>localeMap</code> (new keys will be added, existing keys will be overwritten).
       *
       * @param localeCode {String} locale code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
       * @param localeMap {Map} mapping of locale keys to the target locale values, e.g.
       *                        <i>{"cldr_date_format_short" : "M/d/yy"}</i>.
       */
      addLocale: function addLocale(localeCode, localeMap) {
        var catalog = this.__locales;

        if (catalog[localeCode]) {
          for (var key in localeMap) {
            catalog[localeCode][key] = localeMap[key];
          }
        } else {
          catalog[localeCode] = localeMap;
        }
      },

      /**
       * Translate a message using the current locale and apply format string to the arguments.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      translate: function translate(messageId, args, locale) {
        var catalog = this.__translations;
        return this.__lookupAndExpand(catalog, messageId, args, locale);
      },

      /**
       * Provide localization (CLDR) data.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      localize: function localize(messageId, args, locale) {
        var catalog = this.__locales;
        return this.__lookupAndExpand(catalog, messageId, args, locale);
      },

      /**
       * Look up an I18N key in a catalog and expand format strings.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param catalog {Map} map of I18N keys and their values
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      __lookupAndExpand: function __lookupAndExpand(catalog, messageId, args, locale) {
        {
          this.assertObject(catalog);
          this.assertString(messageId);
          this.assertArray(args);
        }
        var txt;

        if (!catalog) {
          return messageId;
        }

        if (locale) {
          var language = this.__extractLanguage(locale);
        } else {
          locale = this.__locale;
          language = this.__language;
        } // e.g. DE_at


        if (!txt && catalog[locale]) {
          txt = catalog[locale][messageId];
        } // e.g. DE


        if (!txt && catalog[language]) {
          txt = catalog[language][messageId];
        } // C


        if (!txt && catalog[this.__defaultLocale]) {
          txt = catalog[this.__defaultLocale][messageId];
        }

        if (!txt) {
          txt = messageId;
        }

        if (args.length > 0) {
          var translatedArgs = [];

          for (var i = 0; i < args.length; i++) {
            var arg = args[i];

            if (arg && arg.translate) {
              translatedArgs[i] = arg.translate();
            } else {
              translatedArgs[i] = arg;
            }
          }

          txt = qx.lang.String.format(txt, translatedArgs);
        }

        {
          txt = new qx.locale.LocalizedString(txt, messageId, args, catalog === this.__locales);
        }
        return txt;
      }
    }
  });
  qx.locale.Manager.$$dbClassInfo = $$dbClassInfo;
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Abstract base class for all managers of themed values.
   */
  qx.Class.define("qx.util.ValueManager", {
    type: "abstract",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create empty dynamic map

      this._dynamic = {};
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _dynamic: null,

      /**
       * Returns the dynamically interpreted result for the incoming value
       *
       * @param value {String} dynamically interpreted identifier
       * @return {var} return the (translated) result of the incoming value
       */
      resolveDynamic: function resolveDynamic(value) {
        return this._dynamic[value];
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        return !!this._dynamic[value];
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        if (value && this._dynamic[value]) {
          return this._dynamic[value];
        }

        return value;
      },

      /**
       * Sets the dynamics map.
       * @param value {Map} The map.
       */
      _setDynamic: function _setDynamic(value) {
        this._dynamic = value;
      },

      /**
       * Returns the dynamics map.
       * @return {Map} The map.
       */
      _getDynamic: function _getDynamic() {
        return this._dynamic;
      }
    }
  });
  qx.util.ValueManager.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.ValueManager": {
        "require": true
      },
      "qx.util.ColorUtil": {}
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
   * Manager for color themes
   */
  qx.Class.define("qx.theme.manager.Color", {
    type: "singleton",
    extend: qx.util.ValueManager,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** the currently selected color theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _applyTheme: function _applyTheme(value) {
        var dest = {};

        if (value) {
          var colors = value.colors;

          for (var name in colors) {
            dest[name] = this.__parseColor(colors, name);
          }
        }

        this._setDynamic(dest);
      },

      /**
       * Helper to take a color stored in the theme and returns the string color value.
       * In most of the times that means it just returns the string stored in the theme.
       * It additionally checks if its a valid color at all.
       *
       * @param colors {Map} The map of color definitions.
       * @param name {String} The name of the color to check.
       * @return {String} The resolved color as string.
       */
      __parseColor: function __parseColor(colors, name) {
        var color = colors[name];

        if (typeof color === "string") {
          if (!qx.util.ColorUtil.isCssString(color)) {
            // check for references to in theme colors
            if (colors[color] != undefined) {
              return this.__parseColor(colors, color);
            }

            throw new Error("Could not parse color: " + color);
          }

          return color;
        } else if (color instanceof Array) {
          return qx.util.ColorUtil.rgbToRgbString(color);
        }

        throw new Error("Could not parse color: " + color);
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        var cache = this._dynamic;
        var resolved = cache[value];

        if (resolved) {
          return resolved;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && theme.colors[value]) {
          return cache[value] = theme.colors[value];
        }

        return value;
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        var cache = this._dynamic;

        if (value && cache[value] !== undefined) {
          return true;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && value && theme.colors[value] !== undefined) {
          cache[value] = theme.colors[value];
          return true;
        }

        return false;
      }
    }
  });
  qx.theme.manager.Color.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {},
      "qx.ui.core.queue.Manager": {},
      "qx.ui.core.queue.Visibility": {}
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
   * The AppearanceQueue registers all widgets which are influences through
   * state changes.
   */
  qx.Class.define("qx.ui.core.queue.Appearance", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue: [],

      /** @type {Map} map of widgets by hash code which are in the queue */
      __lookup: {},

      /**
       * Clears the widget from the internal queue. Normally only used
       * during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       */
      remove: function remove(widget) {
        if (this.__lookup[widget.$$hash]) {
          qx.lang.Array.remove(this.__queue, widget);
          delete this.__lookup[widget.$$hash];
        }
      },

      /**
       * Adds a widget to the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       */
      add: function add(widget) {
        if (this.__lookup[widget.$$hash]) {
          return;
        }

        this.__queue.unshift(widget);

        this.__lookup[widget.$$hash] = widget;
        qx.ui.core.queue.Manager.scheduleFlush("appearance");
      },

      /**
       * Whether the given widget is already queued
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the widget is queued
       */
      has: function has(widget) {
        return !!this.__lookup[widget.$$hash];
      },

      /**
       * Flushes the appearance queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        var Visibility = qx.ui.core.queue.Visibility;
        var queue = this.__queue;
        var obj;

        for (var i = queue.length - 1; i >= 0; i--) {
          // Order is important to allow the same widget to be re-queued directly
          obj = queue[i];
          queue.splice(i, 1);
          delete this.__lookup[obj.$$hash]; // Only apply to currently visible widgets

          if (Visibility.isVisible(obj)) {
            obj.syncAppearance();
          } else {
            obj.$$stateChanges = true;
          }
        }
      }
    }
  });
  qx.ui.core.queue.Appearance.$$dbClassInfo = $$dbClassInfo;
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
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Manager for appearance themes
   */
  qx.Class.define("qx.theme.manager.Appearance", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__styleCache = {};
      this.__aliasMap = {};
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Currently used appearance theme */
      theme: {
        check: "Theme",
        nullable: true,
        event: "changeTheme",
        apply: "_applyTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * @lint ignoreReferenceField(__defaultStates)
       */
      __defaultStates: {},
      __styleCache: null,
      __aliasMap: null,
      // property apply
      _applyTheme: function _applyTheme() {
        // empty the caches
        this.__aliasMap = {};
        this.__styleCache = {};
      },

      /*
      ---------------------------------------------------------------------------
        THEME HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the appearance entry ID to use
       * when all aliases etc. are processed.
       *
       * @param id {String} ID to resolve.
       * @param theme {Theme} Theme to use for lookup.
       * @param defaultId {String} ID for a fallback.
       * @param chain {Array} The appearance id chain.
       * @return {String} Resolved ID
       */
      __resolveId: function __resolveId(id, theme, defaultId, chain) {
        var db = theme.appearances;
        var entry = db[id];

        if (!entry) {
          var divider = "/";
          var end = [];
          var splitted = id.split(divider);
          var chainCopy = qx.lang.Array.clone(splitted);
          var alias;

          while (!entry && splitted.length > 0) {
            end.unshift(splitted.pop());
            var baseid = splitted.join(divider);
            entry = db[baseid];

            if (entry) {
              alias = entry.alias || entry;

              if (typeof alias === "string") {
                var mapped = alias + divider + end.join(divider);
                return this.__resolveId(mapped, theme, defaultId, chainCopy);
              }
            }
          } // check if we find a control fitting in the appearance [BUG #4020]


          for (var i = 0; i < end.length - 1; i++) {
            // remove the first id, it has already been checked at startup
            end.shift(); // build a new subid without the former first id

            var subId = end.join(divider);

            var resolved = this.__resolveId(subId, theme, null, chainCopy);

            if (resolved) {
              return resolved;
            }
          } // check for the fallback


          if (defaultId != null) {
            return this.__resolveId(defaultId, theme, null, chainCopy);
          } // it's safe to output this message here since we can be sure that the return
          // value is 'null' and something went wrong with the id lookup.


          {
            if (typeof chain !== "undefined") {
              this.debug("Cannot find a matching appearance for '" + chain.join("/") + "'.");

              if (chain.length > 1) {
                this.info("Hint: This may be an issue with nested child controls and a missing alias definition in the appearance theme.");
              }
            }
          }
          return null;
        } else if (typeof entry === "string") {
          return this.__resolveId(entry, theme, defaultId, chainCopy);
        } else if (entry.include && !entry.style) {
          return this.__resolveId(entry.include, theme, defaultId, chainCopy);
        }

        return id;
      },

      /**
       * Get the result of the "state" function for a given id and states
       *
       * @param id {String} id of the appearance (e.g. "button", "label", ...)
       * @param states {Map} hash map defining the set states
       * @param theme {Theme?} appearance theme
       * @param defaultId {String} fallback id.
       * @return {Map} map of widget properties as returned by the "state" function
       */
      styleFrom: function styleFrom(id, states, theme, defaultId) {
        if (!theme) {
          theme = this.getTheme();
        } // Resolve ID


        var aliasMap = this.__aliasMap;

        if (!aliasMap[theme.name]) {
          aliasMap[theme.name] = {};
        }

        var resolved = aliasMap[theme.name][id];

        if (!resolved) {
          resolved = aliasMap[theme.name][id] = this.__resolveId(id, theme, defaultId);
        } // Query theme for ID


        var entry = theme.appearances[resolved];

        if (!entry) {
          this.warn("Missing appearance: " + id);
          return null;
        } // Entries with includes, but without style are automatically merged
        // by the ID handling in {@link #getEntry}. When there is no style method in the
        // final object the appearance is empty and null could be returned.


        if (!entry.style) {
          return null;
        } // Build an unique cache name from ID and state combination


        var unique = resolved;

        if (states) {
          // Create data fields
          var bits = entry.$$bits;

          if (!bits) {
            bits = entry.$$bits = {};
            entry.$$length = 0;
          } // Compute sum


          var sum = 0;

          for (var state in states) {
            if (!states[state]) {
              continue;
            }

            if (bits[state] == null) {
              bits[state] = 1 << entry.$$length++;
            }

            sum += bits[state];
          } // Only append the sum if it is bigger than zero


          if (sum > 0) {
            unique += ":" + sum;
          }
        } // Using cache if available


        var cache = this.__styleCache;

        if (cache[theme.name] && cache[theme.name][unique] !== undefined) {
          return cache[theme.name][unique];
        } // Fallback to default (empty) states map


        if (!states) {
          states = this.__defaultStates;
        } // Compile the appearance


        var result; // If an include or base is defined, too, we need to merge the entries

        if (entry.include || entry.base) {
          // Gather included data
          var incl;

          if (entry.include) {
            incl = this.styleFrom(entry.include, states, theme, defaultId);
          } // This process tries to insert the original data first, and
          // append the new data later, to higher prioritize the local
          // data above the included/inherited data. This is especially needed
          // for property groups or properties which includes other
          // properties when modified.


          var local = entry.style(states, incl); // Create new map

          result = {}; // Copy base data, but exclude overwritten local and included stuff

          if (entry.base) {
            var base = this.styleFrom(resolved, states, entry.base, defaultId);

            if (entry.include) {
              for (var baseIncludeKey in base) {
                if (!incl.hasOwnProperty(baseIncludeKey) && !local.hasOwnProperty(baseIncludeKey)) {
                  result[baseIncludeKey] = base[baseIncludeKey];
                }
              }
            } else {
              for (var baseKey in base) {
                if (!local.hasOwnProperty(baseKey)) {
                  result[baseKey] = base[baseKey];
                }
              }
            }
          } // Copy include data, but exclude overwritten local stuff


          if (entry.include) {
            for (var includeKey in incl) {
              if (!local.hasOwnProperty(includeKey)) {
                result[includeKey] = incl[includeKey];
              }
            }
          } // Append local data


          for (var localKey in local) {
            result[localKey] = local[localKey];
          }
        } else {
          result = entry.style(states);
        } // Cache new entry and return


        if (!cache[theme.name]) {
          cache[theme.name] = {};
        }

        return cache[theme.name][unique] = result || null;
      }
    }
  });
  qx.theme.manager.Appearance.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.util.AliasManager": {},
      "qx.theme.manager.Color": {},
      "qx.io.ImageLoader": {},
      "qx.lang.String": {},
      "qx.bom.client.Css": {},
      "qx.html.Image": {},
      "qx.html.Label": {},
      "qx.html.Element": {},
      "qx.util.ResourceManager": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {},
      "qx.bom.element.Decoration": {},
      "qx.lang.Type": {},
      "qx.bom.AnimationFrame": {},
      "qx.theme.manager.Font": {},
      "qx.lang.Object": {},
      "qx.theme.manager.Decoration": {},
      "qx.ui.core.queue.Layout": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.alphaimageloaderneeded": {
          "className": "qx.bom.client.Css"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine",
          "load": true
        },
        "engine.version": {
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * The image class displays an image file
   *
   * This class supports image clipping, which means that multiple images can be combined
   * into one large image and only the relevant part is shown.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var image = new qx.ui.basic.Image("icon/32/actions/format-justify-left.png");
   *
   *   this.getRoot().add(image);
   * </pre>
   *
   * This example create a widget to display the image
   * <code>icon/32/actions/format-justify-left.png</code>.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/image.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.ui.basic.Image", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param source {String?null} The URL of the image to display.
     */
    construct: function construct(source) {
      this.__contentElements = {};
      qx.ui.core.Widget.constructor.call(this);

      if (source) {
        this.setSource(source);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The URL of the image. Setting it will possibly abort loading of current image. */
      source: {
        check: "String",
        init: null,
        nullable: true,
        event: "changeSource",
        apply: "_applySource",
        themeable: true
      },

      /**
       * Whether the image should be scaled to the given dimensions
       *
       * This is disabled by default because it prevents the usage
       * of image clipping when enabled.
       */
      scale: {
        check: "Boolean",
        init: false,
        event: "changeScale",
        themeable: true,
        apply: "_applyScale"
      },
      // overridden
      appearance: {
        refine: true,
        init: "image"
      },
      // overridden
      allowShrinkX: {
        refine: true,
        init: false
      },
      // overridden
      allowShrinkY: {
        refine: true,
        init: false
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
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired if the image source can not be loaded. This event can only be
       * fired for the first loading of an unmanaged resource (external image).
       */
      loadingFailed: "qx.event.type.Event",

      /**
       * Fired if the image has been loaded. This is even true for managed
       * resources (images known by generator).
       */
      loaded: "qx.event.type.Event",

      /** Fired when the pending request has been aborted. */
      aborted: "qx.event.type.Event"
    },
    statics: {
      PLACEHOLDER_IMAGE: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __width: null,
      __height: null,
      __mode: null,
      __contentElements: null,
      __currentContentElement: null,
      __wrapper: null,
      __requestId: 0,
      // overridden
      _onChangeTheme: function _onChangeTheme() {
        qx.ui.basic.Image.prototype._onChangeTheme.base.call(this); // restyle source (theme change might have changed the resolved url)


        this._styleSource();
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      getContentElement: function getContentElement() {
        return this.__getSuitableContentElement();
      },
      // overridden
      _createContentElement: function _createContentElement() {
        return this.__getSuitableContentElement();
      },
      // overridden
      _getContentHint: function _getContentHint() {
        return {
          width: this.__width || 0,
          height: this.__height || 0
        };
      },
      // overridden
      _applyDecorator: function _applyDecorator(value, old) {
        qx.ui.basic.Image.prototype._applyDecorator.base.call(this, value, old);

        var source = this.getSource();
        source = qx.util.AliasManager.getInstance().resolve(source);
        var el = this.getContentElement();

        if (this.__wrapper) {
          el = el.getChild(0);
        }

        this.__setSource(el, source);
      },
      // overridden
      _applyTextColor: function _applyTextColor(value) {
        if (this.__getMode() === "font") {
          var el = this.getContentElement();

          if (this.__wrapper) {
            el = el.getChild(0);
          }

          if (value) {
            el.setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
          } else {
            el.removeStyle("color");
          }
        }
      },
      // overridden
      _applyPadding: function _applyPadding(value, old, name) {
        qx.ui.basic.Image.prototype._applyPadding.base.call(this, value, old, name);

        var element = this.getContentElement();

        if (this.__wrapper) {
          element.getChild(0).setStyles({
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        } else if (this.__getMode() === 'font') {
          element.setStyles({
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        } else {
          element.setPadding(this.getPaddingLeft() || 0, this.getPaddingTop() || 0);
        }
      },
      renderLayout: function renderLayout(left, top, width, height) {
        qx.ui.basic.Image.prototype.renderLayout.base.call(this, left, top, width, height);
        var element = this.getContentElement();

        if (this.__wrapper) {
          element.getChild(0).setStyles({
            width: width - (this.getPaddingLeft() || 0) - (this.getPaddingRight() || 0),
            height: height - (this.getPaddingTop() || 0) - (this.getPaddingBottom() || 0),
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        }
      },

      /*
      ---------------------------------------------------------------------------
        IMAGE API
      ---------------------------------------------------------------------------
      */
      // property apply, overridden
      _applyEnabled: function _applyEnabled(value, old) {
        qx.ui.basic.Image.prototype._applyEnabled.base.call(this, value, old);

        if (this.getSource()) {
          this._styleSource();
        }
      },
      // property apply
      _applySource: function _applySource(value, old) {
        // abort loading current image
        if (old) {
          if (qx.io.ImageLoader.isLoading(old)) {
            qx.io.ImageLoader.abort(old);
          }
        }

        this._styleSource();
      },
      // property apply
      _applyScale: function _applyScale(value) {
        this._styleSource();
      },

      /**
       * Remembers the mode to keep track which contentElement is currently in use.
       * @param mode {String} internal mode (alphaScaled|scaled|nonScaled)
       */
      __setMode: function __setMode(mode) {
        this.__mode = mode;
      },

      /**
       * Returns the current mode if set. Otherwise checks the current source and
       * the current scaling to determine the current mode.
       *
       * @return {String} current internal mode
       */
      __getMode: function __getMode() {
        if (this.__mode == null) {
          var source = this.getSource();

          if (source && qx.lang.String.startsWith(source, "@")) {
            this.__mode = "font";
          }

          var isPng = false;

          if (source != null) {
            isPng = source.endsWith(".png");
          }

          if (this.getScale() && isPng && qx.core.Environment.get("css.alphaimageloaderneeded")) {
            this.__mode = "alphaScaled";
          } else if (this.getScale()) {
            this.__mode = "scaled";
          } else {
            this.__mode = "nonScaled";
          }
        }

        return this.__mode;
      },

      /**
       * Creates a contentElement suitable for the current mode
       *
       * @param mode {String} internal mode
       * @return {qx.html.Image} suitable image content element
       */
      __createSuitableContentElement: function __createSuitableContentElement(mode) {
        var scale;
        var tagName;
        var clazz = qx.html.Image;

        switch (mode) {
          case "font":
            clazz = qx.html.Label;
            scale = true;
            tagName = "div";
            break;

          case "alphaScaled":
            scale = true;
            tagName = "div";
            break;

          case "nonScaled":
            scale = false;
            tagName = "div";
            break;

          default:
            scale = true;
            tagName = "img";
            break;
        }

        var element = new clazz(tagName);
        element.connectWidget(this);
        element.setStyles({
          "overflowX": "hidden",
          "overflowY": "hidden",
          "boxSizing": "border-box"
        });

        if (mode == "font") {
          element.setRich(true);
        } else {
          element.setScale(scale);

          if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
            var wrapper = this.__wrapper = new qx.html.Element("div");
            element.connectWidget(this);
            wrapper.setStyle("position", "absolute");
            wrapper.add(element);
            return wrapper;
          }
        }

        return element;
      },

      /**
       * Returns a contentElement suitable for the current mode
       *
       * @return {qx.html.Image} suitable image contentElement
       */
      __getSuitableContentElement: function __getSuitableContentElement() {
        if (this.$$disposed) {
          return null;
        }

        var mode = this.__getMode();

        if (this.__contentElements[mode] == null) {
          this.__contentElements[mode] = this.__createSuitableContentElement(mode);
        }

        var element = this.__contentElements[mode];

        if (!this.__currentContentElement) {
          this.__currentContentElement = element;
        }

        return element;
      },

      /**
       * Applies the source to the clipped image instance or preload
       * an image to detect sizes and apply it afterwards.
       *
       */
      _styleSource: function _styleSource() {
        var AliasManager = qx.util.AliasManager.getInstance();
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var source = AliasManager.resolve(this.getSource());
        var element = this.getContentElement();

        if (this.__wrapper) {
          element = element.getChild(0);
        }

        if (!source) {
          this.__resetSource(element);

          return;
        }

        this.__checkForContentElementSwitch(source);

        if (qx.core.Environment.get("engine.name") == "mshtml" && (parseInt(qx.core.Environment.get("engine.version"), 10) < 9 || qx.core.Environment.get("browser.documentmode") < 9)) {
          var repeat = this.getScale() ? "scale" : "no-repeat";
          element.tagNameHint = qx.bom.element.Decoration.getTagName(repeat, source);
        }

        var contentEl = this.__getContentElement(); // Detect if the image registry knows this image


        if (ResourceManager.isFontUri(source)) {
          this.__setManagedImage(contentEl, source);

          var color = this.getTextColor();

          if (qx.lang.Type.isString(color)) {
            this._applyTextColor(color, null);
          }
        } else if (ResourceManager.has(source)) {
          var highResolutionSource = ResourceManager.findHighResolutionSource(source);

          if (highResolutionSource) {
            var imageWidth = ResourceManager.getImageWidth(source);
            var imageHeight = ResourceManager.getImageHeight(source);
            this.setWidth(imageWidth);
            this.setHeight(imageHeight); // set background size on current element (div or img)

            var backgroundSize = imageWidth + "px, " + imageHeight + "px";

            this.__currentContentElement.setStyle("background-size", backgroundSize);

            this.setSource(highResolutionSource);
            source = highResolutionSource;
          }

          this.__setManagedImage(contentEl, source);

          this.__fireLoadEvent();
        } else if (qx.io.ImageLoader.isLoaded(source)) {
          this.__setUnmanagedImage(contentEl, source);

          this.__fireLoadEvent();
        } else {
          this.__loadUnmanagedImage(contentEl, source);
        }
      },

      /**
       * Helper function, which fires <code>loaded</code> event asynchronously.
       * It emulates native <code>loaded</code> event of an image object. This
       * helper will be called, if you try to load a managed image or an
       * previously loaded unmanaged image.
       */
      __fireLoadEvent: function __fireLoadEvent() {
        this.__requestId++;
        qx.bom.AnimationFrame.request(function (rId) {
          // prevent firing of the event if source changed in the meantime
          if (rId === this.__requestId) {
            this.fireEvent("loaded");
          } else {
            this.fireEvent("aborted");
          }
        }.bind(this, this.__requestId));
      },

      /**
       * Returns the content element.
       * @return {qx.html.Image} content element
       */
      __getContentElement: function __getContentElement() {
        var contentEl = this.__currentContentElement;

        if (this.__wrapper) {
          contentEl = contentEl.getChild(0);
        }

        return contentEl;
      },

      /**
       * Checks if the current content element is capable to display the image
       * with the current settings (scaling, alpha PNG)
       *
       * @param source {String} source of the image
       */
      __checkForContentElementSwitch: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(source) {
          var alphaImageLoader = qx.core.Environment.get("css.alphaimageloaderneeded");
          var isPng = source.endsWith(".png");
          var isFont = source.startsWith("@");

          if (isFont) {
            this.__setMode("font");
          } else if (alphaImageLoader && isPng) {
            if (this.getScale() && this.__getMode() != "alphaScaled") {
              this.__setMode("alphaScaled");
            } else if (!this.getScale() && this.__getMode() != "nonScaled") {
              this.__setMode("nonScaled");
            }
          } else {
            if (this.getScale() && this.__getMode() != "scaled") {
              this.__setMode("scaled");
            } else if (!this.getScale() && this.__getMode() != "nonScaled") {
              this.__setMode("nonScaled");
            }
          }

          this.__checkForContentElementReplacement(this.__getSuitableContentElement());
        },
        "default": function _default(source) {
          var isFont = source && qx.lang.String.startsWith(source, "@");

          if (isFont) {
            this.__setMode("font");
          } else if (this.getScale() && this.__getMode() != "scaled") {
            this.__setMode("scaled");
          } else if (!this.getScale() && this.__getMode() != "nonScaled") {
            this.__setMode("nonScaled");
          }

          this.__checkForContentElementReplacement(this.__getSuitableContentElement());
        }
      }),

      /**
       * Checks the current child and replaces it if necessary
       *
       * @param elementToAdd {qx.html.Image} content element to add
       */
      __checkForContentElementReplacement: function __checkForContentElementReplacement(elementToAdd) {
        var currentContentElement = this.__currentContentElement;

        if (currentContentElement != elementToAdd) {
          if (currentContentElement != null) {
            var pixel = "px";
            var styles = {}; //inherit styles from current element

            var currentStyles = currentContentElement.getAllStyles();

            if (currentStyles) {
              for (var prop in currentStyles) {
                styles[prop] = currentStyles[prop];
              }
            } // Don't transfer background image when switching from image to icon font


            if (this.__getMode() === "font") {
              delete styles.backgroundImage;
            } // Copy dimension and location of the current content element


            var bounds = this.getBounds();

            if (bounds != null) {
              styles.width = bounds.width + pixel;
              styles.height = bounds.height + pixel;
            }

            var insets = this.getInsets();
            styles.left = parseInt(currentContentElement.getStyle("left") || insets.left) + pixel;
            styles.top = parseInt(currentContentElement.getStyle("top") || insets.top) + pixel;
            styles.zIndex = 10;
            var newEl = this.__wrapper ? elementToAdd.getChild(0) : elementToAdd;
            newEl.setStyles(styles, true);
            newEl.setSelectable(this.getSelectable());

            if (!currentContentElement.isVisible()) {
              elementToAdd.hide();
            } else if (!elementToAdd.isVisible()) {
              elementToAdd.show();
            }

            if (!currentContentElement.isIncluded()) {
              elementToAdd.exclude();
            } else if (!elementToAdd.isIncluded()) {
              elementToAdd.include();
            }

            var container = currentContentElement.getParent();

            if (container) {
              var index = container.getChildren().indexOf(currentContentElement);
              container.removeAt(index);
              container.addAt(elementToAdd, index);
            } // force re-application of source so __setSource is called again


            var hint = newEl.getNodeName();

            if (newEl.setSource) {
              newEl.setSource(null);
            } else {
              newEl.setValue("");
            }

            var currentEl = this.__getContentElement();

            newEl.tagNameHint = hint;
            newEl.setAttribute("class", currentEl.getAttribute("class")); // Flush elements to make sure the DOM elements are created.

            qx.html.Element.flush();
            var currentDomEl = currentEl.getDomElement();
            var newDomEl = elementToAdd.getDomElement(); // copy event listeners

            var listeners = currentContentElement.getListeners() || [];
            listeners.forEach(function (listenerData) {
              elementToAdd.addListener(listenerData.type, listenerData.handler, listenerData.self, listenerData.capture);
            });

            if (currentDomEl && newDomEl) {
              // Switch the DOM elements' hash codes. This is required for the event
              // layer to work [BUG #7447]
              var currentHash = currentDomEl.$$hash;
              currentDomEl.$$hash = newDomEl.$$hash;
              newDomEl.$$hash = currentHash;
            }

            this.__currentContentElement = elementToAdd;
          }
        }
      },

      /**
       * Use the ResourceManager to set a managed image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setManagedImage: function __setManagedImage(el, source) {
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var isFont = ResourceManager.isFontUri(source); // Try to find a disabled image in registry

        if (!this.getEnabled()) {
          var disabled = source.replace(/\.([a-z]+)$/, "-disabled.$1");

          if (!isFont && ResourceManager.has(disabled)) {
            source = disabled;
            this.addState("replacement");
          } else {
            this.removeState("replacement");
          }
        } // Optimize case for enabled changes when no disabled image was found


        if (!isFont && el.getSource() === source) {
          return;
        } // Special case for non resource manager handled font icons


        if (isFont) {
          // Don't use scale if size is set via postfix
          if (this.getScale() && parseInt(source.split("/")[2], 10)) {
            this.setScale(false);
          } // Adjust size if scaling is applied


          var width;
          var height;

          if (this.getScale()) {
            var hint = this.getSizeHint();
            width = this.getWidth() || hint.width;
            height = this.getHeight() || hint.height;
          } else {
            var font = qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]);
            {
              this.assertObject(font, "Virtual image source contains unkown font descriptor");
            }
            var size = parseInt(source.split("/")[2] || font.getSize(), 10);
            width = ResourceManager.getImageWidth(source) || size;
            height = ResourceManager.getImageHeight(source) || size;
          }

          this.__updateContentHint(width, height);

          this.__setSource(el, source); // Apply source

        } else {
          // Apply source
          this.__setSource(el, source); // Compare with old sizes and relayout if necessary


          this.__updateContentHint(ResourceManager.getImageWidth(source), ResourceManager.getImageHeight(source));
        }
      },
      _applyDimension: function _applyDimension() {
        qx.ui.basic.Image.prototype._applyDimension.base.call(this);

        var isFont = this.getSource() && qx.lang.String.startsWith(this.getSource(), "@");

        if (isFont) {
          var el = this.getContentElement();

          if (el) {
            if (this.getScale()) {
              var hint = this.getSizeHint();
              var width = this.getWidth() || hint.width || 40;
              var height = this.getHeight() || hint.height || 40;
              el.setStyle("fontSize", (width > height ? height : width) + "px");
            } else {
              var font = qx.theme.manager.Font.getInstance().resolve(this.getSource().match(/@([^/]+)/)[1]);
              el.setStyle("fontSize", font.getSize() + "px");
            }
          }
        }
      },

      /**
       * Use the infos of the ImageLoader to set an unmanaged image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setUnmanagedImage: function __setUnmanagedImage(el, source) {
        var ImageLoader = qx.io.ImageLoader; // Apply source

        this.__setSource(el, source); // Compare with old sizes and relayout if necessary


        var width = ImageLoader.getWidth(source);
        var height = ImageLoader.getHeight(source);

        this.__updateContentHint(width, height);
      },

      /**
       * Use the ImageLoader to load an unmanaged image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __loadUnmanagedImage: function __loadUnmanagedImage(el, source) {
        var ImageLoader = qx.io.ImageLoader;
        {
          // loading external images via HTTP/HTTPS is a common usecase, as is
          // using data URLs.
          var sourceLC = source.toLowerCase();

          if (!sourceLC.startsWith("http") && !sourceLC.startsWith("data:image/")) {
            var self = qx.ui.basic.Image;

            if (!self.__warned) {
              self.__warned = {};
            }

            if (!self.__warned[source]) {
              this.debug("try to load an unmanaged relative image: " + source);
              self.__warned[source] = true;
            }
          }
        } // only try to load the image if it not already failed

        if (!ImageLoader.isFailed(source)) {
          ImageLoader.load(source, this.__loaderCallback, this);
        } else {
          this.__resetSource(el);
        }
      },

      /**
       * Reset source displayed by the DOM element.
       *
       * @param el {Element} image DOM element
       */
      __resetSource: function __resetSource(el) {
        if (el != null) {
          if (el instanceof qx.html.Image) {
            el.resetSource();
          } else {
            el.resetValue();
          }
        }
      },

      /**
       * Combines the decorator's image styles with our own image to make sure
       * gradient and backgroundImage decorators work on Images.
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setSource: function __setSource(el, source) {
        var isFont = source && qx.lang.String.startsWith(source, "@");

        if (isFont) {
          var sparts = source.split("/");
          var fontSource = source;

          if (sparts.length > 2) {
            fontSource = sparts[0] + "/" + sparts[1];
          }

          var ResourceManager = qx.util.ResourceManager.getInstance();
          var font = qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]);
          var fontStyles = qx.lang.Object.clone(font.getStyles());
          delete fontStyles.color;
          el.setStyles(fontStyles);
          el.setStyle("font");
          el.setStyle("display", "table-cell");
          el.setStyle("verticalAlign", "middle");
          el.setStyle("textAlign", "center");

          if (this.getScale()) {
            el.setStyle("fontSize", (this.__width > this.__height ? this.__height : this.__width) + "px");
          } else {
            var size = parseInt(sparts[2] || qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]).getSize());
            el.setStyle("fontSize", size + "px");
          }

          var resource = ResourceManager.getData(fontSource);

          if (resource) {
            el.setValue(String.fromCharCode(resource[2]));
          } else {
            var charCode = parseInt(qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)\/(.*)$/)[2]), 16);
            {
              this.assertNumber(charCode, "Font source needs either a glyph name or the unicode number in hex");
            }
            el.setValue(String.fromCharCode(charCode));
          }

          return;
        } else if (el.getNodeName() == "div") {
          // checks if a decorator already set.
          // In this case we have to merge background styles
          var decorator = qx.theme.manager.Decoration.getInstance().resolve(this.getDecorator());

          if (decorator) {
            var hasGradient = decorator.getStartColor() && decorator.getEndColor();
            var hasBackground = decorator.getBackgroundImage();

            if (hasGradient || hasBackground) {
              var repeat = this.getScale() ? "scale" : "no-repeat"; // get the style attributes for the given source

              var attr = qx.bom.element.Decoration.getAttributes(source, repeat); // get the background image(s) defined by the decorator

              var decoratorStyle = decorator.getStyles(true);
              var combinedStyles = {
                "backgroundImage": attr.style.backgroundImage,
                "backgroundPosition": attr.style.backgroundPosition || "0 0",
                "backgroundRepeat": attr.style.backgroundRepeat || "no-repeat"
              };

              if (hasBackground) {
                combinedStyles["backgroundPosition"] += "," + decoratorStyle["background-position"] || "0 0";
                combinedStyles["backgroundRepeat"] += ", " + decorator.getBackgroundRepeat();
              }

              if (hasGradient) {
                combinedStyles["backgroundPosition"] += ", 0 0";
                combinedStyles["backgroundRepeat"] += ", no-repeat";
              }

              combinedStyles["backgroundImage"] += "," + (decoratorStyle["background-image"] || decoratorStyle["background"]); // apply combined background images

              el.setStyles(combinedStyles);
              return;
            }
          } else {
            // force re-apply to remove old decorator styles
            if (el.setSource) {
              el.setSource(null);
            }
          }
        }

        if (el.setSource) {
          el.setSource(source);
        }
      },

      /**
       * Event handler fired after the preloader has finished loading the icon
       *
       * @param source {String} Image source which was loaded
       * @param imageInfo {Map} Dimensions of the loaded image
       */
      __loaderCallback: function __loaderCallback(source, imageInfo) {
        // Ignore the callback on already disposed images
        if (this.$$disposed === true) {
          return;
        } // Ignore when the source has already been modified


        if (source !== qx.util.AliasManager.getInstance().resolve(this.getSource())) {
          this.fireEvent("aborted");
          return;
        } /// Output a warning if the image could not loaded and quit


        if (imageInfo.failed) {
          this.warn("Image could not be loaded: " + source);
          this.fireEvent("loadingFailed");
        } else if (imageInfo.aborted) {
          this.fireEvent("aborted");
          return;
        } else {
          this.fireEvent("loaded");
        } // Update image


        this.__setUnmanagedImage(this.__getContentElement(), source);
      },

      /**
       * Updates the content hint when the image size has been changed
       *
       * @param width {Integer} width of the image
       * @param height {Integer} height of the image
       */
      __updateContentHint: function __updateContentHint(width, height) {
        // Compare with old sizes and relayout if necessary
        if (width !== this.__width || height !== this.__height) {
          this.__width = width;
          this.__height = height;
          qx.ui.core.queue.Layout.add(this);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      for (var mode in this.__contentElements) {
        if (this.__contentElements.hasOwnProperty(mode)) {
          this.__contentElements[mode].disconnectWidget(this);
        }
      }

      delete this.__currentContentElement;

      if (this.__wrapper) {
        delete this.__wrapper;
      }

      this._disposeMap("__contentElements");
    }
  });
  qx.ui.basic.Image.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Function": {},
      "qx.event.Idle": {},
      "qx.bom.element.Location": {},
      "qx.util.placement.Placement": {}
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
       * Martin Wittemann (martinwittemann)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Methods to place popup like widgets to other widgets, points,
   * pointer event coordinates, etc.
   */
  qx.Mixin.define("qx.ui.core.MPlacement", {
    statics: {
      __visible: null,
      __direction: "left",

      /**
       * Set the always visible element. If an element is set, the
       * {@link #moveTo} method takes care of every move and tries not to cover
       * the given element with a movable widget like a popup or context menu.
       *
       * @param elem {qx.ui.core.Widget} The widget which should always be visible.
       */
      setVisibleElement: function setVisibleElement(elem) {
        this.__visible = elem;
      },

      /**
       * Returns the given always visible element. See {@link #setVisibleElement}
       * for more details.
       *
       * @return {qx.ui.core.Widget|null} The given widget.
       */
      getVisibleElement: function getVisibleElement() {
        return this.__visible;
      },

      /**
       * Set the move direction for an element which hides always visible element.
       * The value has only an effect when the {@link #setVisibleElement} is set.
       *
       * @param direction {String} The direction <code>left</code> or <code>top</code>.
       */
      setMoveDirection: function setMoveDirection(direction) {
        if (direction === "top" || direction === "left") {
          this.__direction = direction;
        } else {
          throw new Error("Invalid value for the parameter 'direction' [qx.ui.core.MPlacement.setMoveDirection()], the value was '" + direction + "' " + "but 'top' or 'left' are allowed.");
        }
      },

      /**
       * Returns the move direction for an element which hides always visible element.
       * See {@link #setMoveDirection} for more details.
       *
       * @return {String} The move direction.
       */
      getMoveDirection: function getMoveDirection() {
        return this.__direction;
      }
    },
    properties: {
      /**
       * Position of the aligned object in relation to the opener.
       *
       * Please note than changes to this property are only applied
       * when re-aligning the widget.
       *
       * The first part of the value is the edge to attach to. The second
       * part the alignment of the orthogonal edge after the widget
       * has been attached.
       *
       * The default value "bottom-left" for example means that the
       * widget should be shown directly under the given target and
       * then should be aligned to be left edge:
       *
       * <pre>
       * +--------+
       * | target |
       * +--------+
       * +-------------+
       * |   widget    |
       * +-------------+
       * </pre>
       */
      position: {
        check: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right", "left-top", "left-middle", "left-bottom", "right-top", "right-middle", "right-bottom"],
        init: "bottom-left",
        themeable: true
      },

      /**
       * Whether the widget should be placed relative to an other widget or to
       * the pointer.
       */
      placeMethod: {
        check: ["widget", "pointer"],
        init: "pointer",
        themeable: true
      },

      /** Whether the widget should moved using DOM methods. */
      domMove: {
        check: "Boolean",
        init: false
      },

      /**
       * Selects the algorithm to place the widget horizontally. <code>direct</code>
       * uses {@link qx.util.placement.DirectAxis}, <code>keep-align</code>
       * uses {@link qx.util.placement.KeepAlignAxis} and <code>best-fit</code>
       * uses {@link qx.util.placement.BestFitAxis}.
       */
      placementModeX: {
        check: ["direct", "keep-align", "best-fit"],
        init: "keep-align",
        themeable: true
      },

      /**
       * Selects the algorithm to place the widget vertically. <code>direct</code>
       * uses {@link qx.util.placement.DirectAxis}, <code>keep-align</code>
       * uses {@link qx.util.placement.KeepAlignAxis} and <code>best-fit</code>
       * uses {@link qx.util.placement.BestFitAxis}.
       */
      placementModeY: {
        check: ["direct", "keep-align", "best-fit"],
        init: "keep-align",
        themeable: true
      },

      /** Left offset of the pointer (in pixel) */
      offsetLeft: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Top offset of the pointer (in pixel) */
      offsetTop: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Right offset of the pointer (in pixel) */
      offsetRight: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Bottom offset of the pointer (in pixel) */
      offsetBottom: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Offsets in one group */
      offset: {
        group: ["offsetTop", "offsetRight", "offsetBottom", "offsetLeft"],
        mode: "shorthand",
        themeable: true
      }
    },
    members: {
      __ptwLiveUpdater: null,
      __ptwLiveDisappearListener: null,
      __ptwLiveUpdateDisappearListener: null,

      /**
       * Returns the location data like {qx.bom.element.Location#get} does,
       * but does not rely on DOM elements coordinates to be rendered. Instead,
       * this method works with the available layout data available in the moment
       * when it is executed.
       * This works best when called in some type of <code>resize</code> or
       * <code>move</code> event which are supported by all widgets out of the
       * box.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Map|null} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the widget relative coords the document.
       */
      getLayoutLocation: function getLayoutLocation(widget) {
        // Use post-layout dimensions
        // which do not rely on the final rendered DOM element
        var insets, bounds, left, top; // Add bounds of the widget itself

        bounds = widget.getBounds();

        if (!bounds) {
          return null;
        }

        left = bounds.left;
        top = bounds.top; // Keep size to protect it for loop

        var size = bounds; // Now loop up with parents until reaching the root

        widget = widget.getLayoutParent();

        while (widget && !widget.isRootWidget()) {
          // Add coordinates
          bounds = widget.getBounds();
          left += bounds.left;
          top += bounds.top; // Add insets

          insets = widget.getInsets();
          left += insets.left;
          top += insets.top; // Next parent

          widget = widget.getLayoutParent();
        } // Add the rendered location of the root widget


        if (widget && widget.isRootWidget()) {
          var rootCoords = widget.getContentLocation();

          if (rootCoords) {
            left += rootCoords.left;
            top += rootCoords.top;
          }
        } // Build location data


        return {
          left: left,
          top: top,
          right: left + size.width,
          bottom: top + size.height
        };
      },

      /**
       * Sets the position. Uses low-level, high-performance DOM
       * methods when the property {@link #domMove} is enabled.
       * Checks if an always visible element is set and moves the widget to not
       * overlay the always visible widget if possible. The algorithm tries to
       * move the widget as far left as necessary but not of the screen.
       * ({@link #setVisibleElement})
       *
       * @param left {Integer} The left position
       * @param top {Integer} The top position
       */
      moveTo: function moveTo(left, top) {
        var visible = qx.ui.core.MPlacement.getVisibleElement(); // if we have an always visible element

        if (visible) {
          var bounds = this.getBounds();
          var elemLocation = visible.getContentLocation(); // if we have bounds for both elements

          if (bounds && elemLocation) {
            var bottom = top + bounds.height;
            var right = left + bounds.width; // horizontal placement wrong
            // each number is for the upcomming check (huge element is
            // the always visible, eleme prefixed)
            //     | 3 |
            //   ---------
            //   | |---| |
            //   |       |
            // --|-|   |-|--
            // 1 | |   | | 2
            // --|-|   |-|--
            //   |       |
            //   | |---| |
            //   ---------
            //     | 4 |

            if (right > elemLocation.left && left < elemLocation.right && bottom > elemLocation.top && top < elemLocation.bottom) {
              var direction = qx.ui.core.MPlacement.getMoveDirection();

              if (direction === "left") {
                left = Math.max(elemLocation.left - bounds.width, 0);
              } else {
                top = Math.max(elemLocation.top - bounds.height, 0);
              }
            }
          }
        }

        if (this.getDomMove()) {
          this.setDomPosition(left, top);
        } else {
          this.setLayoutProperties({
            left: left,
            top: top
          });
        }
      },

      /**
       * Places the widget to another (at least laid out) widget. The DOM
       * element is not needed, but the bounds are needed to compute the
       * location of the widget to align to.
       *
       * @param target {qx.ui.core.Widget} Target coords align coords
       * @param liveupdate {Boolean} Flag indicating if the position of the
       * widget should be checked and corrected automatically.
       * @return {Boolean} true if the widget was successfully placed
       */
      placeToWidget: function placeToWidget(target, liveupdate) {
        // Use the idle event to make sure that the widget's position gets
        // updated automatically (e.g. the widget gets scrolled).
        if (liveupdate) {
          this.__cleanupFromLastPlaceToWidgetLiveUpdate(); // Bind target and livupdate to placeToWidget


          this.__ptwLiveUpdater = qx.lang.Function.bind(this.placeToWidget, this, target, false);
          qx.event.Idle.getInstance().addListener("interval", this.__ptwLiveUpdater); // Remove the listener when the element disappears.

          this.__ptwLiveUpdateDisappearListener = function () {
            this.__cleanupFromLastPlaceToWidgetLiveUpdate();
          };

          this.addListener("disappear", this.__ptwLiveUpdateDisappearListener, this);
        }

        var coords = target.getContentLocation() || this.getLayoutLocation(target);

        if (coords != null) {
          this._place(coords);

          return true;
        } else {
          return false;
        }
      },

      /**
       * Removes all resources allocated by the last run of placeToWidget with liveupdate=true
       */
      __cleanupFromLastPlaceToWidgetLiveUpdate: function __cleanupFromLastPlaceToWidgetLiveUpdate() {
        if (this.__ptwLiveUpdater) {
          qx.event.Idle.getInstance().removeListener("interval", this.__ptwLiveUpdater);
          this.__ptwLiveUpdater = null;
        }

        if (this.__ptwLiveUpdateDisappearListener) {
          this.removeListener("disappear", this.__ptwLiveUpdateDisappearListener, this);
          this.__ptwLiveUpdateDisappearListener = null;
        }
      },

      /**
       * Places the widget to the pointer position.
       *
       * @param event {qx.event.type.Pointer} Pointer event to align to
       */
      placeToPointer: function placeToPointer(event) {
        var left = Math.round(event.getDocumentLeft());
        var top = Math.round(event.getDocumentTop());
        var coords = {
          left: left,
          top: top,
          right: left,
          bottom: top
        };

        this._place(coords);
      },

      /**
       * Places the widget to any (rendered) DOM element.
       *
       * @param elem {Element} DOM element to align to
       * @param liveupdate {Boolean} Flag indicating if the position of the
       * widget should be checked and corrected automatically.
       */
      placeToElement: function placeToElement(elem, liveupdate) {
        var location = qx.bom.element.Location.get(elem);
        var coords = {
          left: location.left,
          top: location.top,
          right: location.left + elem.offsetWidth,
          bottom: location.top + elem.offsetHeight
        }; // Use the idle event to make sure that the widget's position gets
        // updated automatically (e.g. the widget gets scrolled).

        if (liveupdate) {
          // Bind target and livupdate to placeToWidget
          this.__ptwLiveUpdater = qx.lang.Function.bind(this.placeToElement, this, elem, false);
          qx.event.Idle.getInstance().addListener("interval", this.__ptwLiveUpdater); // Remove the listener when the element disappears.

          this.addListener("disappear", function () {
            if (this.__ptwLiveUpdater) {
              qx.event.Idle.getInstance().removeListener("interval", this.__ptwLiveUpdater);
              this.__ptwLiveUpdater = null;
            }
          }, this);
        }

        this._place(coords);
      },

      /**
       * Places the widget in relation to the given point
       *
       * @param point {Map} Coordinate of any point with the keys <code>left</code>
       *   and <code>top</code>.
       */
      placeToPoint: function placeToPoint(point) {
        var coords = {
          left: point.left,
          top: point.top,
          right: point.left,
          bottom: point.top
        };

        this._place(coords);
      },

      /**
       * Returns the placement offsets as a map
       *
       * @return {Map} The placement offsets
       */
      _getPlacementOffsets: function _getPlacementOffsets() {
        return {
          left: this.getOffsetLeft(),
          top: this.getOffsetTop(),
          right: this.getOffsetRight(),
          bottom: this.getOffsetBottom()
        };
      },

      /**
       * Get the size of the object to place. The callback will be called with
       * the size as first argument. This methods works asynchronously.
       *
       * The size of the object to place is the size of the widget. If a widget
       * including this mixin needs a different size it can implement the method
       * <code>_computePlacementSize</code>, which returns the size.
       *
       *  @param callback {Function} This function will be called with the size as
       *    first argument
       */
      __getPlacementSize: function __getPlacementSize(callback) {
        var size = null;

        if (this._computePlacementSize) {
          var size = this._computePlacementSize();
        } else if (this.isVisible()) {
          var size = this.getBounds();
        }

        if (size == null) {
          this.addListenerOnce("appear", function () {
            this.__getPlacementSize(callback);
          }, this);
        } else {
          callback.call(this, size);
        }
      },

      /**
       * Internal method to read specific this properties and
       * apply the results to the this afterwards.
       *
       * @param coords {Map} Location of the object to align the this to. This map
       *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
       *   and <code>bottom</code>.
       */
      _place: function _place(coords) {
        this.__getPlacementSize(function (size) {
          var result = qx.util.placement.Placement.compute(size, this.getLayoutParent().getBounds(), coords, this._getPlacementOffsets(), this.getPosition(), this.getPlacementModeX(), this.getPlacementModeY()); // state handling for tooltips e.g.

          this.removeState("placementLeft");
          this.removeState("placementRight");
          this.addState(coords.left < result.left ? "placementRight" : "placementLeft");
          this.moveTo(result.left, result.top);
        });
      }
    },
    destruct: function destruct() {
      this.__cleanupFromLastPlaceToWidgetLiveUpdate();
    }
  });
  qx.ui.core.MPlacement.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Image": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MPlacement": {
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
   * This widget is used as feedback widget in drag and drop actions.
   */
  qx.Class.define("qx.ui.core.DragDropCursor", {
    extend: qx.ui.basic.Image,
    include: qx.ui.core.MPlacement,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.basic.Image.constructor.call(this); // Put above other stuff

      this.setZIndex(1e8); // Move using DOM

      this.setDomMove(true); // Automatically add to root

      var root = this.getApplicationRoot();
      root.add(this, {
        left: -1000,
        top: -1000
      });
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "dragdrop-cursor"
      },

      /** The current drag&drop action */
      action: {
        check: ["alias", "copy", "move"],
        apply: "_applyAction",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    members: {
      // property apply
      _applyAction: function _applyAction(value, old) {
        if (old) {
          this.removeState(old);
        }

        if (value) {
          this.addState(value);
        }
      }
    }
  });
  qx.ui.core.DragDropCursor.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Style": {},
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {},
      "qx.bom.element.BoxSizing": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.quirksmode": {
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * jQuery Dimension Plugin
         http://jquery.com/
         Version 1.1.3
  
       Copyright:
         (c) 2007, Paul Bakaus & Brandon Aaron
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         Paul Bakaus
         Brandon Aaron
  
  ************************************************************************ */

  /**
   * Query the location of an arbitrary DOM element in relation to its top
   * level body element. Works in all major browsers:
   *
   * * Mozilla 1.5 + 2.0
   * * Internet Explorer 6.0 + 7.0 (both standard & quirks mode)
   * * Opera 9.2
   * * Safari 3.0 beta
   *
   * @ignore(SVGElement)
   */
  qx.Bootstrap.define("qx.bom.element.Location", {
    statics: {
      /**
       * Queries a style property for the given element
       *
       * @param elem {Element} DOM element to query
       * @param style {String} Style property
       * @return {String} Value of given style property
       */
      __style: function __style(elem, style) {
        return qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false);
      },

      /**
       * Queries a style property for the given element and parses it to an integer value
       *
       * @param elem {Element} DOM element to query
       * @param style {String} Style property
       * @return {Integer} Value of given style property
       */
      __num: function __num(elem, style) {
        return parseInt(qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false), 10) || 0;
      },

      /**
       * Computes the scroll offset of the given element relative to the document
       * <code>body</code>.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> scroll offsets
       */
      __computeScroll: function __computeScroll(elem) {
        var left = 0,
            top = 0; // Find window

        var win = qx.dom.Node.getWindow(elem);
        left -= qx.bom.Viewport.getScrollLeft(win);
        top -= qx.bom.Viewport.getScrollTop(win);
        return {
          left: left,
          top: top
        };
      },

      /**
       * Computes the offset of the given element relative to the document
       * <code>body</code>.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
       */
      __computeBody: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(elem) {
          // Find body element
          var doc = qx.dom.Node.getDocument(elem);
          var body = doc.body;
          var left = 0;
          var top = 0;
          left -= body.clientLeft + doc.documentElement.clientLeft;
          top -= body.clientTop + doc.documentElement.clientTop;

          if (!qx.core.Environment.get("browser.quirksmode")) {
            left += this.__num(body, "borderLeftWidth");
            top += this.__num(body, "borderTopWidth");
          }

          return {
            left: left,
            top: top
          };
        },
        "webkit": function webkit(elem) {
          // Find body element
          var doc = qx.dom.Node.getDocument(elem);
          var body = doc.body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop;
          return {
            left: left,
            top: top
          };
        },
        "gecko": function gecko(elem) {
          // Find body element
          var body = qx.dom.Node.getDocument(elem).body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop; // Correct substracted border (only in content-box mode)

          if (qx.bom.element.BoxSizing.get(body) !== "border-box") {
            left += this.__num(body, "borderLeftWidth");
            top += this.__num(body, "borderTopWidth");
          }

          return {
            left: left,
            top: top
          };
        },
        // At the moment only correctly supported by Opera
        "default": function _default(elem) {
          // Find body element
          var body = qx.dom.Node.getDocument(elem).body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop;
          return {
            left: left,
            top: top
          };
        }
      }),

      /**
       * Computes the sum of all offsets of the given element node.
       *
       * @signature function(elem)
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
       */
      __computeOffset: function __computeOffset(elem) {
        var rect = elem.getBoundingClientRect(); // Firefox 3.0 alpha 6 (gecko 1.9) returns floating point numbers
        // use Math.round() to round them to style compatible numbers
        // MSHTML returns integer numbers

        return {
          left: Math.round(rect.left),
          top: Math.round(rect.top)
        };
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
       *
       * @param elem {Element} DOM element to query
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the element relative to the document.
       */
      get: function get(elem, mode) {
        if (elem.tagName == "BODY") {
          var location = this.__getBodyLocation(elem);

          var left = location.left;
          var top = location.top;
        } else {
          var body = this.__computeBody(elem);

          var offset = this.__computeOffset(elem); // Reduce by viewport scrolling.
          // Hint: getBoundingClientRect returns the location of the
          // element in relation to the viewport which includes
          // the scrolling


          var scroll = this.__computeScroll(elem);

          var left = offset.left + body.left - scroll.left;
          var top = offset.top + body.top - scroll.top;
        }

        var elementWidth;
        var elementHeight;

        if (elem instanceof SVGElement) {
          var rect = elem.getBoundingClientRect();
          elementWidth = rect.width;
          elementHeight = rect.height;
        } else {
          elementWidth = elem.offsetWidth;
          elementHeight = elem.offsetHeight;
        }

        var right = left + elementWidth;
        var bottom = top + elementHeight;

        if (mode) {
          // In this modes we want the size as seen from a child what means that we want the full width/height
          // which may be higher than the outer width/height when the element has scrollbars.
          if (mode == "padding" || mode == "scroll") {
            var overX = qx.bom.element.Style.get(elem, "overflowX");

            if (overX == "scroll" || overX == "auto") {
              right += elem.scrollWidth - elementWidth + this.__num(elem, "borderLeftWidth") + this.__num(elem, "borderRightWidth");
            }

            var overY = qx.bom.element.Style.get(elem, "overflowY");

            if (overY == "scroll" || overY == "auto") {
              bottom += elem.scrollHeight - elementHeight + this.__num(elem, "borderTopWidth") + this.__num(elem, "borderBottomWidth");
            }
          }

          switch (mode) {
            case "padding":
              left += this.__num(elem, "paddingLeft");
              top += this.__num(elem, "paddingTop");
              right -= this.__num(elem, "paddingRight");
              bottom -= this.__num(elem, "paddingBottom");
            // no break here

            case "scroll":
              left -= elem.scrollLeft;
              top -= elem.scrollTop;
              right -= elem.scrollLeft;
              bottom -= elem.scrollTop;
            // no break here

            case "border":
              left += this.__num(elem, "borderLeftWidth");
              top += this.__num(elem, "borderTopWidth");
              right -= this.__num(elem, "borderRightWidth");
              bottom -= this.__num(elem, "borderBottomWidth");
              break;

            case "margin":
              left -= this.__num(elem, "marginLeft");
              top -= this.__num(elem, "marginTop");
              right += this.__num(elem, "marginRight");
              bottom += this.__num(elem, "marginBottom");
              break;
          }
        }

        return {
          left: left,
          top: top,
          right: right,
          bottom: bottom
        };
      },

      /**
       * Get the location of the body element relative to the document.
       * @param body {Element} The body element.
       * @return {Map} map with the keys <code>left</code> and <code>top</code>
       */
      __getBodyLocation: function __getBodyLocation(body) {
        var top = body.offsetTop;
        var left = body.offsetLeft;
        top += this.__num(body, "marginTop");
        left += this.__num(body, "marginLeft");

        if (qx.core.Environment.get("engine.name") === "gecko") {
          top += this.__num(body, "borderLeftWidth");
          left += this.__num(body, "borderTopWidth");
        }

        return {
          left: left,
          top: top
        };
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The left distance
       *   of the element relative to the document.
       */
      getLeft: function getLeft(elem, mode) {
        return this.get(elem, mode).left;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The top distance
       *   of the element relative to the document.
       */
      getTop: function getTop(elem, mode) {
        return this.get(elem, mode).top;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The right distance
       *   of the element relative to the document.
       */
      getRight: function getRight(elem, mode) {
        return this.get(elem, mode).right;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The bottom distance
       *   of the element relative to the document.
       */
      getBottom: function getBottom(elem, mode) {
        return this.get(elem, mode).bottom;
      },

      /**
       * Returns the distance between two DOM elements. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem1 {Element} First element
       * @param elem2 {Element} Second element
       * @param mode1 {String?null} Mode for first element
       * @param mode2 {String?null} Mode for second element
       * @return {Map} Returns a map with <code>left</code> and <code>top</code>
       *   which contains the distance of the elements from each other.
       */
      getRelative: function getRelative(elem1, elem2, mode1, mode2) {
        var loc1 = this.get(elem1, mode1);
        var loc2 = this.get(elem2, mode2);
        return {
          left: loc1.left - loc2.left,
          top: loc1.top - loc2.top,
          right: loc1.right - loc2.right,
          bottom: loc1.bottom - loc2.bottom
        };
      },

      /**
       * Returns the distance between the given element to its offset parent.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Returns a map with <code>left</code> and <code>top</code>
       *   which contains the distance of the elements from each other.
       */
      getPosition: function getPosition(elem) {
        return this.getRelative(elem, this.getOffsetParent(elem));
      },

      /**
       * Detects the offset parent of the given element
       *
       * @param element {Element} Element to query for offset parent
       * @return {Element} Detected offset parent
       */
      getOffsetParent: function getOffsetParent(element) {
        // Ther is no offsetParent for SVG elements
        if (element instanceof SVGElement) {
          return document.body;
        }

        var offsetParent = element.offsetParent || document.body;
        var Style = qx.bom.element.Style;

        while (offsetParent && !/^body|html$/i.test(offsetParent.tagName) && Style.get(offsetParent, "position") === "static") {
          offsetParent = offsetParent.offsetParent;
        }

        return offsetParent;
      }
    }
  });
  qx.bom.element.Location.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.queue.Manager": {}
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
   * The DisposeQueue registers all widgets which are should be disposed.
   * This queue makes it possible to remove widgets from the DOM using
   * the layout and element queues and dispose them afterwards.
   */
  qx.Class.define("qx.ui.core.queue.Dispose", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue: [],

      /**
       * Adds a widget to the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       */
      add: function add(widget) {
        var queue = this.__queue;

        if (queue.includes(widget)) {
          return;
        }

        queue.unshift(widget);
        qx.ui.core.queue.Manager.scheduleFlush("dispose");
      },

      /**
       * Whether the dispose queue is empty
       * @return {Boolean}
       * @internal
       */
      isEmpty: function isEmpty() {
        return this.__queue.length == 0;
      },

      /**
       * Flushes the dispose queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Dispose all registered objects
        var queue = this.__queue;

        for (var i = queue.length - 1; i >= 0; i--) {
          var widget = queue[i];
          queue.splice(i, 1);
          widget.dispose();
        } // Empty check


        if (queue.length != 0) {
          return;
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue = [];
      }
    }
  });
  qx.ui.core.queue.Dispose.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {},
      "qx.lang.Object": {},
      "qx.ui.core.queue.Manager": {}
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
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * The widget queue handles the deferred computation of certain widget properties.
   * It is used e.g. for the tree to update the indentation of tree nodes.
   *
   * This queue calls the method {@link qx.ui.core.Widget#syncWidget} of each
   * queued widget before the layout queues are processed.
   */
  qx.Class.define("qx.ui.core.queue.Widget", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue: [],

      /**
       * @type {Object} This contains a map of widgets hash ($$hash) and their
       * corresponding map of jobs.
       */
      __jobs: {},

      /**
       * Clears given job of a widget from the internal queue. If no jobs left, the
       * widget will be removed completely from queue. If job param is <code>null</code>
       * or <code>undefined</code> widget will be removed completely from queue.
       * Normally only used during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       * @param job {String?} Job identifier. If not used, it will be converted to
       * "$$default".
       */
      remove: function remove(widget, job) {
        var queue = this.__queue;

        if (!queue.includes(widget)) {
          return;
        }

        var hash = widget.$$hash; // remove widget and all corresponding jobs, if job param is not given.

        if (job == null) {
          qx.lang.Array.remove(queue, widget);
          delete this.__jobs[hash];
          return;
        }

        if (this.__jobs[hash]) {
          delete this.__jobs[hash][job];

          if (qx.lang.Object.getLength(this.__jobs[hash]) == 0) {
            qx.lang.Array.remove(queue, widget);
          }
        }
      },

      /**
       * Adds a widget to the queue. The second param can be used to identify
       * several jobs. You can add one job at once, which will be returned as
       * an map at flushing on method {@link qx.ui.core.Widget#syncWidget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       * @param job {String?} Job identifier. If not used, it will be converted to
       * "$$default".
       */
      add: function add(widget, job) {
        var queue = this.__queue; //add widget if not containing

        if (!queue.includes(widget)) {
          queue.unshift(widget);
        } //add job


        if (job == null) {
          job = "$$default";
        }

        var hash = widget.$$hash;

        if (!this.__jobs[hash]) {
          this.__jobs[hash] = {};
        }

        this.__jobs[hash][job] = true;
        qx.ui.core.queue.Manager.scheduleFlush("widget");
      },

      /**
       * Flushes the widget queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Process all registered widgets
        var queue = this.__queue;
        var obj, jobs;

        for (var i = queue.length - 1; i >= 0; i--) {
          // Order is important to allow the same widget to be requeued directly
          obj = queue[i];
          jobs = this.__jobs[obj.$$hash];
          queue.splice(i, 1);
          obj.syncWidget(jobs);
        } // Empty check


        if (queue.length != 0) {
          return;
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue = [];
        this.__jobs = {};
      }
    }
  });
  qx.ui.core.queue.Widget.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.ValueManager": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.Font": {},
      "qx.lang.Object": {},
      "qx.bom.webfonts.WebFont": {}
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
   * Manager for font themes
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   * @ignore(qx.$$fontBootstrap)
   */
  qx.Class.define("qx.theme.manager.Font", {
    type: "singleton",
    extend: qx.util.ValueManager,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.util.ValueManager.constructor.call(this); // Grab bootstrap info

      if (qx.$$fontBootstrap) {
        this._manifestFonts = qx.$$fontBootstrap;
        delete qx.$$fontBootstrap;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** the currently selected font theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _manifestFonts: null,

      /**
       * Returns the dynamically interpreted result for the incoming value
       *
       * @param value {String} dynamically interpreted identifier
       * @return {var} return the (translated) result of the incoming value
       */
      resolveDynamic: function resolveDynamic(value) {
        var dynamic = this._dynamic;
        return value instanceof qx.bom.Font ? value : dynamic[value];
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        var cache = this._dynamic;
        var resolved = cache[value];

        if (resolved) {
          return resolved;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && theme.fonts[value]) {
          var font = this.__getFontClass(theme.fonts[value]);

          var fo = new font(); // Inject information about custom charcter set tests before we apply the
          // complete blob in one.

          if (theme.fonts[value].comparisonString) {
            fo.setComparisonString(theme.fonts[value].comparisonString);
          }

          return cache[value] = fo.set(theme.fonts[value]);
        }

        return value;
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        var cache = this._dynamic;

        if (value && (value instanceof qx.bom.Font || cache[value] !== undefined)) {
          return true;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && value && theme.fonts[value]) {
          var font = this.__getFontClass(theme.fonts[value]);

          var fo = new font(); // Inject information about custom charcter set tests before we apply the
          // complete blob in one.

          if (theme.fonts[value].comparisonString) {
            fo.setComparisonString(theme.fonts[value].comparisonString);
          }

          cache[value] = fo.set(theme.fonts[value]);
          return true;
        }

        return false;
      },

      /**
       * Checks for includes and resolves them recursively
       *
       * @param fonts {Map} all fonts of the theme
       * @param fontName {String} font name to include
       */
      __resolveInclude: function __resolveInclude(fonts, fontName) {
        if (fonts[fontName].include) {
          // get font infos out of the font theme
          var fontToInclude = fonts[fonts[fontName].include]; // delete 'include' key - not part of the merge

          fonts[fontName].include = null;
          delete fonts[fontName].include;
          fonts[fontName] = qx.lang.Object.mergeWith(fonts[fontName], fontToInclude, false);

          this.__resolveInclude(fonts, fontName);
        }
      },
      // apply method
      _applyTheme: function _applyTheme(value) {
        var dest = this._dynamic;

        for (var key in dest) {
          if (dest[key].themed) {
            dest[key].dispose();
            delete dest[key];
          }
        }

        if (value) {
          var source = this._manifestFonts ? Object.assign(value.fonts, this._manifestFonts) : value.fonts;

          for (var key in source) {
            if (source[key].include && source[source[key].include]) {
              this.__resolveInclude(source, key);
            }

            var font = this.__getFontClass(source[key]);

            var fo = new font(); // Inject information about custom charcter set tests before we apply the
            // complete blob in one.

            if (source[key].comparisonString) {
              fo.setComparisonString(source[key].comparisonString);
            }

            dest[key] = fo.set(source[key]);
            dest[key].themed = true;
          }
        }

        this._setDynamic(dest);
      },

      /**
       * Decides which Font class should be used based on the theme configuration
       *
       * @param config {Map} The font's configuration map
       * @return {Class}
       */
      __getFontClass: function __getFontClass(config) {
        if (config.sources) {
          return qx.bom.webfonts.WebFont;
        }

        return qx.bom.Font;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeMap("_dynamic");
    }
  });
  qx.theme.manager.Font.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.AliasManager": {}
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
   * Manager for icon themes
   */
  qx.Class.define("qx.theme.manager.Icon", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** currently used icon theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // property apply
      _applyTheme: function _applyTheme(value, old) {
        var aliasManager = qx.util.AliasManager.getInstance();

        if (old) {
          for (var alias in old.aliases) {
            aliasManager.remove(alias);
          }
        }

        if (value) {
          for (var alias in value.aliases) {
            aliasManager.add(alias, value.aliases[alias]);
          }
        }
      }
    }
  });
  qx.theme.manager.Icon.$$dbClassInfo = $$dbClassInfo;
})();

//
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.dev.StackTrace": {}
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
   * Theme classes contain styling information for certain aspects of the
   * graphical user interface.
   *
   * Supported themes are: colors, decorations, fonts, icons, appearances.
   * The additional meta theme allows for grouping of the individual
   * themes.
   *
   * For more details, take a look at the
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/desktop/ui_theming.html' target='_blank'>
   * documentation of the theme system in the qooxdoo manual.</a>
   */
  qx.Bootstrap.define("qx.Theme", {
    statics: {
      /*
      ---------------------------------------------------------------------------
         PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Theme config
       *
       * Example:
       * <pre class='javascript'>
       * qx.Theme.define("name",
       * {
       *   aliases : {
       *     "aliasKey" : "resourceFolderOrUri"
       *   },
       *   extend : otherTheme,
       *   include : [MMixinTheme],
       *   patch : [MMixinTheme],
       *   colors : {},
       *   decorations : {},
       *   fonts : {},
       *   widgets : {},
       *   appearances : {},
       *   meta : {},
       *   boot : function(){}
       * });
       * </pre>
       *
       * For more details, take a look at the
       * <a href='http://manual.qooxdoo.org/${qxversion}/pages/desktop/ui_theming.html' target='_blank'>
       * documentation of the theme system in the qooxdoo manual.</a>
       *
       * @param name {String} name of the mixin
       * @param config {Map} config structure
       */
      define: function define(name, config) {
        if (!config) {
          var config = {};
        }

        config.include = this.__normalizeArray(config.include);
        config.patch = this.__normalizeArray(config.patch); // Validate incoming data

        {
          this.__validateConfig(name, config);
        } // Create alias

        var theme = {
          $$type: "Theme",
          name: name,
          title: config.title,
          // Attach toString
          toString: this.genericToString
        }; // Remember extend

        if (config.extend) {
          theme.supertheme = config.extend;
        } // Assign to namespace


        theme.basename = qx.Bootstrap.createNamespace(name, theme); // Convert theme entry from Object to Function (for prototype inheritance)

        this.__convert(theme, config);

        this.__initializeAliases(theme, config); // Store class reference in global class registry


        this.$$registry[name] = theme; // Include mixin themes

        for (var i = 0, a = config.include, l = a.length; i < l; i++) {
          this.include(theme, a[i]);
        }

        for (var i = 0, a = config.patch, l = a.length; i < l; i++) {
          this.patch(theme, a[i]);
        } // Run boot code


        if (config.boot) {
          config.boot();
        }
      },

      /**
       * Normalize an object to an array
       *
       * @param objectOrArray {Object|Array} Either an object that is to be
       *   normalized to an array, or an array, which is just passed through
       *
       * @return {Array} Either an array that has the original object as its
       *   single item, or the original array itself
       */
      __normalizeArray: function __normalizeArray(objectOrArray) {
        if (!objectOrArray) {
          return [];
        }

        if (qx.Bootstrap.isArray(objectOrArray)) {
          return objectOrArray;
        } else {
          return [objectOrArray];
        }
      },

      /**
       * Initialize alias inheritance
       *
       * @param theme {Map} The theme
       * @param config {Map} config structure
       */
      __initializeAliases: function __initializeAliases(theme, config) {
        var aliases = config.aliases || {};

        if (config.extend && config.extend.aliases) {
          qx.Bootstrap.objectMergeWith(aliases, config.extend.aliases, false);
        }

        theme.aliases = aliases;
      },

      /**
       * Return a map of all known themes
       *
       * @return {Map} known themes
       */
      getAll: function getAll() {
        return this.$$registry;
      },

      /**
       * Returns a theme by name
       *
       * @param name {String} theme name to check
       * @return {Object ? void} theme object
       */
      getByName: function getByName(name) {
        return this.$$registry[name];
      },

      /**
       * Determine if theme exists
       *
       * @param name {String} theme name to check
       * @return {Boolean} true if theme exists
       */
      isDefined: function isDefined(name) {
        return this.getByName(name) !== undefined;
      },

      /**
       * Determine the number of themes which are defined
       *
       * @return {Number} the number of classes
       */
      getTotalNumber: function getTotalNumber() {
        return qx.Bootstrap.objectGetLength(this.$$registry);
      },

      /*
      ---------------------------------------------------------------------------
         PRIVATE/INTERNAL API
      ---------------------------------------------------------------------------
      */

      /**
       * This method will be attached to all themes to return
       * a nice identifier for them.
       *
       * @internal
       * @return {String} The interface identifier
       */
      genericToString: function genericToString() {
        return "[Theme " + this.name + "]";
      },

      /**
       * Extract the inheritable key (could be only one)
       *
       * @param config {Map} The map from where to extract the key
       * @return {String} the key which was found
       */
      __extractType: function __extractType(config) {
        for (var i = 0, keys = this.__inheritableKeys, l = keys.length; i < l; i++) {
          if (config[keys[i]]) {
            return keys[i];
          }
        }
      },

      /**
       * Convert existing entry to a prototype based inheritance function
       *
       * @param theme {Theme} newly created theme object
       * @param config {Map} incoming theme configuration
       */
      __convert: function __convert(theme, config) {
        var type = this.__extractType(config); // Use theme key from extended theme if own one is not available


        if (config.extend && !type) {
          type = config.extend.type;
        } // Save theme type


        theme.type = type || "other"; // Create pseudo class

        var clazz = function clazz() {}; // Process extend config


        if (config.extend) {
          clazz.prototype = new config.extend.$$clazz();
        }

        var target = clazz.prototype;
        var source = config[type]; // Copy entries to prototype

        for (var id in source) {
          target[id] = source[id]; // Appearance themes only:
          // Convert base flag to class reference (needed for mixin support)

          if (target[id].base) {
            {
              if (!config.extend) {
                throw new Error("Found base flag in entry '" + id + "' of theme '" + config.name + "'. Base flags are not allowed for themes without a valid super theme!");
              }
            }
            target[id].base = config.extend;
          }
        } // store pseudo class


        theme.$$clazz = clazz; // and create instance under the old key

        theme[type] = new clazz();
      },

      /** @type {Map} Internal theme registry */
      $$registry: {},

      /** @type {Array} Keys which support inheritance */
      __inheritableKeys: ["colors", "borders", "decorations", "fonts", "icons", "widgets", "appearances", "meta"],

      /** @type {Map} allowed keys in theme definition */
      __allowedKeys: {
        "title": "string",
        // String
        "aliases": "object",
        // Map
        "type": "string",
        // String
        "extend": "object",
        // Theme
        "colors": "object",
        // Map
        "borders": "object",
        // Map
        "decorations": "object",
        // Map
        "fonts": "object",
        // Map
        "icons": "object",
        // Map
        "widgets": "object",
        // Map
        "appearances": "object",
        // Map
        "meta": "object",
        // Map
        "include": "object",
        // Array
        "patch": "object",
        // Array
        "boot": "function" // Function

      },

      /** @type {Map} allowed keys inside a meta theme block */
      __metaKeys: {
        "color": "object",
        "border": "object",
        "decoration": "object",
        "font": "object",
        "icon": "object",
        "appearance": "object",
        "widget": "object"
      },

      /**
       * Validates incoming configuration and checks keys and values
       *
       * @signature function(name, config)
       * @param name {String} The name of the class
       * @param config {Map} Configuration map
       * @throws {Error} if the given config is not valid (e.g. wrong key or wrong key value)
       */
      __validateConfig: function __validateConfig(name, config) {
        var allowed = this.__allowedKeys;

        for (var key in config) {
          if (allowed[key] === undefined) {
            throw new Error('The configuration key "' + key + '" in theme "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value is undefined/null!');
          }

          if (allowed[key] !== null && _typeof(config[key]) !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" in theme "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        } // Validate maps


        var maps = ["colors", "borders", "decorations", "fonts", "icons", "widgets", "appearances", "meta"];

        for (var i = 0, l = maps.length; i < l; i++) {
          var key = maps[i];

          if (config[key] !== undefined && (config[key] instanceof Array || config[key] instanceof RegExp || config[key] instanceof Date || config[key].classname !== undefined)) {
            throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value needs to be a map!');
          }
        } // Check conflicts (detect number ...)


        var counter = 0;

        for (var i = 0, l = maps.length; i < l; i++) {
          var key = maps[i];

          if (config[key]) {
            counter++;
          }

          if (counter > 1) {
            throw new Error("You can only define one theme category per file! Invalid theme: " + name);
          }
        } // Validate meta


        if (config.meta) {
          var value;

          for (var key in config.meta) {
            value = config.meta[key];

            if (this.__metaKeys[key] === undefined) {
              throw new Error('The key "' + key + '" is not allowed inside a meta theme block.');
            }

            if (_typeof(value) !== this.__metaKeys[key]) {
              throw new Error('The type of the key "' + key + '" inside the meta block is wrong.');
            }

            if (!(_typeof(value) === "object" && value !== null && value.$$type === "Theme")) {
              throw new Error('The content of a meta theme must reference to other themes. The value for "' + key + '" in theme "' + name + '" is invalid: ' + value);
            }
          }
        } // Validate extend


        if (config.extend && config.extend.$$type !== "Theme") {
          throw new Error('Invalid extend in theme "' + name + '": ' + config.extend);
        } // Validate include


        if (config.include) {
          for (var i = 0, l = config.include.length; i < l; i++) {
            if (typeof config.include[i] == "undefined" || config.include[i].$$type !== "Theme") {
              throw new Error('Invalid include in theme "' + name + '": ' + config.include[i]);
            }
          }
        } // Validate patch


        if (config.patch) {
          for (var i = 0, l = config.patch.length; i < l; i++) {
            if (typeof config.patch[i] === "undefined" || config.patch[i].$$type !== "Theme") {
              throw new Error('Invalid patch in theme "' + name + '": ' + config.patch[i]);
            }
          }
        }
      },

      /**
       * Include all keys of the given mixin theme into the theme. The mixin may
       * include keys which are already defined in the target theme. Existing
       * features of equal name will be overwritten.
       *
       * @param theme {Theme} An existing theme which should be modified by including the mixin theme.
       * @param mixinTheme {Theme} The theme to be included.
       */
      patch: function patch(theme, mixinTheme) {
        this.__checkForInvalidTheme(mixinTheme);

        var type = this.__extractType(mixinTheme);

        if (type !== this.__extractType(theme)) {
          throw new Error("The mixins '" + theme.name + "' are not compatible '" + mixinTheme.name + "'!");
        }

        var source = mixinTheme[type];
        var target = theme.$$clazz.prototype;

        for (var key in source) {
          target[key] = source[key];
        }
      },

      /**
       * Include all keys of the given mixin theme into the theme. If the
       * mixin includes any keys that are already available in the
       * class, they will be silently ignored. Use the {@link #patch} method
       * if you need to overwrite keys in the current class.
       *
       * @param theme {Theme} An existing theme which should be modified by including the mixin theme.
       * @param mixinTheme {Theme} The theme to be included.
       */
      include: function include(theme, mixinTheme) {
        this.__checkForInvalidTheme(mixinTheme);

        var type = mixinTheme.type;

        if (type !== theme.type) {
          throw new Error("The mixins '" + theme.name + "' are not compatible '" + mixinTheme.name + "'!");
        }

        var source = mixinTheme[type];
        var target = theme.$$clazz.prototype;

        for (var key in source) {
          //Skip keys already present
          if (target[key] !== undefined) {
            continue;
          }

          target[key] = source[key];
        }
      },

      /**
       * Helper method to check for an invalid theme
       *
       * @param mixinTheme {qx.Theme?null} theme to check
       * @throws {Error} if the theme is not valid
       */
      __checkForInvalidTheme: function __checkForInvalidTheme(mixinTheme) {
        if (typeof mixinTheme === "undefined" || mixinTheme == null) {
          var errorObj = new Error("Mixin theme is not a valid theme!");
          {
            var stackTrace = qx.dev.StackTrace.getStackTraceFromError(errorObj);
            qx.Bootstrap.error(this, stackTrace);
          }
          throw errorObj;
        }
      }
    }
  });
  qx.Theme.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.IWindowManager": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * All parent widgets of windows must implement this interface.
   */
  qx.Interface.define("qx.ui.window.IDesktop", {
    members: {
      /**
       * Sets the desktop's window manager
       *
       * @param manager {qx.ui.window.IWindowManager} The window manager
       */
      setWindowManager: function setWindowManager(manager) {
        this.assertInterface(manager, qx.ui.window.IWindowManager);
      },

      /**
       * Get a list of all windows added to the desktop (including hidden windows)
       *
       * @return {qx.ui.window.Window[]} Array of managed windows
       */
      getWindows: function getWindows() {},

      /**
       * Whether the configured layout supports a maximized window
       * e.g. is a Canvas.
       *
       * @return {Boolean} Whether the layout supports maximized windows
       */
      supportsMaximize: function supportsMaximize() {},

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this.assertInteger(zIndex);
      },

      /**
       * Remove the blocker.
       */
      unblock: function unblock() {},

      /**
       * Whether the widget is currently blocked
       *
       * @return {Boolean} whether the widget is blocked.
       */
      isBlocked: function isBlocked() {}
    }
  });
  qx.ui.window.IDesktop.$$dbClassInfo = $$dbClassInfo;
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
  
  ************************************************************************ */

  /**
   * This mixin exposes all basic methods to manage widget children as public methods.
   * It can only be included into instances of {@link Widget}.
   *
   * To optimize the method calls the including widget should call the method
   * {@link #remap} in its defer function. This will map the protected
   * methods to the public ones and save one method call for each function.
   */
  qx.Mixin.define("qx.ui.core.MChildrenHandling", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns the children list
       *
       * @return {qx.ui.core.LayoutItem[]} The children array (Arrays are
       *   reference types, please do not modify them in-place)
       */
      getChildren: function getChildren() {
        return this._getChildren();
      },

      /**
       * Whether the widget contains children.
       *
       * @return {Boolean} Returns <code>true</code> when the widget has children.
       */
      hasChildren: function hasChildren() {
        return this._hasChildren();
      },

      /**
       * Returns the index position of the given widget if it is
       * a child widget. Otherwise it returns <code>-1</code>.
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.Widget} the widget to query for
       * @return {Integer} The index position or <code>-1</code> when
       *   the given widget is no child of this layout.
       */
      indexOf: function indexOf(child) {
        return this._indexOf(child);
      },

      /**
       * Adds a new child widget.
       *
       * The supported keys of the layout options map depend on the layout manager
       * used to position the widget. The options are documented in the class
       * documentation of each layout manager {@link qx.ui.layout}.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to add.
       * @param options {Map?null} Optional layout data for widget.
       */
      add: function add(child, options) {
        this._add(child, options);
      },

      /**
       * Add a child widget at the specified index
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} Widget to add
       * @param index {Integer} Index, at which the widget will be inserted
       * @param options {Map?null} Optional layout data for widget.
       */
      addAt: function addAt(child, index, options) {
        this._addAt(child, index, options);
      },

      /**
       * Add a widget before another already inserted widget
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} Widget to add
       * @param before {qx.ui.core.LayoutItem} Widget before the new widget will be inserted.
       * @param options {Map?null} Optional layout data for widget.
       */
      addBefore: function addBefore(child, before, options) {
        this._addBefore(child, before, options);
      },

      /**
       * Add a widget after another already inserted widget
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} Widget to add
       * @param after {qx.ui.core.LayoutItem} Widget, after which the new widget will be inserted
       * @param options {Map?null} Optional layout data for widget.
       */
      addAfter: function addAfter(child, after, options) {
        this._addAfter(child, after, options);
      },

      /**
       * Remove the given child widget.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to remove
       */
      remove: function remove(child) {
        this._remove(child);
      },

      /**
       * Remove the widget at the specified index.
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param index {Integer} Index of the widget to remove.
       * @return {qx.ui.core.LayoutItem} The child removed.
       */
      removeAt: function removeAt(index) {
        return this._removeAt(index);
      },

      /**
       * Remove all children.
       *
       * @return {Array} An array of the removed children.
       */
      removeAll: function removeAll() {
        return this._removeAll();
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Mapping of protected methods to public.
       * This omits an additional function call when using these methods. Call
       * this methods in the defer block of the including class.
       *
       * @param members {Map} The including classes members map
       */
      remap: function remap(members) {
        members.getChildren = members._getChildren;
        members.hasChildren = members._hasChildren;
        members.indexOf = members._indexOf;
        members.add = members._add;
        members.addAt = members._addAt;
        members.addBefore = members._addBefore;
        members.addAfter = members._addAfter;
        members.remove = members._remove;
        members.removeAt = members._removeAt;
        members.removeAll = members._removeAll;
      }
    }
  });
  qx.ui.core.MChildrenHandling.$$dbClassInfo = $$dbClassInfo;
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
  
  ************************************************************************ */

  /**
   * This mixin exposes all methods to manage the layout manager of a widget.
   * It can only be included into instances of {@link qx.ui.core.Widget}.
   *
   * To optimize the method calls the including widget should call the method
   * {@link #remap} in its defer function. This will map the protected
   * methods to the public ones and save one method call for each function.
   */
  qx.Mixin.define("qx.ui.core.MLayoutHandling", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set a layout manager for the widget. A a layout manager can only be connected
       * with one widget. Reset the connection with a previous widget first, if you
       * like to use it in another widget instead.
       *
       * @param layout {qx.ui.layout.Abstract} The new layout or
       *     <code>null</code> to reset the layout.
       */
      setLayout: function setLayout(layout) {
        this._setLayout(layout);
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      getLayout: function getLayout() {
        return this._getLayout();
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Mapping of protected methods to public.
       * This omits an additional function call when using these methods. Call
       * this methods in the defer block of the including class.
       *
       * @param members {Map} The including classes members map
       */
      remap: function remap(members) {
        members.getLayout = members._getLayout;
        members.setLayout = members._setLayout;
      }
    }
  });
  qx.ui.core.MLayoutHandling.$$dbClassInfo = $$dbClassInfo;
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
        "defer": "runtime",
        "require": true
      },
      "qx.ui.core.MLayoutHandling": {
        "defer": "runtime",
        "require": true
      },
      "qx.event.type.Data": {}
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
   * The Composite is a generic container widget.
   *
   * It exposes all methods to set layouts and to manage child widgets
   * as public methods. You must configure this widget with a layout manager to
   * define the way the widget's children are positioned.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create the composite
   *   var composite = new qx.ui.container.Composite()
   *
   *   // configure it with a horizontal box layout with a spacing of '5'
   *   composite.setLayout(new qx.ui.layout.HBox(5));
   *
   *   // add some children
   *   composite.add(new qx.ui.basic.Label("Name: "));
   *   composite.add(new qx.ui.form.TextField());
   *
   *   this.getRoot().add(composite);
   * </pre>
   *
   * This example horizontally groups a label and text field by using a
   * Composite configured with a horizontal box layout as a container.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/composite.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.Composite", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MChildrenHandling, qx.ui.core.MLayoutHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param layout {qx.ui.layout.Abstract} A layout instance to use to
     *   place widgets on the screen.
     */
    construct: function construct(layout) {
      qx.ui.core.Widget.constructor.call(this);

      if (layout != null) {
        this._setLayout(layout);
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * This event is fired after a child widget was added to this widget. The
       * {@link qx.event.type.Data#getData} method of the event returns the
       * added child.
       */
      addChildWidget: "qx.event.type.Data",

      /**
       * This event is fired after a child widget has been removed from this widget.
       * The {@link qx.event.type.Data#getData} method of the event returns the
       * removed child.
       */
      removeChildWidget: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _afterAddChild: function _afterAddChild(child) {
        this.fireNonBubblingEvent("addChildWidget", qx.event.type.Data, [child]);
      },
      // overridden
      _afterRemoveChild: function _afterRemoveChild(child) {
        this.fireNonBubblingEvent("removeChildWidget", qx.event.type.Data, [child]);
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics, members) {
      qx.ui.core.MChildrenHandling.remap(members);
      qx.ui.core.MLayoutHandling.remap(members);
    }
  });
  qx.ui.container.Composite.$$dbClassInfo = $$dbClassInfo;
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
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Util": {},
      "qx.theme.manager.Decoration": {}
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
   * A horizontal box layout.
   *
   * The horizontal box layout lays out widgets in a horizontal row, from left
   * to right.
   *
   * *Features*
   *
   * * Minimum and maximum dimensions
   * * Prioritized growing/shrinking (flex)
   * * Margins (with horizontal collapsing)
   * * Auto sizing (ignoring percent values)
   * * Percent widths (not relevant for size hint)
   * * Alignment (child property {@link qx.ui.core.LayoutItem#alignX} is ignored)
   * * Horizontal spacing (collapsed with margins)
   * * Reversed children layout (from last to first)
   * * Vertical children stretching (respecting size hints)
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>flex</strong> <em>(Integer)</em>: The flexibility of a layout item determines how the container
   *   distributes remaining empty space among its children. If items are made
   *   flexible, they can grow or shrink accordingly. Their relative flex values
   *   determine how the items are being resized, i.e. the larger the flex ratio
   *   of two items, the larger the resizing of the first item compared to the
   *   second.
   *
   *   If there is only one flex item in a layout container, its actual flex
   *   value is not relevant. To disallow items to become flexible, set the
   *   flex value to zero.
   * </li>
   * <li><strong>width</strong> <em>(String)</em>: Allows to define a percent
   *   width for the item. The width in percent, if specified, is used instead
   *   of the width defined by the size hint. The minimum and maximum width still
   *   takes care of the element's limits. It has no influence on the layout's
   *   size hint. Percent values are mostly useful for widgets which are sized by
   *   the outer hierarchy.
   * </li>
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the HBox layout.
   *
   * <pre class="javascript">
   * var layout = new qx.ui.layout.HBox();
   * layout.setSpacing(4); // apply spacing
   *
   * var container = new qx.ui.container.Composite(layout);
   *
   * container.add(new qx.ui.core.Widget());
   * container.add(new qx.ui.core.Widget());
   * container.add(new qx.ui.core.Widget());
   * </pre>
   *
   * *External Documentation*
   *
   * See <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/box.html'>extended documentation</a>
   * and links to demos for this layout.
   *
   */
  qx.Class.define("qx.ui.layout.HBox", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param spacing {Integer?0} The spacing between child widgets {@link #spacing}.
     * @param alignX {String?"left"} Horizontal alignment of the whole children
     *     block {@link #alignX}.
     * @param separator {String|qx.ui.decoration.IDecorator?} A separator to render between the items
     */
    construct: function construct(spacing, alignX, separator) {
      qx.ui.layout.Abstract.constructor.call(this);

      if (spacing) {
        this.setSpacing(spacing);
      }

      if (alignX) {
        this.setAlignX(alignX);
      }

      if (separator) {
        this.setSeparator(separator);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Horizontal alignment of the whole children block. The horizontal
       * alignment of the child is completely ignored in HBoxes (
       * {@link qx.ui.core.LayoutItem#alignX}).
       */
      alignX: {
        check: ["left", "center", "right"],
        init: "left",
        apply: "_applyLayoutChange"
      },

      /**
       * Vertical alignment of each child. Can be overridden through
       * {@link qx.ui.core.LayoutItem#alignY}.
       */
      alignY: {
        check: ["top", "middle", "bottom"],
        init: "top",
        apply: "_applyLayoutChange"
      },

      /** Horizontal spacing between two children */
      spacing: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /** Separator lines to use between the objects */
      separator: {
        check: "Decorator",
        nullable: true,
        apply: "_applyLayoutChange"
      },

      /** Whether the actual children list should be laid out in reversed order. */
      reversed: {
        check: "Boolean",
        init: false,
        apply: "_applyReversed"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __widths: null,
      __flexs: null,
      __enableFlex: null,
      __children: null,

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyReversed: function _applyReversed() {
        // easiest way is to invalidate the cache
        this._invalidChildrenCache = true; // call normal layout change

        this._applyLayoutChange();
      },

      /**
       * Rebuilds caches for flex and percent layout properties
       */
      __rebuildCache: function __rebuildCache() {
        var children = this._getLayoutChildren();

        var length = children.length;
        var enableFlex = false;
        var reuse = this.__widths && this.__widths.length != length && this.__flexs && this.__widths;
        var props; // Sparse array (keep old one if lengths has not been modified)

        var widths = reuse ? this.__widths : new Array(length);
        var flexs = reuse ? this.__flexs : new Array(length); // Reverse support

        if (this.getReversed()) {
          children = children.concat().reverse();
        } // Loop through children to preparse values


        for (var i = 0; i < length; i++) {
          props = children[i].getLayoutProperties();

          if (props.width != null) {
            widths[i] = parseFloat(props.width) / 100;
          }

          if (props.flex != null) {
            flexs[i] = props.flex;
            enableFlex = true;
          } else {
            // reset (in case the index of the children changed: BUG #3131)
            flexs[i] = 0;
          }
        } // Store data


        if (!reuse) {
          this.__widths = widths;
          this.__flexs = flexs;
        }

        this.__enableFlex = enableFlex;
        this.__children = children; // Clear invalidation marker

        delete this._invalidChildrenCache;
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        this.assert(name === "flex" || name === "width", "The property '" + name + "' is not supported by the HBox layout!");

        if (name == "width") {
          this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
        } else {
          // flex
          this.assertNumber(value);
          this.assert(value >= 0);
        }
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        // Rebuild flex/width caches
        if (this._invalidChildrenCache) {
          this.__rebuildCache();
        } // Cache children


        var children = this.__children;
        var length = children.length;
        var util = qx.ui.layout.Util; // Compute gaps

        var spacing = this.getSpacing();
        var separator = this.getSeparator();

        if (separator) {
          var gaps = util.computeHorizontalSeparatorGaps(children, spacing, separator);
        } else {
          var gaps = util.computeHorizontalGaps(children, spacing, true);
        } // First run to cache children data and compute allocated width


        var i, child, width, percent;
        var widths = [],
            hint;
        var allocatedWidth = gaps;

        for (i = 0; i < length; i += 1) {
          percent = this.__widths[i];
          hint = children[i].getSizeHint();
          width = percent != null ? Math.floor((availWidth - gaps) * percent) : hint.width; // Limit computed value

          if (width < hint.minWidth) {
            width = hint.minWidth;
          } else if (width > hint.maxWidth) {
            width = hint.maxWidth;
          }

          widths.push(width);
          allocatedWidth += width;
        } // Flex support (growing/shrinking)


        if (this.__enableFlex && allocatedWidth != availWidth) {
          var flexibles = {};
          var flex, offset;

          for (i = 0; i < length; i += 1) {
            flex = this.__flexs[i];

            if (flex > 0) {
              hint = children[i].getSizeHint();
              flexibles[i] = {
                min: hint.minWidth,
                value: widths[i],
                max: hint.maxWidth,
                flex: flex
              };
            }
          }

          var result = util.computeFlexOffsets(flexibles, availWidth, allocatedWidth);

          for (i in result) {
            offset = result[i].offset;
            widths[i] += offset;
            allocatedWidth += offset;
          }
        } // Start with left coordinate


        var left = children[0].getMarginLeft(); // Alignment support

        if (allocatedWidth < availWidth && this.getAlignX() != "left") {
          left = availWidth - allocatedWidth;

          if (this.getAlignX() === "center") {
            left = Math.round(left / 2);
          }
        } // Layouting children


        var hint, top, height, width, marginRight, marginTop, marginBottom;
        var spacing = this.getSpacing(); // Pre configure separators

        this._clearSeparators(); // Compute separator width


        if (separator) {
          var separatorInsets = qx.theme.manager.Decoration.getInstance().resolve(separator).getInsets();
          var separatorWidth = separatorInsets.left + separatorInsets.right;
        } // Render children and separators


        for (i = 0; i < length; i += 1) {
          child = children[i];
          width = widths[i];
          hint = child.getSizeHint();
          marginTop = child.getMarginTop();
          marginBottom = child.getMarginBottom(); // Find usable height

          height = Math.max(hint.minHeight, Math.min(availHeight - marginTop - marginBottom, hint.maxHeight)); // Respect vertical alignment

          top = util.computeVerticalAlignOffset(child.getAlignY() || this.getAlignY(), height, availHeight, marginTop, marginBottom); // Add collapsed margin

          if (i > 0) {
            // Whether a separator has been configured
            if (separator) {
              // add margin of last child and spacing
              left += marginRight + spacing; // then render the separator at this position

              this._renderSeparator(separator, {
                left: left + padding.left,
                top: padding.top,
                width: separatorWidth,
                height: availHeight
              }); // and finally add the size of the separator, the spacing (again) and the left margin


              left += separatorWidth + spacing + child.getMarginLeft();
            } else {
              // Support margin collapsing when no separator is defined
              left += util.collapseMargins(spacing, marginRight, child.getMarginLeft());
            }
          } // Layout child


          child.renderLayout(left + padding.left, top + padding.top, width, height); // Add width

          left += width; // Remember right margin (for collapsing)

          marginRight = child.getMarginRight();
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        // Rebuild flex/width caches
        if (this._invalidChildrenCache) {
          this.__rebuildCache();
        }

        var util = qx.ui.layout.Util;
        var children = this.__children; // Initialize

        var minWidth = 0,
            width = 0,
            percentMinWidth = 0;
        var minHeight = 0,
            height = 0;
        var child, hint, margin; // Iterate over children

        for (var i = 0, l = children.length; i < l; i += 1) {
          child = children[i];
          hint = child.getSizeHint(); // Sum up widths

          width += hint.width; // Detect if child is shrinkable or has percent width and update minWidth

          var flex = this.__flexs[i];
          var percent = this.__widths[i];

          if (flex) {
            minWidth += hint.minWidth;
          } else if (percent) {
            percentMinWidth = Math.max(percentMinWidth, Math.round(hint.minWidth / percent));
          } else {
            minWidth += hint.width;
          } // Build vertical margin sum


          margin = child.getMarginTop() + child.getMarginBottom(); // Find biggest height

          if (hint.height + margin > height) {
            height = hint.height + margin;
          } // Find biggest minHeight


          if (hint.minHeight + margin > minHeight) {
            minHeight = hint.minHeight + margin;
          }
        }

        minWidth += percentMinWidth; // Respect gaps

        var spacing = this.getSpacing();
        var separator = this.getSeparator();

        if (separator) {
          var gaps = util.computeHorizontalSeparatorGaps(children, spacing, separator);
        } else {
          var gaps = util.computeHorizontalGaps(children, spacing, true);
        } // Return hint


        return {
          minWidth: minWidth + gaps,
          width: width + gaps,
          minHeight: minHeight,
          height: height
        };
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__widths = this.__flexs = this.__children = null;
    }
  });
  qx.ui.layout.HBox.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
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
       2017 Martijn Evers, The Netherlands
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martijn Evers (mever)
  
  ************************************************************************ */

  /**
   * Field interface.
   *
   * This interface allows any value to be set as long as the following constraint
   * is met: any value returned by {@link getValue} can be set by {@link setValue}.
   *
   * This specifies the interface for handling the model value of a field.
   * The model value is always in a consistent state (see duration example), and
   * should only handle model values of a type that correctly represents the
   * data available through its UI. E.g.: duration can ideally be modeled by a number
   * of time units, like seconds. When using a date the duration may be
   * unclear (since Unix time?). Type conversions should be handled by data binding.
   *
   * The model value is not necessary what is shown to the end-user
   * by implementing class. A good example is the {@link qx.ui.form.TextField}
   * which is able to operate with or without live updating the model value.
   *
   * Duration example: a field for duration may use two date pickers for begin
   * and end dates. When the end date is before the start date the model is in
   * inconsistent state. getValue should never return such state. And calling
   * it must result in either null or the last consistent value (depending
   * on implementation or setting).
   */
  qx.Interface.define("qx.ui.form.IField", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the model value was modified */
      "changeValue": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        VALUE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the field model value. Should also update the UI.
       *
       * @param value {var|null} Updates the field with the new model value.
       * @return {null|Error} Should return an error when the type of
       *  model value is not compatible with the implementing class (the concrete field).
       */
      setValue: function setValue(value) {
        return arguments.length == 1;
      },

      /**
       * Resets the model value to its initial value. Should also update the UI.
       */
      resetValue: function resetValue() {},

      /**
       * Returns a consistent and up-to-date model value.
       *
       * Note: returned value can also be a promise of type <code>Promise&lt;*|null&gt;</code>.
       *
       * @return {var|null} The model value plain or as promise.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.IField.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.IField": {
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Form interface for all form widgets which have strings as their primary
   * data type like textfield's.
   */
  qx.Interface.define("qx.ui.form.IStringForm", {
    extend: qx.ui.form.IField,

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the value was modified */
      "changeValue": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        VALUE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the element's value.
       *
       * @param value {String|null} The new value of the element.
       */
      setValue: function setValue(value) {
        return arguments.length == 1;
      },

      /**
       * Resets the element's value to its initial value.
       */
      resetValue: function resetValue() {},

      /**
       * The element's user set value.
       *
       * @return {String|null} The value.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.IStringForm.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.IStringForm": {
        "require": true
      },
      "qx.locale.Manager": {
        "construct": true
      },
      "qx.bom.client.Css": {},
      "qx.bom.client.Html": {},
      "qx.html.Label": {},
      "qx.theme.manager.Color": {},
      "qx.theme.manager.Font": {},
      "qx.bom.webfonts.WebFont": {},
      "qx.bom.Font": {},
      "qx.ui.core.queue.Layout": {},
      "qx.bom.Label": {},
      "qx.bom.client.OperatingSystem": {},
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.textoverflow": {
          "className": "qx.bom.client.Css"
        },
        "html.xul": {
          "className": "qx.bom.client.Html"
        },
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "browser.name": {
          "className": "qx.bom.client.Browser"
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
       * Fabian Jakobs (fjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The label class brings typical text content to the widget system.
   *
   * It supports simple text nodes and complex HTML (rich). The default
   * content mode is for text only. The mode is changeable through the property
   * {@link #rich}.
   *
   * The label supports heightForWidth when used in HTML mode. This means
   * that multi line HTML automatically computes the correct preferred height.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // a simple text label without wrapping and markup support
   *   var label1 = new qx.ui.basic.Label("Simple text label");
   *   this.getRoot().add(label1, {left:20, top:10});
   *
   *   // a HTML label with automatic line wrapping
   *   var label2 = new qx.ui.basic.Label().set({
   *     value: "A <b>long label</b> text with auto-wrapping. This also may contain <b style='color:red'>rich HTML</b> markup.",
   *     rich : true,
   *     width: 120
   *   });
   *   this.getRoot().add(label2, {left:20, top:50});
   * </pre>
   *
   * The first label in this example is a basic text only label. As such no
   * automatic wrapping is supported. The second label is a long label containing
   * HTML markup with automatic line wrapping.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/label.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.ui.basic.Label", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.IStringForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param value {String} Text or HTML content to use
     */
    construct: function construct(value) {
      qx.ui.core.Widget.constructor.call(this);

      if (value != null) {
        this.setValue(value);
      }

      {
        qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Switches between rich HTML and text content. The text mode (<code>false</code>) supports
       * advanced features like ellipsis when the available space is not
       * enough. HTML mode (<code>true</code>) supports multi-line content and all the
       * markup features of HTML content.
       */
      rich: {
        check: "Boolean",
        init: false,
        event: "changeRich",
        apply: "_applyRich"
      },

      /**
       * Controls whether text wrap is activated or not. But please note, that
       * this property works only in combination with the property {@link #rich}.
       * The {@link #wrap} has only an effect if the {@link #rich} property is
       * set to <code>true</code>, otherwise {@link #wrap} has no effect.
       */
      wrap: {
        check: "Boolean",
        init: true,
        apply: "_applyWrap"
      },

      /**
       * Contains the HTML or text content. Interpretation depends on the value
       * of {@link #rich}. In text mode entities and other HTML special content
       * is not supported. But it is possible to use unicode escape sequences
       * to insert symbols and other non ASCII characters.
       */
      value: {
        check: "String",
        apply: "_applyValue",
        event: "changeValue",
        nullable: true
      },

      /**
       * The buddy property can be used to connect the label to another widget.
       * That causes two things:
       * <ul>
       *   <li>The label will always take the same enabled state as the buddy
       *       widget.
       *   </li>
       *   <li>A tap on the label will focus the buddy widget.</li>
       * </ul>
       * This is the behavior of the for attribute of HTML:
       * http://www.w3.org/TR/html401/interact/forms.html#adef-for
       */
      buddy: {
        check: "qx.ui.core.Widget",
        apply: "_applyBuddy",
        nullable: true,
        init: null,
        dereference: true
      },

      /** Control the text alignment */
      textAlign: {
        check: ["left", "center", "right", "justify"],
        nullable: true,
        themeable: true,
        apply: "_applyTextAlign",
        event: "changeTextAlign"
      },
      // overridden
      appearance: {
        refine: true,
        init: "label"
      },
      // overridden
      selectable: {
        refine: true,
        init: false
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
      allowShrinkY: {
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
      __font: null,
      __invalidContentSize: null,
      __tapListenerId: null,
      __webfontListenerId: null,

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      _getContentHint: function _getContentHint() {
        if (this.__invalidContentSize) {
          this.__contentSize = this.__computeContentSize();
          delete this.__invalidContentSize;
        }

        return {
          width: this.__contentSize.width,
          height: this.__contentSize.height
        };
      },
      // overridden
      _hasHeightForWidth: function _hasHeightForWidth() {
        return this.getRich() && this.getWrap();
      },
      // overridden
      _applySelectable: function _applySelectable(value) {
        // This is needed for all browsers not having text-overflow:ellipsis
        // but supporting XUL (firefox < 4)
        // https://bugzilla.mozilla.org/show_bug.cgi?id=312156
        if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          if (value && !this.isRich()) {
            {
              this.warn("Only rich labels are selectable in browsers with Gecko engine!");
            }
            return;
          }
        }

        qx.ui.basic.Label.prototype._applySelectable.base.call(this, value);
      },
      // overridden
      _getContentHeightForWidth: function _getContentHeightForWidth(width) {
        if (!this.getRich() && !this.getWrap()) {
          return null;
        }

        return this.__computeContentSize(width).height;
      },
      // overridden
      _createContentElement: function _createContentElement() {
        return new qx.html.Label();
      },
      // property apply
      _applyTextAlign: function _applyTextAlign(value, old) {
        this.getContentElement().setStyle("textAlign", value);
      },
      // overridden
      _applyTextColor: function _applyTextColor(value, old) {
        if (value) {
          this.getContentElement().setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
        } else {
          this.getContentElement().removeStyle("color");
        }
      },

      /*
      ---------------------------------------------------------------------------
        LABEL ADDONS
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} Internal fallback of label size when no font is defined
       *
       * @lint ignoreReferenceField(__contentSize)
       */
      __contentSize: {
        width: 0,
        height: 0
      },
      // property apply
      _applyFont: function _applyFont(value, old) {
        if (old && this.__font && this.__webfontListenerId) {
          this.__font.removeListenerById(this.__webfontListenerId);

          this.__webfontListenerId = null;
        } // Apply


        var styles;

        if (value) {
          this.__font = qx.theme.manager.Font.getInstance().resolve(value);

          if (this.__font instanceof qx.bom.webfonts.WebFont) {
            this.__webfontListenerId = this.__font.addListener("changeStatus", this._onWebFontStatusChange, this);
          }

          styles = this.__font.getStyles();
        } else {
          this.__font = null;
          styles = qx.bom.Font.getDefaultStyles();
        } // check if text color already set - if so this local value has higher priority


        if (this.getTextColor() != null) {
          delete styles["color"];
        }

        this.getContentElement().setStyles(styles); // Invalidate text size

        this.__invalidContentSize = true; // Update layout

        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Internal utility to compute the content dimensions.
       *
       * @param width {Integer?null} Optional width constraint
       * @return {Map} Map with <code>width</code> and <code>height</code> keys
       */
      __computeContentSize: function __computeContentSize(width) {
        var Label = qx.bom.Label;
        var font = this.getFont();
        var styles = font ? this.__font.getStyles() : qx.bom.Font.getDefaultStyles();
        var content = this.getValue() || "A";
        var rich = this.getRich();

        if (this.__webfontListenerId) {
          this.__fixEllipsis();
        }

        return rich ? Label.getHtmlSize(content, styles, width) : Label.getTextSize(content, styles);
      },

      /**
      * Firefox > 9 on OS X will draw an ellipsis on top of the label content even
      * though there is enough space for the text. Re-applying the content forces
      * a recalculation and fixes the problem. See qx bug #6293
      */
      __fixEllipsis: function __fixEllipsis() {
        if (!this.getContentElement()) {
          return;
        }

        if (qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("engine.name") == "gecko" && parseInt(qx.core.Environment.get("engine.version"), 10) < 16 && parseInt(qx.core.Environment.get("engine.version"), 10) > 9) {
          var domEl = this.getContentElement().getDomElement();

          if (domEl) {
            domEl.innerHTML = domEl.innerHTML;
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLIER
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyBuddy: function _applyBuddy(value, old) {
        if (old != null) {
          this.removeRelatedBindings(old);
          this.removeListenerById(this.__tapListenerId);
          this.__tapListenerId = null;
        }

        if (value != null) {
          value.bind("enabled", this, "enabled");
          this.__tapListenerId = this.addListener("tap", function () {
            // only focus focusable elements [BUG #3555]
            if (value.isFocusable()) {
              value.focus.apply(value);
            } // furthermore toggle if possible [BUG #6881]


            if ("toggleValue" in value && typeof value.toggleValue === "function") {
              value.toggleValue();
            }
          }, this);
        }
      },
      // property apply
      _applyRich: function _applyRich(value) {
        // Sync with content element
        this.getContentElement().setRich(value); // Mark text size cache as invalid

        this.__invalidContentSize = true; // Update layout

        qx.ui.core.queue.Layout.add(this);
      },
      // property apply
      _applyWrap: function _applyWrap(value, old) {
        if (value && !this.isRich()) {
          {
            this.warn("Only rich labels support wrap.");
          }
        }

        if (this.isRich()) {
          // apply the white space style to the label to force it not
          // to wrap if wrap is set to false [BUG #3732]
          var whiteSpace = value ? "normal" : "nowrap";
          this.getContentElement().setStyle("whiteSpace", whiteSpace);
        }
      },

      /**
       * Locale change event handler
       *
       * @signature function(e)
       * @param e {Event} the change event
       */
      _onChangeLocale: function _onChangeLocale(e) {
        var content = this.getValue();

        if (content && content.translate) {
          this.setValue(content.translate());
        }
      },

      /**
       * Triggers layout recalculation after a web font was loaded
       *
       * @param ev {qx.event.type.Data} "changeStatus" event
       */
      _onWebFontStatusChange: function _onWebFontStatusChange(ev) {
        if (ev.getData().valid === true) {
          // safari has trouble resizing, adding it again fixed the issue [BUG #8786]
          if (qx.core.Environment.get("browser.name") == "safari" && parseFloat(qx.core.Environment.get("browser.version")) >= 8) {
            window.setTimeout(function () {
              this.__invalidContentSize = true;
              qx.ui.core.queue.Layout.add(this);
            }.bind(this), 0);
          }

          this.__invalidContentSize = true;
          qx.ui.core.queue.Layout.add(this);
        }
      },
      // property apply
      _applyValue: function _applyValue(value, old) {
        // Sync with content element
        if (value && value.translate) {
          this.getContentElement().setValue(value.translate());
        } else {
          this.getContentElement().setValue(value);
        } // Mark text size cache as invalid


        this.__invalidContentSize = true; // Update layout

        qx.ui.core.queue.Layout.add(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      }

      if (this.__font && this.__webfontListenerId) {
        this.__font.removeListenerById(this.__webfontListenerId);
      }

      this.__font = null;
    }
  });
  qx.ui.basic.Label.$$dbClassInfo = $$dbClassInfo;
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
        "construct": true,
        "require": true
      },
      "qx.lang.Object": {},
      "qx.ui.layout.Util": {}
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
   * The grid layout manager arranges the items in a two dimensional
   * grid. Widgets can be placed into the grid's cells and may span multiple rows
   * and columns.
   *
   * *Features*
   *
   * * Flex values for rows and columns
   * * Minimal and maximal column and row sizes
   * * Manually setting of column and row sizes
   * * Horizontal and vertical alignment
   * * Horizontal and vertical spacing
   * * Column and row spans
   * * Auto-sizing
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>row</strong> <em>(Integer)</em>: The row of the cell the
   *   widget should occupy. Each cell can only containing one widget. This layout
   *   property is mandatory.
   * </li>
   * <li><strong>column</strong> <em>(Integer)</em>: The column of the cell the
   *   widget should occupy. Each cell can only containing one widget. This layout
   *   property is mandatory.
   * </li>
   * <li><strong>rowSpan</strong> <em>(Integer)</em>: The number of rows, the
   *   widget should span, starting from the row specified in the <code>row</code>
   *   property. The cells in the spanned rows must be empty as well.
   * </li>
   * <li><strong>colSpan</strong> <em>(Integer)</em>: The number of columns, the
   *   widget should span, starting from the column specified in the <code>column</code>
   *   property. The cells in the spanned columns must be empty as well.
   * </li>
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the grid layout.
   *
   * <pre class="javascript">
   * var layout = new qx.ui.layout.Grid();
   * layout.setRowFlex(0, 1); // make row 0 flexible
   * layout.setColumnWidth(1, 200); // set with of column 1 to 200 pixel
   *
   * var container = new qx.ui.container.Composite(layout);
   * container.add(new qx.ui.core.Widget(), {row: 0, column: 0});
   * container.add(new qx.ui.core.Widget(), {row: 0, column: 1});
   * container.add(new qx.ui.core.Widget(), {row: 1, column: 0, rowSpan: 2});
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/grid.html'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Grid", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param spacingX {Integer?0} The horizontal spacing between grid cells.
     *     Sets {@link #spacingX}.
     * @param spacingY {Integer?0} The vertical spacing between grid cells.
     *     Sets {@link #spacingY}.
     */
    construct: function construct(spacingX, spacingY) {
      qx.ui.layout.Abstract.constructor.call(this);
      this.__rowData = [];
      this.__colData = [];

      if (spacingX) {
        this.setSpacingX(spacingX);
      }

      if (spacingY) {
        this.setSpacingY(spacingY);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The horizontal spacing between grid cells.
       */
      spacingX: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /**
       * The vertical spacing between grid cells.
       */
      spacingY: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {Array} 2D array of grid cell data */
      __grid: null,
      __rowData: null,
      __colData: null,
      __colSpans: null,
      __rowSpans: null,
      __maxRowIndex: null,
      __maxColIndex: null,

      /** @type {Array} cached row heights */
      __rowHeights: null,

      /** @type {Array} cached column widths */
      __colWidths: null,
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        var layoutProperties = {
          "row": 1,
          "column": 1,
          "rowSpan": 1,
          "colSpan": 1
        };
        this.assert(layoutProperties[name] == 1, "The property '" + name + "' is not supported by the Grid layout!");
        this.assertInteger(value);
        this.assert(value >= 0, "Value must be positive");
      },

      /**
       * Rebuild the internal representation of the grid
       */
      __buildGrid: function __buildGrid() {
        var grid = [];
        var colSpans = [];
        var rowSpans = [];
        var maxRowIndex = -1;
        var maxColIndex = -1;

        var children = this._getLayoutChildren();

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          var props = child.getLayoutProperties();
          var row = props.row;
          var column = props.column;
          props.colSpan = props.colSpan || 1;
          props.rowSpan = props.rowSpan || 1; // validate arguments

          if (row == null || column == null) {
            throw new Error("The layout properties 'row' and 'column' of the child widget '" + child + "' must be defined!");
          }

          if (grid[row] && grid[row][column]) {
            throw new Error("Cannot add widget '" + child + "'!. " + "There is already a widget '" + grid[row][column] + "' in this cell (" + row + ", " + column + ") for '" + this + "'");
          }

          for (var x = column; x < column + props.colSpan; x++) {
            for (var y = row; y < row + props.rowSpan; y++) {
              if (grid[y] == undefined) {
                grid[y] = [];
              }

              grid[y][x] = child;
              maxColIndex = Math.max(maxColIndex, x);
              maxRowIndex = Math.max(maxRowIndex, y);
            }
          }

          if (props.rowSpan > 1) {
            rowSpans.push(child);
          }

          if (props.colSpan > 1) {
            colSpans.push(child);
          }
        } // make sure all columns are defined so that accessing the grid using
        // this.__grid[column][row] will never raise an exception


        for (var y = 0; y <= maxRowIndex; y++) {
          if (grid[y] == undefined) {
            grid[y] = [];
          }
        }

        this.__grid = grid;
        this.__colSpans = colSpans;
        this.__rowSpans = rowSpans;
        this.__maxRowIndex = maxRowIndex;
        this.__maxColIndex = maxColIndex;
        this.__rowHeights = null;
        this.__colWidths = null; // Clear invalidation marker

        delete this._invalidChildrenCache;
      },

      /**
       * Stores data for a grid row
       *
       * @param row {Integer} The row index
       * @param key {String} The key under which the data should be stored
       * @param value {var} data to store
       */
      _setRowData: function _setRowData(row, key, value) {
        var rowData = this.__rowData[row];

        if (!rowData) {
          this.__rowData[row] = {};
          this.__rowData[row][key] = value;
        } else {
          rowData[key] = value;
        }
      },

      /**
       * Stores data for a grid column
       *
       * @param column {Integer} The column index
       * @param key {String} The key under which the data should be stored
       * @param value {var} data to store
       */
      _setColumnData: function _setColumnData(column, key, value) {
        var colData = this.__colData[column];

        if (!colData) {
          this.__colData[column] = {};
          this.__colData[column][key] = value;
        } else {
          colData[key] = value;
        }
      },

      /**
       * Shortcut to set both horizontal and vertical spacing between grid cells
       * to the same value.
       *
       * @param spacing {Integer} new horizontal and vertical spacing
       * @return {qx.ui.layout.Grid} This object (for chaining support).
       */
      setSpacing: function setSpacing(spacing) {
        this.setSpacingY(spacing);
        this.setSpacingX(spacing);
        return this;
      },

      /**
       * Set the default cell alignment for a column. This alignment can be
       * overridden on a per cell basis by setting the cell's content widget's
       * <code>alignX</code> and <code>alignY</code> properties.
       *
       * If on a grid cell both row and a column alignment is set, the horizontal
       * alignment is taken from the column and the vertical alignment is taken
       * from the row.
       *
       * @param column {Integer} Column index
       * @param hAlign {String} The horizontal alignment. Valid values are
       *    "left", "center" and "right".
       * @param vAlign {String} The vertical alignment. Valid values are
       *    "top", "middle", "bottom"
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnAlign: function setColumnAlign(column, hAlign, vAlign) {
        {
          this.assertInteger(column, "Invalid parameter 'column'");
          this.assertInArray(hAlign, ["left", "center", "right"]);
          this.assertInArray(vAlign, ["top", "middle", "bottom"]);
        }

        this._setColumnData(column, "hAlign", hAlign);

        this._setColumnData(column, "vAlign", vAlign);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get a map of the column's alignment.
       *
       * @param column {Integer} The column index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal column alignment.
       */
      getColumnAlign: function getColumnAlign(column) {
        var colData = this.__colData[column] || {};
        return {
          vAlign: colData.vAlign || "top",
          hAlign: colData.hAlign || "left"
        };
      },

      /**
       * Set the default cell alignment for a row. This alignment can be
       * overridden on a per cell basis by setting the cell's content widget's
       * <code>alignX</code> and <code>alignY</code> properties.
       *
       * If on a grid cell both row and a column alignment is set, the horizontal
       * alignment is taken from the column and the vertical alignment is taken
       * from the row.
       *
       * @param row {Integer} Row index
       * @param hAlign {String} The horizontal alignment. Valid values are
       *    "left", "center" and "right".
       * @param vAlign {String} The vertical alignment. Valid values are
       *    "top", "middle", "bottom"
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowAlign: function setRowAlign(row, hAlign, vAlign) {
        {
          this.assertInteger(row, "Invalid parameter 'row'");
          this.assertInArray(hAlign, ["left", "center", "right"]);
          this.assertInArray(vAlign, ["top", "middle", "bottom"]);
        }

        this._setRowData(row, "hAlign", hAlign);

        this._setRowData(row, "vAlign", vAlign);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get a map of the row's alignment.
       *
       * @param row {Integer} The Row index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal row alignment.
       */
      getRowAlign: function getRowAlign(row) {
        var rowData = this.__rowData[row] || {};
        return {
          vAlign: rowData.vAlign || "top",
          hAlign: rowData.hAlign || "left"
        };
      },

      /**
       * Get the widget located in the cell. If a the cell is empty or the widget
       * has a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>,
       * <code>null</code> is returned.
       *
       * @param row {Integer} The cell's row index
       * @param column {Integer} The cell's column index
       * @return {qx.ui.core.Widget|null}The cell's widget. The value may be null.
       */
      getCellWidget: function getCellWidget(row, column) {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        }

        var row = this.__grid[row] || {};
        return row[column] || null;
      },

      /**
       * Get the number of rows in the grid layout.
       *
       * @return {Integer} The number of rows in the layout
       */
      getRowCount: function getRowCount() {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        }

        return this.__maxRowIndex + 1;
      },

      /**
       * Get the number of columns in the grid layout.
       *
       * @return {Integer} The number of columns in the layout
       */
      getColumnCount: function getColumnCount() {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        }

        return this.__maxColIndex + 1;
      },

      /**
       * Get a map of the cell's alignment. For vertical alignment the row alignment
       * takes precedence over the column alignment. For horizontal alignment it is
       * the over way round. If an alignment is set on the cell widget using
       * {@link qx.ui.core.LayoutItem#setLayoutProperties}, this alignment takes
       * always precedence over row or column alignment.
       *
       * @param row {Integer} The cell's row index
       * @param column {Integer} The cell's column index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal cell alignment.
       */
      getCellAlign: function getCellAlign(row, column) {
        var vAlign = "top";
        var hAlign = "left";
        var rowData = this.__rowData[row];
        var colData = this.__colData[column];
        var widget = this.__grid[row][column];

        if (widget) {
          var widgetProps = {
            vAlign: widget.getAlignY(),
            hAlign: widget.getAlignX()
          };
        } else {
          widgetProps = {};
        } // compute vAlign
        // precedence : widget -> row -> column


        if (widgetProps.vAlign) {
          vAlign = widgetProps.vAlign;
        } else if (rowData && rowData.vAlign) {
          vAlign = rowData.vAlign;
        } else if (colData && colData.vAlign) {
          vAlign = colData.vAlign;
        } // compute hAlign
        // precedence : widget -> column -> row


        if (widgetProps.hAlign) {
          hAlign = widgetProps.hAlign;
        } else if (colData && colData.hAlign) {
          hAlign = colData.hAlign;
        } else if (rowData && rowData.hAlign) {
          hAlign = rowData.hAlign;
        }

        return {
          vAlign: vAlign,
          hAlign: hAlign
        };
      },

      /**
       * Set the flex value for a grid column.
       * By default the column flex value is <code>0</code>.
       *
       * @param column {Integer} The column index
       * @param flex {Integer} The column's flex value
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnFlex: function setColumnFlex(column, flex) {
        this._setColumnData(column, "flex", flex);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the flex value of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's flex value
       */
      getColumnFlex: function getColumnFlex(column) {
        var colData = this.__colData[column] || {};
        return colData.flex !== undefined ? colData.flex : 0;
      },

      /**
       * Set the flex value for a grid row.
       * By default the row flex value is <code>0</code>.
       *
       * @param row {Integer} The row index
       * @param flex {Integer} The row's flex value
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowFlex: function setRowFlex(row, flex) {
        this._setRowData(row, "flex", flex);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the flex value of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's flex value
       */
      getRowFlex: function getRowFlex(row) {
        var rowData = this.__rowData[row] || {};
        var rowFlex = rowData.flex !== undefined ? rowData.flex : 0;
        return rowFlex;
      },

      /**
       * Set the maximum width of a grid column.
       * The default value is <code>Infinity</code>.
       *
       * @param column {Integer} The column index
       * @param maxWidth {Integer} The column's maximum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnMaxWidth: function setColumnMaxWidth(column, maxWidth) {
        this._setColumnData(column, "maxWidth", maxWidth);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the maximum width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's maximum width
       */
      getColumnMaxWidth: function getColumnMaxWidth(column) {
        var colData = this.__colData[column] || {};
        return colData.maxWidth !== undefined ? colData.maxWidth : Infinity;
      },

      /**
       * Set the preferred width of a grid column.
       * The default value is <code>Infinity</code>.
       *
       * @param column {Integer} The column index
       * @param width {Integer} The column's width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnWidth: function setColumnWidth(column, width) {
        this._setColumnData(column, "width", width);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the preferred width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's width
       */
      getColumnWidth: function getColumnWidth(column) {
        var colData = this.__colData[column] || {};
        return colData.width !== undefined ? colData.width : null;
      },

      /**
       * Set the minimum width of a grid column.
       * The default value is <code>0</code>.
       *
       * @param column {Integer} The column index
       * @param minWidth {Integer} The column's minimum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnMinWidth: function setColumnMinWidth(column, minWidth) {
        this._setColumnData(column, "minWidth", minWidth);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the minimum width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's minimum width
       */
      getColumnMinWidth: function getColumnMinWidth(column) {
        var colData = this.__colData[column] || {};
        return colData.minWidth || 0;
      },

      /**
       * Set the maximum height of a grid row.
       * The default value is <code>Infinity</code>.
       *
       * @param row {Integer} The row index
       * @param maxHeight {Integer} The row's maximum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowMaxHeight: function setRowMaxHeight(row, maxHeight) {
        this._setRowData(row, "maxHeight", maxHeight);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the maximum height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's maximum width
       */
      getRowMaxHeight: function getRowMaxHeight(row) {
        var rowData = this.__rowData[row] || {};
        return rowData.maxHeight || Infinity;
      },

      /**
       * Set the preferred height of a grid row.
       * The default value is <code>Infinity</code>.
       *
       * @param row {Integer} The row index
       * @param height {Integer} The row's width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowHeight: function setRowHeight(row, height) {
        this._setRowData(row, "height", height);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the preferred height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's width
       */
      getRowHeight: function getRowHeight(row) {
        var rowData = this.__rowData[row] || {};
        return rowData.height !== undefined ? rowData.height : null;
      },

      /**
       * Set the minimum height of a grid row.
       * The default value is <code>0</code>.
       *
       * @param row {Integer} The row index
       * @param minHeight {Integer} The row's minimum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowMinHeight: function setRowMinHeight(row, minHeight) {
        this._setRowData(row, "minHeight", minHeight);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the minimum height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's minimum width
       */
      getRowMinHeight: function getRowMinHeight(row) {
        var rowData = this.__rowData[row] || {};
        return rowData.minHeight || 0;
      },

      /**
       * Computes the widget's size hint including the widget's margins
       *
       * @param widget {qx.ui.core.LayoutItem} The widget to get the size for
       * @return {Map} a size hint map
       */
      __getOuterSize: function __getOuterSize(widget) {
        var hint = widget.getSizeHint();
        var hMargins = widget.getMarginLeft() + widget.getMarginRight();
        var vMargins = widget.getMarginTop() + widget.getMarginBottom();
        var outerSize = {
          height: hint.height + vMargins,
          width: hint.width + hMargins,
          minHeight: hint.minHeight + vMargins,
          minWidth: hint.minWidth + hMargins,
          maxHeight: hint.maxHeight + vMargins,
          maxWidth: hint.maxWidth + hMargins
        };
        return outerSize;
      },

      /**
       * Check whether all row spans fit with their preferred height into the
       * preferred row heights. If there is not enough space, the preferred
       * row sizes are increased. The distribution respects the flex and max
       * values of the rows.
       *
       *  The same is true for the min sizes.
       *
       *  The height array is modified in place.
       *
       * @param rowHeights {Map[]} The current row height array as computed by
       *     {@link #_getRowHeights}.
       */
      _fixHeightsRowSpan: function _fixHeightsRowSpan(rowHeights) {
        var vSpacing = this.getSpacingY();

        for (var i = 0, l = this.__rowSpans.length; i < l; i++) {
          var widget = this.__rowSpans[i];

          var hint = this.__getOuterSize(widget);

          var widgetProps = widget.getLayoutProperties();
          var widgetRow = widgetProps.row;
          var prefSpanHeight = vSpacing * (widgetProps.rowSpan - 1);
          var minSpanHeight = prefSpanHeight;
          var rowFlexes = {};

          for (var j = 0; j < widgetProps.rowSpan; j++) {
            var row = widgetProps.row + j;
            var rowHeight = rowHeights[row];
            var rowFlex = this.getRowFlex(row);

            if (rowFlex > 0) {
              // compute flex array for the preferred height
              rowFlexes[row] = {
                min: rowHeight.minHeight,
                value: rowHeight.height,
                max: rowHeight.maxHeight,
                flex: rowFlex
              };
            }

            prefSpanHeight += rowHeight.height;
            minSpanHeight += rowHeight.minHeight;
          } // If there is not enough space for the preferred size
          // increment the preferred row sizes.


          if (prefSpanHeight < hint.height) {
            if (!qx.lang.Object.isEmpty(rowFlexes)) {
              var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(rowFlexes, hint.height, prefSpanHeight);

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                var offset = rowIncrements[widgetRow + k] ? rowIncrements[widgetRow + k].offset : 0;
                rowHeights[widgetRow + k].height += offset;
              } // row is too small and we have no flex value set

            } else {
              var totalSpacing = vSpacing * (widgetProps.rowSpan - 1);
              var availableHeight = hint.height - totalSpacing; // get the row height which every child would need to share the
              // available hight equally

              var avgRowHeight = Math.floor(availableHeight / widgetProps.rowSpan); // get the hight already used and the number of children which do
              // not have at least that avg row height

              var usedHeight = 0;
              var rowsNeedAddition = 0;

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                var currentHeight = rowHeights[widgetRow + k].height;
                usedHeight += currentHeight;

                if (currentHeight < avgRowHeight) {
                  rowsNeedAddition++;
                }
              } // the difference of available and used needs to be shared among
              // those not having the min size


              var additionalRowHeight = Math.floor((availableHeight - usedHeight) / rowsNeedAddition); // add the extra height to the too small children

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                if (rowHeights[widgetRow + k].height < avgRowHeight) {
                  rowHeights[widgetRow + k].height += additionalRowHeight;
                }
              }
            }
          } // If there is not enough space for the min size
          // increment the min row sizes.


          if (minSpanHeight < hint.minHeight) {
            var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(rowFlexes, hint.minHeight, minSpanHeight);

            for (var j = 0; j < widgetProps.rowSpan; j++) {
              var offset = rowIncrements[widgetRow + j] ? rowIncrements[widgetRow + j].offset : 0;
              rowHeights[widgetRow + j].minHeight += offset;
            }
          }
        }
      },

      /**
       * Check whether all col spans fit with their preferred width into the
       * preferred column widths. If there is not enough space the preferred
       * column sizes are increased. The distribution respects the flex and max
       * values of the columns.
       *
       *  The same is true for the min sizes.
       *
       *  The width array is modified in place.
       *
       * @param colWidths {Map[]} The current column width array as computed by
       *     {@link #_getColWidths}.
       */
      _fixWidthsColSpan: function _fixWidthsColSpan(colWidths) {
        var hSpacing = this.getSpacingX();

        for (var i = 0, l = this.__colSpans.length; i < l; i++) {
          var widget = this.__colSpans[i];

          var hint = this.__getOuterSize(widget);

          var widgetProps = widget.getLayoutProperties();
          var widgetColumn = widgetProps.column;
          var prefSpanWidth = hSpacing * (widgetProps.colSpan - 1);
          var minSpanWidth = prefSpanWidth;
          var colFlexes = {};
          var offset;

          for (var j = 0; j < widgetProps.colSpan; j++) {
            var col = widgetProps.column + j;
            var colWidth = colWidths[col];
            var colFlex = this.getColumnFlex(col); // compute flex array for the preferred width

            if (colFlex > 0) {
              colFlexes[col] = {
                min: colWidth.minWidth,
                value: colWidth.width,
                max: colWidth.maxWidth,
                flex: colFlex
              };
            }

            prefSpanWidth += colWidth.width;
            minSpanWidth += colWidth.minWidth;
          } // If there is not enough space for the preferred size
          // increment the preferred column sizes.


          if (prefSpanWidth < hint.width) {
            var colIncrements = qx.ui.layout.Util.computeFlexOffsets(colFlexes, hint.width, prefSpanWidth);

            for (var j = 0; j < widgetProps.colSpan; j++) {
              offset = colIncrements[widgetColumn + j] ? colIncrements[widgetColumn + j].offset : 0;
              colWidths[widgetColumn + j].width += offset;
            }
          } // If there is not enough space for the min size
          // increment the min column sizes.


          if (minSpanWidth < hint.minWidth) {
            var colIncrements = qx.ui.layout.Util.computeFlexOffsets(colFlexes, hint.minWidth, minSpanWidth);

            for (var j = 0; j < widgetProps.colSpan; j++) {
              offset = colIncrements[widgetColumn + j] ? colIncrements[widgetColumn + j].offset : 0;
              colWidths[widgetColumn + j].minWidth += offset;
            }
          }
        }
      },

      /**
       * Compute the min/pref/max row heights.
       *
       * @return {Map[]} An array containing height information for each row. The
       *     entries have the keys <code>minHeight</code>, <code>maxHeight</code> and
       *     <code>height</code>.
       */
      _getRowHeights: function _getRowHeights() {
        if (this.__rowHeights != null) {
          return this.__rowHeights;
        }

        var rowHeights = [];
        var maxRowIndex = this.__maxRowIndex;
        var maxColIndex = this.__maxColIndex;

        for (var row = 0; row <= maxRowIndex; row++) {
          var minHeight = 0;
          var height = 0;
          var maxHeight = 0;

          for (var col = 0; col <= maxColIndex; col++) {
            var widget = this.__grid[row][col];

            if (!widget) {
              continue;
            } // ignore rows with row spans at this place
            // these rows will be taken into account later


            var widgetRowSpan = widget.getLayoutProperties().rowSpan || 0;

            if (widgetRowSpan > 1) {
              continue;
            }

            var cellSize = this.__getOuterSize(widget);

            if (this.getRowFlex(row) > 0) {
              minHeight = Math.max(minHeight, cellSize.minHeight);
            } else {
              minHeight = Math.max(minHeight, cellSize.height);
            }

            height = Math.max(height, cellSize.height);
          }

          var minHeight = Math.max(minHeight, this.getRowMinHeight(row));
          var maxHeight = this.getRowMaxHeight(row);

          if (this.getRowHeight(row) !== null) {
            var height = this.getRowHeight(row);
          } else {
            var height = Math.max(minHeight, Math.min(height, maxHeight));
          }

          rowHeights[row] = {
            minHeight: minHeight,
            height: height,
            maxHeight: maxHeight
          };
        }

        if (this.__rowSpans.length > 0) {
          this._fixHeightsRowSpan(rowHeights);
        }

        this.__rowHeights = rowHeights;
        return rowHeights;
      },

      /**
       * Compute the min/pref/max column widths.
       *
       * @return {Map[]} An array containing width information for each column. The
       *     entries have the keys <code>minWidth</code>, <code>maxWidth</code> and
       *     <code>width</code>.
       */
      _getColWidths: function _getColWidths() {
        if (this.__colWidths != null) {
          return this.__colWidths;
        }

        var colWidths = [];
        var maxColIndex = this.__maxColIndex;
        var maxRowIndex = this.__maxRowIndex;

        for (var col = 0; col <= maxColIndex; col++) {
          var width = 0;
          var minWidth = 0;
          var maxWidth = Infinity;

          for (var row = 0; row <= maxRowIndex; row++) {
            var widget = this.__grid[row][col];

            if (!widget) {
              continue;
            } // ignore columns with col spans at this place
            // these columns will be taken into account later


            var widgetColSpan = widget.getLayoutProperties().colSpan || 0;

            if (widgetColSpan > 1) {
              continue;
            }

            var cellSize = this.__getOuterSize(widget);

            minWidth = Math.max(minWidth, cellSize.minWidth);
            width = Math.max(width, cellSize.width);
          }

          minWidth = Math.max(minWidth, this.getColumnMinWidth(col));
          maxWidth = this.getColumnMaxWidth(col);

          if (this.getColumnWidth(col) !== null) {
            var width = this.getColumnWidth(col);
          } else {
            var width = Math.max(minWidth, Math.min(width, maxWidth));
          }

          colWidths[col] = {
            minWidth: minWidth,
            width: width,
            maxWidth: maxWidth
          };
        }

        if (this.__colSpans.length > 0) {
          this._fixWidthsColSpan(colWidths);
        }

        this.__colWidths = colWidths;
        return colWidths;
      },

      /**
       * Computes for each column by how many pixels it must grow or shrink, taking
       * the column flex values and min/max widths into account.
       *
       * @param width {Integer} The grid width
       * @return {Integer[]} Sparse array of offsets to add to each column width. If
       *     an array entry is empty nothing should be added to the column.
       */
      _getColumnFlexOffsets: function _getColumnFlexOffsets(width) {
        var hint = this.getSizeHint();
        var diff = width - hint.width;

        if (diff == 0) {
          return {};
        } // collect all flexible children


        var colWidths = this._getColWidths();

        var flexibles = {};

        for (var i = 0, l = colWidths.length; i < l; i++) {
          var col = colWidths[i];
          var colFlex = this.getColumnFlex(i);

          if (colFlex <= 0 || col.width == col.maxWidth && diff > 0 || col.width == col.minWidth && diff < 0) {
            continue;
          }

          flexibles[i] = {
            min: col.minWidth,
            value: col.width,
            max: col.maxWidth,
            flex: colFlex
          };
        }

        return qx.ui.layout.Util.computeFlexOffsets(flexibles, width, hint.width);
      },

      /**
       * Computes for each row by how many pixels it must grow or shrink, taking
       * the row flex values and min/max heights into account.
       *
       * @param height {Integer} The grid height
       * @return {Integer[]} Sparse array of offsets to add to each row height. If
       *     an array entry is empty nothing should be added to the row.
       */
      _getRowFlexOffsets: function _getRowFlexOffsets(height) {
        var hint = this.getSizeHint();
        var diff = height - hint.height;

        if (diff == 0) {
          return {};
        } // collect all flexible children


        var rowHeights = this._getRowHeights();

        var flexibles = {};

        for (var i = 0, l = rowHeights.length; i < l; i++) {
          var row = rowHeights[i];
          var rowFlex = this.getRowFlex(i);

          if (rowFlex <= 0 || row.height == row.maxHeight && diff > 0 || row.height == row.minHeight && diff < 0) {
            continue;
          }

          flexibles[i] = {
            min: row.minHeight,
            value: row.height,
            max: row.maxHeight,
            flex: rowFlex
          };
        }

        return qx.ui.layout.Util.computeFlexOffsets(flexibles, height, hint.height);
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        }

        var Util = qx.ui.layout.Util;
        var hSpacing = this.getSpacingX();
        var vSpacing = this.getSpacingY(); // calculate column widths

        var prefWidths = this._getColWidths();

        var colStretchOffsets = this._getColumnFlexOffsets(availWidth);

        var colWidths = [];
        var maxColIndex = this.__maxColIndex;
        var maxRowIndex = this.__maxRowIndex;
        var offset;

        for (var col = 0; col <= maxColIndex; col++) {
          offset = colStretchOffsets[col] ? colStretchOffsets[col].offset : 0;
          colWidths[col] = prefWidths[col].width + offset;
        } // calculate row heights


        var prefHeights = this._getRowHeights();

        var rowStretchOffsets = this._getRowFlexOffsets(availHeight);

        var rowHeights = [];

        for (var row = 0; row <= maxRowIndex; row++) {
          offset = rowStretchOffsets[row] ? rowStretchOffsets[row].offset : 0;
          rowHeights[row] = prefHeights[row].height + offset;
        } // do the layout


        var left = 0;

        for (var col = 0; col <= maxColIndex; col++) {
          var top = 0;

          for (var row = 0; row <= maxRowIndex; row++) {
            var widget = this.__grid[row][col]; // ignore empty cells

            if (!widget) {
              top += rowHeights[row] + vSpacing;
              continue;
            }

            var widgetProps = widget.getLayoutProperties(); // ignore cells, which have cell spanning but are not the origin
            // of the widget

            if (widgetProps.row !== row || widgetProps.column !== col) {
              top += rowHeights[row] + vSpacing;
              continue;
            } // compute sizes width including cell spanning


            var spanWidth = hSpacing * (widgetProps.colSpan - 1);

            for (var i = 0; i < widgetProps.colSpan; i++) {
              spanWidth += colWidths[col + i];
            }

            var spanHeight = vSpacing * (widgetProps.rowSpan - 1);

            for (var i = 0; i < widgetProps.rowSpan; i++) {
              spanHeight += rowHeights[row + i];
            }

            var cellHint = widget.getSizeHint();
            var marginTop = widget.getMarginTop();
            var marginLeft = widget.getMarginLeft();
            var marginBottom = widget.getMarginBottom();
            var marginRight = widget.getMarginRight();
            var cellWidth = Math.max(cellHint.minWidth, Math.min(spanWidth - marginLeft - marginRight, cellHint.maxWidth));
            var cellHeight = Math.max(cellHint.minHeight, Math.min(spanHeight - marginTop - marginBottom, cellHint.maxHeight));
            var cellAlign = this.getCellAlign(row, col);
            var cellLeft = left + Util.computeHorizontalAlignOffset(cellAlign.hAlign, cellWidth, spanWidth, marginLeft, marginRight);
            var cellTop = top + Util.computeVerticalAlignOffset(cellAlign.vAlign, cellHeight, spanHeight, marginTop, marginBottom);
            widget.renderLayout(cellLeft + padding.left, cellTop + padding.top, cellWidth, cellHeight);
            top += rowHeights[row] + vSpacing;
          }

          left += colWidths[col] + hSpacing;
        }
      },
      // overridden
      invalidateLayoutCache: function invalidateLayoutCache() {
        qx.ui.layout.Grid.prototype.invalidateLayoutCache.base.call(this);
        this.__colWidths = null;
        this.__rowHeights = null;
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        if (this._invalidChildrenCache) {
          this.__buildGrid();
        } // calculate col widths


        var colWidths = this._getColWidths();

        var minWidth = 0,
            width = 0;

        for (var i = 0, l = colWidths.length; i < l; i++) {
          var col = colWidths[i];

          if (this.getColumnFlex(i) > 0) {
            minWidth += col.minWidth;
          } else {
            minWidth += col.width;
          }

          width += col.width;
        } // calculate row heights


        var rowHeights = this._getRowHeights();

        var minHeight = 0,
            height = 0;

        for (var i = 0, l = rowHeights.length; i < l; i++) {
          var row = rowHeights[i];

          if (this.getRowFlex(i) > 0) {
            minHeight += row.minHeight;
          } else {
            minHeight += row.height;
          }

          height += row.height;
        }

        var spacingX = this.getSpacingX() * (colWidths.length - 1);
        var spacingY = this.getSpacingY() * (rowHeights.length - 1);
        var hint = {
          minWidth: minWidth + spacingX,
          width: width + spacingX,
          minHeight: minHeight + spacingY,
          height: height + spacingY
        };
        return hint;
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__grid = this.__rowData = this.__colData = this.__colSpans = this.__rowSpans = this.__colWidths = this.__rowHeights = null;
    }
  });
  qx.ui.layout.Grid.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.Atom": {
        "construct": true
      },
      "qx.ui.basic.Label": {},
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A multi-purpose widget, which combines a label with an icon.
   *
   * The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text
   * combination in different ways.
   *
   * This is useful for all types of buttons, tooltips, ...
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var atom = new qx.ui.basic.Atom("Icon Right", "icon/32/actions/go-next.png");
   *   this.getRoot().add(atom);
   * </pre>
   *
   * This example creates an atom with the label "Icon Right" and an icon.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/atom.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   *
   * @childControl label {qx.ui.basic.Label} label part of the atom
   * @childControl icon {qx.ui.basic.Image} icon part of the atom
   */
  qx.Class.define("qx.ui.basic.Atom", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     */
    construct: function construct(label, icon) {
      {
        this.assertArgumentsCount(arguments, 0, 2);
      }
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Atom());

      if (label != null) {
        this.setLabel(label);
      }

      if (icon !== undefined) {
        this.setIcon(icon);
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
        init: "atom"
      },

      /** The label/caption/text of the qx.ui.basic.Atom instance */
      label: {
        apply: "_applyLabel",
        nullable: true,
        check: "String",
        event: "changeLabel"
      },

      /**
       * Switches between rich HTML and text content. The text mode (<code>false</code>) supports
       * advanced features like ellipsis when the available space is not
       * enough. HTML mode (<code>true</code>) supports multi-line content and all the
       * markup features of HTML content.
       */
      rich: {
        check: "Boolean",
        init: false,
        apply: "_applyRich"
      },

      /** Any URI String supported by qx.ui.basic.Image to display an icon */
      icon: {
        check: "String",
        apply: "_applyIcon",
        nullable: true,
        themeable: true,
        event: "changeIcon"
      },

      /**
       * The space between the icon and the label
       */
      gap: {
        check: "Integer",
        nullable: false,
        event: "changeGap",
        apply: "_applyGap",
        themeable: true,
        init: 4
      },

      /**
       * Configure the visibility of the sub elements/widgets.
       * Possible values: both, label, icon
       */
      show: {
        init: "both",
        check: ["both", "label", "icon"],
        themeable: true,
        inheritable: true,
        apply: "_applyShow",
        event: "changeShow"
      },

      /**
       * The position of the icon in relation to the text.
       * Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
       */
      iconPosition: {
        init: "left",
        check: ["top", "right", "bottom", "left", "top-left", "bottom-left", "top-right", "bottom-right"],
        themeable: true,
        apply: "_applyIconPosition"
      },

      /**
       * Whether the content should be rendered centrally when to much space
       * is available. Enabling this property centers in both axis. The behavior
       * when disabled of the centering depends on the {@link #iconPosition} property.
       * If the icon position is <code>left</code> or <code>right</code>, the X axis
       * is not centered, only the Y axis. If the icon position is <code>top</code>
       * or <code>bottom</code>, the Y axis is not centered. In case of e.g. an
       * icon position of <code>top-left</code> no axis is centered.
       */
      center: {
        init: false,
        check: "Boolean",
        themeable: true,
        apply: "_applyCenter"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "label":
            control = new qx.ui.basic.Label(this.getLabel());
            control.setAnonymous(true);
            control.setRich(this.getRich());
            control.setSelectable(this.getSelectable());

            this._add(control);

            if (this.getLabel() == null || this.getShow() === "icon") {
              control.exclude();
            }

            break;

          case "icon":
            control = new qx.ui.basic.Image(this.getIcon());
            control.setAnonymous(true);

            this._addAt(control, 0);

            if (this.getIcon() == null || this.getShow() === "label") {
              control.exclude();
            }

            break;
        }

        return control || qx.ui.basic.Atom.prototype._createChildControlImpl.base.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        hovered: true
      },

      /**
       * Updates the visibility of the label
       */
      _handleLabel: function _handleLabel() {
        if (this.getLabel() == null || this.getShow() === "icon") {
          this._excludeChildControl("label");
        } else {
          this._showChildControl("label");
        }
      },

      /**
       * Updates the visibility of the icon
       */
      _handleIcon: function _handleIcon() {
        if (this.getIcon() == null || this.getShow() === "label") {
          this._excludeChildControl("icon");
        } else {
          this._showChildControl("icon");
        }
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        var label = this.getChildControl("label", true);

        if (label) {
          label.setValue(value);
        }

        this._handleLabel();
      },
      // property apply
      _applyRich: function _applyRich(value, old) {
        var label = this.getChildControl("label", true);

        if (label) {
          label.setRich(value);
        }
      },
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        var icon = this.getChildControl("icon", true);

        if (icon) {
          icon.setSource(value);
        }

        this._handleIcon();
      },
      // property apply
      _applyGap: function _applyGap(value, old) {
        this._getLayout().setGap(value);
      },
      // property apply
      _applyShow: function _applyShow(value, old) {
        this._handleLabel();

        this._handleIcon();
      },
      // property apply
      _applyIconPosition: function _applyIconPosition(value, old) {
        this._getLayout().setIconPosition(value);
      },
      // property apply
      _applyCenter: function _applyCenter(value, old) {
        this._getLayout().setCenter(value);
      },
      // overridden
      _applySelectable: function _applySelectable(value, old) {
        qx.ui.basic.Atom.prototype._applySelectable.base.call(this, value, old);

        var label = this.getChildControl("label", true);

        if (label) {
          this.getChildControl("label").setSelectable(value);
        }
      }
    }
  });
  qx.ui.basic.Atom.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {},
      "qx.util.PropertyUtil": {}
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
   * This mixin is included by all widgets, which support an 'execute' like
   * buttons or menu entries.
   */
  qx.Mixin.define("qx.ui.core.MExecutable", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired if the {@link #execute} method is invoked.*/
      "execute": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * A command called if the {@link #execute} method is called, e.g. on a
       * button tap.
       */
      command: {
        check: "qx.ui.command.Command",
        apply: "_applyCommand",
        event: "changeCommand",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __executableBindingIds: null,
      __semaphore: false,
      __executeListenerId: null,

      /**
       * @type {Map} Set of properties, which will by synced from the command to the
       *    including widget
       *
       * @lint ignoreReferenceField(_bindableProperties)
       */
      _bindableProperties: ["label", "icon", "toolTipText", "value", "menu"],

      /**
       * Initiate the execute action.
       */
      execute: function execute() {
        var cmd = this.getCommand();

        if (cmd) {
          if (this.__semaphore) {
            this.__semaphore = false;
          } else {
            this.__semaphore = true;
            cmd.execute(this);
          }
        }

        this.fireEvent("execute");
      },

      /**
       * Handler for the execute event of the command.
       *
       * @param e {qx.event.type.Event} The execute event of the command.
       */
      __onCommandExecute: function __onCommandExecute(e) {
        if (this.isEnabled()) {
          if (this.__semaphore) {
            this.__semaphore = false;
            return;
          }

          if (this.isEnabled()) {
            this.__semaphore = true;
            this.execute();
          }
        }
      },
      // property apply
      _applyCommand: function _applyCommand(value, old) {
        // execute forwarding
        if (old != null) {
          old.removeListenerById(this.__executeListenerId);
        }

        if (value != null) {
          this.__executeListenerId = value.addListener("execute", this.__onCommandExecute, this);
        } // binding stuff


        var ids = this.__executableBindingIds;

        if (ids == null) {
          this.__executableBindingIds = ids = {};
        }

        var selfPropertyValue;

        for (var i = 0; i < this._bindableProperties.length; i++) {
          var property = this._bindableProperties[i]; // remove the old binding

          if (old != null && !old.isDisposed() && ids[property] != null) {
            old.removeBinding(ids[property]);
            ids[property] = null;
          } // add the new binding


          if (value != null && qx.Class.hasProperty(this.constructor, property)) {
            // handle the init value (don't sync the initial null)
            var cmdPropertyValue = value.get(property);

            if (cmdPropertyValue == null) {
              selfPropertyValue = this.get(property); // check also for themed values [BUG #5906]

              if (selfPropertyValue == null) {
                // update the appearance to make sure every themed property is up to date
                this.$$resyncNeeded = true;
                this.syncAppearance();
                selfPropertyValue = qx.util.PropertyUtil.getThemeValue(this, property);
              }
            } else {
              // Reset the self property value [BUG #4534]
              selfPropertyValue = null;
            } // set up the binding


            ids[property] = value.bind(property, this, property); // reapply the former value

            if (selfPropertyValue) {
              this.set(property, selfPropertyValue);
            }
          }
        }
      }
    },
    destruct: function destruct() {
      this._applyCommand(null, this.getCommand());

      this.__executableBindingIds = null;
    }
  });
  qx.ui.core.MExecutable.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Form interface for all form widgets which are executable in some way. This
   * could be a button for example.
   */
  qx.Interface.define("qx.ui.form.IExecutable", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the widget is executed. Sets the "data" property of the
       * event to the object that issued the command.
       */
      "execute": "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        COMMAND PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Set the command of this executable.
       *
       * @param command {qx.ui.command.Command} The command.
       */
      setCommand: function setCommand(command) {
        return arguments.length == 1;
      },

      /**
       * Return the current set command of this executable.
       *
       * @return {qx.ui.command.Command} The current set command.
       */
      getCommand: function getCommand() {},

      /**
       * Fire the "execute" event on the command.
       */
      execute: function execute() {}
    }
  });
  qx.ui.form.IExecutable.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.Util": {},
      "qx.ui.basic.Label": {}
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
   * A atom layout. Used to place an image and label in relation
   * to each other. Useful to create buttons, list items, etc.
   *
   * *Features*
   *
   * * Gap between icon and text (using {@link #gap})
   * * Vertical and horizontal mode (using {@link #iconPosition})
   * * Sorting options to place first child on top/left or bottom/right (using {@link #iconPosition})
   * * Automatically middles/centers content to the available space
   * * Auto-sizing
   * * Supports more than two children (will be processed the same way like the previous ones)
   *
   * *Item Properties*
   *
   * None
   *
   * *Notes*
   *
   * * Does not support margins and alignment of {@link qx.ui.core.LayoutItem}.
   *
   * *Alternative Names*
   *
   * None
   */
  qx.Class.define("qx.ui.layout.Atom", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The gap between the icon and the text */
      gap: {
        check: "Integer",
        init: 4,
        apply: "_applyLayoutChange"
      },

      /** The position of the icon in relation to the text */
      iconPosition: {
        check: ["left", "top", "right", "bottom", "top-left", "bottom-left", "top-right", "bottom-right"],
        init: "left",
        apply: "_applyLayoutChange"
      },

      /**
       * Whether the content should be rendered centrally when to much space
       * is available. Enabling this property centers in both axis. The behavior
       * when disabled of the centering depends on the {@link #iconPosition} property.
       * If the icon position is <code>left</code> or <code>right</code>, the X axis
       * is not centered, only the Y axis. If the icon position is <code>top</code>
       * or <code>bottom</code>, the Y axis is not centered. In case of e.g. an
       * icon position of <code>top-left</code> no axis is centered.
       */
      center: {
        check: "Boolean",
        init: false,
        apply: "_applyLayoutChange"
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
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      verifyLayoutProperty: function verifyLayoutProperty(item, name, value) {
        this.assert(false, "The property '" + name + "' is not supported by the Atom layout!");
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var left = padding.left;
        var top = padding.top;
        var Util = qx.ui.layout.Util;
        var iconPosition = this.getIconPosition();

        var children = this._getLayoutChildren();

        var length = children.length;
        var width, height;
        var child, hint;
        var gap = this.getGap();
        var center = this.getCenter(); // reverse ordering

        var allowedPositions = ["bottom", "right", "top-right", "bottom-right"];

        if (allowedPositions.indexOf(iconPosition) != -1) {
          var start = length - 1;
          var end = -1;
          var increment = -1;
        } else {
          var start = 0;
          var end = length;
          var increment = 1;
        } // vertical


        if (iconPosition == "top" || iconPosition == "bottom") {
          if (center) {
            var allocatedHeight = 0;

            for (var i = start; i != end; i += increment) {
              height = children[i].getSizeHint().height;

              if (height > 0) {
                allocatedHeight += height;

                if (i != start) {
                  allocatedHeight += gap;
                }
              }
            }

            top += Math.round((availHeight - allocatedHeight) / 2);
          }

          var childTop = top;

          for (var i = start; i != end; i += increment) {
            child = children[i];
            hint = child.getSizeHint();
            width = Math.min(hint.maxWidth, Math.max(availWidth, hint.minWidth));
            height = hint.height;
            left = Util.computeHorizontalAlignOffset("center", width, availWidth) + padding.left;
            child.renderLayout(left, childTop, width, height); // Ignore pseudo invisible elements

            if (height > 0) {
              childTop = top + height + gap;
            }
          }
        } // horizontal
        // in this way it also supports shrinking of the first label
        else {
            var remainingWidth = availWidth;
            var shrinkTarget = null;
            var count = 0;

            for (var i = start; i != end; i += increment) {
              child = children[i];
              width = child.getSizeHint().width;

              if (width > 0) {
                if (!shrinkTarget && child instanceof qx.ui.basic.Label) {
                  shrinkTarget = child;
                } else {
                  remainingWidth -= width;
                }

                count++;
              }
            }

            if (count > 1) {
              var gapSum = (count - 1) * gap;
              remainingWidth -= gapSum;
            }

            if (shrinkTarget) {
              var hint = shrinkTarget.getSizeHint();
              var shrinkTargetWidth = Math.max(hint.minWidth, Math.min(remainingWidth, hint.maxWidth));
              remainingWidth -= shrinkTargetWidth;
            }

            if (center && remainingWidth > 0) {
              left += Math.round(remainingWidth / 2);
            }

            for (var i = start; i != end; i += increment) {
              child = children[i];
              hint = child.getSizeHint();
              height = Math.min(hint.maxHeight, Math.max(availHeight, hint.minHeight));

              if (child === shrinkTarget) {
                width = shrinkTargetWidth;
              } else {
                width = hint.width;
              }

              var align = "middle";

              if (iconPosition == "top-left" || iconPosition == "top-right") {
                align = "top";
              } else if (iconPosition == "bottom-left" || iconPosition == "bottom-right") {
                align = "bottom";
              }

              var childTop = top + Util.computeVerticalAlignOffset(align, hint.height, availHeight);
              child.renderLayout(left, childTop, width, height); // Ignore pseudo invisible childs for gap e.g.
              // empty text or unavailable images

              if (width > 0) {
                left += width + gap;
              }
            }
          }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var length = children.length;
        var hint, result; // Fast path for only one child

        if (length === 1) {
          var hint = children[0].getSizeHint(); // Work on a copy, but do not respect max
          // values as a Atom can be rendered bigger
          // than its content.

          result = {
            width: hint.width,
            height: hint.height,
            minWidth: hint.minWidth,
            minHeight: hint.minHeight
          };
        } else {
          var minWidth = 0,
              width = 0;
          var minHeight = 0,
              height = 0;
          var iconPosition = this.getIconPosition();
          var gap = this.getGap();

          if (iconPosition === "top" || iconPosition === "bottom") {
            var count = 0;

            for (var i = 0; i < length; i++) {
              hint = children[i].getSizeHint(); // Max of widths

              width = Math.max(width, hint.width);
              minWidth = Math.max(minWidth, hint.minWidth); // Sum of heights

              if (hint.height > 0) {
                height += hint.height;
                minHeight += hint.minHeight;
                count++;
              }
            }

            if (count > 1) {
              var gapSum = (count - 1) * gap;
              height += gapSum;
              minHeight += gapSum;
            }
          } else {
            var count = 0;

            for (var i = 0; i < length; i++) {
              hint = children[i].getSizeHint(); // Max of heights

              height = Math.max(height, hint.height);
              minHeight = Math.max(minHeight, hint.minHeight); // Sum of widths

              if (hint.width > 0) {
                width += hint.width;
                minWidth += hint.minWidth;
                count++;
              }
            }

            if (count > 1) {
              var gapSum = (count - 1) * gap;
              width += gapSum;
              minWidth += gapSum;
            }
          } // Build hint


          result = {
            minWidth: minWidth,
            width: width,
            minHeight: minHeight,
            height: height
          };
        }

        return result;
      }
    }
  });
  qx.ui.layout.Atom.$$dbClassInfo = $$dbClassInfo;
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
   * A Button widget which supports various states and allows it to be used
   * via the mouse, touch, pen and the keyboard.
   *
   * If the user presses the button by clicking on it, or the <code>Enter</code> or
   * <code>Space</code> keys, the button fires an {@link qx.ui.core.MExecutable#execute} event.
   *
   * If the {@link qx.ui.core.MExecutable#command} property is set, the
   * command is executed as well.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.Button("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button was clicked");
   *   }, this);
   *
   *   this.getRoot().add(button);
   * </pre>
   *
   * This example creates a button with the label "Hello World" and attaches an
   * event listener to the {@link #execute} event.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/button.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.Button", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} label of the atom
     * @param icon {String?null} Icon URL of the atom
     * @param command {qx.ui.command.Command?null} Command instance to connect with
     */
    construct: function construct(label, icon, command) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);

      if (command != null) {
        this.setCommand(command);
      } // Add listeners


      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut);
      this.addListener("pointerdown", this._onPointerDown);
      this.addListener("pointerup", this._onPointerUp);
      this.addListener("tap", this._onTap);
      this.addListener("keydown", this._onKeyDown);
      this.addListener("keyup", this._onKeyUp); // Stop events

      this.addListener("dblclick", function (e) {
        e.stopPropagation();
      });
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
        init: "button"
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
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        hovered: true,
        pressed: true,
        disabled: true
      },

      /*
      ---------------------------------------------------------------------------
        USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Manually press the button
       */
      press: function press() {
        if (this.hasState("abandoned")) {
          return;
        }

        this.addState("pressed");
      },

      /**
       * Manually release the button
       */
      release: function release() {
        if (this.hasState("pressed")) {
          this.removeState("pressed");
        }
      },

      /**
       * Completely reset the button (remove all states)
       */
      reset: function reset() {
        this.removeState("pressed");
        this.removeState("abandoned");
        this.removeState("hovered");
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener method for "pointerover" event
       * <ul>
       * <li>Adds state "hovered"</li>
       * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
          this.addState("pressed");
        }

        this.addState("hovered");
      },

      /**
       * Listener method for "pointerout" event
       * <ul>
       * <li>Removes "hovered" state</li>
       * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerOut: function _onPointerOut(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        this.removeState("hovered");

        if (this.hasState("pressed")) {
          this.removeState("pressed");
          this.addState("abandoned");
        }
      },

      /**
       * Listener method for "pointerdown" event
       * <ul>
       * <li>Removes "abandoned" state</li>
       * <li>Adds "pressed" state</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerDown: function _onPointerDown(e) {
        if (!e.isLeftPressed()) {
          return;
        }

        e.stopPropagation(); // Activate capturing if the button get a pointerout while
        // the button is pressed.

        this.capture();
        this.removeState("abandoned");
        this.addState("pressed");
      },

      /**
       * Listener method for "pointerup" event
       * <ul>
       * <li>Removes "pressed" state (if set)</li>
       * <li>Removes "abandoned" state (if set)</li>
       * <li>Adds "hovered" state (if "abandoned" state is not set)</li>
       *</ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerUp: function _onPointerUp(e) {
        this.releaseCapture(); // We must remove the states before executing the command
        // because in cases were the window lost the focus while
        // executing we get the capture phase back (mouseout).

        var hasPressed = this.hasState("pressed");
        var hasAbandoned = this.hasState("abandoned");

        if (hasPressed) {
          this.removeState("pressed");
        }

        if (hasAbandoned) {
          this.removeState("abandoned");
        }

        e.stopPropagation();
      },

      /**
       * Listener method for "tap" event which stops the propagation.
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onTap: function _onTap(e) {
        // "execute" is fired here so that the button can be dragged
        // without executing it (e.g. in a TabBar with overflow)
        this.execute();
        e.stopPropagation();
      },

      /**
       * Listener method for "keydown" event.<br/>
       * Removes "abandoned" and adds "pressed" state
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyDown: function _onKeyDown(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            this.removeState("abandoned");
            this.addState("pressed");
            e.stopPropagation();
        }
      },

      /**
       * Listener method for "keyup" event.<br/>
       * Removes "abandoned" and "pressed" state (if "pressed" state is set)
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyUp: function _onKeyUp(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            if (this.hasState("pressed")) {
              this.removeState("abandoned");
              this.removeState("pressed");
              this.execute();
              e.stopPropagation();
            }

        }
      }
    }
  });
  qx.ui.form.Button.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Document": {},
      "qx.bom.client.OperatingSystem": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
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
       * Sebastian Fastner (fastner)
       * Tino Butz (tbtz)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Unify Project
  
       Homepage:
         http://unify-project.org
  
       Copyright:
         2009-2010 Deutsche Telekom AG, Germany, http://telekom.com
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
     * Yahoo! UI Library
         http://developer.yahoo.com/yui
         Version 2.2.0
  
       Copyright:
         (c) 2007, Yahoo! Inc.
  
       License:
         BSD: http://developer.yahoo.com/yui/license.txt
  
     ----------------------------------------------------------------------
  
       http://developer.yahoo.com/yui/license.html
  
       Copyright (c) 2009, Yahoo! Inc.
       All rights reserved.
  
       Redistribution and use of this software in source and binary forms,
       with or without modification, are permitted provided that the
       following conditions are met:
  
       * Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in
         the documentation and/or other materials provided with the
         distribution.
       * Neither the name of Yahoo! Inc. nor the names of its contributors
         may be used to endorse or promote products derived from this
         software without specific prior written permission of Yahoo! Inc.
  
       THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
       FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
       COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
       INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
       (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
       SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
       HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
       STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
       ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
       OF THE POSSIBILITY OF SUCH DAMAGE.
  
  ************************************************************************ */

  /**
   * Includes library functions to work with the client's viewport (window).
   * Orientation related functions are point to window.top as default.
   */
  qx.Bootstrap.define("qx.bom.Viewport", {
    statics: {
      /**
       * Returns the current width of the viewport (excluding the vertical scrollbar
       * if present).
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The width of the viewable area of the page (excluding scrollbars).
       */
      getWidth: function getWidth(win) {
        var win = win || window;
        var doc = win.document;
        return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientWidth : doc.body.clientWidth;
      },

      /**
       * Returns the current height of the viewport (excluding the horizontal scrollbar
       * if present).
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The Height of the viewable area of the page (excluding scrollbars).
       */
      getHeight: function getHeight(win) {
        var win = win || window;
        var doc = win.document; // [BUG #7785] Document element's clientHeight is calculated wrong on iPad iOS7

        if (qx.core.Environment.get("os.name") == "ios" && window.innerHeight != doc.documentElement.clientHeight) {
          return window.innerHeight;
        }

        return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientHeight : doc.body.clientHeight;
      },

      /**
       * Returns the scroll position of the viewport
       *
       * All clients except IE < 9 support the non-standard property <code>pageXOffset</code>.
       * As this is easier to evaluate we prefer this property over <code>scrollLeft</code>.
       * Since the window could differ from the one the application is running in, we can't
       * use a one-time environment check to decide which property to use.
       *
       * @param win {Window?window} The window to query
       * @return {Integer} Scroll position in pixels from left edge, always a positive integer or zero
       */
      getScrollLeft: function getScrollLeft(win) {
        var win = win ? win : window;

        if (typeof win.pageXOffset !== "undefined") {
          return win.pageXOffset;
        } // Firefox is using 'documentElement.scrollLeft' and Chrome is using
        // 'document.body.scrollLeft'. For the other value each browser is returning
        // 0, so we can use this check to get the positive value without using specific
        // browser checks.


        var doc = win.document;
        return doc.documentElement.scrollLeft || doc.body.scrollLeft;
      },

      /**
       * Returns the scroll position of the viewport
       *
       * All clients except MSHTML support the non-standard property <code>pageYOffset</code>.
       * As this is easier to evaluate we prefer this property over <code>scrollTop</code>.
       * Since the window could differ from the one the application is running in, we can't
       * use a one-time environment check to decide which property to use.
       *
       * @param win {Window?window} The window to query
       * @return {Integer} Scroll position in pixels from top edge, always a positive integer or zero
       */
      getScrollTop: function getScrollTop(win) {
        var win = win ? win : window;

        if (typeof win.pageYOffset !== "undefined") {
          return win.pageYOffset;
        } // Firefox is using 'documentElement.scrollTop' and Chrome is using
        // 'document.body.scrollTop'. For the other value each browser is returning
        // 0, so we can use this check to get the positive value without using specific
        // browser checks.


        var doc = win.document;
        return doc.documentElement.scrollTop || doc.body.scrollTop;
      },

      /**
       * Returns an orientation normalizer value that should be added to device orientation
       * to normalize behaviour on different devices.
       *
       * @param win {Window} The window to query
       * @return {Map} Orientation normalizing value
       */
      __getOrientationNormalizer: function __getOrientationNormalizer(win) {
        // Calculate own understanding of orientation (0 = portrait, 90 = landscape)
        var currentOrientation = this.getWidth(win) > this.getHeight(win) ? 90 : 0;
        var deviceOrientation = win.orientation;

        if (deviceOrientation == null || Math.abs(deviceOrientation % 180) == currentOrientation) {
          // No device orientation available or device orientation equals own understanding of orientation
          return {
            "-270": 90,
            "-180": 180,
            "-90": -90,
            "0": 0,
            "90": 90,
            "180": 180,
            "270": -90
          };
        } else {
          // Device orientation is not equal to own understanding of orientation
          return {
            "-270": 180,
            "-180": -90,
            "-90": 0,
            "0": 90,
            "90": 180,
            "180": -90,
            "270": 0
          };
        }
      },
      // Cache orientation normalizer map on start
      __orientationNormalizer: null,

      /**
       * Returns the current orientation of the viewport in degree.
       *
       * All possible values and their meaning:
       *
       * * <code>-90</code>: "Landscape"
       * * <code>0</code>: "Portrait"
       * * <code>90</code>: "Landscape"
       * * <code>180</code>: "Portrait"
       *
       * @param win {Window?window.top} The window to query. (Default = top window)
       * @return {Integer} The current orientation in degree
       */
      getOrientation: function getOrientation(win) {
        // Set window.top as default, because orientationChange event is only fired top window
        var win = win || window.top; // The orientation property of window does not have the same behaviour over all devices
        // iPad has 0degrees = Portrait, Playbook has 90degrees = Portrait, same for Android Honeycomb
        //
        // To fix this an orientationNormalizer map is calculated on application start
        //
        // The calculation of getWidth and getHeight returns wrong values if you are in an input field
        // on iPad and rotate your device!

        var orientation = win.orientation;

        if (orientation == null) {
          // Calculate orientation from window width and window height
          orientation = this.getWidth(win) > this.getHeight(win) ? 90 : 0;
        } else {
          if (this.__orientationNormalizer == null) {
            this.__orientationNormalizer = this.__getOrientationNormalizer(win);
          } // Normalize orientation value


          orientation = this.__orientationNormalizer[orientation];
        }

        return orientation;
      },

      /**
       * Whether the viewport orientation is currently in landscape mode.
       *
       * @param win {Window?window} The window to query
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in landscape mode.
       */
      isLandscape: function isLandscape(win) {
        var orientation = this.getOrientation(win);
        return orientation === -90 || orientation === 90;
      },

      /**
       * Whether the viewport orientation is currently in portrait mode.
       *
       * @param win {Window?window} The window to query
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in portrait mode.
       */
      isPortrait: function isPortrait(win) {
        var orientation = this.getOrientation(win);
        return orientation === 0 || orientation === 180;
      }
    }
  });
  qx.bom.Viewport.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
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
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Basic implementation for an event emitter. This supplies a basic and
   * minimalistic event mechanism.
   */
  qx.Bootstrap.define("qx.event.Emitter", {
    extend: Object,
    statics: {
      /** Static storage for all event listener */
      __storage: []
    },
    members: {
      __listener: null,
      __any: null,

      /**
       * Attach a listener to the event emitter. The given <code>name</code>
       * will define the type of event. Handing in a <code>'*'</code> will
       * listen to all events emitted by the event emitter.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      on: function on(name, listener, ctx) {
        var id = qx.event.Emitter.__storage.length;

        this.__getStorage(name).push({
          listener: listener,
          ctx: ctx,
          id: id,
          name: name
        });

        qx.event.Emitter.__storage.push({
          name: name,
          listener: listener,
          ctx: ctx
        });

        return id;
      },

      /**
       * Attach a listener to the event emitter which will be executed only once.
       * The given <code>name</code> will define the type of event. Handing in a
       * <code>'*'</code> will listen to all events emitted by the event emitter.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      once: function once(name, listener, ctx) {
        var id = qx.event.Emitter.__storage.length;

        this.__getStorage(name).push({
          listener: listener,
          ctx: ctx,
          once: true,
          id: id
        });

        qx.event.Emitter.__storage.push({
          name: name,
          listener: listener,
          ctx: ctx
        });

        return id;
      },

      /**
       * Remove a listener from the event emitter. The given <code>name</code>
       * will define the type of event.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer|null} The listener's id if it was removed or
       * <code>null</code> if it wasn't found
       */
      off: function off(name, listener, ctx) {
        var storage = this.__getStorage(name);

        for (var i = storage.length - 1; i >= 0; i--) {
          var entry = storage[i];

          if (entry.listener == listener && entry.ctx == ctx) {
            storage.splice(i, 1);
            qx.event.Emitter.__storage[entry.id] = null;
            return entry.id;
          }
        }

        return null;
      },

      /**
       * Removes the listener identified by the given <code>id</code>. The id
       * will be return on attaching the listener and can be stored for removing.
       *
       * @param id {Integer} The id of the listener.
       * @return {Integer|null} The listener's id if it was removed or
       * <code>null</code> if it wasn't found
       */
      offById: function offById(id) {
        var entry = qx.event.Emitter.__storage[id];

        if (entry) {
          this.off(entry.name, entry.listener, entry.ctx);
        }

        return null;
      },

      /**
       * Alternative for {@link #on}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      addListener: function addListener(name, listener, ctx) {
        return this.on(name, listener, ctx);
      },

      /**
       * Alternative for {@link #once}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      addListenerOnce: function addListenerOnce(name, listener, ctx) {
        return this.once(name, listener, ctx);
      },

      /**
       * Alternative for {@link #off}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       */
      removeListener: function removeListener(name, listener, ctx) {
        this.off(name, listener, ctx);
      },

      /**
       * Alternative for {@link #offById}.
       * @param id {Integer} The id of the listener.
       */
      removeListenerById: function removeListenerById(id) {
        this.offById(id);
      },

      /**
       * Emits an event with the given name. The data will be passed
       * to the listener.
       * @param name {String} The name of the event to emit.
       * @param data {var?undefined} The data which should be passed to the listener.
       */
      emit: function emit(name, data) {
        var storage = this.__getStorage(name).concat();

        var toDelete = [];

        for (var i = 0; i < storage.length; i++) {
          var entry = storage[i];
          entry.listener.call(entry.ctx, data);

          if (entry.once) {
            toDelete.push(entry);
          }
        } // listener callbacks could manipulate the storage
        // (e.g. module.Event.once)


        toDelete.forEach(function (entry) {
          var origStorage = this.__getStorage(name);

          var idx = origStorage.indexOf(entry);
          origStorage.splice(idx, 1);
        }.bind(this)); // call on any

        storage = this.__getStorage("*");

        for (var i = storage.length - 1; i >= 0; i--) {
          var entry = storage[i];
          entry.listener.call(entry.ctx, data);
        }
      },

      /**
       * Returns the internal attached listener.
       * @internal
       * @return {Map} A map which has the event name as key. The values are
       *   arrays containing a map with 'listener' and 'ctx'.
       */
      getListeners: function getListeners() {
        return this.__listener;
      },

      /**
       * Returns the data entry for a given event id. If the entry could
       * not be found, undefined will be returned.
       * @internal
       * @param id {Number} The listeners id
       * @return {Map|undefined} The data entry if found
       */
      getEntryById: function getEntryById(id) {
        for (var name in this.__listener) {
          var store = this.__listener[name];

          for (var i = 0, j = store.length; i < j; i++) {
            if (store[i].id === id) {
              return store[i];
            }
          }
        }
      },

      /**
       * Internal helper which will return the storage for the given name.
       * @param name {String} The name of the event.
       * @return {Array} An array which is the storage for the listener and
       *   the given event name.
       */
      __getStorage: function __getStorage(name) {
        if (this.__listener == null) {
          this.__listener = {};
        }

        if (this.__listener[name] == null) {
          this.__listener[name] = [];
        }

        return this.__listener[name];
      }
    }
  });
  qx.event.Emitter.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.normalize.Date": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.Emitter": {
        "require": true
      },
      "qx.bom.client.CssAnimation": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation.requestframe": {
          "className": "qx.bom.client.CssAnimation"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * This is a cross browser wrapper for requestAnimationFrame. For further
   * information about the feature, take a look at spec:
   * http://www.w3.org/TR/animation-timing/
   *
   * This class offers two ways of using this feature. First, the plain
   * API the spec describes.
   *
   * Here is a sample usage:
   * <pre class='javascript'>var start = Date.now();
   * var cb = function(time) {
   *   if (time >= start + duration) {
   *     // ... do some last tasks
   *   } else {
   *     var timePassed = time - start;
   *     // ... calculate the current step and apply it
   *     qx.bom.AnimationFrame.request(cb, this);
   *   }
   * };
   * qx.bom.AnimationFrame.request(cb, this);
   * </pre>
   *
   * Another way of using it is to use it as an instance emitting events.
   *
   * Here is a sample usage of that API:
   * <pre class='javascript'>var frame = new qx.bom.AnimationFrame();
   * frame.on("end", function() {
   *   // ... do some last tasks
   * }, this);
   * frame.on("frame", function(timePassed) {
   *   // ... calculate the current step and apply it
   * }, this);
   * frame.startSequence(duration);
   * </pre>
   *
   * @require(qx.lang.normalize.Date)
   */
  qx.Bootstrap.define("qx.bom.AnimationFrame", {
    extend: qx.event.Emitter,
    events: {
      /** Fired as soon as the animation has ended. */
      "end": undefined,

      /**
       * Fired on every frame having the passed time as value
       * (might be a float for higher precision).
       */
      "frame": "Number"
    },
    members: {
      __canceled: false,

      /**
       * Method used to start a series of animation frames. The series will end as
       * soon as the given duration is over.
       *
       * @param duration {Number} The duration the sequence should take.
       *
       * @ignore(performance.*)
       */
      startSequence: function startSequence(duration) {
        this.__canceled = false;
        var start = window.performance && performance.now ? performance.now() + qx.bom.AnimationFrame.__start : Date.now();

        var cb = function cb(time) {
          if (this.__canceled) {
            this.id = null;
            return;
          } // final call


          if (time >= start + duration) {
            this.emit("end");
            this.id = null;
          } else {
            var timePassed = Math.max(time - start, 0);
            this.emit("frame", timePassed);
            this.id = qx.bom.AnimationFrame.request(cb, this);
          }
        };

        this.id = qx.bom.AnimationFrame.request(cb, this);
      },

      /**
       * Cancels a started sequence of frames. It will do nothing if no
       * sequence is running.
       */
      cancelSequence: function cancelSequence() {
        this.__canceled = true;
      }
    },
    statics: {
      /**
       * The default time in ms the timeout fallback implementation uses.
       */
      TIMEOUT: 30,

      /**
       * Calculation of the predefined timing functions. Approximation of the real
       * bezier curves has been used for easier calculation. This is good and close
       * enough for the predefined functions like <code>ease</code> or
       * <code>linear</code>.
       *
       * @param func {String} The defined timing function. One of the following values:
       *   <code>"ease-in"</code>, <code>"ease-out"</code>, <code>"linear"</code>,
       *   <code>"ease-in-out"</code>, <code>"ease"</code>.
       * @param x {Integer} The percent value of the function.
       * @return {Integer} The calculated value
       */
      calculateTiming: function calculateTiming(func, x) {
        if (func == "ease-in") {
          var a = [3.1223e-7, 0.0757, 1.2646, -0.167, -0.4387, 0.2654];
        } else if (func == "ease-out") {
          var a = [-7.0198e-8, 1.652, -0.551, -0.0458, 0.1255, -0.1807];
        } else if (func == "linear") {
          return x;
        } else if (func == "ease-in-out") {
          var a = [2.482e-7, -0.2289, 3.3466, -1.0857, -1.7354, 0.7034];
        } else {
          // default is 'ease'
          var a = [-0.0021, 0.2472, 9.8054, -21.6869, 17.7611, -5.1226];
        } // A 6th grade polynomial has been used as approximation of the original
        // bezier curves  described in the transition spec
        // http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        // (the same is used for animations as well)


        var y = 0;

        for (var i = 0; i < a.length; i++) {
          y += a[i] * Math.pow(x, i);
        }

        ;
        return y;
      },

      /**
       * Request for an animation frame. If the native <code>requestAnimationFrame</code>
       * method is supported, it will be used. Otherwise, we use timeouts with a
       * 30ms delay. The HighResolutionTime will be used if supported but the time given
       * to the callback will still be a timestamp starting at 1 January 1970 00:00:00 UTC.
       *
       * @param callback {Function} The callback function which will get the current
       *   time as argument (which could be a float for higher precision).
       * @param context {var} The context of the callback.
       * @return {Number} The id of the request.
       */
      request: function request(callback, context) {
        var req = qx.core.Environment.get("css.animation.requestframe");

        var cb = function cb(time) {
          // check for high resolution time
          if (time < 1e10) {
            time = qx.bom.AnimationFrame.__start + time;
          }

          time = time || Date.now();
          callback.call(context, time);
        };

        if (req) {
          return window[req](cb);
        } else {
          // make sure to use an indirection because setTimeout passes a
          // number as first argument as well
          return window.setTimeout(function () {
            cb();
          }, qx.bom.AnimationFrame.TIMEOUT);
        }
      }
    },

    /**
     * @ignore(performance.timing.*)
     */
    defer: function defer(statics) {
      // check and use the high resolution start time if available
      statics.__start = window.performance && performance.timing && performance.timing.navigationStart; // if not, simply use the current time

      if (!statics.__start) {
        statics.__start = Date.now();
      }
    }
  });
  qx.bom.AnimationFrame.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
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
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
   ************************************************************************ */

  /**
   * Util for mouse wheel normalization.
   */
  qx.Bootstrap.define("qx.util.Wheel", {
    statics: {
      /**
       * The maximal measured scroll wheel delta.
       * @internal
       */
      MAXSCROLL: null,

      /**
       * The minimal measured scroll wheel delta.
       * @internal
       */
      MINSCROLL: null,

      /**
       * The normalization factor for the speed calculation.
       * @internal
       */
      FACTOR: 1,

      /**
       * Is the Wheel actually a touchpad ?
       * @internal
       */
      IS_TOUCHPAD: false,

      /**
       * Get the amount the wheel has been scrolled
       *
       * @param domEvent {Event} The native wheel event.
       * @param axis {String?} Optional parameter which defines the scroll axis.
       *   The value can either be <code>"x"</code> or <code>"y"</code>.
       * @return {Integer} Scroll wheel movement for the given axis. If no axis
       *   is given, the y axis is used.
       */
      getDelta: function getDelta(domEvent, axis) {
        // default case
        if (axis === undefined) {
          // default case
          var delta = 0;

          if (domEvent.wheelDelta !== undefined) {
            delta = -domEvent.wheelDelta;
          } else if (domEvent.detail !== 0) {
            delta = domEvent.detail;
          } else if (domEvent.deltaY !== undefined) {
            // use deltaY as default for firefox
            delta = domEvent.deltaY;
          }

          return this.__normalize(delta);
        } // get the x scroll delta


        if (axis === "x") {
          var x = 0;

          if (domEvent.wheelDelta !== undefined) {
            if (domEvent.wheelDeltaX !== undefined) {
              x = domEvent.wheelDeltaX ? this.__normalize(-domEvent.wheelDeltaX) : 0;
            }
          } else {
            if (domEvent.axis && domEvent.axis == domEvent.HORIZONTAL_AXIS && domEvent.detail !== undefined && domEvent.detail > 0) {
              x = this.__normalize(domEvent.detail);
            } else if (domEvent.deltaX !== undefined) {
              x = this.__normalize(domEvent.deltaX);
            }
          }

          return x;
        } // get the y scroll delta


        if (axis === "y") {
          var y = 0;

          if (domEvent.wheelDelta !== undefined) {
            if (domEvent.wheelDeltaY !== undefined) {
              y = domEvent.wheelDeltaY ? this.__normalize(-domEvent.wheelDeltaY) : 0;
            } else {
              y = this.__normalize(-domEvent.wheelDelta);
            }
          } else {
            if (!(domEvent.axis && domEvent.axis == domEvent.HORIZONTAL_AXIS) && domEvent.detail !== undefined && domEvent.detail > 0) {
              y = this.__normalize(domEvent.detail);
            } else if (domEvent.deltaY !== undefined) {
              y = this.__normalize(domEvent.deltaY);
            }
          }

          return y;
        } // default case, return 0


        return 0;
      },

      /**
       * Normalizer for the mouse wheel data.
       *
       * @param delta {Number} The mouse delta.
       * @return {Number} The normalized delta value
       */
      __normalize: function __normalize(delta) {
        if (qx.util.Wheel.IS_TOUCHPAD) {
          // Reset normalization values that may be re-computed once a real mouse is plugged.
          qx.util.Wheel.MINSCROLL = null;
          qx.util.Wheel.MAXSCROLL = null;
          qx.util.Wheel.FACTOR = 1;
          return delta;
        }

        var absDelta = Math.abs(delta);

        if (absDelta === 0) {
          return 0;
        } // store the min value


        if (qx.util.Wheel.MINSCROLL == null || qx.util.Wheel.MINSCROLL > absDelta) {
          qx.util.Wheel.MINSCROLL = absDelta;

          this.__recalculateMultiplicator();
        } // store the max value


        if (qx.util.Wheel.MAXSCROLL == null || qx.util.Wheel.MAXSCROLL < absDelta) {
          qx.util.Wheel.MAXSCROLL = absDelta;

          this.__recalculateMultiplicator();
        } // special case for systems not speeding up


        if (qx.util.Wheel.MAXSCROLL === absDelta && qx.util.Wheel.MINSCROLL === absDelta) {
          return 2 * (delta / absDelta);
        }

        var range = qx.util.Wheel.MAXSCROLL - qx.util.Wheel.MINSCROLL;
        var ret = delta / range * Math.log(range) * qx.util.Wheel.FACTOR; // return at least 1 or -1

        return ret < 0 ? Math.min(ret, -1) : Math.max(ret, 1);
      },

      /**
       * Recalculates the factor with which the calculated delta is normalized.
       */
      __recalculateMultiplicator: function __recalculateMultiplicator() {
        var max = qx.util.Wheel.MAXSCROLL || 0;
        var min = qx.util.Wheel.MINSCROLL || max;

        if (max <= min) {
          return;
        }

        var range = max - min;
        var maxRet = max / range * Math.log(range);

        if (maxRet == 0) {
          maxRet = 1;
        }

        qx.util.Wheel.FACTOR = 6 / maxRet;
      }
    }
  });
  qx.util.Wheel.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.core.Assert": {},
      "qx.event.GlobalError": {
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
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Global timer support.
   *
   * This class can be used to periodically fire an event. This event can be
   * used to simulate e.g. a background task. The static method
   * {@link #once} is a special case. It will call a function deferred after a
   * given timeout.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.Timer", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param interval {Number} initial interval in milliseconds of the timer.
     */
    construct: function construct(interval) {
      qx.core.Object.constructor.call(this);

      if (interval != null) {
        this.setInterval(interval);
      } // don't use qx.lang.Function.bind because this function would add a
      // disposed check, which could break the functionality. In IE the handler
      // may get called after "clearInterval" (i.e. after the timer is disposed)
      // and we must be able to handle this.


      var self = this;

      this.__oninterval = function () {
        self._oninterval.call(self);
      };
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** This event if fired each time the interval time has elapsed */
      "interval": "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Start a function after a given timeout.
       *
       * @param func {Function} Function to call
       * @param obj {Object} context (this), the function is called with
       * @param timeout {Number} Number of milliseconds to wait before the
       *   function is called.
       * @return {qx.event.Timer} The timer object used for the timeout. This
       *    object can be used to cancel the timeout. Note that the timer is
       *    only valid until the timer has been executed.
       */
      once: function once(func, obj, timeout) {
        {
          // check the given parameter
          qx.core.Assert.assertFunction(func, "func is not a function");
          qx.core.Assert.assertNotUndefined(timeout, "No timeout given");
        } // Create time instance

        var timer = new qx.event.Timer(timeout); // Bug #3481: append original function to timer instance so it can be
        // read by a debugger

        timer.__onceFunc = func; // Add event listener to interval

        timer.addListener("interval", function (e) {
          timer.stop();
          func.call(obj, e);
          delete timer.__onceFunc;
          timer.dispose();
          obj = null;
        }, obj); // Directly start timer

        timer.start();
        return timer;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * With the enabled property the Timer can be started and suspended.
       * Setting it to "true" is equivalent to {@link #start}, setting it
       * to "false" is equivalent to {@link #stop}.
       */
      enabled: {
        init: false,
        check: "Boolean",
        apply: "_applyEnabled"
      },

      /**
       * Time in milliseconds between two callback calls.
       * This property can be set to modify the interval of
       * a running timer.
       */
      interval: {
        check: "Integer",
        init: 1000,
        apply: "_applyInterval"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __intervalHandler: null,
      __oninterval: null,

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */

      /**
       * Apply the interval of the timer.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyInterval: function _applyInterval(value, old) {
        if (this.getEnabled()) {
          this.restart();
        }
      },

      /**
       * Apply the enabled state of the timer.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyEnabled: function _applyEnabled(value, old) {
        if (old) {
          window.clearInterval(this.__intervalHandler);
          this.__intervalHandler = null;
        } else if (value) {
          this.__intervalHandler = window.setInterval(this.__oninterval, this.getInterval());
        }
      },

      /*
      ---------------------------------------------------------------------------
        USER-ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Start the timer
       *
       */
      start: function start() {
        this.setEnabled(true);
      },

      /**
       * Start the timer with a given interval
       *
       * @param interval {Integer} Time in milliseconds between two callback calls.
       */
      startWith: function startWith(interval) {
        this.setInterval(interval);
        this.start();
      },

      /**
       * Stop the timer.
       *
       */
      stop: function stop() {
        this.setEnabled(false);
      },

      /**
       * Restart the timer.
       * This makes it possible to change the interval of a running timer.
       *
       */
      restart: function restart() {
        this.stop();
        this.start();
      },

      /**
       * Restart the timer. with a given interval.
       *
       * @param interval {Integer} Time in milliseconds between two callback calls.
       */
      restartWith: function restartWith(interval) {
        this.stop();
        this.startWith(interval);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT-MAPPER
      ---------------------------------------------------------------------------
      */

      /**
       * timer callback
       *
       * @signature function()
       */
      _oninterval: qx.event.GlobalError.observeMethod(function () {
        if (this.$$disposed) {
          return;
        }

        if (this.getEnabled()) {
          this.fireEvent("interval");
        }
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__intervalHandler) {
        window.clearInterval(this.__intervalHandler);
      }

      this.__intervalHandler = this.__oninterval = null;
    }
  });
  qx.event.Timer.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Keyboard input event object.
   *
   * the interface of this class is based on the DOM Level 3 keyboard event
   * interface: http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
   */
  qx.Class.define("qx.event.type.KeyInput", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Object} The event target
       * @param charCode {Integer} the character code
       * @return {qx.event.type.KeyInput} The initialized key event instance
       */
      init: function init(domEvent, target, charCode) {
        qx.event.type.KeyInput.prototype.init.base.call(this, domEvent, target, null, true, true);
        this._charCode = charCode;
        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.KeyInput.prototype.clone.base.call(this, embryo);
        clone._charCode = this._charCode;
        return clone;
      },

      /**
       * Unicode number of the pressed character.
       *
       * @return {Integer} Unicode number of the pressed character
       */
      getCharCode: function getCharCode() {
        return this._charCode;
      },

      /**
       * Returns the pressed character
       *
       * @return {String} The character
       */
      getChar: function getChar() {
        return String.fromCharCode(this._charCode);
      }
    }
  });
  qx.event.type.KeyInput.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {
        "require": true
      },
      "qx.event.util.Keyboard": {}
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
   * Keyboard event object.
   *
   * the interface of this class is based on the DOM Level 3 keyboard event
   * interface: http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
   */
  qx.Class.define("qx.event.type.KeySequence", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Object} The event target
       * @param identifier {String} Key identifier
       * @return {qx.event.type.KeySequence} The initialized key event instance
       */
      init: function init(domEvent, target, identifier) {
        qx.event.type.KeySequence.prototype.init.base.call(this, domEvent, target, null, true, true);
        this._keyCode = domEvent.keyCode;
        this._identifier = identifier;
        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.KeySequence.prototype.clone.base.call(this, embryo);
        clone._keyCode = this._keyCode;
        clone._identifier = this._identifier;
        return clone;
      },

      /**
       * Identifier of the pressed key. This property is modeled after the <em>KeyboardEvent.keyIdentifier</em> property
       * of the W3C DOM 3 event specification
       * (http://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/events.html#Events-KeyboardEvent-keyIdentifier).
       *
       * Printable keys are represented by an unicode string, non-printable keys
       * have one of the following values:
       *
       * <table>
       * <tr><th>Backspace</th><td>The Backspace (Back) key.</td></tr>
       * <tr><th>Tab</th><td>The Horizontal Tabulation (Tab) key.</td></tr>
       * <tr><th>Space</th><td>The Space (Spacebar) key.</td></tr>
       * <tr><th>Enter</th><td>The Enter key. Note: This key identifier is also used for the Return (Macintosh numpad) key.</td></tr>
       * <tr><th>Shift</th><td>The Shift key.</td></tr>
       * <tr><th>Control</th><td>The Control (Ctrl) key.</td></tr>
       * <tr><th>Alt</th><td>The Alt (Menu) key.</td></tr>
       * <tr><th>CapsLock</th><td>The CapsLock key</td></tr>
       * <tr><th>Meta</th><td>The Meta key. (Apple Meta and Windows key)</td></tr>
       * <tr><th>Escape</th><td>The Escape (Esc) key.</td></tr>
       * <tr><th>Left</th><td>The Left Arrow key.</td></tr>
       * <tr><th>Up</th><td>The Up Arrow key.</td></tr>
       * <tr><th>Right</th><td>The Right Arrow key.</td></tr>
       * <tr><th>Down</th><td>The Down Arrow key.</td></tr>
       * <tr><th>PageUp</th><td>The Page Up key.</td></tr>
       * <tr><th>PageDown</th><td>The Page Down (Next) key.</td></tr>
       * <tr><th>End</th><td>The End key.</td></tr>
       * <tr><th>Home</th><td>The Home key.</td></tr>
       * <tr><th>Insert</th><td>The Insert (Ins) key. (Does not fire in Opera/Win)</td></tr>
       * <tr><th>Delete</th><td>The Delete (Del) Key.</td></tr>
       * <tr><th>F1</th><td>The F1 key.</td></tr>
       * <tr><th>F2</th><td>The F2 key.</td></tr>
       * <tr><th>F3</th><td>The F3 key.</td></tr>
       * <tr><th>F4</th><td>The F4 key.</td></tr>
       * <tr><th>F5</th><td>The F5 key.</td></tr>
       * <tr><th>F6</th><td>The F6 key.</td></tr>
       * <tr><th>F7</th><td>The F7 key.</td></tr>
       * <tr><th>F8</th><td>The F8 key.</td></tr>
       * <tr><th>F9</th><td>The F9 key.</td></tr>
       * <tr><th>F10</th><td>The F10 key.</td></tr>
       * <tr><th>F11</th><td>The F11 key.</td></tr>
       * <tr><th>F12</th><td>The F12 key.</td></tr>
       * <tr><th>NumLock</th><td>The Num Lock key.</td></tr>
       * <tr><th>PrintScreen</th><td>The Print Screen (PrintScrn, SnapShot) key.</td></tr>
       * <tr><th>Scroll</th><td>The scroll lock key</td></tr>
       * <tr><th>Pause</th><td>The pause/break key</td></tr>
       * <tr><th>Win</th><td>The Windows Logo key</td></tr>
       * <tr><th>Apps</th><td>The Application key (Windows Context Menu)</td></tr>
       * </table>
       *
       * @return {String} The key identifier
       */
      getKeyIdentifier: function getKeyIdentifier() {
        return this._identifier;
      },

      /**
       * Returns the native keyCode and is best used on keydown/keyup events to
       * check which physical key was pressed.
       * Don't use this on keypress events because it's erroneous and
       * inconsistent across browsers. But it can be used to detect which key is
       * exactly pressed (e.g. for num pad keys).
       * In any regular case, you should use {@link #getKeyIdentifier} which
       * takes care of all cross browser stuff.
       *
       * The key codes are not character codes, they are just ASCII codes to
       * identify the keyboard (or other input devices) keys.
       *
       * @return {Number} The key code.
       */
      getKeyCode: function getKeyCode() {
        return this._keyCode;
      },

      /**
       * Checks whether the pressed key is printable.
       *
       * @return {Boolean} Whether the pressed key is printable.
       */
      isPrintable: function isPrintable() {
        return qx.event.util.Keyboard.isPrintableKeyIdentifier(this._identifier);
      }
    }
  });
  qx.event.type.KeySequence.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "load": true,
          "className": "qx.bom.client.OperatingSystem"
        }
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Utilities for working with character codes and key identifiers
   */
  qx.Bootstrap.define("qx.event.util.Keyboard", {
    statics: {
      /*
      ---------------------------------------------------------------------------
        KEY MAPS
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} maps the charcodes of special printable keys to key identifiers
       *
       * @lint ignoreReferenceField(specialCharCodeMap)
       */
      specialCharCodeMap: {
        8: "Backspace",
        // The Backspace (Back) key.
        9: "Tab",
        // The Horizontal Tabulation (Tab) key.
        //   Note: This key identifier is also used for the
        //   Return (Macintosh numpad) key.
        13: "Enter",
        // The Enter key.
        27: "Escape",
        // The Escape (Esc) key.
        32: "Space" // The Space (Spacebar) key.

      },

      /**
       * @type {Map} maps the keycodes of the numpad keys to the right charcodes
       *
       * @lint ignoreReferenceField(numpadToCharCode)
       */
      numpadToCharCode: {
        96: "0".charCodeAt(0),
        97: "1".charCodeAt(0),
        98: "2".charCodeAt(0),
        99: "3".charCodeAt(0),
        100: "4".charCodeAt(0),
        101: "5".charCodeAt(0),
        102: "6".charCodeAt(0),
        103: "7".charCodeAt(0),
        104: "8".charCodeAt(0),
        105: "9".charCodeAt(0),
        106: "*".charCodeAt(0),
        107: "+".charCodeAt(0),
        109: "-".charCodeAt(0),
        110: ",".charCodeAt(0),
        111: "/".charCodeAt(0)
      },

      /**
       * @type {Map} maps the keycodes of non printable keys to key identifiers
       *
       * @lint ignoreReferenceField(keyCodeToIdentifierMap)
       */
      keyCodeToIdentifierMap: {
        16: "Shift",
        // The Shift key.
        17: "Control",
        // The Control (Ctrl) key.
        18: "Alt",
        // The Alt (Menu) key.
        20: "CapsLock",
        // The CapsLock key
        224: "Meta",
        // The Meta key. (Apple Meta and Windows key)
        37: "Left",
        // The Left Arrow key.
        38: "Up",
        // The Up Arrow key.
        39: "Right",
        // The Right Arrow key.
        40: "Down",
        // The Down Arrow key.
        33: "PageUp",
        // The Page Up key.
        34: "PageDown",
        // The Page Down (Next) key.
        35: "End",
        // The End key.
        36: "Home",
        // The Home key.
        45: "Insert",
        // The Insert (Ins) key. (Does not fire in Opera/Win)
        46: "Delete",
        // The Delete (Del) Key.
        112: "F1",
        // The F1 key.
        113: "F2",
        // The F2 key.
        114: "F3",
        // The F3 key.
        115: "F4",
        // The F4 key.
        116: "F5",
        // The F5 key.
        117: "F6",
        // The F6 key.
        118: "F7",
        // The F7 key.
        119: "F8",
        // The F8 key.
        120: "F9",
        // The F9 key.
        121: "F10",
        // The F10 key.
        122: "F11",
        // The F11 key.
        123: "F12",
        // The F12 key.
        144: "NumLock",
        // The Num Lock key.
        44: "PrintScreen",
        // The Print Screen (PrintScrn, SnapShot) key.
        145: "Scroll",
        // The scroll lock key
        19: "Pause",
        // The pause/break key
        // The left Windows Logo key or left cmd key
        91: qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Win",
        92: "Win",
        // The right Windows Logo key or left cmd key
        // The Application key (Windows Context Menu) or right cmd key
        93: qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Apps"
      },

      /** char code for capital A */
      charCodeA: "A".charCodeAt(0),

      /** char code for capital Z */
      charCodeZ: "Z".charCodeAt(0),

      /** char code for 0 */
      charCode0: "0".charCodeAt(0),

      /** char code for 9 */
      charCode9: "9".charCodeAt(0),

      /**
       * converts a keyboard code to the corresponding identifier
       *
       * @param keyCode {Integer} key code
       * @return {String} key identifier
       */
      keyCodeToIdentifier: function keyCodeToIdentifier(keyCode) {
        if (this.isIdentifiableKeyCode(keyCode)) {
          var numPadKeyCode = this.numpadToCharCode[keyCode];

          if (numPadKeyCode) {
            return String.fromCharCode(numPadKeyCode);
          }

          return this.keyCodeToIdentifierMap[keyCode] || this.specialCharCodeMap[keyCode] || String.fromCharCode(keyCode);
        } else {
          return "Unidentified";
        }
      },

      /**
       * converts a character code to the corresponding identifier
       *
       * @param charCode {String} character code
       * @return {String} key identifier
       */
      charCodeToIdentifier: function charCodeToIdentifier(charCode) {
        return this.specialCharCodeMap[charCode] || String.fromCharCode(charCode).toUpperCase();
      },

      /**
       * Check whether the keycode can be reliably detected in keyup/keydown events
       *
       * @param keyCode {String} key code to check.
       * @return {Boolean} Whether the keycode can be reliably detected in keyup/keydown events.
       */
      isIdentifiableKeyCode: function isIdentifiableKeyCode(keyCode) {
        if (keyCode >= this.charCodeA && keyCode <= this.charCodeZ) {
          return true;
        } // 0-9


        if (keyCode >= this.charCode0 && keyCode <= this.charCode9) {
          return true;
        } // Enter, Space, Tab, Backspace


        if (this.specialCharCodeMap[keyCode]) {
          return true;
        } // Numpad


        if (this.numpadToCharCode[keyCode]) {
          return true;
        } // non printable keys


        if (this.isNonPrintableKeyCode(keyCode)) {
          return true;
        }

        return false;
      },

      /**
       * Checks whether the keyCode represents a non printable key
       *
       * @param keyCode {String} key code to check.
       * @return {Boolean} Whether the keyCode represents a non printable key.
       */
      isNonPrintableKeyCode: function isNonPrintableKeyCode(keyCode) {
        return this.keyCodeToIdentifierMap[keyCode] ? true : false;
      },

      /**
       * Checks whether a given string is a valid keyIdentifier
       *
       * @param keyIdentifier {String} The key identifier.
       * @return {Boolean} whether the given string is a valid keyIdentifier
       */
      isValidKeyIdentifier: function isValidKeyIdentifier(keyIdentifier) {
        if (this.identifierToKeyCodeMap[keyIdentifier]) {
          return true;
        }

        if (keyIdentifier.length != 1) {
          return false;
        }

        if (keyIdentifier >= "0" && keyIdentifier <= "9") {
          return true;
        }

        if (keyIdentifier >= "A" && keyIdentifier <= "Z") {
          return true;
        }

        switch (keyIdentifier) {
          case "+":
          case "-":
          case "*":
          case "/":
          case ",":
            return true;

          default:
            return false;
        }
      },

      /**
       * Checks whether a given string is a printable keyIdentifier.
       *
       * @param keyIdentifier {String} The key identifier.
       * @return {Boolean} whether the given string is a printable keyIdentifier.
       */
      isPrintableKeyIdentifier: function isPrintableKeyIdentifier(keyIdentifier) {
        if (keyIdentifier === "Space") {
          return true;
        } else {
          return this.identifierToKeyCodeMap[keyIdentifier] ? false : true;
        }
      }
    },
    defer: function defer(statics) {
      // construct inverse of keyCodeToIdentifierMap
      if (!statics.identifierToKeyCodeMap) {
        statics.identifierToKeyCodeMap = {};

        for (var key in statics.keyCodeToIdentifierMap) {
          statics.identifierToKeyCodeMap[statics.keyCodeToIdentifierMap[key]] = parseInt(key, 10);
        }

        for (var key in statics.specialCharCodeMap) {
          statics.identifierToKeyCodeMap[statics.specialCharCodeMap[key]] = parseInt(key, 10);
        }
      }
    }
  });
  qx.event.util.Keyboard.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Event": {
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.event.Registration": {},
      "qx.event.handler.DragDrop": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Event object class for drag events
   */
  qx.Class.define("qx.event.type.Drag", {
    extend: qx.event.type.Event,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param cancelable {Boolean?false} Whether or not an event can have its default
       *     action prevented. The default action can either be the browser's
       *     default action of a native event (e.g. open the context menu on a
       *     right click) or the default action of a qooxdoo class (e.g. close
       *     the window widget). The default action can be prevented by calling
       *     {@link qx.event.type.Event#preventDefault}
       * @param originalEvent {qx.event.type.Track} The original (mouse) event to use
       * @return {qx.event.type.Event} The initialized event instance
       */
      init: function init(cancelable, originalEvent) {
        qx.event.type.Drag.prototype.init.base.call(this, true, cancelable);

        if (originalEvent) {
          this._native = originalEvent.getNativeEvent() || null;
          this._originalTarget = originalEvent.getOriginalTarget() || null;
        } else {
          this._native = null;
          this._originalTarget = null;
        }

        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.Drag.prototype.clone.base.call(this, embryo);
        clone._native = this._native;
        return clone;
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Integer} The horizontal mouse position in the document.
       */
      getDocumentLeft: function getDocumentLeft() {
        if (this._native == null) {
          return 0;
        }

        var x = this._native.pageX;

        if (x !== undefined) {
          // iOS 6 does not copy pageX over to the fake pointer event
          if (x == 0 && this._native.pointerType == "touch") {
            x = this._native._original.changedTouches[0].pageX || 0;
          }

          return Math.round(x);
        } else {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(win);
        }
      },

      /**
       * Get the vertical position at which the event occurred relative to the
       * top of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Integer} The vertical mouse position in the document.
       */
      getDocumentTop: function getDocumentTop() {
        if (this._native == null) {
          return 0;
        }

        var y = this._native.pageY;

        if (y !== undefined) {
          // iOS 6 does not copy pageY over to the fake pointer event
          if (y == 0 && this._native.pointerType == "touch") {
            y = this._native._original.changedTouches[0].pageY || 0;
          }

          return Math.round(y);
        } else {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(win);
        }
      },

      /**
       * Returns the drag&drop event handler responsible for the target
       *
       * @return {qx.event.handler.DragDrop} The drag&drop handler
       */
      getManager: function getManager() {
        return qx.event.Registration.getManager(this.getTarget()).getHandler(qx.event.handler.DragDrop);
      },

      /**
       * Used during <code>dragstart</code> listener to
       * inform the manager about supported data types.
       *
       * @param type {String} Data type to add to list of supported types
       */
      addType: function addType(type) {
        this.getManager().addType(type);
      },

      /**
       * Used during <code>dragstart</code> listener to
       * inform the manager about supported drop actions.
       *
       * @param action {String} Action to add to the list of supported actions
       */
      addAction: function addAction(action) {
        this.getManager().addAction(action);
      },

      /**
       * Whether the given type is supported by the drag
       * target (source target).
       *
       * This is used in the event listeners for <code>dragover</code>
       * or <code>dragdrop</code>.
       *
       * @param type {String} The type to look for
       * @return {Boolean} Whether the given type is supported
       */
      supportsType: function supportsType(type) {
        return this.getManager().supportsType(type);
      },

      /**
       * Whether the given action is supported by the drag
       * target (source target).
       *
       * This is used in the event listeners for <code>dragover</code>
       * or <code>dragdrop</code>.
       *
       * @param action {String} The action to look for
       * @return {Boolean} Whether the given action is supported
       */
      supportsAction: function supportsAction(action) {
        return this.getManager().supportsAction(action);
      },

      /**
       * Adds data of the given type to the internal storage. The data
       * is available until the <code>dragend</code> event is fired.
       *
       * @param type {String} Any valid type
       * @param data {var} Any data to store
       */
      addData: function addData(type, data) {
        this.getManager().addData(type, data);
      },

      /**
       * Returns the data of the given type. Used in the <code>drop</code> listener.
       * 
       * Note that this is a synchronous method and if any of the drag and drop 
       * events handlers are implemented using Promises, this may fail; @see
       * `getDataAsync`.
       *
       * @param type {String} Any of the supported types.
       * @return {var} The data for the given type
       */
      getData: function getData(type) {
        return this.getManager().getData(type);
      },

      /**
       * Returns the data of the given type. Used in the <code>drop</code> listener.
       * 
       * @param type {String} Any of the supported types.
       * @return {qx.Promise|var} The data for the given type
       */
      getDataAsync: function getDataAsync(type) {
        return this.getManager().getDataAsync(type);
      },

      /**
       * Returns the type which was requested last, to be used
       * in the <code>droprequest</code> listener.
       *
       * @return {String} The last requested data type
       */
      getCurrentType: function getCurrentType() {
        return this.getManager().getCurrentType();
      },

      /**
       * Returns the currently selected action. Depends on the
       * supported actions of the source target and the modification
       * keys pressed by the user.
       *
       * Used in the <code>droprequest</code> listener.
       *
       * @return {String} The action. May be one of <code>move</code>,
       *    <code>copy</code> or <code>alias</code>.
       */
      getCurrentAction: function getCurrentAction() {
        if (this.getDefaultPrevented()) {
          return null;
        }

        return this.getManager().getCurrentAction();
      },

      /**
       * Returns the currently selected action. Depends on the
       * supported actions of the source target and the modification
       * keys pressed by the user.
       *
       * Used in the <code>droprequest</code> listener.
       *
       * @return {qx.Promise|String} The action. May be one of <code>move</code>,
       *    <code>copy</code> or <code>alias</code>.
       */
      getCurrentActionAsync: function getCurrentActionAsync() {
        if (this.getDefaultPrevented()) {
          return null;
        }

        return this.getManager().getCurrentActionAsync();
      },

      /**
       * Whether the current drop target allows the current drag target.
       *
       * This can be called from within the "drag" event to enable/disable
       * a drop target selectively, for example based on the child item,
       * above and beyond the one-time choice made by the the "dragover"
       * event for the droppable widget itself.
       *
       * @param isAllowed {Boolean} False if a drop should be disallowed
       */
      setDropAllowed: function setDropAllowed(isAllowed) {
        this.getManager().setDropAllowed(isAllowed);
      },

      /**
       * Returns the target which has been initially tapped on.
       * @return {qx.ui.core.Widget} The tapped widget.
       */
      getDragTarget: function getDragTarget() {
        return this.getManager().getDragTarget();
      },

      /**
       * Stops the drag&drop session and fires a <code>dragend</code> event.
       */
      stopSession: function stopSession() {
        this.getManager().clearSession();
      }
    }
  });
  qx.event.type.Drag.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.Style": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["css.textoverflow", "css.placeholder", "css.borderradius", "css.boxshadow", "css.gradient.linear", "css.gradient.filter", "css.gradient.radial", "css.gradient.legacywebkit", "css.boxmodel", "css.rgba", "css.borderimage", "css.borderimage.standardsyntax", "css.usermodify", "css.userselect", "css.userselect.none", "css.appearance", "css.float", "css.boxsizing", "css.inlineblock", "css.opacity", "css.textShadow", "css.textShadow.filter", "css.alphaimageloaderneeded", "css.pointerevents", "css.flexboxSyntax"],
      "required": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The purpose of this class is to contain all checks about css.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   * @ignore(WebKitCSSMatrix)
   * @require(qx.bom.Style)
   */
  qx.Bootstrap.define("qx.bom.client.Css", {
    statics: {
      __WEBKIT_LEGACY_GRADIENT: null,

      /**
       * Checks what box model is used in the current environment.
       * @return {String} It either returns "content" or "border".
       * @internal
       */
      getBoxModel: function getBoxModel() {
        var content = qx.bom.client.Engine.getName() !== "mshtml" || !qx.bom.client.Browser.getQuirksMode();
        return content ? "content" : "border";
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>textOverflow</code> style property.
       *
       * @return {String|null} textOverflow property name or <code>null</code> if
       * textOverflow is not supported.
       * @internal
       */
      getTextOverflow: function getTextOverflow() {
        return qx.bom.Style.getPropertyName("textOverflow");
      },

      /**
       * Checks if a placeholder could be used.
       * @return {Boolean} <code>true</code>, if it could be used.
       * @internal
       */
      getPlaceholder: function getPlaceholder() {
        var i = document.createElement("input");
        return "placeholder" in i;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>appearance</code> style property.
       *
       * @return {String|null} appearance property name or <code>null</code> if
       * appearance is not supported.
       * @internal
       */
      getAppearance: function getAppearance() {
        return qx.bom.Style.getPropertyName("appearance");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>borderRadius</code> style property.
       *
       * @return {String|null} borderRadius property name or <code>null</code> if
       * borderRadius is not supported.
       * @internal
       */
      getBorderRadius: function getBorderRadius() {
        return qx.bom.Style.getPropertyName("borderRadius");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>boxShadow</code> style property.
       *
       * @return {String|null} boxShadow property name or <code>null</code> if
       * boxShadow is not supported.
       * @internal
       */
      getBoxShadow: function getBoxShadow() {
        return qx.bom.Style.getPropertyName("boxShadow");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>borderImage</code> style property.
       *
       * @return {String|null} borderImage property name or <code>null</code> if
       * borderImage is not supported.
       * @internal
       */
      getBorderImage: function getBorderImage() {
        return qx.bom.Style.getPropertyName("borderImage");
      },

      /**
       * Returns the type of syntax this client supports for its CSS border-image
       * implementation. Some browsers do not support the "fill" keyword defined
       * in the W3C draft (http://www.w3.org/TR/css3-background/) and will not
       * show the border image if it's set. Others follow the standard closely and
       * will omit the center image if "fill" is not set.
       *
       * @return {Boolean|null} <code>true</code> if the standard syntax is supported.
       * <code>null</code> if the supported syntax could not be detected.
       * @internal
       */
      getBorderImageSyntax: function getBorderImageSyntax() {
        var styleName = qx.bom.client.Css.getBorderImage();

        if (!styleName) {
          return null;
        }

        var el = document.createElement("div");

        if (styleName === "borderImage") {
          // unprefixed implementation: check individual properties
          el.style[styleName] = 'url("foo.png") 4 4 4 4 fill stretch';

          if (el.style.borderImageSource.indexOf("foo.png") >= 0 && el.style.borderImageSlice.indexOf("4 fill") >= 0 && el.style.borderImageRepeat.indexOf("stretch") >= 0) {
            return true;
          }
        } else {
          // prefixed implementation, assume no support for "fill"
          el.style[styleName] = 'url("foo.png") 4 4 4 4 stretch'; // serialized value is unreliable, so just a simple check

          if (el.style[styleName].indexOf("foo.png") >= 0) {
            return false;
          }
        } // unable to determine syntax


        return null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>userSelect</code> style property.
       *
       * @return {String|null} userSelect property name or <code>null</code> if
       * userSelect is not supported.
       * @internal
       */
      getUserSelect: function getUserSelect() {
        return qx.bom.Style.getPropertyName("userSelect");
      },

      /**
       * Returns the (possibly vendor-prefixed) value for the
       * <code>userSelect</code> style property that disables selection. For Gecko,
       * "-moz-none" is returned since "none" only makes the target element appear
       * as if its text could not be selected
       *
       * @internal
       * @return {String|null} the userSelect property value that disables
       * selection or <code>null</code> if userSelect is not supported
       */
      getUserSelectNone: function getUserSelectNone() {
        var styleProperty = qx.bom.client.Css.getUserSelect();

        if (styleProperty) {
          var el = document.createElement("span");
          el.style[styleProperty] = "-moz-none";
          return el.style[styleProperty] === "-moz-none" ? "-moz-none" : "none";
        }

        return null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>userModify</code> style property.
       *
       * @return {String|null} userModify property name or <code>null</code> if
       * userModify is not supported.
       * @internal
       */
      getUserModify: function getUserModify() {
        return qx.bom.Style.getPropertyName("userModify");
      },

      /**
       * Returns the vendor-specific name of the <code>float</code> style property
       *
       * @return {String|null} <code>cssFloat</code> for standards-compliant
       * browsers, <code>styleFloat</code> for legacy IEs, <code>null</code> if
       * the client supports neither property.
       * @internal
       */
      getFloat: function getFloat() {
        var style = document.documentElement.style;
        return style.cssFloat !== undefined ? "cssFloat" : style.styleFloat !== undefined ? "styleFloat" : null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name this client uses for
       * <code>linear-gradient</code>.
       * http://dev.w3.org/csswg/css3-images/#linear-gradients
       *
       * @return {String|null} Prefixed linear-gradient name or <code>null</code>
       * if linear gradients are not supported
       * @internal
       */
      getLinearGradient: function getLinearGradient() {
        qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT = false;
        var value = "linear-gradient(0deg, #fff, #000)";
        var el = document.createElement("div");
        var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);

        if (!style) {
          //try old WebKit syntax (versions 528 - 534.16)
          value = "-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))";
          var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value, false);

          if (style) {
            qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT = true;
          }
        } // not supported


        if (!style) {
          return null;
        }

        var match = /(.*?)\(/.exec(style);
        return match ? match[1] : null;
      },

      /**
       * Returns <code>true</code> if the browser supports setting gradients
       * using the filter style. This usually only applies for IE browsers
       * starting from IE5.5.
       * http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx
       *
       * @return {Boolean} <code>true</code> if supported.
       * @internal
       */
      getFilterGradient: function getFilterGradient() {
        return qx.bom.client.Css.__isFilterSupported("DXImageTransform.Microsoft.Gradient", "startColorStr=#550000FF, endColorStr=#55FFFF00");
      },

      /**
       * Returns the (possibly vendor-prefixed) name this client uses for
       * <code>radial-gradient</code>.
       *
       * @return {String|null} Prefixed radial-gradient name or <code>null</code>
       * if radial gradients are not supported
       * @internal
       */
      getRadialGradient: function getRadialGradient() {
        var value = "radial-gradient(0px 0px, cover, red 50%, blue 100%)";
        var el = document.createElement("div");
        var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);

        if (!style) {
          return null;
        }

        var match = /(.*?)\(/.exec(style);
        return match ? match[1] : null;
      },

      /**
       * Checks if **only** the old WebKit (version < 534.16) syntax for
       * linear gradients is supported, e.g.
       * <code>linear-gradient(0deg, #fff, #000)</code>
       *
       * @return {Boolean} <code>true</code> if the legacy syntax must be used
       * @internal
       */
      getLegacyWebkitGradient: function getLegacyWebkitGradient() {
        if (qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT === null) {
          qx.bom.client.Css.getLinearGradient();
        }

        return qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT;
      },

      /**
       * Checks if rgba colors can be used:
       * http://www.w3.org/TR/2010/PR-css3-color-20101028/#rgba-color
       *
       * @return {Boolean} <code>true</code>, if rgba colors are supported.
       * @internal
       */
      getRgba: function getRgba() {
        var el;

        try {
          el = document.createElement("div");
        } catch (ex) {
          el = document.createElement();
        } // try catch for IE


        try {
          el.style["color"] = "rgba(1, 2, 3, 0.5)";

          if (el.style["color"].indexOf("rgba") != -1) {
            return true;
          }
        } catch (ex) {}

        return false;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>boxSizing</code> style property.
       *
       * @return {String|null} boxSizing property name or <code>null</code> if
       * boxSizing is not supported.
       * @internal
       */
      getBoxSizing: function getBoxSizing() {
        return qx.bom.Style.getPropertyName("boxSizing");
      },

      /**
       * Returns the browser-specific name used for the <code>display</code> style
       * property's <code>inline-block</code> value.
       *
       * @internal
       * @return {String|null}
       */
      getInlineBlock: function getInlineBlock() {
        var el = document.createElement("span");
        el.style.display = "inline-block";

        if (el.style.display == "inline-block") {
          return "inline-block";
        }

        el.style.display = "-moz-inline-box";

        if (el.style.display !== "-moz-inline-box") {
          return "-moz-inline-box";
        }

        return null;
      },

      /**
       * Checks if CSS opacity is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if opacity is supported
       */
      getOpacity: function getOpacity() {
        return typeof document.documentElement.style.opacity == "string";
      },

      /**
       * Checks if CSS texShadow is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if textShadow is supported
       */
      getTextShadow: function getTextShadow() {
        return !!qx.bom.Style.getPropertyName("textShadow");
      },

      /**
       * Returns <code>true</code> if the browser supports setting text shadow
       * using the filter style. This usually only applies for IE browsers
       * starting from IE5.5.
       *
       * @internal
       * @return {Boolean} <code>true</code> if textShadow is supported
       */
      getFilterTextShadow: function getFilterTextShadow() {
        return qx.bom.client.Css.__isFilterSupported("DXImageTransform.Microsoft.Shadow", "color=#666666,direction=45");
      },

      /**
       * Checks if the given filter is supported.
       *
       * @param filterClass {String} The name of the filter class
       * @param initParams {String} Init values for the filter
       * @return {Boolean} <code>true</code> if the given filter is supported
       */
      __isFilterSupported: function __isFilterSupported(filterClass, initParams) {
        var supported = false;
        var value = "progid:" + filterClass + "(" + initParams + ");";
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.style.filter = value;

        if (el.filters && el.filters.length > 0 && el.filters.item(filterClass).enabled == true) {
          supported = true;
        }

        document.body.removeChild(el);
        return supported;
      },

      /**
       * Checks if the Alpha Image Loader must be used to display transparent PNGs.
       *
       * @return {Boolean} <code>true</code> if the Alpha Image Loader is required
       */
      getAlphaImageLoaderNeeded: function getAlphaImageLoaderNeeded() {
        return qx.bom.client.Engine.getName() == "mshtml" && qx.bom.client.Browser.getDocumentMode() < 9;
      },

      /**
       * Checks if pointer events are available.
       *
       * @internal
       * @return {Boolean} <code>true</code> if pointer events are supported.
       */
      getPointerEvents: function getPointerEvents() {
        var el = document.documentElement; // Check if browser reports that pointerEvents is a known style property

        if ("pointerEvents" in el.style) {
          // The property is defined in Opera and IE9 but setting it has no effect
          var initial = el.style.pointerEvents;
          el.style.pointerEvents = "auto"; // don't assume support if a nonsensical value isn't ignored

          el.style.pointerEvents = "foo";
          var supported = el.style.pointerEvents == "auto";
          el.style.pointerEvents = initial;
          return supported;
        }

        return false;
      },

      /**
       * Returns which Flexbox syntax is supported by the browser.
       * <code>display: box;</code> old 2009 version of Flexbox.
       * <code>display: flexbox;</code> tweener phase in 2011.
       * <code>display: flex;</code> current specification.
       * @internal
       * @return {String} <code>flex</code>,<code>flexbox</code>,<code>box</code> or <code>null</code>
       */
      getFlexboxSyntax: function getFlexboxSyntax() {
        var detectedSyntax = null;
        var detector = document.createElement("detect");
        var flexSyntax = [{
          value: "flex",
          syntax: "flex"
        }, {
          value: "-ms-flexbox",
          syntax: "flexbox"
        }, {
          value: "-webkit-flex",
          syntax: "flex"
        }];

        for (var i = 0; i < flexSyntax.length; i++) {
          // old IEs will throw an "Invalid argument" exception here
          try {
            detector.style.display = flexSyntax[i].value;
          } catch (ex) {
            return null;
          }

          if (detector.style.display === flexSyntax[i].value) {
            detectedSyntax = flexSyntax[i].syntax;
            break;
          }
        }

        detector = null;
        return detectedSyntax;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("css.textoverflow", statics.getTextOverflow);
      qx.core.Environment.add("css.placeholder", statics.getPlaceholder);
      qx.core.Environment.add("css.borderradius", statics.getBorderRadius);
      qx.core.Environment.add("css.boxshadow", statics.getBoxShadow);
      qx.core.Environment.add("css.gradient.linear", statics.getLinearGradient);
      qx.core.Environment.add("css.gradient.filter", statics.getFilterGradient);
      qx.core.Environment.add("css.gradient.radial", statics.getRadialGradient);
      qx.core.Environment.add("css.gradient.legacywebkit", statics.getLegacyWebkitGradient);
      qx.core.Environment.add("css.boxmodel", statics.getBoxModel);
      qx.core.Environment.add("css.rgba", statics.getRgba);
      qx.core.Environment.add("css.borderimage", statics.getBorderImage);
      qx.core.Environment.add("css.borderimage.standardsyntax", statics.getBorderImageSyntax);
      qx.core.Environment.add("css.usermodify", statics.getUserModify);
      qx.core.Environment.add("css.userselect", statics.getUserSelect);
      qx.core.Environment.add("css.userselect.none", statics.getUserSelectNone);
      qx.core.Environment.add("css.appearance", statics.getAppearance);
      qx.core.Environment.add("css.float", statics.getFloat);
      qx.core.Environment.add("css.boxsizing", statics.getBoxSizing);
      qx.core.Environment.add("css.inlineblock", statics.getInlineBlock);
      qx.core.Environment.add("css.opacity", statics.getOpacity);
      qx.core.Environment.add("css.textShadow", statics.getTextShadow);
      qx.core.Environment.add("css.textShadow.filter", statics.getFilterTextShadow);
      qx.core.Environment.add("css.alphaimageloaderneeded", statics.getAlphaImageLoaderNeeded);
      qx.core.Environment.add("css.pointerevents", statics.getPointerEvents);
      qx.core.Environment.add("css.flexboxSyntax", statics.getFlexboxSyntax);
    }
  });
  qx.bom.client.Css.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.normalize.String": {
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Style": {}
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
   * Contains methods to control and query the element's clip property
   *
   * @require(qx.lang.normalize.String)
   */
  qx.Bootstrap.define("qx.bom.element.Clip", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Compiles the given clipping into a CSS compatible string. This
       * is a simple square which describes the visible area of an DOM element.
       * Changing the clipping does not change the dimensions of
       * an element.
       *
       * @param map {Map}  Map which contains <code>left</code>, <code>top</code>
       *   <code>width</code> and <code>height</code> of the clipped area.
       * @return {String} CSS compatible string
       */
      compile: function compile(map) {
        if (!map) {
          return "clip:auto;";
        }

        var left = map.left;
        var top = map.top;
        var width = map.width;
        var height = map.height;
        var right, bottom;

        if (left == null) {
          right = width == null ? "auto" : width + "px";
          left = "auto";
        } else {
          right = width == null ? "auto" : left + width + "px";
          left = left + "px";
        }

        if (top == null) {
          bottom = height == null ? "auto" : height + "px";
          top = "auto";
        } else {
          bottom = height == null ? "auto" : top + height + "px";
          top = top + "px";
        }

        return "clip:rect(" + top + "," + right + "," + bottom + "," + left + ");";
      },

      /**
       * Gets the clipping of the given element.
       *
       * @param element {Element} DOM element to query
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {Map} Map which contains <code>left</code>, <code>top</code>
       *   <code>width</code> and <code>height</code> of the clipped area.
       *   Each one could be null or any integer value.
       */
      get: function get(element, mode) {
        var clip = qx.bom.element.Style.get(element, "clip", mode, false);
        var left, top, width, height;
        var right, bottom;

        if (typeof clip === "string" && clip !== "auto" && clip !== "") {
          clip = clip.trim(); // Do not use "global" here. This will break Firefox because of
          // an issue that the lastIndex will not be reset on separate calls.

          if (/\((.*)\)/.test(clip)) {
            var result = RegExp.$1; // Process result
            // Some browsers store values space-separated, others comma-separated.
            // Handle both cases by means of feature-detection.

            if (/,/.test(result)) {
              var split = result.split(",");
            } else {
              var split = result.split(" ");
            }

            top = split[0].trim();
            right = split[1].trim();
            bottom = split[2].trim();
            left = split[3].trim(); // Normalize "auto" to null

            if (left === "auto") {
              left = null;
            }

            if (top === "auto") {
              top = null;
            }

            if (right === "auto") {
              right = null;
            }

            if (bottom === "auto") {
              bottom = null;
            } // Convert to integer values


            if (top != null) {
              top = parseInt(top, 10);
            }

            if (right != null) {
              right = parseInt(right, 10);
            }

            if (bottom != null) {
              bottom = parseInt(bottom, 10);
            }

            if (left != null) {
              left = parseInt(left, 10);
            } // Compute width and height


            if (right != null && left != null) {
              width = right - left;
            } else if (right != null) {
              width = right;
            }

            if (bottom != null && top != null) {
              height = bottom - top;
            } else if (bottom != null) {
              height = bottom;
            }
          } else {
            throw new Error("Could not parse clip string: " + clip);
          }
        } // Return map when any value is available.


        return {
          left: left || null,
          top: top || null,
          width: width || null,
          height: height || null
        };
      },

      /**
       * Sets the clipping of the given element. This is a simple
       * square which describes the visible area of an DOM element.
       * Changing the clipping does not change the dimensions of
       * an element.
       *
       * @param element {Element} DOM element to modify
       * @param map {Map} A map with one or more of these available keys:
       *   <code>left</code>, <code>top</code>, <code>width</code>, <code>height</code>.
       */
      set: function set(element, map) {
        if (!map) {
          element.style.clip = "rect(auto,auto,auto,auto)";
          return;
        }

        var left = map.left;
        var top = map.top;
        var width = map.width;
        var height = map.height;
        var right, bottom;

        if (left == null) {
          right = width == null ? "auto" : width + "px";
          left = "auto";
        } else {
          right = width == null ? "auto" : left + width + "px";
          left = left + "px";
        }

        if (top == null) {
          bottom = height == null ? "auto" : height + "px";
          top = "auto";
        } else {
          bottom = height == null ? "auto" : top + height + "px";
          top = top + "px";
        }

        element.style.clip = "rect(" + top + "," + right + "," + bottom + "," + left + ")";
      },

      /**
       * Resets the clipping of the given DOM element.
       *
       * @param element {Element} DOM element to modify
       */
      reset: function reset(element) {
        element.style.clip = "rect(auto, auto, auto, auto)";
      }
    }
  });
  qx.bom.element.Clip.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Style": {},
      "qx.bom.client.Engine": {
        "defer": "runtime"
      },
      "qx.bom.client.Browser": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.quirksmode": {
          "defer": true,
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
  
  ************************************************************************ */

  /**
   * Contains methods to control and query the element's cursor property
   */
  qx.Bootstrap.define("qx.bom.element.Cursor", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Internal helper structure to map cursor values to supported ones */
      __map: {},

      /**
       * Compiles the given cursor into a CSS compatible string.
       *
       * @param cursor {String} Valid CSS cursor name
       * @return {String} CSS string
       */
      compile: function compile(cursor) {
        return "cursor:" + (this.__map[cursor] || cursor) + ";";
      },

      /**
       * Returns the computed cursor style for the given element.
       *
       * @param element {Element} The element to query
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {String} Computed cursor value of the given element.
       */
      get: function get(element, mode) {
        return qx.bom.element.Style.get(element, "cursor", mode, false);
      },

      /**
       * Applies a new cursor style to the given element
       *
       * @param element {Element} The element to modify
       * @param value {String} New cursor value to set
       */
      set: function set(element, value) {
        element.style.cursor = this.__map[value] || value;
      },

      /**
       * Removes the local cursor style applied to the element
       *
       * @param element {Element} The element to modify
       */
      reset: function reset(element) {
        element.style.cursor = "";
      }
    },
    defer: function defer(statics) {
      // < IE 9
      if (qx.core.Environment.get("engine.name") == "mshtml" && (parseFloat(qx.core.Environment.get("engine.version")) < 9 || qx.core.Environment.get("browser.documentmode") < 9) && !qx.core.Environment.get("browser.quirksmode")) {
        statics.__map["nesw-resize"] = "ne-resize";
        statics.__map["nwse-resize"] = "nw-resize";
      }
    }
  });
  qx.bom.element.Cursor.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Css": {},
      "qx.bom.element.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "css.opacity": {
          "className": "qx.bom.client.Css"
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
       * Christian Hagendorn (chris_schmidt)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Cross-browser opacity support.
   *
   * Optimized for animations (contains workarounds for typical flickering
   * in some browsers). Reduced class dependencies for optimal size and
   * performance.
   */
  qx.Bootstrap.define("qx.bom.element.Opacity", {
    statics: {
      /**
       * Compiles the given opacity value into a cross-browser CSS string.
       * Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @signature function(opacity)
       * @param opacity {Float} A float number between 0 and 1
       * @return {String} CSS compatible string
       */
      compile: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(opacity) {
          if (opacity >= 1) {
            opacity = 1;
          }

          if (opacity < 0.00001) {
            opacity = 0;
          }

          if (qx.core.Environment.get("css.opacity")) {
            return "opacity:" + opacity + ";";
          } else {
            return "zoom:1;filter:alpha(opacity=" + opacity * 100 + ");";
          }
        },
        "default": function _default(opacity) {
          return "opacity:" + opacity + ";";
        }
      }),

      /**
       * Sets opacity of given element. Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @param element {Element} DOM element to modify
       * @param opacity {Float} A float number between 0 and 1
       * @signature function(element, opacity)
       */
      set: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element, opacity) {
          if (qx.core.Environment.get("css.opacity")) {
            element.style.opacity = opacity;
          } else {
            // Read in computed filter
            var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false);

            if (opacity >= 1) {
              opacity = 1;
            }

            if (opacity < 0.00001) {
              opacity = 0;
            } // IE has trouble with opacity if it does not have layout (hasLayout)
            // Force it by setting the zoom level


            if (!element.currentStyle || !element.currentStyle.hasLayout) {
              element.style.zoom = 1;
            } // Remove old alpha filter and add new one


            element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "") + "alpha(opacity=" + opacity * 100 + ")";
          }
        },
        "default": function _default(element, opacity) {
          element.style.opacity = opacity;
        }
      }),

      /**
       * Resets opacity of given element.
       *
       * @param element {Element} DOM element to modify
       * @signature function(element)
       */
      reset: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element) {
          if (qx.core.Environment.get("css.opacity")) {
            element.style.opacity = "";
          } else {
            // Read in computed filter
            var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false); // Remove old alpha filter

            element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "");
          }
        },
        "default": function _default(element) {
          element.style.opacity = "";
        }
      }),

      /**
       * Gets computed opacity of given element. Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @param element {Element} DOM element to modify
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {Float} A float number between 0 and 1
       * @signature function(element, mode)
       */
      get: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(element, mode) {
          if (qx.core.Environment.get("css.opacity")) {
            var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);

            if (opacity != null) {
              return parseFloat(opacity);
            }

            return 1.0;
          } else {
            var filter = qx.bom.element.Style.get(element, "filter", mode, false);

            if (filter) {
              var opacity = filter.match(/alpha\(opacity=(.*)\)/);

              if (opacity && opacity[1]) {
                return parseFloat(opacity[1]) / 100;
              }
            }

            return 1.0;
          }
        },
        "default": function _default(element, mode) {
          var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);

          if (opacity != null) {
            return parseFloat(opacity);
          }

          return 1.0;
        }
      })
    }
  });
  qx.bom.element.Opacity.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Css": {},
      "qx.bom.Style": {},
      "qx.log.Logger": {},
      "qx.bom.element.Style": {},
      "qx.bom.Document": {},
      "qx.dom.Node": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxsizing": {
          "className": "qx.bom.client.Css"
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
  
  ************************************************************************ */

  /**
   * Contains methods to control and query the element's box-sizing property.
   *
   * Supported values:
   *
   * * "content-box" = W3C model (dimensions are content specific)
   * * "border-box" = Microsoft model (dimensions are box specific incl. border and padding)
   */
  qx.Bootstrap.define("qx.bom.element.BoxSizing", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} Internal data structure for __usesNativeBorderBox() */
      __nativeBorderBox: {
        tags: {
          button: true,
          select: true
        },
        types: {
          search: true,
          button: true,
          submit: true,
          reset: true,
          checkbox: true,
          radio: true
        }
      },

      /**
       * Whether the given elements defaults to the "border-box" Microsoft model in all cases.
       *
       * @param element {Element} DOM element to query
       * @return {Boolean} true when the element uses "border-box" independently from the doctype
       */
      __usesNativeBorderBox: function __usesNativeBorderBox(element) {
        var map = this.__nativeBorderBox;
        return map.tags[element.tagName.toLowerCase()] || map.types[element.type];
      },

      /**
       * Compiles the given box sizing into a CSS compatible string.
       *
       * @param value {String} Valid CSS box-sizing value
       * @return {String} CSS string
       */
      compile: function compile(value) {
        if (qx.core.Environment.get("css.boxsizing")) {
          var prop = qx.bom.Style.getCssName(qx.core.Environment.get("css.boxsizing"));
          return prop + ":" + value + ";";
        } else {
          {
            qx.log.Logger.warn(this, "This client does not support dynamic modification of the boxSizing property.");
            qx.log.Logger.trace();
          }
        }
      },

      /**
       * Returns the box sizing for the given element.
       *
       * @param element {Element} The element to query
       * @return {String} Box sizing value of the given element.
       */
      get: function get(element) {
        if (qx.core.Environment.get("css.boxsizing")) {
          return qx.bom.element.Style.get(element, "boxSizing", null, false) || "";
        }

        if (qx.bom.Document.isStandardMode(qx.dom.Node.getWindow(element))) {
          if (!this.__usesNativeBorderBox(element)) {
            return "content-box";
          }
        }

        return "border-box";
      },

      /**
       * Applies a new box sizing to the given element
       *
       * @param element {Element} The element to modify
       * @param value {String} New box sizing value to set
       */
      set: function set(element, value) {
        if (qx.core.Environment.get("css.boxsizing")) {
          // IE8 bombs when trying to apply an unsupported value
          try {
            element.style[qx.core.Environment.get("css.boxsizing")] = value;
          } catch (ex) {
            {
              qx.log.Logger.warn(this, "This client does not support the boxSizing value", value);
            }
          }
        } else {
          {
            qx.log.Logger.warn(this, "This client does not support dynamic modification of the boxSizing property.");
          }
        }
      },

      /**
       * Removes the local box sizing applied to the element
       *
       * @param element {Element} The element to modify
       */
      reset: function reset(element) {
        this.set(element, "");
      }
    }
  });
  qx.bom.element.BoxSizing.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.String": {
        "require": true,
        "defer": "runtime"
      },
      "qx.bom.client.Css": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Object": {},
      "qx.bom.Style": {},
      "qx.bom.element.Clip": {
        "require": true
      },
      "qx.bom.element.Cursor": {
        "require": true
      },
      "qx.bom.element.Opacity": {
        "require": true
      },
      "qx.bom.element.BoxSizing": {
        "require": true
      },
      "qx.core.Assert": {},
      "qx.dom.Node": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.appearance": {
          "className": "qx.bom.client.Css"
        },
        "css.userselect": {
          "className": "qx.bom.client.Css"
        },
        "css.textoverflow": {
          "className": "qx.bom.client.Css"
        },
        "css.borderimage": {
          "className": "qx.bom.client.Css"
        },
        "css.float": {
          "className": "qx.bom.client.Css"
        },
        "css.usermodify": {
          "className": "qx.bom.client.Css"
        },
        "css.boxsizing": {
          "className": "qx.bom.client.Css"
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Style querying and modification of HTML elements.
   *
   * Automatically normalizes cross-browser differences for setting and reading
   * CSS attributes. Optimized for performance.
   *
   * @require(qx.lang.String)
   * @require(qx.bom.client.Css)
  
   * @require(qx.bom.element.Clip#set)
   * @require(qx.bom.element.Cursor#set)
   * @require(qx.bom.element.Opacity#set)
   * @require(qx.bom.element.BoxSizing#set)
  
   * @require(qx.bom.element.Clip#get)
   * @require(qx.bom.element.Cursor#get)
   * @require(qx.bom.element.Opacity#get)
   * @require(qx.bom.element.BoxSizing#get)
  
   * @require(qx.bom.element.Clip#reset)
   * @require(qx.bom.element.Cursor#reset)
   * @require(qx.bom.element.Opacity#reset)
   * @require(qx.bom.element.BoxSizing#reset)
  
   * @require(qx.bom.element.Clip#compile)
   * @require(qx.bom.element.Cursor#compile)
   * @require(qx.bom.element.Opacity#compile)
   * @require(qx.bom.element.BoxSizing#compile)
   */
  qx.Bootstrap.define("qx.bom.element.Style", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      __styleNames: null,
      __cssNames: null,

      /**
       * Detect vendor specific properties.
       */
      __detectVendorProperties: function __detectVendorProperties() {
        var styleNames = {
          "appearance": qx.core.Environment.get("css.appearance"),
          "userSelect": qx.core.Environment.get("css.userselect"),
          "textOverflow": qx.core.Environment.get("css.textoverflow"),
          "borderImage": qx.core.Environment.get("css.borderimage"),
          "float": qx.core.Environment.get("css.float"),
          "userModify": qx.core.Environment.get("css.usermodify"),
          "boxSizing": qx.core.Environment.get("css.boxsizing")
        };
        this.__cssNames = {};

        for (var key in qx.lang.Object.clone(styleNames)) {
          if (!styleNames[key]) {
            delete styleNames[key];
          } else {
            if (key === 'float') {
              this.__cssNames['cssFloat'] = key;
            } else {
              this.__cssNames[key] = qx.bom.Style.getCssName(styleNames[key]);
            }
          }
        }

        this.__styleNames = styleNames;
      },

      /**
       * Gets the (possibly vendor-prefixed) name of a style property and stores
       * it to avoid multiple checks.
       *
       * @param name {String} Style property name to check
       * @return {String|null} The client-specific name of the property, or
       * <code>null</code> if it's not supported.
       */
      __getStyleName: function __getStyleName(name) {
        var styleName = qx.bom.Style.getPropertyName(name);

        if (styleName) {
          this.__styleNames[name] = styleName;
        }

        return styleName;
      },

      /**
       * Mshtml has proprietary pixel* properties for locations and dimensions
       * which return the pixel value. Used by getComputed() in mshtml variant.
       *
       * @internal
       */
      __mshtmlPixel: {
        width: "pixelWidth",
        height: "pixelHeight",
        left: "pixelLeft",
        right: "pixelRight",
        top: "pixelTop",
        bottom: "pixelBottom"
      },

      /**
       * Whether a special class is available for the processing of this style.
       *
       * @internal
       */
      __special: {
        clip: qx.bom.element.Clip,
        cursor: qx.bom.element.Cursor,
        opacity: qx.bom.element.Opacity,
        boxSizing: qx.bom.element.BoxSizing
      },

      /*
      ---------------------------------------------------------------------------
        COMPILE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Compiles the given styles into a string which can be used to
       * concat a HTML string for innerHTML usage.
       *
       * @param map {Map} Map of style properties to compile
       * @return {String} Compiled string of given style properties.
       */
      compile: function compile(map) {
        var html = [];
        var special = this.__special;
        var cssNames = this.__cssNames;
        var name, value;

        for (name in map) {
          // read value
          value = map[name];

          if (value == null) {
            continue;
          } // normalize name


          name = this.__cssNames[name] || name; // process special properties

          if (special[name]) {
            html.push(special[name].compile(value));
          } else {
            if (!cssNames[name]) {
              cssNames[name] = qx.bom.Style.getCssName(name);
            }

            html.push(cssNames[name], ":", value === "" ? "\"\"" : value, ";");
          }
        }

        return html.join("");
      },

      /*
      ---------------------------------------------------------------------------
        CSS TEXT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Set the full CSS content of the style attribute
       *
       * @param element {Element} The DOM element to modify
       * @param value {String} The full CSS string
       */
      setCss: function setCss(element, value) {
        element.setAttribute("style", value);
      },

      /**
       * Returns the full content of the style attribute.
       *
       * @param element {Element} The DOM element to query
       * @return {String} the full CSS string
       * @signature function(element)
       */
      getCss: function getCss(element) {
        return element.getAttribute("style");
      },

      /*
      ---------------------------------------------------------------------------
        STYLE ATTRIBUTE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Checks whether the browser supports the given CSS property.
       *
       * @param propertyName {String} The name of the property
       * @return {Boolean} Whether the property id supported
       */
      isPropertySupported: function isPropertySupported(propertyName) {
        return this.__special[propertyName] || this.__styleNames[propertyName] || propertyName in document.documentElement.style;
      },

      /** @type {Integer} Computed value of a style property. Compared to the cascaded style,
       * this one also interprets the values e.g. translates <code>em</code> units to
       * <code>px</code>.
       */
      COMPUTED_MODE: 1,

      /** @type {Integer} Cascaded value of a style property. */
      CASCADED_MODE: 2,

      /**
       * @type {Integer} Local value of a style property. Ignores inheritance cascade.
       *   Does not interpret values.
       */
      LOCAL_MODE: 3,

      /**
       * Sets the value of a style property
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param value {var} The value for the given style
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      set: function set(element, name, value, smart) {
        {
          qx.core.Assert.assertElement(element, "Invalid argument 'element'");
          qx.core.Assert.assertString(name, "Invalid argument 'name'");

          if (smart !== undefined) {
            qx.core.Assert.assertBoolean(smart, "Invalid argument 'smart'");
          }
        } // normalize name

        name = this.__styleNames[name] || this.__getStyleName(name) || name; // special handling for specific properties
        // through this good working switch this part costs nothing when
        // processing non-smart properties

        if (smart !== false && this.__special[name]) {
          this.__special[name].set(element, value);
        } else {
          element.style[name] = value !== null ? value : "";
        }
      },

      /**
       * Convenience method to modify a set of styles at once.
       *
       * @param element {Element} The DOM element to modify
       * @param styles {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      setStyles: function setStyles(element, styles, smart) {
        {
          qx.core.Assert.assertElement(element, "Invalid argument 'element'");
          qx.core.Assert.assertMap(styles, "Invalid argument 'styles'");

          if (smart !== undefined) {
            qx.core.Assert.assertBoolean(smart, "Invalid argument 'smart'");
          }
        } // inline calls to "set" and "reset" because this method is very
        // performance critical!

        var styleNames = this.__styleNames;
        var special = this.__special;
        var style = element.style;

        for (var key in styles) {
          var value = styles[key];
          var name = styleNames[key] || this.__getStyleName(key) || key;

          if (value === undefined) {
            if (smart !== false && special[name]) {
              special[name].reset(element);
            } else {
              style[name] = "";
            }
          } else {
            if (smart !== false && special[name]) {
              special[name].set(element, value);
            } else {
              style[name] = value !== null ? value : "";
            }
          }
        }
      },

      /**
       * Resets the value of a style property
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      reset: function reset(element, name, smart) {
        // normalize name
        name = this.__styleNames[name] || this.__getStyleName(name) || name; // special handling for specific properties

        if (smart !== false && this.__special[name]) {
          this.__special[name].reset(element);
        } else {
          element.style[name] = "";
        }
      },

      /**
       * Gets the value of a style property.
       *
       * *Computed*
       *
       * Returns the computed value of a style property. Compared to the cascaded style,
       * this one also interprets the values e.g. translates <code>em</code> units to
       * <code>px</code>.
       *
       * *Cascaded*
       *
       * Returns the cascaded value of a style property.
       *
       * *Local*
       *
       * Ignores inheritance cascade. Does not interpret values.
       *
       * @signature function(element, name, mode, smart)
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param mode {Number} Choose one of the modes {@link #COMPUTED_MODE}, {@link #CASCADED_MODE},
       *   {@link #LOCAL_MODE}. The computed mode is the default one.
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       * @return {var} The value of the property
       */
      get: function get(element, name, mode, smart) {
        // normalize name
        name = this.__styleNames[name] || this.__getStyleName(name) || name; // special handling

        if (smart !== false && this.__special[name]) {
          return this.__special[name].get(element, mode);
        } // switch to right mode


        switch (mode) {
          case this.LOCAL_MODE:
            return element.style[name] || "";

          case this.CASCADED_MODE:
            // Currently only supported by Opera and Internet Explorer
            if (element.currentStyle) {
              return element.currentStyle[name] || "";
            }

            throw new Error("Cascaded styles are not supported in this browser!");

          default:
            // Opera, Mozilla and Safari 3+ also have a global getComputedStyle which is identical
            // to the one found under document.defaultView.
            // The problem with this is however that this does not work correctly
            // when working with frames and access an element of another frame.
            // Then we must use the <code>getComputedStyle</code> of the document
            // where the element is defined.
            var doc = qx.dom.Node.getDocument(element);
            var getStyle = doc.defaultView ? doc.defaultView.getComputedStyle : undefined;

            if (getStyle !== undefined) {
              // Support for the DOM2 getComputedStyle method
              //
              // Safari >= 3 & Gecko > 1.4 expose all properties to the returned
              // CSSStyleDeclaration object. In older browsers the function
              // "getPropertyValue" is needed to access the values.
              //
              // On a computed style object all properties are read-only which is
              // identical to the behavior of MSHTML's "currentStyle".
              var computed = getStyle(element, null); // All relevant browsers expose the configured style properties to
              // the CSSStyleDeclaration objects

              if (computed && computed[name]) {
                return computed[name];
              }
            } else {
              // if the element is not inserted into the document "currentStyle"
              // may be undefined. In this case always return the local style.
              if (!element.currentStyle) {
                return element.style[name] || "";
              } // Read cascaded style. Shorthand properties like "border" are not available
              // on the currentStyle object.


              var currentStyle = element.currentStyle[name] || element.style[name] || ""; // Pixel values are always OK

              if (/^-?[\.\d]+(px)?$/i.test(currentStyle)) {
                return currentStyle;
              } // Try to convert non-pixel values


              var pixel = this.__mshtmlPixel[name];

              if (pixel && pixel in element.style) {
                // Backup local and runtime style
                var localStyle = element.style[name]; // Overwrite local value with cascaded value
                // This is needed to have the pixel value setup

                element.style[name] = currentStyle || 0; // Read pixel value and add "px"

                var value = element.style[pixel] + "px"; // Recover old local value

                element.style[name] = localStyle; // Return value

                return value;
              } // Just the current style


              return currentStyle;
            }

            return element.style[name] || "";
        }
      }
    },
    defer: function defer(statics) {
      statics.__detectVendorProperties();
    }
  });
  qx.bom.element.Style.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.manager.Decoration": {}
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
   * Common set of utility methods used by the standard qooxdoo layouts.
   *
   * @internal
   */
  qx.Class.define("qx.ui.layout.Util", {
    statics: {
      /** @type {RegExp} Regular expression to match percent values */
      PERCENT_VALUE: /[0-9]+(?:\.[0-9]+)?%/,

      /**
       * Computes the flex offsets needed to reduce the space
       * difference as much as possible by respecting the
       * potential of the given elements (being in the range of
       * their min/max values)
       *
       * @param flexibles {Map} Each entry must have these keys:
       *   <code>id</code>, <code>potential</code> and <code>flex</code>.
       *   The ID is used in the result map as the key for the user to work
       *   with later (e.g. upgrade sizes etc. to respect the given offset)
       *   The potential is an integer value which is the difference of the
       *   currently interesting direction (e.g. shrinking=width-minWidth, growing=
       *   maxWidth-width). The flex key holds the flex value of the item.
       * @param avail {Integer} Full available space to allocate (ignoring used one)
       * @param used {Integer} Size of already allocated space
       * @return {Map} A map which contains the calculated offsets under the key
       *   which is identical to the ID given in the incoming map.
       */
      computeFlexOffsets: function computeFlexOffsets(flexibles, avail, used) {
        var child, key, flexSum, flexStep;
        var grow = avail > used;
        var remaining = Math.abs(avail - used);
        var roundingOffset, currentOffset; // Preprocess data

        var result = {};

        for (key in flexibles) {
          child = flexibles[key];
          result[key] = {
            potential: grow ? child.max - child.value : child.value - child.min,
            flex: grow ? child.flex : 1 / child.flex,
            offset: 0
          };
        } // Continue as long as we need to do anything


        while (remaining != 0) {
          // Find minimum potential for next correction
          flexStep = Infinity;
          flexSum = 0;

          for (key in result) {
            child = result[key];

            if (child.potential > 0) {
              flexSum += child.flex;
              flexStep = Math.min(flexStep, child.potential / child.flex);
            }
          } // No potential found, quit here


          if (flexSum == 0) {
            break;
          } // Respect maximum potential given through remaining space
          // The parent should always win in such conflicts.


          flexStep = Math.min(remaining, flexStep * flexSum) / flexSum; // Start with correction

          roundingOffset = 0;

          for (key in result) {
            child = result[key];

            if (child.potential > 0) {
              // Compute offset for this step
              currentOffset = Math.min(remaining, child.potential, Math.ceil(flexStep * child.flex)); // Fix rounding issues

              roundingOffset += currentOffset - flexStep * child.flex;

              if (roundingOffset >= 1) {
                roundingOffset -= 1;
                currentOffset -= 1;
              } // Update child status


              child.potential -= currentOffset;

              if (grow) {
                child.offset += currentOffset;
              } else {
                child.offset -= currentOffset;
              } // Update parent status


              remaining -= currentOffset;
            }
          }
        }

        return result;
      },

      /**
       * Computes the offset which needs to be added to the top position
       * to result in the stated vertical alignment. Also respects
       * existing margins (without collapsing).
       *
       * @param align {String} One of <code>top</code>, <code>center</code> or <code>bottom</code>.
       * @param width {Integer} The visible width of the widget
       * @param availWidth {Integer} The available inner width of the parent
       * @param marginLeft {Integer?0} Optional left margin of the widget
       * @param marginRight {Integer?0} Optional right margin of the widget
       * @return {Integer} Computed top coordinate
       */
      computeHorizontalAlignOffset: function computeHorizontalAlignOffset(align, width, availWidth, marginLeft, marginRight) {
        if (marginLeft == null) {
          marginLeft = 0;
        }

        if (marginRight == null) {
          marginRight = 0;
        }

        var value = 0;

        switch (align) {
          case "left":
            value = marginLeft;
            break;

          case "right":
            // Align right changes priority to right edge:
            // To align to the right is more important here than to left.
            value = availWidth - width - marginRight;
            break;

          case "center":
            // Ideal center position
            value = Math.round((availWidth - width) / 2); // Try to make this possible (with left-right priority)

            if (value < marginLeft) {
              value = marginLeft;
            } else if (value < marginRight) {
              value = Math.max(marginLeft, availWidth - width - marginRight);
            }

            break;
        }

        return value;
      },

      /**
       * Computes the offset which needs to be added to the top position
       * to result in the stated vertical alignment. Also respects
       * existing margins (without collapsing).
       *
       * @param align {String} One of <code>top</code>, <code>middle</code> or <code>bottom</code>.
       * @param height {Integer} The visible height of the widget
       * @param availHeight {Integer} The available inner height of the parent
       * @param marginTop {Integer?0} Optional top margin of the widget
       * @param marginBottom {Integer?0} Optional bottom margin of the widget
       * @return {Integer} Computed top coordinate
       */
      computeVerticalAlignOffset: function computeVerticalAlignOffset(align, height, availHeight, marginTop, marginBottom) {
        if (marginTop == null) {
          marginTop = 0;
        }

        if (marginBottom == null) {
          marginBottom = 0;
        }

        var value = 0;

        switch (align) {
          case "top":
            value = marginTop;
            break;

          case "bottom":
            // Align bottom changes priority to bottom edge:
            // To align to the bottom is more important here than to top.
            value = availHeight - height - marginBottom;
            break;

          case "middle":
            // Ideal middle position
            value = Math.round((availHeight - height) / 2); // Try to make this possible (with top-down priority)

            if (value < marginTop) {
              value = marginTop;
            } else if (value < marginBottom) {
              value = Math.max(marginTop, availHeight - height - marginBottom);
            }

            break;
        }

        return value;
      },

      /**
       * Collapses two margins.
       *
       * Supports positive and negative margins.
       * Collapsing find the largest positive and the largest
       * negative value. Afterwards the result is computed through the
       * subtraction of the negative from the positive value.
       *
       * @param varargs {arguments} Any number of configured margins
       * @return {Integer} The collapsed margin
       */
      collapseMargins: function collapseMargins(varargs) {
        var max = 0,
            min = 0;

        for (var i = 0, l = arguments.length; i < l; i++) {
          var value = arguments[i];

          if (value < 0) {
            min = Math.min(min, value);
          } else if (value > 0) {
            max = Math.max(max, value);
          }
        }

        return max + min;
      },

      /**
       * Computes the sum of all horizontal gaps. Normally the
       * result is used to compute the available width in a widget.
       *
       * The method optionally respects margin collapsing as well. In
       * this mode the spacing is collapsed together with the margins.
       *
       * @param children {Array} List of children
       * @param spacing {Integer?0} Spacing between every child
       * @param collapse {Boolean?false} Optional margin collapsing mode
       * @return {Integer} Sum of all gaps in the final layout.
       */
      computeHorizontalGaps: function computeHorizontalGaps(children, spacing, collapse) {
        if (spacing == null) {
          spacing = 0;
        }

        var gaps = 0;

        if (collapse) {
          // Add first child
          gaps += children[0].getMarginLeft();

          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += this.collapseMargins(spacing, children[i - 1].getMarginRight(), children[i].getMarginLeft());
          } // Add last child


          gaps += children[l - 1].getMarginRight();
        } else {
          // Simple adding of all margins
          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += children[i].getMarginLeft() + children[i].getMarginRight();
          } // Add spacing


          gaps += spacing * (l - 1);
        }

        return gaps;
      },

      /**
       * Computes the sum of all vertical gaps. Normally the
       * result is used to compute the available height in a widget.
       *
       * The method optionally respects margin collapsing as well. In
       * this mode the spacing is collapsed together with the margins.
       *
       * @param children {Array} List of children
       * @param spacing {Integer?0} Spacing between every child
       * @param collapse {Boolean?false} Optional margin collapsing mode
       * @return {Integer} Sum of all gaps in the final layout.
       */
      computeVerticalGaps: function computeVerticalGaps(children, spacing, collapse) {
        if (spacing == null) {
          spacing = 0;
        }

        var gaps = 0;

        if (collapse) {
          // Add first child
          gaps += children[0].getMarginTop();

          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += this.collapseMargins(spacing, children[i - 1].getMarginBottom(), children[i].getMarginTop());
          } // Add last child


          gaps += children[l - 1].getMarginBottom();
        } else {
          // Simple adding of all margins
          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += children[i].getMarginTop() + children[i].getMarginBottom();
          } // Add spacing


          gaps += spacing * (l - 1);
        }

        return gaps;
      },

      /**
       * Computes the gaps together with the configuration of separators.
       *
       * @param children {qx.ui.core.LayoutItem[]} List of children
       * @param spacing {Integer} Configured spacing
       * @param separator {String|qx.ui.decoration.IDecorator} Separator to render
       * @return {Integer} Sum of gaps
       */
      computeHorizontalSeparatorGaps: function computeHorizontalSeparatorGaps(children, spacing, separator) {
        var instance = qx.theme.manager.Decoration.getInstance().resolve(separator);
        var insets = instance.getInsets();
        var width = insets.left + insets.right;
        var gaps = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          gaps += child.getMarginLeft() + child.getMarginRight();
        }

        gaps += (spacing + width + spacing) * (l - 1);
        return gaps;
      },

      /**
       * Computes the gaps together with the configuration of separators.
       *
       * @param children {qx.ui.core.LayoutItem[]} List of children
       * @param spacing {Integer} Configured spacing
       * @param separator {String|qx.ui.decoration.IDecorator} Separator to render
       * @return {Integer} Sum of gaps
       */
      computeVerticalSeparatorGaps: function computeVerticalSeparatorGaps(children, spacing, separator) {
        var instance = qx.theme.manager.Decoration.getInstance().resolve(separator);
        var insets = instance.getInsets();
        var height = insets.top + insets.bottom;
        var gaps = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          gaps += child.getMarginTop() + child.getMarginBottom();
        }

        gaps += (spacing + height + spacing) * (l - 1);
        return gaps;
      },

      /**
       * Arranges two sizes in one box to best respect their individual limitations.
       *
       * Mainly used by split layouts (Split Panes) where the layout is mainly defined
       * by the outer dimensions.
       *
       * @param beginMin {Integer} Minimum size of first widget (from size hint)
       * @param beginIdeal {Integer} Ideal size of first widget (maybe after dragging the splitter)
       * @param beginMax {Integer} Maximum size of first widget (from size hint)
       * @param endMin {Integer} Minimum size of second widget (from size hint)
       * @param endIdeal {Integer} Ideal size of second widget (maybe after dragging the splitter)
       * @param endMax {Integer} Maximum size of second widget (from size hint)
       * @return {Map} Map with the keys <code>begin</code and <code>end</code> with the
       *   arranged dimensions.
       */
      arrangeIdeals: function arrangeIdeals(beginMin, beginIdeal, beginMax, endMin, endIdeal, endMax) {
        if (beginIdeal < beginMin || endIdeal < endMin) {
          if (beginIdeal < beginMin && endIdeal < endMin) {
            // Just increase both, can not rearrange them otherwise
            // Result into overflowing of the overlapping content
            // Should normally not happen through auto sizing!
            beginIdeal = beginMin;
            endIdeal = endMin;
          } else if (beginIdeal < beginMin) {
            // Reduce end, increase begin to min
            endIdeal -= beginMin - beginIdeal;
            beginIdeal = beginMin; // Re-check to keep min size of end

            if (endIdeal < endMin) {
              endIdeal = endMin;
            }
          } else if (endIdeal < endMin) {
            // Reduce begin, increase end to min
            beginIdeal -= endMin - endIdeal;
            endIdeal = endMin; // Re-check to keep min size of begin

            if (beginIdeal < beginMin) {
              beginIdeal = beginMin;
            }
          }
        }

        if (beginIdeal > beginMax || endIdeal > endMax) {
          if (beginIdeal > beginMax && endIdeal > endMax) {
            // Just reduce both, can not rearrange them otherwise
            // Leaves a blank area in the pane!
            beginIdeal = beginMax;
            endIdeal = endMax;
          } else if (beginIdeal > beginMax) {
            // Increase end, reduce begin to max
            endIdeal += beginIdeal - beginMax;
            beginIdeal = beginMax; // Re-check to keep max size of end

            if (endIdeal > endMax) {
              endIdeal = endMax;
            }
          } else if (endIdeal > endMax) {
            // Increase begin, reduce end to max
            beginIdeal += endIdeal - endMax;
            endIdeal = endMax; // Re-check to keep max size of begin

            if (beginIdeal > beginMax) {
              beginIdeal = beginMax;
            }
          }
        }

        return {
          begin: beginIdeal,
          end: endIdeal
        };
      }
    }
  });
  qx.ui.layout.Util.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-3.js.map
