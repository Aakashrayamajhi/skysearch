"use strict";

const CircuitBreaker = require("opossum");
const queryService = require("./query.service");
const RankingClient = require("../clients/ranking.client");
const { get, set, TTL_SECONDS } = require("../repositories/cache.repo");
const analyticsService = require("./analytics.service");
const { parse: parseFilters } = require("../utils/filters.validator");
const logger = require("../utils/logger");

const MAX_QUERY_LENGTH = Number(process.env.MAX_QUERY_LENGTH) || 500;

const rankingOptions = {
  timeout: process.env.NODE_ENV === "test" ? 2000 : Number(process.env.CIRCUIT_RANKING_TIMEOUT_MS) || 12000,
  errorThresholdPercentage: Number(process.env.CIRCUIT_RANKING_ERROR_THRESHOLD) || 50,
  resetTimeout: Number(process.env.CIRCUIT_RANKING_RESET_MS) || 30000,
  volumeThreshold: process.env.NODE_ENV === "test" ? 1 : Number(process.env.CIRCUIT_RANKING_VOLUME) || 10,
  name: "ranking-service"
};

const rankingBreaker = new CircuitBreaker(async ({ query, page, size, filters }) => {
  return RankingClient.search({ query, page, size, filters });
}, rankingOptions);

rankingBreaker.on("open", () => {
  logger.warn(null, "Ranking service circuit breaker opened");
});
rankingBreaker.on("half-open", () => {
  logger.info(null, "Ranking service circuit breaker half-open");
});
rankingBreaker.on("close", () => {
  logger.info(null, "Ranking service circuit breaker closed");
});

function validateQuery(query) {
  if (!query || typeof query !== "string") {
    const err = new Error("Query parameter 'q' is required and must not be empty");
    err.statusCode = 400;
    throw err;
  }
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    const err = new Error("Query parameter 'q' is required and must not be empty");
    err.statusCode = 400;
    throw err;
  }
  if (trimmed.length > MAX_QUERY_LENGTH) {
    const err = new Error(`Query must be <= ${MAX_QUERY_LENGTH} characters`);
    err.statusCode = 400;
    throw err;
  }
  return trimmed;
}

function validatePageSize(page, size) {
  let pageNum;
  if (page === undefined || page === null || page === "") {
    pageNum = 1;
  } else if (typeof page === "number" && Number.isFinite(page) && page >= 1 && Number.isInteger(page)) {
    pageNum = page;
  } else if (typeof page === "string" && /^[0-9]+$/.test(page.trim()) && Number(page) >= 1) {
    pageNum = Number(page);
  } else {
    const err = new Error("Page must be a positive integer >= 1");
    err.statusCode = 400;
    throw err;
  }

  let pageSize;
  if (size === undefined || size === null || size === "") {
    pageSize = 10;
  } else if (typeof size === "number" && Number.isFinite(size) && size >= 1 && Number.isInteger(size)) {
    pageSize = size;
  } else if (typeof size === "string" && /^[0-9]+$/.test(size.trim()) && Number(size) >= 1) {
    pageSize = Number(size);
  } else {
    const err = new Error("Size must be a positive integer between 1 and 100");
    err.statusCode = 400;
    throw err;
  }

  if (pageSize > 100) {
    const err = new Error("Size must be <= 100");
    err.statusCode = 400;
    throw err;
  }

  return { pageNum, pageSize };
}

function buildCacheKey(query, page, size, filters) {
  const filterStr = JSON.stringify(filters || {});
  const safeQuery = String(query).slice(0, MAX_QUERY_LENGTH);
  return `search:${safeQuery}:${page}:${size}:${filterStr}`;
}

class SearchService {
  constructor() {
    this.queryService = queryService;
    this.rankingClient = rankingBreaker;
    this.analyticsService = analyticsService;
  }

  async search(query, { page, size, filters }) {
    const validatedQuery = validateQuery(query);
    const { pageNum, pageSize } = validatePageSize(page, size);
    const parsedFilters = parseFilters(filters);

    const cacheKey = buildCacheKey(validatedQuery, pageNum, pageSize, parsedFilters);
    let cached = null;

    try {
      cached = await get(cacheKey);
    } catch (err) {
      logger.warn({ err, query: validatedQuery }, "Redis get failed, proceeding without cache");
    }

    if (cached) {
      cached.cacheHit = true;
      await analyticsService.trackSearch({
        query: validatedQuery,
        timestamp: new Date().toISOString(),
        page: pageNum,
        size: pageSize,
        total: cached.total || 0,
        cacheHit: true
      }).catch(() => {});
      return cached;
    }

    const processed = this.queryService.process(validatedQuery);

    let rankingResponse;
    try {
      rankingResponse = await this.rankingClient.fire({
        query: processed.expanded.join(" "),
        page: pageNum,
        size: pageSize,
        filters: parsedFilters
      });
    } catch (err) {
      if (err.message && err.message.includes("timed out")) {
        const timeoutErr = new Error("Ranking service timed out");
        timeoutErr.statusCode = 504;
        throw timeoutErr;
      }
      if (err.message && err.message.includes("unavailable")) {
        const unavailableErr = new Error("Ranking service unavailable");
        unavailableErr.statusCode = 503;
        throw unavailableErr;
      }
      logger.error({ err, query: validatedQuery }, "Ranking service call failed");
      const rankingErr = new Error("Search failed due to ranking service error");
      rankingErr.statusCode = 502;
      throw rankingErr;
    }

    const formatted = {
      query: processed.cleaned,
      page: rankingResponse.page || pageNum,
      size: rankingResponse.size || pageSize,
      total: rankingResponse.totalResults || rankingResponse.totalCandidates || 0,
      results: Array.isArray(rankingResponse.results) ? rankingResponse.results : []
    };

    try {
      await set(cacheKey, formatted, TTL_SECONDS);
    } catch (err) {
      logger.warn({ err, query: validatedQuery }, "Redis set failed");
    }

    await analyticsService.trackSearch({
      query: validatedQuery,
      timestamp: new Date().toISOString(),
      page: pageNum,
      size: pageSize,
      total: formatted.total,
      cacheHit: false
    }).catch(() => {});

    return formatted;
  }
}

const instance = new SearchService();

module.exports = instance;
module.exports.SearchService = SearchService;
module.exports.default = instance;
module.exports.validateQuery = validateQuery;
module.exports.validatePageSize = validatePageSize;
module.exports.parseFilters = parseFilters;
module.exports.buildCacheKey = buildCacheKey;
module.exports.TTL_SECONDS = TTL_SECONDS;
