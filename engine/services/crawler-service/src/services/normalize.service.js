"use strict";

const { URL } = require("url");

function normalizeUrl(input) {
    try {
        const url = new URL(input);

        url.hash = "";
        url.search = "";

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }

        return url.href;
    } catch {
        return null;
    }
}

module.exports = { normalizeUrl };