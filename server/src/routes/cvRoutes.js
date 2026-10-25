const express = require("express");

const { getRecommendedJobs, uploadCV } = require("../controllers/cvController");
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

router.get(
  "/:id/recommendations",
  protect,
  authorize("CANDIDATE"),
  getRecommendedJobs,
);

module.exports = router;
