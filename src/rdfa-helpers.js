/**
 * Helpers to process RDFa on DOM nodes
 */
import { defaultPrefixes } from './support/rdfa-config';
import RdfaAttributes from './rdfa-attributes';

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
  const rdfaAttributes = new RdfaAttributes(richNode.domNode, parentPrefixes);

  if (!rdfaAttributes.isEmpty) {
    richNode.rdfaPrefixes = rdfaAttributes.currentPrefixes;
    richNode.rdfaAttributes = rdfaAttributes;
    richNode.rdfaContext = [...parentContext, rdfaAttributes];
  } else {
    richNode.rdfaPrefixes = parentPrefixes;
    richNode.rdfaAttributes = null;
    richNode.rdfaContext = parentContext;
  }
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
          console.warn(`No default RDFa prefix defined`, { id: 'rdfa-helpers.missingPrefix' });
        uri = prefixes[''] + uri;
      } else {
        const key = uri.substr(0, i);
        if (prefixes[key] == null)
          console.warn(`No RDFa prefix '${key}' defined`, { id: 'rdfa-helpers.missingPrefix' });
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
  let graph = [];

  let currentScope = null;

  rdfaAttributes.forEach(function(rdfa) {
    let nextScope = null;

    let triples = [];

    if (rdfa['properties'] != null) {
      triples = rdfa['properties'].map( property => { return { predicate: property }; } );
    }

    triples.forEach(function(triple) {
      triple.object = rdfa['content'] || rdfa['resource'] || rdfa['href'] || rdfa['text'];
      triple.datatype = rdfa['datatype'];
    });

    if (rdfa['about'] != null)
      currentScope = rdfa['about'];
    if (!triples.length) {
      if (rdfa['resource'] != null) // resource is set without property/rel/rev
        currentScope = rdfa['resource'];
    } else {
      if (rdfa['resource'] != null) {
        nextScope = rdfa['resource'];
      }
    }

    triples.forEach(function(triple) {
      triple.subject = currentScope;
    });

    let typeofTriples = [];
    if (rdfa['typeof'] != null) {
      typeofTriples = rdfa['typeof'].map(function(type) {
        return {
          // we assume typeof only applies on resource/about of current node. Not of a parent node.
          subject: rdfa['resource'] || rdfa['about'], // create a blank node if subject == null
          predicate: 'a',
          object: type
        };
      });
    }

    graph = [...graph, ...triples, ...typeofTriples];

    // TODO: add support for 'rel' keyword: https://www.w3.org/TR/rdfa-primer/#alternative-for-setting-the-property-rel
    // TODO: add support for 'src' keyword

    // nextScope becomes the subject at the next level
    if (nextScope != null) {
      currentScope = nextScope;
    }
  });

  return graph;
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
  resolvePrefix,
  rdfaAttributesToTriples,
  isFullUri,
  isRelativeUrl
}
