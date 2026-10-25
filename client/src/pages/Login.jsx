import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import api from "../services/api";
import { getDashboardPath } from "../utils/roleRoutes";
import "../scss/Auth.scss";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || "Đăng nhập thất bại");
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
        <h1>Đăng nhập</h1>
        <p className="auth__sub">Dùng email bạn đã đăng ký.</p>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Mật khẩu</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {message && <p className="notice notice--error">{message}</p>}

          <button type="submit" className="btn auth__submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="auth__switch">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="link">
            Tạo tài khoản
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
