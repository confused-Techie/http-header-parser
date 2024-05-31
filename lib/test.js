// Text Idea:
//  * tokenize the spec
//  * parse the spec into an abstract syntax tree
//  * save the ast to disk
//  * later the ast can be read
//  * tokenize user input (the header value)
//  * use a validator on the ast and tokenized user input
const Tokenizer = require("./tokenizer.js");
const Parser = require("./parserClass.js");

// Tokenize the Spec
const spec = '"Accept" ":" *upalpha';

const tokenizer = new Tokenizer(spec);

const tokens = tokenizer.tokenize();

console.log(tokens);

// Parse the spec tokens into an AST 
const parser = new Parser(tokens);

const ast = parser.parse();

console.log(ast);
