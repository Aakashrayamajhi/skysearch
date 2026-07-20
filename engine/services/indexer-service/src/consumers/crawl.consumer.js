"use strict";

const { Kafka } = require("kafkajs");
const pLimitModule = require("p-limit");
const pLimit = pLimitModule.default || pLimitModule;
const { process: indexProcess, flush } = require("../services/index.service");

const env = globalThis.process?.env || {};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const kafka = new Kafka({
    clientId: env.KAFKA_CLIENT_ID || "indexer-service",
    brokers: (env.KAFKA_BROKERS || "localhost:9092").split(",")
});

const consumer = kafka.consumer({
    groupId: env.KAFKA_CONSUMER_GROUP || "indexer-group",
    sessionTimeout: Number(env.KAFKA_SESSION_TIMEOUT_MS || 30000),
    heartbeatInterval: Number(env.KAFKA_HEARTBEAT_INTERVAL_MS || 3000)
});

const limit = pLimit(Number(env.INDEXER_CONCURRENCY || 10));
let isConnected = false;

async function handleMessage({ topic, partition, message }) {
    const payload = JSON.parse(message.value.toString());
    console.log("consumer received message", {
        topic,
        partition,
        offset: message.offset,
        url: payload?.url
    });

    await indexProcess(payload);

    await consumer.commitOffsets([
        {
            topic,
            partition,
            offset: String(Number(message.offset) + 1)
        }
    ]);
}

async function startConsumer() {
    if (isConnected) {
        return;
    }

    while (!isConnected) {
        try {
            await consumer.connect();
            const topic = env.KAFKA_TOPIC || "crawl-data";
            await consumer.subscribe({
                topic,
                fromBeginning: false
            });

            console.log("indexer consumer subscribed", { topic });

            await consumer.run({
                autoCommit: false,
                eachMessage: async ({ topic, partition, message }) => {
                    await limit(async () => {
                        try {
                            await handleMessage({ topic, partition, message });
                        } catch (err) {
                            console.error("processing error", {
                                message: err.message,
                                topic,
                                offset: message.offset
                            });
                        }
                    });
                },
                eachBatchAutoResolve: false
            });

            isConnected = true;
        } catch (error) {
            console.warn("Kafka consumer could not start yet. Retrying in the background.", {
                message: error.message
            });
            await sleep(Number(env.KAFKA_RECONNECT_DELAY_MS || 3000));
        }
    }
}

async function stopConsumer() {
    if (!isConnected) {
        return;
    }

    await flush();
    await consumer.stop();
    await consumer.disconnect();
    isConnected = false;
}

module.exports = { startConsumer, stopConsumer };