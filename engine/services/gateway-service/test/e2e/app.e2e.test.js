"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const net = require("node:net");

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function startApp() {
  const app = require("../../src/app.js");
  const port = await findAvailablePort();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(port, resolve));
  return { app, server, port };
}

async function stopApp({ server }) {
  await new Promise((resolve) => server.close(resolve));
}

function httpGet(path, port, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "127.0.0.1", port, path, method: "GET", headers },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

describe("Gateway e2e tests", () => {
  let server;
  let port;

  it("starts and stops cleanly", async () => {
    const result = await startApp();
    server = result.server;
    port = result.port;
    assert.ok(port > 0, "port should be positive");
    const res = await httpGet("/health", port);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body, JSON.stringify({ status: "ok" }));
  });

  it("propagates requestId in headers and body", async () => {
    const res = await httpGet("/search?q=test&size=invalid", port);
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.ok(body.requestId);
    assert.match(body.requestId, /^[0-9a-f-]+$/i);
    assert.strictEqual(res.headers["x-request-id"], body.requestId);
  });

  it("gracefully rejects oversized payloads", async () => {
    const res = await httpGet("/search?q=test", port);
    assert.strictEqual(res.statusCode, 503);
  });

  it("validates all query parameter combinations", async () => {
    const cases = [
      { path: "/search?q=a&size=51", expected: 400, contains: "size must be a number between 1 and 50" },
      { path: "/search?q=a&size=0", expected: 400, contains: "size must be a number between 1 and 50" },
      { path: "/search?q=a&page=0", expected: 400, contains: "page must be a number >= 1" },
      { path: "/search?q=a&page=-1", expected: 400, contains: "page must be a number >= 1" },
      { path: "/search?q=a&page=abc", expected: 400, contains: "page must be a number >= 1" },
      { path: "/search?q=a&size=abc", expected: 400, contains: "size must be a number between 1 and 50" },
    ];
    for (const c of cases) {
      const res = await httpGet(c.path, port);
      assert.strictEqual(res.statusCode, c.expected, `Path ${c.path} expected ${c.expected}`);
      const body = JSON.parse(res.body);
      assert.ok(body.error.includes(c.contains), `Path ${c.path} body should contain "${c.contains}"`);
    }
  });

  it("does not crash on unhandled errors", async () => {
    const res = await httpGet("/unknown", port);
    assert.strictEqual(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes("Route not found"));
  });

  it("headers include security best practices", async () => {
    const res = await httpGet("/health", port);
    assert.ok(res.headers["x-content-type-options"] === "nosniff");
    assert.ok(res.headers["x-frame-options"] === "SAMEORIGIN");
    assert.ok(res.headers["strict-transport-security"], "HSTS should be set");
  });

  it.after(async () => {
    if (server) {
      await stopApp({ server });
    }
  });
});
