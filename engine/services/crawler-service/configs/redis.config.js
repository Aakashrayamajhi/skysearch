"use strict";

const Redis = require("ioredis");

const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,

    maxRetriesPerRequest: 5,
    retryStrategy: (times) => {
        const delay = Math.min(times * 100, 2000);
        return delay;
    },

    reconnectOnError: (err) => {
        const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
        return targetErrors.some(e => err.message.includes(e));
    }
});

redis.on("connect", () => {
    console.log("[Redis] Connected");
});

redis.on("error", (err) => {
    console.error("[Redis] Error:", err.message);
});

module.exports = redis;