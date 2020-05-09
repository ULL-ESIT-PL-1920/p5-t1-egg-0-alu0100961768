const inspect= require('util').inspect;
const ins= (x)=> inspect(x, {depth: 'null'});

const checkIterable= (object, length) => {
    if(length=== 0){
        throw new SyntaxError('At least one index must be passed to sub');
    }

    if(!object || object instanceof Number || object instanceof String){
        throw new TypeError(`The object '${object}' is not indexable! `)
    }
};

const getValidIndex= (length, index) => {
    if(index !== parseInt(index, 10)){
        throw new TypeError(`Index ${index} is not a number. Array size: ${length}`);
    }

    if(index < 0) {
        index= length + index;
    }

    if(index > length){
        throw new RangeError(`Index ${index} is out of bounds. Array size: ${length}`);
    }
    return index;
}

module.exports = {
    checkIterable,
    getValidIndex
};