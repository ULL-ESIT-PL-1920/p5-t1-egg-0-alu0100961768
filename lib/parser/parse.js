// Análisis Sintáctico
const inspect = require("util").inspect;
let ins = (x) => inspect(x, {depth:null});
let fs = require("fs");
const { Apply, Word, Value } = require('../interp/ats.js');
//const {lex} = require('./lexer.js'); // ??


let program;
let lookahead;
let lineno = 1;

let setProgram = function(prg) {
  program = prg;
  lineno = 1;
  return {program, lineno}
};

let getProgram = function() {
  return {program, lineno}
};


const WHITES = /^(\s|[#;].*|\/\*(.|\n)*?\*\/)*/;
const STRING = /^"((?:[^"\\]|\\.)*)"/;
const NUMBER = /^([-+]?\d*\.?\d+([eE][-+]?\d+)?)/;
const WORD   = /^([^\s(),\]\["]+)/; // No se niega el dígito ni el signo.
const LP     = /^([({]|\[)/;
const RP     = /^([)}]|\])/;
const COMMA  = /^(,)/;
const NEWLINE = /\r\n|\r|\n/;



function lex() {
    let match;

    match = WHITES.exec(program);
    if (NEWLINE.test(match[0])) {
      lineno += match[0].split(NEWLINE).length-1;
    }
    program = program.slice(match[0].length);

    if (program.length > 0) {
      if (match = STRING.exec(program)) {
        lookahead = { type: "STRING", value: match[1]}
      } else if (match = NUMBER.exec(program)) {
        lookahead = {type: "NUMBER", value: Number(match[1])};
      } else if (match = LP.exec(program)) { 
        lookahead = {type: "LP", value: match[1]};
      } else if (match = COMMA.exec(program)) {
        lookahead = {type: "COMMA", value: match[1]};
      } else if (match = RP.exec(program)) {
        lookahead = {type: "RP", value: match[0]};
      } else if (match = WORD.exec(program)) {
        lookahead = {type: "WORD", value: match[1]};
      } else {
        throw new SyntaxError(`Unexpect syntax line ${lineno}: ${program.slice(0,10)}`);
      }
      program = program.slice(match[0].length);
    }
    else {
      lookahead = null; // End of input reached!
    }
    return lookahead;
}


function parseExpression() {
  let expr;

  //debugger;
  if (lookahead.type == "STRING") {
    expr = new Value(lookahead.value);
    lex();
    return expr;
  } else if (lookahead.type == "NUMBER") {
    expr= new Value(lookahead.value);
    lex();
    return expr;
  } else if (lookahead.type == "WORD") {
    word= new Word(lookahead.value);
    lex();
    expr= parseApply(word);
    return expr;
  } else {
    throw new SyntaxError(`Unexpected syntax line ${lineno}: ${program.slice(0,10)}`);
  }
}

function parseApply(tree) {
  if (!lookahead) return tree;   // apply: /* vacio */
  if (lookahead.type !== "LP") return tree; // apply: /* vacio */

  lex();

  tree = new Apply(tree, []);
  while (lookahead && lookahead.type !== "RP") {
    let arg = parseExpression();
    //console.log(tree.args);
    tree.args.push(arg);

    if (lookahead && lookahead.type == "COMMA") {
      lex();
    } else if (!lookahead || lookahead.type !== "RP") {
      throw new SyntaxError(`Expected ',' or ')'  at line ${lineno}: ... ${program.slice(0,20)}`);
    }
  }
  if (!lookahead)  throw new SyntaxError(`Expected ')'  at line ${lineno}: ... ${program.slice(0,20)}`);
  lex();

  return parseApply(tree);
}

function parse(p) {
  setProgram(p);
  lex();
  let result = parseExpression();
  //console.log("result = ",inspect(result, {depth: null}));
  if (lookahead !== null) 
    throw new SyntaxError(`Unexpected input after reached the end of parsing ${lineno}: ${program.slice(0,10)}`);

  return result;
}

function parseFromFile(fileName) {
  try {
    let program = fs.readFileSync(fileName, 'utf8');
    let tree = parse(program);
    let json = JSON.stringify(tree, null, "  ");
    fs.writeFileSync(fileName+".evm", json);
  }
  catch (err) {
    console.log(err);
  }
}

function getTokens(code){
  setProgram(code);
  const tokens= [];

  
  do{
    tokens.push(lex());
  }
  while(lookahead);
  tokens.pop();

  return tokens;
}




function parseBalance(line){
  var lpc= (line.match(/[(]/g) || []).length;
  var rpc= (line.match(/[)]/g) || []).length;
  let total= lpc - rpc;
  return total;
}



module.exports = {
  getProgram,
  parse,
  parseApply,
  parseExpression,
  parseFromFile,
  setProgram,
  getTokens,
  parseBalance
};

