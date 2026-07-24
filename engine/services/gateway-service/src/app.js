"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");

const config = require("./config");
const requestId = require("./middlewares/requestId");
const loggerMiddleware = require("./middlewares/logger");
const apiKeyAuth = require("./middlewares/apiKeyAuth");
const rateLimiter = require("./middlewares/rateLimiter");
const validateSearch = require("./middlewares/validateSearch");
const { handleSearch, handleImageSearch } = require("./controllers/searchController");
const { generateAISummary, generateFollowUp } = require("./controllers/aiController");
const logger = require("./utils/logger");

const app = express();

const corsOrigin = config.corsOrigin === '*' 
  ? '*' 
  : [config.corsOrigin, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(requestId);
app.use(loggerMiddleware);
app.use(apiKeyAuth);
app.use(rateLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/search", validateSearch, handleSearch);
app.get("/search/images", validateSearch, handleImageSearch);

app.post("/ai/summary", generateAISummary);
app.post("/ai/followup", generateFollowUp);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found", requestId: req.id });
});

app.use((err, req, res, next) => {
  const requestId = req.id || "unknown";
  logger.error({ err, requestId }, "Unhandled error");

  const isProd = config.nodeEnv === "production";
  const status = err.statusCode || (isProd ? 500 : err.status || 500);
  const message = isProd
    ? "Internal server error"
    : err.message || "Internal server error";

  res.status(status).json({ error: message, requestId });
});

async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Shutting down gateway service.`);
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

app.listen(config.port, () => {
  console.log(`Gateway running on port ${config.port}`);
});

module.exports = app;
