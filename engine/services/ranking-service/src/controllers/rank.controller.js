const RankingService = require("../services/rank.service.js");

exports.rankDocuments = (req, res, next) => {
  try {
    const { docs, query, k = 10 } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Invalid query" });
    }

    if (!Array.isArray(docs)) {
      return res.status(400).json({ error: "Docs must be array" });
    }

    const tokens = query
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);

    const results = RankingService.rank(docs, tokens, k);

    res.status(200).json({
      count: results.length,
      results
    });

  } catch (err) {
    next(err);
  }
};