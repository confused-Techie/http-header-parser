const accept = require("./accept/parser.js");

function parseString(parser, str) {
  const parsed = parser.parse(str);

  // Remove the usless array wrapping
  return parsed[0];
}

module.exports = {
  accept: (str) => { return parseString(accept, str); }
};
