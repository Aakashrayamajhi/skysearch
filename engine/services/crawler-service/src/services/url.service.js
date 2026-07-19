"use strict";

const axios = require("axios");
const redis = require("../../cache/redis/redis.client");
const logger = require("../utils/logger");

const QUEUE_KEY = "crawler:queue";
const VISITED_KEY = "crawler:visited";

async function getNextUrl() {
    return await redis.lpop(QUEUE_KEY);
}

async function enqueueUrl(url) {
    if (!url) return;

    const exists = await redis.sismember(VISITED_KEY, url);
    if (exists) return;

    await redis.sadd(VISITED_KEY, url);
    await redis.rpush(QUEUE_KEY, url);
}

async function fetch(url) {
    try {
        const res = await axios.get(url, {
            timeout: 5000,
            maxRedirects: 3,
            validateStatus: s => s >= 200 && s < 400,
            headers: {
                "User-Agent": "SkySearchBot/1.0"
            }
        });

        return res.data;
    } catch (err) {
        logger.warn("Fetch failed", { url, error: err.message });
        return null;
    }
}

module.exports = {
    getNextUrl,
    enqueueUrl,
    fetch
};