const Job = require("../models/Job");
const Application = require("../models/Application");

const createJob = async (data, userId) => {
  const job = await Job.create({
    ...data,
    createdBy: userId,
  });

  return job;
};

const getJobs = async () => {
  return await Job.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

const getJobById = async (id) => {
  const job = await Job.findById(id).populate("createdBy", "name email");

  if (!job) {
    throw new Error("Không tìm thấy tin tuyển dụng");
  }

  return job;
};

const getJobsForHR = async (hrId) => {
  return await Job.find({ createdBy: hrId })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

const updateJob = async (jobId, hrId, data) => {
  const job = await Job.findOne({
    _id: jobId,
    createdBy: hrId,
  });

  if (!job) {
    throw new Error("Không tìm thấy Job hoặc bạn không có quyền");
  }

  const editableFields = [
    "title",
    "description",
    "company",
    "location",
    "salaryMin",
    "salaryMax",
    "skills",
    "employmentType",
    "status",
  ];

  for (const field of editableFields) {
    if (Object.hasOwn(data, field)) {
      job[field] = data[field];
    }
  }

  await job.save();

  return job;
};

const deleteJob = async (jobId, hrId) => {
  const job = await Job.findOne({
    _id: jobId,
    createdBy: hrId,
  });

  if (!job) {
    throw new Error("Không tìm thấy Job hoặc bạn không có quyền");
  }

  await Application.deleteMany({ job: jobId });
  await job.deleteOne();

  return job;
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getJobsForHR,
  updateJob,
  deleteJob,
};

/**
 * HR đăng nhập
   ↓
JWT → req.user.userId
   ↓
createJob()
   ↓
createdBy = ID của HR
   ↓
MongoDB
 */
