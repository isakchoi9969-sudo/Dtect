// 대응자료 생성 API 주소를 등록하는 라우터입니다.

const express = require("express");
const {
  createResponseDraft,
} = require("../controllers/responseDraft.controller");

const router = express.Router();

// POST /api/response-drafts
router.post("/", createResponseDraft);

module.exports = router;
