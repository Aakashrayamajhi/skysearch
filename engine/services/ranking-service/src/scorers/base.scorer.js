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

module.exports = BaseRanker;
