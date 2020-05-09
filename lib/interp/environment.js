// main del enviroment. Exprota SpecialForms y TopEnv. Usa registry.
// requires evaluate?
const { Apply, Word, Value } = require('./ats.js');


let specialForms = new Map;

specialForms['if'] = function(args, env) {
  if (args.length != 3) {
    throw new SyntaxError('Bad number of args to if');
  }

  if (evaluate(args[0], env) !== false) {
    return args[1].evaluate(env);
  } else {
    return args[2].evaluate(env);
  }
};

specialForms['while'] = function(args, env) {
  if (args.length != 2) {
    throw new SyntaxError('Bad number of args to while');
  }

  while(args[0].evaluate(env) !== false) {
    args[1].evaluate(env);
  }
  return false;
};

specialForms['do'] = function(args, env) {
  let value = false;

  args.forEach(function(arg) {
    value = arg.evaluate(env);
  });

  return value;
};

specialForms['def'] =specialForms['define']= specialForms[':=']= specialForms['='] = function(args, env) {
  if (args.length != 2 || args[0].type != 'word') {
    throw new SyntaxError('Bad use of define');
  }

  let value = args[1].evaluate(env);
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

    return body.evaluate(localEnv);
  };
};

specialForms["set"] = function(args, env) {
  if (args.length != 2 || args[0].type != 'word') {
    throw new SyntaxError('Bad use of set');
  }

  let valName = args[0].name;
  let value = args[1].evaluate(env);
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
topEnv['null'] = null;

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

topEnv['print'] = function(...value) {
  console.log(...value);
  return value[0] || null;
};

topEnv["arr"] = topEnv["array"] = function(...args) {
  return args;
};

topEnv["length"] = function(...array) {
  return array[0].length;
};

topEnv["[]"]= topEnv["element"]= topEnv["<-"] = function(array, n) {
  return array[n];
};


module.exports = {
  topEnv,
  specialForms
};