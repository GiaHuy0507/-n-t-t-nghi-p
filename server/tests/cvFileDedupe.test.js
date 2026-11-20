const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const CV = require("../src/models/CV");
const { saveUploadedCV } = require("../src/services/cvFileService");

const originalCVFindOne = CV.findOne;
const originalCVFind = CV.find;
const originalCVCreate = CV.create;

test("duplicate CV upload reuses the existing record and removes the temp file", async () => {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "cv-upload-"));
  const filePath = path.join(tempDirectory, "duplicate.pdf");
  const fileContents = Buffer.from("same CV content");
  const expectedHash = crypto
    .createHash("sha256")
    .update(fileContents)
    .digest("hex");
  const existingCV = { _id: "existing-cv", fileHash: expectedHash };

  await fs.writeFile(filePath, fileContents);
  CV.findOne = async (query) => {
    assert.deepEqual(query, {
      candidate: "candidate-id",
      fileHash: expectedHash,
    });
    return existingCV;
  };
  CV.find = async () => {
    assert.fail("Should not scan legacy CVs when a hashed duplicate exists");
  };
  CV.create = async () => {
    assert.fail("Should not create a second CV record");
  };

  try {
    const result = await saveUploadedCV({
      candidate: "candidate-id",
      file: {
        path: filePath,
        filename: "duplicate.pdf",
        originalname: "duplicate.pdf",
      },
    });

    assert.equal(result.cv, existingCV);
    assert.equal(result.isDuplicate, true);
    await assert.rejects(fs.access(filePath), { code: "ENOENT" });
  } finally {
    CV.findOne = originalCVFindOne;
    CV.find = originalCVFind;
    CV.create = originalCVCreate;
    await fs.rm(tempDirectory, { recursive: true, force: true });
  }
});

test("CV trùng nhưng file cũ đã mất: dùng file vừa tải lên thay thế", async () => {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "cv-upload-"));
  const filePath = path.join(tempDirectory, "new-upload.pdf");
  await fs.writeFile(filePath, Buffer.from("same CV content, old file lost"));

  let saved = false;
  const existingCV = {
    _id: "existing-cv",
    filePath: path.join(tempDirectory, "da-mat", "old.pdf"),
    fileName: "old.pdf",
    extractedText: "Nguyễn Văn A",
    save: async () => {
      saved = true;
    },
  };
  CV.findOne = async () => existingCV;
  CV.create = async () => assert.fail("Không được tạo bản ghi CV thứ hai");

  try {
    const result = await saveUploadedCV({
      candidate: "candidate-id",
      file: { path: filePath, filename: "new-upload.pdf", originalname: "cv.pdf" },
    });

    assert.equal(result.cv, existingCV);
    assert.equal(result.isDuplicate, true);
    assert.equal(existingCV.fileName, "new-upload.pdf");
    assert.notEqual(existingCV.filePath, path.join(tempDirectory, "da-mat", "old.pdf"));
    await fs.access(existingCV.filePath); // file mới đã nằm ở chỗ lưu chính thức
    assert.equal(existingCV.extractedText, "Nguyễn Văn A");
    assert.ok(saved, "phải lưu lại đường dẫn file mới");
  } finally {
    CV.findOne = originalCVFindOne;
    CV.create = originalCVCreate;
    await fs.rm(existingCV.filePath, { force: true });
    await fs.rm(tempDirectory, { recursive: true, force: true });
  }
});
