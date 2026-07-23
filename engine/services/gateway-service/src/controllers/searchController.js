"use strict";

const { performSearch } = require("../services/search.service");

async function handleSearch(req, res, next) {
  try {
    const query = { ...req.query };
    const response = await performSearch(query, req.id);

    res.setHeader("X-Request-ID", req.id);

    const forwardHeaders = ["content-type", "cache-control"];
    for (const header of forwardHeaders) {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    }

    res.status(response.status).send(response.data);
  } catch (error) {
    next(error);
  }
}

module.exports = { handleSearch };
