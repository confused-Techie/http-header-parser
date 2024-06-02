const convertToAST = require("./convertToAST.js");
const readLocalFile = require("./readLocalFile.js");

module.exports =
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.idx = 0;
    this.ast = {
      type: "ABNF", // Augemented BNF
      parent: null,
      children: [],
      definitions: {}
    };
    this.lastAST = this.ast;

    // a max call count for the main parse loop. Helps avoid infinite recursion
    // if there's an issue
    this.maxParseLoop = 10000;
    this.curParseCount = 0;
  }

  // ============ Class Methods ============
  parse() {
    while(this.idx < this.tokens.length - 1 && this.curParseCount < this.maxParseLoop) {
      this.curParseCount++;
      //console.log(this.tokens[this.idx]);
      // Syntax Structures
      this.literal();
      this.repitition();
      this.comment_rule();
      this.optional_open();
      this.optional_close();
      this.localAlternatives_open();
      this.localAlternatives_close();
      this.lists();
      this.definition();
      this.alternatives();

      // While a syntax structure, due to it's lazy matching it MUST remain
      // as the last syntax structure checked
      this.specificRepetition();

      // Token Types
      // While these aren't syntax structures or language values, they are
      // helpful for other purposes with parsing
      this.space();
      this.carriageReturn();
      this.newLine();
      this.tab();
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

      // Calling basic named text match last to ensure all other possibilities
      // have been addressed first.
      this.namedRule();
    }

    if (this.curParseCount >= this.maxParseLoop) {
      const util = require("util");
      console.log("Exited early due to reaching max parse loop count!");
      console.log("Below is the currently built AST");
      console.log(util.inspect(this.ast, { depth: null, maxArrayLength: null }));
      console.log("Below is the token prior to the problem token");
      console.log(this.tokens[this.idx - 1]);
      console.log("Below is the problem token");
      console.log(this.getToken());
      console.log("Below is the token after the problem token");
      console.log(this.tokens[this.idx + 1]);
      console.log("Below is the full token set");
      console.log(this.tokens);
      console.log(`The current IDX is: ${this.idx}`);
      throw new Error("Max Parse loop count exceeded");
    }

    return this.ast;
  }

  getToken() {
    const token = this.tokens[this.idx];

    if (token === undefined) {
      // let us hit the end of our token list gracefully
      return { type: null, text: null };
    } else {
      return token;
    }
  }

  next(value = 1) {
    this.idx = this.idx + value;
  }

  notAtEnd() {
    // returns true if the token idx is not at it's end position
    return this.idx < this.tokens.length;
  }

  // Takes a comparison string and compares that to the types of the next tokens.
  // The comparison provided should be valid regex.
  // Example: "^(ASTERISK)$|^(INTEGER)(SPACE)*(ASTERISK)(SPACE)*(INTEGER)$"
  // Matches:
  //    - ASTERISK
  //    - INTEGER ASTERISK INTEGER (with space between)
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

    while(this.notAtEnd() && token.type !== type) {
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

    // get the text from all nodes to match based on length
    let localIdx = this.idx;
    let tokenStr = "";

    while(tokenStr.length < token.length) {
      // while previously this used `this.immutableInclusiveWhile("TEXT")`
      // that was found problematic when attempting to match characters that
      // belonged to a different node set, such as: `=`, `(`, etc
      // by matching text no matter the node it allows a more flexible system
      tokenStr += this.tokens[localIdx]?.text ?? " ";
      localIdx = localIdx + 1;
    }

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

  // Ascends the AST parent by parent until encountering the specified type.
  ascendAstToType(type) {
    while(this.notAtEnd() && this.lastAST.type !== type) {
      this.lastAST = this.lastAST.parent;
    }
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
      type: "LITERAL",
      value: str,
      parent: this.lastAST,
      children: []
    });
    // literals cannot have children
  }

  alternatives() {
    if (this.getToken().type !== "BAR") {
      return;
    }

    // skip signifier
    this.next();

    this.lastAST.children.push({
      type: "ALTERNATIVE",
      parent: this.lastAST,
      children: []
    });
  }

  comment_rule() {
    if (this.getToken().type !== "SEMI_COLON") {
      return;
    }

    // now we want to iterate all characters until a newline
    let str = this.exclusiveWhile("NEWLINE");
    // using newline only prioritizes unix, but should still catch windows systems
    // on windows systems it'll be '\r\n' so this should eat the carriage return too

    // we then want to skip the newline as well, since the above loop stops on it
    this.next();

    this.lastAST.children.push({
      type: "COMMENT",
      value: str,
      parent: this.lastAST,
      children: []
    });
  }

  definition() {
    if (!this.compareType("^(TEXT)+((SPACE)|(TAB))*(EQUAL_SIGN)$")) {
      return;
    }

    let nameStr = this.inclusiveWhile("TEXT");

    if (this.getToken().type === "SPACE") {
      // remove all spaces
      this.inclusiveWhile("SPACE");
    }

    if (this.getToken().type === "TAB") {
      // remove all tabs
      this.inclusiveWhile("TAB");
    }

    if (this.getToken().type === "EQUAL_SIGN") {
      this.next();
    }

    // now we want to collect the rest of the document until a newline
    // we will handle this similar to how we handle a comment
    let definitionStr = this.exclusiveWhile("NEWLINE");

    // since the above loop actually stops on a newline we want to hit next again
    this.next();

    // now it's possible that a definition spans multiple lines. We can determine this
    // based on the presence of a tab token next
    let continuesToNextLine = false;

    if (this.getToken().type === "TAB" || this.getToken().type === "SPACE") {
      continuesToNextLine = true;
    }

    while(continuesToNextLine) {
      definitionStr += this.exclusiveWhile("NEWLINE");
      // skip the newline ending
      this.next();
      if (this.getToken().type !== "TAB" && this.getToken().type !== "SPACE" && this.getToken().type !== "EOF") {
        continuesToNextLine = false;
      }
    }

    // now with a full definition, we can parse it
    if (!this.ast.definitions[nameStr]) {
      // Only add the definition if it doesn't already exist
      // avoids infinite recursion
      const ast = convertToAST(definitionStr);
      this.ast.definitions[nameStr] = ast.children;
    }
  }

  repitition() {
    if (!this.compareType("^(DIGIT)*(ASTERISK)(DIGIT)*$")) {
      return;
    }

    // based on n*m of spec
    let leastOccurrences = 0;
    let mostOccurrences = Infinity;

    if (this.getToken().type === "DIGIT") {
      // if 'n' is defined
      let minStr = this.inclusiveWhile("DIGIT");
      leastOccurrences = parseInt(minStr, 10);
    }

    // move beyond our specifier ('asterisk')
    this.next();

    if (this.getToken().type === "DIGIT") {
      // if 'm' is defined
      let maxStr = this.inclusiveWhile("DIGIT");
      mostOccurrences = parseInt(maxStr, 10);
    }

    this.lastAST.children.push({
      type: "REPITITION",
      min: leastOccurrences,
      max: mostOccurrences,
      parent: this.lastAST,
      children: []
    });
    // repitition usually has children
    this.setLastAstToChild();
  }

  specificRepetition() {
    // rather than implement specificRepetition on every entity, we will just match
    // for digits, and ensure it keeps the last position within syntax structures
    if (this.getToken().type !== "DIGIT") {
      return;
    }

    let count = this.inclusiveWhile("DIGIT");
    count = parseInt(count, 10);

    this.lastAST.children.push({
      type: "SPECIFIC-REPITITION",
      count: count,
      parent: this.lastAST,
      children: []
    });
    // while it may feel like repetitions should be children
    // for now I'll leave it be, and see if this makes the validator impossible
  }

  lists() {
    if (!this.compareType("^(DIGIT)*(POUND)(DIGIT)*$")) {
      return;
    }

    // #RULE = n#mRULE
    // similar to repitition, except requires a comma between each value
    let leastOccurrences = 0;
    let mostOccurrences = Infinity;

    if (this.getToken().type === "DIGIT") {
      // if 'n' is defined
      let minStr = this.inclusiveWhile("DIGIT");
      leastOccurrences = parseInt(minStr, 10);
    }

    // move beyond our specifier ('pound')
    this.next();

    if (this.getToken().type === "DIGIT") {
      // if 'm' is defined
      let maxStr = this.inclusiveWhile("DIGIT");
      mostOccurrences = parseInt(maxStr, 10);
    }

    this.lastAST.children.push({
      type: "LIST",
      min: leastOccurrences,
      max: mostOccurrences,
      parent: this.lastAST,
      children: []
    });
    // will have children
    this.setLastAstToChild();
  }

  optional_open() {
    if (this.getToken().type !== "OPEN_BRACKET") {
      return;
    }

    // Since [RULE] is equal to *1(RULE) which is also 0*1(RULE) we will enter
    // this as a repitition node with those values
    // except we need to be able to ascend the nodes properly back to this specific
    // node at a close bracket, so the type still must be named 'optional' rather
    // then 'repitition'. But the other values could be equal with equal handling

    // move beyond our specifier
    this.next();

    this.lastAST.children.push({
      type: "OPTIONAL",
      min: 0,
      max: 1,
      parent: this.lastAST,
      children: []
    });
    // repitition usually has children
    this.setLastAstToChild();
  }

  optional_close() {
    if (this.getToken().type !== "CLOSE_BRACKET") {
      return;
    }

    // we have closed out our bracketed repitition token.
    // We need to move the AST parent up to the parent of our repitition token

    // move beyond our specifier
    this.next();

    this.ascendAstToType("OPTIONAL");

    // with the AST now at our parent optional element, we just need to go one level above
    this.lastAST = this.lastAST.parent;
  }

  localAlternatives_open() {
    if (this.getToken().type !== "OPEN_PAREN") {
      return;
    }

    // move beyond our specifier
    this.next();

    this.lastAST.children.push({
      type: "LOCAL-ALTERNATIVE",
      parent: this.lastAST,
      children: []
    });
    // local alternatives usually has children
    this.setLastAstToChild();
  }

  localAlternatives_close() {
    if (this.getToken().type !== "CLOSE_PAREN") {
      return;
    }

    // move beyond our specifier
    this.next();

    this.ascendAstToType("LOCAL-ALTERNATIVE");

    // witht he AST now at our parent local_alternative element, we just need to go one level above
    this.lastAST = this.lastAST.parent;
  }

  // ============ Token Values ============
  space() {
    if (this.getToken().type !== "SPACE") {
      return;
    }

    this.next();

    if (this.lastAST.type === "REPITITION" || this.lastAST.type === "LIST") {
      // if we are a direct child of the repitition syntax, we should break
      this.lastAST = this.lastAST.parent;
    }

    this.lastAST.children.push({
      type: "SPACE",
      parent: this.lastAST,
      children: []
    });
    // space cannot have children
  }

  carriageReturn() {
    if (this.getToken().type !== "CARRIAGE_RETURN") {
      return;
    }

    this.next();
    // we just skip this value in the AST, as it's useless
  }

  newLine() {
    if (this.getToken().type !== "NEWLINE") {
      return;
    }

    this.next();
    // we just skip this value in the AST, as it's useless in general
    // only helpful in determining other tokens if needed
  }

  tab() {
    if (this.getToken().type !== "TAB") {
      return;
    }

    this.next();
    // we just skip this value, as it only holds importance when being scanned
    // by this.definition()
  }

  namedRule() {
    // A named rule matches any text segment, and should be called only as the last
    // possible option. This ensures to match named rules within the text, such as
    // 'http-accept-params' or whatever arbitrary string may exist
    if (this.getToken().type !== "TEXT") {
      return;
    }

    let tokenStr = this.inclusiveWhile("TEXT");

    this.lastAST.children.push({
      type: "NAMED-RULE",
      parent: this.lastAST,
      children: []
    });
  }

  // ============ Values ============
  octet() {
    if (!this.matchesTokenText("OCTET")) {
      return;
    }

    this.lastAST.children.push({
      type: "OCTET",
      parent: this.lastAST,
      children: []
    });
  }

  char() {
    if (!this.matchesTokenText("CHAR")) {
      return;
    }

    this.lastAST.children.push({
      type: "CHAR",
      parent: this.lastAST,
      children: []
    });
  }

  upalpha() {
    if (!this.matchesTokenText("UPALPHA")) {
      return;
    }

    this.lastAST.children.push({
      type: "UPALPHA",
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
      type: "LOALPHA",
      parent: this.lastAST,
      children: []
    });
    // loalpha cannot have children
  }

  alpha() {
    if (!this.matchesTokenText("ALPHA")) {
      return;
    }

    this.lastAST.children.push({
      type: "ALPHA",
      parent: this.lastAST,
      children: []
    });

    // Expanded node
    const ast = convertToAST(readLocalFile("./datatypes/ALPHA.txt"));
    this.ast.definitions["ALPHA"] = ast.definitions["ALPHA"];
  }

  digit() {
    if (!this.matchesTokenText("DIGIT")) {
      return;
    }

    this.lastAST.children.push({
      type: "DIGIT",
      parent: this.lastAST,
      children: []
    });
  }

  ctl() {
    if (!this.matchesTokenText("CTL")) {
      return;
    }

    this.lastAST.children.push({
      type: "CTL",
      parent: this.lastAST,
      children: []
    });
  }

  cr() {
    if (!this.matchesTokenText("CR")) {
      return;
    }

    this.lastAST.children.push({
      type: "CR",
      parent: this.lastAST,
      children: []
    });
  }

  lf() {
    if (!this.matchesTokenText("LF")) {
      return;
    }

    this.lastAST.children.push({
      type: "LF",
      parent: this.lastAST,
      children: []
    });
  }

  sp() {
    if (!this.matchesTokenText("SP")) {
      return;
    }

    this.lastAST.children.push({
      type: "SP",
      parent: this.lastAST,
      children: []
    });
  }

  ht() {
    if (!this.matchesTokenText("HT")) {
      return;
    }

    this.lastAST.children.push({
      type: "HT",
      parent: this.lastAST,
      children: []
    });
  }

  doubleQuoteMark() {
    if (!this.matchesTokenText('<">')) {
      return;
    }

    this.lastAST.children.push({
      type: "DOUBLE-QUOTE-MARK",
      parent: this.lastAST,
      children: []
    });
  }

  crlf() {
    if (!this.matchesTokenText("CRLF")) {
      return;
    }

    this.lastAST.children.push({
      type: "CRLF",
      parent: this.lastAST,
      children: []
    });

    // Expanded node
    const ast = convertToAST(readLocalFile("./datatypes/CRLF.txt"));
    this.ast.definitions["CRLF"] = ast.definitions["CRLF"];
  }

  lws() {
    if (!this.matchesTokenText("LWS")) {
      return;
    }

    this.lastAST.children.push({
      type: "LWS",
      parent: this.lastAST,
      children: []
    });

    // Expanded node
    const ast = convertToAST(readLocalFile("./datatypes/LWS.txt"));
    this.ast.definitions["LWS"] = ast.definitions["LWS"];
  }

  text() {
    if (!this.matchesTokenText("TEXT")) {
      return;
    }

    // TODO should we expand this node to: '<any OCTET except CTLs, but including LWS>'
    // Although node expansion may be rather difficult in this case
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

    this.lastAST.children.push({
      type: "HEX",
      parent: this.lastAST,
      children: []
    });

    // Expanded node
    const ast = convertToAST(readLocalFile("./datatypes/HEX.txt"));
    this.ast.definitions["HEX"] = ast.definitions["HEX"];
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

    this.lastAST.children.push({
      type: "tspecials",
      parent: this.lastAST,
      children: []
    });

    // Expanded node
    const ast = convertToAST(readLocalFile("./datatypes/tspecials.txt"));
    this.ast.definitions["tspecials"] = ast.definitions["tspecials"];
  }

  comment() {
    if (!this.matchesTokenText("comment")) {
      return;
    }

    // TODO should we expand this node?
    this.lastAST.children.push({
      type: "comment",
      parent: this.lastAST,
      last: this.lastAST.children[this.lastAST.children.length - 1],
      next: null,
      children: []
    });

    // Expanded node
    if (!this.ast.definitions["comment"]) {
      // only add expanded node to AST if it doesn't exist
      // helps avoid infinite recursion
      // especially since the comment definition includes comment
      //const ast = convertToAST(readLocalFile("./datatypes/comment.txt"));
      //this.ast.definitions["comment"] = ast.definitions["comment"];

      // could we add the expanded node onto the existing tokens?
      const fs = require("fs");
      const path = require("path");

      const resolvedFilePath = path.join(__dirname, "./datatypes/comment.txt");
      const file = "\r\n" + fs.readFileSync(resolvedFilePath, { encoding: "utf8" });
      const Tokenizer = require("./tokenizer.js");
      const tokenizer = new Tokenizer(file);
      const tokens = tokenizer.tokenize();
      // remove EOF token
      if (this.tokens[this.tokens.length -1].type === "EOF") {
        this.tokens.pop();
      }
      this.tokens = this.tokens.concat(tokens);
    }
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
