import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardHeader from "../components/DashboardHeader";
import { formatDate } from "../utils/format";

function HRDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

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
    return <p className="page-state">Đang tải...</p>;
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

  const stats = [
    {
      label: "Tin đang tuyển",
      value: openJobs,
      note: `${closedJobs} tin đã đóng`,
    },
    { label: "Hồ sơ nhận được", value: applications.length },
    {
      label: "Chờ xem xét",
      value: pendingApplications,
      highlight: pendingApplications > 0,
    },
    { label: "Đã tuyển", value: acceptedApplications },
  ];

  return (
    <>
      <DashboardHeader
        area="Nhà tuyển dụng"
        userName={user?.name || "HR"}
        onLogout={handleLogout}
        items={[
          {
            label: "Tổng quan",
            onClick: () => setActiveTab("dashboard"),
            active: activeTab === "dashboard",
          },
          { label: "Tin tuyển dụng", to: "/hr/jobs" },
          { label: "Ứng viên", to: "/hr/applications" },
        ]}
      />

      <main className="page hr-dashboard">
        <header className="page-head">
          <div>
            <h1>Tổng quan</h1>
            <p>
              {jobs.length} tin tuyển dụng · {applications.length} hồ sơ
            </p>
          </div>
          <Link to="/hr/jobs" state={{ openCreateForm: true }} className="btn">
            Đăng tin mới
          </Link>
        </header>

        <dl className="stat-row">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={stat.highlight ? "is-highlight" : ""}
            >
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
              {stat.note && <small>{stat.note}</small>}
            </div>
          ))}
        </dl>

        <section className="dash-section">
          <div className="dash-section__head">
            <h2>Hồ sơ mới nhất</h2>
            <Link to="/hr/applications" className="link">
              Xem tất cả
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="empty">Chưa có ứng viên nào nộp hồ sơ.</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Ứng viên</th>
                    <th>Vị trí</th>
                    <th>Ngày nộp</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app._id}>
                      <td>
                        <strong>{app.candidate?.name || "Ẩn danh"}</strong>
                        <small>
                          {app.candidate?.email || "Không có email"}
                        </small>
                      </td>
                      <td>{app.job?.title || "Không rõ"}</td>
                      <td>{formatDate(app.createdAt)}</td>
                      <td>
                        <span
                          className={`badge badge--${app.status.toLowerCase()}`}
                        >
                          {applicationStatusText[app.status] || app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default HRDashboard;
