import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../scss/Register.scss"; // Lát nữa chúng ta sẽ tạo file SCSS này

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
    <main className="register">
      <div className="register-box">
        <h1>Tạo tài khoản mới</h1>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Họ và Tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: nguyenvana@gmail.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập ít nhất 6 ký tự"
              required
            />
          </div>

          <div className="input-group">
            <label>Loại tài khoản</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="candidate">Ứng viên (Tìm việc)</option>
              <option value="hr">Nhà tuyển dụng (Đăng bài)</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
          </button>
        </form>

        {/* Hiển thị thông báo màu xanh (thành công) hoặc đỏ (thất bại) */}
        {message && (
          <div className={`message ${isSuccess ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <div className="register-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </main>
  );
}

export default Register;
