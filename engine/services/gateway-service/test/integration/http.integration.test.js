"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const app = require("../../src/app.js");

function createServer() {
  return http.createServer(app);
}

function request(opts = {}) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, async () => {
      const port = server.address().port;
      const base = `http://127.0.0.1:${port}`;
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path: opts.path || "/",
          method: opts.method || "GET",
          headers: opts.headers || {},
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            server.close();
            resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
          });
        }
      );
      req.on("error", reject);
      req.end();
      if (opts.body) {
        req.write(opts.body);
      }
    });
  });
}

describe("Gateway integration tests", () => {
  it("health endpoint returns 200 ok", async () => {
    const res = await request({ path: "/health" });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body, JSON.stringify({ status: "ok" }));
  });

  it("search endpoint returns 400 when q is missing", async () => {
    const res = await request({ path: "/search" });
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes("Missing required query parameter"));
    assert.ok(body.requestId, "requestId should be present in response");
  });

  it("search endpoint returns 400 when page is invalid", async () => {
    const res = await request({ path: "/search?q=test&page=0" });
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes("page must be a number >= 1"));
  });

  it("search endpoint returns 400 when size is too large", async () => {
    const res = await request({ path: "/search?q=test&size=100" });
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes("size must be a number between 1 and 50"));
  });

  it("search endpoint returns 503 when search service is unreachable", async () => {
    const res = await request({ path: "/search?q=test" });
    assert.strictEqual(res.statusCode, 503);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.error, "Service unavailable");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request({ path: "/unknown" });
    assert.strictEqual(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes("Route not found"));
    assert.ok(body.requestId, "requestId should be present in 404 response");
  });

  it("sets X-Request-ID header on responses", async () => {
    const res = await request({ path: "/health" });
    assert.ok(res.headers["x-request-id"], "X-Request-ID header should be set");
  });

  it("does not skip rate limiter in non-test environment", async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    let rateLimited = false;
    for (let i = 0; i < 105; i++) {
      const res = await request({ path: "/health" });
      if (res.statusCode === 429) {
        rateLimited = true;
        break;
      }
    }
    process.env.NODE_ENV = original;
    assert.ok(rateLimited, "Should be rate limited after many requests");
  });
});
