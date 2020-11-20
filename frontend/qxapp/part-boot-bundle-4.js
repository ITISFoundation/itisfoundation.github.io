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
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["device.name", "device.touch", "device.type", "device.pixelRatio"],
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
   * The class is responsible for device detection. This is specially useful
   * if you are on a mobile device.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Device", {
    statics: {
      /** Maps user agent names to device IDs */
      __ids: {
        "Windows Phone": "iemobile",
        "iPod": "ipod",
        "iPad": "ipad",
        "iPhone": "iphone",
        "PSP": "psp",
        "PLAYSTATION 3": "ps3",
        "Nintendo Wii": "wii",
        "Nintendo DS": "ds",
        "XBOX": "xbox",
        "Xbox": "xbox"
      },

      /**
       * Returns the name of the current device if detectable. It falls back to
       * <code>pc</code> if the detection for other devices fails.
       *
       * @internal
       * @return {String} The string of the device found.
       */
      getName: function getName() {
        var str = [];

        for (var key in qx.bom.client.Device.__ids) {
          str.push(key);
        }

        var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
        var match = reg.exec(navigator.userAgent);

        if (match && match[1]) {
          return qx.bom.client.Device.__ids[match[1]];
        }

        return "pc";
      },

      /**
       * Determines on what type of device the application is running.
       * Valid values are: "mobile", "tablet" or "desktop".
       * @return {String} The device type name of determined device.
       */
      getType: function getType() {
        return qx.bom.client.Device.detectDeviceType(navigator.userAgent);
      },

      /**
       * Detects the device type, based on given userAgentString.
       *
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {String} The device type name of determined device: "mobile","desktop","tablet"
       */
      detectDeviceType: function detectDeviceType(userAgentString) {
        if (qx.bom.client.Device.detectTabletDevice(userAgentString)) {
          return "tablet";
        } else if (qx.bom.client.Device.detectMobileDevice(userAgentString)) {
          return "mobile";
        }

        return "desktop";
      },

      /**
       * Detects if a device is a mobile phone. (Tablets excluded.)
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {Boolean} Flag which indicates whether it is a mobile device.
       */
      detectMobileDevice: function detectMobileDevice(userAgentString) {
        return /android.+mobile|ip(hone|od)|bada\/|blackberry|BB10|maemo|opera m(ob|in)i|fennec|NetFront|phone|psp|symbian|IEMobile|windows (ce|phone)|xda/i.test(userAgentString);
      },

      /**
       * Detects if a device is a tablet device.
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {Boolean} Flag which indicates whether it is a tablet device.
       */
      detectTabletDevice: function detectTabletDevice(userAgentString) {
        var isIE10Tablet = /MSIE 10/i.test(userAgentString) && /ARM/i.test(userAgentString) && !/windows phone/i.test(userAgentString);
        var isCommonTablet = !/android.+mobile|Tablet PC/i.test(userAgentString) && /Android|ipad|tablet|playbook|silk|kindle|psp/i.test(userAgentString);
        return isIE10Tablet || isCommonTablet;
      },

      /**
       * Detects the device's pixel ratio. Returns 1 if detection is not possible.
       *
       * @return {Number} The device's pixel ratio
       */
      getDevicePixelRatio: function getDevicePixelRatio() {
        if (typeof window.devicePixelRatio !== "undefined") {
          return window.devicePixelRatio;
        }

        return 1;
      },

      /**
       * Detects if either touch events or pointer events are supported.
       * Additionally it checks if touch is enabled for pointer events.
       *
       * @return {Boolean} <code>true</code>, if the device supports touch
       */
      getTouch: function getTouch() {
        return "ontouchstart" in window || window.navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("device.name", statics.getName);
      qx.core.Environment.add("device.touch", statics.getTouch);
      qx.core.Environment.add("device.type", statics.getType);
      qx.core.Environment.add("device.pixelRatio", statics.getDevicePixelRatio);
    }
  });
  qx.bom.client.Device.$$dbClassInfo = $$dbClassInfo;
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
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.theme.manager.Meta": {
        "construct": true
      },
      "qx.util.PropertyUtil": {},
      "qx.ui.core.queue.Layout": {},
      "qx.core.Init": {},
      "qx.ui.core.queue.Visibility": {},
      "qx.lang.Object": {}
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
   * The base class of all items, which should be laid out using a layout manager
   * {@link qx.ui.layout.Abstract}.
   */
  qx.Class.define("qx.ui.core.LayoutItem", {
    type: "abstract",
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this); // dynamic theme switch

      {
        qx.theme.manager.Meta.getInstance().addListener("changeTheme", this._onChangeTheme, this);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        DIMENSION
      ---------------------------------------------------------------------------
      */

      /**
       * The user provided minimal width.
       *
       * Also take a look at the related properties {@link #width} and {@link #maxWidth}.
       */
      minWidth: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The <code>LayoutItem</code>'s preferred width.
       *
       * The computed width may differ from the given width due to
       * stretching. Also take a look at the related properties
       * {@link #minWidth} and {@link #maxWidth}.
       */
      width: {
        check: "Integer",
        event: "changeWidth",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided maximal width.
       *
       * Also take a look at the related properties {@link #width} and {@link #minWidth}.
       */
      maxWidth: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided minimal height.
       *
       * Also take a look at the related properties {@link #height} and {@link #maxHeight}.
       */
      minHeight: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The item's preferred height.
       *
       * The computed height may differ from the given height due to
       * stretching. Also take a look at the related properties
       * {@link #minHeight} and {@link #maxHeight}.
       */
      height: {
        check: "Integer",
        event: "changeHeight",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided maximum height.
       *
       * Also take a look at the related properties {@link #height} and {@link #minHeight}.
       */
      maxHeight: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        STRETCHING
      ---------------------------------------------------------------------------
      */

      /** Whether the item can grow horizontally. */
      allowGrowX: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can shrink horizontally. */
      allowShrinkX: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can grow vertically. */
      allowGrowY: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can shrink vertically. */
      allowShrinkY: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Growing and shrinking in the horizontal direction */
      allowStretchX: {
        group: ["allowGrowX", "allowShrinkX"],
        mode: "shorthand",
        themeable: true
      },

      /** Growing and shrinking in the vertical direction */
      allowStretchY: {
        group: ["allowGrowY", "allowShrinkY"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        MARGIN
      ---------------------------------------------------------------------------
      */

      /** Margin of the widget (top) */
      marginTop: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (right) */
      marginRight: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (bottom) */
      marginBottom: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (left) */
      marginLeft: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /**
       * The 'margin' property is a shorthand property for setting 'marginTop',
       * 'marginRight', 'marginBottom' and 'marginLeft' at the same time.
       *
       * If four values are specified they apply to top, right, bottom and left respectively.
       * If there is only one value, it applies to all sides, if there are two or three,
       * the missing values are taken from the opposite side.
       */
      margin: {
        group: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        ALIGN
      ---------------------------------------------------------------------------
      */

      /**
       * Horizontal alignment of the item in the parent layout.
       *
       * Note: Item alignment is only supported by {@link LayoutItem} layouts where
       * it would have a visual effect. Except for {@link Spacer}, which provides
       * blank space for layouts, all classes that inherit {@link LayoutItem} support alignment.
       */
      alignX: {
        check: ["left", "center", "right"],
        nullable: true,
        apply: "_applyAlign",
        themeable: true
      },

      /**
       * Vertical alignment of the item in the parent layout.
       *
       * Note: Item alignment is only supported by {@link LayoutItem} layouts where
       * it would have a visual effect. Except for {@link Spacer}, which provides
       * blank space for layouts, all classes that inherit {@link LayoutItem} support alignment.
       */
      alignY: {
        check: ["top", "middle", "bottom", "baseline"],
        nullable: true,
        apply: "_applyAlign",
        themeable: true
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
        DYNAMIC THEME SWITCH SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the dynamic theme change.
       * @signature function()
       */
      _onChangeTheme: function _onChangeTheme() {
        // reset all themeable properties
        var props = qx.util.PropertyUtil.getAllProperties(this.constructor);

        for (var name in props) {
          var desc = props[name]; // only themeable properties not having a user value

          if (desc.themeable) {
            var userValue = qx.util.PropertyUtil.getUserValue(this, name);

            if (userValue == null) {
              qx.util.PropertyUtil.resetThemed(this, name);
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT PROCESS
      ---------------------------------------------------------------------------
      */

      /** @type {Integer} The computed height */
      __computedHeightForWidth: null,

      /** @type {Map} The computed size of the layout item */
      __computedLayout: null,

      /** @type {Boolean} Whether the current layout is valid */
      __hasInvalidLayout: null,

      /** @type {Map} Cached size hint */
      __sizeHint: null,

      /** @type {Boolean} Whether the margins have changed and must be updated */
      __updateMargin: null,

      /** @type {Map} user provided bounds of the widget, which override the layout manager */
      __userBounds: null,

      /** @type {Map} The item's layout properties */
      __layoutProperties: null,

      /**
       * Get the computed location and dimension as computed by
       * the layout manager.
       *
       * @return {Map|null} The location and dimensions in pixel
       *    (if the layout is valid). Contains the keys
       *    <code>width</code>, <code>height</code>, <code>left</code> and
       *    <code>top</code>.
       */
      getBounds: function getBounds() {
        return this.__userBounds || this.__computedLayout || null;
      },

      /**
       * Reconfigure number of separators
       */
      clearSeparators: function clearSeparators() {// empty template
      },

      /**
       * Renders a separator between two children
       *
       * @param separator {String|qx.ui.decoration.IDecorator} The separator to render
       * @param bounds {Map} Contains the left and top coordinate and the width and height
       *    of the separator to render.
       */
      renderSeparator: function renderSeparator(separator, bounds) {// empty template
      },

      /**
       * Used by the layout engine to apply coordinates and dimensions.
       *
       * @param left {Integer} Any integer value for the left position,
       *   always in pixels
       * @param top {Integer} Any integer value for the top position,
       *   always in pixels
       * @param width {Integer} Any positive integer value for the width,
       *   always in pixels
       * @param height {Integer} Any positive integer value for the height,
       *   always in pixels
       * @return {Map} A map of which layout sizes changed.
       */
      renderLayout: function renderLayout(left, top, width, height) {
        // do not render if the layout item is already disposed
        if (this.isDisposed()) {
          return null;
        }

        {
          var msg = "Something went wrong with the layout of " + this.toString() + "!";
          this.assertInteger(left, "Wrong 'left' argument. " + msg);
          this.assertInteger(top, "Wrong 'top' argument. " + msg);
          this.assertInteger(width, "Wrong 'width' argument. " + msg);
          this.assertInteger(height, "Wrong 'height' argument. " + msg); // this.assertInRange(width, this.getMinWidth() || -1, this.getMaxWidth() || 32000);
          // this.assertInRange(height, this.getMinHeight() || -1, this.getMaxHeight() || 32000);
        } // Height for width support
        // Results into a relayout which means that width/height is applied in the next iteration.

        var flowHeight = null;

        if (this.getHeight() == null && this._hasHeightForWidth()) {
          var flowHeight = this._getHeightForWidth(width);
        }

        if (flowHeight != null && flowHeight !== this.__computedHeightForWidth) {
          // This variable is used in the next computation of the size hint
          this.__computedHeightForWidth = flowHeight; // Re-add to layout queue

          qx.ui.core.queue.Layout.add(this);
          return null;
        } // Detect size changes
        // Dynamically create data structure for computed layout


        var computed = this.__computedLayout;

        if (!computed) {
          computed = this.__computedLayout = {};
        } // Detect changes


        var changes = {};

        if (left !== computed.left || top !== computed.top) {
          changes.position = true;
          computed.left = left;
          computed.top = top;
        }

        if (width !== computed.width || height !== computed.height) {
          changes.size = true;
          computed.width = width;
          computed.height = height;
        } // Clear invalidation marker


        if (this.__hasInvalidLayout) {
          changes.local = true;
          delete this.__hasInvalidLayout;
        }

        if (this.__updateMargin) {
          changes.margin = true;
          delete this.__updateMargin;
        } // Returns changes, especially for deriving classes


        return changes;
      },

      /**
       * Whether the item should be excluded from the layout
       *
       * @return {Boolean} Should the item be excluded by the layout
       */
      isExcluded: function isExcluded() {
        return false;
      },

      /**
       * Whether the layout of this item (to layout the children)
       * is valid.
       *
       * @return {Boolean} Returns <code>true</code>
       */
      hasValidLayout: function hasValidLayout() {
        return !this.__hasInvalidLayout;
      },

      /**
       * Indicate that the item has layout changes and propagate this information
       * up the item hierarchy.
       *
       */
      scheduleLayoutUpdate: function scheduleLayoutUpdate() {
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Called by the layout manager to mark this item's layout as invalid.
       * This function should clear all layout relevant caches.
       */
      invalidateLayoutCache: function invalidateLayoutCache() {
        // this.debug("Mark layout invalid!");
        this.__hasInvalidLayout = true;
        this.__sizeHint = null;
      },

      /**
       * A size hint computes the dimensions of a widget. It returns
       * the recommended dimensions as well as the min and max dimensions.
       * The min and max values already respect the stretching properties.
       *
       * <h3>Wording</h3>
       * <ul>
       * <li>User value: Value defined by the widget user, using the size properties</li>
       *
       * <li>Layout value: The value computed by {@link qx.ui.core.Widget#_getContentHint}</li>
       * </ul>
       *
       * <h3>Algorithm</h3>
       * <ul>
       * <li>minSize: If the user min size is not null, the user value is taken,
       *     otherwise the layout value is used.</li>
       *
       * <li>(preferred) size: If the user value is not null the user value is used,
       *     otherwise the layout value is used.</li>
       *
       * <li>max size: Same as the preferred size.</li>
       * </ul>
       *
       * @param compute {Boolean?true} Automatically compute size hint if currently not
       *   cached?
       * @return {Map} The map with the preferred width/height and the allowed
       *   minimum and maximum values in cases where shrinking or growing
       *   is required.
       */
      getSizeHint: function getSizeHint(compute) {
        var hint = this.__sizeHint;

        if (hint) {
          return hint;
        }

        if (compute === false) {
          return null;
        } // Compute as defined


        hint = this.__sizeHint = this._computeSizeHint(); // Respect height for width

        if (this._hasHeightForWidth() && this.__computedHeightForWidth && this.getHeight() == null) {
          hint.height = this.__computedHeightForWidth;
        } // normalize width


        if (hint.minWidth > hint.width) {
          hint.width = hint.minWidth;
        }

        if (hint.maxWidth < hint.width) {
          hint.width = hint.maxWidth;
        }

        if (!this.getAllowGrowX()) {
          hint.maxWidth = hint.width;
        }

        if (!this.getAllowShrinkX()) {
          hint.minWidth = hint.width;
        } // normalize height


        if (hint.minHeight > hint.height) {
          hint.height = hint.minHeight;
        }

        if (hint.maxHeight < hint.height) {
          hint.height = hint.maxHeight;
        }

        if (!this.getAllowGrowY()) {
          hint.maxHeight = hint.height;
        }

        if (!this.getAllowShrinkY()) {
          hint.minHeight = hint.height;
        } // Finally return


        return hint;
      },

      /**
       * Computes the size hint of the layout item.
       *
       * @return {Map} The map with the preferred width/height and the allowed
       *   minimum and maximum values.
       */
      _computeSizeHint: function _computeSizeHint() {
        var minWidth = this.getMinWidth() || 0;
        var minHeight = this.getMinHeight() || 0;
        var width = this.getWidth() || minWidth;
        var height = this.getHeight() || minHeight;
        var maxWidth = this.getMaxWidth() || Infinity;
        var maxHeight = this.getMaxHeight() || Infinity;
        return {
          minWidth: minWidth,
          width: width,
          maxWidth: maxWidth,
          minHeight: minHeight,
          height: height,
          maxHeight: maxHeight
        };
      },

      /**
       * Whether the item supports height for width.
       *
       * @return {Boolean} Whether the item supports height for width
       */
      _hasHeightForWidth: function _hasHeightForWidth() {
        var layout = this._getLayout();

        if (layout) {
          return layout.hasHeightForWidth();
        }

        return false;
      },

      /**
       * If an item wants to trade height for width it has to implement this
       * method and return the preferred height of the item if it is resized to
       * the given width. This function returns <code>null</code> if the item
       * do not support height for width.
       *
       * @param width {Integer} The computed width
       * @return {Integer} The desired height
       */
      _getHeightForWidth: function _getHeightForWidth(width) {
        var layout = this._getLayout();

        if (layout && layout.hasHeightForWidth()) {
          return layout.getHeightForWidth(width);
        }

        return null;
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      _getLayout: function _getLayout() {
        return null;
      },
      // property apply
      _applyMargin: function _applyMargin() {
        this.__updateMargin = true;
        var parent = this.$$parent;

        if (parent) {
          parent.updateLayoutProperties();
        }
      },
      // property apply
      _applyAlign: function _applyAlign() {
        var parent = this.$$parent;

        if (parent) {
          parent.updateLayoutProperties();
        }
      },
      // property apply
      _applyDimension: function _applyDimension() {
        qx.ui.core.queue.Layout.add(this);
      },
      // property apply
      _applyStretching: function _applyStretching() {
        qx.ui.core.queue.Layout.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        SUPPORT FOR USER BOUNDARIES
      ---------------------------------------------------------------------------
      */

      /**
       * Whether user bounds are set on this layout item
       *
       * @return {Boolean} Whether user bounds are set on this layout item
       */
      hasUserBounds: function hasUserBounds() {
        return !!this.__userBounds;
      },

      /**
       * Set user bounds of the widget. Widgets with user bounds are sized and
       * positioned manually and are ignored by any layout manager.
       *
       * @param left {Integer} left position (relative to the parent)
       * @param top {Integer} top position (relative to the parent)
       * @param width {Integer} width of the layout item
       * @param height {Integer} height of the layout item
       */
      setUserBounds: function setUserBounds(left, top, width, height) {
        this.__userBounds = {
          left: left,
          top: top,
          width: width,
          height: height
        };
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Clear the user bounds. After this call the layout item is laid out by
       * the layout manager again.
       *
       */
      resetUserBounds: function resetUserBounds() {
        delete this.__userBounds;
        qx.ui.core.queue.Layout.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} Empty storage pool
       *
       * @lint ignoreReferenceField(__emptyProperties)
       */
      __emptyProperties: {},

      /**
       * Stores the given layout properties
       *
       * @param props {Map} Incoming layout property data
       */
      setLayoutProperties: function setLayoutProperties(props) {
        if (props == null) {
          return;
        }

        var storage = this.__layoutProperties;

        if (!storage) {
          storage = this.__layoutProperties = {};
        } // Check values through parent


        var parent = this.getLayoutParent();

        if (parent) {
          parent.updateLayoutProperties(props);
        } // Copy over values


        for (var key in props) {
          if (props[key] == null) {
            delete storage[key];
          } else {
            storage[key] = props[key];
          }
        }
      },

      /**
       * Returns currently stored layout properties
       *
       * @return {Map} Returns a map of layout properties
       */
      getLayoutProperties: function getLayoutProperties() {
        return this.__layoutProperties || this.__emptyProperties;
      },

      /**
       * Removes all stored layout properties.
       *
       */
      clearLayoutProperties: function clearLayoutProperties() {
        delete this.__layoutProperties;
      },

      /**
       * Should be executed on every change of layout properties.
       *
       * This also includes "virtual" layout properties like margin or align
       * when they have an effect on the parent and not on the widget itself.
       *
       * This method is always executed on the parent not on the
       * modified widget itself.
       *
       * @param props {Map?null} Optional map of known layout properties
       */
      updateLayoutProperties: function updateLayoutProperties(props) {
        var layout = this._getLayout();

        if (layout) {
          // Verify values through underlying layout
          {
            if (props) {
              for (var key in props) {
                if (props[key] !== null) {
                  layout.verifyLayoutProperty(this, key, props[key]);
                }
              }
            }
          } // Precomputed and cached children data need to be
          // rebuild on upcoming (re-)layout.

          layout.invalidateChildrenCache();
        }

        qx.ui.core.queue.Layout.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        HIERARCHY SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the application root
       *
       * @return {qx.ui.root.Abstract} The currently used root
       */
      getApplicationRoot: function getApplicationRoot() {
        return qx.core.Init.getApplication().getRoot();
      },

      /**
       * Get the items parent. Even if the item has been added to a
       * layout, the parent is always a child of the containing item. The parent
       * item may be <code>null</code>.
       *
       * @return {qx.ui.core.Widget|null} The parent.
       */
      getLayoutParent: function getLayoutParent() {
        return this.$$parent || null;
      },

      /**
       * Set the parent
       *
       * @param parent {qx.ui.core.Widget|null} The new parent.
       */
      setLayoutParent: function setLayoutParent(parent) {
        if (this.$$parent === parent) {
          return;
        }

        this.$$parent = parent || null;
        qx.ui.core.queue.Visibility.add(this);
      },

      /**
       * Whether the item is a root item and directly connected to
       * the DOM.
       *
       * @return {Boolean} Whether the item a root item
       */
      isRootWidget: function isRootWidget() {
        return false;
      },

      /**
       * Returns the root item. The root item is the item which
       * is directly inserted into an existing DOM node at HTML level.
       * This is often the BODY element of a typical web page.
       *
       * @return {qx.ui.core.Widget} The root item (if available)
       */
      _getRoot: function _getRoot() {
        var parent = this;

        while (parent) {
          if (parent.isRootWidget()) {
            return parent;
          }

          parent = parent.$$parent;
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        CLONE SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      clone: function clone() {
        var clone = qx.ui.core.LayoutItem.prototype.clone.base.call(this);
        var props = this.__layoutProperties;

        if (props) {
          clone.__layoutProperties = qx.lang.Object.clone(props);
        }

        return clone;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // remove dynamic theme listener
      {
        qx.theme.manager.Meta.getInstance().removeListener("changeTheme", this._onChangeTheme, this);
      }
      this.$$parent = this.$$subparent = this.__layoutProperties = this.__computedLayout = this.__userBounds = this.__sizeHint = null;
    }
  });
  qx.ui.core.LayoutItem.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.ui.core.EventHandler": {},
      "qx.event.handler.DragDrop": {},
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.LayoutItem": {
        "construct": true,
        "require": true
      },
      "qx.locale.MTranslation": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.core.Assert": {},
      "qx.util.ObjectPool": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.Abstract": {},
      "qx.ui.core.queue.Layout": {},
      "qx.ui.core.queue.Visibility": {},
      "qx.lang.Object": {},
      "qx.theme.manager.Decoration": {},
      "qx.ui.core.queue.Manager": {},
      "qx.html.Element": {},
      "qx.lang.Array": {},
      "qx.event.Registration": {},
      "qx.event.dispatch.MouseCapture": {},
      "qx.Bootstrap": {},
      "qx.locale.Manager": {},
      "qx.bom.client.Engine": {},
      "qx.theme.manager.Color": {},
      "qx.lang.Type": {},
      "qx.ui.core.queue.Appearance": {},
      "qx.theme.manager.Appearance": {},
      "qx.core.Property": {},
      "qx.ui.core.DragDropCursor": {},
      "qx.bom.element.Location": {},
      "qx.ui.core.queue.Dispose": {},
      "qx.core.ObjectRegistry": {},
      "qx.ui.core.queue.Widget": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /* ************************************************************************
  
  
  
  ************************************************************************ */

  /**
   * This is the base class for all widgets.
   *
   * *External Documentation*
   *
   * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget.html' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @use(qx.ui.core.EventHandler)
   * @use(qx.event.handler.DragDrop)
   * @asset(qx/static/blank.gif)
   *
   * @ignore(qx.ui.root.Inline)
   */
  qx.Class.define("qx.ui.core.Widget", {
    extend: qx.ui.core.LayoutItem,
    include: [qx.locale.MTranslation],
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.LayoutItem.constructor.call(this); // Create basic element

      this.__contentElement = this.__createContentElement(); // Initialize properties

      this.initFocusable();
      this.initSelectable();
      this.initNativeContextMenu();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired after the widget appears on the screen.
       */
      appear: "qx.event.type.Event",

      /**
       * Fired after the widget disappears from the screen.
       */
      disappear: "qx.event.type.Event",

      /**
       * Fired after the creation of a child control. The passed data is the
       * newly created child widget.
       */
      createChildControl: "qx.event.type.Data",

      /**
       * Fired on resize (after layout) of the widget.
       * The data property of the event contains the widget's computed location
       * and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      resize: "qx.event.type.Data",

      /**
       * Fired on move (after layout) of the widget.
       * The data property of the event contains the widget's computed location
       * and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      move: "qx.event.type.Data",

      /**
       * Fired after the appearance has been applied. This happens before the
       * widget becomes visible, on state and appearance changes. The data field
       * contains the state map. This can be used to react on state changes or to
       * read properties set by the appearance.
       */
      syncAppearance: "qx.event.type.Data",

      /** Fired if the mouse cursor moves over the widget.
       *  The data property of the event contains the widget's computed location
       *  and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      mousemove: "qx.event.type.Mouse",

      /**
       * Fired if the mouse cursor enters the widget.
       *
       * Note: This event is also dispatched if the widget is disabled!
       */
      mouseover: "qx.event.type.Mouse",

      /**
       * Fired if the mouse cursor leaves widget.
       *
       * Note: This event is also dispatched if the widget is disabled!
       */
      mouseout: "qx.event.type.Mouse",

      /** Mouse button is pressed on the widget. */
      mousedown: "qx.event.type.Mouse",

      /** Mouse button is released on the widget. */
      mouseup: "qx.event.type.Mouse",

      /** Widget is clicked using left or middle button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      click: "qx.event.type.Mouse",

      /** Widget is clicked using a non primary button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      auxclick: "qx.event.type.Mouse",

      /** Widget is double clicked using left or middle button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      dblclick: "qx.event.type.Mouse",

      /** Widget is clicked using the right mouse button. */
      contextmenu: "qx.event.type.Mouse",

      /** Fired before the context menu is opened. */
      beforeContextmenuOpen: "qx.event.type.Data",

      /** Fired if the mouse wheel is used over the widget. */
      mousewheel: "qx.event.type.MouseWheel",

      /** Fired if a touch at the screen is started. */
      touchstart: "qx.event.type.Touch",

      /** Fired if a touch at the screen has ended. */
      touchend: "qx.event.type.Touch",

      /** Fired during a touch at the screen. */
      touchmove: "qx.event.type.Touch",

      /** Fired if a touch at the screen is canceled. */
      touchcancel: "qx.event.type.Touch",

      /** Fired when a pointer taps on the screen. */
      tap: "qx.event.type.Tap",

      /** Fired when a pointer holds on the screen. */
      longtap: "qx.event.type.Tap",

      /** Fired when a pointer taps twice on the screen. */
      dbltap: "qx.event.type.Tap",

      /** Fired when a pointer swipes over the screen. */
      swipe: "qx.event.type.Touch",

      /** Fired when two pointers performing a rotate gesture on the screen. */
      rotate: "qx.event.type.Rotate",

      /** Fired when two pointers performing a pinch in/out gesture on the screen. */
      pinch: "qx.event.type.Pinch",

      /** Fired when an active pointer moves on the screen (after pointerdown till pointerup). */
      track: "qx.event.type.Track",

      /** Fired when an active pointer moves on the screen or the mouse wheel is used. */
      roll: "qx.event.type.Roll",

      /** Fired if a pointer (mouse/touch/pen) moves or changes any of it's values. */
      pointermove: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) hovers the widget. */
      pointerover: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) leaves this widget. */
      pointerout: "qx.event.type.Pointer",

      /**
       * Fired if a pointer (mouse/touch/pen) button is pressed or
       * a finger touches the widget.
       */
      pointerdown: "qx.event.type.Pointer",

      /**
       * Fired if all pointer (mouse/touch/pen) buttons are released or
       * the finger is lifted from the widget.
       */
      pointerup: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) action is canceled. */
      pointercancel: "qx.event.type.Pointer",

      /** This event if fired if a keyboard key is released. */
      keyup: "qx.event.type.KeySequence",

      /**
       * This event if fired if a keyboard key is pressed down. This event is
       * only fired once if the user keeps the key pressed for a while.
       */
      keydown: "qx.event.type.KeySequence",

      /**
       * This event is fired any time a key is pressed. It will be repeated if
       * the user keeps the key pressed. The pressed key can be determined using
       * {@link qx.event.type.KeySequence#getKeyIdentifier}.
       */
      keypress: "qx.event.type.KeySequence",

      /**
       * This event is fired if the pressed key or keys result in a printable
       * character. Since the character is not necessarily associated with a
       * single physical key press, the event does not have a key identifier
       * getter. This event gets repeated if the user keeps pressing the key(s).
       *
       * The unicode code of the pressed key can be read using
       * {@link qx.event.type.KeyInput#getCharCode}.
       */
      keyinput: "qx.event.type.KeyInput",

      /**
       * The event is fired when the widget gets focused. Only widgets which are
       * {@link #focusable} receive this event.
       */
      focus: "qx.event.type.Focus",

      /**
       * The event is fired when the widget gets blurred. Only widgets which are
       * {@link #focusable} receive this event.
       */
      blur: "qx.event.type.Focus",

      /**
       * When the widget itself or any child of the widget receive the focus.
       */
      focusin: "qx.event.type.Focus",

      /**
       * When the widget itself or any child of the widget lost the focus.
       */
      focusout: "qx.event.type.Focus",

      /**
       * When the widget gets active (receives keyboard events etc.)
       */
      activate: "qx.event.type.Focus",

      /**
       * When the widget gets inactive
       */
      deactivate: "qx.event.type.Focus",

      /**
       * Fired if the widget becomes the capturing widget by a call to {@link #capture}.
       */
      capture: "qx.event.type.Event",

      /**
       * Fired if the widget looses the capturing mode by a call to
       * {@link #releaseCapture} or a mouse click.
       */
      losecapture: "qx.event.type.Event",

      /**
       * Fired on the drop target when the drag&drop action is finished
       * successfully. This event is normally used to transfer the data
       * from the drag to the drop target.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      drop: "qx.event.type.Drag",

      /**
       * Fired on a potential drop target when leaving it.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragleave: "qx.event.type.Drag",

      /**
       * Fired on a potential drop target when reaching it via the pointer.
       * This event can be canceled if none of the incoming data types
       * are supported.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragover: "qx.event.type.Drag",

      /**
       * Fired during the drag. Contains the current pointer coordinates
       * using {@link qx.event.type.Drag#getDocumentLeft} and
       * {@link qx.event.type.Drag#getDocumentTop}
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      drag: "qx.event.type.Drag",

      /**
       * Initiate the drag-and-drop operation. This event is cancelable
       * when the drag operation is currently not allowed/possible.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragstart: "qx.event.type.Drag",

      /**
       * Fired on the source (drag) target every time a drag session was ended.
       */
      dragend: "qx.event.type.Drag",

      /**
       * Fired when the drag configuration has been modified e.g. the user
       * pressed a key which changed the selected action. This event will be
       * fired on the draggable and the droppable element. In case of the
       * droppable element, you can cancel the event and prevent a drop based on
       * e.g. the current action.
       */
      dragchange: "qx.event.type.Drag",

      /**
       * Fired when the drop was successfully done and the target widget
       * is now asking for data. The listener should transfer the data,
       * respecting the selected action, to the event. This can be done using
       * the event's {@link qx.event.type.Drag#addData} method.
       */
      droprequest: "qx.event.type.Drag"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        PADDING
      ---------------------------------------------------------------------------
      */

      /** Padding of the widget (top) */
      paddingTop: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (right) */
      paddingRight: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (bottom) */
      paddingBottom: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (left) */
      paddingLeft: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /**
       * The 'padding' property is a shorthand property for setting 'paddingTop',
       * 'paddingRight', 'paddingBottom' and 'paddingLeft' at the same time.
       *
       * If four values are specified they apply to top, right, bottom and left respectively.
       * If there is only one value, it applies to all sides, if there are two or three,
       * the missing values are taken from the opposite side.
       */
      padding: {
        group: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        STYLING PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * The z-index property sets the stack order of an element. An element with
       * greater stack order is always in front of another element with lower stack order.
       */
      zIndex: {
        nullable: true,
        init: 10,
        apply: "_applyZIndex",
        event: "changeZIndex",
        check: "Integer",
        themeable: true
      },

      /**
       * The decorator property points to an object, which is responsible
       * for drawing the widget's decoration, e.g. border, background or shadow.
       *
       * This can be a decorator object or a string pointing to a decorator
       * defined in the decoration theme.
       */
      decorator: {
        nullable: true,
        init: null,
        apply: "_applyDecorator",
        event: "changeDecorator",
        check: "Decorator",
        themeable: true
      },

      /**
       * The background color the rendered widget.
       */
      backgroundColor: {
        nullable: true,
        check: "Color",
        apply: "_applyBackgroundColor",
        event: "changeBackgroundColor",
        themeable: true
      },

      /**
       * The text color the rendered widget.
       */
      textColor: {
        nullable: true,
        check: "Color",
        apply: "_applyTextColor",
        event: "changeTextColor",
        themeable: true,
        inheritable: true
      },

      /**
       * The widget's font. The value is either a font name defined in the font
       * theme or an instance of {@link qx.bom.Font}.
       */
      font: {
        nullable: true,
        apply: "_applyFont",
        check: "Font",
        event: "changeFont",
        themeable: true,
        inheritable: true,
        dereference: true
      },

      /**
       * Mapping to native style property opacity.
       *
       * The uniform opacity setting to be applied across an entire object.
       * Behaves like the new CSS-3 Property.
       * Any values outside the range 0.0 (fully transparent) to 1.0
       * (fully opaque) will be clamped to this range.
       */
      opacity: {
        check: "Number",
        apply: "_applyOpacity",
        themeable: true,
        nullable: true,
        init: null
      },

      /**
       * Mapping to native style property cursor.
       *
       * The name of the cursor to show when the pointer is over the widget.
       * This is any valid CSS2 cursor name defined by W3C.
       *
       * The following values are possible crossbrowser:
       * <ul><li>default</li>
       * <li>crosshair</li>
       * <li>pointer</li>
       * <li>move</li>
       * <li>n-resize</li>
       * <li>ne-resize</li>
       * <li>e-resize</li>
       * <li>se-resize</li>
       * <li>s-resize</li>
       * <li>sw-resize</li>
       * <li>w-resize</li>
       * <li>nw-resize</li>
       * <li>nesw-resize</li>
       * <li>nwse-resize</li>
       * <li>text</li>
       * <li>wait</li>
       * <li>help </li>
       * </ul>
       */
      cursor: {
        check: "String",
        apply: "_applyCursor",
        themeable: true,
        inheritable: true,
        nullable: true,
        init: null
      },

      /**
       * Sets the tooltip instance to use for this widget. If only the tooltip
       * text and icon have to be set its better to use the {@link #toolTipText}
       * and {@link #toolTipIcon} properties since they use a shared tooltip
       * instance.
       *
       * If this property is set the {@link #toolTipText} and {@link #toolTipIcon}
       * properties are ignored.
       */
      toolTip: {
        check: "qx.ui.tooltip.ToolTip",
        nullable: true
      },

      /**
       * The text of the widget's tooltip. This text can contain HTML markup.
       * The text is displayed using a shared tooltip instance. If the tooltip
       * must be customized beyond the text and an icon {@link #toolTipIcon}, the
       * {@link #toolTip} property has to be used
       */
      toolTipText: {
        check: "String",
        nullable: true,
        event: "changeToolTipText",
        apply: "_applyToolTipText"
      },

      /**
      * The icon URI of the widget's tooltip. This icon is displayed using a shared
      * tooltip instance. If the tooltip must be customized beyond the tooltip text
      * {@link #toolTipText} and the icon, the {@link #toolTip} property has to be
      * used.
      */
      toolTipIcon: {
        check: "String",
        nullable: true,
        event: "changeToolTipText"
      },

      /**
       * Controls if a tooltip should shown or not.
       */
      blockToolTip: {
        check: "Boolean",
        init: false
      },

      /**
       * Forces to show tooltip when widget is disabled.
       */
      showToolTipWhenDisabled: {
        check: "Boolean",
        init: false
      },

      /*
      ---------------------------------------------------------------------------
        MANAGEMENT PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * Controls the visibility. Valid values are:
       *
       * <ul>
       *   <li><b>visible</b>: Render the widget</li>
       *   <li><b>hidden</b>: Hide the widget but don't relayout the widget's parent.</li>
       *   <li><b>excluded</b>: Hide the widget and relayout the parent as if the
       *     widget was not a child of its parent.</li>
       * </ul>
       */
      visibility: {
        check: ["visible", "hidden", "excluded"],
        init: "visible",
        apply: "_applyVisibility",
        event: "changeVisibility"
      },

      /**
       * Whether the widget is enabled. Disabled widgets are usually grayed out
       * and do not process user created events. While in the disabled state most
       * user input events are blocked. Only the {@link #pointerover} and
       * {@link #pointerout} events will be dispatched.
       */
      enabled: {
        init: true,
        check: "Boolean",
        inheritable: true,
        apply: "_applyEnabled",
        event: "changeEnabled"
      },

      /**
       * Whether the widget is anonymous.
       *
       * Anonymous widgets are ignored in the event hierarchy. This is useful
       * for combined widgets where the internal structure do not have a custom
       * appearance with a different styling from the element around. This is
       * especially true for widgets like checkboxes or buttons where the text
       * or icon are handled synchronously for state changes to the outer widget.
       */
      anonymous: {
        init: false,
        check: "Boolean",
        apply: "_applyAnonymous"
      },

      /**
       * Defines the tab index of an widget. If widgets with tab indexes are part
       * of the current focus root these elements are sorted in first priority. Afterwards
       * the sorting continues by rendered position, zIndex and other criteria.
       *
       * Please note: The value must be between 1 and 32000.
       */
      tabIndex: {
        check: "Integer",
        nullable: true,
        apply: "_applyTabIndex"
      },

      /**
       * Whether the widget is focusable e.g. rendering a focus border and visualize
       * as active element.
       *
       * See also {@link #isTabable} which allows runtime checks for
       * <code>isChecked</code> or other stuff to test whether the widget is
       * reachable via the TAB key.
       */
      focusable: {
        check: "Boolean",
        init: false,
        apply: "_applyFocusable"
      },

      /**
       * If this property is enabled, the widget and all of its child widgets
       * will never get focused. The focus keeps at the currently
       * focused widget.
       *
       * This only works for widgets which are not {@link #focusable}.
       *
       * This is mainly useful for widget authors. Please use with caution!
       */
      keepFocus: {
        check: "Boolean",
        init: false,
        apply: "_applyKeepFocus"
      },

      /**
       * If this property if enabled, the widget and all of its child widgets
       * will never get activated. The activation keeps at the currently
       * activated widget.
       *
       * This is mainly useful for widget authors. Please use with caution!
       */
      keepActive: {
        check: "Boolean",
        init: false,
        apply: "_applyKeepActive"
      },

      /** Whether the widget acts as a source for drag&drop operations */
      draggable: {
        check: "Boolean",
        init: false,
        apply: "_applyDraggable"
      },

      /** Whether the widget acts as a target for drag&drop operations */
      droppable: {
        check: "Boolean",
        init: false,
        apply: "_applyDroppable"
      },

      /**
       * Whether the widget contains content which may be selected by the user.
       *
       * If the value set to <code>true</code> the native browser selection can
       * be used for text selection. But it is normally useful for
       * forms fields, longer texts/documents, editors, etc.
       */
      selectable: {
        check: "Boolean",
        init: false,
        event: "changeSelectable",
        apply: "_applySelectable"
      },

      /**
       * Whether to show a context menu and which one
       */
      contextMenu: {
        check: "qx.ui.menu.Menu",
        apply: "_applyContextMenu",
        nullable: true,
        event: "changeContextMenu"
      },

      /**
       * Whether the native context menu should be enabled for this widget. To
       * globally enable the native context menu set the {@link #nativeContextMenu}
       * property of the root widget ({@link qx.ui.root.Abstract}) to
       * <code>true</code>.
       */
      nativeContextMenu: {
        check: "Boolean",
        init: false,
        themeable: true,
        event: "changeNativeContextMenu",
        apply: "_applyNativeContextMenu"
      },

      /**
       * The appearance ID. This ID is used to identify the appearance theme
       * entry to use for this widget. This controls the styling of the element.
       */
      appearance: {
        check: "String",
        init: "widget",
        apply: "_applyAppearance",
        event: "changeAppearance"
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Whether the widget should print out hints and debug messages */
      DEBUG: false,

      /** Whether to throw an error on focus/blur if the widget is unfocusable */
      UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR: true,

      /**
       * Returns the widget, which contains the given DOM element.
       *
       * @param element {Element} The DOM element to search the widget for.
       * @param considerAnonymousState {Boolean?false} If true, anonymous widget
       *   will not be returned.
       * @return {qx.ui.core.Widget} The widget containing the element.
       */
      getWidgetByElement: function getWidgetByElement(element, considerAnonymousState) {
        while (element) {
          {
            qx.core.Assert.assertTrue(!element.$$widget && !element.$$widgetObject || element.$$widgetObject && element.$$widget && element.$$widgetObject.toHashCode() === element.$$widget);
          }
          var widget = element.$$widgetObject; // check for anonymous widgets

          if (widget) {
            if (!considerAnonymousState || !widget.getAnonymous()) {
              return widget;
            }
          } // Fix for FF, which occasionally breaks (BUG#3525)


          try {
            element = element.parentNode;
          } catch (e) {
            return null;
          }
        }

        return null;
      },

      /**
       * Whether the "parent" widget contains the "child" widget.
       *
       * @param parent {qx.ui.core.Widget} The parent widget
       * @param child {qx.ui.core.Widget} The child widget
       * @return {Boolean} Whether one of the "child"'s parents is "parent"
       */
      contains: function contains(parent, child) {
        while (child) {
          child = child.getLayoutParent();

          if (parent == child) {
            return true;
          }
        }

        return false;
      },

      /** @type {Map} Contains all pooled separators for reuse */
      __separatorPool: new qx.util.ObjectPool()
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __contentElement: null,
      __initialAppearanceApplied: null,
      __toolTipTextListenerId: null,

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */

      /**
       * @type {qx.ui.layout.Abstract} The connected layout manager
       */
      __layoutManager: null,
      // overridden
      _getLayout: function _getLayout() {
        return this.__layoutManager;
      },

      /**
       * Set a layout manager for the widget. A a layout manager can only be connected
       * with one widget. Reset the connection with a previous widget first, if you
       * like to use it in another widget instead.
       *
       * @param layout {qx.ui.layout.Abstract} The new layout or
       *     <code>null</code> to reset the layout.
       */
      _setLayout: function _setLayout(layout) {
        {
          if (layout) {
            this.assertInstance(layout, qx.ui.layout.Abstract);
          }
        }

        if (this.__layoutManager) {
          this.__layoutManager.connectToWidget(null);
        }

        if (layout) {
          layout.connectToWidget(this);
        }

        this.__layoutManager = layout;
        qx.ui.core.queue.Layout.add(this);
      },
      // overridden
      setLayoutParent: function setLayoutParent(parent) {
        if (this.$$parent === parent) {
          return;
        }

        var content = this.getContentElement();

        if (this.$$parent && !this.$$parent.$$disposed) {
          this.$$parent.getContentElement().remove(content);
        }

        this.$$parent = parent || null;

        if (parent && !parent.$$disposed) {
          this.$$parent.getContentElement().add(content);
        } // Update inheritable properties


        this.$$refreshInheritables(); // Update visibility cache

        qx.ui.core.queue.Visibility.add(this);
      },

      /** @type {Boolean} Whether insets have changed and must be updated */
      _updateInsets: null,
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        var changes = qx.ui.core.Widget.prototype.renderLayout.base.call(this, left, top, width, height); // Directly return if superclass has detected that no
        // changes needs to be applied

        if (!changes) {
          return null;
        }

        if (qx.lang.Object.isEmpty(changes) && !this._updateInsets) {
          return null;
        }

        var content = this.getContentElement();
        var inner = changes.size || this._updateInsets;
        var pixel = "px";
        var contentStyles = {}; // Move content to new position

        if (changes.position) {
          contentStyles.left = left + pixel;
          contentStyles.top = top + pixel;
        }

        if (inner || changes.margin) {
          contentStyles.width = width + pixel;
          contentStyles.height = height + pixel;
        }

        if (Object.keys(contentStyles).length > 0) {
          content.setStyles(contentStyles);
        }

        if (inner || changes.local || changes.margin) {
          if (this.__layoutManager && this.hasLayoutChildren()) {
            var inset = this.getInsets();
            var innerWidth = width - inset.left - inset.right;
            var innerHeight = height - inset.top - inset.bottom;
            var decorator = this.getDecorator();
            var decoratorPadding = {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            };

            if (decorator) {
              decorator = qx.theme.manager.Decoration.getInstance().resolve(decorator);
              decoratorPadding = decorator.getPadding();
            }

            var padding = {
              top: this.getPaddingTop() + decoratorPadding.top,
              right: this.getPaddingRight() + decoratorPadding.right,
              bottom: this.getPaddingBottom() + decoratorPadding.bottom,
              left: this.getPaddingLeft() + decoratorPadding.left
            };

            this.__layoutManager.renderLayout(innerWidth, innerHeight, padding);
          } else if (this.hasLayoutChildren()) {
            throw new Error("At least one child in control " + this._findTopControl() + " requires a layout, but no one was defined!");
          }
        } // Fire events


        if (changes.position && this.hasListener("move")) {
          this.fireDataEvent("move", this.getBounds());
        }

        if (changes.size && this.hasListener("resize")) {
          this.fireDataEvent("resize", this.getBounds());
        } // Cleanup flags


        delete this._updateInsets;
        return changes;
      },

      /*
      ---------------------------------------------------------------------------
        SEPARATOR SUPPORT
      ---------------------------------------------------------------------------
      */
      __separators: null,
      // overridden
      clearSeparators: function clearSeparators() {
        var reg = this.__separators;

        if (!reg) {
          return;
        }

        var pool = qx.ui.core.Widget.__separatorPool;
        var content = this.getContentElement();
        var widget;

        for (var i = 0, l = reg.length; i < l; i++) {
          widget = reg[i];
          pool.poolObject(widget);
          content.remove(widget.getContentElement());
        } // Clear registry


        reg.length = 0;
      },
      // overridden
      renderSeparator: function renderSeparator(separator, bounds) {
        // Insert
        var widget = qx.ui.core.Widget.__separatorPool.getObject(qx.ui.core.Widget);

        widget.set({
          decorator: separator
        });
        var elem = widget.getContentElement();
        this.getContentElement().add(elem); // Move

        var domEl = elem.getDomElement(); // use the DOM element because the cache of the qx.html.Element could be
        // wrong due to changes made by the decorators which work on the DOM element too

        if (domEl) {
          domEl.style.top = bounds.top + "px";
          domEl.style.left = bounds.left + "px";
          domEl.style.width = bounds.width + "px";
          domEl.style.height = bounds.height + "px";
        } else {
          elem.setStyles({
            left: bounds.left + "px",
            top: bounds.top + "px",
            width: bounds.width + "px",
            height: bounds.height + "px"
          });
        } // Remember element


        if (!this.__separators) {
          this.__separators = [];
        }

        this.__separators.push(widget);
      },

      /*
      ---------------------------------------------------------------------------
        SIZE HINTS
      ---------------------------------------------------------------------------
      */
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        // Start with the user defined values
        var width = this.getWidth();
        var minWidth = this.getMinWidth();
        var maxWidth = this.getMaxWidth();
        var height = this.getHeight();
        var minHeight = this.getMinHeight();
        var maxHeight = this.getMaxHeight();
        {
          if (minWidth !== null && maxWidth !== null) {
            this.assert(minWidth <= maxWidth, "minWidth is larger than maxWidth!");
          }

          if (minHeight !== null && maxHeight !== null) {
            this.assert(minHeight <= maxHeight, "minHeight is larger than maxHeight!");
          }
        } // Ask content

        var contentHint = this._getContentHint();

        var insets = this.getInsets();
        var insetX = insets.left + insets.right;
        var insetY = insets.top + insets.bottom;

        if (width == null) {
          width = contentHint.width + insetX;
        }

        if (height == null) {
          height = contentHint.height + insetY;
        }

        if (minWidth == null) {
          minWidth = insetX;

          if (contentHint.minWidth != null) {
            minWidth += contentHint.minWidth; // do not apply bigger min width than max width [BUG #5008]

            if (minWidth > maxWidth && maxWidth != null) {
              minWidth = maxWidth;
            }
          }
        }

        if (minHeight == null) {
          minHeight = insetY;

          if (contentHint.minHeight != null) {
            minHeight += contentHint.minHeight; // do not apply bigger min height than max height [BUG #5008]

            if (minHeight > maxHeight && maxHeight != null) {
              minHeight = maxHeight;
            }
          }
        }

        if (maxWidth == null) {
          if (contentHint.maxWidth == null) {
            maxWidth = Infinity;
          } else {
            maxWidth = contentHint.maxWidth + insetX; // do not apply bigger min width than max width [BUG #5008]

            if (maxWidth < minWidth && minWidth != null) {
              maxWidth = minWidth;
            }
          }
        }

        if (maxHeight == null) {
          if (contentHint.maxHeight == null) {
            maxHeight = Infinity;
          } else {
            maxHeight = contentHint.maxHeight + insetY; // do not apply bigger min width than max width [BUG #5008]

            if (maxHeight < minHeight && minHeight != null) {
              maxHeight = minHeight;
            }
          }
        } // Build size hint and return


        return {
          width: width,
          minWidth: minWidth,
          maxWidth: maxWidth,
          height: height,
          minHeight: minHeight,
          maxHeight: maxHeight
        };
      },
      // overridden
      invalidateLayoutCache: function invalidateLayoutCache() {
        qx.ui.core.Widget.prototype.invalidateLayoutCache.base.call(this);

        if (this.__layoutManager) {
          this.__layoutManager.invalidateLayoutCache();
        }
      },

      /**
       * Returns the recommended/natural dimensions of the widget's content.
       *
       * For labels and images this may be their natural size when defined without
       * any dimensions. For containers this may be the recommended size of the
       * underlying layout manager.
       *
       * Developer note: This can be overwritten by the derived classes to allow
       * a custom handling here.
       *
       * @return {Map}
       */
      _getContentHint: function _getContentHint() {
        var layout = this.__layoutManager;

        if (layout) {
          if (this.hasLayoutChildren()) {
            var hint = layout.getSizeHint();
            {
              var msg = "The layout of the widget" + this.toString() + " returned an invalid size hint!";
              this.assertInteger(hint.width, "Wrong 'left' argument. " + msg);
              this.assertInteger(hint.height, "Wrong 'top' argument. " + msg);
            }
            return hint;
          } else {
            return {
              width: 0,
              height: 0
            };
          }
        } else {
          return {
            width: 100,
            height: 50
          };
        }
      },
      // overridden
      _getHeightForWidth: function _getHeightForWidth(width) {
        // Prepare insets
        var insets = this.getInsets();
        var insetX = insets.left + insets.right;
        var insetY = insets.top + insets.bottom; // Compute content width

        var contentWidth = width - insetX; // Compute height

        var layout = this._getLayout();

        if (layout && layout.hasHeightForWidth()) {
          var contentHeight = layout.getHeightForWidth(contentWidth);
        } else {
          contentHeight = this._getContentHeightForWidth(contentWidth);
        } // Computed box height


        var height = contentHeight + insetY;
        return height;
      },

      /**
       * Returns the computed height for the given width.
       *
       * @abstract
       * @param width {Integer} Incoming width (as limitation)
       * @return {Integer} Computed height while respecting the given width.
       */
      _getContentHeightForWidth: function _getContentHeightForWidth(width) {
        throw new Error("Abstract method call: _getContentHeightForWidth()!");
      },

      /*
      ---------------------------------------------------------------------------
        INSET CALCULATION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the sum of the widget's padding and border width.
       *
       * @return {Map} Contains the keys <code>top</code>, <code>right</code>,
       *   <code>bottom</code> and <code>left</code>. All values are integers.
       */
      getInsets: function getInsets() {
        var top = this.getPaddingTop();
        var right = this.getPaddingRight();
        var bottom = this.getPaddingBottom();
        var left = this.getPaddingLeft();

        if (this.getDecorator()) {
          var decorator = qx.theme.manager.Decoration.getInstance().resolve(this.getDecorator());
          var inset = decorator.getInsets();
          {
            this.assertNumber(inset.top, "Invalid top decorator inset detected: " + inset.top);
            this.assertNumber(inset.right, "Invalid right decorator inset detected: " + inset.right);
            this.assertNumber(inset.bottom, "Invalid bottom decorator inset detected: " + inset.bottom);
            this.assertNumber(inset.left, "Invalid left decorator inset detected: " + inset.left);
          }
          top += inset.top;
          right += inset.right;
          bottom += inset.bottom;
          left += inset.left;
        }

        return {
          "top": top,
          "right": right,
          "bottom": bottom,
          "left": left
        };
      },

      /*
      ---------------------------------------------------------------------------
        COMPUTED LAYOUT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the widget's computed inner size as available
       * through the layout process.
       *
       * This function is guaranteed to return a correct value
       * during a {@link #resize} or {@link #move} event dispatch.
       *
       * @return {Map} The widget inner dimension in pixel (if the layout is
       *    valid). Contains the keys <code>width</code> and <code>height</code>.
       */
      getInnerSize: function getInnerSize() {
        var computed = this.getBounds();

        if (!computed) {
          return null;
        } // Return map data


        var insets = this.getInsets();
        return {
          width: computed.width - insets.left - insets.right,
          height: computed.height - insets.top - insets.bottom
        };
      },

      /*
      ---------------------------------------------------------------------------
        ANIMATION SUPPORT: USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Fade out this widget.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeOut: function fadeOut(duration) {
        return this.getContentElement().fadeOut(duration);
      },

      /**
       * Fade in the widget.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeIn: function fadeIn(duration) {
        return this.getContentElement().fadeIn(duration);
      },

      /*
      ---------------------------------------------------------------------------
        VISIBILITY SUPPORT: USER API
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyAnonymous: function _applyAnonymous(value) {
        if (value) {
          this.getContentElement().setAttribute("qxanonymous", "true");
        } else {
          this.getContentElement().removeAttribute("qxanonymous");
        }
      },

      /**
       * Make this widget visible.
       *
       */
      show: function show() {
        this.setVisibility("visible");
      },

      /**
       * Hide this widget.
       *
       */
      hide: function hide() {
        this.setVisibility("hidden");
      },

      /**
       * Hide this widget and exclude it from the underlying layout.
       *
       */
      exclude: function exclude() {
        this.setVisibility("excluded");
      },

      /**
       * Whether the widget is locally visible.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is visible
       */
      isVisible: function isVisible() {
        return this.getVisibility() === "visible";
      },

      /**
       * Whether the widget is locally hidden.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is hidden
       */
      isHidden: function isHidden() {
        return this.getVisibility() !== "visible";
      },

      /**
       * Whether the widget is locally excluded.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is excluded
       */
      isExcluded: function isExcluded() {
        return this.getVisibility() === "excluded";
      },

      /**
       * Detects if the widget and all its parents are visible.
       *
       * WARNING: Please use this method with caution because it flushes the
       * internal queues which might be an expensive operation.
       *
       * @return {Boolean} true, if the widget is currently on the screen
       */
      isSeeable: function isSeeable() {
        // Flush the queues because to detect if the widget ins visible, the
        // queues need to be flushed (see bug #5254)
        qx.ui.core.queue.Manager.flush(); // if the element is already rendered, a check for the offsetWidth is enough

        var element = this.getContentElement().getDomElement();

        if (element) {
          // will also be 0 if the parents are not visible
          return element.offsetWidth > 0;
        } // if no element is available, it can not be visible


        return false;
      },

      /*
      ---------------------------------------------------------------------------
        CREATION OF HTML ELEMENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Create the widget's content HTML element.
       *
       * @return {qx.html.Element} The content HTML element
       */
      __createContentElement: function __createContentElement() {
        var el = this._createContentElement();

        el.connectWidget(this); // make sure to allow all pointer events

        el.setStyles({
          "touch-action": "none",
          "-ms-touch-action": "none"
        });
        {
          el.setAttribute("qxClass", this.classname);
        }
        var styles = {
          "zIndex": 10,
          "boxSizing": "border-box"
        };

        if (!qx.ui.root.Inline || !(this instanceof qx.ui.root.Inline)) {
          styles.position = "absolute";
        }

        el.setStyles(styles);
        return el;
      },

      /**
       * Creates the content element. The style properties
       * position and zIndex are modified from the Widget
       * core.
       *
       * This function may be overridden to customize a class
       * content.
       *
       * @return {qx.html.Element} The widget's content element
       */
      _createContentElement: function _createContentElement() {
        return new qx.html.Element("div", {
          overflowX: "hidden",
          overflowY: "hidden"
        });
      },

      /**
       * Returns the element wrapper of the widget's content element.
       * This method exposes widget internal and must be used with caution!
       *
       * @return {qx.html.Element} The widget's content element
       */
      getContentElement: function getContentElement() {
        return this.__contentElement;
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING
      ---------------------------------------------------------------------------
      */

      /** @type {qx.ui.core.LayoutItem[]} List of all child widgets */
      __widgetChildren: null,

      /**
       * Returns all children, which are layout relevant. This excludes all widgets,
       * which have a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>.
       *
       * @internal
       * @return {qx.ui.core.Widget[]} All layout relevant children.
       */
      getLayoutChildren: function getLayoutChildren() {
        var children = this.__widgetChildren;

        if (!children) {
          return this.__emptyChildren;
        }

        var layoutChildren;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];

          if (child.hasUserBounds() || child.isExcluded()) {
            if (layoutChildren == null) {
              layoutChildren = children.concat();
            }

            qx.lang.Array.remove(layoutChildren, child);
          }
        }

        return layoutChildren || children;
      },

      /**
       * Marks the layout of this widget as invalid and triggers a layout update.
       * This is a shortcut for <code>qx.ui.core.queue.Layout.add(this);</code>.
       */
      scheduleLayoutUpdate: function scheduleLayoutUpdate() {
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Resets the cache for children which should be laid out.
       */
      invalidateLayoutChildren: function invalidateLayoutChildren() {
        var layout = this.__layoutManager;

        if (layout) {
          layout.invalidateChildrenCache();
        }

        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Returns whether the layout has children, which are layout relevant. This
       * excludes all widgets, which have a {@link qx.ui.core.Widget#visibility}
       * value of <code>exclude</code>.
       *
       * @return {Boolean} Whether the layout has layout relevant children
       */
      hasLayoutChildren: function hasLayoutChildren() {
        var children = this.__widgetChildren;

        if (!children) {
          return false;
        }

        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (!child.hasUserBounds() && !child.isExcluded()) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns the widget which contains the children and
       * is relevant for laying them out. This is from the user point of
       * view and may not be identical to the technical structure.
       *
       * @return {qx.ui.core.Widget} Widget which contains the children.
       */
      getChildrenContainer: function getChildrenContainer() {
        return this;
      },

      /**
       * @type {Array} Placeholder for children list in empty widgets.
       *     Mainly to keep instance number low.
       *
       * @lint ignoreReferenceField(__emptyChildren)
       */
      __emptyChildren: [],

      /**
       * Returns the children list
       *
       * @return {qx.ui.core.LayoutItem[]} The children array (Arrays are
       *   reference types, so please do not modify it in-place).
       */
      _getChildren: function _getChildren() {
        return this.__widgetChildren || this.__emptyChildren;
      },

      /**
       * Returns the index position of the given widget if it is
       * a child widget. Otherwise it returns <code>-1</code>.
       *
       * @param child {qx.ui.core.Widget} the widget to query for
       * @return {Integer} The index position or <code>-1</code> when
       *   the given widget is no child of this layout.
       */
      _indexOf: function _indexOf(child) {
        var children = this.__widgetChildren;

        if (!children) {
          return -1;
        }

        return children.indexOf(child);
      },

      /**
       * Whether the widget contains children.
       *
       * @return {Boolean} Returns <code>true</code> when the widget has children.
       */
      _hasChildren: function _hasChildren() {
        var children = this.__widgetChildren;
        return children != null && !!children[0];
      },

      /**
       * Recursively adds all children to the given queue
       *
       * @param queue {Array} The queue to add widgets to
       */
      addChildrenToQueue: function addChildrenToQueue(queue) {
        var children = this.__widgetChildren;

        if (!children) {
          return;
        }

        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          queue.push(child);
          child.addChildrenToQueue(queue);
        }
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
      _add: function _add(child, options) {
        {
          this.assertInstance(child, qx.ui.core.LayoutItem.constructor, "'Child' must be an instance of qx.ui.core.LayoutItem!");
        } // When moving in the same widget, remove widget first

        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren, child);
        }

        if (this.__widgetChildren) {
          this.__widgetChildren.push(child);
        } else {
          this.__widgetChildren = [child];
        }

        this.__addHelper(child, options);
      },

      /**
       * Add a child widget at the specified index
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param index {Integer} Index, at which the widget will be inserted. If no
       *   widget exists at the given index, the new widget gets appended to the
       *   current list of children.
       * @param options {Map?null} Optional layout data for widget.
       */
      _addAt: function _addAt(child, index, options) {
        if (!this.__widgetChildren) {
          this.__widgetChildren = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren, child);
        }

        var ref = this.__widgetChildren[index];

        if (ref === child) {
          child.setLayoutProperties(options);
        }

        if (ref) {
          qx.lang.Array.insertBefore(this.__widgetChildren, child, ref);
        } else {
          this.__widgetChildren.push(child);
        }

        this.__addHelper(child, options);
      },

      /**
       * Add a widget before another already inserted widget
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param before {qx.ui.core.LayoutItem} widget before the new widget will be inserted.
       * @param options {Map?null} Optional layout data for widget.
       */
      _addBefore: function _addBefore(child, before, options) {
        {
          this.assertInArray(before, this._getChildren(), "The 'before' widget is not a child of this widget!");
        }

        if (child == before) {
          return;
        }

        if (!this.__widgetChildren) {
          this.__widgetChildren = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren, child);
        }

        qx.lang.Array.insertBefore(this.__widgetChildren, child, before);

        this.__addHelper(child, options);
      },

      /**
       * Add a widget after another already inserted widget
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param after {qx.ui.core.LayoutItem} widget, after which the new widget will
       *   be inserted
       * @param options {Map?null} Optional layout data for widget.
       */
      _addAfter: function _addAfter(child, after, options) {
        {
          this.assertInArray(after, this._getChildren(), "The 'after' widget is not a child of this widget!");
        }

        if (child == after) {
          return;
        }

        if (!this.__widgetChildren) {
          this.__widgetChildren = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren, child);
        }

        qx.lang.Array.insertAfter(this.__widgetChildren, child, after);

        this.__addHelper(child, options);
      },

      /**
       * Remove the given child widget.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to remove
       */
      _remove: function _remove(child) {
        if (!this.__widgetChildren) {
          throw new Error("This widget has no children!");
        }

        qx.lang.Array.remove(this.__widgetChildren, child);

        this.__removeHelper(child);
      },

      /**
       * Remove the widget at the specified index.
       *
       * @param index {Integer} Index of the widget to remove.
       * @return {qx.ui.core.LayoutItem} The removed item.
       */
      _removeAt: function _removeAt(index) {
        if (!this.__widgetChildren) {
          throw new Error("This widget has no children!");
        }

        var child = this.__widgetChildren[index];
        qx.lang.Array.removeAt(this.__widgetChildren, index);

        this.__removeHelper(child);

        return child;
      },

      /**
       * Remove all children.
       *
       * @return {Array} An array containing the removed children.
       */
      _removeAll: function _removeAll() {
        if (!this.__widgetChildren) {
          return [];
        } // Working on a copy to make it possible to clear the
        // internal array before calling setLayoutParent()


        var children = this.__widgetChildren.concat();

        this.__widgetChildren.length = 0;

        for (var i = children.length - 1; i >= 0; i--) {
          this.__removeHelper(children[i]);
        }

        qx.ui.core.queue.Layout.add(this);
        return children;
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING - TEMPLATE METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * This method gets called each time after a child widget was added and can
       * be overridden to get notified about child adds.
       *
       * @signature function(child)
       * @param child {qx.ui.core.LayoutItem} The added child.
       */
      _afterAddChild: null,

      /**
       * This method gets called each time after a child widget was removed and
       * can be overridden to get notified about child removes.
       *
       * @signature function(child)
       * @param child {qx.ui.core.LayoutItem} The removed child.
       */
      _afterRemoveChild: null,

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING - IMPLEMENTATION
      ---------------------------------------------------------------------------
      */

      /**
       * Convenience function to add a child widget. It will insert the child to
       * the parent widget and schedule a layout update.
       *
       * @param child {qx.ui.core.LayoutItem} The child to add.
       * @param options {Map|null} Optional layout data for the widget.
       */
      __addHelper: function __addHelper(child, options) {
        {
          this.assertInstance(child, qx.ui.core.LayoutItem, "Invalid widget to add: " + child);
          this.assertNotIdentical(child, this, "Could not add widget to itself: " + child);

          if (options != null) {
            this.assertType(options, "object", "Invalid layout data: " + options);
          }
        } // Remove from old parent

        var parent = child.getLayoutParent();

        if (parent && parent != this) {
          parent._remove(child);
        } // Remember parent


        child.setLayoutParent(this); // Import options: This call will
        //  - clear the layout's children cache as well and
        //  - add its parent (this widget) to the layout queue

        if (options) {
          child.setLayoutProperties(options);
        } else {
          this.updateLayoutProperties();
        } // call the template method


        if (this._afterAddChild) {
          this._afterAddChild(child);
        }
      },

      /**
       * Convenience function to remove a child widget. It will remove it
       * from the parent widget and schedule a layout update.
       *
       * @param child {qx.ui.core.LayoutItem} The child to remove.
       */
      __removeHelper: function __removeHelper(child) {
        {
          this.assertNotUndefined(child);
        }

        if (child.getLayoutParent() !== this) {
          throw new Error("Remove Error: " + child + " is not a child of this widget!");
        } // Clear parent connection


        child.setLayoutParent(null); // clear the layout's children cache

        if (this.__layoutManager) {
          this.__layoutManager.invalidateChildrenCache();
        } // Add to layout queue


        qx.ui.core.queue.Layout.add(this); // call the template method

        if (this._afterRemoveChild) {
          this._afterRemoveChild(child);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Enables pointer event capturing. All pointer events will dispatched on this
       * widget until capturing is disabled using {@link #releaseCapture} or a
       * pointer button is clicked. If the widgets becomes the capturing widget the
       * {@link #capture} event is fired. Once it loses capture mode the
       * {@link #losecapture} event is fired.
       *
       * @param capture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       */
      capture: function capture(_capture) {
        this.getContentElement().capture(_capture);
      },

      /**
       * Disables pointer capture mode enabled by {@link #capture}.
       */
      releaseCapture: function releaseCapture() {
        this.getContentElement().releaseCapture();
      },

      /**
       * Checks if pointer event capturing is enabled for this widget.
       *
       * @return {Boolean} <code>true</code> if capturing is active
       */
      isCapturing: function isCapturing() {
        var el = this.getContentElement().getDomElement();

        if (!el) {
          return false;
        }

        var manager = qx.event.Registration.getManager(el);
        var dispatcher = manager.getDispatcher(qx.event.dispatch.MouseCapture);
        return el == dispatcher.getCaptureElement();
      },

      /*
      ---------------------------------------------------------------------------
        PADDING SUPPORT
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyPadding: function _applyPadding(value, old, name) {
        this._updateInsets = true;
        qx.ui.core.queue.Layout.add(this);

        this.__updateContentPadding(name, value);
      },

      /**
       * Helper to updated the css padding of the content element considering the
       * padding of the decorator.
       * @param style {String} The name of the css padding property e.g. <code>paddingTop</code>
       * @param value {Number} The value to set.
       */
      __updateContentPadding: function __updateContentPadding(style, value) {
        var content = this.getContentElement();
        var decorator = this.getDecorator();
        decorator = qx.theme.manager.Decoration.getInstance().resolve(decorator);

        if (decorator) {
          var direction = qx.Bootstrap.firstLow(style.replace("padding", ""));
          value += decorator.getPadding()[direction] || 0;
        }

        content.setStyle(style, value + "px");
      },

      /*
      ---------------------------------------------------------------------------
        DECORATION SUPPORT
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyDecorator: function _applyDecorator(value, old) {
        var content = this.getContentElement();

        if (old) {
          old = qx.theme.manager.Decoration.getInstance().getCssClassName(old);
          content.removeClass(old);
        }

        if (value) {
          value = qx.theme.manager.Decoration.getInstance().addCssClass(value);
          content.addClass(value);
        }

        if (value || old) {
          qx.ui.core.queue.Layout.add(this);
        }
      },

      /*
      ---------------------------------------------------------------------------
        OTHER PROPERTIES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyToolTipText: function _applyToolTipText(value, old) {
        {
          if (this.__toolTipTextListenerId) {
            return;
          }

          var manager = qx.locale.Manager.getInstance();
          this.__toolTipTextListenerId = manager.addListener("changeLocale", function () {
            var toolTipText = this.getToolTipText();

            if (toolTipText && toolTipText.translate) {
              this.setToolTipText(toolTipText.translate());
            }
          }, this);
        }
      },
      // property apply
      _applyTextColor: function _applyTextColor(value, old) {// empty template
      },
      // property apply
      _applyZIndex: function _applyZIndex(value, old) {
        this.getContentElement().setStyle("zIndex", value == null ? 0 : value);
      },
      // property apply
      _applyVisibility: function _applyVisibility(value, old) {
        var content = this.getContentElement();

        if (value === "visible") {
          content.show();
        } else {
          content.hide();
        } // only force a layout update if visibility change from/to "exclude"


        var parent = this.$$parent;

        if (parent && (old == null || value == null || old === "excluded" || value === "excluded")) {
          parent.invalidateLayoutChildren();
        } // Update visibility cache


        qx.ui.core.queue.Visibility.add(this);
      },
      // property apply
      _applyOpacity: function _applyOpacity(value, old) {
        this.getContentElement().setStyle("opacity", value == 1 ? null : value);
      },
      // property apply
      _applyCursor: function _applyCursor(value, old) {
        if (value == null && !this.isSelectable()) {
          value = "default";
        } // In Opera the cursor must be set directly.
        // http://bugzilla.qooxdoo.org/show_bug.cgi?id=1729


        this.getContentElement().setStyle("cursor", value, qx.core.Environment.get("engine.name") == "opera");
      },
      // property apply
      _applyBackgroundColor: function _applyBackgroundColor(value, old) {
        var color = this.getBackgroundColor();
        var content = this.getContentElement();
        var resolved = qx.theme.manager.Color.getInstance().resolve(color);
        content.setStyle("backgroundColor", resolved);
      },
      // property apply
      _applyFont: function _applyFont(value, old) {// empty template
      },

      /*
      ---------------------------------------------------------------------------
        DYNAMIC THEME SWITCH SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _onChangeTheme: function _onChangeTheme() {
        if (this.isDisposed()) {
          return;
        }

        qx.ui.core.Widget.prototype._onChangeTheme.base.call(this); // update the appearance


        this.updateAppearance(); // DECORATOR //

        var value = this.getDecorator();

        this._applyDecorator(null, value);

        this._applyDecorator(value); // FONT //


        value = this.getFont();

        if (qx.lang.Type.isString(value)) {
          this._applyFont(value, value);
        } // TEXT COLOR //


        value = this.getTextColor();

        if (qx.lang.Type.isString(value)) {
          this._applyTextColor(value, value);
        } // BACKGROUND COLOR //


        value = this.getBackgroundColor();

        if (qx.lang.Type.isString(value)) {
          this._applyBackgroundColor(value, value);
        }
      },

      /*
      ---------------------------------------------------------------------------
        STATE HANDLING
      ---------------------------------------------------------------------------
      */

      /** @type {Map} The current widget states */
      __states: null,

      /** @type {Boolean} Whether the widget has state changes which are not yet queued */
      $$stateChanges: null,

      /** @type {Map} Can be overridden to forward states to the child controls. */
      _forwardStates: null,

      /**
       * Returns whether a state is set.
       *
       * @param state {String} the state to check.
       * @return {Boolean} whether the state is set.
       */
      hasState: function hasState(state) {
        var states = this.__states;
        return !!states && !!states[state];
      },

      /**
       * Sets a state.
       *
       * @param state {String} The state to add
       */
      addState: function addState(state) {
        // Dynamically create state map
        var states = this.__states;

        if (!states) {
          states = this.__states = {};
        }

        if (states[state]) {
          return;
        } // Add state and queue


        this.__states[state] = true; // Fast path for hovered state

        if (state === "hovered") {
          this.syncAppearance();
        } else if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls;

        if (forward && forward[state] && controls) {
          var control;

          for (var id in controls) {
            control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              controls[id].addState(state);
            }
          }
        }
      },

      /**
       * Clears a state.
       *
       * @param state {String} the state to clear.
       */
      removeState: function removeState(state) {
        // Check for existing state
        var states = this.__states;

        if (!states || !states[state]) {
          return;
        } // Clear state and queue


        delete this.__states[state]; // Fast path for hovered state

        if (state === "hovered") {
          this.syncAppearance();
        } else if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls;

        if (forward && forward[state] && controls) {
          for (var id in controls) {
            var control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              control.removeState(state);
            }
          }
        }
      },

      /**
       * Replaces the first state with the second one.
       *
       * This method is ideal for state transitions e.g. normal => selected.
       *
       * @param old {String} Previous state
       * @param value {String} New state
       */
      replaceState: function replaceState(old, value) {
        var states = this.__states;

        if (!states) {
          states = this.__states = {};
        }

        if (!states[value]) {
          states[value] = true;
        }

        if (states[old]) {
          delete states[old];
        }

        if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls;

        if (forward && forward[value] && controls) {
          for (var id in controls) {
            var control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              control.replaceState(old, value);
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPEARANCE SUPPORT
      ---------------------------------------------------------------------------
      */

      /** @type {String} The currently compiled selector to lookup the matching appearance */
      __appearanceSelector: null,

      /** @type {Boolean} Whether the selectors needs to be recomputed before updating appearance */
      __updateSelector: null,

      /**
       * Renders the appearance using the current widget states.
       *
       * Used exclusively by {qx.ui.core.queue.Appearance}.
       */
      syncAppearance: function syncAppearance() {
        var states = this.__states;
        var selector = this.__appearanceSelector;
        var manager = qx.theme.manager.Appearance.getInstance(); // Cache deep accessor

        var styler = qx.core.Property.$$method.setThemed;
        var unstyler = qx.core.Property.$$method.resetThemed; // Check for requested selector update

        if (this.__updateSelector) {
          // Clear flag
          delete this.__updateSelector; // Check if the selector was created previously

          if (selector) {
            // Query old selector
            var oldData = manager.styleFrom(selector, states, null, this.getAppearance()); // Clear current selector (to force recompute)

            selector = null;
          }
        } // Build selector


        if (!selector) {
          var obj = this;
          var id = [];

          do {
            id.push(obj.$$subcontrol || obj.getAppearance());
          } while (obj = obj.$$subparent); // Combine parent control IDs, add top level appearance, filter result
          // to not include positioning information anymore (e.g. #3)


          selector = id.reverse().join("/").replace(/#[0-9]+/g, "");
          this.__appearanceSelector = selector;
        } // Query current selector


        var newData = manager.styleFrom(selector, states, null, this.getAppearance());

        if (newData) {
          if (oldData) {
            for (var prop in oldData) {
              if (newData[prop] === undefined) {
                this[unstyler[prop]]();
              }
            }
          } // Check property availability of new data


          {
            for (var prop in newData) {
              if (!this[styler[prop]]) {
                throw new Error(this.classname + ' has no themeable property "' + prop + '" while styling ' + selector);
              }
            }
          } // Apply new data

          for (var prop in newData) {
            newData[prop] === undefined ? this[unstyler[prop]]() : this[styler[prop]](newData[prop]);
          }
        } else if (oldData) {
          // Clear old data
          for (var prop in oldData) {
            this[unstyler[prop]]();
          }
        }

        this.fireDataEvent("syncAppearance", this.__states);
      },
      // property apply
      _applyAppearance: function _applyAppearance(value, old) {
        this.updateAppearance();
      },

      /**
       * Helper method called from the visibility queue to detect outstanding changes
       * to the appearance.
       *
       * @internal
       */
      checkAppearanceNeeds: function checkAppearanceNeeds() {
        // CASE 1: Widget has never got an appearance already because it was never
        // visible before. Normally add it to the queue is the easiest way to update it.
        if (!this.__initialAppearanceApplied) {
          qx.ui.core.queue.Appearance.add(this);
          this.__initialAppearanceApplied = true;
        } // CASE 2: Widget has got an appearance before, but was hidden for some time
        // which results into maybe omitted state changes have not been applied.
        // In this case the widget is already queued in the appearance. This is basically
        // what all addState/removeState do, but the queue itself may not have been registered
        // to be flushed
        else if (this.$$stateChanges) {
            qx.ui.core.queue.Appearance.add(this);
            delete this.$$stateChanges;
          }
      },

      /**
       * Refreshes the appearance of this widget and all
       * registered child controls.
       */
      updateAppearance: function updateAppearance() {
        // Clear selector
        this.__updateSelector = true; // Add to appearance queue

        qx.ui.core.queue.Appearance.add(this); // Update child controls

        var controls = this.__childControls;

        if (controls) {
          var obj;

          for (var id in controls) {
            obj = controls[id];

            if (obj instanceof qx.ui.core.Widget) {
              obj.updateAppearance();
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET QUEUE
      ---------------------------------------------------------------------------
      */

      /**
       * This method is called during the flush of the
       * {@link qx.ui.core.queue.Widget widget queue}.
       *
       * @param jobs {Map} A map of jobs.
       */
      syncWidget: function syncWidget(jobs) {// empty implementation
      },

      /*
      ---------------------------------------------------------------------------
        EVENT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the next event target in the parent chain. May
       * also return the widget itself if it is not anonymous.
       *
       * @return {qx.ui.core.Widget} A working event target of this widget.
       *    May be <code>null</code> as well.
       */
      getEventTarget: function getEventTarget() {
        var target = this;

        while (target.getAnonymous()) {
          target = target.getLayoutParent();

          if (!target) {
            return null;
          }
        }

        return target;
      },

      /**
       * Returns the next focus target in the parent chain. May
       * also return the widget itself if it is not anonymous and focusable.
       *
       * @return {qx.ui.core.Widget} A working focus target of this widget.
       *    May be <code>null</code> as well.
       */
      getFocusTarget: function getFocusTarget() {
        var target = this;

        if (!target.getEnabled()) {
          return null;
        }

        while (target.getAnonymous() || !target.getFocusable()) {
          target = target.getLayoutParent();

          if (!target || !target.getEnabled()) {
            return null;
          }
        }

        return target;
      },

      /**
       * Returns the element which should be focused.
       *
       * @return {qx.html.Element} The html element to focus.
       */
      getFocusElement: function getFocusElement() {
        return this.getContentElement();
      },

      /**
       * Whether the widget is reachable by pressing the TAB key.
       *
       * Normally tests for both, the focusable property and a positive or
       * undefined tabIndex property. The widget must have a DOM element
       * since only visible widgets are tabable.
       *
       * @return {Boolean} Whether the element is tabable.
       */
      isTabable: function isTabable() {
        return !!this.getContentElement().getDomElement() && this.isFocusable();
      },
      // property apply
      _applyFocusable: function _applyFocusable(value, old) {
        var target = this.getFocusElement(); // Apply native tabIndex attribute

        if (value) {
          var tabIndex = this.getTabIndex();

          if (tabIndex == null) {
            tabIndex = 1;
          }

          target.setAttribute("tabIndex", tabIndex); // Omit native dotted outline border

          target.setStyle("outline", "none");
        } else {
          if (target.isNativelyFocusable()) {
            target.setAttribute("tabIndex", -1);
          } else if (old) {
            target.setAttribute("tabIndex", null);
          }
        }
      },
      // property apply
      _applyKeepFocus: function _applyKeepFocus(value) {
        var target = this.getFocusElement();
        target.setAttribute("qxKeepFocus", value ? "on" : null);
      },
      // property apply
      _applyKeepActive: function _applyKeepActive(value) {
        var target = this.getContentElement();
        target.setAttribute("qxKeepActive", value ? "on" : null);
      },
      // property apply
      _applyTabIndex: function _applyTabIndex(value) {
        if (value == null) {
          value = 1;
        } else if (value < 1 || value > 32000) {
          throw new Error("TabIndex property must be between 1 and 32000");
        }

        if (this.getFocusable() && value != null) {
          this.getFocusElement().setAttribute("tabIndex", value);
        }
      },
      // property apply
      _applySelectable: function _applySelectable(value, old) {
        // Re-apply cursor if not in "initSelectable"
        if (old !== null) {
          this._applyCursor(this.getCursor());
        } // Apply qooxdoo attribute


        this.getContentElement().setSelectable(value);
      },
      // property apply
      _applyEnabled: function _applyEnabled(value, old) {
        if (value === false) {
          this.addState("disabled"); // hovered not configured in widget, but as this is a
          // standardized name in qooxdoo and we never want a hover
          // state for disabled widgets, remove this state every time

          this.removeState("hovered"); // Blur when focused

          if (this.isFocusable()) {
            // Remove focused state
            this.removeState("focused"); // Remove tabIndex

            this._applyFocusable(false, true);
          } // Remove draggable


          if (this.isDraggable()) {
            this._applyDraggable(false, true);
          } // Remove droppable


          if (this.isDroppable()) {
            this._applyDroppable(false, true);
          }
        } else {
          this.removeState("disabled"); // Re-add tabIndex

          if (this.isFocusable()) {
            this._applyFocusable(true, false);
          } // Re-add draggable


          if (this.isDraggable()) {
            this._applyDraggable(true, false);
          } // Re-add droppable


          if (this.isDroppable()) {
            this._applyDroppable(true, false);
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        CONTEXT MENU
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyNativeContextMenu: function _applyNativeContextMenu(value, old, name) {// empty body to allow overriding
      },
      // property apply
      _applyContextMenu: function _applyContextMenu(value, old) {
        if (old) {
          old.removeState("contextmenu");

          if (old.getOpener() == this) {
            old.resetOpener();
          }

          if (!value) {
            this.removeListener("contextmenu", this._onContextMenuOpen);
            this.removeListener("longtap", this._onContextMenuOpen);
            old.removeListener("changeVisibility", this._onBeforeContextMenuOpen, this);
          }
        }

        if (value) {
          value.setOpener(this);
          value.addState("contextmenu");

          if (!old) {
            this.addListener("contextmenu", this._onContextMenuOpen);
            this.addListener("longtap", this._onContextMenuOpen);
            value.addListener("changeVisibility", this._onBeforeContextMenuOpen, this);
          }
        }
      },

      /**
       * Event listener for <code>contextmenu</code> event
       *
       * @param e {qx.event.type.Pointer} The event object
       */
      _onContextMenuOpen: function _onContextMenuOpen(e) {
        // only allow long tap context menu on touch interactions
        if (e.getType() == "longtap") {
          if (e.getPointerType() !== "touch") {
            return;
          }
        }

        this.getContextMenu().openAtPointer(e); // Do not show native menu
        // don't open any other contextmenus

        e.stop();
      },

      /**
       * Event listener for <code>beforeContextmenuOpen</code> event
       *
       * @param e {qx.event.type.Data} The data event
       */
      _onBeforeContextMenuOpen: function _onBeforeContextMenuOpen(e) {
        if (e.getData() == "visible" && this.hasListener("beforeContextmenuOpen")) {
          this.fireDataEvent("beforeContextmenuOpen", e);
        }
      },

      /*
      ---------------------------------------------------------------------------
        USEFUL COMMON EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener which stops a bubbling event from
       * propagates further.
       *
       * @param e {qx.event.type.Event} Any bubbling event
       */
      _onStopEvent: function _onStopEvent(e) {
        e.stopPropagation();
      },

      /*
      ---------------------------------------------------------------------------
        DRAG & DROP SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Helper to return a instance of a {@link qx.ui.core.DragDropCursor}.
       * If you want to use your own DragDropCursor, override this method
       * and return your custom instance.
       * @return {qx.ui.core.DragDropCursor} A drag drop cursor implementation.
       */
      _getDragDropCursor: function _getDragDropCursor() {
        return qx.ui.core.DragDropCursor.getInstance();
      },
      // property apply
      _applyDraggable: function _applyDraggable(value, old) {
        if (!this.isEnabled() && value === true) {
          value = false;
        } // Force cursor creation


        this._getDragDropCursor(); // Process listeners


        if (value) {
          this.addListener("dragstart", this._onDragStart);
          this.addListener("drag", this._onDrag);
          this.addListener("dragend", this._onDragEnd);
          this.addListener("dragchange", this._onDragChange);
        } else {
          this.removeListener("dragstart", this._onDragStart);
          this.removeListener("drag", this._onDrag);
          this.removeListener("dragend", this._onDragEnd);
          this.removeListener("dragchange", this._onDragChange);
        } // Sync DOM attribute


        this.getContentElement().setAttribute("qxDraggable", value ? "on" : null);
      },
      // property apply
      _applyDroppable: function _applyDroppable(value, old) {
        if (!this.isEnabled() && value === true) {
          value = false;
        } // Sync DOM attribute


        this.getContentElement().setAttribute("qxDroppable", value ? "on" : null);
      },

      /**
       * Event listener for own <code>dragstart</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragStart: function _onDragStart(e) {
        this._getDragDropCursor().placeToPointer(e);

        this.getApplicationRoot().setGlobalCursor("default");
      },

      /**
       * Event listener for own <code>drag</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDrag: function _onDrag(e) {
        this._getDragDropCursor().placeToPointer(e);
      },

      /**
       * Event listener for own <code>dragend</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragEnd: function _onDragEnd(e) {
        this._getDragDropCursor().moveTo(-1000, -1000);

        this.getApplicationRoot().resetGlobalCursor();
      },

      /**
       * Event listener for own <code>dragchange</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragChange: function _onDragChange(e) {
        var cursor = this._getDragDropCursor();

        var action = e.getCurrentAction();
        action ? cursor.setAction(action) : cursor.resetAction();
      },

      /*
      ---------------------------------------------------------------------------
        VISUALIZE FOCUS STATES
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler which is executed when the widget receives the focus.
       *
       * This method is used by the {@link qx.ui.core.FocusHandler} to
       * apply states etc. to a focused widget.
       *
       * @internal
       */
      visualizeFocus: function visualizeFocus() {
        this.addState("focused");
      },

      /**
       * Event handler which is executed when the widget lost the focus.
       *
       * This method is used by the {@link qx.ui.core.FocusHandler} to
       * remove states etc. from a previously focused widget.
       *
       * @internal
       */
      visualizeBlur: function visualizeBlur() {
        this.removeState("focused");
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL CHILD INTO VIEW
      ---------------------------------------------------------------------------
      */

      /**
       * The method scrolls the given item into view.
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param alignX {String?null} Alignment of the item. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param alignY {String?null} Alignment of the item. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoView: function scrollChildIntoView(child, alignX, alignY, direct) {
        // Scroll directly on default
        direct = typeof direct == "undefined" ? true : direct; // Always lazy scroll when either
        // - the child
        // - its layout parent
        // - its siblings
        // have layout changes scheduled.
        //
        // This is to make sure that the scroll position is computed
        // after layout changes have been applied to the DOM. Note that changes
        // scheduled for the grand parent (and up) are not tracked and need to
        // be signaled manually.

        var Layout = qx.ui.core.queue.Layout;
        var parent; // Child

        if (direct) {
          direct = !Layout.isScheduled(child);
          parent = child.getLayoutParent(); // Parent

          if (direct && parent) {
            direct = !Layout.isScheduled(parent); // Siblings

            if (direct) {
              parent.getChildren().forEach(function (sibling) {
                direct = direct && !Layout.isScheduled(sibling);
              });
            }
          }
        }

        this.scrollChildIntoViewX(child, alignX, direct);
        this.scrollChildIntoViewY(child, alignY, direct);
      },

      /**
       * The method scrolls the given item into view (x-axis only).
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param align {String?null} Alignment of the item. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewX: function scrollChildIntoViewX(child, align, direct) {
        this.getContentElement().scrollChildIntoViewX(child.getContentElement(), align, direct);
      },

      /**
       * The method scrolls the given item into view (y-axis only).
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewY: function scrollChildIntoViewY(child, align, direct) {
        this.getContentElement().scrollChildIntoViewY(child.getContentElement(), align, direct);
      },

      /*
      ---------------------------------------------------------------------------
        FOCUS SYSTEM USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Focus this widget.
       *
       */
      focus: function focus() {
        if (this.isFocusable()) {
          this.getFocusElement().focus();
        } else if (qx.ui.core.Widget.UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR) {
          throw new Error("Widget is not focusable!");
        }
      },

      /**
       * Remove focus from this widget.
       *
       */
      blur: function blur() {
        if (this.isFocusable()) {
          this.getFocusElement().blur();
        } else if (qx.ui.core.Widget.UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR) {
          throw new Error("Widget is not focusable!");
        }
      },

      /**
       * Activate this widget e.g. for keyboard events.
       *
       */
      activate: function activate() {
        this.getContentElement().activate();
      },

      /**
       * Deactivate this widget e.g. for keyboard events.
       *
       */
      deactivate: function deactivate() {
        this.getContentElement().deactivate();
      },

      /**
       * Focus this widget when using the keyboard. This is
       * mainly thought for the advanced qooxdoo keyboard handling
       * and should not be used by the application developer.
       *
       * @internal
       */
      tabFocus: function tabFocus() {
        this.getFocusElement().focus();
      },

      /*
      ---------------------------------------------------------------------------
        CHILD CONTROL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Whether the given ID is assigned to a child control.
       *
       * @param id {String} ID of the child control
       * @return {Boolean} <code>true</code> when the child control is registered.
       */
      hasChildControl: function hasChildControl(id) {
        if (!this.__childControls) {
          return false;
        }

        return !!this.__childControls[id];
      },

      /** @type {Map} Map of instantiated child controls */
      __childControls: null,

      /**
       * Returns a map of all already created child controls
       *
       * @return {Map} mapping of child control id to the child widget.
       */
      _getCreatedChildControls: function _getCreatedChildControls() {
        return this.__childControls;
      },

      /**
       * Returns the child control from the given ID. Returns
       * <code>null</code> when the child control is unknown.
       *
       * It is designed for widget authors, who want to access child controls,
       * which are created by the widget itself.
       *
       * <b>Warning</b>: This method exposes widget internals and modifying the
       * returned sub widget may bring the widget into an inconsistent state.
       * Accessing child controls defined in a super class or in an foreign class
       * is not supported. Do not use it if the result can be achieved using public
       * API or theming.
       *
       * @param id {String} ID of the child control
       * @param notcreate {Boolean?false} Whether the child control
       *    should not be created dynamically if not yet available.
       * @return {qx.ui.core.Widget} Child control
       */
      getChildControl: function getChildControl(id, notcreate) {
        if (!this.__childControls) {
          if (notcreate) {
            return null;
          }

          this.__childControls = {};
        }

        var control = this.__childControls[id];

        if (control) {
          return control;
        }

        if (notcreate === true) {
          return null;
        }

        return this._createChildControl(id);
      },

      /**
       * Shows the given child control by ID
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} the child control
       */
      _showChildControl: function _showChildControl(id) {
        var control = this.getChildControl(id);
        control.show();
        return control;
      },

      /**
       * Excludes the given child control by ID
       *
       * @param id {String} ID of the child control
       */
      _excludeChildControl: function _excludeChildControl(id) {
        var control = this.getChildControl(id, true);

        if (control) {
          control.exclude();
        }
      },

      /**
       * Whether the given child control is visible.
       *
       * @param id {String} ID of the child control
       * @return {Boolean} <code>true</code> when the child control is visible.
       */
      _isChildControlVisible: function _isChildControlVisible(id) {
        var control = this.getChildControl(id, true);

        if (control) {
          return control.isVisible();
        }

        return false;
      },

      /**
       * Release the child control by ID and decouple the
       * child from the parent. This method does not dispose the child control.
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} The released control
       */
      _releaseChildControl: function _releaseChildControl(id) {
        var control = this.getChildControl(id, false);

        if (!control) {
          throw new Error("Unsupported control: " + id);
        } // remove connection to parent


        delete control.$$subcontrol;
        delete control.$$subparent; // remove state forwarding

        var states = this.__states;
        var forward = this._forwardStates;

        if (states && forward && control instanceof qx.ui.core.Widget) {
          for (var state in states) {
            if (forward[state]) {
              control.removeState(state);
            }
          }
        }

        delete this.__childControls[id];
        return control;
      },

      /**
       * Force the creation of the given child control by ID.
       *
       * Do not override this method! Override {@link #_createChildControlImpl}
       * instead if you need to support new controls.
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} The created control
       * @throws {Error} when the control was created before
       */
      _createChildControl: function _createChildControl(id) {
        if (!this.__childControls) {
          this.__childControls = {};
        } else if (this.__childControls[id]) {
          throw new Error("Child control '" + id + "' already created!");
        }

        var pos = id.indexOf("#");

        try {
          if (pos == -1) {
            var control = this._createChildControlImpl(id);
          } else {
            var control = this._createChildControlImpl(id.substring(0, pos), id.substring(pos + 1, id.length));
          }
        } catch (exc) {
          exc.message = "Exception while creating child control '" + id + "' of widget " + this.toString() + ": " + exc.message;
          throw exc;
        }

        if (!control) {
          throw new Error("Unsupported control: " + id);
        } // Establish connection to parent


        control.$$subcontrol = id;
        control.$$subparent = this; // Support for state forwarding

        var states = this.__states;
        var forward = this._forwardStates;

        if (states && forward && control instanceof qx.ui.core.Widget) {
          for (var state in states) {
            if (forward[state]) {
              control.addState(state);
            }
          }
        } // If the appearance is already synced after the child control
        // we need to update the appearance now, because the selector
        // might be not correct in certain cases.


        if (control.$$resyncNeeded) {
          delete control.$$resyncNeeded;
          control.updateAppearance();
        }

        this.fireDataEvent("createChildControl", control); // Register control and return

        return this.__childControls[id] = control;
      },

      /**
       * Internal method to create child controls. This method
       * should be overwritten by classes which extends this one
       * to support new child control types.
       *
       * @param id {String} ID of the child control. If a # is used, the id is
       *   the part in front of the #.
       * @param hash {String?undefined} If a child control name contains a #,
       *   all text following the # will be the hash argument.
       * @return {qx.ui.core.Widget} The created control or <code>null</code>
       */
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        return null;
      },

      /**
       * Dispose all registered controls. This is automatically
       * executed by the widget.
       *
       */
      _disposeChildControls: function _disposeChildControls() {
        var controls = this.__childControls;

        if (!controls) {
          return;
        }

        var Widget = qx.ui.core.Widget;

        for (var id in controls) {
          var control = controls[id];

          if (!Widget.contains(this, control)) {
            control.destroy();
          } else {
            control.dispose();
          }
        }

        delete this.__childControls;
      },

      /**
       * Finds and returns the top level control. This is the first
       * widget which is not a child control of any other widget.
       *
       * @return {qx.ui.core.Widget} The top control
       */
      _findTopControl: function _findTopControl() {
        var obj = this;

        while (obj) {
          if (!obj.$$subparent) {
            return obj;
          }

          obj = obj.$$subparent;
        }

        return null;
      },

      /**
       * Return the ID (name) if this instance was a created as a child control of another widget.
       *
       * See the first parameter id in {@link qx.ui.core.Widget#_createChildControlImpl}
       *
       * @return {String|null} ID of the current widget or null if it was not created as a subcontrol
       */
      getSubcontrolId: function getSubcontrolId() {
        return this.$$subcontrol || null;
      },

      /*
      ---------------------------------------------------------------------------
        LOWER LEVEL ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the location of the content element in context of the document
       * dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element
       *   (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default,
       *   uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to
       *   border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute
       *   positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for
       *   static/relative positioned content).
       *
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the element relative to the document.
       */
      getContentLocation: function getContentLocation(mode) {
        var domEl = this.getContentElement().getDomElement();
        return domEl ? qx.bom.element.Location.get(domEl, mode) : null;
      },

      /**
       * Directly modifies the relative left position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param value {Integer} Left position
       */
      setDomLeft: function setDomLeft(value) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.left = value + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /**
       * Directly modifies the relative top position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param value {Integer} Top position
       */
      setDomTop: function setDomTop(value) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.top = value + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /**
       * Directly modifies the relative left and top position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param left {Integer} Left position
       * @param top {Integer} Top position
       */
      setDomPosition: function setDomPosition(left, top) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.left = left + "px";
          domEl.style.top = top + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /*
      ---------------------------------------------------------------------------
        ENHANCED DISPOSE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Removes this widget from its parent and disposes it.
       *
       * Please note that the widget is not disposed synchronously. The
       * real dispose happens after the next queue flush.
       *
       */
      destroy: function destroy() {
        if (this.$$disposed) {
          return;
        }

        var parent = this.$$parent;

        if (parent) {
          parent._remove(this);
        }

        qx.ui.core.queue.Dispose.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        CLONE SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      clone: function clone() {
        var clone = qx.ui.core.Widget.prototype.clone.base.call(this);

        if (this.getChildren) {
          var children = this.getChildren();

          for (var i = 0, l = children.length; i < l; i++) {
            clone.add(children[i].clone());
          }
        }

        return clone;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // Some dispose stuff is not needed in global shutdown, otherwise
      // it just slows down things a bit, so do not do them.
      if (!qx.core.ObjectRegistry.inShutDown) {
        {
          if (this.__toolTipTextListenerId) {
            qx.locale.Manager.getInstance().removeListenerById(this.__toolTipTextListenerId);
          }
        } // Remove widget pointer from DOM

        var contentEl = this.getContentElement();

        if (contentEl) {
          contentEl.disconnectWidget(this);
        } // Clean up all child controls


        this._disposeChildControls(); // Remove from ui queues


        qx.ui.core.queue.Appearance.remove(this);
        qx.ui.core.queue.Layout.remove(this);
        qx.ui.core.queue.Visibility.remove(this);
        qx.ui.core.queue.Widget.remove(this);
      }

      if (this.getContextMenu()) {
        this.setContextMenu(null);
      } // pool decorators if not in global shutdown


      if (!qx.core.ObjectRegistry.inShutDown) {
        this.clearSeparators();
        this.__separators = null;
      } else {
        this._disposeArray("__separators");
      } // Clear children array


      this._disposeArray("__widgetChildren"); // Cleanup map of appearance states


      this.__states = this.__childControls = null; // Dispose layout manager and HTML elements

      this._disposeObjects("__layoutManager", "__contentElement");
    }
  });
  qx.ui.core.Widget.$$dbClassInfo = $$dbClassInfo;
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
      },
      "qx.ui.core.Blocker": {}
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
   * This mixin blocks events and can be included into all widgets.
   *
   * The {@link #block} and {@link #unblock} methods provided by this mixin can be used
   * to block any event from the widget. When blocked,
   * the blocker widget overlays the widget to block, including the padding area.
   *
   * The ({@link #blockContent} method can be used to block child widgets with a
   * zIndex below a certain value.
   */
  qx.Mixin.define("qx.ui.core.MBlocker", {
    properties: {
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
      }
    },
    members: {
      __blocker: null,

      /**
       * Template method for creating the blocker item.
       * @return {qx.ui.core.Blocker} The blocker to use.
       */
      _createBlocker: function _createBlocker() {
        return new qx.ui.core.Blocker(this);
      },
      // property apply
      _applyBlockerColor: function _applyBlockerColor(value, old) {
        this.getBlocker().setColor(value);
      },
      // property apply
      _applyBlockerOpacity: function _applyBlockerOpacity(value, old) {
        this.getBlocker().setOpacity(value);
      },

      /**
       * Block all events from this widget by placing a transparent overlay widget,
       * which receives all events, exactly over the widget.
       */
      block: function block() {
        this.getBlocker().block();
      },

      /**
       * Returns whether the widget is blocked.
       *
       * @return {Boolean} Whether the widget is blocked.
       */
      isBlocked: function isBlocked() {
        return this.__blocker && this.__blocker.isBlocked();
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it takes care of
       * the amount of {@link #block} calls. The blocker is only removed if
       * the number of {@link #unblock} calls is identical to {@link #block} calls.
       */
      unblock: function unblock() {
        if (this.__blocker) {
          this.__blocker.unblock();
        }
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it doesn't take care of
       * the amount of {@link #block} calls. The blocker is directly removed.
       */
      forceUnblock: function forceUnblock() {
        if (this.__blocker) {
          this.__blocker.forceUnblock();
        }
      },

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this.getBlocker().blockContent(zIndex);
      },

      /**
       * Get the blocker
       *
       * @return {qx.ui.core.Blocker} The blocker
       */
      getBlocker: function getBlocker() {
        if (!this.__blocker) {
          this.__blocker = this._createBlocker();
        }

        return this.__blocker;
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__blocker");
    }
  });
  qx.ui.core.MBlocker.$$dbClassInfo = $$dbClassInfo;
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin implements the key methods of the {@link qx.ui.window.IDesktop}.
   *
   * @ignore(qx.ui.window.Window)
   * @ignore(qx.ui.window.Window.*)
   */
  qx.Mixin.define("qx.ui.window.MDesktop", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The currently active window
       */
      activeWindow: {
        check: "qx.ui.window.Window",
        apply: "_applyActiveWindow",
        event: "changeActiveWindow",
        init: null,
        nullable: true
      }
    },
    events: {
      /**
       * Fired when a window was added.
       */
      windowAdded: "qx.event.type.Data",

      /**
       * Fired when a window was removed.
       */
      windowRemoved: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __windows: null,
      __manager: null,

      /**
       * Get the desktop's window manager. Each desktop must have a window manager.
       * If none is configured the default window manager {@link qx.ui.window.Window#DEFAULT_MANAGER_CLASS}
       * is used.
       *
       * @return {qx.ui.window.IWindowManager} The desktop's window manager
       */
      getWindowManager: function getWindowManager() {
        if (!this.__manager) {
          this.setWindowManager(new qx.ui.window.Window.DEFAULT_MANAGER_CLASS());
        }

        return this.__manager;
      },

      /**
       * Whether the configured layout supports a maximized window
       * e.g. is a Canvas.
       *
       * @return {Boolean} Whether the layout supports maximized windows
       */
      supportsMaximize: function supportsMaximize() {
        return true;
      },

      /**
       * Sets the desktop's window manager
       *
       * @param manager {qx.ui.window.IWindowManager} The window manager
       */
      setWindowManager: function setWindowManager(manager) {
        if (this.__manager) {
          this.__manager.setDesktop(null);
        }

        manager.setDesktop(this);
        this.__manager = manager;
      },

      /**
       * Event handler. Called if one of the managed windows changes its active
       * state.
       *
       * @param e {qx.event.type.Event} the event object.
       */
      _onChangeActive: function _onChangeActive(e) {
        if (e.getData()) {
          this.setActiveWindow(e.getTarget());
        } else if (this.getActiveWindow() == e.getTarget()) {
          this.setActiveWindow(null);
        }
      },
      // property apply
      _applyActiveWindow: function _applyActiveWindow(value, old) {
        this.getWindowManager().changeActiveWindow(value, old);
        this.getWindowManager().updateStack();
      },

      /**
       * Event handler. Called if one of the managed windows changes its modality
       *
       * @param e {qx.event.type.Event} the event object.
       */
      _onChangeModal: function _onChangeModal(e) {
        this.getWindowManager().updateStack();
      },

      /**
       * Event handler. Called if one of the managed windows changes its visibility
       * state.
       */
      _onChangeVisibility: function _onChangeVisibility() {
        this.getWindowManager().updateStack();
      },

      /**
       * Overrides the method {@link qx.ui.core.Widget#_afterAddChild}
       *
       * @param win {qx.ui.core.Widget} added widget
       */
      _afterAddChild: function _afterAddChild(win) {
        if (qx.Class.isDefined("qx.ui.window.Window") && win instanceof qx.ui.window.Window) {
          this._addWindow(win);
        }
      },

      /**
       * Handles the case, when a window is added to the desktop.
       *
       * @param win {qx.ui.window.Window} Window, which has been added
       */
      _addWindow: function _addWindow(win) {
        if (!this.getWindows().includes(win)) {
          this.getWindows().push(win);
          this.fireDataEvent("windowAdded", win);
          win.addListener("changeActive", this._onChangeActive, this);
          win.addListener("changeModal", this._onChangeModal, this);
          win.addListener("changeVisibility", this._onChangeVisibility, this);
        }

        if (win.getActive()) {
          this.setActiveWindow(win);
        }

        this.getWindowManager().updateStack();
      },

      /**
       * Overrides the method {@link qx.ui.core.Widget#_afterRemoveChild}
       *
       * @param win {qx.ui.core.Widget} removed widget
       */
      _afterRemoveChild: function _afterRemoveChild(win) {
        if (qx.Class.isDefined("qx.ui.window.Window") && win instanceof qx.ui.window.Window) {
          this._removeWindow(win);
        }
      },

      /**
       * Handles the case, when a window is removed from the desktop.
       *
       * @param win {qx.ui.window.Window} Window, which has been removed
       */
      _removeWindow: function _removeWindow(win) {
        if (this.getWindows().includes(win)) {
          qx.lang.Array.remove(this.getWindows(), win);
          this.fireDataEvent("windowRemoved", win);
          win.removeListener("changeActive", this._onChangeActive, this);
          win.removeListener("changeModal", this._onChangeModal, this);
          win.removeListener("changeVisibility", this._onChangeVisibility, this);
          this.getWindowManager().updateStack();
        }
      },

      /**
       * Get a list of all windows added to the desktop (including hidden windows)
       *
       * @return {qx.ui.window.Window[]} Array of managed windows
       */
      getWindows: function getWindows() {
        if (!this.__windows) {
          this.__windows = [];
        }

        return this.__windows;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeArray("__windows");

      this._disposeObjects("__manager");
    }
  });
  qx.ui.window.MDesktop.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MChildrenHandling": {
        "defer": "runtime",
        "require": true
      },
      "qx.ui.core.MBlocker": {
        "require": true
      },
      "qx.ui.window.MDesktop": {
        "require": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.ui.core.queue.Visibility": {
        "construct": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.bom.element.Cursor": {},
      "qx.dom.Node": {},
      "qx.bom.client.Event": {},
      "qx.bom.Event": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "event.help": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Shared implementation for all root widgets.
   */
  qx.Class.define("qx.ui.root.Abstract", {
    type: "abstract",
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MChildrenHandling, qx.ui.core.MBlocker, qx.ui.window.MDesktop],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Register as root for the focus handler

      qx.ui.core.FocusHandler.getInstance().addRoot(this); // Directly add to visibility queue

      qx.ui.core.queue.Visibility.add(this);
      this.initNativeHelp();
      this.addListener("keypress", this.__preventScrollWhenFocused, this);
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
        init: "root"
      },
      // overridden
      enabled: {
        refine: true,
        init: true
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /**
       *  Sets the global cursor style
       *
       *  The name of the cursor to show when the mouse pointer is over the widget.
       *  This is any valid CSS2 cursor name defined by W3C.
       *
       *  The following values are possible:
       *  <ul><li>default</li>
       *  <li>crosshair</li>
       *  <li>pointer (hand is the ie name and will mapped to pointer in non-ie).</li>
       *  <li>move</li>
       *  <li>n-resize</li>
       *  <li>ne-resize</li>
       *  <li>e-resize</li>
       *  <li>se-resize</li>
       *  <li>s-resize</li>
       *  <li>sw-resize</li>
       *  <li>w-resize</li>
       *  <li>nw-resize</li>
       *  <li>text</li>
       *  <li>wait</li>
       *  <li>help </li>
       *  <li>url([file]) = self defined cursor, file should be an ANI- or CUR-type</li>
       *  </ul>
       *
       * Please note that in the current implementation this has no effect in IE.
       */
      globalCursor: {
        check: "String",
        nullable: true,
        themeable: true,
        apply: "_applyGlobalCursor",
        event: "changeGlobalCursor"
      },

      /**
       * Whether the native context menu should be globally enabled. Setting this
       * property to <code>true</code> will allow native context menus in all
       * child widgets of this root.
       */
      nativeContextMenu: {
        refine: true,
        init: false
      },

      /**
       * If the user presses F1 in IE by default the onhelp event is fired and
       * IE’s help window is opened. Setting this property to <code>false</code>
       * prevents this behavior.
       */
      nativeHelp: {
        check: "Boolean",
        init: false,
        apply: "_applyNativeHelp"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __globalCursorStyleSheet: null,
      // overridden
      isRootWidget: function isRootWidget() {
        return true;
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      getLayout: function getLayout() {
        return this._getLayout();
      },
      // property apply
      _applyGlobalCursor: qx.core.Environment.select("engine.name", {
        "mshtml": function mshtml(value, old) {// empty implementation
        },
        // This would be the optimal solution.
        // For performance reasons this is impractical in IE
        "default": function _default(value, old) {
          var Stylesheet = qx.bom.Stylesheet;
          var sheet = this.__globalCursorStyleSheet;

          if (!sheet) {
            this.__globalCursorStyleSheet = sheet = Stylesheet.createElement();
          }

          Stylesheet.removeAllRules(sheet);

          if (value) {
            Stylesheet.addRule(sheet, "*", qx.bom.element.Cursor.compile(value).replace(";", "") + " !important");
          }
        }
      }),
      // property apply
      _applyNativeContextMenu: function _applyNativeContextMenu(value, old) {
        if (value) {
          this.removeListener("contextmenu", this._onNativeContextMenu, this, true);
        } else {
          this.addListener("contextmenu", this._onNativeContextMenu, this, true);
        }
      },

      /**
       * Stops the <code>contextmenu</code> event from showing the native context menu
       *
       * @param e {qx.event.type.Mouse} The event object
       */
      _onNativeContextMenu: function _onNativeContextMenu(e) {
        if (e.getTarget().getNativeContextMenu()) {
          return;
        }

        e.preventDefault();
      },

      /**
      * Fix unexpected scrolling when pressing "Space" while a widget is focused.
      *
      * @param e {qx.event.type.KeySequence} The KeySequence event
      */
      __preventScrollWhenFocused: function __preventScrollWhenFocused(e) {
        // Require space pressed
        if (e.getKeyIdentifier() !== "Space") {
          return;
        }

        var target = e.getTarget(); // Require focused. Allow scroll when container or root widget.

        var focusHandler = qx.ui.core.FocusHandler.getInstance();

        if (!focusHandler.isFocused(target)) {
          return;
        } // Require that widget does not accept text input


        var el = target.getContentElement();
        var nodeName = el.getNodeName();
        var domEl = el.getDomElement();

        if (nodeName === "input" || nodeName === "textarea" || domEl && domEl.contentEditable === "true") {
          return;
        } // do not prevent "space" key for natively focusable elements


        nodeName = qx.dom.Node.getName(e.getOriginalTarget());

        if (nodeName && ["input", "textarea", "select", "a"].indexOf(nodeName) > -1) {
          return;
        } // Ultimately, prevent default


        e.preventDefault();
      },
      // property apply
      _applyNativeHelp: function _applyNativeHelp(value, old) {
        if (qx.core.Environment.get("event.help")) {
          if (old === false) {
            qx.bom.Event.removeNativeListener(document, "help", function () {
              return false;
            });
          }

          if (value === false) {
            qx.bom.Event.addNativeListener(document, "help", function () {
              return false;
            });
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
      this.__globalCursorStyleSheet = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics, members) {
      qx.ui.core.MChildrenHandling.remap(members);
    }
  });
  qx.ui.root.Abstract.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Location": {},
      "qx.ui.core.Widget": {}
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
   * Each focus root delegates the focus handling to instances of the FocusHandler.
   */
  qx.Class.define("qx.ui.core.FocusHandler", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create data structure

      this.__roots = {};
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __roots: null,
      __activeChild: null,
      __focusedChild: null,
      __currentRoot: null,

      /**
       * Connects to a top-level root element (which initially receives
       * all events of the root). This are normally all page and application
       * roots, but no inline roots (they are typically sitting inside
       * another root).
       *
       * @param root {qx.ui.root.Abstract} Any root
       */
      connectTo: function connectTo(root) {
        // this.debug("Connect to: " + root);
        root.addListener("keypress", this.__onKeyPress, this);
        root.addListener("focusin", this._onFocusIn, this, true);
        root.addListener("focusout", this._onFocusOut, this, true);
        root.addListener("activate", this._onActivate, this, true);
        root.addListener("deactivate", this._onDeactivate, this, true);
      },

      /**
       * Registers a widget as a focus root. A focus root comes
       * with an separate tab sequence handling.
       *
       * @param widget {qx.ui.core.Widget} The widget to register
       */
      addRoot: function addRoot(widget) {
        // this.debug("Add focusRoot: " + widget);
        this.__roots[widget.$$hash] = widget;
      },

      /**
       * Deregisters a previous added widget.
       *
       * @param widget {qx.ui.core.Widget} The widget to deregister
       */
      removeRoot: function removeRoot(widget) {
        // this.debug("Remove focusRoot: " + widget);
        delete this.__roots[widget.$$hash];
      },

      /**
       * Get the active widget
       *
       * @return {qx.ui.core.Widget|null} The active widget or <code>null</code>
       *    if no widget is active
       */
      getActiveWidget: function getActiveWidget() {
        return this.__activeChild;
      },

      /**
       * Whether the given widget is the active one
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the given widget is active
       */
      isActive: function isActive(widget) {
        return this.__activeChild == widget;
      },

      /**
       * Get the focused widget
       *
       * @return {qx.ui.core.Widget|null} The focused widget or <code>null</code>
       *    if no widget has the focus
       */
      getFocusedWidget: function getFocusedWidget() {
        return this.__focusedChild;
      },

      /**
       * Whether the given widget is the focused one.
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the given widget is focused
       */
      isFocused: function isFocused(widget) {
        return this.__focusedChild == widget;
      },

      /**
       * Whether the given widgets acts as a focus root.
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the given widget is a focus root
       */
      isFocusRoot: function isFocusRoot(widget) {
        return !!this.__roots[widget.$$hash];
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Internal event handler for activate event.
       *
       * @param e {qx.event.type.Focus} Focus event
       */
      _onActivate: function _onActivate(e) {
        var target = e.getTarget();
        this.__activeChild = target; //this.debug("active: " + target);

        var root = this.__findFocusRoot(target);

        if (root != this.__currentRoot) {
          this.__currentRoot = root;
        }
      },

      /**
       * Internal event handler for deactivate event.
       *
       * @param e {qx.event.type.Focus} Focus event
       */
      _onDeactivate: function _onDeactivate(e) {
        var target = e.getTarget();

        if (this.__activeChild == target) {
          this.__activeChild = null;
        }
      },

      /**
       * Internal event handler for focusin event.
       *
       * @param e {qx.event.type.Focus} Focus event
       */
      _onFocusIn: function _onFocusIn(e) {
        var target = e.getTarget();

        if (target != this.__focusedChild) {
          this.__focusedChild = target;
          target.visualizeFocus();
        }
      },

      /**
       * Internal event handler for focusout event.
       *
       * @param e {qx.event.type.Focus} Focus event
       */
      _onFocusOut: function _onFocusOut(e) {
        var target = e.getTarget();

        if (target == this.__focusedChild) {
          this.__focusedChild = null;
          target.visualizeBlur();
        }
      },

      /**
       * Internal event handler for TAB key.
       *
       * @param e {qx.event.type.KeySequence} Key event
       */
      __onKeyPress: function __onKeyPress(e) {
        if (e.getKeyIdentifier() != "Tab") {
          return;
        }

        if (!this.__currentRoot) {
          return;
        } // Stop all key-events with a TAB keycode


        e.stopPropagation();
        e.preventDefault(); // Support shift key to reverse widget detection order

        var current = this.__focusedChild;

        if (!e.isShiftPressed()) {
          var next = current ? this.__getWidgetAfter(current) : this.__getFirstWidget();
        } else {
          var next = current ? this.__getWidgetBefore(current) : this.__getLastWidget();
        } // If there was a widget found, focus it


        if (next) {
          next.tabFocus();
        }
      },

      /*
      ---------------------------------------------------------------------------
        UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Finds the next focus root, starting with the given widget.
       *
       * @param widget {qx.ui.core.Widget} The widget to find a focus root for.
       * @return {qx.ui.core.Widget|null} The focus root for the given widget or
       * <code>true</code> if no focus root could be found
       */
      __findFocusRoot: function __findFocusRoot(widget) {
        var roots = this.__roots;

        while (widget) {
          if (roots[widget.$$hash]) {
            return widget;
          }

          widget = widget.getLayoutParent();
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        TAB SUPPORT IMPLEMENTATION
      ---------------------------------------------------------------------------
      */

      /**
       * Compares the order of two widgets
       *
       * @param widget1 {qx.ui.core.Widget} Widget A
       * @param widget2 {qx.ui.core.Widget} Widget B
       * @return {Integer} A sort() compatible integer with values
       *   small than 0, exactly 0 or bigger than 0.
       */
      __compareTabOrder: function __compareTabOrder(widget1, widget2) {
        if (widget1 === widget2) {
          return 0;
        } // Sort-Check #1: Tab-Index


        var tab1 = widget1.getTabIndex() || 0;
        var tab2 = widget2.getTabIndex() || 0;

        if (tab1 != tab2) {
          return tab1 - tab2;
        } // Computing location


        var el1 = widget1.getContentElement().getDomElement();
        var el2 = widget2.getContentElement().getDomElement();
        var Location = qx.bom.element.Location;
        var loc1 = Location.get(el1);
        var loc2 = Location.get(el2); // Sort-Check #2: Top-Position

        if (loc1.top != loc2.top) {
          return loc1.top - loc2.top;
        } // Sort-Check #3: Left-Position


        if (loc1.left != loc2.left) {
          return loc1.left - loc2.left;
        } // Sort-Check #4: zIndex


        var z1 = widget1.getZIndex();
        var z2 = widget2.getZIndex();

        if (z1 != z2) {
          return z1 - z2;
        }

        return 0;
      },

      /**
       * Returns the first widget.
       *
       * @return {qx.ui.core.Widget} Returns the first (positioned) widget from
       *    the current root.
       */
      __getFirstWidget: function __getFirstWidget() {
        return this.__getFirst(this.__currentRoot, null);
      },

      /**
       * Returns the last widget.
       *
       * @return {qx.ui.core.Widget} Returns the last (positioned) widget from
       *    the current root.
       */
      __getLastWidget: function __getLastWidget() {
        return this.__getLast(this.__currentRoot, null);
      },

      /**
       * Returns the widget after the given one.
       *
       * @param widget {qx.ui.core.Widget} Widget to start with
       * @return {qx.ui.core.Widget} The found widget.
       */
      __getWidgetAfter: function __getWidgetAfter(widget) {
        var root = this.__currentRoot;

        if (root == widget) {
          return this.__getFirstWidget();
        }

        while (widget && widget.getAnonymous()) {
          widget = widget.getLayoutParent();
        }

        if (widget == null) {
          return [];
        }

        var result = [];

        this.__collectAllAfter(root, widget, result);

        result.sort(this.__compareTabOrder);
        var len = result.length;
        return len > 0 ? result[0] : this.__getFirstWidget();
      },

      /**
       * Returns the widget before the given one.
       *
       * @param widget {qx.ui.core.Widget} Widget to start with
       * @return {qx.ui.core.Widget} The found widget.
       */
      __getWidgetBefore: function __getWidgetBefore(widget) {
        var root = this.__currentRoot;

        if (root == widget) {
          return this.__getLastWidget();
        }

        while (widget && widget.getAnonymous()) {
          widget = widget.getLayoutParent();
        }

        if (widget == null) {
          return [];
        }

        var result = [];

        this.__collectAllBefore(root, widget, result);

        result.sort(this.__compareTabOrder);
        var len = result.length;
        return len > 0 ? result[len - 1] : this.__getLastWidget();
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL API USED BY METHODS ABOVE
      ---------------------------------------------------------------------------
      */

      /**
       * Collects all widgets which are after the given widget in
       * the given parent widget. Append all found children to the
       * <code>list</code>.
       *
       * @param parent {qx.ui.core.Widget} Parent widget
       * @param widget {qx.ui.core.Widget} Child widget to start with
       * @param result {Array} Result list
       */
      __collectAllAfter: function __collectAllAfter(parent, widget, result) {
        var children = parent.getLayoutChildren();
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i]; // Filter spacers etc.

          if (!(child instanceof qx.ui.core.Widget)) {
            continue;
          }

          if (!this.isFocusRoot(child) && child.isEnabled() && child.isVisible()) {
            if (child.isTabable() && this.__compareTabOrder(widget, child) < 0) {
              result.push(child);
            }

            this.__collectAllAfter(child, widget, result);
          }
        }
      },

      /**
       * Collects all widgets which are before the given widget in
       * the given parent widget. Append all found children to the
       * <code>list</code>.
       *
       * @param parent {qx.ui.core.Widget} Parent widget
       * @param widget {qx.ui.core.Widget} Child widget to start with
       * @param result {Array} Result list
       */
      __collectAllBefore: function __collectAllBefore(parent, widget, result) {
        var children = parent.getLayoutChildren();
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i]; // Filter spacers etc.

          if (!(child instanceof qx.ui.core.Widget)) {
            continue;
          }

          if (!this.isFocusRoot(child) && child.isEnabled() && child.isVisible()) {
            if (child.isTabable() && this.__compareTabOrder(widget, child) > 0) {
              result.push(child);
            }

            this.__collectAllBefore(child, widget, result);
          }
        }
      },

      /**
       * Find first (positioned) widget. (Sorted by coordinates, zIndex, etc.)
       *
       * @param parent {qx.ui.core.Widget} Parent widget
       * @param firstWidget {qx.ui.core.Widget?null} Current first widget
       * @return {qx.ui.core.Widget} The first (positioned) widget
       */
      __getFirst: function __getFirst(parent, firstWidget) {
        var children = parent.getLayoutChildren();
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i]; // Filter spacers etc.

          if (!(child instanceof qx.ui.core.Widget)) {
            continue;
          } // Ignore focus roots completely


          if (!this.isFocusRoot(child) && child.isEnabled() && child.isVisible()) {
            if (child.isTabable()) {
              if (firstWidget == null || this.__compareTabOrder(child, firstWidget) < 0) {
                firstWidget = child;
              }
            } // Deep iteration into children hierarchy


            firstWidget = this.__getFirst(child, firstWidget);
          }
        }

        return firstWidget;
      },

      /**
       * Find last (positioned) widget. (Sorted by coordinates, zIndex, etc.)
       *
       * @param parent {qx.ui.core.Widget} Parent widget
       * @param lastWidget {qx.ui.core.Widget?null} Current last widget
       * @return {qx.ui.core.Widget} The last (positioned) widget
       */
      __getLast: function __getLast(parent, lastWidget) {
        var children = parent.getLayoutChildren();
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i]; // Filter spacers etc.

          if (!(child instanceof qx.ui.core.Widget)) {
            continue;
          } // Ignore focus roots completely


          if (!this.isFocusRoot(child) && child.isEnabled() && child.isVisible()) {
            if (child.isTabable()) {
              if (lastWidget == null || this.__compareTabOrder(child, lastWidget) > 0) {
                lastWidget = child;
              }
            } // Deep iteration into children hierarchy


            lastWidget = this.__getLast(child, lastWidget);
          }
        }

        return lastWidget;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeMap("__roots");

      this.__focusedChild = this.__activeChild = this.__currentRoot = null;
    }
  });
  qx.ui.core.FocusHandler.$$dbClassInfo = $$dbClassInfo;
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
   * Keeps data about the visibility of all widgets. Updates the internal
   * tree when widgets are added, removed or modify their visibility.
   */
  qx.Class.define("qx.ui.core.queue.Visibility", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue: [],

      /** @type {Map} map of widgets by hash code which are in the queue */
      __lookup: {},

      /** @type {Map} Maps hash codes to visibility */
      __data: {},

      /**
       * Clears the cached data of the given widget. Normally only used
       * during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       */
      remove: function remove(widget) {
        if (this.__lookup[widget.$$hash]) {
          delete this.__lookup[widget.$$hash];
          qx.lang.Array.remove(this.__queue, widget);
        }

        delete this.__data[widget.$$hash];
      },

      /**
       * Whether the given widget is visible.
       *
       * Please note that the information given by this method is queued and may not be accurate
       * until the next queue flush happens.
       *
       * @param widget {qx.ui.core.Widget} The widget to query
       * @return {Boolean} Whether the widget is visible
       */
      isVisible: function isVisible(widget) {
        return this.__data[widget.$$hash] || false;
      },

      /**
       * Computes the visibility for the given widget
       *
       * @param widget {qx.ui.core.Widget} The widget to update
       * @return {Boolean} Whether the widget is visible
       */
      __computeVisible: function __computeVisible(widget) {
        var data = this.__data;
        var hash = widget.$$hash;
        var visible; // Respect local value

        if (widget.isExcluded()) {
          visible = false;
        } else {
          // Parent hierarchy
          var parent = widget.$$parent;

          if (parent) {
            visible = this.__computeVisible(parent);
          } else {
            visible = widget.isRootWidget();
          }
        }

        return data[hash] = visible;
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
        qx.ui.core.queue.Manager.scheduleFlush("visibility");
      },

      /**
       * Flushes the visibility queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Dispose all registered objects
        var queue = this.__queue;
        var data = this.__data; // Dynamically add children to queue
        // Only respect already known widgets because otherwise the children
        // are also already in the queue (added on their own)

        for (var i = queue.length - 1; i >= 0; i--) {
          var hash = queue[i].$$hash;

          if (data[hash] != null) {
            // recursive method call which adds widgets to the queue so be
            // careful with that one (performance critical)
            queue[i].addChildrenToQueue(queue);
          }
        } // Cache old data, clear current data
        // Do this before starting with recomputation because
        // new data may also be added by related widgets and not
        // only the widget itself.


        var oldData = {};

        for (var i = queue.length - 1; i >= 0; i--) {
          var hash = queue[i].$$hash;
          oldData[hash] = data[hash];
          data[hash] = null;
        } // Finally recompute


        for (var i = queue.length - 1; i >= 0; i--) {
          var widget = queue[i];
          var hash = widget.$$hash;
          queue.splice(i, 1); // Only update when not already updated by another widget

          if (data[hash] == null) {
            this.__computeVisible(widget);
          } // Check for updates required to the appearance.
          // Hint: Invisible widgets are ignored inside appearance flush


          if (data[hash] && data[hash] != oldData[hash]) {
            widget.checkAppearanceNeeds();
          }
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue = [];
        this.__lookup = {};
      }
    }
  });
  qx.ui.core.queue.Visibility.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Window": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.root.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.dom.Node": {
        "construct": true
      },
      "qx.event.Registration": {
        "construct": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.core.queue.Layout": {
        "construct": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.bom.client.OperatingSystem": {
        "construct": true
      },
      "qx.ui.core.Widget": {
        "construct": true
      },
      "qx.bom.client.Engine": {},
      "qx.html.Root": {},
      "qx.bom.Viewport": {},
      "qx.bom.element.Style": {},
      "qx.dom.Element": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This is the root widget for qooxdoo applications with an
   * "application" like behaviour. The widget will span the whole viewport
   * and the document body will have no scrollbars.
   *
   * The root widget does not support paddings and decorators with insets.
   *
   * If you want to enhance HTML pages with qooxdoo widgets please use
   * {@link qx.ui.root.Page} eventually in combination with
   * {@link qx.ui.root.Inline} widgets.
   *
   * This class uses a {@link qx.ui.layout.Canvas} as fixed layout. The layout
   * cannot be changed.
   *
   * @require(qx.event.handler.Window)
   * @ignore(qx.ui.popup)
   * @ignore(qx.ui.popup.Manager.*)
   * @ignore(qx.ui.menu)
   * @ignore(qx.ui.menu.Manager.*)
   * @ignore(qx.ui)
   */
  qx.Class.define("qx.ui.root.Application", {
    extend: qx.ui.root.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param doc {Document} Document to use
     */
    construct: function construct(doc) {
      // Symbolic links
      this.__window = qx.dom.Node.getWindow(doc);
      this.__doc = doc; // Base call

      qx.ui.root.Abstract.constructor.call(this); // Resize handling

      qx.event.Registration.addListener(this.__window, "resize", this._onResize, this); // Use a hard-coded canvas layout

      this._setLayout(new qx.ui.layout.Canvas()); // Directly schedule layout for root element


      qx.ui.core.queue.Layout.add(this); // Register as root

      qx.ui.core.FocusHandler.getInstance().connectTo(this);
      this.getContentElement().disableScrolling(); // quick fix for [BUG #7680]

      this.getContentElement().setStyle("-webkit-backface-visibility", "hidden"); // prevent scrolling on touch devices

      this.addListener("touchmove", this.__stopScrolling, this); // handle focus for iOS which seems to deny any focus action

      if (qx.core.Environment.get("os.name") == "ios") {
        this.getContentElement().addListener("tap", function (e) {
          var widget = qx.ui.core.Widget.getWidgetByElement(e.getTarget());

          while (widget && !widget.isFocusable()) {
            widget = widget.getLayoutParent();
          }

          if (widget && widget.isFocusable()) {
            widget.getContentElement().focus();
          }
        }, this, true);
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __window: null,
      __doc: null,
      // overridden

      /**
       * Create the widget's container HTML element.
       *
       * @lint ignoreDeprecated(alert)
       * @return {qx.html.Element} The container HTML element
       */
      _createContentElement: function _createContentElement() {
        var doc = this.__doc;

        if (qx.core.Environment.get("engine.name") == "webkit") {
          // In the "DOMContentLoaded" event of WebKit (Safari, Chrome) no body
          // element seems to be available in the DOM, if the HTML file did not
          // contain a body tag explicitly. Unfortunately, it cannot be added
          // here dynamically.
          if (!doc.body) {
            alert("The application could not be started due to a missing body tag in the HTML file!");
          }
        } // Apply application layout


        var hstyle = doc.documentElement.style;
        var bstyle = doc.body.style;
        hstyle.overflow = bstyle.overflow = "hidden";
        hstyle.padding = hstyle.margin = bstyle.padding = bstyle.margin = "0px";
        hstyle.width = hstyle.height = bstyle.width = bstyle.height = "100%";
        var elem = doc.createElement("div");
        doc.body.appendChild(elem);
        var root = new qx.html.Root(elem);
        root.setStyles({
          "position": "absolute",
          "overflowX": "hidden",
          "overflowY": "hidden"
        }); // Store reference to the widget in the DOM element.

        root.connectWidget(this);
        return root;
      },

      /**
       * Listener for window's resize event
       *
       * @param e {qx.event.type.Event} Event object
       */
      _onResize: function _onResize(e) {
        qx.ui.core.queue.Layout.add(this); // close all popups

        if (qx.ui.popup && qx.ui.popup.Manager) {
          qx.ui.popup.Manager.getInstance().hideAll();
        } // close all menus


        if (qx.ui.menu && qx.ui.menu.Manager) {
          qx.ui.menu.Manager.getInstance().hideAll();
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var width = qx.bom.Viewport.getWidth(this.__window);
        var height = qx.bom.Viewport.getHeight(this.__window);
        return {
          minWidth: width,
          width: width,
          maxWidth: width,
          minHeight: height,
          height: height,
          maxHeight: height
        };
      },
      // overridden
      _applyPadding: function _applyPadding(value, old, name) {
        if (value && (name == "paddingTop" || name == "paddingLeft")) {
          throw new Error("The root widget does not support 'left', or 'top' paddings!");
        }

        qx.ui.root.Application.prototype._applyPadding.base.call(this, value, old, name);
      },

      /**
       * Handler for the native 'touchstart' on the window which prevents
       * the native page scrolling.
       * @param e {qx.event.type.Touch} The qooxdoo touch event.
       */
      __stopScrolling: function __stopScrolling(e) {
        var node = e.getOriginalTarget();

        while (node && node.style) {
          var touchAction = qx.bom.element.Style.get(node, "touch-action") !== "none" && qx.bom.element.Style.get(node, "touch-action") !== "";
          var webkitOverflowScrolling = qx.bom.element.Style.get(node, "-webkit-overflow-scrolling") === "touch";
          var overflowX = qx.bom.element.Style.get(node, "overflowX") != "hidden";
          var overflowY = qx.bom.element.Style.get(node, "overflowY") != "hidden";

          if (touchAction || webkitOverflowScrolling || overflowY || overflowX) {
            return;
          }

          node = node.parentNode;
        }

        e.preventDefault();
      },
      // overridden
      destroy: function destroy() {
        if (this.$$disposed) {
          return;
        }

        qx.dom.Element.remove(this.getContentElement().getDomElement());
        qx.ui.root.Application.prototype.destroy.base.call(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__window = this.__doc = null;
    }
  });
  qx.ui.root.Application.$$dbClassInfo = $$dbClassInfo;
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
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["html.webworker", "html.filereader", "html.geolocation", "html.audio", "html.audio.ogg", "html.audio.mp3", "html.audio.wav", "html.audio.au", "html.audio.aif", "html.video", "html.video.ogg", "html.video.h264", "html.video.webm", "html.storage.local", "html.storage.session", "html.storage.userdata", "html.classlist", "html.xpath", "html.xul", "html.canvas", "html.svg", "html.vml", "html.dataset", "html.element.contains", "html.element.compareDocumentPosition", "html.element.textcontent", "html.console", "html.image.naturaldimensions", "html.history.state", "html.selection", "html.node.isequalnode", "html.fullscreen"],
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
   * Internal class which contains the checks used by {@link qx.core.Environment}.
   * All checks in here are marked as internal which means you should never use
   * them directly.
   *
   * This class should contain all checks about HTML.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Html", {
    statics: {
      /**
       * Whether the client supports Web Workers.
       *
       * @internal
       * @return {Boolean} <code>true</code> if webworkers are supported
       */
      getWebWorker: function getWebWorker() {
        return window.Worker != null;
      },

      /**
       * Whether the client supports File Readers
       *
       * @internal
       * @return {Boolean} <code>true</code> if FileReaders are supported
       */
      getFileReader: function getFileReader() {
        return window.FileReader != null;
      },

      /**
       * Whether the client supports Geo Location.
       *
       * @internal
       * @return {Boolean} <code>true</code> if geolocation supported
       */
      getGeoLocation: function getGeoLocation() {
        return "geolocation" in navigator;
      },

      /**
       * Whether the client supports audio.
       *
       * @internal
       * @return {Boolean} <code>true</code> if audio is supported
       */
      getAudio: function getAudio() {
        return !!document.createElement('audio').canPlayType;
      },

      /**
       * Whether the client can play ogg audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioOgg: function getAudioOgg() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/ogg");
      },

      /**
       * Whether the client can play mp3 audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioMp3: function getAudioMp3() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/mpeg");
      },

      /**
       * Whether the client can play wave audio wave format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioWav: function getAudioWav() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/x-wav");
      },

      /**
       * Whether the client can play au audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioAu: function getAudioAu() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/basic");
      },

      /**
       * Whether the client can play aif audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioAif: function getAudioAif() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/x-aiff");
      },

      /**
       * Whether the client supports video.
       *
       * @internal
       * @return {Boolean} <code>true</code> if video is supported
       */
      getVideo: function getVideo() {
        return !!document.createElement('video').canPlayType;
      },

      /**
       * Whether the client supports ogg video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoOgg: function getVideoOgg() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/ogg; codecs="theora, vorbis"');
      },

      /**
       * Whether the client supports mp4 video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoH264: function getVideoH264() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
      },

      /**
       * Whether the client supports webm video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoWebm: function getVideoWebm() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/webm; codecs="vp8, vorbis"');
      },

      /**
       * Whether the client supports local storage.
       *
       * @internal
       * @return {Boolean} <code>true</code> if local storage is supported
       */
      getLocalStorage: function getLocalStorage() {
        try {
          // write once to make sure to catch safari's private mode [BUG #7718]
          window.localStorage.setItem("$qx_check", "test");
          window.localStorage.removeItem("$qx_check");
          return true;
        } catch (exc) {
          // Firefox Bug: localStorage doesn't work in file:/// documents
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=507361
          return false;
        }
      },

      /**
       * Whether the client supports session storage.
       *
       * @internal
       * @return {Boolean} <code>true</code> if session storage is supported
       */
      getSessionStorage: function getSessionStorage() {
        try {
          // write once to make sure to catch safari's private mode [BUG #7718]
          window.sessionStorage.setItem("$qx_check", "test");
          window.sessionStorage.removeItem("$qx_check");
          return true;
        } catch (exc) {
          // Firefox Bug: Local execution of window.sessionStorage throws error
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=357323
          return false;
        }
      },

      /**
       * Whether the client supports user data to persist data. This is only
       * relevant for IE < 8.
       *
       * @internal
       * @return {Boolean} <code>true</code> if the user data is supported.
       */
      getUserDataStorage: function getUserDataStorage() {
        var el = document.createElement("div");
        el.style["display"] = "none";
        document.getElementsByTagName("head")[0].appendChild(el);
        var supported = false;

        try {
          el.addBehavior("#default#userdata");
          el.load("qxtest");
          supported = true;
        } catch (e) {}

        document.getElementsByTagName("head")[0].removeChild(el);
        return supported;
      },

      /**
       * Whether the browser supports CSS class lists.
       * https://developer.mozilla.org/en-US/docs/DOM/element.classList
       *
       * @internal
       * @return {Boolean} <code>true</code> if class list is supported.
       */
      getClassList: function getClassList() {
        return !!(document.documentElement.classList && qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList");
      },

      /**
       * Checks if XPath could be used.
       *
       * @internal
       * @return {Boolean} <code>true</code> if xpath is supported.
       */
      getXPath: function getXPath() {
        return !!document.evaluate;
      },

      /**
       * Checks if XUL could be used.
       *
       * @internal
       * @return {Boolean} <code>true</code> if XUL is supported.
       */
      getXul: function getXul() {
        try {
          document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
          return true;
        } catch (e) {
          return false;
        }
      },

      /**
       * Checks if SVG could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if SVG is supported.
       */
      getSvg: function getSvg() {
        return document.implementation && document.implementation.hasFeature && (document.implementation.hasFeature("org.w3c.dom.svg", "1.0") || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));
      },

      /**
       * Checks if VML is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if VML is supported.
       */
      getVml: function getVml() {
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
        el.firstChild.style.behavior = "url(#default#VML)";
        var hasVml = _typeof(el.firstChild.adj) == "object";
        document.body.removeChild(el);
        return hasVml;
      },

      /**
       * Checks if canvas could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if canvas is supported.
       */
      getCanvas: function getCanvas() {
        return !!window.CanvasRenderingContext2D;
      },

      /**
       * Asynchronous check for using data urls.
       *
       * @internal
       * @param callback {Function} The function which should be executed as
       *   soon as the check is done.
       */
      getDataUrl: function getDataUrl(callback) {
        var data = new Image();

        data.onload = data.onerror = function () {
          // wrap that into a timeout because IE might execute it synchronously
          window.setTimeout(function () {
            callback.call(null, data.width == 1 && data.height == 1);
          }, 0);
        };

        data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      },

      /**
       * Checks if dataset could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if dataset is supported.
       */
      getDataset: function getDataset() {
        return !!document.documentElement.dataset;
      },

      /**
       * Check for element.contains
       *
       * @internal
       * @return {Boolean} <code>true</code> if element.contains is supported
       */
      getContains: function getContains() {
        // "object" in IE6/7/8, "function" in IE9
        return typeof document.documentElement.contains !== "undefined";
      },

      /**
       * Check for element.compareDocumentPosition
       *
       * @internal
       * @return {Boolean} <code>true</code> if element.compareDocumentPosition is supported
       */
      getCompareDocumentPosition: function getCompareDocumentPosition() {
        return typeof document.documentElement.compareDocumentPosition === "function";
      },

      /**
       * Check for element.textContent. Legacy IEs do not support this, use
       * innerText instead.
       *
       * @internal
       * @return {Boolean} <code>true</code> if textContent is supported
       */
      getTextContent: function getTextContent() {
        var el = document.createElement("span");
        return typeof el.textContent !== "undefined";
      },

      /**
       * Whether the client supports the fullscreen API.
       *
       * @internal
       * @return {Boolean} <code>true</code> if fullscreen is supported
       */
      getFullScreen: function getFullScreen() {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || false;
      },

      /**
       * Check for a console object.
       *
       * @internal
       * @return {Boolean} <code>true</code> if a console is available.
       */
      getConsole: function getConsole() {
        return typeof window.console !== "undefined";
      },

      /**
       * Check for the <code>naturalHeight</code> and <code>naturalWidth</code>
       * image element attributes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if both attributes are supported
       */
      getNaturalDimensions: function getNaturalDimensions() {
        var img = document.createElement("img");
        return typeof img.naturalHeight === "number" && typeof img.naturalWidth === "number";
      },

      /**
       * Check for HTML5 history manipulation support.
        * @internal
       * @return {Boolean} <code>true</code> if the HTML5 history API is supported
       */
      getHistoryState: function getHistoryState() {
        return typeof window.onpopstate !== "undefined" && typeof window.history.replaceState !== "undefined" && typeof window.history.pushState !== "undefined";
      },

      /**
       * Returns the name of the native object/function used to access the
       * document's text selection.
       *
       * @return {String|null} <code>getSelection</code> if the standard window.getSelection
       * function is available; <code>selection</code> if the MS-proprietary
       * document.selection object is available; <code>null</code> if no known
       * text selection API is available.
       */
      getSelection: function getSelection() {
        if (typeof window.getSelection === "function") {
          return "getSelection";
        }

        if (_typeof(document.selection) === "object") {
          return "selection";
        }

        return null;
      },

      /**
       * Check for the isEqualNode DOM method.
       *
       * @return {Boolean} <code>true</code> if isEqualNode is supported by DOM nodes
       */
      getIsEqualNode: function getIsEqualNode() {
        return typeof document.documentElement.isEqualNode === "function";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("html.webworker", statics.getWebWorker);
      qx.core.Environment.add("html.filereader", statics.getFileReader);
      qx.core.Environment.add("html.geolocation", statics.getGeoLocation);
      qx.core.Environment.add("html.audio", statics.getAudio);
      qx.core.Environment.add("html.audio.ogg", statics.getAudioOgg);
      qx.core.Environment.add("html.audio.mp3", statics.getAudioMp3);
      qx.core.Environment.add("html.audio.wav", statics.getAudioWav);
      qx.core.Environment.add("html.audio.au", statics.getAudioAu);
      qx.core.Environment.add("html.audio.aif", statics.getAudioAif);
      qx.core.Environment.add("html.video", statics.getVideo);
      qx.core.Environment.add("html.video.ogg", statics.getVideoOgg);
      qx.core.Environment.add("html.video.h264", statics.getVideoH264);
      qx.core.Environment.add("html.video.webm", statics.getVideoWebm);
      qx.core.Environment.add("html.storage.local", statics.getLocalStorage);
      qx.core.Environment.add("html.storage.session", statics.getSessionStorage);
      qx.core.Environment.add("html.storage.userdata", statics.getUserDataStorage);
      qx.core.Environment.add("html.classlist", statics.getClassList);
      qx.core.Environment.add("html.xpath", statics.getXPath);
      qx.core.Environment.add("html.xul", statics.getXul);
      qx.core.Environment.add("html.canvas", statics.getCanvas);
      qx.core.Environment.add("html.svg", statics.getSvg);
      qx.core.Environment.add("html.vml", statics.getVml);
      qx.core.Environment.add("html.dataset", statics.getDataset);
      qx.core.Environment.addAsync("html.dataurl", statics.getDataUrl);
      qx.core.Environment.add("html.element.contains", statics.getContains);
      qx.core.Environment.add("html.element.compareDocumentPosition", statics.getCompareDocumentPosition);
      qx.core.Environment.add("html.element.textcontent", statics.getTextContent);
      qx.core.Environment.add("html.console", statics.getConsole);
      qx.core.Environment.add("html.image.naturaldimensions", statics.getNaturalDimensions);
      qx.core.Environment.add("html.history.state", statics.getHistoryState);
      qx.core.Environment.add("html.selection", statics.getSelection);
      qx.core.Environment.add("html.node.isequalnode", statics.getIsEqualNode);
      qx.core.Environment.add("html.fullscreen", statics.getFullScreen);
    }
  });
  qx.bom.client.Html.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.log.appender.Util": {
        "require": true,
        "defer": "runtime"
      },
      "qx.bom.client.Html": {
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
      "qx.log.Logger": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "html.console": {
          "className": "qx.bom.client.Html"
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
   * Processes the incoming log entry and displays it by means of the native
   * logging capabilities of the client.
   *
   * Supported browsers:
   * * Firefox <4 using FireBug (if available).
   * * Firefox >=4 using the Web Console.
   * * WebKit browsers using the Web Inspector/Developer Tools.
   * * Internet Explorer 8+ using the F12 Developer Tools.
   * * Opera >=10.60 using either the Error Console or Dragonfly
   *
   * Currently unsupported browsers:
   * * Opera <10.60
   *
   * @require(qx.log.appender.Util)
   * @require(qx.bom.client.Html)
   */
  qx.Bootstrap.define("qx.log.appender.Native", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Processes a single log entry
       *
       * @param entry {Map} The entry to process
       */
      process: function process(entry) {
        if (qx.core.Environment.get("html.console")) {
          // Firefox 4's Web Console doesn't support "debug"
          var level = console[entry.level] ? entry.level : "log";

          if (console[level]) {
            var args = qx.log.appender.Util.toText(entry);
            console[level](args);
          }
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.log.Logger.register(statics);
    }
  });
  qx.log.appender.Native.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-4.js.map
