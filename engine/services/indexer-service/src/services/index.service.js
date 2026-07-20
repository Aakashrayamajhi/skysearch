"use strict";

const { z } = require("zod");
const { normalize } = require("./normalize.service");
const { tokenize } = require("./tokenize.service");
const { bulkIndex, hashContent } = require("../repositories/index.repo");

const env = globalThis.process?.env || {};
const BATCH_SIZE = Number(env.INDEXER_BATCH_SIZE || 50);
const FLUSH_INTERVAL_MS = Number(env.INDEXER_FLUSH_INTERVAL_MS || 3000);
const seen = new Set();
let buffer = [];
let flushTimer = null;

function ensureFlushLoop() {
    if (flushTimer) {
        return;
    }

    flushTimer = setInterval(() => {
        if (buffer.length) {
            flush().catch((error) => {
                console.error("buffer flush failed", {
                    message: error.message
                });
            });
        }
    }, FLUSH_INTERVAL_MS);
}

ensureFlushLoop();

const PayloadSchema = z.object({
    url: z.string().trim().min(1),
    content: z.string().optional(),
    text: z.string().optional(),
    title: z.string().optional().default(""),
    links: z.array(z.string().trim().min(1)).optional().default([]),
    timestamp: z.number().optional()
}).passthrough();

function validate(payload) {
    const result = PayloadSchema.safeParse(payload);
    if (!result.success) {
        return null;
    }

    const normalizedUrl = result.data.url.trim();
    try {
        const url = new URL(normalizedUrl);
        if (!url.protocol || !url.hostname) {
            return null;
        }
    } catch {
        return null;
    }

    return result.data;
}

function buildDocument(payload) {
    const safePayload = validate(payload);
    if (!safePayload) {
        return null;
    }

    const rawText = safePayload.content || safePayload.text || "";
    const clean = normalize(rawText);
    if (!clean) {
        return null;
    }

    const doc = {
        url: safePayload.url,
        title: (safePayload.title || "").trim(),
        content: clean,
        links: safePayload.links.filter(Boolean),
        tokens: tokenize(clean),
        hash: hashContent(clean),
        source: "crawler",
        fetchedAt: new Date(safePayload.timestamp || Date.now()),
        createdAt: new Date()
    };

    return doc;
}

async function process(payload) {
    const doc = buildDocument(payload);
    if (!doc) {
        console.warn("indexer dropped invalid payload", { url: payload?.url });
        return;
    }

    const dedupeKey = `${doc.url}:${doc.hash}`;
    if (seen.has(dedupeKey)) {
        console.log("indexer skipped duplicate document", { url: doc.url, hash: doc.hash });
        return;
    }

    seen.add(dedupeKey);
    buffer.push(doc);
    console.log("indexer buffered document", { url: doc.url, hash: doc.hash, bufferSize: buffer.length });

    if (buffer.length >= BATCH_SIZE) {
        await flush();
    }
}

async function flush() {
    if (buffer.length) {
        const batch = buffer.splice(0, buffer.length);
        console.log("indexer flush started", { batchSize: batch.length });
        await bulkIndex(batch);
        console.log("indexer flush completed", { batchSize: batch.length });
    }
}

module.exports = { process, flush, buildDocument };