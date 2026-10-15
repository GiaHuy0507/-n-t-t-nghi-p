const adminService = require("../services/adminService");

const getDashboardOverview = async (req, res) => {
  try {
    const data = await adminService.getDashboardOverview();

    return res.status(200).json({
      message: "Lấy thống kê admin thành công",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();

    return res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await adminService.getAllJobs();

    return res.status(200).json({
      message: "Lấy danh sách job thành công",
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await adminService.updateUserRole(
      req.params.id,
      req.body.role,
    );

    return res.status(200).json({
      message: "Cập nhật vai trò người dùng thành công",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const job = await adminService.updateJobStatus(
      req.params.id,
      req.body.status,
    );

    return res.status(200).json({
      message: "Cập nhật trạng thái job thành công",
      data: job,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await adminService.deleteJob(req.params.id);

    return res.status(200).json({
      message: "Xóa job thành công",
      data: job,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardOverview,
  getAllUsers,
  getAllJobs,
  updateUserRole,
  updateJobStatus,
  deleteJob,
};
