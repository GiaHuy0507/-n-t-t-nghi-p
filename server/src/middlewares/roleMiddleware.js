const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập",
      });
    }

    const userRole = String(req.user.role || "").toUpperCase();
    const allowedRoles = roles.map((role) => String(role).toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập",
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};
// Phân quyền
