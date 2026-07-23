"use strict";

const logger = require("../utils/logger");

function slowQuery(req, res, next) {
  const startTime = Date.now();
  res.locals.startTime = startTime;
  next();
}

slowQuery.onFinished = async (req, res) => {
  if (!res.locals.startTime) return;
  const duration = (Date.now() - res.locals.startTime) / 1000;
  const threshold = Number(process.env.SLOW_QUERY_THRESHOLD_SECONDS) || 1;
  if (duration > threshold && req.originalUrl.startsWith("/search")) {
    logger.warn(
      {
        url: req.originalUrl,
        duration,
        requestId: req.id
      },
      "Slow query detected"
    );
  }
};

module.exports = slowQuery;
