import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.avif";
import api from "../services/api";
import "./HRJobs.css";

function HRJobs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
    return <p>Đang tải...</p>;
  }

  return (
    <>
      <header className="hr-jobs-nav">
        <Link to="/" className="hr-jobs-brand">
          <img src={logo} alt="JobPortal AI" className="hr-jobs-brand-logo" />
          <span>
            JobPortal <strong>AI</strong>
          </span>
        </Link>

        <nav className="hr-jobs-nav-links" aria-label="Điều hướng HR">
          <Link to="/hr/dashboard">Tổng quan & Ứng viên</Link>
          <Link to="/hr/jobs" className="active">
            Quản lý tin tuyển dụng
          </Link>
          <Link to="/hr/applications">Quản lý ứng viên</Link>
        </nav>

        <div className="hr-jobs-nav-account">
          <span>
            Xin chào, <strong>{user?.name || "HR"}</strong>
          </span>
          <button type="button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="hr-jobs">
        <div className="hr-jobs-header">
          <div>
            <h1>Quản lý tin tuyển dụng</h1>
            <p>Danh sách các công việc bạn đã đăng</p>
          </div>

          <button
            type="button"
            className="create-job-btn"
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? "Đóng form" : "Tạo tin tuyển dụng"}
          </button>
        </div>

        <div className="job-toolbar">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo vị trí, công ty, mô tả..."
            aria-label="Tìm tin tuyển dụng"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Lọc theo trạng thái"
          >
            <option value="ALL">Tất cả</option>
            <option value="OPEN">Đang tuyển</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>

        {showCreateForm && (
          <form className="job-form" onSubmit={handleCreateJob}>
            <div className="form-row">
              <div className="form-group">
                <label>Tiêu đề công việc</label>
                <input
                  type="text"
                  name="title"
                  value={jobForm.title}
                  onChange={handleJobFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Công ty</label>
                <input
                  type="text"
                  name="company"
                  value={jobForm.company}
                  onChange={handleJobFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  value={jobForm.location}
                  onChange={handleJobFormChange}
                />
              </div>
              <div className="form-group">
                <label>Lương tối thiểu</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={jobForm.salaryMin}
                  onChange={handleJobFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Lương tối đa</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={jobForm.salaryMax}
                  onChange={handleJobFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Kỹ năng</label>
              <input
                type="text"
                name="skills"
                value={jobForm.skills}
                onChange={handleJobFormChange}
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div className="form-group">
              <label>Mô tả công việc</label>
              <textarea
                name="description"
                value={jobForm.description}
                onChange={handleJobFormChange}
                rows="6"
                required
              />
            </div>

            <div className="form-actions-row">
              <button type="submit" className="btn-submit">
                Đăng tin tuyển dụng
              </button>
            </div>
          </form>
        )}

        {jobs.length === 0 ? (
          <div className="empty-jobs">
            <p>Bạn chưa tạo tin tuyển dụng nào.</p>

            <button
              type="button"
              className="create-job-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Tạo tin tuyển dụng đầu tiên
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-jobs">
            <p>Không tìm thấy tin tuyển dụng phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="job-management-list">
            <p className="job-results-summary">
              Hiển thị {filteredJobs.length}/{jobs.length} tin tuyển dụng
            </p>

            {filteredJobs.map((job) => (
              <div className="hr-job-card" key={job._id}>
                <div className="hr-job-info">
                  <h2>{job.title}</h2>

                  <p>{job.company}</p>

                  <p>Địa điểm: {job.location}</p>

                  <p>
                    Mức lương: {job.salaryMin?.toLocaleString()} -{" "}
                    {job.salaryMax?.toLocaleString()} VNĐ
                  </p>

                  <p>Hình thức: {job.employmentType}</p>

                  <span className={`job-status ${job.status.toLowerCase()}`}>
                    {jobStatusText[job.status] || job.status}
                  </span>
                </div>

                <div className="hr-job-actions">
                  <Link to={`/hr/jobs/edit/${job._id}`}>Sửa</Link>
                  <Link to={`/jobs/${job._id}`}>Xem</Link>

                  <button
                    onClick={() => handleCloseJob(job._id)}
                    disabled={job.status === "CLOSED"}
                  >
                    {job.status === "CLOSED" ? "Đã đóng" : "Đóng tuyển dụng"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteJob(job._id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default HRJobs;
