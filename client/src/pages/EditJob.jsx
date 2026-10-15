import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./EditJob.css";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    return <p>Đang tải thông tin Job...</p>;
  }

  return (
    <main className="edit-job">
      <h1>Chỉnh sửa tin tuyển dụng</h1>

      <form onSubmit={handleSubmit} className="edit-job-form">
        <div>
          <label>Tiêu đề công việc</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Công ty</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Địa điểm</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Lương tối thiểu</label>
          <input
            type="number"
            name="salaryMin"
            value={form.salaryMin}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Lương tối đa</label>
          <input
            type="number"
            name="salaryMax"
            value={form.salaryMax}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Kỹ năng</label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB"
          />
        </div>

        <div>
          <label>Loại công việc</label>

          <select
            name="employmentType"
            value={form.employmentType}
            onChange={handleChange}
          >
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div>
          <label>Trạng thái</label>

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="OPEN">Đang tuyển</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>

        <div className="description-field">
          <label>Mô tả công việc</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="8"
            required
          />
        </div>

        <div className="edit-job-actions">
          <button type="button" onClick={() => navigate("/hr/jobs")}>
            Hủy
          </button>

          <button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditJob;
