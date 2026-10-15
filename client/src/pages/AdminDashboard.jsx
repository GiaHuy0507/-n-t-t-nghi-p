import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.avif";
import api from "../services/api";
import "../scss/AdminDashboard.scss";

const navigationItems = [
  { id: "overview", label: "Tổng quan" },
  { id: "users", label: "Người dùng" },
  { id: "jobs", label: "Tin tuyển dụng" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalHR: 0,
    totalCandidates: 0,
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const fetchAdminData = useCallback(async () => {
    try {
      const [overviewRes, usersRes, jobsRes] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/users"),
        api.get("/admin/jobs"),
      ]);

      setOverview((current) => overviewRes.data.data || current);
      setUsers(usersRes.data.data || []);
      setJobs(jobsRes.data.data || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể tải dữ liệu quản trị",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const stats = useMemo(
    () => [
      { label: "Tổng người dùng", value: overview.totalUsers, type: "sky" },
      { label: "HR", value: overview.totalHR, type: "sky" },
      { label: "Ứng viên", value: overview.totalCandidates, type: "sky" },
      { label: "Tin tuyển dụng", value: overview.totalJobs, type: "indigo" },
      { label: "Job đang mở", value: overview.openJobs, type: "amber" },
      {
        label: "Đơn chờ duyệt",
        value: overview.pendingApplications,
        type: "slate",
      },
    ],
    [overview],
  );

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setMessage("Cập nhật vai trò thành công");
      fetchAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Cập nhật vai trò thất bại");
    }
  };

  const handleJobStatusChange = async (jobId, status) => {
    try {
      await api.patch(`/admin/jobs/${jobId}/status`, { status });
      setMessage("Cập nhật trạng thái job thành công");
      fetchAdminData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Cập nhật trạng thái job thất bại",
      );
    }
  };

  const jobStatusText = {
    OPEN: "Đang tuyển",
    CLOSED: "Đã đóng",
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa tin tuyển dụng này?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setMessage("Xóa tin tuyển dụng thành công");
      fetchAdminData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Xóa tin tuyển dụng thất bại",
      );
    }
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-navbar">
        <Link
          to={isAuthPage ? "#" : "/"}
          className="admin-brand"
          onClick={(event) => {
            if (isAuthPage) event.preventDefault();
          }}
        >
          <img src={logo} alt="JobPortal AI" className="admin-brand-logo" />
          <span className="admin-brand-copy">
            JobPortal <strong style={{ color: "#1a73e8" }}>AI</strong>{" "}
          </span>
        </Link>

        <nav className="admin-nav" aria-label="Điều hướng quản trị">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeTab === item.id ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-navbar-account">
          <span>
            Xin chào, <strong>{admin?.name || "Admin"}</strong>
          </span>
          <button type="button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <section className="admin-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Quản trị hệ thống</h1>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={fetchAdminData}
            >
              Làm mới
            </button>
          </div>
        </header>

        <div className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className={`stat-card ${stat.type}`}>
              <div>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </div>
            </article>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="content-grid">
            <div className="panel panel-wide">
              <div className="panel-header">
                <h2>Chức năng quản trị</h2>
                <span className="status-pill success">Sẵn sàng</span>
              </div>

              <div className="feature-grid">
                <div className="feature-card">
                  <div>
                    <strong>Thống kê</strong>
                    <p>Giám sát tổng quan hệ thống</p>
                  </div>
                </div>
                <div className="feature-card">
                  <div>
                    <strong>Người dùng</strong>
                    <p>Quản lý HR và ứng viên</p>
                  </div>
                </div>
                <div className="feature-card">
                  <div>
                    <strong>Jobs</strong>
                    <p>Phê duyệt và quản lý tin tuyển dụng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="panel">
            <div className="panel-header">
              <h2>Danh sách người dùng</h2>
              <span className="status-pill neutral">
                {users.length} tài khoản
              </span>
            </div>

            {loading ? (
              <div className="empty-state">Đang tải dữ liệu...</div>
            ) : users.length === 0 ? (
              <div className="empty-state">Chưa có người dùng nào.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge ${String(user.role).toLowerCase()}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            {user.role !== "ADMIN" && (
                              <button
                                type="button"
                                className="mini-btn secondary"
                                onClick={() =>
                                  handleRoleChange(user._id, "ADMIN")
                                }
                              >
                                Set Admin
                              </button>
                            )}
                            {user.role !== "HR" && (
                              <button
                                type="button"
                                className="mini-btn success"
                                onClick={() => handleRoleChange(user._id, "HR")}
                              >
                                Set HR
                              </button>
                            )}
                            {user.role !== "CANDIDATE" && (
                              <button
                                type="button"
                                className="mini-btn primary"
                                onClick={() =>
                                  handleRoleChange(user._id, "CANDIDATE")
                                }
                              >
                                Set Candidate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="panel">
            <div className="panel-header">
              <h2>Danh sách tin tuyển dụng</h2>
              <span className="status-pill neutral">{jobs.length} job</span>
            </div>

            {loading ? (
              <div className="empty-state">Đang tải dữ liệu...</div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">Chưa có tin tuyển dụng nào.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Vị trí</th>
                      <th>Công ty</th>
                      <th>Người tạo</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job._id}>
                        <td>{job.title}</td>
                        <td>{job.company}</td>
                        <td>{job.createdBy?.name || "Không rõ"}</td>
                        <td>
                          <span
                            className={`badge ${String(job.status).toLowerCase()}`}
                          >
                            {jobStatusText[job.status] || job.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            <button
                              type="button"
                              className="mini-btn secondary"
                              onClick={() =>
                                handleJobStatusChange(
                                  job._id,
                                  job.status === "OPEN" ? "CLOSED" : "OPEN",
                                )
                              }
                            >
                              {job.status === "OPEN" ? "Đóng" : "Mở lại"}
                            </button>
                            <button
                              type="button"
                              className="mini-btn danger"
                              onClick={() => handleDeleteJob(job._id)}
                            >
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {message && <div className="status-message">{message}</div>}
      </section>
    </main>
  );
};

export default AdminDashboard;
