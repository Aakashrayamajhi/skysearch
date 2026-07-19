"use strict";

const cheerio = require("cheerio");
const logger = require("../utils/logger");

/**
 * Parse HTML and extract links + text
 */
function parseHtml(html, baseUrl) {
    try {
        const $ = cheerio.load(html);

        const links = [];
        const text = $("body").text().replace(/\s+/g, " ").trim();

        $("a[href]").each((_, el) => {
            let href = $(el).attr("href");

            if (!href) return;

            // convert relative → absolute
            try {
                const absoluteUrl = new URL(href, baseUrl).href;
                links.push(absoluteUrl);
            } catch (err) {
                // invalid URL skip
            }
        });

        logger.info("HTML parsed", {
            url: baseUrl,
            linksExtracted: links.length
        });

        return {
            links,
            text
        };

    } catch (err) {
        logger.error("HTML parsing failed", {
            url: baseUrl,
            error: err.message
        });

        return {
            links: [],
            text: ""
        };
    }
}

module.exports = { parseHtml };