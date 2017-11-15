(function (jQuery) { (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.RingCaptcha = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "api": "http://api.testing.ringcaptcha.com",
  "cdn": "//cdn.ringcaptcha.com/widget/v2",
  "recaptchaSiteKey": "6LcGnDcUAAAAAIA4fmiHFmflAQvHBHvh8qg09-XS",
  "locale": {
    "default": "en",
    "available": ["bg", "en", "es", "gr", "fr", "ar", "pt", "ru", "it", "de", "nl", "sr", "sv", "tr", "fi", "ja", "zh"]
  }
}

},{}],2:[function(require,module,exports){
'use strict';

var $ = require('./src/zepto');
var Widget = require('./src/widget');
var config = require('./config.json');
var cssify = require('cssify');

var cssPath = config.cdn + '/resources/css/widget.css';
cssify.byUrl(cssPath);

$('[data-widget]').each(function () {
  var settings = $(this).data();
  settings.recaptchaSiteKey = config.recaptchaSiteKey;
  new Widget(this, settings.app, settings).setup();
});

module.exports = { Widget: Widget };

},{"./config.json":1,"./src/widget":33,"./src/zepto":34,"cssify":3}],3:[function(require,module,exports){
module.exports = function (css) {
  var head = document.getElementsByTagName('head')[0],
      style = document.createElement('style');

  style.type = 'text/css';

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  
  head.appendChild(style);
};

module.exports.byUrl = function(url) {
  var head = document.getElementsByTagName('head')[0],
      link = document.createElement('link');

  link.rel = 'stylesheet';
  link.href = url;
  
  head.appendChild(link);
};
},{}],4:[function(require,module,exports){
/*
* fingerprintJS 0.5.3 - Fast browser fingerprint library
* https://github.com/Valve/fingerprintjs
* Copyright (c) 2013 Valentin Vasilyev (valentin.vasilyev@outlook.com)
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/

;(function (name, context, definition) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = definition(); }
  else if (typeof define === 'function' && define.amd) { define(definition); }
  else { context[name] = definition(); }
})('Fingerprint', this, function () {
  'use strict';
  
  var Fingerprint = function (options) {
    var nativeForEach, nativeMap;
    nativeForEach = Array.prototype.forEach;
    nativeMap = Array.prototype.map;

    this.each = function (obj, iterator, context) {
      if (obj === null) {
        return;
      }
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (iterator.call(context, obj[key], key, obj) === {}) return;
          }
        }
      }
    };

    this.map = function(obj, iterator, context) {
      var results = [];
      // Not using strict equality so that this acts as a
      // shortcut to checking for `null` and `undefined`.
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      this.each(obj, function(value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      return results;
    };

    if (typeof options == 'object'){
      this.hasher = options.hasher;
      this.screen_resolution = options.screen_resolution;
      this.canvas = options.canvas;
      this.ie_activex = options.ie_activex;
    } else if(typeof options == 'function'){
      this.hasher = options;
    }
  };

  Fingerprint.prototype = {
    get: function(){
      var keys = [];
      keys.push(navigator.userAgent);
      keys.push(navigator.language);
      keys.push(screen.colorDepth);
      if (this.screen_resolution) {
        var resolution = this.getScreenResolution();
        if (typeof resolution !== 'undefined'){ // headless browsers, such as phantomjs
          keys.push(this.getScreenResolution().join('x'));
        }
      }
      keys.push(new Date().getTimezoneOffset());
      keys.push(this.hasSessionStorage());
      keys.push(this.hasLocalStorage());
      keys.push(!!window.indexedDB);
      //body might not be defined at this point or removed programmatically
      if(document.body){
        keys.push(typeof(document.body.addBehavior));
      } else {
        keys.push(typeof undefined);
      }
      keys.push(typeof(window.openDatabase));
      keys.push(navigator.cpuClass);
      keys.push(navigator.platform);
      keys.push(navigator.doNotTrack);
      keys.push(this.getPluginsString());
      if(this.canvas && this.isCanvasSupported()){
        keys.push(this.getCanvasFingerprint());
      }
      if(this.hasher){
        return this.hasher(keys.join('###'), 31);
      } else {
        return this.murmurhash3_32_gc(keys.join('###'), 31);
      }
    },

    /**
     * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
     * 
     * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     * 
     * @param {string} key ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash 
     */

    murmurhash3_32_gc: function(key, seed) {
      var remainder, bytes, h1, h1b, c1, c2, k1, i;
      
      remainder = key.length & 3; // key.length % 4
      bytes = key.length - remainder;
      h1 = seed;
      c1 = 0xcc9e2d51;
      c2 = 0x1b873593;
      i = 0;
      
      while (i < bytes) {
          k1 = 
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;
        
        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
      }
      
      k1 = 0;
      
      switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);
        
        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
      }
      
      h1 ^= key.length;

      h1 ^= h1 >>> 16;
      h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= h1 >>> 13;
      h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
      h1 ^= h1 >>> 16;

      return h1 >>> 0;
    },

    // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
    hasLocalStorage: function () {
      try{
        return !!window.localStorage;
      } catch(e) {
        return true; // SecurityError when referencing it means it exists
      }
    },
    
    hasSessionStorage: function () {
      try{
        return !!window.sessionStorage;
      } catch(e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    isCanvasSupported: function () {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    },

    isIE: function () {
      if(navigator.appName === 'Microsoft Internet Explorer') {
        return true;
      } else if(navigator.appName === 'Netscape' && /Trident/.test(navigator.userAgent)){// IE 11
        return true;
      }
      return false;
    },

    getPluginsString: function () {
      if(this.isIE() && this.ie_activex){
        return this.getIEPluginsString();
      } else {
        return this.getRegularPluginsString();
      }
    },

    getRegularPluginsString: function () {
      return this.map(navigator.plugins, function (p) {
        var mimeTypes = this.map(p, function(mt){
          return [mt.type, mt.suffixes].join('~');
        }).join(',');
        return [p.name, p.description, mimeTypes].join('::');
      }, this).join(';');
    },

    getIEPluginsString: function () {
      if(window.ActiveXObject){
        var names = ['ShockwaveFlash.ShockwaveFlash',//flash plugin
          'AcroPDF.PDF', // Adobe PDF reader 7+
          'PDF.PdfCtrl', // Adobe PDF reader 6 and earlier, brrr
          'QuickTime.QuickTime', // QuickTime
          // 5 versions of real players
          'rmocx.RealPlayer G2 Control',
          'rmocx.RealPlayer G2 Control.1',
          'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
          'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
          'RealPlayer',
          'SWCtl.SWCtl', // ShockWave player
          'WMPlayer.OCX', // Windows media player
          'AgControl.AgControl', // Silverlight
          'Skype.Detection'];
          
        // starting to detect plugins in IE
        return this.map(names, function(name){
          try{
            new ActiveXObject(name);
            return name;
          } catch(e){
            return null;
          }
        }).join(';');
      } else {
        return ""; // behavior prior version 0.5.0, not breaking backwards compat.
      }
    },

    getScreenResolution: function () {
      return [screen.height, screen.width];
    },

    getCanvasFingerprint: function () {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      // https://www.browserleaks.com/canvas#how-does-it-work
      var txt = 'http://valve.github.io';
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125,1,62,20);
      ctx.fillStyle = "#069";
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText(txt, 4, 17);
      return canvas.toDataURL();
    }
  };


  return Fingerprint;

});

},{}],5:[function(require,module,exports){
/*!
 * v0.1.5
 * Copyright (c) 2014 First Opinion
 * formatter.js is open sourced under the MIT license.
 *
 * thanks to digitalBush/jquery.maskedinput for some of the trickier
 * keycode handling
 */ 

//
// Uses Node, AMD or browser globals to create a module. This example creates
// a global even when AMD is used. This is useful if you have some scripts
// that are loaded by an AMD loader, but they still want access to globals.
// If you do not need to export a global for the AMD case,
// see returnExports.js.
//
// If you want something that will work in other stricter CommonJS environments,
// or if you need to create a circular dependency, see commonJsStrictGlobal.js
//
// Defines a module "returnExportsGlobal" that depends another module called
// "b". Note that the name of the module is implied by the file name. It is
// best if the file name and the exported global have matching names.
//
// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.
//
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Formatter'] = factory();
  }
}(this, function () {


/*
 * pattern.js
 *
 * Utilities to parse str pattern and return info
 *
 */
var pattern = function () {
  // Define module
  var pattern = {};
  // Match information
  var DELIM_SIZE = 4;
  // Our regex used to parse
  var regexp = new RegExp('{{([^}]+)}}', 'g');
  //
  // Helper method to parse pattern str
  //
  var getMatches = function (pattern) {
    // Populate array of matches
    var matches = [], match;
    while (match = regexp.exec(pattern)) {
      matches.push(match);
    }
    return matches;
  };
  //
  // Create an object holding all formatted characters
  // with corresponding positions
  //
  pattern.parse = function (pattern) {
    // Our obj to populate
    var info = {
      inpts: {},
      chars: {}
    };
    // Pattern information
    var matches = getMatches(pattern), pLength = pattern.length;
    // Counters
    var mCount = 0, iCount = 0, i = 0;
    // Add inpts, move to end of match, and process
    var processMatch = function (val) {
      var valLength = val.length;
      for (var j = 0; j < valLength; j++) {
        info.inpts[iCount] = val.charAt(j);
        iCount++;
      }
      mCount++;
      i += val.length + DELIM_SIZE - 1;
    };
    // Process match or add chars
    for (i; i < pLength; i++) {
      if (mCount < matches.length && i === matches[mCount].index) {
        processMatch(matches[mCount][1]);
      } else {
        info.chars[i - mCount * DELIM_SIZE] = pattern.charAt(i);
      }
    }
    // Set mLength and return
    info.mLength = i - mCount * DELIM_SIZE;
    return info;
  };
  // Expose
  return pattern;
}();
/*
 * utils.js
 *
 * Independent helper methods (cross browser, etc..)
 *
 */
var utils = function () {
  // Define module
  var utils = {};
  // Useragent info for keycode handling
  var uAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
  //
  // Shallow copy properties from n objects to destObj
  //
  utils.extend = function (destObj) {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        destObj[key] = arguments[i][key];
      }
    }
    return destObj;
  };
  //
  // Add a given character to a string at a defined pos
  //
  utils.addChars = function (str, chars, pos) {
    return str.substr(0, pos) + chars + str.substr(pos, str.length);
  };
  //
  // Remove a span of characters
  //
  utils.removeChars = function (str, start, end) {
    return str.substr(0, start) + str.substr(end, str.length);
  };
  //
  // Return true/false is num false between bounds
  //
  utils.isBetween = function (num, bounds) {
    bounds.sort(function (a, b) {
      return a - b;
    });
    return num > bounds[0] && num < bounds[1];
  };
  //
  // Helper method for cross browser event listeners
  //
  utils.addListener = function (el, evt, handler) {
    return typeof el.addEventListener !== 'undefined' ? el.addEventListener(evt, handler, false) : el.attachEvent('on' + evt, handler);
  };
  //
  // Helper method for cross browser event listeners
  //
  utils.removeListener = function (el, evt, handler) {
    return typeof el.removeEventListener !== 'undefined' ? el.removeEventListener(evt, handler, false) : el.detachEvent('on' + evt, handler);
  };
  //
  // Helper method for cross browser implementation of preventDefault
  //
  utils.preventDefault = function (evt) {
    return evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
  };
  //
  // Helper method for cross browser implementation for grabbing
  // clipboard data
  //
  utils.getClip = function (evt) {
    if (evt.clipboardData) {
      return evt.clipboardData.getData('Text');
    }
    if (window.clipboardData) {
      return window.clipboardData.getData('Text');
    }
  };
  //
  // Loop over object and checking for matching properties
  //
  utils.getMatchingKey = function (which, keyCode, keys) {
    // Loop over and return if matched.
    for (var k in keys) {
      var key = keys[k];
      if (which === key.which && keyCode === key.keyCode) {
        return k;
      }
    }
  };
  //
  // Returns true/false if k is a del keyDown
  //
  utils.isDelKeyDown = function (which, keyCode) {
    var keys = {
      'backspace': {
        'which': 8,
        'keyCode': 8
      },
      'delete': {
        'which': 46,
        'keyCode': 46
      }
    };
    return utils.getMatchingKey(which, keyCode, keys);
  };
  //
  // Returns true/false if k is a del keyPress
  //
  utils.isDelKeyPress = function (which, keyCode) {
    var keys = {
      'backspace': {
        'which': 8,
        'keyCode': 8,
        'shiftKey': false
      },
      'delete': {
        'which': 0,
        'keyCode': 46
      }
    };
    return utils.getMatchingKey(which, keyCode, keys);
  };
  // //
  // // Determine if keydown relates to specialKey
  // //
  // utils.isSpecialKeyDown = function (which, keyCode) {
  //   var keys = {
  //     'tab': { 'which': 9, 'keyCode': 9 },
  //     'enter': { 'which': 13, 'keyCode': 13 },
  //     'end': { 'which': 35, 'keyCode': 35 },
  //     'home': { 'which': 36, 'keyCode': 36 },
  //     'leftarrow': { 'which': 37, 'keyCode': 37 },
  //     'uparrow': { 'which': 38, 'keyCode': 38 },
  //     'rightarrow': { 'which': 39, 'keyCode': 39 },
  //     'downarrow': { 'which': 40, 'keyCode': 40 },
  //     'F5': { 'which': 116, 'keyCode': 116 }
  //   };
  //   return utils.getMatchingKey(which, keyCode, keys);
  // };
  //
  // Determine if keypress relates to specialKey
  //
  utils.isSpecialKeyPress = function (which, keyCode) {
    var keys = {
      'tab': {
        'which': 0,
        'keyCode': 9
      },
      'enter': {
        'which': 13,
        'keyCode': 13
      },
      'end': {
        'which': 0,
        'keyCode': 35
      },
      'home': {
        'which': 0,
        'keyCode': 36
      },
      'leftarrow': {
        'which': 0,
        'keyCode': 37
      },
      'uparrow': {
        'which': 0,
        'keyCode': 38
      },
      'rightarrow': {
        'which': 0,
        'keyCode': 39
      },
      'downarrow': {
        'which': 0,
        'keyCode': 40
      },
      'F5': {
        'which': 116,
        'keyCode': 116
      }
    };
    return utils.getMatchingKey(which, keyCode, keys);
  };
  //
  // Returns true/false if modifier key is held down
  //
  utils.isModifier = function (evt) {
    return evt.ctrlKey || evt.altKey || evt.metaKey;
  };
  //
  // Iterates over each property of object or array.
  //
  utils.forEach = function (collection, callback, thisArg) {
    if (collection.hasOwnProperty('length')) {
      for (var index = 0, len = collection.length; index < len; index++) {
        if (callback.call(thisArg, collection[index], index, collection) === false) {
          break;
        }
      }
    } else {
      for (var key in collection) {
        if (collection.hasOwnProperty(key)) {
          if (callback.call(thisArg, collection[key], key, collection) === false) {
            break;
          }
        }
      }
    }
  };
  // Expose
  return utils;
}();
/*
* pattern-matcher.js
*
* Parses a pattern specification and determines appropriate pattern for an
* input string
*
*/
var patternMatcher = function (pattern, utils) {
  //
  // Parse a matcher string into a RegExp. Accepts valid regular
  // expressions and the catchall '*'.
  // @private
  //
  var parseMatcher = function (matcher) {
    if (matcher === '*') {
      return /.*/;
    }
    return new RegExp(matcher);
  };
  //
  // Parse a pattern spec and return a function that returns a pattern
  // based on user input. The first matching pattern will be chosen.
  // Pattern spec format:
  // Array [
  //  Object: { Matcher(RegExp String) : Pattern(Pattern String) },
  //  ...
  // ]
  function patternMatcher(patternSpec) {
    var matchers = [], patterns = [];
    // Iterate over each pattern in order.
    utils.forEach(patternSpec, function (patternMatcher) {
      // Process single property object to obtain pattern and matcher.
      utils.forEach(patternMatcher, function (patternStr, matcherStr) {
        var parsedPattern = pattern.parse(patternStr), regExpMatcher = parseMatcher(matcherStr);
        matchers.push(regExpMatcher);
        patterns.push(parsedPattern);
        // Stop after one iteration.
        return false;
      });
    });
    var getPattern = function (input) {
      var matchedIndex;
      utils.forEach(matchers, function (matcher, index) {
        if (matcher.test(input)) {
          matchedIndex = index;
          return false;
        }
      });
      return matchedIndex === undefined ? null : patterns[matchedIndex];
    };
    return {
      getPattern: getPattern,
      patterns: patterns,
      matchers: matchers
    };
  }
  // Expose
  return patternMatcher;
}(pattern, utils);
/*
 * inpt-sel.js
 *
 * Cross browser implementation to get and set input selections
 *
 */
var inptSel = function () {
  // Define module
  var inptSel = {};
  //
  // Get begin and end positions of selected input. Return 0's
  // if there is no selectiion data
  //
  inptSel.get = function (el) {
    // If normal browser return with result
    if (typeof el.selectionStart === 'number') {
      return {
        begin: el.selectionStart,
        end: el.selectionEnd
      };
    }
    // Uh-Oh. We must be IE. Fun with TextRange!!
    var range = document.selection.createRange();
    // Determine if there is a selection
    if (range && range.parentElement() === el) {
      var inputRange = el.createTextRange(), endRange = el.createTextRange(), length = el.value.length;
      // Create a working TextRange for the input selection
      inputRange.moveToBookmark(range.getBookmark());
      // Move endRange begin pos to end pos (hence endRange)
      endRange.collapse(false);
      // If we are at the very end of the input, begin and end
      // must both be the length of the el.value
      if (inputRange.compareEndPoints('StartToEnd', endRange) > -1) {
        return {
          begin: length,
          end: length
        };
      }
      // Note: moveStart usually returns the units moved, which 
      // one may think is -length, however, it will stop when it
      // gets to the begin of the range, thus giving us the
      // negative value of the pos.
      return {
        begin: -inputRange.moveStart('character', -length),
        end: -inputRange.moveEnd('character', -length)
      };
    }
    //Return 0's on no selection data
    return {
      begin: 0,
      end: 0
    };
  };
  //
  // Set the caret position at a specified location
  //
  inptSel.set = function (el, pos) {
    // Normalize pos
    if (typeof pos !== 'object') {
      pos = {
        begin: pos,
        end: pos
      };
    }
    // If normal browser
    if (el.setSelectionRange) {
      el.setSelectionRange(pos.begin, pos.end);
    } else if (el.createTextRange) {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos.end);
      range.moveStart('character', pos.begin);
      range.select();
    }
  };
  // Expose
  return inptSel;
}();
/*
 * formatter.js
 *
 * Class used to format input based on passed pattern
 *
 */
var formatter = function (patternMatcher, inptSel, utils) {
  // Defaults
  var defaults = {
    persistent: false,
    repeat: false,
    placeholder: ' '
  };
  // Regexs for input validation
  var inptRegs = {
    '9': /[0-9]/,
    'a': /[A-Za-z]/,
    '*': /[A-Za-z0-9]/
  };
  //
  // Class Constructor - Called with new Formatter(el, opts)
  // Responsible for setting up required instance variables, and
  // enabling the formatter.
  //
  function Formatter(el, opts) {
    // Cache this
    var self = this;
    // Make sure we have an element. Make accesible to instance
    self.el = el;
    if (!self.el) {
      throw new TypeError('Must provide an existing element');
    }
    // Merge opts with defaults
    self.opts = utils.extend({}, defaults, opts);
    // 1 pattern is special case
    if (typeof self.opts.pattern !== 'undefined') {
      self.opts.patterns = self._specFromSinglePattern(self.opts.pattern);
      delete self.opts.pattern;
    }
    // Make sure we have valid opts
    if (typeof self.opts.patterns === 'undefined') {
      throw new TypeError('Must provide a pattern or array of patterns');
    }
    self.patternMatcher = patternMatcher(self.opts.patterns);
    // Init values
    self.hldrs = {};
    self.focus = 0;
    self.enabled = false;
    self.listeners = {
      keydown: function (evt) {
        self._keyDown(evt);
      },
      keypress: function (evt) {
        self._keyPress(evt);
      },
      paste: function (evt) {
        self._paste(evt);
      },
      focus: function (evt) {
        self._focus(evt);
      },
      click: function (evt) {
        self._focus(evt);
      },
      touchstart: function (evt) {
        self._focus(evt);
      }
    };
    // Enable formatter
    self.enable();
  }
  //
  // @public
  // Add new char
  //
  Formatter.addInptType = function (chr, reg) {
    inptRegs[chr] = reg;
  };
  //
  // @public
  // Enable the formatter
  //
  Formatter.prototype.enable = function () {
    // Do not register listeners more than once
    if (this.enabled) {
      return;
    }
    // Upate pattern with initial value
    this._updatePattern();
    // Format on start
    this._processKey('', false);
    this.el.blur();
    // Add listeners
    utils.addListener(this.el, 'keydown', this.listeners.keydown);
    utils.addListener(this.el, 'keypress', this.listeners.keypress);
    utils.addListener(this.el, 'paste', this.listeners.paste);
    if (this.opts.persistent) {
      // Add Listeners
      utils.addListener(this.el, 'focus', this.listeners.focus);
      utils.addListener(this.el, 'click', this.listeners.click);
      utils.addListener(this.el, 'touchstart', this.listeners.touchstart);
    }
    this.enabled = true;
  };
  //
  // @public
  // Disable the formatter
  //
  Formatter.prototype.disable = function () {
    // Do not try to remove listeners already removed
    if (!this.enabled) {
      return;
    }
    // Get current state
    this.sel = inptSel.get(this.el);
    this.val = this.el.value;
    // Init values
    this.delta = 0;
    // Remove all formatted chars from val
    this._removeChars();
    // Set value and adhere to maxLength
    this.el.value = this.val.substr(0, this.mLength);
    // Remove listeners
    utils.removeListener(this.el, 'keydown', this.listeners.keydown);
    utils.removeListener(this.el, 'keypress', this.listeners.keypress);
    utils.removeListener(this.el, 'paste', this.listeners.paste);
    if (this.opts.persistent) {
      // Remove Listeners
      utils.removeListener(this.el, 'focus', this.listeners.focus);
      utils.removeListener(this.el, 'click', this.listeners.click);
      utils.removeListener(this.el, 'touchstart', this.listeners.touchstart);
    }
    this.enabled = false;
  };
  //
  // @public
  // Apply the given pattern to the current input without moving caret.
  //
  Formatter.prototype.resetPattern = function (str) {
    // Skip if the formatter is not enabled
    if (!this.enabled) {
      return;
    }
    // Update opts to hold new pattern
    this.opts.patterns = str ? this._specFromSinglePattern(str) : this.opts.patterns;
    // Get current state
    this.sel = inptSel.get(this.el);
    this.val = this.el.value;
    // Init values
    this.delta = 0;
    // Remove all formatted chars from val
    this._removeChars();
    this.patternMatcher = patternMatcher(this.opts.patterns);
    // Update pattern
    var newPattern = this.patternMatcher.getPattern(this.val);
    this.mLength = newPattern.mLength;
    this.chars = newPattern.chars;
    this.inpts = newPattern.inpts;
    // Format on start
    this._processKey('', false, true);
  };
  //
  // @private
  // Determine correct format pattern based on input val
  //
  Formatter.prototype._updatePattern = function () {
    // Determine appropriate pattern
    var newPattern = this.patternMatcher.getPattern(this.val);
    // Only update the pattern if there is an appropriate pattern for the value.
    // Otherwise, leave the current pattern (and likely delete the latest character.)
    if (newPattern) {
      // Get info about the given pattern
      this.mLength = newPattern.mLength;
      this.chars = newPattern.chars;
      this.inpts = newPattern.inpts;
    }
  };
  //
  // @private
  // Handler called on all keyDown strokes. All keys trigger
  // this handler. Only process delete keys.
  //
  Formatter.prototype._keyDown = function (evt) {
    // The first thing we need is the character code
    var k = evt.which || evt.keyCode;
    // If delete key
    if (k && utils.isDelKeyDown(evt.which, evt.keyCode)) {
      // Process the keyCode and prevent default
      this._processKey(null, k);
      return utils.preventDefault(evt);
    }
  };
  //
  // @private
  // Handler called on all keyPress strokes. Only processes
  // character keys (as long as no modifier key is in use).
  //
  Formatter.prototype._keyPress = function (evt) {
    // The first thing we need is the character code
    var k, isSpecial;
    // Mozilla will trigger on special keys and assign the the value 0
    // We want to use that 0 rather than the keyCode it assigns.
    k = evt.which || evt.keyCode;
    isSpecial = utils.isSpecialKeyPress(evt.which, evt.keyCode);
    // Process the keyCode and prevent default
    if (!utils.isDelKeyPress(evt.which, evt.keyCode) && !isSpecial && !utils.isModifier(evt)) {
      this._processKey(String.fromCharCode(k), false);
      return utils.preventDefault(evt);
    }
  };
  //
  // @private
  // Handler called on paste event.
  //
  Formatter.prototype._paste = function (evt) {
    // Process the clipboard paste and prevent default
    this._processKey(utils.getClip(evt), false);
    return utils.preventDefault(evt);
  };
  //
  // @private
  // Handle called on focus event.
  //
  Formatter.prototype._focus = function () {
    // Wrapped in timeout so that we can grab input selection
    var self = this;
    setTimeout(function () {
      // Grab selection
      var selection = inptSel.get(self.el);
      // Char check
      var isAfterStart = selection.end > self.focus, isFirstChar = selection.end === 0;
      // If clicked in front of start, refocus to start
      if (isAfterStart || isFirstChar) {
        inptSel.set(self.el, self.focus);
      }
    }, 0);
  };
  //
  // @private
  // Using the provided key information, alter el value.
  //
  Formatter.prototype._processKey = function (chars, delKey, ignoreCaret) {
    // Get current state
    this.sel = inptSel.get(this.el);
    this.val = this.el.value;
    // Init values
    this.delta = 0;
    // If chars were highlighted, we need to remove them
    if (this.sel.begin !== this.sel.end) {
      this.delta = -1 * Math.abs(this.sel.begin - this.sel.end);
      this.val = utils.removeChars(this.val, this.sel.begin, this.sel.end);
    } else if (delKey && delKey === 46) {
      this._delete();
    } else if (delKey && this.sel.begin - 1 >= 0) {
      // Always have a delta of at least -1 for the character being deleted.
      this.val = utils.removeChars(this.val, this.sel.end - 1, this.sel.end);
      this.delta -= 1;
    } else if (delKey) {
      return true;
    }
    // If the key is not a del key, it should convert to a str
    if (!delKey) {
      // Add char at position and increment delta
      this.val = utils.addChars(this.val, chars, this.sel.begin);
      this.delta += chars.length;
    }
    // Format el.value (also handles updating caret position)
    this._formatValue(ignoreCaret);
  };
  //
  // @private
  // Deletes the character in front of it
  //
  Formatter.prototype._delete = function () {
    // Adjust focus to make sure its not on a formatted char
    while (this.chars[this.sel.begin]) {
      this._nextPos();
    }
    // As long as we are not at the end
    if (this.sel.begin < this.val.length) {
      // We will simulate a delete by moving the caret to the next char
      // and then deleting
      this._nextPos();
      this.val = utils.removeChars(this.val, this.sel.end - 1, this.sel.end);
      this.delta = -1;
    }
  };
  //
  // @private
  // Quick helper method to move the caret to the next pos
  //
  Formatter.prototype._nextPos = function () {
    this.sel.end++;
    this.sel.begin++;
  };
  //
  // @private
  // Alter element value to display characters matching the provided
  // instance pattern. Also responsible for updating
  //
  Formatter.prototype._formatValue = function (ignoreCaret) {
    // Set caret pos
    this.newPos = this.sel.end + this.delta;
    // Remove all formatted chars from val
    this._removeChars();
    // Switch to first matching pattern based on val
    this._updatePattern();
    // Validate inputs
    this._validateInpts();
    // Add formatted characters
    this._addChars();
    // Set value and adhere to maxLength
    this.el.value = this.val.substr(0, this.mLength);
    // Set new caret position
    if (typeof ignoreCaret === 'undefined' || ignoreCaret === false) {
      inptSel.set(this.el, this.newPos);
    }
  };
  //
  // @private
  // Remove all formatted before and after a specified pos
  //
  Formatter.prototype._removeChars = function () {
    // Delta shouldn't include placeholders
    if (this.sel.end > this.focus) {
      this.delta += this.sel.end - this.focus;
    }
    // Account for shifts during removal
    var shift = 0;
    // Loop through all possible char positions
    for (var i = 0; i <= this.mLength; i++) {
      // Get transformed position
      var curChar = this.chars[i], curHldr = this.hldrs[i], pos = i + shift, val;
      // If after selection we need to account for delta
      pos = i >= this.sel.begin ? pos + this.delta : pos;
      val = this.val.charAt(pos);
      // Remove char and account for shift
      if (curChar && curChar === val || curHldr && curHldr === val) {
        this.val = utils.removeChars(this.val, pos, pos + 1);
        shift--;
      }
    }
    // All hldrs should be removed now
    this.hldrs = {};
    // Set focus to last character
    this.focus = this.val.length;
  };
  //
  // @private
  // Make sure all inpts are valid, else remove and update delta
  //
  Formatter.prototype._validateInpts = function () {
    // Loop over each char and validate
    for (var i = 0; i < this.val.length; i++) {
      // Get char inpt type
      var inptType = this.inpts[i];
      // Checks
      var isBadType = !inptRegs[inptType], isInvalid = !isBadType && !inptRegs[inptType].test(this.val.charAt(i)), inBounds = this.inpts[i];
      // Remove if incorrect and inbounds
      if ((isBadType || isInvalid) && inBounds) {
        this.val = utils.removeChars(this.val, i, i + 1);
        this.focusStart--;
        this.newPos--;
        this.delta--;
        i--;
      }
    }
  };
  //
  // @private
  // Loop over val and add formatted chars as necessary
  //
  Formatter.prototype._addChars = function () {
    if (this.opts.persistent) {
      // Loop over all possible characters
      for (var i = 0; i <= this.mLength; i++) {
        if (!this.val.charAt(i)) {
          // Add placeholder at pos
          this.val = utils.addChars(this.val, this.opts.placeholder, i);
          this.hldrs[i] = this.opts.placeholder;
        }
        this._addChar(i);
      }
      // Adjust focus to make sure its not on a formatted char
      while (this.chars[this.focus]) {
        this.focus++;
      }
    } else {
      // Avoid caching val.length, as they may change in _addChar.
      for (var j = 0; j <= this.val.length; j++) {
        // When moving backwards there are some race conditions where we
        // dont want to add the character
        if (this.delta <= 0 && j === this.focus) {
          return true;
        }
        // Place character in current position of the formatted string.
        this._addChar(j);
      }
    }
  };
  //
  // @private
  // Add formattted char at position
  //
  Formatter.prototype._addChar = function (i) {
    // If char exists at position
    var chr = this.chars[i];
    if (!chr) {
      return true;
    }
    // If chars are added in between the old pos and new pos
    // we need to increment pos and delta
    if (utils.isBetween(i, [
        this.sel.begin - 1,
        this.newPos + 1
      ])) {
      this.newPos++;
      this.delta++;
    }
    // If character added before focus, incr
    if (i <= this.focus) {
      this.focus++;
    }
    // Updateholder
    if (this.hldrs[i]) {
      delete this.hldrs[i];
      this.hldrs[i + 1] = this.opts.placeholder;
    }
    // Update value
    this.val = utils.addChars(this.val, chr, i);
  };
  //
  // @private
  // Create a patternSpec for passing into patternMatcher that
  // has exactly one catch all pattern.
  //
  Formatter.prototype._specFromSinglePattern = function (patternStr) {
    return [{ '*': patternStr }];
  };
  // Expose
  return Formatter;
}(patternMatcher, inptSel, utils);


return formatter;



}));
},{}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
var _ = require('underscore');
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="ringcaptcha widget onboarding"> <div class="box"> <div class="wizard"></div> <div style="text-align: center; font-size: 11px" id="powered" target="_blank">Powered by <a href="//ringcaptcha.com" class="powered">RingCaptcha</a></div> </div> </div> <input type="hidden" name="ringcaptcha_session_id"> <input type="hidden" name="ringcaptcha_pin_code"> <input type="hidden" name="ringcaptcha_phone_number">';
}
return __p;
};

},{"underscore":6}],8:[function(require,module,exports){
var _ = require('underscore');
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="wizard-success-step"> <div class="wizard-step-content"> <div class="notification-content"> <div style="margin-left: 10px; float: left; text-align: left" class="notification-text"> <h4 style="display: block; line-height: 22px; margin-left: 0"></h4> <span class="reload hide"> <span style="font-size: 0.857em">'+
((__t=( i18n.trans('onboarding.retry') ))==null?'':__t)+
' </span> <span class="countdown" style="display: block; line-height: 22px"></span> <a href="#" class="tryagain js-reload hide" style="display: block; line-height: 22px">'+
((__t=( i18n.trans('check.retry') ))==null?'':__t)+
'</a> </span> <a class="anchor hide"></a> </div> </div> </div> </div>';
}
return __p;
};

},{"underscore":6}],9:[function(require,module,exports){
var _ = require('underscore');
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="wizard-code-step"> <div class="wizard-step-content"> <div class="row"> <div class="phone-box"> <select class="form-control country-list-mobile"></select> <p class="summary popup hide"></p> <form class="form-inline" role="form"> <div class="form-group"> <div class="input-group"> <div class="input-group-btn"> <button type="button" class="btn btn-default dropdown-toggle country-button"> <i class="flag"></i>&nbsp;<span class="country-code"></span>&nbsp;<span class="caret"></span> </button> <ul class="dropdown-menu country-list"> <li class="country-search"> <input type="text" placeholder="'+
((__t=( i18n.trans('code.search') ))==null?'':__t)+
'" class="form-control country-search-input"> </li> </ul> </div> <input type="tel" maxlength="15" class="form-control phone-input input-onboarding-mobile"> <div class="input-group-btn"> <button type="button" class="btn btn-submit js-send-code"></button> </div> </div> </div> </form> </div> <p id="js-inline-alert" class="text-center">We\'ll text you a link to download the app</p> <p id="js-inline-countdown" class="text-center hide">'+
((__t=( i18n.trans('onboarding.retry') ))==null?'':__t)+
'&nbsp;<span class="countdown hide"></span><span class="tryagain hide"><a href="#" class="js-try-again" style="font-weight:bold">'+
((__t=( i18n.trans('check.retry') ))==null?'':__t)+
'</a></span></p> </div> </div> </div>';
}
return __p;
};

},{"underscore":6}],10:[function(require,module,exports){
var _ = require('underscore');
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<script src="https://www.google.com/recaptcha/api.js?onload=onKingAuthrRecaptchaLoaded&render=explicit&hl='+
((__t=( locale || 'en' ))==null?'':__t)+
'" async defer="defer"></script> <div id="king-authr-recapctha"> </div>';
}
return __p;
};

},{"underscore":6}],11:[function(require,module,exports){
var _ = require('underscore');
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="ringcaptcha widget"> <div class="box"> <a href="http://ringcaptcha.com" target="_blank" class="brand" tabindex="-1"> <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="RingCaptcha"> </a> <div class="wizard"></div> </div> </div> <input type="hidden" name="ringcaptcha_session_id"> <input type="hidden" name="ringcaptcha_pin_code"> <input type="hidden" name="ringcaptcha_phone_number">';
}
return __p;
};

},{"underscore":6}],12:[function(require,module,exports){
var _ = require('underscore');
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="wizard-check-step"> <div class="wizard-step-header"> <h3 class="title"></h3> <h3 class="phone-number"></h3> </div> <div class="wizard-step-content"> <div style="text-align:center"> <p class="pin-summary">'+
((__t=( i18n.trans('check.summary') ))==null?'':__t)+
'</p> <input type="tel" class="form-control digit" autocomplete="off" maxlength="1">&nbsp; <input type="tel" class="form-control digit" autocomplete="off" maxlength="1">&nbsp; <input type="tel" class="form-control digit" autocomplete="off" maxlength="1">&nbsp; <input type="tel" class="form-control digit" autocomplete="off" maxlength="1"> </div> </div> <div class="wizard-step-footer"> <p> <span>'+
((__t=( i18n.trans('check.help') ))==null?'':__t)+
'</span>&nbsp; <a href="#" class="help" title="'+
((__t=( i18n.trans('help') ))==null?'':__t)+
'"></a> </p> <p class="countdown hide"></p> <p class="tryagain hide"><a href="#" class="js-try-again">'+
((__t=( i18n.trans('check.retry') ))==null?'':__t)+
'</a></p> <p class="tryorcall hide"><a href="#" class="js-try-again">'+
((__t=( i18n.trans('check.retry') ))==null?'':__t)+
'</a> or <a href="#" class="js-call-now">'+
((__t=( i18n.trans('check.fallback') ))==null?'':__t)+
'</a></p> </div> </div>';
}
return __p;
};

},{"underscore":6}],13:[function(require,module,exports){
var _ = require('underscore');
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="wizard-success-step"> <div class="wizard-step-content"> <div class="notification-content"> <h4></h4> </div> <span class="reload hide"> <span class="countdown"></span> <a href="#" class="tryagain js-reload hide">'+
((__t=( i18n.trans('check.retry') ))==null?'':__t)+
'</a> </span> <a class="anchor hide"></a> </div> </div>';
}
return __p;
};

},{"underscore":6}],14:[function(require,module,exports){
var _ = require('underscore');
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="wizard-code-step"> <div class="wizard-step-header"> <h3>'+
((__t=( i18n.trans('code.title') ))==null?'':__t)+
'</h3>&nbsp;<a href="#" class="help" title="'+
((__t=( i18n.trans('help') ))==null?'':__t)+
'" tabindex="-1"></a> </div> <div class="wizard-step-content"> <div class="row"> <div class="phone-box"> <p class="summary">'+
((__t=( i18n.trans('code.summary') ))==null?'':__t)+
'</p> <select class="form-control country-list-mobile"></select> <div class="input-group input-verify-mobile"> <div class="input-group-btn"> <button type="button" class="btn btn-default dropdown-toggle country-button"> <i class="flag"></i>&nbsp;<span class="country-code"></span>&nbsp;<span class="caret"></span> </button> <ul class="dropdown-menu country-list"> <li class="country-search"> <input type="text" placeholder="'+
((__t=( i18n.trans('code.search') ))==null?'':__t)+
'" class="form-control country-search-input"> </li> </ul> </div> <input type="tel" maxlength="15" class="form-control phone-input phone-input-verify"> </div> </div> <div class="method-selector"> <p class="method-summary">'+
((__t=( i18n.trans('code.service.summary') ))==null?'':__t)+
'</p> <div class="method-input"> <div class="radio"> <input type="radio" name="rc[core][method]" id="method-sms" value="sms" data-submit-button-value="'+
((__t=( i18n.trans('code.submit.sms') ))==null?'':__t)+
'"> <label for="method-sms"> <i></i>&nbsp;<span>'+
((__t=( i18n.trans('code.service.sms.label') ))==null?'':__t)+
'</span> </label> </div> <div class="radio"> <input type="radio" name="rc[core][method]" id="method-voice" value="voice" data-submit-button-value="'+
((__t=( i18n.trans('code.submit.voice') ))==null?'':__t)+
'"> <label for="method-voice"> <i></i>&nbsp;<span>'+
((__t=( i18n.trans('code.service.voice.label') ))==null?'':__t)+
'</span> </label> </div> </div> </div> <div class="submit-button"> <button type="button" class="btn btn-submit btn-block btn-verify js-send-code"></button> </div> </div> </div> </div>';
}
return __p;
};

},{"underscore":6}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('./zepto');
var events = require('./events');
var config = require('../config.json');
var session = require('./util/session');
var fingerprint = require('./util/fingerprint');
var geolocation = require('./util/geolocation');
var ajax = require('./util/ajax');

/*
  This class connects to the RingCaptcha API
*/

var Api = function () {
  /*
  Define private members.
  */
  var app = void 0,
      mode = void 0,
      options = void 0,
      wrapper = void 0;

  var createSession = function createSession(deferred) {
    var _this = this;

    var params = {
      auth: fingerprint.getFingerprint()
    };
    var data = this.data || {};
    if (data.expiresAt > new Date().getTime() && data.expiresAt !== -1) {
      params.token = data.token;
    }
    // Setup AJAX request
    var ajaxSetup = {
      type: 'POST',
      url: config.api + '/' + app + '/captcha',
      data: params
    };
    // Create session object and save it
    var doneCallback = function doneCallback(response) {
      if (response.status != null && response.status.toLowerCase() === 'error') {
        return deferred.reject(response.message.toLowerCase());
      } else if (response.result != null && response.result.toLowerCase() === 'error') {
        return deferred.reject(response.status.toLowerCase());
      } else {
        _this.data = {
          status: 'new',
          app: app,
          token: response.token,
          widgetType: response.type.toLowerCase(),
          country: response.country.toLowerCase(),
          expiresAt: new Date().getTime() + response.expires_in * 1000,
          supportedCountries: response.countries.toLowerCase().split(',').filter(String),
          features: response.features.split(''),
          attempts: 0,
          geolocation: !!response.geolocation,
          fingerprint: params.auth,
          supportEmail: response.support_email,
          locale: response.widget_lang
        };
        var event = $.Event(events.auth);
        event.token = response.token;
        wrapper.triggerHandler(event);
        session.setSession(app, _this.data);
        return deferred.resolve();
      }
    };
    ajax(ajaxSetup, doneCallback, deferred.reject);
  };

  var Api = function () {
    /*
      Constructor.
    */
    function Api(el, appKey, appMode, wOptions) {
      _classCallCheck(this, Api);

      wrapper = el;
      app = appKey;
      options = wOptions;
      this.mode = appMode;
    }

    _createClass(Api, [{
      key: 'setMode',
      value: function setMode(appMode) {
        return this.mode = appMode;
      }
    }, {
      key: 'setOptions',
      value: function setOptions(wOptions) {
        return options = wOptions;
      }
    }, {
      key: 'getOptions',
      value: function getOptions() {
        return options;
      }

      /*
      Create a token or use an existing one and keep it updated.
      */

    }, {
      key: 'auth',
      value: function auth() {
        var _this2 = this;

        var deferred = $.Deferred();
        var sess = session.getSession(app);
        // If session exists and has not expired use it
        if (sess && sess.expiresAt > new Date().getTime() && !sess.isStatusAware) {
          this.data = sess;
          deferred.resolve();
        } // Else, create a new one
        else {
            createSession.call(this, deferred);
          }
        // Check if the token has not expired
        var checkToken = function checkToken() {
          if (_this2.data.expiresAt > new Date().getTime()) {
            return setTimeout(checkToken, 1000);
          } else {
            if (_this2.data.expiresAt !== -1) {
              return _this2.auth();
            }
          }
        };
        return deferred.promise().done(checkToken);
      }
    }, {
      key: 'code',
      value: function code(phoneNumber, dispatchType) {
        var _this3 = this;

        var locale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "en";

        var deferred = $.Deferred();
        if (dispatchType !== 'sms' && dispatchType !== 'voice') {
          deferred.reject('invalid_service');
        }
        var params = {
          token: this.data.token,
          fp: this.data.fingerprint || fingerprint.getFingerprint(),
          phone: phoneNumber,
          locale: locale
        };
        var geoEnabled = void 0;
        if (options.geolocation != null) {
          geoEnabled = options.geolocation;
        } else {
          geoEnabled = true;
        }
        if (this.data.features.indexOf('G') >= 0 && this.data.geolocation === true && geoEnabled) {
          params = $.extend(params, geolocation.getGeolocation());
        }
        if (this.mode) {
          params = $.extend(params, {
            mode: this.mode
          });
        }
        if (this.data.features.indexOf('T') >= 0) {
          params = $.extend(params, {
            iosid: options.iosid
          });
          params = $.extend(params, {
            androidid: options.androidid
          });
          params = $.extend(params, {
            appname: options.appname
          });
        }
        var ajaxSetup = {
          type: 'POST',
          url: config.api + '/v2/apps/' + app + '/captcha/' + dispatchType,
          data: params
        };
        // Update data
        var doneCallback = function doneCallback(response) {
          var status = (response.status || response.result).toLowerCase();
          var message = (response.message || response.status).toLowerCase();
          _this3.data.expiresAt = new Date().getTime() + response.expires_in * 1000;
          _this3.data.retryAt = new Date().getTime() + response.retry_in * 1000;
          _this3.data.attempts = response.attempt;
          if (status === 'error') {
            var error = message.slice(0, 5) === 'error' ? message.slice(6) : message;
            if (error === 'invalid_session') {
              _this3.data.expiresAt = -1;
              session.updateSession(app, _this3.data);
              _this3.auth().fail(function () {
                return deferred.reject(error);
              });
            } else {
              deferred.reject(error);
            }
          }
          _this3.data.status = 'pending';
          _this3.data.phoneNumber = response.phone;
          _this3.data.dispatchType = dispatchType;
          localStorage.setItem('__rc_dui', response.phone_hash);
          session.updateSession(app, _this3.data);
          return deferred.resolve();
        };
        ajax(ajaxSetup, doneCallback, deferred.reject);
        return deferred.promise();
      }

      /*
      Check if PIN code is valid.
      */

    }, {
      key: 'check',
      value: function check(code) {
        var _this4 = this;

        if (mode === 'onboarding' || mode === 'distribution') {
          return;
        }
        var deferred = $.Deferred();
        // Setup AJAX request
        var ajaxSetup = {
          type: 'POST',
          url: config.api + '/v2/apps/' + app + '/check',
          data: {
            token: this.data.token,
            fp: this.data.fingerprint || fingerprint.getFingerprint(),
            code: code
          }
        };
        // If has been verified then update the status
        var doneCallback = function doneCallback(response) {
          var status = (response.status || response.result).toLowerCase();
          var message = (response.message || response.status).toLowerCase();
          if (status === 'error') {
            var error = message.slice(0, 5) === 'error' ? message.slice(6) : message;
            return deferred.reject(error);
          } else {
            _this4.data.status = 'verified';
            _this4.data.expiresAt = -1;
            session.updateSession(app, _this4.data);
            return deferred.resolve();
          }
        };
        ajax(ajaxSetup, doneCallback, deferred.reject);
        return deferred.promise();
      }

      /*
      Check if an user has been verified via url.
      */

    }, {
      key: 'checkUrl',
      value: function checkUrl() {
        var _this5 = this;

        if (mode === 'onboarding' || mode === 'distribution') {
          return;
        }
        var deferred = $.Deferred();
        // Setup AJAX request
        var ajaxSetup = {
          type: 'POST',
          url: config.api + '/v2/apps/' + app + '/check/url',
          data: {
            token: this.data.token,
            fp: this.data.fingerprint || fingerprint.getFingerprint()
          }
        };
        // If has been verified then update the status
        var doneCallback = function doneCallback(response) {
          var status = (response.status || response.result).toLowerCase();
          var message = (response.message || response.status).toLowerCase();
          if (status === 'error') {
            var error = message.slice(0, 5) === 'error' ? message.slice(6) : message;
            return deferred.reject(error);
          } else {
            _this5.data.status = 'verified';
            _this5.data.expiresAt = -1;
            session.updateSession(app, _this5.data);
            return deferred.resolve(response.code);
          }
        };
        ajax(ajaxSetup, doneCallback, deferred.reject);
        return deferred.promise();
      }
    }]);

    return Api;
  }();

  ;

  return Api;
}();

module.exports = Api;

},{"../config.json":1,"./events":18,"./util/ajax":27,"./util/fingerprint":29,"./util/geolocation":30,"./util/session":32,"./zepto":34}],16:[function(require,module,exports){
'use strict';

module.exports = {
  af: {
    country_name: {
      en: 'Afghanistan',
      es: 'Afganistán'
    },
    country_code: 93,
    example_dial: '023 456 7890'
  },
  al: {
    country_name: {
      en: 'Albania',
      es: 'Albania'
    },
    country_code: 355,
    example_dial: '022 345 678'
  },
  dz: {
    country_name: {
      en: 'Algeria',
      es: 'Argelia'
    },
    country_code: 213,
    example_dial: '012 34 56 78'
  },
  as: {
    country_name: {
      en: 'American Samoa',
      es: 'Samoa Americana'
    },
    country_code: 1684,
    example_dial: '(684) 622-1234'
  },
  ad: {
    country_name: {
      en: 'Andorra',
      es: 'Andorra'
    },
    country_code: 376,
    example_dial: '712 345'
  },
  ao: {
    country_name: {
      en: 'Angola',
      es: 'Angola'
    },
    country_code: 244,
    example_dial: '222 123 456'
  },
  ai: {
    country_name: {
      en: 'Anguilla',
      es: 'Anguila'
    },
    country_code: 1264,
    example_dial: '(264) 461-2345'
  },
  aq: {
    country_name: {
      en: 'Antarctic Territories',
      es: 'Antártida'
    },
    country_code: 672,
    example_dial: ''
  },
  ag: {
    country_name: {
      en: 'Antigua & Barbuda',
      es: 'Antigua & Barbuda'
    },
    country_code: 1268,
    example_dial: '(268) 460-1234'
  },
  an: {
    country_name: {
      en: 'Antilles',
      es: 'Antillas'
    },
    country_code: 599,
    example_dial: ''
  },
  ar: {
    country_name: {
      en: 'Argentina',
      es: 'Argentina'
    },
    country_code: 54,
    example_dial: '11 2345-6789'
  },
  am: {
    country_name: {
      en: 'Armenia',
      es: 'Armenia'
    },
    country_code: 374,
    example_dial: '(010) 123456'
  },
  aw: {
    country_name: {
      en: 'Aruba',
      es: 'Aruba'
    },
    country_code: 297,
    example_dial: '521 2345'
  },
  au: {
    country_name: {
      en: 'Australia',
      es: 'Australia'
    },
    country_code: 61,
    example_dial: '(02) 1234 5678'
  },
  at: {
    country_name: {
      en: 'Austria',
      es: 'Austria'
    },
    country_code: 43,
    example_dial: '01 234567890'
  },
  az: {
    country_name: {
      en: 'Azerbaijan',
      es: 'Azerbaiyán'
    },
    country_code: 994,
    example_dial: '(012) 312 34 56'
  },
  bs: {
    country_name: {
      en: 'Bahamas',
      es: 'Bahamas'
    },
    country_code: 1242,
    example_dial: '(242) 345-6789'
  },
  bh: {
    country_name: {
      en: 'Bahrain',
      es: 'Bahrein'
    },
    country_code: 973,
    example_dial: '1700 1234'
  },
  bd: {
    country_name: {
      en: 'Bangladesh',
      es: 'Bangladesh'
    },
    country_code: 880,
    example_dial: '02-7111234'
  },
  bb: {
    country_name: {
      en: 'Barbados',
      es: 'Barbados'
    },
    country_code: 1246,
    example_dial: '(246) 234-5678'
  },
  by: {
    country_name: {
      en: 'Belarus',
      es: 'Bielorrusia'
    },
    country_code: 375,
    example_dial: '8 015 245 0911'
  },
  be: {
    country_name: {
      en: 'Belgium',
      es: 'Bélgica'
    },
    country_code: 32,
    example_dial: '012 34 56 78'
  },
  bz: {
    country_name: {
      en: 'Belize',
      es: 'Belice'
    },
    country_code: 501,
    example_dial: '222-1234'
  },
  bj: {
    country_name: {
      en: 'Benin',
      es: 'Benin'
    },
    country_code: 229,
    example_dial: '20 21 12 34'
  },
  bm: {
    country_name: {
      en: 'Bermuda',
      es: 'Bermuda'
    },
    country_code: 1441,
    example_dial: '(441) 234-5678'
  },
  bt: {
    country_name: {
      en: 'Bhutan',
      es: 'Bután'
    },
    country_code: 975,
    example_dial: '2 345 678'
  },
  bo: {
    country_name: {
      en: 'Bolivia',
      es: 'Bolivia'
    },
    country_code: 591,
    example_dial: '2 2123456'
  },
  ba: {
    country_name: {
      en: 'Bosnia & H.',
      es: 'Bosnia & H.'
    },
    country_code: 387,
    example_dial: '030 123-456'
  },
  bw: {
    country_name: {
      en: 'Botswana',
      es: 'Botswana'
    },
    country_code: 267,
    example_dial: '240 1234'
  },
  br: {
    country_name: {
      en: 'Brazil',
      es: 'Brasil'
    },
    country_code: 55,
    example_dial: '(11) 2345-6789'
  },
  bn: {
    country_name: {
      en: 'Brunei',
      es: 'Brunéi'
    },
    country_code: 673,
    example_dial: '234 5678'
  },
  bg: {
    country_name: {
      en: 'Bulgaria',
      es: 'Bulgaria'
    },
    country_code: 359,
    example_dial: '02 123 456'
  },
  bf: {
    country_name: {
      en: 'Burkina Faso',
      es: 'Burkina Faso'
    },
    country_code: 226,
    example_dial: '20 49 12 34'
  },
  bi: {
    country_name: {
      en: 'Burundi',
      es: 'Burundi'
    },
    country_code: 257,
    example_dial: '22 20 12 34'
  },
  kh: {
    country_name: {
      en: 'Cambodia',
      es: 'Camboya'
    },
    country_code: 855,
    example_dial: '023 456 789'
  },
  cm: {
    country_name: {
      en: 'Cameroon',
      es: 'Camerún'
    },
    country_code: 237,
    example_dial: '22 12 34 56'
  },
  ca: {
    country_name: {
      en: 'Canada',
      es: 'Canada'
    },
    country_code: 1,
    example_dial: '(204) 234-5678'
  },
  cv: {
    country_name: {
      en: 'Cape Verde Island',
      es: 'Isla Cabo Verde'
    },
    country_code: 238,
    example_dial: '221 12 34'
  },
  ky: {
    country_name: {
      en: 'Cayman Islands',
      es: 'Islas Caimán'
    },
    country_code: 1345,
    example_dial: '(345) 222-1234'
  },
  cf: {
    country_name: {
      en: 'Central African Rep.',
      es: 'Rep Centroafricana.'
    },
    country_code: 236,
    example_dial: '21 61 23 45'
  },
  td: {
    country_name: {
      en: 'Chad',
      es: 'Chad'
    },
    country_code: 235,
    example_dial: '22 50 12 34'
  },
  cl: {
    country_name: {
      en: 'Chile',
      es: 'Chile'
    },
    country_code: 56,
    example_dial: '(2) 2123 4567'
  },
  cn: {
    country_name: {
      en: 'China',
      es: 'China'
    },
    country_code: 86,
    example_dial: '010 1234 5678'
  },
  co: {
    country_name: {
      en: 'Colombia',
      es: 'Colombia'
    },
    country_code: 57,
    example_dial: '(1) 2345678'
  },
  km: {
    country_name: {
      en: 'Comoros',
      es: 'Comoras'
    },
    country_code: 269,
    example_dial: '771 23 45'
  },
  cg: {
    country_name: {
      en: 'Congo',
      es: 'Congo'
    },
    country_code: 242,
    example_dial: '22 212 3456'
  },
  ck: {
    country_name: {
      en: 'Cook Islands',
      es: 'Islas Cook'
    },
    country_code: 682,
    example_dial: '21 234'
  },
  cr: {
    country_name: {
      en: 'Costa Rica',
      es: 'Costa Rica'
    },
    country_code: 506,
    example_dial: '2212 3456'
  },
  ci: {
    country_name: {
      en: 'Cote D\'Ivoire',
      es: 'Costa de Marfil'
    },
    country_code: 225,
    example_dial: '21 23 45 67'
  },
  hr: {
    country_name: {
      en: 'Croatia',
      es: 'Croacia'
    },
    country_code: 385,
    example_dial: '01 2345 678'
  },
  cu: {
    country_name: {
      en: 'Cuba',
      es: 'Cuba'
    },
    country_code: 53,
    example_dial: '(07) 1234567'
  },
  cy: {
    country_name: {
      en: 'Cyprus South',
      es: 'Chipre'
    },
    country_code: 357,
    example_dial: '22 345678'
  },
  cz: {
    country_name: {
      en: 'Czech Republic',
      es: 'República Checa'
    },
    country_code: 420,
    example_dial: '212 345 678'
  },
  cd: {
    country_name: {
      en: 'Dem Rep Congo',
      es: 'República Democrática del Congo'
    },
    country_code: 243,
    example_dial: '012 34567'
  },
  dk: {
    country_name: {
      en: 'Denmark',
      es: 'Dinamarca'
    },
    country_code: 45,
    example_dial: '32 12 34 56'
  },
  io: {
    country_name: {
      en: 'Diego Garcia',
      es: 'Diego García'
    },
    country_code: 246,
    example_dial: '370 9100'
  },
  dj: {
    country_name: {
      en: 'Djibouti',
      es: 'Djibouti'
    },
    country_code: 253,
    example_dial: '21 36 00 03'
  },
  dm: {
    country_name: {
      en: 'Dominica',
      es: 'Dominica'
    },
    country_code: 1767,
    example_dial: '(767) 420-1234'
  },
  tl: {
    country_name: {
      en: 'East Timor',
      es: 'Timor del Este'
    },
    country_code: 670,
    example_dial: '211 2345'
  },
  ec: {
    country_name: {
      en: 'Ecuador',
      es: 'Ecuador'
    },
    country_code: 593,
    example_dial: '(02) 212-3456'
  },
  eg: {
    country_name: {
      en: 'Egypt',
      es: 'Egipto'
    },
    country_code: 20,
    example_dial: '02 34567890'
  },
  sv: {
    country_name: {
      en: 'El Salvador',
      es: 'El Salvador'
    },
    country_code: 503,
    example_dial: '2123 4567'
  },
  gq: {
    country_name: {
      en: 'Equatorial Guinea',
      es: 'Guinea Ecuatorial'
    },
    country_code: 240,
    example_dial: '333 091 234'
  },
  er: {
    country_name: {
      en: 'Eritrea',
      es: 'Eritrea'
    },
    country_code: 291,
    example_dial: '08 370 362'
  },
  ee: {
    country_name: {
      en: 'Estonia',
      es: 'Estonia'
    },
    country_code: 372,
    example_dial: '321 2345'
  },
  et: {
    country_name: {
      en: 'Ethiopia',
      es: 'Etiopía'
    },
    country_code: 251,
    example_dial: '011 111 2345'
  },
  fo: {
    country_name: {
      en: 'Faeroe Islands',
      es: 'Islas Feroe'
    },
    country_code: 298,
    example_dial: '201234'
  },
  fk: {
    country_name: {
      en: 'Falkland Islands',
      es: 'Islas Malvinas'
    },
    country_code: 500,
    example_dial: '31234'
  },
  fj: {
    country_name: {
      en: 'Fiji',
      es: 'Fiji'
    },
    country_code: 679,
    example_dial: '321 2345'
  },
  fi: {
    country_name: {
      en: 'Finland',
      es: 'Finlandia'
    },
    country_code: 358,
    example_dial: '013 12345678'
  },
  fr: {
    country_name: {
      en: 'France',
      es: 'Francia'
    },
    country_code: 33,
    example_dial: '01 23 45 67 89'
  },
  gf: {
    country_name: {
      en: 'French Guiana',
      es: 'Guayana Francesa'
    },
    country_code: 594,
    example_dial: '0594 10 12 34'
  },
  pf: {
    country_name: {
      en: 'French Polynesia',
      es: 'Polinesia Francesa'
    },
    country_code: 689,
    example_dial: '40 12 34'
  },
  ga: {
    country_name: {
      en: 'Gabon',
      es: 'Gabón'
    },
    country_code: 241,
    example_dial: '01 44 12 34'
  },
  gm: {
    country_name: {
      en: 'Gambia',
      es: 'Gambia'
    },
    country_code: 220,
    example_dial: '566 1234'
  },
  ge: {
    country_name: {
      en: 'Georgia',
      es: 'Georgia'
    },
    country_code: 995,
    example_dial: '8 322 12 34 56'
  },
  de: {
    country_name: {
      en: 'Germany',
      es: 'Alemania'
    },
    country_code: 49,
    example_dial: '030 123456'
  },
  gh: {
    country_name: {
      en: 'Ghana',
      es: 'Ghana'
    },
    country_code: 233,
    example_dial: '030 234 5678'
  },
  gi: {
    country_name: {
      en: 'Gibraltar',
      es: 'Gibraltar'
    },
    country_code: 350,
    example_dial: '20012345'
  },
  gr: {
    country_name: {
      en: 'Greece',
      es: 'Grecia'
    },
    country_code: 30,
    example_dial: '21 2345 6789'
  },
  gl: {
    country_name: {
      en: 'Greenland',
      es: 'Groenlandia'
    },
    country_code: 299,
    example_dial: '32 10 00'
  },
  gd: {
    country_name: {
      en: 'Grenada',
      es: 'Granada'
    },
    country_code: 1473,
    example_dial: '(473) 269-1234'
  },
  bl: {
    country_name: {
      en: 'Guadeloupe',
      es: 'Guadalupe'
    },
    country_code: 590,
    example_dial: '0590 27-1234'
  },
  gu: {
    country_name: {
      en: 'Guam',
      es: 'Guam'
    },
    country_code: 1671,
    example_dial: '(671) 300-1234'
  },
  gt: {
    country_name: {
      en: 'Guatemala',
      es: 'Guatemala'
    },
    country_code: 502,
    example_dial: '2245 6789'
  },
  gn: {
    country_name: {
      en: 'Guinea',
      es: 'Guinea'
    },
    country_code: 224,
    example_dial: '30 24 12 34'
  },
  gy: {
    country_name: {
      en: 'Guyana',
      es: 'Guyana'
    },
    country_code: 592,
    example_dial: '220 1234'
  },
  ht: {
    country_name: {
      en: 'Haiti',
      es: 'Haití'
    },
    country_code: 509,
    example_dial: '22 45 3300'
  },
  hn: {
    country_name: {
      en: 'Honduras',
      es: 'Honduras'
    },
    country_code: 504,
    example_dial: '2212-3456'
  },
  hk: {
    country_name: {
      en: 'Hong Kong',
      es: 'Hong Kong'
    },
    country_code: 852,
    example_dial: '2123 4567'
  },
  hu: {
    country_name: {
      en: 'Hungary',
      es: 'Hungría'
    },
    country_code: 36,
    example_dial: '(1) 234 5678'
  },
  is: {
    country_name: {
      en: 'Iceland',
      es: 'Islandia'
    },
    country_code: 354,
    example_dial: '410 1234'
  },
  in: {
    country_name: {
      en: 'India',
      es: 'India'
    },
    country_code: 91,
    example_dial: '011 2345 6789'
  },
  id: {
    country_name: {
      en: 'Indonesia',
      es: 'Indonesia'
    },
    country_code: 62,
    example_dial: '(061) 2345678'
  },
  pn: {
    country_name: {
      en: 'Inmarsat HSD',
      es: 'Inmarsat HSD'
    },
    country_code: 870,
    example_dial: ''
  },
  ir: {
    country_name: {
      en: 'Iran',
      es: 'Irán'
    },
    country_code: 98,
    example_dial: '021 2345 6789'
  },
  iq: {
    country_name: {
      en: 'Iraq',
      es: 'Irak'
    },
    country_code: 964,
    example_dial: '01 234 5678'
  },
  ie: {
    country_name: {
      en: 'Ireland',
      es: 'Irlanda'
    },
    country_code: 353,
    example_dial: '(022) 12345'
  },
  il: {
    country_name: {
      en: 'Israel',
      es: 'Israel'
    },
    country_code: 972,
    example_dial: '02-123-4567'
  },
  it: {
    country_name: {
      en: 'Italy',
      es: 'Italia'
    },
    country_code: 39,
    example_dial: '02 1234 5678'
  },
  jm: {
    country_name: {
      en: 'Jamaica',
      es: 'Jamaica'
    },
    country_code: 1876,
    example_dial: '(876) 512-3456'
  },
  jp: {
    country_name: {
      en: 'Japan',
      es: 'Japón'
    },
    country_code: 81,
    example_dial: ''
  },
  jo: {
    country_name: {
      en: 'Jordan',
      es: 'Jordan'
    },
    country_code: 962,
    example_dial: '(06) 200 1234'
  },
  kz: {
    country_name: {
      en: 'Kazakhstan',
      es: 'Kazajstán'
    },
    country_code: 7,
    example_dial: '8 (712) 345 6789'
  },
  ke: {
    country_name: {
      en: 'Kenya',
      es: 'Kenya'
    },
    country_code: 254,
    example_dial: '020 2012345'
  },
  ki: {
    country_name: {
      en: 'Kiribati',
      es: 'Kiribati'
    },
    country_code: 686,
    example_dial: '31234'
  },
  kp: {
    country_name: {
      en: 'Korea North',
      es: 'Corea del Norte'
    },
    country_code: 850,
    example_dial: '02 123 4567'
  },
  kr: {
    country_name: {
      en: 'Korea South',
      es: 'Corea del Sur'
    },
    country_code: 82,
    example_dial: '02-212-3456'
  },
  kw: {
    country_name: {
      en: 'Kuwait',
      es: 'Kuwait'
    },
    country_code: 965,
    example_dial: '2234 5678'
  },
  kg: {
    country_name: {
      en: 'Kyrgyzstan',
      es: 'Kirguistán'
    },
    country_code: 996,
    example_dial: '0312 123 456'
  },
  la: {
    country_name: {
      en: 'Laos',
      es: 'Laos'
    },
    country_code: 856,
    example_dial: '021 212 862'
  },
  lv: {
    country_name: {
      en: 'Latvia',
      es: 'Letonia'
    },
    country_code: 371,
    example_dial: '63 123 456'
  },
  lb: {
    country_name: {
      en: 'Lebanon',
      es: 'Líbano'
    },
    country_code: 961,
    example_dial: '01 123 456'
  },
  ls: {
    country_name: {
      en: 'Lesotho',
      es: 'Lesotho'
    },
    country_code: 266,
    example_dial: '2212 3456'
  },
  lr: {
    country_name: {
      en: 'Liberia',
      es: 'Liberia'
    },
    country_code: 231,
    example_dial: '021 234 567'
  },
  ly: {
    country_name: {
      en: 'Libya',
      es: 'Libia'
    },
    country_code: 218,
    example_dial: '021-2345678'
  },
  li: {
    country_name: {
      en: 'Liechtenstein',
      es: 'Liechtenstein'
    },
    country_code: 423,
    example_dial: '234 56 78'
  },
  lt: {
    country_name: {
      en: 'Lithuania',
      es: 'Lituania'
    },
    country_code: 370,
    example_dial: '(8-312) 34567'
  },
  lu: {
    country_name: {
      en: 'Luxembourg',
      es: 'Luxemburgo'
    },
    country_code: 352,
    example_dial: '27 12 34 56'
  },
  mo: {
    country_name: {
      en: 'Macao',
      es: 'Macao'
    },
    country_code: 853,
    example_dial: '2821 2345'
  },
  mk: {
    country_name: {
      en: 'Macedonia',
      es: 'Macedonia'
    },
    country_code: 389,
    example_dial: '02 221 2345'
  },
  mg: {
    country_name: {
      en: 'Madagascar',
      es: 'Madagascar'
    },
    country_code: 261,
    example_dial: '020 21 234 56'
  },
  mw: {
    country_name: {
      en: 'Malawi',
      es: 'Malawi'
    },
    country_code: 265,
    example_dial: '01 234 567'
  },
  my: {
    country_name: {
      en: 'Malaysia',
      es: 'Malasia'
    },
    country_code: 60,
    example_dial: '03-2345 6789'
  },
  mv: {
    country_name: {
      en: 'Maldives',
      es: 'Maldivas'
    },
    country_code: 960,
    example_dial: '670-1234'
  },
  ml: {
    country_name: {
      en: 'Mali',
      es: 'Malí'
    },
    country_code: 223,
    example_dial: '20 21 23 45'
  },
  mt: {
    country_name: {
      en: 'Malta',
      es: 'Malta'
    },
    country_code: 356,
    example_dial: '2100 1234'
  },
  mh: {
    country_name: {
      en: 'Marshall Islands',
      es: 'Islas Marshall'
    },
    country_code: 692,
    example_dial: '247-1234'
  },
  mq: {
    country_name: {
      en: 'Martinique',
      es: 'Martinica'
    },
    country_code: 596,
    example_dial: '0596 30 12 34'
  },
  mr: {
    country_name: {
      en: 'Mauritania',
      es: 'Mauritania'
    },
    country_code: 222,
    example_dial: '35 12 34 56'
  },
  mu: {
    country_name: {
      en: 'Mauritius',
      es: 'Mauricio'
    },
    country_code: 230,
    example_dial: '201 2345'
  },
  yt: {
    country_name: {
      en: 'Mayotte',
      es: 'Mayotte'
    },
    country_code: 262,
    example_dial: '0269 60 12 34'
  },
  mx: {
    country_name: {
      en: 'Mexico',
      es: 'México'
    },
    country_code: 52,
    example_dial: '55 1234 5678'
  },
  fm: {
    country_name: {
      en: 'Micronesia',
      es: 'Micronesia'
    },
    country_code: 691,
    example_dial: '320 1234'
  },
  md: {
    country_name: {
      en: 'Moldova',
      es: 'Moldavia'
    },
    country_code: 373,
    example_dial: '022 212 345'
  },
  mc: {
    country_name: {
      en: 'Monaco',
      es: 'Mónaco'
    },
    country_code: 377,
    example_dial: '99 12 34 56'
  },
  mn: {
    country_name: {
      en: 'Mongolia',
      es: 'Mongolia'
    },
    country_code: 976,
    example_dial: '5012 3456'
  },
  ms: {
    country_name: {
      en: 'Montserrat',
      es: 'Montserrat'
    },
    country_code: 1664,
    example_dial: '(664) 491-2345'
  },
  ma: {
    country_name: {
      en: 'Morocco',
      es: 'Marruecos'
    },
    country_code: 212,
    example_dial: '0520-123456'
  },
  mz: {
    country_name: {
      en: 'Mozambique',
      es: 'Mozambique'
    },
    country_code: 258,
    example_dial: '21 123 456'
  },
  mm: {
    country_name: {
      en: 'Myanmar',
      es: 'Myanmar'
    },
    country_code: 95,
    example_dial: '01 234 567'
  },
  na: {
    country_name: {
      en: 'Namibia',
      es: 'Namibia'
    },
    country_code: 264,
    example_dial: '061 201 2345'
  },
  nr: {
    country_name: {
      en: 'Nauru',
      es: 'Nauru'
    },
    country_code: 674,
    example_dial: '444 1234'
  },
  np: {
    country_name: {
      en: 'Nepal',
      es: 'Nepal'
    },
    country_code: 977,
    example_dial: '01-4567890'
  },
  nl: {
    country_name: {
      en: 'Netherlands',
      es: 'Países Bajos'
    },
    country_code: 31,
    example_dial: '010 123 4567'
  },
  nc: {
    country_name: {
      en: 'New Caledonia',
      es: 'Nueva Caledonia'
    },
    country_code: 687,
    example_dial: '20.12.34'
  },
  nz: {
    country_name: {
      en: 'New Zealand',
      es: 'Nueva Zelanda'
    },
    country_code: 64,
    example_dial: '03-234 5678'
  },
  ni: {
    country_name: {
      en: 'Nicaragua',
      es: 'Nicaragua'
    },
    country_code: 505,
    example_dial: '2123 4567'
  },
  ne: {
    country_name: {
      en: 'Niger',
      es: 'Níger'
    },
    country_code: 227,
    example_dial: '20 20 12 34'
  },
  nu: {
    country_name: {
      en: 'Niue',
      es: 'Niue'
    },
    country_code: 683,
    example_dial: '4002'
  },
  nf: {
    country_name: {
      en: 'Norfolk Islands',
      es: 'Islas Norfolk'
    },
    country_code: 6723,
    example_dial: '10 6609'
  },
  mp: {
    country_name: {
      en: 'Northern Marianas',
      es: 'Islas Marianas del Norte'
    },
    country_code: 1670,
    example_dial: '(670) 234-5678'
  },
  no: {
    country_name: {
      en: 'Norway',
      es: 'Noruega'
    },
    country_code: 47,
    example_dial: '21 23 45 67'
  },
  om: {
    country_name: {
      en: 'Oman',
      es: 'Omán'
    },
    country_code: 968,
    example_dial: '23 123456'
  },
  pk: {
    country_name: {
      en: 'Pakistan',
      es: 'Pakistán'
    },
    country_code: 92,
    example_dial: '(021) 23456789'
  },
  pw: {
    country_name: {
      en: 'Palau',
      es: 'Palau'
    },
    country_code: 680,
    example_dial: '277 1234'
  },
  ps: {
    country_name: {
      en: 'Palestine',
      es: 'Palestina'
    },
    country_code: 970,
    example_dial: '02 223 4567'
  },
  pa: {
    country_name: {
      en: 'Panama',
      es: 'Panamá'
    },
    country_code: 507,
    example_dial: '200-1234'
  },
  pg: {
    country_name: {
      en: 'Papua New Guinea',
      es: 'Papúa Nueva Guinea'
    },
    country_code: 675,
    example_dial: '312 3456'
  },
  py: {
    country_name: {
      en: 'Paraguay',
      es: 'Paraguay'
    },
    country_code: 595,
    example_dial: '(21) 2345678'
  },
  pe: {
    country_name: {
      en: 'Peru',
      es: 'Perú'
    },
    country_code: 51,
    example_dial: '(01) 1234567'
  },
  ph: {
    country_name: {
      en: 'Philippines',
      es: 'Filipinas'
    },
    country_code: 63,
    example_dial: '(02) 123 4567'
  },
  pl: {
    country_name: {
      en: 'Poland',
      es: 'Polonia'
    },
    country_code: 48,
    example_dial: '12 345 67 89'
  },
  pt: {
    country_name: {
      en: 'Portugal',
      es: 'Portugal'
    },
    country_code: 351,
    example_dial: '212 345 678'
  },
  'pr-1': {
    country_name: {
      en: 'Puerto Rico',
      es: 'Puerto Rico'
    },
    country_code: 1939,
    example_dial: '(939) 234-5678'
  },
  'pr-2': {
    country_name: {
      en: 'Puerto Rico',
      es: 'Puerto Rico'
    },
    country_code: 1787,
    example_dial: '(787) 234-5678'
  },
  qa: {
    country_name: {
      en: 'Qatar',
      es: 'Qatar'
    },
    country_code: 974,
    example_dial: '4412 3456'
  },
  re: {
    country_name: {
      en: 'Reunion',
      es: 'Reunion'
    },
    country_code: 262,
    example_dial: '0262 16 12 34'
  },
  ro: {
    country_name: {
      en: 'Romania',
      es: 'Rumania'
    },
    country_code: 40,
    example_dial: '021 123 4567'
  },
  ru: {
    country_name: {
      en: 'Russia',
      es: 'Rusia'
    },
    country_code: 7,
    example_dial: '8 (301) 123-45-67'
  },
  rw: {
    country_name: {
      en: 'Rwanda',
      es: 'Rwanda'
    },
    country_code: 250,
    example_dial: '250 123 456'
  },
  sm: {
    country_name: {
      en: 'San Marino',
      es: 'San Marino'
    },
    country_code: 378,
    example_dial: '0549 886377'
  },
  st: {
    country_name: {
      en: 'Sao Tome & Principe',
      es: 'Sao Tome & Principe'
    },
    country_code: 239,
    example_dial: '222 1234'
  },
  sa: {
    country_name: {
      en: 'Saudi Arabia',
      es: 'Arabia Saudita'
    },
    country_code: 966,
    example_dial: '01 234 5678'
  },
  sn: {
    country_name: {
      en: 'Senegal',
      es: 'Senegal'
    },
    country_code: 221,
    example_dial: '30 101 23 45'
  },
  rs: {
    country_name: {
      en: 'Serbia',
      es: 'Serbia'
    },
    country_code: 381,
    example_dial: '010 234567'
  },
  sc: {
    country_name: {
      en: 'Seychelles',
      es: 'Seychelles'
    },
    country_code: 248,
    example_dial: '4 217 123'
  },
  sl: {
    country_name: {
      en: 'Sierra Leone',
      es: 'Sierra Leona'
    },
    country_code: 232,
    example_dial: '(022) 221234'
  },
  sg: {
    country_name: {
      en: 'Singapore',
      es: 'Singapur'
    },
    country_code: 65,
    example_dial: '6123 4567'
  },
  sk: {
    country_name: {
      en: 'Slovak Rep',
      es: 'República Eslovaca'
    },
    country_code: 421,
    example_dial: '02x2F123 456 78'
  },
  si: {
    country_name: {
      en: 'Slovenia',
      es: 'Eslovenia'
    },
    country_code: 386,
    example_dial: '(01) 123 45 67'
  },
  sb: {
    country_name: {
      en: 'Solomon Islands',
      es: 'Islas Salomón'
    },
    country_code: 677,
    example_dial: '40123'
  },
  so: {
    country_name: {
      en: 'Somalia',
      es: 'Somalia'
    },
    country_code: 252,
    example_dial: '5 522010'
  },
  za: {
    country_name: {
      en: 'South Africa',
      es: 'Sudáfrica'
    },
    country_code: 27,
    example_dial: '010 123 4567'
  },
  es: {
    country_name: {
      en: 'Spain',
      es: 'España'
    },
    country_code: 34,
    example_dial: '810 12 34 56'
  },
  lk: {
    country_name: {
      en: 'Sri Lanka',
      es: 'Sri Lanka'
    },
    country_code: 94,
    example_dial: '011 2 345678'
  },
  sh: {
    country_name: {
      en: 'St. Helena',
      es: 'St. Helena'
    },
    country_code: 290,
    example_dial: '2158'
  },
  kn: {
    country_name: {
      en: 'St. Kitts & Nevis',
      es: 'St. Kitts & Nieves'
    },
    country_code: 1869,
    example_dial: '(869) 236-1234'
  },
  lc: {
    country_name: {
      en: 'St. Lucia',
      es: 'Santa Lucía'
    },
    country_code: 1758,
    example_dial: '(758) 234-5678'
  },
  pm: {
    country_name: {
      en: 'St. Pierre & Miquelon',
      es: 'St. Pierre & Miquelón'
    },
    country_code: 508,
    example_dial: '041 12 34'
  },
  vc: {
    country_name: {
      en: 'St. Vincents',
      es: 'St. Vincent'
    },
    country_code: 1784,
    example_dial: '(784) 266-1234'
  },
  sd: {
    country_name: {
      en: 'Sudan',
      es: 'Sudán'
    },
    country_code: 249,
    example_dial: '012 123 1234'
  },
  sr: {
    country_name: {
      en: 'Suriname',
      es: 'Suriname'
    },
    country_code: 597,
    example_dial: '211-234'
  },
  sz: {
    country_name: {
      en: 'Swaziland',
      es: 'Swazilandia'
    },
    country_code: 268,
    example_dial: '2217 1234'
  },
  se: {
    country_name: {
      en: 'Sweden',
      es: 'Suecia'
    },
    country_code: 46,
    example_dial: '08-12 34 56'
  },
  ch: {
    country_name: {
      en: 'Switzerland',
      es: 'Suiza'
    },
    country_code: 41,
    example_dial: '021 234 56 78'
  },
  sy: {
    country_name: {
      en: 'Syria',
      es: 'Siria'
    },
    country_code: 963,
    example_dial: '011 234 5678'
  },
  tw: {
    country_name: {
      en: 'Taiwan',
      es: 'Taiwan'
    },
    country_code: 886,
    example_dial: '02 123 4567'
  },
  tj: {
    country_name: {
      en: 'Tajikstan',
      es: 'Tayikistán'
    },
    country_code: 992,
    example_dial: '(8) 372 12 3456'
  },
  tz: {
    country_name: {
      en: 'Tanzania',
      es: 'Tanzania'
    },
    country_code: 255,
    example_dial: '022 234 5678'
  },
  th: {
    country_name: {
      en: 'Thailand',
      es: 'Tailandia'
    },
    country_code: 66,
    example_dial: '02 123 4567'
  },
  tg: {
    country_name: {
      en: 'Togo',
      es: 'Togo'
    },
    country_code: 228,
    example_dial: '22 21 23 45'
  },
  tk: {
    country_name: {
      en: 'Tokelau',
      es: 'Tokelau'
    },
    country_code: 690,
    example_dial: '3010'
  },
  to: {
    country_name: {
      en: 'Tonga',
      es: 'Tonga'
    },
    country_code: 676,
    example_dial: '20-123'
  },
  tt: {
    country_name: {
      en: 'Trinidad & Tobago',
      es: 'Trinidad & amp; Tobago'
    },
    country_code: 1868,
    example_dial: '(868) 221-1234'
  },
  tn: {
    country_name: {
      en: 'Tunisia',
      es: 'Túnez'
    },
    country_code: 216,
    example_dial: '71 234 567'
  },
  tr: {
    country_name: {
      en: 'Turkey',
      es: 'pavo'
    },
    country_code: 90,
    example_dial: '(0212) 345 6789'
  },
  tm: {
    country_name: {
      en: 'Turkmenistan',
      es: 'Turkmenistán'
    },
    country_code: 993,
    example_dial: '(8 12) 34-56-78'
  },
  tc: {
    country_name: {
      en: 'Turks & Caicos',
      es: 'Turks & amp; Caicos'
    },
    country_code: 1649,
    example_dial: '(649) 712-1234'
  },
  tv: {
    country_name: {
      en: 'Tuvalu',
      es: 'Tuvalu'
    },
    country_code: 688,
    example_dial: '20123'
  },
  ug: {
    country_name: {
      en: 'Uganda',
      es: 'Uganda'
    },
    country_code: 256,
    example_dial: '031 2345678'
  },
  gb: {
    country_name: {
      en: 'United Kingdom',
      es: 'Reino Unido'
    },
    country_code: 44,
    example_dial: '0121 234 5678'
  },
  ua: {
    country_name: {
      en: 'Ukraine',
      es: 'Ucrania'
    },
    country_code: 380,
    example_dial: '03112 34567'
  },
  ae: {
    country_name: {
      en: 'United Arab Emirates',
      es: 'Emiratos Árabes Unidos'
    },
    country_code: 971,
    example_dial: '02 234 5678'
  },
  uy: {
    country_name: {
      en: 'Uruguay',
      es: 'Uruguay'
    },
    country_code: 598,
    example_dial: '2123 1234'
  },
  us: {
    country_name: {
      en: 'United States',
      es: 'Estados Unidos'
    },
    country_code: 1,
    example_dial: '(201) 555-0123'
  },
  uz: {
    country_name: {
      en: 'Uzbekistan',
      es: 'Uzbekistán'
    },
    country_code: 998,
    example_dial: '8 66 234 56 78'
  },
  vu: {
    country_name: {
      en: 'Vanuatu',
      es: 'Vanuatu'
    },
    country_code: 678,
    example_dial: '22123'
  },
  ve: {
    country_name: {
      en: 'Venezuela',
      es: 'Venezuela'
    },
    country_code: 58,
    example_dial: '0212-1234567'
  },
  vn: {
    country_name: {
      en: 'Vietnam',
      es: 'Vietnam'
    },
    country_code: 84,
    example_dial: '0210 1234 567'
  },
  vg: {
    country_name: {
      en: 'Virgin Islands GB',
      es: 'Islas Vírgenes GB'
    },
    country_code: 1284,
    example_dial: '(284) 229-1234'
  },
  vi: {
    country_name: {
      en: 'Virgin Islands USA',
      es: 'Islas Vírgenes de EE.UU.'
    },
    country_code: 1340,
    example_dial: '(340) 642-1234'
  },
  wf: {
    country_name: {
      en: 'Wallis & Futuna',
      es: 'Wallis & Futuna'
    },
    country_code: 681,
    example_dial: '50 12 34'
  },
  ws: {
    country_name: {
      en: 'Western Samoa',
      es: 'Samoa Occidental'
    },
    country_code: 685,
    example_dial: '22123'
  },
  ye: {
    country_name: {
      en: 'Yemen',
      es: 'Yemen'
    },
    country_code: 967,
    example_dial: '01 234 567'
  },
  zm: {
    country_name: {
      en: 'Zambia',
      es: 'Zambia'
    },
    country_code: 260,
    example_dial: '021 1234567'
  },
  zw: {
    country_name: {
      en: 'Zimbabwe',
      es: 'Zimbabwe'
    },
    country_code: 263,
    example_dial: '013 12345'
  },
  'do-1': {
    country_name: {
      en: 'Dominican Republic',
      es: 'República Dominicana'
    },
    country_code: 1849,
    example_dial: '(849) 234-5678'
  },
  'do-2': {
    country_name: {
      en: 'Dominican Republic',
      es: 'República Dominicana'
    },
    country_code: 1809,
    example_dial: '(809) 234-5678'
  },
  'do-3': {
    country_name: {
      en: 'Dominican Republic',
      es: 'República Dominicana'
    },
    country_code: 1829,
    example_dial: '(829) 234-5678'
  },
  gw: {
    country_name: {
      en: 'Guinea-Bissau',
      es: 'Guinea-Bissau'
    },
    country_code: 245,
    example_dial: '320 1234'
  },
  me: {
    country_name: {
      en: 'Montenegro',
      es: 'Montenegro'
    },
    country_code: 382,
    example_dial: '030 234 567'
  },
  ng: {
    country_name: {
      en: 'Nigeria',
      es: 'Nigeria'
    },
    country_code: 234,
    example_dial: '01 234 5678'
  },
  mf: {
    country_name: {
      en: 'Saint Martin',
      es: 'saint Martin'
    },
    country_code: 1599,
    example_dial: '0590 27-1234'
  },
  gp: {
    country_name: {
      en: 'Saint Barthelemy',
      es: 'San Bartolomé'
    },
    country_code: 590,
    example_dial: '0590 20-1234'
  },
  ss: {
    country_name: {
      en: 'South Sudan',
      es: 'Sudán del Sur'
    },
    country_code: 211,
    example_dial: ''
  },
  sx: {
    country_name: {
      en: 'Sint Maarten',
      es: 'Sint Maarten'
    },
    country_code: 1721,
    example_dial: ''
  }
};

},{}],17:[function(require,module,exports){
'use strict';

var $ = require('./zepto.js');
var backdrop = '.dropdown-backdrop';
var toggle = '[data-toggle="dropdown"]';

var wrapper = void 0;

function Dropdown(element, el) {
  wrapper = el;
  $(element).on('click.rc.dropdown', this.toggle);
}

Dropdown.prototype.toggle = function (e) {
  var $this = $(this);

  if ($this.is('.disabled, :disabled')) return;

  var $parent = getParent($this);
  var isActive = $parent.hasClass('open');

  clearMenus();

  if (!isActive) {
    if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
      // if mobile we use a backdrop because click events don't delegate
      $(document.createElement('div')).addClass('dropdown-backdrop').insertAfter($(this)).on('click', clearMenus);
    }

    var relatedTarget = { relatedTarget: this };
    $parent.trigger(e = $.Event('show.rc.dropdown', relatedTarget));

    if (e.isDefaultPrevented()) return;

    $this.trigger('focus').attr('aria-expanded', 'true');

    $parent.toggleClass('open').trigger('shown.rc.dropdown', relatedTarget);
  }

  return false;
};

Dropdown.prototype.keydown = function (e) {
  if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;

  var $this = $(this);

  e.preventDefault();
  e.stopPropagation();

  if ($this.is('.disabled, :disabled')) return;

  var $parent = getParent($this);
  var isActive = $parent.hasClass('open');

  if (!isActive && e.which != 27 || isActive && e.which == 27) {
    if (e.which == 27) $parent.find(toggle).trigger('focus');
    return $this.trigger('click');
  }

  var desc = ' li:not(.disabled):visible a';
  var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc);

  if (!$items.length) return;

  var index = $items.index(e.target);

  if (e.which == 38 && index > 0) index--; // up
  if (e.which == 40 && index < $items.length - 1) index++; // down
  if (!~index) index = 0;

  $items.eq(index).trigger('focus');
};

function clearMenus(e) {
  if (e && e.which === 3) return;
  $(backdrop).remove();
  $(toggle).each(function () {
    var $this = $(this);
    var $parent = getParent($this);
    var relatedTarget = { relatedTarget: this };

    if (!$parent.hasClass('open')) return;

    if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return;

    $parent.trigger(e = $.Event('hide.rc.dropdown', relatedTarget));

    if (e.isDefaultPrevented()) return;

    $this.attr('aria-expanded', 'false');
    $parent.removeClass('open').trigger('hidden.rc.dropdown', relatedTarget);
  });
}

function getParent($this) {
  var selector = $this.attr('data-target');

  if (!selector) {
    selector = $this.attr('href');
    selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
  }

  var $parent = selector && $(selector);

  return $parent && $parent.length ? $parent : $this.parent();
}

$(wrapper).on('click.rc.dropdown.data-api', clearMenus).on('click.rc.dropdown.data-api', '.dropdown form', function (e) {
  e.stopPropagation();
}).on('click.rc.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.rc.dropdown.data-api', toggle, Dropdown.prototype.keydown).on('keydown.rc.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown);

module.exports = Dropdown;

},{"./zepto.js":34}],18:[function(require,module,exports){
"use strict";

var events = {
  jquery: {
    auth: "auth.rc.widget",
    retry: "retry.rc.widget",
    fallback: "fallback.rc.widget",
    max_validations: "max_validations.rc.widget",
    verified: "verified.rc.widget",
    error: "error.rc.widget",
    reload: "reload.rc.widget",
    pending: "pending.rc.widget",
    shown: "shown.rc.widget",
    ready: "ready.rc.widget"
  },
  zepto: {
    auth: "widget:auth",
    retry: "widget:retry",
    fallback: "widget:fallback",
    max_validations: "widget:max_validations",
    verified: "widget:verified",
    error: "widget:error",
    reload: "widget:reload",
    pending: "widget:pending",
    shown: "widget:shown",
    ready: "widget:ready"
  }
};

module.exports = typeof jQuery !== "undefined" && jQuery !== null ? events.jquery : events.zepto;

},{}],19:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var session = require('../util/session');
var events = require('../events');
var $ = require('../zepto');

var CodeHandler = function () {
  var clearIntervalInEvents = void 0,
      handleUrlInterval = void 0,
      inlineErrors = void 0;

  var CodeHandler = function () {
    function CodeHandler(wrapper, api, i18n) {
      _classCallCheck(this, CodeHandler);

      this.wrapper = wrapper;
      this.api = api;
      this.i18n = i18n;
      if ((this.api.data.dispatchType === 'sms' || this.api.data.dispatchType === 'url_sms') && this.api.data.features.indexOf('U') >= 0) {
        handleUrlInterval = setInterval($.proxy(this.handleUrl, this), 5000);
      }
      this.wrapper.on(clearIntervalInEvents.join(' '), this.clearInterval);
    }

    /*
    Handle PIN code verification.
    */


    _createClass(CodeHandler, [{
      key: 'handle',
      value: function handle(code) {
        var _this = this;

        // Disable digits inputs.
        var digits = this.wrapper.find('.digit').trigger('blur').prop('disabled', true);
        // Trigger `verified` event.
        var doneCallback = function doneCallback() {
          return _this.wrapper.triggerHandler(events.verified);
        };
        // Show an inline error or trigger `error` event when fatal error occurs.
        var failCallback = function failCallback(error) {
          var event = void 0;
          if (error === 'invalid_pin_code') {
            return _this.showInlineError(error);
          } else if (error === 'max_validations_reached') {
            event = $.Event(events.max_validations);
            event.error = error;
            session.updateSession(_this.api.data.app, {
              expiresAt: -1
            });
            return _this.wrapper.triggerHandler(event);
          } else {
            event = $.Event(events.error);
            event.error = error;
            return _this.wrapper.triggerHandler(event);
          }
        };
        // Enable digits inputs.
        var alwaysCallback = function alwaysCallback() {
          return digits.val('').prop('disabled', false);
        };
        // Magic happends here :)
        return this.api.check(code).done(doneCallback).fail(failCallback).always(alwaysCallback);
      }

      /*
      Handle PIN code verification via URL.
      */

    }, {
      key: 'handleUrl',
      value: function handleUrl() {
        var _this2 = this;

        // Trigger `verified` event and stops interval.
        var doneCallback = function doneCallback(code) {
          return _this2.wrapper.triggerHandler(events.verified, [code]);
        };
        var failCallback = function failCallback(error) {
          if (error === 'invalid_session' || error === 'session_expired') {
            _this2.api.data.retryAt = 0;
            session.updateSession(_this2.api.data.app, {
              expiresAt: -1
            });
            var event = $.Event(events.error);
            event.error = error;
            return _this2.wrapper.triggerHandler(event);
          }
        };
        // Magic happends here :)
        return this.api.checkUrl().done(doneCallback).fail(failCallback);
      }

      /*
      Handle fallback
      */

    }, {
      key: 'handleFallback',
      value: function handleFallback() {
        var _this3 = this;

        var digits = this.wrapper.find('.digit').trigger('blur').prop('disabled', true);
        var doneCallback = function doneCallback() {
          return _this3.wrapper.triggerHandler(events.fallback);
        };
        var failCallback = function failCallback() {
          if (inlineErrors.indexOf(error) >= 0) {
            return _this3.showInlineError(error);
          } else {
            var event = $.Event(events.error);
            event.error = error;
            return _this3.wrapper.triggerHandler(event);
          }
        };
        var alwaysCallback = function alwaysCallback() {
          return digits.val('').prop('disabled', false);
        };
        return this.api.code(this.api.data.phoneNumber, 'voice').done(doneCallback).fail(failCallback).always(alwaysCallback);
      }

      /*
      */

    }, {
      key: 'clearInterval',
      value: function (_clearInterval) {
        function clearInterval() {
          return _clearInterval.apply(this, arguments);
        }

        clearInterval.toString = function () {
          return _clearInterval.toString();
        };

        return clearInterval;
      }(function () {
        return clearInterval(handleUrlInterval);
      })

      /*
      */

    }, {
      key: 'showInlineError',
      value: function showInlineError(error) {
        var _this4 = this;

        var message = this.i18n.trans('error.' + error);
        var originalText = this.i18n.trans("check.summary");
        this.wrapper.find('.help').addClass('active');
        this.wrapper.find('.pin-summary').parent('div').addClass('has-error');
        this.wrapper.find('.pin-summary').text(message);
        return this.wrapper.find('.digit').one('focus', function () {
          _this4.wrapper.find('.help').removeClass('active');
          _this4.wrapper.find('.pin-summary').parent('div').removeClass('has-error');
          return _this4.wrapper.find('.pin-summary').text(originalText);
        });
      }
    }]);

    return CodeHandler;
  }();

  ;

  inlineErrors = ['invalid_number', 'country_not_supported', 'invalid_number_length', 'max_attempts_reached'];

  clearIntervalInEvents = [events.retry, events.fallback, events.max_validations, events.verified, events.error];

  return CodeHandler;
}();

module.exports = CodeHandler;

},{"../events":18,"../util/session":32,"../zepto":34}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var session = require('../util/session');
var events = require('../events');
var $ = require('../zepto');

var NotificationHandler = function () {
  var api = void 0,
      wrapper = void 0;

  var NotificationHandler = function () {
    function NotificationHandler(el, apia) {
      _classCallCheck(this, NotificationHandler);

      wrapper = el;
      api = apia;
    }

    /*
    Reload widget.
    */


    _createClass(NotificationHandler, [{
      key: 'reload',
      value: function reload(event) {
        var doneCallback = function doneCallback() {
          return wrapper.triggerHandler(events.reload);
        };
        var failCallback = function failCallback(error) {
          event = $.Event(events.error);
          event.error = error;
          return wrapper.triggerHandler(event);
        };
        api.auth().done(doneCallback).fail(failCallback);
        return event.preventDefault();
      }
    }]);

    return NotificationHandler;
  }();

  ;

  return NotificationHandler;
}();

module.exports = NotificationHandler;

},{"../events":18,"../util/session":32,"../zepto":34}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var events = require('../events');
var $ = require('../zepto');

var PhoneHandler = function () {
  var hiddenCountry = void 0,
      inlineErrors = void 0;

  var PhoneHandler = function () {
    function PhoneHandler(wrapper, api, i18n) {
      _classCallCheck(this, PhoneHandler);

      this.wrapper = wrapper;
      this.api = api;
      this.i18n = i18n;
      hiddenCountry = wrapper.data('hide-country');
    }

    /*
    Handle PIN code.
    */


    _createClass(PhoneHandler, [{
      key: 'handle',
      value: function handle(phoneNumber, dispatchType) {
        var _this = this;

        // Disable step inputs.
        var stepElements = this.wrapper.find('.js-send-code, .phone-input, .method-input input, .country-button');
        stepElements.prop('disabled', true);
        var btn = void 0,
            oldText = void 0;
        if (this.api.mode === 'onboarding' || this.api.mode === 'distribution') {
          btn = this.wrapper.find('.js-send-code');
          oldText = btn.text();
          btn.text('Texting you...');
        }
        var doneCallback = function doneCallback() {
          if (_this.api.mode === 'onboarding' || _this.api.mode === 'distribution') {
            btn.text('Sent!');
            _this.wrapper.find('#js-inline-alert').addClass('hide');
            _this.wrapper.find('#js-inline-countdown').removeClass('hide');
            var $countdown = _this.wrapper.find('.countdown');
            var $try = _this.wrapper.find('.tryagain');
            var showLinks = function showLinks() {
              $countdown.addClass('hide');
              return $try.removeClass('hide');
            };
            if (_this.api.data.retryAt > new Date().getTime()) {
              var countdownInterval = function countdownInterval() {
                var countdownTimeout = void 0,
                    remaining = void 0,
                    value = void 0;
                remaining = Math.round((_this.api.data.retryAt - new Date().getTime()) / 1000);
                if (remaining > 0) {
                  value = _this.i18n.transChoice('check.countdown.seconds', remaining, {
                    remaining: '<strong>' + remaining + '</strong>'
                  });
                  $countdown.removeClass('hide').html(value);
                } else {
                  showLinks();
                  clearTimeout(countdownTimeout);
                }
                return countdownTimeout = setTimeout(countdownInterval, 1000);
              };
              return countdownInterval();
            } else {
              return showLinks();
            }
          } else {
            return _this.wrapper.triggerHandler($.Event(events.pending));
          }
        };
        // Show an inline error or trigger `error` event when fatal error occurs.
        var failCallback = function failCallback(error) {
          if (_this.api.mode === 'onboarding' || _this.api.mode === 'distribution') {
            btn.text(oldText);
          }
          if (inlineErrors.indexOf(error) >= 0) {
            _this.showInlineError(error);
          } else {
            var event = $.Event(events.error);
            event.error = error;
            _this.wrapper.triggerHandler(event);
          }
          return stepElements.prop('disabled', false);
        };
        // Enable step inputs.
        var alwaysCallback = function alwaysCallback() {
          if (!(_this.api.mode === 'onboarding' || _this.api.mode === 'distribution')) {
            return stepElements.prop('disabled', false);
          }
        };
        var fullPhoneNumber = hiddenCountry ? '+' + phoneNumber.phoneNumber : '+' + phoneNumber.countryCode + phoneNumber.phoneNumber;
        if (phoneNumber.phoneNumber == null || phoneNumber.phoneNumber.length < 5 || fullPhoneNumber.length > 15) {
          failCallback('invalid_number_length');
          alwaysCallback();
          return;
        }
        // Magic happends here :)
        return this.api.code(fullPhoneNumber, dispatchType, this.i18n.getLocale()).done(doneCallback).fail(failCallback).always(alwaysCallback);
      }

      /*
      Show inline error.
      */

    }, {
      key: 'showInlineError',
      value: function showInlineError(error) {
        var _this2 = this;

        var message = this.i18n.trans('error.' + error);
        this.wrapper.find('.phone-input').get(0).setSelectionRange(30, 30);
        if (this.api.mode === 'onboarding' || this.api.mode === 'distribution') {
          this.wrapper.find('#js-inline-alert').addClass('text-danger').text(message);
          return this.wrapper.find('.phone-input').one('focus', function () {
            return _this2.wrapper.find('#js-inline-alert').removeClass('text-danger').text('We\'ll text you a link to download the app');
          });
        } else {
          var originalText = this.i18n.trans("code.summary");
          this.wrapper.find('.help').addClass('active');
          var summary = this.wrapper.find('.phone-box').addClass('has-error').find('.summary').text(message);
          return this.wrapper.find('.phone-input').one('keyup', function () {
            _this2.wrapper.find('.help').removeClass('active');
            return summary = _this2.wrapper.find('.phone-box').removeClass('has-error').find('.summary').text(originalText);
          });
        }
      }
    }]);

    return PhoneHandler;
  }();

  ;

  // This errors must be displayed inline.
  inlineErrors = ['invalid_number', 'country_not_supported', 'invalid_number_length', 'max_attempts_reached'];

  return PhoneHandler;
}();

module.exports = PhoneHandler;

},{"../events":18,"../zepto":34}],22:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('./zepto');
var config = require('../config.json');
var session = require('./util/session');
var ajax = require('./util/ajax');

var I18n = function () {
  var currentLocale = void 0,
      direction = void 0,
      fallbackMessages = void 0,
      isObject = void 0,
      makePath = void 0,
      messages = void 0,
      pluralizationRule = void 0,
      sprintf = void 0;

  var I18n = function () {
    function I18n() {
      _classCallCheck(this, I18n);

      pluralizationRule = function pluralizationRule(number) {
        if (number === 1) {
          return 0;
        } else {
          return 1;
        }
      };
    }

    /*
    Load messages
    */


    _createClass(I18n, [{
      key: 'load',
      value: function load(locale) {
        locale = locale.toLowerCase();
        locale = config.locale.available.indexOf(locale) >= 0 ? locale : 'en';
        var deferred = $.Deferred();
        var hasCustomLocale = typeof RingCaptchaLocale !== "undefined" && RingCaptchaLocale !== null && RingCaptchaLocale[locale] != null;
        currentLocale = locale;
        if (hasCustomLocale) {
          if (isObject(RingCaptchaLocale[locale])) {
            messages = RingCaptchaLocale[locale];
          } else {
            var _doneCallback = function _doneCallback(response) {
              return messages = response;
            };
            var failCallback = function failCallback() {
              return hasCustomLocale = false;
            };
            var _ajaxSetup = {
              type: 'GET',
              url: RingCaptchaLocale[locale]
            };
            ajax(_ajaxSetup, _doneCallback, failCallback);
          }
        }
        var doneCallback = function doneCallback(response) {
          direction = response.direction;
          if (hasCustomLocale) {
            fallbackMessages = response.messages;
          } else {
            messages = response.messages;
          }
          return deferred.resolve();
        };
        var ajaxSetup = {
          type: 'GET',
          url: makePath(locale)
        };
        ajax(ajaxSetup, doneCallback, deferred.reject);
        return deferred.promise();
      }
    }, {
      key: 'get',
      value: function get(id) {
        if (id == null) {
          return messages;
        }
        if (messages[id] != null) {
          return messages[id];
        }
        if (messages['widget.' + id] != null) {
          return messages['widget.' + id];
        }
        return fallbackMessages[id];
      }
    }, {
      key: 'trans',
      value: function trans(id, parameters) {
        var value = this.get(id);
        if (parameters != null) {
          return sprintf(value, parameters);
        } else {
          return value;
        }
      }
    }, {
      key: 'transChoice',
      value: function transChoice(id, number, parameters) {
        var index = pluralizationRule(number);
        var value = this.get(id).split('|')[index];
        if (value == null) {
          return id;
        }
        if (parameters != null) {
          return sprintf(value, parameters);
        } else {
          return value;
        }
      }
    }, {
      key: 'getLocale',
      value: function getLocale() {
        return currentLocale;
      }
    }, {
      key: 'getDirection',
      value: function getDirection() {
        return direction;
      }
    }]);

    return I18n;
  }();

  ;

  /*
    Define private members
  */

  messages = {};
  fallbackMessages = {};
  direction = undefined;
  pluralizationRule = undefined;
  currentLocale = undefined;

  makePath = function makePath(locale) {
    return config.cdn + '/resources/locales/' + locale + '/messages.json';
  };

  sprintf = function sprintf(str, parameters) {
    return str.replace(/\%([\w]+)\%/ig, function (i, key) {
      return parameters[key] || '%' + key + '%';
    });
  };

  isObject = function isObject(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    return type === 'function' || !!value && type === 'object';
  };

  return I18n;
}();

module.exports = I18n;

},{"../config.json":1,"./util/ajax":27,"./util/session":32,"./zepto":34}],23:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('./zepto');

var Recaptcha = function () {
  var locale = void 0,
      render = void 0,
      wrapper = void 0,
      initializeRecaptcha = void 0,
      onCaptchaPassedCallback = void 0,
      siteKey = void 0;

  var Recaptcha = function () {
    function Recaptcha(ele, aLocale, aSiteKey) {
      _classCallCheck(this, Recaptcha);

      wrapper = ele;
      locale = aLocale;
      siteKey = aSiteKey;
    }

    _createClass(Recaptcha, [{
      key: 'setup',
      value: function setup(onCaptchaPassed) {
        onCaptchaPassedCallback = onCaptchaPassed;
        window.onKingAuthrRecaptchaLoaded = initializeRecaptcha;
        render();
      }
    }]);

    return Recaptcha;
  }();

  ;

  initializeRecaptcha = function initializeRecaptcha() {
    window.grecaptcha.render('king-authr-recapctha', {
      'sitekey': siteKey,
      'callback': onCaptchaPassedCallback
    });
  };

  render = function render() {
    var el = $(require('../resources/views/recaptcha.html')({
      locale: locale
    }));
    return wrapper.html(el);
  };

  return Recaptcha;
}();

module.exports = Recaptcha;

},{"../resources/views/recaptcha.html":10,"./zepto":34}],24:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('../zepto');
var CodeHandler = require('../handler/code');
var events = require('../events');
var session = require('../util/session');

var CodeStep = function () {
  var api = void 0,
      codeHandler = void 0,
      el = void 0,
      fallbackToVoice = void 0,
      i18n = void 0,
      onShown = void 0,
      onlyAllowNumbers = void 0,
      render = void 0,
      switchPinInput = void 0,
      tryAgain = void 0,
      wrapper = void 0,
      mode = void 0;

  var CodeStep = function () {
    function CodeStep(ele, i18na, apia, appMode) {
      _classCallCheck(this, CodeStep);

      wrapper = ele;
      i18n = i18na;
      api = apia;
      mode = appMode;
    }

    _createClass(CodeStep, [{
      key: 'setMode',
      value: function setMode(appMode) {
        mode = appMode;
      }

      /*
      Setup code step.
      */

    }, {
      key: 'setup',
      value: function setup() {
        wrapper.on('keypress', '.digit', onlyAllowNumbers).on('keyup', '.digit', switchPinInput).on('click', '.js-try-again', tryAgain).on('click', '.js-call-now', fallbackToVoice).on(events.shown, onShown);
        wrapper.find('.ringcaptcha.widget').addClass('overflow');
        codeHandler = new CodeHandler(wrapper, api, i18n);
        return render();
      }

      /*
      Teardown code step.
      */

    }, {
      key: 'teardown',
      value: function teardown() {
        wrapper.off('keypress', '.digit').off('keyup', '.digit').off('click', '.js-try-again').off('click', '.js-call-now').off(events.shown);
        wrapper.find('.ringcaptcha.widget').removeClass('overflow');
        return wrapper.find('.wizard').empty();
      }
    }]);

    return CodeStep;
  }();

  ;

  // Render code step.
  render = function render() {
    el = $(require('../../resources/views/verification/step/code.html')({
      i18n: i18n
    }));
    var key = api.data.dispatchType === 'sms' || api.data.dispatchType === 'url_sms' ? 'check.title.sms' : 'check.title.voice';
    el.find('.title').text(i18n.trans(key));
    el.find('.phone-number').text(api.data.phoneNumber);
    wrapper.find('[name="ringcaptcha_phone_number"]').val(api.data.phoneNumber);
    var $countdown = el.find('.countdown');
    var $try = el.find('.tryagain');
    var $tryorcall = el.find('.tryorcall');
    var showLinks = function showLinks() {
      $countdown.addClass('hide');
      if ((api.data.dispatchType === 'sms' || api.data.dispatchType === 'url_sms') && (api.data.features.indexOf('V') >= 0 && api.data.attempts >= 2 || api.data.features.indexOf('F') >= 0 && api.data.attempts >= 1)) {
        return $tryorcall.removeClass('hide');
      } else {
        return $try.removeClass('hide');
      }
    };
    if (api.data.retryAt > new Date().getTime()) {
      var countdownInterval = function countdownInterval() {
        var countdownTimeout;
        var remaining = Math.round((api.data.retryAt - new Date().getTime()) / 1000);
        if (remaining > 0) {
          var value = i18n.transChoice('check.countdown.seconds', remaining, {
            remaining: '<strong>' + remaining + '</strong>'
          });
          $countdown.removeClass('hide').html(value);
        } else {
          showLinks();
          clearTimeout(countdownTimeout);
        }
        return countdownTimeout = setTimeout(countdownInterval, 1000);
      };
      countdownInterval();
    } else {
      showLinks();
    }
    return wrapper.find('.wizard').html(el);
  };

  onlyAllowNumbers = function onlyAllowNumbers(event) {
    if (!(48 <= event.which && event.which <= 57 || event.which === 8)) {
      return event.preventDefault();
    }
  };

  onShown = function onShown() {
    return wrapper.find('.digit:first').focus();
  };

  switchPinInput = function switchPinInput(event) {
    var goBackward = false;
    var previousDigits = $(this).prevAll('.digit').get().reverse();
    $(previousDigits).each(function (i, item) {
      if (!$(this).val()) {
        $(this).focus();
        goBackward = true;
        return false;
      }
    });
    if (goBackward) {
      this.value = '';
    }
    if (api.data.features.indexOf('I') >= 0) {
      if (this.value) {
        $(this).prop('disabled', true).next('.digit').focus();
      } else if (event.which === 8) {
        $(this).prev('.digit').prop('disabled', false).select();
      }
    } else {
      if (this.value) {
        $(this).next('.digit').focus();
      } else if (event.which === 8) {
        $(this).prev('.digit').select();
      }
    }
    var getValue = function getValue() {
      return this.value;
    };
    var code = wrapper.find('.digit').map(getValue).get().join('');
    wrapper.find('[name="ringcaptcha_pin_code"]').val(code);
    if (code.length === 4 && api.data.features.indexOf('I') >= 0) {
      return codeHandler.handle(code);
    }
  };

  tryAgain = function tryAgain(event) {
    session.updateSession(api.data.app, {
      status: 'new'
    });
    wrapper.triggerHandler(events.retry);
    return event.preventDefault();
  };

  fallbackToVoice = function fallbackToVoice(event) {
    codeHandler.handleFallback();
    return event.preventDefault();
  };

  return CodeStep;
}();

module.exports = CodeStep;

},{"../../resources/views/verification/step/code.html":12,"../events":18,"../handler/code":19,"../util/session":32,"../zepto":34}],25:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('../zepto');
var NotificationHandler = require('../handler/notification');

var NotificationStep = function () {
  var mode = void 0;

  var NotificationStep = function () {
    /*
    Constructor.
    */
    function NotificationStep(wrapper, i18n, api, appMode) {
      _classCallCheck(this, NotificationStep);

      this.wrapper = wrapper;
      this.i18n = i18n;
      this.api = api;
      this.notificationHandler = new NotificationHandler(this.wrapper, this.api);
      mode = appMode;
    }

    _createClass(NotificationStep, [{
      key: 'setMode',
      value: function setMode(appMode) {
        return mode = appMode;
      }

      /*
      Setup notification step.
      */

    }, {
      key: 'setup',
      value: function setup(messageKey, isError) {
        var reload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var anchor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        this.messageKey = messageKey;
        this.isError = isError;
        this.reload = reload;
        this.anchor = anchor;
        if (this.reload) {
          this.wrapper.on('click', '.js-reload', this.notificationHandler.reload);
        }
        this.wrapper.find('#powered').hide();
        return this.render();
      }

      /*
      Render notification step.
      */

    }, {
      key: 'render',
      value: function render() {
        var _this = this;

        var onboarding_template = require("../../resources/views/onboarding/step/notification.html");
        var verification_template = require("../../resources/views/verification/step/notification.html");
        var template = mode === 'onboarding' || mode === 'distribution' ? onboarding_template : verification_template;
        var el = $(template({
          i18n: this.i18n
        }));
        el.find('h4').text(this.messageKey);
        if (this.reload) {
          el.find('.reload').removeClass('hide');
          var $countdown = el.find('.countdown');
          var $try = el.find('.tryagain');
          var showLinks = function showLinks() {
            $countdown.addClass('hide');
            return $try.removeClass('hide');
          };
          if (this.api.data.retryAt > new Date().getTime()) {
            var countdownInterval = function countdownInterval() {
              var countdownTimeout = void 0;
              var remaining = Math.round((_this.api.data.retryAt - new Date().getTime()) / 1000);
              if (remaining > 0) {
                var value = _this.i18n.transChoice('check.countdown.seconds', remaining, {
                  remaining: '<strong>' + remaining + '</strong>'
                });
                $countdown.removeClass('hide').html(value);
              } else {
                showLinks();
                clearTimeout(countdownTimeout);
              }
              return countdownTimeout = setTimeout(countdownInterval, 1000);
            };
            countdownInterval();
          } else {
            showLinks();
          }
        }
        if (this.anchor) {
          el.find('.anchor').removeClass('hide').attr('href', this.anchor[1]).text(this.anchor[0]);
        }
        return this.wrapper.find('.wizard').html(el);
      }

      /*
      Teardown notification step.
      */

    }, {
      key: 'teardown',
      value: function teardown() {
        if (this.reload) {
          this.wrapper.off('click', '.js-reload');
        }
        this.wrapper.find('#powered').show();
        return this.wrapper.find('.wizard').empty();
      }
    }]);

    return NotificationStep;
  }();

  ;

  return NotificationStep;
}();

module.exports = NotificationStep;

},{"../../resources/views/onboarding/step/notification.html":8,"../../resources/views/verification/step/notification.html":13,"../handler/notification":20,"../zepto":34}],26:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('../zepto');
var PhoneHandler = require('../handler/phone');
var Dropdown = require('../dropdown');
var events = require('../events');
var session = require('../util/session');
var arr = require('../util/arr');
var countries = require('../countries');
var Formatter = require('../../node_modules/formatter.js/dist/formatter');

var PhoneStep = function () {
  var api = void 0,
      currentCountry = void 0,
      dropdown = void 0,
      el = void 0,
      filterCountryList = void 0,
      focusin = void 0,
      focusout = void 0,
      formatted = void 0,
      getDispatchType = void 0,
      getPhoneNumber = void 0,
      hiddenCountry = void 0,
      i18n = void 0,
      mode = void 0,
      onDropdownToggle = void 0,
      onlyAllowPhoneDigits = void 0,
      phoneHandler = void 0,
      render = void 0,
      selectCountry = void 0,
      stopPropagation = void 0,
      switchSubmitButtonValue = void 0,
      tryAgain = void 0,
      widgetType = void 0,
      wrapper = void 0;

  var PhoneStep = function () {
    function PhoneStep(ele, i18na, apia, appMode) {
      _classCallCheck(this, PhoneStep);

      wrapper = ele;
      i18n = i18na;
      api = apia;
      mode = appMode;
      hiddenCountry = wrapper.data('hide-country');
      phoneHandler = new PhoneHandler(wrapper, api, i18n);
    }

    _createClass(PhoneStep, [{
      key: 'setMode',
      value: function setMode(appMode) {
        return mode = appMode;
      }

      /*
        Setup phone step.
      */

    }, {
      key: 'setup',
      value: function setup() {
        dropdown = new Dropdown('.country-list', wrapper);
        wrapper.on('click', '.js-send-code', function () {
          return phoneHandler.handle(getPhoneNumber(), getDispatchType());
        }).on('keypress', '.phone-input', onlyAllowPhoneDigits).on('keypress', '.phone-input', function (event) {
          if (event.which === 13) {
            return phoneHandler.handle(getPhoneNumber(), getDispatchType());
          }
        }).on('change', '.country-list-mobile', selectCountry).on('click', '.country-list a', selectCountry).on('change', '[name="rc[core][method]"]', switchSubmitButtonValue).on('click', '.country-search', stopPropagation).on('keyup', '.country-search-input', filterCountryList).on('focusin', '.phone-input', focusin).on('focusout', '.phone-input', focusout).on('click', '.country-button', dropdown.toggle).on('click', '.country-button', onDropdownToggle).on('click', '.js-try-again', tryAgain);
        $(document).on('keydown', '.country-button', dropdown.keydown).on('click', function () {
          return $('.country-list').parent().removeClass('open');
        });
        render();
        return wrapper.trigger(events.ready);
      }

      /*
        Teardown phone step.
      */

    }, {
      key: 'teardown',
      value: function teardown() {
        wrapper.off('click', '.js-send-code').off('keypress', '.phone-input').off('change', '.country-list-mobile').off('click', '.country-list a').off('change', '[name="rc[core][method]"]').off('click', '.country-search').off('keyup', '.country-search-input').off('focusin', '.phone-input').off('focusout', '.phone-input').off('click', '.country-button').off('click', '.js-try-again');
        return wrapper.find('.wizard').empty();
      }
    }]);

    return PhoneStep;
  }();

  ;

  render = function render() {
    var onboarding_template = require("../../resources/views/onboarding/step/phone.html");
    var verification_template = require("../../resources/views/verification/step/phone.html");
    var template = mode === 'onboarding' || mode === 'distribution' ? onboarding_template : verification_template;
    el = $(template({
      i18n: i18n,
      mode: mode
    }));
    var wOptions = api.getOptions();
    widgetType = wOptions.type != null ? wOptions.type : 'sms';
    widgetType = widgetType !== 'sms' && widgetType !== 'voice' && widgetType !== 'dual' ? 'sms' : widgetType;
    if (api.data.features.indexOf('V') < 0 && widgetType === 'voice') {
      widgetType = 'sms';
    } else if (api.data.features.indexOf('D') < 0 && widgetType === 'dual') {
      widgetType = 'sms';
    }
    if (widgetType === 'sms' || widgetType === 'voice') {
      el.find('.method-summary').text(i18n.trans('code.service.' + widgetType + '.summary'));
      el.find('.method-input').remove();
      el.find('.js-send-code').text(i18n.trans('code.service.' + widgetType + '.label'));
    }
    var co = {};
    for (var i in countries) {
      var country = countries[i];
      var countryName = void 0;
      if (country.country_name[i18n.getLocale()] != null) {
        countryName = country.country_name[i18n.getLocale()];
      } else {
        countryName = country.country_name['en'];
      }
      co[countryName] = {
        code: country.country_code,
        example: country.example_dial,
        iso: i
      };
    }
    co = arr(co);
    for (var name in co) {
      var _country = co[name];
      var iso = _country.iso.replace(/[^a-z]+/g, '');
      if (api.data.features.indexOf('C') >= 0 && api.data.supportedCountries.indexOf(iso) < 0 && api.data.supportedCountries !== '[]' && api.data.supportedCountries.length > 0) {
        continue;
      }
      var attributes = {
        'data-country-iso': iso,
        'data-country-code': _country.code,
        'data-country-name': name,
        'data-country-dial-example': _country.example
      };
      var title = void 0;
      if (i18n.getLocale() === 'ar') {
        title = name + ' ' + _country.code;
      } else {
        title = name + ' (+' + _country.code + ')';
      }
      $('<option>', attributes).text(title).appendTo(el.find('.country-list-mobile'));
      $('<li>').append($('<a>', attributes).attr('href', '#').html('<i class="flag flag-' + iso.toLowerCase() + '"></i> ' + title)).appendTo(el.find('.country-list'));
    }
    wrapper.find('.wizard').html(el);
    formatted = new Formatter(wrapper.find('.phone-input').get(0), {
      pattern: '({{999}}) {{999}}-{{9999}}'
    });
    var countrySel = wrapper.find('a[data-country-iso="' + api.data.country.toLowerCase() + '"]');
    if (countrySel.length) {
      countrySel.trigger('click');
      wrapper.find('option[data-country-iso="' + api.data.country.toLowerCase() + '"]').prop('selected', true);
    } else {
      wrapper.find("a[data-country-iso='us']").trigger('click');
      wrapper.find("option[data-country-iso='us']").prop('selected', true);
    }
    if (hiddenCountry) {
      wrapper.find(".input-group-btn").hide();
      wrapper.find('.input-group').css('display', 'block');
      wrapper.find('.phone-input').css('border-radius', '4px');
    }
    var type = api.data.widgetType === 'sms' || api.data.widgetType === 'url_sms' ? 'sms' : 'voice';
    if (mode !== 'onboarding' && mode !== 'distribution') {
      if (api.data.features.indexOf('D') >= 0) {
        wrapper.find('#method-' + type).trigger('click');
      } else {
        var submitText = i18n.trans('code.submit.' + type);
        wrapper.find('.js-send-code').text(submitText);
      }
    } else {
      var _submitText = i18n.trans("onboarding.send");
      wrapper.find('.js-send-code').text(_submitText);
    }
    if ((api.mode === 'onboarding' || api.mode === 'distribution') && api.data.status === 'pending') {
      wrapper.find('.js-send-code, .phone-input, .method-input input, .country-button').prop('disabled', true);
      wrapper.find('.js-send-code').text('Sent!');
      wrapper.find('#js-inline-alert').addClass('hide');
      wrapper.find('#js-inline-countdown').removeClass('hide');
      var $countdown = wrapper.find('.countdown');
      var $try = wrapper.find('.tryagain');
      var showLinks = function showLinks() {
        $countdown.addClass('hide');
        return $try.removeClass('hide');
      };
      if (api.data.retryAt > new Date().getTime()) {
        var countdownInterval = function countdownInterval() {
          var countdownTimeout = void 0;
          var remaining = Math.round((api.data.retryAt - new Date().getTime()) / 1000);
          if (remaining > 0) {
            var value = i18n.transChoice('check.countdown.seconds', remaining, {
              remaining: '<strong>' + remaining + '</strong>'
            });
            $countdown.removeClass('hide').html(value);
          } else {
            showLinks();
            clearTimeout(countdownTimeout);
          }
          return countdownTimeout = setTimeout(countdownInterval, 1000);
        };
        countdownInterval();
      } else {
        showLinks();
      }
    }
    var options = api.getOptions();
    var autoFocus = options.autoFocus != null ? options.autoFocus === 'yes' || options.autoFocus === 'true' : false;
    if (autoFocus) {
      return wrapper.find('.phone-input').trigger('focus');
    }
  };

  onDropdownToggle = function onDropdownToggle(event) {
    wrapper.find('.country-list li:not(.country-search)').show();
    wrapper.find('.country-search-input').val('').focus();
    return wrapper.find('.country-list').scrollTop(0);
  };

  // Add `focus` class to phone input box.
  focusin = function focusin() {
    return wrapper.find('.phone-box').addClass('focus');
  };

  // Remove `focus` class to phone input box.
  focusout = function focusout() {
    return wrapper.find('.phone-box').removeClass('focus');
  };

  // Alias for event.stopPropagation()
  stopPropagation = function stopPropagation(event) {
    return event.stopPropagation();
  };

  // Switch value of submit button.
  switchSubmitButtonValue = function switchSubmitButtonValue() {
    var value = $(this).data('submit-button-value');
    return wrapper.find('.js-send-code').text(value);
  };

  // Allow only numbers, spaces, parentheses and plus sign.
  onlyAllowPhoneDigits = function onlyAllowPhoneDigits(event) {
    var which = event.which;
    if (!(which === 32 || which === 40 || which === 41 || which === 43 || which === 8 || 48 <= which && which <= 57)) {
      return event.preventDefault();
    }
  };

  // Select country.
  selectCountry = function selectCountry(event) {
    currentCountry = event.type === 'change' ? $(this).find('option:selected').data() : $(this).data();
    var example = currentCountry.countryDialExample ? i18n.trans('code.example', {
      example: currentCountry.countryDialExample
    }) : '';
    if (currentCountry.countryIso === 'us' || currentCountry.countryIso === 'ca') {
      formatted.enable();
    } else {
      formatted.disable();
    }
    wrapper.find('.phone-input').attr('placeholder', example);
    wrapper.find('.country-button .flag').removeClass().addClass('flag flag-' + currentCountry.countryIso);
    wrapper.find('.country-button .country-code').text('+' + currentCountry.countryCode);
    if (event.type !== 'change') {
      wrapper.find('.country-list-mobile option[data-country-iso="' + currentCountry.countryIso + '"]').prop('selected', true);
    }
    return event.preventDefault();
  };

  // Filter countries by user search.
  filterCountryList = function filterCountryList(event) {
    var searchValue = this.value.toLocaleLowerCase();
    var searchValueClean = searchValue.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
    var countries = wrapper.find('.country-list li:not(.country-search)').show();
    return countries.each(function (i, item) {
      var countryIso = $(this).children('a').data('country-iso').toLowerCase();
      var countryName = $(this).children('a').data('country-name').toLocaleLowerCase();
      var countryCode = $(this).children('a').data('country-code');
      if (!(countryName.search(searchValueClean) !== -1 || countryIso === searchValue || countryCode === +searchValue || '+' + countryCode === searchValue || countryCode.toString().indexOf(searchValue) === 0)) {
        return $(this).hide();
      }
    });
  };

  // Build phone number.
  getPhoneNumber = function getPhoneNumber() {
    var phone = {
      countryCode: currentCountry.countryCode,
      phoneNumber: wrapper.find('.phone-input').val().trim().replace(/[\D]/g, '')
    };
    return phone;
  };

  tryAgain = function tryAgain(event) {
    session.updateSession(api.data.app, {
      status: 'new'
    });
    api.data.status = 'new';
    wrapper.triggerHandler(events.retry);
    return event.preventDefault();
  };

  // Get dispatch type.
  getDispatchType = function getDispatchType() {
    if (mode === 'onboarding' || mode === 'distribution') {
      return 'sms';
    } else {
      if (widgetType === 'dual') {
        return wrapper.find('.method-input input:checked').val();
      } else {
        return widgetType;
      }
    }
  };

  return PhoneStep;
}();

module.exports = PhoneStep;

},{"../../node_modules/formatter.js/dist/formatter":5,"../../resources/views/onboarding/step/phone.html":9,"../../resources/views/verification/step/phone.html":14,"../countries":16,"../dropdown":17,"../events":18,"../handler/phone":21,"../util/arr":28,"../util/session":32,"../zepto":34}],27:[function(require,module,exports){
'use strict';

var $ = require('../zepto');
var noop = $.noop();

module.exports = function (ajaxSetup) {
  var doneCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  var failCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;

  if (window.XDomainRequest) {
    var xdr = new XDomainRequest();
    xdr.open(ajaxSetup.type, ajaxSetup.url);
    xdr.onprogress = function () {};
    xdr.ontimeout = failCallback;
    xdr.onerror = failCallback;
    xdr.onload = function () {
      return doneCallback(JSON.parse(xdr.responseText));
    };
    var data = ajaxSetup.data || {};
    return setTimeout(function () {
      return xdr.send($.param(data));
    }, 0);
  } else {
    return $.ajax(ajaxSetup).done(doneCallback).fail(failCallback);
  }
};

},{"../zepto":34}],28:[function(require,module,exports){
"use strict";

module.exports = function (o) {
    var sorted = {},
        key = void 0,
        a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
};

},{}],29:[function(require,module,exports){
'use strict';

var Fingerprint = require('fingerprintjs');

var fingerprint = new Fingerprint({
  canvas: true,
  screen_resolution: true,
  ie_activex: true
});

var getFingerprint = function getFingerprint() {
  return fingerprint.get();
};

module.exports = { getFingerprint: getFingerprint };

},{"fingerprintjs":4}],30:[function(require,module,exports){
"use strict";

var geolocation = void 0;

var getGeolocation = function getGeolocation() {
  return geolocation;
};

var askGeolocation = function askGeolocation() {
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(function (position) {
      return geolocation = {
        geo_lat: position.coords.latitude,
        geo_lng: position.coords.longitude,
        geo_acurracy: position.coords.accuracy,
        geo_alt: position.coords.altitude,
        geo_alt_acurracy: position.coords.altitudeAccuracy
      };
    });
  }
};

module.exports = { askGeolocation: askGeolocation, getGeolocation: getGeolocation };

},{}],31:[function(require,module,exports){
'use strict';

module.exports = function (url, title, w, h) {
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = width / 2 - w / 2 + dualScreenLeft;
    var top = height / 2 - h / 2 + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
};

},{}],32:[function(require,module,exports){
'use strict';

var $ = require('../zepto');

var getSession = function getSession(app) {
  var session = localStorage.getItem('ringcaptcha.widget.' + app);
  if (session) {
    return JSON.parse(session);
  } else {
    return false;
  }
};

var setSession = function setSession(app, data) {
  return localStorage.setItem('ringcaptcha.widget.' + app, JSON.stringify(data));
};

var updateSession = function updateSession(app, data) {
  var session = getSession(app);
  if (!session) {
    return false;
  }
  session = $.extend(session, data);
  return setSession(app, session);
};

module.exports = { getSession: getSession, setSession: setSession, updateSession: updateSession };

},{"../zepto":34}],33:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('./zepto');
var Recaptcha = require('./recaptcha');
var PhoneStep = require('./step/phone');
var CodeStep = require('./step/code');
var NotificationStep = require('./step/notification');
var Api = require('./api');
var I18n = require('./i18n');
var events = require('./events');
var geolocation = require('./util/geolocation');
var session = require('./util/session');
var popup = require('./util/popup');

var Widget = function () {
  // Private variables
  var api = void 0,
      codeStep = void 0,
      currentStep = void 0,
      fadeStep = void 0,
      i18n = void 0,
      mode = void 0,
      notificationStep = void 0,
      onFallback = void 0,
      onFatalError = void 0,
      onFormSubmit = void 0,
      onMaxValidationsReached = void 0,
      onPhoneVerified = void 0,
      onPinCodeSent = void 0,
      onReload = void 0,
      onRetry = void 0,
      options = void 0,
      phoneStep = void 0,
      render = void 0,
      setToken = void 0,
      showHelp = void 0,
      throwError = void 0,
      userEvents = void 0,
      validateFeatures = void 0,
      wrapper = void 0,
      mainFlow = void 0;

  var Widget = function () {
    function Widget(el, key) {
      var optionsHash = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      _classCallCheck(this, Widget);

      wrapper = $(el);
      if ($.isPlainObject(key)) {
        optionsHash = key;
        key = optionsHash.app;
      }
      options = $.extend({}, wrapper.data(), optionsHash);
      if (options.events != null) {
        userEvents = options.events;
        delete options.events;
      }
      if (!(wrapper.length > 0)) {
        throw new Error('Missing container element.');
      }
      mode = options.mode || 'verification';
      api = new Api(wrapper, key, mode, options);
      i18n = new I18n();

      phoneStep = new PhoneStep(wrapper, i18n, api, mode);
      codeStep = new CodeStep(wrapper, i18n, api);
      notificationStep = new NotificationStep(wrapper, i18n, api, mode);

      var sess = session.getSession(options.app);
      var locale = options.locale || sess.locale || api.data.locale;

      if (typeof options.noRecaptcha == 'string') {
        mainFlow(locale);
      } else {
        var recaptcha = new Recaptcha(wrapper, locale, optionsHash.recaptchaSiteKey);
        recaptcha.setup(function () {
          mainFlow(locale);
        });
      }
    }

    _createClass(Widget, [{
      key: 'setup',
      value: function setup() {
        console.warn('The setup method is deprecated and will be removed in the next major version.');
        return this;
      }
    }, {
      key: 'setOptions',
      value: function setOptions(wOptions) {
        options = wOptions;
        return api.setOptions(options);
      }
    }]);

    return Widget;
  }();

  ;

  mainFlow = function mainFlow(locale) {
    var doneCallback = function doneCallback() {
      return i18n.load(locale).done(render).fail(throwError);
    };
    api.auth().done(validateFeatures, doneCallback).fail(throwError);
  };

  validateFeatures = function validateFeatures() {
    if (mode === 'onboarding' && api.data.features.indexOf('O') < 0) {
      mode = 'verification';
    }
    if (mode === 'distribution' && api.data.features.indexOf('T') < 0) {
      mode = 'verification';
    }
    if (mode === 'distribution') {
      if ((options.iosid || options.androidid) == null) {
        throw new Error('Missing app ID.');
      }
    }
    api.setMode(mode);
    notificationStep.setMode(mode);
    return phoneStep.setMode(mode);
  };

  //  Render widget.
  render = function render() {
    var displayAlways = options.displayAlways != null ? options.displayAlways === 'yes' || options.displayAlways === 'true' : true;
    if (!displayAlways && api.data.supportedCountries.length > 0 && (api.data.country, api.data.supportedCountries.indexOf(api.data.country) < 0)) {
      return;
    }

    var onboarding_template = require("../resources/views/onboarding/base.html");
    var verification_template = require("../resources/views/verification/base.html");

    var template = mode === 'onboarding' || mode === 'distribution' ? onboarding_template : verification_template;
    wrapper.html(template({
      i18n: i18n,
      support_email: api.data.supportEmail
    }));

    if (i18n.getDirection() === 'rtl') {
      wrapper.find('.ringcaptcha.widget').attr('dir', 'rtl');
    }
    if (api.data.features.indexOf('W') >= 0) {
      wrapper.find('.ringcaptcha.widget').addClass('no-brand');
      wrapper.find('.brand').remove();
      wrapper.find('#powered').remove();
    } else {
      setInterval(function () {
        return wrapper.find('.wizard').after(wrapper.find('#powered'));
      }, 200);
    }

    var status = (mode === 'onboarding' || mode === 'distribution') && api.data.status !== 'new' ? 'verified' : api.data.status;
    switch (true) {
      case status === 'new' || mode === 'onboarding' || mode === 'distribution':
        currentStep = phoneStep;
        break;
      case status === 'pending':
        currentStep = codeStep;
        wrapper.triggerHandler(events.pending);
        break;
      case status === 'verified':
        currentStep = notificationStep;
        wrapper.triggerHandler(events.verified);
    }
    currentStep.setMode(mode);

    if ((mode === 'onboarding' || mode === 'distribution') && status === 'verified') {
      currentStep.setup(i18n.trans('onboarding.success'), false, true);
    } else {
      currentStep.setup();
    }

    var geoEnabled = void 0;
    if (options.geolocation != null) {
      geoEnabled = options.geolocation;
    } else {
      geoEnabled = true;
    }
    if (api.data.features.indexOf('G') >= 0 && api.data.geolocation && geoEnabled) {
      geolocation.askGeolocation();
    }
    setToken(api.data.token);
    wrapper.on(events.error, onFatalError).on(events.pending, onPinCodeSent).on(events.auth, setToken).on(events.reload, onReload).on(events.max_validations, onMaxValidationsReached).on(events.retry, onRetry).closest('form').on('submit', onFormSubmit).end();
    if (userEvents != null) {
      if (userEvents.ready != null) {
        wrapper.on(events.ready, userEvents.ready);
      }
      if (userEvents.retry != null) {
        wrapper.on(events.retry, userEvents.retry);
      }
      if (userEvents.fallback != null) {
        wrapper.on(events.fallback, userEvents.fallback);
      }
      if (userEvents.max_validations != null) {
        wrapper.on(events.max_validations, userEvents.max_validations);
      }
      if (userEvents.verified != null) {
        wrapper.on(events.verified, userEvents.verified);
      }
      if (userEvents.error != null) {
        wrapper.on(events.error, userEvents.error);
      }
      if (userEvents.pending != null) {
        wrapper.on(events.pending, userEvents.pending);
      }
    }
    if (mode !== 'onboarding' && mode !== 'distribution') {
      wrapper.on('click', '.help', showHelp).on(events.verified, onPhoneVerified).on(events.fallback, onFallback);
    }
    return wrapper.triggerHandler(events.ready);
  };

  // Execute this method when a pin code is sent.
  onPinCodeSent = function onPinCodeSent() {
    if (!(mode === 'onboarding' || mode === 'distribution')) {
      return fadeStep(codeStep);
    }
  };

  // Execute this method when a phone is verified.
  onPhoneVerified = function onPhoneVerified(e, code) {
    if (code) {
      wrapper.find('[name="ringcaptcha_pin_code"]').val(code);
    }
    if (!(mode === 'onboarding' || mode === 'distribution')) {
      return fadeStep(notificationStep, i18n.trans('check.success'), false);
    }
  };

  // Execute this method when user fallback to voice.
  onFallback = function onFallback() {
    return fadeStep(codeStep); // Re-render step.
  };

  // Execute this method when user try again.
  onRetry = function onRetry() {
    return fadeStep(phoneStep);
  };

  // Execute this method when an fatal error occurs.
  onFatalError = function onFatalError(error) {
    var errorKey = error.error || error;
    var errorCode = errorKey.split('_').reduce(function (a, b) {
      return a + b[0];
    }, '');
    var reload = errorKey !== 'max_validations_reached' && api.data.attempts <= 3;
    var anchor = errorKey === 'out_of_credits' ? [i18n.trans('help.contact'), 'mailto:' + api.data.supportEmail + '?subject=Ref: ' + errorCode.toUpperCase()] : false;
    return fadeStep(notificationStep, i18n.trans('error.' + errorKey), true, reload, anchor);
  };

  // Execute this method when widget must be reloaded.
  onReload = function onReload() {
    return fadeStep(phoneStep);
  };

  // Execute this method when max validations is reached.
  onMaxValidationsReached = function onMaxValidationsReached() {
    return fadeStep(notificationStep, i18n.trans('error.max_validations_reached'), true, true);
  };

  // Execute this method when the parent form is submitted.
  onFormSubmit = function onFormSubmit(event) {
    if (api.data.features.indexOf('I') < 0) {
      return session.updateSession(options.app, {
        isStatusAware: true
      });
    }
  };

  // Throw an exception.
  throwError = function throwError(message) {
    return console.log(JSON.stringify(message));
  };

  // Show help modal.
  showHelp = function showHelp(event) {
    popup('https://ringcaptcha.com/widget/help/' + options.app + '/' + i18n.getLocale(), i18n.trans('help'), 600, 500);
    return event.preventDefault();
  };

  // Set the current token.
  setToken = function setToken(session) {
    return wrapper.find('[name="ringcaptcha_session_id"]').val(session.token || session);
  };

  // Make a fade effect between steps.
  fadeStep = function fadeStep(newStep) {
    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    var wizard = wrapper.find('.wizard');
    return wizard.fadeOut(function () {
      currentStep.teardown();
      newStep.setup.apply(newStep, params);
      return wizard.fadeIn(function () {
        currentStep = newStep;
        return wrapper.triggerHandler(events.shown);
      });
    });
  };

  return Widget;
}();

module.exports = Widget;

},{"../resources/views/onboarding/base.html":7,"../resources/views/verification/base.html":11,"./api":15,"./events":18,"./i18n":22,"./recaptcha":23,"./step/code":24,"./step/notification":25,"./step/phone":26,"./util/geolocation":30,"./util/popup":31,"./util/session":32,"./zepto":34}],34:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Zepto = function () {
  var undefined,
      key,
      $,
      classList,
      emptyArray = [],
      _concat = emptyArray.concat,
      _filter = emptyArray.filter,
      _slice = emptyArray.slice,
      document = window.document,
      elementDisplay = {},
      classCache = {},
      cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
      fragmentRE = /^\s*<(\w+|!)[^>]*>/,
      singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
      rootNodeRE = /^(?:body|html)$/i,
      capitalRE = /([A-Z])/g,


  // special attributes that should be get/set via method calls
  methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
      adjacencyOperators = ['after', 'prepend', 'before', 'append'],
      table = document.createElement('table'),
      tableRow = document.createElement('tr'),
      containers = {
    'tr': document.createElement('tbody'),
    'tbody': table, 'thead': table, 'tfoot': table,
    'td': tableRow, 'th': tableRow,
    '*': document.createElement('div')
  },
      readyRE = /complete|loaded|interactive/,
      simpleSelectorRE = /^[\w-]*$/,
      class2type = {},
      toString = class2type.toString,
      zepto = {},
      camelize,
      uniq,
      tempParent = document.createElement('div'),
      propMap = {
    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    'for': 'htmlFor',
    'class': 'className',
    'maxlength': 'maxLength',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'contenteditable': 'contentEditable'
  },
      isArray = Array.isArray || function (object) {
    return object instanceof Array;
  };

  zepto.matches = function (element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false;
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector;
    if (matchesSelector) return matchesSelector.call(element, selector);
    // fall back to performing a selector:
    var match,
        parent = element.parentNode,
        temp = !parent;
    if (temp) (parent = tempParent).appendChild(element);
    match = ~zepto.qsa(parent, selector).indexOf(element);
    temp && tempParent.removeChild(element);
    return match;
  };

  function type(obj) {
    return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
  }

  function isFunction(value) {
    return type(value) == "function";
  }
  function isWindow(obj) {
    return obj != null && obj == obj.window;
  }
  function isDocument(obj) {
    return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
  }
  function isObject(obj) {
    return type(obj) == "object";
  }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
  }
  function likeArray(obj) {
    return typeof obj.length == 'number';
  }

  function compact(array) {
    return _filter.call(array, function (item) {
      return item != null;
    });
  }
  function flatten(array) {
    return array.length > 0 ? $.fn.concat.apply([], array) : array;
  }
  camelize = function camelize(str) {
    return str.replace(/-+(.)?/g, function (match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  };
  function dasherize(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
  }
  uniq = function uniq(array) {
    return _filter.call(array, function (item, idx) {
      return array.indexOf(item) == idx;
    });
  };

  function classRE(name) {
    return name in classCache ? classCache[name] : classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
  }

  function maybeAddPx(name, value) {
    return typeof value == "number" && !cssNumber[dasherize(name)] ? value + "px" : value;
  }

  function defaultDisplay(nodeName) {
    var element, display;
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName);
      document.body.appendChild(element);
      display = getComputedStyle(element, '').getPropertyValue("display");
      element.parentNode.removeChild(element);
      display == "none" && (display = "block");
      elementDisplay[nodeName] = display;
    }
    return elementDisplay[nodeName];
  }

  function _children(element) {
    return 'children' in element ? _slice.call(element.children) : $.map(element.childNodes, function (node) {
      if (node.nodeType == 1) return node;
    });
  }

  function Z(dom, selector) {
    var i,
        len = dom ? dom.length : 0;
    for (i = 0; i < len; i++) {
      this[i] = dom[i];
    }this.length = len;
    this.selector = selector || '';
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function (html, name, properties) {
    var dom, nodes, container;

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1));

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
      if (!(name in containers)) name = '*';

      container = containers[name];
      container.innerHTML = '' + html;
      dom = $.each(_slice.call(container.childNodes), function () {
        container.removeChild(this);
      });
    }

    if (isPlainObject(properties)) {
      nodes = $(dom);
      $.each(properties, function (key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value);else nodes.attr(key, value);
      });
    }

    return dom;
  };

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overriden in plugins.
  zepto.Z = function (dom, selector) {
    return new Z(dom, selector);
  };

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function (object) {
    return object instanceof zepto.Z;
  };

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function (selector, context) {
    var dom;
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z();
    // Optimize for string selectors
    else if (typeof selector == 'string') {
        selector = selector.trim();
        // If it's a html fragment, create nodes from it
        // Note: In both Chrome 21 and Firefox 15, DOM error 12
        // is thrown if the fragment doesn't begin with <
        if (selector[0] == '<' && fragmentRE.test(selector)) dom = zepto.fragment(selector, RegExp.$1, context), selector = null;
        // If there's a context, create a collection on that context first, and select
        // nodes from there
        else if (context !== undefined) return $(context).find(selector);
          // If it's a CSS selector, use it to select nodes.
          else dom = zepto.qsa(document, selector);
      }
      // If a function is given, call it when the DOM is ready
      else if (isFunction(selector)) return $(document).ready(selector);
        // If a Zepto collection is given, just return it
        else if (zepto.isZ(selector)) return selector;else {
            // normalize array if an array of nodes is given
            if (isArray(selector)) dom = compact(selector);
            // Wrap DOM nodes.
            else if (isObject(selector)) dom = [selector], selector = null;
              // If it's a html fragment, create nodes from it
              else if (fragmentRE.test(selector)) dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null;
                // If there's a context, create a collection on that context first, and select
                // nodes from there
                else if (context !== undefined) return $(context).find(selector);
                  // And last but no least, if it's a CSS selector, use it to select nodes.
                  else dom = zepto.qsa(document, selector);
          }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector);
  };

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function $(selector, context) {
    return zepto.init(selector, context);
  };

  function extend(target, source, deep) {
    for (key in source) {
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key])) target[key] = {};
        if (isArray(source[key]) && !isArray(target[key])) target[key] = [];
        extend(target[key], source[key], deep);
      } else if (source[key] !== undefined) target[key] = source[key];
    }
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function (target) {
    var deep,
        args = _slice.call(arguments, 1);
    if (typeof target == 'boolean') {
      deep = target;
      target = args.shift();
    }
    args.forEach(function (arg) {
      extend(target, arg, deep);
    });
    return target;
  };

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function (element, selector) {
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
        // Ensure that a 1 char tag name still gets checked
    isSimple = simpleSelectorRE.test(nameOnly);
    return element.getElementById && isSimple && maybeID ? // Safari DocumentFragment doesn't have getElementById
    (found = element.getElementById(nameOnly)) ? [found] : [] : element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11 ? [] : _slice.call(isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
    maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
    element.getElementsByTagName(selector) : // Or a tag
    element.querySelectorAll(selector) // Or it's not simple, and we need to query all
    );
  };

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector);
  }

  $.contains = document.documentElement.contains ? function (parent, node) {
    return parent !== node && parent.contains(node);
  } : function (parent, node) {
    while (node && (node = node.parentNode)) {
      if (node === parent) return true;
    }return false;
  };

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg;
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value) {
    var klass = node.className || '',
        svg = klass && klass.baseVal !== undefined;

    if (value === undefined) return svg ? klass.baseVal : klass;
    svg ? klass.baseVal = value : node.className = value;
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ? value == "true" || (value == "false" ? false : value == "null" ? null : +value + "" == value ? +value : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
    } catch (e) {
      return value;
    }
  }

  $.type = type;
  $.isFunction = isFunction;
  $.isWindow = isWindow;
  $.isArray = isArray;
  $.isPlainObject = isPlainObject;

  $.isEmptyObject = function (obj) {
    var name;
    for (name in obj) {
      return false;
    }return true;
  };

  $.inArray = function (elem, array, i) {
    return emptyArray.indexOf.call(array, elem, i);
  };

  $.camelCase = camelize;
  $.trim = function (str) {
    return str == null ? "" : String.prototype.trim.call(str);
  };

  // plugin compatibility
  $.uuid = 0;
  $.support = {};
  $.expr = {};
  $.noop = function () {};

  $.map = function (elements, callback) {
    var value,
        values = [],
        i,
        key;
    if (likeArray(elements)) for (i = 0; i < elements.length; i++) {
      value = callback(elements[i], i);
      if (value != null) values.push(value);
    } else for (key in elements) {
      value = callback(elements[key], key);
      if (value != null) values.push(value);
    }
    return flatten(values);
  };

  $.each = function (elements, callback) {
    var i, key;
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++) {
        if (callback.call(elements[i], i, elements[i]) === false) return elements;
      }
    } else {
      for (key in elements) {
        if (callback.call(elements[key], key, elements[key]) === false) return elements;
      }
    }

    return elements;
  };

  $.grep = function (elements, callback) {
    return _filter.call(elements, callback);
  };

  if (window.JSON) $.parseJSON = JSON.parse;

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
  });

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function concat() {
      var i,
          value,
          args = [];
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i];
        args[i] = zepto.isZ(value) ? value.toArray() : value;
      }
      return _concat.apply(zepto.isZ(this) ? this.toArray() : this, args);
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function map(fn) {
      return $($.map(this, function (el, i) {
        return fn.call(el, i, el);
      }));
    },
    slice: function slice() {
      return $(_slice.apply(this, arguments));
    },

    ready: function ready(callback) {
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($);else document.addEventListener('DOMContentLoaded', function () {
        callback($);
      }, false);
      return this;
    },
    get: function get(idx) {
      return idx === undefined ? _slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
    },
    toArray: function toArray() {
      return this.get();
    },
    size: function size() {
      return this.length;
    },
    remove: function remove() {
      return this.each(function () {
        if (this.parentNode != null) this.parentNode.removeChild(this);
      });
    },
    each: function each(callback) {
      emptyArray.every.call(this, function (el, idx) {
        return callback.call(el, idx, el) !== false;
      });
      return this;
    },
    filter: function filter(selector) {
      if (isFunction(selector)) return this.not(this.not(selector));
      return $(_filter.call(this, function (element) {
        return zepto.matches(element, selector);
      }));
    },
    end: function end() {
      return this.prevObject || $();
    },
    add: function add(selector, context) {
      return $(uniq(this.concat($(selector, context))));
    },
    is: function is(selector) {
      return this.length > 0 && zepto.matches(this[0], selector);
    },
    not: function not(selector) {
      var nodes = [];
      if (isFunction(selector) && selector.call !== undefined) this.each(function (idx) {
        if (!selector.call(this, idx)) nodes.push(this);
      });else {
        var excludes = typeof selector == 'string' ? this.filter(selector) : likeArray(selector) && isFunction(selector.item) ? _slice.call(selector) : $(selector);
        this.forEach(function (el) {
          if (excludes.indexOf(el) < 0) nodes.push(el);
        });
      }
      return $(nodes);
    },
    has: function has(selector) {
      return this.filter(function () {
        return isObject(selector) ? $.contains(this, selector) : $(this).find(selector).size();
      });
    },
    eq: function eq(idx) {
      return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
    },
    first: function first() {
      var el = this[0];
      return el && !isObject(el) ? el : $(el);
    },
    last: function last() {
      var el = this[this.length - 1];
      return el && !isObject(el) ? el : $(el);
    },
    find: function find(selector) {
      var result,
          $this = this;
      if (!selector) result = $();else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) == 'object') result = $(selector).filter(function () {
        var node = this;
        return emptyArray.some.call($this, function (parent) {
          return $.contains(parent, node);
        });
      });else if (this.length == 1) result = $(zepto.qsa(this[0], selector));else result = this.map(function () {
        return zepto.qsa(this, selector);
      });
      return result;
    },
    closest: function closest(selector, context) {
      var node = this[0],
          collection = false;
      if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) == 'object') collection = $(selector);
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector))) {
        node = node !== context && !isDocument(node) && node.parentNode;
      }return $(node);
    },
    parents: function parents(selector) {
      var ancestors = [],
          nodes = this;
      while (nodes.length > 0) {
        nodes = $.map(nodes, function (node) {
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node);
            return node;
          }
        });
      }return filtered(ancestors, selector);
    },
    parent: function parent(selector) {
      return filtered(uniq(this.pluck('parentNode')), selector);
    },
    children: function children(selector) {
      return filtered(this.map(function () {
        return _children(this);
      }), selector);
    },
    contents: function contents() {
      return this.map(function () {
        return this.contentDocument || _slice.call(this.childNodes);
      });
    },
    siblings: function siblings(selector) {
      return filtered(this.map(function (i, el) {
        return _filter.call(_children(el.parentNode), function (child) {
          return child !== el;
        });
      }), selector);
    },
    empty: function empty() {
      return this.each(function () {
        this.innerHTML = '';
      });
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function pluck(property) {
      return $.map(this, function (el) {
        return el[property];
      });
    },
    show: function show() {
      return this.each(function () {
        this.style.display == "none" && (this.style.display = '');
        if (getComputedStyle(this, '').getPropertyValue("display") == "none") this.style.display = defaultDisplay(this.nodeName);
      });
    },
    replaceWith: function replaceWith(newContent) {
      return this.before(newContent).remove();
    },
    wrap: function wrap(structure) {
      var func = isFunction(structure);
      if (this[0] && !func) var dom = $(structure).get(0),
          clone = dom.parentNode || this.length > 1;

      return this.each(function (index) {
        $(this).wrapAll(func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom);
      });
    },
    wrapAll: function wrapAll(structure) {
      if (this[0]) {
        $(this[0]).before(structure = $(structure));
        var children;
        // drill down to the inmost element
        while ((children = structure.children()).length) {
          structure = children.first();
        }$(structure).append(this);
      }
      return this;
    },
    wrapInner: function wrapInner(structure) {
      var func = isFunction(structure);
      return this.each(function (index) {
        var self = $(this),
            contents = self.contents(),
            dom = func ? structure.call(this, index) : structure;
        contents.length ? contents.wrapAll(dom) : self.append(dom);
      });
    },
    unwrap: function unwrap() {
      this.parent().each(function () {
        $(this).replaceWith($(this).children());
      });
      return this;
    },
    clone: function clone() {
      return this.map(function () {
        return this.cloneNode(true);
      });
    },
    hide: function hide() {
      return this.css("display", "none");
    },
    toggle: function toggle(setting) {
      return this.each(function () {
        var el = $(this);(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide();
      });
    },
    prev: function prev(selector) {
      return $(this.pluck('previousElementSibling')).filter(selector || '*');
    },
    next: function next(selector) {
      return $(this.pluck('nextElementSibling')).filter(selector || '*');
    },
    html: function html(_html) {
      return 0 in arguments ? this.each(function (idx) {
        var originHtml = this.innerHTML;
        $(this).empty().append(funcArg(this, _html, idx, originHtml));
      }) : 0 in this ? this[0].innerHTML : null;
    },
    text: function text(_text) {
      return 0 in arguments ? this.each(function (idx) {
        var newText = funcArg(this, _text, idx, this.textContent);
        this.textContent = newText == null ? '' : '' + newText;
      }) : 0 in this ? this[0].textContent : null;
    },
    attr: function attr(name, value) {
      var result;
      return typeof name == 'string' && !(1 in arguments) ? !this.length || this[0].nodeType !== 1 ? undefined : !(result = this[0].getAttribute(name)) && name in this[0] ? this[0][name] : result : this.each(function (idx) {
        if (this.nodeType !== 1) return;
        if (isObject(name)) for (key in name) {
          setAttribute(this, key, name[key]);
        } else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
      });
    },
    removeAttr: function removeAttr(name) {
      return this.each(function () {
        this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
          setAttribute(this, attribute);
        }, this);
      });
    },
    prop: function prop(name, value) {
      name = propMap[name] || name;
      return 1 in arguments ? this.each(function (idx) {
        this[name] = funcArg(this, value, idx, this[name]);
      }) : this[0] && this[0][name];
    },
    data: function data(name, value) {
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();

      var data = 1 in arguments ? this.attr(attrName, value) : this.attr(attrName);

      return data !== null ? deserializeValue(data) : undefined;
    },
    val: function val(value) {
      return 0 in arguments ? this.each(function (idx) {
        this.value = funcArg(this, value, idx, this.value);
      }) : this[0] && (this[0].multiple ? $(this[0]).find('option').filter(function () {
        return this.selected;
      }).pluck('value') : this[0].value);
    },
    offset: function offset(coordinates) {
      if (coordinates) return this.each(function (index) {
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
          top: coords.top - parentOffset.top,
          left: coords.left - parentOffset.left
        };

        if ($this.css('position') == 'static') props['position'] = 'relative';
        $this.css(props);
      });
      if (!this.length) return null;
      if (!$.contains(document.documentElement, this[0])) return { top: 0, left: 0 };
      var obj = this[0].getBoundingClientRect();
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      };
    },
    css: function css(property, value) {
      if (arguments.length < 2) {
        var computedStyle,
            element = this[0];
        if (!element) return;
        computedStyle = getComputedStyle(element, '');
        if (typeof property == 'string') return element.style[camelize(property)] || computedStyle.getPropertyValue(property);else if (isArray(property)) {
          var props = {};
          $.each(property, function (_, prop) {
            props[prop] = element.style[camelize(prop)] || computedStyle.getPropertyValue(prop);
          });
          return props;
        }
      }

      var css = '';
      if (type(property) == 'string') {
        if (!value && value !== 0) this.each(function () {
          this.style.removeProperty(dasherize(property));
        });else css = dasherize(property) + ":" + maybeAddPx(property, value);
      } else {
        for (key in property) {
          if (!property[key] && property[key] !== 0) this.each(function () {
            this.style.removeProperty(dasherize(key));
          });else css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
        }
      }

      return this.each(function () {
        this.style.cssText += ';' + css;
      });
    },
    index: function index(element) {
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
    },
    hasClass: function hasClass(name) {
      if (!name) return false;
      return emptyArray.some.call(this, function (el) {
        return this.test(className(el));
      }, classRE(name));
    },
    addClass: function addClass(name) {
      if (!name) return this;
      return this.each(function (idx) {
        if (!('className' in this)) return;
        classList = [];
        var cls = className(this),
            newName = funcArg(this, name, idx, cls);
        newName.split(/\s+/g).forEach(function (klass) {
          if (!$(this).hasClass(klass)) classList.push(klass);
        }, this);
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "));
      });
    },
    removeClass: function removeClass(name) {
      return this.each(function (idx) {
        if (!('className' in this)) return;
        if (name === undefined) return className(this, '');
        classList = className(this);
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
          classList = classList.replace(classRE(klass), " ");
        });
        className(this, classList.trim());
      });
    },
    toggleClass: function toggleClass(name, when) {
      if (!name) return this;
      return this.each(function (idx) {
        var $this = $(this),
            names = funcArg(this, name, idx, className(this));
        names.split(/\s+/g).forEach(function (klass) {
          (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass);
        });
      });
    },
    scrollTop: function scrollTop(value) {
      if (!this.length) return;
      var hasScrollTop = 'scrollTop' in this[0];
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
      return this.each(hasScrollTop ? function () {
        this.scrollTop = value;
      } : function () {
        this.scrollTo(this.scrollX, value);
      });
    },
    scrollLeft: function scrollLeft(value) {
      if (!this.length) return;
      var hasScrollLeft = 'scrollLeft' in this[0];
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
      return this.each(hasScrollLeft ? function () {
        this.scrollLeft = value;
      } : function () {
        this.scrollTo(value, this.scrollY);
      });
    },
    position: function position() {
      if (!this.length) return;

      var elem = this[0],

      // Get *real* offsetParent
      offsetParent = this.offsetParent(),

      // Get correct offsets
      offset = this.offset(),
          parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top -= parseFloat($(elem).css('margin-top')) || 0;
      offset.left -= parseFloat($(elem).css('margin-left')) || 0;

      // Add offsetParent borders
      parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
      parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

      // Subtract the two offsets
      return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left
      };
    },
    offsetParent: function offsetParent() {
      return this.map(function () {
        var parent = this.offsetParent || document.body;
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static") {
          parent = parent.offsetParent;
        }return parent;
      });
    }

    // for now
  };$.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function (dimension) {
    var dimensionProperty = dimension.replace(/./, function (m) {
      return m[0].toUpperCase();
    });

    $.fn[dimension] = function (value) {
      var offset,
          el = this[0];
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] : isDocument(el) ? el.documentElement['scroll' + dimensionProperty] : (offset = this.offset()) && offset[dimension];else return this.each(function (idx) {
        el = $(this);
        el.css(dimension, funcArg(this, value, idx, el[dimension]()));
      });
    };
  });

  function traverseNode(node, fun) {
    fun(node);
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
      traverseNode(node.childNodes[i], fun);
    }
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function (operator, operatorIndex) {
    var inside = operatorIndex % 2; //=> prepend, append

    $.fn[operator] = function () {
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType,
          nodes = $.map(arguments, function (arg) {
        argType = type(arg);
        return argType == "object" || argType == "array" || arg == null ? arg : zepto.fragment(arg);
      }),
          parent,
          copyByClone = this.length > 1;
      if (nodes.length < 1) return this;

      return this.each(function (_, target) {
        parent = inside ? target : target.parentNode;

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling : operatorIndex == 1 ? target.firstChild : operatorIndex == 2 ? target : null;

        var parentInDocument = $.contains(document.documentElement, parent);

        nodes.forEach(function (node) {
          if (copyByClone) node = node.cloneNode(true);else if (!parent) return $(node).remove();

          parent.insertBefore(node, target);
          if (parentInDocument) traverseNode(node, function (el) {
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src) window['eval'].call(window, el.innerHTML);
          });
        });
      });
    };

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
      $(html)[operator](this);
      return this;
    };
  });

  zepto.Z.prototype = Z.prototype = $.fn;

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq;
  zepto.deserializeValue = deserializeValue;
  $.zepto = zepto;

  return $;
}()

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($) {
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a');

  originAnchor.href = window.location.href;

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName);
    $(context).trigger(event, data);
    return !event.isDefaultPrevented();
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data);
  }

  // Number of active Ajax requests
  $.active = 0;

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart');
  }
  function ajaxStop(settings) {
    if (settings.global && ! --$.active) triggerGlobal(settings, null, 'ajaxStop');
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context;
    if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) return false;

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings]);
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context,
        status = 'success';
    settings.success.call(context, data, status, xhr);
    if (deferred) deferred.resolveWith(context, [data, status, xhr]);
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
    ajaxComplete(status, xhr, settings);
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context;
    settings.error.call(context, xhr, type, error);
    if (deferred) deferred.rejectWith(context, [xhr, type, error]);
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type]);
    ajaxComplete(type, xhr, settings);
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context;
    settings.complete.call(context, xhr, status);
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
    ajaxStop(settings);
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function (options, deferred) {
    if (!('type' in options)) return $.ajax(options);

    var _callbackName = options.jsonpCallback,
        callbackName = ($.isFunction(_callbackName) ? _callbackName() : _callbackName) || 'jsonp' + ++jsonpID,
        script = document.createElement('script'),
        originalCallback = window[callbackName],
        responseData,
        abort = function abort(errorType) {
      $(script).triggerHandler('error', errorType || 'abort');
    },
        xhr = { abort: abort },
        abortTimeout;

    if (deferred) deferred.promise(xhr);

    $(script).on('load error', function (e, errorType) {
      clearTimeout(abortTimeout);
      $(script).off().remove();

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred);
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred);
      }

      window[callbackName] = originalCallback;
      if (responseData && $.isFunction(originalCallback)) originalCallback(responseData[0]);

      originalCallback = responseData = undefined;
    });

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort');
      return xhr;
    }

    window[callbackName] = function () {
      responseData = arguments;
    };

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName);
    document.head.appendChild(script);

    if (options.timeout > 0) abortTimeout = setTimeout(function () {
      abort('timeout');
    }, options.timeout);

    return xhr;
  };

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function xhr() {
      return new window.XMLHttpRequest();
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json: jsonType,
      xml: 'application/xml, text/xml',
      html: htmlType,
      text: 'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  };

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0];
    return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text';
  }

  function appendQuery(url, query) {
    if (query == '') return url;
    return (url + '&' + query).replace(/[&?]{1,2}/, '?');
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string") options.data = $.param(options.data, options.traditional);
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) options.url = appendQuery(options.url, options.data), options.data = undefined;
  }

  $.ajax = function (options) {
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor,
        hashIndex;
    for (key in $.ajaxSettings) {
      if (settings[key] === undefined) settings[key] = $.ajaxSettings[key];
    }ajaxStart(settings);

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a');
      urlAnchor.href = settings.url;
      // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
      urlAnchor.href = urlAnchor.href;
      settings.crossDomain = originAnchor.protocol + '//' + originAnchor.host !== urlAnchor.protocol + '//' + urlAnchor.host;
    }

    if (!settings.url) settings.url = window.location.toString();
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex);
    serializeData(settings);

    var dataType = settings.dataType,
        hasPlaceholder = /\?.+=\?/.test(settings.url);
    if (hasPlaceholder) dataType = 'jsonp';

    if (settings.cache === false || (!options || options.cache !== true) && ('script' == dataType || 'jsonp' == dataType)) settings.url = appendQuery(settings.url, '_=' + Date.now());

    if ('jsonp' == dataType) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, settings.jsonp ? settings.jsonp + '=?' : settings.jsonp === false ? '' : 'callback=?');
      return $.ajaxJSONP(settings, deferred);
    }

    var mime = settings.accepts[dataType],
        headers = {},
        setHeader = function setHeader(name, value) {
      headers[name.toLowerCase()] = [name, value];
    },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout;

    if (deferred) deferred.promise(xhr);

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest');
    setHeader('Accept', mime || '*/*');
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
      xhr.overrideMimeType && xhr.overrideMimeType(mime);
    }
    if (settings.contentType || settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET') setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');

    if (settings.headers) for (name in settings.headers) {
      setHeader(name, settings.headers[name]);
    }xhr.setRequestHeader = setHeader;

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty;
        clearTimeout(abortTimeout);
        var result,
            error = false;
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304 || xhr.status == 0 && protocol == 'file:') {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
          result = xhr.responseText;

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script') (1, eval)(result);else if (dataType == 'xml') result = xhr.responseXML;else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result);
          } catch (e) {
            error = e;
          }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred);else ajaxSuccess(result, xhr, settings, deferred);
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred);
        }
      }
    };

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort();
      ajaxError(null, 'abort', xhr, settings, deferred);
      return xhr;
    }

    if (settings.xhrFields) for (name in settings.xhrFields) {
      xhr[name] = settings.xhrFields[name];
    }var async = 'async' in settings ? settings.async : true;
    xhr.open(settings.type, settings.url, async, settings.username, settings.password);

    for (name in headers) {
      nativeSetHeader.apply(xhr, headers[name]);
    }if (settings.timeout > 0) abortTimeout = setTimeout(function () {
      xhr.onreadystatechange = empty;
      xhr.abort();
      ajaxError(null, 'timeout', xhr, settings, deferred);
    }, settings.timeout);

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null);
    return xhr;
  };

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined;
    if (!$.isFunction(success)) dataType = success, success = undefined;
    return {
      url: url,
      data: data,
      success: success,
      dataType: dataType
    };
  }

  $.get = function () /* url, data, success, dataType */{
    return $.ajax(parseArguments.apply(null, arguments));
  };

  $.post = function () /* url, data, success, dataType */{
    var options = parseArguments.apply(null, arguments);
    options.type = 'POST';
    return $.ajax(options);
  };

  $.getJSON = function () /* url, data, success */{
    var options = parseArguments.apply(null, arguments);
    options.dataType = 'json';
    return $.ajax(options);
  };

  $.fn.load = function (url, data, success) {
    if (!this.length) return this;
    var self = this,
        parts = url.split(/\s/),
        selector,
        options = parseArguments(url, data, success),
        callback = options.success;
    if (parts.length > 1) options.url = parts[0], selector = parts[1];
    options.success = function (response) {
      self.html(selector ? $('<div>').html(response.replace(rscript, "")).find(selector) : response);
      callback && callback.apply(self, arguments);
    };
    $.ajax(options);
    return this;
  };

  var escape = encodeURIComponent;

  function serialize(params, obj, traditional, scope) {
    var type,
        array = $.isArray(obj),
        hash = $.isPlainObject(obj);
    $.each(obj, function (key, value) {
      type = $.type(value);
      if (scope) key = traditional ? scope : scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']';
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value);
      // recurse into nested objects
      else if (type == "array" || !traditional && type == "object") serialize(params, value, traditional, key);else params.add(key, value);
    });
  }

  $.param = function (obj, traditional) {
    var params = [];
    params.add = function (key, value) {
      if ($.isFunction(value)) value = value();
      if (value == null) value = "";
      this.push(escape(key) + '=' + escape(value));
    };
    serialize(params, obj, traditional);
    return params.join('&').replace(/%20/g, '+');
  };
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($) {
  // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
  // Option flags:
  //   - once: Callbacks fired at most one time.
  //   - memory: Remember the most recent context and arguments
  //   - stopOnFalse: Cease iterating over callback list
  //   - unique: Permit adding at most one instance of the same callback
  $.Callbacks = function (options) {
    options = $.extend({}, options);

    var memory,
        // Last fire value (for non-forgettable lists)
    _fired,
        // Flag to know if list was already fired
    firing,
        // Flag to know if list is currently firing
    firingStart,
        // First callback to fire (used internally by add and fireWith)
    firingLength,
        // End of the loop when firing
    firingIndex,
        // Index of currently firing callback (modified by remove if needed)
    list = [],
        // Actual callback list
    stack = !options.once && [],
        // Stack of fire calls for repeatable lists
    fire = function fire(data) {
      memory = options.memory && data;
      _fired = true;
      firingIndex = firingStart || 0;
      firingStart = 0;
      firingLength = list.length;
      firing = true;
      for (; list && firingIndex < firingLength; ++firingIndex) {
        if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
          memory = false;
          break;
        }
      }
      firing = false;
      if (list) {
        if (stack) stack.length && fire(stack.shift());else if (memory) list.length = 0;else Callbacks.disable();
      }
    },
        Callbacks = {
      add: function add() {
        if (list) {
          var start = list.length,
              add = function add(args) {
            $.each(args, function (_, arg) {
              if (typeof arg === "function") {
                if (!options.unique || !Callbacks.has(arg)) list.push(arg);
              } else if (arg && arg.length && typeof arg !== 'string') add(arg);
            });
          };
          add(arguments);
          if (firing) firingLength = list.length;else if (memory) {
            firingStart = start;
            fire(memory);
          }
        }
        return this;
      },
      remove: function remove() {
        if (list) {
          $.each(arguments, function (_, arg) {
            var index;
            while ((index = $.inArray(arg, list, index)) > -1) {
              list.splice(index, 1);
              // Handle firing indexes
              if (firing) {
                if (index <= firingLength) --firingLength;
                if (index <= firingIndex) --firingIndex;
              }
            }
          });
        }
        return this;
      },
      has: function has(fn) {
        return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length));
      },
      empty: function empty() {
        firingLength = list.length = 0;
        return this;
      },
      disable: function disable() {
        list = stack = memory = undefined;
        return this;
      },
      disabled: function disabled() {
        return !list;
      },
      lock: function lock() {
        stack = undefined;
        if (!memory) Callbacks.disable();
        return this;
      },
      locked: function locked() {
        return !stack;
      },
      fireWith: function fireWith(context, args) {
        if (list && (!_fired || stack)) {
          args = args || [];
          args = [context, args.slice ? args.slice() : args];
          if (firing) stack.push(args);else fire(args);
        }
        return this;
      },
      fire: function fire() {
        return Callbacks.fireWith(this, arguments);
      },
      fired: function fired() {
        return !!_fired;
      }
    };

    return Callbacks;
  };
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;(function ($) {
  var data = {},
      dataAttr = $.fn.data,
      camelize = $.camelCase,
      exp = $.expando = 'Zepto' + +new Date(),
      emptyArray = [];

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp],
        store = id && data[id];
    if (name === undefined) return store || setData(node);else {
      if (store) {
        if (name in store) return store[name];
        var camelName = camelize(name);
        if (camelName in store) return store[camelName];
      }
      return dataAttr.call($(node), name);
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
        store = data[id] || (data[id] = attributeData(node));
    if (name !== undefined) store[camelize(name)] = value;
    return store;
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {};
    $.each(node.attributes || emptyArray, function (i, attr) {
      if (attr.name.indexOf('data-') == 0) store[camelize(attr.name.replace('data-', ''))] = $.zepto.deserializeValue(attr.value);
    });
    return store;
  }

  $.fn.data = function (name, value) {
    return value === undefined ?
    // set multiple values via object
    $.isPlainObject(name) ? this.each(function (i, node) {
      $.each(name, function (key, value) {
        setData(node, key, value);
      });
    }) :
    // get value from first element
    0 in this ? getData(this[0], name) : undefined :
    // set value on all elements
    this.each(function () {
      setData(this, name, value);
    });
  };

  $.fn.removeData = function (names) {
    if (typeof names == 'string') names = names.split(/\s+/);
    return this.each(function () {
      var id = this[exp],
          store = id && data[id];
      if (store) $.each(names || store, function (key) {
        delete store[names ? camelize(this) : key];
      });
    });
  }

  // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function (methodName) {
    var origFn = $.fn[methodName];
    $.fn[methodName] = function () {
      var elements = this.find('*');
      if (methodName === 'remove') elements = elements.add(this);
      elements.removeData();
      return origFn.call(this);
    };
  });
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
//
//     Some code (c) 2005, 2013 jQuery Foundation, Inc. and other contributors

;(function ($) {
  var slice = Array.prototype.slice;

  function Deferred(func) {
    var tuples = [
    // action, add listener, listener list, final state
    ["resolve", "done", $.Callbacks({ once: 1, memory: 1 }), "resolved"], ["reject", "fail", $.Callbacks({ once: 1, memory: 1 }), "rejected"], ["notify", "progress", $.Callbacks({ memory: 1 })]],
        _state = "pending",
        _promise = {
      state: function state() {
        return _state;
      },
      always: function always() {
        deferred.done(arguments).fail(arguments);
        return this;
      },
      then: function then() /* fnDone [, fnFailed [, fnProgress]] */{
        var fns = arguments;
        return Deferred(function (defer) {
          $.each(tuples, function (i, tuple) {
            var fn = $.isFunction(fns[i]) && fns[i];
            deferred[tuple[1]](function () {
              var returned = fn && fn.apply(this, arguments);
              if (returned && $.isFunction(returned.promise)) {
                returned.promise().done(defer.resolve).fail(defer.reject).progress(defer.notify);
              } else {
                var context = this === _promise ? defer.promise() : this,
                    values = fn ? [returned] : arguments;
                defer[tuple[0] + "With"](context, values);
              }
            });
          });
          fns = null;
        }).promise();
      },

      promise: function promise(obj) {
        return obj != null ? $.extend(obj, _promise) : _promise;
      }
    },
        deferred = {};

    $.each(tuples, function (i, tuple) {
      var list = tuple[2],
          stateString = tuple[3];

      _promise[tuple[1]] = list.add;

      if (stateString) {
        list.add(function () {
          _state = stateString;
        }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
      }

      deferred[tuple[0]] = function () {
        deferred[tuple[0] + "With"](this === deferred ? _promise : this, arguments);
        return this;
      };
      deferred[tuple[0] + "With"] = list.fireWith;
    });

    _promise.promise(deferred);
    if (func) func.call(deferred, deferred);
    return deferred;
  }

  $.when = function (sub) {
    var resolveValues = slice.call(arguments),
        len = resolveValues.length,
        i = 0,
        remain = len !== 1 || sub && $.isFunction(sub.promise) ? len : 0,
        deferred = remain === 1 ? sub : Deferred(),
        progressValues,
        progressContexts,
        resolveContexts,
        updateFn = function updateFn(i, ctx, val) {
      return function (value) {
        ctx[i] = this;
        val[i] = arguments.length > 1 ? slice.call(arguments) : value;
        if (val === progressValues) {
          deferred.notifyWith(ctx, val);
        } else if (! --remain) {
          deferred.resolveWith(ctx, val);
        }
      };
    };

    if (len > 1) {
      progressValues = new Array(len);
      progressContexts = new Array(len);
      resolveContexts = new Array(len);
      for (; i < len; ++i) {
        if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
          resolveValues[i].promise().done(updateFn(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFn(i, progressContexts, progressValues));
        } else {
          --remain;
        }
      }
    }
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues);
    return deferred.promise();
  };

  $.Deferred = Deferred;
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($) {
  var _zid = 1,
      undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function isString(obj) {
    return typeof obj == 'string';
  },
      handlers = {},
      specialEvents = {},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' };

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

  function zid(element) {
    return element._zid || (element._zid = _zid++);
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event);
    if (event.ns) var matcher = matcherFor(event.ns);
    return (handlers[zid(element)] || []).filter(function (handler) {
      return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel == selector);
    });
  }
  function parse(event) {
    var parts = ('' + event).split('.');
    return { e: parts[0], ns: parts.slice(1).sort().join(' ') };
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }

  function eventCapture(handler, captureSetting) {
    return handler.del && !focusinSupported && handler.e in focus || !!captureSetting;
  }

  function realEvent(type) {
    return hover[type] || focusinSupported && focus[type] || type;
  }

  function add(element, events, fn, data, selector, delegator, capture) {
    var id = zid(element),
        set = handlers[id] || (handlers[id] = []);
    events.split(/\s/).forEach(function (event) {
      if (event == 'ready') return $(document).ready(fn);
      var handler = parse(event);
      handler.fn = fn;
      handler.sel = selector;
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function fn(e) {
        var related = e.relatedTarget;
        if (!related || related !== this && !$.contains(this, related)) return handler.fn.apply(this, arguments);
      };
      handler.del = delegator;
      var callback = delegator || fn;
      handler.proxy = function (e) {
        e = compatible(e);
        if (e.isImmediatePropagationStopped()) return;
        e.data = data;
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
        if (result === false) e.preventDefault(), e.stopPropagation();
        return result;
      };
      handler.i = set.length;
      set.push(handler);
      if ('addEventListener' in element) element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
    });
  }
  function remove(element, events, fn, selector, capture) {
    var id = zid(element);(events || '').split(/\s/).forEach(function (event) {
      findHandlers(element, event, fn, selector).forEach(function (handler) {
        delete handlers[id][handler.i];
        if ('removeEventListener' in element) element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
      });
    });
  }

  $.event = { add: add, remove: remove };

  $.proxy = function (fn, context) {
    var args = 2 in arguments && slice.call(arguments, 2);
    if (isFunction(fn)) {
      var proxyFn = function proxyFn() {
        return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
      };
      proxyFn._zid = zid(fn);
      return proxyFn;
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn);
        return $.proxy.apply(null, args);
      } else {
        return $.proxy(fn[context], fn);
      }
    } else {
      throw new TypeError("expected function");
    }
  };

  $.fn.bind = function (event, data, callback) {
    return this.on(event, data, callback);
  };
  $.fn.unbind = function (event, callback) {
    return this.off(event, callback);
  };
  $.fn.one = function (event, selector, data, callback) {
    return this.on(event, selector, data, callback, 1);
  };

  var returnTrue = function returnTrue() {
    return true;
  },
      returnFalse = function returnFalse() {
    return false;
  },
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
    preventDefault: 'isDefaultPrevented',
    stopImmediatePropagation: 'isImmediatePropagationStopped',
    stopPropagation: 'isPropagationStopped'
  };

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event);

      $.each(eventMethods, function (name, predicate) {
        var sourceMethod = source[name];
        event[name] = function () {
          this[predicate] = returnTrue;
          return sourceMethod && sourceMethod.apply(source, arguments);
        };
        event[predicate] = returnFalse;
      });

      if (source.defaultPrevented !== undefined ? source.defaultPrevented : 'returnValue' in source ? source.returnValue === false : source.getPreventDefault && source.getPreventDefault()) event.isDefaultPrevented = returnTrue;
    }
    return event;
  }

  function createProxy(event) {
    var key,
        proxy = { originalEvent: event };
    for (key in event) {
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];
    }return compatible(proxy, event);
  }

  $.fn.delegate = function (selector, event, callback) {
    return this.on(event, selector, callback);
  };
  $.fn.undelegate = function (selector, event, callback) {
    return this.off(event, selector, callback);
  };

  $.fn.live = function (event, callback) {
    $(document.body).delegate(this.selector, event, callback);
    return this;
  };
  $.fn.die = function (event, callback) {
    $(document.body).undelegate(this.selector, event, callback);
    return this;
  };

  $.fn.on = function (event, selector, data, callback, one) {
    var autoRemove,
        delegator,
        $this = this;
    if (event && !isString(event)) {
      $.each(event, function (type, fn) {
        $this.on(type, selector, data, fn, one);
      });
      return $this;
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false) callback = data, data = selector, selector = undefined;
    if (callback === undefined || data === false) callback = data, data = undefined;

    if (callback === false) callback = returnFalse;

    return $this.each(function (_, element) {
      if (one) autoRemove = function autoRemove(e) {
        remove(element, e.type, callback);
        return callback.apply(this, arguments);
      };

      if (selector) delegator = function delegator(e) {
        var evt,
            match = $(e.target).closest(selector, element).get(0);
        if (match && match !== element) {
          evt = $.extend(createProxy(e), { currentTarget: match, liveFired: element });
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
        }
      };

      add(element, event, callback, data, selector, delegator || autoRemove);
    });
  };
  $.fn.off = function (event, selector, callback) {
    var $this = this;
    if (event && !isString(event)) {
      $.each(event, function (type, fn) {
        $this.off(type, selector, fn);
      });
      return $this;
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false) callback = selector, selector = undefined;

    if (callback === false) callback = returnFalse;

    return $this.each(function () {
      remove(this, event, callback, selector);
    });
  };

  $.fn.trigger = function (event, args) {
    event = isString(event) || $.isPlainObject(event) ? $.Event(event) : compatible(event);
    event._args = args;
    return this.each(function () {
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]();
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event);else $(this).triggerHandler(event, args);
    });
  };

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function (event, args) {
    var e, result;
    this.each(function (i, element) {
      e = createProxy(isString(event) ? $.Event(event) : event);
      e._args = args;
      e.target = element;
      $.each(findHandlers(element, event.type || event), function (i, handler) {
        result = handler.proxy(e);
        if (e.isImmediatePropagationStopped()) return false;
      });
    });
    return result;
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick ' + 'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' + 'change select keydown keypress keyup error').split(' ').forEach(function (event) {
    $.fn[event] = function (callback) {
      return 0 in arguments ? this.bind(event, callback) : this.trigger(event);
    };
  });

  $.Event = function (type, props) {
    if (!isString(type)) props = type, type = props.type;
    var event = document.createEvent(specialEvents[type] || 'Events'),
        bubbles = true;
    if (props) for (var name in props) {
      name == 'bubbles' ? bubbles = !!props[name] : event[name] = props[name];
    }event.initEvent(type, bubbles, true);
    return compatible(event);
  };
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($) {
  $.fn.serializeArray = function () {
    var name,
        type,
        result = [],
        add = function add(value) {
      if (value.forEach) return value.forEach(add);
      result.push({ name: name, value: value });
    };
    if (this[0]) $.each(this[0].elements, function (_, field) {
      type = field.type, name = field.name;
      if (name && field.nodeName.toLowerCase() != 'fieldset' && !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' && (type != 'radio' && type != 'checkbox' || field.checked)) add($(field).val());
    });
    return result;
  };

  $.fn.serialize = function () {
    var result = [];
    this.serializeArray().forEach(function (elm) {
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value));
    });
    return result.join('&');
  };

  $.fn.submit = function (callback) {
    if (0 in arguments) this.bind('submit', callback);else if (this.length) {
      var event = $.Event('submit');
      this.eq(0).trigger(event);
      if (!event.isDefaultPrevented()) this.get(0).submit();
    }
    return this;
  };
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($, undefined) {
  var prefix = '',
      eventPrefix,
      vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
      testEl = document.createElement('div'),
      supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
      transform,
      transitionProperty,
      transitionDuration,
      transitionTiming,
      transitionDelay,
      animationName,
      animationDuration,
      animationTiming,
      animationDelay,
      cssReset = {};

  function dasherize(str) {
    return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase();
  }
  function normalizeEvent(name) {
    return eventPrefix ? eventPrefix + name : name.toLowerCase();
  }

  $.each(vendors, function (vendor, event) {
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-';
      eventPrefix = event;
      return false;
    }
  });

  transform = prefix + 'transform';
  cssReset[transitionProperty = prefix + 'transition-property'] = cssReset[transitionDuration = prefix + 'transition-duration'] = cssReset[transitionDelay = prefix + 'transition-delay'] = cssReset[transitionTiming = prefix + 'transition-timing-function'] = cssReset[animationName = prefix + 'animation-name'] = cssReset[animationDuration = prefix + 'animation-duration'] = cssReset[animationDelay = prefix + 'animation-delay'] = cssReset[animationTiming = prefix + 'animation-timing-function'] = '';

  $.fx = {
    off: eventPrefix === undefined && testEl.style.transitionProperty === undefined,
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  };

  $.fn.animate = function (properties, duration, ease, callback, delay) {
    if ($.isFunction(duration)) callback = duration, ease = undefined, duration = undefined;
    if ($.isFunction(ease)) callback = ease, ease = undefined;
    if ($.isPlainObject(duration)) ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration;
    if (duration) duration = (typeof duration == 'number' ? duration : $.fx.speeds[duration] || $.fx.speeds._default) / 1000;
    if (delay) delay = parseFloat(delay) / 1000;
    return this.anim(properties, duration, ease, callback, delay);
  };

  $.fn.anim = function (properties, duration, ease, callback, delay) {
    var key,
        cssValues = {},
        cssProperties,
        transforms = '',
        that = this,
        _wrappedCallback,
        endEvent = $.fx.transitionEnd,
        fired = false;

    if (duration === undefined) duration = $.fx.speeds._default / 1000;
    if (delay === undefined) delay = 0;
    if ($.fx.off) duration = 0;

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties;
      cssValues[animationDuration] = duration + 's';
      cssValues[animationDelay] = delay + 's';
      cssValues[animationTiming] = ease || 'linear';
      endEvent = $.fx.animationEnd;
    } else {
      cssProperties = [];
      // CSS transitions
      for (key in properties) {
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') ';else cssValues[key] = properties[key], cssProperties.push(dasherize(key));
      }if (transforms) cssValues[transform] = transforms, cssProperties.push(transform);
      if (duration > 0 && (typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ');
        cssValues[transitionDuration] = duration + 's';
        cssValues[transitionDelay] = delay + 's';
        cssValues[transitionTiming] = ease || 'linear';
      }
    }

    _wrappedCallback = function wrappedCallback(event) {
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return; // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, _wrappedCallback);
      } else $(this).unbind(endEvent, _wrappedCallback); // triggered by setTimeout

      fired = true;
      $(this).css(cssReset);
      callback && callback.call(this);
    };
    if (duration > 0) {
      this.bind(endEvent, _wrappedCallback);
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function () {
        if (fired) return;
        _wrappedCallback.call(that);
      }, (duration + delay) * 1000 + 25);
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft;

    this.css(cssValues);

    if (duration <= 0) setTimeout(function () {
      that.each(function () {
        _wrappedCallback.call(this);
      });
    }, 0);

    return this;
  };

  testEl = null;
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($, undefined) {
  var document = window.document,
      docElem = document.documentElement,
      origShow = $.fn.show,
      origHide = $.fn.hide,
      origToggle = $.fn.toggle;

  function anim(el, speed, opacity, scale, callback) {
    if (typeof speed == 'function' && !callback) callback = speed, speed = undefined;
    var props = { opacity: opacity };
    if (scale) {
      props.scale = scale;
      el.css($.fx.cssPrefix + 'transform-origin', '0 0');
    }
    return el.animate(props, speed, null, callback);
  }

  function hide(el, speed, scale, callback) {
    return anim(el, speed, 0, scale, function () {
      origHide.call($(this));
      callback && callback.call(this);
    });
  }

  $.fn.show = function (speed, callback) {
    origShow.call(this);
    if (speed === undefined) speed = 0;else this.css('opacity', 0);
    return anim(this, speed, 1, '1,1', callback);
  };

  $.fn.hide = function (speed, callback) {
    if (speed === undefined) return origHide.call(this);else return hide(this, speed, '0,0', callback);
  };

  $.fn.toggle = function (speed, callback) {
    if (speed === undefined || typeof speed == 'boolean') return origToggle.call(this, speed);else return this.each(function () {
      var el = $(this);
      el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback);
    });
  };

  $.fn.fadeTo = function (speed, opacity, callback) {
    return anim(this, speed, opacity, null, callback);
  };

  $.fn.fadeIn = function (speed, callback) {
    var target = this.css('opacity');
    if (target > 0) this.css('opacity', 0);else target = 1;
    return origShow.call(this).fadeTo(speed, target, callback);
  };

  $.fn.fadeOut = function (speed, callback) {
    return hide(this, speed, null, callback);
  };

  $.fn.fadeToggle = function (speed, callback) {
    return this.each(function () {
      var el = $(this);
      el[el.css('opacity') == 0 || el.css('display') == 'none' ? 'fadeIn' : 'fadeOut'](speed, callback);
    });
  };
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function () {
  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined);
  } catch (e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function (element) {
      try {
        return nativeGetComputedStyle(element);
      } catch (e) {
        return null;
      }
    };
  }
})()

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($) {
  var zepto = $.zepto,
      oldQsa = zepto.qsa,
      oldMatches = zepto.matches;

  function _visible(elem) {
    elem = $(elem);
    return !!(elem.width() || elem.height()) && elem.css("display") !== "none";
  }

  // Implements a subset from:
  // http://api.jquery.com/category/selectors/jquery-selector-extensions/
  //
  // Each filter function receives the current index, all nodes in the
  // considered set, and a value if there were parentheses. The value
  // of `this` is the node currently being considered. The function returns the
  // resulting node(s), null, or undefined.
  //
  // Complex selectors are not supported:
  //   li:has(label:contains("foo")) + li:has(label:contains("bar"))
  //   ul.inner:first > li
  var filters = $.expr[':'] = {
    visible: function visible() {
      if (_visible(this)) return this;
    },
    hidden: function hidden() {
      if (!_visible(this)) return this;
    },
    selected: function selected() {
      if (this.selected) return this;
    },
    checked: function checked() {
      if (this.checked) return this;
    },
    parent: function parent() {
      return this.parentNode;
    },
    first: function first(idx) {
      if (idx === 0) return this;
    },
    last: function last(idx, nodes) {
      if (idx === nodes.length - 1) return this;
    },
    eq: function eq(idx, _, value) {
      if (idx === value) return this;
    },
    contains: function contains(idx, _, text) {
      if ($(this).text().indexOf(text) > -1) return this;
    },
    has: function has(idx, _, sel) {
      if (zepto.qsa(this, sel).length) return this;
    }
  };

  var filterRe = new RegExp('(.*):(\\w+)(?:\\(([^)]+)\\))?$\\s*'),
      childRe = /^\s*>/,
      classTag = 'Zepto' + +new Date();

  function process(sel, fn) {
    // quote the hash in `a[href^=#]` expression
    sel = sel.replace(/=#\]/g, '="#"]');
    var filter,
        arg,
        match = filterRe.exec(sel);
    if (match && match[2] in filters) {
      filter = filters[match[2]], arg = match[3];
      sel = match[1];
      if (arg) {
        var num = Number(arg);
        if (isNaN(num)) arg = arg.replace(/^["']|["']$/g, '');else arg = num;
      }
    }
    return fn(sel, filter, arg);
  }

  zepto.qsa = function (node, selector) {
    return process(selector, function (sel, filter, arg) {
      try {
        var taggedParent;
        if (!sel && filter) sel = '*';else if (childRe.test(sel))
          // support "> *" child queries by tagging the parent node with a
          // unique class and prepending that classname onto the selector
          taggedParent = $(node).addClass(classTag), sel = '.' + classTag + ' ' + sel;

        var nodes = oldQsa(node, sel);
      } catch (e) {
        console.error('error performing selector: %o', selector);
        throw e;
      } finally {
        if (taggedParent) taggedParent.removeClass(classTag);
      }
      return !filter ? nodes : zepto.uniq($.map(nodes, function (n, i) {
        return filter.call(n, i, nodes, arg);
      }));
    });
  };

  zepto.matches = function (node, selector) {
    return process(selector, function (sel, filter, arg) {
      return (!sel || oldMatches(node, sel)) && (!filter || filter.call(node, null, arg) === node);
    });
  };
})(Zepto);(function ($) {
  $.fn.nextAll = function (s) {
    var $els = $(),
        $el = this.next();
    while ($el.length) {
      if (typeof s === 'undefined' || $el.is(s)) $els = $els.add($el);
      $el = $el.next();
    }
    return $els;
  }, $.fn.prevAll = function (s) {
    var $els = $(),
        $el = this.prev();
    while ($el.length) {
      if (typeof s === 'undefined' || $el.is(s)) $els = $els.add($el);
      $el = $el.prev();
    }
    return $els;
  };
})(Zepto);

if (typeof jQuery !== "undefined" && jQuery !== null) {
  module.exports = jQuery;
} else {
  module.exports = Zepto;
}

},{}]},{},[2])(2)
}); })(window.jQuery);
