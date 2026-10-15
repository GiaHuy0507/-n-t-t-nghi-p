const applicationService = require("../services/applicationService");

const createApplication = async (req, res) => {
  try {
    const application = await applicationService.createApplication({
      candidate: req.user.userId,
      job: req.body.jobId,
      coverLetter: req.body.coverLetter,
      cv: req.file,
    });

    return res.status(201).json({
      message: "Ứng tuyển thành công",
      data: application,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getApplicationsForHR = async (req, res) => {
  try {
    const applications = await applicationService.getApplicationsForHR(
      req.user.userId,
    );

    return res.status(200).json({
      message: "Lấy danh sách ứng viên thành công",
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getCVForHR = async (req, res) => {
  try {
    const cv = await applicationService.getCVForHR(
      req.params.id,
      req.user.userId,
    );

    return res.sendFile(cv.filePath, {
      headers: {
        "Content-Disposition": "inline",
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    return res
      .status(error.message === "Không tìm thấy đơn ứng tuyển" ? 404 : 403)
      .json({
        message: error.message,
      });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const application = await applicationService.updateApplicationStatus(
      req.params.id,
      req.user.userId,
      req.body.status,
    );

    return res.status(200).json({
      message: "Cập nhật trạng thái ứng tuyển thành công",
      data: application,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const updateApplicationReviewNote = async (req, res) => {
  try {
    const application = await applicationService.updateApplicationReviewNote(
      req.params.id,
      req.user.userId,
      req.body.hrNote,
    );

    return res.status(200).json({
      message: "Đã lưu ghi chú đánh giá",
      data: application,
    });
  } catch (error) {
    const statusCode =
      error.message === "Không tìm thấy đơn ứng tuyển" ? 404 : 400;
    return res.status(statusCode).json({ message: error.message });
  }
};

const getApplicationsForCandidate = async (req, res) => {
  try {
    const applications = await applicationService.getApplicationsForCandidate(
      req.user.userId,
    );

    return res.status(200).json({
      message: "Lấy danh sách đơn ứng tuyển thành công",
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getAIShortlistForHR = async (req, res) => {
  try {
    const data = await applicationService.getAIShortlistForHR(
      req.user.userId,
      req.params.jobId,
    );

    return res.status(200).json({
      message: "AI đã đề xuất shortlist ứng viên cho job này",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const retryAIAnalysisForHR = async (req, res) => {
  try {
    const cv = await applicationService.retryAIAnalysisForHR(
      req.params.id,
      req.user.userId,
    );

    return res.status(200).json({
      message: "Phân tích CV hoàn tất",
      data: cv,
    });
  } catch (error) {
    const statusCode =
      error.message === "Không tìm thấy đơn ứng tuyển" ? 404 : 400;
    return res.status(statusCode).json({ message: error.message });
  }
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
