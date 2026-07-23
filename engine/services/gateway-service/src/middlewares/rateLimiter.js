"use strict";

const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");
const config = require("../config");

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator(req) {
    return req.ip || "unknown";
  },
  skip(req) {
    return config.nodeEnv === "test";
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
