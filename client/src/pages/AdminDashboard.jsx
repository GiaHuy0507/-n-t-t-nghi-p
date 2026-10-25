import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardHeader from "../components/DashboardHeader";
import "../scss/AdminDashboard.scss";

const navigationItems = [
  { id: "overview", label: "Tổng quan" },
  { id: "users", label: "Người dùng" },
  { id: "jobs", label: "Tin tuyển dụng" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("user") || "null");
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
      { label: "Tin đang mở", value: overview.openJobs, type: "indigo" },
      {
        label: "Đơn chờ duyệt",
        value: overview.pendingApplications,
        type: "amber",
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
      setMessage("Đã cập nhật trạng thái tin");
      fetchAdminData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Cập nhật trạng thái tin thất bại",
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

  const roleLabels = {
    ADMIN: "Quản trị",
    HR: "Nhà tuyển dụng",
    CANDIDATE: "Ứng viên",
  };

  const renderUsersTable = (rows, editable) => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Vai trò</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr key={user._id}>
              <td>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </td>
              <td>
                {editable ? (
                  <select
                    className="input role-select"
                    value={user.role}
                    aria-label={`Vai trò của ${user.name}`}
                    onChange={(event) =>
                      handleRoleChange(user._id, event.target.value)
                    }
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`badge badge--${String(user.role).toLowerCase()}`}
                  >
                    {roleLabels[user.role] || user.role}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderJobsTable = (rows, editable) => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>Vị trí</th>
            <th>Người đăng</th>
            <th>Trạng thái</th>
            {editable && <th aria-label="Thao tác" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((job) => (
            <tr key={job._id}>
              <td>
                <Link to={`/jobs/${job._id}`} className="data-table__title">
                  {job.title}
                </Link>
                <small>{job.company}</small>
              </td>
              <td>{job.createdBy?.name || "Không rõ"}</td>
              <td>
                <span
                  className={`badge badge--${String(job.status).toLowerCase()}`}
                >
                  {jobStatusText[job.status] || job.status}
                </span>
              </td>
              {editable && (
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() =>
                        handleJobStatusChange(
                          job._id,
                          job.status === "OPEN" ? "CLOSED" : "OPEN",
                        )
                      }
                    >
                      {job.status === "OPEN" ? "Đóng tin" : "Mở lại"}
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDeleteJob(job._id)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <DashboardHeader
        area="Quản trị"
        userName={admin?.name || "Admin"}
        onLogout={handleLogout}
        items={navigationItems.map((item) => ({
          label: item.label,
          active: activeTab === item.id,
          onClick: () => setActiveTab(item.id),
        }))}
      />

      <main className="page admin-dashboard">
        <header className="page-head">
          <div>
            <h1>
              {navigationItems.find((item) => item.id === activeTab)?.label}
            </h1>
            <p>Số liệu toàn hệ thống</p>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={fetchAdminData}
          >
            Tải lại
          </button>
        </header>

        {message && <p className="notice admin-message">{message}</p>}

        <dl className="stat-row">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={
                stat.type === "amber" && stat.value > 0 ? "is-highlight" : ""
              }
            >
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>

        {loading ? (
          <div className="empty">Đang tải dữ liệu...</div>
        ) : activeTab === "overview" ? (
          <div className="admin-overview">
            <section className="dash-section">
              <div className="dash-section__head">
                <h2>Người dùng</h2>
                <button
                  type="button"
                  className="link link-button"
                  onClick={() => setActiveTab("users")}
                >
                  Quản lý ({users.length})
                </button>
              </div>
              {users.length === 0 ? (
                <div className="empty">Chưa có người dùng nào.</div>
              ) : (
                renderUsersTable(users.slice(0, 5), false)
              )}
            </section>
            <section className="dash-section">
              <div className="dash-section__head">
                <h2>Tin tuyển dụng</h2>
                <button
                  type="button"
                  className="link link-button"
                  onClick={() => setActiveTab("jobs")}
                >
                  Quản lý ({jobs.length})
                </button>
              </div>
              {jobs.length === 0 ? (
                <div className="empty">Chưa có tin tuyển dụng nào.</div>
              ) : (
                renderJobsTable(jobs.slice(0, 5), false)
              )}
            </section>
          </div>
        ) : activeTab === "users" ? (
          users.length === 0 ? (
            <div className="empty">Chưa có người dùng nào.</div>
          ) : (
            renderUsersTable(users, true)
          )
        ) : jobs.length === 0 ? (
          <div className="empty">Chưa có tin tuyển dụng nào.</div>
        ) : (
          renderJobsTable(jobs, true)
        )}
      </main>
    </>
  );
};

export default AdminDashboard;
