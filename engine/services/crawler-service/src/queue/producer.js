"use strict";

const { Kafka, logLevel, Partitioners } = require("kafkajs");
const logger = require("../utils/logger");

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "crawler-service",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    logLevel: logLevel.NOTHING
});

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
    retry: {
        retries: Number(process.env.KAFKA_RETRIES || 5),
        initialRetryTime: Number(process.env.KAFKA_INITIAL_RETRY_TIME || 300)
    }
});

let connected = false;

/**
 * Initialize Kafka producer
 */
async function init() {
    if (connected) return;

    try {
        await producer.connect();
        connected = true;

        logger.info("Kafka producer connected");

    } catch (err) {
        logger.error("Kafka connection failed", {
            error: err.message
        });
        throw err;
    }
}

/**
 * Send message to Kafka
 */
async function send(payload) {
    try {
        await init();

        const message = {
            value: JSON.stringify(payload)
        };

        await producer.send({
            topic: process.env.KAFKA_TOPIC || "crawl-data",
            messages: [message],
            acks: -1,
            timeout: Number(process.env.KAFKA_SEND_TIMEOUT_MS || 30000)
        });

        logger.info("Kafka message sent", {
            url: payload.url,
            size: message.value.length
        });

        return true;

    } catch (err) {
        logger.error("Kafka send failed", {
            error: err.message,
            payloadUrl: payload?.url
        });

        return false;
    }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
    if (!connected) return;

    try {
        await producer.disconnect();
        connected = false;

        logger.info("Kafka producer disconnected");

    } catch (err) {
        logger.error("Kafka disconnect failed", {
            error: err.message
        });
    }
}

/**
 * Handle process exit
 */
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = { send, shutdown };