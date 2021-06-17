"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.positionInRange = positionInRange;
exports.isLeftAdjacentRange = isLeftAdjacentRange;
exports.isRightAdjacentRange = isRightAdjacentRange;
exports.isAdjacentRange = isAdjacentRange;
exports.isEmptyRange = isEmptyRange;
exports.isEqualRange = isEqualRange;
exports.rangeAStartsOrEndsinB = rangeAStartsOrEndsinB;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function positionInRange(position, _ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      start = _ref2[0],
      end = _ref2[1];

  return position >= start && position <= end;
}

;
/**
 * this methods checks if rangeA fully or partially contained in B
 */

function rangeAStartsOrEndsinB(rangeA, rangeB) {
  var _rangeA = _slicedToArray(rangeA, 2),
      start = _rangeA[0],
      end = _rangeA[1];

  return positionInRange(start, rangeB) || positionInRange(end, rangeB);
}

function isLeftAdjacentRange(_ref3, _ref4) {
  var _ref5 = _slicedToArray(_ref3, 2),
      neighbourStart = _ref5[0],
      neighbourEnd = _ref5[1];

  var _ref6 = _slicedToArray(_ref4, 2),
      start = _ref6[0],
      end = _ref6[1];

  return neighbourEnd == start;
}

function isRightAdjacentRange(_ref7, _ref8) {
  var _ref9 = _slicedToArray(_ref7, 2),
      neighbourStart = _ref9[0],
      neighbourEnd = _ref9[1];

  var _ref10 = _slicedToArray(_ref8, 2),
      start = _ref10[0],
      end = _ref10[1];

  return neighbourStart == end;
}

function isAdjacentRange(neighbour, region) {
  return isLeftAdjacentRange(neighbour, region) || isRightAdjacentRange(neighbour, region);
}

;

function isEmptyRange(_ref11) {
  var _ref12 = _slicedToArray(_ref11, 2),
      start = _ref12[0],
      end = _ref12[1];

  return end - start <= 0;
}

function isEqualRange(_ref13, _ref14) {
  var _ref15 = _slicedToArray(_ref13, 2),
      startA = _ref15[0],
      endA = _ref15[1];

  var _ref16 = _slicedToArray(_ref14, 2),
      startB = _ref16[0],
      endB = _ref16[1];

  return startA == startB && endA == endB;
}