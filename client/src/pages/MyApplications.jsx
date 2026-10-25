import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { formatDate } from "../utils/format";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get("/applications/my");

        setApplications(response.data.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách đơn ứng tuyển:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ xét duyệt";

      case "SHORTLISTED":
        return "Đã lọt danh sách";

      case "INTERVIEW":
        return "Được mời phỏng vấn";

      case "REJECTED":
        return "Không đạt";

      case "ACCEPTED":
        return "Đã được nhận";

      default:
        return status;
    }
  };

  if (loading) {
    return <p className="page-state">Đang tải...</p>;
  }

  return (
    <main className="page">
      <header className="page-head">
        <div>
          <h1>Đơn đã nộp</h1>
          <p>Trạng thái được nhà tuyển dụng cập nhật trực tiếp.</p>
        </div>
        <Link to="/jobs" className="btn btn--ghost">
          Tìm thêm việc
        </Link>
      </header>

      {applications.length === 0 ? (
        <div className="empty">
          Bạn chưa ứng tuyển công việc nào.{" "}
          <Link to="/jobs" className="link">
            Xem việc làm đang tuyển
          </Link>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Vị trí</th>
                <th>Địa điểm</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application._id}>
                  <td>
                    <Link
                      to={`/jobs/${application.job?._id}`}
                      className="data-table__title"
                    >
                      {application.job?.title || "Tin đã bị xóa"}
                    </Link>
                    <small>{application.job?.company}</small>
                  </td>
                  <td>{application.job?.location || "—"}</td>
                  <td>{formatDate(application.createdAt)}</td>
                  <td>
                    <span
                      className={`badge badge--${String(application.status).toLowerCase()}`}
                    >
                      {getStatusText(application.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default MyApplications;
