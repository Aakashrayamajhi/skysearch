"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { validateQuery, validatePageSize } = require("../../src/services/search.service");

describe("search.service validation", () => {
  it("rejects empty query", () => {
    let err;
    try {
      validateQuery("");
    } catch (e) {
      err = e;
    }
    assert.ok(err, "Expected error for empty query");
    assert.strictEqual(err.statusCode, 400);
  });

  it("rejects non-string query", () => {
    let err;
    try {
      validateQuery(null);
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.strictEqual(err.statusCode, 400);
  });

  it("trims whitespace", () => {
    const result = validateQuery("  hello  ");
    assert.strictEqual(result, "hello");
  });

  it("rejects query longer than MAX_QUERY_LENGTH", () => {
    const long = "a".repeat(501);
    let err;
    try {
      validateQuery(long);
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.strictEqual(err.statusCode, 400);
  });

  it("accepts valid query", () => {
    const result = validateQuery("hello world");
    assert.strictEqual(result, "hello world");
  });

  it("accepts query with special characters", () => {
    const result = validateQuery("hello-world 123 @test");
    assert.ok(result.length > 0);
  });
  it("validatePageSize rejects invalid string page", () => {
    let err;
    try {
      validatePageSize("abc", 10);
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.strictEqual(err.statusCode, 400);
  });

  it("validatePageSize rejects invalid string size", () => {
    let err;
    try {
      validatePageSize(1, "xyz");
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.strictEqual(err.statusCode, 400);
  });

  it("validatePageSize rejects page < 1", () => {
    let err;
    try {
      validatePageSize(0, 10);
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.strictEqual(err.statusCode, 400);
  });

  it("validatePageSize rejects size > 100", () => {
    let err;
    try {
      validatePageSize(1, 101);
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.strictEqual(err.statusCode, 400);
  });
});
