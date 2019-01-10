const {get, set} = require('./ember-object-mock');

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
  region() {
    const start = get(this, 'start');
    const end = get(this, 'end');

    return [ start, end || start ];
  }
  length() {
    const end = get(this, 'end') || 0;
    const start = get(this, 'start') || 0;
    const diff = Math.max( 0, end - start );
    return diff;
  }
  isInRegion(start, end) {
    return get(this, 'start') >= start && get(this, 'end') <= end;
  }
  isPartiallyInRegion(start, end) {
    return ( get(this, 'start') >= start && get(this, 'start') < end )
      || ( get(this, 'end') > start && get(this, 'end') <= end );
  }
}

exports.default = RichNode;
