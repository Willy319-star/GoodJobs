"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeJobTrack } from "@/lib/job-track";
import { getCurrentUserId } from "@/lib/data/applications";
import { createClient } from "@/lib/supabase/server";

export type ReminderActionState = {
  ok: boolean;
  message: string;
};

const reminderTypes = ["测评", "笔试", "面试", "复盘", "截止日期", "其他"] as const;

function readRequired(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateReminderViews() {
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

function redirectToCalendar(track: string) {
  const normalizedTrack = normalizeJobTrack(track);
  redirect(normalizedTrack === "campus" ? "/calendar" : `/calendar?track=${normalizedTrack}`);
}

export async function createReminderAction(_state: ReminderActionState, formData: FormData): Promise<ReminderActionState> {
  const userId = await getCurrentUserId();
  const title = readRequired(formData, "title");
  const type = readRequired(formData, "type");
  const track = normalizeJobTrack(readRequired(formData, "track"));
  const remindAt = readRequired(formData, "remindAt");
  const applicationId = readRequired(formData, "applicationId");

  if (!title || !remindAt) {
    return { ok: false, message: "请填写提醒内容和提醒时间。" };
  }

  if (!reminderTypes.includes(type as (typeof reminderTypes)[number])) {
    return { ok: false, message: "请选择有效的提醒类型。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reminders").insert({
    user_id: userId,
    application_id: applicationId && applicationId !== "none" ? applicationId : null,
    title,
    type,
    track,
    remind_at: new Date(remindAt).toISOString(),
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateReminderViews();
  return { ok: true, message: "提醒已保存。" };
}

export async function completeReminderAction(formData: FormData) {
  const id = readRequired(formData, "id");
  const track = readRequired(formData, "track");

  if (!id) {
    redirectToCalendar(track);
  }

  const supabase = await createClient();
  await supabase.from("reminders").update({ is_done: true }).eq("id", id);
  revalidateReminderViews();
  redirectToCalendar(track);
}

export async function completeReminderInlineAction(formData: FormData) {
  const id = readRequired(formData, "id");

  if (!id) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("reminders").update({ is_done: true }).eq("id", id);
  revalidateReminderViews();
}

export async function deleteReminderAction(formData: FormData) {
  const id = readRequired(formData, "id");
  const track = readRequired(formData, "track");

  if (!id) {
    redirectToCalendar(track);
  }

  const supabase = await createClient();
  await supabase.from("reminders").delete().eq("id", id);
  revalidateReminderViews();
  redirectToCalendar(track);
}

export async function deleteReminderInlineAction(formData: FormData) {
  const id = readRequired(formData, "id");

  if (!id) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("reminders").delete().eq("id", id);
  revalidateReminderViews();
}
export async function markReminderReadAction(formData: FormData) {
  const id = readRequired(formData, "id");
  const track = readRequired(formData, "track");

  if (!id) {
    redirectToCalendar(track);
  }

  const supabase = await createClient();
  await supabase.from("reminders").update({ read_at: new Date().toISOString() }).eq("id", id);
  revalidateReminderViews();
  redirectToCalendar(track);
}

export async function markReminderReadInlineAction(formData: FormData) {
  const id = readRequired(formData, "id");

  if (!id) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("reminders").update({ read_at: new Date().toISOString() }).eq("id", id);
  revalidateReminderViews();
}

export async function markRemindersReadAction(formData: FormData) {
  const ids = formData.getAll("id").map((value) => String(value)).filter(Boolean);
  const track = readRequired(formData, "track");

  if (ids.length === 0) {
    redirectToCalendar(track);
  }

  const supabase = await createClient();
  await supabase.from("reminders").update({ read_at: new Date().toISOString() }).in("id", ids);
  revalidateReminderViews();
  redirectToCalendar(track);
}

export async function markRemindersReadInlineAction(formData: FormData) {
  const ids = formData.getAll("id").map((value) => String(value)).filter(Boolean);

  if (ids.length === 0) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("reminders").update({ read_at: new Date().toISOString() }).in("id", ids);
  revalidateReminderViews();
}
