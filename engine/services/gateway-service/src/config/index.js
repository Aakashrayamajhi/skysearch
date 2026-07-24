"use strict";

module.exports = {
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  searchServiceUrl:
    process.env.SEARCH_SERVICE_URL || "http://localhost:3001",
  searchServicePath: process.env.SEARCH_SERVICE_PATH || "/search",
  searchServiceTimeoutMs:
    Number(process.env.SEARCH_SERVICE_TIMEOUT_MS) || 4000,
  apiKey: process.env.API_KEY,
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info"
};
