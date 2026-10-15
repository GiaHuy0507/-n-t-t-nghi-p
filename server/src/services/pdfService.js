const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  await parser.destroy();

  const text = result.text.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "").trim();
  return text.replace(/\s/g, "").length >= 40 ? text : "";
};

module.exports = {
  extractTextFromPDF,
};
