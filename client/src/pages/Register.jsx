import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Brand from "../components/Brand";
import "../scss/Auth.scss";

function Register() {
  const navigate = useNavigate();

  // Khai báo các biến state để lưu dữ liệu người dùng nhập
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate"); // Mặc định chọn Ứng viên

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      setIsSuccess(false);

      // Gọi API đến Backend để đăng ký.
      // (Đảm bảo backend của bạn có đường dẫn /auth/register nhé)
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      setMessage("Đăng ký thành công! Đang chuyển hướng...");
      setIsSuccess(true);

      // Đợi 1.5 giây cho người dùng đọc thông báo rồi đá sang trang Login
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Đăng ký thất bại. Email có thể đã tồn tại!",
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__brand">
        <Brand />
      </div>
      <div className="auth__box">
        <h1>Tạo tài khoản</h1>
        <p className="auth__sub">Miễn phí cho cả ứng viên và nhà tuyển dụng.</p>

        <form onSubmit={handleRegister}>
          <fieldset className="role-choice">
            <legend>Bạn là</legend>
            <label className={role === "candidate" ? "active" : ""}>
              <input
                type="radio"
                name="role"
                value="candidate"
                checked={role === "candidate"}
                onChange={(e) => setRole(e.target.value)}
              />
              <strong>Ứng viên</strong>
              <span>Tìm việc, phân tích CV</span>
            </label>
            <label className={role === "hr" ? "active" : ""}>
              <input
                type="radio"
                name="role"
                value="hr"
                checked={role === "hr"}
                onChange={(e) => setRole(e.target.value)}
              />
              <strong>Nhà tuyển dụng</strong>
              <span>Đăng tin, xem hồ sơ</span>
            </label>
          </fieldset>

          <div className="field">
            <label htmlFor="reg-name">Họ và tên</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-password">Mật khẩu</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {message && (
            <p className={`notice ${isSuccess ? "" : "notice--error"}`}>
              {message}
            </p>
          )}

          <button type="submit" className="btn auth__submit" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="auth__switch">
          Đã có tài khoản?{" "}
          <Link to="/login" className="link">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
