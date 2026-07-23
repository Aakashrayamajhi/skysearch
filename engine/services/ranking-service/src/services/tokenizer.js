const STOPWORDS = new Set([
  "a","an","the","is","in","on","at","to","for","of","with","and","or","but","by",
  "not","no","yes","this","that","these","those","it","its","was","were","be","been",
  "being","have","has","had","do","does","did","will","would","could","should","may",
  "might","shall","can","need","dare","ought","used","who","whom","which","when",
  "where","why","how","all","each","every","both","few","more","most","other","some",
  "such","than","too","very","just","because","as","until","while","about","between",
  "through","during","before","after","above","below","from","up","down","out","off",
  "over","under","again","further","then","once","here","there","any","only","own",
  "same","so","also","if","into","he","she","they","them","his","her","their","my",
  "your","our","we","us","me","i","am","are"
]);

class Tokenizer {
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1 && !STOPWORDS.has(token));
  }
}

module.exports = Tokenizer;
