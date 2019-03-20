import { analyseElement } from './helpers';

var assert = require('assert');

describe( 'Example cases', function() {
  describe( "can analyse single statements", function(){
    it('should create a single context when no RDFa is present', function() {
      assert.equal( analyseElement("<div>hello</div>").length, 1, "Expect one top-level element in all cases");
    });

    it("should create a single block when top-level contains RDFa information", function() {
      const blocks = analyseElement(`<div prefix="foaf: http://xmlns.com/foaf/0.1/" about="#">Hello world</div>`);
      assert.equal( blocks.length, 1, "Should have one context for top-level element" );
    });

    it("should create a single context when top-level contains RDFa description", function() {
      const blocks = analyseElement(`<div prefix="foaf: http//xmlns.com/foaf/0.1/" about="#" property="foaf:name">John Johnson</div>`);
      assert.equal( blocks.length, 1, "Should have one context for top-level element" );
      const [firstBlock] = blocks;
      assert.equal( firstBlock.context.length, 1, "Should have one RDFa context attached to logical block.");
    });

    it("should store a correct context for the top-level context", function() {
      const [block] = analyseElement(`<div prefix="foaf: http//xmlns.com/foaf/0.1/" about="#" property="foaf:name">John Johnson</div>`);
      assert.equal( block.context.length, 1, "Should have one RDFa context attached to logical block.");
      const context = block.context[0];
      assert.equal( context.subject, "#", "Subject is set top-level");
      assert.equal( context.predicate, "http//xmlns.com/foaf/0.1/name", "Predicate should be expanded predicate");
      assert.equal( context.object, "John Johnson", "Object should be primitive value");
    });

    it("should correctly analyse nested single statements", function() {
      const blocks = analyseElement(`<div prefix="foaf: http://xmlns.com/foaf/0.1/ ext: http://mu.semte.ch/vocabularies/ext/" about="#">My name is <span property="foaf:name">Schlim Scheyday</span>, yo.</div>`);
      assert.ok( blocks, "Should have blocks");
      assert.equal( blocks.length, 3, "Should have three logical blocks" );
      const mainBlock = blocks[1];
      assert.equal( mainBlock.start, 11, "String content starts at position 11");
      assert.equal( mainBlock.end, 26, "String content ends at position 26 (start:11 + length:15)");
      const mainContexts = mainBlock.context;
      assert.equal( mainContexts.length, 1, "Should have one RDFa context in the main block" );
      const mainContext = mainContexts[0];
      assert.equal( mainContext.subject, "#", "Subject is the parent's subject" );
      assert.equal( mainContext.predicate, "http://xmlns.com/foaf/0.1/name", "Predicate is extended form of foaf:name" );
      assert.equal( mainContext.object, "Schlim Scheyday", "attribute content should be the content of the tag");
    });

    it("should correctly handle simple nested statements", function() {
      const blocks = analyseElement(`<div prefix="foaf: http://xmlns.com/foaf/0.1/ ext: http://mu.semte.ch/vocabularies/ext/" about="#slim">My name is <span property="foaf:name">Schlim Scheyday</span> and my age is <span property="ext:age">42</span>.</div>`);
      assert.ok( blocks, "Content should be scanned" );
      assert.equal( blocks.length, 5, "Should have 5 reduced RDFa blocks" );
      const [ nameContext, ageContext ] = [ blocks[1].context[0], blocks[3].context[0] ];
      // Name context validations
      assert.equal( nameContext.subject, "#slim", "Name is about #slim" );
      assert.equal( nameContext.predicate, "http://xmlns.com/foaf/0.1/name", "First context sets the foaf:name which should be expanded in the property" );
      assert.equal( nameContext.object, "Schlim Scheyday", "First context sets the name which is Schlim Scheyday" );
      // Age context validations
      assert.equal( ageContext.subject, "#slim", "Age is about #slim" );
      assert.equal( ageContext.predicate, "http://mu.semte.ch/vocabularies/ext/age", "Second context is expanded form of ext:age");
      assert.equal( ageContext.object, "42", "Age is set to 42" );
    });

    it("should correctly handle nested object definitions", function() {
      const blocks = analyseElement(`<div prefix=prefix="foaf: http://xmlns.com/foaf/0.1/ ext: http://mu.semte.ch/vocabularies/ext/" resource="#me" typeof="foaf:Person">My name is <span property="foaf:name">Johnny</span> and I have an <span property="foaf:account" typeof="foaf:OnlineAccount" resource="#myAccount">account named <span property="foaf:accountName">ZupahMail</span> which you can find at <a href="http://zupah.redpencil.io/" property="foaf:accountServiceHomepage">zupah</a>.</span></div>`);
      const mainRdfaContext = blocks[0].context[0];
      assert.ok( mainRdfaContext );
      // Check the wrapping context
      assert.equal( mainRdfaContext.subject, "#me", "Subject should be consumed" );
      assert.equal( mainRdfaContext.predicate, "a", "The a property is not expanded" );
      assert.equal( mainRdfaContext.object, "http://xmlns.com/foaf/0.1/Person", "object should be expanded" );
      // Check the first child's contents
      const nameRdfaContext = blocks[1].context[1];
      assert.equal( nameRdfaContext.subject, "#me", "Name is set on #me" );
      assert.equal( nameRdfaContext.predicate, "http://xmlns.com/foaf/0.1/name", "Epanded form of foaf:name" );
      assert.equal( nameRdfaContext.object, "Johnny", "Name literal set in the tag" );
      // Check the accounts existence - text in myAccount
      const accountPredicateRdfaContext = blocks[3].context[1];
      assert.equal( accountPredicateRdfaContext.subject, "#me", "#myAccount is linked to #me" );
      assert.equal( accountPredicateRdfaContext.predicate, "http://xmlns.com/foaf/0.1/account", "#myAccount is linked through foaf:account" );
      assert.equal( accountPredicateRdfaContext.object, "#myAccount", "identifier for my account is #myAccount");
      const accountResourceContext = blocks[3].context[2];
      assert.equal( accountResourceContext.subject, "#myAccount", "#myAccount has a type" );
      assert.equal( accountResourceContext.predicate, "a", "type of #myAccount is set by 'a' keyword" );
      assert.equal( accountResourceContext.object, "http://xmlns.com/foaf/0.1/OnlineAccount", "The type of #myAccount is foaf:OnlineAccount" );
      // Check the accounts properties
      const accountNameRdfaContext = blocks[4].context[3];
      assert.equal( accountNameRdfaContext.subject, "#myAccount" );
      assert.equal( accountNameRdfaContext.predicate, "http://xmlns.com/foaf/0.1/accountName" );
      assert.equal( accountNameRdfaContext.object, "ZupahMail");
      // Check the account's knowledge within accountNameRdfaContext
      const inAccountNameAccountPredicateRdfaContext = blocks[4].context[1];
      assert.equal( inAccountNameAccountPredicateRdfaContext.subject, "#me", "in account name - #myAccount is linked to #me" );
      assert.equal( inAccountNameAccountPredicateRdfaContext.predicate, "http://xmlns.com/foaf/0.1/account", "in account name - #myAccount is linked through foaf:account" );
      assert.equal( inAccountNameAccountPredicateRdfaContext.object, "#myAccount", "in account name - identifier for my account is #myAccount");
      const inAccountNameAccountResourceContext = blocks[4].context[2];
      assert.equal( inAccountNameAccountResourceContext.subject, "#myAccount", "in account name - #myAccount has a type" );
      assert.equal( inAccountNameAccountResourceContext.predicate, "a", "in account name - type of #myAccount is set by 'a' keyword" );
      assert.equal( inAccountNameAccountResourceContext.object, "http://xmlns.com/foaf/0.1/OnlineAccount", "in account name - The type of #myAccount is foaf:OnlineAccount" );
      // Check the account's serviceHomepage
      const accountServiceHomepageContext = blocks[6].context[3];
      assert.equal( accountServiceHomepageContext.subject, "#myAccount" );
      assert.equal( accountServiceHomepageContext.predicate, "http://xmlns.com/foaf/0.1/accountServiceHomepage" );
      assert.equal( accountServiceHomepageContext.object, "http://zupah.redpencil.io/");
    });
  });

  describe("Can handle empty elements", function(){
    it( "Allows RDFa in non-self-closing element within a resource", function() {
      const [block] = analyseElement(`<span prefixes="foaf:http://xmlns.com/foaf/0.1/" resource="#me" typeof="foaf:Person"><span property="foaf:name" content="madnificent"></span></span>`);
      const rdfaTypeContext = block.context[0];
      assert.equal( rdfaTypeContext.subject, "#me" );
      assert.equal( rdfaTypeContext.predicate, "a" );
      assert.equal( rdfaTypeContext.object, "http://xmlns.com/foaf/0.1/Person" );
      const rdfaNameContext = block.context[1];
      assert.equal( rdfaNameContext.subject, "#me" );
      assert.equal( rdfaNameContext.predicate, "http://xmlns.com/foaf/0.1/name" );
      assert.equal( rdfaNameContext.object, "madnificent" );
    });

    it( "Allows RDFa in a self-closing element within a resource", function() {
      const [block] = analyseElement(`<span prefixes="foaf:http://xmlns.com/foaf/0.1/" resource="#me" typeof="foaf:Person"><meta property="foaf:name" content="madnificent"/>></span>`);
      const rdfaTypeContext = block.context[0];
      assert.equal( rdfaTypeContext.subject, "#me" );
      assert.equal( rdfaTypeContext.predicate, "a" );
      assert.equal( rdfaTypeContext.object, "http://xmlns.com/foaf/0.1/Person" );
      const rdfaNameContext = block.context[1];
      assert.equal( rdfaNameContext.subject, "#me" );
      assert.equal( rdfaNameContext.predicate, "http://xmlns.com/foaf/0.1/name" );
      assert.equal( rdfaNameContext.object, "madnificent" );
    });

    it( "Allows RDFa in non-selfclosing element with resource relationship as last item", function() {
      const [block] = analyseElement(`<div prefix="besluit: http://data.vlaanderen.be/ns/besluit#" resource="#tweedeBehandeling" typeof="besluit:BehandelingVanAgendapunt"><span property="besluit:gebeurtNa" resource="#eersteBehandeling"></span></div>`);
      // The type is interpreted
      const rdfaTypeContext = block.context[0];
      assert.equal( rdfaTypeContext.subject, "#tweedeBehandeling" );
      assert.equal( rdfaTypeContext.predicate, "a" );
      assert.equal( rdfaTypeContext.object, "http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt");
      // The relationship is discovered
      const rdfaRelationshipContext = block.context[1];
      assert.equal( rdfaRelationshipContext.subject, "#tweedeBehandeling" );
      assert.equal( rdfaRelationshipContext.predicate, "http://data.vlaanderen.be/ns/besluit#gebeurtNa" );
      assert.equal( rdfaRelationshipContext.object, "#eersteBehandeling" );
    });

    it( "Allows RDFa in non-selfclosing element with resource relationship as last item inside of other text content", function() {
      const blocks = analyseElement(`<div prefix="besluit: http://data.vlaanderen.be/ns/besluit#" resource="#tweedeBehandeling" typeof="besluit:BehandelingVanAgendapunt">Hello <span property="besluit:gebeurtNa" resource="#eersteBehandeling"></span> world!</div>`);
      // The type is interpreted
      const rdfaTypeContext = blocks[1].context[0];
      assert.equal( rdfaTypeContext.subject, "#tweedeBehandeling" );
      assert.equal( rdfaTypeContext.predicate, "a" );
      assert.equal( rdfaTypeContext.object, "http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt");
      // The relationship is discovered
      const rdfaRelationshipContext = blocks[1].context[1];
      assert.equal( rdfaRelationshipContext.subject, "#tweedeBehandeling" );
      assert.equal( rdfaRelationshipContext.predicate, "http://data.vlaanderen.be/ns/besluit#gebeurtNa" );
      assert.equal( rdfaRelationshipContext.object, "#eersteBehandeling" );
    });

  });
});
