"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parsePrefixString = exports["default"] = void 0;

var _rdfaConfig = require("./support/rdfa-config");

var _rdfaHelpers = require("./rdfa-helpers");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Represents the RDFa attributes set on a node
 *
 * Note: The attributes of an existing RdfaAttributes object should not be updated.
 * A new RdfaAttributes object should be created in that case.
 *
 * TODO: add support for language
 *
 * @class RdfaAttributes
 * @constructor
*/
var RdfaAttributes = /*#__PURE__*/function () {
  function RdfaAttributes(domNode) {
    var knownPrefixes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _rdfaConfig.defaultPrefixes;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, RdfaAttributes);

    _defineProperty(this, "typeof", void 0);

    _defineProperty(this, "properties", void 0);

    _defineProperty(this, "rel", void 0);

    _defineProperty(this, "rev", void 0);

    _defineProperty(this, "src", void 0);

    _defineProperty(this, "href", void 0);

    _defineProperty(this, "resource", void 0);

    _defineProperty(this, "about", void 0);

    _defineProperty(this, "datatype", void 0);

    _defineProperty(this, "text", void 0);

    _defineProperty(this, "documentUrl", void 0);

    _defineProperty(this, "currentPrefixes", void 0);

    if (domNode && domNode.getAttribute) {
      var _iterator = _createForOfIteratorHelper(_rdfaConfig.rdfaKeywords),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var key = _step.value;
          this["_".concat(key)] = domNode.getAttribute(key);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      ;
      this.text = domNode.textContent;
      this.documentUrl = options.documentUrl;
      this.setResolvedAttributes(knownPrefixes);
    }
  }

  _createClass(RdfaAttributes, [{
    key: "vocab",
    get: function get() {
      return this._vocab;
    }
  }, {
    key: "content",
    get: function get() {
      return this._content;
    }
  }, {
    key: "property",
    get: function get() {
      console.warn("[DEPRECATED] Property 'property' of RdfaAttributes is deprecated. Please use 'properties' instead.");
      return this.properties && this.properties.length && this.properties[0];
    }
    /**
     * Returns whether an RDFa attribute is set
     */

  }, {
    key: "isEmpty",
    get: function get() {
      var _this = this;

      return _rdfaConfig.rdfaKeywords.find(function (key) {
        return _this["_".concat(key)] != null;
      }) == null;
    }
  }, {
    key: "language",
    get: function get() {
      if (this["_xml:lang"] || this._lang) {
        return this["_xml:lang"] || this._lang;
      } else {
        return null;
      }
    }
    /**
     * @method setResolvedAttributes
     * @private
     *
     * The RdfaAttributes object stores the RDFa attributes in several formats:
     * _attribute (e.g. _property): the raw value as set on the node. Null if not set.
     * _attributes (e.g. _properties): an array of values for attributes that are multivalued. Null if not set.
     * attribute (e.g. properties): (array of) values with resolved prefixes
    */

  }, {
    key: "setResolvedAttributes",
    value: function setResolvedAttributes(knownPrefixes) {
      this.currentPrefixes = Object.assign({}, knownPrefixes);
      this.splitMultivalueAttributes();
      this.updateCurrentPrefixes();
      this.resolvePrefixedAttributes();
    }
    /**
     * @method splitMultivalueAttributes
     * @private
    */

  }, {
    key: "splitMultivalueAttributes",
    value: function splitMultivalueAttributes() {
      var keywords = {
        property: 'properties',
        "typeof": 'typeof',
        rel: 'rel',
        rev: 'rev'
      };

      for (var key in keywords) {
        var listKey = "_".concat(keywords[key]);
        var value = this["_".concat(key)];

        if (value != null) {
          this[listKey] = value.split(' '); // TODO support splitting on multiple spaces
        } else {
          this[listKey] = null;
        }
      }

      if (this._prefix != null) {
        this.prefixes = parsePrefixString(this._prefix);
      } else {
        this.prefixes = null;
      }
    }
    /**
     * @private
     * @method updateCurrentPrefixes
     */

  }, {
    key: "updateCurrentPrefixes",
    value: function updateCurrentPrefixes() {
      if (this.vocab != null) {
        this.currentPrefixes[''] = this.vocab;
      }

      if (this.prefixes != null) {
        for (var key in this.prefixes) {
          this.currentPrefixes[key] = this.prefixes[key];
        }
      }
    }
    /**
     * @private
     * @method resolvePrefixedAttributes
     */

  }, {
    key: "resolvePrefixedAttributes",
    value: function resolvePrefixedAttributes() {
      var _this2 = this;

      var prefixableRdfaKeywords = ['typeof', 'properties', 'rel', 'rev', 'src', 'href', 'resource', 'about', 'datatype'];
      prefixableRdfaKeywords.forEach(function (key) {
        if (_this2["_".concat(key)] != null) {
          _this2[key] = (0, _rdfaHelpers.resolvePrefix)(key, _this2["_".concat(key)], _this2.currentPrefixes, _this2.documentUrl);
        }
      });
    }
  }]);

  return RdfaAttributes;
}();
/**
 * Parses an RDFa prefix string and returns a map of prefixes to URIs.
 * According to the RDFa spec prefixes must be seperated by exactly one space.
 *
 * @method parsePrefixString
 * @param string prefixString Space-seperated string of RDFa prefixes
 * @return Object Map of prefixes to their URI
*/


var parsePrefixString = function parsePrefixString(prefixString) {
  var parts = prefixString.split(' ');
  var prefixes = {}; // parts is an array like ['mu:', 'http://mu.semte.ch...', 'ext:', 'http://...', ...]
  // transform to an object like { mu: 'http://mu.semte.ch...', ext: 'http://...', ... }

  for (var i = 0; i < parts.length; i = i + 2) {
    var key = parts[i].substr(0, parts[i].length - 1);
    prefixes[key] = parts[i + 1];
  }

  return prefixes;
};

exports.parsePrefixString = parsePrefixString;
var _default = RdfaAttributes;
exports["default"] = _default;