"use strict";

const { getNextUrl, fetch, enqueueUrl } = require("../services/url.service");
const { parseHtml } = require("../parsers/html.parser");
const { send } = require("../queue/producer");
const redis = require("../../configs/redis.config");
const logger = require("../utils/logger");

const QUEUE_KEY = "crawler:queue";
const VISITED_KEY = "crawler:visited";

async function startCrawler() {
    logger.info("Crawler worker started");

    while (true) {
        const url = await getNextUrl();

        if (!url) {
            logger.info("Queue empty, waiting...");
            await new Promise(r => setTimeout(r, 1000));
            continue;
        }

        logger.info("Fetching URL", { url });

        const html = await fetch(url);
        if (!html) {
            logger.warn("Fetch failed", { url });
            continue;
        }

        logger.info("Parsing HTML", { url });

        const { links, text } = parseHtml(html, url);

        logger.info("Parsed result", {
            url,
            linksFound: links.length,
            textLength: text.length
        });

        // Kafka publish
        await send({
            url,
            content: text,
            links,
            timestamp: Date.now()
        });

        logger.info("Published to Kafka", { url });

        // enqueue new links
        let added = 0;

        for (const link of links) {
            await enqueueUrl(link);
            added++;
        }

        logger.info("Enqueued new links", {
            url,
            added
        });

        // stats
        const queueSize = await redis.llen(QUEUE_KEY);
        const visitedSize = await redis.scard(VISITED_KEY);

        logger.info("Stats", {
            queueSize,
            visitedSize
        });
    }
}

module.exports = { startCrawler };