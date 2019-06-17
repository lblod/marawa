import { positionInRange } from './range-helpers';

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
  isInRegion(start, end) {
    return start <= this.start && this.end <= end;
  }
  isPartiallyInRegion(start, end) {
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
  partiallyOrFullyContainsRegion([start,end]) {
    return (positionInRange(start, this.region) || positionInRange(end, this.region));
  }
  containsRegion(start, end) {
    return this.start <= start && end <= this.end;
  }
  isAncestorOf(richNode) {
    let node = richNode;

    while (node) {
      if ( this.domNode == node.domNode )
        return true;

      node = node.parent;
    }

    return false;
  }
  isDescendentOf(richNode) {
    return richNode.isAncestorOf(this);
  }
}

export default RichNode;
