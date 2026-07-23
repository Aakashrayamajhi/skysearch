"use strict";

const redis = require("../clients/redis.client");
const logger = require("../utils/logger");

const TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 600;
const REDIS_TIMEOUT_MS = Number(process.env.REDIS_OPERATION_TIMEOUT_MS) || 2000;

function withTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        const err = new Error("Redis operation timed out");
        err.code = "REDIS_TIMEOUT";
        reject(err);
      }, REDIS_TIMEOUT_MS)
    )
  ]);
}

function buildKey(query, page, size, filters) {
  const safeQuery = String(query).slice(0, 500);
  const filterStr = JSON.stringify(filters || {});
  return `search:${safeQuery}:${page}:${size}:${filterStr}`;
}

async function get(key) {
  try {
    const value = await withTimeout(redis.get(key));
    if (value) {
      logger.info({ key }, "Cache hit");
      return JSON.parse(value);
    }
  } catch (err) {
    if (err.code === "REDIS_TIMEOUT") {
      logger.warn({ err, key }, "Redis get timeout");
      return null;
    }
    logger.warn({ err, key }, "Redis get failed");
  }
  return null;
}

async function set(key, value, ttl) {
  try {
    const finalTtl = Number.isFinite(ttl) ? ttl : TTL_SECONDS;
    await withTimeout(redis.setex(key, finalTtl, JSON.stringify(value)));
    logger.info({ key, ttl: finalTtl }, "Cache set");
  } catch (err) {
    if (err.code === "REDIS_TIMEOUT") {
      logger.warn({ err, key }, "Redis set timeout");
      return;
    }
    logger.warn({ err, key }, "Redis set failed");
  }
}

async function del(key) {
  try {
    await withTimeout(redis.del(key));
  } catch (err) {
    if (err.code === "REDIS_TIMEOUT") {
      logger.warn({ err, key }, "Redis del timeout");
      return;
    }
    logger.warn({ err, key }, "Redis del failed");
  }
}

module.exports = {
  buildKey,
  get,
  set,
  del,
  TTL_SECONDS
};
