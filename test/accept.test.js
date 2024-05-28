const { describe, it } = require("node:test");
const assert = require("node:assert");
const parser = require("../src/index.js");

describe("HTTP Accept Header: RFC 2068", () => {

  it("audio/*; q=0.2, audio/basic", () => {
    assert.deepEqual(
      parser.accept("audio/*; q=0.2, audio/basic"),
      [
        {
          type: "audio",
          subtype: "*",
          params: [ { key: "q", value: "0.2" } ]
        },
        {
          type: "audio",
          subtype: "basic",
          params: []
        }
      ]
    );
  });

  it("text/*, text/html, text/html;level=1, */*", () => {
    assert.deepEqual(
      parser.accept("text/*, text/html, text/html;level=1, */*"),
      [
        {
          type: "text",
          subtype: "*",
          params: []
        },
        {
          type: "text",
          subtype: "html",
          params: []
        },
        {
          type: "text",
          subtype: "html",
          params: [ { key: "level", value: "1" } ]
        },
        {
          type: "*",
          subtype: "*",
          params: []
        }
      ]
    );
  });

  it("text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5", () => {
    assert.deepEqual(
      parser.accept("text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5"),
      [
        {
          type: "text", subtype: "*", params: [ { key: "q", value: "0.3" } ]
        },
        {
          type: "text", subtype: "html", params: [ { key: "q", value: "0.7" } ]
        },
        {
          type: "text", subtype: "html", params: [ { key: "level", value: "1" } ]
        },
        {
          type: "text", subtype: "html", params: [ { key: "level", value: "2" }, { key: "q", value: "0.4" } ]
        },
        {
          type: "*", subtype: "*", params: [ { key: "q", value: "0.5" } ]
        }
      ]
    );
  });

});
