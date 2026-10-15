import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateJob() {
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

  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      await api.post("/jobs", {
        ...form,
        salaryMin: Number(form.salaryMin),
        salaryMax: Number(form.salaryMax),
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      alert("Tạo tin tuyển dụng thành công");

      navigate("/jobs");
    } catch (error) {
      console.error("Lỗi tạo Job:", error);
      console.log("Response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Tạo tin tuyển dụng thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Tạo tin tuyển dụng</h1>

      <form onSubmit={handleSubmit}>
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
          <label>Mô tả công việc</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="8"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo tin tuyển dụng"}
        </button>
      </form>
    </main>
  );
}

export default CreateJob;
