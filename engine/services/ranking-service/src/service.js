const FeaturePipeline = require("./pipeline/feature.pipeline");
const NormalizePipeline = require("./pipeline/normalize.pipeline");
const LinearScorer = require("./scorers/linear.scorer");
const MinHeap = require("./rankers/heap.ranker");

class RankingService {
  static rank(docs, queryTokens, k = 10) {
    // 1. feature extraction
    const features = FeaturePipeline.extractBatch(docs, queryTokens);

    // 2. normalization
    const normalized = NormalizePipeline.minMax(features);

    // 3. scoring
    const scores = LinearScorer.scoreBatch(normalized);

    // 4. top-k selection
    const heap = new MinHeap(k);

    for (let i = 0; i < docs.length; i++) {
      heap.push({
        doc: docs[i],
        score: scores[i]
      });
    }

    return heap.getSorted();
  }
}

module.exports = RankingService;