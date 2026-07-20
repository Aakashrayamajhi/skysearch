"use strict";

function normalize(text = "") {
    return text
        .toLowerCase()
        .replace(/<[^>]*>/g, " ")     // strip HTML
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

module.exports = { normalize };