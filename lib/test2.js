const Tokenizer = require("./tokenizer.js");
const Parser = require("./parseFirst.js");

const input = '"Accept"';

const tokenizer = new Tokenizer(input);

const tokens = tokenizer.tokenize();
console.log(tokens);

const parser = new Parser(tokens);

const ast = parser.parse();
console.log(ast);

// a new idea contemplating if we should:
//  * tokenize the spec
//  * parse the spec into a syntax tree
//  * then have a validation that takes the input, and uses a normalized AST to validate.
