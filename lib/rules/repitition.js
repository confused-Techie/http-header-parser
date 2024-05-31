
module.exports =
function repitition(state) {
  let token = state.spec.tokens[state.spec.idx];

  if (token.type !== "ASTERISK") {
    // TODO support integers in tokenizer,
    // then support them here, since 1*2 is valid
    return;
  }

  // based on n*m but these are the defaults
  const leastOccurrences = 0;
  const mostOccurrences = Infinity;

  // lets move the token beyond our specifiers here
  state.spec.idx = state.spec.idx + 1;

  // ensure the curObject is an array
  state.appendOutput("repitition", []);

  // then we can loop all existing rules to classify within our parameters

  let occurrences = 0;

  const occurrencesSatisfied = () => {
    if (leastOccurrences <= occurrences && occurrences <= mostOccurrences) {
      return true;
    } else {
      return false;
    }
  };

  while(!occurrencesSatisfied()) {
    for (const rule in state.rules) {
      let output = state.rules[rule](state);
      if (typeof output !== "boolean" || (typeof output === "boolean" && output)) {
        // is it anything but a boolean, or a positive boolean
        occurrences = occurrences + 1;
      }
    }
  }

  // if we reached here our occurrences have been satisfied
  // TODO have a safety check to eventually bail
}
