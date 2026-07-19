"use strict";

const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "crawler-service",
    brokers: ["localhost:9092"]
});

const producer = kafka.producer();
let connected = false;

async function init() {
    if (!connected) {
        await producer.connect();
        connected = true;
    }
}

async function send(payload) {
    await init();

    await producer.send({
        topic: "crawl-data",
        messages: [{ value: JSON.stringify(payload) }]
    });
}

module.exports = { send };