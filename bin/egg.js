#!/usr/bin/env node
const commander = require('commander');
const {runFromFile, runFromEVM}  = require('../lib/interp/eggvm');
const {parseFromFile}  = require('../lib/parser/parse.js');

commander
    .version(require('../package.json').version)
    .option('-c --compile <fileName>', 'compile the input egg program to produce a JSON containing the input egg AST')
    .option('-i --interpret <fileName>', 'interpret the input egg AST')
    .option('-r --run <fileName>', 'compile and run the input egg program')
    .parse(process.argv);

// Run the proper function or the REPL
if (commander.run) {
    runFromFile(commander.run);
}
else if (commander.compile) {
    parseFromFile(commander.compile);
}
else if (commander.interpret) {
    runFromEVM(commander.interpret);
}
else {
    require('../lib/legacy/egg-repl');
}