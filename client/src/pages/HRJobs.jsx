import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardHeader from "../components/DashboardHeader";
import { formatEmploymentType, formatSalary } from "../utils/format";
import "../scss/JobList.scss";
import "../scss/HRJobs.scss";

function HRJobs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(
    Boolean(location.state?.openCreateForm),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    skills: "",
  });

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs/hr/my-jobs");

      setJobs(response.data.data);
    } catch (error) {
      console.error("Lỗi lấy Job của HR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const jobStatusText = {
    OPEN: "Đang tuyển",
    CLOSED: "Đã đóng",
  };

  const filteredJobs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const haystack = [job.title, job.company, job.location, job.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || haystack.includes(keyword);
      const matchesStatus =
        statusFilter === "ALL" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  const [aiNotes, setAiNotes] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  // Gemini soạn bản nháp mô tả từ thông tin HR đã nhập; HR đọc và sửa trước khi đăng
  const handleDraftDescription = async () => {
    if (!jobForm.title.trim()) {
      setAiMessage("Nhập vị trí tuyển dụng trước khi nhờ AI viết mô tả.");
      return;
    }
    if (
      jobForm.description.trim() &&
      !window.confirm("Thay mô tả hiện tại bằng bản nháp mới của AI?")
    ) {
      return;
    }

    setAiDrafting(true);
    setAiMessage("");
    try {
      const response = await api.post("/jobs/ai/generate", {
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        salaryMin: jobForm.salaryMin,
        salaryMax: jobForm.salaryMax,
        skills: jobForm.skills,
        notes: aiNotes,
      });
      const { description, skills } = response.data.data;
      setJobForm((prev) => ({
        ...prev,
        description,
        skills: prev.skills.trim() ? prev.skills : skills.join(", "),
      }));
      setAiMessage(
        "Đã có bản nháp. Hãy đọc lại và điền các chỗ trong [ngoặc vuông] trước khi đăng.",
      );
    } catch (error) {
      setAiMessage(
        error.response?.data?.message || "AI chưa thể viết mô tả lúc này.",
      );
    } finally {
      setAiDrafting(false);
    }
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/jobs", {
        ...jobForm,
        salaryMin: Number(jobForm.salaryMin),
        salaryMax: Number(jobForm.salaryMax),
        skills: jobForm.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      setJobs((current) => [response.data.data, ...current]);
      setJobForm({
        title: "",
        company: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        description: "",
        skills: "",
      });
      setAiNotes("");
      setAiMessage("");
      setShowCreateForm(false);
      alert("Tạo tin tuyển dụng thành công");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Tạo tin tuyển dụng thất bại",
      );
    }
  };

  const handleCloseJob = async (id) => {
    const confirmClose = window.confirm(
      "Bạn có chắc muốn đóng tin tuyển dụng này?",
    );

    if (!confirmClose) return;

    try {
      await api.patch(`/jobs/${id}`, {
        status: "CLOSED",
      });

      fetchJobs();
    } catch (error) {
      console.error("Lỗi đóng Job:", error);

      alert(error.response?.data?.message || "Đóng tin tuyển dụng thất bại");
    }
  };

  const handleDeleteJob = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa tin tuyển dụng này?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/jobs/${id}`);

      fetchJobs();
    } catch (error) {
      console.error("Lỗi xóa Job:", error);

      alert(error.response?.data?.message || "Xóa tin tuyển dụng thất bại");
    }
  };

  if (loading) {
    return <p className="page-state">Đang tải...</p>;
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

      <main className="page hr-jobs">
        <header className="page-head">
          <div>
            <h1>Tin tuyển dụng</h1>
            <p>
              {jobs.length} tin ·{" "}
              {jobs.filter((job) => job.status === "OPEN").length} đang tuyển
            </p>
          </div>
          <button
            type="button"
            className={`btn ${showCreateForm ? "btn--ghost" : ""}`}
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? "Đóng biểu mẫu" : "Đăng tin mới"}
          </button>
        </header>

        {showCreateForm && (
          <form className="job-form" onSubmit={handleCreateJob}>
            <h2>Tin tuyển dụng mới</h2>
            <div className="job-form__grid">
              <div className="field">
                <label htmlFor="job-title">Vị trí tuyển dụng</label>
                <input
                  id="job-title"
                  type="text"
                  name="title"
                  value={jobForm.title}
                  onChange={handleJobFormChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="job-company">Công ty</label>
                <input
                  id="job-company"
                  type="text"
                  name="company"
                  value={jobForm.company}
                  onChange={handleJobFormChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="job-location">Địa điểm</label>
                <input
                  id="job-location"
                  type="text"
                  name="location"
                  value={jobForm.location}
                  onChange={handleJobFormChange}
                  placeholder="Hà Nội"
                />
              </div>
              <div className="field">
                <label htmlFor="job-salaryMin">Lương tối thiểu (VNĐ)</label>
                <input
                  id="job-salaryMin"
                  type="number"
                  name="salaryMin"
                  value={jobForm.salaryMin}
                  onChange={handleJobFormChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="job-salaryMax">Lương tối đa (VNĐ)</label>
                <input
                  id="job-salaryMax"
                  type="number"
                  name="salaryMax"
                  value={jobForm.salaryMax}
                  onChange={handleJobFormChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="job-skills">Kỹ năng yêu cầu</label>
                <input
                  id="job-skills"
                  type="text"
                  name="skills"
                  value={jobForm.skills}
                  onChange={handleJobFormChange}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>
            <div className="ai-draft-box">
              <div className="field">
                <label htmlFor="job-ai-notes">
                  Gợi ý thêm cho AI (không bắt buộc)
                </label>
                <input
                  id="job-ai-notes"
                  value={aiNotes}
                  onChange={(event) => setAiNotes(event.target.value)}
                  placeholder="Ví dụ: 2 năm kinh nghiệm, làm hybrid, có thưởng dự án"
                />
              </div>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleDraftDescription}
                disabled={aiDrafting}
              >
                {aiDrafting ? "AI đang viết..." : "Viết mô tả bằng AI"}
              </button>
            </div>
            {aiMessage && <p className="notice">{aiMessage}</p>}
            <div className="field">
              <label htmlFor="job-description">Mô tả công việc</label>
              <textarea
                id="job-description"
                name="description"
                value={jobForm.description}
                onChange={handleJobFormChange}
                rows="12"
                required
              />
            </div>
            <div className="job-form__actions">
              <button type="submit" className="btn">
                Đăng tin
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowCreateForm(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        <div className="job-filters">
          <input
            className="input"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo vị trí, công ty, mô tả..."
            aria-label="Tìm tin tuyển dụng"
          />
          <div
            className="job-filters__status"
            role="group"
            aria-label="Lọc theo trạng thái"
          >
            {[
              ["ALL", "Tất cả"],
              ["OPEN", "Đang tuyển"],
              ["CLOSED", "Đã đóng"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={statusFilter === value ? "active" : ""}
                aria-pressed={statusFilter === value}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="empty">
            <p>Bạn chưa đăng tin tuyển dụng nào.</p>
            <button
              type="button"
              className="btn"
              onClick={() => setShowCreateForm(true)}
            >
              Đăng tin đầu tiên
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty">Không có tin nào khớp bộ lọc.</div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Vị trí</th>
                  <th>Địa điểm</th>
                  <th>Mức lương</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <Link
                        to={`/jobs/${job._id}`}
                        className="data-table__title"
                      >
                        {job.title}
                      </Link>
                      <small>
                        {job.company} ·{" "}
                        {formatEmploymentType(job.employmentType)}
                      </small>
                    </td>
                    <td>{job.location || "—"}</td>
                    <td className="nowrap">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </td>
                    <td>
                      <span
                        className={`badge badge--${job.status.toLowerCase()}`}
                      >
                        {jobStatusText[job.status] || job.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link
                          to={`/hr/jobs/edit/${job._id}`}
                          className="btn btn--ghost btn--sm"
                        >
                          Sửa
                        </Link>
                        {job.status !== "CLOSED" && (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => handleCloseJob(job._id)}
                          >
                            Đóng tin
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => handleDeleteJob(job._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

export default HRJobs;
