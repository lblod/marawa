import { analyse } from '../src/rdfa-context-scanner';
import {tripleAppearsInArray} from './helpers'
import flatten from 'lodash.flatten';
import jsdom from 'jsdom';

var assert = require('assert');

describe( 'Rdfa test suite', function() {
  it( "Test 0001: Predicate establishment with @property", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
          <title>Test 0001</title>
        </head>
        <body>
          <p>This photo was taken by <span class="author" about="photo1.jpg" property="dc:creator">Mark Birbeck</span>.</p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('body');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0001.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 1)
    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg')
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/creator')
    assert.strictEqual(firstTriple.object, 'Mark Birbeck')
  });
  it( "Test 0006: @rel and @rev", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0006</title>
        </head>
        <body>
          <p>
            This photo was taken by
            <a 	about="photo1.jpg" rel="dc:creator" rev="foaf:img"
                href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.
          </p>	
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('body');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0006.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 2)

    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://www.blogger.com/profile/1109404'
    };
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://www.blogger.com/profile/1109404',
      predicate: 'http://xmlns.com/foaf/0.1/img',
      object: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg'
    }
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);
  });
  it( "Test 0007: @rel, @rev, @property, @content", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0007</title>
        </head>
        <body>
          <p>This photo was taken by
            <a 	about="photo1.jpg" property="dc:title"
                content="Portrait of Mark" rel="dc:creator"
                  rev="foaf:img" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.
          </p>	
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('body');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0007.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 3)

    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: 'Portrait of Mark'
    }
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://www.blogger.com/profile/1109404'
    }
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

    const thirdTriple = {
      subject: 'http://www.blogger.com/profile/1109404',
      predicate: 'http://xmlns.com/foaf/0.1/img',
      object: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg'
    }
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true);

  });

  it( "Test 0008: empty string @about", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="cc: http://creativecommons.org/ns#">
        <head>
          <title>Test 0008</title>
        </head>
        <body>
          <p>This document is licensed under a
            <a 	about="" rel="cc:license"
              href="http://creativecommons.org/licenses/by-nc-nd/2.5/">
                Creative Commons
            </a>.
          </p>	
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('body');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0008.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 1)
    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0008.html')
    assert.strictEqual(firstTriple.predicate, 'http://creativecommons.org/ns#license')
    assert.strictEqual(firstTriple.object, 'http://creativecommons.org/licenses/by-nc-nd/2.5/')
  });

  it( "Test 0009: @rev", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0009</title>
            <link about="http://example.org/people#Person1" rel=""
                    rev="foaf:knows" href="http://example.org/people#Person2" />
      
        </head>
        <body>
          <p></p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('head');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0009.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 1)
    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://example.org/people#Person2')
    assert.strictEqual(firstTriple.predicate, 'http://xmlns.com/foaf/0.1/knows')
    assert.strictEqual(firstTriple.object, 'http://example.org/people#Person1')
  });

  it( "Test 0010: @rel, @rev, @href", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0010</title>
            <link about="http://example.org/people#Person1"
                rel="foaf:knows" rev="foaf:knows" href="http://example.org/people#Person2" />
        </head>
        <body>
          <p></p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0010.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 2)
    
    const firstTriple = {
      subject: 'http://example.org/people#Person1',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://example.org/people#Person2'
    }
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://example.org/people#Person2',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://example.org/people#Person1'
    }
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0014: @datatype, xsd:integer", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/ xsd: http://www.w3.org/2001/XMLSchema#">
        <head>
          <title>Test 0014</title>
        </head>
        <body>
          <p>
            <span	about="http://example.org/foo"
                  property="ex:bar" content="10" datatype="xsd:integer">ten</span>
        </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0014.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 1)
    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://example.org/foo')
    assert.strictEqual(firstTriple.predicate, 'http://example.org/bar')
    assert.strictEqual(firstTriple.object, '10')
    assert.strictEqual(firstTriple.datatype, 'http://www.w3.org/2001/XMLSchema#integer')
  });

  it( "Test 0015: meta and link", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0015</title>
        <link rel="dc:source" href="urn:isbn:0140449132" />
          <meta property="dc:creator" content="Fyodor Dostoevsky" />
        </head>
        <body>
          <p></p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0015.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 2)
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0015.html',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'Fyodor Dostoevsky'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0015.html',
      predicate: 'http://purl.org/dc/elements/1.1/source',
      object: 'urn:isbn:0140449132'
    }
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0017: Related blanknodes", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
        <title>Test 0017</title>   
        </head>
        <body>
          <p>
                <span about="[_:a]" property="foaf:name">Manu Sporny</span>
                <span about="[_:a]" rel="foaf:knows"
      resource="[_:b]">knows</span>
                <span about="[_:b]" property="foaf:name">Ralph Swick</span>.
              </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0017.html'});
    const triples = flatten(blocks.map(b => b.context))
    assert.strictEqual(triples.length, 3)
    //TODO: add tests I don't understand blank nodes
  });

  it( "Test 0018: @rel for predicate", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0018</title>
        </head>
        <body>
          <p>
          This photo was taken by
          <a about="photo1.jpg" rel="dc:creator"
          href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.
        </p>	 
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0018.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/creator');
    assert.strictEqual(firstTriple.object, 'http://www.blogger.com/profile/1109404');
  });

  it( "Test 0020: Inheriting @about for subject", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0018</title>
        </head>
        <body>
          <p>
          This photo was taken by
          <a about="photo1.jpg" rel="dc:creator"
          href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.
        </p>	 
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0020.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/creator');
    assert.strictEqual(firstTriple.object, 'Mark Birbeck');
  });

  it( "Test 0021: Subject inheritance with no @about", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
      <head>
        <title>Test 0021</title>
      </head>
      <body>
          <div>
            <span class="attribution-line">this photo was taken by
              <span property="dc:creator">Mark Birbeck</span>
            </span>
          </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0021.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0021.html');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/creator');
    assert.strictEqual(firstTriple.object, 'Mark Birbeck');
  });

  it( "Test 0023: @id does not generate subjects", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0023</title>
        </head>
        <body>
          <div id="photo1">
              This photo was taken by
              <span property="dc:creator">Mark Birbeck</span> 
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0023.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0023.html');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/creator');
    assert.strictEqual(firstTriple.object, 'Mark Birbeck');
  });

  it( "Test 0025: simple chaining test", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ foaf: http://xmlns.com/foaf/0.1/">
        <head>
        <title>Test 0025</title>
        </head>
        <body>
          <p>
            This paper was written by
            <span rel="dc:creator" resource="#me">
                <span property="foaf:name">Ben Adida</span>.
            </span>
        </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0025.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 2)
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0025.html',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0025.html#me'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0025.html#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Ben Adida'
    }
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0026: @content", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0026</title>
        </head>
        <body>
          <p>
          <span 	about="http://internet-apps.blogspot.com/"
                  property="dc:creator" content="Mark Birbeck"></span>
        </p>	
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0026.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://internet-apps.blogspot.com/');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/creator');
    assert.strictEqual(firstTriple.object, 'Mark Birbeck');
  });

  it( "Test 0027: @content, ignore element content", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0026</title>
        </head>
        <body>
          <p>
          <span 	about="http://internet-apps.blogspot.com/"
                  property="dc:creator" content="Mark Birbeck"></span>
        </p>	
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0027.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://internet-apps.blogspot.com/');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/creator');
    assert.strictEqual(firstTriple.object, 'Mark Birbeck');
  });

  it( "Test 0029: markup stripping with @datatype", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ xsd: http://www.w3.org/2001/XMLSchema#">
        <head>
        <title>Test 0029</title>
        </head>
        <body>
          <p>
            <span 	about="http://example.org/foo"
                  property="dc:creator" datatype="xsd:string"><b>M</b>ark <b>B</b>irbeck</span>.
        </p>	  
        </body>
      
      
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0029.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://example.org/foo');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/creator');
    assert.strictEqual(firstTriple.object, 'Mark Birbeck');
    assert.strictEqual(firstTriple.datatype, 'http://www.w3.org/2001/XMLSchema#string');
  });

  it( "Test 0030: omitted @about", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="cc: http://creativecommons.org/ns#">
        <head>
          <title>Test 0030</title>
        </head>
        <body>
          <p>This document is licensed under a
            <a 	rel="cc:license"
              href="http://creativecommons.org/licenses/by-nc-nd/2.5/">
                Creative Commons License
            </a>.
          </p>	
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0030.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0030.html');
    assert.strictEqual(firstTriple.predicate, 'http://creativecommons.org/ns#license');
    assert.strictEqual(firstTriple.object, 'http://creativecommons.org/licenses/by-nc-nd/2.5/');
  });

  it( "Test 0031: simple @resource", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0031</title>
        </head>
        <body>
          <p about="#wtw">
            The book <b>Weaving the Web</b> (hardcover) has the ISBN
            <span rel="dc:identifier" resource="urn:ISBN:0752820907">0752820907</span>.
          </p>	
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0031.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0031.html#wtw');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/identifier');
    assert.strictEqual(firstTriple.object, 'urn:ISBN:0752820907');
  });

  it( "Test 0032: @resource overrides @href", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
          <title>Test 0032</title>
        </head>
        <body>
          <p about="#wtw">
            The book <b>Weaving the Web</b> (hardcover) has the ISBN
            <a rel="dc:identifier" resource="urn:ISBN:0752820907" 
            href="http://www.amazon.com/Weaving-Web-Tim-Berners-Lee/dp/0752820907">0752820907</a>.
          </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0032.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0032.html#wtw');
    assert.strictEqual(firstTriple.predicate, 'http://purl.org/dc/elements/1.1/identifier');
    assert.strictEqual(firstTriple.object, 'urn:ISBN:0752820907');
  });

  it( "Test 0033: simple chaining test with bNode", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ foaf: http://xmlns.com/foaf/0.1/">
        <head>
        <title>Test 0033</title>
        </head>
        <body>
          <p>
            This paper was written by
            <span rel="dc:creator">
                <span property="foaf:name">Ben Adida</span>.
            </span>
        </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0033.html'});
    const triples = flatten(blocks.map(b => b.context));
    //TODO: check what we want to do with blank nodes
  });

  it( "Test 0034: simple img[@src] test", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0034</title>    
        </head>
        <body>
          <div about="http://sw-app.org/mic.xhtml#i" rel="foaf:img">
            <img 	src="http://sw-app.org/img/mic_2007_01.jpg" 
                alt="A photo depicting Michael" />
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0034.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://sw-app.org/mic.xhtml#i');
    assert.strictEqual(firstTriple.predicate, 'http://xmlns.com/foaf/0.1/img');
    assert.strictEqual(firstTriple.object, 'http://sw-app.org/img/mic_2007_01.jpg');
  });

  it( "Test 0036: @src/@resource test", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0036</title>    
        </head>
        <body>
          <div>
            <img 	about="http://sw-app.org/mic.xhtml#i"
                rel="foaf:img"
                src="http://sw-app.org/img/mic_2007_01.jpg" 
                resource="http://sw-app.org/img/mic_2006_03.jpg" 
                alt="A photo depicting Michael" />  	
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0036.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://sw-app.org/mic.xhtml#i');
    assert.strictEqual(firstTriple.predicate, 'http://xmlns.com/foaf/0.1/img');
    assert.strictEqual(firstTriple.object, 'http://sw-app.org/img/mic_2006_03.jpg');
  });

  it( "Test 0038: @rev - img[@src] test", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0038</title>    
        </head>
        <body>
          <div about="http://sw-app.org/mic.xhtml#i" rev="foaf:depicts">
            <img 	src="http://sw-app.org/img/mic_2007_01.jpg" 
                alt="A photo depicting Michael" />
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0038.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1);

    const [firstTriple] = triples;
    assert.strictEqual(firstTriple.subject, 'http://sw-app.org/img/mic_2007_01.jpg');
    assert.strictEqual(firstTriple.predicate, 'http://xmlns.com/foaf/0.1/depicts');
    assert.strictEqual(firstTriple.object, 'http://sw-app.org/mic.xhtml#i');
  });

  it( "Test 0048: @typeof with @about and @rel present, no @resource", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0048</title>    
        </head>
        <body>
          <div about="http://www.example.org/#me" rel="foaf:knows" typeof="foaf:Person">
            <p property="foaf:name">John Doe</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0048.html'});
    const triples = flatten(blocks.map(b => b.context));
    // Todo: blank nodes
  });

  it( "Test 0049: @typeof with @about, no @rel or @resource", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0049</title>    
        </head>
        <body>
          <div about="http://www.example.org/#me" typeof="foaf:Person">
            <p property="foaf:name">John Doe</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0049.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'John Doe'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://www.example.org/#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    }
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0050: @typeof without anything else", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0050</title>    
        </head>
        <body>
          <div typeof="foaf:Person">
            <p property="foaf:name">John Doe</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0050.html'});
    const triples = flatten(blocks.map(b => b.context));
    //TODO: Blank nodes
  });

  it( "Test 0051: @typeof with a single @property", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0051</title>    
        </head>
        <body>
          <p about="" typeof="foaf:Document" property="foaf:topic">John Doe</p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0051.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 2)
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0051.html',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Document'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0051.html',
      predicate: 'http://xmlns.com/foaf/0.1/topic',
      object: 'John Doe'
    }
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0052: @typeof with @resource and nothing else", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0052</title>    
        </head>
        <body>
          <p typeof="foaf:Person" resource="http://www.example.org/#me">
            John Doe
          </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0052.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 1)
    
    const firstTriple = {
      subject: 'http://www.example.org/#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0053: @typeof with @resource and nothing else, with a subelement", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0053</title>    
        </head>
        <body>
          <p typeof="foaf:Person" resource="http://www.example.org/#me">
            <span property="foaf:name">John Doe</span>
          </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0053.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://www.example.org/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'John Doe'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0054: multiple @property", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
          <title>Test 0054</title>    
        </head>
        <body>
          <p>
          This document was authored and published by  		
          <span about="" property="dc:creator dc:publisher">Fabien Gandon</span>.
          </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0054.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0054.html',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'Fabien Gandon'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0054.html',
      predicate: 'http://purl.org/dc/elements/1.1/publisher',
      object: 'Fabien Gandon'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0055: multiple @rel", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
          <title>Test 0055</title>    
        </head>
        <body>
          <p>
          This document was authored and published by
          <a about="" rel="dc:creator dc:publisher" href="http://www-sop.inria.fr/acacia/fabien/">Fabien Gandon</a>.
        </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0055.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0055.html',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://www-sop.inria.fr/acacia/fabien/'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0055.html',
      predicate: 'http://purl.org/dc/elements/1.1/publisher',
      object: 'http://www-sop.inria.fr/acacia/fabien/'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0056: @typeof applies to @about on same element with hanging rel", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0056</title>
        </head>
        <body>
          <div about="http://www.example.org/#ben" typeof="foaf:Person" rel="foaf:knows">
            <p about="http://www.example.org/#mark" property="foaf:name">Mark Birbeck</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0056.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/#ben',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://www.example.org/#ben',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://www.example.org/#mark'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)

    const thirdTriple = {
      subject: 'http://www.example.org/#mark',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Mark Birbeck'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true)
  });

  it( "Test 0057: hanging @rel creates multiple triples", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0057</title>
        </head>
        <body>
          <div about="http://www.example.org/#ben" rel="foaf:knows">
            <p about="http://www.example.org/#mark" property="foaf:name">Mark Birbeck</p>
            <p about="http://www.example.org/#ivan" property="foaf:name">Ivan Herman</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0057.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/#ben',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://www.example.org/#mark'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://www.example.org/#ben',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://www.example.org/#ivan'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)

    const thirdTriple = {
      subject: 'http://www.example.org/#mark',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Mark Birbeck'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true)

    const fourthTriple = {
      subject: 'http://www.example.org/#ivan',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Ivan Herman'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourthTriple), true)
  });

  it( "Test 0059: multiple hanging @rels with multiple children", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0059</title>
        </head>
        <body>
          <p>This document was authored and published by:</p>
          <ul rel="dc:creator dc:publisher">
            <li about="http://www.example.org/#manu" property="foaf:name">Manu Sporny</li>
            <li about="http://www.example.org/#fabien" property="foaf:name">Fabien Gandon</li>
          </ul>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0059.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0059.html',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://www.example.org/#manu'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0059.html',
      predicate: 'http://purl.org/dc/elements/1.1/publisher',
      object: 'hhttp://www.example.org/#manu'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)

    const thirdTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0059.html',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://www.example.org/#fabien'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true)

    const fourthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0059.html',
      predicate: 'http://purl.org/dc/elements/1.1/publisher',
      object: 'http://www.example.org/#fabien'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourthTriple), true)

    const fifthTriple = {
      subject: 'http://www.example.org/#manu',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Manu Sporny'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fifthTriple), true)

    const sixthTriple = {
      subject: 'http://www.example.org/#fabien',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Fabien Gandon'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, sixthTriple), true)
  });

  it( "Test 0060: UTF-8 conformance", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0060</title>
        </head>
        <body>
          <div about="http://www.example.org/#matsumoto-kimiko"
              typeof="foaf:Person">
            <p property="foaf:name">松本 后子</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0060.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/#matsumoto-kimiko',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://www.example.org/#matsumoto-kimiko',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: '松本 后子'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( "Test 0063: @rel in head using reserved XHTML value and empty-prefix CURIE syntax", function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
            <title>Test 0063</title>
            <link rel=":next" href="http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0064.html" />
        </head>
        <body>
            <p>This is the 63<sup>rd</sup> test. The next test is #64.</p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0063.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0063.html',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#next',
      object: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0064.html'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0064: @about with safe CURIE", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0064</title>
        </head>
        <body>
          <p about="[_:michael]">Michael knows
            <a rel="foaf:knows" href="http://digitalbazaar.com/people/manu">Manu</a>.
          </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0064.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( "Test 0065: @rel with safe CURIE", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0065</title>
        </head>
          <body>
          <div about="[_:manu]">
            Manu Sporny can be reached via
            <a rel="foaf:mbox" href="mailto:manu.sporny@digitalbazaar.com">email</a>.
            <span rel="foaf:knows" resource="[_:michael]">He knows Michael.</span>
          </div>
      
          <div about="[_:michael]">
            Michael can be reached via
            <a rel="foaf:mbox" href="mailto:michael.hausenblas@joanneum.at">email</a>.
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0065.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( "Test 0066: @about with @typeof in the head", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head typeof="foaf:Document">
            <title>Test 0066</title>
        </head>
        <body>
            <p>This is test #66.</p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0066.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0066.html',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Document'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0067: @property in the head", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
            <title property="foaf:topic">Test 0067</title>
        </head>
        <body>
            <p>This is test #67.</p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0067.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0067.html',
      predicate: 'http://xmlns.com/foaf/0.1/topic',
      object: 'Test 0067'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0068: Relative URI in @about", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
            <title>Test 0068</title>
        </head>
        <body>
            <p about="0067.html">
              The previous test was
              <span property="dc:title">Test 0067</span>.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0068.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0067.html',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: 'Test 0067'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0069: Relative URI in @href", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="xhv: http://www.w3.org/1999/xhtml/vocab#">
        <head>
            <title>Test 0069</title>
        </head>
        <body>
            <p>The next test will be
              <a about="" rel="xhv:next" href="0070.html">Test 0070</a>.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0069.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0069.html',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#next',
      object: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0070.html'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0070: Relative URI in @resource", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="xhv: http://www.w3.org/1999/xhtml/vocab#">
        <head>
            <title>Test 0070</title>
        </head>
        <body>
            <p>The previous test was
              <span about="" rel="xhv:prev" resource="0069.html">Test 0069</span>.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0070.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0070.html',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#prev',
      object: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0069.html'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0071: No explicit @about", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="cc: http://creativecommons.org/ns#">
        <head>
            <title>Test 0071</title>
        </head>
        <body>
            <p>This page is under a Creative Commons
              <a rel="cc:license"
                  href="http://creativecommons.org/licenses/by-nd/3.0/">
                Attribution-No Derivatives 3.0 license</a>.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0071.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0071.html',
      predicate: 'http://creativecommons.org/ns#license',
      object: 'http://creativecommons.org/licenses/by-nd/3.0/'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0072: Relative URI in @about (with XHTML base in head)", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
            <base href="http://www.example.org/"/>
            <title>Test 0072</title>
        </head>
        <body>
            <p about="faq">
              Learn more by reading the example.org
              <span property="dc:title">Example FAQ</span>.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0072.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/faq',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: 'Example FAQ'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0073: Relative URI in @resource (with XHTML base in head)", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
            <base href="http://www.example.org/"/>
            <title>Test 0073</title>
        </head>
        <body>
            <p>
              This article was written by
              <span rel="dc:creator" resource="jane">Jane</span>.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0073.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://www.example.org/jane'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0074: Relative URI in @href (with XHTML base in head)", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
            <base href="http://www.example.org/"/>
            <title>Test 0074</title>
        </head>
        <body>
          <p>
            This article was written by
              <a rel="dc:creator" href="jane">Jane</a>.
        </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0074.html'});
    const triples = flatten(blocks.map(b => b.context));
    console.log(JSON.stringify(triples))
    
    const firstTriple = {
      subject: 'http://www.example.org/',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://www.example.org/jane'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0074: Relative URI in @href (with XHTML base in head)", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
            <base href="http://www.example.org/"/>
            <title>Test 0074</title>
        </head>
        <body>
          <p>
            This article was written by
              <a rel="dc:creator" href="jane">Jane</a>.
        </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0074.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'http://www.example.org/jane'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0075: Reserved word 'license' in @rel with no explicit @about", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
            <base href="http://www.example.org/"/>
            <title>Test 0075</title>
        </head>
        <body>
          <p>
            This page is under a Creative Commons
              <a rel="license" href="http://creativecommons.org/licenses/by-nd/3.0/">Attribution-No Derivatives 3.0 license</a>.
          </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0075.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'http://www.example.org/jane'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0080: @about overrides @resource in incomplete triples", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0080</title>    
        </head>
        <body>
        <div about ="http://www.example.org/#somebody" rel="foaf:knows">
            <p about="http://danbri.org/foaf.rdf#danbri" resource="http://www.leobard.net/rdf/foaf.xml#me">Dan Brickley</p>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0080.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/#somebody',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://danbri.org/foaf.rdf#danbri'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( "Test 0083: multiple ways of handling incomplete triples (merged)", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0083</title>    
        </head>
        <body>
        <div about="http://www.example.org/#somebody" rel="foaf:knows">
            <p property="foaf:name">Ivan Herman</p>
          <p rel="foaf:mailbox" resource="mailto:ivan@w3.org">mailto:ivan@w3.org</p>
          <p about="http://danbri.org/foaf.rdf#danbri" typeof="foaf:Person" property="foaf:name">Dan Brickley</p>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0083.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( "Test 0084: multiple ways of handling incomplete triples, this time with both @rel and @rev", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0084</title>    
        </head>
        <body>
        <div about ="http://www.example.org/#somebody" rev="foaf:knows" rel="foaf:knows">
            <div>
              <p property="foaf:name">Ivan Herman</p>
            <p rel="foaf:mailbox" resource="mailto:ivan@w3.org">mailto:ivan@w3.org</p>
            <p about="http://danbri.org/foaf.rdf#danbri" typeof="foaf:Person" property="foaf:name">Dan Brickley</p>
            
          </div>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0084.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0088: Interpretation of the CURIE "_:"', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0088</title>    
        </head>
        <body>
        <div about ="http://www.example.org/#somebody" rel="foaf:knows">
            <p about="[_:]" property="foaf:name">Dan Brickley</p>
            <p about="[_:]" typeof="foaf:Person">Dan Brickley again:-)</p>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0088.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0089: @src sets a new subject (@typeof)', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
      <head>
            <title>Test 0089</title>
        </head>
        <body>
            <div>
              <img src="http://example.org/example.png" typeof="foaf:Image" alt="example image" />
            </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0089.html'});
    const triples = flatten(blocks.map(b => b.context));
    console.log(JSON.stringify(triples))

    const firstTriple = {
      subject: 'http://example.org/example.png',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Image'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( 'Test 0091: Non-reserved, un-prefixed CURIE in @property', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
            <title>Test 0091</title>
        </head>
        <body>
            <p about="[_:human]">
              A human is
              <span property=":definition">a bi-pedal primate</span>.
              They are quite possibly one of the most
              <span property=":note">confused animal</span>s residing in the 
          <span property=":foo">Milky Way</span>.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0091.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0093: Tests XMLLiteral content with explicit @datatype (user-data-typed literal)', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ ex: http://www.example.org/">
        <head>
        <title>Test 0093</title>
        </head>
        <body>
          <div about="">
            Author: <span property="dc:creator">Albert Einstein</span>
            <h2 property="dc:title" datatype="ex:XMLLiteral">E = mc<sup>2</sup>: The Most Urgent Problem of Our Time</h2>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0093.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0093.html',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'Albert Einstein'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0093.html',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: 'E = mc2: The Most Urgent Problem of Our Time',
      datatype: 'http://www.example.org/XMLLiteral'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( 'Test 0099: Preservation of white space in literals', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="example: http://www.example.org/">
        <head>
            <title>Test 0099</title>
        </head>
        <body>
          <p about="http://www.cwi.nl/~steven/" property="example:likes">
          We put thirty spokes together and call it a wheel;
          But it is on the space where there is nothing that the usefulness of the wheel depends.
          We turn clay to make a vessel;
          But it is on the space where there is nothing that the usefulness of the vessel depends.
          We pierce doors and windows to make a house;
          And it is on these spaces where there is nothing that the usefulness of the house depends.
          Therefore just as we take advantage of what is, we should recognize the usefulness of what is not.
      
          Lao Tzu: Tao Te Ching</p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0099.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.cwi.nl/~steven/',
      predicate: 'http://www.example.org/likes',
      object: `\n          We put thirty spokes together and call it a wheel;\n          But it is on the space where there is nothing that the usefulness of the wheel depends.\n          We turn clay to make a vessel;\n          But it is on the space where there is nothing that the usefulness of the vessel depends.\n          We pierce doors and windows to make a house;\n          And it is on these spaces where there is nothing that the usefulness of the house depends.\n          Therefore just as we take advantage of what is, we should recognize the usefulness of what is not.\n      \n          Lao Tzu: Tao Te Ching`
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( 'Test 0104: rdf:value', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns# example: http://www.example.org/">
        <head>
        <title>Test 0104</title>
        </head>
        <body>
          <p>
            The word "interfenestration" has 
            <span about="#interfenestration" rel="example:size">
                  <span property="rdf:value">17</span>
                  <span property="example:unit">character</span>s.
            </span>
        </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0104.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0106: chaining with empty value in inner @rel', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0106</title>
        </head>
        <body>
            <div about="" rel="dc:creator">
              <a rel="" href="manu.html">Manu</a> created this page.
            </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0106.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0107: no garbage collecting bnodes : (Negative parser test)', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/">
        <head>
        <title>Test 0107</title>
        </head>
        <body>
            <div rel="next"></div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0107.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 0)
  });

  it( 'Test 0110: bNode generated even though no nested @about exists', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="xhv: http://www.w3.org/1999/xhtml/vocab#">
        <head>
              <title>Test 0110</title>
        </head>
        <body>
          <div rel="xhv:next">
            <div rel="xhv:next"></div>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0110.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0111: two bNodes generated after three levels of nesting', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="xhv: http://www.w3.org/1999/xhtml/vocab#">
        <head>
          <title>Test 0111</title>
        </head>
        <body>
          <div rel="xhv:next">
            <div rel="xhv:next">
              <div rel="xhv:next"></div>
            </div>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0111.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0112: plain literal with datatype=""', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/">
        <head>
        <title>Test 0112</title>
        </head>
        <body>
            <p>
            <span about="http://example.org/node" property="ex:property"
                  datatype="">not an XML Literal,
whitespace     preserved
</span>
          </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0112.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://example.org/node',
      predicate: 'http://example.org/property',
      object: 'not an XML Literal,\nwhitespace     preserved\n'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( 'Test 0115: XML Entities must be supported by RDFa parser', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://www.example.com/">
        <head>
          <title>Test 0115</title>
        </head>
        <body>
            <p>Description: XML entities in the RDFa content</p>
            <p>
              <span property="ex:entity1">&gt;</span>
              <span property="ex:entity2">Ben &amp; Co.</span>
              <span property="ex:entity3">&#x40;</span>
              <span property="ex:entity4">&#64;</span>
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0115.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0115.html',
      predicate: 'http://www.example.com/entity1',
      object: '>'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0115.html',
      predicate: 'http://www.example.com/entity2',
      object: 'Ben & Co.'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)

    const thirdTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0115.html',
      predicate: 'http://www.example.com/entity3',
      object: '@'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true)

    const fourthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0115.html',
      predicate: 'http://www.example.com/entity4',
      object: '@'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourthTriple), true)
  });

  it( 'Test 0117: Fragment identifiers stripped from BASE', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
            <base href="http://www.example.org/tc117.xhtml#fragment"/>
            <title property="dc:title">Test 0117</title>
        </head>
        <body>
            <p>
          <span property="dc:contributor">Mark Birbeck</span>
              added this triple test.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0117.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://www.example.org/tc117.xhtml',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: 'Test 0117'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://www.example.org/tc117.xhtml',
      predicate: 'http://purl.org/dc/elements/1.1/contributor',
      object: 'Mark Birbeck'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)

  });

  it( 'Test 0118: empty string "" is not equivalent to NULL - @about', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
            <title>Test 0118</title>
        </head>
        <body>
            <p>
              Check to see if parsers get confused when "" is
              interpreted as NULL in some chaining cases.
              <a href="http://example.org/ben.html"><span
                  about="" property="dc:creator">Ben</span></a>
            </p>
        </body>
      
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0118.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0118.html',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'Ben'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)


  });

  it( 'Test 0119: "[prefix:]" CURIE format is valid', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ example: http://example.org/">
        <head>
            <title>Test 0119</title>
        </head>
        <body>
            <div>
              <p about="[example:]">
                  The
                  <span property="dc:title">Example Website</span>
                  is used in many W3C tutorials.
              </p>
            </div>
        </body>
      
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0119.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://example.org/',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: 'Example Website'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)


  });

  it( 'Test 0120: "[:]" CURIE format is valid', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/ example: http://example.org/">
        <head>
            <title>Test 0120</title>
        </head>
        <body>
            <p about="[:]">
                The
                <span property="dc:title">The XHTML Vocabulary Document</span>
                is the default prefix for XHTML+RDFa 1.0.
              </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0119.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://www.w3.org/1999/xhtml/vocab#',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: 'The XHTML Vocabulary Document'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( 'Test 0122: resource="[]" does not set the object : (Negative parser test)', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
            <title>Test 0122</title>
        </head>
        <body>
          <p about="http://example.org/section1.html">
              This section is contained below <span rel="up" resource="[]">the main site</span>.
            </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0119.html'});
    const triples = flatten(blocks.map(b => b.context));
    console.log(JSON.stringify(triples))
    assert.strictEqual(triples.length, 0)
  });

  it( 'Test 0126: Multiple @typeof values', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dct: http://purl.org/dc/terms/ sioc: http://rdfs.org/sioc/ns# foaf: http://xmlns.com/foaf/0.1/">
          <head>
            <title>Test 0126</title>
          </head>
          <body>
            <div about="http://www.example.org/#article" typeof="foaf:Document sioc:Post">
              <h1 property="dct:title">My article</h1>
            </div>
          </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0119.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/#article',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Document'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://www.example.org/#article',
      predicate: 'a',
      object: 'http://rdfs.org/sioc/ns#Post'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)

    const thirdTriple = {
      subject: 'http://www.example.org/#article',
      predicate: 'http://purl.org/dc/terms/title',
      object: 'My article'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true)
  });

  it( 'Test 0134: Uppercase reserved words', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test</title>
        <link rel="LICENSE" href="http://example.org/test.css" />
      </head>
      <body>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0134.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0134.html',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'http://example.org/test.css'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( 'Test 0140: Blank nodes identifiers are not allowed as predicates : (Negative parser test)', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Blank-node as Predicate Test</title>
      </head>
      <body>
      <p>Blank Nodes are not allowed to be predicate identifiers in RDF:</p>
      <p property="_:invalid">Test</p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0140.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0174: Support single character prefix in CURIEs', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="v: http://www.w3.org/2006/vcard/ns#">
      <head> 
        <title>Test 0174</title> 
      </head> 
      <body> 
        <p>
            This test ensures that single-character prefixes are allowed. 
            My name is:
            <span about="http://example.org/jd" property="v:fn">John Doe</span> 
        </p>
      </body>
      
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0174.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/jd',
      predicate: 'http://www.w3.org/2006/vcard/ns#fn',
      object: 'John Doe'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( 'Test 0175: IRI for @property is allowed', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0175</title>
        </head>
        <body>
          <p about="_:gregg">My name is
            <em property="http://xmlns.com/foaf/0.1/name">Gregg Kellogg</em>.
          </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0175.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0176: IRI for @rel and @rev is allowed', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0176</title>
        </head>
          <body>
          <div about="_:manu">
            Manu can be reached via
            <a rel="http://xmlns.com/foaf/0.1/mbox" href="mailto:manu.sporny@digitalbazaar.com">email</a>.
            <span rel="http://xmlns.com/foaf/0.1/knows" resource="_:gregg">He knows Gregg.</span>
            <span rev="http://xmlns.com/foaf/0.1/knows" resource="_:gregg">Who knows Manu.</span>
          </div>
      
          <div about="_:gregg">
            Gregg can be reached via
            <a rel="http://xmlns.com/foaf/0.1/mbox" href="mailto:gregg@kellogg-assoc.com">email</a>.
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0176.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it( 'Test 0177: Test @prefix', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0177</title>
          <base href="http://example.org/"/>
        </head>
        <body>
          <div about ="#me" prefix="foaf: http://xmlns.com/foaf/0.1/" >
              <p property="foaf:name">Ivan Herman</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0177.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Ivan Herman'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( 'Test 0178: Test @prefix with multiple mappings', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0178</title>
          <base href="http://example.org/"/>
        </head>
        <body>
          <div about ="#this" prefix="foaf: http://xmlns.com/foaf/0.1/ dc: http://purl.org/dc/terms/" typeof="dc:Agent">
              <p property="foaf:name">A particular agent</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0178.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/#this',
      predicate: 'a',
      object: 'http://purl.org/dc/terms/Agent'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)

    const secondTriple = {
      subject: 'http://example.org/#this',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'A particular agent'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true)
  });

  it( 'Test 0181: Test default XHTML vocabulary', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0181</title>
        </head>
        <body>
        <div about ="http://www.example.org/software">
            <p rel=":license" resource="http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231">Ivan Herman</p>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0181.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/software',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true)
  });

  it( 'Test 0182: Test prefix locality', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0182</title>
          <base href="http://example.org/"/>
        </head>
        <body>
          <div prefix="foaf: http://example.org/wrong/foaf/uri/ dc: http://purl.org/dc/terms/" >
            <div about ="#this" typeof="dc:Agent" prefix="foaf: http://xmlns.com/foaf/0.1/" >
              <p property="foaf:name">A particular agent</p>
            </div>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0182.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/#this',
      predicate: 'a',
      object: 'http://purl.org/dc/terms/Agent'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://example.org/#this',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'A particular agent'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);
  });

  it( 'Test 0186: @vocab after subject declaration', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0186</title>
        <base href="http://example.org/"/>
      </head>
      <body>
        <div about ="#me" vocab="http://xmlns.com/foaf/0.1/" >
          <p property="name">Ivan Herman</p>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0182.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Ivan Herman'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it( 'Test 0187: @vocab redefinition', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0187</title>
          <base href="http://example.org/"/>
        </head>
        <body>
          <div vocab="http://example.org/wrong/foaf/uri/">
            <div about ="#me" vocab="http://xmlns.com/foaf/0.1/" >
              <p property="name">Ivan Herman</p>
            </div>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0187.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Ivan Herman'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it( 'Test 0188: @vocab only affects predicates', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0188</title>
          <base href="http://example.org/"/>
        </head>
        <body>
          <div vocab="http://xmlns.com/foaf/0.1/">
            <div about ="#me">
              <p property="name">Ivan Herman</p>
            </div>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0188.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Ivan Herman'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it( 'Test 0189: @vocab overrides default term', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0189</title>
        </head>
        <body>
          <div about ="http://www.example.org/software" vocab="http://www.example.org/vocab#">
            <p rel="license" resource="http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231">Ivan Herman</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0189.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/software',
      predicate: 'http://www.example.org/vocab#license',
      object: 'http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it( 'Test 0190: Test term case insensitivity', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0190</title>
        </head>
        <body>
          <div about ="http://www.example.org/software">
            <p rel="liCeNse" resource="http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231">Ivan Herman</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0190.html'});
    const triples = flatten(blocks.map(b => b.context));
    console.log(JSON.stringify(triples))
    
    const firstTriple = {
      subject: 'http://www.example.org/software',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it( 'Test 0196: Test process explicit XMLLiteral', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/rdf/ rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <head>
        <title>Test 0196</title>
      </head>
      <body>
        <div about="http://www.example.org">
          <p property="ex:xmllit" datatype="rdf:XMLLiteral">This is an XMLLiteral</p>
          <p property="ex:plainlit">This is a <em>plain</em> literal</p>
      </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0196.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org',
      predicate: 'http://example.org/rdf/xmllit',
      object: 'This is an XMLLiteral',
      datatype: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://www.example.org',
      predicate: 'http://example.org/rdf/plainlit',
      object: 'This is a plain literal'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);
  });

  it( 'Test 0197: Test TERMorCURIEorAbsURI requires an absolute URI', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/terms/">
      <head>
        <title>Test 0197</title>
        <base href="http://www.example.org/me" />
      </head>
      <body>
        <p about="" typeof="class/Person" property="pred/name">Gregg Kellogg</p>
        <p property="dc:language" datatype="pred/lang">Ruby</p>
        <p rel="pred/rel" resource="http://kellogg-assoc.com/">Kellogg Associates</p>
        <p rev="pred/rev" resource="http://github.org/gkellogg/rdf_context">Ruby Gem</p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0197.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/me',
      predicate: 'http://purl.org/dc/terms/language',
      object: 'Ruby'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

  });

  it( 'Test 0206: Usage of Initial Context', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Default context test 0206</title>
      </head>
      <body>
        <p about ="xsd:maxExclusive" rel="rdf:type" resource="owl:DatatypeProperty">
            An OWL Axiom: "xsd:maxExclusive" is a Datatype Property in OWL.
        </p>
      </body>
      
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0206.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.w3.org/2001/XMLSchema#maxExclusive',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2002/07/owl#DatatypeProperty'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

  });

  it( 'Test 0207: Vevent using @typeof', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="cal: http://www.w3.org/2002/12/cal/icaltzd# xsd: http://www.w3.org/2001/XMLSchema#">
      <head>
        <title>Test 0207</title>    
      </head>
        <body>
        <p about="#event1" typeof="cal:Vevent">
            <b property="cal:summary">Weekend off in Iona</b>: 
            <span property="cal:dtstart" content="2006-10-21" datatype="xsd:date">Oct 21st</span>
            to <span property="cal:dtend" content="2006-10-23"  datatype="xsd:date">Oct 23rd</span>.
            See <a rel="cal:url" href="http://freetime.example.org/">FreeTime.Example.org</a> for
            info on <span property="cal:location">Iona, UK</span>.
        </p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0207.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0207.html#event1',
      predicate: 'a',
      object: 'http://www.w3.org/2002/12/cal/icaltzd#Vevent'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0207.html#event1',
      predicate: 'http://www.w3.org/2002/12/cal/icaltzd#summary',
      object: 'Weekend off in Iona'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

    const thirdTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0207.html#event1',
      predicate: 'http://www.w3.org/2002/12/cal/icaltzd#dtstart',
      object: '2006-10-21',
      datatype: 'http://www.w3.org/2001/XMLSchema#date'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true);

    const fourthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0207.html#event1',
      predicate: 'http://www.w3.org/2002/12/cal/icaltzd#dtend',
      object: '2006-10-23',
      datatype: 'http://www.w3.org/2001/XMLSchema#date'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourthTriple), true);

    const fifthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0207.html#event1',
      predicate: 'http://www.w3.org/2002/12/cal/icaltzd#url',
      object: 'http://freetime.example.org/'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fifthTriple), true);

    const sixthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0207.html#event1',
      predicate: 'http://www.w3.org/2002/12/cal/icaltzd#location',
      object: 'Iona, UK'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, sixthTriple), true);

  });

  it( 'Test 0213: Datatype generation for a literal with XML content, version 1.1', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
        <title>Test 0213</title>
        </head>
        <body>
          <!-- In RDFa 1.1, by default a plain literal is generated even if it contains XML elements -->
          <div about="http://www.example.org/">
            <h2 property="dc:title">E = mc<sup>2</sup>: The Most Urgent Problem of Our Time</h2>
        </div>
        </body>
      
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0213.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: 'E = mc2: The Most Urgent Problem of Our Time'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

  });

  it( 'Test 0214: Root element has implicit @about=""', function() {
    const html = `
      <!DOCTYPE html>
      <html typeof="foaf:Document">
      <head>
        <title property="dc:title">Test 0214</title>
      </head>
      <body>
        <p>This document has a title.</p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0214.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0214.html',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Document'
    };
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0214.html',
      predicate: 'http://purl.org/dc/terms/title',
      object: 'Test 0214'
    };
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

  });

  it( 'Test 0216: Proper character encoding detection in spite of large headers', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix = "
      air: http://www.daml.org/2001/10/html/airport-ont#
      bio: http://vocab.org/bio/0.1/
      contact: http://www.w3.org/2000/10/swap/pim/contact#
      dc: http://purl.org/dc/terms/
      foaf: http://xmlns.com/foaf/0.1/
      ical: http://www.w3.org/2002/12/cal/icaltzd#
      owl: http://www.w3.org/2002/07/owl#
      rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#
      rdfs: http://www.w3.org/2000/01/rdf-schema#
      rel: http://vocab.org/relationship/
      openid: http://xmlns.openid.net/auth#
      rss: http://web.resource.org/rss/1.0/
      sioc: http://rdfs.org/sioc/ns#
      xsd: http://www.w3.org/2001/XMLSchema#
      google: http://rdf.data-vocabulary.org/#
      rsa: http://www.w3.org/ns/auth/rsa#
      cert: http://www.w3.org/ns/auth/cert#
      wot: http://xmlns.com/wot/0.1/
      ">
      <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <title>Test 0216</title>
      </head>
      <body>
            <!-- Tests whether the Unicode (UTF-8 encoded) characters are properly handled even with a large set of properties
          in the html element, ie, when the content sniffing to find out the character encoding may not work -->
          <p about="http://www.ivan-herman.net/foaf#me" property="foaf:name">Iván</p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0216.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.ivan-herman.net/foaf#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Iván'
    };
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0217: @vocab causes rdfa:usesVocabulary triple to be added', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0217</title>
        <base href="http://example.org/"/>
      </head>
      <body>
        <div about="#me" vocab="http://xmlns.com/foaf/0.1/" >
          <p property="name">Gregg Kellogg</p>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0217.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Gregg Kellogg'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://example.org/',
      predicate: 'http://www.w3.org/ns/rdfa#usesVocabulary',
      object: 'http://xmlns.com/foaf/0.1/'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

  });

  //InList tests from 0218 to 0228

  it('Test 0228: 1.1 alternate for test 0040: @rev - @src/@resource test', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0228</title>
          <!-- Based on 1.1 semantics for 0040 -->
        </head>
        <body>
          <div>
          <img src="http://sw-app.org/img/mic_2007_01.jpg"
                rev="xhv:alternate"
                resource="http://sw-app.org/img/mic_2006_03.jpg"
                alt="A photo depicting Michael" />	
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0228.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://sw-app.org/img/mic_2006_03.jpg',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#alternate',
      object: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0228.html'
    };
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0229: img[@src] test with omitted @about', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0042</title>    
        </head>
        <body>
          <div>
            <img 	rel="foaf:img"
                src="http://sw-app.org/img/mic_2007_01.jpg" 
                alt="A photo depicting Michael" />
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0229.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0229.html',
      predicate: 'http://xmlns.com/foaf/0.1/img',
      object: 'http://sw-app.org/img/mic_2007_01.jpg'
    };
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0231: Set image license information', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0231</title>
      </head>
      <body>
        <div about="http://creativecommons.org/licenses/by-nc-sa/2.0/" rev="license">
          <img src="http://example.org/example.png" alt="example image" />
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0231.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/example.png',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'http://creativecommons.org/licenses/by-nc-sa/2.0/'
    };
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0231: Set image license information', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0231</title>
      </head>
      <body>
        <div about="http://creativecommons.org/licenses/by-nc-sa/2.0/" rev="license">
          <img src="http://example.org/example.png" alt="example image" />
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0231.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/example.png',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'http://creativecommons.org/licenses/by-nc-sa/2.0/'
    };
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0232: @typeof with @rel present, no @href, @resource, or @about (1.1 behavior of 0046);', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0232</title>    
        </head>
        <body>
          <div rel="foaf:maker" typeof="foaf:Person">
            <p property="foaf:name">John Doe</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0232.html'});
    const triples = flatten(blocks.map(b => b.context));
    // Blank nodes
  });

  it('Test 0233: @typeof with @rel and @resource present, no @about (1.1 behavior of 0047)', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
        <head>
          <title>Test 0233</title>    
        </head>
        <body>
          <div rel="foaf:maker" typeof="foaf:Person" resource="http://www.example.org/#me">
            <p property="foaf:name">John Doe</p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0233.html'});
    const triples = flatten(blocks.map(b => b.context));
    // Blank nodes
  });

  it('Test 0246: hanging @rel creates multiple triples, @typeof permutation; RDFa 1.1 version', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0246</title>
        </head>
        <body prefix="foaf: http://xmlns.com/foaf/0.1/">
          <div about="http://www.example.org/#ben" rel="foaf:knows">
            <p typeof="foaf:Person"><span property="foaf:name">Mark Birbeck</span></p>
            <p typeof="foaf:Person"><span property="foaf:name">Ivan Herman</span></p>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0246.html'});
    const triples = flatten(blocks.map(b => b.context));
    // Blank nodes
  });

  it('Test 0247: Multiple incomplete triples, RDFa 1.1version', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0247</title>    
        </head>
        <body prefix="foaf: http://xmlns.com/foaf/0.1/">    
        <div about ="http://www.example.org/#somebody" rel="foaf:knows">
            <p property="foaf:name">Ivan Herman</p>
          <p rel="foaf:mailbox" resource="mailto:ivan@w3.org">mailto:ivan@w3.org</p>
          <p typeof="foaf:Person"><span property="foaf:name">Mark Birbeck</span></p>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0247.html'});
    const triples = flatten(blocks.map(b => b.context));
    // Blank nodes
  });

  it('Test 0248: multiple ways of handling incomplete triples (with @rev); RDFa 1.1 version', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0248</title>    
        </head>
        <body prefix="foaf: http://xmlns.com/foaf/0.1/">
        <div about ="http://www.example.org/#somebody" rev="foaf:knows">
            <p property="foaf:name">Ivan Herman</p>
          <p rel="foaf:mailbox" resource="mailto:ivan@w3.org">mailto:ivan@w3.org</p>
          <p typeof="foaf:Person"><span property="foaf:name">Mark Birbeck</span></p>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0248.html'});
    const triples = flatten(blocks.map(b => b.context));
    // Blank nodes
  });

  it('Test 0249: multiple ways of handling incomplete triples (with @rel and @rev); RDFa 1.1 version', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0249</title>    
        </head>
        <body prefix="foaf: http://xmlns.com/foaf/0.1/">
        <div about ="http://www.example.org/#somebody" rev="foaf:knows" rel="foaf:knows">
            <p property="foaf:name">Ivan Herman</p>
          <p rel="foaf:mailbox" resource="mailto:ivan@w3.org">mailto:ivan@w3.org</p>
          <p typeof="foaf:Person"><span property="foaf:name">Mark Birbeck</span></p>
        </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0249.html'});
    const triples = flatten(blocks.map(b => b.context));
    // Blank nodes
  });

  it('Test 0250: Checking the right behaviour of @typeof with @about, in presence of @property', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0250</title>    
        </head>
        <body prefix="foaf: http://xmlns.com/foaf/0.1/">
        <p about ="http://www.ivan-herman.net/foaf#me" typeof="foaf:Person" property="foaf:name">Ivan Herman</p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0250.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.ivan-herman.net/foaf#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://www.ivan-herman.net/foaf#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Ivan Herman'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);
  });

  it('Test 0251: lang', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/">
        <head about="">
        <title>Test 251</title>
          <meta about="http://example.org/node" property="ex:property" lang="fr" content="chat" />
        </head>
        <body>
          <p></p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0251.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/node',
      predicate: 'http://example.org/property',
      object: 'chat',
      language: 'fr'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0252: lang inheritance', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/">
        <head about="" lang="fr">
          <title lang="en">Test 0252</title>
          <meta about="http://example.org/node" property="ex:property" content="chat" />
        </head>
        <body>
          <p></p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0247.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/node',
      predicate: 'http://example.org/property',
      object: 'chat',
      language: 'fr'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0253: plain literal with datatype="" and lang preservation', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/">
        <head>
        <title>Test 0108</title>
        </head>
        <body>
          <p about="http://example.org/node" property="ex:property"
            datatype="" lang="el">ελληνικό
      άσπρο   διάστημα
      </p>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0253.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/node',
      predicate: 'http://example.org/property',
      object: 'ελληνικό\nάσπρο   διάστημα\n',
      language: 'el'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0254: @datatype="" generates plain literal in presence of child nodes details', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/terms#">
      <head> 
        <title>Test 0254</title> 
        <base href="http://example.org/"/> 
      </head> 
      <body lang="en"> 
        <p property="ex:prop" datatype="">A <strong>plain literal</strong> with a lang tag.</p> 
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0254.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/node',
      predicate: 'http://example.org/terms#prop',
      object: 'A plain literal with a lang tag.',
      language: 'en'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0255: lang="" clears language setting', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/terms#">
      <head> 
        <title>Test 0255</title> 
        <base href="http://example.org/"/> 
      </head> 
      <body lang="en"> 
        <p property="ex:prop" lang="">Just a plain literal.</p> 
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0255.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/node',
      predicate: 'http://example.org/terms#prop',
      object: 'Just a plain literal.',
      language: ''
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0257: element with @property and no child nodes generates empty plain literal (HTML5 version of 0113)', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
        <head>
          <title>Test 0257</title>
        </head>
        <body>
          <span about="#a" property="dc:title"></span>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0257.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0257.html#a',
      predicate: 'http://purl.org/dc/elements/1.1/title',
      object: '',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0259: XML+RDFa Initial Context', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0259</title>
      </head>
      <body>
        <div>
          Vocabulary Prefixes
          <span property="csvw:">CSVW</span>
          <span property="dcat:">DCAT</span>
          <span property="qb:">QB</span>
          <span property="grddl:">GRDDL</span>
          <span property="ma:">MA</span>
          <span property="org:">ORG</span>ORG
          <span property="owl:">OWL</span>
          <span property="prov:">PROV</span>
          <span property="rdf:">RDF</span>
          <span property="rdfa:">RDFa</span>
          <span property="rdfs:">RDFS</span>
          <span property="rif:">RIF</span>
          <span property="rr:">RR</span>
          <span property="sd:">SD</span>
          <span property="skos:">SKOS</span>
          <span property="skosxl:">SKOS-XL</span>
          <span property="wdr:">WDR</span>
          <span property="void:">VOID</span>
          <span property="wdrs:">WDRS</span>
          <span property="xhv:">XHV</span>
          <span property="xml:">XML</span>
          <span property="xsd:">XSD</span>
        </div>
        <div>
          Widely Used prefixes
          <span property="cc:">CC</span>
          <span property="ctag:">CTAG</span>
          <span property="dc:">DC</span>
          <span property="dcterms:">DCTERMS</span>
          <span property="foaf:">FOAF</span>
          <span property="gr:">GR</span>
          <span property="ical:">ICAL</span>
          <span property="og:">OG</span>
          <span property="rev:">REV</span>
          <span property="sioc:">SIOC</span>
          <span property="v:">V</span>
          <span property="vcard:">VCARD</span>
          <span property="schema:">Schema</span>
        </div>
        <div>
          Vocabulary Terms
          <span property="describedby">DescribedBy</span>
          <span property="license">License</span>
          <span property="role">Role</span>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/ns/csvw#',
      object: 'CSVW',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/ns/dcat#',
      object: 'DCAT',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

    const thirdTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://purl.org/linked-data/cube#',
      object: 'QB',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true);

    const fourthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2003/g/data-view#',
      object: 'GRDDL',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourthTriple), true);

    const fifthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/ns/ma-ont#',
      object: 'MA',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fifthTriple), true);

    const sixthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/ns/org#',
      object: 'ORG',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, sixthTriple), true);

    const seventhTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2002/07/owl#',
      object: 'OWL',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, seventhTriple), true);

    const eightTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/ns/prov#',
      object: 'PROV',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, eightTriple), true);

    const ninethTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      object: 'RDF',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, ninethTriple), true);

    const tenthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/ns/rdfa#',
      object: 'RDFa',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, tenthTriple), true);

    const eleventhTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#',
      object: 'RDFS',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, eleventhTriple), true);

    const twelvethTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2007/rif#',
      object: 'RIF',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twelvethTriple), true);

    const thirteenthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/ns/r2rml#',
      object: 'RR',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirteenthTriple), true);

    const fourteenthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/ns/sparql-service-description#',
      object: 'SD',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourteenthTriple), true);

    const fifteenthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2004/02/skos/core#',
      object: 'SKOS',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fifteenthTriple), true);

    const sixteenthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2008/05/skos-xl#',
      object: 'SKOS-XL',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, sixteenthTriple), true);

    const seventeenthtriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2007/05/powder#',
      object: 'WDR',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, seventeenthtriple), true);

    const eightteenthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://rdfs.org/ns/void#',
      object: 'VOID',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, eightteenthTriple), true);

    const nineteenthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2007/05/powder-s#',
      object: 'WDRS',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, nineteenthTriple), true);

    const twentythTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#',
      object: 'XHV',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentythTriple), true);

    const twentyfirstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/XML/1998/namespace',
      object: 'XML',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentyfirstTriple), true);

    const twentysecondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2001/XMLSchema#',
      object: 'XSD',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentysecondTriple), true);

    const twentythirdTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://creativecommons.org/ns#',
      object: 'CC',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentythirdTriple), true);

    const twentyfourthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://commontag.org/ns#',
      object: 'CTAG',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentyfourthTriple), true);

    const twentyfifthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://commontag.org/ns#',
      object: 'CTAG',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentyfifthTriple), true);

    const twentysixthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://purl.org/dc/terms/',
      object: 'DC',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentysixthTriple), true);

    const twentyseventhTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://purl.org/dc/terms/',
      object: 'DCTERMS',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentyseventhTriple), true);

    const twentyeigthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://xmlns.com/foaf/0.1/',
      object: 'FOAF',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentyeigthTriple), true);

    const twentyninethTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://purl.org/goodrelations/v1#',
      object: 'GR',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twentyninethTriple), true);

    const thirtythTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2002/12/cal/icaltzd#',
      object: 'ICAL',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtythTriple), true);

    const thirtyfirstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://ogp.me/ns#',
      object: 'OG',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtyfirstTriple), true);

    const thirtysecondTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://purl.org/stuff/rev#',
      object: 'REV',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtysecondTriple), true);

    const thirtythirdTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://rdfs.org/sioc/ns#',
      object: 'SIOC',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtythirdTriple), true);

    const thirtyfourthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://rdf.data-vocabulary.org/#',
      object: 'V',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtyfourthTriple), true);

    const thirtyfifthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2006/vcard/ns#',
      object: 'VCARD',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtyfifthTriple), true);

    const thirtysixthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://schema.org/',
      object: 'Schema',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtysixthTriple), true);

    const thirtySeventhTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/2007/05/powder-s#describedby',
      object: 'DescribedBy',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtySeventhTriple), true);

    const thirtyEightthTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'License',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtyEightthTriple), true);

    const thirtyNinethTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0259.html',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#role',
      object: 'Role',
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirtyNinethTriple), true);
  });

  it('Test 0261: White space preservation in XMLLiteral', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="ex: http://example.org/rdf/ rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <head>
        <title>Test 0261</title>
      </head>
      <body>
        <div about="http://www.example.org">
          <p property="ex:xmllit" datatype="rdf:XMLLiteral">This is
      an XMLLiteral</p>
      </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0257.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org',
      predicate: 'http://example.org/rdf/xmllit',
      object: 'This is\n      an XMLLiteral',
      datatype: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0262: Predicate establishment with @property, with white spaces before and after the attribute value', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dc: http://purl.org/dc/elements/1.1/">
      <head>
        <title>Test 0262</title>
      </head>
      <body>
        <p>This photo was taken by <span class="author" about="photo1.jpg" property="    dc:creator
      ">Mark Birbeck</span>.</p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0262.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/photo1.jpg',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      object: 'Mark Birbeck'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0263: @property appearing on the html element yields the base as the subject', function() {
    const html = `
      <!DOCTYPE html>
      <html property="rdfs:seeAlso" resource="http://www.example.org">
      <head >
        <title>Test 0263</title>
      </head>
      <body>
        <p> </p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0263.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0263.html',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
      object: 'http://www.example.org'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0264: @property appearing on the head element gets the subject from , ie, parent', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head  property="rdfs:seeAlso" resource="http://www.example.org">
        <title>Test 0264</title>
      </head>
      <body>
        <p> </p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0264.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0264.html',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
      object: 'http://www.example.org'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0265: @property appearing on the head element gets the subject from , ie, parent', function() {
    const html = `
      <!DOCTYPE html>
      <html about="http://www.example.com">
      <head  property="rdfs:seeAlso" resource="http://www.example.org">
        <title>Test 0265</title>
      </head>
      <body>
        <p> </p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0265.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.com',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
      object: 'http://www.example.org'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0266: @property without @content or @datatype, typed object set by @href and @typeof', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0266</title>
      </head>
      <body>
        <div about="http://www.w3.org/Person/Ivan#me">
          <a href="http://www.ivan-herman.net/foaf#me" typeof="foaf:Person" property="owl:sameAs">Ivan Herman</a>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0266.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.w3.org/Person/Ivan#me',
      predicate: 'http://www.w3.org/2002/07/owl#sameAs',
      object: 'http://www.ivan-herman.net/foaf#me'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://www.ivan-herman.net/foaf#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);
  });

  it('Test 0267: @property without @content or @datatype, typed object set by @resource and @typeof', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0267</title>
      </head>
      <body>
        <div about="http://www.w3.org/Person/Ivan#me">
          <p resource="http://www.ivan-herman.net/foaf#me" typeof="foaf:Person" property="owl:sameAs">Ivan Herman</p>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0267.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.w3.org/Person/Ivan#me',
      predicate: 'http://www.w3.org/2002/07/owl#sameAs',
      object: 'http://www.ivan-herman.net/foaf#me'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://www.ivan-herman.net/foaf#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);
  });

  it('Test 0268: @property without @content or @datatype, typed object set by @src and @typeof', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0268</title>
      </head>
      <body>
        <div about="http://www.ivan-herman.net/foaf#me">
          <img src="http://www.ivan-herman.net/Images/me2003-small.png" typeof="foaf:Image" property="foaf:depiction" alt="Ivan Herman" />
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0268.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.ivan-herman.net/foaf#me',
      predicate: 'http://xmlns.com/foaf/0.1/depiction',
      object: 'http://www.ivan-herman.net/Images/me2003-small.png'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://www.ivan-herman.net/Images/me2003-small.png',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Image'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);
  });

  it('Test 0269: Use of @property in HEAD without explicit subject', function() {
    const html = `
      <!DOCTYPE html>
      <html property="rdfs:comment" content="This is an RDFa test">
      <head >
        <title>Test 0269</title>
      </head>
      <body>
        <p> </p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0269.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0269.html',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#comment',
      object: 'This is an RDFa test'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0271: Use of @property in HEAD with explicit parent subject via @about', function() {
    const html = `
    <!DOCTYPE html>
    <html about="http://www.example.org/">
    <head property="rdfs:comment" content="This is an RDFa test">
      <title>Test 0269</title>
    </head>
    <body>
      <p> </p>
    </body>
    </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0271.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://www.example.org/',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#comment',
      object: 'This is an RDFa test'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0272: time element with @datetime an xsd:date', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0272</title>
      </head>
      <body>
        <time property="rdf:value" datetime="2012-03-18">18 March 2012</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0272.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0273: time element with @datetime an xsd:time', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0273</title>
      </head>
      <body>
        <time property="rdf:value" datetime="00:00:00">midnight</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0273.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0274: time element with @datetime an xsd:dateTime', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0274</title>
      </head>
      <body>
        <time property="rdf:value" datetime="2012-03-18T00:00:00Z">18 March 2012 at midnight</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0274.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0275: time element with value an xsd:date', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0275</title>
      </head>
      <body>
        <time property="rdf:value">2012-03-18</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0275.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0276: time element with value an xsd:time', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0275</title>
      </head>
      <body>
        <time property="rdf:value">00:00:00</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0276.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0277: time element with value an xsd:dateTime', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0277</title>
      </head>
      <body>
        <time property="rdf:value">2012-03-18T00:00:00Z</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0277.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0278: @content overrides @datetime', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0278</title>
      </head>
      <body>
        <p>The value of @content has a higher priority than @datetime</p>
        <time property="rdf:value" datetime="2012-03-18" content="this should be the value">18 March 2012</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0278.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0279: @datatype used with @datetime overrides default datatype', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0279</title>
      </head>
      <body>
        <time property="rdf:value" datetime="2012-03-18T00:00:00Z" datatype="xsd:date">18 March 2012 at midnight</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0279.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0279.html',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: '2012-03-18T00:00:00Z',
      datatype: 'http://www.w3.org/2001/XMLSchema#date'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0281: time element with @datetime an xsd:gYear', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0281</title>
      </head>
      <body>
        <time property="rdf:value" datetime="2012">Two Thousand Twelve</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0281.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0281.html',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: '2012',
      datatype: 'http://www.w3.org/2001/XMLSchema#gYear'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0282: time element with @datetime an xsd:gYearMonth', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0282</title>
      </head>
      <body>
        <time property="rdf:value" datetime="2012-03">March, Two Thousand Twelve</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0282.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0282.html',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: '2012-03',
      datatype: 'http://www.w3.org/2001/XMLSchema#gYearMonth'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0283: time element with @datetime an invalid datatype generates plain literal', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0283</title>
      </head>
      <body>
        <time property="rdf:value"> 2012-03-18</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0282.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0284: time element not matching datatype but with explicit @datatype', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0284</title>
      </head>
      <body>
        <time property="rdf:value" datatype="xsd:dateTime"> 2012-03-18</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0284.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0284.html',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: ' 2012-03-18',
      datatype: 'http://www.w3.org/2001/XMLSchema#dateTime'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0287: time element with @datetime an xsd:dateTime with TZ offset', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0287</title>
      </head>
      <body>
        <time property="rdf:value" datetime="2012-03-18T00:00:00-08:00">18 March 2012 at midnight in San Francisco</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0287.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0289: @href becomes subject when @property and @content are present', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0289</title>
      </head>
      <body>
        <h1>@href becomes subject when @property and @content are present</h1>
        <a href="http://example.org/" property="rdf:value" content="value">ignored</a>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0289.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: 'value'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0290: @href becomes subject when @property and @datatype are present', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0290</title>
      </head>
      <body>
        <h1>@href becomes subject when @property and @datatype are present</h1>
        <a href="http://example.org/" property="rdf:value" datatype="">value</a>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0290.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.org/',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: 'value'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0291: @href as subject overridden by @about', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <head>
        <title>Test 0291</title>
      </head>
      <body>
        <h1>@href as subject overridden by @about</h1>
        <a about="http://example.net/" href="http://example.org/" property="rdf:value" content="value">ignored</a>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0291.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.net/',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: 'value'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0292: @about overriding @href as subject is used as parent resource', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <head>
        <title>Test 0292</title>
      </head>
      <body>
        <h1>@about overriding @href as subject is used as parent resource</h1>
        <a about="http://example.net/" href="http://example.org/" property="rdf:value" content="value one">
          <span property="rdf:value">value two</span>
        </a>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0292.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.net/',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: 'value one'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://example.net/',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      object: 'value two'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);
  });

  it('Test 0293: Testing the ":" character usage in a CURIE', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0293</title>
      </head>
      <body>
        <h1>Testing the ':' character usage in a CURIE</h1>
        <div prefix="ex: http://www.example.org/">
          <p about="http://www.example.org" property="ex:column:test">Test</p>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0293.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org',
      predicate: 'http://www.example.org/column:test',
      object: 'Test'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0296: @property does set parent object without @typeof', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0296</title>
      </head>
      <body>
        <div vocab="http://xmlns.com/foaf/0.1/" resource="http://example.com/gregg/#me" typeof="Person">
          <a property="homepage" href="http://example.com/gregg/"><span property="name">Gregg</span></a>
          Knows
          <ul>
            <li property="knows" resource="http://example.com/niklas/#me" typeof="Person">
              <a property="homepage" href="http://example.com/niklas/"><span property="name">Niklas</span></a>
            </li>
            <li property="knows" resource="http://example.com/stéphane/#me" typeof="Person">
              <a property="homepage" href="http://example.com/stéphane/"><span property="name">Stéphane</span></a>
            </li>
            <li property="knows" resource="http://example.com/ivan/#me" typeof="Person">
              <a property="homepage" href="http://example.com/ivan/"><span property="name">Ivan</span></a>
            </li>
            <li property="knows" resource="http://example.com/manu/#me" typeof="Person">
              <a property="homepage" href="http://example.com/manu/"><span property="name">Manu</span></a>
            </li>
          </ul>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0296.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://example.com/gregg/#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://example.com/niklas/#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

    const thirdTriple = {
      subject: 'http://example.com/stéphane/#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true);

    const fourthTriple = {
      subject: 'http://example.com/ivan/#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourthTriple), true);

    const fifthTriple = {
      subject: 'http://example.com/manu/#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fifthTriple), true);

    const sixthTriple = {
      subject: 'http://example.com/gregg/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Gregg'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, sixthTriple), true);

    const seventhTriple = {
      subject: 'http://example.com/niklas/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Niklas'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, seventhTriple), true);

    const eightTriple = {
      subject: 'http://example.com/stéphane/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Stéphane'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, eightTriple), true);

    const ninethTriple = {
      subject: 'http://example.com/ivan/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Ivan'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, ninethTriple), true);

    const tenthTriple = {
      subject: 'http://example.com/manu/#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: 'Manu'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, tenthTriple), true);

    const eleventhTriple = {
      subject: 'http://example.com/gregg/#me',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://example.com/niklas/#me'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, eleventhTriple), true);

    const twelvethTriple = {
      subject: 'http://example.com/gregg/#me',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://example.com/stéphane/#me'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, twelvethTriple), true);

    const thirteenthTriple = {
      subject: 'http://example.com/gregg/#me',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://example.com/ivan/#me'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirteenthTriple), true);

    const fourteenthTriple = {
      subject: 'http://example.com/gregg/#me',
      predicate: 'http://xmlns.com/foaf/0.1/knows',
      object: 'http://example.com/manu/#me'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourteenthTriple), true);
  });

  it('Test 0297: @about=[] with @typeof does not create a new subject', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0297: Testing @typeof and @about=[]</title>
      </head>
      <body>
        <div about="[]" typeof="foaf:Person" property="foaf:name">Alex Milowski</div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0297.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0298: @about=[] with @typeof does not create a new object', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0298: Testing @typeof and @about=[]</title>
      </head>
      <body>
        <div about="[]" typeof="foaf:Person">
          <span property="foaf:name">Alex Milowski</span>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0298.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0299: @resource=[] with @href or @src uses @href or @src (@rel)', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0299: Testing @resource=[]</title>
      </head>
      <body about="http://www.example.org/">
        <a href="http://www.example.org/license.xhtml" rel="xhv:license" resource="[]">The Foo Document</a>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0299.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'http://www.example.org/license.xhtml'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0300: @resource=[] with @href or @src uses @href or @src (@property)', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0300: Testing @resource=[]</title>
      </head>
      <body about="http://www.example.org/">
        <a href="http://www.example.org/license.xhtml" property="xhv:license" resource="[]">The Foo Document</a>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0300.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://www.example.org/',
      predicate: 'http://www.w3.org/1999/xhtml/vocab#license',
      object: 'http://www.example.org/license.xhtml'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);
  });

  it('Test 0301: @property with @typeof creates a typed_resource for chaining', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0301: Typed Property</title>
      </head>
      <body>
        <p vocab="http://www.milowski.com/V/" property="bit" typeof="thing">
          <span property="name">Fizzbit</span>
        </p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0300.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0302: @typeof with different content types', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0302: various types of tokens in @typeof</title>
      </head>
      <body>
        <div vocab="http://schema.org/" resource="http://openspring.net/scor#me" typeof="Person foaf:Person http://purl.org/dc/terms/Agent">
          <a property="homepage" href="http://openspring.net/"><span property="name">Stéphane Corlosquet</span></a>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0302.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://openspring.net/scor#me',
      predicate: 'a',
      object: 'http://schema.org/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://openspring.net/scor#me',
      predicate: 'a',
      object: 'http://xmlns.com/foaf/0.1/Person'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

    const thirdTriple = {
      subject: 'http://openspring.net/scor#me',
      predicate: 'a',
      object: 'http://purl.org/dc/terms/Agent'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true);

    const fourthTriple = {
      subject: 'http://openspring.net/scor#me',
      predicate: 'http://schema.org/name',
      object: 'Stéphane Corlosquet'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fourthTriple), true);

    const fifthTriple = {
      subject: 'http://openspring.net/scor#me',
      predicate: 'http://schema.org/homepage',
      object: 'http://openspring.net/'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, fifthTriple), true);
  });

  it('Test 0311: Ensure no triples are generated when @property is empty : (Negative parser test)', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0311</title>
      </head>
      <body>
          <div>
            <span class="attribution-line">this photo was taken by
              <span property="">Stéphane Corlosquet</span>
            </span>
          </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0311.html'});
    const triples = flatten(blocks.map(b => b.context));
    assert.strictEqual(triples.length, 0)
  });

  it('Test 0312: Mute plain @rel if @property is present', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0312</title>
      </head>
      <body>
        <p vocab="http://schema.org/" typeof="Person">
          The homepage of <a href="http://example.org/" property="homepage" rel="nofollow">Some Body</a>.
        </p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0312.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0315: @property and @typeof with incomplete triples', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0315</title>
      </head>
      <body prefix="po: http://example.org/">
        <dl>
          <dt rel="po:role" class="role">
            <span typeof="po:Role" property="rdfs:label">Director</span>
          </dt>
          <dd></dd>
        </dl>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0315.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0316: @property and @typeof with incomplete triples (@href variant)', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0316</title>
      </head>
      <body prefix="po: http://example.org/">
        <dl>
          <dt rel="po:role" class="role">
            <a typeof="po:Role" property="rdfs:label" href="http://example.org/profiles/director.html">Director</a>
          </dt>
          <dd></dd>
        </dl>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0316.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0317: @datatype inhibits new @property behavior', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0316</title>
      </head>
      <body prefix="po: http://purl.org/ontology/po/">
        <dl>
          <dt rel="po:role" class="role">
            <a typeof="po:Role" property="rdfs:label" datatype="" href="http://example.org/profiles/director.html">Director</a>
          </dt>
          <dd></dd>
        </dl>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0317.html'});
    const triples = flatten(blocks.map(b => b.context));
    
    const firstTriple = {
      subject: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0317.html',
      predicate: 'http://purl.org/ontology/po/role',
      object: 'http://example.org/profiles/director.html'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://example.org/profiles/director.html',
      predicate: 'a',
      object: 'http://purl.org/ontology/po/Role'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

    const thirdTriple = {
      subject: 'http://example.org/profiles/director.html',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#label',
      object: 'Director'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true);
  });

  it('Test 0318: Setting @vocab to empty strings removes default vocabulary', function() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test 0318</title>
        </head>
        <body>
          <div vocab="http://xmlns.com/foaf/0.1/">
            <div about ="#me">
              <p property="name">Ivan Herman</p>
              <meta vocab="" property="prop" content="value"/>
            </div>
          </div>
        </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0318.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0321: rdfa:copy to rdfa:Pattern', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0321</title>
      </head>
      <body vocab="http://schema.org/">
        <div typeof="Person">
          <link property="rdfa:copy" resource="_:a"/>
        </div>
        <p resource="_:a" typeof="rdfa:Pattern">Name: <span property="name">Amanda</span></p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0321.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0322: rdfa:copy for additional property value', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0322</title>
      </head>
      <body vocab="http://schema.org/">
        <div typeof="Person">
          <p>My name is <span property="name">Gregg</span></p>
          <link property="rdfa:copy" resource="_:surname"/>
        </div>
        <p resource="_:surname" typeof="rdfa:Pattern">My name is <span property="name">Kellogg</span></p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0322.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0323: Multiple references to rdfa:Pattern', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0323</title>
      </head>
      <body>
        <div typeof="schema:Person">
          <link property="rdfa:copy" resource="_:a"/>
        </div>
        <div typeof="foaf:Person">
          <link property="rdfa:copy" resource="_:a"/>
        </div>
        <p resource="_:a" typeof="rdfa:Pattern">Name: <span property="schema:name foaf:name">Amanda</span></p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0323.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0324: Multiple references to rdfa:Pattern details', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0323</title>
      </head>
      <body>
        <div typeof="schema:Person">
          <link property="rdfa:copy" resource="_:a"/>
        </div>
        <div typeof="foaf:Person">
          <link property="rdfa:copy" resource="_:a"/>
        </div>
        <p resource="_:a" typeof="rdfa:Pattern">Name: <span property="schema:name foaf:name">Amanda</span></p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0324.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0325: Multiple references to rdfa:Pattern creating a resource', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <base href="http://example.org/"/>
        <title>Test 0325</title>
      </head>
      <body vocab="http://schema.org/">
        <div resource="#foo" typeof=""><link property="rdfa:copy" resource="_:a"/></div>
        <div resource="#bar" typeof=""><link property="rdfa:copy" resource="_:a"/></div>
        <div resource="_:a" typeof="rdfa:Pattern">
          <div property="schema:refers-to" typeof="">
            <span property="schema:name">Amanda</span>
          </div>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0324.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0325: Multiple references to rdfa:Pattern creating a resource', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <base href="http://example.com/"/>
        <title>Test 0326</title>
      </head>
      <body vocab="http://schema.org/">
        <div resource="#referencing" typeof="Person">
          <link property="rdfa:copy" resource="#referenced"/>
        </div>
        <p resource="#referenced" typeof="rdfa:Pattern">Name: <span property="name">Bella</span></p>
        <p resource="#unreferenced" typeof="rdfa:Pattern">Name: <span property="name">Lola</span></p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0325.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0326: rdfa:Pattern removed only if referenced', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <base href="http://example.com/"/>
        <title>Test 0326</title>
      </head>
      <body vocab="http://schema.org/">
        <div resource="#referencing" typeof="Person">
          <link property="rdfa:copy" resource="#referenced"/>
        </div>
        <p resource="#referenced" typeof="rdfa:Pattern">Name: <span property="name">Bella</span></p>
        <p resource="#unreferenced" typeof="rdfa:Pattern">Name: <span property="name">Lola</span></p>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0326.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0327: rdfa:Pattern chaining', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <base href="http://example.com/"/>
        <title>Test 0327</title>
      </head>
      <body>
        <div typeof="schema:Person">
          <link property="rdfa:copy" resource="_:a"/>
          <link property="rdfa:copy" resource="_:b"/>
        </div>
        <p resource="_:a" typeof="rdfa:Pattern">Name: <span property="schema:name">Amanda</span></p>
        <div resource="_:b" typeof="rdfa:Pattern">
          <div property="schema:band" typeof=" schema:MusicGroup">
            <link property="rdfa:copy" resource="_:c"/>
          </div>
        </div>
        <div resource="_:c" typeof="rdfa:Pattern">
        <p>Band: <span property="schema:name">Jazz Band</span></p>
        <p>Size: <span property="schema:size">12</span> players</p>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0327.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0328: @content overrides the content of the time element.', function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <base href="http://example.com/"/>
        <title>Test 0327</title>
      </head>
      <body>
        <div typeof="schema:Person">
          <link property="rdfa:copy" resource="_:a"/>
          <link property="rdfa:copy" resource="_:b"/>
        </div>
        <p resource="_:a" typeof="rdfa:Pattern">Name: <span property="schema:name">Amanda</span></p>
        <div resource="_:b" typeof="rdfa:Pattern">
          <div property="schema:band" typeof=" schema:MusicGroup">
            <link property="rdfa:copy" resource="_:c"/>
          </div>
        </div>
        <div resource="_:c" typeof="rdfa:Pattern">
        <p>Band: <span property="schema:name">Jazz Band</span></p>
        <p>Size: <span property="schema:size">12</span> players</p>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0328.html'});
    const triples = flatten(blocks.map(b => b.context));
   // Blank nodes
  });

  it('Test 0329: Recursive triple generation', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="foaf: http://xmlns.com/foaf/0.1/">
      <head>
        <title>Test 0329</title>
      </head>
      <body>
        <div about="http://example.org/foaf#me" property="foaf:name">
          <span property="foaf:givenName">John</span> 
          <span property="foaf:familyName">Doe</span> 
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0329.html'});
    const triples = flatten(blocks.map(b => b.context));

    const firstTriple = {
      subject: 'http://example.org/foaf#me',
      predicate: 'http://xmlns.com/foaf/0.1/familyName',
      object: 'Doe'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://example.org/foaf#me',
      predicate: 'http://xmlns.com/foaf/0.1/givenName',
      object: 'John'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

    const thirdTriple = {
      subject: 'http://example.org/foaf#me',
      predicate: 'http://xmlns.com/foaf/0.1/name',
      object: '\n          John \n          Doe \n        '
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true);
  });

  it('Test 0330: @datatype overrides inherited @lang', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dcterms: http://purl.org/dc/terms/ xsd: http://www.w3.org/2001/XMLSchema#">
      <head>
        <title>Test 0330</title>
      </head>
      <body lang="en" xml:lang="en">
        <div property="dc:date" datatype="xsd:date">2010-11-12</div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0330.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it('Test 0331: @datatype overrides inherited @lang, with @content', function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dcterms: http://purl.org/dc/terms/">
      <head>
        <title>Test 0331</title>
      </head>
      <body lang="en" xml:lang="en">
        <div property="dcterms:language" datatype="dcterms:RFC5646" content="af">Afrikaans</div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0331.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it("Test 0332: Empty @datatype doesn't override inherited @lang, with @content", function() {
    const html = `
      <!DOCTYPE html>
      <html prefix="dcterms: http://purl.org/dc/terms/">
      <head>
        <title>Test 0332</title>
      </head>
      <body lang="en" xml:lang="en">
        <div property="dcterms:language" datatype="" content="af">Afrikaans</div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0332.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it("Test 0333: @content overrides @datetime (with @datatype specified)", function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0279</title>
      </head>
      <body>
        <time property="rdf:value" content="2012-03-12" datetime="2012-03-11" datatype="xsd:date">10 March 2012 at midnight</time>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0333.html'});
    const triples = flatten(blocks.map(b => b.context));
    //Blank nodes
  });

  it("Test 0334: @resource changes the current subject for the nested elements", function() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test 0334: @resource changes the current subject for the nested elements</title>
      </head>
      <body>
        <div vocab="http://schema.org/" resource="http://example.org/base">
          <a property="uri" href="http://example.orb/val1">Not This</a>
          <div resource="http://greggkellogg.net/#me">
            <a property="name" rel="homepage foaf:homepage" href="http://greggkellogg.net/">Gregg Kellogg</a>
          </div>
        </div>
      </body>
      </html>
    `
    const dom = new jsdom.JSDOM(html);
    const domNode = dom.window.document.querySelector('html');
    const blocks = analyse(domNode, [], {documentUrl: 'http://rdfa.info/test-suite/test-cases/rdfa1.1/html5/0334.html'});
    const triples = flatten(blocks.map(b => b.context));
    console.log(JSON.stringify(triples))
    
    const firstTriple = {
      subject: 'http://example.org/base',
      predicate: 'http://schema.org/uri',
      object: 'http://example.orb/val1'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, firstTriple), true);

    const secondTriple = {
      subject: 'http://greggkellogg.net/#me',
      predicate: 'http://schema.org/name',
      object: 'Gregg Kellogg'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, secondTriple), true);

    const thirdTriple = {
      subject: 'http://greggkellogg.net/#me',
      predicate: 'http://xmlns.com/foaf/0.1/homepage',
      object: 'http://greggkellogg.net/'
    } 
    assert.strictEqual(tripleAppearsInArray(triples, thirdTriple), true);
  });
});
