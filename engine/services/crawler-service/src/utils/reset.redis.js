"use strict";

const redis = require("../../configs/redis.config");

async function reset() {
    await redis.del("crawler:queue");
    await redis.del("crawler:visited");

    console.log("Redis reset done");
    process.exit(0);
}

reset();