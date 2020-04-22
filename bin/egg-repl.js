const XRegExp= require('xregexp');
let inspect= require("util").inspect;
let ins= (x) => inspect(x, {depth: null});
let readline= require('readline');
let egg= require('../lib/eggvm.js');
//require("../lib/extensions");
let topEnv= require('../package.json');
let specialForms= egg.specialForms;
let parser= egg.parser;
let parse= parser.parse;
const {BLUE, RED, DEFAULT} = require("../lib/colors.js");
const PROMPT= DEFAULT+"> ";

const ALLWHITE= new XRegExp(egg.parser.WHITES.source+"$");
const LP= parser.LP;
const RP= parser.RP;
const getTokens= parser.getTokens;
const parseBalance= parser.parseBalance;

const eggExit= specialForms["exit"] = () => {
    console.log("GOODBYE!")
    process.exit(0);
}

function eggRepl(){
    let program= "";
    let stack= 0;
    
    try{
        let rl= readline.createInterface({input: process.stdin, output: process.stdout, completer});
        console.log("test")
        rl.prompt(PROMPT);
        console.log("GERMAN_EGG [version: " +topEnv["version"] + "(beta) - (nonfuncional)]");
        rl.prompt();

        rl.on('line', function(line){
            stack+= parseBalance(line);

            line= line +'\n';
            program+= line;

            if(stack<=0 && !ALLWHITE.test(program)){
                try{
                    r= egg.run(program);
                    console.log(ins(r));
                }
                catch(error){
                    console.log("ERROR: " + error.message);
                }
                program= "";
                stack= 0;
            }
            rl.setPrompt(PROMPT + "..".repeat(stack));
            rl.prompt();
        });

        rl.on('close', eggExit);

        rl.on('SIGINT', () => {
            console.log("Expression discarded!");
            program= "";
            stack= 0;
            rl.setPrompt(PROMPT);
            rl.prompt();
        });

    }
    catch(error){
        console.log(error.message);
    }

    process.stdin.on("end", eggExit);

    function completer(line){
        let tokens= getTokens(line);
        var word= tokens.filter((t)=> t && t.type === 'WORD').pop().value;
        let allKeys= Object.keys(specialForms).concat(Object.keys(topEnv));
        var hits= allKeys.filter((key)=> key.startsWith(word));
        return [hits, word];
    }
}

module.exports= eggRepl;