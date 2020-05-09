var should = require("should");
var parser = require('../lib/parser/parse.js');
const { Apply, Word, Value } = require('../lib/interp/ats.js');

describe("Basics", function() {
    it("should parse numbers and leave rest", function() {
      var value= new Value(1);
      parser.setProgram('1');
      parser.lex();
      parser.parseExpression().should.eql(value);
    })
    it("should parse strings", function() {
      parser.setProgram('"s"');
      parser.lex();
      var value = new Value('s');
      parser.parseExpression('"s"').should.eql(value);
    })
    it("should parse word not followed by '('", function() {
      parser.setProgram('word');
      parser.lex();
      var value = new Word('word');
      parser.parseExpression('word').should.eql(value);
    })
    it("should parse apply if word followed by '('", function() {
      parser.setProgram('word(a)');
      parser.lex();
      var value = new Apply (new Word('word'), [ new Word('a') ] );
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
        var a = new Word('a');
        var b = new Word('b');
        var c= [a, b];
        var value = new Apply (new Word('+'), [ a, b ] );
        parser.parse("+(a,b)").should.eql(value);
    })
})


var eggvm= require('../lib/interp/eggvm.js');

describe("p5-t1-egg-0", function() {

  it("one.egg", function(){
    eggvm.run(`
    do(
      define(x, 4),
      define(setx, fun(val, 
          set(x, val)
        )
      ),
      setx(50)
    )
    `).should.eql(50);
  })

  it("two.egg", function(){
    eggvm.run(`
    do(
      define(sum,  # function
        fun(nums, other,
          do(
             define(i, 0),
             define(sum, 0),
             while(<(i, length(nums)),
               do(define(sum, +(sum, element(nums, i))),
                  define(i, +(i, 1))
               )
             ),
             sum
          )
       )
     ),
     sum(array(1, 2, 3), 4)
    )
    `).should.eql(6);
  })

  it("scope-err.egg", (function() {
    (function(){
      eggvm.run(`
        do(
          set(x,9),
          print(x) # ReferenceError: Tried setting an undefined variable: x
        )
      `)
    }).should.throw(Error);
  }))

  it("scope.egg", function(){
    eggvm.run(`
    do(
      def(x,9),
      /* def crea una nueva variable local */
      def(f, fun{
        do{
          def(x, 4) # 4
        }
      }),
      /* set no crea una nueva variable local */
      def(g, fun{set(x, 8)}),
      f(), #9
      g()  #8
    )
    `).should.eql(8);
  })

})
