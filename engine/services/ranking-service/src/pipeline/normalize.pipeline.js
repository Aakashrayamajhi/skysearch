class NormalizePipeline {
  static minMax(featuresList) {
    const keys = Object.keys(featuresList[0]);

    const min = {}, max = {};

    keys.forEach(k => {
      min[k] = Infinity;
      max[k] = -Infinity;
    });

    for (const f of featuresList) {
      for (const k of keys) {
        if (f[k] < min[k]) min[k] = f[k];
        if (f[k] > max[k]) max[k] = f[k];
      }
    }

    return featuresList.map(f => {
      const out = {};
      for (const k of keys) {
        const range = max[k] - min[k] || 1;
        out[k] = (f[k] - min[k]) / range;
      }
      return out;
    });
  }
}

module.exports = NormalizePipeline;