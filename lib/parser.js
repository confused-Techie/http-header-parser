
module.exports =
function parse(spec, input) {
  const state = require("./state.js");
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
