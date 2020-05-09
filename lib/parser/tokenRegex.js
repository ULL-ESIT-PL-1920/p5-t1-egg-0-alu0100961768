//Exporta la clase para los objetos Token 

const WHITES = /^(\s|[#;].*|\/\*(.|\n)*?\*\/)*/;
const STRING = /^"((?:[^"\\]|\\.)*)"/;
const NUMBER = /^([-+]?\d*\.?\d+([eE][-+]?\d+)?)/;
const WORD   = /^([^\s(){},\]\["]+)/; // No se niega el dígito ni el signo.
const LP     = /^([({]|\[)/;
const RP     = /^([)}]|\])/;
const COMMA  = /^(,)/;
const NEWLINE = /\r\n|\r|\n/;

module.exports = {
    WHITES, LP, RP, STRING, NUMBER, WORD, COMMA, NEWLINE
};