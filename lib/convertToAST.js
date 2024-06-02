// Module that takes ABNF and converts it into an AST.
const util = require("util");
module.exports =
function convertToAST(abnf) {
  console.log("convertToAST: string");
  console.log(JSON.stringify(abnf));
  const Tokenizer = require("./tokenizer.js");
  const Parser = require("./parser.js");

  const tokenizer = new Tokenizer(abnf);
  const tokens = tokenizer.tokenize();
  console.log(util.inspect(tokens, { maxArrayLength: null}));

  const parser = new Parser(tokens);
  const ast = parser.parse();

  return ast;
}
