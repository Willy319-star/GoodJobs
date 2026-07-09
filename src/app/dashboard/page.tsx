import Link from "next/link";
import { AlertCircle, Briefcase, CalendarClock, CheckCircle2, Clock3, Send, Trophy, XCircle } from "lucide-react";
import { ApplicationTrendCard } from "@/components/dashboard/application-trend-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeading } from "@/components/layout/page-heading";
import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, getActiveApplications } from "@/lib/application-utils";
import { getApplications, getTimelineEvents, getUpcomingReminders } from "@/lib/data/applications";
import { JOB_TRACK_LABELS, normalizeJobTrack, withTrack } from "@/lib/job-track";
import type { Application, Reminder, TimelineEvent } from "@/types/application";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function getPageTrack(searchParams?: PageProps["searchParams"]) {
  const params = await searchParams;
  const value = Array.isArray(params?.track) ? params?.track[0] : params?.track;
  return normalizeJobTrack(value);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function getDaysFromToday(value: string) {
  const today = startOfDay(new Date());
  return Math.floor((startOfDay(new Date(value)) - today) / 86_400_000);
}

function getActionItems({
  applications,
  reminders,
  timelineEvents,
}: {
  applications: Application[];
  reminders: Reminder[];
  timelineEvents: TimelineEvent[];
}) {
  const reminderActions = reminders
    .slice(0, 6)
    .map((reminder) => {
      const days = getDaysFromToday(reminder.remindAt);
      const urgency = days <= 0 ? "今天" : days === 1 ? "明天" : `${days} 天后`;
      return {
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        description: `${formatDateTime(reminder.remindAt)} · ${reminder.type}`,
        meta: urgency,
        href: "/calendar",
        tone: days <= 1 ? "high" : "normal",
      };
    });

  const eventApplicationIds = new Set(timelineEvents.slice(0, 12).map((event) => event.applicationId));
  const quietApplications = applications
    .filter((application) => !["Offer", "拒绝"].includes(application.status))
    .filter((application) => !eventApplicationIds.has(application.id))
    .slice(0, 3)
    .map((application) => ({
      id: `quiet-${application.id}`,
      title: `${application.companyName} · ${application.position}`,
      description: `当前状态：${application.status}，可以去时间线补充最近进展。`,
      meta: "待更新",
      href: `/applications/${application.id}`,
      tone: "normal",
    }));

  return [...reminderActions, ...quietApplications].slice(0, 5);
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const track = await getPageTrack(searchParams);
  const label = JOB_TRACK_LABELS[track];
  const [applications, reminders, timelineEvents] = await Promise.all([
    getApplications(track),
    getUpcomingReminders(track),
    getTimelineEvents(track),
  ]);

  const activeApplications = getActiveApplications(applications);
  const offers = applications.filter((application) => application.status === "Offer").length;
  const rejected = applications.filter((application) => application.status === "拒绝").length;
  const actionItems = getActionItems({ applications, reminders, timelineEvents });

  return (
    <AppShell track={track}>
      <div className="flex flex-col gap-8">
        <PageHeading
          title={`${label}进度概览`}
          description={`用四个核心指标快速了解${label}整体进展，具体测评、笔试和面试流程在时间线里推进。`}
          action={<Link href={withTrack("/applications", track)} prefetch className={buttonVariants()}>管理投递</Link>}
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="已投递" value={applications.length} helper="家公司" icon={Send} />
          <MetricCard title="进行中" value={activeApplications.length} helper="家公司" icon={Briefcase} />
          <MetricCard title="Offer" value={offers} helper="家公司" icon={Trophy} />
          <MetricCard title="拒绝" value={rejected} helper="家公司" icon={XCircle} />
        </section>

        <ApplicationTrendCard applyDates={applications.map((application) => application.applyDate)} />

        <Card className="border-blue-100 bg-blue-50/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>今日行动台</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">先处理临近提醒，再补齐长时间没更新的投递进展。</p>
            </div>
            <Badge variant="secondary" className="bg-white text-blue-700">
              {actionItems.length} 项
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {actionItems.length > 0 ? actionItems.map((item) => (
              <Link
                key={item.id}
                href={withTrack(item.href, track)}
                prefetch
                className="flex gap-3 rounded-lg border border-blue-100 bg-background p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/70"
              >
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  {item.tone === "high" ? <AlertCircle className="size-4" /> : <Clock3 className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">{item.title}</span>
                    <Badge variant={item.tone === "high" ? "destructive" : "secondary"}>{item.meta}</Badge>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
                </span>
              </Link>
            )) : (
              <div className="rounded-lg border border-blue-100 bg-background p-4 text-sm text-muted-foreground lg:col-span-2">
                今天没有必须处理的事项。可以去投递记录新增目标公司，或在时间线补充最近进展。
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>未来任务</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {reminders.length > 0 ? reminders.slice(0, 5).map((reminder) => (
              <div key={reminder.id} className="flex gap-3 rounded-md border p-4">
                <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <CalendarClock data-icon="inline-start" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{reminder.title}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(reminder.remindAt)}</p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">暂无提醒。你可以在日历提醒里新增测评、笔试、面试、复盘或截止日期。</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近动态</CardTitle>
            <Link href={withTrack("/timeline", track)} prefetch className={buttonVariants({ variant: "outline", size: "sm" })}>查看时间线</Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {timelineEvents.length > 0 ? timelineEvents.slice(0, 4).map((event, index) => {
              const application = applications.find((item) => item.id === event.applicationId);
              return (
                <div key={event.id}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{application?.companyName ?? "投递记录"} / {event.title}</p>
                      <p className="text-sm text-muted-foreground">{application?.position ?? event.eventType} / {event.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 data-icon="inline-start" />
                      {event.eventDate}
                    </div>
                  </div>
                  {index < Math.min(timelineEvents.length, 4) - 1 ? <Separator className="mt-4" /> : null}
                </div>
              );
            }) : <p className="text-sm text-muted-foreground">新增投递或在时间线修改状态后，这里会出现最近动态。</p>}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
