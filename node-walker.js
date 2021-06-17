"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.walk = walk;
exports.isVoidElement = exports["default"] = void 0;

var _richNode = _interopRequireDefault(require("./rich-node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VOID_NODES = ["AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
/**
 * dom helper to check whether a node is a "void element"
 * https://www.w3.org/TR/html/syntax.html#void-elements
 *
 * @method isVoidElement
 * @static
 * @param {DOMNode} node
 * @return {boolean}
 * @public
 */

var isVoidElement = function isVoidElement(node) {
  return node.nodeType === Node.ELEMENT_NODE && VOID_NODES.includes(node.tagName);
};

exports.isVoidElement = isVoidElement;

if (!Node) {
  var Node = {
    // Node types consumed from https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
    ELEMENT_NODE: 1,
    // 	An Element node like <p> or <div>.
    TEXT_NODE: 3,
    // 	The actual Text inside an Element or Attr.
    CDATA_SECTION_NODE: 4,
    // 	A CDATASection, such as <!CDATA[[ … ]]>.
    PROCESSING_INSTRUCTION_NODE: 7,
    // 	A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
    COMMENT_NODE: 8,
    // 	A Comment node, such as <!-- … -->.
    DOCUMENT_NODE: 9,
    // 	A Document node.
    DOCUMENT_TYPE_NODE: 10,
    // 	A DocumentType node, such as <!DOCTYPE html>.
    DOCUMENT_FRAGMENT_NODE: 11 // 	A DocumentFragment node.

  };
}
/**
 * DOM tree walker producing RichNodes
 *
 * @module editor-core
 * @class NodeWalker
 * @constructor
 */


var NodeWalker = /*#__PURE__*/function () {
  function NodeWalker() {
    _classCallCheck(this, NodeWalker);
  }

  _createClass(NodeWalker, [{
    key: "processDomNode",
    value:
    /**
     * Processes a single dom node.
     */
    function processDomNode(domNode, parentNode) {
      var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var myStart = parentNode && parentNode.end || start;
      var richNode = this.createRichNode({
        domNode: domNode,
        parent: parentNode,
        start: myStart,
        end: myStart,
        type: this.detectDomNodeType(domNode)
      }); // For tags, recursively analyse the children

      if (richNode.type === 'tag') {
        return this.processTagNode(richNode);
      } // For text nodes, add the content and update the index
      else if (richNode.type === 'text') {
          return this.processTextNode(richNode);
        } // For comment nodes, set update the index
        else {
            // if (richNode.type == 'other')
            return this.processOtherNode(richNode);
          }
    }
    /**
     * Called when stepping into a child Dom node
     */

  }, {
    key: "stepInDomNode",
    value: function stepInDomNode(richNode, childDomNode) {
      return this.processDomNode(childDomNode, richNode);
    }
    /**
     * Steps from one (or no) child node to the next.
     */

  }, {
    key: "stepNextDomNode",
    value: function stepNextDomNode(richNode, nextDomChildren) {
      if (nextDomChildren.length == 0) return [];

      var _nextDomChildren = _toArray(nextDomChildren),
          firstChild = _nextDomChildren[0],
          nextChildren = _nextDomChildren.slice(1);

      var richChildNode = this.stepInDomNode(richNode, firstChild);
      richNode.end = richChildNode.end;
      if (nextChildren.length) return [richChildNode].concat(_toConsumableArray(this.stepNextDomNode(richNode, nextChildren)));else return [richChildNode];
    }
    /**
     * Called when finishing the processing of all the child nodes.
     */

    /*eslint no-unused-vars: ["error", { "args": "none" }]*/

  }, {
    key: "finishChildSteps",
    value: function finishChildSteps(richNode) {
      return;
    }
    /**
     * Processes a single rich text node
     */

  }, {
    key: "processTextNode",
    value: function processTextNode(richNode) {
      var domNode = richNode.domNode;
      var start = richNode.start;
      var text = domNode.textContent;
      richNode.text = text;
      richNode.end = start + text.length;
      return richNode;
    }
    /**
     * Processes a single rich tag
     */

  }, {
    key: "processTagNode",
    value: function processTagNode(richNode) {
      if (!isVoidElement(richNode.domNode)) {
        // Void elements are elements which cannot contain any contents.
        // They don't have an internal text, but may have other meaning.
        return this.processRegularTagNode(richNode);
      } else {
        // Regular tags are all common tags.  This is the standard case
        // where we can consider the item's content.
        return this.processVoidTagNode(richNode);
      }
    }
  }, {
    key: "processRegularTagNode",
    value: function processRegularTagNode(richNode) {
      richNode.end = richNode.start; // end will be updated during run

      var domNode = richNode.domNode;
      var childDomNodes = domNode.childNodes ? domNode.childNodes : [];
      richNode.children = this.stepNextDomNode(richNode, childDomNodes);
      this.finishChildSteps(richNode);
      return richNode;
    }
    /**
     * Processes a void tag node.
     *
     * Currently has support for two common types of nodes: IMG and BR.
     * The BR is replaced by a "\n" symbol.  Other tags are currently
     * replaced by a space.
     *
     * TODO: This code path is experimental.  We know this may cause
     * various problems and intend to remove it.
     */

  }, {
    key: "processVoidTagNode",
    value: function processVoidTagNode(richNode) {
      var start = richNode.start;
      var text;

      if (richNode.domNode.tagName === "BR") {
        text = "\n";
      } else {
        text = " ";
      }

      richNode.text = text;
      richNode.end = start + text.length;
      return richNode;
    }
    /**
     * Processes a single comment node
     */

  }, {
    key: "processOtherNode",
    value: function processOtherNode(richNode) {
      var start = richNode.start;
      richNode.end = start;
      return richNode;
    }
    /**
     * Detects the type of a DOM node
     */

  }, {
    key: "detectDomNodeType",
    value: function detectDomNodeType(domNode) {
      if (domNode.nodeType === Node.ELEMENT_NODE) {
        return 'tag';
      } else if (domNode.nodeType === Node.TEXT_NODE) {
        return 'text';
      } else {
        return 'other';
      }
    }
    /**
     * Creates a rich node.
     *
     * You can override this method in order to add content to
     * the rich text nodes.
     */

  }, {
    key: "createRichNode",
    value: function createRichNode(content) {
      return new _richNode["default"](content);
    }
  }]);

  return NodeWalker;
}();

function walk(node) {
  var NW = new NodeWalker();
  return NW.processDomNode(node);
}

var _default = NodeWalker;
exports["default"] = _default;