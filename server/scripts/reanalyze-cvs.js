// Cho AI phân tích lại các CV đã lưu, dùng sau khi sửa prompt hoặc luồng phân tích.
// Cách dùng (trong thư mục server):
//   npm run reanalyze-cvs                  ← tất cả CV
//   npm run reanalyze-cvs -- --id <cvId>   ← chỉ một CV
//   npm run reanalyze-cvs -- --dry-run     ← chỉ liệt kê, không gọi AI
// CV phân tích lỗi giữ nguyên kết quả cũ. Nhận xét AI cho HR của các đơn ứng tuyển
// dùng CV được phân tích lại sẽ bị xóa để lần sau tạo lại theo dữ liệu mới.
require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const CV = require("../src/models/CV");
const Application = require("../src/models/Application");
const { analyzeAndStoreCV } = require("../src/services/cvFileService");
const { extractTextFromPDF } = require("../src/services/pdfService");

const DELAY_MS = 4000; // nghỉ giữa các lần gọi để tránh giới hạn tần suất của Gemini
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseArgs = (args) => {
  const idIndex = args.indexOf("--id");
  return {
    id: idIndex >= 0 ? args[idIndex + 1] : null,
    dryRun: args.includes("--dry-run"),
  };
};

const describe = (cv) =>
  `${cv.aiAnalysis?.personalInfo?.fullName || "(chưa rõ tên)"} (${cv.originalName})`;

async function analyzeWithRetry(cv) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await analyzeAndStoreCV(cv);
    } catch (error) {
      if (attempt === 3) throw error;
      console.log(`    lỗi, thử lại lần ${attempt + 1}/3 sau 10 giây...`);
      await sleep(10000);
    }
  }
}

const run = async () => {
  const { id, dryRun } = parseArgs(process.argv.slice(2));
  if (process.argv.includes("--id") && !mongoose.isValidObjectId(id)) {
    throw new Error("ID không hợp lệ. Ví dụ: npm run reanalyze-cvs -- --id 6720a1b2c3d4e5f6a7b8c9d0");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const cvs = await CV.find(id ? { _id: id } : {}).sort({ createdAt: 1 });
  if (!cvs.length) {
    throw new Error(id ? `Không tìm thấy CV ${id}` : "Chưa có CV nào trong database");
  }

  console.log(`${dryRun ? "[Chạy thử] " : ""}Số CV: ${cvs.length}\n`);

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const [index, cv] of cvs.entries()) {
    const label = `[${index + 1}/${cvs.length}] ${cv._id} ${describe(cv)}`;

    if (!fs.existsSync(cv.filePath)) {
      console.log(`${label}  bỏ qua: không còn file PDF`);
      skipped += 1;
      continue;
    }
    if (dryRun) {
      console.log(`${label}  trạng thái: ${cv.aiStatus}`);
      continue;
    }

    try {
      // Tách chữ lại từ file: với PDF dạng ảnh, extractedText đang là phần AI
      // chép lại lần trước; để rỗng thì AI sẽ đọc lại trực tiếp từ PDF.
      cv.extractedText = await extractTextFromPDF(cv.filePath).catch(() => "");
      await analyzeWithRetry(cv);
      await cv.save();
      await Application.updateMany({ cv: cv._id }, { $unset: { aiReview: 1 } });

      succeeded += 1;
      console.log(
        `${label}  ✓ ${cv.aiAnalysis.experienceYears || 0} năm KN, ${cv.aiAnalysis.skills?.length || 0} kỹ năng`,
      );
    } catch (error) {
      // Chưa lưu gì vào database nên kết quả cũ vẫn còn nguyên
      failed += 1;
      console.log(`${label}  ✗ ${error.message} (giữ kết quả cũ)`);
    }

    if (index < cvs.length - 1) await sleep(DELAY_MS);
  }

  if (!dryRun) {
    console.log(`\nXong: ${succeeded} thành công, ${failed} lỗi, ${skipped} bỏ qua`);
  }
  if (failed) process.exitCode = 1;
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
