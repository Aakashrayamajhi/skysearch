"use strict";

const axios = require("axios");
const logger = require("../utils/logger");
const config = require("../config");

const AI_API_URL = process.env.AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const AI_API_KEY = process.env.AI_API_KEY || config.apiKey || "";
const AI_MODEL = process.env.AI_MODEL || "gemini-2.0-flash";

async function generateSummary(query, results) {
  if (!AI_API_KEY) {
    return null;
  }

  const topResults = Array.isArray(results) ? results.slice(0, 5) : [];
  
  if (topResults.length === 0) {
    return "No results available to summarize.";
  }

  const context = topResults
    .map((r, i) => {
      const title = r.title || r.url || `Result ${i + 1}`;
      const snippet = r.snippet || r.description || "";
      return `${i + 1}. ${title}\n   ${snippet}`;
    })
    .join("\n\n");

  const prompt = `You are a helpful search assistant. Given the following search results for the query "${query}", provide a concise 2-3 sentence summary that answers the user's query based on the ranked content. Do not mention that you are an AI. Do not mention the sources. Just provide the summary.

Search Results:
${context}

Summary:`;

  return callGemini(prompt);
}

async function generateFollowUp(query, results, followUpQuestion) {
  if (!AI_API_KEY) {
    return null;
  }

  const topResults = Array.isArray(results) ? results.slice(0, 5) : [];
  
  if (topResults.length === 0) {
    return "No results available to answer your question.";
  }

  const context = topResults
    .map((r, i) => {
      const title = r.title || r.url || `Result ${i + 1}`;
      const snippet = r.snippet || r.description || "";
      return `${i + 1}. ${title}\n   ${snippet}`;
    })
    .join("\n\n");

  const prompt = `You are a helpful search assistant. The user originally searched for "${query}" and got these results. Now they are asking a follow-up question. Answer their follow-up based on the search results. Do not mention that you are an AI. Do not mention the sources. Just provide the answer.

Search Results:
${context}

Follow-up Question: ${followUpQuestion}

Answer:`;

  return callGemini(prompt);
}

async function callGemini(prompt) {
  try {
    const url = `${AI_API_URL}?key=${AI_API_KEY}`;
    
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const candidates = response.data?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const content = candidates[0]?.content?.parts?.[0]?.text;
      if (content && typeof content === "string") {
        return content.trim();
      }
    }

    return null;
  } catch (error) {
    logger.warn({ error: error.message, status: error.response?.status }, "AI summary generation failed");
    return null;
  }
}

module.exports = {
  generateSummary,
  generateFollowUp
};
