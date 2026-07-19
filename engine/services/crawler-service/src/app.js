"use strict";

const { startCrawler } = require("./workers/crawler.worker");
const { seedUrls } = require("./services/seed.service");
const logger = require("./utils/logger");

async function bootstrap() {
    try {
        logger.info("Bootstrapping crawler...");

        const added = await seedUrls();

        logger.info("Seeding completed", { added });

        await startCrawler();

    } catch (err) {
        logger.error("Fatal error in bootstrap", {
            error: err.message
        });
        process.exit(1);
    }
}

bootstrap();