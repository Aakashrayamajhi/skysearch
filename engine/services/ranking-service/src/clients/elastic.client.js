"use strict";

require("dotenv").config();

const pRetryModule = require("p-retry");
const pRetry = pRetryModule.default || pRetryModule;
const { Client } = require("@elastic/elasticsearch");

const env = globalThis.process?.env || {};

const client = new Client({
  node: env.ELASTIC_NODE || "http://localhost:9200",
  maxRetries: Number(env.ELASTIC_MAX_RETRIES || 5),
  requestTimeout: Number(env.ELASTIC_REQUEST_TIMEOUT_MS || 60000),
  sniffOnStart: false,
});

const INDEX = env.ELASTIC_INDEX || "pages_v1";

async function searchDocuments(query, options = {}) {
  const body = {
    query: {
      multi_match: {
        query,
        fields: ["title^3", "content"],
        fuzziness: "AUTO",
        operator: "or",
        type: "best_fields",
        tie_breaker: 0.3
      }
    },
    highlight: {
      fields: {
        title: {
          fragment_size: 150,
          number_of_fragments: 1,
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"]
        },
        content: {
          fragment_size: 150,
          number_of_fragments: 3,
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"]
        }
      }
    },
    _source: ["title", "url", "content", "fetchedAt", "createdAt", "links", "image"],
    from: 0,
    size: 100,
    track_scores: true
  };

  const response = await pRetry(
    async () => client.search({
      index: INDEX,
      body
    }),
    {
      retries: Number(env.ELASTIC_SEARCH_RETRIES || 3),
      minTimeout: Number(env.ELASTIC_SEARCH_MIN_TIMEOUT_MS || 200),
      maxTimeout: Number(env.ELASTIC_SEARCH_MAX_TIMEOUT_MS || 2000)
    }
  );

  return response.body || response;
}

module.exports = { client, INDEX, searchDocuments };
