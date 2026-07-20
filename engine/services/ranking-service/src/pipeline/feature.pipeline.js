
class FeaturePipeline {
  static extractBatch(docs, queryTokens) {
    const qSet = new Set(queryTokens);

    return docs.map(doc => {
      let tf = 0;
      let titleMatch = 0;

      // O(n) token scan
      for (const token of doc.tokens) {
        if (qSet.has(token)) tf++;
      }

      for (const token of doc.titleTokens) {
        if (qSet.has(token)) titleMatch++;
      }

      return {
        tf,
        titleMatch,
        pageRank: doc.pageRank || 0,
        freshness: this._freshness(doc.ts)
      };
    });
  }

  static _freshness(ts) {
    if (!ts) return 0;
    const age = (Date.now() - ts) / 86400000;
    return 1 / (1 + age);
  }
}

module.exports = FeaturePipeline;