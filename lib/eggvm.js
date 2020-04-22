let insp = require("util").inspect;
let ins = (x) => insp(x, {depth:null});
let fs = require("fs");

let parser = require('./parse.js');
let parse = parser.parse;

function evaluate(expr, env) {
  switch(expr.type) {
    case 'value':
      return expr.value;

    case 'word':
      if (expr.name in env) {
        return env[expr.name];
      } else {
        throw new ReferenceError(`Undefined variable: ${expr.name}`);
      }

    case 'apply':
      if (expr.operator.type == 'word' && expr.operator.name in specialForms) {
        return specialForms[expr.operator.name](expr.args, env);
      }

      let op = evaluate(expr.operator, env);
      if (typeof op != "function") {
        throw new TypeError('Applying a non-function');
      }

      return op(...expr.args.map((arg) => evaluate(arg, env)));
  }
}

let specialForms = new Map;

specialForms['if'] = function(args, env) {
  if (args.length != 3) {
    throw new SyntaxError('Bad number of args to if');
  }

  if (evaluate(args[0], env) !== false) {
    return evaluate(args[1], env);
  } else {
    return evaluate(args[2], env);
  }
};

specialForms['while'] = function(args, env) {
  if (args.length != 2) {
    throw new SyntaxError('Bad number of args to while');
  }

  while(evaluate(args[0], env) !== false) {
    evaluate(args[1], env);
  }
  return false;
};

specialForms['do'] = function(args, env) {
  let value = false;

  args.forEach(function(arg) {
    value = evaluate(arg, env);
  });

  return value;
};

specialForms['def'] =specialForms['define']= specialForms[':=']= specialForms['='] = function(args, env) {
  if (args.length != 2 || args[0].type != 'word') {
    throw new SyntaxError('Bad use of define');
  }

  let value = evaluate(args[1], env);
  env[args[0].name] = value;
  return value;
};

specialForms['->'] =specialForms['fun'] = function(args, env) {
  if (!args.length) {
    throw new SyntaxError('Functions need a body.')
  }

  function name(expr) {
    if (expr.type != 'word') {
      throw new SyntaxError('Arg names must be words');
    }

    return expr.name;
  }

  let argNames = args.slice(0, args.length - 1).map(name);
  let body = args[args.length - 1];

  return function() {
    if (arguments.length != argNames.length) {
      throw new TypeError('Wrong number of arguments');
    }

    let localEnv = Object.create(env);
    for (let i = 0; i < arguments.length; i++) {
      localEnv[argNames[i]] = arguments[i];
    }

    return evaluate(body, localEnv);
  };
};

specialForms["set"] = function(args, env) {
  if (args.length != 2 || args[0].type != 'word') {
    throw new SyntaxError('Bad use of set');
  }

  let valName = args[0].name;
  let value = evaluate(args[1], env);
  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, valName)) {
      scope[valName] = value;
      return value;
    }
  }
  throw new ReferenceError(`Tried setting an undefined variable: ${valName}`);
};


let topEnv = new Map;
topEnv['true'] = true;
topEnv['false'] = false;

[
  '+', 
  '-', 
  '*', 
  '/', 
  '==', 
  '<', 
  '>',
  '&&',
  '||'
].forEach(op => {
  topEnv[op] = new Function('a, b', `return a ${op} b;`);
});

topEnv['print'] = function(value) {
  console.log(value);
  return value;
};

topEnv["arr"] = topEnv["array"] = function(...args) {
  return args;
};

topEnv["length"] = function(array) {
  return array.length;
};

topEnv["[]"]= topEnv["element"]= topEnv["<-"] = function(array, n) {
  return array[n];
};

function run(program) {
  let env = Object.create(topEnv);
  let tree = parse(program);
  debugger;
  return evaluate(tree, env);
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

module.exports = {
run,
runFromFile, 
runFromEVM, 
topEnv, 
specialForms, 
parser, 
evaluate};


//console.log(parse("+(a, 10)"));
// → {type: "apply",
//    operator: {type: "word", name: "+"},
//    args: [{type: "word", name: "a"},
//           {type: "value", value: 10}]}

/*const topScope = Object.create(null);
topScope.true = true;
topScope.false = false;

let prog = parse(`if(true, false, true)`);
console.log(evaluate(prog, topScope));*/
// → false

/*
run(`
do(define(total, 0),
   define(count, 1),
   while(<(count, 11),
         do(define(total, +(total, count)),
            define(count, +(count, 1)))),
   print(total))
`);
*/
// → 55

/*
run(`
do(define(plusOne, fun(a, +(a, 1))),
   print(plusOne(10)))
`);
*/
// → 11

/*
run(`
do(define(pow, fun(base, exp,
     if(==(exp, 0),
        1,
        *(base, pow(base, -(exp, 1)))))),
   print(pow(2, 10)))
`);
*/
// → 1024


//console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}

//console.log(parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}



//run(`set(quux, true)`);
// → Some kind of ReferenceError

/*
run(`
do(define(x, 4),
   define(setx, fun(val, set(x, val))),
   setx(50),
   print(x))
`);
*/
// → 50