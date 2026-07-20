"use strict";

const { Client } = require("@elastic/elasticsearch");
const pRetryModule = require("p-retry");
const pRetry = pRetryModule.default || pRetryModule;

const env = globalThis.process?.env || {};

const fallbackClient = {
    indices: {
        exists: async () => {
            throw new Error("ELASTIC_NODE is not configured.");
        },
        create: async () => {
            throw new Error("ELASTIC_NODE is not configured.");
        }
    },
    bulk: async () => {
        throw new Error("ELASTIC_NODE is not configured.");
    }
};

const client = env.ELASTIC_NODE
    ? new Client({
        node: env.ELASTIC_NODE,
        maxRetries: Number(env.ELASTIC_MAX_RETRIES || 5),
        requestTimeout: Number(env.ELASTIC_REQUEST_TIMEOUT_MS || 60000),
        sniffOnStart: false,
    })
    : fallbackClient;

const INDEX = env.ELASTIC_INDEX || "pages_v1";

async function initIndex() {
    if (!env.ELASTIC_NODE) {
        console.warn("ELASTIC_NODE is not configured. Indexer will start without Elasticsearch readiness.");
        return false;
    }

    try {
        const exists = await pRetry(() => client.indices.exists({ index: INDEX }), {
            retries: Number(env.ELASTIC_INIT_RETRIES || 5),
            minTimeout: Number(env.ELASTIC_INIT_MIN_TIMEOUT_MS || 500),
            maxTimeout: Number(env.ELASTIC_INIT_MAX_TIMEOUT_MS || 3000)
        });

        if (!exists) {
            await client.indices.create({
                index: INDEX,
                body: {
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1,
                        analysis: {
                            analyzer: {
                                default: {
                                    type: "standard"
                                }
                            }
                        }
                    },
                    mappings: {
                        dynamic: "strict",
                        properties: {
                            url: { type: "keyword" },
                            title: { type: "text" },
                            content: { type: "text" },
                            tokens: { type: "keyword" },
                            hash: { type: "keyword" },
                            source: { type: "keyword" },
                            links: { type: "keyword" },
                            fetchedAt: { type: "date" },
                            createdAt: { type: "date" }
                        }
                    }
                }
            });
        }

        return true;
    } catch (error) {
        console.warn("Elasticsearch is not reachable yet. Indexer will keep retrying during document ingestion.", {
            message: error.message
        });
        return false;
    }
}

module.exports = { client, INDEX, initIndex };