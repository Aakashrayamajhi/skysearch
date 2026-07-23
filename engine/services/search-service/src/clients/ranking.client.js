"use strict";

const axios = require("axios");
const logger = require("../utils/logger");

const RANKING_SERVICE_URL = process.env.RANKING_SERVICE_URL || "http://localhost:4000";
const RANKING_TIMEOUT_MS = Number(process.env.RANKING_TIMEOUT_MS) || 10000;

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

  try {
    const response = await axiosInstance.get("/search", { params });
    logger.info({ query, page, size }, "Ranking service called");
    return response.data;
  } catch (err) {
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      const timeoutError = new Error("Ranking service timed out");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    if (err.response) {
      const rankingError = new Error(err.response.data?.error || "Ranking service error");
      rankingError.statusCode = err.response.status;
      throw rankingError;
    }
    if (err.request) {
      const networkError = new Error("Ranking service unavailable");
      networkError.statusCode = 503;
      throw networkError;
    }
    logger.error({ err, query, page, size }, "Ranking service call failed");
    throw err;
  }
}

module.exports = { search };
