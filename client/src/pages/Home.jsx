import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../scss/Home.scss";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = readStoredUser();
  const role = user?.role?.toUpperCase();

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

  return (
    <div className="home-page">
      {/* PHẦN GIỚI THIỆU */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Tạo CV chuyên nghiệp
            <br />
            tăng cơ hội phỏng vấn
            <br />
            và tìm việc phù hợp
          </h1>

          <p>
            Tải CV lên hệ thống, để AI phân tích hồ sơ và gợi ý những công việc
            phù hợp với kỹ năng của bạn.
          </p>

          {!token && (
            <div className="hero-buttons">
              <Link to="/login" className="btn-primary">
                Đăng nhập
              </Link>

              <Link to="/register" className="btn-secondary">
                Đăng ký
              </Link>
            </div>
          )}

          <div className="hero-proof">
            <div className="proof-item">Phân tích CV và kỹ năng bằng AI</div>

            <div className="proof-item">
              Gợi ý việc làm phù hợp với hồ sơ của bạn
            </div>
          </div>
        </div>

        {/* PHẦN XEM TRƯỚC CV */}
        <div className="hero-preview">
          <div className="preview-card">
            <div className="preview-header">
              <div className="avatar" />

              <div className="user-meta">
                <h3>Nguyễn Văn An</h3>
                <p>Giáo viên Toán</p>
              </div>
            </div>

            <div className="preview-main">
              <div className="score-box">81%</div>

              <div className="resume-copy">
                <h4>Hồ sơ</h4>

                <p>
                  Giáo viên Toán với hơn 8 năm kinh nghiệm trong lĩnh vực giảng
                  dạy và quản lý, có kỹ năng giao tiếp và quản lý lớp học tốt.
                </p>
              </div>
            </div>

            <div className="preview-columns">
              <div className="preview-column">
                <h4>Kinh nghiệm làm việc</h4>

                <div className="line short" />
                <div className="line medium" />
                <div className="line long" />
              </div>

              <div className="preview-column">
                <h4>Kỹ năng</h4>

                <div className="skill-tags">
                  <span>Giao tiếp</span>
                  <span>Lãnh đạo</span>
                  <span>Lập kế hoạch</span>
                </div>
              </div>
            </div>

            <button className="preview-button">Tương thích ATS</button>
          </div>
        </div>
      </section>

      {/* PHẦN TÍNH NĂNG */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Hoàn thiện CV nhanh chóng</h3>
          </div>

          <div className="feature-card">
            <h3>Phân tích kỹ năng bằng AI</h3>
          </div>

          <div className="feature-card">
            <h3>Tương thích hệ thống ATS</h3>
          </div>

          <div className="feature-card">
            <h3>Gợi ý việc làm phù hợp</h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
