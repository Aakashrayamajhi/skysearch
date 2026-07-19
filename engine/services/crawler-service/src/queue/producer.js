"use strict";

const { Kafka, logLevel, Partitioners } = require("kafkajs");
const logger = require("../utils/logger");

const kafka = new Kafka({
    clientId: "crawler-service",
    brokers: ["localhost:9092"],
    logLevel: logLevel.NOTHING
});

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
    retry: {
        retries: 5,
        initialRetryTime: 300
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
            topic: "crawl-data",
            messages: [message],
            acks: -1, // strongest durability
            timeout: 30000
        });

        logger.info("Kafka message sent", {
            url: payload.url,
            size: message.value.length
        });

    } catch (err) {
        logger.error("Kafka send failed", {
            error: err.message,
            payloadUrl: payload?.url
        });
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

module.exports = { send };