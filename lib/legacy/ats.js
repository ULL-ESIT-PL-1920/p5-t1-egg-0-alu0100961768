const {specialForms}= require('./eggvm.js');
//const { computePropertyValue } = require('./utils/getSetElement');

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
        if (expr.name in env) {
            return env[expr.name];
        } else {
            throw new ReferenceError(`Undefined variable: ${expr.name}`);
        }
    }
}

class Apply {
    constructor(tree) {
        this.type = 'apply';
        this.operator = tree;
    }

    evaluate(env) {
        // If the name of the apply is a "reserved keyword"
        if (this.operator.type === 'word' && this.operator.name in specialForms) {
            return specialForms[this.operator.name](this.args, env);
        }

        // If the name of the apply is not a "reserved keyword" look for it in the environment
        // And if the result of the lookup is not a function -> error
        const op = this.operator.evaluate(env);
        const args = this.args.map((arg) => arg.evaluate(env))
        if (typeof op!= "function"){
            throw new TypeError('Applying a non-function');
        }
        return op(...args);
    }
}

module.exports = {
    Value,
    Word,
    Apply
};