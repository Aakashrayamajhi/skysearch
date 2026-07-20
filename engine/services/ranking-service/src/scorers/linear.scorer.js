const W = require("../config/weights");

class LinearScorer {
  static scoreBatch(featuresList) {
    const scores = new Float64Array(featuresList.length);

    for (let i = 0; i < featuresList.length; i++) {
      const f = featuresList[i];

      scores[i] =
        f.tf * W.text +
        f.pageRank * W.pagerank +
        f.titleMatch * W.title +
        f.freshness * W.freshness;
    }

    return scores;
  }
}

module.exports = LinearScorer;