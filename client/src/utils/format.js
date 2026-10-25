export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  INTERNSHIP: "Thực tập",
};

export const JOB_STATUS_LABELS = {
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
};

export const formatEmploymentType = (type) =>
  EMPLOYMENT_TYPE_LABELS[type] || type || "Chưa rõ";

const toMillion = (value) => {
  const million = Number(value) / 1_000_000;
  return Number.isInteger(million)
    ? String(million)
    : million.toFixed(1).replace(".", ",");
};

// 15000000, 25000000 -> "15–25 triệu"
export const formatSalary = (min, max) => {
  const hasMin = Number(min) > 0;
  const hasMax = Number(max) > 0;
  if (!hasMin && !hasMax) return "Thỏa thuận";
  if (hasMin && hasMax) return `${toMillion(min)}–${toMillion(max)} triệu`;
  return hasMin ? `Từ ${toMillion(min)} triệu` : `Đến ${toMillion(max)} triệu`;
};

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "";

// Màu cố định theo tên công ty để logo chữ cái không đổi giữa các lần tải
const MARK_COLORS = [
  "#1f5c47",
  "#2c4f85",
  "#9a5a12",
  "#6b3f5e",
  "#3f5f6b",
  "#7a4a2a",
];

export const companyMark = (name = "") => {
  const text = String(name).trim();
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return {
    letter: (text[0] || "?").toUpperCase(),
    color: MARK_COLORS[hash % MARK_COLORS.length],
  };
};
