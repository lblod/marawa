"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findFirstNodeOfType = findFirstNodeOfType;
exports.findAllNodesOfType = findAllNodesOfType;

var _rdfaContextScanner = require("./rdfa-context-scanner");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Finds the first dom node with the supplied type
 *
 * @method findFirstNodeOfType
 *
 * @param {DomNode} DomNode Highest level DOM node
 * @param {string} type URI of the type which should be matched
 *
 * @return {DomNode} Dom Node which has the correct type
 */
function findFirstNodeOfType(node, type) {
  var orderedContexts = (0, _rdfaContextScanner.analyse)(node);

  for (var idx = 0; idx < orderedContexts.length; idx++) {
    var ctxObj = orderedContexts[idx];

    for (var cdx = 0; cdx < ctxObj.context.length; cdx++) {
      var triple = ctxObj.context[cdx];
      if (triple.predicate === "a" && triple.object === type) return ctxObj.semanticNode.domNode;
    }
  }

  console.log("Could not find resource of type ".concat(type));
  return null;
}
/**
 * Finds all dom nodes with the supplied type
 *
 * @method findAllNodesOfType
 *
 * @param {DomNode} DomNode Highest level DOM node
 * @param {string} type URI of the type which should be matched
 *
 * @return {[DomNode]} Dom Nodes which have the correct type
 */


function findAllNodesOfType(node, type) {
  var _analyseContexts = (0, _rdfaContextScanner.analyse)(node),
      _analyseContexts2 = _slicedToArray(_analyseContexts, 1),
      richNode = _analyseContexts2[0].semanticNode;

  var matchingNodes = [];

  var processItem = function processItem(richNode) {
    if (richNode.rdfaAttributes["typeof"].includes(type)) matchingNodes.push(richNode);
  };

  var walk = function walk(richNode, functor) {
    functor(richNode);
    (richNode.children || []).forEach(function (child) {
      return walk(child, functor);
    });
  };

  walk(richNode, processItem);
  return matchingNodes.map(function (richNode) {
    return richNode.domNode;
  });
}