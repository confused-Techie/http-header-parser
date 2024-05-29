
module.exports =
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.ast = {};
    this.astNode; // The current node to modify on the tree

    this.reachedEOF = false; // safety to help end parsing
  }

  appendToAst(id, obj) {
    // append the provided object onto the current leaf of the AST node
    if (Array.isArray(this.astNode)) {
      obj.node = id;
      this.astNode.push(obj);
    } else {
      this.astNode[id] = obj;
      if (this.astNode[id].body) {
        // if the newly added node as a body
      }
      let newBody = this.astNode["node"].body;
      // assume every node will have a body object that can then become the new
      // landing for the AST
      this.astNode = newBody;
    }
  }

  parse() {
    this.ast = {
      node: "program",
      body: []
    };

    this.astNode = this.ast.body;

    while(this.tokens.length > 0 && !this.reachedEOF) {
      let token = this.tokens[0];

      // we will take our first token and see if it becomes consumed by any methods
      const methods = [
        "is_eof",
        "is_literal"
      ];

      let valid = false;
      for (let i = 0; i < methods.length; i++) {
        valid = this[methods[i]](token);
        if (valid) {
          if (typeof valid !== "boolean") {
            this.ast.body.push(valid);
          }
          break;
        }
      }

      if (valid) {
        continue;
      }
    }

    return this.ast;
  }

  // definitions
  is_literal(token) {
    if (token.type !== "DOUBLE_QUOTES") {
      return false;
    }

    let str = "";
    let tokenCount = 1; // one instead of zero to skip the above 'DOUBLE_QUOTES'
    token = this.tokens[tokenCount];

    while(token.type !== "DOUBLE_QUOTES") {
      str += token.text;
      tokenCount = tokenCount + 1;
      token = this.tokens[tokenCount];
    }

    // Since we ended our above loop on a 'DOUBLE_QUOTES'
    // we should add one more to our tokenCount to ensure to cleanup and not repeat
    tokenCount = tokenCount + 1;

    // now we remove the consumed tokens
    this.tokens.splice(0, tokenCount);

    return {
      type: "literal",
      value: str
    };
  }

  is_repitition(token) {
    // TODO support numerical assignments prior to asterisk and after
    if (token.type !== "ASTERISK") {
      return false;
    }

    // TODO finish
  }

  is_eof(token) {
    if (token.type !== "EOF") {
      return false;
    }

    this.reachedEOF = true;
    return true;
  }
}
