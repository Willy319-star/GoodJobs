import Link from "next/link";
import { CalendarCheck, Check, Clock, ListTodo, Trash2 } from "lucide-react";
import { completeReminderAction, deleteReminderAction } from "@/lib/actions/reminders";
import { ReminderForm } from "@/components/calendar/reminder-form";
import { ReminderMonthCalendar } from "@/components/calendar/reminder-month-calendar";
import { PageHeading } from "@/components/layout/page-heading";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getApplications, getMonthReminders, getUpcomingReminders } from "@/lib/data/applications";
import { formatDateTime, formatFullDate } from "@/lib/application-utils";
import { JOB_TRACK_LABELS, normalizeJobTrack, withTrack } from "@/lib/job-track";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function getPageTrack(searchParams?: PageProps["searchParams"]) {
  const params = await searchParams;
  const value = Array.isArray(params?.track) ? params?.track[0] : params?.track;
  return normalizeJobTrack(value);
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const track = await getPageTrack(searchParams);
  const label = JOB_TRACK_LABELS[track];
  const selectedDate = new Date();
  const [applications, reminders, monthReminders] = await Promise.all([
    getApplications(track),
    getUpcomingReminders(track),
    getMonthReminders(track, selectedDate),
  ]);

  return (
    <AppShell track={track}>
      <div className="flex flex-col gap-6">
        <PageHeading title={`${label}提醒`} description={`集中查看${label}未来测评、笔试、面试、复盘和截止日期。`} />

        <section className="grid gap-4 xl:grid-cols-2">
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle>日历</CardTitle>
            </CardHeader>
            <CardContent>
              <ReminderMonthCalendar reminders={monthReminders} selectedDate={selectedDate} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>未来任务</CardTitle>
              <Dialog>
                <DialogTrigger render={<Button variant="outline" size="sm" />}>
                  <ListTodo data-icon="inline-start" />
                  新增提醒
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>新增提醒</DialogTitle>
                    <DialogDescription>记录测评、笔试、面试、复盘、投递截止等重要时间点。</DialogDescription>
                  </DialogHeader>
                  <ReminderForm applications={applications} track={track} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {reminders.length > 0 ? reminders.map((reminder) => {
                const application = applications.find((item) => item.id === reminder.applicationId);
                return (
                  <div key={reminder.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <CalendarCheck data-icon="inline-start" />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{reminder.title}</p>
                            <Badge variant="secondary">{reminder.type}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <Clock data-icon="inline-start" />
                            {formatDateTime(reminder.remindAt)}
                          </p>
                          {application ? (
                            <Link href={withTrack(`/applications/${application.id}`, track)} prefetch className={buttonVariants({ variant: "link", className: "mt-2 h-auto p-0" })}>
                              {application.companyName} / {application.position}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="hidden text-sm text-muted-foreground md:block">{formatFullDate(reminder.remindAt)}</p>
                        <form action={completeReminderAction}>
                          <input type="hidden" name="id" value={reminder.id} />
                          <input type="hidden" name="track" value={track} />
                          <Button type="submit" variant="outline" size="icon-sm" aria-label="标记完成">
                            <Check />
                          </Button>
                        </form>
                        <form action={deleteReminderAction}>
                          <input type="hidden" name="id" value={reminder.id} />
                          <input type="hidden" name="track" value={track} />
                          <Button type="submit" variant="ghost" size="icon-sm" aria-label="删除提醒">
                            <Trash2 />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground">暂无提醒。点击“新增提醒”记录测评、笔试、面试或投递截止日期。</p>}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
