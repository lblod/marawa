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



});
