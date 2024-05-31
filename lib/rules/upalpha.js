
module.exports =
function upalpha(state, skip_validation = false) {
  if (skip_validation) {
    let token = state.spec.tokens[state.spec.idx];

    if (token.type !== "TEXT") {
      return;
    }

    let idx = state.spec.idx;
    let tokenStr = "";
    // Lets see if the text we are looking at equals 'upalpha'
    // without modifying the current state
    while(token.type === "TEXT") {
      tokenStr += token.text;
      idx = idx + 1;
      token = state.tokens[idx];
    }

    if (tokenStr.toUpperCase() !== "UPALPHA") {
      return;
    }
  }

  // now that we are done validating or skipping validation, lets check if the current
  // value is correct
  let inputStr = state.input.tokens[state.input.idx].text;

  let isValid = false;

  switch(inputStr) {
    case "A": isValid = true; break;
    case "B": isValid = true; break;
    case "C": isValid = true; break;
    case "D": isValid = true; break;
    case "E": isValid = true; break;
    case "F": isValid = true; break;
    case "G": isValid = true; break;
    case "H": isValid = true; break;
    case "I": isValid = true; break;
    case "J": isValid = true; break;
    case "K": isValid = true; break;
    case "L": isValid = true; break;
    case "M": isValid = true; break;
    case "N": isValid = true; break;
    case "O": isValid = true; break;
    case "P": isValid = true; break;
    case "Q": isValid = true; break;
    case "R": isValid = true; break;
    case "S": isValid = true; break;
    case "T": isValid = true; break;
    case "U": isValid = true; break;
    case "V": isValid = true; break;
    case "W": isValid = true; break;
    case "X": isValid = true; break;
    case "Y": isValid = true; break;
    case "Z": isValid = true; break;
  }

  if (isValid) {
    // TODO bracket notation seems to copy back to the original object
    state.appendOutput("upalpha", inputStr);
    //state.curOutput["upalpha"] = inputStr;
    state.input.idx = state.input.idx + 1;
    return true;
  } else {
    return false;
  }

}
