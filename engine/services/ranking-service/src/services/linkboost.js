class LinkBoost {
  compute(incomingLinksCount) {
    const count = parseInt(incomingLinksCount || 0, 10);
    return 1 + Math.log(Math.max(1, count));
  }
}

module.exports = LinkBoost;
