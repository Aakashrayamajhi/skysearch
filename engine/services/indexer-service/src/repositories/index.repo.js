"use strict";

const crypto = require("crypto");
const pRetryModule = require("p-retry");
const pRetry = pRetryModule.default || pRetryModule;
const { client, INDEX } = require("../clients/elastic.client");

function hashContent(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}

async function bulkIndex(docs) {
    if (!docs.length) return;

    const body = [];

    for (const doc of docs) {
        const id = doc.url;
        body.push({ index: { _index: INDEX, _id: id } });
        body.push(doc);
    }

    const res = await pRetry(
        async () => client.bulk({
            refresh: false,
            body,
            timeout: Number(process.env.ELASTIC_BULK_TIMEOUT_MS || 60000)
        }),
        {
            retries: Number(process.env.ELASTIC_BULK_RETRIES || 3),
            minTimeout: Number(process.env.ELASTIC_BULK_MIN_TIMEOUT_MS || 500),
            maxTimeout: Number(process.env.ELASTIC_BULK_MAX_TIMEOUT_MS || 4000)
        }
    );

    if (res.errors) {
        const failed = res.items.filter((item) => item.index && item.index.error);
        throw new Error(`Bulk indexing failed: ${failed.length} document(s) rejected by Elasticsearch.`);
    }

    return res;
}

module.exports = { bulkIndex, hashContent };