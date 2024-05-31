
module.exports =
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.idx = 0;
    this.ast = {
      type: "abnf", // Augemented BNF
      parent: null,
      children: []
    };
    this.lastAST = this.ast;
  }

  // ============ Class Methods ============
  parse() {
    while(this.idx < this.tokens.length - 1) {
      // Syntax Structures
      this.literal();
      this.repitition();
      // Values
      this.whitespace();
      this.char();
      this.octet();
      this.upalpha();
      this.loalpha();
      this.alpha();
      this.token();
    }

    return this.ast;
  }

  getToken() {
    return this.tokens[this.idx];
  }

  next(value = 1) {
    this.idx = this.idx + value;
  }

  // Takes a comparison string and compares that to the types of the next tokens.
  // The comparison provided should be valid regex.
  // Example: "^(ASTERISK)$|^(INTEGER)(WHITESPACE)*(ASTERISK)(WHITESPACE)*(INTEGER)$"
  // Matches:
  //    - ASTERISK
  //    - INTEGER ASTERISK INTEGER (with whitespace between)
  // Returns true or false if it finds a match. Searching the whole token list
  compareType(comparison) {
    const reg = RegExp(comparison);
    // Start by grabbing tokens from the idx to the end
    let compareTokens = this.tokens.slice(this.idx);
    let endComparison = this.tokens.length;
    let matches = false;

    const getTokenTypes = () => {
      let str = "";

      for (let i = 0; i < compareTokens.length; i++) {
        str += compareTokens[i].type;
      }

      return str;
    };

    while(compareTokens.length > 0 && !matches) {
      let types = getTokenTypes();

      if (reg.exec(types)) {
        matches = true;
      } else {
        // if we don't match we remove the last token slowly going down until
        // none are left
        endComparison = endComparison - 1;
        compareTokens = this.tokens.slice(this.idx, endComparison);
      }
    }

    return matches;
  }

  // Iterates tokens as long as the type of token is equal to the type provided.
  // Modifies state data.
  inclusiveWhile(type) {
    let token = this.getToken();
    let str = "";

    while(token.type === type) {
      str += token.text;
      this.next();
      token = this.getToken();
    }

    return str;
  }

  // Iterates tokens as long as the type of token is NOT equal to the type provided.
  // Modifies state data.
  exclusiveWhile(type) {
    let token = this.getToken();
    let str = "";

    while(token.type !== type) {
      str += token.text;
      this.next();
      token = this.getToken();
    }

    return str;
  }

  // Iterates tokens as long as the type of token is equal to the type provided.
  // Without modifying any state data.
  immutableInclusiveWhile(type) {
    let idx = this.idx;
    let token = this.getToken();
    let str = "";

    while(token.type === type) {
      str += token.text;
      idx = idx + 1;
      token = this.tokens[idx];
    }

    return str;
  }

  // Iterates tokens as long as the type of token is NOT equal to the type provided.
  // Without modifying any state data.
  immutableExclusiveWhile(type) {
    let idx = this.idx;
    let token = this.getToken();
    let str = "";

    while(token.type !== type) {
      str += token.text;
      idx = idx + 1;
      token = this.tokens[idx];
    }

    return str;
  }

  setLastAstToChild() {
    this.lastAST = this.lastAST.children[this.lastAST.children.length - 1];
  }

  // ============ Syntax Structures ============
  literal() {
    if (this.getToken().type !== "DOUBLE_QUOTES") {
      return;
    }

    // lets get the string content of the literal
    this.next();

    let str = this.exclusiveWhile("DOUBLE_QUOTES");

    // since we ended our loop on the end of the literal DOUBLE_QUOTES, enumerate the token
    this.next();

    this.lastAST.children.push({
      type: "literal",
      value: str,
      parent: this.lastAST,
      children: []
    });
    // literals cannot have children
  }

  repitition() {
    let token = this.getToken();

    if (token.type !== "ASTERISK") {
      // TODO support integers in tokenizer
      // TODO support integers here n*m
      return;
    }

    // based on n*m of spec
    let leastOccurrences = 0;
    let mostOccurrences = Infinity;

    // move beyond our specifier
    this.next();

    this.lastAST.children.push({
      type: "repition",
      min: leastOccurrences,
      max: mostOccurrences,
      parent: this.lastAST,
      children: []
    });
    // repitition usually has children
    this.setLastAstToChild();
  }

  // ============ Values ============
  whitespace() {
    let token = this.getToken();

    if (token.type !== "WHITESPACE") {
      return;
    }

    this.next();

    if (this.lastAST.type === "repitition") {
      // if we are a direct child of the repitition syntax, we should break
      this.lastAST = this.lastAST.parent;
    }

    this.lastAST.children.push({
      type: "whitespace",
      parent: this.lastAST,
      children: []
    });
    // whitespace cannot have children
  }

  octet() {
    if (this.getToken().type !== "TEXT") {
      return;
    }

    let tokenStr = this.immutableInclusiveWhile("TEXT");

    if (tokenStr.toUpperCase() !== "OCTET") {
      return;
    }

    this.next(tokenStr.length);

    this.lastAST.children.push({
      type: "octet",
      parent: this.lastAST,
      children: []
    });
  }

  char() {
    if (this.getToken().type !== "TEXT") {
      return;
    }

    let tokenStr = this.immutableInclusiveWhile("TEXT");

    if (tokenStr.toUpperCase() !== "CHAR") {
      return;
    }

    this.next(tokenStr.length);

    this.lastAST.children.push({
      type: "char",
      parent: this.lastAST,
      children: []
    });
  }

  upalpha() {
    if (this.getToken().type !== "TEXT") {
      return;
    }

    // lets collect the token string, to see if it's upalpha, without modifying
    // our state
    let tokenStr = this.immutableInclusiveWhile("TEXT");

    if (tokenStr.toUpperCase() !== "UPALPHA") {
      return;
    }

    // since the token is upalpha we want to move the idx appropriately
    this.next(tokenStr.length);

    this.lastAST.children.push({
      type: "upalpha",
      parent: this.lastAST,
      children: []
    });
    // upalpha cannot have children
  }

  loalpha() {
    if (this.getToken().type !== "TEXT") {
      return;
    }

    let tokenStr = this.immutableInclusiveWhile("TEXT");

    if (tokenStr.toUpperCase() !== "LOALPHA") {
      return;
    }

    // we matched the token, adjust idx
    this.next(tokenStr.length);

    this.lastAST.children.push({
      type: "loalpha",
      parent: this.lastAST,
      children: []
    });
    // loalpha cannot have children
  }

  alpha() {
    if (this.getToken().type !== "TEXT") {
      return;
    }

    let tokenStr = this.immutableExclusiveWhile("TEXT");

    if (tokenStr.toUpperCase() !== "ALPHA") {
      return;
    }

    // matched the token, adjust idx
    this.next(tokenStr.length);

    // TODO do we set as 'alpha' node or subnodes instead: 'UPALPHA | LOALPHA'
    this.lastAST.children.push({
      type: "alpha",
      parent: this.lastAST,
      children: []
    });
  }

  token() {
    if (this.getToken().type !== "TEXT") {
      return;
    }

    let tokenStr = this.immutableInclusiveWhile("TEXT");

    if (tokenStr.toLowerCase() !== "token") {
      return;
    }

    // since we matched the string 'token' move the idx appropriately
    this.next(tokenStr.length);

    // TODO do we add a 'token' node, or do we instead expand the nodes of
    // whats inside a token? '1*<any CHAR except CTLs or tspecials>'
    this.lastAST.children.push({
      type: "token",
      parent: this.lastAST,
      children: []
    });
    // token cannot have children
  }

}
