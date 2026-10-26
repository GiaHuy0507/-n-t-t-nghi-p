const Application = require("../models/Application");
const CV = require("../models/CV");
const Job = require("../models/Job");
const aiService = require("./aiService");
const { matchCVToJob } = aiService;
const {
  analyzeAndStoreCV,
  removeFile,
  saveUploadedCV,
} = require("./cvFileService");

const createApplication = async (data) => {
  const { candidate, job, coverLetter, cv } = data;
  const existingApplication = await Application.findOne({
    candidate,
    job,
  });

  if (existingApplication) {
    await removeFile(cv?.path);
    throw new Error("Bạn đã ứng tuyển công việc này");
  }
  if (!cv) {
    throw new Error("Vui lòng tải CV lên");
  }

  const jobDocument = await Job.findById(job).select("status");

  if (!jobDocument) {
    await removeFile(cv.path);
    throw new Error("Không tìm thấy tin tuyển dụng");
  }

  if (jobDocument.status !== "OPEN") {
    await removeFile(cv.path);
    throw new Error("Tin tuyển dụng này đã đóng");
  }

  const { cv: uploadedCV, isDuplicate } = await saveUploadedCV({
    candidate,
    file: cv,
  });

  let application;
  try {
    application = await Application.create({
      candidate,
      job,
      coverLetter,
      cv: uploadedCV._id,
    });
  } catch (error) {
    if (!isDuplicate) {
      await CV.findByIdAndDelete(uploadedCV._id);
      await removeFile(uploadedCV.filePath);
    }
    // Hai yêu cầu ứng tuyển gửi gần như cùng lúc: chỉ mục unique chặn bản thứ hai
    if (error.code === 11000) {
      throw new Error("Bạn đã ứng tuyển công việc này");
    }
    throw error;
  }

  if (uploadedCV.aiStatus !== "COMPLETED" || !uploadedCV.aiAnalysis) {
    try {
      uploadedCV.aiStatus = "PENDING";
      await uploadedCV.save();
      await analyzeAndStoreCV(uploadedCV);
      await uploadedCV.save();
    } catch (error) {
      uploadedCV.aiAnalysis = undefined;
      uploadedCV.aiStatus = "FAILED";
      console.error("Không thể phân tích CV ứng tuyển:", error.message);
      try {
        await uploadedCV.save();
      } catch (saveError) {
        console.error("Không thể cập nhật trạng thái CV:", saveError.message);
      }
    }
  }

  return application;
};

const getApplicationsForHR = async (hrId) => {
  const hrJobs = await Job.find({ createdBy: hrId }).select("_id").lean();
  const jobIds = hrJobs.map((j) => j._id);

  return Application.find({ job: { $in: jobIds } })
    .populate("job", "title company location")
    .populate("candidate", "name email")
    .populate("cv", "originalName fileName uploadedAt aiStatus")
    .sort({ createdAt: -1 });
};

const getCVForHR = async (applicationId, hrId) => {
  const application = await Application.findById(applicationId)
    .populate("job", "createdBy")
    .populate("cv", "filePath originalName");

  if (!application) {
    throw new Error("Không tìm thấy đơn ứng tuyển");
  }

  if (!application.job || application.job.createdBy.toString() !== hrId) {
    throw new Error("Bạn không có quyền xem CV này");
  }

  if (!application.cv?.filePath) {
    throw new Error("Không tìm thấy file CV");
  }

  return application.cv;
};

const updateApplicationReviewNote = async (applicationId, hrId, hrNote) => {
  if (typeof hrNote !== "string" || hrNote.length > 2000) {
    throw new Error("Ghi chú không hợp lệ hoặc vượt quá 2000 ký tự");
  }

  const application = await Application.findById(applicationId).populate(
    "job",
    "createdBy",
  );

  if (!application) {
    throw new Error("Không tìm thấy đơn ứng tuyển");
  }

  if (!application.job || application.job.createdBy.toString() !== hrId) {
    throw new Error("Bạn không có quyền cập nhật đơn ứng tuyển này");
  }

  application.hrNote = hrNote.trim();
  await application.save();

  return application;
};

const updateApplicationStatus = async (applicationId, hrId, status) => {
  const application = await Application.findById(applicationId).populate(
    "job",
    "createdBy",
  );

  if (!application) {
    throw new Error("Không tìm thấy đơn ứng tuyển");
  }

  if (!application.job || application.job.createdBy.toString() !== hrId) {
    throw new Error("Bạn không có quyền cập nhật đơn ứng tuyển này");
  }

  const allowedStatuses = [
    "PENDING",
    "SHORTLISTED",
    "INTERVIEW",
    "REJECTED",
    "ACCEPTED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  application.status = status;

  await application.save();

  return application;
};

const getApplicationsForCandidate = async (candidateId) => {
  const applications = await Application.find({
    candidate: candidateId,
  })
    .select("-hrNote -aiReview")
    .populate(
      "job",
      "title company location salaryMin salaryMax employmentType",
    )
    .populate("cv", "originalName fileName uploadedAt")
    .sort({ createdAt: -1 });

  return applications;
};

const retryAIAnalysisForHR = async (applicationId, hrId) => {
  const application = await Application.findById(applicationId)
    .populate("job", "createdBy")
    .populate("cv");

  if (!application) {
    throw new Error("Không tìm thấy đơn ứng tuyển");
  }

  if (!application.job || application.job.createdBy.toString() !== hrId) {
    throw new Error("Bạn không có quyền phân tích CV này");
  }

  if (!application.cv?.filePath) {
    throw new Error("Không tìm thấy file CV");
  }

  const cv = application.cv;
  cv.aiStatus = "PENDING";
  await cv.save();

  try {
    await analyzeAndStoreCV(cv);
    await cv.save();
    // Kết quả phân tích mới → bỏ gợi ý cũ của AI để HR tạo lại
    if (application.aiReview) {
      application.aiReview = undefined;
      await application.save();
    }
    return cv;
  } catch (error) {
    cv.aiAnalysis = undefined;
    cv.aiStatus = "FAILED";
    await cv.save();
    throw new Error("AI chưa thể phân tích CV này. Vui lòng thử lại sau.");
  }
};

const getAIShortlistForHR = async (hrId, jobId) => {
  let jobQuery = Job.findOne({ _id: jobId, createdBy: hrId });
  if (jobQuery && typeof jobQuery.lean === "function") {
    jobQuery = jobQuery.lean();
  }
  const job = await jobQuery;
  if (!job) {
    throw new Error("Không tìm thấy tin tuyển dụng hoặc bạn không có quyền");
  }

  const applicationsQuery = await Application.find({
    job: jobId,
    status: { $in: ["PENDING", "SHORTLISTED", "INTERVIEW"] },
  })
    .populate("candidate", "name email")
    .populate("cv", "aiAnalysis extractedText");

  const applications = Array.isArray(applicationsQuery)
    ? applicationsQuery
    : typeof applicationsQuery.lean === "function"
      ? await applicationsQuery.lean()
      : applicationsQuery;

  const shortlist = applications
    .filter((application) => application.cv?.aiAnalysis)
    .map((application) => {
      const scoreResult = matchCVToJob(application.cv.aiAnalysis, job);
      const matchedSkills = scoreResult.matchedSkills || [];

      return {
        applicationId: application._id,
        candidateName: application.candidate?.name || "Ứng viên",
        candidateEmail: application.candidate?.email || "",
        status: application.status,
        score: scoreResult.score,
        matchedSkills,
        summary: scoreResult.summary,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    jobId: job._id,
    jobTitle: job.title,
    shortlist,
  };
};

// HR xem tóm tắt hồ sơ và câu hỏi phỏng vấn gợi ý. Kết quả được lưu lại;
// chỉ gọi AI lần nữa khi HR yêu cầu tạo lại.
const getAIReviewForHR = async (
  applicationId,
  hrId,
  { refresh = false } = {},
) => {
  const application = await Application.findById(applicationId)
    .populate("job", "title description skills createdBy")
    .populate("cv", "aiAnalysis");

  if (!application) {
    throw new Error("Không tìm thấy đơn ứng tuyển");
  }

  if (!application.job || application.job.createdBy.toString() !== hrId) {
    throw new Error("Bạn không có quyền xem đơn ứng tuyển này");
  }

  if (application.aiReview?.generatedAt && !refresh) {
    return application.aiReview;
  }

  if (!application.cv?.aiAnalysis) {
    throw new Error(
      "CV của ứng viên chưa được phân tích, hãy phân tích lại CV trước",
    );
  }

  const match = matchCVToJob(application.cv.aiAnalysis, application.job);
  const review = await aiService.generateApplicationReview({
    cvAnalysis: application.cv.aiAnalysis,
    job: application.job,
    match,
  });

  application.aiReview = {
    ...review,
    matchScore: match.score,
    generatedAt: new Date(),
  };
  await application.save();

  return application.aiReview;
};

module.exports = {
  getAIReviewForHR,
  createApplication,
  getApplicationsForHR,
  getCVForHR,
  updateApplicationStatus,
  updateApplicationReviewNote,
  getApplicationsForCandidate,
  retryAIAnalysisForHR,
  getAIShortlistForHR,
};
