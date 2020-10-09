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
function enrichWithRdfaProperties(richNode, parentContext = [], parentPrefixes = defaultPrefixes, options = {}) {
  const rdfaAttributes = new RdfaAttributes(richNode.domNode, parentPrefixes, options);

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
function resolvePrefix(uri, prefixes, documentUrl) {
  const resolve = (uri) => {
    if (isRelativeUrl(uri) && documentUrl) {
      return (new URL(uri, documentUrl)).toString();
    } else if (isFullUri(uri) || isRelativeUrl(uri)) {
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
 * Optionally, a triple can contain a datatype.
 * In case object is an IRI, datatype is set to rdfs:Resource.
 * In case object is a literal, dataype is set to the RDFa attributes datatype
 * and null if no datatype is set in the RDFa attributes.
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

  // the object of a triple generated by the usage of 'rel'/'rev' may be on a deeper level
  // hence we need to keep track of the outstanding rel-triples across iterations
  let outstandingRelTriples = [];

  rdfaAttributes.forEach(function(rdfa) {
    let nextScope = null;  // subject of the next iteration

    // Determine predicates

    const propertyTriples = (rdfa['properties'] || []).map( property => { return { predicate: property }; } );
    let relTriples = (rdfa['rel'] || []).map( rel => { return { predicate: rel }; } );
    const revTriples = (rdfa['rev'] || []).map( rev => { return { predicate: `^${rev}` }; } );
    relTriples = [...relTriples, ...revTriples];

    // Determine subject

    if (rdfa['about'] != null) {
      currentScope = rdfa['about'];
      if (outstandingRelTriples.length) {
        const rel = outstandingRelTriples[0].predicate;
        console.warn(`Subject changes to ${currentScope}. No object found for predicate ${rel} set via 'rel/rev'. These incomplete triples will be discarded.`);
        outstandingRelTriples = [];
      }
    }
    if (!propertyTriples.length && !relTriples.length) {
      if (rdfa['resource'] != null) { // resource is set without property/rel/rev
        currentScope = rdfa['resource'];
      }
    } else {
      if (rdfa['resource'] != null) {
        nextScope = rdfa['resource'];
      }
    }

    [...propertyTriples, ...relTriples].forEach(triple => triple.subject = currentScope);


    // Determine object and datatype

    propertyTriples.forEach(function(triple) {
      triple.object = rdfa['content'] || rdfa['resource'] || rdfa['href'] || rdfa['src'] || rdfa['text'];
      if (rdfa['resource'] || rdfa['href'] || rdfa['src'])
        triple.datatype = 'http://www.w3.org/2000/01/rdf-schema#Resource';
      else
        triple.datatype = rdfa['datatype'];
    });

    graph = [...graph, ...propertyTriples];

    outstandingRelTriples = [...outstandingRelTriples, ...relTriples];
    const object = rdfa['resource'] || rdfa['href'] || rdfa['src']; // rel/rev never considers the textual content of an element as object
    if (object) {
      outstandingRelTriples.forEach(triple => {
        triple.object = object;
        triple.datatype = 'http://www.w3.org/2000/01/rdf-schema#Resource';
      });
      graph = [...graph, ...outstandingRelTriples];
      outstandingRelTriples = [];
    };


    // Typeof triples

    let typeofTriples = [];
    if (rdfa['typeof'] != null) {
      typeofTriples = rdfa['typeof'].map(function(type) {
        return {
          // we assume typeof only applies on resource/about of current node. Not of a parent node.
          subject: rdfa['resource'] || rdfa['about'], // create a blank node if subject == null
          predicate: 'a',
          object: type,
          datatype: 'http://www.w3.org/2000/01/rdf-schema#Resource'
        };
      });
    }

    graph = [...graph, ...typeofTriples];

    // Next iteration bookkeeping

    if (nextScope != null) {
      currentScope = nextScope;
    }
  });

  // reverse inverse triples
  graph = graph.map( function(triple) {
    if (triple.predicate.startsWith('^')) {
      return {
        subject: triple.object,
        predicate: triple.predicate.slice(1),
        object: triple.subject
      };
    } else {
      return triple;
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
function isPrefixedUri(uri) {
  if(isFullUri(uri)){
    return false;
  }
  else if(!uri.includes(':')){
    return false;
  }
  else {
    //e.g. 'bar:foo' will be split to  'bar:'
    var potentialPrefix = uri.split(':')[0] + ':';
    //see https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#Definition (defintion of sheme)
    //see https://en.wikipedia.org/wiki/CURIE
    return /^\[?[a-z][a-z|\d|\.|\+|\-]*:$/i.test(potentialPrefix);
  }

/**
 * Tries to resolve a relative path to a full URI
 *
 * @method tryResolvePathToURI
 *
 * @param {string} path The relative part of the URI
 * @param {string} documentUrl [OPTIONAL] the full URL where it should be matched against.
 *
 * @return {string} The resolved URI (if possible)
 */
function tryResolvePathToURI(path, documentUrl){

  if(documentUrl){
    return (new URL(path, documentUrl)).toString();
  }

  else{
    console.warn('Unable to expand ' + path, { id: 'rdfa-helpers.tryResolvePathToURI' } );
    return path; //TODO: probably we should do better
  }

}
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
