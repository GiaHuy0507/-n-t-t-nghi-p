import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.avif";
import "../scss/Navbar.scss";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = readStoredUser();
  const role = user?.role?.toUpperCase();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const renderNavLinks = () => {
    if (role === "HR") {
      return (
        <>
          <NavLink to="/hr/dashboard">Tổng quan &amp; Ứng viên</NavLink>
          {/* <NavLink to="/hr/jobs/create">Đăng việc làm mới</NavLink> */}
          <NavLink to="/hr/jobs">Tin tuyển dụng đã đăng</NavLink>
          <NavLink to="/hr/applications">Quản lý ứng viên</NavLink>
        </>
      );
    }

    if (role === "ADMIN") {
      return <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>;
    }

    if (role === "CANDIDATE") {
      return (
        <>
          <NavLink to="/jobs">Danh sách việc làm</NavLink>
          <NavLink to="/create-cv">Tạo CV</NavLink>
          <NavLink to="/my-cv">Tải CV</NavLink>
        </>
      );
    }

    return (
      <>
        <NavLink to="/jobs">Danh sách việc làm</NavLink>
      </>
    );
  };

  return (
    <header className="main-navbar">
      <div className="nav-brand">
        <Link
          to={isAuthPage ? "#" : "/"}
          className="nav-brand-link"
          onClick={(event) => {
            if (isAuthPage) event.preventDefault();
          }}
        >
          <img src={logo} alt="JobPortal AI logo" className="nav-logo" />
          <span className="brand-name">
            JobPortal <strong>AI</strong>
          </span>
        </Link>
      </div>
      <nav className="nav-links">{renderNavLinks()}</nav>
      <div className="nav-auth">
        {token ? (
          <div className="user-info">
            <span>
              Xin chào, <strong>{user?.name || "User"}</strong>
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn-register">
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
