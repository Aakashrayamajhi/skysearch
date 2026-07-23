"use strict";

const redis = require("../clients/redis.client");
const logger = require("../utils/logger");

const TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 600;

function buildKey(query, page, size, filters) {
  const filterStr = JSON.stringify(filters || {});
  return `search:${query}:${page}:${size}:${filterStr}`;
}

async function get(key) {
  try {
    const value = await redis.get(key);
    if (value) {
      logger.info({ key }, "Cache hit");
      return JSON.parse(value);
    }
  } catch (err) {
    logger.warn({ err, key }, "Redis get failed");
  }
  return null;
}

async function set(key, value, ttl) {
  try {
    const finalTtl = Number.isFinite(ttl) ? ttl : TTL_SECONDS;
    await redis.setex(key, finalTtl, JSON.stringify(value));
    logger.info({ key, ttl: finalTtl }, "Cache set");
  } catch (err) {
    logger.warn({ err, key }, "Redis set failed");
  }
}

async function del(key) {
  try {
    await redis.del(key);
  } catch (err) {
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
