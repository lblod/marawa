/**
 * Helpers to process RDFa on DOM nodes
 */

import { rdfaKeywords, prefixableRdfaKeywords, defaultPrefixes } from './support/rdfa-config';
import { set } from './ember-object-mock';

/**
 * Enriches a rich node with semantic properties:
 * - rdfaPrefixes: map of prefixes at the current node
 * - rdfaAttributes: resolved (non-prefixed) RDFa attributes set on the node
 * - rdfaContext: array of rdfaAttributes from the top to the current node
 *
 * @method enrichWithRdfaProperties
 *
 * @param {RichNode} richNode Rich node to expand the RDFa from
 * @param {Array} parentContext RDFa context (array of rdfaAttributes) of the node's parent
 * @param {Object} parentPrefixes RDFa prefixes defined at the node's parent level
 */
function enrichWithRdfaProperties(richNode, parentContext = [], parentPrefixes = defaultPrefixes) {
  const rdfaAttributes = getRdfaAttributes(richNode.domNode);

  if (rdfaAttributes) {
    const prefixes = mergePrefixes(parentPrefixes, rdfaAttributes);
    const resolvedRdfaAttributes = resolvePrefixedAttributes(rdfaAttributes, prefixes);
    set(richNode, 'rdfaPrefixes', prefixes);
    set(richNode, 'rdfaAttributes', resolvedRdfaAttributes);
    set(richNode, 'rdfaContext', parentContext.concat(resolvedRdfaAttributes));
  } else {
    set(richNode, 'rdfaPrefixes', parentPrefixes);      
    set(richNode, 'rdfaAttributes', null);
    set(richNode, 'rdfaContext', parentContext);
  }
}

/**
 * Get the RDFa attributes of a DOM node. Null if no RDFa attributes are set.
 * Supported RDFa attributes are configured in ./support/rdfa-config
 *
 * @method getRdfaAttributes
 *
 * @param {Node} domNode DOM node to get the RDFa attributes from
 *
 * @return {Object} Map of RDFa attributes key-value pairs
 */
function getRdfaAttributes(domNode) {
  if (domNode && domNode.getAttribute) {
    const rdfaAttributes = {};

    rdfaKeywords.forEach(function(key) {
      rdfaAttributes[key] = domNode.getAttribute(key);
    });

    if (rdfaAttributes['typeof'] != null)
      rdfaAttributes['typeof'] = rdfaAttributes['typeof'].split(' ');

    rdfaAttributes['text'] = domNode.textContent;    

    const isEmpty = function(rdfaAttributes) {
      return rdfaKeywords
        .map( (key) => rdfaAttributes[key] == null )
        .reduce( (a,b) => a && b );
    };
    
    return isEmpty(rdfaAttributes) ? null : rdfaAttributes;
  } else {
    return null;
  }
}

/**
 * Create a map of RDFa prefixes by merging an existing map of RDFa prefixes with new RDFa attributes
 *
 * @method mergePrefixes
 *
 * @param {Object} prefixes An map of RDFa prefixes
 * @param {Object} rdfAttributes An RDFa attributes object
 *
 * @return {Object} An new map of RDFa prefixes
 */
function mergePrefixes(prefixes, rdfaAttributes) {
  const mergedPrefixes = Object.assign({}, prefixes);

  if (rdfaAttributes && rdfaAttributes['vocab'] != null) {
    mergedPrefixes[''] = rdfaAttributes['vocab'];
  }
  if (rdfaAttributes && rdfaAttributes['prefix'] != null) {
    const parts = rdfaAttributes['prefix'].split(" ");
    for(let i = 0; i < parts.length; i = i + 2) {
      const key = parts[i].substr(0, parts[i].length - 1);
      mergedPrefixes[key] = parts[i + 1];
    }
  }

  return mergedPrefixes;
}


/**
 * Resolves the URIs in an RDFa attributes object with the correct prefix
 * based on a set of known prefixes.
 *
 * @method resolvePrefixedAttributes
 *
 * @param {Object} rdfaAttributes An object of RDFa attributes
 * @param {Object} prefixes A map of known prefixes
 *
 * @return {Object} A new RDFa attributes object containing resolved URIs
 */
function resolvePrefixedAttributes(rdfaAttributes, prefixes) {
  const clonedAttributes = Object.assign({}, rdfaAttributes);
  prefixableRdfaKeywords.forEach( (key) => {
    if (clonedAttributes[key] != null)
      clonedAttributes[key] = resolvePrefix(clonedAttributes[key], prefixes);
  });
  return clonedAttributes;
}

/**
 * Resolves a given (array of) URI(s) with the correct prefix (if it's prefixed)
 * based on a set of known prefixes.
 *
 * @method resolvePrefix
 *
 * @param {string|Array} uri An (array of) URI(s) to resolve
 * @param {Object} prefixes A map of known prefixes
 *
 * @return {string} The resolved URI
 */
function resolvePrefix(uri, prefixes) {
  const resolve = (uri) => {
    if (isFullUri(uri) || isRelativeUrl(uri)) {
      return uri;
    } else {
      const i = uri.indexOf(':');

      if (i < 0) { // no prefix defined. Use default.
        if (prefixes[''] == null)
          console.warn(`No default RDFa prefix defined`, { id: 'rdfa.missingPrefix' });
        uri = prefixes[''] + uri;
      } else {
        const key = uri.substr(0, i);
        if (prefixes[key] == null)
          console.warn(`No RDFa prefix '${key}' defined`, { id: 'rdfa.missingPrefix' });
        uri = prefixes[key] + uri.substr(i + 1);
      }

      return uri;
    }
  };

  if (Array.isArray(uri)) {
    return uri.map( u => resolve(u));
  } else {
    return resolve(uri);
  }
}

/**
 * Transforms an array of RDFa attribute objects to an array of triples.
 * A triple is an object consisting of a subject, predicate and object.
 *
 * @method rdfaAttributesToTriples
 *
 * @param {Array} rdfaAttributes An array of RDFa attribute objects
 *
 * @returns {Array} An array of triple objects
 */
function rdfaAttributesToTriples(rdfaAttributes) {
  const triples = [];

  let currentScope = null;

  rdfaAttributes.forEach(function(rdfa) {
    let nextScope = null;

    const triple = {};

    if (rdfa['about'] != null)
      currentScope = rdfa['about'];

    if (rdfa['content'] != null)
      triple.object = rdfa['content'];
    if (rdfa['datatype'] != null)
      triple.datatype = rdfa['datatype'];

    if (rdfa['property'] != null) {
      triple.predicate = rdfa['property'];

      if (rdfa['href'] != null)
        triple.object = rdfa['href'];

      if (rdfa['resource'] != null) {
        triple.object = rdfa['resource'];
        nextScope = rdfa['resource'];
      }

      if (triple.object == null)
        triple.object = rdfa.text;
    } else {
      if (rdfa['resource'] != null)
        currentScope = rdfa['resource'];
    }

    triple.subject = currentScope;
    if (triple.predicate != null) {
      triples.push(triple);
    }

    if (rdfa['typeof'] != null) {
      rdfa['typeof'].forEach(function(type) {
        triples.push({
          subject: rdfa['resource'], // create a blank node if resource == null
          predicate: 'a',
          object: type
        });
      });
    }

    // TODO: add support for 'rel' keyword: https://www.w3.org/TR/rdfa-primer/#alternative-for-setting-the-property-rel
    // TODO: add support for 'src' keyword

    // nextScope becomes the subject at the next level
    if (nextScope != null) {
      currentScope = nextScope;
    }
  });

  return triples;
}

/**
 * Returns whether a given URI is a full URI.
 *
 * @method isFullUri
 *
 * @param {string} uri A URI
 *
 * @return {boolean} Whether the given URI is a full URI.
 */
function isFullUri(uri) {
  return uri.includes('://');
}

/**
 * Returns whether a given URI is a relative URI.
 *
 * @method isRelativeUrl
 *
 * @param {string} uri A URI
 *
 * @return {boolean} Whether the given URI is a relative URI.
 */
function isRelativeUrl(uri) {
  return uri.startsWith('#') || uri.startsWith('/') || uri.startsWith('./') || uri.startsWith('../');
}

export {
  enrichWithRdfaProperties,
  getRdfaAttributes,
  mergePrefixes,  
  resolvePrefixedAttributes,
  resolvePrefix,
  rdfaAttributesToTriples,  
  isFullUri,
  isRelativeUrl
}
