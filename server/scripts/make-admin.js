// Cấp quyền ADMIN cho một tài khoản đã đăng ký.
// Cách dùng: npm run make-admin -- email@vidu.com
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

const run = async () => {
  const email = String(process.argv[2] || "")
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error(
      "Thiếu email. Ví dụ: npm run make-admin -- admin@gmail.com",
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { role: "ADMIN" },
    { new: true },
  );

  if (!user) {
    throw new Error(`Không tìm thấy tài khoản ${email}. Hãy đăng ký trước.`);
  }

  console.log(`Đã cấp quyền ADMIN cho ${user.email}`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
