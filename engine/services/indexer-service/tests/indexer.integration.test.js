const test = require("node:test");
const assert = require("node:assert/strict");

const { buildDocument } = require("../src/services/index.service");

test("buildDocument turns crawler page payload into an index-ready document", () => {
    const payload = {
        url: "https://example.com/articles/intro",
        title: "Intro Article",
        content: "Hello world!!! This page is a test.",
        links: ["https://example.com", "https://example.com/about"],
        timestamp: 1700000000000
    };

    const document = buildDocument(payload);

    assert.equal(document.url, payload.url);
    assert.equal(document.title, payload.title);
    assert.equal(document.content, "hello world this page is a test");
    assert.deepEqual(document.tokens, ["hello", "world", "page", "test"]);
    assert.equal(typeof document.hash, "string");
    assert.ok(document.hash.length > 0);
    assert.ok(document.createdAt instanceof Date);
    assert.deepEqual(document.links, payload.links);
    assert.equal(document.source, "crawler");
});
