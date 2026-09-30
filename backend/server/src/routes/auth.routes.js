const express = require("express");
const {
  signup,
  login,
  getCurrentUser,
  verifyCurrentPassword,
  updateCurrentUser,
  withdrawCurrentUser,
  logout,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/verify-password", requireAuth, verifyCurrentPassword);
router.patch("/me", requireAuth, updateCurrentUser);
router.delete("/me", requireAuth, withdrawCurrentUser);
router.post("/logout", logout);

module.exports = router;
