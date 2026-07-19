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
    maxPages: getNumberEnv("MAX_PAGES", 500),
    maxLinksPerPage: getNumberEnv("MAX_LINKS_PER_PAGE", 50),
    maxQueueSize: getNumberEnv("MAX_QUEUE_SIZE", 2000),
    crawlDelayMs: getNumberEnv("CRAWL_DELAY_MS", 200),
    emptyQueueDelayMs: getNumberEnv("EMPTY_QUEUE_DELAY_MS", 1000),
    errorDelayMs: getNumberEnv("ERROR_DELAY_MS", 500)
};

// State
let shuttingDown = false;

// Utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getVisitedCount() {
    return Number(await redis.scard(VISITED_KEY));
}

async function gracefulShutdown(reason) {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    logger.info(reason, {
        limit: config.maxPages,
        visitedSize: await getVisitedCount()
    });

    await shutdownKafka();
    logger.info("Crawler worker stopped");
}

async function startCrawler() {
    process.once("SIGINT", () => {
        shuttingDown = true;
        logger.warn("SIGINT received. Shutting down crawler worker.");
    });

    process.once("SIGTERM", () => {
        shuttingDown = true;
        logger.warn("SIGTERM received. Shutting down crawler worker.");
    });

    const visitedSize = await getVisitedCount();
    logger.info("Crawler worker started", {
        config,
        currentVisitedCount: visitedSize
    });

    if (visitedSize >= config.maxPages) {
        await gracefulShutdown("Startup crawl state already at or above visited limit. Stopping crawler worker.");
        return;
    }

    while (!shuttingDown) {
        try {
            const currentVisitedSize = await getVisitedCount();

            if (currentVisitedSize >= config.maxPages) {
                await gracefulShutdown("Visited limit reached. Stopping crawler worker.");
                return;
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

            if (currentVisitedSize >= config.maxPages) {
                await gracefulShutdown("Visited limit reached before enqueue. Stopping crawler worker.");
                return;
            }

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

            let added = 0;
            const queueSize = await redis.llen(QUEUE_KEY);

            if (queueSize < config.maxQueueSize) {
                const remainingSlots = Math.max(0, config.maxPages - currentVisitedSize);

                if (remainingSlots === 0) {
                    await gracefulShutdown("Visited limit reached. No more links may be enqueued.");
                    return;
                }

                const limitedLinks = links.slice(0, Math.min(config.maxLinksPerPage, remainingSlots));
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

            if (visitedSize >= config.maxPages) {
                await gracefulShutdown("Visited limit exceeded after enqueue. Stopping crawler worker.");
                return;
            }

            logger.info("Crawler metrics", {
                visitedSize,
                linksEnqueued: added,
                queueSize: updatedQueueSize
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

    if (!shuttingDown) {
        await shutdownKafka();
        logger.info("Crawler worker stopped");
    }
}

module.exports = { startCrawler };