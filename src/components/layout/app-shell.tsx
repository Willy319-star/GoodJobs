import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, LayoutDashboard, ListChecks, LogOut, Menu, Timeline } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { getCurrentUser, getNotificationReminders } from "@/lib/data/applications";
import { type JobTrack, withTrack } from "@/lib/job-track";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { GoodJobsLogoMark } from "@/components/brand/goodjobs-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RoutePrefetcher } from "@/components/layout/route-prefetcher";
import { TrackSwitcher } from "@/components/layout/track-switcher";
import { NotificationBell } from "@/components/layout/notification-bell";

const navItems = [
  { href: "/dashboard", label: "首页", icon: LayoutDashboard },
  { href: "/applications", label: "投递记录", icon: ListChecks },
  { href: "/timeline", label: "时间线", icon: Timeline },
  { href: "/calendar", label: "提醒", icon: CalendarDays },
];

export async function AppShell({ children, track }: { children: React.ReactNode; track: JobTrack }) {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  const email = user.email ?? "未登录";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.13),transparent_30%),linear-gradient(180deg,rgba(239,246,255,0.9)_0%,rgba(255,255,255,1)_260px)] text-foreground">
      <RoutePrefetcher track={track} />
      <header className="sticky top-0 z-10 border-b border-blue-100/80 bg-background/90 shadow-[0_1px_0_rgba(37,99,235,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={withTrack("/dashboard", track)} prefetch className="flex items-center gap-2.5 font-semibold">
            <GoodJobsLogoMark />
            <span className="text-lg tracking-tight text-slate-950">GoodJobs</span>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <TrackSwitcher track={track} />
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={withTrack(item.href, track)}
                    prefetch
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Icon data-icon="inline-start" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Suspense fallback={<Button variant="ghost" size="icon" aria-label="通知提醒" disabled />}>
              <HeaderNotificationBell track={track} />
            </Suspense>
            <span className="max-w-44 truncate text-sm text-muted-foreground">{email}</span>
            <form action={signOutAction}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut data-icon="inline-start" />
                退出
              </Button>
            </form>
          </div>
          <Sheet>
            <SheetTrigger render={<Button className="md:hidden" variant="ghost" size="icon" aria-label="打开导航" />}>
              <Menu />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>GoodJobs</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <TrackSwitcher track={track} />
              </div>
              <nav className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={withTrack(item.href, track)} prefetch className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700">
                      <Icon data-icon="inline-start" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 flex flex-col gap-3 border-t pt-4">
                <p className="truncate text-sm text-muted-foreground">{email}</p>
                <form action={signOutAction}>
                  <Button variant="outline" type="submit" className="w-full">
                    <LogOut data-icon="inline-start" />
                    退出登录
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
async function HeaderNotificationBell({ track }: { track: JobTrack }) {
  const notificationReminders = await getNotificationReminders(track);
  return <NotificationBell reminders={notificationReminders} track={track} />;
}
