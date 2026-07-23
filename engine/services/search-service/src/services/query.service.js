"use strict";

const synonymsConfig = require("../configs/synonyms.config");
const { cleanQuery, tokenize } = require("../utils/query.normalizer");
const logger = require("../utils/logger");

class QueryService {
  constructor(config = {}) {
    this.synonyms = config.synonyms || synonymsConfig;
  }

  clean(query) {
    return cleanQuery(query);
  }

  tokenize(query) {
    return tokenize(query);
  }

  expandSynonyms(cleanedQuery, tokens) {
    const expanded = new Set(tokens);
    const lowerQuery = cleanedQuery.toLowerCase();

    for (const [term, syns] of Object.entries(this.synonyms)) {
      if (lowerQuery.includes(term)) {
        for (const syn of syns) expanded.add(syn);
      }
      for (const syn of syns) {
        if (lowerQuery.includes(syn)) {
          expanded.add(term);
          for (const otherSyn of syns) {
            if (otherSyn !== syn) expanded.add(otherSyn);
          }
        }
      }
    }

    return Array.from(expanded);
  }

  process(query) {
    if (!query || typeof query !== "string") {
      return { cleaned: "", tokens: [], expanded: [] };
    }
    const cleaned = this.clean(query);
    const tokens = this.tokenize(cleaned);
    const expanded = this.expandSynonyms(cleaned, tokens);
    return { cleaned, tokens, expanded };
  }
}

module.exports = new QueryService();
