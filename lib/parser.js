
function getCleanState() {
  // use structured clone after migrating to NodeJS 17+
  return {
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
    output: {},
    curOutput: {}
  };
}

module.exports =
function parse(spec, input) {
  const state = getCleanState();
  state.spec.tokens = spec;
  state.curOutput = state.output;
  state.input.tokens = input;

  while(state.input.idx < state.input.tokens.length - 1) {
    // TODO have a safety check to eventually bail
    for (const rule in state.rules) {
      //console.log(`Checking rule: ${rule}`);
      state.rules[rule](state);
      console.log(state);
    }
  }

  return state.output;
}
