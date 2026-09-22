const express = require("express");
const { getSimilarCases } = require("../controllers/simulator.controller");

const router = express.Router();

router.post("/cases", getSimilarCases);

module.exports = router;
