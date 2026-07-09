import { STATUS_PROGRESS } from "@/lib/constants/applications";
import type { Application } from "@/types/application";

export function getApplicationProgress(status: string) {
  return STATUS_PROGRESS[status] ?? STATUS_PROGRESS["其他"] ?? 30;
}

export function getAverageProgress(applications: Application[]) {
  if (applications.length === 0) {
    return 0;
  }

  const total = applications.reduce((sum, application) => sum + getApplicationProgress(application.status), 0);
  return Math.round(total / applications.length);
}

export function getActiveApplications(applications: Application[]) {
  return applications.filter((application) => !["准备投递", "Offer", "拒绝"].includes(application.status));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}