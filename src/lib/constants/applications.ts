export const APPLICATION_STATUSES = [
  "准备投递",
  "已投递",
  "测评",
  "笔试",
  "一面",
  "二面",
  "HR面",
  "Offer",
  "拒绝",
  "其他",
] as const;

export const APPLICATION_CATEGORIES = [
  "技术",
  "产品",
  "运营",
  "市场",
  "管培",
  "财务",
  "其他",
] as const;

export const APPLICATION_CITIES = ["北京", "上海", "深圳", "广州", "杭州", "其他"] as const;

export const APPLICATION_SOURCES = [
  "公司官网",
  "BOSS直聘",
  "猎聘",
  "学校就业网",
  "内推",
  "其他",
] as const;

export const STATUS_PROGRESS: Record<string, number> = {
  准备投递: 15,
  已投递: 30,
  测评: 38,
  笔试: 45,
  一面: 60,
  二面: 75,
  HR面: 85,
  Offer: 100,
  拒绝: 100,
  其他: 30,
};

export type ApplicationCategory = (typeof APPLICATION_CATEGORIES)[number];
export type ApplicationStatus = string;
export type ApplicationCity = string;
export type ApplicationSource = string;