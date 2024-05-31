
module.exports =
class Tokenizer {
  constructor(input) {
    this.input = input;
    this.idx = 0;
    this.output = [];
  }

  tokenize() {
    while(!this.isAtEnd()) {
      let cur = this.cur();

      if (cur === '"') {
        this.addToken("DOUBLE_QUOTES");
        return this.nextToken();
      }

      if (cur === "|") {
        this.addToken("BAR");
        return this.nextToken();
      }

      if (cur === "(") {
        this.addToken("OPEN_PAREN");
        return this.nextToken();
      }

      if (cur === ")") {
        this.addToken("CLOSE_PAREN");
        return this.nextToken();
      }

      if (cur === "*") {
        this.addToken("ASTERISK");
        return this.nextToken();
      }

      if (cur === "[") {
        this.addToken("OPEN_BRACKET");
        return this.nextToken();
      }

      if (cur === "]") {
        this.addToken("CLOSE_BRACKET");
        return this.nextToken();
      }

      if (/\s/.test(cur)) {
        // any whitespace character, including line endings
        // TODO line endings should be unique later
        this.addToken("WHITESPACE");
        return this.nextToken();
      }

      // otherwise lets add a text token
      // TODO test for actual text later
      // TODO should be unique for numbers and all characters
      this.addToken("TEXT");
      return this.nextToken();
    }

    this.addToken("EOF");

    return this.output;
  }

  cur() {
    return this.input.charAt(this.idx);
  }

  next(count = 1) {
    this.idx = this.idx + count;
    return this.cur();
  }

  peek(count = 1) {
    // Returns the next char without moving the index
    return this.input.charAt(this.idx + count);
  }

  isAtEnd() {
    return this.idx >= this.input.length;
  }

  nextToken() {
    this.next();
    return this.tokenize();
  }

  addToken(type, text = this.cur()) {
    this.output.push({
      type: type,
      text: text
    });
  }
}
