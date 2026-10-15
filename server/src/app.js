const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const cvRoutes = require("./routes/cvRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Recruitment API is running",
  });
});

app.use((error, req, res, next) => {
  if (error.name === "MulterError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.message === "CV phải là file PDF") {
    return res.status(400).json({ message: error.message });
  }

  next(error);
});

module.exports = app;
