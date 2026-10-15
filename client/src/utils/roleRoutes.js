export const getDashboardPath = (role) => {
  switch (String(role || "").toUpperCase()) {
    case "ADMIN":
      return "/admin/dashboard";
    case "HR":
      return "/hr/dashboard";
    case "CANDIDATE":
    default:
      return "/jobs";
  }
};
