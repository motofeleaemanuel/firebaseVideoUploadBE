const express = require("express");
const {
  register,
  login,
  checkForAuthorization,
} = require("../controllers/authController");
const {
  yupValidateMiddleware,
} = require("../middlewares/yupValidationMiddleware.js");
const { linkSchema } = require("../utils/yupSchema.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post("/register", yupValidateMiddleware(linkSchema), register);
router.post("/login", login);
router.get("/check", authMiddleware, checkForAuthorization);

module.exports = router;
