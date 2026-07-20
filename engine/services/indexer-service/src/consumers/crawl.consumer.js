"use strict";

const { Kafka } = require("kafkajs");
const pLimit = require("p-limit");
const { process, flush } = require("../services/index.service");

const kafka = new Kafka({
    clientId: "indexer-service",
    brokers: process.env.KAFKA_BROKERS.split(","),
});

const consumer = kafka.consumer({
    groupId: "indexer-group",
    sessionTimeout: 30000,
    heartbeatInterval: 3000
});

const limit = pLimit(10); // concurrency cap

async function startConsumer() {
    await consumer.connect();

    await consumer.subscribe({
        topic: process.env.KAFKA_TOPIC,
        fromBeginning: false
    });

    await consumer.run({
        autoCommit: false,
        eachBatch: async ({
            batch,
            resolveOffset,
            heartbeat,
            commitOffsetsIfNecessary
        }) => {
            const tasks = [];

            for (const message of batch.messages) {
                tasks.push(limit(async () => {
                    try {
                        const payload = JSON.parse(message.value.toString());
                        await process(payload);
                        resolveOffset(message.offset);
                    } catch (err) {
                        // skip poison message but log
                        console.error("processing error", err.message);
                    }
                }));
            }

            await Promise.all(tasks);

            await flush();

            await commitOffsetsIfNecessary();
            await heartbeat();
        }
    });
}

module.exports = { startConsumer };