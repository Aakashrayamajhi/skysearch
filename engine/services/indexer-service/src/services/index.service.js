"use strict";

const { normalize } = require("./normalize.service");
const { tokenize } = require("./tokenize.service");
const { bulkIndex, hashContent } = require("../repositories/index.repo");

const BATCH_SIZE = 50;
let buffer = [];

function validate(payload) {
    if (!payload) return false;
    if (!payload.url || !payload.content) return false;
    return true;
}

async function process(payload) {
    if (!validate(payload)) return;

    const clean = normalize(payload.content);
    if (!clean) return;

    const tokens = tokenize(clean);

    const doc = {
        url: payload.url,
        title: payload.title || "",
        content: clean,
        tokens,
        hash: hashContent(clean),
        createdAt: new Date()
    };

    buffer.push(doc);

    if (buffer.length >= BATCH_SIZE) {
        const batch = buffer;
        buffer = [];
        await bulkIndex(batch);
    }
}

async function flush() {
    if (buffer.length) {
        const batch = buffer;
        buffer = [];
        await bulkIndex(batch);
    }
}

module.exports = { process, flush };