import jsdom from 'jsdom';
import { analyse } from '../src/rdfa-context-scanner';

/**
 * Calls JSDOM to create a new DOM tree.
 *
 * Use dom.window.document.querySelector to get contents from the DOM
 * tree.
 */
function makeDom(string) {
  return new jsdom.JSDOM(string);
}

/**
 * Makes it easy to retrieve a parsed DOM element.
 *
 * - string string The HTML of the element you want returned.  Note
 *   that this will be placed inside of a div, hence the elements must
 *   be valid within that.
 *
 * - id string DOM ID of the wrapper element.  Override if this may
 *   overlap with the identifiers in your snippet
 */
function makeDomElement( string, id = "wrapperDomElement" ) {
  const dom = makeDom( `<div id="${id}">${string}</div>` );
  const wrapper = dom.window.document.querySelector(`#${id}` );
  return wrapper.childNodes[0];
}

/**
 * Creates a DOM element from the supplied string, using
 * #makeDomElement and parses it using #analyse.
 *
 * - string string HTML string to be turned into DOM and parsed.
 *
 * - id string DOM ID of the wrapper element.  Override if this may
 *   overlap with the identifiers in your snippet
 */

function analyseElement(string, id="wrapperDomElement") {
  return analyse( makeDomElement( string, id ) );
}

function tripleAppearsInArray(arrayOfTriples, triple) {
  for(let i = 0; i < arrayOfTriples.length; i++) {
    const tripleInArray = arrayOfTriples[i];
    if(isTripleEqual(tripleInArray, triple)) {
      return true;
    }
  }
  return false;
}

function isTripleEqual(triple1, triple2) {
  if(triple2.language && triple1.language !== triple2.language) return false;
  if(triple2.datatype && triple1.datatype !== triple2.datatype) return false;
  return triple1.subject === triple2.subject && triple1.predicate === triple2.predicate && triple1.object === triple2.object;
}

export { makeDom, makeDomElement, analyseElement, tripleAppearsInArray };
