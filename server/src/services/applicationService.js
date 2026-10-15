const fs = require("fs");
const Application = require("../models/Application");
const CV = require("../models/CV");
const Job = require("../models/Job");
const { analyzeCV, matchCVToJob } = require("./aiService");
const { removeFile, saveUploadedCV } = require("./cvFileService");

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
    throw new Error("Job not found");
  }

  if (jobDocument.status !== "OPEN") {
    await removeFile(cv.path);
    throw new Error("This job is closed");
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
    throw error;
  }

  if (uploadedCV.aiStatus !== "COMPLETED" || !uploadedCV.aiAnalysis) {
    try {
      uploadedCV.aiStatus = "PENDING";
      await uploadedCV.save();
      const pdfBuffer = uploadedCV.extractedText
        ? null
        : fs.readFileSync(uploadedCV.filePath);
      uploadedCV.aiAnalysis = await analyzeCV(
        uploadedCV.extractedText,
        pdfBuffer,
      );
      uploadedCV.aiStatus = "COMPLETED";
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
    .select("-hrNote")
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
    const pdfBuffer = cv.extractedText ? null : fs.readFileSync(cv.filePath);
    cv.aiAnalysis = await analyzeCV(cv.extractedText, pdfBuffer);
    cv.aiStatus = "COMPLETED";
    await cv.save();
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

module.exports = {
  createApplication,
  getApplicationsForHR,
  getCVForHR,
  updateApplicationStatus,
  updateApplicationReviewNote,
  getApplicationsForCandidate,
  retryAIAnalysisForHR,
  getAIShortlistForHR,
};
