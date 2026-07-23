"use strict";

const logger = require("../utils/logger");

function validateSearch(req, res, next) {
  const query = req.query;

  if (!query.q || typeof query.q !== "string" || query.q.trim() === "") {
    logger.warn({ requestId: req.id }, "Missing required query parameter: q");
    return res.status(400).json({
      error: "Missing required query parameter: q",
      requestId: req.id
    });
  }

  if (query.page !== undefined) {
    const page = Number(query.page);
    if (isNaN(page) || page < 1) {
      logger.warn(
        { requestId: req.id, page: query.page },
        "Invalid query parameter: page"
      );
      return res.status(400).json({
        error: "page must be a number >= 1",
        requestId: req.id
      });
    }
  }

  if (query.size !== undefined) {
    const size = Number(query.size);
    if (isNaN(size) || size <= 0 || size > 50) {
      logger.warn(
        { requestId: req.id, size: query.size },
        "Invalid query parameter: size"
      );
      return res.status(400).json({
        error: "size must be a number between 1 and 50",
        requestId: req.id
      });
    }
  }

  next();
}

module.exports = validateSearch;
