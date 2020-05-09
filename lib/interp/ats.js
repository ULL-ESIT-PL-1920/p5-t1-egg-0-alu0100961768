//Las clases del AST.
const {specialForms}= require('./environment.js');

class Value {
    constructor(value) {
        this.type = 'value';
        this.value = value;
    }

    evaluate() {
        return this.value;
    }
}

class Word {
    constructor(name) {
        this.type = 'word';
        this.name = name;
    }

    evaluate(env) {
        if (this.name in env) {
            return env[this.name];
        } else {
            throw new ReferenceError(`Undefined variable: ${expr.name}`);
        }
    }
}

class Apply {
    constructor(tree, args) {
        
        this.type = 'apply';
        this.operator = tree;
        this.args= args;
    }

    evaluate(env) {

        if (this.operator.type === 'word' && this.operator.name in specialForms) {
            return specialForms[this.operator.name](this.args, env);
        }

        let op = this.operator.evaluate(env);
        let args = this.args.map((arg) => arg.evaluate(env))

        if (typeof op=== "function"){
            return op(...args);
        }

        if (typeof op!== 'undefined'){
            let name= args[0];
            if(typeof op[name] !== 'undefined'){
                if(typeof op[name] === 'function') {
                    return (...args) => op[name].call(op, ...args);
                }
                else {
                    return op[name];
                }
            }


        }

        if (typeof op!= "function"){
            throw new TypeError('Applying a non-function');
        }
    }
}

module.exports = {
    Value,
    Word,
    Apply
};