"use strict";

const pRetryModule = require("p-retry");
const pRetry = pRetryModule.default || pRetryModule;
const axios = require("axios");
const logger = require("../utils/logger");

const RANKING_SERVICE_URL = process.env.RANKING_SERVICE_URL || "http://localhost:4000";
const RANKING_TIMEOUT_MS = Number(process.env.RANKING_TIMEOUT_MS) || 10000;
const RANKING_RETRIES = process.env.NODE_ENV === "test" ? 0 : Number(process.env.RANKING_RETRIES) || 2;
const RANKING_RETRY_MIN_MS = Number(process.env.RANKING_RETRY_MIN_MS) || 200;
const RANKING_RETRY_MAX_MS = Number(process.env.RANKING_RETRY_MAX_MS) || 2000;

const axiosInstance = axios.create({
  baseURL: RANKING_SERVICE_URL,
  timeout: RANKING_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" }
});

async function search({ query, page, size, filters }) {
  const params = new URLSearchParams();
  params.append("q", query);
  params.append("page", String(page));
  params.append("size", String(size));

  if (filters && Object.keys(filters).length > 0) {
    params.append("filters", JSON.stringify(filters));
  }

  return pRetry(
    async () => {
      const response = await axiosInstance.get("/search", { params });
      return response.data;
    },
    {
      retries: RANKING_RETRIES,
      minTimeout: RANKING_RETRY_MIN_MS,
      maxTimeout: RANKING_RETRY_MAX_MS,
      factor: 2,
      randomize: true
    }
  );
}

module.exports = { search };
