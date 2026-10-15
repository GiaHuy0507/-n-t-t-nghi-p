const express = require("express");

const jobController = require("../controllers/jobController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorize("HR"), jobController.createJob);

router.get("/", jobController.getJobs);
router.post(
  "/ai/generate",
  protect,
  authorize("HR"),
  jobController.generateJobBrief,
);

router.get(
  "/:id/match",
  protect,
  authorize("CANDIDATE"),
  jobController.matchCandidateToJob,
);

router.get("/hr/my-jobs", protect, authorize("HR"), jobController.getJobsForHR);

router.patch("/:id", protect, authorize("HR"), jobController.updateJob);

router.delete("/:id", protect, authorize("HR"), jobController.deleteJob);

router.get("/:id", jobController.getJobById);

module.exports = router;
/**
 *POST /api/jobs
       ↓
protect
       ↓
đã đăng nhập?
       ↓
authorize("HR")
       ↓
có phải HR?
       ↓
createJob

-- Candidate gọi API này → 403.

-- Admin cũng sẽ bị 403 vì hiện tại chỉ cho HR tạo job.
 */
