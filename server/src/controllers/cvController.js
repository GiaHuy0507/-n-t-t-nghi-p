const fs = require("fs");
const { analyzeCV } = require("../services/aiService");
const { saveUploadedCV } = require("../services/cvFileService");

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
      const pdfBuffer = cv.extractedText ? null : fs.readFileSync(cv.filePath);
      cv.aiAnalysis = await analyzeCV(cv.extractedText, pdfBuffer);
      cv.aiStatus = "COMPLETED";
    } catch (error) {
      console.error("Không thể phân tích CV:", error);
      cv.aiAnalysis = undefined;
      cv.aiStatus = "FAILED";
    }

    if (!cv.extractedText && cv.aiAnalysis?.originalCvText) {
      cv.extractedText = cv.aiAnalysis.originalCvText;
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

module.exports = {
  uploadCV,
};
