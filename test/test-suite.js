import { analyse } from '../src/rdfa-context-scanner';
import jsdom from 'jsdom';

var assert = require('assert');

describe( 'Test suite', function() {
  describe( "can run tests", function(){
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });

  describe( "can access imports", function() {
    it("has analyse", function() {
      assert.ok( analyse );
    });

    it("has JSDOM", function() {
      assert.ok( jsdom );
    });
  });

  describe( "can use JSDOM", function() {
    it("accepts no RDFa", function(){
      const dom = new jsdom.JSDOM( `<body><h1>hello</h1></body>` );
      assert.ok( dom );
    });

    it("accepts RDFa", function() {
      const dom = new jsdom.JSDOM( `<body prefix="foaf: http://xmlns.com/foaf/0.1/"><span property="foaf:name">Aad</span></body>` );
      assert.ok( dom );
    });
  });

  describe( "can use analyse", function() {
    it("accepts no RDFa", function(){
      const dom = new jsdom.JSDOM( `<body><h1>hello</h1></body>` );
      assert.ok( dom, "We should have a dom" );
      const topDomNode = dom.window.document.querySelector('body');
      const analysis = analyse( topDomNode );
      assert.ok( analysis, "We should have an empty parsed state" );
    });

    it("accepts RDFa", function(){
      const dom = new jsdom.JSDOM( `<body prefix="foaf: http://xmlns.com/foaf/0.1/"><span property="foaf:name">Aad</span></body>` );
      assert.ok( dom );
      const topDomNode = dom.window.document.querySelector('body');
      const analysis = analyse( topDomNode );
      assert.ok( analysis, "We should have a parsed state" );
    });
  });
});
