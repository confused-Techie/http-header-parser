// Module that takes ABNF and converts it into an AST.
module.exports =
function convertToAST(abnf) {
  const Tokenizer = require("./tokenizer.js");
  const Parser = require("./parser.js");

  const tokenizer = new Tokenizer(abnf);
  const tokens = tokenizer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.parse();

  return ast;
}
