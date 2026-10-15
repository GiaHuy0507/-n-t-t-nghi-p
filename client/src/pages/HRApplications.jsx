import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.avif";
import api from "../services/api";
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
    return (
      <main className="hr-applications-page">
        <p>Đang tải ứng viên...</p>
      </main>
    );
  }

  return (
    <>
      <header className="hr-applications-nav">
        <Link to="/" className="hr-applications-brand">
          <img
            src={logo}
            alt="JobPortal AI"
            className="hr-applications-brand-logo"
          />
          <span>
            JobPortal <strong>AI</strong>
          </span>
        </Link>

        <nav className="hr-applications-nav-links" aria-label="Điều hướng HR">
          <Link to="/hr/dashboard">Tổng quan & Ứng viên</Link>
          <Link to="/hr/jobs">Quản lý tin tuyển dụng</Link>
          <Link to="/hr/applications" className="active">
            Quản lý ứng viên
          </Link>
        </nav>

        <div className="hr-applications-nav-account">
          <span>
            Xin chào, <strong>{user?.name || "HR"}</strong>
          </span>
          <button type="button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="hr-applications-page">
        <header className="applications-header">
          <div>
            <p className="applications-eyebrow">TUYỂN DỤNG</p>
            <h1>Hồ sơ ứng viên</h1>
            <p>Xem CV, ghi chú đánh giá và cập nhật kết quả xét duyệt.</p>
          </div>
          <div className="applications-header-actions">
            <div className="applications-total">
              <strong>{applications.length}</strong>
              <span>hồ sơ</span>
            </div>
          </div>
        </header>

        {loadError && <p className="applications-error">{loadError}</p>}

        <section className="applications-toolbar" aria-label="Lọc hồ sơ">
          <label>
            <span>Tìm ứng viên</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tên, email hoặc vị trí"
            />
          </label>
          <label>
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
                <p className="applications-eyebrow">AI RECOMMENDATION</p>
                <h2>Top ứng viên phù hợp</h2>
              </div>
              <select
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
              <div className="applications-empty">
                Đang phân tích bằng AI...
              </div>
            ) : shortlist.length === 0 ? (
              <div className="applications-empty">
                Chưa có ứng viên nào đủ dữ liệu để AI đánh giá cho công việc
                này.
              </div>
            ) : (
              <div className="shortlist-list">
                {shortlist.map((candidate, index) => (
                  <div key={candidate.applicationId} className="shortlist-item">
                    <div className="shortlist-rank">#{index + 1}</div>
                    <div className="shortlist-info">
                      <strong>{candidate.candidateName}</strong>
                      <p>{candidate.candidateEmail}</p>
                      <span>{candidate.summary}</span>
                    </div>
                    <div className="shortlist-score">
                      <strong>{candidate.score}%</strong>
                      <small>độ phù hợp</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {applications.length === 0 ? (
          <div className="applications-empty">Chưa có ứng viên ứng tuyển.</div>
        ) : filteredApplications.length === 0 ? (
          <div className="applications-empty">
            Không tìm thấy hồ sơ phù hợp.
          </div>
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
                    className={`application-status status-${application.status.toLowerCase()}`}
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
                    <strong>
                      {new Date(application.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </strong>
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
                    className="view-cv-button"
                    type="button"
                    disabled={cvLoadingId === application._id}
                    onClick={() => handleViewCV(application)}
                  >
                    {cvLoadingId === application._id
                      ? "Đang mở CV..."
                      : "Xem CV"}
                  </button>
                  <label className="status-control">
                    <span>Kết quả xét duyệt</span>
                    <select
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
                    AI:{" "}
                    {application.cv?.aiStatus === "COMPLETED"
                      ? "Đã phân tích"
                      : application.cv?.aiStatus === "PENDING"
                        ? "Đang chờ phân tích"
                        : "Phân tích thất bại"}
                  </span>
                  {application.cv?.aiStatus !== "COMPLETED" && (
                    <button
                      type="button"
                      disabled={retryingAIId === application._id}
                      onClick={() => handleRetryAIAnalysis(application)}
                    >
                      {retryingAIId === application._id
                        ? "Đang phân tích..."
                        : "Phân tích lại bằng AI"}
                    </button>
                  )}
                </div>

                <div className="review-note">
                  <label htmlFor={`hr-note-${application._id}`}>
                    Ghi chú đánh giá <span>Chỉ HR xem được</span>
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
