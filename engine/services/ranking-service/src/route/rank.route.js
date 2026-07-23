const express = require("express");
const controller = require("../controllers/rank.controller");

const router = express.Router();

router.post("/", (req, res, next) => controller.rankDocuments(req, res, next));

module.exports = router;