"use strict";

require("dotenv").config();

const { startConsumer } = require("./consumers/crawl.consumer");
const { initIndex } = require("./clients/elastic.client");

async function bootstrap() {
    await initIndex();
    await startConsumer();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function shutdown() {
    try {
        console.log("shutting down indexer");
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

bootstrap().catch(err => {
    console.error("fatal error", err);
    process.exit(1);
});