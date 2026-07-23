"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { buildKey } = require("../../src/repositories/cache.repo");

describe("CacheRepo", () => {
  it("buildKey includes query, page, size, filters", () => {
    const key = buildKey("hello", 1, 10, { domain: "example.com" });
    assert.ok(key.startsWith("search:hello:1:10:"));
    assert.ok(key.includes("example.com"));
  });

  it("buildKey handles empty filters", () => {
    const key = buildKey("hello", 1, 10, {});
    assert.ok(key.startsWith("search:hello:1:10:"));
  });

  it("buildKey truncates long query to 500 chars", () => {
    const long = "a".repeat(1000);
    const key = buildKey(long, 1, 10, {});
    const queryPart = key.split(":").slice(1, -3).join(":");
    assert.ok(queryPart.length <= 500, "Query part should be truncated");
  });
});
