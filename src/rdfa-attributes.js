import { rdfaKeywords, defaultPrefixes } from './support/rdfa-config';
import { resolvePrefix } from './rdfa-helpers';

/**
 * Represents the RDFa attributes set on a node
 *
 * Note: The attributes of an existing RdfaAttributes object should not be updated.
 * A new RdfaAttributes object should be created in that case.
 *
 * TODO: add support for language
 *
 * @class RdfaAttributes
 * @constructor
*/
class RdfaAttributes {
  typeof;
  properties;
  rel;
  rev;
  src;
  href;
  resource;
  about;
  datatype;
  text;
  documentUrl;
  currentPrefixes;

  constructor(domNode, knownPrefixes = defaultPrefixes, options = {}) {
    if (domNode && domNode.getAttribute) {
      for (let key of rdfaKeywords) {
        this[`_${key}`] = domNode.getAttribute(key);
      };
      this.text = domNode.textContent;
      this.documentUrl = options.documentUrl;

      this.setResolvedAttributes(knownPrefixes);
    }
  }

  get vocab() {
    return this._vocab;
  }

  get content() {
    return this._content;
  }

  get property() {
    console.warn(`[DEPRECATED] Property 'property' of RdfaAttributes is deprecated. Please use 'properties' instead.`);
    return this.properties && this.properties.length && this.properties[0];
  }

  /**
   * Returns whether an RDFa attribute is set
   */
  get isEmpty() {
    return rdfaKeywords.find( key => this[`_${key}`] != null ) == null;
  }

  get language() {
    if (this["_xml:lang"] || this._lang) {
      return this["_xml:lang"] || this._lang;
    }
    else {
      return null;
    }
  }

  /**
   * @method setResolvedAttributes
   * @private
   *
   * The RdfaAttributes object stores the RDFa attributes in several formats:
   * _attribute (e.g. _property): the raw value as set on the node. Null if not set.
   * _attributes (e.g. _properties): an array of values for attributes that are multivalued. Null if not set.
   * attribute (e.g. properties): (array of) values with resolved prefixes
  */
  setResolvedAttributes(knownPrefixes) {
    this.currentPrefixes = Object.assign({}, knownPrefixes);
    this.splitMultivalueAttributes();
    this.updateCurrentPrefixes();
    this.resolvePrefixedAttributes();
  }

  /**
   * @method splitMultivalueAttributes
   * @private
  */
  splitMultivalueAttributes() {
    const keywords = {
      property: 'properties',
      typeof: 'typeof',
      rel: 'rel',
      rev: 'rev'
    };

    for ( let key in keywords ) {
      const listKey = `_${keywords[key]}`;
      const value = this[`_${key}`];
      if ( value != null ) {
        this[listKey] = value.split(' '); // TODO support splitting on multiple spaces
      } else {
        this[listKey] = null;
      }
    }

    if (this._prefix != null) {
      this.prefixes = parsePrefixString(this._prefix);
    } else {
      this.prefixes = null;
    }
  }

  /**
   * @private
   * @method updateCurrentPrefixes
   */
  updateCurrentPrefixes() {
    if (this.vocab != null) {
      this.currentPrefixes[''] = this.vocab;
    }
    if (this.prefixes != null) {
      for (let key in this.prefixes) {
        this.currentPrefixes[key] = this.prefixes[key];
      }
    }
  }

  /**
   * @private
   * @method resolvePrefixedAttributes
   */
  resolvePrefixedAttributes() {
    const prefixableRdfaKeywords = [
      'typeof',
      'properties',
      'rel',
      'rev',
      'src',
      'href',
      'resource',
      'about',
      'datatype'
    ];

    prefixableRdfaKeywords.forEach( (key) => {
      if (this[`_${key}`] != null) {
        this[key] = resolvePrefix(key, this[`_${key}`], this.currentPrefixes, this.documentUrl);
      }
    });
  }

}

/**
 * Parses an RDFa prefix string and returns a map of prefixes to URIs.
 * According to the RDFa spec prefixes must be seperated by exactly one space.
 *
 * @method parsePrefixString
 * @param string prefixString Space-seperated string of RDFa prefixes
 * @return Object Map of prefixes to their URI
*/
const parsePrefixString = (prefixString) => {
  const parts = prefixString.split(' ');
  let prefixes = {};
  // parts is an array like ['mu:', 'http://mu.semte.ch...', 'ext:', 'http://...', ...]
  // transform to an object like { mu: 'http://mu.semte.ch...', ext: 'http://...', ... }
  for (let i = 0; i < parts.length; i = i + 2) {
    const key = parts[i].substr(0, parts[i].length - 1);
    prefixes[key] = parts[i + 1];
  }

  return prefixes;
};

export default RdfaAttributes;
export { parsePrefixString }
