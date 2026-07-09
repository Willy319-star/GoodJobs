import Link from "next/link";
import { Bell, CalendarClock } from "lucide-react";
import { markReminderReadAction, markRemindersReadAction } from "@/lib/actions/reminders";
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

export function NotificationBell({ reminders, track }: { reminders: Reminder[]; track: JobTrack }) {
  const count = reminders.length;

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
              <form action={markRemindersReadAction}>
                <input type="hidden" name="track" value={track} />
                {reminders.map((reminder) => (
                  <input key={reminder.id} type="hidden" name="id" value={reminder.id} />
                ))}
                <button type="submit" className="relative z-10 cursor-pointer text-xs text-blue-600 hover:text-blue-700">
                  标为已读
                </button>
              </form>
            ) : null}
            <Link href={withTrack("/calendar", track)} prefetch className="text-xs text-muted-foreground hover:text-foreground">
              查看全部
            </Link>
          </div>
        </div>
        <DropdownMenuSeparator />
        {count > 0 ? (
          <div className="grid gap-1 py-1">
            {reminders.map((reminder) => (
              <form key={reminder.id} action={markReminderReadAction}>
                <input type="hidden" name="id" value={reminder.id} />
                <input type="hidden" name="track" value={track} />
                <button type="submit" className="flex w-full gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <CalendarClock className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{reminder.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{formatDateTime(reminder.remindAt)} · {reminder.type}</span>
                  </span>
                </button>
              </form>
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
