"use strict";

const STOPWORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "or", "that", "the",
    "their", "this", "to", "was", "were", "with"
]);

function tokenize(text = "") {
    const tokens = text.split(/\s+/).map((token) => token.trim()).filter(Boolean);
    const filtered = [];

    for (const token of tokens) {
        if (token.length < 2) {
            continue;
        }

        const normalized = token.toLowerCase();
        if (!STOPWORDS.has(normalized)) {
            filtered.push(normalized);
        }
    }

    return [...new Set(filtered)];
}

module.exports = { tokenize };