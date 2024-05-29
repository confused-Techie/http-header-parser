// TODO Remove this in favour of more specific methods
module.exports =
function whitespace(state) {
  let token = state.spec.tokens[state.spec.idx];

  if (token.type !== "WHITESPACE") {
    return;
  }

  state.spec.idx = state.spec.idx + 1;
  token = state.spec.tokens[state.spec.idx];

  while(token.type === "WHITESPACE") {
    state.spec.idx = state.spec.idx + 1;
    token = state.spec.tokens[state.spec.idx];
  }

  // skip all whitespace tokens
  // then skip all whitespace items in the input tokens

  let inputToken = state.input.tokens[state.input.idx];

  while(inputToken.type === "WHITESPACE") {
    state.input.idx = state.input.idx + 1;
    inputToken = state.input.tokens[state.input.idx];
  }

  // now that we have skipped all input tokens.
  return;
}
