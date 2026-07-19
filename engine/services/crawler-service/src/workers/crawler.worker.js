"use strict";

const { getNextUrl, fetch, enqueueUrl } = require("../services/url.service");
const { parseHtml } = require("../parsers/html.parser");
const { send, shutdown: shutdownKafka } = require("../queue/producer");
const redis = require("../../configs/redis.config");
const logger = require("../utils/logger");

// Redis keys
const QUEUE_KEY = "crawler:queue";
const VISITED_KEY = "crawler:visited";

function getNumberEnv(name, fallback) {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

const config = {
    maxPages: getNumberEnv("MAX_PAGES", 1000),
    maxLinksPerPage: getNumberEnv("MAX_LINKS_PER_PAGE", 50),
    maxQueueSize: getNumberEnv("MAX_QUEUE_SIZE", 5000),
    crawlDelayMs: getNumberEnv("CRAWL_DELAY_MS", 200),
    emptyQueueDelayMs: getNumberEnv("EMPTY_QUEUE_DELAY_MS", 1000),
    errorDelayMs: getNumberEnv("ERROR_DELAY_MS", 500)
};

// State
let crawledCount = 0;
let shuttingDown = false;

// Utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startCrawler() {
    logger.info("Crawler worker started", {
        config
    });

    process.once("SIGINT", () => {
        shuttingDown = true;
        logger.warn("SIGINT received. Shutting down crawler worker.");
    });

    process.once("SIGTERM", () => {
        shuttingDown = true;
        logger.warn("SIGTERM received. Shutting down crawler worker.");
    });

    while (!shuttingDown) {
        try {
            if (crawledCount >= config.maxPages) {
                logger.info("Max crawl limit reached. Shutting down crawler.");
                break;
            }

            const url = await getNextUrl();

            if (!url) {
                logger.debug("Queue is empty. Waiting for new URLs.");
                await sleep(config.emptyQueueDelayMs);
                continue;
            }

            logger.info("Processing URL", { url });

            const html = await fetch(url);

            if (!html) {
                logger.warn("Failed to fetch URL", { url });
                await sleep(config.errorDelayMs);
                continue;
            }

            const { links, text } = parseHtml(html, url);

            logger.debug("Parsed content", {
                url,
                linksFound: links.length,
                textLength: text.length
            });

            const published = await send({
                url,
                content: text,
                links,
                timestamp: Date.now()
            });

            if (!published) {
                logger.warn("Page payload was not published to Kafka", { url });
            }

            crawledCount++;

            let added = 0;
            const queueSize = await redis.llen(QUEUE_KEY);

            if (queueSize < config.maxQueueSize) {
                const limitedLinks = links.slice(0, config.maxLinksPerPage);
                const enqueueResults = await Promise.allSettled(
                    limitedLinks.map((link) => enqueueUrl(link))
                );

                added = enqueueResults.filter((result) => result.status === "fulfilled").length;
            } else {
                logger.warn("Queue size limit reached. Skipping link enqueue.", {
                    queueSize,
                    limit: config.maxQueueSize
                });
            }

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

            await sleep(config.crawlDelayMs);

        } catch (error) {
            logger.error("Unhandled crawler error", {
                message: error.message,
                stack: error.stack
            });

            await sleep(config.errorDelayMs);
        }
    }

    await shutdownKafka();
    logger.info("Crawler worker stopped");
}

module.exports = { startCrawler };