"use strict";

const crawlService = require("../services/crawl.service");
const logger = require("../utils/logger");

const POLL_INTERVAL_MS = 200;

async function startCrawler() {
    logger.info("Crawler worker started");

    while (true) {
        try {
            const processed = await crawlService.processNextUrl();

            if (!processed) {
                await sleep(POLL_INTERVAL_MS);
            }
        } catch (err) {
            logger.error("Worker loop failure", { error: err.message });
            await sleep(1000);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { startCrawler };