"use strict";

const FreshnessBoost = require("./freshness");
const LinkBoost = require("./linkboost");
const { searchDocuments } = require("../clients/elastic.client");

class SearchService {
  constructor(options = {}) {
    this.freshnessBoost = new FreshnessBoost(options.freshness);
    this.linkBoost = new LinkBoost();
  }

  async search(query, options = {}) {
    const page = Number(options.page || 1);
    const size = Number(options.size || 10);

    if (!query || typeof query !== "string") {
      throw new Error("Query is required and must be a string");
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return { results: [], page, size, totalCandidates: 0 };
    }

    const esResponse = await searchDocuments(trimmedQuery, { page, size });

    if (!esResponse.hits || !esResponse.hits.hits) {
      return { results: [], page, size, totalCandidates: 0 };
    }

    const hits = esResponse.hits.hits;
    const ranked = hits.map((hit) => {
      const source = hit._source || {};
      const esScore = hit._score || 0;

      const createdAt = source.createdAt ? new Date(source.createdAt).getTime() : null;
      const fetchedAt = source.fetchedAt ? new Date(source.fetchedAt).getTime() : null;

      const freshness = this.freshnessBoost.compute(fetchedAt, createdAt);
      const linkCount = Array.isArray(source.links) ? source.links.length : 0;
      const linkBoost = this.linkBoost.compute(linkCount);

      const finalScore = esScore * freshness * linkBoost;

      let snippet = "";
      if (hit.highlight) {
        const contentHighlights = hit.highlight.content || [];
        const titleHighlights = hit.highlight.title || [];
        snippet = contentHighlights[0] || titleHighlights[0] || "";
      }
      if (!snippet && source.content) {
        snippet = source.content.slice(0, 200).trim() + "...";
      }

      return {
        title: source.title || "",
        url: source.url || "",
        snippet,
        image: source.image || null,
        score: finalScore
      };
    });

    ranked.sort((a, b) => b.score - a.score);

    const start = (page - 1) * size;
    const paginated = ranked.slice(start, start + size);

    return {
      results: paginated,
      page,
      size,
      totalCandidates: hits.length,
      totalResults: ranked.length
    };
  }
}

module.exports = SearchService;
