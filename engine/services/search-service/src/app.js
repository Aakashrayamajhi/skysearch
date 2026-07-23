"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const pinoHttp = require("pino-http");
const { randomUUID } = require("crypto");

const rateLimiter = require("./middlewares/rateLimiter");
const apiKeyAuth = require("./middlewares/apiKeyAuth");
const logger = require("./utils/logger");
const SearchController = require("./controllers/search.controller");
const searchController = SearchController.default || SearchController;
const { shutdown: shutdownAnalytics } = require("./services/analytics.service");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET"],
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "1kb" }));
app.use(express.urlencoded({ extended: true, limit: "1kb" }));
app.use(pinoHttp({ level: process.env.LOG_LEVEL || "info" }));

app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

app.use(apiKeyAuth);
app.use(rateLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/search", searchController.handleSearch);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  const requestId = req.id || "unknown";
  logger.error({ err, requestId }, "Unhandled error");
  const isProd = process.env.NODE_ENV === "production";
  const status = err.statusCode || (isProd ? 500 : err.status || 500);
  const message = isProd
    ? "Internal server error"
    : err.message || "Internal server error";
  res.status(status).json({ error: message, requestId });
});

async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Shutting down search service.`);
  await shutdownAnalytics();
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Search service running on port ${PORT}`);
});

module.exports = app;
