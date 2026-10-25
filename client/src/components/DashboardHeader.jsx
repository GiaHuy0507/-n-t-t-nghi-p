import { NavLink } from "react-router-dom";
import Brand from "./Brand";
import "../scss/Navbar.scss";

// Thanh điều hướng dùng chung cho khu vực HR và quản trị.
// items: [{ label, to }] để chuyển trang, hoặc [{ label, onClick, active }] để đổi tab.
function DashboardHeader({ area, items, userName, onLogout }) {
  return (
    <header className="site-header site-header--dash">
      <div className="site-header__inner">
        <div className="dash-brand">
          <Brand />
          <span className="dash-brand__area">{area}</span>
        </div>
        <nav className="site-nav" aria-label={`Điều hướng ${area}`}>
          {items.map((item) =>
            item.to ? (
              <NavLink key={item.label} to={item.to} end>
                {item.label}
              </NavLink>
            ) : (
              <button
                key={item.label}
                type="button"
                className={item.active ? "active" : ""}
                aria-pressed={Boolean(item.active)}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ),
          )}
        </nav>
        <div className="site-account">
          <span className="site-account__name">{userName}</span>
          <button
            type="button"
            onClick={onLogout}
            className="btn btn--ghost btn--sm"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
