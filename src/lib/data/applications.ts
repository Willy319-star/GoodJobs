import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_JOB_TRACK, normalizeJobTrack, type JobTrack } from "@/lib/job-track";
import type { Database } from "@/types/database";
import type { Application, Interview, Reminder, TimelineEvent } from "@/types/application";
import type {
  ApplicationCategory,
  ApplicationCity,
  ApplicationSource,
  ApplicationStatus,
} from "@/lib/constants/applications";

type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
type TimelineEventRow = Database["public"]["Tables"]["timeline_events"]["Row"];
type InterviewRow = Database["public"]["Tables"]["interviews"]["Row"];
type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"];

type MaybeTracked<T extends { track: string }> = Omit<T, "track"> & { track?: string };
type MaybeReminderRow = Omit<ReminderRow, "track" | "read_at"> & { track?: string; read_at?: string | null };
type QueryError = { message?: string; code?: string } | null;

const applicationSelect = "id,user_id,company_name,position,category,city,source,status,track,apply_date,job_url,description,notes,created_at,updated_at";
const legacyApplicationSelect = "id,user_id,company_name,position,category,city,source,status,apply_date,job_url,description,notes,created_at,updated_at";
const timelineSelect = "id,user_id,application_id,event_type,event_date,title,track,description,created_at";
const legacyTimelineSelect = "id,user_id,application_id,event_type,event_date,title,description,created_at";
const reminderSelect = "id,user_id,application_id,title,remind_at,type,track,read_at,is_done,created_at,updated_at";
const legacyReminderSelect = "id,user_id,application_id,title,remind_at,type,is_done,created_at,updated_at";
const unreadReminderSelect = "id,user_id,application_id,title,remind_at,type,track,read_at,is_done,created_at,updated_at";
const trackedReminderWithoutReadSelect = "id,user_id,application_id,title,remind_at,type,track,is_done,created_at,updated_at";

function isMissingTrackColumn(error: QueryError) {
  return Boolean(error?.message?.includes("track") && error.message.includes("does not exist"));
}

function isMissingReadAtColumn(error: QueryError) {
  return Boolean(error?.message?.includes("read_at") && error.message.includes("does not exist"));
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      email: data.user.email ?? "",
    },
    { onConflict: "id" }
  );

  return data.user;
});

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user.id;
}

export function mapApplication(row: MaybeTracked<ApplicationRow>): Application {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    position: row.position,
    category: row.category as ApplicationCategory,
    city: row.city as ApplicationCity,
    source: row.source as ApplicationSource,
    status: (row.status === "收藏" ? "准备投递" : row.status) as ApplicationStatus,
    track: normalizeJobTrack(row.track),
    applyDate: row.apply_date,
    jobUrl: row.job_url ?? undefined,
    description: row.description ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTimelineEvent(row: MaybeTracked<TimelineEventRow>): TimelineEvent {
  return {
    id: row.id,
    userId: row.user_id,
    applicationId: row.application_id,
    eventType: row.event_type,
    eventDate: row.event_date,
    title: row.title,
    track: normalizeJobTrack(row.track),
    description: row.description ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapInterview(row: InterviewRow): Interview {
  return {
    id: row.id,
    userId: row.user_id,
    applicationId: row.application_id,
    round: row.round,
    interviewDate: row.interview_date,
    questions: row.questions ?? undefined,
    answers: row.answers ?? undefined,
    notes: row.notes ?? undefined,
    result: row.result ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapReminder(row: MaybeReminderRow): Reminder {
  return {
    id: row.id,
    userId: row.user_id,
    applicationId: row.application_id ?? undefined,
    title: row.title,
    remindAt: row.remind_at,
    type: row.type,
    track: normalizeJobTrack(row.track),
    readAt: row.read_at ?? undefined,
    isDone: row.is_done,
    createdAt: row.created_at,
  };
}

export async function getApplications(track: JobTrack = DEFAULT_JOB_TRACK) {
  await getCurrentUserId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(applicationSelect)
    .eq("track", track)
    .order("apply_date", { ascending: false });

  if (!error) {
    return (data ?? []).map(mapApplication);
  }

  if (!isMissingTrackColumn(error)) {
    throw new Error(error.message);
  }

  if (track !== DEFAULT_JOB_TRACK) {
    return [];
  }

  const legacy = await supabase
    .from("applications")
    .select(legacyApplicationSelect)
    .order("apply_date", { ascending: false });

  if (legacy.error) {
    throw new Error(legacy.error.message);
  }

  return (legacy.data ?? []).map(mapApplication);
}

export async function getApplicationById(id: string) {
  await getCurrentUserId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(applicationSelect)
    .eq("id", id)
    .single();

  if (!error && data) {
    return mapApplication(data);
  }

  if (!isMissingTrackColumn(error)) {
    return null;
  }

  const legacy = await supabase
    .from("applications")
    .select(legacyApplicationSelect)
    .eq("id", id)
    .single();

  if (legacy.error || !legacy.data) {
    return null;
  }

  return mapApplication(legacy.data);
}

export async function getTimelineEvents(track: JobTrack = DEFAULT_JOB_TRACK, applicationId?: string) {
  await getCurrentUserId();
  const supabase = await createClient();
  let query = supabase
    .from("timeline_events")
    .select(timelineSelect)
    .eq("track", track)
    .order("event_date", { ascending: false });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;

  if (!error) {
    return (data ?? []).map(mapTimelineEvent);
  }

  if (!isMissingTrackColumn(error)) {
    throw new Error(error.message);
  }

  if (track !== DEFAULT_JOB_TRACK) {
    return [];
  }

  let legacyQuery = supabase
    .from("timeline_events")
    .select(legacyTimelineSelect)
    .order("event_date", { ascending: false });

  if (applicationId) {
    legacyQuery = legacyQuery.eq("application_id", applicationId);
  }

  const legacy = await legacyQuery;

  if (legacy.error) {
    throw new Error(legacy.error.message);
  }

  return (legacy.data ?? []).map(mapTimelineEvent);
}

export async function getInterviews(applicationId: string) {
  await getCurrentUserId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .select("id,user_id,application_id,round,interview_date,questions,answers,notes,result,created_at,updated_at")
    .eq("application_id", applicationId)
    .order("interview_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapInterview);
}

export async function getUpcomingReminders(track: JobTrack = DEFAULT_JOB_TRACK) {
  await getCurrentUserId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reminders")
    .select(reminderSelect)
    .eq("track", track)
    .eq("is_done", false)
    .order("remind_at", { ascending: true })
    .limit(10);

  if (!error) {
    return (data ?? []).map(mapReminder);
  }

  if (isMissingReadAtColumn(error)) {
    const withoutReadState = await supabase
      .from("reminders")
      .select(trackedReminderWithoutReadSelect)
      .eq("track", track)
      .eq("is_done", false)
      .order("remind_at", { ascending: true })
      .limit(10);

    if (!withoutReadState.error) {
      return (withoutReadState.data ?? []).map(mapReminder);
    }

    if (!isMissingTrackColumn(withoutReadState.error)) {
      throw new Error(withoutReadState.error.message);
    }
  } else if (!isMissingTrackColumn(error)) {
    throw new Error(error.message);
  }

  if (track !== DEFAULT_JOB_TRACK) {
    return [];
  }

  const legacy = await supabase
    .from("reminders")
    .select(legacyReminderSelect)
    .eq("is_done", false)
    .order("remind_at", { ascending: true })
    .limit(10);

  if (legacy.error) {
    throw new Error(legacy.error.message);
  }

  return (legacy.data ?? []).map(mapReminder);
}

export async function getMonthReminders(track: JobTrack = DEFAULT_JOB_TRACK, anchorDate: Date = new Date()) {
  await getCurrentUserId();
  const supabase = await createClient();
  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1);

  const { data, error } = await supabase
    .from("reminders")
    .select(reminderSelect)
    .eq("track", track)
    .eq("is_done", false)
    .gte("remind_at", start.toISOString())
    .lt("remind_at", end.toISOString())
    .order("remind_at", { ascending: true });

  if (!error) {
    return (data ?? []).map(mapReminder);
  }

  if (isMissingReadAtColumn(error)) {
    const withoutReadState = await supabase
      .from("reminders")
      .select(trackedReminderWithoutReadSelect)
      .eq("track", track)
      .eq("is_done", false)
      .gte("remind_at", start.toISOString())
      .lt("remind_at", end.toISOString())
      .order("remind_at", { ascending: true });

    if (!withoutReadState.error) {
      return (withoutReadState.data ?? []).map(mapReminder);
    }

    if (!isMissingTrackColumn(withoutReadState.error)) {
      throw new Error(withoutReadState.error.message);
    }
  } else if (!isMissingTrackColumn(error)) {
    throw new Error(error.message);
  }

  if (track !== DEFAULT_JOB_TRACK) {
    return [];
  }

  const legacy = await supabase
    .from("reminders")
    .select(legacyReminderSelect)
    .eq("is_done", false)
    .gte("remind_at", start.toISOString())
    .lt("remind_at", end.toISOString())
    .order("remind_at", { ascending: true });

  if (legacy.error) {
    throw new Error(legacy.error.message);
  }

  return (legacy.data ?? []).map(mapReminder);
}
export async function getNotificationReminders(track: JobTrack = DEFAULT_JOB_TRACK) {
  await getCurrentUserId();
  const supabase = await createClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("reminders")
    .select(unreadReminderSelect)
    .eq("track", track)
    .eq("is_done", false)
    .is("read_at", null)
    .gte("remind_at", now.toISOString())
    .lte("remind_at", windowEnd.toISOString())
    .order("remind_at", { ascending: true })
    .limit(8);

  if (!error) {
    return (data ?? []).map(mapReminder);
  }

  if (isMissingReadAtColumn(error)) {
    const withoutReadState = await supabase
      .from("reminders")
      .select(trackedReminderWithoutReadSelect)
      .eq("track", track)
      .eq("is_done", false)
      .gte("remind_at", now.toISOString())
      .lte("remind_at", windowEnd.toISOString())
      .order("remind_at", { ascending: true })
      .limit(8);

    if (!withoutReadState.error) {
      return (withoutReadState.data ?? []).map(mapReminder);
    }

    if (!isMissingTrackColumn(withoutReadState.error)) {
      throw new Error(withoutReadState.error.message);
    }
  } else if (!isMissingTrackColumn(error)) {
    throw new Error(error.message);
  }

  if (track !== DEFAULT_JOB_TRACK) {
    return [];
  }

  const legacy = await supabase
    .from("reminders")
    .select(legacyReminderSelect)
    .eq("is_done", false)
    .gte("remind_at", now.toISOString())
    .lte("remind_at", windowEnd.toISOString())
    .order("remind_at", { ascending: true })
    .limit(8);

  if (legacy.error) {
    throw new Error(legacy.error.message);
  }

  return (legacy.data ?? []).map(mapReminder);
}
