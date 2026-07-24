"use strict";

const { performSearch } = require("../services/search.service");

async function handleSearch(req, res, next) {
  try {
    const query = { ...req.query };

    if (query.type && !query.filters) {
      const filters = { contentType: query.type };
      delete query.type;
      query.filters = JSON.stringify(filters);
    }

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

async function handleImageSearch(req, res, next) {
  try {
    const query = { ...req.query };

    if (query.type && !query.filters) {
      const filters = { contentType: query.type };
      delete query.type;
      query.filters = JSON.stringify(filters);
    }

    let imageFilters = {};
    if (query.filters && typeof query.filters === "string") {
      try {
        imageFilters = JSON.parse(query.filters);
      } catch {
        imageFilters = {};
      }
    }
    imageFilters.contentType = "image";
    query.filters = JSON.stringify(imageFilters);

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

module.exports = { handleSearch, handleImageSearch };
