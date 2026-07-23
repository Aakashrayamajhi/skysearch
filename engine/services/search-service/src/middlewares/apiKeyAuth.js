"use strict";

const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

function apiKeyAuth(req, res, next) {
  const requiredKey = process.env.API_KEY;

  if (!requiredKey) {
    return next();
  }

  const providedKey = req.headers["x-api-key"];

  if (!providedKey || providedKey !== requiredKey) {
    logger.warn({ requestId: req.id }, "Unauthorized API key attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

module.exports = apiKeyAuth;
