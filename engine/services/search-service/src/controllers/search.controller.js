"use strict";

const searchService = require("../services/search.service");
const logger = require("../utils/logger");

class SearchController {
  constructor() {
    this.searchService = searchService;
  }

  async handleSearch(req, res, next) {
    const startTime = Date.now();

    try {
      const { q, page, size, filters } = req.query;

      if (!q || typeof q !== "string" || q.trim().length === 0) {
        const err = new Error("Query parameter 'q' is required and must not be empty");
        err.statusCode = 400;
        throw err;
      }

      const result = await this.searchService.search(q.trim(), {
        page,
        size,
        filters
      });

      const duration = (Date.now() - startTime) / 1000;
      logger.info(
        {
          query: q.trim(),
          page: result.page,
          size: result.size,
          total: result.total,
          duration,
          cacheHit: result.cacheHit || false
        },
        "Search completed"
      );

      return res.status(200).json({
        query: result.query,
        page: result.page,
        size: result.size,
        total: result.total,
        results: result.results
      });
    } catch (err) {
      logger.error({ err, query: req.query.q }, "Search controller error");
      next(err);
    }
  }
}

module.exports = new SearchController();
