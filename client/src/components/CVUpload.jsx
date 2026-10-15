import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../scss/CVUpLoad.scss";

const STORAGE_KEY = "cv-upload-result";

const readStoredResult = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { result: null, matchedJobs: [] };
  } catch {
    return { result: null, matchedJobs: [] };
  }
};

const CVUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const storedState = readStoredResult();
  const [result, setResult] = useState(storedState.result);
  const [matchedJobs, setMatchedJobs] = useState(storedState.matchedJobs);
  const [showAnalysis, setShowAnalysis] = useState(Boolean(storedState.result));
  const [error, setError] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [targetField, setTargetField] = useState("experience");
  const [draftContent, setDraftContent] = useState("");
  const analyzedSkills = Array.isArray(result?.skills) ? result.skills : [];
  const missingInformation = Array.isArray(result?.missingInformation)
    ? result.missingInformation
    : [];

  const getCurrentSection = (field) => {
    if (!result) return "Chưa có dữ liệu phân tích.";
    if (field === "summary") return result.summary || "Chưa có nội dung.";
    if (field === "skills") {
      return Array.isArray(result.skills) && result.skills.length
        ? result.skills.join("\n")
        : "Chưa có kỹ năng được trích xuất.";
    }
    if (field === "experience") {
      return (
        (result.workExperience || [])
          .map((experience) =>
            [
              [experience.position, experience.company, experience.duration]
                .filter(Boolean)
                .join(" | "),
              ...(experience.highlights || []),
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .filter(Boolean)
          .join("\n\n") || "Chưa có kinh nghiệm được trích xuất."
      );
    }
    return (
      (result.education || [])
        .map((education) =>
          [education.degree, education.major, education.school]
            .filter(Boolean)
            .join(" | "),
        )
        .join("\n") || "Chưa có học vấn được trích xuất."
    );
  };

  const openSuggestionDraft = (suggestion) => {
    setActiveSuggestion(suggestion);
    setTargetField("experience");
    setDraftContent(suggestion.example || "");
  };

  const applySuggestionDraft = () => {
    const content = draftContent.trim();
    if (!activeSuggestion || !content) return;

    const originalCvText = result.extractedText?.trim()
      ? result.extractedText.trim()
      : [
          result.summary && `Tóm tắt\n${result.summary}`,
          result.skills?.length && `Kỹ năng\n${result.skills.join("\n")}`,
          result.workExperience?.length &&
            `Kinh nghiệm\n${result.workExperience
              .map((experience) =>
                [
                  [experience.position, experience.company, experience.duration]
                    .filter(Boolean)
                    .join(" | "),
                  ...(experience.highlights || []),
                ]
                  .filter(Boolean)
                  .join("\n"),
              )
              .join("\n\n")}`,
          result.education?.length &&
            `Học vấn\n${result.education
              .map((education) =>
                [education.degree, education.major, education.school]
                  .filter(Boolean)
                  .join(" | "),
              )
              .join("\n")}`,
          result.languages?.length &&
            `Ngoại ngữ\n${result.languages.join("\n")}`,
          result.certifications?.length &&
            `Chứng chỉ\n${result.certifications.join("\n")}`,
        ]
          .filter(Boolean)
          .join("\n\n");

    const sourceData = {
      fullName: result.personalInfo?.fullName || "",
      title: result.workExperience?.[0]?.position || "",
      email: result.personalInfo?.email || "",
      phone: result.personalInfo?.phone || "",
      location: result.personalInfo?.location || "",
      summary: result.summary || "",
      skills: (result.skills || []).join("\n"),
      experience: (result.workExperience || [])
        .map((experience) =>
          [
            [experience.position, experience.company, experience.duration]
              .filter(Boolean)
              .join(" | "),
            ...(experience.highlights || []),
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .filter(Boolean)
        .join("\n\n"),
      education: (result.education || [])
        .map((education) =>
          [education.degree, education.major, education.school]
            .filter(Boolean)
            .join(" | "),
        )
        .join("\n"),
      originalCvText,
      includeOriginalCvText: false,
    };
    const appliedContent =
      targetField === "experience" && sourceData.experience
        ? `${sourceData.experience.trim()}\n${content}`
        : content;

    navigate("/create-cv", {
      state: {
        aiDraft: {
          targetField,
          content: appliedContent,
          issue: activeSuggestion.issue,
          sourceData,
        },
      },
    });
  };

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ result, matchedJobs }),
    );
  }, [result, matchedJobs]);

  useEffect(() => {
    if (!result && matchedJobs.length === 0) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [result, matchedJobs]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("CV không được vượt quá 10MB");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  // Thuật toán Matching: Tính % trùng khớp giữa Kỹ năng CV và Yêu cầu Job
  const calculateMatchScore = (cvSkills, job) => {
    if (!cvSkills || cvSkills.length === 0) return 0;

    const jobContent = `
      ${job.title || ""} 
      ${job.description || ""} 
      ${Array.isArray(job.requirements) ? job.requirements.join(" ") : job.requirements || ""}
      ${Array.isArray(job.skills) ? job.skills.join(" ") : job.skills || ""}
    `.toLowerCase();

    let matchedCount = 0;

    cvSkills.forEach((skill) => {
      const cleanSkill = skill.toLowerCase().trim();
      if (cleanSkill && jobContent.includes(cleanSkill)) {
        matchedCount++;
      }
    });

    const percentage = Math.round((matchedCount / cvSkills.length) * 100);
    return percentage;
  };

  const fetchAndMatchJobs = async (skills) => {
    try {
      const response = await fetch("http://localhost:3000/api/jobs");
      const data = await response.json();

      const jobList = Array.isArray(data) ? data : data.data || data.jobs || [];

      const rankedJobs = jobList
        .map((job) => ({
          ...job,
          matchScore: calculateMatchScore(skills, job),
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      setMatchedJobs(rankedJobs.slice(0, 5));
    } catch {
      console.error("Lỗi khi tải danh sách việc làm để matching:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn một file PDF trước khi tải lên!");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/cv/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const analysis = {
          ...data.cv.aiAnalysis,
          extractedText: data.cv.extractedText || "",
        };
        setResult(analysis);
        setMatchedJobs([]);
        setShowAnalysis(true);

        if (analysis.skills && analysis.skills.length > 0) {
          await fetchAndMatchJobs(analysis.skills);
        }
      } else {
        setError(data.message || "Có lỗi xảy ra khi upload CV.");
      }
    } catch {
      setError("Không thể kết nối đến Server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-container">
      <div className="upload-zone">
        <h3 style={{ margin: "0 0 15px 0", color: "#111827" }}>
          Tải CV của bạn lên hệ thống
        </h3>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="file-input"
        />
        <small>Chỉ nhận file PDF, tối đa 10MB</small>
        <br />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn-upload"
        >
          {loading
            ? "AI Đang Phân Tích & Tìm Việc..."
            : "Phân Tích & Gợi Ý Việc Làm"}
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {result && (
        <div className="ai-result">
          <div className="result-heading">
            <h2 className="result-title">Kết Quả AI Phân Tích</h2>
            <button
              type="button"
              className="toggle-analysis-button"
              aria-expanded={showAnalysis}
              onClick={() => setShowAnalysis((visible) => !visible)}
            >
              {showAnalysis ? "Ẩn phân tích" : "Xem phân tích"}
            </button>
          </div>

          {showAnalysis && (
            <div className="ai-result-content">
              <div className="info-text">
                <strong>Tóm tắt hồ sơ:</strong> {result.summary}
              </div>

              <div className="info-text">
                <strong>Kinh nghiệm làm việc:</strong> {result.experienceYears}{" "}
                năm
              </div>

              {(result.strengths || []).length > 0 && (
                <section className="review-section strengths-section">
                  <h3>Điểm mạnh có trong CV</h3>
                  <ul>
                    {result.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </section>
              )}

              {(result.improvementSuggestions || []).length > 0 && (
                <section className="review-section suggestions-section">
                  <h3>Gợi ý cải thiện CV</h3>
                  {result.improvementSuggestions.map((suggestion, index) => (
                    <article className="suggestion-item" key={index}>
                      <h4>{suggestion.issue}</h4>
                      <p>
                        <strong>Căn cứ:</strong> {suggestion.evidence}
                      </p>
                      <p>
                        <strong>Nên sửa:</strong> {suggestion.recommendation}
                      </p>
                      <p>
                        <strong>Ví dụ:</strong> {suggestion.example}
                      </p>
                      <button
                        type="button"
                        className="apply-ai-suggestion"
                        onClick={() => openSuggestionDraft(suggestion)}
                      >
                        So sánh và chỉnh sửa
                      </button>
                    </article>
                  ))}
                </section>
              )}

              {activeSuggestion && (
                <section className="ai-draft-comparison" aria-live="polite">
                  <div className="ai-draft-heading">
                    <div>
                      <h3>Đối chiếu nội dung trước khi áp dụng</h3>
                      <p>{activeSuggestion.issue}</p>
                    </div>
                    <button
                      type="button"
                      className="close-ai-draft"
                      onClick={() => setActiveSuggestion(null)}
                      aria-label="Đóng phần đối chiếu"
                    >
                      Đóng
                    </button>
                  </div>

                  <label className="ai-target-field">
                    Áp dụng vào phần CV
                    <select
                      value={targetField}
                      onChange={(event) => setTargetField(event.target.value)}
                    >
                      <option value="summary">Giới thiệu bản thân</option>
                      <option value="experience">Kinh nghiệm làm việc</option>
                      <option value="skills">Kỹ năng</option>
                      <option value="education">Học vấn</option>
                    </select>
                  </label>

                  <div className="ai-comparison-columns">
                    <article className="ai-comparison-panel original-panel">
                      <h4>Nội dung hiện tại trong CV</h4>
                      <pre>{getCurrentSection(targetField)}</pre>
                    </article>
                    <label className="ai-comparison-panel draft-panel">
                      <span className="comparison-panel-title">
                        Bản nháp AI, có thể chỉnh sửa
                      </span>
                      <textarea
                        rows={8}
                        value={draftContent}
                        onChange={(event) =>
                          setDraftContent(event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <p className="ai-draft-disclaimer">
                    Nội dung chỉ được đưa vào trình tạo CV sau khi bạn xác nhận.
                    Kiểm tra lại thông tin trước khi lưu hoặc xuất PDF.
                  </p>
                  <button
                    type="button"
                    className="confirm-ai-draft"
                    onClick={applySuggestionDraft}
                    disabled={!draftContent.trim()}
                  >
                    Áp dụng vào trình tạo CV
                  </button>
                </section>
              )}

              <div style={{ marginTop: "20px" }}>
                <strong>Kỹ năng phát hiện:</strong>
                <ul className="skill-badges">
                  {analyzedSkills.length > 0 ? (
                    analyzedSkills.map((skill, index) => (
                      <li key={index} className="badge">
                        {skill}
                      </li>
                    ))
                  ) : (
                    <li
                      className="badge"
                      style={{ background: "#f1f5f9", color: "#64748b" }}
                    >
                      Chưa cập nhật
                    </li>
                  )}
                </ul>
              </div>

              {missingInformation.length > 0 && (
                <div className="warning-box">
                  <h4 className="warning-title">AI gợi ý - Cần bổ sung:</h4>
                  <ul className="warning-list">
                    {missingInformation.map((info, index) => (
                      <li key={index}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ĐÃ SỬA CÁC CLASS Ở ĐÂY CHO KHỚP VỚI SCSS */}
              <div className="job-recommendations">
                <h3 className="recommendation-title">
                  Gợi Ý Việc Làm Phù Hợp Dành Cho Bạn
                </h3>

                {matchedJobs.length > 0 ? (
                  <div className="cv-job-grid">
                    {matchedJobs.map((job) => (
                      <div key={job._id || job.id} className="cv-job-card">
                        <div className="cv-job-info">
                          <h4>{job.title}</h4>
                          <div className="job-meta">
                            Công ty: {job.company || "Công ty tuyển dụng"}{" "}
                            &nbsp;|&nbsp; Địa điểm: {job.location || "Việt Nam"}{" "}
                            &nbsp;|&nbsp; Mức lương:{" "}
                            {job.salary || "Thỏa thuận"}
                          </div>
                        </div>

                        <div className="match-badge-container">
                          <span
                            className={`match-score ${
                              job.matchScore >= 50
                                ? "score-high"
                                : "score-medium"
                            }`}
                          >
                            Độ khớp: {job.matchScore}%
                          </span>
                          <br />
                          <Link
                            to={`/jobs/${job._id || job.id}`}
                            className="btn-view-job"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                    Hiện chưa tìm thấy công việc nào phù hợp với các kỹ năng
                    trích xuất từ CV của bạn.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CVUpload;
