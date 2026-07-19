"use strict";

const redis = require("../../configs/redis.config");
const logger = require("../utils/logger");

const QUEUE_KEY = "crawler:queue";
const VISITED_KEY = "crawler:visited";

const DEFAULT_SEEDS = [
    "https://google.com",
    "https://wikipedia.org",
    "https://news.ycombinator.com",
    "https://stackoverflow.com"
];

async function seedUrls(seeds = DEFAULT_SEEDS) {
    let added = 0;

    for (const url of seeds) {
        const exists = await redis.sismember(VISITED_KEY, url);

        if (!exists) {
            await redis.multi()
                .sadd(VISITED_KEY, url)
                .rpush(QUEUE_KEY, url)
                .exec();

            added++;
            logger.info("Seed URL added", { url });
        }
    }

    if (added === 0) {
        logger.warn("No new seed URLs added (all already visited)");
    }

    return added;
}

module.exports = { seedUrls };