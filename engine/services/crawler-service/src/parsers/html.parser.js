"use strict";

const cheerio = require("cheerio");

function parse(html, baseUrl) {
    const $ = cheerio.load(html);

    $("script, style, noscript").remove();

    const text = $("body")
        .text()
        .replace(/\s+/g, " ")
        .trim();

    const links = [];

    $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (href) links.push(resolveUrl(href, baseUrl));
    });

    return { text, links: links.filter(Boolean) };
}

function resolveUrl(href, base) {
    try {
        return new URL(href, base).href;
    } catch {
        return null;
    }
}

module.exports = { parse };