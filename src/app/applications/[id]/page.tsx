import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, MessageSquareText } from "lucide-react";
import { deleteApplicationAction } from "@/lib/actions/applications";
import { StatusBadge } from "@/components/applications/status-badge";
import { PageHeading } from "@/components/layout/page-heading";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatFullDate, formatDateTime, getApplicationProgress } from "@/lib/application-utils";
import { getApplicationById, getInterviews, getTimelineEvents } from "@/lib/data/applications";
import { JOB_TRACK_LABELS, withTrack } from "@/lib/job-track";

function normalizeExternalUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  const track = application.track;
  const label = JOB_TRACK_LABELS[track];
  const [events, interviewRecords] = await Promise.all([
    getTimelineEvents(track, application.id),
    getInterviews(application.id),
  ]);

  return (
    <AppShell track={track}>
      <div className="flex flex-col gap-6">
        <Link href={withTrack("/applications", track)} className={buttonVariants({ variant: "ghost", className: "w-fit px-0" })}>
          <ArrowLeft data-icon="inline-start" />
          返回{label}投递记录
        </Link>

        <PageHeading
          title={`${application.companyName} / ${application.position}`}
          description="公司详情页承载岗位信息、流程时间线、面试问题和复盘记录。"
          action={<StatusBadge status={application.status} />}
        />

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>岗位信息</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{JOB_TRACK_LABELS[track]}</Badge>
                <Badge variant="secondary">{application.category}</Badge>
                <Badge variant="secondary">{application.source}</Badge>
                <Badge variant="outline">
                  <MapPin data-icon="inline-start" />
                  {application.city}
                </Badge>
              </div>
              <Separator />
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">投递时间</p>
                  <p className="mt-1 font-medium">{formatFullDate(application.applyDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">当前进度</p>
                  <p className="mt-1 font-medium text-primary">{getApplicationProgress(application.status)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">岗位链接</p>
                  {application.jobUrl ? (
                    <Link href={normalizeExternalUrl(application.jobUrl)} target="_blank" className={buttonVariants({ variant: "link", className: "h-auto p-0" })}>
                      打开岗位页面
                      <ExternalLink data-icon="inline-end" />
                    </Link>
                  ) : (
                    <p className="mt-1 text-muted-foreground">未填写</p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="grid gap-2 text-sm">
                <p className="font-medium">JD 描述</p>
                <p className="leading-6 text-muted-foreground">{application.description || "未填写 JD 描述。"}</p>
              </div>
              <div className="grid gap-2 text-sm">
                <p className="font-medium">备注</p>
                <p className="leading-6 text-muted-foreground">{application.notes || "暂无备注。"}</p>
              </div>
              <form action={deleteApplicationAction} className="border-t pt-4">
                <input type="hidden" name="id" value={application.id} />
                <input type="hidden" name="track" value={track} />
                <Button type="submit" variant="destructive">删除这条投递</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>招聘时间线</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {events.length > 0 ? events.map((event) => (
                <div key={event.id} className="grid grid-cols-[92px_1fr] gap-4">
                  <div className="text-sm text-muted-foreground">{formatFullDate(event.eventDate)}</div>
                  <div className="relative border-l pl-5">
                    <span className="absolute -left-1.5 top-1 size-3 rounded-full bg-primary" />
                    <p className="font-medium">{event.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">暂无时间线事件。新增投递或修改状态后会自动生成事件。</p>}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>面试记录</CardTitle>
            <Button variant="outline" size="sm" disabled>
              <MessageSquareText data-icon="inline-start" />
              后续新增复盘
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {interviewRecords.length > 0 ? (
              interviewRecords.map((interview) => (
                <div key={interview.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{interview.round}</p>
                      <p className="text-sm text-muted-foreground">
                        <CalendarDays data-icon="inline-start" />
                        {formatDateTime(interview.interviewDate)}
                      </p>
                    </div>
                    <Badge variant="outline">{interview.result || "未记录结果"}</Badge>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid gap-3 text-sm">
                    <div>
                      <p className="font-medium">问题</p>
                      <p className="mt-1 leading-6 text-muted-foreground">{interview.questions || "未记录"}</p>
                    </div>
                    <div>
                      <p className="font-medium">回答</p>
                      <p className="mt-1 leading-6 text-muted-foreground">{interview.answers || "未记录"}</p>
                    </div>
                    <div>
                      <p className="font-medium">复盘</p>
                      <p className="mt-1 leading-6 text-muted-foreground">{interview.notes || "未记录"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">还没有面试记录。面试记录会在后续模块继续扩展。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}