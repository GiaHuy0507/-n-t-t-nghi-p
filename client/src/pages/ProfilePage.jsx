import React from "react";
import CVUpload from "../components/CVUpload"; // Gọi component giao diện upload vào đây

const MyCV = () => {
  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>
        Hồ Sơ Năng Lực (CV)
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        Tải CV của bạn lên để AI phân tích kỹ năng và đánh giá mức độ phù hợp
        với công việc.
      </p>

      {/* Khối Component xử lý logic Upload sẽ nằm trọn vẹn ở đây */}
      <CVUpload />
    </div>
  );
};

export default MyCV;
