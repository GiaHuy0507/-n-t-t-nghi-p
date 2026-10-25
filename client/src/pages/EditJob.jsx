import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import DashboardHeader from "../components/DashboardHeader";
import "../scss/HRJobs.scss";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    employmentType: "FULL_TIME",
    status: "OPEN",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        const job = response.data.data;

        setForm({
          title: job.title || "",
          description: job.description || "",
          company: job.company || "",
          location: job.location || "",
          salaryMin: job.salaryMin || "",
          salaryMax: job.salaryMax || "",
          skills: job.skills?.join(", ") || "",
          employmentType: job.employmentType || "FULL_TIME",
          status: job.status || "OPEN",
        });
      } catch (error) {
        console.error("Lỗi lấy Job:", error);
        alert(error.response?.data?.message || "Không thể lấy thông tin Job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.patch(`/jobs/${id}`, {
        ...form,
        salaryMin: Number(form.salaryMin),
        salaryMax: Number(form.salaryMax),
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      alert("Cập nhật tin tuyển dụng thành công");

      navigate("/hr/jobs");
    } catch (error) {
      console.error("Lỗi cập nhật Job:", error);

      alert(
        error.response?.data?.message || "Cập nhật tin tuyển dụng thất bại",
      );
    } finally {
      setSaving(false);
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
      <main className="page edit-job">
        <Link to="/hr/jobs" className="back-link">
          ← Tin tuyển dụng
        </Link>
        <header className="page-head">
          <div>
            <h1>Sửa tin tuyển dụng</h1>
            <p>{form.title}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="job-form job-form--edit">
          <div className="job-form__grid">
            <div className="field">
              <label>Tiêu đề công việc</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Công ty</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Địa điểm</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Lương tối thiểu</label>
              <input
                type="number"
                name="salaryMin"
                value={form.salaryMin}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Lương tối đa</label>
              <input
                type="number"
                name="salaryMax"
                value={form.salaryMax}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Kỹ năng</label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div className="field">
              <label>Loại công việc</label>

              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
              >
                <option value="FULL_TIME">Toàn thời gian</option>
                <option value="PART_TIME">Bán thời gian</option>
                <option value="INTERNSHIP">Thực tập</option>
              </select>
            </div>

            <div className="field">
              <label>Trạng thái</label>

              <select name="status" value={form.status} onChange={handleChange}>
                <option value="OPEN">Đang tuyển</option>
                <option value="CLOSED">Đã đóng</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Mô tả công việc</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="8"
              required
            />
          </div>

          <div className="job-form__actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate("/hr/jobs")}
            >
              Hủy
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default EditJob;
