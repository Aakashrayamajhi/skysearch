"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const pinoHttp = require("pino-http");

const logger = require("./utils/logger");
const searchController = require("./controllers/search.controller");
const { shutdown: shutdownAnalytics } = require("./services/analytics.service");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", methods: ["GET"] }));
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(pinoHttp({ level: process.env.LOG_LEVEL || "info" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/search", searchController.handleSearch);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  logger.error({ err }, "Unhandled error");
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
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
