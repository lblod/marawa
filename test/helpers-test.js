import { makeDom, makeDomElement, analyseElement } from './helpers';

const assert = require('assert');

describe( "Test helpers", function() {
  describe( "can create DOM tree", function() {
    it( "exports makeDom function", function() {
      assert.ok( makeDom );
    });

    it( "can execute create DOM tree", function() {
      assert.ok( makeDom("<body>Hello!</body>") );
    });

    it( "allows to retrieve a nested element", function() {
      const dom = makeDom("<body>hello!</body>");
      const bodyTag = dom.window.document.querySelector("body");
      assert.ok( bodyTag );
      assert.equal( bodyTag.innerHTML, "hello!", "Tag's content was correctly set" );
    });

    it( "correctly sets more deeply nested HTML", function() {
      const dom = makeDom("<body><div>Hello</div> <span>World!</span></body>");
      const bodyTag = dom.window.document.querySelector("body");
      const childNodes = bodyTag.childNodes;
      assert.equal( childNodes.length, 3, "Should have three child nodes" );
      const children = bodyTag.children;
      assert.equal( children.length, 2, "Should have two child elements" );
      assert.ok( bodyTag.querySelector("div"), "Should find a div node" );
      assert.ok( bodyTag.querySelector("span"), "Should find a span node" );
      assert.ok( ! bodyTag.querySelector("p"), "Should not find a span node" );
    });
  });

  describe( "can create a dom node", function() {
    it( "exports makeDomElement", function() {
      assert.ok( makeDomElement );
    });

    it( "constructs a dom node", function() {
      const pTag = makeDomElement("<p>1234</p>");
      assert.ok( pTag, "should return something" );
      assert.equal( pTag.tagName, "P", "should be a p tag" );
      assert.equal( pTag.innerHTML, "1234" );
    });

    it( "constructs nested nodes", function() {
      const body = makeDomElement("<div><h1>Hello there</h1><p>This is our page</p></div>");
      assert.ok( body, "should have a body tag" );
      assert.equal( body.children.length, 2, "should have two child tags" );
    });
  });

  describe( "can analyse dom element", function() {
    it("has an analyseElement helper", function(){
      assert.ok( analyseElement );
    });

    it("can analyse simple DOM elements", function() {
      const context = analyseElement("<div>Hello</div>");
      assert.ok( context );
      assert.equal( context.length, 1, "Should have one top level context" );
    });
  });
});
