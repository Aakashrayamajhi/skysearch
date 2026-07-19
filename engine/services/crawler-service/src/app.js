"use strict";

const { startCrawler } = require("./workers/crawler.worker");
const urlService = require("./services/url.service");

async function bootstrap() {
    await urlService.enqueueUrl("https://example.com");
    await startCrawler();
}

bootstrap();