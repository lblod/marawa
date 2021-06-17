"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enrichWithRdfaProperties = enrichWithRdfaProperties;
exports.resolvePrefix = resolvePrefix;
exports.rdfaAttributesToTriples = rdfaAttributesToTriples;
exports.isFullUri = isFullUri;
exports.isPrefixedUri = isPrefixedUri;

var _rdfaConfig = require("./support/rdfa-config");

var _rdfaAttributes = _interopRequireDefault(require("./rdfa-attributes"));

var _triple = _interopRequireDefault(require("./triple"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
function enrichWithRdfaProperties(richNode) {
  var parentContext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var parentPrefixes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _rdfaConfig.defaultPrefixes;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var rdfaAttributes = new _rdfaAttributes["default"](richNode.domNode, parentPrefixes, options);

  if (!rdfaAttributes.isEmpty) {
    richNode.rdfaPrefixes = rdfaAttributes.currentPrefixes;
    richNode.rdfaAttributes = rdfaAttributes;
    richNode.rdfaContext = [].concat(_toConsumableArray(parentContext), [rdfaAttributes]);
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
 * TODO: likely a lot of cases are missed here, and the spec should be studied carefully.
 *
 * @method resolvePrefix
 *
 * @param {string} the name of the attribute where the URI(s) are matched
 * @param {string|Array} uri An (array of) URI(s) to resolve
 * @param {Object} prefixes A map of known prefixes
 * @param {string} [OPTIONAL] the URL of the document where potentialy may be resolve against
 *
 * @return {string} The resolved URI
 */


function resolvePrefix(attribute, uri, prefixes, documentUrl) {
  var mayUseDefaultVocab = function mayUseDefaultVocab(attribute) {
    //TODO: 'properties' should be 'property', but it has big impact if we change the name (hence the weird mapping)
    var mappedName = attribute == 'properties' ? 'property' : attribute;
    return ['typeof', 'property', 'rel', 'rev', 'datatype'].includes(mappedName);
  };

  var resolve = function resolve(uri) {
    //Full URI wins
    if (isFullUri(uri)) {
      return uri;
    } //Prefixed URI or may resolve with default vocab
    else if (isPrefixedUri(uri) || mayUseDefaultVocab(attribute)) {
        return tryResolveURIAgainstPrefixes(uri, prefixes);
      } //Hence we assume it will be a path that needs be resolved
      else {
          //should be [ 'resoure', 'href', 'src', 'about' ]
          return tryResolvePathToURI(uri, documentUrl);
        }
  };

  if (Array.isArray(uri)) {
    return uri.map(function (u) {
      return resolve(u);
    });
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
  var graph = [];
  var currentScope = null; // the object of a triple generated by the usage of 'rel'/'rev' may be on a deeper level
  // hence we need to keep track of the outstanding rel-triples across iterations

  var outstandingRelTriples = [];
  rdfaAttributes.forEach(function (rdfa) {
    var nextScope = null; // subject of the next iteration
    // Determine predicates

    var propertyTriples = (rdfa['properties'] || []).map(function (property) {
      return {
        predicate: property
      };
    });
    var relTriples = (rdfa['rel'] || []).map(function (rel) {
      return {
        predicate: rel
      };
    });
    var revTriples = (rdfa['rev'] || []).map(function (rev) {
      return {
        predicate: "^".concat(rev)
      };
    });
    relTriples = [].concat(_toConsumableArray(relTriples), _toConsumableArray(revTriples)); // Determine subject

    if (rdfa['about'] != null) {
      currentScope = rdfa['about'];

      if (outstandingRelTriples.length) {
        var rel = outstandingRelTriples[0].predicate;
        console.warn("Subject changes to ".concat(currentScope, ". No object found for predicate ").concat(rel, " set via 'rel/rev'. These incomplete triples will be discarded."));
        outstandingRelTriples = [];
      }
    }

    if (!propertyTriples.length && !relTriples.length) {
      if (rdfa['resource'] != null) {
        // resource is set without property/rel/rev
        currentScope = rdfa['resource'];
      }
    } else {
      if (rdfa['resource'] != null) {
        nextScope = rdfa['resource'];
      }
    }

    [].concat(_toConsumableArray(propertyTriples), _toConsumableArray(relTriples)).forEach(function (triple) {
      return triple.subject = currentScope;
    }); // Determine object and datatype

    propertyTriples.forEach(function (triple) {
      triple.object = rdfa['content'] || rdfa['resource'] || rdfa['href'] || rdfa['src'] || rdfa['text'];

      if (rdfa['resource'] || rdfa['href'] || rdfa['src']) {
        triple.datatype = 'http://www.w3.org/2000/01/rdf-schema#Resource';
      } else if (rdfa['language']) {
        // language takes precedence over datatype, if a lang is specified it must be a langString
        triple.datatype = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
        triple.language = rdfa['language'];
      } else if (rdfa['datatype']) {
        triple.datatype = rdfa['datatype'];
      }
    });
    graph = [].concat(_toConsumableArray(graph), _toConsumableArray(propertyTriples));
    outstandingRelTriples = [].concat(_toConsumableArray(outstandingRelTriples), _toConsumableArray(relTriples));
    var object = rdfa['resource'] || rdfa['href'] || rdfa['src']; // rel/rev never considers the textual content of an element as object

    if (object) {
      outstandingRelTriples.forEach(function (triple) {
        triple.object = object;
        triple.datatype = 'http://www.w3.org/2000/01/rdf-schema#Resource';
      });
      graph = [].concat(_toConsumableArray(graph), _toConsumableArray(outstandingRelTriples));
      outstandingRelTriples = [];
    }

    ; // Typeof triples

    var typeofTriples = [];

    if (rdfa['typeof'] != null) {
      typeofTriples = rdfa['typeof'].map(function (type) {
        return {
          // we assume typeof only applies on resource/about of current node. Not of a parent node.
          subject: rdfa['resource'] || rdfa['about'],
          // create a blank node if subject == null
          predicate: 'a',
          object: type,
          datatype: 'http://www.w3.org/2000/01/rdf-schema#Resource'
        };
      });
    }

    graph = [].concat(_toConsumableArray(graph), _toConsumableArray(typeofTriples)); // Next iteration bookkeeping

    if (nextScope != null) {
      currentScope = nextScope;
    }
  }); // reverse inverse triples

  graph = graph.map(function (triple) {
    if (triple.predicate.startsWith('^')) {
      return new _triple["default"]({
        subject: triple.object,
        predicate: triple.predicate.slice(1),
        object: triple.subject,
        datatype: 'http://www.w3.org/2000/01/rdf-schema#Resource'
      });
    } else {
      return new _triple["default"](triple);
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
  return uri.includes('://'); //TODO: won't this break against /foo/bar?param="http://bar/baz"
}
/**
 * Returns whether a given URI is prefixed
 *
 * @method isPrefixedUri
 *
 * @param {string} uri A URI
 *
 * @return {boolean} Whether the given URI is prefixed
 */


function isPrefixedUri(uri) {
  if (isFullUri(uri)) {
    return false;
  } else if (!uri.includes(':')) {
    return false;
  } else {
    //e.g. 'bar:foo' will be split to  'bar:'
    var potentialPrefix = uri.split(':')[0] + ':'; //see https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#Definition (defintion of sheme)
    //see https://en.wikipedia.org/wiki/CURIE

    return /^\[?[a-z][a-z|\d|\.|\+|\-]*:$/i.test(potentialPrefix);
  }
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


function tryResolvePathToURI(path, documentUrl) {
  if (documentUrl) {
    return new URL(path, documentUrl).toString();
  } else {
    console.warn('Unable to expand ' + path, {
      id: 'rdfa-helpers.tryResolvePathToURI'
    });
    return path; //TODO: probably we should do better
  }
}
/**
 * Tries to resolve the URI against list of prefixes or default vocabulary
 *
 * @method tryResolveURIAgainstPrefixes
 *
 * @param {string} uri A URI or CURIE (not safe CURIE (TODO))
 * @param {Object} prefixes A map of known prefixes
 *
 * @return {string} The resolved URI (if possible)
 *
 */


function tryResolveURIAgainstPrefixes(uri, prefixes) {
  //Try expanding the uri
  var i = uri.indexOf(':');

  if (i < 0) {
    // no prefix defined. Use default.
    if (prefixes[''] == null) {
      console.warn('No default RDFa prefix defined', {
        id: 'rdfa-helpers.expandPrefixedUri'
      });
      return uri;
    } else {
      return prefixes[''] + uri;
    }
  } else {
    var key = uri.substr(0, i);

    if (prefixes[key] == null) {
      console.warn('No RDFa prefix \'' + key + '\' defined', {
        id: 'rdfa-helpers.expandPrefixedUri'
      });
      return uri;
    } else {
      return prefixes[key] + uri.substr(i + 1);
    }
  }
}