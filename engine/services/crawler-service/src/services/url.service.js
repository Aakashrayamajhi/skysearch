"use strict";

const axios = require("axios");
const redis = require("../../configs/redis.config");
const logger = require("../utils/logger");

const QUEUE_KEY = "crawler:queue";
const VISITED_KEY = "crawler:visited";

/**
 * Get next URL from queue
 */
async function getNextUrl() {
    try {
        const url = await redis.lpop(QUEUE_KEY);

        if (url) {
            logger.info("Dequeued URL", { url });
        }

        return url;

    } catch (err) {
        logger.error("Failed to dequeue URL", { error: err.message });
        return null;
    }
}

/**
 * Add new URL to queue (with dedup)
 */
async function enqueueUrl(url) {
    if (!url) return;

    try {
        const exists = await redis.sismember(VISITED_KEY, url);

        if (exists) {
            logger.info("URL already visited, skipping", { url });
            return;
        }

        // atomic operation (better consistency)
        await redis.multi()
            .sadd(VISITED_KEY, url)
            .rpush(QUEUE_KEY, url)
            .exec();

        logger.info("URL added to queue", { url });

    } catch (err) {
        logger.error("Failed to enqueue URL", {
            url,
            error: err.message
        });
    }
}

/**
 * Fetch HTML from URL
 */
async function fetch(url) {
    try {
        logger.info("Fetching URL", { url });

        const res = await axios.get(url, {
            timeout: 5000,
            maxRedirects: 3,
            validateStatus: s => s >= 200 && s < 400,
            headers: {
                "User-Agent": "SkySearchBot/1.0"
            }
        });

        logger.info("Fetch success", {
            url,
            status: res.status,
            size: res.data?.length || 0
        });

        return res.data;

    } catch (err) {
        logger.warn("Fetch failed", {
            url,
            error: err.message
        });
        return null;
    }
}

module.exports = {
    getNextUrl,
    enqueueUrl,
    fetch
};