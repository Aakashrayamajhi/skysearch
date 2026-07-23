const { RankingService } = require("../services/rank.service");
const CacheService = require("../services/cache");
const logger = require("../utils/logger");
const metrics = require("../utils/metrics");

class RankController {
  constructor() {
    this.rankingService = new RankingService();
    this.cache = new CacheService();
  }

  async rankDocuments(req, res, next) {
    const startTime = Date.now();

    try {
      const { query, documents, docs, k = 10 } = req.body;

      if (!query || typeof query !== "string") {
        metrics.rankingRequests.inc({ status: "validation_error" });
        return res.status(400).json({ error: "Invalid query" });
      }

      const docList = Array.isArray(documents) ? documents : Array.isArray(docs) ? docs : null;
      if (!docList) {
        metrics.rankingRequests.inc({ status: "validation_error" });
        return res.status(400).json({ error: "documents array is required" });
      }

      const cacheKey = this.cache.buildKey(query, { k, docCount: docList.length });
      const cached = await this.cache.get(cacheKey);

      let results;
      let cacheHit = false;

      if (cached) {
        results = cached;
        cacheHit = true;
        logger.info({ query, docCount: docList.length }, "Cache hit");
      } else {
        results = this.rankingService.rank(docList, query, { k });
        await this.cache.set(cacheKey, results);
        logger.info({ query, docCount: docList.length }, "Cache miss");
      }

      const durationSec = (Date.now() - startTime) / 1000;
      metrics.rankingDuration.observe(
        { cache_hit: cacheHit ? "1" : "0", doc_count: String(docList.length) },
        durationSec
      );
      metrics.rankingRequests.inc({ status: "success" });

      return res.status(200).json({
        count: results.length,
        query,
        cacheHit,
        timeTaken: `${(durationSec * 1000).toFixed(2)}ms`,
        results
      });

    } catch (err) {
      metrics.rankingRequests.inc({ status: "error" });
      logger.error({ err }, "Ranking error");
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new RankController();
