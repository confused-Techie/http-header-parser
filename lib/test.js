// Text Idea:
//  * tokenize the spec
//  * parse the spec into an abstract syntax tree
//  * save the ast to disk
//  * later the ast can be read
//  * tokenize user input (the header value)
//  * use a validator on the ast and tokenized user input
const util = require("util");
const Tokenizer = require("./tokenizer.js");
const Parser = require("./parser.js");

// Tokenize the Spec
const spec = 'HTTP-Version = "HTTP"\r\n[CRLF] "Accept" ":" 50(upalpha)';

const tokenizer = new Tokenizer(spec);

const tokens = tokenizer.tokenize();

console.log(tokens);

// Parse the spec tokens into an AST
const parser = new Parser(tokens);

const ast = parser.parse();

//console.log(util.inspect(ast, false, null, true));
console.log(ast);
