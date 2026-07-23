"use strict";

const searchService = require("../services/search.service");
const logger = require("../utils/logger");

class SearchController {
  constructor() {
    this.searchService = searchService;
    this.handleSearch = this.handleSearch.bind(this);
  }

  async handleSearch(req, res, next) {
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

module.exports = SearchController;
module.exports.default = new SearchController();
