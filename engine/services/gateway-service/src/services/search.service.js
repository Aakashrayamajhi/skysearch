"use strict";

const { searchClient } = require("../clients/searchServiceClient");

async function performSearch(query, requestId) {
  return searchClient(query, requestId);
}

module.exports = { performSearch };
