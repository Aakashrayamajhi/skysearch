class FreshnessBoost {
  constructor(options = {}) {
    this.decayFactor = options.decayFactor || 0.005;
  }

  compute(fetchedAt, createdAt) {
    const timestamp = createdAt
      ? new Date(createdAt).getTime()
      : fetchedAt
      ? new Date(fetchedAt).getTime()
      : 0;

    if (!timestamp) return 1;

    const now = Date.now();
    const ageMs = now - timestamp;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    return Math.exp(-this.decayFactor * ageDays);
  }
}

module.exports = FreshnessBoost;
