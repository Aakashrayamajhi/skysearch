"use strict";

const { generateSummary, generateFollowUp: generateFollowUpFromService } = require("../services/ai.service");

async function generateAISummary(req, res, next) {
  try {
    const { query, results } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const summary = await generateSummary(query, results);

    res.status(200).json({
      summary: summary || "Unable to generate summary at this time."
    });
  } catch (error) {
    logger.error({ err: error }, "AI summary endpoint error");
    res.status(500).json({ error: "Failed to generate summary" });
  }
}

async function generateFollowUp(req, res, next) {
  try {
    const { query, results, question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }

    const answer = await generateFollowUpFromService(query, results, question);

    res.status(200).json({
      answer: answer || "Unable to generate an answer at this time."
    });
  } catch (error) {
    logger.error({ err: error }, "AI follow-up endpoint error");
    res.status(500).json({ error: "Failed to generate follow-up answer" });
  }
}

module.exports = { generateAISummary, generateFollowUp };
