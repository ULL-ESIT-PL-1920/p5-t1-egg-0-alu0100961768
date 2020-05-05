// Clase con los runners
const fs= require("fs");
// Regexp?
const { parse } = require('../parser/parse.js');
const { topEnv, specialForms } = require('./environment.js');
const { Apply, Word, Value } = require('./ats.js');


function run(program) {
    let env = Object.create(topEnv);
    let tree = parse(program);
    //debugger;
    return tree.evaluate(env);
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
        let tree = JSON.parse(json);
        let env = Object.create(topEnv);
        return evaluate(tree, env);
    }
    catch (err) {
        console.log(err);
    }
}

//interpretFromPlainAST
//FromJSONtoRichAST

module.exports = {
    run,
    runFromFile, 
    runFromEVM, 
    //evaluate
};