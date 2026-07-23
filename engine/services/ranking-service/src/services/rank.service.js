const Tokenizer = require("./tokenizer");
const BM25Scorer = require("../scorers/bm25.scorer");
const FreshnessBoost = require("./freshness");
const LinkBoost = require("./linkboost");
const W = require("../config/weights.config");

class BaseRanker {
  constructor(options = {}) {
    if (new.target === BaseRanker) {
      throw new Error("BaseRanker is abstract and cannot be instantiated directly");
    }
  }

  rank(docs, query, context) {
    throw new Error("rank() must be implemented by subclass");
  }
}

class DefaultRanker extends BaseRanker {
  constructor(options = {}) {
    super(options);
    this.tokenizer = options.tokenizer || new Tokenizer();
    this.bm25Scorer = new BM25Scorer(options.bm25);
    this.freshnessBoost = new FreshnessBoost(options.freshness);
    this.linkBoost = new LinkBoost();
    this.weights = {
      title: options.titleWeight || W.title || 3.0,
      content: options.contentWeight || W.content || 1.0
    };
  }

  rank(documents, query, options = {}) {
    const k = options.k || 10;

    if (!query || !Array.isArray(documents) || documents.length === 0) {
      return [];
    }

    const queryTokens = this.tokenizer.tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    const fields = ["title", "body"];
    const fieldTokenData = documents.map((doc) => {
      const titleTokens = doc.titleTokens || this.tokenizer.tokenize(doc.title || "");
      const bodyTokens = doc.tokens || this.tokenizer.tokenize(doc.content || doc.text || "");
      return {
        title: { tokens: titleTokens, len: titleTokens.length },
        body: { tokens: bodyTokens, len: bodyTokens.length }
      };
    });

    const stats = {};
    for (const field of fields) {
      stats[field] = this.bm25Scorer.computeStats(
        documents,
        queryTokens,
        (doc, idx) => fieldTokenData[idx][field].tokens
      );
    }

    const results = [];
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      let combinedBM25 = 0;

      for (const field of fields) {
        const tfMap = stats[field].docTokenMaps[i];
        const dl = fieldTokenData[i][field].len;
        const fieldScore = this.bm25Scorer.scoreDoc(
          tfMap,
          queryTokens,
          stats[field].idfMap,
          dl,
          stats[field].avgLen
        );
        const weightKey = field === "body" ? "content" : field;
        combinedBM25 += fieldScore * this.weights[weightKey];
      }

      const freshnessBoost = this.freshnessBoost.compute(doc.fetchedAt, doc.createdAt);
      const incomingLinks = doc.incomingLinks || (Array.isArray(doc.links) ? doc.links.length : 0);
      const linkBoost = this.linkBoost.compute(incomingLinks);

      const finalScore = combinedBM25 * freshnessBoost * linkBoost;

      let titleScore = 0;
      let bodyScore = 0;
      if (combinedBM25 > 0) {
        titleScore = this.bm25Scorer.scoreDoc(
          stats.title.docTokenMaps[i],
          queryTokens,
          stats.title.idfMap,
          fieldTokenData[i].title.len,
          stats.title.avgLen
        );
        bodyScore = this.bm25Scorer.scoreDoc(
          stats.body.docTokenMaps[i],
          queryTokens,
          stats.body.idfMap,
          fieldTokenData[i].body.len,
          stats.body.avgLen
        );
      }

      results.push({
        _id: doc._id,
        url: doc.url,
        title: doc.title,
        content: doc.content,
        tokens: doc.tokens,
        links: doc.links,
        fetchedAt: doc.fetchedAt,
        createdAt: doc.createdAt,
        score: finalScore,
        breakdown: {
          combinedBM25,
          titleScore: titleScore * this.weights.title,
          bodyScore: bodyScore * this.weights.content,
          freshnessBoost,
          linkBoost
        }
      });
    }

    return results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}

// Backward compatibility: supports old static API
class RankingService extends DefaultRanker {
  static rank(docs, queryOrTokens, k = 10) {
    const instance = new RankingService();
    const query = Array.isArray(queryOrTokens)
      ? queryOrTokens.join(" ")
      : queryOrTokens;
    return instance.rank(docs, query, { k });
  }
}

module.exports = { RankingService, BaseRanker, DefaultRanker };
