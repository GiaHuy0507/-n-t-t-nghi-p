require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const runGeminiCheck = async () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình trong server/.env");
  }

  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: "Xin chào, API Gemini đã hoạt động chưa?",
      });
      console.log(`Gemini (${model}) trả lời:`, response.text);
      return;
    } catch (error) {
      if (error.status !== 503 || attempt === 3) throw error;
      console.log(`Gemini đang bận, thử lại lần ${attempt + 1}/3...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

runGeminiCheck().catch((error) => {
  console.error("Kiểm tra Gemini thất bại:", error.message);
  process.exitCode = 1;
});