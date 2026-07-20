"use strict";

const crypto = require("crypto");
const { client, INDEX } = require("../clients/elastic.client");

function hashContent(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}

async function bulkIndex(docs) {
    if (!docs.length) return;

    const body = [];

    for (const doc of docs) {
        const id = doc.url; // idempotent key
        body.push({ index: { _index: INDEX, _id: id } });
        body.push(doc);
    }

    const res = await client.bulk({
        refresh: false,
        body
    });

    if (res.errors) {
        const failed = res.items.filter(i => i.index && i.index.error);
        throw new Error(`Bulk indexing failed: ${failed.length}`);
    }
}

module.exports = { bulkIndex, hashContent };