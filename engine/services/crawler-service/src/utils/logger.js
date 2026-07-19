"use strict";

function log(level, message, meta = {}) {
    const entry = {
        level,
        message,
        ...meta,
        timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(entry));
}

module.exports = {
    debug: (msg, meta) => log("debug", msg, meta),
    info: (msg, meta) => log("info", msg, meta),
    warn: (msg, meta) => log("warn", msg, meta),
    error: (msg, meta) => log("error", msg, meta),
    fatal: (msg, meta) => log("fatal", msg, meta)
};