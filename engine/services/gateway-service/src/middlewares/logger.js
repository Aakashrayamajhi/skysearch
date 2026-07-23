"use strict";

const pinoHttp = require("pino-http");

const logger = pinoHttp({
  level: process.env.LOG_LEVEL || "info"
});

module.exports = logger;
