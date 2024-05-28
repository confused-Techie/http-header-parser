const { describe, it } = require("node:test");
const assert = require("node:assert");
const parser = require("../src/index.js");

describe("HTTP Accept Charset Header: RFC 2068", () => {

  it("iso-8859-5, unicode-1-1;q=0.8", () => {
    assert.deepEqual(
      parser.acceptCharset("iso-8859-5, unicode-1-1;q=0.8"),
      [
        {
          charset: "iso-8859-5",
          params: []
        },
        {
          charset: "unicode-1-1",
          params: [ { key: "q", value: "0.8" } ]
        }
      ]
    );
  });

});
