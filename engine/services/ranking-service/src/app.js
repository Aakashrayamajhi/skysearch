
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const pinoHttp = require("pino-http");

const rankRoutes = require("./route/rank.route.js");
const errorHandler = require("./middlewares/error.middleware.js");

const app = express();

// Core middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["POST", "GET"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(compression());

// Logger 
app.use(pinoHttp({
  level: process.env.LOG_LEVEL || "info"
}));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/v1/rank", rankRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// Central error handler 
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Graceful startup
app.listen(PORT, () => {
  console.log(`Ranking service running on port ${PORT}`);
});