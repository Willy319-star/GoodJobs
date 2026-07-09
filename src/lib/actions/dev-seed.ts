"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/data/applications";
import { createClient } from "@/lib/supabase/server";

const seedTag = "GoodJobs stability test";

const labels = {
  official: "\u516c\u53f8\u5b98\u7f51",
  boss: "BOSS\u76f4\u8058",
  liepin: "\u730e\u8058",
  school: "\u5b66\u6821\u5c31\u4e1a\u7f51",
  referral: "\u5185\u63a8",
  other: "\u5176\u4ed6",
  product: "\u4ea7\u54c1",
  tech: "\u6280\u672f",
  ops: "\u8fd0\u8425",
  marketing: "\u5e02\u573a",
  finance: "\u8d22\u52a1",
  submitted: "\u5df2\u6295\u9012",
  assessment: "\u6d4b\u8bc4",
  written: "\u7b14\u8bd5",
  firstInterview: "\u4e00\u9762",
  secondInterview: "\u4e8c\u9762",
  hrInterview: "HR\u9762",
  rejected: "\u62d2\u7edd",
  preparing: "\u51c6\u5907\u6295\u9012",
};

const testCompanies = [
  "Tencent", "ByteDance", "Alibaba", "Meituan", "JD", "Baidu", "NetEase", "Xiaomi", "Kuaishou", "Pinduoduo",
  "Bilibili", "Trip.com", "Ant Group", "Huawei", "OPPO", "vivo", "Li Auto", "NIO", "XPeng", "CATL",
  "miHoYo", "Dewu", "Pop Mart", "SF Tech", "CMB", "ICBC", "China Mobile", "Lenovo", "Hikvision", "DJI",
];

const positions = [
  "Product Manager", "Frontend Engineer", "Backend Engineer", "Data Analyst", "Operations Trainee",
  "Marketing Specialist", "Embedded Software Engineer", "Test Development Engineer", "Finance Analyst", "Growth Operator",
];

const categories = [
  labels.product,
  labels.tech,
  labels.tech,
  labels.tech,
  labels.ops,
  labels.marketing,
  labels.tech,
  labels.tech,
  labels.finance,
  labels.ops,
];

const cities = ["Beijing", "Shanghai", "Shenzhen", "Guangzhou", "Hangzhou", "Hong Kong", "Chengdu", "Nanjing", "Wuhan", "Suzhou"];
const sources = [labels.official, labels.boss, labels.liepin, labels.school, labels.referral, labels.other];
const statuses = [
  labels.submitted,
  labels.assessment,
  labels.written,
  labels.firstInterview,
  labels.secondInterview,
  labels.hrInterview,
  "Offer",
  labels.rejected,
  labels.preparing,
  labels.other,
];

function getChinaDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getChinaDateTime(offsetDays: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00+08:00`;
}

function revalidateDevSeedViews() {
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath("/timeline");
  revalidatePath("/calendar");
  revalidatePath("/dev/seed");
}

async function deleteExistingSeedData(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", userId)
    .ilike("notes", `%${seedTag}%`);

  const ids = (data ?? []).map((item) => item.id);

  if (ids.length > 0) {
    await supabase.from("applications").delete().in("id", ids);
  }

  await supabase.from("reminders").delete().eq("user_id", userId).ilike("title", `%${seedTag}%`);
}

function getErrorRedirect(error: unknown) {
  const message = error instanceof Error ? error.message : "\u672a\u77e5\u9519\u8bef";
  return `/dev/seed?status=error&message=${encodeURIComponent(message)}`;
}

export async function seedStabilityTestDataAction() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    const userId = await getCurrentUserId();
    const supabase = await createClient();

    await deleteExistingSeedData(userId);

    const applicationsPayload = testCompanies.map((company, index) => {
      const isOfficial = index < 10;
      const source = isOfficial ? labels.official : sources[(index % (sources.length - 1)) + 1];
      const position = positions[index % positions.length];
      const status = statuses[index % statuses.length];

      return {
        user_id: userId,
        track: "campus",
        company_name: company,
        position,
        category: categories[index % categories.length],
        city: cities[index % cities.length],
        source,
        status,
        apply_date: getChinaDate((index % 9) - 8),
        job_url: isOfficial ? `https://careers.example.com/${encodeURIComponent(company)}/${index + 1}` : null,
        description: `${seedTag}: test table, board, trend chart and detail pages.`,
        notes: `${seedTag} #${index + 1}`,
      };
    });

    const { data: insertedApplications, error } = await supabase
      .from("applications")
      .insert(applicationsPayload)
      .select("id, company_name, position, status, apply_date");

    if (error) {
      throw new Error(error.message);
    }

    const applications = insertedApplications ?? [];

    if (applications.length > 0) {
      const { error: timelineError } = await supabase.from("timeline_events").insert(
        applications.flatMap((application, index) => [
          {
            user_id: userId,
            application_id: application.id,
            track: "campus",
            event_type: "\u6295\u9012",
            event_date: application.apply_date,
            title: "\u5b8c\u6210\u9996\u6b21\u6295\u9012",
            description: `${application.company_name} / ${application.position}`,
          },
          {
            user_id: userId,
            application_id: application.id,
            track: "campus",
            event_type: "\u72b6\u6001\u53d8\u66f4",
            event_date: getChinaDate((index % 5) - 4),
            title: `\u72b6\u6001\u66f4\u65b0\u4e3a ${application.status}`,
            description: `${seedTag}: ${application.company_name} / ${application.position}`,
          },
        ]),
      );

      if (timelineError) {
        throw new Error(timelineError.message);
      }

      const { error: reminderError } = await supabase.from("reminders").insert(
        applications.slice(0, 10).map((application, index) => ({
          user_id: userId,
          application_id: application.id,
          track: "campus",
          title: `${seedTag}: ${application.company_name} ${index % 2 === 0 ? labels.written : "\u9762\u8bd5"}`,
          remind_at: getChinaDateTime(index % 7, 9 + (index % 8), index % 2 === 0 ? 0 : 30),
          type: index % 2 === 0 ? labels.written : "\u9762\u8bd5",
          is_done: false,
        })),
      );

      if (reminderError) {
        throw new Error(reminderError.message);
      }
    }

    revalidateDevSeedViews();
  } catch (error) {
    redirect(getErrorRedirect(error));
  }

  redirect("/dev/seed?status=success&message=created");
}

export async function clearStabilityTestDataAction() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    const userId = await getCurrentUserId();
    await deleteExistingSeedData(userId);
    revalidateDevSeedViews();
  } catch (error) {
    redirect(getErrorRedirect(error));
  }

  redirect("/dev/seed?status=success&message=cleared");
}
