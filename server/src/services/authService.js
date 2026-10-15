const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  const normalizedRole = String(role || "CANDIDATE")
    .trim()
    .toUpperCase();

  if (!["ADMIN", "HR", "CANDIDATE"].includes(normalizedRole)) {
    throw new Error("Vai trò không hợp lệ");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: normalizedRole,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: String(user.role).toUpperCase(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: String(user.role).toUpperCase(),
    },
  };
};

module.exports = {
  register,
  login,
};
/**
 * Register
   ↓
Kiểm tra email đã tồn tại?
   ↓
Hash password bằng bcrypt
   ↓
Tạo User trong MongoDB
   ↓
Trả thông tin user
 */
