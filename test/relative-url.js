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
    console.log(JSON.stringify(triples))
    
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

});
