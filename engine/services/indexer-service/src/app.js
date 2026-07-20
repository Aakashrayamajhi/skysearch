"use strict";

const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "..", ".env")
});

const { startConsumer, stopConsumer } = require("./consumers/crawl.consumer");
const { initIndex } = require("./clients/elastic.client");

let shuttingDown = false;

async function shutdown(signal) {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    console.log(`shutting down indexer on ${signal}`);

    try {
        await stopConsumer();
        process.exit(0);
    } catch (err) {
        console.error("shutdown failed", err);
        process.exit(1);
    }
}

async function bootstrap() {
    await initIndex();
    await startConsumer();
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

bootstrap().catch((err) => {
    console.error("fatal error", err);
    process.exit(1);
});