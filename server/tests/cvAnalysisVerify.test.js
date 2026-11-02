const test = require("node:test");
const assert = require("node:assert/strict");
const { verifyCVAnalysis } = require("../src/services/aiService");

const cvText = `Nguyễn Văn A - a@gmail.com - 0912345678 - Hà Nội
Kinh nghiệm: 03/2022 - 03/2024 Frontend Developer tại ABC.
Xây dựng giao diện quản lý đơn hàng bằng ReactJS.
Học vấn: Đại học Bách Khoa Hà Nội. Chứng chỉ: AWS Cloud Practitioner.`;

const baseAnalysis = {
  personalInfo: {
    fullName: "Nguyễn Văn A",
    email: "a@gmail.com",
    phone: "0912345678",
    location: "Hà Nội",
  },
  skills: ["ReactJS"],
  education: [{ school: "Đại học Bách Khoa Hà Nội" }],
  workExperience: [{ company: "ABC", position: "Frontend Developer" }],
  certifications: ["AWS Cloud Practitioner"],
  languages: [],
};

test("loại mục 'thiếu' mâu thuẫn với dữ liệu đã trích xuất", () => {
  const result = verifyCVAnalysis(
    {
      ...baseAnalysis,
      missingInformation: [
        "Thiếu thông tin liên hệ",
        "Thiếu email",
        "Thiếu kinh nghiệm làm việc",
        "Thiếu học vấn",
        "Thiếu chứng chỉ tiếng Anh",
        "Thiếu số liệu đo lường trong phần kinh nghiệm",
        "Thiếu ngoại ngữ",
      ],
    },
    cvText,
  );

  assert.deepEqual(result.missingInformation, [
    "Thiếu chứng chỉ tiếng Anh",
    "Thiếu số liệu đo lường trong phần kinh nghiệm",
    "Thiếu ngoại ngữ",
  ]);
});

test("loại gợi ý có evidence không nằm trong CV", () => {
  const result = verifyCVAnalysis(
    {
      ...baseAnalysis,
      improvementSuggestions: [
        {
          issue: "Mô tả công việc chưa có kết quả",
          evidence: "Xây dựng giao diện quản lý đơn hàng bằng ReactJS",
        },
        {
          issue: "Lỗi bịa",
          evidence: "Phụ trách đội 20 người tại công ty XYZ",
        },
        { issue: "Chung chung", evidence: "" },
      ],
    },
    cvText,
  );

  assert.equal(result.improvementSuggestions.length, 1);
  assert.equal(
    result.improvementSuggestions[0].issue,
    "Mô tả công việc chưa có kết quả",
  );
});

test("PDF dạng ảnh: dùng originalCvText làm văn bản đối chiếu", () => {
  const result = verifyCVAnalysis(
    {
      ...baseAnalysis,
      originalCvText: cvText,
      improvementSuggestions: [
        { issue: "x", evidence: "Frontend Developer tại ABC" },
      ],
    },
    "",
  );
  assert.equal(result.improvementSuggestions.length, 1);
});

test("analyzeCV ghi ngày hiện tại và gửi kèm PDF khi đã có văn bản", async () => {
  const aiService = require("../src/services/aiService");
  const originalGenerateJSON = aiService.gemini.generateJSON;
  let sentContents;
  aiService.gemini.generateJSON = async (contents) => {
    sentContents = contents;
    return { ...baseAnalysis, missingInformation: [], improvementSuggestions: [] };
  };

  try {
    await aiService.analyzeCV(cvText, Buffer.from("pdf bytes"), new Date("2026-11-02T03:00:00Z"));

    const parts = sentContents[0].parts;
    const prompt = parts[0].text;
    assert.match(prompt, /Hôm nay là ngày 02\/11\/2026/);
    assert.match(prompt, /căn cứ vào PDF/);
    assert.ok(prompt.includes("Frontend Developer tại ABC"), "văn bản CV vẫn nằm trong prompt");
    assert.equal(parts[1].inlineData.mimeType, "application/pdf");
  } finally {
    aiService.gemini.generateJSON = originalGenerateJSON;
  }
});
