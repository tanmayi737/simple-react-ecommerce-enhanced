import { Product } from "../models/Product";

/**
 * Stop words that can be ignored in long natural language queries
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "for", "with", "of", "and", "or",
  "to", "is", "are", "was", "were", "it", "its", "by", "from", "be",
  "this", "that", "these", "those", "i", "you", "he", "she", "we", "they",
  "want", "need", "looking", "look", "search", "find", "give", "me", "show"
]);

/**
 * Tokenizes a query string into meaningful lowercase words
 */
export const tokenizeQuery = (query: string): string[] => {
  if (!query || !query.trim()) return [];

  const rawTokens = query
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ") // replace punctuation except hyphens
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  // If all tokens are stop words or query is short (1-2 tokens), keep them
  if (rawTokens.length <= 2) {
    return rawTokens;
  }

  const filtered = rawTokens.filter((t) => !STOP_WORDS.has(t));
  return filtered.length > 0 ? filtered : rawTokens;
};

/**
 * Checks if a target string contains a token or its simple stem
 */
const matchesToken = (target: string, token: string): { matched: boolean; exact: boolean } => {
  if (!target) return { matched: false, exact: false };
  const lowerTarget = target.toLowerCase();

  // Exact word boundary match
  const regex = new RegExp(`\\b${token}\\b`, "i");
  if (regex.test(lowerTarget)) {
    return { matched: true, exact: true };
  }

  // Substring match
  if (lowerTarget.includes(token)) {
    return { matched: true, exact: false };
  }

  // Basic plural / stem check (e.g. "headphones" <-> "headphone", "running" <-> "run")
  if (token.endsWith("s") && token.length > 3) {
    const singular = token.slice(0, -1);
    if (lowerTarget.includes(singular)) {
      return { matched: true, exact: false };
    }
  }

  if (token.endsWith("ing") && token.length > 4) {
    const base = token.slice(0, -3);
    if (lowerTarget.includes(base)) {
      return { matched: true, exact: false };
    }
  }

  return { matched: false, exact: false };
};

export interface ScoredProduct {
  product: Product;
  score: number;
  matchedTokens: string[];
}

/**
 * Performs natural language matching of a query against products.
 * Evaluates titles, descriptions, tags, brand, and category with weighted scoring.
 */
export const searchProductsNatural = (
  products: Product[],
  query: string
): Product[] => {
  if (!query || !query.trim() || products.length === 0) {
    return products;
  }

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return products;

  const rawQueryLower = query.toLowerCase().trim();
  const scoredList: ScoredProduct[] = [];

  for (const product of products) {
    let score = 0;
    const matchedTokensSet = new Set<string>();

    const title = product.title || "";
    const description = product.description || "";
    const tags = product.tags || [];
    const category = product.category || "";
    const brand = product.brand || "";

    // 1. Direct exact phrase match bonus
    if (title.toLowerCase().includes(rawQueryLower)) {
      score += 40;
    }
    if (description.toLowerCase().includes(rawQueryLower)) {
      score += 20;
    }

    // 2. Tokenized evaluation
    for (const token of tokens) {
      let tokenMatched = false;

      // Check title (weight: 12 for exact word, 8 for partial)
      const titleMatch = matchesToken(title, token);
      if (titleMatch.matched) {
        score += titleMatch.exact ? 12 : 8;
        tokenMatched = true;
      }

      // Check tags (weight: 10 for exact, 6 for partial)
      for (const tag of tags) {
        const tagMatch = matchesToken(tag, token);
        if (tagMatch.matched) {
          score += tagMatch.exact ? 10 : 6;
          tokenMatched = true;
        }
      }

      // Check category & brand (weight: 8 for exact, 5 for partial)
      const catMatch = matchesToken(category, token);
      if (catMatch.matched) {
        score += catMatch.exact ? 8 : 5;
        tokenMatched = true;
      }
      const brandMatch = matchesToken(brand, token);
      if (brandMatch.matched) {
        score += brandMatch.exact ? 8 : 5;
        tokenMatched = true;
      }

      // Check description (weight: 5 for exact, 3 for partial)
      const descMatch = matchesToken(description, token);
      if (descMatch.matched) {
        score += descMatch.exact ? 5 : 3;
        tokenMatched = true;
      }

      if (tokenMatched) {
        matchedTokensSet.add(token);
      }
    }

    // 3. Multi-token coverage multiplier
    const matchedCount = matchedTokensSet.size;
    if (matchedCount > 0) {
      const coverageRatio = matchedCount / tokens.length;
      // High bonus if all or most tokens matched
      if (coverageRatio === 1) {
        score += 35; // 100% tokens matched!
      } else if (coverageRatio >= 0.75) {
        score += 20;
      } else if (coverageRatio >= 0.5) {
        score += 10;
      }

      scoredList.push({
        product,
        score,
        matchedTokens: Array.from(matchedTokensSet),
      });
    }
  }

  // Sort descending by relevance score
  scoredList.sort((a, b) => b.score - a.score);

  return scoredList.map((item) => item.product);
};
