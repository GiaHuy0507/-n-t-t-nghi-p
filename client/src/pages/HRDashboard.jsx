import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.avif";
import api from "../services/api";
import "../scss/HRDashboard.scss"; // Đổi đuôi import thành .scss nhé

function HRDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  // --- STATE DỮ LIỆU TỪ API CỦA BẠN ---
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE ĐIỀU KHIỂN GIAO DIỆN ---
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab === "post-job" ? "post-job" : "dashboard";
  });

  useEffect(() => {
    if (location.state?.tab === "post-job") {
      setActiveTab("post-job");
    }
  }, [location.state]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  // GỌI API LẤY THỐNG KÊ (Code cũ của bạn)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          api.get("/jobs/hr/my-jobs"),
          api.get("/applications/hr"),
        ]);
        setJobs(jobsResponse.data.data);
        setApplications(applicationsResponse.data.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="loading-screen">Đang tải dữ liệu Dashboard...</div>;
  }

  // TÍNH TOÁN THỐNG KÊ
  const openJobs = jobs.filter((job) => job.status === "OPEN").length;
  const closedJobs = jobs.filter((job) => job.status === "CLOSED").length;
  const pendingApplications = applications.filter(
    (app) => app.status === "PENDING",
  ).length;
  const acceptedApplications = applications.filter(
    (app) => app.status === "ACCEPTED",
  ).length;
  const applicationStatusText = {
    PENDING: "Đang chờ",
    SHORTLISTED: "Đạt vòng CV",
    INTERVIEW: "Mời phỏng vấn",
    REJECTED: "Không đạt",
    ACCEPTED: "Đã tuyển",
  };

  return (
    <main className="hr-dashboard">
      <header className="hr-navbar">
        <Link
          to={isAuthPage ? "#" : "/"}
          className="hr-brand"
          onClick={(event) => {
            if (isAuthPage) event.preventDefault();
          }}
        >
          <img src={logo} alt="JobPortal AI" className="hr-brand-logo" />
          <span>
            JobPortal <strong style={{ color: "#1a73e8" }}>AI</strong>
          </span>
        </Link>

        <nav className="hr-nav-links" aria-label="Điều hướng HR">
          <button
            type="button"
            className={activeTab === "dashboard" ? "active" : ""}
            aria-pressed={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          >
            Tổng quan & Ứng viên
          </button>
          <Link to="/hr/jobs" className="hr-nav-link">
            Quản lý tin tuyển dụng
          </Link>
          <Link to="/hr/applications" className="hr-nav-link">
            Quản lý ứng viên
          </Link>
        </nav>

        <div className="hr-nav-account">
          <span>
            Xin chào, <strong>{user?.name || "HR"}</strong>
          </span>
          <button type="button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* === TAB 1: THỐNG KÊ (Code cũ của bạn đã được làm đẹp) === */}
        {activeTab === "dashboard" && (
          <div className="tab-dashboard">
            <div className="header">
              <h1>Dashboard HR</h1>
              <p>Quản lý hiệu quả tuyển dụng của bạn</p>
            </div>

            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Tổng số Job</h3>
                <strong>{jobs.length}</strong>
              </div>
              <div className="stat-card">
                <h3>Job đang tuyển</h3>
                <strong className="text-blue">{openJobs}</strong>
              </div>
              <div className="stat-card">
                <h3>Job đã đóng</h3>
                <strong className="text-red">{closedJobs}</strong>
              </div>
              <div className="stat-card">
                <h3>Tổng ứng viên</h3>
                <strong>{applications.length}</strong>
              </div>
              <div className="stat-card">
                <h3>Đơn chờ xử lý</h3>
                <strong className="text-orange">{pendingApplications}</strong>
              </div>
              <div className="stat-card">
                <h3>Đã tuyển</h3>
                <strong className="text-blue">{acceptedApplications}</strong>
              </div>
            </div>

            <section className="dashboard-section">
              <h2>Ứng viên mới nhất</h2>
              {applications.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
                  Chưa có ứng viên nào nộp hồ sơ.
                </p>
              ) : (
                <div className="application-table">
                  <div className="table-header">
                    <span>Ứng viên</span>
                    <span>Email</span>
                    <span>Công việc</span>
                    <span>Trạng thái</span>
                  </div>
                  {applications.slice(0, 5).map((app) => (
                    <div className="table-row" key={app._id}>
                      <span>{app.candidate?.name || "Ẩn danh"}</span>
                      <span>{app.candidate?.email || "Không có email"}</span>
                      <span>{app.job?.title || "Không rõ"}</span>
                      <span className={`status ${app.status.toLowerCase()}`}>
                        {applicationStatusText[app.status] || app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default HRDashboard;
