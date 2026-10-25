import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import CompanyMark from "../components/CompanyMark";
import {
  JOB_STATUS_LABELS,
  formatDate,
  formatEmploymentType,
  formatSalary,
} from "../utils/format";
import "../scss/JobDetail.scss";

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role?.toUpperCase();
  const canApply = role === "CANDIDATE";
  const isHR = role === "HR";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin Job:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!canApply || !id) return;

    const fetchMatch = async () => {
      try {
        setMatchLoading(true);
        const response = await api.get(`/jobs/${id}/match`);
        setMatchResult(response.data.data);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Không thể lấy độ phù hợp CV:", error);
        }
        setMatchResult(null);
      } finally {
        setMatchLoading(false);
      }
    };

    fetchMatch();
  }, [canApply, id]);

  const validateFile = (file) => {
    if (!file) return false;
    if (file.type !== "application/pdf") {
      setApplyMessage("CV phải là file PDF");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setApplyMessage("CV không được vượt quá 10MB");
      return false;
    }
    setCvFile(file);
    setApplyMessage("");
    return true;
  };

  const handleApply = async () => {
    if (!canApply) {
      setApplyMessage("Chỉ ứng viên mới có thể ứng tuyển");
      return;
    }

    if (!cvFile) {
      setApplyMessage("Vui lòng tải CV lên trước khi ứng tuyển");
      return;
    }

    try {
      setApplying(true);
      setApplyMessage("");
      const formData = new FormData();
      formData.append("jobId", job._id);
      formData.append("coverLetter", coverLetter);
      formData.append("cv", cvFile);
      const response = await api.post("/applications", formData);
      setApplyMessage(response.data.message);
    } catch (error) {
      setApplyMessage(error.response?.data?.message || "Ứng tuyển thất bại");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <p className="page-state">Đang tải...</p>;
  if (!job) {
    return <p className="page-state">Không tìm thấy tin tuyển dụng.</p>;
  }

  const scorePart = (value) =>
    value == null ? "chưa đủ dữ liệu" : `${value}%`;

  return (
    <main className="page job-detail">
      <Link to={isHR ? "/hr/dashboard" : "/jobs"} className="back-link">
        ← {isHR ? "Trang quản lý" : "Danh sách việc làm"}
      </Link>

      <header className="job-detail__head">
        <CompanyMark name={job.company} size={56} />
        <div>
          <h1>{job.title}</h1>
          <p>
            {job.company}
            {job.status === "CLOSED" && (
              <span className="badge badge--closed">
                {JOB_STATUS_LABELS.CLOSED}
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="job-detail__layout">
        <div className="job-detail__main">
          {canApply && (
            <section className="match-panel" aria-live="polite">
              <h2>Mức độ phù hợp với CV của bạn</h2>
              {matchLoading ? (
                <p className="muted">Đang so sánh với CV gần nhất của bạn...</p>
              ) : matchResult ? (
                <>
                  <div className="match-panel__score">
                    <strong>{matchResult.score}%</strong>
                    <p>{matchResult.summary}</p>
                  </div>

                  {matchResult.breakdown && (
                    <dl className="match-panel__breakdown">
                      <div>
                        <dt>Kỹ năng</dt>
                        <dd>{scorePart(matchResult.breakdown.skills)}</dd>
                      </div>
                      <div>
                        <dt>Vai trò</dt>
                        <dd>{scorePart(matchResult.breakdown.role)}</dd>
                      </div>
                      <div>
                        <dt>Kinh nghiệm</dt>
                        <dd>{scorePart(matchResult.breakdown.experience)}</dd>
                      </div>
                    </dl>
                  )}

                  {matchResult.matchedSkills?.length > 0 && (
                    <div className="match-panel__group">
                      <h3>Bạn đã có</h3>
                      <div className="tags tags--ok">
                        {matchResult.matchedSkills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchResult.missingSkills?.length > 0 && (
                    <div className="match-panel__group">
                      <h3>Còn thiếu</h3>
                      <div className="tags tags--missing">
                        {matchResult.missingSkills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchResult.suggestions?.length > 0 && (
                    <div className="match-panel__group">
                      <h3>Nên sửa trong CV</h3>
                      <ul>
                        {matchResult.suggestions.map((suggestion, index) => (
                          <li key={`${suggestion}-${index}`}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="muted">
                  Bạn chưa có CV nào được phân tích.{" "}
                  <Link to="/my-cv" className="link">
                    Tải CV lên
                  </Link>{" "}
                  để xem mức độ phù hợp với vị trí này.
                </p>
              )}
            </section>
          )}

          <section className="job-detail__section">
            <h2>Mô tả công việc</h2>
            <p className="job-description">{job.description}</p>
          </section>

          <section className="job-detail__section">
            <h2>Kỹ năng yêu cầu</h2>
            <div className="tags">
              {(job.skills || []).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>

          {canApply && showApplyForm && (
            <section className="apply-form" id="apply-form">
              <div className="apply-form__head">
                <h2>Ứng tuyển vị trí này</h2>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setShowApplyForm(false)}
                >
                  Đóng
                </button>
              </div>

              <div className="field">
                <label htmlFor="cover-letter">
                  Thư giới thiệu (không bắt buộc)
                </label>
                <textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  placeholder="Vài dòng về bạn và lý do bạn phù hợp với công việc..."
                  rows="6"
                />
              </div>

              <div
                className={`file-drop ${cvFile ? "has-file" : ""}`}
                onDrop={(event) => {
                  event.preventDefault();
                  validateFile(event.dataTransfer.files[0]);
                }}
                onDragOver={(event) => event.preventDefault()}
              >
                {cvFile ? (
                  <>
                    <strong>{cvFile.name}</strong>
                    <span>{(cvFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    <label className="link" htmlFor="cv-file">
                      Chọn file khác
                    </label>
                  </>
                ) : (
                  <>
                    <strong>Kéo file CV vào đây</strong>
                    <span>
                      hoặc{" "}
                      <label className="link" htmlFor="cv-file">
                        chọn từ máy
                      </label>{" "}
                      · PDF, tối đa 10 MB
                    </span>
                  </>
                )}
                <input
                  id="cv-file"
                  type="file"
                  accept=".pdf"
                  onChange={(event) => validateFile(event.target.files[0])}
                  hidden
                />
              </div>

              <div className="apply-form__actions">
                <button
                  className="btn"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? "Đang gửi..." : "Gửi hồ sơ"}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => setShowApplyForm(false)}
                >
                  Hủy
                </button>
              </div>

              {applyMessage && <p className="notice">{applyMessage}</p>}
            </section>
          )}
        </div>

        <aside className="job-facts">
          <dl>
            <div>
              <dt>Mức lương</dt>
              <dd className="job-facts__salary">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </dd>
            </div>
            <div>
              <dt>Địa điểm</dt>
              <dd>{job.location || "Chưa rõ"}</dd>
            </div>
            <div>
              <dt>Hình thức</dt>
              <dd>{formatEmploymentType(job.employmentType)}</dd>
            </div>
            {job.createdAt && (
              <div>
                <dt>Ngày đăng</dt>
                <dd>{formatDate(job.createdAt)}</dd>
              </div>
            )}
            <div>
              <dt>Người đăng</dt>
              <dd>
                {job.createdBy?.name || "Nhà tuyển dụng"}
                {job.createdBy?.email && <small>{job.createdBy.email}</small>}
              </dd>
            </div>
          </dl>
          {canApply && job.status !== "CLOSED" && (
            <button
              className="btn job-facts__apply"
              onClick={() => {
                setShowApplyForm(true);
                setTimeout(
                  () =>
                    document
                      .getElementById("apply-form")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  0,
                );
              }}
            >
              Ứng tuyển
            </button>
          )}
          {!user && (
            <p className="job-facts__hint">
              <Link to="/login" className="link">
                Đăng nhập
              </Link>{" "}
              bằng tài khoản ứng viên để nộp hồ sơ.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

export default JobDetail;
