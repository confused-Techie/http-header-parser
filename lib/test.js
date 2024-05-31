const Tokenizer = require("./tokenizer.js");

const spec = '"Accept" ":" *upalpha';
//const input = "Accept: Q";

const tokenizer = new Tokenizer(spec);

const tokens = tokenizer.tokenize();

//const inputTokenizer = new Tokenizer(input);

//const inputTokens = inputTokenizer.tokenize();

console.log(tokens);

//const parser = require("./parser.js");

//const out = parser(tokens, inputTokens);

//console.log(out);

const Parser = require("./parserClass.js");

const parser = new Parser(tokens);

const ast = parser.parse();

console.log(ast);
