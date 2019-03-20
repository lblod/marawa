import { analyse } from '../src/rdfa-context-scanner';
import jsdom from 'jsdom';

var assert = require('assert');

describe( 'Example cases', function() {
  describe( "can analyse single statements", function(){
    it('should create a single context for no RDFa', function() {
      assert.ok( true );
    });
  });
});
