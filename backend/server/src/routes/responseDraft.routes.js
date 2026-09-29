const express = require("express");
const {
  createResponseDraft,
  getResponseDraftHistory,
  deleteResponseDraft,
} = require("../controllers/responseDraft.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// 대응자료 생성과 이력 조회는 로그인한 사용자만 가능합니다.
router.use(requireAuth);

// 초안 생성 + DB 이력 저장
router.post("/", createResponseDraft);

// 마이페이지 최근 생성 이력 조회
router.get("/history", getResponseDraftHistory);

// 저장한 대응자료 이력 삭제
router.delete("/:draftId", deleteResponseDraft);

module.exports = router;
