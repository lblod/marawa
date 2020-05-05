import { rdfaAttributesToTriples } from './rdfa-helpers';

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
class RdfaBlock {
  constructor(content) {
    for( var key in content )
      this[key] = content[key];
  }
  get region() {
    const start = this.start;
    const end = this.end;

    return [ start, end || start ];
  }
  set region( [start, end] ){
    this.start = start;
    this.end = end;
  }
  get length() {
    const end = this.end || 0;
    const start = this.start || 0;
    const diff = Math.max( 0, end - start );
    return diff;
  }
  get richNode() {
    console.warn(`[DEPRECATED] Property 'richNode' of RdfaBlock is deprecated. Please use 'richNodes' instead.`);
    return this.richNodes;
  }
  isInRegion([start, end]) {
    return start <= this.start && this.end <= end;
  }
  isPartiallyInRegion([start, end]) {
    return ( this.start >= start && this.start < end )
      || ( this.end > start && this.end <= end );
  }
  isPartiallyOrFullyInRegion([start, end]) {
    if (start == undefined || end == undefined)
      return true;

    return (this.start >= start && this.start <= end)
      || (this.end >= start && this.end <= end)
      || (this.start <= start && end <= this.end);
  }
  containsRegion([start, end]) {
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
  normalizeRegion([relativeStart, relativeEnd]) {
    return [this.start + relativeStart, this.start + relativeEnd];
  }

  /**
   * Returns the RDFa blocks representing the parent of a given block.
   *
   * @method getParentBlocks
   *
   * @param {RdfaBlock} rdfaBlock Block to start from
   *
   * @return {[RdfaBlock]} Array of RDFa blocks representing the RDFa context of the parents of a given rdfa block.
   */
  getParentBlocks(block) {
    let parents = [];
    block.richNodes.forEach(node => {
      parents = parents.concat(block.getParentBlocksFromRichNode(node));
    });
    return parents;
  }

  /**
   * Returns the RDFa blocks representing the parent of a given rich node.
   *
   * @method getParentBlocksFromRichNode
   *
   * @param {RichNode} richNode Rich node to start from
   *
   * @return {[RdfaBlock]} Array of RDFa blocks representing the RDFa context of the parents of a given rich node.
   */
  getParentBlocksFromRichNode(richNode, parentBlocks=[]) {
    if (richNode.rdfaAttributes) {
      const newParentBlock = new RdfaBlock ({
        start: richNode.start,
        end: richNode.end || richNode.start,
        region: richNode.region,
        text: richNode.text,
        context: rdfaAttributesToTriples(richNode.rdfaContext),
        richNodes: [richNode],
        isRdfaBlock: richNode.isLogicalBlock ,
        semanticNode: ( richNode.isLogicalBlock && richNode )
      });
      parentBlocks.push(newParentBlock);
    }

    if (!richNode.parent) {
      return parentBlocks;
    } else {
      return this.getParentBlocksFromRichNode(richNode.parent, parentBlocks);
    }
  }
}

export default RdfaBlock;
