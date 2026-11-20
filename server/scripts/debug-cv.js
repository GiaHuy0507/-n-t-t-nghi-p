// Chạy thử đúng request phân tích CV trên một file PDF và in chi tiết lỗi.
// Cách dùng (trong thư mục server):
//   npm run debug-cv -- "D:\\duong\\dan\\CV.pdf"
// Không ghi gì vào cơ sở dữ liệu.
require("dotenv").config();
const fs = require("fs");
const aiService = require("../src/services/aiService");
const { extractTextFromPDF } = require("../src/services/pdfService");

async function main() {
  const filePath = process.argv[2];
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Hãy truyền đường dẫn file PDF: npm run debug-cv -- "duong/dan/CV.pdf"');
  }

  const buffer = await fs.promises.readFile(filePath);
  console.log(`File: ${filePath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  console.log(`Model: ${process.env.GEMINI_MODEL || "gemini-3.5-flash-lite (mặc định)"}`);

  let text = "";
  try {
    text = await extractTextFromPDF(filePath);
  } catch (error) {
    console.log("pdf-parse lỗi:", error.message);
  }
  console.log(`pdf-parse đọc được ${text.length} ký tự${text ? "" : " → sẽ chỉ gửi file PDF"}`);

  // Gọi thẳng Gemini để thấy lỗi gốc (analyzeCV đổi lỗi thành câu chung chung)
  const original = aiService.gemini.generateJSON;
  aiService.gemini.generateJSON = async (...args) => {
    try {
      return await original(...args);
    } catch (error) {
      console.error("\n=== LỖI GỐC TỪ GEMINI ===");
      console.error("message:", error.message);
      if (error.status) console.error("status:", error.status);
      throw error;
    }
  };

  const started = Date.now();
  try {
    const analysis = await aiService.analyzeCV(text, buffer);
    console.log(`\nThành công sau ${((Date.now() - started) / 1000).toFixed(1)}s`);
    console.log("Họ tên:", analysis.personalInfo?.fullName);
    console.log("Kỹ năng:", (analysis.skills || []).join(", "));
    console.log("Số gợi ý cải thiện:", (analysis.improvementSuggestions || []).length);
    console.log("Thông tin còn thiếu:", analysis.missingInformation);
  } catch {
    console.error(`\nThất bại sau ${((Date.now() - started) / 1000).toFixed(1)}s`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
