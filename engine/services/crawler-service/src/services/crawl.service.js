"use strict";

const urlService = require("./url.service");
const parser = require("../parsers/html.parser");
const producer = require("../queue/producer");
const robots = require("../utils/robots");
const normalize = require("./normalize.service");
const logger = require("../utils/logger");

async function processNextUrl() {
    const url = await urlService.getNextUrl();
    if (!url) return false;

    if (!(await robots.isAllowed(url))) {
        logger.warn("Blocked by robots", { url });
        return true;
    }

    const html = await urlService.fetch(url);
    if (!html) return true;

    const { text, links } = parser.parse(html, url);

    await producer.send({
        url,
        text,
        links
    });

    for (const link of links) {
        const normalized = normalize.normalizeUrl(link);
        if (normalized) {
            await urlService.enqueueUrl(normalized);
        }
    }

    return true;
}

module.exports = { processNextUrl };