"use strict";

const queryService = require("./query.service");
const RankingClient = require("../clients/ranking.client");
const { buildKey, get, set } = require("../repositories/cache.repo");
const analyticsService = require("./analytics.service");
const logger = require("../utils/logger");

function parseFilters(filtersInput) {
  if (!filtersInput) return {};
  if (typeof filtersInput === "object") return filtersInput;
  if (typeof filtersInput === "string") {
    try {
      return JSON.parse(filtersInput);
    } catch {
      return {};
    }
  }
  return {};
}

function validatePageSize(page, size) {
  const pageNum = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const pageSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 10;

  if (pageNum < 1) {
    const err = new Error("Page must be >= 1");
    err.statusCode = 400;
    throw err;
  }
  if (pageSize < 1 || pageSize > 100) {
    const err = new Error("Size must be between 1 and 100");
    err.statusCode = 400;
    throw err;
  }

  return { pageNum, pageSize };
}

class SearchService {
  constructor() {
    this.cacheRepo = { buildKey, get, set };
    this.queryService = queryService;
    this.rankingClient = RankingClient;
    this.analyticsService = analyticsService;
  }

  async search(query, { page, size, filters }) {
    const { pageNum, pageSize } = validatePageSize(page, size);
    const parsedFilters = parseFilters(filters);

    const cacheKey = this.cacheRepo.buildKey(query, pageNum, pageSize, parsedFilters);
    const cached = await this.cacheRepo.get(cacheKey);

    if (cached) {
      cached.cacheHit = true;
      await this.analyticsService.trackSearch({
        query,
        timestamp: new Date().toISOString(),
        page: pageNum,
        size: pageSize,
        total: cached.total || 0,
        cacheHit: true
      });
      return cached;
    }

    const processed = this.queryService.process(query);

    const rankingResponse = await this.rankingClient.search({
      query: processed.expanded.join(" "),
      page: pageNum,
      size: pageSize,
      filters: parsedFilters
    });

    const formatted = {
      query: processed.cleaned,
      page: rankingResponse.page || pageNum,
      size: rankingResponse.size || pageSize,
      total: rankingResponse.totalResults || rankingResponse.totalCandidates || 0,
      results: Array.isArray(rankingResponse.results) ? rankingResponse.results : []
    };

    await this.cacheRepo.set(cacheKey, formatted);

    await this.analyticsService.trackSearch({
      query,
      timestamp: new Date().toISOString(),
      page: pageNum,
      size: pageSize,
      total: formatted.total,
      cacheHit: false
    });

    return formatted;
  }
}

module.exports = new SearchService();
