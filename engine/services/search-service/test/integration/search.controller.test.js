"use strict";

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

describe("SearchController integration", () => {
  let server;
  let originalRankingUrl;

  function createMockRankingServer() {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const q = url.searchParams.get("q");
      const page = Number(url.searchParams.get("page") || 1);
      const size = Number(url.searchParams.get("size") || 10);
      const filtersParam = url.searchParams.get("filters");

      if (!req.url.includes("/search")) {
        res.writeHead(404);
        res.end();
        return;
      }

      if (q === "timeout") {
        setTimeout(() => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ page, size, totalResults: 0, results: [] }));
        }, 15000);
        return;
      }

      if (q === "error500") {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Boom" }));
        return;
      }

      if (q === "unavailable") {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unavailable" }));
        return;
      }

      let filters = {};
      if (filtersParam) {
        try {
          filters = JSON.parse(filtersParam);
        } catch {
          // ignore
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          query: q,
          page,
          size,
          totalResults: filters.domain ? 1 : 10,
          results: filters.domain
            ? [{ title: `Result for ${filters.domain}`, url: `https://${filters.domain}`, snippet: "snippet", score: 1 }]
            : Array.from({ length: size }, (_, i) => ({
                title: `Result ${i + 1}`,
                url: `https://example.com/${i + 1}`,
                snippet: "snippet",
                score: 1 - i * 0.1
              }))
        })
      );
    });

    return server;
  }

  before(async () => {
    server = createMockRankingServer();
    await new Promise((resolve) => server.listen(0, resolve));
    const address = server.address();
    originalRankingUrl = process.env.RANKING_SERVICE_URL;
    process.env.RANKING_SERVICE_URL = `http://localhost:${address.port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    process.env.RANKING_SERVICE_URL = originalRankingUrl;
  });

  it("returns 400 for empty query", async () => {
    const SearchController = require("../../src/controllers/search.controller");
    const controller = new SearchController();
    const res = await new Promise((resolve) => {
      const req = { query: {}, id: "test" };
      const mockRes = {
        statusCode: 0,
        json(data) {
          resolve({ statusCode: this.statusCode, data });
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        setHeader() {}
      };
      controller.handleSearch(req, mockRes, () => {});
    });
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.data.error);
  });

  it("returns results for normal query", async () => {
    const SearchController = require("../../src/controllers/search.controller");
    const controller = new SearchController();
    const res = await new Promise((resolve) => {
      const req = { query: { q: "hello" }, id: "test" };
      const mockRes = {
        statusCode: 0,
        json(data) {
          resolve({ statusCode: this.statusCode, data });
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        setHeader() {}
      };
      controller.handleSearch(req, mockRes, () => {});
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.data.results));
  });

  it("forwards pagination to ranking service", async () => {
    const SearchController = require("../../src/controllers/search.controller");
    const controller = new SearchController();
    const res = await new Promise((resolve) => {
      const req = { query: { q: "hello", page: "2", size: "5" }, id: "test" };
      const mockRes = {
        statusCode: 0,
        json(data) {
          resolve({ statusCode: this.statusCode, data });
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        setHeader() {}
      };
      controller.handleSearch(req, mockRes, () => {});
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.page, 2);
    assert.strictEqual(res.data.size, 5);
  });

  it("returns 504 on ranking timeout", async () => {
    const SearchController = require("../../src/controllers/search.controller");
    const controller = new SearchController();
    const res = await new Promise((resolve) => {
      const req = { query: { q: "timeout" }, id: "test" };
      const mockRes = {
        statusCode: 0,
        json(data) {
          resolve({ statusCode: this.statusCode, data });
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        setHeader() {}
      };
      controller.handleSearch(req, mockRes, () => {});
    });
    assert.strictEqual(res.statusCode, 504);
  });

  it("returns 503 on ranking unavailable", async () => {
    const SearchController = require("../../src/controllers/search.controller");
    const controller = new SearchController();
    const res = await new Promise((resolve) => {
      const req = { query: { q: "unavailable" }, id: "test" };
      const mockRes = {
        statusCode: 0,
        json(data) {
          resolve({ statusCode: this.statusCode, data });
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        setHeader() {}
      };
      controller.handleSearch(req, mockRes, () => {});
    });
    assert.strictEqual(res.statusCode, 503);
  });
});
