
module.exports = {
  rules: {
    // Syntax Rules
    "literal": require("./rules/literal.js"),
    "whitespace": require("./rules/whitespace.js"),
    // Basic Rules
    "upalpha": require("./rules/upalpha.js"),
    // Content Rules
    "token": require("./rules/token.js")
  },
  spec: {
    tokens: [],
    idx: 0
  },
  input: {
    tokens: [],
    idx: 0
  },
  output: {
    type: "program",
    parent: null,
    children: []
  },
  curOutput: {}, // initialized to this.output
};
