"use strict";

const SearchService = require("../services/search.service");
const logger = require("../utils/logger");
const metrics = require("../utils/metrics");

class SearchController {
  constructor() {
    this.searchService = new SearchService();
  }

  async search(req, res, next) {
    const startTime = Date.now();
    const { q, page, size, filters } = req.query;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const pageNum = Number(page) || 1;
    const pageSize = Number(size) || 10;

    if (pageNum < 1 || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ error: "Page must be >= 1 and size must be between 1 and 100" });
    }

    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
      } catch {
        parsedFilters = {};
      }
    }

    try {
      const result = await this.searchService.search(q, {
        page: pageNum,
        size: pageSize,
        filters: parsedFilters
      });

      const duration = (Date.now() - startTime) / 1000;
      metrics.searchRequests.inc({ status: "success" });
      metrics.searchDuration.observe(
        { page: String(pageNum), size: String(pageSize), candidates: String(result.totalCandidates || 0) },
        duration
      );

      return res.status(200).json({
        query: q,
        page: result.page,
        size: result.size,
        totalCandidates: result.totalCandidates,
        totalResults: result.totalResults,
        results: result.results
      });
    } catch (err) {
      logger.error({ err, query: q }, "Search error");
      metrics.searchRequests.inc({ status: "error" });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new SearchController();
