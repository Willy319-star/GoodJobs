"use client";

import { startTransition, useOptimistic } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, Check, Clock, Trash2 } from "lucide-react";
import {
  completeReminderInlineAction,
  deleteReminderInlineAction,
} from "@/lib/actions/reminders";
import { formatDateTime, formatFullDate } from "@/lib/application-utils";
import { withTrack, type JobTrack } from "@/lib/job-track";
import type { Application, Reminder } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

type OptimisticAction = {
  id: string;
};

export function ReminderTaskList({
  reminders,
  applications,
  track,
}: {
  reminders: Reminder[];
  applications: Application[];
  track: JobTrack;
}) {
  const router = useRouter();
  const [optimisticReminders, removeReminder] = useOptimistic(
    reminders,
    (currentReminders, action: OptimisticAction) =>
      currentReminders.filter((reminder) => reminder.id !== action.id),
  );

  function runReminderAction(id: string, action: (formData: FormData) => Promise<void>) {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("track", track);

    startTransition(async () => {
      removeReminder({ id });
      await action(formData);
      router.refresh();
    });
  }

  if (optimisticReminders.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无提醒。点击“新增提醒”记录测评、笔试、面试或投递截止日期。</p>;
  }

  return (
    <>
      {optimisticReminders.map((reminder) => {
        const application = applications.find((item) => item.id === reminder.applicationId);

        return (
          <div key={reminder.id} className="rounded-lg border p-4 transition-opacity">
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="标记完成"
                  onClick={() => runReminderAction(reminder.id, completeReminderInlineAction)}
                >
                  <Check />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="删除提醒"
                  onClick={() => runReminderAction(reminder.id, deleteReminderInlineAction)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
