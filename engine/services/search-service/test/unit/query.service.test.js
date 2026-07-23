"use strict";

const { describe, it, mock } = require("node:test");
const assert = require("node:assert/strict");

const queryService = require("../../src/services/query.service");

describe("QueryService", () => {
  it("cleans query", () => {
    assert.strictEqual(queryService.clean("  Hello, World!  "), "hello world");
  });

  it("tokenizes query", () => {
    assert.deepStrictEqual(queryService.tokenize("hello world foo"), ["hello", "world", "foo"]);
  });

  it("expands synonyms", () => {
    const result = queryService.process("buy phone");
    assert.ok(result.expanded.includes("phone"));
    assert.ok(result.expanded.includes("mobile"));
    assert.ok(result.expanded.includes("buy"));
    assert.ok(result.expanded.includes("purchase"));
  });

  it("returns empty for empty input", () => {
    const result = queryService.process("");
    assert.deepStrictEqual(result, { cleaned: "", tokens: [], expanded: [] });
  });

  it("handles special characters", () => {
    const result = queryService.process("hello@world!#");
    assert.ok(result.cleaned.length > 0);
    assert.ok(result.tokens.length >= 1);
  });
});
