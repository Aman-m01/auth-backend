const express = require("express");
const {
  signup,
  login,
  logout,
  sendVerificationCode,
  verifyVerificationCode,
  changePassword,
  sendForgetPasswordCode,
  verifyForgotPasswordCode,
} = require("../controllers/authController");
const { identifier } = require("../middlewares/identification");

const router = express.Router();

router
  .post("/signup", signup)
  .post("/login", login)
  .post("/logout", identifier, logout)
  .patch("/sendVerificationCode", identifier, sendVerificationCode)
  .patch("/verifyVerificationCode", identifier, verifyVerificationCode)
  .patch("/changePassword", identifier, changePassword)
  .patch("/sendForgetPasswordCode", sendForgetPasswordCode)
  .patch("/verifyForgotPasswordCode", verifyForgotPasswordCode);

module.exports = router;
