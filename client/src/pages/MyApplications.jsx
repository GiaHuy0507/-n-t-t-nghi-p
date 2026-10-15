import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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
    return <p>Đang tải...</p>;
  }

  return (
    <main>
      <h1>Đơn ứng tuyển của tôi</h1>

      {applications.length === 0 ? (
        <p>Bạn chưa ứng tuyển công việc nào.</p>
      ) : (
        <div className="application-list">
          {applications.map((application) => (
            <div key={application._id} className="application-card">
              <h2>{application.job?.title}</h2>

              <p>{application.job?.company}</p>

              <p>Địa điểm: {application.job?.location}</p>

              <p>
                Trạng thái: <strong>{getStatusText(application.status)}</strong>
              </p>

              <p>
                Ngày ứng tuyển:{" "}
                {new Date(application.createdAt).toLocaleDateString("vi-VN")}
              </p>

              <Link to={`/jobs/${application.job?._id}`}>Xem công việc</Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyApplications;
