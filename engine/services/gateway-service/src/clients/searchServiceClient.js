"use strict";

const axios = require("axios");
const logger = require("../utils/logger");
const config = require("../config");

const client = axios.create({
  baseURL: config.searchServiceUrl,
  timeout: config.searchServiceTimeoutMs,
});

function searchClient(queryParams, requestId, maxRetries = 1) {
  let attempt = 0;

  async function attemptRequest() {
    try {
      const response = await client.get("/", {
        params: queryParams,
        headers: requestId ? { "X-Request-ID": requestId } : undefined,
      });
      return response;
    } catch (error) {
      const isLastAttempt = attempt >= maxRetries;
      attempt++;

      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        logger.warn(
          { requestId, attempt, error: error.message },
          "Search service timeout"
        );
        if (isLastAttempt) {
          const err = new Error("Gateway timeout");
          err.statusCode = 504;
          throw err;
        }
        return attemptRequest();
      }

      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        logger.warn(
          { requestId, attempt, error: error.message },
          "Search service unavailable"
        );
        if (isLastAttempt) {
          const err = new Error("Service unavailable");
          err.statusCode = 503;
          throw err;
        }
        return attemptRequest();
      }

      if (error.response) {
        const status = error.response.status;
        if ([502, 503, 504].includes(status) && !isLastAttempt) {
          logger.warn(
            { requestId, attempt, status },
            "Search service error, retrying"
          );
          return attemptRequest();
        }
        const err = new Error(error.message);
        err.statusCode = status || 502;
        throw err;
      }

      if (isLastAttempt) {
        const err = new Error("Service unavailable");
        err.statusCode = 503;
        throw err;
      }
      return attemptRequest();
    }
  }

  return attemptRequest();
}

module.exports = { searchClient };
