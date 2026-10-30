// Đánh giá độ chính xác trích xuất CV của AI (Bảng 4.6 trong báo cáo).
//
// Chuẩn bị:
//   server/eval/            ← đặt các file CV PDF vào đây
//   server/eval/labels.json ← nhãn gán thủ công (xem labels.example.json)
// Chạy:
//   cd server
//   node scripts/evaluate-ai.js
// Kết quả: server/eval/results.md (bảng) và server/eval/results.json (chi tiết từng CV)
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const EVAL_DIR = path.resolve(__dirname, "../eval");
const DELAY_MS = 4000; // nghỉ giữa các lần gọi để tránh giới hạn tần suất của Gemini

// ---------- Chuẩn hóa để so sánh ----------
const stripAccents = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const normalizeName = (name = "") =>
  stripAccents(name).toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

// 0912 345 678, +84 912345678, 84-912-345-678 → 0912345678
const normalizePhone = (phone = "") => {
  let digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length >= 11) digits = `0${digits.slice(2)}`;
  return digits;
};

const SKILL_ALIASES = {
  js: "javascript",
  ts: "typescript",
  postgres: "postgresql",
  mongo: "mongodb",
  golang: "go",
  k8s: "kubernetes",
  nodejs: "node",
  reactjs: "react",
  vuejs: "vue",
};

// Cùng quy tắc với normalizeSkill trong aiService.js: ReactJS = React.js = React
const normalizeSkill = (skill = "") =>
  stripAccents(
    String(skill)
      .toLowerCase()
      .replace(/c\+\+/g, " cpp ")
      .replace(/c#/g, " csharp ")
      .replace(/\.net\b/g, " dotnet ")
      .replace(/\b([a-z]+)\.js\b/g, "$1"),
  )
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => SKILL_ALIASES[word] || word)
    .join(" ");

const skillSet = (skills = []) =>
  new Set((Array.isArray(skills) ? skills : []).map(normalizeSkill).filter(Boolean));

// ---------- Chấm một CV ----------
function scoreCV(label, analysis = {}) {
  const info = analysis.personalInfo || {};

  const nameOk = normalizeName(info.fullName) === normalizeName(label.fullName);

  // "Email, điện thoại" chỉ tính đúng khi cả hai cùng đúng.
  // Trường nào CV không có thì nhãn để "" và AI cũng phải trả "".
  const emailOk = normalizeEmail(info.email) === normalizeEmail(label.email);
  const phoneOk = normalizePhone(info.phone) === normalizePhone(label.phone);
  const contactOk = emailOk && phoneOk;

  const expected = skillSet(label.skills);
  const predicted = skillSet(analysis.skills);
  const truePositive = [...predicted].filter((skill) => expected.has(skill));
  const falsePositive = [...predicted].filter((skill) => !expected.has(skill));
  const falseNegative = [...expected].filter((skill) => !predicted.has(skill));

  const experienceDiff = Math.abs(
    (Number(analysis.experienceYears) || 0) - (Number(label.experienceYears) || 0),
  );
  const experienceOk = experienceDiff <= 0.5;

  return {
    file: label.file,
    scanned: Boolean(label.scanned),
    nameOk,
    emailOk,
    phoneOk,
    contactOk,
    experienceOk,
    experienceDiff,
    // CV scan tính là đúng khi đọc đúng đồng thời họ tên, liên hệ và số năm kinh nghiệm
    scannedOk: nameOk && contactOk && experienceOk,
    skills: {
      tp: truePositive.length,
      fp: falsePositive.length,
      fn: falseNegative.length,
      extra: falsePositive,
      missed: falseNegative,
    },
    predicted: {
      fullName: info.fullName,
      email: info.email,
      phone: info.phone,
      experienceYears: analysis.experienceYears,
      skills: analysis.skills,
    },
  };
}

// ---------- Tổng hợp thành Bảng 4.6 ----------
const pct = (value) => (Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "—");

function buildTable(results) {
  const ok = results.filter((r) => !r.error);
  const count = (key, rows = ok) => rows.filter((r) => r[key]).length;

  const tp = ok.reduce((sum, r) => sum + r.skills.tp, 0);
  const fp = ok.reduce((sum, r) => sum + r.skills.fp, 0);
  const fn = ok.reduce((sum, r) => sum + r.skills.fn, 0);
  const precision = tp + fp ? tp / (tp + fp) : NaN;
  const recall = tp + fn ? tp / (tp + fn) : NaN;

  const scanned = ok.filter((r) => r.scanned);
  const errors = results.filter((r) => r.error);

  const rows = [
    ["Họ tên", ok.length, count("nameOk"), pct(count("nameOk") / ok.length), "—", ""],
    [
      "Email, điện thoại",
      ok.length,
      count("contactOk"),
      pct(count("contactOk") / ok.length),
      "—",
      `Email đúng ${count("emailOk")}/${ok.length}; SĐT đúng ${count("phoneOk")}/${ok.length}`,
    ],
    [
      "Kỹ năng",
      ok.length,
      "—",
      pct(precision),
      pct(recall),
      `TP=${tp}, FP=${fp}, FN=${fn} (micro-average)`,
    ],
    [
      "Số năm kinh nghiệm (sai lệch ≤ 0,5 năm)",
      ok.length,
      count("experienceOk"),
      pct(count("experienceOk") / ok.length),
      "—",
      "",
    ],
    [
      "CV dạng ảnh scan",
      scanned.length,
      count("scannedOk", scanned),
      scanned.length ? pct(count("scannedOk", scanned) / scanned.length) : "—",
      "—",
      "Đúng khi cả họ tên, liên hệ và kinh nghiệm đều đúng",
    ],
  ];

  const header =
    "| Trường | Số CV | Đúng | Tỉ lệ / Precision | Recall | Ghi chú |\n|---|---|---|---|---|---|";
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  const note = errors.length
    ? `\n\nCV lỗi khi phân tích (không tính vào bảng): ${errors.map((e) => e.file).join(", ")}`
    : "";

  return `${header}\n${body}${note}\n`;
}

// ---------- Chạy ----------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function analyzeWithRetry(analyzeCV, text, buffer) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await analyzeCV(text, buffer);
    } catch (error) {
      if (attempt === 3) throw error;
      console.log(`  lỗi, thử lại lần ${attempt + 1}/3 sau 10 giây...`);
      await sleep(10000);
    }
  }
}

async function main() {
  const { analyzeCV } = require("../src/services/aiService");
  const { extractTextFromPDF } = require("../src/services/pdfService");

  const labelsPath = path.join(EVAL_DIR, "labels.json");
  if (!fs.existsSync(labelsPath)) {
    throw new Error(`Chưa có ${labelsPath}. Xem labels.example.json để tạo.`);
  }
  const labels = JSON.parse(fs.readFileSync(labelsPath, "utf8"));

  console.log(`Mô hình: ${process.env.GEMINI_MODEL || "gemini-3.5-flash-lite (mặc định)"}`);
  console.log(`Số CV: ${labels.length}\n`);

  const results = [];
  for (const [index, label] of labels.entries()) {
    const filePath = path.join(EVAL_DIR, label.file);
    console.log(`[${index + 1}/${labels.length}] ${label.file}`);

    try {
      // Giống luồng thật trong cvFileService: có chữ thì gửi chữ, không có thì gửi PDF
      let text = "";
      try {
        text = await extractTextFromPDF(filePath);
      } catch {
        text = "";
      }
      const buffer = text ? null : fs.readFileSync(filePath);
      if (!text) console.log("  không trích được chữ → gửi PDF cho AI đọc ảnh");

      const analysis = await analyzeWithRetry(analyzeCV, text, buffer);
      const result = scoreCV(label, analysis);
      results.push(result);
      console.log(
        `  họ tên ${result.nameOk ? "✓" : "✗"} | liên hệ ${result.contactOk ? "✓" : "✗"} | kinh nghiệm ${result.experienceOk ? "✓" : "✗"} | kỹ năng TP=${result.skills.tp} FP=${result.skills.fp} FN=${result.skills.fn}`,
      );
    } catch (error) {
      console.log(`  LỖI: ${error.message}`);
      results.push({ file: label.file, error: error.message });
    }

    if (index < labels.length - 1) await sleep(DELAY_MS);
  }

  const table = buildTable(results);
  fs.writeFileSync(path.join(EVAL_DIR, "results.md"), table);
  fs.writeFileSync(path.join(EVAL_DIR, "results.json"), JSON.stringify(results, null, 2));

  console.log(`\n${table}`);
  console.log("Đã lưu eval/results.md và eval/results.json");
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Đánh giá thất bại:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { scoreCV, buildTable, normalizeSkill, normalizePhone, normalizeName };
