"use strict";

const Redis = require("ioredis");
const logger = require("../utils/logger");

const REDIS_TIMEOUT_MS = Number(process.env.REDIS_OPERATION_TIMEOUT_MS) || 2000;

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB) || 0,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  commandsTimeout: REDIS_TIMEOUT_MS
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (err) => {
  logger.error("Redis connection error", { error: err.message });
});

module.exports = redis;
