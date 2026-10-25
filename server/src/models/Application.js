const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    coverLetter: {
      type: String,
      trim: true,
      default: "",
    },

    cv: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CV",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SHORTLISTED", "INTERVIEW", "REJECTED", "ACCEPTED"],
      default: "PENDING",
    },

    hrNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Mỗi ứng viên chỉ nộp một đơn cho một tin tuyển dụng
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
