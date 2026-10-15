const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const user = await authService.register({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const result = await authService.login({
      email,
      password,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};
const getMe = async (req, res) => {
  return res.status(200).json({
    message: "Lấy thông tin người dùng thành công",
    data: req.user,
  });
};

const adminTest = (req, res) => {
  return res.status(200).json({
    message: "Bạn là ADMIN và có quyền truy cập",
  });
};

module.exports = {
  register,
  login,
  getMe,
  adminTest,
};
/**
 *Request
   ↓
Controller
   ↓
Service
   ↓
User Model
   ↓
MongoDB

{
  "name": "Nguyen Gia Huy",
  "email": "huy@gmail.com",
  "password": "123456"
}

Controller → nhận dữ liệu
Service → kiểm tra email + hash password
Model → tạo User
MongoDB → lưu dữ liệu
 */
