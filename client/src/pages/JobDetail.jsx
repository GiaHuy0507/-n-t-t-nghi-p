import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
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

  if (loading) return <p className="job-detail-state">Đang tải...</p>;
  if (!job) {
    return <p className="job-detail-state">Không tìm thấy tin tuyển dụng.</p>;
  }

  return (
    <main className="job-detail-page">
      <Link to={isHR ? "/hr/dashboard" : "/jobs"} className="back-link">
        {isHR ? "Quay lại trang quản lý" : "Quay lại danh sách việc làm"}
      </Link>

      <section className="job-detail-hero">
        <div>
          {!isHR && <span className="job-detail-eyebrow">CƠ HỘI VIỆC LÀM</span>}
          <h1>{job.title}</h1>
          <p className="job-company">{job.company}</p>
        </div>
        {canApply && (
          <button
            className="apply-hero-button"
            onClick={() => setShowApplyForm(true)}
          >
            Ứng tuyển ngay
          </button>
        )}
      </section>

      {canApply && (
        <section className="detail-section" style={{ marginTop: "1rem" }}>
          <h2>AI đánh giá độ phù hợp</h2>
          {matchLoading ? (
            <p>Đang đánh giá hồ sơ của bạn...</p>
          ) : matchResult ? (
            <div className="detail-skills" style={{ display: "block" }}>
              <strong style={{ fontSize: "1.2rem" }}>
                {matchResult.score}%
              </strong>
              <p>{matchResult.summary}</p>
              {matchResult.breakdown && (
                <p>
                  <strong>Điểm thành phần:</strong> Kỹ năng{" "}
                  {matchResult.breakdown.skills == null
                    ? "chưa đủ dữ liệu"
                    : `${matchResult.breakdown.skills}%`}{" "}
                  · Vai trò{" "}
                  {matchResult.breakdown.role == null
                    ? "chưa đủ dữ liệu"
                    : `${matchResult.breakdown.role}%`}{" "}
                  · Kinh nghiệm{" "}
                  {matchResult.breakdown.experience == null
                    ? "chưa đủ dữ liệu"
                    : `${matchResult.breakdown.experience}%`}
                </p>
              )}
              {matchResult.matchedSkills?.length > 0 && (
                <div>
                  <strong>Kỹ năng phù hợp:</strong>
                  <div
                    className="detail-skills"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {matchResult.matchedSkills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {matchResult.missingSkills?.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <strong>Kỹ năng cần bổ sung:</strong>
                  <div
                    className="detail-skills"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {matchResult.missingSkills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {matchResult.suggestions?.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <strong>Gợi ý cải thiện CV:</strong>
                  <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
                    {matchResult.suggestions.map((suggestion, index) => (
                      <li key={`${suggestion}-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>Upload CV để AI đánh giá mức độ phù hợp với công việc này.</p>
          )}
        </section>
      )}

      <div className="job-detail-layout">
        <div className="job-detail-main">
          <section className="job-info-grid">
            <div>
              <span className="info-label">Địa điểm</span>
              <strong>{job.location}</strong>
            </div>
            <div>
              <span className="info-label">Mức lương</span>
              <strong>
                {job.salaryMin.toLocaleString("vi-VN")} -{" "}
                {job.salaryMax.toLocaleString("vi-VN")} VNĐ
              </strong>
            </div>
            <div>
              <span className="info-label">Hình thức</span>
              <strong>{job.employmentType}</strong>
            </div>
          </section>

          <section className="detail-section">
            <h2>Mô tả công việc</h2>
            <p className="job-description">{job.description}</p>
          </section>

          <section className="detail-section">
            <h2>Kỹ năng yêu cầu</h2>
            <div className="detail-skills">
              {(job.skills || []).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>
        </div>

        <aside className="employer-card">
          <span className="card-eyebrow">NHÀ TUYỂN DỤNG</span>
          <h2>{job.createdBy?.name || "Nhà tuyển dụng"}</h2>
          <p>{job.createdBy?.email || "Chưa cập nhật email"}</p>
          {canApply && (
            <button onClick={() => setShowApplyForm(true)}>Gửi hồ sơ</button>
          )}
        </aside>
      </div>

      {canApply && showApplyForm && (
        <section className="application-form-card">
          <div className="application-form-header">
            <div>
              <span className="card-eyebrow">ỨNG TUYỂN</span>
              <h2>Ứng tuyển vị trí này</h2>
            </div>
            <button
              className="close-form-button"
              onClick={() => setShowApplyForm(false)}
            >
              Đóng
            </button>
          </div>

          <label className="form-label" htmlFor="cover-letter">
            Thư giới thiệu
          </label>
          <textarea
            id="cover-letter"
            value={coverLetter}
            onChange={(event) => setCoverLetter(event.target.value)}
            placeholder="Giới thiệu ngắn về bạn và lý do bạn phù hợp với công việc..."
            rows="6"
          />

          <div
            className="cv-drop-zone"
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
              </>
            ) : (
              <>
                <strong>Tải CV của bạn lên</strong>
                <span>Kéo thả file vào đây hoặc chọn từ máy tính</span>
                <label className="file-picker" htmlFor="cv-file">
                  Chọn file PDF
                </label>
                <input
                  id="cv-file"
                  type="file"
                  accept=".pdf"
                  onChange={(event) => validateFile(event.target.files[0])}
                  hidden
                />
                <small>Chỉ nhận file PDF, tối đa 10MB</small>
              </>
            )}
          </div>

          <div className="application-actions">
            <button
              className="submit-application-button"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? "Đang gửi..." : "Gửi hồ sơ"}
            </button>
            <button
              className="cancel-application-button"
              onClick={() => setShowApplyForm(false)}
            >
              Hủy
            </button>
          </div>

          {applyMessage && <p className="apply-message">{applyMessage}</p>}
        </section>
      )}
    </main>
  );
}

export default JobDetail;
