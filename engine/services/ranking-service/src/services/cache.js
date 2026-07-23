const Redis = require("ioredis");

class CacheService {
  constructor(options = {}) {
    try {
      const redisConfig = {
        host: options.host || process.env.REDIS_HOST || "localhost",
        port: options.port || parseInt(process.env.REDIS_PORT, 10) || 6379,
        db: options.db || parseInt(process.env.REDIS_DB, 10) || 0,
        lazyConnect: true
      };

      if (process.env.REDIS_PASSWORD) {
        redisConfig.password = process.env.REDIS_PASSWORD;
      }

      this.redis = new Redis(redisConfig);
      this.ttl = options.ttl || 300;
      this.enabled = true;

      this.redis.on("error", () => {
        this.enabled = false;
      });
    } catch (err) {
      console.error("Failed to initialize Redis:", err.message);
      this.enabled = false;
    }
  }

  async get(key) {
    if (!this.enabled) return null;
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  }

  async set(key, value) {
    if (!this.enabled) return;
    try {
      await this.redis.setex(key, this.ttl, JSON.stringify(value));
    } catch (err) {
      // silent fail is acceptable for cache
    }
  }

  buildKey(query, options = {}) {
    const crypto = require("crypto");
    const hash = crypto
      .createHash("md5")
      .update(JSON.stringify({ query, ...options }))
      .digest("hex");
    return `rank:${hash}`;
  }
}

module.exports = CacheService;
