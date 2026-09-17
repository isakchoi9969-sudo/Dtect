const express = require("express");
const { searchCompany } = require("../controllers/company.controller");

const router = express.Router();

router.get("/search", searchCompany);

module.exports = router;
