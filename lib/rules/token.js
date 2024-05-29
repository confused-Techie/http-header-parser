
module.exports =
function token(state) {
  let token = state.spec.tokens[state.spec.idx];

  if (token.type !== "TEXT") {
    // we know we aren't going to be matching a token
    return;
  }

  let idx = state.spec.idx;
  let tokenStr = "";
  // Lets see if the text we are looking at equals 'token'
  // without modifying the current state
  while(token.type === "TEXT") {
    tokenStr += token.text;
    idx = idx + 1;
    token = state.tokens[idx];
  }

  if (tokenStr !== "token") {
    return;
  }

  // we now know we are have the actual string 'token'
  // and want to compare that to the values we have been given
  
}
