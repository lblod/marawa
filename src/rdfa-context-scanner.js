import { walk, isVoidElement } from './node-walker';
import { enrichWithRdfaProperties, resolvePrefixedAttributes, toTriples } from './rdfa-helpers';
import { set } from './ember-object-mock';
// TODO: Research a way to alter the imports when used in an Ember application

/**
 * Returns whether if range [x, y] (partially) falls in region [start, end]
 *
 * @method isInRange
 *
 * @private
 */
const isInRange = function([x, y], [start, end]) {
  if (start == undefined || end == undefined)
    return true;

  return (x >= start && x <= end)
      || (y >= start && y <= end)
      || (x <= start && end <= y);
};


/**
 * Scanner of the RDFa context of DOM nodes
 *
 * @module editor-core
 * @class RdfaContextScanner
 * @constructor
 */
class RdfaContextScanner {
  /**
   * Analyse the RDFa contexts of a specific region in a text
   *
   * @method analyse
   *
   * @param {Node} domNode Root DOM node containing the text
   * @param {[number,number]} region Region in the text for which RDFa contexts must be calculated.
   *                                 Full region if start or end is undefined.
   *
   * @return {Array} Array of contexts mapping text parts from the specified region to their RDFa context
   *               // TODO what is the current interface?
   *               A context element consists of:
   *               - region: Region in the text on which the RDFa context applies
   *               - context: RDFa context (an array of triple objects) of the region
   *               - text: Plain text of the region
   *
   * @public
   */
  analyse(domNode, [start, end] = []) {
    if (domNode == null || start < 0 || end < start)
      return [];

    const richNode = walk(domNode);

    this.calculateRdfaToTop(richNode);
    this.calculateInnerRdfa(richNode);

    const rdfaBlocks = this.flattenRdfaTree(richNode, [start, end]);

    let resultingBlocks;

    // TODO is this still required since we already take start/end into account in flattenRdfaTree
    if (start && end) {
      resultingBlocks =
        rdfaBlocks.filter( (b) => isInRange([b.start, b.end], [start, end]) );
    } else {
      resultingBlocks = rdfaBlocks;
    }

    return resultingBlocks.map( (b) => {
      // make sure contexts have a region
      set( b, 'region', [b.start, b.end] );
      return b;
    } );
  }

  /**
   * Calculate the RDFa context from a given node to the top of the document
   * I.e. resolve prefixes and augment RDFa context based on the prefixes and RDFa context of its parent
   *
   * @method calculateRdfaToTop
   *
   * @param {RichNode} richNode Rich node to start from
   *
   * @private
   */
  calculateRdfaToTop(startNode) {
    const richNodesOnPath = [];

    for(let richNode = startNode; richNode.parent; richNode = richNode.parent) {
      richNodesOnPath.push(richNode);
    }

    richNodesOnPath.reverse(); // get rich nodes from top to bottom

    richNodesOnPath.forEach((richNode, i) => {
      if (i == 0) {
        enrichWithRdfaProperties(richNode);
      } else {
        const parent = richNode[i-1];
        enrichWithRdfaProperties(richNode, parent.rdfaContext, parent.rdfaPrefixes);
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
   *
   * @private
   */
  calculateInnerRdfa(richNode) {
    (richNode.children || []).forEach((child) => {
      enrichWithRdfaProperties(child, richNode.rdfaContext, richNode.rdfaPrefixes);
      this.calculateInnerRdfa(child);
    });
  }

  /**
   * Flatten and reduce a rich node RDFa tree to an array of rich leaf nodes.
   * Only the text nodes falling in a specified region are returned.
   *
   * It is the goal to yield a flattened tree of RDFa statements.
   * Combining as many of them as possible.  Some examples on how we
   * intend to combine nodes will explain the intent better than a
   * long description.  The following cases represent a DOM tree.  The
   * o represents a tag which doesn't contain semantic content and
   * which in itself isn't rendered as a block.  The l represents a
   * logical block, these are blocks which render as a visually
   * separate block in html or which contain semantic content.  When
   * moving upward, we want to combine these nodes in order.  When
   * combining the nodes, we represent a non-mergeable logical block
   * by putting parens around it.
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
   * @return {Array} Array of rich leaf text nodes falling in a specified region
   *
   * @private
   */
  flattenRdfaTree(richNode, [start, end]=[]) {
    // The desired outcome for a given [start, end] consists of all
    // lowest level logical blocks which overlap with [start, end].
    // full contents of all lowest-level logical blocks which
    // (partially) overlap with [start, end].  As such, we need to
    // detect and share the current highest-level logical block, and
    // keep yielding contents until we find a logical block that does
    // not overlap anymore.

    const preprocessNode = (richNode) => {
      set(richNode, 'isLogicalBlock', this.nodeIsLogicalBlock( richNode ));
    };

    const processChildNode = (node) => {
      // All blocks may contain meaningful content.  If the content is
      // a logical block then we should check its region for overlap.
      // If it is not a logical block, it may or may not contain
      // useful info so we should scan it just to be sure.
      const shouldScanFurther = isInRange( [node.start, node.end], [start, end] )
            || ! this.nodeIsLogicalBlock( node );
      if ( shouldScanFurther ) {
        this.flattenRdfaTree( node, [ start, end ] );
      } else {
        set(node, 'isLogicalBlock', false);
        set(node, 'isRdfaBlock', false);
        set(node, 'rdfaBlockList', []);
      }
    };

    // ran when we're finished processing all child nodes
    const finishChildSteps = (node) => {
      let rdfaBlockList = [];
      if ( ! this.nodeIsLogicalBlock( node )
           || isInRange([node.start, node.end], [start, end]) ) {
        // Filter out logical blocks of which the range does not
        // overlap.
        rdfaBlockList = this.getRdfaBlockList( node );
      } else {
        rdfaBlockList = [];
      }

      set( node, 'rdfaBlocks', rdfaBlockList );
    };

    preprocessNode(richNode);
    (richNode.children || []).map( (node) => processChildNode(node) );
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
  getRdfaBlockList( richNode ){
    switch( richNode.type ){
      case "text":
        return this.createRdfaBlocksFromText( richNode );
      case "tag":
        if( isVoidElement( richNode.domNode ) ) {
          return this.createRdfaBlocksFromuText( richNode );
        } else {
          return this.createRdfaBlocksFromTag( richNode );
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
  createRdfaBlocksFromText( richNode ){
    return [{
      start: richNode.start,
      end: richNode.end || richNode.start,
      region: richNode.region,
      text: richNode.text,
      context: toTriples(richNode.rdfaContext),
      richNode: [richNode], // TODO richNodes would be a better name
      isRdfaBlock: richNode.isLogicalBlock ,
      semanticNode: ( richNode.isLogicalBlock && richNode )
    }];
  }

  /**
   * Returns an array of rdfaBlock items for the supplied richNode,
   * assuming that is a tag node.
   *
   * The idea is to first get the rdfaBlocks from each of our children
   * and put them in a flat list.  We only need to check the first and
   * last children for combination, but we're lazy and try to combine
   * each of them.  In step three we clone this list, so we don't
   * overwrite what was previously used (handy for debugging).  Then
   * we possible overwrite the isRdfaBlock property, based on the
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
  createRdfaBlocksFromTag( richNode ){
    // flatten our children
    const flatRdfaChildren =
      (richNode.children || [])
        .map( (child) => child.rdfaBlocks || [] )
        .reduce( (a,b) => a.concat(b), []);

    // map & combine children when possible
    const combinedChildren = this.combineRdfaBlocks( flatRdfaChildren );

    // clone children
    // const clonedChildren = combinedChildren.map( this.shallowClone );

    // override isRdfaBlock on each child, based on current node
    // set ourselves as the current first richNode in the blocks's rich nodes
    if( richNode.isLogicalBlock  )
      combinedChildren.forEach( (child) => {
        set( child, 'isRdfaBlock', true );
        if ( ! child.semanticNode  )
          set( child, 'semanticNode', richNode );
      });

    // return new map
    return combinedChildren;
  }

  /**
   * Combines an array of rdfa blocks based on their properties.
   *
   * @method combineRdfaBlocks
   *
   * @param {[RichNode]} nodes Set of rich nodes for which we'll
   * combine the rdfaBlocks.
   *
   * @return {[RdfaBlock]} Array of rdfaBlocks after the combineable
   * ones were combined.
   *
   * @private
   */
  combineRdfaBlocks( nodes ){
    if( nodes.length <= 1 ) {
      return nodes;
    } else {
      // walk front-to back, build result in reverse order
      let firstElement, restElements;
      [ firstElement, ...restElements ] = nodes;
      const combinedElements =
        restElements.reduce( ([pastElement, ...rest], newElement) => {
          if( ( pastElement.isRdfaBlock || newElement.isRdfaBlock )
              || pastElement.end != newElement.start )
            return [newElement, pastElement, ...rest];
          else {
            let [ start, end ] = [ pastElement.start, newElement.end ];
            const combinedRichNodes = [ pastElement, newElement ]
              .map( (e) => e.richNode )
              .reduce( (a,b) => a.concat(b), [] );

            const combinedRdfaNode = {
              region: [ start, end ],
              start: start,
              end: end,
              text: pastElement.text + newElement.text, // TODO: verify neither is undefined?
              context: pastElement.context ,  // pick any of the two
              richNode: combinedRichNodes,
              isRdfaBlock: false // these two nodes are text nodes
            };
            return [combinedRdfaNode, ...rest];
          }
        }, [firstElement] );
      // reverse generated array
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
  shallowClone( rdfaBlock ) {
    return Object.assign( {}, rdfaBlock );
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
  nodeIsLogicalBlock(richNode) {
    if( richNode.rdfaAttributes ) {
      return true;
    } else if( richNode.type != "tag" ) {
      return false;
    } else {
      return this.isDisplayedAsBlock( richNode );
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
  isDisplayedAsBlock(richNode) {
    if( richNode.type != 'tag' )
      return false;

    if( typeof window !== "undefined" ) {
      const domNode = richNode.domNode;
      const displayStyle = window.getComputedStyle(domNode)['display'];
      return displayStyle == 'block' || displayStyle == 'list-item';
    } else {
      return false;
    }
  }
}

/**
 * Shorthand form for creating a new RdfaContextScanner and analysing the supplied node with it.
 *
 * @method analyse
 *
 * @param {Node} node Node to be analysed
 *
 * @return {[RichNode]} RichNodes containing the analysed node
 */
function analyse(node, range){
  return (new RdfaContextScanner()).analyse( node, range );
}

/**
 * @deprecated
*/
function resolvePrefixes() {
  console.warn(`[DEPRECATED] Method 'resolvePrefixes' from rdfa-context-scanner is deprecated. Use 'resolvePrefixedAttributes' from rdfa-helpers instead.`);
  resolvePrefixedAttributes(...arguments);
}

export default RdfaContextScanner;
export { analyse , resolvePrefixes };
