import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/jobs");

        setJobs(response.data.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách Job:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const haystack = [
        job.title,
        job.company,
        job.location,
        job.description,
        ...(job.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || haystack.includes(keyword);
      const matchesStatus =
        statusFilter === "ALL" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  if (loading) {
    return <p>Đang tải...</p>;
  }

  return (
    <main
      style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 40px" }}
    >
      <h1>Danh sách việc làm</h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          margin: "20px 0 28px",
          padding: 16,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
        }}
      >
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Tìm theo vị trí, công ty, kỹ năng..."
          style={{
            flex: 1,
            minWidth: 220,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            fontSize: 14,
          }}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            fontSize: 14,
            background: "#fff",
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="OPEN">Đang tuyển</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
      </div>

      <p style={{ marginBottom: 18, color: "#475569" }}>
        Tìm thấy {filteredJobs.length} tin tuyển dụng
      </p>

      {filteredJobs.length === 0 ? (
        <div
          style={{
            padding: 32,
            background: "#fff",
            border: "1px dashed #cbd5e1",
            borderRadius: 12,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Không tìm thấy tin tuyển dụng phù hợp.
        </div>
      ) : (
        <div className="job-list">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}

export default JobList;
