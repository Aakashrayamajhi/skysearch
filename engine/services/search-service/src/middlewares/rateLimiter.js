"use strict";

const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

const limiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator(req) {
    return req.ip || "unknown";
  },
  skip(req) {
    return process.env.NODE_ENV === "test";
  },
  handler(req, res) {
    logger.warn({ requestId: req.id, ip: req.ip }, "Rate limit exceeded");
    res.status(429).json({
      error: "Too many requests",
      requestId: req.id
    });
  }
});

module.exports = limiter;
