"use strict";

const { z } = require("zod");
const { normalize } = require("./normalize.service");
const { tokenize } = require("./tokenize.service");
const { bulkIndex, hashContent } = require("../repositories/index.repo");

const BATCH_SIZE = 50;
const seen = new Set();
let buffer = [];

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
        return;
    }

    const dedupeKey = `${doc.url}:${doc.hash}`;
    if (seen.has(dedupeKey)) {
        return;
    }

    seen.add(dedupeKey);
    buffer.push(doc);

    if (buffer.length >= BATCH_SIZE) {
        const batch = buffer.splice(0, buffer.length);
        await bulkIndex(batch);
    }
}

async function flush() {
    if (buffer.length) {
        const batch = buffer.splice(0, buffer.length);
        await bulkIndex(batch);
    }
}

module.exports = { process, flush, buildDocument };