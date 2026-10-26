const test = require("node:test");
const assert = require("node:assert/strict");

const aiService = require("../src/services/aiService");
const Application = require("../src/models/Application");
const applicationService = require("../src/services/applicationService");

const originalGenerateJSON = aiService.gemini.generateJSON;
const originalFindById = Application.findById;

const cvAnalysis = {
  personalInfo: {
    fullName: "Nguyễn Văn A",
    email: "a@gmail.com",
    phone: "0901234567",
    location: "Hà Nội",
  },
  summary: "Lập trình viên frontend 2 năm kinh nghiệm React",
  skills: ["React", "JavaScript"],
  experienceYears: 2,
  workExperience: [
    {
      company: "ABC",
      position: "Frontend Developer",
      highlights: ["Làm trang quản trị"],
    },
  ],
};
const job = {
  title: "Frontend Developer",
  description: "Yêu cầu 2 năm kinh nghiệm",
  skills: ["React", "TypeScript"],
  createdBy: { toString: () => "hr-1" },
};

// Đơn ứng tuyển giả: findById(...).populate(...).populate(...) trả về document có save()
const mockApplication = (overrides = {}) => {
  const application = {
    job,
    cv: { aiAnalysis: cvAnalysis },
    aiReview: undefined,
    saved: 0,
    save: async () => {
      application.saved += 1;
    },
    ...overrides,
  };
  const query = {
    populate: () => query,
    then: (resolve) => resolve(application),
  };
  Application.findById = () => query;
  return application;
};

test("generateJobDescription gọi Gemini và ghép các phần thành mô tả", async () => {
  let receivedPrompt;
  aiService.gemini.generateJSON = async (prompt) => {
    receivedPrompt = prompt;
    return {
      summary: "Tham gia phát triển giao diện web.",
      responsibilities: ["Xây dựng giao diện bằng React"],
      requirements: ["Thành thạo React"],
      benefits: ["[bổ sung chế độ phúc lợi]"],
      skills: ["React"],
    };
  };

  try {
    const result = await aiService.generateJobDescription({
      title: "Frontend Developer",
      skills: "React, TypeScript",
    });

    assert.match(receivedPrompt, /Frontend Developer/);
    assert.match(receivedPrompt, /React, TypeScript/);
    assert.match(
      result.description,
      /Nhiệm vụ chính:\n- Xây dựng giao diện bằng React/,
    );
    assert.match(result.description, /Yêu cầu:/);
    assert.deepEqual(result.skills, ["React", "TypeScript"]);
  } finally {
    aiService.gemini.generateJSON = originalGenerateJSON;
  }
});

test("generateJobDescription báo lỗi rõ khi thiếu vị trí hoặc AI lỗi, không trả mẫu dựng sẵn", async () => {
  aiService.gemini.generateJSON = async () => {
    throw new Error("quota exceeded");
  };

  try {
    await assert.rejects(
      aiService.generateJobDescription({}),
      /Cần nhập vị trí/,
    );
    await assert.rejects(
      aiService.generateJobDescription({ title: "Tester" }),
      /AI chưa thể tạo mô tả/,
    );
  } finally {
    aiService.gemini.generateJSON = originalGenerateJSON;
  }
});

test("gợi ý cho HR không gửi thông tin cá nhân của ứng viên sang AI và được lưu lại", async () => {
  let receivedPrompt;
  let calls = 0;
  aiService.gemini.generateJSON = async (prompt) => {
    calls += 1;
    receivedPrompt = prompt;
    return {
      summary: "Phù hợp phần lớn yêu cầu.",
      strengths: ["Có 2 năm React"],
      concerns: ["Chưa thấy TypeScript"],
      interviewQuestions: [
        {
          question: "Bạn đã dùng TypeScript chưa?",
          purpose: "Kiểm tra TypeScript",
          skill: "TypeScript",
        },
      ],
    };
  };
  const application = mockApplication();

  try {
    const review = await applicationService.getAIReviewForHR("app-1", "hr-1");

    assert.equal(calls, 1);
    for (const secret of ["Nguyễn Văn A", "a@gmail.com", "0901234567"]) {
      assert.equal(
        receivedPrompt.includes(secret),
        false,
        `Không được gửi ${secret}`,
      );
    }
    assert.match(receivedPrompt, /TypeScript/);
    assert.equal(review.interviewQuestions.length, 1);
    assert.equal(typeof review.matchScore, "number");
    assert.ok(review.generatedAt instanceof Date);
    assert.equal(application.saved, 1);

    // Lần sau dùng lại kết quả đã lưu, không gọi AI
    await applicationService.getAIReviewForHR("app-1", "hr-1");
    assert.equal(calls, 1);

    // HR yêu cầu tạo lại thì mới gọi AI
    await applicationService.getAIReviewForHR("app-1", "hr-1", {
      refresh: true,
    });
    assert.equal(calls, 2);
  } finally {
    aiService.gemini.generateJSON = originalGenerateJSON;
    Application.findById = originalFindById;
  }
});

test("HR không xem được gợi ý của đơn thuộc tin của HR khác", async () => {
  let called = false;
  aiService.gemini.generateJSON = async () => {
    called = true;
    return {};
  };
  mockApplication();

  try {
    await assert.rejects(
      applicationService.getAIReviewForHR("app-1", "hr-2"),
      /không có quyền/,
    );
    assert.equal(called, false);
  } finally {
    aiService.gemini.generateJSON = originalGenerateJSON;
    Application.findById = originalFindById;
  }
});

test("chưa có kết quả phân tích CV thì không gọi AI", async () => {
  let called = false;
  aiService.gemini.generateJSON = async () => {
    called = true;
    return {};
  };
  mockApplication({ cv: { aiAnalysis: undefined } });

  try {
    await assert.rejects(
      applicationService.getAIReviewForHR("app-1", "hr-1"),
      /chưa được phân tích/,
    );
    assert.equal(called, false);
  } finally {
    aiService.gemini.generateJSON = originalGenerateJSON;
    Application.findById = originalFindById;
  }
});
