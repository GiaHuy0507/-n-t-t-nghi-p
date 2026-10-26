import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardHeader from "../components/DashboardHeader";
import { formatDate } from "../utils/format";
import "../scss/HRApplications.scss";

const statusOptions = [
  { value: "PENDING", label: "Đang chờ" },
  { value: "SHORTLISTED", label: "Đạt vòng CV" },
  { value: "INTERVIEW", label: "Mời phỏng vấn" },
  { value: "REJECTED", label: "Không đạt" },
  { value: "ACCEPTED", label: "Đã tuyển" },
];

const statusLabels = Object.fromEntries(
  statusOptions.map(({ value, label }) => [value, label]),
);

function HRApplications() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notes, setNotes] = useState({});
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [retryingAIId, setRetryingAIId] = useState(null);
  const [savedNoteId, setSavedNoteId] = useState(null);
  const [cvLoadingId, setCvLoadingId] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [shortlist, setShortlist] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [shortlistRevision, setShortlistRevision] = useState(0);
  const [reviewLoadingId, setReviewLoadingId] = useState(null);
  const [reviewErrors, setReviewErrors] = useState({});

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get("/applications/hr");
      const nextApplications = response.data.data || [];
      setApplications(nextApplications);
      setNotes((currentNotes) => {
        const nextNotes = { ...currentNotes };
        nextApplications.forEach((application) => {
          if (nextNotes[application._id] === undefined) {
            nextNotes[application._id] = application.hrNote || "";
          }
        });
        return nextNotes;
      });
      setLoadError("");
    } catch (error) {
      console.error("Lỗi lấy danh sách ứng viên:", error);
      setLoadError("Không thể tải danh sách ứng viên. Vui lòng thử tải lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (!applications.length) {
      setShortlist([]);
      setSelectedJobId("");
      return;
    }

    const firstJobId = applications[0]?.job?._id || "";
    if (!selectedJobId && firstJobId) {
      setSelectedJobId(firstJobId);
      return;
    }

    if (
      selectedJobId &&
      applications.some((application) => application.job?._id === selectedJobId)
    ) {
      return;
    }

    if (firstJobId) {
      setSelectedJobId(firstJobId);
    }
  }, [applications, selectedJobId]);

  useEffect(() => {
    if (!selectedJobId) {
      setShortlist([]);
      return;
    }

    const fetchShortlist = async () => {
      setShortlistLoading(true);
      try {
        const response = await api.get(
          `/applications/hr/shortlist/${selectedJobId}`,
        );
        setShortlist(response.data.data?.shortlist || []);
      } catch (error) {
        console.error("Lỗi lấy shortlist AI:", error);
        setShortlist([]);
      } finally {
        setShortlistLoading(false);
      }
    };

    fetchShortlist();
  }, [selectedJobId, shortlistRevision]);

  useEffect(() => {
    return () => {
      if (cvPreview?.url) URL.revokeObjectURL(cvPreview.url);
    };
  }, [cvPreview?.url]);

  const handleStatusChange = async (id, status) => {
    setSavingStatusId(id);
    try {
      const response = await api.patch(`/applications/${id}/status`, {
        status,
      });
      setApplications((current) =>
        current.map((application) =>
          application._id === id
            ? { ...application, status: response.data.data.status }
            : application,
        ),
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSavingStatusId(null);
    }
  };

  const handleSaveNote = async (id) => {
    setSavingNoteId(id);
    setSavedNoteId(null);
    try {
      await api.patch(`/applications/${id}/review-note`, {
        hrNote: notes[id] || "",
      });
      setSavedNoteId(id);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu ghi chú");
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleViewCV = async (application) => {
    setCvLoadingId(application._id);
    try {
      const response = await api.get(`/applications/${application._id}/cv`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      setCvPreview({
        url,
        name: application.cv?.originalName || "CV ứng viên",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Không thể mở CV này");
    } finally {
      setCvLoadingId(null);
    }
  };

  // Tóm tắt hồ sơ và câu hỏi phỏng vấn do AI gợi ý; refresh = tạo lại
  const handleAIReview = async (application, refresh = false) => {
    setReviewLoadingId(application._id);
    setReviewErrors((current) => ({ ...current, [application._id]: "" }));
    try {
      const response = await api.post(
        `/applications/hr/${application._id}/ai-review`,
        { refresh },
      );
      setApplications((current) =>
        current.map((item) =>
          item._id === application._id
            ? { ...item, aiReview: response.data.data }
            : item,
        ),
      );
    } catch (error) {
      setReviewErrors((current) => ({
        ...current,
        [application._id]:
          error.response?.data?.message || "Chưa tạo được gợi ý, thử lại sau.",
      }));
    } finally {
      setReviewLoadingId(null);
    }
  };

  const handleRetryAIAnalysis = async (application) => {
    setRetryingAIId(application._id);
    setApplications((current) =>
      current.map((item) =>
        item._id === application._id
          ? { ...item, cv: { ...item.cv, aiStatus: "PENDING" } }
          : item,
      ),
    );

    try {
      await api.post(`/applications/hr/${application._id}/retry-ai-analysis`);
      await fetchApplications();
      setShortlistRevision((revision) => revision + 1);
    } catch (error) {
      await fetchApplications();
      alert(error.response?.data?.message || "Không thể phân tích lại CV");
    } finally {
      setRetryingAIId(null);
    }
  };

  const filteredApplications = applications.filter((application) => {
    const searchText =
      `${application.candidate?.name || ""} ${application.candidate?.email || ""} ${application.job?.title || ""}`.toLowerCase();
    return (
      (statusFilter === "ALL" || application.status === statusFilter) &&
      searchText.includes(search.trim().toLowerCase())
    );
  });

  const availableJobs = applications
    .map((application) => application.job)
    .filter(
      (job, index, arr) =>
        !!job && arr.findIndex((item) => item?._id === job?._id) === index,
    );

  if (loading) {
    return <p className="page-state">Đang tải hồ sơ...</p>;
  }

  return (
    <>
      <DashboardHeader
        area="Nhà tuyển dụng"
        userName={user?.name || "HR"}
        onLogout={handleLogout}
        items={[
          { label: "Tổng quan", to: "/hr/dashboard" },
          { label: "Tin tuyển dụng", to: "/hr/jobs" },
          { label: "Ứng viên", to: "/hr/applications" },
        ]}
      />

      <main className="page hr-applications-page">
        <header className="page-head">
          <div>
            <h1>Ứng viên</h1>
            <p>
              {applications.length} hồ sơ · xem CV, ghi chú và cập nhật kết quả
              xét duyệt
            </p>
          </div>
        </header>

        {loadError && <p className="notice notice--error">{loadError}</p>}

        <section className="applications-toolbar" aria-label="Lọc hồ sơ">
          <label className="field">
            <span>Tìm ứng viên</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tên, email hoặc vị trí"
            />
          </label>
          <label className="field">
            <span>Trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {availableJobs.length > 0 && (
          <section className="ai-shortlist-panel">
            <div className="ai-shortlist-header">
              <div>
                <h2>Xếp hạng theo mức độ phù hợp</h2>
                <p>Dựa trên kỹ năng, vị trí và số năm kinh nghiệm trong CV.</p>
              </div>
              <select
                className="input"
                aria-label="Chọn tin tuyển dụng"
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
              >
                {availableJobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {shortlistLoading ? (
              <div className="empty">Đang tính điểm...</div>
            ) : shortlist.length === 0 ? (
              <div className="empty">
                Chưa có hồ sơ nào của tin này đủ dữ liệu để xếp hạng.
              </div>
            ) : (
              <div className="shortlist-list">
                {shortlist.map((candidate, index) => (
                  <div key={candidate.applicationId} className="shortlist-item">
                    <div className="shortlist-rank">{index + 1}</div>
                    <div className="shortlist-info">
                      <strong>{candidate.candidateName}</strong>
                      <p>{candidate.candidateEmail}</p>
                      <span>{candidate.summary}</span>
                    </div>
                    <div className="shortlist-score">
                      <strong>{candidate.score}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {applications.length === 0 ? (
          <div className="empty">Chưa có ứng viên ứng tuyển.</div>
        ) : filteredApplications.length === 0 ? (
          <div className="empty">Không tìm thấy hồ sơ phù hợp.</div>
        ) : (
          <div className="application-list">
            {filteredApplications.map((application) => (
              <article key={application._id} className="application-card">
                <div className="application-card-top">
                  <div>
                    <h2>{application.candidate?.name || "Ứng viên"}</h2>
                    <p className="candidate-email">
                      {application.candidate?.email || "Không có email"}
                    </p>
                  </div>
                  <span
                    className={`badge badge--${application.status.toLowerCase()}`}
                  >
                    {statusLabels[application.status] || application.status}
                  </span>
                </div>

                <div className="application-meta">
                  <p>
                    <span>Vị trí</span>
                    <strong>{application.job?.title || "Không rõ"}</strong>
                  </p>
                  <p>
                    <span>Công ty</span>
                    <strong>{application.job?.company || "Không rõ"}</strong>
                  </p>
                  <p>
                    <span>Ngày ứng tuyển</span>
                    <strong>{formatDate(application.createdAt)}</strong>
                  </p>
                </div>

                {application.coverLetter && (
                  <div className="cover-letter">
                    <h3>Thư giới thiệu</h3>
                    <p>{application.coverLetter}</p>
                  </div>
                )}

                <div className="application-actions">
                  <button
                    className="btn view-cv-button"
                    type="button"
                    disabled={cvLoadingId === application._id}
                    onClick={() => handleViewCV(application)}
                  >
                    {cvLoadingId === application._id
                      ? "Đang mở CV..."
                      : "Xem CV"}
                  </button>
                  <label className="status-control">
                    <span>Kết quả</span>
                    <select
                      className="input"
                      value={application.status}
                      disabled={savingStatusId === application._id}
                      onChange={(event) =>
                        handleStatusChange(application._id, event.target.value)
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="ai-analysis-status">
                  <span>
                    Phân tích CV:{" "}
                    {application.cv?.aiStatus === "COMPLETED"
                      ? "đã xong"
                      : application.cv?.aiStatus === "PENDING"
                        ? "đang chờ"
                        : "lỗi"}
                  </span>
                  {application.cv?.aiStatus !== "COMPLETED" && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={retryingAIId === application._id}
                      onClick={() => handleRetryAIAnalysis(application)}
                    >
                      {retryingAIId === application._id
                        ? "Đang phân tích..."
                        : "Phân tích lại"}
                    </button>
                  )}
                </div>

                <section className="ai-review" aria-live="polite">
                  {application.aiReview?.generatedAt ? (
                    <>
                      <div className="ai-review__head">
                        <h3>Gợi ý chuẩn bị phỏng vấn</h3>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          disabled={reviewLoadingId === application._id}
                          onClick={() => handleAIReview(application, true)}
                        >
                          {reviewLoadingId === application._id
                            ? "Đang tạo lại..."
                            : "Tạo lại"}
                        </button>
                      </div>
                      <p className="ai-review__summary">
                        {application.aiReview.summary}
                      </p>
                      <div className="ai-review__cols">
                        {application.aiReview.strengths?.length > 0 && (
                          <div>
                            <h4>Điểm phù hợp</h4>
                            <ul>
                              {application.aiReview.strengths.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {application.aiReview.concerns?.length > 0 && (
                          <div>
                            <h4>Cần làm rõ</h4>
                            <ul>
                              {application.aiReview.concerns.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {application.aiReview.interviewQuestions?.length > 0 && (
                        <>
                          <h4>Câu hỏi phỏng vấn gợi ý</h4>
                          <ol className="ai-review__questions">
                            {application.aiReview.interviewQuestions.map(
                              (item) => (
                                <li key={item.question}>
                                  <strong>{item.question}</strong>
                                  <span>
                                    {item.skill && <em>{item.skill}</em>}
                                    {item.purpose}
                                  </span>
                                </li>
                              ),
                            )}
                          </ol>
                        </>
                      )}
                      <p className="ai-review__note">
                        Gợi ý do AI tạo{" "}
                        {new Date(
                          application.aiReview.generatedAt,
                        ).toLocaleString("vi-VN")}
                        , chỉ để tham khảo. Thông tin cá nhân của ứng viên không
                        được gửi cho AI.
                      </p>
                    </>
                  ) : (
                    <div className="ai-review__empty">
                      <span>
                        Tóm tắt hồ sơ và 5 câu hỏi phỏng vấn dựa trên kỹ năng
                        còn thiếu.
                      </span>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        disabled={
                          reviewLoadingId === application._id ||
                          application.cv?.aiStatus !== "COMPLETED"
                        }
                        title={
                          application.cv?.aiStatus !== "COMPLETED"
                            ? "Cần phân tích CV xong trước"
                            : undefined
                        }
                        onClick={() => handleAIReview(application)}
                      >
                        {reviewLoadingId === application._id
                          ? "AI đang đọc hồ sơ..."
                          : "Gợi ý phỏng vấn bằng AI"}
                      </button>
                    </div>
                  )}
                  {reviewErrors[application._id] && (
                    <p className="notice notice--error">
                      {reviewErrors[application._id]}
                    </p>
                  )}
                </section>

                <div className="review-note">
                  <label htmlFor={`hr-note-${application._id}`}>
                    Ghi chú <span>chỉ HR thấy</span>
                  </label>
                  <textarea
                    id={`hr-note-${application._id}`}
                    maxLength={2000}
                    rows={3}
                    value={notes[application._id] || ""}
                    onChange={(event) => {
                      setNotes((current) => ({
                        ...current,
                        [application._id]: event.target.value,
                      }));
                      setSavedNoteId(null);
                    }}
                    placeholder="Nhận xét về kinh nghiệm, kỹ năng và mức độ phù hợp..."
                  />
                  <div className="note-footer">
                    <span>{(notes[application._id] || "").length}/2000</span>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={savingNoteId === application._id}
                      onClick={() => handleSaveNote(application._id)}
                    >
                      {savingNoteId === application._id
                        ? "Đang lưu..."
                        : savedNoteId === application._id
                          ? "Đã lưu"
                          : "Lưu ghi chú"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {cvPreview && (
          <div
            className="cv-modal-backdrop"
            role="presentation"
            onClick={() => setCvPreview(null)}
          >
            <section
              className="cv-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`Xem ${cvPreview.name}`}
              onClick={(event) => event.stopPropagation()}
            >
              <header>
                <h2>{cvPreview.name}</h2>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  aria-label="Quay lại quản lý ứng viên"
                  onClick={() => setCvPreview(null)}
                >
                  Quay lại
                </button>
              </header>
              <iframe title={`CV: ${cvPreview.name}`} src={cvPreview.url} />
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default HRApplications;
