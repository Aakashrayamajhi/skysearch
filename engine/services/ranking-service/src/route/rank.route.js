const express = require("express");
const controller = require("../controllers/rank.controller");

const router = express.Router();

router.post("/", controller.rankDocuments);

module.exports = router;