class BM25Scorer {
  constructor(options = {}) {
    this.k1 = options.k1 || 1.5;
    this.b = options.b || 0.75;
  }

  computeStats(docs, queryTokens, getFieldTokens) {
    const N = docs.length;
    const dfMap = {};
    let totalLen = 0;
    const docTokenMaps = [];

    for (let i = 0; i < docs.length; i++) {
      const tokens = getFieldTokens(docs[i], i);
      totalLen += tokens.length;
      const uniqueTokens = new Set(tokens);

      const tfMap = {};
      for (const qt of queryTokens) {
        tfMap[qt] = 0;
      }
      for (const t of tokens) {
        if (tfMap[t] !== undefined) {
          tfMap[t]++;
        }
      }
      docTokenMaps.push(tfMap);

      for (const t of uniqueTokens) {
        dfMap[t] = (dfMap[t] || 0) + 1;
      }
    }

    const avgLen = N > 0 ? totalLen / N : 1;

    const idfMap = {};
    for (const token in dfMap) {
      const df = dfMap[token];
      idfMap[token] = Math.log((N - df + 0.5) / (df + 0.5) + 1);
    }

    return { idfMap, avgLen, N, docTokenMaps };
  }

  scoreDoc(tfMap, queryTokens, idfMap, dl, avgLen) {
    let score = 0;
    const safeAvgLen = avgLen || 1;
    const safeDl = dl || 1;

    for (const qt of queryTokens) {
      const tf = tfMap[qt] || 0;
      const idf = idfMap[qt];
      if (tf === 0 || !idf) continue;

      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (safeDl / safeAvgLen));
      score += idf * (numerator / denominator);
    }

    return score;
  }
}

module.exports = BM25Scorer;
