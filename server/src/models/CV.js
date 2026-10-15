const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    personalInfo: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
    },
    summary: { type: String, default: "" },
    strengths: { type: [String], default: [] },
    improvementSuggestions: {
      type: [
        {
          issue: String,
          evidence: String,
          recommendation: String,
          example: String,
        },
      ],
      default: [],
    },
    skills: { type: [String], default: [] },
    education: {
      type: [
        {
          school: String,
          degree: String,
          major: String,
        },
      ],
      default: [],
    },
    experienceYears: { type: Number, default: 0 },
    workExperience: {
      type: [
        {
          company: String,
          position: String,
          duration: String,
          highlights: [String],
        },
      ],
      default: [],
    },
    languages: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    missingInformation: { type: [String], default: [] },
  },
  { _id: false },
);

const cvSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileHash: {
      type: String,
    },

    extractedText: {
      type: String,
      default: "",
    },
    aiStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    aiAnalysis: { type: aiAnalysisSchema, default: undefined },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

cvSchema.index({ candidate: 1, fileHash: 1 });

module.exports = mongoose.model("CV", cvSchema);
