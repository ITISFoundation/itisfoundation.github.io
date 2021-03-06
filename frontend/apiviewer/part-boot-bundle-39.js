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
       2008 Dihedrals.com, http://www.dihedrals.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Chris Banford (zermattchris)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class iterates over the lines in a flow layout.
   *
   * @internal
   */
  qx.Class.define("qx.ui.layout.LineSizeIterator", {
    extend: Object,

    /**
     * @param children {qx.ui.core.Widget[]} The children of the flow layout to
     *    compute the lines from
     * @param spacing {Integer} The horizontal spacing between the children
     */
    construct: function construct(children, spacing) {
      this.__children = children;
      this.__spacing = spacing;
      this.__hasMoreLines = children.length > 0;
      this.__childIndex = 0;
    },
    members: {
      __children: null,
      __spacing: null,
      __hasMoreLines: null,
      __childIndex: null,

      /**
       * Computes the properties of the next line taking the available width into
       * account
       *
       * @param availWidth {Integer} The available width for the next line
       * @return {Map} A map containing the line's properties.
       */
      computeNextLine: function computeNextLine(availWidth) {
        var availWidth = availWidth || Infinity;

        if (!this.__hasMoreLines) {
          throw new Error("No more lines to compute");
        }

        var children = this.__children;
        var lineHeight = 0;
        var lineWidth = 0;
        var lineChildren = [];
        var gapsBefore = [];

        for (var i = this.__childIndex; i < children.length; i++) {
          var child = children[i];
          var size = child.getSizeHint();

          var gapBefore = this.__computeGapBeforeChild(i);

          var childWidth = size.width + gapBefore;
          var isFirstChild = i == this.__childIndex;

          if (!isFirstChild && lineWidth + childWidth > availWidth) {
            this.__childIndex = i;
            break;
          }

          var childHeight = size.height + child.getMarginTop() + child.getMarginBottom();
          lineChildren.push(child);
          gapsBefore.push(gapBefore);
          lineWidth += childWidth;
          lineHeight = Math.max(lineHeight, childHeight);

          if (child.getLayoutProperties().lineBreak) {
            this.__childIndex = i + 1;
            break;
          }
        }

        if (i >= children.length) {
          this.__hasMoreLines = false;
        }

        return {
          height: lineHeight,
          width: lineWidth,
          children: lineChildren,
          gapsBefore: gapsBefore
        };
      },

      /**
       * Computes the gap before the child at the given index
       *
       * @param childIndex {Integer} The index of the child widget
       * @return {Integer} The gap before the given child
       */
      __computeGapBeforeChild: function __computeGapBeforeChild(childIndex) {
        var isFirstInLine = childIndex == this.__childIndex;

        if (isFirstInLine) {
          return this.__children[childIndex].getMarginLeft();
        } else {
          return Math.max(this.__children[childIndex - 1].getMarginRight(), this.__children[childIndex].getMarginLeft(), this.__spacing);
        }
      },

      /**
       * Whether there are more lines
       *
       * @return {Boolean} Whether there are more lines
       */
      hasMoreLines: function hasMoreLines() {
        return this.__hasMoreLines;
      }
    }
  });
  qx.ui.layout.LineSizeIterator.$$dbClassInfo = $$dbClassInfo;
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
       2007 Christian Boulanger
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Boulanger
  
  ************************************************************************ */

  /**
   * A message to be dispatched on the message bus.
   */
  qx.Class.define("qx.event.message.Message", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param name {String} The name of the message
     * @param data {var} Any type of data to attach
     */
    construct: function construct(name, data) {
      qx.core.Object.constructor.call(this);

      if (name != null) {
        this.setName(name);
      }

      if (data != null) {
        this.setData(data);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Event name of the message. Based on this name the message is dispatched
       * to the event listeners.
       */
      name: {
        check: "String"
      },

      /**
       * Any data the sender wants to pass with the event.
       */
      data: {
        init: null,
        nullable: true
      },

      /**
       * A reference to the sending object.
       */
      sender: {
        check: "Object",
        nullable: true
      }
    },
    destruct: function destruct() {
      this.setData(null);
      this.setSender(null);
    }
  });
  qx.event.message.Message.$$dbClassInfo = $$dbClassInfo;
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
  
  ************************************************************************ */

  /**
   * Superclass for formatters and parsers.
   */
  qx.Interface.define("qx.util.format.IFormat", {
    members: {
      /**
       * Formats an object.
       *
       * @abstract
       * @param obj {var} The object to format.
       * @return {String} the formatted object.
       * @throws {Error} the abstract function warning.
       */
      format: function format(obj) {},

      /**
       * Parses an object.
       *
       * @abstract
       * @param str {String} the string to parse.
       * @return {var} the parsed object.
       * @throws {Error} the abstract function warning.
       */
      parse: function parse(str) {}
    }
  });
  qx.util.format.IFormat.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.format.IFormat": {
        "require": true
      },
      "qx.locale.Date": {
        "construct": true
      },
      "qx.locale.Manager": {},
      "qx.log.Logger": {},
      "qx.lang.String": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A formatter and parser for dates, see
   * http://www.unicode.org/reports/tr35/#Date_Format_Patterns
   *
   * Here is a quick overview of the format pattern keys:
   * <table>
   * <tr><th>Key &nbsp;<th>Description
   * <tr><td><code> G </code><td> era, e.g. "AD"
   * <tr><td><code> y </code><td> year
   * <tr><td><code> Y </code><td> week year
   * <tr><td><code> u </code><td> extended year [Not supported yet]
   * <tr><td><code> Q </code><td> quarter
   * <tr><td><code> q </code><td> stand-alone quarter
   * <tr><td><code> M </code><td> month
   * <tr><td><code> L </code><td> stand-alone month
   * <tr><td><code> I </code><td> chinese leap month [Not supported yet]
   * <tr><td><code> w </code><td> week of year
   * <tr><td><code> W </code><td> week of month
   * <tr><td><code> d </code><td> day of month
   * <tr><td><code> D </code><td> day of year
   * <tr><td><code> F </code><td> day of week in month [Not supported yet]
   * <tr><td><code> g </code><td> modified Julian day [Not supported yet]
   * <tr><td><code> E </code><td> day of week
   * <tr><td><code> e </code><td> local day of week
   * <tr><td><code> c </code><td> stand-alone local day of week
   * <tr><td><code> a </code><td> period of day (am or pm)
   * <tr><td><code> h </code><td> 12-hour hour
   * <tr><td><code> H </code><td> 24-hour hour
   * <tr><td><code> K </code><td> hour [0-11]
   * <tr><td><code> k </code><td> hour [1-24]
   * <tr><td><code> j </code><td> special symbol [Not supported yet]
   * <tr><td><code> m </code><td> minute
   * <tr><td><code> s </code><td> second
   * <tr><td><code> S </code><td> fractional second
   * <tr><td><code> A </code><td> millisecond in day [Not supported yet]
   * <tr><td><code> z </code><td> time zone, specific non-location format
   * <tr><td><code> Z </code><td> time zone, rfc822/gmt format
   * <tr><td><code> v </code><td> time zone, generic non-location format [Not supported yet]
   * <tr><td><code> V </code><td> time zone, like z except metazone abbreviations [Not supported yet]
   * </table>
   *
   * (This list is preliminary, not all format keys might be implemented). Most
   * keys support repetitions that influence the meaning of the format. Parts of the
   * format string that should not be interpreted as format keys have to be
   * single-quoted.
   *
   * The same format patterns will be used for both parsing and output formatting.
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.util.format.DateFormat", {
    extend: qx.core.Object,
    implement: [qx.util.format.IFormat],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param format {String|null} The format to use. If null, the locale's default
     * format is used.
     * @param locale {String?} optional locale to be used. In case this is not present, the {@link #locale} property of DateFormat
     * will be following the {@link qx.locale.Manager#locale} property of qx.locale.Manager
     */
    construct: function construct(format, locale) {
      qx.core.Object.constructor.call(this);
      this.__initialLocale = this.__locale = locale;

      if (format != null) {
        this.__format = format.toString();

        if (this.__format in qx.util.format.DateFormat.ISO_MASKS) {
          if (this.__format === 'isoUtcDateTime') {
            this.__UTC = true;
          }

          this.__format = qx.util.format.DateFormat.ISO_MASKS[this.__format];
        }
      } else {
        this.__format = qx.locale.Date.getDateFormat("long", this.getLocale()) + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss", this.getLocale());
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Convenience factory that returns a <code>DateFomat</code> instance that
       * uses a short date-only format. Beware that the overall layout of the
       * date/time format string is that of the locale in effect when the factory
       * function is called.
       *
       * Implemented as a quasi-singleton, so beware of side effects.
       *
       * @return {DateFormat} a DateFormat instance.
       */
      getDateInstance: function getDateInstance() {
        var DateFormat = qx.util.format.DateFormat;
        var format = qx.locale.Date.getDateFormat("short") + ""; // Memoizing the instance, so caller doesn't have to dispose it.

        if (DateFormat._dateInstance == null || DateFormat._dateInstance.__format != format) {
          DateFormat._dateInstance = new DateFormat(format);
        }

        return DateFormat._dateInstance;
      },

      /**
       * Convenience factory that returns a <code>DateFomat</code> instance that
       * uses a long date/time format. Beware that the overall layout of the
       * date/time format string is that of the locale in effect when the factory
       * function is called.
       *
       * Implemented as a quasi-singleton, so beware of side effects.
       *
       * @return {DateFormat} a DateFormat instance.
       */
      getDateTimeInstance: function getDateTimeInstance() {
        var DateFormat = qx.util.format.DateFormat;
        var format = qx.locale.Date.getDateFormat("long") + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss"); // Memoizing the instance, so caller doesn't have to dispose it.

        if (DateFormat._dateTimeInstance == null || DateFormat._dateTimeInstance.__format != format) {
          DateFormat._dateTimeInstance = new DateFormat(format);
        }

        return DateFormat._dateTimeInstance;
      },

      /**
       * @type {Integer} The threshold until when a year should be assumed to belong to the
       *   21st century (e.g. 12 -> 2012). Years over this threshold but below 100 will be
       *   assumed to belong to the 20th century (e.g. 88 -> 1988). Years over 100 will be
       *   used unchanged (e.g. 1792 -> 1792).
       */
      ASSUME_YEAR_2000_THRESHOLD: 30,

      /** @type {Map} Special masks of patterns that are used frequently*/
      ISO_MASKS: {
        isoDate: "yyyy-MM-dd",
        isoTime: "HH:mm:ss",
        isoDateTime: "yyyy-MM-dd'T'HH:mm:ss",
        isoUtcDateTime: "yyyy-MM-dd'T'HH:mm:ss'Z'"
      },

      /** @type {String} The am marker. */
      AM_MARKER: "am",

      /** @type {String} The pm marker. */
      PM_MARKER: "pm"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __locale: null,
      __initialLocale: null,
      __format: null,
      __parseFeed: null,
      __parseRules: null,
      __formatTree: null,
      __UTC: null,

      /**
       * Fills a number with leading zeros ("25" -> "0025").
       *
       * @param number {Integer} the number to fill.
       * @param minSize {Integer} the minimum size the returned string should have.
       * @return {String} the filled number as string.
       */
      __fillNumber: function __fillNumber(number, minSize) {
        var str = "" + (number < 0 ? -1 * number : number);

        while (str.length < minSize) {
          str = "0" + str;
        }

        return number < 0 ? "-" + str : str;
      },

      /**
       * Returns the day in year of a date.
       *
       * @param date {Date} the date.
       * @return {Integer} the day in year.
       */
      __getDayInYear: function __getDayInYear(date) {
        var helpDate = new Date(date.getTime());
        var day = helpDate.getDate();

        while (helpDate.getMonth() != 0) {
          // Set the date to the last day of the previous month
          helpDate.setDate(-1);
          day += helpDate.getDate() + 1;
        }

        return day;
      },

      /**
       * Returns the thursday in the same week as the date.
       *
       * @param date {Date} the date to get the thursday of.
       * @return {Date} the thursday in the same week as the date.
       */
      __thursdayOfSameWeek: function __thursdayOfSameWeek(date) {
        return new Date(date.getTime() + (3 - (date.getDay() + 6) % 7) * 86400000);
      },

      /**
       * Returns the week in year of a date.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week in year.
       */
      __getWeekInYear: function __getWeekInYear(date) {
        // The following algorithm comes from http://www.salesianer.de/util/kalwoch.html
        // Get the thursday of the week the date belongs to
        var thursdayDate = this.__thursdayOfSameWeek(date); // Get the year the thursday (and therefore the week) belongs to


        var weekYear = thursdayDate.getFullYear(); // Get the thursday of the week january 4th belongs to
        // (which defines week 1 of a year)

        var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(weekYear, 0, 4)); // Calculate the calendar week


        return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
      },

      /**
       * Returns the week in month of a date.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week in month.
       */
      __getWeekInMonth: function __getWeekInMonth(date) {
        var thursdayDate = this.__thursdayOfSameWeek(date);

        var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(date.getFullYear(), date.getMonth(), 4));

        return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
      },

      /**
       * Returns the week year of a date. (that is the year of the week where this date happens to be)
       * For a week in the middle of the summer, the year is easily obtained, but for a week
       * when New Year's Eve takes place, the year of that week is ambiguous.
       * The thursday day of that week is used to determine the year.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week year.
       */
      __getWeekYear: function __getWeekYear(date) {
        var thursdayDate = this.__thursdayOfSameWeek(date);

        return thursdayDate.getFullYear();
      },

      /**
       * Returns true if the year is a leap one.
       *
       * @param year {Integer} the year to check.
       * @return {Boolean} true if it is a leap year.
       */
      __isLeapYear: function __isLeapYear(year) {
        var februaryDate = new Date(year, 2, 1);
        februaryDate.setDate(-1);
        return februaryDate.getDate() + 1 === 29;
      },

      /**
       * Returns a json object with month and day as keys.
       *
       * @param dayOfYear {Integer} the day of year.
       * @param year {Integer} the year to check.
       * @return {Object} a json object {month: M, day: D}.
       */
      __getMonthAndDayFromDayOfYear: function __getMonthAndDayFromDayOfYear(dayOfYear, year) {
        var month = 0;
        var day = 0; // if we don't know the year, we take a non-leap year'

        if (!year) {
          year = 1971;
        }

        var dayCounter = 0;

        for (var i = 1; i <= 12; i++) {
          var tempDate = new Date(year, i, 1);
          tempDate.setDate(-1);
          var days = tempDate.getDate() + 1;
          dayCounter += days;

          if (dayCounter < dayOfYear) {
            month++;
            day += days;
          } else {
            day = dayOfYear - (dayCounter - days);
            break;
          }
        }

        return {
          month: month,
          day: day
        };
      },

      /**
       * Returns the year of a date when we know the week year
       *
       * @param weekYear {Integer} the week year.
       * @param month {Integer} the month
       * @param dayOfMonth {Integer} the day in month
       * @return {Integer} the year.
       */
      __getYearFromWeekYearAndMonth: function __getYearFromWeekYearAndMonth(weekYear, month, dayOfMonth) {
        var year;

        switch (month) {
          case 11:
            year = weekYear - 1;

            if (weekYear != this.__getWeekYear(new Date(year, month, dayOfMonth))) {
              year = weekYear;
            }

            break;

          case 0:
            year = weekYear + 1;

            if (weekYear != this.__getWeekYear(new Date(year, month, dayOfMonth))) {
              year = weekYear;
            }

            break;

          default:
            year = weekYear;
        }

        return year;
      },

      /**
       * Sets the new value for locale property
       * @param value {String} The new value.
       *
       */
      setLocale: function setLocale(value) {
        if (value !== null && typeof value != "string") {
          throw new Error("Cannot set locale to " + value + " - please provide a string");
        }

        this.__locale = value === null ? this.__initialLocale : value;
      },

      /**
       * Resets the Locale
       */
      resetLocale: function resetLocale() {
        this.setLocale(null);
      },

      /**
       * Returns the locale
       */
      getLocale: function getLocale() {
        var locale = this.__locale;

        if (locale === undefined) {
          locale = qx.locale.Manager.getInstance().getLocale();
        }

        return locale;
      },

      /**
       * Formats a date.
       *
       * @param date {Date} The date to format.
       * @return {String} the formatted date.
       */
      format: function format(date) {
        // check for null dates
        if (date == null) {
          return null;
        }

        if (isNaN(date.getTime())) {
          {
            qx.log.Logger.error("Provided date is invalid");
          }
          return null;
        }

        if (this.__UTC) {
          date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        }

        var locale = this.getLocale();
        var fullYear = date.getFullYear();
        var month = date.getMonth();
        var dayOfMonth = date.getDate();
        var dayOfWeek = date.getDay();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var ms = date.getMilliseconds();
        var timezoneOffset = date.getTimezoneOffset();
        var timezoneSign = timezoneOffset > 0 ? 1 : -1;
        var timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
        var timezoneMinutes = Math.abs(timezoneOffset) % 60; // Create the output

        this.__initFormatTree();

        var output = "";

        for (var i = 0; i < this.__formatTree.length; i++) {
          var currAtom = this.__formatTree[i];

          if (currAtom.type == "literal") {
            output += currAtom.text;
          } else {
            // This is a wildcard
            var wildcardChar = currAtom.character;
            var wildcardSize = currAtom.size; // Get its replacement

            var replacement = "?";

            switch (wildcardChar) {
              case 'y':
                // Year
                if (wildcardSize == 2) {
                  replacement = this.__fillNumber(fullYear % 100, 2);
                } else {
                  var year = Math.abs(fullYear);
                  replacement = year + "";

                  if (wildcardSize > replacement.length) {
                    for (var j = replacement.length; j < wildcardSize; j++) {
                      replacement = "0" + replacement;
                    }
                  }

                  if (fullYear < 0) {
                    replacement = "-" + replacement;
                  }
                }

                break;

              case 'Y':
                // Year
                replacement = this.__getWeekYear(date) + "";
                var year = replacement.replace('-', '');

                if (wildcardSize > replacement.length) {
                  for (var j = year.length; j < wildcardSize; j++) {
                    year = "0" + year;
                  }
                }

                replacement = replacement.indexOf("-") != -1 ? "-" + year : year;
                break;

              case 'G':
                // Era - there is no CLDR data for ERA yet
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = fullYear > 0 ? 'AD' : 'BC';
                } else if (wildcardSize == 4) {
                  replacement = fullYear > 0 ? 'Anno Domini' : 'Before Christ';
                } else if (wildcardSize == 5) {
                  replacement = fullYear > 0 ? 'A' : 'B';
                }

                break;

              case 'Q':
                // quarter
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber(parseInt(month / 4) + 1, wildcardSize);
                }

                if (wildcardSize == 3) {
                  replacement = 'Q' + (parseInt(month / 4) + 1);
                }

                break;

              case 'q':
                // quarter stand alone
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber(parseInt(month / 4) + 1, wildcardSize);
                }

                if (wildcardSize == 3) {
                  replacement = 'Q' + (parseInt(month / 4) + 1);
                }

                break;

              case 'D':
                // Day in year (e.g. 189)
                replacement = this.__fillNumber(this.__getDayInYear(date), wildcardSize);
                break;

              case 'd':
                // Day in month
                replacement = this.__fillNumber(dayOfMonth, wildcardSize);
                break;

              case 'w':
                // Week in year (e.g. 27)
                replacement = this.__fillNumber(this.__getWeekInYear(date), wildcardSize);
                break;

              case 'W':
                // Week in year (e.g. 27)
                replacement = this.__getWeekInMonth(date);
                break;

              case 'E':
                // Day in week
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
                }

                break;

              case 'e':
                // Day in week
                var startOfWeek = qx.locale.Date.getWeekStart(locale); // the index is 1 based

                var localeDayOfWeek = 1 + (dayOfWeek - startOfWeek >= 0 ? dayOfWeek - startOfWeek : 7 + (dayOfWeek - startOfWeek));

                if (wildcardSize >= 1 && wildcardSize <= 2) {
                  replacement = this.__fillNumber(localeDayOfWeek, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
                }

                break;

              case 'c':
                // Stand-alone local day in week
                var startOfWeek = qx.locale.Date.getWeekStart(locale); // the index is 1 based

                var localeDayOfWeek = 1 + (dayOfWeek - startOfWeek >= 0 ? dayOfWeek - startOfWeek : 7 + (dayOfWeek - startOfWeek));

                if (wildcardSize == 1) {
                  replacement = '' + localeDayOfWeek;
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "stand-alone", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "stand-alone", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "stand-alone", true);
                }

                break;

              case 'M':
                // Month
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber(month + 1, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getMonthName("wide", month, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getMonthName("narrow", month, locale, "format", true);
                }

                break;

              case 'L':
                // Stand-alone month
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber(month + 1, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "stand-alone", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getMonthName("wide", month, locale, "stand-alone", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getMonthName("narrow", month, locale, "stand-alone", true);
                }

                break;

              case 'a':
                // am/pm marker
                // NOTE: 0:00 is am, 12:00 is pm
                replacement = hours < 12 ? qx.locale.Date.getAmMarker(locale) : qx.locale.Date.getPmMarker(locale);
                break;

              case 'H':
                // Hour in day (0-23)
                replacement = this.__fillNumber(hours, wildcardSize);
                break;

              case 'k':
                // Hour in day (1-24)
                replacement = this.__fillNumber(hours == 0 ? 24 : hours, wildcardSize);
                break;

              case 'K':
                // Hour in am/pm (0-11)
                replacement = this.__fillNumber(hours % 12, wildcardSize);
                break;

              case 'h':
                // Hour in am/pm (1-12)
                replacement = this.__fillNumber(hours % 12 == 0 ? 12 : hours % 12, wildcardSize);
                break;

              case 'm':
                // Minute in hour
                replacement = this.__fillNumber(minutes, wildcardSize);
                break;

              case 's':
                // Second in minute
                replacement = this.__fillNumber(seconds, wildcardSize);
                break;

              case 'S':
                // Fractional second
                replacement = this.__fillNumber(ms, 3);

                if (wildcardSize < replacement.length) {
                  replacement = replacement.substr(0, wildcardSize);
                } else {
                  while (wildcardSize > replacement.length) {
                    // if needed, fill the remaining wildcard length with trailing zeros
                    replacement += "0";
                  }
                }

                break;

              case 'z':
                // Time zone
                if (wildcardSize >= 1 && wildcardSize <= 4) {
                  replacement = "GMT" + (timezoneSign > 0 ? "-" : "+") + this.__fillNumber(Math.abs(timezoneHours), 2) + ":" + this.__fillNumber(timezoneMinutes, 2);
                }

                break;

              case 'Z':
                // RFC 822 time zone
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = (timezoneSign > 0 ? "-" : "+") + this.__fillNumber(Math.abs(timezoneHours), 2) + this.__fillNumber(timezoneMinutes, 2);
                } else {
                  replacement = "GMT" + (timezoneSign > 0 ? "-" : "+") + this.__fillNumber(Math.abs(timezoneHours), 2) + ":" + this.__fillNumber(timezoneMinutes, 2);
                }

                break;
            }

            output += replacement;
          }
        }

        return output;
      },

      /**
       * Parses a date.
       *
       * @param dateStr {String} the date to parse.
       * @return {Date} the parsed date.
       * @throws {Error} If the format is not well formed or if the date string does not
       *       match to the format.
       */
      parse: function parse(dateStr) {
        this.__initParseFeed(); // Apply the regex


        var hit = this.__parseFeed.regex.exec(dateStr);

        if (hit == null) {
          throw new Error("Date string '" + dateStr + "' does not match the date format: " + this.__format);
        } // Apply the rules


        var dateValues = {
          era: 1,
          year: 1970,
          quarter: 1,
          month: 0,
          day: 1,
          dayOfYear: 1,
          hour: 0,
          ispm: false,
          weekDay: 4,
          weekYear: 1970,
          weekOfMonth: 1,
          weekOfYear: 1,
          min: 0,
          sec: 0,
          ms: 0
        };
        var currGroup = 1;
        var applyWeekYearAfterRule = false;
        var applyDayOfYearAfterRule = false;

        for (var i = 0; i < this.__parseFeed.usedRules.length; i++) {
          var rule = this.__parseFeed.usedRules[i];
          var value = hit[currGroup];

          if (rule.field != null) {
            dateValues[rule.field] = parseInt(value, 10);
          } else {
            rule.manipulator(dateValues, value, rule.pattern);
          }

          if (rule.pattern == "Y+") {
            var yearRuleApplied = false;

            for (var k = 0; k < this.__parseFeed.usedRules.length; k++) {
              if (this.__parseFeed.usedRules[k].pattern == 'y+') {
                yearRuleApplied = true;
                break;
              }
            }

            if (!yearRuleApplied) {
              applyWeekYearAfterRule = true;
            }
          }

          if (rule.pattern.indexOf("D") != -1) {
            var dayRuleApplied = false;

            for (var k = 0; k < this.__parseFeed.usedRules.length; k++) {
              if (this.__parseFeed.usedRules[k].pattern.indexOf("d") != -1) {
                dayRuleApplied = true;
                break;
              }
            }

            if (!dayRuleApplied) {
              applyDayOfYearAfterRule = true;
            }
          }

          currGroup += rule.groups == null ? 1 : rule.groups;
        }

        if (applyWeekYearAfterRule) {
          dateValues.year = this.__getYearFromWeekYearAndMonth(dateValues.weekYear, dateValues.month, dateValues.day);
        }

        if (applyDayOfYearAfterRule) {
          var dayAndMonth = this.__getMonthAndDayFromDayOfYear(dateValues.dayOfYear, dateValues.year);

          dateValues.month = dayAndMonth.month;
          dateValues.day = dayAndMonth.day;
        }

        if (dateValues.era < 0 && dateValues.year * dateValues.era < 0) {
          dateValues.year = dateValues.year * dateValues.era;
        }

        var date = new Date(dateValues.year, dateValues.month, dateValues.day, dateValues.ispm ? dateValues.hour + 12 : dateValues.hour, dateValues.min, dateValues.sec, dateValues.ms);

        if (this.__UTC) {
          date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        }

        if (dateValues.month != date.getMonth() || dateValues.year != date.getFullYear()) {
          throw new Error("Error parsing date '" + dateStr + "': the value for day or month is too large");
        }

        return date;
      },

      /**
       * Helper method for {@link #format()} and {@link #parse()}.
       * Parses the date format.
       *
       */
      __initFormatTree: function __initFormatTree() {
        if (this.__formatTree != null) {
          return;
        }

        this.__formatTree = [];
        var currWildcardChar;
        var currWildcardSize = 0;
        var currLiteral = "";
        var format = this.__format;
        var state = "default";
        var i = 0;

        while (i < format.length) {
          var currChar = format.charAt(i);

          switch (state) {
            case "quoted_literal":
              // We are now inside a quoted literal
              // Check whether the current character is an escaped "'" character
              if (currChar == "'") {
                if (i + 1 >= format.length) {
                  // this is the last character
                  i++;
                  break;
                }

                var lookAhead = format.charAt(i + 1);

                if (lookAhead == "'") {
                  currLiteral += currChar;
                  i++;
                } else {
                  // quoted literal ends
                  i++;
                  state = "unkown";
                }
              } else {
                currLiteral += currChar;
                i++;
              }

              break;

            case "wildcard":
              // Check whether the currChar belongs to that wildcard
              if (currChar == currWildcardChar) {
                // It does -> Raise the size
                currWildcardSize++;
                i++;
              } else {
                // It does not -> The current wildcard is done
                this.__formatTree.push({
                  type: "wildcard",
                  character: currWildcardChar,
                  size: currWildcardSize
                });

                currWildcardChar = null;
                currWildcardSize = 0;
                state = "default";
              }

              break;

            default:
              // We are not (any more) in a wildcard or quoted literal -> Check what's starting here
              if (currChar >= 'a' && currChar <= 'z' || currChar >= 'A' && currChar <= 'Z') {
                // This is a letter -> All letters are wildcards
                // Start a new wildcard
                currWildcardChar = currChar;
                state = "wildcard";
              } else if (currChar == "'") {
                if (i + 1 >= format.length) {
                  // this is the last character
                  currLiteral += currChar;
                  i++;
                  break;
                }

                var lookAhead = format.charAt(i + 1);

                if (lookAhead == "'") {
                  currLiteral += currChar;
                  i++;
                }

                i++;
                state = "quoted_literal";
              } else {
                state = "default";
              }

              if (state != "default") {
                // Add the literal
                if (currLiteral.length > 0) {
                  this.__formatTree.push({
                    type: "literal",
                    text: currLiteral
                  });

                  currLiteral = "";
                }
              } else {
                // This is an unquoted literal -> Add it to the current literal
                currLiteral += currChar;
                i++;
              }

              break;
          }
        } // Add the last wildcard or literal


        if (currWildcardChar != null) {
          this.__formatTree.push({
            type: "wildcard",
            character: currWildcardChar,
            size: currWildcardSize
          });
        } else if (currLiteral.length > 0) {
          this.__formatTree.push({
            type: "literal",
            text: currLiteral
          });
        }
      },

      /**
       * Initializes the parse feed.
       *
       * The parse contains everything needed for parsing: The regular expression
       * (in compiled and uncompiled form) and the used rules.
       *
       * @throws {Error} If the date format is malformed.
       */
      __initParseFeed: function __initParseFeed() {
        if (this.__parseFeed != null) {
          // We already have the parse feed
          return;
        }

        var format = this.__format; // Initialize the rules

        this.__initParseRules();

        this.__initFormatTree(); // Get the used rules and construct the regex pattern


        var usedRules = [];
        var pattern = "^";

        for (var atomIdx = 0; atomIdx < this.__formatTree.length; atomIdx++) {
          var currAtom = this.__formatTree[atomIdx];

          if (currAtom.type == "literal") {
            pattern += qx.lang.String.escapeRegexpChars(currAtom.text);
          } else {
            // This is a wildcard
            var wildcardChar = currAtom.character;
            var wildcardSize = currAtom.size; // Get the rule for this wildcard

            var wildcardRule;

            for (var ruleIdx = 0; ruleIdx < this.__parseRules.length; ruleIdx++) {
              var rule = this.__parseRules[ruleIdx];

              if (this.__isRuleForWildcard(rule, wildcardChar, wildcardSize)) {
                // We found the right rule for the wildcard
                wildcardRule = rule;
                break;
              }
            } // Check the rule


            if (wildcardRule == null) {
              // We have no rule for that wildcard -> Malformed date format
              var wildcardStr = "";

              for (var i = 0; i < wildcardSize; i++) {
                wildcardStr += wildcardChar;
              }

              throw new Error("Malformed date format: " + format + ". Wildcard " + wildcardStr + " is not supported");
            } else {
              // Add the rule to the pattern
              usedRules.push(wildcardRule);
              pattern += wildcardRule.regex;
            }
          }
        }

        pattern += "$"; // Create the regex

        var regex;

        try {
          regex = new RegExp(pattern);
        } catch (exc) {
          throw new Error("Malformed date format: " + format);
        } // Create the this.__parseFeed


        this.__parseFeed = {
          regex: regex,
          "usedRules": usedRules,
          pattern: pattern
        };
      },

      /**
       * Checks whether the rule matches the wildcard or not.
       * @param rule {Object} the rule we try to match with the wildcard
       * @param wildcardChar {String} the character in the wildcard
       * @param wildcardSize {Integer} the number of  wildcardChar characters in the wildcard
       * @return {Boolean} if the rule matches or not
       */
      __isRuleForWildcard: function __isRuleForWildcard(rule, wildcardChar, wildcardSize) {
        if (wildcardChar === 'y' && rule.pattern === 'y+') {
          rule.regex = rule.regexFunc(wildcardSize);
          return true;
        } else if (wildcardChar === 'Y' && rule.pattern === 'Y+') {
          rule.regex = rule.regexFunc(wildcardSize);
          return true;
        } else {
          return wildcardChar == rule.pattern.charAt(0) && wildcardSize == rule.pattern.length;
        }
      },

      /**
       * Initializes the static parse rules.
       *
       */
      __initParseRules: function __initParseRules() {
        var DateFormat = qx.util.format.DateFormat;
        var LString = qx.lang.String;

        if (this.__parseRules != null) {
          // The parse rules are already initialized
          return;
        }

        var rules = this.__parseRules = [];
        var amMarker = qx.locale.Date.getAmMarker(this.getLocale()).toString() || DateFormat.AM_MARKER;
        var pmMarker = qx.locale.Date.getPmMarker(this.getLocale()).toString() || DateFormat.PM_MARKER;
        var locale = this.getLocale();

        var yearManipulator = function yearManipulator(dateValues, value) {
          value = parseInt(value, 10);

          if (value >= 0) {
            if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
              value += 2000;
            } else if (value < 100) {
              value += 1900;
            }
          }

          dateValues.year = value;
        };

        var weekYearManipulator = function weekYearManipulator(dateValues, value) {
          value = parseInt(value, 10);

          if (value >= 0) {
            if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
              value += 2000;
            } else if (value < 100) {
              value += 1900;
            }
          }

          dateValues.weekYear = value;
        };

        var monthManipulator = function monthManipulator(dateValues, value) {
          dateValues.month = parseInt(value, 10) - 1;
        };

        var localWeekDayManipulator = function localWeekDayManipulator(dateValues, value) {
          var startOfWeek = qx.locale.Date.getWeekStart(locale);
          var dayOfWeek = parseInt(value, 10) - 1 + startOfWeek <= 6 ? parseInt(value, 10) - 1 + startOfWeek : parseInt(value, 10) - 1 + startOfWeek - 7;
          dateValues.weekDay = dayOfWeek;
        };

        var ampmManipulator = function ampmManipulator(dateValues, value) {
          var pmMarker = qx.locale.Date.getPmMarker(locale).toString() || DateFormat.PM_MARKER;
          dateValues.ispm = value == pmMarker;
        };

        var noZeroHourManipulator = function noZeroHourManipulator(dateValues, value) {
          dateValues.hour = parseInt(value, 10) % 24;
        };

        var noZeroAmPmHourManipulator = function noZeroAmPmHourManipulator(dateValues, value) {
          dateValues.hour = parseInt(value, 10) % 12;
        };

        var ignoreManipulator = function ignoreManipulator(dateValues, value) {
          return;
        };

        var narrowEraNames = ['A', 'B'];

        var narrowEraNameManipulator = function narrowEraNameManipulator(dateValues, value) {
          dateValues.era = value == 'A' ? 1 : -1;
        };

        var abbrevEraNames = ['AD', 'BC'];

        var abbrevEraNameManipulator = function abbrevEraNameManipulator(dateValues, value) {
          dateValues.era = value == 'AD' ? 1 : -1;
        };

        var fullEraNames = ['Anno Domini', 'Before Christ'];

        var fullEraNameManipulator = function fullEraNameManipulator(dateValues, value) {
          dateValues.era = value == 'Anno Domini' ? 1 : -1;
        };

        var abbrevQuarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

        var abbrevQuarterManipulator = function abbrevQuarterManipulator(dateValues, value) {
          dateValues.quarter = abbrevQuarterNames.indexOf(value);
        };

        var fullQuarterNames = ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'];

        var fullQuarterManipulator = function fullQuarterManipulator(dateValues, value) {
          dateValues.quarter = fullQuarterNames.indexOf(value);
        };

        var cache = {};

        var dateNamesManipulator = function dateNamesManipulator(pattern) {
          var monthPatternLetters = ['L', 'M'];
          var dayPatternLetters = ['c', 'e', 'E'];
          var firstLetterInPattern = pattern.charAt(0);
          var isMonth = monthPatternLetters.indexOf(firstLetterInPattern) >= 0;

          var getContext = function getContext() {
            var letters = isMonth ? monthPatternLetters : dayPatternLetters;
            var context = firstLetterInPattern === letters[0] ? "stand-alone" : "format";
            var patternLength = pattern.length;
            var lengthName = 'abbreviated';

            switch (patternLength) {
              case 4:
                lengthName = 'wide';
                break;

              case 5:
                lengthName = 'narrow';
                break;

              default:
                lengthName = 'abbreviated';
            }

            return [context, lengthName];
          };

          if (!cache[pattern]) {
            cache[pattern] = {};
            var context = getContext();
            var func = isMonth ? qx.locale.Date.getMonthNames : qx.locale.Date.getDayNames;
            var names = func.call(qx.locale.Date, context[1], locale, context[0], true);

            for (var i = 0, l = names.length; i < l; i++) {
              names[i] = LString.escapeRegexpChars(names[i].toString());
            }

            cache[pattern].data = names;

            cache[pattern].func = function (dateValues, value) {
              value = LString.escapeRegexpChars(value);
              dateValues[isMonth ? 'month' : 'weekDay'] = names.indexOf(value);
            };
          }

          return cache[pattern];
        }; // Unsupported: F (Day of week in month)


        rules.push({
          pattern: "y+",
          regexFunc: function regexFunc(yNumber) {
            var regex = "(-*";

            for (var i = 0; i < yNumber; i++) {
              regex += "\\d";

              if (i === yNumber - 1 && i !== 1) {
                regex += "+?";
              }
            }

            regex += ")";
            return regex;
          },
          manipulator: yearManipulator
        });
        rules.push({
          pattern: "Y+",
          regexFunc: function regexFunc(yNumber) {
            var regex = "(-*";

            for (var i = 0; i < yNumber; i++) {
              regex += "\\d";

              if (i === yNumber - 1) {
                regex += "+?";
              }
            }

            regex += ")";
            return regex;
          },
          manipulator: weekYearManipulator
        });
        rules.push({
          pattern: "G",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GG",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GGG",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GGGG",
          regex: "(" + fullEraNames.join("|") + ")",
          manipulator: fullEraNameManipulator
        });
        rules.push({
          pattern: "GGGGG",
          regex: "(" + narrowEraNames.join("|") + ")",
          manipulator: narrowEraNameManipulator
        });
        rules.push({
          pattern: "Q",
          regex: "(\\d\\d*?)",
          field: "quarter"
        });
        rules.push({
          pattern: "QQ",
          regex: "(\\d\\d?)",
          field: "quarter"
        });
        rules.push({
          pattern: "QQQ",
          regex: "(" + abbrevQuarterNames.join("|") + ")",
          manipulator: abbrevQuarterManipulator
        });
        rules.push({
          pattern: "QQQQ",
          regex: "(" + fullQuarterNames.join("|") + ")",
          manipulator: fullQuarterManipulator
        });
        rules.push({
          pattern: "q",
          regex: "(\\d\\d*?)",
          field: "quarter"
        });
        rules.push({
          pattern: "qq",
          regex: "(\\d\\d?)",
          field: "quarter"
        });
        rules.push({
          pattern: "qqq",
          regex: "(" + abbrevQuarterNames.join("|") + ")",
          manipulator: abbrevQuarterManipulator
        });
        rules.push({
          pattern: "qqqq",
          regex: "(" + fullQuarterNames.join("|") + ")",
          manipulator: fullQuarterManipulator
        });
        rules.push({
          pattern: "M",
          regex: "(\\d\\d*?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "MM",
          regex: "(\\d\\d?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "MMM",
          regex: "(" + dateNamesManipulator("MMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMM").func
        });
        rules.push({
          pattern: "MMMM",
          regex: "(" + dateNamesManipulator("MMMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMMM").func
        });
        rules.push({
          pattern: "MMMMM",
          regex: "(" + dateNamesManipulator("MMMMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMMMM").func
        });
        rules.push({
          pattern: "L",
          regex: "(\\d\\d*?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "LL",
          regex: "(\\d\\d?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "LLL",
          regex: "(" + dateNamesManipulator("LLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLL").func
        });
        rules.push({
          pattern: "LLLL",
          regex: "(" + dateNamesManipulator("LLLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLLL").func
        });
        rules.push({
          pattern: "LLLLL",
          regex: "(" + dateNamesManipulator("LLLLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLLLL").func
        });
        rules.push({
          pattern: "dd",
          regex: "(\\d\\d?)",
          field: "day"
        });
        rules.push({
          pattern: "d",
          regex: "(\\d\\d*?)",
          field: "day"
        });
        rules.push({
          pattern: "D",
          regex: "(\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "DD",
          regex: "(\\d\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "DDD",
          regex: "(\\d\\d\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "E",
          regex: "(" + dateNamesManipulator("E").data.join("|") + ")",
          manipulator: dateNamesManipulator("E").func
        });
        rules.push({
          pattern: "EE",
          regex: "(" + dateNamesManipulator("EE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EE").func
        });
        rules.push({
          pattern: "EEE",
          regex: "(" + dateNamesManipulator("EEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEE").func
        });
        rules.push({
          pattern: "EEEE",
          regex: "(" + dateNamesManipulator("EEEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEEE").func
        });
        rules.push({
          pattern: "EEEEE",
          regex: "(" + dateNamesManipulator("EEEEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEEEE").func
        });
        rules.push({
          pattern: "e",
          regex: "(\\d?)",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "ee",
          regex: "(\\d\\d?)",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "eee",
          regex: "(" + dateNamesManipulator("eee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eee").func
        });
        rules.push({
          pattern: "eeee",
          regex: "(" + dateNamesManipulator("eeee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eeee").func
        });
        rules.push({
          pattern: "eeeee",
          regex: "(" + dateNamesManipulator("eeeee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eeeee").func
        });
        rules.push({
          pattern: "c",
          regex: "\\d?",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "ccc",
          regex: "(" + dateNamesManipulator("ccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("ccc").func
        });
        rules.push({
          pattern: "cccc",
          regex: "(" + dateNamesManipulator("cccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("cccc").func
        });
        rules.push({
          pattern: "ccccc",
          regex: "(" + dateNamesManipulator("ccccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("ccccc").func
        });
        rules.push({
          pattern: "a",
          regex: "(" + amMarker + "|" + pmMarker + ")",
          manipulator: ampmManipulator
        });
        rules.push({
          pattern: "W",
          regex: "(\\d?)",
          field: "weekOfMonth"
        });
        rules.push({
          pattern: "w",
          regex: "(\\d\\d?)",
          field: "weekOfYear"
        });
        rules.push({
          pattern: "ww",
          regex: "(\\d\\d)",
          field: "weekOfYear"
        });
        rules.push({
          pattern: "HH",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "H",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "kk",
          regex: "(\\d\\d?)",
          manipulator: noZeroHourManipulator
        });
        rules.push({
          pattern: "k",
          regex: "(\\d\\d?)",
          manipulator: noZeroHourManipulator
        });
        rules.push({
          pattern: "KK",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "K",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "hh",
          regex: "(\\d\\d?)",
          manipulator: noZeroAmPmHourManipulator
        });
        rules.push({
          pattern: "h",
          regex: "(\\d\\d?)",
          manipulator: noZeroAmPmHourManipulator
        });
        rules.push({
          pattern: "mm",
          regex: "(\\d\\d?)",
          field: "min"
        });
        rules.push({
          pattern: "m",
          regex: "(\\d\\d?)",
          field: "min"
        });
        rules.push({
          pattern: "ss",
          regex: "(\\d\\d?)",
          field: "sec"
        });
        rules.push({
          pattern: "s",
          regex: "(\\d\\d?)",
          field: "sec"
        });
        rules.push({
          pattern: "SSS",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "SS",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "S",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "Z",
          regex: "([\\+\\-]\\d\\d\\d\\d)",
          manipulator: ignoreManipulator
        });
        rules.push({
          pattern: "z",
          regex: "(GMT[\\+\\-]\\d\\d:\\d\\d)",
          manipulator: ignoreManipulator
        });
      }
    }
  });
  qx.util.format.DateFormat.$$dbClassInfo = $$dbClassInfo;
})();

//
(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.locale.Manager": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Assert": {}
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
   * Static class that provides localized date information (like names of week
   * days, AM/PM markers, start of week, etc.).
   *
   * @cldr()
   */
  qx.Class.define("qx.locale.Date", {
    statics: {
      /**
       * Reference to the locale manager.
       *
       * @internal
       */
      __mgr: qx.locale.Manager.getInstance(),

      /**
       * Get AM marker for time definitions
       *
       * @param locale {String} optional locale to be used
       * @return {String} translated AM marker.
       */
      getAmMarker: function getAmMarker(locale) {
        return this.__mgr.localize("cldr_am", [], locale);
      },

      /**
       * Get PM marker for time definitions
       *
       * @param locale {String} optional locale to be used
       * @return {String} translated PM marker.
       */
      getPmMarker: function getPmMarker(locale) {
        return this.__mgr.localize("cldr_pm", [], locale);
      },

      /**
       * Return localized names of day names
       *
       * @param length {String} format of the day names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the day
       * @return {String[]} array of localized day names starting with sunday.
       */
      getDayNames: function getDayNames(length, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        var names = [];

        for (var i = 0; i < days.length; i++) {
          var key = "cldr_day_" + context + "_" + length + "_" + days[i];
          names.push(withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale));
        }

        return names;
      },

      /**
       * Return localized name of a week day name
       *
       * @param length {String} format of the day name.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param day {Integer} day number. 0=sunday, 1=monday, ...
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the day
       * @return {String} localized day name
       */
      getDayName: function getDayName(length, day, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInteger(day);
          qx.core.Assert.assertInRange(day, 0, 6);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        var key = "cldr_day_" + context + "_" + length + "_" + days[day];
        return withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale);
      },

      /**
       * Return localized names of month names
       *
       * @param length {String} format of the month names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the month
       * @return {String[]} array of localized month names starting with january.
       */
      getMonthNames: function getMonthNames(length, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var names = [];

        for (var i = 0; i < 12; i++) {
          var key = "cldr_month_" + context + "_" + length + "_" + (i + 1);
          names.push(withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale));
        }

        return names;
      },

      /**
       * Return localized name of a month
       *
       * @param length {String} format of the month names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param month {Integer} index of the month. 0=january, 1=february, ...
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the month
       * @return {String} localized month name
       */
      getMonthName: function getMonthName(length, month, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var key = "cldr_month_" + context + "_" + length + "_" + (month + 1);
        return withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale);
      },

      /**
       * Return localized date format string to be used with {@link qx.util.format.DateFormat}.
       *
       * @param size {String} format of the date format.
       *      Possible values: "short", "medium", "long", "full"
       * @param locale {String?} optional locale to be used
       * @return {String} localized date format string
       */
      getDateFormat: function getDateFormat(size, locale) {
        {
          qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
        }
        var key = "cldr_date_format_" + size;
        return this.__mgr.localize(key, [], locale);
      },

      /**
       * Try to localize a date/time format string. For format string possibilities see
       * <a href="http://cldr.unicode.org/translation/date-time">Date/Time Symbol reference</a>
       * at CLDR - Unicode Common Locale Data Repository.
       *
       * If no localization is available take the fallback format string.
       *
       * @param canonical {String} format string containing only field information, and in a canonical order.
       *       Examples are "yyyyMMMM" for year + full month, or "MMMd" for abbreviated month + day.
       * @param fallback {String} fallback format string if no localized version is found
       * @param locale {String} optional locale to be used
       * @return {String} best matching format string
       */
      getDateTimeFormat: function getDateTimeFormat(canonical, fallback, locale) {
        var key = "cldr_date_time_format_" + canonical;

        var localizedFormat = this.__mgr.localize(key, [], locale);

        if (localizedFormat == key) {
          localizedFormat = fallback;
        }

        return localizedFormat;
      },

      /**
       * Return localized time format string to be used with {@link qx.util.format.DateFormat}.
       *
       * @param size {String} format of the time pattern.
       *      Possible values: "short", "medium", "long", "full"
       * @param locale {String} optional locale to be used
       * @return {String} localized time format string
       */
      getTimeFormat: function getTimeFormat(size, locale) {
        {
          qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
        }
        var key = "cldr_time_format_" + size;

        var localizedFormat = this.__mgr.localize(key, [], locale);

        if (localizedFormat != key) {
          return localizedFormat;
        }

        switch (size) {
          case "short":
          case "medium":
            return qx.locale.Date.getDateTimeFormat("HHmm", "HH:mm");

          case "long":
            return qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss");

          case "full":
            return qx.locale.Date.getDateTimeFormat("HHmmsszz", "HH:mm:ss zz");

          default:
            throw new Error("This case should never happen.");
        }
      },

      /**
       * Return the day the week starts with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the first day of the week. 0=sunday, 1=monday, ...
       */
      getWeekStart: function getWeekStart(locale) {
        var weekStart = {
          // default is monday
          "MV": 5,
          // friday
          "AE": 6,
          // saturday
          "AF": 6,
          "BH": 6,
          "DJ": 6,
          "DZ": 6,
          "EG": 6,
          "ER": 6,
          "ET": 6,
          "IQ": 6,
          "IR": 6,
          "JO": 6,
          "KE": 6,
          "KW": 6,
          "LB": 6,
          "LY": 6,
          "MA": 6,
          "OM": 6,
          "QA": 6,
          "SA": 6,
          "SD": 6,
          "SO": 6,
          "TN": 6,
          "YE": 6,
          "AS": 0,
          // sunday
          "AU": 0,
          "AZ": 0,
          "BW": 0,
          "CA": 0,
          "CN": 0,
          "FO": 0,
          "GE": 0,
          "GL": 0,
          "GU": 0,
          "HK": 0,
          "IE": 0,
          "IL": 0,
          "IS": 0,
          "JM": 0,
          "JP": 0,
          "KG": 0,
          "KR": 0,
          "LA": 0,
          "MH": 0,
          "MN": 0,
          "MO": 0,
          "MP": 0,
          "MT": 0,
          "NZ": 0,
          "PH": 0,
          "PK": 0,
          "SG": 0,
          "TH": 0,
          "TT": 0,
          "TW": 0,
          "UM": 0,
          "US": 0,
          "UZ": 0,
          "VI": 0,
          "ZA": 0,
          "ZW": 0,
          "MW": 0,
          "NG": 0,
          "TJ": 0
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is monday


        return weekStart[territory] != null ? weekStart[territory] : 1;
      },

      /**
       * Return the day the weekend starts with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the first day of the weekend. 0=sunday, 1=monday, ...
       */
      getWeekendStart: function getWeekendStart(locale) {
        var weekendStart = {
          // default is saturday
          "EG": 5,
          // friday
          "IL": 5,
          "SY": 5,
          "IN": 0,
          // sunday
          "AE": 4,
          // thursday
          "BH": 4,
          "DZ": 4,
          "IQ": 4,
          "JO": 4,
          "KW": 4,
          "LB": 4,
          "LY": 4,
          "MA": 4,
          "OM": 4,
          "QA": 4,
          "SA": 4,
          "SD": 4,
          "TN": 4,
          "YE": 4
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is saturday


        return weekendStart[territory] != null ? weekendStart[territory] : 6;
      },

      /**
       * Return the day the weekend ends with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the last day of the weekend. 0=sunday, 1=monday, ...
       */
      getWeekendEnd: function getWeekendEnd(locale) {
        var weekendEnd = {
          // default is sunday
          "AE": 5,
          // friday
          "BH": 5,
          "DZ": 5,
          "IQ": 5,
          "JO": 5,
          "KW": 5,
          "LB": 5,
          "LY": 5,
          "MA": 5,
          "OM": 5,
          "QA": 5,
          "SA": 5,
          "SD": 5,
          "TN": 5,
          "YE": 5,
          "AF": 5,
          "IR": 5,
          "EG": 6,
          // saturday
          "IL": 6,
          "SY": 6
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is sunday


        return weekendEnd[territory] != null ? weekendEnd[territory] : 0;
      },

      /**
       * Returns whether a certain day of week belongs to the week end.
       *
       * @param day {Integer} index of the day. 0=sunday, 1=monday, ...
       * @param locale {String} optional locale to be used
       * @return {Boolean} whether the given day is a weekend day
       */
      isWeekend: function isWeekend(day, locale) {
        var weekendStart = qx.locale.Date.getWeekendStart(locale);
        var weekendEnd = qx.locale.Date.getWeekendEnd(locale);

        if (weekendEnd > weekendStart) {
          return day >= weekendStart && day <= weekendEnd;
        } else {
          return day >= weekendStart || day <= weekendEnd;
        }
      },

      /**
       * Extract the territory part from a locale
       *
       * @param locale {String} the locale
       * @return {String} territory
       */
      _getTerritory: function _getTerritory(locale) {
        if (locale) {
          var territory = locale.split("_")[1] || locale;
        } else {
          territory = this.__mgr.getTerritory() || this.__mgr.getLanguage();
        }

        return territory.toUpperCase();
      },

      /**
       * Provide localization (CLDR) data with fallback between "format" and "stand-alone" contexts.
       * It is used in {@link #getDayName} and {@link #getMonthName} methods.
       *
       * @param context {String} intended context.
       *       Possible values: "format", "stand-alone".
       * @param fallbackContext {String} the context used in case no localization is found for the key.
       * @param key {String} message id (may contain format strings)
       * @param locale {String} the locale
       * @return {String} localized name for the key
       *
       */
      __localizeWithFallback: function __localizeWithFallback(context, fallbackContext, key, locale) {
        var localizedString = this.__mgr.localize(key, [], locale);

        if (localizedString == key) {
          var newKey = key.replace('_' + context + '_', '_' + fallbackContext + '_');
          return this.__mgr.localize(newKey, [], locale);
        } else {
          return localizedString;
        }
      }
    }
  });
  qx.locale.Date.$$dbClassInfo = $$dbClassInfo;
})();

//

//# sourceMappingURL=part-boot-bundle-39.js.map
