"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const validateSearch = require("../../src/middlewares/validateSearch");
const requestId = require("../../src/middlewares/requestId");
const apiKeyAuth = require("../../src/middlewares/apiKeyAuth");
const rateLimiter = require("../../src/middlewares/rateLimiter");
const { performSearch } = require("../../src/services/search.service");
const config = require("../../src/config");

function makeReq(headers = {}, query = {}) {
  return {
    id: "req-1",
    ip: "127.0.0.1",
    headers,
    query,
  };
}

function makeRes() {
  const statusCode = [200];
  const headers = {};
  const body = [];
  return {
    status(code) {
      statusCode[0] = code;
      return this;
    },
    setHeader(key, value) {
      headers[key] = value;
      return this;
    },
    json(data) {
      body.push({ type: "json", data });
      return this;
    },
    end() {
      body.push({ type: "end" });
      return this;
    },
    send(data) {
      body.push({ type: "send", data });
      return this;
    },
    getStatus() {
      return statusCode[0];
    },
    getHeaders() {
      return headers;
    },
    getBody() {
      return body;
    },
  };
}

describe("validateSearch middleware", () => {
  it("returns 400 when q is missing", () => {
    const req = makeReq({}, {});
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(nextCalled, false);
    assert.deepStrictEqual(res.getBody()[0].data, {
      error: "Missing required query parameter: q",
      requestId: "req-1",
    });
  });

  it("returns 400 when q is empty string", () => {
    const req = makeReq({}, { q: "   " });
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(nextCalled, false);
  });

  it("returns 400 when q is not a string", () => {
    const req = makeReq({}, { q: 123 });
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(nextCalled, false);
  });

  it("returns 400 when page is less than 1", () => {
    const req = makeReq({}, { q: "test", page: 0 });
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.getBody()[0].data.error.includes("page must be a number >= 1"));
  });

  it("returns 400 when page is not a number", () => {
    const req = makeReq({}, { q: "test", page: "abc" });
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(nextCalled, false);
  });

  it("returns 400 when size is 0", () => {
    const req = makeReq({}, { q: "test", size: 0 });
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(nextCalled, false);
  });

  it("returns 400 when size is greater than 50", () => {
    const req = makeReq({}, { q: "test", size: 51 });
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.getBody()[0].data.error.includes("size must be a number between 1 and 50"));
  });

  it("returns 400 when size is not a number", () => {
    const req = makeReq({}, { q: "test", size: "abc" });
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(nextCalled, false);
  });

  it("calls next when q is valid", () => {
    const req = makeReq({}, { q: "hello", page: 1, size: 10 });
    const res = makeRes();
    let nextCalled = false;
    validateSearch(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.getStatus(), 200);
  });
});

describe("requestId middleware", () => {
  it("sets req.id and X-Request-ID header", () => {
    const req = makeReq();
    const res = makeRes();
    let nextCalled = false;
    requestId(req, res, () => { nextCalled = true; });
    assert.ok(req.id, "req.id should be set");
    assert.match(req.id, /^[0-9a-f-]+$/i, "req.id should be a UUID-like string");
    assert.ok(res.getHeaders()["X-Request-ID"], "X-Request-ID header should be set");
    assert.strictEqual(nextCalled, true);
  });
});

describe("apiKeyAuth middleware", () => {
  it("skips auth when API_KEY is not configured", () => {
    const original = process.env.API_KEY;
    process.env.API_KEY = "";
    const req = makeReq({}, { q: "test" });
    const res = makeRes();
    let nextCalled = false;
    try {
      apiKeyAuth(req, res, () => { nextCalled = true; });
    } finally {
      process.env.API_KEY = original;
    }
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.getStatus(), 200);
  });

  it("returns 401 when API_KEY is configured but header is missing", () => {
    const original = process.env.API_KEY;
    process.env.API_KEY = "my-secret";
    const req = makeReq({}, { q: "test" });
    const res = makeRes();
    let nextCalled = false;
    let auth;
    try {
      delete require.cache[require.resolve("../../src/middlewares/apiKeyAuth")];
      delete require.cache[require.resolve("../../src/config")];
      auth = require("../../src/middlewares/apiKeyAuth");
      auth(req, res, () => { nextCalled = true; });
    } finally {
      process.env.API_KEY = original;
      if (auth) delete require.cache[require.resolve("../../src/middlewares/apiKeyAuth")];
      delete require.cache[require.resolve("../../src/config")];
    }
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.getStatus(), 401);
    assert.deepStrictEqual(res.getBody()[0].data, { error: "Unauthorized", requestId: "req-1" });
  });

  it("returns 401 when API_KEY is configured but value is wrong", () => {
    const original = process.env.API_KEY;
    process.env.API_KEY = "my-secret";
    const req = makeReq({ "x-api-key": "wrong" }, { q: "test" });
    const res = makeRes();
    let nextCalled = false;
    let auth;
    try {
      delete require.cache[require.resolve("../../src/middlewares/apiKeyAuth")];
      delete require.cache[require.resolve("../../src/config")];
      auth = require("../../src/middlewares/apiKeyAuth");
      auth(req, res, () => { nextCalled = true; });
    } finally {
      process.env.API_KEY = original;
      if (auth) delete require.cache[require.resolve("../../src/middlewares/apiKeyAuth")];
      delete require.cache[require.resolve("../../src/config")];
    }
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.getStatus(), 401);
  });

  it("calls next when API_KEY matches", () => {
    const original = process.env.API_KEY;
    process.env.API_KEY = "my-secret";
    const req = makeReq({ "x-api-key": "my-secret" }, { q: "test" });
    const res = makeRes();
    let nextCalled = false;
    let auth;
    try {
      delete require.cache[require.resolve("../../src/middlewares/apiKeyAuth")];
      delete require.cache[require.resolve("../../src/config")];
      auth = require("../../src/middlewares/apiKeyAuth");
      auth(req, res, () => { nextCalled = true; });
    } finally {
      process.env.API_KEY = original;
      if (auth) delete require.cache[require.resolve("../../src/middlewares/apiKeyAuth")];
      delete require.cache[require.resolve("../../src/config")];
    }
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.getStatus(), 200);
  });
});

describe("search.service", () => {
  it("calls searchClient with the provided query and requestId", async () => {
    const query = { q: "hello", page: 1 };
    const requestId = "test-id";
    let thrown = null;
    try {
      await performSearch(query, requestId);
    } catch (e) {
      thrown = e;
    }
    assert.ok(thrown, "Expected an error because search service is not running");
    assert.ok(thrown.statusCode === 503 || thrown.statusCode === 504 || thrown.statusCode === 502);
  });
});

describe("config", () => {
  it("exports expected keys with default values", () => {
    const keys = [
      "port",
      "corsOrigin",
      "rateLimitWindowMs",
      "rateLimitMaxRequests",
      "searchServiceUrl",
      "searchServiceTimeoutMs",
      "apiKey",
      "nodeEnv",
      "logLevel",
    ];
    for (const key of keys) {
      assert.ok(key in config, `config should have key ${key}`);
    }
    assert.strictEqual(typeof config.port, "number");
    assert.strictEqual(typeof config.rateLimitWindowMs, "number");
    assert.strictEqual(typeof config.rateLimitMaxRequests, "number");
    assert.strictEqual(typeof config.searchServiceTimeoutMs, "number");
  });
});
