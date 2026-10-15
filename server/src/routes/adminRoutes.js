const express = require("express");
const adminController = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(protect, authorize("ADMIN"));

router.get("/overview", adminController.getDashboardOverview);
router.get("/users", adminController.getAllUsers);
router.get("/jobs", adminController.getAllJobs);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/jobs/:id/status", adminController.updateJobStatus);
router.delete("/jobs/:id", adminController.deleteJob);

module.exports = router;
