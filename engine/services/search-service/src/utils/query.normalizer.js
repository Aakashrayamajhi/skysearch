"use strict";

function cleanQuery(query) {
  if (!query || typeof query !== "string") return "";
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

function tokenize(query) {
  return cleanQuery(query)
    .split(" ")
    .filter((token) => token.length > 1);
}

module.exports = {
  cleanQuery,
  tokenize
};
