"use strict";

const { getNextUrl, fetch, enqueueUrl } = require("../services/url.service");
const { parseHtml } = require("../parsers/html.parser");
const { send } = require("../queue/producer");
const redis = require("../../configs/redis.config");
const logger = require("../utils/logger");

// Redis keys
const QUEUE_KEY = "crawler:queue";
const VISITED_KEY = "crawler:visited";

// Configuration
const MAX_PAGES = 1000;
const MAX_LINKS_PER_PAGE = 50;
const MAX_QUEUE_SIZE = 5000;
const CRAWL_DELAY_MS = 200;
const EMPTY_QUEUE_DELAY_MS = 1000;
const ERROR_DELAY_MS = 500;

// State
let crawledCount = 0;

// Utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startCrawler() {
    logger.info("Crawler worker started");

    while (true) {
        try {
            // Stop condition
            if (crawledCount >= MAX_PAGES) {
                logger.info("Max crawl limit reached. Shutting down crawler.");
                break;
            }

            // Fetch next URL
            const url = await getNextUrl();

            if (!url) {
                logger.debug("Queue is empty. Waiting for new URLs.");
                await sleep(EMPTY_QUEUE_DELAY_MS);
                continue;
            }

            logger.info("Processing URL", { url });

            // Fetch HTML
            const html = await fetch(url);

            if (!html) {
                logger.warn("Failed to fetch URL", { url });
                continue;
            }

            // Parse HTML
            const { links, text } = parseHtml(html, url);

            logger.debug("Parsed content", {
                url,
                linksFound: links.length,
                textLength: text.length
            });

            // Publish to Kafka
            await send({
                url,
                content: text,
                links,
                timestamp: Date.now()
            });

            crawledCount++;

            // Enqueue discovered links with limits
            let added = 0;
            const queueSize = await redis.llen(QUEUE_KEY);

            if (queueSize < MAX_QUEUE_SIZE) {
                const limitedLinks = links.slice(0, MAX_LINKS_PER_PAGE);

                for (const link of limitedLinks) {
                    await enqueueUrl(link);
                    added++;
                }
            } else {
                logger.warn("Queue size limit reached. Skipping link enqueue.", {
                    queueSize,
                    limit: MAX_QUEUE_SIZE
                });
            }

            // Metrics
            const [updatedQueueSize, visitedSize] = await Promise.all([
                redis.llen(QUEUE_KEY),
                redis.scard(VISITED_KEY)
            ]);

            logger.info("Crawler metrics", {
                crawledCount,
                linksEnqueued: added,
                queueSize: updatedQueueSize,
                visitedSize
            });

            // Rate limiting
            await sleep(CRAWL_DELAY_MS);

        } catch (error) {
            logger.error("Unhandled crawler error", {
                message: error.message,
                stack: error.stack
            });

            await sleep(ERROR_DELAY_MS);
        }
    }

    logger.info("Crawler worker stopped");
}

module.exports = { startCrawler };