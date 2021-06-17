"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _rangeHelpers = require("./range-helpers");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Represents an enriched DOM node.
 *
 * The DOM node is available in the 'domNode' property.
 *
 * @module editor-core
 * @class RichNode
 * @constructor
 */
var RichNode = /*#__PURE__*/function () {
  function RichNode(content) {
    _classCallCheck(this, RichNode);

    for (var key in content) {
      this[key] = content[key];
    }
  }

  _createClass(RichNode, [{
    key: "region",
    get: function get() {
      var start = this.start;
      var end = this.end;
      return [start, end || start];
    },
    set: function set(_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          start = _ref2[0],
          end = _ref2[1];

      this.start = start;
      this.end = end;
    }
  }, {
    key: "length",
    get: function get() {
      var end = this.end || 0;
      var start = this.start || 0;
      var diff = Math.max(0, end - start);
      return diff;
    }
  }, {
    key: "isInRegion",
    value: function isInRegion(start, end) {
      return start <= this.start && this.end <= end;
    }
  }, {
    key: "isPartiallyInRegion",
    value: function isPartiallyInRegion(start, end) {
      return this.start >= start && this.start < end || this.end > start && this.end <= end;
    }
  }, {
    key: "isPartiallyOrFullyInRegion",
    value: function isPartiallyOrFullyInRegion(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          start = _ref4[0],
          end = _ref4[1];

      if (start == undefined || end == undefined) return true;
      return this.start >= start && this.start <= end || this.end >= start && this.end <= end || this.start <= start && end <= this.end;
    }
  }, {
    key: "partiallyOrFullyContainsRegion",
    value: function partiallyOrFullyContainsRegion(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          start = _ref6[0],
          end = _ref6[1];

      return (0, _rangeHelpers.positionInRange)(start, this.region) || (0, _rangeHelpers.positionInRange)(end, this.region);
    }
  }, {
    key: "containsRegion",
    value: function containsRegion(start, end) {
      return this.start <= start && end <= this.end;
    }
  }, {
    key: "isAncestorOf",
    value: function isAncestorOf(richNode) {
      var node = richNode;

      while (node) {
        if (this.domNode == node.domNode) return true;
        node = node.parent;
      }

      return false;
    }
  }, {
    key: "isDescendentOf",
    value: function isDescendentOf(richNode) {
      return richNode.isAncestorOf(this);
    }
  }]);

  return RichNode;
}();

var _default = RichNode;
exports["default"] = _default;
module.exports = exports.default;