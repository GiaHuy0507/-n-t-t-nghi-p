const jobService = require("../services/jobService");
const CV = require("../models/CV");
const Job = require("../models/Job");
const {
  matchCVToJob,
  suggestCVImprovement,
  generateJobDescription,
} = require("../services/aiService");

const createJob = async (req, res) => {
  try {
    const job = await jobService.createJob(req.body, req.user.userId);

    return res.status(201).json({
      message: "Tạo tin tuyển dụng thành công",
      data: job,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await jobService.getJobs();

    return res.status(200).json({
      message: "Lấy danh sách việc làm thành công",
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await jobService.getJobById(req.params.id);

    return res.status(200).json({
      message: "Lấy thông tin việc làm thành công",
      data: job,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

const getJobsForHR = async (req, res) => {
  try {
    const jobs = await jobService.getJobsForHR(req.user.userId);

    return res.status(200).json({
      message: "Lấy danh sách Job của HR thành công",
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await jobService.updateJob(
      req.params.id,
      req.user.userId,
      req.body,
    );

    return res.status(200).json({
      message: "Cập nhật tin tuyển dụng thành công",
      data: job,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    await jobService.deleteJob(req.params.id, req.user.userId);

    return res.status(200).json({
      message: "Xóa tin tuyển dụng thành công",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const matchCandidateToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();

    if (!job) {
      return res.status(404).json({
        message: "Không tìm thấy tin tuyển dụng",
      });
    }

    // Lấy CV mới nhất đã phân tích xong; bỏ qua CV mới tải nhưng AI lỗi
    const latestCv = await CV.findOne({
      candidate: req.user.userId,
      aiStatus: "COMPLETED",
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!latestCv || !latestCv.aiAnalysis) {
      return res.status(404).json({
        message: "Bạn chưa có CV nào được phân tích",
      });
    }

    const result = matchCVToJob(latestCv.aiAnalysis, job);
    const suggestions = suggestCVImprovement(latestCv.aiAnalysis, job);

    return res.status(200).json({
      message: "AI đã đánh giá độ phù hợp CV với công việc",
      data: {
        jobId: job._id,
        score: result.score,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        breakdown: result.breakdown,
        summary: result.summary,
        suggestions,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đánh giá phù hợp CV:", error);
    return res.status(500).json({
      message: "Không thể đánh giá độ phù hợp CV với công việc",
    });
  }
};

const generateJobBrief = async (req, res) => {
  try {
    const payload = req.body || {};
    const generated = generateJobDescription(payload);

    return res.status(200).json({
      message: "AI đã tạo mô tả job thành công",
      data: generated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể tạo mô tả công việc bằng AI",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getJobsForHR,
  updateJob,
  deleteJob,
  matchCandidateToJob,
  generateJobBrief,
};
