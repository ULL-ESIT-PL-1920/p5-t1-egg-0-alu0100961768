// Manipulacion de las clases de JS (Object, array))

const utils= require('./utils.js');

Object.prototype.sub= function(...indices){
    utils.checkIterable(this, indices.length);

    let index= indices[0];
    if(this instanceof Array){
        index= utils.getValidIndex(this.length, indices[0]);
    }

    let value;
    if(this instanceof Map){
        value= this.get(index);
    }
    else{
        value= this[index];
    }

    if(indices.length=== 1){
        return value;
    }
    return value.sub(...indices.slice(1));

}

const SetElemAlias= "=";
Object.prototype["setElem"]= Object.prototype[SetElemAlias] = function(value, ...indices){
    utils.checkIterable(this, indices.length);
    let index= indices[0];
    if(this instanceof Array){
        index= utils.getValidIndex(this.length, indices[0]);
    }

    if(indices.length=== 1){
        if(this instanceof Map){
            this.set(index, value);
        }
        else{
            this[index]= value;
        }

        return value;
    }

    const obj= this.sub(index);
    return obj[SetElemAlias](value, ...indices.slice(1));
};