// Clase con los runners
const fs= require("fs");
// Regexp?
const { parse } = require('../parser/parse.js');
const { topEnv, specialForms } = require('./environment.js');
const { Apply, Word, Value } = require('./ats.js');

let env;
let tree;

function run(program) {
    tree = parse(program);
    return eval(tree);
}
  
function runFromFile(fileName) {
    try {
        let program = fs.readFileSync(fileName, 'utf8');
        return run(program);
    }
    catch (err) {
        console.log(err);
    }
}

function runFromEVM(fileName) {
    try {
        let json = fs.readFileSync(fileName, 'utf8');
        return interpretFromPlainAst(json);
    }
    catch (err) {
        console.log(err);
    }
}

function interpretFromPlainAst(json) {
    const tree = json2AST(JSON.parse(json));
    const env = Object.create(topEnv);
    return tree.evaluate(env);
}

function json2AST(jsonObj){
    switch(jsonObj.type) {
        case 'value':
          return new Value(jsonObj.value);
          break;
        case 'word':
          return new Word(jsonObj.name);
          break;
        case 'apply':
          return new Apply(json2AST(jsonObj.operator), jsonObj.args.map(json2AST));
          break;      
        default: 
          throw new SyntaxError('Invalid node in JSON' + JSON.stringify(jsonObj, null, '\t'));
    }
}


function eval(tree, env){
    if(env === undefined || env === null){
        env= Object.create(topEnv);
    }
    return (tree !== null) ? tree.evaluate(env) : null;
}



module.exports = {
    run,
    runFromFile, 
    runFromEVM
};