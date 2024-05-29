
module.exports =
function literal(state) {
  let token = state.spec.tokens[state.spec.idx];

  if (token.type !== "DOUBLE_QUOTES") {
    // we know we aren't in a literal match
    return;
  }

  // lets get all the content we care about
  state.spec.idx = state.spec.idx + 1; // skip double quotes
  token = state.spec.tokens[state.spec.idx];

  let str = "";

  while(token.type !== "DOUBLE_QUOTES") {
    str += token.text;
    state.spec.idx = state.spec.idx + 1;
    token = state.spec.tokens[state.spec.idx];
  }

  // since we ended our above match on "DOUBLE_QUOTES" we want to move the idx
  // to the next token for the next match
  state.spec.idx = state.spec.idx + 1;

  let inputString = "";
  for (let i = 0; i < str.length; i++) {
    inputString += state.input.tokens[state.input.idx + i].text;
  }

  if (inputString === str) {
    // since we matched the literal with the provided input,
    // lets move the input idx accordingly
    state.input.idx = state.input.idx + str.length;
  } else {
    throw new Error(`Expected '${inputString}' to match specs '${str}'`);
  }
}
