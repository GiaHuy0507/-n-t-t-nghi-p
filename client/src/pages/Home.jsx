import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CompanyMark from "../components/CompanyMark";
import { formatSalary } from "../utils/format";
import "../scss/Home.scss";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const POPULAR_SEARCHES = [
  "React",
  "Node.js",
  "Kiểm thử",
  "Marketing",
  "Data",
  "Thực tập",
];

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = readStoredUser();
  const role = user?.role?.toUpperCase();
  const [keyword, setKeyword] = useState("");
  const [latestJobs, setLatestJobs] = useState([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);

  useEffect(() => {
    if (!token) return;

    if (role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (role === "HR") {
      navigate("/hr/dashboard", { replace: true });
      return;
    }

    if (role === "CANDIDATE") {
      navigate("/jobs", { replace: true });
    }
  }, [token, role, navigate]);

  useEffect(() => {
    api
      .get("/jobs")
      .then((response) => {
        const jobs = (response.data.data || []).filter(
          (job) => job.status === "OPEN",
        );
        setLatestJobs(jobs.slice(0, 5));
      })
      .catch(() => setLatestJobs([]))
      .finally(() => setJobsLoaded(true));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = keyword.trim();
    navigate(query ? `/jobs?q=${encodeURIComponent(query)}` : "/jobs");
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__intro">
          <h1>Tìm việc bắt đầu từ chính CV của bạn.</h1>
          <p>
            Tải CV dạng PDF, đọc nhận xét cụ thể về điểm mạnh và chỗ cần sửa,
            rồi xem những vị trí có yêu cầu gần với kỹ năng bạn đang có.
          </p>

          <form className="home-search" onSubmit={handleSearch} role="search">
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Vị trí, kỹ năng hoặc tên công ty"
              aria-label="Từ khóa tìm việc"
            />
            <button type="submit" className="btn">
              Tìm việc
            </button>
          </form>

          <div className="home-popular">
            <span>Hay tìm:</span>
            {POPULAR_SEARCHES.map((term) => (
              <Link key={term} to={`/jobs?q=${encodeURIComponent(term)}`}>
                {term}
              </Link>
            ))}
          </div>
        </div>

        <aside className="home-latest" aria-label="Việc làm mới đăng">
          <div className="home-latest__head">
            <h2>Mới đăng</h2>
            <Link to="/jobs" className="link">
              Xem tất cả
            </Link>
          </div>

          {!jobsLoaded ? (
            <p className="home-latest__empty">Đang tải...</p>
          ) : latestJobs.length === 0 ? (
            <p className="home-latest__empty">
              Chưa có tin tuyển dụng nào đang mở.
            </p>
          ) : (
            <ul>
              {latestJobs.map((job) => (
                <li key={job._id}>
                  <Link to={`/jobs/${job._id}`}>
                    <CompanyMark name={job.company} size={38} />
                    <div>
                      <strong>{job.title}</strong>
                      <span>
                        {job.company} · {job.location || "Chưa rõ địa điểm"}
                      </span>
                    </div>
                    <em>{formatSalary(job.salaryMin, job.salaryMax)}</em>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>

      <section className="home-steps">
        <h2>Cách dùng</h2>
        <ol>
          <li>
            <h3>Tải CV lên</h3>
            <p>
              Chấp nhận file PDF đến 10 MB. Hệ thống đọc nội dung và tách ra kỹ
              năng, kinh nghiệm, học vấn.
            </p>
          </li>
          <li>
            <h3>Đọc nhận xét</h3>
            <p>
              Mỗi góp ý đều kèm đoạn trích từ CV làm căn cứ, nên bạn biết chính
              xác cần sửa ở đâu.
            </p>
          </li>
          <li>
            <h3>Ứng tuyển</h3>
            <p>
              Xem mức độ khớp với từng tin tuyển dụng, gửi hồ sơ và theo dõi
              trạng thái ngay trên trang.
            </p>
          </li>
        </ol>
      </section>

      <section className="home-employer">
        <div>
          <h2>Bạn đang tuyển người?</h2>
          <p>
            Đăng tin, nhận hồ sơ, ghi chú đánh giá và xem danh sách ứng viên sắp
            theo mức độ phù hợp với yêu cầu.
          </p>
        </div>
        <Link to="/register" className="btn btn--ghost">
          Tạo tài khoản nhà tuyển dụng
        </Link>
      </section>
    </div>
  );
};

export default Home;
