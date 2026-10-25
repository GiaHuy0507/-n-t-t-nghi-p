import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import JobCard from "../components/JobCard";
import "../scss/JobList.scss";

function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState("OPEN");

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

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setSearchParams(value.trim() ? { q: value } : {}, { replace: true });
  };

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
    return <p className="page-state">Đang tải danh sách việc làm...</p>;
  }

  return (
    <main className="page job-list-page">
      <header className="page-head">
        <div>
          <h1>Việc làm</h1>
          <p>
            {filteredJobs.length} tin phù hợp
            {searchTerm.trim() && (
              <>
                {" "}
                với “<strong>{searchTerm.trim()}</strong>”
              </>
            )}
          </p>
        </div>
      </header>

      <div className="job-filters">
        <input
          className="input"
          type="search"
          value={searchTerm}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Vị trí, công ty, kỹ năng..."
          aria-label="Tìm việc làm"
        />
        <div
          className="job-filters__status"
          role="group"
          aria-label="Trạng thái tin"
        >
          {[
            ["OPEN", "Đang tuyển"],
            ["CLOSED", "Đã đóng"],
            ["ALL", "Tất cả"],
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

      {filteredJobs.length === 0 ? (
        <div className="empty">Không có tin tuyển dụng nào khớp bộ lọc.</div>
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
