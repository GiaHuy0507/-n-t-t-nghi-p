const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const aiService = require("../src/services/aiService");
const CV = require("../src/models/CV");
const Job = require("../src/models/Job");
const User = require("../src/models/User");
const { analyzeAndStoreCV } = require("../src/services/cvFileService");
const { register } = require("../src/services/authService");
const { getRecommendedJobs } = require("../src/controllers/cvController");

const originalAnalyzeCV = aiService.analyzeCV;
const originalUserFindOne = User.findOne;
const originalUserCreate = User.create;
const originalCVFindOne = CV.findOne;
const originalJobFind = Job.find;

const mockResponse = () => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

test("analyzeAndStoreCV giữ lại văn bản AI đọc được từ PDF dạng ảnh", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "cv-scan-"));
  const filePath = path.join(directory, "scan.pdf");
  await fs.writeFile(filePath, "pdf bytes");

  let receivedBuffer;
  aiService.analyzeCV = async (text, pdfBuffer) => {
    receivedBuffer = pdfBuffer;
    return {
      summary: "Tóm tắt",
      skills: ["React"],
      originalCvText: "Nguyễn Văn A - React",
    };
  };

  // Dùng document Mongoose thật để kiểm tra việc schema bỏ trường lạ
  const cv = new CV({
    candidate: "64b000000000000000000000",
    originalName: "scan.pdf",
    fileName: "scan.pdf",
    filePath,
    extractedText: "",
  });

  try {
    await analyzeAndStoreCV(cv);

    assert.ok(
      Buffer.isBuffer(receivedBuffer),
      "PDF phải được gửi kèm khi không có văn bản",
    );
    assert.equal(cv.extractedText, "Nguyễn Văn A - React");
    assert.equal(cv.aiStatus, "COMPLETED");
    assert.deepEqual([...cv.aiAnalysis.skills], ["React"]);
  } finally {
    aiService.analyzeCV = originalAnalyzeCV;
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("đăng ký công khai không tạo được tài khoản ADMIN", async () => {
  let created = false;
  User.findOne = async () => null;
  User.create = async (data) => {
    created = true;
    return { _id: "u1", ...data };
  };

  try {
    await assert.rejects(
      register({
        name: "A",
        email: "a@x.vn",
        password: "123456",
        role: "admin",
      }),
      /Vai trò không hợp lệ/,
    );
    assert.equal(created, false);

    const hr = await register({
      name: "B",
      email: "b@x.vn",
      password: "123456",
      role: "hr",
    });
    assert.equal(hr.role, "HR");
  } finally {
    User.findOne = originalUserFindOne;
    User.create = originalUserCreate;
  }
});

test("gợi ý việc làm chỉ dùng CV của chính ứng viên và xếp theo điểm khớp", async () => {
  let cvQuery;
  CV.findOne = (query) => {
    cvQuery = query;
    return {
      lean: async () => ({
        _id: "cv1",
        aiAnalysis: { skills: ["React", "JavaScript"], experienceYears: 2 },
      }),
    };
  };
  Job.find = (query) => {
    assert.deepEqual(query, { status: "OPEN" });
    return {
      lean: async () => [
        {
          _id: "j1",
          title: "Backend Developer",
          skills: ["Node.js", "MongoDB"],
        },
        {
          _id: "j2",
          title: "Frontend Developer",
          skills: ["React", "JavaScript"],
        },
      ],
    };
  };

  const res = mockResponse();
  try {
    await getRecommendedJobs(
      { params: { id: "cv1" }, query: {}, user: { userId: "candidate-1" } },
      res,
    );

    assert.deepEqual(cvQuery, { _id: "cv1", candidate: "candidate-1" });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(
      res.body.data.map((job) => job._id),
      ["j2", "j1"],
    );
    assert.ok(res.body.data[0].matchScore > res.body.data[1].matchScore);
  } finally {
    CV.findOne = originalCVFindOne;
    Job.find = originalJobFind;
  }
});

test("so khớp kỹ năng gộp các cách viết khác nhau và phân biệt C, C++, C#", () => {
  const { matchCVToJob } = aiService;
  const matches = (cvSkill, jobSkill) =>
    matchCVToJob({ skills: [cvSkill] }, { title: "x", skills: [jobSkill] })
      .matchedSkills.length === 1;

  assert.equal(matches("ReactJS", "React"), true);
  assert.equal(matches("NodeJS", "Node.js"), true);
  assert.equal(matches("JS", "JavaScript"), true);
  assert.equal(matches("Postgres", "PostgreSQL"), true);
  assert.equal(matches("Đồ họa", "do hoa"), true);
  assert.equal(matches("C++", "C#"), false);
  assert.equal(matches("C", "C++"), false);
});

test("chỉ lấy số năm kinh nghiệm khi câu thật sự nói về kinh nghiệm", () => {
  const { matchCVToJob } = aiService;
  const experienceScore = (description) =>
    matchCVToJob(
      { experienceYears: 2 },
      { title: "x", skills: [], description },
    ).breakdown.experience;

  assert.equal(experienceScore("Yêu cầu 4 năm kinh nghiệm Node.js"), 50);
  assert.equal(experienceScore("Requires 4 years of experience"), 50);
  assert.equal(
    experienceScore("Công ty thành lập 10 năm, môi trường trẻ."),
    null,
  );
});
