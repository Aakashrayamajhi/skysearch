class RankingService {
  static rank(docs, tokens, k = 10) {
    const scores = [];

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i].toLowerCase();

      let score = 0;

      for (const token of tokens) {
        const regex = new RegExp(`\\b${token}\\b`, "g");
        const matches = doc.match(regex);
        if (matches) {
          score += matches.length;
        }
      }

      if (score > 0) {
        scores.push({
          docId: i,
          score,
          text: docs[i]
        });
      }
    }

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}

module.exports = RankingService;