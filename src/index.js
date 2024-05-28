const accept = require("./accept/parser.js");
const acceptCharset = require("./acceptCharset/parser.js");

function parseString(parser, str) {
  const parsed = parser.parse(str);

  // Remove the usless array wrapping
  return parsed;
}

module.exports = {
  accept: (str) => { return parseString(accept, str)[0]; },
  acceptCharset: (str) => { return parseString(acceptCharset, str)[0]; },
};
