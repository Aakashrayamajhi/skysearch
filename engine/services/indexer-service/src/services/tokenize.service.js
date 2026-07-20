"use strict";

const STOPWORDS = new Set([
    "the","is","in","at","of","a","and","to","for","on"
]);

function tokenize(text = "") {
    const tokens = text.split(" ");
    const filtered = [];

    for (const t of tokens) {
        if (t && !STOPWORDS.has(t)) {
            filtered.push(t);
        }
    }

    return [...new Set(filtered)];
}

module.exports = { tokenize };