var assert = require('assert');
var Triple = require('../triple');
var RdfaBlock = require('../rdfa-block');
var factory = require('@rdfjs/data-model');

describe( 'rdfjs support', function() {
  describe( "triple", function() {
    it('should return a valid RDFJS Quad', function() {
      const example = new Triple({
        subject: "http://simple-example.org",
        predicate: "http://purl.org/dc/terms/subject",
        object: "http://other-example.org/",
        datatype: "http://www.w3.org/2000/01/rdf-schema#Resource"
      });
      const returned = example.toQuad();
      const expected = factory.quad(
        factory.namedNode("http://simple-example.org"),
        factory.namedNode("http://purl.org/dc/terms/subject"),
        factory.namedNode("http://other-example.org/")
      );
      console.log(returned);
      assert(returned.equals(expected));
    });
  });
  describe("rdfa-block", function() {
    it("should return a valid RDFJS dataset", function () {
      const example = new Triple({
        subject: "http://simple-example.org",
        predicate: "http://purl.org/dc/terms/subject",
        object: "http://other-example.org/",
        datatype: "http://www.w3.org/2000/01/rdf-schema#Resource"
      });
      const block = new RdfaBlock({
        start: 0,
        end: 9,
        text: "something",
        context: [example]
      });
      const expected = factory.quad(
        factory.namedNode("http://simple-example.org"),
        factory.namedNode("http://purl.org/dc/terms/subject"),
        factory.namedNode("http://other-example.org/")
      );
      const returned = block.rdfDataset();
      assert(returned.has(expected));
    });
  });
});
