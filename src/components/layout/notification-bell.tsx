"use client";

import { startTransition, useOptimistic } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock } from "lucide-react";
import {
  markReminderReadInlineAction,
  markRemindersReadInlineAction,
} from "@/lib/actions/reminders";
import { formatDateTime } from "@/lib/application-utils";
import { withTrack, type JobTrack } from "@/lib/job-track";
import type { Reminder } from "@/types/application";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OptimisticAction =
  | { type: "clear" }
  | { type: "remove"; id: string };

export function NotificationBell({ reminders, track }: { reminders: Reminder[]; track: JobTrack }) {
  const router = useRouter();
  const [optimisticReminders, updateOptimisticReminders] = useOptimistic(
    reminders,
    (currentReminders, action: OptimisticAction) => {
      if (action.type === "clear") {
        return [];
      }

      return currentReminders.filter((reminder) => reminder.id !== action.id);
    },
  );
  const count = optimisticReminders.length;

  function markOneRead(id: string) {
    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      updateOptimisticReminders({ type: "remove", id });
      await markReminderReadInlineAction(formData);
      router.refresh();
    });
  }

  function markAllRead() {
    const ids = optimisticReminders.map((reminder) => reminder.id);
    const formData = new FormData();

    for (const id of ids) {
      formData.append("id", id);
    }

    startTransition(async () => {
      updateOptimisticReminders({ type: "clear" });
      await markRemindersReadInlineAction(formData);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="通知提醒" className="relative" />}>
        <Bell />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">未来 24 小时</p>
          <div className="flex items-center gap-2">
            {count > 0 ? (
              <button type="button" onClick={markAllRead} className="relative z-10 cursor-pointer text-xs text-blue-600 hover:text-blue-700">
                标为已读
              </button>
            ) : null}
            <Link href={withTrack("/calendar", track)} prefetch className="text-xs text-muted-foreground hover:text-foreground">
              查看全部
            </Link>
          </div>
        </div>
        <DropdownMenuSeparator />
        {count > 0 ? (
          <div className="grid gap-1 py-1">
            {optimisticReminders.map((reminder) => (
              <button key={reminder.id} type="button" onClick={() => markOneRead(reminder.id)} className="flex w-full gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CalendarClock className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{reminder.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{formatDateTime(reminder.remindAt)} · {reminder.type}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            未来 24 小时暂无未读提醒。
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
