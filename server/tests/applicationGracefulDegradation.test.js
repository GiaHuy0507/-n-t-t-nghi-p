const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const aiService = require("../src/services/aiService");
const pdfService = require("../src/services/pdfService");
const Application = require("../src/models/Application");
const CV = require("../src/models/CV");
const Job = require("../src/models/Job");

const originalAnalyzeCV = aiService.analyzeCV;
const originalExtractTextFromPDF = pdfService.extractTextFromPDF;
const originalApplicationFindOne = Application.findOne;
const originalApplicationCreate = Application.create;
const originalCVCreate = CV.create;
const originalCVFindOne = CV.findOne;
const originalCVFind = CV.find;
const originalCVFindByIdAndDelete = CV.findByIdAndDelete;
const originalJobFindById = Job.findById;

let analysisAttempted;
let savedCV;

aiService.analyzeCV = async () => {
  analysisAttempted = true;
  throw new Error("Gemini unavailable");
};
pdfService.extractTextFromPDF = async () => "Candidate CV content";

const applicationService = require("../src/services/applicationService");

test("createApplication keeps the application when AI analysis fails", async () => {
  analysisAttempted = false;
  savedCV = null;
  const filename = `graceful-${crypto.randomUUID()}.pdf`;
  const tempDirectory = path.join(__dirname, "../uploads/tmp/cv");
  const permanentPath = path.join(__dirname, "../uploads/cv", filename);
  const tempPath = path.join(tempDirectory, filename);
  await fs.mkdir(tempDirectory, { recursive: true });
  await fs.writeFile(tempPath, "candidate pdf bytes");

  Application.findOne = async () => null;
  CV.findOne = async () => null;
  CV.find = async () => [];
  Application.create = async (data) => {
    assert.equal(analysisAttempted, false);
    return { ...data, _id: "application-id" };
  };
  CV.create = async (data) => {
    savedCV = { ...data, _id: "cv-id", save: async () => {} };
    return savedCV;
  };
  CV.findByIdAndDelete = async () => {};
  Job.findById = () => ({
    select: async () => ({ status: "OPEN" }),
  });

  try {
    const application = await applicationService.createApplication({
      candidate: "candidate-id",
      job: "job-id",
      cv: {
        path: tempPath,
        originalname: "candidate.pdf",
        filename,
      },
    });

    assert.equal(application._id, "application-id");
    assert.equal(analysisAttempted, true);
    assert.equal(savedCV.aiStatus, "FAILED");
    assert.equal(savedCV.aiAnalysis, undefined);
  } finally {
    await fs.rm(tempPath, { force: true });
    await fs.rm(permanentPath, { force: true });
    Application.findOne = originalApplicationFindOne;
    Application.create = originalApplicationCreate;
    CV.create = originalCVCreate;
    CV.findOne = originalCVFindOne;
    CV.find = originalCVFind;
    CV.findByIdAndDelete = originalCVFindByIdAndDelete;
    Job.findById = originalJobFindById;
  }
});

test.after(() => {
  aiService.analyzeCV = originalAnalyzeCV;
  pdfService.extractTextFromPDF = originalExtractTextFromPDF;
});
