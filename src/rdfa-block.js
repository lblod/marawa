/**
 * Represents a logical block, a combination of one or more RichNodes,
 * that share the same semantic meaning (in terms of RDFa as well as in terms of display).
 *
 * An RDFa block has the following properties:
 * - start, end, region: boundaries of the RDFa block
 * - text: plain text of the region
 * - richNodes: array of leaf richNodes that are combined in this RDFa block
 * - semanticNode: closest (ancestor) rich node that is a logical block
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
  /**
   * Returns whether the RDFa block (partially) falls in region [start, end]
  */
  isPartiallyOrFullyInRegion([start, end]) {
    if (start == undefined || end == undefined)
      return true;

    return (this.start >= start && this.start <= end)
      || (this.end >= start && this.end <= end)
      || (this.start <= start && end <= this.end);
  }
}

export default RdfaBlock;
