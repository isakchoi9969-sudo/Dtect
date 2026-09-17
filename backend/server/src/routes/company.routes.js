const express = require("express");
const {
  getCompanies,
  searchCompany,
} = require("../controllers/company.controller");

const router = express.Router();

router.get("/", getCompanies);
router.get("/search", searchCompany);

module.exports = router;
