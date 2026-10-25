const CV = require("../models/CV");
const Job = require("../models/Job");
const { matchCVToJob } = require("../services/aiService");
const {
  analyzeAndStoreCV,
  saveUploadedCV,
} = require("../services/cvFileService");

const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Vui lòng chọn file CV",
      });
    }

    const { cv, isDuplicate } = await saveUploadedCV({
      candidate: req.user.userId,
      file: req.file,
    });

    if (isDuplicate && cv.aiStatus === "COMPLETED" && cv.aiAnalysis) {
      return res.status(200).json({
        message: "CV này đã được tải lên và phân tích trước đó",
        cv,
        duplicate: true,
      });
    }

    try {
      await analyzeAndStoreCV(cv);
    } catch (error) {
      console.error("Không thể phân tích CV:", error);
      cv.aiAnalysis = undefined;
      cv.aiStatus = "FAILED";
    }

    await cv.save();

    res.status(201).json({
      message: isDuplicate
        ? "CV đã tồn tại; đã cập nhật kết quả phân tích"
        : cv.aiStatus === "COMPLETED"
          ? "Upload và phân tích CV thành công"
          : "CV đã được lưu; AI chưa thể phân tích, bạn có thể thử lại sau",
      cv,
      duplicate: isDuplicate,
    });
  } catch (error) {
    console.error("Lỗi upload CV:", error);

    res.status(500).json({
      message: "Lỗi server trong quá trình xử lý CV",
    });
  }
};

// Xếp hạng các tin đang tuyển theo mức độ khớp với một CV đã phân tích.
// Dùng cùng thuật toán matchCVToJob với trang chi tiết việc làm và shortlist HR.
const getRecommendedJobs = async (req, res) => {
  try {
    const cv = await CV.findOne({
      _id: req.params.id,
      candidate: req.user.userId,
    }).lean();

    if (!cv) {
      return res.status(404).json({ message: "Không tìm thấy CV" });
    }

    if (!cv.aiAnalysis) {
      return res.status(409).json({
        message: "CV này chưa được phân tích nên chưa thể gợi ý việc làm",
      });
    }

    const jobs = await Job.find({ status: "OPEN" }).lean();
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    const recommendations = jobs
      .map((job) => {
        const match = matchCVToJob(cv.aiAnalysis, job);
        return {
          ...job,
          matchScore: match.score,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return res.status(200).json({
      message: "Lấy danh sách việc làm gợi ý thành công",
      data: recommendations,
    });
  } catch (error) {
    console.error("Lỗi gợi ý việc làm:", error);
    return res.status(500).json({
      message: "Không thể lấy việc làm gợi ý",
    });
  }
};

module.exports = {
  getRecommendedJobs,
  uploadCV,
};
