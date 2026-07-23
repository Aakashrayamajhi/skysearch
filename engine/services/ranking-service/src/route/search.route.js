const express = require("express");
const controller = require("../controllers/search.controller");

const router = express.Router();

router.get("/", (req, res, next) => controller.search(req, res, next));

module.exports = router;
