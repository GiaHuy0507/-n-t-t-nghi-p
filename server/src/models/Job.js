const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    salaryMin: {
      type: Number,
      required: true,
    },

    salaryMax: {
      type: Number,
      required: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "INTERNSHIP"],
      default: "FULL_TIME",
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Job", jobSchema);
