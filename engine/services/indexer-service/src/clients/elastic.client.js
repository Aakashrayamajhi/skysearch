"use strict";

const { Client } = require("@elastic/elasticsearch");

const client = new Client({
    node: process.env.ELASTIC_NODE,
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: false,
});

const INDEX = process.env.ELASTIC_INDEX || "pages_v1";

async function initIndex() {
    const exists = await client.indices.exists({ index: INDEX });

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
                        createdAt: { type: "date" }
                    }
                }
            }
        });
    }
}

module.exports = { client, INDEX, initIndex };