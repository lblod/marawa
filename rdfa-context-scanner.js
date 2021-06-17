"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.analyse = analyse;
exports["default"] = void 0;

var _nodeWalker = require("./node-walker");

var _rdfaHelpers = require("./rdfa-helpers");

var _rdfaBlock = _interopRequireDefault(require("./rdfa-block"));

var _richNode = _interopRequireDefault(require("./rich-node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// TODO: Research a way to alter the imports when used in an Ember application

/**
 * Scanner of the RDFa context of DOM nodes
 *
 * @module editor-core
 * @class RdfaContextScanner
 * @constructor
 */
var RdfaContextScanner = /*#__PURE__*/function () {
  function RdfaContextScanner() {
    _classCallCheck(this, RdfaContextScanner);
  }

  _createClass(RdfaContextScanner, [{
    key: "analyse",
    value:
    /**
     * Analyse the RDFa contexts of a specific region in a text
     * /!\ Can be called by a shorthand below this class /!\
     *
     * @method analyse
     *
     * @param {Node} domNode Root DOM node containing the text
     * @param {[number,number]} region Region in the text for which RDFa contexts must be calculated.
     *                                 Full region if start or end is undefined.
     * @param {Options} options Options provided to the method:
     *                            - documentUrl: the url of the document to be applied to relative urls
     *
     * @return {[RdfaBlock]} Array of RDFa blocks representing the RDFa context of the given region in a given DOM node.
     *                 It's important to note that the resulting RDFa blocks might span a broader range than the requested range
     *                 when the nodes at the border of the range can be combined with non-logical blocks falling outside the range.
     *
     *                 The properties of an RDFa block are documented in the RdfaBlock class.
     *
     *                 The rich nodes (and their trees) in the RDFa blocks are enriched with the following semantic properties:
     *                 - rdfaPrefixes: map of prefixes at the current node
     *                 - rdfaAttributes: resolved (= non-prefixed) RDFa attributes set on the node
     *                 - rdfaContext: array of rdfaAttributes from the top to the current node
     *                 - isLogicalBlock: whether the individual node represents a logical block of content
     *                 - rdfaBlocks[]: array of RDFa blocks representing the RDFa context at the current node
     *
     * @public
     */
    function analyse(domNode) {
      var region = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _region = _slicedToArray(region, 2),
          start = _region[0],
          end = _region[1];

      if (domNode == null || start < 0 || end < start) return [];
      var richNode = (0, _nodeWalker.walk)(domNode);
      this.calculateRdfaToTop(richNode, options);
      this.calculateInnerRdfa(richNode, options);
      var rdfaBlocks = this.flattenRdfaTree(richNode, [start, end]);
      var resultingBlocks; // TODO is this still required since we already take start/end into account in flattenRdfaTree

      if (start && end) {
        resultingBlocks = rdfaBlocks.filter(function (b) {
          return b.isPartiallyOrFullyInRegion([start, end]);
        });
      } else {
        resultingBlocks = rdfaBlocks;
      } // TODO is this still required?


      return resultingBlocks.map(function (b) {
        // make sure contexts have a region
        b.region = [b.start, b.end];
        return b;
      });
    }
    /**
     * Calculate the RDFa context from a given node to the top of the document
     * I.e. resolve prefixes and augment RDFa context based on the prefixes and RDFa context of its parent
     *
     * @method calculateRdfaToTop
     *
     * @param {RichNode} richNode Rich node to start from
     * @param {Options} options Options provided to the method:
     *                            - documentUrl: the url of the document to be applied to relative urls
     *
     * @private
     */

  }, {
    key: "calculateRdfaToTop",
    value: function calculateRdfaToTop(startNode) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var richNodesOnPath = [startNode];

      for (var domNode = startNode.domNode.parentNode; domNode; domNode = domNode.parentNode) {
        // nodeWalker only creates RichNodes for the inner tree of startNode
        // let's create richNodes for the path from startNode uptil the top of the document
        var richNode = new _richNode["default"]({
          domNode: domNode
        });
        richNodesOnPath.push(richNode);
      }

      richNodesOnPath.reverse(); // get rich nodes from top to bottom

      richNodesOnPath.forEach(function (richNode, i) {
        if (i == 0) {
          (0, _rdfaHelpers.enrichWithRdfaProperties)(richNode, undefined, undefined, options);
        } else {
          var parent = richNodesOnPath[i - 1];
          richNode.parent = parent;
          (0, _rdfaHelpers.enrichWithRdfaProperties)(richNode, parent.rdfaContext, parent.rdfaPrefixes, options);
        }
      });
    }
    /**
     * Recursively expands the RDFa context of the inner nodes of a rich node
     * I.e. resolve prefixes and augment RDFa context based on the prefixes and RDFa context of its parent
     *
     * @method calculateInnerRdfa
     *
     * @param {RichNode} richNode Rich node to start from
     * @param {Options} options Options provided to the method:
     *                            - documentUrl: the url of the document to be applied to relative urls
     *
     * @private
     */

  }, {
    key: "calculateInnerRdfa",
    value: function calculateInnerRdfa(richNode) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      (richNode.children || []).forEach(function (child) {
        (0, _rdfaHelpers.enrichWithRdfaProperties)(child, richNode.rdfaContext, richNode.rdfaPrefixes, options);

        _this.calculateInnerRdfa(child, options);
      });
    }
    /**
     * Flatten and reduce a rich node RDFa tree to an array of RDFa blocks.
     * An RDFa block represents a combination of one or more leaf rich nodes
     * that share the same semantics (in terms of RDFa as well as in terms of display).
     * Only RDFa blocks (partially) falling in a specified region are returned.
     *
     * It is the goal to yield a flattened tree of RDFa statements.
     * Combining as many of them as possible.  Some examples on how we
     * intend to combine nodes will explain the intent better than a
     * long description.  The following cases represent a DOM tree.  The
     * o represents a tag which doesn't contain semantic content and
     * which in itself isn't rendered as a block.  The l represents a
     * logical block, these are blocks which render as a visually
     * separate block in html or which contain semantic content.  When
     * moving upward, we want to combine adjacent non-logical blocks.
     * When combining the blocks, we represent a non-mergeable RDFa block
     * by putting parens around it. In code that is reflected by the isRdfaBlock property.
     *
     * For the two examples below, we explain the logic under the
     * drawing.
     *
     *
     *  1:        o      <-  (l) (oo) o (l)
     *           / \
     *  2:      l   o    <-  l = (l) (oo)  o = o l
     *         /|\  |\
     *  3:    l o o o l
     *
     *      -> l oo o l <-
     *
     * At the lowest level of nodes (3), we notice there's a logical
     * block, followed by two inline blocks.  The two inline blocks can
     * be combined.  Moving one level up (2), we see that these three
     * blocks are composed within a logical block.  Hence we can't
     * further combine the (oo) statement further up the hierarchy.
     * Moving to the right, we see an o and an l, which can't be further
     * combined.
     *
     *  -> (l) (o o) o l <-
     *
     *  1:        o      <-  (l) ooo (l)
     *           / \
     *  2:      o   o    <-  l = (l) oo   o = o (l)
     *         /|\  |\
     *  3:    l o o o l
     *
     *      -> l ooo l <-
     *
     * This case is different from the previous case.  On level 3, in
     * the left, we combine l o o to represent (l) oo.  The two
     * non-logical blocks can be combined.  As we move these to a level
     * up (2), we're still left with one logical block, and two
     * non-logical blocks.  The right of level 3 consists of o l.  These
     * too are stored in a non-logical block.  Hence we can combine them
     * to represent o (l).  Combining further at the top level (1), we
     * can combine all the three o as non of them is a logical block.
     * Because level 1 itself isn't a logical block either, we don't put
     * them between parens.  Hence, we end up with the blocks l ooo l.
     *
     * @method flattenRdfaTree
     *
     * @param {RichNode} richNode Rich node to flatten
     * @param {[number,number]} region Region in the text for which RDFa nodes must be returned
     *
     * @return {[RdfaBlock]} Array of RDFa blocks falling in a specified region
     *
     * @private
     */

  }, {
    key: "flattenRdfaTree",
    value: function flattenRdfaTree(richNode) {
      var _this2 = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [],
          _ref2 = _slicedToArray(_ref, 2),
          start = _ref2[0],
          end = _ref2[1];

      // The desired outcome for a given [start, end] consists of all
      // lowest level logical blocks which overlap with [start, end].
      // full contents of all lowest-level logical blocks which
      // (partially) overlap with [start, end].  As such, we need to
      // detect and share the current highest-level logical block, and
      // keep yielding contents until we find a logical block that does
      // not overlap anymore.
      var preprocessNode = function preprocessNode(richNode) {
        richNode.isLogicalBlock = _this2.nodeIsLogicalBlock(richNode);
      };

      var processChildNode = function processChildNode(node) {
        // All blocks may contain meaningful content.  If the content is
        // a logical block then we should check its region for overlap.
        // If it is not a logical block, it may or may not contain
        // useful info so we should scan it just to be sure.
        var shouldScanFurther = node.isPartiallyOrFullyInRegion([start, end]) || !_this2.nodeIsLogicalBlock(node);

        if (shouldScanFurther) {
          _this2.flattenRdfaTree(node, [start, end]);
        } // else {
        //   node is a logical block outside the range
        //   it cannot be combined with a block in the range so it can be ignored
        // }

      }; // ran when we're finished processing all child nodes


      var finishChildSteps = function finishChildSteps(node) {
        var rdfaBlocks;

        if (!_this2.nodeIsLogicalBlock(node) || node.isPartiallyOrFullyInRegion([start, end])) {
          rdfaBlocks = _this2.getRdfaBlockList(node);
        } else if (_this2.nodeiIsLogicalBlock(node) && node.isPartiallyOrFullyInRegion([start, end])) {
          var rdfaBlock = new _rdfaBlock["default"]({
            start: richNode.start,
            end: richNode.end || richNode.start,
            region: richNode.region,
            text: richNode.text,
            context: (0, _rdfaHelpers.rdfaAttributesToTriples)(richNode.rdfaContext),
            richNodes: [richNode],
            isRdfaBlock: richNode.isLogicalBlock,
            semanticNode: richNode.isLogicalBlock && richNode
          });
          rdfaBlocks = [rdfaBlock];
        } else {
          // node is outside the range. It doesn't produce an RDFa block for the final result
          rdfaBlocks = [];
        }

        node.rdfaBlocks = rdfaBlocks;
      };

      preprocessNode(richNode);
      (richNode.children || []).map(function (child) {
        return processChildNode(child);
      });
      finishChildSteps(richNode);
      return richNode.rdfaBlocks;
    }
    /**
     * Get an array of (combined) RDFa nodes for the supplied richNode.
     * Takes into account the properties of the richNode, and the
     * previously calculated rdfaNodeList of the children.
     *
     * @method getRdfaNodeList
     *
     * @param {RichNode} richNode The node for which to return the rdfaNodeList.
     *
     * @return {[RdfaBlock]} Array of rdfaBlock items.
     *
     * @private
     */

  }, {
    key: "getRdfaBlockList",
    value: function getRdfaBlockList(richNode) {
      switch (richNode.type) {
        case "text":
          return this.createRdfaBlocksFromText(richNode);

        case "tag":
          if ((0, _nodeWalker.isVoidElement)(richNode.domNode)) {
            return this.createRdfaBlocksFromText(richNode);
          } else {
            return this.createRdfaBlocksFromTag(richNode);
          }

        default:
          return [];
      }
    }
    /**
     * Returns an array of rdfaBlock items for the supplied richNode,
     * assuming that is a text node.
     *
     * @method createRdfaBlocksFromText
     *
     * @param {RichNode} richNode The text node for which to return the
     * rdfa blocks.
     *
     * @return {[RdfaBlock]} Array of rdfaBlock items.
     *
     * @private
     */

  }, {
    key: "createRdfaBlocksFromText",
    value: function createRdfaBlocksFromText(richNode) {
      return [new _rdfaBlock["default"]({
        start: richNode.start,
        end: richNode.end || richNode.start,
        region: richNode.region,
        text: richNode.text,
        context: (0, _rdfaHelpers.rdfaAttributesToTriples)(richNode.rdfaContext),
        richNodes: [richNode],
        isRdfaBlock: richNode.isLogicalBlock,
        semanticNode: richNode.isLogicalBlock && richNode
      })];
    }
    /**
     * Returns an array of RDFa block for the supplied richNode,
     * assuming that is a tag node.
     *
     * If the tag node doesn't have children, i.e. it's an empty tag
     * without text, a new RDFa block is created for the empty rich node.
     *
     * If the tag node has children, the idea is to first get
     * the RDFa blocks from each of our children
     * and put them in a flat list.  We only need to check the first and
     * last children for combination, but we're lazy and try to combine
     * each of them if they don't have a different meaning logically.
     * Next we possibly overwrite the isRdfaBlock property, based on the
     * property of our own richNode.  If we are an rdfaBlock, none of
     * our children is still allowed to be combined after we ran the
     * combinator.
     *
     * @method createRdfaBlocksFromTag
     *
     * @param {RichNode} richNode RichNode for which the rdfaBlock items
     * will be returned.
     *
     * @return {[RdfaBlock]} Array of rdfaBlock items for this tag.
     *
     * @private
     */

  }, {
    key: "createRdfaBlocksFromTag",
    value: function createRdfaBlocksFromTag(richNode) {
      var rdfaBlock = new _rdfaBlock["default"]({
        start: richNode.start,
        end: richNode.end || richNode.start,
        region: richNode.region,
        text: richNode.text,
        context: (0, _rdfaHelpers.rdfaAttributesToTriples)(richNode.rdfaContext),
        richNodes: [richNode],
        isRdfaBlock: richNode.isLogicalBlock,
        semanticNode: richNode.isLogicalBlock && richNode
      });

      if (!richNode.children || richNode.children.length == 0) {
        // an empty tag without text
        return [rdfaBlock];
      } else {
        var flatRdfaChildren = richNode.children.map(function (child) {
          return child.rdfaBlocks || [];
        }).reduce(function (a, b) {
          return a.concat(b);
        }, []); // map & combine children when possible

        var combinedChildren = this.combineRdfaBlocks(flatRdfaChildren); // clone children. Handy for debugging
        // const clonedChildren = combinedChildren.map( this.shallowClone );
        // override isRdfaBlock on each child, based on current node
        // set ourselves as semantic node on the child if it doesn't have one yet

        if (richNode.isLogicalBlock) {
          combinedChildren.forEach(function (child) {
            child.isRdfaBlock = true;
            if (!child.semanticNode) child.semanticNode = richNode;
          });
        }

        return _toConsumableArray(combinedChildren);
      }
    }
    /**
     * Combines an array of RDFa blocks based on their properties.
     * RDFa blocks are combined if they don't have a logical different meaning.
     *
     * @method combineRdfaBlocks
     *
     * @param {[RdfaBlock]} nodes Set of RDFa blocks we'll try to combine
     *
     * @return {[RdfaBlock]} Array of RDFa blocks after the combineable
     * ones were combined.
     *
     * @private
     */

  }, {
    key: "combineRdfaBlocks",
    value: function combineRdfaBlocks(rdfaBlocks) {
      var combineAdjacentRdfaBlocks = function combineAdjacentRdfaBlocks(left, right) {
        var _ref3 = [left.start, right.end],
            start = _ref3[0],
            end = _ref3[1];
        var combinedRichNodes = [left, right].map(function (e) {
          return e.richNodes;
        }).reduce(function (a, b) {
          return a.concat(b);
        }, []);
        return new _rdfaBlock["default"]({
          region: [start, end],
          start: start,
          end: end,
          text: (left.text || '') + (right.text || ''),
          context: left.context,
          // pick any of the two
          richNodes: combinedRichNodes,
          isRdfaBlock: false // these two nodes can be combined

        });
      };

      if (rdfaBlocks.length <= 1) {
        return rdfaBlocks;
      } else {
        // walk front-to back, build result in reverse order
        var firstElement, restElements;

        var _rdfaBlocks = _toArray(rdfaBlocks);

        firstElement = _rdfaBlocks[0];
        restElements = _rdfaBlocks.slice(1);
        var combinedElements = restElements.reduce(function (_ref4, nextElement) {
          var _ref5 = _toArray(_ref4),
              pastElement = _ref5[0],
              rest = _ref5.slice(1);

          if (pastElement.isRdfaBlock || nextElement.isRdfaBlock || pastElement.end != nextElement.start) return [nextElement, pastElement].concat(_toConsumableArray(rest)); // blocks cannot be combined
          else {
              var combinedRdfaBlock = combineAdjacentRdfaBlocks(pastElement, nextElement);
              return [combinedRdfaBlock].concat(_toConsumableArray(rest));
            }
        }, [firstElement]); // reverse generated array

        combinedElements.reverse();
        return combinedElements;
      }
    }
    /**
     * Returns a shallow clone of the supplied object
     *
     * @param {Object} rdfaBlock The object to clone
     *
     * @return {Object} A shallow clone of the supplied object.
     *
     * @private
     */

  }, {
    key: "shallowClone",
    value: function shallowClone(rdfaBlock) {
      return Object.assign({}, rdfaBlock);
    }
    /**
     * Returns truethy if the supplied node represents a logical block.
     * We expect to override this as we discover new cases.  In general
     * we check whether there's RDFa defined on the element and/or
     * whether it is a block when rendered in the browser with the
     * current style.
     *
     * @method nodeIsLogicalBlock
     *
     * @param {RichNode} richNode Rich node which will be checked
     *
     * @return {boolean} True iff the node is a logical block
     *
     * @private
     */

  }, {
    key: "nodeIsLogicalBlock",
    value: function nodeIsLogicalBlock(richNode) {
      if (richNode.rdfaAttributes) {
        return true;
      } else if (richNode.type != "tag") {
        return false;
      } else {
        return this.isDisplayedAsBlock(richNode);
      }
    }
    /**
     * Whether an element is displayed as a block
     *
     * @method isDisplayedAsBlock
     *
     * @param {RichNode} richNode Node to validate
     *
     * @return {boolean} true iff the element is displayed as a block
     *
     * @private
     */

  }, {
    key: "isDisplayedAsBlock",
    value: function isDisplayedAsBlock(richNode) {
      if (richNode.type != 'tag') return false;

      if (typeof window !== "undefined") {
        var domNode = richNode.domNode;
        var displayStyle = window.getComputedStyle(domNode)['display'];
        return displayStyle == 'block' || displayStyle == 'list-item';
      } else {
        return false;
      }
    }
  }]);

  return RdfaContextScanner;
}();
/**
 * Shorthand form for creating a new RdfaContextScanner and analysing the supplied node with it.
 *
 * @method analyse
 *
 * @param {Node} node Node to be analysed
 * @param {[number,number]} region Region in the text for which RDFa contexts must be calculated.
 *                                 Full region if start or end is undefined.
 * @param {Options} options Options provided to the method:
 *                            - documentUrl: the url of the document to be applied to relative urls
 *
 * @return {[RichNode]} RichNodes containing the analysed node
 */


function analyse(node) {
  var region = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return new RdfaContextScanner().analyse(node, region, options);
}

var _default = RdfaContextScanner;
exports["default"] = _default;