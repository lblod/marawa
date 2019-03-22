import RichNode from './rich-node';
import {set} from './ember-object-mock';

if( ! Node ) {
  var Node = {
    // Node types consumed from https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
    ELEMENT_NODE: 1, // 	An Element node like <p> or <div>.
    TEXT_NODE: 3, // 	The actual Text inside an Element or Attr.
    CDATA_SECTION_NODE: 4, // 	A CDATASection, such as <!CDATA[[ … ]]>.
    PROCESSING_INSTRUCTION_NODE: 7, // 	A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
    COMMENT_NODE: 8, // 	A Comment node, such as <!-- … -->.
    DOCUMENT_NODE: 9, // 	A Document node.
    DOCUMENT_TYPE_NODE: 10, // 	A DocumentType node, such as <!DOCTYPE html>.
    DOCUMENT_FRAGMENT_NODE: 11, // 	A DocumentFragment node.
  };
}

/**
 * DOM tree walker producing RichNodes
 *
 * @module editor-core
 * @class NodeWalker
 * @constructor
 */
class NodeWalker {
  /**
   * Processes a single dom node.
   */
  processDomNode( domNode, parentNode, start = 0 ) {
    const myStart = (parentNode && parentNode.end) || start;
    const richNode = this.createRichNode({
      domNode: domNode,
      parent: parentNode,
      start: myStart,
      end: myStart,
      type: this.detectDomNodeType( domNode )
    });

    // For tags, recursively analyse the children
    if (richNode.type === 'tag') {
      return this.processTagNode( richNode );
    }
    // For text nodes, add the content and update the index
    else if (richNode.type === 'text') {
      return this.processTextNode( richNode );
    }
    // For comment nodes, set update the index
    else { // if (richNode.type == 'other')
      return this.processOtherNode( richNode );
    }
  }

  /**
   * Called when stepping into a child Dom node
   */
  stepInDomNode( richNode, childDomNode ) {
    return this.processDomNode( childDomNode, richNode );
  }

  /**
   * Steps from one (or no) child node to the next.
   */
  stepNextDomNode( richNode , nextDomChildren ) {
    // what if we have no children?  this is broken
    const [ firstChild, ...nextChildren ] = nextDomChildren;
    const richChildNode = this.stepInDomNode( richNode, firstChild );
    set( richNode, 'end', richChildNode.end );
    if ( nextChildren.length )
      return [ richChildNode, ...this.stepNextDomNode( richNode, nextChildren ) ];
    else
      return [ richChildNode ];
  }

  /**
   * Called when finishing the processing of all the child nodes.
   */
  /*eslint no-unused-vars: ["error", { "args": "none" }]*/
  finishChildSteps( richNode ) {
    return;
  }

  /**
   * Processes a single rich text node
   */
  processTextNode( richNode ) {
    const domNode = richNode.domNode;
    const start = richNode.start;
    let text = domNode.textContent;
    set(richNode, 'text', text);
    set(richNode, 'end', start + text.length);
    return richNode;
  }
  /**
   * Processes a single rich tag
   */
  processTagNode( richNode ) {
    set(richNode, 'end', richNode.start); // end will be updated during run
    const domNode = richNode.domNode;
    const childDomNodes = domNode.childNodes;
    set(richNode, 'children',
        this.stepNextDomNode( richNode, childDomNodes ));
    this.finishChildSteps( richNode );
    return richNode;
  }
  /**
   * Processes a single comment node
   */
  processOtherNode( richNode ) {
    const start = richNode.start;
    set(richNode, 'end', start);
    return richNode;
  }

  /**
   * Detects the type of a DOM node
   */
  detectDomNodeType( domNode ) {
    if (domNode.hasChildNodes && domNode.hasChildNodes()) {
      return 'tag';
    }
    else if (domNode.nodeType != Node.COMMENT_NODE) {
      return 'text';
    }
    else {
      return 'other';
    }
  }

  /**
   * Creates a rich node.
   *
   * You can override this method in order to add content to
   * the rich text nodes.
   */
  createRichNode( content ) {
    return new RichNode( content );
  }
}

function walk(node) {
  const NW = new NodeWalker();
  return NW.processDomNode( node );
}

export default NodeWalker;
export { walk };
