const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Bạn chưa đăng nhập",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      code: "AUTH_CONFIG_MISSING",
      message: "Máy chủ chưa được cấu hình JWT_SECRET",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      code:
        error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
      message:
        error.name === "TokenExpiredError"
          ? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
          : "Token không hợp lệ, vui lòng đăng nhập lại",
    });
  }
};

module.exports = {
  protect,
};
