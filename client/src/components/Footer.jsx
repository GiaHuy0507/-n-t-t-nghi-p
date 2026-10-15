import "../scss/Footer.scss";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-col">
          <iframe
            title="Google Maps"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.7335946211433!2d105.84074041143563!3d21.00331348055889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac773026b415%3A0x499b8b613889f78a!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBYw6J5IEThu7FuZyBIw6AgTuG7mWkgLSBIVUNF!5e0!3m2!1svi!2s!4v1789223112417!5m2!1svi!2s"
            width="420"
            height="210"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="map"
          ></iframe>
        </div>
        <div className="footer-col">
          <h4>Về chúng tôi</h4>
          <ul>
            <li>
              <Link to="/about">Giới thiệu</Link>
            </li>
            <li>
              <Link to="/operating-regulations">Quy chế hoạt động</Link>
            </li>
            <li>
              <Link to="/policies">Chính sách</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Liên hệ hỗ trợ</h4>
          <a href="mailto:nguyengiahuy141205@gmail.com">
            Email: nguyengiahuy141205@gmail.com
          </a>
          <a href="tel:0972091816">Hotline: 0972 091 816</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 JobPortal AI · Hệ thống hỗ trợ tuyển dụng bằng AI</p>
      </div>
    </footer>
  );
};

export default Footer;
