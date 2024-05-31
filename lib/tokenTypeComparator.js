// Takes a string of token types to compare against the current set of tokens

module.exports =
function tokenTypeComparator(idx, tokens, compare) {
  const compareArr = compare.split(".");

  const compareTokens = tokens.slice(idx, compareArr + idx);

  let tokenArr = [];

  for (let i = 0; i < compareTokens.length; i++) {
    tokenArr.push(compareTokens[i].type);
  }

  // now to actually compare
  let match 
}
