const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const CV = require("../models/CV");
const aiService = require("./aiService");
const { extractTextFromPDF } = require("./pdfService");

const cvUploadDir = path.resolve(__dirname, "../../uploads/cv");

const removeFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const calculateFileHash = async (filePath) => {
  const fileBuffer = await fs.promises.readFile(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};

const findDuplicateCV = async (candidate, fileHash) => {
  const duplicate = await CV.findOne({ candidate, fileHash });
  if (duplicate) return duplicate;

  const legacyCVs = await CV.find({
    candidate,
    $or: [{ fileHash: { $exists: false } }, { fileHash: null }],
  });

  for (const legacyCV of legacyCVs) {
    if (!legacyCV.filePath) continue;

    let legacyHash;
    try {
      legacyHash = await calculateFileHash(legacyCV.filePath);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }

    legacyCV.fileHash = legacyHash;
    await legacyCV.save();

    if (legacyHash === fileHash) return legacyCV;
  }

  return null;
};

const saveUploadedCV = async ({ candidate, file }) => {
  let permanentPath;

  try {
    const fileHash = await calculateFileHash(file.path);
    const duplicate = await findDuplicateCV(candidate, fileHash);

    if (duplicate) {
      await removeFile(file.path);
      return { cv: duplicate, isDuplicate: true };
    }

    let extractedText = "";
    try {
      extractedText = await extractTextFromPDF(file.path);
    } catch (error) {
      console.warn("Không trích xuất được text từ PDF:", error.message);
    }

    await fs.promises.mkdir(cvUploadDir, { recursive: true });
    permanentPath = path.join(cvUploadDir, file.filename);
    await fs.promises.rename(file.path, permanentPath);

    const cv = await CV.create({
      candidate,
      originalName: file.originalname,
      fileName: file.filename,
      filePath: permanentPath,
      fileHash,
      extractedText,
      aiStatus: "PENDING",
    });

    return { cv, isDuplicate: false };
  } catch (error) {
    await removeFile(file.path).catch(() => {});
    if (permanentPath) await removeFile(permanentPath).catch(() => {});
    throw error;
  }
};

// Gọi AI phân tích CV và gán kết quả vào document (chưa lưu).
// Với PDF dạng ảnh, AI chép lại chữ đọc được vào originalCvText; phải lấy
// trường này trước khi gán vào cv.aiAnalysis vì schema không có trường đó
// nên Mongoose sẽ bỏ nó đi.
const analyzeAndStoreCV = async (cv) => {
  const pdfBuffer = cv.extractedText
    ? null
    : await fs.promises.readFile(cv.filePath);
  const analysis = await aiService.analyzeCV(cv.extractedText, pdfBuffer);

  if (!cv.extractedText && analysis?.originalCvText) {
    cv.extractedText = analysis.originalCvText;
  }
  cv.aiAnalysis = analysis;
  cv.aiStatus = "COMPLETED";

  return cv;
};

module.exports = {
  analyzeAndStoreCV,
  calculateFileHash,
  findDuplicateCV,
  removeFile,
  saveUploadedCV,
};
