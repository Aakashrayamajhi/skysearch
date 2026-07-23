"use strict";

const logger = require("../utils/logger");
const config = require("../config");

function apiKeyAuth(req, res, next) {
  const requiredKey = config.apiKey;

  if (!requiredKey) {
    return next();
  }

  const providedKey = req.headers["x-api-key"];

  if (!providedKey || providedKey !== requiredKey) {
    logger.warn({ requestId: req.id }, "Unauthorized API key attempt");
    return res.status(401).json({ error: "Unauthorized", requestId: req.id });
  }

  next();
}

module.exports = apiKeyAuth;
