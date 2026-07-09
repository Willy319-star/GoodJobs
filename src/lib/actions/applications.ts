"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  APPLICATION_CATEGORIES,
  type ApplicationCategory,
} from "@/lib/constants/applications";
import { DEFAULT_JOB_TRACK, normalizeJobTrack, type JobTrack } from "@/lib/job-track";
import { getCurrentUserId } from "@/lib/data/applications";
import { createClient } from "@/lib/supabase/server";

export type ApplicationActionState = {
  ok: boolean;
  message: string;
};

type ApplicationBasePayload = {
  company_name: string;
  position: string;
  category: ApplicationCategory;
  city: string;
  source: string;
  track: JobTrack;
  apply_date: string;
  job_url: string | null;
  description: string | null;
  notes: string | null;
};

type ApplicationPayloadResult =
  | { ok: true; payload: ApplicationBasePayload }
  | { ok: false; message: string };

const initialStatus = "已投递";

function readRequired(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isOneOf<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value);
}

function normalizeExternalUrl(value: string) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function getChinaDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getApplicationPayload(formData: FormData): ApplicationPayloadResult {
  const companyName = readRequired(formData, "companyName");
  const position = readRequired(formData, "position");
  const category = readRequired(formData, "category");
  const city = readRequired(formData, "city");
  const source = readRequired(formData, "source");
  const track = normalizeJobTrack(readRequired(formData, "track"));
  const applyDate = readRequired(formData, "applyDate");
  const jobUrl = readRequired(formData, "jobUrl");
  const description = readRequired(formData, "description");
  const notes = readRequired(formData, "notes");

  if (!companyName || !position || !applyDate) {
    return { ok: false, message: "请填写公司名称、岗位名称和投递日期。" };
  }

  if (!isOneOf(category, APPLICATION_CATEGORIES)) {
    return { ok: false, message: "请选择有效的岗位类别。" };
  }

  if (!city) {
    return { ok: false, message: "请选择或填写城市。" };
  }

  if (!source) {
    return { ok: false, message: "请选择或填写投递渠道。" };
  }

  return {
    ok: true,
    payload: {
      company_name: companyName,
      position,
      category,
      city,
      source,
      track,
      apply_date: applyDate,
      job_url: normalizeExternalUrl(jobUrl),
      description: description || null,
      notes: notes || null,
    },
  };
}

function revalidateApplicationViews(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath("/timeline");
  revalidatePath("/calendar");
  if (id) {
    revalidatePath(`/applications/${id}`);
  }
}

export async function createApplicationAction(_state: ApplicationActionState, formData: FormData): Promise<ApplicationActionState> {
  const userId = await getCurrentUserId();
  const result = getApplicationPayload(formData);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .insert({ ...result.payload, status: initialStatus, user_id: userId })
    .select("id, company_name, position, track, status, apply_date")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "新增投递失败。" };
  }

  await supabase.from("timeline_events").insert({
    user_id: userId,
    application_id: data.id,
    track: normalizeJobTrack(data.track),
    event_type: "投递",
    event_date: data.apply_date,
    title: "完成首次投递",
    description: `${data.company_name} / ${data.position}`,
  });

  revalidateApplicationViews(data.id);
  return { ok: true, message: "投递记录已保存。" };
}

export async function updateApplicationAction(_state: ApplicationActionState, formData: FormData): Promise<ApplicationActionState> {
  const id = readRequired(formData, "id");
  const result = getApplicationPayload(formData);

  if (!id) {
    return { ok: false, message: "缺少投递记录 ID。" };
  }

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("applications").update(result.payload).eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateApplicationViews(id);
  return { ok: true, message: "投递记录已更新。" };
}

export async function updateApplicationStatusAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const id = readRequired(formData, "id");
  const status = readRequired(formData, "status");

  if (!id || !status) {
    return;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select("id, company_name, position, track")
    .single();

  if (!error && data) {
    await supabase.from("timeline_events").insert({
      user_id: userId,
      application_id: data.id,
      track: normalizeJobTrack(data.track),
      event_type: "状态变更",
      event_date: getChinaDateString(),
      title: `状态更新为 ${status}`,
      description: `${data.company_name} / ${data.position}`,
    });
  }

  revalidateApplicationViews(id);
}

export async function deleteApplicationAction(formData: FormData) {
  const id = readRequired(formData, "id");
  const track = normalizeJobTrack(readRequired(formData, "track") || DEFAULT_JOB_TRACK);

  if (!id) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("applications").delete().eq("id", id);
  revalidateApplicationViews(id);
  redirect(track === DEFAULT_JOB_TRACK ? "/applications" : `/applications?track=${track}`);
}