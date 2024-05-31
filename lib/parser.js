
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
      // Fake values to help parsing
      this.whitespace();
      // Values
      this.octet();
      this.char();
      this.upalpha();
      this.loalpha();
      this.alpha();
      this.digit();
      this.ctl();
      this.cr();
      this.lf();
      this.sp();
      this.ht();
      this.doubleQuoteMark();
      this.crlf();
      this.lws();
      this.text();
      this.hex();
      this.token();
      this.tspecials();
      this.comment();
      this.ctext();
      this.quotedString();
      this.qdtext();
      this.quotedPair();
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

  // Checks if the following text nodes match the provided token text exactly.
  // Automatically moves the IDX if a match is made
  matchesTokenText(token) {
    if (this.getToken().type !== "TEXT") {
      return false;
    }

    // get the rest of the text nodes
    let tokenStr = this.immutableInclusiveWhile("TEXT");

    // check if the text matches the token provided
    // TODO previously would accept a chosenCase value to match a specific case
    // but as we converted the token anyway, kinda pointless. We just convert
    // everything to uppercase now
    // Maybe we can enable strict case later if needed?
    if (tokenStr.toUpperCase() !== token.toUpperCase()) {
      return false;
    }

    // Since we matched the text, we should move the idx the length of the matched text
    this.next(tokenStr.length);

    return true;
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

  // ============ Values to help parsing (not part of spec) ============
  whitespace() {
    if (this.getToken().type !== "WHITESPACE") {
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

  // ============ Values ============
  octet() {
    if (!this.matchesTokenText("OCTET")) {
      return;
    }

    this.lastAST.children.push({
      type: "octet",
      parent: this.lastAST,
      children: []
    });
  }

  char() {
    if (!this.matchesTokenText("CHAR")) {
      return;
    }

    this.lastAST.children.push({
      type: "char",
      parent: this.lastAST,
      children: []
    });
  }

  upalpha() {
    if (!this.matchesTokenText("UPALPHA")) {
      return;
    }

    this.lastAST.children.push({
      type: "upalpha",
      parent: this.lastAST,
      children: []
    });
    // upalpha cannot have children
  }

  loalpha() {
    if (!this.matchesTokenText("LOALPHA")) {
      return;
    }

    this.lastAST.children.push({
      type: "loalpha",
      parent: this.lastAST,
      children: []
    });
    // loalpha cannot have children
  }

  alpha() {
    if (!this.matchesTokenText("ALPHA")) {
      return;
    }

    // TODO do we set as 'alpha' node or subnodes instead: 'UPALPHA | LOALPHA'
    this.lastAST.children.push({
      type: "alpha",
      parent: this.lastAST,
      children: []
    });
  }

  digit() {
    if (!this.matchesTokenText("DIGIT")) {
      return;
    }

    this.lastAST.children.push({
      type: "digit",
      parent: this.lastAST,
      children: []
    });
  }

  ctl() {
    if (!this.matchesTokenText("CTL")) {
      return;
    }

    this.lastAST.children.push({
      type: "ctl",
      parent: this.lastAST,
      children: []
    });
  }

  cr() {
    if (!this.matchesTokenText("CR")) {
      return;
    }

    this.lastAST.children.push({
      type: "cr",
      parent: this.lastAST,
      children: []
    });
  }

  lf() {
    if (!this.matchesTokenText("LF")) {
      return;
    }

    this.lastAST.children.push({
      type: "lf",
      parent: this.lastAST,
      children: []
    });
  }

  sp() {
    if (!this.matchesTokenText("SP")) {
      return;
    }

    this.lastAST.children.push({
      type: "sp",
      parent: this.lastAST,
      children: []
    });
  }

  ht() {
    if (!this.matchesTokenText("HT")) {
      return;
    }

    this.lastAST.children.push({
      type: "ht",
      parent: this.lastAST,
      children: []
    });
  }

  doubleQuoteMark() {
    if (!this.matchesTokenText('<">')) {
      return;
    }

    this.lastAST.children.push({
      type: "double-quote-mark",
      parent: this.lastAST,
      children: []
    });
  }

  crlf() {
    if (!this.matchesTokenText("CRLF")) {
      return;
    }

    // should we expand this node to: 'CR LF'
    this.lastAST.children.push({
      type: "crlf",
      parent: this.lastAST,
      children: []
    });
  }

  lws() {
    if (!this.matchesTokenText("LWS")) {
      return;
    }

    // should we expand this node to: '[CRLF] 1*( SP | HT)'
    this.lastAST.children.push({
      type: "lws",
      parent: this.lastAST,
      children: []
    });
  }

  text() {
    if (!this.matchesTokenText("TEXT")) {
      return;
    }

    // TODO should we expand this node to: '<any OCTET except CTLs, but including LWS>'
    this.lastAST.children.push({
      type: "text",
      parent: this.lastAST,
      children: []
    });
  }

  hex() {
    if (!this.matchesTokenText("HEX")) {
      return;
    }

    // TODO should we expand this node to: the extra long thing it is
    this.lastAST.children.push({
      type: "hex",
      parent: this.lastAST,
      children: []
    });
  }

  token() {
    if (!this.matchesTokenText("token")) {
      return;
    }

    // TODO do we add a 'token' node, or do we instead expand the nodes of
    // whats inside a token? '1*<any CHAR except CTLs or tspecials>'
    this.lastAST.children.push({
      type: "token",
      parent: this.lastAST,
      children: []
    });
    // token cannot have children
  }

  tspecials() {
    if (!this.matchesTokenText("tspecials")) {
      return;
    }

    // TODO should we expand this node?
    this.lastAST.children.push({
      type: "tspecials",
      parent: this.lastAST,
      children: []
    });
  }

  comment() {
    if (!this.matchesTokenText("comment")) {
      return;
    }

    // TODO should we expand this node?
    this.lastAST.children.push({
      type: "comment",
      parent: this.lastAST,
      children: []
    });
  }

  ctext() {
    if (!this.matchesTokenText("ctext")) {
      return;
    }

    // TODO should we expand this node?
    this.lastAST.children.push({
      type: "ctext",
      parent: this.lastAST,
      children: []
    });
  }

  quotedString() {
    if (!this.matchesTokenText("quoted-string")) {
      return;
    }

    // TODO should we expand this node?
    this.lastAST.children.push({
      type: "quoted-string",
      parent: this.lastAST,
      children: []
    });
  }

  qdtext() {
    if (!this.matchesTokenText("qdtext")) {
      return;
    }

    // TODO should we expand this node?
    this.lastAST.children.push({
      type: "qdtext",
      parent: this.lastAST,
      children: []
    });
  }

  quotedPair() {
    if (!this.matchesTokenText("quoted-pair")) {
      return;
    }

    // TODO should we expand this node?
    this.lastAST.children.push({
      type: "quoted-pair",
      parent: this.lastAST,
      children: []
    });
  }

}
