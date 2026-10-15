const express = require("express");

const { uploadCV } = require("../controllers/cvController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/upload",
  protect,
  authorize("CANDIDATE"),
  upload.single("cv"),
  uploadCV,
);

module.exports = router;
