const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

const getDashboardOverview = async () => {
  const [
    totalUsers,
    totalHR,
    totalCandidates,
    totalJobs,
    openJobs,
    totalApplications,
    pendingApplications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "HR" }),
    User.countDocuments({ role: /^CANDIDATE$/i }),
    Job.countDocuments(),
    Job.countDocuments({ status: "OPEN" }),
    Application.countDocuments(),
    Application.countDocuments({ status: "PENDING" }),
  ]);

  return {
    totalUsers,
    totalHR,
    totalCandidates,
    totalJobs,
    openJobs,
    totalApplications,
    pendingApplications,
  };
};

const getAllUsers = async () => {
  return await User.find().sort({ createdAt: -1 }).select("-password");
};

const getAllJobs = async () => {
  return await Job.find()
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
};

const updateUserRole = async (userId, role) => {
  const validRoles = ["ADMIN", "HR", "CANDIDATE"];

  if (!validRoles.includes(String(role).toUpperCase())) {
    throw new Error("Vai trò không hợp lệ");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  user.role = String(role).toUpperCase();
  await user.save();

  return user;
};

const updateJobStatus = async (jobId, status) => {
  const validStatuses = ["OPEN", "CLOSED"];

  if (!validStatuses.includes(String(status).toUpperCase())) {
    throw new Error("Trạng thái job không hợp lệ");
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new Error("Không tìm thấy tin tuyển dụng");
  }

  job.status = String(status).toUpperCase();
  await job.save();

  return job;
};

const deleteJob = async (jobId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new Error("Không tìm thấy tin tuyển dụng");
  }

  await Application.deleteMany({ job: jobId });
  await Job.findByIdAndDelete(jobId);
  return job;
};

module.exports = {
  getDashboardOverview,
  getAllUsers,
  getAllJobs,
  updateUserRole,
  updateJobStatus,
  deleteJob,
};
