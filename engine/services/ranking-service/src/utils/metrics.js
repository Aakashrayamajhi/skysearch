const client = require("prom-client");

const rankingDuration = new client.Histogram({
  name: "ranking_duration_seconds",
  help: "Duration of ranking operations in seconds",
  labelNames: ["cache_hit", "doc_count"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const rankingRequests = new client.Counter({
  name: "ranking_requests_total",
  help: "Total number of ranking requests",
  labelNames: ["status"]
});

module.exports = {
  rankingDuration,
  rankingRequests,
  register: client.register
};
