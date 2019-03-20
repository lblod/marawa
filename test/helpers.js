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

export { makeDom, makeDomElement, analyseElement };
