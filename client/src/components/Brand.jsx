import { Link } from "react-router-dom";
import "../scss/Brand.scss";

function Brand({ to = "/", disabled = false }) {
  return (
    <Link
      to={disabled ? "#" : to}
      className="brand"
      onClick={(event) => {
        if (disabled) event.preventDefault();
      }}
    >
      <span className="brand-mark" aria-hidden="true">
        J
      </span>
      <span className="brand-name">JobPortal</span>
    </Link>
  );
}

export default Brand;
