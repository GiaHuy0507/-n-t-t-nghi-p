const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", protect, authController.getMe);

router.get(
  "/admin-test",
  protect,
  authorize("ADMIN"),
  authController.adminTest,
);

module.exports = router;
