/**
 * Represents an enriched DOM node.
 *
 * The DOM node is available in the 'domNode' property.
 *
 * @module editor-core
 * @class RichNode
 * @constructor
 */
class RichNode {
  constructor(content) {
    for( var key in content )
      this[key] = content[key];
  }
  get region() {
    const start = this.start;
    const end = this.end;

    return [ start, end || start ];
  }
  get length() {
    const end = this.end || 0;
    const start = this.start || 0;
    const diff = Math.max( 0, end - start );
    return diff;
  }
  isInRegion(start, end) {
    return this.start >= start && this.end <= end;
  }
  isPartiallyInRegion(start, end) {
    return ( this.start >= start && this.start < end )
      || ( this.end > start && this.end <= end );
  }
}

export default  RichNode;
