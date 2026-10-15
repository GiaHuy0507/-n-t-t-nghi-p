// 1. Load file .env
require("dotenv").config();

// 2. Import thư viện của Google
const { GoogleGenAI } = require("@google/genai");

// 3. Khởi tạo biến 'ai'
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// 4. Hàm chạy API
async function test(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        // Đã sửa lại thành bản Flash
        model,
        contents: "Xin chào, API đã hoạt động chưa?",
      });
      console.log("AI trả lời:", response.text);
      return; // Thành công thì thoát vòng lặp luôn
    } catch (error) {
      if (error.status === 503) {
        console.log(`Máy chủ Google đang bận, đang thử lại lần ${i + 1}...`);
        // Tạm dừng 2 giây trước khi thử lại
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        console.error("Lỗi gọi API khác:", error);
        break; // Lỗi khác thì dừng luôn không thử lại
      }
    }
  }
  console.log("Hệ thống AI hiện đang bảo trì, vui lòng thử lại sau!");
}

// 5. Gọi hàm
test();
