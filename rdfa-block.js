"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
 * Represents a logical block, a combination of one or more RichNodes,
 * that share the same semantic meaning (in terms of RDFa as well as in terms of display).
 *
 * An RDFa block has the following properties:
 * - start, end, region: boundaries of the RDFa block
 * - text: plain text of the region
 * - richNodes: array of leaf richNodes that are combined in this RDFa block
 * - semanticNode: deepest (ancestor) rich node that contains the context of this block
 * - context: array of triples from the top to the semantic node
 * - isRdfaBlock: whether this block can be combined with other blocks (mainly for internal usage).
 *                RDFa blocks cannot be combined if isRdfaBlock == true
 *
 * @module editor-core
 * @class RdfaBlock
 * @constructor
 */
var RdfaBlock = /*#__PURE__*/function () {
  function RdfaBlock(content) {
    _classCallCheck(this, RdfaBlock);

    for (var key in content) {
      this[key] = content[key];
    }
  }

  _createClass(RdfaBlock, [{
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
    key: "richNode",
    get: function get() {
      console.warn("[DEPRECATED] Property 'richNode' of RdfaBlock is deprecated. Please use 'richNodes' instead.");
      return this.richNodes;
    }
  }, {
    key: "isInRegion",
    value: function isInRegion(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          start = _ref4[0],
          end = _ref4[1];

      return start <= this.start && this.end <= end;
    }
  }, {
    key: "isPartiallyInRegion",
    value: function isPartiallyInRegion(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          start = _ref6[0],
          end = _ref6[1];

      return this.start >= start && this.start < end || this.end > start && this.end <= end;
    }
  }, {
    key: "isPartiallyOrFullyInRegion",
    value: function isPartiallyOrFullyInRegion(_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2),
          start = _ref8[0],
          end = _ref8[1];

      if (start == undefined || end == undefined) return true;
      return this.start >= start && this.start <= end || this.end >= start && this.end <= end || this.start <= start && end <= this.end;
    }
  }, {
    key: "containsRegion",
    value: function containsRegion(_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          start = _ref10[0],
          end = _ref10[1];

      return this.start <= start && end <= this.end;
    }
    /**
     * Returns the absolute region based on the RDFa block region and a given relative region
     *
     * @method normalizeRegion
     *
     * @param {[int,int]} [start, end] Relative region offsets
     *
     * @return {[int,int]} [start, end] Absolute region offsets
     */

  }, {
    key: "normalizeRegion",
    value: function normalizeRegion(_ref11) {
      var _ref12 = _slicedToArray(_ref11, 2),
          relativeStart = _ref12[0],
          relativeEnd = _ref12[1];

      return [this.start + relativeStart, this.start + relativeEnd];
    }
  }]);

  return RdfaBlock;
}();

var _default = RdfaBlock;
exports["default"] = _default;
module.exports = exports.default;