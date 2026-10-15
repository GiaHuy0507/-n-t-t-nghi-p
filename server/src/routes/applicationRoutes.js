const express = require("express");
const applicationController = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const uploadCV = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("CANDIDATE"),
  uploadCV.single("cv"),
  applicationController.createApplication,
);

router.get(
  "/hr",
  protect,
  authorize("HR"),
  applicationController.getApplicationsForHR,
);

router.get(
  "/hr/shortlist/:jobId",
  protect,
  authorize("HR"),
  applicationController.getAIShortlistForHR,
);

router.post(
  "/hr/:id/retry-ai-analysis",
  protect,
  authorize("HR"),
  applicationController.retryAIAnalysisForHR,
);

router.get(
  "/:id/cv",
  protect,
  authorize("HR"),
  applicationController.getCVForHR,
);

router.patch(
  "/:id/status",
  protect,
  authorize("HR"),
  applicationController.updateApplicationStatus,
);

router.patch(
  "/:id/review-note",
  protect,
  authorize("HR"),
  applicationController.updateApplicationReviewNote,
);

router.get(
  "/my",
  protect,
  authorize("CANDIDATE"),
  applicationController.getApplicationsForCandidate,
);

module.exports = router;
