import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatSalary } from "../utils/format";
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
    } catch (err) {
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
    <main className="page cv-page">
      <header className="page-head">
        <div>
          <h1>Phân tích CV</h1>
          <p>
            Tải CV dạng PDF để xem nhận xét chi tiết và những vị trí gần với kỹ
            năng của bạn.
          </p>
        </div>
      </header>

      <section className="cv-upload">
        <label className={`cv-upload__drop ${file ? "has-file" : ""}`}>
          <input type="file" accept=".pdf" onChange={handleFileChange} />
          <strong>{file ? file.name : "Chọn file CV"}</strong>
          <span>
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB · bấm để đổi file`
              : "PDF, tối đa 10 MB"}
          </span>
        </label>
        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn btn-upload"
        >
          {loading ? "Đang đọc CV..." : "Phân tích CV"}
        </button>
      </section>

      {loading && (
        <p className="cv-upload__wait">
          Việc đọc CV thường mất 10–30 giây, bạn vui lòng giữ trang này.
        </p>
      )}

      {error && <p className="notice notice--error cv-error">{error}</p>}

      {result && (
        <section className="cv-result">
          <div className="cv-result__head">
            <h2>Kết quả</h2>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              aria-expanded={showAnalysis}
              onClick={() => setShowAnalysis((visible) => !visible)}
            >
              {showAnalysis ? "Thu gọn" : "Mở rộng"}
            </button>
          </div>

          {showAnalysis && (
            <div className="cv-result__body">
              <div className="cv-summary">
                <p>{result.summary}</p>
                <dl>
                  <div>
                    <dt>Kinh nghiệm</dt>
                    <dd>{result.experienceYears} năm</dd>
                  </div>
                  <div>
                    <dt>Kỹ năng tìm thấy</dt>
                    <dd>{analyzedSkills.length}</dd>
                  </div>
                </dl>
              </div>

              <div className="cv-block">
                <h3>Kỹ năng</h3>
                {analyzedSkills.length > 0 ? (
                  <ul className="tags">
                    {analyzedSkills.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Không tìm thấy kỹ năng nào trong CV.</p>
                )}
              </div>

              {(result.strengths || []).length > 0 && (
                <div className="cv-block">
                  <h3>Điểm mạnh</h3>
                  <ul className="cv-list">
                    {result.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {missingInformation.length > 0 && (
                <div className="cv-block">
                  <h3>Thông tin còn thiếu</h3>
                  <ul className="cv-list cv-list--missing">
                    {missingInformation.map((info, index) => (
                      <li key={index}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(result.improvementSuggestions || []).length > 0 && (
                <div className="cv-block">
                  <h3>Nên sửa</h3>
                  {result.improvementSuggestions.map((suggestion, index) => (
                    <article className="suggestion" key={index}>
                      <h4>{suggestion.issue}</h4>
                      <dl>
                        <dt>Căn cứ</dt>
                        <dd>{suggestion.evidence}</dd>
                        <dt>Cách sửa</dt>
                        <dd>{suggestion.recommendation}</dd>
                        <dt>Ví dụ</dt>
                        <dd className="suggestion__example">
                          {suggestion.example}
                        </dd>
                      </dl>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => openSuggestionDraft(suggestion)}
                      >
                        Sửa phần này
                      </button>
                    </article>
                  ))}
                </div>
              )}

              {activeSuggestion && (
                <section className="draft-compare" aria-live="polite">
                  <div className="draft-compare__head">
                    <div>
                      <h3>So sánh trước khi áp dụng</h3>
                      <p>{activeSuggestion.issue}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setActiveSuggestion(null)}
                      aria-label="Đóng phần so sánh"
                    >
                      Đóng
                    </button>
                  </div>

                  <label className="field draft-compare__target">
                    <span>Áp dụng vào phần</span>
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

                  <div className="draft-compare__cols">
                    <div>
                      <h4>Đang có trong CV</h4>
                      <pre>{getCurrentSection(targetField)}</pre>
                    </div>
                    <label className="field">
                      <span>Bản sửa (bạn có thể chỉnh)</span>
                      <textarea
                        rows={8}
                        value={draftContent}
                        onChange={(event) =>
                          setDraftContent(event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <p className="draft-compare__note">
                    Nội dung chỉ được đưa sang trang tạo CV sau khi bạn bấm xác
                    nhận. Hãy đọc lại trước khi lưu hoặc xuất PDF.
                  </p>
                  <button
                    type="button"
                    className="btn"
                    onClick={applySuggestionDraft}
                    disabled={!draftContent.trim()}
                  >
                    Mở trong trang tạo CV
                  </button>
                </section>
              )}

              <div className="cv-block">
                <h3>Việc làm gần với CV này</h3>
                {matchedJobs.length > 0 ? (
                  <ul className="cv-jobs">
                    {matchedJobs.map((job) => (
                      <li key={job._id || job.id}>
                        <div>
                          <Link
                            to={`/jobs/${job._id || job.id}`}
                            className="data-table__title"
                          >
                            {job.title}
                          </Link>
                          <small>
                            {job.company || "Công ty tuyển dụng"} ·{" "}
                            {job.location || "Việt Nam"} ·{" "}
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </small>
                        </div>
                        <span
                          className={`cv-jobs__score ${job.matchScore >= 50 ? "is-high" : ""}`}
                        >
                          {job.matchScore}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">
                    Chưa có tin tuyển dụng nào trùng với các kỹ năng trong CV.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default CVUpload;
