import { ListTodo } from "lucide-react";
import { ReminderForm } from "@/components/calendar/reminder-form";
import { ReminderMonthCalendar } from "@/components/calendar/reminder-month-calendar";
import { ReminderTaskList } from "@/components/calendar/reminder-task-list";
import { PageHeading } from "@/components/layout/page-heading";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getApplications, getMonthReminders, getUpcomingReminders } from "@/lib/data/applications";
import { JOB_TRACK_LABELS, normalizeJobTrack } from "@/lib/job-track";

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
              <ReminderTaskList reminders={reminders} applications={applications} track={track} />
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
