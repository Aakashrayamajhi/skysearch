"use strict";

const { Kafka, logLevel } = require("kafkajs");
const logger = require("../utils/logger");

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "search-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  logLevel: logLevel.NOTHING
});

const producer = kafka.producer({
  createPartitioner: () => 0,
  retry: {
    retries: Number(process.env.KAFKA_RETRIES || 3),
    initialRetryTime: Number(process.env.KAFKA_INITIAL_RETRY_TIME || 300)
  }
});

let connected = false;

async function init() {
  if (connected) return;
  try {
    await producer.connect();
    connected = true;
    logger.info("Kafka analytics producer connected");
  } catch (err) {
    logger.error("Kafka connection failed", { error: err.message });
  }
}

async function trackSearch({ query, timestamp, page, size, total, cacheHit = false }) {
  try {
    await init();
    await producer.send({
      topic: process.env.KAFKA_ANALYTICS_TOPIC || "search-analytics",
      messages: [{
        value: JSON.stringify({
          query,
          timestamp,
          page,
          size,
          total,
          cacheHit,
          service: "search-service"
        })
      }],
      acks: -1,
      timeout: Number(process.env.KAFKA_SEND_TIMEOUT_MS || 5000)
    });
  } catch (err) {
    logger.warn("Kafka analytics send failed", { error: err.message });
  }
}

async function shutdown() {
  if (!connected) return;
  try {
    await producer.disconnect();
    connected = false;
    logger.info("Kafka analytics producer disconnected");
  } catch (err) {
    logger.error("Kafka disconnect failed", { error: err.message });
  }
}

module.exports = { trackSearch, shutdown };
