var should = require("should");
var parser = require('../lib/parse.js');

describe("parse", function() {
    it("should parse numbers and leave rest", function() {
      var value = { type: 'value', value: 1 };
      parser.setProgram('1');
      parser.lex();
      parser.parseExpression().should.eql(value);
    })
    it("should parse strings", function() {
      parser.setProgram('"s"');
      parser.lex();
      var value = { type: 'value', value: 's' }
      parser.parseExpression('"s"').should.eql(value);
    })
    it("should parse word not followed by '('", function() {
      parser.setProgram('word');
      parser.lex();
      var value = { type: 'word', name: 'word' };
      parser.parseExpression('word').should.eql(value);
    })
    it("should parse apply if word followed by '('", function() {
      parser.setProgram('word(a)');
      parser.lex();
      var value = { 
        type: 'apply',
        operator: { type: 'word', name: 'word' },
        args: [ { type: 'word', name: 'a' } ],
        line:1
      };
      parser.parseExpression('word ( a )').should.eql(value);
    })
    it("should have syntax error if not valid", function() {
        (function(){parser.parseExpression('')}).should.throw(Error);
        (function(){parser.parseExpression('a(,')}).should.throw(Error);
        (function(){parser.parseExpression('a( )(')}).should.throw(Error);
        (function(){parser.parseExpression('a(, )')}).should.throw(Error);
        (function(){parser.parseExpression('+(')}).should.throw(Error);
    })
    it("parse should work well otherwise", function(){
        var value = 
          { type: 'apply',
            line:1,
            operator: { type: 'word', name: '+' },
            args: [ { type: 'word', name: 'a' }, { type: 'word', name: 'b' } ] }
        parser.parse("+(a,b)").should.eql(value);
    })
})