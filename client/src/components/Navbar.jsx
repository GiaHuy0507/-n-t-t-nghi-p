import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Brand from "./Brand";
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
          <NavLink to="/hr/dashboard">Tổng quan</NavLink>
          <NavLink to="/hr/jobs">Tin tuyển dụng</NavLink>
          <NavLink to="/hr/applications">Ứng viên</NavLink>
        </>
      );
    }

    if (role === "ADMIN") {
      return <NavLink to="/admin/dashboard">Quản trị</NavLink>;
    }

    if (role === "CANDIDATE") {
      return (
        <>
          <NavLink to="/jobs">Việc làm</NavLink>
          <NavLink to="/my-cv">Phân tích CV</NavLink>
          <NavLink to="/create-cv">Tạo CV</NavLink>
          <NavLink to="/my-applications">Đơn đã nộp</NavLink>
        </>
      );
    }

    return <NavLink to="/jobs">Việc làm</NavLink>;
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Brand disabled={isAuthPage} />
        <nav className="site-nav" aria-label="Điều hướng chính">
          {renderNavLinks()}
        </nav>
        <div className="site-account">
          {token ? (
            <>
              <span className="site-account__name">
                {user?.name || "Tài khoản"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn--ghost btn--sm"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="site-account__login">
                Đăng nhập
              </NavLink>
              <NavLink to="/register" className="btn btn--sm">
                Tạo tài khoản
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
