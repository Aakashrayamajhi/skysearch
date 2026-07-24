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

async function handleImageSearch(req, res, next) {
  try {
    let existingFilters = {};
    if (req.query.filters && typeof req.query.filters === "string") {
      try {
        existingFilters = JSON.parse(req.query.filters);
      } catch {
        existingFilters = {};
      }
    }
    const imageFilters = { ...existingFilters, contentType: "image" };
    const query = { ...req.query, filters: JSON.stringify(imageFilters) };
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
